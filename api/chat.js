export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ── 1순위: Gemini API 시도 ──────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
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

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
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

      const geminiData = await geminiRes.json();

      // 오류 없으면 Gemini 응답 반환
      if (geminiRes.ok && geminiData?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = geminiData.candidates[0].content.parts[0].text;
        console.log("✅ Gemini 응답 성공");
        return res.status(200).json({ content: [{ type: "text", text }] });
      }

      // Gemini 오류면 Anthropic으로 fallback
      console.log("⚠️ Gemini 실패, Anthropic으로 전환:", geminiData?.error?.message);

    } catch (e) {
      console.log("⚠️ Gemini 예외 발생, Anthropic으로 전환:", e.message);
    }
  }

  // ── 2순위: Anthropic API fallback ──────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return res.status(200).json({
      content: [{ type: "text", text: "API 키가 설정되지 않았습니다. 관리자에게 문의해주세요." }]
    });
  }

  try {
    console.log("✅ Anthropic으로 응답 처리");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (e) {
    return res.status(200).json({
      content: [{ type: "text", text: `서버 오류: ${e.message}` }]
    });
  }
}
