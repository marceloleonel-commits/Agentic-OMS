# Product Brief — Subscription Membership Free Trial


| Field                | Value                          |
| -------------------- | ------------------------------ |
| **Module**           | Order-management               |
| **Pillar**           | Order modification             |
| **PM**               | Marcelo Leonel da Costa        |
| **Eng Champion**     | Tulio                          |
| **Status**           | Draft                          |
| **Expected Release** | MVP 2026-Q2                    |
| **Availability**     | Closed Beta                    |
| **Access**           | API (MVP) · OMS Admin UI (MLP) |
| **Mode**             | B2C & B2B                      |


---

## MMR

**Title:** Subscription Membership Free Trial — Configurable Trial Period for Membership Plans

**Description:** With this release, merchants running membership programs (e.g., myDG+ by Dollar General, similar to Amazon Prime and Walmart+) will be able to configure a free trial period natively within VTEX's subscription tool. When a shopper enrolls, a subscription is created with a defined trial window — no charge is applied during the trial. After the trial ends, the subscription transitions automatically to a paid recurring cycle. VTEX OMS becomes the orchestrator of the subscription lifecycle: identifying trial status, enforcing payment expiration, blocking edit abuse, and enabling seamless restore of lapsed subscriptions.

**Availability:** Closed Beta · 2026-Q2 (API — headless approach) · 2026-Q2 (Admin UI + Checkout-integrated approach)

**Target Audience:**

- **Tier:** Tier-1 merchants and advanced Tier-2 merchants operating membership or loyalty programs
- **Persona:** Primary — Merchants and Store Operators configuring subscription membership plans; OMS Operators managing subscriber lifecycle; Secondary — Integration Engineers (API-first setup); End shoppers as free-trial beneficiaries
- **Pain:** VTEX subscriptions have no native support for a configurable free trial period. Merchants who want to launch membership programs (e.g., Dollar General myDG+) must rely on external workarounds or custom integrations — which break subscription traceability, create payment lifecycle inconsistencies, prevent proper subscriber-status tracking inside OMS, and make it impossible to enforce trial-period limits or handle re-subscriptions after payment failures.
- **Use Case:** Allow merchants to flag a subscription plan as free-trial-eligible at the catalog level. When a shopper enrolls, OMS creates the subscription (either headlessly via API or from the first checkout order) with a trial period. During the trial, the shopper has full membership status but is not charged. After the trial window closes, the subscription auto-renews as paid. If payment fails, the subscription expires and can be restored when the shopper re-subscribes.

---

## Scope

**In scope:**

- Free trial flag configuration at the plan/catalog level via the Subscriptions–Catalog integration
- **Alternative 1 — Headless subscription (API-first):** subscription creation via Subscriptions API without a first checkout order; client/project team responsible for profile, payment account, and catalog eligibility setup via respective APIs
- **Alternative 2 — Subscription from first checkout order:** subscription created at checkout, integrated with Checkout, Payments gateway (zero-value order support), and RnB (Rates & Benefits) to orchestrate discounts and free-trial eligibility
- Subscriber status identification via a plan attribute (not a standalone status field) to distinguish trial from active paying subscriber
- Pricing integration with the Subscription model for discount calculation based on subscriber status (covers both alternatives and future evolutions)
- Subscription expiration when payment is not completed after the trial period ends
- Restore of expired or canceled subscriptions (e.g., payment failure followed by re-subscription intent)
- Block subscriber edits on free-trial subscriptions to prevent indefinite postponement of the next order date and retention of member status without generating an order
- Admin > Subscriptions: plan setup UI to include free trial configuration flag
- My Subscriptions: prevent subscribers from altering the subscription in a way that indefinitely defers the next order date
- Feed/webhook notification on subscription creation for the headless approach (no originating order exists)

**Not in scope:** CL entity (Master Data) direct integration for subscriber discount calculation in Alternative 1 — pricing calculations are expected to be handled by updating the Subscription model itself; Admin UI and MyOrders UI changes for the initial MVP API scope; non-membership standard product subscriptions without a trial period; digital products and services (physical-goods membership plans only in initial scope); complete financial/accounting ledger integration — OMS orchestrates financial intent while PSPs and ERPs remain systems of record for financial postings; replacing existing subscription flows unrelated to membership free trial.

---

