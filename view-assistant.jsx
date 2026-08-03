/* global React, Icon, AIWData, MessageComposer, ChatEngine, SevPill, Dropdown, StatusIcon */
const { useState, useEffect, useRef } = React;

/* ------- Overview metric sparkline (v3 port: OverviewMetricChart) ------- */
const OVERVIEW_CHART_W = 160;
const OVERVIEW_CHART_H = 56;

function overviewLinePath(points, scale) {
  const stepX = points.length > 1 ? OVERVIEW_CHART_W / (points.length - 1) : 0;
  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = OVERVIEW_CHART_H - ((point - scale.min) / scale.range) * OVERVIEW_CHART_H;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function OverviewMetricChart({ points, comparisonPoints, trendDirection }) {
  if (!points || points.length < 2) return null;
  const comparison = comparisonPoints && comparisonPoints.length >= 2 ? comparisonPoints : null;
  const all = comparison ? points.concat(comparison) : points;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const scale = { min, max, range: max - min || 1 };
  const linePath = overviewLinePath(points, scale);
  const stepX = points.length > 1 ? OVERVIEW_CHART_W / (points.length - 1) : 0;
  const lastX = (points.length - 1) * stepX;
  const areaPath = `${linePath} L ${lastX} ${OVERVIEW_CHART_H} L 0 ${OVERVIEW_CHART_H} Z`;
  const comparisonLinePath = comparison ? overviewLinePath(comparison, scale) : null;
  const gradientId = `ov-grad-${trendDirection}-${min}-${max}`;
  return (
    <div data-sl-overview-metric-chart="" data-trend-direction={trendDirection} aria-hidden>
      <svg viewBox={`0 0 ${OVERVIEW_CHART_W} ${OVERVIEW_CHART_H}`} preserveAspectRatio="none" data-sl-overview-metric-chart-svg="">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" data-sl-overview-metric-chart-gradient-stop="" data-stop="start" />
            <stop offset="100%" data-sl-overview-metric-chart-gradient-stop="" data-stop="end" />
          </linearGradient>
        </defs>
        {comparisonLinePath && (
          <path d={comparisonLinePath} data-sl-overview-metric-chart-comparison-line="" fill="none" />
        )}
        <path d={areaPath} data-sl-overview-metric-chart-area="" fill={`url(#${gradientId})`} />
        <path d={linePath} data-sl-overview-metric-chart-line="" fill="none" />
      </svg>
    </div>
  );
}

/* ------- Overview indicators card (v3 port: OverviewCard) ------- */
const OVERVIEW_TREND_ARROW = { up: "↑", down: "↓" };

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
      <div data-sl-overview-card="">
        <div data-sl-overview-main="">
          {kpis.mainMetrics.map((metric, i) => (
            <div key={i} data-sl-overview-main-metric="">
              <div data-sl-overview-main-metric-body="">
                <div data-sl-overview-main-metric-copy="">
                  <span data-sl-overview-label="">{metric.label}</span>
                  <span data-sl-overview-value="">{metric.value}</span>
                  <span data-sl-overview-main-metric-trend="">
                    <span>{metric.trend}</span>
                    <span data-sl-overview-trend="" data-trend-direction={metric.trendDirection}>
                      {OVERVIEW_TREND_ARROW[metric.trendDirection]}
                    </span>
                  </span>
                </div>
                {metric.chart && (
                  <OverviewMetricChart
                    points={metric.chart.points}
                    comparisonPoints={metric.chart.comparisonPoints}
                    trendDirection={metric.trendDirection}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div data-sl-overview-sub="">
          {kpis.subMetrics.map((metric, i) => (
            <div key={i} data-sl-overview-sub-metric="">
              <span data-sl-overview-label="">{metric.label}</span>
              <span data-sl-overview-sub-value="">{metric.value}</span>
            </div>
          ))}
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

/* ------- Occurrences list — reaproveita o padrão de linha do My Initiatives ------- */
const OPEN_TASKS_MAX = 8;

const OCCURRENCE_STATUS_LABEL = {
  triage:    "Em aberto",
  active:    "Em execução",
  attention: "Requer atenção",
  completed: "Concluída",
};

// Nº de pedidos afetados — vem de detail.affectedOrders (Canvas A) ou detail.impacted (demais tarefas).
function occurrenceScopeCount(t) {
  const d = t.detail || {};
  if (t.canvasPattern === "A") return d.affectedOrders?.total ?? (d.affectedOrders?.items?.length || 0);
  return (d.impacted || []).length;
}

// Texto completo do escopo — a maioria das tarefas escopa em "pedidos afetados",
// mas o Canvas D (triagem de devoluções em lote) escopa em "casos em decisão".
function occurrenceScopeLabel(t) {
  const d = t.detail || {};
  if (t.canvasPattern === "D") {
    const n = (d.exceptions?.rows?.length || 0) + (d.duplicates?.rows?.length || 0);
    return `${n} caso${n === 1 ? "" : "s"} em decisão`;
  }
  const scope = occurrenceScopeCount(t);
  return `${scope} pedido${scope === 1 ? "" : "s"} afetado${scope === 1 ? "" : "s"}`;
}

// SLA restante — só horas ou dias restantes, calculado a partir de detail.slaHours
// (positivo = horas restantes, negativo = horas em atraso, null = sem SLA formal).
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

function OccurrenceRow({ t, onOpen }) {
  const status = t.status || (t.priority === "high" ? "attention" : "active");
  const scopeLabel = occurrenceScopeLabel(t);
  const sla = occurrenceSlaLabel(t);
  return (
    <button data-sl-initiative-row="" data-sl-occurrence-row="" onClick={() => onOpen(t.id)}>
      <span data-sl-occurrence-row-severity="">
        <SevPill level={(t.detail && t.detail.severity) || "medium"} />
      </span>
      <span data-sl-initiative-row-main="">
        <span data-sl-initiative-row-title="">{t.title}</span>
        <span data-sl-initiative-row-meta="">
          <span>{t.tag || (t.source && t.source.label) || "Orders"}</span>
          <span data-sl-initiative-row-dot="">·</span>
          <span>{OCCURRENCE_STATUS_LABEL[status] || status}</span>
        </span>
      </span>
      <span data-sl-occurrence-row-scope="">{scopeLabel}</span>
      <span data-sl-occurrence-row-sla="">{sla}</span>
      <span data-sl-initiative-row-status="">
        <StatusIcon status={status} />
      </span>
    </button>
  );
}

/* Cabeçalho de colunas — mesma grade da linha, com peso visual menor. */
function OccurrenceListHead() {
  return (
    <div data-sl-occurrence-list-head="">
      <span data-sl-occurrence-head-severity="">Severidade</span>
      <span data-sl-occurrence-head-main="">Ocorrência</span>
      <span data-sl-occurrence-head-scope="">Escopo</span>
      <span data-sl-occurrence-head-sla="">SLA</span>
      <span data-sl-occurrence-head-status="" />
    </div>
  );
}

function OpenTasksCard({ onOpen, onGotoTasks }) {
  const { tasks } = AIWData;
  const visible = tasks.slice(0, OPEN_TASKS_MAX);
  const remaining = tasks.length - visible.length;
  return (
    <section className="aiw-section">
      <div className="aiw-section-head">
        <h2>Iniciativas</h2>
        {remaining > 0 && (
          <button className="filter-pill" onClick={() => onGotoTasks && onGotoTasks()}>
            Ver todas ({tasks.length}) <Icon name="chevron-right" size={12} />
          </button>
        )}
      </div>
      <div data-sl-initiative-list="">
        <OccurrenceListHead />
        {visible.map((t) => (
          <OccurrenceRow key={t.id} t={t} onOpen={onOpen} />
        ))}
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

// Returns the most anterior (earliest-index) active stage across all item groups of an order.
// "Active" = first stage whose status is not "done".
function getCurrentStage(order) {
  if (!order.itemGroups || order.itemGroups.length === 0) return null;
  let best = null;
  order.itemGroups.forEach(group => {
    if (!group.stages) return;
    const idx = group.stages.findIndex(s => s.status !== "done");
    if (idx === -1) return; // this group is fully done
    if (best === null || idx < best.idx) {
      best = { idx, stage: group.stages[idx] };
    }
  });
  return best ? best.stage : null;
}

// v3 status order: payment-pending → ... → delivered. Maps our statuses onto a funnel index.
const ORDER_STATUS_SORT = { attention: 0, return: 1, processing: 2, invoiced: 3, error: 4, complete: 5, canceled: 6 };

const ORDER_STATUS_LABEL = {
  processing: "Em processamento",
  invoiced:   "Faturado",
  attention:  "Atenção necessária",
  return:     "Troca e devolução",
  error:      "Com erro",
  complete:   "Concluído",
  canceled:   "Cancelado",
};

// Parses "Visa **** 4512" → { brand: "Visa", last4: "4512" }
function parsePayment(card) {
  if (!card) return null;
  const m = card.match(/^(.*?)\s*\*+\s*(\d{3,4})\s*$/);
  if (m) return { brand: m[1].trim(), last4: m[2] };
  return { brand: card.trim(), last4: null };
}

function AllOrdersTable({ onOpenOrder, search = "" }) {
  const { orders } = AIWData;

  const q = search.trim().toLowerCase();
  const filtered = orders
    .filter((o) =>
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.customer && o.customer.toLowerCase().includes(q)) ||
      (o.origin && o.origin.toLowerCase().includes(q))
    )
    .sort((a, b) => (ORDER_STATUS_SORT[a.status] ?? 9) - (ORDER_STATUS_SORT[b.status] ?? 9));

  const COLS = [
    { key: "status",   label: "Status" },
    { key: "orderId",  label: "ID do pedido" },
    { key: "createdAt", label: "Data de criação" },
    { key: "customer", label: "Cliente" },
    { key: "items",    label: "Itens", align: "end" },
    { key: "total",    label: "Total", align: "end" },
    { key: "origin",   label: "Origem" },
    { key: "payment",  label: "Pagamento" },
  ];

  if (filtered.length === 0) {
    return (
      <section className="aiw-section">
        <div data-sl-orders-empty="">Nenhum pedido encontrado para “{search}”.</div>
      </section>
    );
  }

  return (
    <section className="aiw-section">
      <div data-sl-orders-scroll="">
        <div data-sl-orders-group="">
          <div data-sl-orders-table="">
            {/* Header */}
            <div data-sl-orders-row="" data-orders-head="">
              {COLS.map((c) => (
                <div key={c.key} data-sl-orders-cell="" data-align={c.align || undefined}>
                  {c.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((o) => {
              const pay = parsePayment(o.customerDetail && o.customerDetail.card);
              const totalMatch = (o.total || "").match(/^(\S+)\s+(.*)$/); // "R$ 1.139,20" → ["R$","1.139,20"]
              return (
                <div
                  key={o.id}
                  data-sl-orders-row=""
                  data-orders-body=""
                  onClick={() => onOpenOrder && onOpenOrder(o.id)}
                >
                  {/* Status */}
                  <div data-sl-orders-cell="">
                    <span data-sl-order-status-tag="" data-status={o.status}>
                      {ORDER_STATUS_LABEL[o.status] || o.statusLabel || "—"}
                    </span>
                  </div>
                  {/* Order ID */}
                  <div data-sl-orders-cell="">
                    <span data-sl-orders-id="" data-sl-orders-text-ellipsis="">{o.id}</span>
                  </div>
                  {/* Created at */}
                  <div data-sl-orders-cell="">
                    <span data-sl-orders-muted="" data-sl-orders-text-ellipsis="">{o.date}</span>
                  </div>
                  {/* Customer */}
                  <div data-sl-orders-cell="">
                    <span data-sl-orders-text-ellipsis="">{o.customer}</span>
                  </div>
                  {/* Items */}
                  <div data-sl-orders-cell="" data-align="end">
                    <span data-sl-orders-items="">{o.qty}</span>
                  </div>
                  {/* Total */}
                  <div data-sl-orders-cell="" data-align="end" data-orders-total="">
                    {totalMatch ? (
                      <>
                        <span data-sl-orders-total-currency="">{totalMatch[1]}</span>
                        <span data-sl-orders-total-amount="">{totalMatch[2]}</span>
                      </>
                    ) : (
                      <span data-sl-orders-total-amount="">{o.total}</span>
                    )}
                  </div>
                  {/* Origin */}
                  <div data-sl-orders-cell="">
                    <span data-sl-orders-text-ellipsis="">{o.origin}</span>
                  </div>
                  {/* Payment */}
                  <div data-sl-orders-cell="">
                    {pay ? (
                      <span data-sl-order-payment="">
                        <span data-sl-order-payment-brand="">{pay.brand}</span>
                      </span>
                    ) : (
                      <span data-sl-orders-muted="">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------- Assistant view (router) ------- */
function AssistantView({ onOpenTask, onGotoResource, onOpenOrder }) {
  const [tab, setTab] = useState("overview"); // overview | orders
  const [chatMsgs, setChatMsgs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const orderSearchRef = useRef(null);
  const engineRef = useRef(null);
  const chatScrollRef = useRef(null);

  const TABS = [
    { id: "overview", label: "Visão geral" },
    { id: "orders",   label: "Orders" },
  ];

  const openHeaderSearch = () => {
    setSearchOpen(true);
    setTimeout(() => orderSearchRef.current?.focus(), 40);
  };

  useEffect(() => {
    engineRef.current = ChatEngine.create({
      context: "assistant",
      data: AIWData,
      onNavigate: (route) => { if (onOpenOrder && route.orderId) onOpenOrder(route.orderId); },
      onCreateExperience: () => {},
      onAgentSay: (msgs) => setChatMsgs((m) => [...m, ...msgs]),
      onTyping: setIsTyping,
    });
  }, []);

  // Scroll chat tray to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMsgs, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setChatMsgs((m) => [...m, { from: "user", text }]);
    engineRef.current && engineRef.current.send(text);
  };

  // Render a single chat message inline (uses same CSS classes as ChatPanel)
  const renderChatMsg = (m, i) => {
    if (m.from === "user") {
      return (
        <div key={i} className="msg msg-user">
          <div className="bubble">{m.text}</div>
        </div>
      );
    }
    return (
      <div key={i} className="msg msg-assistant">
        {m.text && <div className="msg-text" style={{ whiteSpace: "pre-line" }}>{m.text}</div>}

        {m.type === "action" && (
          <div className="chat-action-card">
            <div className="chat-action-card-body">
              <span className="chat-action-card-title">{m.title}</span>
              {m.body && <span className="chat-action-card-desc" style={{ whiteSpace: "pre-line" }}>{m.body}</span>}
            </div>
            <button className="btn btn-sm btn-primary chat-action-apply" onClick={m.onApply}>
              Aplicar
            </button>
          </div>
        )}

        {m.type === "wf-draft" && m.draft && (
          <div className="chat-draft-card">
            <div className="chat-draft-header"><span>✨</span><span>Nova Experiência</span></div>
            <div className="chat-draft-rows">
              <div className="chat-draft-row">
                <span className="chat-draft-label">Nome</span>
                <strong>{m.draft.name}</strong>
              </div>
              {m.draft.category && (
                <div className="chat-draft-row">
                  <span className="chat-draft-label">Modelo</span>
                  <strong>{m.draft.category}</strong>
                </div>
              )}
              <div className="chat-draft-row">
                <span className="chat-draft-label">Agente AI</span>
                <strong>{m.draft.aiOrch ? "Ativo" : "Desativado"}</strong>
              </div>
            </div>
            <button className="btn btn-sm btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={m.onConfirm}>
              Criar Experiência
            </button>
          </div>
        )}

        {m.type === "order-list" && m.orders && m.orders.length > 0 && (
          <div className="chat-order-list">
            {m.orders.map((o) => (
              <button key={o.id} className="chat-order-row"
                onClick={() => m.onOpenOrder && m.onOpenOrder(o.id)}>
                <span className="chat-order-id">
                  <span>{o.id}</span>
                  <span className="muted" style={{ fontSize: 10 }}>({o.short})</span>
                </span>
                <span className="chat-order-customer">{o.customer}</span>
                <span className="chat-order-meta">
                  <span className="chat-order-sla">SLA {o.sla}</span>
                  <span className="chat-order-eta">ETA {o.eta}</span>
                </span>
                <span className={`orders-status orders-status-${o.status}`} style={{ fontSize: 11 }}>{o.statusLabel}</span>
                <Icon name="chevron-right" size={12} />
              </button>
            ))}
          </div>
        )}

        {m.quickReplies && m.quickReplies.length > 0 && (
          <div className="chat-quick-replies">
            {m.quickReplies.map((r, j) => {
              const label = typeof r === "string" ? r : r.label;
              return (
                <button key={j} className="chat-quick-reply"
                  onClick={() => handleSend(label)}>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="main">
      {/* ── v3 module-browser header (Orders) ── */}
      <div data-sl-my-tasks-sticky-top="">
        <div data-sl-module-browser-top-bar="" data-sl-module-browser-search-open={searchOpen ? "" : undefined}>

          {!searchOpen && (
            <div data-sl-module-browser-top-bar-title="">
              <h1 data-sl-browse-page-title="">Orders</h1>
            </div>
          )}

          {!searchOpen && (
            <nav data-sl-module-browser-top-bar-tabs="" aria-label="Seções de Orders">
              <div data-sl-module-browser-page-tab-row="">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    data-sl-module-browser-page-tab=""
                    data-active={tab === t.id ? "" : undefined}
                    aria-pressed={tab === t.id}
                    onClick={() => setTab(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>
          )}

          {searchOpen && (
            <div data-sl-module-browser-search="" onClick={() => orderSearchRef.current?.focus()}>
              <span data-sl-module-browser-search-pre-icon="" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
                </svg>
              </span>
              <input
                ref={orderSearchRef}
                type="search"
                data-sl-module-browser-search-input=""
                placeholder="Buscar por pedido, cliente ou origem…"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { setOrderSearch(""); setSearchOpen(false); } }}
              />
              {orderSearch && (
                <button
                  data-sl-module-browser-search-clear=""
                  onClick={() => { setOrderSearch(""); orderSearchRef.current?.focus(); }}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                  aria-label="Limpar busca"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/></svg>
                </button>
              )}
            </div>
          )}

          <div data-sl-module-browser-toolbar="">
            {!searchOpen && (
              <button data-sl-module-browser-header-icon-action="" aria-label="Buscar" title="Buscar" onClick={openHeaderSearch}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
                </svg>
              </button>
            )}
            {searchOpen && (
              <button data-sl-module-browser-header-icon-action="" aria-label="Fechar busca" title="Fechar busca" onClick={() => { setOrderSearch(""); setSearchOpen(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/></svg>
              </button>
            )}
            {!searchOpen && (
              <button data-sl-module-browser-header-icon-action="" aria-label="Filtros" title="Filtros">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M8 12h8M10.5 17h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            )}
            <Dropdown
              align="right"
              trigger={
                <button data-sl-module-browser-header-icon-action="" aria-label="Configurações" title="Configurações">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/></svg>
                </button>
              }
            >
              <button className="dd-item" onClick={() => onGotoResource && onGotoResource("workflow-board")}>
                <span className="dd-item-icon"><Icon name="board" size={14} /></span>
                <span>
                  <span className="dd-item-label">Gerenciador de Experiências</span>
                  <span className="dd-item-sub">{AIWData.workflows.length} workflows configurados</span>
                </span>
              </button>
              <button className="dd-item" onClick={() => onGotoResource && onGotoResource("all-orders")}>
                <span className="dd-item-icon"><Icon name="cart" size={14} /></span>
                <span>
                  <span className="dd-item-label">Orders Settings</span>
                  <span className="dd-item-sub">Preferências da operação</span>
                </span>
              </button>
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="scroll" data-screen-label="01 My Assistant">
        <div className="aiw-wrap">
          {tab === "overview" &&
            <>
              <OverviewCard />
              <OpenTasksCard onOpen={onOpenTask} onGotoTasks={() => onGotoResource && onGotoResource("tasks")} />
            </>
          }
          {tab === "orders" && <AllOrdersTable onOpenOrder={onOpenOrder} search={orderSearch} />}
        </div>
      </div>

      {/* Chat tray — appears above the composer when there are messages */}
      {tab === "overview" && (chatMsgs.length > 0 || isTyping) && (
        <div
          ref={chatScrollRef}
          style={{
            maxHeight: 320,
            overflowY: "auto",
            borderTop: "1px solid var(--border, #e5e7eb)",
            background: "var(--bg, #fff)",
            padding: "12px 16px 4px",
          }}
        >
          {chatMsgs.map(renderChatMsg)}
          {isTyping && (
            <div className="msg msg-assistant">
              <div className="chat-typing"><span /><span /><span /></div>
            </div>
          )}
        </div>
      )}

      {tab === "overview" &&
        <div className="aiw-composer-bar">
          <MessageComposer
            placeholder="Pergunte sobre pedidos, regras ou crie uma experiência…"
            onSend={handleSend}
          />
        </div>
      }
    </div>
  );
}

window.AssistantView = AssistantView;
