import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
	weight: ["300", "400", "500", "700"],
	subsets: ["latin", "latin-ext"],
	variable: "--font-ubuntu",
	display: "swap",
	preload: true,
});

const ubuntuMono = Ubuntu_Mono({
	weight: ["400", "700"],
	subsets: ["latin", "latin-ext"],
	variable: "--font-ubuntu-mono",
	display: "swap",
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
		"speech to text",
		"text to speech",
		"media translation",
		"content localization",
		"video AI tools",
	],

	creator: "Video-Translator AI Technologies",
	publisher: "Global Media Innovation Group",

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
			noimageindex: false,
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

	classification: "Video Editing Software, AI Translation Services, Multimedia Tools, SaaS Platform",

	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 5,
		userScalable: true,
	},

	formatDetection: {
		telephone: true,
		date: true,
		address: true,
		email: true,
		url: false,
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="color-scheme" content="light dark" />
				<meta name="supported-color-schemes" content="light dark" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link
					href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Ubuntu+Mono:wght@400;700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={`${ubuntu.variable} ${ubuntuMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
				suppressHydrationWarning
			>
				{children}
			</body>
		</html>
	);
}