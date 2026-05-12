# Tags & Badges

## Problem Statement

Even when shoppers know their delivery options exist, they must actively filter or open each product to find out whether it can be delivered quickly. There is no at-a-glance delivery signal on product cards in PLP or PDP. This slows down comparison shopping, reduces the prominence of merchants' fast delivery capabilities, and leaves a proven conversion tool on the table — every major e-commerce platform (Amazon, Mercado Livre, Shopify) surfaces delivery badges directly on product listings.

## Vision

Product cards in PLP and PDP display contextual delivery signals — badges and tags — that reflect the actual availability and speed of delivery for the shopper's location. A shopper sees "Arrives today," "Next-day delivery," or "Pickup available 1.2 km away" directly on the product card, without opening the product or manually entering a ZIP code on each page.

There are two types of signals:
- **Delivery Option tags**: based on the merchant's configured delivery options (Express, Standard, Same Day). The system determines the most relevant tag per product based on the shopper's context — fastest, cheapest, nearest pickup.
- **Dynamic Estimate tags**: real-time estimates like "Same-Day Delivery," "Next-Day Pickup," or "Get it before Christmas dinner," updated automatically as cutoff times pass.

Both types are powered by Delivery Promise and exposed via Intelligent Search API. Merchants implement them through native FastStore or Store Framework components, or via headless API for custom storefronts.

## Target Users

**Merchants:** Omnichannel retailers who want to highlight fast fulfillment capabilities directly in the browsing experience, particularly those competing on delivery speed (grocery, pharmacy, electronics).

**Shoppers:** Anyone making purchase decisions where delivery timing is a factor and who benefits from seeing that information without extra navigation.

## Success Metrics

- Conversion uplift from delivery badge presence on PLP and PDP (measured via A/B testing per merchant)
- % of merchants with Delivery Promise active that also implement tags/badges
- Dynamic estimate accuracy: same-day/next-day tags automatically hide when cutoff times pass

## Out of Scope

- Delivery fee display on badges
- Package split information per delivery window (requires Order Allocation integration)
- Free shipping badge (future feature)
