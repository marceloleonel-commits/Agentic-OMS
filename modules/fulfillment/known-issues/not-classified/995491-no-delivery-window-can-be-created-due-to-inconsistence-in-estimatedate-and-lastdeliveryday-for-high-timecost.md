# KI 995491 — No Delivery Window Can Be Created Due to Inconsistence in estimateDate and lastDeliveryDay for High Timecost

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** When the total transit timecost is excessively high, an inconsistency between estimateDate and lastDeliveryDay causes the condition lastDeliveryDay > estimateDate to return false, and therefore no delivery window is created. estimateDate counts only carrier delivery days (excluding weekends), while lastDeliveryDay counts consecutive calendar days, leading to the mismatch.

**Workaround:** There is no workaround available.

**Links:**
- Help Center: https://help.vtex.com/known-issues/no-delivery-window-can-be-created-due-to-inconsistence-in-estimatedate-and-lastdeliveryday-for-high-timecost--995491
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/995491
