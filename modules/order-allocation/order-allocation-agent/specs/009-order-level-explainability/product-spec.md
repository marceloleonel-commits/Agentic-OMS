# Product Spec — Order-Level Explainability

## Clarifications

- Q: Is explainability available for all historical orders or only orders placed after this MMR is activated? → A: Only orders placed after activation. Retroactive explainability data is not generated.
- Q: How long is explainability data retained per order? → A: Same retention period as order history in VTEX Admin.
- Q: Is the explainability view accessible only in the Order Allocation Agent or also from the order detail page in OMS? → A: Both — accessible from the order detail page in OMS (as a linked panel) and from within the agent interface in GA.
- Q: Does explainability show all evaluated seller combinations or only the top N? → A: Top 5 evaluated combinations in GA, plus the selected one and the runner-up. Showing all combinations is deferred (can be very large for multi-item orders).
- Q: If the async solver did not replace the synchronous result, is that shown? → A: Yes. The explainability view always shows both the synchronous result and the async evaluation outcome — whether or not a replacement occurred.
- Q: Is explainability available for orders where the solver was not active (e.g., orders placed before the strategy was activated)? → A: No. Explainability requires the solver to have run for that order. Orders without solver data show a "not available" state, not an error.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant investigates why a specific order was allocated to an unexpected seller (Priority: P1)

An Omnichannel Manager at OBI notices an order was allocated to a store 200km away when a closer DC had inventory. They open the order detail page, access the explainability panel, and see the cost breakdown: the DC had higher handling costs that outweighed the distance advantage, and the constraint rule "prefer franchise stores for orders under R$500" applied. The decision is now understandable.

**Why this priority:** This is the core value of the MMR. Without readable per-order reasoning, explainability does not exist.

**Independent Test:** Place an order with a known allocation outcome. Open the explainability panel. Confirm: the selected seller is shown with its cost breakdown, at least one alternative is shown for comparison, whether async replaced synchronous is indicated, and the explanation is in plain language (no raw JSON or cost function notation).

**Acceptance Scenarios:**

1. **Given** an order was allocated with the solver active, **When** the merchant opens the explainability panel, **Then** they see: the selected seller, a plain-language summary of the primary reason for selection, and the total cost breakdown (shipping + handling per item).
2. **Given** the async solver replaced the synchronous allocation, **When** the merchant views the explainability panel, **Then** both the synchronous and async results are shown with the cost difference that justified the replacement.
3. **Given** the async solver did not replace the synchronous allocation, **When** the merchant views the panel, **Then** the panel shows the synchronous result, confirms the async evaluation ran, and explains why no replacement was made (e.g., "no lower-cost combination found within the original SLA").
4. **Given** constraint rules (MMR 011) are active and affected the allocation, **When** the merchant views the panel, **Then** the applied constraints are listed and explained in plain language alongside the cost factors.
5. **Given** the order was placed before this MMR was activated, **When** the merchant accesses the explainability panel for that order, **Then** the panel shows a "Explainability not available for this order" state — not an error.
6. **Given** the explainability panel is open, **When** the merchant views the evaluated alternatives, **Then** the top 5 evaluated seller combinations are shown with their costs, and the reason each was not selected is stated (e.g., "higher shipping cost," "constraint rule violation").

### User Story 2 — Merchant uses explainability to identify a pattern across multiple orders (Priority: P2)

After checking five orders individually, an Omnichannel Manager at C&A notices the same constraint rule is consistently eliminating a specific seller that would otherwise be the lowest-cost option. They return to the agent to reconsider the constraint.

**Acceptance Scenarios:**

1. **Given** the merchant views multiple order explainability panels, **When** a constraint rule appears as the reason for not selecting the lowest-cost option in multiple cases, **Then** the panel includes a link to the strategy configuration where that constraint rule can be reviewed.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST generate and store explainability data for every order allocated with the solver active, from the activation date of this MMR forward.
- **FR-002**: The system MUST surface an explainability panel accessible from the order detail page in VTEX Admin OMS and from the agent interface.
- **FR-003**: The explainability panel MUST include: the selected seller, a plain-language summary of the primary selection reason, and a cost breakdown (shipping cost + handling cost per line item) for the selected combination.
- **FR-004**: The explainability panel MUST show whether the async solver replaced the synchronous allocation, and the cost difference that justified the replacement if it did.
- **FR-005**: The explainability panel MUST show up to 5 evaluated seller combinations that were not selected, with their total costs and the reason each was rejected (cost differential, constraint violation, SLA deviation).
- **FR-006**: The explainability panel MUST list any constraint rules (MMR 011) that affected the allocation decision, described in plain language.
- **FR-007**: The explainability panel MUST display a "not available" state — not an error — for orders placed before this MMR was activated or where the solver did not run.
- **FR-008**: The system MUST retain explainability data for each order for the same duration as order history in VTEX Admin.
- **FR-009**: The explainability panel SHOULD include a direct link to the active strategy configuration for the merchant to review and adjust if the explanation reveals an unintended outcome.

---

## Assumptions

- The solver produces structured per-order evaluation data (evaluated combinations, selected combination, cost breakdown, constraint rule applications) as a byproduct of running; explainability reads this data rather than recomputing it.
- The async solver logs both the synchronous result and its own result per order; this data is already stored as part of the allocation event.
- Explainability data volume scales with order volume; data retention is bounded by the same policies as order history.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can open the explainability panel for any order placed after activation and understand the allocation decision without VTEX support.
- **SC-002**: 100% of orders allocated with the solver active have explainability data available within 5 minutes of the allocation completing.
- **SC-003**: At least 80% of merchants who access an explainability panel rate the plain-language explanation as "clear" in post-GA feedback surveys.
- **SC-004**: At least 1 GA merchant uses order-level explainability to identify a strategy issue and initiate a configuration adjustment within the first 60 days of activation.
- **SC-005**: 0 explainability panels show raw cost function notation, solver identifiers, or technical implementation details — plain language only.
