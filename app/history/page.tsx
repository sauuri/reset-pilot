"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadLogsFromSupabase, deleteLogsFromSupabase } from "../utils/logs";
import { getCurrentBadge, getNextBadge, BADGES } from "../utils/badges";
import { useLang } from "../utils/LangContext";
import { t, T } from "../utils/i18n";

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
  journal?: string;
  _id?: string;
  ts?: number;
}

function parseLogDate(dateStr: string): string {
  const parts = dateStr.replace(/\.\s*/g, "-").replace(/-$/, "").split("-").map(s => s.trim().padStart(2, "0"));
  return parts.join("-");
}

function CalendarView({ log, tr }: { log: LogEntry[]; tr: T }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const dateMap: Record<string, "better" | "same" | "worse" | "none"> = {};
  log.forEach(e => {
    try { dateMap[parseLogDate(e.date)] = e.moodAfter ?? "none"; } catch { /* skip */ }
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const moodColor: Record<string, string> = { better: "#1DB4A8", same: "#F59E0B", worse: "#E53935", none: "#5b9bd5" };
  const moodEmoji: Record<string, string> = { better: "😊", same: "😐", worse: "😔", none: "✓" };

  return (
    <div className="ticket" style={{ marginBottom: 16 }}>
      <div className="ticket-body" style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
            style={{ background: "none", border: "none", color: "#7facca", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#1A1F36" }}>{tr.calYearMonth(year, month + 1)}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
            style={{ background: "none", border: "none", color: "#7facca", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
          {tr.calDays.map((d: string) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#9ab8cc", fontWeight: 700, paddingBottom: 4 }}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const mood = dateMap[key];
            const isToday = key === todayKey;
            return (
              <div key={i} style={{ textAlign: "center", padding: "2px 0" }}>
                <div style={{
                  width: 32, height: 32, margin: "0 auto", borderRadius: "50%",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: mood ? moodColor[mood] : isToday ? "rgba(165,210,238,0.2)" : "transparent",
                  border: isToday && !mood ? "1.5px solid rgba(165,210,238,0.5)" : "none",
                  fontSize: mood && mood !== "none" ? 16 : 11,
                  color: mood ? "white" : isToday ? "#7facca" : "#9ab8cc",
                  fontWeight: isToday && !mood ? 800 : 400,
                  lineHeight: 1,
                }}>
                  {mood && mood !== "none" ? moodEmoji[mood] : mood === "none" ? (
                    <span style={{ fontSize: 11, color: "white", fontWeight: 700 }}>✓</span>
                  ) : day}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 6 }}>
          {([["😊", "#1DB4A8", tr.calMoodBetter], ["😐", "#F59E0B", tr.calMoodSame], ["😔", "#E53935", tr.calMoodWorse], ["✓", "#5b9bd5", tr.calMoodDone]] as [string,string,string][]).map(([emoji, color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#9ab8cc" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>{emoji}</div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const { lang, toggle: toggleLang } = useLang();
  const tr = t(lang);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    const raw = localStorage.getItem("resetLog");
    const localLogs: LogEntry[] = raw ? JSON.parse(raw) : [];
    if (localLogs.length > 0) setLog(localLogs);

    loadLogsFromSupabase().then((remote) => {
      if (!remote || remote.length === 0) return;
      const localByTs: Record<number, LogEntry> = {};
      localLogs.forEach(l => { if (l.ts) localByTs[l.ts] = l; });
      const merged = (remote as unknown as LogEntry[]).map(r => {
        const local = r.ts ? localByTs[r.ts] : null;
        if (!local) return r;
        return {
          ...r,
          moodAfter: local.moodAfter !== undefined ? local.moodAfter : r.moodAfter,
          completedActions: local.completedActions?.length ? local.completedActions : r.completedActions,
          completedCount: local.completedCount ?? r.completedCount,
          journal: local.journal || r.journal,
        };
      });
      setLog(merged);
    });
  }, []);

  function clearLog() {
    if (confirm(tr.historyConfirmDeleteAll)) {
      const ids = log.map(e => e._id).filter(Boolean) as string[];
      if (ids.length > 0) deleteLogsFromSupabase(ids);
      localStorage.removeItem("resetLog");
      setLog([]);
    }
  }

  function deleteEntry(i: number) {
    const entry = log[i];
    if (entry._id) deleteLogsFromSupabase([entry._id]);
    const next = log.filter((_, idx) => idx !== i);
    setLog(next);
    localStorage.setItem("resetLog", JSON.stringify(next));
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(tr.historyConfirmDeleteSelected(selected.size))) return;
    const ids = [...selected].map(i => log[i]._id).filter(Boolean) as string[];
    if (ids.length > 0) deleteLogsFromSupabase(ids);
    const next = log.filter((_, i) => !selected.has(i));
    setLog(next);
    localStorage.setItem("resetLog", JSON.stringify(next));
    setSelected(new Set());
    setSelectMode(false);
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  return (
    <main style={{ width: "100%", maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <span className="flight-tag" style={{ marginBottom: 8, display: "inline-flex" }}>✈️ RESET PILOT</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 8, textShadow: "0 2px 8px rgba(10,36,99,0.25)" }}>
            {tr.historyPageTitle}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={toggleLang} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: 9, padding: "6px 8px", fontSize: 11, cursor: "pointer", fontWeight: 800 }}>
            {lang === "ko" ? "EN" : "한"}
          </button>
          {log.length > 0 && (
            <button
              onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
              style={{
                background: selectMode ? "rgba(229,57,53,0.15)" : "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${selectMode ? "rgba(229,57,53,0.4)" : "rgba(255,255,255,0.25)"}`,
                color: selectMode ? "#ff6b6b" : "rgba(255,255,255,0.8)",
                borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {selectMode ? tr.historySelectCancel : tr.historySelect}
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {tr.historyBackHome}
          </button>
        </div>
      </div>

      {log.length >= 1 && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/insights")}
            style={{
              flex: 1, padding: "12px 20px", borderRadius: 12,
              background: "linear-gradient(135deg, #0A2463 0%, #163678 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {tr.historyInsightsBtn}
          </button>
          <button
            onClick={() => setViewMode(v => v === "list" ? "calendar" : "list")}
            style={{
              padding: "12px 16px", borderRadius: 12,
              background: viewMode === "calendar" ? "rgba(29,180,168,0.2)" : "rgba(255,255,255,0.15)",
              border: `1px solid ${viewMode === "calendar" ? "rgba(29,180,168,0.5)" : "rgba(255,255,255,0.2)"}`,
              color: "white", fontSize: 18, cursor: "pointer",
            }}
          >
            📅
          </button>
        </div>
      )}

      {viewMode === "calendar" && log.length > 0 && <CalendarView log={log} tr={tr} />}

      {/* 비행 기록 카드 */}
      {log.length > 0 && (() => {
        const total = log.length;
        const cur = getCurrentBadge(total);
        const next = getNextBadge(total);
        const badgeIdx = cur ? BADGES.indexOf(cur as typeof BADGES[number]) : -1;
        const prev = badgeIdx > 0 ? BADGES[badgeIdx - 1] : null;
        const from = prev ? prev.count : 0;
        const to = next ? next.count : (cur?.count ?? 1);
        const progress = next ? Math.round(((total - from) / (to - from)) * 100) : 100;

        const RANK_COLORS: Record<number, { border: string; glow: string; label: string }> = {
          1:   { border: "#CD7F32", glow: "rgba(205,127,50,0.35)",  label: "BRONZE"   },
          5:   { border: "#CD7F32", glow: "rgba(205,127,50,0.35)",  label: "BRONZE"   },
          10:  { border: "#B0C4DE", glow: "rgba(176,196,222,0.4)",  label: "SILVER"   },
          30:  { border: "#4A90D9", glow: "rgba(74,144,217,0.4)",   label: "BLUE"     },
          50:  { border: "#4A90D9", glow: "rgba(74,144,217,0.4)",   label: "BLUE"     },
          100: { border: "#FFD700", glow: "rgba(255,215,0,0.45)",   label: "GOLD"     },
          150: { border: "#FFD700", glow: "rgba(255,215,0,0.45)",   label: "GOLD"     },
          200: { border: "#B39DDB", glow: "rgba(179,157,219,0.45)", label: "PLATINUM" },
          250: { border: "#B39DDB", glow: "rgba(179,157,219,0.45)", label: "PLATINUM" },
          300: { border: "#00FFFF", glow: "rgba(0,255,255,0.4)",    label: "LEGEND"   },
        };

        return (
          <div className="ticket" style={{ marginBottom: 16 }}>
            <div className="ticket-header" style={{ padding: "14px 20px" }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>MY FLIGHT RECORD</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 4 }}>{cur?.emoji ?? "🛫"}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{cur?.name ?? tr.historyBadgeReady}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="gauge" style={{ fontSize: 42, fontWeight: 900, color: "#6ee7e0", lineHeight: 1 }}>{total}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{tr.historyTotalCount}</div>
                </div>
              </div>
              {next && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{tr.nextBadgePrefix} {next.emoji} {next.name}</span>
                    <span style={{ fontSize: 11, color: "#6ee7e0", fontWeight: 700 }}>{tr.historyNextIn(next.count - total)}</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #6ee7e0, #1DB4A8)", borderRadius: 3, transition: "width 0.6s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textAlign: "right", marginTop: 4 }}>{total - from} / {to - from}</div>
                </>
              )}
              {!next && <div style={{ fontSize: 13, fontWeight: 800, color: "#6ee7e0", textAlign: "center", marginTop: 4 }}>{tr.historyBadgeLegend}</div>}
            </div>

            <div className="ticket-body" style={{ padding: "16px" }}>
              <div style={{ fontSize: 10, color: "#9ab8cc", fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>BADGES COLLECTION</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {BADGES.map(b => {
                  const unlocked = total >= b.count;
                  const rc = RANK_COLORS[b.count];
                  return (
                    <div key={b.count} style={{
                      borderRadius: 14, overflow: "hidden",
                      border: `2px solid ${unlocked ? rc.border : "rgba(165,210,238,0.15)"}`,
                      background: unlocked ? `linear-gradient(135deg, rgba(255,255,255,0.92), rgba(240,248,255,0.88))` : "rgba(255,255,255,0.06)",
                      boxShadow: unlocked ? `0 0 12px ${rc.glow}, 0 2px 8px rgba(0,0,0,0.1)` : "none",
                      position: "relative",
                      opacity: unlocked ? 1 : 0.5,
                    }}>
                      <div style={{ background: unlocked ? rc.border : "rgba(165,210,238,0.2)", padding: "3px 0", textAlign: "center" }}>
                        <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: 1.5, color: unlocked ? "white" : "rgba(255,255,255,0.4)" }}>{rc.label}</span>
                      </div>
                      <div style={{ padding: "12px 10px 10px", textAlign: "center" }}>
                        <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 6, filter: unlocked ? "none" : "grayscale(1) opacity(0.4)" }}>
                          {unlocked ? b.emoji : "🔒"}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: unlocked ? "#0A2463" : "#9ab8cc", marginBottom: 3, lineHeight: 1.2 }}>{b.name}</div>
                        <div style={{ fontSize: 10, color: unlocked ? "#4e6e82" : "#9ab8cc" }}>{tr.historyBadgeCountLabel(b.count)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {log.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginBottom: 8, fontWeight: 700 }}>{tr.historyEmptyTitle}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 28 }}>{tr.historyEmptySub}</div>
          <button onClick={() => router.push("/")} className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }}>
            {tr.startFirstRecovery}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            <StatCard label={tr.historyStatTotal} value={`${log.length}${tr.historyStatSuffix}`} color="#FF6B35" />
            <StatCard label={tr.historyStatBurden} value={`${Math.round(log.reduce((s, l) => s + (l.ruinScore ?? 0), 0) / log.length)}%`} color="#E53935" />
            <StatCard label={tr.historyStatRecover} value={`${Math.round(log.reduce((s, l) => s + (l.recoverScore ?? 0), 0) / log.length)}%`} color="#1DB4A8" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {log.map((entry, i) => (
              <div
                key={i}
                className="ticket"
                onClick={() => selectMode && toggleSelect(i)}
                style={{ cursor: selectMode ? "pointer" : "default", outline: selectMode && selected.has(i) ? "2px solid #E53935" : "none", borderRadius: 14 }}
              >
                <div className="ticket-body" style={{ padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {selectMode && (
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: `2px solid ${selected.has(i) ? "#E53935" : "rgba(165,210,238,0.5)"}`,
                          background: selected.has(i) ? "#E53935" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, color: "white", fontWeight: 900,
                        }}>
                          {selected.has(i) ? "✓" : ""}
                        </div>
                      )}
                      <span style={{ fontSize: 11, color: "#7facca", fontWeight: 600 }}>{entry.date}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {!selectMode && <button
                        onClick={e => { e.stopPropagation(); deleteEntry(i); }}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "rgba(165,210,238,0.5)", padding: "2px 4px", lineHeight: 1, transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#E53935")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(165,210,238,0.5)")}
                        title={tr.historyDeleteRecord}
                      >✕</button>}
                      <span style={{ fontSize: 11, color: "#E53935", fontWeight: 700 }}>{tr.historyBurden} {entry.ruinScore ?? "?"}%</span>
                      <span style={{ fontSize: 11, color: "#1DB4A8", fontWeight: 700 }}>{tr.historyRecover} {entry.recoverScore ?? "?"}%</span>
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
                        <span key={j} style={{ fontSize: 11, fontWeight: 600, background: "rgba(29,180,168,0.1)", border: "1px solid rgba(29,180,168,0.3)", borderRadius: 20, padding: "3px 10px", color: "#1DB4A8" }}>
                          {a.title}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.journal && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,245,220,0.6)", borderRadius: 8, borderLeft: "3px solid #F59E0B" }}>
                      <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{tr.historyJournalLabel}</div>
                      <div style={{ fontSize: 12, color: "#4e6e82", lineHeight: 1.5, fontStyle: "italic" }}>"{entry.journal}"</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectMode ? (
            <div style={{ marginTop: 24, display: "flex", gap: 8 }}>
              <button onClick={exitSelectMode} className="btn-ghost" style={{ flex: 1 }}>{tr.historySelectCancel}</button>
              <button
                onClick={deleteSelected}
                disabled={selected.size === 0}
                style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", cursor: selected.size > 0 ? "pointer" : "default", background: selected.size > 0 ? "#E53935" : "rgba(229,57,53,0.3)", color: "white", fontSize: 14, fontWeight: 800 }}
              >
                {selected.size > 0 ? tr.historyDeleteSelected(selected.size) : tr.historySelectPrompt}
              </button>
            </div>
          ) : (
            <button onClick={clearLog} className="btn-ghost" style={{ marginTop: 24 }}>{tr.historyDeleteAll}</button>
          )}
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
