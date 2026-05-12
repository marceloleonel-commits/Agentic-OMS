# Search Filters

## Problem Statement

Shoppers on VTEX storefronts today cannot filter search results by delivery method, delivery speed, or pickup availability before reaching checkout. They must browse blindly or check each product individually. This creates friction at the top of the funnel and misses a proven conversion lever: platforms like Amazon, Mercado Livre, Magalu, and Americanas all offer delivery-based filters and consistently report conversion uplift from them.

A conservative market benchmark estimates that delivery SLA filters in PLP and PDP increase GMV of 2-day delivery orders by ~10%. Merchants on VTEX currently cannot offer this experience.

## Vision

Shoppers can filter search results by delivery method (shipping, pickup, nearby pickup, specific store), by delivery option (Express, Standard, Same Day), and by dynamic delivery estimates (today, tomorrow). Every filter is backed by Delivery Promise — it reflects actual availability for the shopper's real location — so every result the filter returns is a product the shopper can genuinely receive.

Merchants configure delivery options in the Delivery Options module. Delivery Promise computes availability per product and zone. Intelligent Search exposes the results as filterable facets. The merchant decides which filters to display via native components (FastStore, Store Framework) or API.

## Target Users

**Merchants:** Omnichannel retailers with extensive logistics networks (+10 suppliers) capable of offering deliveries within a 2-day timeframe. High value for grocery, fashion, and home goods where delivery speed influences purchase decisions.

**Shoppers:** Anyone who wants to narrow search results by when and how they will receive their order.

## Success Metrics

- Conversion uplift: ~5% in Closed Beta; ~10% in Open Beta with dynamic estimates
- Filter usage: % of sessions where a delivery filter was applied after ZIP was provided
- cannotBeDelivered rate: near 0% in filter-driven sessions

## Out of Scope

- Delivery fee display in filters
- Multi-method delivery in one cart (filters use radio buttons until FastCheckout supports it)
- Cart split context (order limits per delivery window)
- External search providers (future phase)
