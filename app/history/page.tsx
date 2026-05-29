"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLogsFromSupabase } from "../utils/logs";

interface LogEntry {
  date: string;
  input: string;
  ruinScore: number;
  recoverScore: number;
  successCriteria: string;
  actions: { title: string }[];
  mode?: string;
  energy?: number;
  anxiety?: number;
  completedCount?: number;
  completedActions?: string[];
  moodAfter?: "better" | "same" | "worse" | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    loadLogsFromSupabase().then((remote) => {
      if (remote && remote.length > 0) {
        setLog(remote as unknown as LogEntry[]);
      } else {
        const raw = localStorage.getItem("resetLog");
        if (raw) setLog(JSON.parse(raw));
      }
    });
  }, []);

  function clearLog() {
    if (confirm("기록을 전부 삭제할까요?")) {
      localStorage.removeItem("resetLog");
      setLog([]);
    }
  }

  function deleteEntry(i: number) {
    const next = log.filter((_, idx) => idx !== i);
    setLog(next);
    localStorage.setItem("resetLog", JSON.stringify(next));
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "calc(32px + env(safe-area-inset-top, 0px)) 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <span className="flight-tag" style={{ marginBottom: 8, display: "inline-flex" }}>✈️ RESET PILOT</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 8, textShadow: "0 2px 8px rgba(10,36,99,0.25)" }}>
            📋 복구 기록
          </h1>
        </div>
        <button
          onClick={() => router.push("/")}
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          ← 홈
        </button>
      </div>

      {log.length >= 3 && (
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => router.push("/insights")}
            style={{
              width: "100%", padding: "12px 20px", borderRadius: 12,
              background: "linear-gradient(135deg, #0A2463 0%, #163678 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            📊 패턴 분석 보기
          </button>
        </div>
      )}

      {log.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: 700 }}>아직 기록이 없어요.</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 28 }}>복구 플랜을 한 번 써보면 여기 쌓여요.</div>
          <button onClick={() => router.push("/")} className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }}>
            첫 복구 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* 통계 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <StatCard label="총 기록" value={`${log.length}일`}     color="#FF6B35" />
            <StatCard label="평균 부담도" value={`${Math.round(log.reduce((s, l) => s + (l.ruinScore ?? 0), 0) / log.length)}%`} color="#E53935" />
            <StatCard label="평균 회복" value={`${Math.round(log.reduce((s, l) => s + (l.recoverScore ?? 0), 0) / log.length)}%`} color="#1DB4A8" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {log.map((entry, i) => (
              <div key={i} className="ticket">
                <div className="ticket-body" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#7facca", fontWeight: 600 }}>{entry.date}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        onClick={() => deleteEntry(i)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          fontSize: 15, color: "rgba(165,210,238,0.5)",
                          padding: "2px 4px", lineHeight: 1,
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#E53935")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(165,210,238,0.5)")}
                        title="이 기록 삭제"
                      >✕</button>
                      <span style={{ fontSize: 11, color: "#E53935", fontWeight: 700 }}>부담 {entry.ruinScore ?? "?"}%</span>
                      <span style={{ fontSize: 11, color: "#1DB4A8", fontWeight: 700 }}>회복 {entry.recoverScore ?? "?"}%</span>
                      {entry.completedCount !== undefined && (
                        <span style={{ fontSize: 11, color: "#F59E0B", fontWeight: 700 }}>✓ {entry.completedCount}/3</span>
                      )}
                      {entry.moodAfter && (
                        <span style={{ fontSize: 13 }}>
                          {entry.moodAfter === "better" ? "😊" : entry.moodAfter === "same" ? "😐" : "😔"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#4e6e82", marginBottom: 10, lineHeight: 1.55 }}>
                    {entry.input && (entry.input.length > 80 ? entry.input.slice(0, 80) + "…" : entry.input)}
                  </div>
                  {entry.actions?.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {entry.actions.slice(0, 3).map((a, j) => (
                        <span key={j} style={{
                          fontSize: 11, fontWeight: 600,
                          background: "rgba(29,180,168,0.1)",
                          border: "1px solid rgba(29,180,168,0.3)",
                          borderRadius: 20, padding: "3px 10px",
                          color: "#1DB4A8",
                        }}>
                          {a.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={clearLog}
            className="btn-ghost"
            style={{ marginTop: 24 }}
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
    <div className="ticket">
      <div className="ticket-body" style={{ textAlign: "center", padding: "14px 8px" }}>
        <div className="gauge" style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
        <div style={{ fontSize: 11, color: "#7facca", marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}
