let currentWorkflowId = null;
let WF_TASKS = [];
let WF_EDGES = [];

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = ''; });
  const el = document.getElementById('screen-' + name);
  if (!el) return;
  el.classList.add('active');
  if (name === 'workflow') el.style.display = 'flex';

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const isWorkflow = name === 'workflow' || name === 'workflow-list' || name === 'workflow-settings';
  const isAgent = name === 'agent-config';
  const navEl = document.getElementById(isAgent ? 'nav-agent' : isWorkflow ? 'nav-workflow' : 'nav-all-orders');
  if (navEl) navEl.classList.add('active');
  if (!isWorkflow && !isAgent) {
    const p = document.getElementById('nav-orders');
    if (p) p.classList.add('active');
  }
  if (name === 'workflow') renderWorkflowBoard();
  if (name === 'workflow-list') renderWorkflowList();
  if (name === 'workflow-settings') renderWorkflowSettings();
  if (name === 'agent-config') { el.style.display = 'flex'; initOrchChat(); setTimeout(renderOrchConnectors, 50); }
}

function renderWorkflowList() {
  const grid = document.getElementById('wfl-grid');
  if (!grid) return;

  function wfCardHtml(wf) {
    const archived = !!wf.archived;
    const statusDot = archived ? 'background:#9ca3af' : 'background:#22c55e';
    const statusLabel = archived ? 'Archived' : 'Active';
    const cardOpacity = archived ? 'opacity:.65' : '';
    return `
    <div class="wfl-card" onclick="openWorkflow('${wf.id}')" style="${cardOpacity}">
      <div class="wfl-card-header">
        <div class="wfl-icon" style="background:${wf.color}20">${wf.icon}</div>
        <div style="flex:1;min-width:0">
          <div class="wfl-name">${wf.name}${archived ? ' <span style="font-size:10px;font-weight:600;background:#f3f4f6;color:#6b7280;padding:1px 6px;border-radius:10px;vertical-align:middle">Archived</span>' : ''}</div>
          <div class="wfl-desc">${wf.description}</div>
        </div>
      </div>
      <div class="wfl-meta">
        <div class="wfl-meta-item"><span class="wfl-meta-label">Orders ativos</span><span class="wfl-meta-val">${wf.orderCount.toLocaleString('pt-BR')}</span></div>
        <div class="wfl-meta-item"><span class="wfl-meta-label">Stages</span><span class="wfl-meta-val">${wf.marcos.length}</span></div>
      </div>
      ${wf.marcos.length === 4 && wf.marcos[0] && wf.marcos[0].id === 'wf-payments' ? `
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 2px">
        ${wf.marcos.map(m => `<span style="font-size:10px;font-weight:600;background:${m.color}15;color:${m.color};border:1px solid ${m.color}30;padding:2px 7px;border-radius:10px">${m.icon} ${m.name}</span>`).join('')}
      </div>` : ''}
      <div class="wfl-card-footer">
        <div class="wfl-status"><div class="wfl-status-dot" style="${statusDot}"></div>${statusLabel}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();openWorkflowSettings('${wf.id}')" title="Settings">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="7" cy="7" r="2"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3 3l1.4 1.4M9.6 9.6L11 11M3 11l1.4-1.4M9.6 4.4L11 3"/></svg>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();toggleArchiveWorkflow('${wf.id}')" title="${archived ? 'Reativar workflow' : 'Arquivar workflow'}" style="${archived ? 'color:#059669' : ''}">
            ${archived
              ? `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M7 1v8M4 6l3 3 3-3"/><path d="M2 10v2h10v-2"/></svg> Reativar`
              : `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="1" y="4" width="12" height="2" rx=".5"/><path d="M2 6v6h10V6"/><path d="M5 9h4"/></svg> Arquivar`}
          </button>
          <button class="btn btn-sm" onclick="event.stopPropagation();deleteWorkflow('${wf.id}')" title="Delete workflow" style="background:transparent;border:1px solid #fca5a5;color:#dc2626;padding:4px 7px">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M2 4h10M5 4V2h4v2M5 6v5M9 6v5M3 4l1 8h6l1-8"/></svg>
          </button>
          <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();openWorkflow('${wf.id}')">Abrir →</button>
        </div>
      </div>
    </div>`;
  }

  const active   = WORKFLOW_DEFS.filter(w => !w.archived);
  const archived = WORKFLOW_DEFS.filter(w =>  w.archived);

  let html = '';
  if (active.length) {
    html += `<div style="margin-bottom:28px"><div class="wfl-grid">${active.map(wfCardHtml).join('')}</div></div>`;
  }

  if (archived.length) {
    html += `
      <div style="margin-bottom:28px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding-bottom:10px;border-bottom:2px solid #e5e7eb">
          <div style="width:32px;height:32px;border-radius:8px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">📁</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#6b7280">Archiveds</div>
            <div style="font-size:11.5px;color:#aaa;margin-top:1px">Workflows inativos — não recebem novos orders</div>
          </div>
          <span style="margin-left:auto;font-size:11px;font-weight:600;background:#f3f4f6;color:#6b7280;padding:2px 8px;border-radius:10px">${archived.length}</span>
        </div>
        <div class="wfl-grid">${archived.map(wfCardHtml).join('')}</div>
      </div>`;
  }

  grid.innerHTML = html;
}

let pendingDeleteWfId = null;
function toggleArchiveWorkflow(id) {
  const wf = WORKFLOW_DEFS.find(w => w.id === id); if (!wf) return;
  wf.archived = !wf.archived;
  renderWorkflowList();
  const msg = wf.archived
    ? `"${wf.name}" foi arquivado e não receberá novos orders.`
    : `"${wf.name}" foi reativado e voltará a receber orders.`;
  showSuccessModal(wf.archived ? 'Workflow arquivado' : 'Workflow reativado', msg);
}
function deleteWorkflow(id) {
  const wf = WORKFLOW_DEFS.find(w => w.id === id); if (!wf) return;
  pendingDeleteWfId = id;
  document.getElementById('wf-del-name').textContent = wf.name;
  openModal('modal-wf-delete');
}
function confirmDeleteWorkflow() {
  const idx = WORKFLOW_DEFS.findIndex(w => w.id === pendingDeleteWfId);
  if (idx !== -1) {
    const name = WORKFLOW_DEFS[idx].name;
    WORKFLOW_DEFS.splice(idx, 1);
    if (currentWorkflowId === pendingDeleteWfId) currentWorkflowId = null;
    pendingDeleteWfId = null;
    closeModal('modal-wf-delete');
    renderWorkflowList();
    showSuccessModal('Workflow excluído', `"${name}" foi removido permanentemente.`);
  }
}

function openTaskAction(orderId, itemIdx, taskType, taskIdx) {
  const items = ORDER_ITEMS[orderId]; if (!items) return;
  const item = items[itemIdx]; if (!item) return;
  let task;
  if (item.pipelines) {
    if (taskType === 'return') {
      task = (item.secondWorkflow?.tasks || [])[taskIdx];
    } else if (taskType.startsWith('pipeline_')) {
      const pIdx = parseInt(taskType.split('_')[1]);
      task = item.pipelines[pIdx]?.tasks[taskIdx];
    } else {
      // 'main' = first pipeline
      task = item.pipelines[0]?.tasks[taskIdx];
    }
  } else {
    const taskList = taskType === 'main' ? (item.tasks || []) : (item.secondWorkflow?.tasks || []);
    task = taskList[taskIdx];
  }
  if (!task || task.s !== 'pending') return;
  pendingTaskAction = { orderId, itemIdx, taskIdx, taskType, action: 'completed' };
  document.getElementById('ta-task-name').textContent = task.name;
  document.getElementById('ta-task-sup').textContent = task.sup || '';
  document.getElementById('ta-fail-reason-wrap').style.display = 'none';
  document.getElementById('ta-fail-reason-text').value = '';
  document.querySelectorAll('.ta-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('ta-opt-completed')?.classList.add('selected');
  openModal('modal-task-action');
}

function selectTaskAction(action) {
  pendingTaskAction.action = action;
  document.querySelectorAll('.ta-option').forEach(el => el.classList.remove('selected'));
  document.getElementById('ta-opt-' + action)?.classList.add('selected');
  document.getElementById('ta-fail-reason-wrap').style.display = action === 'canceled' ? 'block' : 'none';
}

function confirmTaskAction() {
  const { orderId, itemIdx, taskIdx, taskType, action } = pendingTaskAction;
  const items = ORDER_ITEMS[orderId]; if (!items) return;
  const item = items[itemIdx]; if (!item) return;
  let task;
  if (item.pipelines) {
    if (taskType === 'return') {
      task = (item.secondWorkflow?.tasks || [])[taskIdx];
    } else if (taskType.startsWith('pipeline_')) {
      const pIdx = parseInt(taskType.split('_')[1]);
      task = item.pipelines[pIdx]?.tasks[taskIdx];
    } else {
      task = item.pipelines[0]?.tasks[taskIdx];
    }
  } else {
    const taskList = taskType === 'main' ? (item.tasks || []) : (item.secondWorkflow?.tasks || []);
    task = taskList[taskIdx];
  }
  if (!task) return;
  if (action === 'canceled') {
    const reason = document.getElementById('ta-fail-reason-text').value.trim();
    if (!reason) { document.getElementById('ta-fail-reason-text').style.borderColor='#dc2626'; return; }
    task.s = 'canceled'; task.cancelReason = reason;
  } else {
    task.s = action;
  }
  closeModal('modal-task-action');
  const orderObj = ORDERS.find(o => o.id === orderId);
  if (orderObj) renderItemsWithTasks(orderObj);
  const labels = {completed:'concluída',canceled:'cancelada',ignored:'ignorada',pending:'marcada como pendente'};
  showSuccessModal('Task updated', `"${task.name}" foi ${labels[action]||action}.`);
}

function openWorkflow(id) {
  const wf = WORKFLOW_DEFS.find(w => w.id === id);
  if (!wf) return;
  currentWorkflowId = id;
  WF_TASKS = wf.marcos;
  WF_EDGES = wf.edges || [];
  const titleEl = document.getElementById('wf-board-title');
  const descEl  = document.getElementById('wf-board-desc');
  if (titleEl) titleEl.textContent = wf.name;
  if (descEl)  descEl.textContent  = wf.description;
  showScreen('workflow');
}

// ══════════════════════════════════════════
// ORDERS LIST
// ══════════════════════════════════════════

let taskTreeVisible = false;

function renderOrders() {
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = ORDERS.map((o, i) => {
    const returnItems = (ORDER_ITEMS[o.id]||[]).filter(item => item.secondWorkflow);
    const hasReturn = returnItems.length > 0;

    let statusCell, dotsCell;
    if (hasReturn) {
      const sw = returnItems[0].secondWorkflow;
      const activeTask = sw.tasks.find(t => t.s === 'pending') || sw.tasks.find(t => t.s === 'completed');
      const stepName = activeTask?.name || '';
      statusCell = `<span class="badge badge-return" style="white-space:nowrap">↩️ Em troca/dev.</span>
        ${stepName ? `<br><span style="font-size:10.5px;color:#9333ea;display:block;margin-top:2px">→ ${stepName}</span>` : ''}`;
      dotsCell = `<div class="processing-indicator">${sw.tasks.map(t =>
        `<div class="proc-dot ${t.s}" title="${t.name}" style="${t.s==='completed'?'background:#7c3aed':t.s==='pending'?'background:#a78bfa':''}"></div>`
      ).join('')}</div>`;
    } else {
      const sc = STATUS_CFG[o.orderStatus];
      statusCell = `<span class="badge ${sc.cls}">${sc.icon} ${sc.label}</span>`;
      dotsCell = o.tasks.length
        ? `<div class="processing-indicator">${o.tasks.map(t=>`<div class="proc-dot ${t.s}" title="${t.n}"></div>`).join('')}</div>`
        : '—';
    }

    const treeHtml = o.tasks.length
      ? `<div class="task-tree-mini">${o.tasks.map(t=>`<div class="task-mini-item"><div class="task-mini-dot dot-${t.s}"></div><span>${t.n}</span></div>`).join('')}</div>`
      : '—';

    return `<tr onclick="openOrder(${i})">
      <td style="white-space:nowrap">${statusCell}</td>
      <td>${dotsCell}</td>
      <td><div class="order-id-link">${o.id}<br><span style="font-size:11px;color:#888">${o.short}</span></div></td>
      <td style="font-size:12.5px">${o.date}</td>
      <td>${o.client}</td>
      <td style="text-align:center;font-weight:600">${o.items}</td>
      <td style="font-weight:500">${o.total}</td>
      <td style="font-size:12.5px;color:#888">${o.origin}</td>
      <td><div class="payment-toggle"></div></td>
      <td class="task-tree-col hidden">${treeHtml}</td>
    </tr>`;
  }).join('');
}

function toggleTaskTree() {
  taskTreeVisible = !taskTreeVisible;
  document.querySelectorAll('.task-tree-col').forEach(el => el.classList.toggle('hidden', !taskTreeVisible));
  document.getElementById('task-tree-header-col').classList.toggle('hidden', !taskTreeVisible);
  document.getElementById('task-tree-toggle').innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><path d="M2 4h3v3H2zM7 2h3v3H7zM7 8h3v3H7zM2 10h3v2H2z"/><path d="M5 5.5h2M5 11h2M10 3.5h2v9h-2"/></svg> ${taskTreeVisible ? 'Hide Tasks' : 'Show Tasks'}`;
}

// ══════════════════════════════════════════
// ORDER DETAIL
// ══════════════════════════════════════════

function openOrder(idx) {
  const o = ORDERS[idx];
  const sc = STATUS_CFG[o.orderStatus];
  document.getElementById('detail-order-id').textContent = o.id + ' (' + o.short + ')';
  const badge = document.getElementById('detail-status-badge');
  badge.textContent = sc.icon + ' ' + sc.label;
  badge.className = 'badge ' + sc.cls;
  badge.style.display = 'none';
  document.getElementById('detail-meta').textContent = o.date + ' • Vendido por recorrenciacharlie';
  document.getElementById('detail-client-name').textContent = o.client;
  document.getElementById('detail-client-name2').textContent = o.client;
  document.getElementById('detail-client-doc').textContent = '12681154448';
  document.getElementById('detail-items-val').textContent = o.total;
  document.getElementById('detail-total-val').textContent = o.total;
  document.getElementById('detail-pay-val').textContent = o.total;
  renderOrderStatus3Step(o.orderStatus, o.id);
  renderItemsWithTasks(o);
  showScreen('detail');
}

const MILESTONE_ORDER_IDS = ['1631888948228-01', '1631920951000-01'];

function renderOrderStatus3Step(status, orderId) {
  const steps = [
    {key:'not-processed',icon:'📋',label:'Not processed',sub:'Aguardando início das tarefas'},
    {key:'processing',icon:'⚙️',label:'Processing',sub:'Tasks sendo executadas'},
    {key:'processed',icon:'✅',label:'Processed',sub:'Todas as tarefas concluídas'},
  ];
  const activeIdx = steps.findIndex(s => s.key === status);
  const container = document.getElementById('order-status-steps');
  const card = container ? container.closest('.detail-status-card') : null;
  // "Order status" section is hidden for all orders; status is shown via pipeline accordions
  if (card) card.style.display = 'none';
  return;
  let html = '';
  steps.forEach((s, i) => {
    const isDone = i < activeIdx || (activeIdx === 2 && i === 2);
    const isActive = i === activeIdx && status !== 'canceled';
    const cls = isDone ? 'done' : isActive ? 'active' : 'waiting';
    html += `<div class="oss-step ${cls}"><div class="oss-step-icon">${s.icon}</div><div class="oss-step-label">${s.label}</div><div class="oss-step-sub">${s.sub}</div></div>`;
    if (i < steps.length - 1) html += `<div class="oss-arrow">→</div>`;
  });
  if (status === 'canceled') html += `<div style="margin-left:12px"><span class="badge badge-canceled">❌ Canceled</span></div>`;
  container.innerHTML = html;
}

// ── Group milestones (computed from pipeline task data) ──
function computeGroupMilestones(groupItems, order) {
  const allPipelines = groupItems.flatMap(item => item.pipelines || []);
  const isCanceled = order && order.orderStatus === 'canceled';
  const hasReturn  = groupItems.some(i => i.secondWorkflow);
  function statusOf(tasks) {
    if (!tasks.length) return 'nao_iniciado';
    if (tasks.every(t => t.s === 'completed')) return 'finalizado';
    if (tasks.some(t => t.s === 'canceled')) return 'cancelado';
    if (tasks.some(t => t.s === 'completed' || t.s === 'blocked')) return 'em_andamento';
    return 'nao_iniciado';
  }
  const payTasks  = allPipelines.filter(p => p.wfId === 'wf-payments').flatMap(p => p.tasks || []);
  const prepTasks = allPipelines.filter(p => p.wfId === 'wf-standard').flatMap(p => p.tasks || []);
  const nfeTasks  = allPipelines.filter(p => p.wfId === 'wf-nfe').flatMap(p => p.tasks || []);
  const recTasks  = allPipelines.filter(p => p.wfId === 'wf-delivery').flatMap(p => p.tasks || []);
  const payStatus = isCanceled && payTasks.every(t => t.s === 'completed') ? 'estorno' : statusOf(payTasks);
  const milestones = [
    { label:'Payment Confirmation', icon:'💳', status: payStatus },
    { label:'Preparando os itens',       icon:'📦', status: isCanceled ? 'cancelado' : statusOf(prepTasks) },
    { label:'Invoices Issued',             icon:'🧾', status: isCanceled ? 'cancelado' : statusOf(nfeTasks)  },
    { label:'Received by Customer',     icon:'📬', status: isCanceled ? 'cancelado' : statusOf(recTasks) },
  ];
  if (hasReturn) {
    const retItems = groupItems.filter(i => i.secondWorkflow);
    const retTasks = retItems.flatMap(i => (i.secondWorkflow.tasks || []));
    milestones.push({ label:'Returns & Exchanges', icon:'↩️', status: statusOf(retTasks) || 'em_andamento' });
  }
  return milestones;
}
function milestoneRowHtml(milestones) {
  const cfg = {
    finalizado:   { dot:'#15803d', text:'Finalizado',        bg:'#f0fdf4', border:'#bbf7d0', color:'#15803d' },
    em_andamento: { dot:'#1d4ed8', text:'Em andamento',      bg:'#eff6ff', border:'#bfdbfe', color:'#1d4ed8' },
    nao_iniciado: { dot:'#9ca3af', text:'Não iniciado',      bg:'#f9fafb', border:'#e5e7eb', color:'#6b7280' },
    cancelado:    { dot:'#dc2626', text:'Canceled',          bg:'#fef2f2', border:'#fecaca', color:'#dc2626' },
    estorno:      { dot:'#d97706', text:'Estorno realizado', bg:'#fffbeb', border:'#fde68a', color:'#b45309' },
  };
  return `<div style="display:grid;grid-template-columns:repeat(${milestones.length},1fr);gap:8px;margin:6px 0 10px">
    ${milestones.map(m => {
      const c = cfg[m.status] || cfg.nao_iniciado;
      return `<div style="background:${c.bg};border:1px solid ${c.border};border-radius:8px;padding:10px 8px;text-align:center">
        <div style="font-size:20px;margin-bottom:5px">${m.icon}</div>
        <div style="font-size:11px;font-weight:600;color:#1a1a1a;line-height:1.35;margin-bottom:6px">${m.label}</div>
        <div style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;color:${c.color}">
          <span style="width:6px;height:6px;border-radius:50%;background:${c.dot};flex-shrink:0;display:inline-block"></span>
          ${c.text}
        </div>
        ${m.note ? `<div style="margin-top:5px;font-size:10px;font-weight:600;color:#7c3aed;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:4px;padding:2px 6px;display:inline-block">${m.note}</div>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function toggleGroup(id) {
  const body = document.getElementById(id);
  const chevron = document.getElementById('chev-' + id);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : '';
  if (chevron) chevron.style.transform = open ? 'rotate(-90deg)' : 'rotate(0deg)';
}

function getItemGroupKey(item) {
  // Find primary delivery pipeline (first non-payment pipeline)
  const deliveryPipeline = (item.pipelines || []).find(p => p.wfId !== 'wf-payments');
  const wfName = deliveryPipeline ? deliveryPipeline.wfName : 'Delivery';
  const sellerKey = item.seller || '__main__';
  return sellerKey + '||' + wfName;
}

function renderItemsWithTasks(order) {
  const items = ORDER_ITEMS[order.id] || (ORDER_ITEMS[order.id] = genItems(order));
  document.getElementById('detail-items-count').textContent = items.length + (items.length === 1 ? ' item' : ' itens');
  const container = document.getElementById('detail-items-list');

  // Build group keys preserving order, deduplicating
  const groupOrder = [];
  const groupMap = {};
  items.forEach((item, idx) => {
    const key = getItemGroupKey(item);
    if (!groupMap[key]) {
      groupMap[key] = [];
      groupOrder.push(key);
    }
    groupMap[key].push(idx);
  });
  // Show group headers whenever there are 2+ items with pipeline data
  const needsGrouping = items.length > 1 && items.some(i => i.pipelines && i.pipelines.length);

  function buildPipeline(tasks, clickCtx) {
    return tasks.map((t, ti) => {
      const prevStatus = ti > 0 ? tasks[ti-1].s : null;
      const isBlocked = t.s === 'blocked';
      const isCanceled = t.s === 'canceled';
      const isCompleted = t.s === 'completed';
      const isIgnored = t.s === 'ignored';
      const isClickable = !!clickCtx && t.s === 'pending';
      const clickAttr = isClickable ? `onclick="openTaskAction('${clickCtx.orderId}',${clickCtx.itemIdx},'${clickCtx.taskType}',${ti})"` : '';
      const arrowCls = prevStatus === 'completed' ? 'completed-arrow' : prevStatus === 'canceled' ? 'canceled-arrow' : prevStatus === 'blocked' ? 'blocked-arrow' : '';
      const statusLabel = isBlocked ? 'Blocked' : isCompleted ? 'Completed' : isCanceled ? 'Canceled' : isIgnored ? 'Ignored' : 'Pending';
      const statusColor = isBlocked ? '#c2410c' : isCompleted ? '#15803d' : isCanceled ? '#dc2626' : isIgnored ? '#9ca3af' : '#6b7280';
      const circleClass = isBlocked ? 'blocked' : t.s;
      const icon = isCompleted
        ? `<svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5" width="10" height="10"><path d="M2 6l3 3 5-5"/></svg>`
        : (isCanceled || isBlocked)
          ? `<svg viewBox="0 0 12 12" fill="none" stroke="white" stroke-width="2.5" width="10" height="10"><path d="M2 2l8 8M10 2L2 10"/></svg>`
        : isIgnored
          ? `<svg viewBox="0 0 12 12" fill="none" stroke="#9ca3af" stroke-width="2.5" width="10" height="10"><path d="M2 6h8"/></svg>`
        : '';
      const cpHtml = (t.checkpoints||[]).length ? (() => {
        const total = t.checkpoints.length;
        const done = t.checkpoints.filter(cp => cp.s === 'completed').length;
        const failed = t.checkpoints.filter(cp => cp.s === 'failed').length;
        const partial = done > 0 && done < total;
        const allDone = done === total;
        const hasFailed = failed > 0;
        const color = hasFailed ? '#dc2626' : allDone ? '#15803d' : partial ? '#d97706' : '#6b7280';
        const label = hasFailed ? `${failed} falha` : allDone ? 'Completo' : partial ? `${done}/${total}` : `0/${total}`;
        return `<div style="font-size:8.5px;font-weight:600;color:${color};margin-top:1px;background:${hasFailed?'#fef2f2':allDone?'#f0fdf4':partial?'#fff7ed':'#f9f9f9'};padding:1px 4px;border-radius:3px">${label} ckpt</div>`;
      })() : '';
      return `<div class="pipe-step${isClickable?' clickable-step':''}" ${clickAttr}>
        ${ti > 0 ? `<div class="pipe-arrow ${arrowCls}"></div>` : ''}
        <div class="pipe-node ${isBlocked?'blocked':''}">
          <div class="pipe-circle ${circleClass}" title="${isBlocked ? (t.blockReason||'Blocked') : isClickable ? 'Clique para gerenciar' : statusLabel}">
            ${icon}
          </div>
          <div class="pipe-label">${t.name}</div>
          <div class="pipe-sup">${t.sup||''}</div>
          <div style="font-size:9.5px;font-weight:600;color:${statusColor};margin-top:1px">${statusLabel}</div>
          ${cpHtml}
          ${isBlocked && t.blockReason ? `<div class="pipe-label" style="font-size:9px;color:#c2410c;max-width:80px;text-align:center;line-height:1.2">${t.blockReason.substring(0,40)}…</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function wfBadge(state) {
    if (state==='completed') return `<span class="wf-sec-badge" style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d">Completed</span>`;
    if (state==='pending')   return `<span class="wf-sec-badge" style="background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8">Em andamento</span>`;
    if (state==='blocked')   return `<span class="wf-sec-badge" style="background:#fef2f2;border:1px solid #fecaca;color:#dc2626">Blocked</span>`;
    if (state==='canceled')  return `<span class="wf-sec-badge" style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c">Canceled</span>`;
    return `<span class="wf-sec-badge" style="background:#f9f9f9;border:1px solid #e0e0e0;color:#888">Aguardando</span>`;
  }

  const renderedCards = items.map((item, itemIdx) => {
    // ── Flatten all tasks for status analysis ──
    let allTasks = [];
    if (item.pipelines && item.pipelines.length) {
      allTasks = item.pipelines.flatMap(p => p.tasks);
    } else {
      allTasks = item.tasks || [];
    }

    // ── Task status analysis ──
    const allDone = allTasks.every(t => t.s === 'completed');
    const anyActive = allTasks.some(t => t.s === 'pending' || t.s === 'completed');
    const blockedTasks = allTasks.filter(t => t.s === 'blocked');
    const workflowState = blockedTasks.length ? 'blocked'
      : allDone ? 'completed'
      : anyActive ? 'pending' : 'waiting';

    // ── Item top badge ──
    let iSt, iStCls;
    if (item.secondWorkflow)      { iSt = '↩️ Em troca/dev.'; iStCls = 'badge-return'; }
    else if (blockedTasks.length) { iSt = '🚫 Blocked';      iStCls = 'badge-red'; }
    else if (allDone)             { iSt = '✅ Completed';      iStCls = 'badge-processed'; }
    else if (anyActive)           { iSt = '🔄 Em andamento';   iStCls = 'badge-processing'; }
    else                          { iSt = '⏳ Pending';        iStCls = 'badge-not-processed'; }

    // ── Context vars (hidden) ──
    const ctxVarsHtml = '';

    // ── Blocked panel ──
    const orchPanel = blockedTasks.length ? `
      <div class="orch-block-panel">
        <div class="orch-block-header">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="8" cy="8" r="6"/><path d="M8 5v4M8 11v.5"/></svg>
          Orquestrador detectou ${blockedTasks.length} bloqueio${blockedTasks.length>1?'s':''} neste item
        </div>
        ${blockedTasks.map(t => `
          <div class="orch-block-item">
            <div style="font-size:18px;flex-shrink:0">⚠️</div>
            <div style="flex:1;min-width:0">
              <div class="orch-block-task">${t.name} — não pode ser executada</div>
              <div class="orch-block-reason">${t.blockReason||''}</div>
              <div class="orch-block-source">${t.blockSource||''}</div>
              ${t.suggestion ? `<div class="orch-block-suggestion">
                <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M7 1v8M4 7l3 3 3-3"/><path d="M1 11h12"/></svg>
                Sugestão: ${t.suggestion}
              </div>` : ''}
            </div>
          </div>`).join('')}
        <div class="orch-block-actions">
          <button class="btn btn-primary btn-sm" style="flex:1;justify-content:center;background:#f97316;border-color:#f97316">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><circle cx="7" cy="5" r="3"/><path d="M1 13c0-2.8 2.7-4 6-4s6 1.2 6 4"/><circle cx="12" cy="3" r="1.5" fill="currentColor" stroke="none"/></svg>
            Aplicar sugestão do Agente
          </button>
          <button class="btn btn-secondary btn-sm" style="flex:1;justify-content:center">Escalar para Operador</button>
        </div>
      </div>` : '';

    // ── Multi-pipeline renderer ──
    let pipelineSection = '';
    if (item.pipelines && item.pipelines.length) {
      pipelineSection = item.pipelines.map((pipeline, pIdx) => {
        const pBadgeColor = pipeline.wfId === 'wf-payments' ? '#059669'
          : pipeline.wfId === 'wf-virtual' ? '#7c3aed'
          : pipeline.wfId === 'wf-personalization' ? '#e11d48'
          : pipeline.wfId === 'wf-services' ? '#0891b2'
          : pipeline.wfId === 'wf-nfe' ? '#d97706'
          : pipeline.wfId === 'wf-delivery' ? '#0284c7'
          : '#0c6fcd';
        const pBadgeBg = pipeline.wfId === 'wf-payments' ? '#f0fdf4'
          : pipeline.wfId === 'wf-virtual' ? '#f5f3ff'
          : pipeline.wfId === 'wf-personalization' ? '#fff1f2'
          : pipeline.wfId === 'wf-services' ? '#f0f9ff'
          : pipeline.wfId === 'wf-nfe' ? '#fffbeb'
          : pipeline.wfId === 'wf-delivery' ? '#f0f9ff'
          : '#eff6ff';
        const pIcon = pipeline.wfId === 'wf-payments' ? '💳'
          : pipeline.wfId === 'wf-virtual' ? '💻'
          : pipeline.wfId === 'wf-personalization' ? '🎨'
          : pipeline.wfId === 'wf-services' ? '🔧'
          : pipeline.wfId === 'wf-nfe' ? '🧾'
          : pipeline.wfId === 'wf-delivery' ? '🚚'
          : '📦';
        let triggerLabel = '';
        if (pIdx > 0 && pipeline.triggeredAt) {
          const byLabel = pipeline.triggeredBy === 'Agente AI' ? '🤖 Agente AI' : pipeline.triggeredBy === 'Shopper' ? '🛍️ Shopper' : '🏪 Merchant';
          triggerLabel = `<div style="display:flex;align-items:center;gap:5px;margin:4px 0 2px;font-size:11px;color:#888"><div style="width:1px;height:10px;background:#d0d0d0"></div>↓ Acionado por ${byLabel} · ${pipeline.triggeredAt}</div>`;
        } else if (pIdx > 0) {
          const wfDef = WORKFLOW_DEFS.find(w => w.id === pipeline.wfId);
          const trigLabel = wfDef && wfDef.trigger ? wfDef.trigger.label : '';
          triggerLabel = trigLabel ? `<div style="display:flex;align-items:center;gap:5px;margin:4px 0 2px;font-size:11px;color:#888"><div style="width:1px;height:10px;background:#d0d0d0"></div>↓ ${trigLabel}</div>` : '';
        }
        const taskType = pIdx === 0 ? 'main' : `pipeline_${pIdx}`;
        // compute pipeline status for the status pill
        const pTasks = pipeline.tasks || [];
        const pAllDone = pTasks.length && pTasks.every(t => t.s === 'completed');
        const pBlocked = pTasks.some(t => t.s === 'blocked');
        const pCanceled = pTasks.some(t => t.s === 'canceled');
        const pHasActive = pTasks.some(t => t.s === 'completed');
        const pStatusLabel = pBlocked ? 'Blocked' : pCanceled ? 'Canceled' : pAllDone ? 'Completed' : pHasActive ? 'Em andamento' : 'Não iniciado';
        const pStatusColor = pBlocked ? '#c2410c' : pCanceled ? '#dc2626' : pAllDone ? '#15803d' : pHasActive ? '#1d4ed8' : '#9ca3af';
        const pStatusBg   = pBlocked ? '#fff7ed' : pCanceled ? '#fef2f2' : pAllDone ? '#f0fdf4' : pHasActive ? '#eff6ff' : '#f9fafb';
        const pipId = `pip-${order.id}-${itemIdx}-${pIdx}`;
        return `${triggerLabel}
          <button onclick="toggleGroup('${pipId}')" style="width:100%;display:flex;align-items:center;gap:10px;margin-bottom:4px;margin-top:${pIdx===0?'0':'12px'};padding:8px 12px;background:${pBadgeBg};border:none;border-left:3px solid ${pBadgeColor};border-radius:0 6px 6px 0;cursor:pointer;text-align:left;transition:filter .15s" onmouseenter="this.style.filter='brightness(.97)'" onmouseleave="this.style.filter=''">
            <span style="font-size:18px;line-height:1">${pIcon}</span>
            <span style="font-size:13px;font-weight:700;color:${pBadgeColor};flex:1">${pipeline.wfName}</span>
            <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:${pStatusBg};color:${pStatusColor};border:1px solid ${pStatusColor}25">${pStatusLabel}</span>
            <svg id="chev-${pipId}" viewBox="0 0 12 12" fill="none" stroke="${pBadgeColor}" stroke-width="2.2" width="12" height="12" style="flex-shrink:0;transition:transform .2s;margin-left:6px;transform:rotate(-90deg)"><path d="M2 4l4 4 4-4"/></svg>
          </button>
          <div id="${pipId}" style="overflow:hidden;display:none">
            <div class="item-pipeline" style="padding-bottom:4px">${buildPipeline(pipeline.tasks, {orderId:order.id,itemIdx,taskType})}</div>
          </div>`;
      }).join('') + ctxVarsHtml + orchPanel;
    } else {
      // fallback for old flat tasks
      pipelineSection = `<div class="item-pipeline">${buildPipeline(allTasks, {orderId:order.id,itemIdx,taskType:'main'})}</div>${ctxVarsHtml}${orchPanel}`;
    }

    // ── Returns chain ──
    let chainHtml = '';
    if (item.secondWorkflow) {
      const sw = item.secondWorkflow;
      const swState = sw.tasks.every(t=>t.s==='completed') ? 'completed' : sw.tasks.some(t=>t.s==='pending') ? 'pending' : 'waiting';
      const ri = item.returnInfo;
      let returnInfoHtml = '';
      if (ri) {
        const initiatorLabel = ri.initiator==='agent' ? '🤖 Agente AI' : ri.initiator==='shopper' ? '🛍️ Shopper' : '🏪 Merchant';
        const initiatorCls   = ri.initiator==='agent' ? 'ric-badge-agent' : ri.initiator==='shopper' ? 'ric-badge-shopper' : 'ric-badge-merchant';
        const diagHtml = ri.agentDiagnosis ? `
          <div class="ric-agent-diagnosis">
            <div class="ric-diagnosis-header">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" width="12" height="12"><circle cx="7" cy="7" r="5.5"/><path d="M7 4.5v3M7 9v.5"/></svg>
              Diagnóstico do Agente
              <span class="ric-diagnosis-tag">confiança ${ri.agentDiagnosis.confidence}%</span>
            </div>
            ${ri.agentDiagnosis.insights.map(ins => `
            <div class="ric-insight">
              <span class="ric-insight-icon">${ins.icon}</span>
              <div>
                <div class="ric-insight-label">${ins.label}</div>
                <div class="ric-insight-desc">${ins.desc}</div>
              </div>
            </div>`).join('')}
          </div>` : (ri.agentJustification ? `
          <div class="ric-agent-note">
            <div class="ric-agent-note-title">
              <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11" style="color:#7c3aed"><circle cx="7" cy="7" r="5"/><path d="M7 4v4M7 9.5v.5"/></svg>
              Diagnóstico do Agente
            </div>
            <div style="font-size:12px;color:#555;line-height:1.6">${ri.agentJustification}</div>
          </div>` : '');
        returnInfoHtml = `
          <div class="return-info-card">
            <div class="ric-initiator-row">
              <span class="ric-badge ${initiatorCls}">${initiatorLabel}</span>
              <span class="ric-time">Iniciado em ${ri.initiatedAt}</span>
            </div>
            <div class="ric-field"><span class="ric-label">Motivo</span><span class="ric-reason">${ri.reasonLabel}</span></div>
            <div class="ric-field"><span class="ric-label">Description</span><span class="ric-desc">${ri.description}</span></div>
            ${diagHtml}
          </div>`;
      }
      const separatorBy = ri ? (ri.initiator==='agent' ? 'por Agente AI' : ri.initiator==='shopper' ? 'por Shopper' : 'por Merchant') : `por ${sw.triggeredBy}`;
      // Status pill — same logic as pipelines
      const swTasks = sw.tasks || [];
      const swAllDone  = swTasks.length && swTasks.every(t => t.s === 'completed');
      const swBlocked  = swTasks.some(t => t.s === 'blocked');
      const swCanceled = swTasks.some(t => t.s === 'canceled');
      const swHasActive= swTasks.some(t => t.s === 'completed');
      const swStatusLabel = swBlocked?'Blocked':swCanceled?'Canceled':swAllDone?'Completed':swHasActive?'Em andamento':'Não iniciado';
      const swStatusColor = swBlocked?'#c2410c':swCanceled?'#dc2626':swAllDone?'#15803d':swHasActive?'#1d4ed8':'#9ca3af';
      const swStatusBg    = swBlocked?'#fff7ed':swCanceled?'#fef2f2':swAllDone?'#f0fdf4':swHasActive?'#eff6ff':'#f9fafb';
      const swBadgeColor  = '#7c3aed';
      const swBadgeBg     = '#f5f3ff';
      const retPipId = `ret-${order.id}-${itemIdx}`;
      chainHtml = `
        <div style="display:flex;align-items:center;gap:5px;margin:8px 0 2px;font-size:11px;color:#888"><div style="width:1px;height:10px;background:#d0d0d0"></div>↓ Acionado ${separatorBy} · ${sw.triggeredAt}</div>
        <button onclick="toggleGroup('${retPipId}')" style="width:100%;display:flex;align-items:center;gap:10px;margin-bottom:4px;margin-top:4px;padding:8px 12px;background:${swBadgeBg};border:none;border-left:3px solid ${swBadgeColor};border-radius:0 6px 6px 0;cursor:pointer;text-align:left;transition:filter .15s" onmouseenter="this.style.filter='brightness(.97)'" onmouseleave="this.style.filter=''">
          <span style="font-size:18px;line-height:1">↩️</span>
          <span style="font-size:13px;font-weight:700;color:${swBadgeColor};flex:1">${sw.wfName || 'Returns & Exchanges'}</span>
          <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:10px;background:${swStatusBg};color:${swStatusColor};border:1px solid ${swStatusColor}25">${swStatusLabel}</span>
          <svg id="chev-${retPipId}" viewBox="0 0 12 12" fill="none" stroke="${swBadgeColor}" stroke-width="2.2" width="12" height="12" style="flex-shrink:0;transition:transform .2s;margin-left:6px;transform:rotate(-90deg)"><path d="M2 4l4 4 4-4"/></svg>
        </button>
        <div id="${retPipId}" style="overflow:hidden;display:none">
          ${returnInfoHtml}
          <div class="item-pipeline" style="padding-bottom:4px">${buildPipeline(sw.tasks, {orderId:order.id,itemIdx,taskType:'return'})}</div>
        </div>`;
    }

    const sellerBadge = item.seller ? `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:1px 7px;border-radius:10px;background:#f0f4ff;color:#3b5bdb;border:1px solid #c5d0f5;margin-left:4px">🏪 ${item.seller}</span>` : '';
    const serviceBadge = item.isService ? `<span style="display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:600;padding:1px 7px;border-radius:10px;background:#f0f9ff;color:#0891b2;border:1px solid #bae6fd">🔧 Serviço</span>` : '';
    const cardHtml = `<div class="item-task-card">
      <div class="item-card-header">
        <div class="item-product-img">${item.emoji}</div>
        <div style="flex:1">
          <div class="item-product-name">${item.name}</div>
          <div class="item-product-meta">Qtd: ${item.qty} · ${item.price}${item.seller ? '' : ''}</div>
          <div style="margin-top:3px;display:flex;gap:4px;flex-wrap:wrap">${item.seller ? sellerBadge : ''}${item.isService ? serviceBadge : ''}</div>
        </div>
      </div>
      ${pipelineSection}
      ${chainHtml}
    </div>`;
    return { html: cardHtml, kitGroupId: item.kitGroupId || null, kitGroupName: item.kitGroupName || null };
  });

  // Build flat ordered index array for kit grouping
  const flatIndexByGroup = needsGrouping
    ? groupOrder.map(key => groupMap[key])
    : [items.map((_, idx) => idx)];

  let finalHtml = '';

  if (needsGrouping) {
    groupOrder.forEach((key, gIdx) => {
      const parts = key.split('||');
      const seller = parts[0] === '__main__' ? null : parts[0];
      const wfName = parts[1] || 'Delivery';
      const groupIndices = groupMap[key];
      const count = groupIndices.length;
      // Derive delivery supplier from the last task of the primary pipeline of the first item
      const firstItem = items[groupIndices[0]];
      const deliveryPipeline = (firstItem.pipelines || []).find(p => p.wfId !== 'wf-payments');
      const pipelineTasks = deliveryPipeline ? deliveryPipeline.tasks : [];
      const allFirstItemTasks = (firstItem.pipelines || []).flatMap(p => p.tasks || []);
      const carrierTask = allFirstItemTasks.find(t => /rastreio|despachado|entregue|retirada/i.test(t.name));
      const deliverySup = (carrierTask ? carrierTask.sup : null) || (pipelineTasks.length ? pipelineTasks[pipelineTasks.length-1].sup : null) || seller || '';
      const icon = seller ? '🏪' : '🏭';
      const groupLabel = wfName === 'Item Preparation'
        ? (seller ? 'Retirada em loja' : 'Delivery em Domicílio')
        : wfName;
      const title = (deliveryPipeline && deliveryPipeline.wfId === 'wf-services')
        ? groupLabel
        : groupLabel + (deliverySup ? ' · ' + deliverySup : '');
      const gId = 'grp-' + order.id + '-' + gIdx;
      const groupItems = groupIndices.map(idx => items[idx]);
      const showMilestones = groupItems.some(i => i.pipelines && i.pipelines.length);

      // Accordion header
      finalHtml += `
<div style="margin-top:${gIdx===0?'0':'16px'};margin-bottom:2px">
  <button onclick="toggleGroup('${gId}')" style="width:100%;display:flex;align-items:center;gap:10px;padding:9px 14px;background:#f8faff;border:1px solid #dce8ff;border-left:3px solid #0c6fcd;border-radius:6px;cursor:pointer;text-align:left;transition:background .15s" onmouseenter="this.style.background='#eef4ff'" onmouseleave="this.style.background='#f8faff'">
    <span style="font-size:16px;line-height:1">${icon}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:12px;font-weight:700;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</div>
      <div style="font-size:11px;color:#666">${count} item${count !== 1 ? 's' : ''}</div>
    </div>
    <svg id="chev-${gId}" viewBox="0 0 12 12" fill="none" stroke="#0c6fcd" stroke-width="2.2" width="13" height="13" style="flex-shrink:0;transition:transform .2s"><path d="M2 4l4 4 4-4"/></svg>
  </button>
  ${showMilestones ? milestoneRowHtml(computeGroupMilestones(groupItems, order)) : ''}
  <div id="${gId}" style="padding:6px 0 0">`;

      // Render items in this group with kit handling
      let gi = 0;
      while (gi < groupIndices.length) {
        const itemIdx = groupIndices[gi];
        const card = renderedCards[itemIdx];
        if (card.kitGroupId) {
          const groupId = card.kitGroupId;
          const groupName = card.kitGroupName || 'Kit';
          const kitCards = [];
          while (gi < groupIndices.length && renderedCards[groupIndices[gi]].kitGroupId === groupId) {
            kitCards.push(renderedCards[groupIndices[gi]].html);
            gi++;
          }
          finalHtml += `
        <div style="border:2px dashed #d97706;border-radius:8px;padding:4px;margin-bottom:12px;background:#fffbeb">
          <div style="font-size:11px;font-weight:700;color:#b45309;padding:6px 10px 4px;display:flex;align-items:center;gap:6px">
            <span style="font-size:14px">📦</span> ${groupName}
            <span style="font-size:10px;background:#fef3c7;border:1px solid #fde68a;color:#92400e;padding:1px 6px;border-radius:10px;font-weight:500">Kit</span>
          </div>
          ${kitCards.join('')}
        </div>`;
        } else {
          finalHtml += card.html;
          gi++;
        }
      }

      // Close accordion body + wrapper
      finalHtml += `</div></div>`;
    });
  } else {
    // No grouping needed — show milestones if the single item has pipeline data
    if (items.some(item => item.pipelines && item.pipelines.length)) {
      finalHtml += milestoneRowHtml(computeGroupMilestones(items, order));
    }
    let i = 0;
    while (i < renderedCards.length) {
      const card = renderedCards[i];
      if (card.kitGroupId) {
        const groupId = card.kitGroupId;
        const groupName = card.kitGroupName || 'Kit';
        const groupCards = [];
        while (i < renderedCards.length && renderedCards[i].kitGroupId === groupId) {
          groupCards.push(renderedCards[i].html);
          i++;
        }
        finalHtml += `
        <div style="border:2px dashed #d97706;border-radius:8px;padding:4px;margin-bottom:12px;background:#fffbeb">
          <div style="font-size:11px;font-weight:700;color:#b45309;padding:6px 10px 4px;display:flex;align-items:center;gap:6px">
            <span style="font-size:14px">📦</span> ${groupName}
            <span style="font-size:10px;background:#fef3c7;border:1px solid #fde68a;color:#92400e;padding:1px 6px;border-radius:10px;font-weight:500">Kit</span>
          </div>
          ${groupCards.join('')}
        </div>`;
      } else {
        finalHtml += card.html;
        i++;
      }
    }
  }
  container.innerHTML = finalHtml;
}

function genItems(order) {
  const emojis = ['📦','🛍️','🧴','👕','📱'];
  const ts = order.tasks.length ? order.tasks : [{n:'Payment Authorization',s:'completed'},{n:'Payment Capture',s:'completed'},{n:'Picking',s:'pending'},{n:'Quality Check',s:'pending'},{n:'Packing',s:'pending'},{n:'Shipping',s:'pending'},{n:'Delivered',s:'pending'}];
  return Array.from({length: Math.min(order.items, 3)}, (_, i) => ({
    name: 'Produto ' + (i+1), emoji: emojis[i % emojis.length], qty: 1, price: 'R$ ' + Math.round(parseFloat(order.total.replace('R$ ','').replace('.','').replace(',','.')) / order.items).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.') + ',00',
    tasks: ts.map(t => ({name:t.n, sup:'CD São Paulo', s:t.s}))
  }));
}

// ══════════════════════════════════════════
// WORKFLOW BOARD
// ══════════════════════════════════════════

let selectedTaskId = null, pendingDeleteId = null, pendingEdgeId = null;
let pendingTaskAction = { orderId:null, itemIdx:null, taskIdx:null, taskType:null, action:'start' };
let pendingDragFrom = null, pendingDragTo = null;
let dragTaskId = null;
let editChatState = 'idle', editDraft = {}, activePanel = 'create';
let chatStep = 0, newTaskDraft = {};
let bulkChatState = 'idle';
let bulkDraft = {
  operation: null, workflowIds: [], name: '', position: null,
  afterStageName: '', targetStageId: null, tasks: [],
  similarityWarnings: [], impactWarnings: []
};

function renderWorkflowBoard() {
  renderKanban();
}

function renderFlowBar() {
  const bar = document.getElementById('wf-flow-bar');
  if (!bar) return;
  let html = '';
  WF_TASKS.forEach((stage, i) => {
    if (i > 0) {
      const edge = WF_EDGES.find(e => e.from === WF_TASKS[i-1].id && e.to === stage.id);
      html += `<span class="flow-pill-arrow">${edge && !edge.active ? '⇢' : '→'}</span>`;
    }
    const isActive = (stage.tasks||[]).some(t => t.active !== false);
    html += `<span class="flow-pill ${isActive?'':'inactive-pill'}" style="background:${stage.color}20;border-color:${stage.color};color:${stage.color}" onclick="selectTaskFromPill('${stage.id}')">${i+1}. ${stage.name}</span>`;
  });
  bar.innerHTML = html;
}

function renderKanban() {
  const scroll = document.getElementById('wf-board-scroll');
  let html = '';
  WF_TASKS.forEach((stage, i) => {
    if (i > 0) {
      const edge = WF_EDGES.find(e => e.from === WF_TASKS[i-1].id && e.to === stage.id);
      const eActive = edge ? edge.active : true;
      const eId = edge ? edge.id : null;
      html += `<div class="col-connector">
        <div class="connector-line ${eActive?'':'inactive'}"></div>
        <span class="connector-arrow">▶</span>
        <div class="connector-badge ${eActive?'':'inactive'}" ${eId?`onclick="openEdgeModal('${eId}')"`:''}>${eActive?'Ativa':'Inativa'}</div>
      </div>`;
    }
    const stageTasks = stage.tasks || [];
    html += `<div class="kanban-col" id="col-${stage.id}" ondragover="event.preventDefault();dragOverCol('${stage.id}')" ondrop="dropOnCol('${stage.id}')" ondragleave="dragLeaveCol('${stage.id}')">
      <div class="kanban-col-header">
        <div class="col-num" style="background:${stage.color}">${i+1}</div>
        <span class="col-title" title="${stage.name}">${stage.name}</span>
        <button class="col-menu-btn" onclick="renameStage('${stage.id}')">⋯</button>
      </div>
      <div class="kanban-col-body">`;
    stageTasks.forEach(subTask => {
      const isSel = selectedTaskId === subTask.id;
      html += `<div class="task-card ${isSel?'selected':''}" id="card-${subTask.id}" draggable="true" ondragstart="dragStart(event,'${subTask.id}')" ondragend="dragEnd(event)" onclick="selectTask('${subTask.id}')">
          <div class="card-top">
            <div class="card-name">${subTask.name}</div>
            <div class="card-actions-row">
              <button class="card-btn" title="Editar" onclick="event.stopPropagation();editTask('${subTask.id}')"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M9 2l3 3L4 13H1v-3L9 2z"/></svg></button>
              <button class="card-btn" title="Dividir tarefa" onclick="event.stopPropagation();openSplitPanel('${subTask.id}')" style="font-size:12px;font-weight:700">✂</button>
              <button class="card-btn danger" title="Delete" onclick="event.stopPropagation();deleteTask('${subTask.id}')"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M2 4h10M5 4V2h4v2M5 6v5M9 6v5M3 4l1 8h6l1-8"/></svg></button>
            </div>
          </div>
          <div class="card-tags">
            <span class="card-tag tag-category">${subTask.category||''}</span>
            ${(typeof TASK_SLOT_MAP !== 'undefined' && TASK_SLOT_MAP[subTask.id]) ? (() => {
              const sl = TASK_SLOT_MAP[subTask.id];
              const cn = getSlotConnectorName(currentWorkflowId, sl);
              return cn ? `<span class="card-tag" style="background:#f5f3ff;color:#7c3aed;border-color:#ddd6fe;font-size:9px" title="Slot: ${sl}">${sl.replace('_x','·x')} ${cn}</span>` : '';
            })() : ''}
          </div>
          ${subTask.checkpoints?.length ? `
          <div style="margin-top:5px;display:flex;gap:3px;flex-wrap:wrap">
            ${subTask.checkpoints.slice(0,3).map(cp => `<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-weight:500">✓ ${cp.label.substring(0,18)}${cp.label.length>18?'…':''}</span>`).join('')}
            ${subTask.checkpoints.length > 3 ? `<span style="font-size:9px;color:#9ca3af">+${subTask.checkpoints.length-3}</span>` : ''}
          </div>` : ''}
          <div class="card-footer">
            ${i > 0 ? `<span class="card-dep"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M2 6h8M7 3l3 3-3 3"/></svg> ${WF_TASKS[i-1].name}</span>` : `<span class="card-dep" style="color:#22c55e">Tarefa inicial</span>`}
            <div style="display:flex;align-items:center;gap:4px">
              ${subTask.mcpConfig ? `<span title="MCP: ${subTask.mcpConfig.serverName}" style="font-size:9px;padding:1px 5px;border-radius:3px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-weight:600;line-height:1.6">MCP</span>` : ''}
              ${subTask.agentConfig ? `<span title="${subTask.agentConfig.agentName}" style="font-size:11px;line-height:1">${subTask.agentConfig.agentIcon}</span>` : ''}
              ${subTask.visibility === 'internal'
                ? `<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:#f5f3ff;border:1px solid #e9d5ff;color:#7c3aed;font-weight:600;line-height:1.6">🔒 Interna</span>`
                : `<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-weight:600;line-height:1.6">👤 Usuário</span>`
              }
              <div class="card-status-dot" style="background:${subTask.active!==false?'#22c55e':'#ef4444'}" title="${subTask.active!==false?'Ativa':'Inativa'}"></div>
            </div>
          </div>
        </div>`;
    });
    html += `<div class="add-task-card" onclick="addTaskToStage('${stage.id}')">
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M7 2v10M2 7h10"/></svg>
          Adicionar aqui
        </div>
      </div>
    </div>`;
  });
  html += `<button class="add-col-btn" onclick="openCreatePanel()"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M8 2v12M2 8h12"/></svg> New Stage</button>`;
  scroll.innerHTML = html;
}

function findSubTask(taskId) {
  for (const stage of WF_TASKS) {
    const task = (stage.tasks || []).find(t => t.id === taskId);
    if (task) return { stage, task };
  }
  return null;
}

// ── Drag & Drop ──
function dragStart(e, subTaskId) {
  // Find the stage that owns this sub-task
  const found = findSubTask(subTaskId);
  dragTaskId = found ? found.stage.id : subTaskId;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => { const c = document.getElementById('card-'+subTaskId); if(c) c.classList.add('dragging'); }, 0);
}
function dragEnd(e) {
  document.querySelectorAll('.task-card').forEach(c => c.classList.remove('dragging'));
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
}
function dragOverCol(id) {
  if (dragTaskId === id) return;
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
  const col = document.getElementById('col-'+id); if(col) col.classList.add('drag-over');
}
function dragLeaveCol(id) { const col = document.getElementById('col-'+id); if(col) col.classList.remove('drag-over'); }
function dropOnCol(targetId) {
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
  if (!dragTaskId || dragTaskId === targetId) return;
  const from = WF_TASKS.find(s => s.id === dragTaskId);
  const to   = WF_TASKS.find(s => s.id === targetId);
  if (!from || !to) return;
  pendingDragFrom = dragTaskId; pendingDragTo = targetId;
  document.getElementById('modal-reorder-body').textContent = `Mover "${from.name}" para a posição de "${to.name}"?`;
  openModal('modal-reorder');
}
function confirmReorder() {
  const fi = WF_TASKS.findIndex(s => s.id === pendingDragFrom);
  const ti = WF_TASKS.findIndex(s => s.id === pendingDragTo);
  if (fi !== -1 && ti !== -1) { const [m] = WF_TASKS.splice(fi, 1); WF_TASKS.splice(ti, 0, m); }
  closeModal('modal-reorder'); renderWorkflowBoard();
}

// ── Select / Edit (Agentic) ──
function selectTask(id) { selectedTaskId = id; editTask(id); }
function selectTaskFromPill(stageId) {
  // selectTask by first sub-task in this stage
  const stage = WF_TASKS.find(s => s.id === stageId);
  if (stage && stage.tasks && stage.tasks.length) selectTask(stage.tasks[0].id);
  const col = document.getElementById('col-'+stageId);
  if (col) col.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
}

function editTask(id) {
  const found = findSubTask(id); if (!found) return;
  const task = found.task;
  const stage = found.stage;
  selectedTaskId = id;
  activePanel = 'edit';
  editChatState = 'idle';
  editDraft = {
    name: task.name, supplier: task.supplier, category: task.category,
    color: stage.color, active: task.active !== false,
    visibility: task.visibility || 'user',
    script: task.script !== undefined ? task.script : null,
    externalApi: task.externalApi ? {
      url: task.externalApi.url||'', method: task.externalApi.method||'POST',
      responseMapping: (task.externalApi.responseMapping||[]).map(m=>({...m}))
    } : null,
    mcpConfig: task.mcpConfig ? {...task.mcpConfig} : null,
    agentConfig: task.agentConfig ? {...task.agentConfig} : null,
  };
  document.getElementById('sp-title').textContent = '🤖 Editar com Agente';
  document.getElementById('sp-body').innerHTML = `
    <div id="edit-preview" style="padding:10px 12px;background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;font-size:12px"></div>
    <div class="cm-msgs" id="cm-msgs"></div>
    <div class="cm-suggestions" id="cm-suggestions"></div>
    <div class="cm-input-row">
      <input class="cm-input" id="cm-input" placeholder="O que deseja alterar?" onkeydown="if(event.key==='Enter')sendEditChat()">
      <button class="cm-send" onclick="sendEditChat()"><svg viewBox="0 0 16 16" stroke="white" stroke-width="2" fill="none" width="13" height="13"><path d="M2 8l12-6-4 12-3-4-5-2z"/></svg></button>
    </div>`;
  document.getElementById('sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeSidePanel()">Cancel</button>
    <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="applyEditDraft()">Save Alterações</button>`;
  refreshEditPreview();
  openSidePanel(); renderKanban();
  setTimeout(() => {
    let greeting = `Editando "${task.name}".\n\nConfiguração atual:\n• Category: ${task.category}`;
    greeting += `\n• Visibility: ${task.visibility === 'internal' ? 'Interna (não visível no pedido)' : 'Usuário (visível no pedido)'}`;
    if (task.externalApi) greeting += `\n• API externa: ${task.externalApi.url}`;
    if (task.script !== null && task.script !== undefined) greeting += `\n• Script customizado: ativo`;
    if (task.mcpConfig) greeting += `\n• MCP: ${task.mcpConfig.serverName} → ${task.mcpConfig.toolName||'tool não configurada'}`;
    if (task.agentConfig) greeting += `\n• Agente AI: ${task.agentConfig.agentIcon} ${task.agentConfig.agentName}`;
    greeting += '\n\nO que deseja alterar?';
    addCMsg('ai', greeting);
    renderCSuggs(['Renomear','Alternar visibilidade','Integração MCP','Agente AI Workspace','Script customizado']);
  }, 200);
}

function refreshEditPreview() {
  const ep = document.getElementById('edit-preview'); if (!ep) return;
  const dot = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${editDraft.color||'#0c6fcd'};margin-right:5px;vertical-align:middle;flex-shrink:0"></span>`;
  const visHtml = editDraft.visibility === 'internal'
    ? `<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#f5f3ff;border:1px solid #e9d5ff;color:#7c3aed;font-weight:500">🔒 Interna</span>`
    : `<span style="font-size:10px;padding:1px 5px;border-radius:3px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-weight:500">👤 Usuário</span>`;
  ep.innerHTML = `
    <div style="display:flex;align-items:center;gap:4px;font-weight:700;color:#1a1a1a;margin-bottom:5px;flex-wrap:wrap">
      ${dot}<span>${editDraft.name||'—'}</span>
      <span style="font-size:10px;padding:1px 6px;border-radius:10px;background:${editDraft.active?'#f0fdf4':'#fef2f2'};border:1px solid ${editDraft.active?'#bbf7d0':'#fecaca'};color:${editDraft.active?'#15803d':'#dc2626'};font-weight:500;margin-left:2px">${editDraft.active?'Ativa':'Inativa'}</span>
    </div>
    <div style="color:#555;font-size:11.5px;margin-bottom:3px"><span style="font-weight:500">Cat:</span> ${editDraft.category||'—'}</div>
    <div style="font-size:11.5px;line-height:1.8"><span style="font-weight:500">Visibility:</span> ${visHtml}</div>
    ${editDraft.script!==null&&editDraft.script!==undefined?'<div style="color:#7c3aed;font-size:10.5px;margin-top:3px">📜 Script customizado ativo</div>':''}
    ${editDraft.externalApi?`<div style="color:#0891b2;font-size:10.5px;margin-top:2px">🌐 ${editDraft.externalApi.method} ${editDraft.externalApi.url||'(URL não definida)'}</div>`:''}
    ${editDraft.mcpConfig?`<div style="color:#15803d;font-size:10.5px;margin-top:2px">🔌 MCP: ${editDraft.mcpConfig.serverName} → <code style="font-family:monospace">${editDraft.mcpConfig.toolName||'(tool não selecionada)'}</code></div>`:''}
    ${editDraft.agentConfig?`<div style="color:#7c3aed;font-size:10.5px;margin-top:2px">${editDraft.agentConfig.agentIcon} Agente: ${editDraft.agentConfig.agentName}</div>`:''}`;
}

function sendEditChat() {
  const input = document.getElementById('cm-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  input.value = ''; addCMsg('user', text);
  document.getElementById('cm-suggestions').innerHTML = '';
  processEditIntent(text);
}

function processEditIntent(text) {
  const lower = text.toLowerCase();
  const idleSuggs = ['Renomear','Alternar visibilidade','Integração MCP','Agente AI Workspace','Save e fechar'];

  if (lower === 'salvar e fechar' || lower === 'salvar') { applyEditDraft(); return; }

  if (editChatState === 'rename') {
    editDraft.name = text; editChatState = 'idle'; refreshEditPreview();
    setTimeout(() => { addCMsg('ai', `✓ Nome alterado para "${text}". Mais alguma alteração?`); renderCSuggs(['Alternar visibilidade','Script customizado','Save e fechar']); }, 350);

  } else if (editChatState === 'category') {
    editDraft.category = text; editChatState = 'idle'; refreshEditPreview();
    setTimeout(() => { addCMsg('ai', `✓ Category definida como "${text}". Mais alguma alteração?`); renderCSuggs(['Renomear','Alternar visibilidade','Save e fechar']); }, 350);

  } else if (editChatState === 'script-describe') {
    const generated = generateScript(text);
    editDraft.script = generated; editChatState = 'script-review'; refreshEditPreview();
    setTimeout(() => {
      addCMsg('ai', `Script gerado:\n\n${generated}\n\nEste código atende ao que você precisa?`);
      renderCSuggs(['Confirm script','Ajustar descrição','Remover script']);
    }, 500);

  } else if (editChatState === 'script-review') {
    if (lower.includes('remover') || lower.includes('excluir') || lower.includes('cancelar')) {
      editDraft.script = null; editChatState = 'idle'; refreshEditPreview();
      setTimeout(() => { addCMsg('ai', '✓ Script removido. Mais alguma alteração?'); renderCSuggs(['Alternar visibilidade','API externa','Save e fechar']); }, 350);
    } else if (lower.includes('ajustar') || lower.includes('nova') || lower.includes('reescrever') || lower.includes('mudar')) {
      editChatState = 'script-describe';
      setTimeout(() => { addCMsg('ai', 'Descreva novamente o que o script deve fazer e vou gerar uma versão atualizada.'); }, 350);
    } else {
      editChatState = 'idle'; refreshEditPreview();
      setTimeout(() => { addCMsg('ai', '✓ Script confirmado. Mais alguma alteração?'); renderCSuggs(['Alternar visibilidade','API externa','Save e fechar']); }, 350);
    }

  } else if (editChatState === 'api-url') {
    const url = (text.startsWith('http') ? text : 'https://' + text).trim();
    if (!editDraft.externalApi) editDraft.externalApi = {method:'POST', responseMapping:[]};
    editDraft.externalApi.url = url; editChatState = 'api-method'; refreshEditPreview();
    setTimeout(() => { addCMsg('ai', `URL: ${url}\n\nQual o método HTTP desta requisição?`); renderCSuggs(['POST','GET','PUT','PATCH']); }, 350);

  } else if (editChatState === 'api-method') {
    const method = text.toUpperCase();
    if (editDraft.externalApi) editDraft.externalApi.method = ['GET','POST','PUT','PATCH'].includes(method) ? method : 'POST';
    editChatState = 'api-mapping'; refreshEditPreview();
    setTimeout(() => {
      addCMsg('ai', `Method: ${editDraft.externalApi.method}.\n\nAgora mapeie os campos da resposta para variáveis de contexto.\nFormato: nome_var ← response.path\n\nExemplo:\n  nf_numero ← data.number\n  status ← data.status\n\nDigite um mapeamento por vez. "pronto" para finalizar.`);
    }, 350);

  } else if (editChatState === 'api-mapping') {
    if (['pronto','ok','fim','finalizar','nenhum','feito'].includes(lower)) {
      editChatState = 'idle'; refreshEditPreview();
      const maps = editDraft.externalApi?.responseMapping||[];
      const outputVars = maps.filter(m=>m.key).map(m=>`{{api_${selectedTaskId}.${m.key}}}`);
      let msg = `✓ API configurada com ${maps.length} mapeamento${maps.length!==1?'s':''}.`;
      if (outputVars.length) msg += `\n\nVariáveis geradas para etapas seguintes:\n${outputVars.map(v=>`• ${v}`).join('\n')}`;
      msg += '\n\nMais alguma alteração?';
      setTimeout(() => { addCMsg('ai', msg); renderCSuggs(['Alternar visibilidade','Script customizado','Save e fechar']); }, 350);
    } else {
      const match = text.match(/^([a-z_][a-z0-9_]*)\s*(?:←|<-|=|:)\s*(.+)$/i) || text.match(/^(\S+)\s+(\S+)$/);
      if (match) {
        if (!editDraft.externalApi.responseMapping) editDraft.externalApi.responseMapping = [];
        editDraft.externalApi.responseMapping.push({ key: match[1].trim(), path: match[2].trim() });
        setTimeout(() => { addCMsg('ai', `✓ {{api_${selectedTaskId}.${match[1].trim()}}} ← ${match[2].trim()}\n\nAdicionado! Mais um mapeamento ou "pronto" para finalizar.`); }, 350);
      } else {
        setTimeout(() => { addCMsg('ai', 'Formato não reconhecido. Use:\n  nome_variavel ← response.path\n\nExemplo: nf_numero ← data.number'); }, 350);
      }
    }

  } else {
    // idle — intent detection
    if (lower.includes('renomear') || lower === 'nome' || (lower.includes('nome') && lower.includes('mudar'))) {
      editChatState = 'rename';
      setTimeout(() => { addCMsg('ai', `Qual será o novo nome da etapa "${editDraft.name}"?`); }, 350);
    } else if (lower.includes('categoria') || lower.includes('produto')) {
      editChatState = 'category';
      setTimeout(() => { addCMsg('ai', `Category atual: "${editDraft.category}". Qual a nova?`); renderCSuggs(['Todos os produtos','Electronics','Fashion & Footwear','Food','B2B']); }, 350);
    } else if (lower.includes('mcp') || lower === 'integração mcp' || lower === 'integracao mcp') {
      showMcpSelector();
    } else if (lower.includes('workspace') || lower === 'agente ai workspace' || lower === 'agente ai') {
      showAgentWsSelector();
    } else if (lower.includes('visib') || lower.includes('interno') || lower.includes('usuário') || lower.includes('usuario') || lower.includes('alternar visib')) {
      editDraft.visibility = editDraft.visibility === 'internal' ? 'user' : 'internal';
      refreshEditPreview();
      setTimeout(() => { addCMsg('ai', `Visibility alterada para: ${editDraft.visibility === 'internal' ? '🔒 Interna' : '👤 Usuário'}`); renderCSuggs(['Renomear','Alternar visibilidade','Integração MCP','Agente AI Workspace','Script customizado']); }, 350);
    } else if (/\bação\b|\bações\b|\bacao\b|\bacoes\b/.test(lower) || lower.includes('configurar ação') || lower.includes('configurar ações')) {
      setTimeout(() => { addCMsg('ai', 'O conceito de ações foi substituído por Visibility (controla se a tarefa é visível no pedido para o cliente) e integrações MCP / API externa.\n\nUse "Alternar visibilidade" para mudar entre Interna e Usuário.'); renderCSuggs(idleSuggs); }, 350);
    } else if (lower.includes('script') || lower.includes('código') || lower.includes('codigo') || lower.includes('customizado')) {
      editChatState = 'script-describe';
      setTimeout(() => {
        const hasScript = editDraft.script !== null && editDraft.script !== undefined;
        addCMsg('ai', hasScript
          ? `Script atual ativo. Descreva o que o novo script deve fazer e vou gerar uma versão atualizada:`
          : `Descreva o que o script deve fazer.\n\nExemplos:\n• "calcular desconto por valor do pedido"\n• "validar limite de crédito B2B"\n• "verificar estoque e sugerir ação"\n\nO agente vai gerar o código.`);
      }, 350);
    } else if (lower.includes('api') || lower.includes('externa') || lower.includes('webhook') || lower === 'integração' || lower === 'integracao') {
      editChatState = 'api-url';
      setTimeout(() => {
        addCMsg('ai', editDraft.externalApi
          ? `API atual: ${editDraft.externalApi.method} ${editDraft.externalApi.url}\n\nQual a nova URL da API?`
          : `Qual a URL da API externa que esta etapa deve chamar?`);
      }, 350);
    } else if (lower.includes('agente')) {
      showAgentWsSelector();
    } else if ((lower.includes('remover') || lower.includes('excluir')) && lower.includes('mcp')) {
      editDraft.mcpConfig = null; refreshEditPreview();
      setTimeout(() => { addCMsg('ai', '✓ Integração MCP removida. Mais alguma alteração?'); renderCSuggs(idleSuggs); }, 350);
    } else if ((lower.includes('remover') || lower.includes('excluir')) && (lower.includes('agente') || lower.includes('ai'))) {
      editDraft.agentConfig = null; refreshEditPreview();
      setTimeout(() => { addCMsg('ai', '✓ Agente AI removido. Mais alguma alteração?'); renderCSuggs(idleSuggs); }, 350);
    } else if (lower.includes('cor') || lower.includes('cor da etapa')) {
      showColorSelector();
    } else if (lower.includes('desativar') || lower.includes('inativar')) {
      editDraft.active = false; refreshEditPreview();
      setTimeout(() => { addCMsg('ai', '✓ Etapa marcada como inativa. Mais alguma alteração?'); renderCSuggs(['Ativar etapa','Renomear','Save e fechar']); }, 350);
    } else if (lower.includes('ativar') && !lower.includes('desativar')) {
      editDraft.active = true; refreshEditPreview();
      setTimeout(() => { addCMsg('ai', '✓ Etapa marcada como ativa. Mais alguma alteração?'); renderCSuggs(['Renomear','Alternar visibilidade','Save e fechar']); }, 350);
    } else {
      setTimeout(() => {
        addCMsg('ai', 'Posso ajudar com:\n• Renomear a etapa\n• Alternar visibilidade (Interna / Usuário)\n• Criar script customizado (com geração automática)\n• Configurar API externa + mapeamento\n• Integração MCP (ferramentas externas via Model Context Protocol)\n• Agente AI Workspace (agentes publicados no AI Workspace)\n• Alterar cor\n• Ativar / desativar\n\nO que deseja?');
        renderCSuggs(idleSuggs);
      }, 350);
    }
  }
}

// showActionsSelector removed — actions concept replaced by visibility

function showColorSelector() {
  const colors = ['#0c6fcd','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#6366f1','#0f766e'];
  setTimeout(() => {
    addCMsg('ai', 'Escolha uma cor para a etapa:');
    const msgs = document.getElementById('cm-msgs'); if (!msgs) return;
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:5px;padding:8px 10px;background:#f9f9f9;border:1px solid #e8e8e8;border-radius:6px';
    div.innerHTML = colors.map(c => `<div onclick="selectEditColor('${c}',this)" style="width:26px;height:26px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${c===editDraft.color?'#1a1a1a':'transparent'};box-sizing:border-box" title="${c}"></div>`).join('');
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }, 350);
}

function selectEditColor(color, el) {
  editDraft.color = color;
  document.querySelectorAll('[onclick^="selectEditColor"]').forEach(d => d.style.border = '3px solid transparent');
  el.style.border = '3px solid #1a1a1a';
  editChatState = 'idle'; refreshEditPreview();
  setTimeout(() => { addCMsg('ai', '✓ Cor atualizada! Mais alguma alteração?'); renderCSuggs(['Renomear','Alternar visibilidade','Save e fechar']); }, 350);
}

function generateScript(description) {
  const lower = description.toLowerCase();
  const d = description;
  if (lower.includes('desconto')) return `// ${d}\nconst total = context.total || 0;\ncontext.discount = total > 500 ? 0.10 : total > 200 ? 0.05 : 0;\ncontext.totalFinal = total * (1 - context.discount);\ncontext.descontoAplicado = context.discount > 0;`;
  if (lower.includes('cpf') || lower.includes('documento')) return `// ${d}\nconst cpf = (context.cpf || '').replace(/\\D/g,'');\ncontext.cpf_valido = cpf.length === 11 && !/^(\\d)\\1{10}$/.test(cpf);\ncontext.cpf_status = context.cpf_valido ? 'valido' : 'invalido';`;
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('limite')) return `// ${d}\nconst total = context.total || 0;\nconst limite = context.limite_credito || 10000;\ncontext.credito_aprovado = total <= limite;\ncontext.saldo_restante = limite - total;\ncontext.credito_status = context.credito_aprovado ? 'aprovado' : 'excede_limite';`;
  if (lower.includes('frete') || lower.includes('cep')) return `// ${d}\nconst cep = (context.cep || '').replace(/\\D/g,'');\nconst uf = cep.startsWith('0')||cep.startsWith('1') ? 'SP' : cep.startsWith('2') ? 'RJ' : 'Outros';\ncontext.regiao_entrega = uf;\ncontext.frete_estimado = uf==='SP' ? 15 : uf==='RJ' ? 25 : 40;\ncontext.prazo_dias = uf==='SP' ? 2 : 4;`;
  if (lower.includes('estoque') || lower.includes('quantidade')) return `// ${d}\nconst qtd = context.quantidade || 1;\nconst disp = parseFloat(context['validarEstoque.disponivel'] || 0);\ncontext.pode_separar = disp >= qtd;\ncontext.qtd_faltante = Math.max(0, qtd - disp);\ncontext.acao_recomendada = context.pode_separar ? 'separar' : 'realocar';`;
  if (lower.includes('nota') || lower.includes('fiscal') || lower.includes('nf')) return `// ${d}\ncontext.nf_serie = '1';\ncontext.nf_numero_seq = Date.now();\ncontext.nf_emitida_em = new Date().toISOString();\ncontext.nf_ambiente = 'producao';\ncontext.nf_pronta = true;`;
  if (lower.includes('email') || lower.includes('notif') || lower.includes('aviso')) return `// ${d}\ncontext.email_assunto = \`Pedido \${context.pedido_id||''} — atualização\`;\ncontext.email_template = 'status_update';\ncontext.email_prioridade = context.bloqueado ? 'alta' : 'normal';\ncontext.email_enviar = true;`;
  if (lower.includes('sla') || lower.includes('prazo') || lower.includes('tempo')) return `// ${d}\nconst criado = new Date(context.criado_em || Date.now());\ncontext.sla_horas = (Date.now() - criado) / 36e5;\ncontext.sla_ok = context.sla_horas <= 4;\ncontext.sla_status = context.sla_ok ? 'dentro_do_prazo' : 'atrasado';`;
  return `// ${d}\n// TODO: implementar lógica específica\ncontext.resultado = null;\ncontext.status = 'pendente';\n\n// Variáveis disponíveis via context.*\n// Ex: context.pedido_id, context.total, context.cliente_email`;
}

function applyEditDraft() {
  const found = findSubTask(selectedTaskId); if (!found) return;
  const { task, stage } = found;
  task.name        = editDraft.name;
  task.supplier    = editDraft.supplier;
  task.category    = editDraft.category;
  stage.color      = editDraft.color;
  task.active      = editDraft.active;
  task.visibility  = editDraft.visibility || 'user';
  task.script      = editDraft.script !== undefined ? editDraft.script : null;
  task.externalApi = editDraft.externalApi;
  task.mcpConfig   = editDraft.mcpConfig || null;
  task.agentConfig = editDraft.agentConfig || null;
  closeSidePanel(); renderWorkflowBoard();
  showSuccessModal('Task updated!', `"${task.name}" foi salva com as novas configurações.`);
}

function setTaskColor(id, color) {
  const found = findSubTask(id);
  if (found) { found.stage.color = color; renderWorkflowBoard(); }
}

// ── MCP Selector ──
function showMcpSelector() {
  setTimeout(() => {
    addCMsg('ai', 'Selecione um servidor MCP para integrar com esta etapa:');
    const msgs = document.getElementById('cm-msgs'); if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'integration-selector';
    div.innerHTML = MCP_SERVERS.map(s => `
      <div class="integ-card" onclick="selectMcpServer('${s.id}')">
        <div class="integ-card-icon">${s.icon}</div>
        <div class="integ-card-info">
          <div class="integ-card-name">${s.name}</div>
          <div class="integ-card-desc">${s.description}</div>
        </div>
      </div>`).join('');
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
    renderCSuggs([]);
  }, 350);
}

function selectMcpServer(serverId) {
  const server = MCP_SERVERS.find(s => s.id === serverId); if (!server) return;
  const draft = getActiveDraft();
  draft.mcpConfig = { serverId, serverName: server.name, toolId: null, toolName: null };
  addCMsg('user', server.name);
  if (activePanel === 'edit') refreshEditPreview();
  setTimeout(() => {
    addCMsg('ai', `${server.icon} ${server.name} selecionado! Qual ferramenta (tool) esta etapa deve usar?`);
    const msgs = document.getElementById('cm-msgs'); if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'integration-selector';
    div.innerHTML = server.tools.map(t => `
      <div class="integ-card" onclick="selectMcpTool('${t.id}')">
        <div class="integ-card-icon">🔧</div>
        <div class="integ-card-info">
          <div class="integ-card-name" style="font-family:monospace;font-size:12px">${t.name}</div>
          <div class="integ-card-desc">${t.desc}</div>
        </div>
      </div>`).join('');
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  }, 350);
}

function selectMcpTool(toolId) {
  const draft = getActiveDraft();
  if (!draft.mcpConfig) return;
  const server = MCP_SERVERS.find(s => s.id === draft.mcpConfig.serverId); if (!server) return;
  const tool = server.tools.find(t => t.id === toolId); if (!tool) return;
  draft.mcpConfig.toolId = toolId;
  draft.mcpConfig.toolName = tool.name;
  addCMsg('user', tool.name);
  if (activePanel === 'edit') refreshEditPreview();
  setTimeout(() => {
    addCMsg('ai', `✓ Integração MCP configurada: ${server.icon} ${server.name} → ${tool.name}\n\nEsta ferramenta será chamada durante a execução da etapa e seus resultados ficarão disponíveis como variáveis de contexto.\n\nMais alguma configuração?`);
    if (activePanel === 'edit') {
      renderCSuggs(['Agente AI Workspace', 'Alternar visibilidade', 'Save e fechar']);
    } else {
      renderCSuggs(['Criar agora', 'Agente AI Workspace']);
    }
  }, 350);
}

// ── AI Workspace Agent Selector ──
function showAgentWsSelector() {
  setTimeout(() => {
    addCMsg('ai', 'Selecione um agente publicado no AI Workspace para integrar com esta etapa:');
    const msgs = document.getElementById('cm-msgs'); if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'integration-selector';
    div.innerHTML = AI_WORKSPACE_AGENTS.map(a => `
      <div class="integ-card" onclick="selectAgentWs('${a.id}')">
        <div class="integ-card-icon">${a.icon}</div>
        <div class="integ-card-info">
          <div class="integ-card-name">${a.name}</div>
          <div class="integ-card-desc">${a.description}</div>
          <div style="margin-top:5px;display:flex;gap:4px;flex-wrap:wrap">
            ${a.outputVars.map(v=>`<code class="integ-var">→ ${v}</code>`).join('')}
          </div>
        </div>
      </div>`).join('');
    msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
    renderCSuggs([]);
  }, 350);
}

function selectAgentWs(agentId) {
  const agent = AI_WORKSPACE_AGENTS.find(a => a.id === agentId); if (!agent) return;
  const draft = getActiveDraft();
  draft.agentConfig = { agentId, agentName: agent.name, agentIcon: agent.icon };
  addCMsg('user', agent.name);
  if (activePanel === 'edit') refreshEditPreview();
  setTimeout(() => {
    const outputList = agent.outputVars.map(v=>`• {{agent_${agentId}.${v}}}`).join('\n');
    addCMsg('ai', `✓ Agente integrado: ${agent.icon} ${agent.name}\n\nO agente será chamado durante a execução desta etapa. Variáveis de saída disponíveis:\n${outputList}\n\nMais alguma configuração?`);
    if (activePanel === 'edit') {
      renderCSuggs(['Integração MCP', 'Alternar visibilidade', 'Save e fechar']);
    } else {
      renderCSuggs(['Criar agora', 'Integração MCP']);
    }
  }, 350);
}
function deleteTask(id) {
  const found = findSubTask(id); if (!found) return;
  pendingDeleteId = id;
  document.getElementById('del-name').textContent = found.task.name;
  openModal('modal-delete');
}
function confirmDelete() {
  const found = findSubTask(pendingDeleteId); if (!found) return;
  const { stage } = found;
  stage.tasks = stage.tasks.filter(t => t.id !== pendingDeleteId);
  // If stage is empty, remove it from WF_TASKS
  if (stage.tasks.length === 0) {
    const si = WF_TASKS.findIndex(s => s.id === stage.id);
    if (si !== -1) {
      WF_TASKS.splice(si, 1);
      WF_EDGES = WF_EDGES.filter(e => e.from !== stage.id && e.to !== stage.id);
    }
  }
  pendingDeleteId = null;
  closeModal('modal-delete'); closeSidePanel(); renderWorkflowBoard();
}

// ── Split task ──
let splitTaskId = null, splitDraft = {}, splitStep = 0;

function openSplitPanel(taskId) {
  const found = findSubTask(taskId); if (!found) return;
  const task = found.task;
  activePanel = 'split'; splitTaskId = taskId; splitDraft = { name1:'', name2:'' }; splitStep = 0;
  document.getElementById('sp-title').textContent = '✂ Dividir Etapa com AI';
  document.getElementById('sp-body').innerHTML = `
    <div style="padding:10px 12px;background:#fef9c3;border:1px solid #fde68a;border-radius:6px;font-size:12px;color:#854d0e;margin-bottom:4px">
      <strong>Dividindo:</strong> ${task.name}
    </div>
    <div class="cm-msgs" id="cm-msgs"></div>
    <div class="cm-suggestions" id="cm-suggestions"></div>
    <div class="task-preview-mini" id="task-preview-mini"><strong>Resultado da divisão</strong>
      <div class="tpm-row" id="prev-part1">1ª parte: —</div>
      <div class="tpm-row" id="prev-part2">2ª parte: —</div>
    </div>
    <div class="cm-input-row">
      <input class="cm-input" id="cm-input" placeholder="Digite..." onkeydown="if(event.key==='Enter')sendSplitChat()">
      <button class="cm-send" onclick="sendSplitChat()"><svg viewBox="0 0 16 16" stroke="white" stroke-width="2" fill="none" width="13" height="13"><path d="M2 8l12-6-4 12-3-4-5-2z"/></svg></button>
    </div>`;
  document.getElementById('sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeSidePanel()">Cancel</button>
    <button class="btn btn-primary" id="split-btn" style="flex:1;justify-content:center;opacity:.4;cursor:not-allowed" disabled onclick="requestSplitConfirm()">Confirm Divisão</button>`;
  openSidePanel();
  setTimeout(() => addCMsg('ai', `Vou ajudar a dividir "${task.name}" em duas etapas.\n\nComo você quer chamar a primeira parte?`), 200);
}

function sendSplitChat() {
  const input = document.getElementById('cm-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  input.value = ''; addCMsg('user', text);
  const task = findSubTask(splitTaskId)?.task;
  if (splitStep === 0) {
    splitDraft.name1 = text; splitStep = 1;
    const p1 = document.getElementById('prev-part1');
    if (p1) { p1.innerHTML = `1ª parte: <span>${text}</span>`; document.getElementById('task-preview-mini').style.display='block'; }
    setTimeout(() => addCMsg('ai', `"${text}" — ótimo! E a segunda parte da etapa?`), 400);
  } else if (splitStep === 1) {
    splitDraft.name2 = text; splitStep = 2;
    const p2 = document.getElementById('prev-part2');
    if (p2) p2.innerHTML = `2ª parte: <span>${text}</span>`;
    setTimeout(() => {
      addCMsg('ai', `Perfeito! O workflow ficará assim:\n• "${splitDraft.name1}" → "${splitDraft.name2}"\n\nAmbas herdarão o supplier "${task?.supplier}" e podem ser editadas depois. Confirm a divisão?`);
      const btn = document.getElementById('split-btn');
      if (btn) { btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer'; }
    }, 450);
  }
}

function requestSplitConfirm() {
  const taskName = findSubTask(splitTaskId)?.task?.name || '';
  document.getElementById('modal-split-body').innerHTML =
    `Dividir <strong>${taskName}</strong> em:<br><br>
     <strong>1ª parte:</strong> ${splitDraft.name1}<br>
     <strong>2ª parte:</strong> ${splitDraft.name2}`;
  openModal('modal-split-confirm');
}

function confirmSplit() {
  closeModal('modal-split-confirm');
  const found = findSubTask(splitTaskId); if (!found) return;
  const { stage, task } = found;
  const idx = stage.tasks.findIndex(t => t.id === splitTaskId);
  const newId1 = 't' + Date.now(), newId2 = 't' + (Date.now() + 1);
  const task1 = { ...task, id: newId1, name: splitDraft.name1, visibility: task.visibility || 'user' };
  const task2 = { ...task, id: newId2, name: splitDraft.name2, visibility: task.visibility || 'user' };
  stage.tasks.splice(idx, 1, task1, task2);
  closeSidePanel();
  renderWorkflowBoard();
  showSuccessModal('Tarefa dividida!', `"${task.name}" foi dividida em "${splitDraft.name1}" e "${splitDraft.name2}".`);
}

// ── Create panel ──
function openCreatePanel() { openCreatePanelAt(WF_TASKS.length); }
function openCreatePanelAt(pos) {
  activePanel = 'create-stage'; chatStep = 0; newTaskDraft = { position: pos, name:'', supplier:'', category:'', mcpConfig:null, agentConfig:null };
  document.getElementById('sp-title').textContent = '✚ New Stage';
  document.getElementById('sp-body').innerHTML = `
    <div class="cm-msgs" id="cm-msgs"></div>
    <div class="cm-suggestions" id="cm-suggestions"></div>
    <div class="task-preview-mini" id="task-preview-mini">
      <strong>Preview</strong>
      <div class="tpm-row" id="prev-name">Nome: —</div>
      <div class="tpm-row" id="prev-cat">Category: —</div>
    </div>
    <div class="cm-input-row">
      <input class="cm-input" id="cm-input" placeholder="Digite..." onkeydown="if(event.key==='Enter')sendStageChat()">
      <button class="cm-send" onclick="sendStageChat()"><svg viewBox="0 0 16 16" stroke="white" stroke-width="2" fill="none" width="13" height="13"><path d="M2 8l12-6-4 12-3-4-5-2z"/></svg></button>
    </div>`;
  document.getElementById('sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeSidePanel()">Cancel</button>
    <button class="btn btn-primary" id="create-btn" style="flex:1;justify-content:center;opacity:.4;cursor:not-allowed" disabled onclick="createTask()">Criar Etapa</button>`;
  openSidePanel();
  setTimeout(() => { addCMsg('ai', stageChatFlows[0].ai); renderCSuggs(stageChatFlows[0].sugg); }, 200);
}

const stageChatFlows = [
  {ai:'Como você quer chamar essa nova etapa?', field:'name', sugg:['Triagem de Devoluções','Aprovação B2B','Quality Control','Validação Fiscal']},
  {ai:'Em quais categorias de produtos essa etapa se aplica?', field:'category', sugg:['Todos os produtos','Electronics','Fashion & Footwear','Food','B2B']},
  {ai:null, field:null, sugg:['Confirm e criar']},
];

const taskChatFlows = [
  {ai:'Como você quer chamar essa tarefa?', field:'name', sugg:['Validar Estoque','Emitir Nota Fiscal','Capturar Payment','Enviar Rastreio','Quality Check']},
  {ai:'Esta tarefa deve ser visível no pedido ou é interna?', field:'visibility', sugg:['Visível no pedido','Interna']},
  {ai:null, field:null, sugg:['Criar tarefa','Adicionar API externa','Add checkpoints']},
];

function addCMsg(who, text) {
  const msgs = document.getElementById('cm-msgs'); if(!msgs) return;
  const d = document.createElement('div'); d.className = 'cm-msg cm-'+who; d.textContent = text;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}
function renderCSuggs(sugg) {
  const c = document.getElementById('cm-suggestions'); if(!c) return;
  c.innerHTML = sugg.map(s=>`<button class="cm-suggestion" onclick="selectCSugg('${s}')">${s}</button>`).join('');
}
function selectCSugg(text) {
  const i = document.getElementById('cm-input'); if(!i) return; i.value=text;
  if (activePanel==='edit') sendEditChat();
  else if (activePanel==='split') sendSplitChat();
  else if (activePanel==='bulk') sendBulkChat();
  else if (activePanel==='create-stage') sendStageChat();
  else if (activePanel==='create-task') sendTaskChat();
  else sendChat();
}
function sendStageChat() {
  const input = document.getElementById('cm-input'); if(!input) return;
  const text = input.value.trim(); if(!text) return;
  input.value = ''; addCMsg('user', text);
  document.getElementById('cm-suggestions').innerHTML = '';
  // Save the field for the current step
  const step = stageChatFlows[chatStep];
  if (step && step.field) newTaskDraft[step.field] = text;
  chatStep++;
  updatePreviewMini();
  setTimeout(() => {
    if (chatStep < stageChatFlows.length) {
      const next = stageChatFlows[chatStep];
      if (chatStep === stageChatFlows.length - 1) {
        // confirmation step
        addCMsg('ai', `Perfeito! Resumo da etapa:\n• Nome: ${newTaskDraft.name||'—'}\n• Category: ${newTaskDraft.category||'—'}\n\nDeseja adicionar integrações ou criar agora?`);
        renderCSuggs(['Criar agora','Integração MCP','Agente AI Workspace','API externa']);
      } else {
        if (next.ai) addCMsg('ai', next.ai);
        renderCSuggs(next.sugg || []);
      }
    } else {
      // post-flow: integration or create
      const lower = text.toLowerCase();
      if (lower === 'criar agora' || lower === 'criar' || lower === 'pular' || lower === 'não' || lower === 'nao') {
        addCMsg('ai', 'Tudo certo! Clique em "Criar Etapa" para adicionar ao workflow.');
        const btn = document.getElementById('create-btn');
        if (btn) { btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer'; }
        renderCSuggs([]);
      } else if (lower.includes('mcp')) {
        showMcpSelector();
      } else if (lower.includes('agente') || lower.includes('workspace')) {
        showAgentWsSelector();
      } else if (lower.includes('api')) {
        showApiConfigInline();
      } else {
        addCMsg('ai', 'Deseja adicionar alguma integração ou criar a etapa agora?');
        renderCSuggs(['Criar agora','Integração MCP','Agente AI Workspace','API externa']);
      }
    }
  }, 400);
}

function sendTaskChat() {
  const input = document.getElementById('cm-input'); if(!input) return;
  const text = input.value.trim(); if(!text) return;
  input.value = ''; addCMsg('user', text);
  document.getElementById('cm-suggestions').innerHTML = '';

  const step = taskChatFlows[chatStep];
  if (step && step.field) {
    if (step.field === 'visibility') {
      newTaskDraft.visibility = (text.toLowerCase().includes('interna') || text.toLowerCase().includes('interno')) ? 'internal' : 'user';
    } else {
      newTaskDraft[step.field] = text;
    }
  }
  chatStep++;
  updatePreviewMini();

  setTimeout(() => {
    if (chatStep === 1) {
      // After name: ask visibility
      addCMsg('ai', taskChatFlows[1].ai);
      renderCSuggs(taskChatFlows[1].sugg);
    } else if (chatStep === 2) {
      // After visibility: ask about extras
      addCMsg('ai', `Tarefa "${newTaskDraft.name}" configurada!\n• Visibility: ${newTaskDraft.visibility === 'internal' ? '🔒 Interna' : '👤 Usuário'}\n\nDeseja adicionar checkpoints, API externa ou criar agora?`);
      renderCSuggs(['Criar tarefa','Add checkpoints','Adicionar API externa','Integração MCP']);
    } else {
      // extras
      const lower = text.toLowerCase();
      if (lower === 'criar tarefa' || lower === 'criar' || lower === 'criar agora') {
        addCMsg('ai', 'Tudo certo! Clique em "Criar Tarefa" para finalizar.');
        const btn = document.getElementById('create-btn');
        if (btn) { btn.disabled=false; btn.style.opacity='1'; btn.style.cursor='pointer'; }
        renderCSuggs([]);
      } else if (lower.includes('checkpoint')) {
        showCheckpointBuilderInline();
      } else if (lower.includes('api')) {
        showApiConfigInline();
      } else if (lower.includes('mcp')) {
        showMcpSelector();
      } else if (lower.includes('agente') || lower.includes('workspace')) {
        showAgentWsSelector();
      } else {
        addCMsg('ai', 'Deseja criar a tarefa ou adicionar mais configurações?');
        renderCSuggs(['Criar tarefa','Add checkpoints','Adicionar API externa','Integração MCP']);
      }
    }
  }, 400);
}

function sendChat() { sendStageChat(); }
function updatePreviewMini() {
  const p = document.getElementById('task-preview-mini'); if(p) p.style.display='block';
  if(document.getElementById('prev-name')) document.getElementById('prev-name').innerHTML = `Nome: <span>${newTaskDraft.name||'—'}</span>`;
  if(document.getElementById('prev-cat')) document.getElementById('prev-cat').innerHTML = `Category: <span>${newTaskDraft.category||'—'}</span>`;
}
function createTask() {
  const colors = ['#0c6fcd','#7c3aed','#0891b2','#059669','#d97706','#6366f1','#0f766e','#dc2626'];
  const stageId = 't' + Date.now();
  const subId = stageId + '_0';
  const newStage = {
    id: stageId,
    name: newTaskDraft.name || 'New Stage',
    color: colors[WF_TASKS.length % colors.length],
    tasks: [{
      id: subId,
      name: newTaskDraft.name || 'New Stage',
      supplier: newTaskDraft.supplier || 'A definir',
      category: newTaskDraft.category || 'All',
      active: true, visibility: 'user', script: null,
      externalApi: newTaskDraft.externalApi || null,
      mcpConfig: newTaskDraft.mcpConfig || null,
      agentConfig: newTaskDraft.agentConfig || null,
      contextOutput: [],
      checkpoints: []
    }]
  };
  const pos = typeof newTaskDraft.position === 'number' ? newTaskDraft.position : WF_TASKS.length;
  WF_TASKS.splice(pos, 0, newStage);
  if (pos > 0) WF_EDGES.push({id:'e'+Date.now(), from:WF_TASKS[pos-1].id, to:newStage.id, active:true});
  if (pos < WF_TASKS.length-1) WF_EDGES.push({id:'e'+(Date.now()+1), from:newStage.id, to:WF_TASKS[pos+1].id, active:true});
  closeSidePanel(); renderWorkflowBoard();
  showSuccessModal('Etapa criada!', `"${newStage.name}" foi adicionada ao workflow.`);
}

// ── Edge modal ──
function openEdgeModal(edgeId) {
  const edge = WF_EDGES.find(e => e.id===edgeId); if(!edge) return;
  const from = WF_TASKS.find(s => s.id===edge.from), to = WF_TASKS.find(s => s.id===edge.to);
  pendingEdgeId = edgeId;
  document.getElementById('modal-edge-title').textContent = edge.active ? 'Desativar Conexão' : 'Reativar Conexão';
  document.getElementById('modal-edge-body').textContent = edge.active
    ? `Desativar a dependência "${from?.name}" → "${to?.name}"? As etapas poderão rodar em paralelo.`
    : `Reativar a dependência "${from?.name}" → "${to?.name}"?`;
  document.getElementById('modal-edge-confirm').textContent = edge.active ? 'Desativar' : 'Reativar';
  openModal('modal-edge');
}
function confirmEdge() {
  const edge = WF_EDGES.find(e => e.id===pendingEdgeId); if(edge) edge.active=!edge.active;
  closeModal('modal-edge'); renderWorkflowBoard();
}

// ── Panel helpers ──
function openSidePanel() { document.getElementById('side-panel').classList.remove('closed'); }
function closeSidePanel() { document.getElementById('side-panel').classList.add('closed'); selectedTaskId=null; renderKanban(); }

function renameStage(stageId) {
  const stage = WF_TASKS.find(s => s.id === stageId); if (!stage) return;
  activePanel = 'rename';
  document.getElementById('sp-title').textContent = 'Renomear Etapa';
  document.getElementById('sp-body').innerHTML = `
    <div style="padding:12px 0">
      <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:6px">Nome da etapa</label>
      <input id="rename-input" class="cm-input" style="width:100%;box-sizing:border-box" value="${stage.name}" placeholder="Nome da etapa">
    </div>`;
  document.getElementById('sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeSidePanel()">Cancel</button>
    <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="applyRenameStage('${stageId}')">Save</button>`;
  openSidePanel();
}
function applyRenameStage(stageId) {
  const stage = WF_TASKS.find(s => s.id === stageId); if (!stage) return;
  const input = document.getElementById('rename-input');
  const newName = input ? input.value.trim() : '';
  if (!newName) return;
  stage.name = newName;
  closeSidePanel(); renderWorkflowBoard();
}

function addTaskToStage(stageId) {
  activePanel = 'create-task';
  chatStep = 0;
  newTaskDraft = { stageId, name:'', supplier:'', category:'', visibility:'user', mcpConfig:null, agentConfig:null };
  document.getElementById('sp-title').textContent = '✚ Nova Tarefa';
  document.getElementById('sp-body').innerHTML = `
    <div id="task-preview-mini" style="display:none;background:#f9f9fb;border-radius:6px;padding:10px 12px;font-size:12px;color:#555;line-height:1.7;border:1px solid #efefef">
      <div id="prev-name">Nome: <span style="color:#1a1a1a;font-weight:600">—</span></div>
      <div id="prev-cat">Category: <span style="color:#1a1a1a;font-weight:600">—</span></div>
    </div>
    <div class="cm-msgs" id="cm-msgs"></div>
    <div class="cm-suggestions" id="cm-suggestions"></div>
    <div class="cm-input-row">
      <input class="cm-input" id="cm-input" placeholder="Digite..." onkeydown="if(event.key==='Enter')sendTaskChat()">
      <button class="cm-send" onclick="sendTaskChat()"><svg viewBox="0 0 16 16" stroke="white" stroke-width="2" fill="none" width="13" height="13"><path d="M2 8l12-6-4 12-3-4-5-2z"/></svg></button>
    </div>`;
  document.getElementById('sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeSidePanel()">Cancel</button>
    <button class="btn btn-primary" style="flex:1;justify-content:center;opacity:.4;cursor:not-allowed" id="create-btn" disabled onclick="createSubTask()">Criar Tarefa</button>`;
  openSidePanel();
  setTimeout(() => {
    addCMsg('ai', taskChatFlows[0].ai);
    renderCSuggs(taskChatFlows[0].sugg);
  }, 200);
}
function createSubTask() {
  const stage = WF_TASKS.find(s => s.id === newTaskDraft.stageId);
  if (!stage) return;
  const newId = 't' + Date.now();
  if (!stage.tasks) stage.tasks = [];
  stage.tasks.push({
    id: newId, name: newTaskDraft.name || 'Nova Tarefa',
    supplier: newTaskDraft.supplier || 'A definir',
    category: newTaskDraft.category || 'All',
    active: true, visibility: newTaskDraft.visibility || 'user', script: null,
    externalApi: newTaskDraft.externalApi || null,
    mcpConfig: newTaskDraft.mcpConfig || null,
    agentConfig: newTaskDraft.agentConfig || null,
    contextOutput: [],
    checkpoints: newTaskDraft.checkpoints || [],
  });
  closeSidePanel(); renderWorkflowBoard();
  showSuccessModal('Tarefa criada!', `"${newTaskDraft.name||'Nova Tarefa'}" foi adicionada à etapa "${stage.name}".`);
}

// ── Modal helpers ──
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
function showSuccessModal(title, body) {
  document.getElementById('success-title').textContent = title;
  document.getElementById('success-body').textContent = body;
  openModal('modal-success');
}
document.querySelectorAll('.modal-overlay').forEach(o => o.addEventListener('click', e => { if(e.target===o) o.classList.remove('open'); }));

// ══════════════════════════════════════════
// TASK ACTIONS CATALOG
// ══════════════════════════════════════════

const TASK_ACTIONS = [
  {id:'enviar_email',       label:'enviar_email()',        icon:'📧', outputVars:[]},
  {id:'validarEstoque',     label:'validarEstoque()',       icon:'📦', outputVars:['disponivel','qtd_reservavel','ok']},
  {id:'ReservarEstoque',    label:'ReservarEstoque()',      icon:'🔒', outputVars:['qtd_reservada','reserva_id']},
  {id:'CapturarPayment',  label:'CapturarPayment()',    icon:'💳', outputVars:['captura_id','valor_capturado','status']},
  {id:'CancelPedido',     label:'CancelPedido()',       icon:'❌', outputVars:[]},
  {id:'AlterarSellerPedido',label:'AlterarSellerPedido()', icon:'🔄', outputVars:['novo_seller_id']},
  {id:'AlterarItemPedido',  label:'AlterarItemPedido()',    icon:'📝', outputVars:['item_alterado']},
];

const SUPPLIER_CATALOG = {
  pagamento:      ['PagSeguro','Cielo','VTEX Payments','Adyen','PayPal','Rede','Stone'],
  separacao:      ['CD São Paulo','CD Rio de Janeiro','CD Recife','CD Manaus','Armazém Central','Fulfillment SP'],
  qualidade:      ['QA Team','Equipe Inspeção SP','Equipe Inspeção RJ','Parceiro Qualidade'],
  entrega:        ['Correios','Jadlog','Transportadora XYZ','Total Express','Loggi','Azul Cargo','DHL'],
  nota_fiscal:    ['Nota Fácil','NF-e.io','Bling','Omie','SAP NF','NF Paulistana'],
  rastreamento:   ['Intelipost','Melhor Shipping','Aftership','Rastreio.net','Kangu'],
  atendimento:    ['Equipe Atendimento','VTEX Support','Help Desk SP','Customer Success'],
  fiscal:         ['Financeiro','Contabilidade','Depto Fiscal','Controladoria'],
  personalizacao: ['BRK','Estamparia Digital','PrintShop Brasil','Custom Factory','Bordados SP','Gráfica Personalizada'],
  instalacao:     ['Arte&Decor','Instaladores Pro','Casa & Serviços','Montag SP','TecnoFix','ServiçosMais'],
};

function getContextSuppliers(taskName) {
  const n = (taskName||'').toLowerCase();
  if (/pagament|autoriz|captur|financ|cobranc|cobrança/.test(n)) return SUPPLIER_CATALOG.pagamento;
  if (/separ|reserv|estoque|armazem|armazém|fulfillment|cd /.test(n)) return SUPPLIER_CATALOG.separacao;
  if (/qualidade|confer|inspeç|inspetion|qa|audit/.test(n)) return SUPPLIER_CATALOG.qualidade;
  if (/entrega|expedi|transport|frete|logist|envio|coleta/.test(n)) return SUPPLIER_CATALOG.entrega;
  if (/nota.?fiscal|nf-?e|nfe|fiscal|sefaz/.test(n)) return SUPPLIER_CATALOG.nota_fiscal;
  if (/rastreio|rastreamento|tracking|código de rastreio/.test(n)) return SUPPLIER_CATALOG.rastreamento;
  if (/atendimento|suporte|devolu|troca|reclam/.test(n)) return SUPPLIER_CATALOG.atendimento;
  if (/financ|contab|cobranc/.test(n)) return SUPPLIER_CATALOG.fiscal;
  if (/personaliz|estampa|bordado|customiz|gravação|gravacao|brk/.test(n)) return SUPPLIER_CATALOG.personalizacao;
  if (/instala|montagem|serviço|servico|técnico|tecnico|arte.*decor/.test(n)) return SUPPLIER_CATALOG.instalacao;
  // default: mix of common ones
  return ['CD São Paulo','QA Team','Financeiro','Transportadora XYZ','VTEX Payments'];
}

function showSupplierCategoryPicker() {
  addCMsg('ai', 'Qual categoria de supplier você precisa consultar?');
  renderCSuggs(['Payment','Separação/Armazém','Qualidade','Delivery/Transportadora','Nota Fiscal','Rastreamento','Atendimento']);
  newTaskDraft._supplierPickMode = true;
}

const MCP_SERVERS = [
  {id:'vtex-catalog', name:'VTEX Catalog', icon:'📚', description:'Acesso ao catálogo de produtos, SKUs e categorias',
   tools:[
     {id:'get_product',        name:'get_product()',        desc:'Busca dados do produto por ID'},
     {id:'update_sku_status',  name:'update_sku_status()',  desc:'Ativa ou desativa um SKU'},
     {id:'list_categories',    name:'list_categories()',    desc:'Lista todas as categorias do catálogo'},
   ]},
  {id:'vtex-logistics', name:'VTEX Logistics', icon:'🚚', description:'Consulta e atualização de dados de logística e estoque',
   tools:[
     {id:'get_inventory',      name:'get_inventory()',      desc:'Consulta estoque disponível por SKU e warehouse'},
     {id:'update_inventory',   name:'update_inventory()',   desc:'Atualiza quantidade em estoque'},
     {id:'get_freight_values', name:'get_freight_values()', desc:'Calcula frete e prazo por CEP'},
   ]},
  {id:'vtex-payments', name:'VTEX Payments', icon:'💳', description:'Operações de captura, cancelamento e reembolso',
   tools:[
     {id:'capture_payment',    name:'capture_payment()',    desc:'Captura pagamento autorizado'},
     {id:'cancel_payment',     name:'cancel_payment()',     desc:'Cancela pagamento pendente'},
     {id:'create_refund',      name:'create_refund()',      desc:'Cria reembolso total ou parcial'},
   ]},
  {id:'nfe-emitter', name:'NFe Emitter', icon:'🧾', description:'Emissão e consulta de notas fiscais eletrônicas',
   tools:[
     {id:'emit_nfe',           name:'emit_nfe()',           desc:'Emite nota fiscal para o pedido'},
     {id:'cancel_nfe',         name:'cancel_nfe()',         desc:'Cancela nota fiscal emitida'},
     {id:'get_nfe_status',     name:'get_nfe_status()',     desc:'Consulta status da nota fiscal'},
   ]},
  {id:'crm-integration', name:'CRM Integration', icon:'👥', description:'Integração com dados de cliente e histórico de atendimento',
   tools:[
     {id:'get_customer',       name:'get_customer()',       desc:'Busca dados completos do cliente'},
     {id:'add_interaction',    name:'add_interaction()',    desc:'Registra interação no histórico do CRM'},
     {id:'get_loyalty_score',  name:'get_loyalty_score()', desc:'Consulta pontuação de fidelidade do cliente'},
   ]},
];

const AI_WORKSPACE_AGENTS = [
  {id:'quality-agent',   name:'Agente de Qualidade',  icon:'🔍',
   description:'Analisa conformidade do produto com padrões de qualidade antes da expedição',
   inputVars:['produto_id','quantidade','lote'],
   outputVars:['qualidade_aprovada','score_qualidade','motivo_reprovacao']},
  {id:'fraud-agent',     name:'Agente Antifraude',    icon:'🛡️',
   description:'Analisa risco de fraude no pedido com base em padrões comportamentais',
   inputVars:['pedido_id','cliente_email','valor_total','ip_cliente'],
   outputVars:['risco_fraude','score_fraude','recomendacao']},
  {id:'logistics-agent', name:'Agente de Logística',  icon:'🗺️',
   description:'Sugere melhor rota e transportadora com base no CEP e urgência do pedido',
   inputVars:['cep_destino','peso_total','urgencia'],
   outputVars:['transportadora_recomendada','prazo_dias','custo_frete']},
  {id:'support-agent',   name:'Agente de Atendimento', icon:'💬',
   description:'Classifica motivo de contato e gera resposta automática para o shopper',
   inputVars:['mensagem_shopper','pedido_id'],
   outputVars:['categoria_contato','resposta_sugerida','encaminhar_humano']},
  {id:'fiscal-agent',    name:'Agente Fiscal',         icon:'📋',
   description:'Valida regras fiscais e classifica tributação por estado e tipo de produto',
   inputVars:['uf_destino','ncm_produto','valor_total'],
   outputVars:['aliquota_icms','regime_tributario','nota_fiscal_requerida']},
];

function getActiveDraft() { return activePanel === 'edit' ? editDraft : newTaskDraft; }

function showApiConfigInline() {
  addCMsg('ai', 'Configure a API externa desta tarefa:');
  const msgs = document.getElementById('cm-msgs'); if(!msgs) return;
  const div = document.createElement('div');
  div.style.cssText = 'background:#f0f7ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-top:6px;display:flex;flex-direction:column;gap:8px';
  div.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:#1d4ed8;margin-bottom:2px">⚡ Configuração de API Externa</div>
    <input id="api-url-inp" placeholder="URL da API (ex: https://api.seuservico.com/endpoint)" style="border:1px solid #bfdbfe;border-radius:4px;padding:6px 9px;font-size:12px;font-family:inherit;width:100%;box-sizing:border-box">
    <div style="display:flex;gap:6px">
      <select id="api-method-sel" style="border:1px solid #bfdbfe;border-radius:4px;padding:5px;font-size:12px;font-family:inherit;background:#fff">
        <option>POST</option><option>GET</option><option>PUT</option><option>PATCH</option>
      </select>
      <input id="api-return-inp" placeholder="Campo de retorno (ex: data.status)" style="border:1px solid #bfdbfe;border-radius:4px;padding:6px 9px;font-size:12px;font-family:inherit;flex:1">
    </div>
    <div style="font-size:10.5px;color:#6b7280">O retorno será disponível como variável de contexto para a próxima tarefa.</div>
    <button onclick="applyApiConfig()" style="background:#0c6fcd;color:#fff;border:none;border-radius:4px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;align-self:flex-start">Save configuração</button>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  renderCSuggs([]);
}

function applyApiConfig() {
  const url = document.getElementById('api-url-inp')?.value?.trim();
  const method = document.getElementById('api-method-sel')?.value || 'POST';
  const returnField = document.getElementById('api-return-inp')?.value?.trim() || 'data.result';
  if (!url) { addCMsg('ai', 'Por favor informe a URL da API.'); return; }
  newTaskDraft.externalApi = {
    url, method,
    responseMapping: [{ key: 'api_result', path: returnField }]
  };
  if (activePanel === 'edit') { editDraft.externalApi = newTaskDraft.externalApi; refreshEditPreview(); }
  addCMsg('ai', `✓ API configurada: ${method} ${url}\nRetorno mapeado como {{api_result}} para a próxima tarefa.\n\nDeseja criar a tarefa agora?`);
  renderCSuggs(['Criar tarefa','Add checkpoints','Integração MCP']);
}

function showCheckpointBuilderInline() {
  addCMsg('ai', 'Defina os checkpoints desta tarefa (passos que devem ser verificados):');
  if (!newTaskDraft.checkpoints) newTaskDraft.checkpoints = [];
  const msgs = document.getElementById('cm-msgs'); if(!msgs) return;
  const div = document.createElement('div');
  div.id = 'cp-builder';
  div.style.cssText = 'background:#fafafa;border:1px solid #e8e8e8;border-radius:8px;padding:12px;margin-top:6px;display:flex;flex-direction:column;gap:8px';
  div.innerHTML = `
    <div style="font-size:11px;font-weight:700;color:#555;margin-bottom:2px">📋 Checkpoints da tarefa</div>
    <div id="cp-list" style="display:flex;flex-direction:column;gap:5px"></div>
    <div style="display:flex;gap:6px">
      <input id="cp-label-inp" placeholder="Ex: Estoque reservado" style="border:1px solid #e0e0e0;border-radius:4px;padding:6px 9px;font-size:12px;font-family:inherit;flex:1">
      <input id="cp-fail-inp" placeholder="Ação em falha" style="border:1px solid #e0e0e0;border-radius:4px;padding:6px 9px;font-size:12px;font-family:inherit;flex:1">
      <button onclick="addCheckpointItem()" style="background:#142032;color:#fff;border:none;border-radius:4px;padding:6px 12px;font-size:12px;cursor:pointer;white-space:nowrap;font-family:inherit">+ Add</button>
    </div>
    <button onclick="applyCheckpoints()" style="background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;border-radius:4px;padding:6px 14px;font-size:12px;cursor:pointer;font-family:inherit;align-self:flex-start">✓ Save checkpoints</button>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  renderCSuggs([]);
}

function addCheckpointItem() {
  const label = document.getElementById('cp-label-inp')?.value?.trim();
  const failAction = document.getElementById('cp-fail-inp')?.value?.trim() || 'Escalate to operator';
  if (!label) return;
  if (!newTaskDraft.checkpoints) newTaskDraft.checkpoints = [];
  const id = 'cp' + (newTaskDraft.checkpoints.length + 1);
  newTaskDraft.checkpoints.push({id, label, failAction});
  document.getElementById('cp-label-inp').value = '';
  document.getElementById('cp-fail-inp').value = '';
  const listEl = document.getElementById('cp-list');
  if (listEl) {
    listEl.innerHTML = newTaskDraft.checkpoints.map((cp,i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:4px 6px;background:#fff;border:1px solid #f0f0f0;border-radius:4px;font-size:11.5px">
        <span style="color:#059669;font-size:10px">✓</span>
        <span style="flex:1">${cp.label}</span>
        <span style="color:#9ca3af;font-size:10px">falha: ${cp.failAction}</span>
      </div>`).join('');
  }
}

function applyCheckpoints() {
  const count = (newTaskDraft.checkpoints||[]).length;
  addCMsg('ai', `✓ ${count} checkpoint${count!==1?'s':''} configurado${count!==1?'s':''}.\n\nDeseja criar a tarefa agora?`);
  renderCSuggs(['Criar tarefa','Adicionar API externa','Integração MCP']);
}


// ══════════════════════════════════════════
// AGENT CONFIG
// ══════════════════════════════════════════

function updateSlider(input, valId, fillId) {
  const v = input.value;
  const valEl = document.getElementById(valId);
  const fillEl = document.getElementById(fillId);
  if (valEl) valEl.textContent = v + '%';
  if (fillEl) fillEl.style.width = v + '%';
}

function toggleAgentCard(id) {
  const body  = document.getElementById(id);
  const arrow = document.getElementById(id + '-arrow');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display  = open ? 'none' : 'block';
  if (arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
}

// ══════════════════════════════════════════
// WORKFLOW SETTINGS
// ══════════════════════════════════════════

let currentSettingsWfId = null;

function openWorkflowSettings(id) {
  currentSettingsWfId = id;
  showScreen('workflow-settings');
}

function renderWorkflowSettings() {
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId);
  if (!wf) return;

  const bc = document.getElementById('ws-breadcrumb');
  if (bc) bc.textContent = wf.name;

  const nameEl = document.getElementById('ws-name');
  if (nameEl) nameEl.value = wf.name;
  const descEl = document.getElementById('ws-desc');
  if (descEl) descEl.value = wf.description;

  const icons = ['📦','↩️','💳','📋','🛒','🔄','⚡','🏪'];
  const iconRow = document.getElementById('ws-icon-row');
  if (iconRow) iconRow.innerHTML = icons.map(ic =>
    `<button onclick="selectWsIcon(this,'${ic}')" style="width:36px;height:36px;border-radius:8px;border:2px solid ${ic===wf.icon?'#0c6fcd':'#e0e0e0'};background:${ic===wf.icon?'#eff6ff':'#f9f9f9'};font-size:18px;cursor:pointer" class="ws-icon-btn">${ic}</button>`
  ).join('');

  const depsContainer = document.getElementById('ws-deps');
  if (depsContainer) {
    depsContainer.innerHTML = wf.dependencies.length
      ? wf.dependencies.map(depId => {
          const depWf = WORKFLOW_DEFS.find(w => w.id === depId);
          return depWf ? `<span class="dep-tag" style="border-color:${depWf.color}40;background:${depWf.color}10">${depWf.icon} ${depWf.name}<span class="dep-remove" onclick="removeDep('${depId}')">×</span></span>` : '';
        }).join('')
      : `<span style="font-size:12.5px;color:#aaa;font-style:italic">Nenhuma dependência — acionado imediatamente</span>`;
  }

  const dependents = WORKFLOW_DEFS.filter(w => w.dependencies.includes(wf.id));
  const depsEl = document.getElementById('ws-dependents');
  if (depsEl) depsEl.innerHTML = dependents.length
    ? dependents.map(d => `<span style="margin-right:6px">${d.icon} ${d.name}</span>`).join('')
    : '<span style="font-style:italic">Nenhum workflow depende deste</span>';

  // Trigger configuration
  const triggerContainer = document.getElementById('ws-trigger');
  if (triggerContainer) {
    const trigger = wf.trigger || { type:'order-created', label:'Acionado automaticamente no início do pedido' };
    const otherWorkflows = WORKFLOW_DEFS.filter(w => w.id !== wf.id);
    const taskOptions = trigger.workflowId
      ? (WORKFLOW_DEFS.find(w => w.id === trigger.workflowId)?.tasks || []).map(s =>
          `<option value="${s.id}" ${s.id === trigger.stageId ? 'selected' : ''}>${s.name}</option>`
        ).join('')
      : '';
    triggerContainer.innerHTML = `
      <div style="margin-bottom:8px">
        <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:6px">Este workflow é acionado por:</label>
        <div style="display:flex;flex-direction:column;gap:6px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="radio" name="trig-type" value="order-created" ${trigger.type==='order-created'?'checked':''} onchange="onTriggerTypeChange('order-created')">
            Início do pedido (automático)
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="radio" name="trig-type" value="workflow-complete" ${trigger.type==='workflow-complete'?'checked':''} onchange="onTriggerTypeChange('workflow-complete')">
            Conclusão de um workflow
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="radio" name="trig-type" value="task-complete" ${trigger.type==='task-complete'?'checked':''} onchange="onTriggerTypeChange('task-complete')">
            Conclusão de uma tarefa específica
          </label>
        </div>
      </div>
      <div id="ws-trigger-detail" style="margin-top:8px;${trigger.type==='order-created'?'display:none':''}">
        <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:4px">Workflow de origem</label>
        <select id="ws-trigger-wf" class="cm-input" style="width:100%;margin-bottom:8px" onchange="onTriggerWfChange(this.value)">
          <option value="">Selecione um workflow</option>
          ${otherWorkflows.map(w => `<option value="${w.id}" ${w.id === trigger.workflowId ? 'selected' : ''}>${w.icon} ${w.name}</option>`).join('')}
        </select>
        <div id="ws-trigger-task-row" style="${trigger.type==='task-complete'?'':'display:none'}">
          <label style="font-size:12px;font-weight:600;color:#555;display:block;margin-bottom:4px">Tarefa de origem</label>
          <select id="ws-trigger-task" class="cm-input" style="width:100%">
            <option value="">Selecione uma tarefa</option>
            ${taskOptions}
          </select>
        </div>
      </div>`;
  }
}

function selectWsIcon(btn, icon) {
  document.querySelectorAll('.ws-icon-btn').forEach(b => {
    b.style.borderColor = '#e0e0e0'; b.style.background = '#f9f9f9';
  });
  btn.style.borderColor = '#0c6fcd'; btn.style.background = '#eff6ff';
}

function toggleDepDropdown() {
  const dd = document.getElementById('dep-dropdown');
  if (!dd) return;
  const isOpen = dd.style.display !== 'none';
  if (isOpen) { dd.style.display = 'none'; return; }
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId);
  const available = WORKFLOW_DEFS.filter(w => w.id !== currentSettingsWfId && !wf.dependencies.includes(w.id));
  if (!available.length) { dd.innerHTML = '<div style="padding:10px 12px;font-size:12.5px;color:#888">Nenhum workflow disponível</div>'; }
  else dd.innerHTML = available.map(w =>
    `<div onclick="addDep('${w.id}')" style="padding:10px 12px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;border-bottom:1px solid #f5f5f5" onmouseenter="this.style.background='#f5f5f5'" onmouseleave="this.style.background=''">${w.icon} ${w.name}</div>`
  ).join('');
  dd.style.display = 'block';
}

function addDep(depId) {
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId);
  if (wf && !wf.dependencies.includes(depId)) wf.dependencies.push(depId);
  document.getElementById('dep-dropdown').style.display = 'none';
  renderWorkflowSettings();
}

function removeDep(depId) {
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId);
  if (wf) wf.dependencies = wf.dependencies.filter(d => d !== depId);
  renderWorkflowSettings();
}

function saveWorkflowSettings() {
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId);
  if (!wf) return;
  const nameEl = document.getElementById('ws-name');
  const descEl = document.getElementById('ws-desc');
  if (nameEl && nameEl.value.trim()) wf.name = nameEl.value.trim();
  if (descEl && descEl.value.trim()) wf.description = descEl.value.trim();
  // persist trigger
  if (!wf.trigger) wf.trigger = {};
  const trigTypeEl = document.querySelector('input[name="trig-type"]:checked');
  if (trigTypeEl) wf.trigger.type = trigTypeEl.value;
  const trigWfEl = document.getElementById('ws-trigger-wf');
  if (trigWfEl) wf.trigger.workflowId = trigWfEl.value;
  const trigTaskEl = document.getElementById('ws-trigger-task');
  if (trigTaskEl) wf.trigger.stageId = trigTaskEl.value;
  showScreen('workflow-list');
  showSuccessModal('Workflow atualizado!', `As configurações de "${wf.name}" foram salvas.`);
}

function onTriggerTypeChange(type) {
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId); if (!wf) return;
  if (!wf.trigger) wf.trigger = {};
  wf.trigger.type = type;
  const detail = document.getElementById('ws-trigger-detail');
  const taskRow = document.getElementById('ws-trigger-task-row');
  if (detail) detail.style.display = type === 'order-created' ? 'none' : '';
  if (taskRow) taskRow.style.display = type === 'task-complete' ? '' : 'none';
}

function onTriggerWfChange(wfId) {
  const wf = WORKFLOW_DEFS.find(w => w.id === currentSettingsWfId); if (!wf) return;
  if (!wf.trigger) wf.trigger = {};
  wf.trigger.workflowId = wfId;
  const srcWf = WORKFLOW_DEFS.find(w => w.id === wfId);
  const taskSelect = document.getElementById('ws-trigger-task');
  if (taskSelect && srcWf) {
    taskSelect.innerHTML = `<option value="">Selecione uma tarefa</option>` +
      (srcWf.tasks || []).map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  }
}

// ══════════════════════════════════════════
// AGENTE DE ORQUESTRAÇÃO — AGENTIC CHAT
// ══════════════════════════════════════════
let orchChatState = 'idle';
let orchRuleDraft = null;
let orchRules = [
  {id:'r1', condition:'Pedido travado há > 8h em Separação', action:'Escalar para gerente de operações', priority:'high', wf:'Preparando os itens', active:true},
  {id:'r2', condition:'Amount do pedido > R$ 5.000', action:'Requer confirmação humana antes de avançar', priority:'high', wf:'All', active:true},
  {id:'r3', condition:'Supplier sem capacidade há > 2h', action:'Sugerir realocação automaticamente', priority:'med', wf:'Preparando os itens', active:true},
  {id:'r4', condition:'Amount de devolução < R$ 200', action:'Reembolso automático sem auditoria manual', priority:'low', wf:'Returns & Exchanges', active:false},
];

function initOrchChat() {
  const msgs = document.getElementById('orch-chat-msgs');
  if (!msgs || msgs.children.length > 0) return;
  orchChatState = 'idle';
  addOrchMsg('ai', 'Olá! Sou o assistente de configuração do Orchestration Agent. 🤖\n\nEste agente é composto por 3 sub-agentes:\n🗺️ Routing — seleciona o modo de fulfillment e provider por pedido\n⚙️ Orchestration — avança gates e dispara ações automaticamente\n🚨 Escalation — detecta inatividade e cria tarefas para operadores\n\nConfiguração atual:\n• Confiança mínima: 75%\n• SLA: 4h sem movimentação\n• Cobertura: Preparando os itens + Troca e Devolução\n• 4 regras customizadas\n\nO que você gostaria de configurar?');
  renderOrchSuggs(['Ajustar confiança', 'Configurar SLA', 'Cobertura de workflows', 'Definir regra customizada', 'Notificações']);
  renderCustomRules();
}

function addOrchMsg(who, text) {
  const msgs = document.getElementById('orch-chat-msgs');
  if (!msgs) return;
  const d = document.createElement('div');
  d.className = 'cm-msg cm-' + who;
  d.textContent = text;
  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
}

function renderOrchSuggs(arr) {
  const wrap = document.getElementById('orch-sugg-wrap');
  if (!wrap) return;
  wrap.innerHTML = arr.map(s => `<span class="cm-suggestion" onclick="handleOrchSugg(this.textContent)">${s}</span>`).join('');
}

function sendOrchChat() {
  const input = document.getElementById('orch-chat-input');
  const val = input.value.trim();
  if (!val) return;
  addOrchMsg('user', val);
  input.value = '';
  document.getElementById('orch-sugg-wrap').innerHTML = '';
  processOrchIntent(val);
}

function handleOrchSugg(text) {
  addOrchMsg('user', text);
  document.getElementById('orch-sugg-wrap').innerHTML = '';
  processOrchIntent(text);
}

function processOrchIntent(text) {
  const lower = text.toLowerCase();

  /* ── await states ── */
  if (orchChatState === 'await-confidence') {
    const num = parseInt((lower.match(/\d+/) || [])[0]);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setOrchConfidence(num);
      orchChatState = 'idle';
      const note = num < 50 ? '⚡ O agente agirá com bastante autonomia.' : num > 85 ? '🧑 O agente escalará com frequência para operadores.' : '✅ Configuração balanceada.';
      addOrchMsg('ai', `Confiança mínima ajustada para ${num}%. ${note}\n\nPosso ajudar com mais alguma configuração?`);
      renderOrchSuggs(['Configurar SLA', 'Cobertura de workflows', 'Definir regra customizada', 'Pronto!']);
    } else {
      addOrchMsg('ai', 'Por favor, informe um número entre 0 e 100.');
    }
    return;
  }

  if (orchChatState === 'await-sla') {
    const num = parseInt((lower.match(/\d+/) || [])[0]);
    if (!isNaN(num) && num >= 1 && num <= 72) {
      const el = document.getElementById('sla-hours');
      if (el) el.value = num;
      highlightOrchCard('ocard-sla');
      orchChatState = 'idle';
      addOrchMsg('ai', `SLA definido: o agente intervirá após ${num}h sem movimentação. ✅\n\nPosso ajudar com mais alguma configuração?`);
      renderOrchSuggs(['Ajustar confiança', 'Cobertura de workflows', 'Definir regra customizada', 'Pronto!']);
    } else {
      addOrchMsg('ai', 'Informe um valor entre 1 e 72 horas.');
    }
    return;
  }

  if (orchChatState === 'await-rule-condition') {
    orchRuleDraft.condition = text;
    orchChatState = 'await-rule-action';
    addOrchMsg('ai', `Condição registrada: "${text}"\n\nQual ação o agente deve executar quando essa condição for verdadeira?\n\nExemplos:\n• Escalar para gerente de operações\n• Solicitar confirmação humana\n• Cancel pedido automaticamente\n• Enviar alerta via Slack`);
    return;
  }

  if (orchChatState === 'await-rule-action') {
    orchRuleDraft.action = text;
    orchChatState = 'await-rule-priority';
    addOrchMsg('ai', `Ação definida: "${text}"\n\nQual a prioridade desta regra?`);
    renderOrchSuggs(['Alta — executa antes das demais', 'Média — ordem padrão', 'Baixa — executa por último']);
    return;
  }

  if (orchChatState === 'await-rule-priority') {
    let priority = 'med';
    if (lower.includes('alta') || lower.includes('high')) priority = 'high';
    else if (lower.includes('baix') || lower.includes('low')) priority = 'low';
    orchRuleDraft.priority = priority;
    orchChatState = 'await-rule-workflow';
    addOrchMsg('ai', 'Para qual workflow esta regra se aplica?');
    renderOrchSuggs(['Todos os workflows', 'Preparando os itens', 'Returns & Exchanges', 'Aprovação de Payment']);
    return;
  }

  if (orchChatState === 'await-rule-workflow') {
    let wf = 'All';
    if (lower.includes('padrão') || lower.includes('padrao')) wf = 'Preparando os itens';
    else if (lower.includes('troca') || lower.includes('devolução') || lower.includes('devolucao')) wf = 'Returns & Exchanges';
    else if (lower.includes('pagamento')) wf = 'Aprovação de Payment';
    orchRuleDraft.wf = wf;
    orchRuleDraft.id = 'r' + Date.now();
    orchRuleDraft.active = true;
    orchRules.push(orchRuleDraft);
    orchRuleDraft = null;
    orchChatState = 'idle';
    renderCustomRules();
    highlightOrchCard('ocard-rules');
    addOrchMsg('ai', 'Regra criada com sucesso! ✅\n\nEla já aparece no painel de Regras Customizadas à direita. Você pode ativá-la ou desativá-la pelo toggle.\n\nPosso ajudar com mais alguma configuração?');
    renderOrchSuggs(['Definir outra regra', 'Ajustar confiança', 'Configurar SLA', 'Pronto!']);
    return;
  }

  /* ── routing by keyword ── */
  if (/confiança|confianca|threshold|autonomia/.test(lower)) {
    orchChatState = 'await-confidence';
    addOrchMsg('ai', 'Confiança mínima atual: 75%\n\nEsta configuração define o quão certo o agente precisa estar para agir sozinho. Abaixo desse valor ele escala para um operador humano.\n\nQual valor você deseja? (0–100%)');
    renderOrchSuggs(['60% — mais autônomo', '75% — padrão atual', '85% — mais conservador', '95% — quase nunca age sozinho']);
    return;
  }

  if (/\bsla\b|hora|interv/.test(lower)) {
    orchChatState = 'await-sla';
    addOrchMsg('ai', 'SLA atual: 4 horas\n\nApós quantas horas sem movimentação o agente deve intervir? (1–72h)');
    renderOrchSuggs(['2h — rigoroso', '4h — padrão atual', '8h — mais calmo', '24h — intervenção mínima']);
    return;
  }

  if (/cobertura|workflow|fluxo/.test(lower)) {
    highlightOrchCard('ocard-coverage');
    orchChatState = 'idle';
    addOrchMsg('ai', 'Configuração de cobertura destacada no painel à direita 👉\n\nStatus atual:\n✅ Preparando os itens — 4.256 orders\n✅ Troca e Devolução — 83 orders\n⬜ Aprovação de Payment — desativado\n\nUse os toggles para ativar ou desativar cada workflow.');
    renderOrchSuggs(['Ajustar confiança', 'Configurar SLA', 'Definir regra customizada', 'Pronto!']);
    return;
  }

  if (/notif|alerta|slack|email|webhook/.test(lower)) {
    highlightOrchCard('ocard-sla');
    orchChatState = 'idle';
    addOrchMsg('ai', 'Settings de notificação destacadas no painel à direita 👉\n\nAtualmente:\n✅ Email ao escalar para operador\n✅ Slack — #dom-alertas\n⬜ Custom webhook\n\nAlterações diretas pelos checkboxes.');
    renderOrchSuggs(['Ajustar confiança', 'Configurar SLA', 'Definir regra customizada', 'Pronto!']);
    return;
  }

  if (/regra|customiz|condiç|condic|\bse\b|\bif\b/.test(lower)) {
    addRuleViaChat();
    return;
  }

  if (/ação|ações|acao|acoes|habilit/.test(lower)) {
    highlightOrchCard('ocard-behavior');
    orchChatState = 'idle';
    addOrchMsg('ai', 'Ações do agente destacadas no painel à direita 👉\n\nVocê pode ativar ou desativar individualmente cada tipo de ação que o agente pode executar.');
    renderOrchSuggs(['Ajustar confiança', 'Configurar SLA', 'Definir regra customizada', 'Pronto!']);
    return;
  }

  if (/pronto|ok\b|salv|conclu/.test(lower)) {
    addOrchMsg('ai', 'Tudo certo! 🎉 Clique em "Save" no topo para persistir as mudanças.\n\nPosso ajudar com mais alguma configuração?');
    renderOrchSuggs(['Ajustar confiança', 'Configurar SLA', 'Cobertura de workflows', 'Definir regra customizada']);
    return;
  }

  addOrchMsg('ai', 'Posso ajudar com:\n• Confiança mínima e ações habilitadas\n• SLA e horário de operação\n• Cobertura por workflow\n• Notificações e alertas\n• Regras customizadas\n\nO que você gostaria de configurar?');
  renderOrchSuggs(['Ajustar confiança', 'Configurar SLA', 'Cobertura de workflows', 'Definir regra customizada']);
}

function addRuleViaChat() {
  orchChatState = 'await-rule-condition';
  orchRuleDraft = {id:null, condition:'', action:'', priority:'med', wf:'All', active:true};
  const sugg = document.getElementById('orch-sugg-wrap');
  if (sugg) sugg.innerHTML = '';
  addOrchMsg('ai', 'Vamos criar uma nova regra customizada! 📏\n\nRegras definem condições específicas que o agente deve observar além do comportamento padrão.\n\nQual é a condição que deve disparar esta regra?\n\nExemplos:\n• Pedido travado há > 8h em Separação\n• Amount do pedido > R$ 5.000\n• Supplier sem resposta há > 2h\n• Pedido com mais de 10 itens');
}

function setOrchConfidence(val) {
  const range = document.getElementById('conf-range');
  const valEl = document.getElementById('conf-val');
  const fill  = document.getElementById('conf-fill');
  if (range) range.value = val;
  if (valEl) valEl.textContent = val + '%';
  if (fill)  fill.style.width = val + '%';
  highlightOrchCard('ocard-behavior');
}

function highlightOrchCard(id) {
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.remove('highlight');
  void card.offsetWidth;
  card.classList.add('highlight');
  setTimeout(() => card.classList.remove('highlight'), 1600);
  card.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function renderCustomRules() {
  const list = document.getElementById('custom-rules-list');
  if (!list) return;
  if (!orchRules.length) {
    list.innerHTML = '<div style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">Nenhuma regra customizada. Clique em "+ Nova Regra" ou peça ao assistente.</div>';
    return;
  }
  const prioLabel = {high:'Alta', med:'Média', low:'Baixa'};
  const prioBg    = {high:'#fef2f2', med:'#fffbeb', low:'#f0fdf4'};
  const prioColor = {high:'#dc2626', med:'#d97706', low:'#16a34a'};
  list.innerHTML = orchRules.map(r => `
    <div class="rule-item ${r.active ? 'rule-active' : ''}" id="rule-${r.id}">
      <div class="rule-prio rule-prio-${r.priority}"></div>
      <div class="rule-body">
        <div class="rule-cond">SE: ${r.condition}</div>
        <div class="rule-act">→ ${r.action}</div>
        <div class="rule-tags">
          <span class="rule-tag" style="background:${prioBg[r.priority]};color:${prioColor[r.priority]};border-color:${prioColor[r.priority]}44">${prioLabel[r.priority]}</span>
          <span class="rule-tag">${r.wf}</span>
          ${!r.active ? '<span class="rule-tag" style="color:#bbb">Inativa</span>' : ''}
        </div>
      </div>
      <div class="rule-btns">
        <button class="toggle-switch ${r.active ? 'on' : 'off'}" onclick="toggleOrchRule('${r.id}')" style="transform:scale(.75);transform-origin:right center" title="${r.active ? 'Desativar' : 'Ativar'}"></button>
        <button onclick="deleteOrchRule('${r.id}')" style="border:none;background:transparent;cursor:pointer;padding:2px 4px;color:#ccc;font-size:13px;line-height:1" title="Delete">🗑</button>
      </div>
    </div>
  `).join('');
}

function toggleOrchRule(id) {
  const r = orchRules.find(x => x.id === id);
  if (r) { r.active = !r.active; renderCustomRules(); }
}

function deleteOrchRule(id) {
  orchRules = orchRules.filter(x => x.id !== id);
  renderCustomRules();
}

function saveAgentConfig() {
  showSuccessModal('Settings salvas!', 'O agente foi atualizado e está monitorando os workflows ativos.');
}

// ══════════════════════════════════════════
// NEW WORKFLOW PANEL
// ══════════════════════════════════════════

const WF_ICONS = ['📦','↩️','💳','🚚','🔄','⚡','🏪','🌐','📋','🛒'];
const WF_COLORS = ['#0c6fcd','#7c3aed','#059669','#d97706','#0891b2','#6366f1','#dc2626','#0f766e'];
let newWfDraft = {}, newWfStep = 0;
const newWfFlows = [
  { id:'name',        ai:'Como você quer chamar esse Order Job?',                                       field:'name',        sugg:['Delivery Expressa','Marketplace Premium','Cross-docking','Delivery Agendada'] },
  { id:'origin',      ai:null,                                                                          field:null,          sugg:[] },
  { id:'icon',        ai:'Escolha um ícone para identificar visualmente este Order Job:',               field:null,          sugg:[] },
  { id:'description', ai:'Descreva brevemente o propósito deste Order Job:',                            field:'description', sugg:['Fluxo para entregas no mesmo dia','Delivery com agendamento pelo cliente','Modalidade para orders B2B','Delivery via parceiros logísticos regionais'] },
  { id:'marcos',      ai:null,                                                                          field:null,          sugg:[] },
  { id:'confirm',     ai:null,                                                                          field:null,          sugg:['Confirm e criar'] },
];

function openCreateWorkflowPanel() {
  newWfDraft = { name:'', icon:'📦', color:'#0c6fcd', description:'', sourceId:null };
  newWfStep = 0;
  const body = document.getElementById('new-wf-body');
  body.innerHTML = `
    <div id="nwf-preview" style="display:none;margin:12px 16px;background:#f9f9fb;border:1px solid #efefef;border-radius:6px;padding:10px 12px;font-size:12px;color:#555;line-height:1.8">
      <div id="nwf-prev-name">Nome: <span style="color:#1a1a1a;font-weight:600">—</span></div>
      <div id="nwf-prev-icon">Icon: <span style="color:#1a1a1a;font-weight:600">—</span></div>
      <div id="nwf-prev-desc">Description: <span style="color:#1a1a1a;font-weight:600">—</span></div>
      <div id="nwf-prev-source" style="display:none">Copiado de: <span style="color:#0c6fcd;font-weight:600">—</span></div>
    </div>
    <div class="cm-msgs" id="nwf-msgs" style="flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px"></div>
    <div id="nwf-origin-picker" style="display:none;padding:0 16px 8px;flex-direction:column;gap:8px"></div>
    <div id="nwf-icon-grid" style="display:none;padding:8px 16px;display:none;flex-wrap:wrap;gap:8px"></div>
    <div id="nwf-suggestions" style="padding:0 16px 8px;display:flex;flex-wrap:wrap;gap:6px"></div>
    <div style="padding:8px 16px;border-top:1px solid #f0f0f0;display:flex;gap:6px">
      <input class="cm-input" id="nwf-input" placeholder="Digite..." onkeydown="if(event.key==='Enter')sendNewWfChat()" style="flex:1;border:1px solid #e0e0e0;border-radius:6px;padding:7px 10px;font-size:13px">
      <button onclick="sendNewWfChat()" style="background:#0c6fcd;border:none;border-radius:6px;padding:7px 10px;cursor:pointer;display:flex;align-items:center"><svg viewBox="0 0 16 16" stroke="white" stroke-width="2" fill="none" width="13" height="13"><path d="M2 8l12-6-4 12-3-4-5-2z"/></svg></button>
    </div>`;
  document.getElementById('new-wf-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeNewWfPanel()">Cancel</button>
    <button class="btn btn-primary" style="flex:1;justify-content:center;opacity:.4;cursor:default" id="new-wf-btn" disabled onclick="confirmCreateWorkflow()">Criar Job</button>`;
  document.getElementById('new-wf-panel').style.right = '0';
  setTimeout(() => {
    addNwfMsg('ai', newWfFlows[0].ai);
    renderNwfSuggs(newWfFlows[0].sugg);
  }, 200);
}

function closeNewWfPanel() {
  document.getElementById('new-wf-panel').style.right = '-400px';
}

function addNwfMsg(who, text) {
  const msgs = document.getElementById('nwf-msgs'); if (!msgs) return;
  const d = document.createElement('div'); d.className = 'cm-msg cm-'+who;
  d.style.cssText = 'white-space:pre-line'; d.textContent = text;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}
function renderNwfSuggs(sugg) {
  const c = document.getElementById('nwf-suggestions'); if (!c) return;
  c.innerHTML = sugg.map(s => `<button class="cm-suggestion" onclick="selectNwfSugg('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('');
}
function selectNwfSugg(text) {
  const i = document.getElementById('nwf-input'); if (!i) return;
  i.value = text; sendNewWfChat();
}

function sendNewWfChat() {
  const input = document.getElementById('nwf-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  input.value = ''; addNwfMsg('user', text);
  document.getElementById('nwf-suggestions').innerHTML = '';
  const step = newWfFlows[newWfStep];
  if (step.field) newWfDraft[step.field] = text;
  newWfStep++;
  _updateNwfPreview();
  setTimeout(() => {
    if (newWfStep < newWfFlows.length) {
      const next = newWfFlows[newWfStep];
      if (newWfStep === 1) {
        // Origin picker step
        renderNwfOriginPicker();
      } else if (newWfStep === 2) {
        // Icon picker step
        addNwfMsg('ai', next.ai);
        const grid = document.getElementById('nwf-icon-grid');
        grid.style.display = 'flex';
        grid.innerHTML = WF_ICONS.map(ic => `<button onclick="pickWfIcon('${ic}')" style="font-size:22px;background:#f9f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer;line-height:1;transition:background .15s" title="${ic}">${ic}</button>`).join('');
      } else if (newWfStep === 4) {
        // Stages preview step
        const grid = document.getElementById('nwf-icon-grid'); if (grid) grid.style.display = 'none';
        renderNwfStagesPreview();
      } else {
        const grid = document.getElementById('nwf-icon-grid'); if (grid) grid.style.display = 'none';
        if (next.ai) addNwfMsg('ai', next.ai);
        if (newWfStep === newWfFlows.length - 1) {
          const srcLine = newWfDraft.sourceId ? `\n• Modelo base: ${WORKFLOW_DEFS.find(w=>w.id===newWfDraft.sourceId)?.name||'—'}` : '';
          addNwfMsg('ai', `Perfeito! Resumo do Order Job:\n• Nome: ${newWfDraft.name}\n• Icon: ${newWfDraft.icon}\n• Description: ${newWfDraft.description}${srcLine}\n• Stages: 4 marcos configurados\n\nDeseja criar o Order Job?`);
        }
        renderNwfSuggs(next.sugg || []);
      }
    } else {
      const btn = document.getElementById('new-wf-btn');
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
      renderNwfSuggs([]);
    }
  }, 400);
}

function pickWfIcon(icon) {
  newWfDraft.icon = icon;
  const grid = document.getElementById('nwf-icon-grid'); if (grid) grid.style.display = 'none';
  addNwfMsg('user', icon);
  newWfStep++;
  _updateNwfPreview();
  setTimeout(() => {
    addNwfMsg('ai', newWfFlows[newWfStep]?.ai || 'Descreva o propósito deste Order Job:');
    const baseSugg = newWfFlows[newWfStep]?.sugg || [];
    // If copying, offer inherited description as first suggestion
    const sugg = (newWfDraft.sourceId && newWfDraft.description)
      ? [newWfDraft.description, ...baseSugg].slice(0, 4)
      : baseSugg;
    renderNwfSuggs(sugg);
  }, 300);
}

function _updateNwfPreview() {
  const p = document.getElementById('nwf-preview'); if (p) p.style.display = 'block';
  const n = document.getElementById('nwf-prev-name'); if (n) n.innerHTML = `Nome: <span style="color:#1a1a1a;font-weight:600">${newWfDraft.name||'—'}</span>`;
  const ic = document.getElementById('nwf-prev-icon'); if (ic) ic.innerHTML = `Icon: <span style="color:#1a1a1a;font-weight:600">${newWfDraft.icon||'—'}</span>`;
  const d = document.getElementById('nwf-prev-desc'); if (d) d.innerHTML = `Description: <span style="color:#1a1a1a;font-weight:600">${newWfDraft.description||'—'}</span>`;
  const src = document.getElementById('nwf-prev-source');
  if (src) {
    if (newWfDraft.sourceId) {
      const srcWf = WORKFLOW_DEFS.find(w => w.id === newWfDraft.sourceId);
      src.innerHTML = `Copiado de: <span style="color:#0c6fcd;font-weight:600">${srcWf ? srcWf.name : '—'}</span>`;
      src.style.display = 'block';
    } else {
      src.style.display = 'none';
    }
  }
}

function renderNwfStagesPreview() {
  const src = newWfDraft.sourceId ? WORKFLOW_DEFS.find(w => w.id === newWfDraft.sourceId) : null;
  const EMPTY_MARCOS = [
    { id:'wf-payments', name:'Payment Confirmation', icon:'💳', color:'#059669', tasks:[] },
    { id:'wf-standard', name:'Preparing Items',         icon:'📦', color:'#0c6fcd', tasks:[] },
    { id:'wf-nfe',      name:'Invoices Issued',            icon:'🧾', color:'#059669', tasks:[] },
    { id:'wf-delivery', name:'Received by Customer',    icon:'📬', color:'#d97706', tasks:[] },
  ];
  const marcos = src && src.marcos ? JSON.parse(JSON.stringify(src.marcos)) : EMPTY_MARCOS;
  newWfDraft.marcos = marcos;

  addNwfMsg('ai', src
    ? `Estes são os ${marcos.length} marcos copiados de "${src.name}". Revise e confirme:`
    : 'Seu Order Job terá os seguintes 4 marcos. Confirme para criar:');

  // Render marcos as a visual block inside the chat
  const msgs = document.getElementById('nwf-msgs');
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin:4px 0';
  wrap.innerHTML = marcos.map(m => {
    const taskList = m.tasks.length
      ? m.tasks.map(t => `<div style="font-size:11px;color:#555;padding:1px 0">• ${t.name}</div>`).join('')
      : `<div style="font-size:11px;color:#aaa;font-style:italic">Stage sem tarefas definidas</div>`;
    return `
      <div style="border:1px solid ${m.color}40;background:${m.color}08;border-radius:8px;padding:10px 12px">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <span style="font-size:15px">${m.icon}</span>
          <span style="font-size:12.5px;font-weight:700;color:${m.color}">${m.name}</span>
          <span style="margin-left:auto;font-size:10px;font-weight:600;background:${m.color}20;color:${m.color};padding:1px 7px;border-radius:10px">${m.tasks.length} tarefa${m.tasks.length !== 1 ? 's' : ''}</span>
        </div>
        <div style="padding-left:4px">${taskList}</div>
      </div>`;
  }).join('');
  msgs.appendChild(wrap);
  msgs.scrollTop = msgs.scrollHeight;

  // Enable create button + show confirm suggestion
  setTimeout(() => {
    addNwfMsg('ai', 'Tudo certo! Clique em "Criar Job" ou confirme abaixo.');
    renderNwfSuggs(['Confirm e criar']);
    const btn = document.getElementById('new-wf-btn');
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
  }, 350);
}

function confirmCreateWorkflow() {
  const newId = 'oj-' + Date.now();
  newWfDraft.color = WF_COLORS[WORKFLOW_DEFS.length % WF_COLORS.length];
  const marcos = newWfDraft.marcos ? JSON.parse(JSON.stringify(newWfDraft.marcos)) : [];
  const srcName = newWfDraft.sourceId
    ? (WORKFLOW_DEFS.find(w => w.id === newWfDraft.sourceId)?.name || null)
    : null;
  WORKFLOW_DEFS.push({
    id: newId,
    name: newWfDraft.name || 'Novo Order Job',
    icon: newWfDraft.icon || '📦',
    color: newWfDraft.color,
    orderCount: 0,
    archived: false,
    description: newWfDraft.description || '',
    edges: [
      { id:'e1', from:'wf-payments', to:'wf-standard', active:true },
      { id:'e2', from:'wf-standard', to:'wf-nfe',      active:true },
      { id:'e3', from:'wf-nfe',      to:'wf-delivery', active:true },
    ],
    marcos,
  });
  closeNewWfPanel();
  renderWorkflowList();
  const msg = srcName
    ? `"${newWfDraft.name}" foi criado com base em "${srcName}". Clique em "Abrir" para personalizar os marcos.`
    : `"${newWfDraft.name}" foi adicionado. Clique em "Abrir" para configurar os marcos e tarefas.`;
  showSuccessModal('Order Job criado!', msg);
}

function renderNwfOriginPicker() {
  addNwfMsg('ai', 'Selecione o modelo base para este Order Job:');
  const container = document.getElementById('nwf-origin-picker');
  container.style.display = 'flex';
  const BASE_MODELS = [
    { id: null,         icon: '✨', name: 'Estrutura vazia',       desc: 'Crie os marcos e tarefas do zero' },
    { id: 'oj-home',   icon: '🚚', name: 'Home Delivery', desc: '4 marcos · transportadora ao endereço' },
    { id: 'oj-bopis',  icon: '🏪', name: 'Store Pickup',     desc: '4 marcos · BOPIS / pickup in store' },
    { id: 'oj-digital',icon: '💻', name: 'Digital Delivery',      desc: '4 marcos · licença, e-mail, acesso' },
  ];
  const btnStyle = 'display:flex;align-items:center;gap:10px;background:#f9f9fb;border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 12px;cursor:pointer;text-align:left;width:100%;transition:border-color .15s';
  container.innerHTML = BASE_MODELS.map(m => `
    <button onclick="pickNwfOrigin('${m.id}')" style="${btnStyle}" onmouseover="this.style.borderColor='#0c6fcd'" onmouseout="this.style.borderColor='#e5e7eb'">
      <span style="font-size:22px;flex-shrink:0">${m.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:600;color:#1a1a1a">${m.name}</div>
        <div style="font-size:11px;color:#888;margin-top:2px">${m.desc}</div>
      </div>
      ${m.id ? `<svg viewBox="0 0 14 14" fill="none" stroke="#0c6fcd" stroke-width="2" width="12" height="12"><rect x="1" y="3" width="9" height="10" rx="1"/><path d="M4 3V2h9v9h-1"/></svg>` : ''}
    </button>`).join('');
}

function pickNwfOrigin(sourceId) {
  const container = document.getElementById('nwf-origin-picker');
  if (container) container.style.display = 'none';
  if (sourceId) {
    const src = WORKFLOW_DEFS.find(w => w.id === sourceId);
    newWfDraft.sourceId = sourceId;
    newWfDraft.icon    = src ? src.icon : '📦';
    newWfDraft.description = src ? (src.description || '') : '';
    const marcosCount = src && src.marcos ? src.marcos.length : 0;
    addNwfMsg('user', `Usar modelo: ${src ? src.name : sourceId}`);
    setTimeout(() => addNwfMsg('ai', `Ótimo! Vou usar os ${marcosCount} marcos de "${src ? src.name : sourceId}" como base. Agora escolha um ícone para o novo Order Job:`), 300);
  } else {
    newWfDraft.sourceId = null;
    addNwfMsg('user', 'Estrutura vazia');
    setTimeout(() => addNwfMsg('ai', 'Perfeito! Escolha um ícone para identificar visualmente este Order Job:'), 300);
  }
  newWfStep = 2;
  _updateNwfPreview();
  setTimeout(() => {
    const grid = document.getElementById('nwf-icon-grid');
    grid.style.display = 'flex';
    grid.innerHTML = WF_ICONS.map(ic => `<button onclick="pickWfIcon('${ic}')" style="font-size:22px;background:#f9f9fb;border:1px solid #e5e7eb;border-radius:8px;padding:6px 10px;cursor:pointer;line-height:1;transition:background .15s" title="${ic}">${ic}</button>`).join('');
  }, 450);
}

// ══════════════════════════════════════════
// BULK CONFIGURATION
// ══════════════════════════════════════════

function findSimilarInWorkflows(name, wfIds) {
  const warnings = [];
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(name);
  wfIds.forEach(wfId => {
    const wf = WORKFLOW_DEFS.find(w => w.id === wfId); if (!wf) return;
    wf.tasks.forEach(stage => {
      const sn = norm(stage.name);
      if (sn === target || sn.includes(target) || target.includes(sn))
        warnings.push({ wfName: wf.name, matchName: stage.name, matchType: 'etapa' });
      (stage.tasks || []).forEach(t => {
        const tn = norm(t.name);
        if (tn === target || tn.includes(target) || target.includes(tn))
          warnings.push({ wfName: wf.name, matchName: t.name, matchType: 'tarefa' });
      });
    });
  });
  return warnings.filter((w, i, arr) => arr.findIndex(x => x.matchName === w.matchName && x.wfName === w.wfName) === i);
}

function addBulkMsg(who, text) {
  const msgs = document.getElementById('bulk-msgs'); if (!msgs) return;
  const d = document.createElement('div'); d.className = 'cm-msg cm-'+who;
  d.style.cssText = 'white-space:pre-line'; d.textContent = text;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}
function renderBulkSuggs(sugg) {
  const c = document.getElementById('bulk-suggestions'); if (!c) return;
  c.innerHTML = sugg.map(s => `<button class="cm-suggestion" onclick="selectBulkSugg('${s.replace(/'/g,"\\'")}')">${s}</button>`).join('');
}
function selectBulkSugg(text) {
  const i = document.getElementById('bulk-input'); if (!i) return;
  i.value = text; sendBulkChat();
}

function openBulkConfigPanel() {
  bulkChatState = 'select-operation';
  bulkDraft = { operation:null, workflowIds:[], name:'', position:null, afterStageName:'', targetStageId:null, tasks:[], similarityWarnings:[], impactWarnings:[] };
  document.getElementById('bulk-sp-title').textContent = 'Bulk Configure';
  document.getElementById('bulk-sp-body').innerHTML = `
    <div class="cm-msgs" id="bulk-msgs" style="flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px"></div>
    <div id="bulk-suggestions" style="padding:0 16px 8px;display:flex;flex-wrap:wrap;gap:6px"></div>
    <div style="padding:8px 16px;border-top:1px solid #f0f0f0;display:flex;gap:6px">
      <input class="cm-input" id="bulk-input" placeholder="Digite ou selecione..." onkeydown="if(event.key==='Enter')sendBulkChat()" style="flex:1;border:1px solid #e0e0e0;border-radius:6px;padding:7px 10px;font-size:13px">
      <button onclick="sendBulkChat()" style="background:#0c6fcd;border:none;border-radius:6px;padding:7px 10px;cursor:pointer;display:flex;align-items:center"><svg viewBox="0 0 16 16" stroke="white" stroke-width="2" fill="none" width="13" height="13"><path d="M2 8l12-6-4 12-3-4-5-2z"/></svg></button>
    </div>`;
  document.getElementById('bulk-sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeBulkPanel()">Close</button>
    <button class="btn btn-primary" style="flex:1;justify-content:center;opacity:.4;cursor:default" id="bulk-apply-btn" disabled onclick="applyBulkConfig()">Aplicar</button>`;
  const panel = document.getElementById('bulk-panel');
  if (panel) panel.style.right = '0';
  setTimeout(() => {
    addBulkMsg('ai', 'Olá! Vou ajudá-lo a configurar múltiplos workflows de uma vez.\n\nO que deseja fazer?');
    renderBulkSuggs(['Adicionar nova etapa', 'Adicionar nova tarefa em etapa existente']);
  }, 200);
}

function closeBulkPanel() {
  const panel = document.getElementById('bulk-panel');
  if (panel) panel.style.right = '-400px';
  bulkChatState = 'idle';
}

function sendBulkChat() {
  const input = document.getElementById('bulk-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  input.value = '';
  addBulkMsg('user', text);
  const sugg = document.getElementById('bulk-suggestions');
  if (sugg) sugg.innerHTML = '';
  setTimeout(() => processBulkChat(text), 400);
}

function processBulkChat(text) {
  const lower = text.toLowerCase();

  if (bulkChatState === 'select-operation') {
    if (lower.includes('etapa')) {
      bulkDraft.operation = 'add-stage'; bulkChatState = 'select-workflows';
      addBulkMsg('ai', 'Perfeito! Vou adicionar uma nova etapa.\n\nEm quais workflows você deseja adicionar? Os disponíveis são:\n• ' + WORKFLOW_DEFS.map(w => w.name).join('\n• ') + '\n\nDigite os nomes ou selecione abaixo:');
      renderBulkSuggs(WORKFLOW_DEFS.map(w => w.name).concat(['Todos os workflows']));
    } else if (lower.includes('tarefa')) {
      bulkDraft.operation = 'add-task'; bulkChatState = 'select-workflows';
      addBulkMsg('ai', 'Entendido! Vou adicionar uma nova tarefa em uma etapa existente.\n\nEm quais workflows? Os disponíveis são:\n• ' + WORKFLOW_DEFS.map(w => w.name).join('\n• ') + '\n\nDigite os nomes ou selecione abaixo:');
      renderBulkSuggs(WORKFLOW_DEFS.map(w => w.name).concat(['Todos os workflows']));
    } else {
      addBulkMsg('ai', 'Por favor, escolha uma opção:');
      renderBulkSuggs(['Adicionar nova etapa', 'Adicionar nova tarefa em etapa existente']);
    }
    return;
  }

  if (bulkChatState === 'select-workflows') {
    let selected = [];
    if (lower.includes('todos') || lower.includes('all')) {
      selected = WORKFLOW_DEFS.map(w => w.id);
    } else {
      WORKFLOW_DEFS.forEach(w => {
        if (lower.includes(w.name.toLowerCase()) || lower.includes(w.id.toLowerCase()))
          selected.push(w.id);
      });
    }
    if (!selected.length) {
      addBulkMsg('ai', 'Não encontrei nenhum workflow com esse nome. Os disponíveis são:\n• ' + WORKFLOW_DEFS.map(w => w.name).join('\n• '));
      renderBulkSuggs(WORKFLOW_DEFS.map(w => w.name).concat(['Todos os workflows']));
      return;
    }
    bulkDraft.workflowIds = selected;
    const wfNames = selected.map(id => WORKFLOW_DEFS.find(w => w.id === id)?.name || id).join(', ');
    bulkChatState = 'name-input';
    const item = bulkDraft.operation === 'add-stage' ? 'etapa' : 'tarefa';
    addBulkMsg('ai', '✓ Workflows selecionados: ' + wfNames + '\n\nQual o nome da nova ' + item + '?');
    renderBulkSuggs([]);
    return;
  }

  if (bulkChatState === 'name-input') {
    bulkDraft.name = text;
    const warnings = findSimilarInWorkflows(text, bulkDraft.workflowIds);
    bulkDraft.similarityWarnings = warnings;
    if (warnings.length > 0) {
      bulkChatState = 'similarity-confirm';
      const warnText = warnings.map(w => '• "' + w.matchName + '" (' + w.matchType + ') em ' + w.wfName).join('\n');
      addBulkMsg('ai', '⚠️ Encontrei ' + (bulkDraft.operation === 'add-stage' ? 'etapas/tarefas' : 'tarefas') + ' similares nos workflows selecionados:\n' + warnText + '\n\nDeseja continuar mesmo assim?');
      renderBulkSuggs(['Sim, continuar', 'Não, usar outro nome']);
    } else {
      _bulkAfterNameConfirmed();
    }
    return;
  }

  if (bulkChatState === 'similarity-confirm') {
    if (lower.includes('sim') || lower.includes('contin')) {
      _bulkAfterNameConfirmed();
    } else {
      bulkChatState = 'name-input';
      const item = bulkDraft.operation === 'add-stage' ? 'etapa' : 'tarefa';
      addBulkMsg('ai', 'Ok! Digite um novo nome para a ' + item + ':');
      renderBulkSuggs([]);
    }
    return;
  }

  if (bulkChatState === 'stage-pick') {
    let foundStageId = null, foundStageName = null;
    for (const wfId of bulkDraft.workflowIds) {
      const wf = WORKFLOW_DEFS.find(w => w.id === wfId); if (!wf) continue;
      const stage = wf.tasks.find(s => s.name.toLowerCase().includes(lower) || s.id.toLowerCase() === lower);
      if (stage) { foundStageId = stage.id; foundStageName = stage.name; break; }
    }
    if (!foundStageId) {
      addBulkMsg('ai', 'Não encontrei essa etapa. Por favor selecione uma das opções abaixo:');
      _bulkAskStagePick();
      return;
    }
    bulkDraft.targetStageId = foundStageId;
    bulkChatState = 'position-input';
    const impactWarnings = [];
    bulkDraft.workflowIds.forEach(wfId => {
      const wf = WORKFLOW_DEFS.find(w => w.id === wfId); if (!wf) return;
      const stage = wf.tasks.find(s => s.name === foundStageName);
      if (stage && (stage.tasks||[]).length > 0)
        impactWarnings.push({ wfName: wf.name, taskCount: stage.tasks.length });
    });
    bulkDraft.impactWarnings = impactWarnings;
    if (impactWarnings.length) {
      const warnText = impactWarnings.map(w => '• ' + w.wfName + ': ' + w.taskCount + ' tarefa(s) existente(s)').join('\n');
      addBulkMsg('ai', 'ℹ️ A etapa "' + foundStageName + '" já possui tarefas em:\n' + warnText + '\n\n"' + bulkDraft.name + '" será adicionada junto às existentes.\n\nOnde dentro dessa etapa você quer posicionar a tarefa?');
    } else {
      addBulkMsg('ai', '✓ Etapa "' + foundStageName + '" selecionada.\n\nOnde você quer posicionar "' + bulkDraft.name + '" dentro dessa etapa?');
    }
    renderBulkSuggs(['No início', 'No final']);
    return;
  }

  if (bulkChatState === 'position-input') {
    if (bulkDraft.operation === 'add-task') {
      bulkDraft.position = (lower.includes('início') || lower.includes('inicio')) ? 'start' : 'end';
      _bulkShowReview();
      return;
    }
    if (lower.includes('início') || lower.includes('inicio') || lower === 'no início') {
      bulkDraft.position = 'start'; bulkDraft.afterStageName = '';
    } else if (lower.includes('fim') || lower.includes('final') || lower === 'no final') {
      bulkDraft.position = 'end'; bulkDraft.afterStageName = '';
    } else {
      const afterMatch = text.match(/depois d[aeo]?\s+(.+)/i);
      if (afterMatch) {
        const stageName = afterMatch[1].trim();
        bulkDraft.afterStageName = stageName;
        bulkDraft.position = 'after:' + stageName;
      } else {
        bulkDraft.afterStageName = text;
        bulkDraft.position = 'after:' + text;
      }
    }
    bulkChatState = 'tasks-input';
    addBulkMsg('ai', '✓ Posição definida.\n\nQuais tarefas você quer incluir na nova etapa "' + bulkDraft.name + '"?\n\nDigite os nomes (um por linha ou separados por vírgula), ou selecione:');
    renderBulkSuggs(['Criar tarefa com nome da etapa (' + bulkDraft.name + ')', 'No tasks (criar vazia)']);
    return;
  }

  if (bulkChatState === 'tasks-input') {
    if (lower.includes('sem tarefa') || lower.includes('criar vazia') || lower === 'vazia') {
      bulkDraft.tasks = [bulkDraft.name];
    } else if (lower.includes('nome da etapa') || lower.includes('criar tarefa com nome')) {
      bulkDraft.tasks = [bulkDraft.name];
    } else {
      bulkDraft.tasks = text.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
    }
    _bulkShowReview();
    return;
  }

  if (bulkChatState === 'review') {
    if (lower.includes('confirmar') || lower.includes('aplicar') || lower === 'sim') {
      applyBulkConfig();
    } else if (lower.includes('não') || lower.includes('cancelar')) {
      closeBulkPanel();
    } else {
      addBulkMsg('ai', 'Confirm a aplicação?');
      renderBulkSuggs(['Confirm e aplicar', 'Cancel']);
    }
    return;
  }
}

function _bulkAfterNameConfirmed() {
  if (bulkDraft.operation === 'add-task') {
    bulkChatState = 'stage-pick';
    _bulkAskStagePick();
  } else {
    bulkChatState = 'position-input';
    const wfId = bulkDraft.workflowIds[0];
    const wf = WORKFLOW_DEFS.find(w => w.id === wfId);
    const posOptions = ['No início', 'No final'];
    if (wf) wf.tasks.forEach(s => posOptions.push('Depois de ' + s.name));
    addBulkMsg('ai', '✓ Nome definido: "' + bulkDraft.name + '".\n\n⚡ Checando impacto nos workflows selecionados...\n\nOnde você quer inserir a nova etapa "' + bulkDraft.name + '"?');
    renderBulkSuggs(posOptions.slice(0, 4));
  }
}

function _bulkAskStagePick() {
  const stageNames = [];
  bulkDraft.workflowIds.forEach(wfId => {
    const wf = WORKFLOW_DEFS.find(w => w.id === wfId); if (!wf) return;
    wf.tasks.forEach(s => { if (!stageNames.includes(s.name)) stageNames.push(s.name); });
  });
  addBulkMsg('ai', 'Em qual etapa você quer adicionar a tarefa "' + bulkDraft.name + '"?\n\nEtapas disponíveis nos workflows selecionados:');
  renderBulkSuggs(stageNames.slice(0, 4));
}

function _bulkShowReview() {
  bulkChatState = 'review';
  const wfNames = bulkDraft.workflowIds.map(id => WORKFLOW_DEFS.find(w => w.id === id)?.name || id).join(', ');
  let summary = '';
  if (bulkDraft.operation === 'add-stage') {
    const pos = bulkDraft.position === 'start' ? 'início' : bulkDraft.position === 'end' ? 'final' : 'depois de "' + bulkDraft.afterStageName + '"';
    summary = '📋 Resumo da configuração em lote:\n\n• Operação: Adicionar etapa\n• Nome: "' + bulkDraft.name + '"\n• Workflows: ' + wfNames + '\n• Posição: ' + pos + '\n• Tasks: ' + (bulkDraft.tasks.join(', ') || '(nenhuma)');
  } else {
    const pos = bulkDraft.position === 'start' ? 'início da etapa' : 'final da etapa';
    summary = '📋 Resumo da configuração em lote:\n\n• Operação: Adicionar tarefa\n• Nome: "' + bulkDraft.name + '"\n• Workflows: ' + wfNames + '\n• Posição: ' + pos;
  }
  addBulkMsg('ai', summary + '\n\nConfirm e aplicar?');
  renderBulkSuggs(['Confirm e aplicar', 'Cancel']);
  const btn = document.getElementById('bulk-apply-btn');
  if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
}

function applyBulkConfig() {
  const colors = ['#0c6fcd','#7c3aed','#0891b2','#059669','#d97706','#6366f1','#0f766e','#dc2626'];
  let appliedCount = 0;

  bulkDraft.workflowIds.forEach(wfId => {
    const wf = WORKFLOW_DEFS.find(w => w.id === wfId); if (!wf) return;

    if (bulkDraft.operation === 'add-stage') {
      const newId = 'bulk_' + wfId + '_' + Date.now();
      const newStage = {
        id: newId,
        name: bulkDraft.name,
        color: colors[wf.tasks.length % colors.length],
        tasks: (bulkDraft.tasks.length ? bulkDraft.tasks : [bulkDraft.name]).map((tn, ti) => ({
          id: newId + '_' + ti,
          name: tn, supplier: 'A definir', category: 'All',
          active: true, visibility: 'user', script: null, externalApi: null,
          mcpConfig: null, agentConfig: null, contextOutput: []
        }))
      };

      let insertIdx;
      if (bulkDraft.position === 'start') {
        insertIdx = 0;
      } else if (bulkDraft.position === 'end') {
        insertIdx = wf.tasks.length;
      } else {
        const afterName = bulkDraft.afterStageName.toLowerCase();
        const afterIdx = wf.tasks.findIndex(s => s.name.toLowerCase().includes(afterName));
        insertIdx = afterIdx !== -1 ? afterIdx + 1 : wf.tasks.length;
      }
      wf.tasks.splice(insertIdx, 0, newStage);

      if (!wf.edges) wf.edges = [];
      if (insertIdx > 0) wf.edges.push({id:'be'+Date.now(), from:wf.tasks[insertIdx-1].id, to:newId, active:true});
      if (insertIdx < wf.tasks.length-1) wf.edges.push({id:'be'+(Date.now()+1), from:newId, to:wf.tasks[insertIdx+1].id, active:true});
      appliedCount++;

    } else if (bulkDraft.operation === 'add-task') {
      // Find the target stage by id or matching name across workflows
      const targetName = (() => {
        for (const wDef of WORKFLOW_DEFS) {
          const s = wDef.tasks.find(s => s.id === bulkDraft.targetStageId);
          if (s) return s.name;
        }
        return null;
      })();
      const stage = wf.tasks.find(s => s.id === bulkDraft.targetStageId || (targetName && s.name === targetName));
      if (!stage) return;
      const newId = 'bt_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
      const newTask = {
        id: newId, name: bulkDraft.name, supplier: 'A definir', category: 'All',
        active: true, visibility: 'user', script: null, externalApi: null,
        mcpConfig: null, agentConfig: null, contextOutput: []
      };
      if (!stage.tasks) stage.tasks = [];
      if (bulkDraft.position === 'start') stage.tasks.unshift(newTask);
      else stage.tasks.push(newTask);
      appliedCount++;
    }
  });

  // If currently viewing one of the modified workflows, refresh
  if (currentWorkflowId && bulkDraft.workflowIds.includes(currentWorkflowId)) {
    const wf = WORKFLOW_DEFS.find(w => w.id === currentWorkflowId);
    if (wf) { WF_TASKS = wf.tasks; WF_EDGES = wf.edges || []; }
  }

  closeBulkPanel();
  if (typeof showSuccessModal === 'function') {
    const opLabel = bulkDraft.operation === 'add-stage' ? 'Etapa' : 'Tarefa';
    showSuccessModal(opLabel + ' adicionada!', '"' + bulkDraft.name + '" foi adicionada em ' + appliedCount + ' workflow(s).');
  }
  renderWorkflowList();
}

// ══════════════════════════════════════════
// EXTENSIBILITY — CONNECTORS & SKILLS
// ══════════════════════════════════════════

// ── Slot label helpers ─────────────────────────────────────────────────────
const SLOT_LABELS = {
  carrier_x:         'carrier_x',
  payment_processor: 'payment_processor',
  invoice_system:    'invoice_system',
  warehouse_x:       'warehouse_x',
  notification_x:    'notification_x',
};

function getSlotConnectorName(wfId, slot) {
  const bindings = (typeof CONNECTOR_BINDINGS !== 'undefined' && CONNECTOR_BINDINGS[wfId]) || {};
  const b = bindings[slot];
  if (!b || !b.connectorId) return null;
  const def = (typeof CONNECTOR_CATALOG !== 'undefined') && CONNECTOR_CATALOG.find(c => c.id === b.connectorId);
  return def ? def.displayName : null;
}

// ── Connector panel (side panel) ──────────────────────────────────────────
function openConnectorPanel(wfId) {
  if (!wfId) return;
  const bindings = (typeof CONNECTOR_BINDINGS !== 'undefined' && CONNECTOR_BINDINGS[wfId]) || {};
  const SLOTS = ['carrier_x','payment_processor','invoice_system','warehouse_x','notification_x'];
  const slotIcons  = { carrier_x:'🚚', payment_processor:'💳', invoice_system:'🧾', warehouse_x:'🏭', notification_x:'🔔' };
  const kindColor  = { discover:'#7c3aed', mutate:'#0c6fcd', cancel:'#dc2626', read:'#0891b2', preflight:'#d97706', maintain:'#6b7280' };
  const kindLabel  = { discover:'descoberta', mutate:'mutação', cancel:'cancelamento', read:'leitura', preflight:'pré-check', maintain:'reconciliação' };

  // Build slot → [{ stage, task, mapping }] from current WF_TASKS
  function getTasksForSlot(slot) {
    const result = [];
    (WF_TASKS || []).forEach((stage, si) => {
      (stage.tasks || []).forEach(task => {
        const taskSlot = (typeof TASK_SLOT_MAP !== 'undefined') && TASK_SLOT_MAP[task.id];
        if (taskSlot === slot) {
          const mapping = (typeof TASK_FUNCTION_MAP !== 'undefined') && TASK_FUNCTION_MAP[task.id];
          result.push({ stage, stageIdx: si, task, mapping: mapping || null });
        }
      });
    });
    return result;
  }

  const slotsHtml = SLOTS.map(slot => {
    const b = bindings[slot];
    const connector = b && (typeof CONNECTOR_CATALOG !== 'undefined') && CONNECTOR_CATALOG.find(c => c.id === b.connectorId);
    const configured = !!connector;
    const stateColor = !configured ? '#9ca3af' : b.state === 'active' ? '#15803d' : '#dc2626';
    const stateBg    = !configured ? '#f9fafb' : b.state === 'active' ? '#f0fdf4' : '#fef2f2';
    const stateLabel = !configured ? 'Not configured' : b.state === 'active' ? 'Active' : 'Erro';

    const linkedTasks = getTasksForSlot(slot);

    // Group tasks by stage
    const byStage = {};
    linkedTasks.forEach(({ stage, stageIdx, task, mapping }) => {
      const key = stage.id;
      if (!byStage[key]) byStage[key] = { stage, stageIdx, tasks: [] };
      byStage[key].tasks.push({ task, mapping });
    });

    const stagesHtml = Object.values(byStage).map(({ stage, stageIdx, tasks }) => {
      const tasksHtml = tasks.map(({ task, mapping }) => {
        const hasFn = mapping && mapping.fn;
        const fnColor = hasFn ? (kindColor[mapping.trigger] || '#888') : '#9ca3af';
        const fnBadge = hasFn
          ? `<span style="font-size:9.5px;font-weight:600;padding:1px 7px;border-radius:10px;background:${fnColor}15;color:${fnColor};border:1px solid ${fnColor}35;white-space:nowrap">${mapping.fn}</span><span style="font-size:9px;color:#aaa;margin-left:2px">[${kindLabel[mapping.trigger]||mapping.trigger}]</span>`
          : `<span style="font-size:9.5px;color:#aaa;font-style:italic">sem chamada externa</span>`;
        const noteHtml = mapping?.note
          ? `<div style="font-size:10px;color:#888;margin-top:2px;line-height:1.4;padding-left:14px">${mapping.note}</div>`
          : '';
        return `
          <div style="padding:6px 0;border-top:1px solid #f3f4f6">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <svg viewBox="0 0 10 10" fill="none" stroke="#d1d5db" stroke-width="1.5" width="8" height="8" style="flex-shrink:0"><circle cx="5" cy="5" r="4"/></svg>
              <span style="font-size:12px;font-weight:500;color:#1a1a1a;flex:1">${task.name}</span>
              <svg viewBox="0 0 12 12" fill="none" stroke="#d1d5db" stroke-width="1.5" width="10" height="10"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
              ${fnBadge}
            </div>
            ${noteHtml}
          </div>`;
      }).join('');
      return `
        <div style="margin-top:10px">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
            <span style="font-size:13px">${stage.icon||'📋'}</span>
            <span style="font-size:11px;font-weight:700;color:${stage.color||'#555'}">${stage.name}</span>
            <span style="font-size:10px;color:#aaa">marco ${stageIdx+1}</span>
          </div>
          <div style="border:1px solid #f0f0f0;border-radius:6px;padding:0 10px;background:#fafafa">
            ${tasksHtml}
          </div>
        </div>`;
    }).join('');

    const noTasksHtml = linkedTasks.length === 0
      ? `<div style="font-size:11px;color:#aaa;font-style:italic;margin-top:8px;padding:8px 10px;background:#fafafa;border:1px solid #f0f0f0;border-radius:6px">Nenhuma tarefa desta workflow usa este slot.</div>`
      : '';

    const testedHtml = b?.lastTested
      ? `<div style="font-size:10.5px;color:#888;margin-top:8px">Last test: ${b.lastTested} <span style="color:${b.lastTestStatus==='success'?'#15803d':'#dc2626'}">● ${b.lastTestStatus==='success'?'OK':'Falhou'}</span></div>`
      : '';

    const testBtn = configured
      ? `<button class="btn btn-secondary btn-sm" style="margin-top:10px;font-size:11px" onclick="testConnector('${wfId}','${slot}')">
           <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="11" height="11"><path d="M3 7l2.5 2.5L11 4"/></svg>
           Test ${connector.displayName}
         </button>`
      : '';

    const authHtml = b?.authDisplay
      ? `<div style="display:flex;align-items:center;gap:6px;margin-top:6px"><svg viewBox="0 0 12 12" fill="none" stroke="#9ca3af" stroke-width="1.5" width="10" height="10"><rect x="2" y="5" width="8" height="6" rx="1"/><path d="M4 5V3.5a2 2 0 014 0V5"/></svg><span style="font-size:10.5px;color:#aaa">Auth: <code style="background:#f3f4f6;padding:1px 5px;border-radius:3px;font-size:10px">${b.authDisplay}</code></span></div>`
      : '';

    return `
      <div style="border:1px solid ${configured?'#e5e7eb':'#f0f0f0'};border-radius:10px;padding:14px;margin-bottom:12px;background:${configured?'#fff':'#fafafa'}">
        <!-- Header -->
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:20px;line-height:1">${slotIcons[slot]||'🔌'}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.5px">${slot}</div>
            <div style="font-size:13.5px;font-weight:700;color:${configured?'#1a1a1a':'#9ca3af'}">${configured?connector.displayName:'Not configured'}</div>
          </div>
          <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;background:${stateBg};color:${stateColor};border:1px solid ${stateColor}30;white-space:nowrap">● ${stateLabel}</span>
        </div>
        ${configured ? `<div style="font-size:11px;color:#888;margin-top:4px">${connector.connections['oms.OrderJob']?.purpose||''}</div>` : ''}
        ${authHtml}
        <!-- Tasks breakdown -->
        ${stagesHtml}
        ${noTasksHtml}
        ${testedHtml}
        ${testBtn}
      </div>`;
  }).join('');

  document.getElementById('sp-title').textContent = 'Connectors & Tasks';
  document.getElementById('sp-body').innerHTML = `
    <div style="padding:2px 0 8px">
      <div style="font-size:12px;color:#888;margin-bottom:14px;line-height:1.5">
        Cada slot vincula um sistema externo às tarefas desta workflow.<br>
        O agente invoca a função indicada automaticamente ao avançar cada tarefa.
      </div>
      ${slotsHtml}
    </div>`;
  document.getElementById('sp-footer').innerHTML = `
    <button class="btn btn-secondary" style="flex:1;justify-content:center" onclick="closeSidePanel()">Close</button>`;
  openSidePanel();
}

// ── Test a connector slot (shows request/response mock) ───────────────────
function testConnector(wfId, slot) {
  const bindings = (typeof CONNECTOR_BINDINGS !== 'undefined' && CONNECTOR_BINDINGS[wfId]) || {};
  const b = bindings[slot]; if (!b) return;
  const connector = (typeof CONNECTOR_CATALOG !== 'undefined') && CONNECTOR_CATALOG.find(c => c.id === b.connectorId);
  if (!connector) return;

  const conn = connector.connections['oms.OrderJob'];
  // Pick the first non-cancel function, or the first function if all are cancel
  const testFn = conn.functions.find(f => f.kind === 'read' || f.kind === 'mutate' || f.kind === 'maintain') || conn.functions[0];

  let mockDate;
  if (connector.id === 'conn-intelipost') {
    mockDate = getMockIntelipostResponse();
  } else {
    const respMap = (typeof MOCK_CONNECTOR_RESPONSES !== 'undefined') && MOCK_CONNECTOR_RESPONSES[connector.id];
    const fn = respMap && respMap[testFn.name];
    mockDate = fn ? fn() : { request:{ method:'GET', url:'https://api.example.com/test' }, response:{ status:200, body:{ ok:true } } };
  }

  const statusColor = mockDate.response.status < 300 ? '#15803d' : '#dc2626';
  const statusBg    = mockDate.response.status < 300 ? '#f0fdf4' : '#fef2f2';

  const prettyJson = obj => JSON.stringify(obj, null, 2)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"([^"]+)":/g, '<span style="color:#7c3aed">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span style="color:#0c6fcd">"$1"</span>');

  const reqBodyHtml = mockDate.request.body
    ? `<div style="font-size:11px;font-weight:600;color:#555;margin:6px 0 3px">Body</div><pre style="font-size:10.5px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px;overflow-x:auto;line-height:1.5">${prettyJson(mockDate.request.body)}</pre>`
    : '';
  const headersHtml = Object.entries(mockDate.request.headers||{}).map(([k,v]) =>
    `<div style="font-size:10.5px;display:flex;gap:6px"><span style="color:#7c3aed;font-weight:600">${k}:</span><span style="color:#555">${v}</span></div>`
  ).join('');

  document.getElementById('ct-logo').textContent = connector.logo;
  document.getElementById('ct-title').textContent = `${connector.displayName} — ${testFn.label}`;
  document.getElementById('ct-subtitle').textContent = conn.purpose;

  document.getElementById('ct-body').innerHTML = `
    <div style="margin-bottom:14px">
      <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Request</div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:11px;font-weight:700;padding:2px 7px;border-radius:4px;background:#0c6fcd14;color:#0c6fcd">${mockDate.request.method}</span>
        <code style="font-size:10.5px;color:#1a1a1a;word-break:break-all">${mockDate.request.url}</code>
      </div>
      <div style="border:1px solid #e5e7eb;border-radius:6px;padding:8px;background:#f9fafb">${headersHtml}</div>
      ${reqBodyHtml}
    </div>
    <div>
      <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Response</div>
      <div style="display:inline-flex;align-items:center;gap:5px;margin-bottom:8px;padding:3px 10px;border-radius:10px;background:${statusBg};border:1px solid ${statusColor}40;color:${statusColor};font-size:11px;font-weight:700">
        ● HTTP ${mockDate.response.status}
      </div>
      <pre style="font-size:10.5px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px;overflow-x:auto;line-height:1.5;max-height:260px">${prettyJson(mockDate.response.body)}</pre>
    </div>`;

  // Determine if this connector has an "apply" action
  const canApply = connector.id === 'conn-intelipost' && slot === 'carrier_x';
  document.getElementById('ct-footer').innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal('modal-connector-test')">Close</button>
    ${canApply ? `<button class="btn btn-primary" onclick="applyConnectorResult('${wfId}','${slot}')">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M3 7l2.5 2.5L11 4"/></svg>
      Usar resultado no fluxo
    </button>` : ''}`;

  // Update the binding's lastTested
  bindings[slot].lastTested = new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}) + ' ' + new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  bindings[slot].lastTestStatus = 'success';

  openModal('modal-connector-test');

  // For Adyen: simulate incoming webhook after 2s
  if (connector.id === 'conn-adyen') {
    setTimeout(() => simulateAdyenWebhook(), 2200);
  }
}

function applyConnectorResult(wfId, slot) {
  closeModal('modal-connector-test');
  // Mark the associated task in the active workflow's first pending stage
  let applied = false;
  for (const stage of WF_TASKS) {
    for (const task of (stage.tasks || [])) {
      const taskSlot = (typeof TASK_SLOT_MAP !== 'undefined') && TASK_SLOT_MAP[task.id];
      if (taskSlot === slot && task.active !== false) {
        task.active = false; // mark as "used"
        applied = true;
        break;
      }
    }
    if (applied) break;
  }
  renderWorkflowBoard();
  showSuccessModal('Resultado aplicado!', 'O rastreio Intelipost foi registrado e a tarefa avançada.');
}

// ── Adyen webhook simulation ──────────────────────────────────────────────
function simulateAdyenWebhook() {
  const now = new Date().toISOString().replace('T',' ').substring(0,19);
  document.getElementById('webhook-body').innerHTML = `
    <div style="font-size:11.5px;color:#888;margin-bottom:12px">Recebido em ${now} via <code style="background:#f5f3ff;color:#7c3aed;padding:1px 5px;border-radius:3px">POST /webhooks/adyen</code></div>
    <pre style="font-size:10.5px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px;overflow-x:auto;line-height:1.5">${JSON.stringify({
  live: false, notificationItems: [{
    NotificationRequestItem: {
      eventCode: "AUTHORISATION",
      success: "true",
      pspReference: "852596757149852J",
      merchantReference: "68947234-cap",
      amount: { currency: "BRL", value: 123000 },
      eventDate: now,
      paymentMethod: "visa",
      reason: "062224:1111:12/2030"
    }
  }]
}, null, 2)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    <div style="margin-top:12px;padding:10px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:12px;color:#15803d;font-weight:600">
      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" style="vertical-align:-1px"><path d="M3 7l2.5 2.5L11 4"/></svg>
      Skill <code style="background:#d1fae5;padding:1px 5px;border-radius:3px;font-size:11px">advance_on_confirmation</code> ativada — tarefa avançada automaticamente.
    </div>`;
  openModal('modal-webhook');
}

// ── Render connector list in Orch Agent screen ────────────────────────────
function renderOrchConnectors() {
  const el = document.getElementById('orch-connector-list'); if (!el) return;
  const wfId = currentWorkflowId || (typeof WORKFLOW_DEFS !== 'undefined' && WORKFLOW_DEFS[0]?.id);
  const bindings = (typeof CONNECTOR_BINDINGS !== 'undefined' && wfId && CONNECTOR_BINDINGS[wfId]) || {};
  const ALL_SLOTS = ['carrier_x','payment_processor','invoice_system','warehouse_x','notification_x'];
  const slotIcons = { carrier_x:'🚚', payment_processor:'💳', invoice_system:'🧾', warehouse_x:'🏭', notification_x:'🔔' };

  const configured = ALL_SLOTS.filter(s => bindings[s]);
  if (!configured.length) {
    el.innerHTML = `<div style="font-size:12px;color:#aaa;text-align:center;padding:14px">Nenhum conector configurado nesta workflow.</div>`;
    return;
  }
  el.innerHTML = configured.map(slot => {
    const b = bindings[slot];
    const connector = (typeof CONNECTOR_CATALOG !== 'undefined') && CONNECTOR_CATALOG.find(c => c.id === b.connectorId);
    if (!connector) return '';
    const conn = connector.connections['oms.OrderJob'];
    const activeSkills = (typeof SKILL_CATALOG !== 'undefined') &&
      Object.values(SKILL_CATALOG).flat().filter(sk => sk.active && sk.type === 'api_call').length;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
        <span style="font-size:18px;line-height:1">${slotIcons[slot]}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:10px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:.4px">${slot}</div>
          <div style="font-size:13px;font-weight:600;color:#1a1a1a">${connector.displayName}</div>
          <div style="font-size:11px;color:#888;margin-top:1px">${conn.purpose}</div>
        </div>
        <span style="font-size:10.5px;font-weight:600;padding:2px 8px;border-radius:10px;background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;white-space:nowrap">● Active</span>
      </div>`;
  }).join('');
}

// ══════════════════════════════════════════
// YAML EXPORT / IMPORT
// ══════════════════════════════════════════

let _importYamlParsed = null; // holds parsed data during conflict resolution

function exportExperience(wfId) {
  const wf = WORKFLOW_DEFS.find(w => w.id === wfId);
  if (!wf) return;

  const bindings = (typeof CONNECTOR_BINDINGS !== 'undefined' && CONNECTOR_BINDINGS[wfId]) || {};
  const connectorMap = {};
  const ALL_SLOTS = ['carrier_x','payment_processor','invoice_system','warehouse_x','notification_x'];
  ALL_SLOTS.forEach(slot => {
    const b = bindings[slot];
    if (b) {
      const cat = (typeof CONNECTOR_CATALOG !== 'undefined') && CONNECTOR_CATALOG.find(c => c.id === b.connectorId);
      connectorMap[slot] = cat ? cat.system : b.connectorId;
    } else {
      connectorMap[slot] = null;
    }
  });

  const exportObj = {
    version: '1.0',
    exported_at: new Date().toISOString().slice(0,19),
    id: wf.id,
    name: wf.name,
    icon: wf.icon || null,
    color: wf.color || null,
    description: wf.description || null,
    connectors: connectorMap,
    marcos: (wf.marcos || []).map(marco => ({
      id: marco.id,
      name: marco.name,
      icon: marco.icon || null,
      color: marco.color || null,
      tasks: (marco.tasks || []).map(task => {
        const t = {
          id: task.id,
          name: task.name,
          supplier: task.supplier || null,
          category: task.category || 'All',
          visibility: task.visibility || 'internal',
          active: task.active !== false,
        };
        if (task.connector_slot) t.connector_slot = task.connector_slot;
        if (task.connector_fn)   t.connector_fn   = task.connector_fn;
        if (task.checkpoints && task.checkpoints.length) t.checkpoints = task.checkpoints;
        if (task.mcpConfig)      t.mcpConfig      = task.mcpConfig;
        if (task.agentConfig)    t.agentConfig    = task.agentConfig;
        return t;
      })
    }))
  };

  const yamlStr = jsyaml.dump(exportObj, { lineWidth: 120, noRefs: true });
  const slug = wf.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const filename = `${slug}-${date}.yml`;

  const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function openImportModal() {
  document.getElementById('import-yaml-text').value = '';
  document.getElementById('import-file-name').textContent = '';
  const err = document.getElementById('import-error');
  err.style.display = 'none'; err.textContent = '';
  _importYamlParsed = null;
  openModal('modal-import-yaml');
}

function handleImportFile(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('import-file-name').textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => { document.getElementById('import-yaml-text').value = e.target.result; };
  reader.readAsText(file, 'UTF-8');
}

function _showImportError(msg) {
  const el = document.getElementById('import-error');
  el.textContent = msg; el.style.display = 'block';
}

function confirmImportYaml() {
  const raw = document.getElementById('import-yaml-text').value.trim();
  if (!raw) { _showImportError('Cole o YAML ou selecione um arquivo antes de importar.'); return; }

  let parsed;
  try {
    parsed = jsyaml.load(raw);
  } catch(e) {
    _showImportError('YAML inválido: ' + e.message); return;
  }

  // Validate required fields
  if (!parsed || typeof parsed !== 'object') { _showImportError('YAML inválido: estrutura não reconhecida.'); return; }
  if (!parsed.name || typeof parsed.name !== 'string') { _showImportError('Campo obrigatório ausente: name'); return; }
  if (!Array.isArray(parsed.marcos) || parsed.marcos.length === 0) { _showImportError('Campo obrigatório ausente: marcos (deve ser um array com pelo menos 1 item)'); return; }
  for (const marco of parsed.marcos) {
    if (!marco.name) { _showImportError(`Campo obrigatório ausente: marcos[].name (marco sem nome encontrado)`); return; }
    if (!Array.isArray(marco.tasks)) { _showImportError(`Campo obrigatório ausente: marcos["${marco.name}"].tasks (deve ser um array)`); return; }
  }

  _importYamlParsed = parsed;

  // Check for id conflict
  if (parsed.id && WORKFLOW_DEFS.find(w => w.id === parsed.id)) {
    const existing = WORKFLOW_DEFS.find(w => w.id === parsed.id);
    const totalTasks = (parsed.marcos || []).reduce((s, m) => s + (m.tasks || []).length, 0);
    document.getElementById('conflict-summary').innerHTML =
      `A workflow <strong>${existing.name}</strong> (id: <code>${parsed.id}</code>) já existe.<br>` +
      `O YAML importado contém <strong>${parsed.marcos.length} marcos</strong> e <strong>${totalTasks} tarefas</strong>.<br><br>` +
      `Deseja substituí-la ou criar uma cópia?`;
    closeModal('modal-import-yaml');
    openModal('modal-import-conflict');
    return;
  }

  _applyImport(parsed, false);
}

function resolveImportConflict(action) {
  closeModal('modal-import-conflict');
  if (!_importYamlParsed) return;
  _applyImport(_importYamlParsed, action === 'copy');
  _importYamlParsed = null;
}

function _applyImport(parsed, asCopy) {
  const warnings = [];

  // Build new experience object
  const newId = asCopy ? ('oj-copy-' + Date.now()) : (parsed.id || ('oj-import-' + Date.now()));
  const newName = asCopy ? (parsed.name + ' (cópia)') : parsed.name;

  const newWf = {
    id: newId,
    name: newName,
    icon: parsed.icon || '📦',
    color: parsed.color || '#64748b',
    description: parsed.description || '',
    marcos: (parsed.marcos || []).map(m => ({
      id: m.id || ('m-' + Date.now() + '-' + Math.random().toString(36).slice(2,6)),
      name: m.name,
      icon: m.icon || '📋',
      color: m.color || '#64748b',
      tasks: (m.tasks || []).map(t => ({
        id: t.id || ('t-' + Date.now() + '-' + Math.random().toString(36).slice(2,6)),
        name: t.name,
        supplier: t.supplier || 'A definir',
        category: t.category || 'All',
        visibility: t.visibility || 'internal',
        active: t.active !== false,
        connector_slot: t.connector_slot || null,
        connector_fn: t.connector_fn || null,
        checkpoints: t.checkpoints || [],
        mcpConfig: t.mcpConfig || null,
        agentConfig: t.agentConfig || null,
        contextOutput: [],
        actions: []
      }))
    }))
  };

  // Remove existing if replace
  if (!asCopy && parsed.id) {
    const idx = WORKFLOW_DEFS.findIndex(w => w.id === parsed.id);
    if (idx !== -1) WORKFLOW_DEFS.splice(idx, 1);
  }
  WORKFLOW_DEFS.push(newWf);

  // Reconnect connectors
  if (typeof CONNECTOR_BINDINGS !== 'undefined' && parsed.connectors) {
    const bindings = {};
    Object.entries(parsed.connectors).forEach(([slot, systemName]) => {
      if (!systemName) { bindings[slot] = null; return; }
      const cat = (typeof CONNECTOR_CATALOG !== 'undefined') && CONNECTOR_CATALOG.find(c => c.system === systemName);
      if (cat) {
        bindings[slot] = { connectorId: cat.id, authDisplay: '●●●●importado', state: 'active', lastTested: null };
      } else {
        bindings[slot] = null;
        warnings.push(`Connector '${systemName}' não encontrado no catálogo — vínculo do slot '${slot}' ignorado.`);
      }
    });
    CONNECTOR_BINDINGS[newId] = bindings;
  }

  // Navigate to the experiences list and refresh
  showScreen('workflow-list');

  let msg = `"${newName}" foi importada com sucesso.`;
  if (warnings.length) msg += '\n\n⚠️ ' + warnings.join('\n⚠️ ');
  showSuccessModal('Workflow importada!', msg);
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
renderOrders();
