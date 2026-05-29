"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingAnimation from "../components/LandingAnimation";
import { updateLogInSupabase } from "../utils/logs";

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

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [result, setResult] = useState<ResetResult | null>(null);
  const [noData, setNoData] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const [moodAfter, setMoodAfter] = useState<"better" | "same" | "worse" | null>(null);
  const [showLanding, setShowLanding] = useState(false);

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
    if (log[0].ts) updateLogInSupabase(log[0].ts, { completedActions, completedCount });
  }, [checked, isDemo, result]);

  useEffect(() => {
    if (isDemo || moodAfter === null) return;
    const raw = localStorage.getItem("resetLog");
    if (!raw) return;
    const log = JSON.parse(raw);
    if (log.length === 0) return;
    log[0] = { ...log[0], moodAfter };
    localStorage.setItem("resetLog", JSON.stringify(log));
    if (log[0].ts) updateLogInSupabase(log[0].ts, { moodAfter });
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
    setChecked(next);
  }

  return (
    <>
    {showLanding && <LandingAnimation completedCount={checkedCount} onDone={() => router.push("/")} />}
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span className="flight-tag">✈️ RESET PILOT</span>
        <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.35)", color: "white", fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          ← 다시 입력
        </button>
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
                  <span style={{ fontSize: 10, color: "#FF6B35", background: "rgba(255,245,240,0.8)", border: "1px solid rgba(255,203,164,0.5)", padding: "2px 8px", borderRadius: 20, flexShrink: 0, marginLeft: 8 }}>
                    {action.duration}
                  </span>
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
                  onClick={() => setMoodAfter(value)}
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
          onClick={() => setShowLanding(true)}
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
      <button className="btn-ghost" style={{ marginTop: 10 }} onClick={() => router.push("/history")}>
        📋 기록 보기
      </button>

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

