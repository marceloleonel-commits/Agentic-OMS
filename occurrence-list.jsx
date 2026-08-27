/* global React, PersonAvatar */
// Tabela de iniciativas — porte da InitiativesTable da branch v3 do
// ai-workspace-shell-template (components/features/initiatives-table).
// Compartilhada pela fila da home (OpenTasksCard, em view-assistant.jsx) e
// pela tela My Initiatives (view-initiatives.jsx). Colunas do v3:
// Iniciativa (expand + status + chip ID + contador de atenção + título e
// descrição) · Métrica · Severidade · Data · Líder, com linha expandida
// mostrando as subtarefas.

const { useState: useStateInitiativeTable, Fragment: FragmentInitiativeTable } = React;

// Nº de pedidos afetados — vem de detail.affectedOrders (canvas com árvore de
// decisão) ou detail.impacted (demais tarefas).
function occurrenceScopeCount(t) {
  const d = t.detail || {};
  if (d.affectedOrders) return d.affectedOrders.total ?? (d.affectedOrders.items?.length || 0);
  return (d.impacted || []).length;
}

// Total exibido na coluna "Pedidos afetados" — tickets e casos em decisão
// entram na mesma conta (mesma regra de occurrenceScopeLabel).
function occurrenceScopeTotal(t) {
  const d = t.detail || {};
  if (d.tickets) return d.tickets.length;
  if (t.canvasPattern === "D") return (d.exceptions?.rows?.length || 0) + (d.duplicates?.rows?.length || 0);
  return occurrenceScopeCount(t);
}

// Texto completo do escopo — vira a descrição ao lado do título (padrão da
// coluna Iniciativa no v3: título semibold + descrição em tom secundário).
function occurrenceScopeLabel(t) {
  const d = t.detail || {};
  if (d.tickets) {
    const n = d.tickets.length;
    return `${n} ticket${n === 1 ? "" : "s"} em avaliação`;
  }
  if (t.canvasPattern === "D") {
    const n = (d.exceptions?.rows?.length || 0) + (d.duplicates?.rows?.length || 0);
    return `${n} caso${n === 1 ? "" : "s"} em decisão`;
  }
  const scope = occurrenceScopeCount(t);
  return `${scope} pedido${scope === 1 ? "" : "s"} afetado${scope === 1 ? "" : "s"}`;
}

// SLA restante — mantido para outras superfícies que ainda dependem dele.
function occurrenceSlaLabel(t) {
  const h = t.detail && t.detail.slaHours;
  if (h == null) return "Sem SLA";
  if (h < 0) {
    const overdue = Math.abs(h);
    return overdue >= 24 ? `Expirado há ${Math.round(overdue / 24)}d` : `Expirado há ${overdue}h`;
  }
  if (h < 24) return `${h}h restantes`;
  return `${Math.round(h / 24)}d restantes`;
}

// Só as entradas de AIWData.tasks que são ocorrências entram na fila: algumas
// existem apenas para dar canvas a uma tarefa alcançada por outra superfície.
function occurrenceQueue(tasks) {
  return (tasks || []).filter((t) => t.isOccurrence !== false);
}

/* ── Ícones de status — mesmos assets /icons/*-status.svg do v3, inline ── */
function InitiativeTableStatusIcon({ status, pixelSize = 16 }) {
  const common = { width: pixelSize, height: pixelSize, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true };
  let svg = null;
  if (status === "active") {
    svg = (
      <svg {...common}>
        <circle cx="8" cy="8" r="8" fill="#AFF79E" />
        <circle cx="8" cy="8" r="4" fill="#28BC37" />
      </svg>
    );
  } else if (status === "attention") {
    svg = (
      <svg {...common}>
        <circle cx="8" cy="8" r="8" fill="#B6DFFF" />
        <circle cx="8" cy="8" r="4" fill="#1E4EE5" />
      </svg>
    );
  } else if (status === "completed") {
    svg = (
      <svg {...common}>
        <path d="M14.3545 4.66699L6.00098 13.0205L1.91406 8.93359L3.20117 7.64648L6.00098 10.4463L13.0674 3.37988L14.3545 4.66699Z" fill="#707070" stroke="#707070" strokeWidth="0.5" />
      </svg>
    );
  } else {
    /* triage */
    svg = (
      <svg {...common}>
        <rect x="1.5" y="1.5" width="13" height="13" rx="6.5" stroke="#999999" strokeWidth="3" strokeDasharray="2 2" />
      </svg>
    );
  }
  return (
    <span data-sl-initiative-table-status-icon="" data-status={status} style={{ width: pixelSize, height: pixelSize }} aria-hidden>
      {svg}
    </span>
  );
}

/* Subtarefas exibidas no detalhe expandido — derivadas do modelo de detail
   das ocorrências: followUp em aberto + autoDone/resolved concluídas e, no
   canvas de triagem em lote (padrão D), os tickets aguardando avaliação. */
function initiativeTableSubtasks(t) {
  const d = t.detail || {};
  const open = (d.followUp || []).map((s) => ({
    title: s.title,
    status: s.state === "attention" ? "attention" : s.state === "active" ? "active" : "pending",
    assignee: s.assignee,
    initial: s.initial,
    agent: !!s.agent,
  }));
  /* Mesma derivação do CanvasPatternD: uma tarefa "Resolver ticket" por
     ticket, SLA vencido primeiro, responsável = lead da iniciativa. */
  const tickets = (d.tickets || [])
    .slice()
    .sort((a, b) => (b.overdue ? 1 : 0) - (a.overdue ? 1 : 0))
    .map((tk) => ({
      title: `Resolver ticket ${tk.id}`,
      status: "attention",
      assignee: d.lead,
      initial: (d.lead || "?").slice(0, 1),
    }));
  const done = [...(d.autoDone || []), ...(d.resolved || [])].map((s) => ({
    title: s.title,
    status: "done",
    assignee: s.assignee,
    initial: s.initial,
    agent: !!s.agent,
  }));
  return [...open, ...tickets, ...done];
}

/* Total de tarefas em atenção na fila — soma dos contadores azuis da tabela.
   Alimenta o pill "Precisam de sua atenção" do OverviewSummaryStrip. */
function initiativeAttentionTotal(tasks) {
  return occurrenceQueue(tasks).reduce(
    (sum, t) => sum + initiativeTableSubtasks(t).filter((s) => s.status === "attention").length,
    0
  );
}

/* Data curta para a coluna Data — "14 jun 2026, 09:42" → "14 jun". */
function initiativeTableShortDate(t) {
  const at = t.detail && t.detail.reportedBy && t.detail.reportedBy.at;
  if (!at) return "—";
  return at.split(",")[0].trim().split(" ").slice(0, 2).join(" ");
}

const INITIATIVE_TABLE_SEVERITY_LABEL = { high: "Alta", medium: "Média", low: "Baixa" };

/* Leading da subtarefa: atenção/ativa usam o ícone de status; concluída usa o
   check; pendente é o dot verde (mesma regra do detalhe expandido no v3). */
function InitiativeTableSubtaskLeading({ status }) {
  if (status === "attention") return <InitiativeTableStatusIcon status="attention" pixelSize={16} />;
  if (status === "active") return <InitiativeTableStatusIcon status="active" pixelSize={16} />;
  if (status === "done") return <InitiativeTableStatusIcon status="completed" pixelSize={16} />;
  return <span data-sl-initiative-table-subtask-dot="" aria-hidden />;
}

function InitiativeTableSubtaskRow({ sub }) {
  return (
    <div
      data-sl-initiative-table-subtask-row=""
      data-sl-initiative-table-subtask-subgrid=""
      {...(sub.status === "attention" ? { "data-sl-initiative-table-subtask-attention": "" } : {})}
    >
      <div data-sl-initiative-table-subtask-cell="" data-sl-grid-col="1">
        <div data-sl-initiative-table-subtask-left="">
          <span data-sl-initiative-table-subtask-leading="">
            <InitiativeTableSubtaskLeading status={sub.status} />
          </span>
          <span data-sl-initiative-table-subtask-title="">{sub.title}</span>
        </div>
      </div>
      <div data-sl-initiative-table-subtask-cell="" data-sl-grid-col="2" aria-hidden />
      <div data-sl-initiative-table-subtask-cell="" data-sl-grid-col="3" aria-hidden />
      <div data-sl-initiative-table-subtask-cell="" data-sl-grid-col="4" data-sl-initiative-table-subtask-trailing="">
        {sub.status === "active" && (
          <span data-sl-initiative-table-subtask-working="">Trabalhando nisso…</span>
        )}
        {sub.assignee ? <PersonAvatar initial={sub.initial || (sub.assignee || "?").slice(0, 1)} agent={sub.agent} name={sub.assignee} /> : null}
      </div>
    </div>
  );
}

function InitiativeTableRow({ t, onOpen }) {
  const [expanded, setExpanded] = useStateInitiativeTable(false);
  const subtasks = initiativeTableSubtasks(t);
  const canExpand = subtasks.length > 0;
  const status = t.status || (t.priority === "high" ? "attention" : "active");
  /* Regra v3: a iniciativa na lista fica verde (ativa); a atenção aparece no
     contador azul ao lado do chip de ID e nas tasks do detalhe expandido. */
  const displayStatus = status === "attention" ? "active" : status;
  const attentionCount = subtasks.filter((s) => s.status === "attention").length;
  const hasAttention = status === "attention" || attentionCount > 0;
  const severity = (t.detail && t.detail.severity) || "medium";

  return (
    <FragmentInitiativeTable>
      <div
        data-sl-initiative-table-row=""
        data-initiative-table-body=""
        {...(hasAttention ? { "data-initiative-has-task-attention": "" } : {})}
        {...(expanded ? { "data-expanded": "true" } : {})}
        role="button"
        tabIndex={0}
        onClick={() => onOpen && onOpen(t.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen && onOpen(t.id);
          }
        }}
      >
        <div data-sl-initiative-table-cell="">
          <div data-sl-initiative-table-initiative-main="" data-initiative-status={displayStatus} data-priority={severity}>
            {canExpand ? (
              <button
                type="button"
                data-sl-initiative-table-expand-button=""
                aria-label={expanded ? "Recolher subtarefas" : "Expandir subtarefas"}
                aria-expanded={expanded}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((o) => !o);
                }}
              >
                <span data-sl-initiative-table-expand-chevron="" style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9.99984 6L8.58984 7.41L13.1698 12L8.58984 16.59L9.99984 18L15.9998 12L9.99984 6Z" fill="#323232" />
                  </svg>
                </span>
              </button>
            ) : (
              <span data-sl-initiative-table-expand-placeholder="" aria-hidden />
            )}
            <InitiativeTableStatusIcon status={displayStatus} />
            <span data-sl-initiative-table-id-chip="">{t.id.replace(/^TA-/, "")}</span>
            {attentionCount > 0 && (
              <span data-sl-initiative-table-attention-counter-box="">
                <InitiativeTableStatusIcon status="attention" pixelSize={12} />
                <span data-sl-initiative-table-attention-counter-number="">{attentionCount}</span>
              </span>
            )}
            <span data-sl-initiative-table-title-link="">
              <span data-sl-initiative-table-initiative-title="">{t.title}</span>
            </span>
          </div>
        </div>
        <div data-sl-initiative-table-cell="">
          <span data-sl-initiative-table-scope-cell="">{occurrenceScopeTotal(t)}</span>
        </div>
        <div data-sl-initiative-table-cell="">
          <span data-sl-initiative-table-severity-inline="">
            <span data-sl-criticality-tag="" data-priority={severity}>
              {severity === "high" && <span data-sl-status="dot" aria-hidden />}
              {INITIATIVE_TABLE_SEVERITY_LABEL[severity] || severity}
            </span>
          </span>
        </div>
        <div data-sl-initiative-table-cell="">
          <span data-sl-initiative-table-date-cell="">{initiativeTableShortDate(t)}</span>
        </div>
      </div>
      {expanded && canExpand && (
        <div data-sl-initiative-table-detail-row="">
          {subtasks.map((sub, i) => (
            <InitiativeTableSubtaskRow key={`${sub.title}-${i}`} sub={sub} />
          ))}
          <div data-sl-initiative-table-subtask-after-list-spacer="" aria-hidden />
        </div>
      )}
    </FragmentInitiativeTable>
  );
}

/* Tabela completa (card + grid), pronta para as duas superfícies. */
function InitiativesTable({ items, onOpen }) {
  return (
    <div data-sl-initiative-group="">
      <div data-sl-initiative-table="">
        <div data-sl-initiative-table-row="" data-initiative-table-head="">
          <span data-sl-initiative-table-cell="">Iniciativa</span>
          <span data-sl-initiative-table-cell="">Pedidos afetados</span>
          <span data-sl-initiative-table-cell="">Severidade</span>
          <span data-sl-initiative-table-cell="">Data</span>
        </div>
        {items.map((t) => (
          <InitiativeTableRow key={t.id} t={t} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}

window.InitiativesTable   = InitiativesTable;
window.occurrenceQueue    = occurrenceQueue;
window.occurrenceSlaLabel = occurrenceSlaLabel;
window.occurrenceScopeLabel = occurrenceScopeLabel;
