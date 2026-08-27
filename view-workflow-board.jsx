/* global React, Icon, IconSparkleFill, IconHandFill, IconPencil, IconCursorFill, IconDragDots, IconDotsSixVertical, IconDotsThreeVertical, IconEdit, IconPlayCircleFill, IconCaretLeftSmall, IconCaretDown, IconCaretUp, IconTrash, IconCheck, IconCube, IconCurrencyCircleDollar, IconNewspaper, IconTruck, IconReorder, AIWData, ChatPanel, ResizableSplit, IconButton, SidebarTooltip, PersonAvatar */
const { useState, useRef, useEffect, useLayoutEffect, useCallback } = React;

// Usuário da sessão atual — mesmo e-mail já usado como autor/editor nos dados
// mock (data-aiw.js), usado para preencher "Publicado em" ao publicar.
const CURRENT_USER_EMAIL = "jackeline@vtex.com";

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


/* ---------- Inline task row with trigger-style dropdown ---------- */

function StageTaskRow({ task, stage, workflow, idx, dragging, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, onChanged, onRemove, isOpen, onToggle, isNew, onStageChange, publishSignal, reorderMode = true }) {
  const [dirtyCount, setDirtyCount] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [execType, setExecType] = useState(task.type); // "manual" | "auto"
  const [active, setActive] = useState(true);
  const [visibility, setVisibility] = useState("internal"); // "internal" | "user"

  const rowRef = useRef(null);

  const mark = () => { setDirtyCount(c => c + 1); onChanged?.(); };

  // "Publicar" limpa o contador de alterações não salvas da linha — o valor
  // dos campos em si (status/execução/visibilidade) permanece, só o selo some.
  useEffect(() => {
    if (publishSignal) setDirtyCount(0);
  }, [publishSignal]);

  // Fecha ao clicar fora da linha inteira — cliques dentro da própria linha
  // (nome, tags, dropdown) já são tratados pelo onClick da linha / stopPropagation
  // dos itens internos, então não devem disparar um segundo toggle aqui.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {
        onToggle?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Indicador da linha reflete a etapa a que a tarefa pertence — mesmo
  // ícone/cor do stage-flat-card-indicator, para localizar a etapa mesmo
  // com a lista de Tarefas separada da lista de Etapas.
  const StageIcon = getStageIcon(stage);

  return (
    <>
      <div
        ref={rowRef}
        className={`stage-task${reorderMode ? " stage-task--reorder" : ""}${dragging === idx ? " is-dragging" : ""}${dragOver === idx ? " drag-over" : ""}${isOpen ? " stage-task--open" : ""}${isNew ? " stage-task--new" : ""}`}
        data-task-id={task.id}
        draggable={reorderMode && !isOpen}
        onDragStart={reorderMode && !isOpen ? onDragStart : undefined}
        onDragOver={reorderMode && !isOpen ? onDragOver : undefined}
        onDrop={reorderMode && !isOpen ? onDrop : undefined}
        onDragEnd={reorderMode && !isOpen ? onDragEnd : undefined}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      >
        {reorderMode && (
          <span className="stage-task-grip" aria-hidden="true">
            <IconDotsSixVertical size={20} />
          </span>
        )}
        <SidebarTooltip label={stage?.name} placement="top" enabled={!!stage?.name}>
          <span
            className={`stage-task-indicator${!active ? " stage-task-indicator--inactive" : ""}`}
            style={active ? { background: getStageColor(stage), color: getStageIconColor(stage) } : undefined}
          >
            {StageIcon && <StageIcon size={13} />}
          </span>
        </SidebarTooltip>
        <span className={`stage-task-name${!active ? " stage-task-name--inactive" : ""}`}>{task.name}</span>

        <span className="stage-task-meta">
          <span className="stage-task-meta-text">{execType === "auto" ? "Automático" : "Manual"}</span>
          <span className="stage-task-meta-dot">·</span>
          <span className="stage-task-meta-text">{visibility === "user" ? "Externa" : "Interna"}</span>
        </span>

        {dirtyCount > 0 && (
          <span className="stage-task-dirty-badge" title={`${dirtyCount} alteração${dirtyCount !== 1 ? "ões" : ""} não salva${dirtyCount !== 1 ? "s" : ""}`}>
            {dirtyCount}
          </span>
        )}

        {!reorderMode && (
          <SidebarTooltip label="Configurar tarefa" placement="top">
            <IconButton
              className="stage-task-edit-btn--fixed"
              icon={<IconEdit size={16} />}
              label="Configurar tarefa"
              variant="tertiary"
              onClick={e => { e.stopPropagation(); onToggle(); }}
            />
          </SidebarTooltip>
        )}

        {isOpen && (
          <div className="trigger-dropdown stage-task-dropdown" onClick={e => e.stopPropagation()}>
            <div className="trigger-dropdown-section" style={{ paddingBottom: 0 }}>
              <div className="trigger-dropdown-label">Status</div>
              <div className="trigger-orch-row" style={{ borderTop: "none", padding: 0 }}>
                <button className={`trigger-orch-btn${active ? " selected" : ""}`} onClick={() => { setActive(true); mark(); }}>Ativo</button>
                <button className={`trigger-orch-btn${!active ? " selected" : ""}`} onClick={() => { setActive(false); mark(); }}>Inativo</button>
              </div>
            </div>

            <div className="trigger-dropdown-section" style={{ borderTop: "none", paddingTop: 10, paddingBottom: 0 }}>
              <div className="trigger-dropdown-label">Como executa</div>
              <div className="trigger-orch-row" style={{ borderTop: "none", padding: 0 }}>
                <button className={`trigger-orch-btn${execType !== "auto" ? " selected" : ""}`} onClick={() => { setExecType("manual"); mark(); }}>Manual</button>
                <button className={`trigger-orch-btn${execType === "auto" ? " selected" : ""}`} onClick={() => { setExecType("auto"); mark(); }}>Automático</button>
              </div>
            </div>

            <div className="trigger-dropdown-section" style={{ borderTop: "none", paddingTop: 10, paddingBottom: 16 }}>
              <div className="trigger-dropdown-label">Visibilidade</div>
              <div className="trigger-orch-row" style={{ borderTop: "none", padding: 0 }}>
                <button className={`trigger-orch-btn${visibility === "internal" ? " selected" : ""}`} onClick={() => { setVisibility("internal"); mark(); }}>Interna</button>
                <button className={`trigger-orch-btn${visibility === "user" ? " selected" : ""}`} onClick={() => { setVisibility("user"); mark(); }}>Externa</button>
              </div>
            </div>

            <div className="trigger-dropdown-section" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, paddingBottom: 12 }}>
              <button
                className="stage-task-remove-btn"
                onClick={e => { e.stopPropagation(); onToggle?.(); setConfirmRemove(true); }}
              >
                <IconTrash size={14} /> Remover tarefa
              </button>
            </div>
          </div>
        )}
      </div>
      {confirmRemove && (
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

function StageCard({ stage, workflow, startNum, onOpenTask, onOpenStage, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onChanged, stageDragging, stageDragOver, onStageDragStart, onStageDragOver, onStageDrop, onStageDragEnd, publishSignal }) {
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
          publishSignal={publishSignal}
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

/* ── Helpers de exibição da list card (WfListCardV2 / renderExpanded) ─────
   Convertem os campos do workflow (docs/WORKFLOW_ENTIDADES.md) em rótulos e
   cores prontos para renderizar no card. Ficam no escopo do módulo para
   permanecerem estáveis entre renders sem depender de closures do canvas. */
function wfOrchMeta(w) {
  if (w.agentEnabled === true) {
    return {
      icon: "sparkle",
      label: "Agêntica",
      bg: "var(--sl-color-purple-1, #f3e8ff)",
      fg: "var(--sl-color-purple-9, #7c3aed)",
    };
  }
  return {
    icon: "user",
    label: "Manual",
    bg: "var(--sl-bg-muted, #f3f4f6)",
    fg: "var(--sl-color-gray-10, #374151)",
  };
}
function wfStatusPill(w) {
  if (w.wfStatus === "published") {
    return { label: "Ativo", bg: "#D1FAE5", fg: "#00a81c" };
  }
  if (w.wfStatus === "published_with_changes") {
    return { label: "Ativo · pendente", bg: "var(--sl-color-orange-2, #ffedcd)", fg: "var(--sl-color-orange-10, #b24d01)" };
  }
  if (w.wfStatus === "archived") {
    return { label: "Arquivado", bg: "var(--sl-bg-muted, #f3f4f6)", fg: "var(--sl-color-gray-10, #374151)" };
  }
  return { label: "Rascunho", bg: "var(--sl-bg-muted, #f3f4f6)", fg: "var(--sl-color-gray-10, #374151)" };
}
function wfTriggerDisplay(w) {
  const t = w.trigger || {};
  if (t.type === "system-event") {
    const events = t.events || [];
    return {
      hasTrigger: events.length > 0,
      typeLabel: "Evento do sistema",
      explain: "Começa sozinho quando o evento acontece na plataforma.",
      value: events[0] || "",
      moreCount: Math.max(events.length - 1, 0),
    };
  }
  if (t.type === "wf-completion") {
    const ids = t.triggerWfIds || [];
    const src = (typeof AIWData !== "undefined" && AIWData.workflows) || [];
    const firstName = src.find(x => x.id === ids[0])?.name || ids[0] || "";
    return {
      hasTrigger: ids.length > 0,
      typeLabel: "Conclusão de um workflow",
      explain: "Começa quando outro workflow chega ao fim, levando o pedido adiante.",
      value: firstName,
      moreCount: Math.max(ids.length - 1, 0),
    };
  }
  if (t.type === "task-completion") {
    const pairs = t.pairs || [];
    const first = pairs[0];
    const src = (typeof AIWData !== "undefined" && AIWData.workflows) || [];
    let value = "";
    if (first) {
      const wf = src.find(x => x.id === first.wfId);
      const task = wf ? wf.stages.flatMap(s => s.tasks).find(x => x.id === first.taskId) : null;
      value = wf ? `${wf.name}${task ? ` · ${task.name}` : ""}` : first.wfId;
    }
    return {
      hasTrigger: pairs.length > 0,
      typeLabel: "Conclusão de uma tarefa",
      explain: "Começa quando uma tarefa específica de outro workflow entra num status monitorado.",
      value,
      moreCount: Math.max(pairs.length - 1, 0),
    };
  }
  if (t.type === "order-start") {
    return { hasTrigger: true, typeLabel: "Início do pedido", explain: "Começa automaticamente no início do ciclo do pedido.", value: "Início do pedido", moreCount: 0 };
  }
  return { hasTrigger: false, typeLabel: "", explain: "Sem gatilho, o workflow só começa se alguém colocar um pedido nele manualmente.", value: "", moreCount: 0 };
}
/* Renderiza a tag do valor do gatilho e exibe o "+N" apenas quando a tag
   não couber na largura do container (ellipsis ativa). */
function TriggerValueWithOverflow({ value, moreCount }) {
  const valueRef = useRef(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    const measure = () => {
      // scrollWidth > clientWidth indica que o text-overflow ellipsis foi acionado
      setTruncated(el.scrollWidth - el.clientWidth > 1);
    };
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
    }
    return () => { if (ro) ro.disconnect(); };
  }, [value, moreCount]);

  return (
    <span className="wf-card-trigger-value-wrap">
      <span className="wf-card-trigger-value" ref={valueRef} title={value}>{value}</span>
      {moreCount > 0 && truncated && (
        <span className="wf-card-trigger-more">+{moreCount}</span>
      )}
    </span>
  );
}

function wfFootMeta(w) {
  const dateIso = w.publishedAt || w.lastEditedAt;
  const actor = w.publishedBy || w.lastEditedBy;
  if (!dateIso) return "";
  const verb = w.publishedAt ? "Publicado" : "Editado";
  return `${verb} ${wfTimeAgo(dateIso)} por ${wfFirstName(actor)}`;
}
function wfTimeAgo(iso) {
  const then = new Date(iso).getTime();
  if (!then) return "";
  const diff = Date.now() - then;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "hoje";
  if (diff < 2 * day) return "ontem";
  const days = Math.floor(diff / day);
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? "ano" : "anos"}`;
}
function wfFirstName(email) {
  if (!email) return "—";
  const local = String(email).split("@")[0] || String(email);
  const first = local.split(".")[0] || local;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/* ── Editable workflow title — auto-resizing textarea styled as h1, mirrors
   the campaign title field from vtex-ads-campaign-manager-design-prototype ── */
function WfEditableTitle({ value, onChange, className = "" }) {
  const ref = useRef(null);

  const syncHeight = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => { syncHeight(); }, [value]);
  useEffect(() => {
    const onResize = () => syncHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <textarea
      ref={ref}
      rows={1}
      className={`detail-title detail-title-input ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\r?\n/g, " "))}
      onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
      placeholder="Nome do workflow"
      aria-label="Nome do workflow"
    />
  );
}

/* ── Inline actor span — mirrors span.reporter from view-task.jsx ──────── */
function WfActorSpan({ who, date }) {
  const isHuman = who && who.includes("@");
  const initial = who ? who[0].toUpperCase() : "?";
  return (
    <span className="reporter">
      <PersonAvatar initial={initial} agent={!isHuman} name={who} />
      <span><b>{who}</b> em {date}</span>
    </span>
  );
}

/* ── Workflow metadata fields (version, edit dates, config chips) ────────── */
function WfMetaSection({ workflow, onOpenSettings }) {
  const sm  = WF_STATUS_META[workflow.wfStatus] || WF_STATUS_META.draft;
  const log = workflow.versionLog || [];
  const runningVersion = (workflow.wfStatus === "published_with_changes" && log.length > 0) ? log[0].version : null;
  // O histórico não fica mais inline empurrando os campos abaixo — abre num modal.
  const [histOpen, setHistOpen] = useState(false);

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
        <button type="button" className="wf-ver-badge-btn" onClick={() => setHistOpen(true)} title="Histórico de versões">
          <span className="wf-ver-badge-label">{sm.label} • versão {workflow.version}</span>
          <Icon name="chevron-right" size={12} className="wf-ver-badge-chevron" />
        </button>
        {runningVersion && (
          <span className="wf-meta-running">v{runningVersion} em produção</span>
        )}
      </dd>

      {workflow.publishedAt && <>
        <dt>Publicado em</dt>
        <dd className="wf-meta-actor"><WfActorSpan who={workflow.publishedBy} date={fmtWfDate(workflow.publishedAt)} /></dd>
      </>}

      {histOpen && (
        <WfVersionHistoryModal workflow={workflow} onClose={() => setHistOpen(false)} />
      )}
    </dl>
  );
}

/* Histórico de versões — antes expandia inline (empurrando "Publicado em" e
   os campos seguintes), agora abre num modal separado, sem afetar o layout
   do painel de detalhes. */
function WfVersionHistoryModal({ workflow, onClose }) {
  const log = workflow.versionLog || [];

  const ENTITY_LABEL = { task: "Tarefa", dependency: "Dependência", trigger: "Gatilho", supplier: "Fornecedor", contingency: "Contingência", "general config": "Config. geral" };
  const CHANGE_LABEL = { added: "adicionado", removed: "removido", renamed: "renomeado", edited: "editado", changed: "alterado", connected: "conectado", disconnected: "desconectado", replaced: "substituído" };
  const CHANGE_SIGN  = { added: "+", removed: "−", replaced: "⇄", renamed: "~", edited: "~", changed: "~", connected: "+", disconnected: "−" };

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label="Histórico de versões">
        <div className="stage-config-modal-head">
          <SidebarTooltip label="Voltar" placement="top">
            <IconButton icon={<Icon name="arrow-left" size={18} />} label="Voltar" variant="tertiary" onClick={onClose} />
          </SidebarTooltip>
          <h2 className="stage-config-modal-title">
            Histórico de versões
            {log.length > 0 && <span className="wf-meta-hist-count">{log.length}</span>}
          </h2>
        </div>

        <div className="wf-side-drawer-body">
          {log.length === 0 ? (
            <p className="setting-help">Nenhuma versão publicada ainda.</p>
          ) : (
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
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Drawer lateral genérico para escolha de uma opção única (Gatilho,
   Orquestração, etc.) — mesmo padrão do "Drawer de segmentação" das
   campaigns: lista de cards de opção, aberto a partir de um botão-valor
   estilo "Segmentar por", em vez do dropdown flutuante anterior. */
function WfChoiceDrawer({ title, options, selectedKey, onSelect, onClose, children }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="stage-config-modal-head">
          <SidebarTooltip label="Voltar" placement="top">
            <IconButton icon={<Icon name="arrow-left" size={18} />} label="Voltar" variant="tertiary" onClick={onClose} />
          </SidebarTooltip>
          <h2 className="stage-config-modal-title">{title}</h2>
        </div>

        <div className="wf-side-drawer-body">
          <div className="trigger-choice-list">
            {options.map(opt => (
              <button
                key={opt.key}
                className={`trigger-choice-card${selectedKey === opt.key ? " selected" : ""}`}
                onClick={() => onSelect(opt.key)}
              >
                <span className="trigger-choice-copy">
                  <span className="setting-row-title">{opt.label}</span>
                  <span className="setting-row-desc">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Eventos de domínio fictícios do gatilho "Evento do sistema", agrupados por
   domínio. Alimentam o picker do card Configuração (WfSystemEventPicker). */
const SYSTEM_EVENT_GROUPS = [
  { domain: "Pedidos", events: [
    "Pedido criado", "Pagamento aprovado", "Pedido cancelado", "Pedido faturado", "Item removido do pedido",
  ] },
  { domain: "Devoluções", events: [
    "Devolução solicitada", "Devolução aprovada", "Devolução rejeitada", "Produto recebido no CD", "Reembolso emitido",
  ] },
  { domain: "Entrega", events: [
    "Pedido enviado", "Entrega atrasada", "Tentativa de entrega falhou", "Pedido entregue", "Endereço de entrega alterado",
  ] },
  { domain: "Assinaturas", events: [
    "Assinatura criada", "Assinatura renovada", "Assinatura cancelada", "Falha na cobrança recorrente", "Plano alterado",
  ] },
  { domain: "Pagamentos", events: [
    "Pagamento recusado", "Pagamento em análise antifraude", "Estorno solicitado", "Boleto vencido",
  ] },
  { domain: "Estoque", events: [
    "Produto esgotado", "Estoque reabastecido", "Produto próximo do limite mínimo",
  ] },
  { domain: "Conta do cliente", events: [
    "Conta criada", "Dados cadastrais atualizados", "Cliente marcado como VIP", "Solicitação de exclusão de conta (LGPD)",
  ] },
  { domain: "Atendimento", events: [
    "Ticket de suporte aberto", "Ticket escalado", "Avaliação de atendimento recebida",
  ] },
];

/* Picker de eventos do gatilho "Evento do sistema": busca no topo e eventos
   agrupados por domínio, com seleção múltipla — o operador pode marcar vários
   eventos, inclusive dentro do mesmo domínio. Embutido no card "Configuração"
   do WfTriggerDrawer. */
function WfSystemEventPicker({ selectedEvents, onToggle }) {
  const [query, setQuery] = useState("");

  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = norm(query.trim());
  // Busca casa pelo nome do evento; se casar pelo nome do domínio, o grupo
  // inteiro permanece visível.
  const groups = SYSTEM_EVENT_GROUPS
    .map((g) => (q && !norm(g.domain).includes(q))
      ? { ...g, events: g.events.filter((ev) => norm(ev).includes(q)) }
      : g)
    .filter((g) => g.events.length > 0);

  return (
    <>
      <div className="wf-event-search">
        <Icon name="search" size={14} />
        <input
          type="search"
          placeholder="Buscar evento"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
      {groups.length === 0 ? (
        <span className="setting-help" style={{ display: "block", marginTop: 16 }}>Nenhum evento encontrado</span>
      ) : (
        <div className="wf-event-groups">
          {groups.map((g) => (
            <div key={g.domain} className="setting-field">
              <label>{g.domain}</label>
              <div className="wf-event-group-list">
                {g.events.map((ev) => (
                  <label key={ev} className="wf-check">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(ev)}
                      onChange={() => onToggle(ev)}
                    />
                    <span>{ev}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* Dropdown customizado do tipo de gatilho — mesmo padrão .status-dropdown
   do sistema (botão + painel listbox), em largura total, no lugar do
   <select> nativo. */
function WfTriggerTypeDropdown({ options, value, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = options.find(o => o.key === value);

  return (
    <div className="status-dropdown wf-trigger-type-dropdown" ref={ref}>
      <button
        type="button"
        className={`status-dropdown-btn${open ? " open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dropdown-copy">
          <span className={`status-dropdown-label${current ? "" : " placeholder"}`}>
            {current ? current.label : "Selecionar tipo de gatilho"}
          </span>
          {current && <span className="status-dropdown-desc">{current.desc}</span>}
        </span>
        <svg className={`status-dropdown-chevron${open ? " open" : ""}`} viewBox="0 0 16 16" fill="none" width="12" height="12">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="status-dropdown-panel" role="listbox">
          {options.map(opt => (
            <button
              key={opt.key}
              type="button"
              className={`status-dropdown-item${value === opt.key ? " selected" : ""}`}
              role="option"
              aria-selected={value === opt.key}
              onClick={() => { onSelect(opt.key); setOpen(false); }}
            >
              <span className="status-dropdown-copy">
                <span className="status-dropdown-item-label">{opt.label}</span>
                <span className="status-dropdown-desc">{opt.desc}</span>
              </span>
              {value === opt.key && <IconCheck size={16} style={{ marginLeft: "auto", flexShrink: 0, alignSelf: "center" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Configuração do gatilho "Conclusão de uma tarefa específica" — um card por
   workflow de origem, cada um com a tarefa que dispara e o status observado
   da tarefa (vocabulário TASK_STATUSES do OMS). O operador adiciona mais
   workflows pelo picker "+ Adicionar workflow". */
function WfTaskTriggerConfig({ workflows, pairs, onAddWf, onRemovePair, onPickTask, onPickStatus }) {
  // "t<i>"/"s<i>" = lista de tarefas/status do card i aberta; null = fechado
  const [openList, setOpenList] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

  const statuses = (AIWData && AIWData.TASK_STATUSES) || [];
  const available = workflows.filter(w => !pairs.some(p => p.wfId === w.id));
  const tasksOf = (wf) => wf ? wf.stages.flatMap(s => s.tasks.map(t => ({ ...t, stageName: s.name }))) : [];

  return (
    <div className="wf-task-trigger-config">
      {pairs.map((p, i) => {
        const wf = workflows.find(w => w.id === p.wfId);
        const tasks = tasksOf(wf);
        const task = tasks.find(t => t.id === p.taskId);
        const status = statuses.find(st => st.id === p.status);
        const taskListOpen = openList === `t${i}`;
        const statusListOpen = openList === `s${i}`;
        return (
          <div key={p.wfId} className="wf-task-trigger-card">
            <div className="wf-task-trigger-head">
              <div className="wf-task-trigger-head-copy">
                <span className="wf-task-trigger-overline">Workflow</span>
                <span className="wf-task-trigger-wf-name">{wf ? `${wf.icon} ${wf.name}` : ""}</span>
              </div>
              <SidebarTooltip label="Remover workflow" placement="top">
                <IconButton
                  icon={<Icon name="x" size={14} />}
                  label="Remover workflow"
                  variant="tertiary"
                  onClick={() => { onRemovePair(i); setOpenList(null); }}
                />
              </SidebarTooltip>
            </div>
            <div className="wf-task-trigger-divider" />

            <span className="wf-task-trigger-overline">Tarefa que dispara</span>
            <button
              type="button"
              className={`wf-task-trigger-select${taskListOpen ? " open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={taskListOpen}
              onClick={() => setOpenList(taskListOpen ? null : `t${i}`)}
            >
              <span className="wf-task-trigger-select-copy">
                <span className={`wf-task-trigger-select-value${task ? "" : " placeholder"}`}>
                  {task ? task.name : "Selecionar tarefa"}
                </span>
                {task && <span className="wf-task-trigger-select-meta">{task.stageName}</span>}
              </span>
              <Icon name="chevron-down" size={14} className="wf-task-trigger-select-chevron" />
            </button>
            {taskListOpen && (
              <div className="wf-task-trigger-list" role="listbox">
                {tasks.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    className={`wf-task-trigger-option${p.taskId === t.id ? " selected" : ""}`}
                    role="option"
                    aria-selected={p.taskId === t.id}
                    onClick={() => { onPickTask(i, t.id); setOpenList(`s${i}`); }}
                  >
                    <span className="wf-task-trigger-option-dot" aria-hidden="true" />
                    <span className="wf-task-trigger-option-name">{t.name}</span>
                    <span className="wf-task-trigger-option-meta">{t.stageName}</span>
                  </button>
                ))}
              </div>
            )}

            <span className="wf-task-trigger-overline" style={{ marginTop: 12 }}>Status da tarefa</span>
            <button
              type="button"
              className={`wf-task-trigger-select${statusListOpen ? " open" : ""}`}
              aria-haspopup="listbox"
              aria-expanded={statusListOpen}
              onClick={() => setOpenList(statusListOpen ? null : `s${i}`)}
            >
              <span className="wf-task-trigger-select-copy">
                <span className={`wf-task-trigger-select-value${status ? "" : " placeholder"}`}>
                  {status ? status.label : "Selecionar status"}
                </span>
              </span>
              <Icon name="chevron-down" size={14} className="wf-task-trigger-select-chevron" />
            </button>
            {statusListOpen && (
              <div className="wf-task-trigger-list" role="listbox">
                {statuses.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    className={`wf-task-trigger-option${p.status === st.id ? " selected" : ""}`}
                    role="option"
                    aria-selected={p.status === st.id}
                    onClick={() => { onPickStatus(i, st.id); setOpenList(null); }}
                  >
                    <span className="wf-task-trigger-option-name">{st.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {addOpen && available.length > 0 && (
        <div className="wf-task-trigger-picker">
          <div className="wf-task-trigger-picker-head">Adicionar workflow de origem</div>
          {available.map(w => (
            <button
              key={w.id}
              type="button"
              className="wf-task-trigger-picker-item"
              onClick={() => { onAddWf(w); setAddOpen(false); setOpenList(`t${pairs.length}`); }}
            >
              <span className="wf-task-trigger-picker-plus"><Icon name="plus" size={13} /></span>
              <span className="wf-task-trigger-picker-name">{w.icon} {w.name}</span>
              <span className="wf-task-trigger-picker-count">{tasksOf(w).length} tarefas</span>
            </button>
          ))}
        </div>
      )}

      {available.length > 0 && (
        <button type="button" className="wf-task-trigger-add" onClick={() => setAddOpen(o => !o)}>
          <Icon name="plus" size={14} />
          {pairs.length === 0 ? "Adicionar workflow" : "Adicionar outro workflow"}
        </button>
      )}
    </div>
  );
}

/* Drawer "Gatilho" — card único de configuração: dropdown com o tipo de
   gatilho no topo (sem seleção inicial na primeira configuração) e, abaixo,
   a descrição e os campos específicos do tipo selecionado. Mesmos tokens
   visuais dos demais drawers do fluxo. */
function WfTriggerDrawer({
  options, trigger, onSelectTrigger,
  systemEvents, onToggleSystemEvent,
  workflows, triggerWfIds, onSelectTriggerWf,
  triggerPairs, onAddTriggerWf, onRemoveTriggerPair, onPickTriggerTask, onPickTriggerStatus,
  onClose,
}) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label="Gatilho">
        <div className="stage-config-modal-head">
          <SidebarTooltip label="Voltar" placement="top">
            <IconButton icon={<Icon name="arrow-left" size={18} />} label="Voltar" variant="tertiary" onClick={onClose} />
          </SidebarTooltip>
          <h2 className="stage-config-modal-title">Gatilho</h2>
        </div>

        <div className="wf-side-drawer-body">
          <div className="wf-trigger-config-card">
            <WfTriggerTypeDropdown options={options} value={trigger} onSelect={onSelectTrigger} />

            {trigger === "system-event" && (
              <div className="setting-field" style={{ marginTop: 14 }}>
                <WfSystemEventPicker selectedEvents={systemEvents} onToggle={onToggleSystemEvent} />
              </div>
            )}

            {trigger === "wf-completion" && (
              <div className="setting-field" style={{ marginTop: 14 }}>
                <label>Workflow de origem</label>
                {workflows.length === 0 ? (
                  <span className="setting-help">Nenhum outro workflow disponível</span>
                ) : (
                  <div className="wf-radio-group">
                    {workflows.map(w => (
                      <label key={w.id} className={`wf-radio-row${triggerWfIds.includes(w.id) ? " selected" : ""}`}>
                        <input
                          type="checkbox"
                          checked={triggerWfIds.includes(w.id)}
                          onChange={() => onSelectTriggerWf(w)}
                        />
                        <span>{w.icon} {w.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {trigger === "task-completion" && (
              <div className="setting-field" style={{ marginTop: 14 }}>
                {workflows.length === 0 ? (
                  <span className="setting-help">Nenhum outro workflow disponível</span>
                ) : (
                  <WfTaskTriggerConfig
                    workflows={workflows}
                    pairs={triggerPairs}
                    onAddWf={onAddTriggerWf}
                    onRemovePair={onRemoveTriggerPair}
                    onPickTask={onPickTriggerTask}
                    onPickStatus={onPickTriggerStatus}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Drawer lateral para escolha múltipla de workflows (Dependências: "depende
   de" / "desbloqueia") — mesmo drawer do WfChoiceDrawer, mas cada item é um
   toggle (não fecha ao selecionar) em vez de uma opção única. */
function WfWorkflowPickerDrawer({ title, workflows, selected, onToggle, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <div className="stage-config-modal-head">
          <SidebarTooltip label="Voltar" placement="top">
            <IconButton icon={<Icon name="arrow-left" size={18} />} label="Voltar" variant="tertiary" onClick={onClose} />
          </SidebarTooltip>
          <h2 className="stage-config-modal-title">{title}</h2>
        </div>

        <div className="wf-side-drawer-body">
          {workflows.length === 0 ? (
            <span className="setting-help">Nenhum outro workflow disponível</span>
          ) : (
            <div className="dep-choice-list" style={{ marginTop: 0 }}>
              {workflows.map(w => {
                const isSelected = selected.some(d => d.wfId === w.id);
                return (
                  <button key={w.id} className={`dep-choice-item${isSelected ? " selected" : ""}`} onClick={() => onToggle(w)}>
                    <span className="dep-choice-name">{w.name}</span>
                    {isSelected && <IconCheck size={14} className="dep-choice-check" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Regra do +N: nomes separados por vírgula limitados a 2 linhas ─────────
   Quando a lista faria o texto passar de 2 linhas, os últimos nomes são
   escondidos e substituídos por um contador "+N". Re-mede quando a largura
   disponível muda (o painel de detalhe é redimensionável). */
function WfClampNamesLabel({ names }) {
  const ref = useRef(null);
  const [visibleCount, setVisibleCount] = useState(names.length);
  const namesKey = names.join("|");

  // Lista mudou: tenta mostrar tudo e deixa a medição reduzir até caber
  useLayoutEffect(() => { setVisibleCount(names.length); }, [namesKey]);

  // Largura do botão mudou: refaz a medição do zero
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement || typeof ResizeObserver === "undefined") return;
    let lastWidth = null;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (lastWidth !== null && width !== lastWidth) setVisibleCount(names.length);
      lastWidth = width;
    });
    ro.observe(el.parentElement);
    return () => ro.disconnect();
  }, [namesKey]);

  // Reduz um nome por vez enquanto o texto ocupar mais de 2 linhas
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (el.scrollHeight > lineHeight * 2 + 1 && visibleCount > 1) {
      setVisibleCount((c) => c - 1);
    }
  });

  const hiddenCount = names.length - visibleCount;
  return (
    <span ref={ref} className="wf-ver-badge-label wf-ver-badge-label--clamp">
      {names.slice(0, visibleCount).join(", ")}
      {hiddenCount > 0 && <span className="wf-ver-badge-more">+{hiddenCount}</span>}
    </span>
  );
}

/* ── Inline workflow settings (replaces separate settings route) ─────────── */
function WfSettingsInline({ workflow, onDirtyChange }) {
  // Estados hidratados a partir do próprio workflow (fixtures em data-aiw.js seguem
  // o schema de docs/WORKFLOW_ENTIDADES.md). Antes tudo iniciava vazio e o card
  // ignorava os campos do prop — agora Gatilho/Deps/Unlocks refletem o valor
  // persistido no workflow assim que a tela abre.
  const initialTrigger = workflow.trigger || {};
  const [trigger,       setTrigger]       = useState(initialTrigger.type || "");
  // Workflow(s) de origem do gatilho "Conclusão de um workflow"
  const [triggerWfIds,  setTriggerWfIds]  = useState(
    initialTrigger.type === "wf-completion" ? (initialTrigger.triggerWfIds || []) : []
  );
  // Gatilho "Conclusão de uma tarefa específica": um par por workflow de
  // origem — { wfId, taskId, status } (tarefa que dispara + status observado)
  const [triggerPairs,  setTriggerPairs]  = useState(
    initialTrigger.type === "task-completion" ? (initialTrigger.pairs || []) : []
  );
  // Eventos de domínio selecionados no gatilho "Evento do sistema" (múltiplos)
  const [systemEvents,  setSystemEvents]  = useState(
    initialTrigger.type === "system-event" ? (initialTrigger.events || []) : []
  );
  // Gatilho card fica colapsado (só a opção selecionada) até o operador clicar em "Editar"
  const [editingTrigger, setEditingTrigger] = useState(false);
  // Quem avança as etapas deste workflow: o agente AI ou um operador manualmente
  const [orchMode, setOrchMode] = useState(workflow.agentEnabled === false ? "manual" : "agent");
  const [editingOrch, setEditingOrch] = useState(false);
  // Workflows que precisam concluir antes deste ativar ("depende de")
  const [deps, setDeps]       = useState(workflow.deps || []);
  const [editingDeps, setEditingDeps] = useState(false);
  // Workflows que este, ao concluir, libera ("desbloqueia")
  const [unlocks, setUnlocks] = useState(workflow.unlocks || []);
  const [editingUnlocks, setEditingUnlocks] = useState(false);

  const mark = () => onDirtyChange?.(true);

  const allWorkflows = (AIWData && AIWData.workflows) ? AIWData.workflows.filter(w => w.id !== workflow.id) : [];
  const selectedTriggerWfs = allWorkflows.filter(w => triggerWfIds.includes(w.id));

  // Seleção múltipla (gatilho "Conclusão de um workflow")
  function selectTriggerWf(w) {
    setTriggerWfIds(prev =>
      prev.includes(w.id) ? prev.filter(id => id !== w.id) : [...prev, w.id]
    );
    mark();
  }

  // Gatilho "Conclusão de uma tarefa específica"
  function addTriggerPair(w) {
    setTriggerPairs(prev => [...prev, { wfId: w.id, taskId: "", status: "" }]);
    mark();
  }
  function removeTriggerPair(index) {
    setTriggerPairs(prev => prev.filter((_, i) => i !== index));
    mark();
  }
  // Trocar a tarefa reinicia o status observado
  function pickTriggerPairTask(index, taskId) {
    setTriggerPairs(prev => prev.map((p, i) => i === index ? { ...p, taskId, status: "" } : p));
    mark();
  }
  function pickTriggerPairStatus(index, statusId) {
    setTriggerPairs(prev => prev.map((p, i) => i === index ? { ...p, status: statusId } : p));
    mark();
  }

  const TRIGGER_OPTS = [
    { key: "system-event",    label: "Evento do sistema",
      desc: "Dispara automaticamente quando um evento específico acontece na loja." },
    { key: "wf-completion",   label: "Conclusão de um workflow",
      desc: "Dispara quando um workflow inteiro, selecionado como origem, é concluído." },
    { key: "task-completion", label: "Conclusão de uma tarefa específica",
      desc: "Dispara quando uma tarefa nomeada, dentro de um workflow de origem selecionado, é concluída." },
  ];

  const currentTriggerOpt = TRIGGER_OPTS.find(o => o.key === trigger);
  const triggerPairLabels = triggerPairs.map(p => {
    const w = allWorkflows.find(x => x.id === p.wfId);
    if (!w) return null;
    const t = w.stages.flatMap(s => s.tasks).find(x => x.id === p.taskId);
    return `${w.icon} ${w.name}${t ? ` · ${t.name}` : ""}`;
  }).filter(Boolean);
  // Cada seleção vira uma tag própria no botão da linha "Gatilho"
  const triggerOriginTags = trigger === "task-completion"
    ? triggerPairLabels
    : trigger === "wf-completion"
      ? selectedTriggerWfs.map(w => `${w.icon} ${w.name}`)
      : trigger === "system-event"
        ? systemEvents
        : [];

  function toggleSystemEvent(ev) {
    setSystemEvents(prev => prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]);
    mark();
  }

  const ORCH_OPTS = [
    { key: "agent",  label: "Agente AI orquestra este workflow",
      desc: "O agente monitora o andamento das tarefas e avança as etapas automaticamente, sem precisar de confirmação manual." },
    { key: "manual", label: "Workflow orquestrado manualmente",
      desc: "As etapas só avançam quando um operador confirma manualmente cada uma — o agente não toma nenhuma ação automática neste workflow." },
  ];
  const currentOrchOpt = ORCH_OPTS.find(o => o.key === orchMode);
  // Rótulo curto do valor selecionado no botão da linha (padrão "Segmentar
  // por" das campaigns), diferente da frase completa usada no dropdown.
  const ORCH_SHORT_LABEL = { agent: "Agêntica", manual: "Manual" };

  const toggleDep = (w) => {
    setDeps(prev => prev.find(d => d.wfId === w.id) ? prev.filter(d => d.wfId !== w.id) : [...prev, { wfId: w.id, wfName: w.name, wfIcon: w.icon }]);
    mark();
  };
  const toggleUnlock = (w) => {
    setUnlocks(prev => prev.find(d => d.wfId === w.id) ? prev.filter(d => d.wfId !== w.id) : [...prev, { wfId: w.id, wfName: w.name, wfIcon: w.icon }]);
    mark();
  };

  // Gatilho, Orquestração, Depende de e Desbloqueia abrem um drawer lateral
  // (WfChoiceDrawer / WfWorkflowPickerDrawer), estilo "Segmentar por" das
  // campaigns, em vez de expandir inline ou abrir um dropdown flutuante.

  return (
    <>
      <div className="wf-settings-inline detail-section-block">
        <SectionTitle as="h1">Estratégia</SectionTitle>

        <div className="wf-settings-inline-prose">

          {/* ── Gatilho ── linha "rótulo em negrito + botão com o valor atual",
               mesmo padrão da linha "Segmentar por" da Segmentação (campaigns):
               o botão abre um drawer lateral com as 3 opções (WfChoiceDrawer). */}
          <section className="wf-settings-card wf-settings-card--flush">
            <div className="wf-trigger-orch-row">
              <span className="wf-trigger-orch-label">Gatilho</span>
              <div className="wf-trigger-orch-value">
                <button type="button" className="wf-ver-badge-btn wf-ver-badge-btn--tags" onClick={() => setEditingTrigger(true)}>
                  <span className="wf-ver-badge-label">
                    {currentTriggerOpt?.label || "Selecionar gatilho"}
                  </span>
                  {triggerOriginTags.map((tag, i) => (
                    <span key={i} className="wf-trigger-origin-tag">{tag}</span>
                  ))}
                  <Icon name="chevron-right" size={14} className="wf-ver-badge-chevron" />
                </button>
              </div>
            </div>

            <div className="setting-divider" style={{ margin: "14px 0" }} />

            {/* ── Orquestração ── quem avança as etapas: o agente ou um operador
                 manualmente. Mesmo padrão de linha + drawer do Gatilho. */}
            <div className="wf-trigger-orch-row">
              <span className="wf-trigger-orch-label">Orquestração</span>
              <div className="wf-trigger-orch-value">
                <button type="button" className="wf-ver-badge-btn" onClick={() => setEditingOrch(true)}>
                  <span className="wf-ver-badge-label">{ORCH_SHORT_LABEL[orchMode] || currentOrchOpt?.label}</span>
                  <Icon name="chevron-right" size={14} className="wf-ver-badge-chevron" />
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>

      {editingTrigger && (
        <WfTriggerDrawer
          options={TRIGGER_OPTS}
          trigger={trigger}
          onSelectTrigger={(key) => { setTrigger(key); mark(); }}
          systemEvents={systemEvents}
          onToggleSystemEvent={toggleSystemEvent}
          workflows={allWorkflows}
          triggerWfIds={triggerWfIds}
          onSelectTriggerWf={selectTriggerWf}
          triggerPairs={triggerPairs}
          onAddTriggerWf={addTriggerPair}
          onRemoveTriggerPair={removeTriggerPair}
          onPickTriggerTask={pickTriggerPairTask}
          onPickTriggerStatus={pickTriggerPairStatus}
          onClose={() => setEditingTrigger(false)}
        />
      )}

      {editingOrch && (
        <WfChoiceDrawer
          title="Orquestração"
          options={ORCH_OPTS}
          selectedKey={orchMode}
          onClose={() => setEditingOrch(false)}
          onSelect={(key) => { setOrchMode(key); mark(); setEditingOrch(false); }}
        />
      )}

      {/* ── Dependências ── sessão própria com título nível 1, mesmo padrão
           "rótulo em negrito + botão com o valor atual" do Gatilho, abrindo
           um drawer lateral com a lista de workflows para marcar/desmarcar. */}
      <div className="wf-settings-inline detail-section-block">
        <SectionTitle as="h1">Dependências</SectionTitle>

        <div className="wf-settings-inline-prose">
          <section className="wf-settings-card wf-settings-card--flush">
            <div className="wf-trigger-orch-row">
              <span className="wf-trigger-orch-label">Dependência</span>
              <div className="wf-trigger-orch-value">
                <button
                  type="button"
                  className="wf-ver-badge-btn"
                  disabled={allWorkflows.length === 0}
                  onClick={() => setEditingDeps(true)}
                >
                  {allWorkflows.length === 0
                    ? <span className="wf-ver-badge-label">Nenhum outro workflow disponível</span>
                    : deps.length === 0
                      ? <span className="wf-ver-badge-label">Nenhum selecionado</span>
                      : <WfClampNamesLabel names={deps.map(d => d.wfName)} />}
                  <Icon name="chevron-right" size={14} className="wf-ver-badge-chevron" />
                </button>
              </div>
            </div>

            <div className="setting-divider" style={{ margin: "14px 0" }} />

            <div className="wf-trigger-orch-row">
              <span className="wf-trigger-orch-label">Desbloqueia</span>
              <div className="wf-trigger-orch-value">
                <button
                  type="button"
                  className="wf-ver-badge-btn"
                  disabled={allWorkflows.length === 0}
                  onClick={() => setEditingUnlocks(true)}
                >
                  {allWorkflows.length === 0
                    ? <span className="wf-ver-badge-label">Nenhum outro workflow disponível</span>
                    : unlocks.length === 0
                      ? <span className="wf-ver-badge-label">Nenhum selecionado</span>
                      : <WfClampNamesLabel names={unlocks.map(d => d.wfName)} />}
                  <Icon name="chevron-right" size={14} className="wf-ver-badge-chevron" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {editingDeps && (
        <WfWorkflowPickerDrawer
          title="Dependência"
          workflows={allWorkflows}
          selected={deps}
          onToggle={toggleDep}
          onClose={() => setEditingDeps(false)}
        />
      )}

      {editingUnlocks && (
        <WfWorkflowPickerDrawer
          title="Desbloqueia"
          workflows={allWorkflows}
          selected={unlocks}
          onToggle={toggleUnlock}
          onClose={() => setEditingUnlocks(false)}
        />
      )}
    </>
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
  const [title, setTitle] = useState(workflow.name);
  const [isDirty, setIsDirty] = useState(false);
  const [publishSignal, setPublishSignal] = useState(0);

  const markDirty = () => { setIsDirty(true); onDirtyChange?.(true); };
  const clearDirty = () => { setIsDirty(false); onDirtyChange?.(false); setPublishSignal(s => s + 1); };

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
        <WfEditableTitle value={title} onChange={(v) => { setTitle(v); markDirty(); }} />
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
                    publishSignal={publishSignal}
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
  const [title, setTitle] = useState(workflow.name);
  const [isDirty, setIsDirty] = useState(false);
  const [publishSignal, setPublishSignal] = useState(0);

  const markDirty = () => { setIsDirty(true); onDirtyChange?.(true); };
  const clearDirty = () => { setIsDirty(false); onDirtyChange?.(false); setPublishSignal(s => s + 1); };
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
          <WfEditableTitle value={title} onChange={(v) => { setTitle(v); markDirty(); }} />
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
                  publishSignal={publishSignal}
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

// Tabs of the stage config modal, in display order.
const STAGE_CONFIG_TABS = [
  { key: "geral",       label: "Geral" },
  { key: "suppliers",   label: "Suppliers" },
  { key: "mcpAiw",      label: "MCP e AIW" },
  { key: "integracoes", label: "Integrações" },
  { key: "checkpoints", label: "Checkpoints" },
];

// Checkpoints are read-only/fixed in this prototype — same list for every stage.
const STAGE_CHECKPOINTS = [{ id: "cp1", label: "Validação inicial", failAction: "Escalar para operador" }];

// Default per-stage config (Suppliers/MCP/Integrações tabs) before the operator opens
// a given stage for the first time — lazily replaced by initStageConfig(stage) on open.
const DEFAULT_STAGE_CONFIG = {
  agentEnabled: false,
  connectors: [],
  mcpEnabled: false, mcpServer: "",
  apiEnabled: false, apiUrl: "",
  scriptEnabled: false, scriptBody: "",
};

function initStageConfig(stage) {
  const seen = new Set();
  const connectors = (stage.tasks || [])
    .map(t => t.owner).filter(Boolean)
    .filter(o => { const ok = !seen.has(o); seen.add(o); return ok; })
    .map((o, i) => ({ id: `conn-${i}`, label: o, enabled: true }));
  return { ...DEFAULT_STAGE_CONFIG, connectors };
}

function getStageIcon(stage) {
  if (!stage) return null;
  if (stage.category === "PAYMENT")  return IconCurrencyCircleDollar;
  if (stage.category === "DELIVERY") return IconTruck;
  if (stage.category === "FULFILLMENT") {
    return stage.gate === "deliverable_ready" ? IconNewspaper : IconCube;
  }
  return null;
}

// Fictitious description shown read-only in the Geral tab — this prototype's data
// model has no persisted stage-level description field yet.
function getStageFakeDescription(stage) {
  if (!stage) return "";
  if (stage.category === "PAYMENT")
    return "Etapa responsável pela confirmação e captura do pagamento do pedido junto ao gateway, antes de liberar o fluxo de fulfillment.";
  if (stage.category === "DELIVERY")
    return "Etapa responsável pela entrega final do pedido ao cliente, incluindo o acompanhamento até a confirmação de recebimento.";
  if (stage.category === "FULFILLMENT")
    return "Etapa responsável pela separação, embalagem e preparação dos itens do pedido para envio.";
  return "Etapa configurada para este workflow, responsável pelas tarefas listadas em \"Tarefas vinculadas\".";
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
// Config now lives in a single shared <StageConfigModal> (rendered once by the
// parent) so the operator can jump between stages without closing the modal.
function StageHeaderCard({ stage, config, onOpenConfig, stageDragging, stageDragOver, onStageDragStart, onStageDragOver, onStageDrop, onStageDragEnd }) {
  const StageIcon = getStageIcon(stage);
  const cfg = config || DEFAULT_STAGE_CONFIG;
  const activeSuppliers  = cfg.connectors.filter(c => c.enabled).length;
  const activeMcpAgents  = (cfg.agentEnabled ? 1 : 0) + (cfg.mcpEnabled ? 1 : 0);

  return (
    <div
      className={`stage-flat-card${stageDragging ? " is-dragging" : ""}${stageDragOver ? " drag-over" : ""}`}
      draggable
      onDragStart={onStageDragStart}
      onDragOver={onStageDragOver}
      onDrop={onStageDrop}
      onDragEnd={onStageDragEnd}
    >
      <div
        className="stage-flat-card-head"
        onClick={() => onOpenConfig(stage)}
        title="Editar etapa"
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenConfig(stage); } }}
      >
        <div className="stage-flat-card-indicator" style={{ background: getStageColor(stage), color: getStageIconColor(stage) }}>
          {StageIcon && <StageIcon size={20} />}
        </div>
        <div className="stage-flat-card-info">
          <span className="stage-flat-card-name">{stage.name}</span>
          {/* Resumo sempre visível — sem precisar abrir o modal para ver a configuração básica */}
          <span className="stage-flat-card-sub">
            {activeSuppliers} suppliers ativos
            <span className="stage-flat-card-sub-dot">•</span>
            {stage.tasks.length} tarefas
            <span className="stage-flat-card-sub-dot">•</span>
            {activeMcpAgents} MCPs e Agentes ativos
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Stage config modal — shared across all stages, with a lateral tab to jump
// between them without closing (spec: navegar em todas as etapas e fazer mudanças) ──
function StageConfigModal({ stages, activeStageId, activeTab, onTabChange, onSelectStage, getConfig, updateConfig, onClose, onRemoveStage, onChanged }) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const activeIdx = stages.findIndex(s => s.id === activeStageId);
  const stage = stages[activeIdx];

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => { setConfirmRemove(false); }, [activeStageId, activeTab]);

  if (!stage) return null;

  const cfg = getConfig(stage.id);
  const mark = () => onChanged?.();
  const patch = (p) => updateConfig(stage.id, curr => ({ ...curr, ...(typeof p === "function" ? p(curr) : p) }));

  return ReactDOM.createPortal(
    <div
      className="stage-config-modal-backdrop"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="stage-config-modal" role="dialog" aria-modal="true" aria-label="Configurar etapas">
        <div className="stage-config-modal-head">
          <h2 className="stage-config-modal-title">Configurar etapas</h2>
          <SidebarTooltip label="Fechar" placement="top">
            <IconButton icon={<Icon name="x" size={18} />} label="Fechar" variant="tertiary" onClick={onClose} />
          </SidebarTooltip>
        </div>

        <div className="stage-config-modal-main">
          {/* Lateral: navegação entre todas as etapas do workflow, sem fechar o modal */}
          <div className="stage-config-modal-sidebar" role="tablist" aria-label="Etapas do workflow">
            {stages.map((s, i) => {
              const SIcon = getStageIcon(s);
              return (
                <button
                  key={s.id ?? i}
                  role="tab"
                  aria-selected={s.id === activeStageId}
                  className={`stage-config-modal-sidebar-item${s.id === activeStageId ? " active" : ""}`}
                  onClick={() => onSelectStage(s)}
                >
                  <span className="stage-config-modal-sidebar-icon" style={{ background: getStageColor(s), color: getStageIconColor(s) }}>
                    {SIcon && <SIcon size={13} />}
                  </span>
                  <span className="stage-config-modal-sidebar-name">{s.name}</span>
                </button>
              );
            })}
          </div>

          <div className="stage-config-modal-content">
            <div className="stage-config-modal-tabs" role="tablist">
              {STAGE_CONFIG_TABS.map(t => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={activeTab === t.key}
                  className={`stage-config-modal-tab${activeTab === t.key ? " active" : ""}`}
                  onClick={() => onTabChange(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="stage-config-modal-body">

              {/* ── Geral (somente leitura) ── */}
              {activeTab === "geral" && (
                <div className="stage-task-config">
                  <section className="wf-settings-card">
                    <div className="stage-config-modal-title-block">
                      <h3 className="stage-config-modal-stage-name">{stage.name}</h3>
                      <p className="stage-config-modal-stage-desc">{getStageFakeDescription(stage)}</p>
                    </div>
                  </section>

                  {/* ── Tarefas vinculadas ── */}
                  <section className="wf-settings-card">
                    <div className="wf-settings-title-row">
                      <h3 className="wf-settings-title">Tarefas vinculadas</h3>
                    </div>
                    {stage.tasks.length === 0 ? (
                      <span className="stage-connectors-empty">Nenhuma tarefa vinculada</span>
                    ) : (
                      <div className="stage-modal-linked-tasks">
                        {stage.tasks.map(t => (
                          <div key={t.id} className="stage-modal-linked-task-row">
                            <span className="stage-modal-linked-task-name">{t.name}</span>
                            <span className="field-value-tag">{t.type === "auto" ? "Automático" : "Manual"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* ── Remover etapa ── */}
                  <button
                    type="button"
                    className="stage-task-remove-btn"
                    onClick={() => setConfirmRemove(true)}
                  >
                    <IconTrash size={14} /> Remover etapa
                  </button>
                </div>
              )}

              {/* ── Suppliers ── */}
              {activeTab === "suppliers" && (
                <div className="stage-task-config">
                  <section className="wf-settings-card">
                    <div className="field-rows">
                      {cfg.connectors.length === 0 && <span className="stage-connectors-empty">Nenhum conector configurado</span>}
                      {cfg.connectors.map(conn => (
                        <div key={conn.id} className="field-row">
                          <span className="field-label">{conn.label}</span>
                          <button className={`aiw-toggle ${conn.enabled ? "on" : ""}`}
                            onClick={() => { patch(c => ({ connectors: c.connectors.map(x => x.id === conn.id ? { ...x, enabled: !x.enabled } : x) })); mark(); }}>
                            <span className="aiw-toggle-knob" />
                          </button>
                          <Actions><CiteBtn text={`[Conector ${conn.label}: ${conn.enabled ? "ativo" : "inativo"}]`} /></Actions>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* ── MCP e AIW ── */}
              {activeTab === "mcpAiw" && (
                <div className="stage-task-config">
                  <section className="wf-settings-card">
                    <div className="field-rows">
                      <div className="field-row">
                        <span className="field-label">Agente AI</span>
                        <button className={`aiw-toggle ${cfg.agentEnabled ? "on" : ""}`}
                          onClick={() => { patch({ agentEnabled: !cfg.agentEnabled }); mark(); }}>
                          <span className="aiw-toggle-knob" />
                        </button>
                        <Actions><CiteBtn text={`[Agente AI: ${cfg.agentEnabled ? "ativo" : "inativo"}]`} /></Actions>
                      </div>
                      <div className="field-row">
                        <span className="field-label">Servidor MCP</span>
                        <button className={`aiw-toggle ${cfg.mcpEnabled ? "on" : ""}`} onClick={() => { patch({ mcpEnabled: !cfg.mcpEnabled }); mark(); }}>
                          <span className="aiw-toggle-knob" />
                        </button>
                        <Actions><CiteBtn text={`[Servidor MCP: ${cfg.mcpEnabled ? "ativado" : "desativado"}]`} /></Actions>
                      </div>
                      {cfg.mcpEnabled && <InlineField label="Endereço MCP" value={cfg.mcpServer} onChange={v => { patch({ mcpServer: v }); mark(); }} placeholder="Nome do servidor MCP" />}
                    </div>
                  </section>
                </div>
              )}

              {/* ── Integrações ── */}
              {activeTab === "integracoes" && (
                <div className="stage-task-config">
                  <section className="wf-settings-card">
                    <div className="field-rows">
                      <div className="field-row">
                        <span className="field-label">API Externa</span>
                        <button className={`aiw-toggle ${cfg.apiEnabled ? "on" : ""}`} onClick={() => { patch({ apiEnabled: !cfg.apiEnabled }); mark(); }}>
                          <span className="aiw-toggle-knob" />
                        </button>
                        <Actions><CiteBtn text={`[API Externa: ${cfg.apiEnabled ? "ativada" : "desativada"}]`} /></Actions>
                      </div>
                      {cfg.apiEnabled && <InlineField label="URL da API" value={cfg.apiUrl} onChange={v => { patch({ apiUrl: v }); mark(); }} placeholder="https://..." />}
                      <div className="field-row">
                        <span className="field-label">Script customizado</span>
                        <button className={`aiw-toggle ${cfg.scriptEnabled ? "on" : ""}`} onClick={() => { patch({ scriptEnabled: !cfg.scriptEnabled }); mark(); }}>
                          <span className="aiw-toggle-knob" />
                        </button>
                        <Actions><CiteBtn text={`[Script customizado: ${cfg.scriptEnabled ? "ativado" : "desativado"}]`} /></Actions>
                      </div>
                      {cfg.scriptEnabled && (
                        <div className="field-row field-row--textarea">
                          <span className="field-label">Script</span>
                          <textarea className="stage-prop-input" value={cfg.scriptBody} rows={4}
                            onChange={e => { patch({ scriptBody: e.target.value }); mark(); }}
                            placeholder={"// Lógica customizada em JavaScript\nreturn { status: 'completed' };"}
                            style={{ fontFamily: "monospace", fontSize: 12, resize: "vertical" }} />
                          <Actions><CiteBtn text={`[Script: ${cfg.scriptBody ? "definido" : "vazio"}]`} /></Actions>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {/* ── Checkpoints ── */}
              {activeTab === "checkpoints" && (
                <div className="stage-task-config">
                  <section className="wf-settings-card">
                    <div className="field-rows">
                      {STAGE_CHECKPOINTS.map(cp =>
                        <div key={cp.id} className="field-row">
                          <span className="field-label">{cp.label}</span>
                          <span className="field-value-pill disabled">{cp.failAction}</span>
                          <Actions><CiteBtn text={`[Checkpoint: ${cp.label}]`} /></Actions>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>

        {confirmRemove ? (
          <div className="stage-task-config-footer">
            <span className="stage-task-remove-confirm-text">Remover etapa permanentemente?</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setConfirmRemove(false)}>Cancelar</button>
            <button className="btn btn-sm btn-danger" onClick={() => { onRemoveStage(stage.id); onClose(); }}>
              <Icon name="x" size={12} /> Remover
            </button>
          </div>
        ) : (
          <div className="stage-config-modal-footer">
            <button className="btn btn-sm btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-sm btn-primary" onClick={() => { mark(); onClose(); }}>Salvar</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Flat detail view: stages as cards on top, all tasks in one list below ─────
function WorkflowDetailViewFlat({ workflow, onOpenTask, onOpenStage, onOpenSettings, detailActionsRef, onDirtyChange }) {
  const notifyTaskRemoved  = React.useContext(ChatTaskRemovedContext);
  const chatAddingTask     = React.useContext(ChatAddingTaskContext);
  const chatStartAddTask   = React.useContext(ChatStartAddTaskContext);
  const chatStartAddStage  = React.useContext(ChatStartAddStageContext);

  const [stages, setStages] = useState(() => workflow.stages);
  const [title, setTitle] = useState(workflow.name);

  // Per-stage config (Suppliers/MCP/Integrações) for the shared <StageConfigModal>,
  // keyed by stage id — lazily initialized the first time a stage's modal opens.
  const [stageConfigs, setStageConfigs] = useState({});
  const [openStageId, setOpenStageId] = useState(null);
  const [stageModalTab, setStageModalTab] = useState("geral");

  const getStageConfig = (stageId) => stageConfigs[stageId] || DEFAULT_STAGE_CONFIG;
  const updateStageConfig = (stageId, updater) => {
    setStageConfigs(prev => {
      const current = prev[stageId] || initStageConfig(stages.find(s => s.id === stageId) || { tasks: [] });
      const next = typeof updater === "function" ? updater(current) : { ...current, ...updater };
      return { ...prev, [stageId]: next };
    });
  };
  const ensureStageConfig = (stage) => {
    setStageConfigs(prev => prev[stage.id] ? prev : { ...prev, [stage.id]: initStageConfig(stage) });
  };
  // Opening from a stage card resets to the first tab; switching stages via the
  // modal's own lateral nav keeps whichever tab the operator was already on.
  const openStageConfig = (stage) => {
    ensureStageConfig(stage);
    setOpenStageId(stage.id);
    setStageModalTab("geral");
  };
  const selectStageInModal = (stage) => {
    ensureStageConfig(stage);
    setOpenStageId(stage.id);
  };
  const removeStageById = (stageId) => {
    const idx = stages.findIndex(s => s.id === stageId);
    if (idx !== -1) removeStage(idx);
  };

  // Flat task list: each entry knows its source stage index (used for the
  // classification indicator). The visual order normally follows stage order,
  // but a workflow may define `flatOrder` (task ids) to show a task in a
  // different position than its stage grouping — e.g. a payment capture that
  // only happens after fulfillment is ready, while still belonging to the
  // payment stage for gate/classification purposes.
  const [flatTasks, setFlatTasks] = useState(() => {
    const natural = workflow.stages.flatMap((stage, si) =>
      stage.tasks.map(task => ({ task, stageIdx: si }))
    );
    if (!workflow.flatOrder) return natural;
    const byId = new Map(natural.map(ft => [ft.task.id, ft]));
    const ordered = workflow.flatOrder.map(id => byId.get(id)).filter(Boolean);
    natural.forEach(ft => { if (!workflow.flatOrder.includes(ft.task.id)) ordered.push(ft); });
    return ordered;
  });

  const [publishSignal, setPublishSignal] = useState(0);
  const markDirty = () => onDirtyChange?.(true);
  const clearDirty = () => { onDirtyChange?.(false); setPublishSignal(s => s + 1); };

  // "Editar ordem" — arrastar/soltar tarefas só fica disponível nesse modo;
  // na visualização normal a alça de arrasto nem é renderizada.
  const [reorderMode, setReorderMode] = useState(false);

  const removeStage = (si) => {
    setStages(prev => {
      const removedId = prev[si]?.id;
      if (removedId) setStageConfigs(cfgs => { const { [removedId]: _drop, ...rest } = cfgs; return rest; });
      return prev.filter((_, i) => i !== si);
    });
    markDirty();
  };

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
        setStages(prev => [...prev, { id: "s" + Date.now(), name: stageName, tasks: [] }]);
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
          <WfEditableTitle value={title} onChange={(v) => { setTitle(v); markDirty(); }} />
        </div>
        {(workflow.version || workflow.wfStatus) && <WfMetaSection workflow={workflow} onOpenSettings={onOpenSettings} />}
      </SectionBlock>

      <WfSettingsInline workflow={workflow} onDirtyChange={onDirtyChange} />

      {/* ── Tasks ── */}
      <SectionBlock
        title="Tarefas"
        actions={
          <>
            <SidebarTooltip label={reorderMode ? "Concluir" : "Editar ordem"} placement="top">
              <IconButton
                icon={<IconReorder size={16} />}
                label={reorderMode ? "Concluir" : "Editar ordem"}
                variant={reorderMode ? "primary" : "tertiary"}
                size="medium"
                onClick={() => setReorderMode(v => !v)}
              />
            </SidebarTooltip>
            <SidebarTooltip label="Adicionar tarefa" placement="top">
              <IconButton
                icon={<Icon name="plus" size={16} />}
                label="Adicionar tarefa"
                variant="tertiary"
                size="medium"
                disabled={chatAddingTask || reorderMode}
                onClick={() => chatStartAddTask?.(stages[0]?.name)}
              />
            </SidebarTooltip>
          </>
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
                    stage={stage}
                    workflow={workflow}
                    idx={idx}
                    isNew={newlyAddedId === task.id}
                    reorderMode={reorderMode}
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
                    publishSignal={publishSignal}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </SectionBlock>

      {/* ── Stages ── */}
      <SectionBlock
        title="Etapas"
        actions={
          <SidebarTooltip label="Adicionar etapa" placement="top">
            <IconButton
              icon={<Icon name="plus" size={16} />}
              label="Adicionar etapa"
              variant="tertiary"
              size="medium"
              onClick={() => chatStartAddStage?.()}
            />
          </SidebarTooltip>
        }
      >
        <div className="wf-flat-stages">
          {stages.map((stage, si) => (
            <React.Fragment key={stage.id ?? si}>
              <StageHeaderCard
                stage={stage}
                config={getStageConfig(stage.id)}
                onOpenConfig={openStageConfig}
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

      {openStageId && (
        <StageConfigModal
          stages={stages}
          activeStageId={openStageId}
          activeTab={stageModalTab}
          onTabChange={setStageModalTab}
          onSelectStage={selectStageInModal}
          getConfig={getStageConfig}
          updateConfig={updateStageConfig}
          onClose={() => setOpenStageId(null)}
          onRemoveStage={removeStageById}
          onChanged={markDirty}
        />
      )}
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

  const hasBack = showWizard || isDetail || isTask || isStage || isSettings;
  const headerTitle = (isDetail || isTask || isStage || isSettings)
    ? (workflow?.name || "Configurações de Workflow")
    : "Configurações de Workflow";

  return (
    <div className="detail-panel">
      <div className="detail-head canvas-topbar" data-sl-canvas-tool-topbar="">
        {hasBack ? (
          <button className="canvas-topbar-back" onClick={back} title="Voltar">
            <Icon name="chevron-left" size={16} />
            <span>Voltar</span>
          </button>
        ) : (
          <span className="canvas-topbar-title">{headerTitle}</span>
        )}
        <div className="detail-head-right">
          {(isDetail || isTask || isStage || isSettings) && detailHasChanges &&
            <button data-sl-button data-variant="primary" data-size="small" data-has-label onClick={() => {
              detailActionsRef.current?.save?.();
              setDetailHasChanges(false);
              if (workflow) {
                const now = new Date().toISOString();
                workflow.publishedAt = now;
                workflow.publishedBy = CURRENT_USER_EMAIL;
                workflow.lastEditedAt = now;
                workflow.lastEditedBy = CURRENT_USER_EMAIL;
                workflow.wfStatus = "published";
              }
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
              // Novo layout de card v2 (Card de Workflow 7b): resumo em 4
              // faixas — cabeçalho (nome + pill de orquestração + pill de
              // status), explicação do gatilho em uma frase, chip com o valor
              // do gatilho (com +N para múltiplas origens) e rodapé com
              // Tarefas / Automação / metadata de publicação. As tarefas
              // deixaram de ser listadas horizontalmente — o operador entra
              // no detalhe para ver a sequência completa.
              const total     = w.stages.reduce((s, st) => s + st.tasks.length, 0);
              const autoCount = w.stages.reduce((s, st) => s + st.tasks.filter(t => t.type === "auto").length, 0);
              const orch      = wfOrchMeta(w);
              const status    = wfStatusPill(w);
              const trig      = wfTriggerDisplay(w);
              const foot      = wfFootMeta(w);
              return (
                <button
                  key={w.id}
                  type="button"
                  className="wf-list-card wf-list-card--v2"
                  onClick={() => setMode({ kind: "detail", workflowId: w.id })}
                >
                  <div className="wf-card-head">
                    <span className="wf-card-name">{w.name}</span>
                    <span className="wf-card-orch-pill" style={{ background: orch.bg, color: orch.fg }}>
                      {orch.label}
                    </span>
                    <span className="wf-card-status-pill" style={{ background: status.bg, color: status.fg }}>
                      {status.label}
                    </span>
                  </div>

                  {w.desc && <span className="wf-card-trigger-explain">{w.desc}</span>}

                  <div className="wf-card-trigger-chip">
                    <span className="wf-card-trigger-label">Gatilho:</span>
                    {trig.typeLabel && (
                      <span className="wf-card-trigger-type">{trig.typeLabel}</span>
                    )}
                    {trig.hasTrigger ? (
                      <TriggerValueWithOverflow value={trig.value} moreCount={trig.moreCount} />
                    ) : (
                      <span className="wf-card-trigger-empty">ainda não configurado</span>
                    )}
                  </div>

                  <div className="wf-card-foot">
                    <span className="wf-card-foot-item">Tarefas <b>{total}</b></span>
                    <span className="wf-card-foot-sep">·</span>
                    <span className="wf-card-foot-item">Automação <b>{autoCount}/{total}</b></span>
                    {foot && <>
                      <span className="wf-card-foot-sep">·</span>
                      <span className="wf-card-foot-meta">{foot}</span>
                    </>}
                    <span className="wf-card-foot-spacer" />
                    <Icon name="chevron-right" size={20} className="wf-card-foot-chevron" />
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
      title: "Gerenciador de Workflows",
      placeholder: "Criar workflow, editar, publicar...",
      chips: [
        { icon: "plus",    label: "Novo workflow"             },
        { icon: "edit",    label: "Editar workflow existente" },
        { icon: "layers",  label: "Editar workflows em massa" },
      ],
      messages: [
        { from: "agent", text: "Olá! Sou o **Order Management Assistant**.\n\nPosso ajudar a criar, editar e publicar workflows no Gerenciador de Workflows." },
        { from: "agent", text: `Há ${AIWData.workflows.length} workflows configurados. Use os atalhos abaixo ou escreva o que precisa.` },
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

  // Fluxo A2 — "Editar workflow existente" draft
  const editExistingDraftRef = useRef(null);

  // Fluxo G — "Editar workflows em massa" draft
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
      } else if (/novo workflow|nova experiência|criar|new workflow|começar workflow|\+ novo/.test(lower)) {
        startWfDraft();
      } else if (/editar workflow existente|editar experiência existente|editar workflow|editar experiência/.test(lower)) {
        startEditExisting();
      } else if (/em massa|editar workflows em massa|editar experiências em massa/.test(lower)) {
        startBulkEdit();
      } else if (/listar|mostrar|quais/.test(lower)) {
        const names = AIWData.workflows.map(w => `${w.icon} ${w.name}`).join(", ");
        agentSay({ from: "agent", text: `Workflows configurados: ${names}. Clique em qualquer um no canvas para ver detalhes.` });
      } else if (/o que posso fazer|o que você faz|posso fazer|ajuda/.test(lower)) {
        agentSay({
          from: "agent",
          text: "Posso te ajudar a:\n• Criar workflows do zero ou copiando um existente\n• Adicionar, editar ou remover etapas e tarefas\n• Configurar execução, visibilidade e responsável de cada tarefa\n• Publicar, atualizar ou arquivar workflows\n• Editar múltiplos workflows em massa",
          quickReplies: ["Novo workflow", "Editar workflow existente"],
        });
      } else {
        agentSay({
          from: "agent",
          text: "Não entendi. O que você quer fazer?",
          quickReplies: ["Novo workflow", "Editar workflow existente", "Editar workflows em massa", "O que posso fazer?"],
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

  // ── Fluxo A — Novo workflow ────────────────────────────────────────────────

  function startWfDraft() {
    const draft = { step: "name", name: "", base: "blank", products: null, parsedStages: null, sourceStages: null, sourceName: null };
    setWfDraft(draft);
    agentSay({
      from: "agent",
      text: "Qual é o nome do novo workflow?",
    });
  }

  function handleDraftStep(originalText, lower) {
    const draft = wfDraftRef.current;
    if (!draft) return;

    // Global escape for Fluxo A
    if (/^(cancelar|sair|parar|desistir)/.test(lower)) {
      setWfDraft(null);
      agentSay({ from: "agent", text: "Tudo bem. Quando quiser criar um novo workflow, é só falar.", quickReplies: ["Novo workflow"] });
      return;
    }

    if (draft.step === "name") {
      const name = originalText.trim();
      setWfDraft(d => ({ ...d, step: "base", name }));
      agentSay({
        from: "agent",
        text: `**"${name}"** — ótimo nome! Quer criar do zero ou usar um workflow existente como base?`,
        quickReplies: ["Do zero", "Copiar existente"],
      });

    } else if (draft.step === "base") {
      const isCopy = /copiar|existente|base|cópia/.test(lower);
      if (isCopy) {
        const sources = AIWData.workflows.map(w => w.name);
        setWfDraft(d => ({ ...d, step: "pick-source" }));
        agentSay({
          from: "agent",
          text: "Qual workflow você quer usar como base?",
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
          text: `**"${found.name}"** selecionado como base — etapas e tarefas serão copiadas.\n\nQuais produtos ou categorias este workflow atende?`,
          quickReplies: ["Todos os produtos", "Por categoria", "Digitar"],
        });
      } else {
        agentSay({
          from: "agent",
          text: "Não encontrei esse workflow. Qual deles você quer usar como base?",
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
        title: "Novo workflow",
        heading: currentDraft.name,
        fields: [
          { label: "Base",     value: baseLabel },
          { label: "Produtos", value: currentDraft.products || "Todos os produtos" },
          { label: "Etapas",   value: String(currentDraft.parsedStages.length), tag: true },
          { label: "Tarefas",  value: String(totalTasks), tag: true },
        ],
        applyLabel: "Criar workflow",
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
            text: `✓ Workflow **"${currentDraft.name}"** criado com ${stages.length} etapa${stages.length > 1 ? "s" : ""}. Revise os detalhes no canvas.`,
            quickReplies: ["+ Adicionar tarefa", "Publicar"],
          }];
          setMode({ kind: "detail", workflowId: newWf.id });
        },
        onDismiss: () => {
          setWfDraft(null);
          agentSay({ from: "agent", text: "Criação cancelada.", quickReplies: ["Novo workflow"] });
        },
      });
    }
  }

  // ── Fluxo A2 — Editar workflow existente ───────────────────────────────────

  function startEditExisting() {
    editExistingDraftRef.current = { step: "pick" };
    agentSay({
      from: "agent",
      text: "Qual workflow você quer editar?",
      quickReplies: AIWData.workflows.map(w => w.name),
    });
  }

  function handleEditExistingStep(text, lower) {
    const draft = editExistingDraftRef.current;
    if (!draft) return;

    if (/^(cancelar|sair|parar|desistir)/.test(lower)) {
      editExistingDraftRef.current = null;
      agentSay({ from: "agent", text: "Tudo bem.", quickReplies: ["Novo workflow", "Editar workflow existente"] });
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
          text: "Não encontrei esse workflow. Qual deles você quer editar?",
          quickReplies: AIWData.workflows.map(w => w.name),
        });
      }
    }
  }

  // ── Fluxo G — Editar workflows em massa ────────────────────────────────────

  function startBulkEdit() {
    const activeWfs = AIWData.workflows.filter(w => w.status !== "archived");
    bulkDraftRef.current = { step: "select", selectedNames: [], remainingNames: activeWfs.map(w => w.name) };
    agentSay({
      from: "agent",
      text: "Quais workflows você quer editar? Selecione um a um e confirme ao final.",
      quickReplies: [...activeWfs.map(w => w.name), "Pronto →"],
    });
  }

  function handleBulkEditStep(text, lower) {
    const draft = bulkDraftRef.current;
    if (!draft) return;

    if (/^(cancelar|sair|parar|desistir)/.test(lower)) {
      bulkDraftRef.current = null;
      agentSay({ from: "agent", text: "Tudo bem.", quickReplies: ["Editar workflows em massa"] });
      return;
    }

    if (draft.step === "select") {
      if (/^pronto/.test(lower)) {
        if (draft.selectedNames.length === 0) {
          agentSay({ from: "agent", text: "Selecione ao menos um workflow primeiro.", quickReplies: [...draft.remainingNames, "Pronto →"] });
          return;
        }
        bulkDraftRef.current = { ...draft, step: "action" };
        const listText = draft.selectedNames.join(", ");
        agentSay({
          from: "agent",
          text: `**${draft.selectedNames.length}** workflow${draft.selectedNames.length > 1 ? "s" : ""} selecionado${draft.selectedNames.length > 1 ? "s" : ""}: ${listText}.\n\nO que você quer fazer com eles?`,
          quickReplies: ["Publicar todos", "Arquivar todos", "Ativar Agente AI", "Desativar Agente AI"],
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
          text: `**"${found.name}"** adicionado. ${newSelected.length} selecionado${newSelected.length > 1 ? "s" : ""}: ${selText}.\n\nAdicione mais ou confirme.`,
          quickReplies: newRemaining.length > 0 ? [...newRemaining, "Pronto →"] : ["Pronto →"],
        });
      } else if (found && draft.selectedNames.includes(found.name)) {
        agentSay({ from: "agent", text: `**"${found.name}"** já está na seleção.`, quickReplies: [...draft.remainingNames, "Pronto →"] });
      } else {
        agentSay({ from: "agent", text: "Não encontrei esse workflow.", quickReplies: [...draft.remainingNames, "Pronto →"] });
      }

    } else if (draft.step === "action") {
      let action = null;
      if (/publicar/.test(lower)) action = { label: "Publicar", newStatus: "published" };
      else if (/arquivar/.test(lower)) action = { label: "Arquivar", newStatus: "archived" };
      else if (/ativar.*agente|agente.*ativar/.test(lower)) action = { label: "Ativar Agente AI", newStatus: null, aiOrch: true };
      else if (/desativar.*agente|agente.*desativar/.test(lower)) action = { label: "Desativar Agente AI", newStatus: null, aiOrch: false };

      if (!action) {
        agentSay({ from: "agent", text: "Não entendi a ação. O que quer fazer com os workflows selecionados?", quickReplies: ["Publicar todos", "Arquivar todos", "Ativar Agente AI", "Desativar Agente AI"] });
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
          { label: "Workflows", value: currentDraft.selectedNames.join(", ") },
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
            { from: "agent", text: `✓ **${action.label}** aplicado em **${count}** workflow${count > 1 ? "s" : ""}.`, quickReplies: ["Editar workflows em massa", "Pronto"] },
          ]);
        },
        onDismiss: () => {
          bulkDraftRef.current = null;
          agentSay({ from: "agent", text: "Operação cancelada.", quickReplies: ["Editar workflows em massa"] });
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
      <ResizableSplit screenLabel="03 Gerenciador de Workflows" initialWidth={400}>
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
