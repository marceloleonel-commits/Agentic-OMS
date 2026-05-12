# Order Management

| | |
|---|---|
| **Pillar** | Native omnichannel support |
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **PM** | [Marcelo Leonel](mailto:marcelo.leonel@vtex.com) |
| **EM** | [Heliomar Santos](mailto:heliomar.santos@vtex.com) |
| **Status** | Active |

---

## What This Module Is

Order Management is the OMS core of the VTEX platform. It owns the full post-purchase order lifecycle — from order creation through status transitions, modifications, invoicing, tracking, cancellations, and returns. The module is being modernized from the legacy OMS (Windows, .NET Framework) to the new Orders architecture (Linux, .NET Core), enabling the extensible, configurable workflow model required to support diverse business models, regions, and omnichannel scenarios natively. The 3-year direction is to evolve from a status-driven single workflow into a task-driven order orchestration hub — with configurable workflows per order type, AI agents resolving exceptions autonomously, and VTEX as the unambiguous source of truth for every order in the merchant's network.

---

## Services in Scope

| Service | Description |
|---------|-------------|
| Sales Order System (SOS) | New order management system replacing the legacy OMS — handles order status transitions, lifecycle orchestration, and the API surface |
| Order Index (SOLR9) | Search index for orders — migrated from SOLR6 in H1 2025 for Black Friday resilience and cost reduction |
| Order Authorization Engine | Rule-based order intake control — authorizes orders based on value thresholds, budget limits, and B2B buying policies |
| Change Order Service | Handles item, address, carrier, and seller modifications at any lifecycle stage — including freight and tax recalculation, inventory updates, and partial invoicing scenarios |
| Subscriptions | Manages recurring order schedules, renewal notifications, and payment method configuration for subscription-based commerce |
| VTEX DO (Task Management) | Surfaces pending order actions (cancellation requests, authorization holds, stuck orders) for merchant operations teams |
| Customer Service Assistant | AI-powered (Weni) interface for customer service agents — unified order view, action execution (cancel, refund, reroute), and conversational AI handling high-volume post-purchase queries |

---

## Problems This Module Solves

1. **A single rigid workflow cannot support the full range of business models.** VTEX's default workflow was designed for B2C delivery in Brazil. It does not natively support BOPIS, BORIS, ship-from-store, B2B approval chains, or virtual product delivery. Merchants build costly customizations that route order data outside VTEX, breaking its role as source of truth. Competitors (Salesforce, Manhattan, IBM Sterling) offer configurable workflow models out of the box.
2. **No native returns and exchanges flow.** Every VTEX merchant must integrate a third-party tool (e.g., Aftersales) to handle returns. These tools create split order records outside VTEX, complicating PII compliance under GDPR and LGPD. Returns capability carries 6% weighting in Gartner/Forrester OMS evaluations.
3. **Payment capture is hardcoded to invoicing.** In EMEA and the US, merchants need payment capture confirmation before issuing shipping tracking codes. VTEX hardcodes capture at invoice, forcing merchants to generate dummy invoices — creating false accounting records and requiring parallel reconciliation.
4. **Order modifications lack support for complex scenarios.** Multi-tier franchise account orders, partially invoiced orders, freight recalculation with external sellers, and order splitting by SKU all require significant custom development that merchants absorb independently.
5. **No proactive operational visibility.** Operations teams discover stuck orders, delivery deadline breaches, and workflow failures from customer complaints — not from the system. There are no native bulk operations and no cross-account unified view for franchise architectures.

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Order Lifecycle Management](order-lifecycle-management/product-vision.md) | Unified order view with proactive alerts, bulk operations, AI-assisted troubleshooting, and role-aware interface for complex omnichannel and franchise account architectures | In Progress — H2 2025 |
| [Returns and Exchanges](returns-and-exchanges/product-vision.md) | Native return and exchange workflow embedded in the order lifecycle — replaces third-party dependency; includes shopper self-service, merchant policy configuration, and Weni AI-assisted customer service | Active — Prototype H2 2025 |
| [Agentic Workflow](agentic-workflow/product-vision.md) | Configurable order orchestration engine with predefined workflow models (BOPIS, BORIS, ship-from-store, B2B), entry points for third-party apps, and AI agents for exception handling | In Progress — RFC H2 2025 |
