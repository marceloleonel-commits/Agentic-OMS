/* mode1-launcher.js
 * ─────────────────────────────────────────────────────────────────────
 * Ponto único que sabe como partir do zero até o Modo 1 tocando: carrega
 * agent-behavior.yaml (agent-config-loader.js), acha o roteiro certo
 * (mode1-dialogue-script.js) e cria+inicia o motor (mode1-engine.js).
 *
 * Existe para as três telas que disparam o Modo 1 (Orders, Assistente
 * de políticas, My Assistant) não repetirem essas três linhas cada uma
 * — cada tela só passa onMessage/onTyping, do jeito que já lida com seu
 * próprio chat.
 *
 * Export: window.Mode1Launcher = { launch }
 */

;(function () {
  'use strict';

  function launch(onMessage, onTyping) {
    return window.AgentConfigLoader.load().then(function (config) {
      if (!config.mode1 || !config.mode1.enabled) return null;
      var script = window.MODE1_SCRIPTS[config.mode1.scriptId];
      if (!script) return null;
      var engine = window.Mode1Engine.create({
        script: script,
        typingDelayMs: config.mode1.typingDelayMs,
        onMessage: onMessage,
        onTyping: onTyping,
      });
      engine.start();
      return { engine: engine, script: script };
    });
  }

  window.Mode1Launcher = { launch: launch };
})();
