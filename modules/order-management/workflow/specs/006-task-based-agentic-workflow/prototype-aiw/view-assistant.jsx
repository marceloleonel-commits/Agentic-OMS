/* global React, Icon, AIWData, MessageComposer */
const { useState } = React;

/* ------- KPI overview card ------- */
function OverviewCard() {
  const { kpis } = AIWData;
  return (
    <section className="aiw-section">
      <div className="aiw-section-head aiw-section-head-flush">
        <div className="aiw-filters">
          <button className="filter-pill"><Icon name="grid" size={12} /> Todos os canais <Icon name="chevron-down" size={12} /></button>
          <button className="filter-pill">7 dias atrás <Icon name="chevron-down" size={12} /></button>
        </div>
      </div>
      <div className="aiw-kpi-card">
        <div className="aiw-kpi-row primary">
          {kpis.primary.map((k, i) =>
            <div key={i} className="aiw-kpi">
              <div className="aiw-kpi-label">{k.label}</div>
              <div className="aiw-kpi-value">{k.value}</div>
              <div className={`aiw-kpi-delta ${k.up ? "up" : "down"}`}>
                <span className="arrow">{k.up ? "▲" : "▼"}</span>{k.delta}
              </div>
            </div>
          )}
        </div>
        <div className="aiw-kpi-divider" />
        <div className="aiw-kpi-row sub">
          {kpis.secondary.map((k, i) =>
            <div key={i} className="aiw-kpi">
              <div className="aiw-kpi-label">{k.label}</div>
              <div className="aiw-kpi-value lg">{k.value}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------- Workflow stages overview ------- */
function WorkflowStagesCard() {
  const { workflowStages } = AIWData;
  return (
    <section className="aiw-section">
      <div className="aiw-section-head">
        <h2>Visão geral dos workflows</h2>
        <button className="filter-pill">Todas as tarefas <Icon name="chevron-down" size={12} /></button>
      </div>
      <div className="wf-stage-grid">
        {workflowStages.map((s, i) =>
          <div key={i} className="wf-stage-card">
            <span className="wf-stage-pill">{s.pill}</span>
            <div>
              <div className="wf-stage-label">{s.label}</div>
              <div className="wf-stage-count">{s.count}</div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------- Open tasks (4 cards) ------- */
function OpenTasksCard({ onOpen }) {
  const { tasks } = AIWData;
  const sevLabel = { high: "Alta", medium: "Média", low: "Baixa" };
  return (
    <section className="aiw-section">
      <div className="aiw-section-head">
        <h2>Tarefas em aberto</h2>
      </div>
      <div className="task-grid">
        {tasks.map((t) =>
          <button key={t.id} className="task-card" onClick={() => onOpen(t.id)}>
            <div className="task-card-top">
              <span className={`sev sev-${t.priority}`}>
                {t.priority === "high" && <span className="dot" />}
                {sevLabel[t.priority]}
              </span>
              <span className="task-active">
                <span className="status-dot active" /> Ativa
              </span>
            </div>
            <div className="task-card-body">{t.title}</div>
            <span className="task-tag">{t.tag}</span>
            <div className="task-card-foot">
              <span className="task-id">{t.id}</span>
              <div className="task-avatar">{t.assigneeInitial}</div>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}

/* ------- Resources (workflow board / orchestration agent / all orders) ------- */
function ResourcesCard({ onGoto }) {
  const { resources } = AIWData;
  return (
    <section className="aiw-section">
      <div className="aiw-section-head"><h2>Recursos disponíveis</h2></div>
      <div className="res-grid">
        {resources.map((r) =>
          <button key={r.id} className="res-card" onClick={() => onGoto(r.id)}>
            <span className="res-icon"><Icon name={r.icon} size={18} /></span>
            <span className="res-body">
              <span className="res-label">{r.label}</span>
              <span className="res-sub">{r.sub}</span>
            </span>
            <Icon name="chevron-right" size={14} />
          </button>
        )}
      </div>
    </section>
  );
}

/* ------- All orders table ------- */
function AllOrdersTable() {
  const { orders } = AIWData;
  const statusLabel = (s) => s === "approved" ? "approved" : s;
  return (
    <section className="aiw-section">
      <div className="orders-filterbar">
        <div className="orders-search">
          <Icon name="search" size={14} />
          <input placeholder="Search" />
        </div>
        <span className="orders-chip">
          <span className="orders-chip-lbl">Order date :</span>
          <span className="orders-chip-val">Today</span>
          <button className="orders-chip-x" aria-label="Remove filter"><Icon name="x" size={12} /></button>
        </span>
        <button className="orders-addfilter"><Icon name="plus" size={14} /> Add filter</button>
      </div>

      <div className="orders-table">
        <div className="orders-thead">
          <span>Order ID</span>
          <span>Creation date</span>
          <span>Customer</span>
          <span>Origin</span>
          <span>Qty</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
          <span />
        </div>
        {orders.map((o, i) =>
          <div key={i} className="orders-row">
            <span className="orders-id">{o.id}</span>
            <span className="muted">{o.date}</span>
            <span>{o.customer}</span>
            <span>{o.origin}</span>
            <span>{o.qty}</span>
            <span>{o.total}</span>
            <span><span className="amex-badge">AMEX</span></span>
            <span><span className={`orders-status orders-status-${o.status}`}>{o.statusLabel}</span></span>
            <span>
              <button className="icon-btn"><Icon name="more" size={16} /></button>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------- Assistant view (router) ------- */
function AssistantView({ onOpenTask, onGotoResource }) {
  const [tab, setTab] = useState("overview"); // overview | orders

  return (
    <div className="main">
      <header className="topbar topbar-tabs">
        <div className="aiw-tabs">
          <button className={`aiw-tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
            Visão Geral
          </button>
          <button className={`aiw-tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
            Todos os Pedidos
          </button>
        </div>
      </header>

      <div className="scroll" data-screen-label="01 My Assistant">
        <div className="aiw-wrap">
          {tab === "overview" &&
            <>
              <OverviewCard />
              <OpenTasksCard onOpen={onOpenTask} />
            </>
          }
          {tab === "orders" && <AllOrdersTable />}
        </div>
      </div>

      {tab === "overview" &&
        <div className="aiw-composer-bar">
          <MessageComposer placeholder="Message VTEX My Assistant..." />
        </div>
      }
    </div>
  );
}

window.AssistantView = AssistantView;
