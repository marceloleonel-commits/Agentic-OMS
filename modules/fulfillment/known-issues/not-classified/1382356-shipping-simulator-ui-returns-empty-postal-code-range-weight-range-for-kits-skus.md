# KI 1382356 — Shipping Simulator UI Returns Empty "Postal Code Range", "Weight Range" for KITs SKUs

| Field | Value |
|---|---|
| **Area** | Logistics |
| **Status** | Backlog |

**Description:** When simulating a KIT SKU in the Logistics Shipping Simulator, SLA options are returned correctly, but the metadata fields "Postal code range" and "Weight range" appear empty. This only affects KIT SKUs because the logistics engine breaks down the kit and calculates each component individually, rather than the kit SKU itself. Single (non-KIT) SKUs behave normally.

**Workaround:** There is no workaround. The issue affects simulation display only; checkout and SLA calculation are not impacted.

**Links:**
- Help Center: https://help.vtex.com/known-issues/shipping-simulator-ui-returns-empty-postal-code-range-weight-range-for-kits-skus--1382356
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/1382356
