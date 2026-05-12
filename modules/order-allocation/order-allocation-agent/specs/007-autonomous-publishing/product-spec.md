# Product Spec — Autonomous Strategy Publishing

## Clarifications

- Q: Can the agent autonomously configure a strategy from scratch, or only adjust an existing one? → A: Adjustments to an existing strategy only. Autonomous configuration from scratch is not in scope.
- Q: What categories of change can the agent make autonomously? → A: Cost weight adjustments only. Changes to constraint rules (MMR 011), segment definitions (MMR 008), or strategy type require merchant approval.
- Q: Is a simulation required before every autonomous publication? → A: Yes. The same simulation gate applies — delivery time deviation must be 0. Autonomous publishing does not bypass any safety gate.
- Q: What happens if the autonomous simulation fails or shows deviation ≠ 0? → A: The autonomous action is cancelled. The current strategy remains active. The merchant is notified of the failed attempt and its reason.
- Q: Can the merchant roll back an autonomous publication? → A: Yes, immediately, via MMR 005 (Strategy Versioning). Every autonomous publication is a versioned event.
- Q: Is there a limit on how frequently the agent can publish autonomously? → A: Yes. Maximum one autonomous publication per 24-hour window per merchant account, to prevent oscillation.
- Q: Does the merchant receive a notification for every autonomous publication? → A: Yes. Every autonomous action generates an in-app notification, regardless of whether the merchant is active.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Agent autonomously adjusts and publishes a strategy when a guardrail is triggered (Priority: P1)

An Omnichannel Manager at C&A has configured autonomous publishing with a guardrail: "if cost deviation exceeds 5% for 3 consecutive days, adjust cost weights and republish." Three days of data meet the condition. The agent generates an adjusted configuration, runs a simulation, confirms deviation = 0, and publishes. The merchant receives an in-app notification and sees the new strategy version in their history.

**Why this priority:** This is the entire value of the MMR. Without a successful end-to-end autonomous action, the feature does not exist.

**Independent Test:** Configure guardrails with a threshold that can be reliably triggered in a test environment. Let the condition be met. Confirm: the agent runs a simulation autonomously, publishes only if simulation is valid, the event is logged in strategy history, and the merchant receives a notification. Confirm no autonomous action occurs if simulation shows deviation ≠ 0.

**Acceptance Scenarios:**

1. **Given** the merchant has configured guardrails with a specific threshold, **When** that threshold is met over the defined window, **Then** the agent generates an adjusted configuration and triggers a simulation automatically.
2. **Given** the autonomous simulation completes with deviation = 0 and valid KPIs, **When** the agent proceeds, **Then** the new strategy is published, logged in strategy history with the triggering condition noted, and the merchant is notified in-app.
3. **Given** the autonomous simulation shows delivery time deviation ≠ 0, **When** the agent evaluates the result, **Then** the autonomous action is cancelled, the current strategy remains active, and the merchant is notified with the reason for cancellation.
4. **Given** an autonomous publication has occurred within the last 24 hours, **When** a guardrail threshold is triggered again, **Then** the agent does not take autonomous action and notifies the merchant that manual review is required.
5. **Given** the merchant disables autonomous publishing, **When** a guardrail condition is met, **Then** no autonomous action occurs; the condition is surfaced as a proactive recommendation instead (if MMR 006 is active).
6. **Given** an autonomous publication has been made, **When** the merchant views strategy history (MMR 005), **Then** the autonomous publication is clearly labeled as such, with the triggering condition and simulation results.

### User Story 2 — Merchant reviews and adjusts guardrail configuration (Priority: P2)

An Omnichannel Manager at OBI reviews their autonomous publishing guardrails after noticing the agent published twice in one week. They narrow the cost deviation threshold and extend the trigger window to reduce frequency.

**Acceptance Scenarios:**

1. **Given** the merchant opens guardrail settings, **When** they adjust threshold values and trigger windows, **Then** subsequent autonomous evaluations use the updated values.
2. **Given** the merchant disables a specific guardrail, **When** the previously triggering condition occurs, **Then** no autonomous action is taken for that condition.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow merchants to define guardrails: which KPI to monitor, the threshold value, the rolling window, and the permitted category of autonomous change (cost weight adjustments only).
- **FR-002**: The system MUST trigger an autonomous configuration adjustment and simulation when a guardrail condition is met.
- **FR-003**: The system MUST apply the full simulation gate before any autonomous publication: delivery time deviation must be 0 and KPIs must be within acceptable bounds.
- **FR-004**: The system MUST cancel any autonomous action and notify the merchant if the simulation fails or shows deviation ≠ 0.
- **FR-005**: The system MUST limit autonomous publications to one per 24-hour window per merchant account.
- **FR-006**: The system MUST log every autonomous publication in strategy history (MMR 005) with the triggering condition, the configuration change made, and the simulation results.
- **FR-007**: The system MUST send an in-app notification for every autonomous publication and every cancelled autonomous action.
- **FR-008**: The system MUST allow merchants to disable autonomous publishing entirely at any time; disabling cancels any pending autonomous actions.
- **FR-009**: The system MUST restrict autonomous changes to cost weight adjustments only; constraint rules, segment definitions, and strategy type changes MUST always require merchant approval.
- **FR-010**: The system SHOULD surface cancelled autonomous actions as proactive recommendations (if MMR 006 is active), so the merchant can act manually on the same condition.

---

## Assumptions

- MMR 005 (Strategy Versioning) is active before this MMR ships — autonomous publications must be versioned and reversible.
- MMR 004 (Self-Serve Simulation) is active — autonomous publishing requires on-demand simulation without VTEX involvement.
- MMR 006 (Proactive Recommendations) is active — cancelled autonomous actions fall back to the recommendations flow rather than being silently discarded.
- Merchants who reach autonomous publishing have completed multiple manual configuration cycles and have an established trust baseline with the system.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 autonomous publications that bypass the simulation gate or put a strategy with delivery time deviation ≠ 0 live.
- **SC-002**: 0 autonomous publications exceed the 1-per-24-hour limit.
- **SC-003**: 100% of autonomous publications are visible in strategy history within 1 minute of the action completing.
- **SC-004**: Merchants using autonomous publishing show faster recovery from KPI regressions (measured as time from threshold breach to strategy correction) compared to merchants using manual reconfiguration only.
- **SC-005**: At least 1 merchant in post-GA has autonomous publishing active and running for 30+ consecutive days without a manual rollback event.
