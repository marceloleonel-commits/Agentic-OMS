# Product Brief — Automatic Location Detection (Browser Geolocation)

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

**Title:** Delivery Promise — Automatic Location Detection via Browser

**Description:** With this release, shoppers will have their location detected automatically via the browser geolocation API when they visit the storefront, without needing to manually type a ZIP code. This means the storefront personalizes the product assortment from the first page view — reducing friction for first-time visitors and increasing sessions where location-aware availability is active.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel retailers who want maximum location coverage without requiring manual ZIP entry from shoppers
- Persona: E-commerce Manager
- Pain: Manual ZIP entry creates friction — many shoppers skip it, leaving a significant share of sessions without location context. Automatic detection enables location-aware navigation for sessions that would otherwise fall back to the generic assortment.
- Use Case: Request browser geolocation permission on page load; if granted, use the detected coordinates as the location context for the session

---

## Scope

**In scope:**
- Browser geolocation API request on page load or first user interaction
- On permission granted: coordinates are resolved to a ZIP code (or used directly) to filter the assortment
- On permission denied: graceful fallback to manual ZIP input field
- Detected location persists for the session, same as manually entered ZIP
- The shopper can override the detected location with a manual ZIP entry at any point

**Not in scope:** IP-based location inference (separate MMR), storing geolocation across sessions (privacy constraint), geolocation for logged-in address retrieval (handled by login flow).
