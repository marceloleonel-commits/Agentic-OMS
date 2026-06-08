# Spec 002: Future Inventory

## Metadata

| Field | Value |
|---|---|
| **Module** | Inventory Management |
| **Status** | Work in Progress — discovery atualizado, ainda não pronto para desenvolvimento |
| **Author** | Carolina Tourinho |
| **Created** | May 2026 |
| **Source docs** | [[BRD] Future Inventory](https://docs.google.com/document/d/1jcSbSNa8LkDsgHXeqcEk0lT--6nWuUVPmazoazyNn14) · [Inventory Management Vision — PR #11](https://github.com/vtex/vertical-distributed-order-management-dom/pull/11) |

---

## Context

The VTEX inventory model has no time dimension. Stock is either present or absent. There is no native way to say "100 units arrive on May 14" and have that information feed the delivery promise shown to shoppers. This spec documents the use cases and requirements that a Future Inventory solution must satisfy.

---

## Use Cases

### Shopper's POV

**[Case 1] Purchase with only future inventory items**

Context: Item has no immediate stock — it's at zero. A merchant sells iPhone 17, currently out of stock at every warehouse and seller. The supplier confirmed delivery of 100 units on May 14. The merchant wants to start capturing orders now, with the real arrival date informing the delivery promise.

Expected outcome: The SLA for the specific warehouse and seller with future inventory is calculated and used in the seller selection heuristic. If another seller also had future inventory, both SLAs would be calculated and the heuristic would use them to determine which seller is selected.

---

**[Case 2] Mixed-SLA cart with the same SKU**

Context: Shopper needs to buy 2 iPhone 17s. The merchant has 1 unit available for immediate shipment. The supplier confirmed 100 units arriving on May 14.

Expected outcome: The shopper can buy both — one for immediate shipment and one with a later date. This results in 2 shipments and 2 separate freight calculations.

---

**[Case 3] Cart using 2 future inventory batches of the same SKU**

Context: Shopper needs to buy 2 iPhone 17s. The merchant has 0 units immediately available but two future lots: 1 unit arriving May 14 and 100 units arriving May 21.

Expected outcome: The shopper can buy both units from different lots, with different SLAs. This results in 2 shipments and 2 separate freight charges.

---

**[Case 4] Pre-order of a product with no registered stock**

Context: A merchant is launching iPhone 18 — a brand-new product with no stock registered in any warehouse. The supplier confirmed first units arriving June 1. The merchant wants to capture orders before physical arrival.

Expected outcome: The item appears as "Pre-order" on PDP, cart, and checkout, with SLA calculated from June 1 + carrier transit time. Unlike Case 1, there is no prior stock — availability is entirely created by the registered future lot. When stock is recorded on the expected date, pre-order orders are automatically released for fulfillment.

---

**[Case 5] Current and future stock for a SKU both sold out**

Context: A merchant sells iPhone 17. Immediate stock is depleted, and the only registered future lot — 100 units arriving May 14 — has all units reserved by prior orders. A new shopper tries to add the product to the cart.

Expected outcome: The item appears as unavailable on PDP, cart, and checkout, even though the lot date has not arrived yet. The platform does not allow new orders since all units — both on-hand and registered future — are committed. The merchant can register a new future lot to reopen availability.

---

**[Case 6] Cart with different SKUs with distinct availability from the same seller**

Context: Shopper adds an iPhone 17 and an iPhone case from the same seller. The case has immediate availability. The iPhone 17 only has future inventory, with a lot arriving May 14. The seller operates with a single warehouse.

Expected outcome: WIP — Depends on an open business decision: ship items separately as each becomes available (2 freight charges), or consolidate the order and wait for the longer-lead item (1 freight charge). Each approach has different implications for shopper experience, shipping cost, and merchant operations.

> **Open decision — feedback round (Jun 2026):** The interviews (solution engineers, solution architects, and commerce engineers from the Growth team) concluded that the **merchant configures the default** — always split or always consolidate — since separate shipping does not make sense for every merchant. Desired evolution: the rule could also **vary by product category**, and the **shopper could be allowed to choose at checkout**, which connects to **multi-checkout**. **Pending:** v1 scope — a merchant-level default only, or also per-category granularity and shopper choice. See Open Question 4.

---

**[Case 7] Purchase up to the available quantity in a lot**

Context: Shopper wants to buy 5 units of a product. The only future lot registered has 3 units available.

Expected outcome: The shopper can add at most 3 units to the cart. Attempting to add a 4th triggers a standard out-of-stock error. The platform treats this as a normal availability limit.

---

**[Case 8] Seller selection in multi-seller architecture with future inventory**

Context: A SKU is available through 2 sellers: Seller A has immediate stock, Seller B has a future lot arriving May 14. Both have the same SLA.

Expected outcome: The seller selection heuristic continues to apply its normal criteria. When SLA is tied, no preference is given to immediate stock over future stock — the next tiebreaker criterion applies. Note: with more flexible allocation logic, a merchant might prefer to prioritize immediate stock even at the cost of a worse SLA — this is an open question to explore with the Order Allocation PM.

> **Insight to hand off — feedback round (Jun 2026):** Not a decision for this spec. Interviewees argued that immediate-vs-future inventory is **not the most critical variable** for seller selection and should be **one of several merchant-defined variables in the future allocation engine**, rather than a hardcoded heuristic rule. **Next step:** hand this off to the Order Allocation team. See Open Question 5.

---

**[Case 9] Order cancellation with future inventory reservation**

Context: A shopper bought 1 unit reserved from a future lot with arrival on May 14. Before the arrival date, the merchant cancels the order.

Expected outcome: The cancelled reservation is returned to the lot and becomes available for new orders, the same way any cancelled reservation works today.

---

**[Case 10] Multiple lots of the same SKU in the same warehouse**

Context: A merchant has 3 lots registered for iPhone 17 in the same warehouse: 50 units on May 14, 100 on May 28, and 80 on June 11. A shopper buys 1 unit.

Expected outcome: The reservation is allocated to the lot with the nearest date that still has available units (FIFO by arrival date). The SLA shown at checkout reflects that lot's date.

> **Decided — feedback round (Jun 2026):** Allocation is **always FIFO by arrival date** — the nearest upcoming lot date is consumed first. The alternative of selecting by delivery deadline (best-SLA) was discussed and dropped.

---

### Merchant's POV

**[Case 11] Lot quantity reduction with active reservations**

Context: A merchant registered a lot of 100 iPhone 17 units arriving July 14. 90 units are already reserved by active orders. Before July 14, the supplier confirms only 80 units will be shipped. The merchant updates the lot quantity to 80.

Expected outcome: WIP

What happens to inventory: If the lot drops to 80 and there are 90 reservations, available stock goes to -10. The platform must represent this correctly and block new sales from the moment the balance is negative. Concretely (per the interviews), the reservation set is now over-committed: of the 90 reserved units, 80 can be honored by the lot and **10 remain "owed"** — they have a valid reservation but no physical unit backing them once the lot arrives. This over-committed state must be explicit, not hidden behind the aggregate negative balance.

What happens to the 10 excess orders: This is a merchant decision, outside the scope of inventory. The platform should not automatically cancel or migrate orders — those actions have financial and customer impact. The merchant must handle them.

---

**[Case 12] Arrival date change on a lot with active reservations**

Context: A merchant registered a lot of 100 iPhone 17 units arriving July 14. 90 units are already reserved by active orders, all with SLA calculated from that date. The supplier confirms the lot will now arrive July 21.

Expected outcome: Updating the lot follows the same behavior as a standard inventory update today and introduces **no new platform-driven communication** — there is no notification to the merchant or the shopper. Communicating any delivery-date change to the shopper remains the merchant's responsibility, exactly as it already is for any delivery-date change on the platform.

> **Decided — feedback round (Jun 2026):** No platform-driven communication for lot date or quantity changes (neither merchant nor shopper). The behavior is exactly the same as inventory management today.

---

**[Case 13] Automatic transition from future lot to available stock on the scheduled date**

Context: The scheduled arrival date for a lot of 100 units of SKU A at Warehouse A has arrived. The merchant previously registered this lot with arrival date May 22. Before midnight, Warehouse A had 0 available units for SKU A.

Expected outcome: At the turn of May 22 (00:00), the 100 units are automatically converted to available stock at Warehouse A, with no manual action required from the merchant. This inventory update triggers the same downstream flow as a manual update: item reindexing and broadcaster notification. The event must carry an origin identifier indicating it was triggered by a future inventory lot, ensuring traceability in logs for both the merchant and the internal team.

---

**[Case 14] Payment behavior for pre-order orders**

Context: A shopper completes checkout for a pre-order item with a lot arriving in 30 days.

Expected outcome: The order follows the platform's existing payment capture configuration. It is not possible to configure different capture behavior in Logistics specifically for future inventory orders.

---

**[Case 15] Inventory export including future lots**

Context: A merchant wants to know the full inventory position for a SKU — both on-hand and future — via API or Admin export.

Expected outcome: Inventory export endpoints (List inventory by SKU, List inventory per warehouse, List inventory per dock, List inventory per dock and warehouse) return the configured future inventory alongside on-hand stock.

> **Dependency:** This relies on the inventory export surface being extended to include future lots. The export endpoints (and the Admin/sheet export) must be updated to return future inventory and its arrival date — a dependency to track with the inventory APIs. See Dependencies.

---

**[Case 16] Lot arrives with fewer units than registered (damaged or lost in transit)**

> Added from the feedback round (Jun 2026) — raised in the interviews. Not previously mapped.

Context: A merchant registered a lot of 100 units of iPhone 17 arriving May 14, with 90 units already reserved by active orders. On arrival, only 95 units are usable — the rest were damaged or lost in transit. The received quantity differs from the registered quantity.

Expected outcome: WIP — The actual received quantity may be lower than the registered quantity. The platform must reconcile the received quantity against active reservations. When the received quantity is below the reserved quantity, the result is the same over-committed state described in Case 11 (some reservations are "owed" with no physical unit backing them), and may require a **reallocation** flow — sourcing the affected reservations from another lot or warehouse. **Pending:** whether reallocation is automatic (platform re-sources from the next available lot/warehouse) or a merchant action, and how the discrepancy at receipt is captured. See Open Question 7.

---

**[Case 17] Batch inventory update must support future lots**

> Added from the feedback round (Jun 2026) — raised in the interviews. Dependency, not previously mapped.

Context: Merchants can use the Batch Update solution to update inventory in VTEX. Today this solution is not adapted for future inventory.

Expected outcome: The batch update accepts **optional columns** in the CSV/sheet to represent future inventory — at minimum the lot's arrival date. Behavior per row:
- **Arrival date filled** → the row is treated as a future inventory lot (quantity + arrival date).
- **No date** → current behavior unchanged: a normal on-hand update.

The change is backward compatible (the new columns are optional, so existing sheets and integrations keep working). This is a dependency for managing future inventory at scale and must be tracked with the inventory APIs. See Dependencies.

---

## Open Questions

1. **Supply Lot deprecation:** Is any merchant actively using Supply Lot in production today? No audit has been run. This is a gating dependency for any deprecation communication.

2. **Lot arrival confirmation — automatic vs. manual:** Case 13 assumes automatic transition at midnight on the scheduled date. An alternative is requiring explicit merchant confirmation of receipt before the stock becomes available. The trade-off is automation (eliminates manual steps) vs. accuracy (prevents stock from going live if the shipment is delayed without the merchant updating the system). This connects to Cases 11 and 12 (quantity reduction and date change).

3. **Behavior when a lot date passes without confirmation:** What happens if midnight passes and the merchant has not confirmed or updated the lot? Does the lot expire automatically? Does the platform alert the merchant? Do existing reservations remain active? This is the concrete manifestation of the "expired" state in the planned lifecycle.

4. **Mixed-SLA shopper experience:** When a cart contains immediate and future stock for the same SKU (Cases 2 and 3), how is the split shipment presented to the shopper at checkout? Does the shopper see separate line items with distinct SLAs, or a consolidated view?

5. **Allocation engine — future vs. immediate stock (Case 8):** Should the future-vs-immediate preference be one of several merchant-defined variables in the future allocation engine, rather than a hardcoded heuristic rule? This is an insight to hand off to the Order Allocation team, not a decision for this spec.

6. **Lifecycle ownership for ERP-driven B2B accounts:** For merchants whose ERP already controls inventory stages (e.g., AramisB2B), is platform **visibility** of the future lot enough, or should the platform actively own the lifecycle? The feedback round leaned toward a passive/visibility approach for these accounts. This is a scope-boundary decision that affects how much of the lifecycle (scheduled → in transit → received → expired) the platform must own natively.

7. **Lot arrival discrepancy & reallocation (Case 16):** When the received quantity is lower than registered (damaged/lost in transit), how is the discrepancy captured at receipt, and is the resulting reallocation of over-committed reservations automatic (re-source from another lot/warehouse) or a merchant action?

---

## Decisions Made (feedback round, Jun 2026)

- **Lot allocation criterion (Case 10):** Allocation is always **FIFO by arrival date** — the nearest upcoming lot date is consumed first. Selecting by delivery deadline (best-SLA) was discussed and dropped.
- **Communication on lot changes (Case 12):** The platform introduces **no new communication** to the merchant or the shopper when a lot's date or quantity changes. Behavior matches inventory management today; communicating delivery-date changes to the shopper stays with the merchant.

---

## Dependencies

These are existing inventory capabilities that must be extended for Future Inventory to work end-to-end. They are dependencies to track and align with the inventory APIs.

- **Inventory export (Case 15):** The export surface — `List inventory by SKU`, `List inventory per warehouse`, `List inventory per dock`, `List inventory per dock and warehouse`, plus the Admin/sheet export — must return future inventory and its arrival date alongside on-hand stock.
- **Batch inventory update (Case 17):** The batch update interface (API and sheet) must accept an **arrival date** per entry so future lots can be registered and updated in bulk. Without a date, an entry remains a normal on-hand update.

---

## Out of Scope

- **Multiple future batches per SKU with quantity limits (full batch lifecycle management)** — the use cases here describe the end-state behavior; the implementation of a multi-batch entity with a full lifecycle (scheduled → received → expired → cancelled) is a scope decision to be made with engineering.
- **Automatic backorder fulfillment release via WMS/ERP integration** — receiving stock confirmation from an external system and automatically releasing orders to fulfillment is referenced in Case 13 but the integration contract with external systems is out of scope here.
- **Shopper-facing status labels** ("Pre-order", "Back-ordered — arrives June 1") — surfacing these labels in storefront, Intelligent Search, and PDP/PLP depends on Catalog and IS integration and is tracked separately.
- **Unified inventory visibility dashboard** — a consolidated Admin view of on-hand and future inventory across warehouses and sellers is referenced in Case 15 but not specified in detail here.
- **Supply chain forecasting and demand planning** — the platform receives arrival dates from the merchant; it does not predict or compute them.

---

## Appendix

### Affected Clients / Prospects

Only **Fast Shop** and **Samsung** are current clients; the remaining accounts are prospects. The prospects are relevant because they raised this requirement in their **RFPs** — VTEX is being actively evaluated on it, so the gap has a direct impact on deal qualification.

| Account | Type | Need | Workaround today |
|---|---|---|---|
| Fast Shop | Client | Anchored delivery promise for scheduled replenishments | Manual daily lead time adjustment |
| Samsung | Client | Pre-order for high-ticket electronics | Manual daily lead time adjustment |
| Container Store | Prospect | Backorder release when stock arrives | Manual WMS-to-VTEX release |
| World Wide Golf | Prospect | Backorder release when stock arrives | Manual WMS-to-VTEX release |
| ODP | Prospect | Future stock visibility | No workaround — SKUs go unavailable |
| NFI Parts | Prospect | B2B restocking with scheduled availability | `[PM INPUT NEEDED]` |
| Kirklands | Prospect | Pre-order with quantity cap and shopper notification | Not possible today |
| Chick-fil-A | Prospect | Item status labels (pre-order / backorder) | Not possible today |

### Source Documents

| Document | Link |
|---|---|
| [BRD] Future Inventory | [Google Doc](https://docs.google.com/document/d/1jcSbSNa8LkDsgHXeqcEk0lT--6nWuUVPmazoazyNn14) |
| Inventory Management Vision | [PR #11](https://github.com/vtex/vertical-distributed-order-management-dom/pull/11) |

### Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial draft — use cases from BRD discovery |
| Jun 2026 | Carolina Tourinho | Feedback round insights (Miro discovery board): added callouts to Cases 6, 8, 10, 11, 12; added Case 16 (lot arrival discrepancy / reallocation); expanded Open Questions. Inputs from interviews with solution engineers, solution architects, and commerce engineers from the Growth team. |
| Jun 2026 | Carolina Tourinho | Resolved decisions from feedback round: Case 10 lot allocation is always FIFO by arrival date; Case 12 introduces no platform-driven communication on lot changes (same as inventory management today). Case 8 reframed as an insight for the Order Allocation team. Open Questions renumbered. |
| Jun 2026 | Carolina Tourinho | Flagged Case 15 (inventory export) as a dependency; added Case 17 (batch inventory update must accept an arrival date for future lots); added a Dependencies section consolidating both. |
