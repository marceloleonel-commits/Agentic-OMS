/* ================================================================
   prototype-gtj-data.js
   Dados de configuração e sample data alinhados com a arquitetura
   do spec: oms.OrderJob · Gates · Connections · Dispatcher
   ================================================================ */

/* ── FULFILLMENT MODES ──────────────────────────────────────────── */
const FULFILLMENT_MODES = {
  home_delivery:       { label: 'Entrega em domicílio', icon: '🏠', css: 'mode-home' },
  pickup_in_store:     { label: 'Retirada na loja',     icon: '🏪', css: 'mode-store' },
  digital:             { label: 'Entrega digital',       icon: '📱', css: 'mode-digital' },
  delivery_from_store: { label: 'Entrega pela loja',     icon: '🏬', css: 'mode-dfs' },
};

/* ── GATES — declarados no content type oms.OrderJob ───────────── */
/* Fonte: applications/oms/content-types/orderjob/definition.md    */
const GATES = [
  /* ---- Fluxo normal ---- */
  {
    id: 'deliverable_ready',
    label: 'Entregável Pronto',
    icon: '📦',
    path: 'happy',
    description: 'Entregável está no próximo ponto de handoff: separado, staged ou gerado.',
    cleared_by: {
      warehouse_x:   'packed          (home_delivery)',
      store_x:       'packed | staged (pickup_in_store / delivery_from_store)',
      entitlement_x: 'provisioned     (digital)',
    },
    awaited_by: null,
    depends_on: null,
    kind: null,
  },
  {
    id: 'customer_has_goods',
    label: 'Cliente Recebeu',
    icon: '✅',
    path: 'happy',
    description: 'Cliente recebeu o entregável, por qualquer canal.',
    cleared_by: {
      carrier_x:     'delivered     (home_delivery / delivery_from_store)',
      store_x:       'handed_off    (pickup_in_store)',
      entitlement_x: 'access_granted (digital)',
    },
    awaited_by: null,
    depends_on: null,
    kind: null,
  },
  {
    id: 'payment_settled',
    label: 'Pagamento Liquidado',
    icon: '💰',
    path: 'happy',
    description: 'Fundos compensados no processador de pagamento (Adyen).',
    cleared_by: {
      payment_processor: 'captured',
    },
    awaited_by: null,
    depends_on: null,
    kind: null,
  },
  {
    id: 'revenue_complete',
    label: 'Receita Completa',
    icon: '🎉',
    path: 'happy',
    description: 'Entregue e pago — seguro para emitir NF-e e reportar ao marketplace.',
    cleared_by: null,
    awaited_by: {
      invoice_system: 'emit_invoice',
      marketplace_x:  'report_fulfillment',
    },
    depends_on: ['customer_has_goods', 'payment_settled'],
    kind: null,
    compound: true,
  },

  /* ---- Fluxo de cancelamento ---- */
  {
    id: 'cancellation_requested',
    label: 'Cancelamento Solicitado',
    icon: '🚫',
    path: 'cancel',
    description: 'Sinal de cancelamento recebido de qualquer origem (cliente, merchant, timer de SLA, fraude).',
    cleared_by: {
      store_x: 'pickup_expired  (applies_when: pickup_in_store)',
    },
    awaited_by: null,
    depends_on: null,
    kind: 'cancel_trigger',
    note: 'Quando liberado, o dispatcher entra em modo cancelamento (DA-CANCEL-001). Sintetiza awaited_by em todas as funções kind:"cancel" dos conectores (CP-GATE-009).',
  },
  {
    id: 'customer_notified_of_cancellation',
    label: 'Cliente Notificado',
    icon: '📨',
    path: 'cancel',
    description: 'Cliente foi informado do cancelamento.',
    cleared_by: {
      notification_x: 'cancellation_sent',
    },
    awaited_by: null,
    depends_on: null,
    kind: null,
  },
  {
    id: 'cancellation_complete',
    label: 'Cancelamento Completo',
    icon: '🔒',
    path: 'cancel',
    description: 'Cancelamento liquidado em fulfillment, pagamento e comunicação ao cliente.',
    cleared_by: null,
    awaited_by: null,
    depends_on: ['all_cancellables_rolled_back', 'customer_notified_of_cancellation'],
    kind: null,
    compound: true,
    synthesized_note: 'all_cancellables_rolled_back é sintetizado pela plataforma (CP-GATE-010) a partir dos estados kind:"rolled_back" de cada conector.',
  },
];

/* ── CONNECTIONS — connections do oms.OrderJob ──────────────────── */
/* Fonte: applications/oms/content-types/orderjob/definition.md    */
const CONNECTIONS = [
  {
    id: 'payment_processor',
    label: 'Adyen',
    role: 'Processador de Pagamento',
    icon: '💳',
    applies_when: 'all',
    states: ['pending', 'authorized', 'captured', 'refunded', 'failed', 'reversed'],
    stateStyle: {
      pending:    'cs-gray',
      authorized: 'cs-blue',
      captured:   'cs-green',
      refunded:   'cs-orange',
      failed:     'cs-red',
      reversed:   'cs-orange',
    },
  },
  {
    id: 'warehouse_x',
    label: 'WMS',
    role: 'Separação (Estoque Central)',
    icon: '🏭',
    applies_when: 'home_delivery',
    states: ['awaiting', 'picking', 'packed', 'cancelled'],
    stateStyle: {
      awaiting:  'cs-gray',
      picking:   'cs-blue',
      packed:    'cs-green',
      cancelled: 'cs-red',
    },
  },
  {
    id: 'store_x',
    label: 'Loja',
    role: 'Loja Física',
    icon: '🏪',
    applies_when: 'pickup_in_store, delivery_from_store',
    states: ['awaiting', 'picking', 'packed', 'staged', 'handed_off', 'pickup_expired', 'cancelled'],
    stateStyle: {
      awaiting:       'cs-gray',
      picking:        'cs-blue',
      packed:         'cs-green',
      staged:         'cs-teal',
      handed_off:     'cs-green',
      pickup_expired: 'cs-red',
      cancelled:      'cs-red',
    },
  },
  {
    id: 'entitlement_x',
    label: 'Entitlement',
    role: 'Entrega Digital',
    icon: '📱',
    applies_when: 'digital',
    states: ['pending', 'provisioned', 'access_granted', 'revoked'],
    stateStyle: {
      pending:       'cs-gray',
      provisioned:   'cs-blue',
      access_granted:'cs-green',
      revoked:       'cs-red',
    },
  },
  {
    id: 'carrier_x',
    label: 'Transportadora',
    role: 'Logística de Entrega',
    icon: '🚚',
    applies_when: 'home_delivery, delivery_from_store',
    states: ['pending', 'picked_up', 'in_transit', 'delivered', 'returned'],
    stateStyle: {
      pending:   'cs-gray',
      picked_up: 'cs-blue',
      in_transit:'cs-yellow',
      delivered: 'cs-green',
      returned:  'cs-orange',
    },
  },
  {
    id: 'notification_x',
    label: 'Notificação',
    role: 'Comunicação ao Cliente',
    icon: '📧',
    applies_when: 'all',
    states: ['pending', 'order_confirmed_sent', 'shipped_sent', 'delivered_sent', 'cancellation_sent'],
    stateStyle: {
      pending:                'cs-gray',
      order_confirmed_sent:   'cs-green',
      shipped_sent:           'cs-green',
      delivered_sent:         'cs-green',
      cancellation_sent:      'cs-orange',
    },
  },
  {
    id: 'invoice_system',
    label: 'Sistema Fiscal',
    role: 'Emissão de NF-e',
    icon: '🧾',
    applies_when: 'all',
    states: ['pending', 'emitted', 'cancelled'],
    stateStyle: {
      pending:   'cs-gray',
      emitted:   'cs-green',
      cancelled: 'cs-red',
    },
  },
  {
    id: 'marketplace_x',
    label: 'Mercado Livre',
    role: 'Marketplace',
    icon: '🛍️',
    applies_when: 'when marketplace connection present',
    states: ['pending', 'acknowledged', 'fulfilled', 'reported'],
    stateStyle: {
      pending:      'cs-gray',
      acknowledged: 'cs-blue',
      fulfilled:    'cs-green',
      reported:     'cs-green',
    },
  },
];

/* helpers */
const connById   = id => CONNECTIONS.find(c => c.id === id);
const gateById   = id => GATES.find(g => g.id === id);
const modeConfig = id => FULFILLMENT_MODES[id] || { label: id, icon: '?', css: '' };

/* Retorna as connections aplicáveis para cada modo */
const CONNECTIONS_BY_MODE = {
  home_delivery:       ['payment_processor','warehouse_x','carrier_x','notification_x','invoice_system','marketplace_x'],
  pickup_in_store:     ['payment_processor','store_x','notification_x','invoice_system'],
  digital:             ['payment_processor','entitlement_x','notification_x','invoice_system'],
  delivery_from_store: ['payment_processor','store_x','carrier_x','notification_x','invoice_system'],
};

/* ── DISPATCHER CONFIG ── oms-dispatcher ───────────────────────── */
const DISPATCHER_CONFIG = {
  identity: {
    name:   'oms-dispatcher',
    role:   'Orquestrador por OrderJob — coordena providers via gates para oms.OrderJob entries.',
    goal:   'Avançar cada OrderJob até revenue_complete (fluxo normal) ou cancellation_complete (cancelamento).',
    model:  'claude-sonnet-4-6',
    system_prompt: 'Você é o dispatcher do oms.OrderJob. Monitore os gates e coordene os providers conectados. Avance gates automaticamente quando as condições estão satisfeitas. Crie Tasks para operadores quando a confiança estiver abaixo do threshold ou o OrderJob estiver travado além do SLA.',
  },
  skills: [
    { id: 'detect-stuck-order-job',       name: 'detect-stuck-order-job',       desc: 'Detecta OrderJobs sem progressão de gate além do SLA configurado.',              enabled: true  },
    { id: 'suggest-provider-reallocation',name: 'suggest-provider-reallocation', desc: 'Sugere troca de WMS/loja quando o provider atual não pode atender o pedido.',    enabled: true  },
    { id: 'advance-gate-automatically',   name: 'advance-gate-automatically',    desc: 'Avança o gate pending quando todas as condições de cleared_by foram satisfeitas.', enabled: true  },
    { id: 'create-operator-task',         name: 'create-operator-task',          desc: 'Cria Task para operador humano quando confiança < threshold ou OJ está travado.', enabled: true  },
    { id: 'request-cancellation',         name: 'request-cancellation',          desc: 'Sinaliza cancellation_requested gate mediante regra de negócio ou instrução.',    enabled: false },
  ],
  subAgents: [
    { id: 'routing',                name: 'routing',                desc: 'Determina o fulfillment_mode e o provider_set do OrderJob a partir dos itens e do estoque disponível.',    active: true  },
    { id: 'workflow-orchestration', name: 'workflow-orchestration', desc: 'Caminha o gate graph, avança gates satisfeitos e coordena as funções awaited_by nos providers.',          active: true  },
    { id: 'escalation',             name: 'escalation',             desc: 'Monitora SLA por gate, cria Tasks para operadores e notifica canais configurados quando necessário.',      active: true  },
  ],
  connectors: [
    { id: 'payment_processor', label: 'Adyen',           role: 'Pagamento',       health: 'ok',   status: 'Operacional' },
    { id: 'warehouse_x',       label: 'WMS',             role: 'Separação',       health: 'ok',   status: 'Operacional' },
    { id: 'store_x',           label: 'Loja',            role: 'Loja Física',     health: 'ok',   status: 'Operacional' },
    { id: 'entitlement_x',     label: 'Entitlement',     role: 'Digital',         health: 'ok',   status: 'Operacional' },
    { id: 'carrier_x',         label: 'Transportadora',  role: 'Logística',       health: 'warn', status: '2 entregas atrasadas' },
    { id: 'notification_x',    label: 'Notificação',     role: 'Cliente',         health: 'ok',   status: 'Operacional' },
    { id: 'invoice_system',    label: 'Sistema Fiscal',  role: 'NF-e',            health: 'ok',   status: 'Operacional' },
    { id: 'marketplace_x',     label: 'Mercado Livre',   role: 'Marketplace',     health: 'ok',   status: 'Operacional' },
  ],
  escalation: {
    confidenceThreshold: 72,   /* % — abaixo disso cria Task */
    slaHours: 4,               /* horas sem progressão de gate → escala */
    notifyEmail: true,
    notifySlack: true,
    slackChannel: '#dom-alertas',
    notifyWebhook: false,
  },
};

/* ── SAMPLE ORDERS & ORDERJOBS ──────────────────────────────────── */
/* clearedGates: gates já liberados no OrderJob                     */
/* activeGate:   gate que o dispatcher está tentando liberar agora  */
/* connections:  estado atual de cada projection                    */
const ORDERS = [
  /* 1 ── Em trânsito */
  {
    id: '68948228', date: '2026-05-26T09:14:00',
    status: 'processing',
    value: 289.90, origin: 'Loja própria', payment: 'Cartão de crédito', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68948228-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Tênis Running Pro Max', sku: 'TRP-42-AZ', qty: 1, price: 249.90, icon: '👟' },
        { name: 'Meia Esportiva P',      sku: 'ME-P-BR',   qty: 2, price: 20.00,  icon: '🧦' },
      ],
      clearedGates: ['deliverable_ready', 'payment_settled'],
      activeGate: 'customer_has_goods',
      connections: {
        payment_processor: 'captured',
        warehouse_x:       'packed',
        carrier_x:         'in_transit',
        notification_x:    'shipped_sent',
        invoice_system:    'pending',
        marketplace_x:     'acknowledged',
      },
      tasks: [],
      elapsedHours: 2,
    }],
  },

  /* 2 ── revenue_complete */
  {
    id: '68947890', date: '2026-05-26T07:30:00',
    status: 'processed',
    value: 159.00, origin: 'Marketplace', payment: 'PIX', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68947890-A', fulfillmentMode: 'pickup_in_store',
      items: [
        { name: 'Camisa Polo Slim',  sku: 'CP-M-AZ', qty: 1, price: 159.00, icon: '👕' },
      ],
      clearedGates: ['deliverable_ready', 'customer_has_goods', 'payment_settled', 'revenue_complete'],
      activeGate: null,
      connections: {
        payment_processor: 'captured',
        store_x:           'handed_off',
        notification_x:    'delivered_sent',
        invoice_system:    'emitted',
      },
      tasks: [],
      elapsedHours: 0,
    }],
  },

  /* 3 ── recém criado, aguardando primeiro gate */
  {
    id: '68947650', date: '2026-05-26T11:02:00',
    status: 'processing',
    value: 512.00, origin: 'Loja própria', payment: 'Boleto', paymentStatus: 'pending',
    orderJobs: [{
      id: 'OJ-68947650-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Fone Bluetooth Over-ear', sku: 'FBT-01-PT', qty: 1, price: 512.00, icon: '🎧' },
      ],
      clearedGates: [],
      activeGate: 'deliverable_ready',
      connections: {
        payment_processor: 'authorized',
        warehouse_x:       'awaiting',
        carrier_x:         'pending',
        notification_x:    'order_confirmed_sent',
        invoice_system:    'pending',
      },
      tasks: [],
      elapsedHours: 0.5,
    }],
  },

  /* 4 ── TRAVADO — task aberta pelo dispatcher */
  {
    id: '68947234', date: '2026-05-25T16:45:00',
    status: 'processing',
    value: 890.00, origin: 'B2B', payment: 'Transferência', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68947234-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Monitor 27" 4K',     sku: 'MON-27-4K', qty: 1, price: 750.00, icon: '🖥️' },
        { name: 'Suporte de Monitor', sku: 'SUP-MNT',   qty: 1, price: 140.00, icon: '🔧' },
      ],
      clearedGates: [],
      activeGate: 'deliverable_ready',
      connections: {
        payment_processor: 'captured',
        warehouse_x:       'picking',
        carrier_x:         'pending',
        notification_x:    'order_confirmed_sent',
        invoice_system:    'pending',
      },
      tasks: [{
        id: 'TASK-001',
        title: 'WMS parado há 6h — separação não avança',
        description: 'OJ-68947234-A aguarda deliverable_ready há 6h. warehouse_x.picking sem atualização. Verifique disponibilidade de estoque no CD São Paulo.',
        createdBy: 'escalation sub-agent',
        createdAt: '2026-05-26T07:30:00',
        resolved: false,
      }],
      elapsedHours: 18.3,
    }],
  },

  /* 5 ── digital, pagamento settled, aguardando acesso */
  {
    id: '68946980', date: '2026-05-26T08:00:00',
    status: 'processing',
    value: 49.90, origin: 'App', payment: 'Cartão de crédito', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68946980-A', fulfillmentMode: 'digital',
      items: [
        { name: 'Assinatura Mensal Premium', sku: 'ASST-MEN', qty: 1, price: 49.90, icon: '⭐' },
      ],
      clearedGates: ['payment_settled'],
      activeGate: 'customer_has_goods',
      connections: {
        payment_processor: 'captured',
        entitlement_x:     'provisioned',
        notification_x:    'order_confirmed_sent',
        invoice_system:    'pending',
      },
      tasks: [],
      elapsedHours: 1,
    }],
  },

  /* 6 ── revenue_complete via delivery_from_store */
  {
    id: '68946500', date: '2026-05-25T10:20:00',
    status: 'processed',
    value: 320.00, origin: 'Loja própria', payment: 'Cartão de débito', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68946500-A', fulfillmentMode: 'delivery_from_store',
      items: [
        { name: 'Perfume Importado 100ml', sku: 'PERF-100', qty: 1, price: 320.00, icon: '🧴' },
      ],
      clearedGates: ['deliverable_ready', 'customer_has_goods', 'payment_settled', 'revenue_complete'],
      activeGate: null,
      connections: {
        payment_processor: 'captured',
        store_x:           'handed_off',
        carrier_x:         'delivered',
        notification_x:    'delivered_sent',
        invoice_system:    'emitted',
      },
      tasks: [],
      elapsedHours: 0,
    }],
  },

  /* 7 ── em cancelamento */
  {
    id: '68946120', date: '2026-05-26T06:10:00',
    status: 'canceled',
    value: 199.90, origin: 'Marketplace', payment: 'PIX', paymentStatus: 'refunded',
    orderJobs: [{
      id: 'OJ-68946120-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Teclado Mecânico RGB', sku: 'TEC-MEC', qty: 1, price: 199.90, icon: '⌨️' },
      ],
      clearedGates: ['cancellation_requested', 'customer_notified_of_cancellation', 'cancellation_complete'],
      activeGate: null,
      cancelPath: true,
      connections: {
        payment_processor: 'reversed',
        warehouse_x:       'cancelled',
        carrier_x:         'pending',
        notification_x:    'cancellation_sent',
        invoice_system:    'cancelled',
      },
      tasks: [],
      elapsedHours: 0,
    }],
  },

  /* 8 ── pickup staged, aguardando retirada */
  {
    id: '68945890', date: '2026-05-26T08:45:00',
    status: 'processing',
    value: 75.00, origin: 'Loja própria', payment: 'PIX', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68945890-A', fulfillmentMode: 'pickup_in_store',
      items: [
        { name: 'Livro Design Patterns', sku: 'LIV-DP', qty: 1, price: 75.00, icon: '📚' },
      ],
      clearedGates: ['deliverable_ready', 'payment_settled'],
      activeGate: 'customer_has_goods',
      connections: {
        payment_processor: 'captured',
        store_x:           'staged',
        notification_x:    'order_confirmed_sent',
        invoice_system:    'pending',
      },
      tasks: [],
      elapsedHours: 3,
    }],
  },

  /* 9 ── multi-OJ: dois cohorts de providers */
  {
    id: '68945100', date: '2026-05-26T10:00:00',
    status: 'processing',
    value: 1240.00, origin: 'B2B', payment: 'Faturado', paymentStatus: 'pending',
    orderJobs: [
      {
        id: 'OJ-68945100-A', fulfillmentMode: 'home_delivery',
        items: [
          { name: 'Cadeira Gamer Pro',  sku: 'CAD-GM', qty: 1, price: 900.00, icon: '🪑' },
        ],
        clearedGates: [],
        activeGate: 'deliverable_ready',
        connections: {
          payment_processor: 'authorized',
          warehouse_x:       'picking',
          carrier_x:         'pending',
          notification_x:    'order_confirmed_sent',
          invoice_system:    'pending',
        },
        tasks: [],
        elapsedHours: 1,
      },
      {
        id: 'OJ-68945100-B', fulfillmentMode: 'delivery_from_store',
        items: [
          { name: 'Mousepad XL',  sku: 'MPA-XL', qty: 1, price: 220.00, icon: '🖱️' },
          { name: 'Cabo HDMI 2m', sku: 'CAB-HD', qty: 1, price: 120.00, icon: '🔌' },
        ],
        clearedGates: ['deliverable_ready'],
        activeGate: 'customer_has_goods',
        connections: {
          payment_processor: 'authorized',
          store_x:           'packed',
          carrier_x:         'picked_up',
          notification_x:    'shipped_sent',
          invoice_system:    'pending',
        },
        tasks: [],
        elapsedHours: 1,
      },
    ],
  },

  /* 10 ── recém criado, awaiting */
  {
    id: '68944800', date: '2026-05-26T11:30:00',
    status: 'not_processed',
    value: 89.90, origin: 'Loja própria', payment: 'Cartão de crédito', paymentStatus: 'pending',
    orderJobs: [{
      id: 'OJ-68944800-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Caneca Térmica 500ml', sku: 'CAN-T5', qty: 2, price: 44.95, icon: '☕' },
      ],
      clearedGates: [],
      activeGate: 'deliverable_ready',
      connections: {
        payment_processor: 'pending',
        warehouse_x:       'awaiting',
        carrier_x:         'pending',
        notification_x:    'pending',
        invoice_system:    'pending',
      },
      tasks: [],
      elapsedHours: 0.1,
    }],
  },

  /* 11 ── task aberta, aguardando customer_has_goods */
  {
    id: '68944500', date: '2026-05-25T14:00:00',
    status: 'processing',
    value: 440.00, origin: 'Marketplace', payment: 'Parcelado 3x', paymentStatus: 'approved',
    orderJobs: [{
      id: 'OJ-68944500-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Airfryer Digital 5L', sku: 'AFD-5L', qty: 1, price: 440.00, icon: '🍳' },
      ],
      clearedGates: ['deliverable_ready', 'payment_settled'],
      activeGate: 'customer_has_goods',
      connections: {
        payment_processor: 'captured',
        warehouse_x:       'packed',
        carrier_x:         'in_transit',
        notification_x:    'shipped_sent',
        invoice_system:    'pending',
        marketplace_x:     'acknowledged',
      },
      tasks: [{
        id: 'TASK-002',
        title: 'Entrega atrasada — transportadora sem atualização há 5h',
        description: 'carrier_x.in_transit sem progressão para delivered. Última atualização há 5h. Contate a transportadora ou roteie para nova coleta.',
        createdBy: 'escalation sub-agent',
        createdAt: '2026-05-26T09:00:00',
        resolved: false,
      }],
      elapsedHours: 21,
    }],
  },

  /* 12 ── cancelamento em andamento */
  {
    id: '68944200', date: '2026-05-26T05:00:00',
    status: 'canceled',
    value: 675.00, origin: 'Loja própria', payment: 'Cartão de crédito', paymentStatus: 'refunded',
    orderJobs: [{
      id: 'OJ-68944200-A', fulfillmentMode: 'home_delivery',
      items: [
        { name: 'Kit Skincare Completo', sku: 'KSK-01', qty: 1, price: 675.00, icon: '🧖' },
      ],
      clearedGates: ['cancellation_requested'],
      activeGate: 'customer_notified_of_cancellation',
      cancelPath: true,
      connections: {
        payment_processor: 'reversed',
        warehouse_x:       'cancelled',
        carrier_x:         'pending',
        notification_x:    'pending',
        invoice_system:    'pending',
      },
      tasks: [],
      elapsedHours: 2,
    }],
  },
];

/* ── DISPATCHER TASK QUEUE (escalações abertas) ─────────────────── */
const DISPATCHER_TASKS = [
  {
    id: 'TASK-001',
    ojId: 'OJ-68947234-A', orderId: '68947234',
    title: 'WMS parado há 6h — separação não avança',
    description: 'warehouse_x.picking sem progressão. Confiança do dispatcher: 48%. Verifique disponibilidade de estoque no CD São Paulo ou roteie para CD alternativo.',
    gate: 'deliverable_ready',
    createdAt: '2026-05-26T07:30:00',
    resolved: false,
  },
  {
    id: 'TASK-002',
    ojId: 'OJ-68944500-A', orderId: '68944500',
    title: 'Entrega atrasada — transportadora sem atualização há 5h',
    description: 'carrier_x.in_transit sem progressão para delivered. Confiança: 55%. Contate a transportadora (rastreio #TR44821) ou abra ocorrência.',
    gate: 'customer_has_goods',
    createdAt: '2026-05-26T09:00:00',
    resolved: false,
  },
  {
    id: 'TASK-003',
    ojId: 'OJ-68947650-A', orderId: '68947650',
    title: 'Pagamento não capturado — boleto vence em 2h',
    description: 'payment_processor.authorized há 3h. Boleto bancário com vencimento próximo. Notifique cliente ou acione cobrança automática.',
    gate: 'payment_settled',
    createdAt: '2026-05-26T11:05:00',
    resolved: false,
  },
  {
    id: 'TASK-004',
    ojId: 'OJ-68946120-A', orderId: '68946120',
    title: 'Cancelamento concluído — NF-e de cancelamento emitida',
    description: 'cancellation_complete liberado. NF-e cancelada. Reembolso confirmado pelo Adyen.',
    gate: 'cancellation_complete',
    createdAt: '2026-05-26T10:00:00',
    resolved: true,
  },
];

/* ── DISPATCHER ACTIVITY LOG ────────────────────────────────────── */
const DISPATCHER_ACTIVITY = [
  { icon: '⚠️', bg: '#fef9c3', title: 'OJ-68947234-A — deliverable_ready travado',   sub: 'Parado há 6h. Confiança 48% < threshold 72%. Task criada para operações.', time: '19 min' },
  { icon: '✅', bg: '#f0fdf4', title: 'OJ-68948228-A — payment_settled liberado',     sub: 'payment_processor transitou para captured. Gate cleared automaticamente.', time: '42 min' },
  { icon: '🚚', bg: '#eff6ff', title: 'OJ-68948228-A — deliverable_ready liberado',   sub: 'warehouse_x.packed → carrier_x.picked_up. Gate cleared.', time: '1h 10m' },
  { icon: '🎉', bg: '#f0fdf4', title: 'OJ-68946500-A — revenue_complete liberado',    sub: 'customer_has_goods + payment_settled satisfeitos. Compound gate cleared. NF-e emitida.', time: '3h' },
  { icon: '🚫', bg: '#fef2f2', title: 'OJ-68946120-A — cancellation_requested',       sub: 'cancel_trigger liberado. Dispatcher entrou em modo cancelamento (DA-CANCEL-001).', time: '5h' },
  { icon: '🤖', bg: '#f5f3ff', title: 'OJ-68945100-B — routing sub-agent executado',  sub: 'provider_set resolvido: store_x + carrier_x. fulfillment_mode: delivery_from_store.', time: '6h' },
];

/* ── INITIAL CHAT MESSAGES (dispatcher) ────────────────────────── */
const DISPATCHER_CHAT_INIT = [
  { role: 'ai', text: 'Olá! Sou o oms-dispatcher, agente de orquestração por OrderJob entry.\n\nEstou ativo para todos os OrderJobs em fluxo. Atualmente há 2 Tasks abertas aguardando intervenção humana. Em que posso ajudar?' },
];
const DISPATCHER_SUGGESTIONS = [
  'Por que o OJ-68947234-A está travado?',
  'Quais gates estão pendentes agora?',
  'Desativar skill request-cancellation',
  'Ver atividade recente',
];
