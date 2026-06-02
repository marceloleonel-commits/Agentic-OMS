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

const OD_STAGE_DEFS = [
  { key: "payment",     icon: "💳", label: "Confirmação de Pagamentos" },
  { key: "preparation", icon: "📦", label: "Preparando os itens"        },
  { key: "invoice",     icon: "🧾", label: "NFes Emitidas"              },
  { key: "delivery",    icon: "🚚", label: "Recebido pelo Cliente"       },
];

const OD_PRODUCT_POOL = [
  { name: "Tênis Running Air Pro",        price: "R$ 249,90" },
  { name: "Camiseta Premium Slim Fit",    price: "R$ 89,90"  },
  { name: "Kit Meias Esportivas 6 pares", price: "R$ 45,00"  },
  { name: "Mochila Urban 25L",            price: "R$ 189,90" },
  { name: "Polo Masculina Bordada",       price: "R$ 119,90" },
  { name: "Calça Jogger Cargo",           price: "R$ 159,90" },
  { name: "Bermuda Surf Quick-dry",       price: "R$ 79,90"  },
  { name: "Mouse Ergonômico sem fio",     price: "R$ 149,90" },
  { name: "Fone Bluetooth Over-ear",      price: "R$ 399,90" },
  { name: "Óculos de Sol Polarizado",     price: "R$ 229,90" },
];

function buildOrderItemGroups(fullOrder) {
  if (!fullOrder) return [];
  const seed     = hashStr(fullOrder.id);
  const status   = fullOrder.status || "processing";
  const qty      = fullOrder.qty    || 2;
  const datePfx  = (fullOrder.date  || "13/05/2026 - 16:48").slice(0, 10).replace(/-/g, "/");

  const progress = { pending: 0, processing: 2, invoiced: 3, delivered: 4 }[status] ?? 1;
  const carriers  = ["Jadlog", "Total Express", "Correios SEDEX", "Loggi"];
  const groupTypes = ["Separação e Envio", "Fulfillment Parceiro", "Envio Expresso", "Cross-docking"];

  function stageStatus(idx, prog) {
    return idx < prog ? "done" : idx === prog ? "active" : "pending";
  }
  function makeStages(prog) {
    return OD_STAGE_DEFS.map((def, i) => ({ ...def, status: stageStatus(i, prog) }));
  }
  function makeItems(startIdx, count, prog) {
    const stepHours = [14, 15, 16, 18];
    const items = [];
    for (let i = 0; i < count; i++) {
      const p = OD_PRODUCT_POOL[(seed + startIdx + i) % OD_PRODUCT_POOL.length];
      items.push({
        name:  p.name,
        sku:   String(100000 + (seed % 899900) + startIdx + i),
        qty:   1,
        price: p.price,
        steps: OD_STAGE_DEFS.map((def, si) => ({
          ...def,
          status: stageStatus(si, prog),
          agent:  si === 0 || si === 2,    // payment + invoice triggered by agent
          time:   si < prog
            ? `${datePfx} ${String(stepHours[si] || 14).padStart(2, "0")}:${si % 2 === 0 ? "00" : "30"}`
            : null,
        })),
      });
    }
    return items;
  }

  const g1Count = Math.max(1, Math.floor(qty / 2));
  const g2Count = qty - g1Count;

  const groups = [{
    id:     "g1",
    label:  `${groupTypes[seed % groupTypes.length]} · ${carriers[seed % carriers.length]}`,
    stages: makeStages(progress),
    items:  makeItems(0, g1Count, progress),
  }];

  if (g2Count > 0) {
    const g2Progress = Math.max(0, progress - 1);
    groups.push({
      id:     "g2",
      label:  `${groupTypes[(seed + 1) % groupTypes.length]} · ${carriers[(seed + 1) % carriers.length]}`,
      stages: makeStages(g2Progress),
      items:  makeItems(g1Count, g2Count, g2Progress),
    });
  }

  return groups;
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
    done:    { bg: "#F0FDF4",             color: "#169B61",         border: "#BBF7D0" },
    active:  { bg: "var(--primary-soft)", color: "var(--primary)",  border: "var(--primary)" },
    pending: { bg: "#F9FAFB",             color: "var(--fg-3)",     border: "var(--border)" },
  };
  const b  = badgeMap[step.status] || badgeMap.pending;
  const lc = colorMap[step.status] || colorMap.pending;
  return (
    <div className="od-step-row">
      <div className="od-step-bar" style={{ background: lc }} />
      <div className="od-step-content">
        <div className="od-step-head">
          <span className="od-step-label" style={{ color: lc }}>{step.label}</span>
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
      </div>
    </div>
  );
}

/* ── Item row (colapsado por padrão) ── */
function OdItemRow({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="od-item-row">
      <button className="od-item-head" onClick={() => setOpen(o => !o)}>
        <div className="od-item-thumb" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="od-item-name">{item.name}</div>
          <div className="od-item-meta">Qtd: {item.qty} · {item.price} · SKU {item.sku}</div>
        </div>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"
             style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", color: "var(--fg-3)" }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="od-item-steps">
          {item.steps.map((step, i) => <OdStepRow key={i} step={step} />)}
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
  const dotColor = active ? "var(--primary)" : done === total ? "#169B61" : "#D1D5DB";
  return (
    <div className="od-rail">
      <button className="od-rail-header" onClick={() => setOpen(o => !o)}>
        <div className="od-rail-left">
          <span className="od-rail-dot" style={{ background: dotColor }} />
          <div>
            <div className="od-rail-name">{group.label}</div>
            <div className="od-rail-meta">
              {group.items.length} item{group.items.length !== 1 ? "s" : ""} · {done}/{total} etapas concluídas
              {active && <span style={{ color: "var(--primary)", marginLeft: 6 }}>· {active.label}</span>}
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
          <div className="od-stage-strip">
            {group.stages.map((st, i) => <OdStageCard key={i} stage={st} />)}
          </div>
          <div className="od-rail-items">
            {group.items.map((item, i) => <OdItemRow key={i} item={item} />)}
          </div>
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
        <dt>Status</dt>
        <dd>
          <span className="od-status-pill attention">
            <span className="status-dot attention" /> Attention
          </span>
        </dd>

        <dt>Workflow Status</dt>
        <dd>
          <span className="od-wf-pill">{d.workflowStatus || "Handling"}</span>
        </dd>

        <dt>Sold by</dt>
        <dd>{order.seller}</dd>

        <dt>Order Placed at</dt>
        <dd>Jan 25, 2026 at 1:35 PM</dd>

        <dt>Last Update</dt>
        <dd>2 minutes ago</dd>
      </dl>

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



      {/* Activities */}
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