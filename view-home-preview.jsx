/* global React, Icon, AIWData, SevPill, PersonAvatar */
// Home (preview) — situation-room dashboard ported from Canvas-Wireframes.
// Rendered only at #/home-preview. Does not touch the current "orders" home.

/* ── KPI card ─────────────────────────────────────────────────────────── */
function OpsHomeKpiCard({ kpi }) {
  return (
    <div className="ops-home-kpi-card">
      <span className="ops-home-kpi-label">{kpi.label}</span>
      <span className="ops-home-kpi-value">{kpi.value}</span>
      {kpi.delta && (
        <span className={`ops-home-kpi-sub ops-home-kpi-delta-${kpi.delta.direction}`}>
          <Icon name="arrow-up" size={11} style={{ transform: kpi.delta.direction === "down" ? "rotate(180deg)" : "none" }} />
          {kpi.delta.text}
        </span>
      )}
      {kpi.note && <span className="ops-home-kpi-sub">{kpi.note}</span>}
      {kpi.link && (
        <button className="ops-home-kpi-link" onClick={kpi.link.onClick}>
          {kpi.link.label} <Icon name="arrow-up-right" size={11} />
        </button>
      )}
    </div>
  );
}

/* ── Occurrence card ──────────────────────────────────────────────────── */
function OpsHomeOccurrenceCard({ occ, onOpen }) {
  return (
    <div className="ops-occ-card" onClick={() => onOpen && onOpen(occ)}>
      <div className="ops-occ-head">
        <div className="ops-occ-head-copy">
          <div className="ops-occ-title">{occ.title}</div>
          <div className="ops-occ-sub">{occ.category}</div>
        </div>
        <SevPill level={occ.severity} />
      </div>
      <div className="ops-occ-footer">
        <div className="ops-occ-metrics">
          <span className="ops-occ-metric"><Icon name="cart" size={13} /> {occ.orders} pedido{occ.orders === 1 ? "" : "s"}</span>
          <span className="ops-occ-metric"><Icon name="list" size={13} /> {occ.tasksDone} de {occ.tasksTotal} tarefas</span>
        </div>
        <span className="ops-occ-assignee">
          <PersonAvatar initial={occ.assignee.initial} agent={occ.assignee.agent} />
          {occ.assignee.name}
        </span>
      </div>
    </div>
  );
}

/* ── Decision row ─────────────────────────────────────────────────────── */
function OpsHomeDecisionRow({ decision }) {
  return (
    <div className="ops-dec-row">
      <span className="ops-dec-icon"><Icon name="chat-circle" size={14} /></span>
      <div className="ops-dec-body">
        <span className="ops-dec-title">{decision.title}</span>
        <span className="ops-dec-time">Aguardando há {decision.waiting}</span>
      </div>
    </div>
  );
}

/* ── Home (preview) view ──────────────────────────────────────────────── */
function HomePreviewView({ onOpenTask, onGotoResource }) {
  const { opsHome } = AIWData;

  const kpis = opsHome.kpis.map((k) =>
    k.link ? { ...k, link: { ...k.link, onClick: () => onGotoResource && onGotoResource("tasks") } } : k
  );

  return (
    <div className="main">
      <div data-sl-my-tasks-sticky-top="">
        <div data-sl-module-browser-top-bar="">
          <div data-sl-module-browser-top-bar-title="">
            <h1 data-sl-browse-page-title="">Orders</h1>
          </div>
          <div data-sl-module-browser-toolbar="">
            <button className="btn btn-sm btn-secondary"><Icon name="search" size={14} /> Buscar</button>
            <button className="btn btn-sm btn-secondary">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><path d="M4 7h16M8 12h8M10.5 17h3"/></svg>
              Filtrar
            </button>
          </div>
        </div>
      </div>

      <div className="scroll" data-screen-label="Home Preview">
        <div className="aiw-wrap ops-home-wrap">

          <div className="ops-home-kpi-grid">
            {kpis.map((k, i) => <OpsHomeKpiCard key={i} kpi={k} />)}
          </div>

          <div className="ops-home-columns">
            <section className="aiw-section">
              <div className="aiw-section-head">
                <h2>Ocorrências abertas</h2>
                <button className="filter-pill" onClick={() => onGotoResource && onGotoResource("tasks")}>
                  Ver todas <Icon name="arrow-up-right" size={12} />
                </button>
              </div>
              <div className="ops-occ-list">
                {opsHome.occurrences.map((o) => (
                  <OpsHomeOccurrenceCard key={o.id} occ={o} onOpen={(occ) => occ.taskId && onOpenTask && onOpenTask(occ.taskId)} />
                ))}
              </div>
            </section>

            <section className="aiw-section">
              <div className="aiw-section-head">
                <h2>Decisões pendentes</h2>
                <button className="filter-pill">
                  Ver todas <Icon name="arrow-up-right" size={12} />
                </button>
              </div>
              <div className="ops-dec-list">
                {opsHome.decisions.map((d) => <OpsHomeDecisionRow key={d.id} decision={d} />)}
              </div>
            </section>
          </div>

          <div className="ops-digest-bar">
            <div className="ops-digest-left">
              <span className="ops-digest-icon"><Icon name="doc" size={16} /></span>
              <div className="ops-digest-copy">
                <span className="ops-digest-title">Digest de hoje</span>
                <span className="ops-digest-sub">{opsHome.digest.summary}</span>
              </div>
            </div>
            <button className="btn btn-sm btn-secondary">
              Abrir digest <Icon name="arrow-up-right" size={12} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

window.HomePreviewView = HomePreviewView;
window.OpsHomeKpiCard  = OpsHomeKpiCard; // reused by view-home-queue.jsx
