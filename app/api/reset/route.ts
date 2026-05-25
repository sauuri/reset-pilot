import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { text, energy, anxiety, timeLeft } = await request.json();

  const prompt = `너는 ResetPilot, AI 하루 복구 관제사다.
사용자의 하루 상태를 분석해서 "생산성 조언"이 아니라 "오늘을 0점으로 끝내지 않기 위한 최소 복구 루트"를 만들어라.

규칙:
1. 사용자를 비난하지 않는다
2. 완벽한 계획을 주지 않는다
3. 에너지가 낮으면 행동을 아주 작게 만든다
4. 감정 문장과 사실 문장을 반드시 분리한다
5. 목표는 100점이 아니라 0점을 피하는 것이다
6. JSON만 반환한다 (마크다운 코드블록 없이)

사용자 상태:
- 오늘 상황: ${text}
- 에너지: ${energy}/10
- 불안/스트레스: ${anxiety}/10
- 남은 시간: ${timeLeft}

모드 판정 기준:
- Crash Mode: 에너지 낮고 불안 높음, 완전히 무너진 상태
- Drift Mode: 멍하고 흐트러진 상태, 완전히 망하진 않음
- Launch Mode: 에너지 있는데 방향이 없는 상태

JSON 형식:
{
  "mode": "Crash Mode | Drift Mode | Launch Mode",
  "modeDesc": "모드 설명 한 줄 (예: 오늘은 생산성보다 복구가 먼저입니다)",
  "ruinScore": (망함 정도 0-100),
  "scoreBefore": (현재 하루 점수 0-100),
  "scoreAfter": (복구 후 예상 점수 0-100, scoreBefore보다 반드시 높게),
  "emotionFact": {
    "emotion": "사용자가 느끼는 과장된 감정 문장",
    "fact": "실제 사실만 담은 문장 (감정 제거)",
    "interpret": "사실 기반 해석 한 줄"
  },
  "recoveryGoal": "오늘의 착륙 목표 한 줄",
  "actions": [
    { "name": "Body Reset | Space Reset | Life Reset", "title": "행동 제목", "duration": "소요 시간", "reason": "왜 이게 도움 되는지" },
    { "name": "Body Reset | Space Reset | Life Reset", "title": "행동 제목", "duration": "소요 시간", "reason": "왜 이게 도움 되는지" },
    { "name": "Body Reset | Space Reset | Life Reset", "title": "행동 제목", "duration": "소요 시간", "reason": "왜 이게 도움 되는지" }
  ],
  "skip": ["오늘 버려도 되는 것 1", "오늘 버려도 되는 것 2", "오늘 버려도 되는 것 3"],
  "successCriteria": "오늘의 성공 기준 한 문장 (따뜻하고 현실적으로)",
  "message": "한 줄 위로 메시지 (장난스럽고 공감 가게)"
}

행동은 남은 시간(${timeLeft}), 에너지(${energy}/10)에 맞게 실제로 할 수 있는 것으로만 줘.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  const raw = response.choices[0].message.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const result = JSON.parse(cleaned);

  return Response.json(result, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
