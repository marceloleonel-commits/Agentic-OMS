# Product Spec — A/B Testing

## Clarifications

- Q: Can an order be split between the control and treatment arms (i.e., different items from the same order allocated by different strategies)? → A: No. Each order is assigned to exactly one arm. No order is split across arms.
- Q: How is an order assigned to control or treatment? → A: Deterministically, based on a hash of the order ID and the traffic split percentage. The same order always maps to the same arm within an experiment.
- Q: Can the merchant change the traffic split after an experiment starts? → A: No. Traffic split is fixed at experiment start to maintain validity. Changes require ending the experiment and starting a new one.
- Q: What happens to the treatment arm if its live simulation shows delivery time deviation ≠ 0? → A: The treatment arm is automatically paused and the affected orders fall back to the control arm. The merchant is notified immediately.
- Q: Does the control arm always use the currently active published strategy? → A: Yes. The control is always the current active strategy at the time the experiment is started.
- Q: Is there a minimum experiment duration or order count? → A: The system recommends a minimum order count per arm (default: 500 orders) for directional validity, but does not block the merchant from ending early.
- Q: When the merchant promotes the treatment strategy, does it require another simulation or a confirmation step? → A: A confirmation step only. A valid simulation already exists from experiment setup; a new one is not required unless the configuration was changed during the experiment.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant runs a controlled experiment between two strategies and promotes the winner (Priority: P1)

An Omnichannel Manager at Intimissimi has an active Cost Minimization strategy and wants to test a new configuration with increased weight on handling cost. They start an A/B experiment: 80% of orders go to the current strategy (control), 20% to the new configuration (treatment). After 2 weeks and 600 treatment orders, the results dashboard shows the treatment arm achieves 1.2% better cost deviation with no SLA impact. The merchant promotes the treatment strategy to 100%.

**Why this priority:** This is the entire value of the MMR. Without a valid end-to-end experiment — setup, live traffic split, results comparison, promotion — the feature does not exist.

**Independent Test:** Configure an active strategy as control. Create a new strategy configuration as treatment. Set a 20/80 split. Place test orders. Confirm: orders are deterministically split between arms, KPIs are reported per arm, and the merchant can promote the treatment or end the experiment without promoting.

**Acceptance Scenarios:**

1. **Given** the merchant starts an experiment, **When** they configure it, **Then** they must select: a treatment strategy (configured via the standard flow), a traffic split percentage, and an optional experiment duration.
2. **Given** the experiment is running, **When** orders are placed, **Then** each order is deterministically assigned to control or treatment based on the traffic split, with no order assigned to both.
3. **Given** the treatment arm produces delivery time deviation ≠ 0 on live orders, **When** the condition is detected, **Then** the treatment arm is automatically paused, affected orders fall back to control, and the merchant is notified immediately.
4. **Given** the experiment has run for the configured duration or the merchant manually ends it, **When** results are shown, **Then** the results dashboard displays KPIs side-by-side per arm: total cost-to-serve, shipping cost, cost deviation from optimal, split rate, delivery time deviation, and % of orders with seller change.
5. **Given** the merchant reviews results and chooses to promote the treatment, **When** they confirm, **Then** the treatment strategy is published as the new active strategy for 100% of orders, and the experiment is closed.
6. **Given** the merchant ends the experiment without promoting, **When** they confirm, **Then** the control strategy continues as the only active strategy and the treatment configuration is retained in strategy history (MMR 005) for future reference.

### User Story 2 — Merchant monitors a running experiment and detects early signals (Priority: P2)

An Omnichannel Manager at OBI checks in on a running experiment after 3 days. The treatment arm has only 120 orders — below the recommended minimum — but already shows a concerning increase in split rate. The merchant decides to end the experiment early rather than wait.

**Acceptance Scenarios:**

1. **Given** an experiment is running, **When** the merchant opens the results dashboard, **Then** current KPIs per arm are shown alongside the order count per arm and a progress indicator toward the recommended minimum count.
2. **Given** the order count per arm is below the recommended minimum, **When** KPIs are shown, **Then** the system displays a disclaimer that results may not be statistically representative.
3. **Given** the merchant ends the experiment early, **When** they confirm, **Then** the experiment closes immediately, the control strategy remains active, and final results are saved in experiment history.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow merchants to create an experiment with: a treatment strategy (configured via standard flow with valid simulation), a traffic split percentage, and an optional fixed duration.
- **FR-002**: The system MUST assign each order deterministically to control or treatment based on order ID hash and the configured traffic split; no order may be assigned to both arms.
- **FR-003**: The system MUST fix the traffic split for the duration of the experiment; changes require ending the current experiment and starting a new one.
- **FR-004**: The system MUST automatically pause the treatment arm if delivery time deviation ≠ 0 is detected on live treatment orders; affected orders MUST fall back to the control arm immediately.
- **FR-005**: The system MUST notify the merchant immediately when a treatment arm is automatically paused.
- **FR-006**: The system MUST provide a results dashboard showing KPIs per arm: total cost-to-serve, shipping cost, cost deviation from optimal, split rate, delivery time deviation, % of orders with seller change.
- **FR-007**: The system MUST display the order count per arm and a recommended minimum count indicator; results below the minimum MUST include a disclaimer.
- **FR-008**: The system MUST allow the merchant to end an experiment at any time and either promote the treatment or keep the control.
- **FR-009**: Promoting the treatment MUST require a deliberate confirmation step but MUST NOT require a new simulation if the treatment configuration has not changed since its original simulation.
- **FR-010**: Ended experiments and their results MUST be retained in experiment history per merchant account.
- **FR-011**: The system MUST NOT allow more than one active experiment per merchant account at a time.

---

## Assumptions

- MMR 005 (Strategy Versioning) is active — the treatment strategy is versioned alongside control results; ending an experiment without promotion retains the treatment in history.
- The traffic split and deterministic order assignment are implemented at the routing layer before the solver runs — the solver itself does not need to be aware of the experiment.
- Sufficient order volume for statistically meaningful results (recommended minimum: 500 orders per arm) is a merchant responsibility; the system recommends but does not enforce it.
- The control arm always uses the strategy that was active at the moment the experiment started, even if that strategy is superseded during the experiment (it is "frozen" as the control for the duration).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can set up, run, and end an A/B experiment — including promoting the winner — without VTEX support intervention.
- **SC-002**: 0 orders assigned to both arms within the same experiment.
- **SC-003**: 0 treatment arms with delivery time deviation ≠ 0 that remain active past the detection cycle.
- **SC-004**: Merchants who promote a treatment strategy show measurable KPI improvement relative to the control, confirming the experiment identified a genuine improvement.
- **SC-005**: At least 2 post-GA merchants complete at least one A/B experiment within 90 days of the MMR launching.
