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

const SKY_NOTCH: Record<Mode, string> = {
  dawn:   "#d89070",
  day:    "#a8d8f0",
  sunset: "#a04050",
  night:  "#0e2040",
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

// sin 기반 시드 난수 — 규칙적인 대각선 패턴 방지
const sr = (s: number) => { const x = Math.sin(s) * 43758.5453; return x - Math.floor(x); };
const STARS = Array.from({ length: 80 }, (_, i) => ({
  x:       sr(i * 7.3891 + 1.1) * 100,
  y:       sr(i * 3.1415 + 2.7) * 65,
  size:    sr(i * 1.618) > 0.85 ? 3 : sr(i * 1.618) > 0.6 ? 2 : 1,
  opacity: 0.4 + sr(i * 5.2) * 0.55,
  twinkle: sr(i * 9.1) > 0.65,
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
    document.documentElement.style.setProperty("--sky-notch", SKY_NOTCH[getMode(hour)]);
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
          background:"white", opacity:s.opacity,
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

      {/* 비행기 */}
      {(mode === "day" || mode === "dawn") && <>
        <div className="plane" style={{ top:"12%", animationName:"plane-lr", animationDuration:"90s",  animationDelay:"0s",   animationTimingFunction:"linear", animationIterationCount:"infinite" }}>✈️</div>
        <div className="plane" style={{ top:"48%", fontSize:14, animationName:"plane-lr", animationDuration:"110s", animationDelay:"-45s", animationTimingFunction:"linear", animationIterationCount:"infinite" }}>✈️</div>
        <div className="plane" style={{ top:"28%", animationName:"plane-rl", animationDuration:"100s", animationDelay:"-20s", animationTimingFunction:"linear", animationIterationCount:"infinite" }}>✈️</div>
      </>}
    </>
  );
}
