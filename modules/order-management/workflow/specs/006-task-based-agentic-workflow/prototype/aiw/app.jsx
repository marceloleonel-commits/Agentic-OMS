/* global React, ReactDOM, Sidebar, Icon, AppData, AIWData, AssistantView, TaskView, OrderDetailView, WorkflowBoardView, WorkflowPoliciesView, ChatPanel, ResizableSplit, ChatEngine, AITeamDrawer, Dropdown, MessageComposer, ChatsView, InitiativesView, HomePreviewView, HomeQueueView, Mode2AnomalyModal, Mode2AssistantEngine, Mode2ToPolicy, Mode1Trigger, Mode1Launcher, Mode1ToPolicy, AgentConfigLoader, AssistantClient, InitiativeFromPolicy, CanvasTopbar, CanvasBackBar */
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
  /* Nome do item aberto — o topbar do canvas usa como título da subview e só
     o OrderDetailView sabe resolvê-lo a partir dos índices. */
  const [orderItemName, setOrderItemName] = useState(null);
  /* Modos do shell na rota do pedido (handoff §8). */
  const [orderChatOpen, setOrderChatOpen] = useState(true);
  const [orderCanvasOpen, setOrderCanvasOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [aiOpen, setAIOpen] = useState(false);
  const [activeConvId, setActiveConvId] = useState(null);

  const [orderChatMsgs, setOrderChatMsgs] = useState([]);
  const [orderChatTyping, setOrderChatTyping] = useState(false);
  const [orderDynamicChips, setOrderDynamicChips] = useState([]);
  const orderEngineRef = useRef(null);

  /* Chat de My Assistant — hoje só existe para a investigação do Modo 2
     continuar de verdade (texto livre, não só clique) depois que o
     gerente escolhe explorar a notificação; ver mode2-anomaly-modal.jsx
     e mode2-assistant-engine.js. */
  const [assistantMsgs, setAssistantMsgs] = useState([]);
  const [assistantTyping, setAssistantTyping] = useState(false);
  const assistantEngineRef = useRef(null);
  const mode1EngineRef = useRef(null); // roteiro do Modo 1 ativo neste chat, se houver
  const mode1ScriptRef = useRef(null);
  const assistantScriptRef = useRef(null);
  /* Conversa livre com o Senior E-commerce Operations Manager (Responses
     API) fora dos roteiros dos Modos 1/2 — guarda o id da última resposta
     para encadear memória de conversa (previous_response_id), e reseta
     sozinha se a página recarregar, igual ao resto do protótipo. */
  const assistantResponseIdRef = useRef(null);

  /* Rota anterior à entrada de um task — usada pelo "Voltar" do chat da task
     para retornar à última tela vista (Iniciativas, My Assistant, etc.) em
     vez de cair no default `orders`. */
  const prevRouteRef = useRef(null);

  const setRoute = (r) => {
    setRouteState((cur) => {
      if (r.name === 'task' && cur.name !== 'task') {
        prevRouteRef.current = cur;
      }
      return r;
    });
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

  useEffect(() => {
    setProductView(null);
    setOrderItemName(null);
    setOrderChatOpen(true);
    setOrderCanvasOpen(true);
  }, [route.orderId]);

  const goHome   = () => setRoute({ name: "orders" });
  /* Voltar do task: usa a rota anterior guardada (última tela antes da task).
     Fallback para o home padrão se, por qualquer motivo, não houver histórico
     (ex.: task aberto por deep link direto). */
  const goBackFromTask = () => {
    const prev = prevRouteRef.current;
    prevRouteRef.current = null;
    setRoute(prev || { name: "orders" });
  };
  /* `opts.openChat` — usado por InitiativeDocumentPanel ("Ver conversa"): a
     tarefa abre com o chat já ativo, em vez do padrão canvas-only. */
  const openTask = (id, opts) => setRoute({ name: "task", id, openChat: !!(opts && opts.openChat) });
  const openOrder = (id) => setRoute({ name: "order-detail", orderId: id });
  const gotoResource = (id, extra) => {
    if (id === "workflow-board") setRoute({ name: "workflow-board" });
    else if (id === "all-orders") setRoute({ name: "orders" });
    else if (id === "tasks") setRoute({ name: "tasks" });
    else if (id === "workflow-policies") setRoute({ name: "workflow-policies", ...extra });
  };
  const pickAgent = (id) => {
    setAIOpen(false);
    if (id === "assistant") setRoute({ name: "orders" });
  };
  const openConversation = (id) => {
    setActiveConvId(id);
    setRoute({ name: "chats", convId: id });
  };

  /* Ação direta do botão "Criar iniciativa e política" na notificação do
     Modo 2 (mode2-anomaly-modal.jsx): pula a conversa turno a turno e cria
     a política + a iniciativa de acompanhamento na hora, levando o
     gerente já para a política aberta em #/workflow-policies — mesmo par
     Policy/Initiative de InitiativeFromPolicy.createFromPolicy usado pelo
     Modo 1 e pelo chat de políticas, só que sem a etapa de "quer que eu
     crie a iniciativa também?", já que o próprio botão diz isso. */
  const createPolicyAndInitiativeFromMode2 = (script) => {
    const newPolicy = Mode2ToPolicy.createFromScript(script);
    AIWData.workflowPolicies.push(newPolicy);
    InitiativeFromPolicy.createFromPolicy(newPolicy);
    setRoute({ name: "workflow-policies", openPolicyId: newPolicy.id, initiativeAutoCreated: true });
  };

  /* Mantido para o motor de conversa turno a turno do Modo 2 continuar
     funcionando caso algo volte a chamá-lo — hoje nada mais aciona isto
     depois que o botão da notificação passou a criar direto (acima). */
  const startMode2InAssistant = (script, actionClicked) => {
    assistantScriptRef.current = script;
    setAssistantMsgs([{ from: "agent", text: script.turns[0].text }]);
    assistantEngineRef.current = Mode2AssistantEngine.create({
      script,
      typingDelayMs: 900,
      onAgentSay: (msgs) => setAssistantMsgs((m) => [...m, ...msgs]),
      onTyping: setAssistantTyping,
    });
    setRoute({ name: "assistant" });
    handleAssistantSend(actionClicked);
  };

  /* "Transformar em política permanente" não é mais um passo do roteiro —
     é o desfecho real do Modo 2 (Learn and Scale): cria a Policy de
     verdade a partir do experimento e leva o gerente para revisá-la em
     #/workflow-policies, já aberta. Intercepta antes do engine porque o
     engine só sabe tocar o roteiro, não criar dado no resto do app. */
  const handleAssistantSend = (text) => {
    setAssistantMsgs((m) => [...m, { from: "user", text }]);
    if (text === "Transformar em política permanente" && assistantScriptRef.current) {
      const newPolicy = Mode2ToPolicy.createFromScript(assistantScriptRef.current);
      AIWData.workflowPolicies.push(newPolicy);
      setAssistantMsgs((m) => [...m, {
        from: "agent",
        text: `Prontinho — criei a política **${newPolicy.name}**, com a regra que validamos no experimento. Te levando para revisar antes de qualquer coisa.`,
      }]);
      setTimeout(() => setRoute({ name: "workflow-policies", openPolicyId: newPolicy.id }), 900);
      return;
    }
    /* "Criar política" — botão do turno final do Modo 1 (mesmo padrão do
       Modo 2 acima): cria a Policy de verdade e leva para revisar. */
    if (text === "Criar política" && mode1ScriptRef.current) {
      const newPolicy = Mode1ToPolicy.createFromScript(mode1ScriptRef.current);
      AIWData.workflowPolicies.push(newPolicy);
      setAssistantMsgs((m) => [...m, {
        from: "agent",
        text: `Prontinho — criei a política **${newPolicy.name}**. Te levando para revisar antes de qualquer coisa.`,
      }]);
      setTimeout(() => setRoute({ name: "workflow-policies", openPolicyId: newPolicy.id }), 900);
      return;
    }
    if (assistantEngineRef.current) {
      assistantEngineRef.current.send(text);
      return;
    }
    /* Roteiro do Modo 1 já em andamento neste chat: a mensagem real do
       gerente só marca "pode continuar" — o motor responde um turno e
       espera de novo, nunca toca o roteiro inteiro de uma vez. */
    if (mode1EngineRef.current) {
      mode1EngineRef.current.send();
      return;
    }
    /* Nenhuma investigação do Modo 2 em curso: qualquer tela com o agente
       pode disparar o Modo 1 (Mode1Trigger.matches), não só My Assistant. */
    if (Mode1Trigger.matches(text)) {
      Mode1Launcher.launch(
        (msg) => setAssistantMsgs((m) => [...m, msg]),
        setAssistantTyping,
      ).then((result) => {
        if (!result) return;
        mode1EngineRef.current = result.engine;
        mode1ScriptRef.current = result.script;
      });
      return;
    }
    /* Nenhum roteiro fixo em curso: conversa livre de verdade com o
       agente configurado pelo gerente (agent-behavior.yaml,
       assistantChat), via Responses API — encadeando previous_response_id
       a cada turno para manter memória da conversa. */
    setAssistantTyping(true);
    AgentConfigLoader.load().then((config) => {
      const chatConfig = (config && config.assistantChat) || {};
      return AssistantClient.send(text, {
        model: chatConfig.model,
        instructions: chatConfig.instructions,
        previousResponseId: assistantResponseIdRef.current,
      });
    }).then(({ reply, responseId }) => {
      assistantResponseIdRef.current = responseId;
      setAssistantTyping(false);
      setAssistantMsgs((m) => [...m, {
        from: "agent",
        text: reply || "Não recebi uma resposta do agente agora — pode tentar de novo?",
        poweredByLLM: true,
      }]);
    }).catch(() => {
      setAssistantTyping(false);
      setAssistantMsgs((m) => [...m, {
        from: "agent",
        text: "Não consegui falar com o agente agora. Verifique se o servidor está rodando com a chave da OpenAI configurada (.env.local) e tente de novo.",
      }]);
    });
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
          <span className="dd-item-icon"><Icon name="board" size={18} /></span>
          <span>
            <span className="dd-item-label">Configurações de Workflow</span>
            <span className="dd-item-sub">{AIWData.workflows.length} workflows configurados</span>
          </span>
        </button>
        <button className="dd-item" onClick={() => setRoute({ name: "workflow-policies" })}>
          <span className="dd-item-icon"><Icon name="cart" size={18} /></span>
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
          <span className="dd-item-icon ai"><Icon name="grid" size={18} /></span>
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
    /* O composer precisa funcionar mesmo sem nenhuma mensagem ainda — é
       daqui que o Modo 1 pode ser disparado (Mode1Trigger), então não dá
       para deixar essa tela com um composer decorativo enquanto vazia. */
    view = (
      <ChatPanel
        title="My Assistant"
        intro={assistantMsgs.length === 0 ? "Pergunte qualquer coisa. Este é o ponto de partida do seu assistente." : undefined}
        messages={assistantMsgs}
        onSend={handleAssistantSend}
        isTyping={assistantTyping}
        placeholder="Pergunte qualquer coisa…"
      />
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
  } else if (route.name === "workflow-policies") {
    view = <WorkflowPoliciesView onBack={() => setRoute({ name: "workflow-board" })} initialExpandedPolicyId={route.openPolicyId || null} initiativeAutoCreated={!!route.initiativeAutoCreated} />;
  } else if (route.name === "task") {
    view = <TaskView taskId={route.id} onBack={goBackFromTask} onOpenOrder={openOrder} initialChatOpen={route.openChat} />;
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
    const orderChipId = `#${route.orderId}`;
    view = (
      <ResizableSplit screenLabel="Order Detail" initialWidth={400} chatOpen={orderChatOpen} canvasOpen={orderCanvasOpen}>
        <ChatPanel
          title={currentOrder ? `Pedido ${currentOrder.short}` : "Detalhe do Pedido"}
          chips={orderDynamicChips.length > 0 ? orderDynamicChips : orderChips}
          messages={orderChatMsgs}
          onSend={handleOrderChatSend}
          isTyping={orderChatTyping}
          placeholder="Pergunte sobre este pedido…"
          canvasOpen={orderCanvasOpen}
          onOpenCanvas={() => setOrderCanvasOpen(true)}
        />
        <div className="detail-panel">
          <CanvasTopbar
            onBack={goHome}
            backLabel="Voltar para Pedidos"
            id={orderChipId}
            onResetToMain={productView !== null ? () => setProductView(null) : undefined}
            subTitle={orderItemName}
            chatOpen={orderChatOpen}
            onToggleChat={() => setOrderChatOpen(o => !o)}
            onCloseCanvas={() => { setOrderChatOpen(true); setOrderCanvasOpen(false); }}
          />
          <div className="detail-scroll">
            <div className="detail-body">
              {productView !== null && (
                <CanvasBackBar id={orderChipId} label="Pedido" onClick={() => setProductView(null)} />
              )}
              <OrderDetailView
                task={syntheticTask}
                orderId={route.orderId}
                onBack={goHome}
                onOpenOrder={(id) => setRoute({ name: "order-detail", orderId: id })}
                standalone={true}
                productView={productView}
                onProductViewChange={setProductView}
                onProductTitleChange={setOrderItemName}
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

      {/* Modo 2 é global: a detecção não pertence a uma tela, dispara depois
          de N segundos de navegação em qualquer parte do protótipo. A
          notificação só mostra a etapa Surface — a investigação continua
          de verdade em My Assistant (startMode2InAssistant). */}
      <Mode2AnomalyModal onCreateDirectly={createPolicyAndInitiativeFromMode2} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
