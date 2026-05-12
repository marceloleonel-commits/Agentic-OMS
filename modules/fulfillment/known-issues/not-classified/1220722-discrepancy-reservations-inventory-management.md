# KI 1220722 — Discrepancy in reservations in inventory management

| Field | Value |
|---|---|
| **Area** | Inventory Management |
| **Status** | Backlog |

**Description:** There are discrepancies between the reservation counts displayed in the inventory management UI and the actual reservations recorded in the system. Orders may show different reservation quantities depending on whether they are viewed through the admin panel or accessed via the inventory API, leading to inconsistent stock availability information.

**Workaround:** Use the inventory API to obtain the most accurate reservation data. Cross-check reservation counts via API when discrepancies are detected in the admin UI.

**Links:**
- Help Center: https://help.vtex.com/known-issues/discrepancy-in-reservations-in-inventory-management--1220722
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1220722
