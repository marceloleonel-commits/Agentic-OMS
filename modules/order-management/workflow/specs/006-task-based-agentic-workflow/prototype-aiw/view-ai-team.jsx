/* global React, Icon, AIWData */

function AITeamDrawer({ open, onClose, onPick }) {
  const team = AIWData.aiTeam;
  return (
    <div className={`drawer ${open ? "open" : ""}`} data-screen-label="My AI Team">
      <div className="drawer-head">
        <div>
          <div className="drawer-title">My AI Team</div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Meus assistentes e agentes especializados</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-primary">Go to Agent Marketplace</button>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
      </div>
      <div className="drawer-body">
        <div className="agent-search">
          <Icon name="search" size={14} />
          <input placeholder="Search agents..." />
        </div>

        <div className="aiteam-section-title">Assistentes principais</div>
        <div className="aiteam-list">
          {team.filter((a) => a.id === "assistant" || a.id === "orchestration").map((a) =>
            <button key={a.id} className="aiteam-row primary" onClick={() => onPick(a.id)}>
              <div className="aiteam-avatar primary" style={{ background: a.color }}>
                <Icon name="sparkle" size={14} />
              </div>
              <div className="aiteam-body">
                <div className="aiteam-name">{a.name}</div>
                <div className="aiteam-sub">{a.sub}</div>
              </div>
              <div className="aiteam-stat">
                <div className="lbl">Tarefas</div>
                <div className="val">{a.tasks.toLocaleString()}</div>
              </div>
              <Icon name="chevron-right" size={14} />
            </button>
          )}
        </div>

        <div className="aiteam-section-title">Agentes especializados</div>
        <div className="aiteam-list">
          {team.filter((a) => a.id !== "assistant" && a.id !== "orchestration").map((a) =>
            <div key={a.id} className="aiteam-row">
              <div className="aiteam-avatar" style={{ background: a.color }}>{a.emoji}</div>
              <div className="aiteam-body">
                <div className="aiteam-name">{a.name}</div>
                <div className="aiteam-sub">{a.sub}</div>
              </div>
              <div className="aiteam-stat">
                <div className="lbl">Tarefas</div>
                <div className="val">{a.tasks.toLocaleString()}</div>
              </div>
              <div className="aiteam-stat">
                <div className="lbl">Créditos</div>
                <div className="val">{a.credits.toLocaleString()}</div>
              </div>
              <button className="icon-btn"><Icon name="more" size={16} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.AITeamDrawer = AITeamDrawer;
