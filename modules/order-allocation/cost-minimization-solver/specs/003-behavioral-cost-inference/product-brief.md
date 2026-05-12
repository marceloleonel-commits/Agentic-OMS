# Product Brief — Behavioral Cost Inference

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

**Title:** Cost Minimization Solver — Optimize Without Complete Cost Data

**Description:** With this release, merchants like C&A and Intimissimi will get cost-aware allocation even for sellers who have never configured a single cost variable — because the solver infers implicit cost proxies from how sellers actually behave. This means that a seller who consistently rejects long-distance orders reveals a distance cost without declaring it, a seller who delays heavy shipments reveals an operational capacity constraint without filling in a handling rate, and the solver uses these revealed preferences to rank options more accurately — with no configuration required from the merchant.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer with large, mixed fulfillment networks where sellers have heterogeneous cost structures — most of which are never formally declared
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Most sellers will never fill in cost data — not because they are uncooperative, but because they don't track it or don't want to disclose it. The solver today either ignores these costs or treats all sellers as equally capable, leading to suboptimal assignments.
- Use Case: Get accurate cost-based allocation across the full seller network, including sellers with zero cost configuration, by letting observed behavior substitute for declared costs

---

## Feature Delta

MMR 001 uses VTEX-native costs (shipping + handling). MMR 002 lets merchants provide explicit additional costs. But both assume cost data exists — either in VTEX configurations or provided by the merchant. In practice, large fulfillment networks have significant gaps: franchise stores with no handling cost configured, marketplace sellers with undisclosed commission structures, DCs whose effective capacity is not reflected in any system field.

This MMR introduces behavioral cost inference: a continuous process that observes seller allocation outcomes over time — which orders were accepted, rejected, delayed, or fulfilled on time — and derives implicit cost proxies from those patterns. These proxies are folded into the cost model alongside declared costs, filling gaps without requiring any merchant or seller action.

The theoretical foundation is **revealed preference**: sellers reveal their true operational costs through the orders they accept and refuse, the distances they service, the weights they handle reliably, and the conditions under which they perform. This is the same mechanism design insight that Amazon's Flo Pro system applies to vendor coordination under asymmetric information — you don't need to ask for costs if the system is designed so that behavior encodes them.

## Why this ships as its own MMR

Behavioral inference requires a sufficient history of allocation outcomes to produce reliable signals — making it dependent on the solver (MMR 001) having been live long enough to accumulate data. It also involves a qualitatively different technical approach (behavioral pattern analysis, signal normalization, cost proxy calibration) compared to the ingestion model of MMR 002. The merchant value is independently communicable and targets a different gap: not "use the cost data you have" (MMR 002), but "optimize even where cost data doesn't exist." These are different propositions for different merchants at different levels of data maturity.

## Scope

- Continuous observation of seller allocation outcomes: order acceptance, rejection, delay rate, on-time fulfillment rate, by order attribute (distance, weight, order value, product category, time of day/week).
- Derivation of implicit cost proxies from behavioral patterns:
  - **Distance cost proxy**: inferred from rejection and delay rates as a function of delivery distance.
  - **Capacity cost proxy**: inferred from delay rates and on-time fulfillment rates as a function of order weight, volume, or SKU count.
  - **Reliability cost proxy**: inferred from fulfillment promise adherence rates — a seller with high rejection or cancellation rates carries an implicit cost that reflects allocation risk.
  - **Contextual performance proxy**: inferred from performance variation by time, region, or product type — sellers that perform better in specific contexts are assigned lower implicit costs in those contexts.
- Explicit costs (VTEX-native or merchant-provided) always take precedence over inferred proxies for the same dimension. Inference only fills gaps where no declared cost exists.
- Inferred proxies are visible to the merchant: for each seller, the agent can show which cost dimensions are declared vs. inferred, and what signals drove the inference.
- Inference improves continuously as more allocation data accumulates; proxies are recalibrated on a rolling basis.

**Not in scope:** Exposing raw behavioral signals to merchants (summary cost proxies only), using inferred costs to override declared costs, inferring costs from external data sources outside VTEX allocation history, sharing inferred cost data across merchant accounts.
