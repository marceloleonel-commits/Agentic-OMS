# Inventory Management — Vision & Strategy

## Metadata

| Field | Value |
|---|---|
| **Product** | Commerce Platform |
| **Solution** | B2C / Omnichannel |
| **Module** | Fulfillment → Inventory Management |
| **Persona(s)** | Operations Manager |
| **Author** | Carol Tourinho |
| **Status** | Draft |
| **Created** | May 2026 |
| **Vision Horizon** | 2026–2028 (3 years) |

---

## TL;DR

| | |
|---|---|
| **What is it** | The set of APIs and admin tools that let merchants register, update, and manage stock across warehouses and sellers — the foundation every delivery promise depends on. |
| **Where we are** | Inventory management is a core, GA capability. The current model supports quantity, unlimited flag, and a duration-based lead time per SKU+warehouse pair, updated via per-item API calls. A Batch Inventory Update API shipped in beta in January 2026: it processes up to 25M rows per batch and already includes a `supply_date` field in its CSV schema. Supply Lot has existed since 2020 as an API-only feature with no Admin UI and no updates since 2021. An Admin UI facelift was attempted in 2024, reached closed beta, and was paused due to performance blockers in the Catalog+Availability integration. `[PM INPUT NEEDED: number of active merchant accounts and warehouses using inventory management today]` |
| **Core problem** | The inventory model has no time dimension. Stock is either present or absent: there is no native way to say "100 units arrive on May 14." The `supply_date` field in the Batch API exists but does not feed Delivery Promise or checkout SLA. Supply Lot solves the semantic problem but fails silently in every modern architecture VTEX is evolving toward. 8 confirmed enterprise customers are compensating with manual daily workarounds. |
| **Strategic direction** | Evolve inventory from a number-plus-duration model into a lifecycle-aware, time-dimensioned data layer. Make scheduled stock — arriving on a known future date — a first-class citizen fully integrated with Delivery Promise, Async Orders, and the shopper-facing storefront. Unified inventory visibility, including future batches, becomes available to merchants managing multi-supplier and omnichannel operations through Supplier Management. |
| **Why now** | The Batch API is approaching GA with `supply_date` as semantically inert metadata. Fast Shop and Samsung are adjusting lead times manually every day, in production, right now. Supply Lot is effectively dead but not officially deprecated, accumulating merchant confusion. Async Orders is being built now and requires a time-dimensioned inventory model to handle out-of-stock scenarios. |
| **Time Horizon** | 2026–2028 |

---

## Strategic Positioning

Inventory Management should be positioned as the **reliable data foundation that every commerce decision depends on**: from the first stock upload to the delivery date shown to the shopper.

Today it functions as a register: how much stock is here, and how many days does it take to ship. The evolution is toward a model that also answers: what stock is coming, when exactly, how much, and what does that mean for the promise we can make to the shopper. This is not a new module; it is the same foundation, extended to reflect how merchants actually operate.

The value proposition is **operational honesty**: *"What VTEX knows about my inventory is what my shoppers see. There are no gaps I need to fill manually."*

This positioning connects to two platform-level directions: **Async Orders**, which requires pre-indexed inventory availability to close orders without live calls to seller systems, and **Delivery Promise accuracy**, which depends on a stock model that reflects reality, including stock that doesn't exist yet but will on a known date.

---

## Problem / Opportunity

### Narrative Framing

Enterprise merchants know things about their inventory that VTEX cannot represent. They know a shipment of 100 units is arriving on May 14. They know a product is out of stock but will be replenished in two weeks. They know a supplier confirmed a specific quantity for a specific date. None of this knowledge can be expressed natively in the platform, and so merchants either lose the sales window entirely, or they build manual workarounds to compensate.

**Problem 1 — The inventory model has no time dimension.**

The Logistics API exposes a single model per SKU+warehouse pair:

```
quantity     integer     physical stock available for sale
unlimited    boolean     whether stock is infinite
leadTime     string      DD.HH:MM:SS — duration from order placement
```

`leadTime` is a relative duration. It answers "how many extra days does this SKU need after it's available?" — not "when will this SKU be available." A merchant who knows iPhone 17 arrives on May 14 can only approximate that as a lead time of, say, 5 days — but that delta changes every day as time passes. The SLA drifts instead of anchoring to the actual date.

There is no field in the current model for "stock arrives on date X." The platform cannot distinguish between a SKU that has no stock and a SKU that has 100 units confirmed for arrival in two weeks. Both look identical in checkout: unavailable.

**Problem 2 — `supply_date` exists in the Batch API but does nothing.**

The Batch Inventory Update API, now in beta, accepts a CSV with a `supply_date` field:

```
item_id, account_name, container_id, quantity, unlimited, lead_time, supply_date, seller_id
```

A merchant can upload a file with `supply_date = 2026-05-14` for a given SKU. The platform accepts it. The checkout SLA is unchanged. Delivery Promise does not see it. The field is documented, accepted, and semantically inert. When the Batch API exits beta, every merchant who tries to use `supply_date` to anchor a promise will discover it has no effect.

**Problem 3 — Supply Lot is architecturally broken and silently failing.**

Supply Lot, launched in 2020, was designed to answer exactly this need: register a quantity arriving on a specific date. The semantic model is correct. The integration is not.

- **Delivery Promise does not consume it.** Supply Lot lives in the logistics monolith. Delivery Promise is a separate pipeline. There is no propagation contract between them. Items with a Supply Lot entry appear as unavailable to shoppers on architectures using Delivery Promise.
- **Franchise account seller selection ignores it.** The availability cache is scoped by `InstanceId`. Franchise accounts do not share `InstanceId` with the main account. A Supply Lot registered on the headquarters account is invisible to the franchise account seller selection heuristic.
- **No Admin UI exists.** Supply Lot is API-only, not documented in Help Center, and has not been updated since 2021. Using it requires engineering resources the merchant's operations team does not have.

Merchants who discover Supply Lot, integrate it, and then build on Delivery Promise architecture find out it does not work — after the fact. *(Source: Future Stock Assessment, Apr 2026)*

**Problem 4 — 8 enterprise customers are compensating with manual daily operations.**

The absence of a native future stock concept forces merchants into two categories of workaround:

*Daily lead time adjustment:* Fast Shop and Samsung know the expected arrival date for high-demand SKUs. They cannot register it as a fixed anchor. Instead, a team member adjusts the lead time value every morning to reflect how many days remain until arrival. If the update is missed on any given day, the delivery promise shown to shoppers is wrong.

*Manual backorder release:* Container Store, World Wide Golf, and ODP receive stock in their own WMS systems, outside VTEX. When stock arrives, a team member manually checks availability and releases backorder order lines to fulfillment: a step that is fragile, unmonitored, and does not scale across thousands of SKUs.

> *"We have to adjust the lead time manually every day. If we forget, the customer sees the wrong delivery date."* — Fast Shop operations team `[PM INPUT NEEDED: validate this quote or replace with a confirmed one]`

*(Source: Future Stock Assessment, Apr 2026; BRD — Future Stock / Scheduled Lead Time, May 2026)*

**Problem 5 — Pre-order and backorder have no native lifecycle or shopper signal.**

A merchant preparing a product launch cannot run a pre-order campaign with a quantity cap. A merchant with a replenishment confirmed for June 1 cannot show "Back-ordered — arrives June 1" on the product page. Items appear as unavailable with no context. Conversion is lost not because the product does not exist, but because the platform cannot represent the truth.

Chick-fil-A needs item status labels (in stock / out of stock / back ordered / pre-order). Kirklands needs pre-order with a quantity cap and shopper notification when stock arrives. Neither is possible today without custom development outside the platform. *(Source: Future Stock Assessment, Apr 2026)*

**In practice:**
- Fast Shop opens the VTEX admin every morning and recalculates lead time by hand so the SLA roughly reflects the expected arrival date.
- Container Store receives a shipment in their WMS and manually triggers a release step in VTEX for every backorder line affected.
- A merchant integrating with the Batch API sets `supply_date` and wonders why the checkout SLA is unchanged.
- An enterprise account attempts to use Supply Lot in a Delivery Promise architecture: items appear as unavailable to shoppers.
- ODP has no workaround at all. SKUs remain unavailable during the pre-arrival window. The sales opportunity is lost.

---

### Why Now

1. **The Batch API is about to ship `supply_date` as dead metadata.** The field exists in the beta contract. If the API exits beta without connecting `supply_date` to Delivery Promise, it becomes a documented field that does nothing. Every merchant who tries to use it will file a support ticket. The window to align ingestion and promise is before GA.

2. **Fast Shop and Samsung are running manual daily operations right now.** This is not a future risk. It is happening in production today. Each day without a solution is operational overhead and promise risk for known enterprise accounts.

3. **Supply Lot is effectively dead but has not been officially deprecated.** Every new enterprise account that discovers it and integrates it on a Delivery Promise architecture will encounter the same silent failure. The longer deprecation is deferred, the more merchant confusion accumulates.

4. **Async Orders is being built now and assumes inventory has a time dimension.** For Async Orders to handle out-of-stock scenarios with known replenishment dates, the inventory model must be able to represent "available from date X." If the model does not evolve in 2026, Async Orders ships with a documented gap for these scenarios. *(Source: Async Orders Product Vision, Aug 2025)*

5. `[PM INPUT NEEDED: Is there a specific VTEX H1/H2 2026 OKR, board commitment, or ACV opportunity tied to pre-order/backorder that anchors urgency beyond the customer workarounds documented here?]`

---

### Use Cases and Current Workarounds

| Business Need | Current Workaround | Expected Behavior | Example |
|---|---|---|---|
| Sell in-transit stock with a delivery promise anchored to the arrival date | Manually adjust lead time duration every day to approximate the remaining days until arrival | `supply_date` in the Batch API or a date-mode lead time is used as the SLA anchor; checkout shows the correct date regardless of when the order is placed | Fast Shop uploads a batch with `supply_date = 2026-05-14`; checkout shows "arrives May 17" (14th + transit) for all orders placed before that date |
| Register multiple future replenishment batches per SKU with quantity limits | No workaround; items go unavailable when stock runs out and return manually when stock arrives | Merchants register N batches per SKU+warehouse, each with a quantity and arrival date; orders decrement the nearest sufficient batch | ODP registers: 100 units on May 14, 200 units on June 1; a shopper ordering 120 units gets an SLA anchored to June 1 |
| Release backorder fulfillment when stock arrives, without manual intervention | Team member manually checks WMS and releases order lines in VTEX when stock arrives | Confirming batch receipt transitions orders allocated to that batch from backorder to fulfillment-ready automatically | Container Store confirms a shipment received; all backorder lines allocated to that batch are released without manual intervention |
| Run a pre-order campaign with a quantity cap before stock physically exists | Not possible natively; requires custom storefront development | Item is shown as available (with future date) up to the configured quantity; once the cap is reached, the item goes unavailable | Kirklands opens a pre-order for 500 units of a new product arriving July 1; the 501st shopper sees "unavailable" |
| Show "Pre-order" or "Backorder — arrives May 14" on the product page | Not possible natively; item shows as unavailable with no context | Inventory status (scheduled, available, unavailable) propagates to Intelligent Search and Catalog; merchant configures the shopper-facing label | Chick-fil-A configures: scheduled inventory shows "Back ordered" with the arrival date on PDP |
| Update millions of SKU+warehouse pairs in a single operation, including future arrival dates | Loop over per-item PATCH calls; results in rate limiting, partial updates, and data staleness | Batch API processes up to 25M rows per batch; `supply_date` field feeds Delivery Promise as a first-class promise anchor | An integration engineer uploads a 10M-row CSV with current stock and `supply_date` for in-transit SKUs; Delivery Promise reflects both |
| See all scheduled and in-transit inventory across warehouses and sellers in one place | Switch between individual seller accounts or request manual reports | Consolidated inventory view (on-hand + scheduled batches) across warehouses and suppliers, integrated into the Supplier Management module | Operations Manager at a Tier 1 omnichannel merchant sees total available inventory per SKU across 200 franchise stores without switching accounts |

---

## Vision Concepts

**Future Inventory**
The platform capability that enables merchants to represent, sell, and manage stock that does not yet physically exist in a warehouse. "Future Inventory" is the internal, API, and Admin name — neutral enough to cover both pre-order (new product launches, where the item has never been in stock) and backorder (restocking of an item that went out of stock). The merchant configures the shopper-facing label. This is the same design decision Salesforce made with OCI: one platform feature, merchant-controlled status mapping.

**supply_date as a Promise Anchor**
The `supply_date` field in the Batch Inventory Update API CSV schema is the ingestion-layer expression of Future Inventory. When a merchant uploads a batch with `supply_date` set for a SKU+warehouse pair, the platform should treat that date as the availability anchor for SLA calculation in Delivery Promise and checkout, not as inert metadata. Connecting ingestion and promise through `supply_date` is the first concrete step in closing the gap between what merchants upload and what shoppers see.

**Scheduled Inventory Batch**
A first-class inventory entity representing a specific quantity of a SKU arriving at a specific future date at a given warehouse. Has its own lifecycle: `scheduled → received → expired / cancelled`. Orders placed against a batch reserve quantity from it; upon confirmed receipt, the batch quantity transitions to regular available stock and fulfillment-ready orders are released. Multiple batches per SKU+warehouse are supported, enabling merchants to represent distinct replenishment waves with different quantities and dates.

**Inventory Lifecycle**
The state machine governing how predicted stock transitions: `scheduled` (registered, future date) → `received` (arrival confirmed, transitions to regular stock) → `expired` (date passed without confirmation) / `cancelled` (supplier did not deliver). Each state change propagates automatically to Delivery Promise, OMS, and the shopper-facing storefront. This lifecycle eliminates the manual intervention step that today's workarounds depend on. No team member needs to remember to release backorder lines when a shipment arrives.

---

## Vision Statement

> **2026–2028 Vision:** Inventory Management will evolve from a number-plus-duration model into a lifecycle-aware, time-dimensioned data layer, making scheduled stock a first-class citizen of the platform, fully integrated with Delivery Promise, Async Orders, and the shopper-facing experience. Merchants will be able to sell what is not on the shelf yet, promise when it will arrive, and manage the full lifecycle from registration to receipt without manual intervention.

---

## Key Capabilities

1. **Future Inventory (single date, `supply_date` integration)** — Lead Time accepts an absolute date as the SLA anchor, in addition to the existing duration mode. `supply_date` in the Batch API feeds Delivery Promise, checkout SLA, seller selection (including franchise accounts), and cart simulation. Eliminates daily manual lead time adjustment.

2. **Scheduled Inventory Batches (multi-batch with quantity)** — Merchants register N batches per SKU+warehouse, each with an explicit quantity and arrival date. Orders reserve quantity from the nearest sufficient batch. The batch lifecycle (scheduled → received → expired / cancelled) is managed automatically.

3. **Inventory Lifecycle Automation** — Expiration when a scheduled date passes without confirmation, OMS-level signals for orders allocated to cancelled or expired batches, and automatic fulfillment release when receipt is confirmed. Merchants no longer manually release backorder lines.

4. **Unified Inventory Visibility** — Consolidated view of on-hand and scheduled inventory (including batches) across warehouses, sellers, and franchise accounts, integrated into the Supplier Management module for accounts managing multi-supplier and omnichannel operations. Built on a performant data architecture, not a retry on the facelift approach.

5. **Storefront Inventory Signals** — Inventory status (pre-order, backorder, arrives-on-date) propagates to Intelligent Search, Catalog, and PDP/PLP. Merchant-configurable shopper-facing labels. Delivery availability filters on search results pages.

---

## Conditions of Satisfaction

- Fast Shop and Samsung eliminate daily manual lead time adjustment within 60 days of GA of Future Inventory (single-date mode).
- Delivery Promise, checkout, seller selection, and cart simulation all correctly reflect `supply_date` anchor dates, including in franchise account and multi-seller architectures, validated by an automated integration test suite.
- Zero regression in existing Lead Time duration-mode behavior across all environments post-launch.
- Container Store, ODP, and World Wide Golf replace manual backorder release flows with Scheduled Inventory Batches within 90 days of Phase 2 GA.
- At least one Tier 1 customer launches a pre-order or backorder campaign using native Future Inventory, with a quantity cap and shopper-facing label on PDP, within 12 months of Storefront Signals availability.
- Supply Lot is officially deprecated with no support tickets from API consumers who were not notified. `[PM INPUT NEEDED: validate whether a Supply Lot usage audit has been run — this condition depends on confirming there are no active consumers]`
- `[PM INPUT NEEDED: measurable condition for Unified Inventory Visibility adoption — e.g., X Tier 1 omnichannel accounts using consolidated view in Supplier Management within 6 months of Phase 3 GA]`
- `[PM INPUT NEEDED: baseline and intermediate targets for Batch API supply_date adoption — % of batch uploads that include supply_date field 90 days after GA]`

---

## Non-Goals

- **ERP or WMS replacement** — VTEX receives arrival dates from the merchant; it does not compute or predict them. The platform is a consumer of replenishment data, not a source of it.
- **Supply chain forecasting** — Demand forecasting, reorder point calculation, and safety stock optimization are not in scope. AI-assisted insights are exploratory and not a commitment in this document.
- **Supply Lot evolution** — Supply Lot will be deprecated, not extended. The deprecation path will include a communication plan and migration guidance for any confirmed API consumers.
- **Multi-SLA per order (split fulfillment across batches)** — Splitting a single order across multiple batches with different delivery dates requires OMS and checkout changes beyond this vision's scope and is explicitly deferred.
- **B2B purchase order management** — Creating, approving, or tracking supplier purchase orders is out of scope. The platform receives arrival dates as input; it does not manage procurement upstream of VTEX.
- **Catalog and search architecture ownership** — Storefront Signals (Phase 3) depends on Intelligent Search and Catalog integration. This vision defines the requirement and dependency; it does not take ownership of the IS/Catalog propagation architecture.

---

## High Level Phasing

**Phase 1 — Future Inventory Foundation** *(2026 H1)*
Lead Time accepts an absolute date as the SLA anchor (date mode), integrated natively with Delivery Promise, checkout SLA, seller selection (including franchise accounts), and cart simulation. `supply_date` in the Batch API becomes a first-class promise anchor connected to the same model. Admin UI date picker ships alongside the API change. Supply Lot deprecation is announced with a migration path.
*Unlocks: Fast Shop and Samsung eliminate daily manual workarounds. `supply_date` exits beta with semantic value. Async Orders can index future inventory for OOS scenarios. Franchise account architectures correctly reflect scheduled stock in seller selection.*

*See:* `specs/001-future-inventory-date-mode/`

**Phase 2 — Scheduled Inventory Batches + Lifecycle** *(2026 H2 – 2027)*
Scheduled Inventory Batch introduced as a first-class inventory entity: quantity, arrival date, lifecycle state machine, OMS integration, quantity reservation per batch. Admin UI for batch management: create, edit, confirm receipt, cancel, expiration alerts. Orders allocated to expired or cancelled batches are surfaced for merchant action in OMS without automatic cancellation.
*Unlocks: Container Store, ODP, and World Wide Golf replace manual backorder release. NFI Parts tracks in-transit inventory with rules for future order allocation. Kirklands runs pre-order with quantity cap. Systematic backorder lifecycle replaces manual WMS-to-VTEX sync.*

*See:* `specs/002-scheduled-inventory-batches/`

**Phase 3 — Storefront Signals + Unified Visibility** *(2027–2028)*
Inventory status and scheduled arrival dates propagate to Intelligent Search and Catalog, enabling pre-order/backorder labels and arrival-date badges on PDP and PLP. Delivery-availability filters on search results. Consolidated inventory view (on-hand + scheduled batches) integrated into the Supplier Management module, built on a performant data architecture. Explore AI-assisted insights (ruptura risk signals, reorder recommendations) as a Tier 1 differentiator.
*Unlocks: Chick-fil-A and Kirklands show status labels on PDP. Omnichannel Operations Managers see unified inventory across all franchise stores. Competitive parity with SAP Future Stock and Salesforce OCI Future Inventory on storefront capability.*

*See:* `specs/003-storefront-inventory-signals/`, `specs/004-unified-inventory-visibility/`

---

## Future Specs

| Spec | Capability | Phase | Status |
|---|---|---|---|
| `specs/001-future-inventory-date-mode/` | Lead Time date mode, `supply_date` → DP integration, Admin UI date picker, Supply Lot deprecation plan | Phase 1 | Pending |
| `specs/002-scheduled-inventory-batches/` | Batch entity, lifecycle state machine, quantity reservation, OMS integration, Admin UI batch management | Phase 2 | Pending |
| `specs/003-storefront-inventory-signals/` | IS/Catalog propagation, pre-order/backorder labels, arrival-date badges, PLP filters | Phase 3 | Pending |
| `specs/004-unified-inventory-visibility/` | Consolidated on-hand + scheduled view in Supplier Management, performant data architecture | Phase 3 | Pending |

---

## Hotly Debated Topics

1. **Is Lead Time date mode a permanent offering or a migration stepping stone to Scheduled Batches?** Date mode and Scheduled Batches are architecturally different: date mode is a parameter on an existing entity (single date, no quantity boundary); Scheduled Batches is a new entity (multi-batch, quantity-bounded, lifecycle-managed). Shipping date mode as a permanent offering risks merchant confusion about which mechanism to use. If date mode is a stepping stone, the migration path from date mode to Scheduled Batches needs to be defined before Phase 1 ships.

2. **Does `supply_date` in the Batch API map to Lead Time date mode, or directly to a Scheduled Batch record?** The canonical mapping needs to be defined before the Batch API exits beta. If `supply_date` sets Lead Time in date mode, it creates a one-date-per-SKU constraint that conflicts with Phase 2 multi-batch semantics and may require a breaking contract change later.

3. **Is Supply Lot being used in production by any merchant today?** No audit has been run. If active consumers exist, the deprecation plan requires a migration path with sufficient runway. This is a gating dependency for Phase 1 communication.

4. **Who owns the Storefront Signals dependency on Intelligent Search and Catalog?** Phase 3 requires those teams to align on a propagation contract. If that alignment does not happen, Phase 3 either delays or requires a workaround architecture. This dependency should be surfaced in cross-team roadmap planning before Phase 2 ships.

5. **How does Future Inventory interact with the Async Orders order allocation model when a batch expires between order placement and fulfillment?** If an order is placed against a scheduled batch that subsequently expires or is cancelled, Async Orders needs a defined reallocation or cancellation path. This edge case needs alignment between the inventory and order management teams before Phase 1 GA.

---

## FAQs

**Why not fix Supply Lot instead of building something new?**
Supply Lot has three structural integration gaps that are not feature gaps: no propagation contract to Delivery Promise, no visibility to franchise account seller selection (scoped by `InstanceId`), and no Admin UI. Fixing these would require rebuilding Supply Lot's integration layer at roughly the same cost as building a correctly integrated solution from scratch. Lead Time already has the correct integrations with Delivery Promise, seller selection, and checkout. Extending it is significantly cheaper and lower risk. *(Source: Future Stock Assessment, Apr 2026)*

**Why is pre-order and backorder treated as one platform feature?**
Both scenarios require the same capability: represent a quantity of a SKU arriving on a specific future date, integrated with Delivery Promise and checkout. The difference is semantic and shopper-facing: it depends on whether the item has previously been in stock, which the platform does not track and merchants do not want the platform to enforce. The merchant controls the label. This is the same design decision Salesforce made with OCI: one platform feature, merchant-configured status mapping. *(Source: Benchmark — Competitor Nomenclature, 2026)*

**How does Future Inventory connect to Async Orders?**
Async Orders requires that all data needed to close an order is pre-indexed and available without a live call to the seller's system. Future Inventory makes scheduled stock indexable: a precondition for Async Orders to handle pre-order and backorder scenarios. Without a time-dimensioned inventory model, Async Orders cannot guarantee correct availability for out-of-stock items with known replenishment dates. The two initiatives are complementary: Future Inventory provides the data; Async Orders consumes it. *(Source: Async Orders Product Vision, Aug 2025)*

**Why did the 2024 Admin UI facelift fail, and why will this be different?**
The facelift failed because a performant unified inventory UI requires a data architecture that did not exist: the Catalog+Availability combination caused timeouts, new SKUs were invisible in the module until a stock record was manually created, and 65% of accounts in closed beta registered at least one rollback. Phase 3 of this vision addresses unified visibility only after the data architecture is fixed, starting from the right foundation, not retrofitting a UI on top of a broken model. *(Source: Facelift Inventory Management — Consolidado e próximos passos, 2025)*

**What happens to orders placed against a batch that expires or is cancelled before it is received?**
Expired batches: new orders are blocked against the batch; existing orders are flagged in OMS as "requires attention." Cancelled batches: same OMS signal. In both cases, the merchant decides the resolution path: reallocation to another batch, order cancellation, or direct communication to the shopper. The platform flags; it does not decide automatically. This is an intentional design boundary: automated cancellation of confirmed orders requires merchant consent and carries significant shopper experience risk.

---

## Appendix

### Source Documents

| Document | Link |
|---|---|
| Future Stock Assessment — Carol Tourinho, Apr 2026 | [Google Doc](https://docs.google.com/document/d/1jcSbSNa8LkDsgHXeqcEk0lT--6nWuUVPmazoazyNn14/edit) |
| BRD — Future Stock / Scheduled Lead Time — Carol Tourinho, May 2026 | [Google Doc](https://docs.google.com/document/d/1uNf8gdoV5CitAza0_Ckz98qI2HDIIdwGOkI8rfyssro/edit) |
| Proposed Solution — Scheduled Inventory Batches, 2026 | [Google Doc](https://docs.google.com/document/d/1Q5I5wYdKjIOg6RMQQ5Z65rPkLPA9SygKoXpG2DJD2Z8/edit) |
| Benchmark — Competitor Nomenclature (Future Inventory), 2026 | [Google Doc](https://docs.google.com/document/d/1DeRGwMxvC0tGUrzKzim0Uwbj2RGkUhwnF6rAK6qMAPk/edit) |
| [Fulfillment] Batch Inventory Updates, May 2026 | [Google Doc](https://docs.google.com/document/d/1ZdAd2aE9hzOqI767hFP8n8P9go8HQ7Pzpxl5emrnu2o/edit) |
| Async Orders — Product Vision — Vítor Borges, Aug 2025 | [Google Doc](https://docs.google.com/document/d/15iT5Qb_rETgL4Af-cMmfxn3DlXpE6fbvqNdgu5YFQ7k/edit) |
| Facelift Inventory Management — Consolidado e próximos passos, 2025 | [Google Doc](https://docs.google.com/document/d/1RK5toAztaZItlU_1o4GH22GqSCofseC584sjP1bIIXI/edit) |
| Supplier Management — Product Vision — Vítor Borges, 2023 | [Google Doc](https://docs.google.com/document/d/1xJqjnv7Zy8P_MwdpvFXrIFQ-mzxK6PRz7seWR8SlwmE/edit) |
| Logistics API Reference | [developers.vtex.com](https://developers.vtex.com/docs/api-reference/logistics-api) |

### Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carol Tourinho | Initial draft |
