"use client";
import { useEffect, useState } from "react";
import { getSkyMode, SKY_BG, RUNWAY_BG } from "../utils/skyTheme";
import { playLanding, playBadge } from "../utils/sounds";
import { useLang } from "../utils/LangContext";
import { t } from "../utils/i18n";

const STARS: [number, number][] = [
  [8,12],[13,78],[22,88],[6,45],[18,23],[30,67],[10,90],
  [25,5],[35,55],[5,35],[15,52],[28,80],[40,15],[32,38],[20,95],
];

export default function LandingAnimation({ onDone, completedCount = 3 }: { onDone: () => void; completedCount?: number }) {
  const [phase, setPhase] = useState(0);
  // 0: 직원 대기  1: 비행기 강하  2: 착지 통통  3: 택시  4: 포옹/환호  완료

  const { lang } = useLang();
  const tr = t(lang);
  const mode = getSkyMode(new Date().getHours());
  const showStars = mode === "night" || mode === "dawn";

  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => { setPhase(2); playLanding(); }, 1900),
      setTimeout(() => setPhase(3), 3300),
    ];
    if (completedCount >= 2) {
      t.push(setTimeout(() => { setPhase(4); playBadge(); }, 4400));
      t.push(setTimeout(onDone, 7700));  // 멘트 표시 후 1.5초 더 대기
    } else {
      t.push(setTimeout(onDone, 6500));
    }
    return () => t.forEach(clearTimeout);
  }, [onDone, completedCount]);

  // 비행기 outer wrapper 위치 (position 전환)
  // count=3: phase4에서 left:30%로 더 접근 (포옹). count<=2: left:34% 유지
  const phase4Left = completedCount === 3 ? "36%" : "40%";
  const planeLeft   = phase <= 1 ? "76%" : phase === 2 ? "76%" : phase === 3 ? "42%" : phase4Left;
  const planeBottom = phase === 0 ? "88%" : "28%";
  const planeTrans  = phase === 1
    ? "bottom 1.4s cubic-bezier(0.4,0,0.2,1), left 1.4s ease-out"
    : phase === 3
    ? "left 1s cubic-bezier(0.4,0,0.2,1)"
    : phase === 4
    ? "left 0.4s ease-out"
    : "none";

  // count=3: lean toward crew / count<=2: 그냥 수평
  const planeImgTransform = (phase >= 4 && completedCount === 3) ? "rotate(8deg) scale(1.08)" : phase === 1 ? "rotate(-8deg)" : "rotate(0deg)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9500,
      background: SKY_BG[mode], overflow: "hidden",
    }}>
      {/* 별 */}
      {showStars && STARS.map(([top, left], i) => (
        <div key={i} style={{
          position: "absolute", top: `${top}%`, left: `${left}%`,
          width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
          background: "white", borderRadius: "50%", opacity: 0.7,
          animation: `twinkle ${1.8 + (i % 3) * 0.5}s ease-in-out ${(i % 5) * 0.4}s infinite`,
        }} />
      ))}

      {/* 달 / 태양 */}
      {showStars ? (
        <div style={{
          position: "absolute", top: "7%", right: "14%",
          width: 44, height: 44, borderRadius: "50%",
          background: "radial-gradient(circle at 38% 38%, #fffae0, #FFE48A)",
          boxShadow: "0 0 24px rgba(255,230,130,0.35)",
        }} />
      ) : (
        <div style={{
          position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)",
          width: 52, height: 52, borderRadius: "50%",
          background: "radial-gradient(circle, #fffde0 28%, #ffe560 56%, #ffcc00 80%, transparent 100%)",
          boxShadow: "0 0 52px 26px rgba(255,220,60,0.45)",
        }} />
      )}

      {/* 활주로 */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: RUNWAY_BG[mode],
      }}>
        <div style={{
          position: "absolute", top: "28%", left: "5%", right: "5%", height: 3,
          background: "repeating-linear-gradient(90deg,#FFD700 0,#FFD700 24px,transparent 24px,transparent 48px)",
        }} />
        {[...Array(11)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", bottom: 12, left: `${3 + i * 9}%`,
            width: 8, height: 8, borderRadius: "50%",
            background: i < 6 ? "#FFE066" : "#FF6B35",
            boxShadow: `0 0 10px ${i < 6 ? "rgba(255,224,102,0.9)" : "rgba(255,107,53,0.9)"}`,
          }} />
        ))}
      </div>

      {/* 비행기 */}
      <div style={{
        position: "absolute",
        bottom: planeBottom,
        left: planeLeft,
        transform: "translateX(-50%)",
        transition: planeTrans,
        zIndex: 6,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pilot-fly.png" alt="" width={88} height={88} style={{
          display: "block",
          filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.4))",
          transform: phase === 2 ? undefined : planeImgTransform,
          transition: phase === 2 ? "none" : "transform 0.4s ease",
          animation: phase === 2 ? "landingBounce 1.3s ease-out forwards" : "none",
        }} />
      </div>

      {/* 착지 연기 */}
      {phase >= 2 && phase <= 3 && (
        <div style={{
          position: "absolute", bottom: "29%", left: "76%",
          transform: "translateX(-50%)",
          display: "flex", gap: 6,
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 12 + i * 5, height: 12 + i * 5,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.5)",
              filter: "blur(3px)",
              animation: `puffUp 0.8s ease-out ${i * 0.1}s forwards`,
            }} />
          ))}
        </div>
      )}

      {/* 이모지 (count별) */}
      {phase >= 4 && (
        <div style={{
          position: "absolute", bottom: "46%", left: "34%",
          transform: "translateX(-50%)",
          fontSize: 28, zIndex: 10,
          animation: "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}>
          {completedCount === 3 ? "❤️" : completedCount === 2 ? "🎉" : "✨"}
        </div>
      )}

      {/* 완료 메시지 — 포지션 래퍼와 애니메이션 래퍼 분리 */}
      {phase >= 4 && (
        <div style={{
          position: "absolute", top: "18%", left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center", zIndex: 10,
          width: "80%",
        }}>
          <div style={{ animation: "fadeInUp 0.5s ease 0.3s both" }}>
            <div style={{
              fontSize: 15, fontWeight: 900, color: "white",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              background: "rgba(10,36,99,0.88)",
              backdropFilter: "blur(16px)",
              padding: "16px 20px", borderRadius: 16,
              lineHeight: 1.8, textAlign: "center",
            }}>
              {tr.landingMsg1}<br />
              {tr.landingMsg2}<br />
              <span style={{ color: "#6ee7e0" }}>{tr.landingMsg3}</span>
            </div>
          </div>
        </div>
      )}

      {/* 지상 직원 — 왼쪽 고정 */}
      <div style={{
        position: "absolute", bottom: "27%", left: "22%",
        marginLeft: -38,
        animation: "crewSlideUp 0.4s ease-out forwards",
        zIndex: 5,
      }}>
        <GroundCrew phase={phase} completedCount={completedCount} />
      </div>

      {/* 페이드 아웃 */}
      <div style={{
        position: "absolute", inset: 0, background: "white",
        opacity: 0, pointerEvents: "none",
        animation: phase >= 4 ? "fadeToWhite 1.2s ease 3.2s forwards" : "none",
      }} />
    </div>
  );
}

function GroundCrew({ phase, completedCount = 3 }: { phase: number; completedCount?: number }) {
  const active = phase >= 4;
  // count=3: 포옹 (오른팔 감싸기 + 왼팔 환호)
  // count=2: 양팔 환호 (위로 들기)
  // count=1: 한 팔만 살짝 들기
  const hugging   = active && completedCount === 3;
  const cheering  = active && completedCount === 2;
  const waving    = active && completedCount === 1;

  const leftArm: React.CSSProperties = {
    position: "absolute", top: 57, right: 55,
    width: 36, height: 7,
    background: "linear-gradient(90deg,#FF8C00,#FFA030)",
    borderRadius: "3px 2px 2px 3px",
    transformOrigin: "right center",
    transform: hugging
      ? "rotate(-55deg)"
      : (cheering || waving)
      ? "rotate(-60deg)"
      : "rotate(0deg)",
    animation: (hugging || cheering) ? "armCelebLeft 0.45s ease-in-out infinite alternate" : "none",
    transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
  };
  const rightArm: React.CSSProperties = {
    position: "absolute", top: 57, left: 55,
    width: 36, height: 7,
    background: "linear-gradient(90deg,#FFA030,#FF8C00)",
    borderRadius: "2px 3px 3px 2px",
    transformOrigin: "left center",
    transform: hugging
      ? "rotate(-45deg)"
      : cheering
      ? "rotate(-60deg)"
      : "rotate(0deg)",
    animation: cheering ? "armCelebLeft 0.45s ease-in-out 0.1s infinite alternate" : "none",
    transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
  };

  return (
    <div style={{ position: "relative", width: 76, height: 114 }}>
      <div style={{ position:"absolute", top:0, left:22, width:32, height:9, background:"#0A2463", borderRadius:"4px 4px 0 0" }} />
      <div style={{ position:"absolute", top:8, left:18, width:40, height:5, background:"#0A2463", borderRadius:2 }} />
      <div style={{
        position:"absolute", top:12, left:18, width:40, height:40, borderRadius:"50%",
        background:"radial-gradient(circle at 38% 34%, #FFCBA4, #E8A882)",
        boxShadow:"0 3px 8px rgba(0,0,0,0.3)",
        transition: "transform 0.3s",
        transform: (hugging || cheering) ? "scale(1.1)" : "scale(1)",
      }}>
        <div style={{ position:"absolute", top:14, left:9,  width:5, height:5, borderRadius:"50%", background:"#2a2a3e" }} />
        <div style={{ position:"absolute", top:14, left:26, width:5, height:5, borderRadius:"50%", background:"#2a2a3e" }} />
        <div style={{
          position:"absolute", bottom: (hugging || cheering) ? 6 : 9, left:"50%",
          transform:"translateX(-50%)",
          width: (hugging || cheering) ? 20 : waving ? 16 : 14,
          height: (hugging || cheering) ? 11 : waving ? 8 : 7,
          borderBottom:`2.5px solid #b85c3a`,
          borderRadius:"0 0 10px 10px",
          transition:"all 0.3s",
        }} />
      </div>
      <div style={{
        position:"absolute", top:52, left:18, width:40, height:46,
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
        <div style={{ width:12, height:16, background:"#1A2F60", borderRadius:"2px 2px 4px 4px" }} />
      </div>
    </div>
  );
}
