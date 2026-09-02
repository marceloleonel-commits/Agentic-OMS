/* global React, AIWData */
const { useState, useMemo, useRef, useEffect } = React;

/* ── Source-kind icon SVGs (v3 port) ── */
const SourceIcon = ({ kind }) => {
  switch (kind) {
    case "initiative":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V16H8.56C9.25 17.19 10.53 18 12.01 18C13.49 18 14.76 17.19 15.46 16H19V19ZM19 14H14.01C14.01 15.1 13.11 16 12.01 16C10.91 16 10.01 15.1 10.01 14H5V5H19V14Z" fill="currentColor"/>
        </svg>
      );
    case "campaign":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" fill="currentColor"/>
        </svg>
      );
    case "content":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
        </svg>
      );
    case "order":
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15.55 13C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C21.25 4.82 20.77 4 20.01 4H5.21L4.27 2H1V4H3L6.6 11.59L5.25 14.03C4.52 15.37 5.48 17 7 17H19V15H7L8.1 13H15.55ZM7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
        </svg>
      );
    default:
      return null;
  }
};

/* ── Working dots (v3 port: TaskWorkingDotsIcon) ── */
const WORKING_DOTS_VIEWBOX = 24;
const WORKING_DOT_RADIUS = 1.5;
const WORKING_DOTS_GRID_STEP =
  2 * WORKING_DOT_RADIUS + (WORKING_DOTS_VIEWBOX / 24) * 1;
const WORKING_DOTS_GRID_CENTER = WORKING_DOTS_VIEWBOX / 2;
const WORKING_DOTS_AXIS = [
  WORKING_DOTS_GRID_CENTER - WORKING_DOTS_GRID_STEP,
  WORKING_DOTS_GRID_CENTER,
  WORKING_DOTS_GRID_CENTER + WORKING_DOTS_GRID_STEP,
];
const WORKING_DOTS_GRID = WORKING_DOTS_AXIS.flatMap(cy =>
  WORKING_DOTS_AXIS.map(cx => ({ cx, cy }))
);
const WORKING_DOTS_SNAKE_PATH = [0, 1, 2, 5, 4, 3, 6, 7, 8];
const WORKING_DOTS_SNAKE_LENGTH = 4;
const WORKING_DOTS_TICK_MS = 200;

const buildWorkingDotsBody = (headPathIndex) => {
  const body = new Set();
  for (let offset = 0; offset < WORKING_DOTS_SNAKE_LENGTH; offset += 1) {
    const pathIndex =
      (headPathIndex - offset + WORKING_DOTS_SNAKE_PATH.length * 8) %
      WORKING_DOTS_SNAKE_PATH.length;
    body.add(WORKING_DOTS_SNAKE_PATH[pathIndex]);
  }
  return body;
};

const TaskWorkingDotsIcon = ({ size = 24 }) => {
  const [headPathIndex, setHeadPathIndex] = useState(0);
  const visibleIndices = useMemo(
    () => buildWorkingDotsBody(headPathIndex),
    [headPathIndex]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setHeadPathIndex(prev => (prev + 1) % WORKING_DOTS_SNAKE_PATH.length);
    }, WORKING_DOTS_TICK_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${WORKING_DOTS_VIEWBOX} ${WORKING_DOTS_VIEWBOX}`}
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      data-sl-task-working-dots=""
    >
      {WORKING_DOTS_GRID.map((dot, index) => (
        <circle
          key={`${dot.cx}-${dot.cy}`}
          cx={dot.cx}
          cy={dot.cy}
          r={WORKING_DOT_RADIUS}
          data-sl-task-working-dot=""
          data-sl-task-working-dot-visible={visibleIndices.has(index) ? "" : undefined}
        />
      ))}
    </svg>
  );
};

/* ── Status indicator (active / attention) — v3 port ── */
const StatusIcon = ({ status }) => {
  if (status === "active") {
    return <TaskWorkingDotsIcon size={24} />;
  }
  if (status === "attention") {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="8" fill="#B6DFFF"/>
        <circle cx="8" cy="8" r="4" fill="#1E4EE5"/>
      </svg>
    );
  }
  return null;
};

/* ── Task Kanban Card (v3 port) ── */
function TaskKanbanCard({ task }) {
  const showStatusCorner = task.status === "active" || task.status === "attention";
  const accentColor =
    task.status === "attention" ? "var(--sl-color-blue-9, #0a72ee)"
    : task.status === "active"  ? "var(--sl-color-gray-5, #B6C2D5)"
    : task.status === "completed" ? "var(--sl-color-gray-4, #CED7E4)"
    : "var(--sl-color-gray-4, #CED7E4)";

  return (
    <div
      data-sl-task-kanban-card=""
      data-task-status={task.status}
      data-completed={task.status === "completed" ? "" : undefined}
      style={{ "--task-kanban-card-left-accent": accentColor }}
    >
      <div data-sl-task-kanban-card-inner="" data-status-layout={showStatusCorner ? "" : undefined}>
        <p data-sl-task-kanban-card-title="">{task.title}</p>

        {showStatusCorner && (
          <div data-sl-task-kanban-card-aside="">
            <span data-sl-task-kanban-card-status-icon="">
              <StatusIcon status={task.status} />
            </span>
            <span data-sl-task-kanban-card-assignee-avatar="">
              <span data-sl-task-kanban-card-assignee-initials="">{task.assigneeInitials}</span>
            </span>
          </div>
        )}

        <div data-sl-task-kanban-card-footer="">
          <div data-sl-task-kanban-card-initiative="">
            <div data-sl-task-kanban-card-source="" title={task.source.label}>
              <span data-sl-task-kanban-card-source-icon-wrap="">
                <SourceIcon kind={task.source.kind} />
              </span>
              <span data-sl-task-kanban-card-source-label="">{task.source.label}</span>
            </div>
          </div>
          {!showStatusCorner && (
            <div data-sl-task-kanban-card-meta="">
              <span data-sl-task-kanban-card-assignee-avatar="">
                <span data-sl-task-kanban-card-assignee-initials="">{task.assigneeInitials}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Kanban Column ── */
function KanbanColumn({ id, title, tasks }) {
  return (
    <div data-droppable-column="">
      <div data-sl-kanban-column="">
        <div data-sl-kanban-column-header="" data-header-variant="inline">
          <span data-sl-kanban-column-title="">{title}</span>
          <span data-sl-kanban-column-count="">{tasks.length}</span>
        </div>
        <div data-sl-kanban-column-body="">
          {tasks.map(task => (
            <TaskKanbanCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

const COLUMNS = [
  { id: "triage",    title: "Em aberto"       },
  { id: "active",    title: "Trabalhando"      },
  { id: "attention", title: "Aguardando ação"  },
  { id: "completed", title: "Concluído"        },
];

/* ── Tasks View ── */
function TasksView() {
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const allTasks = AIWData.myTasks ?? [];

  const filtered = useMemo(() => {
    if (!search.trim()) return allTasks;
    const q = search.toLowerCase();
    return allTasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.source.label.toLowerCase().includes(q)
    );
  }, [allTasks, search]);

  const byColumn = useMemo(() => {
    const map = {};
    for (const col of COLUMNS) map[col.id] = [];
    for (const task of filtered) {
      if (map[task.status]) map[task.status].push(task);
    }
    return map;
  }, [filtered]);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 40);
  };

  const closeSearch = () => {
    if (!search.trim()) {
      setSearchOpen(false);
    }
  };

  return (
    <div data-sl-my-tasks-page="" data-sl-module-browser-page="">
      {/* ── Scroll area + body (v3 page architecture) ── */}
      <div data-sl-browse-scroll="" data-sl-content="">
        <div data-sl-browse-body="">
      {/* ── Sticky header ── */}
      <div data-sl-my-tasks-sticky-top="" data-scrolled={scrolled ? "" : undefined}>
        <div data-sl-module-browser-top-bar="" data-sl-module-browser-search-open={searchOpen ? "" : undefined}>

          {/* Title */}
          {!searchOpen && (
            <div data-sl-module-browser-top-bar-title="">
              <h1 data-sl-browse-page-title="">Minhas Tarefas</h1>
            </div>
          )}

          {/* Search pill — visible when open */}
          {searchOpen && (
            <div data-sl-module-browser-search="" onClick={() => searchRef.current?.focus()}>
              <span data-sl-module-browser-search-pre-icon="" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
                </svg>
              </span>
              <input
                ref={searchRef}
                type="search"
                data-sl-module-browser-search-input=""
                placeholder="Buscar tarefas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") { setSearch(""); closeSearch(); } }}
              />
              {search && (
                <button
                  data-sl-module-browser-search-clear=""
                  onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "var(--sl-color-gray-7, #4E607A)", padding: 4, borderRadius: 999 }}
                  aria-label="Limpar busca"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>
                </button>
              )}
              {/* Trailing: filter button inside pill */}
              <div data-sl-module-browser-search-trailing="">
                <button data-sl-module-browser-header-icon-action="" aria-label="Filtros" title="Filtros">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M8 12h8M10.5 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* Toolbar (right side) */}
          <div data-sl-module-browser-toolbar="">
            {!searchOpen && (
              <button data-sl-module-browser-header-icon-action="" aria-label="Buscar" title="Buscar" onClick={openSearch}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
                </svg>
              </button>
            )}
            {searchOpen && (
              <button data-sl-module-browser-header-icon-action="" aria-label="Fechar busca" title="Fechar busca" onClick={() => { setSearch(""); setSearchOpen(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
              </button>
            )}
            {!searchOpen && (
              <button data-sl-module-browser-header-icon-action="" aria-label="Filtros" title="Filtros">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M8 12h8M10.5 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
            <button data-sl-module-browser-header-icon-action="" aria-label="Nova tarefa" title="Nova tarefa">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Kanban board ── */}
      <div data-sl-my-tasks-content="">
        <div data-sl-my-tasks-kanban="">
          <div data-sl-tasks-kanban-shell="">
            <div data-sl-kanban-board="">
              {COLUMNS.map(col => (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  tasks={byColumn[col.id] || []}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

window.TasksView = TasksView;
window.TaskKanbanCard = TaskKanbanCard;
window.StatusIcon = StatusIcon;
