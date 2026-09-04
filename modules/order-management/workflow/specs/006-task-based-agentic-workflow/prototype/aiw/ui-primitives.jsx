/* global React, Icon, MSIcon */
// Shared UI primitives used across multiple views.
// Exposed on window so any JSX file loaded after this one can reference them directly.

const { useState, useEffect, useRef } = React;

/* ── Severity pill ──────────────────────────────────────────────────────── */
// Usa o mesmo CriticalityTag da tabela de iniciativas na Home
// (`[data-sl-criticality-tag]`) para manter um único estilo de tag em todos
// os lugares onde uma severidade é exibida.
function SevPill({ level }) {
  const map = { high: "Alta", medium: "Média", low: "Baixa" };
  return (
    <span data-sl-criticality-tag="" data-priority={level}>
      {level === "high" && <span data-sl-status="dot" aria-hidden />}
      {map[level] || level}
    </span>
  );
}

/* ── Person / agent avatar ──────────────────────────────────────────────────
   `name` é o nome exibido do agente: quando ele tem retrato próprio em
   AIWData.AGENT_AVATARS, é esse retrato que entra no lugar do sparkle. */
function PersonAvatar({ initial, agent, name }) {
  if (agent) {
    const portrait = name && ((window.AIWData && window.AIWData.AGENT_AVATARS) || {})[name];
    if (portrait) {
      return (
        <span className="agent-avatar-mini agent-avatar-mini--img" title={name}>
          <img src={portrait} alt="" />
        </span>
      );
    }
    return <span className="agent-avatar-mini" title={name || "Agent"}><Icon name="sparkle" size={12} /></span>;
  }
  return <span className="person-avatar">{initial}</span>;
}

/* ── Toggle (on/off switch) ─────────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button className={`aiw-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="aiw-toggle-knob" />
    </button>
  );
}

/* ── Slider (range input with fill track) ───────────────────────────────── */
function Slider({ value, onChange, min = 0, max = 100, suffix = "%" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="aiw-slider">
      <div className="aiw-slider-track">
        <div className="aiw-slider-fill" style={{ width: pct + "%" }} />
        <input type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))} />
      </div>
      <span className="aiw-slider-value">{value} {suffix}</span>
    </div>
  );
}

/* ── IconButton (Shoreline-compatible icon-only button) ─────────────────── */
// forwardRef so it can be wrapped in <SidebarTooltip> (which clones its child
// and attaches a ref to measure position).
const IconButton = React.forwardRef(function IconButton({ icon, label, variant = "tertiary", size = "large", onClick, className, disabled, ...rest }, ref) {
  return (
    <button
      ref={ref}
      data-sl-button="true"
      data-icon-button="true"
      data-variant={variant}
      data-size={size}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {icon}
    </button>
  );
});

/* ── Dropdown (click-outside aware menu) ────────────────────────────────── */
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

/* ── CanvasTopbar (handoff-topbar-canvas §1) ────────────────────────────────
   Topbar único de todos os canvases. Substitui os cinco cabeçalhos que
   existiam antes (TaskCanvas, order-detail, WorkflowBoard, Políticas e o
   `.canvas-topbar-title` de cada um).

   Ordem fixa da esquerda para a direita (§1.2):
     [arrow_back] [chip ID] [› subview] ……espaço…… [CTA] | [chat] [close]

   O nome do canvas não aparece aqui (§1.3): o h1 do corpo é o único título. */
function CanvasTopbar({
  onBack,
  backLabel = "Voltar",
  id,
  onResetToMain,
  subTitle,
  cta,
  chatOpen,
  onToggleChat,
  chatPending,
  onCloseCanvas,
}) {
  /* Subview = existe um caminho de volta ao canvas principal. É esse callback
     que transforma o chip do ID em botão. */
  const inSub = !!onResetToMain;
  const chatTitle = chatPending && !chatOpen
    ? "Pergunta pendente no chat"
    : (chatOpen ? "Fechar chat" : "Abrir chat");

  return (
    <div className="detail-head canvas-topbar" data-sl-canvas-tool-topbar="">
      <button
        type="button"
        className="canvas-topbar-icon"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
      >
        <MSIcon name="arrow_back" size={20} />
      </button>

      {id && (inSub ? (
        <button
          type="button"
          className="canvas-topbar-chip canvas-topbar-chip--btn"
          onClick={onResetToMain}
          title={`Voltar para ${id}`}
        >
          {id}
        </button>
      ) : (
        <span className="canvas-topbar-chip">{id}</span>
      ))}

      {inSub && subTitle && (
        <>
          <span className="canvas-topbar-sep" aria-hidden>
            <MSIcon name="chevron_right" size={18} />
          </span>
          <span className="canvas-topbar-subtitle">{subTitle}</span>
        </>
      )}

      <span className="canvas-topbar-spacer" />

      {cta && (
        <>
          <button
            type="button"
            className="canvas-topbar-cta"
            data-sl-button
            data-has-label
            data-variant={cta.variant || "secondary"}
            onClick={cta.onClick}
          >
            {cta.label}
          </button>
          <span className="canvas-topbar-divider" aria-hidden />
        </>
      )}

      {onToggleChat && (
        <button
          type="button"
          className={`canvas-topbar-icon${chatOpen ? " active" : ""}${chatPending && !chatOpen ? " canvas-topbar-icon--alert" : ""}`}
          onClick={onToggleChat}
          aria-label={chatPending && !chatOpen ? "Abrir chat — pergunta pendente" : chatTitle}
          title={chatTitle}
        >
          <MSIcon name="chat_bubble_outline" size={20} />
        </button>
      )}

      <button
        type="button"
        className="canvas-topbar-icon"
        onClick={onCloseCanvas}
        aria-label="Fechar canvas"
        title="Fechar canvas"
      >
        <MSIcon name="close" size={20} />
      </button>
    </div>
  );
}

/* ── CanvasBackBar (handoff-topbar-canvas §1.4) ─────────────────────────────
   Volta da subview: vive no corpo (sticky no topo do `.detail-body`), não no
   topbar. Terciário de F1 com chevron + chip do ID + nome do destino. */
function CanvasBackBar({ id, label, onClick }) {
  return (
    <div data-sl-canvas-tool-back-wrap="">
      <button
        type="button"
        onClick={onClick}
        data-sl-canvas-tool-back=""
        aria-label={`Voltar para ${label || id}`}
      >
        <MSIcon name="chevron_left" size={18} />
        {id && <span className="canvas-back-chip">{id}</span>}
        {label && <span className="canvas-back-label">{label}</span>}
      </button>
    </div>
  );
}

window.SevPill      = SevPill;
window.PersonAvatar = PersonAvatar;
window.Toggle       = Toggle;
window.Slider       = Slider;
window.Dropdown     = Dropdown;
window.IconButton   = IconButton;
window.CanvasTopbar = CanvasTopbar;
window.CanvasBackBar = CanvasBackBar;
