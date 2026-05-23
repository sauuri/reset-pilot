"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Action {
  name: string;
  title: string;
  duration: string;
  reason: string;
}

interface ResetResult {
  mode: string;
  modeDesc: string;
  ruinScore: number;
  scoreBefore: number;
  scoreAfter: number;
  emotionFact: { emotion: string; fact: string; interpret: string };
  recoveryGoal: string;
  actions: Action[];
  skip: string[];
  successCriteria: string;
  message: string;
}

const MODE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  "Crash Mode": { color: "#ef4444", bg: "#2a1515", icon: "🆘" },
  "Drift Mode": { color: "#f97316", bg: "#2a1a0a", icon: "🌊" },
  "Launch Mode": { color: "#2ec4b6", bg: "#0f2a20", icon: "🚀" },
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResetResult | null>(null);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const raw = localStorage.getItem("resetResult");
    if (!raw) { router.push("/"); return; }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) return null;

  const mode = result.mode || "Crash Mode";
  const modeStyle = MODE_CONFIG[mode] ?? MODE_CONFIG["Crash Mode"];
  const allDone = checked.every(Boolean);
  const progress = Math.round((checked.filter(Boolean).length / 3) * 100);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#ff6b35", fontWeight: 700, letterSpacing: 2 }}>RESET PILOT</div>
        <button onClick={() => router.push("/")} style={{ background: "transparent", border: "none", color: "#555", fontSize: 13, cursor: "pointer" }}>
          ← 다시 입력
        </button>
      </div>

      {/* 모드 배지 */}
      <div className="animate-fadeInUp" style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: modeStyle.bg, border: `1px solid ${modeStyle.color}`,
        borderRadius: 20, padding: "6px 16px", marginBottom: 16,
      }}>
        <span>{modeStyle.icon}</span>
        <span style={{ fontWeight: 800, color: modeStyle.color, fontSize: 14 }}>{mode}</span>
      </div>

      {/* 모드 설명 */}
      <div className="animate-fadeInUp" style={{ fontSize: 14, color: "#aaa", marginBottom: 20, lineHeight: 1.6 }}>
        {result.modeDesc}
      </div>

      {/* 점수 시각화 */}
      <div className="card animate-fadeInUp animate-delay-1" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>📊 오늘의 복구 시뮬레이션</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <ScoreBar label="지금" score={result.scoreBefore} color="#ef4444" />
          <span style={{ fontSize: 20, color: "#555" }}>→</span>
          <ScoreBar label="복구 후" score={result.scoreAfter} color="#2ec4b6" />
        </div>
        <div style={{ fontSize: 12, color: "#666", textAlign: "center" }}>
          목표는 100점이 아니야. <strong style={{ color: "#f0f0f0" }}>0점만 피하면 돼.</strong>
        </div>
      </div>

      {/* 착륙 목표 */}
      <div className="card animate-fadeInUp animate-delay-1" style={{ marginBottom: 16, borderColor: modeStyle.color }}>
        <div style={{ fontSize: 12, color: modeStyle.color, marginBottom: 6 }}>🎯 오늘의 착륙 목표</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{result.recoveryGoal}</div>
      </div>

      {/* 감정 vs 사실 */}
      <div className="card animate-fadeInUp animate-delay-2" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>🧠 현실 왜곡 감지</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "10px 14px", background: "#2a1515", borderRadius: 8, borderLeft: "3px solid #ef4444" }}>
            <span style={{ fontSize: 11, color: "#ef4444" }}>감정 문장</span>
            <div style={{ fontSize: 14, marginTop: 4, fontStyle: "italic", color: "#ccc" }}>"{result.emotionFact.emotion}"</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 14, color: "#444" }}>AI 분석 ↓</div>
          <div style={{ padding: "10px 14px", background: "#0f2a1f", borderRadius: 8, borderLeft: "3px solid #2ec4b6" }}>
            <span style={{ fontSize: 11, color: "#2ec4b6" }}>사실 문장</span>
            <div style={{ fontSize: 14, marginTop: 4 }}>{result.emotionFact.fact}</div>
          </div>
          {result.emotionFact.interpret && (
            <div style={{ fontSize: 12, color: "#666", padding: "8px 12px", background: "#111", borderRadius: 8 }}>
              💡 {result.emotionFact.interpret}
            </div>
          )}
        </div>
      </div>

      {/* 3단계 복구 루트 */}
      <div className="card animate-fadeInUp animate-delay-3" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#888" }}>⚡ 3-Step Recovery Route</div>
          {allDone
            ? <span style={{ fontSize: 12, color: "#2ec4b6", fontWeight: 700 }}>🛬 착륙 완료!</span>
            : <span style={{ fontSize: 12, color: "#555" }}>{progress}% 완료</span>
          }
        </div>

        {/* 진행 바 */}
        <div style={{ height: 4, background: "#2a2a2a", borderRadius: 2, marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#2ec4b6", borderRadius: 2, transition: "width 0.3s" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {result.actions.map((action, i) => (
            <div
              key={i}
              onClick={() => {
                const next = [...checked];
                next[i] = !next[i];
                setChecked(next);
              }}
              style={{
                padding: "12px 14px",
                background: checked[i] ? "#0f2a1f" : "#111",
                borderRadius: 10,
                border: "1px solid",
                borderColor: checked[i] ? "#2ec4b6" : "#2a2a2a",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{checked[i] ? "✅" : `${i + 1}.`}</span>
                  <div>
                    <div style={{ fontSize: 10, color: "#ff6b35", marginBottom: 2 }}>{action.name}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, textDecoration: checked[i] ? "line-through" : "none", color: checked[i] ? "#666" : "#f0f0f0" }}>
                      {action.title}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#ff6b35", background: "#2a1500", padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                  {action.duration}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 6, marginLeft: 26 }}>
                {action.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘 버려도 되는 것 */}
      <div className="card animate-fadeInUp animate-delay-4" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>🗑️ 오늘 버려도 되는 것</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {result.skip.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: "#555", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#333" }}>✕</span>
              <span style={{ textDecoration: "line-through" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 성공 기준 */}
      <div className="card animate-fadeInUp animate-delay-4" style={{ marginBottom: 16, borderColor: "#2ec4b6" }}>
        <div style={{ fontSize: 12, color: "#2ec4b6", marginBottom: 8 }}>🏁 오늘의 성공 기준</div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.6 }}>{result.successCriteria}</div>
      </div>

      {/* 위로 메시지 */}
      <div style={{ textAlign: "center", fontSize: 13, color: "#555", marginBottom: 20, fontStyle: "italic" }}>
        {result.message}
      </div>

      <button className="btn-primary animate-fadeInUp animate-delay-5" onClick={() => router.push("/")}>
        {allDone ? "🛬 오늘도 착륙 성공! 내일도 ㄱ" : "다시 입력하기"}
      </button>

      <button
        onClick={() => router.push("/history")}
        style={{ marginTop: 12, width: "100%", background: "transparent", border: "none", color: "#555", fontSize: 13, cursor: "pointer" }}
      >
        📦 블랙박스 보기
      </button>
    </main>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 900, color }}>{score}</div>
      <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>{label}</div>
      <div style={{ height: 6, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 3, transition: "width 0.5s" }} />
      </div>
    </div>
  );
}
