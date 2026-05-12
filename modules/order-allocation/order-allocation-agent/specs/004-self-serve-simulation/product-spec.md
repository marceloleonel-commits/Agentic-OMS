# Product Spec — Self-Serve Simulation

## Clarifications

- Q: Can a merchant run multiple simulations simultaneously on different historical periods? → A: No. One simulation at a time per merchant account in GA. Concurrent simulations are deferred.
- Q: Is there a minimum historical period required for a simulation to be valid? → A: Yes. A minimum of 7 days of order history is required. Shorter periods produce statistically unreliable KPIs.
- Q: What happens if the selected period has insufficient data (e.g., account was inactive)? → A: The system surfaces a clear error before the simulation starts, not after it completes.
- Q: Are self-serve simulation results held to the same publication gate as VTEX-operated simulations? → A: Yes. The delivery time deviation = 0 requirement and explicit merchant confirmation are unchanged.
- Q: How long does a simulation take? → A: Depends on the historical period and order volume. The merchant sees a status indicator; the simulation runs asynchronously and notifies when complete.
- Q: Are past self-serve simulation results stored? → A: Yes. All simulation results are stored and accessible from the strategy configuration history, associated with the strategy version that was simulated.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant runs a simulation independently on a historical period (Priority: P1)

An Omnichannel Manager at C&A configures a new strategy in the agent, selects a 30-day historical period, and triggers a simulation without any VTEX involvement. The simulation runs asynchronously. When complete, the merchant receives a notification and opens the full KPI report to review the results.

**Why this priority:** This is the entire value of the MMR. Without the ability to trigger and receive a simulation independently, no other self-serve capability exists.

**Independent Test:** Configure a strategy, trigger a simulation on a historical period, wait for completion, open the KPI report. Confirm: all mandatory KPIs are present, no VTEX action was required at any step, and results meet the publication gate requirements if valid.

**Acceptance Scenarios:**

1. **Given** the merchant has configured a strategy and is reviewing the interpretation summary, **When** they trigger a simulation, **Then** the system accepts the request, shows a running status, and processes asynchronously without requiring VTEX involvement.
2. **Given** the merchant selects a historical period, **When** the period contains fewer than 7 days of order data, **Then** the system blocks the simulation with a clear explanation before it starts.
3. **Given** a simulation is running, **When** it completes, **Then** the merchant receives an in-app notification and the full KPI report is available.
4. **Given** the simulation completes, **When** the merchant reviews the report, **Then** it contains all mandatory KPIs: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders with seller change, and time elapsed to reallocate.
5. **Given** simulation results show delivery time deviation ≠ 0, **When** the merchant attempts to publish, **Then** publication is blocked — same gate as MMR 001.
6. **Given** a simulation fails due to a data error, **When** the merchant views the status, **Then** a clear error message is shown with the reason for failure and a suggested corrective action.

### User Story 2 — Merchant reruns a simulation after adjusting the strategy (Priority: P2)

After reviewing simulation results that show unacceptable cost deviation, an Omnichannel Manager adjusts the strategy's cost weights and reruns the simulation on the same historical period to compare outcomes.

**Why this priority:** Iteration is the core use pattern for self-serve simulation. Without the ability to rerun after adjustments, the merchant is back to a single-pass workflow identical to VTEX-operated simulation.

**Acceptance Scenarios:**

1. **Given** the merchant has reviewed simulation results, **When** they return to the configuration step and adjust cost weights, **Then** they can trigger a new simulation without losing the previous simulation results.
2. **Given** two simulation runs exist for the same strategy, **When** the merchant views simulation history, **Then** both results are accessible and timestamped for comparison.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow merchants to trigger a simulation directly from the agent interface without VTEX involvement.
- **FR-002**: The system MUST provide a historical period selector; the merchant MUST be able to choose any date range within their available order history.
- **FR-003**: The system MUST enforce a minimum period of 7 days; attempts to simulate on shorter periods MUST be blocked with a clear error before the simulation starts.
- **FR-004**: The system MUST run simulations asynchronously and display a status indicator (running, completed, failed) in the agent interface.
- **FR-005**: The system MUST notify the merchant in-app when a simulation completes or fails.
- **FR-006**: The system MUST return a KPI report containing all mandatory metrics: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders with seller change, and time elapsed to reallocate.
- **FR-007**: The system MUST apply the same publication gate as MMR 001: delivery time deviation must be 0, and explicit merchant confirmation is required before publishing.
- **FR-008**: The system MUST store all simulation results associated with the strategy version that was simulated, accessible from the agent interface.
- **FR-009**: The system MUST limit concurrent simulations to one per merchant account.
- **FR-010**: The system SHOULD display an estimated completion time when a simulation starts, based on the selected period and account order volume.

---

## Assumptions

- The simulation infrastructure established in MMR 001 (VTEX-operated) is productized into a self-serve API by GA.
- Historical order data is available per merchant account with sufficient completeness for the selected period to produce reliable KPIs.
- The simulation runs on the same data pipeline used for VTEX-operated simulations — no separate infrastructure is required.
- Merchants using self-serve simulation have already completed at least one VTEX-operated simulation cycle (through MMR 001) and understand what a valid KPI report looks like.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can configure a strategy, trigger a simulation, and review results without any VTEX support intervention.
- **SC-002**: 100% of self-serve simulations return a complete KPI report or a clear error message — no silent failures.
- **SC-003**: Simulation completion time P95 < 10 minutes for historical periods up to 30 days.
- **SC-004**: 0 strategies published via self-serve simulation path that bypass the delivery time deviation = 0 gate.
- **SC-005**: At least 80% of GA merchants who configure a new strategy use self-serve simulation rather than requesting VTEX-operated simulation.
