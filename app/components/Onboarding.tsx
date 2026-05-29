"use client";

import { useState } from "react";

const SLIDES = [
  {
    emoji: "✈️",
    title: "오늘 망했어도 괜찮아요",
    desc: "하루가 완전히 무너진 것 같을 때,\n0점으로 끝내지 않도록 도와드릴게요.",
    sub: "Reset Pilot은 '완벽한 하루'가 아니라\n'0점만 피하는 하루'를 목표로 해요.",
  },
  {
    emoji: "🧠",
    title: "지금 상태를 말해주세요",
    desc: "무슨 일이 있었는지, 에너지가 얼마나 남았는지\n간단히 알려주면 돼요.",
    sub: "AI가 지금 당장 할 수 있는\n가장 작은 행동 3개를 골라줄게요.",
  },
  {
    emoji: "🛬",
    title: "작게 시작해서 착륙하세요",
    desc: "전부 해결하려 하지 않아도 돼요.\n딱 하나만 해도 오늘은 0점이 아니에요.",
    sub: "쌓인 기록이 많아질수록\n나에게 맞는 복구 패턴이 선명해져요.",
  },
];

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "linear-gradient(180deg, #010d20 0%, #021830 60%, #041c3e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "40px 28px",
    }}>
      {/* 진행 점 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 40 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
            background: i === idx ? "#1DB4A8" : "rgba(255,255,255,0.2)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* 이모지 */}
      <div style={{ fontSize: 72, marginBottom: 24, lineHeight: 1 }}>{slide.emoji}</div>

      {/* 텍스트 */}
      <div style={{ textAlign: "center", maxWidth: 320, marginBottom: 32 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 14, lineHeight: 1.35 }}>
          {slide.title}
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 12, whiteSpace: "pre-line" }}>
          {slide.desc}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, whiteSpace: "pre-line" }}>
          {slide.sub}
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ width: "100%", maxWidth: 320 }}>
        <button
          onClick={() => isLast ? onDone() : setIdx(i => i + 1)}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #1DB4A8, #0a8a80)",
            color: "white", fontSize: 16, fontWeight: 900,
            boxShadow: "0 8px 24px rgba(29,180,168,0.4)",
          }}
        >
          {isLast ? "✈️ 시작하기" : "다음 →"}
        </button>
        {!isLast && (
          <button onClick={onDone} style={{ width: "100%", marginTop: 10, padding: "12px", background: "none", border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13, cursor: "pointer" }}>
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
