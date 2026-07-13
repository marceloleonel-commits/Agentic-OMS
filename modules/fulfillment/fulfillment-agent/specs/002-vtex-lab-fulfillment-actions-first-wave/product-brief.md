# Product Brief — VTEX Lab Fulfillment Actions — First Wave

| Field | Value |
| --- | --- |
| **Spec** | 002 — VTEX Lab Fulfillment Actions — First Wave |
| **Module path** | fulfillment / fulfillment-agent |
| **Pillar** | Fulfillment / Agentic Configuration |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | Coming Soon — Q2C2 2026 |
| **Team** | Fulfillment |

**Related assets:**
- [Design doc — Agentic experience for Delivery Options](https://docs.google.com/document/d/1XHLPdChfUZd9iqomJgEdQJtr7hUIfCpsVdomJ2BSLVw) — Amanda Bueno (VTEX Lab section)
- Prototype finding cards — [`logistics-config-agent.html`](../../prototype/logistics-config-agent/logistics-config-agent.html)

---

## Problem

VTEX Lab surfaced two recurring operational failures that block sales but are hard for merchants to act on: **delivery unavailability in high-traffic zip codes** and **broken warehouse / stock location–dock–Shipping Policy links** on A-curve in-stock SKUs. Today the diagnostic signal can already exist in Analytics / Metrics Audit, but merchants still need to interpret what it means, decide what to fix first, and execute changes across Shipping Policies, docks, and warehouses.

The gap is not discovery alone. The gap is turning an existing diagnostic into a safe, guided fulfillment action.

---

## Jobs to be Done

This spec covers the **first wave of fulfillment actions** validated in VTEX Lab. These are not the only possible VTEX Lab tasks; they are the first two workflows ready to be translated from diagnostic signals into agent-guided action. Each has its own JTBD below.

### JTBD 1 — Add missing CEP coverage to Shipping Policies

**Persona:** Logistics Manager (primary) · E-commerce Manager (secondary)

> As a Logistics Manager, when Analytics shows repeated "cannot be delivered" failures in high-traffic CEPs for top-selling products, I want the agent to identify the geographic zone, sellers, and Shipping Policies that should serve each CEP and guide me through adding the missing coverage to the correct freight tables, so I can recover sales without manually tracing every policy and route.

**Diagnostic**
- Shipping simulations return **cannot be delivered** concentrated in specific CEPs
- Failures correlate with Shipping Policy coverage, route/zone configuration, seller scope, or Delivery Option eligibility — not obvious from the merchant UI
- The agent identifies the country and geographic zone for each CEP, then cross-references the sellers and Shipping Policies that already serve the surrounding area
- Metrics Audit metric: *"Analyzed the most frequent 'cannot be delivered' shipping simulations for top-selling products, prioritizing high-traffic zip codes with the most failures and highest SKU volume"*

**Action plan**

| Goal | Agent action | Expected impact |
| --- | --- | --- |
| Prioritize where to act | Rank CEPs × top SKUs × failure volume | Focus on gaps with highest commercial impact |
| Explain the cause | Relate failures to country, zone, seller, DO, Shipping Policy, and freight table | Merchant understands whether the fix is configuration vs. operation |
| Close the loop | Recommend the freight-table coverage change for each CEP × seller × Shipping Policy, with partial or bulk approval | Fewer checkout blocks in priority regions |

---

### JTBD 2 — Link docks, Shipping Policies, and warehouses / stock locations

**Persona:** Logistics Manager

> As a Logistics Manager, when A-curve products are in stock but cannot reach checkout because the logistics graph is broken, I want the agent to identify recent deactivations and missing warehouse / stock location–dock–sales channel–Shipping Policy links and guide me through fixing them, so available inventory becomes fulfillable again.

**Diagnostic**
- Top sellers in stock, but the chain **warehouse → dock → sales channel → Shipping Policy** is incomplete
- Warehouses with the most missing links and highest stock volume drive disproportionate risk
- The agent analyzes the entity-deactivation timeline, focuses on changes from the last 30 days, and ignores entities that have been inactive for longer
- Recent deactivations that affect high-selling products are presented in a reviewable table
- Metrics Audit metric: *"Validated warehouse-to-dock, dock-to-sales-channel, and dock-to-shipping-policy links for A-curve in-stock products, prioritizing the highest-stock warehouses with the most missing links"*

**Action plan**

| Goal | Agent action | Expected impact |
| --- | --- | --- |
| See what breaks | Audit links by warehouse, dock, channel, and policy | Clear view of configuration debt |
| Prioritize fixes | Rank recent deactivations and missing links by stock volume and SKU count affected | Merchant fixes highest-impact paths first |
| Restore paths | List affected SKUs; offer individual, partial, or bulk correction where automatable | A-curve products reachable again at checkout |

---

## Diagnostic baseline

The agent should not rebuild the Analytics / Metrics Audit diagnosis from scratch. The starting point is an existing diagnostic signal that already identifies suspicious patterns, such as:

- high-volume `cannot be delivered` failures concentrated in strategic CEPs;
- A-curve SKUs with inventory but incomplete routing links;
- warehouses, docks, or Shipping Policies disproportionately responsible for fulfillment failures.

The agent's role is to **interpret the diagnostic, explain the fulfillment cause, propose the safest action, and execute only after merchant confirmation**. It does not infer a missing target when the seller, Shipping Policy, freight table, dock, or sales channel relationship is ambiguous; it asks the merchant to resolve the ambiguity.

---

## API surface to illustrate execution

The final implementation should call fulfillment MCP tools, not raw APIs directly from the agent. Still, these are the Logistics API capabilities that illustrate the execution layer behind each task:

| Job | Merchant action | Relevant Logistics API capability |
| --- | --- | --- |
| Add missing CEP coverage | Update the freight table associated with the affected Shipping Policy and seller | Shipping Policy freight-table update capability — exact endpoint and payload to be confirmed by Engineering |
| Link dock to Shipping Policy | Add or update the dock configuration that connects the fulfillment point to eligible policies | [`POST /api/logistics/pvt/configuration/docks`](https://developers.vtex.com/docs/api-reference/logistics-api) — create/update dock |
| Link dock to warehouse / stock location | Update the warehouse with the correct `warehouseDocks` relationship | [`POST /api/logistics/pvt/configuration/warehouses`](https://developers.vtex.com/docs/api-reference/logistics-api) — create/update warehouse |
| Link dock to sales channel | Update the dock configuration with the approved sales-channel relationship | [`POST /api/logistics/pvt/configuration/docks`](https://developers.vtex.com/docs/api-reference/logistics-api) — create/update dock |

Engineering still needs to confirm the exact freight-table endpoint and payload shape. The product requirement is that CEP coverage is applied through the freight table associated with the selected Shipping Policy, and that the agent makes the CEP × zone × seller × policy × freight-table relationship explicit before applying any write.

---

## Opportunity

Both tasks reuse **deterministic diagnostics** already prototyped in Metrics Audit and VTEX Lab — packaged as **agent tasks / MCP tools** inside the Fulfillment Agent. They complement [Delivery Options spec 001](../../../delivery-options/specs/001-same-day-do-automation/product-brief.md): Same Day DO automation builds the DO structure for filters; this spec ensures the underlying logistics graph can actually fulfill.

---

## Relationship to the Fulfillment Agent

Same architecture as [Fulfillment Agent spec 001](../001-ai-workspace-backend-setup/product-brief.md) and Delivery Options Same Day automation: agent tasks live in [`vtex/fulfillment-agent`](https://github.com/vtex/fulfillment-agent), with logistics reads and writes mediated by MCP tools in `fulfillment-mcp-server`. These tasks may ship in parallel with Same Day automation in Q2C2.

---

## Scope (this release)

**Task 1 — Add CEP coverage from delivery failure diagnostics**
- Read shipping simulation failures (`cannot be delivered`) for top-selling products
- Prioritize high-traffic CEPs and highest SKU volume
- Identify the country and geographic zone associated with each CEP
- Identify and cross-reference the sellers, Shipping Policies, and freight tables that should cover each CEP
- Present ranked gaps with suspected cause (DO, policy, freight table, zone, or seller)
- Suggest one recommended freight-table coverage update per CEP; ask when the mapping is ambiguous rather than guessing
- Let the merchant edit and approve recommendations individually, partially, or in bulk
- Require explicit merchant confirmation before every write

**Task 2 — Validate and fix warehouse / dock / sales channel / policy links**
- Audit warehouse → dock, dock → sales channel, and dock → Shipping Policy relationships for A-curve in-stock products
- Analyze entity-deactivation history, focus on changes from the last 30 days, and ignore entities inactive for longer
- Present recent deactivations affecting high-selling products in a reviewable table
- Prioritize warehouses with most missing links and highest stock
- Surface affected SKUs and offer guided correction
- Let the merchant edit and approve corrections individually, partially, or in bulk
- Require explicit merchant confirmation before every write

### Review and execution model

The same contract applies in Admin v4 and AI Workspace:

1. the agent presents the target entity, current state, proposed state, rationale, and expected impact;
2. the merchant can edit, select, deselect, approve, or reject each action;
3. bulk execution includes only selected and explicitly approved actions;
4. the agent reports success, partial failure, blocked execution, and no-op results per item;
5. unapproved or ambiguous actions do not change merchant configuration.

---

## Out of scope

- Rebuilding the Analytics / Metrics Audit diagnostic engine. This release starts from existing diagnostic signals and focuses on interpretation and action.
- Automatic logistics writes without merchant confirmation. The agent can propose CEP coverage and dock / warehouse / Shipping Policy link changes, but every write requires explicit confirmation.
- Broad logistics configuration redesign beyond the two validated VTEX Lab jobs: adding CEP coverage and fixing warehouse / dock / sales channel / Shipping Policy relationships.

---

## Why now

VTEX Lab already validated merchant demand and Metrics Audit outputs for both tasks. They address **reliability before discovery**: filters and DOs only matter if products can actually ship.

---

## Success criteria

- The agent consumes an existing Analytics / Metrics Audit diagnostic and translates it into a ranked list of fulfillment actions without requiring the merchant to manually inspect raw logistics configuration.
- For CEP coverage gaps, the agent identifies the affected CEPs, country and geographic zone, top SKUs, seller scope, suspected root cause, and the specific Shipping Policy and freight table that need review.
- For broken routing links, the agent identifies the affected SKUs, warehouse / stock location, dock, sales channel, and Shipping Policy relationship that prevents available inventory from reaching checkout, including relevant deactivations from the last 30 days.
- Before any write, the agent shows the target entity, proposed change, expected impact, and rollback / no-op consequence clearly enough for the merchant to confirm or cancel.
- The merchant can edit and approve actions individually, partially, or in bulk; only selected actions are executed.
- At least one VTEX Lab sponsor merchant completes a first-wave action end to end: diagnostic reviewed, recommendation accepted, write executed, and fulfillment path or CEP coverage improved.
- No write action is executed without explicit merchant confirmation.
