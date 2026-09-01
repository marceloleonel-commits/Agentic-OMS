/* ══════════════════════════════════════════════════════════════════════
   policy-rule-drawer.jsx
   ──────────────────────────────────────────────────────────────────────
   Onde isso entra: view-workflow-policies.jsx, substituindo o componente
   PolicyRuleDrawer atual.

   SEM PROMPT — não gerado por LLM. É apresentação pura: lê os campos já
   existentes na regra (sourceEventLabel, conditions, tasks, priority —
   ver schema em policy-chat-engine.js, seção 0) e só decide como exibir.

   Duas mudanças em relação à versão anterior:
   (1) Origem do evento em linguagem natural, código como legenda pequena.
   (2) Ações numeradas na ordem real do array — nunca reagrupadas por kind.

   Inclui salvaguarda defensiva: se `rule.conditions` ainda tiver algum
   item em formato antigo (string pura, não migrado — ver migração em
   data-aiw-policy-catalog.js), mostra só a linha técnica, nunca duplica
   a mesma string nas duas linhas. Depois que a migração das 26 regras
   rodar, essa salvaguarda não deve mais ser acionada — ela protege
   contra dado futuro fora do padrão, não é o caminho normal.
   ══════════════════════════════════════════════════════════════════════ */
function PolicyRuleDrawer({ rule, policy, onToggle, onClose }) {
  return (
    <div className="wf-side-drawer-body">
      <div className="wfp-drawer-ident">
        <PolicyCategoryTag categoryId={policy.category} />
        <span className="wfp-drawer-policy">{policy.name}</span>
        <span className="wfp-sid">{rule.id}</span>
      </div>

      <div className="wfp-drawer-block">
        <span className="wfp-block-label">Origem</span>
        <p className="detail-desc wfp-event-label">{rule.sourceEventLabel}</p>
        <code className="wfp-event-code">{rule.sourceEventId}</code>
      </div>

      <p className="detail-desc wfp-drawer-trigger">{rule.trigger}</p>

      <div className="wfp-drawer-status">
        <span className="setting-row-desc">{rule.active ? "Ativa" : "Desligada"}</span>
        <Toggle on={rule.active} onChange={() => onToggle(policy.id, rule.id)} />
      </div>

      {rule.priority != null && (
        <p className="wfp-priority-note">{rule.priority}º dentro do evento "{rule.sourceEventLabel}"</p>
      )}

      <div className="wfp-drawer-block">
        <span className="wfp-block-label">Se — condições</span>
        {rule.conditions.map((c, i) => {
          const isPair = typeof c === "object" && c !== null;
          return (
            <div key={i} className="wfp-cond-pair">
              {isPair && <p className="wfp-cond-natural">{c.natural}</p>}
              <code className="wfp-cond-code">{isPair ? c.technical : c}</code>
            </div>
          );
        })}
      </div>

      <div className="wfp-drawer-block">
        <span className="wfp-block-label">Então — ações, em ordem</span>
        {rule.tasks.map((t, i) => (
          <div key={i} className="wfp-task-row">
            <span className="wfp-task-num">{i + 1}</span>
            <span className="wfp-dot" style={{ background: kindOf(t.kind).dot }} />
            <span className="wfp-kind-label-inline">{kindOf(t.kind).label}</span>
            <span className="wfp-task-label">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
