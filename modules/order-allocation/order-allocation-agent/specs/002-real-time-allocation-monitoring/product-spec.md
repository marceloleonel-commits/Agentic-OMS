# Product Spec — Real-Time Allocation Monitoring

## Clarifications

- Q: Is monitoring scoped to the active strategy only, or should historical (inactive) strategies also be visible? → A: Active strategy only in Open Beta. Historical strategy comparison is deferred.
- Q: Should the monitoring dashboard update in real time (streaming) or on a polling interval? → A: Polling interval is acceptable for Open Beta; streaming is deferred.
- Q: What is the minimum refresh interval for the dashboard? → A: Every 5 minutes is acceptable for Open Beta.
- Q: Should delivery time deviation = 0 trigger a blocking banner or a non-blocking warning? → A: Non-blocking warning with a clear call to action to revisit the strategy configuration.
- Q: Who can view the monitoring dashboard — all VTEX Admin users or only specific roles? → A: Same role access as the Order Allocation Agent configuration flow.
- Q: Should the dashboard be accessible if no strategy has ever been published? → A: No. The monitoring view is only shown when an active strategy exists.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View live performance of an active allocation strategy (Priority: P1)

An Omnichannel Manager opens the Order Allocation Agent and navigates to the monitoring dashboard for the active strategy. They see all mandatory KPIs computed on orders placed since the strategy went live, compared to the synchronous baseline. They can change the time range to inspect a specific period. If delivery time deviation exceeds 0, a warning is shown prompting them to review the strategy.

**Why this priority:** This is the core value of the monitoring MMR. Without this view, merchants have no feedback loop after publication. All other monitoring capabilities depend on this baseline view existing.

**Independent Test:** Publish a strategy, place test orders, open the monitoring dashboard. Confirm: all mandatory KPIs are displayed with values computed on live orders, the baseline comparison is shown, and changing the time range updates the values. Delivers value even if no alerts or drill-down features exist.

**Acceptance Scenarios:**

1. **Given** a strategy is active, **When** the merchant opens the monitoring dashboard, **Then** all mandatory KPIs are displayed: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders with seller change, and time elapsed to reallocate.
2. **Given** the monitoring dashboard is open, **When** the merchant selects a different time range, **Then** all KPI values update to reflect only orders placed within that range.
3. **Given** delivery time deviation for the active period is > 0, **When** the merchant views the dashboard, **Then** a warning indicator is displayed alongside the deviation metric, with a clear call to action to revisit the strategy.
4. **Given** no strategy has ever been published, **When** the merchant navigates to the monitoring section, **Then** the system shows an empty state directing them to configure and publish a strategy first.
5. **Given** the active strategy has been live for less than the selected time range, **When** the merchant views the dashboard, **Then** the system clearly indicates the effective data start date (strategy publication timestamp).

### User Story 2 — Navigate from monitoring to strategy reconfiguration (Priority: P2)

After reviewing the monitoring dashboard, an Omnichannel Manager decides the current strategy is not meeting cost targets. From the dashboard, they initiate a new configuration cycle without navigating away from the Order Allocation Agent.

**Why this priority:** This closes the feedback loop and makes the agent a continuous improvement tool rather than a one-time setup. It depends on User Story 1 and delivers no value if the merchant cannot first see that performance is unsatisfactory.

**Independent Test:** Open the monitoring dashboard for an active strategy. Click the reconfigure entry point. Confirm the natural language input field is accessible and a new configuration cycle can begin. Value is conditional on User Story 1 existing.

**Acceptance Scenarios:**

1. **Given** the merchant is viewing the monitoring dashboard, **When** they choose to reconfigure, **Then** the system opens the configuration flow pre-filled with the current strategy's parameters as a starting point.
2. **Given** the merchant starts a new configuration cycle from monitoring, **When** they publish a new strategy, **Then** the monitoring dashboard resets to track performance from the new publication timestamp.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a monitoring dashboard for the active allocation strategy, accessible from the Order Allocation Agent in VTEX Admin.
- **FR-002**: The system MUST show all mandatory KPIs on the dashboard: total cost-to-serve per order, shipping cost per order, cost deviation from optimal (absolute and %), average split rate, delivery time deviation, % of orders with seller change, and time elapsed to reallocate.
- **FR-003**: The system MUST display each KPI alongside its corresponding value from the synchronous baseline for the same period.
- **FR-004**: The system MUST support a time-range selector with at minimum the following options: last 7 days, last 30 days, and custom date range.
- **FR-005**: The system MUST refresh KPI values at intervals no greater than 5 minutes.
- **FR-006**: The system MUST display a non-blocking warning when delivery time deviation is > 0 for the selected period, with a call to action to revisit strategy configuration.
- **FR-007**: The system MUST display the strategy publication timestamp as the effective data start date when the selected time range predates the strategy going live.
- **FR-008**: The system MUST show an empty state — not an error — when no strategy has been published.
- **FR-009**: The system MUST provide an entry point from the monitoring dashboard to initiate a new configuration cycle.
- **FR-010**: The system SHOULD pre-fill the configuration flow with the current strategy parameters when reconfiguration is initiated from monitoring.

---

## Assumptions

- The Cost Minimization Solver and the Asynchronous Order Allocation infrastructure are operational and producing reallocation data per order.
- The synchronous baseline data is available per merchant account for the same time periods used in monitoring.
- The monitoring dashboard consumes the same KPI data generated during simulation; no additional data pipeline is required beyond what MMR 001 established.
- Role-based access control for the Order Allocation Agent is defined and enforced at the platform level — this spec does not introduce new roles.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant with an active strategy can open the monitoring dashboard and see all mandatory KPIs computed on live orders without VTEX support intervention.
- **SC-002**: KPI values on the dashboard reflect orders placed within the last 5 minutes within a 5-minute window of accuracy.
- **SC-003**: 0 monitoring dashboards show a blank screen or uncaught error when a strategy is active and data is available.
- **SC-004**: At least 1 merchant in Open Beta uses the monitoring dashboard to initiate a strategy reconfiguration cycle within 30 days of publishing their first strategy.
- **SC-005**: 100% of active strategies with delivery time deviation > 0 surface a warning on the monitoring dashboard within the next refresh cycle.
