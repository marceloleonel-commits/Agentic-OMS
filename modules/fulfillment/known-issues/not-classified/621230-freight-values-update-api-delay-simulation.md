# KI 621230 — Freight values update via API delay in simulation

| Field | Value |
|---|---|
| **Area** | Logistics / Shipping |
| **Status** | Backlog |

**Description:** When freight values are updated via the Logistics API, there is a delay before the new values are reflected in shipping simulations. The system caches freight table data, so updates made through the API may take several minutes to propagate and be used in checkout simulations.

**Workaround:** Wait for the cache to expire after updating freight values via API. Cache invalidation typically takes a few minutes. Avoid making time-sensitive freight value changes close to peak traffic periods.

**Links:**
- Help Center: https://help.vtex.com/known-issues/freight-values-update-via-api-delay-in-simulation--621230
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/621230
