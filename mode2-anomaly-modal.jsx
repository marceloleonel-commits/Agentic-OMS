/* global React, Icon, AgentConfigLoader, MODE2_SCRIPTS */
/* ══════════════════════════════════════════════════════════════════════
   mode2-anomaly-modal.jsx
   ──────────────────────────────────────────────────────────────────────
   Apresentação do Modo 2 ("O agente sugere ao gerente") — só a etapa
   Surface, a notificação inicial da descoberta. Montado uma única vez em
   app.jsx, fora do roteamento — a detecção não pertence a uma tela
   específica, dispara depois de N segundos de navegação em qualquer
   parte do protótipo.

   A investigação em si (Explain → ... → Scale) NÃO continua aqui: o
   gerente pode preferir digitar ou até falar com o agente em vez de só
   clicar em botões, então a partir do momento em que ele escolhe
   explorar, a conversa continua de verdade na tela do Assistente
   (mode2-assistant-engine.js + App, via a prop onExplore). Este
   componente só sabe mostrar a notificação e avisar o App da escolha —
   não sabe nada sobre chat.
   ══════════════════════════════════════════════════════════════════════ */
const { useState, useEffect } = React;

function Mode2AnomalyModal({ onCreateDirectly }) {
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    AgentConfigLoader.load().then(setConfig).catch(() => {});
  }, []);

  useEffect(() => {
    if (!config || !config.mode2 || !config.mode2.enabled) return;
    const delayMs = (config.mode2.triggerAfterSeconds || 30) * 1000;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [config]);

  if (!config || !config.mode2 || !config.mode2.enabled) return null;
  const script = MODE2_SCRIPTS[config.mode2.scriptId];
  if (!script || !visible || dismissed) return null;

  /* Turno 0 é sempre do agente — é a fala de abertura do "Exemplo de
     diálogo" do Modo 2 (mode2-anomaly-script.js), mostrada aqui como
     notificação. Ação direta: cria a política e a iniciativa de
     acompanhamento na hora (onCreateDirectly → app.jsx), sem passar pela
     conversa turno a turno em My Assistant. */
  const opening = script.turns[0];
  const ACTIONS = ["Criar iniciativa e política", "Manter em observação", "Dispensar"];
  const EXIT_ACTIONS = new Set(["Dispensar", "Manter em observação"]);

  const handleAction = (action) => {
    setDismissed(true);
    if (EXIT_ACTIONS.has(action)) return;
    onCreateDirectly(script);
  };

  return (
    <div className="m2-modal" role="dialog" aria-label={`Detecção do agente — ${script.title}`}>
      <div className="m2-modal-head">
        <span className="m2-modal-badge"><Icon name="warning-amber" size={15} /> Aviso do agente</span>
        <span className="m2-modal-phase">{opening.phase}</span>
        <button className="m2-modal-close" onClick={() => setDismissed(true)} aria-label="Fechar">
          <Icon name="x" size={16} />
        </button>
      </div>
      <p className="m2-modal-source">{config.agent.displayName}</p>
      <p className="m2-modal-text">{opening.text}</p>
      <div className="m2-modal-actions">
        {ACTIONS.map((a) => (
          <button key={a} className="m2-modal-action" onClick={() => handleAction(a)}>{a}</button>
        ))}
      </div>
    </div>
  );
}

window.Mode2AnomalyModal = Mode2AnomalyModal;
