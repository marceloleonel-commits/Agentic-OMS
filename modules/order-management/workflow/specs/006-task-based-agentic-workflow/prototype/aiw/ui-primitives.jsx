/* global React, Icon */
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

window.SevPill      = SevPill;
window.PersonAvatar = PersonAvatar;
window.Toggle       = Toggle;
window.Slider       = Slider;
window.Dropdown     = Dropdown;
window.IconButton   = IconButton;
