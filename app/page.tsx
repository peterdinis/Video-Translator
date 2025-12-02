"use client";

import { useState } from "react";
import { VideoUpload } from "@/components/video-upload";
import { LanguageSelector } from "@/components/language-selector";
import { TranslationResult } from "@/components/translation-result";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Home() {
	const [file, setFile] = useState<File | null>(null);
	const [videoUrl, setVideoUrl] = useState("");
	const [targetLang, setTargetLang] = useState("");
	const [status, setStatus] = useState<
		"idle" | "uploading" | "processing" | "completed" | "error"
	>("idle");
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<string | undefined>(undefined);
	const [videoResult, setVideoResult] = useState<string | undefined>(undefined);

	const handleTranslate = async () => {
		if ((!file && !videoUrl) || !targetLang) return;

		setStatus("uploading");
		setProgress(0);

		const formData = new FormData();
		if (file) {
			formData.append("file", file);
		} else if (videoUrl) {
			formData.append("videoUrl", videoUrl);
		}
		formData.append("targetLanguage", targetLang);

		try {
			const response = await fetch("/api/translate", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Translation failed");
			}

			const data = await response.json();
			setResult(data.result);
			setVideoResult(data.videoUrl);
			setStatus("completed");
		} catch (error) {
			console.error(error);
			setStatus("error");
		} finally {
			setProgress(100);
		}
	};

	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
			<div className="container mx-auto px-4 py-16">
				<div className="text-center mb-12 space-y-4">
					<div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary mb-4">
						<Sparkles className="w-5 h-5 mr-2" />
						<span className="text-sm font-medium">
							AI-Powered Video Translation
						</span>
					</div>
					<h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
						Translate Your Videos
						<br />
						<span className="text-foreground">In Seconds</span>
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Upload your video, choose a language, and let Gemini AI handle the
						rest. Get accurate subtitles and translations instantly.
					</p>
				</div>

				<div className="max-w-4xl mx-auto space-y-8">
					<div className="grid md:grid-cols-2 gap-8">
						<div className="space-y-6">
							<div className="space-y-2">
								<h2 className="text-xl font-semibold">1. Upload Video</h2>
								<p className="text-sm text-muted-foreground">
									Select the video you want to translate.
								</p>
							</div>
							<VideoUpload
								onFileSelect={(f) => {
									setFile(f);
									setVideoUrl(""); // Clear URL if file selected
									setResult(undefined);
									setVideoResult(undefined);
									setStatus("idle");
								}}
								onUrlChange={(url) => {
									setVideoUrl(url);
									setFile(null); // Clear file if URL entered
									setResult(undefined);
									setVideoResult(undefined);
									setStatus("idle");
								}}
							/>
						</div>

						<div className="space-y-6">
							<div className="space-y-2">
								<h2 className="text-xl font-semibold">2. Select Language</h2>
								<p className="text-sm text-muted-foreground">
									Choose your target language.
								</p>
							</div>
							<div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
								<LanguageSelector
									label="Target Language"
									value={targetLang}
									onChange={setTargetLang}
									placeholder="Select target language"
								/>

								<div className="mt-8">
									<Button
										className="w-full"
										size="lg"
										disabled={
											(!file && !videoUrl) ||
											!targetLang ||
											status === "uploading" ||
											status === "processing"
										}
										onClick={handleTranslate}
									>
										{status === "processing" ? (
											<>Processing...</>
										) : (
											<>
												<Sparkles className="w-4 h-4 mr-2" />
												Start Translation
											</>
										)}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<TranslationResult
						status={status}
						progress={progress}
						result={result}
						videoResult={videoResult}
						onReset={() => {
							setStatus("idle");
							setFile(null);
							setTargetLang("");
							setResult(undefined);
							setVideoResult(undefined);
						}}
					/>
				</div>
			</div>
		</main>
	);
}
