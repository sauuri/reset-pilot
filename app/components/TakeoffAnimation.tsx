"use client";
import { useEffect, useState } from "react";
import { getSkyMode, SKY_BG, RUNWAY_BG } from "../utils/skyTheme";

const STARS: [number, number][] = [
  [8,12],[13,78],[22,88],[6,45],[18,23],[30,67],[10,90],
  [25,5],[35,55],[5,35],[15,52],[28,80],[40,15],[32,38],[20,95],
];

// 택싱 프레임: 옆면 이미지들 번갈아가며 바퀴 구르는 느낌
const TAXI_FRAMES = ["/pilot-2.png", "/pilot-6.png", "/pilot-7.png", "/pilot-2.png", "/pilot-6.png"];

export default function TakeoffAnimation({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  // 0: 직원 등장  1: 팔 벌림  2: 비행기 택싱  3: 이륙  4: 완료
  const [frame, setFrame] = useState(0);
  const mode = getSkyMode(new Date().getHours());
  const showStars = mode === "night" || mode === "dawn";

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 1100),
      setTimeout(() => setPhase(3), 2700),
      setTimeout(onDone, 4600),  // 이륙 후 화면 벗어날 시간 확보
    ];
    return () => t.forEach(clearTimeout);
  }, [onDone]);

  // 택싱 중 프레임 교체
  useEffect(() => {
    if (phase !== 2) return;
    const iv = setInterval(() => setFrame(f => (f + 1) % TAXI_FRAMES.length), 180);
    return () => clearInterval(iv);
  }, [phase]);

  const planeStyle: React.CSSProperties = phase >= 3 ? {
    // 이륙: 오른쪽 위로 화면 이탈 — 크기 유지, 기수 위로
    position: "absolute",
    bottom: "90%",
    left: "120%",
    transform: "translateX(-50%) rotate(-22deg)",
    transition: "bottom 1.8s cubic-bezier(0.3,0,0.5,1), left 1.8s cubic-bezier(0.5,0,0.8,1), transform 0.5s ease-out",
    zIndex: 6,
  } : phase === 2 ? {
    // 택싱: 왼쪽 → 오른쪽
    position: "absolute",
    bottom: "28.5%",
    left: "68%",
    transform: "translateX(-50%)",
    transition: "left 1.6s cubic-bezier(0.3,0,0.7,1)",
    zIndex: 6,
  } : {
    // 대기: 왼쪽 끝 (화면 밖)
    position: "absolute",
    bottom: "28.5%",
    left: "10%",
    transform: "translateX(-50%)",
    transition: "none",
    zIndex: 6,
  };

  const planeImg = phase >= 3 ? "/pilot-fly.png" : TAXI_FRAMES[frame];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9500,
      background: SKY_BG[mode],
      overflow: "hidden",
    }}>

      {/* 별 (밤/새벽) */}
      {showStars && STARS.map(([top, left], i) => (
        <div key={i} style={{
          position: "absolute", top: `${top}%`, left: `${left}%`,
          width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
          background: "white", borderRadius: "50%", opacity: 0.7,
          animation: `twinkle ${1.8 + (i % 3) * 0.5}s ease-in-out ${(i % 5) * 0.4}s infinite`,
        }} />
      ))}

      {/* 달 (밤/새벽) */}
      {showStars && (
        <div style={{
          position: "absolute", top: "7%", right: "14%",
          width: 44, height: 44, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 38%, #fffae0, #FFE48A)",
          boxShadow: "0 0 24px rgba(255,230,130,0.35)",
        }} />
      )}

      {/* 태양 (낮/일몰) */}
      {(mode === "day" || mode === "sunset" || mode === "dawn") && (
        <div style={{
          position: "absolute",
          top: mode === "day" ? "12%" : "35%",
          right: mode === "sunset" ? "10%" : "auto",
          left: mode === "dawn" ? "10%" : mode === "day" ? "50%" : "auto",
          transform: "translateX(-50%)",
          width: 52, height: 52, borderRadius: "50%",
          background: mode === "day"
            ? "radial-gradient(circle, #fffde0 28%, #ffe560 56%, #ffcc00 80%, transparent 100%)"
            : "radial-gradient(circle, #fff5c0 20%, #ffb830 50%, #ff6020 80%, transparent 100%)",
          boxShadow: mode === "day"
            ? "0 0 52px 26px rgba(255,220,60,0.45)"
            : "0 0 70px 36px rgba(255,140,30,0.42)",
        }} />
      )}

      {/* 활주로 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: RUNWAY_BG[mode],
      }}>
        {/* 중앙선 */}
        <div style={{
          position: "absolute", top: "30%", left: "5%", right: "5%", height: 3,
          background: "repeating-linear-gradient(90deg,#FFD700 0,#FFD700 24px,transparent 24px,transparent 48px)",
        }} />
        {/* 활주로 조명 */}
        {[...Array(11)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", bottom: 12, left: `${3 + i * 9}%`,
            width: 8, height: 8, borderRadius: "50%",
            background: i < 6 ? "#FFE066" : "#FF6B35",
            boxShadow: `0 0 10px ${i < 6 ? "rgba(255,224,102,0.9)" : "rgba(255,107,53,0.9)"}`,
          }} />
        ))}
      </div>

      {/* 비행기 (택싱 + 이륙) */}
      <div style={planeStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={planeImg} alt="" width={90} height={90}
          style={{
            display: "block",
            filter: "drop-shadow(0 5px 16px rgba(0,0,0,0.4))",
            animation: phase === 2 ? "taxiRoll 0.35s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* 지상 직원 */}
      <div style={{
        position: "absolute", bottom: "27%", left: "50%", marginLeft: -38,
        animation: "crewSlideUp 0.45s ease-out forwards",
        zIndex: 5,
      }}>
        <GroundCrew phase={phase} />
      </div>

      {/* 페이드 아웃 — 하늘과 같은 색으로 부드럽게 */}
      <div style={{
        position: "absolute", inset: 0, background: SKY_BG[mode],
        opacity: 0, pointerEvents: "none",
        animation: phase >= 3 ? "fadeToWhite 1.0s ease 2.4s forwards" : "none",
      }} />
    </div>
  );
}

function GroundCrew({ phase }: { phase: number }) {
  const armsSpread = phase >= 1;
  const waving    = phase >= 2;

  const leftArm: React.CSSProperties = {
    position: "absolute", top: 57, right: 55,
    width: 36, height: 7,
    background: "linear-gradient(90deg,#FF8C00,#FFA030)",
    borderRadius: "3px 2px 2px 3px",
    transformOrigin: "right center",
    transform: armsSpread ? "rotate(0deg)" : "rotate(82deg)",
    animation: waving ? "armWaveLeft 0.5s ease-in-out infinite" : "none",
    transition: waving ? "none" : "transform 0.75s cubic-bezier(0.34,1.56,0.64,1)",
  };
  const rightArm: React.CSSProperties = {
    position: "absolute", top: 57, left: 55,
    width: 36, height: 7,
    background: "linear-gradient(90deg,#FFA030,#FF8C00)",
    borderRadius: "2px 3px 3px 2px",
    transformOrigin: "left center",
    transform: armsSpread ? "rotate(0deg)" : "rotate(-82deg)",
    animation: waving ? "armWaveRight 0.5s ease-in-out infinite" : "none",
    transition: waving ? "none" : "transform 0.75s cubic-bezier(0.34,1.56,0.64,1)",
  };

  return (
    <div style={{ position: "relative", width: 76, height: 114 }}>
      <div style={{ position:"absolute", top:0, left:22, width:32, height:9, background:"#0A2463", borderRadius:"4px 4px 0 0" }} />
      <div style={{ position:"absolute", top:8, left:18, width:40, height:5, background:"#0A2463", borderRadius:2 }} />
      <div style={{
        position:"absolute", top:12, left:18,
        width:40, height:40, borderRadius:"50%",
        background:"radial-gradient(circle at 38% 34%, #FFCBA4, #E8A882)",
        boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
      }}>
        <div style={{ position:"absolute", top:14, left:9,  width:5, height:5, borderRadius:"50%", background:"#2a2a3e" }} />
        <div style={{ position:"absolute", top:14, left:26, width:5, height:5, borderRadius:"50%", background:"#2a2a3e" }} />
        <div style={{ position:"absolute", bottom:9, left:"50%", transform:"translateX(-50%)", width:14, height:7, borderBottom:"2.5px solid #b85c3a", borderRadius:"0 0 8px 8px" }} />
      </div>
      <div style={{
        position:"absolute", top:52, left:18,
        width:40, height:46,
        background:"linear-gradient(160deg,#FF8C00,#E06800)",
        borderRadius:"8px 8px 4px 4px",
        boxShadow:"0 4px 12px rgba(0,0,0,0.4)",
      }}>
        <div style={{ position:"absolute", top:10, left:0, right:0, height:3, background:"rgba(255,255,180,0.6)" }} />
        <div style={{ position:"absolute", top:22, left:0, right:0, height:3, background:"rgba(255,255,180,0.6)" }} />
      </div>
      <div style={leftArm}>
        <div style={{ position:"absolute", left:-4, top:-8, width:8, height:22, background:"linear-gradient(180deg,#FF5500,#FF3300)", borderRadius:4, boxShadow:"0 0 7px rgba(255,80,0,0.6)" }} />
      </div>
      <div style={rightArm}>
        <div style={{ position:"absolute", right:-4, top:-8, width:8, height:22, background:"linear-gradient(180deg,#FF3300,#FF5500)", borderRadius:4, boxShadow:"0 0 7px rgba(255,80,0,0.6)" }} />
      </div>
      <div style={{ position:"absolute", bottom:0, left:24, display:"flex", gap:6 }}>
        <div style={{ width:12, height:16, background:"#1A2F60", borderRadius:"2px 2px 4px 4px" }} />
        <div style={{ width:12, height: 16, background:"#1A2F60", borderRadius:"2px 2px 4px 4px" }} />
      </div>
    </div>
  );
}
