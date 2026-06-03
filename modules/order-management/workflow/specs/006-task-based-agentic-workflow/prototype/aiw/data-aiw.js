/* AIW — extended data for My Assistant (Orders flows merged) */
window.AIWData = (function () {
  const AVATARS = window.AppData?.AVATARS || {};

  const kpis = {
    primary: [
      { label: "Pedidos Hoje",   value: "2", delta: "100%", up: true  },
      { label: "Pedidos Ontem",  value: "1", delta: "50%",  up: false },
      { label: "Últimos 7 Dias", value: "4", delta: "33%",  up: true  },
      { label: "Último Ano",     value: "4", delta: "100%", up: true  }
    ],
    secondary: [
      { label: "Pedidos",      value: "4"           },
      { label: "Ticket Médio", value: "R$ 1.477,25" },
      { label: "Total Bruto",  value: "R$ 5.909,00" }
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

    /* ── TA-1 · Interromper separação — cancelamento ObraMax ── */
    {
      id: "TA431435",
      priority: "high",
      title: "Picking ativo com sinal de cancelamento — interromper separação físicamente",
      tag: "Cancelamento",
      assigneeInitial: "G",
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
      title: "SLA em risco: Packing + NF-e virtual pendentes com ~4h restantes",
      tag: "Risco de SLA",
      assigneeInitial: "M",
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
      title: "Cliente notificado há 2h+ e ainda não fez check-in para retirada BOPIS",
      tag: "BOPIS · Retirada na Loja",
      assigneeInitial: "A",
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
      assigneeInitial: "R",
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
    }

  ];

  const resources = [
    { id: "all-orders",       icon: "grid", label: "Todos os pedidos",         sub: "4.256 pedidos · 13 filtros AI ativos" },
    { id: "workflow-board",   icon: "board", label: "Workflow Board",          sub: "7 workflows · Padrão e customizados" },
    { id: "orchestration",    icon: "sparkle", label: "Agentes de Pedidos", sub: "Ativo · 4.256 pedidos monitorados" }
  ];

  const wfCategories = [
    { id: "pagamento",        label: "Pagamento",           desc: "Captura, autorização e conciliação financeira",        color: "#2962FF" },
    { id: "fulfillment",      label: "Fulfillment Físico",  desc: "Preparação e envio de produtos físicos ao cliente",    color: "#00897B" },
    { id: "logistica-reversa",label: "Logística Reversa",   desc: "Retorno de produtos — trocas e devoluções",            color: "#D97706" },
    { id: "servicos",         label: "Serviços",            desc: "Workflows de valor agregado e pós-venda",              color: "#7C3AED" },
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
      stages: [
        { id: "ed-s1", name: "Confirmação de Pagamento", linkedToNext: true, category: "PAYMENT", tasks: [
          { id: "ed-1", name: "Autorização de Pagamento", type: "auto",   owner: "Gateway",        desc: "Pré-autorização do valor junto à adquirente/gateway." },
          { id: "ed-2", name: "Captura de Pagamento",     type: "auto",   owner: "Gateway",        desc: "Confirmação e captura definitiva do valor autorizado." },
        ]},
        { id: "ed-s2", name: "Handling (Fulfillment)", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ed-3", name: "Reserva de Estoque", type: "auto",   owner: "WMS",         desc: "Reserva dos itens no estoque para garantir disponibilidade." },
          { id: "ed-4", name: "Picking",            type: "manual", owner: "WMS Operator",desc: "Separação dos produtos no estoque conforme o pedido." },
          { id: "ed-5", name: "Packing",            type: "manual", owner: "WMS Operator",desc: "Embalagem dos produtos selecionados para envio ao cliente." },
          { id: "ed-6", name: "Labeling",           type: "manual", owner: "WMS Operator",desc: "Etiquetagem da embalagem com dados do destinatário e transportadora." },
        ]},
        { id: "ed-s3", name: "Faturamento", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ed-7", name: "Emissão de Nota Fiscal", type: "auto", owner: "Fiscal Service", desc: "Geração da NF-e para o cliente final." },
        ]},
        { id: "ed-s4", name: "Entrega", linkedToNext: false, category: "DELIVERY", tasks: [
          { id: "ed-8",  name: "Expedição",        type: "manual", owner: "WMS Operator", desc: "Despacho do pedido para a transportadora." },
          { id: "ed-9",  name: "First Mile",       type: "auto",   owner: "Carrier",      desc: "Transporte inicial do centro de distribuição até o hub." },
          { id: "ed-10", name: "Last Mile",        type: "auto",   owner: "Carrier",      desc: "Entrega final no endereço do cliente." },
          { id: "ed-11", name: "Proof of Delivery",type: "auto",   owner: "Carrier",      desc: "Confirmação da entrega com registro de recebimento." },
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
      stages: [
        { id: "rl-s1", name: "Confirmação de Pagamento", linkedToNext: true, category: "PAYMENT", tasks: [
          { id: "rl-1", name: "Autorização de Pagamento", type: "auto", owner: "Gateway", desc: "Pré-autorização do valor junto à adquirente/gateway." },
          { id: "rl-2", name: "Captura de Pagamento",     type: "auto", owner: "Gateway", desc: "Confirmação e captura definitiva do valor autorizado." },
        ]},
        { id: "rl-s2", name: "Handling (Fulfillment)", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "rl-3", name: "Reserva de Estoque", type: "auto",   owner: "WMS",          desc: "Reserva dos itens na loja designada para pickup." },
          { id: "rl-4", name: "Picking",            type: "manual", owner: "Operador Loja",desc: "Separação dos produtos no estoque da loja." },
          { id: "rl-5", name: "Packing",            type: "manual", owner: "Operador Loja",desc: "Embalagem dos produtos para disponibilização ao cliente." },
          { id: "rl-6", name: "Ready for Pickup",   type: "auto",   owner: "Notif. Agent", desc: "Notificação ao cliente de que o pedido está pronto para retirada." },
        ]},
        { id: "rl-s3", name: "Faturamento", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "rl-7", name: "Emissão de Nota Fiscal", type: "auto", owner: "Fiscal Service", desc: "Geração da NF-e no momento do pickup ou pré-emissão." },
        ]},
        { id: "rl-s4", name: "Entrega em Loja", linkedToNext: false, category: "DELIVERY", tasks: [
          { id: "rl-8", name: "Customer Check-in",  type: "manual", owner: "Operador Loja", desc: "Confirmação da chegada do cliente na loja." },
          { id: "rl-9", name: "Handover at POS",    type: "manual", owner: "Operador Loja", desc: "Entrega física do pedido ao cliente no ponto de venda." },
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
      stages: [
        { id: "vd-s1", name: "Confirmação de Pagamento", linkedToNext: true, category: "PAYMENT", tasks: [
          { id: "vd-1", name: "Autorização de Pagamento", type: "auto", owner: "Gateway",         desc: "Pré-autorização do valor junto à adquirente/gateway." },
          { id: "vd-2", name: "Captura de Pagamento",     type: "auto", owner: "Gateway",         desc: "Confirmação e captura definitiva do valor autorizado." },
        ]},
        { id: "vd-s2", name: "Ativação Digital", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "vd-3", name: "Gerar Chave / Licença",    type: "auto", owner: "Digital Service", desc: "Geração automática da chave de ativação ou licença digital." },
          { id: "vd-4", name: "Emissão de NF-e",          type: "auto", owner: "Fiscal Service",  desc: "Emissão da nota fiscal para produto digital." },
        ]},
        { id: "vd-s3", name: "Entrega Digital", linkedToNext: false, category: "DELIVERY", tasks: [
          { id: "vd-5", name: "Enviar por E-mail",         type: "auto", owner: "Notif. Agent",    desc: "Envio da chave / link de acesso ao e-mail do cliente." },
          { id: "vd-6", name: "Confirmação de Acesso",     type: "auto", owner: "Digital Service", desc: "Verificação de que o cliente acessou ou ativou o produto." },
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
      stages: [
        { id: "ca-s1", name: "Solicitação", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ca-1", name: "Receber Solicitação",              type: "auto",   owner: "Portal",         desc: "Registro da solicitação de cancelamento." },
          { id: "ca-2", name: "Validar Janela de Cancelamento",   type: "auto",   owner: "Returns Agent",  desc: "Verifica se o pedido ainda pode ser cancelado." },
        ]},
        { id: "ca-s2", name: "Reversão de Fulfillment", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "ca-3", name: "Bloquear Expedição",               type: "auto",   owner: "WMS",            desc: "Interrompe separação/expedição caso ainda em andamento." },
          { id: "ca-4", name: "Estornar Estoque",                 type: "auto",   owner: "WMS",            desc: "Devolução das unidades canceladas ao estoque disponível." },
        ]},
        { id: "ca-s3", name: "Estorno Financeiro", linkedToNext: false, category: "PAYMENT", tasks: [
          { id: "ca-5", name: "Processar Estorno",                type: "auto",   owner: "Gateway",        desc: "Devolução do valor ao cliente pelo método de pagamento original." },
          { id: "ca-6", name: "Notificar Cliente",                type: "auto",   owner: "Notif. Agent",   desc: "Confirmação do cancelamento e prazo de estorno ao cliente." },
        ]},
      ]},

    /* ── Troca e devolução (logística reversa) ──────────────────────────── */
    { id: "troca-devolucao", name: "Troca e devolução", icon: "↩",
      category: "logistica-reversa", status: "active",
      desc: "Logística reversa para trocas e devoluções com estorno financeiro ou reenvio de produto.",
      orders: "83", custom: false,
      trigger: { type: "task-completion", triggerWfId: "entrega-domicilio", triggerTaskId: "ed-11" },
      agentEnabled: true,
      dependencies: ["entrega-domicilio", "retirada-loja"],
      stages: [
        { id: "td-s1", name: "Solicitação", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "td-1", name: "Abertura de Solicitação",          type: "auto",   owner: "Portal",        desc: "Cliente abre solicitação de troca ou devolução no portal." },
          { id: "td-2", name: "Validar Elegibilidade",            type: "auto",   owner: "Returns Agent", desc: "Verificação de prazo, política e condição do produto." },
          { id: "td-3", name: "Classificar (Troca / Devolução)",  type: "auto",   owner: "Returns Agent", desc: "Define se o caso é troca por novo item ou devolução com estorno." },
        ]},
        { id: "td-s2", name: "Coleta Reversa", linkedToNext: true, category: "DELIVERY", tasks: [
          { id: "td-4", name: "Gerar Etiqueta Reversa", type: "auto",   owner: "Carrier API",  desc: "Emissão da etiqueta de postagem reversa para o cliente." },
          { id: "td-5", name: "Notificar Cliente",      type: "auto",   owner: "Notif. Agent", desc: "Envio das instruções de devolução ao cliente." },
          { id: "td-6", name: "Confirmar Postagem",     type: "auto",   owner: "Carrier",      desc: "Registro da postagem do item pelo cliente." },
        ]},
        { id: "td-s3", name: "Inspeção no CD", linkedToNext: true, category: "FULFILLMENT", tasks: [
          { id: "td-7", name: "Receber Produto no CD",       type: "manual", owner: "WMS Operator", desc: "Recebimento e entrada do produto devolvido no centro de distribuição." },
          { id: "td-8", name: "Conferir Estado do Produto",  type: "manual", owner: "WMS Operator", desc: "Avaliação física do item: aprovado para reenvio ou descarte." },
        ]},
        { id: "td-s4", name: "Resolução", linkedToNext: false, category: "FULFILLMENT", tasks: [
          { id: "td-9",  name: "Processar Estorno",             type: "auto",   owner: "Gateway",      desc: "Devolução do valor ao cliente via método de pagamento original." },
          { id: "td-10", name: "Separar e Despachar Novo Item", type: "manual", owner: "WMS Operator", desc: "Fulfillment do item de troca para reenvio ao cliente." },
          { id: "td-11", name: "Notificar Cliente — Concluído", type: "auto",   owner: "Notif. Agent", desc: "Confirmação final do processo para o cliente." },
        ]},
      ]},
  ];

  /* exported for rendering */
  const wfCategoriesRef = wfCategories;

  const orchestrationCoverage = [
    { name: "Entrega em domicílio",      meta: "4 etapas · 4.256 pedidos ativos" },
    { name: "Retirada na loja",          meta: "4 etapas · 127 pedidos ativos"   },
    { name: "Troca e devolução",         meta: "4 etapas · 83 pedidos ativos"    },
    { name: "Entrega produto virtual",   meta: "3 etapas · 234 pedidos ativos"   },
    { name: "Cancelamento de Pedido",    meta: "3 etapas · 142 pedidos ativos"   },
  ];

  const orchestrationActivity = [
    { time: "12 min", kind: "warning",  actor: "Pedido 1631888948228-01 (68948228)", action: "separação travada — agente sugeriu CD Rio como alternativa", note: "Parada há 3h. Confiança 88%." },
    { time: "38 min", kind: "success",  actor: "Pedido 1631858947234-01 (68947234)", action: "realocação aprovada — agente avançou automaticamente após confirmação do CD Rio" },
    { time: "1 h",    kind: "info",     actor: "Pedido 1631828946500-01 (68946500)", action: "status avançado — embalagem concluída via WMS" },
    { time: "2 h",    kind: "critical", actor: "Pedido 1631848946980-01 (68946980)", action: "escalado ao operador — confiança abaixo do threshold", note: "Confiança 62%. Task criada para operações." },
    { time: "3 h",    kind: "info",     actor: "Workflow Troca e Devolução", action: "acionado automaticamente após Workflow Padrão concluir para o pedido 1631858947234-01 (68947234)" }
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
      note:{
        useCase:"Pedido omnicanal: múltiplas modalidades de entrega no mesmo carrinho",
        text:"Cenário recorrente em varejistas com operação física e digital. O cliente adicionou ao mesmo carrinho itens para retirar na loja e itens para entrega em domicílio. O OMS identificou automaticamente as modalidades, criou Order Jobs separados e acionou os workflows de Retirada na Loja (BOPIS) e Entrega em Domicílio via Jadlog. Os 2 itens de entrega já foram despachados e entregues com sucesso. Os 3 itens de retirada estão prontos na C&A Botafogo aguardando a visita do cliente.",
      },
      itemGroups:[
        {
          id:"g-bopis", workflow:"retirada-loja", fulfillmentType:"pickup",
          supplier:"C&A · Botafogo RJ",
          label:"Retirada na Loja · C&A Botafogo – RJ",
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
      note:{
        useCase:"Logística reversa pós-entrega: devolução por defeito de produto",
        text:"Cenário de pós-venda em que o cliente reportou defeito no produto após o recebimento. O workflow de Troca e Devolução foi acionado automaticamente após a conclusão do workflow de Entrega. O Returns Agent validou a elegibilidade dentro do prazo de 7 dias, classificou como devolução com estorno e gerou a etiqueta reversa. O processo aguarda a postagem pelo cliente para seguir para inspeção no CD e liberação do estorno.",
      },
      itemGroups:[
        {
          id:"g-delivery", workflow:"entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Total Express",
          label:"Entrega em Domicílio · Total Express",
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
                { label:"Emissão de NF-e",          icon:"🧾", status:"active",  agent:true,  time:null },
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

  ];

  // wfNaturezas is the canonical name per IA; wfCategories kept for backward compat
  const wfNaturezas = wfCategories;

  return { AVATARS, kpis, workflowStages, tasks, resources, workflows, wfCategories, wfNaturezas, TASK_STATUSES, orchestrationCoverage, orchestrationActivity, aiTeam, orders };
})();
