# Product Brief — Subscription Standard Flow


| Field                | Value                          |
| -------------------- | ------------------------------ |
| **Module**           | Order-management               |
| **Pillar**           | Order modification             |
| **PM**               | Vanessa dos Santos Borges      |
| **Eng Champion**     | Gustavo Melim                  |
| **Status**           | Draft                          |
| **Expected Release** | MVP 2026-Q2                    |
| **Availability**     | Closed Beta                    |
| **Access**           | API (MVP) · OMS Admin UI (MLP) |
| **Mode**             | B2C & B2B                      |


---

## MMR

**Title:** Subscription Standard Flow — Cycle Reliability, Payment Resilience, and Subscriber Self-Service

**Description:** With this release, VTEX Subscriptions evolves from a basic recurrence scheduler into a reliable replenishment engine. Merchants operating high-volume subscription programs (pet food, beauty, beverage, home appliances) face unacceptable cycle error rates — up to 32.6% of monthly executions fail, with no actionable feedback to either the subscriber or the support team. This initiative addresses the core reliability gap through three capabilities: (1) smart payment retries with multi-card fallback, giving failed cycles a structured second chance without subscriber friction; (2) actionable error messages surfaced through subscriber-facing channels (email, WhatsApp, My Subscriptions) and admin tools, enabling both self-service recovery and CS-assisted resolution; and (3) a modernized My Subscriptions interface that gives subscribers visibility into upcoming cycles, product swap capability, and intuitive payment and address management — reducing churn caused by operational friction rather than intent to cancel.

**Availability:** Closed Beta · 2026-Q2 (API + Admin UI)

**Target Audience:**

- **Tier:** Tier-1 and advanced Tier-2 merchants in Pets, Beauty, Grocery, Beverages, and Home Appliances running high-volume replenishment subscription programs
- **Persona:** Primary — E-commerce Managers and Subscription Managers monitoring cycle health and conversion in VTEX Admin; CS/SAC Agents resolving subscriber errors via Shoreline-ready admin tools; Secondary — Active subscribers managing their own subscriptions via My Subscriptions; Integration Engineers consuming subscription event feeds for downstream automation
- **Pain:** VTEX Subscriptions generates recurring orders but provides no feedback when cycles fail. Merchants cannot distinguish payment failures from order creation errors, cannot communicate failure reasons to subscribers, and have no retry mechanism — every failed cycle either goes unresolved or requires a manual CS intervention. On the subscriber side, My Subscriptions lacks upcoming cycle visibility, does not allow product swaps, and surfaces confusing or absent error states. At Cobasi — one of the most advanced subscriptions adopters — 32.6% of monthly cycles fail (23.1% payment errors, 9.5% order errors), directly threatening the program's commercial viability. Competitors (Nuvemshop, Shopify, WooCommerce) already offer smart retries and subscriber-facing error recovery.
- **Use Case:** A pet food subscriber's card is declined on their monthly cycle date. Instead of silently failing, the Subscriptions system triggers a smart retry schedule (configurable per merchant: e.g., retry on days +1, +3, +7). If a secondary payment method is registered, it attempts multi-card fallback. The subscriber receives a WhatsApp notification with a direct link to update their payment method in My Subscriptions — where they also see the upcoming cycle date, items, and estimated total. A CS agent viewing the same subscription in the Admin UI sees the failure reason, retry history, and can trigger a manual retry or reprocess the cycle without creating a new subscription. The cycle eventually succeeds, the subscriber retains their renewal discount, and the merchant retains the customer.

---

## Scope

**In scope:**

- Smart payment retry engine: configurable retry schedule per merchant (number of retries, interval in days), executed automatically after an initial cycle failure
- Multi-card fallback: if a primary payment method fails and a secondary is registered in the subscriber's profile, the system attempts the secondary before exhausting retries
- Actionable error classification: map current generic execution errors to structured error codes distinguishing payment declines, expired cards, insufficient funds, order creation failures, and catalog/stock blocks
- Subscriber-facing error communication: email and WhatsApp notifications triggered on cycle failure, surfacing the error reason and a direct recovery link (update payment method or address in My Subscriptions)
- My Subscriptions UX modernization: upcoming cycle visibility (next execution date, items, estimated total), product swap (replace an item within the same subscription), intuitive payment method and address update flows, inline error state display with recovery actions
- Admin UI for subscription management (Shoreline-ready): CS/SAC agents can view full cycle history (execution date, result, error reason, retry count), trigger manual retry, reprocess a failed cycle, and update payment or address on behalf of the subscriber
- Subscription event feed: structured webhook/feed notifications for subscription lifecycle events (cycle success, cycle failure, retry triggered, retry exhausted, subscriber update) enabling merchant integrations and downstream automation
- Subscription analytics dashboard (Admin): cycle success rate, failure breakdown by error type, retry conversion rate, active/paused/canceled subscriber counts — filterable by plan, frequency, and time period

**Not in scope:** Free-trial enrollment and plan configuration — addressed in the Free Trial spec. Membership benefits and Pricing & Promotions integration — addressed in the Membership Price & Promo spec. Scheduled delivery (specific delivery date selection per cycle) — separate initiative. Installment payment support for recurring orders — separate initiative. Club and curated box subscriptions — deferred to Phase 3 of the 2025-27 roadmap. Automatic PIX (PIX Automático) for subscription billing — separate initiative. Migration tooling for legacy subscriptions without plan references — no migration required; backward compatibility is guaranteed by default plan behavior. Line-item-level subscription management (subscribe to individual items independently within a multi-item subscription) — deferred to a future phase.