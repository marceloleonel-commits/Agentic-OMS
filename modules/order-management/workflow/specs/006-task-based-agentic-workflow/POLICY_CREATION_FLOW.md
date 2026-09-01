# Fluxo de criação de política/regra — OMS Agêntico

Documento complementar a `product-spec.md` e `product-brief.md`, cobrindo o desenho do chat de "Políticas do Workflow" (`view-workflow-policies.jsx`, `#/workflow-policies`). Escrito para acompanhar os arquivos de código desta mesma pasta:

- `data-aiw-policy-catalog.js` — dados: catálogo de eventos + dicionário de tradução de condições.
- `policy-chat-engine.js` — lógica: os dois caminhos de criação de regra, checagem de conflito, prioridade, criação de política nova.
- `policy-rule-drawer.jsx` — componente: drawer de detalhe da regra, revisado.

## Contexto

O OMS Agêntico é feito de políticas/orientações para eventos que a operação enfrenta. Elas nascem pré-preenchidas (catálogo padrão, igual pra todo merchant), mas o merchant pode editar, refinar e criar novas. O primeiro contato real do merchant não é uma configuração inicial na plataforma — é uma conversa com uma LLM externa; o AIW só passa a mostrar e permitir editar essa configuração depois.

## Decisões fechadas nesta rodada

1. **Política é a base, evento é filtro.** O canvas continua organizado por Categoria → Política → Regra (como já era no protótipo). O evento de origem (`sourceEventId`/`sourceEventLabel`) vira metadado/filtro, não uma segunda hierarquia paralela.
2. **Toda regra vincula a um evento do catálogo fechado** (10 eventos, ver `data-aiw-policy-catalog.js`). Um evento pode gerar mais de uma regra, em políticas diferentes — o agrupamento por evento é só visual/filtro.
3. **Condições e tarefas são editáveis via chat**; o evento em si não é.
4. **Toda condição tem duas versões**: `natural` (o que o merchant lê) e `technical` (o campo real do JSON do pedido, quando existir um campo direto — ver seção "Grounding no JSON real" abaixo).
5. **Preenchimento inicial é um catálogo default** — igual pra todo merchant, editável depois. Não existe importação de configuração externa divergente por merchant.
6. **Duas portas de entrada para criar regra**, convergindo no mesmo card de proposta:
   - **Não guiada** (frase livre): merchant descreve o cenário; se não bater com nenhum evento em 3 tentativas, o agente oferece o caminho guiado.
   - **Guiada** (árvore de necessidade): merchant não sabe o termo técnico; perguntas em cascata do sintoma até o evento.
7. **Nem toda regra nova pode simplesmente ser "gerada" pela LLM a partir da frase.** Quando o evento não tem regra existente, o agente PRECISA perguntar threshold e ações antes de redigir — nunca inventa os dois a partir da descrição. Ver `askRuleParameters` em `policy-chat-engine.js`. Na frase livre, isso só é perguntado se a própria frase não já respondeu (extração prévia via `extractParamsFromPhrase`).
8. **Checagem de conflito roda sempre**, nos dois caminhos, antes de qualquer "Aplicar"/"Criar regra"/"Ativar". Conflito = outra regra ativa do mesmo evento com tipo de ação divergente (tabela fixa `KIND_CONFLICTS`, sem LLM).
9. **Prioridade entre regras do mesmo evento** é um campo novo (`priority: number | null`), resolvido no momento do conflito: manter as duas sem ordem, despriorizar a existente, ou repriorizar a nova na frente.
10. **Política nunca nasce vazia.** Fluxo C (criar política nova) só existe como extensão do fluxo de regra — sempre entrega política + primeira regra juntas.
11. **Drawer da regra**: ações aparecem numeradas na ordem real do array (nunca reagrupadas por tipo), e a origem do evento aparece em linguagem natural, com o código técnico como legenda pequena.

## Grounding no JSON real do pedido

Cruzando o JSON real de um pedido (VTEX OMS) com o glossário oficial da [planilha de pedidos](https://help.vtex.com/pt/docs/tutorials/planilha-de-pedidos), varias condições passaram a apontar pra campo real, não pseudocódigo:

| Campo real | Onde é usado | Observação |
|---|---|---|
| `WorkflowData.WorkflowIsInError` / `Instances[].IsInError` / `IsInAutomaticRetry` | Falha de status | Booleanos reais — melhor condição objetiva do catálogo |
| `CancelledBy` **e** `CanceledBy` | Cancelamento falhou | Checar os dois — typo histórico da API |
| `InvoiceData` | Cancelamento falhou | `null` = NF-e ainda não emitida |
| `PaymentData.Transactions[].Status` | Autorização inconsistente | ⚠️ `null` quando o pagamento foi **aprovado**, não quando falhou — quirk confirmado no próprio pedido de exemplo usado nesta análise |
| `ShippingData.LogisticsInfo[].ShippingEstimateDate` | Risco de SLA | Comparar com a data atual |
| `ShippingData.TrackingHints` / `PackageAttachment.Packages` | Tracking inconsistente | Ambos vazios/null é o sinal |
| `Delivered` | Entrega não confirmada | Só existe se a loja manda esse dado — não é universal |

Três eventos (Sistema indisponível, ERP fora de sync, e parte de Ruptura de estoque) **não têm campo correspondente no pedido** — são sinais externos (infraestrutura, webhook). Isso significa que a condição desses eventos nunca vai ser um `technical` lido direto do JSON; sempre depende de outra fonte de dado.

## Mapeamento evento → regra (10 eventos → 16 linhas)

| Evento | Reaproveita | Precisa de regra nova |
|---|---|---|
| Risco de SLA | MON-005, LOG-003, MON-003 | — |
| Ruptura de estoque | LOG-005 | — |
| Sistema indisponível (AVL) | — | ✅ proposto: política "Disponibilidade & Integrações" |
| Falha de status | MON-001, MON-002, MON-003, MON-004 | — |
| Cancelamento falhou | — | ✅ proposto: dentro de "Alterações & Cancelamentos" |
| ERP fora de sync | — | ✅ proposto: política "Integrações Externas" |
| Tracking inconsistente | — | ✅ proposto: dentro de "Coleta & Transporte" |
| Entrega não confirmada | — | ✅ proposto: dentro de "Despacho & Entrega" |
| Autorização inconsistente | — | ✅ proposto: dentro de "Pagamentos & Autorização" |
| Fila quebrada | LOG-001, LOG-002 | — |

## Migração pendente no catálogo existente (26 regras)

O protótipo já tem 26 regras em `workflowPolicies` (12 políticas). Só 9 delas + as 6 novas propostas têm o par `{natural, technical}` pronto — as outras 17 (MON-006, MON-007, MON-008, EXC-001/002/003/009, EDGE-006, EXC-010, SUB-002, EDGE-002, EXC-006, EXC-004, EXC-005, LOG-004, LOG-010, LOG-007, EDGE-004, LOG-009, EDGE-005, DEV-001/002/003/004/005/007) ainda têm `conditions` como `string[]` puro. Isso quebra o drawer (mostra a mesma string duas vezes — bug confirmado em produção no card de MON-005 antes da correção). `data-aiw-policy-catalog.js` já traz o dicionário completo (`CONDITION_TRANSLATIONS`, 47 entradas) pra migrar as 26 de uma vez.

## Pendências não resolvidas nesta rodada

- Nada a fazer na Iniciativa Operacional por enquanto — é só mockup.
- Home/kanban: ainda não avaliamos se alguma tela fora do drawer depende de `priority`.
- Toggle "ver por evento de origem" no canvas principal (filtro, não hierarquia) — desenho aprovado em conversa, ainda sem implementação.
