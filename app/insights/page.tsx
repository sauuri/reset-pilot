"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LogEntry {
  date: string;
  input: string;
  ruinScore: number;
  recoverScore: number;
  actions: { title: string }[];
  mode?: string;
  energy?: number;
  anxiety?: number;
  completedCount?: number;
  completedActions?: string[];
  moodAfter?: "better" | "same" | "worse" | null;
}

const PATTERN_KEYWORDS = [
  {
    keywords: ["늦게 일어", "늦잠"], label: "늦은 기상",
    rx: ["일어나자마자 물 한 잔 마시기", "창문 열어 빛 쬐기", "10분 이내 간단한 행동 하나"],
    warn: "기상 직후 폰 보는 건 오히려 더 무기력하게 만들 수 있어요.",
  },
  {
    keywords: ["불안", "걱정"], label: "불안감",
    rx: ["지금 걱정을 한 문장으로 적기", "내가 통제 가능한 것 1개만 고르기", "5분짜리 행동으로 줄이기"],
    warn: "불안할 때 큰 계획 세우면 더 막힐 수 있어요.",
  },
  {
    keywords: ["무기력", "하기 싫", "아무것도"], label: "무기력감",
    rx: ["스트레칭 3분", "샤워 또는 세수", "생각보다 행동을 먼저 하기"],
    warn: "동기부여 영상을 오래 보는 건 오히려 시작을 늦출 수 있어요.",
  },
  {
    keywords: ["지저분", "청소", "엉망"], label: "공간 부담",
    rx: ["책상 위 쓰레기 하나만 치우기", "눈앞 20cm만 정리하기", "딱 5분 타이머 켜기"],
    warn: "공간 전체를 한 번에 정리하려 하면 시작도 못 할 수 있어요.",
  },
  {
    keywords: ["면접", "취업", "이직"], label: "취업 고민",
    rx: ["오늘 할 수 있는 취업 행동 1개 정하기", "지원서 1개만 보내기", "10분 리서치만 하기"],
    warn: "취업 걱정이 클 때일수록 '오늘 하나'에 집중하는 게 좋아요.",
  },
  {
    keywords: ["폰", "유튜브", "SNS"], label: "집중력 분산",
    rx: ["폰 다른 방에 두기 (10분)", "타이머 켜고 화면 뒤집어 놓기", "아주 작은 일 하나만 선택하기"],
    warn: "의지력으로 폰 끊으려 하면 실패하기 쉬워요. 물리적 거리가 효과적이에요.",
  },
  {
    keywords: ["잠", "수면", "피곤"], label: "수면 부족",
    rx: ["오늘은 작은 것 하나만 하기", "15분 눈 감고 쉬기", "내일을 위해 자정 전 누워보기"],
    warn: "피곤할 때 무리하면 다음 날 더 힘들어질 수 있어요.",
  },
];

type RecoveryType = { label: string; en: string; desc: string; tip: string };

function getRecoveryType(p: Record<string, number>, avg: number): RecoveryType {
  if ((p["불안감"] ?? 0) >= 2)
    return { label: "불안 과부하형", en: "Anxiety Overload", desc: "걱정이 많아 시작이 어렵고, 큰 계획을 세우다 막히는 패턴이에요.", tip: "계획 세우는 시간을 줄이고, 지금 당장 할 수 있는 가장 작은 행동으로 바로 시작하세요." };
  if ((p["늦은 기상"] ?? 0) >= 2)
    return { label: "느린 시동형", en: "Slow Starter", desc: "시작까지 오래 걸리지만 한 번 시작하면 작은 행동은 잘 완료하는 편이에요.", tip: "처음부터 제대로 하려 하지 말고, 5분 이하 행동으로 먼저 몸을 움직이는 게 잘 맞아요." };
  if ((p["무기력감"] ?? 0) >= 2)
    return { label: "무기력 누적형", en: "Lethargy Loop", desc: "아무것도 하기 싫은 상태가 반복되고, 작은 행동에서 탈출구를 찾는 패턴이에요.", tip: "생각보다 몸을 먼저 움직이는 게 효과적이에요. 스트레칭 3분이 생각보다 큰 전환점이 돼요." };
  if ((p["집중력 분산"] ?? 0) >= 2)
    return { label: "집중력 분산형", en: "Distraction Loop", desc: "폰이나 SNS로 주의가 자주 흩어지고, 시작 전 에너지를 소모하는 패턴이에요.", tip: "의지력 싸움보다 환경 설정이 효과적이에요. 폰을 다른 방에 두는 것만으로도 달라져요." };
  if (avg >= 2)
    return { label: "작은 행동 성공형", en: "Small Win Type", desc: "큰 계획보다 작은 행동을 꾸준히 완료하는 데 강한 패턴이에요.", tip: "이미 잘하고 있어요. 작게 쪼개는 전략을 계속 유지하면 돼요." };
  return { label: "회복 탐색형", en: "Recovery Explorer", desc: "아직 뚜렷한 패턴이 형성 중이에요. 기록이 쌓일수록 당신에게 맞는 복구 방식이 선명해져요.", tip: "지금처럼 계속 기록해보세요. 10회가 넘으면 더 정확한 패턴을 볼 수 있어요." };
}

function buildSummary(top: [string, number][], actions: [string, number][], total: number, avg: number): string {
  if (top.length === 0) return `최근 ${total}일 기록을 분석했어요. 기록이 더 쌓이면 더 선명한 패턴을 볼 수 있어요.`;
  const causes = top.slice(0, 2).map(([l]) => l).join("·");
  const action = actions[0]?.[0];
  let s = `최근 ${total}일 기록을 보면, ${causes}이(가) 반복적으로 나타났어요.`;
  if (action) s += ` 하지만 "${action}" 같은 행동은 해냈어요.`;
  if (avg >= 2)      s += "\n\n작은 행동을 잘 완료하는 패턴이에요. 지금처럼 작게 시작하는 전략을 유지하세요.";
  else if (avg >= 1) s += "\n\n하나씩은 해내고 있어요. 긴 계획보다 '딱 하나만'이 지금 당신에게 맞는 방식이에요.";
  else               s += "\n\n시작 자체가 어려운 날이 많았어요. 첫 번째 체크 하나가 오늘의 전부여도 충분해요.";
  return s;
}

export default function InsightsPage() {
  const router = useRouter();
  const [log, setLog] = useState<LogEntry[]>([]);
  const [openPattern, setOpenPattern] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("resetLog");
    if (raw) setLog(JSON.parse(raw));
  }, []);

  if (log.length < 3) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📊</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginBottom: 10, textShadow: "0 2px 8px rgba(10,36,99,0.25)" }}>
          아직 패턴을 보기엔 기록이 조금 부족해요
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 24 }}>
          <strong style={{ color: "white" }}>{3 - log.length}번</strong>만 더 기록하면<br />
          자주 무너지는 원인과 잘 맞는 복구 행동을 보여드릴게요.
        </div>
        <div style={{ display: "inline-flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", borderRadius: 20, padding: "8px 20px", marginBottom: 32 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < log.length ? "#1DB4A8" : "rgba(255,255,255,0.3)", transition: "background 0.3s" }} />
          ))}
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginLeft: 4 }}>{log.length}/3</span>
        </div>
        <button className="btn-primary" style={{ maxWidth: 300, margin: "0 auto", display: "block" }} onClick={() => router.push("/")}>
          ✈️ 복구 플랜 시작하기
        </button>
        <button className="btn-ghost" style={{ maxWidth: 300, margin: "10px auto 0", display: "block" }} onClick={() => router.push("/history")}>
          ← 기록으로
        </button>
      </main>
    );
  }

  const total = log.length;
  const anyChecked = log.filter(e => (e.completedCount ?? 0) > 0).length;
  const successRate = Math.round((anyChecked / total) * 100);
  const avgCompleted = log.reduce((s, e) => s + (e.completedCount ?? 0), 0) / total;

  const modeCount: Record<string, number> = {};
  log.forEach(e => { const m = e.mode ?? "Unknown"; modeCount[m] = (modeCount[m] ?? 0) + 1; });

  const patternCount: Record<string, number> = {};
  log.forEach(e => {
    const text = (e.input ?? "").toLowerCase();
    PATTERN_KEYWORDS.forEach(({ keywords, label }) => {
      if (keywords.some(k => text.includes(k))) patternCount[label] = (patternCount[label] ?? 0) + 1;
    });
  });
  const topPatterns = Object.entries(patternCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const actionCount: Record<string, number> = {};
  log.forEach(e => { (e.completedActions ?? []).forEach(a => { actionCount[a] = (actionCount[a] ?? 0) + 1; }); });
  const topActions = Object.entries(actionCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const moodRecords = log.filter(e => e.moodAfter != null);
  const moodBetter = moodRecords.filter(e => e.moodAfter === "better").length;
  const moodSame   = moodRecords.filter(e => e.moodAfter === "same").length;
  const moodWorse  = moodRecords.filter(e => e.moodAfter === "worse").length;

  const recoveryType = getRecoveryType(patternCount, avgCompleted);
  const summary = buildSummary(topPatterns, topActions, total, avgCompleted);
  const stageMsg = total >= 10 ? "당신만의 복구 공식이 꽤 선명해졌어요." : "이제 조금씩 패턴이 보이기 시작했어요.";

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <span className="flight-tag" style={{ marginBottom: 8, display: "inline-flex" }}>✈️ RESET PILOT</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 8, textShadow: "0 2px 8px rgba(10,36,99,0.25)" }}>
            📊 패턴 분석
          </h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{stageMsg}</div>
        </div>
        <button
          onClick={() => router.push("/history")}
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          ← 기록
        </button>
      </div>

      {/* 🧠 AI 패턴 요약 */}
      <div className="ticket animate-fadeInUp" style={{ marginBottom: 14 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>🧠 AI 패턴 요약</div>
        </div>
        <div className="ticket-body">
          {summary.split("\n\n").map((line, i) => (
            <p key={i} style={{ fontSize: 13, color: i === 0 ? "#4e6e82" : "#1A1F36", lineHeight: 1.7, fontWeight: i > 0 ? 700 : 400, margin: i > 0 ? "8px 0 0" : 0 }}>
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* 📈 핵심 지표 */}
      <div className="ticket animate-fadeInUp animate-delay-1" style={{ marginBottom: 14 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>📈 핵심 지표 — {total}일 기준</div>
        </div>
        <div className="ticket-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <StatItem value={`${total}일`}                    label="총 기록"    color="#FF6B35" />
            <StatItem value={`${successRate}%`}              label="시작 성공률" color="#1DB4A8" />
            <StatItem value={`${avgCompleted.toFixed(1)}/3`} label="평균 완료"  color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* 🧩 나의 복구 타입 */}
      <div className="ticket animate-fadeInUp animate-delay-2" style={{ marginBottom: 14 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>🧩 나의 복구 타입</div>
        </div>
        <div className="ticket-body">
          <div style={{ marginBottom: 4, fontSize: 16, fontWeight: 900, color: "#0A2463" }}>{recoveryType.label}</div>
          <div style={{ fontSize: 10, color: "#9ab8cc", marginBottom: 10 }}>{recoveryType.en}</div>
          <div style={{ fontSize: 12, color: "#4e6e82", lineHeight: 1.65, marginBottom: 10 }}>{recoveryType.desc}</div>
          <div style={{ fontSize: 12, color: "#1A1F36", fontWeight: 700, padding: "10px 12px", background: "rgba(240,247,252,0.85)", borderRadius: 8, lineHeight: 1.55, borderLeft: "3px solid #1DB4A8" }}>
            💡 {recoveryType.tip}
          </div>
        </div>
      </div>

      {/* 🔁 자주 나타나는 원인 — accordion */}
      {topPatterns.length > 0 && (
        <div className="ticket animate-fadeInUp animate-delay-3" style={{ marginBottom: 14 }}>
          <div className="ticket-header" style={{ padding: "12px 20px" }}>
            <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>🔁 자주 나타나는 원인</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>탭해서 처방 보기</div>
          </div>
          <div className="ticket-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topPatterns.map(([label, count]) => {
                const pk = PATTERN_KEYWORDS.find(p => p.label === label);
                const isOpen = openPattern === label;
                return (
                  <div key={label}>
                    <div
                      onClick={() => setOpenPattern(isOpen ? null : label)}
                      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1F36", minWidth: 80 }}>{label}</div>
                      <div style={{ flex: 1, height: 6, background: "rgba(165,210,238,0.3)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.round((count / total) * 100)}%`, background: "linear-gradient(90deg, #E53935, #FF6B35)", borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 11, color: "#9ab8cc", minWidth: 24, textAlign: "right" }}>{count}회</div>
                      <div style={{ fontSize: 10, color: "#9ab8cc", marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</div>
                    </div>
                    {isOpen && pk && (
                      <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(240,247,252,0.85)", borderRadius: 10, border: "1px solid rgba(165,210,238,0.4)" }}>
                        <div style={{ fontSize: 10, color: "#FF6B35", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>추천 복구법</div>
                        {pk.rx.map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, fontWeight: 900, color: "#1DB4A8", minWidth: 16 }}>{i + 1}.</span>
                            <span style={{ fontSize: 12, color: "#1A1F36" }}>{r}</span>
                          </div>
                        ))}
                        <div style={{ marginTop: 8, fontSize: 11, color: "#7facca", padding: "7px 10px", background: "rgba(255,245,240,0.75)", borderRadius: 6, borderLeft: "2px solid #FF6B35", lineHeight: 1.5 }}>
                          ⚠️ {pk.warn}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 🚀 나의 복구 공식 */}
      {topPatterns.length > 0 && topActions.length > 0 && (
        <div className="ticket animate-fadeInUp animate-delay-4" style={{ marginBottom: 14 }}>
          <div className="ticket-header" style={{ padding: "12px 20px" }}>
            <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>🚀 나의 복구 공식</div>
          </div>
          <div className="ticket-body">
            <div style={{ marginBottom: 10, fontSize: 12, color: "#4e6e82" }}>
              {topPatterns.slice(0, 2).map(([l]) => l).join(" · ")} 상태가 올 때
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {topActions.slice(0, 3).map(([title], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "#9ab8cc", minWidth: 24 }}>{"→".repeat(i + 1)}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1A1F36" }}>{title}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "#1DB4A8", fontWeight: 700, textAlign: "center" }}>
              이 루트에서 가장 성공률이 높았어요 ✈️
            </div>
          </div>
        </div>
      )}

      {/* ✅ 내가 실제로 해낸 행동 */}
      {topActions.length > 0 && (
        <div className="ticket animate-fadeInUp animate-delay-5" style={{ marginBottom: 14 }}>
          <div className="ticket-header" style={{ padding: "12px 20px" }}>
            <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>✅ 내가 실제로 해낸 행동</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>완료 횟수가 많다는 건, 이 행동들이 당신에게 잘 맞는다는 뜻이에요.</div>
          </div>
          <div className="ticket-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topActions.map(([title, count], i) => (
                <div key={title} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: i === 0 ? "#FF6B35" : "#9ab8cc", minWidth: 20 }}>#{i + 1}</span>
                  <span style={{ fontSize: 13, color: "#1A1F36", flex: 1 }}>{title}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#1DB4A8" }}>{count}회</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✈️ 상태 분포 */}
      <div className="ticket animate-fadeInUp" style={{ marginBottom: 14 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>✈️ 상태 분포</div>
        </div>
        <div className="ticket-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(modeCount).map(([mode, count]) => {
              const colors: Record<string, string> = { "Crash Mode": "#E53935", "Drift Mode": "#F59E0B", "Launch Mode": "#1DB4A8" };
              const icons:  Record<string, string> = { "Crash Mode": "🔴", "Drift Mode": "🟡", "Launch Mode": "🟢" };
              const labels: Record<string, string> = { "Crash Mode": "회복 우선 모드", "Drift Mode": "방향 전환 모드", "Launch Mode": "실행 모드" };
              return (
                <div key={mode} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12 }}>{icons[mode] ?? "⚪"}</span>
                  <div style={{ minWidth: 90 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1F36" }}>{labels[mode] ?? mode}</div>
                    <div style={{ fontSize: 9, color: "#9ab8cc" }}>{mode}</div>
                  </div>
                  <div style={{ flex: 1, height: 6, background: "rgba(165,210,238,0.3)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.round((count / total) * 100)}%`, background: colors[mode] ?? "#9ab8cc", borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#9ab8cc", minWidth: 24, textAlign: "right" }}>{count}회</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 💬 복구 후 기분 */}
      {moodRecords.length > 0 && (
        <div className="ticket animate-fadeInUp" style={{ marginBottom: 14 }}>
          <div className="ticket-header" style={{ padding: "12px 20px" }}>
            <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>💬 복구 후 기분 ({moodRecords.length}회 기록)</div>
          </div>
          <div className="ticket-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <StatItem value={`${moodBetter}회`} label="😊 나아짐"  color="#1DB4A8" />
              <StatItem value={`${moodSame}회`}   label="😐 비슷"    color="#F59E0B" />
              <StatItem value={`${moodWorse}회`}  label="😔 더 힘듦" color="#E53935" />
            </div>
            {moodBetter > 0 && (
              <div style={{ fontSize: 12, color: "#1DB4A8", fontWeight: 700, textAlign: "center" }}>
                {Math.round((moodBetter / moodRecords.length) * 100)}%의 경우 복구 후 기분이 나아졌어요 🛬
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <button className="btn-primary" style={{ marginBottom: 10 }} onClick={() => router.push("/")}>
        {topActions.length > 0 ? "✈️ 잘 맞는 루트로 다시 시작하기" : "✈️ 복구 플랜 시작하기"}
      </button>
      <button className="btn-ghost" onClick={() => router.push("/history")}>
        ← 기록으로 돌아가기
      </button>
    </main>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="gauge" style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#7facca", marginTop: 3 }}>{label}</div>
    </div>
  );
}
