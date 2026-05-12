# KI 330775 — Checkout simulation with a great quantity of the same SKU receives a Logistics timeout

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** There is an error in the Logistics service when trying to simulate a purchase with thousands of units of the same SKU. The request to split the package takes too long, resulting in the error `"The operation was canceled."` For kit products, the scenario is even more restrictive because logistics calculates each kit component individually.

**Workaround:** Increase the carrier's package limits to accommodate the units in a single package. This provides a faster request and avoids the timeout.

**Links:**
- Help Center: https://help.vtex.com/known-issues/checkout-simulation-with-a-great-quantity-of-the-same-sku-receives-a-logistics-timeout--330775
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/330775
