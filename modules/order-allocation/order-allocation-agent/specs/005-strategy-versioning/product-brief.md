# Product Brief — Strategy Versioning & History

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

**Title:** Order Allocation Agent — Compare and Reactivate Past Strategies

**Description:** With this release, merchants like C&A and OBI will be able to browse their full strategy history, compare configurations and simulation results side-by-side across versions, and reactivate a previous strategy in one action. This means that they can recover quickly when a new strategy underperforms, understand exactly what changed between versions, and build on proven configurations instead of starting from scratch each time.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: After publishing multiple strategy iterations, there is no record of what was tried, what changed, or how past strategies performed — making recovery from a regression slow and risky
- Use Case: Audit strategy evolution, diagnose performance changes, and restore a known-good configuration without reconfiguring from scratch

---

## Feature Delta

In MMR 001, publishing a new strategy replaces the previous one with no history retained. There is no way to see what the previous strategy was, compare its KPIs to the current one, or restore it if the new strategy underperforms.

This MMR introduces a versioned strategy history. Every published strategy is stored with its configuration, simulation results, publication timestamp, and live performance data (if available from MMR 002). Merchants can compare any two versions and reactivate any past strategy directly.

## Why this ships as its own MMR

Strategy versioning requires at least two published strategies to provide value — making it dependent on the core publish flow (MMR 001) being in use long enough for history to accumulate. It also benefits significantly from the monitoring data established in MMR 002: version comparison is most useful when live performance KPIs are available alongside configuration details. Versioning is independently marketable as an operational safety net and audit capability, without requiring proactive recommendations (MMR 006) or A/B testing (MMR 010) to exist.

## Scope

- Strategy history view listing all previously published strategies with publication timestamps and status (active, inactive).
- Side-by-side comparison of any two strategy versions: cost dimension weights, constraint rules (if MMR 011 is active), simulation KPIs, and live performance KPIs (if available).
- One-click reactivation of any past strategy — with confirmation step and timestamp on activation.
- Reactivation triggers the same publication gate as MMR 001: simulation results must exist; delivery time deviation must be 0.
- Strategy history is retained indefinitely per merchant account.

**Not in scope:** Diff view at the individual weight level (plain comparison is sufficient for GA), branching or forking strategy versions, sharing version history across accounts.
