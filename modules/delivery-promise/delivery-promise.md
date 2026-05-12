# Delivery Promise

| | |
|---|---|
| **Pillar** | Accurate availability |
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **PM** | [Camila Vidal](mailto:camila.vidal@vtex.com) |
| **EM** | [Eduardo Andrade](mailto:eduardo.andrade@vtex.com) |
| **PD** | [Malu Viana](mailto:malu.viana@vtex.com) |
| **Status** | Active |
| **Waitlist** | [roadmap.vtex.com/waitlist/delivery-promise](https://roadmap.vtex.com/waitlist/delivery-promise) |

---

## What This Module Is

Delivery Promise is the pre-purchase availability engine for the VTEX platform. Given a shopper's location (zip code or geocoordinates), it precomputes accurate delivery availability — SKUs and quantities, delivery method, delivery date, and supplier — and indexes this data into Intelligent Search and Checkout so it can be surfaced instantly across storefront navigation, PDP, PLP, cart, and checkout. Delivery Options acts as the configuration input layer: merchants define which delivery methods and time targets to offer, and Delivery Promise uses those definitions to express and index availability.

---

## Problems This Module Solves

1. **Storefront shows undeliverable products.** Storefront and checkout use different availability parameters — checkout checks for a valid delivery route, storefront does not. 24% of carts among Tier 1 merchants contain at least one unavailable item; 28% of those are caused by missing delivery routes (`cannotBeDelivered`). *(53 Tier 1 merchants, Oct–Nov)*
2. **Whitelabel seller inventory is invisible in the storefront.** VTEX only shows products from comprehensive sellers, excluding inventory at non-comprehensive whitelabel sellers that could be sold and delivered to the shopper.
3. **Delivery times and SLA filters are absent from navigation.** Merchants cannot surface delivery dates, method filters, or SLA badges during browsing — a proven conversion lever on Amazon, MercadoLivre, Magalu, Americanas, and Shopify.
4. **Checkout simulations fail at scale.** Each SKU requires a real-time checkout simulation call. Americanas reached 6% indexing success due to Checkout throttling before adopting Delivery Promise, which brought it to 99%+, eliminating ~162k requests/minute.

---

## Goals

- Reduce `cannotBeDelivered` rate to near 0% in sessions where the shopper's ZIP is captured
- Expand visible assortment for shoppers by surfacing local inventory from non-comprehensive white label sellers (~20% expansion for Hering, ~120% for Bagaggio)
- Give shoppers delivery-method and delivery-estimate context at browse time, not at checkout
- Enable merchants to activate Delivery Promise without engineering support via self-service

---

## Rollout

| Phase | Timeline | Scope |
|-------|----------|-------|
| Closed Beta | In progress | 12 merchants, Tier 2/3 — core availability filtering, location-based navigation, search filters (shipping method + specific pickup point), self-service activation |
| Open Beta | Target end Q2 2026 | Tier 1/2 — adds operational capacity, assembly options, delivery option filters, dynamic estimate tags, banners, campaign pages, sitewide header filters |
| GA | TBD | All merchants — replaces Regionalization as the platform availability layer |

---

## Services in Scope

| Service | Description |
|---------|-------------|
| Delivery Promise Engine | Precomputes delivery availability per SKU and location; indexed by Intelligent Search and consumed by Checkout — replacing per-request checkout simulations |
| Delivery Promise Indexer | Integrates with catalog indexing pipeline to propagate availability updates when stock, logistics, or delivery options change |
| Onboarding Service | Automates merchant provisioning for Delivery Promise, enabling self-serve activation without VTEX professional services engagement |
| Delivery Options Service | Merchants configure which delivery methods and time targets to offer shoppers — acts as the discretizer of delivery times for Delivery Promise to express product availability |

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Availability Engine](availability-engine/product-vision.md) | Core engine for precomputing and indexing accurate delivery availability — SLA filters, badges, and method tags across all storefront surfaces | Active — Closed Beta |
| [Location-Based Navigation](location-based-navigation/product-vision.md) | Session-wide location context via manual ZIP, browser geolocation, and IP inference — reduces cannotBeDelivered rate and expands assortment visibility | Active — Closed Beta |
| [Search Filters](search-filters/product-vision.md) | Filter PLPs by shipping method, specific pickup point, pickup nearby, delivery option, dynamic estimate, and persistent header selectors | Active — Closed Beta |
| [Tags & Badges](tags-and-badges/product-vision.md) | Delivery availability badges, option tags, and real-time estimate tags on product cards | Active — Closed Beta |
| [Banners & Discovery Pages](banners-and-discovery-pages/product-vision.md) | Delivery-aware campaign landing pages and personalized banners with dynamic cutoff messaging | Active — Closed Beta |
| [Sort Search Results](sort-search-results/product-vision.md) | Available products ranked first, unavailable products demoted in PLP and search results | Active — Closed Beta |
| [Self-Service Activation](self-service-activation/product-vision.md) | Merchant activates Delivery Promise from Admin without VTEX professional services engagement | Active — Closed Beta |
| [Compatibility](compatibility/product-vision.md) | Correct availability across all VTEX seller architectures, external sellers, operational capacity, MOI, and assembly options | Active — Closed Beta |
