# Product Spec — Order State Visibility

## Clarifications

- Q: Which allocation states are visible to merchants, and which are purely internal? → A: Merchant-visible: Evaluating, Awaiting Your Review, Evaluation Failed, Allocated, Allocation Canceled. Transitional steps within the process are not surfaced as separate states — the merchant sees only states where something meaningful has happened or where they need to act.
- Q: Do the same states apply to reallocation (post-creation) as to initial allocation (pre-creation)? → A: Yes. The same five merchant-visible states apply in both contexts. The distinction for the merchant is surfaced in the review panel content — initial allocation shows "checkout allocation vs. proposed allocation," while reallocation shows "current seller (e.g., cancelled) vs. proposed replacement seller."
- Q: What do merchants see for orders excluded from async evaluation? → A: No allocation state is shown. The order displays the checkout allocation result directly — same as today. Exclusion is not surfaced as an error or a special state.
- Q: Is the Awaiting Your Review state time-bounded? → A: Yes. If the merchant does not act within the review window, the process proceeds automatically. The default behavior and timeout duration are defined during Closed Beta.
- Q: What is shown during Awaiting Your Review? → A: The proposed seller(s), the checkout allocation for comparison, the cost difference, and the delivery time (which must match the checkout result).
- Q: If a merchant cancels from the review panel, what happens? → A: Seller orders are created with the original checkout allocation. The state transitions to Allocation Canceled.
- Q: Can a merchant reopen a review they already acted on? → A: No. Once the merchant acts on the review, the decision is final.
- Q: Is Evaluation Failed always temporary (retrying), or can it require merchant action? → A: Both. The first N failures are retried automatically. If all retries are exhausted, the state becomes final and the merchant is notified — they can choose to leave the order as-is (checkout allocation) or escalate to VTEX support.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant sees an order move through allocation states and acts on the review window (Priority: P1)

An Omnichannel Manager at Intimissimi places a test order. In VTEX Admin, the order shows **Evaluating** with a timestamp. After 20 seconds, the state transitions to **Awaiting Your Review**. An in-app notification appears. The manager opens the order, reviews the proposed allocation — a single seller, lower cost, same delivery time — approves it. The state transitions to **Allocated** and seller orders are created.

**Why this priority:** This is the core value of the MMR. Without visible states and an actionable review window, the async allocation infrastructure runs silently and merchants cannot fulfill their role in the process.

**Independent Test:** Place an eligible order. Track state transitions in VTEX Admin. Confirm: Evaluating appears with a timestamp; Awaiting Your Review appears with a notification; the review panel shows the proposed allocation, checkout baseline, and cost difference; approving transitions to Allocated; seller orders are created with the new allocation.

**Acceptance Scenarios:**

1. **Given** an order enters the async evaluation, **When** the evaluation is in progress, **Then** the order detail page shows the state **Evaluating** with a timestamp.
2. **Given** the evaluation produces a result, **When** the review window opens, **Then** the state transitions to **Awaiting Your Review** and the merchant receives an in-app notification.
3. **Given** the order is in Awaiting Your Review, **When** the merchant opens the order, **Then** they see: the proposed seller(s), the checkout allocation for comparison, the cost difference, and the delivery time.
4. **Given** the merchant approves, **When** seller orders are created, **Then** the state transitions to **Allocated** with a timestamp.
5. **Given** the merchant disputes, **When** the dispute is submitted, **Then** the state returns to **Evaluating** and a new evaluation is triggered.
6. **Given** the merchant cancels, **When** the cancellation is confirmed, **Then** the state transitions to **Allocation Canceled** and seller orders are created with the original checkout allocation.
7. **Given** the Awaiting Your Review timeout is reached with no merchant action, **When** the timeout expires, **Then** the process proceeds according to the configured default behavior.

### User Story 2 — Merchant understands an evaluation failure and its retry status (Priority: P1)

An Omnichannel Manager at C&A sees an order in **Evaluation Failed**. The order detail shows why — no seller combination within the original SLA was found — and that it is on retry 2 of 3. The manager waits; the order transitions back to **Evaluating** automatically.

**Why this priority:** Evaluation failures are expected operational events. Without visibility into retry status and failure reason, merchants cannot tell a transient failure from a permanent one.

**Acceptance Scenarios:**

1. **Given** an evaluation fails, **When** the state transitions to Evaluation Failed, **Then** the order detail shows: the reason for failure in plain language, the current retry count, and the maximum retry count.
2. **Given** retries remain, **When** the retry timer expires, **Then** the state transitions back to Evaluating automatically.
3. **Given** all retries are exhausted, **When** the final retry fails, **Then** the state transitions to Allocation Canceled, seller orders are created with the checkout allocation, and the merchant is notified.

### User Story 3 — Merchant monitors all orders currently pending allocation (Priority: P2)

During a high-volume period, an Omnichannel Manager at C&A opens the allocation pipeline view to see how many orders are in Evaluating or Awaiting Your Review, and whether any review windows are close to expiring.

**Acceptance Scenarios:**

1. **Given** multiple orders are in Evaluating or Awaiting Your Review, **When** the merchant opens the pipeline view, **Then** all such orders are listed with their state, elapsed time, and order reference.
2. **Given** an order in Awaiting Your Review is approaching the review window timeout, **When** it is shown in the pipeline view, **Then** it is visually flagged as time-sensitive.
3. **Given** an order completes the process (reaches Allocated or Allocation Canceled), **When** the view refreshes, **Then** the order is removed from the pipeline view.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display the current allocation state on the order detail page in VTEX Admin for all orders that entered the async evaluation, with a timestamp per state transition.
- **FR-002**: The system MUST surface the following merchant-visible states: Evaluating, Awaiting Your Review, Evaluation Failed, Allocated, Allocation Canceled.
- **FR-003**: The system MUST NOT display an allocation state for orders excluded from async evaluation — those orders show the checkout allocation result directly.
- **FR-004**: The system MUST send an in-app notification when an order transitions to Awaiting Your Review, including a direct link to the order.
- **FR-005**: The Awaiting Your Review panel MUST show: the proposed seller(s), the current allocation for comparison (checkout allocation for initial allocation; current assigned seller for reallocation), the cost difference, and the delivery time. The context (initial allocation vs. reallocation) MUST be clearly labeled.
- **FR-006**: The system MUST allow the merchant to approve, dispute, or cancel from the Awaiting Your Review panel.
- **FR-007**: The system MUST show the failure reason in plain language, the current retry count, and the maximum retry count when an order is in Evaluation Failed.
- **FR-008**: The system MUST provide a pipeline view listing all orders currently in Evaluating or Awaiting Your Review, with elapsed time per state.
- **FR-009**: The system MUST visually flag orders in Awaiting Your Review that are approaching their review window timeout.
- **FR-010**: The system MUST emit a VTEX order event for each merchant-visible state transition, consumable via VTEX webhooks.
- **FR-011**: The system MUST retain the full allocation state history per order for the same duration as order history in VTEX Admin.
- **FR-012**: The system MUST NOT expose allocation state to shoppers — all state visibility is merchant-only.

---

## Assumptions

- State transitions from the async evaluation process are available as structured events that this MMR surfaces in the VTEX Admin UI.
- The review window timeout value is configured during Closed Beta and may be adjusted based on operational data.
- The retry count for Evaluation Failed is defined per MMR 001; this spec surfaces it to the merchant but does not define it.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can open any order in the async evaluation process and see its current state with a timestamp — without VTEX support.
- **SC-002**: 100% of orders that enter Awaiting Your Review surface an in-app notification within 1 minute of the transition.
- **SC-003**: 0 orders remain visible in the pipeline view after reaching Allocated or Allocation Canceled.
- **SC-004**: At least 1 Closed Beta merchant acts on the Awaiting Your Review state (approve, dispute, or cancel) within the first 14 days of activation.
- **SC-005**: At least 1 Closed Beta merchant integrates allocation state events with an external system within the first 30 days of activation.
