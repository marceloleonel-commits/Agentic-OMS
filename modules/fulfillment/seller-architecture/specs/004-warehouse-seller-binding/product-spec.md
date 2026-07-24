# Product Spec — Warehouse: card "Sellers internos"

| Field | Value |
| --- | --- |
| **Spec** | 004 |
| **Repo** | [`vtex/admin-logistics`](https://github.com/vtex/admin-logistics) `master` |
| **Screen** | `/admin/shipping-strategy/warehouse` → `react/WarehouseForm.tsx` |

---

## Context

`sellerType=3` is a new seller type created to serve Tier 1 merchants with very large physical networks (e.g., Dollar General, 23,000 stores), which today would require one franchise account per store.

Unlike traditional franchises, `sellerType=3` is a **logical entity within the main account**, with no VTEX account of its own. It keeps its own identity — inventory, price, and payment credentials — but all management (including orders) is **centralized in the main account**. There is no isolated storefront, checkout, or order management per store.

The goal of the flow designed here is to enable the **seller↔inventory binding via UI in the VTEX admin**:

- Each warehouse can be bound to a **single** `sellerType=3`, establishing which seller owns that inventory.
- A seller can have **N warehouses** (e.g., store + backstore).
- **Inactive** sellers are automatically excluded from the options available to the shopper at checkout — which also excludes them from the options available when creating the binding with a warehouse in this flow.
- The **"Sellers internos"** card must be shown **only for accounts that have `sellerType=3`**. The visibility logic must live in the screen itself (conditional rendering), to **avoid two versions of the same screen**.
- The seller↔warehouse binding can only be set or changed while the warehouse has **no active inventory**. Once the warehouse holds active inventory, the binding is **locked** — you can neither add a seller (if none was set), change the existing one, nor **remove** it. Any attempt fails. This protects inventory ownership integrity: reassigning inventory to a different owner mid-flight is not allowed.
- The active-inventory state is **dynamic, not persisted**: if the warehouse's inventory drops to 0, it becomes eligible for binding again. The screen must not cache a "locked forever" flag on the warehouse.
- **Detection constraint (technical):** today the platform only surfaces the active-inventory block **when the save call is attempted** — the save API returns the error. Knowing it up front (to disable the field on screen load) requires an **extra call** to check active inventory by `warehouseId`. Which approach to ship (reactive error-on-save vs. proactive disable-on-load) is an open decision — see Open questions.

### Binding rules per scenario

| # | Screen | Current binding | Active inventory | Behavior |
|---|---|---|---|---|
| 1 | Edit | no seller selected | no | **Can add** a seller |
| 2 | Edit | no seller selected | **yes** | **Blocked** — cannot add a seller |
| 3 | Edit | seller already selected | no | **Can change** the seller |
| 4 | Edit | seller already selected | **yes** | **Blocked** — cannot change (or remove) the seller |
| 5 | Creation | — | — (new warehouse has no inventory yet) | **Can add** a seller |

Source: alignment with Ricardo Fonte / Amanda Vilar ([Slack thread](https://vtex.slack.com/archives/C0B55058NBB/p1784838040721709?thread_ts=1784827949.211609&cid=C0B55058NBB)); UI specs for scenarios 2 and 4 in [Figma](https://www.figma.com/design/uEBQNivdI7fxwdplYtEyCo/Internal-sellers-and-warehouses?node-id=78-1274). Scenarios 1, 3 and 5 are the happy path.

---

## Requirements

### 1. "Sellers internos" card (Seller ID, conditional rendering)
- **FR1** — New card in the form (`PageBlock` pattern, like the existing ones), placed **after the "Origem" card** (dock relationship). Card title: **"Sellers internos"**; subtitle/description: **"Adicionar seller que possui o inventário desse estoque"**. **Shown only when the account has an active `sellerType=3`** (see FR2 and FR2.1).
- **FR2** — Account **without an active `sellerType=3`**: the card is **not rendered** (the component returns `null`). No disabled `Input`, no placeholder, no reference to a seller in the form — this avoids confusing the customer with a config they cannot change.
- **FR2.1** — **Single UI version**: the same component/build decides whether to show or hide the card through a front-end conditional, based on the active-`sellerType=3` flag (see "Open questions"). There are no two screens or a separate UI feature-branch.
- **FR3** — Account **with an active `sellerType=3`**: single `Select` with text search (searchable dropdown with a chevron / `ico-dropdown` icon), field label **"Adicionar seller"**, placeholder **"Selecionar"**; selection of **1** seller. Each option is displayed as **"Nome da loja (accountName)"** — store name followed by the account name in parentheses. Examples from the mock:
  - Loja Jardim Botânico RJ (lojajardimbot)
  - Loja Centro RJ (lojacentrorj)
  - Loja Botafogo Praia Shopping (lojashoppingbot)
  - Loja Barra 01 (lojabarra01)

  The search must return only `sellerType=3` sellers or the main account itself.
- **FR3.1** — Below the select, show the helper text: **"Apenas sellers ativos podem ser escolhidos"**. The dropdown lists **only active sellers** (the UI communicates and restricts proactively, not only at save).
- **FR3.2** — Once a seller is chosen, the field displays the selected **store name** (e.g., "Loja Botafogo 01"), the dropdown closes, and the helper text remains below the field.
- **FR4** — The value persists in the warehouse's `sellerId` field. **Already exists in the API**: `POST /api/logistics/pvt/configuration/warehouses`, `sellerId` = **optional** body parameter (auth `LogisticsAdmin`). No backend change. Ref: [API doc](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0#heading=h.o0yjrge1knq).
- **FR4.1** — Defense in depth: the API also validates inactive sellers. If an inactive seller reaches save, the UI must show the error returned by the API ("selected seller is inactive").

### 2. Seller search dropdown — interaction states

Derived from the Figma flow "Fluxo para adicionar seller type 3 ao estoque" ([frame](https://www.figma.com/design/uEBQNivdI7fxwdplYtEyCo/Internal-sellers-and-warehouses?node-id=26-4300)):

- **FR5** — **Opened (Passo 2):** clicking the field opens the dropdown and shows the list of eligible sellers (active `sellerType=3`), each rendered as "Nome da loja (accountName)".
- **FR5.1** — **Typing (Passo 3):** typing filters the list by the search term (matching store name and/or `accountName`); the active/hovered option is highlighted.
- **FR5.2** — **Selected (Passo 4):** selecting an option fills the field with the store name and closes the dropdown (see FR3.2).
- **FR5.3** — **Loading:** while sellers are being fetched, the dropdown shows a spinner and no options.
- **FR5.4** — **No results:** when the search returns no match, the dropdown shows an empty-state message (exact copy to confirm in Figma).
- **FR5.5** — **Fetch error:** when listing sellers fails, the dropdown shows an error message plus a **retry** action (tertiary button) (exact copy to confirm in Figma).

### 3. Active-inventory lock (edit screen)

Derived from the Figma specs for scenarios 2 and 4 ([frame](https://www.figma.com/design/uEBQNivdI7fxwdplYtEyCo/Internal-sellers-and-warehouses?node-id=78-1274)).

- **FR6** — When the warehouse being edited has **active inventory**, the "Adicionar seller" `Select` is rendered **disabled** and the binding cannot be set, changed, or removed. This covers scenarios 2 and 4.
- **FR6.1** — **No seller bound yet (scenario 2):** disabled select with placeholder **"Selecionar"** and inline error **"Esse estoque possui inventário ativo e não é possível adicionar um seller"**.
- **FR6.2** — **Seller already bound (scenario 4):** disabled select showing the current seller as **"Nome da loja (accountName)"** (e.g., "Loja botafogo 01 (lojabotafogo01)") and inline error **"Esse estoque possui inventário ativo e não é possível trocar o seller"**.
- **FR6.3** — **No active inventory (scenarios 1 and 3):** the select is **enabled**; the seller can be added or changed normally.
- **FR6.4** — The lock also blocks **removing** an existing binding while there is active inventory (removal requires deleting the warehouse).
- **FR6.5** — **Creation screen (scenario 5):** a new warehouse has no inventory yet, so the select is always **enabled** — the active-inventory lock never applies at creation.
- **FR6.6** — **Detection approach (to be decided, see Open questions):** the target UX (Figma) disables the select on load, which requires an **extra call** to check active inventory by `warehouseId`. If that call is not adopted, the fallback is **reactive**: keep the select enabled and, on save, surface the API's active-inventory error (same copy as FR6.1/FR6.2). The block and messaging are the same; only *when* it is shown differs.

## UI copy (pt-BR / EN)

Card and field strings for `messages/*.json`. "seller" is kept in pt-BR (VTEX standard). Store names and `accountName` values are real data and stay the same in both languages.

| Element | pt-BR | English |
|---|---|---|
| Card title | Sellers internos | Internal sellers |
| Subtitle | Adicionar seller que possui o inventário desse estoque | Add the seller that owns this warehouse's inventory |
| Field label | Adicionar seller | Add seller |
| Placeholder | Selecionar | Select |
| Helper text | Apenas sellers ativos podem ser escolhidos | Only active sellers can be selected |
| Option format | Nome da loja (accountName) | Store name (accountName) |
| Option example | Loja Centro RJ (lojacentrorj) | Loja Centro RJ (lojacentrorj) |
| Selected value | Loja Botafogo 01 | Loja Botafogo 01 |

Dropdown states — loading shows only a spinner; the strings below are **proposals** to confirm against Figma and the API:

| State | pt-BR | English |
|---|---|---|
| No results | Nenhum seller encontrado | No sellers found |
| Fetch error | Não foi possível carregar os sellers | Couldn't load sellers |
| Retry button | Tentar novamente | Try again |
| Inactive seller (API) | O seller escolhido está inativo | The selected seller is inactive |
| Active inventory — add (scenario 2) | Esse estoque possui inventário ativo e não é possível adicionar um seller | This warehouse has active inventory and a seller cannot be added |
| Active inventory — change (scenario 4) | Esse estoque possui inventário ativo e não é possível trocar o seller | This warehouse has active inventory and the seller cannot be changed |

## Acceptance

| # | Given | When | Then |
|---|---|---|---|
| AC1 | Account without an active `sellerType=3` | opens the form | the "Sellers internos" card **does not appear** on the screen |
| AC2 | Account with an active `sellerType=3` | searches the "Adicionar seller" dropdown | finds sellers by store name, displayed as "Nome da loja (accountName)" |
| AC2.1 | Account with an active `sellerType=3` | opens the dropdown | sees the text "Apenas sellers ativos podem ser escolhidos" and only active sellers listed |
| AC2.2 | Account with an active `sellerType=3` | opens the dropdown | eligible sellers are listed as "Nome da loja (accountName)" (e.g., "Loja Centro RJ (lojacentrorj)") |
| AC2.3 | Account with an active `sellerType=3` | selects an option | the field shows the selected store name (e.g., "Loja Botafogo 01") and the dropdown closes |
| AC3 | Account with an active `sellerType=3` | selects 1 active seller and saves | warehouse saved with `sellerId` |
| AC3.1 | Account with an active `sellerType=3` | selects an inactive seller and saves | API blocks and the UI shows the inactive-seller error |
| AC4 | Sellers are being fetched | opens/searches the dropdown | a spinner is shown while loading |
| AC4.1 | Search with no matches | finishes searching | the dropdown shows an empty-state message |
| AC4.2 | Seller listing fails | opens/searches the dropdown | the dropdown shows an error message with a retry action |
| AC5 | Same UI build | account with and without `sellerType=3` | the same version renders (with `sellerType=3`) or hides (without) the card via a conditional |
| AC6 | Edit form, warehouse with **active inventory** and **no seller bound** | opens the "Sellers internos" card | select is **disabled** with error "Esse estoque possui inventário ativo e não é possível adicionar um seller" (scenario 2) |
| AC7 | Edit form, warehouse with **active inventory** and **seller already bound** | opens the "Sellers internos" card | select is **disabled**, shows the current seller, error "Esse estoque possui inventário ativo e não é possível trocar o seller" (scenario 4) |
| AC8 | Edit form, warehouse with **no active inventory** | opens the "Sellers internos" card | select is **enabled**; seller can be added (scenario 1) or changed (scenario 3) |
| AC9 | Edit form, warehouse with **active inventory** and seller bound | tries to **remove** the binding | attempt fails; binding cannot be removed while inventory is active (removal requires deleting the warehouse) |

## Files (PR)
- `react/components/WarehouseSeller.tsx` (new, cloning `PickupPoints.tsx`; **returns `null` when the account is not an active `sellerType=3`**)
- `react/WarehouseForm.tsx` (include the card with the `sellerType=3` conditional)
- `react/graphql/` (fetch/list sellers for the dropdown)
- `messages/*.json` (card strings)

## Open questions
- How to identify a `sellerType=3` account:
  - Option A (preferred): the Marketplace team's `sellerTypeLocation` feature flag/capability — safest path since it reflects the source of the `sellerType=3` configuration.
  - Option B (open): an equivalent feature flag on the Logistics side, to be aligned with the team, if the Marketplace one isn't accessible in the screen's context.
  - Option C (fallback): check whether any `sellerType=3` already exists in the account.
- The seller search/listing endpoint for the dropdown must filter only `sellerType=3` or the main account itself, and return **only active sellers**.
- **Reactive vs. proactive active-inventory detection (FR6.6) — main open decision:** today the block is only known when the save call is attempted (the API errors). Disabling the field on load (the Figma target) needs an **extra call** to check active inventory by `warehouseId`. Decide whether the extra call is worth it or whether we ship the reactive error-on-save first.
- **Definition of "active inventory" (FR6 trigger):** define the exact check and its meaning ("active inventory" = any SKU with quantity > 0? reserved? total balance?). The state is dynamic (drops back to eligible at 0), so it must be read live, not persisted on the warehouse. The validation already exists in the **save API**; the open part is only the optional read-side call to know it before save.
- **Card subtitle copy:** decided as **"Adicionar seller que possui o inventário desse estoque"**. The Figma mock still shows older variants ("relacionado a este estoque" in Passo 1, "dono do inventário desse estoque" in Passo 2–4) and should be aligned to this copy.
- **No-results / error copy:** exact strings for the empty-state and fetch-error messages (and the retry button label) still need to be captured from Figma.
