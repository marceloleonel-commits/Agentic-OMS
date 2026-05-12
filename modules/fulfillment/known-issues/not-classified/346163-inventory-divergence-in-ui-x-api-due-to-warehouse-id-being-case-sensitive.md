# KI 346163 — Inventory Divergence in UI x API Due to Warehouse Id Being Case Sensitive

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** The same API creates and updates warehouses. Since the warehouse ID is case sensitive, if the intention is to update ID "TEST" but "test" is entered instead, a new warehouse is created. However, the inventory is case insensitive, causing it to be replicated for both warehouses. This leads to divergence between the UI (which shows the same inventory for both) and the API (which treats each warehouse separately). Deleting the original warehouse can then cause the SKU to appear out of stock at checkout.

**Workaround:** Update the inventory of the specific warehouse manually. If possible, avoid creating warehouses with the same ID differing only in case (e.g., "TEST" vs "test").

**Links:**
- Help Center: https://help.vtex.com/known-issues/inventory-divergence-in-ui-x-api-due-to-warehouse-id-being-case-sensitive--346163
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/346163
