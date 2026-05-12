# Product Brief — Compatibility with Any Seller Architecture

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — Closed Beta |
| **Expected Release** | TBD |
| **Availability** | Closed Beta |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Compatibility with Any Seller Architecture

**Description:** With this release, merchants operating any VTEX seller architecture — franchise accounts, regular sellers, seller portal, and comprehensive sellers — will be able to use Delivery Promise to display accurate product availability in their storefronts. This means that no merchant is blocked from adopting Delivery Promise due to how their sellers are structured, and availability data reflects the full sellable assortment across all seller types.

**Availability:** Closed Beta · H1 2025 (franchise, regular, seller portal, comprehensive); GA · 2026 (full coverage)

**Target Audience:**
- Tier: All tiers
- Merchant Profile: Any VTEX merchant operating with multiple seller types in their account
- Persona: E-commerce Manager / Technical Lead
- Pain: Merchants with non-comprehensive white label sellers or franchise accounts cannot fully rely on Delivery Promise if their seller architecture is not supported — availability data is incomplete or inaccurate.
- Use Case: Ensure Delivery Promise correctly computes and exposes availability for products across all seller types in the merchant's network

---

## Feature Delta

The core Delivery Promise engine computes availability per product and zone. This MMR ensures that the availability computation correctly handles the different seller type configurations VTEX supports:

- **Franchise accounts**: sellers operating as franchises of the main account, with independent inventory and logistics
- **Regular sellers**: standard marketplace sellers with their own logistics
- **Seller portal**: sellers integrated via the VTEX Seller Portal
- **Comprehensive sellers**: sellers configured with broad geographic coverage

Each seller type has different inventory ownership, logistics configuration, and catalog linkage patterns that affect how availability is computed.

## Scope

**In scope:**
- Correct availability computation for franchise accounts, regular sellers, seller portal, and comprehensive sellers
- Assortment expansion from non-comprehensive white label sellers: products only available at location-specific sellers are shown to shoppers who can actually receive them
- Validation that availability per seller type is consistent between Delivery Promise and Checkout simulation

**Not in scope:** External sellers (separate spec), B2B seller filtering by contract (separate feature), MOI (separate spec).
