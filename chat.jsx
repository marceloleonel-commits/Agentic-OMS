/* global React, Icon */
const { useState, useRef, useEffect, useCallback } = React;

/**
 * ComposerAddButton — the "+" button that opens the v3 "add files / add context" menu.
 * Ghost icon button (v3 IconButton variant="ghost") + popover menu (v3 Dropdown).
 */
function ComposerAddButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="composer-add-wrap" ref={wrapRef}>
      {open && (
        <div className="composer-add-menu" role="menu">
          <button className="composer-add-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="doc" size={16} />
            <span>Add files</span>
          </button>
          <button className="composer-add-menu-item" role="menuitem" onClick={() => setOpen(false)}>
            <Icon name="at" size={16} />
            <span>Add context</span>
          </button>
        </div>
      )}
      <button
        type="button"
        className={`composer-add-btn${open ? " open" : ""}`}
        title="Add"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}

/**
 * MessageComposer
 * layout="inline"  → pill único (+ | textarea | →)               [default]
 * layout="stacked" → textarea em cima + toolbar abaixo (+ | agent | →)
 */
const MessageComposer = React.forwardRef(function MessageComposer({
  placeholder = "Message VTEX My Assistant...",
  onSend,
  agent = "VTEX My Assistant",
  layout = "inline",
}, ref) {
  const [v, setV] = useState("");
  const [citations, setCitations] = useState([]);
  const textareaRef = useRef(null);

  React.useImperativeHandle(ref, () => ({
    append: (text) => {
      setV(prev => prev + (prev.trim() ? " " : "") + text);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    cite: (text) => {
      setCitations(prev => prev.includes(text) ? prev : [...prev, text]);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
  }));

  const removeCitation = (text) => setCitations(prev => prev.filter(c => c !== text));

  const submit = () => {
    if (!v.trim() && !citations.length) return;
    const prefix = citations.join(" ");
    const full = [prefix, v.trim()].filter(Boolean).join(" ");
    onSend && onSend(full);
    setV("");
    setCitations([]);
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
  };

  const handleChange = (e) => {
    setV(e.target.value);
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, layout === "stacked" ? 180 : 120) + "px"; }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  const isActive = v.trim().length > 0 || citations.length > 0;

  /* ── Citações (shared between both layouts) ── */
  const citationsEl = citations.length > 0 && (
    <div className="composer-citations">
      {citations.map((c, i) => (
        <span key={i} className="composer-citation">
          <span className="composer-citation-text">{c.replace(/^\[|\]$/g, "")}</span>
          <button className="composer-citation-close" title="Remover citação" onClick={() => removeCitation(c)}>
            <Icon name="x" size={10} />
          </button>
        </span>
      ))}
    </div>
  );

  if (layout === "stacked") {
    return (
      <div className="composer composer--stacked">
        {citationsEl}
        <div className="composer-stacked-shell">
          <div className="composer-stacked-input">
            <textarea
              ref={textareaRef}
              rows={2}
              placeholder={placeholder}
              value={v}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="composer-stacked-toolbar">
            <div className="composer-stacked-toolbar-left">
              <ComposerAddButton />
              <span className="composer-agent-pill">
                <Icon name="sparkle" size={13} />
                <span className="composer-agent-label">{agent}</span>
              </span>
            </div>
            <div className="composer-stacked-toolbar-right">
              <button className={`send-btn${isActive ? " active" : ""}`} onClick={submit} title="Enviar">
                <Icon name="arrow-up" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Inline layout (default) ── */
  return (
    <div className="composer">
      {citationsEl}
      <div className="composer-pill">
        <ComposerAddButton />
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={v}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <button className={`send-btn${isActive ? " active" : ""}`} onClick={submit} title="Enviar">
          <Icon name="arrow-up" size={16} />
        </button>
      </div>
    </div>
  );
});

/*
  Inline markdown renderer — supports **bold**, *italic*, `code`, and \n line breaks.
  Returns an array of React nodes (safe — no dangerouslySetInnerHTML).
*/
function renderMd(text) {
  if (!text) return null;
  // Split on **bold**, *italic*, `code`, keeping delimiters
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  const nodes = [];
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(<strong key={i}>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith("*") && part.endsWith("*")) {
      nodes.push(<em key={i}>{part.slice(1, -1)}</em>);
    } else if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(<code key={i}>{part.slice(1, -1)}</code>);
    } else {
      // Render \n as <br>
      const lines = part.split("\n");
      lines.forEach((line, j) => {
        if (j > 0) nodes.push(<br key={`${i}-br-${j}`} />);
        if (line) nodes.push(line);
      });
    }
  });
  return nodes;
}

/* Reusable Chat panel.
   Supports two modes:
   - Uncontrolled: uses local state (initialMessages prop)
   - Controlled: messages + onSend props provided externally

   Rich message types (agent messages only):
   - { from:"agent", text }                     plain text
   - { from:"agent", text, quickReplies:[str] } text + quick-reply buttons
   - { from:"agent", type:"action", title, body, onApply }  proposed change card
   - { from:"agent", type:"wf-draft", draft, onConfirm }    new-workflow summary card
*/
function ChatPanel({
  title = "New chat",
  intro,
  contextCard,
  chips = [],
  initialMessages = [],
  placeholder = "Message VTEX My Assistant...",
  agent = "VTEX My Assistant",
  onBack,
  // Conteúdo fixo ancorado logo acima do composer (ex.: card de verificação).
  aboveComposer,
  // Conteúdo fixo no fim do corpo da conversa, junto às mensagens
  // (ex.: registro da resposta da verificação, depois de confirmada).
  bodyFooter,
  // Controlled mode:
  messages: controlledMessages,
  onSend: externalOnSend,
  isTyping = false,
  composerRef,
}) {
  const isControlled = controlledMessages !== undefined;
  const [localMessages, setLocalMessages] = useState(initialMessages);
  const messages = isControlled ? controlledMessages : localMessages;
  const scrollRef = useRef(null);
  // Tracks which message index had a quick-reply answered and what was chosen
  const [answeredReplies, setAnsweredReplies] = useState({});

  useEffect(() => {
    if (!isControlled) setLocalMessages(initialMessages);
    setAnsweredReplies({});
  }, [contextCard?.id, title]);

  // Reset answered state when messages list is reset (e.g. mode change)
  const prevLenRef = useRef(messages.length);
  useEffect(() => {
    if (messages.length < prevLenRef.current) setAnsweredReplies({});
    prevLenRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping, !!bodyFooter]);

  const send = (text, replyFromMsgIndex, opts) => {
    if (!text.trim()) return;
    if (replyFromMsgIndex !== undefined) {
      setAnsweredReplies(prev => ({ ...prev, [replyFromMsgIndex]: text.trim() }));
    }
    if (isControlled) {
      externalOnSend?.(text.trim(), opts);
    } else {
      setLocalMessages((m) => [...m, { from: "user", text }]);
    }
  };

  const hasUser = messages.some((m) => m.from === "user");

  function renderMessage(m, i) {
    if (m.from === "user") {
      return (
        <div key={i} className="msg msg-user">
          <div className="bubble">{m.text}</div>
        </div>
      );
    }

    const answered = answeredReplies[i];

    return (
      <div key={i} className="msg msg-assistant">
        {m.text && <div className="msg-text">{renderMd(m.text)}</div>}

        {m.type === "action" && !m.fields && (
          <div className="chat-action-card">
            <div className="chat-action-card-body">
              <span className="chat-action-card-title">{m.title}</span>
              {m.body && <span className="chat-action-card-desc" style={{ whiteSpace: "pre-line" }}>{renderMd(m.body)}</span>}
            </div>
            <button className="btn btn-sm btn-primary chat-action-apply" onClick={m.onApply}>
              Aplicar
            </button>
          </div>
        )}

        {m.type === "action" && m.fields && (
          <div className="chat-action-card chat-action-card--structured">
            <div className="chat-action-card-label">{m.title}</div>
            {m.heading && <div className="chat-action-card-heading">{m.heading}</div>}
            <div className="chat-action-card-fields">
              {m.fields.map((f, fi) => (
                <div key={fi} className="chat-action-card-field">
                  <span className="chat-action-field-label">{f.label}:</span>
                  {f.tag
                    ? <span className="chat-action-field-tag">{f.value}</span>
                    : <span className="chat-action-field-value">{f.value}</span>
                  }
                </div>
              ))}
            </div>
            <div className="chat-action-card-btns">
              <button className="btn btn-sm btn-primary chat-action-apply-full" onClick={m.onApply}>
                {m.applyLabel || "Aplicar"}
              </button>
              {m.onDismiss && (
                <button className="btn btn-sm btn-tertiary chat-action-dismiss" onClick={m.onDismiss}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}

        {m.type === "order-list" && m.orders && m.orders.length > 0 && (
          <div className="chat-order-list">
            {m.orders.map(function(o) {
              return (
                <button
                  key={o.id}
                  className="chat-order-row"
                  onClick={() => m.onOpenOrder && m.onOpenOrder(o.id)}
                >
                  <span className="chat-order-id">
                    <span>{o.id}</span>
                    <span className="muted" style={{ fontSize: 10 }}>({o.short})</span>
                  </span>
                  <span className="chat-order-customer">{o.customer}</span>
                  <span className="chat-order-meta">
                    <span className="chat-order-sla">SLA {o.sla}</span>
                    <span className="chat-order-eta">ETA {o.eta}</span>
                  </span>
                  <span className={`orders-status orders-status-${o.status}`} style={{ fontSize: 11 }}>{o.statusLabel}</span>
                  <Icon name="chevron-right" size={12} style={{ flexShrink: 0, color: "var(--fg-3)" }} />
                </button>
              );
            })}
          </div>
        )}

        {m.type === "wf-draft" && m.draft && (
          <div className="chat-draft-card">
            <div className="chat-draft-header">
              <span>✨</span>
              <span>Novo workflow</span>
            </div>
            <div className="chat-draft-rows">
              <div className="chat-draft-row">
                <span className="chat-draft-label">Nome</span>
                <strong>{m.draft.name}</strong>
              </div>
              {m.draft.origin && (
                <div className="chat-draft-row">
                  <span className="chat-draft-label">Origem</span>
                  <strong>{m.draft.origin}</strong>
                </div>
              )}
              {m.draft.category && (
                <div className="chat-draft-row">
                  <span className="chat-draft-label">Categoria</span>
                  <strong>{m.draft.category}</strong>
                </div>
              )}
              <div className="chat-draft-row">
                <span className="chat-draft-label">Acionamento</span>
                <strong>{{ auto: "Automático — novos pedidos", manual: "Manual pelo operador", client: "Por solicitação do cliente" }[m.draft.trigger] || m.draft.trigger}</strong>
              </div>
              <div className="chat-draft-row">
                <span className="chat-draft-label">Agente AI</span>
                <strong>{m.draft.aiOrch ? "Ativo" : "Desativado"}</strong>
              </div>
            </div>
            <button
              className="btn btn-sm btn-primary"
              style={{ width: "100%", marginTop: 10 }}
              onClick={m.onConfirm}
            >
              Criar e adicionar etapas no canvas
            </button>
          </div>
        )}

        {m.quickReplies && m.quickReplies.length > 0 && (() => {
          const hasCards = m.quickReplies.some(r => r && typeof r === "object" && r.desc);
          return (
            <div className={`chat-quick-replies${hasCards ? " as-cards" : ""}${answered ? " is-answered" : ""}`}>
              {m.quickReplies.map((r, j) => {
                const label = typeof r === "string" ? r : r.label;
                const isSelected = answered === label;
                if (hasCards && typeof r === "object" && r.desc) {
                  return (
                    <button
                      key={j}
                      className={`chat-origin-card${isSelected ? " selected" : ""}${answered && !isSelected ? " dimmed" : ""}`}
                      onClick={() => !answered && send(label, i, { fromReply: true })}
                      disabled={!!answered && !isSelected}
                    >
                      {r.icon && <span className="chat-origin-card-icon">{r.icon}</span>}
                      <strong className="chat-origin-card-title">{label}</strong>
                      <span className="chat-origin-card-desc">{r.desc}</span>
                    </button>
                  );
                }
                const undoPrefix = "↩ ";
                const isUndo = label.startsWith(undoPrefix);
                const isConfirm = label.endsWith("→");
                const displayLabel = isUndo ? label.slice(undoPrefix.length) : label;
                return (
                  <button
                    key={j}
                    className={`chat-quick-reply${isSelected ? " selected" : ""}${answered && !isSelected ? " dimmed" : ""}${isConfirm ? " chat-quick-reply--confirm" : ""}`}
                    onClick={() => !answered && send(label, i, { fromReply: true })}
                    disabled={!!answered && !isSelected}
                  >
                    {isUndo && <Icon name="arrow-counter-clockwise" size={12} />}
                    {displayLabel}
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="chat-panel">
      <div className="chat-head">
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {onBack ? (
            <button className="chat-back-btn" onClick={onBack} title="Esconder chat">
              <Icon name="chevron-left" size={16} />
              <span>Esconder chat</span>
            </button>
          ) : (
            <button className="chat-title">
              <span>{title}</span>
              <Icon name="chevron-down" size={12} />
            </button>
          )}
        </div>
        <div className="chat-head-actions">
          <button className="icon-btn" title="New chat"><Icon name="plus" size={16} /></button>
          <button className="icon-btn" title="History"><Icon name="history" size={16} /></button>
          <button className="icon-btn" title="More"><Icon name="more" size={16} /></button>
        </div>
      </div>

      <div className="chat-body" ref={scrollRef}>
        {intro && (
          <div className="chat-intro">
            <p>{intro}</p>
          </div>
        )}

        {contextCard && (
          <button className="intro-link" onClick={contextCard.onClick}>
            <span><span className="id-chip">{contextCard.id}</span> {contextCard.title}</span>
            <Icon name="chevron-right" size={14} />
          </button>
        )}

        {messages.map(renderMessage)}

        {bodyFooter && <div className="chat-body-card">{bodyFooter}</div>}

        {isTyping && (
          <div className="msg msg-assistant">
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

      </div>

      <div className="chat-composer-wrap">
        {aboveComposer && <div className="chat-above-composer">{aboveComposer}</div>}
        {chips.length > 0 && (
          <div className="composer-chips">
            <div className="chip-row">
              {chips.map((c, j) => (
                <button key={j} className="suggest-chip" onClick={() => send(c.label, undefined, { fromChip: true })}>
                  {c.icon && <Icon name={c.icon} size={16} />}
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <MessageComposer placeholder={placeholder} agent={agent} onSend={send} ref={composerRef} />
      </div>
    </div>
  );
}

window.MessageComposer = MessageComposer;
window.ChatPanel = ChatPanel;
