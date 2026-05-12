# Product Brief — Inferred Location by IP Address

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — GA |
| **Expected Release** | TBD |
| **Availability** | Generally Available |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Location Inference by IP Address

**Description:** With this release, shoppers' locations will be inferred from their IP address when neither a manual ZIP nor browser geolocation is available. This means that even anonymous shoppers who have not interacted with any location input see a personalized assortment from the first page view — maximizing the share of sessions where Delivery Promise is active without any friction.

**Availability:** GA · 2026

**Target Audience:**
- Tier: All tiers
- Merchant Profile: Any merchant using Delivery Promise who wants to maximize location-aware sessions
- Persona: E-commerce Manager
- Pain: Even with manual ZIP and browser geolocation available, a significant share of sessions never activate location context. IP-based inference fills this gap — enabling a baseline location estimate for sessions that would otherwise fall back to the generic assortment.
- Use Case: Use the shopper's IP address to estimate their geographic location when no explicit location is provided, applying that estimate to filter the product assortment

---

## Scope

**In scope:**
- IP-to-region/ZIP mapping applied as a location estimate when no explicit location (manual ZIP or browser geolocation) is available
- Location estimate used to filter the assortment — same behavior as manual ZIP, but flagged as an estimate
- Shopper can always override the estimated location with manual ZIP entry
- Graceful fallback if IP cannot be resolved to a region (VPN, corporate network, unrecognized IP) — fallback to standard assortment

**Not in scope:** High-precision location from IP (IP-based location is city/region accuracy, not street-level), storing IP-derived location across sessions, using IP location when explicit location is already available.
