import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResetPilot — 망한 하루 복구 AI",
  description: "오늘 망했어도 괜찮아. 지금 당장 가능한 것부터.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "#0d0d0d", color: "#f0f0f0" }}>
        {children}
      </body>
    </html>
  );
}
