// VTEX Admin — mock data
window.AppData = (function () {
  const AVATARS = {
    alex: "https://i.pravatar.cc/64?img=12",
    joao: "https://i.pravatar.cc/64?img=33",
    ana:  "https://i.pravatar.cc/64?img=47",
    leo:  "https://i.pravatar.cc/64?img=15",
    mar:  "https://i.pravatar.cc/64?img=49",
    you:  "https://i.pravatar.cc/64?img=68",
    cami: "https://i.pravatar.cc/64?img=23"
  };

  const recommended = [
    { tag: "GMV",        title: "Expand logistics coverage to regions with high demand", short: "Expand logistics coverage to regions...",   sev: "high",   date: "Apr 1"  },
    { tag: "Search CTR", title: "Search Optimization",                                   short: "Create synonyms and adjust search rules for...", sev: "high",  date: "Mar 31" },
    { tag: "GMV",        title: "Promotion campaigns",                                   short: "Create promotional campaigns for produc...",      sev: "medium", date: "Mar 30" },
    { tag: "Conversion", title: "Catalog optimization",                                  short: "Fix SEO, titles, and descriptions for most...",   sev: "medium", date: "Mar 29" },
    { tag: "Conversion", title: "Checkout Experience",                                   short: "Reduce steps and friction in the purcha...",      sev: "high",   date: "Mar 28" },
    { tag: "Conversion", title: "Storefront optimization",                               short: "Adjust storefront recommendations...",            sev: "medium", date: "Mar 27" },
    { tag: "Conversion", title: "Checkout Flow review",                                  short: "Review express checkout funnel...",               sev: "low",    date: "Mar 26" }
  ];

  const initiatives = [
    { id: "IN6390", status: "attention", sev: "high",   title: "Checkout error rate above SLA",        objective: "Checkout opportunities",  metric: "CVR",            metricLink: true,  date: "Apr 16", lead: AVATARS.alex },
    { id: "IN6391", status: "attention", sev: "high",   title: "Stale inventory in high-turn SKUs",    objective: "Fulfillment opportunities", metric: "GMV",          metricLink: true,  date: "Apr 15", lead: AVATARS.joao },
    { id: "IN6392", status: "attention", sev: "medium", title: "Campaign attribution drift",           objective: "Promotion opportunities", metric: "—",              metricLink: false, date: "Apr 14", lead: AVATARS.ana },
    { id: "IN6393", status: "attention", sev: "medium", title: "Auth service intermittent timeouts",   objective: "Improvement opportunities", metric: "ROI",          metricLink: true,  date: "Apr 13", lead: AVATARS.leo },
    { id: "IN6384", status: "active",    sev: "high",   title: "Catalog enrichment batch",             objective: "Catalog opportunities",   metric: "Conversion",     metricLink: false, date: "Apr 12", lead: AVATARS.mar },
    { id: "IN6383", status: "active",    sev: "low",    title: "Fulfillment SLA monitoring",           objective: "Fulfillment opportunities", metric: "Fulfillment rate", metricLink: true, date: "Apr 13", lead: AVATARS.cami },
    { id: "IN6382", status: "active",    sev: "medium", title: "Promo pricing rules rollout",          objective: "Promotion opportunities", metric: "GMV",            metricLink: true,  date: "Apr 14", lead: AVATARS.alex },
    { id: "IN6381", status: "active",    sev: "medium", title: "Search index rebuild in EU region",    objective: "Search opportunities",    metric: "Search CTR",     metricLink: true,  date: "Apr 15", lead: AVATARS.ana },
    { id: "IN6380", status: "active",    sev: "high",   title: "Payment gateway latency",              objective: "Checkout opportunities",  metric: "CVR",            metricLink: true,  date: "Apr 16", lead: AVATARS.joao },
    { id: "IN6268", status: "triage",    sev: "high",   title: "Expand logistics coverage to regions", objective: "Logistics opportunities", metric: "GMV",            metricLink: true,  date: "Apr 1",  lead: AVATARS.leo },
    { id: "IN6270", status: "triage",    sev: "high",   title: "Create synonyms and adjust search",    objective: "Search opportunities",    metric: "Search CTR",     metricLink: true,  date: "Mar 31", lead: AVATARS.mar },
    { id: "IN6272", status: "triage",    sev: "medium", title: "Create promotional campaigns",         objective: "Promotion opportunities", metric: "GMV",            metricLink: true,  date: "Mar 30", lead: AVATARS.cami },
    { id: "IN6273", status: "triage",    sev: "medium", title: "Storefront recommendation tuning",     objective: "Conversion opportunities",metric: "Conversion",     metricLink: false, date: "Mar 29", lead: AVATARS.alex },
    { id: "IN6201", status: "completed", sev: "low",    title: "Tax engine refactor",                  objective: "Compliance",              metric: "—",              metricLink: false, date: "Mar 25", lead: AVATARS.ana },
    { id: "IN6188", status: "completed", sev: "medium", title: "Subscription renewal flow",            objective: "Retention opportunities", metric: "LTV",            metricLink: true,  date: "Mar 22", lead: AVATARS.joao }
  ];

  // Subtasks attached to one initiative (the expanded row in the screenshot)
  const subtasksFor = {
    "IN6390": [
      { state: "loading",  title: "Diagnosticar causa raiz e mapear dependências",  meta: "Working...", assignee: AVATARS.alex },
      { state: "attention",title: "Aplicar mitigação e monitorar indicadores-chave", meta: null,        assignee: AVATARS.cami, agent: true },
      { state: "done",     title: "Revisar com o time e fechar pendências críticas", meta: null,        assignee: AVATARS.mar  }
    ],
    "IN6268": [
      { state: "loading",  title: "Map current logistics network coverage gaps",      meta: "Working...", assignee: AVATARS.leo },
      { state: "attention",title: "Identify warehouses with available stock by region", meta: null,        assignee: AVATARS.alex },
      { state: "done",     title: "Draft proposal of expanded coverage areas",        meta: null,        assignee: AVATARS.joao }
    ]
  };

  const conversations = [
    { id: "c1", title: "Revenue · Report",                   pinned: true,  hasCanvas: true,  preview: "Yesterday's revenue summary..." },
    { id: "c2", title: "How were my sales yesterday?",       pinned: false, hasCanvas: false, preview: "Total Revenue: $23,456.78..." },
    { id: "c3", title: "How do I integrate a new payment gateway?", pinned: false, hasCanvas: false, preview: "To integrate a new payment..." },
    { id: "c4", title: "Is VTEX stable today?",              pinned: false, hasCanvas: false, preview: "All systems operational..." },
    { id: "c5", title: "Does VTEX have any solutions for B2B?", pinned: false, hasCanvas: false, preview: "Yes — VTEX offers a B2B suite..." },
    { id: "c6", title: "How do I install a new agent?",      pinned: false, hasCanvas: false, preview: "Open the Agent Marketplace..." }
  ];

  const aiTeam = [
    { name: "Catalog Agent",     emoji: "🍑", color: "#FFD9DD", tasks: 12784, credits: 92600 },
    { name: "Promotions Agent",  emoji: "📣", color: "#FFE3F0", tasks: 13456, credits: 95800 },
    { name: "Search Optimizer",  emoji: "🎯", color: "#F4E1FF", tasks: 14321, credits: 90200 },
    { name: "Data Insights",     emoji: "💡", color: "#FFF3C7", tasks: 10250, credits: 88600 }
  ];

  const initiativeDetail = {
    id: "IN6268",
    title: "Expand logistics coverage to regions with high demand and available stock.",
    description: "Close fulfillment gaps in hot regions—fewer “can't deliver” orders, better SLA and GMV where demand already outpaces coverage.",
    severity: "high",
    status: "Triage",
    lead: { name: "Alexandre Gusmão", avatar: AVATARS.alex },
    reportedBy: { agent: "Data Insights Agent", emoji: "💡", at: "Apr 1 at 10:00 AM" },
    diagnosis: "Increase your store's visibility in search results and attract more qualified traffic. At the same time, clearer and more complete product information helps customers make confident purchase decisions, which can lead to higher conversion rates and better performance from your existing traffic.",
    tasks: [
      { title: "Review Logistics Network Coverage for the 5 Zip codes", assignee: { name: "João Oliveira", avatar: AVATARS.joao } },
      { title: "Review Routing Links for the 25 Warehouses With...",    assignee: { name: "João Oliveira", avatar: AVATARS.joao } },
      { title: "Audit shipping promises against current SLA tiers",     assignee: { name: "Ana Silva",     avatar: AVATARS.ana } },
      { title: "Draft regional onboarding plan for selected carriers",  assignee: { name: "Leonardo Mendes", avatar: AVATARS.leo } }
    ]
  };

  return { AVATARS, recommended, initiatives, subtasksFor, conversations, aiTeam, initiativeDetail };
})();
