"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "./components/SplashScreen";
import LoadingScreen from "./components/LoadingScreen";
import TakeoffAnimation from "./components/TakeoffAnimation";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!sessionStorage.getItem("rp_entered")) setShowSplash(true);
    setInitialized(true);
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

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setFlightStatus("flying");
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, energy, anxiety, timeLeft }),
      });
      const data = await res.json();
      localStorage.setItem("resetResult", JSON.stringify(data));
      const log = JSON.parse(localStorage.getItem("resetLog") || "[]");
      log.unshift({ ...data, date: new Date().toLocaleDateString("ko-KR"), input: text, energy, anxiety, completedCount: 0, completedActions: [], moodAfter: null });
      localStorage.setItem("resetLog", JSON.stringify(log.slice(0, 30)));
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
          <h1 style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.35, color: "white", margin: 0, textShadow: "0 2px 10px rgba(10,36,99,0.25)" }}>
            오늘 망한 것 같아도<br />
            <span style={{ color: "#FFE066" }}>딱 하나만 다시 시작해봐요.</span>
          </h1>
        </div>
        <button onClick={() => router.push("/history")} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 10, padding: "8px 10px", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>
          📋
        </button>
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
              {/* 빠른 태그 */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0" }}>
                {["늦게 일어남", "무기력함", "불안함", "방 엉망", "할 일 많음", "폰만 봄", "아무것도 하기 싫음"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setText((prev) => prev ? `${prev}, ${tag}` : tag)}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 20,
                      border: "1.5px solid rgba(165,210,238,0.55)",
                      background: "rgba(255,255,255,0.35)", backdropFilter: "blur(4px)",
                      color: "#2a4a60", cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {tag}
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
