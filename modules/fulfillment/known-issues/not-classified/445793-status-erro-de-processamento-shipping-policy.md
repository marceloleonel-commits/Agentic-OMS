# KI 445793 — Status 'ERRO DE PROCESSAMENTO' Shipping Policy

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** After creating a Shipping Policy without a spreadsheet and then using the API (POST /values/update) to create postal code ranges, the system can correctly match postal codes and simulate shipping. However, the status of the Shipping Policy remains as "Error on processing" even though everything is working correctly. This occurs because the status was set during the initial creation without a spreadsheet.

**Workaround:** Process the spreadsheet manually: download the existing spreadsheet and re-upload it without any changes. This will update the status to active.

**Links:**
- Help Center: https://help.vtex.com/known-issues/status-erro-de-processamento-shipping-policy--445793
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/445793
