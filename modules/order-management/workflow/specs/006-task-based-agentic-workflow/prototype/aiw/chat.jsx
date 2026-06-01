/* global React, Icon */
const { useState, useRef, useEffect } = React;

function MessageComposer({ placeholder = "Message VTEX My Assistant...", onSend, agent = "VTEX My Assistant" }) {
  const [v, setV] = useState("");
  const submit = () => {
    if (!v.trim()) return;
    onSend && onSend(v.trim());
    setV("");
  };
  return (
    <div className="composer">
      <div className="composer-inner">
        <textarea
          rows={1}
          placeholder={placeholder}
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
        />
        <div className="composer-row">
          <button className="composer-icon" title="Attach"><Icon name="plus" size={16} /></button>
          <button className="agent-chip">
            <span className="agent-mark">
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M3 6h18l-3 6 3 6H6L3 12l3-6z" /></svg>
            </span>
            <span>{agent}</span>
            <Icon name="chevron-down" size={12} />
          </button>
          <div style={{ flex: 1 }} />
          <button className={`send-btn ${v.trim() ? "active" : ""}`} onClick={submit} title="Send">
            <Icon name="arrow-up" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
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
  // Controlled mode:
  messages: controlledMessages,
  onSend: externalOnSend,
  isTyping = false,
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

  const send = (text, replyFromMsgIndex) => {
    if (!text.trim()) return;
    if (replyFromMsgIndex !== undefined) {
      setAnsweredReplies(prev => ({ ...prev, [replyFromMsgIndex]: text.trim() }));
    }
    if (isControlled) {
      externalOnSend?.(text.trim());
    } else {
      setLocalMessages((m) => [...m, { from: "user", text }]);
    }
  };

  const hasUser = messages.some((m) => m.from === "user");
  const showChips = !hasUser && chips.length > 0;

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
        {m.text && <div className="msg-text">{m.text}</div>}

        {m.type === "action" && (
          <div className="chat-action-card">
            <div className="chat-action-card-body">
              <span className="chat-action-card-title">{m.title}</span>
              {m.body && <span className="chat-action-card-desc">{m.body}</span>}
            </div>
            <button className="btn btn-sm btn-primary chat-action-apply" onClick={m.onApply}>
              Aplicar
            </button>
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
              {m.draft.category && (
                <div className="chat-draft-row">
                  <span className="chat-draft-label">Categoria</span>
                  <strong>{m.draft.category}</strong>
                </div>
              )}
              <div className="chat-draft-row">
                <span className="chat-draft-label">Acionamento</span>
                <strong>{{ auto: "Automático", manual: "Manual", client: "Solicitação do cliente" }[m.draft.trigger] || m.draft.trigger}</strong>
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
                      onClick={() => !answered && send(label, i)}
                      disabled={!!answered && !isSelected}
                    >
                      {r.icon && <span className="chat-origin-card-icon">{r.icon}</span>}
                      <strong className="chat-origin-card-title">{label}</strong>
                      <span className="chat-origin-card-desc">{r.desc}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={j}
                    className={`chat-quick-reply${isSelected ? " selected" : ""}${answered && !isSelected ? " dimmed" : ""}`}
                    onClick={() => !answered && send(label, i)}
                    disabled={!!answered && !isSelected}
                  >
                    {label}
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

        {showChips && (
          <div>
            <div className="chat-sub-q">What do you want to do first?</div>
            <div className="chip-row">
              {chips.map((c, j) => (
                <button key={j} className="suggest-chip" onClick={() => send(c.label)}>
                  <Icon name={c.icon} size={12} /> {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="chat-composer-wrap">
        <MessageComposer placeholder={placeholder} agent={agent} onSend={send} />
      </div>
    </div>
  );
}

window.MessageComposer = MessageComposer;
window.ChatPanel = ChatPanel;
