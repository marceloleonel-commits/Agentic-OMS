# Product Brief — Warehouse: card "Sellers internos" (Seller ID)

| Field | Value |
| --- | --- |
| **Spec** | 004 — Warehouse → Seller binding (Admin UI) |
| **Module** | fulfillment / seller-architecture |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **PR repo** | [`vtex/admin-logistics`](https://github.com/vtex/admin-logistics) — screen `/admin/shipping-strategy/warehouse` |

**Refs:** [Product Vision sellerType=3](../../product-vision.md) (Key Capability #2) · [API doc — sellerId on warehouse](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0#heading=h.o0yjrge1knq)

---

## What changes

**New "Sellers internos" card (Seller ID)** in the Shipping Strategy Admin — Warehouse → Seller binding. **The field already exists in the API**: `sellerId` is an **optional** body parameter in `POST /api/logistics/pvt/configuration/warehouses` (see [API documentation](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0)). Only the UI is missing (100% front-end change).

The card is **conditionally rendered**, in a **single UI version** with the conditional on the front-end:
- Account **with an active `sellerType=3`**: the card **appears** with a **text-search dropdown** to select 1 seller by account name, displayed as "Nome da loja (accountName)". Only **active** sellers are listed. The API also validates inactive sellers; if an inactive one reaches save, the save returns the API error ("selected seller is inactive").
- Account **without `sellerType=3`**: the card **does not appear** on the screen. In these accounts the binding is always the main account and cannot be changed, so **hiding the card** (instead of showing it disabled) avoids confusing the customer with a configuration they cannot change.

## Out of scope

- Backend / API (`sellerId` already exists).
- Seller management (lives in Seller Register).

## Success

- Active `sellerType=3`: the field appears and allows binding a warehouse to a seller through the screen; inactive seller is blocked at save by the existing API validation.
- Accounts without `sellerType=3`: the field is **not shown** — no reference to a seller in the form.
- A **single UI version** covers both cases via a front-end conditional.

## Open questions

- How the front-end identifies a `sellerType=3` account (now the **gate** that decides whether to show or hide the field):
  - Option A (preferred): use the Marketplace team's `sellerTypeLocation` feature flag/capability — safest path since it reflects the source of the `sellerType=3` configuration.
  - Option B (open): an equivalent feature flag on the Logistics side, to be aligned with the team, if the Marketplace one isn't accessible in the screen's context.
  - Option C (fallback): check whether any `sellerType=3` already exists in the account.
- The endpoint that lists sellers for the dropdown search must return only `sellerType=3` sellers or the main account itself.
