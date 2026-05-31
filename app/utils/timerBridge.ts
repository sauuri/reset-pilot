import { registerPlugin } from "@capacitor/core";

const TimerBridge = registerPlugin<{
  setTimer(opts: { endTime: number; label: string }): Promise<void>;
  clearTimer(): Promise<void>;
}>("TimerBridge");

export function bridgeSetTimer(endTime: number, label: string) {
  TimerBridge.setTimer({ endTime, label }).catch(() => {});
}

export function bridgeClearTimer() {
  TimerBridge.clearTimer().catch(() => {});
}
