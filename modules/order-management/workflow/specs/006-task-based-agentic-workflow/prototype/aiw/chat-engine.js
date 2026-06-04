/* chat-engine.js — AIW Prototype: Intelligent Agent Simulation
 * Runs entirely client-side; no LLM required.
 * Export: window.ChatEngine = { create }
 */

;(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────────── */

  // Fixed reference date so SLA calculations are deterministic in the prototype
  var PROTOTYPE_DATE = new Date(2026, 5, 2); // 2026-06-02

  var SLA_MAP = { '6h': 6, '8h': 8, '12h': 12, '24h': 24, '48h': 48 };

  var EXPERIENCE_MODELS = [
    { label: 'Entrega em domicílio', icon: '🚚', desc: 'Fulfillment com despacho e rastreamento de entrega' },
    { label: 'Retirada na loja',     icon: '🏪', desc: 'Cliente retira em ponto físico após separação'     },
    { label: 'Entrega digital',      icon: '💻', desc: 'Produtos digitais — licenças, downloads, ativação' },
    { label: 'Do zero',              icon: '✨', desc: 'Experiência em branco para configurar livremente'  }
  ];

  /* ─── Intent detection ──────────────────────────────────────── */

  var INTENT_PATTERNS = [
    { intent: 'experience.create',
      re: /criar.*(experiên|experiencia)|nova experiên|experiência.*digital|entrega.*virtual|nova.*experiência/i },
    { intent: 'config.rule.add',
      re: /\bregra\b|considere\s|quando.*pedido.*(?:atraso|sla|despacho)|adicione?.*regra|escalar.*automaticamente|sla.*1 dia|sem despacho/i },
    { intent: 'query.orders.sla_risk',
      re: /risco.*(sla|atraso)|atraso.*(sla|prazo)|(sla|prazo).*(risco|atraso|vencer)|vão atrasar|vai atrasar|pedidos.*atrasad|em risco.*sla|todos os pedidos/i },
    { intent: 'query.orders.blocked',
      re: /travad|bloqueado|parado|sem movimentação/i },
    { intent: 'query.orders.by_origin',
      re: /\bamazon\b|por canal|por origem/i },
    { intent: 'general.help',
      re: /o que você (pode|sabe|faz)|como (usar|funciona)|capacidades?\b|ajuda\b|help\b/i }
  ];

  function detectIntent(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < INTENT_PATTERNS.length; i++) {
      if (INTENT_PATTERNS[i].re.test(lower)) return INTENT_PATTERNS[i].intent;
    }
    return 'general.unknown';
  }

  /* ─── SLA risk ──────────────────────────────────────────────── */

  function isAtSlaRisk(order) {
    if (!order.eta || order.eta === '—' || !order.sla || order.sla === '—') return false;
    if (['processing', 'pending'].indexOf(order.status) === -1) return false;
    var parts = order.eta.split('/').map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return false;
    var eta = new Date(parts[2], parts[1] - 1, parts[0]);
    var hoursLeft = (eta - PROTOTYPE_DATE) / 3600000;
    var slaHours = SLA_MAP[order.sla] || Infinity;
    return hoursLeft < slaHours * 0.3 || hoursLeft <= 24;
  }

  /* ─── Rule extraction ───────────────────────────────────────── */

  function extractRule(text) {
    var lower = text.toLowerCase();
    var needsApproval = /cancelar.*automaticamente|cancelamento automático/.test(lower);
    var action = /cancelar/.test(lower)      ? 'Cancelamento automático'
      : /escalar/.test(lower)                ? 'Escalar para operador'
      : /slack|notifica/.test(lower)         ? 'Notificar via Slack'
      :                                        'Criar task para operador';
    var scope = /escalar|sla|atraso|prazo|despacho/.test(lower) ? 'escalation' : 'orchestration';
    var condition = text.length > 110 ? text.slice(0, 107) + '…' : text;
    return { action: action, scope: scope, needsApproval: needsApproval, condition: condition };
  }

  function generateRuleTitle(text) {
    var lower = text.toLowerCase();
    if (/amazon/.test(lower))        return 'Pedido Amazon com SLA crítico';
    if (/marketplace/.test(lower))   return 'Pedido Marketplace sem despacho';
    if (/1 dia|amanhã/.test(lower))  return 'SLA a 1 dia sem despacho';
    if (/despacho/.test(lower))      return 'Pedido não despachado no prazo';
    return 'Nova regra personalizada';
  }

  /* ─── Factory ──────────────────────────────────────────────── */

  function create(options) {
    var context          = options.context;
    var data             = options.data;
    var contextOrderId   = options.orderId;
    var contextTask      = options.task;       // full task object for context:"task"
    var onNavigate       = options.onNavigate;
    var onApplyRule      = options.onApplyRule;
    var onCreateExperience = options.onCreateExperience;
    var onAddFollowUp    = options.onAddFollowUp; // callback for new task in task context
    var onAgentSay       = options.onAgentSay;
    var onTyping         = options.onTyping;
    var onAddChip        = options.onAddChip;   // callback(chip) to add dynamic action chip

    var experienceDraft  = null;
    var newTaskDraft     = null; // state machine for "Create new task" in task context
    var lastFreeAction   = null; // last free-typed action text (for "Criar botão de ação")

    /* Simulate async agent response.
       If addMeta === true, appends a "save this action?" prompt at the end. */
    function agentSay(msgs, delay, addMeta) {
      var d = (delay != null ? delay : 850) + Math.random() * 180;
      if (onTyping) onTyping(true);
      setTimeout(function () {
        if (onTyping) onTyping(false);
        var arr = Array.isArray(msgs) ? msgs : [msgs];
        if (addMeta) {
          arr = arr.concat([{
            from: 'agent',
            text: 'Deseja salvar esta ação para uso rápido?',
            quickReplies: ['Executar sempre que entrar no pedido', 'Criar botão de ação no chat']
          }]);
        }
        if (onAgentSay) onAgentSay(arr);
      }, d);
    }

    /* ── Order queries ── */
    function respondOrderQuery(intent, text) {
      var orders = (data && data.orders) || [];
      var filtered = [];
      var label = '';

      if (intent === 'query.orders.sla_risk') {
        filtered = orders.filter(isAtSlaRisk);
        if (filtered.length === 0) {
          agentSay({ from: 'agent', text: 'Ótima notícia — nenhum pedido está com risco de atraso de SLA no momento. ✅' });
          return;
        }
        agentSay([
          { from: 'agent', text: 'Encontrei ' + filtered.length + ' pedido(s) com risco de atraso de SLA:' },
          { from: 'agent', type: 'order-list', orders: filtered,
            onOpenOrder: function (id) { if (onNavigate) onNavigate({ name: 'order-detail', orderId: id }); } }
        ]);

      } else if (intent === 'query.orders.blocked') {
        filtered = orders.filter(function (o) {
          return o.status === 'pending' || (o.status === 'processing' && isAtSlaRisk(o));
        });
        if (filtered.length === 0) {
          agentSay({ from: 'agent', text: 'Nenhum pedido travado ou bloqueado no momento. 👌' });
          return;
        }
        agentSay([
          { from: 'agent', text: 'Encontrei ' + filtered.length + ' pedido(s) bloqueado(s) ou em risco:' },
          { from: 'agent', type: 'order-list', orders: filtered,
            onOpenOrder: function (id) { if (onNavigate) onNavigate({ name: 'order-detail', orderId: id }); } }
        ]);

      } else if (intent === 'query.orders.by_origin') {
        var kw = /amazon/i.test(text) ? 'amazon'
          : /marketplace/i.test(text) ? 'marketplace'
          : '';
        if (!kw) {
          agentSay({ from: 'agent', text: 'Qual canal você quer filtrar? Ex: "pedidos do Marketplace".' });
          return;
        }
        filtered = orders.filter(function (o) {
          return (o.origin || '').toLowerCase().indexOf(kw) !== -1
              || (o.seller || '').toLowerCase().indexOf(kw) !== -1;
        });
        label = kw === 'amazon' ? 'Amazon' : 'Marketplace';
        if (filtered.length === 0) {
          agentSay({ from: 'agent', text: 'Nenhum pedido encontrado para o canal "' + label + '".' });
          return;
        }
        agentSay([
          { from: 'agent', text: filtered.length + ' pedido(s) do canal "' + label + '":' },
          { from: 'agent', type: 'order-list', orders: filtered,
            onOpenOrder: function (id) { if (onNavigate) onNavigate({ name: 'order-detail', orderId: id }); } }
        ]);
      }
    }

    /* ── Rule adjustment ── */
    function respondRuleAdd(text) {
      var info  = extractRule(text);
      var title = generateRuleTitle(text);

      if (info.needsApproval) {
        agentSay([
          { from: 'agent', text: 'Entendi. Porém "' + info.action + '" requer aprovação do supervisor responsável — não posso aplicar autonomamente.' },
          { from: 'agent', text: 'Quer que eu crie uma solicitação de ajuste para ele?',
            quickReplies: ['Sim, criar solicitação', 'Não, obrigado'] }
        ]);
        return;
      }

      var rule = {
        id: 'rule-' + Date.now(),
        title: title,
        condition: info.condition,
        action: info.action,
        scope: info.scope,
        addedAt: new Date().toISOString(),
        addedBy: 'agent'
      };

      var scopeLabel = info.scope === 'escalation' ? 'Escalação' : 'Orquestração';
      var bodyText = 'SE: ' + (info.condition.length > 72 ? info.condition.slice(0, 69) + '…' : info.condition)
                  + '\nENTÃO: ' + info.action;

      agentSay([
        { from: 'agent', text: 'Elaborei uma nova regra para o Agente de ' + scopeLabel + '. Confirme para aplicar:' },
        {
          from: 'agent',
          type: 'action',
          title: title,
          body: bodyText,
          onApply: function () { if (onApplyRule) onApplyRule(rule); }
        }
      ]);
    }

    /* ── Experience creation — 6-step state machine ── */
    function startExperienceDraft(text) {
      var nameMatch = text.match(/experiência\s+(?:para\s+|de\s+)?["']?([^"'\.]{3,})/i);
      var preName = nameMatch ? nameMatch[1].trim() : '';
      // Discard matches that are just trigger words
      if (/^(nova|um|uma|criar|quero|para|de|um|a)$/i.test(preName)) preName = '';

      if (preName) {
        experienceDraft = { step: 'model', name: preName, model: '', icon: '', description: '' };
        agentSay([
          { from: 'agent', text: 'Ótimo! Vou ajudar a criar a experiência "' + preName + '".' },
          {
            from: 'agent',
            text: 'Qual modelo base você quer usar?',
            quickReplies: EXPERIENCE_MODELS.map(function (m) { return { label: m.icon + ' ' + m.label, desc: m.desc }; })
          }
        ]);
      } else {
        experienceDraft = { step: 'name', name: '', model: '', icon: '', description: '' };
        agentSay({ from: 'agent', text: 'Vamos criar uma nova Experiência! Como ela vai se chamar?' });
      }
    }

    function handleExperienceDraftStep(text, lower) {
      if (!experienceDraft) return false;

      if (/cancelar|sair|desistir/.test(lower)) {
        experienceDraft = null;
        agentSay({ from: 'agent', text: 'Criação cancelada. 👍 Diga "criar experiência" quando quiser tentar novamente.' });
        return true;
      }

      var step = experienceDraft.step;

      if (step === 'name') {
        experienceDraft.name = text.trim();
        experienceDraft.step = 'model';
        agentSay({
          from: 'agent',
          text: 'Perfeito! Qual modelo base para "' + experienceDraft.name + '"?',
          quickReplies: EXPERIENCE_MODELS.map(function (m) { return { label: m.icon + ' ' + m.label, desc: m.desc }; })
        });
        return true;
      }

      if (step === 'model') {
        var found = null;
        for (var i = 0; i < EXPERIENCE_MODELS.length; i++) {
          var m = EXPERIENCE_MODELS[i];
          if (lower.indexOf(m.label.toLowerCase()) !== -1 || lower.indexOf(m.icon) !== -1
              || (m.label === 'Entrega em domicílio' && /domicílio|domicilio|home/.test(lower))
              || (m.label === 'Retirada na loja' && /retirada|pickup/.test(lower))
              || (m.label === 'Entrega digital' && /digital|virtual/.test(lower))
              || (m.label === 'Do zero' && /zero|branco|blank/.test(lower))) {
            found = m; break;
          }
        }
        if (!found) found = EXPERIENCE_MODELS[0];
        experienceDraft.model = found.label;
        experienceDraft.icon  = found.icon;
        experienceDraft.step  = 'icon';
        agentSay({
          from: 'agent',
          text: 'Modelo "' + found.label + '" selecionado. Escolha um ícone:',
          quickReplies: ['🚚', '🏪', '💻', '📦', '🎁', '🛍️']
        });
        return true;
      }

      if (step === 'icon') {
        // Extract first emoji from text if present
        var iconMatch = text.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/u);
        if (iconMatch) experienceDraft.icon = iconMatch[0];
        experienceDraft.step = 'description';
        agentSay({ from: 'agent', text: 'Ícone definido! Adicione uma descrição curta (ou diga "pular"):' });
        return true;
      }

      if (step === 'description') {
        experienceDraft.description = /pular|skip/.test(lower) ? '' : text.trim();
        experienceDraft.step = 'preview';
        agentSay({ from: 'agent', text: 'Perfeito! Vamos revisar o resumo da experiência antes de criar.' });
        return true;
      }

      if (step === 'preview') {
        experienceDraft.step = 'confirm';
        var snapshot = {
          name: experienceDraft.name,
          model: experienceDraft.model,
          icon: experienceDraft.icon,
          description: experienceDraft.description
        };
        // Two-message response: summary text + wf-draft card
        if (onTyping) onTyping(true);
        setTimeout(function () {
          if (onTyping) onTyping(false);
          if (onAgentSay) onAgentSay([
            { from: 'agent', text: 'Resumo da nova Experiência:' },
            {
              from: 'agent',
              type: 'wf-draft',
              draft: {
                name: snapshot.icon + ' ' + snapshot.name,
                category: snapshot.model,
                trigger: 'auto',
                aiOrch: true
              },
              onConfirm: function () {
                if (onAgentSay) onAgentSay([{
                  from: 'agent',
                  text: 'Experiência "' + snapshot.name + '" criada com sucesso! Acesse o Workflow Board para configurar as etapas e tarefas do workflow. ✨'
                }]);
                if (onCreateExperience) onCreateExperience(snapshot);
                experienceDraft = null;
              }
            }
          ]);
        }, 900);
        return true;
      }

      return false;
    }

    /* ── Help ── */
    function respondHelp(isOrchestration) {
      var helpText = isOrchestration
        ? 'Posso ajudar com:\n\n⚙️ Regras — descreva uma condição em linguagem natural, ex: "quando pedido Marketplace não for despachado em 24h, escalar"\n📋 Pedidos — "mostre pedidos com risco de SLA"\n✨ Experiências — "criar nova experiência"\n\nQual ajuste deseja fazer?'
        : 'Posso ajudar com:\n\n📋 Pedidos — "mostre pedidos com risco de SLA", "pedidos bloqueados"\n⚙️ Regras — "adicione uma regra para pedidos sem despacho em 24h"\n✨ Experiências — "quero criar uma experiência para Entrega Digital"\n\nO que você precisa?';
      agentSay({ from: 'agent', text: helpText });
    }

    /* ── Context handlers ── */

    function handleAssistantMessage(text) {
      var lower = text.toLowerCase();
      if (handleExperienceDraftStep(text, lower)) return;
      var intent = detectIntent(text);
      if (intent.indexOf('query.orders') === 0) { respondOrderQuery(intent, text); return; }
      if (intent === 'experience.create')        { startExperienceDraft(text); return; }
      if (intent === 'config.rule.add')          { respondRuleAdd(text); return; }
      if (intent === 'general.help')             { respondHelp(false); return; }
      agentSay({
        from: 'agent',
        text: 'Não entendi exatamente. Posso buscar pedidos, ajustar regras ou criar experiências.',
        quickReplies: ['Ver capacidades', 'Pedidos com risco de SLA', 'Criar experiência']
      });
    }

    function handleOrchestrationMessage(text) {
      var lower = text.toLowerCase();
      if (handleExperienceDraftStep(text, lower)) return;
      var intent = detectIntent(text);
      if (intent === 'config.rule.add')          { respondRuleAdd(text); return; }
      if (intent.indexOf('query.orders') === 0)  { respondOrderQuery(intent, text); return; }
      if (intent === 'experience.create')        { startExperienceDraft(text); return; }
      if (intent === 'general.help')             { respondHelp(true); return; }
      agentSay({
        from: 'agent',
        text: 'Posso ajustar regras ou consultar pedidos. Tente: "quando um pedido Marketplace não for despachado em 24h, escalar para operador".',
        quickReplies: ['Adicionar regra de escalação', 'Pedidos com risco de SLA']
      });
    }

    function handleOrderDetailMessage(text, opts) {
      var isFromButton = !!(opts && (opts.fromChip || opts.fromReply));
      var lower = text.toLowerCase();
      var orders = (data && data.orders) || [];
      var currentOrder = contextOrderId
        ? orders.filter(function (o) { return o.id === contextOrderId; })[0]
        : null;
      var orderId = currentOrder ? currentOrder.short || currentOrder.id : contextOrderId;

      /* ── Meta-option responses ── */
      if (/executar sempre que entrar no pedido/i.test(lower)) {
        agentSay({ from: 'agent', text: '✅ Feito. Esta ação será executada automaticamente sempre que você entrar neste pedido.' });
        return;
      }

      if (/criar botão de ação no chat/i.test(lower)) {
        if (lastFreeAction && onAddChip) {
          onAddChip({ icon: 'play', label: lastFreeAction });
        }
        agentSay({ from: 'agent', text: lastFreeAction
          ? '✅ Botão "' + lastFreeAction + '" adicionado ao chat. Ele ficará disponível para uso rápido.'
          : '✅ Botão de ação adicionado ao chat.' });
        lastFreeAction = null;
        return;
      }

      /* Track the free action label for meta-options */
      if (!isFromButton) {
        lastFreeAction = text.length > 38 ? text.slice(0, 35) + '…' : text;
      }

      /* ── Alterar item ── */
      if (/alterar.*item|modificar.*item|change.*item|trocar.*item/i.test(lower)) {
        agentSay([
          { from: 'agent', text: 'Para alterar um item, preciso identificar qual item e o tipo de alteração (quantidade, endereço ou substituição de produto).' },
          { from: 'agent', text: '⚠️ Alterações de item exigem confirmação do seller e podem impactar o SLA. Deseja prosseguir?',
            quickReplies: ['Sim, prosseguir', 'Cancelar'] }
        ], undefined, !isFromButton);
        return;
      }

      /* ── Cancelar pedido ── */
      if (/cancelar.*pedido|cancelamento.*pedido|quero cancelar|cancel.*order/i.test(lower)) {
        agentSay([
          { from: 'agent', text: '⚠️ O cancelamento do pedido ' + orderId + ' é uma ação irreversível e requer autorização.' },
          { from: 'agent', text: 'Posso escalar esta solicitação para um Supervisor para análise e aprovação.',
            quickReplies: ['Escalar para Supervisor', 'Não, manter pedido'] }
        ], undefined, !isFromButton);
        return;
      }

      /* ── Escalar para Supervisor ── */
      if (/supervisor|escalar/i.test(lower)) {
        agentSay([
          { from: 'agent', text: 'Vou encaminhar a solicitação para um Supervisor. Confirme para criar a task de escalação:' },
          {
            from: 'agent',
            type: 'action',
            title: 'Escalar pedido ' + orderId + ' para Supervisor',
            body: 'Pedido: ' + (currentOrder ? currentOrder.id : contextOrderId) + '\nStatus: ' + (currentOrder ? currentOrder.statusLabel : '—') + '\nSolicitação aguardando análise supervisória.',
            onApply: function () {
              if (onAgentSay) onAgentSay([{
                from: 'agent',
                text: '✅ Solicitação escalada com sucesso. Um Supervisor irá analisar e retornar em breve.'
              }]);
            }
          }
        ], undefined, !isFromButton);
        return;
      }

      /* ── SLA ── */
      if (/sla|prazo|tempo restante|verificar sla/i.test(lower)) {
        if (!currentOrder || currentOrder.eta === '—') {
          agentSay({ from: 'agent', text: 'Sem ETA definido para este pedido.' }, undefined, !isFromButton);
        } else {
          var p = currentOrder.eta.split('/').map(Number);
          var etaDate = new Date(p[2], p[1] - 1, p[0]);
          var hoursLeft = Math.round((etaDate - PROTOTYPE_DATE) / 3600000);
          var risk = isAtSlaRisk(currentOrder);
          agentSay({ from: 'agent',
            text: (risk ? '⚠️ ' : '✅ ') + 'SLA: ' + currentOrder.sla + ' · Tempo restante: ' + (hoursLeft > 0 ? hoursLeft + 'h' : 'VENCIDO') + ' · ETA: ' + currentOrder.eta,
            quickReplies: risk ? ['Escalar para Supervisor', 'Alterar item do pedido'] : ['Alterar item do pedido', 'Cancelar o pedido']
          }, undefined, !isFromButton);
        }
        return;
      }

      /* ── Histórico ── */
      if (/histórico|history|auditoria/i.test(lower)) {
        agentSay({ from: 'agent', text: 'Histórico do pedido ' + orderId + ':\n\n• Pedido criado e pagamento confirmado\n• Separação iniciada\n• Status atual: ' + (currentOrder ? currentOrder.statusLabel : 'Em processamento') }, undefined, !isFromButton);
        return;
      }

      /* ── Fallback: ação não mapeada ── */
      agentSay({
        from: 'agent',
        text: 'Não identifiquei uma ação mapeada para este pedido. Tente descrever o que precisa fazer ou escolha uma das opções abaixo.',
        quickReplies: ['Alterar item do pedido', 'Cancelar o pedido', 'Verificar SLA restante']
      }, undefined, !isFromButton);
    }

    /* ── Task context ─────────────────────────────────────────── */

    function handleNewTaskDraftStep(text, lower) {
      if (!newTaskDraft) return false;
      if (/cancelar|sair|desistir/.test(lower)) {
        newTaskDraft = null;
        agentSay({ from: 'agent', text: 'Criação de tarefa cancelada. Diga "criar tarefa" quando quiser tentar novamente.' });
        return true;
      }
      if (newTaskDraft.step === 'title') {
        newTaskDraft.title = text.trim();
        newTaskDraft.step = 'assignee';
        // Collect existing assignees from followUp for quick replies
        var d = contextTask && contextTask.detail;
        var assignees = [];
        if (d && d.followUp) {
          d.followUp.forEach(function (t) {
            if (t.assignee && t.assignee !== 'OMS Agent' && assignees.indexOf(t.assignee) === -1) {
              assignees.push(t.assignee);
            }
          });
        }
        if (d && d.attributedTo && assignees.indexOf(d.attributedTo.name) === -1) {
          assignees.push(d.attributedTo.name);
        }
        if (assignees.length === 0) assignees = ['Guilherme Vecchi', 'Maria Santos'];
        agentSay({
          from: 'agent',
          text: 'Quem vai ser o responsável pela tarefa "' + newTaskDraft.title + '"?',
          quickReplies: assignees.concat(['Atribuir depois'])
        });
        return true;
      }
      if (newTaskDraft.step === 'assignee') {
        newTaskDraft.assignee = /atribuir depois|depois|skip/i.test(text) ? '—' : text.trim();
        var snap = { title: newTaskDraft.title, assignee: newTaskDraft.assignee };
        newTaskDraft = null;
        agentSay([
          { from: 'agent', text: 'Pronto! Confirme para adicionar à lista de follow-ups da iniciativa:' },
          {
            from: 'agent',
            type: 'action',
            title: snap.title,
            body: 'Responsável: ' + snap.assignee + '\nEstado: Pendente',
            onApply: function () {
              if (onAddFollowUp) onAddFollowUp({ state: 'attention', title: snap.title, assignee: snap.assignee });
              if (onAgentSay) onAgentSay([{ from: 'agent', text: 'Tarefa "' + snap.title + '" adicionada aos follow-ups. ✅' }]);
            }
          }
        ]);
        return true;
      }
      return false;
    }

    function handleTaskMessage(text) {
      var lower = text.toLowerCase();
      var d = contextTask && contextTask.detail;

      // New task draft step
      if (handleNewTaskDraftStep(text, lower)) return;

      // Summarize the initiative
      if (/summarize|sumariz|resumo|iniciativa|summary/i.test(lower)) {
        if (!d) { agentSay({ from: 'agent', text: 'Nenhuma iniciativa carregada.' }); return; }
        var impactCount = d.impacted ? d.impacted.length : 0;
        var pendingCount = d.followUp ? d.followUp.length : 0;
        var resolvedCount = d.resolved ? d.resolved.length : 0;
        agentSay([
          {
            from: 'agent',
            text: '📋 ' + d.title + '\n\nReportada por: ' + d.reportedBy.agent + ' · ' + d.reportedBy.at
          },
          {
            from: 'agent',
            text: d.summary + (d.diagnosis ? '\n\n🔍 Diagnóstico: ' + d.diagnosis : '')
          },
          {
            from: 'agent',
            text: '📊 ' + impactCount + ' pedido(s) impactado(s) · ' + pendingCount + ' tarefa(s) pendente(s) · ' + resolvedCount + ' concluída(s)',
            quickReplies: ['Analize impacted orders and sugest actions', 'Suggest next steps']
          }
        ]);
        return;
      }

      // Suggest next steps
      if (/suggest next|próximas etapas|próximos passos|next steps|sugerir|suggest/i.test(lower)) {
        if (!d) { agentSay({ from: 'agent', text: 'Nenhuma iniciativa carregada.' }); return; }
        var msgs = [];
        var stateLabel = { attention: '⚠️ Atenção necessária', loading: '⏳ Em progresso', done: '✅ Concluído' };

        // Pending tasks
        if (d.followUp && d.followUp.length > 0) {
          var pendingText = 'Tarefas pendentes desta iniciativa:\n\n';
          d.followUp.forEach(function (t) {
            pendingText += (stateLabel[t.state] || '•') + ' ' + t.title + ' → ' + t.assignee + '\n';
          });
          msgs.push({ from: 'agent', text: pendingText.trim() });
        }

        // Recommend priority action
        var attentionTask = d.followUp && d.followUp.filter(function (t) { return t.state === 'attention'; })[0];
        if (attentionTask) {
          msgs.push({
            from: 'agent',
            text: '🎯 Próximo passo prioritário: "' + attentionTask.title + '" está aguardando ação de ' + attentionTask.assignee + '. Deseja criar uma task de acompanhamento?',
            quickReplies: ['+ create new task', 'Analize impacted orders and sugest actions']
          });
        } else if (d.impacted && d.impacted.length > 0) {
          msgs.push({
            from: 'agent',
            text: 'Todas as tarefas estão em progresso. Recomendo verificar o status dos ' + d.impacted.length + ' pedidos impactados.',
            quickReplies: ['Analize impacted orders and sugest actions']
          });
        }

        agentSay(msgs);
        return;
      }

      // Create new task
      if (/create new task|criar.*tarefa|nova tarefa|\+ create/i.test(lower)) {
        newTaskDraft = { step: 'title', title: '', assignee: '' };
        agentSay({ from: 'agent', text: 'Vamos criar uma nova tarefa de acompanhamento. Qual é o título?' });
        return;
      }

      // Analyze impacted orders
      if (/anali[sz]e?|impacted|impacto|pedidos.*impactado|orders and sug/i.test(lower)) {
        if (!d || !d.impacted || d.impacted.length === 0) {
          agentSay({ from: 'agent', text: 'Nenhum pedido impactado registrado nesta iniciativa.' });
          return;
        }
        var orderMsgs = [
          { from: 'agent', text: d.impacted.length + ' pedido(s) impactado(s) nesta iniciativa:' }
        ];

        // Build order-list message from impacted
        var impactedOrders = d.impacted.map(function (imp) {
          // Extract raw ID from "1631888948228-01 (68948228)" format
          var rawId = imp.id.split(' (')[0];
          var short = imp.id.match(/\(([^)]+)\)/) ? imp.id.match(/\(([^)]+)\)/)[1] : rawId.slice(-8);
          return {
            id: rawId,
            short: short,
            customer: imp.seller,
            sla: imp.sla,
            eta: imp.eta,
            status: 'processing',
            statusLabel: 'Impactado'
          };
        });

        orderMsgs.push({
          from: 'agent',
          type: 'order-list',
          orders: impactedOrders,
          onOpenOrder: function (id) { if (onNavigate) onNavigate({ name: 'order-detail', orderId: id }); }
        });

        // Suggest action based on task tag/diagnosis
        var urgentOrders = d.impacted.filter(function (imp) {
          var slaH = parseInt(imp.sla) || 99;
          return slaH <= 6;
        });
        if (urgentOrders.length > 0) {
          orderMsgs.push({
            from: 'agent',
            text: '⚠️ ' + urgentOrders.length + ' pedido(s) com SLA ≤ 6h requerem ação imediata. Recomendo reatribuição para CD alternativo ou contato direto com o seller.',
            quickReplies: ['+ create new task', 'Suggest next steps']
          });
        } else {
          orderMsgs.push({
            from: 'agent',
            text: 'Os pedidos estão dentro de uma janela de SLA gerenciável. Acompanhe os follow-ups para garantir resolução antes do prazo.',
            quickReplies: ['Suggest next steps']
          });
        }

        agentSay(orderMsgs);
        return;
      }

      // General help for task context
      if (/ajuda|help|capacidade/i.test(lower)) {
        agentSay({
          from: 'agent',
          text: 'Posso ajudar com esta iniciativa:\n\n📋 Summarize the initiative\n🎯 Suggest next steps\n📦 Analize impacted orders and sugest actions\n➕ + create new task\n\nSó clicar nos chips ou digitar sua pergunta.',
        });
        return;
      }

      // Fallback
      agentSay({
        from: 'agent',
        text: 'Posso resumir a iniciativa, sugerir próximos passos, analisar pedidos impactados ou criar uma nova tarefa.',
        quickReplies: ['Summarize the initiative', 'Suggest next steps', 'Analize impacted orders and sugest actions']
      });
    }

    /* ── Public API ── */
    return {
      send: function (userText, opts) {
        if (!userText || !userText.trim()) return;
        if (context === 'assistant')          handleAssistantMessage(userText);
        else if (context === 'orchestration') handleOrchestrationMessage(userText);
        else if (context === 'order-detail')  handleOrderDetailMessage(userText, opts);
        else if (context === 'task')          handleTaskMessage(userText);
      },
      reset: function () {
        experienceDraft = null;
        newTaskDraft    = null;
      }
    };
  }

  window.ChatEngine = { create: create };

})();
