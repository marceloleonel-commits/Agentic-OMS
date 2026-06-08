/* global React, Icon, IconSparkleFill, IconHandFill, IconPencil, IconCursorFill, IconDragDots, IconPlayCircleFill, IconCaretLeftSmall, AIWData, ChatPanel, ResizableSplit */
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
  const [viewMode, setViewMode] = useState(true);
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

  const TRIGGER_OPTS = [
    { key: "order-start",     name: "Início do pedido",               desc: "Ativado assim que um novo pedido é criado no sistema" },
    { key: "wf-completion",   name: "Conclusão de outro workflow",    desc: "Ativado quando um workflow específico for concluído" },
    { key: "task-completion", name: "Conclusão de tarefa específica", desc: "Ativado quando uma tarefa de outro workflow for concluída" },
  ];

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

  if (viewMode) {
    const currentTrigger = TRIGGER_OPTS.find(o => o.key === trigger);
    const unlockedBy = allWorkflows.filter(w =>
      (w.deps || []).some(d => d.wfId === workflow.id)
    );
    return (
      <div className="wf-settings-view">
        <div className="wf-settings-view-header">
          <span className="wf-settings-view-icon">{ICONS[iconIdx]}</span>
          <h2 className="wf-settings-view-name">{name}</h2>
          <button className="wf-settings-edit-btn" data-sl-button data-variant="secondary" onClick={() => setViewMode(false)}>
            <IconPencil size={13} /> Editar
          </button>
        </div>

        <div className="wf-settings-view-section">
          <h3 className="wf-settings-view-section-title">Informações Gerais</h3>
          <dl className="wf-settings-dl">
            <div className="wf-settings-dl-row">
              <dt>Nome</dt>
              <dd><span className="setting-row-title">{name}</span></dd>
            </div>
            <div className="wf-settings-dl-row">
              <dt>Ícone</dt>
              <dd><span style={{ fontSize: 18 }}>{ICONS[iconIdx]}</span></dd>
            </div>
            <div className="wf-settings-dl-row">
              <dt>Descrição</dt>
              <dd>
                {desc
                  ? <span className="setting-row-title" style={{ fontWeight: 400 }}>{desc}</span>
                  : <span className="setting-row-desc">Sem descrição</span>}
              </dd>
            </div>
          </dl>
        </div>

        <div className="wf-settings-view-section">
          <h3 className="wf-settings-view-section-title">Gatilho &amp; Orquestração</h3>
          <dl className="wf-settings-dl">
            <div className="wf-settings-dl-row">
              <dt>Gatilho</dt>
              <dd>
                <span className="setting-row-title">{currentTrigger?.name}</span>
                <span className="setting-row-desc">{currentTrigger?.desc}</span>
              </dd>
            </div>
            <div className="wf-settings-dl-row">
              <dt>Orquestração</dt>
              <dd>
                <span className={`wf-list-status ${aiOrch ? "wf-list-status--purple" : "wf-list-status--neutral"}`} style={{ height: 22, fontSize: 11.5 }}>
                  {aiOrch ? <><IconSparkleFill size={11} /> Agêntica</> : <><IconHandFill size={11} /> Manual</>}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="wf-settings-view-section">
          <h3 className="wf-settings-view-section-title">Dependências</h3>
          <dl className="wf-settings-dl">
            <div className="wf-settings-dl-row">
              <dt>Requer</dt>
              <dd>
                {deps.length > 0
                  ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {deps.map((dep, i) => (
                        <span key={i} className="wf-settings-dep-chip">{dep.wfIcon} {dep.wfName}</span>
                      ))}
                    </div>
                  : <span className="setting-row-desc">Nenhuma dependência configurada</span>}
              </dd>
            </div>
            <div className="wf-settings-dl-row">
              <dt>Desbloqueia</dt>
              <dd>
                {unlockedBy.length > 0
                  ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {unlockedBy.map((w, i) => (
                        <span key={i} className="wf-settings-dep-chip">{w.icon} {w.name}</span>
                      ))}
                    </div>
                  : <span className="setting-row-desc">Calculado automaticamente</span>}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="wf-settings-edit-bar">
        <button className="wf-settings-cancel-btn" data-sl-button data-variant="tertiary" data-has-label
          onClick={() => { setViewMode(true); onDirtyChange?.(false); }}>
          <IconCaretLeftSmall size={14} /> Voltar para visão geral
        </button>
      </div>
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
            {TRIGGER_OPTS.map((opt) =>
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

/* ---------- Chat cite context ---------- */
const ChatCiteContext = React.createContext(null);
function pulseCiteBtn(btn) {
  if (!btn) return;
  btn.classList.add("cited");
  setTimeout(() => btn.classList.remove("cited"), 520);
}

/* ---------- Dirty-fields context (for counting unsaved changes) ---------- */

const DirtyFieldsContext = React.createContext(null);

function DirtyFieldsProvider({ children, onCountChange }) {
  const mapRef = React.useRef({});
  const register = React.useCallback((id, dirty) => {
    const prev = mapRef.current[id] || false;
    if (prev === dirty) return;
    mapRef.current = { ...mapRef.current, [id]: dirty };
    onCountChange?.(Object.values(mapRef.current).filter(Boolean).length);
  }, [onCountChange]);
  return (
    <DirtyFieldsContext.Provider value={register}>
      {children}
    </DirtyFieldsContext.Provider>
  );
}

/* ---------- Inline click-to-edit field row ---------- */

function InlineField({ label, value, onChange, disabled, placeholder, operator }) {
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef(null);
  const initialValueRef = React.useRef(value);
  const isDirty = !disabled && value !== initialValueRef.current;
  const registerDirty = React.useContext(DirtyFieldsContext);
  const chatCite = React.useContext(ChatCiteContext);
  const fieldId = label + (placeholder || "");
  React.useEffect(() => {
    registerDirty?.(fieldId, isDirty);
  }, [isDirty]);

  React.useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const commit = () => setEditing(false);

  return (
    <div className={`field-row${isDirty ? " field-row--dirty" : ""}`}>
      <span className="field-label">
        {label}
        {operator && <span className="field-operator"> {operator}</span>}
      </span>
      {disabled ? (
        <span className="field-value-pill disabled">
          {value || <em className="field-empty">—</em>}
        </span>
      ) : editing ? (
        <input
          ref={inputRef}
          className="input field-value-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") commit(); }}
        />
      ) : (
        <button
          className={`field-value-pill${!value ? " empty" : ""}${isDirty ? " field-value-pill--dirty" : ""}`}
          onClick={() => setEditing(true)}
        >
          {value || <em className="field-empty">{placeholder || "—"}</em>}
        </button>
      )}
      <button
        className="field-cite-btn"
        title="Citar no chat"
        onClick={e => {
          e.stopPropagation();
          chatCite?.(`[${label}: ${value || placeholder || "—"}]`);
          pulseCiteBtn(e.currentTarget);
        }}
      >
        <Icon name="chat-circle" size={16} />
      </button>
    </div>
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

  // Register non-InlineField changes to DirtyFieldsContext so the badge counts them
  const registerDirty = React.useContext(DirtyFieldsContext);
  const initVisibility  = useRef("internal");
  const initCheckpoints = useRef(JSON.stringify([{ id: "cp1", label: "Validação inicial", failAction: "Escalar para operador" }]));
  const initAgentOrch   = useRef(false);
  const initMcpEnabled  = useRef(false);
  const initMcpServer   = useRef("");
  const initApiEnabled  = useRef(false);
  const initApiUrl      = useRef("");
  const initScript      = useRef(false);
  const initScriptBody  = useRef("");
  const initActive      = useRef(true);
  useEffect(() => { registerDirty?.("visibility",   visibility  !== initVisibility.current);  }, [visibility]);
  useEffect(() => { registerDirty?.("checkpoints",  JSON.stringify(checkpoints) !== initCheckpoints.current); }, [checkpoints]);
  useEffect(() => { registerDirty?.("agentOrch",    agentOrch   !== initAgentOrch.current);   }, [agentOrch]);
  useEffect(() => { registerDirty?.("mcpEnabled",   mcpEnabled  !== initMcpEnabled.current);  }, [mcpEnabled]);
  useEffect(() => { registerDirty?.("mcpServer",    mcpServer   !== initMcpServer.current);   }, [mcpServer]);
  useEffect(() => { registerDirty?.("apiEnabled",   apiEnabled  !== initApiEnabled.current);  }, [apiEnabled]);
  useEffect(() => { registerDirty?.("apiUrl",       apiUrl      !== initApiUrl.current);       }, [apiUrl]);
  useEffect(() => { registerDirty?.("scriptEnabled",scriptEnabled !== initScript.current);    }, [scriptEnabled]);
  useEffect(() => { registerDirty?.("scriptBody",   scriptBody  !== initScriptBody.current);  }, [scriptBody]);
  useEffect(() => { registerDirty?.("active",       active      !== initActive.current);      }, [active]);

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

  const chatCite = React.useContext(ChatCiteContext);

  // Safe early return after all hooks
  if (!foundTask) return null;

  const stage = foundStage;

  return (
    <>
      {/* Identificação */}
      <section className="wf-settings-card">
        <h3 className="wf-settings-title">Identificação</h3>
        <div className="field-rows">
          <InlineField label="Nome da tarefa" value={name} onChange={v => { setName(v); mark(); }} />
          <InlineField label="Responsável" value={owner} onChange={v => { setOwner(v); mark(); }} placeholder="Ex: Gateway, WMS Operator" />
          <InlineField label="Categoria" value={category} onChange={v => { setCategory(v); mark(); }} placeholder="Ex: Pagamento, Fulfillment, Reversa" />
          <InlineField label="Etapa" value={stage.name} disabled />
          <div className="field-row">
            <span className="field-label">Visibilidade <span className="field-operator">é</span></span>
            <div className="field-pills-select">
              {[
                { key: "internal", label: "internal", desc: "Tarefa operacional interna — não exposta ao shopper" },
                { key: "user",     label: "user",     desc: "Shopper-facing — progresso pode ser comunicado ao cliente" },
              ].map(opt => (
                <button
                  key={opt.key}
                  className={`field-option-pill${visibility === opt.key ? " selected" : ""}`}
                  title={opt.desc}
                  onClick={() => { setVisibility(opt.key); mark(); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Visibilidade: ${visibility}]`); pulseCiteBtn(e.currentTarget); }}>
              <Icon name="chat-circle" size={16} />
            </button>
          </div>
        </div>
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
              <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Checkpoint: ${cp.label || "—"}]`); pulseCiteBtn(e.currentTarget); }}><Icon name="chat-circle" size={16} /></button>
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
          <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Agente AI: ${agentOrch ? "ativado" : "desativado"}]`); pulseCiteBtn(e.currentTarget); }}><Icon name="chat-circle" size={16} /></button>
        </div>

        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">Servidor MCP</span>
            <span className="setting-row-desc">Conectar a um servidor MCP do AI Workspace</span>
          </div>
          <button className={`aiw-toggle ${mcpEnabled ? "on" : ""}`} onClick={() => { setMcpEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
          <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Servidor MCP: ${mcpEnabled ? (mcpServer || "ativado") : "desativado"}]`); pulseCiteBtn(e.currentTarget); }}><Icon name="chat-circle" size={16} /></button>
        </div>
        {mcpEnabled && (
          <div className="setting-field" style={{ marginTop: 10 }}>
            <input className="input" value={mcpServer} onChange={(e) => { setMcpServer(e.target.value); mark(); }} placeholder="Nome do servidor MCP" />
          </div>
        )}

        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">API Externa</span>
            <span className="setting-row-desc">Chamar endpoint externo com mapeamento automático de variáveis</span>
          </div>
          <button className={`aiw-toggle ${apiEnabled ? "on" : ""}`} onClick={() => { setApiEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
          <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[API Externa: ${apiEnabled ? (apiUrl || "ativada") : "desativada"}]`); pulseCiteBtn(e.currentTarget); }}><Icon name="chat-circle" size={16} /></button>
        </div>
        {apiEnabled && (
          <div className="setting-field" style={{ marginTop: 10 }}>
            <input className="input" value={apiUrl} onChange={(e) => { setApiUrl(e.target.value); mark(); }} placeholder="https://api.exemplo.com/endpoint" />
          </div>
        )}

        <div className="setting-row">
          <div className="setting-row-body">
            <span className="setting-row-title">Script customizado</span>
            <span className="setting-row-desc">Executar lógica customizada em JavaScript</span>
          </div>
          <button className={`aiw-toggle ${scriptEnabled ? "on" : ""}`} onClick={() => { setScriptEnabled(v => !v); mark(); }}>
            <span className="aiw-toggle-knob" />
          </button>
          <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Script customizado: ${scriptEnabled ? "ativado" : "desativado"}]`); pulseCiteBtn(e.currentTarget); }}><Icon name="chat-circle" size={16} /></button>
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
          <button className="field-cite-btn" title="Citar no chat" onClick={e => e.stopPropagation()}><Icon name="chat-circle" size={16} /></button>
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

/* ---------- Inline task row with collapse ---------- */

function StageTaskRow({ task, workflow, idx, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, onChanged, onRemove }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <>
      <button
        className={`stage-task${dragging === idx ? " is-dragging" : ""}${dragOver === idx ? " drag-over" : ""}${isOpen ? " stage-task--open" : ""}`}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onClick={() => setIsOpen(v => !v)}
      >
        <span className="stage-task-grip" aria-hidden="true">
          <IconDragDots size={20} />
        </span>
        <span className="stage-task-name">{task.name}</span>
        {task.type === "manual" && (
          <span className="stage-task-type-tag">manual</span>
        )}
        {dirtyCount > 0 && (
          <span className="stage-task-dirty-badge" title={`${dirtyCount} alteração${dirtyCount !== 1 ? "ões" : ""} não salva${dirtyCount !== 1 ? "s" : ""}`}>
            {dirtyCount}
          </span>
        )}
        <span className="stage-task-chevron">
          <Icon name="chevron-down" size={12} style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform .15s" }} />
        </span>
      </button>
      {isOpen && (
        <div className="stage-task-config">
          <DirtyFieldsProvider onCountChange={setDirtyCount}>
            <TaskConfigView workflow={workflow} taskId={task.id} onDirtyChange={onChanged} />
          </DirtyFieldsProvider>
          <div className="stage-task-config-footer">
            {confirmRemove ? (
              <>
                <span className="stage-task-remove-confirm-text">Remover tarefa permanentemente?</span>
                <button className="btn btn-sm btn-ghost" onClick={() => setConfirmRemove(false)}>Cancelar</button>
                <button className="btn btn-sm btn-danger" onClick={() => onRemove?.()}>
                  <Icon name="x" size={12} /> Remover
                </button>
              </>
            ) : (
              <button className="stage-task-remove-btn" onClick={() => setConfirmRemove(true)}>
                <Icon name="x" size={12} /> Remover tarefa
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Stage card (Figma-spec layout) ---------- */

function StageCard({ stage, workflow, startNum, onOpenTask, onOpenStage, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onChanged, stageDragging, stageDragOver, onStageDragStart, onStageDragOver, onStageDrop, onStageDragEnd }) {
  const [tasks, setTasks] = useState(() => stage.tasks);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [addStep, setAddStep] = useState(null); // null | "library" | "config"
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState("auto");
  const [draftOwner, setDraftOwner] = useState("");
  const [draftCategory, setDraftCategory] = useState("");
  const [draftVisibility, setDraftVisibility] = useState("internal");
  const [draftCheckpoints, setDraftCheckpoints] = useState([]);
  const [draftAgentOrch, setDraftAgentOrch] = useState(false);
  const [draftMcpEnabled, setDraftMcpEnabled] = useState(false);
  const [draftMcpServer, setDraftMcpServer] = useState("");
  const [draftApiEnabled, setDraftApiEnabled] = useState(false);
  const [draftApiUrl, setDraftApiUrl] = useState("");
  const [draftScriptEnabled, setDraftScriptEnabled] = useState(false);
  const [draftScriptBody, setDraftScriptBody] = useState("");
  const [draftActive, setDraftActive] = useState(true);
  const [libSearch, setLibSearch] = useState("");
  const libSearchRef = useRef(null);
  const draftNameRef = useRef(null);

  // Inline stage config
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [stageName, setStageName] = useState(stage.name ?? "");
  const [responsible, setResponsible] = useState("");
  const [stageCategory, setStageCategory] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpServer, setMcpServer] = useState("");
  const [agentEnabled, setAgentEnabled] = useState(false);

  const handleDragStart = (e, idx) => {
    e.stopPropagation();
    setDragging(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (idx !== dragging) setDragOver(idx);
  };

  const handleDrop = (e, toIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragging === null || dragging === toIdx) { setDragging(null); setDragOver(null); return; }
    const next = [...tasks];
    const [moved] = next.splice(dragging, 1);
    next.splice(toIdx, 0, moved);
    setTasks(next);
    setDragging(null);
    setDragOver(null);
    onChanged?.();
  };

  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  const resetDraft = () => {
    setDraftName(""); setDraftType("auto"); setDraftOwner(""); setDraftCategory("");
    setDraftVisibility("internal"); setDraftCheckpoints([]);
    setDraftAgentOrch(false); setDraftMcpEnabled(false); setDraftMcpServer("");
    setDraftApiEnabled(false); setDraftApiUrl(""); setDraftScriptEnabled(false); setDraftScriptBody("");
    setDraftActive(true); setLibSearch("");
  };

  const openAddTask = () => {
    resetDraft();
    setAddStep("library");
    setTimeout(() => libSearchRef.current?.focus(), 50);
  };

  const selectLibTask = (t) => {
    setDraftName(t.name); setDraftType(t.type); setDraftOwner(t.owner); setDraftCategory(t.natureza);
    setAddStep("config");
    setTimeout(() => draftNameRef.current?.focus(), 50);
  };

  const selectCustomTask = () => {
    setDraftName(libSearch); setDraftType("auto"); setDraftOwner(""); setDraftCategory("");
    setAddStep("config");
    setTimeout(() => draftNameRef.current?.focus(), 50);
  };

  const confirmAddTask = () => {
    if (!draftName.trim()) return;
    setTasks(prev => [...prev, {
      id: "t_" + Date.now(), name: draftName.trim(), type: draftType, owner: draftOwner,
      category: draftCategory, visibility: draftVisibility, checkpoints: draftCheckpoints,
      agentOrch: draftAgentOrch, mcpEnabled: draftMcpEnabled, mcpServer: draftMcpServer,
      apiEnabled: draftApiEnabled, apiUrl: draftApiUrl,
      scriptEnabled: draftScriptEnabled, scriptBody: draftScriptBody, active: draftActive,
    }]);
    setAddStep(null);
    onChanged?.();
  };

  const cancelAddTask = () => { setAddStep(null); resetDraft(); };

  return (
    <div
      className={`stage-card${isConfigOpen ? " stage-card--config-open" : ""}${stageDragging ? " stage-card--dragging" : ""}${stageDragOver ? " stage-card--drag-over" : ""}`}
      draggable={!isConfigOpen}
      onDragStart={onStageDragStart}
      onDragOver={(e) => { e.preventDefault(); onStageDragOver?.(e); }}
      onDrop={onStageDrop}
      onDragEnd={onStageDragEnd}
    >

      {isConfigOpen ? (
        <div className="stage-config-inline">
          <div className="stage-config-inline-header">
            <span className="stage-config-inline-label">Propriedades da etapa</span>
            <button className="stage-config-close-btn" onClick={() => setIsConfigOpen(false)} title="Fechar configurações">
              <Icon name="chevron-down" size={14} style={{ transform: "rotate(180deg)" }} />
            </button>
          </div>

          <div className="stage-prop-row stage-prop-row--first">
            <span className="stage-prop-label">Nome da etapa</span>
            <input
              className="stage-prop-input"
              value={stageName}
              onChange={(e) => { setStageName(e.target.value); onChanged?.(); }}
            />
            <button className="stage-prop-cite-btn" title="Citar no chat"><Icon name="chat-circle" size={16} /></button>
          </div>
          <div className="stage-prop-row">
            <span className="stage-prop-label">Responsável</span>
            <input
              className="stage-prop-input"
              value={responsible}
              onChange={(e) => { setResponsible(e.target.value); onChanged?.(); }}
              placeholder="Ex: WMS, Gateway, Operador"
            />
            <button className="stage-prop-cite-btn" title="Citar no chat"><Icon name="chat-circle" size={16} /></button>
          </div>
          <div className="stage-prop-row">
            <span className="stage-prop-label">Categoria</span>
            <input
              className="stage-prop-input"
              value={stageCategory}
              onChange={(e) => { setStageCategory(e.target.value); onChanged?.(); }}
              placeholder="Ex: Pagamento, Fulfillment"
            />
            <button className="stage-prop-cite-btn" title="Citar no chat"><Icon name="chat-circle" size={16} /></button>
          </div>
          <div className="stage-prop-row stage-prop-row--toggle">
            <span className="stage-prop-label">Agente AI</span>
            <button className={`aiw-toggle ${agentEnabled ? "on" : ""}`} onClick={() => { setAgentEnabled(v => !v); onChanged?.(); }}>
              <span className="aiw-toggle-knob" />
            </button>
            <button className="stage-prop-cite-btn" title="Citar no chat"><Icon name="chat-circle" size={16} /></button>
          </div>
          <div className="stage-prop-row stage-prop-row--toggle">
            <span className="stage-prop-label">Servidor MCP</span>
            <button className={`aiw-toggle ${mcpEnabled ? "on" : ""}`} onClick={() => { setMcpEnabled(v => !v); onChanged?.(); }}>
              <span className="aiw-toggle-knob" />
            </button>
            <button className="stage-prop-cite-btn" title="Citar no chat"><Icon name="chat-circle" size={16} /></button>
          </div>
          {mcpEnabled && (
            <div className="stage-prop-row">
              <span className="stage-prop-label">Endereço MCP</span>
              <input
                className="stage-prop-input"
                value={mcpServer}
                onChange={(e) => { setMcpServer(e.target.value); onChanged?.(); }}
                placeholder="Nome do servidor"
              />
              <button className="stage-prop-cite-btn" title="Citar no chat"><Icon name="chat-circle" size={16} /></button>
            </div>
          )}
        </div>
      ) : (
        <div className="stage-card-head stage-card-head--clickable" onClick={() => setIsConfigOpen(true)}>
          <span className="stage-card-title">{stageName}</span>
          <button data-sl-button data-variant="tertiary" data-size="large"
            onClick={(e) => { e.stopPropagation(); setIsConfigOpen(true); }}
            title="Editar etapa">
            <IconPencil size={16} />
          </button>
          <div className="stage-card-reorder" style={{ display: "none" }}>
            <button className="stage-reorder-btn" title="Subir etapa" onClick={onMoveUp} disabled={!canMoveUp}>
              <Icon name="chevron-down" size={16} style={{ transform: "rotate(180deg)" }} />
            </button>
            <button className="stage-reorder-btn" title="Descer etapa" onClick={onMoveDown} disabled={!canMoveDown}>
              <Icon name="chevron-down" size={16} />
            </button>
          </div>
        </div>
      )}

      {tasks.map((task, idx) =>
        <StageTaskRow
          key={task.id}
          task={task}
          stage={stage}
          workflow={workflow}
          idx={idx}
          dragging={dragging}
          dragOver={dragOver}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          onChanged={onChanged}
          onRemove={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); onChanged?.(); }}
        />
      )}

      {addStep === "library" && (() => {
        const filtered = VTEX_TASK_TYPES.filter(t =>
          !libSearch || t.name.toLowerCase().includes(libSearch.toLowerCase()) || t.natureza.toLowerCase().includes(libSearch.toLowerCase())
        );
        const grouped = filtered.reduce((acc, t) => {
          (acc[t.natureza] = acc[t.natureza] || []).push(t);
          return acc;
        }, {});
        return (
          <div className="task-lib-panel">
            <div className="task-lib-search-row">
              <input
                ref={libSearchRef}
                className="input task-lib-search"
                placeholder="Buscar tarefa ou digitar nome..."
                value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") cancelAddTask(); if (e.key === "Enter" && libSearch.trim()) selectCustomTask(); }}
              />
              <button className="btn btn-sm btn-ghost" onClick={cancelAddTask}>Cancelar</button>
            </div>
            <div className="task-lib-list">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="task-lib-group">
                  <span className="task-lib-group-label">{cat}</span>
                  {items.map(t => (
                    <button key={t.name} className="task-lib-item" onClick={() => selectLibTask(t)}>
                      <span className="task-lib-item-name">{t.name}</span>
                      <span className={`task-lib-item-owner`}>{t.owner}</span>
                      <span className={`task-lib-item-tag task-lib-item-tag--${t.type}`}>{t.type === "auto" ? "Auto" : "Manual"}</span>
                    </button>
                  ))}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="task-lib-empty">Nenhuma tarefa encontrada</p>
              )}
              <button className="task-lib-custom" onClick={selectCustomTask}>
                <Icon name="plus" size={12} />
                {libSearch.trim() ? `Criar "${libSearch.trim()}"` : "Criar tarefa personalizada"}
              </button>
            </div>
          </div>
        );
      })()}

      {addStep === "config" && (
        <div className="task-create-form">
          <div className="task-create-form-title">Nova tarefa</div>

          {/* Identificação */}
          <div className="task-create-section">
            <span className="task-create-section-label">Identificação</span>
            <div className="stage-prop-row stage-prop-row--first">
              <span className="stage-prop-label">Nome</span>
              <input ref={draftNameRef} className="stage-prop-input" value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={e => { if (e.key === "Escape") cancelAddTask(); }}
                placeholder="Nome da tarefa..." />
            </div>
            <div className="stage-prop-row">
              <span className="stage-prop-label">Tipo</span>
              <select className="stage-prop-input" value={draftType} onChange={e => setDraftType(e.target.value)}>
                <option value="auto">Automática</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div className="stage-prop-row">
              <span className="stage-prop-label">Responsável</span>
              <input className="stage-prop-input" value={draftOwner} onChange={e => setDraftOwner(e.target.value)} placeholder="Ex: Gateway, WMS, Operador" />
            </div>
            <div className="stage-prop-row">
              <span className="stage-prop-label">Categoria</span>
              <input className="stage-prop-input" value={draftCategory} onChange={e => setDraftCategory(e.target.value)} placeholder="Ex: Pagamento, Fulfillment" />
            </div>
          </div>

          {/* Visibilidade */}
          <div className="task-create-section">
            <span className="task-create-section-label">Visibilidade</span>
            <div className="stage-prop-row stage-prop-row--first">
              <span className="stage-prop-label">Visível para</span>
              <div className="field-pills-select">
                {[
                  { key: "internal", label: "internal", desc: "Tarefa operacional interna — não exposta ao shopper" },
                  { key: "user",     label: "user",     desc: "Shopper-facing — progresso pode ser comunicado ao cliente" },
                ].map(opt => (
                  <button key={opt.key} className={`field-option-pill${draftVisibility === opt.key ? " selected" : ""}`}
                    title={opt.desc} onClick={() => setDraftVisibility(opt.key)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkpoints */}
          <div className="task-create-section">
            <span className="task-create-section-label">Checkpoints</span>
            <div className="task-cond-list" style={{ padding: "6px 12px 0" }}>
              {draftCheckpoints.map((cp, i) => (
                <div key={cp.id} className="task-cond-row">
                  <input className="input" value={cp.label} placeholder="Descrição do checkpoint"
                    onChange={e => setDraftCheckpoints(cs => cs.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} />
                  <input className="input" value={cp.failAction} placeholder="Ação em falha"
                    onChange={e => setDraftCheckpoints(cs => cs.map((x, j) => j === i ? { ...x, failAction: e.target.value } : x))} />
                  <button className="icon-btn" onClick={() => setDraftCheckpoints(cs => cs.filter((_, j) => j !== i))}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button className="wf-new-step" style={{ margin: "6px 12px 8px" }}
              onClick={() => setDraftCheckpoints(cs => [...cs, { id: "cp" + Date.now(), label: "", failAction: "" }])}>
              <Icon name="plus" size={14} /> Adicionar checkpoint
            </button>
          </div>

          {/* Integrações */}
          <div className="task-create-section">
            <span className="task-create-section-label">Integrações</span>
            <div className="stage-prop-row stage-prop-row--first stage-prop-row--toggle">
              <span className="stage-prop-label">Agente AI</span>
              <button className={`aiw-toggle ${draftAgentOrch ? "on" : ""}`} onClick={() => setDraftAgentOrch(v => !v)}>
                <span className="aiw-toggle-knob" />
              </button>
            </div>
            <div className="stage-prop-row stage-prop-row--toggle">
              <span className="stage-prop-label">Servidor MCP</span>
              <button className={`aiw-toggle ${draftMcpEnabled ? "on" : ""}`} onClick={() => setDraftMcpEnabled(v => !v)}>
                <span className="aiw-toggle-knob" />
              </button>
            </div>
            {draftMcpEnabled && (
              <div className="stage-prop-row">
                <span className="stage-prop-label"></span>
                <input className="stage-prop-input" value={draftMcpServer} onChange={e => setDraftMcpServer(e.target.value)} placeholder="Nome do servidor MCP" />
              </div>
            )}
            <div className="stage-prop-row stage-prop-row--toggle">
              <span className="stage-prop-label">API Externa</span>
              <button className={`aiw-toggle ${draftApiEnabled ? "on" : ""}`} onClick={() => setDraftApiEnabled(v => !v)}>
                <span className="aiw-toggle-knob" />
              </button>
            </div>
            {draftApiEnabled && (
              <div className="stage-prop-row">
                <span className="stage-prop-label"></span>
                <input className="stage-prop-input" value={draftApiUrl} onChange={e => setDraftApiUrl(e.target.value)} placeholder="https://api.exemplo.com/endpoint" />
              </div>
            )}
            <div className="stage-prop-row stage-prop-row--toggle">
              <span className="stage-prop-label">Script custom</span>
              <button className={`aiw-toggle ${draftScriptEnabled ? "on" : ""}`} onClick={() => setDraftScriptEnabled(v => !v)}>
                <span className="aiw-toggle-knob" />
              </button>
            </div>
            {draftScriptEnabled && (
              <div className="stage-prop-row">
                <span className="stage-prop-label"></span>
                <textarea className="stage-prop-input" value={draftScriptBody} rows={3}
                  onChange={e => setDraftScriptBody(e.target.value)}
                  placeholder={"// JavaScript\nreturn { status: 'completed' };"}
                  style={{ fontFamily: "monospace", fontSize: 11.5, resize: "vertical" }} />
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="task-create-section">
            <span className="task-create-section-label">Estado</span>
            <div className="stage-prop-row stage-prop-row--first stage-prop-row--toggle">
              <span className="stage-prop-label">Tarefa ativa</span>
              <button className={`aiw-toggle ${draftActive ? "on" : ""}`} onClick={() => setDraftActive(v => !v)}>
                <span className="aiw-toggle-knob" />
              </button>
            </div>
          </div>

          <div className="stage-add-task-actions">
            <button className="btn btn-sm btn-ghost" onClick={() => setAddStep("library")}>← Voltar</button>
            <button className="btn btn-sm btn-ghost" onClick={cancelAddTask}>Cancelar</button>
            <button className="btn btn-sm btn-primary" onClick={confirmAddTask} disabled={!draftName.trim()}>
              <Icon name="plus" size={12} /> Adicionar
            </button>
          </div>
        </div>
      )}

      {addStep === null && (
        <button className="stage-add-task-btn" onClick={openAddTask}>
          <Icon name="plus" size={12} /> Adicionar tarefa
        </button>
      )}
    </div>
  );
}

/* ---------- Workflow detail (stages + tasks grouped) ---------- */

/* ── Shared date formatter for workflow meta ─────────────────────────────── */
function fmtWfDate(iso) {
  const d = new Date(iso);
  const months = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${d.getDate()} ${months[d.getMonth()]} às ${hh}:${mm}`;
}

const WF_STATUS_META = {
  draft:           { label: "Rascunho",                          color: "gray"    },
  published:       { label: "Publicado",                         color: "green"   },
  published_dirty: { label: "Publicado · alterações pendentes",  color: "amber"   },
  archived:        { label: "Arquivado",                         color: "neutral" },
};

/* ── Inline actor span — mirrors span.reporter from view-task.jsx ──────── */
function WfActorSpan({ who, date }) {
  const isHuman = who && who.includes("@");
  const initial = who ? who[0].toUpperCase() : "?";
  return (
    <span className="reporter">
      {isHuman
        ? <span className="person-avatar">{initial}</span>
        : <span className="agent-avatar-mini" title="Agent"><Icon name="sparkle" size={12} /></span>
      }
      <span><b>{who}</b> em {date}</span>
    </span>
  );
}

/* ── Workflow metadata fields (version, edit dates, config chips) ────────── */
function WfMetaSection({ workflow, onOpenSettings }) {
  const sm  = WF_STATUS_META[workflow.wfStatus] || WF_STATUS_META.draft;
  const log = workflow.versionLog || [];
  const runningVersion = (workflow.wfStatus === "published_dirty" && log.length > 0) ? log[0].version : null;
  const [histOpen, setHistOpen] = useState(false);
  const histBtnRef = useRef(null);
  const histPopRef = useRef(null);

  const ENTITY_LABEL = { task: "Tarefa", dependency: "Dependência", trigger: "Gatilho", supplier: "Fornecedor", contingency: "Contingência", "general config": "Config. geral" };
  const CHANGE_LABEL = { added: "adicionado", removed: "removido", renamed: "renomeado", edited: "editado", changed: "alterado", connected: "conectado", disconnected: "desconectado", replaced: "substituído" };
  const CHANGE_SIGN  = { added: "+", removed: "−", replaced: "⇄", renamed: "~", edited: "~", changed: "~", connected: "+", disconnected: "−" };

  useEffect(() => {
    if (!histOpen) return;
    const handler = (e) => {
      if (histPopRef.current && !histPopRef.current.contains(e.target) &&
          histBtnRef.current && !histBtnRef.current.contains(e.target)) {
        setHistOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [histOpen]);

      {/* Informações gerais */}
      <section className="wf-settings-inline-section">
        <span className="wf-settings-inline-section-title">Informações gerais</span>
        <div className="field-rows">
          <InlineField label="Nome" value={name} onChange={v => { setName(v); mark(); }} />
          <InlineField label="Descrição" value={desc} onChange={v => { setDesc(v); mark(); }} placeholder="Sem descrição" />
        </div>
      </section>


      <dt>Versão</dt>
      <dd>
        <span className="wf-meta-ver">{sm.label}</span>
        {' '}
        <span className="wf-meta-ver">(v{workflow.version})</span>
        {runningVersion && (
          <span className="wf-meta-running">v{runningVersion} em produção</span>
        )}
        {log.length > 0 && (
          <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <button
              ref={histBtnRef}
              className={`icon-btn wf-ver-hist-btn${histOpen ? " wf-ver-hist-btn--active" : ""}`}
              onClick={() => setHistOpen(v => !v)}
              title="Histórico de versões"
            >
              <Icon name="clock" size={13} />
              <span className="wf-meta-hist-count">{log.length}</span>
            </button>
            {histOpen && (
              <div ref={histPopRef} className="wf-ver-hist-popup">
                <div className="wf-ver-hist-popup-head">
                  <span className="wf-ver-hist-popup-title">Histórico de versões</span>
                  <button className="icon-btn" onClick={() => setHistOpen(false)} title="Fechar">
                    <Icon name="x" size={14} />
                  </button>
                </div>
                <div className="wf-meta-hist-list">
                  {log.map((entry) => (
                    <div key={entry.version} className="wf-meta-hist-entry">
                      <div className="wf-meta-hist-head">
                        <span className="wf-meta-hist-ver">v{entry.version}</span>
                        <span className="wf-meta-hist-when">{fmtWfDate(entry.publishedAt)}</span>
                        <span className="wf-meta-hist-who">{entry.publishedBy}</span>
                      </div>
                      <p className="wf-meta-hist-desc">"{entry.description}"</p>
                      <ul className="wf-meta-hist-deltas">
                        {entry.deltas.map((d, i) => (
                          <li key={i} className={`wf-meta-delta wf-meta-delta--${d.change}`}>
                            <span className="wf-meta-delta-sign">{CHANGE_SIGN[d.change] || "·"}</span>
                            <span className="wf-meta-delta-entity">{ENTITY_LABEL[d.entity] || d.entity}</span>
                            <span className="wf-meta-delta-change">{CHANGE_LABEL[d.change] || d.change}</span>
                            <span className="wf-meta-delta-detail">{d.detail}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="wf-meta-hist-footer">
                        <span>{entry.appliedTo === "all_orders" ? "Aplicado a todos os pedidos" : "Somente pedidos novos"}</span>
                        <span>{entry.activeOrdersAtPublish.toLocaleString("pt-BR")} pedidos ativos na publicação</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </span>
        )}
      </dd>
      {workflow.publishedAt && <>
        <dt>Publicado em</dt>
        <dd className="wf-meta-actor"><WfActorSpan who={workflow.publishedBy} date={fmtWfDate(workflow.publishedAt)} /></dd>
      </>}
    </dl>
  );
}

/* ── Inline workflow settings (replaces separate settings route) ─────────── */
function WfSettingsInline({ workflow, onDirtyChange }) {
  const [isEditing, setIsEditing] = useState(false);

  const [name,    setName]    = useState(workflow.name ?? "");
  const [desc,    setDesc]    = useState(workflow.desc ?? "");
  const [iconIdx, setIconIdx] = useState(0);
  const [trigger, setTrigger] = useState("order-start");
  const [triggerWfId,   setTriggerWfId]   = useState("");
  const [triggerTaskId, setTriggerTaskId] = useState("");
  const [aiOrch,  setAiOrch]  = useState(workflow.agentEnabled ?? true);
  const [deps,    setDeps]    = useState([]);
  const [depOpen,  setDepOpen]  = useState(false);
  const [depSelWf, setDepSelWf] = useState(null);
  const depBtnRef  = useRef(null);
  const depDropRef = useRef(null);
  const depPos = useRef(null);

  const chatCite = React.useContext(ChatCiteContext);

  useEffect(() => {
    const handler = (e) => {
      if (depDropRef.current && !depDropRef.current.contains(e.target) &&
          depBtnRef.current  && !depBtnRef.current.contains(e.target)) {
        setDepOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mark = () => onDirtyChange?.(true);

  const ICONS = ["📦", "↩", "💳", "📋", "🛒", "🔄", "⚡", "🏪"];

  const TRIGGER_OPTS = [
    { key: "order-start",     label: "Início do pedido" },
    { key: "wf-completion",   label: "Conclusão de workflow" },
    { key: "task-completion", label: "Conclusão de tarefa" },
  ];

  const allWorkflows = (AIWData && AIWData.workflows)
    ? AIWData.workflows.filter(w => w.id !== workflow.id)
    : [];
  const triggerWfObj   = allWorkflows.find(w => w.id === triggerWfId);
  const triggerWfTasks = triggerWfObj ? triggerWfObj.stages.flatMap(s => s.tasks) : [];

  const addDep = () => {
    if (!depSelWf) return;
    const wf = allWorkflows.find(w => w.id === depSelWf);
    if (!wf || deps.find(d => d.wfId === depSelWf)) return;
    setDeps(d => [...d, { wfId: depSelWf, wfName: wf.name, wfIcon: wf.icon }]);
    setDepOpen(false); setDepSelWf(null); mark();
  };

  const currentTrigger = TRIGGER_OPTS.find(o => o.key === trigger);

  // ── Read mode ──────────────────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <div className="wf-settings-inline">
        <div className="wf-settings-inline-head">
          <button
            className="wf-settings-inline-edit-btn"
            data-sl-button data-variant="tertiary" data-size="small"
            onClick={() => setIsEditing(true)}
          >
            <IconPencil size={13} /> Editar
          </button>
        </div>

        <dl className="wf-settings-dl wf-settings-inline-dl">
          {desc && (
            <div className="wf-settings-dl-row">
              <dt>Descrição</dt>
              <dd><span className="wf-settings-inline-desc">{desc}</span></dd>
            </div>
          )}
          <div className="wf-settings-dl-row">
            <dt>Gatilho</dt>
            <dd><span className="field-value-tag">{currentTrigger?.label}</span></dd>
          </div>
          <div className="wf-settings-dl-row">
            <dt>Orquestração</dt>
            <dd>
              <span className={`wf-list-status ${aiOrch ? "wf-list-status--purple" : "wf-list-status--neutral"}`} style={{ height: 22, fontSize: 11.5 }}>
                {aiOrch ? <><IconSparkleFill size={11} /> Agêntica</> : <><IconHandFill size={11} /> Manual</>}
              </span>
            </dd>
          </div>
          {deps.length > 0 && (
            <div className="wf-settings-dl-row">
              <dt>Requer</dt>
              <dd style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {deps.map((d, i) => <span key={i} className="wf-settings-dep-chip">{d.wfIcon} {d.wfName}</span>)}
              </dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  return (
    <div className="wf-settings-inline wf-settings-inline--editing">
      <div className="wf-settings-inline-head">
        <span className="wf-settings-inline-icon">{ICONS[iconIdx]}</span>
        <span className="wf-settings-inline-name editing-label">Configurações do workflow</span>
        <button
          className="wf-settings-inline-close-btn"
          onClick={() => setIsEditing(false)}
          title="Fechar"
        >
          <Icon name="chevron-down" size={14} style={{ transform: "rotate(180deg)" }} />
        </button>
      </div>

      {/* Informações gerais */}
      <section className="wf-settings-inline-section">
        <span className="wf-settings-inline-section-title">Informações gerais</span>
        <div className="field-rows">
          <InlineField label="Nome" value={name} onChange={v => { setName(v); mark(); }} />
          <InlineField label="Descrição" value={desc} onChange={v => { setDesc(v); mark(); }} placeholder="Sem descrição" />
        </div>
      </section>

      {/* Gatilho */}
      <section className="wf-settings-inline-section">
        <span className="wf-settings-inline-section-title">Gatilho &amp; Orquestração</span>
        <div className="field-rows">
          <div className="field-row">
            <span className="field-label">Gatilho</span>
            <div className="field-pills-select">
              {TRIGGER_OPTS.map(opt => (
                <button
                  key={opt.key}
                  className={`field-option-pill${trigger === opt.key ? " selected" : ""}`}
                  onClick={() => { setTrigger(opt.key); setTriggerWfId(""); setTriggerTaskId(""); mark(); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Gatilho: ${currentTrigger?.label}]`); pulseCiteBtn(e.currentTarget); }}>
              <Icon name="chat-circle" size={16} />
            </button>
          </div>
          {(trigger === "wf-completion" || trigger === "task-completion") && (
            <div className="field-row">
              <span className="field-label">Workflow origem</span>
              <select className="field-value-pill" value={triggerWfId} onChange={e => { setTriggerWfId(e.target.value); setTriggerTaskId(""); mark(); }}>
                <option value="">Selecionar...</option>
                {allWorkflows.map(w => <option key={w.id} value={w.id}>{w.icon} {w.name}</option>)}
              </select>
            </div>
          )}
          {trigger === "task-completion" && triggerWfId && (
            <div className="field-row">
              <span className="field-label">Tarefa origem</span>
              <select className="field-value-pill" value={triggerTaskId} onChange={e => { setTriggerTaskId(e.target.value); mark(); }}>
                <option value="">Selecionar...</option>
                {triggerWfTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          <div className="field-row">
            <span className="field-label">Orquestração</span>
            <div className="field-pills-select">
              <button className={`field-option-pill${aiOrch ? " selected" : ""}`} onClick={() => { setAiOrch(true); mark(); }}>
                <IconSparkleFill size={11} /> Agêntica
              </button>
              <button className={`field-option-pill${!aiOrch ? " selected" : ""}`} onClick={() => { setAiOrch(false); mark(); }}>
                <IconHandFill size={11} /> Manual
              </button>
            </div>
            <button className="field-cite-btn" title="Citar no chat" onClick={e => { e.stopPropagation(); chatCite?.(`[Orquestração: ${aiOrch ? "Agêntica" : "Manual"}]`); pulseCiteBtn(e.currentTarget); }}>
              <Icon name="chat-circle" size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Dependências */}
      <section className="wf-settings-inline-section">
        <span className="wf-settings-inline-section-title">Dependências</span>
        {deps.length > 0 && (
          <div className="field-row" style={{ alignItems: "flex-start", paddingTop: 6 }}>
            <span className="field-label">Requer</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {deps.map((dep, i) => (
                <span key={i} className="wf-settings-dep-chip wf-settings-dep-chip--removable">
                  {dep.wfIcon} {dep.wfName}
                  <button className="dep-chip-remove" onClick={() => { setDeps(d => d.filter((_, j) => j !== i)); mark(); }}>
                    <Icon name="x" size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="field-row">
          <span className="field-label" />
          <button ref={depBtnRef} className="wf-new-step" style={{ marginTop: 2 }} onClick={() => {
            if (!depOpen && depBtnRef.current) {
              const r = depBtnRef.current.getBoundingClientRect();
              depPos.current = { top: r.bottom + 6, left: r.left, width: Math.max(r.width, 260) };
            }
            setDepOpen(o => !o);
          }}>
            <Icon name="plus" size={13} /> Adicionar dependência
          </button>
        </div>
        {depOpen && depPos.current && ReactDOM.createPortal(
          <div className="dep-dropdown" ref={depDropRef} style={{ position: "fixed", top: depPos.current.top, left: depPos.current.left, width: depPos.current.width, zIndex: 9999 }}>
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
      </section>
    </div>
  );
}

/* ── Version history (shown at the bottom of the workflow detail) ─────────── */
function WfVersionHistory({ workflow }) {
  const [histOpen, setHistOpen] = useState(false);

  const ENTITY_LABEL = { task: "Tarefa", dependency: "Dependência", trigger: "Gatilho", supplier: "Fornecedor", contingency: "Contingência", "general config": "Config. geral" };
  const CHANGE_LABEL = { added: "adicionado", removed: "removido", renamed: "renomeado", edited: "editado", changed: "alterado", connected: "conectado", disconnected: "desconectado", replaced: "substituído" };
  const CHANGE_SIGN  = { added: "+", removed: "−", replaced: "⇄", renamed: "~", edited: "~", changed: "~", connected: "+", disconnected: "−" };

  const log = workflow.versionLog || [];
  if (log.length === 0) return null;

  return (
    <section className="detail-section flush">
      <div className="detail-section-head">
        <h3>
          Histórico de versões
          <span className="wf-meta-hist-count">{log.length}</span>
        </h3>
        <button className="icon-btn" onClick={() => setHistOpen(v => !v)} title={histOpen ? "Ocultar histórico" : "Ver histórico"}>
          <Icon name={histOpen ? "chevron-down" : "chevron-right"} size={14} />
        </button>
      </div>
      {histOpen && (
        <div className="wf-meta-hist-list">
          {log.map((entry) => (
            <div key={entry.version} className="wf-meta-hist-entry">
              <div className="wf-meta-hist-head">
                <span className="wf-meta-hist-ver">v{entry.version}</span>
                <span className="wf-meta-hist-when">{fmtWfDate(entry.publishedAt)}</span>
                <span className="wf-meta-hist-who">{entry.publishedBy}</span>
              </div>
              <p className="wf-meta-hist-desc">"{entry.description}"</p>
              <ul className="wf-meta-hist-deltas">
                {entry.deltas.map((d, i) => (
                  <li key={i} className={`wf-meta-delta wf-meta-delta--${d.change}`}>
                    <span className="wf-meta-delta-sign">{CHANGE_SIGN[d.change] || "·"}</span>
                    <span className="wf-meta-delta-entity">{ENTITY_LABEL[d.entity] || d.entity}</span>
                    <span className="wf-meta-delta-change">{CHANGE_LABEL[d.change] || d.change}</span>
                    <span className="wf-meta-delta-detail">{d.detail}</span>
                  </li>
                ))}
              </ul>
              <div className="wf-meta-hist-footer">
                <span>{entry.appliedTo === "all_orders" ? "Aplicado a todos os pedidos" : "Somente pedidos novos"}</span>
                <span>{entry.activeOrdersAtPublish.toLocaleString("pt-BR")} pedidos ativos na publicação</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── 1-passo detail view ───────────────────────────────────────────────────────
function WorkflowDetailView1Passo({ workflow, onOpenTask, onOpenStage, onOpenSettings, detailActionsRef, onDirtyChange }) {
  const [stages, setStages] = useState(() => workflow.stages);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => { setIsDirty(true); onDirtyChange?.(true); };
  const clearDirty = () => { setIsDirty(false); onDirtyChange?.(false); };

  // Stage drag-and-drop
  const [stageDraggingIdx, setStageDraggingIdx] = useState(null);
  const [stageDragOverIdx, setStageDragOverIdx] = useState(null);

  const handleStageDragStart = (e, idx) => {
    setStageDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const handleStageDragOver = (e, idx) => {
    e.preventDefault();
    if (idx !== stageDraggingIdx) setStageDragOverIdx(idx);
  };
  const handleStageDrop = (e, toIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (stageDraggingIdx === null || stageDraggingIdx === toIdx) {
      setStageDraggingIdx(null); setStageDragOverIdx(null); return;
    }
    const next = [...stages];
    const [moved] = next.splice(stageDraggingIdx, 1);
    next.splice(toIdx, 0, moved);
    setStages(next);
    setStageDraggingIdx(null);
    setStageDragOverIdx(null);
    markDirty();
  };
  const handleStageDragEnd = () => { setStageDraggingIdx(null); setStageDragOverIdx(null); };

  const moveStage = (idx, dir) => {
    const next = [...stages];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setStages(next);
    markDirty();
  };

  const handleSave = () => clearDirty();

  const stagesRef = useRef(stages);
  useEffect(() => { stagesRef.current = stages; }, [stages]);

  useEffect(() => {
    if (detailActionsRef) {
      detailActionsRef.current = {
        addStage: (stageName) => {
          setStages(prev => [...prev, { name: stageName, tasks: [] }]);
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

      {(workflow.version || workflow.wfStatus) && <WfMetaSection workflow={workflow} onOpenSettings={onOpenSettings} />}

      <WfSettingsInline workflow={workflow} onDirtyChange={onDirtyChange} />

      <div className="detail-sector-title detail-sector-title--spaced">
        <h2>Etapas</h2>
      </div>

      <div className="stages-section">
        <div className="wf-detail-stages-1step">
          {stages.reduce((acc, stage, si) => {
            const startNum = acc.n;
            acc.n += stage.tasks.length;
            acc.els.push(
              <React.Fragment key={stage.id ?? si}>
                <div className="wf-detail-1step-col">
                  <StageCard
                    stage={stage}
                    workflow={workflow}
                    startNum={startNum}
                    onOpenTask={onOpenTask}
                    onOpenStage={onOpenStage}
                    canMoveUp={si > 0}
                    canMoveDown={si < stages.length - 1}
                    onMoveUp={() => moveStage(si, -1)}
                    onMoveDown={() => moveStage(si, 1)}
                    onChanged={markDirty}
                    stageDragging={stageDraggingIdx === si}
                    stageDragOver={stageDragOverIdx === si}
                    onStageDragStart={(e) => handleStageDragStart(e, si)}
                    onStageDragOver={(e) => handleStageDragOver(e, si)}
                    onStageDrop={(e) => handleStageDrop(e, si)}
                    onStageDragEnd={handleStageDragEnd}
                  />
                </div>
                {si < stages.length - 1 && (
                  <div className="wf-list-stage-arrow wf-detail-1step-arrow">
                    <Icon name="chevron-right" size={16} />
                  </div>
                )}
              </React.Fragment>
            );
            return acc;
          }, { n: 1, els: [] }).els}
        </div>
      </div>
    </>
  );
}

// ── 2-passos detail view ──────────────────────────────────────────────────────
function WorkflowDetailView2Passos({ workflow, onOpenTask, onOpenStage, onOpenSettings, detailActionsRef, onDirtyChange }) {
  const [stages, setStages] = useState(() => workflow.stages);
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => { setIsDirty(true); onDirtyChange?.(true); };
  const clearDirty = () => { setIsDirty(false); onDirtyChange?.(false); };
  const [insertingAt, setInsertingAt] = useState(null);
  const [newStageName, setNewStageName] = useState("");
  const newStageRef = useRef(null);

  // Stage drag-and-drop
  const [stageDraggingIdx, setStageDraggingIdx] = useState(null);
  const [stageDragOverIdx, setStageDragOverIdx] = useState(null);

  const handleStageDragStart = (e, idx) => {
    setStageDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const handleStageDragOver = (e, idx) => {
    e.preventDefault();
    if (idx !== stageDraggingIdx) setStageDragOverIdx(idx);
  };
  const handleStageDrop = (e, toIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (stageDraggingIdx === null || stageDraggingIdx === toIdx) {
      setStageDraggingIdx(null); setStageDragOverIdx(null); return;
    }
    const next = [...stages];
    const [moved] = next.splice(stageDraggingIdx, 1);
    next.splice(toIdx, 0, moved);
    setStages(next);
    setStageDraggingIdx(null);
    setStageDragOverIdx(null);
    markDirty();
  };
  const handleStageDragEnd = () => { setStageDraggingIdx(null); setStageDragOverIdx(null); };

  const moveStage = (idx, dir) => {
    const next = [...stages];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setStages(next);
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
    next.splice(insertingAt + 1, 0, { name: newStageName, tasks: [] });
    setStages(next);
    setInsertingAt(null);
    setNewStageName("");
    markDirty();
  };

  const cancelInsert = () => { setInsertingAt(null); setNewStageName(""); };

  const stagesRef = useRef(stages);
  useEffect(() => { stagesRef.current = stages; }, [stages]);

  useEffect(() => {
    if (detailActionsRef) {
      detailActionsRef.current = {
        addStage: (stageName) => {
          setStages(prev => [...prev, { name: stageName, tasks: [] }]);
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
      <SectionBlock>
        <div className="wf-detail-head">
          <h1 className="detail-title">{workflow.name}</h1>
        </div>

        {(workflow.version || workflow.wfStatus) && <WfMetaSection workflow={workflow} onOpenSettings={onOpenSettings} />}
      </SectionBlock>

      <WfSettingsInline workflow={workflow} onDirtyChange={onDirtyChange} />

      <WfSettingsInline workflow={workflow} onDirtyChange={onDirtyChange} />

      <div className="detail-sector-title detail-sector-title--spaced">
        <h2>Etapas</h2>
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
                  workflow={workflow}
                  startNum={startNum}
                  onOpenTask={onOpenTask}
                  onOpenStage={onOpenStage}
                  canMoveUp={si > 0}
                  canMoveDown={si < stages.length - 1}
                  onMoveUp={() => moveStage(si, -1)}
                  onMoveDown={() => moveStage(si, 1)}
                  onChanged={markDirty}
                  stageDragging={stageDraggingIdx === si}
                  stageDragOver={stageDragOverIdx === si}
                  onStageDragStart={(e) => handleStageDragStart(e, si)}
                  onStageDragOver={(e) => handleStageDragOver(e, si)}
                  onStageDrop={(e) => handleStageDrop(e, si)}
                  onStageDragEnd={handleStageDragEnd}
                />
                {si < stages.length - 1 && (
                  <>
                    <div className="stage-linker can-insert">
                      {insertingAt !== si && (
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
    </>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
function WorkflowDetailView({ wfDetailView = "2-passos", ...props }) {
  if (wfDetailView === "1-passo") return <WorkflowDetailView1Passo {...props} />;
  return <WorkflowDetailView2Passos {...props} />;
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

/* ---------- Workflow Board Canvas ---------- */

function WorkflowBoardCanvas({
  mode, setMode,
  settingsActionsRef, detailActionsRef, taskActionsRef,
  showWizard, setShowWizard, wizardPreFill, setWizardPreFill,
  detailHasChanges, setDetailHasChanges,
  wfLayout = "expanded", wfGroup = "flat",
  wfDetailView = "2-passos",
}) {
  const isList       = mode.kind === "list";
  const isDetail     = mode.kind === "detail";
  const isTask       = mode.kind === "task";
  const isStage      = mode.kind === "stage";
  const isSettings   = mode.kind === "settings";
  const workflow     = mode.workflowId ? AIWData.workflows.find((w) => w.id === mode.workflowId) : null;

  const back = () => {
    if (showWizard) { setShowWizard(false); setWizardPreFill(null); return; }
    if (isTask || isStage || isSettings) setMode({ kind: "detail", workflowId: mode.workflowId });
    else if (isDetail) { setDetailHasChanges(false); setMode({ kind: "list" }); }
  };

  let headerLeft;
  if (isList && showWizard) {
    headerLeft = (
      <button className="od-back-link" data-sl-button data-variant="tertiary" data-has-label onClick={back}>
        <IconCaretLeftSmall size={14} /> Voltar para Workflow Builder
      </button>
    );
  } else if (isList) {
    headerLeft = (
      <>
        <span className="id-chip">WFB</span>
        <span className="canvas-name">Workflow Builder</span>
      </>
    );
  } else if (isDetail) {
    headerLeft = (
      <button className="od-back-link" data-sl-button data-variant="tertiary" data-has-label onClick={back}>
        <IconCaretLeftSmall size={14} /> Voltar para Workflow Builder
      </button>
    );
  } else {
    headerLeft = (
      <button className="od-back-link" data-sl-button data-variant="tertiary" data-has-label onClick={back}>
        <IconCaretLeftSmall size={14} /> Voltar para {workflow?.name}
      </button>
    );
  }

  return (
    <div className="detail-panel">
      <div className="detail-head no-border">
        <div className="detail-head-left">{headerLeft}</div>
        <div className="detail-head-right">
          {isList && !showWizard && (() => {
            const activeWfs = AIWData.workflows.filter(w => !w.archived);
            const totalOrders = AIWData.workflows.reduce((s, w) => s + (w.orders || 0), 0);
            return (
              <>
                <span className="canvas-meta-count"><Icon name="list" size={14} /> {activeWfs.length}</span>
                <span className="canvas-meta-count"><Icon name="cart" size={14} /> {totalOrders.toLocaleString("pt-BR")}</span>
                <button className="icon-btn" title="Mais opções"><Icon name="more" size={16} /></button>
              </>
            );
          })()}
          {(isDetail || isTask || isStage || isSettings) && detailHasChanges &&
            <button data-sl-button data-variant="primary" data-size="small" data-has-label onClick={() => {
              detailActionsRef.current?.save?.();
              setDetailHasChanges(false);
            }}>
              <Icon name="check" size={12} /> Publicar
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
                      <button className={`wf-list-agent-btn${w.agentEnabled ? " agent-on" : " agent-off"}`}
                              onClick={e => e.stopPropagation()}
                              title={w.agentEnabled ? "Agente AI ativo" : "Manual"}>
                        {w.agentEnabled ? <IconSparkleFill size={16} /> : <IconHandFill size={16} />}
                      </button>
                      <span className="wf-list-body-text">
                        <span className="wf-list-name">{w.name}</span>
                        <span className="wf-list-meta">
                          {w.orders} pedidos ativos
                        </span>
                      </span>
                    </span>
                    <span className="wf-list-head-right">
                      <span className={`wf-list-status ${w.archived ? "archived" : "active"}`}>
                        {w.archived ? "Arquivado" : "Ativo"}
                      </span>
                      <button data-sl-button data-variant="tertiary" data-size="large"
                              className="wf-list-edit-btn"
                              onClick={e => { e.stopPropagation(); setMode({ kind: "detail", workflowId: w.id }); }}
                              title="Editar workflow">
                        <IconPencil size={16} />
                      </button>
                    </span>
                  </div>
                  <div className="wf-list-stages">
                    {w.stages.map((stage, si) => (
                      <React.Fragment key={stage.id}>
                        <div className="wf-list-stage-col">
                          <div className="wf-list-stage-head">
                            <div style={{ padding: '8px 8px', background: 'rgb(247, 248, 250)', borderRadius: '4px' }}>
                              <span className="wf-list-stage-name">{stage.name}</span>
                            </div>
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
                <div key={w.id} className="wf-list-card wf-list-card--expanded"
                     onClick={() => setMode({ kind: "detail", workflowId: w.id })}
                     role="button" tabIndex={0}
                     onKeyDown={e => e.key === "Enter" && setMode({ kind: "detail", workflowId: w.id })}>
                  <div className="wf-list-card-head">
                    <span className="wf-list-body">
                      <span className="wf-list-name">{w.name}</span>
                      <span className="wf-list-meta">{w.stages.length} etapas · {tt} tarefas</span>
                    </span>
                    <span className="wf-list-head-right">
                      <span className="wf-list-orders">{w.orders} pedidos ativos</span>
                      <button className={`wf-list-agent-btn${w.agentEnabled ? " agent-on" : " agent-off"}`}
                              onClick={e => e.stopPropagation()}
                              title={w.agentEnabled ? "Agente AI ativo" : "Manual"}>
                        {w.agentEnabled ? <IconSparkleFill size={16} /> : <IconHandFill size={16} />}
                      </button>
                      <span className={`wf-list-status ${w.archived ? "archived" : "active"}`}>
                        {w.archived ? "Arquivado" : "Ativo"}
                      </span>
                      <button
                        data-sl-button data-variant="tertiary" data-size="large"
                        className="wf-list-edit-btn"
                        onClick={e => { e.stopPropagation(); setMode({ kind: "detail", workflowId: w.id }); }}
                        title="Editar workflow">
                        <IconPencil size={16} />
                      </button>
                    </span>
                  </div>
                  <div className="wf-list-stages wf-list-stages--compact">
                    {w.stages.map((stage, si) => (
                      <React.Fragment key={stage.id}>
                        <div className="wf-list-stage-col wf-list-stage-col--compact">
                          <span className="wf-list-stage-name">{stage.name}</span>
                        </div>
                        {si < w.stages.length - 1 && (
                          <span className="wf-list-stage-arrow wf-list-stage-arrow--compact">
                            <Icon name="chevron-right" size={16} />
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            };

            const renderCard = (w) => (wfLayout === "compact" || wfLayout === "table") ? renderCompact(w) : renderExpanded(w);

            const groupByCat = (items) =>
              AIWData.wfCategories
                .map(cat => ({ cat, items: items.filter(w => w.category === cat.id) }))
                .filter(g => g.items.length > 0);


            // ── Expanded / compact with optional grouping ─────────────────
            const docCls = wfLayout === "table" ? " wf-list--documento" : "";
            if (wfGroup === "category") {
              return (
                <div className={`wf-list${docCls}`}>
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
            const docClass = wfLayout === "table" ? " wf-list--documento" : "";
            return <div className={`wf-list${docClass}`}>{wfs.map(renderCard)}</div>;
          })()}


          {isDetail && workflow &&
            <WorkflowDetailView
              workflow={workflow}
              onOpenTask={(id) => setMode({ kind: "task", workflowId: workflow.id, taskId: id })}
              onOpenStage={(sid) => setMode({ kind: "stage", workflowId: workflow.id, stageId: sid })}
              onOpenSettings={(section) => setMode({ kind: "settings", workflowId: workflow.id, section: section || "geral" })}
              detailActionsRef={detailActionsRef}
              onDirtyChange={setDetailHasChanges}
              wfDetailView={wfDetailView}
            />
          }

          {isTask && workflow &&
            <TaskConfigView workflow={workflow} taskId={mode.taskId} taskActionsRef={taskActionsRef} onDirtyChange={setDetailHasChanges} />
          }

          {isStage && workflow &&
            <StageConfigView workflow={workflow} stageId={mode.stageId} onDirtyChange={setDetailHasChanges} />
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
      title: "Workflow Builder",
      placeholder: "Criar workflow, auditar, otimizar...",
      chips: [
        { icon: "plus",    label: "Criar novo workflow"     },
        { icon: "search",  label: "Auditar workflow padrão" },
        { icon: "sparkle", label: "Sugerir otimizações"     },
        { icon: "graph",   label: "Resumir cobertura"       }
      ],
      messages: [
        { from: "agent", text: "Olá! Sou o Agente de Workflow. Posso ajudar você a criar, editar ou auditar os workflows de **Workflow Builder**." },
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

function WorkflowBoardView({ onBack, wfLayout = "expanded", wfGroup = "flat", wfDetailView = "2-passos", initialMode, onModeChange }) {
  const [mode, setModeState] = useState(initialMode || { kind: "list" });
  const setMode = (m) => { setModeState(m); onModeChange && onModeChange(m); };

  // Chat state — controlled from here so the engine can drive both sides
  const [chatMsgs, setChatMsgs] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatComposerRef = useRef(null);

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

  const citeFn = React.useCallback((text) => {
    chatComposerRef.current?.append(text);
  }, []);

  return (
    <ChatCiteContext.Provider value={citeFn}>
      <ResizableSplit screenLabel="03 Workflow Builder" initialWidth={343}>
        <ChatPanel
          title={ctx.title}
          chips={ctx.chips}
          placeholder={ctx.placeholder}
          onBack={onBack}
          messages={chatMsgs}
          onSend={handleSend}
          isTyping={isTyping}
          composerRef={chatComposerRef}
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
          wfDetailView={wfDetailView}
        />
      </ResizableSplit>
    </ChatCiteContext.Provider>
  );
}

window.WorkflowBoardView = WorkflowBoardView;
