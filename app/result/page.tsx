"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  "Crash Mode":  { color: "#E53935", bg: "#FFF5F5", border: "#FFCDD2", icon: "🔴", label: "회복 우선 모드" },
  "Drift Mode":  { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: "🟡", label: "방향 전환 모드" },
  "Launch Mode": { color: "#1DB4A8", bg: "#F0FDFC", border: "#99F6E4", icon: "🟢", label: "실행 모드" },
};

const SAMPLE: ResetResult = {
  mode: "Drift Mode",
  modeDesc: "완전히 망한 건 아닌데, 뭔가 손이 안 가고 하루가 흘러가는 상태예요.",
  ruinScore: 52,
  scoreBefore: 35,
  scoreAfter: 68,
  emotionFact: {
    emotion: "오늘 아무것도 못 했고 나는 의지력이 없는 사람이야.",
    fact: "오전에 늦게 일어났고, 오후 내내 집중이 안 됐어요. 실제로 한 일이 없는 건 맞아요.",
    interpret: "의지력 문제가 아니라 시작 트리거가 없었던 거예요. 첫 행동만 만들면 돼요.",
  },
  recoveryGoal: "오늘 완벽하게 회복하기보다, 작은 행동 하나로 0점은 피하기.",
  actions: [
    { name: "Body Reset",  title: "물 한 잔 마시고 스트레칭 5분", duration: "5분",  reason: "몸을 움직이면 뇌도 깨어나요. 가장 쉬운 시작점이에요." },
    { name: "Space Reset", title: "책상 위 물건 3개만 정리하기",  duration: "10분", reason: "공간이 정리되면 머릿속도 조금 정리돼요." },
    { name: "Life Reset",  title: "내일 할 일 딱 1개만 적어두기", duration: "5분",  reason: "내일을 준비하는 것만으로도 오늘을 의미 있게 닫을 수 있어요." },
  ],
  skip: ["밀린 업무 전부 해결하기", "방 전체 대청소", "완벽한 루틴 세우기"],
  successCriteria: "위 3개 중 1개만 해도 오늘은 완전히 망한 날이 아니에요.",
  message: "아직 끝나지 않았어. 지금 이 순간부터가 오늘의 후반전이야 ✈️",
};

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [result, setResult] = useState<ResetResult | null>(null);
  const [noData, setNoData] = useState(false);
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    if (isDemo) { setResult(SAMPLE); return; }
    const raw = localStorage.getItem("resetResult");
    if (!raw) { setNoData(true); return; }
    setResult(JSON.parse(raw));
  }, [isDemo]);

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
                fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 20,
              }}>
                {modeStyle.icon} {modeStyle.label}
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

          {/* 진행 바 */}
          <div style={{ height: 3, background: "rgba(165,210,238,0.3)", borderRadius: 2, marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: "#1DB4A8", borderRadius: 2, transition: "width 0.3s" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {result.actions.map((action, i) => (
              <div key={i} onClick={() => toggle(i)} style={{
                padding: "12px 14px",
                background: checked[i] ? "rgba(29,180,168,0.08)" : "rgba(255,255,255,0.55)",
                borderRadius: 12,
                border: "1.5px solid",
                borderColor: checked[i] ? "#1DB4A8" : "rgba(165,210,238,0.5)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                      background: checked[i] ? "#1DB4A8" : "rgba(165,210,238,0.4)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 900,
                      color: checked[i] ? "white" : "#7facca",
                      transition: "all 0.2s",
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
              marginTop: 12, padding: "10px 14px",
              background: allDone ? "rgba(29,180,168,0.12)" : "rgba(29,180,168,0.07)",
              border: `1px solid ${allDone ? "#1DB4A8" : "rgba(29,180,168,0.3)"}`,
              borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              color: "#1DB4A8",
              transition: "all 0.3s",
            }}>
              {allDone
                ? "🛬 오늘 완전히 착륙했어. 진짜 잘했어."
                : `✓ 오늘 0점은 아니야. ${checkedCount}개 했어.`}
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
            RST-001 · {modeStyle.label.toUpperCase()} · GATE 3 · TODAY
          </div>
        </div>
      </div>

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

      <button className="btn-primary animate-fadeInUp animate-delay-3" onClick={() => router.push("/")}>
        {allDone ? "🛬 오늘 착륙 완료! 내일도 ㄱ" : "✈️ 다시 입력하기"}
      </button>
      <button className="btn-ghost" style={{ marginTop: 10 }} onClick={() => router.push("/history")}>
        📋 기록 보기
      </button>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultContent />
    </Suspense>
  );
}

