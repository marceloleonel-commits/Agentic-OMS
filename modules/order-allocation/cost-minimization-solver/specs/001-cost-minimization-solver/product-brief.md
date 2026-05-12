# Product Brief — Cost Minimization Solver

| Field | Value |
|---|---|
| **Module** | order-allocation |
| **Pillar** | Lowest cost-to-serve |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Under development |
| **Expected Release** | TBD |
| **Availability** | Alpha |
| **Storefronts** | N/A |
| **Mode** | B2C & B2B |


## MMR

**Title:** Cost Minimization Solver — Reduce Fulfillment Costs Automatically

**Description:** With this release, merchants like Intimissimi, Morena Rosa, and C&A will have their orders automatically allocated to the lowest-cost seller combination — without changing anything in their storefront or checkout. This means that they reduce operational costs (shipping + handling) by up to 5%, stop losing money on unnecessary order splits, and let go of manual workarounds like deactivating stores or manipulating freight tables to force preferred sellers.

**Availability:** Q1-2026 · Closed Beta — Global

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer with 10+ fulfillment nodes and shipping-from-store capabilities
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Current allocation splits orders unnecessarily and ignores operational cost, forcing manual workarounds that reduce fulfillment network efficiency
- Use Case: Reduce cost-to-serve across the full order base without SLA impact or storefront changes

---

## Feature Delta

Today, the synchronous allocation at checkout does not evaluate total operational cost. It can split the same order across multiple sellers even when a single seller could fulfill it at lower total cost — and once allocated, there is no correction mechanism.

This MMR delivers a post-purchase Cost Minimization Solver (the Brute Solver) that runs in parallel with the existing synchronous logic. For every order, it evaluates all eligible seller combinations, selects the lowest-cost option within the original SLA, and seamlessly replaces the synchronous allocation if it finds a better one. Merchants see cost reduction with no checkout impact and no change to the delivery promise.

## Why this ships as its own MMR

The Cost Minimization Solver is the first externally observable cost-optimization outcome for merchants. It requires the Asynchronous Order Allocation infrastructure (a separate technical capability) but delivers an independently communicable, measurable value: ~5% operational cost reduction with 0 SLA regressions. Merchants can be onboarded to this solver without any Order Allocation Agent or monitoring feature existing.

## Scope

- Brute Solver evaluates all eligible seller combinations for each order and selects the lowest-cost option within the original SLA.
- Cost model: `Total Cost = product price + shipping cost (from shipping tables) + handling cost (from warehouse entity)`.
- Solver runs post-purchase in the asynchronous path; synchronous allocation at checkout is unchanged and remains the live assignment until a better solution is confirmed.
- If the solver finds a lower-cost combination, it replaces the synchronous allocation transparently; the merchant is informed of the change.
- If no better combination is found, the synchronous allocation is kept.
- Solver respects `maxNumberOfSellersWhitelabel` configuration to limit order splits.
- Technical limits: orders with up to 5 line items; progressive seller cap (1 item: 240 sellers, 2: 120, 3: 60, 4: 30, 5: 15).

**Not in scope:** Cost dimensions beyond shipping + handling (commissions, taxes, geographic distance — deferred), merchant-triggered reallocations, multiple simultaneous strategies, self-serve simulation (VTEX runs all simulations), multi-leg or partial-split fulfillment.
