# Product Brief — Filter by Dynamic Delivery Estimate in PLP

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

**Title:** Delivery Promise — Filter by Dynamic Delivery Estimate in PLP

**Description:** With this release, shoppers will be able to filter PLP results by delivery time window — for example, "Arrives today", "Arrives tomorrow", or "Arrives within 3 days" — showing only products that meet their required timeline. This means shoppers with a specific date constraint (e.g., a birthday, an event) can surface only relevant products before adding anything to cart.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: All tiers using Intelligent Search and Delivery Promise
- Persona: Shopper / E-commerce Manager
- Pain: Shoppers with a deadline cannot pre-filter PLP results to products that will arrive in time. They browse, add to cart, and only at checkout discover whether items can be delivered by the required date.
- Use Case: Filter PLP to show only products deliverable within a selected time window for the shopper's ZIP

---

## Scope

**In scope:**
- Delivery estimate filter on PLP with time-window options (e.g., "Today", "Tomorrow", "Up to 3 days", "Up to 7 days") calculated from the current date and time
- Filters to products where Delivery Promise computes an estimate within the selected window for the shopper's ZIP
- Filter applies to the current PLP only
- Estimates are dynamic — they reflect real-time cutoff times and carrier schedules

**Not in scope:** Delivery option filter (separate MMR), estimate display on product cards (Tags & Badges MMRs), sitewide persistence (separate MMR).
