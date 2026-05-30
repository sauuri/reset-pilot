"use client";

import { useEffect, useState } from "react";
import { getSkyMode, SKY_BG } from "../utils/skyTheme";
import { playTap } from "../utils/sounds";

export default function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<"init" | "in" | "idle" | "out">("init");
  const mode = getSkyMode(new Date().getHours());

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("in"), 80);
    const t2 = setTimeout(() => setPhase("idle"), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleEnter() {
    playTap();
    setPhase("out");
    setTimeout(onEnter, 550);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: SKY_BG[mode],
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 28px",
      opacity: phase === "out" ? 0 : 1,
      transform: phase === "out" ? "scale(1.04)" : "scale(1)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      overflow: "hidden",
    }}>

      {/* 구름들 */}
      <Cloud size={120} top="12%" left="-6%" duration={18} delay={0} />
      <Cloud size={80}  top="22%" left="65%" duration={22} delay={4} />
      <Cloud size={100} top="60%" left="-4%" duration={20} delay={8} />
      <Cloud size={70}  top="72%" left="72%" duration={16} delay={2} />

      {/* 별 반짝이 */}
      {[...Array(7)].map((_, i) => (
        <Star key={i}
          top={`${[8, 15, 30, 45, 18, 55, 38][i]}%`}
          left={`${[10, 78, 88, 6, 45, 60, 25][i]}%`}
          size={[10, 7, 9, 7, 12, 7, 8][i]}
          duration={[2.1, 2.8, 2.4, 3.1, 1.9, 2.6, 2.3][i]}
          delay={[0, 0.8, 0.4, 1.2, 0.2, 1.6, 0.9][i]}
        />
      ))}

      {/* 비행기 날아오기 */}
      <div style={{
        marginBottom: 8,
        transform: phase === "init" || phase === "in"
          ? "translateX(-140px) translateY(30px) rotate(-15deg)"
          : "translateX(0) translateY(0) rotate(0deg)",
        opacity: phase === "init" || phase === "in" ? 0 : 1,
        transition: "transform 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease",
        filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.35))",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pilot-front.png" alt="" width={120} height={120}
          style={{ display: "block" }} />
      </div>

      {/* 메인 카피 */}
      <div style={{
        textAlign: "center",
        transform: phase === "idle" || phase === "out" ? "translateY(0)" : "translateY(24px)",
        opacity: phase === "idle" || phase === "out" ? 1 : 0,
        transition: "transform 0.6s ease 0.1s, opacity 0.6s ease 0.1s",
        background: "rgba(0,0,0,0.28)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderRadius: 24,
        padding: "24px 28px 20px",
        width: "100%",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 3,
          color: "rgba(255,255,255,0.7)", marginBottom: 14,
          textTransform: "uppercase",
        }}>✈ RESET PILOT</div>

        <h1 style={{
          fontSize: 32, fontWeight: 900, color: "white",
          lineHeight: 1.35, margin: "0 0 10px",
          textShadow: "0 2px 16px rgba(0,0,0,0.4)",
        }}>
          아직<br />
          <span style={{ color: "#FFE066" }}>늦지 않았습니다.</span>
        </h1>

        <p style={{
          fontSize: 15, color: "rgba(255,255,255,0.85)",
          lineHeight: 1.7, margin: "0 0 28px",
          fontWeight: 500,
        }}>
          오늘 망해도 괜찮아요.<br />
          지금 이 순간부터 다시 시작하면 돼요.
        </p>

        {/* 탑승 버튼 */}
        <button
          onClick={handleEnter}
          style={{
            background: "linear-gradient(135deg, #FF6B35, #f59e0b)",
            color: "white", border: "none", borderRadius: 18,
            padding: "18px 48px", fontSize: 17, fontWeight: 900,
            cursor: "pointer", letterSpacing: 0.5,
            boxShadow: "0 8px 28px rgba(255,107,53,0.45)",
            transform: "translateY(0)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "translateY(2px)")}
          onMouseUp={e => (e.currentTarget.style.transform = "translateY(0)")}
        >
          탑승하기 ✈
        </button>

        <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
          비행기 타고 오늘을 다시 시작해봐요
        </div>
      </div>

    </div>
  );
}

function Star({ top, left, size, duration, delay }: {
  top: string; left: string; size: number; duration: number; delay: number;
}) {
  // 5각 별 clip-path
  const star = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
  return (
    <div style={{
      position: "absolute", top, left,
      width: size, height: size,
      background: "white",
      clipPath: star,
      opacity: 0.75,
      filter: "drop-shadow(0 0 3px rgba(255,255,255,0.9))",
      animation: `twinkle ${duration}s ease-in-out ${delay}s infinite`,
    }} />
  );
}

function Cloud({ size, top, left, duration, delay }: {
  size: number; top: string; left: string; duration: number; delay: number;
}) {
  const h = size * 0.42;
  return (
    <div style={{
      position: "absolute", top, left,
      animation: `cloudDrift ${duration}s linear ${delay}s infinite`,
      pointerEvents: "none",
    }}>
      {/* 구름 몸통 */}
      <div style={{
        position: "relative",
        width: size, height: h,
        background: "rgba(255,255,255,0.22)",
        borderRadius: h / 2,
        boxShadow: "0 4px 16px rgba(180,220,248,0.15)",
      }}>
        {/* 왼쪽 봉우리 */}
        <div style={{
          position: "absolute",
          width: size * 0.38, height: size * 0.38,
          background: "rgba(255,255,255,0.22)",
          borderRadius: "50%",
          bottom: h * 0.4, left: size * 0.12,
        }} />
        {/* 가운데 봉우리 (큰) */}
        <div style={{
          position: "absolute",
          width: size * 0.5, height: size * 0.5,
          background: "rgba(255,255,255,0.22)",
          borderRadius: "50%",
          bottom: h * 0.45, left: size * 0.28,
        }} />
        {/* 오른쪽 봉우리 */}
        <div style={{
          position: "absolute",
          width: size * 0.3, height: size * 0.3,
          background: "rgba(255,255,255,0.22)",
          borderRadius: "50%",
          bottom: h * 0.35, right: size * 0.14,
        }} />
      </div>
    </div>
  );
}
