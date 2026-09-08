/* mode1-trigger.js
 * ─────────────────────────────────────────────────────────────────────
 * Único trabalho: decidir se uma frase digitada pelo gerente descreve o
 * mesmo cenário do roteiro do Modo 1 (retirada em loja com risco de SLA
 * — ver mode1-dialogue-script.js). Não sabe nada sobre chat, motor ou
 * qual tela chamou — por isso pode ser reaproveitado nas três telas
 * onde o agente conversa (Orders, Assistente de políticas, My
 * Assistant), cada uma com seu próprio jeito de mandar mensagem.
 *
 * Protótipo determinístico, não NLU real: casa por palavra-chave, do
 * mesmo jeito que o resto do chat-engine.js já faz.
 *
 * Export: window.Mode1Trigger = { matches }
 */

;(function () {
  'use strict';

  var RE = /retirada.*(loja|pickup|sla|48\s*h)|pickup.*(sla|loja|risco)|melhorar.*retirada|retirada em loja|prometemos retirada/i;

  function matches(text) {
    return RE.test(text || '');
  }

  window.Mode1Trigger = { matches: matches };
})();
