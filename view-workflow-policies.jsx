/* global React, ReactDOM, Icon, AIWData, ChatPanel, ResizableSplit, Toggle, Dropdown, IconButton, SidebarTooltip, Mode1Trigger, Mode1Launcher, Mode1ToPolicy, LLMClient, InitiativeFromPolicy, CanvasTopbar */
const { useState, useRef, useEffect, useMemo, useCallback } = React;

/* ══ Políticas do Workflow ══════════════════════════════════════════════
   Chat + canvas. O canvas lista as regras que governam o que o OMS Agent Hub
   detecta e executa, agrupadas por política; o chat monta uma regra nova a
   partir de uma frase e a entrega ao canvas pelo action card (Fluxo B do
   AGENT_SPEC: "Aplicar" cria o item, faz scroll até ele e abre o detalhe).
   ═══════════════════════════════════════════════════════════════════════ */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function kindOf(kindId) {
  return AIWData.policyActionKinds.find((k) => k.id === kindId)
    || { id: kindId, label: "—", bg: "var(--bg-muted)", fg: "var(--fg-2)", dot: "var(--fg-3)" };
}

function categoryOf(catId) {
  return AIWData.policyCategories.find((c) => c.id === catId) || AIWData.policyCategories[0];
}

/* Tipos de ação distintos da regra, na ordem em que aparecem nas tarefas —
   alimenta tanto os pontos do resumo da linha quanto os grupos do drawer. */
function kindsOf(rule) {
  const seen = [];
  rule.tasks.forEach((t) => { if (!seen.includes(t.kind)) seen.push(t.kind); });
  return seen;
}

/* ── Tag de categoria ───────────────────────────────────────────────────── */
/* Mapa categoryId → Material Symbols Outlined. Substitui o emoji do
   `policyCategories[].icon` (mantido em `data-aiw.js` para retrocompat
   das outras superfícies que ainda leem `cat.icon` como texto). */
const POLICY_CATEGORY_ICON = {
  exceptions:  "warning-amber",
  payment:     "credit-card",
  logistics:   "local-shipping",
  fulfillment: "inventory-2",
  returns:     "swap-horiz",
};

function PolicyCategoryTag({ categoryId }) {
  const cat = categoryOf(categoryId);
  const iconName = POLICY_CATEGORY_ICON[categoryId];
  /* Só o ícone, com o nome da categoria no tooltip: a cor da tag (`cat.color`)
     já identifica a categoria na varredura da lista, e o rótulo em caixa alta
     disputava espaço com o nome da política. `cat.fg` é o tom escuro da mesma
     matriz da cor de fundo. */
  return (
    <SidebarTooltip label={cat.label} placement="top">
      <span
        className="wfp-cat-tag"
        style={{ background: cat.color, color: cat.fg }}
        role="img"
        aria-label={cat.label}
      >
        {iconName ? <Icon name={iconName} size={14} /> : <span className="wfp-cat-tag-fallback">{cat.label.charAt(0)}</span>}
      </span>
    </SidebarTooltip>
  );
}

/* ── Tag de estado da regra ─────────────────────────────────────────────
   Substitui o toggle na linha: ligar/desligar fica só dentro do drawer, e a
   lista passa a dizer o estado em vez de oferecer o controle. */
function PolicyStateTag({ active }) {
  return (
    <span className={`wfp-state-tag${active ? "" : " wfp-state-tag--off"}`}>
      {active ? "Ativa" : "Inativa"}
    </span>
  );
}

/* ── Chip de tarefa, colorido pelo tipo de ação ─────────────────────────── */
function PolicyTaskChip({ task }) {
  const k = kindOf(task.kind);
  return <span className="wfp-task-chip" style={{ background: k.bg, color: k.fg }}>{task.label}</span>;
}

/* ── Drawer de detalhe da regra ──────────────────────────────────────────
   Reaproveita o drawer lateral já existente no projeto (.wf-side-drawer):
   mesmo portal, mesma animação de entrada e mesmo header de navegação. */
function PolicyRuleDrawer({ rule, policy, onToggle, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Apresentação pura: lê os campos já normalizados na regra
     (sourceEventLabel, conditions ricas, tasks em ordem, priority) e só
     decide como exibir. Duas mudanças em relação à versão anterior:
     (1) Origem do evento em linguagem natural, código como legenda.
     (2) Ações numeradas na ordem real do array — nunca reagrupadas
         por kind. */
  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label={rule.name}>
        <div className="stage-config-modal-head">
          <IconButton icon={<Icon name="x" size={18} />} label="Fechar" variant="tertiary" onClick={onClose} />
          <h2 className="stage-config-modal-title">{rule.name}</h2>
        </div>

        <div className="wf-side-drawer-body">
          <div className="wfp-drawer-ident">
            <span className="wfp-drawer-breadcrumb">
              <PolicyCategoryTag categoryId={policy.category} />
              <span className="wfp-drawer-policy">{policy.name}</span>
            </span>
            <span className="wfp-sid">{rule.id}</span>
          </div>

          {rule.sourceEventLabel && (
            <div className="wfp-drawer-block">
              <span className="wfp-block-label">Origem</span>
              <p className="detail-desc wfp-event-label">{rule.sourceEventLabel}</p>
              {rule.sourceEventId && <code className="wfp-event-code">{rule.sourceEventId}</code>}
            </div>
          )}

          <p className="detail-desc wfp-drawer-trigger">{rule.trigger}</p>

          <div className="wfp-drawer-status">
            <span className="setting-row-desc">{rule.active ? "Ativa" : "Desligada"}</span>
            <Toggle on={rule.active} onChange={() => onToggle(policy.id, rule.id)} />
          </div>

          {rule.priority != null && rule.sourceEventLabel && (
            <p className="wfp-priority-note">
              {rule.priority}º dentro do evento &ldquo;{rule.sourceEventLabel}&rdquo;
            </p>
          )}

          <div className="wfp-drawer-block">
            <span className="wfp-block-label">Se — condições</span>
            {rule.conditions.map((raw, i) => {
              /* Compat: seed antigo pode entregar string; runtime já traz
                 o par natural/technical. */
              const c = typeof raw === "string"
                ? { natural: raw, technical: raw, needsEngineeringInput: false }
                : raw;
              return (
                <div key={i} className="wfp-cond-pair">
                  <p className="wfp-cond-natural">{c.natural}</p>
                  {c.technical
                    ? <code className="wfp-cond-code">{c.technical}</code>
                    : c.needsEngineeringInput && (
                        <span className="wfp-cond-pending">mapeamento técnico pendente</span>
                      )
                  }
                </div>
              );
            })}
          </div>

          <div className="wfp-drawer-block">
            <span className="wfp-block-label">Então — ações, em ordem</span>
            {rule.tasks.map((t, i) => {
              const k = kindOf(t.kind);
              return (
                <div key={i} className="wfp-task-row">
                  <span className="wfp-task-num">{i + 1}</span>
                  <span className="wfp-dot" style={{ background: k.dot }} />
                  <span className="wfp-kind-label-inline">{k.label}</span>
                  <span className="wfp-task-label">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Canvas ─────────────────────────────────────────────────────────────── */
function WorkflowPoliciesCanvas({
  policies, query, onQuery, category, onCategory, status, onStatus,
  selectedRuleId, onSelectRule, highlightId, highlightPolicyId, initialExpandedPolicyId, onNewRule,
  onTogglePolicyActive, onEditObjective, onToggleRule, onRenameRule, onCreateRule, onDeleteRule,
  onAddCondition, onRemoveCondition, onUpdateCondition,
  onAddTask, onRemoveTask, onUpdateTask,
  onAddEscalation, onRemoveEscalation, onUpdateEscalation,
  onBack, chatOpen, onToggleChat, onCloseCanvas,
}) {
  const rowRefs = useRef({});
  /* Acordeão de 2 níveis, só nesta tela: uma política aberta por vez, e
     dentro dela uma regra aberta por vez — nunca navega para outra tela
     (feedback direto do vídeo de review: "diminuir a quantidade de telas"). */
  const [expandedPolicyId, setExpandedPolicyId] = useState(initialExpandedPolicyId || null);
  const [expandedRuleId, setExpandedRuleId] = useState(null);

  /* Regra recém-criada ou aberta pelo chat ("abrir MON-005"): abre a
     política dona da regra e a própria regra em sanfona, depois rola até
     ela — sem isso, o elemento não existe no DOM (política ainda fechada)
     e o scroll não teria o que fazer. */
  useEffect(() => {
    if (!highlightId) return;
    const owner = policies.find((p) => p.rules.some((r) => r.id === highlightId));
    if (owner) {
      setExpandedPolicyId(owner.id);
      setExpandedRuleId(highlightId);
    }
  }, [highlightId, policies]);

  useEffect(() => {
    if (!highlightId) return;
    const el = rowRefs.current[highlightId];
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId, expandedPolicyId]);

  /* "Desejo alterar uma política" (chip/chat): abre a política certa em
     sanfona e rola até ela — mesma ideia do highlightId acima, mas no
     nível da política em vez da regra. */
  useEffect(() => {
    if (!highlightPolicyId) return;
    setExpandedPolicyId(highlightPolicyId);
  }, [highlightPolicyId]);

  useEffect(() => {
    if (!highlightPolicyId) return;
    const el = rowRefs.current[highlightPolicyId];
    if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [highlightPolicyId, expandedPolicyId]);

  /* Chegou aqui já com uma política para abrir (ex.: "Transformar em
     política permanente" no Modo 2, via initialExpandedPolicyId) — rola
     até ela uma vez, no primeiro render em que ela existir no DOM. */
  useEffect(() => {
    if (!initialExpandedPolicyId) return;
    const el = rowRefs.current[initialExpandedPolicyId];
    if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
    // eslint-disable-next-line
  }, []);

  const q = norm(query.trim());
  const matches = (rule, policy) => {
    if (status === "on" && !rule.active) return false;
    if (status === "off" && rule.active) return false;
    if (!q) return true;
    return [rule.id, rule.name, rule.trigger, policy.name, ...rule.tasks.map((t) => t.label)]
      .some((v) => norm(v).includes(q));
  };

  const groups = policies
    .filter((p) => category === "all" || p.category === category)
    .map((p) => ({ policy: p, rules: p.rules.filter((r) => matches(r, p)) }))
    .filter((g) => g.rules.length > 0);

  const countFor = (catId) => policies
    .filter((p) => catId === "all" || p.category === catId)
    .reduce((n, p) => n + p.rules.length, 0);

  const categoryLabel = category === "all" ? "Todas" : categoryOf(category).label;

  const statusOptions = [
    { id: "all", label: "Todas" },
    { id: "on",  label: "Ativas" },
    { id: "off", label: "Desligadas" },
  ];
  const statusLabel = (statusOptions.find((o) => o.id === status) || statusOptions[0]).label;

  return (
    <div className="detail-panel">
      <CanvasTopbar
        onBack={onBack}
        backLabel="Voltar para Workflows"
        cta={{ label: "Nova regra", variant: "primary", onClick: onNewRule }}
        chatOpen={chatOpen}
        onToggleChat={onToggleChat}
        onCloseCanvas={onCloseCanvas}
      />

      {/* §1.3/§5 — "Políticas de pedido" saiu do topbar e virou o h1 do corpo,
          acima da toolbar de filtros. */}
      <div className="wfp-page-head">
        <h1 className="detail-title">Políticas de pedido</h1>
      </div>

      <div className="wfp-toolbar">
        <div data-sl-module-browser-search="" className="wfp-search search-pill-compact">
          <span data-sl-module-browser-search-pre-icon=""><Icon name="search" size={20} /></span>
          <input
            data-sl-module-browser-search-input=""
            type="search"
            placeholder="Buscar"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          {query && (
            <button data-sl-module-browser-search-clear="" title="Limpar busca" onClick={() => onQuery("")}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        <Dropdown
          align="left"
          trigger={
            <button className="filter-dropdown-btn wfp-cat-btn">
              <span className="filter-dropdown-label-text">Categoria:</span>
              <span className="filter-dropdown-summary">{categoryLabel}</span>
              <span className="filter-dropdown-chevron"><Icon name="chevron-down" size={16} /></span>
            </button>
          }
        >
          {[{ id: "all", label: "Todas as categorias" }].concat(
            AIWData.policyCategories.map((c) => ({ id: c.id, label: c.label }))
          ).map((opt) => (
            <button key={opt.id} className={`dd-item wfp-cat-option${category === opt.id ? " selected" : ""}`} onClick={() => onCategory(opt.id)}>
              <span className="wfp-cat-check">
                {category === opt.id && <Icon name="check" size={18} />}
              </span>
              <span className="dd-item-label wfp-cat-option-label">{opt.label}</span>
              <span className="wfp-cat-count">{countFor(opt.id)}</span>
            </button>
          ))}
        </Dropdown>

        {/* Status vira dropdown seleção-única no mesmo padrão do filtro de
            categoria (.filter-dropdown-btn.wfp-cat-btn) — troca do segmented
            para uniformizar os filtros da toolbar. */}
        <Dropdown
          align="left"
          trigger={
            <button className="filter-dropdown-btn wfp-cat-btn">
              <span className="filter-dropdown-label-text">Status:</span>
              <span className="filter-dropdown-summary">{statusLabel}</span>
              <span className="filter-dropdown-chevron"><Icon name="chevron-down" size={16} /></span>
            </button>
          }
        >
          {statusOptions.map((opt) => (
            <button key={opt.id} className={`dd-item wfp-cat-option${status === opt.id ? " selected" : ""}`} onClick={() => onStatus(opt.id)}>
              <span className="wfp-cat-check">
                {status === opt.id && <Icon name="check" size={18} />}
              </span>
              <span className="dd-item-label wfp-cat-option-label">{opt.label}</span>
            </button>
          ))}
        </Dropdown>
      </div>

      <div className="detail-scroll wfp-scroll">
        <div className="wfp-list">
          {groups.length > 0 && (
            <div className="pd-info-box">
              <Icon name="info" size={18} />
              <div className="pd-info-text">
                <b>Sobre a execução das regras</b>
                <p>As regras são avaliadas continuamente pelo agente. Quando uma condição é atendida, o agente executa as tarefas permitidas de forma autônoma, respeitando os limites de escalação definidos.</p>
              </div>
            </div>
          )}

          {groups.map(({ policy, rules }) => {
            const active = rules.filter((r) => r.active).length;
            const isOpen = expandedPolicyId === policy.id;
            return (
              <section
                key={policy.id}
                ref={(el) => { rowRefs.current[policy.id] = el; }}
                className={`wfp-card${isOpen ? " is-open" : ""}`}
              >
                <button
                  className="wfp-card-head wfp-card-head--toggle"
                  onClick={() => setExpandedPolicyId(isOpen ? null : policy.id)}
                >
                  <Icon name={isOpen ? "expand-less" : "expand-more"} size={20} />
                  <div className="wfp-card-title">
                    <span className="wfp-card-name">{policy.name}</span>
                    <span className="wfp-card-meta">
                      {plural(rules.length, "regra", "regras")} · {plural(active, "ativa", "ativas")}
                    </span>
                  </div>
                  <PolicyStateTag active={policy.active} />
                  <PolicyCategoryTag categoryId={policy.category} />
                </button>

                {isOpen && (
                  <div className="wfp-card-body">
                    <div className="pd-header-title-row pd-header-title-row--compact">
                      <Toggle on={policy.active} onChange={() => onTogglePolicyActive(policy.id)} />
                      <span className="pd-header-meta">
                        Criada em {policy.createdAt} por {policy.createdBy} · Atualizada em {policy.updatedAt}
                      </span>
                    </div>

                    {policy.objective && (
                      <PolicyObjectiveCard policy={policy} onEditObjective={(text) => onEditObjective(policy.id, text)} />
                    )}

                    <div className="pd-rules-headrow">
                      <h4 className="pd-card-title">
                        Regras da política
                        <span className="pd-rules-count">{plural(rules.length, "regra", "regras")} ({plural(active, "ativa", "ativas")})</span>
                      </h4>
                      <button data-sl-button data-variant="primary" data-has-label
                        onClick={() => setExpandedRuleId(onCreateRule(policy.id))}>
                        <Icon name="plus" size={16} /> Criar regra
                      </button>
                    </div>

                    {rules.map((rule, i) => (
                      <div key={rule.id} ref={(el) => { rowRefs.current[rule.id] = el; }} className={highlightId === rule.id ? "is-new" : ""}>
                        <PolicyRuleRow
                          rule={rule}
                          index={i + 1}
                          policyId={policy.id}
                          expanded={expandedRuleId === rule.id}
                          onExpand={() => setExpandedRuleId(expandedRuleId === rule.id ? null : rule.id)}
                          onToggleActive={() => onToggleRule(policy.id, rule.id)}
                          onRename={(name) => onRenameRule(policy.id, rule.id, name)}
                          onDelete={() => onDeleteRule(policy.id, rule.id)}
                          onAddCondition={() => onAddCondition(policy.id, rule.id)}
                          onRemoveCondition={(i2) => onRemoveCondition(policy.id, rule.id, i2)}
                          onUpdateCondition={(i2, patch) => onUpdateCondition(policy.id, rule.id, i2, patch)}
                          onAddTask={() => onAddTask(policy.id, rule.id)}
                          onRemoveTask={(i2) => onRemoveTask(policy.id, rule.id, i2)}
                          onUpdateTask={(i2, patch) => onUpdateTask(policy.id, rule.id, i2, patch)}
                          onAddEscalation={() => onAddEscalation(policy.id, rule.id)}
                          onRemoveEscalation={(i2) => onRemoveEscalation(policy.id, rule.id, i2)}
                          onUpdateEscalation={(i2, patch) => onUpdateEscalation(policy.id, rule.id, i2, patch)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}

          {groups.length === 0 && (
            <div className="wfp-empty">Nenhuma regra encontrada para esse filtro.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tela de detalhe de política ─────────────────────────────────────────
   Substitui o canvas de lista quando o gerente clica no nome de uma
   política. Layout: cabeçalho + objetivo do gerente + lista de regras,
   cada uma expansível em 3 colunas (Quando / Tarefas / Escalar quando) —
   modelo validado com o time de design (ver print de referência). */
const CONDITION_OPERATORS = ["é igual a", "é diferente de", "é maior que", "é menor que", "é maior ou igual a", "é menor ou igual a"];
const ESCALATION_OPERATORS = ["é maior que", "é menor que", "é igual a", "é diferente de"];

function ConditionRow({ condition, onChange, onRemove }) {
  const p = condition.param || { field: "Condição", operator: "verdadeiro quando", value: condition.natural || "" };
  return (
    <div className="pd-field-group">
      <div className="pd-field-row">
        <input className="pd-field-input pd-field-input--field" value={p.field}
          onChange={(e) => onChange({ field: e.target.value })} placeholder="Campo" />
        <button className="pd-field-remove" title="Remover condição" onClick={onRemove}><Icon name="x" size={14} /></button>
      </div>
      <div className="pd-field-row">
        <select className="pd-field-select" value={p.operator} onChange={(e) => onChange({ operator: e.target.value })}>
          {CONDITION_OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        <input className="pd-field-input pd-field-input--value" value={p.value}
          onChange={(e) => onChange({ value: e.target.value })} placeholder="Valor" />
        {p.unit && <span className="pd-field-unit">{p.unit}</span>}
      </div>
    </div>
  );
}

function EscalationRow({ esc, onChange, onRemove }) {
  return (
    <div className="pd-field-group">
      <div className="pd-field-row">
        <input className="pd-field-input pd-field-input--field" value={esc.field}
          onChange={(e) => onChange({ field: e.target.value })} placeholder="Campo" />
        <button className="pd-field-remove" title="Remover condição de escalação" onClick={onRemove}><Icon name="x" size={14} /></button>
      </div>
      <div className="pd-field-row">
        <select className="pd-field-select" value={esc.operator} onChange={(e) => onChange({ operator: e.target.value })}>
          {ESCALATION_OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
        </select>
        <input className="pd-field-input pd-field-input--value" value={esc.value}
          onChange={(e) => onChange({ value: e.target.value })} placeholder="Valor" />
        {esc.unit && <span className="pd-field-unit">{esc.unit}</span>}
      </div>
    </div>
  );
}

function TaskRow({ task, onChange, onRemove }) {
  return (
    <div className="pd-task-row">
      <span className="wfp-dot" style={{ background: kindOf(task.kind).dot }} />
      <input className="pd-task-input" value={task.label} onChange={(e) => onChange({ label: e.target.value })} />
      <select className="pd-task-kind-select" value={task.kind} onChange={(e) => onChange({ kind: e.target.value })}>
        {AIWData.policyActionKinds.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
      </select>
      <button className="pd-field-remove" title="Remover tarefa" onClick={onRemove}><Icon name="x" size={14} /></button>
    </div>
  );
}

function PolicyRuleRow({
  rule, index, policyId, expanded, onExpand, onToggleActive, onRename, onDelete,
  onAddCondition, onRemoveCondition, onUpdateCondition,
  onAddTask, onRemoveTask, onUpdateTask,
  onAddEscalation, onRemoveEscalation, onUpdateEscalation,
}) {
  const [editingName, setEditingName] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const escalation = rule.escalation || [];

  return (
    <div className={`pd-rule${expanded ? " is-expanded" : ""}${rule.active ? "" : " is-off"}`}>
      <div className="pd-rule-headrow">
        <span className="pd-rule-num">{index}</span>
        {editingName ? (
          <input
            className="pd-rule-name-input"
            autoFocus
            defaultValue={rule.name}
            onBlur={(e) => { onRename(e.target.value || rule.name); setEditingName(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        ) : (
          <button className="pd-rule-name" onClick={() => onExpand()}>{rule.name}</button>
        )}
        <PolicyStateTag active={rule.active} />
        <Toggle on={rule.active} onChange={onToggleActive} />
        <button className="pd-rule-edit-btn" onClick={() => setEditingName(true)}>
          <Icon name="edit" size={14} /> Editar
        </button>
        <Dropdown
          align="right"
          trigger={<button className="pd-rule-more-btn" aria-label="Mais ações da regra"><Icon name="more" size={16} /></button>}
        >
          <button className="dd-item dd-item--danger" onClick={() => setConfirmingDelete(true)}>
            <Icon name="x-circle" size={16} /> Excluir regra
          </button>
        </Dropdown>
        <button className="pd-rule-chevron" onClick={onExpand} aria-label={expanded ? "Recolher regra" : "Expandir regra"}>
          <Icon name={expanded ? "expand-less" : "expand-more"} size={20} />
        </button>
      </div>

      {confirmingDelete && (
        <div className="pd-rule-delete-confirm">
          <Icon name="warning-amber" size={16} />
          <span>Excluir a regra <b>{rule.name}</b>? Essa ação não pode ser desfeita.</span>
          <div className="pd-rule-delete-confirm-actions">
            <button className="pd-rule-delete-cancel" onClick={() => setConfirmingDelete(false)}>Cancelar</button>
            <button className="pd-rule-delete-confirm-btn" onClick={onDelete}>Excluir regra</button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="pd-rule-cols">
          <div className="pd-col">
            <h4 className="pd-col-title">Quando (condições)</h4>
            {rule.conditions.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="pd-cond-joiner">E</span>}
                <ConditionRow
                  condition={c}
                  onChange={(patch) => onUpdateCondition(i, patch)}
                  onRemove={() => onRemoveCondition(i)}
                />
              </React.Fragment>
            ))}
            <button className="pd-add-link" onClick={onAddCondition}>
              <Icon name="plus" size={14} /> Adicionar condição
            </button>
          </div>

          <div className="pd-col">
            <h4 className="pd-col-title">
              O agente pode executar (tarefas)
              <span className="pd-col-info" title="Tarefas que o agente está autorizado a executar quando as condições forem verdadeiras."><Icon name="info" size={14} /></span>
            </h4>
            {rule.tasks.map((t, i) => (
              <TaskRow key={i} task={t} onChange={(patch) => onUpdateTask(i, patch)} onRemove={() => onRemoveTask(i)} />
            ))}
            <button className="pd-add-link" onClick={onAddTask}>
              <Icon name="plus" size={14} /> Adicionar tarefa
            </button>
          </div>

          <div className="pd-col">
            <h4 className="pd-col-title">Escalar quando (limite de autonomia)</h4>
            {escalation.length === 0 && (
              <p className="pd-col-empty">Nenhuma condição de escalação definida — o agente nunca escala esta regra.</p>
            )}
            {escalation.map((e, i) => (
              <EscalationRow key={i} esc={e} onChange={(patch) => onUpdateEscalation(i, patch)} onRemove={() => onRemoveEscalation(i)} />
            ))}
            <button className="pd-add-link" onClick={onAddEscalation}>
              <Icon name="plus" size={14} /> Adicionar condição de escalação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PolicyObjectiveCard({ policy, onEditObjective }) {
  const [editing, setEditing] = useState(false);
  return (
    <section className="pd-card">
      <div className="pd-card-headrow">
        <h4 className="pd-card-title"><Icon name="chat-bubble-outline" size={16} /> Objetivo descrito pelo gerente</h4>
        {!editing && (
          <button className="pd-edit-btn" onClick={() => setEditing(true)}>
            <Icon name="edit" size={14} /> Editar objetivo
          </button>
        )}
      </div>
      {editing ? (
        <textarea
          className="pd-objective-input"
          autoFocus
          defaultValue={policy.objective}
          onBlur={(e) => { onEditObjective(e.target.value || policy.objective); setEditing(false); }}
        />
      ) : (
        <p className="pd-objective-text">&ldquo;{policy.objective}&rdquo;</p>
      )}
    </section>
  );
}

/* ── Chat: rascunhos de regra ────────────────────────────────────────────
   A frase do operador é casada com um rascunho conhecido; sem casamento, o
   agente propõe uma regra de detecção genérica com a própria frase como
   gatilho. O rascunho vira action card e só existe no canvas após "Aplicar". */
const RULE_DRAFTS = [
  {
    match: /coleta|coletar|transportadora|carrier|etiqueta/,
    policyId: "pol-carrier",
    name: "Transportadora não coletou no horário",
    conditions: ["pickup.collectedOnTime == false"],
    tasks: [
      { label: "Acionar transportadora", kind: "notify" },
      { label: "Reagendar coleta", kind: "replan" },
      { label: "Notificar cliente", kind: "notify" },
    ],
  },
  {
    match: /pagamento|pagar|captura|autoriza|cobranca|estorno/,
    policyId: "pol-payment-authorization",
    name: "Pedido travado em pagamento",
    conditions: ["payment.approved == true", "payment.stuckHours > 4"],
    tasks: [
      { label: "Tentar nova autorização/captura", kind: "reprocess" },
      { label: "Abrir alerta para SAC/Financeiro", kind: "notify" },
      { label: "Cancelar por política", kind: "cancel" },
    ],
  },
  {
    match: /separa|picking|packing|estoque|fulfillment|cd\b/,
    policyId: "pol-picking",
    name: "Pedido parado na separação",
    conditions: ["picking.started == false", "picking.dueAt < now()"],
    tasks: [
      { label: "Priorizar na fila", kind: "replan" },
      { label: "Reatribuir fulfillment point", kind: "reallocate" },
      { label: "Notificar cliente preventivamente", kind: "notify" },
    ],
  },
  {
    match: /devolu|troca|reembols|reverso/,
    policyId: "pol-returns",
    name: "Devolução sem desfecho no prazo",
    conditions: ["return.approved == true", "refund.elapsedHours > refund.slaHours"],
    tasks: [
      { label: "Validar evidências do reembolso", kind: "diagnose" },
      { label: "Reprocessar reembolso", kind: "refund" },
      { label: "Escalar para o PSP", kind: "escalate" },
    ],
  },
  {
    match: /entrega|atras|sla|despach/,
    policyId: "pol-dispatch",
    name: "Entrega em risco de furar o SLA",
    conditions: ["delivery.slaBreachProjected == true"],
    tasks: [
      { label: "Antecipar etapa crítica", kind: "replan" },
      { label: "Trocar transportadora", kind: "reallocate" },
      { label: "Notificar cliente", kind: "notify" },
    ],
  },
];

/* Prompt de referência: quando um evento tem mais de uma regra cadastrada,
   cada uma cobrindo uma causa raiz distinta, o LLM escolhe qual regra
   existente melhor corresponde à frase — ou devolve null se a frase
   descreve uma variante nova dentro do mesmo evento. Versionado aqui para
   que a implementação de produção substitua `matchExistingPolicy` por
   uma chamada real usando este prompt. */
const PROMPT_MATCH_EXISTING_RULE = `
Este evento já tem mais de uma regra cadastrada, cada uma cobrindo uma causa raiz
diferente. Decida qual regra existente melhor corresponde à frase do merchant,
comparando com o "trigger" (a circunstância) de cada uma.

Evento: \${eventMatch.label}

Regras existentes para este evento:
\${existingRules.map(r => \`- \${r.id} (\${r.name}): "\${r.trigger}"\`).join("\\n")}

Frase do merchant: "\${phrase}"

Responda apenas com JSON:
{
  "ruleId": "<um dos ids acima, ou null se nenhuma causa raiz combina>",
  "reasoning": "<uma frase curta explicando a escolha, para log interno — nunca mostrada ao merchant>"
}

Se ruleId for null, o merchant está descrevendo uma variante nova dentro do mesmo evento —
trate como needsNewRule mesmo esse evento tendo regras existentes.
`;

/* Monta o texto real do PROMPT_MATCH_EXISTING_RULE acima — o template com
   ${...} escapado ali é só documentação; aqui interpolamos os valores de
   verdade antes de mandar pra LLM. */
function buildMatchExistingRulePrompt(phrase, eventMatch, existingRules) {
  return `Este evento já tem mais de uma regra cadastrada, cada uma cobrindo uma causa raiz
diferente. Decida qual regra existente melhor corresponde à frase do merchant,
comparando com o "trigger" (a circunstância) de cada uma.

Evento: ${eventMatch.label}

Regras existentes para este evento:
${existingRules.map((r) => `- ${r.id} (${r.name}): "${r.trigger}"`).join("\n")}

Frase do merchant: "${phrase}"

Responda apenas com JSON:
{
  "ruleId": "<um dos ids acima, ou null se nenhuma causa raiz combina>",
  "reasoning": "<uma frase curta explicando a escolha, para log interno — nunca mostrada ao merchant>"
}

Se ruleId for null, o merchant está descrevendo uma variante nova dentro do mesmo evento —
trate como needsNewRule mesmo esse evento tendo regras existentes.`;
}

/* Heurística determinística de protótipo: pontua cada regra existente do
   evento por sobreposição de tokens (>=4 chars) entre a frase e o
   nome+trigger+tarefas. Empate ou score baixo → null (equivalente a
   "nenhuma causa raiz combina" no PROMPT_MATCH_EXISTING_RULE), o que
   dispara Fluxo C no `handleFreeformRule`. Usada como fallback quando a
   LLM real (matchExistingPolicyReal, abaixo) não está disponível. */
function matchExistingPolicyHeuristic(phrase, eventMatch, policies) {
  const ids = eventMatch.existingRuleIds || [];
  if (ids.length === 0) return null;
  const candidates = ids
    .map((rid) => {
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === rid);
        if (r) return r;
      }
      return null;
    })
    .filter(Boolean);
  if (candidates.length === 0) return null;

  const n = norm(phrase);
  const tokens = n.split(/\s+/).filter((t) => t.length >= 4);
  const scored = candidates.map((r) => {
    const hay = norm(`${r.name} ${r.trigger} ${r.tasks.map((t) => t.label).join(" ")}`);
    let s = 0;
    for (const tok of tokens) if (hay.includes(tok)) s += 1;
    return { rule: r, score: s };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const runnerUp = scored[1];
  if (!top || top.score < 2) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.rule.id;
}

/* Heurística de fallback para pedido de exclusão por frase livre — só
   entra em ação se a chamada real à LLM (classifyDeleteIntentReal,
   abaixo) falhar. Exige um verbo de exclusão explícito na frase (sem
   isso, nunca interpreta como pedido de excluir — evitar falso positivo
   é mais importante que acertar toda vez, já que a ação é destrutiva e
   aqui é executada sem confirmação). Desempate por sobreposição de
   token, igual matchExistingPolicyHeuristic. */
function matchDeleteIntentHeuristic(phrase, candidateRules) {
  const n = norm(phrase);
  if (!/exclu|apag|remov|delet/.test(n)) return null;
  const tokens = n.split(/\s+/).filter((t) => t.length >= 4 && !/^(exclu|apag|remov|delet|regra)/.test(t));
  if (tokens.length === 0) return null;
  const scored = candidateRules.map((r) => {
    const hay = norm(`${r.name} ${r.trigger}`);
    let s = 0;
    for (const tok of tokens) if (hay.includes(tok)) s += 1;
    return { rule: r, score: s };
  }).sort((a, b) => b.score - a.score);
  const top = scored[0];
  const runnerUp = scored[1];
  if (!top || top.score < 2) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.rule.id;
}

/* Monta o prompt real de classificação de intenção de exclusão — roda
   contra TODAS as regras ainda ativas MAIS as já excluídas nesta sessão
   (não só as de um evento), porque o gerente pode pedir para excluir
   qualquer regra existente, de qualquer política, em qualquer momento
   da conversa — e pode repetir um pedido de exclusão que já foi
   atendido antes, caso em que a regra já não está mais entre as
   ativas, mas o agente ainda precisa reconhecer do que se trata para
   responder de forma idempotente em vez de "não consegui identificar". */
function buildDeleteIntentPrompt(phrase, allRules, deletedRules) {
  const deletedBlock = deletedRules.length === 0 ? "" : `

Regras já excluídas anteriormente nesta conversa (o gerente pode repetir um pedido sobre uma delas — nesse caso ainda identifique o id normalmente):
${deletedRules.map((r) => `- ${r.id} (${r.name}): "${r.trigger}"`).join("\n")}`;
  return `O gerente está conversando com o assistente de políticas de um agente de pedidos. Decida se a frase abaixo é um PEDIDO PARA EXCLUIR uma regra existente — e, se for, qual regra, comparando com o nome e o "trigger" (a circunstância) de cada uma.

Frase do gerente: "${phrase}"

Regras existentes:
${allRules.map((r) => `- ${r.id} (${r.name}): "${r.trigger}"`).join("\n")}${deletedBlock}

REGRA IMPORTANTE, para evitar falso positivo: isDeleteRequest só pode ser true se a frase contém um verbo claramente dirigido a REMOVER/APAGAR/DESATIVAR A PRÓPRIA REGRA (excluir, apagar, remover, deletar, tirar essa regra, desfazer essa política). Uma frase que apenas DESCREVE uma condição e uma ação — no formato "quando/se X, faça Y" — é sempre um pedido de CRIAÇÃO de regra nova, isDeleteRequest: false, mesmo que a ação descrita (ex.: "cancela o pedido") pareça semelhante ao efeito de alguma regra já existente. Só o texto pedir explicitamente para excluir/apagar a regra em si conta — nunca inferir isso pela semelhança de conteúdo.

Exemplos:
- "exclua a regra de falha na etiqueta" → isDeleteRequest: true (verbo "exclua" dirigido à regra).
- "quando o pagamento ficar pendente por mais de 2 horas, cancela o pedido" → isDeleteRequest: false (é uma condição nova sendo descrita, não um pedido para apagar algo).
- "não preciso mais dessa regra de fraude" → isDeleteRequest: true.
- "muda o limite dessa regra para 4 horas" → isDeleteRequest: false (é alteração de parâmetro, não exclusão).

Responda apenas com JSON:
{
  "isDeleteRequest": true ou false,
  "ruleId": "<um dos ids acima (existente ou já excluído), ou null se não for pedido de exclusão ou nenhuma regra combina com confiança>",
  "reasoning": "<uma frase curta explicando a escolha, para log interno — nunca mostrada ao gerente>"
}`;
}

/* Versão real: chama a LLM para decidir se a frase é um pedido de
   exclusão e, se for, qual regra — mesmo padrão de matchExistingPolicyReal
   (Promise sempre resolvida, nunca rejeitada; cai no heurístico acima se
   o proxy não existir ou a chamada falhar por qualquer motivo). Testado
   contra TODA mensagem do chat (não só as que "parecem" um pedido de
   exclusão) — decisão deliberada para usar a LLM de verdade como
   primeira linha de roteamento de intenção neste chat, não só como
   desempate entre candidatos, e para exercitar repetição/idempotência
   real do agente (pedir a mesma exclusão duas vezes não deve quebrar
   nada nem excluir "de novo" algo que já sumiu — para isso o id
   precisa continuar identificável mesmo depois de excluído, daí
   `deletedRules` entrar como candidato também). */
function classifyDeleteIntentReal(phrase, allRules, deletedRules) {
  const candidates = allRules.concat(deletedRules);
  if (candidates.length === 0) return Promise.resolve({ isDeleteRequest: false, ruleId: null, viaLLM: false });
  const prompt = buildDeleteIntentPrompt(phrase, allRules, deletedRules);
  return LLMClient.complete(prompt, { jsonMode: true })
    .then((result) => {
      const validIds = candidates.map((r) => r.id);
      const isDeleteRequest = !!(result && result.isDeleteRequest);
      const ruleId = (isDeleteRequest && result && validIds.includes(result.ruleId)) ? result.ruleId : null;
      return { isDeleteRequest, ruleId, viaLLM: true };
    })
    .catch(() => {
      const ruleId = matchDeleteIntentHeuristic(phrase, candidates);
      return { isDeleteRequest: ruleId !== null, ruleId, viaLLM: false };
    });
}

/* Versão real: chama a LLM (via LLMClient → app/api/llm/complete no
   agentic-oms) com PROMPT_MATCH_EXISTING_RULE de verdade. Se o proxy não
   existir (protótipo aberto fora do Next.js — GitHub Pages, arquivo
   estático) ou a chamada falhar por qualquer motivo, cai de volta no
   heurístico determinístico — o chat nunca fica sem resposta.
   Sempre devolve uma Promise<string|null>, ao contrário da versão
   heurística (síncrona) — é o padrão a seguir ao trocar os outros 6
   PROMPT_* por chamadas reais. */
function matchExistingPolicyReal(phrase, eventMatch, policies) {
  const ids = eventMatch.existingRuleIds || [];
  const existingRules = ids
    .map((rid) => {
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === rid);
        if (r) return r;
      }
      return null;
    })
    .filter(Boolean);
  if (existingRules.length === 0) return Promise.resolve(null);

  const prompt = buildMatchExistingRulePrompt(phrase, eventMatch, existingRules);
  return LLMClient.complete(prompt, { jsonMode: true })
    .then((result) => {
      const validIds = existingRules.map((r) => r.id);
      const ruleId = (result && validIds.includes(result.ruleId)) ? result.ruleId : null;
      return { ruleId, viaLLM: true }; // chamada real respondeu — mesmo "null" veio da LLM, não do heurístico
    })
    .catch(() => ({ ruleId: matchExistingPolicyHeuristic(phrase, eventMatch, policies), viaLLM: false }));
}

/* Prompt de referência: a LLM só REDIGE — não decide mais threshold nem
   ações. O merchant já confirmou os dois via `askRuleParameters` (caminho
   guiado) ou os inferiu implicitamente na frase livre (caminho não
   guiado, seção 3). O prompt injeta os valores fixos e a lista/ordem de
   ações; o modelo só escreve nome, trigger, natural/technical das
   condições e labels das tasks. Nunca troca threshold, nunca reordena
   ações. */
const PROMPT_DRAFT_RULE = `
Você escreve o Se/Então de uma regra. O merchant JÁ escolheu o threshold e as
ações — sua tarefa é só redigir, não decidir o conteúdo. Nunca troque o valor
do threshold nem a lista/ordem de ações recebidas.

Evento de origem (fixo): \${eventMatch.id} — "\${eventMatch.label}"
Threshold confirmado pelo merchant: \${params.threshold ? \`\${params.threshold.value}\${params.threshold.unit}\` : "não aplicável"}
Ações escolhidas, na ordem: \${params.chosenActions.join(" → ")}

Responda apenas com JSON:
{
  "name": "<nome curto da regra>",
  "trigger": "<frase da circunstância, incorporando o threshold quando houver>",
  "conditions": [
    { "natural": "...", "technical": "..." | null, "needsEngineeringInput": boolean }
  ],
  "tasks": [
    // UMA entrada por item de chosenActions, NA MESMA ORDEM — não reordene, não adicione, não remova.
    { "kind": "<item de chosenActions>", "label": "<ação em poucas palavras>", "target": "agent" | "sac" | "supervisor" }
  ]
}
`;

/* Parse determinístico do valor de threshold digitado pelo merchant.
   Retorna `{value, unit}` ou null se não bater com o formato esperado.
   `thresholdParam.unit` decide a categoria: "duration" aceita min/h/d,
   "count" aceita número puro. */
function parseThreshold(text, thresholdParam) {
  const raw = norm(text).trim();
  if (!raw) return null;
  if (thresholdParam?.unit === "count") {
    const m = raw.match(/^(\d+)/);
    if (!m) return null;
    return { value: parseInt(m[1], 10), unit: "count" };
  }
  /* Duration: aceita "4h", "30 min", "2d", "3 dias", "1 hora". */
  const m = raw.match(/^(\d+)\s*(min|m|h|hora|horas|d|dia|dias)\b/);
  if (!m) return null;
  const value = parseInt(m[1], 10);
  const rawUnit = m[2];
  const unit = /^m(in)?$/.test(rawUnit) ? "min"
    : /^d/.test(rawUnit) ? "d"
    : "h";
  return { value, unit };
}

/* Formata um threshold `{value, unit}` como condição natural + technical.
   `unit` do answer é a sub-unidade concreta ("min"/"h"/"d" para duration,
   "count" para contagem) — a categoria vem do `thresholdParam.unit`. */
function thresholdToCondition(threshold, thresholdParam) {
  if (!threshold) return null;
  if (thresholdParam?.unit === "count") {
    return {
      natural: `Pelo menos ${threshold.value} ocorrência(s)`,
      technical: `count >= ${threshold.value}`,
      needsEngineeringInput: false,
    };
  }
  const unitLabel = threshold.unit === "min" ? "minutos" : threshold.unit === "h" ? "horas" : threshold.unit === "d" ? "dias" : threshold.unit;
  return {
    natural: `Aguardou pelo menos ${threshold.value} ${unitLabel}`,
    technical: `elapsed >= "${threshold.value}${threshold.unit}"`,
    needsEngineeringInput: false,
  };
}

/* Rascunha uma regra a partir da frase + evento reconhecido, seguindo a
   gramática do PROMPT_DRAFT_RULE. Se `eventMatch` é null, cai no fallback
   por regex (RULE_DRAFTS) — usado só quando o caller ainda não passou o
   contexto do evento. Se `params` vem preenchido (Fluxo de parâmetros
   guiado: `{ threshold, chosenActions }`), usa os valores confirmados
   pelo merchant em vez de inventar via template. Em produção, substitua
   por chamada ao LLM. */
function draftFor(phrase, eventMatch, params) {
  if (!eventMatch) {
    const n = norm(phrase);
    const hit = RULE_DRAFTS.find((d) => d.match.test(n));
    if (hit) return { ...hit, trigger: phrase.trim() };
    return {
      policyId: "pol-risk-sla",
      name: phrase.trim().replace(/^./, (c) => c.toUpperCase()).slice(0, 70),
      trigger: phrase.trim(),
      conditions: ["event.matchesDescription == true"],
      tasks: [
        { label: "Diagnosticar ocorrência", kind: "diagnose" },
        { label: "Abrir task de exceção", kind: "workflow" },
        { label: "Notificar operação", kind: "notify" },
      ],
    };
  }

  const tpl = NEW_RULE_TEMPLATES[eventMatch.id];

  /* Condições: se veio threshold nos params, ela vira a única condição
     (o merchant confirmou o valor). Sem threshold, usa o template ou o
     fallback determinístico. */
  let conditions;
  if (params?.threshold) {
    const cond = thresholdToCondition(params.threshold, eventMatch.thresholdParam);
    conditions = cond ? [cond] : [];
  } else {
    const rawConds = tpl?.conditions || ["event.matchesDescription == true"];
    conditions = rawConds.map((c) => ({
      natural: c,
      technical: c,
      needsEngineeringInput: false,
    }));
  }

  /* Tarefas: se veio chosenActions, elas definem a ordem exata; label
     default vem de kindOf. Sem chosenActions, usa o template ou o
     fallback determinístico. */
  let tasks;
  if (params?.chosenActions?.length) {
    tasks = params.chosenActions.map((kind) => ({
      label: kindOf(kind).label,
      kind,
      target: "agent",
    }));
  } else {
    const rawTasks = tpl?.tasks || [
      { label: "Diagnosticar ocorrência", kind: "diagnose" },
      { label: "Notificar operação", kind: "notify" },
    ];
    tasks = rawTasks.map((t) => ({ ...t, target: "agent" }));
  }

  return {
    _forEventId: eventMatch.id,
    name: eventMatch.label,
    trigger: (phrase && phrase.trim()) || eventMatch.label,
    conditions,
    tasks,
  };
}

/* Fluxo C — orquestrador. Chama `suggestPolicy` (LLM: categoria + nome) e
   `findSimilarPolicy` (LLM: alerta de política parecida) sem lógica
   própria de julgamento, e devolve um draft compatível com `applyDraft`
   (flat, com trigger/conditions/tasks) enriquecido com os metadados
   `_similarPolicyWarning` e `_pendingEventCatalog` do Fluxo C.

   A primeira regra vem sempre de `draftFor(phrase, eventMatch)` — política
   nunca nasce vazia. Se `eventMatch` for null, `pendingEventCatalog:
   true` marca a regra para triagem posterior do catálogo. Precisa receber
   `allPolicies` para o findSimilarPolicy (dependência que o LLM real
   receberia via prompt). */
function policyDraftFor(phrase, eventMatch, allPolicies, params) {
  const sugg = suggestPolicy(phrase, eventMatch);
  const nomePolitica = eventMatch?.proposedPolicy ?? sugg.nomePolitica;
  const categoria = eventMatch?.proposedCategory ?? sugg.categoria;
  const similar = findSimilarPolicy({ nomePolitica, categoria }, allPolicies || []);
  const primeiraRegra = draftFor(phrase, eventMatch, params);

  return {
    /* Campos consumidos por applyDraft (draft flat, retrocompatível): */
    _forEventId: eventMatch?.id || null,
    _similarPolicyWarning: similar.similarPolicyId
      ? `Isso é parecido com "${similar.similarPolicyId}" — quer mesmo separar, ou prefere adicionar como regra nova lá? (${similar.reason})`
      : null,
    _pendingEventCatalog: !eventMatch,
    policyName: nomePolitica,
    categoryId: categoria,
    name: eventMatch?.label ?? primeiraRegra.name,
    /* No caminho guiado (NEED_TREE), `phrase` chega como null — o gatilho
       vem então do próprio label do evento ou do trigger que o draftFor
       montou. `phrase?.trim()` evitava o TypeError, mas o fallback
       explícito deixa a intenção clara. */
    trigger: (phrase && phrase.trim()) || primeiraRegra.trigger || eventMatch?.label || "",
    conditions: primeiraRegra.conditions,
    tasks: primeiraRegra.tasks,
  };
}

/* Chips da chip-row — atalhos persistentes, cada um com intent mapeado.
   Digitar direto no composer já cobre o caminho por frase livre; o chip
   é o atalho para o caminho guiado (NEED_TREE), quando o operador não
   tem certeza do que precisa. */
const POLICY_CHIPS = [
  { icon: "plus", label: "Desejo criar uma política", intent: "policy-create" },
  { icon: "edit", label: "Desejo alterar uma política", intent: "policy-alter" },
  { icon: "search", label: "Desejo verificar quais pedidos afetam a política", intent: "policy-impact" },
  { icon: "sparkle", label: "Me guia com perguntas", intent: "policy-guided-tree" },
];

/* ── Vocabulário fechado de eventos técnicos ─────────────────────────────
   Lista FECHADA que o agente pode reconhecer a partir de uma frase do
   merchant. Cada evento aponta para regras já existentes que o cobrem
   (`existingRuleIds`) OU declara que ainda não há regra e sugere onde criar
   uma nova (`needsNewRule` + `proposedPolicy` + `proposedCategory`).
   O agente NUNCA inventa evento fora desta lista. */
/* Só eventos `needsNewRule: true` ganham `thresholdParam` e
   `suggestedActions`. Os que reaproveitam regra existente (1, 4, 10, e
   também o de estoque via LOG-005) não passam pela fase de parâmetros —
   a regra já está pronta no cluster. */
const EVENT_CATALOG = [
  { id: "details_viewed_pending_alert_sla", label: "Risco ou violação de SLA",
    existingRuleIds: ["MON-005", "LOG-003", "MON-003"] },
  { id: "details_viewed_pending_alert_stock", label: "Ruptura / inconsistência de estoque",
    existingRuleIds: ["LOG-005"] },
  { id: "details_viewed_pending_alert_avl_down", label: "Sistema de disponibilidade indisponível",
    needsNewRule: true, proposedPolicy: "Disponibilidade & Integrações", proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quanto tempo sem o sistema voltar isso deveria escalar?", unit: "duration" },
    suggestedActions: ["cancel", "notify", "escalate"] },
  { id: "change_status_mutation_error", label: "Pedido preso por falha de status",
    existingRuleIds: ["MON-001", "MON-002", "MON-003", "MON-004"] },
  { id: "cancel_order_mutation_error", label: "Cancelamento falhou (alto risco)",
    needsNewRule: true, proposedPolicy: "Alterações & Cancelamentos", proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quanto tempo sem confirmação do cancelamento isso deveria virar uma exceção?", unit: "duration" },
    suggestedActions: ["diagnose", "cancel", "notify", "workflow"] },
  { id: "notify_erp_mutation_error", label: "OMS e ERP fora de sincronia",
    needsNewRule: true, proposedPolicy: "Integrações Externas", proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quantas tentativas sem sucesso isso deveria virar risco?", unit: "count" },
    suggestedActions: ["workflow", "cancel", "reprocess", "escalate"] },
  { id: "edit_tracking_data_mutation_error", label: "Tracking inconsistente",
    needsNewRule: true, proposedPolicy: "Coleta & Transporte", proposedCategory: "logistics",
    thresholdParam: { prompt: "Depois de quanto tempo sem fonte de tracking válida isso deveria alertar o SAC?", unit: "duration" },
    suggestedActions: ["reprocess", "workflow", "notify"] },
  { id: "confirm_delivery_mutation_error", label: "Entrega não confirmada",
    needsNewRule: true, proposedPolicy: "Despacho & Entrega", proposedCategory: "logistics",
    thresholdParam: { prompt: "Depois de quanto tempo sem confirmação isso deveria destravar reembolso ou SLA?", unit: "duration" },
    suggestedActions: ["diagnose", "workflow"] },
  { id: "order_auth_callback_mutation_error", label: "Autorização de pagamento inconsistente",
    needsNewRule: true, proposedPolicy: "Pagamentos & Autorização", proposedCategory: "payment",
    thresholdParam: { prompt: "Depois de quanto tempo sem resposta do PSP isso deveria pausar o avanço?", unit: "duration" },
    suggestedActions: ["diagnose", "escalate", "cancel"] },
  { id: "update_task_status_mutation_error", label: "Fila operacional quebrada",
    existingRuleIds: ["LOG-001", "LOG-002"] },
];

/* Prompt de referência: é o que uma LLM real receberia para classificar a
   frase do merchant contra o EVENT_CATALOG. Fica versionado aqui como
   documentação — a implementação de produção substituiria `matchEvent` por
   uma chamada real usando este prompt (com `phrase` interpolada). */
const PROMPT_MATCH_EVENT = `
Você classifica uma frase de um merchant contra uma lista FECHADA de eventos técnicos.
Nunca invente um evento fora da lista. Se a frase puder corresponder a mais de um evento
com confiança parecida, ou a nenhum com confiança razoável, retorne eventId: null —
é mais seguro cair no fallback de "não entendi" do que adivinhar errado.

Eventos disponíveis:
${EVENT_CATALOG.map((e) => `- ${e.id}: ${e.label}`).join("\n")}

Frase do merchant: "\${phrase}"

Responda apenas com JSON, sem texto antes ou depois:
{
  "eventId": "<um dos ids acima, ou null>",
  "confidence": "alta" | "média" | "baixa"
}

Trate confidence "baixa" como equivalente a null no fluxo (conta como tentativa não resolvida).
`;

/* Sinônimos por evento — dicionário local para o matcher determinístico.
   Cada palavra/expressão pontua 1 se aparecer normalizada na frase. */
const EVENT_KEYWORDS = {
  details_viewed_pending_alert_sla: ["sla", "prazo", "atraso", "atrasado", "atrasada", "risco de entrega", "vai atrasar", "furar prazo"],
  details_viewed_pending_alert_stock: ["estoque", "ruptura", "sem estoque", "falta de estoque", "inventario", "nao encontrou item", "item nao encontrado"],
  details_viewed_pending_alert_avl_down: ["disponibilidade", "avl", "availability", "sistema fora", "sistema indisponivel", "servico caiu", "integracao caiu"],
  change_status_mutation_error: ["preso no status", "travado no status", "status nao muda", "change status", "mudanca de status", "falha de status", "pedido preso"],
  cancel_order_mutation_error: ["cancelamento falhou", "nao consegui cancelar", "cancel order", "erro ao cancelar", "cancelar falhou", "falha no cancelamento"],
  notify_erp_mutation_error: ["erp", "sap", "totvs", "oracle ebs", "fora de sincronia", "dessincronizado", "nao chegou no erp"],
  edit_tracking_data_mutation_error: ["tracking", "rastreio", "codigo de rastreio", "tracking inconsistente", "rastreamento errado", "atualizar tracking"],
  confirm_delivery_mutation_error: ["entrega nao confirmada", "confirm delivery", "cliente nao recebeu", "prova de entrega falhou", "pod falhou"],
  order_auth_callback_mutation_error: ["autorizacao", "auth callback", "callback do pagamento", "psp", "gateway retornou erro", "autorizacao inconsistente"],
  update_task_status_mutation_error: ["fila", "worker", "fila operacional", "task travada", "task presa", "update task status", "fila quebrada"],
};

/* Rascunhos default para eventos `needsNewRule` — usados ao propor uma regra
   nova via action card. Mantidos em um mapa separado para não poluir o
   catálogo semântico. Em produção, uma LLM geraria condições + tarefas
   dinamicamente a partir do contexto. */
const NEW_RULE_TEMPLATES = {
  details_viewed_pending_alert_avl_down: {
    conditions: ["availability.systemDown == true"],
    tasks: [
      { label: "Adiar tasks dependentes", kind: "replan" },
      { label: "Alternar para fallback de disponibilidade", kind: "reallocate" },
      { label: "Escalar para engenharia", kind: "escalate" },
    ],
  },
  cancel_order_mutation_error: {
    conditions: ["cancel.mutationError == true"],
    tasks: [
      { label: "Diagnosticar causa da falha", kind: "diagnose" },
      { label: "Reprocessar cancelamento com backoff", kind: "reprocess" },
      { label: "Escalar para SAC/Financeiro", kind: "escalate" },
    ],
  },
  notify_erp_mutation_error: {
    conditions: ["erp.syncStatus != \"ok\""],
    tasks: [
      { label: "Diagnosticar divergência OMS↔ERP", kind: "diagnose" },
      { label: "Reprocessar notificação ao ERP", kind: "reprocess" },
      { label: "Escalar integração", kind: "escalate" },
    ],
  },
  edit_tracking_data_mutation_error: {
    conditions: ["tracking.updateFailed == true"],
    tasks: [
      { label: "Revalidar dados de tracking", kind: "diagnose" },
      { label: "Reprocessar atualização", kind: "reprocess" },
      { label: "Notificar cliente", kind: "notify" },
    ],
  },
  confirm_delivery_mutation_error: {
    conditions: ["delivery.confirmationFailed == true"],
    tasks: [
      { label: "Coletar evidências de entrega", kind: "diagnose" },
      { label: "Reprocessar confirmação", kind: "reprocess" },
      { label: "Escalar para o carrier", kind: "escalate" },
    ],
  },
  order_auth_callback_mutation_error: {
    conditions: ["payment.authCallbackFailed == true"],
    tasks: [
      { label: "Reconciliar callback com PSP", kind: "diagnose" },
      { label: "Reautorizar pagamento", kind: "reprocess" },
      { label: "Escalar para o PSP", kind: "escalate" },
    ],
  },
};

/* Prompt de referência: pré-preenche threshold/ações antes de perguntar.
   Não infere — só extrai o que está EXPLÍCITO na frase. Serve para não
   duplicar perguntas quando o merchant já disse tudo em uma frase só. */
const PROMPT_EXTRACT_PARAMS_FROM_PHRASE = `
O merchant descreveu um cenário. Extraia, SE estiverem explícitos na frase,
o threshold (tempo ou contagem) e as ações desejadas. Não infira o que não
foi dito — deixe null quando a frase não menciona.

Frase: "\${phrase}"

Responda apenas com JSON:
{
  "threshold": { "value": number, "unit": "h" | "d" | "count" } | null,
  "chosenActions": ["<kinds mencionados, na ordem em que aparecem>"] | null
}
`;

/* Sinônimos por kind — pequeno dicionário local para o extrator
   determinístico. Cobre a raiz do verbo em português para pegar
   conjugações comuns (imperativo, infinitivo, terceira pessoa). */
const KIND_PHRASE_KEYWORDS = {
  diagnose:   ["diagnostic", "investig", "apurar"],
  notify:     ["notific", "avis", "alert", "comunic"],
  reprocess:  ["reprocess", "tentar de novo", "retry"],
  replan:     ["replan", "reorden", "antecip", "priorizar"],
  reallocate: ["realoc", "reatribu", "trocar transportadora", "mudar transportadora"],
  refund:     ["reembols", "devolv"],
  cancel:     ["cancel"],
  escalate:   ["escal"],
  workflow:   ["workflow", "abrir task", "abrir tarefa", "exceção"],
};

/* Extrator determinístico: usa `parseThreshold` (para o valor) e o
   dicionário de keywords (para os kinds). Preserva a ORDEM em que os
   kinds aparecem na frase — respeita a intenção do merchant sem
   reordenar. Só devolve valores quando estão claros; senão, null.
   Em produção, substitua por chamada real ao LLM usando
   PROMPT_EXTRACT_PARAMS_FROM_PHRASE com `phrase` interpolada. */
function extractParamsFromPhrase(phrase, event) {
  const result = { threshold: null, chosenActions: null };
  if (!phrase || !event) return result;
  const n = norm(phrase);

  if (event.thresholdParam) {
    /* Reaproveita o parseThreshold: procura o primeiro match no meio
       da frase. `unit: "count"` aceita "N tentativas/vezes/itens…"; o
       resto cai em duration ("Xh", "X min", "Xd"). */
    if (event.thresholdParam.unit === "count") {
      const m = n.match(/(\d+)\s*(tentativ|vezes|itens|ocorr|falhas?)/);
      if (m) result.threshold = { value: parseInt(m[1], 10), unit: "count" };
    } else {
      const m = n.match(/(\d+)\s*(min|m\b|h\b|hora|horas|d\b|dia|dias)/);
      if (m) {
        const value = parseInt(m[1], 10);
        const unit = /^m(in)?$/.test(m[2]) ? "min" : /^d/.test(m[2]) ? "d" : "h";
        result.threshold = { value, unit };
      }
    }
  }

  if (event.suggestedActions?.length) {
    const hits = event.suggestedActions
      .map((kind) => {
        const kws = KIND_PHRASE_KEYWORDS[kind] || [];
        let pos = -1;
        for (const kw of kws) {
          const p = n.indexOf(norm(kw));
          if (p >= 0 && (pos < 0 || p < pos)) pos = p;
        }
        return pos >= 0 ? { kind, pos } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.pos - b.pos)
      .map((x) => x.kind);
    if (hits.length > 0) result.chosenActions = hits;
  }

  return result;
}

/* Heurística determinística de protótipo: normaliza a frase, pontua cada
   evento pelo número de sinônimos que casam, e devolve o evento com maior
   score — desde que passe do threshold e não empate com outro. Empate ou
   score baixo → null (equivalente a "confidence baixa" no PROMPT_MATCH_EVENT).
   Contrato: NUNCA inventa evento fora do EVENT_CATALOG.

   Em produção esta função seria substituída por uma chamada ao LLM usando
   `PROMPT_MATCH_EVENT` com a frase interpolada, obedecendo ao mesmo
   contrato: retornar `null` em vez de adivinhar. */
function matchEvent(phrase) {
  const n = norm(phrase);
  if (!n) return null;

  const scores = EVENT_CATALOG.map((event) => {
    const kws = EVENT_KEYWORDS[event.id] || [];
    let score = 0;
    for (const kw of kws) if (n.includes(norm(kw))) score += 1;
    if (n.includes(norm(event.label))) score += 2;
    return { event, score };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0];
  const runnerUp = scores[1];
  if (!top || top.score < 1) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.event;
}

/* ══ Verificação de conflito ══════════════════════════════════════════════
   DETERMINÍSTICO — sem LLM em nenhuma parte deste bloco. Conflito = outra
   regra ATIVA com o mesmo `sourceEventId` cujas tarefas divergem em kind.
   A tabela de divergência é fixa porque são só 9 tipos e as combinações
   que colidem são um conjunto pequeno e estável — não precisa de
   julgamento de modelo a cada chamada.
   Roda sempre, nos dois caminhos (guiado e não guiado), no momento exato
   em que o botão final seria "Aplicar" / "Criar regra" / "Ativar". */
const KIND_CONFLICTS = [
  ["cancel", "notify"], ["cancel", "reallocate"], ["cancel", "reprocess"],
  ["reallocate", "replan"],
];

function hasDivergentTaskKinds(tasksA, tasksB) {
  return tasksA.some((a) => tasksB.some((b) =>
    KIND_CONFLICTS.some(([x, y]) => (a.kind === x && b.kind === y) || (a.kind === y && b.kind === x))
  ));
}

/* ══ Fluxo C · Criação de política nova (extensão do Fluxo B) ═════════════
   Só cai aqui quando `matchExistingPolicy` não acha nada. Política nunca
   nasce vazia — sempre com a primeira regra dentro, já vinculada a um
   eventMatch (ou marcada `pendingEventCatalog: true`, se nenhum evento
   bateu). Em produção, `suggestPolicy` e `findSimilarPolicy` são chamadas
   de LLM independentes; o orquestrador é `policyDraftFor`. */
const PROMPT_SUGGEST_POLICY = `
Sugira nome e categoria para uma política nova, a partir da frase do merchant.
A categoria PRECISA ser uma destas 5 — nunca crie uma sexta:
Exceções Operacionais | Pagamento | Logística | Fulfillment | Devolução & Troca

Evento de origem (se houver): \${eventMatch?.label ?? "nenhum identificado"}
Frase do merchant: "\${phrase}"

Responda apenas com JSON:
{
  "categoria": "<uma das 5 acima>",
  "nomePolitica": "<curto, no vocabulário de negócio do merchant, não técnico>"
}
`;

/* Heurística de protótipo: para cada categoria, um punhado de sinônimos.
   Sem eventMatch, escolhemos a categoria com maior sobreposição de tokens
   e usamos a própria frase (truncada) como nome. Em produção, substitua
   por chamada real ao LLM com PROMPT_SUGGEST_POLICY interpolado. */
const CATEGORY_KEYWORDS = {
  payment:     ["pagamento", "cobranca", "estorno", "cartao", "psp", "gateway", "autorizacao", "captura"],
  logistics:   ["transportadora", "coleta", "entrega", "carrier", "tracking", "rastreio", "sla", "prazo"],
  fulfillment: ["separacao", "picking", "packing", "estoque", "cd", "fulfillment", "invoice", "faturamento"],
  returns:     ["devolucao", "troca", "reembolso", "reverso", "return", "refund"],
  exceptions:  ["exceção", "excecao", "erro", "falha", "sistema", "integracao", "avl", "erp"],
};

function suggestPolicy(phrase, eventMatch) {
  if (eventMatch?.proposedPolicy && eventMatch?.proposedCategory) {
    return { categoria: eventMatch.proposedCategory, nomePolitica: eventMatch.proposedPolicy };
  }
  const n = norm(phrase);
  const scored = Object.entries(CATEGORY_KEYWORDS).map(([id, kws]) => {
    let s = 0;
    for (const kw of kws) if (n.includes(norm(kw))) s += 1;
    return { id, score: s };
  }).sort((a, b) => b.score - a.score);
  const categoria = scored[0].score > 0 ? scored[0].id : "exceptions";
  const nomePolitica = phrase.trim().replace(/^./, (c) => c.toUpperCase()).slice(0, 60);
  return { categoria, nomePolitica };
}

const PROMPT_FIND_SIMILAR_POLICY = `
Compare a política que está sendo proposta com as políticas já existentes.
Sinalize sobreposição só se o TEMA de negócio for realmente parecido — categorias
diferentes quase nunca se sobrepõem, mesmo com nomes parecidos.

Política proposta: "\${draft.nomePolitica}" (categoria: \${draft.categoria})

Políticas existentes:
\${allPolicies.map(p => \`- \${p.id} · "\${p.name}" (\${p.category})\`).join("\\n")}

Responda apenas com JSON:
{
  "similarPolicyId": "<id ou null>",
  "reason": "<uma frase curta, só preenchida se similarPolicyId não for null>"
}
`;

/* Heurística determinística: procura política existente na MESMA
   categoria cujo nome compartilhe ≥2 tokens ≥4 chars com o nome proposto.
   Nunca retorna cross-category. Em produção, substitua por LLM. */
function findSimilarPolicy(draft, allPolicies) {
  if (!draft?.nomePolitica || !draft?.categoria) return { similarPolicyId: null, reason: null };
  const proposedTokens = norm(draft.nomePolitica).split(/\s+/).filter((t) => t.length >= 4);
  if (proposedTokens.length === 0) return { similarPolicyId: null, reason: null };
  let best = null;
  for (const p of allPolicies) {
    if (p.category !== draft.categoria) continue;
    const hay = norm(p.name);
    const overlap = proposedTokens.filter((tok) => hay.includes(tok)).length;
    if (overlap >= 2 && (!best || overlap > best.overlap)) {
      best = { policy: p, overlap };
    }
  }
  if (!best) return { similarPolicyId: null, reason: null };
  return {
    similarPolicyId: best.policy.id,
    reason: `mesmo tema de "${best.policy.name}"`,
  };
}

/* ══ Árvore de necessidade — caminho guiado ═══════════════════════════════
   ESTÁTICO — não gerado por LLM. É o grafo fixo de perguntas e opções,
   mesmo shape de `verification.questions` do Canvas A/F. Cada opção aponta
   `next` (mais uma pergunta) ou entrega `eventId` / `existingRuleId` final.
   O caminho guiado por árvore convive com o caminho por frase livre
   (`awaitingEventPhrase`); entra por "Me guia com perguntas" (chip da
   chip-row) e por "Sim, me guia" (fallback de 3 tentativas do
   `handleFreeformRule`). O botão "Nova regra" do canvas e digitar direto
   no composer levam à frase livre. */
const NEED_TREE = {
  start: "n1",
  questions: {
    n1: {
      title: "O que está te incomodando na operação?",
      options: [
        { id: "atraso",       title: "Pedidos demorando ou parados",              next: "n1a" },
        { id: "pagamento",    title: "Pagamento com problema",                    eventId: "order_auth_callback_mutation_error" },
        { id: "cancelamento", title: "Cancelamento não funciona",                 eventId: "cancel_order_mutation_error" },
        { id: "estoque",      title: "Estoque ou separação com erro",             eventId: "details_viewed_pending_alert_stock" },
        { id: "entrega",      title: "Transporte, rastreio ou entrega",           next: "n1e" },
        { id: "sistema",      title: "Sistema fora do ar ou integração falhando", next: "n1f" },
      ],
    },
    n1a: {
      title: "O que você percebe primeiro?",
      options: [
        { id: "prazo",  title: "Prazo de entrega passando",             eventId: "details_viewed_pending_alert_sla" },
        { id: "status", title: "Status parado, sem avançar",            eventId: "change_status_mutation_error" },
        { id: "fila",   title: "Fila de tarefas travando outros pedidos", eventId: "update_task_status_mutation_error" },
      ],
    },
    n1e: {
      title: "O que exatamente?",
      options: [
        { id: "coleta",       title: "Transportadora não retira",              existingRuleId: "LOG-003" },
        { id: "tracking",     title: "Rastreio não bate com a realidade",      eventId: "edit_tracking_data_mutation_error" },
        { id: "confirmacao",  title: "Não sei se realmente chegou no cliente", eventId: "confirm_delivery_mutation_error" },
      ],
    },
    n1f: {
      title: "Onde?",
      options: [
        { id: "geral", title: "O sistema geral trava e bloqueia ações", eventId: "details_viewed_pending_alert_avl_down" },
        { id: "erp",   title: "É especificamente com o ERP",            eventId: "notify_erp_mutation_error" },
      ],
    },
  },
};

/* Prompt de referência: só roda quando o merchant digita em vez de clicar
   numa das opções. Se não bater com nenhuma opção com confiança razoável,
   retornar null — o app repete a pergunta com as opções em destaque,
   nunca adivinha. Versionado como documentação. */
const PROMPT_MATCH_TREE_OPTION = `
O merchant está respondendo uma pergunta de um fluxo guiado, mas digitou em vez
de clicar numa opção. Mapeie o texto livre para a opção mais próxima. Se não bater
com nenhuma com confiança razoável, retorne optionId: null — o app deve então
repetir a pergunta com as opções em destaque, nunca adivinhar.

Pergunta atual: "\${currentNode.title}"
Opções disponíveis:
\${currentNode.options.map(o => \`- \${o.id}: "\${o.title}"\`).join("\\n")}

Resposta digitada pelo merchant: "\${freeTextAnswer}"

Responda apenas com JSON:
{ "optionId": "<um dos ids acima, ou null>" }
`;

/* Heurística determinística do protótipo — casamento exato do título (após
   normalização), ou sobreposição forte de tokens ≥4 chars com título/id.
   Empate ou score baixo → null; o chamador repete a pergunta.
   Em produção, substituir por chamada ao LLM usando PROMPT_MATCH_TREE_OPTION. */
function matchTreeOption(currentNode, freeTextAnswer) {
  const n = norm(freeTextAnswer);
  if (!n) return null;
  const exact = currentNode.options.find((o) => norm(o.title) === n || norm(o.id) === n);
  if (exact) return exact.id;
  const tokens = n.split(/\s+/).filter((t) => t.length >= 4);
  if (tokens.length === 0) return null;
  const scored = currentNode.options.map((o) => {
    const hay = norm(`${o.title} ${o.id}`);
    let s = 0;
    for (const tok of tokens) if (hay.includes(tok)) s += 1;
    return { option: o, score: s };
  }).sort((a, b) => b.score - a.score);
  const top = scored[0];
  const runnerUp = scored[1];
  if (!top || top.score < 1) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.option.id;
}

/* ── View ───────────────────────────────────────────────────────────────── */
function WorkflowPoliciesView({ onBack, initialExpandedPolicyId = null, initiativeAutoCreated = false } = {}) {
  /* Modos do shell (handoff §8). */
  const [chatOpen, setChatOpen] = useState(true);
  const [canvasOpen, setCanvasOpen] = useState(true);
  const [policies, setPolicies] = useState(() => {
    /* Backfill de `sourceEventId` a partir do EVENT_CATALOG: cada evento
       com `existingRuleIds` declara quais regras seed pertencem ao seu
       cluster. É o que permite `runConflictCheck` comparar regras do
       mesmo evento sem depender de um campo que os dados seed ainda não
       carregam. `priority` começa null (nenhuma ordem declarada). */
    const ruleToEvent = {};
    const eventLabelById = {};
    EVENT_CATALOG.forEach((e) => {
      eventLabelById[e.id] = e.label;
      (e.existingRuleIds || []).forEach((rid) => { ruleToEvent[rid] = e.id; });
    });
    /* Upgrade do schema em memória:
       - `conditions`: strings do seed viram `{natural, technical, needsEngineeringInput:false}`;
         drafts ricos já são preservados como estão.
       - `sourceEventLabel`: lookup no EVENT_CATALOG a partir do sourceEventId.
       O schema persistido no seed permanece inalterado; só o estado
       runtime do componente carrega o formato rico. */
    return AIWData.workflowPolicies.map((p) => ({
      ...p,
      rules: p.rules.map((r) => {
        const sourceEventId = r.sourceEventId || ruleToEvent[r.id] || null;
        const richConds = (r.conditions || []).map((c) => (typeof c === "string"
          ? { natural: c, technical: c, needsEngineeringInput: false }
          : { natural: c.natural, technical: c.technical ?? null, needsEngineeringInput: !!c.needsEngineeringInput, param: c.param || null }));
        return {
          ...r,
          conditions: richConds,
          sourceEventId,
          sourceEventLabel: r.sourceEventLabel || (sourceEventId ? eventLabelById[sourceEventId] : null) || null,
          priority: r.priority ?? null,
        };
      }),
    }));
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const [highlightPolicyId, setHighlightPolicyId] = useState(null);

  const [chatMsgs, setChatMsgs] = useState([
    { from: "agent", text: "Oi! Eu cuido das políticas do seu agente de pedido. Pode me pedir direto, do seu jeito — *“quando a transportadora não coletar, aciona ela e avisa o cliente”* — ou, se não tiver certeza do que precisa, eu te ajudo a encontrar isso com algumas perguntas." },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  /* Flag do fluxo "Criar regra a partir de uma frase": quando o agente já
     pediu a frase, a próxima mensagem do operador é encaminhada ao
     matchEvent em vez do parser genérico. */
  const [awaitingEventPhrase, setAwaitingEventPhrase] = useState(false);
  /* Fluxo dos chips "Desejo alterar uma política" / "...verificar quais
     pedidos afetam a política": o agente pergunta qual política, e a
     próxima frase livre é casada pelo NOME contra `policies` (em vez de
     matchEvent, que casa por evento técnico) — "alter" abre a política em
     sanfona; "impact" responde com o que o protótipo sabe de verdade. */
  const [awaitingPolicyName, setAwaitingPolicyName] = useState(null);
  /* Caminho não guiado: conta frases seguidas sem eventMatch (contra os 10
     do EVENT_CATALOG). Zera ao aplicar uma regra ou ao entrar no caminho
     guiado; ao chegar em 3, o agente oferece as perguntas guiadas. */
  const [unmatchedAttempts, setUnmatchedAttempts] = useState(0);
  /* Modo guiado por árvore (NEED_TREE). `guidedNode` é o id do nó atual;
     `answerTrail` é a trilha de perguntas/respostas até aqui, usada para
     montar a recapitulação final ("Como chegamos aqui") e para navegar
     de volta a partir do card final. Coexiste com `awaitingEventPhrase`
     (modo frase livre) — só um dos dois fica ativo por vez. */
  const [guidedNode, setGuidedNode] = useState(null);
  const [answerTrail, setAnswerTrail] = useState([]);
  /* Fluxo de parâmetros da regra (entre o fim da árvore e a recapitulação).
     Só ativa quando o leaf da árvore aponta um eventId — nunca quando
     aponta um existingRuleId direto. Máquina de estado com duas fases
     fixas: `threshold` (opcional, só se o evento tem thresholdParam) e
     `actions` (sempre). `ordered` é a sequência de kinds tocados na
     ordem de execução — o merchant pode remover o último. */
  const [paramFlow, setParamFlow] = useState(null);
  /* { event, trail, phase: "threshold" | "actions", answers, ordered } */
  const composerRef = useRef(null);
  const mode1EngineRef = useRef(null); // roteiro do Modo 1 ativo neste chat, se houver
  const mode1ScriptRef = useRef(null);

  const agentSay = useCallback((msgs) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMsgs((m) => [...m, ...(Array.isArray(msgs) ? msgs : [msgs])]);
    }, 500);
  }, []);

  const selected = useMemo(() => {
    for (const p of policies) {
      const r = p.rules.find((x) => x.id === selectedRuleId);
      if (r) return { rule: r, policy: p };
    }
    return null;
  }, [policies, selectedRuleId]);

  const createRule = (policyId) => {
    const policy = policies.find((p) => p.id === policyId);
    const catPrefix = policy ? categoryOf(policy.category).rulePrefix : "RUL";
    const newId = nextRuleId(catPrefix);
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : {
      ...p,
      rules: [...p.rules, {
        id: newId, name: "Nova regra", active: false,
        trigger: "Descreva quando esta regra deve agir.",
        conditions: [{ natural: "", technical: "", param: { field: "Novo campo", operator: "é igual a", value: "" } }],
        tasks: [{ label: "Nova tarefa", kind: "diagnose" }],
        escalation: [],
      }],
    }));
    return newId;
  };

  /* Exclusão é definitiva — sem lixeira nem desfazer, consistente com o
     resto do protótipo (nada aqui persiste entre reloads mesmo). A
     confirmação de duas etapas mora em PolicyRuleRow, não aqui — esta
     função só executa depois que o gerente já confirmou.
     `deletedRulesRef` guarda uma cópia de toda regra excluída nesta
     sessão (por botão ou por chat) para que um pedido de exclusão por
     chat repetido depois ainda consiga identificar a regra e responder
     de forma idempotente, em vez de "não consegui identificar". */
  const deletedRulesRef = useRef([]);
  /* Sugestão "criar uma iniciativa para acompanhar": aparece toda vez que
     uma política NOVA é criada (Modo 1, Modo 2 ou o card de política nova
     do chat em interação livre) — nunca ao só adicionar uma regra numa
     política existente. `createdInitiativeForPolicyIdsRef` garante que
     aceitar a sugestão duas vezes para a mesma política (ex.: clicando de
     novo num quick reply antigo do histórico) não duplica a iniciativa. */
  const createdInitiativeForPolicyIdsRef = useRef(new Set());
  /* Guarda a QUAL política a última oferta de iniciativa se refere — o
     quick reply "Criar iniciativa para acompanhar" chega como texto puro
     em handleSend, sem contexto próprio, então precisa consultar isto. */
  const awaitingInitiativeForPolicyIdRef = useRef(null);
  const offerInitiative = (policy) => {
    awaitingInitiativeForPolicyIdRef.current = policy.id;
    agentSay({
      from: "agent",
      text: `Quer que eu também crie uma iniciativa para acompanhar a política **${policy.name}** nas próximas semanas?`,
      quickReplies: ["Criar iniciativa para acompanhar", "Não, por enquanto"],
    });
  };

  /* Modo 1 (disparado em #/orders ou #/assistant) e Modo 2 sempre chegam
     nesta tela por navegação com openPolicyId, diferente do "Criar
     política" local em handleSend (já está aqui, oferece a iniciativa
     direto). Roda uma vez, no mount vindo dessa navegação — mesmo padrão
     do scroll em initialExpandedPolicyId, no WorkflowPoliciesCanvas.
     `initiativeAutoCreated` (botão "Criar iniciativa e política" da
     notificação do Modo 2) já criou a iniciativa antes de navegar para cá
     — nesse caso só confirma no chat, em vez de oferecer de novo. */
  useEffect(() => {
    if (!initialExpandedPolicyId) return;
    const policy = policies.find((p) => p.id === initialExpandedPolicyId);
    if (!policy) return;
    if (initiativeAutoCreated) {
      createdInitiativeForPolicyIdsRef.current.add(policy.id);
      agentSay({
        from: "agent",
        text: `Prontinho — criei a política **${policy.name}** e a iniciativa para acompanhá-la. Você encontra a iniciativa em My Initiatives, na área de Iniciativas de Orders e no board de Tasks.`,
      });
      return;
    }
    offerInitiative(policy);
    // eslint-disable-next-line
  }, []);
  const deleteRule = (policyId, ruleId) => {
    setPolicies((ps) => {
      const policy = ps.find((p) => p.id === policyId);
      const rule = policy && policy.rules.find((r) => r.id === ruleId);
      if (rule && !deletedRulesRef.current.some((r) => r.id === ruleId)) {
        deletedRulesRef.current = [...deletedRulesRef.current, rule];
      }
      return ps.map((p) => p.id !== policyId ? p : {
        ...p,
        rules: p.rules.filter((r) => r.id !== ruleId),
      });
    });
  };

  const toggleRule = (policyId, ruleId) => {
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : {
      ...p,
      rules: p.rules.map((r) => r.id !== ruleId ? r : { ...r, active: !r.active }),
    }));
  };

  /* ── Edição de política/regra na própria listagem (acordeão) ───────────
     Mutações genéricas por política/regra — todas operam sobre o mesmo
     `policies` já usado pelo canvas e pelo chat, então uma edição feita
     aqui aparece imediatamente nos dois lugares. */
  const togglePolicyActive = (policyId) => {
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : { ...p, active: !p.active }));
  };

  const updatePolicyObjective = (policyId, objective) => {
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : { ...p, objective }));
  };

  const renameRule = (policyId, ruleId, name) => updateRule(policyId, ruleId, (r) => ({ ...r, name }));

  const updateRule = (policyId, ruleId, updater) => {
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : {
      ...p,
      rules: p.rules.map((r) => r.id !== ruleId ? r : updater(r)),
    }));
  };

  const addCondition = (policyId, ruleId) => updateRule(policyId, ruleId, (r) => ({
    ...r,
    conditions: [...r.conditions, {
      natural: "", technical: "",
      param: { field: "Novo campo", operator: "é igual a", value: "" },
    }],
  }));
  const removeCondition = (policyId, ruleId, index) => updateRule(policyId, ruleId, (r) => ({
    ...r, conditions: r.conditions.filter((_, i) => i !== index),
  }));
  const updateConditionParam = (policyId, ruleId, index, patch) => updateRule(policyId, ruleId, (r) => ({
    ...r,
    conditions: r.conditions.map((c, i) => i !== index ? c : { ...c, param: { ...(c.param || {}), ...patch } }),
  }));

  const addTask = (policyId, ruleId) => updateRule(policyId, ruleId, (r) => ({
    ...r, tasks: [...r.tasks, { label: "Nova tarefa", kind: "diagnose" }],
  }));
  const removeTask = (policyId, ruleId, index) => updateRule(policyId, ruleId, (r) => ({
    ...r, tasks: r.tasks.filter((_, i) => i !== index),
  }));
  const updateTask = (policyId, ruleId, index, patch) => updateRule(policyId, ruleId, (r) => ({
    ...r, tasks: r.tasks.map((t, i) => i !== index ? t : { ...t, ...patch }),
  }));

  const addEscalation = (policyId, ruleId) => updateRule(policyId, ruleId, (r) => ({
    ...r, escalation: [...(r.escalation || []), { field: "Novo campo", operator: "é maior que", value: "" }],
  }));
  const removeEscalation = (policyId, ruleId, index) => updateRule(policyId, ruleId, (r) => ({
    ...r, escalation: (r.escalation || []).filter((_, i) => i !== index),
  }));
  const updateEscalation = (policyId, ruleId, index, patch) => updateRule(policyId, ruleId, (r) => ({
    ...r, escalation: (r.escalation || []).map((e, i) => i !== index ? e : { ...e, ...patch }),
  }));

  /* Numeração da regra nova: próximo livre na família de id da categoria. */
  const nextRuleId = (prefix) => {
    const used = policies.flatMap((p) => p.rules)
      .map((r) => r.id.startsWith(prefix + "-") ? parseInt(r.id.slice(prefix.length + 1), 10) : 0)
      .filter((n) => !isNaN(n));
    const next = Math.max(0, ...used) + 1;
    return `${prefix}-${String(next).padStart(3, "0")}`;
  };

  const applyDraft = (draft) => {
    /* Draft pode chegar de dois caminhos:
       - Frase livre → `draftFor` devolve `policyId` casando com política real.
       - Fluxo do EVENT_CATALOG (needsNewRule) → devolve `policyName` +
         `categoryId`; se não houver política com esse nome, criamos uma
         nova on-the-fly na categoria proposta. */
    let policy;
    if (draft.policyId) {
      policy = policies.find((p) => p.id === draft.policyId) || policies[0];
    } else {
      policy = policies.find((p) => p.name === draft.policyName)
        || { id: `pol-${norm(draft.policyName).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
             category: draft.categoryId, name: draft.policyName, rules: [], _new: true };
    }
    const id = nextRuleId(categoryOf(policy.category).rulePrefix);
    /* Persiste no formato rico do PROMPT_DRAFT_RULE:
       - `conditions`: sempre `{natural, technical, needsEngineeringInput}`,
         mesmo quando o draft veio com strings (RULE_DRAFTS/templates).
       - `tasks`: mantém `target` quando presente (Agente/SAC/Supervisor). */
    const normalizedConditions = draft.conditions.map((c) => (typeof c === "string"
      ? { natural: c, technical: c, needsEngineeringInput: false }
      : { natural: c.natural, technical: c.technical ?? null, needsEngineeringInput: !!c.needsEngineeringInput, param: c.param || null }));
    const normalizedTasks = draft.tasks.map((t) => ({
      label: t.label,
      kind: t.kind,
      ...(t.target ? { target: t.target } : {}),
    }));
    const sourceEventId = draft._forEventId || null;
    const sourceEventLabel = sourceEventId
      ? (EVENT_CATALOG.find((e) => e.id === sourceEventId)?.label || null)
      : null;
    const rule = {
      id,
      name: draft.name,
      trigger: draft.trigger,
      conditions: normalizedConditions,
      tasks: normalizedTasks,
      active: true,
      sourceEventId,
      sourceEventLabel,
      priority: draft.priority ?? null,
      /* Fluxo C: sem evento reconhecido no catálogo → a regra fica
         marcada para triagem posterior; o resto da UI trata igual. */
      pendingEventCatalog: !!draft._pendingEventCatalog,
    };
    setPolicies((ps) => {
      const exists = ps.some((p) => p.id === policy.id);
      if (!exists) return [...ps, { ...policy, rules: [rule] }];
      return ps.map((p) => p.id !== policy.id ? p : { ...p, rules: [...p.rules, rule] });
    });
    /* Filtros voltam ao estado em que a regra nova é visível, senão o scroll
       do canvas cairia numa linha que não está montada. */
    setQuery("");
    setStatus("all");
    setCategory(policy.category);
    setHighlightId(id);
    setSelectedRuleId(id);
    setUnmatchedAttempts(0);
    setGuidedNode(null);
    setAnswerTrail([]);
    agentSay({
      from: "agent",
      text: `Pronto — **${id} · ${rule.name}** entrou na política **${policy.name}** e já está ativa. Vale só para ocorrências novas.`,
      quickReplies: ["Desligar por enquanto", "Criar outra regra"],
    });
    /* Fluxo C (interação livre): só sugere iniciativa quando uma política
       de verdade nasceu agora — adicionar mais uma regra numa política já
       existente (Fluxo A/B) não repete a oferta. */
    if (policy._new) offerInitiative(policy);
  };

  /* ── Prioridade entre regras do mesmo evento ────────────────────────
     `priority` na regra: null = sem ordem declarada (uma só ativa, ou
     "manter as duas"). number = ordem de execução dentro do cluster do
     mesmo `sourceEventId`; menor executa primeiro. As tarefas da regra
     de priority maior que resolvem a mesma causa raiz fecham como
     "Encerrada por cascata" (estado terminal da Tarefa já existente). */
  const setPriority = (ruleId, sourceEventId, value) => {
    setPolicies((ps) => ps.map((p) => ({
      ...p,
      rules: p.rules.map((r) => {
        if (r.id !== ruleId) return r;
        if (sourceEventId && r.sourceEventId !== sourceEventId) return r;
        return { ...r, priority: value };
      }),
    })));
  };

  const rulesSharingEvent = (sourceEventId) =>
    policies.flatMap((p) => p.rules.filter((r) => r.sourceEventId === sourceEventId));

  const reorderCluster = (sourceEventId, orderedRuleIds) => {
    orderedRuleIds.forEach((ruleId, idx) => setPriority(ruleId, sourceEventId, idx + 1));
  };

  /* ── Verificação de conflito ─────────────────────────────────────────
     Roda no momento exato do "Aplicar" final. Se houver regra ativa no
     mesmo `sourceEventId` com kind divergente (KIND_CONFLICTS), mostra
     um card com 4 ramos fixos; senão, prossegue direto com `onProceed`.
     `onProceed` é o callback que efetivamente persiste (applyDraft ou,
     no caso guiado do kind "existing", a ativação da regra existente). */
  const runConflictCheck = (draft, onProceed) => {
    const sourceEventId = draft._forEventId || draft.sourceEventId || null;
    if (!sourceEventId) return onProceed();

    const conflicting = policies
      .flatMap((p) => p.rules.map((r) => ({ ...r, policyName: p.name })))
      .filter((r) => r.active
                  && r.sourceEventId === sourceEventId
                  && r.id !== draft.id
                  && hasDivergentTaskKinds(r.tasks, draft.tasks));

    if (conflicting.length === 0) return onProceed();

    const existing = conflicting[0];
    agentSay({
      from: "agent",
      type: "action",
      title: "Essa regra pode conflitar com outra já ativa",
      heading: `${existing.id} · ${existing.name}`,
      fields: [
        { label: "Política onde já está", value: existing.policyName },
        { label: "O que ela faz hoje", value: existing.tasks.map((t) => t.label).join(" · ") },
        { label: "O que a nova regra faria", value: draft.tasks.map((t) => t.label).join(" · ") },
      ],
      options: [
        { label: "Manter as duas ativas",
          action: () => resolveConflict(draft, existing, "keep-both", onProceed) },
        { label: `Despriorizar ${existing.id}`,
          action: () => resolveConflict(draft, existing, "deprioritize-existing", onProceed) },
        { label: "Repriorizar — a nova assume na frente",
          action: () => resolveConflict(draft, existing, "reprioritize-new-first", onProceed) },
        { label: "Cancelar e ajustar a regra",
          action: () => agentSay({ from: "agent", text: "Ok — ajuste a descrição e me mande de novo, ou revise as tarefas." }) },
      ],
    });
  };

  /* Três ramos fixos, um por opção do card. `onProceed` é o callback que
     persiste (applyDraft). O id da regra nova é previsto por `nextRuleId`
     — que é puro sobre `policies` — antes de chamar onProceed; como o
     setPolicies do applyDraft e os setPolicies do setPriority usam
     updater funcional, os updates encadeiam sem race condition. */
  const resolveConflict = (draft, existing, decision, onProceed) => {
    const eid = existing.sourceEventId;
    if (decision === "keep-both") {
      setPriority(existing.id, eid, null);
      onProceed();
      return;
    }

    const targetPolicy = draft.policyId
      ? policies.find((p) => p.id === draft.policyId)
      : policies.find((p) => p.name === draft.policyName);
    const cat = targetPolicy ? categoryOf(targetPolicy.category) : categoryOf(draft.categoryId);
    const predictedNewId = nextRuleId(cat.rulePrefix);
    const clusterOthers = rulesSharingEvent(eid)
      .filter((r) => r.id !== existing.id && r.id !== predictedNewId)
      .map((r) => r.id);

    onProceed();
    if (decision === "deprioritize-existing") {
      reorderCluster(eid, [predictedNewId, existing.id, ...clusterOthers]);
    } else if (decision === "reprioritize-new-first") {
      reorderCluster(eid, [predictedNewId, ...clusterOthers, existing.id]);
    }
  };

  /* Freeform: `policyMatch` casou com uma regra existente do cluster.
     A regra já está pronta — sem params, sem draft; só ofereço ativar/
     abrir. Passa pelo runConflictCheck se estiver sendo ativada agora
     (mesmo tratamento do modo guiado kind "existing"). */
  const proposeExistingRuleCard = (existingRuleId, eventMatch, viaLLM) => {
    let target = null;
    for (const p of policies) {
      const r = p.rules.find((x) => x.id === existingRuleId);
      if (r) { target = { rule: r, policy: p }; break; }
    }
    if (!target) {
      /* Terminal defensivo: o EVENT_CATALOG aponta pra uma regra que não
         está seedada neste ambiente. Sem review pra oferecer, mas garante
         uma saída — nunca deixa o merchant parado. */
      agentSay({
        from: "agent",
        text: `Detectei o evento **${eventMatch.label}**, mas a regra **${existingRuleId}** não está neste ambiente. Quer descrever de outro jeito?`,
        quickReplies: ["Me guia com perguntas", "Cancelar"],
      });
      return;
    }
    const { rule, policy } = target;
    agentSay({
      from: "agent",
      text: `Entendi como **${eventMatch.label}**. Isso já é coberto por uma regra existente — nada a criar:`,
      poweredByLLM: viaLLM,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Regra existente",
      heading: `Isso já está coberto: ${rule.id}`,
      summary: `${rule.name}, na política ${policy.name}. ${rule.trigger}`,
      fields: [
        { group: "policy", label: "Categoria", value: categoryOf(policy.category).label, categoryId: policy.category },
        { group: "policy", label: "Política",  value: policy.name },
        { group: "policy", label: "Gatilho",   value: rule.trigger },
        { group: "policy", label: "Se",        value: rule.conditions.map((c) => (typeof c === "string" ? c : c.natural)).join(" · ") },
        { group: "policy", label: "Então",     values: rule.tasks.map((t) => t.label) },
      ],
      applyLabel: rule.active ? "Abrir no canvas" : "Ativar e abrir no canvas",
      onApply: () => {
        const proceed = () => {
          if (!rule.active) toggleRule(policy.id, rule.id);
          setCategory(policy.category);
          setStatus("all");
          setQuery("");
          setHighlightId(rule.id);
          setSelectedRuleId(rule.id);
          agentSay({ from: "agent", text: `Abri **${rule.id} · ${rule.name}** no canvas${!rule.active ? " e ativei" : ""}.` });
        };
        if (rule.active) return proceed();
        runConflictCheck(
          { id: rule.id, _forEventId: rule.sourceEventId, tasks: rule.tasks },
          proceed,
        );
      },
      onDismiss: () => agentSay({ from: "agent", text: "Ok — descartado. Se quiser, descreva o evento de outro jeito." }),
    });
  };

  /* Monta o action card de uma proposta de regra vinculada a uma política
     existente (Fluxo B — "variante nova em evento já coberto"). Usa o
     shape 3c da família para ficar consistente com o caminho guiado. */
  const proposeRuleDraftCard = (draft, eventMatch, targetRuleId, viaLLM) => {
    const targetPolicy = policies.find((p) => p.rules.some((r) => r.id === targetRuleId)) || policies[0];
    const condsLine = draft.conditions
      .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
      .join(" · ");
    agentSay({
      from: "agent",
      text: `Entendi como **${eventMatch.label}**. Já existe cobertura próxima em **${targetRuleId}** (política *${targetPolicy.name}*), mas o caso que você descreve tem uma causa raiz diferente. Montei uma regra irmã:`,
      poweredByLLM: viaLLM,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Nova regra",
      heading: draft.name,
      summary: `${draft.name}, na política ${targetPolicy.name}. ${draft.trigger || eventMatch.label}`,
      fields: [
        { group: "policy", label: "Categoria", value: categoryOf(targetPolicy.category).label, categoryId: targetPolicy.category },
        { group: "policy", label: "Política",  value: targetPolicy.name },
        { group: "policy", label: "Gatilho",   value: draft.trigger || eventMatch.label },
        { group: "policy", label: "Se",        value: condsLine },
        { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
      ],
      applyLabel: "Abrir no canvas",
      onApply: () => runConflictCheck(
        { ...draft, policyId: targetPolicy.id },
        () => applyDraft({ ...draft, policyId: targetPolicy.id }),
      ),
    });
  };

  /* Fluxo C — evento sem regra que sirva; a proposta cria política nova
     (ou reaproveita uma já existente pelo nome). Também no shape 3c. */
  const proposePolicyDraftCard = (draft, eventMatch) => {
    const condsLine = draft.conditions
      .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
      .join(" · ");
    const fields = [
      { group: "policy", label: "Categoria", value: categoryOf(draft.categoryId).label, categoryId: draft.categoryId },
      { group: "policy", label: "Política",  value: draft.policyName },
      { group: "policy", label: "Gatilho",   value: draft.trigger || eventMatch.label },
      { group: "policy", label: "Se",        value: condsLine },
      { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
    ];
    /* Warning de política parecida (findSimilarPolicy) vai como um campo
       extra no topo do card — o merchant lê antes de decidir criar. */
    if (draft._similarPolicyWarning) {
      fields.unshift({ group: "policy", label: "Atenção", value: draft._similarPolicyWarning });
    }
    agentSay({
      from: "agent",
      text: `Entendi como **${eventMatch.label}**. Ainda não há regra que cubra esse evento — montei esta proposta:`,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Nova regra",
      heading: draft.name,
      summary: `${draft.name}, na política ${draft.policyName}. ${draft.trigger || eventMatch.label}`,
      fields,
      applyLabel: "Abrir no canvas",
      onApply: () => runConflictCheck(draft, () => applyDraft(draft)),
    });
  };

  /* Caminho não guiado: o operador digita direto na chat, sem passar pelo
     chip. Cada frase é classificada por matchEvent; se falhar 3 vezes
     seguidas, o agente oferece o caminho guiado. Se casar, seguimos para
     matchExistingPolicy (Fluxo B — variante em evento coberto) ou
     policyDraftFor (Fluxo C — nova política). */
  const handleFreeformRule = (phrase) => {
    const eventMatch = matchEvent(phrase);
    if (!eventMatch) {
      const next = unmatchedAttempts + 1;
      setUnmatchedAttempts(next);
      if (next >= 3) {
        agentSay({
          from: "agent",
          text: "Ainda não consegui identificar um evento específico a partir do que você descreveu. Quer que eu te ajude com algumas perguntas?",
          quickReplies: ["Sim, me guia", "Deixa eu tentar de novo", "Cancelar"],
        });
        return;
      }
      agentSay({
        from: "agent",
        text: "Não achei um evento correspondente. Pode descrever de outro jeito — o que o OMS deveria notar, e o que fazer a seguir?",
      });
      return;
    }
    setUnmatchedAttempts(0);

    const ids = eventMatch.existingRuleIds || [];
    /* matchExistingPolicyReal tenta a LLM de verdade primeiro (via
       LLMClient → proxy no agentic-oms) e só cai no heurístico
       determinístico se o proxy não existir ou falhar — por isso é
       sempre uma Promise, mesmo no caminho síncrono (ids.length <= 1). */
    const policyMatch$ = ids.length > 1
      ? matchExistingPolicyReal(phrase, eventMatch, policies)
      : Promise.resolve({ ruleId: ids[0] || null, viaLLM: false });

    policyMatch$.then(({ ruleId: policyMatch, viaLLM }) => {
      if (policyMatch) {
        /* Regra já existe — nada pra perguntar, o conteúdo já está fechado. */
        proposeExistingRuleCard(policyMatch, eventMatch, viaLLM);
        return;
      }

      /* Mesmo ponto de decisão do caminho guiado (resolveTreeLeaf): evento
         sem regra existente que sirva = precisa de parâmetros antes de
         gerar qualquer coisa. Vale para needsNewRule e para variante em
         cluster (matchExistingPolicyReal resolveu null).
         Antes de perguntar, `extractParamsFromPhrase` tenta pré-preencher
         threshold/ações que já estão explícitos na frase — o merchant só
         responde o que faltar. */
      askRuleParameters(eventMatch, (answers) => {
        /* Caminho não guiado: draft leva a phrase original como trigger
           base. Sister (variante em cluster) ou new (needsNewRule /
           cluster sem match) decide o card. */
        const ids2 = eventMatch.existingRuleIds || [];
        if (ids2.length > 0) {
          const anchor = ids2[0];
          proposeRuleDraftCard(draftFor(phrase, eventMatch, answers), eventMatch, anchor, viaLLM);
        } else {
          proposePolicyDraftCard(policyDraftFor(phrase, eventMatch, policies, answers), eventMatch);
        }
      }, extractParamsFromPhrase(phrase, eventMatch));
    });
  };

  /* ── Modo guiado por árvore ───────────────────────────────────────────
     Pergunta corrente é enviada como uma mensagem do agente com
     `quickReplies` = títulos das opções. O clique num quick reply reenvia
     o próprio título como texto do usuário; `handleSend` intercepta pelo
     `guidedNode` e resolve o id. Se o merchant digitar em vez de clicar,
     `matchTreeOption` heurístico tenta mapear; sem confiança → repete a
     pergunta com as opções em destaque, nunca adivinha. */
  const askTreeNode = (nodeId) => {
    const node = NEED_TREE.questions[nodeId];
    if (!node) return;
    agentSay({
      from: "agent",
      text: node.title,
      quickReplies: node.options.map((o) => o.title),
    });
  };

  const startGuidedTree = () => {
    setUnmatchedAttempts(0);
    setAwaitingEventPhrase(false);
    setAnswerTrail([]);
    setGuidedNode(NEED_TREE.start);
    askTreeNode(NEED_TREE.start);
  };

  /* Resolve o desfecho de uma opção terminal — regra existente ativável
     ou evento que puxa um rascunho (via draftFor / policyDraftFor). */
  const resolveGuidedEnd = (option) => {
    if (option.existingRuleId) {
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === option.existingRuleId);
        if (r) return { kind: "existing", rule: r, policy: p };
      }
      return null;
    }
    if (option.eventId) {
      const event = EVENT_CATALOG.find((e) => e.id === option.eventId);
      if (!event) return null;
      const ids = event.existingRuleIds || [];
      if (ids.length > 0) {
        const anchor = ids[0];
        const anchorPolicy = policies.find((p) => p.rules.some((r) => r.id === anchor));
        return {
          kind: "sister",
          event,
          targetRuleId: anchor,
          targetPolicy: anchorPolicy || policies[0],
          draft: draftFor(event.label, event),
        };
      }
      return { kind: "new", event, draft: policyDraftFor(event.label, event, policies) };
    }
    return null;
  };

  /* Recap final da árvore — reaproveita o action card no formato 3c da
     família (Como chegamos aqui). `trail` sai como objeto bruto: pergunta
     como caption, resposta como corpo. `Então` sai como array de strings,
     uma ação por linha. `renderResolvedSummary` recebe o `resolved` pronto
     (usado pelo Fluxo de parâmetros após askRuleParameters); ao clicar em
     "Editar regra" volta ao nó anterior da árvore. */
  const renderResolvedSummary = (trail, resolved) => {
    if (!resolved) {
      agentSay({ from: "agent", text: "Não consegui resolver essa combinação — pode tentar de novo?" });
      return;
    }
    const previousNodeId = trail.length > 1 ? trail[trail.length - 2].nodeId : NEED_TREE.start;
    const onEdit = () => {
      /* Reabre a árvore no nó anterior — trilha volta um passo. Reaproveita
         o antigo onBack (reopenDraft no spec) para o botão "Editar regra". */
      const newTrail = trail.slice(0, -1);
      setAnswerTrail(newTrail);
      setGuidedNode(previousNodeId);
      askTreeNode(previousNodeId);
    };

    if (resolved.kind === "existing") {
      const { rule, policy } = resolved;
      agentSay({
        from: "agent",
        text: "Cheguei numa cobertura que já existe. Quer ativá-la?",
        type: "action",
        title: "Como chegamos aqui",
        badge: "Regra existente",
        heading: `Isso já está coberto: ${rule.id}`,
        summary: `${rule.name}, na política ${policy.name}. ${rule.trigger}`,
        trail,
        fields: [
          { group: "policy", label: "Categoria", value: categoryOf(policy.category).label, categoryId: policy.category },
          { group: "policy", label: "Política",  value: policy.name },
          { group: "policy", label: "Gatilho",   value: rule.trigger },
          { group: "policy", label: "Se",        value: rule.conditions.map((c) => (typeof c === "string" ? c : c.natural)).join(" · ") },
          { group: "policy", label: "Então",     values: rule.tasks.map((t) => t.label) },
        ],
        applyLabel: rule.active ? "Abrir no canvas" : "Ativar e abrir no canvas",
        onApply: () => {
          const proceed = () => {
            if (!rule.active) toggleRule(policy.id, rule.id);
            setCategory(policy.category);
            setStatus("all");
            setQuery("");
            setHighlightId(rule.id);
            setSelectedRuleId(rule.id);
            setGuidedNode(null);
            setAnswerTrail([]);
            agentSay({ from: "agent", text: `Abri **${rule.id} · ${rule.name}** no canvas${!rule.active ? " e ativei" : ""}.` });
          };
          /* Se a regra já está ativa, é só abrir — sem chance nova de
             conflito. Se está sendo ativada agora, o check compara suas
             tarefas contra as demais regras ativas do mesmo evento. */
          if (rule.active) return proceed();
          runConflictCheck(
            { id: rule.id, _forEventId: rule.sourceEventId, tasks: rule.tasks },
            proceed,
          );
        },
        /* Regra existente não tem rascunho pra editar — botão não renderiza. */
        onEdit: null,
      });
      return;
    }

    if (resolved.kind === "sister") {
      const { event, targetPolicy, targetRuleId, draft } = resolved;
      const condsLine = draft.conditions
        .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
        .join(" · ");
      agentSay({
        from: "agent",
        text: `Cheguei em **${event.label}**. Já existe cobertura próxima em **${targetRuleId}** — proponho uma regra irmã:`,
        type: "action",
        title: "Como chegamos aqui",
        badge: "Nova regra",
        heading: draft.name,
        summary: `${draft.name}, na política ${targetPolicy.name}. ${draft.trigger || event.label}`,
        trail,
        fields: [
          { group: "policy", label: "Categoria", value: categoryOf(targetPolicy.category).label, categoryId: targetPolicy.category },
          { group: "policy", label: "Política",  value: targetPolicy.name },
          { group: "policy", label: "Gatilho",   value: draft.trigger || event.label },
          { group: "policy", label: "Se",        value: condsLine },
          { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
        ],
        applyLabel: "Abrir no canvas",
        onApply: () => {
          const merged = { ...draft, policyId: targetPolicy.id };
          runConflictCheck(merged, () => {
            applyDraft(merged);
            setGuidedNode(null);
            setAnswerTrail([]);
          });
        },
        onEdit,
      });
      return;
    }

    // kind === "new"
    const { event, draft } = resolved;
    const condsLine = draft.conditions
      .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
      .join(" · ");
    const newFields = [
      { group: "policy", label: "Categoria", value: categoryOf(draft.categoryId).label, categoryId: draft.categoryId },
      { group: "policy", label: "Política",  value: draft.policyName },
      { group: "policy", label: "Gatilho",   value: draft.trigger || event.label },
      { group: "policy", label: "Se",        value: condsLine },
      { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
    ];
    if (draft._similarPolicyWarning) {
      newFields.splice(1, 0, { group: "policy", label: "Atenção", value: draft._similarPolicyWarning });
    }
    agentSay({
      from: "agent",
      text: `Cheguei em **${event.label}**. Ainda não há regra que cubra esse evento — proposta abaixo:`,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Nova regra",
      heading: draft.name,
      summary: `${draft.name}, na política ${draft.policyName}. ${draft.trigger || event.label}`,
      trail,
      fields: newFields,
      applyLabel: "Abrir no canvas",
      onApply: () => runConflictCheck(draft, () => {
        applyDraft(draft);
        setGuidedNode(null);
        setAnswerTrail([]);
      }),
      onEdit,
    });
  };

  /* ── Fluxo de parâmetros da regra (entre a árvore e a recap) ──────────
     Só roda quando o nó final é um eventId. Antes deste fluxo, `draftFor`
     inventava threshold e ações sem confirmar — agora o merchant escolhe
     os dois antes da LLM (ou do stub determinístico) escrever a regra. */
  const askThresholdQuestion = (event) => {
    const tp = event.thresholdParam;
    /* Sem quickReplies: o thresholdParam do spec só carrega prompt+unit,
       o merchant digita livre ("4h", "30 min", "3 tentativas"). O parser
       determinístico (parseThreshold) valida o formato. */
    agentSay({
      from: "agent",
      text: tp.prompt,
    });
  };

  const askActionsQuestion = (event, ordered) => {
    const remaining = event.suggestedActions.filter((k) => !ordered.includes(k));
    const orderedLine = ordered.length
      ? "Ordem atual: " + ordered.map((k, i) => `${i + 1}. ${kindOf(k).label}`).join(" → ")
      : "Ainda sem nenhuma ação — comece pela primeira.";
    const controls = [
      ...(ordered.length > 0 ? ["Concluir"] : []),
      ...(ordered.length > 0 ? ["Remover última"] : []),
    ];
    agentSay({
      from: "agent",
      text: `${orderedLine}\n\nO que você quer que o agente faça quando isso acontecer? Toque na ordem em que devem rodar.`,
      quickReplies: [
        ...remaining.map((k) => kindOf(k).label),
        ...controls,
      ],
    });
  };

  /* `onComplete(answers)` é o desfecho — o caller decide o que fazer
     com { threshold, chosenActions }. `prefilled` traz o que já foi
     respondido implicitamente (ex.: extractParamsFromPhrase no freeform).
     Guardas do spec:
       `answers.threshold || !eventMatch.thresholdParam` → não pergunta.
       `answers.chosenActions` → não pergunta. */
  const askRuleParameters = (event, onComplete, prefilled = {}) => {
    const hasThreshold = !!event.thresholdParam;
    const hasActions = !!(event.suggestedActions && event.suggestedActions.length);
    const preThreshold = prefilled.threshold || null;
    const preActions = prefilled.chosenActions && prefilled.chosenActions.length
      ? prefilled.chosenActions
      : null;

    const needThreshold = hasThreshold && !preThreshold;
    const needActions = hasActions && !preActions;

    if (!needThreshold && !needActions) {
      const answers = {};
      if (preThreshold) answers.threshold = preThreshold;
      if (preActions) answers.chosenActions = preActions;
      onComplete(answers);
      return;
    }

    /* Se só falta o threshold (actions extraídas), guardamos as ações
       pré-preenchidas em `ordered` e marcamos `skipActionsWhenDone`
       para invocar `onComplete` assim que o threshold chegar. */
    const startPhase = needThreshold ? "threshold" : "actions";
    const initialAnswers = preThreshold ? { threshold: preThreshold } : {};
    const initialOrdered = !needActions ? preActions : [];
    setParamFlow({
      event, onComplete, phase: startPhase,
      answers: initialAnswers,
      ordered: initialOrdered,
      skipActionsWhenDone: needThreshold && !needActions,
    });
    if (needThreshold) askThresholdQuestion(event);
    else askActionsQuestion(event, initialOrdered);
  };

  /* Dispatcher do leaf da árvore — três caminhos:
     - `existingRuleId` (pointer direto na árvore) → recap direto, kind
       "existing".
     - `eventId` com `existingRuleIds` no catálogo → a regra já está
       pronta no cluster: reaproveita a primeira, sem passar por
       parâmetros. Kind "existing".
     - `eventId` com `needsNewRule` → coleta threshold + ações antes de
       montar o draft (Fluxo de parâmetros). */
  const resolveTreeLeaf = (leaf, trail) => {
    if (leaf.existingRuleId) {
      renderResolvedSummary(trail, resolveGuidedEnd(leaf));
      return;
    }
    if (leaf.eventId) {
      const event = EVENT_CATALOG.find((e) => e.id === leaf.eventId);
      if (!event) {
        /* Terminal defensivo: o leaf da árvore apontou pra um eventId que
           não existe mais no catálogo. Oferece os dois caminhos de recuperação
           conhecidos para que o merchant nunca fique parado. */
        agentSay({
          from: "agent",
          text: "Não consegui encontrar esse evento no catálogo atual — vamos por outro caminho?",
          quickReplies: ["Me guia com perguntas", "Cancelar"],
        });
        return;
      }
      const ids = event.existingRuleIds || [];
      if (ids.length > 0) {
        renderResolvedSummary(trail, resolveGuidedEnd({ existingRuleId: ids[0] }));
        return;
      }
      askRuleParameters(event, (answers) => {
        /* No caminho guiado, o desfecho é a recap com trilha. Se o
           evento tem existingRuleIds (dead branch pelo resolveTreeLeaf
           atual, mantido para segurança), monta sister; senão, new. */
        const ids = event.existingRuleIds || [];
        let resolved;
        if (ids.length > 0) {
          const anchor = ids[0];
          const anchorPolicy = policies.find((p) => p.rules.some((r) => r.id === anchor));
          resolved = {
            kind: "sister", event, targetRuleId: anchor,
            targetPolicy: anchorPolicy || policies[0],
            draft: draftFor(null, event, answers),
          };
        } else {
          resolved = { kind: "new", event, draft: policyDraftFor(null, event, policies, answers) };
        }
        renderResolvedSummary(trail, resolved);
      });
    }
  };

  /* Recebe o id resolvido de uma opção (via clique ou match heurístico),
     avança na árvore ou dispara o fluxo de parâmetros / recap final. */
  const advanceTree = (optionId) => {
    const node = NEED_TREE.questions[guidedNode];
    if (!node) return;
    const option = node.options.find((o) => o.id === optionId);
    if (!option) return;
    const newTrail = [...answerTrail, { nodeId: guidedNode, question: node.title, answer: option.title, optionId }];
    setAnswerTrail(newTrail);
    if (option.next) {
      setGuidedNode(option.next);
      askTreeNode(option.next);
    } else {
      setGuidedNode(null);
      resolveTreeLeaf(option, newTrail);
    }
  };

  const handleSend = (text) => {
    const raw = text.trim();
    if (!raw) return;
    setChatMsgs((m) => [...m, { from: "user", text: raw }]);
    const n = norm(raw);

    /* "Cancelar" tem que funcionar em qualquer modo — sai antes do
       intercept da árvore ou de qualquer outro handler. */
    if (/^cancelar$/i.test(raw)) {
      setUnmatchedAttempts(0);
      setAwaitingEventPhrase(false);
      setAwaitingPolicyName(null);
      setGuidedNode(null);
      setAnswerTrail([]);
      setParamFlow(null);
      agentSay({ from: "agent", text: "Cancelado. Quando quiser voltar, é só me chamar." });
      return;
    }

    /* "Criar política" — botão do turno final do Modo 1: como já estamos
       na tela de políticas, só precisa entrar no estado local e abrir —
       sem navegação. */
    if (raw === "Criar política" && mode1ScriptRef.current) {
      const newPolicy = Mode1ToPolicy.createFromScript(mode1ScriptRef.current);
      AIWData.workflowPolicies.push(newPolicy);
      setPolicies((ps) => [...ps, { ...newPolicy, rules: newPolicy.rules.map((r) => ({ ...r, sourceEventId: null, sourceEventLabel: null, priority: null })) }]);
      setHighlightPolicyId(newPolicy.id);
      agentSay({ from: "agent", text: `Prontinho — criei a política **${newPolicy.name}**. Já abri ela ali na listagem.` });
      offerInitiative(newPolicy);
      return;
    }

    /* "Criar iniciativa para acompanhar" — sugerido logo depois de toda
       política nova (aqui mesmo ou navegado de Modo 1/Modo 2 noutra tela,
       ver o useEffect de initialExpandedPolicyId em WorkflowPoliciesView).
       Idempotente: aceitar de novo um quick reply antigo do histórico só
       informa que já existe, não duplica a iniciativa. */
    if (raw === "Criar iniciativa para acompanhar") {
      const policyId = awaitingInitiativeForPolicyIdRef.current;
      const policy = policyId && policies.find((p) => p.id === policyId);
      if (!policy) {
        agentSay({ from: "agent", text: "Não encontrei mais a política para essa iniciativa — ela pode já ter sido removida." });
        return;
      }
      if (createdInitiativeForPolicyIdsRef.current.has(policyId)) {
        agentSay({ from: "agent", text: `Já existe uma iniciativa acompanhando a política **${policy.name}** — nada a fazer.` });
        return;
      }
      const { initiative, tasks: initiativeTasks } = InitiativeFromPolicy.createFromPolicy(policy);
      createdInitiativeForPolicyIdsRef.current.add(policyId);
      agentSay({
        from: "agent",
        text: `Pronto — criei a iniciativa **${initiative.title}** (${initiative.id.replace(/^TA-/, "")}), com ${initiativeTasks.length} tarefa(s) em "Em aberto". Você encontra ela em My Initiatives, na área de Iniciativas de Orders e no board de Tasks.`,
      });
      return;
    }
    if (raw === "Não, por enquanto") {
      agentSay({ from: "agent", text: "Combinado — sem iniciativa por enquanto." });
      return;
    }

    /* Roteiro do Modo 1 já em andamento neste chat: a mensagem real do
       gerente só marca "pode continuar" — o motor responde um turno e
       espera de novo, nunca toca o roteiro inteiro de uma vez. */
    if (mode1EngineRef.current) {
      mode1EngineRef.current.send();
      return;
    }

    /* Pedido de exclusão de regra por frase livre: testado contra TODA
       mensagem que chegar até aqui (nenhum outro fluxo mais específico
       já consumiu o texto acima). A LLM decide se é um pedido de
       exclusão e qual regra — sem confirmação extra no chat (o gerente
       já pediu explicitamente), mas checando de novo se a regra ainda
       existe no momento de executar: perguntar a mesma exclusão duas
       vezes deve ser idempotente, nunca um erro. */
    const allRules = policies.flatMap((p) => p.rules);
    classifyDeleteIntentReal(raw, allRules, deletedRulesRef.current).then(({ isDeleteRequest, ruleId, viaLLM }) => {
      if (!isDeleteRequest) return false;
      if (!ruleId) {
        agentSay({ from: "agent", text: "Entendi que você quer excluir uma regra, mas não consegui identificar qual — pode dizer o nome ou o comportamento dela?", poweredByLLM: viaLLM });
        return true;
      }
      const stillExists = policies.some((p) => p.rules.some((r) => r.id === ruleId));
      const target = allRules.find((r) => r.id === ruleId) || deletedRulesRef.current.find((r) => r.id === ruleId);
      if (!stillExists) {
        agentSay({ from: "agent", text: `A regra **${target ? target.name : ruleId}** já tinha sido excluída antes — nada a fazer.`, poweredByLLM: viaLLM });
        return true;
      }
      const targetPolicy = policies.find((p) => p.rules.some((r) => r.id === ruleId));
      deleteRule(targetPolicy.id, ruleId);
      agentSay({ from: "agent", text: `Pronto — excluí a regra **${target.name}** (${ruleId}).`, poweredByLLM: viaLLM });
      return true;
    }).then((handled) => {
      if (handled) return;
      /* Não era pedido de exclusão: segue o roteamento normal a partir
         daqui, como se essa checagem nunca tivesse existido. */
      routeAfterDeleteCheck(raw, n);
    });
    return;
  };

  /* Continuação de handleSend depois da checagem de exclusão (sempre
     assíncrona, mesmo no caminho heurístico) — precisa ser uma função à
     parte porque o restante do roteamento síncrono original não pode
     ficar dentro do .then() acima sem duplicar todo o corpo. */
  const routeAfterDeleteCheck = (raw, n) => {
    /* Modo 1 (Product Briefing "Criação de Políticas com Agente"): o
       gerente pode descrever um cenário de política em qualquer chat do
       agente, não só aqui — mas aqui também vale, é justamente onde
       políticas se criam. */
    if (Mode1Trigger.matches(raw)) {
      Mode1Launcher.launch(
        (msg) => setChatMsgs((m) => [...m, msg]),
        setIsTyping,
      ).then((result) => {
        if (!result) return;
        mode1EngineRef.current = result.engine;
        mode1ScriptRef.current = result.script;
      });
      return;
    }

    /* Chips "Desejo alterar uma política" / "...verificar quais pedidos
       afetam a política": a frase livre é casada pelo NOME da política
       (substring nos dois sentidos, tolera "detecção de risco" batendo
       em "Detecção de Risco & SLA"), não por evento técnico. */
    if (awaitingPolicyName) {
      const mode = awaitingPolicyName;
      setAwaitingPolicyName(null);
      const target = policies.find((p) => norm(p.name).includes(n) || n.includes(norm(p.name)));
      if (!target) {
        agentSay({
          from: "agent",
          text: `Não achei nenhuma política com esse nome. As políticas cadastradas são:\n${policies.map((p) => `**${p.name}**`).join("\n")}`,
        });
        return;
      }
      if (mode === "alter") {
        setHighlightPolicyId(target.id);
        agentSay({ from: "agent", text: `Abri **${target.name}** para você editar.` });
        return;
      }
      const activeCount = target.rules.filter((r) => r.active).length;
      setHighlightPolicyId(target.id);
      agentSay({
        from: "agent",
        text: `**${target.name}** tem ${plural(target.rules.length, "regra", "regras")}, ${plural(activeCount, "ativa", "ativas")}. Este protótipo ainda não vincula regras de política direto a uma lista de pedidos — esse cruzamento aparece hoje nas Iniciativas, quando um padrão já foi detectado num grupo de pedidos.`,
      });
      return;
    }

    /* Fluxo de parâmetros ativo: intercepta antes da árvore. Fase
       "threshold" espera formato duration/count; fase "actions" espera
       clique num kind, "Concluir" ou "Remover última". */
    if (paramFlow) {
      const flow = paramFlow;
      const event = flow.event;

      if (flow.phase === "threshold") {
        const parsed = parseThreshold(raw, event.thresholdParam);
        if (!parsed) {
          const example = event.thresholdParam.unit === "count"
            ? "um número, por exemplo 3"
            : "um período, por exemplo 4h, 30 min ou 2d";
          agentSay({
            from: "agent",
            text: `Não entendi o valor. Preciso de ${example}.`,
          });
          return;
        }
        const answers = { ...flow.answers, threshold: parsed };
        /* Se as ações já vieram pré-preenchidas do extractor, encerramos
           aqui — não perguntamos duas vezes o que o merchant já disse. */
        if (flow.skipActionsWhenDone) {
          setParamFlow(null);
          flow.onComplete({ ...answers, chosenActions: flow.ordered });
          return;
        }
        setParamFlow({ ...flow, phase: "actions", answers });
        askActionsQuestion(event, flow.ordered);
        return;
      }

      if (flow.phase === "actions") {
        if (/^concluir$/i.test(raw)) {
          if (flow.ordered.length === 0) {
            askActionsQuestion(event, flow.ordered);
            return;
          }
          const answers = { ...flow.answers, chosenActions: flow.ordered };
          setParamFlow(null);
          flow.onComplete(answers);
          return;
        }
        if (/^remover última$/i.test(raw) || /^remover ultima$/i.test(raw)) {
          const newOrdered = flow.ordered.slice(0, -1);
          setParamFlow({ ...flow, ordered: newOrdered });
          askActionsQuestion(event, newOrdered);
          return;
        }
        /* Match do label do kind (case-insensitive, sem acento). */
        const matchedKind = event.suggestedActions.find((k) => norm(kindOf(k).label) === norm(raw));
        if (!matchedKind) {
          agentSay({
            from: "agent",
            text: "Não achei essa ação na lista sugerida. Toque em uma das opções abaixo.",
            quickReplies: [
              ...event.suggestedActions.filter((k) => !flow.ordered.includes(k)).map((k) => kindOf(k).label),
              ...(flow.ordered.length > 0 ? ["Concluir", "Remover última"] : []),
            ],
          });
          return;
        }
        if (flow.ordered.includes(matchedKind)) {
          askActionsQuestion(event, flow.ordered);
          return;
        }
        const newOrdered = [...flow.ordered, matchedKind];
        setParamFlow({ ...flow, ordered: newOrdered });
        askActionsQuestion(event, newOrdered);
        return;
      }
    }

    /* Modo guiado por árvore ativo: intercepta ANTES de qualquer outro
       roteamento. Título exato (via quick reply) → id direto; texto livre
       → matchTreeOption. Sem confiança → repete a pergunta. */
    if (guidedNode) {
      const node = NEED_TREE.questions[guidedNode];
      if (node) {
        const exact = node.options.find((o) => o.title === raw || norm(o.title) === n);
        const optionId = exact ? exact.id : matchTreeOption(node, raw);
        if (optionId) {
          advanceTree(optionId);
        } else {
          agentSay({
            from: "agent",
            text: "Não tenho certeza de qual opção você quis dizer. Pode escolher uma?",
            quickReplies: node.options.map((o) => o.title),
          });
        }
        return;
      }
    }

    /* Quick reply "Abrir <RULE-ID>" gerada pelo ramo 1 → seleciona a regra
       no canvas (o drawer abre automaticamente via `selected`). */
    const openMatch = raw.match(/^abrir\s+([A-Z]+-\d+)/i);
    if (openMatch) {
      const rid = openMatch[1].toUpperCase();
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === rid);
        if (r) {
          setCategory(p.category);
          setStatus("all");
          setQuery("");
          setHighlightId(rid);
          setSelectedRuleId(rid);
          agentSay({ from: "agent", text: `Abri **${r.id} · ${r.name}** no canvas.` });
          return;
        }
      }
    }

    /* Quick replies do fallback "3 tentativas sem match" e chip da
       chip-row entram no caminho guiado (NEED_TREE). "Sim, me guia" vem
       do fallback; "Me guia com perguntas" vem do chip persistente. */
    if (/^sim,?\s*me guia|me guia com perguntas|me ajuda a encontrar/i.test(raw)) {
      startGuidedTree();
      return;
    }
    if (/deixa eu tentar de novo/i.test(raw)) {
      setUnmatchedAttempts(0);
      agentSay({ from: "agent", text: "Ok — descreva de outro jeito, sem pressa. O que o OMS deveria notar, e o que fazer a seguir?" });
      return;
    }
    if (/regra a partir de uma frase|criar outra regra|nova regra|desejo criar uma politica/.test(n)) {
      setUnmatchedAttempts(0);
      setAwaitingEventPhrase(true);
      agentSay({ from: "agent", text: "Descreva o evento em uma frase — o que o OMS precisa detectar e o que deve acontecer em seguida." });
      return;
    }
    if (/desejo alterar uma politica/.test(n)) {
      setAwaitingPolicyName("alter");
      agentSay({ from: "agent", text: "Qual política você quer alterar? Pode escrever o nome completo ou só uma parte." });
      return;
    }
    if (/desejo verificar quais pedidos afetam a politica/.test(n)) {
      setAwaitingPolicyName("impact");
      agentSay({ from: "agent", text: "De qual política você quer ver os pedidos afetados?" });
      return;
    }

    /* Fluxo "policy-new-rule" ativo (entrada pelo bot\u00e3o "Nova regra"
       do canvas ou pelo gatilho "criar outra regra" no chat): a frase
       segue exatamente o mesmo pipeline do caminho por frase livre.
       Isso garante que todo terminal chega num card de review 3c com
       `runConflictCheck` \u2014 nada de handlers legados divergindo aqui. */
    if (awaitingEventPhrase) {
      setAwaitingEventPhrase(false);
      handleFreeformRule(raw);
      return;
    }

    if (/desligadas|desligar por enquanto/.test(n)) {
      if (/desligar por enquanto/.test(n) && selectedRuleId && selected) {
        toggleRule(selected.policy.id, selected.rule.id);
        agentSay({ from: "agent", text: `**${selected.rule.id}** foi desligada. As ocorrências que já estavam em curso seguem no fluxo antigo.` });
        return;
      }
      const off = policies.flatMap((p) => p.rules.filter((r) => !r.active).map((r) => `**${r.id}** · ${r.name} (${p.name})`));
      setStatus("off");
      agentSay({
        from: "agent",
        text: off.length
          ? `Há ${plural(off.length, "regra desligada", "regras desligadas")}:\n${off.join("\n")}\n\nJá filtrei o canvas por "Desligadas".`
          : "Nenhuma regra desligada no momento — todas as políticas estão valendo.",
      });
      return;
    }

    if (/como as politicas se organizam|taxonomia|organizam/.test(n)) {
      const summary = AIWData.policyCategories
        .map((c) => `**${c.label}** — ${plural(policies.filter((p) => p.category === c.id).length, "política", "políticas")}`)
        .join("\n");
      agentSay({
        from: "agent",
        text: `As regras vivem dentro de políticas, e cada política pertence a uma categoria:\n${summary}\n\nUma regra nova entra na política que corresponde ao evento descrito.`,
      });
      return;
    }

    if (/pedidos antigos|retroativ/.test(n)) {
      agentSay({
        from: "agent",
        text: "Não. Ligar uma regra vale só para ocorrências detectadas a partir daquele momento — pedidos que já estavam em curso seguem com o comportamento anterior até fecharem.",
      });
      return;
    }

    /* Sem intent conhecido: caminho não guiado. A frase é classificada
       contra o EVENT_CATALOG; o contador de tentativas sem match decide
       se seguimos tentando ou oferecemos as perguntas guiadas. */
    handleFreeformRule(raw);
  };

  /* "Nova regra" no canvas e o chip da chip-row levam ao mesmo fluxo: o
     assistente pede a frase e o foco vai para o composer. */
  const startNewRule = () => {
    setUnmatchedAttempts(0);
    setAwaitingEventPhrase(true);
    agentSay({ from: "agent", text: "Descreva o evento em uma frase — eu monto a regra e você revisa antes de criar." });
    composerRef.current?.append?.("");
  };

  return (
    <React.Fragment>
      <ResizableSplit screenLabel="Políticas do Workflow" initialWidth={400} chatOpen={chatOpen} canvasOpen={canvasOpen}>
        <ChatPanel
          title="Assistente de políticas"
          chips={POLICY_CHIPS}
          alwaysShowChips
          messages={chatMsgs}
          onSend={handleSend}
          isTyping={isTyping}
          placeholder="Descreva o evento em uma frase…"
          composerRef={composerRef}
          canvasOpen={canvasOpen}
          onOpenCanvas={() => setCanvasOpen(true)}
        />
        <WorkflowPoliciesCanvas
          policies={policies}
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          status={status}
          onStatus={setStatus}
          selectedRuleId={selectedRuleId}
          onSelectRule={(id) => { setHighlightId(null); setSelectedRuleId(id); }}
          highlightId={highlightId}
          highlightPolicyId={highlightPolicyId}
          initialExpandedPolicyId={initialExpandedPolicyId}
          onNewRule={startNewRule}
          onTogglePolicyActive={togglePolicyActive}
          onEditObjective={updatePolicyObjective}
          onToggleRule={toggleRule}
          onRenameRule={renameRule}
          onCreateRule={createRule}
          onDeleteRule={deleteRule}
          onAddCondition={addCondition}
          onRemoveCondition={removeCondition}
          onUpdateCondition={updateConditionParam}
          onAddTask={addTask}
          onRemoveTask={removeTask}
          onUpdateTask={updateTask}
          onAddEscalation={addEscalation}
          onRemoveEscalation={removeEscalation}
          onUpdateEscalation={updateEscalation}
          onBack={onBack}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen(o => !o)}
          onCloseCanvas={() => { setChatOpen(true); setCanvasOpen(false); }}
        />
      </ResizableSplit>

      {selected && (
        <PolicyRuleDrawer
          rule={selected.rule}
          policy={selected.policy}
          onToggle={toggleRule}
          onClose={() => setSelectedRuleId(null)}
        />
      )}
    </React.Fragment>
  );
}

window.WorkflowPoliciesView = WorkflowPoliciesView;
