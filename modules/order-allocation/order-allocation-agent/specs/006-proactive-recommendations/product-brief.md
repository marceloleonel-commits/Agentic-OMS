# Product Brief — Proactive Strategy Recommendations

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

**Title:** Order Allocation Agent — Receive Proactive Strategy Suggestions

**Description:** With this release, merchants like C&A and OBI will receive proactive recommendations from the agent when it detects that their active strategy is underperforming — without needing to open the monitoring dashboard or initiate a new configuration cycle themselves. This means that they catch cost regressions and SLA risks earlier, get a concrete starting point for the next iteration instead of a blank prompt, and spend less time monitoring and more time acting.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Performance degradation goes unnoticed until it shows up in operational costs or customer complaints — by which point the impact has already accumulated
- Use Case: Stay ahead of strategy degradation without having to actively monitor KPIs every day

---

## Feature Delta

MMR 002 (Real-Time Monitoring) surfaces KPI data for merchants who open the dashboard. But it requires the merchant to be looking. Most merchants will check periodically, not continuously — which means regressions accumulate between check-ins.

This MMR closes the gap by making the agent the one who initiates. When monitoring data shows that a KPI is trending outside acceptable bounds, the agent generates a specific, actionable recommendation: a revised strategy configuration with an explanation of why the change is suggested and what outcome it is expected to produce.

## Why this ships as its own MMR

Proactive recommendations require stable monitoring data (MMR 002) and a mature enough history of strategy configurations to generate meaningful suggestions. They are also a qualitatively different capability from passive monitoring: this is the agent acting on behalf of the merchant rather than waiting to be asked. That shift in interaction model — from reactive to proactive — is independently communicable and independently valuable. It does not require autonomous publishing (MMR 007) to exist; the agent recommends, the merchant still decides.

## Scope

- Agent monitors active strategy KPIs continuously and generates a recommendation when any of the following conditions are met: delivery time deviation > 0 for more than N orders in a rolling window, cost deviation from optimal exceeds a configurable threshold, or split rate increases significantly relative to the simulation baseline.
- Recommendation surfaces in the agent interface as a suggested configuration change with plain-language explanation: what changed in performance, what the agent proposes, and what outcome is expected.
- Merchant can accept the recommendation (launches the configuration flow pre-filled with suggested parameters), dismiss it, or ask the agent to explain further.
- Recommendation thresholds are configurable by the merchant (e.g., "alert me if cost deviation exceeds 3%").
- Recommendations are logged in strategy history (MMR 005) if active.

**Not in scope:** Push notifications via email or SMS (in-app only for GA), recommendations triggered by external events (stockouts, carrier disruptions), automated application of recommendations without merchant approval (deferred to MMR 007).
