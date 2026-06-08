# Future Inventory

**Spec:** 002 — Future Inventory
**Module path:** inventory-management
**Pillar:** Fulfillment / Availability
**PM:** Carolina Tourinho · carolina.rodrigues@vtex.com
**Status:** Work in Progress — discovery atualizado, ainda não pronto para desenvolvimento
**Availability:** Coming Soon

**Related assets:**
- [[BRD] Future Inventory](https://docs.google.com/document/d/1jcSbSNa8LkDsgHXeqcEk0lT--6nWuUVPmazoazyNn14) — discovery and requirements
- [Inventory Management Vision — PR #11](https://github.com/vtex/vertical-distributed-order-management-dom/pull/11) — 3-year strategic context

---

## Problem

VTEX's inventory model represents stock as either existing or non-existent. There is no native concept of "will be available on date X." Three structural gaps compound this limitation:

**1. No native way to sell and promise stock that hasn't physically arrived.**
The platform cannot represent an upcoming replenishment batch as available inventory. Merchants who know a shipment is arriving on a specific date cannot anchor the delivery promise to that date — they either hide the product entirely (losing the demand capture window at peak purchase intent) or open stock and risk overselling.

**2. No lifecycle for predicted inventory.**
There is no platform-native lifecycle for a planned batch — no progression from scheduled → in transit → received → expired. As a consequence, merchants intervene manually to keep promises accurate: Fast Shop and Samsung adjust lead times by hand every day to approximate an arrival date. Container Store, World Wide Golf, and ODP manually release backorder order lines when stock arrives in their WMS, outside VTEX. 8 confirmed enterprise customers are running these workarounds in production today.

**3. The existing Supply Lot feature fails in the architectures enterprise customers need.**
Supply Lot, API-only since 2020 with no Admin UI and no updates since 2021, does not integrate with Delivery Promise and is invisible to franchise account seller selection. The architectures where Supply Lot fails are exactly the ones the platform is evolving toward and that enterprise customers want to adopt. It is structurally unviable to extend.

---

## Business Requirements

1. Merchants must be able to register expected stock arrivals per SKU per warehouse with a scheduled date and quantity, and have that information feed the delivery promise shown to shoppers at checkout.
2. The platform must differentiate between available stock and predicted stock without requiring recurring manual intervention from the merchant.
3. The solution must work in Delivery Promise, multi-seller, and franchise account architectures — the exact architectures where Supply Lot fails today.

---

## Who Benefits

Only **Fast Shop** and **Samsung** are current clients; the remaining accounts are prospects. The prospects are relevant because they raised this requirement in their **RFPs** — VTEX is being actively evaluated on it, so the gap has a direct impact on deal qualification.

| Account | Type | Need | Workaround today |
|---|---|---|---|
| Fast Shop | Client | Anchored delivery promise for scheduled replenishments | Manual daily lead time adjustment |
| Samsung | Client | Sell high-ticket electronics during the pre-arrival window | Manual daily lead time adjustment |
| Container Store | Prospect | Automatic backorder release when stock arrives | Manual WMS-to-VTEX intervention |
| World Wide Golf | Prospect | Automatic backorder release when stock arrives | Manual WMS-to-VTEX intervention |
| ODP | Prospect | Future stock visibility — today SKUs go unavailable with no workaround | None |
| NFI Parts | Prospect | Track backordered inventory and sell with a scheduled availability date | `[PM INPUT NEEDED]` |
| Kirklands | Prospect | Pre-order with quantity cap and shopper notification on availability | Not possible today |
| Chick-fil-A | Prospect | Native item status signals: in stock / out of stock / back ordered / pre-order | Not possible today |

---

## Discovery & Feedback Outcomes

The discovery feedback round — interviews with solution engineers, solution architects, and commerce engineers from the Growth team (captured on the Miro board) — produced the outcomes below. Some are decided; others remain open and shape scope before engineering handoff. Detailed per-case context lives in `product-spec.md`.

| Topic | What we learned | Status |
|---|---|---|
| **Split shipment** — a cart mixes immediate and future stock: ship each item as it becomes available, or wait and send everything together? | The merchant configures the default — always split or always consolidate — since separate shipping doesn't make sense for every merchant. Desired evolution: the rule could also vary by product category, and the shopper could be allowed to choose at checkout (connects to multi-checkout). | **Open** — define v1 scope: merchant-level default only, or also per-category granularity and shopper choice. (Spec Case 6) |
| **Lot arrival discrepancy** — a lot arrives with fewer units than registered (damaged or lost in transit). | Reservations left over-committed may need a reallocation flow. | **Open** — automatic reallocation vs. merchant action. (Spec Case 16) |
| **Lifecycle ownership for ERP-driven B2B** — accounts whose ERP already controls inventory stages (e.g., AramisB2B). | Platform visibility of the future lot may be enough; the round leaned toward a passive approach for these accounts. | **Open** — scope boundary: how much of the lifecycle the platform owns natively. (Spec Open Question 6) |
| **Which lot fulfills an order** — when a SKU has several future lots. | Always FIFO by arrival date — the nearest upcoming date is consumed first. | **Decided.** (Spec Case 10) |
| **Communication on lot changes** — a lot's date or quantity changes while it has active reservations. | No platform-driven communication to the merchant or the shopper. Behaves exactly like inventory management does today. | **Decided.** (Spec Case 12) |
| **Seller allocation: future vs. immediate stock** — should immediate stock be preferred over future stock? | Not a hardcoded rule; it should be one of several merchant-defined variables in the future allocation engine. | **Insight to hand off** to the Order Allocation team — not a decision for this spec. (Spec Case 8) |

---

## Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial draft |
| Jun 2026 | Carolina Tourinho | Added "Discovery & Feedback Outcomes" section from the discovery feedback round (interviews with solution engineers, solution architects, and commerce engineers from the Growth team). Decided: FIFO-by-arrival-date lot allocation and no platform-driven communication on lot changes. Open: split-shipment scope, lot arrival discrepancy, ERP-driven B2B lifecycle ownership. Seller allocation flagged as an insight for the Order Allocation team. |
