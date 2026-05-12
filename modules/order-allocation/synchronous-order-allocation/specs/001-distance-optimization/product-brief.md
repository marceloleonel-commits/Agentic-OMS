# Product Brief — Distance Optimization in Order Allocation

| Field | Value |
|---|---|
| **Module** | order-allocation |
| **Pillar** | Lowest cost-to-serve |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Released |
| **Expected Release** | TBD |
| **Availability** | General Availability |
| **Storefronts** | N/A |
| **Mode** | B2C & B2B |


## MMR

**Title:** Synchronous Order Allocation — Distance Optimization

**Release Description:** With this release, merchants like Pague Menos, Kopenhagen, Farmácias São João, and Extrafarma will be able to use pickup point distance as a tiebreaker in Order Allocation. This means they reduce kilometers traveled, lower last-mile shipping costs, and use their store network more efficiently.

**Target Audience:** While the impact is particularly significant for pharmacy chains and retailers with high store density, any omnichannel merchant operating on a seller whitelabel architecture with multiple physical locations can take advantage of this feature, regardless of vertical.

**Availability:** GA · 2025

**Sponsor Customers:** Pague Menos, Kopenhagen, Farmácias São João, Extrafarma

**Persona:** Omnichannel Manager / Logistics Operations Manager

**Pain:** Merchants operating seller whitelabel architectures with dozens or hundreds of physical locations face a common problem at checkout: when multiple stores are eligible to fulfill a pickup order, the allocation engine has no basis to distinguish between them. It picks one arbitrarily — often not the closest to the shopper. This means shoppers travel farther than necessary to collect their orders, the merchant's nearest stores are underutilized, and last-mile efficiency is left on the table.

**Use Case:** Use the distance between a pickup point and the shopper's chosen pickup location as the tiebreaker when the allocation engine must choose among multiple eligible sellers — so the nearest store is always preferred when all other allocation criteria are equal.

---

## Feature Delta

The Checkout Allocation Engine evaluates which sellers are eligible for an order (stock availability, SLA, hard constraints) and selects among them. When multiple sellers are equally eligible — same SLA, same constraints — the engine today has no distance awareness: it falls back to a static priority list or platform default.

This MMR adds distance as the tiebreaker at the end of that evaluation: when two or more sellers tie on all other allocation criteria, the engine selects the one whose pickup point is geographically closest to the shopper's chosen collection address.

## Scope

**In scope:**
- Distance calculation between each eligible seller's pickup point and the shopper's selected collection address, applied as a tiebreaker when multiple sellers are equally eligible
- Applies to pickup orders in seller whitelabel architectures where multiple stores are registered as individual sellers
- Configurable as opt-in per merchant account
- Tie-within-tiebreaker rule when two pickup points are equidistant (merchant-configurable fallback, e.g., alphabetical seller ID)

**Not in scope:** Distance as the primary allocation criterion (eligibility is still determined by stock + SLA + constraints), distance optimization for home delivery (this release is scoped to pickup points), cost optimization across seller combinations (Cost Minimization Solver), reallocation based on distance (Order Allocation Agent).
