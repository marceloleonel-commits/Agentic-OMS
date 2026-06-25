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
Supply Lot, API-only since 2020 with no Admin UI and no updates since 2021, fails in the architectures enterprise customers run: it does not integrate with Delivery Promise (the item shows up as unavailable to the shopper), and in white-label seller selection the SLA compared is the transit-time SLA — the future arrival date is ignored, so future stock does not influence which seller wins. These are exactly the architectures the platform is evolving toward and that enterprise customers want to adopt, which makes Supply Lot structurally unviable to extend.

---

## Business Requirements

1. Merchants must be able to register expected stock arrivals per SKU per warehouse with a scheduled date and quantity, and have that information feed the delivery promise shown to shoppers at checkout.
2. The platform must differentiate between available stock and predicted stock without requiring recurring manual intervention from the merchant.
3. The solution must work in Delivery Promise, multi-seller, and franchise account architectures — the exact architectures where Supply Lot fails today.
4. Orders placed against future inventory must carry an explicit mark in the order payload (ideally at item level), consumable by integrations, OMS, and reports — so future-inventory orders can be isolated without inferring it from the delivery date.
5. Merchants must be able to configure how future stock is consumed: as a fallback only when immediate stock runs out, or combined with immediate stock in the same purchase.

## Recommendation

Build a native Future Inventory solution that is integrated with Delivery Promise, works in multi-seller and white-label seller selection, and ships with an Admin UI from day one — the integration points Supply Lot lacks. Lead Time is a useful reference for the bar to clear: it is a native inventory feature that was born already adapting to these platform surfaces. Give customers a path to **migrate off** the existing Supply Lot feature (API-only since 2020, no Admin UI, no updates since 2021), which fails structurally in the exact architectures enterprise customers are adopting (see spec for the detailed failure modes). Any decision about formally deprecating Supply Lot depends on auditing its current production usage first.

---

## Who Benefits

| Account | Need | Workaround today |
|---|---|---|
| Fast Shop | Anchored delivery promise for scheduled replenishments | Manual daily lead time adjustment |
| Samsung | Sell high-ticket electronics during the pre-arrival window | Manual daily lead time adjustment |

> Additional accounts (NFI Parts, Chick-fil-A, Kirklands, Container Store, ODP, World Wide Golf) surfaced this need through RFPs. They are tracked as demand signal in the spec appendix, not as confirmed customers for this scope yet.

---

## Release Scope

**V1 — first release.** A merchant registers a future lot and the platform sells it immediately with an SLA anchored to the arrival date, flowing into Delivery Promise and seller selection, with the lot converting to on-hand automatically on the arrival date.
- Lot registration & editing (Admin + API)
- Future-inventory reference in the order payload
- Future stock availability mode (fallback vs. combined)
- Future SLA considered in seller selection

**V2 — second release.**
- Future Inventory UI in Inventory Management
- Future inventory in the Inventory Export spreadsheet
- Pre-sale date precedence (`max(pre-sale date, lot arrival date)`; depends on Catalog)
- Multiple lots, FIFO by date
- Mixed cart split (immediate + future)

**Later.**
- Batch Inventory Update support
- Date-change notification (Message Center trigger)

> Reservation behavior reuses the platform's existing mechanism (implicit across releases); pre-order payment inherits the platform default. See the spec for the full case mapping.

---

## Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial draft |
| Jun 2026 | Carolina Tourinho | Synced with BRD update: added order-level origin identifier and fallback/combined consumption requirements; added a recommendation to give customers a path to migrate off Supply Lot (Lead Time framed as a reference, not as the feature being evolved). |
| Jun 2026 | Carolina Tourinho | Aligned brief with spec review: reframed Supply Lot failure (white-label seller selection compares transit-time SLA, ignoring the arrival date) without jargon; emphasized the order-payload mark for future-inventory origin. |
| Jun 2026 | Carolina Tourinho | Added "Release Scope" section (V1 / V2 / Later), aligned with the spec's prioritization: future-inventory reference in the order and future stock availability mode promoted to V1; mixed cart split in V2; reservation behavior and pre-order payment treated as implicit/inherited. |
