# Synchronous Order Allocation

## Problem Statement

Every order placed on VTEX requires an allocation decision: which seller or warehouse fulfills each item in the cart. This decision must happen at checkout — before the shopper confirms the order — because the delivery promise shown to the shopper depends on it.

Three requirements make this uniquely constrained:

1. **Speed**: The allocation must complete in milliseconds, inside the checkout flow. Any delay directly impacts conversion. This rules out exhaustive search or complex optimization — the engine must be deterministic and fast.

2. **Commitment**: The delivery promise shown to the shopper at checkout is a commitment. Whatever seller the engine assigns at this moment must be able to fulfill the order within that window. If the assignment is wrong, the merchant breaks the promise.

3. **Completeness**: For every item in every order, the engine must produce an assignment — or inform the shopper that the item cannot be fulfilled. There is no acceptable "we'll figure it out later" state at checkout.

Without a well-configured synchronous allocation engine, merchants face: delivery promise breaches (assigned sellers can't fulfill within the promised window), inventory misuse (wrong source consumed for the order type), and unconfigured constraints (sellers handling order types they are not approved for).

---

## Vision

A deterministic, millisecond-fast allocation engine that assigns every order to the best eligible seller at checkout — respecting the merchant's configured priorities and hard constraints — and commits to a delivery promise the merchant can fulfill.

The synchronous engine is the point of commitment. Every order that completes checkout has a seller assignment and a delivery promise. The merchant controls which sellers are eligible, in what priority order they are evaluated, and what rules are never breakable — so the engine's output is both fast and trustworthy.

```
Shopper adds items to cart
        │
        ▼
Checkout initiated
        │
        ▼
For each item: which sellers have stock + can meet the SLA?
        │
   ┌────┴──────────────────────┐
  None                        One or more
   │                           │
   ▼                           ▼
Item shown as              Apply priority order
unavailable /              (merchant-configured)
removed from cart                  │
                                   ▼
                          Apply hard constraints
                          (eliminate ineligible sellers)
                                   │
                            ┌──────┴──────┐
                       No sellers       Best eligible
                       remain           seller selected
                            │                  │
                            ▼                  ▼
                      Item unavailable   Seller assigned +
                                         delivery promise set
                                               │
                                               ▼
                                    Order confirmed —
                                    seller orders created
```

The synchronous engine is not an optimization layer — that is the role of the Asynchronous Order Allocation. The synchronous engine's role is to produce a valid, commitment-ready assignment for every order, every time, within the checkout window.

---

## Target Users

**External (Merchants):** Omnichannel Managers and Logistics Operations Managers who configure which sellers and warehouses serve their orders, define fulfillment priority, and set the rules the engine must always enforce.

**End Users (Shoppers):** Shoppers benefit indirectly — they see an accurate delivery promise at checkout and receive their orders from the seller the engine selected.

---

## Relationship to Other Features

- **Asynchronous Order Allocation** builds on top of the synchronous engine: the checkout allocation is always the starting point and the fallback. The async layer evaluates whether a better allocation exists *after* checkout, before seller orders are finalized.
- **Cost Minimization Solver** operates in the async window and optimizes cost — it never replaces the synchronous engine.
- **Order Allocation Agent** allows merchants to configure allocation strategy in natural language — the strategy it configures is applied by the synchronous engine at checkout and by the async evaluation layer post-checkout.

---

## Success Metrics

| Metric | Target |
|---|---|
| Allocation coverage | 100% of eligible orders receive a seller assignment at checkout |
| Checkout latency | Allocation adds P99 < 200ms to checkout response time |
| Promise accuracy | Delivery promise shown at checkout matches actual fulfillment capability |
| Constraint enforcement | 0 orders allocated to a seller in violation of a hard constraint |
