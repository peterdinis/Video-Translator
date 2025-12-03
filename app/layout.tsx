import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Video-Translator AI | Instant Video Translation Platform",
    template: "%s | Video-Translator AI",
  },
  description: "Upload a video in one language and instantly translate it to another. AI-powered subtitle generation, voice synchronization, and support for 50+ languages.",
  keywords: [
    "video translation",
    "AI video translation",
    "multilingual video",
    "automatic subtitles",
    "voice synchronization",
    "language translation",
    "video localization",
    "AI dubbing",
    "subtitle generation",
    "video transcription",
  ],
  authors: [{
    name: 'Peter Dinis',
    url: 'https://dinis-portfolio.vercel.app/',
  }],
  creator: 'Peter Dinis',
  publisher: 'Peter Dinis',
  metadataBase: new URL('https://dinis-portfolio.vercel.app/'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Video-Translator AI | Instant Video Translation Platform",
    description: "Upload a video in one language and get it instantly in 50+ other languages with AI-generated subtitles and synchronized voice.",
    siteName: "Video-Translator AI",
  },
  category: "technology",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: false,
  },
};

// ⚡ Viewport musí byť SAMOSTATNÝ export
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`font-sans antialiased bg-background text-foreground min-h-screen`}>
        {children}
      </body>
    </html>
  );
}