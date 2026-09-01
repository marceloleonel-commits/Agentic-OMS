/* global React, ReactDOM, Icon, AIWData, ChatPanel, ResizableSplit, Toggle, Dropdown, IconButton */
const { useState, useRef, useEffect, useMemo, useCallback } = React;

/* ══ Políticas do Workflow ══════════════════════════════════════════════
   Chat + canvas. O canvas lista as regras que governam o que o OMS Agent Hub
   detecta e executa, agrupadas por política; o chat monta uma regra nova a
   partir de uma frase e a entrega ao canvas pelo action card (Fluxo B do
   AGENT_SPEC: "Aplicar" cria o item, faz scroll até ele e abre o detalhe).
   ═══════════════════════════════════════════════════════════════════════ */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function kindOf(kindId) {
  return AIWData.policyActionKinds.find((k) => k.id === kindId)
    || { id: kindId, label: "—", bg: "var(--bg-muted)", fg: "var(--fg-2)", dot: "var(--fg-3)" };
}

function categoryOf(catId) {
  return AIWData.policyCategories.find((c) => c.id === catId) || AIWData.policyCategories[0];
}

/* Tipos de ação distintos da regra, na ordem em que aparecem nas tarefas —
   alimenta tanto os pontos do resumo da linha quanto os grupos do drawer. */
function kindsOf(rule) {
  const seen = [];
  rule.tasks.forEach((t) => { if (!seen.includes(t.kind)) seen.push(t.kind); });
  return seen;
}

/* ── Tag de categoria ───────────────────────────────────────────────────── */
/* Mapa categoryId → Material Symbols Outlined. Substitui o emoji do
   `policyCategories[].icon` (mantido em `data-aiw.js` para retrocompat
   das outras superfícies que ainda leem `cat.icon` como texto). */
const POLICY_CATEGORY_ICON = {
  exceptions:  "warning-amber",
  payment:     "credit-card",
  logistics:   "local-shipping",
  fulfillment: "inventory-2",
  returns:     "swap-horiz",
};

function PolicyCategoryTag({ categoryId }) {
  const cat = categoryOf(categoryId);
  const iconName = POLICY_CATEGORY_ICON[categoryId];
  /* `cat.fg` é o tom escuro da mesma matriz da `cat.color` — texto e
     ícone usam o mesmo fg pra manter contraste dentro da paleta. */
  return (
    <span className="wfp-cat-tag" style={{ background: cat.color, color: cat.fg }}>
      {iconName && <Icon name={iconName} size={12} />}
      {cat.label}
    </span>
  );
}

/* ── Chip de tarefa, colorido pelo tipo de ação ─────────────────────────── */
function PolicyTaskChip({ task }) {
  const k = kindOf(task.kind);
  return <span className="wfp-task-chip" style={{ background: k.bg, color: k.fg }}>{task.label}</span>;
}

/* ── Drawer de detalhe da regra ──────────────────────────────────────────
   Reaproveita o drawer lateral já existente no projeto (.wf-side-drawer):
   mesmo portal, mesma animação de entrada e mesmo header de navegação. */
function PolicyRuleDrawer({ rule, policy, onToggle, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Apresentação pura: lê os campos já normalizados na regra
     (sourceEventLabel, conditions ricas, tasks em ordem, priority) e só
     decide como exibir. Duas mudanças em relação à versão anterior:
     (1) Origem do evento em linguagem natural, código como legenda.
     (2) Ações numeradas na ordem real do array — nunca reagrupadas
         por kind. */
  return ReactDOM.createPortal(
    <div
      className="wf-side-drawer-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="wf-side-drawer" role="dialog" aria-modal="true" aria-label={rule.name}>
        <div className="stage-config-modal-head">
          <IconButton icon={<Icon name="arrow-left" size={18} />} label="Voltar" variant="tertiary" onClick={onClose} />
          <h2 className="stage-config-modal-title">{rule.name}</h2>
        </div>

        <div className="wf-side-drawer-body">
          <div className="wfp-drawer-ident">
            <span className="wfp-drawer-breadcrumb">
              <PolicyCategoryTag categoryId={policy.category} />
              <span className="wfp-drawer-policy">{policy.name}</span>
            </span>
            <span className="wfp-sid">{rule.id}</span>
          </div>

          {rule.sourceEventLabel && (
            <div className="wfp-drawer-block">
              <span className="wfp-block-label">Origem</span>
              <p className="detail-desc wfp-event-label">{rule.sourceEventLabel}</p>
              {rule.sourceEventId && <code className="wfp-event-code">{rule.sourceEventId}</code>}
            </div>
          )}

          <p className="detail-desc wfp-drawer-trigger">{rule.trigger}</p>

          <div className="wfp-drawer-status">
            <span className="setting-row-desc">{rule.active ? "Ativa" : "Desligada"}</span>
            <Toggle on={rule.active} onChange={() => onToggle(policy.id, rule.id)} />
          </div>

          {rule.priority != null && rule.sourceEventLabel && (
            <p className="wfp-priority-note">
              {rule.priority}º dentro do evento &ldquo;{rule.sourceEventLabel}&rdquo;
            </p>
          )}

          <div className="wfp-drawer-block">
            <span className="wfp-block-label">Se — condições</span>
            {rule.conditions.map((raw, i) => {
              /* Compat: seed antigo pode entregar string; runtime já traz
                 o par natural/technical. */
              const c = typeof raw === "string"
                ? { natural: raw, technical: raw, needsEngineeringInput: false }
                : raw;
              return (
                <div key={i} className="wfp-cond-pair">
                  <p className="wfp-cond-natural">{c.natural}</p>
                  {c.technical
                    ? <code className="wfp-cond-code">{c.technical}</code>
                    : c.needsEngineeringInput && (
                        <span className="wfp-cond-pending">mapeamento técnico pendente</span>
                      )
                  }
                </div>
              );
            })}
          </div>

          <div className="wfp-drawer-block">
            <span className="wfp-block-label">Então — ações, em ordem</span>
            {rule.tasks.map((t, i) => {
              const k = kindOf(t.kind);
              return (
                <div key={i} className="wfp-task-row">
                  <span className="wfp-task-num">{i + 1}</span>
                  <span className="wfp-dot" style={{ background: k.dot }} />
                  <span className="wfp-kind-label-inline">{k.label}</span>
                  <span className="wfp-task-label">{t.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Canvas ─────────────────────────────────────────────────────────────── */
function WorkflowPoliciesCanvas({
  policies, query, onQuery, category, onCategory, status, onStatus,
  onToggleRule, selectedRuleId, onSelectRule, highlightId, onNewRule,
}) {
  const rowRefs = useRef({});

  /* Regra recém-criada pelo chat: o canvas rola até ela e o card fica em
     destaque enquanto o drawer correspondente abre. */
  useEffect(() => {
    if (!highlightId) return;
    const el = rowRefs.current[highlightId];
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlightId]);

  const q = norm(query.trim());
  const matches = (rule, policy) => {
    if (status === "on" && !rule.active) return false;
    if (status === "off" && rule.active) return false;
    if (!q) return true;
    return [rule.id, rule.name, rule.trigger, policy.name, ...rule.tasks.map((t) => t.label)]
      .some((v) => norm(v).includes(q));
  };

  const groups = policies
    .filter((p) => category === "all" || p.category === category)
    .map((p) => ({ policy: p, rules: p.rules.filter((r) => matches(r, p)) }))
    .filter((g) => g.rules.length > 0);

  const countFor = (catId) => policies
    .filter((p) => catId === "all" || p.category === catId)
    .reduce((n, p) => n + p.rules.length, 0);

  const categoryLabel = category === "all" ? "Todas" : categoryOf(category).label;

  const statusOptions = [
    { id: "all", label: "Todas" },
    { id: "on",  label: "Ativas" },
    { id: "off", label: "Desligadas" },
  ];
  const statusLabel = (statusOptions.find((o) => o.id === status) || statusOptions[0]).label;

  return (
    <div className="detail-panel">
      <div className="detail-head canvas-topbar" data-sl-canvas-tool-topbar="">
        <span className="canvas-topbar-title">Políticas de pedido</span>
        <div className="detail-head-right">
          <button data-sl-button data-variant="primary" data-has-label onClick={onNewRule}>
            <Icon name="plus" size={16} />
            Nova regra
          </button>
        </div>
      </div>

      <div className="wfp-toolbar">
        <div data-sl-module-browser-search="" className="wfp-search">
          <span data-sl-module-browser-search-pre-icon=""><Icon name="search" size={20} /></span>
          <input
            data-sl-module-browser-search-input=""
            type="search"
            placeholder="Buscar"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
          {query && (
            <button data-sl-module-browser-search-clear="" title="Limpar busca" onClick={() => onQuery("")}>
              <Icon name="x" size={16} />
            </button>
          )}
        </div>

        <Dropdown
          align="left"
          trigger={
            <button className="filter-dropdown-btn wfp-cat-btn">
              <span className="filter-dropdown-label-text">Categoria:</span>
              <span className="filter-dropdown-summary">{categoryLabel}</span>
              <span className="filter-dropdown-chevron"><Icon name="chevron-down" size={12} /></span>
            </button>
          }
        >
          {[{ id: "all", label: "Todas as categorias" }].concat(
            AIWData.policyCategories.map((c) => ({ id: c.id, label: `${c.icon} ${c.label}` }))
          ).map((opt) => (
            <button key={opt.id} className="dd-item wfp-cat-option" onClick={() => onCategory(opt.id)}>
              <span className="wfp-cat-check">
                {category === opt.id && <Icon name="check" size={14} />}
              </span>
              <span className="dd-item-label wfp-cat-option-label">{opt.label}</span>
              <span className="wfp-cat-count">{countFor(opt.id)}</span>
            </button>
          ))}
        </Dropdown>

        {/* Status vira dropdown seleção-única no mesmo padrão do filtro de
            categoria (.filter-dropdown-btn.wfp-cat-btn) — troca do segmented
            para uniformizar os filtros da toolbar. */}
        <Dropdown
          align="left"
          trigger={
            <button className="filter-dropdown-btn wfp-cat-btn">
              <span className="filter-dropdown-label-text">Status:</span>
              <span className="filter-dropdown-summary">{statusLabel}</span>
              <span className="filter-dropdown-chevron"><Icon name="chevron-down" size={12} /></span>
            </button>
          }
        >
          {statusOptions.map((opt) => (
            <button key={opt.id} className="dd-item wfp-cat-option" onClick={() => onStatus(opt.id)}>
              <span className="wfp-cat-check">
                {status === opt.id && <Icon name="check" size={14} />}
              </span>
              <span className="dd-item-label wfp-cat-option-label">{opt.label}</span>
            </button>
          ))}
        </Dropdown>
      </div>

      <div className="detail-scroll wfp-scroll">
        <div className="wfp-list">
          {groups.map(({ policy, rules }) => {
            const active = rules.filter((r) => r.active).length;
            return (
              <section key={policy.id} className="wfp-card">
                <header className="wfp-card-head">
                  <div className="wfp-card-title">
                    <h3 className="wfp-card-name">{policy.name}</h3>
                    <span className="wfp-card-meta">
                      {plural(rules.length, "regra", "regras")} · {plural(active, "ativa", "ativas")}
                    </span>
                  </div>
                  <PolicyCategoryTag categoryId={policy.category} />
                </header>

                <div className="wfp-card-rules">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      ref={(el) => { rowRefs.current[rule.id] = el; }}
                      className={`wfp-row${selectedRuleId === rule.id ? " is-selected" : ""}${highlightId === rule.id ? " is-new" : ""}`}
                    >
                      <button className="wfp-row-main" onClick={() => onSelectRule(rule.id)}>
                        <span className="wfp-sid">{rule.id}</span>
                        <span className="wfp-row-name">{rule.name}</span>
                      </button>

                      <span className="wfp-row-tasks">
                        <span className="wfp-row-tasks-label">{plural(rule.tasks.length, "tarefa", "tarefas")}</span>
                      </span>

                      <span className="wfp-col-status">
                        <Toggle on={rule.active} onChange={() => onToggleRule(policy.id, rule.id)} />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {groups.length === 0 && (
            <div className="wfp-empty">Nenhuma regra encontrada para esse filtro.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Chat: rascunhos de regra ────────────────────────────────────────────
   A frase do operador é casada com um rascunho conhecido; sem casamento, o
   agente propõe uma regra de detecção genérica com a própria frase como
   gatilho. O rascunho vira action card e só existe no canvas após "Aplicar". */
const RULE_DRAFTS = [
  {
    match: /coleta|coletar|transportadora|carrier|etiqueta/,
    policyId: "pol-carrier",
    name: "Transportadora não coletou no horário",
    conditions: ["pickup.collectedOnTime == false"],
    tasks: [
      { label: "Acionar transportadora", kind: "notify" },
      { label: "Reagendar coleta", kind: "replan" },
      { label: "Notificar cliente", kind: "notify" },
    ],
  },
  {
    match: /pagamento|pagar|captura|autoriza|cobranca|estorno/,
    policyId: "pol-payment-authorization",
    name: "Pedido travado em pagamento",
    conditions: ["payment.approved == true", "payment.stuckHours > 4"],
    tasks: [
      { label: "Tentar nova autorização/captura", kind: "reprocess" },
      { label: "Abrir alerta para SAC/Financeiro", kind: "notify" },
      { label: "Cancelar por política", kind: "cancel" },
    ],
  },
  {
    match: /separa|picking|packing|estoque|fulfillment|cd\b/,
    policyId: "pol-picking",
    name: "Pedido parado na separação",
    conditions: ["picking.started == false", "picking.dueAt < now()"],
    tasks: [
      { label: "Priorizar na fila", kind: "replan" },
      { label: "Reatribuir fulfillment point", kind: "reallocate" },
      { label: "Notificar cliente preventivamente", kind: "notify" },
    ],
  },
  {
    match: /devolu|troca|reembols|reverso/,
    policyId: "pol-returns",
    name: "Devolução sem desfecho no prazo",
    conditions: ["return.approved == true", "refund.elapsedHours > refund.slaHours"],
    tasks: [
      { label: "Validar evidências do reembolso", kind: "diagnose" },
      { label: "Reprocessar reembolso", kind: "refund" },
      { label: "Escalar para o PSP", kind: "escalate" },
    ],
  },
  {
    match: /entrega|atras|sla|despach/,
    policyId: "pol-dispatch",
    name: "Entrega em risco de furar o SLA",
    conditions: ["delivery.slaBreachProjected == true"],
    tasks: [
      { label: "Antecipar etapa crítica", kind: "replan" },
      { label: "Trocar transportadora", kind: "reallocate" },
      { label: "Notificar cliente", kind: "notify" },
    ],
  },
];

/* Prompt de referência: quando um evento tem mais de uma regra cadastrada,
   cada uma cobrindo uma causa raiz distinta, o LLM escolhe qual regra
   existente melhor corresponde à frase — ou devolve null se a frase
   descreve uma variante nova dentro do mesmo evento. Versionado aqui para
   que a implementação de produção substitua `matchExistingPolicy` por
   uma chamada real usando este prompt. */
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

/* Heurística determinística de protótipo: pontua cada regra existente do
   evento por sobreposição de tokens (>=4 chars) entre a frase e o
   nome+trigger+tarefas. Empate ou score baixo → null (equivalente a
   "nenhuma causa raiz combina" no PROMPT_MATCH_EXISTING_RULE), o que
   dispara Fluxo C no `handleFreeformRule`. Em produção, substitua por
   chamada ao LLM usando PROMPT_MATCH_EXISTING_RULE. */
function matchExistingPolicy(phrase, eventMatch, policies) {
  const ids = eventMatch.existingRuleIds || [];
  if (ids.length === 0) return null;
  const candidates = ids
    .map((rid) => {
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === rid);
        if (r) return r;
      }
      return null;
    })
    .filter(Boolean);
  if (candidates.length === 0) return null;

  const n = norm(phrase);
  const tokens = n.split(/\s+/).filter((t) => t.length >= 4);
  const scored = candidates.map((r) => {
    const hay = norm(`${r.name} ${r.trigger} ${r.tasks.map((t) => t.label).join(" ")}`);
    let s = 0;
    for (const tok of tokens) if (hay.includes(tok)) s += 1;
    return { rule: r, score: s };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0];
  const runnerUp = scored[1];
  if (!top || top.score < 2) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.rule.id;
}

/* Prompt de referência: a LLM só REDIGE — não decide mais threshold nem
   ações. O merchant já confirmou os dois via `askRuleParameters` (caminho
   guiado) ou os inferiu implicitamente na frase livre (caminho não
   guiado, seção 3). O prompt injeta os valores fixos e a lista/ordem de
   ações; o modelo só escreve nome, trigger, natural/technical das
   condições e labels das tasks. Nunca troca threshold, nunca reordena
   ações. */
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

/* Parse determinístico do valor de threshold digitado pelo merchant.
   Retorna `{value, unit}` ou null se não bater com o formato esperado.
   `thresholdParam.unit` decide a categoria: "duration" aceita min/h/d,
   "count" aceita número puro. */
function parseThreshold(text, thresholdParam) {
  const raw = norm(text).trim();
  if (!raw) return null;
  if (thresholdParam?.unit === "count") {
    const m = raw.match(/^(\d+)/);
    if (!m) return null;
    return { value: parseInt(m[1], 10), unit: "count" };
  }
  /* Duration: aceita "4h", "30 min", "2d", "3 dias", "1 hora". */
  const m = raw.match(/^(\d+)\s*(min|m|h|hora|horas|d|dia|dias)\b/);
  if (!m) return null;
  const value = parseInt(m[1], 10);
  const rawUnit = m[2];
  const unit = /^m(in)?$/.test(rawUnit) ? "min"
    : /^d/.test(rawUnit) ? "d"
    : "h";
  return { value, unit };
}

/* Formata um threshold `{value, unit}` como condição natural + technical.
   `unit` do answer é a sub-unidade concreta ("min"/"h"/"d" para duration,
   "count" para contagem) — a categoria vem do `thresholdParam.unit`. */
function thresholdToCondition(threshold, thresholdParam) {
  if (!threshold) return null;
  if (thresholdParam?.unit === "count") {
    return {
      natural: `Pelo menos ${threshold.value} ocorrência(s)`,
      technical: `count >= ${threshold.value}`,
      needsEngineeringInput: false,
    };
  }
  const unitLabel = threshold.unit === "min" ? "minutos" : threshold.unit === "h" ? "horas" : threshold.unit === "d" ? "dias" : threshold.unit;
  return {
    natural: `Aguardou pelo menos ${threshold.value} ${unitLabel}`,
    technical: `elapsed >= "${threshold.value}${threshold.unit}"`,
    needsEngineeringInput: false,
  };
}

/* Rascunha uma regra a partir da frase + evento reconhecido, seguindo a
   gramática do PROMPT_DRAFT_RULE. Se `eventMatch` é null, cai no fallback
   por regex (RULE_DRAFTS) — usado só quando o caller ainda não passou o
   contexto do evento. Se `params` vem preenchido (Fluxo de parâmetros
   guiado: `{ threshold, chosenActions }`), usa os valores confirmados
   pelo merchant em vez de inventar via template. Em produção, substitua
   por chamada ao LLM. */
function draftFor(phrase, eventMatch, params) {
  if (!eventMatch) {
    const n = norm(phrase);
    const hit = RULE_DRAFTS.find((d) => d.match.test(n));
    if (hit) return { ...hit, trigger: phrase.trim() };
    return {
      policyId: "pol-risk-sla",
      name: phrase.trim().replace(/^./, (c) => c.toUpperCase()).slice(0, 70),
      trigger: phrase.trim(),
      conditions: ["event.matchesDescription == true"],
      tasks: [
        { label: "Diagnosticar ocorrência", kind: "diagnose" },
        { label: "Abrir task de exceção", kind: "workflow" },
        { label: "Notificar operação", kind: "notify" },
      ],
    };
  }

  const tpl = NEW_RULE_TEMPLATES[eventMatch.id];

  /* Condições: se veio threshold nos params, ela vira a única condição
     (o merchant confirmou o valor). Sem threshold, usa o template ou o
     fallback determinístico. */
  let conditions;
  if (params?.threshold) {
    const cond = thresholdToCondition(params.threshold, eventMatch.thresholdParam);
    conditions = cond ? [cond] : [];
  } else {
    const rawConds = tpl?.conditions || ["event.matchesDescription == true"];
    conditions = rawConds.map((c) => ({
      natural: c,
      technical: c,
      needsEngineeringInput: false,
    }));
  }

  /* Tarefas: se veio chosenActions, elas definem a ordem exata; label
     default vem de kindOf. Sem chosenActions, usa o template ou o
     fallback determinístico. */
  let tasks;
  if (params?.chosenActions?.length) {
    tasks = params.chosenActions.map((kind) => ({
      label: kindOf(kind).label,
      kind,
      target: "agent",
    }));
  } else {
    const rawTasks = tpl?.tasks || [
      { label: "Diagnosticar ocorrência", kind: "diagnose" },
      { label: "Notificar operação", kind: "notify" },
    ];
    tasks = rawTasks.map((t) => ({ ...t, target: "agent" }));
  }

  return {
    _forEventId: eventMatch.id,
    name: eventMatch.label,
    trigger: (phrase && phrase.trim()) || eventMatch.label,
    conditions,
    tasks,
  };
}

/* Fluxo C — orquestrador. Chama `suggestPolicy` (LLM: categoria + nome) e
   `findSimilarPolicy` (LLM: alerta de política parecida) sem lógica
   própria de julgamento, e devolve um draft compatível com `applyDraft`
   (flat, com trigger/conditions/tasks) enriquecido com os metadados
   `_similarPolicyWarning` e `_pendingEventCatalog` do Fluxo C.

   A primeira regra vem sempre de `draftFor(phrase, eventMatch)` — política
   nunca nasce vazia. Se `eventMatch` for null, `pendingEventCatalog:
   true` marca a regra para triagem posterior do catálogo. Precisa receber
   `allPolicies` para o findSimilarPolicy (dependência que o LLM real
   receberia via prompt). */
function policyDraftFor(phrase, eventMatch, allPolicies, params) {
  const sugg = suggestPolicy(phrase, eventMatch);
  const nomePolitica = eventMatch?.proposedPolicy ?? sugg.nomePolitica;
  const categoria = eventMatch?.proposedCategory ?? sugg.categoria;
  const similar = findSimilarPolicy({ nomePolitica, categoria }, allPolicies || []);
  const primeiraRegra = draftFor(phrase, eventMatch, params);

  return {
    /* Campos consumidos por applyDraft (draft flat, retrocompatível): */
    _forEventId: eventMatch?.id || null,
    _similarPolicyWarning: similar.similarPolicyId
      ? `Isso é parecido com "${similar.similarPolicyId}" — quer mesmo separar, ou prefere adicionar como regra nova lá? (${similar.reason})`
      : null,
    _pendingEventCatalog: !eventMatch,
    policyName: nomePolitica,
    categoryId: categoria,
    name: eventMatch?.label ?? primeiraRegra.name,
    /* No caminho guiado (NEED_TREE), `phrase` chega como null — o gatilho
       vem então do próprio label do evento ou do trigger que o draftFor
       montou. `phrase?.trim()` evitava o TypeError, mas o fallback
       explícito deixa a intenção clara. */
    trigger: (phrase && phrase.trim()) || primeiraRegra.trigger || eventMatch?.label || "",
    conditions: primeiraRegra.conditions,
    tasks: primeiraRegra.tasks,
  };
}

/* Chips da chip-row — atalhos persistentes, cada um com intent mapeado.
   Digitar direto no composer já cobre o caminho por frase livre; o chip
   é o atalho para o caminho guiado (NEED_TREE), quando o operador não
   tem certeza do que precisa. */
const POLICY_CHIPS = [
  { icon: "sparkle", label: "Me guia com perguntas", intent: "policy-guided-tree" },
];

/* ── Vocabulário fechado de eventos técnicos ─────────────────────────────
   Lista FECHADA que o agente pode reconhecer a partir de uma frase do
   merchant. Cada evento aponta para regras já existentes que o cobrem
   (`existingRuleIds`) OU declara que ainda não há regra e sugere onde criar
   uma nova (`needsNewRule` + `proposedPolicy` + `proposedCategory`).
   O agente NUNCA inventa evento fora desta lista. */
/* Só eventos `needsNewRule: true` ganham `thresholdParam` e
   `suggestedActions`. Os que reaproveitam regra existente (1, 4, 10, e
   também o de estoque via LOG-005) não passam pela fase de parâmetros —
   a regra já está pronta no cluster. */
const EVENT_CATALOG = [
  { id: "details_viewed_pending_alert_sla", label: "Risco ou violação de SLA",
    existingRuleIds: ["MON-005", "LOG-003", "MON-003"] },
  { id: "details_viewed_pending_alert_stock", label: "Ruptura / inconsistência de estoque",
    existingRuleIds: ["LOG-005"] },
  { id: "details_viewed_pending_alert_avl_down", label: "Sistema de disponibilidade indisponível",
    needsNewRule: true, proposedPolicy: "Disponibilidade & Integrações", proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quanto tempo sem o sistema voltar isso deveria escalar?", unit: "duration" },
    suggestedActions: ["cancel", "notify", "escalate"] },
  { id: "change_status_mutation_error", label: "Pedido preso por falha de status",
    existingRuleIds: ["MON-001", "MON-002", "MON-003", "MON-004"] },
  { id: "cancel_order_mutation_error", label: "Cancelamento falhou (alto risco)",
    needsNewRule: true, proposedPolicy: "Alterações & Cancelamentos", proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quanto tempo sem confirmação do cancelamento isso deveria virar uma exceção?", unit: "duration" },
    suggestedActions: ["diagnose", "cancel", "notify", "workflow"] },
  { id: "notify_erp_mutation_error", label: "OMS e ERP fora de sincronia",
    needsNewRule: true, proposedPolicy: "Integrações Externas", proposedCategory: "exceptions",
    thresholdParam: { prompt: "Depois de quantas tentativas sem sucesso isso deveria virar risco?", unit: "count" },
    suggestedActions: ["workflow", "cancel", "reprocess", "escalate"] },
  { id: "edit_tracking_data_mutation_error", label: "Tracking inconsistente",
    needsNewRule: true, proposedPolicy: "Coleta & Transporte", proposedCategory: "logistics",
    thresholdParam: { prompt: "Depois de quanto tempo sem fonte de tracking válida isso deveria alertar o SAC?", unit: "duration" },
    suggestedActions: ["reprocess", "workflow", "notify"] },
  { id: "confirm_delivery_mutation_error", label: "Entrega não confirmada",
    needsNewRule: true, proposedPolicy: "Despacho & Entrega", proposedCategory: "logistics",
    thresholdParam: { prompt: "Depois de quanto tempo sem confirmação isso deveria destravar reembolso ou SLA?", unit: "duration" },
    suggestedActions: ["diagnose", "workflow"] },
  { id: "order_auth_callback_mutation_error", label: "Autorização de pagamento inconsistente",
    needsNewRule: true, proposedPolicy: "Pagamentos & Autorização", proposedCategory: "payment",
    thresholdParam: { prompt: "Depois de quanto tempo sem resposta do PSP isso deveria pausar o avanço?", unit: "duration" },
    suggestedActions: ["diagnose", "escalate", "cancel"] },
  { id: "update_task_status_mutation_error", label: "Fila operacional quebrada",
    existingRuleIds: ["LOG-001", "LOG-002"] },
];

/* Prompt de referência: é o que uma LLM real receberia para classificar a
   frase do merchant contra o EVENT_CATALOG. Fica versionado aqui como
   documentação — a implementação de produção substituiria `matchEvent` por
   uma chamada real usando este prompt (com `phrase` interpolada). */
const PROMPT_MATCH_EVENT = `
Você classifica uma frase de um merchant contra uma lista FECHADA de eventos técnicos.
Nunca invente um evento fora da lista. Se a frase puder corresponder a mais de um evento
com confiança parecida, ou a nenhum com confiança razoável, retorne eventId: null —
é mais seguro cair no fallback de "não entendi" do que adivinhar errado.

Eventos disponíveis:
${EVENT_CATALOG.map((e) => `- ${e.id}: ${e.label}`).join("\n")}

Frase do merchant: "\${phrase}"

Responda apenas com JSON, sem texto antes ou depois:
{
  "eventId": "<um dos ids acima, ou null>",
  "confidence": "alta" | "média" | "baixa"
}

Trate confidence "baixa" como equivalente a null no fluxo (conta como tentativa não resolvida).
`;

/* Sinônimos por evento — dicionário local para o matcher determinístico.
   Cada palavra/expressão pontua 1 se aparecer normalizada na frase. */
const EVENT_KEYWORDS = {
  details_viewed_pending_alert_sla: ["sla", "prazo", "atraso", "atrasado", "atrasada", "risco de entrega", "vai atrasar", "furar prazo"],
  details_viewed_pending_alert_stock: ["estoque", "ruptura", "sem estoque", "falta de estoque", "inventario", "nao encontrou item", "item nao encontrado"],
  details_viewed_pending_alert_avl_down: ["disponibilidade", "avl", "availability", "sistema fora", "sistema indisponivel", "servico caiu", "integracao caiu"],
  change_status_mutation_error: ["preso no status", "travado no status", "status nao muda", "change status", "mudanca de status", "falha de status", "pedido preso"],
  cancel_order_mutation_error: ["cancelamento falhou", "nao consegui cancelar", "cancel order", "erro ao cancelar", "cancelar falhou", "falha no cancelamento"],
  notify_erp_mutation_error: ["erp", "sap", "totvs", "oracle ebs", "fora de sincronia", "dessincronizado", "nao chegou no erp"],
  edit_tracking_data_mutation_error: ["tracking", "rastreio", "codigo de rastreio", "tracking inconsistente", "rastreamento errado", "atualizar tracking"],
  confirm_delivery_mutation_error: ["entrega nao confirmada", "confirm delivery", "cliente nao recebeu", "prova de entrega falhou", "pod falhou"],
  order_auth_callback_mutation_error: ["autorizacao", "auth callback", "callback do pagamento", "psp", "gateway retornou erro", "autorizacao inconsistente"],
  update_task_status_mutation_error: ["fila", "worker", "fila operacional", "task travada", "task presa", "update task status", "fila quebrada"],
};

/* Rascunhos default para eventos `needsNewRule` — usados ao propor uma regra
   nova via action card. Mantidos em um mapa separado para não poluir o
   catálogo semântico. Em produção, uma LLM geraria condições + tarefas
   dinamicamente a partir do contexto. */
const NEW_RULE_TEMPLATES = {
  details_viewed_pending_alert_avl_down: {
    conditions: ["availability.systemDown == true"],
    tasks: [
      { label: "Adiar tasks dependentes", kind: "replan" },
      { label: "Alternar para fallback de disponibilidade", kind: "reallocate" },
      { label: "Escalar para engenharia", kind: "escalate" },
    ],
  },
  cancel_order_mutation_error: {
    conditions: ["cancel.mutationError == true"],
    tasks: [
      { label: "Diagnosticar causa da falha", kind: "diagnose" },
      { label: "Reprocessar cancelamento com backoff", kind: "reprocess" },
      { label: "Escalar para SAC/Financeiro", kind: "escalate" },
    ],
  },
  notify_erp_mutation_error: {
    conditions: ["erp.syncStatus != \"ok\""],
    tasks: [
      { label: "Diagnosticar divergência OMS↔ERP", kind: "diagnose" },
      { label: "Reprocessar notificação ao ERP", kind: "reprocess" },
      { label: "Escalar integração", kind: "escalate" },
    ],
  },
  edit_tracking_data_mutation_error: {
    conditions: ["tracking.updateFailed == true"],
    tasks: [
      { label: "Revalidar dados de tracking", kind: "diagnose" },
      { label: "Reprocessar atualização", kind: "reprocess" },
      { label: "Notificar cliente", kind: "notify" },
    ],
  },
  confirm_delivery_mutation_error: {
    conditions: ["delivery.confirmationFailed == true"],
    tasks: [
      { label: "Coletar evidências de entrega", kind: "diagnose" },
      { label: "Reprocessar confirmação", kind: "reprocess" },
      { label: "Escalar para o carrier", kind: "escalate" },
    ],
  },
  order_auth_callback_mutation_error: {
    conditions: ["payment.authCallbackFailed == true"],
    tasks: [
      { label: "Reconciliar callback com PSP", kind: "diagnose" },
      { label: "Reautorizar pagamento", kind: "reprocess" },
      { label: "Escalar para o PSP", kind: "escalate" },
    ],
  },
};

/* Prompt de referência: pré-preenche threshold/ações antes de perguntar.
   Não infere — só extrai o que está EXPLÍCITO na frase. Serve para não
   duplicar perguntas quando o merchant já disse tudo em uma frase só. */
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

/* Sinônimos por kind — pequeno dicionário local para o extrator
   determinístico. Cobre a raiz do verbo em português para pegar
   conjugações comuns (imperativo, infinitivo, terceira pessoa). */
const KIND_PHRASE_KEYWORDS = {
  diagnose:   ["diagnostic", "investig", "apurar"],
  notify:     ["notific", "avis", "alert", "comunic"],
  reprocess:  ["reprocess", "tentar de novo", "retry"],
  replan:     ["replan", "reorden", "antecip", "priorizar"],
  reallocate: ["realoc", "reatribu", "trocar transportadora", "mudar transportadora"],
  refund:     ["reembols", "devolv"],
  cancel:     ["cancel"],
  escalate:   ["escal"],
  workflow:   ["workflow", "abrir task", "abrir tarefa", "exceção"],
};

/* Extrator determinístico: usa `parseThreshold` (para o valor) e o
   dicionário de keywords (para os kinds). Preserva a ORDEM em que os
   kinds aparecem na frase — respeita a intenção do merchant sem
   reordenar. Só devolve valores quando estão claros; senão, null.
   Em produção, substitua por chamada real ao LLM usando
   PROMPT_EXTRACT_PARAMS_FROM_PHRASE com `phrase` interpolada. */
function extractParamsFromPhrase(phrase, event) {
  const result = { threshold: null, chosenActions: null };
  if (!phrase || !event) return result;
  const n = norm(phrase);

  if (event.thresholdParam) {
    /* Reaproveita o parseThreshold: procura o primeiro match no meio
       da frase. `unit: "count"` aceita "N tentativas/vezes/itens…"; o
       resto cai em duration ("Xh", "X min", "Xd"). */
    if (event.thresholdParam.unit === "count") {
      const m = n.match(/(\d+)\s*(tentativ|vezes|itens|ocorr|falhas?)/);
      if (m) result.threshold = { value: parseInt(m[1], 10), unit: "count" };
    } else {
      const m = n.match(/(\d+)\s*(min|m\b|h\b|hora|horas|d\b|dia|dias)/);
      if (m) {
        const value = parseInt(m[1], 10);
        const unit = /^m(in)?$/.test(m[2]) ? "min" : /^d/.test(m[2]) ? "d" : "h";
        result.threshold = { value, unit };
      }
    }
  }

  if (event.suggestedActions?.length) {
    const hits = event.suggestedActions
      .map((kind) => {
        const kws = KIND_PHRASE_KEYWORDS[kind] || [];
        let pos = -1;
        for (const kw of kws) {
          const p = n.indexOf(norm(kw));
          if (p >= 0 && (pos < 0 || p < pos)) pos = p;
        }
        return pos >= 0 ? { kind, pos } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.pos - b.pos)
      .map((x) => x.kind);
    if (hits.length > 0) result.chosenActions = hits;
  }

  return result;
}

/* Heurística determinística de protótipo: normaliza a frase, pontua cada
   evento pelo número de sinônimos que casam, e devolve o evento com maior
   score — desde que passe do threshold e não empate com outro. Empate ou
   score baixo → null (equivalente a "confidence baixa" no PROMPT_MATCH_EVENT).
   Contrato: NUNCA inventa evento fora do EVENT_CATALOG.

   Em produção esta função seria substituída por uma chamada ao LLM usando
   `PROMPT_MATCH_EVENT` com a frase interpolada, obedecendo ao mesmo
   contrato: retornar `null` em vez de adivinhar. */
function matchEvent(phrase) {
  const n = norm(phrase);
  if (!n) return null;

  const scores = EVENT_CATALOG.map((event) => {
    const kws = EVENT_KEYWORDS[event.id] || [];
    let score = 0;
    for (const kw of kws) if (n.includes(norm(kw))) score += 1;
    if (n.includes(norm(event.label))) score += 2;
    return { event, score };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0];
  const runnerUp = scores[1];
  if (!top || top.score < 1) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.event;
}

/* ══ Verificação de conflito ══════════════════════════════════════════════
   DETERMINÍSTICO — sem LLM em nenhuma parte deste bloco. Conflito = outra
   regra ATIVA com o mesmo `sourceEventId` cujas tarefas divergem em kind.
   A tabela de divergência é fixa porque são só 9 tipos e as combinações
   que colidem são um conjunto pequeno e estável — não precisa de
   julgamento de modelo a cada chamada.
   Roda sempre, nos dois caminhos (guiado e não guiado), no momento exato
   em que o botão final seria "Aplicar" / "Criar regra" / "Ativar". */
const KIND_CONFLICTS = [
  ["cancel", "notify"], ["cancel", "reallocate"], ["cancel", "reprocess"],
  ["reallocate", "replan"],
];

function hasDivergentTaskKinds(tasksA, tasksB) {
  return tasksA.some((a) => tasksB.some((b) =>
    KIND_CONFLICTS.some(([x, y]) => (a.kind === x && b.kind === y) || (a.kind === y && b.kind === x))
  ));
}

/* ══ Fluxo C · Criação de política nova (extensão do Fluxo B) ═════════════
   Só cai aqui quando `matchExistingPolicy` não acha nada. Política nunca
   nasce vazia — sempre com a primeira regra dentro, já vinculada a um
   eventMatch (ou marcada `pendingEventCatalog: true`, se nenhum evento
   bateu). Em produção, `suggestPolicy` e `findSimilarPolicy` são chamadas
   de LLM independentes; o orquestrador é `policyDraftFor`. */
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

/* Heurística de protótipo: para cada categoria, um punhado de sinônimos.
   Sem eventMatch, escolhemos a categoria com maior sobreposição de tokens
   e usamos a própria frase (truncada) como nome. Em produção, substitua
   por chamada real ao LLM com PROMPT_SUGGEST_POLICY interpolado. */
const CATEGORY_KEYWORDS = {
  payment:     ["pagamento", "cobranca", "estorno", "cartao", "psp", "gateway", "autorizacao", "captura"],
  logistics:   ["transportadora", "coleta", "entrega", "carrier", "tracking", "rastreio", "sla", "prazo"],
  fulfillment: ["separacao", "picking", "packing", "estoque", "cd", "fulfillment", "invoice", "faturamento"],
  returns:     ["devolucao", "troca", "reembolso", "reverso", "return", "refund"],
  exceptions:  ["exceção", "excecao", "erro", "falha", "sistema", "integracao", "avl", "erp"],
};

function suggestPolicy(phrase, eventMatch) {
  if (eventMatch?.proposedPolicy && eventMatch?.proposedCategory) {
    return { categoria: eventMatch.proposedCategory, nomePolitica: eventMatch.proposedPolicy };
  }
  const n = norm(phrase);
  const scored = Object.entries(CATEGORY_KEYWORDS).map(([id, kws]) => {
    let s = 0;
    for (const kw of kws) if (n.includes(norm(kw))) s += 1;
    return { id, score: s };
  }).sort((a, b) => b.score - a.score);
  const categoria = scored[0].score > 0 ? scored[0].id : "exceptions";
  const nomePolitica = phrase.trim().replace(/^./, (c) => c.toUpperCase()).slice(0, 60);
  return { categoria, nomePolitica };
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

/* Heurística determinística: procura política existente na MESMA
   categoria cujo nome compartilhe ≥2 tokens ≥4 chars com o nome proposto.
   Nunca retorna cross-category. Em produção, substitua por LLM. */
function findSimilarPolicy(draft, allPolicies) {
  if (!draft?.nomePolitica || !draft?.categoria) return { similarPolicyId: null, reason: null };
  const proposedTokens = norm(draft.nomePolitica).split(/\s+/).filter((t) => t.length >= 4);
  if (proposedTokens.length === 0) return { similarPolicyId: null, reason: null };
  let best = null;
  for (const p of allPolicies) {
    if (p.category !== draft.categoria) continue;
    const hay = norm(p.name);
    const overlap = proposedTokens.filter((tok) => hay.includes(tok)).length;
    if (overlap >= 2 && (!best || overlap > best.overlap)) {
      best = { policy: p, overlap };
    }
  }
  if (!best) return { similarPolicyId: null, reason: null };
  return {
    similarPolicyId: best.policy.id,
    reason: `mesmo tema de "${best.policy.name}"`,
  };
}

/* ══ Árvore de necessidade — caminho guiado ═══════════════════════════════
   ESTÁTICO — não gerado por LLM. É o grafo fixo de perguntas e opções,
   mesmo shape de `verification.questions` do Canvas A/F. Cada opção aponta
   `next` (mais uma pergunta) ou entrega `eventId` / `existingRuleId` final.
   O caminho guiado por árvore convive com o caminho por frase livre
   (`awaitingEventPhrase`); entra por "Me guia com perguntas" (chip da
   chip-row) e por "Sim, me guia" (fallback de 3 tentativas do
   `handleFreeformRule`). O botão "Nova regra" do canvas e digitar direto
   no composer levam à frase livre. */
const NEED_TREE = {
  start: "n1",
  questions: {
    n1: {
      title: "O que está te incomodando na operação?",
      options: [
        { id: "atraso",       title: "Pedidos demorando ou parados",              next: "n1a" },
        { id: "pagamento",    title: "Pagamento com problema",                    eventId: "order_auth_callback_mutation_error" },
        { id: "cancelamento", title: "Cancelamento não funciona",                 eventId: "cancel_order_mutation_error" },
        { id: "estoque",      title: "Estoque ou separação com erro",             eventId: "details_viewed_pending_alert_stock" },
        { id: "entrega",      title: "Transporte, rastreio ou entrega",           next: "n1e" },
        { id: "sistema",      title: "Sistema fora do ar ou integração falhando", next: "n1f" },
      ],
    },
    n1a: {
      title: "O que você percebe primeiro?",
      options: [
        { id: "prazo",  title: "Prazo de entrega passando",             eventId: "details_viewed_pending_alert_sla" },
        { id: "status", title: "Status parado, sem avançar",            eventId: "change_status_mutation_error" },
        { id: "fila",   title: "Fila de tarefas travando outros pedidos", eventId: "update_task_status_mutation_error" },
      ],
    },
    n1e: {
      title: "O que exatamente?",
      options: [
        { id: "coleta",       title: "Transportadora não retira",              existingRuleId: "LOG-003" },
        { id: "tracking",     title: "Rastreio não bate com a realidade",      eventId: "edit_tracking_data_mutation_error" },
        { id: "confirmacao",  title: "Não sei se realmente chegou no cliente", eventId: "confirm_delivery_mutation_error" },
      ],
    },
    n1f: {
      title: "Onde?",
      options: [
        { id: "geral", title: "O sistema geral trava e bloqueia ações", eventId: "details_viewed_pending_alert_avl_down" },
        { id: "erp",   title: "É especificamente com o ERP",            eventId: "notify_erp_mutation_error" },
      ],
    },
  },
};

/* Prompt de referência: só roda quando o merchant digita em vez de clicar
   numa das opções. Se não bater com nenhuma opção com confiança razoável,
   retornar null — o app repete a pergunta com as opções em destaque,
   nunca adivinha. Versionado como documentação. */
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

/* Heurística determinística do protótipo — casamento exato do título (após
   normalização), ou sobreposição forte de tokens ≥4 chars com título/id.
   Empate ou score baixo → null; o chamador repete a pergunta.
   Em produção, substituir por chamada ao LLM usando PROMPT_MATCH_TREE_OPTION. */
function matchTreeOption(currentNode, freeTextAnswer) {
  const n = norm(freeTextAnswer);
  if (!n) return null;
  const exact = currentNode.options.find((o) => norm(o.title) === n || norm(o.id) === n);
  if (exact) return exact.id;
  const tokens = n.split(/\s+/).filter((t) => t.length >= 4);
  if (tokens.length === 0) return null;
  const scored = currentNode.options.map((o) => {
    const hay = norm(`${o.title} ${o.id}`);
    let s = 0;
    for (const tok of tokens) if (hay.includes(tok)) s += 1;
    return { option: o, score: s };
  }).sort((a, b) => b.score - a.score);
  const top = scored[0];
  const runnerUp = scored[1];
  if (!top || top.score < 1) return null;
  if (runnerUp && runnerUp.score === top.score) return null;
  return top.option.id;
}

/* ── View ───────────────────────────────────────────────────────────────── */
function WorkflowPoliciesView() {
  const [policies, setPolicies] = useState(() => {
    /* Backfill de `sourceEventId` a partir do EVENT_CATALOG: cada evento
       com `existingRuleIds` declara quais regras seed pertencem ao seu
       cluster. É o que permite `runConflictCheck` comparar regras do
       mesmo evento sem depender de um campo que os dados seed ainda não
       carregam. `priority` começa null (nenhuma ordem declarada). */
    const ruleToEvent = {};
    const eventLabelById = {};
    EVENT_CATALOG.forEach((e) => {
      eventLabelById[e.id] = e.label;
      (e.existingRuleIds || []).forEach((rid) => { ruleToEvent[rid] = e.id; });
    });
    /* Upgrade do schema em memória:
       - `conditions`: strings do seed viram `{natural, technical, needsEngineeringInput:false}`;
         drafts ricos já são preservados como estão.
       - `sourceEventLabel`: lookup no EVENT_CATALOG a partir do sourceEventId.
       O schema persistido no seed permanece inalterado; só o estado
       runtime do componente carrega o formato rico. */
    return AIWData.workflowPolicies.map((p) => ({
      ...p,
      rules: p.rules.map((r) => {
        const sourceEventId = r.sourceEventId || ruleToEvent[r.id] || null;
        const richConds = (r.conditions || []).map((c) => (typeof c === "string"
          ? { natural: c, technical: c, needsEngineeringInput: false }
          : { natural: c.natural, technical: c.technical ?? null, needsEngineeringInput: !!c.needsEngineeringInput }));
        return {
          ...r,
          conditions: richConds,
          sourceEventId,
          sourceEventLabel: r.sourceEventLabel || (sourceEventId ? eventLabelById[sourceEventId] : null) || null,
          priority: r.priority ?? null,
        };
      }),
    }));
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [highlightId, setHighlightId] = useState(null);

  const [chatMsgs, setChatMsgs] = useState([
    { from: "agent", text: "Oi! Eu cuido das políticas do seu agente de pedido. Pode me pedir direto, do seu jeito — *“quando a transportadora não coletar, aciona ela e avisa o cliente”* — ou, se não tiver certeza do que precisa, eu te ajudo a encontrar isso com algumas perguntas." },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  /* Flag do fluxo "Criar regra a partir de uma frase": quando o agente já
     pediu a frase, a próxima mensagem do operador é encaminhada ao
     matchEvent em vez do parser genérico. */
  const [awaitingEventPhrase, setAwaitingEventPhrase] = useState(false);
  /* Caminho não guiado: conta frases seguidas sem eventMatch (contra os 10
     do EVENT_CATALOG). Zera ao aplicar uma regra ou ao entrar no caminho
     guiado; ao chegar em 3, o agente oferece as perguntas guiadas. */
  const [unmatchedAttempts, setUnmatchedAttempts] = useState(0);
  /* Modo guiado por árvore (NEED_TREE). `guidedNode` é o id do nó atual;
     `answerTrail` é a trilha de perguntas/respostas até aqui, usada para
     montar a recapitulação final ("Como chegamos aqui") e para navegar
     de volta a partir do card final. Coexiste com `awaitingEventPhrase`
     (modo frase livre) — só um dos dois fica ativo por vez. */
  const [guidedNode, setGuidedNode] = useState(null);
  const [answerTrail, setAnswerTrail] = useState([]);
  /* Fluxo de parâmetros da regra (entre o fim da árvore e a recapitulação).
     Só ativa quando o leaf da árvore aponta um eventId — nunca quando
     aponta um existingRuleId direto. Máquina de estado com duas fases
     fixas: `threshold` (opcional, só se o evento tem thresholdParam) e
     `actions` (sempre). `ordered` é a sequência de kinds tocados na
     ordem de execução — o merchant pode remover o último. */
  const [paramFlow, setParamFlow] = useState(null);
  /* { event, trail, phase: "threshold" | "actions", answers, ordered } */
  const composerRef = useRef(null);

  const agentSay = useCallback((msgs) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMsgs((m) => [...m, ...(Array.isArray(msgs) ? msgs : [msgs])]);
    }, 500);
  }, []);

  const selected = useMemo(() => {
    for (const p of policies) {
      const r = p.rules.find((x) => x.id === selectedRuleId);
      if (r) return { rule: r, policy: p };
    }
    return null;
  }, [policies, selectedRuleId]);

  const toggleRule = (policyId, ruleId) => {
    setPolicies((ps) => ps.map((p) => p.id !== policyId ? p : {
      ...p,
      rules: p.rules.map((r) => r.id !== ruleId ? r : { ...r, active: !r.active }),
    }));
  };

  /* Numeração da regra nova: próximo livre na família de id da categoria. */
  const nextRuleId = (prefix) => {
    const used = policies.flatMap((p) => p.rules)
      .map((r) => r.id.startsWith(prefix + "-") ? parseInt(r.id.slice(prefix.length + 1), 10) : 0)
      .filter((n) => !isNaN(n));
    const next = Math.max(0, ...used) + 1;
    return `${prefix}-${String(next).padStart(3, "0")}`;
  };

  const applyDraft = (draft) => {
    /* Draft pode chegar de dois caminhos:
       - Frase livre → `draftFor` devolve `policyId` casando com política real.
       - Fluxo do EVENT_CATALOG (needsNewRule) → devolve `policyName` +
         `categoryId`; se não houver política com esse nome, criamos uma
         nova on-the-fly na categoria proposta. */
    let policy;
    if (draft.policyId) {
      policy = policies.find((p) => p.id === draft.policyId) || policies[0];
    } else {
      policy = policies.find((p) => p.name === draft.policyName)
        || { id: `pol-${norm(draft.policyName).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
             category: draft.categoryId, name: draft.policyName, rules: [], _new: true };
    }
    const id = nextRuleId(categoryOf(policy.category).rulePrefix);
    /* Persiste no formato rico do PROMPT_DRAFT_RULE:
       - `conditions`: sempre `{natural, technical, needsEngineeringInput}`,
         mesmo quando o draft veio com strings (RULE_DRAFTS/templates).
       - `tasks`: mantém `target` quando presente (Agente/SAC/Supervisor). */
    const normalizedConditions = draft.conditions.map((c) => (typeof c === "string"
      ? { natural: c, technical: c, needsEngineeringInput: false }
      : { natural: c.natural, technical: c.technical ?? null, needsEngineeringInput: !!c.needsEngineeringInput }));
    const normalizedTasks = draft.tasks.map((t) => ({
      label: t.label,
      kind: t.kind,
      ...(t.target ? { target: t.target } : {}),
    }));
    const sourceEventId = draft._forEventId || null;
    const sourceEventLabel = sourceEventId
      ? (EVENT_CATALOG.find((e) => e.id === sourceEventId)?.label || null)
      : null;
    const rule = {
      id,
      name: draft.name,
      trigger: draft.trigger,
      conditions: normalizedConditions,
      tasks: normalizedTasks,
      active: true,
      sourceEventId,
      sourceEventLabel,
      priority: draft.priority ?? null,
      /* Fluxo C: sem evento reconhecido no catálogo → a regra fica
         marcada para triagem posterior; o resto da UI trata igual. */
      pendingEventCatalog: !!draft._pendingEventCatalog,
    };
    setPolicies((ps) => {
      const exists = ps.some((p) => p.id === policy.id);
      if (!exists) return [...ps, { ...policy, rules: [rule] }];
      return ps.map((p) => p.id !== policy.id ? p : { ...p, rules: [...p.rules, rule] });
    });
    /* Filtros voltam ao estado em que a regra nova é visível, senão o scroll
       do canvas cairia numa linha que não está montada. */
    setQuery("");
    setStatus("all");
    setCategory(policy.category);
    setHighlightId(id);
    setSelectedRuleId(id);
    setUnmatchedAttempts(0);
    setGuidedNode(null);
    setAnswerTrail([]);
    agentSay({
      from: "agent",
      text: `Pronto — **${id} · ${rule.name}** entrou na política **${policy.name}** e já está ativa. Vale só para ocorrências novas.`,
      quickReplies: ["Desligar por enquanto", "Criar outra regra"],
    });
  };

  /* ── Prioridade entre regras do mesmo evento ────────────────────────
     `priority` na regra: null = sem ordem declarada (uma só ativa, ou
     "manter as duas"). number = ordem de execução dentro do cluster do
     mesmo `sourceEventId`; menor executa primeiro. As tarefas da regra
     de priority maior que resolvem a mesma causa raiz fecham como
     "Encerrada por cascata" (estado terminal da Tarefa já existente). */
  const setPriority = (ruleId, sourceEventId, value) => {
    setPolicies((ps) => ps.map((p) => ({
      ...p,
      rules: p.rules.map((r) => {
        if (r.id !== ruleId) return r;
        if (sourceEventId && r.sourceEventId !== sourceEventId) return r;
        return { ...r, priority: value };
      }),
    })));
  };

  const rulesSharingEvent = (sourceEventId) =>
    policies.flatMap((p) => p.rules.filter((r) => r.sourceEventId === sourceEventId));

  const reorderCluster = (sourceEventId, orderedRuleIds) => {
    orderedRuleIds.forEach((ruleId, idx) => setPriority(ruleId, sourceEventId, idx + 1));
  };

  /* ── Verificação de conflito ─────────────────────────────────────────
     Roda no momento exato do "Aplicar" final. Se houver regra ativa no
     mesmo `sourceEventId` com kind divergente (KIND_CONFLICTS), mostra
     um card com 4 ramos fixos; senão, prossegue direto com `onProceed`.
     `onProceed` é o callback que efetivamente persiste (applyDraft ou,
     no caso guiado do kind "existing", a ativação da regra existente). */
  const runConflictCheck = (draft, onProceed) => {
    const sourceEventId = draft._forEventId || draft.sourceEventId || null;
    if (!sourceEventId) return onProceed();

    const conflicting = policies
      .flatMap((p) => p.rules.map((r) => ({ ...r, policyName: p.name })))
      .filter((r) => r.active
                  && r.sourceEventId === sourceEventId
                  && r.id !== draft.id
                  && hasDivergentTaskKinds(r.tasks, draft.tasks));

    if (conflicting.length === 0) return onProceed();

    const existing = conflicting[0];
    agentSay({
      from: "agent",
      type: "action",
      title: "Essa regra pode conflitar com outra já ativa",
      heading: `${existing.id} · ${existing.name}`,
      fields: [
        { label: "Política onde já está", value: existing.policyName },
        { label: "O que ela faz hoje", value: existing.tasks.map((t) => t.label).join(" · ") },
        { label: "O que a nova regra faria", value: draft.tasks.map((t) => t.label).join(" · ") },
      ],
      options: [
        { label: "Manter as duas ativas",
          action: () => resolveConflict(draft, existing, "keep-both", onProceed) },
        { label: `Despriorizar ${existing.id}`,
          action: () => resolveConflict(draft, existing, "deprioritize-existing", onProceed) },
        { label: "Repriorizar — a nova assume na frente",
          action: () => resolveConflict(draft, existing, "reprioritize-new-first", onProceed) },
        { label: "Cancelar e ajustar a regra",
          action: () => agentSay({ from: "agent", text: "Ok — ajuste a descrição e me mande de novo, ou revise as tarefas." }) },
      ],
    });
  };

  /* Três ramos fixos, um por opção do card. `onProceed` é o callback que
     persiste (applyDraft). O id da regra nova é previsto por `nextRuleId`
     — que é puro sobre `policies` — antes de chamar onProceed; como o
     setPolicies do applyDraft e os setPolicies do setPriority usam
     updater funcional, os updates encadeiam sem race condition. */
  const resolveConflict = (draft, existing, decision, onProceed) => {
    const eid = existing.sourceEventId;
    if (decision === "keep-both") {
      setPriority(existing.id, eid, null);
      onProceed();
      return;
    }

    const targetPolicy = draft.policyId
      ? policies.find((p) => p.id === draft.policyId)
      : policies.find((p) => p.name === draft.policyName);
    const cat = targetPolicy ? categoryOf(targetPolicy.category) : categoryOf(draft.categoryId);
    const predictedNewId = nextRuleId(cat.rulePrefix);
    const clusterOthers = rulesSharingEvent(eid)
      .filter((r) => r.id !== existing.id && r.id !== predictedNewId)
      .map((r) => r.id);

    onProceed();
    if (decision === "deprioritize-existing") {
      reorderCluster(eid, [predictedNewId, existing.id, ...clusterOthers]);
    } else if (decision === "reprioritize-new-first") {
      reorderCluster(eid, [predictedNewId, ...clusterOthers, existing.id]);
    }
  };

  /* Freeform: `policyMatch` casou com uma regra existente do cluster.
     A regra já está pronta — sem params, sem draft; só ofereço ativar/
     abrir. Passa pelo runConflictCheck se estiver sendo ativada agora
     (mesmo tratamento do modo guiado kind "existing"). */
  const proposeExistingRuleCard = (existingRuleId, eventMatch) => {
    let target = null;
    for (const p of policies) {
      const r = p.rules.find((x) => x.id === existingRuleId);
      if (r) { target = { rule: r, policy: p }; break; }
    }
    if (!target) {
      /* Terminal defensivo: o EVENT_CATALOG aponta pra uma regra que não
         está seedada neste ambiente. Sem review pra oferecer, mas garante
         uma saída — nunca deixa o merchant parado. */
      agentSay({
        from: "agent",
        text: `Detectei o evento **${eventMatch.label}**, mas a regra **${existingRuleId}** não está neste ambiente. Quer descrever de outro jeito?`,
        quickReplies: ["Me guia com perguntas", "Cancelar"],
      });
      return;
    }
    const { rule, policy } = target;
    agentSay({
      from: "agent",
      text: `Entendi como **${eventMatch.label}**. Isso já é coberto por uma regra existente — nada a criar:`,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Regra existente",
      heading: `Isso já está coberto: ${rule.id}`,
      summary: `${rule.name}, na política ${policy.name}. ${rule.trigger}`,
      fields: [
        { group: "policy", label: "Categoria", value: categoryOf(policy.category).label, categoryId: policy.category },
        { group: "policy", label: "Política",  value: policy.name },
        { group: "policy", label: "Gatilho",   value: rule.trigger },
        { group: "policy", label: "Se",        value: rule.conditions.map((c) => (typeof c === "string" ? c : c.natural)).join(" · ") },
        { group: "policy", label: "Então",     values: rule.tasks.map((t) => t.label) },
      ],
      applyLabel: rule.active ? "Abrir no canvas" : "Ativar e abrir no canvas",
      onApply: () => {
        const proceed = () => {
          if (!rule.active) toggleRule(policy.id, rule.id);
          setCategory(policy.category);
          setStatus("all");
          setQuery("");
          setHighlightId(rule.id);
          setSelectedRuleId(rule.id);
          agentSay({ from: "agent", text: `Abri **${rule.id} · ${rule.name}** no canvas${!rule.active ? " e ativei" : ""}.` });
        };
        if (rule.active) return proceed();
        runConflictCheck(
          { id: rule.id, _forEventId: rule.sourceEventId, tasks: rule.tasks },
          proceed,
        );
      },
      onDismiss: () => agentSay({ from: "agent", text: "Ok — descartado. Se quiser, descreva o evento de outro jeito." }),
    });
  };

  /* Monta o action card de uma proposta de regra vinculada a uma política
     existente (Fluxo B — "variante nova em evento já coberto"). Usa o
     shape 3c da família para ficar consistente com o caminho guiado. */
  const proposeRuleDraftCard = (draft, eventMatch, targetRuleId) => {
    const targetPolicy = policies.find((p) => p.rules.some((r) => r.id === targetRuleId)) || policies[0];
    const condsLine = draft.conditions
      .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
      .join(" · ");
    agentSay({
      from: "agent",
      text: `Entendi como **${eventMatch.label}**. Já existe cobertura próxima em **${targetRuleId}** (política *${targetPolicy.name}*), mas o caso que você descreve tem uma causa raiz diferente. Montei uma regra irmã:`,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Nova regra",
      heading: draft.name,
      summary: `${draft.name}, na política ${targetPolicy.name}. ${draft.trigger || eventMatch.label}`,
      fields: [
        { group: "policy", label: "Categoria", value: categoryOf(targetPolicy.category).label, categoryId: targetPolicy.category },
        { group: "policy", label: "Política",  value: targetPolicy.name },
        { group: "policy", label: "Gatilho",   value: draft.trigger || eventMatch.label },
        { group: "policy", label: "Se",        value: condsLine },
        { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
      ],
      applyLabel: "Abrir no canvas",
      onApply: () => runConflictCheck(
        { ...draft, policyId: targetPolicy.id },
        () => applyDraft({ ...draft, policyId: targetPolicy.id }),
      ),
    });
  };

  /* Fluxo C — evento sem regra que sirva; a proposta cria política nova
     (ou reaproveita uma já existente pelo nome). Também no shape 3c. */
  const proposePolicyDraftCard = (draft, eventMatch) => {
    const condsLine = draft.conditions
      .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
      .join(" · ");
    const fields = [
      { group: "policy", label: "Categoria", value: categoryOf(draft.categoryId).label, categoryId: draft.categoryId },
      { group: "policy", label: "Política",  value: draft.policyName },
      { group: "policy", label: "Gatilho",   value: draft.trigger || eventMatch.label },
      { group: "policy", label: "Se",        value: condsLine },
      { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
    ];
    /* Warning de política parecida (findSimilarPolicy) vai como um campo
       extra no topo do card — o merchant lê antes de decidir criar. */
    if (draft._similarPolicyWarning) {
      fields.unshift({ group: "policy", label: "Atenção", value: draft._similarPolicyWarning });
    }
    agentSay({
      from: "agent",
      text: `Entendi como **${eventMatch.label}**. Ainda não há regra que cubra esse evento — montei esta proposta:`,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Nova regra",
      heading: draft.name,
      summary: `${draft.name}, na política ${draft.policyName}. ${draft.trigger || eventMatch.label}`,
      fields,
      applyLabel: "Abrir no canvas",
      onApply: () => runConflictCheck(draft, () => applyDraft(draft)),
    });
  };

  /* Caminho não guiado: o operador digita direto na chat, sem passar pelo
     chip. Cada frase é classificada por matchEvent; se falhar 3 vezes
     seguidas, o agente oferece o caminho guiado. Se casar, seguimos para
     matchExistingPolicy (Fluxo B — variante em evento coberto) ou
     policyDraftFor (Fluxo C — nova política). */
  const handleFreeformRule = (phrase) => {
    const eventMatch = matchEvent(phrase);
    if (!eventMatch) {
      const next = unmatchedAttempts + 1;
      setUnmatchedAttempts(next);
      if (next >= 3) {
        agentSay({
          from: "agent",
          text: "Ainda não consegui identificar um evento específico a partir do que você descreveu. Quer que eu te ajude com algumas perguntas?",
          quickReplies: ["Sim, me guia", "Deixa eu tentar de novo", "Cancelar"],
        });
        return;
      }
      agentSay({
        from: "agent",
        text: "Não achei um evento correspondente. Pode descrever de outro jeito — o que o OMS deveria notar, e o que fazer a seguir?",
      });
      return;
    }
    setUnmatchedAttempts(0);

    const ids = eventMatch.existingRuleIds || [];
    const policyMatch = ids.length > 1
      ? matchExistingPolicy(phrase, eventMatch, policies)
      : ids[0] || null;

    if (policyMatch) {
      /* Regra já existe — nada pra perguntar, o conteúdo já está fechado. */
      proposeExistingRuleCard(policyMatch, eventMatch);
      return;
    }

    /* Mesmo ponto de decisão do caminho guiado (resolveTreeLeaf): evento
       sem regra existente que sirva = precisa de parâmetros antes de
       gerar qualquer coisa. Vale para needsNewRule e para variante em
       cluster (matchExistingPolicy retornou null).
       Antes de perguntar, `extractParamsFromPhrase` tenta pré-preencher
       threshold/ações que já estão explícitos na frase — o merchant só
       responde o que faltar. */
    askRuleParameters(eventMatch, (answers) => {
      /* Caminho não guiado: draft leva a phrase original como trigger
         base. Sister (variante em cluster) ou new (needsNewRule /
         cluster sem match) decide o card. */
      const ids = eventMatch.existingRuleIds || [];
      if (ids.length > 0) {
        const anchor = ids[0];
        proposeRuleDraftCard(draftFor(phrase, eventMatch, answers), eventMatch, anchor);
      } else {
        proposePolicyDraftCard(policyDraftFor(phrase, eventMatch, policies, answers), eventMatch);
      }
    }, extractParamsFromPhrase(phrase, eventMatch));
  };

  /* ── Modo guiado por árvore ───────────────────────────────────────────
     Pergunta corrente é enviada como uma mensagem do agente com
     `quickReplies` = títulos das opções. O clique num quick reply reenvia
     o próprio título como texto do usuário; `handleSend` intercepta pelo
     `guidedNode` e resolve o id. Se o merchant digitar em vez de clicar,
     `matchTreeOption` heurístico tenta mapear; sem confiança → repete a
     pergunta com as opções em destaque, nunca adivinha. */
  const askTreeNode = (nodeId) => {
    const node = NEED_TREE.questions[nodeId];
    if (!node) return;
    agentSay({
      from: "agent",
      text: node.title,
      quickReplies: node.options.map((o) => o.title),
    });
  };

  const startGuidedTree = () => {
    setUnmatchedAttempts(0);
    setAwaitingEventPhrase(false);
    setAnswerTrail([]);
    setGuidedNode(NEED_TREE.start);
    askTreeNode(NEED_TREE.start);
  };

  /* Resolve o desfecho de uma opção terminal — regra existente ativável
     ou evento que puxa um rascunho (via draftFor / policyDraftFor). */
  const resolveGuidedEnd = (option) => {
    if (option.existingRuleId) {
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === option.existingRuleId);
        if (r) return { kind: "existing", rule: r, policy: p };
      }
      return null;
    }
    if (option.eventId) {
      const event = EVENT_CATALOG.find((e) => e.id === option.eventId);
      if (!event) return null;
      const ids = event.existingRuleIds || [];
      if (ids.length > 0) {
        const anchor = ids[0];
        const anchorPolicy = policies.find((p) => p.rules.some((r) => r.id === anchor));
        return {
          kind: "sister",
          event,
          targetRuleId: anchor,
          targetPolicy: anchorPolicy || policies[0],
          draft: draftFor(event.label, event),
        };
      }
      return { kind: "new", event, draft: policyDraftFor(event.label, event, policies) };
    }
    return null;
  };

  /* Recap final da árvore — reaproveita o action card no formato 3c da
     família (Como chegamos aqui). `trail` sai como objeto bruto: pergunta
     como caption, resposta como corpo. `Então` sai como array de strings,
     uma ação por linha. `renderResolvedSummary` recebe o `resolved` pronto
     (usado pelo Fluxo de parâmetros após askRuleParameters); ao clicar em
     "Editar regra" volta ao nó anterior da árvore. */
  const renderResolvedSummary = (trail, resolved) => {
    if (!resolved) {
      agentSay({ from: "agent", text: "Não consegui resolver essa combinação — pode tentar de novo?" });
      return;
    }
    const previousNodeId = trail.length > 1 ? trail[trail.length - 2].nodeId : NEED_TREE.start;
    const onEdit = () => {
      /* Reabre a árvore no nó anterior — trilha volta um passo. Reaproveita
         o antigo onBack (reopenDraft no spec) para o botão "Editar regra". */
      const newTrail = trail.slice(0, -1);
      setAnswerTrail(newTrail);
      setGuidedNode(previousNodeId);
      askTreeNode(previousNodeId);
    };

    if (resolved.kind === "existing") {
      const { rule, policy } = resolved;
      agentSay({
        from: "agent",
        text: "Cheguei numa cobertura que já existe. Quer ativá-la?",
        type: "action",
        title: "Como chegamos aqui",
        badge: "Regra existente",
        heading: `Isso já está coberto: ${rule.id}`,
        summary: `${rule.name}, na política ${policy.name}. ${rule.trigger}`,
        trail,
        fields: [
          { group: "policy", label: "Categoria", value: categoryOf(policy.category).label, categoryId: policy.category },
          { group: "policy", label: "Política",  value: policy.name },
          { group: "policy", label: "Gatilho",   value: rule.trigger },
          { group: "policy", label: "Se",        value: rule.conditions.map((c) => (typeof c === "string" ? c : c.natural)).join(" · ") },
          { group: "policy", label: "Então",     values: rule.tasks.map((t) => t.label) },
        ],
        applyLabel: rule.active ? "Abrir no canvas" : "Ativar e abrir no canvas",
        onApply: () => {
          const proceed = () => {
            if (!rule.active) toggleRule(policy.id, rule.id);
            setCategory(policy.category);
            setStatus("all");
            setQuery("");
            setHighlightId(rule.id);
            setSelectedRuleId(rule.id);
            setGuidedNode(null);
            setAnswerTrail([]);
            agentSay({ from: "agent", text: `Abri **${rule.id} · ${rule.name}** no canvas${!rule.active ? " e ativei" : ""}.` });
          };
          /* Se a regra já está ativa, é só abrir — sem chance nova de
             conflito. Se está sendo ativada agora, o check compara suas
             tarefas contra as demais regras ativas do mesmo evento. */
          if (rule.active) return proceed();
          runConflictCheck(
            { id: rule.id, _forEventId: rule.sourceEventId, tasks: rule.tasks },
            proceed,
          );
        },
        /* Regra existente não tem rascunho pra editar — botão não renderiza. */
        onEdit: null,
      });
      return;
    }

    if (resolved.kind === "sister") {
      const { event, targetPolicy, targetRuleId, draft } = resolved;
      const condsLine = draft.conditions
        .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
        .join(" · ");
      agentSay({
        from: "agent",
        text: `Cheguei em **${event.label}**. Já existe cobertura próxima em **${targetRuleId}** — proponho uma regra irmã:`,
        type: "action",
        title: "Como chegamos aqui",
        badge: "Nova regra",
        heading: draft.name,
        summary: `${draft.name}, na política ${targetPolicy.name}. ${draft.trigger || event.label}`,
        trail,
        fields: [
          { group: "policy", label: "Categoria", value: categoryOf(targetPolicy.category).label, categoryId: targetPolicy.category },
          { group: "policy", label: "Política",  value: targetPolicy.name },
          { group: "policy", label: "Gatilho",   value: draft.trigger || event.label },
          { group: "policy", label: "Se",        value: condsLine },
          { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
        ],
        applyLabel: "Abrir no canvas",
        onApply: () => {
          const merged = { ...draft, policyId: targetPolicy.id };
          runConflictCheck(merged, () => {
            applyDraft(merged);
            setGuidedNode(null);
            setAnswerTrail([]);
          });
        },
        onEdit,
      });
      return;
    }

    // kind === "new"
    const { event, draft } = resolved;
    const condsLine = draft.conditions
      .map((c) => (typeof c === "string" ? c : c.natural + (c.needsEngineeringInput ? " (mapeamento técnico pendente)" : "")))
      .join(" · ");
    const newFields = [
      { group: "policy", label: "Categoria", value: categoryOf(draft.categoryId).label, categoryId: draft.categoryId },
      { group: "policy", label: "Política",  value: draft.policyName },
      { group: "policy", label: "Gatilho",   value: draft.trigger || event.label },
      { group: "policy", label: "Se",        value: condsLine },
      { group: "policy", label: "Então",     values: draft.tasks.map((t) => t.label) },
    ];
    if (draft._similarPolicyWarning) {
      newFields.splice(1, 0, { group: "policy", label: "Atenção", value: draft._similarPolicyWarning });
    }
    agentSay({
      from: "agent",
      text: `Cheguei em **${event.label}**. Ainda não há regra que cubra esse evento — proposta abaixo:`,
      type: "action",
      title: "Como chegamos aqui",
      badge: "Nova regra",
      heading: draft.name,
      summary: `${draft.name}, na política ${draft.policyName}. ${draft.trigger || event.label}`,
      trail,
      fields: newFields,
      applyLabel: "Abrir no canvas",
      onApply: () => runConflictCheck(draft, () => {
        applyDraft(draft);
        setGuidedNode(null);
        setAnswerTrail([]);
      }),
      onEdit,
    });
  };

  /* ── Fluxo de parâmetros da regra (entre a árvore e a recap) ──────────
     Só roda quando o nó final é um eventId. Antes deste fluxo, `draftFor`
     inventava threshold e ações sem confirmar — agora o merchant escolhe
     os dois antes da LLM (ou do stub determinístico) escrever a regra. */
  const askThresholdQuestion = (event) => {
    const tp = event.thresholdParam;
    /* Sem quickReplies: o thresholdParam do spec só carrega prompt+unit,
       o merchant digita livre ("4h", "30 min", "3 tentativas"). O parser
       determinístico (parseThreshold) valida o formato. */
    agentSay({
      from: "agent",
      text: tp.prompt,
    });
  };

  const askActionsQuestion = (event, ordered) => {
    const remaining = event.suggestedActions.filter((k) => !ordered.includes(k));
    const orderedLine = ordered.length
      ? "Ordem atual: " + ordered.map((k, i) => `${i + 1}. ${kindOf(k).label}`).join(" → ")
      : "Ainda sem nenhuma ação — comece pela primeira.";
    const controls = [
      ...(ordered.length > 0 ? ["Concluir"] : []),
      ...(ordered.length > 0 ? ["Remover última"] : []),
    ];
    agentSay({
      from: "agent",
      text: `${orderedLine}\n\nO que você quer que o agente faça quando isso acontecer? Toque na ordem em que devem rodar.`,
      quickReplies: [
        ...remaining.map((k) => kindOf(k).label),
        ...controls,
      ],
    });
  };

  /* `onComplete(answers)` é o desfecho — o caller decide o que fazer
     com { threshold, chosenActions }. `prefilled` traz o que já foi
     respondido implicitamente (ex.: extractParamsFromPhrase no freeform).
     Guardas do spec:
       `answers.threshold || !eventMatch.thresholdParam` → não pergunta.
       `answers.chosenActions` → não pergunta. */
  const askRuleParameters = (event, onComplete, prefilled = {}) => {
    const hasThreshold = !!event.thresholdParam;
    const hasActions = !!(event.suggestedActions && event.suggestedActions.length);
    const preThreshold = prefilled.threshold || null;
    const preActions = prefilled.chosenActions && prefilled.chosenActions.length
      ? prefilled.chosenActions
      : null;

    const needThreshold = hasThreshold && !preThreshold;
    const needActions = hasActions && !preActions;

    if (!needThreshold && !needActions) {
      const answers = {};
      if (preThreshold) answers.threshold = preThreshold;
      if (preActions) answers.chosenActions = preActions;
      onComplete(answers);
      return;
    }

    /* Se só falta o threshold (actions extraídas), guardamos as ações
       pré-preenchidas em `ordered` e marcamos `skipActionsWhenDone`
       para invocar `onComplete` assim que o threshold chegar. */
    const startPhase = needThreshold ? "threshold" : "actions";
    const initialAnswers = preThreshold ? { threshold: preThreshold } : {};
    const initialOrdered = !needActions ? preActions : [];
    setParamFlow({
      event, onComplete, phase: startPhase,
      answers: initialAnswers,
      ordered: initialOrdered,
      skipActionsWhenDone: needThreshold && !needActions,
    });
    if (needThreshold) askThresholdQuestion(event);
    else askActionsQuestion(event, initialOrdered);
  };

  /* Dispatcher do leaf da árvore — três caminhos:
     - `existingRuleId` (pointer direto na árvore) → recap direto, kind
       "existing".
     - `eventId` com `existingRuleIds` no catálogo → a regra já está
       pronta no cluster: reaproveita a primeira, sem passar por
       parâmetros. Kind "existing".
     - `eventId` com `needsNewRule` → coleta threshold + ações antes de
       montar o draft (Fluxo de parâmetros). */
  const resolveTreeLeaf = (leaf, trail) => {
    if (leaf.existingRuleId) {
      renderResolvedSummary(trail, resolveGuidedEnd(leaf));
      return;
    }
    if (leaf.eventId) {
      const event = EVENT_CATALOG.find((e) => e.id === leaf.eventId);
      if (!event) {
        /* Terminal defensivo: o leaf da árvore apontou pra um eventId que
           não existe mais no catálogo. Oferece os dois caminhos de recuperação
           conhecidos para que o merchant nunca fique parado. */
        agentSay({
          from: "agent",
          text: "Não consegui encontrar esse evento no catálogo atual — vamos por outro caminho?",
          quickReplies: ["Me guia com perguntas", "Cancelar"],
        });
        return;
      }
      const ids = event.existingRuleIds || [];
      if (ids.length > 0) {
        renderResolvedSummary(trail, resolveGuidedEnd({ existingRuleId: ids[0] }));
        return;
      }
      askRuleParameters(event, (answers) => {
        /* No caminho guiado, o desfecho é a recap com trilha. Se o
           evento tem existingRuleIds (dead branch pelo resolveTreeLeaf
           atual, mantido para segurança), monta sister; senão, new. */
        const ids = event.existingRuleIds || [];
        let resolved;
        if (ids.length > 0) {
          const anchor = ids[0];
          const anchorPolicy = policies.find((p) => p.rules.some((r) => r.id === anchor));
          resolved = {
            kind: "sister", event, targetRuleId: anchor,
            targetPolicy: anchorPolicy || policies[0],
            draft: draftFor(null, event, answers),
          };
        } else {
          resolved = { kind: "new", event, draft: policyDraftFor(null, event, policies, answers) };
        }
        renderResolvedSummary(trail, resolved);
      });
    }
  };

  /* Recebe o id resolvido de uma opção (via clique ou match heurístico),
     avança na árvore ou dispara o fluxo de parâmetros / recap final. */
  const advanceTree = (optionId) => {
    const node = NEED_TREE.questions[guidedNode];
    if (!node) return;
    const option = node.options.find((o) => o.id === optionId);
    if (!option) return;
    const newTrail = [...answerTrail, { nodeId: guidedNode, question: node.title, answer: option.title, optionId }];
    setAnswerTrail(newTrail);
    if (option.next) {
      setGuidedNode(option.next);
      askTreeNode(option.next);
    } else {
      setGuidedNode(null);
      resolveTreeLeaf(option, newTrail);
    }
  };

  const handleSend = (text) => {
    const raw = text.trim();
    if (!raw) return;
    setChatMsgs((m) => [...m, { from: "user", text: raw }]);
    const n = norm(raw);

    /* "Cancelar" tem que funcionar em qualquer modo — sai antes do
       intercept da árvore ou de qualquer outro handler. */
    if (/^cancelar$/i.test(raw)) {
      setUnmatchedAttempts(0);
      setAwaitingEventPhrase(false);
      setGuidedNode(null);
      setAnswerTrail([]);
      setParamFlow(null);
      agentSay({ from: "agent", text: "Cancelado. Quando quiser voltar, é só me chamar." });
      return;
    }

    /* Fluxo de parâmetros ativo: intercepta antes da árvore. Fase
       "threshold" espera formato duration/count; fase "actions" espera
       clique num kind, "Concluir" ou "Remover última". */
    if (paramFlow) {
      const flow = paramFlow;
      const event = flow.event;

      if (flow.phase === "threshold") {
        const parsed = parseThreshold(raw, event.thresholdParam);
        if (!parsed) {
          const example = event.thresholdParam.unit === "count"
            ? "um número, por exemplo 3"
            : "um período, por exemplo 4h, 30 min ou 2d";
          agentSay({
            from: "agent",
            text: `Não entendi o valor. Preciso de ${example}.`,
          });
          return;
        }
        const answers = { ...flow.answers, threshold: parsed };
        /* Se as ações já vieram pré-preenchidas do extractor, encerramos
           aqui — não perguntamos duas vezes o que o merchant já disse. */
        if (flow.skipActionsWhenDone) {
          setParamFlow(null);
          flow.onComplete({ ...answers, chosenActions: flow.ordered });
          return;
        }
        setParamFlow({ ...flow, phase: "actions", answers });
        askActionsQuestion(event, flow.ordered);
        return;
      }

      if (flow.phase === "actions") {
        if (/^concluir$/i.test(raw)) {
          if (flow.ordered.length === 0) {
            askActionsQuestion(event, flow.ordered);
            return;
          }
          const answers = { ...flow.answers, chosenActions: flow.ordered };
          setParamFlow(null);
          flow.onComplete(answers);
          return;
        }
        if (/^remover última$/i.test(raw) || /^remover ultima$/i.test(raw)) {
          const newOrdered = flow.ordered.slice(0, -1);
          setParamFlow({ ...flow, ordered: newOrdered });
          askActionsQuestion(event, newOrdered);
          return;
        }
        /* Match do label do kind (case-insensitive, sem acento). */
        const matchedKind = event.suggestedActions.find((k) => norm(kindOf(k).label) === norm(raw));
        if (!matchedKind) {
          agentSay({
            from: "agent",
            text: "Não achei essa ação na lista sugerida. Toque em uma das opções abaixo.",
            quickReplies: [
              ...event.suggestedActions.filter((k) => !flow.ordered.includes(k)).map((k) => kindOf(k).label),
              ...(flow.ordered.length > 0 ? ["Concluir", "Remover última"] : []),
            ],
          });
          return;
        }
        if (flow.ordered.includes(matchedKind)) {
          askActionsQuestion(event, flow.ordered);
          return;
        }
        const newOrdered = [...flow.ordered, matchedKind];
        setParamFlow({ ...flow, ordered: newOrdered });
        askActionsQuestion(event, newOrdered);
        return;
      }
    }

    /* Modo guiado por árvore ativo: intercepta ANTES de qualquer outro
       roteamento. Título exato (via quick reply) → id direto; texto livre
       → matchTreeOption. Sem confiança → repete a pergunta. */
    if (guidedNode) {
      const node = NEED_TREE.questions[guidedNode];
      if (node) {
        const exact = node.options.find((o) => o.title === raw || norm(o.title) === n);
        const optionId = exact ? exact.id : matchTreeOption(node, raw);
        if (optionId) {
          advanceTree(optionId);
        } else {
          agentSay({
            from: "agent",
            text: "Não tenho certeza de qual opção você quis dizer. Pode escolher uma?",
            quickReplies: node.options.map((o) => o.title),
          });
        }
        return;
      }
    }

    /* Quick reply "Abrir <RULE-ID>" gerada pelo ramo 1 → seleciona a regra
       no canvas (o drawer abre automaticamente via `selected`). */
    const openMatch = raw.match(/^abrir\s+([A-Z]+-\d+)/i);
    if (openMatch) {
      const rid = openMatch[1].toUpperCase();
      for (const p of policies) {
        const r = p.rules.find((x) => x.id === rid);
        if (r) {
          setCategory(p.category);
          setStatus("all");
          setQuery("");
          setHighlightId(rid);
          setSelectedRuleId(rid);
          agentSay({ from: "agent", text: `Abri **${r.id} · ${r.name}** no canvas.` });
          return;
        }
      }
    }

    /* Quick replies do fallback "3 tentativas sem match" e chip da
       chip-row entram no caminho guiado (NEED_TREE). "Sim, me guia" vem
       do fallback; "Me guia com perguntas" vem do chip persistente. */
    if (/^sim,?\s*me guia|me guia com perguntas|me ajuda a encontrar/i.test(raw)) {
      startGuidedTree();
      return;
    }
    if (/deixa eu tentar de novo/i.test(raw)) {
      setUnmatchedAttempts(0);
      agentSay({ from: "agent", text: "Ok — descreva de outro jeito, sem pressa. O que o OMS deveria notar, e o que fazer a seguir?" });
      return;
    }
    if (/regra a partir de uma frase|criar outra regra|nova regra/.test(n)) {
      setUnmatchedAttempts(0);
      setAwaitingEventPhrase(true);
      agentSay({ from: "agent", text: "Descreva o evento em uma frase — o que o OMS precisa detectar e o que deve acontecer em seguida." });
      return;
    }

    /* Fluxo "policy-new-rule" ativo (entrada pelo bot\u00e3o "Nova regra"
       do canvas ou pelo gatilho "criar outra regra" no chat): a frase
       segue exatamente o mesmo pipeline do caminho por frase livre.
       Isso garante que todo terminal chega num card de review 3c com
       `runConflictCheck` \u2014 nada de handlers legados divergindo aqui. */
    if (awaitingEventPhrase) {
      setAwaitingEventPhrase(false);
      handleFreeformRule(raw);
      return;
    }

    if (/desligadas|desligar por enquanto/.test(n)) {
      if (/desligar por enquanto/.test(n) && selectedRuleId && selected) {
        toggleRule(selected.policy.id, selected.rule.id);
        agentSay({ from: "agent", text: `**${selected.rule.id}** foi desligada. As ocorrências que já estavam em curso seguem no fluxo antigo.` });
        return;
      }
      const off = policies.flatMap((p) => p.rules.filter((r) => !r.active).map((r) => `**${r.id}** · ${r.name} (${p.name})`));
      setStatus("off");
      agentSay({
        from: "agent",
        text: off.length
          ? `Há ${plural(off.length, "regra desligada", "regras desligadas")}:\n${off.join("\n")}\n\nJá filtrei o canvas por "Desligadas".`
          : "Nenhuma regra desligada no momento — todas as políticas estão valendo.",
      });
      return;
    }

    if (/como as politicas se organizam|taxonomia|organizam/.test(n)) {
      const summary = AIWData.policyCategories
        .map((c) => `${c.icon} **${c.label}** — ${plural(policies.filter((p) => p.category === c.id).length, "política", "políticas")}`)
        .join("\n");
      agentSay({
        from: "agent",
        text: `As regras vivem dentro de políticas, e cada política pertence a uma categoria:\n${summary}\n\nUma regra nova entra na política que corresponde ao evento descrito.`,
      });
      return;
    }

    if (/pedidos antigos|retroativ/.test(n)) {
      agentSay({
        from: "agent",
        text: "Não. Ligar uma regra vale só para ocorrências detectadas a partir daquele momento — pedidos que já estavam em curso seguem com o comportamento anterior até fecharem.",
      });
      return;
    }

    /* Sem intent conhecido: caminho não guiado. A frase é classificada
       contra o EVENT_CATALOG; o contador de tentativas sem match decide
       se seguimos tentando ou oferecemos as perguntas guiadas. */
    handleFreeformRule(raw);
  };

  /* "Nova regra" no canvas e o chip da chip-row levam ao mesmo fluxo: o
     assistente pede a frase e o foco vai para o composer. */
  const startNewRule = () => {
    setUnmatchedAttempts(0);
    setAwaitingEventPhrase(true);
    agentSay({ from: "agent", text: "Descreva o evento em uma frase — eu monto a regra e você revisa antes de criar." });
    composerRef.current?.append?.("");
  };

  return (
    <React.Fragment>
      <ResizableSplit screenLabel="Políticas do Workflow" initialWidth={400}>
        <ChatPanel
          title="Assistente de políticas"
          chips={POLICY_CHIPS}
          alwaysShowChips
          messages={chatMsgs}
          onSend={handleSend}
          isTyping={isTyping}
          placeholder="Descreva o evento em uma frase…"
          composerRef={composerRef}
        />
        <WorkflowPoliciesCanvas
          policies={policies}
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
          status={status}
          onStatus={setStatus}
          onToggleRule={toggleRule}
          selectedRuleId={selectedRuleId}
          onSelectRule={(id) => { setHighlightId(null); setSelectedRuleId(id); }}
          highlightId={highlightId}
          onNewRule={startNewRule}
        />
      </ResizableSplit>

      {selected && (
        <PolicyRuleDrawer
          rule={selected.rule}
          policy={selected.policy}
          onToggle={toggleRule}
          onClose={() => setSelectedRuleId(null)}
        />
      )}
    </React.Fragment>
  );
}

window.WorkflowPoliciesView = WorkflowPoliciesView;
