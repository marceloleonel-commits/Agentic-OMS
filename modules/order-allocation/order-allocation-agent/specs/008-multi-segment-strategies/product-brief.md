# Product Brief — Multi-Segment Strategies

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

**Title:** Order Allocation Agent — Configure Different Strategies per Order Segment

**Description:** With this release, merchants like C&A and OBI will be able to configure distinct allocation strategies for different order segments — express, standard, high-value, by category, or any combination — with the agent interpreting segment definitions in natural language. This means that they stop compromising between competing priorities across their order base, apply the right optimization logic to each order type, and manage the full strategy set from a single interface.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer with diverse fulfillment needs across order types
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: A single strategy applied to all orders forces a trade-off — optimizing for cost hurts express performance, optimizing for speed wastes budget on standard orders
- Use Case: Apply cost minimization to standard orders while applying speed optimization to express orders, from the same agent interface

---

## Feature Delta

In MMR 001, one strategy applies to all orders. A merchant with high express order volume and high-margin product lines has fundamentally different priorities per order type — but has no way to express that differentiation without compromising one segment for the other.

This MMR introduces segmentation: merchants define order segments in natural language, configure a strategy per segment, and the system routes each order to the correct strategy at allocation time. The agent handles the interpretation of segment rules and the configuration of each strategy independently.

## Why this ships as its own MMR

Multi-segment strategies require the single-strategy configuration flow (MMR 001) to be well-understood by merchants before they take on the added complexity of segment management. Technically, it also requires routing logic at the allocation layer that does not exist in the single-strategy model. The merchant value is independently communicable — "different strategies for different orders" — and does not require versioning, proactive recommendations, or autonomous publishing to exist.

## Scope

- Segment definition via natural language input: merchant describes the segment rule (e.g., "orders with same-day delivery selected," "orders over R$1,000," "orders containing items from the electronics category").
- Agent interprets the segment rule and presents a plain-language summary for merchant review, with the same clarification flow as MMR 001.
- Each segment has its own independent strategy configuration (cost weights, constraint rules if MMR 011 is active), simulation, and publication flow.
- A default segment ("all other orders") always exists and must have an active strategy — ensuring every order is covered.
- Simulation per segment: each segment's strategy is simulated independently on the historical orders that match its rule.
- Publication: all segments must have valid, simulated strategies before the full configuration goes live. Partial activation (some segments live, others pending) is not supported in GA.
- Monitoring (MMR 002, if active) shows KPIs per segment when multi-segment is configured.

**Not in scope:** Overlapping segment rules (segments must be mutually exclusive in GA), dynamic segment assignment at runtime based on real-time inventory signals, more than 5 simultaneous active segments in GA.
