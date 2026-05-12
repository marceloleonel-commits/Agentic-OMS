# Cost Minimization Solver

## Problem Statement

Merchants overspend on fulfillment because the current synchronous allocation does not optimize for total operational cost. It can split orders unnecessarily — even when a single seller could fulfill at lower cost — and does not evaluate all eligible seller combinations before making a decision.

Confirmed: analysis of the cost-based algorithm results validated that the current algorithm sometimes splits orders even when doing so results in a higher total cost.

As a result:
- Merchants manipulate freight tables and warehouse costs manually to force preferred sellers.
- Merchants deactivate stores to prevent unwanted splits, reducing their active fulfillment network.
- Cost-to-serve remains higher than necessary across the entire order base.

---

## Vision

Deliver a **Cost-Based Order Allocation Solver** (known internally as the Brute Solver) that minimizes operational costs — shipping + handling — with proven cost reductions of up to 5%.

The solver evaluates **all eligible sellers and their feasible combinations**, allocating each order to the **lowest-cost option** that can fulfill the selected SLA or delivery option.

**Rollout strategy:** Run synchronous and asynchronous allocations for the same order in parallel. The asynchronous cost-minimization solver seamlessly replaces the synchronous allocation whenever it identifies a more cost-efficient solution. This initiative depends on the Asynchronous Order Allocation infrastructure.

### Cost Model

```
Total Cost = product price + shipping cost (from shipping tables) + handling cost (from warehouse entity)
```

The solver selects the seller combination that minimizes this total while:
- Respecting the original SLA promised during synchronous checkout.
- Minimizing order splits, respecting `maxNumberOfSellersWhitelabel` configuration.

---

## Target Users

**Omnichannel retailers (Tier 1 & 2)** operating fulfillment networks of DCs, stores, and franchises with 10+ fulfillment nodes and shipping-from-store capabilities. These merchants have the operational maturity and order volume to realize immediate ROI from cost-based allocation.

**Pipeline:** Intimissimi, Morena Rosa, Trousseau, MyPlace, Lizie, Garage, UvLine, Loungerie, Reserva, Osklen, Hering, Santa Lucia Drogaria, C&A.

---

## Success Metrics

| Metric | Target |
|---|---|
| Adoption | 1 merchant using the cost-minimization solver in Closed Beta by end of H1 2026 |
| Cost-Efficiency | ~5% reduction in operational costs (shipping + handling) |
| Reliability | 0 SLA regressions / 0 broken Delivery Promises attributable to allocation |
| Performance | P95 allocation time < 60s post-purchase; P99 < 10s for express deliveries |

**Benchmark results (from Dynamic Programming Solver analysis):**
- Intimissimi: 4.4% cost reduction (16/361 orders); 9.6% for multi-item carts (16/167)
- Santa Lucia Drogaria: 4.2% overall (15/359); 13.4% for multi-item carts (15/112)
- Monte Carlo: 4.2% overall (12/288); 9.5% for multi-item carts (4/42)
- UvLine: 10.0% for multi-item carts (4/40)

---

## Out of Scope

- Partial splits across sellers
- Multi-leg fulfillment
- Merchant-triggered reallocations
- Multiple allocation strategies in production (segmentation rules)
- Merchant-executed simulations (VTEX handles all simulations and impact analyses)
- Margin configurations (trade-offs with SLA, distance, inventory, etc.)
- Automated self-optimization or agentic strategy adjustments
- Cost dimensions beyond shipping + handling (commissions, taxes, distance — deferred to later releases)
