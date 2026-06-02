/* global React, Icon, AIWData, ChatPanel, ChatEngine */
const { useState, useRef, useEffect, useCallback } = React;

function SevPill({ level }) {
  const map = { high: "Alta", medium: "Média", low: "Baixa" };
  return (
    <span className={`sev sev-${level}`}>
      {level === "high" && <span className="dot" />}
      {map[level]}
    </span>);

}

function PersonAvatar({ initial, agent }) {
  if (agent) {
    return <span className="agent-avatar-mini" title="Agent"><Icon name="sparkle" size={12} /></span>;
  }
  return <span className="person-avatar">{initial}</span>;
}

function StatusSegmented({ value, onChange }) {
  const opts = [
  { id: "todo", label: "A fazer" },
  { id: "in_progress", label: "Em progresso" },
  { id: "done", label: "Concluída" }];

  return (
    <div className="status-seg">
      {opts.map((o) =>
      <button key={o.id}
      className={`status-seg-btn ${value === o.id ? "active" : ""}`}
      onClick={() => onChange && onChange(o.id)}>
          {o.label}
        </button>
      )}
    </div>);

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

const ORDER_CUSTOMERS = [
{ name: "Gilberto Gomes", taxId: "990.800.044-77", phone: "+55 21 99230-0420", email: "gilberto.gomes@gmail.com", address: "R Oswaldo Cruz, 97 apt, Flamengo · Rio de Janeiro, RJ - 22230-090" },
{ name: "Ana Carolina Souza", taxId: "432.110.985-22", phone: "+55 11 97632-1010", email: "ana.souza@gmail.com", address: "Av Paulista, 1230 apt 502 · São Paulo, SP - 01310-100" },
{ name: "Lucas Oliveira", taxId: "187.554.330-09", phone: "+55 31 99877-3422", email: "lucas.oliv@gmail.com", address: "R Pernambuco, 540 · Belo Horizonte, MG - 30130-150" },
{ name: "Juliana Costa", taxId: "654.001.882-30", phone: "+55 71 98123-7766", email: "juliana.costa@gmail.com", address: "R Chile, 88 apt 102 · Salvador, BA - 40020-000" }];

const ORDER_CARDS = ["VISA •••• 0200", "Mastercard •••• 7842", "AMEX •••• 1024", "VISA •••• 4321"];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
  return Math.abs(h);
}

function buildOrderDetail(order) {
  const seed = hashStr(order.id);
  const c = ORDER_CUSTOMERS[seed % ORDER_CUSTOMERS.length];
  const card = ORDER_CARDS[(seed >> 3) % ORDER_CARDS.length];
  const carrier = ["Loggi", "Total Express", "Correios SEDEX", "Jadlog"][(seed >> 5) % 4];
  const products = [
  { name: "Running Shoes Pro 42", sku: "139834190834", qty: 1, listPrice: 100.0, finalPrice: 90.0, tax: 10, severity: "Handling", promos: "2 promotions" },
  { name: "Kit Meias 6 pares", sku: "247109880221", qty: 1, listPrice: 45.0, finalPrice: 45.0, tax: 5, severity: "Manufacturing", promos: null }];

  const subtotal = products.reduce((s, p) => s + p.listPrice, 0);
  const taxes = products.reduce((s, p) => s + p.tax, 0);
  const discounts = products.reduce((s, p) => s + (p.listPrice - p.finalPrice), 0);
  const total = subtotal + taxes - discounts;

  // current stage from SLA hours
  const slaNum = parseInt(order.sla, 10);
  let stageIdx = 1;
  if (Number.isFinite(slaNum)) {
    if (slaNum < 8) stageIdx = 2;else
    if (slaNum < 24) stageIdx = 1;else
    stageIdx = 0;
  }
  const stages = [
  { label: "Preparing for Carrier", time: "05/11/2024 18:00" },
  { label: "Collecting", time: stageIdx >= 1 ? "05/11/2024 18:00" : "" },
  { label: "Out for Delivery", time: stageIdx >= 2 ? "Now" : "" },
  { label: "Proof of Delivery", time: stageIdx >= 3 ? "05/11/2024 16:20" : "" }];


  const activities = [
  { time: "14/10 10:02", actor: "Sistema", system: true, action: `criou o pedido ${order.id}`, note: `Cliente: ${c.name} · ${c.email}` },
  { time: "14/10 10:03", actor: "Gateway", agent: true, action: "autorizou a cobrança no cartão" },
  { time: "14/10 11:18", actor: "OMS Agent", agent: true, action: `encaminhou o pedido ao ${order.seller}` }];

  if (stageIdx >= 1) activities.push({ time: "14/10 14:42", actor: "WMS", system: true, action: "iniciou separação no centro de distribuição" });
  if (stageIdx >= 2) activities.push({ time: "15/10 08:20", actor: carrier, system: true, action: "coletou o pacote", note: "Rastreio enviado ao cliente por e-mail." });
  if (stageIdx >= 2) activities.push({ time: "15/10 11:05", actor: "Order Management Agent", agent: true, action: "sinalizou risco de quebra de SLA", note: `Pedido em rota com folga inferior a ${order.sla}.` });

  return { customer: c, card, carrier, products, breakdown: { subtotal, taxes, discounts, total }, stages, stageIdx, activities };
}

/* ══════════════════════════════════════════════════════════
   Item Groups / Raias  (Itens do Pedido — Tarefas por Item)
   ══════════════════════════════════════════════════════════ */

// Usa dados explícitos do pedido (fullOrder.itemGroups) quando disponíveis
function buildOrderItemGroups(fullOrder) {
  return (fullOrder && fullOrder.itemGroups) ? fullOrder.itemGroups : [];
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
function OdStepRow({ step }) {
  const colorMap = { done: "#169B61", active: "var(--primary)", pending: "#D1D5DB" };
  const labelMap = { done: "Concluído", active: "Em andamento", pending: "Pendente" };
  const badgeMap = {
    done:    { bg: "#F0FDF4",             color: "#169B61",        border: "#BBF7D0" },
    active:  { bg: "var(--primary-soft)", color: "var(--primary)", border: "var(--primary)" },
    pending: { bg: "#F9FAFB",             color: "var(--fg-3)",    border: "var(--border)"  },
  };
  const b  = badgeMap[step.status] || badgeMap.pending;
  const lc = colorMap[step.status] || colorMap.pending;
  return (
    <div className="od-step-row">
      <div className="od-step-bar" style={{ background: step.cancelSignal ? "#EF4444" : lc }} />
      <div className="od-step-content">
        <div className="od-step-head">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="od-step-label" style={{ color: lc }}>{step.label}</span>
            {step.cancelSignal && (
              <span style={{ fontSize: 10, fontWeight: 700, background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: 6, padding: "1px 7px" }}>
                ⚠ Cancelamento sinalizado
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="od-step-badge" style={{ background: b.bg, color: b.color, borderColor: b.border }}>
              {labelMap[step.status]}
            </span>
            <Icon name="chevron-right" size={14} />
          </div>
        </div>
        {step.agent && step.time && (
          <div className="od-step-trigger">
            <Icon name="sparkle" size={10} />
            Acionado por Agente AI · {step.time}
          </div>
        )}
        {step.note && !step.time && (
          <div className="od-step-trigger" style={{ color: "var(--fg-2)" }}>
            <Icon name="clock" size={10} />
            {step.note}
          </div>
        )}
        {step.note && step.time && (
          <div className="od-step-trigger" style={{ color: "var(--fg-2)", marginTop: 2 }}>
            {step.note}
          </div>
        )}
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

  return (
    <div style={{ borderTop: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px 8px 16px", background: s.bg, border: "none",
          cursor: "pointer", textAlign: "left",
          borderLeft: `3px solid ${s.dot}`,
        }}
      >
        {icon && <span style={{ fontSize: 13, lineHeight: 1 }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--fg)" }}>{label}</span>
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
      const stageSteps = item.steps.filter(s => taskNames.has(s.label));
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
          ? groupedSteps.map((sg, i) => (
              <OdStageGroup key={i} label={sg.label} icon={sg.icon} status={sg.status} steps={sg.steps} />
            ))
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

function fmtCurrency(v) {
  return v.toFixed(2).replace(".", ",") + " USD";
}

function Field({ label, value }) {
  return (
    <div className="od-field">
      <div className="od-field-label">{label}</div>
      <div className="od-field-value">{value}</div>
    </div>);

}

function OrderDetailView({ task, orderId, onBack, onOpenOrder }) {
  const impacted = task.detail.impacted;
  const idx = impacted.findIndex((o) => o.id === orderId);
  const order = impacted[idx];
  if (!order) return null;
  const d = buildOrderDetail(order);

  // Full order data (for item groups — has qty, status, date)
  const fullOrder = AIWData.orders.find(o => o.id === orderId);
  const itemGroups = buildOrderItemGroups(fullOrder);
  const totalItems = itemGroups.reduce((s, g) => s + g.items.length, 0);

  const prev = idx > 0 ? impacted[idx - 1] : null;
  const next = idx < impacted.length - 1 ? impacted[idx + 1] : null;

  return (
    <div className="od-view">
      <div className="od-header">
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

        <h1 className="detail-title">Pedido {orderId}</h1>
      </div>

      {/* Order metadata */}
      <dl className="detail-fields od-meta">
        <dt>Sold by</dt>
        <dd>{order.seller}</dd>

        <dt>Order Placed at</dt>
        <dd>Jan 25, 2026 at 1:35 PM</dd>

        <dt>Last Update</dt>
        <dd>2 minutes ago</dd>
      </dl>

      {/* Nota do caso de uso */}
      {fullOrder && fullOrder.note && <OdNote note={fullOrder.note} seller={fullOrder.seller} />}

      {/* Itens do Pedido — Tarefas por Item */}
      <section className="detail-section flush">
        <div className="detail-section-head" style={{ alignItems: "center" }}>
          <h3>
            Itens do Pedido — Tarefas por Item
            <span className="od-items-badge">{totalItems} iten{totalItems !== 1 ? "s" : ""}</span>
          </h3>
        </div>
        <div className="od-rails">
          {itemGroups.map((group) => <OdRail key={group.id} group={group} />)}
        </div>
      </section>



      {/* Customer */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Customer</h3></div>
        <div className="od-fields">
          <Field label="Customer" value={d.customer.name} />
          <Field label="Tax ID" value={d.customer.taxId} />
          <Field label="Phone" value={d.customer.phone} />
          <Field label="Email" value={d.customer.email} />
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

      {/* Payment */}
      <section className="detail-section flush">
        <div className="detail-section-head"><h3>Payment</h3></div>
        <div className="od-fields">
          <Field label="Endereço de cobrança" value={d.customer.address} />
          <Field label="Cobrança" value={"R$ " + d.breakdown.total.toFixed(2).replace(".", ",")} />
          <Field label="Data" value={"14 de outubro de 2024"} />
          <Field label="Cartão" value={d.card} />
        </div>
      
        <div style={{ marginTop: 20 }} />
        <div className="od-breakdown">
          <div className="od-bd-row"><span>Items</span>     <span>{fmtCurrency(d.breakdown.subtotal)}</span></div>
          <div className="od-bd-row"><span>Discounts</span> <span>- {fmtCurrency(d.breakdown.discounts)}</span></div>
          <div className="od-bd-row"><span>Taxes</span>     <span>{fmtCurrency(d.breakdown.taxes)}</span></div>
          <div className="od-bd-row"><span>Shipping</span>  <span>Free</span></div>
        </div>
        <div className="od-bd-total">
          <span>Total</span>
          <span>{fmtCurrency(d.breakdown.total)}</span>
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

  const [chatWidth, setChatWidth] = useState(460);
  const dragRef = useRef(false);
  const rootRef = useRef(null);

  // Chat engine state
  const [chatMsgs, setChatMsgs] = useState(d.chat || []);
  const [isTyping, setIsTyping] = useState(false);
  const engineRef = useRef(null);

  // Initialise / re-initialise engine when taskId changes
  useEffect(() => {
    setChatMsgs(d.chat || []);
    setIsTyping(false);
    engineRef.current = ChatEngine.create({
      context: "task",
      data: AIWData,
      task: task,
      onNavigate: (route) => { if (onOpenOrder) onOpenOrder(route.orderId); },
      onAddFollowUp: (newItem) => {
        // Add to task's followUp array in-memory (prototype only)
        if (task.detail.followUp) task.detail.followUp.push(newItem);
      },
      onAgentSay: (msgs) => setChatMsgs((m) => [...m, ...msgs]),
      onTyping: setIsTyping,
    });
  }, [taskId]);

  // Drag-to-resize
  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current || !rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const next = Math.max(320, Math.min(900, e.clientX - rect.left));
      setChatWidth(next);
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = false;
      document.body.classList.remove("resizing-x");
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  const chips = [
    { icon: "list",    label: "Summarize the initiative"                  },
    { icon: "plus",    label: "+ create new task"                         },
    { icon: "sparkle", label: "Suggest next steps"                        },
    { icon: "search",  label: "Analize impacted orders and sugest actions" }
  ];

  const handleSend = (text) => {
    setChatMsgs((m) => [...m, { from: "user", text }]);
    engineRef.current && engineRef.current.send(text);
  };

  const intro = `Reportada por ${d.reportedBy.agent} · ${d.reportedBy.at}`;

  return (
    <div
      ref={rootRef}
      className="main split-main resizable-split"
      style={{ gridTemplateColumns: `${chatWidth}px 6px 1fr` }}
      data-screen-label={`02 Task ${taskId}`}>

      <ChatPanel
        title={d.title}
        intro={intro}
        chips={chips}
        messages={chatMsgs}
        onSend={handleSend}
        isTyping={isTyping}
        placeholder={`Pergunte sobre a iniciativa ${task.id}…`}
        onBack={onBack} />
      
      <div
        className="split-resizer"
        onMouseDown={(e) => {
          e.preventDefault();
          dragRef.current = true;
          document.body.classList.add("resizing-x");
        }}
        title="Arraste para redimensionar">
        
        <span className="split-resizer-grip" />
      </div>
      <TaskCanvas task={task} onBack={onBack} />
    </div>);

}

window.OrderDetailView = OrderDetailView;
window.TaskView = TaskView;