/* global React, Icon, AIWData, ChatPanel, ResizableSplit */
const { useState, useRef, useEffect, useCallback } = React;

/* ---------- Filter Dropdown (rules section) ---------- */
function FilterDropdown({ label, options, checked, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const allKey = options[0].key;
  const selected = options.filter(o => o.key !== allKey && checked[o.key]);
  const summary = checked[allKey]
    ? options[0].name
    : selected.length === 0 ? "Nenhum"
    : selected.map(o => o.name).join(", ");
  return (
    <div className="filter-dropdown" ref={ref}>
      <button className={`filter-dropdown-btn${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}>
        <span className="filter-dropdown-label-text">{label}:</span>
        <span className="filter-dropdown-summary">{summary}</span>
        <span className={`filter-dropdown-chevron${open ? " open" : ""}`}><Icon name="chevron-down" size={12} /></span>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          {options.map(opt => (
            <label key={opt.key} className="wf-check">
              <input type="checkbox" checked={!!checked[opt.key]} onChange={() => onChange(opt.key)} />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Workflow Settings (per workflow) ---------- */

function WorkflowSettingsView({ workflow, onBack, actionsRef, initialSection, onDirtyChange }) {
  const [name, setName] = useState(workflow.name);
  const [desc, setDesc] = useState(workflow.desc || "");
  const [iconIdx, setIconIdx] = useState(0);
  // Gatilho: "order-start" | "wf-completion" | "task-completion"
  const [trigger, setTrigger] = useState("order-start");
  const [triggerWfId, setTriggerWfId] = useState("");
  const [triggerTaskId, setTriggerTaskId] = useState("");
  const [aiOrch, setAiOrch] = useState(true);
  // Dependências (workflow-level)
  const [deps, setDeps] = useState([]);
  const [depOpen, setDepOpen] = useState(false);
  const [depSelWf, setDepSelWf] = useState(null);
  const depRef = useRef(null);
  const depBtnRef = useRef(null);
  const depDropRef = useRef(null);
  const [depPos, setDepPos] = useState(null);

  const nameRef = useRef(name);
  const triggerRef = useRef(trigger);
  const aiOrchRef = useRef(aiOrch);
  const descRef = useRef(desc);
  useEffect(() => { nameRef.current = name; }, [name]);
  useEffect(() => { triggerRef.current = trigger; }, [trigger]);
  useEffect(() => { aiOrchRef.current = aiOrch; }, [aiOrch]);
  useEffect(() => { descRef.current = desc; }, [desc]);

  useEffect(() => {
    if (!initialSection) return;
    const idMap = { geral: "wf-section-geral", gatilho: "wf-section-gatilho", dependencias: "wf-section-dependencias" };
    const el = document.getElementById(idMap[initialSection]);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }, [initialSection]);

  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        setName, setTrigger, setAiOrch, setDesc,
        getName: () => nameRef.current,
        getTrigger: () => triggerRef.current,
        getAiOrch: () => aiOrchRef.current,
        getDesc: () => descRef.current,
      };
    }
    return () => { if (actionsRef) actionsRef.current = null; };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        (!depRef.current    || !depRef.current.contains(e.target)) &&
        (!depDropRef.current || !depDropRef.current.contains(e.target))
      ) setDepOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mark = () => onDirtyChange?.(true);

  const allWorkflows = (AIWData && AIWData.workflows) ? AIWData.workflows.filter(w => w.id !== workflow.id) : [];
  // For trigger type "task-completion"
  const triggerWfObj = allWorkflows.find(w => w.id === triggerWfId);
  const triggerWfTasks = triggerWfObj ? triggerWfObj.stages.flatMap(s => s.tasks) : [];

  function addDep() {
    if (!depSelWf) return;
    const wf = allWorkflows.find(w => w.id === depSelWf);
    if (!wf) return;
    if (deps.find(d => d.wfId === depSelWf)) return; // no duplicates
    setDeps(d => [...d, { wfId: depSelWf, wfName: wf.name, wfIcon: wf.icon }]);
    setDepOpen(false);
    setDepSelWf(null);
    mark();
  }

  const ICONS = ["📦", "↩", "💳", "📋", "🛒", "🔄", "⚡", "🏪"];

  return (
    <>
      <section className="wf-settings-card" id="wf-section-geral">
        <h3 className="wf-settings-title">Informações Gerais</h3>
        <div className="wf-settings-grid">
          <div className="setting-field">
            <label>Nome do workflow</label>
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); mark(); }} />
          </div>
          <div className="setting-field">
            <label>Ícone</label>
            <div className="wf-icon-grid">
              {ICONS.map((ic, i) =>
                <button key={i} className={`wf-icon-pick ${iconIdx === i ? "active" : ""}`} onClick={() => { setIconIdx(i); mark(); }}>{ic}</button>
              )}
            </div>
          </div>
        </div>
        <div className="setting-field" style={{ marginTop: 14 }}>
          <label>Descrição</label>
          <textarea className="input" value={desc} onChange={(e) => { setDesc(e.target.value); mark(); }} rows={2} />
        </div>
      </section>

      <div className="wf-settings-row">
        <section className="wf-settings-card" id="wf-section-gatilho">
          <h3 className="wf-settings-title">Gatilho de Ativação</h3>
          <div className="setting-field">
            <label>Quando este workflow é iniciado</label>
            {[
              { key: "order-start",     name: "Início do pedido",                    desc: "Ativado assim que um novo pedido é criado no sistema" },
              { key: "wf-completion",   name: "Conclusão de outro workflow",         desc: "Ativado quando um workflow específico for concluído" },
              { key: "task-completion", name: "Conclusão de tarefa específica",      desc: "Ativado quando uma tarefa de outro workflow for concluída" },
            ].map((opt) =>
              <button key={opt.key} className="setting-radio" onClick={() => { setTrigger(opt.key); mark(); }}>
                <span className={`radio-dot ${trigger === opt.key ? "checked" : ""}`} />
                <div className="setting-row-body">
                  <span className="setting-row-title">{opt.name}</span>
                  <span className="setting-row-desc">{opt.desc}</span>
                </div>
              </button>
            )}
          </div>
          {(trigger === "wf-completion" || trigger === "task-completion") && (
            <div className="setting-field" style={{ marginTop: 12 }}>
              <label>Workflow de origem</label>
              <select className="input" value={triggerWfId} onChange={e => { setTriggerWfId(e.target.value); setTriggerTaskId(""); mark(); }}>
                <option value="">Selecionar workflow...</option>
                {allWorkflows.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
          )}
          {trigger === "task-completion" && triggerWfId && (
            <div className="setting-field" style={{ marginTop: 10 }}>
              <label>Tarefa de origem</label>
              <select className="input" value={triggerTaskId} onChange={e => { setTriggerTaskId(e.target.value); mark(); }}>
                <option value="">Selecionar tarefa...</option>
                {triggerWfTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="setting-divider" />
          <div className="setting-row first">
            <div className="setting-row-body">
              <span className="setting-row-title">Agente AI orquestra este workflow</span>
              <span className="setting-row-desc">O agente monitora e avança etapas automaticamente</span>
            </div>
            <button className={`aiw-toggle ${aiOrch ? "on" : ""}`} onClick={() => { setAiOrch(!aiOrch); mark(); }}>
              <span className="aiw-toggle-knob" />
            </button>
          </div>
        </section>

        <section className="wf-settings-card" id="wf-section-dependencias">
          <h3 className="wf-settings-title">Dependências</h3>
          <p className="setting-help" style={{ marginBottom: 12 }}>Workflows que devem ser concluídos antes deste ser ativado:</p>
          {deps.length > 0 && (
            <div className="dep-list">
              {deps.map((dep, i) => (
                <div key={i} className="dep-row">
                  <span>{dep.wfIcon} {dep.wfName}</span>
                  <button className="dep-row-remove" onClick={() => { setDeps(d => d.filter((_, j) => j !== i)); mark(); }}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="dep-add-wrapper" ref={depRef}>
            <button ref={depBtnRef} className="wf-new-step" style={{ marginTop: 14 }} onClick={() => {
              if (!depOpen && depBtnRef.current) {
                const r = depBtnRef.current.getBoundingClientRect();
                setDepPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 320) });
              }
              setDepOpen(o => !o);
            }}>
              <Icon name="plus" size={14} /> Adicionar dependência
            </button>
          </div>
          {depOpen && depPos && ReactDOM.createPortal(
            <div className="dep-dropdown" ref={depDropRef} style={{ position: "fixed", top: depPos.top, left: depPos.left, width: depPos.width }}>
              <div className="dep-dropdown-section">
                <div className="dep-dropdown-label">Selecionar workflow precedente</div>
                <div className="dep-wf-list">
                  {allWorkflows.map(w => (
                    <button key={w.id}
                      className={`dep-wf-item${depSelWf === w.id ? " selected" : ""}`}
                      onClick={() => setDepSelWf(w.id)}>
                      {w.icon} {w.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="dep-dropdown-footer">
                <button className="btn btn-sm btn-ghost" onClick={() => setDepOpen(false)}>Cancelar</button>
                <button className="btn btn-sm btn-primary" onClick={addDep} disabled={!depSelWf}>Adicionar</button>
              </div>
            </div>,
            document.body
          )}
          <div className="setting-divider" style={{ marginTop: 18 }} />
          <p className="setting-help" style={{ marginTop: 12 }}>Workflows que este desbloqueia</p>
          <p style={{ marginTop: 6, fontSize: 13, color: "var(--fg-3)" }}>Calculado automaticamente com base nas dependências de outros workflows.</p>
        </section>
      </div>
    </>
  );
}

/* ---------- Task config (deeper flow) ---------- */

function TaskConfigView({ workflow, taskId, taskActionsRef, onDirtyChange }) {
  // Lookup task before hooks — but early return comes AFTER all hooks to respect Rules of Hooks
  let foundStage = null, foundTask = null;
  for (const s of workflow.stages) {
    const t = s.tasks.find((x) => x.id === taskId);
    if (t) { foundStage = s; foundTask = t; break; }
  }

  const [name, setName]     = useState(foundTask?.name ?? "");
  const [owner, setOwner]   = useState(foundTask?.owner ?? "");
  const [category, setCategory] = useState("");
  // Visibilidade: "user" (shopper-facing) | "internal"
  const [visibility, setVisibility] = useState("internal");
  // Checkpoints
  const [checkpoints, setCheckpoints] = useState([
    { id: "cp1", label: "Validação inicial", failAction: "Escalar para operador" }
  ]);
  // Integrações
  const [scriptEnabled, setScriptEnabled] = useState(false);
  const [scriptBody, setScriptBody] = useState("");
  const [apiEnabled, setApiEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpServer, setMcpServer] = useState("");
  const [agentOrch, setAgentOrch] = useState(false);
  // Estado
  const [active, setActive] = useState(true);

  const mark = () => onDirtyChange?.(true);

  const agentOrchRef = useRef(agentOrch);
  useEffect(() => { agentOrchRef.current = agentOrch; }, [agentOrch]);

  useEffect(() => {
    if (taskActionsRef) {
      taskActionsRef.current = {
        setAgentOrch,
        getAgentOrch: () => agentOrchRef.current,
        getName: () => foundTask?.name,
      };
    }
    return () => { if (taskActionsRef) taskActionsRef.current = null; };
  }, []);

  // Safe early return after all hooks
  if (!foundTask) return null;

  const stage = foundStage;

  return (
    <>
      {/* Identificação */}
      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Identificação</h3>
        <div className="wf-settings-grid">
          <div className="setting-field">
            <label>Nome da tarefa</label>
            <input className="input" value={name} onChange={(e) => { setName(e.target.value); mark(); }} />
          </div>
          <div className="setting-field">
            <label>Responsável</label>
            <input className="input" value={owner} onChange={(e) => { setOwner(e.target.value); mark(); }} placeholder="Ex: Gateway, WMS Operator" />
          </div>
        </div>
        <div className="wf-settings-grid" style={{ marginTop: 12 }}>
          <div className="setting-field">
            <label>Categoria</label>
            <input className="input" value={category} onChange={(e) => { setCategory(e.target.value); mark(); }} placeholder="Ex: Pagamento, Fulfillment, Reversa" />
          </div>
          <div className="setting-field">
            <label>Etapa</label>
            <input className="input" value={stage.name} disabled />
          </div>
        </div>
      </section>

      {/* Visibilidade */}
      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Visibilidade</h3>
        <p className="setting-help" style={{ marginBottom: 12 }}>Define se o progresso desta tarefa é comunicado ao cliente.</p>
        {[
          { key: "internal", name: "internal", desc: "Tarefa operacional interna — não exposta ao shopper" },
          { key: "user",     name: "user",     desc: "Shopper-facing — progresso pode ser comunicado ao cliente" },
        ].map((opt) =>
          <button key={opt.key} className="setting-radio" onClick={() => { setVisibility(opt.key); mark(); }}>
            <span className={`radio-dot ${visibility === opt.key ? "checked" : ""}`} />
            <div className="setting-row-body">
              <span className="setting-row-title"><code style={{ fontFamily: "monospace", fontSize: 12 }}>{opt.name}</code></span>
              <span className="setting-row-desc">{opt.desc}</span>
            </div>
          </button>
        )}
      </section>

      {/* Checkpoints */}
      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Checkpoints</h3>
        <p className="setting-help" style={{ marginBottom: 12 }}>Validações que devem ser concluídas para avançar esta tarefa.</p>
        <div className="task-cond-list">
          {checkpoints.map((cp, i) =>
            <div key={cp.id} className="task-cond-row">
              <input className="input" value={cp.label} placeholder="Descrição do checkpoint"
                onChange={(e) => { setCheckpoints(cs => cs.map((x, j) => j === i ? { ...x, label: e.target.value } : x)); mark(); }} />
              <input className="input" value={cp.failAction} placeholder="failAction"
                onChange={(e) => { setCheckpoints(cs => cs.map((x, j) => j === i ? { ...x, failAction: e.target.value } : x)); mark(); }} />
              <button className="icon-btn" onClick={() => { setCheckpoints(cs => cs.filter((_, j) => j !== i)); mark(); }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          )}
        </div>
        <button className="wf-new-step" style={{ marginTop: 12 }}
          onClick={() => { setCheckpoints(cs => [...cs, { id: "cp" + (cs.length + 1), label: "", failAction: "" }]); mark(); }}>
          <Icon name="plus" size={14} /> Adicionar checkpoint
        </button>
      </section>

      {/* Integrações */}
      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Integrações</h3>

        <div className="setting-row first">
          <div className="setting-row-body">
            <span className="setting-row-title">Agente AI</span>
            <span className="setting-row-desc">O agente executa e avança esta tarefa automaticamente</span>
          </div>
          <button className={`aiw-toggle ${agentOrch ? "on" : ""}`} onClick={() => { setAgentOrch(!agentOrch); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>

        <div className="setting-divider" />
        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">Servidor MCP</span>
            <span className="setting-row-desc">Conectar a um servidor MCP do AI Workspace</span>
          </div>
          <button className={`aiw-toggle ${mcpEnabled ? "on" : ""}`} onClick={() => { setMcpEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>
        {mcpEnabled && (
          <div className="setting-field" style={{ marginTop: 10 }}>
            <input className="input" value={mcpServer} onChange={(e) => { setMcpServer(e.target.value); mark(); }} placeholder="Nome do servidor MCP" />
          </div>
        )}

        <div className="setting-divider" />
        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">API Externa</span>
            <span className="setting-row-desc">Chamar endpoint externo com mapeamento automático de variáveis</span>
          </div>
          <button className={`aiw-toggle ${apiEnabled ? "on" : ""}`} onClick={() => { setApiEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>
        {apiEnabled && (
          <div className="setting-field" style={{ marginTop: 10 }}>
            <input className="input" value={apiUrl} onChange={(e) => { setApiUrl(e.target.value); mark(); }} placeholder="https://api.exemplo.com/endpoint" />
          </div>
        )}

        <div className="setting-divider" />
        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">Script customizado</span>
            <span className="setting-row-desc">Executar lógica customizada em JavaScript</span>
          </div>
          <button className={`aiw-toggle ${scriptEnabled ? "on" : ""}`} onClick={() => { setScriptEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>
        {scriptEnabled && (
          <div className="setting-field" style={{ marginTop: 10 }}>
            <textarea className="input" value={scriptBody} rows={4}
              onChange={(e) => { setScriptBody(e.target.value); mark(); }}
              placeholder="// Lógica customizada em JavaScript&#10;return { status: 'completed' };" style={{ fontFamily: "monospace", fontSize: 12 }} />
          </div>
        )}
      </section>

      {/* Estado */}
      <section className="wf-settings-card">
        <div className="setting-row first">
          <div className="setting-row-body">
            <span className="setting-row-title">Tarefa ativa</span>
            <span className="setting-row-desc">Tarefas inativas são ignoradas na execução do workflow</span>
          </div>
          <button className={`aiw-toggle ${active ? "on" : ""}`} onClick={() => { setActive(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>
      </section>
    </>
  );
}

/* ---------- Stage config (Etapa Detail — inline) ---------- */

function StageConfigView({ workflow, stageId, onDirtyChange }) {
  const stage = workflow.stages.find((s, i) => (s.id ?? String(i)) === stageId) ?? null;

  const [stageName, setStageName] = useState(stage?.name ?? "");
  const [responsible, setResponsible] = useState("");
  const [stageCategory, setStageCategory] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpServer, setMcpServer] = useState("");
  const [agentEnabled, setAgentEnabled] = useState(false);

  const mark = () => onDirtyChange?.(true);

  if (!stage) return null;

  return (
    <>
      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Identificação</h3>
        <div className="wf-settings-grid">
          <div className="setting-field">
            <label>Nome da etapa</label>
            <input className="input" value={stageName} onChange={(e) => { setStageName(e.target.value); mark(); }} />
          </div>
          <div className="setting-field">
            <label>Responsável</label>
            <input className="input" value={responsible} onChange={(e) => { setResponsible(e.target.value); mark(); }} placeholder="Ex: WMS, Gateway, Operador" />
          </div>
        </div>
        <div className="setting-field" style={{ marginTop: 12 }}>
          <label>Categoria</label>
          <input className="input" value={stageCategory} onChange={(e) => { setStageCategory(e.target.value); mark(); }} placeholder="Ex: Pagamento, Fulfillment, Reversa" />
        </div>
      </section>

      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Integrações</h3>
        <div className="setting-row first">
          <div className="setting-row-body">
            <span className="setting-row-title">Agente AI</span>
            <span className="setting-row-desc">O agente monitora e avança as tarefas desta etapa</span>
          </div>
          <button className={`aiw-toggle ${agentEnabled ? "on" : ""}`} onClick={() => { setAgentEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>
        <div className="setting-divider" />
        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">Servidor MCP</span>
            <span className="setting-row-desc">Conectar esta etapa a um servidor MCP do AI Workspace</span>
          </div>
          <button className={`aiw-toggle ${mcpEnabled ? "on" : ""}`} onClick={() => { setMcpEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
        </div>
        {mcpEnabled && (
          <div className="setting-field" style={{ marginTop: 10 }}>
            <input className="input" value={mcpServer} onChange={(e) => { setMcpServer(e.target.value); mark(); }} placeholder="Nome do servidor MCP" />
          </div>
        )}
      </section>
    </>
  );
}

/* ---------- VTEX task type taxonomy (autocomplete source) ---------- */
const VTEX_TASK_TYPES = [
  // Pagamento
  { name: "Autorizar transação",        natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Captura definitiva",          natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Pré-captura",                 natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Conciliar extrato",           natureza: "Pagamento",          owner: "Finance Agent",    type: "auto"   },
  { name: "Gerar QR Code PIX",           natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Confirmar liquidação PIX",    natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Emitir boleto",               natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Verificar pagamento boleto",  natureza: "Pagamento",          owner: "Gateway",          type: "auto"   },
  { name: "Registrar no ERP",            natureza: "Pagamento",          owner: "ERP",              type: "auto"   },
  // Antifraude
  { name: "Análise antifraude",          natureza: "Antifraude",         owner: "Antifraud Agent",  type: "auto"   },
  { name: "Verificação manual de fraude",natureza: "Antifraude",         owner: "Operador",         type: "manual" },
  // Fulfillment
  { name: "Separação (picking)",         natureza: "Fulfillment",        owner: "WMS Operator",     type: "manual" },
  { name: "Embalagem",                   natureza: "Fulfillment",        owner: "WMS Operator",     type: "manual" },
  { name: "Despacho",                    natureza: "Fulfillment",        owner: "WMS Operator",     type: "manual" },
  { name: "Emissão de nota fiscal",      natureza: "Fulfillment",        owner: "Fiscal Service",   type: "auto"   },
  { name: "Reservar produto",            natureza: "Fulfillment",        owner: "WMS",              type: "manual" },
  // Shipping
  { name: "Coleta pela transportadora",  natureza: "Shipping",           owner: "Carrier",          type: "auto"   },
  { name: "Transferência entre CDs",     natureza: "Shipping",           owner: "Carrier",          type: "auto"   },
  { name: "Last Mile",                   natureza: "Shipping",           owner: "Carrier",          type: "auto"   },
  { name: "Proof of Delivery",           natureza: "Shipping",           owner: "Carrier",          type: "auto"   },
  // Logística Reversa
  { name: "Validar elegibilidade",       natureza: "Logística Reversa",  owner: "Returns Agent",    type: "auto"   },
  { name: "Gerar etiqueta reversa",      natureza: "Logística Reversa",  owner: "Carrier API",      type: "auto"   },
  { name: "Conferir produto devolvido",  natureza: "Logística Reversa",  owner: "WMS",              type: "manual" },
  { name: "Processar estorno",           natureza: "Logística Reversa",  owner: "Gateway",          type: "auto"   },
  // Notificações
  { name: "Notificar cliente por e-mail",natureza: "Notificação",        owner: "Notif. Agent",     type: "auto"   },
  { name: "Notificar cliente por SMS",   natureza: "Notificação",        owner: "Notif. Agent",     type: "auto"   },
  { name: "Enviar webhook ao seller",    natureza: "Notificação",        owner: "OMS Agent",        type: "auto"   },
  // OMS
  { name: "Roteamento de fulfillment",   natureza: "OMS",                owner: "OMS Agent",        type: "auto"   },
  { name: "Atualizar status do pedido",  natureza: "OMS",                owner: "OMS Agent",        type: "auto"   },
  { name: "Confirmar retirada",          natureza: "OMS",                owner: "Operador",         type: "manual" },
  { name: "Aprovar pedido manualmente",  natureza: "OMS",                owner: "Operador",         type: "manual" },
];

/* ---------- Stage card (Figma-spec layout) ---------- */

function StageCard({ stage, startNum, onOpenTask, onOpenStage, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onChanged }) {
  const [tasks, setTasks] = useState(() => stage.tasks);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskType, setNewTaskType] = useState("auto");
  const newTaskRef = useRef(null);

  const handleDragStart = (e, idx) => {
    setDragging(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== dragging) setDragOver(idx);
  };

  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    if (dragging === null || dragging === toIdx) { setDragging(null); setDragOver(null); return; }
    const next = [...tasks];
    const [moved] = next.splice(dragging, 1);
    next.splice(toIdx, 0, moved);
    setTasks(next);
    setDragging(null);
    setDragOver(null);
  };

  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  // When user types a task name, auto-detect type and owner from VTEX taxonomy
  const handleTaskNameChange = (val) => {
    setNewTaskName(val);
    const match = VTEX_TASK_TYPES.find(t => t.name.toLowerCase() === val.toLowerCase());
    if (match) setNewTaskType(match.type);
  };

  const openAddTask = () => {
    setAddingTask(true);
    setNewTaskName("");
    setNewTaskType("auto");
    setTimeout(() => newTaskRef.current?.focus(), 50);
  };

  const confirmAddTask = () => {
    if (!newTaskName.trim()) return;
    const match = VTEX_TASK_TYPES.find(t => t.name.toLowerCase() === newTaskName.trim().toLowerCase());
    const newTask = {
      id: "t_" + Date.now(),
      name: newTaskName.trim(),
      type: match?.type || newTaskType,
      owner: match?.owner || "",
    };
    setTasks(prev => [...prev, newTask]);
    setAddingTask(false);
    setNewTaskName("");
    setNewTaskType("auto");
    onChanged?.();
  };

  const cancelAddTask = () => { setAddingTask(false); setNewTaskName(""); };

  return (
    <div className="stage-card">
      <div className="stage-card-head">
        <button className="stage-card-title-btn" onClick={() => onOpenStage?.(stage.id ?? stage.name)}>
          <span className="stage-card-title">{stage.name}</span>
          <Icon name="edit" size={11} style={{ marginLeft: 4, opacity: 0.4 }} />
        </button>
        <div className="stage-card-reorder">
          <button className="stage-reorder-btn" title="Subir etapa" onClick={onMoveUp} disabled={!canMoveUp}>
            <Icon name="chevron-down" size={16} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button className="stage-reorder-btn" title="Descer etapa" onClick={onMoveDown} disabled={!canMoveDown}>
            <Icon name="chevron-down" size={16} />
          </button>
        </div>
      </div>

      {/* datalist for VTEX task taxonomy */}
      <datalist id="vtex-task-types">
        {VTEX_TASK_TYPES.map(t => <option key={t.name} value={t.name} />)}
      </datalist>

      {tasks.map((task, idx) =>
        <button
          key={task.id}
          className={`stage-task${dragging === idx ? " is-dragging" : ""}${dragOver === idx ? " drag-over" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          onClick={() => onOpenTask(task.id)}
        >
          <span className="stage-task-num">{startNum + idx}</span>
          <span className="stage-task-name">{task.name}</span>
          <span className={`stage-task-tag ${task.type}`}>{task.type === "auto" ? "Automática" : "Manual"}</span>
          <span className="stage-task-grip" aria-hidden="true">
            <span /><span /><span /><span /><span /><span />
          </span>
        </button>
      )}

      {addingTask ? (
        <div className="stage-add-task-form">
          <input
            ref={newTaskRef}
            list="vtex-task-types"
            className="input"
            value={newTaskName}
            onChange={e => handleTaskNameChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") confirmAddTask(); if (e.key === "Escape") cancelAddTask(); }}
            placeholder="Nome da tarefa..."
          />
          <select className="input stage-add-task-type" value={newTaskType} onChange={e => setNewTaskType(e.target.value)}>
            <option value="auto">Automática</option>
            <option value="manual">Manual</option>
          </select>
          <div className="stage-add-task-actions">
            <button className="btn btn-sm btn-ghost" onClick={cancelAddTask}>Cancelar</button>
            <button className="btn btn-sm btn-primary" onClick={confirmAddTask} disabled={!newTaskName.trim()}>
              <Icon name="plus" size={12} /> Adicionar
            </button>
          </div>
        </div>
      ) : (
        <button className="stage-add-task-btn" onClick={openAddTask}>
          <Icon name="plus" size={12} /> Adicionar tarefa
        </button>
      )}
    </div>
  );
}

/* ---------- Workflow detail (stages + tasks grouped) ---------- */

function WorkflowDetailView({ workflow, onOpenTask, onOpenStage, onOpenSettings, onOpenSimulator, detailActionsRef, onDirtyChange }) {
  const [stages, setStages] = useState(() => workflow.stages);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => { setIsDirty(true); onDirtyChange?.(true); };
  const clearDirty = () => { setIsDirty(false); onDirtyChange?.(false); };
  const [insertingAt, setInsertingAt] = useState(null);
  const [newStageName, setNewStageName] = useState("");
  const newStageRef = useRef(null);

  const moveStage = (idx, dir) => {
    const next = [...stages];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setStages(next);
    markDirty();
  };

  const toggleLink = (idx) => {
    setStages(prev => prev.map((s, i) => i === idx ? { ...s, linkedToNext: !s.linkedToNext } : s));
    markDirty();
  };

  const handleSave = () => clearDirty();

  const openInsert = (idx) => {
    setInsertingAt(idx);
    setNewStageName("");
    setTimeout(() => newStageRef.current?.focus(), 50);
  };

  const confirmInsert = () => {
    if (!newStageName.trim()) return;
    const next = [...stages];
    next.splice(insertingAt + 1, 0, { name: newStageName, linkedToNext: false, tasks: [] });
    setStages(next);
    setInsertingAt(null);
    setNewStageName("");
    markDirty();
  };

  const cancelInsert = () => { setInsertingAt(null); setNewStageName(""); };

  // Register actions for the chat companion
  const stagesRef = useRef(stages);
  useEffect(() => { stagesRef.current = stages; }, [stages]);

  useEffect(() => {
    if (detailActionsRef) {
      detailActionsRef.current = {
        addStage: (stageName) => {
          setStages(prev => [...prev, { name: stageName, linkedToNext: false, tasks: [] }]);
          markDirty();
        },
        save: handleSave,
        getStageCount: () => stagesRef.current.length,
        getStageNames: () => stagesRef.current.map(s => s.name),
      };
    }
    return () => { if (detailActionsRef) detailActionsRef.current = null; };
  }, []);

  return (
    <>
      <div className="wf-detail-head">
        <h1 className="detail-title">{workflow.name}</h1>
      </div>

      <div className="wf-config-card">
        <div className="wf-config-chips">
          <button className="wf-config-chip" data-sl-tag="" data-variant="secondary" data-size="normal" data-color="gray"
            onClick={() => onOpenSettings("gatilho")} title="Alterar gatilho de ativação">
            <Icon name="play" size={11} /> Gatilho: Início do pedido
          </button>
          <button className="wf-config-chip" data-sl-tag="" data-variant="secondary" data-size="normal" data-color="blue"
            onClick={() => onOpenSettings("gatilho")} title="Configurar Agente AI">
            <Icon name="sparkle" size={11} /> Agente AI: On
          </button>
          <button className="wf-config-chip" data-sl-tag="" data-variant="secondary" data-size="normal" data-color="gray"
            onClick={() => onOpenSettings("dependencias")} title="Gerenciar dependências">
            <Icon name="link" size={11} /> Sem dependências
          </button>
          <button className="wf-config-chip wf-config-chip-simulate" data-sl-tag="" data-variant="secondary" data-size="normal" data-color="green"
            onClick={onOpenSimulator} title="Simular">
            <Icon name="play" size={11} /> Simular
          </button>
        </div>
        <button className="icon-btn" onClick={() => onOpenSettings("geral")} title="Configurações do workflow">
          <Icon name="settings" size={14} />
        </button>
      </div>

      <div className="stages-section">
        <div className="stage-stack">
          {stages.reduce((acc, stage, si) => {
            const startNum = acc.n;
            acc.n += stage.tasks.length;
            acc.els.push(
              <React.Fragment key={stage.id ?? si}>
                <StageCard
                  stage={stage}
                  startNum={startNum}
                  onOpenTask={onOpenTask}
                  onOpenStage={onOpenStage}
                  canMoveUp={si > 0}
                  canMoveDown={si < stages.length - 1}
                  onMoveUp={() => moveStage(si, -1)}
                  onMoveDown={() => moveStage(si, 1)}
                  onChanged={markDirty}
                />
                {si < stages.length - 1 && (
                  <>
                    <div className={`stage-linker${!stage.linkedToNext ? " can-insert" : ""}`}>
                      <button className={`stage-link-chip ${stage.linkedToNext ? "on" : "off"}`}
                        title={stage.linkedToNext ? "Etapas encadeadas" : "Etapas independentes"}
                        onClick={() => toggleLink(si)}>
                        <Icon name={stage.linkedToNext ? "link" : "link-off"} size={12} />
                        {stage.linkedToNext ? "Linked" : "Link Off"}
                      </button>
                      {!stage.linkedToNext && insertingAt !== si && (
                        <button className="stage-insert-btn" onClick={() => openInsert(si)}>
                          <Icon name="plus" size={12} /> Nova etapa
                        </button>
                      )}
                    </div>
                    {insertingAt === si && (
                      <div className="stage-insert-form">
                        <span className="stage-insert-form-label">Nome da nova etapa</span>
                        <input
                          ref={newStageRef}
                          className="input"
                          value={newStageName}
                          onChange={e => setNewStageName(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") confirmInsert(); if (e.key === "Escape") cancelInsert(); }}
                          placeholder="Ex: Validação, Aprovação..."
                        />
                        <div className="stage-insert-form-actions">
                          <button className="btn btn-sm btn-ghost" onClick={cancelInsert}>Cancelar</button>
                          <button className="btn btn-sm btn-primary" onClick={confirmInsert} disabled={!newStageName.trim()}>
                            <Icon name="plus" size={12} /> Adicionar
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </React.Fragment>
            );
            return acc;
          }, { n: 1, els: [] }).els}
        </div>
      </div>

      <button className="wf-new-step" style={{ marginTop: 18 }}>
        <Icon name="plus" size={14} /> Nova etapa
      </button>
      {isDirty && (
        <div className="wf-warn">
          <Icon name="clock" size={14} />
          <span>Alterações valem apenas para pedidos novos. Pedidos em andamento não serão afetados.</span>
        </div>
      )}
    </>
  );
}

/* ---------- Library of pre-set workflows (not yet active) ---------- */
const LIBRARY_WFS = [
  { id: "boleto", name: "Boleto Bancário", icon: "📋", category: "pagamento",
    desc: "Geração, envio e confirmação de pagamento via boleto bancário",
    stages: [
      { name: "Emissão",       linkedToNext: true,  tasks: [{ id: "bl-1", name: "Gerar boleto", type: "auto", owner: "Gateway" }, { id: "bl-2", name: "Enviar por e-mail", type: "auto", owner: "Notif. Agent" }] },
      { name: "Monitoramento", linkedToNext: true,  tasks: [{ id: "bl-3", name: "Aguardar pagamento", type: "auto", owner: "Gateway" }] },
      { name: "Confirmação",   tasks: [{ id: "bl-4", name: "Confirmar e liberar pedido", type: "auto", owner: "OMS" }] }
    ]},
  { id: "entrega-agendada", name: "Entrega Agendada", icon: "🗓️", category: "fulfillment",
    desc: "Pedidos com janela de entrega agendada pelo cliente",
    stages: [
      { name: "Agendamento", linkedToNext: true, tasks: [{ id: "ea-1", name: "Confirmar janela com cliente", type: "auto", owner: "Notif. Agent" }] },
      { name: "Preparação",  linkedToNext: true, tasks: [{ id: "ea-2", name: "Separar produto no dia", type: "manual", owner: "WMS Operator" }] },
      { name: "Entrega",     tasks: [{ id: "ea-3", name: "Cumprir janela agendada", type: "manual", owner: "Carrier" }] }
    ]},
  { id: "recusa-pgto", name: "Recusa de Pagamento", icon: "🚫", category: "pagamento",
    desc: "Retentativa e resolução de pagamentos recusados pela operadora",
    stages: [
      { name: "Detecção",    linkedToNext: true,  tasks: [{ id: "rp-1", name: "Detectar recusa", type: "auto", owner: "Gateway" }, { id: "rp-2", name: "Notificar cliente", type: "auto", owner: "Notif. Agent" }] },
      { name: "Retentativa", linkedToNext: false, tasks: [{ id: "rp-3", name: "Retentar cobrança", type: "auto", owner: "Gateway" }] },
      { name: "Resolução",   tasks: [{ id: "rp-4", name: "Cancelar ou confirmar pedido", type: "auto", owner: "OMS Agent" }] }
    ]},
  { id: "giftcard", name: "Gift Card", icon: "🎁", category: "servicos",
    desc: "Emissão e validação de gift cards na compra e no resgate",
    stages: [
      { name: "Emissão",   linkedToNext: true, tasks: [{ id: "gc-1", name: "Gerar código", type: "auto", owner: "Platform" }, { id: "gc-2", name: "Enviar ao presenteado", type: "auto", owner: "Notif. Agent" }] },
      { name: "Validação", tasks: [{ id: "gc-3", name: "Validar resgate", type: "auto", owner: "Platform" }] }
    ]},
  { id: "assinatura", name: "Assinatura", icon: "🔁", category: "servicos",
    desc: "Gestão de cobranças recorrentes e renovações automáticas de assinatura",
    stages: [
      { name: "Cobrança",    linkedToNext: true, tasks: [{ id: "as-1", name: "Cobrar recorrência", type: "auto", owner: "Gateway" }] },
      { name: "Fulfillment", linkedToNext: true, tasks: [{ id: "as-2", name: "Gerar pedido automático", type: "auto", owner: "OMS" }] },
      { name: "Entrega",     tasks: [{ id: "as-3", name: "Despachar pedido", type: "auto", owner: "Carrier" }] }
    ]},
  { id: "b2b-faturamento", name: "Faturamento B2B", icon: "📊", category: "pagamento",
    desc: "Faturamento com prazo e análise de crédito para clientes B2B",
    stages: [
      { name: "Crédito",     linkedToNext: true, tasks: [{ id: "b2-1", name: "Verificar limite de crédito", type: "auto", owner: "Finance Agent" }] },
      { name: "Faturamento", linkedToNext: true, tasks: [{ id: "b2-2", name: "Emitir nota fiscal", type: "auto", owner: "Fiscal Service" }, { id: "b2-3", name: "Enviar ao cliente", type: "auto", owner: "Notif. Agent" }] },
      { name: "Cobrança",    tasks: [{ id: "b2-4", name: "Monitorar vencimento", type: "auto", owner: "Finance Agent" }] }
    ]},
];

/* ---------- New Workflow Wizard ---------- */

const STAGE_SUGGESTIONS = [
  "Recebimento", "Validação", "Triagem", "Processamento", "Análise",
  "Aprovação", "Emissão", "Envio", "Confirmação", "Monitoramento",
  "Separação", "Embalagem", "Despacho", "Entrega", "Notificação",
  "Revisão", "Devolução", "Reembolso", "Cancelamento", "Cobrança",
  "Suporte", "Auditoria", "Integração", "Sincronização", "Análise de fraude",
];

const TASK_SUGGESTIONS = [
  "Verificar dados do pedido", "Notificar cliente por e-mail",
  "Notificar cliente por SMS", "Atualizar status no sistema",
  "Aprovar manualmente", "Gerar documento", "Consultar API externa",
  "Registrar no log", "Validar pagamento", "Confirmar estoque",
  "Imprimir etiqueta", "Acionar transportadora", "Verificar fraude",
  "Emitir nota fiscal", "Processar reembolso", "Arquivar pedido",
  "Escalar para operador", "Enviar webhook", "Cobrar recorrência",
  "Criar pedido automático",
];

function stagesFromPreFill(preFill) {
  if (preFill?.stages && preFill.stages.length > 0) {
    return preFill.stages.map((s, i) => ({
      id: "s" + i,
      name: s.name,
      tasks: (s.tasks || []).map(t => ({ id: t.id + "_w", name: t.name, type: t.type || "auto" })),
    }));
  }
  return [
    { id: "s0", name: "", tasks: [{ id: "t0", name: "", type: "auto" }] },
  ];
}

function NewWorkflowWizard({ existingWorkflows, categories, onClose, preFill }) {
  const ICONS = ["📦", "↩", "💳", "📋", "🛒", "🔄", "⚡", "🏪", "🎁", "🔁", "📊", "🚫"];
  const [step, setStep]               = useState(preFill ? 2 : 1);
  const [expandOrigin, setExpandOrigin] = useState(null);
  const [name, setName]               = useState(preFill?.name || "");
  const [desc, setDesc]               = useState(preFill?.desc || "");
  const [iconIdx, setIconIdx]         = useState(preFill?.iconIdx ?? 0);
  const [category, setCategory]       = useState(preFill?.category || "fulfillment");
  const [trigger, setTrigger]         = useState(preFill?.trigger || "auto");
  const [aiOrch, setAiOrch]           = useState(preFill?.aiOrch ?? true);
  const [stages, setStages]           = useState(() => stagesFromPreFill(preFill));

  const existingIds = new Set(existingWorkflows.map(w => w.id));
  const libraryWfs  = LIBRARY_WFS.filter(w => !existingIds.has(w.id));
  const catLabel    = (id) => categories.find(c => c.id === id)?.label || id;

  function prefillFrom(wf, isCopy) {
    setName(isCopy ? wf.name + " (cópia)" : wf.name);
    setDesc(wf.desc || "");
    const idx = ICONS.indexOf(wf.icon);
    setIconIdx(idx >= 0 ? idx : 0);
    setCategory(wf.category);
    setStages(wf.stages.map((s, i) => ({
      id: "s" + i,
      name: s.name,
      tasks: s.tasks.map(t => ({ id: t.id + "_w", name: t.name, type: t.type }))
    })));
    setStep(2);
  }

  const addStage       = ()              => setStages(p => [...p, { id: "s" + Date.now(), name: "", tasks: [] }]);
  const removeStage    = (id)            => setStages(p => p.filter(s => s.id !== id));
  const updateStageName= (id, v)         => setStages(p => p.map(s => s.id === id ? { ...s, name: v } : s));
  const addTask        = (sid)           => setStages(p => p.map(s => s.id === sid ? { ...s, tasks: [...s.tasks, { id: "t" + Date.now(), name: "", type: "auto" }] } : s));
  const removeTask     = (sid, tid)      => setStages(p => p.map(s => s.id === sid ? { ...s, tasks: s.tasks.filter(t => t.id !== tid) } : s));
  const updateTask     = (sid, tid, f, v)=> setStages(p => p.map(s => s.id === sid ? { ...s, tasks: s.tasks.map(t => t.id === tid ? { ...t, [f]: v } : t) } : s));

  const handleBack = () => {
    if (step === 1) { onClose(); return; }
    setStep(s => s - 1);
  };

  return (
    <>
      {/* ── Steps bar with integrated back + next navigation ── */}
      <div className="wizard-steps-bar">
        <button className="wizard-back-btn" onClick={handleBack} title="Voltar">
          <Icon name="chevron-left" size={16} />
        </button>
        {["Origem", "Configurações", "Etapas"].map((label, i) => (
          <div key={i} className={`wizard-step-item${step === i+1 ? " active" : ""}${step > i+1 ? " done" : ""}`}>
            <span className="wizard-step-dot">
              {step > i+1 ? <Icon name="check" size={10} /> : i+1}
            </span>
            <span className="wizard-step-label">{label}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        {step === 2 && (
          <button className="btn btn-sm btn-primary" onClick={() => setStep(3)} disabled={!name.trim()}>
            Próximo
          </button>
        )}
        {step === 3 && (
          <button className="btn btn-sm btn-primary" onClick={onClose}>
            Criar workflow
          </button>
        )}
      </div>

      {/* ── Step 1: Origem ── */}
      {step === 1 && (
        <div className="wizard-body">
          <h2 className="wizard-title" data-sl-heading="" data-variant="display3">Por onde você quer começar?</h2>
          <div className="wizard-origin-grid">

            <button className="wizard-origin-card" onClick={() => { setStages(stagesFromPreFill(null)); setStep(2); }}>
              <span className="wizard-origin-icon">✨</span>
              <strong>Do zero</strong>
              <span>Workflow em branco para configurar livremente</span>
            </button>

            <div className={`wizard-origin-card expandable${expandOrigin === "existing" ? " expanded" : ""}`}>
              <button className="wizard-origin-card-inner" onClick={() => setExpandOrigin(e => e === "existing" ? null : "existing")}>
                <span className="wizard-origin-icon">📋</span>
                <strong>Copiar existente</strong>
                <span>Partir de um dos seus workflows atuais</span>
                <Icon name="chevron-down" size={13} />
              </button>
              {expandOrigin === "existing" && (
                <div className="wizard-pick-list">
                  {existingWorkflows.map(w => (
                    <button key={w.id} className="wizard-pick-item" onClick={() => prefillFrom(w, true)}>
                      <span>{w.icon}</span>
                      <span className="wizard-pick-name">{w.name}</span>
                      <span className="wizard-pick-cat">{catLabel(w.category)}</span>
                      <Icon name="chevron-right" size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={`wizard-origin-card expandable${expandOrigin === "library" ? " expanded" : ""}`}>
              <button className="wizard-origin-card-inner" onClick={() => setExpandOrigin(e => e === "library" ? null : "library")}>
                <span className="wizard-origin-icon">📚</span>
                <strong>Da biblioteca</strong>
                <span>Workflows pré-configurados prontos para usar</span>
                <Icon name="chevron-down" size={13} />
              </button>
              {expandOrigin === "library" && (
                <div className="wizard-pick-list">
                  {libraryWfs.map(w => (
                    <button key={w.id} className="wizard-pick-item" onClick={() => prefillFrom(w, false)}>
                      <span>{w.icon}</span>
                      <span className="wizard-pick-name">{w.name}</span>
                      <span className="wizard-pick-cat">{catLabel(w.category)}</span>
                      <Icon name="chevron-right" size={12} />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Step 2: Configurações ── */}
      {step === 2 && (
        <div className="wizard-body">
          <h2 className="wizard-title" data-sl-heading="" data-variant="display3">Configurações</h2>
          <div className="wf-settings-grid">
            <div className="setting-field">
              <label>Nome do workflow</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Entrega Expressa" autoFocus />
            </div>
            <div className="setting-field">
              <label>Ícone</label>
              <div className="wf-icon-grid">
                {ICONS.map((ic, i) =>
                  <button key={i} className={`wf-icon-pick${iconIdx === i ? " active" : ""}`} onClick={() => setIconIdx(i)}>{ic}</button>
                )}
              </div>
            </div>
          </div>
          <div className="setting-field" style={{ marginTop: 16 }}>
            <label>Natureza</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="setting-field" style={{ marginTop: 16 }}>
            <label>Descrição</label>
            <textarea className="input" value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Descreva quando e para que este workflow é utilizado" />
          </div>
          <div className="setting-divider" style={{ margin: "20px 0" }} />
          <div className="setting-field">
            <label>Acionamento</label>
            {[
              { key: "auto",   name: "Automático",            desc: "Acionado assim que o pedido é criado" },
              { key: "manual", name: "Manual pelo operador",  desc: "Requer ação explícita para iniciar" },
              { key: "client", name: "Solicitação do cliente",desc: "Acionado quando o cliente abre chamado" }
            ].map(opt =>
              <button key={opt.key} className="setting-radio" onClick={() => setTrigger(opt.key)}>
                <span className={`radio-dot ${trigger === opt.key ? "checked" : ""}`} />
                <div className="setting-row-body">
                  <span className="setting-row-title">{opt.name}</span>
                  <span className="setting-row-desc">{opt.desc}</span>
                </div>
              </button>
            )}
          </div>
          <div className="setting-divider" />
          <div className="setting-row first">
            <div className="setting-row-body">
              <span className="setting-row-title">Agente AI orquestra este workflow</span>
              <span className="setting-row-desc">O agente monitora e avança etapas automaticamente</span>
            </div>
            <button className={`aiw-toggle ${aiOrch ? "on" : ""}`} onClick={() => setAiOrch(!aiOrch)}>
              <span className="aiw-toggle-knob" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Etapas ── */}
      {step === 3 && (
        <div className="wizard-body">
          <h2 className="wizard-title" data-sl-heading="" data-variant="display3">Etapas</h2>
          <p className="setting-help" style={{ marginBottom: 20 }}>Defina as etapas e as tarefas de cada uma. Você pode ajustar depois.</p>

          {/* Suggestion catalogs (native browser datalist) */}
          <datalist id="wiz-stage-names">
            {STAGE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
          </datalist>
          <datalist id="wiz-task-names">
            {TASK_SUGGESTIONS.map(s => <option key={s} value={s} />)}
          </datalist>

          <div className="wizard-stages">
            {stages.map((stage, si) => (
              <div key={stage.id} className="wizard-stage">
                <div className="wizard-stage-head">
                  <span className="wizard-stage-num">{si + 1}</span>
                  <input
                    list="wiz-stage-names"
                    className="input"
                    value={stage.name}
                    onChange={e => updateStageName(stage.id, e.target.value)}
                    placeholder={`Nome da etapa ${si + 1}`}
                  />
                  {stages.length > 1 && (
                    <button className="icon-btn" onClick={() => removeStage(stage.id)}><Icon name="x" size={14} /></button>
                  )}
                </div>
                <div className="wizard-tasks">
                  {stage.tasks.map(task => (
                    <div key={task.id} className="wizard-task-row">
                      <input
                        list="wiz-task-names"
                        className="input"
                        value={task.name}
                        onChange={e => updateTask(stage.id, task.id, "name", e.target.value)}
                        placeholder="Nome da tarefa"
                      />
                      <select className="input wizard-task-type" value={task.type} onChange={e => updateTask(stage.id, task.id, "type", e.target.value)}>
                        <option value="auto">Automática</option>
                        <option value="manual">Manual</option>
                      </select>
                      <button className="icon-btn" onClick={() => removeTask(stage.id, task.id)}><Icon name="x" size={12} /></button>
                    </div>
                  ))}
                  <button className="wf-new-step wizard-add-task" onClick={() => addTask(stage.id)}>
                    <Icon name="plus" size={12} /> Adicionar tarefa
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="wf-new-step" style={{ marginTop: 8 }} onClick={addStage}>
            <Icon name="plus" size={14} /> Adicionar etapa
          </button>
        </div>
      )}
    </>
  );
}

/* ---------- Workflow Simulator ---------- */

function simulateChain(context) {
  const { deliveryType } = context;
  const allWfs = AIWData.workflows;
  const chain = [];

  const delivMap = {
    "domicilio": { id: "entrega-domicilio", label: "Entrega em domicílio" },
    "retirada":  { id: "retirada-loja",     label: "Retirada na loja"     },
    "troca":     { id: "troca-devolucao",    label: "Troca e devolução"    },
  };

  const entry = delivMap[deliveryType];
  if (entry) {
    const wf = allWfs.find(w => w.id === entry.id);
    if (wf) chain.push({ workflow: wf, rule: "Fluxo de entrega: " + entry.label });
  }

  return chain;
}

function WorkflowSimulator({ workflow, onBack }) {
  const [phase, setPhase] = useState(1);
  const [step, setStep] = useState(0); // within phase 1 stepper
  const [context, setContext] = useState({ deliveryType: null });
  const [chain, setChain] = useState(null);

  // Phase 1 stepper definition
  const STEPS = [
    {
      key: "deliveryType", label: "Tipo de fluxo",
      options: [
        { value: "domicilio", icon: "🏠", label: "Entrega em domicílio", desc: "CD → transportadora → endereço do cliente" },
        { value: "retirada",  icon: "🏪", label: "Retirada na loja",     desc: "Cliente retira pessoalmente na loja física" },
        { value: "troca",     icon: "↩",  label: "Troca e devolução",    desc: "Logística reversa com estorno ou reenvio" },
      ]
    },
  ];

  const currentStep = STEPS[step];
  const canGoBack = step > 0;

  function pickOption(value) {
    const newCtx = { ...context, [currentStep.key]: value };
    setContext(newCtx);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      const result = simulateChain({ ...newCtx });
      setChain(result);
      setPhase(2);
    }
  }

  return (
    <div className="simulator-wrap">
      {/* Header */}
      <div className="simulator-header">
        <button className="simulator-back-btn" onClick={phase === 2 ? () => { setPhase(1); setStep(0); setChain(null); setContext({ deliveryType: null }); } : onBack}>
          <Icon name="chevron-left" size={16} />
          {phase === 2 ? "Refazer contexto" : `Voltar para ${workflow.name}`}
        </button>
        <span className="simulator-title">
          <Icon name="play" size={13} /> Simulador
        </span>
      </div>

      {/* Phase 1 — context stepper */}
      {phase === 1 && (
        <div className="simulator-body">
          <div className="simulator-steps-bar">
            {STEPS.map((s, i) => (
              <div key={s.key} className={`sim-step${i < step ? " done" : ""}${i === step ? " active" : ""}`}>
                <span className="sim-step-dot">{i < step ? <Icon name="check" size={9} /> : i + 1}</span>
                <span className="sim-step-label">{s.label}</span>
              </div>
            ))}
          </div>

          <h2 className="simulator-question">{currentStep.label}</h2>
          <div className="simulator-options">
            {currentStep.options.map(opt => (
              <button key={opt.value} className="simulator-option-card" onClick={() => pickOption(opt.value)}>
                <span className="simulator-option-icon">{opt.icon}</span>
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </button>
            ))}
          </div>

          {canGoBack && (
            <button className="btn btn-sm btn-ghost" style={{ marginTop: 20 }} onClick={() => setStep(s => s - 1)}>
              <Icon name="chevron-left" size={12} /> Voltar
            </button>
          )}
        </div>
      )}

      {/* Phase 2 — simulation result */}
      {phase === 2 && chain && (
        <div className="simulator-body">
          <div className="simulator-result-header">
            <h2 className="simulator-question">Cadeia ativada</h2>
            <span className="simulator-context-summary">
              {[
                { digital: "Digital", physical: "Físico", service: "Serviço" }[context.productType],
                { standard: "Entrega padrão", express: "Entrega expressa", pickup: "Retirada na loja", sfs: "Ship from Store", virtual: null }[context.deliveryType],
                { cc: "Cartão de Crédito", pix: "PIX", debit: "Cartão de Débito", boleto: "Boleto" }[context.paymentMethod],
              ].filter(Boolean).join(" · ")}
            </span>
          </div>

          {chain.length === 0 && (
            <p className="setting-help" style={{ marginTop: 20 }}>Nenhum workflow encontrado para esta combinação.</p>
          )}

          <div className="simulator-chain">
            {chain.map((item, idx) => (
              <React.Fragment key={item.workflow.id}>
                <div className="simulator-chain-card">
                  <div className="simulator-chain-card-head">
                    <span className="simulator-chain-icon">{item.workflow.icon}</span>
                    <div>
                      <span className="simulator-chain-name">{item.workflow.name}</span>
                      <span className="simulator-chain-rule">{item.rule}</span>
                    </div>
                    <span className="simulator-chain-badge">{item.workflow.stages.length} etapas · {item.workflow.stages.reduce((s, st) => s + st.tasks.length, 0)} tarefas</span>
                  </div>
                  <div className="simulator-chain-stages">
                    {item.workflow.stages.map((stage, si) => (
                      <div key={si} className="simulator-chain-stage">
                        <span className="simulator-chain-stage-name">{stage.name}</span>
                        <div className="simulator-chain-tasks">
                          {stage.tasks.map(task => (
                            <span key={task.id} className={`simulator-chain-task ${task.type}`}>{task.name}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {idx < chain.length - 1 && (
                  <div className="simulator-chain-arrow">
                    <Icon name="chevron-down" size={14} />
                    <span>após conclusão</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="simulator-result-actions">
            <button className="btn btn-sm btn-ghost" onClick={() => { setPhase(1); setStep(0); setChain(null); setContext({ productType: null, deliveryType: null, paymentMethod: null }); }}>
              <Icon name="search" size={12} /> Novo contexto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Workflow Board Canvas ---------- */

function WorkflowBoardCanvas({
  mode, setMode,
  settingsActionsRef, detailActionsRef, taskActionsRef,
  showWizard, setShowWizard, wizardPreFill, setWizardPreFill,
  detailHasChanges, setDetailHasChanges,
  wfLayout = "expanded", wfGroup = "flat",
}) {
  const isList       = mode.kind === "list";
  const isDetail     = mode.kind === "detail";
  const isTask       = mode.kind === "task";
  const isStage      = mode.kind === "stage";
  const isSettings   = mode.kind === "settings";
  const isSimulator  = mode.kind === "simulator";
  const workflow     = mode.workflowId ? AIWData.workflows.find((w) => w.id === mode.workflowId) : null;

  const back = () => {
    if (showWizard) { setShowWizard(false); setWizardPreFill(null); return; }
    if (isTask || isStage || isSettings || isSimulator) setMode({ kind: "detail", workflowId: mode.workflowId });
    else if (isDetail) { setDetailHasChanges(false); setMode({ kind: "list" }); }
  };

  let headerLeft;
  if (isList && showWizard) {
    headerLeft = (
      <button className="od-back-link" onClick={back}>
        <Icon name="chevron-left" size={12} /> Voltar para Controle de Fluxos
      </button>
    );
  } else if (isList) {
    headerLeft = <span className="canvas-name" style={{ fontWeight: 600, fontSize: 16 }}>Controle de Fluxos</span>;
  } else if (isDetail) {
    headerLeft = (
      <button className="od-back-link" onClick={back}>
        <Icon name="chevron-left" size={12} /> Voltar para Controle de Fluxos
      </button>
    );
  } else {
    headerLeft = (
      <button className="od-back-link" onClick={back}>
        <Icon name="chevron-left" size={12} /> Voltar para {workflow?.name}
      </button>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-head no-border">
        <div className="detail-head-left">{headerLeft}</div>
        <div className="detail-head-right">
          {isList && !showWizard &&
            <button data-sl-button data-variant="primary" onClick={() => { setWizardPreFill(null); setShowWizard(true); }}>
              <Icon name="plus" size={12} /> Novo workflow
            </button>
          }
          {(isDetail || isTask || isStage || isSettings) && detailHasChanges &&
            <button className="btn btn-primary btn-sm" onClick={() => {
              detailActionsRef.current?.save?.();
              setDetailHasChanges(false);
            }}>
              <Icon name="check" size={12} /> Salvar alterações
            </button>
          }
        </div>
      </div>
      <div className="detail-scroll">
        <div className="detail-body">
          {isList && showWizard &&
            <NewWorkflowWizard
              existingWorkflows={AIWData.workflows}
              categories={AIWData.wfCategories}
              onClose={() => { setShowWizard(false); setWizardPreFill(null); }}
              preFill={wizardPreFill}
            />
          }
          {isList && !showWizard && (() => {
            const wfs = AIWData.workflows;

            const renderExpanded = (w) => {
              const tt = w.stages.reduce((s, st) => s + st.tasks.length, 0);
              return (
                <button key={w.id} className="wf-list-card wf-list-card--expanded"
                        onClick={() => setMode({ kind: "detail", workflowId: w.id })}>
                  <div className="wf-list-card-head">
                    <span className="wf-list-body">
                      <span className="wf-list-name">{w.name}</span>
                      <span className="wf-list-meta">
                        {w.stages.length} etapas&nbsp;|&nbsp;{tt} tarefas&nbsp;|&nbsp;{w.orders} pedidos ativos
                      </span>
                    </span>
                    <span className="wf-list-head-right">
                      <span className={`wf-list-status ${w.archived ? "archived" : "active"}`}>
                        {w.archived ? "Arquivado" : "Ativo"}
                      </span>
                      <button className={`wf-list-agent-btn${w.agentEnabled ? " agent-on" : " agent-off"}`}
                              onClick={e => e.stopPropagation()}
                              title={w.agentEnabled ? "Agente AI ativo" : "Agente AI inativo"}>
                        <Icon name="sparkle" size={12} />
                      </button>
                      <button className="wf-list-edit-btn"
                              onClick={e => { e.stopPropagation(); setMode({ kind: "settings", workflowId: w.id }); }}
                              title="Editar workflow">
                        <Icon name="edit" size={14} />
                      </button>
                    </span>
                  </div>
                  <div className="wf-list-stages">
                    {w.stages.map((stage, si) => (
                      <React.Fragment key={stage.id}>
                        <div className="wf-list-stage-col">
                          <div className="wf-list-stage-head">
                            <span className="wf-list-stage-name">{stage.name}</span>
                          </div>
                          <div className="wf-list-task-list">
                            {stage.tasks.map((t, ti) => (
                              <React.Fragment key={t.id}>
                                {ti > 0 && <div className="wf-list-task-divider" />}
                                <div className="wf-list-task-item">{t.name}</div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                        {si < w.stages.length - 1 && (
                          <div className="wf-list-stage-arrow">
                            <Icon name="chevron-right" size={16} />
                            {stage.linkedToNext && <Icon name="link" size={13} />}
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </button>
              );
            };

            const renderCompact = (w) => {
              const tt = w.stages.reduce((s, st) => s + st.tasks.length, 0);
              return (
                <button key={w.id} className="wf-list-card wf-list-card--compact"
                        onClick={() => setMode({ kind: "detail", workflowId: w.id })}>
                  <span className="wf-list-name">{w.name}</span>
                  <span className="wf-list-compact-meta">{w.stages.length} etapas · {tt} tarefas</span>
                  <span className="wf-list-compact-fill" />
                  <span className="wf-list-orders">{w.orders} pedidos ativos</span>
                  <button className={`wf-list-agent-btn${w.agentEnabled ? " agent-on" : " agent-off"}`}
                          onClick={e => e.stopPropagation()}
                          title={w.agentEnabled ? "Agente AI ativo" : "Agente AI inativo"}>
                    <Icon name="sparkle" size={12} />
                  </button>
                  <span className={`wf-list-status ${w.archived ? "archived" : "active"}`}>
                    {w.archived ? "Arquivado" : "Ativo"}
                  </span>
                </button>
              );
            };

            const renderCard = (w) => renderExpanded(w);

            const groupByCat = (items) =>
              AIWData.wfCategories
                .map(cat => ({ cat, items: items.filter(w => w.category === cat.id) }))
                .filter(g => g.items.length > 0);

            // ── Table layout ──────────────────────────────────────────────
            if (wfLayout === "table") {
              const groups = wfGroup === "category" ? groupByCat(wfs) : [{ cat: null, items: wfs }];
              return (
                <div className="wf-list">
                  <table className="wf-table">
                    <thead>
                      <tr>
                        <th className="wf-th">Nome</th>
                        <th className="wf-th wf-th-num">Etapas</th>
                        <th className="wf-th wf-th-num">Tarefas</th>
                        <th className="wf-th wf-th-num">Pedidos ativos</th>
                        <th className="wf-th">Agente AI</th>
                        <th className="wf-th">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map(({ cat, items }) => (
                        <React.Fragment key={cat ? cat.id : "all"}>
                          {cat && (
                            <tr className="wf-table-cat-row">
                              <td colSpan={6}>
                                <span className="wf-table-cat-dot" style={{ background: cat.color }} />
                                {cat.label}
                              </td>
                            </tr>
                          )}
                          {items.map(w => {
                            const tt = w.stages.reduce((s, st) => s + st.tasks.length, 0);
                            return (
                              <tr key={w.id} className="wf-table-row"
                                  onClick={() => setMode({ kind: "detail", workflowId: w.id })}>
                                <td className="wf-td wf-td-name">{w.name}</td>
                                <td className="wf-td wf-td-num">{w.stages.length}</td>
                                <td className="wf-td wf-td-num">{tt}</td>
                                <td className="wf-td wf-td-num">{w.orders}</td>
                                <td className="wf-td">
                                  <span className={`wf-table-agent-badge${w.agentEnabled ? " agent-on" : " agent-off"}`}>
                                    <Icon name="sparkle" size={11} />
                                    {w.agentEnabled ? "Ativo" : "Inativo"}
                                  </span>
                                </td>
                                <td className="wf-td">
                                  <span className={`wf-list-status ${w.archived ? "archived" : "active"}`}>
                                    {w.archived ? "Arquivado" : "Ativo"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            }

            // ── Expanded / compact with optional grouping ─────────────────
            if (wfGroup === "category") {
              return (
                <div className="wf-list">
                  {groupByCat(wfs).map(({ cat, items }) => (
                    <div key={cat.id} className="wf-category-group">
                      <div className="wf-category-header">
                        <span className="wf-category-dot" style={{ background: cat.color }} />
                        <span className="wf-category-info">
                          <span className="wf-category-label">{cat.label}</span>
                          <span className="wf-category-desc">{cat.desc}</span>
                        </span>
                        <span className="wf-category-count">
                          {items.length} workflow{items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="wf-category-cards">
                        {items.map(renderCard)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            // ── Flat list ─────────────────────────────────────────────────
            return <div className="wf-list">{wfs.map(renderCard)}</div>;
          })()}


          {isDetail && workflow &&
            <WorkflowDetailView
              workflow={workflow}
              onOpenTask={(id) => setMode({ kind: "task", workflowId: workflow.id, taskId: id })}
              onOpenStage={(sid) => setMode({ kind: "stage", workflowId: workflow.id, stageId: sid })}
              onOpenSettings={(section) => setMode({ kind: "settings", workflowId: workflow.id, section: section || "geral" })}
              onOpenSimulator={() => setMode({ kind: "simulator", workflowId: workflow.id })}
              detailActionsRef={detailActionsRef}
              onDirtyChange={setDetailHasChanges}
            />
          }

          {isTask && workflow &&
            <TaskConfigView workflow={workflow} taskId={mode.taskId} taskActionsRef={taskActionsRef} onDirtyChange={setDetailHasChanges} />
          }

          {isStage && workflow &&
            <StageConfigView workflow={workflow} stageId={mode.stageId} onDirtyChange={setDetailHasChanges} />
          }

          {isSimulator && workflow &&
            <WorkflowSimulator workflow={workflow} onBack={back} />
          }

          {isSettings && workflow &&
            <WorkflowSettingsView workflow={workflow} onBack={back} actionsRef={settingsActionsRef} initialSection={mode.section} onDirtyChange={setDetailHasChanges} />
          }
        </div>
      </div>
    </div>
  );
}

/* ---------- Chat context definitions ---------- */

function chatFor(mode) {
  if (mode.kind === "list") {
    return {
      title: "Controle de Fluxos",
      placeholder: "Criar workflow, auditar, otimizar...",
      chips: [
        { icon: "plus",    label: "Criar novo workflow"     },
        { icon: "search",  label: "Auditar workflow padrão" },
        { icon: "sparkle", label: "Sugerir otimizações"     },
        { icon: "graph",   label: "Resumir cobertura"       }
      ],
      messages: [
        { from: "agent", text: "Olá! Sou o Agente de Workflow. Posso ajudar você a criar, editar ou auditar os workflows de **Controle de Fluxos**." },
        { from: "agent", text: "Há 5 workflows ativos cobrindo 4.826 pedidos. Quer criar um novo ou ajustar algum existente?" }
      ]
    };
  }
  const wf = AIWData.workflows.find((w) => w.id === mode.workflowId);
  if (mode.kind === "detail") {
    const totalTasks = wf.stages.reduce((s, st) => s + st.tasks.length, 0);
    return {
      title: wf.name,
      placeholder: `Adicionar etapa, otimizar ${wf.name}...`,
      chips: [
        { icon: "plus",    label: "Adicionar etapa"              },
        { icon: "search",  label: "Identificar gargalos"         },
        { icon: "sparkle", label: "Sugerir automação de tarefas" },
        { icon: "graph",   label: "Métricas de desempenho"       }
      ],
      messages: [
        { from: "agent", text: `Você está em **${wf.name}** — ${wf.stages.length} etapas, ${totalTasks} tarefas, ${wf.orders} pedidos ativos.` },
        { from: "agent", text: "Posso adicionar etapas, reorganizar o fluxo ou identificar gargalos. O que você quer fazer?" }
      ]
    };
  }
  if (mode.kind === "task") {
    let task;
    wf.stages.forEach((s) => { const t = s.tasks.find((x) => x.id === mode.taskId); if (t) task = t; });
    return {
      title: task?.name || "Tarefa",
      placeholder: `Configurar ${task?.name}...`,
      chips: [
        { icon: "sparkle", label: "Ativar Agente AI nesta tarefa"  },
        { icon: "edit",    label: "Adicionar checkpoint"           },
        { icon: "search",  label: "Conectar API externa"           },
        { icon: "graph",   label: "Alterar visibilidade"           }
      ],
      messages: [
        { from: "agent", text: `Editando tarefa **"${task?.name}"**. Posso configurar visibilidade, checkpoints, integrações ou Agente AI.` },
        { from: "agent", text: 'Diga algo como "tornar visível ao cliente", "adicionar checkpoint de validação" ou "ativar agente AI".' }
      ]
    };
  }
  if (mode.kind === "stage") {
    const stage = wf.stages.find((s, i) => (s.id ?? String(i)) === mode.stageId);
    return {
      title: stage?.name || "Etapa",
      placeholder: `Configurar ${stage?.name}...`,
      chips: [
        { icon: "sparkle", label: "Conectar Agente AI"       },
        { icon: "edit",    label: "Alterar responsável"      },
        { icon: "search",  label: "Conectar servidor MCP"    },
      ],
      messages: [
        { from: "agent", text: `Configurando etapa **"${stage?.name}"**. Posso ajustar responsável, categoria ou conectar integrações.` },
      ]
    };
  }
  if (mode.kind === "simulator") {
    return {
      title: `Simulador · ${wf.name}`,
      placeholder: "Simular contexto de pedido...",
      chips: [
        { icon: "play",    label: "Simular pedido físico + cartão"  },
        { icon: "search",  label: "Simular pedido digital + PIX"    },
        { icon: "sparkle", label: "Ver workflows ativados"           },
      ],
      messages: [
        { from: "agent", text: `Simulando a cadeia de workflows para um pedido. Escolha o contexto para ver quais workflows serão ativados.` },
      ]
    };
  }
  if (mode.kind === "settings") {
    return {
      title: `${wf.name} · Configurações`,
      placeholder: `Alterar configurações de ${wf.name}...`,
      chips: [
        { icon: "edit",    label: "Renomear workflow"         },
        { icon: "sparkle", label: "Alterar gatilho"           },
        { icon: "search",  label: "Verificar dependências"    },
        { icon: "graph",   label: "Análise de impacto"        }
      ],
      messages: [
        { from: "agent", text: `Configurações de **${wf.name}**. Posso alterar nome, gatilho de ativação, dependências e Agente AI.` },
        { from: "agent", text: 'Diga algo como "renomear para Pagamento Rápido", "ativar após Fulfillment" ou "desativar agente AI".' }
      ]
    };
  }
}

/* ---------- Workflow Board View (orchestrator with AI chat engine) ---------- */

function WorkflowBoardView({ onBack, wfLayout = "expanded", wfGroup = "flat" }) {
  const [mode, setMode] = useState({ kind: "list" });

  // Chat state — controlled from here so the engine can drive both sides
  const [chatMsgs, setChatMsgs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // New-workflow conversational draft
  const [wfDraftState, setWfDraftState] = useState(null);
  const wfDraftRef = useRef(null);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [wizardPreFill, setWizardPreFill] = useState(null);
  const [detailHasChanges, setDetailHasChanges] = useState(false);

  // Refs to form setters registered by child views
  const settingsActionsRef = useRef(null);
  const detailActionsRef   = useRef(null);
  const taskActionsRef     = useRef(null);

  // Keeps wfDraftRef in sync so callbacks never see stale state
  const setWfDraft = useCallback((v) => {
    const next = typeof v === "function" ? v(wfDraftRef.current) : v;
    wfDraftRef.current = next;
    setWfDraftState(next);
  }, []);

  // Reset unsaved-changes flag when switching to a different workflow or going home
  useEffect(() => {
    setDetailHasChanges(false);
  }, [mode.workflowId]);

  // Re-initialise chat when navigating between views
  useEffect(() => {
    const ctx = chatFor(mode);
    setChatMsgs(ctx.messages || []);
    setIsTyping(false);
    if (mode.kind !== "list") setWfDraft(null);
  }, [mode.kind, mode.workflowId, mode.taskId]);

  // ── Agent reply helper ──────────────────────────────────────────────────────
  function agentSay(msgs, delay = 850) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMsgs(m => [
        ...m,
        ...(Array.isArray(msgs) ? msgs : [msgs])
      ]);
    }, delay + Math.random() * 200);
  }

  // ── Main message handler ───────────────────────────────────────────────────
  function handleSend(text) {
    setChatMsgs(m => [...m, { from: "user", text }]);
    const lower = text.toLowerCase();

    if (mode.kind === "list") {
      if (wfDraftRef.current) {
        handleDraftStep(text, lower);
      } else if (/criar|novo workflow|new workflow|começar workflow/.test(lower)) {
        startWfDraft();
      } else if (/listar|mostrar|quais/.test(lower)) {
        const names = AIWData.workflows.map(w => `${w.icon} ${w.name}`).join(", ");
        agentSay({ from: "agent", text: `Workflows ativos: ${names}. Clique em qualquer um no canvas para ver detalhes.` });
      } else {
        agentSay({ from: "agent", text: "Posso ajudar a criar ou gerenciar workflows. Diga \"criar workflow\" para começar uma conversa guiada, ou clique em \"Novo workflow\" no canvas." });
      }
    } else if (mode.kind === "settings") {
      handleSettingsMessage(text, lower);
    } else if (mode.kind === "detail") {
      handleDetailMessage(text, lower);
    } else if (mode.kind === "task") {
      handleTaskMessage(text, lower);
    }
  }

  // ── New workflow conversational flow ───────────────────────────────────────

  function startWfDraft() {
    const draft = {
      step: "origin",
      origin: null, name: "", category: "fulfillment",
      trigger: "auto", aiOrch: true, sourceOptions: null,
    };
    setWfDraft(draft);
    agentSay({
      from: "agent",
      text: "Vamos criar um novo workflow! Por onde você quer começar?",
      quickReplies: [
        { label: "Do zero",         icon: "✨", desc: "Workflow em branco para configurar livremente" },
        { label: "Copiar existente",icon: "📋", desc: "Partir de um dos seus workflows atuais" },
        { label: "Da biblioteca",   icon: "📚", desc: "Workflows pré-configurados prontos para usar" },
      ],
    });
  }

  function handleDraftStep(originalText, lower) {
    const draft = wfDraftRef.current;
    if (!draft) return;

    if (draft.step === "origin") {
      let origin = "blank";
      let nextStep = "name";

      if (/existente|copiar|cópia|copy/.test(lower)) {
        origin = "existing"; nextStep = "pick-source";
      } else if (/biblioteca|library|template/.test(lower)) {
        origin = "library"; nextStep = "pick-source";
      }

      if (nextStep === "pick-source") {
        const sources = origin === "existing"
          ? AIWData.workflows.map(w => ({ id: w.id, name: w.name, icon: w.icon }))
          : LIBRARY_WFS
              .filter(w => !AIWData.workflows.find(x => x.id === w.id))
              .map(w => ({ id: w.id, name: w.name, icon: w.icon }));

        if (sources.length === 0) {
          setWfDraft(d => ({ ...d, step: "name", origin: "blank" }));
          agentSay([
            { from: "agent", text: "Não há workflows disponíveis nessa opção. Vamos começar do zero." },
            { from: "agent", text: "Como você quer chamar esse workflow?" },
          ]);
        } else {
          setWfDraft(d => ({ ...d, step: "pick-source", origin, sourceOptions: sources }));
          agentSay({
            from: "agent",
            text: origin === "existing" ? "Qual workflow você quer copiar?" : "Qual template da biblioteca você quer usar?",
            quickReplies: sources.map(s => `${s.icon} ${s.name}`),
          });
        }
      } else {
        setWfDraft(d => ({ ...d, step: "name", origin }));
        agentSay({ from: "agent", text: "Ótimo! Como você quer chamar esse workflow?" });
      }

    } else if (draft.step === "pick-source") {
      const sources = draft.sourceOptions || [];
      const found = sources.find(s =>
        lower.includes(s.name.toLowerCase()) || lower.includes(s.id)
      );

      if (found) {
        const sourceWf = draft.origin === "existing"
          ? AIWData.workflows.find(w => w.id === found.id)
          : LIBRARY_WFS.find(w => w.id === found.id);
        const prefillName = draft.origin === "existing" ? found.name + " (cópia)" : found.name;
        setWfDraft(d => ({
          ...d,
          step: "name",
          name: prefillName,
          category: sourceWf?.category || "fulfillment",
          sourceStages: sourceWf?.stages || [],
        }));
        agentSay({
          from: "agent",
          text: `Usando "${found.name}" como base — etapas e tarefas serão copiadas. Qual será o nome do novo workflow?`,
          quickReplies: [prefillName],
        });
      } else {
        agentSay({
          from: "agent",
          text: "Não encontrei essa opção. Qual destes você quer usar?",
          quickReplies: sources.map(s => `${s.icon} ${s.name}`),
        });
      }

    } else if (draft.step === "name") {
      const newName = originalText.trim();
      setWfDraft(d => ({ ...d, step: "category", name: newName }));
      agentSay({
        from: "agent",
        text: `"${newName}" — ótimo nome! Qual é a natureza desse workflow?`,
        quickReplies: AIWData.wfCategories.map(c => c.label),
      });

    } else if (draft.step === "category") {
      const cats = AIWData.wfCategories;
      const found = cats.find(c =>
        lower.includes(c.label.toLowerCase()) || lower.includes(c.id)
      );
      const category = found ? found.id : "fulfillment";
      setWfDraft(d => ({ ...d, step: "trigger", category }));
      agentSay({
        from: "agent",
        text: `Natureza **${found?.label || "Fulfillment Físico"}** selecionada. Como este workflow deve ser acionado?`,
        quickReplies: ["Automático — para novos pedidos", "Manual pelo operador", "Solicitação do cliente"],
      });

    } else if (draft.step === "trigger") {
      let trigger = "auto";
      if (/manual/.test(lower)) trigger = "manual";
      else if (/cliente|solicitação/.test(lower)) trigger = "client";
      setWfDraft(d => ({ ...d, step: "ai", trigger }));
      agentSay({
        from: "agent",
        text: "O Agente AI deve monitorar e avançar etapas automaticamente?",
        quickReplies: ["Sim, ativar Agente AI", "Não, manter manual"],
      });

    } else if (draft.step === "ai") {
      const aiOrch = !/não|nao|manual|desativar/.test(lower);
      const finalDraft = { ...draft, aiOrch };
      setWfDraft(finalDraft);

      const catLabel = AIWData.wfCategories.find(c => c.id === finalDraft.category)?.label || finalDraft.category;

      agentSay([
        { from: "agent", text: "Tudo pronto! Aqui está o resumo do novo workflow:" },
        {
          from: "agent",
          type: "wf-draft",
          draft: {
            name: finalDraft.name,
            category: catLabel,
            trigger: finalDraft.trigger,
            aiOrch: finalDraft.aiOrch,
          },
          onConfirm: () => {
            setWizardPreFill({
              name: finalDraft.name,
              desc: "",
              category: finalDraft.category,
              trigger: finalDraft.trigger,
              aiOrch: finalDraft.aiOrch,
              iconIdx: 0,
              stages: finalDraft.sourceStages || null,
            });
            setShowWizard(true);
            setWfDraft(null);
          },
        },
      ]);
    }
  }

  // ── Settings mode message handler ─────────────────────────────────────────

  function handleSettingsMessage(text, lower) {
    // Name change with explicit value
    const nameMatch = text.match(/(?:renomear?|nome|chamar de?)\s+(?:para\s+|de\s+)?["']?([A-Za-zÀ-ú0-9][^"'.,!?\n]{2,40})["']?/i);
    if (nameMatch) {
      const newName = nameMatch[1].trim();
      agentSay({
        from: "agent",
        type: "action",
        title: "Renomear workflow",
        body: `→ "${newName}"`,
        onApply: () => {
          settingsActionsRef.current?.setName(newName);
          setChatMsgs(m => [...m, { from: "agent", text: `✓ Workflow renomeado para "${newName}". Lembre de salvar.` }]);
        },
      });
      return;
    }
    if (/\bnome\b/.test(lower)) {
      agentSay({ from: "agent", text: "Qual é o novo nome que você quer dar a este workflow?" });
      return;
    }

    // Trigger changes
    if (/manual/.test(lower)) {
      agentSay({
        from: "agent",
        type: "action",
        title: "Alterar acionamento",
        body: "→ Manual pelo operador",
        onApply: () => {
          settingsActionsRef.current?.setTrigger("manual");
          setChatMsgs(m => [...m, { from: "agent", text: "✓ Acionamento atualizado para Manual pelo operador." }]);
        },
      });
      return;
    }
    if (/automátic|automatico|auto/.test(lower) && /acionamento|trigger|iniciar/.test(lower)) {
      agentSay({
        from: "agent",
        type: "action",
        title: "Alterar acionamento",
        body: "→ Automático para novos pedidos",
        onApply: () => {
          settingsActionsRef.current?.setTrigger("auto");
          setChatMsgs(m => [...m, { from: "agent", text: "✓ Acionamento atualizado para Automático." }]);
        },
      });
      return;
    }
    if (/cliente|solicitação/.test(lower) && /acionamento|trigger|iniciar/.test(lower)) {
      agentSay({
        from: "agent",
        type: "action",
        title: "Alterar acionamento",
        body: "→ Solicitação do cliente",
        onApply: () => {
          settingsActionsRef.current?.setTrigger("client");
          setChatMsgs(m => [...m, { from: "agent", text: "✓ Acionamento atualizado para Solicitação do cliente." }]);
        },
      });
      return;
    }

    // AI toggle
    if (/agente\s+ai|agente ai|orquestr/.test(lower)) {
      const deactivate = /desativar|desligar|remover|tirar|desabilitar/.test(lower);
      agentSay({
        from: "agent",
        type: "action",
        title: deactivate ? "Desativar Agente AI" : "Ativar Agente AI",
        body: deactivate
          ? "O workflow passará a ser gerenciado manualmente"
          : "O agente passará a orquestrar este workflow automaticamente",
        onApply: () => {
          settingsActionsRef.current?.setAiOrch(!deactivate);
          setChatMsgs(m => [...m, { from: "agent", text: `✓ Agente AI ${deactivate ? "desativado" : "ativado"} com sucesso.` }]);
        },
      });
      return;
    }

    // Description
    const descMatch = text.match(/(?:descrição|description|desc)\s*(?:para|:)\s*["']?(.{5,120})["']?/i);
    if (descMatch) {
      const newDesc = descMatch[1].trim();
      agentSay({
        from: "agent",
        type: "action",
        title: "Atualizar descrição",
        body: `→ "${newDesc.length > 60 ? newDesc.substring(0, 60) + "…" : newDesc}"`,
        onApply: () => {
          settingsActionsRef.current?.setDesc(newDesc);
          setChatMsgs(m => [...m, { from: "agent", text: "✓ Descrição atualizada." }]);
        },
      });
      return;
    }
    if (/descrição|description/.test(lower)) {
      agentSay({ from: "agent", text: "Qual é a nova descrição? Por exemplo: \"descrição: Gerencia pedidos com pagamento via boleto\"" });
      return;
    }

    agentSay({
      from: "agent",
      text: "Posso alterar o **nome**, **acionamento** (manual, automático, solicitação), **descrição** ou o **Agente AI** deste workflow. O que você gostaria de mudar?",
    });
  }

  // ── Detail mode message handler ────────────────────────────────────────────

  function handleDetailMessage(text, lower) {
    const stageMatch = text.match(/(?:adicionar?|nova?|criar?|inserir?)\s+(?:uma?\s+)?etapa\s+(?:chamad[ao]\s+|de\s+|:?\s*)?["']?([A-Za-zÀ-ú0-9][^"'.,!?\n]{1,50})["']?/i);
    if (stageMatch) {
      const stageName = stageMatch[1].trim();
      detailActionsRef.current?.addStage(stageName);
      agentSay({ from: "agent", text: `✓ Etapa "${stageName}" adicionada ao final do workflow.` });
      return;
    }

    if (/etapa|stage|adicionar/.test(lower)) {
      agentSay({
        from: "agent",
        text: 'Qual é o nome da nova etapa? Por exemplo: "adicionar etapa Validação de Fraude"',
      });
      return;
    }

    agentSay({
      from: "agent",
      text: "Posso adicionar etapas a este workflow. Diga o nome, por exemplo: \"adicionar etapa Revisão Manual\".",
    });
  }

  // ── Task mode message handler ──────────────────────────────────────────────

  function handleTaskMessage(text, lower) {
    // SLA
    const slaMatch = lower.match(/sla\s+(?:de\s+|para\s+)?(\d+)\s*h/);
    if (slaMatch) {
      const hours = Math.min(24, Math.max(1, parseInt(slaMatch[1])));
      agentSay({
        from: "agent",
        type: "action",
        title: "Alterar SLA",
        body: `→ ${hours}h`,
        onApply: () => {
          taskActionsRef.current?.setSla(hours);
          setChatMsgs(m => [...m, { from: "agent", text: `✓ SLA atualizado para ${hours}h.` }]);
        },
      });
      return;
    }

    // Type
    if (/automátic|automatizar|automático/.test(lower)) {
      agentSay({
        from: "agent",
        type: "action",
        title: "Alterar tipo de execução",
        body: "→ Automática (executada pelo sistema ou agente AI)",
        onApply: () => {
          taskActionsRef.current?.setType("auto");
          setChatMsgs(m => [...m, { from: "agent", text: "✓ Tipo atualizado para Automática." }]);
        },
      });
      return;
    }
    if (/\bmanual\b/.test(lower)) {
      agentSay({
        from: "agent",
        type: "action",
        title: "Alterar tipo de execução",
        body: "→ Manual (requer ação de um operador)",
        onApply: () => {
          taskActionsRef.current?.setType("manual");
          setChatMsgs(m => [...m, { from: "agent", text: "✓ Tipo atualizado para Manual." }]);
        },
      });
      return;
    }

    // AI agent on task
    if (/agente|ai/.test(lower)) {
      const deactivate = /desativar|desligar|remover|tirar/.test(lower);
      agentSay({
        from: "agent",
        type: "action",
        title: deactivate ? "Desativar Agente AI nesta tarefa" : "Ativar Agente AI nesta tarefa",
        body: deactivate
          ? "A tarefa exigirá ação manual para avançar"
          : "O agente poderá executar e avançar esta tarefa automaticamente",
        onApply: () => {
          taskActionsRef.current?.setAgentOrch(!deactivate);
          setChatMsgs(m => [...m, { from: "agent", text: `✓ Agente AI ${deactivate ? "desativado" : "ativado"} nesta tarefa.` }]);
        },
      });
      return;
    }

    agentSay({
      from: "agent",
      text: "Posso configurar **SLA** (ex: \"SLA de 4h\"), **tipo de execução** (\"tornar automática\" / \"tornar manual\") ou o **Agente AI** (\"ativar agente AI\"). O que deseja mudar?",
    });
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const ctx = chatFor(mode);

  return (
    <ResizableSplit screenLabel="03 Controle de Fluxos">
      <ChatPanel
        title={ctx.title}
        chips={ctx.chips}
        placeholder={ctx.placeholder}
        onBack={onBack}
        messages={chatMsgs}
        onSend={handleSend}
        isTyping={isTyping}
      />
      <WorkflowBoardCanvas
        mode={mode}
        setMode={setMode}
        settingsActionsRef={settingsActionsRef}
        detailActionsRef={detailActionsRef}
        taskActionsRef={taskActionsRef}
        showWizard={showWizard}
        setShowWizard={setShowWizard}
        wizardPreFill={wizardPreFill}
        setWizardPreFill={setWizardPreFill}
        detailHasChanges={detailHasChanges}
        setDetailHasChanges={setDetailHasChanges}
        wfLayout={wfLayout}
        wfGroup={wfGroup}
      />
    </ResizableSplit>
  );
}

window.WorkflowBoardView = WorkflowBoardView;
