/* global React, Icon, AppData */
const { useState } = React;

function Sidebar({ route, setRoute, conversations, openConversation, activeConvId, collapsed, setCollapsed, openInitiative }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-head">
        <button className="store-logo" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"}>
          <svg viewBox="0 0 234 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M216.479 0H41.744C28.1953 0 19.5182 14.3991 25.8571 26.3711L43.3327 59.459H11.6486C5.2147 59.459 0 64.6773 0 71.1091C0 72.998 0.459186 74.8606 1.34062 76.5332L57.5571 182.904C60.5708 188.587 67.6223 190.755 73.3067 187.748C75.3705 186.656 77.0594 184.967 78.152 182.904L93.4214 154.169L112.575 190.423C119.315 203.176 137.577 203.197 144.344 190.46L231.928 25.701C238.124 14.0509 229.679 0 216.479 0ZM137.989 70.3968L100.225 141.453C98.2191 145.236 93.5216 146.677 89.7373 144.672C88.365 143.944 87.246 142.825 86.5177 141.453L49.1175 70.6976C47.1118 66.9144 48.558 62.2238 52.3423 60.2188C53.456 59.6278 54.6911 59.3218 55.9472 59.3165H131.323C135.493 59.3165 138.871 62.6934 138.871 66.8617C138.871 68.0911 138.57 69.3046 137.989 70.3968Z" fill="#F71963"/>
          </svg>
        </button>
        {!collapsed && <span className="store-name">Demo Store</span>}
        {!collapsed &&
        <button className="collapse-btn" onClick={() => setCollapsed(true)} title="Collapse">
            <Icon name="chevron-left" size={14} />
          </button>
        }
      </div>

      <div className="nav" onClick={collapsed ? () => setCollapsed(false) : undefined}>
        <button className={`nav-item ${route.name === "assistant" ? "active" : ""}`} onClick={() => {if (collapsed) setCollapsed(false);setRoute({ name: "assistant" });}} title="My Assistant">
          <Icon name="assistant" className="icon" />
          <span className="label">My Assistant</span>
        </button>
        <button className={`nav-item ${route.name === "orders" ? "active" : ""}`} onClick={() => {if (collapsed) setCollapsed(false);setRoute({ name: "orders" });}} title="Orders">
          <Icon name="cart" className="icon" />
          <span className="label">Orders</span>
        </button>
        <button className={`nav-item ${route.name === "initiatives" ? "active" : ""}`} onClick={() => {if (collapsed) setCollapsed(false);setRoute({ name: "initiatives" });}} title="My Initiatives">
          <Icon name="initiatives" className="icon" />
          <span className="label">My Initiatives</span>
        </button>

        <div className="nav-section">
          <button className={`nav-item ${route.name === "conversations" && !activeConvId ? "active" : ""}`} onClick={() => {if (collapsed) setCollapsed(false);setRoute({ name: "conversations" });}} title="Conversations">
            <Icon name="chat" className="icon" />
            <span className="label">Conversations</span>
          </button>
          {!collapsed && route.name === "conversations" &&
          <div className="nav-sub">
              {conversations.map((c) =>
            <button key={c.id} className={`nav-sub-item ${activeConvId === c.id ? "active" : ""}`} onClick={() => openConversation(c.id)}>
                  {c.title}
                </button>
            )}
            </div>
          }
        </div>
      </div>

      <div className="sidebar-foot">
        <button className="foot-btn" title="Apps"><Icon name="grid" /></button>
        <button className="foot-btn" title="Search"><Icon name="search" /></button>
        <button className="foot-btn" title="Notifications"><Icon name="bell" /></button>
        <div className="user-avatar" title="Account" style={{ backgroundImage: `url(${AppData.AVATARS.you})` }} />
      </div>
    </aside>);

}

window.Sidebar = Sidebar;