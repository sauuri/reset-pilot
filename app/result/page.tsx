"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingAnimation from "../components/LandingAnimation";
import { updateLogInSupabase } from "../utils/logs";
import { getCurrentBadge, getNextBadge } from "../utils/badges";
import { playCheck, playTimerDone, playBadge, playPop, playChime, playTap } from "../utils/sounds";

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

const MODE_CONFIG: Record<string, { color: string; bg: string; border: string; icon: string; label: string; en: string }> = {
  "Crash Mode":  { color: "#E53935", bg: "#FFF5F5", border: "#FFCDD2", icon: "🔴", label: "회복 우선 모드", en: "Crash Mode" },
  "Drift Mode":  { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: "🟡", label: "방향 전환 모드", en: "Drift Mode" },
  "Launch Mode": { color: "#1DB4A8", bg: "#F0FDFC", border: "#99F6E4", icon: "🟢", label: "실행 모드",     en: "Launch Mode" },
};

const SAMPLE: ResetResult = {
  mode: "Crash Mode",
  modeDesc: "에너지가 바닥이고 불안도 높아요. 오늘은 회복이 먼저예요.",
  ruinScore: 74,
  scoreBefore: 22,
  scoreAfter: 58,
  emotionFact: {
    emotion: "나는 오늘 아무것도 못 한 쓸모없는 사람이야. 이러다 다 망하는 거 아닐까.",
    fact: "오늘 오후 내내 시작을 못 했어요. 해야 할 일이 밀린 건 맞아요.",
    interpret: "4시간 못 한 게 '인생 실패'로 확대된 거예요. 오늘 남은 시간이 아직 있어요.",
  },
  recoveryGoal: "전부 해결하려는 생각은 내려놓고, 딱 하나만 시작해보기.",
  actions: [
    {
      name: "Body Reset",
      title: "샤워하고 옷 갈아입기",
      duration: "15분",
      reason: "지금 상태를 물리적으로 리셋하는 가장 확실한 방법이에요. 진짜로 기분이 달라져요.",
    },
    {
      name: "Space Reset",
      title: "책상 위 컵이랑 쓰레기만 치우기",
      duration: "5분",
      reason: "방 전체 청소 말고, 딱 눈앞만 정리해요. 시야가 바뀌면 마음도 조금 달라요.",
    },
    {
      name: "Life Reset",
      title: "지금 제일 쉬운 일 하나, 타이머 25분만",
      duration: "25분",
      reason: "완벽하게 하려는 게 아니라 시작했다는 사실이 중요해요. 25분 후에 멈춰도 돼요.",
    },
  ],
  skip: ["오늘 밀린 것 전부 처리하기", "완벽한 계획 먼저 세우기", "SNS 켜서 기분 전환하기"],
  successCriteria: "샤워 하나만 해도 오늘은 0점이 아니에요. 나머지는 전부 보너스예요.",
  message: "4시간 못 한 게 아니라, 지금 이걸 보고 있잖아. 그게 이미 시작이야 ✈️",
};

function parseDurationSecs(duration: string): number {
  const h = duration.match(/(\d+)\s*시간/);
  const m = duration.match(/(\d+)\s*분/);
  return (h ? parseInt(h[1]) * 3600 : 0) + (m ? parseInt(m[1]) * 60 : 0) || 300;
}

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

interface TimerState { idx: number; total: number; remaining: number; done: boolean; startedAt: number; startedRemaining: number }

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [result, setResult] = useState<ResetResult | null>(null);
  const [noData, setNoData] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const [moodAfter, setMoodAfter] = useState<"better" | "same" | "worse" | null>(null);
  const [showLanding, setShowLanding] = useState(false);
  const [timer, setTimer] = useState<TimerState | null>(null);
  const timerRef = useEffect;
  const [saved, setSaved] = useState(false);
  const [journal, setJournal] = useState("");
  const [journalSaved, setJournalSaved] = useState(false);
  const [newBadge, setNewBadge] = useState<{ emoji: string; name: string; desc: string } | null>(null);

  useEffect(() => {
    if (!result || isDemo) return;
    const plans: ResetResult[] = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    setSaved(plans.some(p => p.recoveryGoal === result.recoveryGoal && p.mode === result.mode));
    // 뱃지 해금 체크
    const log = JSON.parse(localStorage.getItem("resetLog") || "[]");
    const total = log.length;
    const cur = getCurrentBadge(total);
    const prev = getCurrentBadge(total - 1);
    if (cur && cur.count !== prev?.count) { setNewBadge(cur); playBadge(); }
  }, [result, isDemo]);

  function toggleSave() {
    if (!result || isDemo) return;
    const plans: ResetResult[] = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    if (saved) {
      const next = plans.filter(p => !(p.recoveryGoal === result.recoveryGoal && p.mode === result.mode));
      localStorage.setItem("savedPlans", JSON.stringify(next));
      setSaved(false);
    } else {
      plans.unshift(result);
      localStorage.setItem("savedPlans", JSON.stringify(plans.slice(0, 20)));
      setSaved(true);
    }
  }

  // 타이머 카운트다운 — 화면 꺼짐/백그라운드 대응
  timerRef(() => {
    if (!timer || timer.done) return;
    if (timer.remaining <= 0) { setTimer(t => t ? { ...t, done: true } : null); return; }

    // 포그라운드 복귀 시 실제 경과 시간으로 재계산
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setTimer(t => {
          if (!t || t.done) return t;
          const elapsed = Math.floor((Date.now() - t.startedAt) / 1000);
          const remaining = Math.max(0, t.startedRemaining - elapsed);
          if (remaining <= 0) playTimerDone();
          return remaining <= 0 ? { ...t, remaining: 0, done: true } : { ...t, remaining };
        });
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    const id = setInterval(() => {
      setTimer(t => {
        if (!t || t.done) { clearInterval(id); return t; }
        const elapsed = Math.floor((Date.now() - t.startedAt) / 1000);
        const remaining = Math.max(0, t.startedRemaining - elapsed);
        if (remaining <= 0) { clearInterval(id); playTimerDone(); return { ...t, remaining: 0, done: true }; }
        return { ...t, remaining };
      });
    }, 1000);

    return () => { clearInterval(id); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [timer?.idx, timer?.done]);

  function startTimer(i: number, duration: string) {
    const secs = parseDurationSecs(duration);
    setTimer({ idx: i, total: secs, remaining: secs, done: false, startedAt: Date.now(), startedRemaining: secs });
  }

  function completeTimer() {
    if (!timer) return;
    const next = [...checked]; next[timer.idx] = true; setChecked(next);
    setTimer(null);
  }

  function saveJournal() {
    if (!journal.trim() || isDemo) return;
    const raw = localStorage.getItem("resetLog");
    if (!raw) return;
    const log = JSON.parse(raw);
    if (log.length === 0) return;
    log[0] = { ...log[0], journal };
    localStorage.setItem("resetLog", JSON.stringify(log));
    setJournalSaved(true);
    playChime();
  }

  async function shareResult() {
    if (!result) return;
    const moodText = moodAfter === "better" ? "😊 기분이 나아졌어요" : moodAfter === "same" ? "😐 비슷해요" : moodAfter === "worse" ? "😔 아직 힘들어요" : "";
    const actionLines = result.actions.map((a, i) => `${checked[i] ? "✅" : "⬜"} ${a.title}`).join("\n");
    const text = `✈️ Reset Pilot — 오늘 복구 기록\n${"─".repeat(22)}\n부담도 ${result.ruinScore}% → 흐름 되찾는 중\n\n${actionLines}\n${checkedCount > 0 ? `\n완료 ${checkedCount}/3 🎯` : ""}${moodText ? `\n${moodText}` : ""}\n\n#ResetPilot #망한하루복구`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Reset Pilot", text, url: "https://reset-pilot.vercel.app" });
      } else {
        await navigator.clipboard.writeText(text);
        alert("클립보드에 복사됐어요!");
      }
    } catch { /* 취소 */ }
  }

  useEffect(() => {
    if (isDemo) { setResult(SAMPLE); return; }
    const raw = localStorage.getItem("resetResult");
    if (!raw) { setNoData(true); return; }
    setResult(JSON.parse(raw));
  }, [isDemo]);

  useEffect(() => {
    if (isDemo || !result) return;
    const raw = localStorage.getItem("resetLog");
    if (!raw) return;
    const log = JSON.parse(raw);
    if (log.length === 0) return;
    const completedActions = result.actions.filter((_, i) => checked[i]).map(a => a.title);
    const completedCount = checked.filter(Boolean).length;
    log[0] = { ...log[0], completedCount, completedActions };
    localStorage.setItem("resetLog", JSON.stringify(log));
    if (log[0].ts) updateLogInSupabase(log[0].ts, { completedActions, completedCount }, log[0]._id);
  }, [checked, isDemo, result]);

  useEffect(() => {
    if (isDemo || moodAfter === null) return;
    const raw = localStorage.getItem("resetLog");
    if (!raw) return;
    const log = JSON.parse(raw);
    if (log.length === 0) return;
    log[0] = { ...log[0], moodAfter };
    localStorage.setItem("resetLog", JSON.stringify(log));
    if (log[0].ts) updateLogInSupabase(log[0].ts, { moodAfter }, log[0]._id);
  }, [moodAfter, isDemo]);

  /* 데이터 없음 — 빈 상태 */
  if (noData) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🛫</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginBottom: 10, textShadow: "0 2px 8px rgba(10,36,99,0.3)" }}>
          아직 생성된 복구 리포트가 없어요.
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 32 }}>
          먼저 현재 상태를 입력하면<br />
          AI가 오늘 가능한 복구 플랜을 만들어드릴게요.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 300, margin: "0 auto" }}>
          <button className="btn-primary" onClick={() => router.push("/")}>
            ✈️ 복구 플랜 만들러 가기
          </button>
          <button className="btn-ghost" onClick={() => router.push("/result?demo=true")}>
            👀 샘플 리포트 보기
          </button>
        </div>
      </main>
    );
  }

  if (!result) return null;

  const mode = result.mode || "Crash Mode";
  const modeStyle = MODE_CONFIG[mode] ?? MODE_CONFIG["Crash Mode"];
  const checkedCount = checked.filter(Boolean).length;
  const allDone = checkedCount === 3;
  const anyDone = checkedCount > 0;
  const progress = Math.round((checkedCount / 3) * 100);

  function toggle(i: number) {
    const next = [...checked];
    next[i] = !next[i];
    if (!checked[i]) playCheck();
    setChecked(next);
  }

  return (
    <>
    {showLanding && <LandingAnimation completedCount={checkedCount} onDone={() => router.push("/")} />}

    {/* 뱃지 해금 오버레이 */}
    {newBadge && (
      <div style={{ position: "fixed", inset: 0, zIndex: 150, background: "rgba(1,8,16,0.88)", backdropFilter: "blur(10px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}
        onClick={() => setNewBadge(null)}>
        <div style={{ textAlign: "center", animation: "fadeInUp 0.5s ease" }}>
          <div style={{ fontSize: 72, marginBottom: 16, lineHeight: 1 }}>{newBadge.emoji}</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#1DB4A8", fontWeight: 700, marginBottom: 10 }}>NEW BADGE UNLOCKED</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 10 }}>{newBadge.name}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 280, margin: "0 auto", whiteSpace: "pre-line", marginBottom: 32 }}>{newBadge.desc}</div>
          <button onClick={() => setNewBadge(null)} style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg, #1DB4A8, #0a8a80)", color: "white", fontSize: 15, fontWeight: 900, cursor: "pointer" }}>
            ✈️ 확인
          </button>
        </div>
      </div>
    )}

    {/* 타이머 오버레이 */}
    {timer && result && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "linear-gradient(180deg, #010d20 0%, #021430 50%, #041c3e 100%)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        {/* 별 배경 느낌 */}
        <div style={{ position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)", fontSize: 28, opacity: 0.9, animation: timer.done ? "none" : "twinkle 1.2s ease-in-out infinite" }}>
          {timer.done ? "🛬" : "✈️"}
        </div>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 8 }}>
            {timer.done ? "MISSION COMPLETE" : "NOW FLYING"}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontWeight: 700, marginBottom: 4 }}>
            {result.actions[timer.idx].name}
          </div>
          <div style={{ fontSize: 18, color: "white", fontWeight: 900, lineHeight: 1.4 }}>
            {result.actions[timer.idx].title}
          </div>
        </div>

        {/* 원형 타이머 */}
        <div style={{ position: "relative", width: 200, height: 200, marginBottom: 36 }}>
          <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
            <circle cx="100" cy="100" r="88" fill="none"
              stroke={timer.done ? "#1DB4A8" : "#5b9bd5"}
              strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (timer.remaining / timer.total)}`}
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            {timer.done ? (
              <div style={{ fontSize: 44 }}>🎉</div>
            ) : (
              <>
                <div style={{ fontSize: 46, fontWeight: 900, color: "white", letterSpacing: -1, fontVariantNumeric: "tabular-nums" }}>
                  {fmt(timer.remaining)}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>남음</div>
              </>
            )}
          </div>
        </div>

        {timer.done ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1DB4A8", textAlign: "center", marginBottom: 4 }}>
              시간 다 됐어요! 어떻게 됐나요?
            </div>
            <button onClick={completeTimer} style={{
              padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #1DB4A8, #0a8a80)",
              color: "white", fontSize: 15, fontWeight: 900,
              boxShadow: "0 6px 20px rgba(29,180,168,0.4)",
            }}>
              ✅ 완료했어요!
            </button>
            <button onClick={() => setTimer(null)} style={{
              padding: "14px", borderRadius: 14, cursor: "pointer",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 700,
            }}>
              😅 못 했지만 괜찮아요
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 300 }}>
            <button onClick={completeTimer} style={{
              padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #1DB4A8, #0a8a80)",
              color: "white", fontSize: 15, fontWeight: 900,
              boxShadow: "0 6px 20px rgba(29,180,168,0.4)",
            }}>
              ✅ 벌써 완료했어요!
            </button>
            <button onClick={() => setTimer(null)} style={{
              padding: "14px", borderRadius: 14, cursor: "pointer",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700,
            }}>
              ✕ 나중에 할게요
            </button>
          </div>
        )}
      </div>
    )}

    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span className="flight-tag">✈️ RESET PILOT</span>
        <div style={{ display: "flex", gap: 6 }}>
          {!isDemo && (
            <button onClick={toggleSave} style={{ background: saved ? "rgba(255,180,0,0.2)" : "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: `1px solid ${saved ? "rgba(255,180,0,0.4)" : "rgba(255,255,255,0.25)"}`, color: saved ? "#FFB830" : "rgba(255,255,255,0.6)", fontSize: 16, padding: "6px 10px", borderRadius: 8, cursor: "pointer" }} title={saved ? "저장됨" : "플랜 저장"}>
              {saved ? "⭐" : "☆"}
            </button>
          )}
          <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.35)", color: "white", fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
            ← 다시 입력
          </button>
        </div>
      </div>

      {/* 메인 탑승권 */}
      <div className="ticket animate-fadeInUp" style={{ marginBottom: 14 }}>

        {/* 헤더 */}
        <div className="ticket-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>TODAY&apos;S RECOVERY PLAN</div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: modeStyle.bg, color: modeStyle.color,
                border: `1px solid ${modeStyle.border}`,
                padding: "5px 12px", borderRadius: 20,
              }}>
                {modeStyle.icon}
                <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{modeStyle.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.65 }}>{modeStyle.en}</span>
                </span>
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>부담도</div>
              <div className="gauge" style={{ fontSize: 38, fontWeight: 900, color: modeStyle.color, lineHeight: 1 }}>{result.ruinScore}</div>
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            {result.modeDesc}
          </div>
        </div>

        {/* 오늘 목표 */}
        <div className="ticket-body">
          <div style={{ marginBottom: 14 }}>
            <div className="ticket-label">🎯 오늘의 목표</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1F36", marginTop: 4, lineHeight: 1.5 }}>
              {result.recoveryGoal}
            </div>
          </div>

          {/* 점수 바 */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "center", minWidth: 44 }}>
              <div className="gauge" style={{ fontSize: 20, fontWeight: 900, color: "#E53935" }}>{result.scoreBefore}</div>
              <div style={{ fontSize: 9, color: "#9ab8cc", marginTop: 1 }}>지금</div>
            </div>
            <div style={{ flex: 1, height: 6, background: "rgba(165,210,238,0.35)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.scoreAfter}%`, background: "linear-gradient(90deg, #E53935, #1DB4A8)", borderRadius: 3 }} />
            </div>
            <div style={{ textAlign: "center", minWidth: 44 }}>
              <div className="gauge" style={{ fontSize: 20, fontWeight: 900, color: "#1DB4A8" }}>{result.scoreAfter}</div>
              <div style={{ fontSize: 9, color: "#9ab8cc", marginTop: 1 }}>복구 후</div>
            </div>
          </div>
          <div style={{ fontSize: 10, color: "#9ab8cc", marginTop: 5, textAlign: "center" }}>
            목표는 100점이 아니야 — 0점만 피하면 돼
          </div>
        </div>

        {/* 분리선 */}
        <div className="ticket-tear" />

        {/* 지금 할 일 3가지 */}
        <div className="ticket-stub">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div className="ticket-label">⚡ 지금 할 일 3가지</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: allDone ? "#1DB4A8" : "#9ab8cc" }}>
              {allDone ? "전부 완료 🎉" : `${checkedCount}/3`}
            </div>
          </div>

          {/* 진행 바 — 첫 체크 후 등장 */}
          {anyDone && (
            <div style={{ height: 3, background: "rgba(165,210,238,0.3)", borderRadius: 2, marginBottom: 12 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "#1DB4A8", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.actions.map((action, i) => (
              <div key={i} onClick={() => toggle(i)} style={{
                padding: "12px 14px",
                background: checked[i] ? "rgba(29,180,168,0.08)" : "rgba(255,255,255,0.55)",
                borderRadius: 12,
                border: "1.5px solid",
                borderColor: checked[i] ? "#1DB4A8" : "rgba(165,210,238,0.5)",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: checked[i] ? "#1DB4A8" : "rgba(165,210,238,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900,
                      color: checked[i] ? "white" : "#7facca",
                      transition: "background 0.2s, color 0.2s",
                    }}>
                      {checked[i] ? "✓" : i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#FF6B35", fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>{action.name}</div>
                      <div style={{
                        fontWeight: 700, fontSize: 13,
                        textDecoration: checked[i] ? "line-through" : "none",
                        color: checked[i] ? "#9ab8cc" : "#1A1F36",
                      }}>
                        {action.title}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontSize: 10, color: "#FF6B35", background: "rgba(255,245,240,0.8)", border: "1px solid rgba(255,203,164,0.5)", padding: "2px 8px", borderRadius: 20 }}>
                      {action.duration}
                    </span>
                    {!checked[i] && (
                      <button
                        onClick={e => { e.stopPropagation(); startTimer(i, action.duration); }}
                        style={{
                          fontSize: 10, fontWeight: 700, color: "#0A2463",
                          background: "rgba(255,255,255,0.85)", border: "1px solid rgba(165,210,238,0.6)",
                          borderRadius: 20, padding: "2px 8px", cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >⏱ 타이머</button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#7facca", marginTop: 5, marginLeft: 36 }}>
                  {action.reason}
                </div>
              </div>
            ))}
          </div>

          {/* 체크 피드백 */}
          {anyDone && (
            <div style={{
              marginTop: 12, padding: "10px 16px",
              background: allDone ? "rgba(29,180,168,0.14)" : "rgba(29,180,168,0.07)",
              border: `1.5px solid ${allDone ? "#1DB4A8" : "rgba(29,180,168,0.3)"}`,
              borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#1DB4A8",
              transition: "background 0.3s, border-color 0.3s",
            }}>
              {checkedCount === 1 && "✓ 오늘은 0점은 아니에요."}
              {checkedCount === 2 && "✓✓ 흐름이 조금 돌아오고 있어요."}
              {checkedCount === 3 && "🛬 복구 완료. 오늘 충분히 잘 막았어요."}
            </div>
          )}
        </div>

        {/* 분리선 2 */}
        <div className="ticket-tear tear-stub" />

        {/* 바코드 스텁 */}
        <div className="ticket-stub" style={{ padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="ticket-label">성공 기준</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1F36", marginTop: 3, lineHeight: 1.5 }}>
                {result.successCriteria}
              </div>
              <div style={{ fontSize: 11, color: "#7facca", marginTop: 5, fontStyle: "italic" }}>
                {result.message}
              </div>
            </div>
            <div className="barcode" style={{ width: 56, flexShrink: 0, marginTop: 4 }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 9, color: "#b8d5e8", letterSpacing: 1 }}>
            RST-001 · {modeStyle.label} · GATE 3 · TODAY
          </div>
        </div>
      </div>

      {/* 기분 체크 */}
      {anyDone && (
        <div className="ticket animate-fadeInUp" style={{ marginBottom: 14 }}>
          <div className="ticket-body" style={{ padding: "16px 20px" }}>
            <div className="ticket-label" style={{ marginBottom: 10 }}>💬 지금 기분은?</div>
            <div style={{ display: "flex", gap: 8 }}>
              {([
                { value: "better" as const, emoji: "😊", label: "나아짐" },
                { value: "same"   as const, emoji: "😐", label: "비슷" },
                { value: "worse"  as const, emoji: "😔", label: "더 힘듦" },
              ]).map(({ value, emoji, label }) => (
                <button
                  key={value}
                  onClick={() => { setMoodAfter(value); playPop(); }}
                  style={{
                    flex: 1, padding: "10px 6px", borderRadius: 10,
                    border: "1.5px solid",
                    borderColor: moodAfter === value ? "#0A2463" : "rgba(165,210,238,0.5)",
                    background: moodAfter === value ? "#0A2463" : "rgba(255,255,255,0.4)",
                    color: moodAfter === value ? "white" : "#4e6e82",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}
                >
                  <span style={{ fontSize: 22 }}>{emoji}</span>
                  <span style={{ fontSize: 11 }}>{label}</span>
                </button>
              ))}
            </div>
            {moodAfter && (
              <div style={{ marginTop: 10, fontSize: 12, color: "#1DB4A8", fontWeight: 700, textAlign: "center" }}>
                {moodAfter === "better" && "✓ 기록됐어요. 좋은 흐름이에요!"}
                {moodAfter === "same"   && "✓ 기록됐어요. 그래도 오늘 버텼어요."}
                {moodAfter === "worse"  && "✓ 기록됐어요. 솔직하게 알려줘서 고마워요."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 오늘의 한 줄 일기 */}
      {!isDemo && (
        <div className="ticket animate-fadeInUp" style={{ marginBottom: 14 }}>
          <div className="ticket-header" style={{ padding: "12px 20px" }}>
            <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>✏️ 오늘의 한 줄</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>잘 한 것 하나, 또는 오늘을 한 마디로 — 아주 작아도 괜찮아요</div>
          </div>
          <div className="ticket-body" style={{ padding: "14px 20px" }}>
            {journalSaved ? (
              <div style={{ padding: "12px 14px", background: "rgba(255,245,220,0.7)", borderRadius: 10, borderLeft: "3px solid #F59E0B" }}>
                <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>TODAY&apos;S NOTE</div>
                <div style={{ fontSize: 13, color: "#4e6e82", lineHeight: 1.6, fontStyle: "italic" }}>"{journal}"</div>
                <button onClick={() => setJournalSaved(false)} style={{ marginTop: 8, background: "none", border: "none", fontSize: 11, color: "#9ab8cc", cursor: "pointer" }}>수정하기</button>
              </div>
            ) : (
              <>
                <textarea
                  rows={2}
                  placeholder="물 한 잔 마셨다 / 오늘 버텼다 / 조금 나아진 것 같다…"
                  value={journal}
                  onChange={e => setJournal(e.target.value)}
                  style={{ width: "100%", resize: "none", fontSize: 13, borderRadius: 10, border: "1.5px solid rgba(245,158,11,0.35)", background: "rgba(255,251,235,0.6)", padding: "10px 12px", color: "#4e6e82", outline: "none" }}
                />
                <button
                  onClick={saveJournal}
                  disabled={!journal.trim()}
                  style={{ marginTop: 8, width: "100%", padding: "11px", borderRadius: 10, border: "none", cursor: journal.trim() ? "pointer" : "default", background: journal.trim() ? "linear-gradient(135deg, #F59E0B, #d97706)" : "rgba(245,158,11,0.15)", color: journal.trim() ? "white" : "#9ab8cc", fontSize: 13, fontWeight: 800, transition: "all 0.2s" }}
                >
                  ✏️ 저장하기
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 현실 체크 */}
      <div className="ticket animate-fadeInUp animate-delay-1" style={{ marginBottom: 14 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>🧠 감정 vs 사실 — AI 분석</div>
        </div>
        <div className="ticket-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "10px 14px", background: "rgba(255,245,245,0.75)", borderRadius: 10, border: "1px solid rgba(255,205,210,0.5)" }}>
              <div style={{ fontSize: 9, color: "#E53935", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>지금 느끼는 것</div>
              <div style={{ fontSize: 13, color: "#6B7494", fontStyle: "italic" }}>&ldquo;{result.emotionFact.emotion}&rdquo;</div>
            </div>
            <div className="runway-divider">AI가 걸러낸 사실</div>
            <div style={{ padding: "10px 14px", background: "rgba(240,253,252,0.75)", borderRadius: 10, border: "1px solid rgba(153,246,228,0.5)" }}>
              <div style={{ fontSize: 9, color: "#1DB4A8", fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>실제로는</div>
              <div style={{ fontSize: 13, color: "#1A1F36" }}>{result.emotionFact.fact}</div>
            </div>
            {result.emotionFact.interpret && (
              <div style={{ fontSize: 12, color: "#4e6e82", padding: "8px 12px", background: "rgba(240,247,252,0.7)", borderRadius: 8 }}>
                💡 {result.emotionFact.interpret}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 오늘 안 해도 되는 것 */}
      <div className="ticket animate-fadeInUp animate-delay-2" style={{ marginBottom: 16 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>🗑️ 오늘 안 해도 되는 것</div>
        </div>
        <div className="ticket-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {result.skip.map((s, i) => (
              <div key={i} style={{ fontSize: 13, color: "#7facca", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "rgba(165,210,238,0.7)", fontSize: 15 }}>✕</span>
                <span style={{ textDecoration: "line-through" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isDemo && (
        <div style={{ marginBottom: 14, padding: "12px 16px", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.35)", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "white", fontWeight: 700, marginBottom: 6 }}>👀 샘플 리포트입니다</div>
          <button className="btn-primary" style={{ fontSize: 13, padding: "10px 20px" }} onClick={() => router.push("/")}>
            ✈️ 내 복구 플랜 만들기
          </button>
        </div>
      )}

      {checkedCount >= 1 ? (
        <button
          className="animate-fadeInUp animate-delay-3"
          onClick={() => { playTap(); setShowLanding(true); }}
          style={{
            width: "100%", border: "none", borderRadius: 16,
            padding: "18px 28px", fontSize: 17, fontWeight: 900,
            cursor: "pointer", letterSpacing: 0.5,
            background: checkedCount === 3
              ? "linear-gradient(135deg, #1DB4A8, #0a8a80)"
              : checkedCount === 2
              ? "linear-gradient(135deg, #1565C0, #0d47a1)"
              : "linear-gradient(135deg, #FF8C00, #e06000)",
            color: "white",
            boxShadow: checkedCount === 3
              ? "0 8px 28px rgba(29,180,168,0.45)"
              : checkedCount === 2
              ? "0 8px 28px rgba(21,101,192,0.45)"
              : "0 8px 28px rgba(255,140,0,0.45)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={e => (e.currentTarget.style.transform = "translateY(2px)")}
          onMouseUp={e => (e.currentTarget.style.transform = "translateY(0)")}
        >
          {checkedCount === 3
            ? "🛬 착륙하기 — 오늘 수고했어!"
            : checkedCount === 2
            ? "🛬 착륙 — 오늘 꽤 잘 막았어"
            : "🛬 비상착륙 — 일단 오늘 내려와"}
        </button>
      ) : (
        <button className="btn-primary animate-fadeInUp animate-delay-3" onClick={() => router.push("/")}>
          ✈️ 다시 입력하기
        </button>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="btn-ghost" style={{ flex: 1 }} onClick={() => router.push("/history")}>
          📋 기록 보기
        </button>
        <button
          onClick={shareResult}
          style={{
            flex: 1, padding: "12px", borderRadius: 12, cursor: "pointer",
            background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "white", fontSize: 13, fontWeight: 700,
          }}
        >
          🔗 공유하기
        </button>
      </div>

      {result.mode === "Crash Mode" && !isDemo && (
        <div style={{
          marginTop: 14, padding: "16px 18px",
          background: "rgba(10,20,50,0.55)", backdropFilter: "blur(12px)",
          borderRadius: 14, border: "1px solid rgba(229,57,53,0.25)",
        }}>
          <div style={{ fontSize: 11, color: "#E53935", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
            🆘 위기 상황이라면
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 10 }}>
            지금 너무 힘들고 혼자 감당이 안 된다면, 전화 한 통이 도움이 될 수 있어요.
          </div>
          <a href="tel:1393" style={{ display: "block", textDecoration: "none" }}>
            <div style={{
              padding: "10px 16px", borderRadius: 10,
              background: "rgba(229,57,53,0.18)", border: "1px solid rgba(229,57,53,0.4)",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 22 }}>📞</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#ff6b6b" }}>자살예방상담전화 1393</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 1 }}>24시간 무료 · 익명 가능</div>
              </div>
            </div>
          </a>
        </div>
      )}
    </main>
    </>

  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultContent />
    </Suspense>
  );
}

