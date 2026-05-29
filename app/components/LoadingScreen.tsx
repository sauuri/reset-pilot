"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "오늘 하루를 분석하는 중...",
  "지금 당장 할 수 있는 것 찾는 중...",
  "딱 맞는 플랜 골라내는 중...",
  "착륙 준비 중...",
];

export default function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      background: "linear-gradient(170deg, #0a2a5e 0%, #1a5fa8 40%, #3a9fd6 70%, #7ec8e8 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 28px",
    }}>

      {/* 별 */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${[10, 20, 35, 15, 55, 28][i]}%`,
          left: `${[12, 75, 85, 48, 8, 62][i]}%`,
          width: [8, 6, 10, 7, 9, 6][i],
          height: [8, 6, 10, 7, 9, 6][i],
          background: "white",
          clipPath: "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)",
          opacity: 0.7,
          animation: `twinkle ${[2.1, 2.8, 2.4, 3.0, 1.9, 2.6][i]}s ease-in-out ${[0, 0.8, 0.4, 1.2, 0.2, 1.6][i]}s infinite`,
        }} />
      ))}

      {/* 비행기 애니메이션 */}
      <div style={{
        marginBottom: 20,
        animation: "planeFly 2.2s ease-in-out infinite",
        filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.3))",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pilot-fly.png" alt="" width={130} height={130}
          style={{ display: "block" }} />
      </div>

      {/* 진행 바 */}
      <div style={{
        width: 200, height: 4, borderRadius: 2,
        background: "rgba(255,255,255,0.2)", marginBottom: 28, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: 2,
          background: "linear-gradient(90deg, #FFE066, #FF6B35)",
          animation: "loadBar 1.8s ease-in-out infinite",
        }} />
      </div>

      {/* 메시지 */}
      <div key={msgIdx} style={{
        fontSize: 16, fontWeight: 700, color: "white",
        textAlign: "center", minHeight: 48,
        textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        animation: "fadeMsg 0.4s ease",
      }}>
        {MESSAGES[msgIdx]}{"·".repeat(dots)}
      </div>

      <div style={{
        marginTop: 12, fontSize: 12,
        color: "rgba(255,255,255,0.45)",
        letterSpacing: 2, textTransform: "uppercase",
      }}>
        RST-001 운항 중
      </div>
    </div>
  );
}
