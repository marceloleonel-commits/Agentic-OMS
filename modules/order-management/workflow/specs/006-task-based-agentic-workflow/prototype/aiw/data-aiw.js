/* AIW — extended data for My Assistant (Orders flows merged) */
window.AIWData = (function () {
  /* ── AVATARS (source of truth — previously in data.js) ── */
  const AVATARS = {
    alex: "https://i.pravatar.cc/64?img=12",
    joao: "https://i.pravatar.cc/64?img=33",
    ana:  "https://i.pravatar.cc/64?img=47",
    leo:  "https://i.pravatar.cc/64?img=15",
    mar:  "https://i.pravatar.cc/64?img=49",
    you:  "https://i.pravatar.cc/64?img=68",
    cami: "https://i.pravatar.cc/64?img=23",
    store: "org-avatar.png"
  };

  /* ── Conversations (sidebar history — previously in data.js) ── */
  const conversations = [
    { id: "c1", title: "Revenue · Report",                   pinned: true,  hasCanvas: true,  preview: "Yesterday's revenue summary..." },
    { id: "c2", title: "How were my sales yesterday?",       pinned: false, hasCanvas: false, preview: "Total Revenue: $23,456.78..." },
    { id: "c3", title: "How do I integrate a new payment gateway?", pinned: false, hasCanvas: false, preview: "To integrate a new payment..." },
    { id: "c4", title: "Is VTEX stable today?",              pinned: false, hasCanvas: false, preview: "All systems operational..." },
    { id: "c5", title: "Does VTEX have any solutions for B2B?", pinned: false, hasCanvas: false, preview: "Yes — VTEX offers a B2B suite..." },
    { id: "c6", title: "How do I install a new agent?",      pinned: false, hasCanvas: false, preview: "Open the Agent Marketplace..." }
  ];

  /* Overview indicators — v3 home shape (mainMetrics + subMetrics). */
  const kpis = {
    mainMetrics: [
      {
        label: "Pedidos",
        value: "5",
        trend: "25%",
        trendDirection: "up",
        chart: {
          points: [2, 3, 1, 4, 3, 5, 4, 5],
          comparisonPoints: [3, 2, 2, 3, 2, 3, 3, 4]
        }
      },
      {
        label: "Total Bruto",
        value: "R$ 7.756,20",
        trend: "100%",
        trendDirection: "up",
        chart: {
          points: [1200, 1800, 1400, 3200, 2600, 5400, 4800, 7756],
          comparisonPoints: [1500, 1300, 1600, 2100, 1900, 2400, 2200, 3800]
        }
      }
    ],
    subMetrics: [
      { label: "Pedidos Hoje",   value: "3"           },
      { label: "Pedidos Ontem",  value: "1"           },
      { label: "Últimos 7 Dias", value: "5"           },
      { label: "Ticket Médio",   value: "R$ 1.551,24" }
    ]
  };

  const workflowStages = [
    { pill: "Pagamento",     label: "Autorização", count: "1.232 pedidos" },
    { pill: "Antifraude",    label: "Análise",     count: "412 pedidos"   },
    { pill: "Processamento", label: "Separação",   count: "287 pedidos"   },
    { pill: "Envio",         label: "Em rota",     count: "1.842 pedidos" },
    { pill: "Entrega",       label: "Em trânsito", count: "736 pedidos"   }
  ];

  const tasks = [

    /* ── Canvas A · Bloqueio operacional em massa (Seller não despachou no SLA) ── */
    {
      id: "TA-CANVAS-A",
      priority: "high",
      status: "attention",
      title: "Seller não despachou no SLA — Fashion Hub (23 pedidos)",
      tag: "Seller Center",
      assigneeInitial: "G",
      assigneeInitials: "GE",
      assigneeName: "Gestor de Ecommerce",
      source: { kind: "order", label: "Seller Center" },
      canvasPattern: "A",
      chips: [
        { icon: "bell",   label: "Notificar seller e abrir exceção"       },
        { icon: "search", label: "Ver os 23 pedidos afetados"             },
        { icon: "check",  label: "Aprovar reatribuição dos 14 críticos"   },
      ],
      detail: {
        title: "Seller Fashion Hub — falha de despacho",
        reportedBy: { agent: "Tarefa gerada por agente", at: "14 jun 2026, 09:42" },
        severity: "high",
        slaHours: 3,
        assignees: ["Seller Agent", "Order Agent", "Logistics Agent"],
        scope: "23 pedidos · Seller Fashion Hub · Canal: Site + App",
        slaRisk: "14 pedidos entregariam hoje",
        diagnosis: {
          text: "Seller Fashion Hub não iniciou despacho para 23 pedidos com SLA de entrega em D+1. Último evento registrado: picking_started às 06:12. Nenhum evento de coleta detectado em 4h. Padrão semelhante em 2 ocorrências anteriores (04/06 e 28/05).",
          confidence: { label: "Média", pct: 74 },
          gap: "Confirmação do carrier ausente"
        },
        suggestedTasks: [
          { name: "Notificar seller e abrir exceção",                 action: "Run",     primary: true, status: "triage"    },
          { name: "Reatribuir para seller alternativo (14 críticos)", action: "Aprovar",                status: "attention" },
          { name: "Notificar clientes com D+1 em risco",              action: "Revisar",                status: "attention" }
        ],
        affectedOrders: {
          total: 23,
          items: [
            { id: "v-PRD-00812", sla: "D+1 hoje · sem coleta",       seller: "Fashion Hub", eta: "14/06/2026" },
            { id: "v-PRD-00811", sla: "D+1 hoje · sem coleta",       seller: "Fashion Hub", eta: "14/06/2026" },
            { id: "v-PRD-00798", sla: "D+2 amanhã · picking parado", seller: "Fashion Hub", eta: "15/06/2026" }
          ]
        },
        activities: [
          { time: "06:12", actor: "Order Agent",     agent: true, action: "registrou picking_started para 23 pedidos do Seller Fashion Hub" },
          { time: "09:12", actor: "Logistics Agent", agent: true, action: "não detectou evento carrier_collected após 3h de picking", note: "SLA de entrega D+1 entrou em risco para o cluster." },
          { time: "09:40", actor: "Order Agent",     agent: true, action: "agrupou os 23 pedidos por causa raiz — ausência de coleta do carrier" },
          { time: "09:41", actor: "Allocation Agent",agent: true, action: "isolou os 14 pedidos com SLA hoje e preparou proposta de reatribuição", note: "Reatribuição excede a política automática — marcada como 'requer aprovação'." },
          { time: "09:42", actor: "Order Management Assistant", agent: true, action: "gerou esta tarefa com 3 ações sugeridas" }
        ],
        chat: [
          { from: "agent", text: "Identifiquei um cluster de 23 pedidos do Seller Fashion Hub sem evento de coleta há mais de 4h — 14 deles têm SLA de entrega hoje." },
          { from: "agent", text: "Já preparei 3 ações sugeridas no canvas. A notificação ao seller é segura para execução direta; a reatribuição dos 14 críticos precisa da sua aprovação. Quer que eu comece pela notificação?" }
        ]
      }
    },

    /* ── Canvas D · Devoluções — decisão necessária em 5 casos ── */
    {
      id: "TA-CANVAS-D",
      occurrenceId: "O093",
      priority: "high",
      status: "attention",
      title: "Devoluções — decisão necessária em 5 casos",
      tag: "Devoluções",
      source: { kind: "return", label: "Devoluções" },
      canvasPattern: "D",
      chips: [
        { icon: "layers", label: "Ver as 4 exceções fora do prazo" },
        { icon: "send",   label: "Resolver duplicidade"            },
        { icon: "search", label: "Ver reasoning da tarefa"         },
      ],
      detail: {
        title: "Devoluções — decisão necessária em 5 casos",
        severity: "high",
        slaHours: null,
        confidence: {
          label: "Alta",
          pct: 93,
          detail: "Nenhuma lacuna identificada: as 9 devoluções aprovadas automaticamente têm prazo, categoria e ausência de duplicidade validados com dados completos. As 4 exceções fora do prazo não têm regra automática aplicável — por isso dependem de decisão humana, e não reduzem a confiança do restante da triagem.",
        },
        lead: "SAC",
        reportedBy: { agent: "Agente", note: "triagem de 14 devoluções do dia" },
        diagnosisText: "Das 14 solicitações do dia, 9 estavam dentro da política e seguiram sem intervenção. Restam 4 exceções fora do prazo e 1 duplicidade — só estas dependem de decisão do operador.",
        decisionNote: { icon: "check", text: "9 devoluções elegíveis processadas automaticamente — etiquetas reversas emitidas, clientes notificados.", action: "Ver log" },
        suggestedTasks: [
          { title: "Resolver duplicidade",             sub: "1 pedido com 2 solicitações abertas",           state: "triage",  action: "Resolver", primary: true, detailKey: "duplicates" },
          { title: "Decidir exceções fora do prazo",    sub: "4 casos sem política automática aplicável",     state: "triage",  action: "Revisar",  external: true, detailKey: "exceptions" },
          { title: "Emitir etiquetas dos aprovados",    sub: "Bloqueada pela duplicidade e exceções acima",   state: "pending", waitingLabel: "Aguardando" },
        ],
        resolvedTasks: [
          { title: "9 devoluções elegíveis processadas automaticamente", sub: "Etiquetas reversas emitidas, clientes notificados", state: "done", action: "Ver log", external: true },
        ],
        exceptions: {
          label: "Fora do prazo — Exceções",
          primaryAction: "Aprovar",
          secondaryAction: "Rejeitar",
          rows: [
            { id: "#SAC-8841", item: "Camiseta linho premium — P · Branco", photo: "👕", reason: "Defeito de fabricação",  reasonDetail: "Recebi a camiseta com um fio puxado e a costura da manga já abrindo. Parece defeito de fabricação, não é uso.", status: "+3 dias fora do prazo" },
            { id: "#SAC-8853", item: "Tênis Run 42",                       photo: "👟", reason: "Arrependimento",          reasonDetail: "Acabei comprando o tamanho errado e não gostei do modelo ao provar em casa. Gostaria de devolver.",             status: "+8 dias fora do prazo" },
            { id: "#SAC-8860", item: "Jaqueta M",                          photo: "🧥", reason: "Tamanho incompatível",    reasonDetail: "A jaqueta ficou pequena, o tamanho não bateu com a tabela de medidas do site. Preciso de um M maior ou reembolso.", status: "+2 dias fora do prazo" },
            { id: "#SAC-8871", item: "Bolsa de couro",                     photo: "👜", reason: "Defeito de fabricação",  reasonDetail: "O zíper da bolsa travou já no segundo uso. Acho que é um defeito, a bolsa é nova.",                             status: "+5 dias fora do prazo" },
          ],
        },
        duplicates: {
          label: "Duplicadas",
          primaryAction: "Manter",
          secondaryAction: "Encerrar",
          rows: [
            { id: "#SAC-8848", item: "Relógio smart", photo: "⌚", reason: "Troca de modelo · canal Site", reasonDetail: "Comprei o relógio errado, quero trocar por outro modelo. Abri o pedido pelo site.",             status: "Duplicada — mesmo pedido, 2 solicitações" },
            { id: "#SAC-8849", item: "Relógio smart", photo: "⌚", reason: "Troca de modelo · canal App",  reasonDetail: "Reenviei a solicitação de troca pelo app porque não vi resposta do site em 2 dias.",         status: "Duplicada — mesmo pedido, 2 solicitações" },
          ],
        },
        reasoningActivities: [
          { time: "06:02", actor: "Agente", agent: true, action: "identificou 14 solicitações de devolução recebidas hoje e iniciou a triagem automática pela política vigente" },
          { time: "06:04", actor: "Agente", agent: true, action: "processou 9 devoluções elegíveis automaticamente", note: "Prazo, categoria e ausência de duplicidade validados — etiquetas reversas emitidas e clientes notificados." },
          { time: "06:05", actor: "Agente", agent: true, action: "identificou 1 pedido com 2 solicitações de devolução abertas (duplicidade)", note: "Mesmo SKU e mesma quantidade — emitir as duas etiquetas criaria risco de reembolso duplo." },
          { time: "06:06", actor: "Agente", agent: true, action: "identificou 4 solicitações fora do prazo de 7 dias da política, sem regra automática aplicável" },
          { time: "06:07", actor: "Agente", agent: true, action: "criou este canvas de decisão", note: "Consolidou a duplicidade e as 4 exceções fora do prazo — únicos casos que dependem de decisão humana entre as 14 solicitações do dia." },
        ],
        chat: [
          { from: "agent", text: "Das 14 devoluções recebidas hoje, já processei 9 automaticamente — dentro da política, com etiqueta reversa emitida e cliente notificado." },
          { from: "agent", text: "Restam 5 casos que dependem de você: 4 exceções fora do prazo e 1 duplicidade. Quer revisar agora?" }
        ]
      }
    },

    /* ── TA-1 · Interromper separação — cancelamento ObraMax ── */
    {
      id: "TA431435",
      priority: "high",
      status: "attention",
      title: "Picking ativo com sinal de cancelamento — interromper separação físicamente",
      tag: "Cancelamento",
      assigneeInitial: "G",
      assigneeInitials: "GV",
      source: { kind: "order", label: "Cancelamento" },
      chips: [
        { icon: "check",  label: "Confirmar parada do Picking no WMS"    },
        { icon: "x",      label: "Iniciar estorno de estoque"             },
        { icon: "send",   label: "Notificar cliente sobre o cancelamento" },
        { icon: "search", label: "Ver pedido ObraMax no detalhe"          },
      ],
      detail: {
        title: "Interromper separação — Cola de Instalação (ObraMax)",
        reportedBy: { agent: "Orchestration Agent", at: "02 jun às 11:47" },
        summary: "Cancelamento parcial recebido para o pedido 68945904 (ObraMax). A Cola de Instalação Vinílica (SKU CI-1KG-VIN) ainda está em Picking ativo no WMS. O agente bloqueou a expedição, mas a parada física da separação requer ação manual do operador.",
        diagnosis: "Cancelamento recebido às 11:45. O workflow de Cancelamento foi acionado e o agente validou a janela — item ainda não expedido, elegível. A etapa 'Bloquear Expedição' está em andamento, mas o WMS não confirmou a interrupção do Picking. O agente sinalizou cancelSignal no step e aguarda confirmação manual. SLA do pedido expirou às 21:58 de 01/06.",
        attributedTo: { name: "Guilherme Vecchi", initial: "G" },
        severity: "high",
        slaHours: -8,
        followUp: [
          { state: "attention", title: "Confirmar parada do Picking no WMS (Cola CI-1KG-VIN)",   assignee: "WMS Operator",        initial: "G" },
          { state: "loading",   title: "Concluir Bloquear Expedição e acionar estorno de estoque", assignee: "Orchestration Agent", agent: true }
        ],
        resolved: [
          { state: "done", title: "Receber solicitação de cancelamento parcial",        assignee: "Orchestration Agent", agent: true },
          { state: "done", title: "Validar janela de cancelamento — item não expedido", assignee: "Orchestration Agent", agent: true },
          { state: "done", title: "Acionar workflow de Cancelamento",                   assignee: "Orchestration Agent", agent: true }
        ],
        impacted: [
          { id: "1631808945904-01", sla: "Expirado (8h desde 01/06 13:58)", seller: "ObraMax", eta: "03/06/2026" }
        ],
        activities: [
          { time: "11:45", actor: "Orchestration Agent", agent: true, action: "recebeu solicitação de cancelamento parcial", note: "Item: Cola de Instalação Vinílica 1kg × 2 (SKU CI-1KG-VIN)." },
          { time: "11:46", actor: "Orchestration Agent", agent: true, action: "validou janela de cancelamento — item ainda em Picking, não expedido" },
          { time: "11:46", actor: "Orchestration Agent", agent: true, action: "acionou workflow de Cancelamento e marcou cancelSignal no step Picking" },
          { time: "11:47", actor: "Orchestration Agent", agent: true, action: "tentou bloquear expedição no WMS — Picking não respondeu ao sinal automático", note: "Ação manual necessária: operador WMS deve interromper a separação física." },
          { time: "11:47", actor: "Orchestration Agent", agent: true, action: "criou esta tarefa para o operador confirmar a parada no WMS" }
        ],
        chat: [
          { from: "agent", text: "Recebi o cancelamento parcial do pedido 68945904 (ObraMax). O cliente quer cancelar a Cola de Instalação, mas o item ainda está em Picking no WMS." },
          { from: "agent", text: "Já acionei o workflow de Cancelamento e sinalizo o step, mas a separação física precisa ser interrompida manualmente. Posso continuar com estorno de estoque e financeiro após a confirmação. Confirmar parada?" }
        ]
      }
    },

    /* ── TA-2 · SLA em risco — DrogariaSP ── */
    {
      id: "TA431436",
      priority: "high",
      status: "attention",
      title: "SLA em risco: Packing + NF-e virtual pendentes com ~4h restantes",
      tag: "Risco de SLA",
      assigneeInitial: "M",
      assigneeInitials: "MA",
      source: { kind: "order", label: "Risco de SLA" },
      chips: [
        { icon: "clock",   label: "Priorizar pedido na fila WMS"              },
        { icon: "sparkle", label: "Desbloquear NF-e produto virtual"           },
        { icon: "graph",   label: "Ver estimativa de SLA"                      },
        { icon: "send",    label: "Escalar para Supervisor"                    },
      ],
      detail: {
        title: "SLA em risco — DrogariaSP (68945903)",
        reportedBy: { agent: "SLA Monitor Agent", at: "02 jun às 10:30" },
        summary: "Pedido 68945903 criado às 10:14 com SLA de 6h (deadline ~16:14). Packing em andamento (manual), mais Labeling, Emissão de NF e Expedição ainda pendentes. Produto virtual tem NF-e travada em 'Ativo' bloqueando o envio por e-mail. Estimativa de conclusão: 17h30 — quebra de SLA provável.",
        diagnosis: "O pedido tem dois Order Jobs: produto virtual (NF-e em processamento → bloqueando entrega digital) e produto físico (Packing ativo, 4 etapas manuais ou dependentes à frente). O caminho crítico do físico exige Packing → Labeling → NF → Expedição antes de 16:14. O agente projeta que o tempo médio restante para concluir todas as etapas supera o SLA em ~1h15.",
        attributedTo: { name: "Maria Santos", initial: "M" },
        severity: "high",
        slaHours: 4,
        followUp: [
          { state: "attention", title: "Priorizar Packing e Labeling na fila WMS (SKU DS-VC-1000)", assignee: "WMS Operator",     initial: "G" },
          { state: "attention", title: "Verificar e desbloquear emissão de NF-e produto virtual",    assignee: "Fiscal Service",   initial: "M" },
          { state: "loading",   title: "Monitorar avanço e alertar se deadline se aproximar",         assignee: "SLA Monitor Agent", agent: true }
        ],
        resolved: [
          { state: "done", title: "Calcular tempo estimado × deadline de SLA",               assignee: "SLA Monitor Agent", agent: true },
          { state: "done", title: "Identificar etapas manuais no caminho crítico",            assignee: "SLA Monitor Agent", agent: true },
          { state: "done", title: "Detectar NF-e virtual travada como bloqueio secundário",   assignee: "SLA Monitor Agent", agent: true }
        ],
        impacted: [
          { id: "1631808945903-01", sla: "~4h restantes (deadline 16:14)", seller: "DrogariaSP", eta: "03/06/2026" }
        ],
        activities: [
          { time: "10:14", actor: "SLA Monitor Agent", agent: true, action: "pedido criado — início do monitoramento de SLA" },
          { time: "10:30", actor: "SLA Monitor Agent", agent: true, action: "projeção de SLA calculada: 4 etapas restantes com estimativa acima do deadline", note: "Deadline 16:14 · Estimativa de conclusão: 17:30." },
          { time: "10:31", actor: "SLA Monitor Agent", agent: true, action: "detectou NF-e virtual em status 'ativo' sem avanço há 15 min", note: "Fiscal Service possivelmente com fila ou integração travada." },
          { time: "10:31", actor: "Orchestration Agent", agent: true, action: "criou esta tarefa e atribuiu ao operador responsável" }
        ],
        chat: [
          { from: "agent", text: "O pedido 68945903 da DrogariaSP tem SLA de 6h com deadline às 16:14. Ainda faltam Packing (ativo), Labeling, NF e Expedição no físico — mais a NF-e do produto virtual travada." },
          { from: "agent", text: "Posso priorizar este pedido na fila do WMS e notificar o Fiscal Service para destravar a NF-e. Avanço automático após cada etapa. Confirmar?" }
        ]
      }
    },

    /* ── TA-3 · BOPIS C&A — cliente ainda não retirou ── */
    {
      id: "TA431437",
      priority: "medium",
      status: "active",
      title: "Cliente notificado há 2h+ e ainda não fez check-in para retirada BOPIS",
      tag: "BOPIS · Retirada na Loja",
      assigneeInitial: "A",
      assigneeInitials: "AF",
      source: { kind: "order", label: "BOPIS · Retirada na Loja" },
      chips: [
        { icon: "check",   label: "Confirmar prontidão da loja C&A Botafogo"   },
        { icon: "send",    label: "Reenviar notificação ao cliente agora"       },
        { icon: "edit",    label: "Registrar check-in manualmente"              },
        { icon: "search",  label: "Ver pedido C&A no detalhe"                  },
      ],
      detail: {
        title: "Check-in BOPIS pendente — C&A Botafogo (68945901)",
        reportedBy: { agent: "Orchestration Agent", at: "02 jun às 13:30" },
        summary: "O pedido BOPIS 68945901 (C&A) teve 'Ready for Pickup' concluído às 11:22. O cliente foi notificado por e-mail e SMS, mas não realizou o check-in na loja até o momento (13:30 — 2h08 depois). Faturamento e Handover at POS seguem pendentes.",
        diagnosis: "Fluxo BOPIS: Picking e Packing concluídos pela loja, cliente notificado às 11:22. O SLA de retirada é de 4h (deadline ~15:22). Faltam Customer Check-in → Emissão de NF → Handover at POS. A loja precisa estar ciente e preparada para atender quando o cliente chegar. Se não houver check-in até 14:45, o agente sugere reenviar a notificação ao cliente.",
        attributedTo: { name: "Ana Pessoa", initial: "A" },
        severity: "medium",
        slaHours: 2,
        followUp: [
          { state: "attention", title: "Confirmar que loja C&A Botafogo está pronta para atendimento", assignee: "Operador Loja", initial: "A" },
          { state: "loading",   title: "Reenviar notificação ao cliente se não houver check-in às 14:45", assignee: "Orchestration Agent", agent: true }
        ],
        resolved: [
          { state: "done", title: "Confirmar Picking e Packing concluídos na loja", assignee: "Operador Loja", initial: "A" },
          { state: "done", title: "Enviar notificação Ready for Pickup por e-mail e SMS", assignee: "Orchestration Agent", agent: true }
        ],
        impacted: [
          { id: "1631808945901-01", sla: "~2h restantes (deadline 15:22)", seller: "C&A · Botafogo RJ", eta: "02/06/2026" }
        ],
        activities: [
          { time: "11:22", actor: "Orchestration Agent", agent: true, action: "concluiu Ready for Pickup e disparou notificação ao cliente", note: "E-mail e SMS enviados com link de instruções de retirada." },
          { time: "13:30", actor: "Orchestration Agent", agent: true, action: "detectou ausência de check-in após 2h08 da notificação", note: "SLA de retirada: 4h. Deadline: 15:22." },
          { time: "13:30", actor: "Orchestration Agent", agent: true, action: "criou esta tarefa para o operador de loja verificar prontidão" }
        ],
        chat: [
          { from: "agent", text: "O pedido BOPIS 68945901 está pronto na C&A Botafogo desde 11:22, mas o cliente ainda não apareceu (são 13:30 agora — 2h08 depois)." },
          { from: "agent", text: "Posso reenviar a notificação ao cliente agora ou agendar para às 14:45 se não houver check-in. Também posso alertar a loja para estar preparada. O que prefere?" }
        ]
      }
    },

    /* ── TA-4 · Samsung — postagem reversa sem confirmação ── */
    {
      id: "TA431438",
      priority: "low",
      title: "Postagem reversa aguardada há +24h sem confirmação do cliente",
      tag: "Logística Reversa",
      status: "active",
      assigneeInitial: "R",
      assigneeInitials: "RC",
      source: { kind: "order", label: "Logística Reversa" },
      chips: [
        { icon: "send",    label: "Reenviar etiqueta reversa ao cliente"        },
        { icon: "chat",    label: "Sugerir texto de follow-up para CS"          },
        { icon: "edit",    label: "Registrar postagem manualmente"              },
        { icon: "search",  label: "Ver pedido Samsung no detalhe"               },
      ],
      detail: {
        title: "Postagem reversa pendente — Samsung Galaxy (68945902)",
        reportedBy: { agent: "Returns Agent", at: "02 jun às 09:00" },
        summary: "A etiqueta reversa para devolução do Samsung Galaxy S24 FE foi enviada ao cliente em 01/06 às 18:36. Já se passaram mais de 24h sem confirmação de postagem. As etapas de Inspeção no CD e Estorno Financeiro estão bloqueadas até a postagem ser confirmada.",
        diagnosis: "Fluxo de devolução iniciado em 01/06/2026 18:32. Etiqueta reversa gerada e enviada por e-mail 4 minutos depois. O passo 'Confirmar Postagem' está ativo há +24h. O cliente pode não ter visto o e-mail, ter dúvidas sobre o processo, ou estar aguardando conveniência para ir à agência. Não há SLA formal para esta etapa, mas o agente monitora para evitar que o prazo de devolução expire.",
        attributedTo: { name: "Rafael Vianna", initial: "R" },
        severity: "low",
        slaHours: null,
        followUp: [
          { state: "attention", title: "Entrar em contato com o cliente para confirmar recebimento da etiqueta", assignee: "CS Operator", initial: "R" },
          { state: "loading",   title: "Monitorar status de postagem via API da Carrier", assignee: "Returns Agent", agent: true }
        ],
        resolved: [
          { state: "done", title: "Validar elegibilidade da solicitação de devolução",   assignee: "Returns Agent", agent: true },
          { state: "done", title: "Classificar como devolução com estorno",               assignee: "Returns Agent", agent: true },
          { state: "done", title: "Gerar e enviar etiqueta reversa ao cliente",           assignee: "Returns Agent", agent: true }
        ],
        impacted: [
          { id: "1631808945902-01", sla: "Sem SLA formal — monitorando", seller: "Samsung", eta: "—" }
        ],
        activities: [
          { time: "01/06 18:32", actor: "Returns Agent", agent: true, action: "recebeu e validou solicitação de devolução por defeito de fabricação" },
          { time: "01/06 18:35", actor: "Returns Agent", agent: true, action: "gerou etiqueta reversa Total Express e enviou ao cliente por e-mail" },
          { time: "02/06 09:00", actor: "Returns Agent", agent: true, action: "detectou ausência de postagem após 14h28 do envio da etiqueta", note: "Nenhuma leitura de rastreamento registrada pela Total Express." },
          { time: "02/06 09:00", actor: "Returns Agent", agent: true, action: "criou esta tarefa para acompanhamento pelo time de CS" }
        ],
        chat: [
          { from: "agent", text: "Enviei a etiqueta reversa para o Samsung Galaxy em 01/06 às 18:35, mas o cliente ainda não postou o produto — já se passaram +24h." },
          { from: "agent", text: "Posso reenviar a etiqueta com instruções de postagem ou sugerir um texto de follow-up para o time de CS entrar em contato. O que prefere?" }
        ]
      }
    },

    /* ── TA-5 · Receita médica pendente — LuzÓtica ── */
    {
      id: "TA431439",
      priority: "high",
      title: "Receita médica não validada — lente especial bloqueada para fabricação",
      tag: "Compliance",
      status: "attention",
      assigneeInitial: "A",
      assigneeInitials: "AS",
      source: { kind: "order", label: "Compliance" },
      chips: [
        { icon: "check",  label: "Verificar anexo enviado pelo cliente" },
        { icon: "check",  label: "Validar dados técnicos da prescrição" },
        { icon: "send",   label: "Aprovar receita e liberar para produção" },
        { icon: "search", label: "Ver pedido LuzÓtica no detalhe" },
      ],
      detail: {
        title: "Validar receita médica — Lente Especial Anti-Reflexo (LuzÓtica)",
        reportedBy: { agent: "SLA Monitor Agent", at: "10 jun às 09:15" },
        summary: "O pedido 68945905 (LuzÓtica) contém uma lente especial sob medida que exige validação de receita médica antes de entrar em produção no laboratório Essilor. A receita foi anexada pelo cliente no checkout, mas ainda não foi validada pela equipe de Atendimento. Enquanto a aprovação estiver pendente, a etapa de Produção da Lente não pode iniciar. O item de óculos de sol do mesmo pedido segue normalmente pelo workflow de Entrega em Domicílio.",
        diagnosis: "Pedido recebido em 10/06 às 08:47. Pagamento confirmado às 08:48. O workflow de Fabricação de Lente foi acionado automaticamente. A tarefa 'Verificar anexo de receita' está ativa há +26 min sem resposta do time de Atendimento. O agente identificou risco de atraso: se a receita não for aprovada em até 2h, o prazo de fabricação (10 dias úteis) não será cumprido e o SLA de entrega expirará.",
        attributedTo: { name: "Atendimento Óptico", initial: "A" },
        severity: "high",
        slaHours: 2,
        followUp: [
          { state: "attention", title: "Verificar anexo da receita médica no pedido",         assignee: "Atendimento Óptico", initial: "A" },
          { state: "attention", title: "Validar grau, eixo e parâmetros técnicos da lente",   assignee: "Atendimento Óptico", initial: "A" },
          { state: "loading",   title: "Aguardar aprovação para acionar laboratório Essilor", assignee: "SLA Monitor Agent",  agent: true  }
        ],
        resolved: [
          { state: "done", title: "Confirmar pagamento aprovado",                    assignee: "SLA Monitor Agent", agent: true },
          { state: "done", title: "Acionar workflow de Fabricação de Lente",         assignee: "SLA Monitor Agent", agent: true },
          { state: "done", title: "Detectar ausência de validação após 20 min",      assignee: "SLA Monitor Agent", agent: true }
        ],
        impacted: [
          { id: "1631808945905-01", sla: "Risco de atraso se não aprovado em 2h", seller: "LuzÓtica", eta: "23/06/2026" }
        ],
        activities: [
          { time: "08:47", actor: "SLA Monitor Agent", agent: true, action: "recebeu pedido LuzÓtica com lente especial e item de óculos de sol" },
          { time: "08:48", actor: "SLA Monitor Agent", agent: true, action: "confirmou pagamento aprovado e acionou workflows: Fabricação de Lente + Entrega em Domicílio" },
          { time: "09:08", actor: "SLA Monitor Agent", agent: true, action: "detectou tarefa 'Verificar anexo de receita' sem resposta após 20 min", note: "Nenhuma ação do time de Atendimento registrada." },
          { time: "09:15", actor: "SLA Monitor Agent", agent: true, action: "criou esta tarefa para priorização pelo time de Atendimento Óptico" }
        ],
        chat: [
          { from: "agent", text: "O pedido de lente especial (LuzÓtica) está aguardando validação da receita médica há mais de 25 minutos. Sem aprovação, a fabricação no laboratório Essilor não pode iniciar." },
          { from: "agent", text: "O item de óculos de sol do mesmo pedido segue normalmente — já está em Picking. Posso enviar um lembrete ao time de Atendimento ou escalar para um supervisor?" }
        ]
      }
    }

  ];

  const wfCategories = [
    { id: "pagamento",        label: "Pagamento",           desc: "Captura, autorização e conciliação financeira",        color: "#2962FF" },
    { id: "fulfillment",      label: "Fulfillment Físico",  desc: "Preparação e envio de produtos físicos ao cliente",    color: "#00897B" },
    { id: "logistica-reversa",label: "Logística Reversa",   desc: "Retorno de produtos — trocas e devoluções",            color: "#D97706" },
    { id: "servicos",         label: "Serviços",            desc: "Workflows de valor agregado e pós-venda",              color: "#7C3AED" },
    { id: "producao",         label: "Produção sob Medida", desc: "Workflows com ciclo de fabricação externa antes da entrega", color: "#0891B2" },
  ];

  /* Task status vocabulary — OMS Workflow v0.1 (OrderJobs_Workflow_Spec) */
  const TASK_STATUSES = [
    { id: "beginning",               label: "Beginning",                desc: "Task criada no sistema." },
    { id: "without-allocation",      label: "Without Allocation",       desc: "Task criada, mas sem fornecedor definido." },
    { id: "allocated",               label: "Allocated",                desc: "Task atribuída a um fornecedor." },
    { id: "waiting-authorization",   label: "Waiting Authorization",    desc: "Aguardando autorização para prosseguir." },
    { id: "dependency-authorized",   label: "Dependency Authorized",    desc: "Todas as dependências foram autorizadas." },
    { id: "dependency-not-auth",     label: "Dependency Not Authorized",desc: "Alguma dependência não foi autorizada — progresso bloqueado." },
    { id: "service-authorized",      label: "Service Authorized",       desc: "Serviço relacionado à task autorizado a seguir." },
    { id: "service-not-authorized",  label: "Service Not Authorized",   desc: "Serviço não foi autorizado a continuar." },
    { id: "dependency-executed",     label: "Dependency Executed",      desc: "Dependências necessárias foram concluídas." },
    { id: "dependency-not-executed", label: "Dependency Not Executed",  desc: "Alguma dependência necessária não foi concluída." },
    { id: "waiting-go-ahead",        label: "Waiting For Go Ahead",     desc: "Aguardando confirmação manual do merchant/buyer." },
    { id: "service-pending",         label: "Service Pending",          desc: "Aguardando início da execução da task." },
    { id: "executing",               label: "Executing Service",        desc: "Task em execução ativa." },
    { id: "service-executed",        label: "Service Executed",         desc: "Task executada com sucesso." },
    { id: "service-not-executed",    label: "Service Not Executed",     desc: "Task não foi concluída corretamente." },
    { id: "expired",                 label: "Expired",                  desc: "Prazo de execução da task esgotado." },
    { id: "handling-errors",         label: "Handling Execution Errors",desc: "Tentando resolver erro ocorrido na execução." },
    { id: "retry",                   label: "Retry Execution",          desc: "Nova tentativa após erro." },
    { id: "canceled",                label: "Canceled",                 desc: "Task cancelada." },
  ];

  const workflows = [
    /* ── OJ-01: Entrega em domicílio ───────────────────────────────────── */
    { id: "entrega-domicilio", name: "Entrega em domicílio", icon: "🏠",
      category: "fulfillment", status: "active",
      desc: "Itens despachados por transportadora até o endereço do cliente.",
      orders: "4.256", custom: false,
      trigger: { type: "order-start" },
      agentEnabled: true,
      dependencies: [],
      version: "2.1", wfStatus: "published",
      lastEditedAt: "2025-06-02T14:30:00Z", lastEditedBy: "jackeline@vtex.com",
      publishedAt:  "2025-06-02T14:30:00Z", publishedBy:  "jackeline@vtex.com",
      versionLog: [
        { version: "2.1", publishedAt: "2025-06-02T14:30:00Z", publishedBy: "jackeline@vtex.com",
          description: "Adicionada tarefa Expedição à etapa Entrega",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 4256,
          deltas: [{ entity: "task", change: "added", detail: "Expedição — Etapa: Entrega" }] },
        { version: "2.0", publishedAt: "2025-06-01T09:00:00Z", publishedBy: "jackeline@vtex.com",
          description: "Removido gatilho Notify Buyer da tarefa Picking",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 4102,
          deltas: [{ entity: "trigger", change: "removed", detail: "Notify Buyer on Executed — Task: Picking" }] },
        { version: "1.0", publishedAt: "2025-05-15T11:00:00Z", publishedBy: "ana@vtex.com",
          description: "Versão inicial do workflow",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 0,
          deltas: [{ entity: "general config", change: "changed", detail: "Workflow criado" }] },
      ],
      // Ordem de execução na visão "Tarefas" (flat) — independente do agrupamento
      // por etapa: Captura de Pagamento só ocorre após o pedido estar pronto para
      // envio (Labeling), mas a tarefa continua pertencendo à etapa Confirmação de
      // Pagamento (indicador azul) para fins de classificação/gate.
      flatOrder: ["ed-1", "ed-3", "ed-4", "ed-5", "ed-6", "ed-2", "ed-7", "ed-8", "ed-9", "ed-10", "ed-11"],
      stages: [
        { id: "ed-s1", name: "Confirmação de Pagamento", gate: "payment_settled", linkedToNext: true, category: "PAYMENT", tasks: [
          { id: "ed-1", name: "Autorização de Pagamento", type: "auto",   owner: "Adyen",          desc: "Pré-autorização do valor junto à adquirente/gateway." },
          { id: "ed-2", name: "Captura de Pagamento",     type: "auto",   owner: "Adyen",          desc: "Confirmação e captura definitiva do valor autorizado, após o pedido estar pronto para envio." },
        ]},
        { id: "ed-s2", name: "Manuseio", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ed-3", name: "Reserva de Estoque", type: "auto",   owner: "GFL Logística", desc: "Reserva dos itens no estoque para garantir disponibilidade." },
          { id: "ed-4", name: "Picking",            type: "manual", owner: "GFL Logística", desc: "Separação dos produtos no estoque conforme o pedido." },
          { id: "ed-5", name: "Packing",            type: "manual", owner: "GFL Logística", desc: "Embalagem dos produtos selecionados para envio ao cliente." },
          { id: "ed-6", name: "Labeling",           type: "manual", owner: "GFL Logística", desc: "Etiquetagem da embalagem com dados do destinatário e transportadora." },
        ]},
        { id: "ed-s3", name: "Faturamento", gate: "deliverable_ready", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ed-7", name: "Emissão de Nota Fiscal", type: "auto", owner: "NFe.io", desc: "Geração da NF-e para o cliente final." },
        ]},
        { id: "ed-s4", name: "Entrega", gate: "customer_has_goods", linkedToNext: false, category: "DELIVERY", tasks: [
          { id: "ed-8",  name: "Expedição",        type: "manual", owner: "GFL Logística", desc: "Despacho do pedido para a transportadora." },
          { id: "ed-9",  name: "First Mile",       type: "auto",   owner: "Jadlog",        desc: "Transporte inicial do centro de distribuição até o hub." },
          { id: "ed-10", name: "Last Mile",        type: "auto",   owner: "Jadlog",        desc: "Entrega final no endereço do cliente." },
          { id: "ed-11", name: "Proof of Delivery",type: "auto",   owner: "Jadlog",        desc: "Confirmação da entrega com registro de recebimento." },
        ]},
      ]},

    /* ── OJ-02: Retirada na loja (BOPIS) ───────────────────────────────── */
    { id: "retirada-loja", name: "Retirada na loja", icon: "🏪",
      category: "fulfillment", status: "active",
      desc: "Itens separados no estoque da loja para pickup pelo cliente no ponto de venda.",
      orders: "127", custom: false,
      trigger: { type: "order-start" },
      agentEnabled: true,
      dependencies: [],
      version: "1.3", wfStatus: "published",
      lastEditedAt: "2025-05-28T10:15:00Z", lastEditedBy: "jackeline@vtex.com",
      publishedAt:  "2025-05-28T10:15:00Z", publishedBy:  "jackeline@vtex.com",
      versionLog: [
        { version: "1.3", publishedAt: "2025-05-28T10:15:00Z", publishedBy: "jackeline@vtex.com",
          description: "Fornecedor de notificação substituído por Brevo",
          appliedTo: "all_orders", activeOrdersAtPublish: 127,
          deltas: [{ entity: "supplier", change: "replaced", detail: "SendGrid → Brevo — Task: Ready for Pickup" }] },
        { version: "1.2", publishedAt: "2025-05-10T16:00:00Z", publishedBy: "jackeline@vtex.com",
          description: "Dependência de pagamento adicionada",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 98,
          deltas: [{ entity: "dependency", change: "added", detail: "Aguardar Captura de Pagamento antes de Picking" }] },
        { version: "1.0", publishedAt: "2025-04-10T14:00:00Z", publishedBy: "ana@vtex.com",
          description: "Versão inicial do workflow",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 0,
          deltas: [{ entity: "general config", change: "changed", detail: "Workflow criado" }] },
      ],
      stages: [
        { id: "rl-s1", name: "Confirmação de Pagamento", gate: "payment_settled", linkedToNext: true, category: "PAYMENT", tasks: [
          { id: "rl-1", name: "Autorização de Pagamento", type: "auto", owner: "Cielo", desc: "Pré-autorização do valor junto à adquirente/gateway." },
          { id: "rl-2", name: "Captura de Pagamento",     type: "auto", owner: "Cielo", desc: "Confirmação e captura definitiva do valor autorizado." },
        ]},
        { id: "rl-s2", name: "Manuseio", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "rl-3", name: "Reserva de Estoque", type: "auto",   owner: "Intelipost WMS", desc: "Reserva dos itens na loja designada para pickup." },
          { id: "rl-4", name: "Picking",            type: "manual", owner: "Equipe Loja",    desc: "Separação dos produtos no estoque da loja." },
          { id: "rl-5", name: "Packing",            type: "manual", owner: "Equipe Loja",    desc: "Embalagem dos produtos para disponibilização ao cliente." },
          { id: "rl-6", name: "Ready for Pickup",   type: "auto",   owner: "Brevo",          desc: "Notificação ao cliente de que o pedido está pronto para retirada." },
        ]},
        { id: "rl-s3", name: "Faturamento", gate: "deliverable_ready", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "rl-7", name: "Emissão de Nota Fiscal", type: "auto", owner: "Bling", desc: "Geração da NF-e no momento do pickup ou pré-emissão." },
        ]},
        { id: "rl-s4", name: "Entrega em Loja", gate: "customer_has_goods", linkedToNext: false, category: "DELIVERY", tasks: [
          { id: "rl-8", name: "Customer Check-in",  type: "manual", owner: "Equipe Loja", desc: "Confirmação da chegada do cliente na loja." },
          { id: "rl-9", name: "Handover at POS",    type: "manual", owner: "Equipe Loja", desc: "Entrega física do pedido ao cliente no ponto de venda." },
        ]},
      ]},

    /* ── Entrega produto virtual ─────────────────────────────────────────── */
    { id: "entrega-produto-virtual", name: "Entrega produto virtual", icon: "💻",
      category: "servicos", status: "active",
      desc: "Ativação e entrega de produtos digitais: licenças, vouchers, assinaturas e downloads.",
      orders: "234", custom: false,
      trigger: { type: "order-start" },
      agentEnabled: true,
      dependencies: [],
      version: "1.0", wfStatus: "published",
      lastEditedAt: "2025-05-20T10:00:00Z", lastEditedBy: "ana@vtex.com",
      publishedAt:  "2025-05-20T10:00:00Z", publishedBy:  "ana@vtex.com",
      versionLog: [
        { version: "1.0", publishedAt: "2025-05-20T10:00:00Z", publishedBy: "ana@vtex.com",
          description: "Versão inicial do workflow de produto digital",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 0,
          deltas: [{ entity: "general config", change: "changed", detail: "Workflow criado" }] },
      ],
      stages: [
        { id: "vd-s1", name: "Confirmação de Pagamento", gate: "payment_settled", linkedToNext: true, category: "PAYMENT", tasks: [
          { id: "vd-1", name: "Autorização de Pagamento", type: "auto", owner: "Stripe",      desc: "Pré-autorização do valor junto à adquirente/gateway." },
          { id: "vd-2", name: "Captura de Pagamento",     type: "auto", owner: "Stripe",      desc: "Confirmação e captura definitiva do valor autorizado." },
        ]},
        { id: "vd-s2", name: "Ativação Digital", gate: "deliverable_ready", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "vd-3", name: "Gerar Chave / Licença",    type: "auto", owner: "AWS Lambda",  desc: "Geração automática da chave de ativação ou licença digital." },
          { id: "vd-4", name: "Emissão de NF-e",          type: "auto", owner: "Enotas",      desc: "Emissão da nota fiscal para produto digital." },
        ]},
        { id: "vd-s3", name: "Entrega Digital", gate: "customer_has_goods", linkedToNext: false, category: "DELIVERY", tasks: [
          { id: "vd-5", name: "Enviar por E-mail",         type: "auto", owner: "SendGrid",    desc: "Envio da chave / link de acesso ao e-mail do cliente." },
          { id: "vd-6", name: "Confirmação de Acesso",     type: "auto", owner: "AWS Lambda",  desc: "Verificação de que o cliente acessou ou ativou o produto." },
        ]},
      ]},

    /* ── Cancelamento de Pedido ──────────────────────────────────────────── */
    { id: "cancelamento", name: "Cancelamento de Pedido", icon: "🚫",
      category: "fulfillment", status: "active",
      desc: "Fluxo de cancelamento iniciado por cliente ou operador, com reversão de estoque e estorno financeiro.",
      orders: "142", custom: false,
      trigger: { type: "manual" },
      agentEnabled: true,
      dependencies: [],
      version: "1.0", wfStatus: "published",
      lastEditedAt: "2025-05-18T09:00:00Z", lastEditedBy: "jackeline@vtex.com",
      publishedAt:  "2025-05-18T09:00:00Z", publishedBy:  "jackeline@vtex.com",
      versionLog: [
        { version: "1.0", publishedAt: "2025-05-18T09:00:00Z", publishedBy: "jackeline@vtex.com",
          description: "Versão inicial do workflow de cancelamento",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 0,
          deltas: [{ entity: "general config", change: "changed", detail: "Workflow criado" }] },
      ],
      stages: [
        { id: "ca-s1", name: "Solicitação", gate: "cancellation_requested", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ca-1", name: "Receber Solicitação",              type: "auto",   owner: "VTEX Portal",        desc: "Registro da solicitação de cancelamento." },
          { id: "ca-2", name: "Validar Janela de Cancelamento",   type: "auto",   owner: "Intelipost Reverso", desc: "Verifica se o pedido ainda pode ser cancelado." },
        ]},
        { id: "ca-s2", name: "Reversão de Fulfillment", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ca-3", name: "Bloquear Expedição",               type: "auto",   owner: "GFL Logística",      desc: "Interrompe separação/expedição caso ainda em andamento." },
          { id: "ca-4", name: "Estornar Estoque",                 type: "auto",   owner: "GFL Logística",      desc: "Devolução das unidades canceladas ao estoque disponível." },
        ]},
        { id: "ca-s3", name: "Estorno Financeiro", gate: "cancellation_complete", linkedToNext: false, category: "PAYMENT", tasks: [
          { id: "ca-5", name: "Processar Estorno",                type: "auto",   owner: "Adyen",              desc: "Devolução do valor ao cliente pelo método de pagamento original." },
          { id: "ca-6", name: "Notificar Cliente",                type: "auto",   owner: "Brevo",              desc: "Confirmação do cancelamento e prazo de estorno ao cliente." },
        ]},
      ]},

    /* ── Troca e devolução (logística reversa) ──────────────────────────── */
    { id: "troca-devolucao", name: "Troca e devolução", icon: "↩",
      category: "logistica-reversa", status: "active",
      desc: "Logística reversa para trocas e devoluções com estorno financeiro ou reenvio de produto.",
      orders: "83", custom: false,
      trigger: { type: "task-completion", triggerWfId: "entrega-domicilio", triggerTaskId: "ed-11" },
      agentEnabled: false,
      dependencies: ["entrega-domicilio", "retirada-loja"],
      version: "1.0", wfStatus: "published",
      lastEditedAt: "2025-05-25T11:00:00Z", lastEditedBy: "ana@vtex.com",
      publishedAt:  "2025-05-25T11:00:00Z", publishedBy:  "ana@vtex.com",
      versionLog: [
        { version: "1.0", publishedAt: "2025-05-25T11:00:00Z", publishedBy: "ana@vtex.com",
          description: "Versão inicial do workflow de troca e devolução",
          appliedTo: "new_orders_only", activeOrdersAtPublish: 0,
          deltas: [{ entity: "general config", change: "changed", detail: "Workflow criado" }] },
      ],
      stages: [
        { id: "td-s1", name: "Solicitação", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "td-1", name: "Abertura de Solicitação",          type: "auto",   owner: "VTEX Portal",        desc: "Cliente abre solicitação de troca ou devolução no portal." },
          { id: "td-2", name: "Validar Elegibilidade",            type: "auto",   owner: "Intelipost Reverso", desc: "Verificação de prazo, política e condição do produto." },
          { id: "td-3", name: "Classificar (Troca / Devolução)",  type: "auto",   owner: "Intelipost Reverso", desc: "Define se o caso é troca por novo item ou devolução com estorno." },
        ]},
        { id: "td-s2", name: "Coleta Reversa", linkedToNext: true, category: "DELIVERY", tasks: [
          { id: "td-4", name: "Gerar Etiqueta Reversa", type: "auto",   owner: "Correios API", desc: "Emissão da etiqueta de postagem reversa para o cliente." },
          { id: "td-5", name: "Notificar Cliente",      type: "auto",   owner: "Zenvia",       desc: "Envio das instruções de devolução ao cliente." },
          { id: "td-6", name: "Confirmar Postagem",     type: "auto",   owner: "Correios",     desc: "Registro da postagem do item pelo cliente." },
        ]},
        { id: "td-s3", name: "Inspeção no CD", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "td-7", name: "Receber Produto no CD",       type: "manual", owner: "FullComm", desc: "Recebimento e entrada do produto devolvido no centro de distribuição." },
          { id: "td-8", name: "Conferir Estado do Produto",  type: "manual", owner: "FullComm", desc: "Avaliação física do item: aprovado para reenvio ou descarte." },
        ]},
        { id: "td-s4", name: "Resolução", linkedToNext: false, category: "FULFILLMENT", tasks: [
          { id: "td-9",  name: "Processar Estorno",             type: "auto",   owner: "Braspag",  desc: "Devolução do valor ao cliente via método de pagamento original." },
          { id: "td-10", name: "Separar e Despachar Novo Item", type: "manual", owner: "FullComm", desc: "Fulfillment do item de troca para reenvio ao cliente." },
          { id: "td-11", name: "Notificar Cliente — Concluído", type: "auto",   owner: "Zenvia",   desc: "Confirmação final do processo para o cliente." },
        ]},
      ]},

    /* ── Fabricação de Lente ────────────────────────────────────────────── */
    { id: "fabricacao-lente", name: "Fabricação de Lente", icon: "🔬",
      category: "producao", status: "active",
      desc: "Validação da receita médica e produção da lente em laboratório parceiro. Pré-requisito para entrega de óculos de grau e lentes especiais.",
      orders: "0", custom: false,
      trigger: { type: "order-start" },
      agentEnabled: true,
      dependencies: [],
      stages: [
        { id: "fl-s1", name: "Validação de Receita", gate: "prescription_approved", linkedToNext: true, category: "COMPLIANCE", tasks: [
          { id: "fl-1", name: "Verificar anexo de receita",   type: "manual", owner: "Atendimento", desc: "Confirmar que o cliente anexou a receita médica no momento da compra." },
          { id: "fl-2", name: "Validar dados da prescrição",  type: "manual", owner: "Atendimento", desc: "Conferir grau, eixo, curvatura e demais parâmetros técnicos da lente." },
          { id: "fl-3", name: "Aprovar receita",              type: "manual", owner: "Atendimento", desc: "Aprovação libera o pedido para produção. Sem aprovação, o pedido não avança." },
        ]},
        { id: "fl-s2", name: "Produção da Lente", linkedToNext: false, category: "PRODUCTION", tasks: [
          { id: "fl-4", name: "Acionar laboratório",     type: "auto",   owner: "Essilor API", desc: "Agente notifica o laboratório parceiro para iniciar a fabricação." },
          { id: "fl-5", name: "Monitorar produção",      type: "auto",   owner: "Essilor API", desc: "Agente acompanha o prazo de produção junto ao laboratório." },
          { id: "fl-6", name: "Confirmar lente pronta",  type: "auto",   owner: "Essilor API", desc: "Laboratório confirma produto finalizado e enviado ao centro de distribuição." },
        ]},
      ]},
  ];

  /* ── Workflow library (templates for wizard — previously in view-workflow-board.jsx) ── */
  const libraryWfs = [
    { id: "boleto", name: "Boleto Bancário", icon: "📋", category: "pagamento",
      desc: "Geração, envio e confirmação de pagamento via boleto bancário",
      stages: [
        { name: "Emissão",       linkedToNext: true,  tasks: [{ id: "bl-1", name: "Gerar boleto", type: "auto", owner: "Gateway" }, { id: "bl-2", name: "Enviar por e-mail", type: "auto", owner: "Notif. Agent" }] },
        { name: "Monitoramento", linkedToNext: true,  tasks: [{ id: "bl-3", name: "Aguardar pagamento", type: "auto", owner: "Gateway" }] },
        { name: "Confirmação",   tasks: [{ id: "bl-4", name: "Confirmar e liberar pedido", type: "auto", owner: "OMS" }] }
      ]},
    { id: "entrega-agendada", name: "Entrega Agendada", icon: "🗓️", category: "fulfillment",
      desc: "Pedidos com janela de entrega agendada pelo cliente",
      stages: [
        { name: "Agendamento", linkedToNext: true, tasks: [{ id: "ea-1", name: "Confirmar janela com cliente", type: "auto", owner: "Notif. Agent" }] },
        { name: "Preparação",  linkedToNext: true, tasks: [{ id: "ea-2", name: "Separar produto no dia", type: "manual", owner: "WMS Operator" }] },
        { name: "Entrega",     tasks: [{ id: "ea-3", name: "Cumprir janela agendada", type: "manual", owner: "Carrier" }] }
      ]},
    { id: "recusa-pgto", name: "Recusa de Pagamento", icon: "🚫", category: "pagamento",
      desc: "Retentativa e resolução de pagamentos recusados pela operadora",
      stages: [
        { name: "Detecção",    linkedToNext: true,  tasks: [{ id: "rp-1", name: "Detectar recusa", type: "auto", owner: "Gateway" }, { id: "rp-2", name: "Notificar cliente", type: "auto", owner: "Notif. Agent" }] },
        { name: "Retentativa", linkedToNext: false, tasks: [{ id: "rp-3", name: "Retentar cobrança", type: "auto", owner: "Gateway" }] },
        { name: "Resolução",   tasks: [{ id: "rp-4", name: "Cancelar ou confirmar pedido", type: "auto", owner: "OMS Agent" }] }
      ]},
    { id: "giftcard", name: "Gift Card", icon: "🎁", category: "servicos",
      desc: "Emissão e validação de gift cards na compra e no resgate",
      stages: [
        { name: "Emissão",   linkedToNext: true, tasks: [{ id: "gc-1", name: "Gerar código", type: "auto", owner: "Platform" }, { id: "gc-2", name: "Enviar ao presenteado", type: "auto", owner: "Notif. Agent" }] },
        { name: "Validação", tasks: [{ id: "gc-3", name: "Validar resgate", type: "auto", owner: "Platform" }] }
      ]},
    { id: "assinatura", name: "Assinatura", icon: "🔁", category: "servicos",
      desc: "Gestão de cobranças recorrentes e renovações automáticas de assinatura",
      stages: [
        { name: "Cobrança",    linkedToNext: true, tasks: [{ id: "as-1", name: "Cobrar recorrência", type: "auto", owner: "Gateway" }] },
        { name: "Fulfillment", linkedToNext: true, tasks: [{ id: "as-2", name: "Gerar pedido automático", type: "auto", owner: "OMS" }] },
        { name: "Entrega",     tasks: [{ id: "as-3", name: "Despachar pedido", type: "auto", owner: "Carrier" }] }
      ]},
    { id: "b2b-faturamento", name: "Faturamento B2B", icon: "📊", category: "pagamento",
      desc: "Faturamento com prazo e análise de crédito para clientes B2B",
      stages: [
        { name: "Crédito",     linkedToNext: true, tasks: [{ id: "b2-1", name: "Verificar limite de crédito", type: "auto", owner: "Finance Agent" }] },
        { name: "Faturamento", linkedToNext: true, tasks: [{ id: "b2-2", name: "Emitir nota fiscal", type: "auto", owner: "Fiscal Service" }, { id: "b2-3", name: "Enviar ao cliente", type: "auto", owner: "Notif. Agent" }] },
        { name: "Cobrança",    tasks: [{ id: "b2-4", name: "Monitorar vencimento", type: "auto", owner: "Finance Agent" }] }
      ]},
  ];

  /* ── Autocomplete suggestions for wizard (previously in view-workflow-board.jsx) ── */
  const stageSuggestions = [
    "Recebimento", "Validação", "Triagem", "Processamento", "Análise",
    "Aprovação", "Emissão", "Envio", "Confirmação", "Monitoramento",
    "Separação", "Embalagem", "Despacho", "Entrega", "Notificação",
    "Revisão", "Devolução", "Reembolso", "Cancelamento", "Cobrança",
    "Suporte", "Auditoria", "Integração", "Sincronização", "Análise de fraude",
  ];

  const taskSuggestions = [
    "Verificar dados do pedido", "Notificar cliente por e-mail",
    "Notificar cliente por SMS", "Atualizar status no sistema",
    "Aprovar manualmente", "Gerar documento", "Consultar API externa",
    "Registrar no log", "Validar pagamento", "Confirmar estoque",
    "Imprimir etiqueta", "Acionar transportadora", "Verificar fraude",
    "Emitir nota fiscal", "Processar reembolso", "Arquivar pedido",
    "Escalar para operador", "Enviar webhook", "Cobrar recorrência",
    "Criar pedido automático",
  ];

  // My AI Team — replaces existing AppData.aiTeam with order-related agents
  const aiTeam = [
    { id: "assistant",      name: "Meu Assistente",          emoji: "✨", color: "linear-gradient(135deg,#FF3D6E,#9747FF)", tasks: 28430, credits: 142500, sub: "Visão geral · pedidos · workflows" },
    { id: "orchestration",  name: "Agentes de Pedidos",      emoji: "🛠", color: "linear-gradient(135deg,#9747FF,#2962FF)", tasks: 18620, credits: 98400,  sub: "Ativo · 4.256 pedidos monitorados" },
    { id: "sla",            name: "SLA Monitor Agent",       emoji: "⏱", color: "#FFE3E3", tasks: 8240,  credits: 32100, sub: "Detecta pedidos travados acima do SLA" },
    { id: "returns",        name: "Returns Agent",           emoji: "↩",  color: "#E5F0FF", tasks: 4120,  credits: 19800, sub: "Logística reversa e devoluções" },
    { id: "marketplace",    name: "Marketplace Agent",       emoji: "🛒", color: "#FFF3C7", tasks: 6840,  credits: 28700, sub: "Integrações de marketplace" },
    { id: "oms",            name: "OMS Agent",               emoji: "📦", color: "#E3F8E5", tasks: 12150, credits: 47600, sub: "Order Management & routing" }
  ];

  /* ─── helpers reutilizáveis para steps ──────────────────────────── */
  function stepsDeliveryAllDone(d) {
    return [
      { label:"Autorização de Pagamento", icon:"💳", status:"done", agent:true,  time:d+" 09:43" },
      { label:"Captura de Pagamento",     icon:"💳", status:"done", agent:true,  time:d+" 09:43" },
      { label:"Reserva de Estoque",       icon:"📦", status:"done", agent:true,  time:d+" 09:44" },
      { label:"Picking",                  icon:"🔍", status:"done", agent:false, time:d+" 10:30" },
      { label:"Packing",                  icon:"📦", status:"done", agent:false, time:d+" 10:50" },
      { label:"Labeling",                 icon:"🏷️", status:"done", agent:false, time:d+" 11:00" },
      { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"done", agent:true,  time:d+" 11:01" },
      { label:"Expedição",                icon:"📮", status:"done", agent:false, time:d+" 11:30" },
      { label:"First Mile",               icon:"🚚", status:"done", agent:true,  time:d+" 13:00" },
      { label:"Last Mile",                icon:"🚚", status:"done", agent:true,  time:d+" 16:00" },
      { label:"Proof of Delivery",        icon:"✅", status:"done", agent:true,  time:d+" 17:30" },
    ];
  }
  function stepsBOPISNotified(d) {
    return [
      { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:d+" 09:43" },
      { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:d+" 09:43" },
      { label:"Reserva de Estoque",       icon:"📦", status:"done",    agent:true,  time:d+" 09:44" },
      { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:d+" 11:00" },
      { label:"Packing",                  icon:"📦", status:"done",    agent:false, time:d+" 11:20" },
      { label:"Ready for Pickup",         icon:"🔔", status:"done",    agent:true,  time:d+" 11:22", note:"Cliente notificado por e-mail e SMS." },
      { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
      { label:"Customer Check-in",        icon:"🏪", status:"pending", agent:false, time:null },
      { label:"Handover at POS",          icon:"🤝", status:"pending", agent:false, time:null },
    ];
  }

  const orders = [

    /* ══ Pedido 1 · C&A · Omnicanal: BOPIS + entrega domicílio ══ */
    {
      id:"1631808945901-01", short:"68945901",
      date:"02/06/2026 - 09:42", customer:"Mariana Figueiredo",
      origin:"Marketplace", qty:5, total:"R$ 1.139,20",
      status:"processing", statusLabel:"Em processamento",
      sla:"4h", seller:"C&A", eta:"02/06/2026",
      customerDetail:{
        taxId:"843.291.752-00",
        phone:"(21) 99823-4571",
        email:"mariana.figueiredo@email.com",
        address:"Rua das Laranjeiras, 142, Apto 301 · Botafogo – Rio de Janeiro, RJ · CEP 22240-003",
        billingAddress:"Rua das Laranjeiras, 142, Apto 301 · Botafogo – Rio de Janeiro, RJ · CEP 22240-003",
        card:"Visa **** 4512",
      },
      note:{
        useCase:"Pedido omnicanal: múltiplas modalidades de entrega no mesmo carrinho",
        text:"Cenário recorrente em varejistas com operação física e digital. O cliente adicionou ao mesmo carrinho itens para retirar na loja e itens para entrega em domicílio. O OMS identificou automaticamente as modalidades, criou Order Jobs separados e acionou os workflows de Retirada na Loja (BOPIS) e Entrega em Domicílio via Jadlog. Os 2 itens de entrega já foram despachados e entregues com sucesso. Os 3 itens de retirada estão prontos na C&A Botafogo aguardando a visita do cliente.",
      },
      itemGroups:[
        {
          id:"g-bopis", workflow:"retirada-loja", fulfillmentType:"pickup",
          supplier:"C&A · Botafogo RJ",
          label:"Retirada na Loja · C&A Botafogo – RJ",
          projections:[
            { name:"warehouse",      connector:"wms",             status:"done"    },
            { name:"payment",        connector:"payment-gateway",  status:"done"    },
            { name:"invoice",        connector:"fiscal-service",   status:"pending" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done" },
            { icon:"🏪", label:"Handling na Loja",          status:"done" },
            { icon:"🧾", label:"Faturamento",               status:"pending" },
            { icon:"🤝", label:"Entrega em Loja",           status:"pending" },
          ],
          items:[
            { name:"Blusa Feminina Listrada",  emoji:"👗", sku:"CA-BL-1042", qty:2, price:"R$ 119,90", steps:stepsBOPISNotified("02/06/2026") },
            { name:"Calça Jeans Slim Fit",     emoji:"👖", sku:"CA-CJ-2187", qty:1, price:"R$ 189,90", steps:stepsBOPISNotified("02/06/2026") },
            { name:"Tênis Casual Urban",        emoji:"👟", sku:"CA-TN-3051", qty:1, price:"R$ 299,90", steps:stepsBOPISNotified("02/06/2026") },
          ],
        },
        {
          id:"g-delivery", workflow:"entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Jadlog",
          label:"Entrega em Domicílio · Jadlog",
          projections:[
            { name:"warehouse",      connector:"wms",             status:"done" },
            { name:"carrier",        connector:"jadlog",           status:"done" },
            { name:"payment",        connector:"payment-gateway",  status:"done" },
            { name:"invoice",        connector:"fiscal-service",   status:"done" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done" },
            { icon:"📦", label:"Handling",                 status:"done" },
            { icon:"🧾", label:"Faturamento",              status:"done" },
            { icon:"🚚", label:"Entrega",                  status:"done" },
          ],
          items:[
            { name:"Camiseta Básica Pack 2un", emoji:"👕", sku:"CA-CB-0991", qty:1, price:"R$ 89,90",  steps:stepsDeliveryAllDone("02/06/2026") },
            { name:"Bermuda Cargo",            emoji:"🩳", sku:"CA-BC-1773", qty:2, price:"R$ 149,90", steps:stepsDeliveryAllDone("02/06/2026") },
          ],
        },
      ],
    },

    /* ══ Pedido 2 · Samsung · Troca e devolução por defeito ══ */
    {
      id:"1631808945902-01", short:"68945902",
      date:"30/05/2026 - 14:17", customer:"Ricardo Alves",
      origin:"Marketplace", qty:1, total:"R$ 3.518,90",
      status:"return", statusLabel:"Troca e devolução",
      sla:"—", seller:"Samsung", eta:"—",
      customerDetail:{
        taxId:"512.473.890-12",
        phone:"(11) 98734-2019",
        email:"r.alves@gmail.com",
        address:"Av. Paulista, 1578, Conj. 42 · Bela Vista – São Paulo, SP · CEP 01310-200",
        billingAddress:"Av. Paulista, 1578, Conj. 42 · Bela Vista – São Paulo, SP · CEP 01310-200",
        card:"Mastercard **** 8834",
      },
      note:{
        useCase:"Logística reversa pós-entrega: devolução por defeito de produto",
        text:"Cenário de pós-venda em que o cliente reportou defeito no produto após o recebimento. O workflow de Troca e Devolução foi acionado automaticamente após a conclusão do workflow de Entrega. O Returns Agent validou a elegibilidade dentro do prazo de 7 dias, classificou como devolução com estorno e gerou a etiqueta reversa. O processo aguarda a postagem pelo cliente para seguir para inspeção no CD e liberação do estorno.",
      },
      itemGroups:[
        {
          id:"g-delivery", workflow:"entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Total Express",
          label:"Entrega em Domicílio · Total Express",
          projections:[
            { name:"warehouse",      connector:"wms",             status:"done" },
            { name:"carrier",        connector:"total-express",    status:"done" },
            { name:"payment",        connector:"payment-gateway",  status:"done" },
            { name:"invoice",        connector:"fiscal-service",   status:"done" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done" },
            { icon:"📦", label:"Handling",                 status:"done" },
            { icon:"🧾", label:"Faturamento",              status:"done" },
            { icon:"🚚", label:"Entrega",                  status:"done" },
          ],
          items:[
            { name:"Samsung Galaxy S24 FE 128GB", emoji:"📱", sku:"SM-S724B", qty:1, price:"R$ 3.499,00", steps:stepsDeliveryAllDone("30/05/2026") },
          ],
        },
        {
          id:"g-return", workflow:"troca-devolucao", type:"return",
          fulfillmentType:"return",
          supplier:"Total Express",
          label:"Troca e Devolução",
          projections:[
            { name:"carrier",        connector:"total-express",    status:"active"  },
            { name:"warehouse",      connector:"wms",              status:"pending" },
            { name:"payment",        connector:"payment-gateway",  status:"pending" },
          ],
          returnDetail:{
            reason:"Produto com defeito de fabricação",
            customerText:"Recebi o aparelho e na primeira semana de uso a tela começou a apresentar linhas horizontais. Tentei reiniciar e o problema persiste. Gostaria de trocar por um novo ou receber o reembolso integral.",
            requestedAt:"01/06/2026 18:32",
            classification:"Devolução com estorno",
          },
          stages:[
            { icon:"📝", label:"Solicitação",    status:"done"    },
            { icon:"📦", label:"Coleta Reversa", status:"active"  },
            { icon:"🔍", label:"Inspeção no CD", status:"pending" },
            { icon:"✅", label:"Resolução",       status:"pending" },
          ],
          items:[
            { name:"Samsung Galaxy S24 FE 128GB", emoji:"📱", sku:"SM-S724B", qty:1, price:"R$ 3.499,00",
              steps:[
                { label:"Abertura de Solicitação",          icon:"📝", status:"done",    agent:true,  time:"01/06/2026 18:32" },
                { label:"Validar Elegibilidade",            icon:"🔍", status:"done",    agent:true,  time:"01/06/2026 18:33" },
                { label:"Classificar (Troca / Devolução)",  icon:"📋", status:"done",    agent:true,  time:"01/06/2026 18:33", note:"Classificado como: Devolução com estorno." },
                { label:"Gerar Etiqueta Reversa",           icon:"🏷️", status:"done",    agent:true,  time:"01/06/2026 18:35" },
                { label:"Notificar Cliente",                icon:"🔔", status:"done",    agent:true,  time:"01/06/2026 18:36" },
                { label:"Confirmar Postagem",               icon:"📮", status:"active",  agent:true,  time:null, note:"Aguardando postagem pelo cliente." },
                { label:"Receber Produto no CD",            icon:"📦", status:"pending", agent:false, time:null },
                { label:"Conferir Estado do Produto",       icon:"🔎", status:"pending", agent:false, time:null },
                { label:"Processar Estorno",                icon:"💰", status:"pending", agent:true,  time:null },
                { label:"Notificar Cliente — Concluído",    icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
      ],
    },

    /* ══ Pedido 3 · DrogariaSP · Item virtual + item físico ══ */
    {
      id:"1631808945903-01", short:"68945903",
      date:"02/06/2026 - 10:14", customer:"Patrícia Souza",
      origin:"Loja própria", qty:2, total:"R$ 339,30",
      status:"processing", statusLabel:"Em processamento",
      sla:"6h", seller:"DrogariaSP", eta:"03/06/2026",
      customerDetail:{
        taxId:"234.781.456-09",
        phone:"(11) 97453-8821",
        email:"patricia.souza@outlook.com",
        address:"Rua Augusta, 2345, Apto 12 · Consolação – São Paulo, SP · CEP 01413-100",
        billingAddress:"Rua Augusta, 2345, Apto 12 · Consolação – São Paulo, SP · CEP 01413-100",
        card:"Elo **** 2290",
      },
      note:{
        useCase:"Carrinho misto: produto virtual e produto físico no mesmo pedido",
        text:"Cenário típico em farmácias e plataformas de saúde com serviços digitais. O cliente comprou uma assinatura de consulta online (produto virtual) e um suplemento vitamínico (produto físico). O OMS separou os itens em dois Order Jobs com workflows distintos — Entrega Produto Virtual para a assinatura e Entrega em Domicílio para o suplemento. A assinatura está com a chave gerada aguardando envio por e-mail; o produto físico está em processo de embalagem.",
      },
      itemGroups:[
        {
          id:"g-virtual", workflow:"entrega-produto-virtual", type:"virtual",
          fulfillmentType:"virtual",
          supplier:"Digital Service",
          label:"Entrega Produto Virtual · Acesso Digital",
          projections:[
            { name:"digital",        connector:"digital-service",  status:"active"  },
            { name:"payment",        connector:"payment-gateway",   status:"done"    },
            { name:"invoice",        connector:"fiscal-service",    status:"error"   },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done"    },
            { icon:"💻", label:"Ativação Digital",          status:"active"  },
            { icon:"📧", label:"Entrega Digital",           status:"pending" },
          ],
          items:[
            { name:"Consulta Online — Assinatura 3 meses", emoji:"💻", sku:"DS-CO-3M", qty:1, price:"R$ 149,90",
              steps:[
                { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Gerar Chave / Licença",    icon:"🔑", status:"done",    agent:true,  time:"02/06/2026 10:16" },
                { label:"Emissão de NF-e",          icon:"🧾", status:"active",  agent:true,  time:null, connectorStatus:"api_error", connectorNote:"Fiscal Service retornou 503 — retry em andamento" },
                { label:"Enviar por E-mail",        icon:"📧", status:"pending", agent:true,  time:null },
                { label:"Confirmação de Acesso",    icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
        {
          id:"g-physical", workflow:"entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Correios SEDEX",
          label:"Entrega em Domicílio · Correios SEDEX",
          projections:[
            { name:"warehouse",      connector:"wms",              status:"active"  },
            { name:"carrier",        connector:"correios-sedex",    status:"pending" },
            { name:"payment",        connector:"payment-gateway",   status:"done"    },
            { name:"invoice",        connector:"fiscal-service",    status:"pending" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done"    },
            { icon:"📦", label:"Handling",                 status:"active"  },
            { icon:"🧾", label:"Faturamento",              status:"pending" },
            { icon:"🚚", label:"Entrega",                  status:"pending" },
          ],
          items:[
            { name:"Vitamina C 1000mg — 60 comprimidos", emoji:"💊", sku:"DS-VC-1000", qty:5, price:"R$ 33,90",
              steps:[
                { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Reserva de Estoque",       icon:"📦", status:"done",    agent:true,  time:"02/06/2026 10:16" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"02/06/2026 11:00" },
                { label:"Packing",                  icon:"📦", status:"active",  agent:false, time:null },
                { label:"Labeling",                 icon:"🏷️", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",               icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
      ],
    },

    /* ══ Pedido 4 · ObraMax · Kit + individual com cancelamento ══ */
    {
      id:"1631808945904-01", short:"68945904",
      date:"01/06/2026 - 13:58", customer:"Eduardo Nunes",
      origin:"Loja própria", qty:3, total:"R$ 911,60",
      status:"processing", statusLabel:"Em processamento",
      sla:"8h", seller:"ObraMax", eta:"03/06/2026",
      customerDetail:{
        taxId:"678.902.134-88",
        phone:"(51) 98212-3347",
        email:"edu.nunes@construmax.com.br",
        address:"Av. Ipiranga, 6690, Sala 201 · Porto Alegre, RS · CEP 90610-000",
        billingAddress:"Av. Ipiranga, 6690, Sala 201 · Porto Alegre, RS · CEP 90610-000",
        card:"Mastercard **** 7751",
      },
      note:{
        useCase:"Cancelamento parcial: item individual em processo de cancelamento enquanto kit segue para entrega",
        text:"Cenário de cancelamento seletivo em pedido com kit e produto individual. O cliente solicitou o cancelamento de 1 item (cola de instalação) enquanto o kit de piso vinílico segue para entrega. O agente identificou que o item individual ainda estava em separação, acionou o workflow de Cancelamento, bloqueou a expedição e iniciou a reversão de estoque e o estorno financeiro proporcional ao item cancelado.",
      },
      itemGroups:[
        {
          id:"g-kit", workflow:"entrega-domicilio", type:"kit",
          fulfillmentType:"delivery",
          supplier:"Loggi",
          label:"Entrega em Domicílio · Loggi",
          projections:[
            { name:"warehouse",      connector:"wms",              status:"done"   },
            { name:"carrier",        connector:"loggi",             status:"active" },
            { name:"payment",        connector:"payment-gateway",   status:"done"   },
            { name:"invoice",        connector:"fiscal-service",    status:"done"   },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done"   },
            { icon:"📦", label:"Handling",                 status:"done"   },
            { icon:"🧾", label:"Faturamento",              status:"done"   },
            { icon:"🚚", label:"Entrega",                  status:"active" },
          ],
          items:[
            {
              name:"Kit Piso Vinílico + Rodapé",
              emoji:"🪵", sku:"KIT-PISO-RODAPE", qty:1, price:"R$ 780,00",
              isKit:true,
              kitComponents:[
                { name:"Piso Vinílico Premium 2m²",  sku:"PV-2M2-04",  qty:4, unit:"caixas" },
                { name:"Rodapé Vinílico 6cm × 3m",   sku:"RV-6CM-02",  qty:2, unit:"unidades" },
              ],
              steps:[
                { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Reserva de Estoque",       icon:"📦", status:"done",    agent:true,  time:"01/06/2026 14:01" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"01/06/2026 15:30" },
                { label:"Packing",                  icon:"📦", status:"done",    agent:false, time:"01/06/2026 16:00" },
                { label:"Labeling",                 icon:"🏷️", status:"done",    agent:false, time:"01/06/2026 16:15" },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"done",    agent:true,  time:"01/06/2026 16:16" },
                { label:"Expedição",                icon:"📮", status:"done",    agent:false, time:"01/06/2026 17:00" },
                { label:"First Mile",               icon:"🚚", status:"done",    agent:true,  time:"01/06/2026 19:00" },
                { label:"Last Mile",                icon:"🚚", status:"active",  agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
        {
          id:"g-individual", workflow:"entrega-domicilio", type:"canceling",
          fulfillmentType:"delivery",
          supplier:"Correios",
          label:"Entrega em Domicílio · Correios",
          projections:[
            { name:"warehouse",      connector:"wms",              status:"active"  },
            { name:"carrier",        connector:"correios",          status:"pending" },
            { name:"payment",        connector:"payment-gateway",   status:"done"    },
            { name:"invoice",        connector:"fiscal-service",    status:"pending" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done"    },
            { icon:"📦", label:"Handling",                 status:"active"  },
            { icon:"🧾", label:"Faturamento",              status:"pending" },
            { icon:"🚚", label:"Entrega",                  status:"pending" },
          ],
          items:[
            { name:"Cola de Instalação Vinílica 1kg", emoji:"🔧", sku:"CI-1KG-VIN", qty:2, price:"R$ 45,90",
              steps:[
                { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Reserva de Estoque",       icon:"📦", status:"done",    agent:true,  time:"01/06/2026 14:01" },
                { label:"Picking",                  icon:"🔍", status:"active",  agent:false, time:null, cancelSignal:true },
                { label:"Packing",                  icon:"📦", status:"pending", agent:false, time:null },
                { label:"Labeling",                 icon:"🏷️", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",               icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
          cancelGroup:{
            id:"g-cancel", workflow:"cancelamento",
            label:"Cancelamento em andamento",
            stages:[
              { icon:"📝", label:"Solicitação",         status:"done"    },
              { icon:"🔄", label:"Reversão Fulfillment", status:"active"  },
              { icon:"💰", label:"Estorno Financeiro",   status:"pending" },
            ],
            steps:[
              { label:"Receber Solicitação",              icon:"📝", status:"done",    agent:true,  time:"02/06/2026 11:45" },
              { label:"Validar Janela de Cancelamento",   icon:"🔍", status:"done",    agent:true,  time:"02/06/2026 11:46" },
              { label:"Bloquear Expedição",               icon:"🚫", status:"active",  agent:true,  time:null },
              { label:"Estornar Estoque",                 icon:"📦", status:"pending", agent:true,  time:null },
              { label:"Processar Estorno",                icon:"💰", status:"pending", agent:true,  time:null },
              { label:"Notificar Cliente",                icon:"🔔", status:"pending", agent:true,  time:null },
            ],
          },
        },
      ],
    },

    /* ══ Pedido 5 · LuzÓtica · Lente especial + Óculos de sol ══ */
    {
      id:"1631808945905-01", short:"68945905",
      date:"10/06/2026 - 08:47", customer:"Beatriz Mendonça",
      origin:"Loja própria", qty:3, total:"R$ 2.437,00",
      status:"attention", statusLabel:"Atenção necessária",
      sla:"2h", seller:"LuzÓtica", eta:"23/06/2026",
      customerDetail:{
        taxId:"—",
        phone:"(11) 97654-3210",
        email:"beatriz.mendonca@email.com",
        address:"Rua Oscar Freire, 340, Apto 52 · Jardins – São Paulo, SP · CEP 01426-001",
        billingAddress:"Rua Oscar Freire, 340, Apto 52 · Jardins – São Paulo, SP · CEP 01426-001",
        card:"Visa **** 2291",
      },
      note:{
        useCase:"Pedido óptico omnicanal: armação + lente (fabricação → entrega domicílio) + óculos de sol (retirada na loja)",
        text:"Pedido com dois Order Jobs independentes: (1) armação + lente sob medida — a armação está reservada no CD aguardando a fabricação da lente pelo laboratório Essilor (~10 dias úteis), após a qual os dois itens são embalados juntos e entregues em domicílio; (2) óculos de sol — disponível imediatamente na loja para retirada pelo cliente. A lente está bloqueada aguardando validação da receita médica pelo time de Atendimento.",
      },
      itemGroups:[
        {
          id:"g-oculos", workflow:"fabricacao-lente", fulfillmentType:"fabrication",
          supplier:"Essilor · Jadlog",
          label:"Fabricação e Entrega · Essilor + Jadlog",
          projections:[
            { name:"payment",    connector:"payment-gateway", status:"done"    },
            { name:"compliance", connector:"prescription",    status:"active"  },
            { name:"production", connector:"essilor-api",     status:"pending" },
            { name:"warehouse",  connector:"wms",             status:"active"  },
            { name:"invoice",    connector:"fiscal-service",  status:"pending" },
            { name:"carrier",    connector:"jadlog",          status:"pending" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done"    },
            { icon:"📋", label:"Validação de Receita",     status:"active"  },
            { icon:"🔬", label:"Produção da Lente",        status:"pending" },
            { icon:"📦", label:"Montagem e Manuseio",      status:"pending" },
            { icon:"🧾", label:"Faturamento",              status:"pending" },
            { icon:"🚚", label:"Entrega em Domicílio",     status:"pending" },
          ],
          items:[
            /* ── Armação: pronta-entrega, reservada no CD, aguardando lente ── */
            { name:"Armação Oakley Holbrook RX 54mm", emoji:"👓", sku:"LO-OAK-HOLB-54-PRETO", qty:1, price:"R$ 590,00",
              steps:[
                { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Reserva de Estoque",       icon:"📦", status:"done",    agent:true,  time:"10/06/2026 08:49" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"10/06/2026 09:15" },
                { label:"Aguardando lente",         icon:"⏱️", status:"active",  agent:true,  time:null, waitingForFab:true, note:"Armação separada e retida no CD. Será embalada junto com a lente após fabricação." },
                { label:"Packing (armação + lente)",icon:"📦", status:"pending", agent:false, time:null },
                { label:"Labeling",                 icon:"🏷️", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",               icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
            /* ── Lente: fabricação externa, bloqueia entrega do grupo inteiro ── */
            { name:"Lente Especial Anti-Reflexo +2.50/-0.75", emoji:"🔬", sku:"LO-LENTE-AR-250", qty:1, price:"R$ 1.290,00",
              steps:[
                { label:"Autorização de Pagamento",    icon:"💳", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Captura de Pagamento",        icon:"💳", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Verificar anexo de receita",  icon:"📋", status:"active",  agent:false, time:null, note:"Aguardando verificação pelo Atendimento Óptico." },
                { label:"Validar dados da prescrição", icon:"🔍", status:"pending", agent:false, time:null },
                { label:"Aprovar receita",             icon:"✅", status:"pending", agent:false, time:null },
                { label:"Acionar laboratório",         icon:"🔬", status:"pending", agent:true,  time:null },
                { label:"Monitorar produção",          icon:"⏱️", status:"pending", agent:true,  time:null },
                { label:"Confirmar lente pronta",      icon:"📦", status:"pending", agent:true,  time:null, note:"Lente pronta libera Packing conjunto com a armação." },
                { label:"Packing (armação + lente)",   icon:"📦", status:"pending", agent:false, time:null },
                { label:"Labeling",                    icon:"🏷️", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",      icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                   icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",                  icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                   icon:"🚚", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",           icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
        /* ── Group 2: Óculos de Sol — Retirada na Loja ── */
        {
          id:"g-sol", workflow:"retirada-loja", fulfillmentType:"pickup",
          supplier:"LuzÓtica · Loja Jardins SP",
          label:"Retirada na Loja · LuzÓtica Jardins – SP",
          projections:[
            { name:"payment",   connector:"payment-gateway", status:"done"    },
            { name:"warehouse", connector:"wms",             status:"done"    },
            { name:"invoice",   connector:"fiscal-service",  status:"pending" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done"    },
            { icon:"🏪", label:"Handling na Loja",          status:"done"    },
            { icon:"🧾", label:"Faturamento",               status:"pending" },
            { icon:"🤝", label:"Entrega em Loja",           status:"pending" },
          ],
          items:[
            { name:"Óculos de Sol Ray-Ban Aviador RB3025", emoji:"🕶️", sku:"LO-RB-3025-G15", qty:1, price:"R$ 557,00",
              steps:[
                { label:"Autorização de Pagamento", icon:"💳", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Captura de Pagamento",     icon:"💳", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Reserva de Estoque",       icon:"📦", status:"done",    agent:true,  time:"10/06/2026 08:49" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"10/06/2026 09:10" },
                { label:"Packing",                  icon:"📦", status:"done",    agent:false, time:"10/06/2026 09:20" },
                { label:"Ready for Pickup",         icon:"🔔", status:"done",    agent:true,  time:"10/06/2026 09:22", note:"Cliente notificado por e-mail e SMS." },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Customer Check-in",        icon:"🏪", status:"pending", agent:false, time:null },
                { label:"Handover at POS",          icon:"🤝", status:"pending", agent:false, time:null },
              ],
            },
          ],
        },
      ],
    },

    /* ══ Pedido 9 · Loja própria · Canvas D — devolução com defeito confirmado ══ */
    {
      id:"v-PRD-00944", short:"PRD00944",
      date:"07/06/2026 - 15:10", customer:"Fernanda Rocha",
      origin:"Loja própria", qty:1, total:"R$ 289,00",
      status:"return", statusLabel:"Troca e devolução",
      sla:"—", seller:"Loja própria", eta:"15/06/2026",
      customerDetail:{
        taxId:"294.671.038-50",
        phone:"(41) 98891-2276",
        email:"fernanda.rocha@email.com",
        address:"Rua Mateus Leme, 1780, Apto 604 · São Francisco – Curitiba, PR · CEP 80510-190",
        billingAddress:"Rua Mateus Leme, 1780, Apto 604 · São Francisco – Curitiba, PR · CEP 80510-190",
        card:"Visa **** 7742",
      },
      note:{
        useCase:"Devolução com defeito de fabricação confirmado na conferência — decisão de resolução pendente",
        text:"Cliente solicitou devolução via WhatsApp SAC (Ticket #SAC-8841) alegando defeito de fabricação na costura da peça. O item retornou ao CD Sul e a conferência confirmou o defeito — por isso não é elegível para reintegração ao estoque. Falta apenas a decisão do SAC/Financeiro sobre o tipo de resolução (reembolso integral, troca, parcial ou voucher) para liberar o financeiro e comunicar a cliente.",
      },
      itemGroups:[
        {
          id:"g-delivery", workflow:"entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Correios SEDEX",
          label:"Entrega em Domicílio · Correios SEDEX",
          projections:[
            { name:"warehouse", connector:"wms",             status:"done" },
            { name:"carrier",   connector:"correios-sedex",  status:"done" },
            { name:"payment",   connector:"payment-gateway", status:"done" },
            { name:"invoice",   connector:"fiscal-service",  status:"done" },
          ],
          stages:[
            { icon:"💳", label:"Confirmação de Pagamento", status:"done" },
            { icon:"📦", label:"Handling",                 status:"done" },
            { icon:"🧾", label:"Faturamento",              status:"done" },
            { icon:"🚚", label:"Entrega",                  status:"done" },
          ],
          items:[
            { name:"Camiseta Linho Premium — P · Branco", emoji:"👕", sku:"CMB-LIN-001-P-WH", qty:1, price:"R$ 289,00", steps:stepsDeliveryAllDone("07/06/2026") },
          ],
        },
        {
          id:"g-return", workflow:"troca-devolucao", type:"return",
          fulfillmentType:"return",
          supplier:"Correios SEDEX",
          label:"Troca e Devolução",
          projections:[
            { name:"carrier",   connector:"correios-sedex",   status:"done"    },
            { name:"warehouse", connector:"wms",              status:"done"    },
            { name:"payment",   connector:"payment-gateway",  status:"active"  },
          ],
          returnDetail:{
            reason:"Defeito de fabricação — costura lateral",
            customerText:"Recebi o item com defeito na costura lateral. Já uso peças assim há anos e nunca tive esse problema — parece falha de fabricação mesmo, não desgaste de uso.",
            requestedAt:"13/06/2026 14:22",
            classification:"Devolução — decisão de resolução pendente",
          },
          stages:[
            { icon:"📝", label:"Solicitação",         status:"done"    },
            { icon:"📦", label:"Coleta Reversa",       status:"done"    },
            { icon:"🔍", label:"Inspeção no CD",       status:"done"    },
            { icon:"✅", label:"Resolução",             status:"active"  },
          ],
          items:[
            { name:"Camiseta Linho Premium — P · Branco", emoji:"👕", sku:"CMB-LIN-001-P-WH", qty:1, price:"R$ 289,00",
              steps:[
                { label:"Abertura de Solicitação",         icon:"📝", status:"done",    agent:true,  time:"13/06/2026 14:22", note:"Ticket #SAC-8841 · canal WhatsApp SAC." },
                { label:"Validar Elegibilidade",           icon:"🔍", status:"done",    agent:true,  time:"13/06/2026 09:15" },
                { label:"Receber Produto no CD",           icon:"📦", status:"done",    agent:false, time:"13/06/2026 09:15" },
                { label:"Conferir Estado do Produto",      icon:"🔎", status:"done",    agent:false, time:"13/06/2026 09:45", note:"Defeito de fabricação confirmado na costura lateral. Reintegração ao estoque descartada." },
                { label:"Definir Tipo de Resolução",       icon:"🔀", status:"active",  agent:false, time:null, note:"Decisão humana do SAC: reembolso integral, troca, reembolso parcial ou voucher." },
                { label:"Processar Resolução Financeira",  icon:"💰", status:"pending", agent:true,  time:null },
                { label:"Notificar Cliente — Concluído",   icon:"✅", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
      ],
    },

  ];

  /* ── My Tasks — kanban mock (Minhas Tarefas) ── */
  const myTasks = [
    /* ── Em aberto (triage) ── */
    { id: "TSK-101", title: "Validar regra de frete grátis para pedidos acima de R$ 299", status: "triage", source: { kind: "initiative", label: "IN6268" }, assigneeInitials: "JD", assigneeName: "John Davis" },
    { id: "TSK-102", title: "Sincronizar sinônimos de busca para coleção Verão 2026", status: "triage", source: { kind: "initiative", label: "IN6270" }, assigneeInitials: "AC", assigneeName: "Ana Costa" },
    { id: "TSK-103", title: "Revisar metas de conversão da campanha Q2", status: "triage", source: { kind: "campaign", label: "Campanha Q2" }, assigneeInitials: "BS", assigneeName: "Bruno Silva" },
    { id: "TSK-104", title: "Auditar estoque mínimo de SKUs em promoção relâmpago", status: "triage", source: { kind: "order", label: "Pedido 1631808945" }, assigneeInitials: "ML", assigneeName: "Michael Lee" },
    /* ── Trabalhando (active) ── */
    { id: "TSK-201", title: "Implementar teste A/B na vitrine de eletrônicos", status: "active", source: { kind: "content", label: "Vitrine Eletrônicos" }, assigneeInitials: "SM", assigneeName: "Sofia Martins" },
    { id: "TSK-202", title: "Ajustar recomendações da vitrine para usuários recorrentes", status: "active", source: { kind: "initiative", label: "IN6281" }, assigneeInitials: "PA", assigneeName: "Pedro Alves" },
    { id: "TSK-203", title: "Configurar gatilho de reengajamento após abandono de carrinho", status: "active", source: { kind: "campaign", label: "Black Friday" }, assigneeInitials: "LM", assigneeName: "Lucas Moura" },
    /* ── Aguardando ação (attention) ── */
    { id: "TSK-301", title: "Aprovar descrição de produto gerada pelo agente de conteúdo", status: "attention", source: { kind: "content", label: "Conteúdo" }, assigneeInitials: "YO", assigneeName: "You" },
    { id: "TSK-302", title: "Revisar proposta de precificação dinâmica — aguarda aprovação", status: "attention", source: { kind: "initiative", label: "IN6280" }, assigneeInitials: "YO", assigneeName: "You" },
    { id: "TSK-303", title: "Confirmar criação de bundle de kits de presente — Natal 2026", status: "attention", source: { kind: "campaign", label: "Natal 2026" }, assigneeInitials: "YO", assigneeName: "You" },
    /* ── Concluído (completed) ── */
    { id: "TSK-401", title: "Publicar workflow de devolução express (< 48h)", status: "completed", source: { kind: "initiative", label: "IN6265" }, assigneeInitials: "RA", assigneeName: "Rita Almeida" },
    { id: "TSK-402", title: "Migrar catálogo legado — categorias raiz aprovadas", status: "completed", source: { kind: "content", label: "Catálogo" }, assigneeInitials: "TN", assigneeName: "Tiago Nunes" },
    { id: "TSK-403", title: "Ativar notificação de reposição de estoque via WhatsApp", status: "completed", source: { kind: "order", label: "Pedido 163908412" }, assigneeInitials: "CF", assigneeName: "Carla Fontes" },
  ];

  const resources = [
    { id: "all-orders",    icon: "grid",    label: "Todos os pedidos",    sub: "4.256 pedidos · 13 filtros AI ativos" },
    { id: "workflow-board",icon: "board",   label: "Workflow Board",      sub: workflows.length + " workflows · Padrão e customizados" },
    { id: "orchestration", icon: "sparkle", label: "Agentes de Pedidos",  sub: "Ativo · 4.256 pedidos monitorados" }
  ];

  /* ── My Initiatives (v3 parity) ── */
  const initiatives = [
    { id: "INI-201", title: "Reduzir cancelamentos por ruptura de estoque", status: "active",    source: { kind: "initiative", label: "Operação" },   owner: "Guilherme Vecchi", ownerInitials: "GV", tasksTotal: 8, tasksDone: 3, updated: "há 2h" },
    { id: "INI-202", title: "Acelerar SLA de Packing em pedidos BOPIS",      status: "attention", source: { kind: "initiative", label: "Logística" },   owner: "Marina Alves",     ownerInitials: "MA", tasksTotal: 6, tasksDone: 1, updated: "há 40min" },
    { id: "INI-203", title: "Automatizar coleta reversa de devoluções",      status: "active",    source: { kind: "initiative", label: "Pós-venda" },   owner: "Ana Costa",        ownerInitials: "AC", tasksTotal: 5, tasksDone: 4, updated: "ontem" },
    { id: "INI-204", title: "Migração do catálogo legado para Shoreline",    status: "active",    source: { kind: "content",    label: "Catálogo" },    owner: "Tiago Nunes",      ownerInitials: "TN", tasksTotal: 12, tasksDone: 9, updated: "há 3 dias" },
    { id: "INI-205", title: "Campanha de reposição via WhatsApp",            status: "completed", source: { kind: "campaign",    label: "Marketing" },   owner: "Carla Fontes",     ownerInitials: "CF", tasksTotal: 4, tasksDone: 4, updated: "há 1 semana" },
  ];

  /* ── Home (preview) — situation-room dashboard, ported from Canvas-Wireframes ──
     Ambiente isolado: não é referenciado por nenhuma view existente, então não
     influencia a home "orders" atual. Acessível em #/home-preview. ── */
  const opsHome = {
    kpis: [
      { label: "Pedidos afetados agora", value: "47", delta: { direction: "down", text: "12 desde ontem" } },
      { label: "Ocorrências abertas",    value: "8",  note: "3 com severidade alta" },
      { label: "Decisões pendentes",     value: "15", note: "Tempo médio: 2h40" },
      { label: "Tarefas autônomas hoje", value: "132", link: { label: "Ver log" } },
    ],
    occurrences: [
      {
        id: "OCC-1", title: "Devoluções fora da política", category: "Seller X · Devolução",
        severity: "high", orders: 8, tasksDone: 2, tasksTotal: 3,
        assignee: { initial: "AN", name: "Ana" },
      },
      {
        id: "OCC-2", title: "Seller não despachou no SLA", category: "Marketplace · Logística",
        severity: "medium", orders: 23, tasksDone: 1, tasksTotal: 2,
        assignee: { initial: "PA", name: "Paulo" },
        taskId: "TA-CANVAS-A",
      },
      {
        id: "OCC-3", title: "Conflito entre políticas de reembolso", category: "Corner case · Pagamento",
        severity: "high", orders: 1, tasksDone: 0, tasksTotal: 2,
        assignee: { initial: "SU", name: "Supervisor" },
      },
    ],
    decisions: [
      { id: "DEC-1", title: "Aprovar reembolso — pedido #1234",              waiting: "1h20" },
      { id: "DEC-2", title: "Exceção comercial — pedido #1198",              waiting: "3h05" },
      { id: "DEC-3", title: "Confirmar cancelamento — pedido #1276",         waiting: "22min" },
      { id: "DEC-4", title: "Aprovar troca de transportadora — pedido #1301", waiting: "40min" },
      { id: "DEC-5", title: "Revisar limite de reembolso automático",        waiting: "5h10" },
    ],
    digest: {
      tasksCount: 132, decisionsCount: 15, anomaliesCount: 3,
      summary: "132 tarefas autônomas · 15 decisões humanas · 3 anomalias",
    },
  };

  /* ── Home (preview) — variante "fila unificada": ocorrências e tarefas
     misturadas na mesma lista, ordenadas por severidade. Dataset isolado —
     não referencia nem altera `opsHome`. Acessível em #/home-queue. ── */
  const opsHomeQueue = {
    kpis: [
      { label: "Pedidos afetados agora", value: "47",  delta: { direction: "down", text: "12 desde ontem" } },
      { label: "Itens na fila agora",    value: "23",  note: "8 ocorrências · 15 tarefas" },
      { label: "Tarefas autônomas hoje", value: "132", link: { label: "Ver log" } },
    ],
    items: [
      { id: "Q-1", kind: "occurrence", severity: "high",   title: "Devoluções fora da política — Seller X", sub: "8 pedidos · 2 de 3 tarefas concluídas",  assignee: { initial: "AN", name: "Ana" } },
      { id: "Q-2", kind: "occurrence", severity: "high",   title: "Conflito entre políticas de reembolso",   sub: "1 pedido · 0 de 2 tarefas concluídas",   assignee: { initial: "SU", name: "Supervisor" } },
      { id: "Q-3", kind: "task",       severity: "high",   title: "Confirmar cancelamento — pedido #1301",   sub: "Aguardando há 22min" },
      { id: "Q-4", kind: "occurrence", severity: "medium", title: "Seller não despachou no SLA",             sub: "23 pedidos · 1 de 2 tarefas concluídas", assignee: { initial: "PA", name: "Paulo" }, taskId: "TA-CANVAS-A" },
      { id: "Q-5", kind: "task",       severity: "medium", title: "Aprovar reembolso — pedido #1234",        sub: "Aguardando há 1h20" },
      { id: "Q-6", kind: "task",       severity: "medium", title: "Exceção comercial — pedido #1198",        sub: "Aguardando há 3h05" },
      { id: "Q-7", kind: "task",       severity: "low",    title: "Aprovar troca de transportadora — pedido #1276", sub: "Aguardando há 40min" },
      { id: "Q-8", kind: "task",       severity: "low",    title: "Revisar limite de reembolso automático",  sub: "Aguardando há 5h10" },
    ],
  };

  return { AVATARS, conversations, kpis, workflowStages, tasks, myTasks, resources, workflows, wfCategories, aiTeam, orders, libraryWfs, stageSuggestions, taskSuggestions, initiatives, opsHome, opsHomeQueue };
})();

/* ── AppData alias — keeps sidebar.jsx and app.jsx working without changes ── */
window.AppData = { AVATARS: window.AIWData.AVATARS, conversations: window.AIWData.conversations };
