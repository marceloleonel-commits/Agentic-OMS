# Seller Architecture — Specs Index

Module: **fulfillment / seller-architecture**
Vision: [`product-vision.md`](./product-vision.md) — Seller Architecture Evolution (sellerType=3 → Suppliers)

This index tracks the specs that exist and the ones still to be written. Each item in the backlog is a candidate spec — not a single open-questions doc. As an item is picked up, create its `NNN-<slug>/` folder with a `product-brief.md`.

---

## Existing specs

| # | Spec | Status |
| --- | --- | --- |
| 001 | [Unified Enterprise Store Management — sellerType=3](./specs/001-unified-enterprise-store-management-sellertype-3/product-brief.md) | API release |
| 002 | [Timezone per seller](./specs/002-timezone-per-seller/product-brief.md) | Draft |
| 003 | [Cross-team gaps — adoption beyond Dollar General](./specs/003-cross-team-gaps/product-brief.md) | Draft |

---

## Backlog — candidate specs

Open questions and gaps that surface when generalizing sellerType=3 beyond Dollar General. Each should become its own spec when prioritized. Numbers are suggested, not final.

| Proposed # | Item | Area / Owner | Decision type |
| --- | --- | --- | --- |
| 004 | **CEP-only journey, no seller selection** — how checkout resolves seller, products, and prices when only the ZIP code is known and there are ~2,000 eligible sellers. Includes the allocation heuristic not covering sellerType=3 (criterion for automatic seller selection without pre-selection). | Fulfillment / Checkout | Evaluate / Decide |
| 005 | **Timezone per seller** — already drafted as 002; promote/expand if needed for sellers across multiple time zones in the same account. | Fulfillment | Define |
| 006 | **Bulk import of warehouse, dock, and shipping policy** — only Batch Inventory exists today; the rest is created one by one. Evaluate need/format at scale (~46k docks, ~46k warehouses, ~69k policies) and dependency on the Postgres migration. | Fulfillment | Evaluate |
| 007 | **Polygon as a delivery zone model** — polygon already works (confirmed by Checkout); DG uses ZIP code today. The open decision is whether to adopt polygon as the delivery-zone model vs. ZIP, not whether it functions. | Fulfillment | Decide |
| 008 | **Shipping Capacity APIs not mapped to the new infra** — capacity per seller and Calculate scenarios (in-store, old pickup, shipping hours for Delivery Options) were not mapped. Which APIs must recognize sellerType=3. | Fulfillment | Evaluate |
| 009 | **Operational Capacity must accept sellerType=3** — the module (order limits per window/dock/warehouse) does not recognize sellerType=3 in the seller list; resolve limits per seller. | Fulfillment | Define |
| 010 | **Batch Inventory cost** — VTEX cost of the Batch Inventory solution vs. SKU-by-SKU updates via API at DG volume. | Fulfillment | Evaluate |
| 011 | **Sales channel mapping per seller** — today all sellers sell across all channels; evaluate one seller in more than one sales channel and scoping a seller to specific channels. | Marketplace | Evaluate |
| 012 | **Granular access control per seller** — any main-account user can edit any seller; define role/permission scoped per seller. (Overlaps with 003.) | Identity / IAM | Define |
| 013 | **Gift card behavior** — whether a gift card is issued/redeemed per main account or per seller, and the settlement implication (today centralized, no receivables split). | Payments / Checkout / Marketplace | Define |
| 014 | **Delivery Promise for sellerType=3** — availability/SLA calculation based on the seller↔warehouse link is not yet covered for type=3. Already on the Delivery Promise team's roadmap for H2. | Fulfillment / Delivery Promise | Define |
| 015 | **Receivables & transaction split for account-less sellers** — settlement remains centralized in the main account; there is no per-store receivables split, and a transaction is not born split across distinct recipients. (Overlaps with 013 on settlement.) | Payments | Define |
| 016 | **Orders with multiple seller types simultaneously** — processing a single order/cart with items from different sellers (and different seller types) is unvalidated; believed to work but untested. | OMS / Checkout / Fulfillment | Validate |
| 017 | **Regionalization for sellerType=3** — Regionalization v2 does not serve type=3. The vision is to migrate stores using regionalization to Delivery Promise (which will be supported). | Fulfillment / Delivery Promise | Decide |
| 018 | **Postgres migration — generalization** — the migration of shipping policy / dock / warehouse to Postgres was scoped to DG's scale. Evaluate generalizing it to other merchants / the whole base (performance and potential cost gains). | Fulfillment / Eng | Evaluate |

---

## Not supported — out of product vision

These are explicit non-support decisions, not prioritizable backlog. They are listed so adopters and customer requests are set against the right expectation.

| Item | Area | Note |
| --- | --- | --- |
| **Shipping Network** | Fulfillment | Does not work with the new architecture, and it is not in our vision for it to. |
| **Sales App** | Marketplace / Sales | Does not work with the new architecture. |

---

## Notes

- Items 011 and 012 overlap with [`003-cross-team-gaps`](./specs/003-cross-team-gaps/product-brief.md); when promoting them to specs, reconcile scope to avoid duplication.
- Item 005 is already captured as spec 002 (timezone-per-seller); listed here only for completeness of the backlog.
- Items 015 and 013 overlap on settlement; reconcile scope when either is promoted to a spec.
- **Orchestrator toggle is account-level only.** The feature toggle that enables sellerType=3 operates at the account level — it cannot be scoped per seller within an account. Relevant for rollout planning and for any scenario mixing enabled/disabled behavior in the same account.
