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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3a060f",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nahata-campaign.vercel.app"),
  title: "नाहाटा जनरल स्टोर्स — शुभ नवरात्रि महोत्सव मेगा लकी ड्रॉ | कुशलगढ़",
  description:
    "नाहाटा जनरल स्टोर्स, बस स्टैंड रोड, कुशलगढ़ (बांसवाड़ा) की ओर से शुभ नवरात्रि महोत्सव का विशेष लकी ड्रॉ ऑफर। स्क्रैच करें व तुरंत कूपन प्राप्त करें।",
  openGraph: {
    title: "नाहाटा जनरल स्टोर्स — शुभ नवरात्रि महोत्सव मेगा लकी ड्रॉ",
    description: "बस स्टैंड रोड, कुशलगढ़ • लकी कार्ड स्क्रैच करें व तुरंत कूपन प्राप्त करें!",
    url: "https://nahata-campaign.vercel.app",
    siteName: "नाहाटा जनरल स्टोर्स कुशलगढ़",
    images: [
      {
        url: "/nahata-logo.jpg",
        width: 800,
        height: 800,
        alt: "नाहाटा जनरल स्टोर्स लोगो",
      },
    ],
    locale: "hi_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
