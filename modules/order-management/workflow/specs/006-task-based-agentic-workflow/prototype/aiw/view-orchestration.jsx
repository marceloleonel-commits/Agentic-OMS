/* global React, Icon, AIWData, ChatPanel, ResizableSplit, ChatEngine */
const { useState, useEffect, useRef } = React;

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

function AgentCard({ emoji, title, subtitle, defaultOn, children }) {
  const [open, setOpen] = useState(false);
  const [on, setOn] = useState(defaultOn !== false);
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#f9fafb", cursor: "pointer" }}
           onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{title}</div>
          <div style={{ fontSize: 11.5, color: "#888", marginTop: 1 }}>{subtitle}</div>
        </div>
        <Toggle on={on} onChange={(v) => { setOn(v); }} />
        <svg viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="2" width="14" height="14"
             style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </div>
      {open && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid #e5e7eb" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SkillRow({ id, label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn !== false);
  return (
    <div className="setting-row" style={{ margin: 0 }}>
      <div className="setting-row-body">
        <span className="setting-row-title" style={{ fontSize: 12 }}>{label}</span>
        {desc && <span className="setting-row-desc">{desc}</span>}
      </div>
      <Toggle on={on} onChange={setOn} />
    </div>
  );
}

function OrchestrationCanvas({ customRules }) {
  const [threshold, setThreshold] = useState(75);
  const [hours, setHours] = useState(4);

  return (
    <div className="detail-panel">
      <div className="detail-head no-border">
        <div className="detail-head-left">
          <span className="canvas-name">Agentes de Pedidos</span>
        </div>
        <div className="detail-head-right">
          <button className="btn btn-primary">Salvar</button>
        </div>
      </div>
      <div className="detail-scroll">
        <div className="detail-body">
          <h1 className="detail-title">Agentes de Pedidos</h1>
          <p className="detail-desc">Configure o comportamento dos agentes AI que orquestram os workflows de pedidos.</p>
          {/* ── Sub-Agentes e Skills ── */}
          <section className="detail-section">
            <div className="detail-section-head"><h3>Sub-Agentes e Skills</h3></div>
            <p className="detail-desc" style={{ marginTop: -8, marginBottom: 12 }}>
              Configure os agentes que compõem o orquestrador. Expanda cada agente para ativar ou desativar suas skills.
            </p>

            {/* Roteamento */}
            <AgentCard emoji="🗺️" title="Roteamento" subtitle="Organiza os itens do pedido e define quem vai cuidar de cada parte da entrega">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                <SkillRow label="Classificador de Entrega"    desc="Lê cada item do pedido e identifica como ele precisa ser entregue — armazém, retirada na loja, produto digital ou saída da loja física" />
                <SkillRow label="Agrupador de Fornecedores"   desc="Descobre quais fornecedores precisam trabalhar juntos e agrupa os itens que o mesmo time consegue atender" />
                <SkillRow label="Divisor de Pedidos"          desc="Divide o pedido em tarefas de entrega, agrupando os itens que o mesmo time de fornecedores vai resolver do início ao fim" />
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="setting-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Modo de decisão</label>
                  <select className="field-input" style={{ maxWidth: 240 }}>
                    <option>Automático</option>
                    <option>Sugerir + aguardar aprovação</option>
                  </select>
                </div>
                <div className="setting-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Fallback quando sem provider disponível</label>
                  <select className="field-input" style={{ maxWidth: 240 }}>
                    <option>Escalar para operador</option>
                    <option>Tentar provider alternativo</option>
                    <option>Cancelar automaticamente</option>
                  </select>
                </div>
              </div>
            </AgentCard>

            {/* Orquestração de Workflow */}
            <AgentCard emoji="⚙️" title="Orquestração de Workflow" subtitle="Acompanha o andamento de cada etapa e sabe exatamente o que pode acontecer a seguir">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                <SkillRow label="Verificador de Próximos Passos"  desc="Confere o que já foi concluído no pedido e libera automaticamente a etapa seguinte quando todas as condições foram atendidas" />
                <SkillRow label="Monitor de Prazo por Etapa"      desc="Mede o tempo que o pedido está parado em cada etapa e avisa quando algo está demorando mais do que deveria" />
                <SkillRow label="Controle de Cancelamento"        desc="Quando um cancelamento é solicitado, interrompe o fluxo em andamento e aciona cada fornecedor na ordem certa para desfazer o que já foi feito" />
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10 }}>
                <div className="setting-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Confiança mínima para ação automática</label>
                  <Slider value={threshold} onChange={setThreshold} min={0} max={100} suffix="%" />
                  <div className="setting-ends"><span>0% — age sempre</span><span>100% — nunca age</span></div>
                </div>
              </div>
            </AgentCard>

            {/* Escalação */}
            <AgentCard emoji="🚨" title="Escalação" subtitle="Identifica quando o agente não consegue resolver sozinho e prepara o caso para o operador agir">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 }}>
                <SkillRow label="Detector de Pedidos Travados"            desc="Confirma que o pedido está realmente travado — só sinaliza quando não há saída automática, sem gerar alertas desnecessários" />
                <SkillRow label="Analisador de Bloqueio de Cancelamento"  desc="Identifica exatamente qual fornecedor está impedindo o cancelamento e coleta o contexto para o operador agir rapidamente" />
                <SkillRow label="Preparador de Caso para o Operador"      desc="Monta um resumo completo: o que travou, há quanto tempo, o que já foi tentado e qual ação é recomendada" />
              </div>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="setting-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Intervir após (horas sem movimentação)</label>
                  <Slider value={hours} onChange={setHours} min={1} max={12} suffix="h" />
                </div>
                <div className="setting-field" style={{ margin: 0 }}>
                  <label style={{ fontSize: 12 }}>Horário de operação</label>
                  <select className="field-input" style={{ maxWidth: 240 }}>
                    <option>24h / 7 dias</option>
                    <option>Horário comercial (08h–18h, seg–sex)</option>
                  </select>
                </div>
              </div>
            </AgentCard>

            {/* Explorer */}
            <AgentCard emoji="🔭" title="Explorer" subtitle="Fica de olho em todos os pedidos ao mesmo tempo e avisa quando um padrão de risco está se formando">
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Skills</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <SkillRow label="Varredura de Padrões nos Pedidos"  desc="Varre todos os pedidos ativos em busca de problemas que se repetem — como vários pedidos travados no mesmo armazém — algo que nenhum alerta individual mostraria" />
                <SkillRow label="Classificador de Urgência"         desc="Ordena os problemas pela urgência — considera quantos pedidos estão afetados, o valor em risco e quanto tempo ainda há antes de atrasar a entrega" />
                <SkillRow label="Gerador de Alertas Inteligentes"   desc="Prepara um aviso claro para o operador: qual é o problema, o tamanho do impacto e o que precisa ser feito — sem ruído e sem jargão técnico" />
              </div>
            </AgentCard>

          </section>

          {/* ── Regras Customizadas (adicionadas pelo agente via chat) ── */}
          {customRules && customRules.length > 0 && (
            <section className="detail-section">
              <div className="detail-section-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3>Regras Customizadas</h3>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "#059669", background: "#ecfdf5", border: "1px solid #6ee7b7", padding: "2px 9px", borderRadius: 10 }}>
                  {customRules.length} ativa{customRules.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="detail-desc" style={{ marginTop: -8, marginBottom: 12 }}>
                Regras adicionadas conversacionalmente via agente. Ficam ativas até serem removidas pelo operador.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {customRules.map((rule) => (
                  <div key={rule.id} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1a1a1a", marginBottom: 6 }}>{rule.title}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: "#eff6ff", color: "#2962ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "1px 6px", flexShrink: 0, marginTop: 1 }}>SE</span>
                      <span style={{ fontSize: 11.5, color: "#374151" }}>{rule.condition}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 5px", flexShrink: 0, marginTop: 1 }}>ENTÃO</span>
                      <span style={{ fontSize: 11.5, color: "#374151" }}>{rule.action}</span>
                    </div>
                    <div style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 6 }}>
                      Adicionada pelo agente · Escopo: {rule.scope === "escalation" ? "Escalação" : "Orquestração"}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={{ height: 40 }} />
        </div>
      </div>
    </div>
  );
}

function OrchestrationView({ onBack, onOpenOrder }) {
  const [chatMsgs, setChatMsgs] = useState([
    { from: "agent", text: "Olá. Sou o Agente de Pedidos. Estou monitorando 4.256 pedidos ativos com confiança mínima de 75%." },
    { from: "agent", text: "Nas últimas 24h: 87% dos casos foram resolvidos automaticamente, 13% escalados. Descreva uma regra, consulte pedidos ou peça uma ação." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [customRules, setCustomRules] = useState([]);
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = ChatEngine.create({
      context: "orchestration",
      data: AIWData,
      onNavigate: (route) => { if (onOpenOrder && route.orderId) onOpenOrder(route.orderId); },
      onApplyRule: (rule) => setCustomRules((r) => [...r, rule]),
      onCreateExperience: () => {},
      onAgentSay: (msgs) => setChatMsgs((m) => [...m, ...msgs]),
      onTyping: setIsTyping,
    });
  }, []);

  const chips = [
    { icon: "edit",   label: "Adicionar regra de escalação" },
    { icon: "search", label: "Pedidos com risco de SLA"     },
    { icon: "sparkle", label: "Criar nova experiência"      },
    { icon: "graph",  label: "Ver capacidades do agente"    }
  ];

  const handleSend = (text) => {
    setChatMsgs((m) => [...m, { from: "user", text }]);
    engineRef.current && engineRef.current.send(text);
  };

  return (
    <ResizableSplit screenLabel="04 Orchestration Agent">
      <ChatPanel
        title="Agentes de Pedidos"
        intro="Configure o comportamento do agente em linguagem natural. Monitora 4.256 pedidos com threshold de 75%."
        chips={chips}
        messages={chatMsgs}
        onSend={handleSend}
        isTyping={isTyping}
        placeholder="Descreva uma regra ou consulte pedidos…"
        onBack={onBack}
      />
      <OrchestrationCanvas customRules={customRules} />
    </ResizableSplit>
  );
}

window.OrchestrationView = OrchestrationView;
