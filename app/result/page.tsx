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

const MODE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  "Crash Mode": { color: "#E53935", bg: "#FFF5F5", border: "#FFCDD2", icon: "🆘", label: "비상" },
  "Drift Mode": { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: "🌊", label: "표류" },
  "Launch Mode": { color: "#1DB4A8", bg: "#F0FDFC", border: "#99F6E4", icon: "🚀", label: "발사 준비" },
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
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span className="flight-tag">✈️ RESET REPORT</span>
        <button onClick={() => router.push("/")} style={{ background: "transparent", border: "none", color: "#A0A8C0", fontSize: 13, cursor: "pointer" }}>
          ← 다시 입력
        </button>
      </div>

      {/* 모드 카드 (네이비 배경) */}
      <div className="card-navy animate-fadeInUp" style={{ marginBottom: 16, position: "relative", overflow: "hidden" }}>
        {/* 배경 장식 */}
        <div style={{
          position: "absolute", right: -20, top: -20,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", right: 20, bottom: -30,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                background: modeStyle.bg, color: modeStyle.color,
                border: `1px solid ${modeStyle.border}`,
                fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
              }}>
                {modeStyle.icon} {mode}
              </span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6, maxWidth: 280 }}>
              {result.modeDesc}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="gauge" style={{ fontSize: 44, fontWeight: 900, color: modeStyle.color, lineHeight: 1 }}>
              {result.ruinScore}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>RUIN SCORE</div>
          </div>
        </div>

        {/* 점수 바 */}
        <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <ScoreMini label="지금" score={result.scoreBefore} color="#E53935" />
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${result.scoreAfter}%`,
              background: "linear-gradient(90deg, #E53935, #1DB4A8)",
              borderRadius: 3,
            }} />
          </div>
          <ScoreMini label="복구 후" score={result.scoreAfter} color="#1DB4A8" />
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6, textAlign: "center" }}>
          목표는 100점이 아니야 — 0점만 피하면 돼
        </div>
      </div>

      {/* 착륙 목표 */}
      <div className="card animate-fadeInUp animate-delay-1" style={{ marginBottom: 14, borderLeft: `3px solid ${modeStyle.color}` }}>
        <div style={{ fontSize: 11, color: "#A0A8C0", marginBottom: 4, letterSpacing: 1 }}>🎯 TODAY&apos;S LANDING GOAL</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1F36" }}>{result.recoveryGoal}</div>
      </div>

      {/* 감정 vs 사실 */}
      <div className="card animate-fadeInUp animate-delay-1" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#A0A8C0", marginBottom: 12, letterSpacing: 1 }}>🧠 REALITY CHECK</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "10px 14px", background: "#FFF5F5", borderRadius: 10, border: "1px solid #FFCDD2" }}>
            <div style={{ fontSize: 10, color: "#E53935", fontWeight: 700, marginBottom: 3 }}>감정 문장</div>
            <div style={{ fontSize: 13, color: "#6B7494", fontStyle: "italic" }}>"{result.emotionFact.emotion}"</div>
          </div>
          <div className="runway-divider">AI 분석</div>
          <div style={{ padding: "10px 14px", background: "#F0FDFC", borderRadius: 10, border: "1px solid #99F6E4" }}>
            <div style={{ fontSize: 10, color: "#1DB4A8", fontWeight: 700, marginBottom: 3 }}>사실 문장</div>
            <div style={{ fontSize: 13, color: "#1A1F36" }}>{result.emotionFact.fact}</div>
          </div>
          {result.emotionFact.interpret && (
            <div style={{ fontSize: 12, color: "#6B7494", padding: "8px 12px", background: "#F0F2F7", borderRadius: 8 }}>
              💡 {result.emotionFact.interpret}
            </div>
          )}
        </div>
      </div>

      {/* 3단계 복구 루트 */}
      <div className="card animate-fadeInUp animate-delay-2" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: "#A0A8C0", letterSpacing: 1 }}>⚡ 3-STEP RECOVERY ROUTE</div>
          <div style={{ fontSize: 12, color: allDone ? "#1DB4A8" : "#A0A8C0", fontWeight: 700 }}>
            {allDone ? "🛬 착륙 완료!" : `${progress}%`}
          </div>
        </div>

        {/* 진행 바 */}
        <div style={{ height: 4, background: "#E2E6F0", borderRadius: 2, marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#1DB4A8", borderRadius: 2, transition: "width 0.3s" }} />
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
                padding: "14px",
                background: checked[i] ? "#F0FDFC" : "#FAFBFF",
                borderRadius: 12,
                border: "1.5px solid",
                borderColor: checked[i] ? "#1DB4A8" : "#E2E6F0",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                    background: checked[i] ? "#1DB4A8" : "#E2E6F0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 900, color: checked[i] ? "white" : "#A0A8C0",
                    transition: "all 0.2s",
                  }}>
                    {checked[i] ? "✓" : i + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#FF6B35", fontWeight: 700, marginBottom: 2 }}>{action.name}</div>
                    <div style={{
                      fontWeight: 700, fontSize: 14,
                      textDecoration: checked[i] ? "line-through" : "none",
                      color: checked[i] ? "#A0A8C0" : "#1A1F36",
                    }}>
                      {action.title}
                    </div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, color: "#FF6B35",
                  background: "#FFF5F0", border: "1px solid #FFCBA4",
                  padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 8,
                }}>
                  {action.duration}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#A0A8C0", marginTop: 6, marginLeft: 38 }}>
                {action.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘 버려도 되는 것 */}
      <div className="card animate-fadeInUp animate-delay-3" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#A0A8C0", marginBottom: 10, letterSpacing: 1 }}>🗑️ DISCARD TODAY</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {result.skip.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: "#A0A8C0", display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#E2E6F0", fontSize: 16 }}>✕</span>
              <span style={{ textDecoration: "line-through" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 성공 기준 */}
      <div className="card-navy animate-fadeInUp animate-delay-4" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: 1 }}>🏁 SUCCESS CRITERIA</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "white", lineHeight: 1.6 }}>{result.successCriteria}</div>
        <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>{result.message}</div>
      </div>

      <button className="btn-primary animate-fadeInUp animate-delay-5" onClick={() => router.push("/")}>
        {allDone ? "🛬 오늘도 착륙 성공! 내일도 ㄱ" : "✈️ 다시 입력하기"}
      </button>

      <button className="btn-ghost" style={{ marginTop: 10 }} onClick={() => router.push("/history")}>
        📦 블랙박스 보기
      </button>
    </main>
  );
}

function ScoreMini({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div style={{ textAlign: "center", minWidth: 48 }}>
      <div className="gauge" style={{ fontSize: 22, fontWeight: 900, color }}>{score}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{label}</div>
    </div>
  );
}
