import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  openGraph: {
    title: "Toolverse - The Universe of Tools",
    description:
      "世界中のツールが集まり、作られ、発見され、利用されるプラットフォーム",
    type: "website",
    siteName: "Toolverse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolverse - The Universe of Tools",
    description:
      "世界中のツールが集まり、作られ、発見され、利用されるプラットフォーム",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        {children}
      </body>
    </html>
  );
}
