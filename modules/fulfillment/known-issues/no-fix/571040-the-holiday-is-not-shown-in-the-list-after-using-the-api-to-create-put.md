# KI 571040 — The Holiday is Not Shown in the List After Using the API to Create (PUT)

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** When registering multiple holidays via API at the same time (roughly within the same second), inconsistencies occur during record indexing. The individual holiday record is created (accessible via GET by ID), but it does not appear in the holiday list (GET all holidays) and is therefore not considered in logistics calculations. Records left in this inconsistent state cannot be recovered through subsequent PUT requests with the same ID.

**Workaround:** Ensure adequate spacing between API requests for holiday registration (at least 15 seconds to minutes between each PUT). If a holiday is in an inconsistent state, create a new record with a different ID.

**Links:**
- Help Center: https://help.vtex.com/known-issues/the-holiday-is-not-shown-in-the-list-after-using-the-api-to-create-put--571040
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/571040
