/* global React, Icon */
// Shared UI primitives used across multiple views.
// Exposed on window so any JSX file loaded after this one can reference them directly.

const { useState, useEffect, useRef } = React;

/* ── Severity pill ──────────────────────────────────────────────────────── */
function SevPill({ level }) {
  const map = { high: "Alta", medium: "Média", low: "Baixa" };
  return (
    <span className={`sev sev-${level}`}>
      {level === "high" && <span className="dot" />}
      {map[level]}
    </span>
  );
}

/* ── Person / agent avatar ──────────────────────────────────────────────── */
function PersonAvatar({ initial, agent }) {
  if (agent) {
    return <span className="agent-avatar-mini" title="Agent"><Icon name="sparkle" size={12} /></span>;
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
