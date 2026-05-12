# Product Spec — Agent Core Configuration Flow

## Clarifications

- Q: Which cost dimensions are must-have for Closed Beta? → A: Shipping cost, handling cost, geographic proximity cost, delivery speed cost, and seller group / franchise group prioritization. All others (commissions, taxes, stockout risk, NPS proxy, round-robin, etc.) are nice-to-have deferred to later releases.
- Q: Can the merchant skip clarification questions and proceed with the interpretation as-is? → A: Yes, but unresolved ambiguities must be surfaced visibly in the interpretation summary before the merchant approves.
- Q: Can the merchant publish without running a simulation? → A: No. Simulation review is a hard prerequisite for publication in Closed Beta.
- Q: Can the agent publish autonomously without merchant confirmation? → A: No. Every publication requires explicit merchant approval in Closed Beta. Autonomous publication is deferred to a later phase.
- Q: Who runs the simulation — the merchant or VTEX? → A: VTEX runs simulations and delivers results. Self-serve simulation is a future capability.
- Q: Must delivery time deviation between synchronous and asynchronous solver results be exactly 0? → A: Yes. Any deviation flags the strategy as ineligible for publication.
- Q: Does publishing affect in-flight orders? → A: No. Only orders placed after publication are processed under the new strategy.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Configure, simulate, and publish an allocation strategy (Priority: P1)

An Omnichannel Manager opens the Order Allocation Agent in VTEX Admin and types a free-form allocation goal (e.g. "minimize shipping and handling cost without harming delivery speed"). The agent interprets the intent, asks clarifying questions when needed, and presents a human-readable summary of the proposed cost weights. The merchant approves the interpretation, reviews a simulation report on historical orders confirming expected cost savings and zero SLA impact, then explicitly publishes the strategy to production. The strategy is applied to all new orders from that moment.

**Why this priority:** This is the core value of the entire feature. It is also the first time merchants can ever directly influence allocation logic at VTEX. Without this MMR, no other capability (monitoring, presets) has a strategy to act on.

**Independent Test:** Complete the full flow — type a goal, receive an interpretation, simulate on a historical period, publish. Confirm: the strategy is active, at least one KPI shows cost improvement vs. baseline, and delivery time deviation is 0. No VTEX support required.

**Acceptance Scenarios:**

1. **Given** the merchant types a free-form allocation goal, **When** the agent processes it, **Then** it returns a human-readable summary listing the cost dimensions used and their relative weights.
2. **Given** the merchant's intent is ambiguous, **When** the agent detects it, **Then** it asks at least one targeted clarification question; unresolved ambiguities are visible in the summary if skipped.
3. **Given** the merchant approves the interpretation, **When** simulation runs, **Then** the report includes all mandatory KPIs: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders with seller change, and time elapsed to reallocate.
4. **Given** the simulation report shows delivery time deviation ≠ 0, **When** the merchant attempts to publish, **Then** the system blocks publication and flags the strategy as ineligible until the root cause is resolved.
5. **Given** simulation has been reviewed and results are valid, **When** the merchant initiates publication, **Then** the system requires a deliberate confirmation step — not a single-click action.
6. **Given** the merchant confirms publication, **When** the strategy goes live, **Then** it is applied automatically to all new orders and the merchant receives a confirmation with a timestamp.
7. **Given** the strategy is published, **When** the merchant views it in VTEX Admin, **Then** the status is clearly shown as active.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a free-form text input for merchants to describe allocation goals in natural language.
- **FR-002**: The system MUST translate natural language input into weighted cost dimensions and present a human-readable interpretation for review.
- **FR-003**: The system MUST detect ambiguous or conflicting intent and ask targeted clarification questions before finalizing the interpretation.
- **FR-004**: The system MUST surface unresolved ambiguities in the interpretation summary when clarification questions are skipped.
- **FR-005**: The system MUST support at minimum these cost dimensions: shipping cost, handling cost, geographic proximity cost, delivery speed cost, and seller group / franchise group prioritization.
- **FR-006**: The system MUST accept costs from existing VTEX configurations and/or values entered directly through the agent interface, normalizing all inputs to a consistent scale.
- **FR-007**: The system MUST simulate the strategy on a merchant-selected historical period and return all mandatory KPIs.
- **FR-008**: The system MUST flag any strategy with delivery time deviation ≠ 0 as ineligible for publication.
- **FR-009**: The system MUST block publication if no simulation has been reviewed.
- **FR-010**: The system MUST require explicit merchant confirmation before publishing any strategy to production.
- **FR-011**: The system MUST apply the published strategy only to orders placed after publication — never retroactively.
- **FR-012**: The system MUST confirm strategy activation to the merchant with a timestamp.

---

## Assumptions

- The Cost Minimization Solver is deployed and operational — the agent's output (cost weights) is consumed by the solver in production.
- Merchants have shipping tables and warehouse handling costs configured in VTEX before using the Agent.
- Historical order data is available per merchant account for simulation.
- During Closed Beta, VTEX operates simulations — merchants review results but do not run them independently.
- Only one strategy is active per merchant account during Closed Beta.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can describe a goal, receive an interpretation, review a simulation, and publish a strategy without VTEX support intervention.
- **SC-002**: At least 1 merchant is live in Closed Beta with an active published strategy by end of H1-2026.
- **SC-003**: 0 strategies are published without a prior simulation review during Closed Beta.
- **SC-004**: 0 strategies with delivery time deviation ≠ 0 reach production.
- **SC-005**: Active strategies achieve ~5% reduction in operational costs (shipping + handling) vs. the synchronous baseline, measured post-deployment.
