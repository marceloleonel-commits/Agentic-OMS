# Product Brief — Natural Language Constraint Rules

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

**Title:** Order Allocation Agent — Define Seller Constraints in Natural Language

**Description:** With this release, merchants like C&A and OBI will be able to define hard and soft constraints on seller selection — "never split fashion items across stores and DCs," "prefer franchise stores for orders under 5kg," "always use a DC for orders above R$2,000" — in natural language, and have the agent translate them into allocation rules. This means that they enforce business rules that cannot be expressed as cost weights, align allocation with franchise agreements and operational policies, and do so without writing a single configuration rule manually.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer operating franchise networks, mixed seller types (DCs, stores, marketplace sellers)
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Some allocation requirements are not about minimizing cost — they are about compliance, franchise agreements, or operational policies that the current cost-weight model cannot express
- Use Case: Enforce non-negotiable business rules on top of cost optimization, without overriding the cost model entirely

---

## Feature Delta

In MMR 001, the agent translates merchant goals exclusively into cost dimension weights. This covers most optimization scenarios, but not business rules that are categorical rather than scalar — "never," "always," "only if."

A merchant operating a franchise network may have contractual obligations that certain order types go to certain seller groups. A merchant with a mixed fleet of DCs and stores may need to prevent specific product categories from being fulfilled from stores entirely. These are constraints, not costs — and they need a separate representation in the allocation model.

This MMR extends the agent's input model to include constraint rules alongside cost weights. The merchant describes constraints in natural language; the agent interprets them, asks clarifying questions when the rule is ambiguous, and presents both the cost configuration and the constraint set for review before the merchant approves.

## Why this ships as its own MMR

Constraint rules require the core interpretation and configuration flow (MMR 001) to be stable, since they extend it rather than replace it. They are also technically distinct from cost weights — they map to hard filters and soft preference rules at the solver layer, not to the cost function itself. This technical distinction means they can be designed, tested, and released independently without affecting the cost weight model. The merchant value is independently communicable: "enforce business rules that cost weights alone can't express."

## Scope

- Natural language input accepts constraint descriptions alongside (or separately from) cost goal descriptions.
- Agent interprets constraints into two categories: **hard constraints** (absolute rules — a seller combination that violates a hard constraint is never considered) and **soft constraints** (preference rules — a seller combination that violates a soft constraint incurs a penalty in the cost function).
- Constraint summary displayed alongside cost weight summary in the interpretation review step.
- Clarification questions triggered when a constraint is ambiguous, conflicting with another rule, or potentially conflicts with the cost goal.
- Constraints are included in simulation: the KPI report reflects the impact of applying constraints relative to unconstrained optimization.
- Constraints are stored as part of the strategy and versioned alongside cost weights (MMR 005, if active).
- Conflict detection: if a constraint set would make a significant percentage of orders ineligible for any seller, the system warns the merchant before simulation.

**Not in scope:** Constraint rules expressed as code or structured queries (natural language only in GA), per-SKU or per-category constraint granularity finer than the product category level, dynamic constraints that change based on real-time signals (inventory, weather, carrier availability).
