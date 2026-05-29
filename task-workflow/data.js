// ══════════════════════════════════════════
// DATA
// ══════════════════════════════════════════

const STATUS_CFG = {
  'not-processed':{ label:'Não processado', cls:'badge-not-processed', icon:'⏳' },
  'processing':   { label:'Em processamento', cls:'badge-processing', icon:'🔄' },
  'processed':    { label:'Processado', cls:'badge-processed', icon:'✅' },
  'canceled':     { label:'Cancelado', cls:'badge-canceled', icon:'❌' },
};

const ORDERS = [
  { id:'1631888948228-01', short:'68948228', date:'13/05/2026 - 16:48', client:'Paulo Bernardo', items:3, total:'R$ 502,00', origin:'Marketplace', orderStatus:'processing', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'pending'},{n:'Embalagem',s:'pending'},{n:'Entregue',s:'pending'}] },
  { id:'1631858947234-01', short:'68947234', date:'13/05/2026 - 13:33', client:'Ana Carvalho', items:2, total:'R$ 1.230,00', origin:'Marketplace', orderStatus:'processed', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Entregue',s:'completed'}] },
  { id:'1631848947052-01', short:'68947052', date:'13/05/2026 - 12:56', client:'Carlos Mendes', items:1, total:'R$ 89,90', origin:'Loja própria', orderStatus:'processed', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Entregue',s:'completed'}] },
  { id:'1631848946980-01', short:'68946980', date:'13/05/2026 - 12:43', client:'Fernanda Lima', items:4, total:'R$ 345,00', origin:'Marketplace', orderStatus:'not-processed', tasks:[
    {n:'Autorização de Pagamento',s:'pending'},{n:'Captura de Pagamento',s:'pending'},{n:'Separação',s:'pending'},{n:'Conferência',s:'pending'},{n:'Embalagem',s:'pending'},{n:'Entregue',s:'pending'}] },

  { id:'1631828946500-01', short:'68946500', date:'13/05/2026 - 11:30', client:'Mariana Costa', items:5, total:'R$ 890,00', origin:'Marketplace', orderStatus:'processing', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'pending'},{n:'Embalagem',s:'pending'},{n:'Entregue',s:'pending'}] },
  { id:'1631818946200-01', short:'68946200', date:'13/05/2026 - 10:55', client:'Diego Ferreira', items:2, total:'R$ 155,00', origin:'Loja própria', orderStatus:'processed', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Entregue',s:'completed'}] },
  { id:'1631900949000-01', short:'68949000', date:'25/05/2026 - 09:14', client:'Luiza Torres', items:2, total:'R$ 380,00', origin:'Loja própria', orderStatus:'processing', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Entregue',s:'pending'}] },
  { id:'1631910950000-01', short:'68950000', date:'26/05/2026 - 14:30', client:'João Eduardo', items:3, total:'R$ 890,00', origin:'Loja própria', orderStatus:'processing', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Entregue',s:'pending'}] },
  { id:'1631808945900-01', short:'68945900', date:'13/05/2026 - 10:12', client:'Juliana Santos', items:3, total:'R$ 220,00', origin:'Marketplace', orderStatus:'canceled', tasks:[] },
  { id:'1631920951000-01', short:'68951000', date:'26/05/2026 - 16:45', client:'Geraldo Thomaz', items:4, total:'R$ 1.139,00', origin:'Marketplace', orderStatus:'processing', tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'completed'},{n:'Embalagem',s:'pending'},{n:'Expedição',s:'pending'},{n:'Entregue',s:'pending'}] },
];

// Per-order item details
const ORDER_ITEMS = {
  // ─── REFERÊNCIA ─────────────────────────────────────────────────────────────
  // Padrão: 4 pipelines por item (wf-payments / wf-standard / wf-nfe / wf-delivery)
  // Status em cadeia: se uma task é pending, as seguintes também são pending

  // ─── Paulo Bernardo — 3 itens — processing (pagamento ok, preparação início) ──
  '1631888948228-01': [
    { name:'Tênis Nike Air Max 42', emoji:'👟', qty:3, price:'R$ 320,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Camiseta Under Armour M', emoji:'👕', qty:1, price:'R$ 99,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Bermuda Oakley Camo G', emoji:'🩳', qty:1, price:'R$ 83,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],

  // ─── Ana Carvalho — 2 itens — processed (entregue) — com Troca e Devolução ──
  '1631858947234-01': [
    { name:'Jaqueta Calvin Klein G', emoji:'🧥', qty:1, price:'R$ 790,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Transp. XYZ', s:'completed'},
          {name:'Despachado', sup:'Transp. XYZ', s:'completed'},
          {name:'Entregue', sup:'Transp. XYZ', s:'completed'}
        ]}
      ],
      secondWorkflow:{
        wfId:'wf-returns', wfName:'Troca e Devolução', triggeredAt:'14/05/2026 10:23',
        triggeredBy:'Shopper',
        tasks:[
          {name:'Solicitação Recebida',sup:'Atendimento',s:'completed'},
          {name:'Análise do Motivo',sup:'QA Team',s:'completed'},
          {name:'Coleta do Item',sup:'Transp. XYZ',s:'pending'},
          {name:'Inspeção de Qualidade',sup:'QA Team',s:'pending'},
          {name:'Reembolso / Troca',sup:'Financeiro',s:'pending'}]
      },
      returnInfo:{
        initiator:'shopper', initiatedAt:'14/05/2026 10:23',
        reason:'defeito_produto', reasonLabel:'Defeito no produto',
        description:'Costura com defeito na manga direita após a primeira utilização. Solicito troca por outro exemplar no mesmo tamanho (G) e cor (preto).',
        agentDiagnosis:{
          confidence:87,
          insights:[
            {icon:'🔁', label:'Padrão de devolução detectado', desc:'Este produto (SKU JCK-BLK-G) foi devolvido por 14 outros clientes nos últimos 30 dias. Em 71% dos casos o defeito é na costura da manga.'},
            {icon:'⚠️', label:'Risco de chargeback elevado', desc:'NPS 2/10 combinado com 3 ocorrências anteriores neste cliente eleva o risco de disputa para 87%.'},
            {icon:'💡', label:'Ação recomendada', desc:'Aprovar troca imediatamente via fluxo expresso. Substituição proativa reduz probabilidade de disputa em 64%.'}
          ]
        }
      }
    },
    { name:'Cinto Couro Marrom', emoji:'👔', qty:1, price:'R$ 440,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Transp. XYZ', s:'completed'},
          {name:'Despachado', sup:'Transp. XYZ', s:'completed'},
          {name:'Entregue', sup:'Transp. XYZ', s:'completed'}
        ]}
      ]
    },
  ],
  '1631900949000-01': [
    { name:'Mouse Logitech MX Master 3', emoji:'🖱️', qty:1, price:'R$ 190,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Teclado Mecânico Keychron K2', emoji:'⌨️', qty:1, price:'R$ 190,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],
  '1631910950000-01': [
    {
      name:'Camiseta BRK com nome "João Eduardo"', emoji:'👕', qty:1, price:'R$ 240,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-personalization', wfName:'Personalização de Produtos',
          triggeredAt:'26/05/2026 14:45', triggeredBy:'Agente AI',
          tasks:[
            {name:'Briefing do Cliente', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Briefing recebido e registrado', s:'completed', failAction:'Solicitar novamente ao cliente'},
                {id:'cp2', label:'Arquivo de arte ou instruções anexados', s:'completed', failAction:'Aguardar envio do cliente'},
              ]},
            {name:'Arte / Design', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Mockup criado pelo designer', s:'completed', failAction:'Reatribuir a outro designer BRK'},
                {id:'cp2', label:'Mockup enviado ao cliente para aprovação', s:'completed', failAction:'Reenviar por outro canal'},
              ]},
            {name:'Aprovação do Cliente', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Arte aprovada pelo cliente', s:'completed', failAction:'Reenviar arte corrigida'},
                {id:'cp2', label:'Confirmação registrada no sistema', s:'completed', failAction:'Solicitar confirmação'},
              ]},
            {name:'Produção', sup:'BRK', s:'completed'},
            {name:'Controle de Qualidade', sup:'QA Team', s:'completed'},
            {name:'Conclusão da Personalização', sup:'BRK', s:'completed'},
          ]
        },
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    {
      name:'Piso Vinílico 100m²', emoji:'🪵', qty:1, price:'R$ 450,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    {
      name:'Tapete Sala 2x3m', emoji:'🏠', qty:1, price:'R$ 200,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
  ],
  '1631920951000-01': [
    // ── Grupo 1: CD São Paulo · Jadlog ──
    { name:'Camiseta Polo Ralph Lauren G', emoji:'👕', qty:1, price:'R$ 320,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:"Calça Jeans Levi's 32x34", emoji:'👖', qty:1, price:'R$ 280,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:'Tênis Asics Gel-Nimbus 26 T42', emoji:'👟', qty:1, price:'R$ 450,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    // ── Grupo 2: Shopping Botafogo RJ · BOPIS ──
    { name:'Boné New Era NY 7 3/8', emoji:'🧢', qty:1, price:'R$ 89,00', seller:'Shopping Botafogo RJ',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Shopping Botafogo RJ', s:'completed'},
          {name:'Conferência de Qualidade', sup:'Shopping Botafogo RJ', s:'completed'},
          {name:'Notificação ao Cliente', sup:'Shopping Botafogo RJ', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Disponível na Loja', sup:'Shopping Botafogo RJ', s:'pending'},
          {name:'Retirada Confirmada', sup:'Shopping Botafogo RJ', s:'pending'}
        ]}
      ]
    },
  ],

  // ─── Carlos Mendes — 1 item — processed ───────────────────────────────────
  '1631848947052-01': [
    { name:'Tênis Adidas Ultraboost 42', emoji:'👟', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'completed'},
          {name:'Despachado', sup:'Correios', s:'completed'},
          {name:'Entregue', sup:'Correios', s:'completed'}
        ]}
      ]
    }
  ],

  // ─── Fernanda Lima — 4 itens — not-processed ──────────────────────────────
  '1631848946980-01': [
    { name:'Vestido Floral Midi P', emoji:'👗', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Sandália Arezzo Nº36', emoji:'👡', qty:1, price:'R$ 79,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Bolsa Tiracolo Couro', emoji:'👜', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Óculos de Sol Cat Eye', emoji:'🕶️', qty:1, price:'R$ 85,30',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],

  // ─── Mariana Costa — 5 itens — processing ─────────────────────────────────
  '1631828946500-01': [
    // ── Grupo 1: CD São Paulo · Jadlog ──
    { name:'Tênis Puma Suede 38', emoji:'👟', qty:1, price:'R$ 220,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:'Camiseta Nike Dri-FIT M', emoji:'👕', qty:1, price:'R$ 130,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:'Shorts Adidas M', emoji:'🩳', qty:1, price:'R$ 120,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending'},
          {name:'Despachado', sup:'Jadlog', s:'pending'},
          {name:'Entregue', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    // ── Grupo 2: CD Campinas · Correios ──
    { name:'Boné Oakley', emoji:'🧢', qty:1, price:'R$ 160,00', seller:'CD Campinas',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD Campinas', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD Campinas', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Meias Pack 3 pares', emoji:'🧦', qty:1, price:'R$ 260,00', seller:'CD Campinas',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD Campinas', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD Campinas', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending'},
          {name:'Despachado', sup:'Correios', s:'pending'},
          {name:'Entregue', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],

  // ─── Diego Ferreira — 2 itens — processed ─────────────────────────────────
  '1631818946200-01': [
    { name:'Camisa Social Aramis Slim M', emoji:'👔', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'completed'},
          {name:'Despachado', sup:'Correios', s:'completed'},
          {name:'Entregue', sup:'Correios', s:'completed'}
        ]}
      ]
    },
    { name:'Calça Chino Khaki 40', emoji:'👖', qty:1, price:'R$ 65,10',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed'},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'completed'},
          {name:'Despachado', sup:'Correios', s:'completed'},
          {name:'Entregue', sup:'Correios', s:'completed'}
        ]}
      ]
    }
  ],

  // ─── Juliana Santos — 3 itens — canceled ──────────────────────────────────
  '1631808945900-01': [
    { name:'Vestido Floral Zara P', emoji:'👗', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'blocked',
            blockReason:'Pedido de cancelamento recebido pelo cliente',
            blockSource:'Sistema de Cancelamentos',
            suggestion:'Confirmar cancelamento e processar estorno do pagamento'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'canceled'},
          {name:'Embalagem', sup:'CD São Paulo', s:'canceled'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'canceled'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'canceled'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'canceled'},
          {name:'Despachado', sup:'Correios', s:'canceled'},
          {name:'Entregue', sup:'Correios', s:'canceled'}
        ]}
      ]
    },
    { name:'Sandália Arezzo Nº 36', emoji:'👡', qty:1, price:'R$ 79,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'blocked',
            blockReason:'Pedido de cancelamento recebido pelo cliente',
            blockSource:'Sistema de Cancelamentos',
            suggestion:'Confirmar cancelamento e processar estorno do pagamento'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'canceled'},
          {name:'Embalagem', sup:'CD São Paulo', s:'canceled'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'canceled'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'canceled'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'canceled'},
          {name:'Despachado', sup:'Correios', s:'canceled'},
          {name:'Entregue', sup:'Correios', s:'canceled'}
        ]}
      ]
    },
    { name:'Bolsa Tiracolo Couro Preto', emoji:'👜', qty:1, price:'R$ 50,20',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'blocked',
            blockReason:'Pedido de cancelamento recebido pelo cliente',
            blockSource:'Sistema de Cancelamentos',
            suggestion:'Confirmar cancelamento e processar estorno do pagamento'},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'canceled'},
          {name:'Embalagem', sup:'CD São Paulo', s:'canceled'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'canceled'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'canceled'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'canceled'},
          {name:'Despachado', sup:'Correios', s:'canceled'},
          {name:'Entregue', sup:'Correios', s:'canceled'}
        ]}
      ]
    }
  ],
};

const WORKFLOW_DEFS = [
  {
    id:'wf-payments', name:'Pagamentos', icon:'💳', color:'#059669', orderCount:4256, category:'payment',
    description:'Fluxo de autorização e captura de pagamento', dependencies:[],
    trigger:{ type:'order-created', label:'Acionado automaticamente no início do pedido' },
    tasks:[
      {id:'pmt1', name:'Autorização de Pagamento', color:'#059669', tasks:[
        {id:'pmt1_0', name:'Autorização de Pagamento', supplier:'Gateway Pagamento', category:'Todos', active:true, visibility:'internal', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[],
          checkpoints:[
            {id:'cp1', label:'Envio da requisição ao gateway', failAction:'Retentar em 5min'},
            {id:'cp2', label:'Recebimento da autorização', failAction:'Escalar para análise manual'},
            {id:'cp3', label:'Registro do ID de autorização', failAction:'Verificar logs do gateway'},
          ]}
      ]},
      {id:'pmt2', name:'Captura de Pagamento', color:'#0891b2', tasks:[
        {id:'pmt2_0', name:'Captura de Pagamento', supplier:'Gateway Pagamento', category:'Todos', active:true, visibility:'internal', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
    ],
    edges:[{id:'epmt',from:'pmt1',to:'pmt2',active:true}],
  },
  {
    id:'wf-standard', name:'Entrega pela loja', icon:'📦', color:'#0c6fcd', orderCount:4256, category:'fulfillment',
    description:'Fluxo operacional para pedidos de entrega convencional', dependencies:[],
    trigger:{ type:'workflow-complete', workflowId:'wf-payments', label:'Após conclusão do workflow de Pagamentos' },
    tasks:[
      {id:'t1', name:'Separação de Itens', color:'#0c6fcd', tasks:[
        {id:'t1_0', name:'Separação de Itens', supplier:'CD São Paulo', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:['validarEstoque.disponivel','validarEstoque.qtd_reservada','validarEstoque.ok'],
          checkpoints:[
            {id:'cp1', label:'Reserva de estoque confirmada', failAction:'Realocar para outro CD'},
            {id:'cp2', label:'Itens fisicamente separados', failAction:'Acionar gestor de operações'},
            {id:'cp3', label:'Etiqueta impressa', failAction:'Reimprimir etiqueta'},
          ]}
      ]},
      {id:'t2', name:'Conferência de Qualidade', color:'#7c3aed', tasks:[
        {id:'t2_0', name:'Conferência de Qualidade', supplier:'QA Team', category:'Eletrônicos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
      {id:'t3', name:'Embalagem', color:'#0891b2', tasks:[
        {id:'t3_0', name:'Embalagem', supplier:'CD São Paulo', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
      {id:'t4', name:'Nota Fiscal', color:'#059669', tasks:[
        {id:'t4_0', name:'Nota Fiscal', supplier:'Financeiro', category:'Todos', active:true, visibility:'internal',
          script:null, externalApi:{url:'https://api.nfe.io/v1/nota', method:'POST', responseMapping:[{key:'nf_numero',path:'data.number'},{key:'nf_chave',path:'data.accessKey'}]},
          mcpConfig:null, agentConfig:null, contextOutput:['api_nfe.nf_numero','api_nfe.nf_chave'], checkpoints:[]}
      ]},
      {id:'t5', name:'Expedição', color:'#d97706', tasks:[
        {id:'t5_0', name:'Expedição', supplier:'Transportadora XYZ', category:'Todos', active:true, visibility:'user',
          script:null, externalApi:{url:'https://api.transportadora.com/cotacao', method:'POST', responseMapping:[{key:'prazo_entrega',path:'result.delivery_days'},{key:'custo_frete',path:'result.cost'}]},
          mcpConfig:null, agentConfig:null, contextOutput:['api_cotacao.prazo_entrega','api_cotacao.custo_frete'],
          checkpoints:[
            {id:'cp1', label:'Coleta agendada com transportadora', failAction:'Tentar outra transportadora'},
            {id:'cp2', label:'Código de rastreio gerado', failAction:'Solicitar código manual via Intelipost'},
            {id:'cp3', label:'Pacote entregue à transportadora', failAction:'Acionar supervisor logístico'},
          ]}
      ]},
      {id:'t6', name:'Entregue', color:'#059669', tasks:[
        {id:'t6_0', name:'Entregue', supplier:'Transportadora XYZ', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
    ],
    edges:[
      {id:'e1',from:'t1',to:'t2',active:true},{id:'e2',from:'t2',to:'t3',active:true},
      {id:'e3',from:'t3',to:'t4',active:true},{id:'e4',from:'t4',to:'t5',active:true},
      {id:'e5',from:'t5',to:'t6',active:true},
    ],
  },
  {
    id:'wf-returns', name:'Troca e Devolução', icon:'↩️', color:'#7c3aed', orderCount:83, category:'complementary',
    description:'Fluxo para pedidos de devolução e troca de produtos', dependencies:['wf-standard'],
    trigger:{ type:'workflow-complete', workflowId:'wf-standard', label:'Após conclusão do workflow Entrega pela loja (ou acionado pelo Shopper/Agente)' },
    tasks:[
      {id:'r1', name:'Solicitação Recebida', color:'#7c3aed', tasks:[
        {id:'r1_0', name:'Solicitação Recebida', supplier:'Atendimento', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
      {id:'r2', name:'Análise do Motivo', color:'#6366f1', tasks:[
        {id:'r2_0', name:'Análise do Motivo', supplier:'QA Team', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
      {id:'r3', name:'Coleta do Item', color:'#0891b2', tasks:[
        {id:'r3_0', name:'Coleta do Item', supplier:'Transportadora XYZ', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
      {id:'r4', name:'Inspeção de Qualidade', color:'#059669', tasks:[
        {id:'r4_0', name:'Inspeção de Qualidade', supplier:'QA Team', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
      {id:'r5', name:'Reembolso / Troca', color:'#d97706', tasks:[
        {id:'r5_0', name:'Reembolso / Troca', supplier:'Financeiro', category:'Todos', active:true, visibility:'user', script:null, externalApi:null, mcpConfig:null, agentConfig:null, contextOutput:[], checkpoints:[]}
      ]},
    ],
    edges:[
      {id:'re1',from:'r1',to:'r2',active:true},{id:'re2',from:'r2',to:'r3',active:true},
      {id:'re3',from:'r3',to:'r4',active:true},{id:'re4',from:'r4',to:'r5',active:true},
    ],
  },
];
