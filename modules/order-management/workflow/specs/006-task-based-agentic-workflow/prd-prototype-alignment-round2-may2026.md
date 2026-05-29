# PRD — Prototype Alignment Update · Round 2 · Spec 006 Task-Based Agentic Workflow

| Field | Value |
|---|---|
| **Module** | Order Management |
| **Pillar** | Agentic Operations / Workflow |
| **Spec** | 006 — Task-Based Agentic Workflow |
| **PRD Type** | Spec Alignment Update — Round 2 (prototype → documentation sync) |
| **Author** | Marcelo Leonel da Costa |
| **Status** | Pending Approval |
| **Approvers** | Vanessa Borges · Julia Grisi Lolato |
| **Created** | May 2026 |
| **Supersedes** | `prd-prototype-alignment-may2026.md` (Round 1) |
| **Prototype** | https://marceloleonel-commits.github.io/Agentic-OMS/task-workflow/prototype.html |

---

## Purpose

This PRD documents the second round of prototype changes made after Round 1 alignment. Three architectural decisions were revisited and a new capability — the **workflow trigger system** — was introduced. Approval is required from Vanessa Borges **or** Julia Grisi Lolato before these changes are merged into the working spec baseline.

---

## Summary of Changes (Round 2)

| # | Change | Impact |
|---|---|---|
| 1 | **Separate pipelines per item** (reverts Round 1 unified model) | Vision Cap. 2, Brief scope, RF-03.2, RF-03.8 |
| 2 | **`wf-payments` as standalone workflow** | Vision Cap. 1, Brief scope, RF-09 |
| 3 | **`wf-personalization` replaces `wf-personalized`** | Vision Cap. 1 + use cases, Brief scope |
| 4 | **Workflow trigger system** (new capability) | Vision Cap. 6 + concepts, Brief scope, RF-09.3–09.5 |

---

## Detailed Change Log

### 1. Separate Pipelines Per Item — Reversion of Round 1 Unified Model

**Round 1 decision (now reverted):** Each order item displayed a single unified pipeline that combined payment and operational stages in sequence.

**New behavior (Round 2):** Each order item in the order detail screen displays **multiple named pipeline sections** — one per active workflow for that item. Sections are visually separated with colored headers:

| Workflow | Icon | Color | Section header example |
|---|---|---|---|
| Pagamentos | 💳 | Green (#059669) | `💳 Pagamentos` |
| Entrega pela loja | 📦 | Blue (#0c6fcd) | `📦 Entrega pela loja` |
| Personalização de Produtos | 🎨 | Rose (#e11d48) | `🎨 Personalização de Produtos` |
| Produtos Digitais | 💻 | Purple (#7c3aed) | `💻 Produtos Digitais` |
| Serviços / Instalação | 🔧 | Cyan (#0891b2) | `🔧 Serviços / Instalação` |

Between pipeline sections, a connector label shows the trigger condition (e.g., "↓ Acionado por 🤖 Agente AI · 26/05/2026 14:45" or "↓ Após conclusão da tarefa 'Separação de Itens' no workflow Entrega pela loja").

**Why reverted:** Operator testing revealed that combining payment and operational stages in a single list made it harder to diagnose which phase was blocking an order. Separate sections map more directly to the mental model of "payment team vs. ops team" responsibility.

**Data model:** Each ORDER_ITEMS item now has a `pipelines:[]` array instead of a flat `tasks:[]`:
```js
pipelines: [
  { wfId:'wf-payments',      wfName:'Pagamentos',                tasks:[...] },
  { wfId:'wf-standard',      wfName:'Entrega pela loja',          tasks:[...] },
  { wfId:'wf-personalization', wfName:'Personalização de Produtos', tasks:[...], triggeredAt:'...', triggeredBy:'...' },
]
```

**Docs updated:** Vision Cap. 2, Brief scope item 3, RF-03.2, RF-03.8.

---

### 2. `wf-payments` — Standalone Payment Workflow

**Change:** A dedicated `wf-payments` workflow was added to the workflow catalog. It contains two stages: Autorização de Pagamento and Captura de Pagamento. Payment stages were **removed** from `wf-standard` and `wf-virtual` — those workflows now start at their first operational stage (Separação de Itens and Ativação da Licença, respectively).

**`wf-payments` definition:**
- **Trigger:** `order-created` — activated automatically when an order is placed
- **Stages:** Autorização de Pagamento → Captura de Pagamento
- **Supplier:** Gateway Pagamento
- **Visibility:** `internal` (both stages)
- **Checkpoints on Autorização:** Envio da requisição ao gateway / Recebimento da autorização / Registro do ID de autorização

**Why separated:** Having payment stages embedded in the delivery or digital workflow made it impossible to configure payment behavior independently (e.g., merchants who want to delay capture, use a different gateway, or route B2B orders through a manual approval step). A standalone `wf-payments` allows the payment chain to be configured and monitored independently, and to be swapped or extended without touching delivery logic.

**Docs updated:** Vision Cap. 1, Brief scope item 3, RF-09 context.

---

### 3. `wf-personalization` — New Standalone Personalization Workflow

**Change:** The old `wf-personalized` workflow (which bundled payment + personalization + delivery in one long pipeline) has been **removed**. It is replaced by two independent workflows working in concert:
- `wf-standard` (Entrega pela loja) handles the delivery pipeline for personalized items
- `wf-personalization` (Personalização de Produtos) handles the customization pipeline, **triggered** by the completion of the "Separação de Itens" task in `wf-standard`

**`wf-personalization` stages:**
| Stage | Supplier | Visibility | Key Checkpoints |
|---|---|---|---|
| Briefing do Cliente | BRK | user | Briefing recebido / Arquivo de arte anexado |
| Arte / Design | BRK | internal | Mockup criado / Mockup enviado ao cliente |
| Aprovação do Cliente | BRK | user | Arte aprovada pelo cliente / Confirmação registrada |
| Produção | BRK | internal | Produção iniciada / Personalização concluída |
| Controle de Qualidade | QA Team | internal | Produto inspecionado / Conformidade com briefing confirmada |
| Conclusão da Personalização | BRK | user | — |

**Why separate workflows instead of one combined workflow:**
- Separating concerns allows the personalization team (BRK) to work on the art approval in parallel with the distribution center preparing the base item
- The trigger model (`task-complete` on Separação) reflects the real operational dependency: the CD must confirm the item is in stock and separated before BRK begins production, but the two processes overlap afterward
- Merchants without personalization don't see or configure `wf-personalization` at all — it is simply not added to their item's pipeline

**Docs updated:** Vision Cap. 1 + use case for personalized product, Brief scope items 3–4, RF-03.2.

---

### 4. Workflow Trigger System — New Capability

**Change:** A new trigger configuration system was added to the workflow model and the workflow settings screen. Every workflow now declares a `trigger` object that controls when it is activated.

**Trigger types:**

| Type | `trigger.type` | Description | Example |
|---|---|---|---|
| Início do pedido | `order-created` | Activated automatically when an order is created | `wf-payments`, `wf-virtual`, `wf-services` |
| Conclusão de workflow | `workflow-complete` | Activated when a specified workflow finishes | `wf-standard` activates after `wf-payments` completes |
| Conclusão de tarefa específica | `task-complete` | Activated when a named task in a specified workflow completes | `wf-personalization` activates after `t1` (Separação de Itens) in `wf-standard` |

**Workflow settings UI — new "Gatilho de ativação" section:**

The workflow settings screen (`⚙️ Configurações`) now includes a **Gatilho de ativação** section with:
1. Three radio buttons for trigger type selection
2. When `workflow-complete` or `task-complete` is selected: a **Workflow de origem** dropdown (lists all other workflows)
3. When `task-complete` is selected: a **Tarefa de origem** dropdown (populated with stages of the selected origin workflow)

Changes are persisted when the operator clicks "Salvar". The selected trigger label is shown as a connector between pipeline sections in the order detail.

**Current trigger configuration in the prototype:**

| Workflow | Trigger type | Origin workflow | Origin task |
|---|---|---|---|
| Pagamentos | `order-created` | — | — |
| Entrega pela loja | `workflow-complete` | wf-payments | — |
| Personalização de Produtos | `task-complete` | wf-standard | t1 — Separação de Itens |
| Troca e Devolução | `workflow-complete` | wf-standard | — |
| Produtos Digitais | `order-created` | — | — |
| Serviços / Instalação | `order-created` | — | — |

**Why this capability matters:**
- Allows merchants to compose complex order workflows from simple building blocks without hardcoding dependencies in code
- Enables parallel workflows (personalization starts after separation; delivery continues independently) — a pattern that was impossible with a single flat pipeline
- Creates a first-class configuration surface for workflow dependencies, replacing implicit sequencing with explicit, editable trigger contracts

**New RFs added:** RF-09.3, RF-09.4, RF-09.5.
**New Vision concept:** Workflow Trigger (added to Vision Concepts glossary).
**Docs updated:** Vision Cap. 6, Brief scope item 4, RF-09.3–09.5.

---

## Acceptance Criteria Summary

| Area | Acceptance Criterion |
|---|---|
| Separate pipelines | Order detail shows distinct named sections per active workflow; no single merged list |
| Pipeline headers | Each section has colored icon + name header; colors match the workflow color in the catalog |
| Trigger connector | Between sections, a label shows trigger source (e.g., "↓ Após conclusão da tarefa 'Separação de Itens'") |
| wf-payments standalone | Workflow catalog includes `wf-payments`; wf-standard starts at Separação; wf-virtual starts at Ativação da Licença |
| wf-personalization | Workflow catalog includes `wf-personalization` with 6 stages; `wf-personalized` is absent |
| Trigger settings UI | Workflow settings shows "Gatilho de ativação" section with 3 radio options |
| Workflow-complete trigger | Selecting "Conclusão de workflow" shows origin-workflow dropdown |
| Task-complete trigger | Selecting "Conclusão de tarefa" shows origin-workflow + origin-task dropdowns |
| Trigger persistence | Saving workflow settings persists trigger config; connector label in order detail reflects it |
| BRK order detail | João Eduardo's order shows 3 pipeline sections: Pagamentos + Personalização de Produtos + Entrega pela loja |
| Kit order detail | Kit items grouped under banner; each item shows payment + respective operational pipeline(s) |

---

## Open Questions

| # | Question | Owner | Target |
|---|---|---|---|
| OQ-1 | When two workflows run in parallel (e.g., Personalização and Entrega after Separação), what happens if one completes and the other is still in progress — does the order show "partial" state? | Marcelo L. + UX | Q3 2026 |
| OQ-2 | Should `wf-payments` be configurable per merchant (e.g., swap gateway, add manual approval step for high-value orders) or is it always the same 2-stage structure? | Marcelo L. + Payments PM | Q3 2026 |
| OQ-3 | The `task-complete` trigger polls for task completion — what is the latency model? Synchronous event, webhook, or polling interval? | Eng Champion (TBD) | RFC phase |
| OQ-4 | Can a workflow have multiple triggers (OR conditions)? E.g., Personalização triggered either when Separação completes OR when manually activated by operator. | Marcelo L. + Architecture | RFC phase |

---

## Documents Updated in This Round

| Document | Changes |
|---|---|
| `product-vision.md` | Cap. 2 updated (unified → separate pipelines); Cap. 1 updated (wf-payments + wf-personalization); Cap. 6 added (trigger system); Workflow Trigger concept added; personalized product use case updated; changelog updated |
| `product-brief.md` | Scope items 3–4 updated: pipeline model, workflow catalog, trigger system |
| `product-spec.md` | RF-03.2 updated (separate pipeline sections); RF-03.8 updated (header-based identification); RF-09.3, RF-09.4, RF-09.5 added (trigger configuration) |

---

## Approvals

| Approver | Role | Decision | Date |
|---|---|---|---|
| Vanessa Borges | — | ☐ Approved ☐ Rejected ☐ Changes Requested | — |
| Julia Grisi Lolato | — | ☐ Approved ☐ Rejected ☐ Changes Requested | — |

> **Note:** Approval from either Vanessa Borges **or** Julia Grisi Lolato is sufficient to merge these changes into the working spec baseline.

---

## Changelog

| Date | Change |
|---|---|
| May 2026 | Round 2 PRD created. Captures: separate pipeline model reversion, wf-payments standalone, wf-personalization replacing wf-personalized, workflow trigger system |
