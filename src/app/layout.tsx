import type { Metadata } from "next";
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
  title: "KanBam - Kanban Board",
  description: "A collaborative Kanban board for teams and individuals to manage tasks efficiently",
  authors: [{ name: "Dr.-Ing. Robin Nicolay", url: "https://robinnicolay.de" }],
  keywords: [
    "Kanban",
    "Kanban board",
    "task management",
    "project management",
    "collaboration",
    "team productivity",
    "agile",
    "workflow",
  ],
  metadataBase: new URL("https://kanbam.de"),
  openGraph: {
    title: "KanBam - Kanban Board",
    description: "A collaborative Kanban board for teams and individuals to manage tasks efficiently",
    url: "https://kanbam.de",
    siteName: "KanBam",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KanBam - Kanban Board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KanBam - Kanban Board",
    description: "A collaborative Kanban board for teams and individuals to manage tasks efficiently",
    images: ["/og-image.png"],
  },
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
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative min-h-screen`}
      >
        {/* Animated background orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="bg-orb bg-orb-1 -top-[10%] -left-[5%]" />
          <div className="bg-orb bg-orb-2 top-[40%] -right-[10%]" />
          <div className="bg-orb bg-orb-3 -bottom-[15%] left-[30%]" />
        </div>

        {/* Mesh gradient overlay */}
        <div className="fixed inset-0 mesh-gradient opacity-50 pointer-events-none -z-10" />

        {/* Noise texture */}
        <div className="noise-overlay -z-10" />

        {children}
      </body>
    </html>
  );
}
