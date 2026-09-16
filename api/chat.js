export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  // ── 1순위: OpenAI API 시도 ──────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const { messages, system, max_tokens } = req.body;

      // Anthropic 형식 → OpenAI 형식 변환
      const openaiMessages = [];
      if (system) {
        openaiMessages.push({ role: "system", content: system });
      }
      for (const m of messages) {
        openaiMessages.push({ role: m.role, content: m.content });
      }

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          messages: openaiMessages,
          max_tokens: max_tokens || 2000,
          temperature: 0.7,
        }),
      });

      const openaiData = await openaiRes.json();

      if (openaiRes.ok && openaiData?.choices?.[0]?.message?.content) {
        const text = openaiData.choices[0].message.content;
        console.log("✅ OpenAI 응답 성공");
        return res.status(200).json({
          content: [{ type: "text", text }],
          ai_engine: "OpenAI",
        });
      }

      console.log("⚠️ OpenAI 실패, Anthropic으로 전환:", openaiData?.error?.message);

    } catch (e) {
      console.log("⚠️ OpenAI 예외 발생, Anthropic으로 전환:", e.message);
    }
  }

  // ── 2순위: Anthropic API fallback ──────────────────
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return res.status(200).json({
      content: [{ type: "text", text: "API 키가 설정되지 않았습니다. 관리자에게 문의해주세요." }],
      ai_engine: "없음",
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
    data.ai_engine = "Anthropic";
    return res.status(response.status).json(data);

  } catch (e) {
    return res.status(200).json({
      content: [{ type: "text", text: `서버 오류: ${e.message}` }],
      ai_engine: "오류",
    });
  }
}
