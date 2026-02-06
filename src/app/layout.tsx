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
  metadataBase: new URL("https://kanbam.de"),
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
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
