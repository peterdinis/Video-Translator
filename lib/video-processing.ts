// @ts-ignore
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { join } from 'path';
import { tmpdir } from 'os';

// Set ffmpeg path
if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export async function replaceAudio(videoPath: string, audioPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const outputPath = join(tmpdir(), 'dubbed-' + Date.now() + '.mp4');

        ffmpeg()
            .input(videoPath)
            .input(audioPath)
            // Map video stream from first input (0:v)
            .map('0:v')
            // Map audio stream from second input (1:a)
            .map('1:a')
            .outputOptions([
                '-c:v copy', // Copy video codec (fast)
                '-c:a aac',  // Encode audio to AAC
                '-shortest'  // Finish when the shortest input stream ends
            ])
            .save(outputPath)
            .on('end', () => {
                resolve(outputPath);
            })
            .on('error', (err: Error) => {
                console.error('FFmpeg Error:', err);
                reject(err);
            });
    });
}
