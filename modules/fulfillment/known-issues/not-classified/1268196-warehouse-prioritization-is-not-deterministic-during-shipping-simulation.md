# KI 1268196 — Warehouse Prioritization is Not Deterministic During Shipping Simulation

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** When splitting quantities of the same SKU across multiple warehouses, the system does not always choose the warehouse with the best conditions (lowest processing time or shipping cost). The warehouse selection is based on the order in which warehouses appear in the availability service, which is unordered, making the selection non-deterministic. As a result, the simulator can select a warehouse with higher processing time and extra fee even when better options exist.

**Workaround:** There is no workaround available.

**Links:**
- Help Center: https://help.vtex.com/known-issues/warehouse-prioritization-is-not-deterministic-during-shipping-simulation--1268196
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1268196
