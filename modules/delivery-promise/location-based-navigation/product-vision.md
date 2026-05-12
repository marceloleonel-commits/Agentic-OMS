# Location-Based Navigation

## Problem Statement

During August 2024, 7.6% of cart simulations from Tier 1 merchants had at least one unavailable item due to the absence of a valid delivery route to the shopper's location (cannotBeDelivered). Shoppers only discover this restriction at checkout — after selecting the product, adding it to the cart, and initiating payment — causing frustration and cart abandonment.

The root cause is structural: without knowing the shopper's location during navigation, the storefront cannot filter out products that cannot be delivered. Everything is shown as available, and the availability check only runs at checkout.

## Vision

When a shopper provides their location — by entering a ZIP code, logging in with a saved address, or granting geolocation permission — the storefront displays only products that can actually be delivered to or picked up from that location. Products with no valid delivery route are hidden or deprioritized. The shopper's location context persists across the entire browsing session, and the assortment updates automatically if the location changes.

This eliminates the gap between what shoppers see during navigation and what they can actually purchase at checkout. Merchants using Delivery Promise should reach near 0% cannotBeDelivered rate in sessions where the shopper's ZIP code is captured.

Beyond cart availability, location-based navigation unlocks hidden inventory: merchants operating with non-comprehensive white label sellers can increase their visible sellable assortment by up to 120% (as measured with Bagaggio), because products stocked at local stores are now shown to shoppers who can actually receive them.

## Target Users

**Merchants:** Omnichannel retailers with multi-node fulfillment networks, particularly those operating seller whitelabel architectures or franchise networks where product availability varies significantly by location. Target audience for Closed Beta: Tier 2 and Tier 3 merchants using Intelligent Search with agencies or internal development teams.

**Shoppers:** Anyone shopping on a VTEX-powered storefront who wants to see only products they can actually buy and receive.

## Success Metrics

- Cart Availability: ~10% improvement, reaching near 100% in sessions where the shopper's ZIP code is captured
- Sellable assortment: ~20% increase for merchants previously using non-comprehensive sellers (up to ~120% for high-density networks like Bagaggio)
- cannotBeDelivered rate: near 0% in location-aware sessions for merchants using Delivery Promise
- Conversion: ~5% uplift from eliminating checkout-stage availability surprises

## Out of Scope

- Delivery fee calculation and display
- Cart context (order split limits, items per delivery promise) — not factored into navigation availability
- External search providers — Intelligent Search only in initial phases
- Per-SKU availability display in navigation (future)
