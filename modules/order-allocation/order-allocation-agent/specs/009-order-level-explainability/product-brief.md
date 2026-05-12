# Product Brief — Order-Level Explainability

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

**Title:** Order Allocation Agent — Understand Why Each Order Was Allocated

**Description:** With this release, merchants like C&A and OBI will be able to see a plain-language explanation for any order's allocation — which cost factors drove the decision, whether the async solver replaced the synchronous result, and what alternative sellers were considered and rejected. This means that they can diagnose unexpected allocation outcomes without opening a support ticket, build confidence in the system by auditing its reasoning, and identify when a strategy needs adjustment from concrete order-level evidence.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Even with a configured strategy, allocation remains a black box at the order level — merchants cannot explain to their team or stakeholders why a specific order went to a specific seller
- Use Case: Investigate a specific allocation decision, audit strategy behavior on a sample of orders, and build internal confidence in the system

---

## Feature Delta

MMR 002 (Real-Time Monitoring) shows aggregate KPIs across all orders. It answers "is the strategy working overall?" but not "why did this specific order go to Seller B instead of Seller A?"

This MMR adds order-level transparency: for any order, the merchant can see the full reasoning behind the allocation — the cost breakdown per evaluated seller, the constraint rules applied (if MMR 011 is active), whether async replaced synchronous and why, and what was the runner-up option. This transforms allocation from a system merchants tolerate into one they understand and trust.

## Why this ships as its own MMR

Order-level explainability requires the async allocation infrastructure, the cost model, and monitoring data to be stable and producing structured output before a readable explanation layer can be built on top. It is also a capability with a distinct audience trigger — most merchants won't need it daily, but every merchant needs it the first time an allocation decision surprises them. It is independently marketable as a trust and auditability capability, without requiring proactive recommendations or versioning to exist.

## Scope

- Explainability view accessible from any order detail page in VTEX Admin.
- Plain-language summary: which seller was selected, why (top cost factor), whether async replaced synchronous, and the margin between the selected option and the next-best alternative.
- Cost breakdown table: each evaluated seller combination with its total cost, shipping cost, handling cost, and any constraint rule violations (if MMR 011 is active) that made it ineligible.
- Async vs. synchronous comparison: if the async solver replaced the synchronous result, show both allocations and the cost difference.
- Explainability data retained per order for the same retention period as order history.

**Not in scope:** Bulk explainability export (single-order view only in GA), explainability for orders placed before this MMR was activated, natural language Q&A about the explanation (e.g., "why wasn't Seller C considered?") — plain summary only in GA.
