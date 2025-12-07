"use client";

import { Suspense } from "react";
import { TranslationResult } from "./translation-result";

interface TranslationResultSectionProps {
  status: "idle" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  result: string | undefined;
  videoResult: string | undefined;
  onReset: () => void;
}

export function TranslationResultSection({
  status,
  progress,
  result,
  videoResult,
  onReset,
}: TranslationResultSectionProps) {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
      <TranslationResult
        status={status}
        progress={progress}
        result={result}
        videoResult={videoResult}
        onReset={onReset}
      />
    </Suspense>
  );
}