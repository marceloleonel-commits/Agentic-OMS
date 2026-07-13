# Fulfillment Agent — Prototype

Admin v4 mockup (Raccoon/Shoreline tokens) for the **Fulfillment Agent**.

## Open locally

```bash
open -a "Google Chrome" modules/fulfillment/fulfillment-agent/prototype/logistics-config-agent/logistics-config-agent.html
```

## What this validates

- Fulfillment Agent as a cross-workflow copilot — not a single-task tool
- Split layout: **chat panel** (agent) + **workspace** (structured results)
- Three tasks with actionable follow-ups:
  1. **DO suggestion** — SLA analysis → suggested DOs → edit prazo with coverage diff → create DOs
  2. **Coverage holes** — high-traffic CEPs with delivery failures → map zone, seller, Shipping Policy, and freight table → approve individually or in bulk
  3. **Broken routing links** — recent deactivations and warehouse/dock/policy/channel gaps → approve individual or bulk fixes
- Editable action plans with individual selection, partial approval, and bulk execution
- **Confirmation gate** before every write action (modal), with target and proposed change per selected item
- Per-item success, partial failure, blocked, and no-op result states
- Optional **SLA export** on DO task

## Mock account

`drogariaspacheco` — pharmacy with granular SLAs, matches Same Day brief examples.

## Status

`[x]` Interactive HTML prototype — iteration in progress, not production Raccoon app.

## Related specs

- [Delivery Options / 001 — Same Day DO Automation](../../../delivery-options/specs/001-same-day-do-automation/product-brief.md)
- [Fulfillment Agent / 001 — AI Workspace Backend Setup](../../specs/001-ai-workspace-backend-setup/product-brief.md)
- [ADR-001 — Fulfillment Agent Architecture](../../specs/001-ai-workspace-backend-setup/ADR-001-fulfillment-agent.html)
