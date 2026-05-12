# Product Brief — Real-Time Allocation Monitoring

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

**Title:** Order Allocation Agent — Monitor Live Strategy Performance

**Description:** With this release, merchants like C&A and OBI will be able to see how their active allocation strategy is performing directly in VTEX Admin — without opening a support ticket or waiting for a periodic report. This means that they can track cost savings in real time, detect SLA regressions before they escalate, and decide whether to iterate on their strategy based on live data.

**Availability:** H2-2026 · Open Beta — Global

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: No visibility into whether the active strategy is actually delivering the expected outcomes
- Use Case: Monitor allocation performance and identify when a strategy needs to be revised

---

## Feature Delta

After publishing a strategy in MMR 001, merchants have no feedback loop. They cannot confirm that cost savings materialized, that SLA was preserved, or that the reallocation rate is within expectations — short of manual analysis in separate BI tools.

This MMR closes that loop by surfacing the mandatory KPIs from the simulation report (now computed on live orders) inside the same Order Allocation Agent interface where the strategy was configured.

## Why this ships as its own MMR

Monitoring requires a live strategy to observe — it has no value without MMR 001 deployed. Conversely, MMR 001 is fully functional without monitoring: merchants can configure, simulate, and publish a strategy and derive operational value from day one. Monitoring is an independent capability that amplifies the value of an existing strategy rather than being a prerequisite for it.

## Scope

- Real-time dashboard showing performance KPIs for the active strategy vs. the synchronous baseline.
- Mandatory KPIs: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders with seller change, and time elapsed to reallocate.
- Visual indicator when delivery time deviation exceeds 0 — prompting the merchant to investigate.
- Time-range selector for the monitoring window (e.g. last 7 days, last 30 days, custom range).
- Entry point from the active strategy view to initiate a new configuration cycle if performance is unsatisfactory.

**Not in scope:** Automated alerts or notifications, strategy auto-adjustment, historical comparison across multiple strategy versions, per-seller or per-region breakdown (deferred to later releases).
