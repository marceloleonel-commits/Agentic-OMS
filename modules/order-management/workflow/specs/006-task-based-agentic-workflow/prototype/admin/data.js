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
  { id:'1632000952000-01', short:'68952000', date:'28/05/2026 - 10:05', client:'John Crimber', items:3, total:'R$ 2.930,00', origin:'Loja própria', orderStatus:'processing', tags:['kit','service'], tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Conferência',s:'pending'},{n:'Disponível na Loja',s:'pending'},{n:'Retirada Confirmada',s:'pending'},{n:'Serviço Agendado',s:'pending'},{n:'Instalação Concluída',s:'pending'}] },
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

  // ─── John Crimber — Kit BOPIS + Kit Produto+Serviço ──────────────────────
  '1632000952000-01': [

    // ─── Kit 1: Piso Vinílico Clicado — retirada na loja ─────────────────
    { name:'Piso Vinílico Clicado 3mm Madeira Natural (cx 3,24m²)', emoji:'🪵', qty:62, price:'R$ 1.984,80',
      kitGroupId:'kit-piso', kitGroupName:'Kit Piso Vinílico — Retirada na Loja',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Conferência de Qualidade', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Notificação ao Cliente', sup:'Loja Rua Augusta SP', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Disponível na Loja', sup:'Loja Rua Augusta SP', s:'pending'},
          {name:'Retirada Confirmada', sup:'Loja Rua Augusta SP', s:'pending'}
        ]}
      ]
    },
    { name:'Rodapé PVC 7cm Branco (barra 2,4m)', emoji:'📏', qty:35, price:'R$ 455,00',
      kitGroupId:'kit-piso', kitGroupName:'Kit Piso Vinílico — Retirada na Loja',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Conferência de Qualidade', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Notificação ao Cliente', sup:'Loja Rua Augusta SP', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Disponível na Loja', sup:'Loja Rua Augusta SP', s:'pending'},
          {name:'Retirada Confirmada', sup:'Loja Rua Augusta SP', s:'pending'}
        ]}
      ]
    },

    // ─── Kit 2: Serviço de Instalação ─────────────────────────────────────
    { name:'Serviço de Instalação de Piso Vinílico (200m²)', emoji:'🔧', qty:1, price:'R$ 490,00',
      isService: true,
      kitGroupId:'kit-instalacao', kitGroupName:'Kit Instalação — Produto + Serviço',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed'},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-services', wfName:'Agendamento de Serviço', tasks:[
          {name:'Agendamento com Técnico', sup:'Equipe de Instalação', s:'pending'},
          {name:'Confirmação do Cliente', sup:'Atendimento', s:'pending'},
          {name:'Lembrete D-1', sup:'Sistema Notificações', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal (Serviço)', sup:'Financeiro', s:'pending'},
          {name:'Atualizar Status', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Serviço Executado', tasks:[
          {name:'Técnico no Local', sup:'Equipe de Instalação', s:'pending'},
          {name:'Instalação Concluída', sup:'Equipe de Instalação', s:'pending'},
          {name:'Aceite do Cliente', sup:'Atendimento', s:'pending'}
        ]}
      ]
    },
  ],
};

const WORKFLOW_DEFS = [
  // ── 1. Entrega em domicílio ──────────────────────────────────
  {
    id: 'oj-home', name: 'Entrega em domicílio', icon: '🚚', color: '#0c6fcd',
    orderCount: 4256, archived: false,
    description: 'Itens despachados por transportadora ao endereço do cliente',
    edges: [
      { id: 'e1', from: 'wf-payments', to: 'wf-standard', active: true },
      { id: 'e2', from: 'wf-standard', to: 'wf-nfe', active: true },
      { id: 'e3', from: 'wf-nfe', to: 'wf-delivery', active: true },
    ],
    marcos: [
      {
        id: 'wf-payments', name: 'Confirmação de Pagamento', icon: '💳', color: '#059669',
        tasks: [
          { id: 'h-pmt1', name: 'Autorização de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Envio da requisição ao gateway', failAction: 'Retentar em 5min' },
            { id: 'cp2', label: 'Recebimento da autorização', failAction: 'Escalar para análise manual' },
          ]},
          { id: 'h-pmt2', name: 'Captura de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparando Itens', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'h-sep1', name: 'Separação de Itens', supplier: 'CD São Paulo', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Reserva de estoque confirmada', failAction: 'Realocar para outro CD' },
            { id: 'cp2', label: 'Itens fisicamente separados', failAction: 'Acionar gestor de operações' },
            { id: 'cp3', label: 'Etiqueta impressa', failAction: 'Reimprimir etiqueta' },
          ]},
          { id: 'h-conf1', name: 'Conferência de Qualidade', supplier: 'QA Team', category: 'Eletrônicos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'h-emb1', name: 'Embalagem', supplier: 'CD São Paulo', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-nfe', name: 'NFes Emitidas', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'h-nfe1', name: 'Gerar Nota Fiscal', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: { url: 'https://api.nfe.io/v1/nota', method: 'POST', responseMapping: [{ key: 'nf_numero', path: 'data.number' }, { key: 'nf_chave', path: 'data.accessKey' }] }, mcpConfig: null, agentConfig: null, contextOutput: ['api_nfe.nf_numero', 'api_nfe.nf_chave'], checkpoints: [
            { id: 'cp1', label: 'Dados fiscais validados', failAction: 'Corrigir dados do pedido' },
            { id: 'cp2', label: 'NF-e autorizada pela SEFAZ', failAction: 'Reenviar ou acionar fiscal' },
          ]},
          { id: 'h-nfe2', name: 'Atualizar Marketplace', supplier: 'VTEX', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Recebido pelo Cliente', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'h-del1', name: 'Código de Rastreio', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Código de rastreio gerado', failAction: 'Solicitar código via Intelipost' },
            { id: 'cp2', label: 'Código enviado ao cliente', failAction: 'Reenviar notificação' },
          ]},
          { id: 'h-del2', name: 'Despachado', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'h-del3', name: 'Entregue', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },

  // ── 2. Retirada na loja (BOPIS) ──────────────────────────────
  {
    id: 'oj-bopis', name: 'Retirada na loja', icon: '🏪', color: '#7c3aed',
    orderCount: 312, archived: false,
    description: 'Itens separados na loja para retirada pelo cliente (BOPIS)',
    edges: [
      { id: 'e1', from: 'wf-payments', to: 'wf-standard', active: true },
      { id: 'e2', from: 'wf-standard', to: 'wf-nfe', active: true },
      { id: 'e3', from: 'wf-nfe', to: 'wf-delivery', active: true },
    ],
    marcos: [
      {
        id: 'wf-payments', name: 'Confirmação de Pagamento', icon: '💳', color: '#059669',
        tasks: [
          { id: 'b-pmt1', name: 'Autorização de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Envio da requisição ao gateway', failAction: 'Retentar em 5min' },
            { id: 'cp2', label: 'Recebimento da autorização', failAction: 'Escalar para análise manual' },
          ]},
          { id: 'b-pmt2', name: 'Captura de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparando Itens', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'b-sep1', name: 'Separação de Itens', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Itens localizados no estoque da loja', failAction: 'Verificar outro ponto de venda' },
            { id: 'cp2', label: 'Itens fisicamente separados', failAction: 'Acionar gerente da loja' },
          ]},
          { id: 'b-conf1', name: 'Conferência de Qualidade', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'b-notif1', name: 'Notificação ao Cliente', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'SMS/E-mail de disponibilidade enviado', failAction: 'Reenviar notificação' },
          ]},
        ]
      },
      {
        id: 'wf-nfe', name: 'NFes Emitidas', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'b-nfe1', name: 'Gerar Nota Fiscal', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Dados fiscais validados', failAction: 'Corrigir dados do pedido' },
            { id: 'cp2', label: 'NF-e autorizada pela SEFAZ', failAction: 'Acionar fiscal' },
          ]},
          { id: 'b-nfe2', name: 'Atualizar Marketplace', supplier: 'VTEX', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Recebido pelo Cliente', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'b-avail1', name: 'Disponível na Loja', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Item posicionado no balcão de retiradas', failAction: 'Reposicionar item' },
          ]},
          { id: 'b-pickup1', name: 'Retirada Confirmada', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Identidade do cliente verificada', failAction: 'Solicitar documento' },
            { id: 'cp2', label: 'Assinatura de retirada registrada', failAction: 'Registrar manualmente' },
          ]},
        ]
      },
    ]
  },

  // ── 3. Entrega digital ───────────────────────────────────────
  {
    id: 'oj-digital', name: 'Entrega digital', icon: '💻', color: '#0891b2',
    orderCount: 128, archived: false,
    description: 'Produtos digitais entregues por e-mail, link de download ou código de ativação',
    edges: [
      { id: 'e1', from: 'wf-payments', to: 'wf-standard', active: true },
      { id: 'e2', from: 'wf-standard', to: 'wf-nfe', active: true },
      { id: 'e3', from: 'wf-nfe', to: 'wf-delivery', active: true },
    ],
    marcos: [
      {
        id: 'wf-payments', name: 'Confirmação de Pagamento', icon: '💳', color: '#059669',
        tasks: [
          { id: 'd-pmt1', name: 'Autorização de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Envio da requisição ao gateway', failAction: 'Retentar em 5min' },
            { id: 'cp2', label: 'Recebimento da autorização', failAction: 'Escalar para análise manual' },
          ]},
          { id: 'd-pmt2', name: 'Captura de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparando Itens', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'd-gen1', name: 'Geração do Produto Digital', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Licença ou código de ativação gerado', failAction: 'Reprocessar geração' },
            { id: 'cp2', label: 'Produto vinculado ao pedido', failAction: 'Verificar integração' },
          ]},
          { id: 'd-val1', name: 'Validação de Licença', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Licença única e não duplicada', failAction: 'Gerar nova licença' },
          ]},
          { id: 'd-send1', name: 'Envio por E-mail', supplier: 'CRM', category: 'Digital', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'E-mail entregue sem bounce', failAction: 'Tentar canal alternativo (SMS/WhatsApp)' },
          ]},
        ]
      },
      {
        id: 'wf-nfe', name: 'NFes Emitidas', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'd-nfe1', name: 'Gerar Nota Fiscal', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'NF-e de serviço emitida', failAction: 'Acionar fiscal' },
          ]},
          { id: 'd-nfe2', name: 'Atualizar Marketplace', supplier: 'VTEX', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Recebido pelo Cliente', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'd-conf1', name: 'Confirmação de Entrega', supplier: 'CRM', category: 'Digital', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Cliente abriu o e-mail de entrega', failAction: 'Reenviar após 24h' },
          ]},
          { id: 'd-acc1', name: 'Acesso Verificado', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Primeiro acesso ou ativação registrado', failAction: 'Acionar suporte ao cliente' },
          ]},
        ]
      },
    ]
  },

  // ── 5. Troca e Devolução (condicional) ───────────────────────
  {
    id: 'wf-returns', name: 'Troca e Devolução', icon: '↩️', color: '#7c3aed',
    orderCount: 83, archived: false,
    description: 'Fluxo para pedidos de devolução e troca — acionado condicionalmente pelo agente ou shopper',
    edges: [
      { id: 're1', from: 'r-solicit', to: 'r-coleta', active: true },
      { id: 're2', from: 'r-coleta', to: 'r-insp', active: true },
      { id: 're3', from: 'r-insp', to: 'r-resolv', active: true },
    ],
    marcos: [
      {
        id: 'r-solicit', name: 'Solicitação', icon: '📝', color: '#7c3aed',
        tasks: [
          { id: 'r1_0', name: 'Solicitação Recebida', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'r1_1', name: 'Análise do Motivo', supplier: 'QA Team', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'r-coleta', name: 'Coleta', icon: '🔄', color: '#0891b2',
        tasks: [
          { id: 'r2_0', name: 'Agendamento de Coleta', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'r2_1', name: 'Coleta do Item', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'r-insp', name: 'Inspeção', icon: '🔍', color: '#6366f1',
        tasks: [
          { id: 'r3_0', name: 'Recebimento no CD', supplier: 'CD São Paulo', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'r3_1', name: 'Inspeção de Qualidade', supplier: 'QA Team', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'r-resolv', name: 'Resolução', icon: '✅', color: '#059669',
        tasks: [
          { id: 'r4_0', name: 'Reembolso / Troca', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },

  // ── 4. Agenda Serviço Instalação ─────────────────────────────────────────
  {
    id: 'oj-agenda-servico', name: 'Agenda Serviço Instalação', icon: '📅', color: '#0891b2',
    orderCount: 0, archived: false,
    description: 'Fluxo de agendamento para serviços de instalação — confirmação com técnico e notificação ao cliente',
    edges: [
      { id: 'as-e1', from: 'as-agendamento', to: 'as-confirmacao', active: true },
      { id: 'as-e2', from: 'as-confirmacao', to: 'as-lembrete', active: true },
    ],
    marcos: [
      {
        id: 'as-agendamento', name: 'Agendamento', icon: '🗓️', color: '#0891b2',
        tasks: [
          { id: 'as1_0', name: 'Agendamento com Técnico', supplier: 'Equipe de Instalação', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'as-confirmacao', name: 'Confirmação', icon: '✅', color: '#059669',
        tasks: [
          { id: 'as2_0', name: 'Confirmação do Cliente', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'as-lembrete', name: 'Lembrete', icon: '🔔', color: '#d97706',
        tasks: [
          { id: 'as3_0', name: 'Lembrete D-1', supplier: 'Sistema Notificações', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },

  // ── 5. Serviço Instalação Executada ──────────────────────────────────────
  {
    id: 'oj-servico-executado', name: 'Serviço Instalação Executada', icon: '🔧', color: '#7c3aed',
    orderCount: 0, archived: false,
    description: 'Fluxo de execução do serviço de instalação em campo — técnico no local até aceite final do cliente',
    edges: [
      { id: 'se-e1', from: 'se-execucao', to: 'se-conclusao', active: true },
      { id: 'se-e2', from: 'se-conclusao', to: 'se-aceite', active: true },
    ],
    marcos: [
      {
        id: 'se-execucao', name: 'Execução', icon: '🔨', color: '#7c3aed',
        tasks: [
          { id: 'se1_0', name: 'Técnico no Local', supplier: 'Equipe de Instalação', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'se-conclusao', name: 'Conclusão', icon: '🏁', color: '#0891b2',
        tasks: [
          { id: 'se2_0', name: 'Instalação Concluída', supplier: 'Equipe de Instalação', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'se-aceite', name: 'Aceite', icon: '✅', color: '#059669',
        tasks: [
          { id: 'se3_0', name: 'Aceite do Cliente', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },
];

// ══════════════════════════════════════════
// EXTENSIBILITY — CONNECTORS & SKILLS
// ══════════════════════════════════════════

// Maps task IDs → connector slot
const TASK_SLOT_MAP = {
  'h-pmt1': 'payment_processor', 'h-pmt2': 'payment_processor',
  'h-nfe1': 'invoice_system',    'h-nfe2': 'invoice_system',
  'h-del1': 'carrier_x',        'h-del2': 'carrier_x',        'h-del3': 'carrier_x',
  'h-sep1': 'warehouse_x',
  'b-pmt1': 'payment_processor', 'b-pmt2': 'payment_processor',
  'b-nfe1': 'invoice_system',    'b-nfe2': 'invoice_system',
};

// Maps task IDs → specific connector function invoked by the agent for that task
const TASK_FUNCTION_MAP = {
  // oj-home — Confirmação de Pagamento
  'h-pmt1': { fn: 'payment.authorize', trigger: 'preflight', note: 'Agente verifica pré-condições antes de autorizar' },
  'h-pmt2': { fn: 'payment.capture',   trigger: 'mutate',    note: 'Agente captura o valor após autorização confirmada' },
  // oj-home — NFes Emitidas
  'h-nfe1': { fn: 'nfe.emit',          trigger: 'mutate',    note: 'Agente emite a NF-e assim que embalagem é confirmada' },
  'h-nfe2': { fn: null,                trigger: null,        note: 'Atualização interna VTEX — sem chamada externa' },
  // oj-home — Recebido pelo Cliente
  'h-del1': { fn: 'tracking.fetch',    trigger: 'read',      note: 'Agente consulta o código de rastreio gerado pela transportadora' },
  'h-del2': { fn: 'shipment.create',   trigger: 'mutate',    note: 'Agente confirma despacho e obtém número de protocolo' },
  'h-del3': { fn: 'watch.poll',        trigger: 'maintain',  note: 'Agente reconcilia webhook de entrega confirmada' },
  // oj-home — Preparando Itens (warehouse_x — não configurado ainda)
  'h-sep1': { fn: null,                trigger: null,        note: 'warehouse_x não configurado — agente aguarda confirmação manual' },
  // oj-bopis
  'b-pmt1': { fn: 'payment.authorize', trigger: 'preflight', note: 'Agente verifica pré-condições antes de autorizar' },
  'b-pmt2': { fn: 'payment.capture',   trigger: 'mutate',    note: 'Agente captura o valor após autorização confirmada' },
  'b-nfe1': { fn: 'nfe.emit',          trigger: 'mutate',    note: 'Agente emite a NF-e assim que item está disponível na loja' },
  'b-nfe2': { fn: null,                trigger: null,        note: 'Atualização interna VTEX — sem chamada externa' },
};

const CONNECTOR_CATALOG = [
  {
    id: 'conn-intelipost', system: 'intelipost', displayName: 'Intelipost', logo: '🚚',
    status: 'active',
    auth: { delegation: 'operator_supplied', fields: [
      { key: 'api_token', label: 'API Token', type: 'secret' },
      { key: 'endpoint',  label: 'Endpoint',  type: 'url', default: 'https://api.intelipost.com.br/api/v2' }
    ]},
    connections: { 'oms.OrderJob': {
      slot: 'carrier_x',
      purpose: 'Gerencia envios, rastreio e logística reversa via Intelipost',
      functions: [
        { name: 'tracking.fetch',  kind: 'read',   label: 'Consultar rastreio' },
        { name: 'shipment.create', kind: 'mutate', label: 'Criar pedido de envio' },
        { name: 'label.generate',  kind: 'read',   label: 'Gerar etiqueta' },
        { name: 'shipment.cancel', kind: 'cancel', label: 'Cancelar envio' },
      ],
      states: ['idle','shipment_created','posted','in_transit','delivered','failed'],
      initialState: 'idle', terminalStates: ['delivered','failed']
    }}
  },
  {
    id: 'conn-adyen', system: 'adyen', displayName: 'Adyen', logo: '💳',
    status: 'active',
    auth: { delegation: 'operator_supplied', fields: [
      { key: 'apiKey',           label: 'API Key',          type: 'secret' },
      { key: 'merchantAccount',  label: 'Merchant Account', type: 'text'   }
    ]},
    connections: { 'oms.OrderJob': {
      slot: 'payment_processor',
      purpose: 'Autoriza, captura e estorna pagamentos via Adyen Online Payments',
      functions: [
        { name: 'payment.authorize', kind: 'preflight', label: 'Autorizar pagamento' },
        { name: 'payment.capture',   kind: 'mutate',    label: 'Capturar pagamento' },
        { name: 'payment.cancel',    kind: 'cancel',    label: 'Estornar pagamento' },
        { name: 'watch.poll',        kind: 'maintain',  label: 'Reconciliar webhooks' },
      ],
      states: ['idle','authorized','settled','reversed','failed'],
      initialState: 'idle', terminalStates: ['settled','reversed','failed']
    }}
  },
  {
    id: 'conn-tiny-erp', system: 'tiny_erp', displayName: 'Tiny ERP', logo: '🧾',
    status: 'active',
    auth: { delegation: 'operator_supplied', fields: [
      { key: 'token', label: 'Token API', type: 'secret' }
    ]},
    connections: { 'oms.OrderJob': {
      slot: 'invoice_system',
      purpose: 'Emite NF-e e NFS-e via Tiny ERP integrado à SEFAZ',
      functions: [
        { name: 'nfe.emit',   kind: 'mutate',  label: 'Emitir NF-e' },
        { name: 'nfe.cancel', kind: 'cancel',  label: 'Cancelar NF-e' },
        { name: 'nfe.status', kind: 'read',    label: 'Consultar status SEFAZ' },
      ],
      states: ['idle','pending_sefaz','authorized','cancelled','rejected'],
      initialState: 'idle', terminalStates: ['authorized','cancelled','rejected']
    }}
  },
];

// Merchant-level bindings: wfId → slotName → connectorId + auth(redacted)
const CONNECTOR_BINDINGS = {
  'oj-home': {
    carrier_x:         { connectorId:'conn-intelipost', authDisplay:'●●●●7234', state:'active',   lastTested:'27/05 14:30', lastTestStatus:'success' },
    payment_processor: { connectorId:'conn-adyen',      authDisplay:'●●●●AQE1', state:'active',   lastTested:'26/05 10:00', lastTestStatus:'success' },
    invoice_system:    { connectorId:'conn-tiny-erp',   authDisplay:'●●●●9f3a', state:'active',   lastTested:'25/05 08:00', lastTestStatus:'success' },
    warehouse_x:       null,
    notification_x:    null,
  }
};

const SKILL_CATALOG = {
  routing: [
    { id:'sk-route-stock', name:'route_by_stock_level',
      description:'Seleciona o CD mais próximo com estoque disponível para o SKU solicitado',
      type:'procedure', parameters:{ min_stock_threshold:5, fallback_cd:'CD São Paulo' },
      active:true,  lastTriggered:'28/05 08:12', triggerCount:1847 },
    { id:'sk-route-sla', name:'route_by_sla',
      description:'Roteia para carrier com menor SLA estimado dado o CEP do destinatário',
      type:'api_call', parameters:{ max_transit_days:3 },
      active:false, lastTriggered:null, triggerCount:0 },
  ],
  orchestration: [
    { id:'sk-orch-advance', name:'advance_on_confirmation',
      description:'Avança automaticamente a tarefa quando recebe confirmação do connector via webhook',
      type:'procedure', parameters:{ confidence_threshold:0.80 },
      active:true, lastTriggered:'28/05 11:45', triggerCount:423 },
    { id:'sk-orch-retry', name:'retry_failed_connector',
      description:'Tenta reexecutar a função do connector até 3 vezes em caso de network_error ou rate_limited',
      type:'procedure', parameters:{ max_retries:3, backoff_seconds:30 },
      active:true, lastTriggered:'27/05 16:22', triggerCount:12 },
    { id:'sk-orch-block-auth', name:'block_on_auth_error',
      description:'Bloqueia a tarefa e cria escalação quando o connector retorna auth_error',
      type:'procedure', parameters:{},
      active:true, lastTriggered:null, triggerCount:0 },
  ],
  escalation: [
    { id:'sk-esc-sla', name:'sla_breach_alert',
      description:'Detecta inatividade acima do SLA configurado e notifica o operador via canal preferencial',
      type:'api_call', parameters:{ sla_hours:4, notification_channel:'slack' },
      active:true, lastTriggered:'27/05 19:00', triggerCount:7 },
    { id:'sk-esc-chargeback', name:'chargeback_risk_escalation',
      description:'Escalona para operador humano quando o agente detecta risco de chargeback acima do threshold',
      type:'procedure', parameters:{ risk_threshold:0.85 },
      active:false, lastTriggered:null, triggerCount:0 },
  ],
};

// Mock responses for testConnector(). Intelipost randomizes last event each call.
const INTELIPOST_EVENTS = [
  { description:'Objeto encaminhado para filial destino', city:'Curitiba',      state:'PR' },
  { description:'Saiu para entrega',                     city:'Curitiba',      state:'PR' },
  { description:'Em transferência entre centros de distribuição', city:'São José dos Pinhais', state:'PR' },
  { description:'Objeto recebido na unidade de distribuição',    city:'Curitiba',      state:'PR' },
];
function getMockIntelipostResponse() {
  const ev = INTELIPOST_EVENTS[Math.floor(Math.random() * INTELIPOST_EVENTS.length)];
  const now = new Date();
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:00`;
  const yesterday = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 2*86400000);
  return {
    request: { method:'GET', url:'https://api.intelipost.com.br/api/v2/tracking/by-shipment-order/68947234', headers:{'x-api-token':'●●●●●●7234','Content-Type':'application/json'} },
    response: { status:200, body: {
      status:'OK',
      result: {
        shipment_order_number:'68947234',
        volumes:[{
          tracking_code:'IT847234001BR',
          status:'IN_TRANSIT', status_label:'Em trânsito',
          tracking_events:[
            { event_datetime: fmt(now),       description: ev.description,                    city: ev.city, state: ev.state },
            { event_datetime: fmt(yesterday), description:'Objeto postado na transportadora', city:'São Paulo', state:'SP' },
            { event_datetime: fmt(twoDaysAgo),description:'Coleta realizada no CD',           city:'São Paulo', state:'SP' },
          ],
          estimated_delivery_date: fmt(new Date(now.getTime() + 2*86400000))
        }]
      }
    }}
  };
}

const MOCK_CONNECTOR_RESPONSES = {
  'conn-adyen': {
    'payment.capture': () => ({
      request: { method:'POST', url:'https://checkout-test.adyen.com/v71/payments/68947234/captures', headers:{'x-API-Key':'●●●●AQE1','Content-Type':'application/json'}, body:{ amount:{ currency:'BRL', value:123000 }, reference:'68947234-cap' } },
      response: { status:200, body:{ pspReference:'852596757149852J', resultCode:'Authorised', merchantReference:'68947234-cap', status:'received' } }
    }),
    'watch.poll': () => ({
      request: { method:'POST', url:'https://checkout-test.adyen.com/v71/payments/details', headers:{'x-API-Key':'●●●●AQE1'}, body:{ details:{ paymentData:'Ab02b4c...' } } },
      response: { status:200, body:{ eventCode:'AUTHORISATION', success:true, pspReference:'852596757149852J', amount:{ currency:'BRL', value:123000 } } }
    }),
  },
  'conn-tiny-erp': {
    'nfe.emit': () => ({
      request: { method:'POST', url:'https://api.tiny.com.br/api2/nota.fiscal.incluir.php', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:{ token:'●●●●9f3a', formato:'JSON', modelo:'NFe' } },
      response: { status:200, body:{ retorno:{ status:'OK', nota_fiscal:{ id:'4872931', numero:'000847234', serie:'1', chave_nfe:'35260513000000000000550010008472341000000001', data_emissao:'2026-05-13T13:33:00' } } } }
    }),
  },
};
