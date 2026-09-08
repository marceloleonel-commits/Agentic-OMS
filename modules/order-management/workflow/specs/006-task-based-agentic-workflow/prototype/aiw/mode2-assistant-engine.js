/* mode2-assistant-engine.js
 * ─────────────────────────────────────────────────────────────────────
 * Continua o "Exemplo de diálogo" do Modo 2 (mode2-anomaly-script.js)
 * dentro do chat de My Assistant, depois que o gerente escolhe uma
 * ação na notificação (mode2-anomaly-modal.jsx mostra só o turno 0, a
 * fala de abertura do agente).
 *
 * Mesma mecânica de mode1-engine.js: NÃO é autoplay. Revela um turno
 * do agente por vez e espera a próxima mensagem real do gerente —
 * o conteúdo digitado não importa, os dois lados já estão escritos no
 * roteiro, só o RITMO é do gerente. A diferença para o Modo 1 é só o
 * ponto de partida: aqui o turno 0 (agente) já foi mostrado pelo
 * modal, e a escolha que o gerente fez nele já é o turno 1 (gerente) —
 * por isso este motor nasce pronto para revelar o turno 2 na primeira
 * vez que send() for chamado, sem precisar de um start() separado.
 *
 * Export: window.Mode2AssistantEngine = { create }
 */

;(function () {
  'use strict';

  function create(options) {
    var script = options.script;
    var onAgentSay = options.onAgentSay;
    var onTyping = options.onTyping;
    var typingDelayMs = options.typingDelayMs || 900;
    var nextAgentIdx = 2; // turno 0 (agente) e turno 1 (escolha do gerente) já apareceram
    var finished = false;

    function revealAgentTurn(idx) {
      var turn = script.turns[idx];
      if (onTyping) onTyping(true);
      setTimeout(function () {
        if (onTyping) onTyping(false);
        if (onAgentSay) onAgentSay([{ from: 'agent', text: turn.text, quickReplies: turn.quickReplies }]);
      }, typingDelayMs);
    }

    function send() {
      if (finished) {
        if (onAgentSay) onAgentSay([{ from: 'agent', text: 'Essa investigação já foi encerrada por aqui. Se o padrão continuar, eu volto a te avisar.' }]);
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

    return { send: send };
  }

  window.Mode2AssistantEngine = { create: create };
})();
