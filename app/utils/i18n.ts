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

    // 결과 페이지
    modeLabels: { "Crash Mode": "긴급 착륙", "Drift Mode": "표류 중", "Launch Mode": "재이륙", "Recovery": "복구 운항" } as Record<string, string>,
    actionTags: { "Body Reset": "신체", "Space Reset": "공간", "Life Reset": "일상" } as Record<string, string>,
    noDataTitle: "먼저 복구 플랜을 만들어주세요",
    goHome: "홈으로",
    timerNowFlying: "NOW FLYING",
    timerComplete: "MISSION COMPLETE",
    timerRemaining: "남은 시간",
    timerDoneBtn: "✓ 완료했어요",
    timerEndBtn: "✓ 끝냈어요",
    timerLater: "나중에 할게요",
    backHome: "← 홈",
    shareBtn: "📤 공유",
    saveBtn: "♡ 저장",
    savedBtn: "✓ 저장됨",
    scoreChangeTitle: "오늘 하루 점수 변화",
    scoreNow: "지금",
    scoreAfter: "복구 후",
    emotionFactTitle: "🧠 감정과 사실 분리하기",
    feelLabel: "지금 느끼는 감정",
    factLabel: "실제 사실",
    interpretLabel: "다시 해석하면",
    landingGoal: "TODAY'S LANDING GOAL",
    recoveryRoute: "🛫 복구 루트",
    routeDone: "완료",
    timerBtn: "▶ 타이머",
    skipTitle: "🗑️ 오늘은 버려도 돼요",
    skipSub: "완벽하지 않아도 괜찮아요. 이건 내일의 몫.",
    moodDoneTitle: "3개 다 끝냈어요! 🎉",
    moodAsk: "지금 기분이 어때요?",
    moodBetter: "나아졌어요",
    moodSame: "비슷해요",
    moodWorse: "아직 힘들어요",
    moodResBetter: "🎉 잘했어요! 오늘 하루를 다시 잡았네요.",
    moodResSame: "👍 괜찮아요. 시작한 것만으로 충분해요.",
    moodResWorse: "🫂 힘든 날이네요. 그래도 여기까지 온 게 대단해요.",
    journalTitle: "📝 오늘의 한 줄",
    journalSaved: "✓ 저장됐어요",
    journalPlaceholder: "오늘 느낀 점을 한 줄로 남겨보세요",
    journalSave: "저장",
    landingComplete: "🛬 착륙 완료 — 오늘 복구 끝!",
    viewHistory: "📋 지난 복구 기록 보기",
    newPlan: "새로운 복구 플랜 만들기",
    newBadgeLabel: "NEW BADGE",
    tapToClose: "탭하여 닫기",
    copiedRecord: "복구 기록이 복사됐어요!",
    shareMoodBetter: "😊 기분이 나아졌어요",
    shareMoodSame: "😐 비슷해요",
    shareMoodWorse: "😔 아직 힘들어요",
    shareRecordText: (ruin: number, lines: string, done: number, mood: string) =>
      `✈️ Reset Pilot — 오늘 복구 기록\n${"─".repeat(22)}\n부담도 ${ruin}% → 흐름 되찾는 중\n\n${lines}\n${done > 0 ? `\n완료 ${done}/3 🎯` : ""}${mood ? `\n${mood}` : ""}\n\n#ResetPilot #망한하루복구`,

    // 애니메이션 / 스플래시
    flightLoadingMsgs: ["기체 점검 중...", "활주로 진입...", "관제탑 교신 중...", "이륙 준비 완료...", "최적 항로 계산 중..."],
    splashTagline: "오늘 하루, 다시 이륙",
    splashTap: "탭하여 시작 →",
    takeoffText: "이륙합니다 ✈️",
    landingTitle: "무사히 착륙했어요 🛬",
    landingSub: "오늘의 복구 완료",

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

    // Result page
    modeLabels: { "Crash Mode": "Emergency Landing", "Drift Mode": "Drifting", "Launch Mode": "Re-Launch", "Recovery": "Recovery Flight" } as Record<string, string>,
    actionTags: { "Body Reset": "Body", "Space Reset": "Space", "Life Reset": "Life" } as Record<string, string>,
    noDataTitle: "Please create a recovery plan first",
    goHome: "Go Home",
    timerNowFlying: "NOW FLYING",
    timerComplete: "MISSION COMPLETE",
    timerRemaining: "Time left",
    timerDoneBtn: "✓ Done",
    timerEndBtn: "✓ Finished",
    timerLater: "Maybe later",
    backHome: "← Home",
    shareBtn: "📤 Share",
    saveBtn: "♡ Save",
    savedBtn: "✓ Saved",
    scoreChangeTitle: "Today's score change",
    scoreNow: "Now",
    scoreAfter: "After",
    emotionFactTitle: "🧠 Separate feelings from facts",
    feelLabel: "What you feel now",
    factLabel: "The actual facts",
    interpretLabel: "Reframed",
    landingGoal: "TODAY'S LANDING GOAL",
    recoveryRoute: "🛫 Recovery Route",
    routeDone: "done",
    timerBtn: "▶ Timer",
    skipTitle: "🗑️ You can drop these today",
    skipSub: "It doesn't have to be perfect. That's tomorrow's job.",
    moodDoneTitle: "All 3 done! 🎉",
    moodAsk: "How do you feel now?",
    moodBetter: "Better",
    moodSame: "About the same",
    moodWorse: "Still hard",
    moodResBetter: "🎉 Well done! You took today back.",
    moodResSame: "👍 That's okay. Just starting is enough.",
    moodResWorse: "🫂 Tough day. But getting this far is impressive.",
    journalTitle: "📝 One line for today",
    journalSaved: "✓ Saved",
    journalPlaceholder: "Leave one line about how today felt",
    journalSave: "Save",
    landingComplete: "🛬 Landed — today's recovery done!",
    viewHistory: "📋 View past recovery records",
    newPlan: "Create a new recovery plan",
    newBadgeLabel: "NEW BADGE",
    tapToClose: "Tap to close",
    copiedRecord: "Recovery record copied!",
    shareMoodBetter: "😊 I feel better",
    shareMoodSame: "😐 About the same",
    shareMoodWorse: "😔 Still hard",
    shareRecordText: (ruin: number, lines: string, done: number, mood: string) =>
      `✈️ Reset Pilot — Today's recovery log\n${"─".repeat(22)}\nBurden ${ruin}% → finding the flow again\n\n${lines}\n${done > 0 ? `\nDone ${done}/3 🎯` : ""}${mood ? `\n${mood}` : ""}\n\n#ResetPilot #DayRecovery`,

    flightLoadingMsgs: ["Checking aircraft...", "Entering runway...", "Contacting control tower...", "Ready for takeoff...", "Calculating best route..."],
    splashTagline: "Take off into today, again",
    splashTap: "Tap to start →",
    takeoffText: "Taking off ✈️",
    landingTitle: "Landed safely 🛬",
    landingSub: "Today's recovery complete",

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
