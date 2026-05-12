[Product Vision]: 3-Year Agentic Workflow — Configurable Order Orchestration

| Status | Draft | Owner(s) | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines the Agentic Workflow as VTEX's extensible, AI-powered order orchestration engine — replacing the current single rigid workflow with a configurable model that supports multiple workflow types, AI agent integration, and third-party extensibility. It covers a 3-year horizon and is intended to align Order Management, AI Workspace, and Storefronts teams around the architectural direction for order workflow extensibility. The primary objective is to eliminate the need for merchant customizations to handle omnichannel, B2B, and specialized delivery type scenarios.*

---

| TL;DR |
|---|
| **Product/Area:** Order Management — Agentic Workflow |
| **Focus Task:** Allow merchants to configure order workflows that match their operational reality — by delivery type, product category, sales channel, and B2B buying flow — with AI agents performing or suggesting actions at key decision points |
| **Persona:** Head of Ecommerce Operations and Head of IT at enterprise merchants in grocery, pharma, fashion, and construction materials — segments with order workflows that differ significantly from VTEX's default B2C shipping flow (BOPIS, ship-from-store, B2B approval chains, pick-and-pack, virtual SKUs) |
| **Working title/Commercial Name:** Agentic Workflow (previously referred to as Order Workflow / Dynamic Workflow) |
| **Value headline:** Merchants configure the order workflow their business needs — without custom development — and AI agents reduce manual operational interventions at exception points, cutting order management costs across complex omnichannel scenarios. |
| **Mini-Press Release:** VTEX's order management module has one workflow for every order type — the same statuses and rules apply whether an order is a same-day BOPIS pickup, a B2B bulk order requiring purchase approval, a ship-from-store return, or a virtual product delivery. Merchants in grocery, pharma, fashion, and construction build expensive customizations to make their operations fit this single model, and VTEX loses source-of-truth status for orders when those customizations route data outside the platform. VTEX is building the Agentic Workflow: a configurable orchestration engine that offers predefined workflow models for key scenarios (BOPIS, BORIS, ship-from-store, B2B) and allows merchants to extend them with AI agents that automate exception handling and reduce manual interventions. |
| **Opportunity Size:** Competitors Shopify, Salesforce Commerce Cloud, commercetools, Manhattan, and IBM Sterling all offer configurable order workflows. This is a documented gap in enterprise sales evaluations and an explicit migration risk for TFG, C&A, and Container Store. [PM INPUT NEEDED: ARR from accounts that cited workflow limitations as a migration risk] |

---

## Problem / Opportunity

### 1. Narrative framing

Enterprise merchants using VTEX cannot define order flows that match their operational models. The platform provides a single order workflow designed for B2C delivery orders in the Brazilian market. Every order — regardless of whether it is a BOPIS pickup, a ship-from-store return, a B2B purchase requiring budget approval, or a virtual product activation — follows the same status sequence. Merchants in other segments must either accept operational friction or build customizations that route order data outside VTEX, fragmenting the record.

In practice, this means:
- A grocery merchant running BOPIS must send manual status updates from their POS system because VTEX has no native BOPIS workflow — the order sits in "invoiced" status even after in-store pickup
- A B2B merchant requiring purchase order approval must build a custom approval layer outside VTEX because the platform has no authorization step before payment capture
- A fashion merchant processing returns from physical stores cannot link the in-store return event to the OMS order record — VTEX has no return status entry point for third-party apps
- Merchants in the US and EMEA require payment capture to be decoupled from invoicing (a regulatory and operational norm in those markets) — VTEX hardcodes the capture-at-invoice sequence with no configuration option

Business impact:
- Merchants build and maintain costly customizations that VTEX cannot support or evolve — increasing implementation costs and slowing time-to-go-live
- VTEX loses order source-of-truth status when custom integrations route fulfillment events outside the platform, complicating customer service and PII compliance
- Enterprise sales are blocked or lost: TFG and C&A have explicitly cited workflow limitations as migration risks; Container Store selected a competitor partly due to insufficient sourcing rules

### 2. Why Now

The Returns and Exchanges workflow (H2 2025 design goal) is the first concrete feature that requires the Agentic Workflow as its foundation — validating the extensibility model with a real production use case. The prototype and RFC must be co-designed. If the Agentic Workflow RFC is not completed in H2 2025, Returns and Exchanges cannot be built in H1 2026 on the correct architecture.

Additionally, the Admin & AI Workspace team and Weni integration create the platform capability for AI agents. Agentic Workflow is the first OMS use case where AI agent actions (suggest reallocation, flag exception, auto-advance status) can be integrated directly into order processing — a differentiated capability vs. competitors whose workflows are rules-based only.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| BOPIS workflow with in-store status updates | Order shows "ready for pickup" and "picked up" statuses native to VTEX | Grocery merchant: POS updates VTEX order status at pickup point of sale |
| B2B purchase approval before payment capture | Payment is captured only after order is approved by authorized buyer | B2B merchant: purchase orders above $10k require manager approval in VTEX before capture |
| Ship-from-store return linked to OMS record | In-store return event creates a native status in the original order record | Fashion merchant: returns processed at physical stores update the OMS order without a third-party tool |
| Payment capture decoupled from invoicing | Merchant configures capture to occur before or after invoice — not hardcoded at invoice step | US/EMEA merchants: capture confirmation received before shipping tracking code is sent |
| AI agent flags and resolves stuck orders | AI agent detects order stuck in intermediate status and either auto-advances or creates a merchant task | Operations team: 80% of stuck orders auto-resolved by AI agent within defined SLA |

### 4. Customer Workarounds

- **1. Custom status integrations via webhooks.** Merchants fire webhooks on OMS events and route order data to external systems that track "real" status (e.g., their WMS, their POS). This fails because it creates a split record — VTEX shows a different status from the real operational state — and requires engineering to maintain synchronization.

- **2. "Dummy" invoices for payment timing workarounds.** Merchants in EMEA and the US generate placeholder invoices to trigger payment capture at a different point in the workflow than invoicing actually occurs. This fails because it creates false accounting records and requires merchants to maintain a parallel reconciliation process.

- **3. Third-party workflow orchestration tools.** Some enterprise merchants use external workflow orchestration platforms (Zapier, custom middleware) to manage order status transitions. This fails because VTEX loses source-of-truth status, customer service teams must access external systems to understand order state, and PII is duplicated across systems.

---

## Vision Concepts

**Workflow Model** — A predefined set of statuses, transitions, and rules designed for a specific order type (e.g., BOPIS, ship-from-store, B2B approval, virtual product). Merchants select and configure a workflow model per order type; they do not build workflows from scratch.

**Entry Points** — Configurable extension hooks in a workflow where third-party apps or AI agents can inject status information, trigger actions, or extend the workflow with custom steps — without modifying the core workflow logic.

**AI Agent Action** — An automated action taken by an AI agent at a workflow decision point: diagnosing a stuck order and suggesting reallocation, auto-advancing an order when an external confirmation is received, or escalating an exception to a human operator when AI confidence is below a threshold.

---

## Vision Statement

3-Year Vision: VTEX merchants will configure order orchestration that matches their business model exactly — by delivery type, product category, sales channel, and B2B flow — with AI agents reducing manual intervention at every exception point, making VTEX the unambiguous source of truth for every order in their network.

1-Year Vision (H2 2025 – H1 2026): The Agentic Workflow RFC is approved, the architecture is validated with the Returns and Exchanges use case, and a prototype of the low-code configuration canvas is tested with at least 6 Tier 1 merchants across grocery, fashion, pharma, and construction.

### Key Capabilities

**1. Predefined workflow models for key order types.** VTEX ships configurable workflow models for: standard delivery, BOPIS, BORIS, ship-from-store, B2B purchase approval, virtual product, and subscription order. Merchants select and configure models — they do not build workflows from scratch.

**2. Payment capture decoupled from invoicing.** Merchants configure whether payment capture happens before or after invoicing, per workflow model — enabling EMEA and US payment norms natively without customization.

**3. Entry points for third-party apps and AI agents.** Workflows expose entry points where third-party apps (e.g., pick-and-pack, returns, delivery solutions) can add status events and where AI agents can inject actions, suggestions, or escalations.

**4. Low-code configuration canvas (Premium).** A visual interface for configuring which workflow model applies per order, what rules govern model selection (by delivery type, channel, product category, payment method), and which entry points are active.

**5. AI agent exception handling.** AI agents monitor active orders, detect exception patterns (stuck statuses, delivery risk, authorization holds), and take defined actions autonomously or create operator tasks — with configurable confidence thresholds for auto-action vs. escalation.

### Conditions of Satisfaction

**RFC approved** — Agentic Workflow RFC reviewed and approved by Engineering and Architecture in H2 2025.

**Returns and Exchanges validated on Agentic Workflow architecture** — the H2 2025 prototype uses the Agentic Workflow model as its foundation, not a standalone implementation.

**6 Tier 1 merchants validate the Order Allocation experience layer** (per QBR) — validation of the agent-oriented admin model in Q3 2025, covering merchants across grocery, fashion, pharma, and construction.

**[PM INPUT NEEDED: agent auto-resolution rate target — what % of exception scenarios should AI agents handle autonomously vs. escalate?]**

### Non-Goals

**Full no-code workflow builder** — this vision provides predefined workflow models with configuration options. Merchants cannot build arbitrary custom workflows from blank canvas. A no-code builder is a potential future phase but adds product and support complexity beyond the 3-year horizon.

**Warehouse management system (WMS)** — VTEX does not own physical warehouse operations. Agentic Workflow manages order status and orchestration; physical picking, sorting, and staging are handled by Pick and Pack or external WMS systems.

**ERP order management** — order workflows that live entirely within an ERP (SAP, Oracle) are out of scope. Agentic Workflow covers the VTEX-owned portion of the order lifecycle; ERP integration is a separate concern.

---

## High Level Phasing

1. **Phase 1 — RFC and architecture alignment (H2 2025):** Approve the Agentic Workflow RFC. Validate the architecture with the Returns and Exchanges use case. Test the low-code configuration canvas concept with 6 Tier 1 merchants across segments.

2. **Phase 2 — Standard workflow models GA (H1 2026):** Ship predefined workflow models for standard delivery, BOPIS, BORIS, ship-from-store, and virtual product. Enable entry points for third-party apps (Pick and Pack, Returns). Payment capture decoupled from invoicing.

3. **Phase 3 — B2B workflows and AI agents (H2 2026):** B2B purchase approval workflow with configurable authorization chains. AI agent integration for stuck order detection and exception resolution. Low-code canvas for workflow model selection and rule configuration.

4. **Phase 4 — Premium workflow extensibility (H1 2027+):** Full entry point API open to third-party apps. AI agents with configurable confidence thresholds for auto-action vs. escalation. Workflow analytics — exception rate by workflow type, AI resolution rate, manual intervention frequency.

---

## Hotly Debated Topics

**1. Standard vs. Premium tier.** The 3Y vision distinguishes a Standard version (predefined workflows) and a Premium version (entry points, low-code canvas). The business model for this distinction (included in plan, add-on, Enterprise-only) is not defined.

**2. How do AI agents interact with human operators?** The boundary between what an AI agent does autonomously and what it escalates requires explicit definition — particularly for high-stakes actions like order cancellation or reallocation. The confidence threshold model must be designed before Phase 3.

**3. Pick and Pack and Returns as workflow entry points.** Both Pick and Pack and Returns and Exchanges need to inject status events into the order workflow via entry points. The entry point API contract must be co-designed with both feature teams before it is published.

---

## FAQs

**Why "Agentic" Workflow — what does the AI add that rules don't?** Rules handle expected cases. AI agents handle the long tail of exceptions that rules can't anticipate: a supplier unexpectedly closes, a carrier has a regional outage, an order is stuck in a non-standard status due to a rare edge case. The agent model allows the system to diagnose and respond to novel situations without requiring a merchant to pre-configure a rule for every possible failure.

**Will existing merchant customizations break?** The RFC must include a migration path for merchants currently using custom webhook-based workflow extensions. The goal is for entry points to provide a first-class alternative that eliminates the need for those customizations — not to break existing integrations.

**How does this relate to Pick and Pack?** Pick and Pack currently creates its own order records outside the OMS workflow. The Agentic Workflow entry point model is designed to allow Pick and Pack to inject its status events (picked, packed, handoff to carrier) into the native order timeline — eliminating the duplicate record problem and making Pick and Pack a first-class participant in the order lifecycle.

---

## Appendix

### Related Assets

- [Agentic Workflow RFC (in progress)](https://docs.google.com/document/d/134mGmpIoHqNkcnrcgzXy3e2Fi1FXv4OXjsojZl7rmpo/edit)
- [3Y DOM Product Vision — Order Workflow section](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)
- [Order Allocation Experience Layer — Q3 2025 validation plan](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
