# KI 553080 — Logistics Simulation with Minimum and Maximum Price in Shipping Policy Does Not Work When ProductPrice as 0 (ZERO)

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** The logistics simulation does not consider the product price when matching minimum and maximum price values configured in the Shipping Policy, when the product price is ZERO. As a result, shipping policies that should be restricted to products within a price range are still displayed as available even when no product price is provided in the simulation.

**Workaround:** Execute the simulation with a product price included.

**Links:**
- Help Center: https://help.vtex.com/known-issues/logistics-simulation-with-minimum-and-maximum-price-in-shipping-policy-does-not-work-when-productprice-as-0-zero--553080
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/553080
