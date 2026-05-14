# Product Brief — Subscription Membership: Price & Promo


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

**Title:** Subscription Membership — Native Pricing Integration and Membership Lifecycle Management

**Description:** With this release, merchants running membership programs (Amazon Prime- and Walmart+-style clubs) will be able to integrate subscriber status directly with VTEX Promotions — enabling automatic discount and benefit application (exclusive prices, free shipping, early access) for active members, without relying on an external promotions engine. VTEX Subscriptions becomes the authoritative source of membership status, feeding the VTEX Promotions engine the same way it already integrates with the Profile System. Alongside this integration, two lifecycle features complete the membership model: automatic subscription cancellation when payment fails (revoking benefits immediately) and subscriber self-service reactivation paired with an immediate membership payment to restore benefits on re-enrollment.

**Availability:** Closed Beta · 2026-Q2 (API + Admin UI)

**Target Audience:**

- **Tier:** Tier-1 and advanced Tier-2 merchants in Fashion, Beauty, Pets, Grocery, and Beverages running or planning membership programs
- **Persona:** Primary — E-commerce Managers and Subscription Managers configuring membership plans and promotion rules in VTEX Admin; Secondary — CS/SAC Agents managing subscriber lifecycle; Shoppers as club members
- **Pain:** Merchants cannot run native membership programs with VTEX-managed benefits because: (1) VTEX Promotions has no way to validate subscriber or member status natively — the Free Trial implementation for Dollar General requires an external promotions engine, a model that does not scale to all VTEX merchants; (2) when a membership payment fails, the subscription is never automatically canceled — active members keep receiving club benefits indefinitely without paying, destroying the integrity of the membership model; (3) a subscriber whose membership was canceled (due to payment failure or manual action) cannot reactivate it — they must create a brand new subscription, losing history and generating unnecessary support overhead.
- **Use Case:** A retailer in Beauty launches a membership club: active subscribers get 10% exclusive discount and free shipping. A shopper enrolls (optionally via free trial from the prior release). Benefits are applied automatically by VTEX Promotions, which queries the Subscriptions API to confirm active membership status. If the monthly billing fails, the membership auto-cancels per the plan's configured threshold, and Promotions stops applying benefits immediately. The subscriber can reactivate at any time from My Subscriptions: an immediate payment is processed, and upon authorization, membership status and benefits are restored without creating a new subscription.

---

## Scope

**In scope:**

- Direct integration between VTEX Promotions (internal engine) and Subscriptions: Promotions queries the Subscriptions API to validate subscriber/member status, analogous to the existing Profile System integration — enabling VTEX-native promotion rules based on subscription plan attributes (e.g., "is active subscriber of plan X")
- Promotions UI changes to allow configuring promotion conditions based on subscription plan and subscriber status
- Subscriptions API endpoint for status validation by the internal Promotions engine, returning: subscriber active/inactive, plan identifier, trial vs. paid status, and consecutive failure count
- Configurable automatic subscription cancellation on execution errors: payment failure, expired card, or generic errors — configurable per plan (e.g., auto-cancel after N consecutive failures), with the event signaling benefit revocation
- Reactivation API for canceled subscriptions: re-enables a canceled subscription and recalculates `nextPurchaseDate` from the reactivation date, without requiring the subscriber to create a new subscription
- Synchronous order generation at reactivation: an immediate "membership fee" order is triggered at the moment of reactivation, validating card data and confirming re-enrollment before membership status and benefits are restored
- Plan-level configuration for auto-cancellation behavior: on/off toggle and failure threshold

**Not in scope:** External promotions engine integration — already addressed in the Free Trial spec; Dollar General uses its own engine and that path remains unchanged. Subscription change and status feed notifications — tracked as a separate initiative. Mid-cycle benefit suspension without full cancellation — benefit state is managed by Promotions based on subscription active/canceled status, not on intra-cycle states. Plan-level analytics dashboards — deferred to Phase 3 of the 2025-27 roadmap. Automatic PIX (PIX Automático) for membership billing — separate initiative. Benefits administration UI within Subscriptions Admin — benefits and discount rules are owned by the Promotions system, not by Subscriptions.

