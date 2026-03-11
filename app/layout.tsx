import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LIV DOT — Host Dashboard",
  description: "Manage your live events on LIV DOT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="min-h-screen bg-zinc-950 text-white antialiased font-display">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}