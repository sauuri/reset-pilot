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

        {/* 하늘색 패치 — 맑은 하늘의 명암 변화 */}
        <div className="sky-patch" style={{ width: 500, height: 400, top: "-8%",  left: "60%",  background: "radial-gradient(ellipse, rgba(100,190,240,0.35) 0%, transparent 70%)", animationDuration: "18s", animationDelay: "0s"   }} />
        <div className="sky-patch" style={{ width: 380, height: 300, top: "30%",  left: "-5%",  background: "radial-gradient(ellipse, rgba(80,170,230,0.3)  0%, transparent 70%)", animationDuration: "22s", animationDelay: "-8s"  }} />
        <div className="sky-patch" style={{ width: 420, height: 350, top: "55%",  left: "50%",  background: "radial-gradient(ellipse, rgba(120,200,245,0.28) 0%, transparent 70%)", animationDuration: "26s", animationDelay: "-14s" }} />
        <div className="sky-patch" style={{ width: 300, height: 250, top: "75%",  left: "10%",  background: "radial-gradient(ellipse, rgba(90,180,235,0.25) 0%, transparent 70%)", animationDuration: "20s", animationDelay: "-5s"  }} />
        {/* 햇살 느낌 따뜻한 패치 */}
        <div className="sky-patch" style={{ width: 350, height: 280, top: "-5%",  left: "10%",  background: "radial-gradient(ellipse, rgba(255,240,180,0.18) 0%, transparent 70%)", animationDuration: "30s", animationDelay: "-10s" }} />
        <div className="sky-patch" style={{ width: 260, height: 200, top: "45%",  left: "70%",  background: "radial-gradient(ellipse, rgba(255,230,160,0.14) 0%, transparent 70%)", animationDuration: "25s", animationDelay: "-18s" }} />

        {/* 구름 */}
        <div className="cloud" style={{ width: 180, height: 44, top: "6%",  animationDuration: "58s",  animationDelay: "0s"   }} />
        <div className="cloud" style={{ width: 110, height: 28, top: "20%", animationDuration: "72s",  animationDelay: "-26s" }} />
        <div className="cloud" style={{ width: 220, height: 52, top: "38%", animationDuration: "95s",  animationDelay: "-42s" }} />
        <div className="cloud" style={{ width: 130, height: 34, top: "55%", animationDuration: "68s",  animationDelay: "-12s" }} />
        <div className="cloud" style={{ width: 90,  height: 24, top: "70%", animationDuration: "82s",  animationDelay: "-52s" }} />
        <div className="cloud" style={{ width: 160, height: 40, top: "85%", animationDuration: "63s",  animationDelay: "-33s" }} />

        {/* 비행기 — 각각 다른 타이밍으로 등장 */}
        {/* 왼→오, 높은 고도 */}
        <div className="plane" style={{
          top: "12%",
          animationName: "plane-lr",
          animationDuration: "90s",
          animationDelay: "0s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}>✈️</div>

        {/* 왼→오, 낮은 고도, 작게 (멀리 있는 느낌) */}
        <div className="plane" style={{
          top: "48%",
          fontSize: 14,
          animationName: "plane-lr",
          animationDuration: "110s",
          animationDelay: "-45s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}>✈️</div>

        {/* 오→왼, 반대 방향 */}
        <div className="plane" style={{
          top: "28%",
          animationName: "plane-rl",
          animationDuration: "100s",
          animationDelay: "-20s",
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
        }}>✈️</div>

        {children}
      </body>
    </html>
  );
}
