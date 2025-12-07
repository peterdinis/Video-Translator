"use client";

import { Suspense } from "react";
import { VideoUpload } from "./video-upload";

interface VideoInputSectionProps {
  onFileSelect: (file: File | null) => void;
  onUrlChange: (url: string) => void;
  currentFile: File | null;
}

export function VideoInputSection({ 
  onFileSelect, 
  onUrlChange, 
  currentFile 
}: VideoInputSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">1. Upload Video</h2>
        <p className="text-sm text-muted-foreground">
          Select the video you want to translate (max 100MB).
        </p>
      </div>
      <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
        <VideoUpload
          onFileSelect={onFileSelect}
          onUrlChange={onUrlChange}
          currentFile={currentFile}
        />
      </Suspense>
    </div>
  );
}