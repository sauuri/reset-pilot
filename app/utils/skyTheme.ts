export type SkyMode = "dawn" | "day" | "sunset" | "night";

export function getSkyMode(h: number): SkyMode {
  if (h >= 5  && h < 7)  return "dawn";
  if (h >= 7  && h < 17) return "day";
  if (h >= 17 && h < 20) return "sunset";
  return "night";
}

export const SKY_BG: Record<SkyMode, string> = {
  dawn:   "linear-gradient(180deg, #1a1a5e 0%, #6b3a9c 18%, #c4553a 38%, #e8804a 60%, #f4c17a 85%, #fde8c0 100%)",
  day:    "linear-gradient(180deg, #3fa3d5 0%, #5cbfe8 20%, #88d4f3 45%, #b2e5fa 70%, #cef2fc 100%)",
  sunset: "linear-gradient(180deg, #0a1530 0%, #2a1a6b 15%, #7a2a7a 32%, #c44040 50%, #e87838 68%, #f4b060 85%, #fce4c0 100%)",
  night:  "linear-gradient(180deg, #020810 0%, #071828 45%, #0d2a48 100%)",
};

// 활주로용 바닥 색상
export const RUNWAY_BG: Record<SkyMode, string> = {
  dawn:   "linear-gradient(180deg, #2a1a30 0%, #3a2240 100%)",
  day:    "linear-gradient(180deg, #3a3a4a 0%, #4a4a5a 100%)",
  sunset: "linear-gradient(180deg, #1a0a20 0%, #2a1030 100%)",
  night:  "linear-gradient(180deg, #181828 0%, #202035 100%)",
};
