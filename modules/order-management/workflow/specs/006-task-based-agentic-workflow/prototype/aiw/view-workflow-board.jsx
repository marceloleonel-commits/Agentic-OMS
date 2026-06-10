/* global React, Icon, IconSparkleFill, IconHandFill, IconPencil, IconCursorFill, IconDragDots, IconDotsSixVertical, IconPlayCircleFill, IconCaretLeftSmall, IconCaretDown, IconCaretUp, IconTrash, IconCheck, IconCube, IconCurrencyCircleDollar, IconNewspaper, IconTruck, AIWData, ChatPanel, ResizableSplit */
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

/* ---------- Chat cite / send contexts ---------- */
const ChatCiteContext = React.createContext(null);
const ChatSendContext = React.createContext(null);

/* ---------- Chat-driven task creation context ---------- */
// true while the agent is mid-flow collecting a new task from the user
const ChatAddingTaskContext = React.createContext(false);
// fn(stageName) — triggers the chat-driven add-task flow pre-seeded with a stage
const ChatStartAddTaskContext = React.createContext(null);
// fn() — triggers the chat-driven add-stage flow
const ChatStartAddStageContext = React.createContext(null);

/* ---------- Proactive agent-message contexts ---------- */
// fn(msgs, delay?) — push agent bubble(s) directly from canvas components
const AgentSayContext = React.createContext(null);
// fn(taskName, stageName, undoFn) — notify chat that a task was removed
const ChatTaskRemovedContext = React.createContext(null);
function pulseCiteBtn(btn) {
  if (!btn) return;
  btn.classList.add("cited");
  setTimeout(() => btn.classList.remove("cited"), 520);
}

/* ---------- Dirty-fields context (for counting unsaved changes) ---------- */

const DirtyFieldsContext = React.createContext(null);

/* ---------- SectionTitle + SectionBlock — shared layout primitives -------- */
function SectionTitle({ children, as: Tag = "h2" }) {
  return (
    <div className="detail-sector-title">
      <Tag>{children}</Tag>
    </div>
  );
}

function SectionBlock({ title, actions, children }) {
  return (
    <div className="detail-section-block">
      {title && (
        <div className="detail-sector-title">
          <h2>{title}</h2>
          {actions && <div className="detail-sector-title-actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

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
  const initialValueRef = React.useRef(value);
  const isDirty = !disabled && value !== initialValueRef.current;
  const registerDirty = React.useContext(DirtyFieldsContext);
  const fieldId = label + (placeholder || "");
  React.useEffect(() => {
    registerDirty?.(fieldId, isDirty);
  }, [isDirty]);

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
      ) : (
        <input
          className={`stage-prop-input${isDirty ? " field-value-pill--dirty" : ""}`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      <Actions>
        <CiteBtn text={`[${label}: ${value || placeholder || "—"}]`} />
      </Actions>
    </div>
  );
}

/* ---------- Actions container & CiteBtn ---------- */

function Actions({ card, children }) {
  return (
    <span className={`stage-task-chevron${card ? " wf-card-chevron" : ""}`}>
      {children}
    </span>
  );
}

function CiteBtn({ text }) {
  const chatCite = React.useContext(ChatCiteContext);
  return (
    <button
      className="field-cite-btn stage-task-action-btn"
      title="Citar no chat"
      onClick={e => { e.stopPropagation(); chatCite?.(text); pulseCiteBtn(e.currentTarget); }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 16, lineHeight: 1 }}>format_quote</span>
    </button>
  );
}

/* ---------- Task config (deeper flow) ---------- */

function TaskConfigView({ workflow, taskId, taskActionsRef, onDirtyChange, onExecTypeChange, onStageChange }) {
  // Lookup task before hooks — but early return comes AFTER all hooks to respect Rules of Hooks
  let foundStage = null, foundTask = null;
  for (const s of workflow.stages) {
    const t = s.tasks.find((x) => x.id === taskId);
    if (t) { foundStage = s; foundTask = t; break; }
  }

  const [name, setName]     = useState(foundTask?.name ?? "");
  const [owner, setOwner]   = useState(foundTask?.owner ?? "");
  const [category, setCategory] = useState("");
  const [selectedStageId, setSelectedStageId] = useState(foundStage?.id ?? "");
  // Visibilidade: "user" (shopper-facing) | "internal"
  const [visibility, setVisibility] = useState("internal");
  const [agentOrch, setAgentOrch] = useState(false);
  // Estado
  const [active, setActive] = useState(true);

  const mark = () => onDirtyChange?.(true);

  // Register non-InlineField changes to DirtyFieldsContext so the badge counts them
  const registerDirty = React.useContext(DirtyFieldsContext);
  const initVisibility  = useRef("internal");
  const initAgentOrch   = useRef(false);
  const initActive      = useRef(true);
  useEffect(() => { registerDirty?.("visibility",   visibility  !== initVisibility.current);  }, [visibility]);
  useEffect(() => { registerDirty?.("agentOrch",    agentOrch   !== initAgentOrch.current);   }, [agentOrch]);
  useEffect(() => { onExecTypeChange?.(agentOrch); }, [agentOrch]);
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

  // Safe early return after all hooks
  if (!foundTask) return null;

  const stage = foundStage;

  return (
    <>
      {/* Quick info rows (inline) */}
      <div className="field-rows">

        <div className="field-row">
          <span className="field-label">Etapa</span>
          <select
            className="stage-prop-input"
            value={selectedStageId}
            onChange={e => {
              const newStageId = e.target.value;
              setSelectedStageId(newStageId);
              mark();
              onStageChange?.(newStageId);
            }}
            onClick={e => e.stopPropagation()}
          >
            {workflow.stages.map((s, si) => (
              <option key={s.id ?? si} value={s.id ?? si}>{s.name}</option>
            ))}
          </select>
          <Actions>
            <CiteBtn text={`[Etapa: ${workflow.stages.find(s => s.id === selectedStageId)?.name ?? "—"}]`} />
          </Actions>
        </div>

        <div className="field-row">
          <span className="field-label">Status</span>
          <div className="qi-toggle-group">
            <button
              className={`qi-toggle-btn${active ? " qi-toggle-btn--active" : ""}`}
              onClick={e => { e.stopPropagation(); setActive(true); mark(); }}
            >
              <span className="qi-toggle-title">Ativo</span>
              <span className="qi-toggle-desc">Considerada na execução do workflow</span>
            </button>
            <button
              className={`qi-toggle-btn${!active ? " qi-toggle-btn--active" : ""}`}
              onClick={e => { e.stopPropagation(); setActive(false); mark(); }}
            >
              <span className="qi-toggle-title">Inativo</span>
              <span className="qi-toggle-desc">Ignorada na execução</span>
            </button>
          </div>
          <Actions>
            <CiteBtn text={`[Status: ${active ? "Ativo" : "Inativo"}]`} />
          </Actions>
        </div>

        <div className="field-row">
          <span className="field-label">Como executa</span>
          <div className="qi-toggle-group">
            <button
              className={`qi-toggle-btn${!agentOrch ? " qi-toggle-btn--active" : ""}`}
              onClick={e => { e.stopPropagation(); setAgentOrch(false); mark(); }}
            >
              <span className="qi-toggle-title">Manual</span>
              <span className="qi-toggle-desc">Executado por operador humano</span>
            </button>
            <button
              className={`qi-toggle-btn${agentOrch ? " qi-toggle-btn--active" : ""}`}
              onClick={e => { e.stopPropagation(); setAgentOrch(true); mark(); }}
            >
              <span className="qi-toggle-title">Automático</span>
              <span className="qi-toggle-desc">Executado agenticamente</span>
            </button>
          </div>
          <Actions>
            <CiteBtn text={`[Como executa: ${agentOrch ? "Automático" : "Manual"}]`} />
          </Actions>
        </div>

        <div className="field-row">
          <span className="field-label">Visibilidade</span>
          <div className="qi-toggle-group">
            <button
              className={`qi-toggle-btn${visibility === "internal" ? " qi-toggle-btn--active" : ""}`}
              onClick={e => { e.stopPropagation(); setVisibility("internal"); mark(); }}
            >
              <span className="qi-toggle-title">Interna</span>
              <span className="qi-toggle-desc">Não aparece para o shopper</span>
            </button>
            <button
              className={`qi-toggle-btn${visibility === "user" ? " qi-toggle-btn--active" : ""}`}
              onClick={e => { e.stopPropagation(); setVisibility("user"); mark(); }}
            >
              <span className="qi-toggle-title">Externa</span>
              <span className="qi-toggle-desc">Visível para o shopper</span>
            </button>
          </div>
          <Actions>
            <CiteBtn text={`[Visibilidade: ${visibility === "user" ? "Externa" : "Interna"}]`} />
          </Actions>
        </div>

      </div>


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


/* ---------- Inline task row with collapse ---------- */

function StageTaskRow({ task, workflow, idx, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, onChanged, onRemove, isOpen, onToggle, isNew, onStageChange }) {
  const [dirtyCount, setDirtyCount] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [execType, setExecType] = useState(task.type); // "manual" | "auto" — synced with TaskConfigView agentOrch

  return (
    <>
      <div
        className={`stage-task${dragging === idx ? " is-dragging" : ""}${dragOver === idx ? " drag-over" : ""}${isOpen ? " stage-task--open" : ""}${isNew ? " stage-task--new" : ""}`}
        data-task-id={task.id}
        draggable={!isOpen}
        onDragStart={!isOpen ? onDragStart : undefined}
        onDragOver={!isOpen ? onDragOver : undefined}
        onDrop={!isOpen ? onDrop : undefined}
        onDragEnd={!isOpen ? onDragEnd : undefined}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      >
        <span className="stage-task-grip" aria-hidden="true">
          <IconDotsSixVertical size={20} />
        </span>
        <span className="stage-task-num" aria-hidden="true">{idx + 1}</span>
        <span className="stage-task-name">{task.name}</span>
        {dirtyCount > 0 && (
          <span className="stage-task-dirty-badge" title={`${dirtyCount} alteração${dirtyCount !== 1 ? "ões" : ""} não salva${dirtyCount !== 1 ? "s" : ""}`}>
            {dirtyCount}
          </span>
        )}
        {isOpen ? (
          <span className="stage-task-open-btns">
            <button
              data-sl-button
              data-variant="tertiary"
              data-tone="critical"
              title="Remover tarefa"
              onClick={e => { e.stopPropagation(); setConfirmRemove(true); }}
            >
              <IconTrash size={20} />
            </button>
            <button
              data-sl-button
              data-variant="secondary"
              title="Fechar"
              onClick={e => { e.stopPropagation(); onToggle(); }}
            >
              <IconCheck size={20} />
            </button>
          </span>
        ) : (
          <Actions>
            <CiteBtn text={`[Tarefa: ${task.name}]`} />
            <button
              className="stage-task-action-btn stage-task-edit-btn"
              title="Abrir tarefa"
              onClick={e => { e.stopPropagation(); onToggle(); }}
            >
              <IconPencil size={14} />
            </button>
          </Actions>
        )}
      </div>
      {isOpen && !confirmRemove && (
        <div className="stage-task-config" onClick={e => e.stopPropagation()}>
          <TaskConfigView
            workflow={workflow}
            taskId={task.id}
            onDirtyChange={() => setDirtyCount(c => c + 1)}
            onExecTypeChange={isAuto => setExecType(isAuto ? "auto" : "manual")}
            onStageChange={onStageChange}
          />
        </div>
      )}
      {isOpen && confirmRemove && (
        <div className="stage-task-config-footer">
          <span className="stage-task-remove-confirm-text">Remover tarefa permanentemente?</span>
          <button className="btn btn-sm btn-ghost" onClick={() => setConfirmRemove(false)}>Cancelar</button>
          <button className="btn btn-sm btn-danger" onClick={() => onRemove?.()}>
            <Icon name="x" size={12} /> Remover
          </button>
        </div>
      )}
    </>
  );
}

/* ---------- "Adicionar tarefa" button ---------- */
function AddTaskBtn({ disabled, onClick }) {
  return (
    <button
      className="stage-add-task-btn"
      data-sl-button
      data-variant="tertiary"
      data-has-label
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Aguarde o agente concluir a criação da tarefa no chat" : undefined}
    >
      <Icon name="plus" size={12} /> Adicionar tarefa
    </button>
  );
}

/* ---------- Stage card (Figma-spec layout) ---------- */

function StageCard({ stage, workflow, startNum, onOpenTask, onOpenStage, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onChanged, stageDragging, stageDragOver, onStageDragStart, onStageDragOver, onStageDrop, onStageDragEnd }) {
  const [tasks, setTasks] = useState(() => stage.tasks);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const chatAddingTask = React.useContext(ChatAddingTaskContext);
  const chatStartAddTask = React.useContext(ChatStartAddTaskContext);
  const notifyTaskRemoved = React.useContext(ChatTaskRemovedContext);

  const stageCardRef = useRef(null);
  const stageTasksRef = useRef(stage.tasks);

  const [newlyAddedId, setNewlyAddedId] = useState(null);

  // Sync tasks added via chat "Aplicar" (detailActionsRef.addTask updates parent stages,
  // but StageCard owns its local tasks state). When the parent injects a new task,
  // open its card inline, scroll the canvas to it, and trigger the entry animation.
  useEffect(() => {
    const prevIds = new Set(stageTasksRef.current.map(t => t.id));
    const incoming = stage.tasks.filter(t => !prevIds.has(t.id));
    stageTasksRef.current = stage.tasks;
    if (incoming.length === 0) return;
    setTasks(prev => {
      const existingIds = new Set(prev.map(t => t.id));
      const toAdd = incoming.filter(t => !existingIds.has(t.id));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
    const lastNew = incoming[incoming.length - 1];
    setOpenTaskId(lastNew.id);
    setNewlyAddedId(lastNew.id);
    setTimeout(() => setNewlyAddedId(null), 1400);
    setTimeout(() => {
      const el = stageCardRef.current?.querySelector(`[data-task-id="${lastNew.id}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  }, [stage.tasks]);

  // Inline stage config
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Only one task open at a time
  const [openTaskId, setOpenTaskId] = useState(null);
  const toggleTask = (taskId) => setOpenTaskId(prev => prev === taskId ? null : taskId);
  const [stageName, setStageName] = useState(stage.name ?? "");
  const [responsible, setResponsible] = useState("");
  const [stageCategory, setStageCategory] = useState("");
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [mcpServer, setMcpServer] = useState("");
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [checkpoints, setCheckpoints] = useState([
    { id: "cp1", label: "Validação inicial", failAction: "Escalar para operador" }
  ]);
  const [connectors, setConnectors] = useState(() => {
    const seen = new Set();
    return stage.tasks
      .map(t => t.owner)
      .filter(Boolean)
      .filter(owner => { const ok = !seen.has(owner); seen.add(owner); return ok; })
      .map((owner, i) => ({ id: `conn-${i}`, label: owner, enabled: true }));
  });
  const [apiEnabled, setApiEnabled] = useState(false);
  const [apiUrl, setApiUrl] = useState("");
  const [scriptEnabled, setScriptEnabled] = useState(false);
  const [scriptBody, setScriptBody] = useState("");

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


  return (
    <div
      ref={stageCardRef}
      className={`stage-card${isConfigOpen ? " stage-card--config-open" : ""}`}
    >

      <div className="stage-card-head stage-card-head--clickable">
        <span className="stage-card-title">{stageName}</span>
        {isConfigOpen ? (
          <span className="stage-task-open-btns">
            <button
              data-sl-button
              data-variant="secondary"
              title="Fechar"
              onClick={() => setIsConfigOpen(false)}
            >
              <IconCheck size={20} />
            </button>
          </span>
        ) : (
          <>
            <Actions>
              <CiteBtn text={`[Etapa: ${stageName}]`} />
              <button
                className="stage-task-action-btn stage-task-edit-btn"
                title="Editar etapa"
                onClick={e => { e.stopPropagation(); setIsConfigOpen(true); }}
              >
                <IconPencil size={14} />
              </button>
            </Actions>
            <div className="stage-card-reorder" style={{ display: "none" }}>
              <button className="stage-reorder-btn" title="Subir etapa" onClick={onMoveUp} disabled={!canMoveUp}>
                <Icon name="chevron-down" size={16} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button className="stage-reorder-btn" title="Descer etapa" onClick={onMoveDown} disabled={!canMoveDown}>
                <Icon name="chevron-down" size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      {isConfigOpen && (
        <div className="stage-task-config">
          <section className="wf-settings-card">
            <div className="wf-settings-title-row">
              <h3 className="wf-settings-title">Checkpoints</h3>
              <Actions card>
                <CiteBtn text={`[Checkpoints: ${checkpoints.map(cp => cp.label || "—").join(", ")}]`} />
              </Actions>
            </div>
            <div className="field-rows">
              {checkpoints.map((cp) =>
                <div key={cp.id} className="field-row">
                  <span className="field-label">{cp.label || <em style={{ color: "var(--fg-3)" }}>Sem descrição</em>}</span>
                  <span className="field-value-pill disabled">{cp.failAction || <span style={{ color: "var(--fg-3)" }}>—</span>}</span>
                  <Actions>
                    <CiteBtn text={`[Checkpoint: ${cp.label || "—"}]`} />
                  </Actions>
                </div>
              )}
            </div>
          </section>

          <section className="wf-settings-card">
            <div className="wf-settings-title-row">
              <h3 className="wf-settings-title">Conectores</h3>
              <Actions card>
                <CiteBtn text={`[Conectores: ${connectors.filter(c => c.enabled).map(c => c.label).join(", ") || "nenhum"}]`} />
              </Actions>
            </div>
            <div className="field-rows">
              {connectors.length === 0 && (
                <span className="stage-connectors-empty">Nenhum conector configurado</span>
              )}
              {connectors.map(conn => (
                <div key={conn.id} className="field-row">
                  <span className="field-label">{conn.label}</span>
                  <button
                    className={`aiw-toggle ${conn.enabled ? "on" : ""}`}
                    onClick={() => { setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, enabled: !c.enabled } : c)); onChanged?.(); }}
                  >
                    <span className="aiw-toggle-knob" />
                  </button>
                  <Actions>
                    <CiteBtn text={`[Conector ${conn.label}: ${conn.enabled ? "ativo" : "inativo"}]`} />
                  </Actions>
                </div>
              ))}
            </div>
          </section>

          <section className="wf-settings-card">
            <h3 className="wf-settings-title">Integrações</h3>
            <div className="field-rows">
              <div className="field-row">
                <span className="field-label">Servidor MCP</span>
                <button className={`aiw-toggle ${mcpEnabled ? "on" : ""}`} onClick={() => { setMcpEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions>
                  <CiteBtn text={`[Servidor MCP: ${mcpEnabled ? (mcpServer || "ativado") : "desativado"}]`} />
                </Actions>
              </div>
              {mcpEnabled && (
                <InlineField label="Endereço MCP" value={mcpServer} onChange={v => { setMcpServer(v); onChanged?.(); }} placeholder="Nome do servidor MCP" />
              )}
              <div className="field-row">
                <span className="field-label">API Externa</span>
                <button className={`aiw-toggle ${apiEnabled ? "on" : ""}`} onClick={() => { setApiEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions>
                  <CiteBtn text={`[API Externa: ${apiEnabled ? (apiUrl || "ativada") : "desativada"}]`} />
                </Actions>
              </div>
              {apiEnabled && (
                <InlineField label="URL da API" value={apiUrl} onChange={v => { setApiUrl(v); onChanged?.(); }} placeholder="https://..." />
              )}
              <div className="field-row">
                <span className="field-label">Script customizado</span>
                <button className={`aiw-toggle ${scriptEnabled ? "on" : ""}`} onClick={() => { setScriptEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions>
                  <CiteBtn text={`[Script customizado: ${scriptEnabled ? "ativado" : "desativado"}]`} />
                </Actions>
              </div>
              {scriptEnabled && (
                <div className="field-row field-row--textarea">
                  <span className="field-label">Script</span>
                  <textarea
                    className="stage-prop-input"
                    value={scriptBody}
                    rows={4}
                    onChange={(e) => { setScriptBody(e.target.value); onChanged?.(); }}
                    placeholder={"// Lógica customizada em JavaScript\nreturn { status: 'completed' };"}
                    style={{ fontFamily: "monospace", fontSize: 12, resize: "vertical" }}
                  />
                  <Actions>
                    <CiteBtn text={`[Script: ${scriptBody ? "definido" : "vazio"}]`} />
                  </Actions>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {tasks.map((task, idx) =>
        <StageTaskRow
          key={task.id}
          task={task}
          stage={stage}
          workflow={workflow}
          idx={idx}
          isNew={newlyAddedId === task.id}
          dragging={dragging}
          dragOver={dragOver}
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={handleDragEnd}
          onChanged={onChanged}
          onRemove={() => {
            const removedTask = task;
            const removedIdx  = tasks.indexOf(task);
            setTasks(prev => prev.filter(t => t.id !== removedTask.id));
            onChanged?.();
            notifyTaskRemoved?.(
              removedTask.name,
              stage.name,
              () => setTasks(prev => {
                const next = [...prev];
                next.splice(removedIdx, 0, removedTask);
                return next;
              })
            );
          }}
          isOpen={openTaskId === task.id}
          onToggle={() => toggleTask(task.id)}
        />
      )}


      <AddTaskBtn disabled={chatAddingTask} onClick={() => chatStartAddTask?.(stage.name)} />
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
  draft:                   { label: "Rascunho",                          color: "gray"    },
  published:               { label: "Publicado",                         color: "green"   },
  published_with_changes:  { label: "Publicado · alterações pendentes",  color: "amber"   },
  archived:                { label: "Arquivado",                         color: "neutral" },
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
  const runningVersion = (workflow.wfStatus === "published_with_changes" && log.length > 0) ? log[0].version : null;
  const [histOpen, setHistOpen] = useState(false);

  const ENTITY_LABEL = { task: "Tarefa", dependency: "Dependência", trigger: "Gatilho", supplier: "Fornecedor", contingency: "Contingência", "general config": "Config. geral" };
  const CHANGE_LABEL = { added: "adicionado", removed: "removido", renamed: "renomeado", edited: "editado", changed: "alterado", connected: "conectado", disconnected: "desconectado", replaced: "substituído" };
  const CHANGE_SIGN  = { added: "+", removed: "−", replaced: "⇄", renamed: "~", edited: "~", changed: "~", connected: "+", disconnected: "−" };

  return (
    <dl className="detail-fields" style={{ marginBottom: 24 }}>
      <dt>Status</dt>
      <dd>
        <span className={`wf-list-status ${workflow.status === "active" ? "active" : "archived"}`}>
          {workflow.status === "active" ? "Ativo" : "Inativo"}
        </span>
      </dd>

      {workflow.desc && <>
        <dt>Descrição</dt>
        <dd style={{ color: "var(--fg-2)" }}>{workflow.desc}</dd>
      </>}

      <dt>Versão</dt>
      <dd>
        <span className="wf-meta-ver">{sm.label}</span>
        {' '}
        <span className="wf-meta-ver">(v{workflow.version})</span>
        {runningVersion && (
          <span className="wf-meta-running">v{runningVersion} em produção</span>
        )}
        {log.length > 0 && (
          <button
            className={`icon-btn wf-ver-hist-btn${histOpen ? " wf-ver-hist-btn--active" : ""}`}
            onClick={() => setHistOpen(o => !o)}
            title="Histórico de versões"
          >
            <span className="wf-meta-hist-count">{log.length}</span>
          </button>
        )}
      </dd>

      {histOpen && log.length > 0 && <>
        <dt style={{ paddingTop: 4 }}>
          <span className="wf-ver-hist-popup-title">Histórico</span>
        </dt>
        <dd>
          <div className="wf-ver-hist-inline">
            {log.slice(0, 3).map((entry) => (
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
            {log.length > 3 && (
              <button className="wf-ver-hist-see-all" data-sl-button data-variant="tertiary" data-has-label style={{ marginTop: 8 }} onClick={() => onOpenSettings("history")}>
                Ver todo o histórico
                <IconCaretRightSmall size={12} />
              </button>
            )}
          </div>
        </dd>
      </>}

      {workflow.publishedAt && <>
        <dt>Publicado em</dt>
        <dd className="wf-meta-actor"><WfActorSpan who={workflow.publishedBy} date={fmtWfDate(workflow.publishedAt)} /></dd>
      </>}
    </dl>
  );
}

/* ── Inline workflow settings (replaces separate settings route) ─────────── */
function WfSettingsInline({ workflow, onDirtyChange }) {
  const [trigger, setTrigger] = useState("order-start");
  const [aiOrch,  setAiOrch]  = useState(workflow.agentEnabled ?? true);
  const [deps, setDeps]       = useState([]);

  const mark = () => onDirtyChange?.(true);
  const [trigDropOpen, setTrigDropOpen] = useState(false);
  const trigBtnRef  = useRef(null);
  const trigDropRef = useRef(null);
  const trigPos     = useRef(null);

  const [depsDropOpen, setDepsDropOpen] = useState(false);
  const depsBtnRef  = useRef(null);
  const depsDropRef = useRef(null);
  const depsPos     = useRef(null);

  const chatSend = React.useContext(ChatSendContext);

  const allWorkflows = (AIWData && AIWData.workflows) ? AIWData.workflows.filter(w => w.id !== workflow.id) : [];

  const TRIGGER_OPTS = [
    { key: "order-start",     label: "Início do pedido" },
    { key: "wf-completion",   label: "Conclusão de workflow" },
    { key: "task-completion", label: "Conclusão de tarefa" },
  ];

  useEffect(() => {
    if (!trigDropOpen) return;
    const handler = (e) => {
      if (trigDropRef.current && !trigDropRef.current.contains(e.target) &&
          trigBtnRef.current  && !trigBtnRef.current.contains(e.target)) {
        setTrigDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [trigDropOpen]);

  useEffect(() => {
    if (!depsDropOpen) return;
    const handler = (e) => {
      if (depsDropRef.current && !depsDropRef.current.contains(e.target) &&
          depsBtnRef.current  && !depsBtnRef.current.contains(e.target)) {
        setDepsDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [depsDropOpen]);

  const currentTrigger = TRIGGER_OPTS.find(o => o.key === trigger);

  return (
    <div className="wf-settings-inline detail-section-block">
      <SectionTitle as="h1">Estratégia</SectionTitle>

      <div className="wf-settings-inline-prose">
        <div className="wf-settings-inline-cards">

          {/* Gatilho card */}
          <div className="wf-settings-inline-card">
            <span className="wf-settings-inline-card-label">Gatilho</span>
            <span className="wf-settings-inline-token">{currentTrigger?.label ?? "—"}</span>
            <span className="wf-settings-inline-card-sub">
              Orquestração{" "}
              <span className={`wf-settings-inline-token ${aiOrch ? "wf-settings-inline-token--purple" : ""}`}>
                {aiOrch ? "agêntica" : "manual"}
              </span>
            </span>
            <Actions card>
              <CiteBtn text={`[Gatilho: ${currentTrigger?.label ?? "—"}, Orquestração: ${aiOrch ? "agêntica" : "manual"}]`} />
              <button
                ref={trigBtnRef}
                className="stage-task-action-btn"
                title="Alterar gatilho"
                onClick={e => {
                  e.stopPropagation();
                  if (!trigDropOpen && trigBtnRef.current) {
                    const r = trigBtnRef.current.getBoundingClientRect();
                    trigPos.current = { top: r.bottom + 6, left: r.right, width: 240 };
                  }
                  setTrigDropOpen(o => !o);
                }}
              >
                <IconPencil size={14} />
              </button>
            </Actions>
          </div>
          {trigDropOpen && trigPos.current && ReactDOM.createPortal(
            <div
              ref={trigDropRef}
              className="trigger-dropdown"
              style={{ position: "fixed", top: trigPos.current.top, left: trigPos.current.left - trigPos.current.width, width: trigPos.current.width, zIndex: 9999 }}
            >
              <div className="trigger-dropdown-section">
                <div className="trigger-dropdown-label">Gatilho</div>
                <div className="trigger-opt-list">
                  {TRIGGER_OPTS.map(opt => (
                    <button
                      key={opt.key}
                      className={`trigger-opt-item${trigger === opt.key ? " selected" : ""}`}
                      style={{ flexDirection: "row", alignItems: "center", gap: "8px", padding: "8px 10px" }}
                      onClick={() => { setTrigger(opt.key); mark(); }}
                    >
                      {opt.label}
                      {trigger === opt.key && <IconCheck size={14} style={{ marginLeft: "auto", flexShrink: 0 }} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="trigger-orch-row">
                <button className={`trigger-orch-btn${aiOrch ? " selected" : ""}`} onClick={() => { setAiOrch(true); mark(); }}>
                  <IconSparkleFill size={11} /> Agêntica
                </button>
                <button className={`trigger-orch-btn${!aiOrch ? " selected" : ""}`} onClick={() => { setAiOrch(false); mark(); }}>
                  <IconHandFill size={11} /> Manual
                </button>
              </div>
            </div>,
            document.body
          )}

          {/* Dependências card */}
          <div className="wf-settings-inline-card">
            <span className="wf-settings-inline-card-label">Dependências</span>
            {deps.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {deps.map((d, i) => (
                  <span key={i} className="wf-settings-dep-chip wf-settings-dep-chip--removable">
                    <span>{d.wfIcon} {d.wfName}</span>
                    <button
                      className="dep-chip-remove"
                      title="Remover"
                      onClick={e => { e.stopPropagation(); setDeps(prev => prev.filter((_, idx) => idx !== i)); mark(); }}
                    >×</button>
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: "var(--fg-3)", fontSize: 14 }}>Nenhuma</span>
            )}
            <Actions card>
              <CiteBtn text={deps.length > 0 ? `[Dependências: ${deps.map(d => d.wfName).join(", ")}]` : `[Dependências: nenhuma]`} />
              <button
                ref={depsBtnRef}
                className="stage-task-action-btn"
                title="Editar dependências"
                onClick={e => {
                  e.stopPropagation();
                  if (!depsDropOpen && depsBtnRef.current) {
                    const r = depsBtnRef.current.getBoundingClientRect();
                    depsPos.current = { top: r.bottom + 6, left: r.right, width: 260 };
                  }
                  setDepsDropOpen(o => !o);
                }}
              >
                <IconPencil size={14} />
              </button>
            </Actions>
          </div>
          {depsDropOpen && depsPos.current && ReactDOM.createPortal(
            <div
              ref={depsDropRef}
              className="trigger-dropdown"
              style={{ position: "fixed", top: depsPos.current.top, left: depsPos.current.left - depsPos.current.width, width: depsPos.current.width, zIndex: 9999 }}
            >
              {deps.length > 0 && (
                <div className="trigger-dropdown-section">
                  <div className="trigger-dropdown-label">Dependências ativas</div>
                  <div className="trigger-opt-list">
                    {deps.map((d, i) => (
                      <div key={i} className="trigger-opt-item" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{d.wfIcon} {d.wfName}</span>
                        <button
                          className="dep-row-remove"
                          title="Remover"
                          onClick={() => { setDeps(prev => prev.filter((_, idx) => idx !== i)); mark(); }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="trigger-dropdown-section" style={deps.length > 0 ? { borderTop: "1px solid var(--border)", paddingTop: 10 } : {}}>
                <div className="trigger-dropdown-label">Adicionar dependência</div>
                <div className="trigger-opt-list">
                  {allWorkflows.filter(w => !deps.find(d => d.wfId === w.id)).length === 0 ? (
                    <span style={{ fontSize: 12, color: "var(--fg-3)", padding: "4px 2px" }}>Todos os workflows já adicionados</span>
                  ) : (
                    allWorkflows.filter(w => !deps.find(d => d.wfId === w.id)).map(w => (
                      <button
                        key={w.id}
                        className="trigger-opt-item"
                        style={{ flexDirection: "row", alignItems: "center" }}
                        onClick={() => {
                          setDeps(prev => [...prev, { wfId: w.id, wfName: w.name, wfIcon: w.icon }]);
                          mark();
                        }}
                      >
                        <span style={{ fontSize: 15 }}>{w.icon}</span> {w.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>,
            document.body
          )}

        </div>

      </div>
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
        addTask: (stageName, taskName, taskType = "auto", owner = "", visibility = "internal") => {
          setStages(prev => prev.map(s =>
            s.name.toLowerCase() === stageName.toLowerCase()
              ? { ...s, tasks: [...s.tasks, { id: "t" + Date.now(), name: taskName, type: taskType, owner, visibility }] }
              : s
          ));
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

      <SectionBlock title="Etapas">
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
      </SectionBlock>
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
        addTask: (stageName, taskName, taskType = "auto", owner = "", visibility = "internal") => {
          setStages(prev => prev.map(s =>
            s.name.toLowerCase() === stageName.toLowerCase()
              ? { ...s, tasks: [...s.tasks, { id: "t" + Date.now(), name: taskName, type: taskType, owner, visibility }] }
              : s
          ));
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

      <SectionBlock title="Etapas">
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
                  <div className="stage-linker" />
                )}
              </React.Fragment>
            );
            return acc;
          }, { n: 1, els: [] }).els}
        </div>
        </div>
      </SectionBlock>
    </>
  );
}

// ── Flat view: stage colors ───────────────────────────────────────────────────
const STAGE_COLORS = ["#2962FF", "#7C5CFF", "#F71963", "#22C55E", "#F59E0B", "#06B6D4", "#EF4444", "#8B5CF6"];

function getStageIcon(stage) {
  if (!stage) return null;
  if (stage.category === "PAYMENT")  return IconCurrencyCircleDollar;
  if (stage.category === "DELIVERY") return IconTruck;
  if (stage.category === "FULFILLMENT") {
    return stage.gate === "deliverable_ready" ? IconNewspaper : IconCube;
  }
  return null;
}

function getStageColor(stage) {
  if (!stage) return "var(--sl-color-neutral-2)";
  if (stage.category === "PAYMENT")  return "var(--sl-color-blue-2)";
  if (stage.category === "DELIVERY") return "var(--sl-color-teal-2)";
  if (stage.category === "FULFILLMENT") {
    return stage.gate === "deliverable_ready"
      ? "var(--sl-color-purple-2)"
      : "var(--sl-color-pink-2)";
  }
  return "var(--sl-color-neutral-2)";
}

function getStageIconColor(stage) {
  if (!stage) return "var(--sl-color-neutral-8)";
  if (stage.category === "PAYMENT")  return "var(--sl-color-blue-8)";
  if (stage.category === "DELIVERY") return "var(--sl-color-teal-8)";
  if (stage.category === "FULFILLMENT") {
    return stage.gate === "deliverable_ready"
      ? "var(--sl-color-purple-8)"
      : "var(--sl-color-pink-8)";
  }
  return "var(--sl-color-neutral-8)";
}

// ── Stage header-only card (used in flat view — no task list inside) ──────────
function StageHeaderCard({ stage, si, stageColor, onChanged, stageDragging, stageDragOver, onStageDragStart, onStageDragOver, onStageDrop, onStageDragEnd }) {
  const chatAddingTask  = React.useContext(ChatAddingTaskContext);
  const chatStartAddTask = React.useContext(ChatStartAddTaskContext);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [stageName,    setStageName]    = useState(stage.name ?? "");
  const [responsible,  setResponsible]  = useState("");
  const [stageCategory, setStageCategory] = useState("");
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [checkpoints]  = useState([{ id: "cp1", label: "Validação inicial", failAction: "Escalar para operador" }]);
  const [connectors, setConnectors] = useState(() => {
    const seen = new Set();
    return stage.tasks
      .map(t => t.owner).filter(Boolean)
      .filter(o => { const ok = !seen.has(o); seen.add(o); return ok; })
      .map((o, i) => ({ id: `conn-${i}`, label: o, enabled: true }));
  });
  const [mcpEnabled,    setMcpEnabled]    = useState(false);
  const [mcpServer,     setMcpServer]     = useState("");
  const [apiEnabled,    setApiEnabled]    = useState(false);
  const [apiUrl,        setApiUrl]        = useState("");
  const [scriptEnabled, setScriptEnabled] = useState(false);
  const [scriptBody,    setScriptBody]    = useState("");

  return (
    <div
      className={`stage-flat-card${stageDragging ? " is-dragging" : ""}${stageDragOver ? " drag-over" : ""}${isConfigOpen ? " stage-flat-card--open" : ""}`}
      draggable={!isConfigOpen}
      onDragStart={!isConfigOpen ? onStageDragStart : undefined}
      onDragOver={onStageDragOver}
      onDrop={onStageDrop}
      onDragEnd={onStageDragEnd}
    >
      <button
        className="stage-flat-card-head"
        onClick={() => setIsConfigOpen(o => !o)}
        title={isConfigOpen ? "Recolher configurações" : "Editar etapa"}
      >
        {(() => { const StageIcon = getStageIcon(stage); return (
          <div className="stage-flat-card-indicator" style={{ background: getStageColor(stage), color: getStageIconColor(stage) }}>
            {StageIcon && <StageIcon size={20} />}
          </div>
        ); })()}
        <span className="stage-flat-card-name">{stageName}</span>
        <span className={`stage-flat-card-chevron${isConfigOpen ? " open" : ""}`}>
          <IconCaretDown size={14} />
        </span>
      </button>

      {isConfigOpen && (
        <div className="stage-task-config">

          {/* ── Identificação ── */}
          <section className="wf-settings-card">
            <div className="wf-settings-title-row">
              <h3 className="wf-settings-title">Identificação</h3>
              <Actions card><CiteBtn text={`[Etapa: ${stageName}]`} /></Actions>
            </div>
            <div className="field-rows">
              <div className="field-row">
                <span className="field-label">Nome da etapa</span>
                <input
                  className="stage-prop-input"
                  value={stageName}
                  onChange={e => { setStageName(e.target.value); onChanged?.(); }}
                  onClick={e => e.stopPropagation()}
                />
                <Actions><CiteBtn text={`[Nome: ${stageName}]`} /></Actions>
              </div>
              <div className="field-row">
                <span className="field-label">Categoria</span>
                <input
                  className="stage-prop-input"
                  value={stageCategory}
                  placeholder="Ex: Pagamento, Fulfillment"
                  onChange={e => { setStageCategory(e.target.value); onChanged?.(); }}
                  onClick={e => e.stopPropagation()}
                />
                <Actions><CiteBtn text={`[Categoria: ${stageCategory || "—"}]`} /></Actions>
              </div>
              <div className="field-row">
                <span className="field-label">Agente AI</span>
                <button className={`aiw-toggle ${agentEnabled ? "on" : ""}`}
                  onClick={() => { setAgentEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions><CiteBtn text={`[Agente AI: ${agentEnabled ? "ativo" : "inativo"}]`} /></Actions>
              </div>
            </div>
          </section>

          {/* ── Checkpoints ── */}
          <section className="wf-settings-card">
            <div className="wf-settings-title-row">
              <h3 className="wf-settings-title">Checkpoints</h3>
              <Actions card><CiteBtn text={`[Checkpoints: ${checkpoints.map(cp => cp.label).join(", ")}]`} /></Actions>
            </div>
            <div className="field-rows">
              {checkpoints.map(cp =>
                <div key={cp.id} className="field-row">
                  <span className="field-label">{cp.label}</span>
                  <span className="field-value-pill disabled">{cp.failAction}</span>
                  <Actions><CiteBtn text={`[Checkpoint: ${cp.label}]`} /></Actions>
                </div>
              )}
            </div>
          </section>

          <section className="wf-settings-card">
            <div className="wf-settings-title-row">
              <h3 className="wf-settings-title">Conectores</h3>
              <Actions card><CiteBtn text={`[Conectores: ${connectors.filter(c => c.enabled).map(c => c.label).join(", ") || "nenhum"}]`} /></Actions>
            </div>
            <div className="field-rows">
              {connectors.length === 0 && <span className="stage-connectors-empty">Nenhum conector configurado</span>}
              {connectors.map(conn => (
                <div key={conn.id} className="field-row">
                  <span className="field-label">{conn.label}</span>
                  <button className={`aiw-toggle ${conn.enabled ? "on" : ""}`}
                    onClick={() => { setConnectors(prev => prev.map(c => c.id === conn.id ? { ...c, enabled: !c.enabled } : c)); onChanged?.(); }}>
                    <span className="aiw-toggle-knob" />
                  </button>
                  <Actions><CiteBtn text={`[Conector ${conn.label}: ${conn.enabled ? "ativo" : "inativo"}]`} /></Actions>
                </div>
              ))}
            </div>
          </section>

          <section className="wf-settings-card">
            <h3 className="wf-settings-title">Integrações</h3>
            <div className="field-rows">
              <div className="field-row">
                <span className="field-label">Servidor MCP</span>
                <button className={`aiw-toggle ${mcpEnabled ? "on" : ""}`} onClick={() => { setMcpEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions><CiteBtn text={`[Servidor MCP: ${mcpEnabled ? "ativado" : "desativado"}]`} /></Actions>
              </div>
              {mcpEnabled && <InlineField label="Endereço MCP" value={mcpServer} onChange={v => { setMcpServer(v); onChanged?.(); }} placeholder="Nome do servidor MCP" />}
              <div className="field-row">
                <span className="field-label">API Externa</span>
                <button className={`aiw-toggle ${apiEnabled ? "on" : ""}`} onClick={() => { setApiEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions><CiteBtn text={`[API Externa: ${apiEnabled ? "ativada" : "desativada"}]`} /></Actions>
              </div>
              {apiEnabled && <InlineField label="URL da API" value={apiUrl} onChange={v => { setApiUrl(v); onChanged?.(); }} placeholder="https://..." />}
              <div className="field-row">
                <span className="field-label">Script customizado</span>
                <button className={`aiw-toggle ${scriptEnabled ? "on" : ""}`} onClick={() => { setScriptEnabled(v => !v); onChanged?.(); }}>
                  <span className="aiw-toggle-knob" />
                </button>
                <Actions><CiteBtn text={`[Script customizado: ${scriptEnabled ? "ativado" : "desativado"}]`} /></Actions>
              </div>
              {scriptEnabled && (
                <div className="field-row field-row--textarea">
                  <span className="field-label">Script</span>
                  <textarea className="stage-prop-input" value={scriptBody} rows={4}
                    onChange={e => { setScriptBody(e.target.value); onChanged?.(); }}
                    placeholder={"// Lógica customizada em JavaScript\nreturn { status: 'completed' };"}
                    style={{ fontFamily: "monospace", fontSize: 12, resize: "vertical" }} />
                  <Actions><CiteBtn text={`[Script: ${scriptBody ? "definido" : "vazio"}]`} /></Actions>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

// ── Flat detail view: stages as cards on top, all tasks in one list below ─────
function WorkflowDetailViewFlat({ workflow, onOpenTask, onOpenStage, onOpenSettings, detailActionsRef, onDirtyChange }) {
  const notifyTaskRemoved  = React.useContext(ChatTaskRemovedContext);
  const chatAddingTask     = React.useContext(ChatAddingTaskContext);
  const chatStartAddTask   = React.useContext(ChatStartAddTaskContext);
  const chatStartAddStage  = React.useContext(ChatStartAddStageContext);

  const [stages, setStages] = useState(() => workflow.stages);

  // Flat task list: each entry knows its source stage index
  const [flatTasks, setFlatTasks] = useState(() =>
    workflow.stages.flatMap((stage, si) =>
      stage.tasks.map(task => ({ task, stageIdx: si }))
    )
  );

  const markDirty = () => onDirtyChange?.(true);
  const clearDirty = () => onDirtyChange?.(false);

  // ── Stage drag-and-drop ────────────────────────────────────────────────────
  const [stageDraggingIdx, setStageDraggingIdx] = useState(null);
  const [stageDragOverIdx, setStageDragOverIdx] = useState(null);

  const handleStageDragStart = (e, idx) => {
    setStageDraggingIdx(idx);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const handleStageDragOver = (e, idx) => { e.preventDefault(); if (idx !== stageDraggingIdx) setStageDragOverIdx(idx); };
  const handleStageDrop = (e, toIdx) => {
    e.preventDefault(); e.stopPropagation();
    if (stageDraggingIdx === null || stageDraggingIdx === toIdx) { setStageDraggingIdx(null); setStageDragOverIdx(null); return; }
    const next = [...stages];
    const [moved] = next.splice(stageDraggingIdx, 1);
    next.splice(toIdx, 0, moved);
    // Remap stageIdx in flatTasks to match reordered stages array
    const idxMap = {};
    stages.forEach((s, i) => { idxMap[i] = next.indexOf(s); });
    setFlatTasks(prev => prev.map(ft => ({ ...ft, stageIdx: idxMap[ft.stageIdx] ?? ft.stageIdx })));
    setStages(next);
    setStageDraggingIdx(null); setStageDragOverIdx(null);
    markDirty();
  };
  const handleStageDragEnd = () => { setStageDraggingIdx(null); setStageDragOverIdx(null); };

  // ── Task drag-and-drop (global, cross-stage) ───────────────────────────────
  const [taskDragging, setTaskDragging] = useState(null);
  const [taskDragOver, setTaskDragOver] = useState(null);

  const handleTaskDragStart = (e, idx) => { e.stopPropagation(); setTaskDragging(idx); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(idx)); };
  const handleTaskDragOver  = (e, idx) => { e.preventDefault(); e.stopPropagation(); if (idx !== taskDragging) setTaskDragOver(idx); };
  const handleTaskDrop = (e, toIdx) => {
    e.preventDefault(); e.stopPropagation();
    if (taskDragging === null || taskDragging === toIdx) { setTaskDragging(null); setTaskDragOver(null); return; }
    const next = [...flatTasks];
    const [moved] = next.splice(taskDragging, 1);
    next.splice(toIdx, 0, moved);
    setFlatTasks(next);
    setTaskDragging(null); setTaskDragOver(null);
    markDirty();
  };
  const handleTaskDragEnd = () => { setTaskDragging(null); setTaskDragOver(null); };

  // ── Task open/close + new-task animation ──────────────────────────────────
  const [openTaskId, setOpenTaskId] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  const flatViewRef = useRef(null);

  // Sync tasks injected by chat "Aplicar" (detailActionsRef.addTask mutates parent stages)
  const prevStagesRef = useRef(stages);
  useEffect(() => {
    const prev = prevStagesRef.current;
    prevStagesRef.current = stages;
    const prevIds = new Set(prev.flatMap(s => s.tasks.map(t => t.id)));
    stages.forEach((stage, si) => {
      stage.tasks.forEach(task => {
        if (prevIds.has(task.id)) return;
        setFlatTasks(ft => ft.some(x => x.task.id === task.id) ? ft : [...ft, { task, stageIdx: si }]);
        setOpenTaskId(task.id);
        setNewlyAddedId(task.id);
        setTimeout(() => setNewlyAddedId(null), 1400);
        setTimeout(() => {
          const el = flatViewRef.current?.querySelector(`[data-task-id="${task.id}"]`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
      });
    });
  }, [stages]);

  // ── detailActionsRef API (used by chat engine) ─────────────────────────────
  const stagesRef = useRef(stages);
  useEffect(() => { stagesRef.current = stages; }, [stages]);

  useEffect(() => {
    if (!detailActionsRef) return;
    detailActionsRef.current = {
      addStage: (stageName) => {
        setStages(prev => [...prev, { name: stageName, tasks: [] }]);
        markDirty();
      },
      addTask: (stageName, taskName, taskType = "auto", owner = "", visibility = "internal") => {
        const si = stagesRef.current.findIndex(s => s.name.toLowerCase() === stageName.toLowerCase());
        const targetIdx = si >= 0 ? si : 0;
        const newTask = { id: "t" + Date.now(), name: taskName, type: taskType, owner, visibility };
        setStages(prev => prev.map((s, i) => i === targetIdx ? { ...s, tasks: [...s.tasks, newTask] } : s));
        markDirty();
      },
      save: clearDirty,
      getStageCount: () => stagesRef.current.length,
      getStageNames:  () => stagesRef.current.map(s => s.name),
    };
    return () => { detailActionsRef.current = null; };
  }, []);

  const moveStage = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= stages.length) return;
    const idxMap = {};
    stages.forEach((_, i) => {
      if (i === idx) idxMap[i] = target;
      else if (i === target) idxMap[i] = idx;
      else idxMap[i] = i;
    });
    const next = [...stages];
    [next[idx], next[target]] = [next[target], next[idx]];
    setFlatTasks(prev => prev.map(ft => ({ ...ft, stageIdx: idxMap[ft.stageIdx] ?? ft.stageIdx })));
    setStages(next);
    markDirty();
  };

  return (
    <>
      <SectionBlock>
        <div className="wf-detail-head">
          <h1 className="detail-title">{workflow.name}</h1>
        </div>
        {(workflow.version || workflow.wfStatus) && <WfMetaSection workflow={workflow} onOpenSettings={onOpenSettings} />}
      </SectionBlock>

      <WfSettingsInline workflow={workflow} onDirtyChange={onDirtyChange} />

      {/* ── Stages ── */}
      <SectionBlock
        title="Etapas"
        actions={
          <button
            data-sl-button
            data-variant="secondary"
            onClick={() => chatStartAddStage?.()}
            title="Adicionar etapa"
            aria-label="Adicionar etapa"
          >
            <Icon name="plus" size={16} />
          </button>
        }
      >
        <div className="wf-flat-stages">
          {stages.map((stage, si) => (
            <React.Fragment key={stage.id ?? si}>
              <StageHeaderCard
                stage={stage}
                si={si}
                stageColor={STAGE_COLORS[si % STAGE_COLORS.length]}
                onChanged={markDirty}
                stageDragging={stageDraggingIdx === si}
                stageDragOver={stageDragOverIdx === si}
                onStageDragStart={e => handleStageDragStart(e, si)}
                onStageDragOver={e => handleStageDragOver(e, si)}
                onStageDrop={e => handleStageDrop(e, si)}
                onStageDragEnd={handleStageDragEnd}
              />
            </React.Fragment>
          ))}
        </div>
      </SectionBlock>

      {/* ── Tasks ── */}
      <SectionBlock
        title="Tarefas"
        actions={
          <button
            data-sl-button
            data-variant="secondary"
            disabled={chatAddingTask}
            onClick={() => chatStartAddTask?.(stages[0]?.name)}
            title="Adicionar tarefa"
            aria-label="Adicionar tarefa"
          >
            <Icon name="plus" size={16} />
          </button>
        }
      >
        <div className="wf-flat-tasks" ref={flatViewRef}>
          {flatTasks.map(({ task, stageIdx }, idx) => {
            const stage = stages[stageIdx] || stages[0];
            const color = STAGE_COLORS[stageIdx % STAGE_COLORS.length];
            return (
              <div key={task.id} className="wf-flat-task-wrap">
                <div className="wf-flat-task-body">
                  <StageTaskRow
                    task={task}
                    workflow={workflow}
                    idx={idx}
                    isNew={newlyAddedId === task.id}
                    dragging={taskDragging}
                    dragOver={taskDragOver}
                    onDragStart={e => handleTaskDragStart(e, idx)}
                    onDragOver={e => handleTaskDragOver(e, idx)}
                    onDrop={e => handleTaskDrop(e, idx)}
                    onDragEnd={handleTaskDragEnd}
                    onChanged={markDirty}
                    onRemove={() => {
                      const removed = { task, stageIdx };
                      setFlatTasks(prev => prev.filter((_, i) => i !== idx));
                      markDirty();
                      notifyTaskRemoved?.(task.name, stage?.name || "", () =>
                        setFlatTasks(prev => {
                          const next = [...prev];
                          next.splice(idx, 0, removed);
                          return next;
                        })
                      );
                    }}
                    isOpen={openTaskId === task.id}
                    onToggle={() => setOpenTaskId(prev => prev === task.id ? null : task.id)}
                    onStageChange={newStageId => {
                      const newSi = stages.findIndex(s => s.id === newStageId);
                      if (newSi === -1) return;
                      setFlatTasks(prev => prev.map((ft, i) => i === idx ? { ...ft, stageIdx: newSi } : ft));
                      markDirty();
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionBlock>
    </>
  );
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
function WorkflowDetailView({ wfDetailView = "2-passos", ...props }) {
  if (wfDetailView === "1-passo") return <WorkflowDetailView1Passo {...props} />;
  if (wfDetailView === "flat")    return <WorkflowDetailViewFlat {...props} />;
  return <WorkflowDetailView2Passos {...props} />;
}

/* ---------- New Workflow Wizard ---------- */

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
  const libraryWfs  = AIWData.libraryWfs.filter(w => !existingIds.has(w.id));
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
            {AIWData.stageSuggestions.map(s => <option key={s} value={s} />)}
          </datalist>
          <datalist id="wiz-task-names">
            {AIWData.taskSuggestions.map(s => <option key={s} value={s} />)}
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
  const agentSay     = React.useContext(AgentSayContext);
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
        <IconCaretLeftSmall size={14} /> Voltar para Gerenciador de Experiências
      </button>
    );
  } else if (isList) {
    headerLeft = (
      <>
        <span className="id-chip">WFB</span>
        <span className="canvas-name">Gerenciador de Experiências</span>
      </>
    );
  } else if (isDetail) {
    headerLeft = (
      <button className="od-back-link" data-sl-button data-variant="tertiary" data-has-label onClick={back}>
        <IconCaretLeftSmall size={14} /> Voltar para Gerenciador de Experiências
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
              const wfName = workflow?.name ?? "workflow";
              agentSay?.({
                from: "agent",
                text: `✅ **${wfName}** publicado com sucesso! As alterações já estão ativas para novos pedidos.`,
                quickReplies: ["Ver histórico de versões", "+ Adicionar tarefa", "O que posso fazer?"],
              });
            }}>
              Publicar
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

/*
  chatFor — contexto inicial de cada modo.
  Regra de design: chips = atalhos persistentes da chip-row (sempre visíveis).
                   messages = apenas texto descritivo; quickReplies SOMENTE em
                   respostas do agente durante uma conversa, nunca nas mensagens
                   iniciais (evita duplicação com a chip-row).
*/
function chatFor(mode) {
  if (mode.kind === "list") {
    return {
      title: "Gerenciador de Experiências",
      placeholder: "Criar workflow, editar, publicar...",
      chips: [
        { icon: "plus",    label: "Nova experiência"             },
        { icon: "edit",    label: "Editar experiência existente" },
        { icon: "layers",  label: "Editar experiências em massa" },
      ],
      messages: [
        { from: "agent", text: "Olá! Sou o **Order Management Assistant**.\n\nPosso ajudar a criar, editar e publicar experiências no Gerenciador de Experiências." },
        { from: "agent", text: `Há ${AIWData.workflows.length} experiências configuradas. Use os atalhos abaixo ou escreva o que precisa.` },
      ]
    };
  }
  const wf = AIWData.workflows.find((w) => w.id === mode.workflowId);
  if (mode.kind === "detail") {
    const totalTasks = wf.stages.reduce((s, st) => s + st.tasks.length, 0);
    const statusLabel = wf.status === "published" ? "Publicado" : wf.status === "archived" ? "Arquivado" : "Rascunho";
    return {
      title: wf.name,
      placeholder: `Editar ${wf.name}...`,
      chips: [
        { icon: "plus",    label: "Adicionar tarefa"  },
        { icon: "sparkle", label: "Publicar workflow" },
      ],
      messages: [
        { from: "agent", text: `**${wf.name}** — ${wf.stages.length} etapas · ${totalTasks} tarefas · ${wf.orders} pedidos ativos · ${statusLabel}.` },
        { from: "agent", text: "Use os atalhos abaixo ou descreva o que quer fazer." },
      ]
    };
  }
  if (mode.kind === "task") {
    let task; let taskStage;
    wf.stages.forEach((s) => { const t = s.tasks.find((x) => x.id === mode.taskId); if (t) { task = t; taskStage = s; } });
    return {
      title: task?.name || "Tarefa",
      placeholder: `Configurar ${task?.name}...`,
      chips: [
        { icon: "edit",    label: "Alterar execução"    },
        { icon: "edit",    label: "Alterar visibilidade" },
        { icon: "edit",    label: "Alterar responsável"  },
        { icon: "x",       label: "Remover tarefa"       },
      ],
      messages: [
        { from: "agent", text: `Editando **"${task?.name}"** em **${taskStage?.name || wf.name}**.\n\nUse os atalhos abaixo para alterar campos ou remover a tarefa.` },
      ]
    };
  }
  if (mode.kind === "stage") {
    const stage = wf.stages.find((s, i) => (s.id ?? String(i)) === mode.stageId);
    return {
      title: stage?.name || "Etapa",
      placeholder: `Configurar ${stage?.name}...`,
      chips: [
        { icon: "edit",    label: "Renomear etapa"            },
        { icon: "edit",    label: "Editar gate de conclusão"  },
        { icon: "plus",    label: "+ Adicionar tarefa"        },
        { icon: "x",       label: "Remover etapa"             },
      ],
      messages: [
        { from: "agent", text: `Configurando a etapa **"${stage?.name}"** em **${wf.name}**.\n\nUse os atalhos abaixo ou descreva o que quer alterar.` },
      ]
    };
  }
  if (mode.kind === "settings") {
    const sectionChipsMap = {
      geral:         ["Renomear", "Mudar trigger", "Mudar categoria"],
      "ai-agent":    ["Ativar agente", "Desativar agente", "Configurar comportamento"],
      dependencies:  ["Adicionar dependência", "Remover dependência"],
      history:       ["Ver versão anterior", "Restaurar versão"],
    };
    const sectionLabels = {
      geral: "configurações gerais", "ai-agent": "Agente AI", dependencies: "Dependências", history: "Histórico de versões",
    };
    const sectionLabel = sectionLabels[mode.section] || "configurações";
    return {
      title: `${wf.name} · Configurações`,
      placeholder: `Alterar configurações de ${wf.name}...`,
      chips: (sectionChipsMap[mode.section] || sectionChipsMap.geral).map(label => ({ icon: "edit", label })),
      messages: [
        { from: "agent", text: `Você está nas **${sectionLabel}** de **${wf.name}**.\n\nUse os atalhos abaixo ou descreva a alteração.` },
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

  // True while the agent is collecting a new task through chat
  const [chatAddingTask, setChatAddingTask] = useState(false);
  const chatAddingTaskRef = useRef(false);
  const setChatAddingTaskSync = useCallback((v) => {
    chatAddingTaskRef.current = v;
    setChatAddingTask(v);
  }, []);

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

  // Conversational task-creation draft (detail mode)
  const taskDraftRef = useRef(null);

  // Fluxo A2 — "Editar experiência existente" draft
  const editExistingDraftRef = useRef(null);

  // Fluxo G — "Editar experiências em massa" draft
  const bulkDraftRef = useRef(null);

  // Pending undo for task removal
  const pendingUndoRef = useRef(null);

  // Override messages for the next navigation (e.g. post-create success message)
  const pendingChatMsgsRef = useRef(null);

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
    const pending = pendingChatMsgsRef.current;
    pendingChatMsgsRef.current = null;
    setChatMsgs(pending || ctx.messages || []);
    setIsTyping(false);
    setChatAddingTaskSync(false);
    if (mode.kind !== "list") {
      setWfDraft(null);
      editExistingDraftRef.current = null;
      bulkDraftRef.current = null;
    }
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

  // ── Task-removed notification (called by canvas, no user message) ───────────
  const notifyTaskRemovedFn = useCallback((taskName, stageName, undoFn) => {
    pendingUndoRef.current = undoFn;
    agentSay({
      from: "agent",
      text: `🗑️ Tarefa **${taskName}** removida da etapa **${stageName}**.`,
      quickReplies: ["↩ Desfazer"],
    }, 300);
  }, []);

  // ── Main message handler ───────────────────────────────────────────────────
  function handleSend(text) {
    setChatMsgs(m => [...m, { from: "user", text }]);
    const lower = text.toLowerCase();

    // ── Undo task removal ──
    if (lower.includes("desfazer") && pendingUndoRef.current) {
      const undo = pendingUndoRef.current;
      pendingUndoRef.current = null;
      undo();
      agentSay({ from: "agent", text: "↩ Tarefa restaurada com sucesso." });
      return;
    }
    if (lower === "ok" && pendingUndoRef.current) {
      pendingUndoRef.current = null;
    }

    if (mode.kind === "list") {
      if (wfDraftRef.current) {
        handleDraftStep(text, lower);
      } else if (bulkDraftRef.current) {
        handleBulkEditStep(text, lower);
      } else if (editExistingDraftRef.current) {
        handleEditExistingStep(text, lower);
      } else if (/nova experiência|criar|novo workflow|new workflow|começar workflow|\+ novo/.test(lower)) {
        startWfDraft();
      } else if (/editar experiência existente|editar workflow existente|editar experiência/.test(lower)) {
        startEditExisting();
      } else if (/em massa|editar experiências em massa/.test(lower)) {
        startBulkEdit();
      } else if (/listar|mostrar|quais/.test(lower)) {
        const names = AIWData.workflows.map(w => `${w.icon} ${w.name}`).join(", ");
        agentSay({ from: "agent", text: `Experiências configuradas: ${names}. Clique em qualquer uma no canvas para ver detalhes.` });
      } else if (/o que posso fazer|o que você faz|posso fazer|ajuda/.test(lower)) {
        agentSay({
          from: "agent",
          text: "Posso te ajudar a:\n• Criar experiências do zero ou copiando uma existente\n• Adicionar, editar ou remover etapas e tarefas\n• Configurar execução, visibilidade e responsável de cada tarefa\n• Publicar, atualizar ou arquivar experiências\n• Editar múltiplas experiências em massa",
          quickReplies: ["Nova experiência", "Editar experiência existente"],
        });
      } else {
        agentSay({
          from: "agent",
          text: "Não entendi. O que você quer fazer?",
          quickReplies: ["Nova experiência", "Editar experiência existente", "Editar experiências em massa", "O que posso fazer?"],
        });
      }
    } else if (mode.kind === "settings") {
      handleSettingsMessage(text, lower);
    } else if (mode.kind === "detail") {
      handleDetailMessage(text, lower);
    } else if (mode.kind === "task") {
      handleTaskMessage(text, lower);
    }
  }

  // ── Fluxo A — Nova experiência ─────────────────────────────────────────────

  function startWfDraft() {
    const draft = { step: "name", name: "", base: "blank", products: null, parsedStages: null, sourceStages: null, sourceName: null };
    setWfDraft(draft);
    agentSay({
      from: "agent",
      text: "Qual é o nome da nova experiência?",
    });
  }

  function handleDraftStep(originalText, lower) {
    const draft = wfDraftRef.current;
    if (!draft) return;

    // Global escape for Fluxo A
    if (/^(cancelar|sair|parar|desistir)/.test(lower)) {
      setWfDraft(null);
      agentSay({ from: "agent", text: "Tudo bem. Quando quiser criar uma nova experiência, é só falar.", quickReplies: ["Nova experiência"] });
      return;
    }

    if (draft.step === "name") {
      const name = originalText.trim();
      setWfDraft(d => ({ ...d, step: "base", name }));
      agentSay({
        from: "agent",
        text: `**"${name}"** — ótimo nome! Quer criar do zero ou usar uma experiência existente como base?`,
        quickReplies: ["Do zero", "Copiar existente"],
      });

    } else if (draft.step === "base") {
      const isCopy = /copiar|existente|base|cópia/.test(lower);
      if (isCopy) {
        const sources = AIWData.workflows.map(w => w.name);
        setWfDraft(d => ({ ...d, step: "pick-source" }));
        agentSay({
          from: "agent",
          text: "Qual experiência você quer usar como base?",
          quickReplies: sources,
        });
      } else {
        setWfDraft(d => ({ ...d, step: "products", base: "blank" }));
        agentSay({
          from: "agent",
          text: "Quais produtos ou categorias este workflow atende?",
          quickReplies: ["Todos os produtos", "Por categoria", "Digitar"],
        });
      }

    } else if (draft.step === "pick-source") {
      const found = AIWData.workflows.find(w => lower.includes(w.name.toLowerCase()));
      if (found) {
        setWfDraft(d => ({ ...d, step: "products", base: "copy", sourceName: found.name, sourceStages: found.stages }));
        agentSay({
          from: "agent",
          text: `**"${found.name}"** selecionada como base — etapas e tarefas serão copiadas.\n\nQuais produtos ou categorias este workflow atende?`,
          quickReplies: ["Todos os produtos", "Por categoria", "Digitar"],
        });
      } else {
        agentSay({
          from: "agent",
          text: "Não encontrei essa experiência. Qual delas você quer usar como base?",
          quickReplies: AIWData.workflows.map(w => w.name),
        });
      }

    } else if (draft.step === "products") {
      if (/^por categoria$/.test(lower)) {
        setWfDraft(d => ({ ...d, step: "products-detail" }));
        agentSay({ from: "agent", text: "Quais categorias? Pode listar separadas por vírgula." });
        return;
      }
      if (/^digitar$/.test(lower)) {
        setWfDraft(d => ({ ...d, step: "products-detail" }));
        agentSay({ from: "agent", text: "Descreva os produtos ou categorias que este workflow atende." });
        return;
      }
      const products = /todos/.test(lower) ? "Todos os produtos" : originalText.trim();
      setWfDraft(d => ({ ...d, step: "stages-input", products }));
      agentSay({
        from: "agent",
        text: "Descreva as etapas e as tarefas de cada uma.\nPode escrever como lista, por exemplo:\n· Pagamento: Autorização, Captura\n· Fulfillment: Picking, Packing\n· Entrega: Expedição, Last Mile",
      });

    } else if (draft.step === "products-detail") {
      const products = originalText.trim();
      setWfDraft(d => ({ ...d, step: "stages-input", products }));
      agentSay({
        from: "agent",
        text: "Descreva as etapas e as tarefas de cada uma.\nPode escrever como lista, por exemplo:\n· Pagamento: Autorização, Captura\n· Fulfillment: Picking, Packing\n· Entrega: Expedição, Last Mile",
      });

    } else if (draft.step === "stages-input") {
      const lines = originalText.split(/\n/).map(l => l.replace(/^[·•\-]\s*/, "").trim()).filter(Boolean);
      const parsed = [];
      lines.forEach(line => {
        const match = line.match(/^(.+?):\s*(.+)$/);
        if (match) {
          const stageName = match[1].trim();
          const tasks = match[2].split(/,|;/).map(t => t.trim()).filter(Boolean);
          parsed.push({ name: stageName, tasks });
        }
      });

      if (parsed.length === 0) {
        agentSay({ from: "agent", text: "Não consegui identificar a estrutura. Tente no formato:\n`Etapa: Tarefa1, Tarefa2`\n\nCada etapa em uma linha separada." });
        return;
      }

      setWfDraft(d => ({ ...d, step: "stages-confirm", parsedStages: parsed }));

      const totalTasks = parsed.reduce((s, st) => s + st.tasks.length, 0);
      const previewLines = parsed.map(st =>
        `**${st.name}**\n${st.tasks.map(t => `  · ${t}`).join("\n")}`
      ).join("\n");

      agentSay({
        from: "agent",
        text: `Entendi a seguinte estrutura — ${parsed.length} etapa${parsed.length > 1 ? "s" : ""}, ${totalTasks} tarefa${totalTasks > 1 ? "s" : ""}:\n\n${previewLines}`,
        quickReplies: ["Confirmar estrutura", "Corrigir"],
      });

    } else if (draft.step === "stages-confirm") {
      if (/corrigir|alterar|mudar|não|nao|errado/.test(lower)) {
        setWfDraft(d => ({ ...d, step: "stages-input" }));
        agentSay({ from: "agent", text: "Tudo bem! Descreva a estrutura novamente." });
        return;
      }
      const currentDraft = { ...draft };
      const totalTasks = currentDraft.parsedStages.reduce((s, st) => s + st.tasks.length, 0);
      const baseLabel = currentDraft.base === "copy" ? `Cópia de "${currentDraft.sourceName}"` : "Do zero";
      setWfDraft(d => ({ ...d, step: "done" }));

      agentSay({
        from: "agent",
        type: "action",
        title: "Nova experiência",
        heading: currentDraft.name,
        fields: [
          { label: "Base",     value: baseLabel },
          { label: "Produtos", value: currentDraft.products || "Todos os produtos" },
          { label: "Etapas",   value: String(currentDraft.parsedStages.length), tag: true },
          { label: "Tarefas",  value: String(totalTasks), tag: true },
        ],
        applyLabel: "Criar experiência",
        onApply: () => {
          const stages = currentDraft.base === "copy" && currentDraft.sourceStages
            ? JSON.parse(JSON.stringify(currentDraft.sourceStages))
            : currentDraft.parsedStages.map((st, si) => ({
                id: "s-new-" + Date.now() + "-" + si,
                name: st.name,
                tasks: st.tasks.map((t, ti) => ({
                  id: "t-new-" + Date.now() + "-" + si + "-" + ti,
                  name: t,
                  type: "manual",
                  visibility: "internal",
                  status: "active",
                  owner: null,
                })),
              }));
          const newWf = {
            id: "wf-" + Date.now(),
            name: currentDraft.name,
            status: "draft",
            stages,
            orders: 0,
            category: "fulfillment",
            icon: "📦",
          };
          AIWData.workflows.push(newWf);
          setWfDraft(null);
          pendingChatMsgsRef.current = [{
            from: "agent",
            text: `✓ Experiência **"${currentDraft.name}"** criada com ${stages.length} etapa${stages.length > 1 ? "s" : ""}. Revise os detalhes no canvas.`,
            quickReplies: ["+ Adicionar tarefa", "Publicar"],
          }];
          setMode({ kind: "detail", workflowId: newWf.id });
        },
        onDismiss: () => {
          setWfDraft(null);
          agentSay({ from: "agent", text: "Criação cancelada.", quickReplies: ["Nova experiência"] });
        },
      });
    }
  }

  // ── Fluxo A2 — Editar experiência existente ────────────────────────────────

  function startEditExisting() {
    editExistingDraftRef.current = { step: "pick" };
    agentSay({
      from: "agent",
      text: "Qual experiência você quer editar?",
      quickReplies: AIWData.workflows.map(w => w.name),
    });
  }

  function handleEditExistingStep(text, lower) {
    const draft = editExistingDraftRef.current;
    if (!draft) return;

    if (/^(cancelar|sair|parar|desistir)/.test(lower)) {
      editExistingDraftRef.current = null;
      agentSay({ from: "agent", text: "Tudo bem.", quickReplies: ["Nova experiência", "Editar experiência existente"] });
      return;
    }

    if (draft.step === "pick") {
      const found = AIWData.workflows.find(w => lower.includes(w.name.toLowerCase()));
      if (found) {
        editExistingDraftRef.current = null;
        const totalTasks = found.stages.reduce((s, st) => s + st.tasks.length, 0);
        const statusLabel = found.status === "published" ? "Publicado" : found.status === "archived" ? "Arquivado" : "Rascunho";
        pendingChatMsgsRef.current = [{
          from: "agent",
          text: `**${found.name}** — ${found.stages.length} etapa${found.stages.length > 1 ? "s" : ""} · ${totalTasks} tarefa${totalTasks > 1 ? "s" : ""} · ${statusLabel}.\n\nO que você quer alterar?`,
          quickReplies: ["+ Adicionar tarefa", "Publicar", "Configurações", "Arquivar"],
        }];
        setMode({ kind: "detail", workflowId: found.id });
      } else {
        agentSay({
          from: "agent",
          text: "Não encontrei essa experiência. Qual delas você quer editar?",
          quickReplies: AIWData.workflows.map(w => w.name),
        });
      }
    }
  }

  // ── Fluxo G — Editar experiências em massa ─────────────────────────────────

  function startBulkEdit() {
    const activeWfs = AIWData.workflows.filter(w => w.status !== "archived");
    bulkDraftRef.current = { step: "select", selectedNames: [], remainingNames: activeWfs.map(w => w.name) };
    agentSay({
      from: "agent",
      text: "Quais experiências você quer editar? Selecione uma a uma e confirme ao final.",
      quickReplies: [...activeWfs.map(w => w.name), "Pronto →"],
    });
  }

  function handleBulkEditStep(text, lower) {
    const draft = bulkDraftRef.current;
    if (!draft) return;

    if (/^(cancelar|sair|parar|desistir)/.test(lower)) {
      bulkDraftRef.current = null;
      agentSay({ from: "agent", text: "Tudo bem.", quickReplies: ["Editar experiências em massa"] });
      return;
    }

    if (draft.step === "select") {
      if (/^pronto/.test(lower)) {
        if (draft.selectedNames.length === 0) {
          agentSay({ from: "agent", text: "Selecione ao menos uma experiência primeiro.", quickReplies: [...draft.remainingNames, "Pronto →"] });
          return;
        }
        bulkDraftRef.current = { ...draft, step: "action" };
        const listText = draft.selectedNames.join(", ");
        agentSay({
          from: "agent",
          text: `**${draft.selectedNames.length}** experiência${draft.selectedNames.length > 1 ? "s" : ""} selecionada${draft.selectedNames.length > 1 ? "s" : ""}: ${listText}.\n\nO que você quer fazer com elas?`,
          quickReplies: ["Publicar todas", "Arquivar todas", "Ativar Agente AI", "Desativar Agente AI"],
        });
        return;
      }

      const found = AIWData.workflows.find(w => lower.includes(w.name.toLowerCase()));
      if (found && !draft.selectedNames.includes(found.name)) {
        const newSelected = [...draft.selectedNames, found.name];
        const newRemaining = draft.remainingNames.filter(n => n !== found.name);
        bulkDraftRef.current = { ...draft, selectedNames: newSelected, remainingNames: newRemaining };
        const selText = newSelected.join(", ");
        agentSay({
          from: "agent",
          text: `**"${found.name}"** adicionada. ${newSelected.length} selecionada${newSelected.length > 1 ? "s" : ""}: ${selText}.\n\nAdicione mais ou confirme.`,
          quickReplies: newRemaining.length > 0 ? [...newRemaining, "Pronto →"] : ["Pronto →"],
        });
      } else if (found && draft.selectedNames.includes(found.name)) {
        agentSay({ from: "agent", text: `**"${found.name}"** já está na seleção.`, quickReplies: [...draft.remainingNames, "Pronto →"] });
      } else {
        agentSay({ from: "agent", text: "Não encontrei essa experiência.", quickReplies: [...draft.remainingNames, "Pronto →"] });
      }

    } else if (draft.step === "action") {
      let action = null;
      if (/publicar/.test(lower)) action = { label: "Publicar", newStatus: "published" };
      else if (/arquivar/.test(lower)) action = { label: "Arquivar", newStatus: "archived" };
      else if (/ativar.*agente|agente.*ativar/.test(lower)) action = { label: "Ativar Agente AI", newStatus: null, aiOrch: true };
      else if (/desativar.*agente|agente.*desativar/.test(lower)) action = { label: "Desativar Agente AI", newStatus: null, aiOrch: false };

      if (!action) {
        agentSay({ from: "agent", text: "Não entendi a ação. O que quer fazer com as experiências selecionadas?", quickReplies: ["Publicar todas", "Arquivar todas", "Ativar Agente AI", "Desativar Agente AI"] });
        return;
      }

      const currentDraft = { ...draft, action };
      bulkDraftRef.current = { ...draft, step: "confirm", action };

      agentSay({
        from: "agent",
        type: "action",
        title: "Edição em massa",
        fields: [
          { label: "Ação",         value: action.label },
          { label: "Experiências", value: currentDraft.selectedNames.join(", ") },
          { label: "Total",        value: String(currentDraft.selectedNames.length), tag: true },
        ],
        applyLabel: "Confirmar",
        onApply: () => {
          if (action.newStatus) {
            AIWData.workflows.forEach(w => {
              if (currentDraft.selectedNames.includes(w.name)) w.status = action.newStatus;
            });
          }
          bulkDraftRef.current = null;
          const count = currentDraft.selectedNames.length;
          setChatMsgs(m => [
            ...m,
            { from: "agent", text: `✓ **${action.label}** aplicado em **${count}** experiência${count > 1 ? "s" : ""}.`, quickReplies: ["Editar experiências em massa", "Pronto"] },
          ]);
        },
        onDismiss: () => {
          bulkDraftRef.current = null;
          agentSay({ from: "agent", text: "Operação cancelada.", quickReplies: ["Editar experiências em massa"] });
        },
      });

    } else if (draft.step === "confirm") {
      agentSay({ from: "agent", text: "Use os botões do card para confirmar ou cancelar a operação." });
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

    // ── "O que posso fazer?" no settings ────────────────────────────────────
    if (/o que posso fazer|ajuda/.test(lower)) {
      const sectionChipsMap = {
        geral: ["Renomear", "Mudar trigger", "Mudar categoria"],
        "ai-agent": ["Ativar agente", "Desativar agente"],
        dependencies: ["Adicionar dependência", "Remover dependência"],
        history: ["Ver versão anterior"],
      };
      agentSay({
        from: "agent",
        text: "Nas configurações posso alterar nome, trigger, categoria, ativar/desativar o Agente AI e gerenciar dependências.",
        quickReplies: sectionChipsMap[mode.section] || ["Renomear", "Mudar trigger"],
      });
      return;
    }

    // Fallback settings
    agentSay({
      from: "agent",
      text: "Não entendi. O que você quer alterar?",
      quickReplies: ["Renomear", "Mudar trigger", "Ativar agente", "O que posso fazer?"],
    });
  }

  // ── Detail mode message handler ────────────────────────────────────────────

  function handleDetailMessage(text, lower) {
    // ── Continue an in-progress task-creation draft ─────────────────────────
    if (taskDraftRef.current) {
      const draft = taskDraftRef.current;

      // Universal escape — works at any step of the flow
      if (/^(cancelar|sair|parar|desistir)(\s.*)?$/.test(lower.trim())) {
        taskDraftRef.current = null;
        setChatAddingTaskSync(false);
        agentSay({ from: "agent", text: "Tudo bem, fluxo cancelado. O que mais posso fazer?" });
        return;
      }

      if (draft.step === "stage") {
        const stageNames = detailActionsRef.current?.getStageNames() || [];
        const match = stageNames.find(n => lower.includes(n.toLowerCase()));
        if (match) {
          // Spec Fluxo B passo 1: confirma contexto e pede o nome
          taskDraftRef.current = { ...draft, step: "name", stageName: match };
          agentSay({
            from: "agent",
            text: `Adicionando tarefa na etapa **${match}**. Qual é o nome da tarefa?`,
          });
        } else {
          agentSay({
            from: "agent",
            text: `Não encontrei essa etapa. Etapas disponíveis: ${stageNames.map(n => `**${n}**`).join(", ")}. Qual você quer?`,
            quickReplies: [...stageNames, "Cancelar"],
          });
        }
        return;
      }


      if (draft.step === "name") {
        const taskName = text.trim();
        taskDraftRef.current = { ...draft, step: "type", taskName };
        // Spec Fluxo B passo 2: inclui explicação de cada modo
        agentSay({
          from: "agent",
          text: `**"${taskName}"** ✓\n\nComo esta tarefa executa?\n\n**Automática** — o sistema dispara e conclui sem intervenção humana.\n**Manual** — um operador precisa executar e marcar como concluída.`,
          quickReplies: ["Automática", "Manual", "Cancelar"],
        });
        return;
      }

      if (draft.step === "type") {
        const taskType = /manual/.test(lower) ? "manual" : "auto";
        taskDraftRef.current = { ...draft, step: "visibility", taskType };
        agentSay({
          from: "agent",
          text: "Qual é a visibilidade desta tarefa?",
          quickReplies: [
            "Interna — só operadores",
            "Shopper-facing — visível ao cliente",
            "Cancelar",
          ],
        });
        return;
      }

      if (draft.step === "visibility") {
        const visibility = /shopper|cliente|facing|user/.test(lower) ? "user" : "internal";
        const { stageName, taskName, taskType } = draft;
        taskDraftRef.current = { ...draft, step: "confirm", visibility };
        const typeLabel = taskType === "manual" ? "Manual" : "Automática";
        const visLabel = visibility === "user" ? "Shopper-facing" : "Interna";
        // Spec Fluxo B passo 4: action card estruturado (heading + fields)
        agentSay({
          from: "agent",
          type: "action",
          title: "Adicionar tarefa",
          heading: taskName,
          fields: [
            { label: "Etapa",        value: stageName },
            { label: "Execução",     value: typeLabel, tag: true },
            { label: "Visibilidade", value: visLabel },
          ],
          applyLabel: "Adicionar tarefa",
          onApply: () => {
            detailActionsRef.current?.addTask(stageName, taskName, taskType, "", visibility);
            taskDraftRef.current = null;
            setChatAddingTaskSync(false);
            // Spec Fluxo B passo 5: chips pós-confirmação
            setChatMsgs(m => [...m, {
              from: "agent",
              text: `✓ Tarefa **"${taskName}"** adicionada à etapa **${stageName}**. Quer adicionar outra tarefa?`,
              quickReplies: ["+ Outra tarefa", "Pronto"],
            }]);
          },
          onDismiss: () => {
            taskDraftRef.current = null;
            setChatAddingTaskSync(false);
            setChatMsgs(m => [...m, { from: "agent", text: "Tudo bem, tarefa cancelada." }]);
          },
        });
        return;
      }

      // If draft is in confirm step and user cancels
      if (/cancel|não|nao/.test(lower)) {
        taskDraftRef.current = null;
        setChatAddingTaskSync(false);
        agentSay({ from: "agent", text: "Tudo bem, tarefa cancelada." });
        return;
      }

      // Post-confirm quick action chips (Spec Fluxo B step 7)
      if (/outra tarefa|\+ outra/.test(lower)) {
        const stageNames = detailActionsRef.current?.getStageNames() || [];
        taskDraftRef.current = { step: "stage" };
        setChatAddingTaskSync(true);
        agentSay({
          from: "agent",
          text: "Em qual etapa você quer adicionar a próxima tarefa?",
          quickReplies: stageNames,
        });
        return;
      }
      if (/configurar dependências|dependências/.test(lower)) {
        agentSay({
          from: "agent",
          text: "Dependências entre workflows são configuradas em **Configurações → Dependências**.",
          quickReplies: ["Ver configurações", "Pronto"],
        });
        return;
      }
      if (/^pronto$|^ok$|^feito$/.test(lower.trim())) {
        agentSay({
          from: "agent",
          text: "Perfeito! O que mais você quer fazer?",
          quickReplies: ["+ Adicionar tarefa", "Publicar workflow"],
        });
        return;
      }
    }

    // ── Stage creation ───────────────────────────────────────────────────────
    const stageMatch = text.match(/(?:adicionar?|nova?|criar?|inserir?)\s+(?:uma?\s+)?etapa\s+(?:chamad[ao]\s+|de\s+|:?\s*)?["']?([A-Za-zÀ-ú0-9][^"'.,!?\n]{1,50})["']?/i);
    if (stageMatch) {
      const stageName = stageMatch[1].trim();
      detailActionsRef.current?.addStage(stageName);
      agentSay({ from: "agent", text: `✓ Etapa "${stageName}" adicionada ao final do workflow.` });
      return;
    }

    // ── Task creation entry point ────────────────────────────────────────────
    if (/adicionar?\s+(?:uma?\s+)?tarefa|nova\s+tarefa|criar?\s+(?:uma?\s+)?tarefa/.test(lower)) {
      const stageNames = detailActionsRef.current?.getStageNames() || [];
      if (stageNames.length === 0) {
        agentSay({ from: "agent", text: "Não há etapas neste workflow ainda. Adicione uma etapa primeiro." });
        return;
      }
      taskDraftRef.current = { step: "stage" };
      setChatAddingTaskSync(true);
      agentSay({
        from: "agent",
        text: `Em qual etapa você quer adicionar a tarefa? ${stageNames.map(n => `**${n}**`).join(", ")}`,
        quickReplies: stageNames,
      });
      return;
    }

    if (/etapa|stage/.test(lower) && !/tarefa/.test(lower)) {
      agentSay({
        from: "agent",
        text: 'Qual é o nome da nova etapa? Por exemplo: "adicionar etapa Validação de Fraude"',
      });
      return;
    }

    // ── Fluxo F.1 — Publicar workflow ───────────────────────────────────────
    if (/publicar|ativar (?:este|o) workflow|publicar agora/.test(lower)) {
      const wfData = AIWData.workflows.find(w => w.id === mode?.workflowId);
      const stageCount = wfData?.stages?.length || detailActionsRef.current?.getStageNames?.()?.length || 0;
      if (stageCount === 0) {
        agentSay({
          from: "agent",
          text: "Este workflow não tem etapas configuradas. Adicione pelo menos uma etapa antes de publicar.",
          quickReplies: ["+ Adicionar etapa", "Cancelar"],
        });
        return;
      }
      agentSay({
        from: "agent",
        type: "action",
        title: "Publicar workflow",
        body: `**${wfData?.name || "este workflow"}** ficará ativo imediatamente para novos pedidos.`,
        onApply: () => {
          setChatMsgs(m => [...m, {
            from: "agent",
            text: `✓ Workflow **"${wfData?.name}"** publicado. Novos pedidos já seguirão este fluxo.`,
            quickReplies: ["Ver configurações", "Criar outro workflow"],
          }]);
        },
        onDismiss: () => {
          setChatMsgs(m => [...m, { from: "agent", text: "Publicação cancelada." }]);
        },
      });
      return;
    }

    // ── Fluxo F.3 — Arquivar workflow ───────────────────────────────────────
    if (/arquivar|desativar (?:este|o) workflow/.test(lower)) {
      const wfData = AIWData.workflows.find(w => w.id === mode?.workflowId);
      agentSay({
        from: "agent",
        type: "action",
        title: "⚠ Arquivar workflow",
        body: `**${wfData?.name || "este workflow"}** será desativado. Pedidos em andamento não são afetados.`,
        onApply: () => {
          setChatMsgs(m => [...m, {
            from: "agent",
            text: `✓ Workflow **"${wfData?.name}"** arquivado. Para reativar, publique-o novamente.`,
            quickReplies: ["Publicar novamente", "Criar novo workflow"],
          }]);
        },
        onDismiss: () => {
          setChatMsgs(m => [...m, { from: "agent", text: "Arquivamento cancelado." }]);
        },
      });
      return;
    }

    // ── "O que posso fazer?" ─────────────────────────────────────────────────
    if (/o que posso fazer|o que você faz|posso fazer|ajuda/.test(lower)) {
      agentSay({
        from: "agent",
        text: "Posso te ajudar a:\n• Adicionar, editar ou remover etapas e tarefas\n• Configurar execução, visibilidade e responsável de cada tarefa\n• Publicar ou arquivar este workflow",
        quickReplies: ["+ Adicionar tarefa", "Publicar workflow"],
      });
      return;
    }

    // ── Fallback (Spec seção 7) ──────────────────────────────────────────────
    agentSay({
      from: "agent",
      text: "Não entendi. O que você quer fazer?",
      quickReplies: ["+ Adicionar tarefa", "Publicar workflow", "O que posso fazer?"],
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
    chatComposerRef.current?.cite(text);
  }, []);

  const sendFn = React.useCallback((text) => {
    handleSend(text);
  }, []);

  const chatStartAddTaskFn = React.useCallback((stageName) => {
    if (chatAddingTaskRef.current) return;
    setChatMsgs(m => [...m, { from: "user", text: `Adicionar tarefa na etapa ${stageName}` }]);
    // Spec Fluxo B passo 1: confirma contexto e pede o nome
    taskDraftRef.current = { step: "name", stageName };
    setChatAddingTaskSync(true);
    agentSay({
      from: "agent",
      text: `Adicionando tarefa na etapa **${stageName}**. Qual é o nome da tarefa?`,
      quickReplies: ["Cancelar"],
    });
    setTimeout(() => chatComposerRef.current?.focus(), 100);
  }, []);

  const chatStartAddStageFn = React.useCallback(() => {
    if (chatAddingTaskRef.current) return;
    setChatMsgs(m => [...m, { from: "user", text: "Adicionar etapa" }]);
    agentSay({
      from: "agent",
      text: 'Qual é o nome da nova etapa? Por exemplo: **"Validação de Fraude"** ou **"Expedição"**.',
      quickReplies: ["Cancelar"],
    });
    setTimeout(() => chatComposerRef.current?.focus(), 100);
  }, []);

  return (
    <ChatSendContext.Provider value={sendFn}>
    <ChatCiteContext.Provider value={citeFn}>
    <ChatAddingTaskContext.Provider value={chatAddingTask}>
    <ChatStartAddTaskContext.Provider value={chatStartAddTaskFn}>
    <ChatStartAddStageContext.Provider value={chatStartAddStageFn}>
    <AgentSayContext.Provider value={agentSay}>
    <ChatTaskRemovedContext.Provider value={notifyTaskRemovedFn}>
      <ResizableSplit screenLabel="03 Gerenciador de Experiências" initialWidth={400}>
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
    </ChatTaskRemovedContext.Provider>
    </AgentSayContext.Provider>
    </ChatStartAddStageContext.Provider>
    </ChatStartAddTaskContext.Provider>
    </ChatAddingTaskContext.Provider>
    </ChatCiteContext.Provider>
    </ChatSendContext.Provider>
  );
}

window.WorkflowBoardView = WorkflowBoardView;
