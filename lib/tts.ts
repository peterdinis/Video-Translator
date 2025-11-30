import * as googleTTS from 'google-tts-api';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export async function generateAudio(text: string, lang: string): Promise<string> {
    try {
        // Split text into smaller chunks if needed (google-tts-api has a limit)
        // For simplicity, we'll assume short sentences for now or handle basic splitting
        // Ideally, we should split by sentences.

        // Note: google-tts-api returns a base64 string or a URL. 
        // We'll use getAllAudioBase64 to handle long text.

        const results = await googleTTS.getAllAudioBase64(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
            timeout: 10000
        });

        // Combine all audio chunks
        const combinedBuffer = Buffer.concat(
            results.map(result => Buffer.from(result.base64, 'base64'))
        );

        const fileName = `tts-${Date.now()}.mp3`;
        const filePath = join(tmpdir(), fileName);

        await writeFile(filePath, combinedBuffer);

        return filePath;
    } catch (error) {
        console.error('TTS Error:', error);
        throw new Error('Failed to generate audio from text');
    }
}
