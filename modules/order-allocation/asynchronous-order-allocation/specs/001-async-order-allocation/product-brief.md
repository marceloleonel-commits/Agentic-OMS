# Product Brief — Asynchronous Order Allocation

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

**Title:** Asynchronous Order Allocation — Optimize Before Seller Orders Are Created

**Description:** With this release, VTEX merchants will have their orders evaluated by a post-placement allocation pass that can produce a better seller assignment before individual seller orders are created — without any impact to checkout speed or the shopper-facing delivery promise. This means that cost-optimization solvers and agentic strategies can run at full quality in the window between order placement and seller order creation, merchants gain a review window to approve or dispute the proposed allocation before it is finalized, and the system is safe by default: if evaluation fails for any reason, orders are created with the original checkout allocation.

**Availability:** Q1-2026 · Closed Beta — Global

**Target Audience:**
- Tier: Tier 1 & 2 (as the foundational infrastructure consumed by Cost Minimization Solver and Order Allocation Agent)
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: The checkout window forces a fast, greedy allocation that may be suboptimal; once seller orders are created, there is no correction mechanism without manual intervention
- Use Case: Enable post-placement seller allocation that improves cost and quality outcomes while preserving the delivery promise and not blocking checkout

---

## Feature Delta

Today, allocation is entirely synchronous: the seller assigned at checkout is used immediately to create seller orders. There is no window to improve this assignment, and no way for the merchant to review or influence it.

This MMR introduces a window between order placement and seller order creation where a new, better-quality allocation can be evaluated. The checkout allocation remains the starting point and the fallback. The async evaluation runs in parallel — if it finds a better allocation, the merchant reviews it and approves before seller orders are created with the new result. If it finds nothing better, or if anything goes wrong, seller orders are created with the original checkout result.

This is also the first time merchants have any visibility or control over the allocation decision at the order level — the review window is a new capability, not just an infrastructure detail.

This is the foundational layer required by the Cost Minimization Solver and the Order Allocation Agent.

## Why this ships as its own MMR

The async infrastructure is independently deployable and independently observable: merchants can confirm allocations are being evaluated and improved before seller orders are created, verify SLA preservation, and validate the fallback behavior — before any solver or agent UI exists. Shipping it independently de-risks the overall program.

## Scope

- Post-placement evaluation window: after a shopper places an order, the system evaluates whether a better allocation exists before seller orders are created.
- Not all orders go through this evaluation — some order types are excluded based on operational constraints (see Assumptions). Excluded orders go directly to seller order creation with the checkout result.
- If the evaluation succeeds, the merchant reviews the proposed allocation and can approve, dispute (triggering a new evaluation), or cancel before seller orders are created.
- Failed evaluations are retried automatically a defined number of times. If all retries fail, seller orders are created with the original checkout result.
- If the system is unavailable for any reason, order creation is never blocked — seller orders are created with the checkout result.
- Express delivery handling: the evaluation completes within P99 < 10s for orders with express SLAs.

**Not in scope:** Merchant-triggered manual reallocations, multi-leg or partial-split fulfillment, re-promising a new SLA to the shopper, blocking checkout, removing synchronous allocation from checkout.
