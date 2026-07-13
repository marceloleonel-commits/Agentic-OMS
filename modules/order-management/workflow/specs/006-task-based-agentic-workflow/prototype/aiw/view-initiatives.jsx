/* global React, AIWData */
const { useState: useStateInitiatives, useMemo: useMemoInitiatives } = React;

/* ── Status indicator (v3 parity with the kanban status icon) ── */
function InitiativeStatusIcon({ status }) {
  if (status === "completed") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#AFF79E" />
        <path d="M5 8.2l2 2 4-4.2" stroke="#28BC37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }
  if (status === "attention") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#B6DFFF" />
        <circle cx="8" cy="8" r="4" fill="#1E4EE5" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7" stroke="#1E4EE5" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

const INITIATIVE_STATUS_LABEL = {
  active: "Em andamento",
  attention: "Aguardando ação",
  completed: "Concluída",
};

function InitiativeRow({ initiative, onOpen }) {
  const pct = Math.round((initiative.tasksDone / initiative.tasksTotal) * 100);
  return (
    <button data-sl-initiative-row="" onClick={() => onOpen && onOpen(initiative)}>
      <span data-sl-initiative-row-status="">
        <InitiativeStatusIcon status={initiative.status} />
      </span>
      <span data-sl-initiative-row-main="">
        <span data-sl-initiative-row-title="">{initiative.title}</span>
        <span data-sl-initiative-row-meta="">
          <span data-sl-initiative-row-source="">{initiative.source.label}</span>
          <span data-sl-initiative-row-dot="">·</span>
          <span>{INITIATIVE_STATUS_LABEL[initiative.status]}</span>
        </span>
      </span>
      <span data-sl-initiative-row-progress="">
        <span data-sl-initiative-row-progress-track="">
          <span data-sl-initiative-row-progress-fill="" style={{ width: `${pct}%` }} />
        </span>
        <span data-sl-initiative-row-progress-label="">{initiative.tasksDone}/{initiative.tasksTotal}</span>
      </span>
      <span data-sl-initiative-row-owner="" title={initiative.owner}>
        <span data-sl-initiative-row-owner-initials="">{initiative.ownerInitials}</span>
      </span>
      <span data-sl-initiative-row-updated="">{initiative.updated}</span>
    </button>
  );
}

function InitiativesView({ onOpenTask, renderTopbarActions }) {
  const [search, setSearch] = useStateInitiatives("");
  const all = AIWData.initiatives ?? [];

  const filtered = useMemoInitiatives(() => {
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (i) => i.title.toLowerCase().includes(q) || i.source.label.toLowerCase().includes(q)
    );
  }, [all, search]);

  return (
    <div className="main">
      <div data-sl-my-tasks-sticky-top="">
        <div data-sl-module-browser-top-bar="">
          <div data-sl-module-browser-top-bar-title="">
            <h1 data-sl-browse-page-title="">My Initiatives</h1>
          </div>
          <div data-sl-module-browser-toolbar="">
            <button data-sl-module-browser-header-icon-action="" aria-label="Buscar" title="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor" />
              </svg>
            </button>
            <button data-sl-module-browser-header-icon-action="" aria-label="Filtros" title="Filtros">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M8 12h8M10.5 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <button data-sl-module-browser-header-icon-action="" aria-label="Nova iniciativa" title="Nova iniciativa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="scroll">
        <div className="aiw-wrap">
          <section className="aiw-section">
            <div data-sl-initiative-list="">
              {filtered.map((i) => (
                <InitiativeRow key={i.id} initiative={i} onOpen={() => onOpenTask && onOpenTask(i.id)} />
              ))}
              {filtered.length === 0 && (
                <div data-sl-initiative-empty="">Nenhuma iniciativa encontrada.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

window.InitiativesView = InitiativesView;
