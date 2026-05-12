# KI 1036916 — SLA Offer Fluctuating Between Different Shipping Policies Due to Cache in Estimated Date of 30 Seconds

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** The logistics simulation can oscillate between offering different SLAs when a client has shipping policies with the same price, delivery time, SlaType, dock cost, and warehouse configuration, but different dock priorities. A 30-second cache for delivery time can cause a simulation made within that window to offer a shipping policy with a longer dock time that should not be offered.

**Workaround:** There is no workaround for a scenario with the same settings as described above.

**Links:**
- Help Center: https://help.vtex.com/known-issues/sla-offer-fluctuating-between-different-shipping-policies-due-to-cache-in-estimated-date-of-30-seconds--1036916
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1036916
