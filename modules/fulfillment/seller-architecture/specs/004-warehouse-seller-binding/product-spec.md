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
- **Card subtitle copy:** decided as **"Adicionar seller que possui o inventário desse estoque"**. The Figma mock still shows older variants ("relacionado a este estoque" in Passo 1, "dono do inventário desse estoque" in Passo 2–4) and should be aligned to this copy.
- **No-results / error copy:** exact strings for the empty-state and fetch-error messages (and the retry button label) still need to be captured from Figma.
