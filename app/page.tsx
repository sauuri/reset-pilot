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
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: "#ff6b35", fontWeight: 700, marginBottom: 8, letterSpacing: 2 }}>
          RESET PILOT
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.3, marginBottom: 8 }}>
          오늘 망했어도<br />괜찮아 🔥
        </h1>
        <p style={{ color: "#888", fontSize: 14 }}>
          지금 상태를 솔직하게 말해줘. AI가 복구 루트 찾아줄게.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <label style={{ fontSize: 13, color: "#888", marginBottom: 8, display: "block" }}>
            지금 어떤 상태야? (자유롭게 써줘)
          </label>
          <textarea
            rows={4}
            placeholder="예: 3시에 잠들어서 11시에 일어남. 방 개판. 면접 결과 기다리느라 멘탈 나감. 공부 하나도 못했음."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="card">
          <SliderItem
            label="에너지"
            emoji={energy <= 3 ? "🪫" : energy <= 6 ? "🔋" : "⚡"}
            value={energy}
            onChange={setEnergy}
            low="방전"
            high="넘침"
          />
        </div>

        <div className="card">
          <SliderItem
            label="불안 / 스트레스"
            emoji={anxiety >= 8 ? "😵" : anxiety >= 5 ? "😰" : "😌"}
            value={anxiety}
            onChange={setAnxiety}
            low="없음"
            high="폭발"
          />
        </div>

        <div className="card">
          <label style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "block" }}>
            ⏰ 오늘 남은 시간
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {["1시간 미만", "2시간", "3시간 이상", "종일"].map((t) => (
              <button
                key={t}
                onClick={() => setTimeLeft(t)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 8,
                  border: "1px solid",
                  borderColor: timeLeft === t ? "#ff6b35" : "#2a2a2a",
                  background: timeLeft === t ? "#ff6b35" : "transparent",
                  color: timeLeft === t ? "white" : "#888",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !text.trim()}>
          {loading ? "AI가 루트 찾는 중... 🔍" : "오늘 복구 플랜 만들기 →"}
        </button>

        <button
          onClick={() => router.push("/history")}
          style={{
            background: "transparent",
            border: "none",
            color: "#555",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "center",
          }}
        >
          📅 이전 복구 기록 보기
        </button>
      </div>
    </main>
  );
}

function SliderItem({
  label, emoji, value, onChange, low, high,
}: {
  label: string;
  emoji: string;
  value: number;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "#888" }}>{label}</span>
        <span style={{ fontSize: 18 }}>
          {emoji} <span style={{ fontWeight: 700, color: "#f0f0f0" }}>{value}</span>/10
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider"
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#444" }}>{low}</span>
        <span style={{ fontSize: 11, color: "#444" }}>{high}</span>
      </div>
    </>
  );
}
