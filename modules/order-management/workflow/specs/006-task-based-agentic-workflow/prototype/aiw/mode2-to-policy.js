/* mode2-to-policy.js
 * ─────────────────────────────────────────────────────────────────────
 * Único trabalho: transformar o "Exemplo de diálogo" do Modo 2
 * (mode2-anomaly-script.js), já concluído, numa Policy real — no mesmo
 * formato que view-workflow-policies.jsx espera (o mesmo shape de
 * AIWData.workflowPolicies). Não sabe nada sobre chat, modal ou
 * navegação — só monta o objeto quando o gerente decide "Transformar em
 * política permanente".
 *
 * As 4 regras abaixo são exatamente as que o agente propõe no diálogo
 * do documento (não um resumo nem uma reinterpretação):
 *   Regra 1 — Pedido em atenção      (status ≠ Ready for pickup, SLA < 12h)
 *   Regra 2 — Pedido crítico         (status ≠ Ready for pickup, SLA < 8h)
 *   Regra 3 — Limite de recuperação  (custo adicional > R$15 → aprovação)
 *   Regra 4 — Mudança da loja de retirada (loja alternativa ≠ escolhida
 *             pelo cliente → só após consentimento)
 *
 * Export: window.Mode2ToPolicy = { createFromScript }
 */

;(function () {
  'use strict';

  function todayLabel() {
    var d = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  }

  /* Cada roteiro do Modo 2 tem seu próprio mapeamento — hoje só existe
     "shopping-a-after-17h", mas o formato já separa "como construir a
     policy" por scriptId, em vez de assumir que só existe um caso. */
  var BUILDERS = {
    'shopping-a-after-17h': function (today) {
      return {
        id: 'pol-pickup-sla-mode2-' + Date.now(),
        category: 'fulfillment',
        active: true,
        name: 'Pickup SLA Protection',
        objective: 'Manter pelo menos 98% dos pedidos de retirada disponíveis dentro das 48 horas prometidas. Política proposta pelo agente a partir de um padrão detectado na operação (74 pedidos em risco nos últimos 30 dias, 43% concentrados no Shopping A) e aprovada pelo gerente.',
        createdBy: 'Order Management Agent (Modo 2 — detecção proativa, aprovada pelo gerente)',
        createdAt: today,
        updatedAt: today,
        rules: [
          {
            id: 'PICK-101', name: 'Pedido em atenção', active: true,
            trigger: 'Pedido de retirada ainda não pronto e faltando menos de 12h para o SLA.',
            conditions: [
              { natural: 'O status do pickup é diferente de Ready for pickup.', technical: "pickup.status != 'ready_for_pickup'",
                param: { field: 'Status do pickup', operator: 'é diferente de', value: 'Ready for pickup' } },
              { natural: 'Faltam menos de 12 horas para o SLA.', technical: 'pickup.remainingSlaHours < 12',
                param: { field: 'SLA restante', operator: 'é menor que', value: '12', unit: 'horas' } },
            ],
            tasks: [
              { label: 'Verificar status do picking', kind: 'diagnose' },
              { label: 'Avaliar capacidade da loja', kind: 'diagnose' },
              { label: 'Repriorizar o pedido', kind: 'replan' },
              { label: 'Procurar estoque alternativo', kind: 'diagnose' },
            ],
            escalation: [],
          },
          {
            id: 'PICK-102', name: 'Pedido crítico', active: true,
            trigger: 'Pedido de retirada ainda não pronto e faltando menos de 8h para o SLA.',
            conditions: [
              { natural: 'O status do pickup é diferente de Ready for pickup.', technical: "pickup.status != 'ready_for_pickup'",
                param: { field: 'Status do pickup', operator: 'é diferente de', value: 'Ready for pickup' } },
              { natural: 'Faltam menos de 8 horas para o SLA.', technical: 'pickup.remainingSlaHours < 8',
                param: { field: 'SLA restante', operator: 'é menor que', value: '8', unit: 'horas' } },
            ],
            tasks: [
              { label: 'Reservar estoque alternativo', kind: 'reallocate' },
              { label: 'Realocar fulfillment', kind: 'reallocate' },
              { label: 'Criar transferência', kind: 'workflow' },
            ],
            escalation: [],
          },
          {
            id: 'PICK-103', name: 'Limite de recuperação', active: true,
            trigger: 'O custo adicional para recuperar o pedido passou do limite que o gerente aprovou.',
            conditions: [
              { natural: 'O custo adicional é maior que R$15.', technical: 'recovery.incrementalCost > 15',
                param: { field: 'Custo adicional', operator: 'é maior que', value: '15,00', unit: 'R$' } },
            ],
            tasks: [
              { label: 'Pedir aprovação antes de executar', kind: 'escalate' },
            ],
            escalation: [],
          },
          {
            id: 'PICK-104', name: 'Mudança da loja de retirada', active: true,
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
        ],
      };
    },
  };

  function createFromScript(script) {
    var builder = BUILDERS[script.id];
    if (!builder) throw new Error('Mode2ToPolicy: nenhum construtor de política para o roteiro "' + script.id + '"');
    return builder(todayLabel());
  }

  window.Mode2ToPolicy = { createFromScript: createFromScript };
})();
