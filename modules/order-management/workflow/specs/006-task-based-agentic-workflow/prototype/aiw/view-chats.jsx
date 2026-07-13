/* global React, Icon, AIWData, MessageComposer */
const { useState: useStateChats, useMemo: useMemoChats } = React;

const SvgChatBubble = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M5 17.17L6.17 16H19V6H5V17.17ZM5 4H19C20.1 4 21 4.9 21 6V16C21 17.1 20.1 18 19 18H7L4.70711 20.2929C4.07714 20.9229 3 20.4767 3 19.5858V6C3 4.9 3.9 4 5 4Z" fill="currentColor" />
  </svg>
);

function ChatConversation({ conversation, onBack }) {
  return (
    <div data-sl-chats-conversation="">
      <div data-sl-chats-conversation-head="">
        <button className="chat-back-btn" onClick={onBack}>
          <Icon name="chevron-left" size={14} /> Chats
        </button>
        <span data-sl-chats-conversation-title="">{conversation.title}</span>
      </div>
      <div data-sl-chats-conversation-body="">
        <div className="msg msg-user">
          <div className="bubble">{conversation.title}</div>
        </div>
        <div className="msg msg-assistant">
          <div className="msg-text" style={{ whiteSpace: "pre-line" }}>{conversation.preview}</div>
        </div>
      </div>
      <div className="aiw-composer-bar">
        <MessageComposer placeholder="Continue a conversa…" />
      </div>
    </div>
  );
}

function ChatsView({ conversations, activeConvId, onOpenConversation }) {
  const [search, setSearch] = useStateChats("");
  const list = conversations ?? AIWData.conversations ?? [];
  const active = useMemoChats(
    () => list.find((c) => c.id === activeConvId) || null,
    [list, activeConvId]
  );

  const filtered = useMemoChats(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) => c.title.toLowerCase().includes(q) || (c.preview || "").toLowerCase().includes(q)
    );
  }, [list, search]);

  if (active) {
    return (
      <div className="main">
        <ChatConversation conversation={active} onBack={() => onOpenConversation(null)} />
      </div>
    );
  }

  return (
    <div className="main">
      <div data-sl-my-tasks-sticky-top="">
        <div data-sl-module-browser-top-bar="">
          <div data-sl-module-browser-top-bar-title="">
            <h1 data-sl-browse-page-title="">Chats</h1>
          </div>
          <div data-sl-module-browser-toolbar="">
            <button data-sl-module-browser-header-icon-action="" aria-label="Buscar" title="Buscar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor" />
              </svg>
            </button>
            <button data-sl-module-browser-header-icon-action="" aria-label="Novo chat" title="Novo chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="scroll">
        <div className="aiw-wrap">
          <section className="aiw-section">
            <div data-sl-chats-list="">
              {filtered.map((c) => (
                <button key={c.id} data-sl-chats-row="" onClick={() => onOpenConversation(c.id)}>
                  <span data-sl-chats-row-icon=""><SvgChatBubble /></span>
                  <span data-sl-chats-row-main="">
                    <span data-sl-chats-row-title="">
                      {c.pinned && <span data-sl-chats-row-pin="" title="Fixado">★</span>}
                      {c.title}
                    </span>
                    <span data-sl-chats-row-preview="">{c.preview}</span>
                  </span>
                  {c.hasCanvas && <span data-sl-chats-row-badge="">Canvas</span>}
                  <Icon name="chevron-right" size={14} />
                </button>
              ))}
              {filtered.length === 0 && (
                <div data-sl-initiative-empty="">Nenhum chat encontrado.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

window.ChatsView = ChatsView;
