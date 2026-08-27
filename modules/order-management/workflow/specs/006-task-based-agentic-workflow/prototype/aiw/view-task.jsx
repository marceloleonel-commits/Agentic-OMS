/* global React, ReactDOM, Icon, IconCopy, IconArrowUpRight, AIWData, ChatPanel, ChatEngine, SevPill, PersonAvatar, WorkflowSection */
const { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } = React;

function StatusSegmented({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const opts = [
    { id: "todo",        label: "A fazer",       dot: "#D1D5DB" },
    { id: "in_progress", label: "Em progresso",  dot: "var(--primary)" },
    { id: "done",        label: "Concluída",      dot: "#169B61" },
  ];

  const current = opts.find(o => o.id === value) || opts[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="status-dropdown" ref={ref}>
      <button
        className={`status-dropdown-btn${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dropdown-dot" style={{ background: current.dot }} />
        <span className="status-dropdown-label">{current.label}</span>
        <svg className={`status-dropdown-chevron${open ? " open" : ""}`} viewBox="0 0 16 16" fill="none" width="12" height="12">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="status-dropdown-panel" role="listbox">
          {opts.map(o => (
            <button
              key={o.id}
              className={`status-dropdown-item${value === o.id ? " selected" : ""}`}
              role="option"
              aria-selected={value === o.id}
              onClick={() => { onChange && onChange(o.id); setOpen(false); }}
            >
              <span className="status-dropdown-dot" style={{ background: o.dot }} />
              <span>{o.label}</span>
              {value === o.id && (
                <svg style={{ marginLeft: "auto", flexShrink: 0, color: "var(--primary)" }} viewBox="0 0 16 16" fill="none" width="12" height="12">
                  <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Status leading icon — v3 InitiativeTaskStatusLeading (working dots / attention / check / ring) */
function SubTaskStatusIcon({ status }) {
  if (status === "active") return <DocWorkingDots size={20} />;
  if (status === "attention") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#B6DFFF" />
        <circle cx="8" cy="8" r="4" fill="#1E4EE5" />
      </svg>
    );
  }
  if (status === "completed") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#AFF79E" />
        <path d="M5 8.2l2 2 4-4.2" stroke="#28BC37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="#1E4EE5" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/* Retrato de "Reportado por": agente com avatar próprio em AGENT_AVATARS usa o
   dele; quem não tem cai no assistente genérico. */
function ReporterAvatar({ name }) {
  const portrait = name && ((AIWData && AIWData.AGENT_AVATARS) || {})[name];
  return (
    <span className={`reporter-emoji reporter-emoji--img${portrait ? " reporter-emoji--agent" : ""}`}>
      <img src={portrait || "my-assistant.png"} alt="" />
    </span>
  );
}

/* Canvas A e Canvas F compartilham a mesma mecânica: diagnóstico do agente +
   árvore de decisão respondida no chat que prescreve as tarefas. O que muda em
   F são os metadados do padrão (Modo degradado, Dependência), declarados nos
   dados. */
function usesVerificationCanvas(task) {
  return task.canvasPattern === "A" || task.canvasPattern === "F";
}

/* Assignee options (prototype) — times + agents + operational roles.
   `members` habilita o badge de contagem no menu; `faces` são chaves de
   AIWData.AVATARS resolvidas na renderização (evita depender da ordem de load). */
const ASSIGNEE_OPTIONS = [
  { name: "SAC Team", team: true, members: 12, faces: ["ana", "joao", "cami"] },
  { name: "Supervisor OMS Team", team: true, members: 4, faces: ["leo", "mar", "alex"] },
  { name: "Operador Loja", initial: "A" },
];

/* Avatar da opção: colagem de rostos quando é um time, avatar comum no resto. */
function AssigneeAvatar({ option }) {
  if (!option.team) return <PersonAvatar initial={option.initial} agent={option.agent} name={option.name} />;
  const avatars = (AIWData && AIWData.AVATARS) || {};
  const faces = (option.faces || []).slice(0, 3).map((k) => avatars[k]).filter(Boolean);
  return (
    <span className="team-avatar" aria-hidden="true">
      {faces.map((src, i) => <img key={i} src={src} alt="" />)}
    </span>
  );
}

/* Assignee pill + v3 dropdown (Dropdown component parity). */
function AssigneePill({ assignee, initial, agent, readOnly }) {
  const [open, setOpen] = useState(false);
  /* Quando o responsável é um time conhecido, o avatar vem da lista de opções
     — só assim a colagem de rostos aparece já na primeira renderização. */
  const known = ASSIGNEE_OPTIONS.find((o) => o.name === assignee);
  const [current, setCurrent] = useState(known || { name: assignee, initial, agent: !!agent });
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  /* Dois casos em que o responsável é registro, não escolha — e o pill vira
     texto, sem chevron nem menu:
     — tarefa já realizada: o que está ali é o que aconteceu;
     — tarefa de agente: a execução é automática e o destino não é um time, então
       não há para quem realocar. Só as tarefas de humano abrem o menu. */
  if (readOnly || current.agent) {
    return (
      <div className="assignee-pill-wrap">
        <span className="assignee-pill assignee-pill--static">
          <AssigneeAvatar option={current} />
          <span className="assignee-pill-name">{current.name}</span>
        </span>
      </div>
    );
  }

  const options = ASSIGNEE_OPTIONS.some((o) => o.name === current.name)
    ? ASSIGNEE_OPTIONS
    : [{ name: current.name, initial: current.initial, agent: current.agent }, ...ASSIGNEE_OPTIONS];

  return (
    /* O pill é autocontido: escolher responsável não deve disparar a ação da
       linha que o contém (abrir o chat, por exemplo). */
    <div className="assignee-pill-wrap" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`assignee-pill${open ? " open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <AssigneeAvatar option={current} />
        <span className="assignee-pill-name">{current.name}</span>
        <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div className="assignee-menu" role="menu">
          {options.map((o, i) => (
            <button
              key={i}
              type="button"
              className={`assignee-menu-item${o.name === current.name ? " selected" : ""}`}
              role="menuitem"
              aria-current={o.name === current.name}
              onClick={() => { setCurrent(o); setOpen(false); }}
            >
              <AssigneeAvatar option={o} />
              <span className="assignee-menu-name">{o.name}</span>
              {o.members != null && (
                <span className="assignee-menu-count">
                  <Icon name="user" size={13} />
                  {o.members}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Task row — v3 initiative task pattern: status leading + execute button (triage).
   Cliques na linha:
   - `onOpenChat` (Canvas A, pergunta pendente) tem prioridade: a resposta destrava
     a geração de tarefas, então tudo tem que ir para o chat.
   - Fora disso, se `onOpenTask` estiver setado (paridade com onTaskClick do
     initiative-tasks v3), a linha vira botão que abre a subview de detalhe da
     subtask no próprio canvas (sem trocar de rota — as subtasks não têm doc
     próprio em AIWData.tasks). */
function SubTaskRow({ t, runnable, awaitingChatReply, onOpenChat, onOpenTask }) {
  // Disparo otimista: o botão fica em loading enquanto a task é acionada e,
  // logo depois, a linha assume o status "active" (working dots).
  const [dispatching, setDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const status =
    dispatched                ? "active" :
    t.state === "loading"     ? "active" :
    t.state === "attention"   ? "attention" :
    t.state === "done"        ? "completed" :
    "triage";

  // Executar (botão da iniciativa): tarefas de follow-up acionáveis (não em execução / concluídas).
  const showExecute = runnable && status !== "active" && status !== "completed";

  /* Enquanto o agente aguarda uma resposta no chat, a tarefa em discussão não
     pode ser disparada — o botão assume o mesmo loading do disparo. */
  const loading = dispatching || !!awaitingChatReply;
  const loadingLabel = dispatching ? "Executando task" : "Aguardando resposta no chat";

  const execute = (e) => {
    e.stopPropagation();
    if (loading) return;
    setDispatching(true);
    timerRef.current = setTimeout(() => { setDispatching(false); setDispatched(true); }, 1200);
  };

  /* A linha da tarefa em discussão leva ao chat, onde está a pergunta que
     destrava a geração das tarefas. Nas demais linhas, o clique abre o
     detalhe da subtask (paridade com v3 initiative-tasks). */
  const handler = onOpenChat || (onOpenTask ? () => onOpenTask(t) : null);
  const clickable = !!handler;
  const clickTitle = onOpenChat
    ? "Abrir o chat para responder a pergunta"
    : (onOpenTask ? "Abrir detalhe da task" : undefined);

  return (
    <div
      className={`canvas-task-row${clickable ? " canvas-task-row--clickable" : ""}`}
      onClick={clickable ? handler : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handler(); }
      } : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={clickTitle}
    >
      <div className="canvas-task-left" data-sl-initiative-tasks-row-left="">
        {showExecute ? (
          <span data-sl-initiative-tasks-execute-ring-wrap="">
            <button
              type="button"
              className="initiative-task-execute"
              data-sl-initiative-tasks-execute=""
              data-loading={loading ? "" : undefined}
              title={loading ? `${loadingLabel}…` : "Executar task"}
              aria-label={loading ? loadingLabel : "Executar task"}
              aria-busy={loading || undefined}
              disabled={loading}
              onClick={execute}
            >
              {loading ? <span className="initiative-task-execute-spinner" /> : <Icon name="send" size={14} />}
            </button>
          </span>
        ) : (
          <span data-sl-initiative-tasks-status-slot="">
            <SubTaskStatusIcon status={status} />
          </span>
        )}
        <span className="canvas-task-title">{t.title}</span>
      </div>
      <AssigneePill assignee={t.assignee} initial={t.initial} agent={t.agent} readOnly={status === "completed"} />
    </div>
  );
}

/* ---------- Order detail sub-view ---------- */

/* Numa ocorrência em massa (Canvas A) a lista de pedidos afetados é maior que
   o conjunto de pedidos modelados — só os que têm registro em AIWData.orders
   abrem detalhe. */
function hasOrderRecord(id) {
  return (AIWData.orders || []).some((o) => o.id === id);
}

function buildOrderDetail(order) {
  const fullOrder = AIWData.orders.find(o => o.id === order.id);
  const customerName = fullOrder ? fullOrder.customer : "—";
  const cd = (fullOrder && fullOrder.customerDetail) || {};
  let carrier = "—";
  if (fullOrder && fullOrder.itemGroups) {
    const dg = fullOrder.itemGroups.find(g => g.fulfillmentType === "delivery");
    if (dg) carrier = dg.supplier;
  }
  return {
    customer: {
      name:            customerName,
      taxId:           cd.taxId           || "—",
      phone:           cd.phone           || "—",
      email:           cd.email           || "—",
      address:         cd.address         || "—",
      billingAddress:  cd.billingAddress  || "—",
    },
    card:    cd.card    || "—",
    carrier,
    products: [],
    breakdown: { subtotal: 0, taxes: 0, discounts: 0, total: 0 },
    stages: [],
    stageIdx: 0,
    activities: []
  };
}

/* ══════════════════════════════════════════════════════════
   Item Groups / Raias  (Itens do Pedido — Tarefas por Item)
   ══════════════════════════════════════════════════════════ */

// Usa dados explícitos do pedido (fullOrder.itemGroups) quando disponíveis
function buildOrderItemGroups(fullOrder) {
  return (fullOrder && fullOrder.itemGroups) ? fullOrder.itemGroups : [];
}

/* ── Projections strip (connector bindings) ── */
function ProjectionsStrip({ projections }) {
  if (!projections || projections.length === 0) return null;
  const statusStyle = {
    done:    { dot: "#169B61", bg: "#F0FDF4", color: "#169B61", border: "#BBF7D0" },
    active:  { dot: "var(--primary)", bg: "var(--primary-soft)", color: "var(--primary)", border: "var(--primary)" },
    pending: { dot: "#9CA3AF", bg: "#F9FAFB", color: "var(--fg-3)", border: "var(--border)" },
    error:   { dot: "#DC2626", bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 14px 4px", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".5px", alignSelf: "center", marginRight: 2 }}>
        Connectors
      </span>
      {projections.map((p, i) => {
        const s = statusStyle[p.status] || statusStyle.pending;
        return (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 500, background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 6, padding: "2px 8px" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: "monospace", letterSpacing: ".2px" }}>{p.connector}</span>
            <span style={{ opacity: .65 }}>/{p.name}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ── Stage card (horizontal strip) ── */
function OdStageCard({ stage }) {
  const map = {
    done:    { dot: "#169B61", label: "Finalizado",    bg: "#F0FDF4", border: "#BBF7D0" },
    active:  { dot: "var(--primary)", label: "Em andamento", bg: "var(--primary-soft)", border: "var(--primary)" },
    pending: { dot: "#D1D5DB", label: "Pendente",      bg: "#F9FAFB", border: "var(--border)" },
  };
  const s = map[stage.status] || map.pending;
  return (
    <div className="od-stage-card" style={{ background: s.bg }}>
      <span className="od-stage-card-icon">{stage.icon}</span>
      <span className="od-stage-card-label">{stage.label}</span>
      <span className="od-stage-card-status">
        <span className="od-stage-card-dot" style={{ background: s.dot }} />
        {s.label}
      </span>
    </div>
  );
}

/* ── Per-item step row ── */
const CONNECTOR_STATUS_MAP = {
  success:          { label: "success",          bg: "#F0FDF4", color: "#169B61", border: "#BBF7D0" },
  validation_error: { label: "validation_error", bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  api_error:        { label: "api_error",        bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  rate_limited:     { label: "rate_limited",     bg: "#FEFCE8", color: "#A16207", border: "#FEF08A" },
  network_error:    { label: "network_error",    bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  not_supported:    { label: "not_supported",    bg: "#F9FAFB", color: "var(--fg-3)", border: "var(--border)" },
  unrecoverable:    { label: "unrecoverable",    bg: "#FDF2F8", color: "#9D174D", border: "#FBCFE8" },
};

function OdStepRow({ step, stageLabel, stageIcon }) {
  const colorMap = {
    done:    "var(--fg)",
    active:  "var(--primary)",
    pending: "var(--fg-3)",
    error:   "#EF4444",
  };
  const lc = colorMap[step.status] || colorMap.pending;
  const cs = step.connectorStatus ? (CONNECTOR_STATUS_MAP[step.connectorStatus] || null) : null;

  const StatusIcon = () => {
    const s = step.status;
    if (s === "done")   return <IconCheckCircleFill size={20} style={{ color: "var(--sl-color-green-6)", flexShrink: 0, marginTop: 1 }} />;
    if (s === "active") return <IconPlayCircleFill  size={20} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />;
    if (s === "error")  return <IconXCircleFill     size={20} style={{ color: "#EF4444",        flexShrink: 0, marginTop: 1 }} />;
    return                     <IconClock           size={20} style={{ color: "var(--fg-4)",    flexShrink: 0, marginTop: 1 }} />;
  };

  const executor = step.agent ? "Order Management Agent" : (step.executedBy || "Manual");

  return (
    <div className="od-step-row">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%" }}>

          {/* Left: icon + text stack */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, minWidth: 0 }}>
            <StatusIcon />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", fontSize: 12 }}>
                <span className="od-step-label" style={{ color: lc }}>{step.label}</span>
                {step.cancelSignal && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: 6, padding: "1px 7px" }}>
                    ⚠ Cancelamento sinalizado
                  </span>
                )}
              </div>
              {step.owner && (
                <div style={{ fontSize: 13, color: "var(--fg)", marginTop: 4 }}>
                  Conector: {step.owner}
                </div>
              )}
              {cs && (
                <div style={{ fontSize: 11.5, color: cs.color, marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontWeight: 700, background: cs.bg, border: `1px solid ${cs.border}`, borderRadius: 5, padding: "1px 7px", fontFamily: "monospace", letterSpacing: ".2px", fontSize: 10 }}>
                    {cs.label}
                  </span>
                  {step.connectorNote && <span style={{ fontSize: 11 }}>{step.connectorNote}</span>}
                </div>
              )}
              {stageLabel && (
                <div style={{ fontSize: 13, color: "var(--fg-3)", marginTop: 3 }}>
                  Etapa: {stageLabel}
                </div>
              )}
            </div>
          </div>

          {/* Right: date top, executor bottom */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", flexShrink: 0, minHeight: 58 }}>
            {step.time && (
              <div style={{ fontSize: 11, color: "var(--fg-3)", whiteSpace: "nowrap" }}>{step.time}</div>
            )}
            <div style={{ fontSize: 11, color: "var(--fg-3)", whiteSpace: "nowrap" }}>
              Por {executor}
            </div>
          </div>

        </div>
    </div>
  );
}

/* ── Kit components sub-list ── */
function OdKitComponents({ components }) {
  return (
    <div style={{ margin: "0 0 0 56px", padding: "8px 14px", borderTop: "1px solid var(--border)", background: "#FAFAFA" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>
        Itens do kit
      </div>
      {components.map((c, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < components.length - 1 ? "1px solid var(--border)" : "none" }}>
          <div style={{ width: 32, height: 32, borderRadius: 4, background: "var(--bg-muted)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 500 }}>{c.name}</div>
            <div style={{ fontSize: 11, color: "var(--fg-3)" }}>SKU {c.sku} · {c.qty} {c.unit}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Stage accordion inside an item row ── */
function OdStageGroup({ label, icon, status, steps }) {
  const [open, setOpen] = useState(status === "active");
  const s = {
    done:    { dot: "#169B61",         label: "Concluído",    bg: "#F0FDF4",             border: "#BBF7D0" },
    active:  { dot: "var(--primary)",  label: "Em andamento", bg: "var(--primary-soft)", border: "var(--primary)" },
    pending: { dot: "#D1D5DB",         label: "Pendente",     bg: "#F9FAFB",             border: "var(--border)" },
  }[status] || { dot: "#D1D5DB", label: "Pendente", bg: "#F9FAFB", border: "var(--border)" };

  const owners = [...new Set(steps.map(st => st.owner).filter(Boolean))];

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "16px 14px 16px 16px", background: s.bg, border: "none",
          cursor: "pointer", textAlign: "left", borderRadius: 8,
        }}
      >
        {icon && <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--fg)" }}>{label}</span>
        {owners.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {owners.map((owner, oi) => (
              <span key={oi} style={{ fontSize: 10.5, fontWeight: 500, color: "var(--fg-3)", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 5, padding: "1px 6px", lineHeight: 1.5 }}>
                {owner}
              </span>
            ))}
          </div>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: s.dot, fontWeight: 600, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
          {s.label} · {steps.length} tarefa{steps.length !== 1 ? "s" : ""}
        </span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"
             style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--fg-3)", marginLeft: 6 }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div style={{ borderLeft: `3px solid ${s.dot}` }}>
          {steps.map((step, i) => <OdStepRow key={i} step={step} />)}
        </div>
      )}
    </div>
  );
}

/* ── Item row — tarefas agrupadas por etapa do workflow ── */
function OdItemRow({ item, group }) {
  // Derive grouped steps from the workflow definition
  const wfDef = group && AIWData.workflows && AIWData.workflows.find(w => w.id === group.workflow);
  let groupedSteps = null;
  if (wfDef && item.steps && item.steps.length > 0) {
    const built = wfDef.stages.map((wfStage, si) => {
      const taskNames = new Set(wfStage.tasks.map(t => t.name));
      const stageSteps = item.steps.filter(s => taskNames.has(s.label)).map(s => {
        const wfTask = wfStage.tasks.find(t => t.name === s.label);
        return wfTask ? { ...s, owner: wfTask.owner } : s;
      });
      const groupStage = group.stages && group.stages[si];
      return {
        label:  wfStage.name,
        icon:   groupStage ? groupStage.icon : null,
        status: groupStage ? groupStage.status : "pending",
        steps:  stageSteps,
      };
    }).filter(g => g.steps.length > 0);
    if (built.length > 0) groupedSteps = built;
  }

  return (
    <div className="od-item-row">
      <div className="od-item-head">
        <div className="od-item-thumb">
          {item.emoji && <span>{item.emoji}</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="od-item-name">
            {item.name}
            {item.isKit && (
              <span style={{ fontSize: 10, fontWeight: 700, background: "#F5F3FF", color: "#7C3AED", border: "1px solid #DDD6FE", borderRadius: 6, padding: "1px 8px", marginLeft: 8 }}>
                KIT
              </span>
            )}
          </div>
          <div className="od-item-meta">Qtd: {item.qty} · {item.price} · SKU {item.sku}</div>
        </div>
      </div>
      {item.isKit && item.kitComponents && <OdKitComponents components={item.kitComponents} />}
      <div className="od-item-steps">
        {groupedSteps
          ? groupedSteps.flatMap((sg, si) =>
              sg.steps.map((step, i) => (
                <OdStepRow key={`${si}-${i}`} step={step} stageLabel={sg.label} stageIcon={sg.icon} />
              ))
            )
          : item.steps.map((step, i) => <OdStepRow key={i} step={step} />)
        }
      </div>
    </div>
  );
}

/* ── Return detail card (Pedido 2) ── */
function OdReturnCard({ detail }) {
  if (!detail) return null;
  return (
    <div style={{ margin: "12px 16px", padding: "14px 16px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 15 }}>↩</span>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#C2410C" }}>{detail.reason}</div>
          <div style={{ fontSize: 11, color: "#92400E", marginTop: 1 }}>
            Solicitado em {detail.requestedAt}
            {detail.classification && <span style={{ marginLeft: 8, background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", padding: "1px 8px", borderRadius: 8, fontWeight: 600 }}>{detail.classification}</span>}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: "#78350F", fontStyle: "italic", lineHeight: 1.55, padding: "10px 12px", background: "rgba(255,255,255,.55)", borderRadius: 8, border: "1px solid #FDE68A" }}>
        "{detail.customerText}"
      </div>
    </div>
  );
}

/* ── Cancel group section (Pedido 4) ── */
function OdCancelSection({ cancelGroup }) {
  if (!cancelGroup) return null;
  const done  = cancelGroup.stages.filter(s => s.status === "done").length;
  const total = cancelGroup.stages.length;
  return (
    <div style={{ margin: "8px 0 0", borderTop: "2px dashed #FECACA" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 8px", background: "#FEF2F2" }}>
        <span style={{ fontSize: 14 }}>🚫</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444" }}>{cancelGroup.label}</div>
          <div style={{ fontSize: 11, color: "#B91C1C", marginTop: 1 }}>{done}/{total} etapas concluídas · Workflow: Cancelamento de Pedido</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cancelGroup.stages.length}, 1fr)`, borderBottom: "1px solid #FECACA" }}>
        {cancelGroup.stages.map((st, i) => {
          const dotColor = st.status === "done" ? "#169B61" : st.status === "active" ? "#EF4444" : "#D1D5DB";
          const bg       = st.status === "done" ? "#F0FDF4" : st.status === "active" ? "#FEF2F2" : "#F9FAFB";
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 8px", textAlign: "center", background: bg, borderRight: i < cancelGroup.stages.length - 1 ? "1px solid #FECACA" : "none" }}>
              <span style={{ fontSize: 18 }}>{st.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500 }}>{st.label}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, color: dotColor }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, display: "inline-block" }} />
                {st.status === "done" ? "Concluído" : st.status === "active" ? "Em andamento" : "Pendente"}
              </span>
            </div>
          );
        })}
      </div>
      <div>
        {cancelGroup.steps.map((step, i) => <OdStepRow key={i} step={step} />)}
      </div>
    </div>
  );
}

/* ── Note card ("Sobre este caso de uso") ── */
function OdNote({ note, seller }) {
  if (!note) return null;
  return (
    <div style={{ padding: "14px 16px", background: "var(--primary-soft)", border: "1px solid rgba(41,98,255,.15)", borderRadius: 10, marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <Icon name="sparkle" size={12} />
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: ".6px" }}>
          Caso de uso · {seller}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", marginBottom: 5 }}>{note.useCase}</div>
      <div style={{ fontSize: 12.5, color: "var(--fg-2)", lineHeight: 1.6 }}>{note.text}</div>
    </div>
  );
}

/* ── Atividades executadas — colapsada por padrão, dentro do workflow ── */
function OdRailActivities({ group }) {
  const [open, setOpen] = useState(false);

  // Collect executed steps from all items (deduplicated by label+time)
  const seen = new Set();
  const executed = [];
  group.items.forEach(item => {
    (item.steps || []).forEach(step => {
      if (step.status === "done" || step.status === "active") {
        const key = `${step.label}|${step.time}`;
        if (!seen.has(key)) {
          seen.add(key);
          executed.push({ label: step.label, time: step.time, agent: step.agent, status: step.status, note: step.note });
        }
      }
    });
  });
  // Also collect from cancelGroup steps if present
  if (group.cancelGroup) {
    (group.cancelGroup.steps || []).forEach(step => {
      if (step.status === "done" || step.status === "active") {
        const key = `cancel|${step.label}|${step.time}`;
        if (!seen.has(key)) {
          seen.add(key);
          executed.push({ label: step.label, time: step.time, agent: step.agent, status: step.status, note: step.note, sourceGroup: group.cancelGroup.label });
        }
      }
    });
  }

  if (executed.length === 0) return null;

  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", background: "var(--bg-soft)", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <Icon name="clock" size={13} />
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--fg-2)" }}>
          Atividades executadas
        </span>
        <span style={{ fontSize: 11, color: "var(--fg-3)", marginRight: 6 }}>
          {executed.length} evento{executed.length !== 1 ? "s" : ""}
        </span>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"
             style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--fg-3)" }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: "4px 0 8px" }}>
          {executed.map((e, i) => {
            const isAuto   = !!e.agent;
            const isActive = e.status === "active";
            const dotColor = isActive ? "var(--primary)" : "#169B61";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "9px 16px",
                borderBottom: i < executed.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                {/* icon */}
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isAuto ? "var(--primary-soft)" : "#F3F4F6",
                  marginTop: 1,
                }}>
                  {isAuto
                    ? <Icon name="sparkle" size={12} />
                    : <span style={{ fontSize: 12 }}>👤</span>}
                </div>
                {/* content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--fg)" }}>{e.label}</span>
                    {isActive && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: "var(--primary-soft)", color: "var(--primary)", border: "1px solid var(--primary)", borderRadius: 6, padding: "0px 6px" }}>
                        Em andamento
                      </span>
                    )}
                    {e.sourceGroup && (
                      <span style={{ fontSize: 10, color: "var(--fg-3)", fontStyle: "italic" }}>· {e.sourceGroup}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                    {e.time && (
                      <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{e.time}</span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 6,
                      background: isAuto ? "var(--primary-soft)" : "#F3F4F6",
                      color: isAuto ? "var(--primary)" : "var(--fg-2)",
                      border: isAuto ? "1px solid rgba(41,98,255,.2)" : "1px solid var(--border)",
                    }}>
                      {isAuto ? "Automático" : "Manual"}
                    </span>
                    {e.note && (
                      <span style={{ fontSize: 11, color: "var(--fg-3)", fontStyle: "italic" }}>{e.note}</span>
                    )}
                  </div>
                </div>
                {/* timeline dot */}
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0, marginTop: 9 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Group rail — colapsado por padrão ── */
function OdRail({ group }) {
  const [open, setOpen] = useState(false);
  const done   = group.stages.filter(s => s.status === "done").length;
  const total  = group.stages.length;
  const active = group.stages.find(s => s.status === "active");

  const isCanceling = group.type === "canceling";
  const isReturn    = group.type === "return";
  const isVirtual   = group.type === "virtual";
  const isKit       = group.type === "kit";

  const dotColor = isCanceling ? "#EF4444"
    : isReturn ? "#F97316"
    : active    ? "var(--primary)"
    : done === total ? "#169B61" : "#D1D5DB";

  const headerBg = isCanceling ? "#FEF2F2" : isReturn ? "#FFF7ED" : "var(--bg-soft)";

  const typeBadge = isReturn    ? { label: "Troca e Devolução", bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" }
    : isVirtual   ? { label: "Virtual",         bg: "#F5F3FF", color: "#7C3AED", border: "#DDD6FE" }
    : isKit       ? { label: "Kit",              bg: "#F0FDF4", color: "#059669", border: "#BBF7D0" }
    : isCanceling ? { label: "Cancelamento",     bg: "#FEF2F2", color: "#EF4444", border: "#FECACA" }
    : null;

  return (
    <div className="od-rail" style={isCanceling ? { borderColor: "#FECACA" } : isReturn ? { borderColor: "#FED7AA" } : {}}>
      <button className="od-rail-header" style={{ background: headerBg }} onClick={() => setOpen(o => !o)}>
        <div className="od-rail-left">
          <span className="od-rail-dot" style={{ background: dotColor }} />
          <div>
            <div className="od-rail-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {group.label}
              {typeBadge && (
                <span style={{ fontSize: 10, fontWeight: 700, background: typeBadge.bg, color: typeBadge.color, border: `1px solid ${typeBadge.border}`, borderRadius: 6, padding: "1px 7px" }}>
                  {typeBadge.label}
                </span>
              )}
            </div>
            <div className="od-rail-meta">
              {group.supplier && (
                <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10, fontWeight: 600, color: "#2962FF", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 5, padding: "1px 8px", marginRight: 7 }}>
                  {group.supplier}
                </span>
              )}
              {group.items.length} item{group.items.length !== 1 ? "s" : ""} · {done}/{total} etapas concluídas
              {active && <span style={{ color: isCanceling ? "#EF4444" : "var(--primary)", marginLeft: 6 }}>· {active.label}</span>}
            </div>
          </div>
        </div>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
             style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--fg-3)" }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="od-rail-body">
          {isReturn && group.returnDetail && <OdReturnCard detail={group.returnDetail} />}
          <ProjectionsStrip projections={group.projections} />
          <div className="od-stage-strip">
            {group.stages.map((st, i) => <OdStageCard key={i} stage={st} />)}
          </div>
          <div className="od-rail-items">
            {group.items.map((item, i) => <OdItemRow key={i} item={item} group={group} />)}
          </div>
          {group.cancelGroup && <OdCancelSection cancelGroup={group.cancelGroup} />}
          <OdRailActivities group={group} />
        </div>
      )}
    </div>
  );
}

/* Cupom de frete do marketplace: valor fixo, não proporcional ao item. */
const PROMO_FREE_SHIPPING = 19.90;

function parseBRL(s) {
  if (!s) return 0;
  return parseFloat(s.replace('R$ ', '').replace(/\./g, '').replace(',', '.')) || 0;
}
function fmtBRL(v) {
  const parts = v.toFixed(2).split('.');
  return 'R$ ' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + parts[1];
}

/* ── Build grouped steps for a single item (same logic as OdItemRow) ── */
function buildItemGroupedSteps(item, group) {
  const wfDef = group && AIWData.workflows && AIWData.workflows.find(w => w.id === group.workflow);
  if (!wfDef || !item.steps || item.steps.length === 0) return null;
  const built = wfDef.stages.map((wfStage, si) => {
    const taskNames = new Set(wfStage.tasks.map(t => t.name));
    const stageSteps = item.steps.filter(s => taskNames.has(s.label)).map(s => {
      const wfTask = wfStage.tasks.find(t => t.name === s.label);
      return wfTask ? { ...s, owner: wfTask.owner } : s;
    });
    const groupStage = group.stages && group.stages[si];
    return { label: wfStage.name, icon: groupStage ? groupStage.icon : null, status: groupStage ? groupStage.status : "pending", steps: stageSteps };
  }).filter(g => g.steps.length > 0);
  return built.length > 0 ? built : null;
}

/* ── Package Card — Figma design ── */
/* Copiar o rastreio confirma no próprio botão. O protótipo não tem toast, e
   inventar um só para isto criaria um segundo vocabulário de feedback — a
   confirmação no lugar da ação é mais curta e não tira o olho de onde clicou. */
function CopyTrackingButton({ code }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <SidebarTooltip label="Copiar código de rastreio" placement="top" enabled={!copied}>
      <button
        type="button"
        className={`pkg-title-btn${copied ? " pkg-title-btn--copied" : ""}`}
        onClick={copy}
      >
        {copied ? <Icon name="check" size={14} /> : <IconCopy size={14} />}
        {copied ? "Copiado" : code}
      </button>
    </SidebarTooltip>
  );
}

/* Modal do workflow do pacote — reaproveita WorkflowSection (mesmo componente
   usado no Product Detail) dentro de um portal centralizado. O toggle interno
   Etapas / Timeline continua funcionando: o usuário alterna as duas views sem
   fechar o modal. Como o workflow é único por pacote, passa o primeiro item
   do group como referência para buildSteps(). */
function PackageWorkflowModal({ group, order, title, experienceName, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const item = (group && group.items && group.items[0]) || null;
  const workflows = (typeof AIWData !== "undefined" && AIWData.workflows) || null;

  return ReactDOM.createPortal(
    <div
      className="stage-config-modal-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="stage-config-modal pkg-wf-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Workflow do ${title}`}
      >
        <div className="stage-config-modal-head">
          <h2 className="stage-config-modal-title">
            {title}
            {experienceName ? <span className="pkg-wf-modal-sub"> · {experienceName}</span> : null}
          </h2>
          <button
            type="button"
            className="canvas-topbar-icon"
            onClick={onClose}
            aria-label="Fechar"
            title="Fechar"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="stage-config-modal-body pkg-wf-modal-body">
          <WorkflowSection
            item={item}
            group={group}
            order={order}
            workflows={workflows}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function PackageCard({ group, index, order, onOpenProduct }) {
  const [open, setOpen] = useState(true);
  const [wfModalOpen, setWfModalOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showNextSteps, setShowNextSteps] = useState(new Set());
  function toggleNextSteps(itemIdx) {
    setShowNextSteps(prev => {
      const next = new Set(prev);
      if (next.has(itemIdx)) next.delete(itemIdx);
      else next.add(itemIdx);
      return next;
    });
  }
  function toggleItemWorkflow(itemIdx) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemIdx)) next.delete(itemIdx);
      else next.add(itemIdx);
      return next;
    });
  }
  const currentStage = group.stages ? group.stages.find(s => s.status !== "done") : null;
  const allDone = group.stages && group.stages.every(s => s.status === "done");

  const isReturn    = group.type === "return";
  const isCanceling = group.type === "canceling";
  const isVirtual   = group.type === "virtual";

  const packageLabel = isReturn ? "Devolução" : isCanceling ? "Cancelamento" : isVirtual ? "Virtual" : null;
  const title = packageLabel ? `${packageLabel} #${index + 1}` : `Package #${index + 1}`;

  const stageLabel = allDone ? "Entregue" : currentStage ? currentStage.label : "—";

  // Compute total for this group
  const groupTotal = fmtBRL(
    (group.items || []).reduce((sum, item) => sum + parseBRL(item.price) * (item.qty || 1), 0)
  );

  // Delivery date: prefer explicit eta, then derive from the last completed step
  // of the delivery group (current group, or sibling delivery group for returns)
  function deriveDeliveryDate() {
    if (order && order.eta && order.eta !== "—") return order.eta;
    const targetGroup = (isReturn && order && order.itemGroups)
      ? order.itemGroups.find(g => g.fulfillmentType === "delivery")
      : group;
    if (targetGroup && targetGroup.items) {
      for (const it of targetGroup.items) {
        if (it.steps && it.steps.length > 0) {
          const lastDone = [...it.steps].reverse().find(s => s.status === "done" && s.time);
          if (lastDone) return lastDone.time.split(" ")[0];
        }
      }
    }
    return "—";
  }
  const deliveryDate = deriveDeliveryDate();
  const soldBy = order && order.seller ? order.seller : "—";
  const shippedBy = group.supplier || "—";

  // Workflow name: first segment of group.label (before " · ")
  const experienceName = group.label ? group.label.split(" · ")[0] : "Workflow";

  /* Status da task corrente do pacote. Um erro de conector na task em execução
     é o que a bloqueia; sem nada em execução, o que existe é uma task já
     atribuída ao fornecedor mas ainda não iniciada. */
  function deriveCurrentTaskStatus() {
    const steps = (group.items || []).reduce((all, it) => all.concat(it.steps || []), []);
    const running = steps.find(s => s.status === "active");
    if (running) return running.connectorStatus ? "Blocked" : "In Progress";
    if (steps.some(s => s.status === "pending")) return "Allocated";
    return null;
  }
  const currentTaskStatus = deriveCurrentTaskStatus();

  // Has invoice: Faturamento stage must be done
  const hasFaturamento = (group.stages || []).some(s => s.label && s.label.includes("Faturamento") && s.status === "done");

  // Tracking: only for physical non-virtual groups
  const hasTracking = group.fulfillmentType !== "virtual" && order != null;
  const trackingNumber = hasTracking ? "#9138140341334" : null;
  const invoiceNumber  = hasFaturamento ? "#139201489143" : null;

  return (
    <div className="pkg-card">
      <div className="pkg-header">
        <div className="pkg-title-group">
          <span className="pkg-title">{title}</span>
          <div className="pkg-title-actions">
            {trackingNumber && <CopyTrackingButton code={trackingNumber} />}
            {invoiceNumber && (
              <SidebarTooltip label="Abrir nota fiscal" placement="top">
                <button type="button" className="pkg-title-btn">
                  <IconArrowUpRight size={14} />
                  {invoiceNumber}
                </button>
              </SidebarTooltip>
            )}
          </div>
        </div>
        <div className="pkg-header-right">
          <button className="pkg-collapse-btn" onClick={() => setOpen(o => !o)} aria-label={open ? "Recolher" : "Expandir"}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                 style={{ width: 16, height: 16, transition: "transform .2s", transform: open ? "rotate(0)" : "rotate(180deg)" }}>
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="pkg-meta">
            <div className="pkg-meta-field">
              <span className="pkg-meta-key">Delivery</span>
              <span className="pkg-meta-val">{deliveryDate}</span>
            </div>
            <div className="pkg-meta-sep" />
            <div className="pkg-meta-field">
              <span className="pkg-meta-key">Sold by</span>
              <span className="pkg-meta-val">{soldBy}</span>
            </div>
            <div className="pkg-meta-sep" />
            <div className="pkg-meta-field">
              <span className="pkg-meta-key">Delivered by</span>
              <span className="pkg-meta-val">{shippedBy}</span>
            </div>
          </div>

          <div className="pkg-meta pkg-meta--wide">
            <div className="pkg-meta-field">
              <span className="pkg-meta-key">Workflow Instance</span>
              <span className="pkg-meta-val">{experienceName}</span>
            </div>
            <div className="pkg-meta-sep" />
            <div className="pkg-meta-field">
              <span className="pkg-meta-key">Current Task</span>
              <span className="pkg-meta-val">
                {currentTaskStatus ? `${stageLabel} · ${currentTaskStatus}` : stageLabel}
              </span>
            </div>
            <div className="pkg-meta-sep" />
            {/* Abre o mesmo componente WorkflowSection usado no Product Detail
                dentro de um modal centralizado, com as duas views (Etapas /
                Timeline) e o toggle interno preservado. */}
            <button type="button" className="pkg-wf-see-btn" onClick={() => setWfModalOpen(true)}>
              Ver workflow <Icon name="chevron-right" size={12} />
            </button>
          </div>

          {wfModalOpen && (
            <PackageWorkflowModal
              group={group}
              order={order}
              title={title}
              experienceName={experienceName}
              onClose={() => setWfModalOpen(false)}
            />
          )}

          <div className="pkg-products-table">
            <div className="pkg-products-body">
            <div className="pkg-thead">
              <span>Products</span>
              <span>Units</span>
              <span>Taxes</span>
              <span>Price</span>
            </div>
            {(group.items || []).map((item, i) => {
              const itemTotal = parseBRL(item.price) * (item.qty || 1);
              const isWfOpen = expandedItems.has(i);
              const groupedSteps = isWfOpen ? buildItemGroupedSteps(item, group) : null;
              // Current task: first non-done step of this item; fall back to stage label if no steps
              const currentTask = item.steps && item.steps.length > 0
                ? item.steps.find(s => s.status !== "done")
                : null;
              const currentTaskLabel = currentTask
                ? currentTask.label
                : (!allDone && currentStage ? currentStage.label : null);
              return (
                <div key={i} className="pkg-product-block">
                  <div className={`pkg-product-row${onOpenProduct ? " pkg-product-row--clickable" : ""}`} onClick={() => onOpenProduct && onOpenProduct(i)}>
                    <div className="pkg-product-info">
                      <div className="pkg-product-thumb">{item.emoji || "📦"}</div>
                      <div className="pkg-product-details">
                        <span className="pkg-product-name">{item.name}</span>
                        <span className="pkg-product-sub">{item.price}/Un.</span>
                      </div>
                    </div>
                    <span className="pkg-cell-center">{item.qty || 1}</span>
                    <span className="pkg-cell-center">{fmtBRL(item.tax != null ? item.tax : itemTotal * 0.12)}</span>
                    <span className="pkg-cell-right">{fmtBRL(itemTotal)}</span>
                    {onOpenProduct && <button className="pkg-product-caret" tabIndex={-1} aria-hidden="true">›</button>}
                  </div>

                  {isWfOpen && (() => {
                    const isNextOpen = showNextSteps.has(i);
                    const allSteps = groupedSteps
                      ? groupedSteps.flatMap((sg) => sg.steps.map(step => ({ step, stageLabel: sg.label, stageIcon: sg.icon })))
                      : (item.steps || []).map(step => ({ step }));
                    const firstNonDoneIdx = allSteps.findIndex(({ step }) => step.status !== "done");
                    const allDelivered = firstNonDoneIdx === -1;
                    const allDoneSteps = firstNonDoneIdx >= 0 ? allSteps.slice(0, firstNonDoneIdx) : [];
                    const currentSteps = firstNonDoneIdx >= 0 ? allSteps.slice(firstNonDoneIdx) : allSteps;
                    return (
                      <div className="pkg-wf-expand">
                        {!allDelivered && currentSteps.length > 1 && (
                          <div className="pkg-wf-prev-toggle-row">
                            <button
                              className="pkg-wf-prev-toggle-btn"
                              onClick={() => toggleNextSteps(i)}
                            >
                              {isNextOpen ? "Ocultar próximas etapas" : "Carregar próximas etapas"}
                            </button>
                          </div>
                        )}
                        {allDelivered && [...currentSteps].reverse().map(({ step, stageLabel, stageIcon }, ti) => (
                          <OdStepRow key={`next-${ti}`} step={step} stageLabel={stageLabel} stageIcon={stageIcon} />
                        ))}
                        {!allDelivered && isNextOpen && [...currentSteps.slice(1)].reverse().map(({ step, stageLabel, stageIcon }, ti) => (
                          <OdStepRow key={`next-${ti}`} step={step} stageLabel={stageLabel} stageIcon={stageIcon} />
                        ))}
                        {!allDelivered && currentSteps.length > 0 && (
                          <OdStepRow key="active" step={currentSteps[0].step} stageLabel={currentSteps[0].stageLabel} stageIcon={currentSteps[0].stageIcon} />
                        )}
                        {[...allDoneSteps].reverse().map(({ step, stageLabel, stageIcon }, ti) => (
                          <OdStepRow key={`done-${ti}`} step={step} stageLabel={stageLabel} stageIcon={stageIcon} />
                        ))}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
            </div>
          </div>

          <div className="pkg-footer">
            <div className="pkg-footer-total">
              Total <strong>{groupTotal}</strong>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="od-field">
      <div className="od-field-label">{label}</div>
      <div className="od-field-value">{value}</div>
    </div>);

}

/* ── Product Detail View ── */
function ProductDetailView({ allProducts, productIdx, order, onNavigate, initiativeLabel, onOpenInitiative }) {
  const { item, group, groupIdx } = allProducts[productIdx];
  const [showNextSteps, setShowNextSteps] = React.useState(false);

  const prev = productIdx > 0 ? productIdx - 1 : null;
  const next = productIdx < allProducts.length - 1 ? productIdx + 1 : null;

  const groupedSteps = buildItemGroupedSteps(item, group);
  const allSteps = groupedSteps
    ? groupedSteps.flatMap((sg) => sg.steps.map(step => ({ step, stageLabel: sg.label, stageIcon: sg.icon })))
    : (item.steps || []).map(step => ({ step }));

  const firstNonDoneIdx = allSteps.findIndex(({ step }) => step.status !== "done");
  const allDoneSteps = firstNonDoneIdx >= 0 ? allSteps.slice(0, firstNonDoneIdx) : [];
  const currentSteps = firstNonDoneIdx >= 0 ? allSteps.slice(firstNonDoneIdx) : allSteps;

  const currentTask = item.steps && item.steps.find(s => s.status !== "done");
  const taskLabel   = currentTask ? currentTask.label : "—";

  const itemTotal = parseBRL(item.price) * (item.qty || 1);
  /* As promoções listadas abaixo são as que compõem o preço pago: derivá-las do
     total bruto é o que mantém Full Price − Promotions = Acquired de pé para
     qualquer item, em vez de valores fixos que só fechavam para um deles. */
  const promotions = [
    { name: "VTEX Day 15% OFF", sub: "Promoção aplicada automaticamente · Cumulativa", value: itemTotal * 0.15 },
    { name: "Frete Grátis · Marketplace", sub: "Cupom marketplace · Não cumulativa", value: PROMO_FREE_SHIPPING },
  ];
  const promoTotal = promotions.reduce((sum, p) => sum + p.value, 0);
  const acquired = Math.max(itemTotal - promoTotal, 0);
  const allDone   = (group.stages || []).every(s => s.status === "done");
  const currentStage = (group.stages || []).find(s => s.status !== "done");
  const stageBg    = allDone ? "#F0FDF4" : "#D1FAE5";
  const stageColor = "#059669";
  const stageLabel = allDone ? "Entregue" : currentStage ? currentStage.label : "—";

  return (
    <div className="od-view">
      <div className="od-header">
        <div className="od-topnav">
          <div />
          <div className="od-pager">
            <span className="od-pager-count">{productIdx + 1} de {allProducts.length}</span>
            <button className="od-pager-btn" disabled={prev === null} onClick={() => prev !== null && onNavigate(prev)}>
              <Icon name="chevron-left" size={14} />
            </button>
            <button className="od-pager-btn" disabled={next === null} onClick={() => next !== null && onNavigate(next)}>
              <Icon name="chevron-right" size={14} />
            </button>
          </div>
        </div>
        <h1 className="detail-title">{item.name}</h1>
      </div>

      {/* Metadata */}
      <dl className="detail-fields od-meta">
        <dt>Workflow Task</dt>
        <dd>{taskLabel}</dd>
        <dt>Package</dt>
        <dd>Package #{groupIdx + 1}</dd>
        <dt>Sold by</dt>
        <dd>{order && order.seller ? order.seller : "—"}</dd>
        <dt>Delivery by</dt>
        <dd>{group.supplier || "—"}</dd>
        <dt>Delivery</dt>
        <dd>{order && order.eta ? order.eta : "—"}</dd>
      </dl>

      {/* Product section */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Product</h3></div>
        <div className="prod-detail-cards">
          {/* Infos card */}
          <div className="prod-detail-card">
            <div className="prod-detail-card-title">Infos</div>
            <div className="prod-detail-card-rows">
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">Product URL</span>
                <a
                  href={`https://www.cea.com.br/p/${item.sku}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="prod-detail-card-link"
                >
                  cea.com.br/p/{item.sku}
                </a>
              </div>
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">SKU</span>
                <span className="prod-detail-card-value">#{item.sku}</span>
              </div>
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">Units</span>
                <span className="prod-detail-card-value">{item.qty || 1}</span>
              </div>
            </div>
          </div>

          {/* Taxes card */}
          {(() => {
            const taxTotal = item.tax != null ? item.tax : itemTotal * 0.12;
            const icms  = taxTotal * 0.47;
            const pis   = taxTotal * 0.24;
            const cofins = taxTotal * 0.29;
            return (
              <div className="prod-detail-card">
                <div className="prod-detail-card-title">Taxes</div>
                <div className="prod-detail-card-rows">
                  <div className="prod-detail-card-row prod-detail-card-row--total">
                    <span className="prod-detail-card-value prod-detail-card-value--bold">{fmtBRL(taxTotal)}</span>
                  </div>
                  <div className="prod-detail-card-row">
                    <span className="prod-detail-card-label">ICMS</span>
                    <span className="prod-detail-card-value">{fmtBRL(icms)}</span>
                  </div>
                  <div className="prod-detail-card-row">
                    <span className="prod-detail-card-label">PIS</span>
                    <span className="prod-detail-card-value">{fmtBRL(pis)}</span>
                  </div>
                  <div className="prod-detail-card-row">
                    <span className="prod-detail-card-label">COFINS</span>
                    <span className="prod-detail-card-value">{fmtBRL(cofins)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Price card */}
          <div className="prod-detail-card">
            <div className="prod-detail-card-title">Price</div>
            <div className="prod-detail-card-rows">
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">Full Price</span>
                <span className="prod-detail-card-value">{fmtBRL(itemTotal)}</span>
              </div>
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">Promotions</span>
                <span className="prod-detail-card-value">−{fmtBRL(promoTotal)}</span>
              </div>
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">Acquired</span>
                <span className="prod-detail-card-value">{fmtBRL(acquired)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions section */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Promotions Included</h3></div>
        <div style={{ padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {promotions.map((p, i) => (
            <div
              key={p.name}
              className={`prod-promo-row${i === promotions.length - 1 ? " prod-promo-row--last" : ""}`}
            >
              <div>
                <div className="prod-promo-name">{p.name}</div>
                <div className="prod-promo-sub">{p.sub}</div>
              </div>
              <span className="prod-promo-val">−{fmtBRL(p.value)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow section — componente handoff (workflow-section.jsx):
          duas visões (Etapas / Timeline) alimentadas por item.steps + a
          definição do workflow do group. Substitui a lista de <OdStepRow>. */}
      <WorkflowSection
        item={item}
        group={group}
        order={order}
        initiativeLabel={initiativeLabel}
        onOpenInitiative={onOpenInitiative}
      />
    </div>
  );
}

function OrderDetailView({ task, orderId, onBack, onOpenOrder, standalone = false, productView: externalProductView, onProductViewChange, initiativeLabel, onOpenInitiative }) {
  const [internalProductView, setInternalProductView] = React.useState(null);
  // When used from app.jsx (standalone), productView is lifted to the parent via props
  const productView    = externalProductView !== undefined ? externalProductView : internalProductView;
  const setProductView = onProductViewChange  !== undefined ? onProductViewChange  : setInternalProductView;

  /* Navegar internamente entre pedido → produto → outro produto → voltar não
     passa pela pilha de subviews do TaskCanvas (que só reseta o scroll em
     `subView`); por isso, sempre que `productView` muda, forçamos o
     .detail-scroll ancestral para o topo. Sem isso, entrar num produto
     mantinha a posição de onde o operador estava rolando no pedido. */
  const rootRef = useRef(null);
  useLayoutEffect(() => {
    const el = rootRef.current && rootRef.current.closest(".detail-scroll");
    if (el) el.scrollTop = 0;
  }, [productView, orderId]);
  /* Canvas A escopa em affectedOrders; as demais tarefas, em impacted. O pager
     só percorre pedidos que têm registro completo. */
  const scoped = task.detail.impacted || (task.detail.affectedOrders && task.detail.affectedOrders.items) || [];
  const impacted = scoped.filter((o) => hasOrderRecord(o.id));
  const idx = impacted.findIndex((o) => o.id === orderId);
  const order = impacted[idx];
  if (!order) return null;
  const d = buildOrderDetail(order);

  // Full order data (for item groups — has qty, status, date)
  const fullOrder = AIWData.orders.find(o => o.id === orderId);
  const itemGroups = buildOrderItemGroups(fullOrder);
  const totalItems = itemGroups.reduce((s, g) => s + g.items.length, 0);

  // Flat list of all products across groups, for ProductDetailView pagination
  const allProducts = itemGroups.flatMap((group, groupIdx) =>
    (group.items || []).map((item, itemIdx) => ({ item, group, groupIdx, itemIdx }))
  );

  // Real payment breakdown — computed from item groups
  const SHIPPING_RATE = 19.90; // flat rate per delivery group
  const realBreakdown = { subtotal: 0, discounts: 0, taxes: 0, shipping: 0, total: 0 };
  if (fullOrder && fullOrder.itemGroups) {
    fullOrder.itemGroups.forEach(function(group) {
      if (group.type === 'return') return; // return group = refund in progress, not original charge
      (group.items || []).forEach(function(item) {
        const sub = parseBRL(item.price) * (item.qty || 1);
        realBreakdown.subtotal += sub;
        realBreakdown.taxes   += item.tax != null ? item.tax : sub * 0.12;
      });
      if (group.fulfillmentType === 'delivery') {
        realBreakdown.shipping += SHIPPING_RATE; // only home delivery charges shipping
      }
    });
    realBreakdown.total = realBreakdown.subtotal - realBreakdown.discounts + realBreakdown.taxes + realBreakdown.shipping;
  }

  const prev = idx > 0 ? impacted[idx - 1] : null;
  const next = idx < impacted.length - 1 ? impacted[idx + 1] : null;

  // Show product detail subview when a product row is clicked
  if (productView !== null) {
    const productIdx = allProducts.findIndex(p => p.groupIdx === productView.groupIdx && p.itemIdx === productView.itemIdx);
    const safeIdx = productIdx >= 0 ? productIdx : 0;
    return (
      <div ref={rootRef}>
        <ProductDetailView
          allProducts={allProducts}
          productIdx={safeIdx}
          order={fullOrder}
          onNavigate={(newIdx) => {
            const p = allProducts[newIdx];
            if (p) setProductView({ groupIdx: p.groupIdx, itemIdx: p.itemIdx });
          }}
          initiativeLabel={initiativeLabel}
          onOpenInitiative={onOpenInitiative}
        />
      </div>
    );
  }

  return (
    <div className="od-view" ref={rootRef}>
      <div className="od-header">
        {!standalone && (
        <div className="od-topnav">
          <div /> {/* spacer; back lives in canvas header */}
          <div className="od-pager">
            <span className="od-pager-count">{idx + 1} de {impacted.length}</span>
            <button
              className="od-pager-btn"
              disabled={!prev}
              onClick={() => prev && onOpenOrder(prev.id)}
              title={prev ? `Pedido anterior · ${prev.id}` : "Sem pedido anterior"}
            >
              <Icon name="chevron-left" size={14} />
            </button>
            <button
              className="od-pager-btn"
              disabled={!next}
              onClick={() => next && onOpenOrder(next.id)}
              title={next ? `Próximo pedido · ${next.id}` : "Sem próximo pedido"}
            >
              <Icon name="chevron-right" size={14} />
            </button>
          </div>
        </div>
        )}
        <h1 className="detail-title">Pedido {orderId}</h1>
      </div>

      {/* Order metadata */}
      <dl className="detail-fields od-meta">
        <dt>Status</dt>
        <dd><TaskDocStatus status="attention" /></dd>

        <dt>Sold by</dt>
        <dd>{order.seller}</dd>

        <dt>Order Placed at</dt>
        <dd>Jan 25, 2026 at 1:35 PM</dd>

        <dt>Last Update</dt>
        <dd>2 minutes ago</dd>
      </dl>

      {/* Customer + Valores — side by side */}
      <div className="od-two-col">
        <section className="detail-section flush">
          <div className="detail-section-head detail-section-head--no-border"><h3>Customer</h3></div>
          <div className="od-fields">
            <Field label="Customer" value={d.customer.name} />
            <Field label="Tax ID" value={d.customer.taxId} />
            <Field label="Phone" value={d.customer.phone} />
            <Field label="Email" value={d.customer.email} />
          </div>
        </section>

        <section className="detail-section flush">
          <div className="detail-section-head detail-section-head--no-border"><h3>Valores</h3></div>
          <div className="od-breakdown">
            <div className="od-bd-row">
              <span>Itens</span>
              <span>{fmtBRL(realBreakdown.subtotal)}</span>
            </div>
            {realBreakdown.discounts > 0 && (
              <div className="od-bd-row">
                <span>Descontos</span>
                <span style={{ color: "#169B61" }}>- {fmtBRL(realBreakdown.discounts)}</span>
              </div>
            )}
            {realBreakdown.taxes > 0 && (
              <div className="od-bd-row">
                <span>Taxas</span>
                <span>{fmtBRL(realBreakdown.taxes)}</span>
              </div>
            )}
            <div className="od-bd-row">
              <span>Frete</span>
              <span>{realBreakdown.shipping > 0 ? fmtBRL(realBreakdown.shipping) : <span style={{ color: "#169B61" }}>Grátis</span>}</span>
            </div>
          </div>
          <div className="od-bd-total">
            <span>Total</span>
            <span>{fmtBRL(realBreakdown.total)}</span>
          </div>
        </section>
      </div>

      {/* Packages — Figma-style product view */}
      {itemGroups.length > 0 && (
        <section className="detail-section flush">
          <div className="pkg-list">
            {[...itemGroups]
              .sort((a, b) => {
                const key = g => {
                  const isDone = (g.stages || []).every(s => s.status === "done");
                  const isReturn = g.type === "return";
                  if (!isDone && !isReturn) return 0; // active non-return
                  if (!isDone && isReturn)  return 1; // active return
                  if (isDone  && isReturn)  return 2; // done return
                  return 3;                           // done non-return (delivered)
                };
                return key(a) - key(b);
              })
              .map((group, i) => (
                <PackageCard key={group.id} group={group} index={i} order={fullOrder} onOpenProduct={(itemIdx) => setProductView({ groupIdx: itemGroups.indexOf(group), itemIdx })} />
              ))}
          </div>
        </section>
      )}

      {/* Payment */}
      <section className="detail-section flush">
        <div className="detail-section-head detail-section-head--no-border"><h3>Pagamento</h3></div>
        <div className="od-fields">
          <Field label="Endereço de cobrança" value={d.customer.billingAddress} />
          <Field label="Total cobrado"        value={fmtBRL(realBreakdown.total)} />
          <Field label="Data"                 value={"14 de outubro de 2024"} />
          <Field label="Cartão"               value={d.card} />
        </div>

      </section>

      {/* Shipping */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Shipping</h3></div>
        <div className="od-fields">
          <Field label="Remetente" value={d.customer.name} />
          <Field label="Endereço de entrega" value={d.customer.address} />
          <Field label="Carrier" value={d.carrier} />
        </div>
      </section>



      <div style={{ height: 40 }} />
    </div>);

}

/* ════════════════════════════════════════════════════════════
   Task Document (v3 port: TaskDocument + accordion sections)
   ════════════════════════════════════════════════════════════ */

const DOC_LIST_MAX = 4;
/* O feed de atividades mostra só o topo no documento — o resto é consulta, e
   consulta acontece no "Ver todos". */
const DOC_ACTIVITIES_MAX = 3;
/* A tabela de pedidos cabe mais linhas que as listas em prosa — o "Ver todos"
   segue valendo para o que passar disso. */
const DOC_ORDERS_MAX = 10;

/* Working dots — v3 active status (snake) */
const DOC_DOTS_AXIS = [6, 12, 18];
const DOC_DOTS_GRID = DOC_DOTS_AXIS.flatMap((cy) => DOC_DOTS_AXIS.map((cx) => ({ cx, cy })));
const DOC_DOTS_SNAKE = [0, 1, 2, 5, 4, 3, 6, 7, 8];

function DocWorkingDots({ size = 20 }) {
  const [head, setHead] = useState(0);
  useEffect(() => {
    const id = window.setInterval(
      () => setHead((h) => (h + 1) % DOC_DOTS_SNAKE.length),
      200
    );
    return () => window.clearInterval(id);
  }, []);
  const visible = new Set();
  for (let o = 0; o < 4; o++) {
    visible.add(DOC_DOTS_SNAKE[(head - o + DOC_DOTS_SNAKE.length * 8) % DOC_DOTS_SNAKE.length]);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden data-sl-doc-working-dots="">
      {DOC_DOTS_GRID.map((dt, i) => (
        <circle key={i} cx={dt.cx} cy={dt.cy} r="1.5" data-on={visible.has(i) ? "" : undefined} />
      ))}
    </svg>
  );
}

const TASK_STATUS_LABEL = {
  triage: "Em aberto",
  active: "Em execução",
  attention: "Requer atenção",
  completed: "Concluído",
};

/* v3 status: working dots (active) · label (attention/completed) · executar (triage) */
function TaskDocStatus({ status, onExecute }) {
  if (status === "triage") {
    return (
      <button data-sl-doc-execute-task="" onClick={onExecute}>
        Executar task
      </button>
    );
  }
  // Attention usa o mesmo CriticalityTag da tabela de iniciativas na Home,
  // para unificar o estilo de tag entre a lista e o painel de detalhe.
  if (status === "attention") {
    return (
      <span data-sl-doc-status="" data-status={status}>
        <span data-sl-criticality-tag="" data-priority="attention">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="8" fill="#B6DFFF" />
            <circle cx="8" cy="8" r="4" fill="#1E4EE5" />
          </svg>
          <span data-sl-doc-status-label="">{TASK_STATUS_LABEL[status] || status}</span>
        </span>
      </span>
    );
  }
  // Completed: mesma pill visual (v3 port do TaskRowStatusTag — teal-3/teal-9
  // com check verde). Reusa `data-sl-criticality-tag` para manter um único
  // container de pill e o mesmo dimensionamento do "attention".
  if (status === "completed") {
    return (
      <span data-sl-doc-status="" data-status={status}>
        <span data-sl-criticality-tag="" data-priority="completed">
          <Icon name="check" size={12} />
          <span data-sl-doc-status-label="">{TASK_STATUS_LABEL[status] || status}</span>
        </span>
      </span>
    );
  }
  return (
    <span data-sl-doc-status="" data-status={status}>
      {status === "active" && <DocWorkingDots size={20} />}
      <span data-sl-doc-status-label="">{TASK_STATUS_LABEL[status] || status}</span>
    </span>
  );
}

/* Metadata row: label (10rem) + value */
function DocMetaRow({ label, children }) {
  return (
    <div data-sl-doc-meta-row="">
      <span data-sl-initiative-metadata-label="">{label}</span>
      <div data-sl-initiative-metadata-value="">{children}</div>
    </div>
  );
}

/* Accordion section — v3 InitiativeDocumentAccordionSection (defaultOpen).
   Optional `count` badge next to the title and a `loadingMs` skeleton phase
   (shown the first time the section is opened, to simulate an agent query). */
/* `count` aceita número ou texto — o badge é o mesmo nos dois casos, só muda o
   que está escrito dentro ("6" ou "0/4 resolvidos"). */
function DocAccordionSection({ title, defaultOpen = true, count, loadingMs = 0, skeleton, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const [loaded, setLoaded] = useState(!loadingMs || defaultOpen);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && loadingMs && !loaded) {
      setLoading(true);
      timerRef.current = setTimeout(() => { setLoading(false); setLoaded(true); }, loadingMs);
    }
  };

  return (
    <div data-sl-doc-accordion-section="" data-open={open ? "" : undefined}>
      <button data-sl-doc-accordion-trigger="" onClick={toggle} aria-expanded={open}>
        <span data-sl-doc-section-title="">
          {title}
          {(typeof count === "number" || (typeof count === "string" && count)) && (
            <span data-sl-doc-section-count="">{count}</span>
          )}
        </span>
        <svg
          data-sl-doc-accordion-chevron=""
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && <div data-sl-doc-accordion-panel="">{loading ? (skeleton || null) : children}</div>}
    </div>
  );
}

/* Sem contador: o total já aparece no cabeçalho da seção que abriga a lista. */
function DocSeeAll({ onClick }) {
  return (
    <button data-sl-doc-see-all="" onClick={onClick}>
      Ver todos <Icon name="chevron-right" size={12} />
    </button>
  );
}

/* Reusable list renderers (shared by capped section + full subview) */
/* Datas do protótipo vêm como DD/MM/AAAA, que ordena errado como texto. Fora
   isso, comparação natural resolve — inclusive "D+1" antes de "D+2". */
function compareCells(a, b) {
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const ma = br.exec(a || ""), mb = br.exec(b || "");
  if (ma && mb) return `${ma[3]}${ma[2]}${ma[1]}`.localeCompare(`${mb[3]}${mb[2]}${mb[1]}`);
  return String(a || "").localeCompare(String(b || ""), "pt-BR", { numeric: true });
}

function ImpactedSortHeader({ label, sortKey, sort, onSort, className }) {
  const active = sort.key === sortKey;
  return (
    <button
      type="button"
      className={`impacted-sort${active ? " impacted-sort--active" : ""}${className ? ` ${className}` : ""}`}
      onClick={() => onSort(sortKey)}
      aria-label={`Ordenar por ${label}`}
    >
      {label}
      <Icon
        name="chevron-down"
        size={12}
        className={active && sort.dir === "desc" ? "impacted-sort-caret impacted-sort-caret--desc" : "impacted-sort-caret"}
      />
    </button>
  );
}

function ImpactedTable({ rows, onOpenOrder, sortable }) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  const sorted = sort.key
    ? rows.slice().sort((a, b) => compareCells(a[sort.key], b[sort.key]) * (sort.dir === "desc" ? -1 : 1))
    : rows;

  return (
    <div className="impacted-table">
      <div className="impacted-thead">
        <span className="impacted-col-id">ID do pedido</span>
        {sortable ? (
          <>
            <ImpactedSortHeader label="SLA restante" sortKey="sla" sort={sort} onSort={toggleSort} />
            <ImpactedSortHeader label="Seller / Localização" sortKey="seller" sort={sort} onSort={toggleSort} />
            <ImpactedSortHeader label="Entrega estimada" sortKey="eta" sort={sort} onSort={toggleSort} className="impacted-col-eta" />
          </>
        ) : (
          <>
            <span>SLA restante</span>
            <span>Seller / Localização</span>
            <span className="impacted-col-eta">Entrega estimada</span>
          </>
        )}
      </div>
      {sorted.map((o, i) => {
        const openable = !!onOpenOrder && hasOrderRecord(o.id);
        return (
          <button
            key={i}
            className={`impacted-row${openable ? "" : " impacted-row--static"}`}
            onClick={openable ? () => onOpenOrder(o.id) : undefined}
          >
            <span className="impacted-id impacted-col-id">{o.id}</span>
            <span>{o.sla}</span>
            <span className="impacted-col-seller">{o.seller}</span>
            <span className="impacted-col-eta">{o.eta}</span>
          </button>
        );
      })}
    </div>
  );
}

/* Atividades são um feed: o que acabou de acontecer no pedido abre a lista e o
   histórico desce. Os dados nascem em ordem cronológica crescente, então a
   direção padrão é a inversa da que está guardada. */
function orderActivities(items, direction) {
  return direction === "oldest" ? items.slice() : items.slice().reverse();
}

function activityTime(date) {
  const d = date || new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* O feed acompanha os movimentos do pedido: quando o operador fecha a árvore de
   verificação, entram a conclusão dele e o que os agentes fizeram a partir da
   resposta — o que foi escalado para uma pessoa e o que seguiu automático. */
function verificationActivities(task, ctl, ordersTotal) {
  const d = task.detail;
  if (!d.verification || !ctl || !ctl.confirmed) return [];

  const time = activityTime(ctl.confirmedAt || ctl.closedAt);
  const tasks = canvasATasksForPath(d.verification, ctl.answers, ctl.path, ordersTotal);
  const who = (d.attributedTo && d.attributedTo.name) || task.assigneeName || "Operador";
  const initial = (d.attributedTo && d.attributedTo.initial) || task.assigneeInitial;
  const firstId = ctl.path[0];
  const cause = canvasAAnswerLabel(
    d.verification, firstId, ctl.answers[firstId], (d.affectedOrders && d.affectedOrders.items) || []
  );

  const out = [{
    time,
    actor: who,
    initial,
    action: "concluiu a verificação da ocorrência",
    note: cause ? `Causa confirmada: ${cause}` : null,
  }];

  tasks.filter((t) => t.state === "attention").forEach((t) => {
    out.push({
      time,
      actor: "Order Management Agent",
      agent: true,
      action: t.assignee
        ? `escalou "${t.title}" para ${t.assignee}`
        : `escalou "${t.title}" para ação humana`,
    });
  });

  const running = tasks.filter((t) => t.state !== "attention" && t.state !== "done");
  if (running.length) {
    out.push({
      time,
      actor: "Order Management Agent",
      agent: true,
      action: running.length === 1
        ? "iniciou 1 tarefa automática a partir da resposta"
        : `iniciou ${running.length} tarefas automáticas a partir da resposta`,
    });
  }
  return out;
}

/* Activities — porte da Timeline do v3 (ai-workspace-shell-template @ v3,
   components/ui/timeline).
   Cada item é uma linha: hora à esquerda em coluna fixa, ação no meio (nome do
   ator em semibold + texto) e avatar à direita. Divisor entre itens; a nota
   entra abaixo como blockquote, alinhada à coluna de texto. */
function ActivitiesList({ items }) {
  return (
    <div data-sl-timeline="" data-sl-activity-list="">
      {items.map((a, i) => (
        <div key={i} data-sl-timeline-item="">
          <div data-sl-timeline-row="">
            <span data-sl-timeline-time="">{a.time}</span>
            <div data-sl-timeline-content="">
              <span data-sl-timeline-action="">
                {a.actor && <span data-sl-timeline-action-name="">{a.actor}</span>}
                {a.actor && " "}
                <span data-sl-timeline-action-text="">{a.action}</span>
              </span>
              <span data-sl-activity-avatar="">
                <PersonAvatar initial={a.initial} agent={a.agent} name={a.actor} />
              </span>
            </div>
          </div>
          {a.note && <div data-sl-blockquote="" data-sl-timeline-note="">{a.note}</div>}
        </div>
      ))}
    </div>
  );
}

/* Skeleton shown while the agent "queries" the activity log — mesma estrutura
   do ActivitiesList (hora · texto · avatar), para o divisor e o alinhamento
   das colunas virem do próprio timeline. */
const ACT_SKELETON_WIDTHS = ["82%", "64%", "73%"];

function ActivitiesSkeleton({ rows = 3 }) {
  return (
    <div data-sl-activities-skeleton="" aria-hidden="true">
      <div data-sl-timeline="" data-sl-activity-list="">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} data-sl-timeline-item="">
            <div data-sl-timeline-row="">
              <span data-sl-timeline-time="">
                <span className="act-skeleton-line sk-shimmer" style={{ width: "80%" }} />
              </span>
              <div data-sl-timeline-content="">
                <span data-sl-timeline-action="">
                  <span
                    className="act-skeleton-line sk-shimmer"
                    style={{ width: ACT_SKELETON_WIDTHS[i % ACT_SKELETON_WIDTHS.length] }}
                  />
                </span>
                <span data-sl-activity-avatar="">
                  <span className="act-skeleton-avatar sk-shimmer" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Skeleton shown while the agent "generates" follow-up tasks based on
   verification answer — mesmo card/colunas do estado final (SubTaskRow),
   com barras no lugar do título e do Responsável. */
function TasksSkeleton({ rows = 2 }) {
  return (
    <div className="canvas-tasks-card" aria-hidden="true">
      <div className="canvas-tasks-head">
        <span>Carregando próximos passos</span>
        <span>Responsável</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <React.Fragment key={i}>
          {i > 0 && <div className="canvas-tasks-row-divider" />}
          <div className="canvas-task-row canvas-tasks-skeleton-row">
            <div className="canvas-task-left">
              <span data-sl-initiative-tasks-status-slot="">
                <span className="canvas-tasks-skeleton-dot" />
              </span>
              <span className="canvas-tasks-skeleton-bar sk-shimmer" />
            </div>
            <span className="canvas-tasks-skeleton-bar sk-shimmer" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

/* Filtro do feed. Mesmo dropdown do Responsável (AssigneePill): o select nativo
   não aceita o arredondamento nem o hover do resto da tela. */
function ActivityFilter({ label, value, options, onChange, withAvatar }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const all = [{ value: "", label }, ...options];
  const current = all.find((o) => o.value === value) || all[0];

  return (
    <div className="act-filter-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`act-filter${open ? " open" : ""}${value ? " act-filter--active" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {withAvatar && current.value !== "" && <PersonAvatar initial={current.initial} agent={current.agent} name={current.label} />}
        <span className="act-filter-label">{current.label}</span>
        <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div className="act-filter-menu" role="menu">
          {all.map((o) => (
            <button
              key={o.value || "all"}
              type="button"
              className={`act-filter-option${o.value === value ? " selected" : ""}`}
              role="menuitem"
              aria-current={o.value === value}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {withAvatar && o.value !== "" && <PersonAvatar initial={o.initial} agent={o.agent} name={o.label} />}
              <span className="act-filter-option-name">{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Página cheia do feed. Os itens que ainda não tinham aparecido no documento
   são consultados aqui pela primeira vez — daí o skeleton na estreia. Depois
   disso a lista já está em mãos e a volta é imediata. */
function ActivitiesSubview({ items, loaded, onLoaded }) {
  const [loading, setLoading] = useState(!loaded);
  const [owner, setOwner] = useState("");
  const [direction, setDirection] = useState("recent");

  useEffect(() => {
    if (loaded) return;
    const t = setTimeout(() => { setLoading(false); onLoaded && onLoaded(); }, 900);
    return () => clearTimeout(t);
  }, [loaded]);

  /* Agentes e pessoas ocupam o mesmo papel no feed — quem assinou a atividade.
     Um filtro só, com o avatar de cada um para distinguir sem precisar de
     rótulo de tipo. */
  const owners = [];
  items.forEach((a) => {
    if (a.actor && !owners.some((o) => o.value === a.actor)) {
      owners.push({ value: a.actor, label: a.actor, agent: a.agent, initial: a.initial });
    }
  });

  const filtered = owner ? items.filter((a) => a.actor === owner) : items;
  const feed = orderActivities(filtered, direction);

  return (
    <div data-sl-task-document-content="">
      <h1 data-sl-task-document-title="">Atividades</h1>
      <div className="act-filters">
        <span className="act-filters-title">Filtrar por</span>
        <ActivityFilter
          label="Todos os responsáveis"
          value={owner}
          options={owners}
          onChange={setOwner}
          withAvatar
        />
        <ActivityFilter
          label="Mais recente primeiro"
          value={direction === "recent" ? "" : direction}
          options={[{ value: "oldest", label: "Mais antigo primeiro" }]}
          onChange={(v) => setDirection(v || "recent")}
        />
      </div>
      {loading ? (
        <ActivitiesSkeleton rows={4} />
      ) : feed.length ? (
        <ActivitiesList items={feed} />
      ) : (
        <p className="act-empty">Nenhuma atividade para esse filtro.</p>
      )}
    </div>
  );
}

/* Página cheia da lista de pedidos. Com 23 linhas a busca deixa de ser luxo, e
   ela procura pelos três campos que a tabela mostra. */
function ImpactedSubview({ rows, isCanvasA, onOpenOrder }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? rows.filter((o) =>
        [o.id, o.customer, o.seller].some((v) => (v || "").toLowerCase().indexOf(q) !== -1))
    : rows;

  return (
    <div data-sl-task-document-content="">
      <h1 data-sl-task-document-title="">Pedidos {isCanvasA ? "afetados" : "impactados"}</h1>
      <div className="impacted-search">
        <Icon name="search" size={14} />
        <input
          type="search"
          placeholder="Buscar por ID, cliente ou seller"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
      {filtered.length ? (
        <ImpactedTable rows={filtered} onOpenOrder={onOpenOrder} sortable />
      ) : (
        <p className="act-empty">Nenhum pedido encontrado.</p>
      )}
    </div>
  );
}

/* Subtask detail subview — clique em SubTaskRow (paridade com onTaskClick do
   initiative-tasks v3). As subtasks do prototype não têm doc próprio em
   AIWData.tasks, então este subview é uma superfície leve com título +
   metadados (status, responsável) usando os mesmos componentes do canvas
   principal (DocMetaRow, TaskDocStatus). Herda a topbar/back do TaskCanvas. */
function SubtaskDetailSubview({ subtask }) {
  const t = subtask;
  const status =
    t.state === "loading"   ? "active" :
    t.state === "attention" ? "attention" :
    t.state === "done"      ? "completed" :
    "triage";
  return (
    <div data-sl-task-document-content="">
      <div data-sl-task-document-heading-block="">
        <div data-sl-task-document-title-block="">
          <h1 data-sl-task-document-title="">{t.title}</h1>
        </div>
        <div data-sl-initiative-document-metadata="">
          <DocMetaRow label="Status">
            <TaskDocStatus status={status} />
          </DocMetaRow>
          <DocMetaRow label="Responsável">
            <AssigneePill
              assignee={t.assignee}
              initial={t.initial}
              agent={t.agent}
              readOnly
            />
          </DocMetaRow>
        </div>
      </div>
    </div>
  );
}

/* Full-list subview (v3: "ver a lista em outro nível") */
function TaskListSubview({ kind, task, onOpenOrder, activities, activitiesLoaded, onActivitiesLoaded }) {
  const d = task.detail;
  if (kind === "impacted") {
    const isCanvasA = usesVerificationCanvas(task);
    const rows = isCanvasA ? (d.affectedOrders?.items || []) : d.impacted;
    return <ImpactedSubview rows={rows} isCanvasA={isCanvasA} onOpenOrder={onOpenOrder} />;
  }
  if (kind === "duplicates" || kind === "exceptions") {
    const group = d[kind];
    const suggested = (d.suggestedTasks || []).find((t) => t.detailKey === kind);
    return (
      <div data-sl-task-document-content="">
        <h1 data-sl-task-document-title="">{suggested ? suggested.title : group.label}</h1>
        {suggested && <p data-sl-task-document-summary="">{suggested.sub}</p>}
        <div className="canvas-d-decision-group canvas-d-decision-group--subview">
          <CanvasDDecisionGroupBody group={group} />
        </div>
      </div>
    );
  }
  return (
    <ActivitiesSubview
      items={activities || d.activities || []}
      loaded={activitiesLoaded}
      onLoaded={onActivitiesLoaded}
    />
  );
}

function TaskCanvasMain({ task, onOpenOrder, onOpenList, onOpenTask, activities }) {
  const d = task.detail;
  const impactedVisible = d.impacted.slice(0, DOC_ORDERS_MAX);
  const feed = orderActivities(activities || d.activities, "recent");
  const activitiesVisible = feed.slice(0, DOC_ACTIVITIES_MAX);

  return (
    <div data-sl-task-document-content="">
      {/* ── Heading block: title + summary + metadata ── */}
      <div data-sl-task-document-heading-block="">
        <div data-sl-task-document-title-block="">
          <h1 data-sl-task-document-title="">{d.title}</h1>
          {d.summary && <p data-sl-task-document-summary="">{d.summary}</p>}
        </div>

        <div data-sl-initiative-document-metadata="">
          <DocMetaRow label="Atribuído a">
            <span className="lead-pill">
              <PersonAvatar initial={d.attributedTo.initial} />
              <span>{d.attributedTo.name}</span>
              <Icon name="chevron-down" size={12} />
            </span>
          </DocMetaRow>

          <DocMetaRow label="Status">
            <TaskDocStatus status={task.status} />
          </DocMetaRow>

          <DocMetaRow label="Severidade">
            <SevPill level={d.severity} />
          </DocMetaRow>

          <DocMetaRow label="Reportado por">
            <span className="reporter">
              <ReporterAvatar name={d.reportedBy.agent} />
              <span><b>{d.reportedBy.agent}</b> em {d.reportedBy.at}</span>
            </span>
          </DocMetaRow>
        </div>
      </div>

      {/* ── Accordion sections ── */}
      <div data-sl-initiative-document-accordion-stack="">
        <DocAccordionSection title="Diagnóstico">
          <p className="detail-section-body">{d.diagnosis}</p>
        </DocAccordionSection>

        <DocAccordionSection title="Tarefas">
          <div className="canvas-tasks-card">
            <div className="canvas-tasks-head"><span>Tarefas de follow-up</span><span>Responsável</span></div>
            {d.followUp.map((t, i) =>
              <React.Fragment key={`fu-${i}`}>
                {i > 0 && <div className="canvas-tasks-row-divider" />}
                <SubTaskRow t={t} runnable onOpenTask={onOpenTask} />
              </React.Fragment>
            )}
            <div className="canvas-tasks-group-divider" />
            <div className="canvas-tasks-head"><span>Tarefas anteriores / resolvidas</span><span>Responsável</span></div>
            {d.resolved.map((t, i) =>
              <React.Fragment key={`rs-${i}`}>
                {i > 0 && <div className="canvas-tasks-row-divider" />}
                <SubTaskRow t={t} onOpenTask={onOpenTask} />
              </React.Fragment>
            )}
          </div>
        </DocAccordionSection>

        <DocAccordionSection title="Pedidos impactados">
          <ImpactedTable rows={impactedVisible} onOpenOrder={onOpenOrder} />
          {d.impacted.length > DOC_ORDERS_MAX && (
            <DocSeeAll onClick={() => onOpenList("impacted")} />
          )}
        </DocAccordionSection>

        <DocAccordionSection title="Atividades" count={feed.length}>
          <ActivitiesList items={activitiesVisible} />
          {feed.length > DOC_ACTIVITIES_MAX && (
            <DocSeeAll onClick={() => onOpenList("activities")} />
          )}
        </DocAccordionSection>
      </div>

      <div data-sl-canvas-doc-end-spacer="" style={{ height: 24 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Canvas Pattern A — Bloqueio operacional em massa
   (wireframe: canvas_pattern_1_operational_block · hybrid style)
   Blocos: metadados · diagnóstico · tarefas sugeridas · pedidos afetados
   ══════════════════════════════════════════════════════════ */
/* Tarefa única de verificação manual: sem ação própria — abaixo dela,
   dentro do mesmo card, uma pergunta de múltipla escolha (mesmo padrão
   das perguntas do chat) decide qual ação será prescrita. */
function CanvasAVerifyOption({ badge, title, selected, onSelect, children }) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      className={`canvas-a-verify-option${selected ? " selected" : ""}`}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
    >
      <span className="canvas-a-verify-option-badge">{badge}</span>
      <span className="canvas-a-verify-option-copy">
        {title && <span className="canvas-a-verify-option-title" title={title}>{title}</span>}
        {children}
      </span>
    </div>
  );
}

/* A pergunta de verificação é respondida somente no chat. No canvas, o
   Diagnóstico exibe apenas este alerta com a pergunta pendente; o botão
   "Responder" abre o chat e só aparece quando ele está fechado. */
function CanvasAVerifyAlert({ question, onOpenChat }) {
  return (
    <div className="canvas-a-verify-alert">
      <span className="canvas-a-verify-alert-icon"><Icon name="quiz-stacked" size={20} /></span>
      <span className="canvas-a-verify-alert-copy">
        {question && <span className="canvas-a-verify-alert-title">{question}</span>}
        <span className="canvas-a-verify-alert-desc">Responda sua pergunta no chat</span>
      </span>
      {onOpenChat && (
        <button
          type="button"
          className="canvas-a-verify-alert-cta"
          data-sl-button
          data-variant="tertiary"
          data-size="large"
          data-has-label
          onClick={onOpenChat}
        >
          <Icon name="chevron-left" size={16} />
          Responder
        </button>
      )}
    </div>
  );
}

/* Motor da árvore de decisão da verificação manual, compartilhado entre o card
   (que vive no chat, acima do composer) e o canvas (skeleton + tarefas
   prescritas).

   O estado guardado é mínimo — as respostas dadas e qual pergunta está em cena.
   O caminho percorrido é derivado a cada render, caminhando de `start` e
   seguindo o `next` da opção escolhida em cada pergunta. É isso que dá de graça
   a reavaliação em cascata exigida pela spec: ao editar uma resposta anterior,
   tudo que vinha depois sai do caminho, e as tarefas — também derivadas do
   caminho — se reavaliam junto. */
function useCanvasAVerification(verification) {
  const [answers, setAnswers] = useState({});
  /* null = acompanhar o fim do caminho; número = pergunta sendo revisitada. */
  const [cursor, setCursor] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [settling, setSettling] = useState(false);
  /* Árvore fechada, mas o operador voltou a uma pergunta pelo resumo: o card
     de Pergunta reaparece sem que nenhuma resposta tenha sido descartada. */
  const [editing, setEditing] = useState(false);
  /* Momento em que a árvore fechou — é o carimbo das atividades geradas pela
     conclusão, que não pode variar a cada render. */
  const [closedAt, setClosedAt] = useState(null);
  /* Etapa de confirmação: quando a árvore fecha, o resumo entra em modo
     "review" e ainda é editável. As tarefas só descem para o canvas depois
     que o operador confirma — a partir daí não há mais volta, porque as
     respostas viram tarefas em execução. */
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);
  const timerRef = useRef(null);

  const questions = (verification && verification.questions) || {};
  const start = verification && verification.start;

  /* Caminho = perguntas alcançadas pelas respostas já dadas. */
  const path = [];
  let closed = false;
  let qid = start;
  while (qid && questions[qid] && path.indexOf(qid) === -1) {
    path.push(qid);
    const answer = answers[qid];
    if (!answer) break;
    if (!answer.next) { closed = true; break; }
    qid = answer.next;
  }

  const index = cursor == null ? path.length - 1 : Math.min(cursor, path.length - 1);
  const currentId = path[index] || start;

  const setDraft = (patch) =>
    setDrafts((d) => ({ ...d, [currentId]: { ...(d[currentId] || {}), ...patch } }));

  return {
    verification,
    answers,
    path,
    closed,
    closedAt,
    editing,
    confirmed,
    confirmedAt,
    /* Enquanto o agente "processa" a confirmação, o canvas mostra skeleton. */
    settling,
    questionId: currentId,
    question: questions[currentId],
    index,
    total: path.length,
    draft: drafts[currentId] || answers[currentId] || {},
    setDraft,
    prev: index > 0 ? () => setCursor(index - 1) : null,
    next: index < path.length - 1 ? () => setCursor(index + 1) : null,
    /* Entrada direta numa pergunta já respondida, a partir do resumo. Só vale
       antes da confirmação — depois disso as respostas viraram tarefas em
       execução e não voltam mais. */
    editAt: (i) => {
      if (confirmed) return;
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
      setSettling(false);
      setCursor(i);
      setEditing(true);
    },
    /* Saída do modo de edição sem alterar nada: volta para o resumo. */
    cancelEdit: () => {
      setCursor(null);
      setEditing(false);
    },
    submit: (answer) => {
      /* Editar uma resposta que muda de branch invalida tudo que vinha depois:
         as respostas a jusante são descartadas para que nada sobreviva de um
         caminho que deixou de ser válido. Se o branch continua o mesmo, as
         perguntas seguintes ainda valem e as respostas são preservadas — só as
         tarefas se reavaliam, o que já acontece por serem derivadas. */
      const previous = answers[currentId];
      const branchChanged = !previous || previous.next !== answer.next;
      const stale = branchChanged ? path.slice(index + 1) : [];
      setAnswers((a) => {
        const nextAnswers = { ...a, [currentId]: answer };
        stale.forEach((id) => { delete nextAnswers[id]; });
        return nextAnswers;
      });
      setCursor(null);
      setEditing(false);
      /* Fechar a árvore só carimba o momento; o skeleton/settling e as
         tarefas no canvas ficam a cargo de confirm() para dar espaço à
         revisão. */
      if (!answer.next) setClosedAt(new Date());
    },
    /* Confirmação final: encerra a etapa de revisão, dispara o skeleton do
       canvas e libera as tarefas prescritas. Sem esta chamada as respostas
       ficam no chat como resumo revisável, mas nada é enviado. */
    confirm: () => {
      if (!closed || confirmed) return;
      setConfirmedAt(new Date());
      setConfirmed(true);
      setSettling(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSettling(false), 1400);
    },
  };
}

/* Resolve os tokens de título de tarefa contra as respostas já dadas:
   {q:id} texto da resposta · {count:id} quantos pedidos foram selecionados ·
   {rest:id} quantos sobraram. Quando a informação veio de um comprovante
   anexado, a quantidade é desconhecida (não há OCR) e o token vira uma frase
   que lê bem no lugar do número. */
function canvasAResolveTaskTitle(title, verification, answers, ordersTotal) {
  return title.replace(/\{(q|count|rest):([\w-]+)\}/g, (_, kind, id) => {
    const answer = answers[id];
    if (!answer) return "";
    if (kind === "q") {
      if (answer.otherText) return answer.otherText.trim();
      const question = verification.questions[id] || {};
      const option = (question.options || []).find((o) => o.id === answer.optionId);
      return option ? option.title : (answer.text || "").trim();
    }
    const picked = answer.orderIds || null;
    if (kind === "count") return picked ? `${picked.length} pedidos` : "conforme comprovante anexado";
    return picked ? `${ordersTotal - picked.length} pedidos restantes` : "pedidos restantes";
  });
}

/* Tarefas prescritas pelo caminho percorrido: cada resposta pode declarar as
   suas, e elas se acumulam na ordem em que a árvore foi respondida. */
function canvasATasksForPath(verification, answers, path, ordersTotal) {
  const out = [];
  path.forEach((id) => {
    const answer = answers[id];
    if (!answer || !answer.tasks) return;
    answer.tasks.forEach((t) => {
      out.push({ ...t, title: canvasAResolveTaskTitle(t.title, verification, answers, ordersTotal) });
    });
  });
  return out;
}

/* Texto legível de uma resposta, usado no resumo final. Cada tipo de input
   guarda a resposta num formato diferente; aqui todos viram uma linha só. */
function canvasAAnswerLabel(verification, questionId, answer, orders) {
  const question = (verification.questions || {})[questionId] || {};
  if (!answer) return "";
  if (question.type === "short_text") return (answer.text || "").trim();
  if (question.type === "select_or_upload") {
    if (answer.fileName) return `Comprovante anexado — ${answer.fileName}`;
    const picked = (answer.orderIds || []).length;
    return `${picked} de ${orders.length} pedidos selecionados`;
  }
  const option = (question.options || []).find((o) => o.id === answer.optionId);
  if (option && option.other) return (answer.otherText || "").trim();
  return option ? option.title : "";
}

/* Fecho do resumo: o que a árvore produziu no canvas, em uma frase. Separa o
   que roda sozinho do que ficou esperando alguém, porque é essa distinção que
   decide se o operador ainda tem trabalho a fazer depois de responder. */
function canvasASummaryOutcome(tasks) {
  const total = tasks.length;
  if (!total) return "";
  const needsHuman = tasks.filter((t) => t.state === "attention");
  const created = total === 1 ? "Criei 1 tarefa no canvas ao lado." : `Criei ${total} tarefas no canvas ao lado.`;
  if (!needsHuman.length) return `${created} Todas seguem automáticas, sem depender de ninguém.`;

  const owners = [...new Set(needsHuman.map((t) => t.assignee).filter(Boolean))];
  const ownerList = owners.length > 1
    ? `${owners.slice(0, -1).join(", ")} e ${owners[owners.length - 1]}`
    : owners[0];
  const pending = needsHuman.length === 1
    ? `1 delas foi escalada para ${ownerList} e espera ação humana`
    : `${needsHuman.length} delas foram escaladas para ${ownerList} e esperam ação humana`;
  return `${created} ${pending}; o resto já está rodando.`;
}

/* Estado de resumo, com duas fases:
   • mode="review" — árvore fechou mas nada foi enviado ao canvas ainda. As
     linhas continuam clicáveis para reabrir a pergunta correspondente, e um
     botão "Confirmar e enviar para o canvas" fecha a etapa. Nada de undo:
     editar uma resposta é o mecanismo de correção.
   • mode="final" — o operador confirmou. As linhas viram texto estático, sem
     interação, porque as respostas já foram traduzidas em tarefas em execução
     no canvas — não faz sentido voltar. */
function CanvasAVerifySummaryCard({ ctl, orders, mode = "final" }) {
  const { verification, answers, path } = ctl;
  const isReview = mode === "review";

  const renderItem = (id, i) => {
    const label = canvasAAnswerLabel(verification, id, answers[id], orders);
    const qTitle = (verification.questions[id] || {}).title;
    if (isReview) {
      return (
        <button
          key={id}
          type="button"
          className="canvas-a-verify-summary-item"
          title="Editar esta resposta"
          onClick={() => ctl.editAt(i)}
        >
          <span className="canvas-a-verify-summary-q">{i + 1}. {qTitle}</span>
          <span className="canvas-a-verify-answer-title">{label}</span>
          <span className="canvas-a-verify-summary-edit" aria-hidden="true">
            <Icon name="chevron-right" size={14} />
          </span>
        </button>
      );
    }
    return (
      <div key={id} className="canvas-a-verify-summary-item canvas-a-verify-summary-item--static">
        <span className="canvas-a-verify-summary-q">{i + 1}. {qTitle}</span>
        <span className="canvas-a-verify-answer-title">{label}</span>
      </div>
    );
  };

  return (
    <div
      className={`canvas-tasks-card canvas-a-verify-answered${isReview ? " canvas-a-verify-answered--review" : ""}`}
      data-verify-summary-mode={mode}
    >
      <div className="canvas-a-verify-answer">
        <div className="canvas-a-verify-answer-copy">
          {/* Revisão usa o modificador `--kind-lower`: caixa baixa (só a
              inicial maiúscula), destoando da tarja em uppercase da versão
              final para reforçar que aqui a etapa ainda é ação, não registro. */}
          <p className={`canvas-a-verify-summary-kind${isReview ? " canvas-a-verify-summary-kind--lower" : ""}`}>
            <Icon name={isReview ? "quiz" : "check"} size={14} />
            {isReview ? "Revise antes de enviar" : "Perguntas respondidas"}
          </p>
          {path.map((id, i) => renderItem(id, i))}
        </div>
      </div>
      {isReview ? (
        <div className="canvas-a-verify-footer canvas-a-verify-confirm-footer">
          <p className="canvas-a-verify-confirm-hint">
            Ao enviar, as respostas viram tarefas e não podem mais ser editadas.
          </p>
          <button
            type="button"
            className="canvas-a-run-btn canvas-a-run-btn--primary"
            onClick={() => ctl.confirm && ctl.confirm()}
          >
            Enviar respostas
          </button>
        </div>
      ) : verification.answeredBy && (
        <p className="canvas-a-verify-answer-meta">
          Feito por {verification.answeredBy}
          {verification.answeredAt ? ` em ${verification.answeredAt}` : ""}
        </p>
      )}
    </div>
  );
}

/* O que a árvore produziu no canvas é fala do agente, não parte do registro de
   perguntas respondidas — entra como mensagem, logo abaixo do card de resumo.
   Continua derivado do caminho, então editar ou desfazer uma resposta reescreve
   o texto junto com as tarefas. */
function CanvasAVerifyOutcomeMessage({ ctl, orders }) {
  const outcome = canvasASummaryOutcome(
    canvasATasksForPath(ctl.verification, ctl.answers, ctl.path, orders.length)
  );
  if (!outcome) return null;
  return (
    <div className="msg msg-assistant">
      <div className="msg-text">{outcome}</div>
    </div>
  );
}

/* Lista dos pedidos do cluster com busca por ID ou cliente — a seleção manual
   do `multi_select_list`. "Selecionar todos" age só sobre o que a busca deixou
   visível, para que filtrar e marcar em lote seja uma operação só. */
function CanvasAVerifyOrderList({ orders, selected, onChange }) {
  const [query, setQuery] = useState("");
  const term = query.trim().toLowerCase();
  const rows = term
    ? orders.filter((o) => o.id.toLowerCase().includes(term) || (o.customer || "").toLowerCase().includes(term))
    : orders;
  const allShown = rows.length > 0 && rows.every((o) => selected.includes(o.id));

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const toggleAll = () =>
    onChange(allShown
      ? selected.filter((id) => !rows.some((o) => o.id === id))
      : [...new Set([...selected, ...rows.map((o) => o.id)])]);

  return (
    <div className="canvas-a-verify-orders">
      <div className="canvas-a-verify-orders-search">
        <Icon name="search" size={14} />
        <input
          type="search"
          placeholder="Buscar por ID ou cliente"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
      <div className="canvas-a-verify-orders-bar">
        <button type="button" className="canvas-a-verify-orders-all" onClick={toggleAll} disabled={rows.length === 0}>
          {allShown ? "Limpar seleção" : "Selecionar todos"}
        </button>
        <span className="canvas-a-verify-orders-count">{selected.length} de {orders.length}</span>
      </div>
      <div className="canvas-a-verify-orders-list">
        {rows.length === 0 && <p className="canvas-a-verify-orders-empty">Nenhum pedido encontrado.</p>}
        {rows.map((o) => (
          <label key={o.id} className="canvas-a-verify-order">
            <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
            <span className="canvas-a-verify-order-copy">
              <span className="canvas-a-verify-order-id">{o.id}</span>
              <span className="canvas-a-verify-order-meta">{o.customer} · {o.sla}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* Selecionar pedidos e anexar comprovante respondem à mesma pergunta por
   caminhos diferentes. Num dropdown só um campo fica aberto por vez, e o card
   não cresce com os dois ao mesmo tempo dentro do chat. */
const CANVAS_A_VERIFY_MODES = [
  { value: "select", icon: "select-search" },
  { value: "upload", icon: "attach" }
];

function CanvasAVerifyModePicker({ mode, selectLabel, uploadLabel, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    /* O card rola dentro do chat e recorta o próprio conteúdo, então o campo
       sobe para o topo antes de abrir — senão o menu nasceria cortado. */
    if (wrapRef.current) wrapRef.current.scrollIntoView({ block: "start" });
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const options = CANVAS_A_VERIFY_MODES.map((o) => ({
    ...o,
    label: o.value === "select" ? selectLabel : uploadLabel
  }));
  const current = options.find((o) => o.value === mode);

  return (
    <div className="canvas-a-verify-mode" ref={wrapRef}>
      <button
        type="button"
        className={`canvas-a-verify-mode-trigger${open ? " open" : ""}${current ? " selected" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {current && <Icon name={current.icon} size={16} className="canvas-a-verify-mode-icon" />}
        <span className="canvas-a-verify-mode-label">
          {current ? current.label : "Escolher como responder"}
        </span>
        <Icon name="chevron-down" size={14} />
      </button>
      {open && (
        <div className="canvas-a-verify-mode-menu" role="menu">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitem"
              aria-current={o.value === mode}
              className={`canvas-a-verify-mode-option${o.value === mode ? " selected" : ""}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              <Icon name={o.icon} size={16} className="canvas-a-verify-mode-icon" />
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Upload de evidência. O anexo é só referência visual para o operador: não há
   extração automática de conteúdo (fora de escopo pela spec), então nada é
   inferido daqui sobre quais pedidos foram despachados. */
function CanvasAVerifyUpload({ fileName, onFile }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const take = (file) => { if (file) onFile(file.name); };

  return (
    <div
      className={`canvas-a-verify-upload${dragging ? " dragging" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        take(e.dataTransfer.files && e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.eml,.msg"
        onChange={(e) => take(e.target.files && e.target.files[0])}
      />
      <span className="canvas-a-verify-upload-name">
        {fileName || "Arraste o comprovante aqui"}
      </span>
      <button type="button" className="canvas-a-run-btn" onClick={() => inputRef.current && inputRef.current.click()}>
        {fileName ? "Trocar" : "Escolher"}
      </button>
      <span className="canvas-a-verify-upload-hint">Imagem, e-mail ou PDF</span>
    </div>
  );
}

/* O mesmo card conduz a árvore inteira: ele não fecha entre uma pergunta e
   outra. O contador `index — total` cresce conforme a árvore se desdobra e as
   setas voltam a perguntas já respondidas para editá-las — o que invalida em
   cascata as respostas (e tarefas) que vinham depois. O corpo muda conforme o
   tipo de input da pergunta; header, paginação e "Continuar" são fixos. */
function CanvasAVerificationCard({ ctl, orders }) {
  const { question, questionId, draft, setDraft, index, total, prev, next } = ctl;

  /* O anel de destaque vale só para a chegada do card. Como ele permanece
     montado de uma pergunta à outra, a classe cai assim que a animação termina
     e não volta enquanto a árvore não fechar. */
  const [entering, setEntering] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 1100);
    return () => clearTimeout(t);
  }, []);

  if (!question) return null;

  const options = question.options || [];
  const selectedOption = options.find((o) => o.id === draft.optionId);
  const isOther = !!(selectedOption && selectedOption.other);
  const pickedOrders = draft.orderIds || [];

  let canSend;
  if (question.type === "short_text") canSend = !!(draft.text || "").trim();
  else if (question.type === "select_or_upload") {
    canSend = draft.mode === "upload" ? !!draft.fileName : pickedOrders.length > 0;
  } else canSend = isOther ? !!(draft.otherText || "").trim() : !!selectedOption;

  /* Em seleção-ou-comprovante, escolher o caminho é o primeiro passo — antes de
     o campo correspondente abrir não há resposta nenhuma a confirmar. */
  const showSubmit = question.type !== "select_or_upload" || !!draft.mode;

  const submit = () => {
    if (question.type === "short_text") {
      ctl.submit({ text: (draft.text || "").trim(), next: question.next || null, tasks: question.tasks });
    } else if (question.type === "select_or_upload") {
      const uploaded = draft.mode === "upload";
      ctl.submit({
        orderIds: uploaded ? null : pickedOrders,
        fileName: uploaded ? draft.fileName : null,
        next: question.next || null,
        tasks: question.tasks,
      });
    } else {
      ctl.submit({
        optionId: selectedOption.id,
        otherText: isOther ? (draft.otherText || "").trim() : "",
        next: selectedOption.next || null,
        tasks: selectedOption.tasks,
      });
    }
  };

  return (
    <div className={`canvas-tasks-card canvas-a-suggested${entering ? " canvas-a-verify-entering" : ""}`}>
      <div className="canvas-a-verify-header">
        <span className="canvas-a-verify-kind">
          <Icon name="quiz" size={16} />
          Pergunta
        </span>
        <div className="canvas-a-verify-pagination">
          <span className="canvas-a-verify-count">{index + 1} — {total}</span>
          <div className="canvas-a-verify-nav">
            <button
              type="button"
              className="icon-btn canvas-a-verify-nav-btn"
              aria-label="Pergunta anterior"
              disabled={!prev}
              onClick={() => prev && prev()}
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button
              type="button"
              className="icon-btn canvas-a-verify-nav-btn"
              aria-label="Próxima pergunta"
              disabled={!next}
              onClick={() => next && next()}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="canvas-a-verify-intro">
        <p className="detail-section-body">
          <span className="canvas-a-verify-index">{index + 1}.</span>
          {question.title}
        </p>
      </div>

      {question.type === "short_text" ? (
        <div className="canvas-a-verify-options">
          <textarea
            className="canvas-a-verify-free-input"
            rows={3}
            autoFocus
            placeholder={question.placeholder || ""}
            value={draft.text || ""}
            onChange={(e) => setDraft({ text: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      ) : question.type === "select_or_upload" ? (
        /* Seleção manual e comprovante são caminhos concorrentes para o mesmo
           dado: escolher um limpa o outro, mas ambos continuam reabríveis. */
        <div className="canvas-a-verify-options">
          <CanvasAVerifyModePicker
            mode={draft.mode}
            selectLabel={question.selectLabel || "Selecionar pedidos"}
            uploadLabel={question.uploadLabel || "Anexar comprovante"}
            onChange={(m) =>
              setDraft(m === "select" ? { mode: "select", fileName: null } : { mode: "upload", orderIds: [] })
            }
          />
          {draft.mode === "select" && (
            <CanvasAVerifyOrderList
              orders={orders}
              selected={pickedOrders}
              onChange={(ids) => setDraft({ orderIds: ids })}
            />
          )}
          {draft.mode === "upload" && (
            <CanvasAVerifyUpload fileName={draft.fileName} onFile={(name) => setDraft({ fileName: name })} />
          )}
        </div>
      ) : (
        <div className="canvas-a-verify-options">
          {/* Só o título da causa: a descrição de apoio (o.desc) fica fora da
              lista para manter cada opção em no máximo duas linhas — ela volta
              a aparecer no registro da resposta confirmada. */}
          {options.map((o, i) => (
            <CanvasAVerifyOption
              key={o.id}
              badge={String.fromCharCode(65 + i)}
              title={o.title}
              selected={draft.optionId === o.id}
              onSelect={() => setDraft({ optionId: o.id })}
            >
              {o.other && draft.optionId === o.id && (
                <textarea
                  className="canvas-a-verify-other-input"
                  rows={2}
                  autoFocus
                  placeholder={o.otherPlaceholder || ""}
                  value={draft.otherText || ""}
                  onChange={(e) => setDraft({ otherText: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              )}
            </CanvasAVerifyOption>
          ))}
        </div>
      )}

      {(showSubmit || (ctl.editing && ctl.closed)) && (
        <div className="canvas-a-verify-footer">
          {showSubmit && (
            <button
              type="button"
              className="canvas-a-run-btn canvas-a-run-btn--primary"
              disabled={!canSend}
              onClick={submit}
            >
              Continuar
            </button>
          )}
          {/* Só quando a edição partiu do resumo: sem isso, quem clica numa linha
              só para conferir não teria como voltar sem responder de novo. */}
          {ctl.editing && ctl.closed && (
            <button type="button" className="canvas-a-run-btn" onClick={ctl.cancelEdit}>
              Voltar ao resumo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* `verification` vem de useCanvasAVerification — o card em si é renderizado no
   chat (acima do composer); aqui só entram os efeitos no documento e o alerta
   que aponta para a pergunta pendente no chat. */
function CanvasPatternA({ task, onOpenOrder, onOpenList, onOpenTask, verification, onOpenChat, activities }) {
  const d = task.detail;
  const orders = d.affectedOrders || { total: 0, items: [] };
  const shownOrders = orders.items.slice(0, DOC_ORDERS_MAX);
  const ordersTotal = orders.total || orders.items.length;
  const feed = orderActivities(activities || d.activities || [], "recent");
  const activitiesVisible = feed.slice(0, DOC_ACTIVITIES_MAX);

  /* Enquanto a árvore de decisão não fecha, "Tarefas a fazer" mostra só a
     verificação em andamento (vinda dos dados). Quando fecha, a verificação
     migra para "Tarefas realizadas" e as tarefas prescritas pelo caminho
     percorrido entram no lugar dela. As tarefas executadas de forma autônoma
     (d.autoDone) já estavam feitas desde a abertura da Ocorrência. */
  /* Só depois da etapa de confirmação as respostas viram tarefas no canvas.
     Enquanto o operador está revisando (closed && !confirmed), o canvas
     mantém o card de verificação em cena. */
  const treeClosed = verification.confirmed;
  const treeSettling = verification.settling;

  const baseFollowUp = d.followUp || [];
  const baseResolved = [...(d.autoDone || []), ...(d.resolved || [])];
  const verificationTask = baseFollowUp[0] || { title: "Verificar com o seller o status do despacho", assignee: task.assigneeName, initial: task.assigneeInitial };
  /* Tarefas que a política já dá por executadas (logging automático, por
     exemplo) nascem em "Tarefas realizadas" — só o que ainda depende de alguém
     entra em "Tarefas a fazer". */
  const pathTasks = canvasATasksForPath(d.verification, verification.answers, verification.path, ordersTotal);
  const followUp = treeClosed ? pathTasks.filter((t) => t.state !== "done") : baseFollowUp;
  const resolved = treeClosed
    ? [
        ...pathTasks.filter((t) => t.state === "done"),
        { state: "done", title: verificationTask.title, assignee: verificationTask.assignee, initial: verificationTask.initial, agent: verificationTask.agent },
        ...baseResolved,
      ]
    : baseResolved;

  return (
    <div data-sl-task-document-content="">
      {/* ── Heading + metadata ── */}
      <div data-sl-task-document-heading-block="">
        <div data-sl-task-document-title-block="">
          <h1 data-sl-task-document-title="">{d.title}</h1>
        </div>

        <div data-sl-initiative-document-metadata="">
          <DocMetaRow label="Severidade">
            <SevPill level={d.severity} />
          </DocMetaRow>
          <DocMetaRow label="Status">
            <TaskDocStatus status={task.status} />
          </DocMetaRow>
          <DocMetaRow label="Escopo">
            <span>{d.scope}</span>
          </DocMetaRow>
          <DocMetaRow label="Reportado por">
            <span className="reporter">
              <ReporterAvatar name={d.reportedBy.agent} />
              <span><b>{d.reportedBy.agent}</b> em {d.reportedBy.at}</span>
            </span>
          </DocMetaRow>
        </div>
      </div>

      {/* ── Accordion sections (reaproveitando componentes do canvas de tarefas) ── */}
      <div data-sl-initiative-document-accordion-stack="">
        {/* Diagnóstico: texto igual às outras tarefas + alerta da lacuna
            (sem badge de Confiança no título — removido a pedido). A pergunta
            de verificação não é respondida aqui: ela vive no chat. */}
        <DocAccordionSection title="Diagnóstico">
          <p className="detail-section-body">{d.diagnosis.text}</p>
          {/* Alerta some assim que a árvore fecha — na etapa de revisão o foco
              já é o card "Revise antes de enviar" no chat, não mais uma
              pergunta pendente. */}
          {d.verification && !verification.closed && (
            <CanvasAVerifyAlert
              question={(verification.question || {}).title}
              onOpenChat={onOpenChat}
            />
          )}
        </DocAccordionSection>

        {/* Tarefas: mesmo modelo de "Tarefas a fazer" / "Tarefas realizadas" +
            Responsável (SubTaskRow) do padrão genérico de tarefas — antes da
            árvore fechar, só a verificação aparece em "Tarefas a fazer";
            depois que ela fecha, a verificação migra para "Tarefas realizadas"
            e as tarefas prescritas pelo caminho percorrido entram em "Tarefas
            a fazer" no lugar dela. Enquanto as tarefas estão sendo geradas
            (1400ms após a última resposta), mostra skeleton de loading. */}
        <DocAccordionSection title="Tarefas" count={followUp.length + resolved.length}>
          {treeSettling ? (
            <TasksSkeleton rows={2} />
          ) : (
            <div className="canvas-tasks-card">
              <div className="canvas-tasks-head"><span>Tarefas a fazer</span><span>Responsável</span></div>
              {followUp.map((t, i) => (
                <React.Fragment key={`fu-${t.title}`}>
                  {i > 0 && <div className="canvas-tasks-row-divider" />}
                  {/* Antes da árvore fechar, a primeira linha é a própria
                      verificação — a pergunta está em aberto no chat, então
                      ela aparece em loading em vez de acionável e leva ao
                      chat quando clicada. */}
                  <SubTaskRow
                    t={t}
                    runnable
                    awaitingChatReply={i === 0 && !treeClosed}
                    onOpenChat={i === 0 && !treeClosed ? onOpenChat : null}
                    onOpenTask={i === 0 && !treeClosed ? null : onOpenTask}
                  />
                </React.Fragment>
              ))}
              {resolved.length > 0 && (
                <>
                  <div className="canvas-tasks-group-divider" />
                  <div className="canvas-tasks-head"><span>Tarefas realizadas</span><span>Responsável</span></div>
                  {resolved.map((t, i) => (
                    <React.Fragment key={`rs-${t.title}`}>
                      {i > 0 && <div className="canvas-tasks-row-divider" />}
                      <SubTaskRow t={t} onOpenTask={onOpenTask} />
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          )}
        </DocAccordionSection>

        {/* Pedidos afetados: a mesma ImpactedTable das outras tarefas */}
        <DocAccordionSection title="Pedidos afetados" count={ordersTotal}>
          <ImpactedTable rows={shownOrders} onOpenOrder={onOpenOrder || (() => {})} />
          {ordersTotal > shownOrders.length && (
            <DocSeeAll onClick={() => onOpenList && onOpenList("impacted")} />
          )}
        </DocAccordionSection>

        {/* Atividades: mesmo componente das outras tarefas (aberta + contador) */}
        <DocAccordionSection title="Atividades" count={feed.length}>
          <ActivitiesList items={activitiesVisible} />
          {feed.length > DOC_ACTIVITIES_MAX && (
            <DocSeeAll onClick={() => onOpenList && onOpenList("activities")} />
          )}
        </DocAccordionSection>
      </div>

      <div data-sl-canvas-doc-end-spacer="" style={{ height: 24 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Canvas Pattern D — Devolução e reembolso (fluxo multi-etapa
   com decisão humana), variante "triagem em lote" (wireframe:
   canvas_pattern_4_return_refund + tela de decisão em massa).
   Blocos: metadados · diagnóstico · tarefas sugeridas ·
   casos que precisam de decisão · reasoning da tarefa.
   Reaproveita DocMetaRow, canvas-tasks-card/SubTaskStatusIcon,
   canvas-a-run-btn e ConfidenceBadge já usados no Canvas A —
   sem introduzir estilo próprio (cores/boxes) do wireframe.
   ══════════════════════════════════════════════════════════ */
function CanvasDSuggestedRow({ t, onOpen }) {
  const isPending = t.state === "pending";
  const status = t.state === "done" ? "completed" : t.state;
  const clickable = !!(t.detailKey && onOpen);
  return (
    <div
      className={`canvas-task-row${clickable ? " canvas-task-row--clickable" : ""}`}
      onClick={clickable ? () => onOpen(t.detailKey) : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div className="canvas-task-left" data-sl-initiative-tasks-row-left="">
        <span data-sl-initiative-tasks-status-slot="">
          {isPending ? <span className="task-pending" /> : <SubTaskStatusIcon status={status} />}
        </span>
        <span className="canvas-task-title canvas-d-task-title">
          <span className="canvas-d-task-title-line">
            {t.title}
            {t.tag && <span className="canvas-d-tag">{t.tag}</span>}
          </span>
          <span className="canvas-task-sub">{t.sub}</span>
        </span>
      </div>
      {t.action ? (
        <button type="button" className={`canvas-a-run-btn${t.primary ? " canvas-a-run-btn--primary" : ""}`}>
          {t.action}{t.external ? " ↗" : ""}
        </button>
      ) : t.waitingLabel ? (
        <button type="button" className="canvas-a-run-btn" disabled>{t.waitingLabel}</button>
      ) : null}
    </div>
  );
}

/* Badge "Confiança Alta" no cabeçalho do accordion Diagnóstico — ao clicar,
   abre um popover explicando a confiança (lacunas, critérios avaliados etc.)
   sem expandir/recolher a seção (stopPropagation no clique do badge). */
function ConfidenceBadge({ label, pct, detail }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const tone = pct >= 80 ? "high" : "med";

  return (
    <span className="canvas-d-conf-badge-wrap" ref={wrapRef}>
      <span
        className={`canvas-d-conf-badge canvas-d-conf-badge--${tone}${open ? " open" : ""}`}
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); } }}
      >
        Confiança {label}
      </span>
      {open && (
        <div className="canvas-d-conf-popover" onClick={(e) => e.stopPropagation()}>
          <div className="canvas-d-conf-popover-title">Confiança {label} ({pct}%)</div>
          <p className="canvas-d-conf-popover-text">{detail}</p>
        </div>
      )}
    </span>
  );
}

/* Card detalhado por solicitação: foto do item, motivo, texto do cliente
   (caixa de citação) e as duas ações — usado tanto no bloco "Precisam de
   Decisão" quanto no subview dedicado de uma tarefa sugerida (duplicidade /
   exceções), da mesma forma que ImpactedTable alimenta o subview de pedido. */
function CanvasDDecisionCard({ r, primaryAction, secondaryAction, danger }) {
  return (
    <div className="decision-card">
      <span className="decision-card-photo">{r.photo}</span>
      <div className="decision-card-body">
        <div className="decision-card-head">
          <span className="decision-card-id">{r.id}</span>
          <span className="decision-card-item">{r.item}</span>
        </div>
        <div className="decision-card-reason">{r.reason}</div>
        <blockquote className="decision-card-quote">“{r.reasonDetail}”</blockquote>
        <div className={`decision-card-status${danger ? " decision-card-status--danger" : ""}`}>{r.status}</div>
      </div>
      <div className="decision-card-actions">
        <button type="button" className="canvas-a-run-btn canvas-a-run-btn--primary">{primaryAction}</button>
        <button type="button" className={`canvas-a-run-btn${danger ? " canvas-a-run-btn--danger" : ""}`}>{secondaryAction}</button>
      </div>
    </div>
  );
}

function CanvasDDecisionGroupBody({ group }) {
  return (
    <div className="decision-cards">
      {group.rows.map((r, i) => (
        <CanvasDDecisionCard
          key={i}
          r={r}
          primaryAction={group.primaryAction}
          secondaryAction={group.secondaryAction}
          danger={group.secondaryAction === "Encerrar"}
        />
      ))}
    </div>
  );
}

function CanvasDDecisionGroup({ group }) {
  return (
    <div className="canvas-d-decision-group">
      <div className="canvas-d-decision-label">{group.label} · {group.rows.length}</div>
      <CanvasDDecisionGroupBody group={group} />
    </div>
  );
}

/* ── Avaliação de tickets de devolução (design_handoff_tickets_abertos v2) ──
   O agente já chega com a recomendação e o painel dessa recomendação aberto.
   Aceitar e Negar são painéis de leitura — o SAC não escreve nada, o agente
   apresenta a resolução prevista na política / a regra aplicada e o rascunho
   da mensagem ao cliente. Qualquer desvio (troca, vale-compra, estorno parcial,
   negar com outra justificativa) sai da autonomia do SAC e só existe via
   Escalar, com destino fixo em Ecommerce Supervisor e observação opcional.
   Esse desenho substitui deliberadamente o §4 do SPEC — reconciliar lá. ── */

/* Escalonamento tem destino fixo: qualquer decisão fora da autonomia do SAC
   passa pelo Ecommerce Supervisor. Sem escolha de destino no formulário. */
const TICKET_ESCALATION_LEAD = "Ecommerce Supervisor";

/* Assinatura do card decidido: "Aceita por Adriana Guimarães às 21h29". */
const TICKET_OUTCOME_LABEL = {
  accepted: "Aceita",
  denied: "Negada",
  escalated: "Escalada",
};

/* Ícone Material filled no bloco decidido. */
const TICKET_OUTCOME_GLYPH = {
  accepted: "check-circle",
  denied: "x-circle",
  escalated: "escalate",
};

/* Recomendação do agente → modo de abertura do painel. "Avaliar" não mapeia
   em nenhuma ação, então cai no default (Aceitar). */
const TICKET_REC_MODE = { Aceitar: "accept", Negar: "deny", Escalar: "escalate" };
const ticketRecMode = (t) => TICKET_REC_MODE[t.recommendation] || null;
const ticketOpenMode = (t) => ticketRecMode(t) || "accept";

/* Consequência exibida no rodapé enquanto o painel está aberto. */
const TICKET_CONFIRM_META = {
  accept: "A mensagem é enviada e o aceite vai para o Document Audit",
  deny: "A mensagem é enviada e o cliente tem 7 dias para contestar",
  escalate: "O ticket sai da fila do SAC",
};
const TICKET_CONFIRM_LABEL = {
  accept: "Confirmar aceite",
  deny: "Confirmar negativa",
  escalate: "Confirmar escalonamento",
};

function ticketDecisionTime(date) {
  const d = date || new Date();
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}

/* Nota exibida no card decidido — o texto muda por desfecho: mensagem enviada
   (aceite/negativa) ou observação para o especialista (escalonamento). */
function ticketDecisionNote(decision) {
  if (decision.kind === "escalated") {
    return {
      label: "Observação para o especialista",
      body: decision.note || "Sem observação do SAC — o especialista assume o caso a partir do histórico.",
    };
  }
  return { label: "Mensagem enviada ao cliente", body: decision.message };
}

/* Título + subtítulo do bloco decidido. A assinatura entra no subtítulo
   ("Aceita por Adriana Guimarães às 21h29 · …"). */
function ticketDecisionFeedback(ticket, decision, decidedBy) {
  const signature = `${TICKET_OUTCOME_LABEL[decision.kind]} por ${decidedBy} às ${decision.at}`;
  if (decision.kind === "accepted") {
    return {
      title: `Aceite confirmado · ${decision.resolution}`,
      sub: `${signature} · resolução dentro da política, registrada no Document Audit`,
    };
  }
  if (decision.kind === "denied") {
    return {
      title: "Negativa confirmada",
      sub: `${signature} · cliente tem 7 dias para contestação`,
    };
  }
  return {
    title: `Escalado para ${decision.to || TICKET_ESCALATION_LEAD}`,
    sub: `${signature} · ${ticket.id} aguarda o retorno do especialista`,
  };
}

/* Resumo do bloco multi-item fechado: agrupa por motivo declarado ("2 por
   defeito de fabricação · 1 por arrependimento"). */
function ticketItemsSummary(rows) {
  const groups = [];
  rows.forEach((r) => {
    const hit = groups.find((g) => g.reason === r.reason);
    if (hit) hit.n += 1;
    else groups.push({ reason: r.reason, n: 1 });
  });
  return groups.map((g) => `${g.n} por ${g.reason.toLowerCase()}`).join(" · ");
}

/* Janela de trabalho da fila para o resumo ("às 21h29" ou "entre 09h12 e 21h29"). */
function ticketSummaryWindow(decisions) {
  const times = Object.values(decisions).map((d) => d.at).sort();
  if (times.length === 0) return "";
  return times.length === 1 || times[0] === times[times.length - 1]
    ? `às ${times[0]}`
    : `entre ${times[0]} e ${times[times.length - 1]}`;
}

/* ── Painel de decisão ──
   Sempre aberto na aba correspondente à recomendação do agente (ou "Aceitar"
   como default se a recomendação não mapeia). Aceitar e Negar são leitura;
   Escalar é o único editável, com destino fixo em Ecommerce Supervisor e uma
   observação opcional ao supervisor. Trocar de aba não fecha o painel e
   preserva o que já foi digitado no Escalar. */
function CanvasDTicketDecision({ ticket, mode, onModeChange, escalateNote, onEscalateNote, messageOpen, onToggleMessage }) {
  const recMode = ticketRecMode(ticket);
  const tabs = [
    { key: "accept",   label: "Aceitar", icon: "check-circle" },
    { key: "deny",     label: "Negar",   icon: "x-circle" },
    { key: "escalate", label: "Escalar", icon: "escalate" },
  ];

  return (
    <>
      <div className="tck-panel-header">
        <div className="tck-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              className="tck-tab"
              data-mode={tab.key}
              aria-pressed={mode === tab.key}
              onClick={() => onModeChange(tab.key)}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
              {recMode === tab.key && <span className="tck-tab-dot" aria-hidden />}
            </button>
          ))}
        </div>
      </div>

      <div className="tck-panel">
        {mode === "accept" && (
          <>
            {/* Card 1: resolução prevista na política. */}
            <div className="tck-panel-card" data-tone="accept">
              <span className="tck-panel-card-label" data-tone="accept">
                <Icon name="verified" size={16} />
                Resolução dentro da política
              </span>
              <span className="tck-panel-card-title">{ticket.policyResolution}</span>
              <span className="tck-panel-card-body">{ticket.policyResolutionDetail}</span>
            </div>
            {/* Card 2: rascunho da mensagem ao cliente, colapsável. */}
            <div className="tck-panel-card">
              <button
                type="button"
                className="tck-message-toggle"
                aria-expanded={messageOpen}
                onClick={onToggleMessage}
              >
                <Icon name="sparkle" size={16} className="tck-message-toggle-star" />
                Mensagem ao cliente · rascunho do agente
                <span className="tck-message-toggle-chevron"><Icon name="chevron-down" size={16} /></span>
              </button>
              {messageOpen && <p className="tck-message-body">{ticket.acceptMessage}</p>}
            </div>
            <span className="tck-note">
              <Icon name="info" size={16} />
              Troca, vale-compra ou estorno parcial estão fora da autonomia do SAC — para isso, escale para o Ecommerce Supervisor.
            </span>
          </>
        )}

        {mode === "deny" && (
          <>
            {/* Card 1: regra aplicada, verbatim do denyReason do ticket. */}
            <div className="tck-panel-card" data-tone="deny">
              <span className="tck-panel-card-label" data-tone="deny">
                <Icon name="gavel" size={16} />
                Regra aplicada
              </span>
              <span className="tck-panel-card-body tck-panel-card-body--strong">{ticket.denyReason}</span>
            </div>
            {/* Card 2: rascunho da mensagem ao cliente, colapsável. */}
            <div className="tck-panel-card">
              <button
                type="button"
                className="tck-message-toggle"
                aria-expanded={messageOpen}
                onClick={onToggleMessage}
              >
                <Icon name="sparkle" size={16} className="tck-message-toggle-star" />
                Mensagem ao cliente · rascunho do agente
                <span className="tck-message-toggle-chevron"><Icon name="chevron-down" size={16} /></span>
              </button>
              {messageOpen && <p className="tck-message-body">{ticket.denyMessage}</p>}
            </div>
            <span className="tck-note">
              <Icon name="info" size={16} />
              Negar com outra justificativa, ou abrir exceção contra a regra, está fora da autonomia do SAC — para isso, escale para o Ecommerce Supervisor.
            </span>
          </>
        )}

        {mode === "escalate" && (
          <>
            {/* Destino fixo — o SAC não escolhe para onde escalar. */}
            <div className="tck-panel-card" data-tone="escalate">
              <Icon name="supervisor-account" size={20} />
              <div className="tck-escalate-to">
                <span className="tck-escalate-to-title">{TICKET_ESCALATION_LEAD}</span>
                <span className="tck-escalate-to-sub">Assume o ticket como Lead — o SAC sai da fila</span>
              </div>
            </div>
            <div className="tck-escalate-field">
              <label htmlFor={`tck-note-${ticket.id}`}>O que o supervisor precisa decidir</label>
              <textarea
                id={`tck-note-${ticket.id}`}
                className="tck-escalate-note"
                rows={2}
                placeholder="Opcional — ex.: cliente pede troca por outro tamanho, fora da resolução prevista na política."
                value={escalateNote}
                onChange={(e) => onEscalateNote(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <span className="tck-note">
              <Icon name="info" size={16} />
              A recomendação do agente e o histórico do ticket seguem anexados.
            </span>
          </>
        )}
      </div>
    </>
  );
}

/* Cabeçalho do card: id do ticket · pares label/valor (Status · SLA · Pedido)
   · paginação. Depois de decidido, a célula de SLA vira "Decisão" com o horário
   e o status pill assume o tom do desfecho. */
function CanvasDTicketHeader({ ticket, decision, pagination, onOpenOrder }) {
  const orderOpenable = !!onOpenOrder && hasOrderRecord(ticket.order);
  return (
    <div className="tck-head">
      <div className="tck-head-top">
        <span className="tck-id">{ticket.id}</span>
        {pagination}
      </div>
      <div className="tck-metrics">
        <div className="tck-metric">
          <span className="tck-metric-label">Status</span>
          <span className="tck-status-pill" data-outcome={decision ? decision.kind : undefined}>
            {decision ? TICKET_OUTCOME_LABEL[decision.kind] : "Aguardando avaliação"}
          </span>
        </div>
        <div className="tck-metric">
          <span className="tck-metric-label">{decision ? "Decisão" : "SLA"}</span>
          <span className={`tck-metric-value${!decision && ticket.overdue ? " tck-metric-value--overdue" : ""}`}>
            <Icon name={decision ? "check-circle" : "clock"} size={16} />
            {decision ? decision.at : (ticket.overdue ? `Vencido há ${ticket.sla}` : `Restante ${ticket.sla}`)}
          </span>
        </div>
        <div className="tck-metric">
          <span className="tck-metric-label">Pedido</span>
          {orderOpenable ? (
            <button type="button" className="tck-order-link" onClick={() => onOpenOrder(ticket.order)}>
              #{ticket.order}
              <Icon name="chevron-right" size={16} />
            </button>
          ) : (
            <span className="tck-order-link" disabled>#{ticket.order}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* Card único de item (ticket com 1 SKU só) — usado quando `ticket.items` não
   está preenchido. */
function CanvasDTicketSingleItem({ ticket }) {
  const attachments = ticket.attachments || [];
  return (
    <div className="tck-product">
      <span className="tck-thumb">
        {ticket.photo
          ? <img src={ticket.photo} alt="" draggable={false} />
          : <Icon name="image" size={20} />}
      </span>
      <div className="tck-product-info">
        <span className="tck-product-name">{ticket.item}</span>
        <span className="tck-product-sku">SKU {ticket.sku}</span>
        <span className="tck-item-reason">Motivo declarado: {ticket.shopperReason}</span>
      </div>
      {attachments.length > 0 && (
        <button type="button" className="tck-photos" title={`Ver fotos anexadas · ${attachments.join(" · ")}`}>
          <Icon name="photo-library" size={16} />
          Ver fotos ({attachments.length})
        </button>
      )}
    </div>
  );
}

/* Bloco multi-item: contido, colapsado por padrão. Fechado, empilha até três
   miniaturas e mostra contagem + resumo por motivo. Aberto, o cabeçalho fica
   fixo no topo do contêiner e cada linha aparece dividida por hairline. */
function CanvasDTicketMultiItem({ rows, open, onToggle }) {
  const stack = rows.slice(0, 3);
  return (
    <div className="tck-items">
      <button
        type="button"
        className="tck-items-header"
        data-open={open ? "true" : undefined}
        aria-expanded={open}
        onClick={onToggle}
      >
        {!open && (
          <span className="tck-items-stack">
            {stack.map((r, i) => (
              <span
                key={i}
                className="tck-items-stack-thumb"
                style={r.photo ? { backgroundImage: `url(${r.photo})` } : undefined}
              >
                {!r.photo && <Icon name="image" size={16} />}
              </span>
            ))}
          </span>
        )}
        <span className="tck-items-title">
          <span className="tck-items-label">{rows.length} itens na devolução</span>
          <span className="tck-items-summary">{ticketItemsSummary(rows)}</span>
        </span>
        <span className="tck-items-chevron" data-open={open ? "true" : undefined}>
          <Icon name="chevron-down" size={18} />
        </span>
      </button>
      {open && rows.map((r, i) => (
        <div key={i} className="tck-items-row">
          <span className="tck-thumb">
            {r.photo
              ? <img src={r.photo} alt="" draggable={false} />
              : <Icon name="image" size={20} />}
          </span>
          <div className="tck-product-info">
            <span className="tck-product-name">{r.item}</span>
            <span className="tck-product-sku">SKU {r.sku}</span>
            <span className="tck-item-reason">Motivo declarado: {r.reason}</span>
          </div>
          {r.attachments && r.attachments.length > 0 && (
            <button type="button" className="tck-photos" title={`Ver fotos anexadas · ${r.attachments.join(" · ")}`}>
              <Icon name="photo-library" size={16} />
              Ver fotos ({r.attachments.length})
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* Um card por ticket. Pendente: cabeçalho + produto + solicitação + faixa de
   recomendação + painel de decisão + rodapé "Confirmar". Decidido: cabeçalho
   (com status/decisão) + produto + solicitação + bloco de confirmação. */
function CanvasDTicketCard({
  ticket,
  decision,
  decidedBy,
  pagination,
  mode,
  onModeChange,
  escalateNote,
  onEscalateNote,
  messageOpen,
  onToggleMessage,
  onConfirm,
  onUndo,
  onNext,
  onOpenSummary,
  queueDone,
  onOpenOrder,
}) {
  const rows = ticket.items || [{
    item: ticket.item, sku: ticket.sku, reason: ticket.shopperReason,
    photo: ticket.photo, attachments: ticket.attachments || [],
  }];
  const isMulti = rows.length > 1;
  const [itemsOpen, setItemsOpen] = useState(false);
  const feedback = decision ? ticketDecisionFeedback(ticket, decision, decidedBy) : null;
  const decidedNote = decision ? ticketDecisionNote(decision) : null;

  return (
    <article className="tck-card">
      <CanvasDTicketHeader
        ticket={ticket}
        decision={decision}
        pagination={pagination}
        onOpenOrder={onOpenOrder}
      />

      <div className="tck-product-section">
        {isMulti
          ? <CanvasDTicketMultiItem rows={rows} open={itemsOpen} onToggle={() => setItemsOpen((o) => !o)} />
          : <CanvasDTicketSingleItem ticket={ticket} />}
      </div>

      <div className="tck-request">
        <span className="tck-request-label">Solicitação do cliente</span>
        <p className="tck-request-body">{ticket.message}</p>
      </div>

      {!decision && (
        <>
          <div className="tck-rec">
            <span className="tck-rec-title">
              <Icon name="sparkle" size={16} />
              Recomendação: {ticket.recommendation}
            </span>
            <span className="tck-rec-why">{ticket.why}</span>
            <span className="tck-rec-history">Histórico do cliente: {ticket.history}</span>
          </div>

          <CanvasDTicketDecision
            ticket={ticket}
            mode={mode}
            onModeChange={onModeChange}
            escalateNote={escalateNote}
            onEscalateNote={onEscalateNote}
            messageOpen={messageOpen}
            onToggleMessage={onToggleMessage}
          />

          <div className="tck-actions">
            <span className="tck-actions-meta">{TICKET_CONFIRM_META[mode]}</span>
            <button
              type="button"
              className="tck-confirm"
              data-tone={mode === "deny" ? "deny" : undefined}
              onClick={onConfirm}
            >
              {TICKET_CONFIRM_LABEL[mode]}
            </button>
          </div>
        </>
      )}

      {decision && (
        <div className="tck-decided">
          <div className="tck-decided-head">
            <span className="tck-decided-glyph" data-outcome={decision.kind}>
              <Icon name={TICKET_OUTCOME_GLYPH[decision.kind]} size={16} />
            </span>
            <div className="tck-decided-text">
              <span className="tck-decided-title" data-outcome={decision.kind}>{feedback.title}</span>
              <span className="tck-decided-sub">{feedback.sub}</span>
            </div>
          </div>
          <div className="tck-decided-note">
            <span className="tck-decided-note-label">{decidedNote.label}</span>
            <span className="tck-decided-note-body">{decidedNote.body}</span>
          </div>
          <div className="tck-decided-foot">
            {/* Aceite e negativa já dispararam a mensagem ao cliente — não há
                o que desfazer. Escalonamento só troca o Lead do ticket, então
                é reversível. */}
            {decision.kind === "escalated" && (
              <button type="button" className="tck-undo" onClick={onUndo}>
                <Icon name="undo" size={16} />
                Desfazer
              </button>
            )}
            {queueDone ? (
              <button type="button" className="tck-next" onClick={onOpenSummary}>
                Ver resumo da fila
                <Icon name="chevron-right" size={16} />
              </button>
            ) : onNext && (
              <button type="button" className="tck-next" onClick={onNext}>
                Próximo ticket
                <Icon name="chevron-right" size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

/* Resumo da fila — substitui o card inteiro quando todos os tickets foram
   resolvidos e o SAC pediu para abrir o resumo (ou o resumo entrou sozinho ao
   confirmar o último ticket). Cada linha volta ao ticket correspondente. */
function CanvasDTicketSummary({ rows, decisions, decidedBy, onOpenTicket, onReview }) {
  const counts = [
    { kind: "accepted", label: "Aceitos" },
    { kind: "denied", label: "Negados" },
    { kind: "escalated", label: "Escalados" },
  ].map((c) => ({
    ...c,
    n: rows.filter((r) => (decisions[r.id] || {}).kind === c.kind).length,
  }));

  return (
    <article className="tck-summary" role="status">
      <div className="tck-summary-head">
        <span className="tck-summary-glyph"><Icon name="check" size={20} /></span>
        <div className="tck-summary-title">
          <span className="tck-summary-title-text">Todos os tickets foram concluídos</span>
          <span className="tck-summary-subtitle">
            {rows.length} tickets avaliados por {decidedBy} · {ticketSummaryWindow(decisions)}
          </span>
        </div>
      </div>
      <div className="tck-summary-counts">
        {counts.map((c) => (
          <div key={c.kind} className="tck-summary-stat">
            <span className="tck-summary-stat-label">{c.label}</span>
            <span className="tck-summary-stat-value" data-outcome={c.n > 0 ? c.kind : undefined}>{c.n}</span>
          </div>
        ))}
      </div>
      <div className="tck-summary-list">
        {rows.map((r) => {
          const d = decisions[r.id] || {};
          const items = r.items || [{ item: r.item }];
          const detail = d.kind === "escalated"
            ? `Aguarda ${d.to}`
            : `${d.kind === "accepted" ? r.policyResolution : "Motivo enviado ao cliente"} · ${items.length > 1 ? `${items.length} itens` : items[0].item}`;
          return (
            <button
              key={r.id}
              type="button"
              className="tck-summary-row"
              onClick={() => onOpenTicket(r.id)}
            >
              <span className="tck-summary-row-dot" data-outcome={d.kind} />
              <span className="tck-summary-row-text">
                <span className="tck-summary-row-title">{r.id} · {TICKET_OUTCOME_LABEL[d.kind]}</span>
                <span className="tck-summary-row-detail">{detail}</span>
              </span>
              <span className="tck-summary-row-at">{d.at}</span>
              <Icon name="chevron-right" size={18} />
            </button>
          );
        })}
      </div>
      <div className="tck-summary-foot">
        <span className="tck-summary-foot-note">
          Iniciativa fechada — os escalonamentos seguem como tickets do supervisor
        </span>
      </div>
    </article>
  );
}

/* Lista horizontal de tickets: um card por vez, navegado pelas setas do header.
   A ordem é fixa (SLA vencido primeiro) e não se reordena conforme as decisões
   — o card não pode sair de baixo do cursor. Componente controlado: recebe
   `decisions`, `index`, `summaryOpen` e callbacks do pai (CanvasPatternD). */
function CanvasDTicketList({
  tickets,
  decisions,
  decidedBy,
  index,
  onIndexChange,
  summaryOpen,
  onOpenSummary,
  onReview,
  onDecide,
  onUndo,
  onOpenOrder,
}) {
  const rows = useMemo(
    () => tickets.slice().sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0)),
    [tickets]
  );
  const ticket = rows[index] || rows[0];
  const [dir, setDir] = useState(0);

  /* Ao entrar em cada ticket, o painel abre no modo recomendado — trocar de
     ticket reseta o modo, a nota do escalonamento e o toggle da mensagem. */
  const [mode, setMode] = useState(() => ticketOpenMode(ticket));
  const [escalateNote, setEscalateNote] = useState("");
  const [messageOpen, setMessageOpen] = useState(false);
  const currentIdRef = useRef(ticket.id);
  useEffect(() => {
    if (currentIdRef.current === ticket.id) return;
    currentIdRef.current = ticket.id;
    setMode(ticketOpenMode(ticket));
    setEscalateNote("");
    setMessageOpen(false);
  }, [ticket]);

  const go = (next) => {
    if (next < 0 || next >= rows.length) return;
    setDir(next > index ? 1 : -1);
    onIndexChange(next);
  };

  /* Próximo pendente dando a volta na lista — a ordem é por SLA, não por quem
     já foi avaliado, então o pendente seguinte pode estar atrás. */
  const nextPendingFrom = (from) => {
    for (let step = 1; step < rows.length; step++) {
      const i = (from + step) % rows.length;
      if (!decisions[rows[i].id]) return i;
    }
    return -1;
  };
  const nextPending = nextPendingFrom(index);
  const queueDone = rows.every((r) => !!decisions[r.id]);

  if (!ticket) return null;

  if (summaryOpen && queueDone) {
    return (
      <div className="tck-cards">
        <CanvasDTicketSummary
          rows={rows}
          decisions={decisions}
          decidedBy={decidedBy}
          onOpenTicket={(id) => {
            const i = rows.findIndex((r) => r.id === id);
            if (i >= 0) { onReview(); onIndexChange(i); }
          }}
          onReview={onReview}
        />
      </div>
    );
  }

  const pagination = (
    <span className="tck-pager">
      <span className="tck-pager-count">{index + 1} de {rows.length}</span>
      <button
        type="button"
        className="tck-pager-btn"
        aria-label="Ticket anterior"
        title="Ticket anterior"
        disabled={index === 0}
        onClick={() => go(index - 1)}
      >
        <Icon name="chevron-left" size={18} />
      </button>
      <button
        type="button"
        className="tck-pager-btn"
        aria-label="Próximo ticket"
        title="Próximo ticket"
        disabled={index === rows.length - 1}
        onClick={() => go(index + 1)}
      >
        <Icon name="chevron-right" size={18} />
      </button>
    </span>
  );

  const handleConfirm = () => {
    const at = ticketDecisionTime();
    if (mode === "deny") {
      onDecide(ticket.id, { kind: "denied", message: ticket.denyMessage, at });
    } else if (mode === "escalate") {
      onDecide(ticket.id, { kind: "escalated", to: TICKET_ESCALATION_LEAD, note: escalateNote.trim() || null, at });
    } else {
      onDecide(ticket.id, { kind: "accepted", resolution: ticket.policyResolution, message: ticket.acceptMessage, at });
    }
    /* Trocar de aba dentro do ticket é local; confirmar reseta o rascunho. */
    setEscalateNote("");
    setMessageOpen(false);
  };

  return (
    <div className={`tck-cards${dir > 0 ? " tck-cards--fwd" : dir < 0 ? " tck-cards--back" : ""}`}>
      <CanvasDTicketCard
        key={ticket.id}
        ticket={ticket}
        decision={decisions[ticket.id]}
        decidedBy={decidedBy}
        pagination={pagination}
        mode={mode}
        onModeChange={setMode}
        escalateNote={escalateNote}
        onEscalateNote={setEscalateNote}
        messageOpen={messageOpen}
        onToggleMessage={() => setMessageOpen((o) => !o)}
        onConfirm={handleConfirm}
        onUndo={() => onUndo(ticket.id)}
        onNext={nextPending === -1 ? null : () => go(nextPending)}
        onOpenSummary={onOpenSummary}
        queueDone={queueDone}
        onOpenOrder={onOpenOrder}
      />
    </div>
  );
}

function CanvasPatternD({ task, onOpenList, onOpenOrder, onOpenTask, activities, onAgentMessage }) {
  const d = task.detail;
  const tickets = d.tickets || [];
  const [decisions, setDecisions] = useState({});
  /* `index` e `summaryOpen` sobem para o pai para que fechar a fila possa
     abrir o resumo sem precisar bater na lista, e para que o clique numa linha
     do resumo possa saltar para o ticket certo. */
  const [index, setIndex] = useState(0);
  const [summaryOpen, setSummaryOpen] = useState(false);
  /* A mensagem de fechamento é postada no chat apenas uma vez — mesmo se o
     SAC desfizer um escalonamento depois de fechar a fila. */
  const closedRef = useRef(false);
  const decidedCount = tickets.filter((t) => decisions[t.id]).length;
  const decisionCount = d.exceptions ? d.exceptions.rows.length + d.duplicates.rows.length : 0;
  const resolvedTasks = d.resolvedTasks || [];
  /* Mesmo feed das demais iniciativas: mais recente primeiro, cortado em três
     no documento, o resto na página cheia. */
  const feed = orderActivities(activities || d.activities || [], "recent");
  const activitiesVisible = feed.slice(0, DOC_ACTIVITIES_MAX);

  /* Mesma ordem da lista de tickets do canvas — SLA vencido primeiro — para que
     a linha da tarefa e o card correspondente não fiquem em sequências
     diferentes. */
  const orderedTickets = useMemo(
    () => tickets.slice().sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0)),
    [tickets]
  );
  const queueClosed = orderedTickets.length > 0 && orderedTickets.every((t) => !!decisions[t.id]);

  /* Cada ticket resolvido resolve a Tarefa equivalente. O vínculo é explícito
     (`taskId` no ticket) em vez de casar por índice ou título. Escalar troca
     o Lead da Tarefa para Ecommerce Supervisor (SPEC §4). Desfazer um
     escalonamento reabre a Tarefa. */
  const ticketTasks = orderedTickets.map((t) => {
    const decision = decisions[t.id];
    const outcomeLabel = decision ? TICKET_OUTCOME_LABEL[decision.kind] : null;
    return {
      id: t.taskId || t.id,
      state: decision ? "done" : "attention",
      /* O desfecho aparece embutido na tarefa concluída, com quem decidiu e o
         horário — o SubTaskRow renderiza esse texto direto no título. */
      title: decision
        ? `Resolver ticket ${t.id} · ${outcomeLabel} por ${d.decidedBy} às ${decision.at}`
        : `Resolver ticket ${t.id}`,
      assignee: decision && decision.kind === "escalated"
        ? (decision.to || TICKET_ESCALATION_LEAD)
        : d.lead,
    };
  });

  /* Ao fechar a fila (último ticket confirmado), o agente publica uma mensagem
     no chat com o resumo dos desfechos e a Iniciativa muda para "Concluída". O
     resumo entra sozinho no lugar do card. Os escalonamentos não impedem o
     fechamento — seguem como tickets do supervisor, fora desta Iniciativa. */
  useEffect(() => {
    if (!queueClosed || closedRef.current || !onAgentMessage) return;
    closedRef.current = true;
    setSummaryOpen(true);
    const counts = orderedTickets.reduce((acc, t) => {
      const k = decisions[t.id].kind;
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const parts = [];
    if (counts.accepted)  parts.push(`${counts.accepted} aceitos`);
    if (counts.denied)    parts.push(`${counts.denied} negados`);
    if (counts.escalated) parts.push(`${counts.escalated} escalados para ${TICKET_ESCALATION_LEAD}`);
    const summary = parts.join(" · ");
    onAgentMessage([{
      from: "agent",
      text: `A Iniciativa foi resolvida — os ${orderedTickets.length} tickets estão fechados${summary ? ` (${summary})` : ""}.`,
    }]);
  }, [queueClosed, onAgentMessage, orderedTickets, decisions]);

  /* Desfazer o único ticket ainda pendente-de-fechamento reabre a Iniciativa. */
  useEffect(() => {
    if (!queueClosed && closedRef.current) {
      closedRef.current = false;
      setSummaryOpen(false);
    }
  }, [queueClosed]);

  /* Cada linha troca de grupo assim que o ticket é decidido — inclusive quando
     a decisão foi escalar, que encerra a participação do SAC naquele ticket. */
  const pendingTicketTasks = ticketTasks.filter((t) => t.state !== "done");
  const doneTicketTasks = ticketTasks.filter((t) => t.state === "done");

  return (
    <div data-sl-task-document-content="">
      <div data-sl-task-document-heading-block="">
        <div data-sl-task-document-title-block="">
          <h1 data-sl-task-document-title="">{d.title}</h1>
        </div>

        {/* Mesmos metadados das demais iniciativas (DocMetaRow), na mesma
            ordem: severidade, status e, por último, quem reportou. */}
        <div data-sl-initiative-document-metadata="">
          <DocMetaRow label="Severidade">
            <SevPill level={d.severity} />
          </DocMetaRow>
          <DocMetaRow label="Status">
            {/* Ao fechar a fila, a Iniciativa muda para "Concluída" no mesmo
                momento em que a mensagem do agente sobe no chat. */}
            <TaskDocStatus status={queueClosed ? "completed" : task.status} />
          </DocMetaRow>
          {d.category && (
            <DocMetaRow label="Categoria">
              <span>{d.category}</span>
            </DocMetaRow>
          )}
          <DocMetaRow label="Lead">
            <span>{d.lead}</span>
          </DocMetaRow>
          <DocMetaRow label="Reportado por">
            <span className="reporter">
              <ReporterAvatar name={d.reportedBy.agent} />
              <span><b>{d.reportedBy.agent}</b> · {d.reportedBy.note}</span>
            </span>
          </DocMetaRow>
        </div>
      </div>

      <div data-sl-initiative-document-accordion-stack="">
        {/* Mesmo Diagnóstico das outras iniciativas: só o texto, sem badge de
            confiança no título. */}
        <DocAccordionSection title="Diagnóstico">
          <p className="detail-section-body">{d.diagnosisText}</p>
        </DocAccordionSection>

        {/* Uma Tarefa por ticket, em dois grupos: a linha sai de "a fazer" e
            entra em "realizadas" quando aquele ticket é decidido. As automações
            que a decisão dispara (notificar, estornar, registrar) continuam
            acontecendo sozinhas, sem virar linha aqui. */}
        {tickets.length > 0 ? (
          <DocAccordionSection title="Tarefas" count={ticketTasks.length}>
            <div className="canvas-tasks-card">
              {pendingTicketTasks.length > 0 && (
                <>
                  <div className="canvas-tasks-head">
                    <span>Tarefas a fazer</span>
                    <span>Responsável</span>
                  </div>
                  {pendingTicketTasks.map((t, i) => (
                    <React.Fragment key={t.id}>
                      {i > 0 && <div className="canvas-tasks-row-divider" />}
                      <SubTaskRow t={t} onOpenTask={onOpenTask} />
                    </React.Fragment>
                  ))}
                </>
              )}
              {doneTicketTasks.length > 0 && (
                <>
                  {/* Sem o grupo de cima — todos decididos — o card abre direto
                      no cabeçalho de "realizadas", sem divisor órfão. */}
                  {pendingTicketTasks.length > 0 && <div className="canvas-tasks-group-divider" />}
                  <div className="canvas-tasks-head">
                    <span>Tarefas realizadas</span>
                    <span>Responsável</span>
                  </div>
                  {doneTicketTasks.map((t, i) => (
                    <React.Fragment key={t.id}>
                      {i > 0 && <div className="canvas-tasks-row-divider" />}
                      <SubTaskRow t={t} onOpenTask={onOpenTask} />
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </DocAccordionSection>
        ) : (
        <DocAccordionSection title="Tarefas" count={d.suggestedTasks.length + resolvedTasks.length}>
          <div className="canvas-tasks-card canvas-a-suggested">
            <div className="canvas-tasks-head"><span>Tarefas a fazer</span><span>Ação</span></div>
            {d.suggestedTasks.map((t, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="canvas-tasks-row-divider" />}
                <CanvasDSuggestedRow t={t} onOpen={onOpenList} />
              </React.Fragment>
            ))}
            {resolvedTasks.length > 0 && (
              <>
                <div className="canvas-tasks-group-divider" />
                <div className="canvas-tasks-head"><span>Tarefas realizadas</span><span>Ação</span></div>
                {resolvedTasks.map((t, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="canvas-tasks-row-divider" />}
                    <CanvasDSuggestedRow t={t} />
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </DocAccordionSection>
        )}

        {tickets.length > 0 && (
          <DocAccordionSection
            title="Tickets abertos"
            /* Única seção em que o badge mostra progresso em vez de total: o
               total já aparece no contador da paginação dos cards. */
            count={`${decidedCount}/${tickets.length} resolvidos`}
          >
            <CanvasDTicketList
              tickets={tickets}
              decisions={decisions}
              decidedBy={d.decidedBy}
              index={index}
              onIndexChange={setIndex}
              summaryOpen={summaryOpen}
              onOpenSummary={() => setSummaryOpen(true)}
              onReview={() => setSummaryOpen(false)}
              onDecide={(id, dec) => setDecisions((s) => ({ ...s, [id]: dec }))}
              onUndo={(id) => setDecisions((s) => { const next = { ...s }; delete next[id]; return next; })}
              onOpenOrder={onOpenOrder}
            />
          </DocAccordionSection>
        )}

        {d.exceptions && (
          <DocAccordionSection title="Precisam de Decisão" count={decisionCount}>
            <CanvasDDecisionGroup group={d.exceptions} />
            <CanvasDDecisionGroup group={d.duplicates} />
            {d.decisionNote && (
              <div className="canvas-d-note">
                <span className="canvas-d-note-icon"><Icon name={d.decisionNote.icon} size={14} /></span>
                <span className="canvas-d-note-text">{d.decisionNote.text}</span>
                {d.decisionNote.action && <button type="button" className="canvas-d-note-link">{d.decisionNote.action} ↗</button>}
              </div>
            )}
          </DocAccordionSection>
        )}

        <DocAccordionSection title="Atividades" count={feed.length}>
          <ActivitiesList items={activitiesVisible} />
          {feed.length > DOC_ACTIVITIES_MAX && (
            <DocSeeAll onClick={() => onOpenList && onOpenList("activities")} />
          )}
        </DocAccordionSection>
      </div>

      <div data-sl-canvas-doc-end-spacer="" style={{ height: 24 }} />
    </div>
  );
}

/* `panelClassName` — permite abrir este mesmo canvas como painel overlay
   (ex.: ocorrência aberta em My Assistant usa .initiative-doc-panel). */
/* Rótulo curto da subview para o breadcrumb do topbar (paridade com v3:
   [chip do id] · [título da subview]). */
function subViewBreadcrumbLabel(sub) {
  if (!sub) return null;
  if (sub.type === "order") return `#${sub.id}`;
  if (sub.type === "subtask") return sub.subtask?.title || "Tarefa";
  if (sub.type === "list") {
    return ({
      impacted: "Pedidos impactados",
      activities: "Atividades",
      duplicates: "Duplicidades",
      exceptions: "Exceções",
    })[sub.kind] || sub.kind;
  }
  return null;
}

function TaskCanvas({ task, onBack, chatOpen, onToggleChat, panelClassName, verification, onAgentMessage }) {
  /* Pilha de subviews (paridade v3 initiative-canvas-tool): permite encadear
     canvas → pedido → outro pedido → tarefa e voltar um nível por vez. O chip
     do id no topbar volta direto ao canvas (esvazia a pilha). */
  const [subStack, setSubStack] = useState([]);
  const subView = subStack.length > 0 ? subStack[subStack.length - 1] : null;
  /* Bebe do v3 (initiative-canvas-tool): slide-in on nav é acionado só depois
     da primeira navegação; primeira montagem não anima. */
  const [animateNav, setAnimateNav] = useState(false);
  const d = task.detail;

  /* Sem chat (ex.: ocorrência aberta em My Assistant) não há card de
     verificação em cena, mas o canvas ainda precisa de um estado para saber
     se a pergunta está pendente. */
  const ownVerification = useCanvasAVerification(d.verification);
  const verificationCtl = verification || ownVerification;

  /* O feed é montado aqui porque as duas superfícies que o consomem — o
     documento e a página cheia — precisam enxergar exatamente as mesmas
     atividades, inclusive as geradas depois da verificação. */
  const orders = d.affectedOrders || { total: 0, items: [] };
  const activities = [
    ...(d.activities || []),
    ...verificationActivities(task, verificationCtl, orders.total || orders.items.length),
  ];
  /* A consulta ao histórico completo só acontece na primeira visita: voltar
     para a lista depois disso não deve cobrar o carregamento de novo. */
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  const inSub = subView != null;
  const prevSubView = subStack.length > 1 ? subStack[subStack.length - 2] : null;

  /* Sub-view é navegação, não continuação da rolagem: entrar num pedido ou
     numa lista começa do topo. A posição do canvas fica guardada para a volta,
     senão o operador perde de vista a linha de onde saiu. */
  const scrollRef = useRef(null);
  const canvasScrollRef = useRef(0);

  const openSubView = (next) => {
    if (subStack.length === 0 && scrollRef.current) canvasScrollRef.current = scrollRef.current.scrollTop;
    setAnimateNav(true);
    setSubStack((s) => [...s, next]);
  };
  /* Volta um nível na pilha — canvas → pedido → outro pedido: `closeSubView`
     retorna ao pedido anterior; só quando a pilha esvazia é que o canvas
     reaparece. */
  const closeSubView = () => {
    setAnimateNav(true);
    setSubStack((s) => s.slice(0, -1));
  };
  /* Chip do id no topbar (CANVAS-A): pula qualquer nível intermediário e
     retorna ao canvas principal. */
  const resetToCanvas = () => {
    if (subStack.length === 0) return;
    setAnimateNav(true);
    setSubStack([]);
  };

  useLayoutEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = subView ? 0 : canvasScrollRef.current;
  }, [subView]);

  const openOrder = (id) => openSubView({ type: "order", id });
  /* Paridade com onTaskClick de tools/canvas/initiative/initiative-tasks.tsx
     do ai-workspace-shell-template@v3 — clicar numa linha de subtask abre o
     detalhe dela como subview do próprio canvas. */
  const openSubtask = (t) => openSubView({ type: "subtask", subtask: t });

  /* Pergunta do agente ainda sem resposta no chat — é ela que destrava a
     geração das tarefas, então o botão de chat ganha um ponto de alerta. */
  /* Enquanto o operador não confirmar (ou estiver editando uma resposta a
     partir do resumo revisável), o chat ainda tem trabalho pendente. */
  const chatQuestionPending =
    usesVerificationCanvas(task) && !!d.verification &&
    (!verificationCtl.confirmed || verificationCtl.editing);

  const initiativeChipId = task.id.replace(/^TA-/, "");
  const subLabel = subViewBreadcrumbLabel(subView);
  /* Botão "Voltar" sempre aponta para a página anterior na pilha: se veio de
     outro pedido, volta pro pedido; se está no primeiro nível, volta pro
     canvas. O chip do id no topbar cobre o atalho para voltar direto pro
     canvas de qualquer profundidade. */
  const backLabel = prevSubView ? subViewBreadcrumbLabel(prevSubView) : initiativeChipId;

  return (
    <div className={`detail-panel${panelClassName ? ` ${panelClassName}` : ""}`}>
      <div className="detail-head canvas-topbar" data-sl-canvas-tool-topbar="">
        <button className="canvas-topbar-icon" onClick={onBack} aria-label="Fechar" title="Fechar">
          <Icon name="x" size={18} />
        </button>
        {/* Breadcrumb v3: chip do id + separador · + rótulo da subview.
            Fora de subview, só o chip. */}
        <span className="canvas-topbar-title">
          {inSub ? (
            <button
              type="button"
              className="canvas-topbar-chip-btn"
              onClick={resetToCanvas}
              title={`Voltar para ${initiativeChipId}`}
              data-sl-initiative-table-id-chip=""
            >
              {initiativeChipId}
            </button>
          ) : (
            <span data-sl-initiative-table-id-chip="">{initiativeChipId}</span>
          )}
          {inSub && subLabel && (
            <>
              <span data-sl-initiative-canvas-breadcrumb-sep="" aria-hidden>·</span>
              <span data-sl-initiative-canvas-breadcrumb-task="">{subLabel}</span>
            </>
          )}
        </span>
        {onToggleChat && (
          <button
            className={`canvas-topbar-icon${chatOpen ? " active" : ""}${chatQuestionPending ? " canvas-topbar-icon--alert" : ""}`}
            onClick={onToggleChat}
            aria-label={
              chatQuestionPending
                ? `${chatOpen ? "Fechar chat" : "Abrir chat"} — pergunta pendente`
                : (chatOpen ? "Fechar chat" : "Abrir chat")
            }
            title={chatQuestionPending ? "Pergunta pendente no chat" : (chatOpen ? "Fechar chat" : "Abrir chat")}
          >
            <Icon name="chat" size={18} />
          </button>
        )}
        <button className="canvas-topbar-icon" aria-label="Mais opções" title="Mais opções">
          <Icon name="more" size={18} />
        </button>
      </div>
      <div className="detail-scroll" ref={scrollRef}>
        <div
          className="detail-body"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          data-sl-canvas-doc-view=""
          data-view={inSub ? "sub" : "main"}
          data-doc-nav-animation={animateNav ? "true" : undefined}
          key={inSub ? `sub-${subView.type}-${subView.id || subView.kind || subView.subtask?.title || ""}` : "main"}
        >
          {inSub && (
            <div data-sl-canvas-tool-back-wrap="">
              <button type="button" onClick={closeSubView} data-sl-canvas-tool-back="" aria-label={`Voltar para ${backLabel}`}>
                <Icon name="chevron-left" size={16} />
                <span>Voltar para {backLabel}</span>
              </button>
            </div>
          )}
          {subView?.type === "order" ? (
            <OrderDetailView
              task={task}
              orderId={subView.id}
              onBack={closeSubView}
              onOpenOrder={openOrder}
              initiativeLabel={initiativeChipId}
              onOpenInitiative={resetToCanvas}
            />
          ) : subView?.type === "list" ? (
            <TaskListSubview
              kind={subView.kind}
              task={task}
              onOpenOrder={openOrder}
              activities={activities}
              activitiesLoaded={activitiesLoaded}
              onActivitiesLoaded={() => setActivitiesLoaded(true)}
            />
          ) : subView?.type === "subtask" ? (
            <SubtaskDetailSubview subtask={subView.subtask} />
          ) : usesVerificationCanvas(task) ? (
            <CanvasPatternA
              task={task}
              onOpenOrder={openOrder}
              onOpenList={(kind) => openSubView({ type: "list", kind })}
              onOpenTask={openSubtask}
              verification={verificationCtl}
              onOpenChat={!chatOpen && onToggleChat ? onToggleChat : null}
              activities={activities}
            />
          ) : task.canvasPattern === "D" ? (
            <CanvasPatternD
              task={task}
              onOpenList={(kind) => openSubView({ type: "list", kind })}
              onOpenOrder={openOrder}
              onOpenTask={openSubtask}
              activities={activities}
              onAgentMessage={onAgentMessage}
            />
          ) : (
            <TaskCanvasMain
              task={task}
              onOpenOrder={openOrder}
              onOpenList={(kind) => openSubView({ type: "list", kind })}
              onOpenTask={openSubtask}
              activities={activities}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function TaskView({ taskId, onBack, onOpenOrder, initialChatOpen }) {
  const task = AIWData.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const d = task.detail;

  const [chatMsgs, setChatMsgs] = useState(d.chat || []);
  const [isTyping, setIsTyping] = useState(false);
  const engineRef = useRef(null);
  /* Iniciativa abre só com o canvas (v3 parity) — o chat só aparece quando o
     usuário aciona explicitamente, seja pelo botão no topbar do canvas, seja
     por "Ver conversa" numa tarefa do InitiativeDocumentPanel (initialChatOpen). */
  const [chatOpen, setChatOpen] = useState(!!initialChatOpen);

  useEffect(() => {
    setChatMsgs(d.chat || []);
    setIsTyping(false);
    setChatOpen(!!initialChatOpen);
    engineRef.current = ChatEngine.create({
      context: "task",
      data: AIWData,
      task: task,
      onNavigate: (route) => { if (onOpenOrder) onOpenOrder(route.orderId); },
      onAddFollowUp: (newItem) => {
        if (task.detail.followUp) task.detail.followUp.push(newItem);
      },
      onAgentSay: (msgs) => setChatMsgs((m) => [...m, ...msgs]),
      onTyping: setIsTyping,
    });
  }, [taskId]);

  const handleSend = (text) => {
    setChatMsgs((m) => [...m, { from: "user", text }]);
    engineRef.current && engineRef.current.send(text);
  };

  /* A árvore de decisão do Canvas A é respondida no chat e repercute no canvas
     — por isso o estado vive aqui, no pai comum das duas superfícies.
     O card fica ancorado acima do composer durante toda a árvore, sem fechar
     entre uma pergunta e outra; só quando ela fecha é que ele sai de cena e o
     resumo passa para dentro da conversa (fim do chat-body). */
  const verification = useCanvasAVerification(d.verification);
  const hasVerification = usesVerificationCanvas(task) && !!d.verification;
  const affectedOrders = (d.affectedOrders && d.affectedOrders.items) || [];
  /* Três fases no chat:
     • asking: alguma pergunta ainda em aberto (inclusive edição a partir do
       resumo revisável) — card acima do composer.
     • review: todas respondidas mas ainda não confirmado — resumo editável
       + botão "Confirmar e enviar para o canvas".
     • final: confirmado — resumo read-only + mensagem do agente com o que
       foi criado no canvas. */
  const asking = !verification.closed || verification.editing;
  const inReview = hasVerification && !asking && !verification.confirmed;
  const inFinal = hasVerification && !asking && verification.confirmed;
  const verificationCard = hasVerification && asking ? (
    <CanvasAVerificationCard ctl={verification} orders={affectedOrders} />
  ) : inReview ? (
    /* Etapa de revisão fica ancorada acima do composer, igual à etapa de
       perguntas: o Confirmar precisa continuar visível mesmo se o chat
       rolar. */
    <CanvasAVerifySummaryCard ctl={verification} orders={affectedOrders} mode="review" />
  ) : null;
  const verificationAnswer = inFinal ? (
    <>
      <CanvasAVerifySummaryCard ctl={verification} orders={affectedOrders} mode="final" />
      <CanvasAVerifyOutcomeMessage ctl={verification} orders={affectedOrders} />
    </>
  ) : null;

  return (
    <ResizableSplit screenLabel={`02 Task ${taskId}`} initialWidth={400} chatOpen={chatOpen}>
      <ChatPanel
        title={d.title}
        messages={chatMsgs}
        onSend={handleSend}
        isTyping={isTyping}
        placeholder={`Pergunte sobre a iniciativa ${task.id}…`}
        aboveComposer={verificationCard}
        bodyFooter={verificationAnswer}
        onBack={() => setChatOpen(false)} />
      <TaskCanvas
        task={task}
        onBack={onBack}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen((o) => !o)}
        verification={verification}
        /* Canvas D avisa o chat quando a fila de tickets fecha: o agente
           publica uma mensagem com o resumo dos desfechos. */
        onAgentMessage={(msgs) => setChatMsgs((m) => [...m, ...msgs])}
      />
    </ResizableSplit>
  );
}

window.OrderDetailView = OrderDetailView;
window.TaskView = TaskView;
window.TaskCanvas = TaskCanvas;