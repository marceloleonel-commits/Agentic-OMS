# Product Brief — Same Day DO Automation

| Field | Value |
| --- | --- |
| **Spec** | 001 — Same Day DO Automation |
| **Module path** | fulfillment / delivery-options |
| **Pillar** | Fulfillment / Agentic Configuration |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | Coming Soon — Q2C2 2026 |
| **Team** | Mission Team (Derek) + Fulfillment (Clara's script) |

**Related assets:**
- [Design doc — Agentic experience for Delivery Options](https://docs.google.com/document/d/1XHLPdChfUZd9iqomJgEdQJtr7hUIfCpsVdomJ2BSLVw) — Amanda Bueno
- [Briefing Q2C2 — Agente Delivery Options](https://vtex.enterprise.slack.com/archives/D05JWM4L135/p1778880304671999) — Carol → Julia

---

## Problem

Merchants who want to offer Same Day delivery have no automated way to identify which of their existing shipping policies and SLAs can support it. Today, creating a Same Day Delivery Option requires a Logistics Operations Manager to manually inspect carrier configurations, estimate coverage, define time targets, and create the DO by hand — a process that is error-prone, time-consuming, and inaccessible to merchants without deep logistics knowledge.

The result: merchants either skip Same Day altogether or configure it incorrectly, leading to checkout promises that cannot be fulfilled.

**Job to be done:** Discover which routes in my operation already support Same Day and convert that into activatable Delivery Options without a manual logistics audit.

---

## Business rationale

We believe that properly configuring Same Day Delivery Options directly increases checkout conversion — shoppers who see a precise, credible Same Day option are more likely to complete the purchase. This is the core business bet behind prioritizing DO setup automation.

On the infrastructure side, this investment is well-positioned: Delivery Options are already indexed by Delivery Promise (DP), so merchants who activate DOs automatically improve the quality and precision of the delivery options displayed at checkout — without additional integration work.

---

## Opportunity

Clara's script already pulls and normalizes the merchant's existing SLA data — delivery deadlines by carrier, shipping policy, and region. This data is sufficient to deterministically identify which routes support intraday or next-cutoff delivery and auto-generate a Same Day Delivery Option with minimal merchant input.

This is the shortest path to delivering an automated configuration experience — and **a scope owned by the Delivery Options Agent**. It must not be built as a standalone workflow outside the agent.

---

## Relationship to the Delivery Options Agent

**This scope belongs to the Delivery Options Agent — not a parallel track.** Same Day DO automation lives inside the agent architecture defined in [spec 002](../002-ai-workspace-backend-setup/product-brief.md) and [ADR-001](../002-ai-workspace-backend-setup/ADR-001-fulfillment-agent.html): `fulfillment-config-agent` (Orchestrator + `delivery-options` sub-agent) and `fulfillment-mcp-server` (MCP tools for Logistics APIs). It may ship alongside other agent tasks in Q2C2 (e.g., spec 003) — sequencing is an engineering decision, not a product constraint.

**Deterministic does not mean non-agentic.** The agent can invoke fully deterministic tools — rule-based SLA normalization, Same Day grouping, DO creation — and present structured output to the merchant. It can also walk the merchant through the same flow conversationally. Both are valid agent behaviors. What matters is **scope ownership**: this workflow is executed by the agent, not by a standalone script, cron job, or microservice built outside it.

**Implementation constraint (non-negotiable):**

- SLA normalization, Same Day analysis, suggestion generation, and DO creation ship as **agent tasks / MCP tools** callable by the orchestrator
- Logistics reads and writes go through **MCP tools** in `fulfillment-mcp-server`
- Clara's script logic is the **business rules** embedded in the agent's tool layer — not a separate product outside the agent

**What expands within the same agent scope over time:**

- Additional interaction modes (structured review-and-confirm, conversational guidance, proactive notifications)
- Multi-type DO generation beyond Same Day (Standard, Next Day, Pickup)
- Richer reasoning context as the agent matures — without moving this workflow outside the agent

**Evolution path:**

1. **Prerequisite:** AI Workspace backend setup — [spec 002](../002-ai-workspace-backend-setup/product-brief.md)
2. **This release (Q2C2):** Same Day DO automation as agent scope — [spec 001](.) (may ship in parallel with other agent tasks)
3. **Next:** additional agent tasks (e.g., logistics unavailability detection) — [spec 003](../003-vtex-lab-agent-tasks/product-brief.md)
4. **Future:** same agent, broader DO types and interaction modes — no reimplementation outside the agent

See the [Design doc — Agentic experience for Delivery Options](https://docs.google.com/document/d/1XHLPdChfUZd9iqomJgEdQJtr7hUIfCpsVdomJ2BSLVw) and [product-vision.md](../../product-vision.md) for the full strategic context.

---

## Target persona

**Logistics Operations Manager** at a Tier 1 merchant with at least one carrier operating intraday or express routes — who wants to offer Same Day at checkout but does not have bandwidth to configure it manually.

---

## Scope (this release)

The core job of this release is to **automate and simplify the extraction and normalization of SLA data** — from the main account and all sellers — and turn it into the visibility needed to generate Same Day Delivery Option suggestions. Today, this data exists in the platform but is scattered, un-normalized, and not actionable without manual work.

Concretely — delivered as **agent tasks** in the `delivery-options` sub-agent:

- **MCP tool:** read and normalize SLA data across the main account and its sellers (Clara's normalization rules as the business logic layer)
- **Agent task:** identify shipping policies and carriers with ≤1-day effective delivery time, accounting for each store's cutoff time
- **Agent task:** group eligible routes into suggested Delivery Options with **adaptive labels** derived from actual time buckets (e.g., "up to 1h", "up to 2h", "up to 4h") — not a fixed "Same Day" label
- **Agent task:** generate 1–3 suggested DOs per merchant depending on SLA distribution
- **Agent task output:** transparent rationale with the underlying carrier, route, and cutoff data — so the merchant understands how VTEX arrived at each suggestion
- **Agent task + UI:** present suggestions for merchant review; merchant can confirm or discard each individually
- **MCP tool:** on confirmation, create the Delivery Option(s) in the system (inactive by default)

**Agent-owned scope.** The Same Day grouping uses deterministic rules (Clara's normalization logic) — and that is a valid agent pattern. The agent invokes these rules as tools and surfaces structured suggestions for merchant review, or guides the merchant through the same flow conversationally. The automation runs at a defined frequency to keep the SLA map per merchant updated and notify merchants when their configuration changes in a way that affects existing DOs.

**Prerequisite:** [spec 002](../002-ai-workspace-backend-setup/product-brief.md) (AI Workspace backend) must be provisioned before this task can deploy.

**The focus is 100% on SLA.** Pricing configuration for the Same Day option is out of scope.

---

## Out of scope

- Pricing configuration for the Same Day option (handled separately by Delivery Pricing)
- Storefront display configuration (handled by Delivery Promise)
- Building this workflow outside the Delivery Options Agent — standalone script, cron job, or microservice outside `fulfillment-config-agent` / `fulfillment-mcp-server` (see [Relationship to the Delivery Options Agent](#relationship-to-the-delivery-options-agent))
- Standard or Next Day DO generation (intraday filter only in this release)
- Automatic reconfiguration of existing DOs when delivery times change (detection + notification is in scope; auto-apply is not)

---

## Why now

There is a clear and immediate opportunity: several merchants in our base already have Same Day delivery capability configured in their logistics, and have Delivery Promise active — but have not yet set up Delivery Options. This means their Same Day routes exist but are invisible at checkout.

Known accounts in this situation, identified from Clara's SLA analysis (May 2026):

| Account | Same Day profile |
| --- | --- |
| Fastshopbr | 3h delivery, closes 18h — 1 DO |
| Cobasi | 1–4h delivery — up to 2 DOs |
| OsklenBr | 3h and 8h delivery — 2 DOs |
| ZonaSul | 30min ("Entrega Já") + 2–4h ("Mais Rápido") — 1–2 DOs |
| Americanas | 0h (intraday) — 1 DO |
| Auchan | 1–2h majority, closes 21h — 2–3 DOs |
| HMartus | 0h delivery — 1 DO |
| PagueMenos / SjDigital | 1–6h granular — up to 3 DOs |
| DrogariasPacheco / Drogaria Catarinense | 1–6h highly granular — complex grouping |

This scope is being executed by Derek/mission team in Q2C2, leveraging work already in progress by Clara. It is **owned by the Delivery Options Agent** — deterministic tools and conversational guidance are both in-bounds; a standalone implementation outside the agent is not.

---

## Success criteria

- 1 merchant with at least one Same Day Delivery Option auto-generated and activated in Q2C2
- Merchant confirms the suggested DO without manual corrections in ≥70% of runs
