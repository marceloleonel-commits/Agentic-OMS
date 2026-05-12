# Product Brief — Compatibility with Operational Capacity in Delivery Promise

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

**Title:** Delivery Promise — Compatibility with Operational Capacity

**Description:** With this release, merchants using VTEX Operational Capacity will have their store capacity limits correctly reflected in Delivery Promise. This means that when a store has reached its fulfillment capacity for a given time window, its products are shown as unavailable in navigation — preventing shoppers from adding to cart an item the store cannot fulfill in time, and eliminating a class of cannotBeDelivered errors at checkout.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel retailers using Operational Capacity to manage fulfillment throughput — particularly grocery, pharmacy, and retailers with ship-from-store models where store capacity is a real constraint
- Persona: Logistics Operations Manager / E-commerce Manager
- Pain: Merchants using Operational Capacity were explicitly excluded from Delivery Promise Closed Beta because capacity state was not factored into availability. Enabling them without this spec would cause Delivery Promise to show products as available at stores that have already reached their capacity limit — leading to checkout failures and broken promises.
- Use Case: Factor real-time operational capacity state into Delivery Promise availability, so products are hidden when the fulfilling store has reached its capacity for the relevant delivery window

---

## Feature Delta

Delivery Promise computes availability based on stock, SLA, and logistics configuration. Operational Capacity adds a dynamic constraint: a store can declare that it is at capacity for a given time window, which makes it unable to accept new orders for that window even if stock is available.

Without this spec, Delivery Promise ignores operational capacity — showing products as available at stores that are at capacity. This spec integrates Operational Capacity events into the Delivery Promise availability index.

## Scope

**In scope:**
- Listening to Operational Capacity state changes (store at capacity / capacity restored) and updating the Delivery Promise availability index
- Products at a store that has reached capacity for a given delivery window are shown as unavailable in navigation for that window
- When capacity is restored, products become available again automatically
- Consistent with Checkout: a store at capacity in Delivery Promise is also at capacity in Checkout

**Not in scope:** Displaying remaining capacity or capacity percentages to shoppers, configuring Operational Capacity settings (that is the Operational Capacity module), capacity-based waitlisting.
