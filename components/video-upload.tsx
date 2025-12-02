"use client";

import { useState, useCallback } from "react";
import { Upload, Link, FileVideo, X, Youtube } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
	onFileSelect: (file: File | null) => void;
	onUrlChange?: (url: string) => void;
}

export function VideoUpload({ onFileSelect, onUrlChange }: VideoUploadProps) {
	const [file, setFile] = useState<File | null>(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [dragActive, setDragActive] = useState(false);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				const selectedFile = acceptedFiles[0];
				setFile(selectedFile);
				onFileSelect(selectedFile);
				setVideoUrl(""); // Clear URL when file is selected
			}
		},
		[onFileSelect],
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"video/*": [".mp4", ".webm", ".avi", ".mov", ".mkv"],
		},
		maxFiles: 1,
		maxSize: 100 * 1024 * 1024, // 100MB
	});

	const removeFile = () => {
		setFile(null);
		onFileSelect(null);
	};

	const handleUrlChange = (url: string) => {
		setVideoUrl(url);
		onUrlChange?.(url);
		if (url) {
			setFile(null); // Clear file when URL is entered
		}
	};

	const isYoutubeUrl = (url: string) => {
		return url.includes("youtube.com") || url.includes("youtu.be");
	};

	return (
		<div className="w-full">
			<Tabs defaultValue="upload" className="w-full">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="upload" className="flex items-center gap-2">
						<Upload className="w-4 h-4" />
						Upload File
					</TabsTrigger>
					<TabsTrigger value="url" className="flex items-center gap-2">
						<Link className="w-4 h-4" />
						URL / YouTube
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upload" className="mt-4">
					{!file ? (
						<Card
							{...getRootProps()}
							className={cn(
								"border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-primary/50 hover:bg-accent/5",
								isDragActive && "border-primary bg-accent/10",
								"p-8",
							)}
						>
							<input {...getInputProps()} />
							<div className="flex flex-col items-center justify-center gap-4 text-center">
								<div
									className={cn(
										"rounded-full p-4 transition-colors",
										isDragActive ? "bg-primary/20" : "bg-muted",
									)}
								>
									<FileVideo
										className={cn(
											"w-8 h-8 transition-colors",
											isDragActive ? "text-primary" : "text-muted-foreground",
										)}
									/>
								</div>
								<div className="space-y-2">
									<p className="text-sm font-medium">
										{isDragActive
											? "Drop your video here"
											: "Drag & drop your video here"}
									</p>
									<p className="text-xs text-muted-foreground">
										or click to browse
									</p>
								</div>
								<div className="text-xs text-muted-foreground space-y-1">
									<p>Supported formats: MP4, WebM, AVI, MOV, MKV</p>
									<p>Maximum size: 100MB</p>
								</div>
							</div>
						</Card>
					) : (
						<Card className="p-6">
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-primary/10 p-3">
										<FileVideo className="w-6 h-6 text-primary" />
									</div>
									<div>
										<p className="font-medium text-sm">{file.name}</p>
										<p className="text-xs text-muted-foreground">
											{(file.size / (1024 * 1024)).toFixed(2)} MB
										</p>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-destructive"
									onClick={(e) => {
										e.stopPropagation();
										removeFile();
									}}
								>
									<X className="w-5 h-5" />
								</Button>
							</div>
							<div className="rounded-lg overflow-hidden bg-black/5 aspect-video">
								<video
									src={URL.createObjectURL(file)}
									controls
									className="w-full h-full object-contain"
								/>
							</div>
						</Card>
					)}
				</TabsContent>

				<TabsContent value="url" className="mt-4">
					<Card className="p-6 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="video-url">Video URL</Label>
							<div className="flex gap-2">
								<div className="relative flex-1">
									{isYoutubeUrl(videoUrl) && (
										<Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
									)}
									<Input
										id="video-url"
										placeholder="https://example.com/video.mp4 or YouTube URL"
										value={videoUrl}
										onChange={(e) => handleUrlChange(e.target.value)}
										className={cn(isYoutubeUrl(videoUrl) && "pl-10")}
									/>
								</div>
							</div>
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground">
									Supported sources:
								</p>
								<ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
									<li>Direct video URLs (MP4, WebM, etc.)</li>
									<li>YouTube videos</li>
								</ul>
							</div>
							{videoUrl && isYoutubeUrl(videoUrl) && (
								<div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
									<div className="flex items-start gap-2">
										<Youtube className="w-4 h-4 text-red-500 mt-0.5" />
										<div className="text-xs">
											<p className="font-medium text-red-900 dark:text-red-100">
												YouTube URL detected
											</p>
											<p className="text-red-700 dark:text-red-300">
												Video will be downloaded and processed
											</p>
										</div>
									</div>
								</div>
							)}
							{videoUrl && !isYoutubeUrl(videoUrl) && (
								<div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
									<div className="flex items-start gap-2">
										<Link className="w-4 h-4 text-blue-500 mt-0.5" />
										<div className="text-xs">
											<p className="font-medium text-blue-900 dark:text-blue-100">
												Direct URL detected
											</p>
											<p className="text-blue-700 dark:text-blue-300">
												Video will be fetched from the provided URL
											</p>
										</div>
									</div>
								</div>
							)}
						</div>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
