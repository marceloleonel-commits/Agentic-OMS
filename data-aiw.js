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

  /* ── AGENT_AVATARS — retrato por agente, endereçado pelo nome exibido.
     Agente sem entrada aqui cai no avatar genérico (sparkle) do PersonAvatar. ── */
  const AGENT_AVATARS = {
    "Order Management Agent":     "agent-order-management.png",
    "Order Management Assistant": "agent-order-management-assistant.png",
    "Carrier Agent":              "agent-carrier.png",
    "Allocation Agent":           "agent-operations.png",
    "Seller Agent":               "agent-fulfillment.png"
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

  /* Faixa-resumo do topo da aba "Visão geral" (OverviewSummaryStrip, em
     view-assistant.jsx): à esquerda, número grande da fila de pedidos
     aguardando liberação com barra empilhada por faixa de idade; à direita,
     duas linhas empilhadas — ocorrências que travam a liberação e tempo médio
     até liberar com selo de variação. Os totais das faixas somam o valor
     grande — não deixe divergir sem atualizar tudo junto. */
  const overviewSummary = {
    queue: {
      value: 34,
      label: "pedidos aguardando sua liberação",
      sub: "fila agora · time com 148",
      segments: [
        { count: 21, label: "há menos de 4h", tone: "healthy"  },
        { count: 9,  label: "entre 4h e 24h", tone: "warning"  },
        { count: 4,  label: "há mais de 24h", tone: "critical" },
      ],
    },
    attention: {
      label: "Precisam da sua atenção",
      sub:   "ocorrências travando liberação",
      /* Valor vive fora do data-aiw porque é derivado da tabela de iniciativas
         (initiativeAttentionTotal em occurrence-list.jsx) — a contagem aqui
         seria uma segunda fonte de verdade. */
    },
    resolution: {
      label: "Tempo até liberar",
      sub:   "sua média · time 5h18m",
      value: "4h12m",
      // Queda no tempo até liberar é resultado positivo — daí o tom verde.
      delta: { text: "-21%", tone: "positive" },
    },
  };

  const workflowStages = [
    { pill: "Pagamento",     label: "Autorização", count: "1.232 pedidos" },
    { pill: "Antifraude",    label: "Análise",     count: "412 pedidos"   },
    { pill: "Processamento", label: "Separação",   count: "287 pedidos"   },
    { pill: "Envio",         label: "Em rota",     count: "1.842 pedidos" },
    { pill: "Entrega",       label: "Em trânsito", count: "736 pedidos"   }
  ];

  /* Os 23 pedidos do cluster do Canvas A. Gerados aqui (e não escritos um a um)
     porque a lista alimenta a seleção manual da árvore de decisão, onde a busca
     por ID/cliente precisa de volume para fazer sentido. Os 14 primeiros têm
     SLA hoje — é o recorte crítico citado no diagnóstico. */
  function buildCanvasAOrders() {
    const customers = [
      "Marina Bastos", "Rodrigo Peixoto", "Camila Nogueira", "Thiago Rezende",
      "Beatriz Vasconcelos", "Eduardo Sampaio", "Larissa Furtado", "Vinícius Prado",
      "Helena Coutinho", "Gustavo Antunes", "Priscila Maia", "Rafael Bittencourt",
      "Juliana Ferraz", "André Malheiros", "Tatiana Quintela", "Bruno Sarmento",
      "Carolina Estrela", "Felipe Guedes", "Renata Vilela", "Otávio Lacerda",
      "Amanda Cordeiro", "Leandro Pontes", "Sofia Andrade"
    ];
    return customers.map((customer, i) => {
      const today = i < 14;
      return {
        id: `1621368619303-${String(i + 1).padStart(2, "0")}`,
        customer,
        sla: today ? "D+1 hoje" : "D+2 amanhã",
        seller: "Loja Botafogo",
        eta: today ? "14/06/2026" : "15/06/2026"
      };
    });
  }

  const tasks = [

    /* ── Canvas A · Bloqueio operacional em massa (Seller não despachou no SLA) ── */
    {
      id: "TA-CANVAS-A",
      priority: "high",
      status: "attention",
      title: "Seller não despachou no SLA — Loja Botafogo (23 pedidos)",
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
        title: "23 pedidos parados em Despacho - Seller Loja Botafogo",
        reportedBy: { agent: "Order Management Agent", at: "14 jun 2026, 09:42" },
        severity: "high",
        slaHours: 3,
        assignees: ["Seller Agent", "Order Management Agent", "Carrier Agent"],
        scope: "23 pedidos · Seller Loja Botafogo · Canal: Site + App",
        slaRisk: "14 pedidos entregariam hoje",
        diagnosis: {
          text: "Seller Loja Botafogo não iniciou despacho para 23 pedidos com SLA de entrega em D+1. Último evento registrado: labeling_finished às 06:12. Nenhum evento de coleta detectado em 4h. Padrão semelhante em 2 ocorrências anteriores (04/06 e 28/05).",
          confidence: {
            label: "Média",
            pct: 74,
            detail: "Padrão de falta de despacho confirmado pelo histórico (2 ocorrências semelhantes) e pela ausência de evento de coleta em 4h. Confiança não é maior porque o carrier ainda não confirmou a lacuna — sem essa confirmação, não é possível descartar erro de integração."
          },
          gap: "Confirmação do carrier ausente"
        },
        /* "Tarefas a fazer": só a tarefa de verificação em andamento, bloqueada
           até a árvore de decisão fechar — as tarefas reais são declaradas nas
           respostas de `verification.questions` e derivadas do caminho
           percorrido. Mesmo modelo de dados (followUp/resolved) do padrão
           genérico de tarefas (TaskCanvasMain), para reaproveitar SubTaskRow
           com Responsável. */
        followUp: [
          { state: "attention", title: "Verificar com o seller o status do despacho", assignee: "Ecommerce Supervisor", initial: "E" }
        ],
        resolved: [],
        /* Tarefas executadas de forma totalmente autônoma antes do operador
           abrir a Ocorrência — já entram em "Tarefas realizadas". */
        autoDone: [
          { state: "done", title: "Notificar 23 clientes sobre risco de atraso", assignee: "Order Management Agent", agent: true },
          { state: "done", title: "Tentar contato automático com seller (webhook/e-mail)", assignee: "Order Management Agent", agent: true },
          { state: "done", title: "Verificar histórico de padrão semelhante (04/06, 28/05)", assignee: "Order Management Agent", agent: true }
        ],
        /* Árvore de decisão da verificação manual, como grafo de perguntas
           endereçadas por id. Cada opção aponta `next` para a próxima pergunta
           (ou null, quando a árvore fecha) e pode declarar as `tasks` que a
           resposta gera. As convergências previstas na spec (A.2.2 → Branch B,
           B.2.2 → Branch C) são só dois `next` apontando para a mesma pergunta:
           nenhuma sub-árvore é duplicada.

           Tokens aceitos nos títulos de tarefa, resolvidos contra as respostas
           já dadas: {q:id} texto da resposta · {count:id} nº de pedidos
           selecionados · {rest:id} total menos os selecionados. */
        verification: {
          start: "q1",
          /* Autoria exibida no card depois da árvore fechar. */
          answeredBy: "Adriana Guimarães",
          answeredAt: "14 jun 2026, 09:42",
          questions: {
            q1: {
              type: "single_select",
              title: "O que aconteceu com os pedidos no seller?",
              options: [
                { id: "falha-integracao", title: "Os pedidos foram despachados. Falhou a integração com a carrier.", desc: "O seller tem comprovante de coleta mas o evento não chegou ao OMS.", next: "a1" },
                { id: "despacho-parcial",  title: "Os pedidos foram despachados parcialmente.", desc: "Parte foi coletada. Os pedidos restantes ainda estão no seller.", next: "b1" },
                { id: "sem-despacho",      title: "Os pedidos não foram despachados.", desc: "O seller confirmou que nenhum pedido saiu do estoque.", next: "c1" },
                { id: "outro",             title: "Outro", other: true, otherPlaceholder: "Descreva o que aconteceu com os pedidos.", next: "d1" }
              ]
            },

            /* ── Branch A · Falha de integração com a carrier ── */
            a1: {
              type: "single_select",
              title: "Qual carrier apresentou falha?",
              options: [
                { id: "correios",      title: "Correios",      next: "a2" },
                { id: "loggi",         title: "Loggi",         next: "a2" },
                { id: "jadlog",        title: "Jadlog",        next: "a2" },
                { id: "total-express", title: "Total Express", next: "a2" },
                { id: "outro",         title: "Outro", other: true, otherPlaceholder: "Nome da transportadora.", next: "a2" }
              ]
            },
            a2: {
              type: "single_select",
              title: "Você tem confirmação de despacho físico (manifesto/NF) dos 23, ou de parte?",
              options: [
                {
                  id: "todos", title: "Todos os 23 confirmados", next: null,
                  tasks: [
                    { state: "attention", title: "Corrigir integração com carrier {q:a1}", assignee: "Ecommerce Supervisor", initial: "E" },
                    { state: "loading",   title: "Forçar atualização de evento de coleta (23 pedidos)", assignee: "Order Management Agent", agent: true }
                  ]
                },
                /* Convergência A.2.2 → Branch B: o restante dos pedidos recebe
                   exatamente o mesmo tratamento, sem sub-árvore paralela. */
                { id: "parte", title: "Só parte confirmada", next: "b1" }
              ]
            },

            /* ── Branch B · Despachados parcialmente ── */
            b1: {
              type: "select_or_upload",
              title: "Quantos dos 23 foram despachados, e quais?",
              selectLabel: "Selecionar pedidos",
              uploadLabel: "Ou anexar comprovante",
              next: "b1-fonte"
            },
            "b1-fonte": {
              type: "source_confirmation",
              title: "Como você confirmou essa informação?",
              options: [
                { id: "sistema-carrier", title: "Sistema da transportadora", next: "b2" },
                { id: "email-seller",    title: "E-mail do seller",          next: "b2" },
                { id: "print",           title: "Print anexado",             next: "b2" },
                { id: "telefone",        title: "Contato telefônico",        next: "b2" },
                { id: "outro",           title: "Outro", other: true, otherPlaceholder: "Como a informação foi confirmada.", next: "b2" }
              ]
            },
            b2: {
              type: "single_select",
              title: "Os pedidos restantes têm previsão de despacho hoje?",
              options: [
                {
                  id: "sim", title: "Sim, com horário confirmado", next: null,
                  tasks: [
                    { state: "loading", title: "Forçar atualização de status dos pedidos já despachados ({count:b1})", assignee: "Order Management Agent", agent: true },
                    { state: "loading", title: "Acompanhar despacho dos {rest:b1} até novo horário", assignee: "Order Management Agent", agent: true },
                    { state: "loading", title: "Reavaliar SLA de entrega dos restantes", assignee: "Order Management Agent", agent: true },
                    { state: "loading", title: "Comunicar novo prazo aos clientes restantes", assignee: "Order Management Agent", agent: true }
                  ]
                },
                /* Convergência B.2.2 → Branch C: sem previsão, os restantes
                   passam a seguir o conjunto de tarefas do Branch C. */
                {
                  id: "nao", title: "Não / sem previsão", next: "c1",
                  tasks: [
                    { state: "loading", title: "Forçar atualização de status dos pedidos já despachados ({count:b1})", assignee: "Order Management Agent", agent: true }
                  ]
                }
              ]
            },

            /* ── Branch C · Não despachados ── */
            c1: {
              type: "single_select",
              title: "Qual o motivo?",
              options: [
                { id: "capacidade", title: "Sem capacidade operacional",             next: "c2" },
                { id: "fechada",    title: "Loja fechada / feriado não previsto",    next: "c2" },
                { id: "fiscal",     title: "Pendência de nota fiscal / documentação", next: "c2" },
                { id: "outro",      title: "Outro motivo", other: true, otherPlaceholder: "Descreva o motivo informado pelo seller.", next: "c2" }
              ]
            },
            c2: {
              type: "single_select",
              title: "Seller tem previsão de despacho ainda hoje?",
              options: [
                {
                  id: "sim", title: "Sim", next: null,
                  tasks: [
                    { state: "loading", title: "Reavaliar SLA de entrega dos pedidos restantes", assignee: "Order Management Agent", agent: true },
                    { state: "loading", title: "Comunicar novo prazo aos clientes", assignee: "Order Management Agent", agent: true }
                  ]
                },
                {
                  id: "nao", title: "Não", next: null,
                  tasks: [
                    { state: "attention", title: "Contatar seller para novo prazo de despacho", assignee: "Ecommerce Supervisor", initial: "E" },
                    { state: "attention", title: "Redistribuir pedidos para seller backup (se aplicável)", assignee: "Ecommerce Supervisor", initial: "E" },
                    { state: "loading",   title: "Comunicar atraso definitivo aos clientes", assignee: "Order Management Agent", agent: true },
                    { state: "done",      title: "Registrar recorrência para gestão de performance do seller", assignee: "Order Management Agent", agent: true }
                  ]
                }
              ]
            },

            /* ── Branch D · Outro ── */
            d1: {
              type: "short_text",
              title: "Descreva o que houve",
              placeholder: "O que o seller informou sobre os pedidos.",
              next: null,
              tasks: [
                { state: "attention", title: "Investigar causa não mapeada (triagem manual)", assignee: "Ecommerce Supervisor", initial: "E" }
              ]
            }
          }
        },
        affectedOrders: {
          total: 23,
          items: buildCanvasAOrders()
        },
        activities: [
          { time: "06:12", actor: "Order Management Agent", agent: true, action: "registrou labeling_finished para 23 pedidos do Seller Loja Botafogo" },
          { time: "09:12", actor: "Carrier Agent",          agent: true, action: "não detectou evento carrier_collected após 3h de picking", note: "SLA de entrega D+1 entrou em risco para o cluster." },
          { time: "09:40", actor: "Order Management Agent", agent: true, action: "agrupou os 23 pedidos por causa raiz — ausência de coleta do carrier" },
          { time: "09:41", actor: "Allocation Agent",agent: true, action: "isolou os 14 pedidos com SLA hoje e preparou proposta de reatribuição", note: "Reatribuição excede a política automática — marcada como 'requer aprovação'." },
          { time: "09:42", actor: "Order Management Assistant", agent: true, action: "gerou esta tarefa com 3 ações sugeridas" }
        ],
        chat: [
          { from: "agent", text: "Identifiquei um cluster de 23 pedidos do Seller Loja Botafogo sem evento de coleta há mais de 4h — 14 deles têm SLA de entrega hoje." },
          { from: "agent", text: "Falta um dado para fechar o diagnóstico: o carrier não confirmou a coleta, então não consigo saber se o seller despachou tudo, parte ou nada. Confirme isso com o seller e responda aqui no chat — com a resposta eu calculo a ação recomendada." }
        ]
      }
    },

    /* ── Canvas D · Devoluções fora da política — avaliação de tickets ──
       Aqui a estrela do card é o Ticket, não o Pedido: o pedido entra como
       contexto vinculado, dentro do ticket aberto. Os 4 motivos são diferentes
       (prazo, motivo, categoria, limite), mas formam uma Iniciativa Operacional
       só — mesmo lote, mesma janela, mesma fila do SAC. A autonomia é por
       ticket: cada um pode estar num estado diferente sem conflito. ── */
    {
      id: "TA-CANVAS-D",
      occurrenceId: "O104",
      priority: "high",
      status: "attention",
      title: "Devoluções fora da política — 4 tickets aguardando avaliação",
      tag: "Devoluções",
      source: { kind: "return", label: "Devoluções" },
      canvasPattern: "D",
      chips: [
        { icon: "layers", label: "Ver os 4 tickets abertos"        },
        { icon: "check",  label: "Aceitar as exceções recomendadas" },
        { icon: "search", label: "Ver reasoning da triagem"         },
      ],
      detail: {
        title: "Devoluções fora da política — 4 tickets aguardando avaliação",
        severity: "high",
        slaHours: 2,
        category: "Return Task",
        lead: "SAC Team",
        /* Quem assina a decisão nos tickets fechados. */
        decidedBy: "Adriana Guimarães",
        /* Agregada: acompanha o menor nível entre os tickets. */
        confidence: {
          label: "Média",
          pct: 68,
          detail: "A confiança agregada acompanha o ticket mais frágil do lote. Prazo, motivo e limite mensal são objetivos e conferem com a política cadastrada. O TCK-1044 puxa o número para baixo: a foto anexada sugere defeito de fabricação, mas a categoria (higiene pessoal) não é elegível pela política padrão — as duas leituras são defensáveis."
        },
        reportedBy: { agent: "Order Management Agent", note: "triagem de devoluções fora da política" },
        diagnosisText: "Quatro solicitações de devolução não se enquadram nas políticas cadastradas pela loja: uma fora do prazo, uma por motivo não coberto, uma por categoria não elegível e uma por limite mensal excedido. Nenhuma tem regra automática aplicável, então as quatro dependem de avaliação do SAC dentro da autonomia definida para exceções.",
        /* Nível 1 do canvas. O pedido vinculado fica de fora da tabela de
           propósito: ele só importa quando alguém está de fato avaliando
           aquele ticket, e aí aparece dentro dele. */
        /* ── Copy de exemplo ── Os campos `policyResolution`, `policyResolutionDetail`,
           `acceptMessage` e `denyMessage` são placeholders para o protótipo. Prazo
           de estorno, etiqueta de postagem e janela de contestação são compromissos
           operacionais que precisam validação de produto/jurídico antes de virar
           padrão em produção. */
        tickets: [
          {
            id: "TCK-1042",
            /* Vínculo explícito com a Tarefa correspondente no bloco de Tarefas.
               Confirmar uma decisão neste ticket resolve esta Tarefa. */
            taskId: "TCK-1042",
            shopperReason: "Arrependimento",
            recommendation: "Avaliar",
            why: "Fora do prazo de 30 dias (34 dias desde a entrega), mas o cliente tem 12 pedidos no histórico sem ocorrência prévia.",
            sla: "2h",
            order: "BR-3010982",
            item: "Luminária de mesa articulada — Preto",
            sku: "LUM-ART-0142",
            photo: "product-luminaria.png",
            message: "Comprei a luminária para o home office mas acabei mudando o layout da mesa e ela nunca saiu da caixa. Está lacrada, com nota e embalagem original. Sei que passou um pouco do prazo, mas nunca precisei devolver nada de vocês antes.",
            attachments: [],
            history: "12 pedidos · 0 ocorrências prévias",
            denyReason: "Solicitação aberta 34 dias após a entrega, fora do prazo de 30 dias previsto na política de devolução da loja.",
            policyResolution: "Estorno total no meio de pagamento original",
            policyResolutionDetail: "O cliente recebe a etiqueta de postagem por e-mail e o estorno é feito em até 7 dias úteis após a coleta do item.",
            acceptMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010982 e ela foi aprovada como exceção à política da loja. Você vai receber por e-mail a etiqueta de postagem para envio do item. O valor pago é estornado no meio de pagamento original em até 7 dias úteis após a coleta.",
            denyMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010982 e ela não pode ser aprovada. Solicitação aberta 34 dias após a entrega, fora do prazo de 30 dias previsto na política de devolução da loja. Se você tiver novas informações sobre o caso, pode contestar esta decisão em até 7 dias."
          },
          {
            id: "TCK-1043",
            taskId: "TCK-1043",
            shopperReason: "Insatisfação com o produto",
            recommendation: "Negar",
            why: "Motivo não coberto pela política — a loja só aceita devolução por defeito ou avaria.",
            sla: "18h",
            order: "BR-3010983",
            item: "Fone de ouvido over-ear — Cinza",
            sku: "FON-OVE-8830",
            photo: "product-fone.png",
            message: "O fone funciona direitinho, mas o som não me agradou tanto quanto eu esperava pelo preço. Queria devolver e comprar outro modelo.",
            attachments: [],
            history: "2 pedidos · 1 ocorrência prévia",
            denyReason: "A política de devolução da loja cobre apenas defeito de fabricação ou avaria no transporte. Insatisfação com o produto não é motivo elegível fora do prazo de arrependimento.",
            policyResolution: "Estorno total no meio de pagamento original",
            policyResolutionDetail: "O cliente recebe a etiqueta de postagem por e-mail e o estorno é feito em até 7 dias úteis após a coleta do item.",
            acceptMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010983 e ela foi aprovada como exceção à política da loja. Você vai receber por e-mail a etiqueta de postagem para envio do item. O valor pago é estornado no meio de pagamento original em até 7 dias úteis após a coleta.",
            denyMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010983 e ela não pode ser aprovada. A política de devolução da loja cobre apenas defeito de fabricação ou avaria no transporte. Insatisfação com o produto não é motivo elegível fora do prazo de arrependimento. Se você tiver novas informações sobre o caso, pode contestar esta decisão em até 7 dias."
          },
          {
            id: "TCK-1044",
            taskId: "TCK-1044",
            shopperReason: "Chegou com a costura solta",
            recommendation: "Escalar",
            why: "Categoria não elegível pela política padrão (higiene pessoal), mas a evidência anexada sugere defeito de fabricação.",
            sla: "3h",
            overdue: true,
            order: "BR-3010984",
            /* Devolução com mais de um item: o motivo é declarado por item, e o
               bloco no card aparece contido e colapsado, com miniaturas + contagem
               + resumo por motivo. Aberto, cada linha entra dividida por hairline. */
            items: [
              { item: "Necessaire térmica — Off-white", sku: "NEC-TER-2291", reason: "Defeito de fabricação", photo: "product-necessaire.png", attachments: ["foto-costura-lateral.jpg", "foto-etiqueta.jpg"] },
              { item: "Necessaire térmica — Areia",     sku: "NEC-TER-2288", reason: "Defeito de fabricação", photo: "product-necessaire.png", attachments: ["foto-costura-areia.jpg"] },
              { item: "Toalha de rosto — Off-white",    sku: "TOA-ROS-1140", reason: "Arrependimento",       photo: null,                     attachments: [] }
            ],
            message: "As duas necessaires chegaram com a costura da lateral solta, dá pra ver a linha saindo. Não cheguei a usar nenhuma, tirei da embalagem e já percebi. A toalha veio no mesmo pedido e quero devolver junto. Estou mandando as fotos.",
            history: "3 pedidos · 0 ocorrências prévias",
            denyReason: "Produtos de higiene pessoal não são elegíveis para devolução pela política padrão da loja.",
            policyResolution: "Estorno total no meio de pagamento original",
            policyResolutionDetail: "O cliente recebe a etiqueta de postagem por e-mail e o estorno é feito em até 7 dias úteis após a coleta do item.",
            acceptMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010984 e ela foi aprovada como exceção à política da loja. Você vai receber por e-mail a etiqueta de postagem para envio do item. O valor pago é estornado no meio de pagamento original em até 7 dias úteis após a coleta.",
            denyMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010984 e ela não pode ser aprovada. Produtos de higiene pessoal não são elegíveis para devolução pela política padrão da loja. Se você tiver novas informações sobre o caso, pode contestar esta decisão em até 7 dias."
          },
          {
            id: "TCK-1045",
            taskId: "TCK-1045",
            shopperReason: "Tamanho incompatível",
            recommendation: "Negar",
            why: "Excede o limite mensal de devoluções (5ª solicitação; limite 3) — o motivo isolado seria aceito.",
            sla: "9h",
            order: "BR-3010985",
            item: "Calça alfaiataria — 42 · Areia",
            sku: "CAL-ALF-5507",
            photo: "product-calca.png",
            message: "Pedi 42 mas ficou larga na cintura. Queria trocar por 40 ou devolver.",
            attachments: [],
            history: "9 pedidos · 4 devoluções no mês",
            denyReason: "Quinta solicitação de devolução no mês, acima do limite de 3 previsto na política. O motivo (tamanho incompatível) seria aceito isoladamente.",
            policyResolution: "Estorno total no meio de pagamento original",
            policyResolutionDetail: "O cliente recebe a etiqueta de postagem por e-mail e o estorno é feito em até 7 dias úteis após a coleta do item.",
            acceptMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010985 e ela foi aprovada como exceção à política da loja. Você vai receber por e-mail a etiqueta de postagem para envio do item. O valor pago é estornado no meio de pagamento original em até 7 dias úteis após a coleta.",
            denyMessage: "Olá! Analisamos sua solicitação de devolução do pedido #BR-3010985 e ela não pode ser aprovada. Quinta solicitação de devolução no mês, acima do limite de 3 previsto na política. O motivo (tamanho incompatível) seria aceito isoladamente. Se você tiver novas informações sobre o caso, pode contestar esta decisão em até 7 dias."
          }
        ],
        activities: [
          { time: "07:12", actor: "Order Management Agent", agent: true, action: "recebeu 4 solicitações de devolução e cruzou cada uma com as políticas cadastradas pela loja" },
          { time: "07:13", actor: "Order Management Agent", agent: true, action: "reprovou automação em TCK-1042: 34 dias desde a entrega, acima do prazo de 30 dias", note: "Histórico limpo do cliente (12 pedidos, 0 ocorrências) é atenuante, mas não há regra automática que o considere." },
          { time: "07:13", actor: "Order Management Agent", agent: true, action: "classificou TCK-1043 como motivo não coberto — a política aceita apenas defeito ou avaria" },
          { time: "07:14", actor: "Order Management Agent", agent: true, action: "identificou conflito em TCK-1044 entre categoria e evidência", note: "Higiene pessoal não é elegível, mas as fotos anexadas indicam defeito de fabricação. Recomendação: escalar." },
          { time: "07:14", actor: "Order Management Agent", agent: true, action: "detectou em TCK-1045 a 5ª solicitação do mês, acima do limite de 3" },
          { time: "07:15", actor: "Order Management Agent", agent: true, action: "abriu esta iniciativa com os 4 tickets para avaliação do SAC" }
        ],
        chat: [
          { from: "agent", text: "Quatro devoluções caíram fora das políticas cadastradas: uma fora do prazo, uma por motivo não coberto, uma por categoria e uma por limite mensal. Nenhuma tinha regra automática aplicável." },
          { from: "agent", text: "Já deixei uma recomendação em cada ticket, com o porquê. O TCK-1044 é o mais delicado — a foto sugere defeito, mas a categoria não é elegível, então recomendei escalar. Ele também é o único com SLA vencido." }
        ]
      }
    },

    /* ── Canvas F · Pedido de marketplace bloqueado por falta de estoque ──
       A dependência do ERP do merchant é guarda, não aviso: com o SAP como
       fonte de verdade do estoque, nada é escrito pela plataforma — e a opção
       de atualizar na mão nem chega a ser oferecida na árvore abaixo.
       Ao contrário do Canvas A, a causa raiz já é conhecida: o humano decide
       como resolver, não investiga o que houve. ── */
    {
      id: "TA-CANVAS-F",
      occurrenceId: "O118",
      priority: "high",
      status: "attention",
      title: "Pedido bloqueado por falta de estoque — Amazon (SKU MOCHILA-URBAN-42P)",
      tag: "Marketplace",
      assigneeInitial: "E",
      assigneeInitials: "ES",
      assigneeName: "Ecommerce Supervisor",
      source: { kind: "order", label: "Marketplace" },
      canvasPattern: "F",
      chips: [
        { icon: "bell",   label: "Alertar time para rodar atualização via ERP" },
        { icon: "layers", label: "Ver saldo em armazéns alternativos"          },
        { icon: "search", label: "Ver o pedido bloqueado"                      },
      ],
      detail: {
        title: "Pedido #BR-2984571 bloqueado por falta de estoque — SKU MOCHILA-URBAN-42P",
        reportedBy: { agent: "Order Management Agent", at: "14 jun 2026, 10:15" },
        severity: "high",
        slaHours: 6,
        scope: "1 pedido · Amazon · SKU MOCHILA-URBAN-42P",
        diagnosis: {
          text: "Pedido #BR-2984571 (Amazon) falhou na simulação de estoque às 09:47. O SKU MOCHILA-URBAN-42P está sem saldo no CD Guarulhos, armazém principal. Reprocessamento automático tentado 3x entre 09:47 e 10:15, sem sucesso. O merchant tem integração ERP ativa — SAP é a fonte de verdade do estoque, então nenhuma atualização foi feita pela plataforma."
        },
        followUp: [
          { state: "attention", title: "Decidir como resolver a pendência de estoque", assignee: "Ecommerce Supervisor", initial: "E" }
        ],
        resolved: [],
        /* Pré-etapa autônoma: tudo isso já rodou antes de a ocorrência chegar
           a um humano. */
        autoDone: [
          { state: "done", title: "Executar simulação do pedido (estoque, SLA, valores)", assignee: "Order Management Agent", agent: true },
          { state: "done", title: "Tentar reprocessamento automático via scripts existentes (3 tentativas)", assignee: "Order Management Agent", agent: true },
          { state: "done", title: "Verificar disponibilidade em armazéns alternativos", assignee: "Order Management Agent", agent: true },
          { state: "done", title: "Identificar integração ERP do merchant", assignee: "Order Management Agent", agent: true }
        ],
        verification: {
          start: "f1",
          answeredBy: "Adriana Guimarães",
          answeredAt: "14 jun 2026, 10:22",
          questions: {
            f1: {
              type: "single_select",
              title: "Como deseja resolver a pendência de estoque?",
              /* "Atualizar estoque manualmente" não aparece: ela só vale para
                 merchant sem ERP. A Dependência filtra a opção antes de
                 perguntar, em vez de oferecer algo que não se aplica. */
              options: [
                {
                  id: "alertar-erp",
                  title: "Alertar para rodar atualização via ERP",
                  desc: "Sugerido pelo agente — o SAP é a fonte de verdade, a correção precisa nascer lá.",
                  next: null,
                  tasks: [
                    { state: "loading", title: "Enviar alerta ao time responsável para rodar atualização via ERP (SAP)", assignee: "Order Management Agent", agent: true },
                    { state: "loading", title: "Reprocessar simulação do pedido #BR-2984571", assignee: "Order Management Agent", agent: true }
                  ]
                },
                { id: "transferir", title: "Sugerir transferência de estoque de outro armazém", desc: "O agente encontrou saldo em 2 armazéns alternativos.", next: "f2" },
                { id: "outro", title: "Outro", other: true, otherPlaceholder: "Descreva como pretende resolver a pendência.", next: "f3" }
              ]
            },

            /* ── Branch C · Transferência entre armazéns ──
               A lista já vem do agente com o saldo de cada armazém: não é
               pergunta aberta. A transferência também respeita a Dependência —
               nenhuma das duas opções escreve estoque no ERP do merchant. */
            f2: {
              type: "single_select",
              title: "De qual armazém transferir?",
              options: [
                {
                  id: "cd-extrema", title: "CD Extrema — 12 unidades disponíveis", next: null,
                  tasks: [
                    { state: "loading",   title: "Solicitar transferência ao CD Extrema", assignee: "Order Management Agent", agent: true },
                    { state: "attention", title: "Confirmar chegada física no CD Guarulhos", assignee: "Ecommerce Supervisor", initial: "E" },
                    { state: "loading",   title: "Reprocessar simulação do pedido #BR-2984571", assignee: "Order Management Agent", agent: true }
                  ]
                },
                {
                  id: "cd-cajamar", title: "CD Cajamar — 4 unidades disponíveis", next: null,
                  tasks: [
                    { state: "loading",   title: "Solicitar transferência ao CD Cajamar", assignee: "Order Management Agent", agent: true },
                    { state: "attention", title: "Confirmar chegada física no CD Guarulhos", assignee: "Ecommerce Supervisor", initial: "E" },
                    { state: "loading",   title: "Reprocessar simulação do pedido #BR-2984571", assignee: "Order Management Agent", agent: true }
                  ]
                }
              ]
            },

            /* ── Branch D · Outro (ilustrativo, como no Canvas A) ── */
            f3: {
              type: "short_text",
              title: "Descreva como pretende resolver",
              placeholder: "O caminho que você vai seguir para destravar o pedido.",
              next: null,
              tasks: [
                { state: "attention", title: "Investigar causa não mapeada (triagem manual)", assignee: "Ecommerce Supervisor", initial: "E" }
              ]
            }
          }
        },
        affectedOrders: {
          total: 1,
          items: [
            { id: "BR-2984571", customer: "Ricardo Salgado", sla: "Expira hoje", seller: "Amazon", eta: "15/06/2026" }
          ]
        },
        activities: [
          { time: "09:47", actor: "Order Management Agent", agent: true, action: "registrou falha na simulação do pedido #BR-2984571 — SKU MOCHILA-URBAN-42P sem saldo no CD Guarulhos" },
          { time: "10:15", actor: "Order Management Agent", agent: true, action: "tentou reprocessamento automático 3x entre 09:47 e 10:15, sem sucesso" },
          { time: "10:16", actor: "Order Management Agent", agent: true, action: "encontrou 12 unidades do SKU no CD Extrema e 4 no CD Cajamar" },
          { time: "10:17", actor: "Order Management Agent", agent: true, action: "identificou integração ERP ativa no merchant (SAP)", note: "Estoque tem o ERP como fonte de verdade — nenhuma escrita automática é permitida a partir da plataforma." },
          { time: "10:18", actor: "SAC Team", initial: "S", action: "escalou a ocorrência para o supervisor de ecommerce", note: "SAC não tem autonomia para resolver pendência de estoque." },
          { time: "10:18", actor: "Order Management Assistant", agent: true, action: "gerou esta ocorrência com a decisão de resolução pendente" }
        ],
        chat: [
          { from: "agent", text: "O pedido #BR-2984571 (Amazon) está bloqueado desde as 09:47: o SKU MOCHILA-URBAN-42P não tem saldo no CD Guarulhos e o reprocessamento automático falhou nas 3 tentativas." },
          { from: "agent", text: "A causa já está fechada, não preciso que você investigue. O que falta é a decisão. O merchant usa SAP como fonte de verdade de estoque, então não atualizo nada por aqui — escolha no card abaixo como quer resolver." }
        ]
      }
    },

    /* ── TSK-302 · Tarefa da iniciativa IN6280 (Precificação dinâmica) —
       aberta via "Ver conversa" no InitiativeDocumentPanel.
       Não é uma Ocorrência: mora aqui só para ter canvas próprio quando alguém
       chega por IN6280 ou pelo kanban, e por isso fica fora da fila. ── */
    {
      id: "TSK-302",
      isOccurrence: false,
      priority: "high",
      status: "attention",
      title: "Revisar proposta de precificação dinâmica — aguarda aprovação",
      tag: "Precificação",
      assigneeInitial: "Y",
      assigneeInitials: "YO",
      assigneeName: "You",
      source: { kind: "initiative", label: "IN6280" },
      chips: [
        { icon: "graph",   label: "Ver elasticidade por categoria" },
        { icon: "check",   label: "Aprovar novo teto de desconto"  },
        { icon: "sparkle", label: "Escalar para Supervisor"        },
      ],
      detail: {
        title: "Precificação dinâmica — IN6280",
        reportedBy: { agent: "Pricing Agent", at: "28 mar às 09:12" },
        summary: "13 SKUs estão sendo vendidos abaixo do custo de reposição desde o último reajuste de frete. O Pricing Agent propôs um novo teto de desconto por categoria para restaurar a margem mínima.",
        diagnosis: "O reajuste de frete de 15/03 elevou o custo de reposição de 13 SKUs sem um ajuste correspondente no preço de venda. A mudança de teto de desconto proposta pelo agente excede a política automática (máx. 10% por ciclo) e por isso está marcada como 'requer aprovação'.",
        attributedTo: { name: "You", initial: "Y" },
        severity: "high",
        slaHours: 4,
        followUp: [
          { state: "attention", title: "Aprovar novo teto de desconto por categoria", assignee: "You", initial: "Y" },
        ],
        resolved: [
          { state: "done", title: "Validar elasticidade de preço por categoria", assignee: "Guilherme Vecchi", initial: "G" },
          { state: "done", title: "Identificar os 13 SKUs abaixo do custo de reposição", assignee: "Pricing Agent", agent: true },
        ],
        impacted: [],
        activities: [
          { time: "09:12", actor: "Pricing Agent", agent: true, action: "identificou 13 SKUs vendidos abaixo do custo de reposição" },
          { time: "09:14", actor: "Pricing Agent", agent: true, action: "propôs novo teto de desconto por categoria", note: "Mudança excede a política automática — marcada como 'requer aprovação'." },
        ],
        chat: [
          { from: "agent", text: "13 SKUs estão sendo vendidos abaixo do custo de reposição desde o reajuste de frete de 15/03. Proponho um novo teto de desconto por categoria para restaurar a margem mínima." },
          { from: "agent", text: "Essa mudança excede a política automática de desconto (máx. 10% por ciclo), então preciso da sua aprovação para aplicar. Posso seguir?" }
        ]
      }
    }

  ];

  const wfCategories = [
    { id: "pagamento",        label: "Pagamento",           desc: "Captura, autorização e conciliação financeira",        color: "#1E4EE5" },
    { id: "fulfillment",      label: "Fulfillment Físico",  desc: "Preparação e envio de produtos físicos ao cliente",    color: "#00897B" },
    { id: "logistica-reversa",label: "Logística Reversa",   desc: "Retorno de produtos — trocas e devoluções",            color: "#D97706" },
    { id: "cancelamento",     label: "Cancelamento",        desc: "Encerramento de pedidos com reversão de estoque e financeira", color: "#DC2626" },
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

  /* ── Workflows ─────────────────────────────────────────────────────────
     Fixtures do protótipo AIW / Gerenciador de Workflows. Cada workflow
     segue o schema documentado em docs/WORKFLOW_ENTIDADES.md — o `WORKFLOWS_FIXTURES.md`
     é o "source of truth" desses 6 fluxos: 3 fulfillment (domicílio, loja,
     virtual), 1 cancelamento, 1 logística reversa (troca e devolução) e
     1 serviço sob demanda (personalização de camiseta). Os `id`s no formato
     `wf-*` são referenciados por triggers de outros workflows (wf-completion,
     task-completion) e por initiatives/orders no restante deste arquivo. */
  const workflows = [
    {
      id: "wf-entrega-domicilio",
      name: "Entrega em domicílio",
      icon: "local_shipping",
      desc: "Itens despachados por transportadora até o endereço do cliente.",
      category: "fulfillment",

      status: "active",
      wfStatus: "published",
      version: "2.1",

      trigger: { type: "system-event", events: ["Pedido criado"] },
      agentEnabled: true,
      deps: [],
      unlocks: [
        { wfId: "wf-troca-devolucao", wfName: "Troca e devolução", wfIcon: "assignment_return" },
        { wfId: "wf-personalizacao-camiseta", wfName: "Personalização de Camiseta", wfIcon: "checkroom" },
      ],

      stages: [
        {
          id: "st-pagamento",
          name: "Pagamento",
          category: "PAYMENT",
          gate: "payment_settled",
          linkedToNext: true,
          responsible: "Gateway",
          tasks: [
            { id: "autorizacao-pagamento", name: "Autorização de Pagamento", type: "auto", owner: "Adyen" },
            { id: "captura-pagamento", name: "Captura de Pagamento", type: "auto", owner: "Adyen" },
          ],
        },
        {
          id: "st-manuseio",
          name: "Manuseio",
          category: "FULFILLMENT",
          gate: "deliverable_ready",
          linkedToNext: true,
          responsible: "WMS",
          tasks: [
            { id: "reserva-estoque", name: "Reserva de Estoque", type: "auto" },
            { id: "picking", name: "Picking", type: "manual" },
            { id: "packing", name: "Packing", type: "manual" },
            { id: "labeling", name: "Labeling", type: "auto" },
          ],
        },
        {
          id: "st-faturamento",
          name: "Faturamento",
          category: "FULFILLMENT",
          linkedToNext: true,
          responsible: "NFe.io",
          tasks: [
            { id: "emissao-nf", name: "Emissão de Nota Fiscal", type: "auto", owner: "NFe.io" },
          ],
        },
        {
          id: "st-entrega",
          name: "Entrega",
          category: "DELIVERY",
          gate: "customer_has_goods",
          linkedToNext: false,
          responsible: "Transportadora",
          tasks: [
            { id: "expedicao", name: "Expedição", type: "auto" },
            { id: "first-mile", name: "First Mile", type: "auto", owner: "GFL Logística" },
            { id: "last-mile", name: "Last Mile", type: "manual", owner: "GFL Logística" },
            { id: "proof-of-delivery", name: "Proof of Delivery", type: "auto" },
          ],
        },
      ],

      flatOrder: ["autorizacao-pagamento", "captura-pagamento", "reserva-estoque", "picking", "packing", "labeling", "emissao-nf", "expedicao", "first-mile", "last-mile", "proof-of-delivery"],

      publishedAt: "2026-08-22T14:00:00Z",
      publishedBy: "vanessa.borges@vtex.com",
      lastEditedAt: "2026-08-22T14:00:00Z",
      lastEditedBy: "vanessa.borges@vtex.com",
      versionLog: [
        {
          version: "2.1",
          publishedAt: "2026-08-22T14:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Ajuste fino no fluxo de picking após retrospectiva do Q2.",
          deltas: [
            { entity: "task",           change: "renamed", detail: "'Separação' renomeada para 'Picking'" },
            { entity: "supplier",       change: "changed", detail: "Last Mile agora operada pela GFL Logística" },
            { entity: "general config", change: "edited",  detail: "SLA de expedição reduzido de 48h para 24h" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 4128,
        },
        {
          version: "2.0",
          publishedAt: "2026-07-15T10:30:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Major: adicionada etapa de Faturamento automatizado.",
          deltas: [
            { entity: "task",       change: "added",     detail: "'Emissão de Nota Fiscal' na etapa Faturamento" },
            { entity: "dependency", change: "connected", detail: "Faturamento → Entrega" },
            { entity: "supplier",   change: "added",     detail: "NFe.io conectado como emissor fiscal" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 3970,
        },
        {
          version: "1.3",
          publishedAt: "2026-06-20T09:00:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Reforço no gate de Manuseio para reduzir divergências.",
          deltas: [
            { entity: "general config", change: "edited", detail: "Gate 'deliverable_ready' agora exige conferência dupla" },
            { entity: "task",           change: "edited", detail: "'Packing' alterada para execução manual" },
          ],
          appliedTo: "all_orders",
          activeOrdersAtPublish: 3512,
        },
        {
          version: "1.2",
          publishedAt: "2026-05-10T15:20:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Ativação de rastreamento na Last Mile.",
          deltas: [
            { entity: "task",    change: "added",  detail: "'Proof of Delivery' na etapa Entrega" },
            { entity: "trigger", change: "edited", detail: "Evento 'Pedido criado' passa a considerar canal Marketplace" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 2984,
        },
        {
          version: "1.0",
          publishedAt: "2026-03-01T12:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Publicação inicial do workflow padrão de entrega em domicílio.",
          deltas: [
            { entity: "general config", change: "added", detail: "Workflow criado a partir do template padrão de fulfillment" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 0,
        },
      ],

      custom: false,
      orders: "4256",
    },

    {
      id: "wf-retirada-loja",
      name: "Retirada na loja",
      icon: "storefront",
      desc: "Itens separados no estoque da loja ou CD para pickup pelo cliente no ponto de venda.",
      category: "fulfillment",

      status: "active",
      wfStatus: "published",
      version: "1.4",

      trigger: { type: "system-event", events: ["Pedido criado"] },
      agentEnabled: false,
      deps: [],
      unlocks: [
        { wfId: "wf-troca-devolucao", wfName: "Troca e devolução", wfIcon: "assignment_return" },
      ],

      stages: [
        {
          id: "st-pagamento",
          name: "Pagamento",
          category: "PAYMENT",
          gate: "payment_settled",
          linkedToNext: true,
          responsible: "Gateway",
          tasks: [
            { id: "autorizacao-pagamento", name: "Autorização de Pagamento", type: "auto" },
            { id: "captura-pagamento", name: "Captura de Pagamento", type: "auto" },
          ],
        },
        {
          id: "st-manuseio",
          name: "Manuseio",
          category: "FULFILLMENT",
          gate: "deliverable_ready",
          linkedToNext: true,
          responsible: "Loja",
          tasks: [
            { id: "reserva-estoque", name: "Reserva de Estoque", type: "auto" },
            { id: "picking", name: "Picking", type: "manual" },
            { id: "packing", name: "Packing", type: "manual" },
            { id: "ready-for-pickup", name: "Ready for Pickup", type: "manual", owner: "Loja" },
          ],
        },
        {
          id: "st-faturamento",
          name: "Faturamento",
          category: "FULFILLMENT",
          linkedToNext: true,
          tasks: [
            { id: "emissao-nf", name: "Emissão de Nota Fiscal", type: "auto", owner: "NFe.io" },
          ],
        },
        {
          id: "st-entrega-loja",
          name: "Entrega em Loja",
          category: "DELIVERY",
          gate: "customer_has_goods",
          linkedToNext: false,
          responsible: "Loja",
          tasks: [
            { id: "customer-checkin", name: "Customer Check-in", type: "manual" },
            { id: "handover-pos", name: "Handover at POS", type: "manual" },
          ],
        },
      ],

      flatOrder: ["autorizacao-pagamento", "captura-pagamento", "reserva-estoque", "picking", "packing", "ready-for-pickup", "emissao-nf", "customer-checkin", "handover-pos"],

      publishedAt: "2026-08-10T10:00:00Z",
      publishedBy: "julia.grisi@vtex.com",
      lastEditedAt: "2026-08-10T10:00:00Z",
      lastEditedBy: "julia.grisi@vtex.com",
      versionLog: [
        {
          version: "1.4",
          publishedAt: "2026-08-10T10:00:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Ajuste no fluxo de handover para reduzir tempo no ponto de venda.",
          deltas: [
            { entity: "task",           change: "renamed", detail: "'Confirmar retirada' renomeada para 'Handover at POS'" },
            { entity: "general config", change: "edited",  detail: "Prazo máximo de retenção em loja aumentado para 7 dias" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 118,
        },
        {
          version: "1.3",
          publishedAt: "2026-07-05T14:00:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Notificação ao cliente quando o pedido chega na loja.",
          deltas: [
            { entity: "task", change: "added",  detail: "'Customer Check-in' antes do handover" },
            { entity: "task", change: "edited", detail: "'Ready for Pickup' agora dispara e-mail automático" },
          ],
          appliedTo: "all_orders",
          activeOrdersAtPublish: 95,
        },
        {
          version: "1.2",
          publishedAt: "2026-06-01T09:30:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Simplificação da etapa de Manuseio.",
          deltas: [
            { entity: "task", change: "removed", detail: "'Conferência dupla' removida da etapa Manuseio" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 72,
        },
        {
          version: "1.0",
          publishedAt: "2026-04-20T11:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Publicação inicial do workflow de pickup em loja.",
          deltas: [
            { entity: "general config", change: "added", detail: "Workflow criado para operação de retirada em ponto físico" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 0,
        },
      ],

      custom: false,
      orders: "127",
    },

    {
      id: "wf-entrega-virtual",
      name: "Entrega produto virtual",
      icon: "smartphone",
      desc: "Item virtual entregue eletronicamente após confirmação de pagamento.",
      category: "fulfillment",

      status: "active",
      wfStatus: "published",
      version: "1.2",

      trigger: { type: "system-event", events: ["Pedido criado"] },
      agentEnabled: true,
      deps: [],
      unlocks: [],

      stages: [
        {
          id: "st-pagamento",
          name: "Pagamento",
          category: "PAYMENT",
          gate: "payment_settled",
          linkedToNext: true,
          tasks: [
            { id: "autorizacao-pagamento", name: "Autorização de Pagamento", type: "auto" },
            { id: "captura-pagamento", name: "Captura de Pagamento", type: "auto" },
          ],
        },
        {
          id: "st-ativacao-digital",
          name: "Ativação Digital",
          category: "FULFILLMENT",
          linkedToNext: true,
          agentEnabled: true,
          tasks: [
            { id: "gerar-chave-licenca", name: "Gerar Chave / Licença", type: "auto" },
          ],
        },
        {
          id: "st-faturamento",
          name: "Faturamento",
          category: "FULFILLMENT",
          linkedToNext: true,
          tasks: [
            { id: "emissao-nfe", name: "Emissão de NF-e", type: "auto", owner: "NFe.io" },
          ],
        },
        {
          id: "st-entrega-digital",
          name: "Entrega Digital",
          category: "DELIVERY",
          gate: "customer_has_goods",
          linkedToNext: false,
          agentEnabled: true,
          tasks: [
            { id: "enviar-email", name: "Enviar por E-mail", type: "auto" },
            { id: "confirmacao-acesso", name: "Confirmação de Acesso", type: "auto" },
          ],
        },
      ],

      flatOrder: ["autorizacao-pagamento", "captura-pagamento", "gerar-chave-licenca", "emissao-nfe", "enviar-email", "confirmacao-acesso"],

      publishedAt: "2026-07-30T09:00:00Z",
      publishedBy: "vanessa.borges@vtex.com",
      lastEditedAt: "2026-07-30T09:00:00Z",
      lastEditedBy: "vanessa.borges@vtex.com",
      versionLog: [
        {
          version: "1.2",
          publishedAt: "2026-07-30T09:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Confirmação de acesso após entrega digital.",
          deltas: [
            { entity: "task",           change: "added",  detail: "'Confirmação de Acesso' na etapa Entrega Digital" },
            { entity: "general config", change: "edited", detail: "Agente AI ativado para monitorar falhas de entrega" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 201,
        },
        {
          version: "1.1",
          publishedAt: "2026-06-15T13:45:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Melhoria na geração de chaves de licença.",
          deltas: [
            { entity: "task",     change: "edited", detail: "'Gerar Chave de Licença' agora suporta múltiplos vendors" },
            { entity: "supplier", change: "added",  detail: "NFe.io para emissão de NF-e digital" },
          ],
          appliedTo: "all_orders",
          activeOrdersAtPublish: 168,
        },
        {
          version: "1.0",
          publishedAt: "2026-05-05T10:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Publicação inicial do workflow de entrega de produto virtual.",
          deltas: [
            { entity: "general config", change: "added", detail: "Workflow criado para itens digitais (licenças, downloads)" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 0,
        },
      ],

      custom: false,
      orders: "234",
    },

    {
      id: "wf-cancelamento",
      name: "Cancelamento de Pedido",
      icon: "block",
      desc: "Fluxo disparado quando o cliente ou o merchant solicita cancelamento de um pedido em andamento.",
      category: "cancelamento",

      status: "active",
      wfStatus: "published",
      version: "1.0",

      trigger: { type: "system-event", events: ["Pedido cancelado"] },
      agentEnabled: false,
      deps: [],
      unlocks: [],

      stages: [
        {
          id: "st-solicitacao",
          name: "Solicitação",
          category: "CANCELLATION",
          gate: "cancellation_requested",
          linkedToNext: true,
          responsible: "Operador",
          tasks: [
            { id: "receber-solicitacao", name: "Receber Solicitação", type: "manual" },
            { id: "validar-janela-cancelamento", name: "Validar Janela de Cancelamento", type: "manual" },
          ],
        },
        {
          id: "st-bloqueio",
          name: "Bloqueio",
          category: "FULFILLMENT",
          linkedToNext: true,
          tasks: [
            { id: "bloquear-expedicao", name: "Bloquear Expedição", type: "auto" },
          ],
        },
        {
          id: "st-reembolso",
          name: "Reembolso",
          category: "PAYMENT",
          gate: "cancellation_complete",
          linkedToNext: false,
          tasks: [
            { id: "estornar-estoque", name: "Estornar Estoque", type: "auto" },
            { id: "processar-estorno", name: "Processar Estorno", type: "auto", owner: "Adyen" },
            { id: "notificar-cliente", name: "Notificar Cliente", type: "auto", visibility: "user" },
          ],
        },
      ],

      flatOrder: ["receber-solicitacao", "validar-janela-cancelamento", "bloquear-expedicao", "estornar-estoque", "processar-estorno", "notificar-cliente"],

      publishedAt: "2026-08-05T11:00:00Z",
      publishedBy: "julia.grisi@vtex.com",
      lastEditedAt: "2026-08-05T11:00:00Z",
      lastEditedBy: "julia.grisi@vtex.com",
      versionLog: [
        {
          version: "1.0",
          publishedAt: "2026-08-05T11:00:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Publicação inicial do workflow de cancelamento.",
          deltas: [
            { entity: "general config", change: "added",     detail: "Workflow criado para tratar solicitações de cancelamento pré-envio" },
            { entity: "trigger",        change: "connected", detail: "Evento 'Pedido cancelado' conectado como gatilho" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 0,
        },
      ],

      custom: false,
      orders: "142",
    },

    {
      id: "wf-troca-devolucao",
      name: "Troca e devolução",
      icon: "assignment_return",
      desc: "Fluxo de logística reversa para troca ou devolução de itens já entregues.",
      category: "logistica-reversa",

      status: "active",
      wfStatus: "published",
      version: "1.6",

      trigger: {
        type: "wf-completion",
        triggerWfIds: ["wf-entrega-domicilio", "wf-retirada-loja"],
      },
      agentEnabled: false,
      deps: [],
      unlocks: [],

      stages: [
        {
          id: "st-solicitacao",
          name: "Solicitação",
          category: "FULFILLMENT",
          linkedToNext: true,
          tasks: [
            { id: "abertura-solicitacao", name: "Abertura de Solicitação", type: "manual", visibility: "user" },
            { id: "validar-elegibilidade", name: "Validar Elegibilidade", type: "auto" },
          ],
        },
        {
          id: "st-classificacao",
          name: "Classificação",
          category: "FULFILLMENT",
          linkedToNext: true,
          tasks: [
            { id: "classificar-troca-devolucao", name: "Classificar (Troca / Devolução)", type: "auto" },
          ],
        },
        {
          id: "st-logistica-reversa",
          name: "Logística Reversa",
          category: "REVERSE_LOGISTICS",
          gate: "product_returned",
          linkedToNext: true,
          responsible: "GFL Logística",
          tasks: [
            { id: "gerar-etiqueta-reversa", name: "Gerar Etiqueta Reversa", type: "auto" },
            { id: "notificar-cliente-etiqueta", name: "Notificar Cliente", type: "auto", visibility: "user" },
            { id: "confirmar-postagem", name: "Confirmar Postagem", type: "manual" },
            { id: "receber-produto-cd", name: "Receber Produto no CD", type: "manual" },
            { id: "conferir-estado-produto", name: "Conferir Estado do Produto", type: "manual" },
          ],
        },
        {
          id: "st-reembolso",
          name: "Reembolso",
          category: "PAYMENT",
          linkedToNext: true,
          tasks: [
            { id: "processar-estorno", name: "Processar Estorno", type: "auto", owner: "Adyen" },
          ],
        },
        {
          id: "st-novo-envio",
          name: "Novo Envio",
          category: "DELIVERY",
          gate: "customer_has_goods",
          linkedToNext: false,
          tasks: [
            { id: "separar-despachar-novo-item", name: "Separar e Despachar Novo Item", type: "manual" },
            { id: "notificar-cliente-concluido", name: "Notificar Cliente — Concluído", type: "auto", visibility: "user" },
          ],
        },
      ],

      flatOrder: ["abertura-solicitacao", "validar-elegibilidade", "classificar-troca-devolucao", "gerar-etiqueta-reversa", "notificar-cliente-etiqueta", "confirmar-postagem", "receber-produto-cd", "conferir-estado-produto", "processar-estorno", "separar-despachar-novo-item", "notificar-cliente-concluido"],

      publishedAt: "2026-08-15T16:00:00Z",
      publishedBy: "vanessa.borges@vtex.com",
      lastEditedAt: "2026-08-15T16:00:00Z",
      lastEditedBy: "vanessa.borges@vtex.com",
      versionLog: [
        {
          version: "1.6",
          publishedAt: "2026-08-15T16:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Notificação ao cliente após conclusão da troca.",
          deltas: [
            { entity: "task",           change: "added",  detail: "'Notificar Cliente — Concluído' na etapa Novo Envio" },
            { entity: "general config", change: "edited", detail: "Ativada visibilidade ao cliente em 3 tarefas do fluxo" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 78,
        },
        {
          version: "1.5",
          publishedAt: "2026-07-20T10:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Conferência do produto antes do reembolso.",
          deltas: [
            { entity: "task",       change: "added",     detail: "'Conferir Estado do Produto' na Logística Reversa" },
            { entity: "dependency", change: "connected", detail: "Logística Reversa → Reembolso" },
          ],
          appliedTo: "all_orders",
          activeOrdersAtPublish: 65,
        },
        {
          version: "1.3",
          publishedAt: "2026-06-10T15:00:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Automação da etiqueta reversa.",
          deltas: [
            { entity: "task",     change: "replaced", detail: "'Gerar Etiqueta' manual substituída por versão automática" },
            { entity: "supplier", change: "changed",  detail: "GFL Logística passa a ser fornecedor de reversa" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 41,
        },
        {
          version: "1.0",
          publishedAt: "2026-04-05T09:00:00Z",
          publishedBy: "vanessa.borges@vtex.com",
          description: "Publicação inicial do workflow de troca e devolução.",
          deltas: [
            { entity: "general config", change: "added",     detail: "Workflow criado como logística reversa padrão" },
            { entity: "trigger",        change: "connected", detail: "Disparado ao concluir 'Entrega em domicílio' ou 'Retirada na loja'" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 0,
        },
      ],

      custom: false,
      orders: "83",
    },

    {
      id: "wf-personalizacao-camiseta",
      name: "Personalização de Camiseta",
      icon: "checkroom",
      desc: "Execução de estampa ou bordado personalizado em camiseta, sob demanda, antes da entrega.",
      category: "servicos",

      status: "active",
      wfStatus: "published",
      version: "1.0",

      trigger: {
        type: "task-completion",
        pairs: [
          { wfId: "wf-entrega-domicilio", taskId: "captura-pagamento", status: "Service Executed" },
        ],
      },
      agentEnabled: true,
      deps: [],
      unlocks: [
        { wfId: "wf-entrega-domicilio", wfName: "Entrega em domicílio", wfIcon: "local_shipping" },
      ],

      stages: [
        {
          id: "st-validacao-arte",
          name: "Validação da Arte",
          category: "SERVICE",
          gate: "art_approved",
          linkedToNext: true,
          responsible: "Designer",
          tasks: [
            { id: "verificar-arte-enviada", name: "Verificar Arte Enviada", type: "auto" },
            { id: "validar-especificacao-estampa", name: "Validar Especificação de Estampa", type: "auto" },
            { id: "aprovar-arte", name: "Aprovar Arte", type: "manual", owner: "Designer" },
          ],
        },
        {
          id: "st-producao",
          name: "Produção",
          category: "SERVICE",
          gate: "deliverable_ready",
          linkedToNext: false,
          agentEnabled: true,
          responsible: "Ateliê de Estamparia",
          tasks: [
            { id: "acionar-atelie", name: "Acionar Ateliê de Estamparia", type: "auto" },
            { id: "monitorar-producao", name: "Monitorar Produção", type: "auto" },
            { id: "confirmar-peca-pronta", name: "Confirmar Peça Pronta", type: "manual" },
          ],
        },
      ],

      flatOrder: ["verificar-arte-enviada", "validar-especificacao-estampa", "aprovar-arte", "acionar-atelie", "monitorar-producao", "confirmar-peca-pronta"],

      publishedAt: "2026-08-20T13:00:00Z",
      publishedBy: "julia.grisi@vtex.com",
      lastEditedAt: "2026-08-20T13:00:00Z",
      lastEditedBy: "julia.grisi@vtex.com",
      versionLog: [
        {
          version: "1.0",
          publishedAt: "2026-08-20T13:00:00Z",
          publishedBy: "julia.grisi@vtex.com",
          description: "Publicação inicial do workflow de personalização de camiseta.",
          deltas: [
            { entity: "general config", change: "added",     detail: "Workflow criado como serviço sob demanda" },
            { entity: "trigger",        change: "connected", detail: "Disparado ao concluir 'Captura de Pagamento' em Entrega em domicílio" },
            { entity: "supplier",       change: "added",     detail: "Ateliê de Estamparia como fornecedor de produção" },
          ],
          appliedTo: "new_orders_only",
          activeOrdersAtPublish: 0,
        },
      ],

      custom: true,
      orders: "0",
    },
  ];

  /* ── Workflow library (templates for wizard — previously in view-workflow-board.jsx) ── */
  const libraryWfs = [
    { id: "boleto", name: "Boleto Bancário", icon: "assignment", category: "pagamento",
      desc: "Geração, envio e confirmação de pagamento via boleto bancário",
      stages: [
        { name: "Emissão",       linkedToNext: true,  tasks: [{ id: "bl-1", name: "Gerar boleto", type: "auto", owner: "Gateway" }, { id: "bl-2", name: "Enviar por e-mail", type: "auto", owner: "Notif. Agent" }] },
        { name: "Monitoramento", linkedToNext: true,  tasks: [{ id: "bl-3", name: "Aguardar pagamento", type: "auto", owner: "Gateway" }] },
        { name: "Confirmação",   tasks: [{ id: "bl-4", name: "Confirmar e liberar pedido", type: "auto", owner: "OMS" }] }
      ]},
    { id: "entrega-agendada", name: "Entrega Agendada", icon: "event", category: "fulfillment",
      desc: "Pedidos com janela de entrega agendada pelo cliente",
      stages: [
        { name: "Agendamento", linkedToNext: true, tasks: [{ id: "ea-1", name: "Confirmar janela com cliente", type: "auto", owner: "Notif. Agent" }] },
        { name: "Preparação",  linkedToNext: true, tasks: [{ id: "ea-2", name: "Separar produto no dia", type: "manual", owner: "WMS Operator" }] },
        { name: "Entrega",     tasks: [{ id: "ea-3", name: "Cumprir janela agendada", type: "manual", owner: "Carrier" }] }
      ]},
    { id: "recusa-pgto", name: "Recusa de Pagamento", icon: "block", category: "pagamento",
      desc: "Retentativa e resolução de pagamentos recusados pela operadora",
      stages: [
        { name: "Detecção",    linkedToNext: true,  tasks: [{ id: "rp-1", name: "Detectar recusa", type: "auto", owner: "Gateway" }, { id: "rp-2", name: "Notificar cliente", type: "auto", owner: "Notif. Agent" }] },
        { name: "Retentativa", linkedToNext: false, tasks: [{ id: "rp-3", name: "Retentar cobrança", type: "auto", owner: "Gateway" }] },
        { name: "Resolução",   tasks: [{ id: "rp-4", name: "Cancelar ou confirmar pedido", type: "auto", owner: "Order Management Agent" }] }
      ]},
    { id: "giftcard", name: "Gift Card", icon: "redeem", category: "servicos",
      desc: "Emissão e validação de gift cards na compra e no resgate",
      stages: [
        { name: "Emissão",   linkedToNext: true, tasks: [{ id: "gc-1", name: "Gerar código", type: "auto", owner: "Platform" }, { id: "gc-2", name: "Enviar ao presenteado", type: "auto", owner: "Notif. Agent" }] },
        { name: "Validação", tasks: [{ id: "gc-3", name: "Validar resgate", type: "auto", owner: "Platform" }] }
      ]},
    { id: "assinatura", name: "Assinatura", icon: "sync", category: "servicos",
      desc: "Gestão de cobranças recorrentes e renovações automáticas de assinatura",
      stages: [
        { name: "Cobrança",    linkedToNext: true, tasks: [{ id: "as-1", name: "Cobrar recorrência", type: "auto", owner: "Gateway" }] },
        { name: "Fulfillment", linkedToNext: true, tasks: [{ id: "as-2", name: "Gerar pedido automático", type: "auto", owner: "OMS" }] },
        { name: "Entrega",     tasks: [{ id: "as-3", name: "Despachar pedido", type: "auto", owner: "Carrier" }] }
      ]},
    { id: "b2b-faturamento", name: "Faturamento B2B", icon: "bar_chart", category: "pagamento",
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
    { id: "assistant",      name: "Meu Assistente",          emoji: "auto_awesome", color: "linear-gradient(135deg,#FF3D6E,#9747FF)", tasks: 28430, credits: 142500, sub: "Visão geral · pedidos · workflows" },
    { id: "orchestration",  name: "Agentes de Pedidos",      emoji: "build", color: "linear-gradient(135deg,#9747FF,#1E4EE5)", tasks: 18620, credits: 98400,  sub: "Ativo · 4.256 pedidos monitorados" },
    { id: "sla",            name: "SLA Monitor Agent",       emoji: "schedule", color: "#FFE3E3", tasks: 8240,  credits: 32100, sub: "Detecta pedidos travados acima do SLA" },
    { id: "returns",        name: "Returns Agent",           emoji: "assignment_return",  color: "#E5F0FF", tasks: 4120,  credits: 19800, sub: "Logística reversa e devoluções" },
    { id: "marketplace",    name: "Marketplace Agent",       emoji: "shopping_cart", color: "#FFF3C7", tasks: 6840,  credits: 28700, sub: "Integrações de marketplace" },
    { id: "oms",            name: "Order Management Agent",  emoji: "inventory_2", color: "#E9FCE3", tasks: 12150, credits: 47600, sub: "Order Management & routing" }
  ];

  /* ─── helpers reutilizáveis para steps ──────────────────────────── */
  function stepsDeliveryAllDone(d) {
    return [
      { label:"Autorização de Pagamento", icon:"credit_card", status:"done", agent:true,  time:d+" 09:43" },
      { label:"Captura de Pagamento",     icon:"credit_card", status:"done", agent:true,  time:d+" 09:43" },
      { label:"Reserva de Estoque",       icon:"inventory_2", status:"done", agent:true,  time:d+" 09:44" },
      { label:"Picking",                  icon:"🔍", status:"done", agent:false, time:d+" 10:30" },
      { label:"Packing",                  icon:"inventory_2", status:"done", agent:false, time:d+" 10:50" },
      { label:"Labeling",                 icon:"sell", status:"done", agent:false, time:d+" 11:00" },
      { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"done", agent:true,  time:d+" 11:01" },
      { label:"Expedição",                icon:"📮", status:"done", agent:false, time:d+" 11:30" },
      { label:"First Mile",               icon:"local_shipping", status:"done", agent:true,  time:d+" 13:00" },
      { label:"Last Mile",                icon:"local_shipping", status:"done", agent:true,  time:d+" 16:00" },
      { label:"Proof of Delivery",        icon:"check_circle", status:"done", agent:true,  time:d+" 17:30" },
    ];
  }
  function stepsBOPISNotified(d) {
    return [
      { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:d+" 09:43" },
      { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:d+" 09:43" },
      { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:d+" 09:44" },
      { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:d+" 11:00" },
      { label:"Packing",                  icon:"inventory_2", status:"done",    agent:false, time:d+" 11:20" },
      { label:"Ready for Pickup",         icon:"🔔", status:"done",    agent:true,  time:d+" 11:22", note:"Cliente notificado por e-mail e SMS." },
      { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
      { label:"Customer Check-in",        icon:"storefront", status:"pending", agent:false, time:null },
      { label:"Handover at POS",          icon:"🤝", status:"pending", agent:false, time:null },
    ];
  }
  /* Preparação concluída pelo seller e nenhum evento de coleta a seguir — é a
     assinatura do cluster de despacho travado do Canvas A (labeling às 06:12). */
  function stepsSellerNoDispatch(d) {
    return [
      { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"13/06/2026 18:25" },
      { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"13/06/2026 18:25" },
      { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:"13/06/2026 18:26" },
      { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:d+" 05:40" },
      { label:"Packing",                  icon:"inventory_2", status:"done",    agent:false, time:d+" 06:02" },
      { label:"Labeling",                 icon:"sell", status:"done",    agent:false, time:d+" 06:12", note:"Último evento registrado pelo seller." },
      { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"done",    agent:true,  time:d+" 06:13" },
      { label:"Expedição",                icon:"📮", status:"active",  agent:false, time:null, note:"Sem evento de coleta há mais de 4h. Entrega prevista para hoje." },
      { label:"First Mile",               icon:"local_shipping", status:"pending", agent:true,  time:null },
      { label:"Last Mile",                icon:"local_shipping", status:"pending", agent:true,  time:null },
      { label:"Proof of Delivery",        icon:"check_circle", status:"pending", agent:true,  time:null },
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
          id:"g-bopis", workflow:"wf-retirada-loja", fulfillmentType:"pickup",
          supplier:"C&A · Botafogo RJ",
          label:"Retirada na Loja · C&A Botafogo – RJ",
          projections:[
            { name:"warehouse",      connector:"wms",             status:"done"    },
            { name:"payment",        connector:"payment-gateway",  status:"done"    },
            { name:"invoice",        connector:"fiscal-service",   status:"pending" },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done" },
            { icon:"storefront", label:"Handling na Loja",          status:"done" },
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
          id:"g-delivery", workflow:"wf-entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Jadlog",
          label:"Entrega em Domicílio · Jadlog",
          projections:[
            { name:"warehouse",      connector:"wms",             status:"done" },
            { name:"carrier",        connector:"jadlog",           status:"done" },
            { name:"payment",        connector:"payment-gateway",  status:"done" },
            { name:"invoice",        connector:"fiscal-service",   status:"done" },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done" },
            { icon:"inventory_2", label:"Handling",                 status:"done" },
            { icon:"🧾", label:"Faturamento",              status:"done" },
            { icon:"local_shipping", label:"Entrega",                  status:"done" },
          ],
          items:[
            { name:"Camiseta Básica Pack 2un", emoji:"checkroom", sku:"CA-CB-0991", qty:1, price:"R$ 89,90",  steps:stepsDeliveryAllDone("02/06/2026") },
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
          id:"g-delivery", workflow:"wf-entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Total Express",
          label:"Entrega em Domicílio · Total Express",
          projections:[
            { name:"warehouse",      connector:"wms",             status:"done" },
            { name:"carrier",        connector:"total-express",    status:"done" },
            { name:"payment",        connector:"payment-gateway",  status:"done" },
            { name:"invoice",        connector:"fiscal-service",   status:"done" },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done" },
            { icon:"inventory_2", label:"Handling",                 status:"done" },
            { icon:"🧾", label:"Faturamento",              status:"done" },
            { icon:"local_shipping", label:"Entrega",                  status:"done" },
          ],
          items:[
            { name:"Samsung Galaxy S24 FE 128GB", emoji:"smartphone", sku:"SM-S724B", qty:1, price:"R$ 3.499,00", steps:stepsDeliveryAllDone("30/05/2026") },
          ],
        },
        {
          id:"g-return", workflow:"wf-troca-devolucao", type:"return",
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
            { icon:"inventory_2", label:"Coleta Reversa", status:"active"  },
            { icon:"🔍", label:"Inspeção no CD", status:"pending" },
            { icon:"check_circle", label:"Resolução",       status:"pending" },
          ],
          items:[
            { name:"Samsung Galaxy S24 FE 128GB", emoji:"smartphone", sku:"SM-S724B", qty:1, price:"R$ 3.499,00",
              steps:[
                { label:"Abertura de Solicitação",          icon:"📝", status:"done",    agent:true,  time:"01/06/2026 18:32" },
                { label:"Validar Elegibilidade",            icon:"🔍", status:"done",    agent:true,  time:"01/06/2026 18:33" },
                { label:"Classificar (Troca / Devolução)",  icon:"assignment", status:"done",    agent:true,  time:"01/06/2026 18:33", note:"Classificado como: Devolução com estorno." },
                { label:"Gerar Etiqueta Reversa",           icon:"sell", status:"done",    agent:true,  time:"01/06/2026 18:35" },
                { label:"Notificar Cliente",                icon:"🔔", status:"done",    agent:true,  time:"01/06/2026 18:36" },
                { label:"Confirmar Postagem",               icon:"📮", status:"active",  agent:true,  time:null, note:"Aguardando postagem pelo cliente." },
                { label:"Receber Produto no CD",            icon:"inventory_2", status:"pending", agent:false, time:null },
                { label:"Conferir Estado do Produto",       icon:"🔎", status:"pending", agent:false, time:null },
                { label:"Processar Estorno",                icon:"💰", status:"pending", agent:true,  time:null },
                { label:"Notificar Cliente — Concluído",    icon:"check_circle", status:"pending", agent:true,  time:null },
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
          id:"g-virtual", workflow:"wf-entrega-virtual", type:"virtual",
          fulfillmentType:"virtual",
          supplier:"Digital Service",
          label:"Entrega Produto Virtual · Acesso Digital",
          projections:[
            { name:"digital",        connector:"digital-service",  status:"active"  },
            { name:"payment",        connector:"payment-gateway",   status:"done"    },
            { name:"invoice",        connector:"fiscal-service",    status:"error"   },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done"    },
            { icon:"devices", label:"Ativação Digital",          status:"active"  },
            { icon:"📧", label:"Entrega Digital",           status:"pending" },
          ],
          items:[
            { name:"Consulta Online — Assinatura 3 meses", emoji:"devices", sku:"DS-CO-3M", qty:1, price:"R$ 149,90",
              steps:[
                { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Gerar Chave / Licença",    icon:"🔑", status:"done",    agent:true,  time:"02/06/2026 10:16" },
                { label:"Emissão de NF-e",          icon:"🧾", status:"active",  agent:true,  time:null, connectorStatus:"api_error", connectorNote:"Fiscal Service retornou 503 — retry em andamento" },
                { label:"Enviar por E-mail",        icon:"📧", status:"pending", agent:true,  time:null },
                { label:"Confirmação de Acesso",    icon:"check_circle", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
        {
          id:"g-physical", workflow:"wf-entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Correios SEDEX",
          label:"Entrega em Domicílio · Correios SEDEX",
          projections:[
            { name:"warehouse",      connector:"wms",              status:"active"  },
            { name:"carrier",        connector:"correios-sedex",    status:"pending" },
            { name:"payment",        connector:"payment-gateway",   status:"done"    },
            { name:"invoice",        connector:"fiscal-service",    status:"pending" },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done"    },
            { icon:"inventory_2", label:"Handling",                 status:"active"  },
            { icon:"🧾", label:"Faturamento",              status:"pending" },
            { icon:"local_shipping", label:"Entrega",                  status:"pending" },
          ],
          items:[
            { name:"Vitamina C 1000mg — 60 comprimidos", emoji:"💊", sku:"DS-VC-1000", qty:5, price:"R$ 33,90",
              steps:[
                { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"02/06/2026 10:15" },
                { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:"02/06/2026 10:16" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"02/06/2026 11:00" },
                { label:"Packing",                  icon:"inventory_2", status:"active",  agent:false, time:null },
                { label:"Labeling",                 icon:"sell", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",               icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"check_circle", status:"pending", agent:true,  time:null },
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
          id:"g-kit", workflow:"wf-entrega-domicilio", type:"kit",
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
            { icon:"credit_card", label:"Pagamento", status:"done"   },
            { icon:"inventory_2", label:"Handling",                 status:"done"   },
            { icon:"🧾", label:"Faturamento",              status:"done"   },
            { icon:"local_shipping", label:"Entrega",                  status:"active" },
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
                { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:"01/06/2026 14:01" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"01/06/2026 15:30" },
                { label:"Packing",                  icon:"inventory_2", status:"done",    agent:false, time:"01/06/2026 16:00" },
                { label:"Labeling",                 icon:"sell", status:"done",    agent:false, time:"01/06/2026 16:15" },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"done",    agent:true,  time:"01/06/2026 16:16" },
                { label:"Expedição",                icon:"📮", status:"done",    agent:false, time:"01/06/2026 17:00" },
                { label:"First Mile",               icon:"local_shipping", status:"done",    agent:true,  time:"01/06/2026 19:00" },
                { label:"Last Mile",                icon:"local_shipping", status:"active",  agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"check_circle", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
        {
          id:"g-individual", workflow:"wf-entrega-domicilio", type:"canceling",
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
            { icon:"credit_card", label:"Pagamento", status:"done"    },
            { icon:"inventory_2", label:"Handling",                 status:"active"  },
            { icon:"🧾", label:"Faturamento",              status:"pending" },
            { icon:"local_shipping", label:"Entrega",                  status:"pending" },
          ],
          items:[
            { name:"Cola de Instalação Vinílica 1kg", emoji:"🔧", sku:"CI-1KG-VIN", qty:2, price:"R$ 45,90",
              steps:[
                { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"01/06/2026 14:00" },
                { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:"01/06/2026 14:01" },
                { label:"Picking",                  icon:"🔍", status:"active",  agent:false, time:null, cancelSignal:true },
                { label:"Packing",                  icon:"inventory_2", status:"pending", agent:false, time:null },
                { label:"Labeling",                 icon:"sell", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",               icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"check_circle", status:"pending", agent:true,  time:null },
              ],
            },
          ],
          cancelGroup:{
            id:"g-cancel", workflow:"wf-cancelamento",
            label:"Cancelamento em andamento",
            stages:[
              { icon:"📝", label:"Solicitação",         status:"done"    },
              { icon:"swap_horiz", label:"Reversão Fulfillment", status:"active"  },
              { icon:"💰", label:"Estorno Financeiro",   status:"pending" },
            ],
            steps:[
              { label:"Receber Solicitação",              icon:"📝", status:"done",    agent:true,  time:"02/06/2026 11:45" },
              { label:"Validar Janela de Cancelamento",   icon:"🔍", status:"done",    agent:true,  time:"02/06/2026 11:46" },
              { label:"Bloquear Expedição",               icon:"block", status:"active",  agent:true,  time:null },
              { label:"Estornar Estoque",                 icon:"inventory_2", status:"pending", agent:true,  time:null },
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
            { icon:"credit_card", label:"Pagamento", status:"done"    },
            { icon:"assignment", label:"Validação de Receita",     status:"active"  },
            { icon:"🔬", label:"Produção da Lente",        status:"pending" },
            { icon:"inventory_2", label:"Montagem e Manuseio",      status:"pending" },
            { icon:"🧾", label:"Faturamento",              status:"pending" },
            { icon:"local_shipping", label:"Entrega em Domicílio",     status:"pending" },
          ],
          items:[
            /* ── Armação: pronta-entrega, reservada no CD, aguardando lente ── */
            { name:"Armação Oakley Holbrook RX 54mm", emoji:"👓", sku:"LO-OAK-HOLB-54-PRETO", qty:1, price:"R$ 590,00",
              steps:[
                { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:"10/06/2026 08:49" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"10/06/2026 09:15" },
                { label:"Aguardando lente",         icon:"schedule", status:"active",  agent:true,  time:null, waitingForFab:true, note:"Armação separada e retida no CD. Será embalada junto com a lente após fabricação." },
                { label:"Packing (armação + lente)",icon:"inventory_2", status:"pending", agent:false, time:null },
                { label:"Labeling",                 icon:"sell", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",               icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",        icon:"check_circle", status:"pending", agent:true,  time:null },
              ],
            },
            /* ── Lente: fabricação externa, bloqueia entrega do grupo inteiro ── */
            { name:"Lente Especial Anti-Reflexo +2.50/-0.75", emoji:"🔬", sku:"LO-LENTE-AR-250", qty:1, price:"R$ 1.290,00",
              steps:[
                { label:"Autorização de Pagamento",    icon:"credit_card", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Captura de Pagamento",        icon:"credit_card", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Verificar anexo de receita",  icon:"assignment", status:"active",  agent:false, time:null, note:"Aguardando verificação pelo Atendimento Óptico." },
                { label:"Validar dados da prescrição", icon:"🔍", status:"pending", agent:false, time:null },
                { label:"Aprovar receita",             icon:"check_circle", status:"pending", agent:false, time:null },
                { label:"Acionar laboratório",         icon:"🔬", status:"pending", agent:true,  time:null },
                { label:"Monitorar produção",          icon:"schedule", status:"pending", agent:true,  time:null },
                { label:"Confirmar lente pronta",      icon:"inventory_2", status:"pending", agent:true,  time:null, note:"Lente pronta libera Packing conjunto com a armação." },
                { label:"Packing (armação + lente)",   icon:"inventory_2", status:"pending", agent:false, time:null },
                { label:"Labeling",                    icon:"sell", status:"pending", agent:false, time:null },
                { label:"Emissão de Nota Fiscal",      icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Expedição",                   icon:"📮", status:"pending", agent:false, time:null },
                { label:"First Mile",                  icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Last Mile",                   icon:"local_shipping", status:"pending", agent:true,  time:null },
                { label:"Proof of Delivery",           icon:"check_circle", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
        /* ── Group 2: Óculos de Sol — Retirada na Loja ── */
        {
          id:"g-sol", workflow:"wf-retirada-loja", fulfillmentType:"pickup",
          supplier:"LuzÓtica · Loja Jardins SP",
          label:"Retirada na Loja · LuzÓtica Jardins – SP",
          projections:[
            { name:"payment",   connector:"payment-gateway", status:"done"    },
            { name:"warehouse", connector:"wms",             status:"done"    },
            { name:"invoice",   connector:"fiscal-service",  status:"pending" },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done"    },
            { icon:"storefront", label:"Handling na Loja",          status:"done"    },
            { icon:"🧾", label:"Faturamento",               status:"pending" },
            { icon:"🤝", label:"Entrega em Loja",           status:"pending" },
          ],
          items:[
            { name:"Óculos de Sol Ray-Ban Aviador RB3025", emoji:"visibility", sku:"LO-RB-3025-G15", qty:1, price:"R$ 557,00",
              steps:[
                { label:"Autorização de Pagamento", icon:"credit_card", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Captura de Pagamento",     icon:"credit_card", status:"done",    agent:true,  time:"10/06/2026 08:48" },
                { label:"Reserva de Estoque",       icon:"inventory_2", status:"done",    agent:true,  time:"10/06/2026 08:49" },
                { label:"Picking",                  icon:"🔍", status:"done",    agent:false, time:"10/06/2026 09:10" },
                { label:"Packing",                  icon:"inventory_2", status:"done",    agent:false, time:"10/06/2026 09:20" },
                { label:"Ready for Pickup",         icon:"🔔", status:"done",    agent:true,  time:"10/06/2026 09:22", note:"Cliente notificado por e-mail e SMS." },
                { label:"Emissão de Nota Fiscal",   icon:"🧾", status:"pending", agent:true,  time:null },
                { label:"Customer Check-in",        icon:"storefront", status:"pending", agent:false, time:null },
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
          id:"g-delivery", workflow:"wf-entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Correios SEDEX",
          label:"Entrega em Domicílio · Correios SEDEX",
          projections:[
            { name:"warehouse", connector:"wms",             status:"done" },
            { name:"carrier",   connector:"correios-sedex",  status:"done" },
            { name:"payment",   connector:"payment-gateway", status:"done" },
            { name:"invoice",   connector:"fiscal-service",  status:"done" },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento", status:"done" },
            { icon:"inventory_2", label:"Handling",                 status:"done" },
            { icon:"🧾", label:"Faturamento",              status:"done" },
            { icon:"local_shipping", label:"Entrega",                  status:"done" },
          ],
          items:[
            { name:"Camiseta Linho Premium — P · Branco", emoji:"checkroom", sku:"CMB-LIN-001-P-WH", qty:1, price:"R$ 289,00", steps:stepsDeliveryAllDone("07/06/2026") },
          ],
        },
        {
          id:"g-return", workflow:"wf-troca-devolucao", type:"return",
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
            { icon:"inventory_2", label:"Coleta Reversa",       status:"done"    },
            { icon:"🔍", label:"Inspeção no CD",       status:"done"    },
            { icon:"check_circle", label:"Resolução",             status:"active"  },
          ],
          items:[
            { name:"Camiseta Linho Premium — P · Branco", emoji:"checkroom", sku:"CMB-LIN-001-P-WH", qty:1, price:"R$ 289,00",
              steps:[
                { label:"Abertura de Solicitação",         icon:"📝", status:"done",    agent:true,  time:"13/06/2026 14:22", note:"Ticket #SAC-8841 · canal WhatsApp SAC." },
                { label:"Validar Elegibilidade",           icon:"🔍", status:"done",    agent:true,  time:"13/06/2026 09:15" },
                { label:"Receber Produto no CD",           icon:"inventory_2", status:"done",    agent:false, time:"13/06/2026 09:15" },
                { label:"Conferir Estado do Produto",      icon:"🔎", status:"done",    agent:false, time:"13/06/2026 09:45", note:"Defeito de fabricação confirmado na costura lateral. Reintegração ao estoque descartada." },
                { label:"Definir Tipo de Resolução",       icon:"🔀", status:"active",  agent:false, time:null, note:"Decisão humana do SAC: reembolso integral, troca, reembolso parcial ou voucher." },
                { label:"Processar Resolução Financeira",  icon:"💰", status:"pending", agent:true,  time:null },
                { label:"Notificar Cliente — Concluído",   icon:"check_circle", status:"pending", agent:true,  time:null },
              ],
            },
          ],
        },
      ],
    },

    /* ══ Pedido 10 · Loja Botafogo · Canvas A — despacho não iniciado ══
       Primeiro dos 23 pedidos do cluster de buildCanvasAOrders(). É o único
       com registro completo aqui: na ocorrência TA-CANVAS-A a lista de
       "Pedidos afetados" só abre detalhe para os IDs presentes em orders. */
    {
      id:"1621368619303-01", short:"68619303",
      date:"13/06/2026 - 18:24", customer:"Marina Bastos",
      origin:"Site", qty:3, total:"R$ 428,70",
      status:"attention", statusLabel:"Atenção necessária",
      sla:"D+1 hoje", seller:"Loja Botafogo", eta:"14/06/2026",
      customerDetail:{
        taxId:"618.204.331-77",
        phone:"(21) 98812-4407",
        email:"marina.bastos@email.com",
        address:"Rua Voluntários da Pátria, 445, Apto 802 · Botafogo – Rio de Janeiro, RJ · CEP 22270-000",
        billingAddress:"Rua Voluntários da Pátria, 445, Apto 802 · Botafogo – Rio de Janeiro, RJ · CEP 22270-000",
        card:"Visa **** 6721",
      },
      note:{
        useCase:"Seller não iniciou o despacho dentro do SLA de entrega D+1",
        text:"Pedido preparado normalmente pelo seller Loja Botafogo: pagamento capturado, separação, embalagem, etiqueta e nota fiscal concluídos às 06:12. A partir daí nenhum evento de coleta foi registrado pelo carrier — a expedição segue parada há mais de 4h e a entrega está prevista para hoje. É um dos 23 pedidos do cluster que originou a ocorrência de despacho da Loja Botafogo.",
      },
      itemGroups:[
        {
          id:"g-delivery", workflow:"wf-entrega-domicilio", fulfillmentType:"delivery",
          supplier:"Loja Botafogo · Jadlog",
          label:"Entrega em Domicílio · Jadlog",
          projections:[
            { name:"payment",   connector:"payment-gateway", status:"done"    },
            { name:"warehouse", connector:"wms",             status:"done"    },
            { name:"invoice",   connector:"fiscal-service",  status:"done"    },
            { name:"carrier",   connector:"jadlog",          status:"error"   },
          ],
          stages:[
            { icon:"credit_card", label:"Pagamento",   status:"done"   },
            { icon:"inventory_2", label:"Handling",    status:"done"   },
            { icon:"🧾", label:"Faturamento", status:"done"   },
            { icon:"local_shipping", label:"Entrega",     status:"active" },
          ],
          items:[
            { name:"Tênis Running Flex Pro", emoji:"👟", sku:"LB-TN-4409", qty:1, price:"R$ 299,90",
              steps:stepsSellerNoDispatch("14/06/2026") },
            { name:"Meia Esportiva Cano Alto Pack 3un", emoji:"🧦", sku:"LB-ME-1180", qty:2, price:"R$ 64,40",
              steps:stepsSellerNoDispatch("14/06/2026") },
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

  /* ── My Initiatives (v3 parity) ──
     Cada iniciativa abre primeiro como um documento (ver InitiativeDocumentPanel
     em view-initiatives.jsx): título, descrição, metadados (status, severidade,
     responsável, participantes, reportada por), Diagnóstico e Tarefas — sem
     chat. O chat só é aberto quando o usuário clica em "Ver conversa" numa
     tarefa específica. IDs alinhados aos já referenciados em myTasks[].source
     (kind: "initiative").

     A tela My Initiatives passou a listar a fila de ocorrências (AIWData.tasks,
     a mesma do OpenTasksCard da home); este dataset continua alimentando o
     InitiativeDocumentPanel e as origens de myTasks[]. */
  const initiatives = [
    {
      id: "IN6281", title: "Personalização de recomendações na vitrine", status: "attention",
      source: { kind: "initiative", label: "Catálogo" }, owner: "Pedro Alves", ownerInitials: "PA",
      tasksTotal: 3, tasksDone: 1, updated: "há 40min",
      description: "Ajustar as vitrines e recomendações para refletir preferências e comportamento de navegação dos visitantes.",
      priority: "medium",
      reportedBy: { label: "Insights de Dados", at: "27/03 às 11:30" },
      participants: [{ initials: "PA", name: "Pedro Alves" }, { initials: "AC", name: "Ana Costa" }, { initials: "YO", name: "You" }],
      diagnosis: "O aumento de tráfego não converteu na mesma proporção nas últimas duas semanas. Visitantes recorrentes veem as mesmas recomendações genéricas de novos visitantes, o que reduz a relevância da vitrine e a taxa de clique.",
      tasksList: [
        { id: "TSK-202", title: "Ajustar recomendações da vitrine para usuários recorrentes", status: "active", assigneeInitials: "PA", assigneeName: "Pedro Alves" },
        { title: "Mapear segmentos de clientes recorrentes", status: "completed", assigneeInitials: "AC", assigneeName: "Ana Costa" },
        { title: "Definir regra de fallback para novos visitantes", status: "triage", assigneeInitials: "YO", assigneeName: "You" },
      ],
    },
    {
      id: "IN6280", title: "Precificação dinâmica em pedidos de alto risco", status: "attention",
      source: { kind: "initiative", label: "Precificação" }, owner: "You", ownerInitials: "YO",
      tasksTotal: 2, tasksDone: 1, updated: "há 1h",
      description: "Revisar e aprovar ajustes de preço sugeridos pelo agente para pedidos com risco de margem negativa.",
      priority: "high",
      reportedBy: { label: "Pricing Agent", at: "28/03 às 09:12" },
      participants: [{ initials: "YO", name: "You" }, { initials: "GV", name: "Guilherme Vecchi" }],
      diagnosis: "13 SKUs estão sendo vendidos abaixo do custo de reposição desde o último reajuste de frete. O agente de precificação propôs um novo teto de desconto por categoria, mas a mudança excede a política automática e precisa de aprovação manual.",
      tasksList: [
        { id: "TSK-302", title: "Revisar proposta de precificação dinâmica — aguarda aprovação", status: "attention", assigneeInitials: "YO", assigneeName: "You" },
        { title: "Validar elasticidade de preço por categoria", status: "completed", assigneeInitials: "GV", assigneeName: "Guilherme Vecchi" },
      ],
    },
    {
      id: "IN6274", title: "Otimização do funil de checkout", status: "active",
      source: { kind: "initiative", label: "Checkout" }, owner: "Bruno Silva", ownerInitials: "BS",
      tasksTotal: 2, tasksDone: 0, updated: "há 3h",
      description: "Simplificar o processo de checkout para aumentar a taxa de conversão e reduzir o abandono de carrinho.",
      priority: "medium",
      reportedBy: { label: "Checkout Agent", at: "25/03 às 08:00" },
      participants: [{ initials: "BS", name: "Bruno Silva" }, { initials: "LM", name: "Lucas Moura" }],
      diagnosis: "O checkout atual tem 4 etapas e uma taxa de abandono de 38% na etapa de endereço. Concorrentes diretos operam com 2 etapas e preenchimento automático de endereço via CEP.",
      tasksList: [
        { title: "Reduzir etapas do checkout de 4 para 2", status: "active", assigneeInitials: "BS", assigneeName: "Bruno Silva" },
        { title: "Testar preenchimento automático de endereço por CEP", status: "triage", assigneeInitials: "LM", assigneeName: "Lucas Moura" },
      ],
    },
    {
      id: "IN6273", title: "Otimização de catálogo", status: "attention",
      source: { kind: "content", label: "Catálogo" }, owner: "Tiago Nunes", ownerInitials: "TN",
      tasksTotal: 2, tasksDone: 1, updated: "há 2h",
      description: "Corrigir SEO, títulos e descrições dos produtos mais visitados para melhorar posicionamento e conversão.",
      priority: "medium",
      reportedBy: { label: "Content Agent", at: "26/03 às 14:20" },
      participants: [{ initials: "TN", name: "Tiago Nunes" }, { initials: "YO", name: "You" }],
      diagnosis: "Os 50 SKUs mais visitados têm títulos e descrições migrados do catálogo legado, sem otimização de busca. Isso reduz o posicionamento orgânico e a taxa de conversão desses produtos.",
      tasksList: [
        { id: "TSK-402", title: "Migrar catálogo legado — categorias raiz aprovadas", status: "completed", assigneeInitials: "TN", assigneeName: "Tiago Nunes" },
        { title: "Aprovar novas descrições geradas por IA para os 50 SKUs mais visitados", status: "attention", assigneeInitials: "YO", assigneeName: "You" },
      ],
    },
    {
      id: "IN6272", title: "Oportunidade de promoção", status: "active",
      source: { kind: "campaign", label: "Marketing" }, owner: "Carla Fontes", ownerInitials: "CF",
      tasksTotal: 1, tasksDone: 0, updated: "ontem",
      description: "Criar campanhas promocionais para produtos com alta margem e baixa saída no estoque.",
      priority: "low",
      reportedBy: { label: "Merchandising Agent", at: "24/03 às 17:45" },
      participants: [{ initials: "CF", name: "Carla Fontes" }],
      diagnosis: "22 SKUs com margem acima de 40% estão parados há mais de 60 dias. Não há campanha ativa direcionada a esse grupo no momento.",
      tasksList: [
        { title: "Selecionar SKUs elegíveis para a promoção", status: "active", assigneeInitials: "CF", assigneeName: "Carla Fontes" },
      ],
    },
    {
      id: "IN6270", title: "Otimização de busca", status: "active",
      source: { kind: "initiative", label: "Busca" }, owner: "Ana Costa", ownerInitials: "AC",
      tasksTotal: 1, tasksDone: 0, updated: "há 4h",
      description: "Criar sinônimos e ajustar regras de busca para termos de alto volume sem resultado.",
      priority: "low",
      reportedBy: { label: "Search Agent", at: "23/03 às 10:05" },
      participants: [{ initials: "AC", name: "Ana Costa" }],
      diagnosis: "12 termos de busca de alto volume da coleção Verão 2026 retornam \"sem resultados\" por falta de sinônimos cadastrados.",
      tasksList: [
        { id: "TSK-102", title: "Sincronizar sinônimos de busca para coleção Verão 2026", status: "triage", assigneeInitials: "AC", assigneeName: "Ana Costa" },
      ],
    },
    {
      id: "IN6268", title: "Otimização de entrega", status: "active",
      source: { kind: "initiative", label: "Logística" }, owner: "John Davis", ownerInitials: "JD",
      tasksTotal: 1, tasksDone: 0, updated: "há 5h",
      description: "Expandir a cobertura logística para regiões com alta demanda e prazos de entrega elevados.",
      priority: "medium",
      reportedBy: { label: "Carrier Agent", at: "22/03 às 09:30" },
      participants: [{ initials: "JD", name: "John Davis" }],
      diagnosis: "3 regiões com crescimento de pedidos acima de 30% no último trimestre ainda não têm cobertura de frete grátis, elevando o prazo médio de entrega.",
      tasksList: [
        { id: "TSK-101", title: "Validar regra de frete grátis para pedidos acima de R$ 299", status: "triage", assigneeInitials: "JD", assigneeName: "John Davis" },
      ],
    },
    {
      id: "IN6265", title: "Workflow de devolução express", status: "completed",
      source: { kind: "initiative", label: "Pós-venda" }, owner: "Rita Almeida", ownerInitials: "RA",
      tasksTotal: 1, tasksDone: 1, updated: "há 1 semana",
      description: "Publicar workflow de devolução express para pedidos com prazo de coleta menor que 48h.",
      priority: "low",
      reportedBy: { label: "Returns Agent", at: "18/03 às 16:00" },
      participants: [{ initials: "RA", name: "Rita Almeida" }],
      diagnosis: "Devoluções com coleta expressa não tinham um workflow dedicado, aumentando o tempo de resposta ao cliente.",
      tasksList: [
        { id: "TSK-401", title: "Publicar workflow de devolução express (< 48h)", status: "completed", assigneeInitials: "RA", assigneeName: "Rita Almeida" },
      ],
    },
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

  /* ── Políticas do Workflow ────────────────────────────────────────────
     Regras agrupadas por política, e políticas agrupadas por categoria.
     Cada regra é um cenário do OMS Agent Hub: um gatilho em linguagem
     natural, as condições que o disparam e as tarefas que ele atribui.
     Consumido por view-workflow-policies.jsx (#/workflow-policies). ── */

  /* Tipo de ação de cada tarefa atribuída — define o rótulo do agrupamento
     no drawer, a cor do chip e a cor do ponto no resumo da linha. */
  const policyActionKinds = [
    { id: "diagnose",   label: "Diagnosticar", bg: "#f1f8fd", fg: "#042db4", dot: "#0a72ee" },
    { id: "notify",     label: "Notificar",    bg: "#f9f5fd", fg: "#5c12b6", dot: "#9c56f3" },
    { id: "workflow",   label: "Workflow",     bg: "#e9fce3", fg: "#01540e", dot: "#019213" },
    { id: "reprocess",  label: "Reprocessar",  bg: "#e9faf8", fg: "#0d504d", dot: "#018d88" },
    { id: "replan",     label: "Replanejar",   bg: "#e6fafd", fg: "#014b74", dot: "#0187b5" },
    { id: "reallocate", label: "Realocar",     bg: "#fbf7d4", fg: "#5c4401", dot: "#9c7901" },
    { id: "refund",     label: "Reembolsar",   bg: "#fdf5f7", fg: "#8f0246", dot: "#de387f" },
    { id: "cancel",     label: "Cancelar",     bg: "#fdf6f5", fg: "#940303", dot: "#d31a15" },
    { id: "escalate",   label: "Escalar",      bg: "#fdf5e9", fg: "#7b3001", dot: "#cc5e01" },
  ];

  /* `rulePrefix` — família de id usada ao numerar uma regra nova criada pelo
     assistente dentro daquela categoria. */
  /* `color` = background do chip da tag. `fg` = tom escuro derivado da
     mesma matriz de cor, usado no texto e no ícone da tag pra garantir
     contraste sem sair da paleta da categoria. */
  const policyCategories = [
    { id: "exceptions",  label: "Exceções Operacionais", icon: "warning_amber", color: "#ffe0ae", fg: "#6b3d00", rulePrefix: "EXC" },
    { id: "payment",     label: "Pagamento",             icon: "credit_card",   color: "#eddcfe", fg: "#4a1e8a", rulePrefix: "MON" },
    { id: "logistics",   label: "Logística",             icon: "local_shipping",color: "#faec6d", fg: "#5c4a00", rulePrefix: "LOG" },
    { id: "fulfillment", label: "Fulfillment",           icon: "inventory_2",   color: "#a5f1ff", fg: "#004b6b", rulePrefix: "LOG" },
    { id: "returns",     label: "Devolução & Troca",     icon: "swap_horiz",    color: "#abf2eb", fg: "#004a45", rulePrefix: "DEV" },
  ];

  const task = (label, kind) => ({ label, kind });

  const workflowPolicies = [
    { id: "pol-risk-sla", category: "exceptions", name: "Detecção de Risco & SLA", rules: [
      { id: "MON-005", name: "Pedido com entrega em risco", active: true,
        trigger: "Pedido ainda não atrasou, mas a projeção indica quebra de SLA.",
        conditions: [{ natural: "A entrega projetada vai furar o SLA combinado.", technical: "delivery.slaBreachProjected == true" }],
        tasks: [task("Antecipar etapa crítica", "replan"), task("Trocar transportadora", "reallocate"), task("Repriorizar picking", "replan"), task("Notificar cliente", "notify")] },
      { id: "MON-006", name: "Aumento anormal de cancelamentos", active: true,
        trigger: "Cancelamentos sobem acima do padrão em canal, seller, região, campanha ou categoria.",
        conditions: [{ natural: "A taxa de cancelamentos está acima do padrão normal.", technical: "cancellations.rateAboveBaseline == true" }],
        tasks: [task("Segmentar causa raiz", "diagnose"), task("Pausar seller ou canal", "cancel"), task("Ajustar regra de alocação", "replan")] },
      { id: "MON-007", name: "Aumento anormal de devoluções", active: true,
        trigger: "Volume de devoluções cresce em produto, seller, transportadora, região ou campanha.",
        conditions: [{ natural: "O volume de devoluções está acima do padrão normal.", technical: "returns.volumeAboveBaseline == true" }],
        tasks: [task("Identificar cluster de devoluções", "diagnose"), task("Pausar seller ou canal", "cancel"), task("Revisar política", "escalate")] },
      { id: "MON-008", name: "Histórico de pedido complexo", active: false,
        trigger: "Pedido teve alteração de item, seller, pagamento, invoice parcial, entrega e contato de SAC.",
        conditions: [{ natural: "O pedido teve uma linha do tempo com muitos eventos incomuns.", technical: 'order.timelineComplexity == "high"' }],
        tasks: [task("Gerar resumo do pedido", "diagnose")] },
    ]},
    { id: "pol-order-changes", category: "exceptions", name: "Alterações & Cancelamentos", rules: [
      { id: "EXC-001", name: "Alterar item antes da separação", active: true,
        trigger: "Cliente pede troca de item antes do picking iniciar.",
        conditions: [{ natural: "O cliente pediu para trocar um item.", technical: "change.requested == true" }, { natural: "A separação ainda não começou.", technical: "picking.started == false" }],
        tasks: [task("Validar elegibilidade", "diagnose"), task("Recalcular pedido", "workflow"), task("Alterar item", "workflow"), task("Registrar evidência", "workflow")] },
      { id: "EXC-002", name: "Alterar item depois do picking iniciado", active: true,
        trigger: "Cliente pede troca de item quando o pedido já está em separação ou packing.",
        conditions: [{ natural: "O cliente pediu para trocar um item.", technical: "change.requested == true" }, { natural: "A separação já começou.", technical: "picking.started == true" }],
        tasks: [task("Bloquear alteração", "cancel"), task("Cancelar item afetado", "cancel"), task("Replanejar picking", "replan"), task("Criar troca pós-entrega", "workflow")] },
      { id: "EXC-003", name: "Alteração de endereço", active: true,
        trigger: "Cliente quer mudar endereço após aprovação do pedido.",
        conditions: [{ natural: "O cliente pediu para mudar o endereço de entrega.", technical: "address.changeRequested == true" }],
        tasks: [task("Validar janela de alteração", "diagnose"), task("Recalcular entrega", "replan"), task("Aprovar ou rejeitar com explicação", "escalate")] },
      { id: "EXC-009", name: "Cancelar parcialmente um pedido", active: true,
        trigger: "Um item não pode ser atendido, mas os demais podem seguir.",
        conditions: [{ natural: "Um dos itens do pedido não pode ser atendido.", technical: "order.hasUnfulfillableItem == true" }],
        tasks: [task("Cancelar item afetado", "cancel"), task("Recalcular valor, invoice e entrega", "workflow"), task("Notificar cliente", "notify")] },
    ]},
    { id: "pol-fraud-commercial", category: "exceptions", name: "Fraude & Exceções Comerciais", rules: [
      { id: "EDGE-006", name: "Suspeita de fraude após aprovação", active: true,
        trigger: "Pedido aprovado, mas sinais posteriores indicam risco.",
        conditions: [{ natural: "Surgiu um sinal de risco de fraude depois que o pedido já tinha sido aprovado.", technical: "fraud.postApprovalSignal == true" }],
        tasks: [task("Pausar workflow do pedido", "cancel"), task("Pedir revisão antifraude", "escalate"), task("Segurar invoice e fulfillment", "cancel")] },
      { id: "EXC-010", name: "Observações operacionais críticas", active: false,
        trigger: "Observação manual contém acordo comercial, exceção de SAC ou promessa ao cliente.",
        conditions: [{ natural: "Uma observação manual no pedido menciona um acordo ou promessa feita ao cliente.", technical: "order.note.containsCommitment == true" }],
        tasks: [task("Converter observação em evidência", "workflow"), task("Criar política temporária", "escalate")] },
    ]},
    { id: "pol-payment-authorization", category: "payment", name: "Pagamentos & Autorização", rules: [
      { id: "MON-001", name: "Pedido parado em pagamento", active: true,
        trigger: "Pedido aprovado comercialmente, mas não avança para faturamento ou separação.",
        conditions: [{ natural: "O pagamento já foi aprovado.", technical: "payment.approved == true" }, { natural: "O pedido não avançou para faturamento.", technical: "order.advancedToInvoicing == false" }],
        tasks: [task("Tentar nova autorização/captura", "reprocess"), task("Abrir alerta para SAC/Financeiro", "notify"), task("Solicitar novo meio de pagamento", "notify"), task("Cancelar por política", "cancel")] },
      { id: "SUB-002", name: "Pedido de assinatura falhou por pagamento", active: true,
        trigger: "Pedido recorrente foi criado ou tentado, mas o pagamento não foi aprovado.",
        conditions: [{ natural: "Um pedido do ciclo recorrente foi criado.", technical: "subscription.cycleOrderCreated == true" }, { natural: "O pagamento não foi aprovado.", technical: "payment.approved == false" }],
        tasks: [task("Tentar novo retry de cobrança", "reprocess"), task("Pedir atualização do método de pagamento", "notify"), task("Pausar ciclo da assinatura", "cancel"), task("Notificar cliente", "notify")] },
      { id: "EDGE-002", name: "Pré-autorização expira antes do faturamento", active: true,
        trigger: "Pedido de fulfillment longo perde janela de captura.",
        conditions: [{ natural: "A pré-autorização do pagamento expira antes da data prevista para o faturamento.", technical: "payment.preAuthExpiresBefore(invoice.expectedAt)" }],
        tasks: [task("Reautorizar dentro da política", "reprocess"), task("Capturar de forma idempotente", "workflow")] },
    ]},
    { id: "pol-invoicing", category: "payment", name: "Faturamento & Invoice", rules: [
      { id: "MON-002", name: "Pedido pendente de faturamento", active: true,
        trigger: "Pedido pago e liberado, mas invoice total ou parcial não foi gerada.",
        conditions: [{ natural: "O pagamento foi liquidado.", technical: "payment.settled == true" }, { natural: "A nota fiscal ainda não foi emitida.", technical: "invoice.issued == false" }],
        tasks: [task("Gerar invoice total/parcial", "workflow"), task("Reprocessar tentativa de faturamento", "reprocess"), task("Abrir task fiscal", "workflow"), task("Escalar integração", "escalate")] },
      { id: "EXC-006", name: "Falha ou necessidade de invoice parcial", active: true,
        trigger: "Parte dos itens pode faturar, mas outra parte está bloqueada.",
        conditions: [{ natural: "Existem itens do pedido que já podem ser faturados.", technical: "invoice.releasableItems > 0" }, { natural: "Existem itens do pedido bloqueados para faturamento.", technical: "invoice.blockedItems > 0" }],
        tasks: [task("Gerar invoice parcial dos itens liberados", "workflow"), task("Abrir follow-up dos itens bloqueados", "workflow")] },
    ]},
    { id: "pol-charges", category: "payment", name: "Cobrança & Valores Divergentes", rules: [
      { id: "EXC-004", name: "Valor divergente no pedido", active: true,
        trigger: "Valor do pedido não bate com o esperado pelo cliente, SAC ou financeiro.",
        conditions: [{ natural: "O valor total do pedido não bate com o valor esperado.", technical: "order.total != order.expectedTotal" }],
        tasks: [task("Explicar composição do valor", "diagnose"), task("Identificar origem da diferença", "diagnose"), task("Sugerir ajuste ou reembolso", "refund")] },
      { id: "EXC-005", name: "Cobrança indevida", active: true,
        trigger: "Cliente foi cobrado a mais, duplicado ou após cancelamento parcial.",
        conditions: [{ natural: "O valor capturado no pagamento é maior do que o valor devido pelo pedido.", technical: "payment.capturedAmount > order.dueAmount" }],
        tasks: [task("Comparar pedido, invoice e captura", "diagnose"), task("Disparar estorno ou reembolso", "refund"), task("Bloquear nova cobrança", "cancel")] },
    ]},
    { id: "pol-carrier", category: "logistics", name: "Coleta & Transporte", rules: [
      { id: "LOG-003", name: "Transportadora não coletou no horário", active: true,
        trigger: "Pedido está separado/embalado, mas sem coleta.",
        conditions: [{ natural: "O pedido já está embalado.", technical: "packing.done == true" }, { natural: "A transportadora ainda não coletou.", technical: "carrier.pickedUp == false" }],
        tasks: [task("Acionar transportadora", "notify"), task("Trocar provider de frete", "reallocate"), task("Reagendar coleta", "replan"), task("Notificar cliente", "notify")] },
      { id: "LOG-004", name: "Falha na geração de etiqueta", active: true,
        trigger: "Pedido pronto para envio, mas etiqueta não foi gerada.",
        conditions: [{ natural: "A etiqueta de envio não foi gerada.", technical: "shipping.labelGenerated == false" }],
        tasks: [task("Revalidar dados de envio", "diagnose"), task("Tentar novamente com backoff", "reprocess"), task("Trocar transportadora", "reallocate"), task("Escalar para o time logístico", "escalate")] },
      { id: "LOG-010", name: "Carrier API indisponível", active: true,
        trigger: "Dependência externa da transportadora está fora.",
        conditions: [{ natural: "A API da transportadora está fora do ar.", technical: "carrier.apiAvailable == false" }],
        tasks: [task("Adiar task dependente", "replan"), task("Tentar novamente com backoff", "reprocess"), task("Bloquear avanço por evidência", "cancel")] },
    ]},
    { id: "pol-dispatch", category: "logistics", name: "Despacho & Entrega", rules: [
      { id: "MON-004", name: "Seller não despachou no SLA", active: true,
        trigger: "Pedido foi alocado ao seller, mas não foi despachado dentro do combinado.",
        conditions: [{ natural: "O seller passou do prazo combinado para despachar o pedido.", technical: "seller.dispatchElapsed > seller.dispatchSla" }],
        tasks: [task("Notificar seller", "notify"), task("Abrir task de exceção", "workflow"), task("Reatribuir seller", "reallocate"), task("Dividir pedido", "replan"), task("Cancelar item afetado", "cancel")] },
      { id: "LOG-007", name: "Pedido multi-seller com um seller atrasado", active: true,
        trigger: "Parte do pedido está pronta, parte atrasada com seller específico.",
        conditions: [{ natural: "O pedido tem itens de mais de um seller.", technical: "order.isMultiSeller == true" }, { natural: "Um dos sellers está atrasado com a parte dele do pedido.", technical: "order.hasLateSellerItem == true" }],
        tasks: [task("Dividir envio", "replan"), task("Reatribuir item atrasado", "reallocate"), task("Cancelar item afetado", "cancel")] },
      { id: "EDGE-004", name: "Carrier confirma entrega, cliente nega recebimento", active: true,
        trigger: "Tracking diz entregue, mas cliente afirma não ter recebido.",
        conditions: [{ natural: "O rastreio mostra que o pedido foi entregue.", technical: 'tracking.status == "delivered"' }, { natural: "O cliente afirma que não recebeu o pedido.", technical: "customer.deniesReceipt == true" }],
        tasks: [task("Abrir disputa com carrier", "escalate"), task("Coletar evidências de entrega", "diagnose"), task("Segurar reembolso até decisão", "cancel")] },
    ]},
    { id: "pol-picking", category: "fulfillment", name: "Separação & Priorização", rules: [
      { id: "MON-003", name: "Pedido atrasado na separação", active: true,
        trigger: "Pedido deveria estar em picking, mas segue parado ou não iniciado.",
        conditions: [{ natural: "A separação ainda não começou.", technical: "picking.started == false" }, { natural: "O prazo para começar a separação já passou.", technical: "picking.dueAt < now()" }],
        tasks: [task("Priorizar na fila", "replan"), task("Acionar Pick and Pack", "workflow"), task("Reatribuir fulfillment point", "reallocate"), task("Notificar cliente preventivamente", "notify")] },
      { id: "LOG-001", name: "Pedido pronto para separação, mas não priorizado", active: true,
        trigger: "Pedido pronto fica misturado em fila grande.",
        conditions: [{ natural: "O pedido já está pronto para começar a separação.", technical: "picking.readyToStart == true" }, { natural: "O pedido está posicionado muito atrás na fila, além do limite seguro de SLA.", technical: "picking.queuePosition > queue.slaThreshold" }],
        tasks: [task("Reordenar fila por SLA e risco", "replan")] },
      { id: "LOG-009", name: "Pedido BOPIS não ficou pronto", active: false,
        trigger: "Cliente vai retirar, mas pedido não está ready for pickup.",
        conditions: [{ natural: "O pedido é para retirada na loja (BOPIS).", technical: "order.isBopis == true" }, { natural: "O pedido ainda não está pronto para retirada.", technical: "order.readyForPickup == false" }],
        tasks: [task("Repriorizar picking", "replan"), task("Avisar loja e cliente", "notify"), task("Reatribuir loja", "reallocate")] },
    ]},
    { id: "pol-capacity-stock", category: "fulfillment", name: "Capacidade & Estoque", rules: [
      { id: "LOG-002", name: "Fulfillment point com capacidade esgotada", active: true,
        trigger: "CD/loja recebeu mais pedidos do que consegue processar.",
        conditions: [{ natural: "O CD ou loja recebeu mais pedidos do que consegue processar agora.", technical: "fulfillmentPoint.assignedOrders > fulfillmentPoint.capacity" }],
        tasks: [task("Rebalancear pedidos futuros", "replan"), task("Reatribuir pedidos não iniciados", "reallocate"), task("Abrir alerta operacional", "notify")] },
      { id: "LOG-005", name: "Estoque não encontrado no picking", active: true,
        trigger: "Sistema indicava estoque, mas operador não encontrou o item.",
        conditions: [{ natural: "O item não foi encontrado no estoque físico durante a separação.", technical: "picking.itemNotFound == true" }],
        tasks: [task("Buscar outro fulfillment point ou seller", "reallocate"), task("Substituir item", "reallocate"), task("Cancelar item afetado", "cancel"), task("Escalar para o time logístico", "escalate")] },
      { id: "EDGE-005", name: "Produto danificado antes do despacho", active: true,
        trigger: "Item é danificado no CD durante picking/packing.",
        conditions: [{ natural: "O item foi danificado antes do despacho.", technical: "item.damagedBeforeDispatch == true" }],
        tasks: [task("Substituir item", "reallocate"), task("Reatribuir estoque", "reallocate"), task("Cancelar item afetado", "cancel"), task("Notificar cliente", "notify")] },
    ]},
    { id: "pol-returns", category: "returns", name: "Devoluções & Reembolsos", rules: [
      { id: "DEV-001", name: "Solicitação de devolução simples", active: true,
        trigger: "Cliente solicita devolução dentro da política.",
        conditions: [{ natural: "O cliente solicitou uma devolução.", technical: "return.requested == true" }, { natural: "A solicitação está dentro da política de devolução da loja.", technical: "return.withinPolicy == true" }],
        tasks: [task("Validar elegibilidade", "diagnose"), task("Aprovar devolução", "workflow"), task("Enviar instruções ao cliente", "notify"), task("Criar task de recebimento", "workflow")] },
      { id: "DEV-002", name: "Devolução fora da política", active: true,
        trigger: "Solicitação fora do prazo ou item não elegível.",
        conditions: [{ natural: "A solicitação está fora da política de devolução da loja.", technical: "return.withinPolicy == false" }],
        tasks: [task("Rejeitar com explicação", "cancel"), task("Escalar exceção comercial", "escalate")] },
      { id: "DEV-005", name: "Reembolso atrasado", active: true,
        trigger: "Devolução aprovada, mas reembolso não foi concluído no SLA.",
        conditions: [{ natural: "A devolução já foi aprovada.", technical: "return.approved == true" }, { natural: "O tempo decorrido do reembolso já passou do prazo combinado.", technical: "refund.elapsedHours > refund.slaHours" }],
        tasks: [task("Validar evidências do reembolso", "diagnose"), task("Reprocessar reembolso", "refund"), task("Escalar para o PSP", "escalate"), task("Oferecer voucher", "refund")] },
    ]},
    { id: "pol-reverse-logistics", category: "returns", name: "Recebimento Reverso & Troca", rules: [
      { id: "DEV-003", name: "Produto devolvido chegou ao CD", active: true,
        trigger: "Item retornou fisicamente ao fulfillment point/CD.",
        conditions: [{ natural: "O item devolvido chegou fisicamente ao centro de distribuição.", technical: "return.receivedAtFulfillmentPoint == true" }],
        tasks: [task("Registrar recebimento no CD", "workflow"), task("Abrir conferência do item", "workflow"), task("Atualizar timeline do pedido", "workflow")] },
      { id: "DEV-004", name: "Produto devolvido com divergência", active: true,
        trigger: "Item recebido não bate com o esperado ou veio danificado.",
        conditions: [{ natural: "O item recebido na conferência não bate com o que era esperado.", technical: "return.inspectionMismatch == true" }],
        tasks: [task("Registrar evidência", "workflow"), task("Sugerir reembolso parcial", "refund"), task("Escalar divergência", "escalate")] },
      { id: "DEV-007", name: "Troca por item alternativo", active: false,
        trigger: "Cliente prefere trocar item em vez de receber reembolso.",
        conditions: [{ natural: "O cliente preferiu trocar o item em vez de receber reembolso.", technical: 'return.preference == "exchange"' }],
        tasks: [task("Validar estoque do item de troca", "diagnose"), task("Reservar novo item", "reallocate"), task("Gerar workflow de troca", "workflow"), task("Ajustar pagamento da diferença", "refund")] },
    ]},
  ];

  return { AVATARS, AGENT_AVATARS, conversations, kpis, overviewSummary, workflowStages, tasks, myTasks, resources, workflows, wfCategories, aiTeam, orders, libraryWfs, stageSuggestions, taskSuggestions, initiatives, opsHome, opsHomeQueue, TASK_STATUSES, policyActionKinds, policyCategories, workflowPolicies };
})();

/* ── AppData alias — keeps sidebar.jsx and app.jsx working without changes ── */
window.AppData = { AVATARS: window.AIWData.AVATARS, conversations: window.AIWData.conversations };
