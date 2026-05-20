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

---

## Business rationale

We believe that properly configuring Same Day Delivery Options directly increases checkout conversion — shoppers who see a precise, credible Same Day option are more likely to complete the purchase. This is the core business bet behind prioritizing DO setup automation.

On the infrastructure side, this investment is well-positioned: Delivery Options are already indexed by Delivery Promise (DP), so merchants who activate DOs automatically improve the quality and precision of the delivery options displayed at checkout — without additional integration work.

---

## Opportunity

Clara's script already pulls and normalizes the merchant's existing SLA data — delivery deadlines by carrier, shipping policy, and region. This data is sufficient to deterministically identify which routes support intraday or next-cutoff delivery and auto-generate a Same Day Delivery Option with minimal merchant input.

This is the shortest path to delivering an automated configuration experience and the first building block of the future Delivery Options Agent.

---

## Target persona

**Logistics Operations Manager** at a Tier 1 merchant with at least one carrier operating intraday or express routes — who wants to offer Same Day at checkout but does not have bandwidth to configure it manually.

---

## Scope (this release)

The core job of this release is to **automate and simplify the extraction and normalization of SLA data** — from the main account and all sellers — and turn it into the visibility needed to generate Same Day Delivery Option suggestions. Today, this data exists in the platform but is scattered, un-normalized, and not actionable without manual work.

Concretely:

- Extract and normalize SLA data across the main account and its sellers (via Clara's script, to be productized as an API or callable service)
- Identify shipping policies and carriers with ≤1-day effective delivery time, accounting for each store's cutoff time
- Group eligible routes into suggested Delivery Options with **adaptive labels** derived from actual time buckets (e.g., "up to 1h", "up to 2h", "up to 4h") — not a fixed "Same Day" label
- Generate 1–3 suggested DOs per merchant depending on SLA distribution
- Show the merchant how VTEX arrived at each suggestion — transparent rationale with the underlying carrier, route, and cutoff data
- Present suggestions for merchant review; merchant can confirm or discard each individually
- On confirmation: create the Delivery Option(s) in the system (inactive by default)

**This is a deterministic flow** — rule-based, no LLM inference. The automation runs at a defined frequency to keep the SLA map per merchant updated and notify merchants when their configuration changes in a way that affects existing DOs.

**The focus is 100% on SLA.** Pricing configuration for the Same Day option is out of scope.

---

## Out of scope

- Pricing configuration for the Same Day option (handled separately by Delivery Pricing)
- Storefront display configuration (handled by Delivery Promise)
- AI/LLM-driven suggestion or natural language interaction (future agent scope)
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

This scope is being executed by Derek/mission team in Q2C2, leveraging work already in progress by Clara. It is intentionally scoped as a short-term, deterministic delivery that de-risks the longer-horizon agent build. The full agent will absorb this scope in a future release.

---

## Success criteria

- 1 merchant with at least one Same Day Delivery Option auto-generated and activated in Q2C2
- Merchant confirms the suggested DO without manual corrections in ≥70% of runs
