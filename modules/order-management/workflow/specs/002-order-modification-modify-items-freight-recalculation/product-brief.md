# Product Brief — Order Modification: Freight Recalculation on Item Changes

| Field | Value |
|---|---|
| **Module** | order-management |
| **Pillar** | Order modification |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | Ramon Steffens da Silva |
| **Status** | Draft |
| **Expected Release** | MVP 2026-Q2 |
| **Availability** | General Availabilty |
| **Access** | API (MVP) |
| **Mode** | B2C & B2B |


## MMR

**Title:** Order Modification — Freight Recalculation on Item Changes

**Description:** With this release, VTEX OMS will automatically recalculate freight whenever order items are added, removed, or replaced after placement. Today, merchants must calculate the freight delta independently and inject it manually via `IncrementValue` in the change order API — a workaround that produces incorrect order totals when the merchant's calculation diverges from VTEX's freight engine, and fails entirely for delivery address changes. With automatic freight recalculation, the order total always reflects the correct shipping cost after any item modification, eliminating the need for merchants to maintain external freight calculation logic or rely on third-party OMS tools such as OMS Síntese and NeoMode.

**Availability:** Closed Beta · 2026-Q2 (API)

**Target Audience:**
- Tier: Tier-1 and advanced Tier-2 merchants — grocery and fashion operators
- Persona: Primary — Integration Engineers; Secondary — OMS Operators, SAC Agents
- Pain: The change order API does not trigger freight recalculation when items change. Merchants must calculate the freight delta themselves and pass it manually via `IncrementValue`. This approach fails when the merchant's calculation diverges from VTEX's freight engine, produces incorrect order totals with no platform-level validation, and does not support delivery address changes at all. 90% of grocery orders go through at least one change operation — making absent freight recalculation a baseline operational failure for the segment. CarrefourBR and ZonaSul both identified this limitation as affecting all item-change operations (add, remove, substitute, discount/surcharge). 70 of 124 mapped change use cases (43%) are unsupported today, and freight recalculation gaps contribute directly to this number.
- Use Case: When a merchant modifies order items — adding, removing, or substituting — OMS automatically recalculates the freight value using the updated cart and reflects the correct shipping cost in the order total, without requiring manual delta injection by the merchant or their integration layer.

---

## Scope

**In scope:**
- Automatic freight recalculation triggered by item addition to an active order
- Automatic freight recalculation triggered by item removal from an active order, including full line-item removal
- Automatic freight recalculation triggered by item substitution (SKU replacement) in an active order
- Freight recalculation for weighted items with unit-of-measure flexibility (e.g., grams, kg)
- Support for B2C Standard and B2C Omnichannel (franchise-account) architectures
- Correct freight value reflected in order total without requiring `IncrementValue` manual injection by the merchant

**Not in scope:** Delivery address change (change API does not support address changes today — separate scope); promotion recalculation on item changes (separate MMR 003); tax recalculation on item changes (covered in MMR 001); payment transaction management for freight delta increases (payment constraint handling owned by the payment layer); freight recalculation as part of seller reassignment (separate MMR 004).
