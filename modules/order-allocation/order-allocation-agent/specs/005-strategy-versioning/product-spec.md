# Product Spec — Strategy Versioning & History

## Clarifications

- Q: Is strategy history retained indefinitely or for a defined period? → A: Retained indefinitely per merchant account in GA. Retention limits are deferred.
- Q: Can a merchant reactivate a past strategy that has no simulation results (e.g., configured before simulation was introduced)? → A: No. Reactivation requires valid simulation results. If a past strategy lacks them, the merchant must run a new simulation before reactivating.
- Q: Does reactivating a past strategy count as a new publication event? → A: Yes. Reactivation is treated as a new publication with a new timestamp. The merchant receives the same confirmation flow as a new publication.
- Q: Can the merchant see KPIs from when a past strategy was live, even after it was replaced? → A: Yes. If MMR 002 (Real-Time Monitoring) is active, historical live performance data is retained per strategy version for the period it was active.
- Q: Is there a limit on the number of strategy versions stored? → A: No limit in GA.
- Q: Can two versions be compared if they were configured for different segments (MMR 008)? → A: Only within the same segment. Cross-segment comparison is not supported in GA.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant browses strategy history and identifies a past version to restore (Priority: P1)

An Omnichannel Manager at OBI notices via the monitoring dashboard that cost deviation has increased since publishing the latest strategy. They open the strategy history, find the version published three weeks ago that had better KPIs, compare it side-by-side with the current one, and reactivate it.

**Why this priority:** This is the core safety net of the MMR. Without the ability to browse, compare, and reactivate, versioning has no operational value.

**Independent Test:** Publish at least two distinct strategies. Open strategy history. Compare the two versions. Reactivate the older one. Confirm: active strategy changes, new publication timestamp is recorded, and the previously active strategy is now marked as inactive.

**Acceptance Scenarios:**

1. **Given** at least one strategy has been published, **When** the merchant opens the strategy history view, **Then** all published strategies are listed with their publication timestamps, status (active or inactive), and a summary of their cost dimension weights.
2. **Given** two strategy versions exist, **When** the merchant selects both for comparison, **Then** a side-by-side view shows cost dimension weights, simulation KPIs, and live performance KPIs (if available from MMR 002) for each version.
3. **Given** the merchant selects a past strategy for reactivation, **When** they initiate the action, **Then** the system requires a deliberate confirmation step — not a single-click action.
4. **Given** the merchant confirms reactivation, **When** the strategy goes live, **Then** it is applied to all new orders from that moment, a new publication timestamp is recorded, and the previously active strategy is marked as inactive.
5. **Given** a past strategy has no valid simulation results, **When** the merchant attempts to reactivate it, **Then** the system blocks reactivation and prompts the merchant to run a new simulation first.
6. **Given** reactivation would put live a strategy with delivery time deviation ≠ 0 in its simulation results, **When** the merchant attempts to reactivate it, **Then** the system blocks reactivation regardless of the strategy's historical performance.

### User Story 2 — Merchant uses a past strategy as a starting point for a new configuration (Priority: P2)

Rather than starting from a blank prompt, an Omnichannel Manager opens a past strategy version and uses its cost weights as the starting point for a new configuration cycle.

**Acceptance Scenarios:**

1. **Given** the merchant views a past strategy in history, **When** they choose to use it as a starting point, **Then** the configuration flow opens pre-filled with that strategy's cost weights and constraint rules (if MMR 011 is active).
2. **Given** the pre-filled configuration is modified and published, **Then** it is stored as a new version in history — the original past version is unchanged.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store every published strategy as a version with its configuration (cost weights, constraint rules if applicable), simulation results, and publication timestamp.
- **FR-002**: The system MUST display a strategy history view listing all versions with their status (active, inactive), publication timestamps, and a configuration summary.
- **FR-003**: The system MUST support side-by-side comparison of any two strategy versions, showing cost dimension weights, simulation KPIs, and live performance KPIs (if available from MMR 002).
- **FR-004**: The system MUST allow reactivation of any past strategy via a deliberate confirmation step.
- **FR-005**: The system MUST block reactivation if the selected version has no valid simulation results or if its simulation shows delivery time deviation ≠ 0.
- **FR-006**: The system MUST record reactivation as a new publication event with a new timestamp.
- **FR-007**: The system MUST retain strategy history indefinitely per merchant account with no version limit.
- **FR-008**: The system SHOULD allow merchants to use any past strategy version as a pre-filled starting point for a new configuration cycle.
- **FR-009**: The system MUST NOT modify past strategy versions in any way — they are immutable records.

---

## Assumptions

- Every strategy published via MMR 001 is stored with sufficient structured data (cost weights, simulation KPIs) to support comparison without requiring re-processing.
- Live performance KPI data from MMR 002 is stored per strategy version for the period each version was active, if MMR 002 is enabled on the account.
- Merchants using versioning have published at least two strategies; accounts with a single published strategy will see a history view with one entry and no comparison available.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can open strategy history, compare two versions side-by-side, and reactivate a past version without VTEX support intervention.
- **SC-002**: 0 reactivations that bypass the simulation validity gate or put a strategy with delivery time deviation ≠ 0 live.
- **SC-003**: Strategy history is available for 100% of strategies published since MMR 001 activation — no retroactive data loss.
- **SC-004**: At least 1 merchant in GA uses strategy versioning to recover from a regression (reactivates a past strategy after detecting underperformance via MMR 002) within the first 90 days of GA.
