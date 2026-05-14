# Product Brief — Order Modification: Promotion Recalculation

| Field | Value |
|---|---|
| **Module** | order-management |
| **Pillar** | Order modification |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | Túlio Araújo |
| **Status** | Draft |
| **Expected Release** | MVP 2026-Q3 |
| **Availability** | General Availability |
| **Access** | API (MVP) · OMS Admin UI (MLP) |
| **Mode** | B2C & B2B |


## MMR

**Title:** Order Modification — Promotion Recalculation

**Description:** With this release, when operators add, remove, or replace items in an active order (MMR 001), VTEX OMS will automatically re-evaluate all applicable promotional rules — bundle discounts, progressive quantity discounts, and coupon-based discounts — and recalculate the order total to reflect the correct promotional state. Manual price adjustments (PriceTags) applied at the item level will be preserved across weight and quantity changes. Today, when items are modified, promotions are silently left in their pre-modification state: a bundle discount remains applied even after one of its required items is removed, and a bundle discount is never triggered when a missing item is added. This produces incorrect order totals and requires manual correction by operators or support agents.

**Availability:** Closed Beta · 2026-Q3 (API) · 2026-Q4 (OMS Admin UI)

**Target Audience:**
- Tier: Tier-1 and advanced Tier-2 merchants — grocery, fashion, and marketplace operators with complex promotional structures (bundle campaigns, progressive discounts, loyalty coupons)
- Persona: Primary — OMS Operators, SAC Agents; Secondary — Integration Engineers managing promotion-aware order flows
- Pain: The current Change Order V2 API allows item modifications but does not re-run the promotion engine after those changes. As a result, operators must manually calculate and inject discount deltas via `manualDiscountValue` — an error-prone process with no platform-level validation. Bundle promotions in particular produce silent inconsistencies: removing a bundle item leaves the bundle discount applied (over-discount), while adding a qualifying item never triggers the bundle discount (under-discount). Manual PriceTags (manual fees and manual discounts applied at item level) are also at risk of being lost or incorrectly recalculated when item weight or quantity is updated. *(Source: Change Order V2 Documentation, Aug 2022; UC-07, UC-45, UC-46)*
- Use Case: Allow OMS to automatically recalculate all applicable automatic promotions and preserve manual PriceTags whenever an item modification is committed, so that the order total always reflects the correct promotional state without requiring manual operator intervention.

---

## Scope

**In scope:**
- Automatic recalculation of promotional rules (bundle discounts, progressive quantity discounts, coupon-based discounts) triggered by any item-change commit (add, remove, replace)
- Removal of a bundle discount when a required bundle item is fully removed from the order
- Application of a bundle discount when a previously missing required item is added to the order
- Recalculation of progressive quantity discounts when item quantities change
- Preservation of item-level manual PriceTags (manual fee, manual discount) across weight and quantity modifications — the PriceTag is maintained and the financial delta is calculated on top of the existing tag
- Recalculation of order-level vs item-level discount attribution after item changes
- Single payment delta per modification reflecting the net promotion recalculation result
- Full audit log capturing promotion state (rules applied, discount amounts) before and after each modification

**Not in scope:** Item add/remove/replace mechanics and inventory management (MMR 001); freight recalculation as a standalone capability (MMR 002); seller reassignment (MMR 004); customer-initiated order substitution flows; promotional rule authoring or campaign configuration; loyalty points recalculation; gift item (brinde) re-evaluation; coupon code re-issuance.
