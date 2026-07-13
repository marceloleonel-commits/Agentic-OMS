# Product Spec — VTEX Lab Fulfillment Actions — First Wave

| Field | Value |
| --- | --- |
| **Spec** | 002 — VTEX Lab Fulfillment Actions — First Wave |
| **Author** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Last updated** | Jul 2026 |

---

## Context

This spec covers the first wave of VTEX Lab fulfillment actions that live within the Fulfillment Agent. These run on top of the AI Workspace infrastructure provisioned in spec 001 and complement the deterministic Same Day DO automation from Delivery Options spec 001.

The relevant diagnostic already exists in Analytics / Metrics Audit. The agent should not be scoped as a new diagnostics engine from zero. Its job is to interpret the diagnostic, explain the fulfillment root cause, recommend the safest correction, and execute only the actions explicitly approved by the merchant. This contract is the same in Admin v4 and AI Workspace.

---

## Agent jobs

### Job 1 — Add missing CEP coverage to Shipping Policies

**Input signal:** high-volume `cannot be delivered` failures for top-selling products, concentrated in strategic CEPs.

**Agent responsibility:**
- Read the diagnostic result from Analytics / Metrics Audit or the MCP tool that exposes it.
- Identify the country and geographic zone associated with each CEP.
- Identify which sellers and Shipping Policies serve the surrounding area and should cover each CEP.
- Cross-reference the CEP with Delivery Option, route, seller, Shipping Policy, and freight-table coverage to locate the gap.
- Explain the commercial impact using failure volume, SKU relevance, and CEP priority.
- Propose one recommended freight-table coverage update for each CEP × seller × Shipping Policy combination.
- Ask the merchant to resolve ambiguous mappings rather than guessing.
- Support editing, partial selection, individual approval, and bulk approval before applying writes.

**Expected execution layer:**
- Shipping Policy freight-table update capability exposed through the fulfillment MCP server.
- Engineering must confirm the exact endpoint and payload. The product contract is that coverage changes are applied to the freight table associated with the selected Shipping Policy, not an unspecified policy field.

### Job 2 — Link docks, Shipping Policies, and warehouses / stock locations

**Input signal:** A-curve SKUs have inventory, but the fulfillment path is broken because warehouse / stock location, dock, sales channel, and Shipping Policy relationships are incomplete or were recently deactivated.

**Agent responsibility:**
- Read the diagnostic result from Analytics / Metrics Audit or the MCP tool that exposes it.
- Read the entity-deactivation timeline, focus on changes from the last 30 days, and ignore entities inactive for longer.
- Present recent deactivations affecting high-selling products in a reviewable table.
- Identify missing dock-to-Shipping Policy, dock-to-sales-channel, and warehouse / stock location-to-dock relationships.
- Prioritize fixes by stock volume, affected SKUs, seller scope, and potential checkout impact.
- Propose the minimum relationship changes needed to restore a valid fulfillment path.
- Support editing, partial selection, individual approval, and bulk approval before applying writes.

**Expected execution layer:**
- [`POST /api/logistics/pvt/configuration/docks`](https://developers.vtex.com/docs/api-reference/logistics-api) — create/update dock, including Shipping Policy relationships where applicable.
- [`POST /api/logistics/pvt/configuration/warehouses`](https://developers.vtex.com/docs/api-reference/logistics-api) — create/update warehouse, including `warehouseDocks` relationships.

---

## Functional requirements

| ID | Requirement |
| --- | --- |
| FR-001 | The agent must consume existing Analytics / Metrics Audit diagnostic output instead of recalculating the full diagnosis from scratch. |
| FR-002 | The agent must translate each diagnostic into a concrete fulfillment action: update freight-table CEP coverage, link dock to Shipping Policy, link dock to sales channel, or link dock to warehouse. |
| FR-003 | For each CEP gap, the agent must show the country, geographic zone, affected SKUs, failure volume, seller scope, recommended Shipping Policy, associated freight table, and suspected root cause. |
| FR-004 | For each routing gap, the agent must show the affected SKU, stock volume, warehouse, dock, sales channel, Shipping Policy, seller scope, and any relevant deactivation from the last 30 days. |
| FR-005 | The agent must require explicit merchant confirmation before any write action. |
| FR-006 | The agent must execute write actions through fulfillment MCP tools, even if the underlying capability maps to Logistics API endpoints. |
| FR-007 | The agent must report success, partial failure, or blocked execution with enough detail for the merchant or support team to continue. |
| FR-008 | The merchant must be able to edit, select, deselect, approve, or reject each proposed action individually. |
| FR-009 | The merchant must be able to approve and execute multiple selected actions in bulk within one interaction. |
| FR-010 | Partial approval must execute only selected actions; rejected, unselected, or ambiguous actions must remain unchanged. |
| FR-011 | The agent must not guess a seller, Shipping Policy, freight table, dock, or sales channel relationship when more than one valid mapping exists. |
| FR-012 | Routing diagnostics must ignore entities inactive for more than 30 days and present recent deactivations that affect high-selling products. |
| FR-013 | Admin v4 and AI Workspace must consume the same structured action-plan contract and enforce the same confirmation boundaries. |

---

## Non-goals

- Building a new Analytics / Metrics Audit replacement.
- Applying logistics writes automatically without confirmation.
- Broad logistics configuration redesign beyond the two validated first-wave actions: adding CEP coverage and fixing warehouse / dock / sales channel / Shipping Policy relationships.

---

## Strategic reference

Fulfillment Agent roadmap:

1. **Delivery Options spec 001 (Q2C2):** Same Day DO automation — deterministic SLA extraction and DO suggestion
2. **Fulfillment Agent spec 001 (Q2C2):** AI Workspace backend setup — infrastructure for agent hosting
3. **This spec:** VTEX Lab Fulfillment Actions — First Wave
4. **V2:** interactive freight-table diff, column/unit mapping, and confirmed correction
