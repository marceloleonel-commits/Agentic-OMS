# Product Brief — Delivery Promise Self-Service Activation

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — Open Beta |
| **Expected Release** | TBD |
| **Availability** | Open Beta |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Self-Service Activation

**Description:** With this release, any merchant using VTEX will be able to activate Delivery Promise for their account directly from VTEX Admin, without requiring a support ticket or manual VTEX intervention. This means that adoption scales beyond what CS and engineering can manually onboard, merchants who are ready to activate can do so immediately, and the product can reach GA without a linear onboarding bottleneck.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: All tiers
- Merchant Profile: Any merchant using VTEX OMS and Intelligent Search who wants to use Delivery Promise for location-based navigation, filters, tags, or badges
- Persona: E-commerce Manager / Technical Lead
- Pain: Today, activation requires opening a CS ticket and waiting for a VTEX engineer to manually integrate Catalog, Delivery Promise, Intelligent Search, and storefront flags. This is a one-time setup that should not require VTEX support.
- Use Case: Merchant activates Delivery Promise in VTEX Admin, sees a readiness check confirming their prerequisites are met, confirms settings, and Delivery Promise begins indexing — without external help

---

## Feature Delta

Today, Delivery Promise activation is a manual, coordinated process: CS receives the request, engineering provisions the account, flags are set across multiple systems (Catalog, Delivery Promise, IS, storefront), and the merchant is notified when it's live. Closed Beta targeted 12 merchants by end of 2025 with this model.

This MMR replaces the manual provisioning with a self-service flow in VTEX Admin. The merchant initiates activation, the system performs a readiness check (prerequisites: Intelligent Search active, storefront compatible), integrates the required flags, starts indexing, and confirms when Delivery Promise is live. No VTEX engineer required.

## Scope

**In scope:**
- Self-service activation flow in VTEX Admin: readiness check, settings confirmation, and activation trigger
- Automated integration of Catalog, Delivery Promise, Intelligent Search, and storefront flags at activation
- Activation status monitoring: merchant can see indexing progress and whether Delivery Promise is live
- Self-service deactivation
- Prerequisites check: surface blockers before the merchant attempts activation (e.g., Intelligent Search not active, storefront incompatibility)

**Not in scope:** Migration from Regionalization (a separate deprecation initiative), configuration of Delivery Options (Delivery Options module), custom indexing frequency overrides (future), multi-account or franchise-level activation from a single admin (future).
