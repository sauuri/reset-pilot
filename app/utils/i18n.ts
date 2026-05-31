export type Lang = "ko" | "en";

type Situation = { emoji: string; tag: string; text: string };

export const translations = {
  ko: {
    // 헤더 / 공통
    statusReady: "준비 중",
    statusFlying: "운항 중",
    statusArrived: "도착 ✓",
    heroLine1: "오늘 망한 것 같아도",
    heroLine2: "딱 하나만 다시 시작해봐요.",
    streakSuffix: "일 연속 복구 중",
    logout: "로그아웃",
    login: "로그인",

    // 빠른 복구 모달
    quickRecovery: "QUICK RECOVERY",
    quickHeading: "⚡ 30초 복구",
    quickSub: "지금 상태만 알려주면 바로 플랜 드릴게요.",
    quickEnergy: "⚡ 에너지",
    quickStress: "😰 불안/스트레스",
    cancel: "취소",
    quickStart: "⚡ 바로 복구 시작",

    // 탑승권
    planTitle: "복구 플랜 만들기",
    statusInputLabel: "현재 상태 — 오늘 어떤 하루였어?",
    placeholder: "또는 직접 입력: 오늘 늦게 일어났고 방이 지저분해.",
    energyLabel: "에너지 잔량",
    energyLow: "방전",
    energyHigh: "충전",
    stressLabel: "스트레스 강도",
    stressLow: "괜찮음",
    stressHigh: "폭발직전",
    timeLabel: "오늘 쓸 수 있는 시간",
    timeOptions: ["1시간 미만", "2시간", "3시간 이상", "종일"],
    statusReadyShort: "READY ✓",
    statusPending: "PENDING",

    submitLoading: "🛰️ 플랜 생성 중...",
    submitBtn: "✈️ 지금 할 일 3개 받기",

    crisisText: "혼자 감당하기 너무 힘들다면",
    crisis1: "자살예방상담전화 1393",
    crisis2: "정신건강위기 1577-0199",
    crisisNote: "24시간 · 무료 · 익명",

    errorMsg: "오류가 발생했어요. 다시 시도해주세요.",
    quickTextTemplate: (energy: number, anxiety: number) =>
      `빠른 복구 요청. 에너지 ${energy}/10, 불안 ${anxiety}/10. 지금 당장 가능한 가장 작은 행동 3개를 주세요.`,

    situations: [
      { emoji: "💀", tag: "완전 번아웃", text: "오늘 완전 번아웃이야. 아무것도 하기 싫고 머리도 멍해. 그냥 다 놔버리고 싶어." },
      { emoji: "😴", tag: "늦잠·무기력", text: "늦게 일어나서 하루 망친 것 같아. 무기력하고 아무 의욕이 없어." },
      { emoji: "😰", tag: "불안·걱정", text: "불안하고 걱정이 너무 많아. 해야 할 게 쌓여있는데 시작을 못 하겠어." },
      { emoji: "📱", tag: "폰만 보다가", text: "하루종일 폰만 봤어. 유튜브, SNS 돌리다 시간 다 갔어. 해야 할 게 있는데 못 했어." },
      { emoji: "📚", tag: "공부 못한 날", text: "오늘 공부를 거의 못 했어. 집중이 안 되고 자꾸 딴짓만 했어." },
      { emoji: "🏠", tag: "방이 엉망", text: "방이 너무 지저분한데 치울 의욕이 없어. 어디서부터 시작해야 할지 모르겠어." },
    ] as Situation[],
  },

  en: {
    statusReady: "Ready",
    statusFlying: "In flight",
    statusArrived: "Arrived ✓",
    heroLine1: "Even if today felt like a wreck,",
    heroLine2: "just restart one thing.",
    streakSuffix: "-day recovery streak",
    logout: "Log out",
    login: "Log in",

    quickRecovery: "QUICK RECOVERY",
    quickHeading: "⚡ 30-Second Reset",
    quickSub: "Just tell us how you feel and we'll make a plan.",
    quickEnergy: "⚡ Energy",
    quickStress: "😰 Anxiety/Stress",
    cancel: "Cancel",
    quickStart: "⚡ Start Now",

    planTitle: "Build Recovery Plan",
    statusInputLabel: "Current state — how was your day?",
    placeholder: "Or type your own: I woke up late and my room is a mess.",
    energyLabel: "Energy Level",
    energyLow: "Empty",
    energyHigh: "Full",
    stressLabel: "Stress Level",
    stressLow: "Calm",
    stressHigh: "About to burst",
    timeLabel: "Time available today",
    timeOptions: ["< 1hr", "2hr", "3hr+", "All day"],
    statusReadyShort: "READY ✓",
    statusPending: "PENDING",

    submitLoading: "🛰️ Generating plan...",
    submitBtn: "✈️ Get 3 things to do now",

    crisisText: "If it's too much to handle alone",
    crisis1: "Suicide Prevention 1393",
    crisis2: "Mental Health Crisis 1577-0199",
    crisisNote: "24/7 · Free · Anonymous",

    errorMsg: "Something went wrong. Please try again.",
    quickTextTemplate: (energy: number, anxiety: number) =>
      `Quick recovery request. Energy ${energy}/10, anxiety ${anxiety}/10. Give me the 3 smallest actions I can do right now.`,

    situations: [
      { emoji: "💀", tag: "Burned out", text: "I'm completely burned out today. I don't want to do anything and my head feels foggy. I just want to give up." },
      { emoji: "😴", tag: "Overslept", text: "I woke up late and feel like I ruined the day. I'm sluggish and have no motivation." },
      { emoji: "😰", tag: "Anxious", text: "I'm anxious and worried about too much. Things are piling up but I can't get started." },
      { emoji: "📱", tag: "On my phone", text: "I was on my phone all day. YouTube, social media, and time just flew by. I had things to do but didn't." },
      { emoji: "📚", tag: "Couldn't study", text: "I barely studied today. I couldn't focus and kept getting distracted." },
      { emoji: "🏠", tag: "Messy room", text: "My room is a mess but I have no motivation to clean. I don't know where to start." },
    ] as Situation[],
  },
} as const;

export type T = typeof translations.ko;

export function getLang(): Lang {
  if (typeof window === "undefined") return "ko";
  return (localStorage.getItem("rp_lang") as Lang) || "ko";
}

export function setLang(lang: Lang) {
  localStorage.setItem("rp_lang", lang);
}

export function t(lang: Lang): T {
  return translations[lang] as unknown as T;
}
