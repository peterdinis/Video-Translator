'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface TranslationResultProps {
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
    progress: number;
    result?: string; // URL to translated video or text content
    videoResult?: string; // Base64 video URL
    error?: string;
    onReset: () => void;
}

export function TranslationResult({ status, progress, result, videoResult, error, onReset }: TranslationResultProps) {
    if (status === 'idle') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto mt-8"
        >
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            {status === 'uploading' && 'Uploading Video...'}
                            {status === 'processing' && 'Translating...'}
                            {status === 'completed' && 'Translation Complete'}
                            {status === 'error' && 'Error Occurred'}
                        </h3>
                        {status === 'completed' && (
                            <Button variant="outline" size="sm" onClick={onReset}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Translate Another
                            </Button>
                        )}
                    </div>

                    {(status === 'uploading' || status === 'processing') && (
                        <div className="space-y-4 py-8">
                            <div className="flex justify-center">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 text-center">
                                <h4 className="font-medium text-lg animate-pulse">
                                    {status === 'uploading' ? 'Uploading Video...' : 'Translating Content...'}
                                </h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    {status === 'uploading'
                                        ? 'Please wait while we securely upload your video to our AI engine.'
                                        : 'Gemini AI is analyzing the audio and generating accurate translations.'}
                                </p>
                            </div>
                            <Progress value={progress} className="w-full h-2" />
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
                            <p className="font-medium">Something went wrong</p>
                            <p className="text-sm">{error || 'Please try again later.'}</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
                                Try Again
                            </Button>
                        </div>
                    )}

                    {status === 'completed' && (
                        <div className="space-y-6">
                            {videoResult && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Dubbed Video:</h4>
                                    <div className="rounded-lg overflow-hidden bg-black aspect-video">
                                        <video
                                            src={videoResult}
                                            controls
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button variant="secondary" asChild>
                                            <a href={videoResult} download="dubbed-video.mp4">
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Video
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-2">
                                    <h4 className="font-medium">Translation Text:</h4>
                                    <div className="p-4 rounded-lg bg-muted whitespace-pre-wrap text-sm max-h-60 overflow-y-auto">
                                        {result}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={onReset}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Translate Another
                                </Button>
                            </div>
                        </div>
                    )}                </div>
            </Card>
        </motion.div>
    );
}
