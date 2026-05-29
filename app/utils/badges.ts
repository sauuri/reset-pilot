export const BADGES = [
  { count: 1,   name: "첫 이륙",       emoji: "🛫", desc: "오늘을 0점으로 끝내지 않은 첫 기록이에요." },
  { count: 5,   name: "작은 비행",     emoji: "✈️", desc: "작은 행동이 쌓이기 시작했어요." },
  { count: 10,  name: "조종사 자격증", emoji: "📋", desc: "Reset Pilot 기본 조종 자격을 획득했어요." },
  { count: 30,  name: "베테랑 파일럿", emoji: "🎖️", desc: "복구 경험이 쌓인 사용자예요." },
  { count: 50,  name: "회복 비행사",   emoji: "🌤️", desc: "무너진 날에도 다시 움직이는 사람이에요." },
  { count: 100, name: "마스터 파일럿", emoji: "🏅", desc: "복구 100회. 절대 작은 기록이 아니에요." },
  { count: 150, name: "회복 전문가",   emoji: "⭐", desc: "자신만의 회복 패턴이 뚜렷해졌어요." },
  { count: 200, name: "에이스 파일럿", emoji: "🌟", desc: "200번의 다시 시작을 만든 사람이에요." },
  { count: 250, name: "캡틴 파일럿",   emoji: "👨‍✈️", desc: "Reset Pilot 고급 등급이에요." },
  { count: 300, name: "레전드 파일럿", emoji: "🌌", desc: "300번의 복구. 망한 하루를 끝까지 포기하지 않은 기록이에요." },
] as const;

export const STAGE_MSG: Record<number, string> = {
  1:   "아직 완벽하지 않아도 괜찮아요.\n당신은 이미 다시 이륙하기 시작했습니다.",
  10:  "10번의 복구는 작지 않습니다.\n망한 하루를 다시 잡는 법을 배우고 있어요.",
  30:  "무너지는 날에도 다시 방향을 잡는\n경험이 쌓이고 있어요.",
  100: "100번의 복구는 100번의 다시 시작입니다.\n당신은 이미 많은 날을 구해냈어요.",
  200: "이제 Reset Pilot은 단순한 앱이 아니라\n당신의 회복 기록이 되었습니다.",
  300: "300번의 복구.\n300번의 다시 시작.\n당신은 수많은 망한 하루를 0점으로 끝내지 않았습니다.",
};

export function getCurrentBadge(count: number) {
  const earned = BADGES.filter(b => count >= b.count);
  return earned[earned.length - 1] ?? null;
}

export function getNextBadge(count: number) {
  return BADGES.find(b => count < b.count) ?? null;
}

export function getStageMsg(count: number) {
  const keys = Object.keys(STAGE_MSG).map(Number).sort((a, b) => b - a);
  const key = keys.find(k => count >= k);
  return key !== undefined ? STAGE_MSG[key] : null;
}
