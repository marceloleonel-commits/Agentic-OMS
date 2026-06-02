/* global React, Icon, AIWData, MessageComposer, ChatEngine */
const { useState, useEffect, useRef } = React;

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
function AllOrdersTable({ onOpenOrder }) {
  const { orders } = AIWData;
  return (
    <section className="aiw-section">
      <div className="orders-filterbar">
        <div className="orders-search">
          <Icon name="search" size={14} />
          <input placeholder="Buscar pedido…" />
        </div>
        <span className="orders-chip">
          <span className="orders-chip-lbl">Data do pedido:</span>
          <span className="orders-chip-val">Hoje</span>
          <button className="orders-chip-x" aria-label="Remover filtro"><Icon name="x" size={12} /></button>
        </span>
        <button className="orders-addfilter"><Icon name="plus" size={14} /> Adicionar filtro</button>
      </div>

      <div className="orders-table">
        <div className="orders-thead">
          <span>ID do pedido</span>
          <span>Data de criação</span>
          <span>Cliente</span>
          <span>Origem</span>
          <span>Itens</span>
          <span>Total</span>
          <span>Status</span>
          <span>Caso de Uso</span>
          <span />
        </div>
        {orders.map((o, i) =>
          <div key={i} className="orders-row" style={{ cursor: "pointer" }}
               onClick={() => onOpenOrder && onOpenOrder(o.id)}>
            <span className="orders-id">
              {o.id}<br/>
              <span className="muted" style={{ fontSize: 11 }}>({o.short})</span>
            </span>
            <span className="muted">{o.date}</span>
            <span>{o.customer}</span>
            <span>{o.origin}</span>
            <span>{o.qty}</span>
            <span>{o.total}</span>
            <span><span className={`orders-status orders-status-${o.status}`}>{o.statusLabel}</span></span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-2)" }}>{o.seller || "—"}</span>
            <span>
              <button className="icon-btn" onClick={e => e.stopPropagation()}><Icon name="more" size={16} /></button>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------- Assistant view (router) ------- */
function AssistantView({ onOpenTask, onGotoResource, onOpenOrder }) {
  const [tab, setTab] = useState("overview"); // overview | orders
  const [chatMsgs, setChatMsgs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const engineRef = useRef(null);
  const chatScrollRef = useRef(null);

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
          {tab === "orders" && <AllOrdersTable onOpenOrder={onOpenOrder} />}
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
