export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { messages, system, max_tokens } = req.body;

    // Anthropic 형식 → Gemini 형식 변환
    const geminiMessages = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // system 프롬프트를 첫 번째 user 메시지 앞에 추가
    if (system) {
      geminiMessages.unshift({
        role: "user",
        parts: [{ text: system }],
      });
      geminiMessages.splice(1, 0, {
        role: "model",
        parts: [{ text: "네, 알겠습니다. 안내해 드리겠습니다." }],
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: max_tokens || 2000,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    // Gemini 응답 → Anthropic 형식으로 변환 (App.jsx 수정 없이 호환)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "응답을 받지 못했습니다.";
    res.status(200).json({
      content: [{ type: "text", text }],
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
