/* global React, ReactDOM, Icon, AIWData, ChatPanel, ResizableSplit, Toggle, Dropdown, IconButton */
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
function PolicyCategoryTag({ categoryId }) {
  const cat = categoryOf(categoryId);
  return (
    <span className="wfp-cat-tag" style={{ background: cat.color }}>
      {cat.icon} {cat.label}
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

  const groups = kindsOf(rule).map((kindId) => ({
    kind: kindOf(kindId),
    tasks: rule.tasks.filter((t) => t.kind === kindId),
  }));

  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label={rule.name}>
        <div className="stage-config-modal-head">
          <IconButton icon={<Icon name="arrow-left" size={18} />} label="Voltar" variant="tertiary" onClick={onClose} />
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

          <div className="wfp-drawer-status">
            <span className="setting-row-desc">{rule.active ? "Ativa" : "Desligada"}</span>
            <Toggle on={rule.active} onChange={() => onToggle(policy.id, rule.id)} />
          </div>

          <p className="detail-desc wfp-drawer-trigger">{rule.trigger}</p>

          <div className="wfp-drawer-block">
            <span className="wfp-block-label">Se — condições</span>
            <div className="wfp-cond-list">
              {rule.conditions.map((c, i) => <code key={i} className="wfp-cond">{c}</code>)}
            </div>
          </div>

          <div className="wfp-drawer-block">
            <span className="wfp-block-label">Então — tarefas atribuídas</span>
            {groups.map((g) => (
              <div key={g.kind.id} className="wfp-kind-group">
                <div className="wfp-kind-head">
                  <span className="wfp-dot wfp-dot--lg" style={{ background: g.kind.dot }} />
                  <span className="wfp-kind-label">{g.kind.label}</span>
                </div>
                <div className="wfp-task-chips">
                  {g.tasks.map((t, i) => <PolicyTaskChip key={i} task={t} />)}
                </div>
              </div>
            ))}
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
  onToggleRule, selectedRuleId, onSelectRule, highlightId, onNewRule,
}) {
  const rowRefs = useRef({});

  /* Regra recém-criada pelo chat: o canvas rola até ela e o card fica em
     destaque enquanto o drawer correspondente abre. */
  useEffect(() => {
    if (!highlightId) return;
    const el = rowRefs.current[highlightId];
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId]);

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
      <div className="detail-head canvas-topbar" data-sl-canvas-tool-topbar="">
        <span className="canvas-topbar-title">Políticas de pedido</span>
        <div className="detail-head-right">
          <button data-sl-button data-variant="primary" data-has-label onClick={onNewRule}>
            <Icon name="plus" size={16} />
            Nova regra
          </button>
        </div>
      </div>

      <div className="wfp-toolbar">
        <div data-sl-module-browser-search="" className="wfp-search">
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
              <span className="filter-dropdown-chevron"><Icon name="chevron-down" size={12} /></span>
            </button>
          }
        >
          {[{ id: "all", label: "Todas as categorias" }].concat(
            AIWData.policyCategories.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` }))
          ).map((opt) => (
            <button key={opt.id} className="dd-item wfp-cat-option" onClick={() => onCategory(opt.id)}>
              <span className="wfp-cat-check">
                {category === opt.id && <Icon name="check" size={14} />}
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
              <span className="filter-dropdown-chevron"><Icon name="chevron-down" size={12} /></span>
            </button>
          }
        >
          {statusOptions.map((opt) => (
            <button key={opt.id} className="dd-item wfp-cat-option" onClick={() => onStatus(opt.id)}>
              <span className="wfp-cat-check">
                {status === opt.id && <Icon name="check" size={14} />}
              </span>
              <span className="dd-item-label wfp-cat-option-label">{opt.label}</span>
            </button>
          ))}
        </Dropdown>
      </div>

      <div className="detail-scroll wfp-scroll">
        <div className="wfp-list">
          {groups.map(({ policy, rules }) => {
            const active = rules.filter((r) => r.active).length;
            return (
              <section key={policy.id} className="wfp-card">
                <header className="wfp-card-head">
                  <div className="wfp-card-title">
                    <h3 className="wfp-card-name">{policy.name}</h3>
                    <span className="wfp-card-meta">
                      {plural(rules.length, "regra", "regras")} · {plural(active, "ativa", "ativas")}
                    </span>
                  </div>
                  <PolicyCategoryTag categoryId={policy.category} />
                </header>

                <div className="wfp-card-rules">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      ref={(el) => { rowRefs.current[rule.id] = el; }}
                      className={`wfp-row${selectedRuleId === rule.id ? " is-selected" : ""}${highlightId === rule.id ? " is-new" : ""}`}
                    >
                      <button className="wfp-row-main" onClick={() => onSelectRule(rule.id)}>
                        <span className="wfp-sid">{rule.id}</span>
                        <span className="wfp-row-name">{rule.name}</span>
                      </button>

                      <span className="wfp-row-tasks">
                        <span className="wfp-dots">
                          {kindsOf(rule).map((kindId) => (
                            <span key={kindId} className="wfp-dot" style={{ background: kindOf(kindId).dot }} />
                          ))}
                        </span>
                        <span className="wfp-row-tasks-label">{plural(rule.tasks.length, "tarefa", "tarefas")}</span>
                      </span>

                      <span className="wfp-col-status">
                        <Toggle on={rule.active} onChange={() => onToggleRule(policy.id, rule.id)} />
                      </span>
                    </div>
                  ))}
                </div>
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

function draftFor(phrase) {
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

/* Chips da chip-row — atalhos persistentes, cada um com intent mapeado. */
const POLICY_CHIPS = [
  { icon: "sparkle", label: "Criar regra a partir de uma frase", intent: "policy-new-rule" },
  { icon: "list",    label: "Quais regras estão desligadas?",    intent: "policy-list-off" },
  { icon: "board",   label: "Como as políticas se organizam?",   intent: "policy-taxonomy" },
  { icon: "clock",   label: "Regras valem para pedidos antigos?", intent: "policy-retroactivity" },
];

/* ── View ───────────────────────────────────────────────────────────────── */
function WorkflowPoliciesView() {
  const [policies, setPolicies] = useState(() =>
    AIWData.workflowPolicies.map((p) => ({ ...p, rules: p.rules.map((r) => ({ ...r })) }))
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const [chatMsgs, setChatMsgs] = useState([
    { from: "agent", text: "Eu monto a regra a partir de uma frase sua. Descreva o evento que o OMS deve detectar — por exemplo: *“quando a transportadora não coletar, acionar a transportadora e avisar o cliente”*." },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const composerRef = useRef(null);

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

  const toggleRule = (policyId, ruleId) => {
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : {
      ...p,
      rules: p.rules.map((r) => r.id !== ruleId ? r : { ...r, active: !r.active }),
    }));
  };

  /* Numeração da regra nova: próximo livre na família de id da categoria. */
  const nextRuleId = (prefix) => {
    const used = policies.flatMap((p) => p.rules)
      .map((r) => r.id.startsWith(prefix + "-") ? parseInt(r.id.slice(prefix.length + 1), 10) : 0)
      .filter((n) => !isNaN(n));
    const next = Math.max(0, ...used) + 1;
    return `${prefix}-${String(next).padStart(3, "0")}`;
  };

  const applyDraft = (draft) => {
    const policy = policies.find((p) => p.id === draft.policyId) || policies[0];
    const id = nextRuleId(categoryOf(policy.category).rulePrefix);
    const rule = {
      id,
      name: draft.name,
      trigger: draft.trigger,
      conditions: draft.conditions,
      tasks: draft.tasks,
      active: true,
    };
    setPolicies((ps) => ps.map((p) => p.id !== policy.id ? p : { ...p, rules: [...p.rules, rule] }));
    /* Filtros voltam ao estado em que a regra nova é visível, senão o scroll
       do canvas cairia numa linha que não está montada. */
    setQuery("");
    setStatus("all");
    setCategory(policy.category);
    setHighlightId(id);
    setSelectedRuleId(id);
    agentSay({
      from: "agent",
      text: `Pronto — **${id} · ${rule.name}** entrou na política **${policy.name}** e já está ativa. Vale só para ocorrências novas.`,
      quickReplies: ["Desligar por enquanto", "Criar outra regra"],
    });
  };

  const handleSend = (text) => {
    const raw = text.trim();
    if (!raw) return;
    setChatMsgs((m) => [...m, { from: "user", text: raw }]);
    const n = norm(raw);

    if (/regra a partir de uma frase|criar outra regra|nova regra/.test(n)) {
      agentSay({ from: "agent", text: "Descreva o evento em uma frase — o que o OMS precisa detectar e o que deve acontecer em seguida." });
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
        .map((c) => `${c.icon} **${c.label}** — ${plural(policies.filter((p) => p.category === c.id).length, "política", "políticas")}`)
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

    /* Sem intent conhecido, a frase é tratada como descrição de um evento. */
    const draft = draftFor(raw);
    const policy = policies.find((p) => p.id === draft.policyId) || policies[0];
    const cat = categoryOf(policy.category);
    agentSay({
      from: "agent",
      text: "Entendi. Montei esta regra — revise antes de criar:",
      type: "action",
      title: "Proposta de regra",
      heading: draft.name,
      fields: [
        { label: "Categoria", value: `${cat.icon} ${cat.label}` },
        { label: "Política", value: policy.name },
        { label: "Gatilho", value: draft.trigger },
        { label: "Se", value: draft.conditions.join(" · ") },
        { label: "Então", value: draft.tasks.map((t) => t.label).join(" · ") },
      ],
      applyLabel: "Criar regra",
      onApply: () => applyDraft(draft),
      onDismiss: () => agentSay({ from: "agent", text: "Descartei a proposta. Se quiser, descreva o evento de outro jeito." }),
    });
  };

  /* "Nova regra" no canvas e o chip da chip-row levam ao mesmo fluxo: o
     assistente pede a frase e o foco vai para o composer. */
  const startNewRule = () => {
    agentSay({ from: "agent", text: "Descreva o evento em uma frase — eu monto a regra e você revisa antes de criar." });
    composerRef.current?.append?.("");
  };

  return (
    <React.Fragment>
      <ResizableSplit screenLabel="Políticas do Workflow" initialWidth={400}>
        <ChatPanel
          title="Assistente de políticas"
          chips={POLICY_CHIPS}
          alwaysShowChips
          messages={chatMsgs}
          onSend={handleSend}
          isTyping={isTyping}
          placeholder="Descreva o evento em uma frase…"
          composerRef={composerRef}
        />
        <WorkflowPoliciesCanvas
          policies={policies}
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          status={status}
          onStatus={setStatus}
          onToggleRule={toggleRule}
          selectedRuleId={selectedRuleId}
          onSelectRule={(id) => { setHighlightId(null); setSelectedRuleId(id); }}
          highlightId={highlightId}
          onNewRule={startNewRule}
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
