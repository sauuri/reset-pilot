import { registerPlugin } from "@capacitor/core";

const TimerBridge = registerPlugin<{
  setTimer(opts: { endTime: number; label: string }): Promise<Record<string, string>>;
  clearTimer(): Promise<void>;
}>("TimerBridge");

export function bridgeSetTimer(endTime: number, label: string) {
  TimerBridge.setTimer({ endTime, label }).catch((e) => {
    console.error("[TimerBridge] setTimer error:", e);
  });
}

export function bridgeClearTimer() {
  TimerBridge.clearTimer().catch(() => {});
}
