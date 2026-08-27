/* global React, Icon, AIWData, SevPill, PersonAvatar, OpsHomeKpiCard */
// Home (preview) — unified-queue variant: occurrences and tasks merged into a
// single, severity-sorted feed ("O que precisa de você agora").
// Isolated route (#/home-queue). Does not touch #/home-preview or #/orders —
// separate data (AIWData.opsHomeQueue), separate CSS classes (.ops-queue-*).

const OPS_QUEUE_KIND_LABEL = { occurrence: "Ocorrência", task: "Tarefa" };
const OPS_QUEUE_KIND_ICON  = { occurrence: "layers", task: "chat-circle" };

/* ── Queue row (occurrence or task) ──────────────────────────────────── */
function OpsQueueRow({ item, onOpen }) {
  return (
    <div className="ops-queue-row" onClick={() => onOpen && onOpen(item)}>
      <span className="ops-queue-icon">
        <Icon name={OPS_QUEUE_KIND_ICON[item.kind]} size={14} />
      </span>
      <div className="ops-queue-body">
        <div className="ops-queue-line">
          <span className="ops-queue-tag">{OPS_QUEUE_KIND_LABEL[item.kind]}</span>
          <SevPill level={item.severity} />
          <span className="ops-queue-title">{item.title}</span>
        </div>
        <span className="ops-queue-sub">{item.sub}</span>
      </div>
      {item.assignee && (
        <span className="ops-queue-aside">
          <PersonAvatar initial={item.assignee.initial} agent={item.assignee.agent} name={item.assignee.name} />
        </span>
      )}
    </div>
  );
}

/* ── Home (preview) — unified queue view ─────────────────────────────── */
function HomeQueueView({ onOpenTask, onGotoResource }) {
  const { opsHomeQueue } = AIWData;

  const kpis = opsHomeQueue.kpis.map((k) =>
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

      <div className="scroll" data-screen-label="Home Preview — Fila unificada">
        <div className="aiw-wrap ops-home-wrap">

          <div className="ops-home-kpi-grid ops-queue-kpi-grid">
            {kpis.map((k, i) => <OpsHomeKpiCard key={i} kpi={k} />)}
          </div>

          <section className="aiw-section">
            <div className="aiw-section-head">
              <h2>O que precisa de você agora</h2>
              <button className="filter-pill" onClick={() => onGotoResource && onGotoResource("tasks")}>
                Ver tudo <Icon name="arrow-up-right" size={12} />
              </button>
            </div>
            <div className="ops-queue-list">
              {opsHomeQueue.items.map((item) => (
                <OpsQueueRow key={item.id} item={item} onOpen={(it) => it.taskId && onOpenTask && onOpenTask(it.taskId)} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

window.HomeQueueView = HomeQueueView;
