# Product Spec — Subscription Membership Free Trial

## Clarifications

**Q: Which implementation alternative was selected?**
→ **A:** Alternative 2 — *Creating Subscriptions from the First Checkout Order*. Alternative 1 (headless API) was evaluated but deferred; Alt 2 covers the full end-to-end enrollment flow including checkout, card validation via Zero Auth, and promotions engine integration.

**Q: How does a zero-value order complete card validation if the Gateway's standard transaction route does not support zero-value transactions?**
→ **A:** Via the Zero Auth service in the Gateway — a dedicated route for card validation without financial movement, already implemented by most connectors (including Dollar General's). The UI sends card data to the Gateway before place order to receive a signed `accountId`; at place order, Checkout calls Zero Auth with that `accountId`. Only a `200 Authorized` response completes the order.

**Q: Can any store enable zero-value payment carts?**
→ **A:** No. The store must explicitly enable `AllowZeroValuePayment` in `orderFormConfig`. The flag applies only to carts composed exclusively of subscription items, restricting the blast radius of the change and preventing card-warming attacks.

**Q: Can a subscriber freely change their next order date or generate one-off orders during the free-trial period?**
→ **A:** No. Subscribers on a free-trial plan can only update address and payment method, and may cancel at any time. Changes to next order date, frequency, item quantity, and one-off order generation are blocked to prevent indefinite deferral of the first payment.

**Q: Do subscriber edit restrictions apply to store admins?**
→ **A:** No. Store admins retain full editing capability and are responsible for understanding the impact of any manual changes on the subscriber experience.

**Q: Can a shopper enroll in multiple simultaneous free-trial subscriptions for the same plan?**
→ **A:** Configurable per plan via `allowMultipleSubscriptionsInFreeTrial`. Options: `allow`, `blockWithinPlan` (one active subscription per plan), `blockAcrossAllFreeTrialPlans` (only one active free-trial subscription regardless of plan). Default is `allow`.

**Q: What happens at checkout when the plan blocks multiple subscriptions and the shopper already has one?**
→ **A:** The checkout order proceeds and is charged normally — the block cannot be enforced at the Checkout layer. The Subscriptions system silently skips subscription creation. This is a known architectural limitation.

**Q: Which promotions engine is in scope for the initial delivery?**
→ **A:** External promotions engine (merchant-owned). The internal Pricing & Promotions integration is out of scope for this release. The Subscriptions API must expose a subscriber status endpoint so external engines can query it.

**Q: Is automatic subscription cancellation on payment failure in scope?**
→ **A:** No. Automatic cancellation workflow, the worker for failed free-trial subscriptions, and subscription reactivation after automatic cancellation are all out of scope for this release.

**Q: Is a new subscription status value (e.g., "trialing") introduced?**
→ **A:** No new status field. Free-trial state is identified via plan attributes (`allowFreeTrial = true`) and the subscription execution state, queryable through existing APIs.

**Q: Are plan-level metrics and dashboards in scope?**
→ **A:** No. Metrics aggregation by plan and updated dashboards are explicitly deferred to a future delivery.

---

## User Scenarios & Testing (mandatory)

### User Story 1 — Enroll in a free-trial subscription at checkout (Priority: P1)

A shopper selects a product marked as subscribable under a plan with `allowFreeTrial = true`. At checkout, the external promotions engine identifies the shopper has no prior free-trial subscription and applies a 100% discount, resulting in a zero-value cart. The store has `AllowZeroValuePayment` enabled. The shopper provides card data; the Checkout UI sends it to the Gateway, which saves the token and returns a signed `accountId`. At place order, Checkout calls Zero Auth with the `accountId` and receives `200 Authorized`. The order completes, Checkout persists the `paymentAccount` in the Profile System, and the Subscriptions system creates the subscription. The first paid order date is: *subscription creation date + `daysInFreeTrial` + recurrence frequency*. In My Subscriptions, the shopper sees the subscription active with edit controls restricted to address, payment method, and cancel.

**Why this priority:** This is the core enrollment flow. Without it, the free-trial model cannot be tested or shipped. Every other story depends on a subscription existing.

**Independent Test:** Complete the full checkout flow with a zero-value cart on a store with `AllowZeroValuePayment` enabled. Confirm: (1) Zero Auth is called and returns `200 Authorized`; (2) `paymentAccount` is persisted in the Profile System; (3) subscription is created with `allowFreeTrial = true`; (4) `nextPurchaseDate` equals creation date + `daysInFreeTrial` + frequency; (5) no charge is applied.

**Acceptance Scenarios:**

- Given a shopper with no prior free-trial subscription checks out with a zero-value cart, When the external promotions engine queries the Subscriptions API, Then the API returns "eligible for free trial" and the engine applies a 100% discount.
- Given `AllowZeroValuePayment` is enabled and the cart contains only subscription items with total value 0, When the shopper proceeds to payment selection, Then Checkout accepts the payment method without returning a 500 division-by-zero error.
- Given the shopper submits card data before place order, When Checkout UI calls the Gateway via `POST /payment-data`, Then the Gateway saves the card token and returns a signed `accountId` and `encryption-signature`.
- Given the signed `accountId` is attached to the order form, When place order is called, Then Checkout invokes the Gateway's Zero Auth route (not `/api/pvt/transactions`) with the `accountId` and `encryption-signature`.
- Given Zero Auth returns `200 Authorized`, When the order is completed, Then Checkout persists the `paymentAccount` in the Profile System and the Subscriptions system creates the subscription with `allowFreeTrial = true`.
- Given the subscription is created, When the Subscriptions system calculates `nextPurchaseDate`, Then it equals: creation date + `daysInFreeTrial` days + recurrence frequency, applying `dayAfterFreeTrialBehaviour` if the result falls on day 29, 30, or 31 in a monthly frequency.
- Given the subscription is active in My Subscriptions, When the subscriber attempts to change next order date, frequency, item quantity, or generate a one-off order, Then the system blocks the action.
- Given the subscription is active, When the subscriber updates address, payment method, or cancels the subscription, Then the action succeeds.

---

### User Story 2 — Store operator configures a free-trial plan (Priority: P1)

A store operator opens Admin > Subscriptions > Plans and creates or edits a plan. They toggle "Aceita Free Trial" and enter the number of free days (`daysInFreeTrial`). They select `dayAfterFreeTrialBehaviour` for month-end edge cases and optionally restrict multiple concurrent enrollments per plan. The plan is saved. Subsequent checkout orders that reference this plan apply the free-trial logic automatically.

**Why this priority:** Without plan configuration in Admin, merchants cannot enable the feature. This is the entry point for the entire free-trial capability.

**Independent Test:** Create a plan with `allowFreeTrial = true`, `daysInFreeTrial = 30`, `dayAfterFreeTrialBehaviour = firstDayOfNextMonth`. Place a qualifying checkout order. Confirm `nextPurchaseDate` reflects the 30-day offset plus recurrence. Create a second plan without free trial enabled and confirm standard date calculation applies.

**Acceptance Scenarios:**

- Given a plan is saved with `allowFreeTrial = true` and `daysInFreeTrial = N`, When a checkout order creates a subscription under that plan, Then the first paid order date is offset by N days from the creation date.
- Given `dayAfterFreeTrialBehaviour = lastDayOfMonth`, When the calculated first paid date is day 30 in a 28-day month, Then the system sets the date to the 28th (last valid day of the month).
- Given `dayAfterFreeTrialBehaviour = firstDayOfNextMonth`, When the calculated first paid date is day 30 in a 28-day month, Then the system sets the date to the 1st of the following month.
- Given an existing subscription has no plan reference, When the system evaluates it, Then default plan behavior applies (`allowFreeTrial = false`) and no free-trial logic is triggered.

---

### User Story 3 — External promotions engine validates free-trial eligibility (Priority: P2)

At checkout, the merchant's external promotions engine queries the Subscriptions API to determine whether the shopper is eligible for the free-trial benefit. If the shopper has no prior free-trial subscription: eligible — 100% discount applied. If the shopper has or had a free-trial subscription: not eligible — regular price applies.

**Why this priority:** Eligibility validation prevents abuse. Without it, returning subscribers could re-enroll indefinitely at zero cost.

**Independent Test:** Query the Subscriptions subscriber status API for: (a) a shopper with no subscription history, (b) a shopper with an active free-trial subscription, (c) a shopper whose free-trial was canceled. Confirm the API returns distinguishable, accurate states for each and that an external engine can use them to apply or deny the discount.

**Acceptance Scenarios:**

- Given a shopper has no subscription record, When the external engine queries the Subscriptions API, Then the response indicates the shopper is eligible for a free-trial plan.
- Given a shopper has or previously had a subscription on a free-trial plan, When the external engine queries the Subscriptions API, Then the response indicates the shopper is not eligible for another free-trial.
- Given a shopper has an active free-trial subscription with all cycles in good standing and a future next execution date, When the external engine queries the API, Then the response indicates the shopper is an active free-trial subscriber.

---

## Requirements (mandatory)

### Functional Requirements

**FR-001:** The system MUST introduce a Plan entity in the Subscriptions system with a CRUD API (`/api/rns/plan`) supporting create, read, update, and list operations.

**FR-002:** The Plan entity MUST support the following properties:

| Property | Type | Default | Description |
|---|---|---|---|
| `allowFreeTrial` | boolean | `false` | Whether the plan supports the free-trial model |
| `daysInFreeTrial` | int (positive) | `0` | Days from subscription creation to first paid order |
| `dayAfterFreeTrialBehaviour` | enum (`lastDayOfMonth` / `firstDayOfNextMonth`) | `firstDayOfNextMonth` | Resolution rule when the calculated date falls on day 29, 30, or 31 with monthly frequency |
| `allowMultipleSubscriptionsInFreeTrial` | enum (`allow` / `blockWithinPlan` / `blockAcrossAllFreeTrialPlans`) | `allow` | Whether a subscriber can hold multiple active free-trial subscriptions |

**FR-003:** The system MUST calculate the first paid order date as *subscription creation date + `daysInFreeTrial` days*, applied before adding the recurring frequency offset.

**FR-004:** When `daysInFreeTrial` produces a first paid date that falls on day 29, 30, or 31 and the subscription frequency is monthly, the system MUST apply `dayAfterFreeTrialBehaviour` to produce a valid calendar date.

**FR-005:** The Plan MUST be included as a grouping attribute in subscription creation rules — subscriptions from different plans MUST NOT be grouped together regardless of other matching attributes (address, frequency, etc.).

**FR-006:** The system MUST fix the existing defect where only the first plan in a multi-plan checkout order is processed for subscription creation — each plan associated with a distinct item in the order MUST result in its own subscription.

**FR-007:** When `allowMultipleSubscriptionsInFreeTrial` blocks duplicate subscriptions and the condition is met, the system MUST allow the checkout order to proceed normally but MUST NOT create the subscription. No error is surfaced to the shopper at checkout.

**FR-008:** The Subscriptions system MUST expose an API endpoint that allows an external promotions engine to determine: (a) whether a shopper has ever subscribed to a free-trial plan, and (b) whether the shopper currently has an active free-trial subscription with all cycles in good standing.

**FR-009:** The Checkout system MUST allow adding a payment method to a zero-value cart when all three conditions are met: (1) cart total is 0, (2) all cart items are subscription items (identified via item attachments), and (3) the store has `AllowZeroValuePayment` enabled in `orderFormConfig`.

**FR-010:** For free-trial checkout orders, card validation MUST use the Gateway's Zero Auth service. The standard `/api/pvt/transactions` route MUST NOT be used for zero-value free-trial orders.

**FR-011:** The Checkout UI MUST send card data to the Gateway via `POST /payment-data` before place order. The Gateway MUST save the card token, return a signed `accountId` and `encryption-signature`, and Checkout UI MUST attach them to the order form via `/attachments/payment-data`.

**FR-012:** At place order, Checkout API MUST call the Gateway's Zero Auth route with the `accountId` and `encryption-signature`. Order completion MUST be conditional on receiving a `200 Authorized` response. Any non-200 response MUST block order completion.

**FR-013:** After a successful free-trial place order, Checkout MUST perform `GET paymentAccount` and persist the result in the Profile System so the Subscriptions system can use it for subsequent recurring orders.

**FR-014:** While a subscription is associated with a free-trial plan, the subscriber-facing API MUST block the following actions: changing next order date, changing frequency, changing item quantity, and generating one-off orders.

**FR-015:** While a subscription is associated with a free-trial plan, the subscriber MUST retain the ability to update delivery address, update payment method, and cancel the subscription at any time.

**FR-016:** Edit restrictions defined in FR-014 MUST apply only to the subscriber role. Store admins MUST retain unrestricted editing access via the admin API.

**FR-017:** Admin > Subscriptions plan configuration UI MUST be updated to expose all properties defined in FR-002, including the "Aceita Free Trial" toggle and "Quantidade de dias sem cobrança" numeric input.

**FR-018:** My Subscriptions UI MUST disable or remove edit controls restricted by FR-014 for free-trial subscriptions, clearly communicating the restricted state to the subscriber.

**FR-019:** Subscriptions created before this release that carry no plan reference MUST continue to behave as if created under a default plan with `allowFreeTrial = false`. No data migration of existing subscriptions is required.

---

## Assumptions

- **Chosen approach is Alternative 2** (Subscriptions from First Checkout Order) as defined in the PRD. Alternative 1 (headless) is not in scope for this delivery.
- **External promotions engine in use:** Discount calculation for free-trial eligibility relies on the merchant's external engine for this release. Internal Pricing & Promotions integration may be addressed in a future evolution.
- **Zero Auth connector coverage:** The payment connector in use must support the Gateway's Zero Auth service. If a connector does not implement Zero Auth, the free-trial checkout flow is unavailable for merchants using that connector.
- **`AllowZeroValuePayment` is opt-in:** Stores must explicitly enable this flag in `orderFormConfig`. It is not enabled by default, and it applies only to carts composed exclusively of subscription items.
- **Plan co-existence with Catalog:** Subscription plans continue to live as catalog attachments with the `vtex.subscription.*` prefix for checkout compatibility. The new Plan entity in Subscriptions stores only free-trial-specific attributes; both systems reference plans by name.
- **Team ownership:** OMS team owns all Subscriptions system changes. Checkout and Payments changes are owned by their respective teams and are prerequisites for the full end-to-end flow.
- **No new subscription status field:** Free-trial state is derived from plan attributes and execution state — not from a new lifecycle status (e.g., "trialing"). This may be revisited in a future release.
- **Backward compatibility guaranteed:** All existing subscriptions without a plan reference fall back to default plan behavior. No migration is required.
- **Checkout-layer duplicate block is not possible:** When `allowMultipleSubscriptionsInFreeTrial` restricts duplicate enrollments, the block is enforced only at the Subscriptions system level — the checkout order and payment always proceed.

---

## Success Criteria (mandatory)

### Measurable Outcomes

**SC-001:** A shopper can complete the full free-trial enrollment flow — zero-value checkout, Zero Auth card validation, subscription creation with correct first paid date — without VTEX support intervention.

**SC-002:** At least 1 merchant is live in Closed Beta with an active free-trial plan and confirmed subscriber enrollments by end of 2026-Q2.

**SC-003:** 0 free-trial subscriptions are created for shoppers who are ineligible per the `allowMultipleSubscriptionsInFreeTrial` plan configuration, measured across all Closed Beta enrollments.

**SC-004:** 0 subscribers on a free-trial plan succeed in deferring the first paid order date beyond `daysInFreeTrial` via self-service actions in My Subscriptions or the subscriber-facing Subscriptions API.

**SC-005:** 100% of active free-trial subscriptions in the Closed Beta pilot generate the first paid recurring order on the correct date (creation date + `daysInFreeTrial` + frequency), within a ±1 day tolerance for timezone edge cases.

**SC-006:** 0 first paid order failures during the pilot are attributable to a missing or invalid `paymentAccount` — confirming that Zero Auth card validation at enrollment successfully persists card data for future use by the Subscriptions system.
