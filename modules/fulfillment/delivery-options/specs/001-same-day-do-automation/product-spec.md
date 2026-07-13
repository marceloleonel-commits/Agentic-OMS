# Product Spec — Same Day DO Automation

| Field | Value |
| --- | --- |
| **Spec** | 001 — Same Day DO Automation |
| **Author** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Last updated** | May 2026 |

---

## Clarifications

**Why rule-based automation for Same Day grouping?**
Q2C2 ships **Derek's automation** as the deterministic engine for this workflow: SLA normalization (Clara's rules), Same Day eligibility analysis, grouping, and suggestion generation. The pipeline is rule-based — no LLM inference required for the core logic. That automation is productized as **agent tasks / MCP tools** inside the Fulfillment Agent's Delivery Options sub-agent; the agent invokes it and presents structured output (or guides the merchant through the same flow). **Being deterministic does not make it non-agentic** — this is the agent delivery for this release, not a temporary path before "real AI."

**Why does this scope belong to the agent?**
Same Day DO automation must live in the Fulfillment Agent — whether the agent invokes a rule-based tool and presents structured output, or walks the merchant conversationally through the same workflow. The agent owns the scope; interaction mode and reasoning style are implementation choices within that boundary. Implementation follows [Fulfillment Agent spec 001](../../../fulfillment-agent/specs/001-ai-workspace-backend-setup/product-brief.md) and [ADR-001](../../../fulfillment-agent/specs/001-ai-workspace-backend-setup/ADR-001-fulfillment-agent.html): agent tasks in `fulfillment-config-agent` (`delivery-options` sub-agent), logistics reads/writes via MCP tools in `fulfillment-mcp-server`.

**What is "Same Day" in this context?**
A shipping policy is classified as Same Day-eligible if its **effective fulfillment time** is ≤1 business day for at least one active route. Effective fulfillment time is the sum of **warehouse time + dock time + delivery time** (carrier SLA) — not delivery time alone. Eligibility also considers the carrier's cutoff time and store operating hours. Merchants may have partial Same Day coverage (e.g., SP capital only) — the suggestion should reflect actual coverage, not theoretical maximum.

**What is the store hours + SLA constraint, and why does it matter?**
Same Day delivery in VTEX respects both the store's closing time (when it stops accepting orders for the day) and the **total fulfillment time** for each route. Total fulfillment time is **warehouse time + dock time + delivery time** — not delivery time in isolation. For example: if a store closes at 19:00 and total fulfillment time is 2h, after 17:01 the Same Day filter will no longer surface products from that store — because the order can no longer be fulfilled in time. This is existing platform behavior that will not be changed by this release. What we are automating is the analysis of this constraint across all routes and stores, so merchants understand their actual Same Day coverage window per location before deciding which DOs to create.

**How many DOs are suggested?**
Today we suggest **up to 3 DOs maximum** per merchant — the exact count depends on SLA distribution. **Grocery and pharmacy** merchants tend to have the richest profiles: many distinct delivery routes under one day (e.g., 1h, 2h, 4h buckets) **and** pickup (retirada) routes in the same operation. Apparel and general retail usually have fewer intraday buckets (often 1–2 delivery DOs). The merchant chooses what to prioritize — for example, **2 delivery DOs + 1 pickup DO**, or 3 delivery DOs if pickup is not the focus. Grouping logic consolidates granular SLAs into at most 3 suggestions, balancing precision with practical usability. See [Clara's analysis from May 8](https://vtex.enterprise.slack.com/archives/C0ABAPHQQCX/p1778253281183659) for per-merchant breakdown.

**Why adaptive labels instead of "Same Day"?**
Merchants have very different intraday realities: "Same Day" means 30min at ZonaSul and 8h at OsklenBr. A fixed label misrepresents the actual promise to shoppers. Labels are derived from the actual time bucket (e.g., "up to 2h", "up to 4h") and can be edited by the merchant before activation.

**How should merchants trust the suggestion?**
Merchants like Hering and Reserva believed they had many different delivery times but had only one when actually checked. The UI must explain how VTEX arrived at the suggestion — showing the underlying carrier data, routes, and cutoff times that drove each grouping. An export option (e.g., downloadable report) adds an additional trust layer.

**What is the priority order — data first or DO creation first?**
The primary deliverable of this release is the data and visibility layer: normalized SLA extraction, analysis, and suggestion presentation. DO creation (on confirmation) is the follow-on step. The system must be useful even if a merchant reviews the analysis and decides not to create any DOs yet. Creation is the conversion moment, but the insight is the core value.

**What does "confirm" mean for the merchant?**
The merchant reviews the suggestion (adaptive label, time target, coverage, eligible policies, rationale) and confirms. No form-filling required. Name and time target are editable before confirming. Each suggested DO can be confirmed or discarded independently.

**How is the automation triggered?**
The merchant requests the analysis through Admin v4 or AI Workspace. The agent reads the current configuration for that run and returns an action plan for review. Proactive background analysis and notifications are future interaction modes, not requirements for this release.

---

## User stories

**US-001 — Identify Same Day eligibility**
As a Logistics Operations Manager, I want the system to analyze my existing carrier and SLA configuration so that I can see which routes support Same Day delivery without having to check each shipping policy manually.

**US-002 — Review suggested Delivery Option**
As a Logistics Manager, I want to review the suggested Same Day DO — including name, time target, coverage, and eligible policies — before it is created as an inactive draft, so that I can confirm it reflects my operation accurately.

**US-003 — Create an inactive draft with one action**
As a Logistics Manager, I want to create the approved Same Day DO as an inactive draft in a single confirmation step, so that I can review its sales-channel activation separately without rebuilding the configuration manually.

**US-004 — Discard suggestion**
As a Logistics Operations Manager, I want to be able to discard the suggestion if it doesn't match my needs, without any unintended changes to my configuration.

---

## Implementation requirements (agentic architecture)

| ID | Requirement |
| --- | --- |
| IR-001 | Same Day DO automation must ship as agent tasks in `fulfillment-config-agent/agents/delivery-options/`, callable by the orchestrator |
| IR-002 | All Logistics API reads and writes must go through MCP tools in `fulfillment-mcp-server` — no direct API calls from agent tasks bypassing MCP |
| IR-003 | Clara's SLA normalization rules must be embedded in the agent task / MCP tool layer — not productized as a standalone service outside the agent |
| IR-004 | Agent task outputs must include structured rationale (carriers, routes, cutoff times) consumable by structured UI or conversational agent interaction — both are agent-delivered experiences |
| IR-005 | Deployment, observability, and credentials must follow the AI Workspace standard provisioned in Fulfillment Agent spec 001 |

---

## Functional requirements

### Data analysis (backstage — agent tasks + MCP tools)

| ID | Requirement |
| --- | --- |
| FR-001 | The agent must pull the merchant's active shipping policies, carrier SLAs, and cutoff times via MCP tools, applying Clara's normalization rules in the agent task layer |
| FR-002 | The system must separate delivery routes from pickup routes before analysis |
| FR-003 | The system must classify each route as Same Day-eligible if effective fulfillment time (warehouse time + dock time + delivery time) is ≤1 business day, considering the carrier's cutoff time and store operating hours |
| FR-004 | The system must calculate coverage for Same Day-eligible routes (postal code zones or regions) |
| FR-005 | The system must group Same Day-eligible policies into time buckets and suggest 1–3 Same Day DOs maximum per merchant (platform limit is 20 DOs total; Same Day cap is 3) |
| FR-006 | The grouping algorithm must consolidate routes by cutoff time to minimize the number of DOs while preserving meaningful precision (e.g., routes closing at 20:45 vs. 18:00 should not be merged if the time loss is significant) |
| FR-007 | The system must run on demand when requested through Admin v4 or AI Workspace and use the current logistics configuration for each analysis |

### Suggestion (frontstage)

| ID | Requirement |
| --- | --- |
| FR-008 | The system must present 1–N suggested DOs, each with: adaptive label (e.g., "up to 2h"), time target, eligible shipping policies, coverage estimate, and grouping rationale |
| FR-009 | The rationale must show the underlying data that drove the suggestion (carriers, routes, warehouse/dock/delivery time breakdown, cutoff times) — not just the conclusion |
| FR-010 | The merchant must be able to edit the label and time target of each suggestion before confirming |
| FR-011 | Each suggested DO must be independently confirmable or discardable |
| FR-012 | If no Same Day-eligible routes are found, the system must inform the merchant and explain why (e.g., "No active carrier supports intraday delivery in your current configuration") |
| FR-013 | Re-running the analysis must show current suggestions and explain material differences from Delivery Options that already exist |

### Activation

| ID | Requirement |
| --- | --- |
| FR-014 | On confirmation, the system must create the Delivery Option via the Delivery Options API |
| FR-015 | On confirmation, the created DO must be inactive by default — the merchant must explicitly activate it for a sales channel |
| FR-016 | On discard, no changes must be made to the merchant's configuration |

---

## Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-001 | Given a merchant with at least one carrier with ≤1-day SLA, when the automation runs, then 1–N DO suggestions are presented, each with adaptive label, time target, coverage, eligible policies, and grouping rationale |
| AC-002 | Given a suggestion is presented, when the merchant confirms one or more DOs, then those DOs are created via API and appear in the merchant's DO list as inactive |
| AC-003 | Given a suggestion is presented, when the merchant discards a suggestion, then no DO is created for that suggestion and the merchant's configuration is unchanged |
| AC-004 | Given a merchant with no Same Day-eligible routes, when the automation runs, then the merchant receives an explanation (no suggestion offered) |
| AC-005 | Given the merchant edits the suggested label or time target, when they confirm, the created DO reflects the edited values |
| AC-006 | Given the merchant requests a new analysis after configuration changes, then the suggestions use current data and explain material differences from existing DOs |
| AC-007 | Given the underlying SLA data behind a suggestion, the merchant can view the carriers, routes, and cutoff times that drove the grouping |

---

## Assumptions

- Clara's normalization script will be productized (API or callable service) as part of this release — this is a **required engineering task**, not a pre-existing dependency
- The Delivery Options API supports programmatic creation of DOs (not just UI-based configuration)
- Cutoff time data is available per carrier in the existing logistics configuration
- The merchant has at least one active shipping policy to analyze

---

## Open decisions

| Decision | Status | Owner |
| --- | --- | --- |
| How is the automation triggered? | Resolved — on demand through Admin v4 or AI Workspace | Carol + Derek |
| Maximum number of Same Day DO suggestions per merchant | Resolved — max 3 (platform limit: 20 total DOs) | Carol |
| Grouping algorithm for pharmacies: minimum time loss threshold to merge two time buckets? (e.g., merge if merchant loses <15min of Same Day window) | Open | Clara + Carol |
| Should proactive change detection notify or update automatically? | Future — not part of this release; no automatic updates | Carol |
| Should the created DO be linked to a specific sales channel automatically or remain unlinked? | Open — FR-015 assumes unlinked | Carol + Engineering |
| VTEX Lab Fulfillment Actions — First Wave scope and requirements | Covered in Fulfillment Agent spec 002 | Carol |

---

## Dependencies

| Dependency | Status |
| --- | --- |
| Derek's Same Day automation (Clara's SLA normalization rules) — embedded in agent task / MCP tool layer | **In scope to build** — Derek (mission team) + Clara |
| Delivery Options API — programmatic DO creation endpoint (exposed as MCP tool) | **Required dependency** — Engineering must validate endpoint readiness before implementation |
| AI Workspace backend (Fulfillment Agent spec 001 — Ricardinho) | **Required prerequisite** — agent tasks cannot deploy without this infrastructure |

---

## Strategic reference

This spec defines **agent scope** within the Fulfillment Agent's Delivery Options sub-agent. The Same Day pipeline uses deterministic grouping rules invoked by the agent — a valid agent pattern. It may ship in parallel with other agent tasks (e.g., Fulfillment Agent spec 002). Evolution:

1. **Prerequisite (Q2C2):** AI Workspace backend — Fulfillment Agent spec 001
2. **This release (Q2C2):** Same Day DO automation — deterministic tools within the `delivery-options` sub-agent
3. **Next:** additional agent tasks (logistics unavailability detection) — Fulfillment Agent spec 002
4. **Future:** same agent, broader DO types and interaction modes — no workflow reimplementation outside the agent

See [product-vision.md](../../product-vision.md) for the full Delivery Options strategic context.

---

## Changelog

| Date | Author | Change |
| --- | --- | --- |
| May 2026 | Carolina Tourinho | Initial draft |
