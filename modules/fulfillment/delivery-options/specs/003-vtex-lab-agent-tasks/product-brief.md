# Product Brief — VTEX Lab Agent Tasks

| Field | Value |
| --- | --- |
| **Spec** | 003 — VTEX Lab Agent Tasks |
| **Module path** | fulfillment / delivery-options |
| **Pillar** | Fulfillment / Agentic Configuration |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | Coming Soon — Q2C2 2026 |
| **Team** | Fulfillment |

**Related assets:**
- [Design doc — Agentic experience for Delivery Options](https://docs.google.com/document/d/1XHLPdChfUZd9iqomJgEdQJtr7hUIfCpsVdomJ2BSLVw) — Amanda Bueno (VTEX Lab section)
- Prototype finding cards — `prototype/logistics-config-agent/logistics-config-agent.html`

---

## Problem

VTEX Lab surfaced two recurring operational failures that block sales but are hard for merchants to diagnose: **delivery unavailability in high-traffic zip codes** and **broken warehouse–dock–channel–policy links** on A-curve in-stock SKUs. Today there is no agentic workflow that prioritizes these gaps by commercial impact and guides correction inside Delivery Options.

---

## Job to be done

This spec covers **two agent tasks** validated in VTEX Lab. Each has its own JTBD below.

### Task 1 — Coverage gaps in high-demand zip codes

**Persona:** Logistics Operations Manager (primary) · Ecommerce Analyst (secondary)

> As a Logistics Operations Manager, when shoppers in high-traffic zip codes hit "cannot be delivered" on top-selling products, I want the agent to map where delivery fails and explain the logistics cause, so I can fix coverage gaps before they become lost revenue.

**Diagnostic**
- Shipping simulations return **cannot be delivered** concentrated in specific CEPs
- Failures correlate with DO coverage, shipping policy eligibility, or zone configuration — not obvious from the merchant UI
- Metrics Audit metric: *"Analyzed the most frequent 'cannot be delivered' shipping simulations for top-selling products, prioritizing high-traffic zip codes with the most failures and highest SKU volume"*

**Action plan**

| Goal | Agent action | Expected impact |
| --- | --- | --- |
| Prioritize where to act | Rank CEPs × top SKUs × failure volume | Focus on gaps with highest commercial impact |
| Explain the cause | Relate failures to DO, policy, zone, or seller | Merchant understands whether the fix is config vs operation |
| Close the loop | Suggest targeted adjustments (expand DO, include policy, revise zone) | Fewer checkout blocks in priority regions |

---

### Task 2 — Broken routing links on priority SKUs

**Persona:** Logistics Operations Manager

> As a Logistics Operations Manager, when in-stock A-curve products may not reach checkout because routing is misconfigured, I want the agent to find missing warehouse–dock–sales channel–shipping policy links and prioritize fixes by stock volume, so I can restore fulfillment paths for my highest-impact SKUs.

**Diagnostic**
- Top sellers in stock, but the chain **warehouse → dock → sales channel → shipping policy** is incomplete
- Warehouses with the most missing links and highest stock volume drive disproportionate risk
- Metrics Audit metric: *"Validated warehouse-to-dock, dock-to-sales-channel, and dock-to-shipping-policy links for A-curve in-stock products, prioritizing the highest-stock warehouses with the most missing links"*

**Action plan**

| Goal | Agent action | Expected impact |
| --- | --- | --- |
| See what breaks | Audit links by warehouse, dock, channel, and policy | Clear view of configuration debt |
| Prioritize fixes | Rank by stock volume and SKU count affected | Merchant fixes highest-impact paths first |
| Restore paths | List affected SKUs; offer guided correction where automatable | A-curve products reachable again at checkout |

---

## Opportunity

Both tasks reuse **deterministic diagnostics** already prototyped in Metrics Audit and VTEX Lab — packaged as **agent tasks / MCP tools** inside the Delivery Options Agent. They complement [spec 001](../001-same-day-do-automation/product-brief.md): 001 builds the DO structure for filters; 003 ensures the underlying logistics graph can actually fulfill.

---

## Relationship to the Delivery Options Agent

Same architecture as spec 001 and [spec 002](../002-ai-workspace-backend-setup/product-brief.md): agent tasks in `fulfillment-config-agent` (`delivery-options` sub-agent), logistics reads via MCP tools in `fulfillment-mcp-server`. Tasks may ship in parallel with Same Day automation in Q2C2.

---

## Scope (this release)

**Task 1 — Map delivery failures in strategic zip codes**
- Read shipping simulation failures (`cannot be delivered`) for top-selling products
- Prioritize high-traffic CEPs and highest SKU volume
- Present ranked gaps with suspected cause (DO, policy, zone, seller)
- Suggest configuration follow-ups (no auto-apply in MVP unless explicitly scoped in spec)

**Task 2 — Validate and fix routing links**
- Audit warehouse → dock, dock → sales channel, dock → shipping policy for A-curve in-stock products
- Prioritize warehouses with most missing links and highest stock
- Surface affected SKUs and offer guided correction

---

## Out of scope

- Same Day DO generation and PLP filter setup — [spec 001](../001-same-day-do-automation/product-brief.md)
- Financial performance, margin analysis, or simulation — future agent tasks (see Design doc)
- Auto-fixing logistics configuration without merchant confirmation in MVP

---

## Why now

VTEX Lab already validated merchant demand and Metrics Audit outputs for both tasks. They address **reliability before discovery**: filters and DOs only matter if products can actually ship.

---

## Success criteria

- Both tasks callable as agent tasks in Q2C2 (may ship alongside spec 001)
- At least 1 VTEX Lab sponsor merchant completes one diagnostic workflow end-to-end
- Merchant can act on ranked output without exporting to spreadsheets or support tickets
