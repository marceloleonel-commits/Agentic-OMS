/* mode1-to-policy.js
 * ─────────────────────────────────────────────────────────────────────
 * Único trabalho: transformar o roteiro do Modo 1 (mode1-dialogue-
 * script.js), já concluído, numa Policy real — no mesmo formato que
 * view-workflow-policies.jsx espera (o mesmo shape de
 * AIWData.workflowPolicies). Não sabe nada sobre chat, rota ou
 * navegação — só monta o objeto quando o gerente clica em "Criar
 * política" no turno final do roteiro.
 *
 * As 4 regras abaixo são exatamente as que a própria conversa do
 * documento acorda (turno "Pickup SLA Protection — Draft" + a quarta
 * regra de loja congestionada, acordada depois):
 *   Regra 1 — Pedido em atenção       (pedido não pronto, SLA < 12h)
 *   Regra 2 — Pedido crítico          (pedido não pronto, SLA < 8h,
 *                                      custo adicional até R$15)
 *   Regra 3 — Mudança da loja de retirada (loja alternativa ≠ escolhida
 *             pelo cliente → só após consentimento)
 *   Regra 4 — Loja congestionada      (backlog > 20 pedidos → reduz
 *             prioridade, nunca bloqueia por completo)
 *
 * Export: window.Mode1ToPolicy = { createFromScript }
 */

;(function () {
  'use strict';

  function todayLabel() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  var BUILDERS = {
    'pickup-sla-protection': function (today) {
      return {
        id: 'pol-pickup-sla-mode1-' + Date.now(),
        category: 'fulfillment',
        active: true,
        name: 'Pickup SLA Protection',
        objective: 'Manter pelo menos 98% dos pedidos de retirada disponíveis dentro da promessa de 48 horas, tentando recuperar automaticamente pedidos em risco antes de envolver o gerente. Política criada pelo gerente em conversa com o agente (Modo 1).',
        createdBy: 'Gerente de E-commerce (via Assistente de políticas)',
        createdAt: today,
        updatedAt: today,
        rules: [
          {
            id: 'PICK-201', name: 'Pedido em atenção', active: true,
            trigger: 'Pedido de retirada ainda não pronto e faltando menos de 12h para o SLA.',
            conditions: [
              { natural: 'O pedido ainda não está disponível para retirada.', technical: "pickup.status != 'ready_for_pickup'",
                param: { field: 'Status do pickup', operator: 'é diferente de', value: 'Ready for pickup' } },
              { natural: 'Faltam menos de 12 horas para o SLA.', technical: 'pickup.remainingSlaHours < 12',
                param: { field: 'SLA restante', operator: 'é menor que', value: '12', unit: 'horas' } },
            ],
            tasks: [
              { label: 'Verificar picking', kind: 'diagnose' },
              { label: 'Verificar backlog da loja', kind: 'diagnose' },
              { label: 'Repriorizar a separação', kind: 'replan' },
              { label: 'Procurar estoque alternativo', kind: 'diagnose' },
            ],
            escalation: [],
          },
          {
            id: 'PICK-202', name: 'Pedido crítico', active: true,
            trigger: 'Pedido de retirada ainda não pronto e faltando menos de 8h para o SLA.',
            conditions: [
              { natural: 'O pedido ainda não está disponível para retirada.', technical: "pickup.status != 'ready_for_pickup'",
                param: { field: 'Status do pickup', operator: 'é diferente de', value: 'Ready for pickup' } },
              { natural: 'Faltam menos de 8 horas para o SLA.', technical: 'pickup.remainingSlaHours < 8',
                param: { field: 'SLA restante', operator: 'é menor que', value: '8', unit: 'horas' } },
            ],
            tasks: [
              { label: 'Reservar estoque alternativo', kind: 'reallocate' },
              { label: 'Realocar fulfillment', kind: 'reallocate' },
              { label: 'Criar transferência', kind: 'workflow' },
            ],
            escalation: [
              { field: 'Custo adicional', operator: 'é maior que', value: '15,00', unit: 'R$' },
            ],
          },
          {
            id: 'PICK-203', name: 'Mudança da loja de retirada', active: true,
            trigger: 'A melhor alternativa encontrada exige mudar a loja de retirada escolhida pelo cliente.',
            conditions: [
              { natural: 'A loja alternativa é diferente da loja escolhida pelo cliente.', technical: 'pickup.alternativeStore != pickup.customerChosenStore',
                param: { field: 'Loja alternativa', operator: 'é diferente de', value: 'Loja escolhida pelo cliente' } },
            ],
            tasks: [
              { label: 'Preparar loja alternativa', kind: 'diagnose' },
            ],
            escalation: [
              { field: 'Consentimento do cliente', operator: 'é igual a', value: 'Não obtido' },
            ],
          },
          {
            id: 'PICK-204', name: 'Loja congestionada', active: true,
            trigger: 'O Shopping A ultrapassou 20 pedidos aguardando separação e existe outro nó elegível capaz de atender dentro do SLA.',
            conditions: [
              { natural: 'O backlog de picking pendente é maior que 20 pedidos.', technical: 'pickup.store.pendingPicking > 20',
                param: { field: 'Picking pendente', operator: 'é maior que', value: '20', unit: 'pedidos' } },
              { natural: 'Existe outro nó elegível capaz de atender o pedido dentro do SLA.', technical: 'fulfillment.eligibleAlternativeNode == true',
                param: { field: 'Alternativa elegível', operator: 'é igual a', value: 'Disponível' } },
            ],
            tasks: [
              { label: 'Reduzir prioridade da loja para novas alocações', kind: 'replan' },
              { label: 'Comparar alternativas disponíveis', kind: 'diagnose' },
            ],
            escalation: [],
          },
        ],
      };
    },
  };

  function createFromScript(script) {
    var builder = BUILDERS[script.id];
    if (!builder) throw new Error('Mode1ToPolicy: nenhum construtor de política para o roteiro "' + script.id + '"');
    return builder(todayLabel());
  }

  window.Mode1ToPolicy = { createFromScript: createFromScript };
})();
