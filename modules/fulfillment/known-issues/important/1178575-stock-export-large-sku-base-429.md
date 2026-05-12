# KI 1178575 — Stock export fails for large SKU bases with 429 errors

| Field | Value |
|---|---|
| **Area** | Inventory Management |
| **Status** | Backlog |

**Description:** When attempting to export stock data for stores with a large number of SKUs, the export process fails due to 429 (Too Many Requests) errors. The system does not handle rate limiting gracefully during bulk export operations, causing the export to time out or return incomplete data.

**Workaround:** Export stock data in smaller batches by filtering by warehouse or category to reduce the number of SKUs per export request.

**Links:**
- Help Center: https://help.vtex.com/known-issues/stock-export-fails-for-large-sku-bases-with-429-errors--1178575
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1178575
