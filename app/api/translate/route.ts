import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import ytdl from "@distube/ytdl-core";
import { generateAudio } from "@/lib/tts";
import { replaceAudio } from "@/lib/video-processing";
import {
	getCachedTranslation,
	setCachedTranslation,
	generateCacheKey,
} from "@/lib/cache";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY || "");

// Configuration constants
const CONFIG = {
	MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
	PROCESSING_TIMEOUT: 120000, // 2 minutes
	POLL_INTERVAL: 2000, // 2 seconds
	MAX_POLL_ATTEMPTS: 60,
	SUPPORTED_VIDEO_TYPES: [
		"video/mp4",
		"video/webm",
		"video/avi",
		"video/mov",
		"video/quicktime",
	],
	DEFAULT_MODEL: "gemini-2.5-flash",
	FALLBACK_MODELS: ["gemini-2.0-flash"],
};

// Custom error classes
class VideoProcessingError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
	) {
		super(message);
		this.name = "VideoProcessingError";
	}
}

class FileUploadError extends Error {
	constructor(
		message: string,
		public statusCode: number = 400,
	) {
		super(message);
		this.name = "FileUploadError";
	}
}

// Helper function to clean up temp files
async function cleanupTempFile(filePath: string): Promise<void> {
	if (filePath) {
		try {
			await unlink(filePath);
			console.log(`Cleaned up temp file: ${filePath}`);
		} catch (error) {
			console.warn(`Failed to cleanup temp file: ${filePath}`, error);
		}
	}
}

// Helper function to validate video file
function validateVideoFile(mimeType: string, fileSize?: number): void {
	if (!CONFIG.SUPPORTED_VIDEO_TYPES.includes(mimeType)) {
		throw new FileUploadError(
			`Unsupported video type: ${mimeType}. Supported types: ${CONFIG.SUPPORTED_VIDEO_TYPES.join(", ")}`,
		);
	}

	if (fileSize && fileSize > CONFIG.MAX_FILE_SIZE) {
		throw new FileUploadError(
			`File size exceeds maximum allowed size of ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
		);
	}
}

// Helper function to download YouTube video
async function downloadYoutubeVideo(
	videoUrl: string,
): Promise<{ path: string; mimeType: string; displayName: string }> {
	try {
		const info = await ytdl.getInfo(videoUrl);
		const format = ytdl.chooseFormat(info.formats, { quality: "18" });
		const fileName = `youtube-${Date.now()}.mp4`;
		const tempFilePath = join(tmpdir(), fileName);

		await new Promise<void>((resolve, reject) => {
			const writeStream = fs.createWriteStream(tempFilePath);
			const downloadStream = ytdl(videoUrl, { format: format });

			downloadStream
				.pipe(writeStream)
				.on("finish", resolve)
				.on("error", reject);

			downloadStream.on("error", reject);
		});

		return {
			path: tempFilePath,
			mimeType: "video/mp4",
			displayName: info.videoDetails.title || "YouTube Video",
		};
	} catch (error) {
		throw new FileUploadError(
			`Failed to download YouTube video: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

// Helper function to download video from direct URL
async function downloadDirectVideo(
	videoUrl: string,
): Promise<{ path: string; mimeType: string; displayName: string }> {
	try {
		const response = await fetch(videoUrl);

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const blob = await response.blob();
		const buffer = Buffer.from(await blob.arrayBuffer());
		const fileName = videoUrl.split("/").pop()?.split("?")[0] || "video.mp4";
		const tempFilePath = join(tmpdir(), `url-${Date.now()}-${fileName}`);

		await writeFile(tempFilePath, buffer);

		const mimeType = blob.type || "video/mp4";
		validateVideoFile(mimeType, buffer.length);

		return {
			path: tempFilePath,
			mimeType: mimeType,
			displayName: fileName,
		};
	} catch (error) {
		throw new FileUploadError(
			`Failed to fetch video from URL: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

// Helper function to wait for file processing
async function waitForFileProcessing(fileName: string): Promise<void> {
	let attempts = 0;

	while (attempts < CONFIG.MAX_POLL_ATTEMPTS) {
		const fileRecord = await fileManager.getFile(fileName);

		console.log(
			`Processing attempt ${attempts + 1}/${CONFIG.MAX_POLL_ATTEMPTS}, state: ${fileRecord.state}`,
		);

		if (fileRecord.state === "ACTIVE") {
			console.log("File processing completed successfully");
			return;
		}

		if (fileRecord.state === "FAILED") {
			throw new VideoProcessingError(
				"Video processing failed on Gemini servers",
			);
		}

		await new Promise((resolve) => setTimeout(resolve, CONFIG.POLL_INTERVAL));
		attempts++;
	}

	throw new VideoProcessingError(
		"Video processing timeout - file took too long to process",
	);
}

// Helper function to generate translation with retry logic
async function generateTranslation(
	fileUri: string,
	mimeType: string,
	targetLanguage: string,
	modelName: string = CONFIG.DEFAULT_MODEL,
): Promise<string> {
	const model = genAI.getGenerativeModel({ model: modelName });

	const prompt = `Translate the spoken content of this video to ${targetLanguage}.

Requirements:
- Provide timestamps for each segment of dialogue
- Format: [MM:SS] Translated text
- Include ALL spoken dialogue and narration
- Maintain the original meaning and context
- Use natural, fluent language in ${targetLanguage}

Please be thorough and accurate in your translation.`;

	console.log(`Generating translation with model: ${modelName}`);

	try {
		const result = await model.generateContent([
			{
				fileData: {
					mimeType: mimeType,
					fileUri: fileUri,
				},
			},
			{ text: prompt },
		]);

		const response = await result.response;
		const text = response.text();

		if (!text || text.trim().length === 0) {
			throw new Error("Empty response from model");
		}

		return text;
	} catch (error) {
		console.error(`Translation failed with model ${modelName}:`, error);
		throw new VideoProcessingError(
			`Failed to generate translation: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

export async function POST(req: NextRequest) {
	let tempFilePath = "";
	let uploadedFileName = "";

	try {
		// Validate API key
		if (!process.env.GEMINI_API_KEY) {
			throw new VideoProcessingError("Gemini API key not configured", 500);
		}

		// Parse form data
		const formData = await req.formData();
		const file = formData.get("file") as File | null;
		const videoUrl = formData.get("videoUrl") as string | null;
		const targetLanguage = formData.get("targetLanguage") as string;

		// Validate input
		if (!targetLanguage || targetLanguage.trim().length === 0) {
			throw new FileUploadError("Target language is required");
		}

		if (!file && !videoUrl) {
			throw new FileUploadError("Either a file or video URL must be provided");
		}

		let mimeType = "";
		let displayName = "";
		let cacheKey = "";

		// Process file upload
		if (file) {
			console.log(
				`Processing uploaded file: ${file.name}, size: ${file.size} bytes`,
			);

			validateVideoFile(file.type, file.size);

			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			tempFilePath = join(tmpdir(), `upload-${Date.now()}-${file.name}`);
			await writeFile(tempFilePath, buffer);

			mimeType = file.type;
			displayName = file.name;
			cacheKey = generateCacheKey(`${file.name}-${file.size}`, targetLanguage);
		}
		// Process video URL
		else if (videoUrl) {
			console.log(`Processing video URL: ${videoUrl}`);
			cacheKey = generateCacheKey(videoUrl, targetLanguage);

			const isYoutube = ytdl.validateURL(videoUrl);

			if (isYoutube) {
				const result = await downloadYoutubeVideo(videoUrl);
				tempFilePath = result.path;
				mimeType = result.mimeType;
				displayName = result.displayName;
			} else {
				const result = await downloadDirectVideo(videoUrl);
				tempFilePath = result.path;
				mimeType = result.mimeType;
				displayName = result.displayName;
			}
		}

		// Check cache
		const cachedResult = await getCachedTranslation(cacheKey);
		if (cachedResult) {
			console.log("Returning cached result for:", cacheKey);
			// If we have a cached file path, we might need to read it again or if it's base64 we just return it
			// The cache stores the base64 video URL directly

			// Clean up temp file if it was created during download/upload processing before cache check
			// Actually, we created tempFilePath above. We should clean it up if we hit cache.
			if (tempFilePath) {
				await cleanupTempFile(tempFilePath);
			}

			return NextResponse.json({
				success: true,
				result: cachedResult.translation,
				videoUrl: cachedResult.videoUrl,
				fileName: displayName,
				targetLanguage: targetLanguage,
				cached: true,
			});
		}

		// Upload to Gemini
		console.log(`Uploading file to Gemini: ${displayName}`);
		const uploadResult = await fileManager.uploadFile(tempFilePath, {
			mimeType: mimeType,
			displayName: displayName,
		});

		uploadedFileName = uploadResult.file.name;
		console.log(`File uploaded successfully: ${uploadedFileName}`);

		// Wait for processing
		await waitForFileProcessing(uploadedFileName);

		// Generate translation
		const translationText = await generateTranslation(
			uploadResult.file.uri,
			uploadResult.file.mimeType,
			targetLanguage,
		);

		// ... (previous imports)

		// ... (inside POST function, after translation)

		console.log("Translation completed successfully");

		// Generate Dubbed Audio
		console.log("Generating TTS audio...");
		const audioPath = await generateAudio(translationText, targetLanguage);

		// Merge Audio and Video
		console.log("Merging audio and video...");
		const dubbedVideoPath = await replaceAudio(tempFilePath, audioPath);

		// Read the dubbed video file
		const dubbedVideoBuffer = await readFile(dubbedVideoPath);

		// Convert to base64 to send back to client (simple solution for now)
		// Ideally, we should upload to cloud storage or serve via a static route
		const base64Video = dubbedVideoBuffer.toString("base64");
		const videoDataUrl = `data:video/mp4;base64,${base64Video}`;

		// Cleanup
		await cleanupTempFile(tempFilePath);
		await cleanupTempFile(audioPath);
		await cleanupTempFile(dubbedVideoPath);

		// Delete file from Gemini to save storage
		try {
			await fileManager.deleteFile(uploadedFileName);
			console.log("File deleted from Gemini storage");
		} catch (deleteError) {
			console.warn("Could not delete file from Gemini:", deleteError);
		}

		// Store in cache
		setCachedTranslation(cacheKey, {
			translation: translationText,
			videoUrl: videoDataUrl,
			timestamp: Date.now(),
		});

		return NextResponse.json({
			success: true,
			result: translationText,
			videoUrl: videoDataUrl, // Return the dubbed video
			fileName: displayName,
			targetLanguage: targetLanguage,
		});
	} catch (error) {
		console.error("Error processing video translation:", error);

		// Cleanup on error
		await cleanupTempFile(tempFilePath);

		if (uploadedFileName) {
			try {
				await fileManager.deleteFile(uploadedFileName);
			} catch (deleteError) {
				console.warn("Could not delete uploaded file on error:", deleteError);
			}
		}

		// Handle different error types
		if (error instanceof FileUploadError) {
			return NextResponse.json(
				{
					success: false,
					error: error.message,
					errorType: "FILE_UPLOAD_ERROR",
				},
				{ status: error.statusCode },
			);
		}

		if (error instanceof VideoProcessingError) {
			return NextResponse.json(
				{
					success: false,
					error: error.message,
					errorType: "VIDEO_PROCESSING_ERROR",
				},
				{ status: error.statusCode },
			);
		}

		// Generic error
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				details: error instanceof Error ? error.message : "Unknown error",
				errorType: "INTERNAL_ERROR",
			},
			{ status: 500 },
		);
	}
}

// Health check and info endpoint
export async function GET() {
	try {
		return NextResponse.json({
			status: "operational",
			message: "Gemini Video Translation API",
			models: {
				default: CONFIG.DEFAULT_MODEL,
				fallback: CONFIG.FALLBACK_MODELS,
			},
			limits: {
				maxFileSize: `${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
				supportedFormats: CONFIG.SUPPORTED_VIDEO_TYPES,
				processingTimeout: `${CONFIG.PROCESSING_TIMEOUT / 1000}s`,
			},
			features: [
				"YouTube video support",
				"Direct URL video support",
				"File upload support",
				"Automatic timestamping",
				"Multi-language translation",
			],
		});
	} catch (error) {
		return NextResponse.json(
			{
				status: "error",
				error: "Health check failed",
			},
			{ status: 500 },
		);
	}
}
