/* llm-client.js
 * ─────────────────────────────────────────────────────────────────────
 * Chama o proxy real de LLM (app/api/llm/complete/route.ts, no repo
 * agentic-oms) para dar interação de verdade ao Assistente de
 * políticas — os 7 prompts PROMPT_* já escritos em
 * policy-chat-engine.js / view-workflow-policies.jsx.
 *
 * Só funciona quando o protótipo está sendo servido por esse Next.js
 * (localhost:3000/aiw). No GitHub Pages ou aberto como arquivo estático
 * puro não existe esse endpoint — o fetch falha, e quem chama deve
 * cair no heurístico determinístico já existente (ver cada função em
 * view-workflow-policies.jsx: sempre `LLMClient.complete(...).then(...).
 * catch(() => heurísticoDeterministico(...))`, nunca deixando o chat
 * sem resposta).
 *
 * Export: window.LLMClient = { complete }
 */

;(function () {
  'use strict';

  function complete(prompt, opts) {
    opts = opts || {};
    return fetch('/api/llm/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt, jsonMode: !!opts.jsonMode }),
    }).then(function (res) {
      if (!res.ok) throw new Error('LLMClient: proxy respondeu ' + res.status);
      return res.json();
    }).then(function (data) {
      if (data.error) throw new Error('LLMClient: ' + data.error);
      return opts.jsonMode ? JSON.parse(data.text) : data.text;
    });
  }

  window.LLMClient = { complete: complete };
})();
