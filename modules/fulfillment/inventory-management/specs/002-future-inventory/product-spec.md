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

---

**[Case 7] Purchase up to the available quantity in a lot**

Context: Shopper wants to buy 5 units of a product. The only future lot registered has 3 units available.

Expected outcome: The shopper can add at most 3 units to the cart. Attempting to add a 4th triggers a standard out-of-stock error. The platform treats this as a normal availability limit.

---

**[Case 8] Seller selection in multi-seller architecture with future inventory**

Context: A SKU is available through 2 sellers: Seller A has immediate stock, Seller B has a future lot arriving May 14. Both have the same SLA.

Expected outcome: The seller selection heuristic continues to apply its normal criteria. When SLA is tied, no preference is given to immediate stock over future stock — the next tiebreaker criterion applies. Note: with more flexible allocation logic, a merchant might prefer to prioritize immediate stock even at the cost of a worse SLA — this is an open question to explore with the Order Allocation PM.

---

**[Case 9] Order cancellation with future inventory reservation**

Context: A shopper bought 1 unit reserved from a future lot with arrival on May 14. Before the arrival date, the merchant cancels the order.

Expected outcome: The cancelled reservation is returned to the lot and becomes available for new orders, the same way any cancelled reservation works today.

---

**[Case 10] Multiple lots of the same SKU in the same warehouse**

Context: A merchant has 3 lots registered for iPhone 17 in the same warehouse: 50 units on May 14, 100 on May 28, and 80 on June 11. A shopper buys 1 unit.

Expected outcome: The reservation is allocated to the lot with the nearest date that still has available units (FIFO by arrival date). The SLA shown at checkout reflects that lot's date.

---

### Merchant's POV

**[Case 11] Lot quantity reduction with active reservations**

Context: A merchant registered a lot of 100 iPhone 17 units arriving July 14. 90 units are already reserved by active orders. Before July 14, the supplier confirms only 80 units will be shipped. The merchant updates the lot quantity to 80.

Expected outcome: WIP

What happens to inventory: If the lot drops to 80 and there are 90 reservations, available stock goes to -10. The platform must represent this correctly and block new sales from the moment the balance is negative.

What happens to the 10 excess orders: This is a merchant decision, outside the scope of inventory. The platform should not automatically cancel or migrate orders — those actions have financial and customer impact. The merchant must handle them.

---

**[Case 12] Arrival date change on a lot with active reservations**

Context: A merchant registered a lot of 100 iPhone 17 units arriving July 14. 90 units are already reserved by active orders, all with SLA calculated from that date. The supplier confirms the lot will now arrive July 21.

Expected outcome: WIP — Depends on a decision about how the platform propagates the date change to orders with SLA already promised to shoppers. Requires defining: whether SLA recalculation is automatic or manual, whether the shopper is notified about the new delivery date, and who is responsible for that communication. Current platform behavior for delivery date changes puts the responsibility on the merchant to communicate with the shopper.

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

---

## Open Questions

1. **Supply Lot deprecation:** Is any merchant actively using Supply Lot in production today? No audit has been run. This is a gating dependency for any deprecation communication.

2. **Lot arrival confirmation — automatic vs. manual:** Case 13 assumes automatic transition at midnight on the scheduled date. An alternative is requiring explicit merchant confirmation of receipt before the stock becomes available. The trade-off is automation (eliminates manual steps) vs. accuracy (prevents stock from going live if the shipment is delayed without the merchant updating the system). This connects to Cases 11 and 12 (quantity reduction and date change).

3. **Behavior when a lot date passes without confirmation:** What happens if midnight passes and the merchant has not confirmed or updated the lot? Does the lot expire automatically? Does the platform alert the merchant? Do existing reservations remain active? This is the concrete manifestation of the "expired" state in the planned lifecycle.

4. **Mixed-SLA shopper experience:** When a cart contains immediate and future stock for the same SKU (Cases 2 and 3), how is the split shipment presented to the shopper at checkout? Does the shopper see separate line items with distinct SLAs, or a consolidated view?

5. **Seller preference — future vs. immediate stock:** Case 8 raises whether merchant-configurable allocation rules should allow prioritizing immediate stock over future stock regardless of SLA. This requires alignment with the Order Allocation PM.

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

| Account | Need | Workaround today |
|---|---|---|
| Fast Shop | Anchored delivery promise for scheduled replenishments | Manual daily lead time adjustment |
| Samsung | Pre-order for high-ticket electronics | Manual daily lead time adjustment |
| Container Store | Backorder release when stock arrives | Manual WMS-to-VTEX release |
| World Wide Golf | Backorder release when stock arrives | Manual WMS-to-VTEX release |
| ODP | Future stock visibility | No workaround — SKUs go unavailable |
| NFI Parts | B2B restocking with scheduled availability | `[PM INPUT NEEDED]` |
| Kirklands | Pre-order with quantity cap and shopper notification | Not possible today |
| Chick-fil-A | Item status labels (pre-order / backorder) | Not possible today |

### Source Documents

| Document | Link |
|---|---|
| [BRD] Future Inventory | [Google Doc](https://docs.google.com/document/d/1jcSbSNa8LkDsgHXeqcEk0lT--6nWuUVPmazoazyNn14) |
| Inventory Management Vision | [PR #11](https://github.com/vtex/vertical-distributed-order-management-dom/pull/11) |

### Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial draft — use cases from BRD discovery |
