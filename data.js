// ══════════════════════════════════════════
// DATA
// ══════════════════════════════════════════

const STATUS_CFG = {
  'not-processed':{ label:'Not processed', cls:'badge-not-processed', icon:'⏳' },
  'processing':   { label:'Processing', cls:'badge-processing', icon:'🔄' },
  'processed':    { label:'Processed', cls:'badge-processed', icon:'✅' },
  'canceled':     { label:'Canceled', cls:'badge-canceled', icon:'❌' },
};

const ORDERS = [
  { id:'1631888948228-01', short:'68948228', date:'13/05/2026 - 16:48', client:'Paulo Bernardo', items:3, total:'R$ 502,00', origin:'Marketplace', orderStatus:'processing', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'pending'},{n:'Packing',s:'pending'},{n:'Delivered',s:'pending'}] },
  { id:'1631858947234-01', short:'68947234', date:'13/05/2026 - 13:33', client:'Ana Carvalho', items:2, total:'R$ 1.230,00', origin:'Marketplace', orderStatus:'processed', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'completed'},{n:'Packing',s:'completed'},{n:'Delivered',s:'completed'}] },
  { id:'1631848947052-01', short:'68947052', date:'13/05/2026 - 12:56', client:'Carlos Mendes', items:1, total:'R$ 89,90', origin:'Own Store', orderStatus:'processed', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'completed'},{n:'Packing',s:'completed'},{n:'Delivered',s:'completed'}] },
  { id:'1631848946980-01', short:'68946980', date:'13/05/2026 - 12:43', client:'Fernanda Lima', items:4, total:'R$ 345,00', origin:'Marketplace', orderStatus:'not-processed', tasks:[
    {n:'Payment Authorization',s:'pending'},{n:'Payment Capture',s:'pending'},{n:'Picking',s:'pending'},{n:'Quality Check',s:'pending'},{n:'Packing',s:'pending'},{n:'Delivered',s:'pending'}] },

  { id:'1631828946500-01', short:'68946500', date:'13/05/2026 - 11:30', client:'Mariana Costa', items:5, total:'R$ 890,00', origin:'Marketplace', orderStatus:'processing', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'pending'},{n:'Packing',s:'pending'},{n:'Delivered',s:'pending'}] },
  { id:'1631818946200-01', short:'68946200', date:'13/05/2026 - 10:55', client:'Diego Ferreira', items:2, total:'R$ 155,00', origin:'Own Store', orderStatus:'processed', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'completed'},{n:'Packing',s:'completed'},{n:'Delivered',s:'completed'}] },
  { id:'1631900949000-01', short:'68949000', date:'25/05/2026 - 09:14', client:'Luiza Torres', items:2, total:'R$ 380,00', origin:'Own Store', orderStatus:'processing', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'completed'},{n:'Packing',s:'completed'},{n:'Delivered',s:'pending'}] },
  { id:'1631910950000-01', short:'68950000', date:'26/05/2026 - 14:30', client:'João Eduardo', items:3, total:'R$ 890,00', origin:'Own Store', orderStatus:'processing', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'completed'},{n:'Packing',s:'completed'},{n:'Delivered',s:'pending'}] },
  { id:'1631808945900-01', short:'68945900', date:'13/05/2026 - 10:12', client:'Juliana Santos', items:3, total:'R$ 220,00', origin:'Marketplace', orderStatus:'canceled', tasks:[] },
  { id:'1631920951000-01', short:'68951000', date:'26/05/2026 - 16:45', client:'Geraldo Thomaz', items:4, total:'R$ 1.139,00', origin:'Marketplace', orderStatus:'processing', tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'completed'},{n:'Packing',s:'pending'},{n:'Shipping',s:'pending'},{n:'Delivered',s:'pending'}] },
  { id:'1632000952000-01', short:'68952000', date:'28/05/2026 - 10:05', client:'John Crimber', items:3, total:'R$ 2.930,00', origin:'Own Store', orderStatus:'processing', tags:['kit','service'], tasks:[
    {n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'completed'},{n:'Quality Check',s:'pending'},{n:'Available at Store',s:'pending'},{n:'Pickup Confirmed',s:'pending'},{n:'Service Scheduled',s:'pending'},{n:'Installation Completed',s:'pending'}] },
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
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Camiseta Under Armour M', emoji:'👕', qty:1, price:'R$ 99,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Bermuda Oakley Camo G', emoji:'🩳', qty:1, price:'R$ 83,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],

  // ─── Ana Carvalho — 2 itens — processed (entregue) — com Troca e Devolução ──
  '1631858947234-01': [
    { name:'Jaqueta Calvin Klein G', emoji:'🧥', qty:1, price:'R$ 790,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Transp. XYZ', s:'completed'},
          {name:'Shipped', sup:'Transp. XYZ', s:'completed'},
          {name:'Delivered', sup:'Transp. XYZ', s:'completed'}
        ]}
      ],
      secondWorkflow:{
        wfId:'wf-returns', wfName:'Returns & Exchanges', triggeredAt:'14/05/2026 10:23',
        triggeredBy:'Shopper',
        tasks:[
          {name:'Request Received',sup:'Atendimento',s:'completed'},
          {name:'Reason Analysis',sup:'QA Team',s:'completed'},
          {name:'Item Pickup',sup:'Transp. XYZ',s:'pending'},
          {name:'Quality Inspection',sup:'QA Team',s:'pending'},
          {name:'Refund / Exchange',sup:'Financeiro',s:'pending'}]
      },
      returnInfo:{
        initiator:'shopper', initiatedAt:'14/05/2026 10:23',
        reason:'product_defect', reasonLabel:'Product Defect',
        description:'Defective stitching on the right sleeve after first use. Requesting exchange for another unit in the same size (L) and color (black).',
        agentDiagnosis:{
          confidence:87,
          insights:[
            {icon:'🔁', label:'Return pattern detected', desc:'This product (SKU JCK-BLK-G) was returned by 14 other customers in the last 30 days. In 71% of cases the defect is in the sleeve stitching.'},
            {icon:'⚠️', label:'High chargeback risk', desc:'NPS 2/10 combined with 3 prior incidents on this customer raises dispute risk to 87%.'},
            {icon:'💡', label:'Recommended action', desc:'Approve exchange immediately via express flow. Proactive replacement reduces dispute probability by 64%.'}
          ]
        }
      }
    },
    { name:'Cinto Couro Marrom', emoji:'👔', qty:1, price:'R$ 440,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Transp. XYZ', s:'completed'},
          {name:'Shipped', sup:'Transp. XYZ', s:'completed'},
          {name:'Delivered', sup:'Transp. XYZ', s:'completed'}
        ]}
      ]
    },
  ],
  '1631900949000-01': [
    { name:'Mouse Logitech MX Master 3', emoji:'🖱️', qty:1, price:'R$ 190,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Teclado Mecânico Keychron K2', emoji:'⌨️', qty:1, price:'R$ 190,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],
  '1631910950000-01': [
    {
      name:'Camiseta BRK com nome "João Eduardo"', emoji:'👕', qty:1, price:'R$ 240,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-personalization', wfName:'Product Customization',
          triggeredAt:'26/05/2026 14:45', triggeredBy:'AI Agent',
          tasks:[
            {name:'Customer Briefing', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Briefing received and recorded', s:'completed', failAction:'Solicitar novamente ao cliente'},
                {id:'cp2', label:'Art file or instructions attached', s:'completed', failAction:'Wait for customer submission'},
              ]},
            {name:'Art / Design', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Mockup created by designer', s:'completed', failAction:'Reassign to another BRK designer'},
                {id:'cp2', label:'Mockup sent to customer for approval', s:'completed', failAction:'Resend via another channel'},
              ]},
            {name:'Customer Approval', sup:'BRK', s:'completed',
              checkpoints:[
                {id:'cp1', label:'Art approved by customer', s:'completed', failAction:'Resend corrected art'},
                {id:'cp2', label:'Confirmation recorded in the system', s:'completed', failAction:'Request confirmation'},
              ]},
            {name:'Production', sup:'BRK', s:'completed'},
            {name:'Quality Control', sup:'QA Team', s:'completed'},
            {name:'Customization Complete', sup:'BRK', s:'completed'},
          ]
        },
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'completed'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    {
      name:'Piso Vinílico 100m²', emoji:'🪵', qty:1, price:'R$ 450,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'completed'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    {
      name:'Tapete Sala 2x3m', emoji:'🏠', qty:1, price:'R$ 200,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'completed'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
  ],
  '1631920951000-01': [
    // ── Grupo 1: CD São Paulo · Jadlog ──
    { name:'Camiseta Polo Ralph Lauren G', emoji:'👕', qty:1, price:'R$ 320,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'pending'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:"Calça Jeans Levi's 32x34", emoji:'👖', qty:1, price:'R$ 280,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'pending'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:'Tênis Asics Gel-Nimbus 26 T42', emoji:'👟', qty:1, price:'R$ 450,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'pending'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    // ── Grupo 2: Shopping Botafogo RJ · BOPIS ──
    { name:'Boné New Era NY 7 3/8', emoji:'🧢', qty:1, price:'R$ 89,00', seller:'Shopping Botafogo RJ',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'Shopping Botafogo RJ', s:'completed'},
          {name:'Quality Check', sup:'Shopping Botafogo RJ', s:'completed'},
          {name:'Customer Notification', sup:'Shopping Botafogo RJ', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Available at Store', sup:'Shopping Botafogo RJ', s:'pending'},
          {name:'Pickup Confirmed', sup:'Shopping Botafogo RJ', s:'pending'}
        ]}
      ]
    },
  ],

  // ─── Carlos Mendes — 1 item — processed ───────────────────────────────────
  '1631848947052-01': [
    { name:'Tênis Adidas Ultraboost 42', emoji:'👟', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'completed'},
          {name:'Shipped', sup:'Correios', s:'completed'},
          {name:'Delivered', sup:'Correios', s:'completed'}
        ]}
      ]
    }
  ],

  // ─── Fernanda Lima — 4 itens — not-processed ──────────────────────────────
  '1631848946980-01': [
    { name:'Vestido Floral Midi P', emoji:'👗', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Communication failure with card processor',
            blockSource:'Payment Gateway',
            suggestion:'Retry payment capture'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'pending'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Sandália Arezzo Nº36', emoji:'👡', qty:1, price:'R$ 79,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Communication failure with card processor',
            blockSource:'Payment Gateway',
            suggestion:'Retry payment capture'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'pending'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Bolsa Tiracolo Couro', emoji:'👜', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Communication failure with card processor',
            blockSource:'Payment Gateway',
            suggestion:'Retry payment capture'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'pending'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Óculos de Sol Cat Eye', emoji:'🕶️', qty:1, price:'R$ 85,30',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'blocked',
            blockReason:'Communication failure with card processor',
            blockSource:'Payment Gateway',
            suggestion:'Retry payment capture'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'pending'},
          {name:'Quality Check', sup:'QA Team', s:'pending'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],

  // ─── Mariana Costa — 5 itens — processing ─────────────────────────────────
  '1631828946500-01': [
    // ── Grupo 1: CD São Paulo · Jadlog ──
    { name:'Tênis Puma Suede 38', emoji:'👟', qty:1, price:'R$ 220,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'pending'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:'Camiseta Nike Dri-FIT M', emoji:'👕', qty:1, price:'R$ 130,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'pending'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    { name:'Shorts Adidas M', emoji:'🩳', qty:1, price:'R$ 120,00',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Jadlog', s:'pending'},
          {name:'Shipped', sup:'Jadlog', s:'pending'},
          {name:'Delivered', sup:'Jadlog', s:'pending'}
        ]}
      ]
    },
    // ── Grupo 2: CD Campinas · Correios ──
    { name:'Boné Oakley', emoji:'🧢', qty:1, price:'R$ 160,00', seller:'CD Campinas',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD Campinas', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD Campinas', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    },
    { name:'Meias Pack 3 pares', emoji:'🧦', qty:1, price:'R$ 260,00', seller:'CD Campinas',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD Campinas', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD Campinas', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'pending'},
          {name:'Shipped', sup:'Correios', s:'pending'},
          {name:'Delivered', sup:'Correios', s:'pending'}
        ]}
      ]
    }
  ],

  // ─── Diego Ferreira — 2 itens — processed ─────────────────────────────────
  '1631818946200-01': [
    { name:'Camisa Social Aramis Slim M', emoji:'👔', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'completed'},
          {name:'Shipped', sup:'Correios', s:'completed'},
          {name:'Delivered', sup:'Correios', s:'completed'}
        ]}
      ]
    },
    { name:'Calça Chino Khaki 40', emoji:'👖', qty:1, price:'R$ 65,10',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'completed'},
          {name:'Quality Check', sup:'QA Team', s:'completed'},
          {name:'Packing', sup:'CD São Paulo', s:'completed'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'completed'},
          {name:'Update Marketplace', sup:'VTEX', s:'completed'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'completed'},
          {name:'Shipped', sup:'Correios', s:'completed'},
          {name:'Delivered', sup:'Correios', s:'completed'}
        ]}
      ]
    }
  ],

  // ─── Juliana Santos — 3 itens — canceled ──────────────────────────────────
  '1631808945900-01': [
    { name:'Vestido Floral Zara P', emoji:'👗', qty:1, price:'R$ 89,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'blocked',
            blockReason:'Cancellation request received from customer',
            blockSource:'Cancellation System',
            suggestion:'Confirm cancellation and process payment refund'},
          {name:'Quality Check', sup:'QA Team', s:'canceled'},
          {name:'Packing', sup:'CD São Paulo', s:'canceled'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'canceled'},
          {name:'Update Marketplace', sup:'VTEX', s:'canceled'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'canceled'},
          {name:'Shipped', sup:'Correios', s:'canceled'},
          {name:'Delivered', sup:'Correios', s:'canceled'}
        ]}
      ]
    },
    { name:'Sandália Arezzo Nº 36', emoji:'👡', qty:1, price:'R$ 79,90',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'blocked',
            blockReason:'Cancellation request received from customer',
            blockSource:'Cancellation System',
            suggestion:'Confirm cancellation and process payment refund'},
          {name:'Quality Check', sup:'QA Team', s:'canceled'},
          {name:'Packing', sup:'CD São Paulo', s:'canceled'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'canceled'},
          {name:'Update Marketplace', sup:'VTEX', s:'canceled'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'canceled'},
          {name:'Shipped', sup:'Correios', s:'canceled'},
          {name:'Delivered', sup:'Correios', s:'canceled'}
        ]}
      ]
    },
    { name:'Bolsa Tiracolo Couro Preto', emoji:'👜', qty:1, price:'R$ 50,20',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'CD São Paulo', s:'blocked',
            blockReason:'Cancellation request received from customer',
            blockSource:'Cancellation System',
            suggestion:'Confirm cancellation and process payment refund'},
          {name:'Quality Check', sup:'QA Team', s:'canceled'},
          {name:'Packing', sup:'CD São Paulo', s:'canceled'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'canceled'},
          {name:'Update Marketplace', sup:'VTEX', s:'canceled'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Tracking Code', sup:'Correios', s:'canceled'},
          {name:'Shipped', sup:'Correios', s:'canceled'},
          {name:'Delivered', sup:'Correios', s:'canceled'}
        ]}
      ]
    }
  ],

  // ─── John Crimber — Kit BOPIS + Kit Produto+Serviço ──────────────────────
  '1632000952000-01': [

    // ─── Kit 1: Piso Vinílico Clicado — retirada na loja ─────────────────
    { name:'Piso Vinílico Clicado 3mm Madeira Natural (cx 3,24m²)', emoji:'🪵', qty:62, price:'R$ 1.984,80',
      kitGroupId:'kit-piso', kitGroupName:'Vinyl Flooring Kit — Store Pickup',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Quality Check', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Customer Notification', sup:'Loja Rua Augusta SP', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Available at Store', sup:'Loja Rua Augusta SP', s:'pending'},
          {name:'Pickup Confirmed', sup:'Loja Rua Augusta SP', s:'pending'}
        ]}
      ]
    },
    { name:'Rodapé PVC 7cm Branco (barra 2,4m)', emoji:'📏', qty:35, price:'R$ 455,00',
      kitGroupId:'kit-piso', kitGroupName:'Vinyl Flooring Kit — Store Pickup',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-standard', wfName:'Item Preparation', tasks:[
          {name:'Item Picking', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Quality Check', sup:'Loja Rua Augusta SP', s:'completed'},
          {name:'Customer Notification', sup:'Loja Rua Augusta SP', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice', sup:'Financeiro', s:'pending'},
          {name:'Update Marketplace', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Received by Customer', tasks:[
          {name:'Available at Store', sup:'Loja Rua Augusta SP', s:'pending'},
          {name:'Pickup Confirmed', sup:'Loja Rua Augusta SP', s:'pending'}
        ]}
      ]
    },

    // ─── Kit 2: Serviço de Instalação ─────────────────────────────────────
    { name:'Serviço de Instalação de Piso Vinílico (200m²)', emoji:'🔧', qty:1, price:'R$ 490,00',
      isService: true,
      kitGroupId:'kit-instalacao', kitGroupName:'Installation Kit — Product + Service',
      pipelines:[
        { wfId:'wf-payments', wfName:'Payment Confirmation', tasks:[
          {name:'Payment Authorization', sup:'Gateway Pagamento', s:'completed'},
          {name:'Payment Capture', sup:'Gateway Pagamento', s:'completed'}
        ]},
        { wfId:'wf-services', wfName:'Service Scheduling', tasks:[
          {name:'Schedule with Technician', sup:'Equipe de Instalação', s:'pending'},
          {name:'Customer Confirmation', sup:'Atendimento', s:'pending'},
          {name:'D-1 Reminder', sup:'Sistema Notificações', s:'pending'}
        ]},
        { wfId:'wf-nfe', wfName:'Invoices Issued', tasks:[
          {name:'Issue Invoice (Service)', sup:'Financeiro', s:'pending'},
          {name:'Update Status', sup:'VTEX', s:'pending'}
        ]},
        { wfId:'wf-delivery', wfName:'Service Executed', tasks:[
          {name:'Technician On-Site', sup:'Equipe de Instalação', s:'pending'},
          {name:'Installation Completed', sup:'Equipe de Instalação', s:'pending'},
          {name:'Customer Sign-off', sup:'Atendimento', s:'pending'}
        ]}
      ]
    },
  ],
};

const WORKFLOW_DEFS = [
  // ── 1. Entrega em domicílio ──────────────────────────────────
  {
    id: 'oj-home', name: 'Home Delivery', icon: '🚚', color: '#0c6fcd',
    orderCount: 4256, archived: false,
    description: 'Items dispatched by carrier to the customer\'s address',
    edges: [
      { id: 'e1', from: 'wf-payments', to: 'wf-standard', active: true },
      { id: 'e2', from: 'wf-standard', to: 'wf-nfe', active: true },
      { id: 'e3', from: 'wf-nfe', to: 'wf-delivery', active: true },
    ],
    marcos: [
      {
        id: 'wf-payments', name: 'Payment Confirmation', icon: '💳', color: '#059669',
        tasks: [
          { id: 'h-pmt1', name: 'Payment Authorization', supplier: 'Gateway Pagamento', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Request sent to gateway', failAction: 'Retry in 5min' },
            { id: 'cp2', label: 'Authorization received', failAction: 'Escalate to manual review' },
          ]},
          { id: 'h-pmt2', name: 'Payment Capture', supplier: 'Gateway Pagamento', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparing Items', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'h-sep1', name: 'Item Picking', supplier: 'CD São Paulo', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Stock reservation confirmed', failAction: 'Reallocate to another DC' },
            { id: 'cp2', label: 'Items physically picked', failAction: 'Alert operations manager' },
            { id: 'cp3', label: 'Label printed', failAction: 'Reprint label' },
          ]},
          { id: 'h-conf1', name: 'Quality Check', supplier: 'QA Team', category: 'Electronics', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'h-emb1', name: 'Packing', supplier: 'CD São Paulo', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-nfe', name: 'Invoices Issued', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'h-nfe1', name: 'Issue Invoice', supplier: 'Financeiro', category: 'All', active: true, visibility: 'internal', script: null, externalApi: { url: 'https://api.nfe.io/v1/nota', method: 'POST', responseMapping: [{ key: 'nf_numero', path: 'data.number' }, { key: 'nf_chave', path: 'data.accessKey' }] }, mcpConfig: null, agentConfig: null, contextOutput: ['api_nfe.nf_numero', 'api_nfe.nf_chave'], checkpoints: [
            { id: 'cp1', label: 'Tax data validated', failAction: 'Fix order data' },
            { id: 'cp2', label: 'Invoice authorized by tax authority', failAction: 'Resend or escalate to tax team' },
          ]},
          { id: 'h-nfe2', name: 'Update Marketplace', supplier: 'VTEX', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Received by Customer', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'h-del1', name: 'Tracking Code', supplier: 'Transportadora XYZ', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Tracking code generated', failAction: 'Request code via Intelipost' },
            { id: 'cp2', label: 'Code sent to customer', failAction: 'Resend notification' },
          ]},
          { id: 'h-del2', name: 'Shipped', supplier: 'Transportadora XYZ', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'h-del3', name: 'Delivered', supplier: 'Transportadora XYZ', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },

  // ── 2. Retirada na loja (BOPIS) ──────────────────────────────
  {
    id: 'oj-bopis', name: 'Store Pickup', icon: '🏪', color: '#7c3aed',
    orderCount: 312, archived: false,
    description: 'Items picked at the store for customer pickup (BOPIS)',
    edges: [
      { id: 'e1', from: 'wf-payments', to: 'wf-standard', active: true },
      { id: 'e2', from: 'wf-standard', to: 'wf-nfe', active: true },
      { id: 'e3', from: 'wf-nfe', to: 'wf-delivery', active: true },
    ],
    marcos: [
      {
        id: 'wf-payments', name: 'Payment Confirmation', icon: '💳', color: '#059669',
        tasks: [
          { id: 'b-pmt1', name: 'Payment Authorization', supplier: 'Gateway Pagamento', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Request sent to gateway', failAction: 'Retry in 5min' },
            { id: 'cp2', label: 'Authorization received', failAction: 'Escalate to manual review' },
          ]},
          { id: 'b-pmt2', name: 'Payment Capture', supplier: 'Gateway Pagamento', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparing Items', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'b-sep1', name: 'Item Picking', supplier: 'Loja', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Items located in store inventory', failAction: 'Check another sales point' },
            { id: 'cp2', label: 'Items physically picked', failAction: 'Contact store manager' },
          ]},
          { id: 'b-conf1', name: 'Quality Check', supplier: 'Loja', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'b-notif1', name: 'Customer Notification', supplier: 'Loja', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Availability SMS/Email sent', failAction: 'Resend notification' },
          ]},
        ]
      },
      {
        id: 'wf-nfe', name: 'Invoices Issued', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'b-nfe1', name: 'Issue Invoice', supplier: 'Financeiro', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Tax data validated', failAction: 'Fix order data' },
            { id: 'cp2', label: 'Invoice authorized by tax authority', failAction: 'Escalate to tax team' },
          ]},
          { id: 'b-nfe2', name: 'Update Marketplace', supplier: 'VTEX', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Received by Customer', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'b-avail1', name: 'Available at Store', supplier: 'Loja', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Item placed at pickup counter', failAction: 'Reposition item' },
          ]},
          { id: 'b-pickup1', name: 'Pickup Confirmed', supplier: 'Loja', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Customer identity verified', failAction: 'Request ID document' },
            { id: 'cp2', label: 'Pickup signature recorded', failAction: 'Record manually' },
          ]},
        ]
      },
    ]
  },

  // ── 3. Entrega digital ───────────────────────────────────────
  {
    id: 'oj-digital', name: 'Digital Delivery', icon: '💻', color: '#0891b2',
    orderCount: 128, archived: false,
    description: 'Digital products delivered by email, download link or activation code',
    edges: [
      { id: 'e1', from: 'wf-payments', to: 'wf-standard', active: true },
      { id: 'e2', from: 'wf-standard', to: 'wf-nfe', active: true },
      { id: 'e3', from: 'wf-nfe', to: 'wf-delivery', active: true },
    ],
    marcos: [
      {
        id: 'wf-payments', name: 'Payment Confirmation', icon: '💳', color: '#059669',
        tasks: [
          { id: 'd-pmt1', name: 'Payment Authorization', supplier: 'Gateway Pagamento', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Request sent to gateway', failAction: 'Retry in 5min' },
            { id: 'cp2', label: 'Authorization received', failAction: 'Escalate to manual review' },
          ]},
          { id: 'd-pmt2', name: 'Payment Capture', supplier: 'Gateway Pagamento', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-standard', name: 'Preparing Items', icon: '📦', color: '#0c6fcd',
        tasks: [
          { id: 'd-gen1', name: 'Digital Product Generation', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'License or activation code generated', failAction: 'Reprocess generation' },
            { id: 'cp2', label: 'Product linked to order', failAction: 'Check integration' },
          ]},
          { id: 'd-val1', name: 'License Validation', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'License is unique and not duplicated', failAction: 'Generate new license' },
          ]},
          { id: 'd-send1', name: 'Email Delivery', supplier: 'CRM', category: 'Digital', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Email delivered without bounce', failAction: 'Try alternative channel (SMS/WhatsApp)' },
          ]},
        ]
      },
      {
        id: 'wf-nfe', name: 'Invoices Issued', icon: '🧾', color: '#059669',
        tasks: [
          { id: 'd-nfe1', name: 'Issue Invoice', supplier: 'Financeiro', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Service invoice issued', failAction: 'Escalate to tax team' },
          ]},
          { id: 'd-nfe2', name: 'Update Marketplace', supplier: 'VTEX', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'wf-delivery', name: 'Received by Customer', icon: '📬', color: '#d97706',
        tasks: [
          { id: 'd-conf1', name: 'Delivery Confirmation', supplier: 'CRM', category: 'Digital', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'Customer opened the delivery email', failAction: 'Resend after 24h' },
          ]},
          { id: 'd-acc1', name: 'Access Verified', supplier: 'Plataforma Digital', category: 'Digital', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [
            { id: 'cp1', label: 'First access or activation recorded', failAction: 'Contact customer support' },
          ]},
        ]
      },
    ]
  },

  // ── 5. Troca e Devolução (condicional) ───────────────────────
  {
    id: 'wf-returns', name: 'Returns & Exchanges', icon: '↩️', color: '#7c3aed',
    orderCount: 83, archived: false,
    description: 'Flow for return and exchange orders — conditionally triggered by the agent or shopper',
    edges: [
      { id: 're1', from: 'r-solicit', to: 'r-coleta', active: true },
      { id: 're2', from: 'r-coleta', to: 'r-insp', active: true },
      { id: 're3', from: 'r-insp', to: 'r-resolv', active: true },
    ],
    marcos: [
      {
        id: 'r-solicit', name: 'Request', icon: '📝', color: '#7c3aed',
        tasks: [
          { id: 'r1_0', name: 'Request Received', supplier: 'Atendimento', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'r1_1', name: 'Reason Analysis', supplier: 'QA Team', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'r-coleta', name: 'Pickup', icon: '🔄', color: '#0891b2',
        tasks: [
          { id: 'r2_0', name: 'Pickup Scheduling', supplier: 'Transportadora XYZ', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'r2_1', name: 'Item Pickup', supplier: 'Transportadora XYZ', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'r-insp', name: 'Inspection', icon: '🔍', color: '#6366f1',
        tasks: [
          { id: 'r3_0', name: 'DC Receiving', supplier: 'CD São Paulo', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
          { id: 'r3_1', name: 'Quality Inspection', supplier: 'QA Team', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'r-resolv', name: 'Resolution', icon: '✅', color: '#059669',
        tasks: [
          { id: 'r4_0', name: 'Refund / Exchange', supplier: 'Financeiro', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },

  // ── 4. Agenda Serviço Instalação ─────────────────────────────────────────
  {
    id: 'oj-agenda-servico', name: 'Installation Service Schedule', icon: '📅', color: '#0891b2',
    orderCount: 0, archived: false,
    description: 'Scheduling flow for installation services — technician confirmation and customer notification',
    edges: [
      { id: 'as-e1', from: 'as-agendamento', to: 'as-confirmacao', active: true },
      { id: 'as-e2', from: 'as-confirmacao', to: 'as-lembrete', active: true },
    ],
    marcos: [
      {
        id: 'as-agendamento', name: 'Scheduling', icon: '🗓️', color: '#0891b2',
        tasks: [
          { id: 'as1_0', name: 'Schedule with Technician', supplier: 'Equipe de Instalação', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'as-confirmacao', name: 'Confirmation', icon: '✅', color: '#059669',
        tasks: [
          { id: 'as2_0', name: 'Customer Confirmation', supplier: 'Atendimento', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'as-lembrete', name: 'Reminder', icon: '🔔', color: '#d97706',
        tasks: [
          { id: 'as3_0', name: 'D-1 Reminder', supplier: 'Sistema Notificações', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
    ]
  },

  // ── 5. Serviço Instalação Executada ──────────────────────────────────────
  {
    id: 'oj-servico-executado', name: 'Installation Service Executed', icon: '🔧', color: '#7c3aed',
    orderCount: 0, archived: false,
    description: 'Field installation service execution flow — technician on-site until final customer sign-off',
    edges: [
      { id: 'se-e1', from: 'se-execucao', to: 'se-conclusao', active: true },
      { id: 'se-e2', from: 'se-conclusao', to: 'se-aceite', active: true },
    ],
    marcos: [
      {
        id: 'se-execucao', name: 'Execution', icon: '🔨', color: '#7c3aed',
        tasks: [
          { id: 'se1_0', name: 'Technician On-Site', supplier: 'Equipe de Instalação', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'se-conclusao', name: 'Completion', icon: '🏁', color: '#0891b2',
        tasks: [
          { id: 'se2_0', name: 'Installation Completed', supplier: 'Equipe de Instalação', category: 'All', active: true, visibility: 'internal', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
        ]
      },
      {
        id: 'se-aceite', name: 'Acceptance', icon: '✅', color: '#059669',
        tasks: [
          { id: 'se3_0', name: 'Customer Sign-off', supplier: 'Atendimento', category: 'All', active: true, visibility: 'user', script: null, externalApi: null, mcpConfig: null, agentConfig: null, contextOutput: [], checkpoints: [] },
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
  'h-pmt1': { fn: 'payment.authorize', trigger: 'preflight', note: 'Agent checks pre-conditions before authorizing' },
  'h-pmt2': { fn: 'payment.capture',   trigger: 'mutate',    note: 'Agent captures the amount after authorization is confirmed' },
  // oj-home — NFes Emitidas
  'h-nfe1': { fn: 'nfe.emit',          trigger: 'mutate',    note: 'Agent issues the invoice once packing is confirmed' },
  'h-nfe2': { fn: null,                trigger: null,        note: 'Internal VTEX update — no external call' },
  // oj-home — Recebido pelo Cliente
  'h-del1': { fn: 'tracking.fetch',    trigger: 'read',      note: 'Agent fetches the tracking code generated by the carrier' },
  'h-del2': { fn: 'shipment.create',   trigger: 'mutate',    note: 'Agent confirms dispatch and obtains protocol number' },
  'h-del3': { fn: 'watch.poll',        trigger: 'maintain',  note: 'Agent reconciles confirmed delivery webhook' },
  // oj-home — Preparando Itens (warehouse_x — não configurado ainda)
  'h-sep1': { fn: null,                trigger: null,        note: 'warehouse_x not configured — agent awaits manual confirmation' },
  // oj-bopis
  'b-pmt1': { fn: 'payment.authorize', trigger: 'preflight', note: 'Agent checks pre-conditions before authorizing' },
  'b-pmt2': { fn: 'payment.capture',   trigger: 'mutate',    note: 'Agent captures the amount after authorization is confirmed' },
  'b-nfe1': { fn: 'nfe.emit',          trigger: 'mutate',    note: 'Agent issues the invoice once item is available at store' },
  'b-nfe2': { fn: null,                trigger: null,        note: 'Internal VTEX update — no external call' },
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
      purpose: 'Manages shipping, tracking and reverse logistics via Intelipost',
      functions: [
        { name: 'tracking.fetch',  kind: 'read',   label: 'Fetch tracking' },
        { name: 'shipment.create', kind: 'mutate', label: 'Create shipment' },
        { name: 'label.generate',  kind: 'read',   label: 'Generate label' },
        { name: 'shipment.cancel', kind: 'cancel', label: 'Cancel shipment' },
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
      purpose: 'Authorizes, captures and reverses payments via Adyen Online Payments',
      functions: [
        { name: 'payment.authorize', kind: 'preflight', label: 'Authorize payment' },
        { name: 'payment.capture',   kind: 'mutate',    label: 'Capture payment' },
        { name: 'payment.cancel',    kind: 'cancel',    label: 'Reverse payment' },
        { name: 'watch.poll',        kind: 'maintain',  label: 'Reconcile webhooks' },
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
      purpose: 'Issues e-invoices via Tiny ERP integrated with the tax authority',
      functions: [
        { name: 'nfe.emit',   kind: 'mutate',  label: 'Issue invoice' },
        { name: 'nfe.cancel', kind: 'cancel',  label: 'Cancel invoice' },
        { name: 'nfe.status', kind: 'read',    label: 'Check tax authority status' },
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
      description:'Selects the nearest DC with available stock for the requested SKU',
      type:'procedure', parameters:{ min_stock_threshold:5, fallback_cd:'CD São Paulo' },
      active:true,  lastTriggered:'28/05 08:12', triggerCount:1847 },
    { id:'sk-route-sla', name:'route_by_sla',
      description:'Routes to the carrier with lowest estimated SLA for the recipient\'s postal code',
      type:'api_call', parameters:{ max_transit_days:3 },
      active:false, lastTriggered:null, triggerCount:0 },
  ],
  orchestration: [
    { id:'sk-orch-advance', name:'advance_on_confirmation',
      description:'Automatically advances the task when it receives confirmation from the connector via webhook',
      type:'procedure', parameters:{ confidence_threshold:0.80 },
      active:true, lastTriggered:'28/05 11:45', triggerCount:423 },
    { id:'sk-orch-retry', name:'retry_failed_connector',
      description:'Retries the connector function up to 3 times on network_error or rate_limited',
      type:'procedure', parameters:{ max_retries:3, backoff_seconds:30 },
      active:true, lastTriggered:'27/05 16:22', triggerCount:12 },
    { id:'sk-orch-block-auth', name:'block_on_auth_error',
      description:'Blocks the task and creates an escalation when the connector returns auth_error',
      type:'procedure', parameters:{},
      active:true, lastTriggered:null, triggerCount:0 },
  ],
  escalation: [
    { id:'sk-esc-sla', name:'sla_breach_alert',
      description:'Detects inactivity above the configured SLA and notifies the operator via preferred channel',
      type:'api_call', parameters:{ sla_hours:4, notification_channel:'slack' },
      active:true, lastTriggered:'27/05 19:00', triggerCount:7 },
    { id:'sk-esc-chargeback', name:'chargeback_risk_escalation',
      description:'Escalates to a human operator when the agent detects chargeback risk above the threshold',
      type:'procedure', parameters:{ risk_threshold:0.85 },
      active:false, lastTriggered:null, triggerCount:0 },
  ],
};

// Mock responses for testConnector(). Intelipost randomizes last event each call.
const INTELIPOST_EVENTS = [
  { description:'Package forwarded to destination branch', city:'Curitiba',      state:'PR' },
  { description:'Out for delivery',                     city:'Curitiba',      state:'PR' },
  { description:'In transit between distribution centers', city:'São José dos Pinhais', state:'PR' },
  { description:'Package received at distribution unit',    city:'Curitiba',      state:'PR' },
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
          status:'IN_TRANSIT', status_label:'In transit',
          tracking_events:[
            { event_datetime: fmt(now),       description: ev.description,                    city: ev.city, state: ev.state },
            { event_datetime: fmt(yesterday), description:'Package posted to carrier', city:'São Paulo', state:'SP' },
            { event_datetime: fmt(twoDaysAgo),description:'Pickup performed at DC',           city:'São Paulo', state:'SP' },
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
