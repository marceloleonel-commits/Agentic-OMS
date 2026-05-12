# KI 388176 — Stock Change is Completed Even After Receiving Error 500

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** When trying to update a SKU's quantity in the inventory, the request receives an error 500. Despite the error response, the inventory quantity is actually changed. This creates a confusing situation where the error response suggests failure but the stock was actually updated.

**Workaround:** There is no workaround. It is important to verify whether the stock update occurred despite the error response.

**Links:**
- Help Center: https://help.vtex.com/known-issues/stock-change-is-completed-even-after-receiving-error-500--388176
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/388176
