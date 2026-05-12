# KI 1034211 — availableQuantity inconsistent for large routes

| Field | Value |
|---|---|
| **Area** | Logistics / Inventory |
| **Status** | Backlog |

**Description:** When routes have a large number of warehouses or docks configured, the `availableQuantity` field returned by logistics simulations becomes inconsistent. The calculation does not correctly aggregate inventory across all nodes in the route, resulting in quantity mismatches between what is shown and what is actually available.

**Workaround:** Simplify the route configuration by reducing the number of warehouses or docks involved, or validate availability using the inventory management API directly.

**Links:**
- Help Center: https://help.vtex.com/known-issues/availablequantity-inconsistent-for-large-routes--1034211
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1034211
