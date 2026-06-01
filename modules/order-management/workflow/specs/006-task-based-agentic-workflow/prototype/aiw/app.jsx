/* global React, ReactDOM, Sidebar, Icon, AppData, AIWData, AssistantView, TaskView, WorkflowBoardView, OrchestrationView, AITeamDrawer, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor */
const { useState, useEffect, useRef } = React;

const TWEAKS_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "accent": "#2962FF",
  "sidebarTone": "navy",
  "sidebarCollapsed": false,
  "wfLayout": "expanded",
  "wfGroup": "flat"
}/*EDITMODE-END*/;

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
  const [route, setRoute] = useState({ name: "orders" });
  const [activeConvId, setActiveConvId] = useState(null);
  const [collapsed, setCollapsed] = useState(!!tweaks.sidebarCollapsed);
  const [aiOpen, setAIOpen] = useState(false);

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

  const goHome   = () => setRoute({ name: "orders" });
  const openTask = (id) => setRoute({ name: "task", id });
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
            <span className="dd-item-label">Workflow Settings</span>
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
        <button className="dd-item" onClick={() => setRoute({ name: "orchestration" })}>
          <span className="dd-item-icon ai"><Icon name="sparkle" size={14} /></span>
          <span>
            <span className="dd-item-label">Agente de Orquestração</span>
            <span className="dd-item-sub">Ativo · 4.256 pedidos monitorados</span>
          </span>
        </button>
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
    view = <AssistantView onOpenTask={openTask} onGotoResource={gotoResource} />;
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
    view = <TaskView taskId={route.id} onBack={goHome} />;
  } else if (route.name === "workflow-board") {
    view = <WorkflowBoardView onBack={goHome} wfLayout={tweaks.wfLayout} wfGroup={tweaks.wfGroup} />;
  } else if (route.name === "orchestration") {
    view = <OrchestrationView onBack={goHome} />;
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
      {!["task", "workflow-board", "orchestration", "assistant"].includes(route.name) &&
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
              <span>Agente de orquestração</span>
            </button>
          </div>
        </TweakSection>

        <TweakSection label="Accent">
          <TweakColor value={tweaks.accent} onChange={(v) => setTweak("accent", v)}
            options={["#2962FF", "#7C5CFF", "#F71963", "#22C55E"]} />
        </TweakSection>

        {route.name === "workflow-board" && <>
          <TweakSection label="Controle de fluxos" />
          <TweakRadio label="Layout" value={tweaks.wfLayout}
            options={[
              { value: "expanded", label: "Expandido" },
              { value: "compact",  label: "Compacto"  },
              { value: "table",    label: "Tabela"    },
            ]}
            onChange={(v) => setTweak("wfLayout", v)} />
          <TweakRadio label="Agrupar por" value={tweaks.wfGroup}
            options={[
              { value: "flat",     label: "Nenhum"    },
              { value: "category", label: "Categoria" },
            ]}
            onChange={(v) => setTweak("wfGroup", v)} />
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
