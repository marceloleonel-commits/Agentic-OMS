# Product Brief — Compatibility with Assembly Options in Delivery Promise

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — Open Beta |
| **Expected Release** | TBD |
| **Availability** | Open Beta |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Compatibility with Assembly Options

**Description:** With this release, merchants selling products that require assembly services will have those products' availability correctly reflected in Delivery Promise. This means that products with assembly options appear as available in navigation only when both the product and the assembly service can be fulfilled for the shopper's location — eliminating a class of checkout failures where assembly-requiring products show as available but cannot actually be sold.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Retailers selling products that require installation or assembly services — furniture, appliances, fitness equipment — where the service availability varies by region and affects whether the product can actually be purchased
- Persona: E-commerce Manager / Logistics Operations Manager
- Pain: Merchants using Assembly Options were explicitly excluded from Delivery Promise Closed Beta. Without this spec, Delivery Promise computes availability based only on product stock and logistics — ignoring whether the assembly service is available for the shopper's location. This causes products to appear as available when the assembly service cannot be provided, leading to checkout failures.
- Use Case: Factor assembly service availability into Delivery Promise, so products requiring assembly only appear as available when both the product and the service can be delivered to the shopper's location

---

## Feature Delta

Delivery Promise computes availability based on stock, SLA, and logistics configuration. Assembly Options introduce an additional constraint: a product may have stock and a valid logistics route, but still be unsellable if the assembly service it requires is not available in the shopper's region.

This spec integrates Assembly Options availability into the Delivery Promise computation — treating the assembly service as a required component of the product's availability.

## Scope

**In scope:**
- Products with Assembly Options are only shown as available in navigation when both the product logistics AND the assembly service are available for the shopper's location
- Assembly service availability per ZIP/region is included in the Delivery Promise availability index
- Updates to assembly service availability (new regions, service removed) are reflected in the index

**Not in scope:** Assembly service scheduling UI, assembly service pricing display, partial assembly options (products with optional vs. required assembly — initial release covers required assembly).
