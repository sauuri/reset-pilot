"use client";

import { useEffect, useState } from "react";

type Mode = "dawn" | "day" | "sunset" | "night";

function getMode(h: number): Mode {
  if (h >= 5 && h < 7)  return "dawn";
  if (h >= 7 && h < 17) return "day";
  if (h >= 17 && h < 20) return "sunset";
  return "night";
}

const GRADIENTS: Record<Mode, string> = {
  dawn:   "linear-gradient(170deg, #1a1a5e 0%, #6b3a9c 18%, #c4553a 38%, #e8804a 58%, #f4c17a 80%, #fde8c0 100%)",
  day:    "linear-gradient(160deg, #3fa3d5 0%, #5cbfe8 12%, #88d4f3 28%, #b2e5fa 45%, #cef2fc 62%, #aeddf5 78%, #7cc8e8 92%, #55b3e0 100%)",
  sunset: "linear-gradient(170deg, #0a1530 0%, #2a1a6b 12%, #7a2a7a 26%, #c44040 44%, #e87838 60%, #f4b060 78%, #fce4c0 100%)",
  night:  "linear-gradient(180deg, #010810 0%, #030f1f 20%, #061828 50%, #0c2040 80%, #142e58 100%)",
};

// 그라데이션 최상단 색상 — 노치/오버스크롤 영역에 사용
const SKY_TOP: Record<Mode, string> = {
  dawn:   "#1a1a5e",
  day:    "#3fa3d5",
  sunset: "#0a1530",
  night:  "#010810",
};

const SKY_NOTCH: Record<Mode, string> = {
  dawn:   "#1a1a5e",
  day:    "#3fa3d5",
  sunset: "#0a1530",
  night:  "#010810",
};

function getSunPos(h: number) {
  const t = Math.max(0, Math.min(1, (h - 5) / 14));
  return { x: t * 88 + 6, y: 88 - Math.sin(t * Math.PI) * 72 };
}

function getMoonPos(h: number) {
  const nh = h >= 20 ? h - 20 : h + 4;
  const t = Math.max(0, Math.min(1, nh / 9));
  return { x: t * 78 + 11, y: 80 - Math.sin(t * Math.PI) * 60 };
}

const sr = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };
const STARS = Array.from({ length: 90 }, (_, i) => ({
  x:       sr(i * 7.3891 + 1.1) * 100,
  y:       sr(i * 3.1415 + 2.7) * 68,
  size:    sr(i * 1.618) > 0.88 ? 5 : sr(i * 1.618) > 0.65 ? 3 : 2,
  opacity: 0.7 + sr(i * 5.2) * 0.28,
  warm:    sr(i * 4.2) > 0.88,  // 가끔 노란빛 별
  twinkle: sr(i * 9.1) > 0.55,
  delay:   (sr(i * 2.718) * 4).toFixed(1),
  dur:     (1.4 + sr(i * 0.577) * 2.2).toFixed(1),
}));

export default function SkyBackground() {
  const [hour, setHour] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setHour(new Date().getHours());
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hour === null) return;
    const m = getMode(hour);
    document.documentElement.style.setProperty("--sky-notch", SKY_NOTCH[m]);
    // 노치 + 오버스크롤 영역을 하늘 색으로
    document.documentElement.style.background = SKY_TOP[m];
    document.body.style.background = SKY_TOP[m];
  }, [hour]);

  if (hour === null) return null;

  const mode = getMode(hour);
  const sun  = getSunPos(hour);
  const moon = getMoonPos(hour);
  const isWarm = mode === "sunset" || mode === "dawn";

  return (
    <>
      {/* 하늘 */}
      <div style={{ position:"fixed", inset:0, background:GRADIENTS[mode], zIndex:-1, pointerEvents:"none", transition:"background 5s ease" }} />

      {/* 별 */}
      {mode === "night" && STARS.map((s, i) => (
        <div key={i} style={{
          position:"fixed", left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size, borderRadius:"50%",
          background: s.warm ? "#fff8cc" : "white",
          opacity: s.opacity,
          boxShadow: s.size >= 4
            ? `0 0 ${s.size * 2}px ${s.size}px rgba(255,255,255,0.55)`
            : `0 0 ${s.size + 1}px rgba(255,255,255,0.4)`,
          animation: s.twinkle ? `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` : "none",
          zIndex:0, pointerEvents:"none",
        }} />
      ))}

      {/* 태양 */}
      {mode !== "night" && (
        <div style={{ position:"fixed", left:`${sun.x}%`, top:`${sun.y}%`, transform:"translate(-50%,-50%)", zIndex:0, pointerEvents:"none" }}>
          <div style={{
            width: isWarm ? 66 : 52, height: isWarm ? 66 : 52, borderRadius:"50%",
            background: isWarm
              ? "radial-gradient(circle, #fff5c0 20%, #ffb830 50%, #ff6020 80%, transparent 100%)"
              : "radial-gradient(circle, #fffde0 28%, #ffe560 56%, #ffcc00 80%, transparent 100%)",
            boxShadow: isWarm
              ? "0 0 70px 36px rgba(255,140,30,0.42), 0 0 140px 70px rgba(255,80,20,0.18)"
              : "0 0 52px 26px rgba(255,220,60,0.45), 0 0 104px 52px rgba(255,200,0,0.2)",
          }} />
        </div>
      )}

      {/* 달 */}
      {mode === "night" && (
        <div style={{ position:"fixed", left:`${moon.x}%`, top:`${moon.y}%`, transform:"translate(-50%,-50%)", zIndex:0, pointerEvents:"none" }}>
          <div style={{
            width:48, height:48, borderRadius:"50%",
            background:"radial-gradient(circle at 38% 38%, #f8fbff 0%, #dceaf8 40%, #bcd0ee 70%, #9ab8de 100%)",
            boxShadow:"0 0 30px 14px rgba(180,220,255,0.22), 0 0 64px 30px rgba(130,190,255,0.1), inset -12px -8px 0 rgba(130,165,210,0.38)",
          }} />
        </div>
      )}

      {/* 구름 */}
      {mode !== "night" && <>
        <div className="cloud" style={{ width:180, height:44, top:"6%",  animationDuration:"58s",  animationDelay:"0s",   opacity: isWarm?0.65:0.75 }} />
        <div className="cloud" style={{ width:110, height:28, top:"20%", animationDuration:"72s",  animationDelay:"-26s", opacity: isWarm?0.55:0.75 }} />
        <div className="cloud" style={{ width:220, height:52, top:"38%", animationDuration:"95s",  animationDelay:"-42s", opacity: isWarm?0.5:0.75  }} />
        <div className="cloud" style={{ width:130, height:34, top:"55%", animationDuration:"68s",  animationDelay:"-12s", opacity: 0.65 }} />
        <div className="cloud" style={{ width:90,  height:24, top:"70%", animationDuration:"82s",  animationDelay:"-52s", opacity: 0.6  }} />
      </>}

      {/* 하늘 패치 */}
      {mode === "day" && <>
        <div className="sky-patch" style={{ width:500, height:400, top:"-8%", left:"60%", background:"radial-gradient(ellipse, rgba(100,190,240,0.28) 0%, transparent 70%)", animationDuration:"18s" }} />
        <div className="sky-patch" style={{ width:380, height:300, top:"30%", left:"-5%", background:"radial-gradient(ellipse, rgba(80,170,230,0.22) 0%, transparent 70%)", animationDuration:"22s", animationDelay:"-8s"  }} />
        <div className="sky-patch" style={{ width:300, height:260, top:"-5%", left:"10%", background:"radial-gradient(ellipse, rgba(255,240,180,0.13) 0%, transparent 70%)", animationDuration:"28s", animationDelay:"-12s" }} />
      </>}
      {isWarm && <>
        <div className="sky-patch" style={{ width:520, height:400, top:"5%",  left:"35%", background:"radial-gradient(ellipse, rgba(255,120,60,0.22)  0%, transparent 70%)", animationDuration:"20s" }} />
        <div className="sky-patch" style={{ width:420, height:320, top:"40%", left:"-5%", background:"radial-gradient(ellipse, rgba(180,60,160,0.15)  0%, transparent 70%)", animationDuration:"26s", animationDelay:"-10s" }} />
      </>}

      {/* 비행기 — 낮/새벽 */}
      {(mode === "day" || mode === "dawn") && <>
        <div className="plane" style={{ top:"12%", animationName:"plane-lr", animationDuration:"90s",  animationDelay:"0s",   animationTimingFunction:"linear", animationIterationCount:"infinite" }}>✈️</div>
        <div className="plane" style={{ top:"48%", fontSize:14, animationName:"plane-lr", animationDuration:"110s", animationDelay:"-45s", animationTimingFunction:"linear", animationIterationCount:"infinite" }}>✈️</div>
        <div className="plane" style={{ top:"28%", animationName:"plane-rl", animationDuration:"100s", animationDelay:"-20s", animationTimingFunction:"linear", animationIterationCount:"infinite" }}>✈️</div>
      </>}

      {/* 밤 비행기 + 인공위성 */}
      {mode === "night" && <>
        <NightPlane top="14%" duration="95s"  delay="0s"   direction="lr" />
        <NightPlane top="38%" duration="120s" delay="-50s" direction="rl" small />
        <NightPlane top="58%" duration="105s" delay="-28s" direction="lr" small />
        {/* 인공위성 — 빛 없이 천천히 직선 이동 */}
        <Satellite top="8%"  duration="220s" delay="0s"   />
        <Satellite top="32%" duration="280s" delay="-110s" dim />
      </>}
    </>
  );
}

function NightPlane({ top, duration, delay, direction, small }: {
  top: string; duration: string; delay: string;
  direction: "lr" | "rl"; small?: boolean;
}) {
  return (
    <div style={{
      position: "fixed", top, zIndex: 2, pointerEvents: "none", opacity: 0,
      display: "flex", alignItems: "center", gap: 1,
      animationName: direction === "lr" ? "plane-lr" : "plane-rl",
      animationDuration: duration,
      animationDelay: delay,
      animationTimingFunction: "linear",
      animationIterationCount: "infinite",
    }}>
      {/* 어두운 실루엣 */}
      <span style={{ fontSize: small ? 11 : 15, filter: "brightness(0.3) saturate(0)", opacity: 0.7 }}>✈️</span>
      {/* 빨간 항법등 — 크고 밝게 */}
      <span style={{
        position: "absolute",
        top: "18%",
        left: direction === "lr" ? "5%" : "auto",
        right: direction === "rl" ? "5%" : "auto",
        width: small ? 5 : 7,
        height: small ? 5 : 7,
        borderRadius: "50%",
        background: "#ff1010",
        boxShadow: "0 0 8px 4px rgba(255,10,10,0.95), 0 0 16px 8px rgba(255,10,10,0.5)",
        animation: "blink 0.85s ease-in-out infinite",
        display: "inline-block",
      }} />
      {/* 흰색 스트로브등 — 짧게 번쩍 */}
      <span style={{
        position: "absolute",
        top: "-30%", left: "40%",
        width: small ? 3 : 4, height: small ? 3 : 4,
        borderRadius: "50%",
        background: "white",
        boxShadow: "0 0 6px 3px rgba(255,255,255,0.9)",
        animation: "strobe 1.4s ease-in-out infinite",
        display: "inline-block",
      }} />
    </div>
  );
}

function Satellite({ top, duration, delay, dim }: {
  top: string; duration: string; delay: string; dim?: boolean;
}) {
  return (
    <div style={{
      position: "fixed", top, zIndex: 1, pointerEvents: "none", opacity: 0,
      width: dim ? 2 : 3, height: dim ? 2 : 3,
      borderRadius: "50%",
      background: dim ? "rgba(200,220,255,0.7)" : "rgba(220,235,255,0.9)",
      boxShadow: dim
        ? "0 0 3px 1px rgba(200,220,255,0.4)"
        : "0 0 5px 2px rgba(210,230,255,0.7)",
      animation: "satellite linear infinite",
      animationDuration: duration,
      animationDelay: delay,
    }} />
  );
}
