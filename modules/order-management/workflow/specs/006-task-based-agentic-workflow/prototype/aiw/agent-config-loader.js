/* global jsyaml */
/* ══════════════════════════════════════════════════════════════════════
   agent-config-loader.js
   ──────────────────────────────────────────────────────────────────────
   Única responsabilidade: buscar agent-behavior.yaml e devolver o objeto
   já parseado. Nenhuma lógica de simulação mora aqui — quem consome o
   config (mode1-simulation-view.jsx, mode2-anomaly-modal.jsx) decide o
   que fazer com ele.

   O arquivo é buscado por fetch() relativo, então funciona igual nos três
   jeitos que este protótipo é servido: python -m http.server local,
   Next.js (public/aiw/), e GitHub Pages — em todos, é um arquivo estático
   comum ao lado deste .js.
   ══════════════════════════════════════════════════════════════════════ */
window.AgentConfigLoader = (function () {
  let pending = null;

  function load() {
    if (pending) return pending;
    pending = fetch("agent-behavior.yaml")
      .then((res) => {
        if (!res.ok) throw new Error("agent-behavior.yaml: HTTP " + res.status);
        return res.text();
      })
      .then((text) => jsyaml.load(text))
      .catch((err) => {
        pending = null; // permite tentar de novo numa próxima chamada
        throw err;
      });
    return pending;
  }

  return { load };
})();
