import { supabase } from "./supabase";

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function saveLogToSupabase(log: Record<string, unknown>): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;

  const { data } = await supabase.from("recovery_logs").insert({
    user_id: user.id,
    situation_text: log.input,
    energy: log.energy,
    stress: log.anxiety,
    available_time: log.timeLeft,
    mode: log.mode,
    ruin_score: log.ruinScore,
    score_before: log.scoreBefore,
    score_after: log.scoreAfter,
    actions_json: log.actions,
    completed_actions_json: log.completedActions ?? [],
    mood_after: log.moodAfter ?? null,
    created_at: new Date(log.ts as number).toISOString(),
  }).select("id").single();

  return data?.id ?? null;
}

export async function updateLogInSupabase(
  ts: number,
  update: { completedActions?: string[]; completedCount?: number; moodAfter?: "better" | "same" | "worse" | null },
  id?: string
) {
  const user = await getUser();
  if (!user) return;

  const patch: Record<string, unknown> = {};
  if (update.completedActions !== undefined) patch.completed_actions_json = update.completedActions;
  if (update.moodAfter !== undefined) patch.mood_after = update.moodAfter;
  if (Object.keys(patch).length === 0) return;

  if (id) {
    await supabase.from("recovery_logs").update(patch).eq("id", id).eq("user_id", user.id);
  } else {
    // Supabase may truncate ms precision — use 2s window
    await supabase
      .from("recovery_logs")
      .update(patch)
      .eq("user_id", user.id)
      .gte("created_at", new Date(ts - 2000).toISOString())
      .lte("created_at", new Date(ts + 2000).toISOString());
  }
}

export async function deleteLogsFromSupabase(ids: string[]) {
  const user = await getUser();
  if (!user || ids.length === 0) return;
  await supabase.from("recovery_logs").delete().eq("user_id", user.id).in("id", ids);
}

export async function loadLogsFromSupabase() {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("recovery_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error || !data) return null;

  return data.map((row) => ({
    mode: row.mode,
    modeDesc: "",
    ruinScore: row.ruin_score,
    scoreBefore: row.score_before,
    scoreAfter: row.score_after,
    actions: row.actions_json,
    skip: [],
    successCriteria: "",
    message: "",
    date: new Date(row.created_at).toLocaleDateString("ko-KR"),
    input: row.situation_text,
    energy: row.energy,
    anxiety: row.stress,
    completedCount: (row.completed_actions_json ?? []).length,
    completedActions: row.completed_actions_json ?? [],
    moodAfter: row.mood_after,
    ts: new Date(row.created_at).getTime(),
    _id: row.id,
  }));
}
