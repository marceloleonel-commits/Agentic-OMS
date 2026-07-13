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

Merchants already configure delivery SLAs across sellers, shipping policies, and regions in VTEX — the data exists in the platform. What is missing is an **optimized Delivery Options layer** that packages those SLAs into options shoppers can use as **PLP filters** on the product listing page and search, including **same-day** and **next-day dynamic estimates**.

Today, turning SLAs into that structure requires an Operations Manager to manually regroup policies, define time targets, and enable **Use option as a filter on the store product listing page** — slow, error-prone work that most merchants never complete.

The result: logistics is configured, but **not exposed in navigation**. Shoppers cannot filter by delivery speed before checkout, and merchants leave conversion on the table.

---

## Initiative A — Optimize SLAs for navigation filters

**[Diagnostic] SLAs configured, Delivery Options not optimized for storefront filtering**  
**Spec:** 001 · **Priority:** Must-have · Q2C2

### Job to be done

As an **Operations Manager**, I want the agent to optimize how my existing SLAs — already configured across sellers and shipping policies in VTEX — are grouped into Delivery Options for **PLP filters** and **same-day / next-day dynamic estimates**, so shoppers can filter products by delivery speed during navigation and search and I can **improve conversion** without manually regrouping every shipping policy.

### Diagnostic

> "Your account has **{N} SLAs** configured across sellers and shipping policies, but only **{M} Delivery Options** are set up as **PLP filters**. Shoppers cannot yet self-segment by delivery speed on listing and search — including **same-day** and **next-day** dynamic estimates powered by Delivery Promise."

**What the agent checks**
- SLA data is present in VTEX (sellers, policies, carriers, regions) but not packaged into a small set of strategic DOs
- **PLP filter** flag and **time targets** are missing or misaligned — so Intelligent Search filters and dynamic estimates do not reflect the merchant's real speed tiers
- Merchant cannot explain which policies belong in which bucket (e.g., "up to 2h" vs standard) or whether a bucket qualifies for same-day given cutoff + warehouse + dock + delivery time

### Action plan

**Goal:** Group existing SLAs into up to 3 Delivery Options configured for **storefront navigation filters**.

**Suggested action:** Run SLA normalization (Clara's rules) → present 1–3 DO suggestions with adaptive labels, time targets, eligible policies, and rationale — **PLP filter recommended on** where applicable.

**Proposed structure (per suggested DO)**

| Field | Logic |
| --- | --- |
| Name | Adaptive label from SLA bucket (e.g., "up to 2h", "up to 4h") — editable |
| Time target | Derived from SLA bucket + store hours + cutoff (warehouse + dock + delivery time) |
| Type | Delivery and/or pickup (merchant may prioritize 2 delivery + 1 pickup) |
| PLP filter | **Use option as a filter on the store product listing page** — recommended on create |
| Status on create | Inactive — merchant activates when ready |
| Rationale | Policies, routes, carriers, cutoff breakdown |

**Option 1 — Confirm DO for navigation filtering**  
- **Condition:** Merchant accepts label, time target, and PLP filter recommendation.  
- **Execution:** Agent creates DO via MCP tool after confirmation.  
- **Expected impact:** Shoppers filter PLP/search by that speed tier; eligible for **dynamic-estimate** same-day / next-day when DP is active.

**Option 2 — Edit time bucket before confirm**  
- **Condition:** Merchant changes time target or label.  
- **Execution:** Agent recalculates which policies/routes move in or out of the bucket → merchant confirms → create.  
- **Expected impact:** Filter reflects a conscious trade-off, not a blind default.

**Option 3 — Export SLA analysis only**  
- **Condition:** Merchant wants visibility before creating any DO.  
- **Execution:** Agent delivers normalized SLA report / suggestion view; no write.  
- **Expected impact:** Merchant aligns ops and ecommerce on speed tiers before activating filters.

**Platform context:** Each DO can enable **Use option as a filter on the store product listing page** ([Delivery Options Beta](https://help.vtex.com/en/docs/tutorials/delivery-options-beta)). **Dynamic estimates** (`same-day`, `next-day`) resolve at search time from logistics + browsing time ([Delivery Promise for headless](https://developers.vtex.com/docs/guides/delivery-promise-for-headless-stores)). Q2C2 starts with **intraday / Same Day-eligible buckets**; the same pattern extends to Standard and Next Day over time.

> **PRD note:** Full agent PRD (vision, end-to-end flow, additional initiatives) can live in a separate doc — this section follows the Promotions Agent PRD initiative format.

---

## Business rationale

Merchants already invest in logistics configuration in VTEX. The gap is **how that configuration is packaged for discovery**: well-grouped DOs with PLP filters let shoppers self-segment by delivery speed during navigation and search — a lever for **conversion** before checkout.

Delivery Options are indexed by **Delivery Promise**, so activating DOs with PLP filter enabled improves Intelligent Search filtering without custom storefront integration.

---

## Opportunity

Clara's script already pulls and normalizes the merchant's existing SLA data — delivery deadlines by carrier, shipping policy, and region. This data is sufficient to deterministically identify which routes support intraday or next-cutoff delivery and auto-generate a Same Day Delivery Option with minimal merchant input.

This is the shortest path to delivering an automated configuration experience — and **a scope owned by the Fulfillment Agent through its Delivery Options sub-agent**. It must not be built as a standalone workflow outside the agent.

---

## Relationship to the Fulfillment Agent

**This scope belongs to the Fulfillment Agent — not a parallel track.** Same Day DO automation lives inside the agent architecture defined in [Fulfillment Agent spec 001](../../../fulfillment-agent/specs/001-ai-workspace-backend-setup/product-brief.md) and [ADR-001](../../../fulfillment-agent/specs/001-ai-workspace-backend-setup/ADR-001-fulfillment-agent.html): `fulfillment-config-agent` (Orchestrator + `delivery-options` sub-agent) and `fulfillment-mcp-server` (MCP tools for Logistics APIs). It may ship alongside other agent tasks in Q2C2 (e.g., [VTEX Lab Fulfillment Actions — First Wave](../../../fulfillment-agent/specs/002-vtex-lab-fulfillment-actions-first-wave/product-brief.md)) — sequencing is an engineering decision, not a product constraint.

**Deterministic does not mean non-agentic.** The agent can invoke fully deterministic tools — rule-based SLA normalization, Same Day suggestion, DO creation — and present structured output to the merchant. It can also walk the merchant through the same flow conversationally. Both are valid agent behaviors. What matters is **scope ownership**: this workflow is executed by the agent, not by a standalone script, cron job, or microservice built outside it.

**Product constraint (non-negotiable):**

- SLA normalization, Same Day analysis, suggestion generation, and DO creation ship as **agent tasks / MCP tools** callable by the orchestrator
- Logistics reads and writes go through **MCP tools** in `fulfillment-mcp-server`
- Clara's script logic is the **business rules** embedded in the agent's tool layer — not a separate product outside the agent

**What expands within the same agent scope over time:**

- Additional interaction modes (structured review-and-confirm, conversational guidance, proactive notifications)
- Multi-type DO generation beyond Same Day (Standard, Next Day, Pickup)
- Richer reasoning context as the agent matures — without moving this workflow outside the agent

**Evolution path:**

1. **Prerequisite:** AI Workspace backend setup — [Fulfillment Agent spec 001](../../../fulfillment-agent/specs/001-ai-workspace-backend-setup/product-brief.md)
2. **This release (Q2C2):** Same Day DO automation as agent scope — [spec 001](.) (may ship in parallel with other agent tasks)
3. **Next:** first-wave VTEX Lab fulfillment actions (e.g., logistics unavailability detection) — [Fulfillment Agent spec 002](../../../fulfillment-agent/specs/002-vtex-lab-fulfillment-actions-first-wave/product-brief.md)
4. **Future:** same agent, broader DO types and interaction modes — no reimplementation outside the agent

See the [Design doc — Agentic experience for Delivery Options](https://docs.google.com/document/d/1XHLPdChfUZd9iqomJgEdQJtr7hUIfCpsVdomJ2BSLVw) and [product-vision.md](../../product-vision.md) for the full strategic context.

---

## Target persona

**Operations Manager** at a Tier 1 merchant with SLAs already configured across sellers and shipping policies — who wants to **optimize Delivery Options for PLP filters** (and same-day / next-day dynamic estimates) to improve navigation and conversion, without manually regrouping policies.

---

## Scope (this release)

The core job of this release is to **read, normalize, and optimize SLA data already in VTEX** — from the main account and all sellers — and turn it into Delivery Option suggestions configured for **PLP navigation filters**. The merchant's logistics is configured; the agent packages it for storefront discovery.

Concretely — delivered as **agent tasks** in the `delivery-options` sub-agent:

- **MCP tool:** read and normalize SLA data across the main account and its sellers (Clara's normalization rules as the business logic layer)
- **Agent task:** identify shipping policies and carriers with ≤1-day effective delivery time, accounting for each store's cutoff time
- **Agent task:** group eligible routes into suggested Delivery Options with **adaptive labels** derived from actual time buckets (e.g., "up to 1h", "up to 2h", "up to 4h") — not a fixed "Same Day" label
- **Agent task:** generate 1–3 suggested DOs per merchant depending on SLA distribution
- **Agent task output:** transparent rationale with the underlying carrier, route, and cutoff data — so the merchant understands how VTEX arrived at each suggestion
- **Agent task + UI:** present suggestions for merchant review; merchant can confirm or discard each individually
- **MCP tool:** on confirmation, create the Delivery Option(s) with **PLP filter enabled** where applicable (inactive by default until merchant activates)

**Agent-owned scope.** The Same Day suggestion uses deterministic rules (Clara's normalization logic) — and that is a valid agent pattern. The agent invokes these rules on request and surfaces structured suggestions for merchant review, or guides the merchant through the same flow conversationally in Admin v4 or AI Workspace.

**Prerequisite:** [Fulfillment Agent spec 001](../../../fulfillment-agent/specs/001-ai-workspace-backend-setup/product-brief.md) (AI Workspace backend) must be provisioned before this task can deploy.

**The focus is 100% on SLA.** Pricing configuration for the Same Day option is out of scope.

---

## Out of scope

- Pricing configuration for the Same Day option (handled separately by Delivery Pricing)
- Storefront display configuration (handled by Delivery Promise)
- Building this workflow outside the Fulfillment Agent — standalone script, cron job, or microservice outside `fulfillment-config-agent` / `fulfillment-mcp-server` (see [Relationship to the Fulfillment Agent](#relationship-to-the-fulfillment-agent))
- Standard or Next Day DO generation (intraday filter only in this release)
- Automatic reconfiguration of existing DOs when delivery times change (detection + notification is in scope; auto-apply is not)

---

## Why now

There is a clear and immediate opportunity: several merchants already have intraday SLAs configured across sellers and policies, and have Delivery Promise active — but have not optimized **Delivery Options as PLP filters**. Their speed tiers exist in logistics but are **invisible in navigation** — missing conversion from same-day / next-day dynamic estimates.

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
| DrogariasPacheco / Drogaria Catarinense | 1–6h highly granular — complex suggestion |

This scope is being executed by Derek/mission team in Q2C2, leveraging work already in progress by Clara. It is **owned by the Fulfillment Agent's Delivery Options sub-agent** — deterministic tools and conversational guidance are both in-bounds; a standalone implementation outside the agent is not.

---

## Success criteria

- 1 merchant with at least one Same Day Delivery Option generated as an inactive draft in Q2C2
- Merchant confirms the suggested DO without manual corrections in ≥70% of runs
