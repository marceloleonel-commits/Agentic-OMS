# Product Spec — Proactive Strategy Recommendations

## Clarifications

- Q: Are recommendations sent via email, push notification, or in-app only? → A: In-app only in GA. Email and push notifications are deferred.
- Q: Can a merchant disable proactive recommendations entirely? → A: Yes. Recommendations are opt-out; merchants can disable them per account.
- Q: What triggers a recommendation — a single anomalous order or a pattern over time? → A: A pattern over a configurable rolling window (default: 7 days), not a single order. Single-order anomalies are noise.
- Q: Can the merchant configure the thresholds that trigger recommendations? → A: Yes. Default thresholds are provided but the merchant can override them.
- Q: Are recommendations blocking — do they prevent the merchant from acting on the strategy until reviewed? → A: No. Recommendations are non-blocking. The merchant can dismiss, accept, or ignore them.
- Q: If the merchant dismisses a recommendation, will the same recommendation resurface? → A: Not for the same condition within the same rolling window. If the condition persists into the next window, a new recommendation may be generated.
- Q: Does a recommendation require MMR 004 (Self-Serve Simulation) to exist? → A: Accepting a recommendation that proposes a configuration change triggers a simulation. If MMR 004 is not available, the simulation is VTEX-operated — same as MMR 001.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant receives a proactive recommendation after cost regression is detected (Priority: P1)

An Omnichannel Manager at C&A has an active strategy but hasn't opened the monitoring dashboard in two weeks. The agent detects that cost deviation from optimal has exceeded the configured threshold over the past 7 days. A recommendation appears in the agent interface with a plain-language explanation and a proposed configuration adjustment.

**Why this priority:** This is the core value of the MMR. Without the agent proactively surfacing a recommendation, this feature is identical to monitoring.

**Independent Test:** Configure an active strategy. Manipulate conditions so that a monitored KPI exceeds its threshold. Confirm: a recommendation appears in the agent interface, contains a plain-language explanation and a proposed configuration change, and the merchant can accept, dismiss, or ask for more detail.

**Acceptance Scenarios:**

1. **Given** an active strategy and a monitoring condition that has been breached over the configured rolling window, **When** the agent generates a recommendation, **Then** it appears in the agent interface with: the KPI that triggered it, a plain-language explanation of what changed, and a proposed configuration adjustment.
2. **Given** a recommendation is shown, **When** the merchant accepts it, **Then** the configuration flow opens pre-filled with the recommended parameters and a simulation is triggered.
3. **Given** a recommendation is shown, **When** the merchant dismisses it, **Then** it is archived and will not resurface for the same condition within the current rolling window.
4. **Given** a dismissed recommendation's underlying condition persists into the next rolling window, **When** the agent re-evaluates, **Then** a new recommendation may be generated.
5. **Given** the merchant has disabled recommendations, **When** a threshold is breached, **Then** no recommendation is generated or shown.

### User Story 2 — Merchant configures custom recommendation thresholds (Priority: P2)

An Omnichannel Manager at OBI finds the default cost deviation threshold of 3% too sensitive — their business has natural cost variance above that level. They adjust the threshold to 6% and the rolling window to 14 days.

**Acceptance Scenarios:**

1. **Given** the merchant opens recommendation settings, **When** they adjust the cost deviation threshold and rolling window, **Then** subsequent recommendations use the new values.
2. **Given** the merchant resets to defaults, **When** they save, **Then** the system reverts to the default threshold values.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST continuously monitor active strategy KPIs and generate a recommendation when any configured threshold is breached over the rolling window.
- **FR-002**: Default monitoring conditions MUST include: delivery time deviation > 0 for more than 5% of orders in the rolling window, cost deviation from optimal exceeding 3% above the simulation baseline, and split rate increasing more than 20% relative to simulation baseline.
- **FR-003**: The system MUST display recommendations in the agent interface with: the triggering KPI and its current value, a plain-language explanation, and a proposed configuration adjustment.
- **FR-004**: The system MUST allow the merchant to accept, dismiss, or request further explanation for any recommendation.
- **FR-005**: Accepting a recommendation MUST open the configuration flow pre-filled with the recommended parameters and trigger a simulation.
- **FR-006**: Dismissed recommendations MUST NOT resurface for the same condition within the same rolling window.
- **FR-007**: The system MUST allow merchants to configure custom thresholds for each monitored condition and the rolling window duration (minimum: 3 days, maximum: 30 days).
- **FR-008**: The system MUST allow merchants to disable proactive recommendations entirely per account.
- **FR-009**: All generated recommendations MUST be logged and accessible from the agent interface, including dismissed ones.
- **FR-010**: The system MUST NOT generate more than one active recommendation for the same condition at the same time.

---

## Assumptions

- MMR 002 (Real-Time Monitoring) is active and producing reliable per-order KPI data before this MMR ships — recommendations are derived from the same monitoring pipeline.
- The recommendation generation runs server-side on a scheduled evaluation cycle (e.g., every 6 hours); near-real-time triggering is deferred.
- Merchants have at least 7 days of live strategy performance data before the first recommendation can be generated.
- If MMR 004 (Self-Serve Simulation) is not active, accepting a recommendation triggers a VTEX-operated simulation request instead of a self-serve run.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 1 recommendation is generated and surfaced per merchant in GA within the first 30 days of strategy operation, assuming at least one threshold condition is met.
- **SC-002**: At least 50% of surfaced recommendations result in a merchant action (accept or dismiss) within 7 days of appearing.
- **SC-003**: 0 recommendations propose a configuration change that, when accepted and simulated, results in delivery time deviation ≠ 0.
- **SC-004**: Merchants who act on a recommendation and publish the resulting strategy show measurable KPI improvement within 14 days of publication vs. the strategy that triggered the recommendation.
