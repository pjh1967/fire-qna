export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { messages, system, max_tokens } = req.body;

    const geminiMessages = [];

    if (system) {
      geminiMessages.push({ role: "user", parts: [{ text: system }] });
      geminiMessages.push({ role: "model", parts: [{ text: "네, 알겠습니다. 안내해 드리겠습니다." }] });
    }

    for (const m of messages) {
      geminiMessages.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ content: [{ type: "text", text: "GEMINI_API_KEY가 설정되지 않았습니다." }] });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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

    if (!response.ok) {
      const errMsg = data?.error?.message || JSON.stringify(data);
      return res.status(200).json({ content: [{ type: "text", text: `Gemini 오류: ${errMsg}` }] });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(200).json({ content: [{ type: "text", text: `응답 파싱 실패: ${JSON.stringify(data).slice(0, 200)}` }] });
    }

    res.status(200).json({ content: [{ type: "text", text }] });

  } catch (e) {
    res.status(200).json({ content: [{ type: "text", text: `서버 오류: ${e.message}` }] });
  }
}
