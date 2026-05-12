# KI 1159693 — Timeout in Analytics Query Can Prevent Inventory Log from Loading

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** In the inventory UI, the update log sometimes fails to load for specific SKUs, displaying the error: "There was an error loading the data. Please try again." The request fails with Request failed with status code 500, indicating a timeout in the query to Analytics (where the data is stored). This timeout can occur due to high update volume for the SKU or other factors causing the query to exceed the maximum allowed execution time of 40 seconds.

**Workaround:** In some cases, refreshing the page will resolve the issue and allow the inventory log to load correctly.

**Links:**
- Help Center: https://help.vtex.com/known-issues/timeout-in-analytics-query-can-prevent-inventory-log-from-loading--1159693
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1159693
