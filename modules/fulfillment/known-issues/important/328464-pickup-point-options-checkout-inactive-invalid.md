# KI 328464 — Pickup point options in the checkout shows even inactive or invalid options

| Field | Value |
|---|---|
| **Area** | Checkout |
| **Status** | Backlog |

**Description:** The pickup points modal in the checkout shows invalid options to the shopper — including deactivated pickups, ones unrelated to loading docks/shipping policies, or ones not valid for the current sales channel/trade policy. The `/api/checkout/pub/pickup-points` API does not filter these out, so both valid (shown in blue) and invalid (shown in gray) options appear.

**Workaround:** No known workaround.

**Links:**
- Help Center: https://help.vtex.com/known-issues/pickup-point-options-in-the-checkout-shows-even-inactive-or-invalid-options
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/328464
