let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
  } catch { return null; }
}

// 버튼 탭
export function playTap() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(700, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(500, c.currentTime + 0.06);
  g.gain.setValueAtTime(0.12, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  o.start(); o.stop(c.currentTime + 0.08);
}

// 액션 체크
export function playCheck() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.connect(g); g.connect(c.destination);
  o.type = "sine";
  o.frequency.setValueAtTime(880, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.06);
  g.gain.setValueAtTime(0.18, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.14);
  o.start(); o.stop(c.currentTime + 0.14);
}

// 이륙 엔진 + 휘파람
export function playTakeoff() {
  const c = ctx(); if (!c) return;
  const len = (c.sampleRate * 2.5) | 0;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(150, c.currentTime);
  filter.frequency.exponentialRampToValueAtTime(900, c.currentTime + 2);
  filter.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.4, c.currentTime + 0.8);
  g.gain.setValueAtTime(0.35, c.currentTime + 1.6);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
  noise.connect(filter); filter.connect(g); g.connect(c.destination);
  noise.start(); noise.stop(c.currentTime + 2.5);
}

// 착륙 — 타이어 충격 + 감속
export function playLanding() {
  const c = ctx(); if (!c) return;
  // 타이어 충격음
  const o = c.createOscillator(), g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(80, c.currentTime + 0.4);
  o.frequency.exponentialRampToValueAtTime(30, c.currentTime + 0.8);
  g.gain.setValueAtTime(0, c.currentTime + 0.4);
  g.gain.linearRampToValueAtTime(0.55, c.currentTime + 0.42);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
  o.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + 1);
  // 감속 노이즈
  const len = (c.sampleRate * 1.8) | 0;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.setValueAtTime(2000, c.currentTime + 0.4);
  filter.frequency.exponentialRampToValueAtTime(100, c.currentTime + 2.2);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.18, c.currentTime + 0.4);
  ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.2);
  noise.connect(filter); filter.connect(ng); ng.connect(c.destination);
  noise.start(c.currentTime + 0.4); noise.stop(c.currentTime + 2.2);
}

// 타이머 완료 — 벨
export function playTimerDone() {
  const c = ctx(); if (!c) return;
  [523, 659, 784, 1047].forEach((f, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.connect(g); g.connect(c.destination);
    const t = c.currentTime + i * 0.15;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o.start(t); o.stop(t + 0.55);
  });
}

// 뱃지 획득 — 팡파레
export function playBadge() {
  const c = ctx(); if (!c) return;
  const notes  = [523, 659, 784, 1047, 784, 1047, 1319];
  const times  = [0, 0.1, 0.2, 0.35, 0.5, 0.62, 0.76];
  notes.forEach((f, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = i >= 5 ? "sine" : "triangle";
    o.connect(g); g.connect(c.destination);
    const t = c.currentTime + times[i];
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.start(t); o.stop(t + 0.28);
  });
}

// 기분 선택 — 팝
export function playPop() {
  const c = ctx(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(500, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(250, c.currentTime + 0.1);
  g.gain.setValueAtTime(0.18, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.14);
  o.connect(g); g.connect(c.destination);
  o.start(); o.stop(c.currentTime + 0.14);
}

// 저널 저장 — 부드러운 챠임
export function playChime() {
  const c = ctx(); if (!c) return;
  [880, 1108].forEach((f, i) => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine";
    o.connect(g); g.connect(c.destination);
    const t = c.currentTime + i * 0.12;
    o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    o.start(t); o.stop(t + 0.4);
  });
}
