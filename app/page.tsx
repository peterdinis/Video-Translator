"use client";

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const VideoUpload = lazy(() => import("@/components/video-upload").then(m => ({ default: m.VideoUpload })));
const LanguageSelector = lazy(() => import("@/components/language-selector").then(m => ({ default: m.LanguageSelector })));
const TranslationResult = lazy(() => import("@/components/translation-result").then(m => ({ default: m.TranslationResult })));

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [targetLang, setTargetLang] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "completed" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const resultRef = useRef<string | undefined>(undefined);
  const videoResultRef = useRef<string | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const validateFile = useCallback((f: File): boolean => {
    if (f.size > MAX_FILE_SIZE) {
      toast.error("File too large (max 100MB)");
      return false;
    }
    if (!SUPPORTED_VIDEO_TYPES.has(f.type)) {
      toast.error("Use MP4, WebM or MOV");
      return false;
    }
    return true;
  }, []);

  const handleFileSelect = useCallback((f: File | null) => {
    if (!f || !validateFile(f)) return;
    setFile(f);
    setVideoUrl("");
    setStatus("idle");
    setErrorMessage("");
    resultRef.current = undefined;
    videoResultRef.current = undefined;
  }, [validateFile]);

  const handleUrlChange = useCallback((url: string) => {
    setVideoUrl(url);
    setFile(null);
    setStatus("idle");
    setErrorMessage("");
    resultRef.current = undefined;
    videoResultRef.current = undefined;
  }, []);

  const handleLanguageChange = useCallback((lang: string) => {
    setTargetLang(lang);
    status === "error" && setErrorMessage("");
  }, [status]);

  const simulateProgress = useCallback(() => {
    progressIntervalRef.current && clearInterval(progressIntervalRef.current);
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) {
          progressIntervalRef.current && clearInterval(progressIntervalRef.current);
          return prev;
        }
        return prev + Math.random() * 10;
      });
    }, 250);
  }, []);

  const resetProgress = useCallback(() => {
    progressIntervalRef.current && clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = null;
    setProgress(0);
  }, []);

  const handleTranslate = useCallback(async () => {
    if ((!file && !videoUrl) || !targetLang) {
      toast.error("Provide video and select language");
      return;
    }

    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setStatus("uploading");
    resetProgress();
    setErrorMessage("");
    resultRef.current = undefined;
    videoResultRef.current = undefined;

    simulateProgress();

    try {
      const formData = new FormData();
      file && formData.append("file", file);
      videoUrl && (() => {
        try { new URL(videoUrl); } catch { throw new Error("Invalid URL"); }
        formData.append("videoUrl", videoUrl);
      })();
      formData.append("targetLanguage", targetLang);

      const timeoutId = setTimeout(() => {
        abortController.abort();
        throw new Error("Request timeout");
      }, 25000);

      const response = await fetch("/api/translate", {
        method: "POST",
        body: formData,
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);
      progressIntervalRef.current && clearInterval(progressIntervalRef.current);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed (${response.status})`);
      }

      const data = await response.json();
      resultRef.current = data.result;
      videoResultRef.current = data.videoUrl;
      setStatus("completed");
      toast.success("Translation completed!");
      
    } catch (error: any) {
      progressIntervalRef.current && clearInterval(progressIntervalRef.current);
      
      if (error.name === "AbortError") {
        setStatus("idle");
        toast.info("Translation cancelled.");
      } else {
        const message = error.message || "An unexpected error occurred";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
      }
      
      console.error("Translation error:", error);
    } finally {
      abortControllerRef.current = null;
    }
  }, [file, videoUrl, targetLang, simulateProgress, resetProgress]);

  const handleReset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    
    resetProgress();
    setStatus("idle");
    setFile(null);
    setVideoUrl("");
    setTargetLang("");
    setErrorMessage("");
    resultRef.current = undefined;
    videoResultRef.current = undefined;
    
    toast.info("Translation reset");
  }, [resetProgress]);

  const handleCancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    
    resetProgress();
    setStatus("idle");
    toast.info("Translation cancelled");
  }, [resetProgress]);

  const isButtonDisabled = !file && !videoUrl || !targetLang || status === "uploading" || status === "processing";
  const isCancelButtonVisible = status === "uploading" || status === "processing";

  const buttonContent = (() => {
    switch (status) {
      case "uploading":
        return (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Uploading...
          </div>
        );
      case "processing":
        return (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            Processing...
          </div>
        );
      default:
        return (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Start Translation
          </>
        );
    }
  })();

  const headerSection = (
    <div className="text-center mb-12 space-y-4">
      <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 text-primary mb-4">
        <Sparkles className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">
          AI-Powered Video Translation
        </span>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-primary to-primary/60">
        Translate Your Videos
        <br />
        <span className="text-foreground">In Seconds</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Upload your video, choose a language, and let Gemini AI handle the
        rest. Get accurate subtitles and translations instantly.
      </p>
    </div>
  );

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {headerSection}
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">1. Upload Video</h2>
                <p className="text-sm text-muted-foreground">
                  Select the video you want to translate (max 100MB).
                </p>
              </div>
              <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
                <VideoUpload
                  onFileSelect={handleFileSelect}
                  onUrlChange={handleUrlChange}
                  currentFile={file}
                />
              </Suspense>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">2. Select Language</h2>
                <p className="text-sm text-muted-foreground">
                  Choose your target language.
                </p>
              </div>
              <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-lg" />}>
                  <LanguageSelector
                    label="Target Language"
                    value={targetLang}
                    onChange={handleLanguageChange}
                    placeholder="Select target language"
                    disabled={status === "uploading" || status === "processing"}
                  />
                </Suspense>

                <div className="mt-8 space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={isButtonDisabled}
                    onClick={handleTranslate}
                    data-testid="translate-button"
                  >
                    {buttonContent}
                  </Button>
                  
                  {isCancelButtonVisible && (
                    <Button
                      className="w-full"
                      size="lg"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel Translation
                    </Button>
                  )}
                </div>

                {errorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 mr-2 shrink-0" />
                    <span className="text-sm text-destructive">{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
            <TranslationResult
              status={status}
              progress={progress}
              result={resultRef.current}
              videoResult={videoResultRef.current}
              onReset={handleReset}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}