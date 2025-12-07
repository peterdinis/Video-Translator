"use client";

import { Sparkles } from "lucide-react";

export function Header() {
  return (
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
}