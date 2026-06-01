/* global React, Icon, AIWData, ChatPanel, ResizableSplit */
const { useState } = React;

function Toggle({ on, onChange }) {
  return (
    <button className={`aiw-toggle ${on ? "on" : ""}`} onClick={() => onChange(!on)} aria-pressed={on}>
      <span className="aiw-toggle-knob" />
    </button>
  );
}

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

function ActBadge({ kind }) {
  const map = {
    success:  { bg: "#E3F8E5", color: "#169B61", icon: "check"  },
    warning:  { bg: "#FFF4DC", color: "#B66800", icon: "clock"  },
    critical: { bg: "#FFEBEC", color: "#D43436", icon: "x"      },
    info:     { bg: "#EAF0FF", color: "#2962FF", icon: "loader" }
  };
  const m = map[kind] || map.info;
  return (
    <span className="act-badge" style={{ background: m.bg, color: m.color }}>
      <Icon name={m.icon} size={12} />
    </span>
  );
}

function OrchestrationCanvas() {
  const [threshold, setThreshold] = useState(75);
  const [resTarget, setResTarget] = useState(80);
  const [hours, setHours] = useState(2);
  const [horario, setHorario] = useState("24-7");
  const [actions, setActions] = useState({ detect: true, realloc: true, advance: true, tasks: true, cancel: false });
  const [notifs, setNotifs] = useState({ email: true, slack: true, webhook: false });

  return (
    <div className="detail-panel">
      <div className="detail-head no-border">
        <div className="detail-head-left">
          <span className="canvas-name">Agente de Orquestração</span>
        </div>
        <div className="detail-head-right">
          <button className="btn btn-primary">Salvar</button>
        </div>
      </div>
      <div className="detail-scroll">
        <div className="detail-body">
          <h1 className="detail-title">Agente de Orquestração</h1>
          <p className="detail-desc">Configure o comportamento do agente AI que orquestra os workflows de pedidos.</p>
          <div className="active-line">
            <span className="status-dot active" />
            <span className="muted">Agente ativo · 4.256 pedidos monitorados</span>
          </div>

          {/* Comportamento */}
          <section className="detail-section">
            <div className="detail-section-head"><h3>Comportamento do agente</h3></div>
            <div className="settings-card">
              <div className="setting-field">
                <label>Confiança mínima para ação automática</label>
                <Slider value={threshold} onChange={setThreshold} min={0} max={100} suffix="%" />
                <div className="setting-ends">
                  <span>0% — age sempre</span>
                  <span>100% — nunca age</span>
                </div>
                <div className="setting-help">Abaixo deste threshold o agente escala para um operador humano.</div>
              </div>
              <div className="setting-divider" />
              <div className="setting-field">
                <label>Ações habilitadas</label>
                {[
                  { key: "detect",  name: "Detectar pedidos travados",       desc: "Monitora status sem movimentação acima do SLA" },
                  { key: "realloc", name: "Sugerir realocação de estoque",   desc: "Propõe novo CD quando o atual não pode atender" },
                  { key: "advance", name: "Avançar status automaticamente",  desc: "Avança etapas quando todas as condições são satisfeitas" },
                  { key: "tasks",   name: "Criar tarefas para operadores",   desc: "Gera tasks manuais quando confiança está abaixo do threshold" },
                  { key: "cancel",  name: "Cancelar pedidos automaticamente", desc: "Requer confiança ≥ 95% e aprovação do gestor" }
                ].map((it) =>
                  <div key={it.key} className="setting-row">
                    <div className="setting-row-body">
                      <span className="setting-row-title">{it.name}</span>
                      <span className="setting-row-desc">{it.desc}</span>
                    </div>
                    <Toggle on={actions[it.key]} onChange={() => setActions((a) => ({ ...a, [it.key]: !a[it.key] }))} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SLA */}
          <section className="detail-section">
            <div className="detail-section-head"><h3>SLA e intervenção</h3></div>
            <div className="settings-card">
              <div className="setting-field">
                <label>Intervir após (horas sem movimentação)</label>
                <Slider value={hours} onChange={setHours} min={1} max={12} suffix="h" />
              </div>
              <div className="setting-divider" />
              <div className="setting-field">
                <label>Horário de operação</label>
                {[
                  { key: "24-7", name: "24h por dia, 7 dias por semana", desc: "O agente nunca para de monitorar" },
                  { key: "biz",  name: "Horário comercial (08h–18h, seg–sex)", desc: "Fora deste horário apenas alerta por notificação" }
                ].map((opt) =>
                  <button key={opt.key} className="setting-radio" onClick={() => setHorario(opt.key)}>
                    <span className={`radio-dot ${horario === opt.key ? "checked" : ""}`} />
                    <div className="setting-row-body">
                      <span className="setting-row-title">{opt.name}</span>
                      <span className="setting-row-desc">{opt.desc}</span>
                    </div>
                  </button>
                )}
              </div>
              <div className="setting-divider" />
              <div className="setting-field">
                <label>Notificações</label>
                {[
                  { key: "email",   name: "Email ao escalar para operador" },
                  { key: "slack",   name: "Slack — #dom-alertas" },
                  { key: "webhook", name: "Webhook personalizado" }
                ].map((it) =>
                  <div key={it.key} className="setting-row">
                    <div className="setting-row-body">
                      <span className="setting-row-title">{it.name}</span>
                    </div>
                    <Toggle on={notifs[it.key]} onChange={() => setNotifs((a) => ({ ...a, [it.key]: !a[it.key] }))} />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Cobertura */}
          <section className="detail-section">
            <div className="detail-section-head"><h3>Cobertura por workflow</h3></div>
            <div className="settings-card">
              {AIWData.orchestrationCoverage.map((w, i) =>
                <div key={i} className={`setting-row ${i === 0 ? "first" : ""}`}>
                  <div className="setting-row-body">
                    <span className="setting-row-title">{w.name}</span>
                    <span className="setting-row-desc">{w.meta}</span>
                  </div>
                  <Toggle on={true} onChange={() => {}} />
                </div>
              )}
              <div className="setting-divider" />
              <div className="setting-field">
                <label>Taxa de resolução automática alvo</label>
                <Slider value={resTarget} onChange={setResTarget} min={0} max={100} suffix="%" />
                <div className="setting-help">Meta: {resTarget}% das exceções resolvidas sem intervenção humana.</div>
              </div>
            </div>
          </section>

          {/* Atividade recente */}
          <section className="detail-section">
            <div className="detail-section-head"><h3>Atividade recente</h3></div>
            <div className="activities">
              {AIWData.orchestrationActivity.map((a, i) =>
                <div key={i} className="activity-row">
                  <span className="activity-time">{a.time}</span>
                  <div className="activity-body">
                    <div className="activity-head">
                      <ActBadge kind={a.kind} />
                      <span><strong>{a.actor}</strong> <span className="muted">{a.action}</span></span>
                    </div>
                    {a.note && <div className="activity-note">{a.note}</div>}
                  </div>
                </div>
              )}
            </div>
          </section>

          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

function OrchestrationView({ onBack }) {
  const messages = [
    { from: "agent", text: "Olá. Sou o Agente de Orquestração. Estou monitorando 4.256 pedidos ativos com confiança mínima de 75%." },
    { from: "agent", text: "Nas últimas 24h: 87% dos casos foram resolvidos automaticamente, 13% escalados. Quer ver onde está o gargalo?" }
  ];
  const chips = [
    { icon: "graph",   label: "Show escalated orders today" },
    { icon: "edit",    label: "Raise threshold to 85%"      },
    { icon: "doc",     label: "Summarize last week"         },
    { icon: "search",  label: "List current bottlenecks"    }
  ];

  return (
    <ResizableSplit screenLabel="04 Orchestration Agent">
      <ChatPanel
        title="Agente de Orquestração"
        intro="Configure how the orchestration agent runs your operation. It currently monitors 4,256 orders with a 75% confidence threshold."
        chips={chips}
        initialMessages={messages}
        placeholder="Ask about the orchestration agent..."
        onBack={onBack}
      />
      <OrchestrationCanvas />
    </ResizableSplit>
  );
}

window.OrchestrationView = OrchestrationView;
