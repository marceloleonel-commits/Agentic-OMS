# KI 927747 — Route Prioritization Does Not Offer the Best Option in Terms of Quantity of Packages and Items

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** In Logistics, the first tiebreaker criteria when selecting a route (warehouse + dock + shipping policy) is the number of packages needed. Fewer packages is considered better. However, the system cannot consider the relationship between the number of packages and the number of items in each package. For example, a route with 2 packages and 2 items can be prioritized over a route with 1 package containing all items.

**Workaround:** Separate the warehouse + dock + shipping policy combination with different shipping method names to avoid depending on the default route prioritization logic.

**Links:**
- Help Center: https://help.vtex.com/known-issues/route-prioritization-does-not-offer-the-best-option-in-terms-of-quantity-of-packages-and-items--927747
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/927747
