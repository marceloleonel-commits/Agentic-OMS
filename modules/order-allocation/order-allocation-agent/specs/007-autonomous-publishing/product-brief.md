# Product Brief — Autonomous Strategy Publishing

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

**Title:** Order Allocation Agent — Let the Agent Publish Within Defined Guardrails

**Description:** With this release, merchants like C&A and OBI will be able to define guardrails that allow the agent to publish strategy updates autonomously — when performance falls outside thresholds the merchant themselves set — without requiring manual approval on every adjustment. This means that their allocation strategy stays optimized continuously, cost regressions are corrected faster than any manual process allows, and the agent operates as a true autonomous system within the boundaries the merchant trusts.

**Availability:** Post-GA

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment with high order volume and operational maturity
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Manual approval on every strategy change introduces latency between detecting a problem and correcting it — at high order volumes, hours of degraded allocation have material cost impact
- Use Case: Delegate routine strategy adjustments to the agent while retaining control over the boundaries within which it can act

---

## Feature Delta

In all prior MMRs, every strategy publication requires explicit merchant confirmation. This is correct for early phases — merchants need to build trust in the system before delegating. MMR 006 (Proactive Recommendations) introduces agent-initiated suggestions but still requires the merchant to act.

This MMR completes the agentic vision: merchants define a guardrail set (which KPIs to watch, what thresholds trigger action, what changes are in-bounds), and the agent can act within those guardrails without waiting for confirmation. Every autonomous action is logged, reversible via MMR 005 (Strategy Versioning), and immediately visible to the merchant.

## Why this ships as its own MMR

Autonomous publishing is the highest-trust capability in the agent roadmap. It requires merchants to have direct experience with the full configuration, monitoring, recommendation, and versioning flows — built across MMRs 001 through 006 — before they are ready to delegate. Shipping it post-GA reflects this trust-building sequence, not a technical dependency. It is independently marketable as the "fully autonomous" tier of the product and represents a distinct commercial positioning from the assisted tiers.

## Scope

- Guardrail configuration: merchant defines which KPIs the agent monitors for autonomous action, what threshold triggers it, and what category of strategy change the agent is permitted to make (e.g., "adjust cost weights only, do not change constraint rules").
- When guardrails are triggered, the agent generates a strategy update, runs a simulation automatically (requires MMR 004), and publishes if simulation results are valid (deviation = 0, KPIs within acceptable range).
- Every autonomous publication is logged immediately in strategy history (MMR 005) with the triggering condition, the change made, and the simulation results.
- Merchant receives an in-app notification for every autonomous publication.
- Merchant can disable autonomous publishing at any time; all pending autonomous actions are cancelled.
- Autonomous publishing is scoped to adjustments within an existing strategy — the agent cannot autonomously configure a strategy from scratch or change the active strategy type.

**Not in scope:** Autonomous publishing without a valid simulation gate, changes to constraint rules (MMR 011) via autonomous publishing (cost weight adjustments only), multi-segment autonomous publishing across different segment strategies simultaneously.
