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
      <body className="min-h-full flex flex-col">
        {/* 구름 */}
        <div className="cloud" style={{ width: 160, height: 40, top: "8%", animationDuration: "55s", animationDelay: "0s" }} />
        <div className="cloud" style={{ width: 100, height: 28, top: "22%", animationDuration: "70s", animationDelay: "-25s" }} />
        <div className="cloud" style={{ width: 200, height: 50, top: "40%", animationDuration: "90s", animationDelay: "-40s" }} />
        <div className="cloud" style={{ width: 120, height: 32, top: "58%", animationDuration: "65s", animationDelay: "-10s" }} />
        <div className="cloud" style={{ width: 80,  height: 22, top: "72%", animationDuration: "80s", animationDelay: "-50s" }} />
        <div className="cloud" style={{ width: 140, height: 38, top: "88%", animationDuration: "60s", animationDelay: "-30s" }} />
        {children}
      </body>
    </html>
  );
}
