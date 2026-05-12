# KI 657186 — Divergence in kit weight with decimals

| Field | Value |
|---|---|
| **Area** | Logistics / Catalog |
| **Status** | Backlog |

**Description:** When kit products contain items with decimal weight values, the total weight calculation for the kit may show divergences. The system does not correctly aggregate decimal weight values across kit components, which can result in incorrect freight calculations during shipping simulation.

**Workaround:** Round kit component weights to whole numbers when possible, or manually verify the freight calculation for kits with decimal weight values.

**Links:**
- Help Center: https://help.vtex.com/known-issues/divergence-in-kit-weight-with-decimals--657186
- Zendesk: https://vtexhelp.zendesk.com/agent/tickets/657186
