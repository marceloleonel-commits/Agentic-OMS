# Product Spec — Reallocation Rules

## Clarifications

- Q: What is the difference between manual and automatic reallocation? → A: Manual reallocation is initiated by the merchant for a specific order — they request it, the agent proposes a replacement, and the merchant approves. Automatic reallocation is triggered by a rule the merchant configured — when the trigger condition is met and the guards and thresholds pass, the system reallocates without requiring the merchant to act on each individual order.
- Q: Can automatic reallocation happen without any merchant review? → A: Yes, if the merchant explicitly configures it that way. The default for automatic reallocation is to require review (Awaiting Your Review). The merchant can opt specific rules into full automation, in which case the system reallocates and notifies — but does not wait for approval.
- Q: Are there reallocation scenarios that always require merchant review, regardless of rules? → A: Yes. Orders above a configurable value threshold always require review. The merchant can set this threshold. Orders in edge cases not covered by any rule also default to requiring review.
- Q: Can a reallocation rule override a delivery promise? → A: No. The same SLA constraint applies: any proposed reallocation that would change the delivery time is invalid. The system never re-promises a new SLA.
- Q: Can rules be scoped to specific order types or segments? → A: Yes. Rules can be scoped by order value, delivery type (express vs. standard), seller type, or any attribute the agent can interpret from natural language.
- Q: What happens if no replacement seller is found when an automatic rule triggers? → A: The system notifies the merchant and leaves the order in its current state. It does not force a reallocation with an inferior option.
- Q: Are reallocation rules versioned alongside allocation strategy rules? → A: Yes. Reallocation rules are stored as part of the active strategy version (if MMR 005 is active).
- Q: Can the merchant define a rule that blocks reallocation entirely for certain order types? → A: Yes. "Never reallocate orders from B2B customers" is a valid hard rule that the agent interprets and enforces.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant triggers a manual reallocation for a specific order (Priority: P1)

An Omnichannel Manager at OBI sees an order where the assigned seller has high delay rates this week. They open the order in VTEX Admin, request a manual reallocation through the agent. The agent proposes the best available alternative within the original SLA. The merchant reviews the proposal — new seller, cost comparison, delivery time — and approves. The order is reassigned.

**Why this priority:** Manual reallocation is the baseline capability: it requires no upfront configuration, is fully within the merchant's control, and handles edge cases that no automatic rule can anticipate. It is also the first time merchants have a system-level tool for post-creation reassignment.

**Independent Test:** Open a specific order in pre-fulfillment state. Request manual reallocation. Confirm: the agent proposes a replacement within the original SLA, the review panel shows current seller vs. proposed seller with cost and delivery comparison, approving reassigns the order, and delivery time does not change.

**Acceptance Scenarios:**

1. **Given** an order is in a pre-fulfillment state, **When** the merchant requests manual reallocation from the order detail page, **Then** the agent evaluates available sellers and proposes the best replacement within the original SLA.
2. **Given** the agent proposes a replacement, **When** the merchant reviews the proposal, **Then** they see: current seller, proposed replacement, cost difference, and delivery time (which must match the original SLA).
3. **Given** the merchant approves the proposal, **When** reallocation is confirmed, **Then** the order is reassigned to the new seller and the state transitions to Allocated (per MMR 002).
4. **Given** no replacement seller is available within the original SLA, **When** the agent concludes its evaluation, **Then** it informs the merchant that no valid replacement was found and the order remains with the current seller.
5. **Given** an order is already in fulfillment (picked, packed, or shipped), **When** the merchant attempts manual reallocation, **Then** the system blocks the request and explains that reallocation is no longer possible at this fulfillment stage.

### User Story 2 — Merchant configures automatic reallocation when a seller cancels (Priority: P1)

An Omnichannel Manager at C&A types in the agent: "When a seller cancels, automatically reallocate to the cheapest available seller within the original SLA. If no seller is cheaper, wait for my review." The agent interprets this as an automatic rule with a trigger (seller cancellation), a threshold (cheapest available), and a fallback (require review if threshold not met). The configuration is saved and active from the next order.

**Why this priority:** Seller cancellations are frequent and time-sensitive. Automatic reallocation on cancellation is the highest-value rule for most merchants — it turns a manual, slow response into a same-minute resolution.

**Independent Test:** Configure an automatic reallocation rule via natural language. Trigger a seller cancellation on a test order. Confirm: the rule fires, the system evaluates and reallocates automatically (or goes to review if threshold not met), and the merchant receives a notification of the outcome without having to act.

**Acceptance Scenarios:**

1. **Given** the merchant types a reallocation rule in natural language, **When** the agent processes it, **Then** it identifies the trigger, guards (if any), threshold, and review requirement, and presents a plain-language summary for merchant review.
2. **Given** the rule is saved, **When** the trigger condition is met on a live order, **Then** the system evaluates a replacement according to the rule's constraints.
3. **Given** the evaluation finds a replacement that meets the threshold, **When** the rule has no review requirement, **Then** the order is reallocated automatically and the merchant is notified of the outcome.
4. **Given** the evaluation finds a replacement that does not meet the threshold, **When** the fallback is "require review," **Then** the order transitions to Awaiting Your Review and the merchant is notified.
5. **Given** the rule has a guard ("never reallocate orders above R$2,000"), **When** the trigger fires on an order above R$2,000, **Then** the guard prevents automatic reallocation and the order goes to review regardless of the threshold.

### User Story 3 — Merchant configures a guard that prevents reallocation on late-stage orders (Priority: P2)

An Omnichannel Manager at OBI types: "Never reallocate an order that has been confirmed for more than 2 hours." The agent interprets this as a time-based guard and adds it to the active rule set.

**Acceptance Scenarios:**

1. **Given** the merchant defines a time-based guard, **When** the agent interprets it, **Then** it identifies the guard condition and the direction (block reallocation after N hours) and presents it for review.
2. **Given** a reallocation is triggered on an order that has been confirmed for longer than the guard threshold, **When** the system evaluates eligibility, **Then** the guard prevents reallocation and the merchant is notified that the guard was the reason.

### User Story 4 — Merchant blocks automatic reallocation for a specific order type (Priority: P2)

An Omnichannel Manager at C&A types: "Never automatically reallocate B2B orders. Always require my review." The agent interprets this as a hard guard scoped to order type.

**Acceptance Scenarios:**

1. **Given** a hard guard blocks automatic reallocation for a specific order type, **When** a reallocation trigger fires on a matching order, **Then** the system always sends it to Awaiting Your Review — even if another rule would allow automation.
2. **Given** conflicting rules exist (one allows automation, one blocks it for the order type), **When** the agent detects the conflict, **Then** it surfaces the conflict during configuration and the stricter rule (requiring review) takes precedence by default.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow merchants to request manual reallocation for any order in a pre-fulfillment state from the order detail page in VTEX Admin.
- **FR-002**: Manual reallocation MUST propose the best available replacement within the original SLA and present it to the merchant for review before reassigning.
- **FR-003**: The system MUST block manual reallocation for orders in fulfillment (picked, packed, or shipped) and explain why.
- **FR-004**: The system MUST accept reallocation rule descriptions in natural language via the Order Allocation Agent, interpreting triggers, guards, thresholds, and review requirements.
- **FR-005**: The system MUST support the following rule components:
  - **Triggers**: conditions that start a reallocation evaluation (seller cancellation, stockout, seller performance threshold breach).
  - **Guards**: conditions that block reallocation (time since confirmation, order value, order type, fulfillment state).
  - **Thresholds**: minimum improvement required for automatic action (cost %, specific seller, SLA).
  - **Review requirement**: per rule, whether a valid reallocation requires merchant review or can be applied automatically with notification only.
- **FR-006**: The system MUST require merchant review (Awaiting Your Review state) by default for all automatic reallocations unless the merchant explicitly opts a rule into full automation.
- **FR-007**: The system MUST apply a configurable order value guard above which review is always required, regardless of other rules.
- **FR-008**: The system MUST NOT reallocate any order if the proposed replacement has delivery time deviation ≠ 0.
- **FR-009**: The system MUST notify the merchant of the outcome of every automatic reallocation — whether it succeeded, went to review, or found no valid replacement.
- **FR-010**: The system MUST detect and surface conflicts between reallocation rules (e.g., one rule allows automation, another blocks it for the same order type) and apply the more restrictive rule by default.
- **FR-011**: Reallocation rules MUST be stored as part of the active strategy version alongside cost weights and constraint rules (requires MMR 005).

---

## Assumptions

- The Asynchronous Order Allocation infrastructure (MMR 001) is operational and supports reallocation as a trigger path — reallocation rules configure and control this capability, not replace it.
- Order fulfillment state (not yet picked / being picked / packed / shipped) is available and reliable at the time of reallocation evaluation.
- Seller performance metrics (on-time rate, cancellation rate) required for performance-based triggers are available per merchant account.
- Reallocation rules are evaluated against the same seller eligibility and SLA data used for initial allocation.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can request manual reallocation for a specific order and have it reassigned without VTEX support intervention.
- **SC-002**: A merchant can configure an automatic reallocation rule via natural language, have it correctly interpreted and saved, and confirm it fires correctly on a test trigger — without VTEX support.
- **SC-003**: 0 automatic reallocations that override a guard or produce a delivery time deviation ≠ 0.
- **SC-004**: Merchants who configure automatic reallocation rules for seller cancellation show faster mean time to reallocation compared to manual intervention.
- **SC-005**: 0 conflicting reallocation rules that are not detected and flagged during configuration.
