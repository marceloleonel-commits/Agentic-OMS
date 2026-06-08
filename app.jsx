/* global React, ReactDOM, Sidebar, Icon, AppData, AIWData, AssistantView, TaskView, OrderDetailView, WorkflowBoardView, OrchestrationView, ChatPanel, ResizableSplit, ChatEngine, AITeamDrawer, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor */
const { useState, useEffect, useRef, useCallback } = React;

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "accent": "#2962FF",
  "sidebarTone": "navy",
  "sidebarCollapsed": true,
  "wfLayout": "expanded",
  "wfGroup": "flat",
  "wfDetailView": "2-passos"
}/*EDITMODE-END*/;

/* ── Hash-based routing ─────────────────────────────────────────────────── */
function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '') || 'orders';
  const [top, ...rest] = raw.split('/');
  if (!top || top === 'orders') return { name: 'orders' };
  if (top === 'order-detail') return { name: 'order-detail', orderId: rest[0] };
  if (top === 'task') return { name: 'task', id: rest[0] };
  if (top === 'orchestration') return { name: 'orchestration' };
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

/* -------- tiny dropdown helper for topbar -------- */
function Dropdown({ trigger, children, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  return (
    <div className="dd-wrap" ref={ref}>
      <span onClick={() => setOpen((o) => !o)}>{trigger}</span>
      {open && (
        <div className={`dd-menu ${align}`} onClick={() => setOpen(false)}>{children}</div>
      )}
    </div>
  );
}

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);

  // ── URL-driven routing ───────────────────────────────────────────────────
  const _init = parseHash();
  const [route, setRouteState] = useState(_init);
  const [wfMode, setWfMode] = useState(_init.wfMode || { kind: 'list' });
  const [wfBoardKey, setWfBoardKey] = useState(0);

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

  // Browser back / forward
  useEffect(() => {
    // Set initial URL if hash is missing
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

  const [activeConvId, setActiveConvId] = useState(null);
  const [collapsed, setCollapsed] = useState(!!tweaks.sidebarCollapsed);
  const [aiOpen, setAIOpen] = useState(false);

  // Order-detail intelligent chat state
  const [orderChatMsgs, setOrderChatMsgs] = useState([]);
  const [orderChatTyping, setOrderChatTyping] = useState(false);
  const [orderDynamicChips, setOrderDynamicChips] = useState([]);
  const orderEngineRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary", tweaks.accent);
    document.documentElement.style.setProperty("--primary-hover", shade(tweaks.accent, -10));
  }, [tweaks.accent]);

  useEffect(() => {
    const tones = {
      navy:     ["#071127", "#162955", "#162955"],
      ink:      ["#0A0A0B", "#161618", "#1C1C1F"],
      graphite: ["#1A1A1F", "#26262C", "#2D2D33"]
    };
    const [bg, hover, active] = tones[tweaks.sidebarTone] || tones.navy;
    document.documentElement.style.setProperty("--sidebar-bg", bg);
    document.documentElement.style.setProperty("--sidebar-bg-hover", hover);
    document.documentElement.style.setProperty("--sidebar-bg-active", active);
  }, [tweaks.sidebarTone]);

  useEffect(() => {
    if (tweaks.density === "compact") {
      document.documentElement.style.setProperty("--row-h", "40px");
      document.body.style.fontSize = "13px";
    } else {
      document.documentElement.style.setProperty("--row-h", "48px");
      document.body.style.fontSize = "14px";
    }
  }, [tweaks.density]);

  // Re-initialise the order-detail chat engine whenever we navigate to a new order
  useEffect(() => {
    if (route.name !== "order-detail") return;
    const orderId = route.orderId;
    const currentOrder = AIWData.orders.find(o => o.id === orderId);
    const initialMsgs = currentOrder ? [
      {
        from: "agent",
        text: `O Agente de Orquestração está acompanhando este pedido.\n\n${currentOrder.qty} item(ns) · ${currentOrder.total}${currentOrder.sla !== "—" ? ` · SLA ${currentOrder.sla}` : ""}`,
      },
      {
        from: "agent",
        text: "O que deseja fazer?",
        quickReplies: [
          "Alterar item do pedido",
          "Cancelar o pedido",
          "Verificar SLA restante",
        ]
      }
    ] : [{ from: "agent", text: "Selecione um pedido para começar." }];
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

  const goHome   = () => setRoute({ name: "orders" });
  const openTask = (id) => setRoute({ name: "task", id });
  const openOrder = (id) => setRoute({ name: "order-detail", orderId: id });
  const gotoResource = (id) => {
    if (id === "workflow-board") setRoute({ name: "workflow-board" });
    else if (id === "orchestration") setRoute({ name: "orchestration" });
    else if (id === "all-orders") setRoute({ name: "orders" });
  };

  const pickAgent = (id) => {
    setAIOpen(false);
    if (id === "assistant") setRoute({ name: "orders" });
    else if (id === "orchestration") setRoute({ name: "orchestration" });
  };

  const openConversation = (id) => {
    setActiveConvId(id);
    setRoute({ name: "conversations", convId: id });
  };

  /* ---------- header (only for non-split routes) ---------- */
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
            <span className="dd-item-sub">7 workflows configurados</span>
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
        <button className="dd-item" onClick={() => { setAIOpen(true); }}>
          <span className="dd-item-icon ai"><Icon name="grid" size={14} /></span>
          <span>
            <span className="dd-item-label">Ver todos os agentes</span>
            <span className="dd-item-sub">Drawer com {AIWData.aiTeam.length} agentes</span>
          </span>
        </button>
      </Dropdown>
    </div>
  );

  /* ---------- view selection ---------- */
  let view;
  if (route.name === "orders") {
    view = <AssistantView onOpenTask={openTask} onGotoResource={gotoResource} onOpenOrder={openOrder} />;
  } else if (route.name === "assistant") {
    view = (
      <div className="main">
        <header className="topbar">
          <h1 className="crumb">My Assistant</h1>
        </header>
        <div className="scroll">
          <div className="aiw-placeholder">
            <div className="aiw-placeholder-eyebrow">My Assistant</div>
            <h2 className="aiw-placeholder-title">Pergunte qualquer coisa.</h2>
            <p className="aiw-placeholder-sub">
              Este é o ponto de partida do seu assistente. Conteúdos específicos
              de operação vivem nas suas verticais — comece em <b>Orders</b> para
              ver KPIs, tarefas em aberto e workflows.
            </p>
          </div>
        </div>
        <div className="aiw-composer-bar">
          <MessageComposer placeholder="Message VTEX My Assistant..." />
        </div>
      </div>
    );
  } else if (route.name === "task") {
    view = <TaskView taskId={route.id} onBack={goHome} onOpenOrder={openOrder} />;
  } else if (route.name === "workflow-board") {
    view = <WorkflowBoardView key={wfBoardKey} onBack={goHome} wfLayout={tweaks.wfLayout} wfGroup={tweaks.wfGroup} wfDetailView={tweaks.wfDetailView} initialMode={wfMode} onModeChange={handleWfModeChange} />;
  } else if (route.name === "orchestration") {
    view = <OrchestrationView onBack={goHome} onOpenOrder={openOrder} />;
  } else if (route.name === "order-detail") {
    const currentOrder = AIWData.orders.find(o => o.id === route.orderId);
    const syntheticTask = {
      detail: {
        impacted: AIWData.orders.map(o => ({
          id: o.id,
          sla: o.sla || "—",
          seller: o.seller || o.origin,
          eta: o.eta || "—"
        }))
      }
    };
    const orderChips = [
      { icon: "edit",    label: "Alterar item do pedido"  },
      { icon: "x",       label: "Cancelar o pedido"       },
      { icon: "graph",   label: "Verificar SLA restante"  },
      { icon: "sparkle", label: "Escalar para Supervisor" }
    ];
    const handleOrderChatSend = (text, opts) => {
      setOrderChatMsgs(m => [...m, { from: "user", text }]);
      orderEngineRef.current && orderEngineRef.current.send(text, opts);
    };
    view = (
      <ResizableSplit screenLabel="Order Detail">
        <ChatPanel
          title={currentOrder ? `Pedido ${currentOrder.short}` : "Detalhe do Pedido"}
          chips={orderDynamicChips}
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
              <button
                className="od-back-link"
                onClick={goHome}
                style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "var(--fg-2)", fontSize: 13 }}
              >
                <Icon name="chevron-left" size={14} /> Todos os Pedidos
              </button>
            </div>
          </div>
          <div className="detail-scroll">
            <div className="detail-body">
              <OrderDetailView
                task={syntheticTask}
                orderId={route.orderId}
                onBack={goHome}
                onOpenOrder={(id) => setRoute({ name: "order-detail", orderId: id })}
              />
            </div>
          </div>
        </div>
      </ResizableSplit>
    );
  } else {
    // Other routes (initiatives, conversations) keep an empty placeholder for now
    view = (
      <div className="main">
        <header className="topbar">
          <h1 className="crumb">{route.name}</h1>
          {renderTopbarActions()}
        </header>
        <div className="scroll">
          <div style={{ padding: 60, textAlign: "center", color: "var(--fg-3)" }}>
            View "{route.name}" not yet populated in this prototype.
          </div>
        </div>
      </div>
    );
  }

  /* Inject topbar actions into assistant/wb/oa views' topbars via portal-like attach */
  useEffect(() => {
    const tbRight = document.querySelector(".main .topbar .topbar-right.aiw-placeholder");
    // No-op — actions are rendered inline below as a floating bar.
  });

  return (
    <div className={`app ${collapsed ? "has-collapsed" : ""}`}>
      <Sidebar
        route={route}
        setRoute={setRoute}
        conversations={AppData.conversations}
        openConversation={openConversation}
        activeConvId={activeConvId}
        collapsed={collapsed}
        setCollapsed={(v) => { setCollapsed(v); setTweak("sidebarCollapsed", v); }}
        openInitiative={() => {}}
      />
      {view}

      {/* Floating topbar actions (Settings + My AI team) — only on non-split routes */}
      {!["task", "workflow-board", "orchestration", "assistant", "order-detail"].includes(route.name) &&
        <div className="aiw-global-actions">
          {renderTopbarActions()}
        </div>
      }

      <button
        onClick={() => window.postMessage({ type: '__activate_edit_mode' }, '*')}
        title="Abrir Tweaks"
        style={{
          position: 'fixed', bottom: 16, left: 16, zIndex: 2147483645,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 12px 6px 8px', borderRadius: 99,
          background: 'rgba(30,30,35,.82)', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 2px 12px rgba(0,0,0,.25)',
          letterSpacing: '.01em',
        }}
      >
        <Icon name="settings" size={13} />
        Tweaks
      </button>

      <AITeamDrawer open={aiOpen} onClose={() => setAIOpen(false)} onPick={pickAgent} />
      {aiOpen && <div className="modal-backdrop" style={{ background: "rgba(15,17,21,.35)", zIndex: 35 }} onClick={() => setAIOpen(false)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Ir para tela">
          <div className="tweak-nav-grid">
            <button className={`tweak-nav ${route.name === "orders" ? "active" : ""}`} onClick={() => setRoute({ name: "orders" })}>
              <span className="tweak-nav-icon"><Icon name="grid" size={14} /></span>
              <span>Home</span>
            </button>
            <button className={`tweak-nav ${route.name === "task" ? "active" : ""}`} onClick={() => setRoute({ name: "task", id: AIWData.tasks[0].id })}>
              <span className="tweak-nav-icon"><Icon name="list" size={14} /></span>
              <span>Tarefa Aberta</span>
            </button>
            <button className={`tweak-nav ${route.name === "workflow-board" ? "active" : ""}`} onClick={() => setRoute({ name: "workflow-board" })}>
              <span className="tweak-nav-icon"><Icon name="board" size={14} /></span>
              <span>Workflow Board</span>
            </button>
            <button className={`tweak-nav ${route.name === "orchestration" ? "active" : ""}`} onClick={() => setRoute({ name: "orchestration" })}>
              <span className="tweak-nav-icon ai"><Icon name="sparkle" size={14} /></span>
              <span>Agentes de Pedidos</span>
            </button>
          </div>
        </TweakSection>

        {route.name === "workflow-board" && <>
          <TweakSection label="Controle de fluxos" />
          <TweakRadio label="Layout" value={tweaks.wfLayout}
            options={[
              { value: "expanded", label: "Expandido" },
            ]}
            onChange={(v) => setTweak("wfLayout", v)} />
          <TweakSection label="Detalhe do Workflow" />
          <TweakRadio label="Visualização" value={tweaks.wfDetailView}
            options={[
              { value: "2-passos", label: "2 passos" },
              { value: "1-passo",  label: "1 passo"  },
            ]}
            onChange={(v) => setTweak("wfDetailView", v)} />
        </>}
      </TweaksPanel>
    </div>
  );
}

function shade(hex, percent) {
  const n = parseInt(hex.replace("#", ""), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = percent / 100;
  r = Math.max(0, Math.min(255, Math.round(r + (255 - r) * f)));
  g = Math.max(0, Math.min(255, Math.round(g + (255 - g) * f)));
  b = Math.max(0, Math.min(255, Math.round(b + (255 - b) * f)));
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
