/**
 * Proxy genérico para o "Assistente de políticas" do protótipo (llm-client.js)
 * chamar uma LLM real. A chave da OpenAI só existe aqui, no servidor — nunca
 * chega ao navegador. O protótipo manda { prompt, jsonMode } e recebe de
 * volta o texto puro da resposta; quem chama decide como interpretar.
 *
 * Função serverless da Vercel (Node.js) — mesma lógica de
 * agentic-oms/app/api/llm/complete/route.ts (proxy Next.js usado no
 * localhost), portada para rodar direto nesta pasta estática, sem Next.js.
 * Detectada automaticamente pela convenção de pasta `api/`; a rota final é
 * `/api/llm/complete`, o mesmo caminho relativo que llm-client.js já chama.
 */

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido." });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY não configurada neste projeto Vercel." });
    return;
  }

  const body = req.body || {};
  const prompt = body.prompt;
  if (typeof prompt !== "string" || !prompt.trim()) {
    res.status(400).json({ error: "Campo 'prompt' (string) é obrigatório." });
    return;
  }
  const jsonMode = !!body.jsonMode;

  const openaiRes = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!openaiRes.ok) {
    const detail = await openaiRes.text().catch(() => "");
    res.status(502).json({ error: `OpenAI respondeu ${openaiRes.status}`, detail });
    return;
  }

  const data = await openaiRes.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  res.status(200).json({ text });
}
