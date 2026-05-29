"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "./components/SplashScreen";
import LoadingScreen from "./components/LoadingScreen";
import TakeoffAnimation from "./components/TakeoffAnimation";
import Onboarding from "./components/Onboarding";
import { supabase } from "./utils/supabase";
import { saveLogToSupabase } from "./utils/logs";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [text, setText] = useState("");
  const [user, setUser] = useState<{ id: string; email?: string } | null | undefined>(undefined);

  useEffect(() => {
    if (!sessionStorage.getItem("rp_entered")) setShowSplash(true);
    if (!localStorage.getItem("rp_onboarded")) setShowOnboarding(true);
    setInitialized(true);
    supabase.auth.getUser().then(({ data, error }) => {
      if (error) { setUser(null); return; }
      setUser(data.user ?? null);
    });
  }, []);

  function handleEnter() {
    sessionStorage.setItem("rp_entered", "1");
    setShowSplash(false);
  }
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [timeLeft, setTimeLeft] = useState("2시간");
  const [loading, setLoading] = useState(false);
  const [flightStatus, setFlightStatus] = useState<"ready" | "flying" | "arrived">("ready");
  const [streak, setStreak] = useState(0);
  const [quickMode, setQuickMode] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("resetLog");
    if (!raw) return;
    const logs: Array<{ date: string }> = JSON.parse(raw);
    if (logs.length === 0) return;
    // 날짜 파싱: "2026. 5. 29." → Date
    const toDate = (s: string) => {
      const parts = s.replace(/\.\s*/g, "-").replace(/-$/, "").split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    };
    const dates = [...new Set(logs.map(l => l.date))].map(toDate).sort((a, b) => b.getTime() - a.getTime());
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let count = 0;
    let cursor = new Date(today);
    for (const d of dates) {
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === cursor.getTime()) { count++; cursor.setDate(cursor.getDate() - 1); }
      else if (d.getTime() < cursor.getTime()) break;
    }
    setStreak(count);
  }, []);

  function buildPersonalization() {
    const raw = localStorage.getItem("resetLog");
    if (!raw) return null;
    const logs: Array<{ actions?: { name: string; title: string }[]; completedActions?: string[] }> = JSON.parse(raw);
    if (logs.length < 2) return null;

    const counts: Record<string, { total: number; done: number }> = {
      "Body Reset": { total: 0, done: 0 },
      "Space Reset": { total: 0, done: 0 },
      "Life Reset": { total: 0, done: 0 },
    };
    const recentActions: string[] = [];

    logs.slice(0, 10).forEach((log, i) => {
      (log.actions ?? []).forEach(a => {
        if (counts[a.name]) {
          counts[a.name].total++;
          if ((log.completedActions ?? []).includes(a.title)) counts[a.name].done++;
        }
        if (i < 3) recentActions.push(a.title);
      });
    });

    const completionRates = {
      "Body Reset":  counts["Body Reset"].total  ? Math.round(counts["Body Reset"].done  / counts["Body Reset"].total  * 100) : 50,
      "Space Reset": counts["Space Reset"].total ? Math.round(counts["Space Reset"].done / counts["Space Reset"].total * 100) : 50,
      "Life Reset":  counts["Life Reset"].total  ? Math.round(counts["Life Reset"].done  / counts["Life Reset"].total  * 100) : 50,
    };

    return { completionRates, recentActions: [...new Set(recentActions)] };
  }

  async function handleQuickSubmit() {
    setLoading(true);
    setFlightStatus("flying");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const quickText = `빠른 복구 요청. 에너지 ${energy}/10, 불안 ${anxiety}/10. 지금 당장 가능한 가장 작은 행동 3개를 주세요.`;
      const personalization = buildPersonalization();
      const res = await fetch(`${apiBase}/api/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickText, energy, anxiety, timeLeft: "30분", personalization }),
      });
      const data = await res.json();
      const ts = Date.now();
      const logEntry = { ...data, date: new Date().toLocaleDateString("ko-KR"), input: quickText, energy, anxiety, completedCount: 0, completedActions: [], moodAfter: null, ts };
      localStorage.setItem("resetResult", JSON.stringify(data));
      const log = JSON.parse(localStorage.getItem("resetLog") || "[]");
      log.unshift(logEntry);
      localStorage.setItem("resetLog", JSON.stringify(log.slice(0, 30)));
      saveLogToSupabase(logEntry);
      setFlightStatus("arrived");
    } catch {
      alert("오류가 발생했어요. 다시 시도해주세요.");
      setFlightStatus("ready");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setFlightStatus("flying");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const personalization = buildPersonalization();
      const res = await fetch(`${apiBase}/api/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, energy, anxiety, timeLeft, personalization }),
      });
      const data = await res.json();
      const ts = Date.now();
      const logEntry = { ...data, date: new Date().toLocaleDateString("ko-KR"), input: text, energy, anxiety, completedCount: 0, completedActions: [], moodAfter: null, ts };
      localStorage.setItem("resetResult", JSON.stringify(data));
      const log = JSON.parse(localStorage.getItem("resetLog") || "[]");
      log.unshift(logEntry);
      localStorage.setItem("resetLog", JSON.stringify(log.slice(0, 30)));
      saveLogToSupabase(logEntry);
      setFlightStatus("arrived");
    } catch {
      alert("오류가 발생했어요. 다시 시도해주세요.");
      setFlightStatus("ready");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    {showSplash && <SplashScreen onEnter={handleEnter} />}
    {loading && <LoadingScreen />}
    {flightStatus === "arrived" && <TakeoffAnimation onDone={() => router.push("/result")} />}
    {showOnboarding && <Onboarding onDone={() => { localStorage.setItem("rp_onboarded", "1"); setShowOnboarding(false); }} />}

    {/* 빠른 복구 모달 */}
    {quickMode && (
      <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(1,8,16,0.85)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.95)", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ background: "linear-gradient(135deg, #0A2463, #163678)", padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 2, marginBottom: 4 }}>QUICK RECOVERY</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>⚡ 30초 복구</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>지금 상태만 알려주면 바로 플랜 드릴게요.</div>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4e6e82", marginBottom: 8 }}>⚡ 에너지 {energy}/10</div>
              <input type="range" min={1} max={10} value={energy} onChange={e => setEnergy(Number(e.target.value))} style={{ width: "100%", accentColor: "#1DB4A8" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4e6e82", marginBottom: 8 }}>😰 불안/스트레스 {anxiety}/10</div>
              <input type="range" min={1} max={10} value={anxiety} onChange={e => setAnxiety(Number(e.target.value))} style={{ width: "100%", accentColor: "#E53935" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setQuickMode(false)} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid rgba(165,210,238,0.5)", background: "transparent", color: "#7facca", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>취소</button>
              <button onClick={() => { setQuickMode(false); handleQuickSubmit(); }} style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0A2463, #163678)", color: "white", fontSize: 14, fontWeight: 900, cursor: "pointer" }}>⚡ 바로 복구 시작</button>
            </div>
          </div>
        </div>
      </div>
    )}

    <main style={{ maxWidth: 480, margin: "0 auto", padding: "12px 14px 40px", visibility: (!initialized || loading || flightStatus === "arrived") ? "hidden" : "visible" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span className="flight-tag" style={{ flexShrink: 0 }}>✈️ RESET PILOT</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11,
              whiteSpace: "nowrap", flexShrink: 0,
              color: flightStatus === "arrived" ? "#4ade80" : "rgba(255,255,255,0.85)",
              transition: "color 0.3s",
            }}>
              <span className="status-dot" style={{
                background: flightStatus === "ready" ? "#f59e0b" : flightStatus === "flying" ? "#6ee7e0" : "#4ade80",
                animation: flightStatus === "flying" ? "blink 1.5s infinite" : "none",
                transition: "background 0.3s",
              }} />
              {flightStatus === "ready" && "준비 중"}
              {flightStatus === "flying" && "운항 중"}
              {flightStatus === "arrived" && "도착 ✓"}
            </span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, lineHeight: 1.35, color: "white", margin: 0, textShadow: "0 2px 10px rgba(10,36,99,0.25)" }}>
            오늘 망한 것 같아도<br />
            <span style={{ color: "#FFE066", whiteSpace: "nowrap" }}>딱 하나만 다시 시작해봐요.</span>
          </h1>
          {streak >= 2 && (
            <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(255,160,0,0.18)", border: "1px solid rgba(255,160,0,0.35)", borderRadius: 20, padding: "3px 10px", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 13, lineHeight: 1 }}>🔥</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#FFB830" }}>{streak}일 연속 복구 중</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
          {/* 1행: 로그인/아웃 */}
          {user ? (
            <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }} style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.55)", borderRadius: 9, padding: "5px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
              로그아웃
            </button>
          ) : user === null ? (
            <button onClick={() => router.push("/login")} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: 9, padding: "5px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer", textAlign: "center" }}>
              로그인
            </button>
          ) : null}
          {/* 2행: ⚡ 📋 🔔 */}
          <div style={{ display: "flex", gap: 5 }}>
            <button onClick={() => setQuickMode(true)} style={{ background: "rgba(255,200,0,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,200,0,0.35)", color: "#FFE066", borderRadius: 9, padding: "6px 9px", fontSize: 15, cursor: "pointer", fontWeight: 900, lineHeight: 1 }} title="30초 빠른 복구">⚡</button>
            <button onClick={() => router.push("/history")} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: 9, padding: "6px 9px", fontSize: 15, cursor: "pointer", lineHeight: 1 }}>📋</button>
            <button onClick={() => router.push("/notifications")} style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)", color: "white", borderRadius: 9, padding: "6px 9px", fontSize: 15, cursor: "pointer", lineHeight: 1 }}>🔔</button>
          </div>
        </div>
      </div>

      {/* 탑승권 카드 */}
      <div className="ticket animate-fadeInUp">

        {/* 항공사 헤더 */}
        <div className="ticket-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>TODAY&apos;S BOARDING PASS</div>
              <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 0.5, color: "white" }}>복구 플랜 만들기</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>FLIGHT</div>
              <div className="gauge" style={{ fontSize: 16, fontWeight: 900, color: "#6ee7e0" }}>RST-001</div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="ticket-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* 상태 입력 */}
            <div>
              <div className="ticket-label">현재 상태 — 오늘 어떤 하루였어?</div>
              {/* 상황 빠른선택 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0" }}>
                {[
                  { emoji: "💀", tag: "완전 번아웃",   text: "오늘 완전 번아웃이야. 아무것도 하기 싫고 머리도 멍해. 그냥 다 놔버리고 싶어." },
                  { emoji: "😴", tag: "늦잠·무기력",   text: "늦게 일어나서 하루 망친 것 같아. 무기력하고 아무 의욕이 없어." },
                  { emoji: "😰", tag: "불안·걱정",      text: "불안하고 걱정이 너무 많아. 해야 할 게 쌓여있는데 시작을 못 하겠어." },
                  { emoji: "📱", tag: "폰만 보다가",    text: "하루종일 폰만 봤어. 유튜브, SNS 돌리다 시간 다 갔어. 해야 할 게 있는데 못 했어." },
                  { emoji: "📚", tag: "공부 못한 날",   text: "오늘 공부를 거의 못 했어. 집중이 안 되고 자꾸 딴짓만 했어." },
                  { emoji: "🏠", tag: "방이 엉망",      text: "방이 너무 지저분한데 치울 의욕이 없어. 어디서부터 시작해야 할지 모르겠어." },
                ].map(({ emoji, tag, text: tpl }) => (
                  <button
                    key={tag}
                    onClick={() => setText(tpl)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20,
                      border: `1.5px solid ${text === tpl ? "rgba(29,180,168,0.7)" : "rgba(165,210,238,0.55)"}`,
                      background: text === tpl ? "rgba(29,180,168,0.12)" : "rgba(255,255,255,0.35)",
                      backdropFilter: "blur(4px)",
                      color: text === tpl ? "#1DB4A8" : "#2a4a60",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {emoji} {tag}
                  </button>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="또는 직접 입력: 오늘 늦게 일어났고 방이 지저분해."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* 에너지 + 불안 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div className="ticket-label">에너지 잔량</div>
                <div style={{ marginTop: 2, marginBottom: 4 }}>
                  <span className="gauge" style={{ fontSize: 22, fontWeight: 900, color: "#FF6B35" }}>{energy}</span>
                  <span style={{ fontSize: 11, color: "#9ab8cc" }}>/10</span>
                </div>
                <input type="range" min={1} max={10} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="slider" />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: "#9ab8cc" }}>방전</span>
                  <span style={{ fontSize: 10, color: "#9ab8cc" }}>충전</span>
                </div>
              </div>
              <div>
                <div className="ticket-label">스트레스 강도</div>
                <div style={{ marginTop: 2, marginBottom: 4 }}>
                  <span className="gauge" style={{ fontSize: 22, fontWeight: 900, color: "#E53935" }}>{anxiety}</span>
                  <span style={{ fontSize: 11, color: "#9ab8cc" }}>/10</span>
                </div>
                <input type="range" min={1} max={10} value={anxiety} onChange={(e) => setAnxiety(Number(e.target.value))} className="slider" />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                  <span style={{ fontSize: 10, color: "#9ab8cc" }}>괜찮음</span>
                  <span style={{ fontSize: 10, color: "#9ab8cc" }}>폭발직전</span>
                </div>
              </div>
            </div>

            {/* 남은 시간 */}
            <div>
              <div className="ticket-label">오늘 쓸 수 있는 시간</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 5, marginTop: 4 }}>
                {["1시간 미만", "2시간", "3시간 이상", "종일"].map((t) => (
                  <button key={t} onClick={() => setTimeLeft(t)} style={{
                    padding: "9px 4px",
                    borderRadius: 8,
                    border: "1.5px solid",
                    borderColor: timeLeft === t ? "#0A2463" : "rgba(165,210,238,0.5)",
                    background: timeLeft === t ? "#0A2463" : "rgba(255,255,255,0.4)",
                    color: timeLeft === t ? "white" : "#4e6e82",
                    fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 분리선 */}
        <div className="ticket-tear" />

        {/* 스텁 */}
        <div className="ticket-stub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 20, flex: 1 }}>
            <div>
              <div className="ticket-label">ENERGY</div>
              <div className="gauge" style={{ fontSize: 18, fontWeight: 900, color: "#FF6B35" }}>{energy}/10</div>
            </div>
            <div>
              <div className="ticket-label">STRESS</div>
              <div className="gauge" style={{ fontSize: 18, fontWeight: 900, color: "#E53935" }}>{anxiety}/10</div>
            </div>
            <div>
              <div className="ticket-label">STATUS</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: text.trim() ? "#1DB4A8" : "#9ab8cc" }}>
                {text.trim() ? "READY ✓" : "PENDING"}
              </div>
            </div>
          </div>
          <div className="barcode" style={{ width: 56, flexShrink: 0 }} />
        </div>
      </div>

      {/* 버튼 */}
      <button
        className="btn-primary animate-fadeInUp animate-delay-1"
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        style={{ marginTop: 28 }}
      >
        {loading ? "🛰️ 플랜 생성 중..." : "✈️ 지금 할 일 3개 받기"}
      </button>

      {/* 위기 상담 */}
      <div style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.38)", lineHeight: 1.9 }}>
        혼자 감당하기 너무 힘들다면
        <div style={{ marginTop: 4, display: "flex", justifyContent: "center", gap: 16 }}>
          <a href="tel:1393" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, textDecoration: "none" }}>자살예방상담전화 1393</a>
          <a href="tel:15770199" style={{ color: "rgba(255,255,255,0.6)", fontWeight: 700, textDecoration: "none" }}>정신건강위기 1577-0199</a>
        </div>
        <div style={{ fontSize: 11, marginTop: 3, color: "rgba(255,255,255,0.25)" }}>24시간 · 무료 · 익명</div>
      </div>

    </main>
    </>
  );
}
