import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const { text, energy, anxiety, timeLeft } = await request.json();

  const prompt = `사용자 상태:
- 오늘 상황: ${text}
- 에너지: ${energy}/10
- 불안/스트레스: ${anxiety}/10
- 남은 시간: ${timeLeft}

위 상태를 분석해서 아래 JSON 형식으로 응답해줘. 반드시 JSON만 반환해 (마크다운 코드블록 없이):

{
  "ruinScore": (망함 정도 0-100, 숫자만),
  "recoverScore": (회복 가능성 0-100, 숫자만),
  "emotionFact": {
    "emotion": "사용자가 느끼는 감정 문장 (1줄)",
    "fact": "실제 사실 문장 (1줄, 감정 빼고)"
  },
  "actions": [
    { "title": "행동 제목", "duration": "소요 시간", "reason": "왜 이게 도움 되는지 한 줄" },
    { "title": "행동 제목", "duration": "소요 시간", "reason": "왜 이게 도움 되는지 한 줄" },
    { "title": "행동 제목", "duration": "소요 시간", "reason": "왜 이게 도움 되는지 한 줄" }
  ],
  "skip": ["오늘 버려도 되는 것 1", "오늘 버려도 되는 것 2"],
  "successCriteria": "오늘의 성공 기준 한 문장 (따뜻하고 현실적으로)",
  "message": "한 줄 위로 메시지 (장난스럽고 공감 가게)"
}

행동은 남은 시간(${timeLeft})에 맞게, 에너지 ${energy}/10 상태에서 실제로 할 수 있는 것으로 골라줘.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  const raw = response.choices[0].message.content ?? "{}";
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const result = JSON.parse(cleaned);

  return Response.json(result);
}
