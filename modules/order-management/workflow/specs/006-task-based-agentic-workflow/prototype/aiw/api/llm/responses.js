/**
 * Proxy para a Responses API da OpenAI, usado pelo chat livre de "My
 * Assistant" (assistant-client.js + app.jsx) para conversar com o agente
 * configurado em agent-behavior.yaml (assistantChat.instructions). A chave
 * da OpenAI só existe aqui, no servidor.
 *
 * Não usa a Assistants API (threads/runs, asst_...) — foi descontinuada em
 * 26/08/2026. Memória de conversa vem de encadear previous_response_id a
 * cada turno, sem gerenciar nenhuma thread manualmente.
 *
 * Função serverless da Vercel (Node.js) — mesma lógica de
 * agentic-oms/app/api/llm/responses/route.ts (proxy Next.js usado no
 * localhost), portada para rodar direto nesta pasta estática, sem Next.js.
 * Rota final: `/api/llm/responses`, o mesmo caminho relativo que
 * assistant-client.js já chama.
 */

const OPENAI_URL = "https://api.openai.com/v1/responses";

function extractOutputText(data) {
  const output = data?.output;
  if (!Array.isArray(output)) return "";
  for (const item of output) {
    if (item?.type === "message" && Array.isArray(item.content)) {
      const part = item.content.find((c) => c?.type === "output_text");
      if (part?.text) return part.text;
    }
  }
  return "";
}

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
  const input = body.input;
  if (typeof input !== "string" || !input.trim()) {
    res.status(400).json({ error: "Campo 'input' (string) é obrigatório." });
    return;
  }

  const payload = {
    model: body.model || "gpt-4o-mini",
    input,
    store: true,
  };
  if (typeof body.instructions === "string" && body.instructions.trim()) {
    payload.instructions = body.instructions;
  }
  if (typeof body.previousResponseId === "string" && body.previousResponseId) {
    payload.previous_response_id = body.previousResponseId;
  }

  const openaiRes = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!openaiRes.ok) {
    const detail = await openaiRes.text().catch(() => "");
    res.status(502).json({ error: `OpenAI respondeu ${openaiRes.status}`, detail });
    return;
  }

  const data = await openaiRes.json();
  res.status(200).json({ text: extractOutputText(data), responseId: data?.id });
}
