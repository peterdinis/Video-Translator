"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface TranslationButtonsProps {
  status: "idle" | "uploading" | "processing" | "completed" | "error";
  isButtonDisabled: boolean;
  isCancelButtonVisible: boolean;
  onTranslate: () => void;
  onCancel: () => void;
}

export function TranslationButtons({
  status,
  isButtonDisabled,
  isCancelButtonVisible,
  onTranslate,
  onCancel,
}: TranslationButtonsProps) {
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

  return (
    <div className="mt-8 space-y-3">
      <Button
        className="w-full"
        size="lg"
        disabled={isButtonDisabled}
        onClick={onTranslate}
        data-testid="translate-button"
      >
        {buttonContent}
      </Button>
      
      {isCancelButtonVisible && (
        <Button
          className="w-full"
          size="lg"
          variant="outline"
          onClick={onCancel}
        >
          Cancel Translation
        </Button>
      )}
    </div>
  );
}