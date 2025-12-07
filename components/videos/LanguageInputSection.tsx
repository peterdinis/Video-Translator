"use client";

import { Suspense } from "react";
import { AlertCircle } from "lucide-react";
import { LanguageSelector } from "./language-selector";
import { TranslationButtons } from "./TranslationButtons";

interface LanguageInputSectionProps {
  targetLang: string;
  onLanguageChange: (lang: string) => void;
  status: "idle" | "uploading" | "processing" | "completed" | "error";
  errorMessage: string;
  isButtonDisabled: boolean;
  isCancelButtonVisible: boolean;
  onTranslate: () => void;
  onCancel: () => void;
}

export function LanguageInputSection({
  targetLang,
  onLanguageChange,
  status,
  errorMessage,
  isButtonDisabled,
  isCancelButtonVisible,
  onTranslate,
  onCancel,
}: LanguageInputSectionProps) {
  return (
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
            onChange={onLanguageChange}
            placeholder="Select target language"
            disabled={status === "uploading" || status === "processing"}
          />
        </Suspense>

        <TranslationButtons
          status={status}
          isButtonDisabled={isButtonDisabled}
          isCancelButtonVisible={isCancelButtonVisible}
          onTranslate={onTranslate}
          onCancel={onCancel}
        />

        {errorMessage && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 mr-2 shrink-0" />
            <span className="text-sm text-destructive">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}