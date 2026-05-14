# Product Brief — Order Modification: Modify Items (Add, Remove, Replace)

| Field | Value |
|---|---|
| **Module** | order-management |
| **Pillar** | Order modification |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | Túlio Araújo |
| **Status** | Draft |
| **Expected Release** | MVP 2026-Q2 |
| **Availability** | General Availability |
| **Access** | API (MVP) · OMS Admin UI (MLP) |
| **Mode** | B2C & B2B |


## MMR

**Title:** Order Modification — Modify Items (Add, Remove, Replace)

**Description:** With this release, merchants will be able to add new items, remove existing items, and replace items in active orders through VTEX OMS — with automatic recalculation of freight, taxes, and inventory reservations. When a stock shortage occurs or a customer requests a substitution, operators can resolve the issue within OMS without relying on external tools or manual API calls. End customers are notified of all changes in real time via email and My Orders.

**Availability:** Closed Beta · 2026-Q2 (API) · 2026-Q3 (OMS Admin UI)

**Target Audience:**
- Tier: Tier-1 and advanced Tier-2 merchants — grocery, fashion, and marketplace operators
- Persona: Primary — OMS Operators, SAC Agents; Secondary — Integration Engineers (Tier-1)
- Pain: The current Change Order tool only logs modifications without validating the order flow — it does not update inventory reservations, recalculate freight automatically, or support B2C Omnichannel (franchise-account) architectures, which represent more than 40% of Tier-1 sellers. As a result, 70 of 124 mapped change use cases (43%) are unsupported today, forcing merchants to rely on third-party OMS tools such as OMS Síntese and NeoMode, or on custom integrations that bypass VTEX OMS entirely.
- Use Case: Allow operators to add, remove, or replace items in an active order while OMS automatically updates inventory reservations, recalculates freight and taxes, and notifies the end customer — across B2C Standard and B2C Omnichannel (franchise-account) architectures.

---

## Scope

**In scope:**
- Add new items to an active order
- Remove existing items from an active order, including full line-item removal
- Replace an existing item with an alternative SKU (substitution)
- Automatic inventory reservation update when items are added, removed, or replaced
- Automatic freight recalculation triggered by item changes
- Automatic tax recalculation triggered by item changes
- Support for weighted items with unit-of-measure flexibility (e.g., grams, kg)
- End-customer communication (email and My Orders) reflecting item changes, including weighted-item substitutions
- Support for B2C Standard and B2C Omnichannel (franchise-account) architectures
- Configurable allowed order statuses per merchant for when item modification is permitted
- Single payment transaction per order modification (not one transaction per change operation)
- Full audit log per modification (user, timestamp, before/after state, reason)

**Not in scope:** Change Seller / seller reassignment (separate MMR 004); freight recalculation as a standalone capability (separate MMR 002); promotion recalculation edge cases (separate MMR 003); delivery address change; payment method change; complete financial/accounting ledger (OMS orchestrates financial intent; ERPs and PSPs remain systems of record for financial postings).
