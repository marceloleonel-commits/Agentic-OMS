# Product Brief — A/B Testing

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

**Title:** Order Allocation Agent — Validate Strategy Changes with Controlled Experiments

**Description:** With this release, merchants like C&A and OBI will be able to run a controlled A/B experiment between their current strategy and a new one — allocating a configurable percentage of orders to each — before committing to a full rollout. This means that they validate improvements with statistical evidence instead of intuition, eliminate the risk of a full strategy swap that turns out to underperform, and build a culture of evidence-based strategy iteration.

**Availability:** Post-GA

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer with sufficient order volume for statistically significant experiments
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Publishing a new strategy is an all-or-nothing bet — if it underperforms, the merchant only discovers it after the full order base has been impacted
- Use Case: Test a new strategy configuration on 10–20% of orders, compare results against the control, and promote the winner with confidence

---

## Feature Delta

In MMR 001, strategy publication is binary: the new strategy replaces the old one entirely. MMR 005 (Strategy Versioning) enables recovery after the fact, but not prevention. A merchant who wants to be cautious currently has no option between "publish to all orders" and "don't publish."

This MMR introduces a controlled experiment mode: the merchant defines a traffic split, assigns the current strategy as control and a new strategy as treatment, and runs both simultaneously on live orders. The agent reports results per arm — cost KPIs, SLA metrics, split rates — and the merchant decides which strategy to promote as the new default.

## Why this ships as its own MMR

A/B testing requires a stable versioning system (MMR 005) to manage the two strategy arms, reliable per-order monitoring (MMR 002) to compute arm-level KPIs, and sufficient merchant maturity with the product to set up a valid experiment. It is post-GA because it also requires careful engineering to ensure fair traffic splitting and statistically valid comparison — this is a higher-complexity capability that should not gate GA adoption. It is independently marketable as the "experiment-driven" tier of the product.

## Scope

- Experiment setup: merchant selects an active strategy as control and configures a new strategy (via the standard configuration flow) as treatment. Traffic split is configurable (e.g., 10/90, 20/80, 50/50).
- Orders are assigned to control or treatment deterministically per order, with no order split across arms.
- Experiment runs for a merchant-defined duration or until a minimum order count per arm is reached for statistical validity.
- Results dashboard: KPIs per arm side-by-side — same mandatory KPIs as MMR 001 simulation report — with a plain-language summary of which arm performed better and by how much.
- Promotion: merchant can promote the treatment strategy to 100% with one action, or end the experiment and keep the control.
- SLA gate: if the treatment arm shows delivery time deviation ≠ 0 at any point during the experiment, the arm is automatically paused and the merchant is notified.

**Not in scope:** Multi-arm experiments (more than 2 strategies simultaneously), automated winner promotion without merchant approval, experiments across different merchant accounts, statistical significance calculations surfaced in the UI in GA (directional comparison only).
