# Asynchronous Order Allocation

## Problem Statement

Current order allocation runs synchronously at checkout, creating three fundamental constraints:

1. **Computational time ceiling:** Allocation must complete in milliseconds during checkout. This forces a greedy algorithm that may yield suboptimal results — unnecessary order splits, higher-cost sellers, or sellers that will underperform. Any optimization that evaluates all eligible seller combinations is too slow to run during the purchase flow.

2. **No pre-creation correction window:** Once a shopper places an order, the synchronous allocation result is used immediately to create seller orders. There is no window to evaluate a better allocation before those assignments are finalized.

3. **No post-creation correction mechanism:** Once seller orders are created, there is no system-level way to reassign fulfillment if a seller cancels, stock runs out, or a better option becomes available. Merchants can only intervene manually in VTEX Admin, which doesn't scale.

This makes it structurally impossible to run cost-optimization solvers or agentic strategies at the quality required by Tier 1 & 2 omnichannel merchants.

---

## Vision

Enable allocation to run asynchronously in two moments: **before seller orders are created** (initial allocation) and **after seller orders are created when reassignment is needed** (reallocation). In both cases, the system evaluates seller combinations using cost-based or agentic strategies with no checkout impact, and the merchant retains a review window to approve or dispute the proposed result.

This is the foundational infrastructure layer for the Cost Minimization Solver and the Order Allocation Agent.

### Scenario 1 — Initial Allocation (pre-creation window)

```
Shopper places order
        │
        ▼
Synchronous allocation runs (checkout — unchanged)
        │
        ▼
Eligible for async evaluation?
        │
   ┌────┴──────────────────┐
  No                      Yes
   │                       │
   ▼                       ▼
Seller orders         System evaluates
created with          better allocation
checkout result              │
                      ┌──────┴──────┐
                 Better option    No better option /
                 found             evaluation fails
                      │                  │
                      ▼                  ▼
             Merchant reviews    Seller orders created
             proposed allocation  with checkout result
                      │
             ┌────────┴────────┐
          Approved           Disputed
             │                  │
             ▼                  ▼
      Seller orders       New evaluation
      created with        triggered
      new allocation
```

### Scenario 2 — Reallocation (post-creation)

```
Reallocation trigger
(seller cancels, stockout, strategy change, merchant rule)
        │
        ▼
Eligible for reallocation?
(Order not yet picked/packed/shipped; no payment split block)
        │
   ┌────┴──────────────────┐
  No                      Yes
   │                       │
   ▼                       ▼
Order kept           System evaluates
as-is                alternative sellers
                           │
                    ┌──────┴──────┐
               Better option    No better option /
               found             evaluation fails
                    │                  │
                    ▼                  ▼
           Merchant reviews    Order kept as-is
           proposed reallocation
                    │
           ┌────────┴────────┐
        Approved           Disputed
           │                  │
           ▼                  ▼
    Seller order        New evaluation
    reassigned          triggered
```

**Key constraints:**
- Must not block checkout or affect the shopper's purchase experience.
- Must respect the delivery promise made at checkout — no re-promising.
- Reallocation only applies while the order is in a pre-fulfillment state (not yet picked, packed, or shipped).
- If the system fails for any reason, the original allocation is preserved. No order is ever lost.
- Merchants can review and act on proposed allocations and reallocations before they are finalized.
- Merchants can configure reallocation rules through the Order Allocation Agent (e.g., minimum cost improvement threshold, allowed fulfillment states, order types excluded from reallocation).

---

## Target Users

**Internal (VTEX):** The Asynchronous Order Allocation is an infrastructure capability consumed by the Cost Minimization Solver and the Order Allocation Agent.

**External (Merchants):** Omnichannel Managers benefit from orders optimized before seller assignments are finalized, a review window that gives them control over the allocation outcome, and visibility into the allocation state of every order.

---

## Long-Term Vision

In the long run, this same allocation capability can be applied beyond orders — to picking and packing task assignment, carrier selection, and payment routing. The first version focuses on seller allocation, establishing the architecture and merchant experience that future use cases will build on.

---

## Success Metrics

| Metric | Target |
|---|---|
| Performance | P95 evaluation time < 60s post-placement |
| Performance (express) | P99 evaluation time < 10s for express deliveries |
| Reliability | 0 SLA regressions / 0 broken Delivery Promises attributable to reallocation |
| Promise Preservation | Final allocation always honors the SLA from synchronous checkout |
| Order Visibility | Merchants informed of allocation state at every transition |
| Fallback Safety | 0 order creation failures attributable to allocation system unavailability |

---

## Out of Scope

- Blocking checkout in any way.
- Re-promising a new SLA to the shopper after the original promise is made.
- Automatic reallocation triggered by system events (v1 — manual and rule-based reallocation are delivered through the Order Allocation Agent).
- Multi-leg fulfillment or partial splits across sellers (v1).
- Running allocation before checkout completes.
