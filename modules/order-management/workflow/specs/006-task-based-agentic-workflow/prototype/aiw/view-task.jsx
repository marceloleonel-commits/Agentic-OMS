/* global React, Icon, IconCopy, IconArrowUpRight, AIWData, ChatPanel, ChatEngine, SevPill, PersonAvatar */
const { useState, useRef, useEffect, useCallback } = React;

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

function SubTaskRow({ t, runnable }) {
  let icon;
  if (t.state === "loading") icon = <span className="spinner" />;else
  if (t.state === "attention") icon = <span className="task-pending" />;else
  icon = <Icon name="check" size={13} />;
  return (
    <div className="canvas-task-row">
      <div className="canvas-task-left">
        {runnable ?
        <button className="task-run-btn" title="Run task">
            <Icon name="play" size={10} />
          </button> :

        <span className="canvas-task-state">{icon}</span>
        }
        <span className="canvas-task-title">{t.title}</span>
      </div>
      <button className="assignee-pill">
        <PersonAvatar initial={t.initial} agent={t.agent} />
        <span>{t.assignee}</span>
        <Icon name="chevron-down" size={12} />
      </button>
    </div>);

}

/* ---------- Order detail sub-view ---------- */

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

  const executor = step.agent ? "OMS Agent" : (step.executedBy || "Manual");

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

/* ── Atividades executadas — colapsada por padrão, dentro da experiência ── */
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
function PackageCard({ group, index, order, onOpenProduct }) {
  const [open, setOpen] = useState(true);
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

  // Stage badge color
  const stageBg    = isCanceling ? "#FEF2F2" : isReturn ? "#FFF7ED" : allDone ? "#F0FDF4" : "#D1FAE5";
  const stageColor = isCanceling ? "#DC2626"  : isReturn ? "#C2410C"  : allDone ? "#059669" : "#059669";

  const stageLabel = allDone ? "Entregue" : currentStage ? currentStage.label : "—";

  // Compute total for this group
  const groupTotal = fmtBRL(
    (group.items || []).reduce((sum, item) => sum + parseBRL(item.price) * (item.qty || 1), 0)
  );

  // Delivery date from order
  const deliveryDate = order && order.eta ? order.eta : "—";
  const soldBy = order && order.seller ? order.seller : "—";
  const shippedBy = group.supplier || "—";

  // Experience name: first segment of group.label (before " · ")
  const experienceName = group.label ? group.label.split(" · ")[0] : "Experiência";

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
          <span className="pkg-stage-badge" style={{ background: stageBg, color: stageColor }}>
            {stageLabel}
          </span>
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
              <span className="pkg-meta-key">{experienceName} by:</span>
              <span className="pkg-meta-val">{shippedBy}</span>
            </div>
          </div>

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
            <div className="pkg-footer-actions">
              {trackingNumber && (
                <button className="pkg-footer-btn" title="Código de Rastreio">
                  <IconCopy size={14} />
                  {trackingNumber}
                </button>
              )}
              {invoiceNumber && (
                <button className="pkg-footer-btn" title="Abrir eNF">
                  <IconArrowUpRight size={14} />
                  {invoiceNumber}
                </button>
              )}
            </div>
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
function ProductDetailView({ allProducts, productIdx, order, onNavigate }) {
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
                <span className="prod-detail-card-label">Acquired</span>
                <span className="prod-detail-card-value">{item.price}</span>
              </div>
              <div className="prod-detail-card-row">
                <span className="prod-detail-card-label">Full Price</span>
                <span className="prod-detail-card-value">{fmtBRL(itemTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions section */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Promotions Included</h3></div>
        <div style={{ padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="prod-promo-row">
            <div>
              <div className="prod-promo-name">VTEX Day 15% OFF</div>
              <div className="prod-promo-sub">Promoção aplicada automaticamente · Cumulativa</div>
            </div>
            <span className="prod-promo-val">−R$ 17,99</span>
          </div>
          <div className="prod-promo-row prod-promo-row--last">
            <div>
              <div className="prod-promo-name">Frete Grátis · Marketplace</div>
              <div className="prod-promo-sub">Cupom marketplace · Não cumulativa</div>
            </div>
            <span className="prod-promo-val">−R$ 19,90</span>
          </div>
        </div>
      </section>

      {/* Workflow section */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Workflow</h3></div>
        <div className="pkg-wf-expand">
          {currentSteps.length > 1 && firstNonDoneIdx >= 0 && (
            <div className="pkg-wf-prev-toggle-row">
              <button className="pkg-wf-prev-toggle-btn" onClick={() => setShowNextSteps(v => !v)}>
                {showNextSteps ? "Ocultar próximas etapas" : "Carregar próximas etapas"}
              </button>
            </div>
          )}
          {firstNonDoneIdx < 0 && [...currentSteps].reverse().map(({ step, stageLabel: sl, stageIcon: si }, ti) => (
            <OdStepRow key={`next-${ti}`} step={step} stageLabel={sl} stageIcon={si} />
          ))}
          {firstNonDoneIdx >= 0 && showNextSteps && [...currentSteps.slice(1)].reverse().map(({ step, stageLabel: sl, stageIcon: si }, ti) => (
            <OdStepRow key={`next-${ti}`} step={step} stageLabel={sl} stageIcon={si} />
          ))}
          {firstNonDoneIdx >= 0 && currentSteps.length > 0 && (
            <OdStepRow key="active" step={currentSteps[0].step} stageLabel={currentSteps[0].stageLabel} stageIcon={currentSteps[0].stageIcon} />
          )}
          {[...allDoneSteps].reverse().map(({ step, stageLabel: sl, stageIcon: si }, ti) => (
            <OdStepRow key={`done-${ti}`} step={step} stageLabel={sl} stageIcon={si} />
          ))}
        </div>
      </section>
    </div>
  );
}

function OrderDetailView({ task, orderId, onBack, onOpenOrder, standalone = false, productView: externalProductView, onProductViewChange }) {
  const [internalProductView, setInternalProductView] = React.useState(null);
  // When used from app.jsx (standalone), productView is lifted to the parent via props
  const productView    = externalProductView !== undefined ? externalProductView : internalProductView;
  const setProductView = onProductViewChange  !== undefined ? onProductViewChange  : setInternalProductView;
  const impacted = task.detail.impacted;
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
      <ProductDetailView
        allProducts={allProducts}
        productIdx={safeIdx}
        order={fullOrder}
        onNavigate={(newIdx) => {
          const p = allProducts[newIdx];
          if (p) setProductView({ groupIdx: p.groupIdx, itemIdx: p.itemIdx });
        }}
      />
    );
  }

  return (
    <div className="od-view">
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
      {(() => {
        const STATUS_MAP = {
          processing: { label: "Em andamento",    dot: "#08A822", bg: "#E9FCE3" },
          invoiced:   { label: "Em andamento",    dot: "#08A822", bg: "#E9FCE3" },
          return:     { label: "Ação Necessária", dot: "#C2410C", bg: "#FFF7ED" },
          error:      { label: "Com erro",        dot: "#DC2626", bg: "#FEF2F2" },
          complete:   { label: "Resolvido",       dot: "#059669", bg: "#F0FDF4" },
          canceled:   { label: "Cancelado",       dot: "#6B7280", bg: "#F3F4F6" },
        };
        const statusInfo = (fullOrder && STATUS_MAP[fullOrder.status]) || { label: "Em andamento", dot: "#08A822", bg: "#E9FCE3" };

        return (
          <dl className="detail-fields od-meta">
            <dt>Status</dt>
            <dd>
              <span className="od-status-pill" style={{ background: statusInfo.bg }}>
                <span className="status-dot" style={{ background: statusInfo.dot }} />
                {statusInfo.label}
              </span>
            </dd>

            <dt>Sold by</dt>
            <dd>{order.seller}</dd>

            <dt>Order Placed at</dt>
            <dd>Jan 25, 2026 at 1:35 PM</dd>

            <dt>Last Update</dt>
            <dd>2 minutes ago</dd>
          </dl>
        );
      })()}

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

function TaskCanvasMain({ task, status, setStatus, onOpenOrder }) {
  const d = task.detail;
  return (
    <React.Fragment>
      <h1 className="detail-title">{d.title}</h1>

      <dl className="detail-fields">
        <dt>Atribuído a</dt>
        <dd>
          <span className="lead-pill">
            <PersonAvatar initial={d.attributedTo.initial} />
            <span>{d.attributedTo.name}</span>
            <Icon name="chevron-down" size={12} />
          </span>
        </dd>

        <dt>Status</dt>
        <dd><StatusSegmented value={status} onChange={setStatus} /></dd>

        <dt>Severidade</dt>
        <dd><SevPill level={d.severity} /></dd>

        <dt>Reportado por</dt>
        <dd>
          <span className="reporter">
            <span className="reporter-emoji" style={{ background: "linear-gradient(135deg,#9747FF,#FF3D6E)", color: "#fff" }}>
              <Icon name="sparkle" size={11} />
            </span>
            <span><b>{d.reportedBy.agent}</b> em {d.reportedBy.at}</span>
          </span>
        </dd>

        <dt>Resumo</dt>
        <dd style={{ alignItems: "flex-start" }}><span style={{ lineHeight: 1.55 }}>{d.summary}</span></dd>
      </dl>

      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Diagnóstico</h3></div>
        <p className="detail-section-body">{d.diagnosis}</p>
      </section>

      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Tarefas</h3></div>
        <div className="canvas-tasks-card">
          <div className="canvas-tasks-head"><span>Tarefas de follow-up</span><span>Responsável</span></div>
          {d.followUp.map((t, i) =>
            <React.Fragment key={`fu-${i}`}>
              {i > 0 && <div className="canvas-tasks-row-divider" />}
              <SubTaskRow t={t} runnable />
            </React.Fragment>
          )}
          <div className="canvas-tasks-group-divider" />
          <div className="canvas-tasks-head"><span>Tarefas anteriores / resolvidas</span><span>Responsável</span></div>
          {d.resolved.map((t, i) =>
            <React.Fragment key={`rs-${i}`}>
              {i > 0 && <div className="canvas-tasks-row-divider" />}
              <SubTaskRow t={t} />
            </React.Fragment>
          )}
        </div>
      </section>

      <section className="detail-section flush">
        <div className="detail-section-head" style={{ justifyContent: "space-between" }}>
          <h3>Pedidos impactados</h3>
          <button className="icon-btn"><Icon name="arrow-up-right" size={14} /></button>
        </div>
        <div className="impacted-table">
          <div className="impacted-thead">
            <span>ID do pedido</span>
            <span>SLA restante</span>
            <span>Seller / Localização</span>
            <span>Entrega estimada</span>
          </div>
          {d.impacted.map((o, i) =>
            <button key={i} className="impacted-row" onClick={() => onOpenOrder(o.id)}>
              <span className="impacted-id">{o.id}</span>
              <span>{o.sla}</span>
              <span>{o.seller}</span>
              <span>{o.eta}</span>
            </button>
          )}
        </div>
      </section>

      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Atividades</h3></div>
        <div className="activities">
          {d.activities.map((a, i) =>
            <div key={i} className="activity-row">
              <span className="activity-time">{a.time}</span>
              <div className="activity-body">
                <div className="activity-head">
                  <PersonAvatar initial={a.initial} agent={a.agent} />
                  <span>
                    <strong>{a.actor}</strong> <span className="muted">{a.action}</span>
                  </span>
                </div>
                {a.note && <div className="activity-note">{a.note}</div>}
              </div>
            </div>
          )}
        </div>
      </section>

      <div style={{ height: 40 }} />
    </React.Fragment>
  );
}

function TaskCanvas({ task, onBack }) {
  const [status, setStatus] = useState("in_progress");
  const [subView, setSubView] = useState(null);
  const d = task.detail;

  const inOrder = subView?.type === "order";

  return (
    <div className="detail-panel">
      <div className="detail-head no-border">
        <div className="detail-head-left">
          {inOrder ? (
            <button className="od-back-link" onClick={() => setSubView(null)}>
              <Icon name="chevron-left" size={12} /> Voltar para {task.id}
            </button>
          ) : (
            <>
              <span className="id-chip">{task.id}</span>
              <span className="canvas-name" style={{ maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.title}</span>
            </>
          )}
        </div>
        <div className="detail-head-right">
          <span className="canvas-meta-count"><Icon name="chat" size={14} /> 7</span>
          <span className="canvas-meta-count"><Icon name="plus" size={14} /> 3</span>
          <button className="icon-btn"><Icon name="more" size={16} /></button>
        </div>
      </div>
      <div className="detail-scroll">
        <div className="detail-body">
          {inOrder ?
          <OrderDetailView task={task} orderId={subView.id} onBack={() => setSubView(null)} onOpenOrder={(id) => setSubView({ type: "order", id })} /> :
          <TaskCanvasMain task={task} status={status} setStatus={setStatus} onOpenOrder={(id) => setSubView({ type: "order", id })} />
          }
        </div>
      </div>
    </div>);

}

function TaskView({ taskId, onBack, onOpenOrder }) {
  const task = AIWData.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const d = task.detail;

  const [chatMsgs, setChatMsgs] = useState(d.chat || []);
  const [isTyping, setIsTyping] = useState(false);
  const engineRef = useRef(null);

  useEffect(() => {
    setChatMsgs(d.chat || []);
    setIsTyping(false);
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

  const chips = task.chips || [];

  const handleSend = (text) => {
    setChatMsgs((m) => [...m, { from: "user", text }]);
    engineRef.current && engineRef.current.send(text);
  };

  const intro = `Reportada por ${d.reportedBy.agent} · ${d.reportedBy.at}`;

  return (
    <ResizableSplit screenLabel={`02 Task ${taskId}`} initialWidth={400}>
      <ChatPanel
        title={d.title}
        intro={intro}
        chips={chips}
        messages={chatMsgs}
        onSend={handleSend}
        isTyping={isTyping}
        placeholder={`Pergunte sobre a iniciativa ${task.id}…`}
        onBack={onBack} />
      <TaskCanvas task={task} onBack={onBack} />
    </ResizableSplit>
  );
}

window.OrderDetailView = OrderDetailView;
window.TaskView = TaskView;