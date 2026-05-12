# Product Brief — Sort Search Results: Available Products First

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

**Title:** Delivery Promise — Sort Search Results: Available Products First, Unavailable Last

**Release Description:** With this release, merchants using Intelligent Search will be able to sort Search results so products available for the buyer's location appear first. This means they highlight buyable inventory, reduce friction at the top of the funnel, and lift conversion from search.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: All tiers using Intelligent Search and Delivery Promise
- Merchant Profile: Any omnichannel merchant where product availability varies by shopper location
- Persona: E-commerce Manager
- Pain: Unavailable products appear interspersed with available ones in search results, wasting premium listing positions and creating friction for shoppers who must scroll past items they cannot buy.
- Use Case: Ensure that when a shopper's location is known, available products rank above unavailable ones in search results — automatically, without manual merchandising rules

---

## Feature Delta

Location-Based Navigation (MMR 001) filters the assortment to products with valid delivery routes. This MMR controls the *ranking* within that result set when the merchant has also enabled showing out-of-stock or location-unavailable products. It ensures available products always appear first — a sort layer on top of the availability filter.

When the merchant hides unavailable products entirely (no out-of-stock display), this feature has no visible effect — the filter already handles it. Its value is most visible when merchants choose to show out-of-stock products as a catalog signal while still ensuring buyable products dominate the listing.

## Scope

**In scope:**
- Availability-based sort: products available for the shopper's location rank above products that are out-of-stock or location-unavailable
- Applies to PLP and search results pages when the shopper's location is set
- Out-of-stock products shown last, with lower relevance — consistent with the "Show Out-of-Stock Product" Catalog setting
- No change to the relative ranking of available products among themselves (other relevance signals remain in play)

**Not in scope:** Sorting by delivery speed or SLA within available products, manual merchandising overrides for unavailable products, personalized sorting.
