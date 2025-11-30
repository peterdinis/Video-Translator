# 🎬 AI Video Translator

> Transform videos into any language with AI-powered translation and dubbing

A modern Next.js application that leverages Google's Gemini AI to translate video content into multiple languages, complete with automated dubbing and text-to-speech capabilities.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss)

## ✨ Features

- 🎥 **Multiple Input Methods**
  - Drag & drop file upload with `react-dropzone`
  - Direct video URL support
  - YouTube video integration
  
- 🤖 **AI-Powered Translation**
  - Powered by Google Gemini 2.5 Flash
  - Accurate speech-to-text transcription
  - Context-aware translation with timestamps
  
- 🎙️ **Video Dubbing**
  - Automatic text-to-speech generation
  - Video audio replacement using FFmpeg
  - Download dubbed videos directly
  
- ⚡ **Performance**
  - Next.js caching for instant repeated translations
  - Optimized video processing pipeline
  - Real-time progress tracking
  
- 🎨 **Modern UI**
  - Beautiful interface with Shadcn UI
  - Smooth animations with Framer Motion
  - Fully responsive design
  - Dark mode support

## 🌍 Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese (Simplified & Traditional), Arabic, Hindi, Dutch, Polish, Turkish, Swedish, Danish, Norwegian, Finnish, Greek, and more!

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd video-translator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Upload a Video**
   - Drag and drop a video file, or
   - Click to browse and select a file, or
   - Paste a YouTube/direct video URL

2. **Select Target Language**
   - Choose from 20+ supported languages

3. **Translate**
   - Click "Translate Video"
   - Wait for AI processing (typically 10-30 seconds)

4. **Download Results**
   - View the translated text with timestamps
   - Watch the dubbed video with new audio
   - Download the dubbed video file

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Framer Motion** - Animations
- **React Dropzone** - File uploads

### Backend
- **Next.js API Routes** - Serverless functions
- **Google Gemini API** - AI translation
- **FFmpeg** - Video processing
- **Google TTS** - Text-to-speech
- **ytdl-core** - YouTube video downloads

### Caching
- **Next.js unstable_cache** - Server-side caching
- Automatic cache invalidation
- Optimized for repeated translations

## 📁 Project Structure

```
video-translator/
├── app/
│   ├── api/
│   │   └── translate/
│   │       └── route.ts          # Translation API endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── language-selector.tsx    # Language dropdown
│   ├── translation-result.tsx   # Results display
│   └── video-upload.tsx          # Upload interface
├── lib/
│   ├── cache.ts                  # Next.js caching utilities
│   ├── gemini.ts                 # Gemini API client
│   ├── tts.ts                    # Text-to-speech
│   ├── video-processing.ts      # FFmpeg operations
│   └── utils.ts                  # Utilities
└── public/                       # Static assets
```

## ⚙️ Configuration

### Video Limits
- **Max file size**: 100MB
- **Supported formats**: MP4, WebM, AVI, MOV, MKV
- **Processing timeout**: 2 minutes

### Caching
The app uses Next.js caching to store translation results:
- **Cache key**: `${videoSource}-${targetLanguage}`
- **Cache duration**: 24 hours
- **Storage**: Server-side memory

## 🔧 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## 🐛 Troubleshooting

### Common Issues

**"Gemini API key not configured"**
- Ensure `.env.local` exists with `GEMINI_API_KEY`
- Restart the dev server after adding the key

**"Video processing timeout"**
- Video may be too large (>100MB)
- Try a shorter video or direct URL

**"Failed to download YouTube video"**
- URL may be invalid or restricted
- Try a different video or use direct upload

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [FFmpeg](https://ffmpeg.org/) for video processing
- [Next.js](https://nextjs.org/) for the amazing framework

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js and Google Gemini AI
