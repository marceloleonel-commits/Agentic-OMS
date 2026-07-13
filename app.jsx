/* global React, ReactDOM, Sidebar, Icon, AppData, AIWData, AssistantView, TaskView, OrderDetailView, WorkflowBoardView, ChatPanel, ResizableSplit, ChatEngine, AITeamDrawer, Dropdown, MessageComposer, ChatsView, InitiativesView, HomePreviewView, HomeQueueView */
const { useState, useEffect, useRef } = React;

/* ── Hash-based routing ─────────────────────────────────────────────────── */
function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '') || 'orders';
  const [top, ...rest] = raw.split('/');
  if (!top || top === 'orders') return { name: 'orders' };
  if (top === 'order-detail') return { name: 'order-detail', orderId: rest[0] };
  if (top === 'task') return { name: 'task', id: rest[0] };
  if (top === 'assistant') return { name: 'assistant' };
  if (top === 'workflow-board') {
    const wfId = rest[0];
    if (!wfId) return { name: 'workflow-board', wfMode: { kind: 'list' } };
    if (!rest[1]) return { name: 'workflow-board', wfMode: { kind: 'detail', workflowId: wfId } };
    if (rest[1] === 'task')     return { name: 'workflow-board', wfMode: { kind: 'task',     workflowId: wfId, taskId:  rest[2] } };
    if (rest[1] === 'stage')    return { name: 'workflow-board', wfMode: { kind: 'stage',    workflowId: wfId, stageId: rest[2] } };
    if (rest[1] === 'settings') return { name: 'workflow-board', wfMode: { kind: 'settings', workflowId: wfId, section: rest[2] || 'geral' } };
    return { name: 'workflow-board', wfMode: { kind: 'detail', workflowId: wfId } };
  }
  return { name: top };
}
function modeToHash(m) {
  if (!m || m.kind === 'list') return '#/workflow-board';
  if (m.kind === 'detail')   return `#/workflow-board/${m.workflowId}`;
  if (m.kind === 'task')     return `#/workflow-board/${m.workflowId}/task/${m.taskId}`;
  if (m.kind === 'stage')    return `#/workflow-board/${m.workflowId}/stage/${m.stageId}`;
  if (m.kind === 'settings') return `#/workflow-board/${m.workflowId}/settings/${m.section || 'geral'}`;
  return '#/workflow-board';
}
function routeToHash(r) {
  if (r.name === 'order-detail')   return `#/order-detail/${r.orderId}`;
  if (r.name === 'task')           return `#/task/${r.id}`;
  if (r.name === 'workflow-board') return modeToHash(r.wfMode);
  return `#/${r.name}`;
}

function App() {
  const _init = parseHash();
  const [route, setRouteState] = useState(_init);
  const [wfMode, setWfMode] = useState(_init.wfMode || { kind: 'list' });
  const [wfBoardKey, setWfBoardKey] = useState(0);
  const [productView, setProductView] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [aiOpen, setAIOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);

  const [orderChatMsgs, setOrderChatMsgs] = useState([]);
  const [orderChatTyping, setOrderChatTyping] = useState(false);
  const [orderDynamicChips, setOrderDynamicChips] = useState([]);
  const orderEngineRef = useRef(null);

  const setRoute = (r) => {
    setRouteState(r);
    if (r.name === 'workflow-board') {
      const m = r.wfMode || { kind: 'list' };
      setWfMode(m);
      window.history.pushState(null, '', modeToHash(m));
    } else {
      window.history.pushState(null, '', routeToHash(r));
    }
  };

  const handleWfModeChange = (m) => {
    setWfMode(m);
    window.history.pushState(null, '', modeToHash(m));
  };

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', routeToHash(_init));
    }
    const onPop = () => {
      const parsed = parseHash();
      setRouteState(parsed);
      if (parsed.name === 'workflow-board') {
        setWfMode(parsed.wfMode || { kind: 'list' });
        setWfBoardKey(k => k + 1);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /* Order-detail chat engine */
  useEffect(() => {
    if (route.name !== "order-detail") return;
    const orderId = route.orderId;
    const currentOrder = AIWData.orders.find(o => o.id === orderId);
    const isReturnOrder = currentOrder?.status === "return";
    const initialMsgs = currentOrder ? (
      isReturnOrder ? [
        { from: "agent", text: `**Coleta Reversa pendente** — Samsung Galaxy S24 FE 128GB\n\nO cliente Ricardo Alves solicitou devolução por defeito de fabricação em 01/06/2026. O Returns Agent validou a elegibilidade, classificou como **devolução com estorno integral** e gerou a etiqueta reversa via Total Express.\n\nA etiqueta foi enviada por e-mail em 01/06 às 18:36. Já se passaram **+24h sem confirmação de postagem** do cliente.` },
        { from: "agent", text: `As etapas de **Inspeção no CD** e **Estorno Financeiro** estão bloqueadas até a postagem ser confirmada. O prazo de devolução expira em **08/06/2026**.` },
        { from: "agent", text: "Como deseja prosseguir?", quickReplies: ["Reenviar etiqueta reversa ao cliente", "Reagendar coleta em domicílio", "Cancelar devolução e fechar solicitação", "Escalar para Atendimento →"] }
      ] : [
        { from: "agent", text: `O Agente de Orquestração está acompanhando este pedido.\n\n${currentOrder.qty} item(ns) · ${currentOrder.total}${currentOrder.sla !== "—" ? ` · SLA ${currentOrder.sla}` : ""}` },
        { from: "agent", text: "O que deseja fazer?", quickReplies: ["Alterar item do pedido", "Cancelar o pedido", "Verificar SLA restante"] }
      ]
    ) : [{ from: "agent", text: "Selecione um pedido para começar." }];
    setOrderChatMsgs(initialMsgs);
    setOrderChatTyping(false);
    setOrderDynamicChips([]);
    orderEngineRef.current = ChatEngine.create({
      context: "order-detail",
      data: AIWData,
      orderId,
      onNavigate: (r) => setRoute({ name: "order-detail", orderId: r.orderId }),
      onAgentSay: (msgs) => setOrderChatMsgs(m => [...m, ...msgs]),
      onTyping: setOrderChatTyping,
      onAddChip: (chip) => setOrderDynamicChips(prev => [...prev, chip]),
    });
  }, [route.name, route.orderId]);

  useEffect(() => { setProductView(null); }, [route.orderId]);

  const goHome   = () => setRoute({ name: "orders" });
  const openTask = (id) => setRoute({ name: "task", id });
  const openOrder = (id) => setRoute({ name: "order-detail", orderId: id });
  const gotoResource = (id) => {
    if (id === "workflow-board") setRoute({ name: "workflow-board" });
    else if (id === "all-orders") setRoute({ name: "orders" });
    else if (id === "tasks") setRoute({ name: "tasks" });
  };
  const pickAgent = (id) => {
    setAIOpen(false);
    if (id === "assistant") setRoute({ name: "orders" });
  };
  const openConversation = (id) => {
    setActiveConvId(id);
    setRoute({ name: "chats", convId: id });
  };

  /* ── Topbar actions ── */
  const renderTopbarActions = () => (
    <div className="topbar-right">
      <Dropdown
        trigger={
          <button className="topbar-action icon-only" title="Settings">
            <Icon name="settings" size={16} />
          </button>
        }>
        <button className="dd-item" onClick={() => setRoute({ name: "workflow-board" })}>
          <span className="dd-item-icon"><Icon name="board" size={14} /></span>
          <span>
            <span className="dd-item-label">Gerenciador de Experiências</span>
            <span className="dd-item-sub">{AIWData.workflows.length} workflows configurados</span>
          </span>
        </button>
        <button className="dd-item" onClick={() => setRoute({ name: "orders" })}>
          <span className="dd-item-icon"><Icon name="cart" size={14} /></span>
          <span>
            <span className="dd-item-label">Orders Settings</span>
            <span className="dd-item-sub">Preferências da operação</span>
          </span>
        </button>
      </Dropdown>

      <Dropdown
        trigger={
          <button className="topbar-action">
            My AI Team <Icon name="chevron-down" size={12} />
          </button>
        }>
        <button className="dd-item" onClick={() => setAIOpen(true)}>
          <span className="dd-item-icon ai"><Icon name="grid" size={14} /></span>
          <span>
            <span className="dd-item-label">Ver todos os agentes</span>
            <span className="dd-item-sub">Drawer com {AIWData.aiTeam.length} agentes</span>
          </span>
        </button>
      </Dropdown>
    </div>
  );

  /* ── Module-browser sticky header (same component as TasksView) ── */
  const renderModuleHeader = (title) => (
    <div data-sl-my-tasks-sticky-top="">
      <div data-sl-module-browser-top-bar="">
        <div data-sl-module-browser-top-bar-title="">
          <h1 data-sl-browse-page-title="">{title}</h1>
        </div>
      </div>
    </div>
  );

  /* ── View selection ── */
  let view;
  if (route.name === "orders") {
    view = <AssistantView onOpenTask={openTask} onGotoResource={gotoResource} onOpenOrder={openOrder} />;
  } else if (route.name === "assistant") {
    view = (
      <div className="main">
        {renderModuleHeader("My Assistant")}
        <div className="scroll">
          <div className="aiw-placeholder">
            <div className="aiw-placeholder-eyebrow">My Assistant</div>
            <h2 className="aiw-placeholder-title">Pergunte qualquer coisa.</h2>
            <p className="aiw-placeholder-sub">Este é o ponto de partida do seu assistente.</p>
          </div>
        </div>
        <div className="aiw-composer-bar">
          <MessageComposer placeholder="Message VTEX My Assistant..." />
        </div>
      </div>
    );
  } else if (route.name === "tasks") {
    view = <TasksView />;
  } else if (route.name === "chats") {
    view = (
      <ChatsView
        conversations={AIWData.conversations}
        activeConvId={activeConvId}
        onOpenConversation={openConversation}
        renderTopbarActions={renderTopbarActions}
      />
    );
  } else if (route.name === "initiatives") {
    view = <InitiativesView onOpenTask={openTask} renderTopbarActions={renderTopbarActions} />;
  } else if (route.name === "home-preview") {
    // Situation-room dashboard ported from Canvas-Wireframes. Isolated route —
    // does not replace or affect the "orders" home (route.name === "orders").
    view = <HomePreviewView onOpenTask={openTask} onGotoResource={gotoResource} />;
  } else if (route.name === "home-queue") {
    // Unified-queue variant (occurrences + tasks in one feed). Isolated route —
    // does not replace or affect #/home-preview or #/orders.
    view = <HomeQueueView onOpenTask={openTask} onGotoResource={gotoResource} />;
  } else if (route.name === "task") {
    view = <TaskView taskId={route.id} onBack={goHome} onOpenOrder={openOrder} />;
  } else if (route.name === "workflow-board") {
    view = <WorkflowBoardView
      key={wfBoardKey}
      onBack={goHome}
      wfLayout="expanded"
      wfGroup="flat"
      wfDetailView="flat"
      initialMode={wfMode}
      onModeChange={handleWfModeChange}
    />;
  } else if (route.name === "order-detail") {
    const currentOrder = AIWData.orders.find(o => o.id === route.orderId);
    const syntheticTask = {
      detail: {
        impacted: currentOrder ? [{ id: currentOrder.id, sla: currentOrder.sla || "—", seller: currentOrder.seller || currentOrder.origin, eta: currentOrder.eta || "—" }] : []
      }
    };
    const orderChips = currentOrder?.status === "return" ? [
      { icon: "send",    label: "Reenviar etiqueta reversa"     },
      { icon: "sparkle", label: "Reagendar coleta em domicílio" },
      { icon: "x",       label: "Cancelar devolução"            },
      { icon: "sparkle", label: "Escalar para Atendimento"      },
    ] : [
      { icon: "edit",    label: "Alterar item do pedido"  },
      { icon: "x",       label: "Cancelar o pedido"       },
      { icon: "graph",   label: "Verificar SLA restante"  },
      { icon: "sparkle", label: "Escalar para Supervisor" },
    ];
    const handleOrderChatSend = (text, opts) => {
      setOrderChatMsgs(m => [...m, { from: "user", text }]);
      orderEngineRef.current && orderEngineRef.current.send(text, opts);
    };
    view = (
      <ResizableSplit screenLabel="Order Detail" initialWidth={400}>
        <ChatPanel
          title={currentOrder ? `Pedido ${currentOrder.short}` : "Detalhe do Pedido"}
          chips={orderDynamicChips.length > 0 ? orderDynamicChips : orderChips}
          alwaysShowChips={true}
          messages={orderChatMsgs}
          onSend={handleOrderChatSend}
          isTyping={orderChatTyping}
          placeholder="Pergunte sobre este pedido…"
          onBack={goHome}
        />
        <div className="detail-panel">
          <div className="detail-head no-border">
            <div className="detail-head-left">
              {productView !== null ? (
                <button className="od-back-link" onClick={() => setProductView(null)}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--fg-2)", fontSize: 13 }}>
                  <Icon name="chevron-left" size={14} /> Pedido {route.orderId}
                </button>
              ) : (
                <button className="od-back-link" onClick={goHome}
                  style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--fg-2)", fontSize: 13 }}>
                  <Icon name="chevron-left" size={14} /> Todos os Pedidos
                </button>
              )}
            </div>
          </div>
          <div className="detail-scroll">
            <div className="detail-body">
              <OrderDetailView
                task={syntheticTask}
                orderId={route.orderId}
                onBack={goHome}
                onOpenOrder={(id) => setRoute({ name: "order-detail", orderId: id })}
                standalone={true}
                productView={productView}
                onProductViewChange={setProductView}
              />
            </div>
          </div>
        </div>
      </ResizableSplit>
    );
  } else {
    view = (
      <div className="main">
        {renderModuleHeader(route.name)}
        <div className="scroll">
          <div style={{ padding: 60, textAlign: "center", color: "var(--fg-3)" }}>
            View "{route.name}" — em construção.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar
        route={route}
        setRoute={setRoute}
        conversations={AppData.conversations}
        openConversation={openConversation}
        activeConvId={activeConvId}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openInitiative={() => {}}
        onOpenAITeam={() => setAIOpen(true)}
      />
      {view}

      <AITeamDrawer open={aiOpen} onClose={() => setAIOpen(false)} onPick={pickAgent} />
      {aiOpen && (
        <div
          className="modal-backdrop"
          style={{ background: "rgba(15,17,21,.35)", zIndex: 35 }}
          onClick={() => setAIOpen(false)}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
