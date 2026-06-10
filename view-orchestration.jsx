/* global React, Icon, AIWData, ChatPanel, ResizableSplit, ChatEngine, Toggle, Slider */
const { useState, useEffect, useRef } = React;

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

function AgentCard({ emoji, title, subtitle, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="agent-card">
      <div className="agent-card-head" onClick={() => setOpen(o => !o)}>
        <span className="agent-card-emoji">{emoji}</span>
        <div className="agent-card-info">
          <div className="agent-card-title">{title}</div>
          <div className="agent-card-subtitle">{subtitle}</div>
        </div>
        <svg viewBox="0 0 16 16" fill="none" stroke="#888" strokeWidth="2" width="14" height="14"
             className={`agent-card-chevron${open ? " open" : ""}`}>
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </div>
      {open && (
        <div className="agent-card-body">
          {children}
        </div>
      )}
    </div>
  );
}

function SkillRow({ id, label, desc, defaultOn }) {
  const [on, setOn] = useState(defaultOn !== false);
  return (
    <div className="setting-row skill-row">
      <div className="setting-row-body">
        <span className="setting-row-title">{label}</span>
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
              <div className="skills-section-label">Skills</div>
              <div className="skills-list">
                <SkillRow label="Classificador de Entrega"    desc="Lê cada item do pedido e identifica como ele precisa ser entregue — armazém, retirada na loja, produto digital ou saída da loja física" />
                <SkillRow label="Agrupador de Fornecedores"   desc="Descobre quais fornecedores precisam trabalhar juntos e agrupa os itens que o mesmo time consegue atender" />
                <SkillRow label="Divisor de Pedidos"          desc="Divide o pedido em tarefas de entrega, agrupando os itens que o mesmo time de fornecedores vai resolver do início ao fim" />
              </div>
              <div className="agent-card-divider agent-card-fields">
                <div className="setting-field">
                  <label>Modo de decisão</label>
                  <select className="field-input" style={{ maxWidth: 240 }}>
                    <option>Automático</option>
                    <option>Sugerir + aguardar aprovação</option>
                  </select>
                </div>
                <div className="setting-field">
                  <label>Fallback quando sem provider disponível</label>
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
              <div className="skills-section-label">Skills</div>
              <div className="skills-list">
                <SkillRow label="Verificador de Próximos Passos"  desc="Confere o que já foi concluído no pedido e libera automaticamente a etapa seguinte quando todas as condições foram atendidas" />
                <SkillRow label="Monitor de Prazo por Etapa"      desc="Mede o tempo que o pedido está parado em cada etapa e avisa quando algo está demorando mais do que deveria" />
                <SkillRow label="Controle de Cancelamento"        desc="Quando um cancelamento é solicitado, interrompe o fluxo em andamento e aciona cada fornecedor na ordem certa para desfazer o que já foi feito" />
              </div>
              <div className="agent-card-divider">
                <div className="setting-field">
                  <label>Confiança mínima para ação automática</label>
                  <Slider value={threshold} onChange={setThreshold} min={0} max={100} suffix="%" />
                  <div className="setting-ends"><span>0% — age sempre</span><span>100% — nunca age</span></div>
                </div>
              </div>
            </AgentCard>

            {/* Escalação */}
            <AgentCard emoji="🚨" title="Escalação" subtitle="Identifica quando o agente não consegue resolver sozinho e prepara o caso para o operador agir">
              <div className="skills-section-label">Skills</div>
              <div className="skills-list">
                <SkillRow label="Detector de Pedidos Travados"            desc="Confirma que o pedido está realmente travado — só sinaliza quando não há saída automática, sem gerar alertas desnecessários" />
                <SkillRow label="Analisador de Bloqueio de Cancelamento"  desc="Identifica exatamente qual fornecedor está impedindo o cancelamento e coleta o contexto para o operador agir rapidamente" />
                <SkillRow label="Preparador de Caso para o Operador"      desc="Monta um resumo completo: o que travou, há quanto tempo, o que já foi tentado e qual ação é recomendada" />
              </div>
              <div className="agent-card-divider agent-card-fields">
                <div className="setting-field">
                  <label>Intervir após (horas sem movimentação)</label>
                  <Slider value={hours} onChange={setHours} min={1} max={12} suffix="h" />
                </div>
                <div className="setting-field">
                  <label>Horário de operação</label>
                  <select className="field-input" style={{ maxWidth: 240 }}>
                    <option>24h / 7 dias</option>
                    <option>Horário comercial (08h–18h, seg–sex)</option>
                  </select>
                </div>
              </div>
            </AgentCard>

            {/* Explorer */}
            <AgentCard emoji="🔭" title="Explorer" subtitle="Fica de olho em todos os pedidos ao mesmo tempo e avisa quando um padrão de risco está se formando">
              <div className="skills-section-label">Skills</div>
              <div className="skills-list">
                <SkillRow label="Varredura de Padrões nos Pedidos"  desc="Varre todos os pedidos ativos em busca de problemas que se repetem — como vários pedidos travados no mesmo armazém — algo que nenhum alerta individual mostraria" />
                <SkillRow label="Classificador de Urgência"         desc="Ordena os problemas pela urgência — considera quantos pedidos estão afetados, o valor em risco e quanto tempo ainda há antes de atrasar a entrega" />
                <SkillRow label="Gerador de Alertas Inteligentes"   desc="Prepara um aviso claro para o operador: qual é o problema, o tamanho do impacto e o que precisa ser feito — sem ruído e sem jargão técnico" />
              </div>
            </AgentCard>

          </section>

          {/* ── Regras Customizadas (adicionadas pelo agente via chat) ── */}
          {customRules && customRules.length > 0 && (
            <section className="detail-section">
              <div className="detail-section-head">
                <h3>Regras Customizadas</h3>
                <span className="custom-rules-badge">
                  {customRules.length} ativa{customRules.length !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="detail-desc" style={{ marginTop: -8, marginBottom: 12 }}>
                Regras adicionadas conversacionalmente via agente. Ficam ativas até serem removidas pelo operador.
              </p>
              <div className="custom-rules-list">
                {customRules.map((rule) => (
                  <div key={rule.id} className="custom-rule-card">
                    <div className="custom-rule-title">{rule.title}</div>
                    <div className="custom-rule-row">
                      <span className="custom-rule-keyword se">SE</span>
                      <span className="custom-rule-text">{rule.condition}</span>
                    </div>
                    <div className="custom-rule-row">
                      <span className="custom-rule-keyword entao">ENTÃO</span>
                      <span className="custom-rule-text">{rule.action}</span>
                    </div>
                    <div className="custom-rule-meta">
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
    { icon: "link",     label: "Adicionar nova skill para roteamento"  },
    { icon: "settings", label: "Adicionar nova skill para orquestração" },
    { icon: "bell",     label: "Adicionar nova skill para escalação"    },
    { icon: "search",   label: "Adicionar nova skill para exploração"   },
    { icon: "x",        label: "Desativar skill"                        },
    { icon: "sparkle",  label: "Ver capacidades do agente"              },
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
