/* ================================================================
   prototype-gtj-app.js
   Lógica de navegação, render e eventos
   Depende de: prototype-gtj-data.js
   ================================================================ */

/* ── ESTADO DA APLICAÇÃO ─────────────────────────────────────────── */
let currentScreen     = 'orders';
let currentOrderId    = null;
let selectedGate      = null;
let modeFilter        = 'all';
let resolveTaskId     = null;
let agentActive       = true;
let cancelOrderId     = null;

/* cópia mutável das tasks (para simular resolução) */
let taskQueue = DISPATCHER_TASKS.map(t => ({ ...t }));

/* ── NAVEGAÇÃO ───────────────────────────────────────────────────── */
function showScreen(id, orderId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById('screen-' + id);
  if (el) el.classList.add('active');

  const sidebarMap = {
    orders:     ['sb-all-orders'],
    detail:     ['sb-all-orders'],
    flow:       ['sb-flow'],
    dispatcher: ['sb-dispatcher'],
  };
  (sidebarMap[id] || []).forEach(sid => {
    const n = document.getElementById(sid);
    if (n) n.classList.add('active');
  });

  currentScreen = id;

  if (id === 'orders')     renderOrdersTable();
  if (id === 'detail' && orderId) { currentOrderId = orderId; renderDetail(orderId); }
  if (id === 'flow')       renderFlowScreen();
  if (id === 'dispatcher') renderDispatcherScreen();
}

/* ── HELPERS GERAIS ──────────────────────────────────────────────── */
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
    ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
function fmtCurrency(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }
function fmtElapsed(h) {
  if (h < 1)  return Math.round(h * 60) + 'min';
  if (h < 24) return h.toFixed(0) + 'h';
  return Math.round(h / 24) + 'd';
}

function orderStatus(s) {
  return {
    processing:    { label: 'Em processamento', css: 'b-blue'   },
    not_processed: { label: 'Não processado',   css: 'b-gray'   },
    processed:     { label: 'Processado',        css: 'b-green'  },
    canceled:      { label: 'Cancelado',         css: 'b-red'    },
  }[s] || { label: s, css: 'b-gray' };
}

function connStateStyle(connId, state) {
  const conn = connById(connId);
  if (!conn) return 'cs-gray';
  return conn.stateStyle?.[state] || 'cs-gray';
}

function toast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ── GATE PROGRESS DOTS (para a tabela de pedidos) ─────────────── */
function buildGateDots(oj) {
  if (oj.cancelPath) {
    /* mostra dots de cancelamento */
    const cGates = ['cancellation_requested', 'customer_notified_of_cancellation', 'cancellation_complete'];
    return '<div class="gp-dots" title="Fluxo de cancelamento">' +
      cGates.map(gid => {
        const cls = oj.clearedGates.includes(gid) ? 'cancel' :
                    oj.activeGate === gid ? 'active' : 'pending';
        return `<div class="gp-dot ${cls}" title="${gateById(gid)?.label || gid}"></div>`;
      }).join('') + '</div>';
  }
  const happyGates = ['deliverable_ready', 'customer_has_goods', 'payment_settled', 'revenue_complete'];
  return '<div class="gp-dots" title="Gates do fluxo normal">' +
    happyGates.map(gid => {
      const cls = oj.clearedGates.includes(gid) ? 'cleared' :
                  oj.activeGate === gid ? 'active' : 'pending';
      return `<div class="gp-dot ${cls}" title="${gateById(gid)?.label || gid}"></div>`;
    }).join('') + '</div>';
}

/* ── TELA 1: TABELA DE PEDIDOS ───────────────────────────────────── */
function renderOrdersTable() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;
  tbody.innerHTML = ORDERS.map(order => {
    const st  = orderStatus(order.status);
    const oj0 = order.orderJobs[0];
    const dots = buildGateDots(oj0);
    const ojCount = order.orderJobs.length;
    const hasTask = order.orderJobs.some(oj => oj.tasks && oj.tasks.some(t => !t.resolved));
    const taskFlag = hasTask
      ? '<span class="badge b-orange" style="font-size:10px;padding:2px 6px">⚠ Task</span>'
      : '';
    return `<tr onclick="showScreen('detail','${order.id}')">
      <td><span class="badge ${st.css}">${st.label}</span></td>
      <td>${dots}${taskFlag}</td>
      <td class="oid">${order.id}</td>
      <td style="font-size:12px;color:#666">${fmtDate(order.date)}</td>
      <td style="font-weight:600">${fmtCurrency(order.value)}</td>
      <td style="font-size:12px;color:#666">${order.origin}</td>
      <td><span class="badge ${order.paymentStatus === 'approved' ? 'b-green' : order.paymentStatus === 'refunded' ? 'b-orange' : 'b-yellow'}" style="font-size:10.5px">${order.payment}</span></td>
      <td>
        <span class="badge b-purple" style="font-size:10.5px">${ojCount} OJ${ojCount > 1 ? 's' : ''}</span>
      </td>
    </tr>`;
  }).join('');
}

/* ── TELA 2: DETALHE DO PEDIDO ───────────────────────────────────── */
function renderDetail(orderId) {
  const order = ORDERS.find(o => o.id === orderId);
  if (!order) return;
  const el = document.getElementById('screen-detail');
  const st = orderStatus(order.status);

  /* ── header ── */
  let html = `
    <div class="dheader">
      <button class="back-btn" onclick="showScreen('orders')">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M10 4L6 8l4 4"/></svg>
        Todos os pedidos
      </button>
      <span class="d-oid">${order.id}</span>
      <span class="badge ${st.css}">${st.label}</span>
      <div class="d-actions">
        <button class="btn btn-secondary btn-sm">Imprimir</button>
        <button class="btn btn-danger btn-sm" onclick="openCancelModal('${order.id}')">Cancelar pedido</button>
        <button class="btn btn-primary btn-sm">Faturar</button>
      </div>
    </div>
    <p class="d-meta">${fmtDate(order.date)} · ${order.origin} · ${order.payment}</p>`;

  /* ── cards de cliente/entrega/valores ── */
  html += `<div class="d-grid3">
    <div class="dcard">
      <div class="dcard-title">Destinatário</div>
      <div class="dfield" style="font-weight:600">Cliente registrado</div>
      <div class="dfield link" style="font-size:12px;margin-top:6px">(11) 9xxxx-xxxx</div>
      <div class="dfield link" style="font-size:12px">cliente@exemplo.com</div>
    </div>
    <div class="dcard">
      <div class="dcard-title">Endereço de entrega</div>
      <div class="dfield-label">Endereço</div>
      <div class="dfield">Rua Exemplo, 100 · São Paulo, SP</div>
      <div class="dfield-label">Modo de entrega</div>
      ${order.orderJobs.map(oj => {
        const m = modeConfig(oj.fulfillmentMode);
        return `<div style="margin-top:4px"><span class="mode-pill ${m.css}">${m.icon} ${m.label}</span></div>`;
      }).join('')}
    </div>
    <div class="dcard">
      <div class="dcard-title">Valores</div>
      <div class="pay-row"><span class="pay-label">Subtotal</span><span class="pay-val">${fmtCurrency(order.value * 0.93)}</span></div>
      <div class="pay-row"><span class="pay-label">Frete</span><span class="pay-val">${fmtCurrency(order.value * 0.07)}</span></div>
      <div class="pay-row" style="margin-top:8px;padding-top:8px;border-top:1px solid #f0f0f0;font-weight:700">
        <span style="color:#1a1a1a">Total</span><span style="color:#1a1a1a">${fmtCurrency(order.value)}</span>
      </div>
    </div>
  </div>`;

  /* ── gates summary card ── */
  html += buildGatesSummaryCard(order);

  /* ── OrderJobs section ── */
  html += `<div class="oj-section">
    <div class="oj-section-header">
      <svg viewBox="0 0 16 16" fill="none" stroke="#7c3aed" stroke-width="2" width="16" height="16">
        <rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/>
        <rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/>
      </svg>
      OrderJobs
      <span class="oj-count-badge">${order.orderJobs.length}</span>
      <span style="font-size:11.5px;color:#888;font-weight:400;margin-left:4px">— cohorts de providers coordenados por gates</span>
    </div>
    ${order.orderJobs.map((oj, idx) => buildOjCard(oj, idx)).join('')}
  </div>`;

  /* ── pagamento ── */
  html += `<div class="d-main-row">
    <div></div>
    <div class="dcard">
      <div class="dcard-title">Pagamento</div>
      <div style="border:1px solid #f0f0f0;border-radius:4px;padding:12px 14px">
        <div style="font-size:12.5px;font-weight:600;color:#3f3f40;margin-bottom:10px">${order.payment}</div>
        <div class="pay-row"><span class="pay-label">Valor</span><span class="pay-val">${fmtCurrency(order.value)}</span></div>
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f0f0f0">
          <div class="dfield-label" style="margin-top:0">Status</div>
          <span class="badge ${order.paymentStatus === 'approved' ? 'b-green' : order.paymentStatus === 'refunded' ? 'b-orange' : 'b-yellow'}" style="margin-top:4px">
            ${{ approved: 'Aprovado', pending: 'Aguardando', refunded: 'Estornado' }[order.paymentStatus] || order.paymentStatus}
          </span>
        </div>
      </div>
    </div>
  </div>`;

  el.innerHTML = html;
}

/* Cards de gates summary (visão consolidada do order) */
function buildGatesSummaryCard(order) {
  /* agrega gates de todos os OJs */
  const allCleared = new Set(order.orderJobs.flatMap(oj => oj.clearedGates));
  const anyCancel  = order.orderJobs.some(oj => oj.cancelPath);
  const happyGates = ['deliverable_ready', 'customer_has_goods', 'payment_settled', 'revenue_complete'];

  const steps = happyGates.map((gid, i) => {
    const g = gateById(gid);
    const cleared = allCleared.has(gid);
    const active  = !cleared && order.orderJobs.some(oj => oj.activeGate === gid);
    const stateCls = cleared ? 'cleared' : active ? 'active' : 'pending';
    const conn = i < happyGates.length - 1
      ? `<div class="ht-connector ${cleared ? 'cleared' : active ? 'active' : ''}"></div>`
      : '';
    return `<div class="ht-step">
      <div class="ht-node">
        <div class="ht-circle ${stateCls} ${g.compound ? 'compound' : ''}">
          ${cleared ? '✓' : g.icon}
        </div>
        <div class="ht-label ${stateCls}">${g.label}</div>
      </div>
      ${conn}
    </div>`;
  });

  let cancelBadge = '';
  if (anyCancel) {
    cancelBadge = `<span class="badge b-red" style="font-size:11px;margin-left:8px">
      🚫 Fluxo de cancelamento ativo
    </span>`;
  }

  return `<div class="gates-summary-card">
    <div class="gsc-header">
      <span class="gsc-title">Gates do OrderJob</span>
      <span class="gsc-ct">oms.OrderJob · fluxo normal${anyCancel ? ' (cancelamento)' : ''}</span>
    </div>
    <div class="happy-track">${steps.join('')}</div>
    ${cancelBadge}
    <div style="margin-top:10px;font-size:11.5px;color:#888">
      ${Array.from(allCleared).length} / 4 gates do fluxo normal liberados ·
      <button class="btn-link" onclick="showScreen('flow')">Ver detalhes no Controle de Fluxo →</button>
    </div>
  </div>`;
}

/* Card de um OrderJob */
function buildOjCard(oj, idx) {
  const m = modeConfig(oj.fulfillmentMode);
  const hasTask = oj.tasks && oj.tasks.some(t => !t.resolved);
  const happyGates = ['deliverable_ready', 'customer_has_goods', 'payment_settled', 'revenue_complete'];
  const gateSet = oj.cancelPath
    ? ['cancellation_requested', 'customer_notified_of_cancellation', 'cancellation_complete']
    : happyGates;

  /* gate progress row */
  const gateSteps = gateSet.map((gid, i) => {
    const g = gateById(gid);
    const cleared = oj.clearedGates.includes(gid);
    const active  = oj.activeGate === gid;
    const stateCls = cleared ? 'cleared' : active ? 'active' : 'pending';
    const lineEl = i < gateSet.length - 1
      ? `<div class="ogt-line ${cleared ? 'cleared' : ''}"></div>`
      : '';
    return `<div class="ogt-step">
      <div class="ogt-node">
        <div class="ogt-circle ${stateCls} ${g?.compound ? 'compound' : ''}">
          ${cleared ? '✓' : g?.icon || '?'}
        </div>
        <div class="ogt-name ${stateCls}" title="${g?.label || gid}">${g?.label || gid}</div>
      </div>
      ${lineEl}
    </div>`;
  }).join('');

  /* connection projections */
  const activeConns = CONNECTIONS_BY_MODE[oj.fulfillmentMode] || [];
  const connPills = activeConns
    .filter(cid => oj.connections[cid])
    .map(cid => {
      const conn  = connById(cid);
      const state = oj.connections[cid];
      const css   = connStateStyle(cid, state);
      return `<div class="conn-pill">
        <span class="conn-icon">${conn?.icon || '?'}</span>
        <span class="conn-name">${conn?.label || cid}</span>
        <span class="conn-state ${css}">${state}</span>
      </div>`;
    }).join('');

  /* task alert */
  const taskHtml = (oj.tasks || []).filter(t => !t.resolved).map(t => `
    <div class="oj-task-alert">
      <div class="oj-task-icon">⚠️</div>
      <div style="flex:1">
        <div class="oj-task-title">${t.title}</div>
        <div class="oj-task-desc">${t.description}</div>
        <div class="oj-task-btns">
          <button class="btn btn-secondary btn-sm" onclick="openTaskModal('${t.id}')">Ver Task</button>
          <button class="btn btn-primary btn-sm" onclick="resolveTaskById('${t.id}');this.closest('.oj-task-alert').remove()">Marcar resolvida</button>
        </div>
      </div>
    </div>`).join('');

  /* elapsed time badge */
  const elapsed = oj.elapsedHours || 0;
  const elapsedBadge = elapsed > 4
    ? `<span class="badge b-red" style="font-size:10px">⚠ ${fmtElapsed(elapsed)} sem progressão</span>`
    : elapsed > 0
      ? `<span style="font-size:11px;color:#888">${fmtElapsed(elapsed)}</span>`
      : '';

  return `<div class="oj-card">
    <div class="oj-header" onclick="toggleOjBody('oj-body-${idx}','oj-chev-${idx}')">
      <span class="oj-id">${oj.id}</span>
      <span class="mode-pill ${m.css}">${m.icon} ${m.label}</span>
      ${elapsedBadge}
      ${hasTask ? '<span class="badge b-orange" style="font-size:10px">⚠ Task aberta</span>' : ''}
      <div class="oj-header-right">
        <span style="font-size:11.5px;color:#888">${oj.items.length} item${oj.items.length > 1 ? 's' : ''}</span>
        <span class="oj-toggle" id="oj-chev-${idx}">▼</span>
      </div>
    </div>
    <div class="oj-body" id="oj-body-${idx}">
      <!-- Itens -->
      <div class="oj-items-row">
        ${oj.items.map(it => `<div class="oj-item"><span class="oj-item-icon">${it.icon}</span>${it.qty}× ${it.name} <span style="color:#aaa;font-size:10.5px">${it.sku}</span></div>`).join('')}
      </div>
      <!-- Gate progress -->
      <div class="oj-gate-track">
        <div class="ogt-label">Gates ${oj.cancelPath ? '(cancelamento)' : '(fluxo normal)'}</div>
        <div class="ogt-steps">${gateSteps}</div>
      </div>
      <!-- Connection projections -->
      <div class="conn-proj">
        <div class="conn-proj-label">
          Projeções de Providers
          <span style="font-size:10px;color:#aaa;font-weight:400">${activeConns.length} connections ativas</span>
        </div>
        <div class="conn-grid">${connPills || '<span style="font-size:11.5px;color:#aaa">Nenhuma connection ativa</span>'}</div>
      </div>
      ${taskHtml}
    </div>
  </div>`;
}

function toggleOjBody(bodyId, chevId) {
  const body = document.getElementById(bodyId);
  const chev = document.getElementById(chevId);
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = '';
    if (chev) { chev.textContent = '▼'; chev.classList.remove('open'); }
  } else {
    body.style.display = 'none';
    if (chev) { chev.textContent = '▶'; chev.classList.add('open'); }
  }
}

/* ── TELA 3: CONTROLE DE FLUXO ───────────────────────────────────── */
function setModeFilter(mode) {
  modeFilter = mode;
  document.querySelectorAll('.mode-filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  renderFlowScreen();
}

function clearGateFilter() {
  selectedGate = null;
  renderFlowGates();
  renderOjMonitor();
}

function renderFlowScreen() {
  renderFlowGates();
  renderOjMonitor();
}

function renderFlowGates() {
  const container = document.getElementById('gate-rail-body');
  if (!container) return;

  /* conta OJs por gate */
  const counts = {};
  GATES.forEach(g => { counts[g.id] = 0; });

  ORDERS.forEach(order => {
    order.orderJobs.forEach(oj => {
      if (modeFilter !== 'all' && oj.fulfillmentMode !== modeFilter) return;
      if (oj.activeGate && counts[oj.activeGate] !== undefined) {
        counts[oj.activeGate]++;
      }
    });
  });

  /* conta completos */
  const completeCounts = {};
  ORDERS.forEach(order => {
    order.orderJobs.forEach(oj => {
      if (modeFilter !== 'all' && oj.fulfillmentMode !== modeFilter) return;
      oj.clearedGates.forEach(gid => {
        completeCounts[gid] = (completeCounts[gid] || 0) + 1;
      });
    });
  });

  const happyGates  = GATES.filter(g => g.path === 'happy');
  const cancelGates = GATES.filter(g => g.path === 'cancel');

  function gateCard(g) {
    const count   = counts[g.id] || 0;
    const compCnt = completeCounts[g.id] || 0;
    const isSelected = selectedGate === g.id;
    const countBadge = `<span class="gc-count ${count === 0 ? 'zero' : ''}" title="OrderJobs aguardando este gate">${count}</span>`;
    const kindBadge  = g.kind === 'cancel_trigger'
      ? `<span class="gc-kind">cancel_trigger</span>` : '';
    const compoundBadge = g.compound
      ? `<span style="font-size:9.5px;padding:1px 5px;border-radius:3px;background:#faf5ff;color:#7c3aed;border:1px solid #e9d5ff;font-weight:700">compound</span>` : '';

    let metaHtml = '';
    if (g.cleared_by) {
      metaHtml += `<div class="gc-cleared">↑ liberado por: ${Object.entries(g.cleared_by).map(([k,v]) => `${k}.${v.split(' ')[0]}`).join(', ')}</div>`;
    }
    if (g.depends_on) {
      metaHtml += `<div class="gc-depends">⊕ depends_on: ${g.depends_on.join(' ∧ ')}</div>`;
    }
    if (g.awaited_by) {
      metaHtml += `<div style="font-size:10.5px;color:#0c6fcd">▷ aguarda: ${Object.entries(g.awaited_by).map(([k,v]) => `${k}.${v}`).join(', ')}</div>`;
    }
    if (g.synthesized_note) {
      metaHtml += `<div class="gc-synth">* ${g.synthesized_note}</div>`;
    }
    if (g.note) {
      metaHtml += `<div class="gc-synth">${g.note}</div>`;
    }

    const completeLine = compCnt > 0
      ? `<div style="font-size:10px;color:#16a34a;margin-top:3px">✓ ${compCnt} OrderJob${compCnt > 1 ? 's' : ''} já passaram por este gate</div>`
      : '';

    return `<div class="gate-card ${g.path} ${isSelected ? 'active' : ''}" onclick="selectGate('${g.id}')">
      <div class="gc-head">
        <span class="gc-icon">${g.icon}</span>
        <span class="gc-name">${g.label}</span>
        ${countBadge}
      </div>
      <div class="gc-id">${g.id}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">${kindBadge}${compoundBadge}</div>
      <div class="gc-desc">${g.description}</div>
      <div class="gc-meta">${metaHtml}</div>
      ${completeLine}
    </div>`;
  }

  const happyArrow  = `<div class="gate-connector-arrow">↓</div>`;
  const compoundArrow = `<div class="gate-connector-arrow" style="font-size:9px;color:#7c3aed">↘ ↙  compound (AND)</div>`;

  const happyHtml = happyGates.map((g, i) => {
    const arrow = i < happyGates.length - 1
      ? (i === 1 ? compoundArrow : happyArrow)
      : '';
    return gateCard(g) + arrow;
  }).join('');

  const cancelHtml = cancelGates.map((g, i) => {
    const arrow = i < cancelGates.length - 1 ? happyArrow : '';
    return gateCard(g) + arrow;
  }).join('');

  container.innerHTML = `
    <div class="gate-path-label">
      <span>FLUXO NORMAL</span>
      <div class="gate-path-line"></div>
    </div>
    ${happyHtml}
    <div style="margin-top:14px"></div>
    <div class="gate-path-label">
      <span>CANCELAMENTO</span>
      <div class="gate-path-line"></div>
    </div>
    ${cancelHtml}`;
}

function selectGate(gateId) {
  selectedGate = selectedGate === gateId ? null : gateId;
  renderFlowGates();
  renderOjMonitor();
}

function renderOjMonitor() {
  const body    = document.getElementById('oj-mon-body');
  const title   = document.getElementById('oj-mon-title');
  const countEl = document.getElementById('oj-mon-count');
  if (!body) return;

  const gate = selectedGate ? gateById(selectedGate) : null;
  if (gate) {
    title.textContent = `Aguardando gate: ${gate.label}`;
  } else {
    title.textContent = 'Todos os OrderJobs ativos';
  }

  /* filtra OJs */
  const matching = [];
  ORDERS.forEach(order => {
    order.orderJobs.forEach(oj => {
      if (modeFilter !== 'all' && oj.fulfillmentMode !== modeFilter) return;
      if (gate) {
        if (oj.activeGate !== gate.id) return;
      }
      matching.push({ order, oj });
    });
  });

  countEl.textContent = matching.length + ' OrderJob' + (matching.length !== 1 ? 's' : '');

  if (matching.length === 0) {
    body.innerHTML = `<div class="oj-empty">
      <div class="oj-empty-icon">✅</div>
      <div class="oj-empty-text">Nenhum OrderJob aguardando este gate<br>no filtro selecionado.</div>
    </div>`;
    return;
  }

  body.innerHTML = matching.map(({ order, oj }) => {
    const m    = modeConfig(oj.fulfillmentMode);
    const hasTask = (oj.tasks || []).some(t => !t.resolved);
    const elapsed = oj.elapsedHours || 0;
    const timeClass = elapsed > 4 ? 'warn' : 'ok';
    const timeText  = elapsed > 0 ? fmtElapsed(elapsed) : 'agora';

    /* connections mini */
    const activeConns = CONNECTIONS_BY_MODE[oj.fulfillmentMode] || [];
    const connMini = activeConns.filter(cid => oj.connections[cid]).slice(0, 4).map(cid => {
      const conn  = connById(cid);
      const state = oj.connections[cid];
      const css   = connStateStyle(cid, state);
      return `<span class="conn-state ${css}" style="font-size:10px">${conn?.icon || ''} ${state}</span>`;
    }).join('');

    return `<div class="oj-list-card" onclick="showScreen('detail','${order.id}')">
      <div class="ojlc-head">
        <span class="ojlc-id">${oj.id}</span>
        <span class="mode-pill ${m.css}" style="font-size:10px;padding:2px 7px">${m.icon} ${m.label}</span>
        ${hasTask ? '<span class="ojlc-task">⚠ Task</span>' : ''}
        <span class="ojlc-time ${timeClass}">${timeText} ${elapsed > 4 ? '⚠' : ''}</span>
      </div>
      <div class="ojlc-info">
        <span>Pedido <strong>${order.id}</strong></span>
        <span>${oj.items.length} item${oj.items.length !== 1 ? 's' : ''}</span>
        <span style="display:flex;gap:4px;flex-wrap:wrap">${connMini}</span>
      </div>
    </div>`;
  }).join('');
}

/* ── TELA 4: DISPATCHER ──────────────────────────────────────────── */
function renderDispatcherScreen() {
  renderDispatcherConfig();
  renderDispatcherChat();
}

function renderDispatcherConfig() {
  const container = document.getElementById('disp-config');
  if (!container) return;

  const d = DISPATCHER_CONFIG;

  /* ── Card 1: Identidade ── */
  const card1 = `<div class="dcard">
    <div class="dcard-title"><span class="dcard-icon">🤖</span> Identidade do Dispatcher</div>
    <div class="ident-grid">
      <div class="ident-field">
        <div class="if-label">name</div>
        <div class="if-val">${d.identity.name}</div>
      </div>
      <div class="ident-field">
        <div class="if-label">model</div>
        <div class="if-val"><span class="model-chip">${d.identity.model}</span></div>
      </div>
      <div class="ident-field" style="grid-column:1/-1">
        <div class="if-label">role</div>
        <div class="if-val prose">${d.identity.role}</div>
      </div>
      <div class="ident-field" style="grid-column:1/-1">
        <div class="if-label">goal</div>
        <div class="if-val prose">${d.identity.goal}</div>
      </div>
    </div>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f5f5f5">
      <div class="if-label">scope</div>
      <div style="font-size:11.5px;color:#555;margin-top:3px">
        Instanciado <strong>por OrderJob entry</strong> — cada OrderJob tem exatamente um dispatcher.
        <button class="btn-link" onclick="showScreen('flow')" style="font-size:11.5px">Ver OrderJobs ativos →</button>
      </div>
    </div>
  </div>`;

  /* ── Card 2: Skills ── */
  const skills2 = d.skills.map((sk, i) => `
    <div class="skill-item">
      <div class="skill-info">
        <div class="skill-name">${sk.name}</div>
        <div class="skill-desc">${sk.desc}</div>
      </div>
      <button class="toggle-sw ${sk.enabled ? 'on' : 'off'}" id="skill-toggle-${i}"
        onclick="toggleSkill(${i})" title="${sk.enabled ? 'Desativar' : 'Ativar'} skill"></button>
    </div>`).join('');
  const card2 = `<div class="dcard">
    <div class="dcard-title"><span class="dcard-icon">⚙️</span> Skills</div>
    <div class="info-box" style="margin-bottom:10px">
      Skills são procedimentos nomeados que o sub-agente pode invocar.
      Cada skill tem seu próprio SKILL.md e scripts.
    </div>
    ${skills2}
  </div>`;

  /* ── Card 3: Regras de Escalação ── */
  const esc = d.escalation;
  const card3 = `<div class="dcard">
    <div class="dcard-title"><span class="dcard-icon">📏</span> Regras de Escalação</div>
    <div class="info-box" style="margin-bottom:10px">
      Quando o dispatcher cria uma <strong>Task</strong> para intervenção humana.
      Tasks são o canal de escalação do dispatcher para operadores (<code style="font-size:11px">DA-LOG-004</code>).
    </div>
    <div class="esc-rule">
      <div class="esc-info">
        <div class="esc-label">Criar Task quando confiança &lt; threshold</div>
        <div class="esc-sub">Abaixo deste valor o dispatcher não age autonomamente e escala ao operador</div>
      </div>
      <input class="esc-input" type="number" id="conf-input" value="${esc.confidenceThreshold}" min="0" max="100">
      <span class="esc-unit">%</span>
    </div>
    <div class="esc-rule">
      <div class="esc-info">
        <div class="esc-label">Criar Task se gate sem progressão por</div>
        <div class="esc-sub">OrderJob travado além deste SLA aciona o sub-agente de escalação</div>
      </div>
      <input class="esc-input" type="number" id="sla-input" value="${esc.slaHours}" min="1" max="72">
      <span class="esc-unit">h</span>
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f5f5f5">
      <div class="section-label" style="margin-bottom:8px">Notificações</div>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:6px">
        <input type="checkbox" ${esc.notifyEmail ? 'checked' : ''} style="accent-color:#0c6fcd">
        Email ao escalar para operador
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:6px">
        <input type="checkbox" ${esc.notifySlack ? 'checked' : ''} style="accent-color:#0c6fcd">
        Slack — <code style="font-size:12px">${esc.slackChannel}</code>
      </label>
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
        <input type="checkbox" ${esc.notifyWebhook ? 'checked' : ''} style="accent-color:#0c6fcd">
        Webhook personalizado
      </label>
    </div>
  </div>`;

  /* ── Card 4: Sub-agentes ── */
  const subAgents4 = d.subAgents.map(sa => `
    <div class="sa-item">
      <div class="sa-dot ${sa.active ? 'active' : 'inactive'}"></div>
      <div class="sa-info">
        <div class="sa-name">${sa.name}</div>
        <div class="sa-desc">${sa.desc}</div>
      </div>
      <span class="sa-badge ${sa.active ? 'active' : 'inactive'}">${sa.active ? 'Ativo' : 'Inativo'}</span>
    </div>`).join('');
  const card4 = `<div class="dcard">
    <div class="dcard-title"><span class="dcard-icon">🧩</span> Sub-agentes</div>
    <div class="info-box" style="margin-bottom:10px">
      Sub-agentes são instanciados por OrderJob entry e operam em isolamento.
      Reportam resultados ao dispatcher (<code style="font-size:11px">DA-ARCH-002</code>).
    </div>
    ${subAgents4}
  </div>`;

  /* ── Card 5: Conectores ── */
  const conns5 = d.connectors.map(c => `
    <div class="conn-item">
      <div class="conn-health ch-${c.health}"></div>
      <div class="ci-info">
        <div class="ci-name">${c.label}</div>
        <div class="ci-role">${c.role}</div>
      </div>
      <span class="ci-status">${c.status}</span>
    </div>`).join('');
  const card5 = `<div class="dcard">
    <div class="dcard-title"><span class="dcard-icon">🔌</span> Conectores Ativos</div>
    <div class="info-box" style="margin-bottom:10px">
      Conectores são o único canal de acesso a sistemas externos
      (<code style="font-size:11px">DA-ARCH-003</code>).
    </div>
    ${conns5}
  </div>`;

  /* ── Card 6: Task Queue ── */
  const openTasks = taskQueue.filter(t => !t.resolved);
  const taskHtml6 = taskQueue.slice(0, 5).map(t => `
    <div class="task-q-item ${t.resolved ? 'resolved' : ''}">
      <div class="tq-icon">${t.resolved ? '✅' : '⚠️'}</div>
      <div class="tq-body">
        <div class="tq-oj">${t.ojId}</div>
        <div class="tq-title ${t.resolved ? 'resolved' : ''}">${t.title}</div>
        <div class="tq-desc ${t.resolved ? 'resolved' : ''}">${t.description}</div>
        <div class="tq-time">Gate: ${gateById(t.gate)?.label || t.gate} · ${fmtDate(t.createdAt)}</div>
      </div>
      ${!t.resolved ? `<button class="tq-resolve" onclick="resolveTaskById('${t.id}')">Resolver</button>` : ''}
    </div>`).join('');
  const card6 = `<div class="dcard">
    <div class="dcard-title">
      <span class="dcard-icon">📋</span> Task Queue
      ${openTasks.length > 0 ? `<span class="badge b-orange" style="margin-left:auto">${openTasks.length} abertas</span>` : '<span class="badge b-green" style="margin-left:auto">Sem pendências</span>'}
    </div>
    ${taskHtml6 || '<div class="empty-state"><div class="empty-icon">✅</div><div>Nenhuma task pendente</div></div>'}
  </div>`;

  /* ── Card 7: Atividade recente ── */
  const act7 = DISPATCHER_ACTIVITY.map(a => `
    <div class="act-item">
      <div class="act-icon" style="background:${a.bg}">${a.icon}</div>
      <div class="act-body">
        <div class="act-title">${a.title}</div>
        <div class="act-sub">${a.sub}</div>
      </div>
      <div class="act-time">${a.time}</div>
    </div>`).join('');
  const card7 = `<div class="dcard" style="padding-bottom:12px">
    <div class="dcard-title"><span class="dcard-icon">📊</span> Atividade Recente</div>
    ${act7}
  </div>`;

  container.innerHTML = card1 + card2 + card3 + card4 + card5 + card6 + card7;
}

/* ── DISPATCHER CHAT ─────────────────────────────────────────────── */
const chatHistory = [];

function renderDispatcherChat() {
  if (chatHistory.length === 0) {
    DISPATCHER_CHAT_INIT.forEach(m => chatHistory.push(m));
  }
  const msgsEl = document.getElementById('disp-msgs');
  if (!msgsEl) return;
  msgsEl.innerHTML = chatHistory.map(m =>
    `<div class="dmsg dmsg-${m.role}">${escHtml(m.text)}</div>`
  ).join('');
  msgsEl.scrollTop = msgsEl.scrollHeight;

  const suggEl = document.getElementById('disp-sugg');
  if (suggEl && chatHistory.length <= 2) {
    suggEl.innerHTML = DISPATCHER_SUGGESTIONS.map(s =>
      `<button class="dsugg" onclick="useSuggestion(this)">${s}</button>`
    ).join('');
  }
}

function useSuggestion(btn) {
  const input = document.getElementById('disp-input');
  if (input) { input.value = btn.textContent; sendDispatcherMsg(); }
}

function sendDispatcherMsg() {
  const input = document.getElementById('disp-input');
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  input.value = '';

  chatHistory.push({ role: 'user', text });

  /* sugestões de resposta contextual */
  let response;
  const lc = text.toLowerCase();
  if (lc.includes('68947234') || lc.includes('travado') || lc.includes('stuck')) {
    response = 'OJ-68947234-A está aguardando o gate deliverable_ready há 18h.\n\nwarehouse_x está em estado "picking" sem progressão. Confiança: 48% (abaixo do threshold de ' + DISPATCHER_CONFIG.escalation.confidenceThreshold + '%).\n\nTask TASK-001 foi criada pelo sub-agente de escalação. Recomendo contatar o WMS do CD São Paulo ou rerotear para CD Rio de Janeiro.';
  } else if (lc.includes('gate') || lc.includes('pending') || lc.includes('aguard')) {
    const pending = ORDERS.flatMap(o => o.orderJobs).filter(oj => oj.activeGate);
    const counts = {};
    pending.forEach(oj => { counts[oj.activeGate] = (counts[oj.activeGate] || 0) + 1; });
    const lines = Object.entries(counts).map(([g, c]) => `• ${gateById(g)?.label || g}: ${c} OJ`).join('\n');
    response = `Gates com OrderJobs aguardando:\n${lines}\n\nTotal: ${pending.length} OrderJobs em progresso.`;
  } else if (lc.includes('skill') || lc.includes('cancelamento') || lc.includes('request-cancel')) {
    response = 'A skill request-cancellation está configurável na seção Skills. Quando desativada, o dispatcher não sinaliza cancellation_requested autonomamente — o gate só pode ser liberado por ação manual do operador ou por regra de negócio externa.';
  } else if (lc.includes('atividade') || lc.includes('recente')) {
    response = 'Últimas ações:\n• OJ-68947234-A → Task criada (confiança 48%)\n• OJ-68948228-A → payment_settled liberado automaticamente\n• OJ-68946500-A → revenue_complete liberado (compound gate)\n• OJ-68946120-A → cancellation_requested liberado (cancel_trigger)';
  } else if (lc.includes('task') || lc.includes('escal')) {
    const open = taskQueue.filter(t => !t.resolved);
    response = `${open.length} Task${open.length !== 1 ? 's' : ''} aberta${open.length !== 1 ? 's' : ''}:\n${open.map(t => `• ${t.ojId}: ${t.title}`).join('\n') || '(nenhuma)'}`;
  } else {
    response = 'Entendido. Posso ajudar com monitoramento de gates, configuração de skills e sub-agentes, regras de escalação, ou análise de OrderJobs específicos. O que precisa?';
  }

  setTimeout(() => {
    chatHistory.push({ role: 'ai', text: response });
    renderDispatcherChat();
    const suggEl = document.getElementById('disp-sugg');
    if (suggEl) suggEl.innerHTML = '';
  }, 600);

  renderDispatcherChat();
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── AÇÕES DO DISPATCHER ─────────────────────────────────────────── */
function toggleSkill(idx) {
  DISPATCHER_CONFIG.skills[idx].enabled = !DISPATCHER_CONFIG.skills[idx].enabled;
  const btn = document.getElementById(`skill-toggle-${idx}`);
  if (btn) {
    btn.classList.toggle('on',  DISPATCHER_CONFIG.skills[idx].enabled);
    btn.classList.toggle('off', !DISPATCHER_CONFIG.skills[idx].enabled);
  }
}

function toggleAgentMaster() {
  agentActive = !agentActive;
  const btn   = document.getElementById('agent-master-toggle');
  const dot   = document.getElementById('asb-dot');
  const label = document.getElementById('asb-label');
  const sub   = document.getElementById('asb-sub');
  if (btn)   { btn.classList.toggle('on', agentActive); btn.classList.toggle('off', !agentActive); }
  if (dot)   { dot.classList.toggle('off', !agentActive); }
  if (label) { label.textContent = agentActive ? 'Agente ativo' : 'Agente pausado'; label.style.color = agentActive ? '#15803d' : '#9ca3af'; }
  if (sub)   { sub.textContent   = agentActive ? '· 12 OrderJobs' : '· pausado'; }
  toast(agentActive ? '✅ Dispatcher reativado' : '⏸ Dispatcher pausado');
}

function saveDispatcherConfig() {
  const confInput = document.getElementById('conf-input');
  const slaInput  = document.getElementById('sla-input');
  if (confInput) DISPATCHER_CONFIG.escalation.confidenceThreshold = parseInt(confInput.value);
  if (slaInput)  DISPATCHER_CONFIG.escalation.slaHours = parseInt(slaInput.value);
  toast('✅ Configuração do dispatcher salva');
}

/* ── TASKS ───────────────────────────────────────────────────────── */
function resolveTaskById(taskId) {
  const t = taskQueue.find(t => t.id === taskId);
  if (t) { t.resolved = true; }
  /* também marca no OJ */
  ORDERS.forEach(order => {
    order.orderJobs.forEach(oj => {
      (oj.tasks || []).forEach(ot => { if (ot.id === taskId) ot.resolved = true; });
    });
  });
  if (currentScreen === 'dispatcher') renderDispatcherConfig();
  toast('✅ Task marcada como resolvida');
}

let modalResolveTaskId = null;

function openTaskModal(taskId) {
  const t = taskQueue.find(t => t.id === taskId);
  if (!t) return;
  modalResolveTaskId = taskId;
  document.getElementById('modal-task-title').textContent = t.title;
  document.getElementById('modal-task-body').innerHTML = `
    <div style="font-size:11.5px;color:#6d28d9;font-family:monospace;margin-bottom:8px">${t.ojId}</div>
    <div style="margin-bottom:12px">${t.description}</div>
    <div style="font-size:12px;color:#888">Gate: <strong>${gateById(t.gate)?.label || t.gate}</strong> · Criada por: ${t.createdBy || 'dispatcher'} · ${fmtDate(t.createdAt)}</div>`;
  const resolveBtn = document.getElementById('modal-task-resolve');
  if (resolveBtn) resolveBtn.style.display = t.resolved ? 'none' : '';
  openModal('modal-task');
}

function resolveTaskFromModal() {
  if (modalResolveTaskId) resolveTaskById(modalResolveTaskId);
  closeModal('modal-task');
}

/* ── CANCEL MODAL ────────────────────────────────────────────────── */
function openCancelModal(orderId) {
  cancelOrderId = orderId;
  document.getElementById('modal-cancel-body').innerHTML =
    `Confirmar cancelamento do pedido <strong>${orderId}</strong>?`;
  openModal('modal-cancel');
}

function confirmCancel() {
  if (cancelOrderId) {
    const order = ORDERS.find(o => o.id === cancelOrderId);
    if (order) {
      order.status = 'canceled';
      order.orderJobs.forEach(oj => {
        oj.cancelPath = true;
        oj.clearedGates = ['cancellation_requested'];
        oj.activeGate = 'customer_notified_of_cancellation';
      });
    }
    toast('🚫 cancellation_requested sinalizado — dispatcher em modo cancelamento');
  }
  closeModal('modal-cancel');
  if (currentScreen === 'detail') renderDetail(cancelOrderId);
}

/* ── YAML MODAL ──────────────────────────────────────────────────── */
function openYamlModal() {
  const yaml = `<span class="yk">content_type</span>:
  <span class="yk">name</span>: <span class="yv">OrderJob</span>
  <span class="yc"># Fonte: applications/oms/content-types/orderjob/definition.md</span>

  <span class="yk">gates</span>:

    <span class="yc"># ---- Fluxo normal ----</span>

    <span class="yk">deliverable_ready</span>:
      <span class="yk">description</span>: <span class="ys">"Deliverable is at the next handoff point."</span>

    <span class="yk">customer_has_goods</span>:
      <span class="yk">description</span>: <span class="ys">"Customer has received the deliverable."</span>

    <span class="yk">payment_settled</span>:
      <span class="yk">description</span>: <span class="ys">"Funds cleared on the payment processor."</span>

    <span class="yk">revenue_complete</span>:
      <span class="yk">description</span>: <span class="ys">"Delivered and paid — safe to invoice."</span>
      <span class="yk">depends_on</span>: [<span class="yv">customer_has_goods</span>, <span class="yv">payment_settled</span>]

    <span class="yc"># ---- Cancelamento ----</span>

    <span class="yk">cancellation_requested</span>:
      <span class="yk">description</span>: <span class="ys">"Cancellation signal received."</span>
      <span class="yk">kind</span>: <span class="yv">cancel_trigger</span>
      <span class="yc"># CP-GATE-009: sintetiza awaited_by em funções kind:"cancel"</span>
      <span class="yc"># DA-CANCEL-001: dispatcher entra em modo cancelamento</span>

    <span class="yk">customer_notified_of_cancellation</span>:
      <span class="yk">description</span>: <span class="ys">"Customer informed of cancellation."</span>

    <span class="yk">cancellation_complete</span>:
      <span class="yk">description</span>: <span class="ys">"Cancellation settled across all providers."</span>
      <span class="yk">depends_on</span>:
        - <span class="yv">all_cancellables_rolled_back</span>
          <span class="yc"># sintetizado via CP-GATE-010</span>
        - <span class="yv">customer_notified_of_cancellation</span>

  <span class="yk">connections</span>:
    <span class="yk">payment_processor</span>:
      <span class="yk">applies_when</span>: <span class="ys">"all"</span>
      <span class="yk">gate_wiring</span>:
        <span class="yk">payment_settled</span>:
          <span class="yk">cleared_by</span>: [{<span class="yk">state</span>: <span class="yv">captured</span>}]

    <span class="yk">warehouse_x</span>:
      <span class="yk">applies_when</span>: <span class="ys">"fulfillment_mode = home_delivery"</span>
      <span class="yk">gate_wiring</span>:
        <span class="yk">deliverable_ready</span>:
          <span class="yk">cleared_by</span>: [{<span class="yk">state</span>: <span class="yv">packed</span>}]

    <span class="yk">store_x</span>:
      <span class="yk">applies_when</span>: <span class="ys">"fulfillment_mode in [pickup_in_store, delivery_from_store]"</span>
      <span class="yk">gate_wiring</span>:
        <span class="yk">deliverable_ready</span>:
          <span class="yk">cleared_by</span>:
            - {<span class="yk">state</span>: <span class="yv">packed</span>}
            - {<span class="yk">state</span>: <span class="yv">staged</span>}
        <span class="yk">customer_has_goods</span>:
          <span class="yk">cleared_by</span>: [{<span class="yk">state</span>: <span class="yv">handed_off</span>}]

    <span class="yc"># ... carrier_x, entitlement_x, notification_x, invoice_system, marketplace_x</span>`;

  document.getElementById('yaml-content').innerHTML = yaml;
  openModal('modal-yaml');
}

/* ── MODAL HELPERS ───────────────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

/* fechar modal clicando no overlay */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-ov')) {
    e.target.classList.remove('open');
  }
});

/* ── INIT ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderOrdersTable();
});
