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

| Account | Need | Workaround today |
|---|---|---|
| Fast Shop | Anchored delivery promise for scheduled replenishments | Manual daily lead time adjustment |
| Samsung | Sell high-ticket electronics during the pre-arrival window | Manual daily lead time adjustment |
| Container Store | Automatic backorder release when stock arrives | Manual WMS-to-VTEX intervention |
| World Wide Golf | Automatic backorder release when stock arrives | Manual WMS-to-VTEX intervention |
| ODP | Future stock visibility — today SKUs go unavailable with no workaround | None |
| NFI Parts | Track backordered inventory and sell with a scheduled availability date | `[PM INPUT NEEDED]` |
| Kirklands | Pre-order with quantity cap and shopper notification on availability | Not possible today |
| Chick-fil-A | Native item status signals: in stock / out of stock / back ordered / pre-order | Not possible today |

---

## Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial draft |
