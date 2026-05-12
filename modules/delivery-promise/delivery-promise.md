# Delivery Promise

| | |
|---|---|
| **Pillar** | Accurate availability |
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **PM** | [Camila Vidal](mailto:camila.vidal@vtex.com) |
| **Status** | Active |

---

## What This Module Is

Delivery Promise is the pre-purchase availability engine for the VTEX platform. Given a shopper's location (zip code or geocoordinates), it precomputes accurate delivery availability — SKUs and quantities, delivery method, delivery date, and supplier — and indexes this data into Intelligent Search and Checkout so it can be surfaced instantly across storefront navigation, PDP, PLP, cart, and checkout. Delivery Options acts as the configuration input layer: merchants define which delivery methods and time targets to offer, and Delivery Promise uses those definitions to express and index availability.

---

## Services in Scope

| Service | Description |
|---------|-------------|
| Delivery Promise Engine | Precomputes delivery availability per SKU and location; indexed by Intelligent Search and consumed by Checkout — replacing per-request checkout simulations |
| Delivery Promise Indexer | Integrates with catalog indexing pipeline to propagate availability updates when stock, logistics, or delivery options change |
| Onboarding Service | Automates merchant provisioning for Delivery Promise, enabling self-serve activation without VTEX professional services engagement |
| Delivery Options Service | Merchants configure which delivery methods and time targets to offer shoppers — acts as the discretizer of delivery times for Delivery Promise to express product availability |

---

## Problems This Module Solves

1. **Storefront shows undeliverable products.** Storefront and checkout use different availability parameters — checkout checks for a valid delivery route, storefront does not. 24% of carts among Tier 1 merchants contain at least one unavailable item; 28% of those are caused by missing delivery routes (`cannotBeDelivered`). *(53 Tier 1 merchants, Oct–Nov)*
2. **Whitelabel seller inventory is invisible in the storefront.** VTEX only shows products from comprehensive sellers, excluding inventory at non-comprehensive whitelabel sellers that could be sold and delivered to the shopper.
3. **Delivery times and SLA filters are absent from navigation.** Merchants cannot surface delivery dates, method filters, or SLA badges during browsing — a proven conversion lever on Amazon, MercadoLivre, Magalu, Americanas, and Shopify.
4. **Checkout simulations fail at scale.** Each SKU requires a real-time checkout simulation call. Americanas reached 6% indexing success due to Checkout throttling before adopting Delivery Promise, which brought it to 99%+, eliminating ~162k requests/minute.

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Availability Engine](availability-engine/product-vision.md) | Core engine for precomputing and indexing accurate delivery availability — SLA filters, badges, and method tags across all storefront surfaces | Active — Open Beta H2 2025 |
