/* initiative-from-policy.js
 * ─────────────────────────────────────────────────────────────────────
 * Único trabalho: quando o gerente aceita a sugestão "criar uma
 * iniciativa para acompanhar" uma política recém-criada (Modo 1, Modo 2
 * ou o chat de políticas em interação livre), monta a iniciativa e suas
 * tarefas de acompanhamento e injeta nos dois datasets globais que as
 * telas já leem ao vivo — sem duplicar um "modelo de iniciativa" novo:
 *
 *   - AIWData.tasks   → o mesmo array que alimenta a "área de
 *     Iniciativas" tanto em #/orders (OpenTasksCard) quanto em
 *     #/initiatives (InitiativesView), via occurrenceQueue(). Basta
 *     empurrar um item no formato de ocorrência (ver TaskCanvasMain em
 *     view-task.jsx) para aparecer nas duas telas, sem nenhum estado
 *     React próprio — as duas views leem AIWData.tasks direto a cada
 *     render.
 *   - AIWData.myTasks → alimenta o Kanban de #/tasks. As tarefas da
 *     iniciativa entram com status "triage", que é a coluna "Em Aberto"
 *     (ver COLUMNS em view-tasks.jsx).
 *
 * Não sabe nada sobre chat, roteiro ou qual tela chamou — só recebe uma
 * Policy já criada (mesmo shape de AIWData.workflowPolicies) e devolve o
 * que foi criado, para quem chamou decidir a mensagem de confirmação.
 *
 * Export: window.InitiativeFromPolicy = { createFromPolicy }
 */

;(function () {
  'use strict';

  var MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  function nowLabel() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(d.getDate()) + ' ' + MONTHS_PT[d.getMonth()] + ' ' + d.getFullYear() + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* Iniciativas entram no mesmo espaço de id das ocorrências (TA-...) —
     initiativeChipId (view-task.jsx) só sabe exibir o chip removendo
     esse prefixo, então uma iniciativa sem ele quebraria o breadcrumb do
     canvas. O sufixo curto evita colisão sem precisar de um contador
     global compartilhado entre módulos. */
  function nextInitiativeId() {
    return 'TA-INI-' + String(Date.now()).slice(-6);
  }

  function createFromPolicy(policy, opts) {
    opts = opts || {};
    var rules = policy.rules || [];
    var taId = nextInitiativeId();
    var chip = taId.replace(/^TA-/, '');

    /* Uma tarefa de acompanhamento por regra da política — o mesmo
       formato `followUp` que TaskCanvasMain já sabe renderizar (ver
       Canvas A em data-aiw.js), então o canvas genérico funciona sem
       nenhum código de exibição novo. */
    var followUp = rules.map(function (r) {
      return { state: 'attention', title: 'Acompanhar regra "' + r.name + '"', assignee: 'Você', initial: 'Y' };
    });

    var occurrenceTask = {
      id: taId,
      status: 'attention',
      priority: 'medium',
      title: 'Acompanhar política: ' + policy.name,
      tag: 'Políticas',
      source: { kind: 'initiative', label: 'Políticas' },
      detail: {
        title: 'Acompanhar política: ' + policy.name,
        summary: policy.objective || null,
        attributedTo: { initial: 'Y', name: 'Você' },
        severity: 'medium',
        reportedBy: { agent: opts.reportedByAgent || 'Order Management Agent', at: nowLabel() },
        diagnosis: opts.diagnosis || (
          'A política "' + policy.name + '" foi criada e ainda não tem histórico de execução. ' +
          'Esta iniciativa acompanha o comportamento das ' + rules.length + ' regra(s) nas primeiras semanas, ' +
          'para confirmar se o resultado observado bate com o esperado antes de considerá-la validada.'
        ),
        followUp: followUp,
        resolved: [],
        impacted: [],
      },
    };

    var myTasksEntries = rules.map(function (r, i) {
      return {
        id: 'TSK-' + chip + '-' + (i + 1),
        title: 'Acompanhar regra "' + r.name + '"',
        status: 'triage',
        source: { kind: 'initiative', label: chip },
        assigneeInitials: 'YO',
        assigneeName: 'You',
      };
    });

    AIWData.tasks.push(occurrenceTask);
    Array.prototype.push.apply(AIWData.myTasks, myTasksEntries);

    return { initiative: occurrenceTask, tasks: myTasksEntries };
  }

  /* Usado pelo chip "Desejo gerar uma iniciativa/tarefas" (agent-behavior.yaml,
     agentActions): mesma checagem de "já existe iniciativa para esta
     política" que a oferta automática pós-criação já fazia, só que
     consultando o dataset global em vez do ref local de um componente —
     precisa funcionar vindo de qualquer tela, não só de onde a política
     nasceu. */
  function hasInitiative(policy) {
    var title = 'Acompanhar política: ' + policy.name;
    return (AIWData.tasks || []).some(function (t) { return t.title === title; });
  }

  function listPoliciesWithoutInitiative(policies) {
    return (policies || []).filter(function (p) { return !hasInitiative(p); });
  }

  window.InitiativeFromPolicy = {
    createFromPolicy: createFromPolicy,
    hasInitiative: hasInitiative,
    listPoliciesWithoutInitiative: listPoliciesWithoutInitiative,
  };
})();
