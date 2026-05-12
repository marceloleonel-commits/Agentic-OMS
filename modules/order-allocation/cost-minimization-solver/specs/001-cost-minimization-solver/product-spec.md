# Product Spec — Cost Minimization Solver

## Clarifications

- Q: Does the solver run for every order placed, or only for orders where a split occurred synchronously? → A: Every order, regardless of whether it was split synchronously. The solver evaluates all combinations and replaces the synchronous result only if a lower-cost option is found.
- Q: What happens if the solver does not complete within the SLA window? → A: The synchronous allocation is kept as-is. The solver must never delay merchant visibility or risk breaking the Delivery Promise.
- Q: Does the solver re-evaluate if seller inventory changes during the asynchronous window? → A: No. The solver operates on the seller eligibility snapshot taken at checkout.
- Q: Can the solver increase the number of sellers compared to the synchronous result? → A: Only if doing so reduces total cost AND stays within `maxNumberOfSellersWhitelabel`. Minimizing splits is a secondary objective after cost minimization.
- Q: Must delivery time in the async result exactly match the synchronous result? → A: Yes. Any delivery time deviation flags the async result as ineligible and the synchronous allocation is kept.
- Q: Is the solver enabled by default for all merchants, or does it require opt-in? → A: Opt-in during Closed Beta. VTEX onboards merchants explicitly.
- Q: Who triggers the pre-deployment simulation — the merchant or VTEX? → A: VTEX runs all pre-deployment simulations in Closed Beta and delivers results to the merchant for review.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Orders are automatically reallocated to the lowest-cost seller (Priority: P1)

A Logistics Operations Manager at Intimissimi has the Cost Minimization Solver enabled on their account. A shopper places a multi-item order. The synchronous allocation splits it across two sellers. Post-purchase, the solver evaluates all eligible combinations and finds a single seller that can fulfill the full order at lower total cost within the original SLA. The synchronous allocation is replaced, the merchant is notified of the change, and the shopper's delivery promise is unchanged.

**Why this priority:** This is the entire value proposition of the Cost Minimization Solver. No other scenario delivers any value without this core reallocation working correctly.

**Independent Test:** Place a multi-item test order. Confirm: synchronous allocation is visible immediately, solver completes within P95 benchmark, if a lower-cost option exists the allocation changes and the merchant is notified, delivery time matches synchronous result exactly. No VTEX support required to verify the outcome.

**Acceptance Scenarios:**

1. **Given** an order is placed and synchronously allocated, **When** the solver completes, **Then** the final allocation is the lowest-cost eligible seller combination found within the original SLA.
2. **Given** the solver finds no combination lower in cost than the synchronous result, **When** the evaluation completes, **Then** the synchronous allocation is kept and no change notification is sent.
3. **Given** the solver finds a lower-cost combination, **When** it replaces the synchronous allocation, **Then** the delivery time in the new allocation does not deviate from the delivery time promised at checkout.
4. **Given** the solver finds a lower-cost combination, **When** the reallocation occurs, **Then** the merchant is notified of the seller change with the order reference and the new seller details.
5. **Given** the solver identifies a combination that would increase cost but reduce splits, **When** evaluating options, **Then** cost minimization takes precedence and the split-increasing option is not selected unless it results in equal or lower total cost.
6. **Given** an order has 5 line items, **When** the solver runs, **Then** it evaluates at most 15 eligible sellers per combination candidate, respecting the progressive seller cap.
7. **Given** the solver does not complete within the SLA window (P95 < 60s standard, P99 < 10s express), **When** the timeout is reached, **Then** the synchronous allocation is kept without any reallocation attempt.

### User Story 2 — Merchant reviews pre-deployment simulation results before going live (Priority: P1)

Before enabling the Cost Minimization Solver on their account, a Logistics Operations Manager at Intimissimi reviews a simulation report prepared by VTEX on 30 days of historical orders. The report confirms ~4.4% overall cost reduction and 0 SLA regressions. The merchant approves activation.

**Why this priority:** Pre-deployment simulation is the confidence gate that ensures merchants only go live with evidence of expected outcomes. Without it, there is no basis for merchant approval and no guarantee of 0 SLA regressions.

**Independent Test:** VTEX prepares and delivers a simulation report covering all mandatory KPIs for the merchant's historical order data. Merchant reviews and approves. Confirm: all KPIs are present, delivery time deviation is 0, and activation is blocked until the merchant explicitly approves.

**Acceptance Scenarios:**

1. **Given** VTEX prepares a pre-deployment simulation, **When** the merchant reviews the report, **Then** it includes all mandatory KPIs: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders that would be reallocated, and time elapsed to reallocate.
2. **Given** the simulation report shows delivery time deviation ≠ 0, **When** the merchant reviews it, **Then** activation is blocked until the root cause is resolved.
3. **Given** simulation results are valid (deviation = 0), **When** the merchant approves, **Then** the solver is activated and applied to all new orders from that point forward — never retroactively.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST run the Cost Minimization Solver post-purchase, in parallel with — and without blocking — the synchronous allocation.
- **FR-002**: The system MUST evaluate all eligible seller combinations for each order using the cost model: `Total Cost = product price + shipping cost (from shipping tables) + handling cost (from warehouse entity)`.
- **FR-003**: The system MUST replace the synchronous allocation with the solver's result only when total cost is lower AND delivery time does not deviate from the synchronous result.
- **FR-004**: The system MUST keep the synchronous allocation when the solver finds no lower-cost option, when the solver times out, or when any candidate result has delivery time deviation ≠ 0.
- **FR-005**: The system MUST notify the merchant when a reallocation occurs, including the order reference and the new seller details.
- **FR-006**: The system MUST respect the `maxNumberOfSellersWhitelabel` configuration as an upper bound on order splits in any solver result.
- **FR-007**: The system MUST enforce progressive seller caps: 1 item → max 240 sellers, 2 items → 120, 3 items → 60, 4 items → 30, 5 items → 15.
- **FR-008**: The system MUST NOT process orders with more than 5 line items through the solver; such orders retain the synchronous allocation.
- **FR-009**: The system MUST complete reallocation within P95 < 60s for standard orders and P99 < 10s for express deliveries.
- **FR-010**: The system MUST NOT retroactively reallocate orders placed before the solver was activated on a merchant account.
- **FR-011**: The system MUST require VTEX to prepare and deliver a pre-deployment simulation report before the solver is activated on any merchant account in Closed Beta.
- **FR-012**: The system MUST block solver activation if the pre-deployment simulation shows delivery time deviation ≠ 0.
- **FR-013**: The system MUST require explicit merchant approval of the simulation report before activation.

---

## Assumptions

- The Asynchronous Order Allocation infrastructure is deployed and operational — the Cost Minimization Solver runs on top of it.
- Merchants have shipping tables and warehouse handling costs configured in VTEX before the solver is activated.
- Historical order data is available per merchant account for VTEX-operated pre-deployment simulations.
- Only one strategy is active per merchant account during Closed Beta.
- The synchronous allocation remains unchanged at checkout and is always the live assignment until the solver confirms a replacement.
- Solver activation is opt-in and managed by VTEX during Closed Beta; no self-serve activation interface is required.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 1 merchant is live with the Cost Minimization Solver in Closed Beta by end of H1 2026.
- **SC-002**: Active solver achieves ~5% reduction in operational costs (shipping + handling) vs. the synchronous baseline, measured post-deployment across at least 30 days.
- **SC-003**: 0 SLA regressions (delivery time deviations) attributable to solver reallocation in production.
- **SC-004**: 0 solver activations without a prior VTEX-prepared simulation review and explicit merchant approval.
- **SC-005**: P95 reallocation time < 60s for standard orders; P99 < 10s for express deliveries, measured in production.
