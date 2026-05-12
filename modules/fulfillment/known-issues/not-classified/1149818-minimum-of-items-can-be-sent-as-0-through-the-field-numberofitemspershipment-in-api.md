# KI 1149818 — Minimum of Items Can Be Sent as 0 Through the Field "numberOfItemsPerShipment" in API

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** The field "numberOfItemsPerShipment" can be sent as 0 via the Shipping Policy API. When filled with 0, the shipping policy becomes unavailable during the shopping process. The shipping simulation in admin may still show the policy as available, but it will not function in the actual checkout flow.

**Workaround:** Modify the field "numberOfItemsPerShipment" to a value of 1 or above.

**Links:**
- Help Center: https://help.vtex.com/known-issues/minimum-of-items-can-be-sent-as-0-through-the-field-numberofitemspershipment-in-api--1149818
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1149818
