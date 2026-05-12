# KI 594828 — Shipping Policy That Does Not Deliver on Weekends Is Being Considered

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | No Fix |

**Description:** The "Weekends and Holidays" setting and "Business hours" were previously dependent on each other. After these were decoupled (to allow "Business hours" to be used as dock hours), the "Weekends and Holidays" setting no longer correctly disregards shipping policies that cannot deliver on certain days. As a result, shipping policies configured not to deliver on weekends but with Saturday/Sunday business hours get very long SLA estimates, potentially overriding better options.

**Workaround:** Enable the "Weekends and Holidays" options to match the "Business hours" configuration. For example, if the shipping policy only delivers on Saturday, enable the Saturday option in "Weekends and Holidays".

**Links:**
- Help Center: https://help.vtex.com/known-issues/shipping-policy-that-does-not-deliver-on-weekends-is-being-considered--594828
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/594828
