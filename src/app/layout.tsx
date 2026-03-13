import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://toolverse.app'),
  title: "Toolverse - The Universe of Tools",
  description:
    "世界中のツールが集まり、作られ、発見され、利用されるプラットフォーム。Software, SaaS, AI, Automation tools in one universe.",
  keywords: [
    "Toolverse",
    "Tools",
    "SaaS",
    "AI",
    "Marketplace",
    "Software",
    "Automation",
    "ツール",
    "マーケットプレイス",
  ],
  authors: [{ name: "Toolverse" }],
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: "Toolverse - The Universe of Tools",
    description: "Discover, create, and use the world's best software tools. The next-generation platform for Web Apps, SaaS, AI, and Automation.",
    type: "website",
    siteName: "Toolverse",
    url: "https://toolverse.app",
    images: [
      {
        url: '/api/og',
        width: 1200,
        height: 630,
        alt: 'Toolverse - The Universe of Tools',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse - The Universe of Tools",
    description: "Discover, create, and use the world's best software tools.",
    images: ['/api/og'],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#030014" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const nonce = hdrs.get('x-nonce') ?? undefined;

  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: 'var(--font-geist-sans), "Hiragino Sans", "Noto Sans JP", "Noto Sans SC", "Noto Sans KR", sans-serif' }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-violet-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <GoogleAnalytics nonce={nonce} />
        {children}
      </body>
    </html>
  );
}
