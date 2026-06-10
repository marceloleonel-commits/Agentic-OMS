/* global React, Icon */
const { useState, useRef, useEffect, useCallback } = React;

const MessageComposer = React.forwardRef(function MessageComposer({ placeholder = "Message VTEX My Assistant...", onSend, agent = "VTEX My Assistant" }, ref) {
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
  };

  return (
    <div className="composer">
      <div className="composer-inner">
        {citations.length > 0 && (
          <div className="composer-citations">
            {citations.map((c, i) => (
              <span key={i} className="composer-citation">
                <span className="composer-citation-text">{c.replace(/^\[|\]$/g, "")}</span>
                <button
                  className="composer-citation-close"
                  title="Remover citação"
                  onClick={() => removeCitation(c)}
                >
                  <Icon name="x" size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder={placeholder}
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <div className="composer-row">
          <button className="composer-icon" title="Attach"><Icon name="plus" size={16} /></button>
          <button className="agent-chip">
            <span className="agent-mark" />
            <span>{agent}</span>
            <Icon name="chevron-down" size={12} />
          </button>
          <div style={{ flex: 1 }} />
          <button className={`send-btn ${(v.trim() || citations.length) ? "active" : ""}`} onClick={submit} title="Send">
            <Icon name="arrow-up" size={14} />
          </button>
        </div>
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
function ChipRowWithMore({ chips, onSelect }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="composer-chips" ref={wrapRef}>
      {open && (
        <div className="chip-more-menu">
          {chips.map((c, j) => (
            <button
              key={j}
              className="chip-more-item"
              style={{ animationDelay: `${(chips.length - 1 - j) * 55}ms` }}
              onClick={() => { onSelect(c); setOpen(false); }}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <div className="chip-row">
        <button
          className={`suggest-chip chip-help-trigger${open ? ' open' : ''}`}
          onClick={() => setOpen(o => !o)}
        >
          <Icon name={open ? 'x' : 'sparkle'} size={14} />
          {open ? 'Fechar' : 'Como posso te ajudar?'}
        </button>
      </div>
    </div>
  );
}

function ChatPanel({
  title = "New chat",
  intro,
  contextCard,
  chips = [],
  alwaysShowChips = false,
  initialMessages = [],
  placeholder = "Message VTEX My Assistant...",
  agent = "VTEX My Assistant",
  onBack,
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
  }, [messages, isTyping]);

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
              <span>Nova experiência</span>
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
            <button className="chat-back-btn" onClick={onBack} title="Voltar">
              <Icon name="chevron-left" size={16} />
              <span>Voltar</span>
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

        {isTyping && (
          <div className="msg msg-assistant">
            <div className="chat-typing">
              <span /><span /><span />
            </div>
          </div>
        )}

      </div>

      <div className="chat-composer-wrap">
        {chips.length > 0 && (
          <ChipRowWithMore chips={chips} onSelect={(c) => send(c.label, undefined, { fromChip: true })} />
        )}
        <MessageComposer placeholder={placeholder} agent={agent} onSend={send} ref={composerRef} />
      </div>
    </div>
  );
}

window.MessageComposer = MessageComposer;
window.ChatPanel = ChatPanel;
