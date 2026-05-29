"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface NotifSchedule { hour: number; minute: number; enabled: boolean; label: string }

const PRESETS: NotifSchedule[] = [
  { hour: 9,  minute: 0,  enabled: false, label: "오전 9시 — 하루 시작" },
  { hour: 14, minute: 0,  enabled: false, label: "오후 2시 — 흐트러진 오후" },
  { hour: 21, minute: 0,  enabled: false, label: "저녁 9시 — 하루 마무리" },
];

const MESSAGES = [
  "오늘 0점으로 끝내기 전에, 딱 하나만 복구해볼까요? ✈️",
  "흐트러진 오후라면, 3분짜리 복구 플랜을 받아보세요.",
  "오늘 어땠어요? 작게라도 기록해두면 내일이 달라져요.",
];

export default function NotificationsPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<NotifSchedule[]>(PRESETS);
  const [customHour, setCustomHour] = useState(20);
  const [customMin, setCustomMin] = useState(30);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("rp_notifications");
    if (raw) setSchedules(JSON.parse(raw));
  }, []);

  async function requestPermission() {
    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      const { display } = await LocalNotifications.requestPermissions();
      setPermGranted(display === "granted");
    } catch {
      // 웹 환경 — Notification API 사용
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        setPermGranted(result === "granted");
      } else {
        setPermGranted(false);
      }
    }
  }

  async function saveAndSchedule() {
    const enabled = schedules.filter(s => s.enabled);
    localStorage.setItem("rp_notifications", JSON.stringify(schedules));

    try {
      const { LocalNotifications } = await import("@capacitor/local-notifications");
      await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }] });

      const notifications = enabled.map((s, i) => {
        const now = new Date();
        const trigger = new Date(now);
        trigger.setHours(s.hour, s.minute, 0, 0);
        if (trigger <= now) trigger.setDate(trigger.getDate() + 1);
        return {
          id: i + 1,
          title: "Reset Pilot ✈️",
          body: MESSAGES[i % MESSAGES.length],
          schedule: { at: trigger, repeats: true, every: "day" as const },
          sound: undefined,
          actionTypeId: "",
          extra: null,
        };
      });

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }
    } catch {
      // 웹 환경에서는 알림 미리보기만
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggle(i: number) {
    setSchedules(prev => prev.map((s, idx) => idx === i ? { ...s, enabled: !s.enabled } : s));
  }

  function addCustom() {
    const label = `${customHour}:${String(customMin).padStart(2, "0")} — 직접 설정`;
    setSchedules(prev => [...prev, { hour: customHour, minute: customMin, enabled: true, label }]);
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px 80px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <span className="flight-tag" style={{ marginBottom: 8, display: "inline-flex" }}>✈️ RESET PILOT</span>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 8 }}>🔔 알림 설정</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>무너질 때 다시 들어오게 만드는 장치</div>
        </div>
        <button onClick={() => router.push("/")} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          ← 홈
        </button>
      </div>

      {/* 권한 요청 */}
      {permGranted === null && (
        <div className="ticket" style={{ marginBottom: 14 }}>
          <div className="ticket-body" style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1F36", marginBottom: 8 }}>알림 권한이 필요해요</div>
            <div style={{ fontSize: 12, color: "#7facca", marginBottom: 16, lineHeight: 1.6 }}>
              무너질 때 딱 맞는 타이밍에 알림을 보내드릴게요.<br />언제든 설정에서 끌 수 있어요.
            </div>
            <button onClick={requestPermission} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #0A2463, #163678)", color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              알림 허용하기
            </button>
          </div>
        </div>
      )}

      {permGranted === false && (
        <div className="ticket" style={{ marginBottom: 14 }}>
          <div className="ticket-body" style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#E53935", fontWeight: 700, marginBottom: 6 }}>알림 권한이 거부됐어요</div>
            <div style={{ fontSize: 12, color: "#7facca", lineHeight: 1.6 }}>
              설정 → 앱 → Reset Pilot → 알림에서<br />직접 켜주세요.
            </div>
          </div>
        </div>
      )}

      {/* 알림 시간 설정 */}
      <div className="ticket" style={{ marginBottom: 14 }}>
        <div className="ticket-header" style={{ padding: "12px 20px" }}>
          <div className="ticket-label" style={{ color: "rgba(255,255,255,0.5)" }}>⏰ 알림 시간 선택</div>
        </div>
        <div className="ticket-body">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {schedules.map((s, i) => (
              <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: s.enabled ? "rgba(29,180,168,0.08)" : "rgba(255,255,255,0.4)", border: `1.5px solid ${s.enabled ? "#1DB4A8" : "rgba(165,210,238,0.4)"}`, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#1A1F36" }}>
                    {String(s.hour).padStart(2, "0")}:{String(s.minute).padStart(2, "0")}
                  </div>
                  <div style={{ fontSize: 11, color: "#7facca", marginTop: 2 }}>{s.label}</div>
                </div>
                <div style={{ width: 44, height: 26, borderRadius: 13, background: s.enabled ? "#1DB4A8" : "rgba(165,210,238,0.3)", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ position: "absolute", top: 3, left: s.enabled ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            ))}
          </div>

          {/* 커스텀 시간 추가 */}
          <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(240,247,252,0.6)", borderRadius: 10, border: "1px solid rgba(165,210,238,0.3)" }}>
            <div style={{ fontSize: 11, color: "#7facca", fontWeight: 700, marginBottom: 10 }}>+ 다른 시간 추가</div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select value={customHour} onChange={e => setCustomHour(Number(e.target.value))}
                style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "1.5px solid rgba(165,210,238,0.5)", background: "white", fontSize: 14, fontWeight: 700, color: "#1A1F36", appearance: "none", textAlign: "center" }}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, "0")}시</option>
                ))}
              </select>
              <select value={customMin} onChange={e => setCustomMin(Number(e.target.value))}
                style={{ flex: 1, padding: "8px 6px", borderRadius: 8, border: "1.5px solid rgba(165,210,238,0.5)", background: "white", fontSize: 14, fontWeight: 700, color: "#1A1F36", appearance: "none", textAlign: "center" }}>
                {[0, 10, 20, 30, 40, 50].map(m => (
                  <option key={m} value={m}>{String(m).padStart(2, "0")}분</option>
                ))}
              </select>
              <button onClick={addCustom} style={{ flex: 1, padding: "9px", borderRadius: 8, border: "none", background: "#0A2463", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>추가</button>
            </div>
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <button
        onClick={saveAndSchedule}
        style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", cursor: "pointer", background: saved ? "linear-gradient(135deg, #1DB4A8, #0a8a80)" : "linear-gradient(135deg, #0A2463, #163678)", color: "white", fontSize: 16, fontWeight: 900, transition: "background 0.3s" }}
      >
        {saved ? "✅ 저장됐어요!" : "🔔 알림 저장하기"}
      </button>
    </main>
  );
}
