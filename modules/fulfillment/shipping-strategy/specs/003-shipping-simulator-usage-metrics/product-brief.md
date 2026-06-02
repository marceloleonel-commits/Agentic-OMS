# Product Brief — Shipping Simulator: Usage Metrics

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carolina Tourinho |
| **Eng Champion** | TBD |
| **Status** | Under definition |
| **Expected Release** | TBD |
| **Availability** | TBD |
| **Priority** | P0 |

---

## MMR

**Title:** Shipping Simulator — Usage Metrics

**Description:** Instrument the shipping simulator to give VTEX visibility into how the tool is used across merchant accounts — enabling data-driven decisions about adoption, prioritization of improvements, and measurement of impact when the new Shoreline-based simulator replaces the legacy experience.

---

## Problem

The current shipping simulator has no instrumentation. VTEX has no visibility into:
- How many accounts use the simulator
- How frequently each account uses it
- Which inputs operators use most (seller, sales channel, SKU)
- How often simulations return errors or empty results

Without a baseline, it is impossible to measure whether the new simulator increases or decreases engagement.

---

## Goals

1. **Establish a pre-migration baseline** — measure current usage of the legacy simulator via API logs (`POST /api/logistics/pvt/shipping/calculate`) before the new experience ships
2. **Instrument the new simulator** — track events per simulation so VTEX can monitor adoption post-launch

---

## Metrics to Track (per account)

| Metric | Description |
|---|---|
| Unique users per account | Number of distinct users who ran at least one simulation in the period |
| Usage frequency per account | Total simulations run per account per period (daily/weekly/monthly) |
| Sales channel distribution | Which sales channels are most simulated |
| Seller usage | How often seller-scoped simulations are used vs. main account |
| Result count | Average number of freight options returned per simulation |
| Error rate | % of simulations that return errors or empty results |

---

## Open Questions

- Which analytics infrastructure should this use? (e.g., Segment, internal event bus, BigQuery)
- What is the retention policy for simulation events?
- Who owns the dashboard — Logistics PM or BI?
