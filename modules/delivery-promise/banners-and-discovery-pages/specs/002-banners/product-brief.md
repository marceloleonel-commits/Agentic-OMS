# Product Brief — Delivery Promise Banners

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

**Title:** Delivery Promise — Delivery-Aware Banners on PLPs and Homepage

**Description:** With this release, merchants will be able to display banners on PLPs and the homepage that surface dynamic delivery messaging personalized to the shopper's location — such as "Order by 2 PM for same-day delivery to São Paulo" or "Free pickup available at 3 stores near you." This means delivery promises are surfaced proactively during browsing, increasing urgency and helping shoppers make faster decisions.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: All tiers using Intelligent Search and Delivery Promise
- Persona: E-commerce Manager / Merchandiser
- Pain: Merchants have no way to surface personalized delivery messaging (e.g., cutoff times, pickup availability) on PLPs and the homepage. Generic banners ("Free shipping over R$200") do not communicate location-specific delivery promises that could drive urgency.
- Use Case: Configure delivery-aware banners that render personalized delivery messaging (cutoff times, available options, nearby pickup) based on the shopper's ZIP and real-time Delivery Promise data

---

## Scope

**In scope:**
- Delivery-aware banner component for PLPs and homepage with dynamic delivery messaging computed from Delivery Promise for the shopper's ZIP
- Configurable message templates (e.g., "Order by [cutoff time] for [delivery option] to [city]")
- Banner is suppressed if no location is set or if no relevant delivery promise applies
- Available for FastStore and VTEX IO storefronts

**Not in scope:** Campaign landing pages powered by Delivery Promise (separate MMR), delivery estimate tags on product cards (separate MMR), static promotional banners (existing functionality).
