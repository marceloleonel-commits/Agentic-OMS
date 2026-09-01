/* ══════════════════════════════════════════════════════════════════════
   policy-chat-engine.js
   ──────────────────────────────────────────────────────────────────────
   Onde isso entra: view-workflow-policies.jsx, substituindo/estendendo
   o RULE_DRAFTS/applyDraft atual. Depende de EVENT_CATALOG e
   CONDITION_TRANSLATIONS (data-aiw-policy-catalog.js) já carregados.

   Cada bloco abaixo é marcado como LLM (chama um prompt), DETERMINÍSTICO
   (sem LLM, lógica fixa) ou ESTÁTICO (texto/dado fixo, sem geração).
   ══════════════════════════════════════════════════════════════════════ */


/* ══ 0. Schema da regra — atualizado ═════════════════════════════════════
   Sem prompt — não gerado por LLM. É o contrato de campos que todos os
   blocos abaixo (draftFor, drawer, runConflictCheck) leem e escrevem.

   ANTES:                              AGORA:
   {                                    {
     id, name, active,                   id, name, active,
     trigger,                            trigger,
     conditions: string[],               sourceEventId: string,        // NOVO — obrigatório
     tasks: [{ kind, label }]            sourceEventLabel: string,      // NOVO — natural, deriva do EVENT_CATALOG
   }                                      priority: number | null,      // NOVO — ordem dentro do mesmo sourceEventId
                                          conditions: [{                // MUDOU — era string[]
                                            natural: string,
                                            technical: string | null,   // null quando o sinal vem de fora do pedido
                                            needsEngineeringInput: boolean
                                          }],
                                          tasks: [{ kind, label, target }] // target NOVO: "agent" | "sac" | "supervisor"
                                        }
   ══════════════════════════════════════════════════════════════════════ */


/* ══ 1. Mensagem inicial do chat ═════════════════════════════════════════
   Sem prompt — texto estático, não gerado por LLM em tempo de execução.
   ══════════════════════════════════════════════════════════════════════ */
const GREETING_MESSAGE = {
  from: "agent",
  text: 'Oi! Eu cuido das políticas do seu agente de pedido. Pode me pedir direto, do seu jeito — "quando a transportadora não coletar, aciona ela e avisa o cliente" — ou, se não tiver certeza do que precisa, eu te ajudo a encontrar isso com algumas perguntas.',
  quickReplies: ["Me ajuda a encontrar"],
};


/* ══ 2. Caminho não guiado ════════════════════════════════════════════════
   Zera ao: trocar de tela, aplicar uma regra, ou entrar no caminho
   guiado. Incrementa a cada frase sem eventMatch (contra os 10 do
   EVENT_CATALOG).
   ══════════════════════════════════════════════════════════════════════ */
let unmatchedAttempts = 0; // useState no componente real

function handleFreeformRule(phrase) {
  const eventMatch = matchEvent(phrase); // LLM — ver PROMPT_MATCH_EVENT abaixo

  if (!eventMatch) {
    unmatchedAttempts += 1;

    if (unmatchedAttempts >= 3) {
      // ESTÁTICO — mensagem fixa de oferta de ajuda na 3ª tentativa falha.
      agentSay({
        from: "agent",
        text: "Ainda não consegui identificar um evento específico a partir do que você descreveu. Quer que eu te ajude com algumas perguntas?",
        quickReplies: ["Sim, me guia", "Deixa eu tentar de novo", "Cancelar"],
      });
      return;
    }
    // ESTÁTICO — mensagem fixa de "não entendi", tentativas 1 e 2.
    agentSay({ from: "agent", text: "Não achei um evento correspondente. Pode descrever de outro jeito — o que o OMS deveria notar, e o que fazer a seguir?" });
    return;
  }

  unmatchedAttempts = 0;

  const policyMatch = eventMatch.existingRuleIds?.length > 1
    ? matchExistingPolicy(phrase, eventMatch) // LLM — prompt abaixo
    : eventMatch.existingRuleIds?.[0] ?? null; // determinístico — só 1 opção, não precisa de LLM

  if (policyMatch) {
    // Regra já existe — nada pra perguntar, o conteúdo já está fechado.
    proposeDraft(draftForExisting(policyMatch));
    return;
  }

  // Evento sem regra existente: precisa de parâmetros antes de gerar
  // qualquer coisa. extractParamsFromPhrase evita perguntar de novo o
  // que a própria frase já respondeu.
  askRuleParameters(eventMatch, (answers) => {
    const draft = draftFor(phrase, eventMatch, {
      threshold: answers.threshold,
      chosenActions: answers.chosenActions,
    });
    proposeDraft(draft); // segue pro card, passa por runConflictCheck (seção 5) antes de "Aplicar"
  }, extractParamsFromPhrase(phrase));
}

/* — LLM: classificar a frase contra o catálogo fechado de eventos — */
function matchEvent(phrase) {
  // chama PROMPT_MATCH_EVENT. contrato: retorna EVENT_CATALOG[i] ou null.
}
const PROMPT_MATCH_EVENT = `
Você classifica uma frase de um merchant contra uma lista FECHADA de eventos técnicos.
Nunca invente um evento fora da lista. Se a frase puder corresponder a mais de um evento
com confiança parecida, ou a nenhum com confiança razoável, retorne eventId: null —
é mais seguro cair no fallback de "não entendi" do que adivinhar errado.

Eventos disponíveis:
\${EVENT_CATALOG.map(e => \`- \${e.id}: \${e.label}\`).join("\\n")}

Frase do merchant: "\${phrase}"

Responda apenas com JSON, sem texto antes ou depois:
{
  "eventId": "<um dos ids acima, ou null>",
  "confidence": "alta" | "média" | "baixa"
}

Trate confidence "baixa" como equivalente a null no fluxo (conta como tentativa não resolvida).
`;

/* — LLM: desambiguar entre regras existentes do mesmo evento — */
function matchExistingPolicy(phrase, eventMatch) {
  // chama PROMPT_MATCH_EXISTING_RULE.
}
const PROMPT_MATCH_EXISTING_RULE = `
Este evento já tem mais de uma regra cadastrada, cada uma cobrindo uma causa raiz
diferente. Decida qual regra existente melhor corresponde à frase do merchant,
comparando com o "trigger" (a circunstância) de cada uma.

Evento: \${eventMatch.label}

Regras existentes para este evento:
\${existingRules.map(r => \`- \${r.id} (\${r.name}): "\${r.trigger}"\`).join("\\n")}

Frase do merchant: "\${phrase}"

Responda apenas com JSON:
{
  "ruleId": "<um dos ids acima, ou null se nenhuma causa raiz combina>",
  "reasoning": "<uma frase curta explicando a escolha, para log interno — nunca mostrada ao merchant>"
}

Se ruleId for null, o merchant está descrevendo uma variante nova dentro do mesmo evento —
trate como needsNewRule mesmo esse evento tendo regras existentes.
`;

/* — LLM: extrai threshold/ações já mencionados na frase, antes de perguntar — */
function extractParamsFromPhrase(phrase) {
  // chama PROMPT_EXTRACT_PARAMS_FROM_PHRASE.
}
const PROMPT_EXTRACT_PARAMS_FROM_PHRASE = `
O merchant descreveu um cenário. Extraia, SE estiverem explícitos na frase,
o threshold (tempo ou contagem) e as ações desejadas. Não infira o que não
foi dito — deixe null quando a frase não menciona.

Frase: "\${phrase}"

Responda apenas com JSON:
{
  "threshold": { "value": number, "unit": "h" | "d" | "count" } | null,
  "chosenActions": ["<kinds mencionados, na ordem em que aparecem>"] | null
}
`;

/* — LLM: redige o Se/Então a partir de threshold e ações JÁ decididos —
   Importante: esta versão NÃO decide threshold nem ações — só redige o
   que o merchant (ou a extração da frase) já confirmou. */
function draftFor(phrase, eventMatch, params) {
  // chama PROMPT_DRAFT_RULE.
}
const PROMPT_DRAFT_RULE = `
Você escreve o Se/Então de uma regra. O merchant JÁ escolheu o threshold e as
ações — sua tarefa é só redigir, não decidir o conteúdo. Nunca troque o valor
do threshold nem a lista/ordem de ações recebidas.

Evento de origem (fixo): \${eventMatch.id} — "\${eventMatch.label}"
Threshold confirmado pelo merchant: \${params.threshold ? \`\${params.threshold.value}\${params.threshold.unit}\` : "não aplicável"}
Ações escolhidas, na ordem: \${params.chosenActions.join(" → ")}

Responda apenas com JSON:
{
  "name": "<nome curto da regra>",
  "trigger": "<frase da circunstância, incorporando o threshold quando houver>",
  "conditions": [
    { "natural": "...", "technical": "..." | null, "needsEngineeringInput": boolean }
  ],
  "tasks": [
    // UMA entrada por item de chosenActions, NA MESMA ORDEM — não reordene, não adicione, não remova.
    { "kind": "<item de chosenActions>", "label": "<ação em poucas palavras>", "target": "agent" | "sac" | "supervisor" }
  ]
}
`;

/* — ESTÁTICO: sequência fixa de duas perguntas (threshold, depois ações).
   prefilled pula o que já veio de extractParamsFromPhrase (frase livre)
   ou fica {} no caminho guiado (a árvore nunca teve frase pra extrair). — */
function askRuleParameters(eventMatch, onComplete, prefilled = {}) {
  const answers = { ...prefilled };

  const askThreshold = () => {
    if (answers.threshold || !eventMatch.thresholdParam) return askActions();
    agentSay({
      from: "agent",
      text: eventMatch.thresholdParam.prompt,
      inputType: eventMatch.thresholdParam.unit, // "duration" → "4h"/"24h"; "count" → número
      onAnswer: (value) => { answers.threshold = value; askActions(); },
    });
  };

  const askActions = () => {
    if (answers.chosenActions) return onComplete(answers);
    agentSay({
      from: "agent",
      text: "O que você quer que o agente faça quando isso acontecer? Toque na ordem em que devem rodar — pode tirar ou adicionar.",
      type: "action-builder",
      suggested: eventMatch.suggestedActions.map((kind) => ({ kind, label: kindOf(kind).label })),
      onAnswer: (orderedKinds) => { answers.chosenActions = orderedKinds; onComplete(answers); },
    });
  };

  askThreshold();
}


/* ══ 3. Caminho guiado — árvore, resposta livre, parâmetros, recapitulação ══
   ESTÁTICO — a árvore em si é um grafo fixo de perguntas e opções, mesmo
   shape de verification.questions (Canvas A/F). Cada opção aponta `next`
   (mais uma pergunta) ou entrega `eventId`/`existingRuleId` final.
   ══════════════════════════════════════════════════════════════════════ */
const NEED_TREE = {
  start: "n1",
  questions: {
    n1: {
      title: "O que está te incomodando na operação?",
      options: [
        { id: "atraso", title: "Pedidos demorando ou parados", next: "n1a" },
        { id: "pagamento", title: "Pagamento com problema", eventId: "order_auth_callback_mutation_error" },
        { id: "cancelamento", title: "Cancelamento não funciona", eventId: "cancel_order_mutation_error" },
        { id: "estoque", title: "Estoque ou separação com erro", eventId: "details_viewed_pending_alert_stock" },
        { id: "entrega", title: "Transporte, rastreio ou entrega", next: "n1e" },
        { id: "sistema", title: "Sistema fora do ar ou integração falhando", next: "n1f" },
      ],
    },
    n1a: {
      title: "O que você percebe primeiro?",
      options: [
        { id: "prazo", title: "Prazo de entrega passando", eventId: "details_viewed_pending_alert_sla" },
        { id: "status", title: "Status parado, sem avançar", eventId: "change_status_mutation_error" },
        { id: "fila", title: "Fila de tarefas travando outros pedidos", eventId: "update_task_status_mutation_error" },
      ],
    },
    n1e: {
      title: "O que exatamente?",
      options: [
        { id: "coleta", title: "Transportadora não retira", existingRuleId: "LOG-003" },
        { id: "tracking", title: "Rastreio não bate com a realidade", eventId: "edit_tracking_data_mutation_error" },
        { id: "confirmacao", title: "Não sei se realmente chegou no cliente", eventId: "confirm_delivery_mutation_error" },
      ],
    },
    n1f: {
      title: "Onde?",
      options: [
        { id: "geral", title: "O sistema geral trava e bloqueia ações", eventId: "details_viewed_pending_alert_avl_down" },
        { id: "erp", title: "É especificamente com o ERP", eventId: "notify_erp_mutation_error" },
      ],
    },
  },
};

/* — LLM: só roda quando a pessoa digita em vez de clicar numa opção — */
function matchTreeOption(currentNode, freeTextAnswer) {
  // chama PROMPT_MATCH_TREE_OPTION.
}
const PROMPT_MATCH_TREE_OPTION = `
O merchant está respondendo uma pergunta de um fluxo guiado, mas digitou em vez
de clicar numa opção. Mapeie o texto livre para a opção mais próxima. Se não bater
com nenhuma com confiança razoável, retorne optionId: null — o app deve então
repetir a pergunta com as opções em destaque, nunca adivinhar.

Pergunta atual: "\${currentNode.title}"
Opções disponíveis:
\${currentNode.options.map(o => \`- \${o.id}: "\${o.title}"\`).join("\\n")}

Resposta digitada pelo merchant: "\${freeTextAnswer}"

Responda apenas com JSON:
{ "optionId": "<um dos ids acima, ou null>" }
`;

/* — DETERMINÍSTICO: decide, ao fim da árvore, se pergunta parâmetro ou
   já vai pra recapitulação. Só pergunta quando o nó final é um eventId
   SEM existingRuleId (precisa criar regra nova). — */
function resolveTreeLeaf(leaf, answerTrail) {
  if (leaf.existingRuleId) {
    return buildGuidedSummary(answerTrail, { existingRuleId: leaf.existingRuleId, ...leaf });
  }

  const eventMatch = EVENT_CATALOG.find((e) => e.id === leaf.eventId);
  askRuleParameters(eventMatch, (answers) => {
    const draft = draftFor(null, eventMatch, {
      threshold: answers.threshold,
      chosenActions: answers.chosenActions,
    });
    buildGuidedSummary(answerTrail, { eventLabel: eventMatch.label, eventMatch, draft, ...draft });
  }); // sem prefilled — a árvore nunca teve frase livre pra extrair.
}

/* ══ Recapitulação — nó final da árvore ══════════════════════════════════
   ESTÁTICO — não gerado por LLM. Só remonta em card o que já foi decidido
   pelos cliques/respostas anteriores (answerTrail) e pelo draftFor já
   chamado em resolveTreeLeaf. Reaproveita o action card, com um bloco
   extra "Como chegamos aqui" que os cards de frase livre não têm.
   ══════════════════════════════════════════════════════════════════════ */
function buildGuidedSummary(answerTrail, resolved) {
  const ruleName = resolved.existingRuleId
    ? `${resolved.existingRuleId} · ${resolved.ruleName || ""}`.trim()
    : resolved.draft.name;
  const triggerSentence = resolved.trigger || resolved.draft?.trigger || "";
  const policyName = resolved.policyName || "";

  return {
    type: "action",
    title: "Como chegamos aqui",
    badge: resolved.existingRuleId ? "Regra existente" : "Nova regra",
    heading: resolved.existingRuleId
      ? `Isso já está coberto: ${resolved.existingRuleId}`
      : resolved.draft.name,
    /* ESTÁTICO — concatenação determinística de campos já decididos, sem LLM.
       Se algum campo estiver vazio, a frase se degrada com naturalidade. */
    summary: [
      ruleName && `${ruleName}, na política ${policyName}.`,
      triggerSentence,
    ].filter(Boolean).join(" ").trim(),
    /* `trail` agora é o objeto bruto — o card renderiza pergunta como caption
       e resposta como corpo. Não dá para fazer isso com a seta embutida. */
    trail: answerTrail,
    /* `Então` vira `values: string[]` — o card lista uma ação por linha.
       Ícone por campo é opcional e mapeado no chat.jsx. */
    fields: [
      { group: "policy", label: "Categoria", value: resolved.categoryLabel, categoryId: resolved.categoryId },
      { group: "policy", label: "Política",  value: policyName },
      { group: "policy", label: "Gatilho",   value: triggerSentence },
      { group: "policy", label: "Se",        value: resolved.conditionsNatural },
      { group: "policy", label: "Então",     values: resolved.tasksLabels || [] },
    ],
    onApply: () => runConflictCheck(resolved), // seção 4 — nunca aplica direto
    onEdit:  resolved.existingRuleId ? null : () => reopenDraft(resolved),
  };
}


/* ══ 4. Conflito e prioridade — determinístico, sem LLM ══════════════════
   Conflito = outra regra ATIVA com o mesmo sourceEventId cujas tarefas
   divergem em kind. A tabela de divergência é fixa — só 9 tipos, e as
   combinações que colidem são um conjunto pequeno e estável.
   ══════════════════════════════════════════════════════════════════════ */
const KIND_CONFLICTS = [
  ["cancel", "notify"], ["cancel", "reallocate"], ["cancel", "reprocess"],
  ["reallocate", "replan"],
];

function hasDivergentTaskKinds(tasksA, tasksB) {
  return tasksA.some((a) => tasksB.some((b) =>
    KIND_CONFLICTS.some(([x, y]) => (a.kind === x && b.kind === y) || (a.kind === y && b.kind === x))
  ));
}

function runConflictCheck(newRule) {
  const conflicting = policies
    .flatMap((p) => p.rules.map((r) => ({ ...r, policyName: p.name })))
    .filter((r) => r.active && r.sourceEventId === newRule.sourceEventId
      && r.id !== newRule.id && hasDivergentTaskKinds(r.tasks, newRule.tasks));

  if (conflicting.length === 0) return applyRule(newRule);

  // ESTÁTICO — texto e opções fixas do card de conflito.
  agentSay({
    from: "agent",
    type: "action",
    title: "Essa regra pode conflitar com outra já ativa",
    heading: `${conflicting[0].id} · ${conflicting[0].name}`,
    fields: [
      { label: "Política onde já está", value: conflicting[0].policyName },
      { label: "O que ela faz hoje", value: conflicting[0].tasks.map((t) => t.label).join(" · ") },
      { label: "O que a nova regra faria", value: newRule.tasks.map((t) => t.label).join(" · ") },
    ],
    options: [
      { label: "Manter as duas ativas", action: () => resolveConflict(newRule, conflicting[0], "keep-both") },
      { label: `Despriorizar ${conflicting[0].id}`, action: () => resolveConflict(newRule, conflicting[0], "deprioritize-existing") },
      { label: "Repriorizar — a nova assume na frente", action: () => resolveConflict(newRule, conflicting[0], "reprioritize-new-first") },
      { label: "Cancelar e ajustar a regra", action: () => reopenDraft(newRule) },
    ],
  });
}

/* priority: number | null.
     null   = sem ordem declarada (uma única regra ativa, ou "manter as duas").
     number = ordem de execução dentro do cluster do mesmo sourceEventId.
              Menor executa primeiro. Se resolver a causa raiz, as tarefas
              da regra de priority maior fecham como "Encerrada por
              cascata" — reaproveita o estado terminal que já existe na Tarefa. */
function reorderCluster(sourceEventId, orderedRuleIds) {
  orderedRuleIds.forEach((ruleId, idx) => setPriority(ruleId, sourceEventId, idx + 1));
}

function resolveConflict(newRule, existingRule, decision) {
  const clusterOthers = rulesSharingEvent(newRule.sourceEventId)
    .filter((r) => r.id !== newRule.id && r.id !== existingRule.id);

  switch (decision) {
    case "keep-both":
      setPriority(newRule.id, null);
      setPriority(existingRule.id, null);
      break;
    case "deprioritize-existing":
      reorderCluster(newRule.sourceEventId, [newRule.id, existingRule.id, ...clusterOthers.map((r) => r.id)]);
      break;
    case "reprioritize-new-first":
      reorderCluster(newRule.sourceEventId, [newRule.id, ...clusterOthers.map((r) => r.id), existingRule.id]);
      break;
  }
  applyRule(newRule);
}


/* ══ 5. Fluxo C — criação de política nova ═══════════════════════════════
   Só cai aqui quando matchExistingPolicy() não acha nada (seção 2).
   Política nunca nasce vazia — sempre com a primeira regra dentro, já
   vinculada a um eventMatch (ou pendingEventCatalog: true, se nenhum
   evento bateu).
   ══════════════════════════════════════════════════════════════════════ */

/* — LLM: nome e categoria da política nova — */
function suggestPolicy(phrase, eventMatch) {
  // chama PROMPT_SUGGEST_POLICY.
}
const PROMPT_SUGGEST_POLICY = `
Sugira nome e categoria para uma política nova, a partir da frase do merchant.
A categoria PRECISA ser uma destas 5 — nunca crie uma sexta:
Exceções Operacionais | Pagamento | Logística | Fulfillment | Devolução & Troca

Evento de origem (se houver): \${eventMatch?.label ?? "nenhum identificado"}
Frase do merchant: "\${phrase}"

Responda apenas com JSON:
{
  "categoria": "<uma das 5 acima>",
  "nomePolitica": "<curto, no vocabulário de negócio do merchant, não técnico>"
}
`;

/* — LLM: checar se já existe política parecida antes de criar duplicada — */
function findSimilarPolicy(draft) {
  // chama PROMPT_FIND_SIMILAR_POLICY.
}
const PROMPT_FIND_SIMILAR_POLICY = `
Compare a política que está sendo proposta com as políticas já existentes.
Sinalize sobreposição só se o TEMA de negócio for realmente parecido — categorias
diferentes quase nunca se sobrepõem, mesmo com nomes parecidos.

Política proposta: "\${draft.nomePolitica}" (categoria: \${draft.categoria})

Políticas existentes:
\${allPolicies.map(p => \`- \${p.id} · "\${p.name}" (\${p.category})\`).join("\\n")}

Responda apenas com JSON:
{
  "similarPolicyId": "<id ou null>",
  "reason": "<uma frase curta, só preenchida se similarPolicyId não for null>"
}
`;

// ORQUESTRADOR — chama as duas LLMs acima em sequência, sem lógica própria de julgamento.
function policyDraftFor(phrase, eventMatch) {
  const categoriaSuggestion = suggestPolicy(phrase, eventMatch); // LLM
  const similar = findSimilarPolicy({ // LLM
    nomePolitica: eventMatch?.proposedPolicy ?? categoriaSuggestion.nomePolitica,
    categoria: eventMatch?.proposedCategory ?? categoriaSuggestion.categoria,
  });
  return {
    categoriaSugerida: eventMatch?.proposedCategory ?? categoriaSuggestion.categoria,
    nomePolitica: eventMatch?.proposedPolicy ?? categoriaSuggestion.nomePolitica,
    primeiraRegra: draftFor(phrase, eventMatch, {}), // LLM — ver PROMPT_DRAFT_RULE acima
    eventoOrigem: eventMatch ?? null,
    similarPolicyWarning: similar.similarPolicyId
      ? `Isso é parecido com "${similar.similarPolicyId}" — quer mesmo separar, ou prefere adicionar como regra nova lá? (${similar.reason})`
      : null,
  };
}

// DETERMINÍSTICO — sem LLM. Só grava o que já foi decidido acima.
function applyPolicyDraft(draft) {
  const policy = createPolicy({
    category: draft.categoriaSugerida,
    name: draft.nomePolitica,
    rules: [{ ...draft.primeiraRegra, active: true, pendingEventCatalog: !draft.eventoOrigem }],
  });
  scrollToAndHighlight(policy.id);
}
