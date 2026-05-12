[Product Vision]: 3-Year Order Lifecycle Management — Unified Order Operations

| Status | Draft | Owner(s) | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines Order Lifecycle Management as the operational interface for managing all orders across the VTEX platform — unified, proactive, and role-aware. It covers a 3-year horizon and is intended to align Order Management, AI Workspace, and Design around replacing the current fragmented order management UI with an interface built for complex omnichannel operations. The primary objective is to make VTEX the definitive control panel for every order-related action a merchant takes, from order creation through delivery and post-purchase.*

---

| TL;DR |
|---|
| **Product/Area:** Order Management — Order Lifecycle Management |
| **Focus Task:** Provide operations teams with a unified, real-time, and role-aware interface to manage, monitor, and act on all orders across all sales channels and seller tiers |
| **Persona:** Ecommerce Operations Manager, Customer Service Manager, and Logistics Coordinator at Tier 1 omnichannel merchants running multi-tier architectures (marketplace + whitelabel sellers + external sellers) |
| **Working title/Commercial Name:** Order Lifecycle Management (consolidates Order History + Order Tracking) |
| **Value headline:** Operations teams get a single interface to manage every order in their network — with proactive alerts for at-risk orders, bulk operations, and AI-assisted troubleshooting — replacing the current model where managing complex omnichannel orders requires accessing multiple VTEX accounts and external systems. |
| **Mini-Press Release:** VTEX's current order management interface was designed for single-account B2C operations in Brazil. For merchants running omnichannel architectures with franchise accounts, multiple marketplace tiers, and high daily order volumes, the interface fails: split orders across franchise accounts cannot be viewed together, there are no proactive alerts for delayed orders, and customer service agents lack the tools to diagnose and resolve exceptions without engineering support. VTEX is rebuilding Order Lifecycle Management as a unified, real-time, AI-assisted operations interface that works at the complexity level of today's enterprise merchants. |
| **Opportunity Size:** [PM INPUT NEEDED: estimate of enterprise merchant accounts for whom the current order list is a documented pain — cite ODP project data, support tickets, or churn signals] |

---

## Problem / Opportunity

### 1. Narrative framing

Ecommerce Operations Managers at Tier 1 merchants with franchise account architectures cannot view or manage their full order picture from a single interface. When a customer places an order that is fulfilled by multiple sellers across different franchise accounts, the order is split across those accounts — each visible only to the account that owns it. The customer service representative who needs to resolve a delivery issue must access multiple VTEX accounts to reconstruct what happened to that order.

In practice, this means:
- A customer service rep at a large retailer opens 3–5 different VTEX Admin accounts to track a single omnichannel order with split fulfillment
- Orders stuck in intermediate statuses (e.g., `approve-payment`, `on-order-completed-ffm`) due to silent workflow failures are not surfaced proactively — the merchant discovers them when the customer calls
- The Order List page loads the 50 most recent orders with no filter preset, requiring repeated manual filtering for any operational review workflow
- Bulk operations (reallocate multiple orders to a different carrier, cancel a batch of stuck orders) are not natively supported — each order must be acted on individually

Business impact:
- Customer service resolution time increases proportionally with order complexity — each additional seller tier adds a separate account lookup
- Merchants cannot detect delivery promise failures proactively — they learn about delayed or stuck orders from customer complaints, not from the system
- Operations teams build custom dashboards outside VTEX (BI tools, spreadsheets) to monitor order health, because the OMS does not expose operational metrics natively

### 2. Why Now

The Order Management module is undergoing a structural modernization (OMS → Orders migration, SOLR6 → SOLR9). This is the right moment to redesign the operational interface alongside the data model, rather than putting a new UI on the old foundation. The ODP project delivered 14 of 21 mapped customer needs in H1 2025 — several of those are Order List improvements (filters, bulk operations) that create the technical foundation for this vision.

Additionally, the AI Workspace team and Weni are available platform partners. Integrating AI-assisted troubleshooting into the Order Lifecycle interface is a H2 2025 design goal, making this the planning window to define the long-term vision it serves.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Unified order view across franchise account tiers | All parts of a split order visible in a single interface with full timeline | Tier 1 omnichannel retailers: customer service resolves split-order issues without multi-account access |
| Proactive alerts for at-risk orders | System surfaces orders approaching or past delivery promise without merchant manual check | Any merchant: alert when order has not been invoiced within X hours of promised delivery date |
| AI-assisted troubleshooting for stuck orders | AI agent diagnoses order status anomalies and suggests corrective actions | Customer service team: chatbot suggests "reallocate to store B" for a stuck `on-order-completed-ffm` |
| Bulk order operations | Merchant can apply an action (reallocate, cancel, export) to a selected set of orders | Operations team: batch cancel 47 orders stuck due to a carrier outage |
| Customizable order list with saved filter presets | User defines columns and filter presets relevant to their role | Logistics coordinator: preset showing only orders in `invoiced` status assigned to their distribution center |

### 4. Customer Workarounds

- **1. Multi-account browsing for franchise order reconstruction.** Operations teams open parallel VTEX Admin sessions in different browser tabs to view split orders. This fails because it requires manual correlation across accounts with no shared context, and has no way to take a unified action across order parts.

- **2. External BI dashboards.** Merchants build custom Quicksight or Power BI dashboards from OMS data exports to monitor order health. This fails because it is always lagging (not real-time), requires engineering to maintain, and cannot trigger actions — it only surfaces data.

- **3. Manual VTEX DO task creation.** Customer service teams create manual tasks in VTEX DO for stuck or at-risk orders. This fails because task creation is manual (requiring someone to notice the issue first), and tasks are not linked to the order timeline or history.

---

## Vision Concepts

**Unified Order View** — A single Order Lifecycle Management interface where all tiers of a split order (marketplace + whitelabel sellers + external sellers) appear together, with a consolidated timeline of all status transitions, system interactions, and operator actions.

**Proactive Task Management** — The system surfaces pending orders requiring action (stuck statuses, delivery promise at risk, cancellation requests) to the responsible operator before they escalate to a customer complaint.

---

## Vision Statement

3-Year Vision: VTEX will be the single control panel where every merchant operation team member — regardless of role, channel, or order complexity — can see, act on, and track the full lifecycle of every order in their network, with AI assistance surfacing what needs attention before the customer notices.

1-Year Vision (H2 2025 – H1 2026): The Order Lifecycle Management interface delivers a redesigned Order List with advanced filters, saved presets, and bulk operations — and integrates AI-assisted troubleshooting for the most common exception scenarios via Weni.

### Key Capabilities

**1. Unified order view across all account tiers.** All parts of a split order — across franchise accounts, sellers, and external systems — are visible in a single record with a unified timeline, regardless of the account that owns each part.

**2. Proactive exception alerts.** The system identifies and surfaces orders at risk (approaching delivery deadline without invoicing, stuck in intermediate status for more than X hours, cancellation request pending) without requiring manual review.

**3. Role-aware order views.** The interface respects user permissions and presents relevant information for each operational role — customer service, logistics coordinator, ecommerce manager — with customizable columns and filter presets.

**4. Bulk order operations.** Operations teams can select and act on multiple orders simultaneously — cancel, reallocate, export, or assign to a workflow — without processing each order individually.

**5. AI-assisted troubleshooting.** An AI agent (Weni-powered) diagnoses common order anomalies (stuck statuses, workflow desynchronization, missing supplier assignment) and suggests or automates corrective actions based on the merchant's configured rules.

### Conditions of Satisfaction

**Unified order view available for franchise account architectures** — a customer service representative can view all parts of a split omnichannel order in a single interface for ≥95% of order types.

**Proactive alert coverage** — at minimum, the following exception types surface proactively: (1) order stuck in intermediate status for >4 hours, (2) delivery promise date passed without invoicing, (3) cancellation request pending >24 hours without merchant action.

**Bulk operations** — operations teams can act on a batch of ≥50 orders in a single operation for at least the following actions: cancel, export, and assign to workflow.

**[PM INPUT NEEDED: AI troubleshooting deflection target — what % of stuck-order support tickets should be resolved without engineering intervention?]**

### Non-Goals

**Sales performance analytics** — Order Lifecycle Management is an operational interface, not a reporting tool. Sales performance dashboards (GMV, conversion, revenue by channel) are owned by the Sales Performance Dashboard and Data & Analytics vertical.

**Returns management interface** — return requests are surfaced as tasks in VTEX DO and handled through the Returns and Exchanges workflow. A dedicated returns management view is a future phase.

**My Orders for shoppers** — the shopper-facing order history and tracking interface is owned by the Storefronts & Apps vertical (Product Discovery & My Account Experience).

---

## High Level Phasing

1. **Phase 1 — Order List redesign and ODP deliveries (H1 2025, Completed):** Delivered 14 of 21 ODP-mapped customer needs. Advanced Order List API with filtering and bulk capabilities. SOLR9 migration for BF 2025 resilience.

2. **Phase 2 — Unified view and proactive alerts (H2 2025 – H1 2026):** Unified order view for franchise account architectures. Proactive alert model for stuck and at-risk orders. Customizable columns and filter presets. AI troubleshooting integration with Weni for top exception scenarios.

3. **Phase 3 — Role-aware views and bulk operations (H1–H2 2026):** Full role-based permission model for order visibility. Bulk operations across all common order actions. Return request visibility integrated with Returns and Exchanges workflow.

4. **Phase 4 — Predictive intelligence (H2 2026+):** Predictive delivery risk scoring — surface orders likely to miss delivery promise before they breach. Order health analytics embedded in the interface. AI-generated operational summaries for shift handoffs.

---

## Hotly Debated Topics

**1. Should subscriptions be part of Order Lifecycle Management or a standalone product?** The 3Y vision positions Subscriptions as a distinct product within Checkout Platform. However, subscription-generated orders appear in the order list and need to be manageable from the same interface. The boundary between Subscriptions (order creation and schedule management) and OLM (order execution) must be explicitly defined.

**2. What is the right scope for AI troubleshooting in Phase 2?** The QBR identifies "Troubleshooting post-purchase with AI" as a H2 design goal. The specific exception types the AI agent should handle autonomously vs. escalate must be prioritized before development begins.

---

## FAQs

**Why not just improve the existing order list instead of redesigning?** The current order list was designed for single-account B2C and has fundamental constraints: it has no concept of cross-account order linking, no proactive surfacing of exceptions, and no role-aware visibility model. Incremental improvement hits the ceiling of the current data model. The SOLR9 migration and OMS → Orders architecture migration create the technical foundation for a clean redesign.

**How does this interact with the Agentic Workflow?** Order Lifecycle Management is the interface layer. The Agentic Workflow provides the extensible workflow model that defines what statuses and actions exist. OLM surfaces and operationalizes what the workflow engine produces — they are complementary, not competing.

---

## Appendix

### Related Assets

- [3Y DOM Product Vision — Order Lifecycle Management section](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)
- [AI Troubleshooting Vision (in progress)](https://docs.google.com/document/d/1vTXOAZQgRl6GpbcRgr8rmH-AHI0q766zceamewEwZUA/edit)
- [Order List Redesign Prototype](https://www.figma.com/file/YYvKaSUpBmLqLmwLBUUonU/Design-Day)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
