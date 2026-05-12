# Product Spec — Asynchronous Order Allocation

## Clarifications

- Q: Does the async evaluation run after seller orders are created, or before? → A: Before. The evaluation runs in the window between order placement and seller order creation. Seller orders are created with the result of the evaluation — or with the checkout result if the evaluation is skipped or fails.
- Q: Not all orders go through async evaluation — which ones are excluded? → A: Orders that cannot safely be reallocated given their commercial or operational constraints. Two known exclusion cases: orders with payment split (the payment is already committed to a specific seller), and orders whose delivery window is too short for a reallocation to complete safely. Other exclusion criteria may be identified as the system matures.
- Q: What happens if the evaluation system is unavailable? → A: Seller orders are created with the checkout allocation. Order creation is never blocked by the evaluation system being unavailable.
- Q: What happens if the evaluation finds no better allocation? → A: It is retried automatically a defined number of times. If all retries fail, seller orders are created with the original checkout allocation.
- Q: Does delivery time in the proposed allocation have to exactly match the checkout result? → A: Yes. Any delivery time deviation makes the proposed allocation invalid and triggers a retry.
- Q: What is the review window? → A: The state in the process where the merchant sees the proposed allocation before seller orders are created. They can approve it, dispute it (triggering a new evaluation), or cancel (seller orders are created with the checkout allocation).
- Q: Can the merchant opt out of async evaluation per order? → A: Not in Closed Beta. Per-order opt-out is a future capability.
- Q: Does the async infrastructure also support reallocation of orders that already have seller orders created? → A: Yes. Reallocation runs through the same async evaluation process, but is triggered after seller orders already exist — by a reallocation trigger (seller cancellation, stockout, merchant rule, or manual request). The same review window and fallback behavior apply. Reallocation is only possible while the order is in a pre-fulfillment state (not yet picked, packed, or shipped).
- Q: What triggers a reallocation? → A: In Closed Beta, the primary trigger is seller cancellation or stockout. Manual reallocation initiated by the merchant and rule-based automatic reallocation are capabilities delivered through the Order Allocation Agent (separate MMR), not through this infrastructure spec.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Order is evaluated and merchant approves a better allocation before seller orders are created (Priority: P1)

A shopper places a multi-item order at Intimissimi. The checkout allocation assigns two sellers. The system evaluates the order in the async window, finds a single seller that covers the full order at lower cost within the original SLA, and presents the proposed allocation to the merchant for review. The merchant approves it. Seller orders are created with the improved, single-seller allocation. The shopper's delivery promise is unchanged.

**Why this priority:** This is the end-to-end validation of the entire async infrastructure. If this scenario does not work, no capability built on top — Cost Minimization Solver, Order Allocation Agent — can deliver value.

**Independent Test:** Place a multi-item test order with a known lower-cost single-seller option available. Confirm: the evaluation finds the better option, the merchant sees a review prompt with the proposed allocation and cost comparison, the merchant approves, and seller orders are created with the improved allocation. Delivery time matches the checkout result exactly.

**Acceptance Scenarios:**

1. **Given** a shopper places an order, **When** the async evaluation finds a better allocation within the original SLA, **Then** the merchant is presented with the proposed allocation — including proposed seller(s), cost comparison, and delivery time — before any seller orders are created.
2. **Given** the merchant reviews the proposed allocation, **When** they approve it, **Then** seller orders are created with the new allocation.
3. **Given** the merchant reviews the proposed allocation, **When** they dispute it, **Then** a new evaluation is triggered and the merchant is presented with the next result.
4. **Given** the merchant cancels the review, **When** the cancellation is confirmed, **Then** seller orders are created with the original checkout allocation.
5. **Given** a proposed allocation has delivery time deviation ≠ 0, **When** the system evaluates the result, **Then** the result is invalid and a new evaluation is triggered automatically.
6. **Given** all retries are exhausted without a valid result, **When** the final retry fails, **Then** seller orders are created with the original checkout allocation.

### User Story 2 — Excluded order goes directly to seller order creation without delay (Priority: P1)

A shopper places an order with a payment split. The system identifies it as excluded from async evaluation. Seller orders are created immediately with the checkout allocation — no evaluation window, no delay.

**Why this priority:** Fallback safety is as important as the happy path. Order creation must never be blocked or delayed by the async infrastructure.

**Independent Test:** Place an order with a payment split seller. Confirm: the evaluation window is not started, seller orders are created with the checkout allocation, and no review prompt appears.

**Acceptance Scenarios:**

1. **Given** an order is excluded from async evaluation, **When** the order is placed, **Then** seller orders are created with the checkout allocation immediately — no evaluation window is started.
2. **Given** the evaluation system is unavailable, **When** an order is placed, **Then** seller orders are created with the checkout allocation — order creation is never blocked.

### User Story 3 — Order is reallocated after a seller cancels (Priority: P1)

An Omnichannel Manager at C&A sees that a seller cancelled their part of a fulfilled order. The system detects the cancellation, checks that the order is still in a pre-fulfillment state, and starts an async evaluation to find a replacement seller. The merchant receives a review prompt with the proposed replacement. They approve it, and the order is reassigned before fulfillment begins.

**Why this priority:** Seller cancellation is the most common trigger for post-creation reallocation and the most operationally impactful if unhandled. Without this, cancelled assignments require full manual intervention.

**Independent Test:** Trigger a seller cancellation on a test order in a pre-fulfillment state. Confirm: the system starts a reallocation evaluation, the merchant receives a review prompt showing the current (cancelled) seller and the proposed replacement, approving reassigns the order, and the delivery promise is preserved.

**Acceptance Scenarios:**

1. **Given** a seller cancels their assignment on an order in pre-fulfillment state, **When** the reallocation evaluation starts, **Then** the same review window used in initial allocation is shown to the merchant with the proposed replacement seller.
2. **Given** a reallocation is triggered on an order that is already being picked, packed, or shipped, **When** the system evaluates eligibility, **Then** reallocation is not attempted and the order remains as-is.
3. **Given** the reallocation evaluation finds a replacement within the original SLA, **When** the merchant approves, **Then** the order is reassigned to the new seller and the delivery promise is preserved.
4. **Given** no replacement seller is found within the original SLA, **When** all retries are exhausted, **Then** the merchant is notified and the order remains in its current state for manual resolution.

### User Story 4 — Express order evaluation completes within the near-real-time window (Priority: P1)

A shopper selects same-day delivery. The system identifies this as an express order. The async evaluation completes within 10 seconds, before the express fulfillment window closes.

**Acceptance Scenarios:**

1. **Given** an order has an express delivery SLA, **When** the async evaluation runs, **Then** it completes within P99 < 10 seconds of order placement.
2. **Given** the evaluation does not complete within 10 seconds for an express order, **When** the timeout is reached, **Then** seller orders are created with the checkout allocation — no error is surfaced to the shopper.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST evaluate whether a better allocation exists in the window between order placement and seller order creation, for eligible orders.
- **FR-002**: The system MUST skip async evaluation for excluded order types and create seller orders with the checkout allocation immediately.
- **FR-003**: The system MUST exclude at minimum: orders with payment split constraints, and orders whose delivery window is too short for reallocation to complete safely.
- **FR-004**: The system MUST present the proposed allocation to the merchant for review before seller orders are created, when a valid better allocation is found.
- **FR-005**: The system MUST allow the merchant to approve, dispute, or cancel from the review prompt.
- **FR-006**: Disputing MUST trigger a new evaluation; canceling MUST create seller orders with the checkout allocation.
- **FR-007**: The system MUST treat any proposed allocation with delivery time deviation ≠ 0 as invalid and trigger a retry automatically.
- **FR-008**: The system MUST retry failed evaluations automatically up to a defined number of times. After all retries are exhausted, seller orders MUST be created with the checkout allocation.
- **FR-009**: The system MUST create seller orders with the checkout allocation whenever the evaluation system is unavailable — order creation is never blocked.
- **FR-010**: The system MUST complete evaluation within P95 < 60s for standard orders and P99 < 10s for express deliveries.
- **FR-011**: The system MUST NOT affect checkout performance or latency in any way.
- **FR-012**: The system MUST support reallocation triggered by seller cancellation or stockout on orders that already have seller orders created, using the same evaluation process and review window as initial allocation.
- **FR-013**: The system MUST only attempt reallocation while the order is in a pre-fulfillment state (not yet picked, packed, or shipped).
- **FR-014**: If no replacement is found within the original SLA after all retries, the system MUST notify the merchant and leave the order in its current state — it MUST NOT create a new seller order without a valid replacement.

---

## Assumptions

- The checkout allocation continues to run synchronously and unchanged — it remains the starting point and the fallback for every order.
- Seller orders are not created until the evaluation window closes (either with an approved result or a fallback to the checkout allocation). This is a dependency on the Async Orders RFC infrastructure.
- The specific list of excluded order types will grow as the system matures; the two initial exclusion criteria (payment split, short SLA window) are the starting point.
- The number of retries for failed evaluations is defined by the engineering team based on operational data from Closed Beta.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 order creation failures attributable to evaluation system unavailability.
- **SC-002**: 0 SLA regressions (delivery time deviations) attributable to async reallocation in production.
- **SC-003**: P95 evaluation time < 60s for standard orders; P99 < 10s for express orders, measured in production.
- **SC-004**: The async infrastructure is stable enough to serve as the foundation for the Cost Minimization Solver Closed Beta by end of H1 2026.
- **SC-005**: 100% of orders that exhaust all retries result in successful seller order creation with the checkout allocation — no orders are lost at this stage.
