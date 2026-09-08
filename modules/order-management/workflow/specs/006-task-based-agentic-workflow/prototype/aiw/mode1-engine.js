/* mode1-engine.js
 * ─────────────────────────────────────────────────────────────────────
 * Toca o roteiro do Modo 1 (mode1-dialogue-script.js) dentro de
 * QUALQUER chat existente no protótipo, uma vez que mode1-trigger.js
 * já decidiu que a frase do gerente combina com o cenário.
 *
 * NÃO é autoplay: o roteiro tem um turno do agente para cada turno do
 * gerente, mas quem "fala" pelo gerente a partir daqui é o usuário
 * real, no ritmo dele — nunca o texto engessado do roteiro. Por isso o
 * motor só revela UM turno do agente por vez e para, esperando a
 * próxima mensagem real para revelar o turno seguinte. O turno 0 (a
 * fala inicial do gerente) já foi a mensagem real que disparou
 * mode1-trigger.js — quem chama já apendou ela no chat antes de
 * chamar start().
 *
 * Mesma convenção de ChatEngine.create (chat-engine.js) e de
 * Mode2AssistantEngine (mode2-assistant-engine.js): quem usa chama
 * start() uma vez e depois send(text) a cada mensagem nova, recebe as
 * respostas via onMessage/onTyping, e nunca precisa saber o que tem
 * dentro do roteiro — inclusive ignora o texto que o usuário digitou,
 * porque este roteiro é fixo (ambos os lados já escritos), só o RITMO
 * é do usuário.
 *
 * Export: window.Mode1Engine = { create }
 */

;(function () {
  'use strict';

  function create(options) {
    var script = options.script;
    var onMessage = options.onMessage;
    var onTyping = options.onTyping;
    var typingDelayMs = options.typingDelayMs || 900;
    var nextAgentIdx = 1; // primeiro turno do agente (turno 0 = fala real do gerente)
    var finished = false;

    function revealAgentTurn(idx) {
      var turn = script.turns[idx];
      if (onTyping) onTyping(true);
      setTimeout(function () {
        if (onTyping) onTyping(false);
        if (onMessage) onMessage({ from: 'agent', text: turn.text, quickReplies: turn.quickReplies });
      }, typingDelayMs);
    }

    /* Revela o primeiro turno do agente (resposta à fala que disparou o
       roteiro) e para — espera a próxima mensagem real do gerente. */
    function start() {
      revealAgentTurn(nextAgentIdx);
      nextAgentIdx += 2;
    }

    /* Chamado a cada nova mensagem real do gerente enquanto este roteiro
       estiver ativo naquele chat. O conteúdo digitado não importa — ele
       só marca "o gerente respondeu, pode continuar" — porque os dois
       lados desta conversa já estão escritos no roteiro. */
    function send() {
      if (finished) {
        if (onMessage) onMessage({ from: 'agent', text: 'Esse roteiro já chegou ao fim — se quiser recomeçar, descreva o cenário de novo.' });
        return;
      }
      if (nextAgentIdx >= script.turns.length) {
        finished = true;
        return;
      }
      revealAgentTurn(nextAgentIdx);
      nextAgentIdx += 2;
      if (nextAgentIdx >= script.turns.length) finished = true;
    }

    return { start: start, send: send };
  }

  window.Mode1Engine = { create: create };
})();
