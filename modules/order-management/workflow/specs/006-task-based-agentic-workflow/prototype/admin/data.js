// ══════════════════════════════════════════
// DATA
// ══════════════════════════════════════════

// ── Layer 3: Supplier Resolution Policies ─────────────────────────────────
const SUPPLIER_RESOLUTION_POLICIES = [
  {
    id: 'srp-canal',
    name: 'Por canal de venda',
    fallback: 'self',
    rules: [
      {
        priority: 1,
        source: 'order',
        conditions: [{ field: 'order.sales_channel', operator: 'eq', value: 'marketplace' }],
        resolve_supplier: 'seller_externo',
      }
    ]
  },
  {
    id: 'srp-cd-regiao',
    name: 'CD por região',
    fallback: 'self',
    rules: [
      { priority: 1, source: 'order', conditions: [{ field: 'order.shipping_state', operator: 'eq', value: 'SP' }], resolve_supplier: 'cd_sao_paulo' },
      { priority: 2, source: 'order', conditions: [{ field: 'order.shipping_state', operator: 'eq', value: 'RJ' }], resolve_supplier: 'cd_rio' },
    ]
  },
  {
    id: 'srp-pagamento',
    name: 'Gateway de pagamento padrão',
    fallback: 'self',
    rules: []
  },
  {
    id: 'srp-transportadora',
    name: 'Transportadora por SLA',
    fallback: 'self',
    rules: [
      { priority: 1, source: 'order', conditions: [{ field: 'order.shipping_sla_days', operator: 'lte', value: '2' }], resolve_supplier: 'jadlog_express' },
    ]
  },
  {
    id: 'srp-self',
    name: 'Operador interno (self)',
    fallback: 'self',
    rules: []
  },
];

// ── Layer 1: Routing Policies ─────────────────────────────────────────────
const ROUTING_POLICIES = [
  {
    id: 'rp-home-delivery',
    name: 'Entrega em Domicílio',
    description: 'Roteia para o workflow padrão de entrega quando o item tem frete domiciliar',
    workflow_definition_id: 'oj-home',
    priority: 1,
    conditions: [{ field: 'item.delivery_type', operator: 'eq', value: 'home_delivery' }]
  },
  {
    id: 'rp-bopis',
    name: 'Retirada na Loja',
    description: 'Roteia para BOPIS quando o cliente optou por retirada em loja',
    workflow_definition_id: 'oj-bopis',
    priority: 2,
    conditions: [{ field: 'item.delivery_type', operator: 'eq', value: 'pickup_in_store' }]
  },
  {
    id: 'rp-digital',
    name: 'Produto Digital',
    description: 'Roteia para entrega digital quando o item não tem dimensões físicas',
    workflow_definition_id: 'oj-digital',
    priority: 3,
    conditions: [{ field: 'item.item_type', operator: 'eq', value: 'digital' }]
  },
  {
    id: 'rp-returns',
    name: 'Devolução / Troca',
    description: 'Acionado quando o shopper ou agente inicia uma solicitação de retorno',
    workflow_definition_id: 'wf-returns',
    priority: 10,
    conditions: [{ field: 'event.type', operator: 'eq', value: 'return_requested' }]
  },
  {
    id: 'rp-credit-card',
    name: 'Pagamento com Cartão de Crédito',
    description: 'Roteia para workflow com antifraude quando o pagamento é cartão de crédito',
    workflow_definition_id: 'oj-home',
    priority: 4,
    conditions: [
      { field: 'payment.method', operator: 'eq', value: 'credit_card' },
      { field: 'order.total', operator: 'gte', value: '500' }
    ]
  },
  {
    id: 'rp-b2b',
    name: 'Pedido B2B',
    description: 'Roteia pedidos de canal B2B para aprovação manual antes da preparação',
    workflow_definition_id: 'oj-home',
    priority: 5,
    conditions: [
      { field: 'order.sales_channel', operator: 'eq', value: 'b2b' }
    ]
  },
];

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
  { id:'1644907562936-01', short:'7562936', date:'07/07/2026 - 02:12', client:'João Teste', items:1, total:'R$ 559,90', origin:'Marketplace', orderStatus:'processed', tags:['americanas'], tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Gerar Nota Fiscal',s:'completed'},{n:'Código de Rastreio',s:'completed'},{n:'Despachado',s:'completed'},{n:'Entregue',s:'completed'}] },
  { id:'1644910000001-01', short:'7900001', date:'15/07/2026 - 10:30', client:'Maria Fernanda Teste', items:3, total:'R$ 2.890,00', origin:'Marketplace', orderStatus:'processed', tags:['multi-seller','americanas','magalu','seguro'], tasks:[
    {n:'Autorização de Pagamento',s:'completed'},{n:'Captura de Pagamento',s:'completed'},{n:'Separação',s:'completed'},{n:'Embalagem',s:'completed'},{n:'Gerar NF',s:'completed'},{n:'Entregue',s:'completed'}] },
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
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_001', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'PagSeguro'}, sla_deadline:'13/05/2026 17:48', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-11293',amount:960.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_002', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'PagSeguro'}, sla_deadline:'13/05/2026 18:48', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-78812',amount:960.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_003', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 20:48', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending',
           instance_id:'ti_004', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'13/05/2026 22:48', sla_breached:true, outcome:null, outputs:null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending',
           instance_id:'ti_005', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending',
           instance_id:'ti_006', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending',
           instance_id:'ti_007', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending',
           instance_id:'ti_008', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Despachado', sup:'Correios', s:'pending',
           instance_id:'ti_009', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Entregue', sup:'Correios', s:'pending',
           instance_id:'ti_010', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    },
    { name:'Camiseta Under Armour M', emoji:'👕', qty:1, price:'R$ 99,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_011', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'PagSeguro'}, sla_deadline:'13/05/2026 17:48', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-11293',amount:99.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_012', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'PagSeguro'}, sla_deadline:'13/05/2026 18:48', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-78813',amount:99.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_013', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 20:48', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'C-07-02'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending',
           instance_id:'ti_014', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'13/05/2026 22:48', sla_breached:true, outcome:null, outputs:null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending',
           instance_id:'ti_015', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending',
           instance_id:'ti_016', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending',
           instance_id:'ti_017', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending',
           instance_id:'ti_018', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Despachado', sup:'Correios', s:'pending',
           instance_id:'ti_019', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Entregue', sup:'Correios', s:'pending',
           instance_id:'ti_020', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    },
    { name:'Bermuda Oakley Camo G', emoji:'🩳', qty:1, price:'R$ 83,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_021', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'PagSeguro'}, sla_deadline:'13/05/2026 17:48', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-11293',amount:83.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_022', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'PagSeguro'}, sla_deadline:'13/05/2026 18:48', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-78814',amount:83.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_023', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 20:48', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'A-09-07'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending',
           instance_id:'ti_024', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'13/05/2026 22:48', sla_breached:true, outcome:null, outputs:null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending',
           instance_id:'ti_025', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending',
           instance_id:'ti_026', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending',
           instance_id:'ti_027', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending',
           instance_id:'ti_028', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Despachado', sup:'Correios', s:'pending',
           instance_id:'ti_029', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Entregue', sup:'Correios', s:'pending',
           instance_id:'ti_030', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    }
  ],

  // ─── Ana Carvalho — 2 itens — processed (entregue) — com Troca e Devolução ──
  '1631858947234-01': [
    { name:'Jaqueta Calvin Klein G', emoji:'🧥', qty:1, price:'R$ 790,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_047', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'13/05/2026 14:33', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-84291',amount:790.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_048', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'13/05/2026 15:33', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-29183',amount:790.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_049', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 17:33', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'B-04-11'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed',
           instance_id:'ti_050', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'13/05/2026 19:33', sla_breached:false, outcome:'approved', outputs:{}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_051', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 22:33', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed',
           instance_id:'ti_052', resolved_supplier:{id:'tiny_erp',type:'system',name:'Tiny ERP'}, sla_deadline:'14/05/2026 01:33', sla_breached:false, outcome:'issued', outputs:{nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed',
           instance_id:'ti_053', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'14/05/2026 02:33', sla_breached:false, outcome:'updated', outputs:{}},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Transp. XYZ', s:'completed',
           instance_id:'ti_054', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'14/05/2026 06:33', sla_breached:false, outcome:'generated', outputs:{tracking_code:'XY938471029BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Transp. XYZ', s:'completed',
           instance_id:'ti_055', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'16/05/2026 13:33', sla_breached:false, outcome:'dispatched', outputs:{dispatched_at:'14/05/2026 08:12'}},
          {name:'Entregue', sup:'Transp. XYZ', s:'completed',
           instance_id:'ti_056', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'21/05/2026 13:33', sla_breached:false, outcome:'delivered', outputs:{delivered_at:'15/05/2026 14:20'}},
        ]}
      ],
      secondWorkflow:{
        wfId:'wf-returns', wfName:'Troca e Devolução', triggeredAt:'14/05/2026 10:23',
        triggeredBy:'Shopper',
        tasks:[
          {name:'Solicitação Recebida',sup:'Atendimento',s:'completed',
           instance_id:'ti_060', resolved_supplier:{id:'atendimento',type:'internal',name:'Equipe Atendimento'}, sla_deadline:'14/05/2026 18:23', sla_breached:false, outcome:'completed', outputs:{}},
          {name:'Análise do Motivo',sup:'QA Team',s:'completed',
           instance_id:'ti_061', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'15/05/2026 10:23', sla_breached:false, outcome:'approved', outputs:{reason_code:'manufacturing_defect'}},
          {name:'Coleta do Item',sup:'Transp. XYZ',s:'pending',
           instance_id:'ti_062', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'17/05/2026 10:23', sla_breached:true, outcome:null, outputs:null},
          {name:'Inspeção de Qualidade',sup:'QA Team',s:'pending',
           instance_id:'ti_063', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Reembolso / Troca',sup:'Financeiro',s:'pending',
           instance_id:'ti_064', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]
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
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_065', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'13/05/2026 14:33', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-84292',amount:440.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_066', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'13/05/2026 15:33', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-29184',amount:440.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_067', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 17:33', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'B-02-05'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed',
           instance_id:'ti_068', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'13/05/2026 19:33', sla_breached:false, outcome:'approved', outputs:{}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_069', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'13/05/2026 22:33', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed',
           instance_id:'ti_070', resolved_supplier:{id:'tiny_erp',type:'system',name:'Tiny ERP'}, sla_deadline:'14/05/2026 01:33', sla_breached:false, outcome:'issued', outputs:{nfe_key:'35260512345678000199550010001234562123456790',nfe_number:'123457'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed',
           instance_id:'ti_071', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'14/05/2026 02:33', sla_breached:false, outcome:'updated', outputs:{}},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Transp. XYZ', s:'completed',
           instance_id:'ti_072', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'14/05/2026 06:33', sla_breached:false, outcome:'generated', outputs:{tracking_code:'XY938471030BR'}},
          {name:'Despachado', sup:'Transp. XYZ', s:'completed',
           instance_id:'ti_073', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'16/05/2026 13:33', sla_breached:false, outcome:'dispatched', outputs:{dispatched_at:'14/05/2026 08:30'}},
          {name:'Entregue', sup:'Transp. XYZ', s:'completed',
           instance_id:'ti_074', resolved_supplier:{id:'transportadora_xyz',type:'carrier',name:'Transportadora XYZ'}, sla_deadline:'21/05/2026 13:33', sla_breached:false, outcome:'delivered', outputs:{delivered_at:'15/05/2026 15:10'}},
        ]}
      ]
    },
  ],
  '1631900949000-01': [
    { name:'Mouse Logitech MX Master 3', emoji:'🖱️', qty:1, price:'R$ 190,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0001', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0002', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0003', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0004', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0005', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0006', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0007', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0008', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0009', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0010', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Teclado Mecânico Keychron K2', emoji:'⌨️', qty:1, price:'R$ 190,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0011', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0012', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0013', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0014', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0015', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0016', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0017', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0018', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0019', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0020', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    }
  ],
  '1631910950000-01': [
    {
      name:'Camiseta BRK com nome "João Eduardo"', emoji:'👕', qty:1, price:'R$ 240,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0021', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0022', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-personalization', wfName:'Personalização de Produtos',
          triggeredAt:'26/05/2026 14:45', triggeredBy:'Agente AI',
          tasks:[
            {name:'Briefing do Cliente', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Briefing recebido e registrado', s:'completed', failAction:'Solicitar novamente ao cliente'},
                {id:'cp2', label:'Arquivo de arte ou instruções anexados', s:'completed', failAction:'Aguardar envio do cliente'},
              ], instance_id: 'ti_0023', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
            {name:'Arte / Design', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Mockup criado pelo designer', s:'completed', failAction:'Reatribuir a outro designer BRK'},
                {id:'cp2', label:'Mockup enviado ao cliente para aprovação', s:'completed', failAction:'Reenviar por outro canal'},
              ], instance_id: 'ti_0024', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
            {name:'Aprovação do Cliente', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Arte aprovada pelo cliente', s:'completed', failAction:'Reenviar arte corrigida'},
                {id:'cp2', label:'Confirmação registrada no sistema', s:'completed', failAction:'Solicitar confirmação'},
              ], instance_id: 'ti_0025', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
            {name:'Produção', sup:'BRK', s:'completed', instance_id: 'ti_0026', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
            {name:'Controle de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0027', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
            {name:'Conclusão da Personalização', sup:'BRK', s:'completed', instance_id: 'ti_0028', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          ]
        },
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0029', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0030', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0031', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0032', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed', instance_id: 'ti_0033', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed', instance_id: 'ti_0034', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Jadlog', s:'pending', instance_id: 'ti_0035', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Jadlog', s:'pending', instance_id: 'ti_0036', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    {
      name:'Piso Vinílico 100m²', emoji:'🪵', qty:1, price:'R$ 450,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0037', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0038', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0039', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0040', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0041', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0042', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed', instance_id: 'ti_0043', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed', instance_id: 'ti_0044', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Jadlog', s:'pending', instance_id: 'ti_0045', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Jadlog', s:'pending', instance_id: 'ti_0046', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    {
      name:'Tapete Sala 2x3m', emoji:'🏠', qty:1, price:'R$ 200,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0047', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0048', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0049', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0050', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0051', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0052', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed', instance_id: 'ti_0053', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed', instance_id: 'ti_0054', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Jadlog', s:'pending', instance_id: 'ti_0055', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Jadlog', s:'pending', instance_id: 'ti_0056', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
  ],
  '1631920951000-01': [
    // ── Grupo 1: CD São Paulo · Jadlog ──
    { name:'Camiseta Polo Ralph Lauren G', emoji:'👕', qty:1, price:'R$ 320,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_080', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 17:45', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-95011',amount:320.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_081', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 18:45', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-40021',amount:320.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_082', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'26/05/2026 20:45', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'D-03-09'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed',
           instance_id:'ti_083', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'26/05/2026 22:45', sla_breached:false, outcome:'approved', outputs:{}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_084', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'27/05/2026 01:45', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed',
           instance_id:'ti_085', resolved_supplier:{id:'tiny_erp',type:'system',name:'Tiny ERP'}, sla_deadline:'27/05/2026 03:45', sla_breached:false, outcome:'issued', outputs:{nfe_key:'35260512345678000199550010001234563123456791',nfe_number:'123458'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending',
           instance_id:'ti_086', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'27/05/2026 04:45', sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending',
           instance_id:'ti_087', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Despachado', sup:'Jadlog', s:'pending',
           instance_id:'ti_088', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Entregue', sup:'Jadlog', s:'pending',
           instance_id:'ti_089', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    },
    { name:"Calça Jeans Levi's 32x34", emoji:'👖', qty:1, price:'R$ 280,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_090', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 17:45', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-95012',amount:280.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_091', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 18:45', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-40022',amount:280.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_092', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'26/05/2026 20:45', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'A-11-04'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed',
           instance_id:'ti_093', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'26/05/2026 22:45', sla_breached:false, outcome:'approved', outputs:{}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_094', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'27/05/2026 01:45', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed',
           instance_id:'ti_095', resolved_supplier:{id:'tiny_erp',type:'system',name:'Tiny ERP'}, sla_deadline:'27/05/2026 03:45', sla_breached:false, outcome:'issued', outputs:{nfe_key:'35260512345678000199550010001234564123456792',nfe_number:'123459'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending',
           instance_id:'ti_096', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'27/05/2026 04:45', sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending',
           instance_id:'ti_097', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Despachado', sup:'Jadlog', s:'pending',
           instance_id:'ti_098', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Entregue', sup:'Jadlog', s:'pending',
           instance_id:'ti_099', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    },
    { name:'Tênis Asics Gel-Nimbus 26 T42', emoji:'👟', qty:1, price:'R$ 450,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_100', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 17:45', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-95013',amount:450.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_101', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 18:45', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-40023',amount:450.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed',
           instance_id:'ti_102', resolved_supplier:{id:'cd_sao_paulo',type:'warehouse',name:'CD São Paulo'}, sla_deadline:'26/05/2026 20:45', sla_breached:false, outcome:'completed', outputs:{warehouse_location:'C-06-01'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending',
           instance_id:'ti_103', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'26/05/2026 22:45', sla_breached:true, outcome:null, outputs:null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending',
           instance_id:'ti_104', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending',
           instance_id:'ti_105', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending',
           instance_id:'ti_106', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending',
           instance_id:'ti_107', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Despachado', sup:'Jadlog', s:'pending',
           instance_id:'ti_108', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Entregue', sup:'Jadlog', s:'pending',
           instance_id:'ti_109', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    },
    // ── Grupo 2: Shopping Botafogo RJ · BOPIS ──
    { name:'Boné New Era NY 7 3/8', emoji:'🧢', qty:1, price:'R$ 89,00', seller:'Shopping Botafogo RJ',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_110', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 17:45', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-95014',amount:89.00}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed',
           instance_id:'ti_111', resolved_supplier:{id:'srp-pagamento',type:'gateway',name:'Adyen'}, sla_deadline:'26/05/2026 18:45', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-40024',amount:89.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Shopping Botafogo RJ', s:'completed',
           instance_id:'ti_112', resolved_supplier:{id:'shopping_botafogo_rj',type:'store',name:'Shopping Botafogo RJ'}, sla_deadline:'27/05/2026 08:00', sla_breached:false, outcome:'completed', outputs:{store_location:'Estoque Loja 204'}},
          {name:'Conferência de Qualidade', sup:'Shopping Botafogo RJ', s:'completed',
           instance_id:'ti_113', resolved_supplier:{id:'shopping_botafogo_rj',type:'store',name:'Shopping Botafogo RJ'}, sla_deadline:'27/05/2026 10:00', sla_breached:false, outcome:'approved', outputs:{}},
          {name:'Notificação ao Cliente', sup:'Shopping Botafogo RJ', s:'completed',
           instance_id:'ti_114', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'27/05/2026 11:00', sla_breached:false, outcome:'sent', outputs:{channel:'email',notified_at:'27/05/2026 10:42'}},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Disponível na Loja', sup:'Shopping Botafogo RJ', s:'pending',
           instance_id:'ti_115', resolved_supplier:{id:'shopping_botafogo_rj',type:'store',name:'Shopping Botafogo RJ'}, sla_deadline:'30/05/2026 18:00', sla_breached:false, outcome:null, outputs:null},
          {name:'Retirada Confirmada', sup:'Shopping Botafogo RJ', s:'pending',
           instance_id:'ti_116', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]}
      ]
    },
  ],

  // ─── Carlos Mendes — 1 item — processed ───────────────────────────────────
  '1631848947052-01': [
    { name:'Tênis Adidas Ultraboost 42', emoji:'👟', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0057', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0058', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0059', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0060', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0061', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0062', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed', instance_id: 'ti_0063', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'completed', instance_id: 'ti_0064', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Correios', s:'completed', instance_id: 'ti_0065', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Entregue', sup:'Correios', s:'completed', instance_id: 'ti_0066', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'delivered', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}}
        ]}
      ]
    }
  ],

  // ─── Fernanda Lima — 4 itens — not-processed ──────────────────────────────
  '1631848946980-01': [
    { name:'Vestido Floral Midi P', emoji:'👗', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0067', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento', instance_id: 'ti_0068', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0069', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending', instance_id: 'ti_0070', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0071', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0072', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0073', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0074', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0075', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0076', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Sandália Arezzo Nº36', emoji:'👡', qty:1, price:'R$ 79,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0077', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento', instance_id: 'ti_0078', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0079', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending', instance_id: 'ti_0080', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0081', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0082', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0083', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0084', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0085', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0086', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Bolsa Tiracolo Couro', emoji:'👜', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0087', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento', instance_id: 'ti_0088', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0089', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending', instance_id: 'ti_0090', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0091', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0092', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0093', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0094', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0095', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0096', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Óculos de Sol Cat Eye', emoji:'🕶️', qty:1, price:'R$ 85,30',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0097', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Falha de comunicação com a operadora de cartão',
            blockSource:'Gateway de Pagamento',
            suggestion:'Executar nova tentativa de captura de pagamento', instance_id: 'ti_0098', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0099', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'pending', instance_id: 'ti_0100', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0101', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0102', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0103', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0104', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0105', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0106', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
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
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0107', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0108', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0109', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0110', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0111', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0112', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0113', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending', instance_id: 'ti_0114', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Jadlog', s:'pending', instance_id: 'ti_0115', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Jadlog', s:'pending', instance_id: 'ti_0116', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Camiseta Nike Dri-FIT M', emoji:'👕', qty:1, price:'R$ 130,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0117', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0118', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0119', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0120', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0121', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0122', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0123', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending', instance_id: 'ti_0124', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Jadlog', s:'pending', instance_id: 'ti_0125', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Jadlog', s:'pending', instance_id: 'ti_0126', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Shorts Adidas M', emoji:'🩳', qty:1, price:'R$ 120,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0127', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0128', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0129', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0130', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'pending', instance_id: 'ti_0131', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0132', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0133', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'pending', instance_id: 'ti_0134', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Jadlog', s:'pending', instance_id: 'ti_0135', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Jadlog', s:'pending', instance_id: 'ti_0136', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    // ── Grupo 2: CD Campinas · Correios ──
    { name:'Boné Oakley', emoji:'🧢', qty:1, price:'R$ 160,00', seller:'CD Campinas',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0137', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0138', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD Campinas', s:'completed', instance_id: 'ti_0139', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0140', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD Campinas', s:'pending', instance_id: 'ti_0141', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0142', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0143', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0144', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0145', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0146', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Meias Pack 3 pares', emoji:'🧦', qty:1, price:'R$ 260,00', seller:'CD Campinas',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0147', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0148', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD Campinas', s:'completed', instance_id: 'ti_0149', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0150', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD Campinas', s:'pending', instance_id: 'ti_0151', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0152', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0153', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'pending', instance_id: 'ti_0154', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'pending', instance_id: 'ti_0155', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'pending', instance_id: 'ti_0156', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    }
  ],

  // ─── Diego Ferreira — 2 itens — processed ─────────────────────────────────
  '1631818946200-01': [
    { name:'Camisa Social Aramis Slim M', emoji:'👔', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0157', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0158', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0159', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0160', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0161', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0162', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed', instance_id: 'ti_0163', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'completed', instance_id: 'ti_0164', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Correios', s:'completed', instance_id: 'ti_0165', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Entregue', sup:'Correios', s:'completed', instance_id: 'ti_0166', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'delivered', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}}
        ]}
      ]
    },
    { name:'Calça Chino Khaki 40', emoji:'👖', qty:1, price:'R$ 65,10',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0167', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0168', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0169', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'completed', instance_id: 'ti_0170', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Embalagem', sup:'CD São Paulo', s:'completed', instance_id: 'ti_0171', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'completed', instance_id: 'ti_0172', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'issued', outputs: {nfe_key:'35260512345678000199550010001234561123456789',nfe_number:'123456'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed', instance_id: 'ti_0173', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'completed', instance_id: 'ti_0174', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Despachado', sup:'Correios', s:'completed', instance_id: 'ti_0175', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}},
          {name:'Entregue', sup:'Correios', s:'completed', instance_id: 'ti_0176', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'delivered', outputs: {tracking_code:'BR123456789BR',carrier_url:'https://rastreamento.correios.com.br'}}
        ]}
      ]
    }
  ],

  // ─── Juliana Santos — 3 itens — canceled ──────────────────────────────────
  '1631808945900-01': [
    { name:'Vestido Floral Zara P', emoji:'👗', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0177', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0178', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'blocked',
            blockReason:'Pedido de cancelamento recebido pelo cliente',
            blockSource:'Sistema de Cancelamentos',
            suggestion:'Confirmar cancelamento e processar estorno do pagamento', instance_id: 'ti_0179', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'canceled', instance_id: 'ti_0180', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'canceled', instance_id: 'ti_0181', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'canceled', instance_id: 'ti_0182', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'canceled', instance_id: 'ti_0183', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'canceled', instance_id: 'ti_0184', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'canceled', instance_id: 'ti_0185', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'canceled', instance_id: 'ti_0186', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Sandália Arezzo Nº 36', emoji:'👡', qty:1, price:'R$ 79,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0187', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0188', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'blocked',
            blockReason:'Pedido de cancelamento recebido pelo cliente',
            blockSource:'Sistema de Cancelamentos',
            suggestion:'Confirmar cancelamento e processar estorno do pagamento', instance_id: 'ti_0189', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'canceled', instance_id: 'ti_0190', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'canceled', instance_id: 'ti_0191', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'canceled', instance_id: 'ti_0192', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'canceled', instance_id: 'ti_0193', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'canceled', instance_id: 'ti_0194', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'canceled', instance_id: 'ti_0195', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'canceled', instance_id: 'ti_0196', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Bolsa Tiracolo Couro Preto', emoji:'👜', qty:1, price:'R$ 50,20',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0197', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0198', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD São Paulo', s:'blocked',
            blockReason:'Pedido de cancelamento recebido pelo cliente',
            blockSource:'Sistema de Cancelamentos',
            suggestion:'Confirmar cancelamento e processar estorno do pagamento', instance_id: 'ti_0199', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Conferência de Qualidade', sup:'QA Team', s:'canceled', instance_id: 'ti_0200', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Embalagem', sup:'CD São Paulo', s:'canceled', instance_id: 'ti_0201', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'canceled', instance_id: 'ti_0202', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'canceled', instance_id: 'ti_0203', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Correios', s:'canceled', instance_id: 'ti_0204', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Despachado', sup:'Correios', s:'canceled', instance_id: 'ti_0205', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Entregue', sup:'Correios', s:'canceled', instance_id: 'ti_0206', resolved_supplier: {id:'jadlog-01',type:'webhook',name:'Jadlog Express'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
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
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0207', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0208', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Loja Rua Augusta SP', s:'completed', instance_id: 'ti_0209', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'Loja Rua Augusta SP', s:'completed', instance_id: 'ti_0210', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Notificação ao Cliente', sup:'Loja Rua Augusta SP', s:'pending', instance_id: 'ti_0211', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0212', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0213', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Disponível na Loja', sup:'Loja Rua Augusta SP', s:'pending', instance_id: 'ti_0214', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Retirada Confirmada', sup:'Loja Rua Augusta SP', s:'pending', instance_id: 'ti_0215', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
    { name:'Rodapé PVC 7cm Branco (barra 2,4m)', emoji:'📏', qty:35, price:'R$ 455,00',
      kitGroupId:'kit-piso', kitGroupName:'Kit Piso Vinílico — Retirada na Loja',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0216', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0217', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Loja Rua Augusta SP', s:'completed', instance_id: 'ti_0218', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {warehouse_location:'A-12-03'}},
          {name:'Conferência de Qualidade', sup:'Loja Rua Augusta SP', s:'completed', instance_id: 'ti_0219', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'completed', outputs: {}},
          {name:'Notificação ao Cliente', sup:'Loja Rua Augusta SP', s:'pending', instance_id: 'ti_0220', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'Financeiro', s:'pending', instance_id: 'ti_0221', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'pending', instance_id: 'ti_0222', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Disponível na Loja', sup:'Loja Rua Augusta SP', s:'pending', instance_id: 'ti_0223', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Retirada Confirmada', sup:'Loja Rua Augusta SP', s:'pending', instance_id: 'ti_0224', resolved_supplier: {id:'cd-sp-01',type:'operator',name:'CD São Paulo'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },

    // ─── Kit 2: Serviço de Instalação ─────────────────────────────────────
    { name:'Serviço de Instalação de Piso Vinílico (200m²)', emoji:'🔧', qty:1, price:'R$ 490,00',
      isService: true,
      kitGroupId:'kit-instalacao', kitGroupName:'Kit Instalação — Produto + Serviço',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0225', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'authorized', outputs: {authorization_code:'AUTH-78342',amount:1230}},
          {name:'Captura de Pagamento', sup:'Gateway Pagamento', s:'completed', instance_id: 'ti_0226', resolved_supplier: {id:'gateway-pagarme',type:'webhook',name:'Pagar.me'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: 'captured', outputs: {capture_id:'CAP-48291',amount:1230}}
        ]},
        { wfId:'wf-services', wfName:'Agendamento de Serviço', tasks:[
          {name:'Agendamento com Técnico', sup:'Equipe de Instalação', s:'pending', instance_id: 'ti_0227', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Confirmação do Cliente', sup:'Atendimento', s:'pending', instance_id: 'ti_0228', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Lembrete D-1', sup:'Sistema Notificações', s:'pending', instance_id: 'ti_0229', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal (Serviço)', sup:'Financeiro', s:'pending', instance_id: 'ti_0230', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Atualizar Status', sup:'VTEX', s:'pending', instance_id: 'ti_0231', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]},
        { wfId:'wf-delivery', wfName:'Serviço Executado', tasks:[
          {name:'Técnico no Local', sup:'Equipe de Instalação', s:'pending', instance_id: 'ti_0232', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Instalação Concluída', sup:'Equipe de Instalação', s:'pending', instance_id: 'ti_0233', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null},
          {name:'Aceite do Cliente', sup:'Atendimento', s:'pending', instance_id: 'ti_0234', resolved_supplier: {id:'internal-ops',type:'operator',name:'Operações Internas'}, sla_deadline: '2026-07-16T23:59:00Z', sla_breached: false, outcome: null, outputs: null}
        ]}
      ]
    },
  ],

  // ─── Maria Fernanda Teste — 3 itens — Multi-seller — processed + 3 devoluções ──
  '1644910000001-01': [
    // ── Item 1: Tênis Nike (1P — Lojas Americanas CWB) ── devolução na loja ──
    { name:'Tênis Nike Air Max 270 42', emoji:'👟', qty:1, price:'R$ 1.299,00',
      seller:'1P · Lojas Americanas CWB', channel:'Americanas.com',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Adyen', s:'completed',
           instance_id:'ti_800', resolved_supplier:{id:'adyen',type:'gateway',name:'Adyen'}, sla_deadline:'15/07/2026 11:30', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-8200011',amount:1299.00}},
          {name:'Captura de Pagamento', sup:'Adyen', s:'completed',
           instance_id:'ti_801', resolved_supplier:{id:'adyen',type:'gateway',name:'Adyen'}, sla_deadline:'15/07/2026 12:30', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-8200011',amount:1299.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Americanas L029', s:'completed',
           instance_id:'ti_802', resolved_supplier:{id:'americanas-l029',type:'warehouse',name:'Americanas CD L029'}, sla_deadline:'15/07/2026 14:00', sla_breached:false, outcome:'completed', outputs:{store_id:'L029'}},
          {name:'Embalagem', sup:'Americanas L029', s:'completed',
           instance_id:'ti_803', resolved_supplier:{id:'americanas-l029',type:'warehouse',name:'Americanas CD L029'}, sla_deadline:'15/07/2026 16:00', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'ERP Americanas', s:'completed',
           instance_id:'ti_804', resolved_supplier:{id:'erp-americanas',type:'system',name:'ERP Americanas'}, sla_deadline:'15/07/2026 17:00', sla_breached:false, outcome:'issued', outputs:{nfe_number:'000200411',nfe_key:'41260700776574000100550040002004111000000002',invoice_value:'R$ 1.299,00'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed',
           instance_id:'ti_805', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'15/07/2026 17:30', sla_breached:false, outcome:'updated', outputs:{}},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Entrega Rápida SP', s:'completed',
           instance_id:'ti_806', resolved_supplier:{id:'entrega-rapida',type:'carrier',name:'Entrega Rápida SP'}, sla_deadline:'16/07/2026 10:00', sla_breached:false, outcome:'generated', outputs:{tracking_code:'ER000200411BR',carrier_url:'https://rastreamento.entregasrapidas.com.br/ER000200411BR'}},
          {name:'Despachado', sup:'Entrega Rápida SP', s:'completed',
           instance_id:'ti_807', resolved_supplier:{id:'entrega-rapida',type:'carrier',name:'Entrega Rápida SP'}, sla_deadline:'17/07/2026 12:00', sla_breached:false, outcome:'dispatched', outputs:{dispatched_at:'16/07/2026 08:00'}},
          {name:'Entregue', sup:'Entrega Rápida SP', s:'completed',
           instance_id:'ti_808', resolved_supplier:{id:'entrega-rapida',type:'carrier',name:'Entrega Rápida SP'}, sla_deadline:'18/07/2026 12:00', sla_breached:false, outcome:'delivered', outputs:{delivered_at:'17/07/2026 14:22'},
           shipping_events:[
             {date:'16/07/2026 08:00', description:'Pedido despachado pelo remetente'},
             {date:'16/07/2026 18:40', description:'Em trânsito — unidade Curitiba'},
             {date:'17/07/2026 09:15', description:'Saiu para entrega'},
             {date:'17/07/2026 14:22', description:'Entregue ao destinatário'},
           ]},
        ]},
      ],
      secondWorkflow:{
        wfId:'wf-returns', wfName:'Devolução — Lojas Americanas CWB', triggeredAt:'19/07/2026 09:14',
        triggeredBy:'Shopper',
        channel:'Americanas.com', seller:'1P · Lojas Americanas CWB',
        return_reason:'Produto com defeito de fabricação',
        return_channel:'Devolução na loja',
        financial_resolution:'Estorno no cartão',
        tasks:[
          {name:'Solicitação Recebida', sup:'Atendimento',s:'completed',
           instance_id:'tr_801', resolved_supplier:{id:'atendimento',type:'operator',name:'Equipe Atendimento'}, sla_deadline:'19/07/2026 17:14', sla_breached:false, outcome:'completed', outputs:{return_reason:'defeito_fabricacao',protocol:'DEV-2026-00811'}},
          {name:'Notificação ao Seller', sup:'ERP Americanas',s:'completed',
           instance_id:'tr_802', resolved_supplier:{id:'erp-americanas',type:'system',name:'ERP Americanas'}, sla_deadline:'19/07/2026 19:14', sla_breached:false, outcome:'notified', outputs:{seller_ticket:'SEL-AME-00811',seller_response:'approved'}},
          {name:'Análise do Motivo', sup:'QA Team',s:'completed',
           instance_id:'tr_803', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'20/07/2026 09:14', sla_breached:false, outcome:'coleta_necessaria', outputs:{reason_code:'manufacturing_defect',approved:true}},
          {name:'Seleção do Canal de Devolução', sup:'Atendimento',s:'completed',
           instance_id:'tr_804', resolved_supplier:{id:'atendimento',type:'operator',name:'Equipe Atendimento'}, sla_deadline:'20/07/2026 11:14', sla_breached:false, outcome:'loja_fisica', outputs:{channel:'store_drop_off',store:'Lojas Americanas CWB — Rua XV de Novembro, 520'}},
          {name:'Instrução de Devolução', sup:'Atendimento',s:'completed',
           instance_id:'tr_805', resolved_supplier:{id:'atendimento',type:'operator',name:'Equipe Atendimento'}, sla_deadline:'20/07/2026 12:00', sla_breached:false, outcome:'sent', outputs:{qr_code:'DEV-QR-811',instructions_sent_at:'20/07/2026 10:52'}},
          {name:'Entrega na Loja', sup:'Lojas Americanas CWB',s:'completed',
           instance_id:'tr_806', resolved_supplier:{id:'americanas-cwb',type:'store',name:'Lojas Americanas CWB'}, sla_deadline:'22/07/2026 18:00', sla_breached:false, outcome:'received', outputs:{received_at:'21/07/2026 15:30',condition:'bom_estado',store_protocol:'CWB-REC-0811'}},
          {name:'Inspeção de Qualidade', sup:'QA Team',s:'pending',
           instance_id:'tr_807', resolved_supplier:{id:'qa_team',type:'internal',name:'QA Team'}, sla_deadline:'23/07/2026 15:30', sla_breached:false, outcome:null, outputs:null},
          {name:'Estorno no Cartão', sup:'Adyen',s:'pending',
           instance_id:'tr_808', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]
      }
    },

    // ── Item 2: Smart TV Samsung (3P — Magalu) ── coleta domiciliar + gift card ──
    { name:'Smart TV Samsung 55" QLED 4K', emoji:'📺', qty:1, price:'R$ 1.399,00',
      seller:'3P · Magazine Luiza', channel:'Americanas.com',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Adyen', s:'completed',
           instance_id:'ti_810', resolved_supplier:{id:'adyen',type:'gateway',name:'Adyen'}, sla_deadline:'15/07/2026 11:30', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-8200012',amount:1399.00}},
          {name:'Captura de Pagamento', sup:'Adyen', s:'completed',
           instance_id:'ti_811', resolved_supplier:{id:'adyen',type:'gateway',name:'Adyen'}, sla_deadline:'15/07/2026 12:30', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-8200012',amount:1399.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'CD Magalu SP', s:'completed',
           instance_id:'ti_812', resolved_supplier:{id:'magalu-cd-sp',type:'warehouse',name:'CD Magalu SP'}, sla_deadline:'15/07/2026 15:00', sla_breached:false, outcome:'completed', outputs:{warehouse_id:'MLU-CD-SP-01'}},
          {name:'Embalagem', sup:'CD Magalu SP', s:'completed',
           instance_id:'ti_813', resolved_supplier:{id:'magalu-cd-sp',type:'warehouse',name:'CD Magalu SP'}, sla_deadline:'15/07/2026 17:00', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'ERP Magalu', s:'completed',
           instance_id:'ti_814', resolved_supplier:{id:'erp-magalu',type:'system',name:'ERP Magazine Luiza'}, sla_deadline:'15/07/2026 18:00', sla_breached:false, outcome:'issued', outputs:{nfe_number:'000100822',nfe_key:'35260721930606000166550010001008221000000001',invoice_value:'R$ 1.399,00'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed',
           instance_id:'ti_815', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'15/07/2026 18:30', sla_breached:false, outcome:'updated', outputs:{}},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Jadlog', s:'completed',
           instance_id:'ti_816', resolved_supplier:{id:'jadlog',type:'carrier',name:'Jadlog'}, sla_deadline:'16/07/2026 12:00', sla_breached:false, outcome:'generated', outputs:{tracking_code:'JDL00822001BR',carrier_url:'https://jadlog.com.br/rastreamento/JDL00822001BR'}},
          {name:'Despachado', sup:'Jadlog', s:'completed',
           instance_id:'ti_817', resolved_supplier:{id:'jadlog',type:'carrier',name:'Jadlog'}, sla_deadline:'18/07/2026 12:00', sla_breached:false, outcome:'dispatched', outputs:{dispatched_at:'16/07/2026 10:30'}},
          {name:'Entregue', sup:'Jadlog', s:'completed',
           instance_id:'ti_818', resolved_supplier:{id:'jadlog',type:'carrier',name:'Jadlog'}, sla_deadline:'20/07/2026 12:00', sla_breached:false, outcome:'delivered', outputs:{delivered_at:'18/07/2026 16:05'},
           shipping_events:[
             {date:'16/07/2026 10:30', description:'Coletado no CD Magalu SP'},
             {date:'17/07/2026 03:14', description:'Em trânsito — Hub Jadlog Campinas'},
             {date:'18/07/2026 07:50', description:'Saiu para entrega — filial local'},
             {date:'18/07/2026 16:05', description:'Entregue ao destinatário'},
           ]},
        ]},
      ],
      secondWorkflow:{
        wfId:'wf-returns', wfName:'Troca — Magazine Luiza (3P)', triggeredAt:'20/07/2026 11:42',
        triggeredBy:'Shopper',
        channel:'Americanas.com', seller:'3P · Magazine Luiza',
        return_reason:'Produto não corresponde à descrição (tamanho divergente)',
        return_channel:'Coleta no domicílio — Jadlog',
        financial_resolution:'Gift card Americanas',
        tasks:[
          {name:'Solicitação Recebida', sup:'Atendimento',s:'completed',
           instance_id:'tr_811', resolved_supplier:{id:'atendimento',type:'operator',name:'Equipe Atendimento'}, sla_deadline:'20/07/2026 19:42', sla_breached:false, outcome:'completed', outputs:{return_reason:'descricao_divergente',protocol:'DEV-2026-00822'}},
          {name:'Notificação ao Seller', sup:'API Magalu',s:'completed',
           instance_id:'tr_812', resolved_supplier:{id:'api-magalu',type:'webhook',name:'API Magazine Luiza'}, sla_deadline:'20/07/2026 21:42', sla_breached:false, outcome:'notified', outputs:{seller_ticket:'MLU-RET-00822',seller_response:'approved',sla_seller:'48h'}},
          {name:'Análise do Motivo', sup:'Magalu QA',s:'completed',
           instance_id:'tr_813', resolved_supplier:{id:'magalu-qa',type:'operator',name:'QA Magazine Luiza'}, sla_deadline:'21/07/2026 11:42', sla_breached:false, outcome:'coleta_necessaria', outputs:{reason_code:'product_mismatch',approved:true}},
          {name:'Seleção do Canal de Devolução', sup:'Atendimento',s:'completed',
           instance_id:'tr_814', resolved_supplier:{id:'atendimento',type:'operator',name:'Equipe Atendimento'}, sla_deadline:'21/07/2026 13:00', sla_breached:false, outcome:'coleta_domiciliar', outputs:{channel:'carrier_pickup',carrier:'Jadlog',pickup_address:'Rua dos Testes, 100 — São Paulo SP'}},
          {name:'Agendamento de Coleta', sup:'Jadlog',s:'completed',
           instance_id:'tr_815', resolved_supplier:{id:'jadlog',type:'carrier',name:'Jadlog'}, sla_deadline:'22/07/2026 09:00', sla_breached:false, outcome:'scheduled', outputs:{pickup_date:'22/07/2026',pickup_window:'08h–12h',pickup_code:'JDL-COL-00822'}},
          {name:'Geração de Etiqueta Reversa', sup:'Jadlog',s:'completed',
           instance_id:'tr_816', resolved_supplier:{id:'jadlog',type:'carrier',name:'Jadlog'}, sla_deadline:'22/07/2026 08:00', sla_breached:false, outcome:'generated', outputs:{label_url:'https://jadlog.com.br/etiqueta/JDL-REV-00822',reverse_code:'JDL-REV-00822'}},
          {name:'Coleta no Domicílio', sup:'Jadlog',s:'completed',
           instance_id:'tr_817', resolved_supplier:{id:'jadlog',type:'carrier',name:'Jadlog'}, sla_deadline:'22/07/2026 12:00', sla_breached:false, outcome:'collected', outputs:{collected_at:'22/07/2026 10:18',reverse_tracking_code:'JDL-REV-00822'}},
          {name:'Recebimento no CD Magalu', sup:'CD Magalu SP',s:'pending',
           instance_id:'tr_818', resolved_supplier:{id:'magalu-cd-sp',type:'warehouse',name:'CD Magalu SP'}, sla_deadline:'24/07/2026 18:00', sla_breached:true, outcome:null, outputs:null},
          {name:'Inspeção pelo Seller', sup:'Magalu QA',s:'pending',
           instance_id:'tr_819', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Aprovação de Troca pelo Seller', sup:'Magazine Luiza',s:'pending',
           instance_id:'tr_820', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Emissão de Gift Card', sup:'Financeiro',s:'pending',
           instance_id:'tr_821', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Notificação ao Cliente', sup:'Atendimento',s:'pending',
           instance_id:'tr_822', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]
      }
    },

    // ── Item 3: Seguro Boa Vista (serviço digital) ── cancelamento + estorno proporcional ──
    { name:'Seguro Boa Vista — 12 meses', emoji:'🛡️', qty:1, price:'R$ 192,00',
      seller:'Boa Vista Seguros', channel:'Americanas.com',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Adyen', s:'completed',
           instance_id:'ti_820', resolved_supplier:{id:'adyen',type:'gateway',name:'Adyen'}, sla_deadline:'15/07/2026 11:30', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-8200013',amount:192.00}},
          {name:'Captura de Pagamento', sup:'Adyen', s:'completed',
           instance_id:'ti_821', resolved_supplier:{id:'adyen',type:'gateway',name:'Adyen'}, sla_deadline:'15/07/2026 12:30', sla_breached:false, outcome:'captured', outputs:{capture_id:'CAP-8200013',amount:192.00}},
        ]},
        { wfId:'wf-standard', wfName:'Ativação do Serviço', tasks:[
          {name:'Ativação da Apólice', sup:'Boa Vista Seguros',s:'completed',
           instance_id:'ti_822', resolved_supplier:{id:'boa-vista',type:'webhook',name:'Boa Vista Seguros'}, sla_deadline:'15/07/2026 14:00', sla_breached:false, outcome:'activated', outputs:{policy_id:'BVS-2026-00192',policy_url:'https://boavistareg.com.br/apolice/BVS-2026-00192',valid_until:'15/07/2027'}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Emitir NFS-e', sup:'Boa Vista Seguros',s:'completed',
           instance_id:'ti_823', resolved_supplier:{id:'boa-vista',type:'webhook',name:'Boa Vista Seguros'}, sla_deadline:'15/07/2026 15:00', sla_breached:false, outcome:'issued', outputs:{nfse_number:'BVS-NFSE-00192',value:'R$ 192,00'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed',
           instance_id:'ti_824', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'15/07/2026 15:30', sla_breached:false, outcome:'updated', outputs:{}},
        ]},
        { wfId:'wf-delivery', wfName:'Serviço Ativado', tasks:[
          {name:'Apólice Enviada ao Cliente', sup:'Boa Vista Seguros', s:'completed',
           instance_id:'ti_825', resolved_supplier:{id:'boa-vista',type:'webhook',name:'Boa Vista Seguros'}, sla_deadline:'15/07/2026 16:00', sla_breached:false, outcome:'sent', outputs:{sent_at:'15/07/2026 13:58',channel:'email'}},
        ]},
      ],
      secondWorkflow:{
        wfId:'wf-returns', wfName:'Cancelamento — Boa Vista Seguros', triggeredAt:'19/07/2026 09:22',
        triggeredBy:'Shopper',
        channel:'Americanas.com', seller:'Boa Vista Seguros',
        return_reason:'Produto principal devolvido — seguro sem objeto',
        return_channel:'Cancelamento digital',
        financial_resolution:'Estorno proporcional (R$ 96,00 — 4 dias de 8 utilizados)',
        tasks:[
          {name:'Solicitação Recebida', sup:'Atendimento',s:'completed',
           instance_id:'tr_831', resolved_supplier:{id:'atendimento',type:'operator',name:'Equipe Atendimento'}, sla_deadline:'19/07/2026 17:22', sla_breached:false, outcome:'completed', outputs:{return_reason:'produto_principal_devolvido',protocol:'DEV-2026-00831'}},
          {name:'Notificação ao Seller', sup:'API Boa Vista',s:'completed',
           instance_id:'tr_832', resolved_supplier:{id:'api-boa-vista',type:'webhook',name:'API Boa Vista Seguros'}, sla_deadline:'19/07/2026 19:22', sla_breached:false, outcome:'notified', outputs:{seller_ticket:'BVS-CAN-00192',seller_response:'accepted'}},
          {name:'Validação da Apólice', sup:'Boa Vista Seguros',s:'completed',
           instance_id:'tr_833', resolved_supplier:{id:'boa-vista',type:'webhook',name:'Boa Vista Seguros'}, sla_deadline:'20/07/2026 09:22', sla_breached:false, outcome:'reembolso_direto', outputs:{policy_id:'BVS-2026-00192',days_active:4,days_total:365,refund_eligible:true}},
          {name:'Cálculo do Reembolso Proporcional', sup:'Financeiro',s:'completed',
           instance_id:'tr_834', resolved_supplier:{id:'financeiro',type:'system',name:'Sistema Financeiro'}, sla_deadline:'20/07/2026 11:00', sla_breached:false, outcome:'calculated', outputs:{days_active:4,daily_rate:'R$ 0,53',amount_consumed:'R$ 2,10',refund_amount:'R$ 96,00',refund_method:'estorno_cartao'}},
          {name:'Cancelamento da Apólice', sup:'Boa Vista Seguros',s:'pending',
           instance_id:'tr_835', resolved_supplier:{id:'boa-vista',type:'webhook',name:'Boa Vista Seguros'}, sla_deadline:'21/07/2026 11:00', sla_breached:false, outcome:null, outputs:null},
          {name:'Estorno Proporcional', sup:'Adyen',s:'pending',
           instance_id:'tr_836', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
          {name:'Notificação ao Cliente', sup:'Atendimento',s:'pending',
           instance_id:'tr_837', resolved_supplier:null, sla_deadline:null, sla_breached:false, outcome:null, outputs:null},
        ]
      }
    },
  ],

  // ─── João Teste — 1 item — Entrega Domiciliar — processed (entregue) ──────
  '1644907562936-01': [
    { name:'Fritadeira Air Fryer Mondial 12L', emoji:'🍳', qty:1, price:'R$ 549,99',
      pipelines:[
        { wfId:'wf-payments', wfName:'Confirmação de Pagamentos', tasks:[
          {name:'Autorização de Pagamento', sup:'Stark Bank (Pix)', s:'completed',
           instance_id:'ti_750', resolved_supplier:{id:'stark-bank',type:'gateway',name:'Stark Bank S.A.'}, sla_deadline:'07/07/2026 03:12', sla_breached:false, outcome:'authorized', outputs:{authorization_code:'AUTH-576712804',amount:559.90}},
          {name:'Captura de Pagamento', sup:'Stark Bank (Pix)', s:'completed',
           instance_id:'ti_751', resolved_supplier:{id:'stark-bank',type:'gateway',name:'Stark Bank S.A.'}, sla_deadline:'07/07/2026 04:12', sla_breached:false, outcome:'captured', outputs:{pix_tid:'576712804086',vale_tid:'20885381',amount_pix:59.90,amount_vale:500.00}},
        ]},
        { wfId:'wf-standard', wfName:'Preparação dos itens', tasks:[
          {name:'Separação de Itens', sup:'Americanas L029', s:'completed',
           instance_id:'ti_752', resolved_supplier:{id:'americanas-l029',type:'warehouse',name:'Americanas CD L029'}, sla_deadline:'07/07/2026 10:00', sla_breached:false, outcome:'completed', outputs:{warehouse_id:'9801',dock:'1'}},
          {name:'Embalagem', sup:'Americanas L029', s:'completed',
           instance_id:'ti_753', resolved_supplier:{id:'americanas-l029',type:'warehouse',name:'Americanas CD L029'}, sla_deadline:'07/07/2026 12:00', sla_breached:false, outcome:'completed', outputs:{}},
        ]},
        { wfId:'wf-nfe', wfName:'NFe Emitidas', tasks:[
          {name:'Gerar Nota Fiscal', sup:'ERP Americanas', s:'completed',
           instance_id:'ti_754', resolved_supplier:{id:'erp-americanas',type:'system',name:'ERP Americanas'}, sla_deadline:'07/07/2026 13:00', sla_breached:false, outcome:'issued', outputs:{nfe_number:'000140153',nfe_key:'35260700776574022044550040001401531733613722',invoice_value:'R$ 559,90'}},
          {name:'Atualizar Marketplace', sup:'VTEX', s:'completed',
           instance_id:'ti_755', resolved_supplier:{id:'vtex_platform',type:'system',name:'VTEX'}, sla_deadline:'07/07/2026 13:30', sla_breached:false, outcome:'updated', outputs:{}},
        ]},
        { wfId:'wf-delivery', wfName:'Recebido pelo Cliente', tasks:[
          {name:'Código de Rastreio', sup:'Entrega Econômica', s:'completed',
           instance_id:'ti_756', resolved_supplier:{id:'entrega-economica',type:'carrier',name:'Entrega Econômica'}, sla_deadline:'07/07/2026 14:00', sla_breached:false, outcome:'generated', outputs:{tracking_code:'000140153',carrier_url:'https://o2o-delivery.americanas.io/tracking/1644907562936-01'}},
          {name:'Despachado', sup:'Entrega Econômica', s:'completed',
           instance_id:'ti_757', resolved_supplier:{id:'entrega-economica',type:'carrier',name:'Entrega Econômica'}, sla_deadline:'09/07/2026 12:00', sla_breached:false, outcome:'dispatched', outputs:{dispatched_at:'07/07/2026 09:51'}},
          {name:'Entregue', sup:'Entrega Econômica', s:'completed',
           instance_id:'ti_758', resolved_supplier:{id:'entrega-economica',type:'carrier',name:'Entrega Econômica'}, sla_deadline:'13/07/2026 12:00', sla_breached:false, outcome:'delivered',
           outputs:{delivered_at:'10/07/2026 13:27',tracking_code:'000140153'},
           shipping_events:[
             {date:'07/07/2026 09:51', description:'Pedido integrado na Abbiamo com sucesso'},
             {date:'07/07/2026 13:20', description:'Pedido coletado pelo entregador'},
             {date:'07/07/2026 13:22', description:'Iniciando rota de entrega'},
             {date:'10/07/2026 13:27', description:'Pedido entregue'},
           ]},
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
    version: 1,
    tags: ['home_delivery', 'standard'],
    routing_policy_id: 'rp-home-delivery',
    cancellation_policy: { on_compensation_failure: 'escalate' },
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
          { id: 'h-pmt1', name: 'Autorização de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_authorization' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['authorized', 'declined'], outputs: { authorized: { required: ['authorization_code', 'amount'], optional: [] }, declined: { required: ['reason'], optional: [] } }, output_context: ['authorization_code'] },
            checkpoints: [
            { id: 'cp1', label: 'Envio da requisição ao gateway', failAction: 'Retentar em 5min' },
            { id: 'cp2', label: 'Recebimento da autorização', failAction: 'Escalar para análise manual' },
          ]},
          { id: 'h-pmt2', name: 'Captura de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_capture' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['captured', 'failed'], outputs: { captured: { required: ['capture_id', 'amount'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['capture_id'] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparando Itens', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'h-sep1', name: 'Separação de Itens', supplier: 'CD São Paulo', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-cd-regiao', sla_hours: 4, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'release_reservation' }, retry_policy: { max_attempts: 2 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['completed', 'failed'], outputs: { completed: { required: ['warehouse_location'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['warehouse_location'] },
            checkpoints: [
            { id: 'cp1', label: 'Reserva de estoque confirmada', failAction: 'Realocar para outro CD' },
            { id: 'cp2', label: 'Itens fisicamente separados', failAction: 'Acionar gestor de operações' },
            { id: 'cp3', label: 'Etiqueta impressa', failAction: 'Reimprimir etiqueta' },
          ]},
          { id: 'h-conf1', name: 'Conferência de Qualidade', supplier: 'QA Team', category: 'Eletrônicos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 2, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['approved', 'rejected'], outputs: { approved: { required: [], optional: ['notes'] }, rejected: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
          { id: 'h-emb1', name: 'Embalagem', supplier: 'CD São Paulo', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-cd-regiao', sla_hours: 3, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['completed', 'failed'], outputs: { completed: { required: [], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-nfe', name: 'NFes Emitidas', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'h-nfe1', name: 'Gerar Nota Fiscal', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: { url: 'https://api.nfe.io/v1/nota', method: 'POST', responseMapping: [{ key: 'nf_numero', path: 'data.number' }, { key: 'nf_chave', path: 'data.accessKey' }] }, mcpConfig: null, agentConfig: null, contextOutput: ['api_nfe.nf_numero', 'api_nfe.nf_chave'],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 2, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['issued', 'failed'], outputs: { issued: { required: ['nfe_key', 'nfe_number'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['nfe_key', 'nfe_number'] },
            checkpoints: [
            { id: 'cp1', label: 'Dados fiscais validados', failAction: 'Corrigir dados do pedido' },
            { id: 'cp2', label: 'NF-e autorizada pela SEFAZ', failAction: 'Reenviar ou acionar fiscal' },
          ]},
          { id: 'h-nfe2', name: 'Atualizar Marketplace', supplier: 'VTEX', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['updated', 'failed'], outputs: { updated: { required: [], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Recebido pelo Cliente', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'h-del1', name: 'Código de Rastreio', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-transportadora', sla_hours: 4, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['generated', 'failed'], outputs: { generated: { required: ['tracking_code', 'carrier_url'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['tracking_code'] },
            checkpoints: [
            { id: 'cp1', label: 'Código de rastreio gerado', failAction: 'Solicitar código via Intelipost' },
            { id: 'cp2', label: 'Código enviado ao cliente', failAction: 'Reenviar notificação' },
          ]},
          { id: 'h-del2', name: 'Despachado', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-transportadora', sla_hours: 48, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['dispatched', 'failed'], outputs: { dispatched: { required: ['dispatched_at'], optional: ['protocol_number'] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
          { id: 'h-del3', name: 'Entregue', supplier: 'Transportadora XYZ', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-transportadora', sla_hours: 168, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false,
            compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['delivered', 'failed'], outputs: { delivered: { required: ['delivered_at'], optional: ['signature'] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
    ]
  },

  // ── 2. Retirada na loja (BOPIS) ──────────────────────────────
  {
    id: 'oj-bopis', name: 'Retirada na loja', icon: '🏪', color: '#7c3aed',
    orderCount: 312, archived: false,
    version: 1,
    tags: ['pickup_in_store', 'bopis'],
    routing_policy_id: 'rp-bopis',
    cancellation_policy: { on_compensation_failure: 'escalate' },
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
          { id: 'b-pmt1', name: 'Autorização de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_authorization' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['authorized', 'declined'], outputs: { authorized: { required: ['authorization_code', 'amount'], optional: [] }, declined: { required: ['reason'], optional: [] } }, output_context: ['authorization_code'] },
            checkpoints: [
            { id: 'cp1', label: 'Envio da requisição ao gateway', failAction: 'Retentar em 5min' },
            { id: 'cp2', label: 'Recebimento da autorização', failAction: 'Escalar para análise manual' },
          ]},
          { id: 'b-pmt2', name: 'Captura de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_capture' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['captured', 'failed'], outputs: { captured: { required: ['capture_id', 'amount'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['capture_id'] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparando Itens', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'b-sep1', name: 'Separação de Itens', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-cd-regiao', sla_hours: 4, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'operator', payload_template: { action: 'release_reservation' }, retry_policy: { max_attempts: 2 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['completed', 'failed'], outputs: { completed: { required: ['store_location'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['store_location'] },
            checkpoints: [
            { id: 'cp1', label: 'Itens localizados no estoque da loja', failAction: 'Verificar outro ponto de venda' },
            { id: 'cp2', label: 'Itens fisicamente separados', failAction: 'Acionar gerente da loja' },
          ]},
          { id: 'b-conf1', name: 'Conferência de Qualidade', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 2, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['approved', 'rejected'], outputs: { approved: { required: [], optional: [] }, rejected: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
          { id: 'b-notif1', name: 'Notificação ao Cliente', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['sent', 'failed'], outputs: { sent: { required: ['channel', 'notified_at'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [
            { id: 'cp1', label: 'SMS/E-mail de disponibilidade enviado', failAction: 'Reenviar notificação' },
          ]},
        ]
      },
      {
        id: 'wf-nfe', name: 'NFes Emitidas', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'b-nfe1', name: 'Gerar Nota Fiscal', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 2, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['issued', 'failed'], outputs: { issued: { required: ['nfe_key', 'nfe_number'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['nfe_key', 'nfe_number'] },
            checkpoints: [
            { id: 'cp1', label: 'Dados fiscais validados', failAction: 'Corrigir dados do pedido' },
            { id: 'cp2', label: 'NF-e autorizada pela SEFAZ', failAction: 'Acionar fiscal' },
          ]},
          { id: 'b-nfe2', name: 'Atualizar Marketplace', supplier: 'VTEX', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['updated', 'failed'], outputs: { updated: { required: [], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Recebido pelo Cliente', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'b-avail1', name: 'Disponível na Loja', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-cd-regiao', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['available', 'unavailable'], outputs: { available: { required: ['pickup_deadline'], optional: [] }, unavailable: { required: ['reason'], optional: [] } }, output_context: ['pickup_deadline'] },
            checkpoints: [
            { id: 'cp1', label: 'Item posicionado no balcão de retiradas', failAction: 'Reposicionar item' },
          ]},
          { id: 'b-pickup1', name: 'Retirada Confirmada', supplier: 'Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 72, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['confirmed', 'not_collected'], outputs: { confirmed: { required: ['collected_at'], optional: ['signature'] }, not_collected: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [
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
    version: 1,
    tags: ['digital', 'virtual'],
    routing_policy_id: 'rp-digital',
    cancellation_policy: { on_compensation_failure: 'escalate' },
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
          { id: 'd-pmt1', name: 'Autorização de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_authorization' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['authorized', 'declined'], outputs: { authorized: { required: ['authorization_code', 'amount'], optional: [] }, declined: { required: ['reason'], optional: [] } }, output_context: ['authorization_code'] },
            checkpoints: [
            { id: 'cp1', label: 'Envio da requisição ao gateway', failAction: 'Retentar em 5min' },
            { id: 'cp2', label: 'Recebimento da autorização', failAction: 'Escalar para análise manual' },
          ]},
          { id: 'd-pmt2', name: 'Captura de Pagamento', supplier: 'Gateway Pagamento', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_capture' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['captured', 'failed'], outputs: { captured: { required: ['capture_id', 'amount'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['capture_id'] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparando Itens', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'd-gen1', name: 'Geração do Produto Digital', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'revoke_license' }, retry_policy: { max_attempts: 3 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['generated', 'failed'], outputs: { generated: { required: ['license_key', 'product_id'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['license_key'] },
            checkpoints: [
            { id: 'cp1', label: 'Licença ou código de ativação gerado', failAction: 'Reprocessar geração' },
            { id: 'cp2', label: 'Produto vinculado ao pedido', failAction: 'Verificar integração' },
          ]},
          { id: 'd-val1', name: 'Validação de Licença', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['valid', 'invalid'], outputs: { valid: { required: [], optional: [] }, invalid: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [
            { id: 'cp1', label: 'Licença única e não duplicada', failAction: 'Gerar nova licença' },
          ]},
          { id: 'd-send1', name: 'Envio por E-mail', supplier: 'CRM', category: 'Digital', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 2, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['sent', 'failed'], outputs: { sent: { required: ['email_id', 'delivered_at'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['email_id'] },
            checkpoints: [
            { id: 'cp1', label: 'E-mail entregue sem bounce', failAction: 'Tentar canal alternativo (SMS/WhatsApp)' },
          ]},
        ]
      },
      {
        id: 'wf-nfe', name: 'NFes Emitidas', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'd-nfe1', name: 'Gerar Nota Fiscal', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 2, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['issued', 'failed'], outputs: { issued: { required: ['nfe_key', 'nfe_number'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['nfe_key', 'nfe_number'] },
            checkpoints: [
            { id: 'cp1', label: 'NF-e de serviço emitida', failAction: 'Acionar fiscal' },
          ]},
          { id: 'd-nfe2', name: 'Atualizar Marketplace', supplier: 'VTEX', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['updated', 'failed'], outputs: { updated: { required: [], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Recebido pelo Cliente', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'd-conf1', name: 'Confirmação de Entrega', supplier: 'CRM', category: 'Digital', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 48, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['opened', 'not_opened'], outputs: { opened: { required: ['opened_at'], optional: [] }, not_opened: { required: [], optional: [] } }, output_context: [] },
            checkpoints: [
            { id: 'cp1', label: 'Cliente abriu o e-mail de entrega', failAction: 'Reenviar após 24h' },
          ]},
          { id: 'd-acc1', name: 'Acesso Verificado', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 72, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['verified', 'not_verified'], outputs: { verified: { required: ['first_access_at'], optional: [] }, not_verified: { required: [], optional: [] } }, output_context: [] },
            checkpoints: [
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
    version: 1,
    tags: ['return', 'exchange', 'reverse_logistics'],
    routing_policy_id: 'rp-returns',
    cancellation_policy: { on_compensation_failure: 'terminate' },
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
          { id: 'r1_0', name: 'Solicitação Recebida', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 8, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['order.id', 'order.items'], optional: ['customer.contact'] }, allowed_outcomes: ['completed', 'rejected'], outputs: { completed: { required: ['return_reason', 'protocol'], optional: ['customer_notes'] }, rejected: { required: ['reason'], optional: [] } }, output_context: ['return_reason', 'protocol'] },
            checkpoints: [] },
          { id: 'r1_2', name: 'Notificação ao Seller', supplier: 'ERP / API Seller', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-seller', sla_hours: 4, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['protocol', 'return_reason', 'seller.id'], optional: [] }, allowed_outcomes: ['notified', 'failed'], outputs: { notified: { required: ['seller_ticket', 'seller_response'], optional: ['sla_seller'] }, failed: { required: ['reason'], optional: [] } }, output_context: ['seller_ticket', 'seller_response'] },
            routing_rules: [{ condition: "order.seller_type == '1P'", skip: true }],
            checkpoints: [] },
          { id: 'r1_1', name: 'Análise do Motivo', supplier: 'QA Team', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['return_reason'], optional: ['seller_response', 'customer_notes'] }, allowed_outcomes: ['coleta_necessaria', 'reembolso_direto', 'cancelamento_digital', 'reprovado'], outputs: { coleta_necessaria: { required: ['reason_code', 'approved'], optional: [] }, reembolso_direto: { required: ['reason_code', 'approved'], optional: [] }, cancelamento_digital: { required: ['reason_code', 'approved'], optional: [] }, reprovado: { required: ['reason'], optional: [] } }, output_context: ['reason_code'], on_outcome: { coleta_necessaria: { next_stage: 'r-coleta' }, reembolso_direto: { next_stage: 'r-resolv' }, cancelamento_digital: { next_stage: 'r-resolv' }, reprovado: { next_stage: null } } },
            checkpoints: [] },
          { id: 'r1_3', name: 'Seleção do Canal de Devolução', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 4, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['reason_code', 'order.logistics_type'], optional: [] }, allowed_outcomes: ['loja_fisica', 'coleta_domiciliar', 'ponto_parceiro'], outputs: { loja_fisica: { required: ['channel', 'store'], optional: [] }, coleta_domiciliar: { required: ['channel', 'carrier', 'pickup_address'], optional: [] }, ponto_parceiro: { required: ['channel', 'partner_id', 'partner_address'], optional: [] } }, output_context: ['channel'] },
            routing_rules: [{ condition: "reason_code == 'cancelamento_digital'", skip: true }],
            checkpoints: [] },
        ]
      },
      {
        id: 'r-coleta', name: 'Coleta', icon: '🔄', color: '#0891b2',
        tasks: [
          { id: 'r2_0', name: 'Agendamento de Coleta', supplier: 'Transportadora', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-transportadora', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'webhook', payload_template: { action: 'cancel_pickup_schedule' }, retry_policy: { max_attempts: 2 } },
            contract: { outcome_field: 'outcome', inputs: { required: ['channel', 'pickup_address'], optional: [] }, allowed_outcomes: ['scheduled', 'failed'], outputs: { scheduled: { required: ['pickup_date', 'pickup_window', 'pickup_code'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['pickup_code'] },
            routing_rules: [{ condition: "channel == 'loja_fisica' || channel == 'ponto_parceiro'", skip: true }],
            checkpoints: [] },
          { id: 'r2_2', name: 'Geração de Etiqueta Reversa', supplier: 'Transportadora', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-transportadora', sla_hours: 8, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['pickup_code'], optional: [] }, allowed_outcomes: ['generated', 'failed'], outputs: { generated: { required: ['label_url', 'reverse_code'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['reverse_code', 'label_url'] },
            routing_rules: [{ condition: "channel == 'loja_fisica'", skip: true }],
            checkpoints: [] },
          { id: 'r2_1', name: 'Coleta / Entrega no Destino', supplier: 'Transportadora', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-transportadora', sla_hours: 72, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['channel'], optional: ['pickup_code', 'reverse_code'] }, allowed_outcomes: ['collected', 'received_at_store', 'failed'], outputs: { collected: { required: ['collected_at', 'reverse_tracking_code'], optional: [] }, received_at_store: { required: ['received_at', 'store_protocol'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['reverse_tracking_code', 'store_protocol'] },
            checkpoints: [] },
          { id: 'r2_3', name: 'Recebimento no Destino (CD/Loja)', supplier: 'CD / Loja', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-cd-regiao', sla_hours: 48, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['reverse_tracking_code'], optional: ['store_protocol'] }, allowed_outcomes: ['received', 'rejected'], outputs: { received: { required: ['received_at', 'condition'], optional: ['internal_protocol'] }, rejected: { required: ['reason'], optional: [] } }, output_context: ['condition', 'received_at'] },
            checkpoints: [] },
        ]
      },
      {
        id: 'r-insp', name: 'Inspeção', icon: '🔍', color: '#6366f1',
        tasks: [
          { id: 'r3_0', name: 'Recebimento no CD', supplier: 'CD São Paulo', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-cd-regiao', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['received', 'rejected'], outputs: { received: { required: ['received_at', 'condition'], optional: [] }, rejected: { required: ['reason'], optional: [] } }, output_context: ['condition'] },
            checkpoints: [] },
          { id: 'r3_1', name: 'Inspeção de Qualidade', supplier: 'QA Team', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['approved', 'rejected'], outputs: { approved: { required: ['inspection_result'], optional: [] }, rejected: { required: ['reason'], optional: [] } }, output_context: ['inspection_result'] },
            checkpoints: [] },
          { id: 'r3_2', name: 'Aprovação pelo Seller (3P)', supplier: 'Seller', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-seller', sla_hours: 48, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['inspection_result', 'seller_ticket'], optional: [] }, allowed_outcomes: ['approved', 'rejected', 'replacement_offered'], outputs: { approved: { required: ['seller_decision'], optional: [] }, rejected: { required: ['reason'], optional: [] }, replacement_offered: { required: ['seller_decision', 'replacement_sku'], optional: [] } }, output_context: ['seller_decision'] },
            routing_rules: [{ condition: "order.seller_type == '1P'", skip: true }],
            checkpoints: [] },
        ]
      },
      {
        id: 'r-resolv', name: 'Resolução', icon: '✅', color: '#059669',
        tasks: [
          { id: 'r4_0', name: 'Estorno / Reembolso no Cartão', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 48, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['inspection_result'], optional: ['refund_amount', 'refund_method'] }, allowed_outcomes: ['refunded', 'failed'], outputs: { refunded: { required: ['refund_amount', 'refund_at', 'refund_method'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['refund_amount', 'refund_method'] },
            routing_rules: [{ condition: "seller_decision == 'gift_card' || seller_decision == 'replacement' || reason_code == 'cancelamento_digital'", skip: true }],
            checkpoints: [] },
          { id: 'r4_1', name: 'Emissão de Gift Card', supplier: 'Financeiro', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-pagamento', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['seller_decision', 'inspection_result'], optional: ['refund_amount'] }, allowed_outcomes: ['gift_card_issued', 'failed'], outputs: { gift_card_issued: { required: ['gift_card_code', 'gift_card_value', 'issued_at'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['gift_card_code', 'gift_card_value'] },
            routing_rules: [{ condition: "seller_decision != 'gift_card'", skip: true }],
            checkpoints: [] },
          { id: 'r4_2', name: 'Substituição do Produto', supplier: 'CD / Loja', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-seller', sla_hours: 48, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['seller_decision', 'replacement_sku'], optional: [] }, allowed_outcomes: ['replacement_dispatched', 'failed'], outputs: { replacement_dispatched: { required: ['new_order_id', 'tracking_code'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['new_order_id'] },
            routing_rules: [{ condition: "seller_decision != 'replacement'", skip: true }],
            checkpoints: [] },
          { id: 'r4_3', name: 'Cancelamento de Apólice / Serviço', supplier: 'Seller / Parceiro', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-seller', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['reason_code', 'seller_ticket'], optional: ['policy_id', 'days_active', 'refund_amount'] }, allowed_outcomes: ['cancelled', 'failed'], outputs: { cancelled: { required: ['cancelled_at'], optional: ['partial_refund_amount', 'refund_method'] }, failed: { required: ['reason'], optional: [] } }, output_context: ['cancelled_at', 'partial_refund_amount'] },
            routing_rules: [{ condition: "reason_code != 'cancelamento_digital'", skip: true }],
            checkpoints: [] },
          { id: 'r4_4', name: 'Notificação ao Cliente', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 4, is_blocking: false, on_sla_breach: 'log', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', inputs: { required: ['resolution_type'], optional: ['refund_amount', 'gift_card_code', 'new_order_id', 'cancelled_at'] }, allowed_outcomes: ['sent', 'failed'], outputs: { sent: { required: ['channel', 'sent_at'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
    ]
  },

  // ── 4. Agenda Serviço Instalação ─────────────────────────────────────────
  {
    id: 'oj-agenda-servico', name: 'Agenda Serviço Instalação', icon: '📅', color: '#0891b2',
    orderCount: 0, archived: false,
    version: 1,
    tags: ['service', 'scheduling'],
    routing_policy_id: null,
    cancellation_policy: { on_compensation_failure: 'escalate' },
    description: 'Fluxo de agendamento para serviços de instalação — confirmação com técnico e notificação ao cliente',
    edges: [
      { id: 'as-e1', from: 'as-agendamento', to: 'as-confirmacao', active: true },
      { id: 'as-e2', from: 'as-confirmacao', to: 'as-lembrete', active: true },
    ],
    marcos: [
      {
        id: 'as-agendamento', name: 'Agendamento', icon: '🗓️', color: '#0891b2',
        tasks: [
          { id: 'as1_0', name: 'Agendamento com Técnico', supplier: 'Equipe de Instalação', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'operator', payload_template: { action: 'cancel_appointment' }, retry_policy: { max_attempts: 2 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['scheduled', 'failed'], outputs: { scheduled: { required: ['appointment_date', 'technician_id'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: ['appointment_date'] },
            checkpoints: [] },
        ]
      },
      {
        id: 'as-confirmacao', name: 'Confirmação', icon: '✅', color: '#059669',
        tasks: [
          { id: 'as2_0', name: 'Confirmação do Cliente', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 48, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['confirmed', 'cancelled'], outputs: { confirmed: { required: ['confirmed_at'], optional: [] }, cancelled: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
      {
        id: 'as-lembrete', name: 'Lembrete', icon: '🔔', color: '#d97706',
        tasks: [
          { id: 'as3_0', name: 'Lembrete D-1', supplier: 'Sistema Notificações', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'webhook', supplier_resolution_policy_id: 'srp-self', sla_hours: 1, is_blocking: false, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['sent', 'failed'], outputs: { sent: { required: ['channel', 'sent_at'], optional: [] }, failed: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
    ]
  },

  // ── 5. Serviço Instalação Executada ──────────────────────────────────────
  {
    id: 'oj-servico-executado', name: 'Serviço Instalação Executada', icon: '🔧', color: '#7c3aed',
    orderCount: 0, archived: false,
    version: 1,
    tags: ['service', 'execution'],
    routing_policy_id: null,
    cancellation_policy: { on_compensation_failure: 'escalate' },
    description: 'Fluxo de execução do serviço de instalação em campo — técnico no local até aceite final do cliente',
    edges: [
      { id: 'se-e1', from: 'se-execucao', to: 'se-conclusao', active: true },
      { id: 'se-e2', from: 'se-conclusao', to: 'se-aceite', active: true },
    ],
    marcos: [
      {
        id: 'se-execucao', name: 'Execução', icon: '🔨', color: '#7c3aed',
        tasks: [
          { id: 'se1_0', name: 'Técnico no Local', supplier: 'Equipe de Instalação', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 4, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: true,
            compensation_action: { type: 'operator', payload_template: { action: 'recall_technician' }, retry_policy: { max_attempts: 1 } },
            contract: { outcome_field: 'outcome', allowed_outcomes: ['arrived', 'not_arrived'], outputs: { arrived: { required: ['arrived_at', 'technician_id'], optional: [] }, not_arrived: { required: ['reason'], optional: [] } }, output_context: [] },
            checkpoints: [] },
        ]
      },
      {
        id: 'se-conclusao', name: 'Conclusão', icon: '🏁', color: '#0891b2',
        tasks: [
          { id: 'se2_0', name: 'Instalação Concluída', supplier: 'Equipe de Instalação', category: 'Todos', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 8, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'block', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['completed', 'failed'], outputs: { completed: { required: ['completed_at', 'service_report_id'], optional: [] }, failed: { required: ['reason', 'next_steps'], optional: [] } }, output_context: ['service_report_id'] },
            checkpoints: [] },
        ]
      },
      {
        id: 'se-aceite', name: 'Aceite', icon: '✅', color: '#059669',
        tasks: [
          { id: 'se3_0', name: 'Aceite do Cliente', supplier: 'Atendimento', category: 'Todos', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [],
            executor_type: 'operator', supplier_resolution_policy_id: 'srp-self', sla_hours: 24, is_blocking: true, on_sla_breach: 'escalate', on_payload_error: 'escalate', cancellable: false, compensation_action: null,
            contract: { outcome_field: 'outcome', allowed_outcomes: ['accepted', 'disputed'], outputs: { accepted: { required: ['signature', 'accepted_at'], optional: [] }, disputed: { required: ['dispute_reason'], optional: [] } }, output_context: ['signature'] },
            checkpoints: [] },
        ]
      },
    ]
  },
];

// ── Auto-compute on_outcome for every task ───────────────────────────────────
// Rules:
//   • If task.contract.on_outcome is already explicit → preserve it (e.g. r1_1)
//   • Last task in a stage + edge exists → primary outcome routes to next stage
//   • Every other outcome, and all outcomes on non-last tasks → next_stage: null
WORKFLOW_DEFS.forEach(wf => {
  const edgeMap = {};
  (wf.edges || []).forEach(e => { edgeMap[e.from] = e.to; });

  (wf.marcos || []).forEach(marco => {
    const tasks = marco.tasks || [];
    const nextStageId = edgeMap[marco.id] || null;

    tasks.forEach((task, idx) => {
      if (!task.contract) return;
      if (task.contract.on_outcome) return; // already explicit
      const outcomes = task.contract.allowed_outcomes || [];
      if (!outcomes.length) return;

      const isLast = idx === tasks.length - 1;
      const on_outcome = {};
      outcomes.forEach((outcome, oi) => {
        // Primary (first) outcome of the last task in a stage → advance to next stage
        on_outcome[outcome] = { next_stage: (isLast && oi === 0 && nextStageId) ? nextStageId : null };
      });
      task.contract.on_outcome = on_outcome;
    });
  });
});

// Stamp each task with its original group reference (badge stays fixed after reorder)
WORKFLOW_DEFS.forEach(wf => {
  (wf.marcos || []).forEach(marco => {
    (marco.tasks || []).forEach(task => {
      if (!task._group) task._group = { id: marco.id, name: marco.name, color: marco.color };
    });
  });
});

// Default inputs for any contract that doesn't declare them explicitly
WORKFLOW_DEFS.forEach(wf => {
  (wf.marcos || []).forEach(marco => {
    (marco.tasks || []).forEach(task => {
      if (!task.contract) return;
      if (!task.contract.inputs) task.contract.inputs = { required: [], optional: [] };
      // Ensure outputs map exists for every allowed_outcome
      if (!task.contract.outputs) task.contract.outputs = {};
      (task.contract.allowed_outcomes || []).forEach(o => {
        if (!task.contract.outputs[o]) task.contract.outputs[o] = { required: [], optional: [] };
      });
    });
  });
});

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

if (typeof module !== 'undefined') {
  module.exports = {
    STATUS_CFG,
    ORDERS,
    ORDER_ITEMS,
    WORKFLOW_DEFS,
    SUPPLIER_RESOLUTION_POLICIES,
    ROUTING_POLICIES,
    TASK_SLOT_MAP,
    TASK_FUNCTION_MAP,
    CONNECTOR_CATALOG,
    CONNECTOR_BINDINGS,
    SKILL_CATALOG,
    INTELIPOST_EVENTS,
    getMockIntelipostResponse,
    MOCK_CONNECTOR_RESPONSES,
  };
}
