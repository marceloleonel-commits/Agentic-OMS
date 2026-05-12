# KI 1246900 — Excluded warehouses return stock availability

| Field | Value |
|---|---|
| **Area** | Inventory Management |
| **Status** | Backlog |

**Description:** Warehouses that have been explicitly excluded from a shipping policy or sales channel still return stock availability data during logistics simulations. The exclusion configuration is not properly respected, causing the system to consider inventory from warehouses that should be ignored, leading to incorrect availability results.

**Workaround:** Review and re-save the shipping policy configuration to ensure warehouse exclusions are applied. If the issue persists, contact VTEX support.

**Links:**
- Help Center: https://help.vtex.com/known-issues/excluded-warehouses-return-stock-availability--1246900
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1246900
