"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Action {
  title: string;
  duration: string;
  reason: string;
}

interface ResetResult {
  ruinScore: number;
  recoverScore: number;
  emotionFact: { emotion: string; fact: string };
  actions: Action[];
  skip: string[];
  successCriteria: string;
  message: string;
}

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

  const ruinColor = result.ruinScore >= 80 ? "#ef4444" : result.ruinScore >= 50 ? "#f97316" : "#ffd60a";
  const allDone = checked.every(Boolean);

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#ff6b35", fontWeight: 700, letterSpacing: 2 }}>RESET PILOT</div>
        <button
          onClick={() => router.push("/")}
          style={{ background: "transparent", border: "none", color: "#555", fontSize: 13, cursor: "pointer" }}
        >
          ← 다시 입력
        </button>
      </div>

      {/* 망함 게이지 */}
      <div className="card animate-fadeInUp" style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>오늘의 망함 지수</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: ruinColor, lineHeight: 1 }}>
          {result.ruinScore}%
        </div>
        <div style={{ fontSize: 13, color: "#888", marginTop: 8 }}>
          회복 가능성{" "}
          <span style={{ color: "#2ec4b6", fontWeight: 700 }}>{result.recoverScore}%</span>
        </div>
        <div style={{
          marginTop: 12,
          padding: "8px 16px",
          background: "#0f0f0f",
          borderRadius: 8,
          fontSize: 14,
          color: "#f0f0f0",
        }}>
          {result.message}
        </div>
      </div>

      {/* 현실 왜곡 감지 */}
      <div className="card animate-fadeInUp animate-delay-1" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>🧠 현실 왜곡 감지</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ padding: "10px 14px", background: "#2a1515", borderRadius: 8, borderLeft: "3px solid #ef4444" }}>
            <span style={{ fontSize: 11, color: "#ef4444" }}>감정</span>
            <div style={{ fontSize: 14, marginTop: 4 }}>{result.emotionFact.emotion}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 16 }}>↓</div>
          <div style={{ padding: "10px 14px", background: "#0f2a1f", borderRadius: 8, borderLeft: "3px solid #2ec4b6" }}>
            <span style={{ fontSize: 11, color: "#2ec4b6" }}>사실</span>
            <div style={{ fontSize: 14, marginTop: 4 }}>{result.emotionFact.fact}</div>
          </div>
        </div>
      </div>

      {/* 복구 행동 3개 */}
      <div className="card animate-fadeInUp animate-delay-2" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          ⚡ 지금 당장 이것만 해
          {allDone && <span style={{ color: "#2ec4b6", marginLeft: 8 }}>✓ 오늘 안 망함!</span>}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{checked[i] ? "✅" : `${i + 1}.`}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, textDecoration: checked[i] ? "line-through" : "none", color: checked[i] ? "#888" : "#f0f0f0" }}>
                    {action.title}
                  </span>
                </div>
                <span style={{ fontSize: 12, color: "#ff6b35", background: "#2a1500", padding: "2px 8px", borderRadius: 20 }}>
                  {action.duration}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 4, marginLeft: 26 }}>
                {action.reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘 버려도 되는 것 */}
      <div className="card animate-fadeInUp animate-delay-3" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>🗑️ 오늘 버려도 되는 것</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {result.skip.map((s, i) => (
            <div key={i} style={{ fontSize: 14, color: "#666", display: "flex", gap: 8 }}>
              <span>✕</span><span style={{ textDecoration: "line-through" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 오늘의 성공 기준 */}
      <div className="card animate-fadeInUp animate-delay-4" style={{ marginBottom: 24, borderColor: "#2ec4b6" }}>
        <div style={{ fontSize: 12, color: "#2ec4b6", marginBottom: 8 }}>🎯 오늘의 성공 기준</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.5 }}>
          {result.successCriteria}
        </div>
      </div>

      <button className="btn-primary animate-fadeInUp animate-delay-5" onClick={() => router.push("/")}>
        오늘도 안 망함 🔥 다시 시작하기
      </button>
    </main>
  );
}
