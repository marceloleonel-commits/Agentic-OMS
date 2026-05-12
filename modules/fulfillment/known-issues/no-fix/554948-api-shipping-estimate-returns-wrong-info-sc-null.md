# KI 554948 — API Shipping Estimate returns wrong info when SC is null

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** The Logistics API `/api/logistics/pvt/shipping/estimate` returns wrong indexed info when executed with the sales channel (SC) parameter as null. When a Dock has its Sales Policy removed, the API starts returning results for that condition. Re-adding the Sales Policy to the Dock does not restore the original behavior.

**Workaround:** Send the API request with the SC (sales channel) parameter explicitly defined.

**Links:**
- Help Center: https://help.vtex.com/known-issues/api-shipping-estimate-returns-wrong-info-when-sc-is-null--554948
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/554948
