"use client";

import { Header } from "@/components/shared/Header";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { LanguageInputSection } from "@/components/videos/LanguageInputSection";
import { TranslationResultSection } from "@/components/videos/TranslationResultSection";
import { VideoInputSection } from "@/components/videos/VideoInputSection";
import { useState, useCallback, useRef, useEffect, lazy } from "react";
import { toast } from "sonner";

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

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <Header />
        
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <VideoInputSection
              onFileSelect={handleFileSelect}
              onUrlChange={handleUrlChange}
              currentFile={file}
            />

            <LanguageInputSection
              targetLang={targetLang}
              onLanguageChange={handleLanguageChange}
              status={status}
              errorMessage={errorMessage}
              isButtonDisabled={isButtonDisabled}
              isCancelButtonVisible={isCancelButtonVisible}
              onTranslate={handleTranslate}
              onCancel={handleCancel}
            />
          </div>

          <TranslationResultSection
            status={status}
            progress={progress}
            result={resultRef.current}
            videoResult={videoResultRef.current}
            onReset={handleReset}
          />
        </div>
      </div>
    </main>
  );
}