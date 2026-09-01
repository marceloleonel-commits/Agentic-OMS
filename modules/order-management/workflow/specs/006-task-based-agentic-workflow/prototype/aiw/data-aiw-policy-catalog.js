/* ══════════════════════════════════════════════════════════════════════
   data-aiw-policy-catalog.js
   ──────────────────────────────────────────────────────────────────────
   Onde isso entra: dentro de data-aiw.js, na mesma seção de
   `policyActionKinds` / `policyCategories` / `workflowPolicies`.
   Adicione EVENT_CATALOG e CONDITION_TRANSLATIONS como constantes do
   mesmo módulo (window.AIWData), e exporte ambas no `return {...}` final
   junto com as demais.

   Este arquivo cobre DUAS coisas:
   1. EVENT_CATALOG — os 10 eventos elegíveis para o agente (fonte:
      planilha "Eventos Elegíveis para Agente"), com os parâmetros que
      askRuleParameters() precisa pros 6 que ainda não têm regra.
   2. CONDITION_TRANSLATIONS — dicionário técnico → natural para as 47
      condições únicas já existentes nas 26 regras de workflowPolicies.
      Ver instrução de migração no rodapé deste arquivo.
   ══════════════════════════════════════════════════════════════════════ */

/* ── 1. Catálogo de eventos ──────────────────────────────────────────── */
const EVENT_CATALOG = [
  {
    id: "details_viewed_pending_alert_sla",
    label: "Risco ou violação de SLA",
    existingRuleIds: ["MON-005", "LOG-003", "MON-003"],
  },
  {
    id: "details_viewed_pending_alert_stock",
    label: "Ruptura / inconsistência de estoque",
    existingRuleIds: ["LOG-005"],
  },
  {
    id: "details_viewed_pending_alert_avl_down",
    label: "Sistema de disponibilidade indisponível",
    needsNewRule: true,
    proposedPolicy: "Disponibilidade & Integrações",
    proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quanto tempo sem o sistema voltar isso deveria escalar?", unit: "duration" },
    suggestedActions: ["cancel", "notify", "escalate"],
  },
  {
    id: "change_status_mutation_error",
    label: "Pedido preso por falha de status",
    existingRuleIds: ["MON-001", "MON-002", "MON-003", "MON-004"],
  },
  {
    id: "cancel_order_mutation_error",
    label: "Cancelamento falhou (alto risco)",
    needsNewRule: true,
    proposedPolicy: "Alterações & Cancelamentos",
    proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quanto tempo sem confirmação do cancelamento isso deveria virar uma exceção?", unit: "duration" },
    suggestedActions: ["diagnose", "cancel", "notify", "workflow"],
  },
  {
    id: "notify_erp_mutation_error",
    label: "OMS e ERP fora de sincronia",
    needsNewRule: true,
    proposedPolicy: "Integrações Externas",
    proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quantas tentativas sem sucesso isso deveria virar risco?", unit: "count" },
    suggestedActions: ["workflow", "cancel", "reprocess", "escalate"],
  },
  {
    id: "edit_tracking_data_mutation_error",
    label: "Tracking inconsistente",
    needsNewRule: true,
    proposedPolicy: "Coleta & Transporte",
    proposedCategory: "logistics",
    thresholdParam: { prompt: "Depois de quanto tempo sem fonte de tracking válida isso deveria alertar o SAC?", unit: "duration" },
    suggestedActions: ["reprocess", "workflow", "notify"],
  },
  {
    id: "confirm_delivery_mutation_error",
    label: "Entrega não confirmada",
    needsNewRule: true,
    proposedPolicy: "Despacho & Entrega",
    proposedCategory: "logistics",
    thresholdParam: { prompt: "Depois de quanto tempo sem confirmação isso deveria destravar reembolso ou SLA?", unit: "duration" },
    suggestedActions: ["diagnose", "workflow"],
  },
  {
    id: "order_auth_callback_mutation_error",
    label: "Autorização de pagamento inconsistente",
    needsNewRule: true,
    proposedPolicy: "Pagamentos & Autorização",
    proposedCategory: "payment",
    thresholdParam: { prompt: "Depois de quanto tempo sem resposta do PSP isso deveria pausar o avanço?", unit: "duration" },
    suggestedActions: ["diagnose", "escalate", "cancel"],
  },
  {
    id: "update_task_status_mutation_error",
    label: "Fila operacional quebrada",
    existingRuleIds: ["LOG-001", "LOG-002"],
  },
];

/* ── 2. Dicionário de tradução — técnico → natural ───────────────────────
   Chave = string técnica EXATA, já existente no array `conditions` de
   cada regra em workflowPolicies (data-aiw.js). Cobre as 47 condições
   únicas das 26 regras atuais do catálogo. ─────────────────────────── */
const CONDITION_TRANSLATIONS = {
  "delivery.slaBreachProjected == true": "A entrega projetada vai furar o SLA combinado.",
  "cancellations.rateAboveBaseline == true": "A taxa de cancelamentos está acima do padrão normal.",
  "returns.volumeAboveBaseline == true": "O volume de devoluções está acima do padrão normal.",
  'order.timelineComplexity == "high"': "O pedido teve uma linha do tempo com muitos eventos incomuns.",

  "change.requested == true": "O cliente pediu para trocar um item.",
  "picking.started == false": "A separação ainda não começou.",
  "picking.started == true": "A separação já começou.",
  "address.changeRequested == true": "O cliente pediu para mudar o endereço de entrega.",
  "order.hasUnfulfillableItem == true": "Um dos itens do pedido não pode ser atendido.",

  "fraud.postApprovalSignal == true": "Surgiu um sinal de risco de fraude depois que o pedido já tinha sido aprovado.",
  "order.note.containsCommitment == true": "Uma observação manual no pedido menciona um acordo ou promessa feita ao cliente.",

  "payment.approved == true": "O pagamento já foi aprovado.",
  "order.advancedToInvoicing == false": "O pedido não avançou para faturamento.",
  "subscription.cycleOrderCreated == true": "Um pedido do ciclo recorrente foi criado.",
  "payment.approved == false": "O pagamento não foi aprovado.",
  "payment.preAuthExpiresBefore(invoice.expectedAt)": "A pré-autorização do pagamento expira antes da data prevista para o faturamento.",

  "payment.settled == true": "O pagamento foi liquidado.",
  "invoice.issued == false": "A nota fiscal ainda não foi emitida.",
  "invoice.releasableItems > 0": "Existem itens do pedido que já podem ser faturados.",
  "invoice.blockedItems > 0": "Existem itens do pedido bloqueados para faturamento.",

  "order.total != order.expectedTotal": "O valor total do pedido não bate com o valor esperado.",
  "payment.capturedAmount > order.dueAmount": "O valor capturado no pagamento é maior do que o valor devido pelo pedido.",

  "packing.done == true": "O pedido já está embalado.",
  "carrier.pickedUp == false": "A transportadora ainda não coletou.",
  "shipping.labelGenerated == false": "A etiqueta de envio não foi gerada.",
  "carrier.apiAvailable == false": "A API da transportadora está fora do ar.",

  "seller.dispatchElapsed > seller.dispatchSla": "O seller passou do prazo combinado para despachar o pedido.",
  "order.isMultiSeller == true": "O pedido tem itens de mais de um seller.",
  "order.hasLateSellerItem == true": "Um dos sellers está atrasado com a parte dele do pedido.",
  'tracking.status == "delivered"': "O rastreio mostra que o pedido foi entregue.",
  "customer.deniesReceipt == true": "O cliente afirma que não recebeu o pedido.",

  "picking.dueAt < now()": "O prazo para começar a separação já passou.",
  "picking.readyToStart == true": "O pedido já está pronto para começar a separação.",
  "picking.queuePosition > queue.slaThreshold": "O pedido está posicionado muito atrás na fila, além do limite seguro de SLA.",
  "order.isBopis == true": "O pedido é para retirada na loja (BOPIS).",
  "order.readyForPickup == false": "O pedido ainda não está pronto para retirada.",

  "fulfillmentPoint.assignedOrders > fulfillmentPoint.capacity": "O CD ou loja recebeu mais pedidos do que consegue processar agora.",
  "picking.itemNotFound == true": "O item não foi encontrado no estoque físico durante a separação.",
  "item.damagedBeforeDispatch == true": "O item foi danificado antes do despacho.",

  "return.requested == true": "O cliente solicitou uma devolução.",
  "return.withinPolicy == true": "A solicitação está dentro da política de devolução da loja.",
  "return.withinPolicy == false": "A solicitação está fora da política de devolução da loja.",
  "return.approved == true": "A devolução já foi aprovada.",
  "refund.elapsedHours > refund.slaHours": "O tempo decorrido do reembolso já passou do prazo combinado.",
  "return.receivedAtFulfillmentPoint == true": "O item devolvido chegou fisicamente ao centro de distribuição.",
  "return.inspectionMismatch == true": "O item recebido na conferência não bate com o que era esperado.",
  'return.preference == "exchange"': "O cliente preferiu trocar o item em vez de receber reembolso.",
};

/* ══════════════════════════════════════════════════════════════════════
   INSTRUÇÃO DE MIGRAÇÃO (executar depois de colar o bloco acima)
   ──────────────────────────────────────────────────────────────────────
   Migre TODAS as 26 regras de workflowPolicies (nas 12 políticas) do
   formato antigo:
       conditions: ["delivery.slaBreachProjected == true"]
   para o novo, um par por condição:
       conditions: [
         { natural: "A entrega projetada vai furar o SLA combinado.",
           technical: "delivery.slaBreachProjected == true" }
       ]

   Use CONDITION_TRANSLATIONS acima para preencher "natural" — a chave do
   dicionário é a string técnica exata, já existente em cada regra. Não
   invente tradução nova: se alguma string técnica não tiver entrada
   correspondente no dicionário, pare e avise qual regra e qual string.

   Não altere nenhum outro campo da regra (id, name, active, trigger,
   tasks). Não altere a ordem das regras nem das políticas.
   ══════════════════════════════════════════════════════════════════════ */
