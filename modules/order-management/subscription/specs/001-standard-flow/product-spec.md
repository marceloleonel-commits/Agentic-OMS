# Product Spec — Subscription Standard Flow

## Clarifications

**Q: What is the current subscription execution model and where does it fail?**
→ **A:** The Subscriptions system runs a scheduled worker that attempts to create a recurring order on the subscriber's `nextPurchaseDate`. If the attempt fails — due to payment decline, expired card, out-of-stock item, or any order creation error — the cycle is marked as failed with a generic error code. No retry is triggered automatically. No notification is sent to the subscriber. No structured error reason is available to CS agents. The subscription remains in a failed state until the next scheduled cycle date or until a CS agent manually intervenes.

**Q: Does the system currently distinguish between payment failures and order creation failures?**
→ **A:** No. The current error model returns a generic execution error regardless of root cause. The first capability of this spec is an actionable error classification layer that maps execution failures to structured codes: payment decline, expired card, insufficient funds, order creation failure (catalog/pricing error), and stock unavailability. This classification drives all downstream behavior (retry logic, notification content, admin display).

**Q: How does smart payment retry work — is it automatic or manual?**
→ **A:** Automatic. After an initial cycle failure classified as a payment error (decline, expired card, insufficient funds), the system schedules retries according to a per-merchant configurable retry policy: number of retries (e.g., 3) and interval between attempts (e.g., +1 day, +3 days, +7 days). Each retry generates a new execution attempt. If all retries are exhausted without success, the cycle is marked as permanently failed and a final notification is sent to the subscriber.

**Q: What happens when a subscriber has more than one payment method registered?**
→ **A:** Multi-card fallback is attempted before exhausting the retry schedule. If the primary card fails and a secondary payment method exists in the subscriber's profile (via the Profile System), the system attempts the secondary card on the next retry. Fallback order follows the preference registered by the subscriber in My Subscriptions. If neither card succeeds after the configured retry schedule, the cycle is marked as permanently failed.

**Q: Are retries configurable per subscription or per merchant account?**
→ **A:** Per merchant account (account-level policy), not per individual subscription or plan. A single retry configuration applies to all subscriptions in the account. Per-plan retry configuration is deferred to a future release.

**Q: What communication channels are used for subscriber notifications?**
→ **A:** Email and WhatsApp. Both channels are triggered on the same events: cycle failure (with structured error reason), retry attempt, retry exhausted. The notification includes a direct deep link to the relevant recovery action in My Subscriptions (update payment method or delivery address). Channel availability depends on the contact data registered in the subscriber's profile and on the merchant's notification configuration in VTEX Admin.

**Q: Does My Subscriptions currently show upcoming cycle information?**
→ **A:** No. The current My Subscriptions interface shows the next order date but does not display the items, quantities, or estimated total for the upcoming cycle. This spec adds an "upcoming cycle" card showing next execution date, item list with quantities, and estimated total — allowing subscribers to anticipate charges and make informed updates (swap items, update payment method) before the cycle executes.

**Q: What does "product swap" mean in the context of My Subscriptions?**
→ **A:** A subscriber can replace one item in their subscription with a different SKU within the same subscription, without canceling and recreating the subscription. The replacement must be a valid subscribable product. The swap takes effect from the next cycle. Quantity changes and adding new items to the subscription are handled through existing edit flows and are not changed by this spec.

**Q: Can a CS agent trigger a manual retry on behalf of a subscriber?**
→ **A:** Yes. The Admin UI exposes a "Retry now" action on any subscription cycle that is in a failed or retry-pending state. The agent can also reprocess a failed cycle after updating the subscriber's payment method or address. All manual actions are logged in the cycle history with the acting agent's identity.

**Q: Are subscription feed notifications new or an evolution of the existing webhook?**
→ **A:** Evolution. The existing feed/hook infrastructure (Orders Broadcast) is extended to include subscription lifecycle events: cycle success, cycle failure (with error code), retry triggered, retry exhausted, subscription paused, subscription reactivated, subscriber address/payment updated. Merchants consuming the existing feed receive new event types; the existing order-level events are unchanged.

**Q: Is the analytics dashboard real-time or batch?**
→ **A:** Near-real-time with a lag of up to 15 minutes. The dashboard reflects the current state of subscription executions without requiring a full data warehouse pipeline. Aggregation is performed at the account level and is filterable by plan (when plans are configured), frequency, and time period (last 7 days, 30 days, custom range).

---

## User Scenarios & Testing (mandatory)

### User Story 1 — Failed cycle triggers automatic retry and subscriber notification (Priority: P1)

A subscriber's monthly cycle fails due to a card decline. The system classifies the failure as a payment error, schedules a retry for the following day per the merchant's retry policy, and immediately sends the subscriber a WhatsApp message explaining the failure reason and linking to My Subscriptions to update their payment method. The subscriber updates their card. The scheduled retry succeeds the next day. The merchant sees the full retry history in the Admin UI.

**Why this priority:** Payment retry and subscriber notification are the core mechanics that prevent cycle failure from becoming subscriber churn. Without them, every payment failure is a permanent revenue loss and a CS escalation. All other capabilities in this spec extend or depend on this baseline.

**Independent Test:** Configure a subscription with a card that will decline. Trigger a cycle execution. Confirm: (1) the failure is classified with a structured error code (not generic); (2) a retry is scheduled per the account retry policy; (3) a WhatsApp or email notification is sent with the correct error reason and a recovery link; (4) updating the payment method and waiting for the retry results in a successful cycle; (5) the cycle history in Admin shows both the failed attempt and the successful retry with timestamps.

**Acceptance Scenarios:**

- Given a subscription cycle fails due to payment decline, When the system processes the failure, Then it classifies the error as `PAYMENT_DECLINED` (not a generic execution error) and schedules the next retry according to the merchant's retry policy.
- Given the retry policy is configured as 3 retries at +1, +3, and +7 days, When a cycle fails on day 0, Then retries are scheduled for day +1, day +3, and day +7 — not for the next regular cycle date.
- Given a cycle failure is classified as a payment error, When the system triggers the failure notification, Then the subscriber receives a message via email or WhatsApp within 30 minutes of the failure, containing the human-readable error reason and a direct link to update their payment method in My Subscriptions.
- Given the subscriber has a secondary payment method registered, When the primary card fails, Then the system attempts the secondary card on the next retry before moving to subsequent retries on the primary.
- Given all retries are exhausted without success, When the final retry fails, Then the cycle is marked as `PERMANENTLY_FAILED`, a final notification is sent to the subscriber, and no further automatic retries are scheduled until the subscriber or a CS agent takes action.
- Given a cycle succeeds on a retry attempt, When the success is recorded, Then the subscription's `nextPurchaseDate` advances normally (next regular cycle date), not from the retry date.

---

### User Story 2 — Subscriber views upcoming cycle and swaps a product (Priority: P1)

A subscriber opens My Subscriptions and sees their upcoming cycle: execution date in 5 days, 2 items with quantities and an estimated total. They notice one of the items is out of stock on the merchant's site. They use the product swap feature to replace it with a similar product. They confirm, and the subscription is updated. The next cycle executes with the new item.

**Why this priority:** Upcoming cycle visibility and self-service product management are the primary tools that prevent churn from operational friction. Without visibility, subscribers cancel subscriptions to avoid unwanted charges. Without product swap, a single unavailable item forces a cancellation.

**Independent Test:** Open My Subscriptions for an active subscription with a future cycle date. Confirm: (1) the upcoming cycle card shows the next execution date, all items with quantities, and an estimated total; (2) the product swap flow allows selecting a replacement SKU; (3) after swap, the subscription shows the new item; (4) the next cycle order is created with the replacement item; (5) the swap is logged in the subscription's change history.

**Acceptance Scenarios:**

- Given an active subscription with a future `nextPurchaseDate`, When the subscriber opens My Subscriptions, Then an upcoming cycle card displays: execution date, list of items with their quantities, and the estimated total based on current prices.
- Given the estimated total is shown, When prices change between display and execution, Then the actual cycle order reflects current prices at execution time — the estimated total is advisory, not a price lock.
- Given the subscriber initiates a product swap, When they select a replacement SKU, Then the system validates that the replacement is a subscribable product available in the catalog before confirming the swap.
- Given the swap is confirmed, When the next cycle executes, Then the order contains the replacement item at the replacement item's price — the original item does not appear.
- Given a swap is performed, When the subscriber views their subscription change history, Then the swap is logged with the original SKU, replacement SKU, and timestamp.
- Given the subscriber is on a free-trial plan, When they attempt a product swap, Then the action is blocked (free-trial restrictions apply per FR-014 of the Free Trial spec).

---

### User Story 3 — CS agent views cycle history and triggers a manual retry (Priority: P1)

A subscriber contacts support reporting that their subscription order did not arrive. A CS agent opens the subscription in VTEX Admin, views the full cycle history showing two failed attempts with `PAYMENT_DECLINED` error codes, and sees that retries are exhausted. The agent confirms the subscriber's card has been updated and triggers a manual retry. The order is created successfully. The agent sees the successful execution with a timestamp and their own action logged.

**Why this priority:** CS-assisted resolution is the fallback for cases where self-service fails. Without it, every exhausted retry becomes a support ticket with no resolution path short of subscription cancellation and recreation.

**Independent Test:** Open a subscription in Admin with at least one failed execution. Confirm: (1) the cycle history shows each execution attempt with date, result, error code, and retry count; (2) "Retry now" is available for failed/retry-exhausted cycles; (3) triggering a manual retry creates a new execution attempt; (4) the acting agent's identity is recorded in the cycle log; (5) if the retry succeeds, the next cycle date advances normally.

**Acceptance Scenarios:**

- Given a subscription has one or more failed execution attempts, When a CS agent opens the subscription in Admin, Then the cycle history shows each attempt with: execution date, result (success/failure), structured error code, retry count, and initiator (system or agent identity).
- Given a cycle is in `PERMANENTLY_FAILED` or `RETRY_PENDING` state, When the CS agent views the subscription, Then a "Retry now" action is available.
- Given the CS agent triggers a manual retry, When the retry is processed, Then the execution attempt is logged with the agent's identity (not "system") and the result is updated in the cycle history.
- Given the CS agent updates the subscriber's payment method or address on their behalf via Admin, When the update is saved, Then the change is reflected immediately for the next retry or cycle execution.
- Given a CS agent action is logged, When any user views the subscription history, Then the log entry is attributed to the CS agent's identity, not to the subscriber.

---

### User Story 4 — Store operator reviews subscription analytics dashboard (Priority: P2)

A subscription manager opens the analytics dashboard in VTEX Admin and filters by the last 30 days. They see the overall cycle success rate (68%), a breakdown by error type (payment decline 23%, order error 9%), and the retry conversion rate (41% of retried cycles succeed). They identify that expired cards are the top payment failure reason and decide to add a pre-cycle notification reminding subscribers to update their card before execution.

**Why this priority:** Without aggregate visibility, merchants cannot identify systemic problems or measure the impact of changes. Dashboard data enables data-driven decisions about retry policies, notification strategy, and subscriber communication.

**Independent Test:** With at least 30 days of subscription execution data, open the analytics dashboard. Confirm: (1) cycle success rate is displayed as a percentage; (2) failure breakdown by error type is shown; (3) retry conversion rate is shown; (4) all metrics are filterable by time period (7 days, 30 days, custom range); (5) data reflects executions within a 15-minute lag.

**Acceptance Scenarios:**

- Given the merchant has active subscriptions with cycle execution history, When the analytics dashboard is opened, Then it displays: total cycles attempted, cycle success rate (%), failure breakdown by error code (payment decline, insufficient funds, expired card, order error, stock unavailability), retry conversion rate (%), active/paused/canceled subscriber counts.
- Given the merchant selects a time period filter, When the filter is applied, Then all displayed metrics update to reflect only executions within that period.
- Given data is updated in near-real-time, When a cycle executes (success or failure), Then the dashboard reflects the new execution within 15 minutes.
- Given the merchant has plans configured, When the dashboard is filtered by plan, Then metrics reflect only subscriptions associated with that plan.

---

## Requirements (mandatory)

### Functional Requirements

**FR-001:** The system MUST classify every subscription execution failure into one of the following structured error codes: `PAYMENT_DECLINED`, `CARD_EXPIRED`, `INSUFFICIENT_FUNDS`, `ORDER_CREATION_FAILED`, `ITEM_UNAVAILABLE`. Generic unclassified error codes MUST NOT be returned for failures that match a known classification.

**FR-002:** The system MUST support a configurable per-account retry policy with the following parameters: `maxRetries` (integer, minimum 0, maximum 10) and `retryIntervalDays` (array of integers, length equal to `maxRetries`, each representing the number of days after the previous attempt).

**FR-003:** After a cycle failure classified as a payment error (`PAYMENT_DECLINED`, `CARD_EXPIRED`, `INSUFFICIENT_FUNDS`), the system MUST automatically schedule the next retry according to the account's retry policy without any manual intervention.

**FR-004:** The system MUST attempt multi-card fallback on the first retry if: (a) the failure is a payment error, and (b) the subscriber has a secondary payment method registered in their profile. The secondary card MUST be attempted before the next retry interval for the primary card.

**FR-005:** When all retries are exhausted without success, the system MUST mark the cycle as `PERMANENTLY_FAILED` and MUST NOT schedule any further automatic retries until the subscriber or a CS agent triggers a new execution.

**FR-006:** The `nextPurchaseDate` of a subscription MUST advance to the next regular cycle date upon a successful retry — not from the retry date. The retry mechanism MUST NOT alter the subscription's recurrence schedule.

**FR-007:** The system MUST send a subscriber notification on the following events: cycle failure (first occurrence), retry exhausted. Each notification MUST include: the structured error reason in human-readable language, the next retry date (if applicable), and a direct deep-link to the relevant recovery action in My Subscriptions.

**FR-008:** Notifications MUST be delivered via email and WhatsApp. Delivery to each channel is conditional on: (a) the subscriber having a valid contact registered in their profile for that channel, and (b) the merchant having that notification channel enabled.

**FR-009:** The My Subscriptions interface MUST display an upcoming cycle card for every active subscription, containing: next execution date, list of items with quantities, and estimated total based on current prices at the time of display.

**FR-010:** The estimated total displayed in the upcoming cycle card MUST be advisory only — the actual order price is calculated at execution time. The UI MUST communicate this to the subscriber.

**FR-011:** The system MUST allow a subscriber to perform a product swap: replace one item in their subscription with a different subscribable SKU. The swap MUST be validated against current catalog availability before confirmation.

**FR-012:** A product swap MUST take effect from the next cycle only. The current in-progress cycle (if any) MUST NOT be affected by a swap.

**FR-013:** Product swap MUST be blocked for subscriptions associated with a free-trial plan, consistent with free-trial edit restrictions (FR-014 of the Free Trial spec).

**FR-014:** The Admin UI MUST display a full cycle execution history for each subscription, showing per attempt: execution date, result (success/failure), structured error code (if failure), retry count, and initiator identity (system or CS agent name/ID).

**FR-015:** The Admin UI MUST expose a "Retry now" action on subscriptions in `PERMANENTLY_FAILED` or `RETRY_PENDING` state. The action MUST create a new immediate execution attempt.

**FR-016:** All CS agent actions (manual retry, payment method update, address update on behalf of subscriber) MUST be logged in the subscription's cycle history with the agent's identity and timestamp.

**FR-017:** The system MUST emit structured feed/webhook events for the following subscription lifecycle events: `CYCLE_SUCCESS`, `CYCLE_FAILED` (with error code), `RETRY_SCHEDULED`, `RETRY_EXHAUSTED`, `SUBSCRIPTION_PAUSED`, `SUBSCRIPTION_REACTIVATED`, `SUBSCRIBER_PAYMENT_UPDATED`, `SUBSCRIBER_ADDRESS_UPDATED`. These events MUST be available through the existing Orders Broadcast (feed/hook) infrastructure.

**FR-018:** The Admin analytics dashboard MUST display the following metrics, calculated per merchant account: total cycles attempted, cycle success rate (%), failure count and rate by error code, retry conversion rate (retries that eventually succeed / total retried cycles), active subscriber count, paused subscriber count, canceled subscriber count.

**FR-019:** All analytics dashboard metrics MUST be filterable by time period (preset: last 7 days, last 30 days; custom: date range picker) and, when plans are configured in the account, by plan.

**FR-020:** Dashboard metrics MUST reflect execution data with a maximum lag of 15 minutes from the time of the event.

**FR-021:** The product swap feature MUST log the original SKU, replacement SKU, subscriber identity, and timestamp in the subscription's change history, accessible to both the subscriber in My Subscriptions and the CS agent in Admin.

---

## Assumptions

- **Retry policy is account-level for MVP:** Per-plan and per-subscription retry configuration is deferred to a future release. All subscriptions in an account share the same retry policy.
- **Profile System integration for multi-card fallback:** The secondary payment method is stored in the subscriber's profile via the existing Profile System. The Subscriptions system reads available payment accounts from the Profile System at retry time.
- **WhatsApp notification channel:** WhatsApp delivery depends on the merchant having the WhatsApp notification integration active in their VTEX account. If not configured, only email is used as fallback.
- **Orders Broadcast as feed infrastructure:** New subscription lifecycle events are emitted through the existing Orders Broadcast (feed/hook) service. No new event delivery infrastructure is introduced.
- **Estimated total is advisory:** Price locks between cycle display and execution are not supported. Prices are calculated fresh at order creation time, consistent with current subscription behavior.
- **Team ownership:** All Subscriptions system changes (retry engine, error classification, event feed, analytics) are owned by the OMS team. My Subscriptions UI changes are owned by the OMS frontend team. Admin UI changes (cycle history, retry action) are owned by the OMS team in coordination with the Admin platform team.
- **Backward compatibility:** Existing subscriptions without retry policy configuration default to `maxRetries = 0` (no automatic retries), preserving current behavior. Merchants must opt in to retries by configuring a policy.
- **No financial reconciliation for retries:** Retries generate new order attempts through the standard Checkout/Gateway flow. Each attempt that results in a charge is an independent financial transaction. No partial charge recovery or credit note logic is introduced.
- **Analytics dashboard is not a data warehouse:** The dashboard surfaces operational metrics from the Subscriptions execution engine directly. Integration with VTEX Analytics, BI tools, or external data pipelines is out of scope for this release.

---

## Success Criteria (mandatory)

### Measurable Outcomes

**SC-001:** A subscriber whose cycle fails due to a payment error can receive a notification, update their payment method in My Subscriptions, and have their subscription resume without contacting VTEX or merchant support.

**SC-002:** At least 1 merchant is live in Closed Beta with an active retry policy and measurable retry conversion (at least 1 cycle recovered via automatic retry) by end of 2026-Q2.

**SC-003:** Cycle success rate for Closed Beta merchants improves by at least 10 percentage points vs. baseline (pre-feature) within 60 days of enabling the retry engine, measured against the same merchant's historical data.

**SC-004:** 0 retry attempts result in a `nextPurchaseDate` shift — all successful retries advance the subscription's next cycle to the correct regular recurrence date.

**SC-005:** 100% of cycle failures for Closed Beta merchants are classified with a structured error code (no unclassified generic failures) within 30 days of feature activation.

**SC-006:** CS agents can view the full cycle history and trigger a manual retry for any failed subscription without requiring VTEX engineering intervention or direct database access.
