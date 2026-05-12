# Product Brief — Self-Serve Simulation

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

**Title:** Order Allocation Agent — Run Simulations Independently

**Description:** With this release, merchants like C&A and OBI will be able to run allocation strategy simulations themselves — on any historical period, at any time — without scheduling support from VTEX. This means that they can iterate on strategy configurations faster, test hypotheses on-demand before committing to a new strategy, and validate adjustments without waiting in a queue.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: In Closed Beta and Open Beta, every simulation requires VTEX involvement — slowing iteration cycles and creating a dependency that doesn't scale
- Use Case: Independently validate strategy adjustments before publishing, at the merchant's own pace

---

## Feature Delta

In MMR 001, simulations are VTEX-operated by design — a Closed Beta constraint to ensure quality and avoid misconfigured strategies reaching production. As the product matures and merchants become more familiar with the agent, this constraint becomes a bottleneck.

This MMR removes the VTEX dependency from the simulation step entirely. Merchants trigger simulations directly from the agent interface, select any available historical period, and receive the full KPI report without any coordination overhead.

## Why this ships as its own MMR

Self-serve simulation requires the full simulation infrastructure (established in MMR 001) to exist and be stable before it can be exposed to merchants. It also requires a level of product maturity — verified KPI accuracy, clear error states, merchant education — that justifies deferring it to GA. Conversely, MMR 001 and the Open Beta MMRs are fully functional without self-serve simulation; VTEX-operated simulation is a working solution, just not a scalable one. This is an independent capability that changes the operational model without changing the feature boundary.

## Scope

- Simulation trigger accessible directly from the agent interface, without VTEX involvement.
- Historical period selector: merchant chooses the date range for simulation (subject to data availability per account).
- Full KPI report returned to the merchant after simulation completes: same mandatory KPIs as MMR 001.
- Simulation status indicator: running, completed, or failed — with clear error messaging if data is unavailable or incomplete for the selected period.
- Simulation results stored and accessible for comparison with previous simulation runs.
- Publication gate remains: simulation must be reviewed before publishing, same as MMR 001.

**Not in scope:** Real-time simulation (live orders), multi-period comparative simulation in a single run, simulation triggered outside the agent interface (API-only simulation), simulation on data from other merchant accounts.
