# Product Brief — Filter by Shipping Method in PLP

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — Closed Beta |
| **Expected Release** | TBD |
| **Availability** | Closed Beta |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Filter by Shipping Method (Delivery or Pickup) in PLP

**Description:** With this release, shoppers will be able to filter PLP and search results by delivery method — choosing between Shipping (delivery to address) and Pickup (collection at a store or locker). This means only products available through the shopper's preferred method are shown, reducing friction and increasing the relevance of every product listing.

**Availability:** Closed Beta · H1 2025

**Target Audience:**
- Tier: All tiers using Intelligent Search and Delivery Promise
- Persona: E-commerce Manager / Shopper
- Pain: Shoppers cannot narrow results by how they want to receive their order. They may browse delivery-only products when they intended to pick up, discovering the mismatch only at checkout.
- Use Case: Filter PLP to show only products available for the shopper's chosen delivery method (Shipping or Pickup)

---

## Scope

**In scope:**
- Delivery method filter on PLP: Shipping (delivers to shopper's ZIP) and Pickup (available for pickup within the configured radius, default 50 km)
- Filter uses radio buttons — one method at a time, consistent with current Checkout behavior (one delivery method per cart)
- Pickup availability uses the same radius rule as Checkout
- Applies to the current PLP only (not persistent across pages — that is a separate MMR)
- Shopper can update their ZIP directly within the shipping filter

**Not in scope:** Pickup nearby (separate MMR), pickup at specific point (separate MMR), sitewide persistent filter (separate MMR), multi-method checkboxes (pending FastCheckout multi-delivery support).
