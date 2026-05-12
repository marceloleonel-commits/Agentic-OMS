# Product Brief — Compatibility with MOI (Multilevel Omnichannel Inventory) in Delivery Promise

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — GA |
| **Expected Release** | TBD |
| **Availability** | Generally Available |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Compatibility with MOI (Multilevel Omnichannel Inventory)

**Description:** With this release, merchants using VTEX MOI (Multilevel Omnichannel Inventory) will have their inventory correctly reflected in Delivery Promise. This means that product availability shown in navigation accurately represents MOI inventory levels across all fulfillment nodes — eliminating availability discrepancies between navigation and checkout caused by inventory managed through MOI.

**Availability:** GA · 2026

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel retailers using MOI to manage inventory across multiple levels (store, warehouse, DC) with shared inventory pools
- Persona: Logistics Operations Manager / E-commerce Manager
- Pain: Merchants using MOI manage inventory through a multilevel hierarchy that differs from standard VTEX inventory. Without explicit MOI compatibility, Delivery Promise may read inventory at the wrong level or miss shared inventory pools — showing incorrect availability.
- Use Case: Ensure Delivery Promise reads and respects MOI inventory levels so that availability shown to shoppers matches what is actually available for purchase

---

## Feature Delta

Standard Delivery Promise reads inventory directly from VTEX inventory per seller/warehouse. MOI introduces a multilevel inventory model where a single unit of stock may be shared or reserved across levels (e.g., a product available at a regional warehouse that feeds multiple stores). Without MOI awareness, Delivery Promise may double-count, under-count, or read from the wrong inventory level.

This spec ensures Delivery Promise correctly reads MOI inventory at the appropriate level for each product and location, producing availability data that is consistent with Checkout's inventory check.

## Scope

**In scope:**
- Correct reading and interpretation of MOI inventory levels in the Delivery Promise availability computation
- Consistency between Delivery Promise availability and Checkout availability for MOI-managed products
- Availability updates triggered by MOI inventory events (stock changes, level changes)

**Not in scope:** Configuration of MOI (separate module), displaying inventory levels to shoppers, shared inventory pool management.
