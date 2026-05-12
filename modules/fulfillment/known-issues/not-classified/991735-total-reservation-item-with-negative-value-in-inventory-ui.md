# KI 991735 — Total Reservation Item with Negative Value in Inventory UI

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** In a specific scenario where multiple orders are placed for the same SKU from the same warehouse, the reservation count in the inventory UI can become negative. This happens when an order is moved to handling (acknowledging the reservation), the inventory is then updated to match outstanding orders, and the original order is cancelled before a second order's reservation is acknowledged. When the second order is subsequently moved to handling, the reservation value becomes negative.

**Workaround:** There is no workaround available.

**Links:**
- Help Center: https://help.vtex.com/known-issues/total-reservation-item-with-negative-value-in-inventory-ui--991735
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/991735
