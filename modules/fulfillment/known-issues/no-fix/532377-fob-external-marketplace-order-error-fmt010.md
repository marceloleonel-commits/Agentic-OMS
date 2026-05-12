# KI 532377 — FOB External Marketplace integrate an order (Error code: FMT010)

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** External Marketplace partners trying to integrate FOB (Free on Board) orders receive the error: `"code": "FMT010", "message": "The selected SLA for item <SKU_Id> is not available"`. The issue occurs when a Shipping Policy "Delivery" is not enabled — with it enabled the integration succeeds, but without it the error appears.

**Workaround:** Configure a Shipping Policy with the "Delivery" type enabled for the integration to work correctly.

**Links:**
- Help Center: https://help.vtex.com/known-issues/fob-external-marketplace-integrate-an-order-erro-code-fmt010--532377
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/532377
