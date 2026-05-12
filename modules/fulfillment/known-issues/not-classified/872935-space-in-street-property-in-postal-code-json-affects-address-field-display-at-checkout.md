# KI 872935 — Space in Street Property in Postal Code JSON Affects Address Field Display at Checkout

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** When activating the postal code API for countries that are not in the BR model (country, state, city, neighborhood, street), if the street property of the postal code JSON contains a space character (" "), it is treated as a filled and valid value. This prevents the street address field from appearing at checkout, blocking the customer from entering their address and proceeding with the order.

**Workaround:** There is no workaround available.

**Links:**
- Help Center: https://help.vtex.com/known-issues/space-in-street-property-in-postal-code-json-affects-address-field-display-at-checkout--872935
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/872935
