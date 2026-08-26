/* global React, AIWData, Icon, TaskCanvas, InitiativesTable, occurrenceQueue */
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

const INITIATIVE_PRIORITY_LABEL = { high: "Alta", medium: "Média", low: "Baixa" };
const INITIATIVE_TASK_STATUS_LABEL = { completed: "Concluída", triage: "Aguardando triagem", attention: "Aguardando aprovação" };

function InitiativeStatusPill({ status }) {
  return (
    <span className="initiative-pill" data-status={status}>
      <InitiativeStatusIcon status={status} />
      {INITIATIVE_STATUS_LABEL[status] || status}
    </span>
  );
}

function InitiativeSeverityPill({ priority }) {
  if (!priority) return null;
  return (
    <span className="initiative-pill initiative-pill--severity" data-priority={priority}>
      {INITIATIVE_PRIORITY_LABEL[priority] || priority}
    </span>
  );
}

function InitiativeAvatar({ initials, name, agent }) {
  return (
    <span className={`initiative-avatar${agent ? " initiative-avatar--agent" : ""}`} title={name}>
      {agent ? <Icon name="sparkle" size={12} /> : initials}
    </span>
  );
}

/* Tarefa com status "attention" já tem uma conversa em aberto aguardando
   aprovação — só nesse caso "Ver conversa" fica disponível. Para as demais,
   mostramos apenas o status (o chat não é aberto sem ação do usuário). */
function InitiativeTaskRow({ task, onOpenTask }) {
  const canViewChat = task.status === "attention" && !!task.id;
  return (
    <div className="initiative-task-row">
      <span className="initiative-task-status" data-status={task.status}>
        <InitiativeStatusIcon status={task.status === "attention" ? "attention" : task.status === "completed" ? "completed" : "triage"} />
      </span>
      <span className="initiative-task-title">{task.title}</span>
      <span className="initiative-task-trailing">
        {canViewChat ? (
          <button className="initiative-task-view-chat" onClick={() => onOpenTask && onOpenTask(task.id, { openChat: true })}>
            Ver conversa
            <Icon name="arrow-up-right" size={12} />
          </button>
        ) : task.status === "active" ? (
          <span className="initiative-task-status-label">Explorando…</span>
        ) : (
          <span className="initiative-task-status-label initiative-task-status-label--muted">
            {INITIATIVE_TASK_STATUS_LABEL[task.status] || task.status}
          </span>
        )}
        <InitiativeAvatar initials={task.assigneeInitials} name={task.assigneeName} />
      </span>
    </div>
  );
}

function InitiativeAccordionSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useStateInitiatives(defaultOpen);
  return (
    <div className="initiative-accordion-section">
      <button className="initiative-accordion-trigger" onClick={() => setOpen((o) => !o)}>
        <Icon name={open ? "chevron-down" : "chevron-right"} size={14} />
        <span>{title}</span>
      </button>
      {open && <div className="initiative-accordion-body">{children}</div>}
    </div>
  );
}

/* Documento da iniciativa — é o que abre primeiro ao clicar numa linha da
   lista (a lista continua visível por trás, o painel entra como overlay pela
   direita). Sem chat: cada tarefa só leva ao chat quando o usuário clica
   explicitamente em "Ver conversa". */
function InitiativeDocumentPanel({ initiative, onClose, onOpenTask }) {
  if (!initiative) return null;
  return (
    <div className="detail-panel initiative-doc-panel">
      <div className="detail-head canvas-topbar" data-sl-canvas-tool-topbar="">
        <button className="canvas-topbar-icon" onClick={onClose} aria-label="Fechar" title="Fechar">
          <Icon name="x" size={18} />
        </button>
        <span className="canvas-topbar-title">{initiative.id} {initiative.title}</span>
        <button className="canvas-topbar-icon" aria-label="Mais opções" title="Mais opções">
          <Icon name="more" size={18} />
        </button>
      </div>
      <div className="detail-scroll">
        <div className="detail-body">
          <div className="initiative-doc-header">
            <h1 className="initiative-doc-title">{initiative.title}</h1>
            {initiative.description && <p className="initiative-doc-summary">{initiative.description}</p>}
          </div>

          <div className="initiative-metadata">
            <div className="initiative-metadata-row">
              <span className="initiative-metadata-label">Status</span>
              <InitiativeStatusPill status={initiative.status} />
            </div>
            {initiative.priority && (
              <div className="initiative-metadata-row">
                <span className="initiative-metadata-label">Severidade</span>
                <InitiativeSeverityPill priority={initiative.priority} />
              </div>
            )}
            <div className="initiative-metadata-row">
              <span className="initiative-metadata-label">Responsável</span>
              <span className="initiative-metadata-person">
                <InitiativeAvatar initials={initiative.ownerInitials} name={initiative.owner} />
                {initiative.owner}
              </span>
            </div>
            {initiative.participants && initiative.participants.length > 0 && (
              <div className="initiative-metadata-row">
                <span className="initiative-metadata-label">Participantes</span>
                <span className="initiative-avatar-stack">
                  {initiative.participants.map((p, i) => (
                    <InitiativeAvatar key={i} initials={p.initials} name={p.name} />
                  ))}
                </span>
              </div>
            )}
            {initiative.reportedBy && (
              <div className="initiative-metadata-row">
                <span className="initiative-metadata-label">Reportada por</span>
                <span className="initiative-metadata-reported">
                  <Icon name="sparkle" size={13} />
                  {initiative.reportedBy.label} em {initiative.reportedBy.at}
                </span>
              </div>
            )}
          </div>

          {initiative.diagnosis && (
            <InitiativeAccordionSection title="Diagnóstico">
              <p className="initiative-diagnosis-text">{initiative.diagnosis}</p>
            </InitiativeAccordionSection>
          )}

          {initiative.tasksList && initiative.tasksList.length > 0 && (
            <InitiativeAccordionSection title={`Tarefas (${initiative.tasksList.length})`}>
              <div className="initiative-tasks-list">
                {initiative.tasksList.map((t, i) => (
                  <InitiativeTaskRow key={t.id || i} task={t} onOpenTask={onOpenTask} />
                ))}
              </div>
            </InitiativeAccordionSection>
          )}
        </div>
      </div>
    </div>
  );
}

/* A tela lista exatamente a mesma fila de ocorrências do OpenTasksCard da home
   (AIWData.tasks), sem o corte de 8 itens — aqui é a lista completa. Cada linha
   abre o canvas da ocorrência, como na home. */
function InitiativesView({ onOpenTask, renderTopbarActions }) {
  const [search, setSearch] = useStateInitiatives("");
  const [openOccurrenceId, setOpenOccurrenceId] = useStateInitiatives(null);
  const all = occurrenceQueue(AIWData.tasks);

  const filtered = useMemoInitiatives(() => {
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.tag || "").toLowerCase().includes(q)
    );
  }, [all, search]);

  const openOccurrence = all.find((t) => t.id === openOccurrenceId) || null;

  return (
    <div className="main initiatives-shell">
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
            {filtered.length > 0 ? (
              <InitiativesTable items={filtered} onOpen={setOpenOccurrenceId} />
            ) : (
              <div data-sl-initiative-group="">
                <div data-sl-initiative-empty="">Nenhuma iniciativa encontrada.</div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Mesmo comportamento da home: a ocorrência abre no canvas da tarefa em
          formato de painel overlay, e o ícone de chat leva à tarefa completa. */}
      {openOccurrence && (
        <TaskCanvas
          task={openOccurrence}
          panelClassName="initiative-doc-panel"
          onBack={() => setOpenOccurrenceId(null)}
          onToggleChat={() => {
            const id = openOccurrence.id;
            setOpenOccurrenceId(null);
            onOpenTask && onOpenTask(id, { openChat: true });
          }}
        />
      )}
    </div>
  );
}

window.InitiativesView = InitiativesView;
window.InitiativeDocumentPanel = InitiativeDocumentPanel;
