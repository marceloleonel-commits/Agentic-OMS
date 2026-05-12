[Product Vision]: 3-Year Returns and Exchanges — Native Post-Purchase Flow

| Status | Draft | Owner(s) | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines the strategic direction for native Returns and Exchanges within VTEX's Order Management module. It covers a 3-year horizon and is intended to align Order Management, AI Workspace (Weni), and Design teams around building a post-purchase return and exchange flow that removes the merchant's dependency on third-party solutions. The primary objective is to make Returns and Exchanges a first-class workflow within the VTEX OMS, supported by the Agentic Workflow engine and AI-assisted customer service via conversational interfaces.*

---

| TL;DR |
|---|
| **Product/Area:** Order Management — Returns and Exchanges |
| **Focus Task:** Allow shoppers to initiate and track return/exchange requests, and allow merchants to manage the return workflow, entirely within VTEX — without a third-party tool |
| **Persona:** Ecommerce Operations Manager and Customer Service Manager at mid-to-large merchants in fashion, grocery, pharma, and construction materials — segments with high return rates and compliance-sensitive return policies |
| **Working title/Commercial Name:** Returns and Exchanges (native OMS flow) |
| **Value headline:** Merchants eliminate their dependency on third-party return tools, reduce return handling costs with AI-assisted customer service, and give shoppers a unified post-purchase experience within the VTEX platform. |
| **Mini-Press Release:** VTEX has no native returns and exchanges flow. Merchants are forced to integrate third-party tools like Aftersales, which creates split order records, PII data fragmentation, and a broken post-purchase experience where return status lives outside the OMS. VTEX is building a native Returns and Exchanges flow as an extension of the Order Workflow — enabling merchants to manage return requests, trigger exchanges, and deliver AI-assisted shopper support through Weni, all within the VTEX platform. |
| **Opportunity Size:** Returns and Exchanges is one of the highest-weighted offerings (6%) in Gartner and Forrester OMS evaluation reports. Nearly all Sales RFIs include questions about VTEX's return tooling. [PM INPUT NEEDED: number of merchants using third-party return tools today, and ACV at risk from OMS evaluations where this is a gap] |

---

## Problem / Opportunity

### 1. Narrative framing

Customer Service Managers at VTEX merchants cannot manage return and exchange requests natively within the OMS. The platform has no built-in return workflow, forcing every merchant to integrate a third-party tool (e.g., Aftersales, Loop Returns) to handle post-purchase return requests. These integrations create split order records — the return lives in the third-party system while the original order lives in VTEX — fragmenting the order history, complicating PII compliance, and preventing VTEX from being the single source of truth for the full order lifecycle.

In practice, this means:
- A customer service representative manages return requests in a separate tool with a separate interface, requiring cross-system context-switching for every return case
- When a return is approved in the third-party tool, VTEX does not automatically receive a status update — merchants must build custom integrations to propagate return status back to the OMS
- PII erasure requests are complicated because order and return data live in different systems, requiring coordinated deletion across platforms — a compliance risk under GDPR and LGPD

Business impact:
- Sales/Pre-Sales: Returns capability is evaluated in every enterprise OMS RFI (6% weighting in Gartner/Forrester reports). VTEX currently cannot demonstrate a native return flow, creating a competitive gap in enterprise sales
- Operational: Merchants pay for and maintain third-party return integrations that should be platform capabilities
- Compliance: Split order/return records complicate PII deletion workflows and audit trails

### 2. Why Now

The Agentic Workflow feature is being built in parallel in H2 2025. Returns and Exchanges is the first concrete workflow to validate the extensible workflow model — it requires exactly the capabilities the Agentic Workflow is designed to provide (custom statuses, entry points for apps, task orchestration). The H2 2025 plan includes prototype and RFC validation with ObraMax, Atacadão, and C&A. If this validation doesn't happen in H2, the return workflow design will have no merchant-grounded input for H1 2026 execution.

Additionally, Weni (conversational AI for customer service) is available as a platform. Returns is one of the highest-volume customer service scenarios. The combination of native return workflow + Weni integration is a differentiated capability that VTEX can demonstrate in the H1 2026 sales cycle.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Shopper-initiated return request | Shopper can request a return from My Orders without contacting customer service | Fashion merchants: shopper selects items to return, selects reason, confirms pickup or drop-off |
| Exchange flow (replace item) | Merchant can approve an exchange and trigger a new order linked to the original | Atacadão: exchange of damaged grocery items triggers replacement order in same OMS flow |
| AI-assisted return handling via Weni | Customer service AI agent handles return queries, validates eligibility, and routes exceptions to human agents | ObraMax: high-volume return requests handled via WhatsApp chatbot before escalation |
| Return status visible in VTEX order history | Return status is a native part of the order record, not a separate third-party record | Compliance: PII erasure covers both order and return data in a single operation |
| Merchant-configurable return policy rules | Merchant defines return eligibility windows, reasons, and approval conditions per product category or segment | C&A: different return windows for fashion vs. electronics, different rules for marketplace sellers |

### 4. Customer Workarounds

- **1. Third-party return tools (Aftersales, Loop Returns).** Merchants integrate dedicated return management platforms. This fails because it creates split order records, requires custom integration to propagate return status back to VTEX, and does not allow VTEX to be the source of truth for the full order lifecycle.

- **2. Manual customer service flows via VTEX DO tasks.** Customer service teams create manual tasks in VTEX DO to track return requests without a formal workflow. This fails because it has no structured return request model, no shopper-facing self-service, and no integration with refund or exchange order creation.

- **3. Custom-built return portals.** Some enterprise merchants build their own return request portals that call VTEX APIs to cancel/refund orders. This fails because it requires ongoing engineering maintenance, doesn't provide a shopper self-service experience, and creates an external tool that VTEX cannot support or evolve centrally.

---

## Vision Concepts

**Return Workflow** — A native order flow within the Agentic Workflow engine that handles the full return lifecycle: request creation, eligibility check, approval/rejection, physical return tracking, refund or exchange creation, and status communication to the shopper.

**Exchange Order** — A new order created as part of the exchange flow, linked to the original order and the return record, enabling merchants to fulfill the replacement item through the standard order lifecycle.

---

## Vision Statement

3-Year Vision: VTEX will be the single platform where merchants manage the full post-purchase lifecycle — including returns, exchanges, and shopper communication — natively, with AI-assisted exception handling that reduces manual customer service intervention by at least 50% for return workflows.

1-Year Vision (H2 2025 – H1 2026): A validated Return and Exchange workflow prototype is live, with RFC approved, and an early release validated with 3 merchants (ObraMax, Atacadão, C&A), providing the foundation for GA in H1 2026.

### Key Capabilities

**1. Shopper self-service return and exchange requests.** Shoppers initiate return or exchange requests from My Orders without contacting customer service — selecting items, providing reasons, and choosing return methods (pickup, drop-off, in-store).

**2. Merchant-configurable return policy rules.** Operations teams define return eligibility windows, accepted reasons, and approval conditions per product category, order type, segment, or sales channel — without engineering involvement.

**3. Native return status in the order record.** Return requests and their status transitions are first-class events in the VTEX order history — visible to both merchants and shoppers, and included in PII erasure operations.

**4. AI-assisted customer service via Weni.** Conversational AI handles initial return queries, validates eligibility against configured policies, and creates return requests automatically — escalating only exceptions requiring human judgment to the customer service team.

**5. Exchange order creation.** When an exchange is approved, a new linked order is created within the OMS and fulfilled through the standard order lifecycle — no separate system required.

### Conditions of Satisfaction

**3 merchants validate prototype in H2 2025** (ObraMax, Atacadão, C&A) — confirmed via structured feedback sessions against defined acceptance criteria.

**RFC approved** — the Returns and Exchanges workflow RFC is reviewed and approved by Engineering and Architecture before end of H2 2025.

**PII compliance** — return data created through the native flow is included in the automated PII erasure workflow within the legal 30-day SLA.

**[PM INPUT NEEDED: customer service deflection rate target — what % of return queries should be handled by Weni without human escalation?]**

### Non-Goals

**Dedicated return management UI** — this vision does not include a standalone return management interface for merchants. Return management is handled through the Order Management interface and VTEX DO task management. A dedicated return portal may be considered as a future phase.

**Third-party return logistics** — physical return shipping label generation and carrier integration for returns is dependent on the Fulfillment module. This vision covers the workflow and data model; carrier integration is a dependency, not in scope.

**Marketplace seller return flows** — the initial scope covers owned marketplace (VTEX as the seller). External seller return flows add complexity in status propagation that is deferred to a future phase.

---

## High Level Phasing

1. **Phase 1 — Prototype and validation (H2 2025):** Build and validate the prototype with 3 merchants. Approve the RFC. Deliver early UI screens for internal review. Validate the conversational AI model for return query handling with Weni.

2. **Phase 2 — Early release and GA (H1 2026):** Ship the native return workflow to GA with shopper self-service, merchant policy configuration, return status in order history, and Weni integration for AI-assisted customer service. Cover B2B and B2C scenarios.

3. **Phase 3 — Exchange flow and marketplace extension (H2 2026+):** Full exchange order flow (replacement item creation and fulfillment). Extend return workflow to external marketplace seller scenarios. Add return analytics (return rate by reason, segment, seller) to the Order Lifecycle Management dashboard.

---

## Hotly Debated Topics

**1. Should the return management interface be part of Order Lifecycle Management or a standalone module?** The 3Y vision document states this vision will not focus on a dedicated interface. However, merchants with high return volumes (grocery, fashion) need an operational view of pending returns. The boundary between VTEX DO task management and a dedicated return queue must be resolved.

**2. Weni integration scope.** Weni is a conversational AI platform. The scope of the integration (which return scenarios it handles autonomously vs. escalates) requires a design sprint with the Weni and AI Workspace teams before RFC finalization.

---

## FAQs

**Why build this natively instead of certifying a best-in-class third-party?** VTEX's competitive positioning requires native return capability — it is weighted at 6% in Gartner and Forrester OMS evaluations. Certified third-party integrations exist but do not close the competitive gap in enterprise sales evaluations that ask "does VTEX have native returns?" Additionally, native integration enables PII compliance, unified order history, and AI-assisted service flows that third-party tools cannot deliver within the VTEX platform.

**What about the Returns App that already exists?** The Returns App is a third-party app in the VTEX App Store — it is not a native OMS capability and does not create native order status events. This vision replaces that model with a platform-level workflow.

**How does this interact with the Agentic Workflow?** Returns and Exchanges is designed as a workflow instance within the Agentic Workflow engine. It is the first concrete use case that validates the workflow extensibility model, and the RFC for both features must be developed in coordination.

---

## Appendix

### Related Assets

- [Returns and Exchanges Product Proposal](https://docs.google.com/document/d/1d_xilNZtAxxRka1uoB6R5D_Ce2YG0xjxmSIpxzyn38I/edit)
- [Returns and Exchanges Prototype (Figma)](https://www.figma.com/design/vAQKjvCql32KaE5Ybcr1js/Pending-Orders)
- [3Y DOM Product Vision — Order Workflow / Exchanges section](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
