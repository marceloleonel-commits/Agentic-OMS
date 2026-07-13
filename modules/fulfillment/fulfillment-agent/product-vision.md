# Product Vision — Fulfillment Agent

| Status | Draft | Owner(s) | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
|---|---|---|---|
| Created | Jul 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Channel | #dom-product-vertical | Module | Fulfillment |

---

## TL;DR

The Fulfillment Agent analyzes the merchant's real delivery behavior across Shipping Policies, Delivery Promise, Orders, sellers, warehouses, docks, and inventory to detect anomalies and recommend the most effective fulfillment actions. It starts by optimizing Delivery Options and resolving known configuration failures, then executes approved changes through safe, auditable workflows.

## Vision

Every Ecommerce Manager or Logistics Manager should be able to describe the fulfillment outcome they want, understand what in their current configuration or observed delivery behavior prevents it, and apply the right changes with confidence. The agent turns scattered logistics primitives and operational signals into editable action plans that reduce investigation time, prevent configuration mistakes, and make fulfillment behavior easier to govern at enterprise scale.

The experience is available through both Admin v4 and AI Workspace. In either channel, the agent:

1. identifies risks and opportunities from predefined diagnostics and VTEX data;
2. explains the root cause and commercial impact;
3. proposes an editable action plan;
4. lets the merchant approve actions individually, partially, or in bulk;
5. executes only the approved changes and reports the result per item.

## Initial Scope

- Provision the AI Workspace backend and MCP server foundation for fulfillment configuration workflows.
- Host Delivery Options agent tasks, including Same Day Delivery Option automation.
- Expand into VTEX Lab-validated diagnostics such as delivery unavailability in high-traffic zip codes and broken warehouse-dock-channel-policy links.
- Preserve merchant editing, partial approval, and confirmation gates before write actions.

## Non-Goals

- Replace the underlying Logistics APIs.
- Own the Delivery Options product vision itself.
- Automatically reconfigure merchant logistics without explicit confirmation.

## Evolution

- **V1 Eng — Delivery Options:** analyze SLA buckets and active routes, classify Same Day eligibility, suggest up to three Delivery Options with adaptive labels, and create approved options as inactive drafts.
- **V1 Lab — Fulfillment actions:** add missing CEP coverage to the appropriate freight tables and repair warehouse–dock–Shipping Policy–sales channel relationships from predefined diagnostics.
- **V2 — Freight table correction:** compare a merchant's freight table with the official VTEX template, explain structural differences, guide ambiguous column and unit mappings, and apply the corrected table only after approval.

## Related Features

- Delivery Options: `../delivery-options/product-vision.md`
- Same Day DO Automation: `../delivery-options/specs/001-same-day-do-automation/product-brief.md`
