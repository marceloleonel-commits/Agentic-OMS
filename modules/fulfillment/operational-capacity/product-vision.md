# Operational Capacity — Vision & Strategy

## Metadata

| Field | Value |
|---|---|
| **Product** | Commerce Platform |
| **Solution** | B2C / Omnichannel |
| **Module** | Fulfillment → Operational Capacity |
| **Persona(s)** | Ecommerce Manager, Operations Manager, Fulfillment Manager |
| **Author** | Carolina Tourinho |
| **Status** | Draft |
| **Created** | May 2026 |
| **Vision Horizon** | 2026–2028 (3 years) |

---

## TL;DR

| | |
|---|---|
| **What is it** | A module that lets merchants set daily order processing limits per seller. When a seller reaches its limit, delivery promises extend to the next available day, protecting the operation from overload. |
| **Where we are** | Generally Available since early 2026. 281 merchant accounts and 47,680 sellers actively using it. The module works, but silently: merchants configure a limit, activate it, and have no way to understand what happened after that. |
| **Core problem** | The module is a black box. Merchants cannot see past capacity data, cannot track which orders consumed which capacity slots, and cannot measure whether the module is delivering value. Configuration is done by guesswork. |
| **Strategic direction** | Position Operational Capacity as an intelligent feature that gives merchants active confidence their operation is safe and within limits. Full observability (including past history and order-level allocation), public API access, Delivery Promise integration, and eventually dynamic capacity that adjusts to real operational performance. |
| **Why now** | GA reached on a stable foundation. Clear revenue opportunity: more merchants and sellers using the module with confidence means more omnichannel expansion on the VTEX platform. Strong alignment with the company's delivery promise accuracy goals. |
| **Time Horizon** | 2026–2028 |

---

## Strategic Positioning

Operational Capacity should be positioned as an **intelligent safety and observability layer for fulfillment operations**.

Today it functions as a passive cap: merchants set a number, the system enforces it, and nothing else is communicated. The evolution is toward a feature that **actively communicates the state of the operation**: which sellers are close to their limits, which are processing faster than expected and could safely take more volume, and what actually happened on any given day.

The value proposition for the merchant is **confidence**: *"I can expand my omnichannel network knowing that my operation is protected, and I can see exactly what is happening at any point in time."*

This positioning connects directly to two company-level goals: **increasing the number of active sellers on the platform** (revenue) and **improving delivery promise accuracy** (merchant and shopper experience).

---

## Problem / Opportunity

### Narrative Framing

Franchise retailers use Operational Capacity to prevent individual stores from receiving more orders than they can process in a day. The module works. The problem is that it **works invisibly**. Merchants receive no feedback about what it is doing, cannot audit what it has done, and have no way to improve their configuration based on evidence.

**Problem 1 — No visibility into the relationship between orders and capacity, past or present.**

The admin shows capacity for today and the next three days only. More critically: **there is no way to see the mapping between order IDs, the capacity day they consumed, and the seller they belong to**. To understand what the module did last week, merchants must contact VTEX support.

The Obramax case is concrete. To understand how orders were allocated across their main seller during a 7-day period (Jan 25–Feb 1, 2026), the team required a manual extraction from the VTEX support team. The seller had been running at **100% utilization for 7 consecutive days** and the merchant had no way to see this themselves. *(Source: [Pedidos Obramax](https://docs.google.com/document/d/1RlOLK0v3GWBMymSKuWEJrr8YrN7RhhrmkhcG-zF3uX0))*

> *"We are completely blind to what has already happened. If we need that data, we have to store it in our own systems and query it outside of VTEX."* — C&A (Tier 1, Brazil) and Obramax (Tier 1, Brazil)

Both Obramax and C&A have explicitly requested the ability to see past capacity data. *(Source: [Path to GA doc](https://docs.google.com/document/d/14nVAN2D1OJ7uq21roC964OXfQC_OatrLrr8WF0Muy4A))*

**Problem 2 — No way to measure the value the module delivers.**

Merchants cannot see how many orders were protected, how many sellers hit their limit, or how many delivery promises were extended. After months of use, Osklen runs the module as a safety net **on faith, not evidence**.

> *"A gente não tinha visibilidade de como saber se ela está agregando valor ou não. A gente não sabia quantos pedidos estavam passando por essa funcionalidade."* — Osklen (Tier 2, Brazil), operations team, March 2026. *(Source: [Path to GA doc](https://docs.google.com/document/d/14nVAN2D1OJ7uq21roC964OXfQC_OatrLrr8WF0Muy4A))*

**Problem 3 — The public API does not expose the data merchants need.**

The current [Operational Capacity API](https://developers.vtex.com/docs/api-reference/operational-capacity-api) supports configuration and reading upcoming capacity state. It does not expose: **historical capacity data**, **order-to-slot allocation**, a **capacity event log**, or **utilization metrics**. An internal API retrieves capacity by date range using a segmentation resource ID, but it is undocumented and not designed for merchant use. Enterprise merchants who want to build operational reporting have no supported path to do it.

**Problem 4 — Configuration is done by guesswork — even though VTEX already has the data to suggest better limits.**

Merchants set limits based on intuition. Osklen set 50 orders per day per store with no basis:

> *"Esses cinquenta foi a gente que pegou e colocou. Talvez seja quinze o número."* — Osklen

The data needed to recommend better limits already exists inside VTEX: order volume per seller, utilization patterns, seasonal behavior. **There is no reason for this intelligence to sit with the merchant when the platform already holds the evidence.** VTEX should surface that data and drive configuration recommendations proactively.

**Problem 5 — The absence of dynamic capacity penalizes high-performing stores.**

The module uses a static capacity model: capacity is consumed when an order is placed, not when it is processed. When a store invoices future-dated orders ahead of schedule, **the capacity reserved for those future days remains committed**. Stores that process orders fastest appear the most constrained in checkout.

Dynamic capacity release would correct this by freeing future-day capacity as orders are invoiced, allowing high-performing stores to receive additional volume.

> *"A fila de capacidade permanece comprometida em dias futuros, mesmo quando os pedidos desses dias já foram processados. Isso faz com que a capacidade fique artificialmente bloqueada, impactando negativamente a promessa de entrega exibida ao shopper e o volume de pedidos processados por lojas que teriam capacidade real para operar mais."* — C&A operations team, January 2026. *(Source: [Customer Need — C&A](https://docs.google.com/document/d/1IDqWb8hPAYVpkSku0yy5uW2HEQtCfU6Pv7jxKsEqPBw))*

**Problem 6 — Delivery Promise does not consume Operational Capacity signals.**

Capacity constraints may not surface accurately in checkout delivery options, creating a gap between configured operational limits and what is shown to shoppers. **This integration is the responsibility of the Delivery Promise team** and is a key milestone targeted for the next Open Beta or GA phase.

**In practice:**
- Obramax opens a support ticket to see which orders consumed capacity last week.
- Osklen cannot tell leadership whether the module is worth keeping active.
- A merchant cannot pull capacity utilization data via API for their BI tools.
- A C&A store that invoices Monday's backlog still shows inflated delivery promises for Tuesday.
- A shopper sees a delivery date in checkout that the seller cannot honor.

---

### Why Now

1. **Revenue from omnichannel expansion.** Observability and intelligent configuration directly enable merchants to onboard more stores with confidence, increasing active sellers and GMV on the VTEX platform.

2. **Alignment with delivery promise accuracy goals.** Operational Capacity is a direct input to delivery promise quality. A misconfigured or unobserved capacity setup produces wrong promises in checkout. Evolving this module is a necessary investment to meet that company goal.

3. **Stable foundation ready to build on.** GA was reached after a focused stabilization cycle: two parallel versions unified, bugs fixed, sales channel segmentation shipped.

4. **Enterprise customer demand is explicitly documented.** C&A submitted a formal Customer Need for dynamic capacity. Osklen's interview directly mapped the observability gap. Obramax's support extraction was concrete evidence of the past-data problem.

---

### Use Cases and Current Workarounds

| Business Need | Current Workaround | Expected Behavior | Example |
|---|---|---|---|
| See past capacity allocation (order ID, day, seller) | Open a support ticket and request a manual extraction | Full historical allocation view per seller, per day, per sales channel, in the admin and via API | Obramax checks last week's capacity allocation without contacting support |
| Prove the module is delivering value | Rely on intuition or build external reporting | Native value metrics: orders protected, sellers at limit, delivery promises extended, utilization trends | Osklen shows leadership: "the module protected 340 orders across 12 stores last month" |
| Pull capacity data for external tools and BI | No supported path; internal API requires non-public identifiers | Public capacity API: historical allocation, event log, utilization history, fully documented | C&A integrates VTEX capacity data into their internal dashboard via API |
| Configure limits based on actual utilization | Set limits by estimation; no feedback loop | VTEX surfaces data-driven recommendations based on historical utilization patterns | Osklen is proactively shown that 8 stores never exceed 30% of their limit and 2 consistently hit 100% |
| Increase limits when sellers are performing well | No visibility to support that decision | Module signals when sellers are reaching invoice faster than the limit, as an opportunity to raise limits and capture more volume | A store at 40 orders/day is invoicing 38 consistently; merchant raises limit to 60 |
| Safely expand the omnichannel network | Hesitate to add stores with no way to monitor them | Observe capacity behavior per new seller from day one; increase limits as performance data accumulates | Hering onboards 5 new stores at 20 orders/day and tracks utilization weekly |
| Avoid checkout unavailability | Add flat buffer days to all delivery promises | Delivery Promise team integrates Operational Capacity state so checkout options reflect real available capacity | Shopper sees a delivery date that accounts for seller capacity |
| Release capacity when orders are processed ahead of schedule | Manually reconfigure limits | Dynamic capacity release: when orders are invoiced, future-day capacity is freed and promises recalculate | C&A store that invoices Monday's backlog on Sunday automatically frees Monday capacity |
| Manage peak events with forward visibility | Manually increase delivery promise buffers | 18-day forward calendar; temporary limit adjustments for specific date ranges | Osklen sets CD capacity to 2x for Black Friday week |
| Separate who configures from who monitors | All admin users have the same access | Role-based access: viewer vs. editor, managed from the main account | Store managers see utilization; ecommerce manager retains configuration access |

---

## Vision Concepts

**Observability, API Access and Fulfillment Agent Data Layer**
Past, present, and forward capacity data visible in the VTEX Admin, accessible via public APIs, and available as a structured data source for the Fulfillment Agent. Includes the full mapping of order IDs, capacity days, and sellers. No support ticket or undocumented endpoint needed.

**Value Metrics**
Operational Capacity proves its own value: orders protected from overload, sellers at limit, delivery promise extensions triggered, utilization trends. Merchants can quantify the benefit of keeping the module active and use this data to justify network expansion.

**Proactive Limit Recommendations**
VTEX already holds the data needed to recommend better limits. Rather than leaving configuration to merchant intuition, the module surfaces data-driven signals: stores that are consistently under-provisioned or over-provisioned, seasonal patterns, and suggested adjustments based on historical behavior.

**Automatic Capacity Release and Pick & Pack Integration**
A capacity model that reflects real operational performance. When orders are invoiced ahead of schedule, future-day capacity is released and delivery promises recalculate. In the future, data from both Operational Capacity and Pick & Pack can drive this release mechanism, creating a richer and more accurate picture of true available capacity.

**Delivery Promise Integration**
Operational Capacity state is surfaced by the Delivery Promise team into checkout delivery options, ensuring shoppers only see what the fulfillment network can actually honor. Targeted as a milestone for Open Beta or GA of the next phase.

**Fulfillment Agent**
All Operational Capacity context (utilization history, event logs, order-level allocation, configuration state, delivery promise impact) becomes the knowledge base for a Fulfillment Agent. The agent monitors capacity across the network, identifies operational gaps, creates resolution tasks, and in its most autonomous form can apply changes directly when the merchant grants that permission level.

---

## Vision Statement

> **2026–2028 Vision:** Operational Capacity will evolve from a passive enforcement cap into an intelligent observability and safety layer for fulfillment operations. Merchants will have full visibility into past and present capacity behavior, an API-first interface to integrate that data into their own tools and the Fulfillment Agent, and a module that actively communicates when the operation is safe, when limits can be raised, and when delivery promises can be improved. Dynamic capacity release, developed together with Pick & Pack, will close the gap between planned and real operational performance.

---

## Key Capabilities

1. **Full capacity observability with order-level allocation** — Past capacity history, present utilization, and forward view up to 18 days. Includes the mapping of order ID to capacity day to seller. Accessible in the VTEX Admin, via public API, and by the Fulfillment Agent.

2. **Value metrics and impact indicators** — Native reporting: orders protected from overload, sellers at limit, delivery promise extensions, utilization trends. Merchants can see "the module protected X orders this month across Y sellers."

3. **Public capacity data API** — Capacity utilization history, event logs, and order-level allocation via public, documented APIs. Closes the gap left by the internal-only endpoints that exist today.

4. **Proactive limit recommendations** — VTEX surfaces data-driven recommendations for limit adjustments based on historical utilization. Stores consistently reaching invoice faster than the limit are flagged as opportunities to increase capacity and capture more volume.

5. **Delivery Promise integration** — Owned by the Delivery Promise team. Operational Capacity state fed into checkout so delivery options reflect real available capacity.

6. **Automatic Capacity Release** — When orders are invoiced ahead of their delivery date, that day's capacity is released and the delivery promise recalculates. Developed in conjunction with Pick & Pack, which can serve as an additional data source for the release trigger.

7. **Role-based access** — Viewer vs. editor distinction, managed from the main account. Store-level operators get monitoring access; central teams retain configuration control.

8. **Seller type 3 support** — Expand ICP coverage to include type 3 sellers.

9. **Fulfillment Agent integration** — All Operational Capacity context structured and exposed for a Fulfillment Agent. The agent monitors the network, identifies gaps, creates resolution tasks, and can apply changes autonomously when granted permission.

---

## Conditions of Satisfaction

- Merchants can retrieve past capacity allocation data (order ID, day, seller) without opening a support ticket.
- Merchants can answer "how many orders did the module protect this month?" from within the VTEX Admin.
- Capacity utilization history and order-level allocation are accessible via public API with full documentation.
- Support tickets of the type "I need to see which orders hit capacity" drop measurably after observability ships.
- At least one anchor customer (Obramax or Osklen) validates that the dashboard and API replace their current workarounds.
- C&A validates that dynamic capacity release reduces the delivery promise distortion documented in their January 2026 Customer Need.
- Delivery Promise correctly reflects capacity constraints in checkout before the next Open Beta milestone.
- The observability and metrics data model enables reuse in Pick & Pack and by the Fulfillment Agent.
- **At least 30% of omnichannel customers (merchants with franchise seller accounts) are using Automatic Capacity Release** as an initial long-term adoption target for that capability. `[PM INPUT NEEDED: validate this target — 70% was considered but flagged as too bold for now]`

`[PM INPUT NEEDED: baseline and intermediate targets for observability adoption — % of accounts accessing capacity admin at least once per week; support ticket volume before and after observability ships]`

---

## Non-Goals

- **Per-seller account management** — We do not want merchants to navigate into each individual seller account to manage capacity. Configuration should always be done from the main account. What we do want is access granularity within the main account (viewer vs. editor), not a per-seller management model.
- **Seller Portal and external sellers** — Operational Capacity supports franchise account structures and seller type 3. Seller Portal sellers and external marketplace sellers are not in scope for this vision.
- **Real-time per-order validation** — The system intentionally uses async, batched processing. This vision does not change that architectural decision.
- **OMS-level order routing** — Operational Capacity controls fulfillment limits; it does not replace order allocation logic in DOM.
- **Physical logistics modeling** — The product does not model staffing or warehouse layout. Limits are set by merchants.

---

## High Level Phasing

**Phase 1 — GA + Stabilization** *(Complete — early 2026)*
Single unified version in production. Self-enrolled via VTEX Admin. Sales channel segmentation available. Critical bugs fixed. Foundation stable.

**Phase 2 — Full Observability, Value Metrics + API Access** *(2026)*
Past capacity history and order-level allocation (order ID, day, seller) in the admin. Extended calendar (18 days forward). Value metrics: orders protected, sellers at limit, delivery promise impact, utilization trends. Public capacity data API. Capacity event log. Role-based access. Proactive limit recommendations (initial signals).
*Unlocks: merchants see what the module is doing; support ticket load drops; API enables external integrations, BI tooling, and Fulfillment Agent access; converts passive installs into active management.*

*See:* `specs/past-capacity-observability.md`

**Phase 3 — Delivery Promise Integration + Proactive Limit Recommendations** *(2026–2027)*
Delivery Promise team integrates Operational Capacity signals into checkout, targeted for Open Beta or GA. Proactive limit recommendations deepened: utilization patterns, over/under-provisioned detection, seasonal peaks. Seller type 3 support.
*Unlocks: checkout delivery options reflect real capacity; fewer false delivery promises; expanded ICP.*

**Phase 4 — Automatic Capacity Release + Pick & Pack Integration** *(2027–2028)*
Capacity releases automatically when orders are invoiced ahead of their delivery date. Developed in conjunction with Pick & Pack — both modules can serve as data sources for the release trigger. Shares the indicators infrastructure from Phase 2.
*Unlocks: accurate delivery promise for high-performing stores; additional order volume for efficient sellers; path toward 30%+ omnichannel customer adoption of automatic capacity release.*

*See:* `specs/automatic-capacity-release.md`

**Note on Fulfillment Agent**
The Fulfillment Agent is not a phase of Operational Capacity — it is a consumer of it. The observability infrastructure built in Phase 2 (order-level allocation, event log, utilization history, structured data access) is what enables the agent to read capacity context, identify gaps, and create resolution tasks. There is no separate phase to build for the agent: the investment is in making the data structured and accessible. The agent layer is built and owned outside this module.

---

## Future Specs

The vision document defines the strategic direction for Operational Capacity. Each major capability will be detailed in a separate spec document before engineering work begins, following the SDD (Spec-Driven Development) workflow. Specs describe intent in structured, testable language that agents can use to generate and validate implementation.

| Spec | Capability | Phase | Status |
|---|---|---|---|
| `specs/past-capacity-observability.md` | Past capacity history, order-level allocation, event log, value metrics, data access | Phase 2 | Pending |
| `specs/proactive-limit-recommendations.md` | Data-driven limit suggestions based on utilization patterns | Phase 3 | Pending |
| `specs/automatic-capacity-release.md` | Automatic capacity release on invoice, Pick & Pack integration | Phase 4 | Pending |

Additional specs will be created for Delivery Promise integration (Phase 3) and Fulfillment Agent integration (Phase 5) as those phases are scoped.

---

## Hotly Debated Topics

1. **Should observability be built inside Operational Capacity or as part of a broader Fulfillment Analytics surface?** Starting inside the module is faster. But the broader ask from Osklen ("ele deveria ter indicadores da performance operacional de cada seller") points to a shared layer. The right architectural decision — build per-module first and consolidate later, or invest in the shared layer from the start — affects how Phase 2 is scoped and how Pick & Pack reuse is structured.

2. **What triggers dynamic capacity release?** Invoice status is the primary trigger (C&A's model). The Customer Need also raises merchant-configurable triggers by order status. Configurable is more flexible but adds complexity and potential misconfiguration risk. What is the right default?

3. **How deep should the Delivery Promise integration go?** A lightweight integration pushes a capacity signal to Delivery Promise. A deeper integration requires Delivery Promise to query capacity state for every SLA calculation. Performance implications need to be scoped with the Delivery Promise team.

4. **What does it mean for the Fulfillment Agent to act autonomously?** The agent can operate at three levels: read-only, task-creation, and autonomous action. Defining the permission model and trust boundaries before Phase 5 is scoped is critical.

---

## FAQs

**Why prioritize observability before dynamic capacity, when C&A is explicitly requesting dynamic capacity?**
Dynamic capacity requires reliably attributing order processing events to capacity slots at scale. Observability reads data that already exists and surfaces it. Shipping observability first also gives us the instrumentation that dynamic capacity validation will need. The sequencing is additive.

**Why add a public API if there is already an admin dashboard?**
Enterprise merchants have BI tools, operational dashboards, and integration workflows that need programmatic access. The current internal API requires non-public resource IDs and is not designed for merchant use. A documented public API is also a prerequisite for the Fulfillment Agent to consume this data reliably.

**Won't merchants ignore a dashboard if the module rarely fires?**
The primary value of this investment is not the dashboard itself — it is having the data structured and accessible. A Fulfillment Agent can consume this context proactively, surface insights, and flag gaps without requiring the merchant to look at anything. The dashboard is one consumption surface; the agent is another. Making the data structured and available is the foundation that enables both.

**How does this connect to the delivery promise accuracy goal?**
Operational Capacity is a direct input to delivery promise quality. A misconfigured or unobserved capacity setup produces wrong promises in checkout. Making the module observable, intelligent, and integrated with Delivery Promise is a necessary investment for that goal.

**Why does the Fulfillment Agent need the observability infrastructure as a prerequisite?**
An agent can only act on data it can read. Without a structured API, event log, and order-level allocation history, the agent has no grounded context. The infrastructure built in Phase 2 is what makes Phase 5 viable.

---

## Appendix

### Source Documents

| Document | Link |
|---|---|
| [Fulfillment] Operational Capacity: path to GA | [Google Doc](https://docs.google.com/document/d/14nVAN2D1OJ7uq21roC964OXfQC_OatrLrr8WF0Muy4A) |
| Customer Need — C&A: Dynamic Operational Capacity | [Google Doc](https://docs.google.com/document/d/1IDqWb8hPAYVpkSku0yy5uW2HEQtCfU6Pv7jxKsEqPBw) |
| Pedidos Obramax — Alocação Capacidade Operacional | [Google Doc](https://docs.google.com/document/d/1RlOLK0v3GWBMymSKuWEJrr8YrN7RhhrmkhcG-zF3uX0) |
| One-pager [PT] — Capacidade Operacional | [Google Slides](https://docs.google.com/presentation/d/1CrSdst3ZMzsVHR6BSIVGJ086Qg8wk3z9ZdplttLWvzE) |
| Testes Capacidade Operacional (Obramax) | [Google Doc](https://docs.google.com/document/d/1JbgRghCqE9SKOShXiaNTEkRB8ivwzKBsnioUnYoc8BY) |
| Operational Capacity API Reference | [developers.vtex.com](https://developers.vtex.com/docs/api-reference/operational-capacity-api) |

### Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial draft |
