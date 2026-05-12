# Product Brief: Native Returns and Exchanges Workflow

| | |
|---|---|
| **Spec** | 001-returns-exchanges-workflow |
| **Module** | Order Management / Returns and Exchanges |
| **Pillar** | Native omnichannel support |
| **PM** | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
| **Status** | Active — H2 2025 |
| **Availability** | Prototype → Early Release H1 2026 |

---

## Problem

VTEX has no native returns and exchanges flow. Every merchant must integrate a third-party tool (Aftersales, Loop Returns) to handle post-purchase returns. These integrations create split order records — the return lives in the third-party system, the original order lives in VTEX — fragmenting order history, blocking unified PII erasure under GDPR and LGPD, and preventing VTEX from being the source of truth for the full order lifecycle. Returns and Exchanges carries 6% weighting in Gartner/Forrester OMS evaluations and appears in nearly every enterprise sales RFI. The Agentic Workflow feature is being co-designed in H2 2025 — Returns and Exchanges is the first concrete workflow to validate that architecture, and prototype feedback from ObraMax, Atacadão, and C&A is required before H1 2026 execution.

---

## Solution

Build a native Return and Exchange workflow as an extension of the Agentic Workflow engine. Shoppers initiate return or exchange requests from My Orders — selecting items, providing reasons, and choosing return methods (pickup, drop-off, in-store). Merchants configure eligibility windows, accepted reasons, and approval conditions per product category or channel. Return status becomes a first-class event in the VTEX order history, included in PII erasure operations. Weni handles initial return queries conversationally, validates eligibility, and escalates only exceptions to human agents.

---

## Who Benefits

**Customer Service Managers at mid-to-large merchants in fashion, grocery, and pharma** eliminate dependency on third-party return tools, reduce handling costs through AI-assisted customer service, and manage returns within a single interface.

**Merchants in enterprise sales cycles** can demonstrate native return capability — closing a 6%-weighted gap in OMS evaluations.

**Compliance teams** achieve PII erasure coverage for return data within the legal 30-day SLA without coordinating deletion across external systems.

---

## Definition of Done

- [ ] 3 merchants complete structured prototype validation (ObraMax, Atacadão, C&A) with confirmed feedback against defined acceptance criteria
- [ ] Returns and Exchanges workflow RFC reviewed and approved by Engineering and Architecture before end of H2 2025
- [ ] Return data created through the native flow is included in the automated PII erasure workflow within the 30-day legal SLA
- [ ] At least 1 merchant confirms Early Release adoption for H1 2026 GA

> ⚠️ TODO: Customer service deflection rate target for Weni (% of return queries handled without human escalation) must be established during prototype validation. Return management operational view for high-volume merchants during Early Release is not yet designed.
