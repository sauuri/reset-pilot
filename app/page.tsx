"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState(5);
  const [anxiety, setAnxiety] = useState(5);
  const [timeLeft, setTimeLeft] = useState("2시간");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, energy, anxiety, timeLeft }),
      });
      const data = await res.json();
      localStorage.setItem("resetResult", JSON.stringify(data));
      const log = JSON.parse(localStorage.getItem("resetLog") || "[]");
      log.unshift({ ...data, date: new Date().toLocaleDateString("ko-KR"), input: text });
      localStorage.setItem("resetLog", JSON.stringify(log.slice(0, 30)));
      router.push("/result");
    } catch {
      alert("오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>

      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="flight-tag">✈️ RESET PILOT</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#1DB4A8" }}>
              <span className="status-dot" style={{ background: "#1DB4A8" }} />
              ONLINE
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.35, color: "#1A1F36", margin: 0 }}>
            오늘 망한 것 같아도,<br />
            <span style={{ color: "#FF6B35" }}>아직 착륙은 가능해.</span>
          </h1>
        </div>
        <button onClick={() => router.push("/history")} style={{ background: "transparent", border: "none", color: "#A0A8C0", fontSize: 22, cursor: "pointer" }}>
          📦
        </button>
      </div>

      {/* 부제 */}
      <p style={{ color: "#6B7494", fontSize: 13, lineHeight: 1.7, marginBottom: 24, padding: "12px 16px", background: "#F0F2F7", borderRadius: 10, borderLeft: "3px solid #0A2463" }}>
        지금 상태를 솔직하게 입력해줘. AI가 감정과 사실을 분리하고 <strong style={{ color: "#1A1F36" }}>3단계 복구 루트</strong>를 만들어줄게.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* 상태 입력 */}
        <div className="card">
          <label style={{ fontSize: 12, color: "#6B7494", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>📡</span> 현재 상태 보고
          </label>
          <textarea
            rows={4}
            placeholder="예: 오늘 늦게 일어났고 방이 너무 지저분해. 면접 결과 기다리느라 불안하고 아무것도 하기 싫어."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* 에너지 */}
        <div className="card">
          <SliderItem
            label="연료 잔량 (에너지)"
            emoji={energy <= 3 ? "🪫" : energy <= 6 ? "🔋" : "⚡"}
            value={energy}
            onChange={setEnergy}
            low="방전"
            high="MAX"
            color="#FF6B35"
          />
        </div>

        {/* 불안 */}
        <div className="card">
          <SliderItem
            label="난기류 강도 (불안/스트레스)"
            emoji={anxiety >= 8 ? "🌪️" : anxiety >= 5 ? "⛅" : "☀️"}
            value={anxiety}
            onChange={setAnxiety}
            low="잔잔"
            high="폭풍"
            color="#E53935"
          />
        </div>

        {/* 남은 시간 */}
        <div className="card">
          <label style={{ fontSize: 12, color: "#6B7494", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16 }}>⏱️</span> 착륙까지 남은 시간
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {["1시간 미만", "2시간", "3시간 이상", "종일"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeLeft(t)}
                style={{
                  padding: "10px 4px",
                  borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: timeLeft === t ? "#0A2463" : "#E2E6F0",
                  background: timeLeft === t ? "#0A2463" : "transparent",
                  color: timeLeft === t ? "white" : "#6B7494",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="runway-divider">복구 루트 생성</div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !text.trim()}>
          {loading ? "🛰️ 복구 루트 계산 중..." : "✈️ 비상 착륙 시작하기"}
        </button>

      </div>
    </main>
  );
}

function SliderItem({ label, emoji, value, onChange, low, high, color }: {
  label: string; emoji: string; value: number;
  onChange: (v: number) => void; low: string; high: string; color: string;
}) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "#6B7494" }}>{label}</span>
        <span style={{ fontSize: 18 }}>
          {emoji} <span className="gauge" style={{ fontWeight: 900, color, fontSize: 16 }}>{value}</span>
          <span style={{ fontSize: 11, color: "#A0A8C0" }}>/10</span>
        </span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={(e) => onChange(Number(e.target.value))} className="slider" />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#C8CFDE" }}>{low}</span>
        <span style={{ fontSize: 11, color: "#C8CFDE" }}>{high}</span>
      </div>
    </>
  );
}
