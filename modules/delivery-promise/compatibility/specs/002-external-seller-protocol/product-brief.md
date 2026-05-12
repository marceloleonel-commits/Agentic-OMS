# Product Brief — Delivery Promise External Seller Protocol

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

**Title:** Delivery Promise — External Seller Protocol

**Description:** With this release, merchants operating marketplaces with external sellers (3P sellers, external OMS, or sellers not bound by VTEX logistics settings) will be able to include those sellers' product availability in Delivery Promise. This means shoppers see the complete assortment across 1P and 3P — including external seller inventory — in location-aware navigation, and merchants stop losing sales from hidden marketplace inventory.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Marketplace operators with 3P external sellers, merchants using external OMS integrations, or retailers with sellers operating outside VTEX logistics
- Persona: Marketplace Manager / E-commerce Manager
- Pain: External sellers' product availability cannot be computed by Delivery Promise from VTEX logistics data alone — the seller's logistics lives outside VTEX. Without a protocol for external sellers to send their availability, their products are invisible in Delivery Promise navigation.
- Use Case: External sellers send their product availability (delivery zones, SLAs) to Delivery Promise via API, enabling their products to appear in location-aware navigation alongside native sellers

---

## Feature Delta

Seller Architecture Compatibility (MMR 001) covers sellers operating within VTEX logistics. This MMR covers sellers who operate outside it: 3P marketplace sellers with their own logistics, sellers integrated via external OMS, or any seller whose availability cannot be derived from VTEX shipping policies and inventory.

The protocol defines how these sellers communicate their availability to Delivery Promise — what data they send, at what frequency, and via which API — so Delivery Promise can include their products in its availability index.

## Scope

**In scope:**
- API for external sellers to send product availability data (delivery zones by ZIP or CEP range, SLAs per zone, stock availability signals)
- Indexing of external seller availability data into Delivery Promise
- Inclusion of external seller products in location-aware navigation when their availability matches the shopper's location
- Availability update protocol: how external sellers notify Delivery Promise of availability changes (new zones, stock changes)

**Not in scope:** Real-time availability per-call for external sellers (availability is indexed, not live-queried per request), delivery fee data from external sellers, seller onboarding flow (external sellers use the API directly or through their integration partner).
