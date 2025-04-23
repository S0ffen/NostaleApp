import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "NosTale Event Tracker",
  description: "Śledzenie eventów NosTale z kalendarzem i statystyką",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white min-h-screen`}
      >
        {/* NAVBAR */}
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex gap-8 text-sm text-white">
          <Link href="/" className="hover:text-blue-400 font-semibold">
            🏠 Strona główna
          </Link>
          <Link href="/calendar" className="hover:text-blue-400 font-semibold">
            📅 Kalendarz
          </Link>
          <Link href="/simulator" className="hover:text-blue-400 font-semibold">
            📊 Symulator
          </Link>
        </nav>

        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
