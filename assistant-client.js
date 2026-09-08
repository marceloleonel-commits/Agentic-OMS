/* assistant-client.js
 * ─────────────────────────────────────────────────────────────────────
 * Chama o proxy real da Responses API (app/api/llm/responses/route.ts,
 * no repo agentic-oms) para o chat livre de "My Assistant" (#/assistant)
 * conversar de verdade com o agente configurado em agent-behavior.yaml
 * (assistantChat.instructions) — não é a Assistants API (threads/runs),
 * descontinuada em 26/08/2026: aqui a memória de conversa vem só de
 * encadear responseId de um turno para o outro.
 *
 * Só funciona quando o protótipo está sendo servido por esse Next.js
 * (localhost:3000/aiw). Fora dele (GitHub Pages, arquivo estático) o
 * fetch falha e quem chama deve mostrar uma mensagem de erro amigável —
 * não existe fallback heurístico aqui como no LLMClient, porque não há
 * como simular uma conversa livre sem a LLM de verdade.
 *
 * Export: window.AssistantClient = { send }
 */

;(function () {
  'use strict';

  function send(message, opts) {
    opts = opts || {};
    return fetch('/api/llm/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: message,
        model: opts.model,
        instructions: opts.instructions,
        previousResponseId: opts.previousResponseId || null,
      }),
    }).then(function (res) {
      if (!res.ok) throw new Error('AssistantClient: proxy respondeu ' + res.status);
      return res.json();
    }).then(function (data) {
      if (data.error) throw new Error('AssistantClient: ' + data.error);
      return { reply: data.text || '', responseId: data.responseId || null };
    });
  }

  window.AssistantClient = { send: send };
})();
