# PRD — Prototype Alignment Update · Spec 006 Task-Based Agentic Workflow

| Field | Value |
|---|---|
| **Module** | Order Management |
| **Pillar** | Agentic Operations / Workflow |
| **Spec** | 006 — Task-Based Agentic Workflow |
| **PRD Type** | Spec Alignment Update (prototype → documentation sync) |
| **Author** | Marcelo Leonel da Costa |
| **Status** | Pending Approval |
| **Approvers** | Vanessa Borges · Julia Grisi Lolato |
| **Created** | May 2026 |
| **Prototype** | [prototype.html](prototype/prototype.html) — https://marceloleonel-commits.github.io/Agentic-OMS/task-workflow/prototype.html |

---

## Purpose

This PRD documents all changes made to the interactive prototype since the initial spec was written, and aligns the product documents (Vision, Brief, Spec) to the current prototype state. Approval is required from Vanessa Borges **or** Julia Grisi Lolato before these changes are merged into the working spec baseline.

---

## Summary of Changes

The prototype evolved significantly beyond the scope captured in the original Spec 006 documents. This PRD captures 8 conceptual areas of change:

1. **Renamed surfaces** — Workflow Board → Controle de Fluxos
2. **Unified pipeline model** — separate payment + operational pipelines merged into a single per-item pipeline
3. **4-status task lifecycle** — replaced previous done/active/waiting/failed with Pendente / Completado / Cancelado / Ignorado
4. **Task visibility attribute** — user-facing vs. internal tasks
5. **Task checkpoints** — named validation gates with fail actions per task
6. **New workflow types** — virtual products, personalized products, services/installation, returns
7. **Kit order support** — visual grouping of physical + service items under a shared banner
8. **Stage vs. task creation distinction + context-aware supplier catalog**

---

## Detailed Change Log

### 1. Renamed Surfaces

| Before | After | Impact |
|---|---|---|
| Workflow Board | Controle de Fluxos | All documentation, navigation labels, RF titles |
| Workflow Padrão | Entrega pela loja | Workflow list + order detail references |

**Rationale:** "Controle de Fluxos" better communicates the operational nature of the screen to OMS operators; "Entrega pela loja" more accurately represents the default B2C delivery workflow scope.

---

### 2. Unified Pipeline Model (RF-03.2 changed)

**Previous behavior:** Each order item displayed two separate pipelines — a payment pipeline (Autorização → Captura) and an operational pipeline (Separação → Conferência → Embalagem → Expedição).

**New behavior:** Each order item displays a single unified pipeline that includes both payment and operational stages in sequence, without visual or structural separation. The pipeline rendered for each item is determined by its `wfType`.

**Why changed:** Separating pipelines creates false independence — in practice, operational tasks cannot begin until payment is authorized. The unified model better reflects the actual dependency and simplifies the UI for operators who need to see the full picture per item.

**Spec impact:**
- RF-03.2: Updated (separate pipelines → unified pipeline per `wfType`)
- Brief scope: Updated

---

### 3. 4-Status Task Lifecycle (new)

**New status set per task:** `pending` (Pendente) · `completed` (Completado) · `canceled` (Cancelado) · `ignored` (Ignorado)

| Status | Visual | Description |
|---|---|---|
| Pendente | Grey | Task not yet started or awaiting prerequisite |
| Completado | Green | Task successfully completed |
| Cancelado | Red | Task was explicitly canceled; requires a written reason |
| Ignorado | Amber | Task was intentionally skipped (e.g., not applicable to this order) |

**Why changed:** The old `done/active/waiting/failed` set mapped poorly to OMS operations. "Failed" implied a system error; operators needed to distinguish between "intentionally skipped" (Ignorado) and "canceled with reason" (Cancelado). The new set reflects real operational decisions.

**Operator interaction:** Operators click a task in the order detail to open a 4-option modal. Selecting "Cancelado" reveals a required reason field before confirmation. The agent can also transition task status autonomously within its configured confidence threshold.

**Spec impact:**
- RF-03.3: Updated (new status labels + visual codes)
- RF-03.11: New RF added
- RNF-05.4: New RNF added (audit trail for status transitions)

---

### 4. Task Visibility Attribute (new RF-06.1 addition)

Each task now carries a `visibility` attribute:
- **`user`** — task is shopper-facing; progress may be communicated to the customer
- **`internal`** — task is operational-only; not exposed to the shopper

**Why added:** Operators need a simple way to control which pipeline steps are communicated externally. Previously, there was no mechanism to distinguish operational-internal tasks (e.g., "Conferência de Carga") from steps the shopper should be aware of (e.g., "Confirmação de Entrega").

**This replaced:** The concept of "Ações VTEX Nativas" (native VTEX action catalog) was removed from the task model. Instead of configuring discrete VTEX API calls per task, operators set visibility and use external API / MCP / AI agent integrations for automation.

**Spec impact:**
- RF-06.1: Updated (removed "adicionar ações" intent; added "alterar visibilidade" intent)
- RF-05.4: Updated (card displays visibility badge)
- Brief scope: Updated (removed native actions catalog; added visibility attribute)

---

### 5. Task Checkpoints (new RF-06.9, RF-03.10)

Each task can declare one or more **checkpoints** — named validation gates that must be cleared before the task is considered complete.

**Checkpoint shape:**
```
{ id, label: "Arte aprovada pelo cliente", failAction: "Escalar para supervisora", s: "pending" | "completed" | "failed" }
```

**Display in order detail:** Pipeline step shows checkpoint completion indicator (e.g., "2/3 checkpoints concluídos"). Failed checkpoints surface the `failAction` recommendation.

**Configuration:** Operators add/edit/remove checkpoints via the task edit chat panel.

**Use cases:**
- Personalized product: "Arte aprovada pelo cliente" must be checked before production
- BRK jerseys: "Tamanho e número confirmados" before cutting
- Installation services: "Agendamento confirmado com cliente" before team dispatch

**Spec impact:**
- RF-03.10: New RF (checkpoint display in order detail)
- RF-06.9: New RF (checkpoint configuration in edit chat)
- Product Vision: Updated (checkpoints in Key Capabilities)

---

### 6. New Workflow Types (new `wfType` field)

The prototype now supports 5 workflow types (`wfType`), each with a dedicated stage configuration:

| `wfType` | Name | Stages (summary) | Use Case |
|---|---|---|---|
| `standard` | Entrega pela loja | Autorização → Captura → Separação → Conferência → Embalagem → Nota Fiscal → Expedição → Entrega | Default B2C delivery |
| `virtual` | Produtos Digitais | Autorização → Ativação → Licença → Entrega Digital → Confirmação | Software, media, gift cards |
| `personalized` | Produtos Personalizados | Autorização → Briefing → Personalização → Revisão → Produção → Controle de Qualidade → Embalagem Especial → Nota Fiscal → Expedição | Custom-printed, monogrammed, engraved products |
| `service` | Serviços / Instalação | Autorização → Agendamento → Confirmação do Agendamento → Execução → Verificação → Conclusão | Installation, home services |
| `returns` | Troca e Devolução | Triggered as secondary workflow; covers return receipt, inspection, refund/exchange | Returns processing |

**Why added:** The original spec only modeled B2C delivery. The prototype validated that merchants operating fashion (personalization), digital goods, and home services require fundamentally different pipeline shapes — not just renamed stages.

**Spec impact:**
- RF-03.2 and RF-03.8: Updated/new
- Product Vision: Key Capabilities updated
- Brief scope: Updated

---

### 7. Kit Order Support (new RF-03.9)

Orders can contain items that form a **kit** — a logical bundle of a physical product + a related service (e.g., flooring tiles + installation service).

**Visual treatment:** Kit items with the same `kitGroupId` are grouped under a dashed-border banner in the order detail (e.g., "Kit Piso + Instalação Arte&Decor"). Each item within the kit retains its individual pipeline (`wfType` = `standard` for the physical item, `service` for the installation).

**Why added:** The "Kit Piso + Instalação Arte&Decor" order example revealed a gap — without grouping, operators cannot tell which installation service corresponds to which product in multi-item orders.

**Spec impact:**
- RF-03.9: New RF
- Product Vision: Use cases updated

---

### 8. Stage vs. Task Creation Distinction + Context-Aware Supplier Catalog

**Previous behavior:** A single "Nova Tarefa" button created a new stage/column. There was no way to add a task (card) inside an existing stage.

**New behavior:**
- **"Nova Etapa"** → opens stage creation flow → adds a new column to the board
- **"Adicionar aqui"** (inside a column) → opens task creation flow → adds a new card inside that existing column

**Stage creation flow:** nome da etapa → responsável → categoria → confirmação → (optional) MCP/AI integration

**Task creation flow:** nome da tarefa → responsável (with context-aware suggestions) → categoria → (optional) API externa inline config → confirmação

**Context-aware supplier catalog:** When the operator types a task name, the system auto-suggests suppliers based on keyword detection:
- "pagamento / autorização / captura" → payment gateways (PagSeguro, Cielo, Adyen…)
- "separação / picking" → distribution centers (CD São Paulo, CD Rio de Janeiro…)
- "nota fiscal / NF" → NF issuers (Nota Fácil, NF-e.io, Bling…)
- "entrega / expedição" → carriers (Correios, Jadlog, Loggi…)
- "personalização / arte / estampa" → personalization suppliers (BRK, PrintShop Brasil…)
- "instalação / montagem / serviço" → service providers (Arte&Decor, Instaladores Pro…)

**Inline API configuration:** During task creation, after selecting category, the operator can optionally configure an external API endpoint without leaving the creation flow.

**Spec impact:**
- RF-05.6: Updated (two distinct creation actions)
- RF-05.8: New RF (stage header rename button)
- RF-07: Fully rewritten (4 RFs → 6 RFs)
- RF-06.3: Updated (inline API config during creation)

---

### 9. Removed: Context Variables Display (RF-03.5 / RNF-05.2)

**Previous spec:** The order detail should display context variables produced by prior workflow actions (e.g., `validarEstoque.disponivel: 2`).

**Decision:** Removed from MLP scope. The surface was prototyped and tested; feedback indicated it added cognitive load without actionable value for operators. Variables are persisted internally for auditability but not surfaced in the UI.

**Spec impact:**
- RF-03.5: Marked as removed (with strikethrough + note)
- RNF-05.2: Updated (persist internally, do not display)
- Brief "Not in scope": Updated

---

### 10. Removed: Flow Bar / Pills Navigation (RF-05.2)

**Previous spec:** A flow bar with numbered pills above the kanban showing task sequence with active/inactive color coding.

**Decision:** Removed. The stage headers in the kanban board itself provide sufficient navigation context. The pills bar created visual redundancy and occupied screen space needed for wider task cards.

**Spec impact:**
- RF-05.2: Marked as removed

---

## Acceptance Criteria Summary

| Area | Acceptance Criterion |
|---|---|
| Surface rename | "Controle de Fluxos" appears in board navigation; "Entrega pela loja" in workflow list |
| Unified pipeline | Order detail shows one pipeline per item; no "Pagamento" / "Operacional" section split |
| 4 statuses | Task status modal offers Completado / Cancelado / Ignorado / Pendente; Cancelado requires motivo |
| Visibility | Each task card shows user/internal badge; edit flow allows toggling |
| Checkpoints | Task edit chat supports checkpoint add/remove; pipeline displays checkpoint progress |
| Workflow types | Order items with wfType=virtual show Produtos Digitais pipeline; personalized shows Produtos Personalizados pipeline; service shows Serviços pipeline |
| Kit grouping | Items sharing kitGroupId are grouped under a shared kit banner in order detail |
| Stage vs task creation | "Nova Etapa" and "Adicionar aqui" open distinct flows; supplier suggestions appear in task creation |
| Inline API config | Task creation flow offers API config step after category selection |
| Context vars removed | Order detail does not display context variable panel |
| Flow bar removed | Kanban board does not display pills navigation bar above columns |

---

## Open Questions

| # | Question | Owner | Target |
|---|---|---|---|
| OQ-1 | Should `visibility: 'user'` trigger any automatic notification via Message Center when the task transitions to Completado? | Marcelo L. + Message Center PM | Q3 2026 |
| OQ-2 | What is the maximum number of checkpoints allowed per task? Prototype has no limit — needs a cap for performance and UX. | Eng Champion (TBD) | Before Beta |
| OQ-3 | How should kit `kitGroupId` be assigned — at order placement (from product catalog) or manually by the operator in the OMS? | Marcelo L. + Catalog team | Q3 2026 |
| OQ-4 | Should `wfType` be set at the product/SKU level in the catalog, or at the order item level at placement time? | Marcelo L. + Architecture | RFC phase |

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
| May 2026 | Initial PRD created to document prototype-to-spec alignment |
