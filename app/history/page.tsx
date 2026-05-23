"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LogEntry {
  date: string;
  input: string;
  ruinScore: number;
  recoverScore: number;
  successCriteria: string;
  actions: { title: string }[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("resetLog");
    if (raw) setLog(JSON.parse(raw));
  }, []);

  function clearLog() {
    if (confirm("기록을 전부 삭제할까요?")) {
      localStorage.removeItem("resetLog");
      setLog([]);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 13, color: "#ff6b35", fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>
            RESET PILOT
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900 }}>📅 복구 기록</h1>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{ background: "transparent", border: "none", color: "#555", fontSize: 13, cursor: "pointer" }}
        >
          ← 홈
        </button>
      </div>

      {log.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#555" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div>아직 기록이 없어요.</div>
          <button
            onClick={() => router.push("/")}
            className="btn-primary"
            style={{ marginTop: 24, maxWidth: 200, margin: "24px auto 0" }}
          >
            첫 복구 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* 통계 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <StatCard
              label="총 기록"
              value={`${log.length}일`}
              color="#ff6b35"
            />
            <StatCard
              label="평균 망함"
              value={`${Math.round(log.reduce((s, l) => s + l.ruinScore, 0) / log.length)}%`}
              color="#ef4444"
            />
            <StatCard
              label="평균 회복"
              value={`${Math.round(log.reduce((s, l) => s + l.recoverScore, 0) / log.length)}%`}
              color="#2ec4b6"
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {log.map((entry, i) => (
              <div key={i} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#888" }}>{entry.date}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#ef4444" }}>망함 {entry.ruinScore}%</span>
                    <span style={{ fontSize: 12, color: "#2ec4b6" }}>회복 {entry.recoverScore}%</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 8, lineHeight: 1.5 }}>
                  {entry.input.length > 80 ? entry.input.slice(0, 80) + "..." : entry.input}
                </div>
                {entry.actions?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {entry.actions.slice(0, 3).map((a, j) => (
                      <span key={j} style={{
                        fontSize: 11,
                        background: "#1a1a1a",
                        border: "1px solid #2a2a2a",
                        borderRadius: 20,
                        padding: "2px 10px",
                        color: "#888",
                      }}>
                        {a.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={clearLog}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "12px",
              background: "transparent",
              border: "1px solid #2a2a2a",
              borderRadius: 12,
              color: "#555",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            기록 전체 삭제
          </button>
        </>
      )}
    </main>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card" style={{ textAlign: "center", padding: "12px 8px" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{label}</div>
    </div>
  );
}
