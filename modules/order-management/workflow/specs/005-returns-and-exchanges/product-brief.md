# Product Brief — Returns and Exchanges: Foundation of Return & Exchange Management

| Field | Value |
|---|---|
| **Module** | Order-management |
| **Pillar** | Returns and exchanges |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | Jhonatan Raphael |
| **Status** | Draft |
| **Expected Release** | Alpha H2 2025 · MVP 2026-Q2 |
| **Availability** | Closed Beta |
| **Access** | API (Alpha) · OMS Admin UI + My Orders (MVP) |
| **Mode** | B2C & B2B |


## MMR

**Title:** Foundation of Return & Exchange Management

**Description:** With this release, merchants will have a native, API-first infrastructure to manage the full lifecycle of return and exchange requests within VTEX OMS. Shoppers will be able to initiate partial or full return requests directly from My Orders, and merchants will be able to review, approve, and process these requests without leaving the platform. VTEX OMS becomes the single source of truth for post-purchase operations, replacing fragmented third-party tools (ReturnAPP, PickAndPack) and eliminating the need for custom integrations with carriers and payment gateways.

**Availability:** Closed Beta · H2 2025 (API) · 2026-Q2 (OMS Admin UI + My Orders)

**Target Audience:**
- Tier: Tier-1 and advanced Tier-2 merchants operating in Brazil, the United States, and LATAM — especially in fashion, pharma, and construction materials verticals
- Persona: Primary — OMS Operators, SAC Agents, Fulfillment Managers; Secondary — Shoppers (self-service via My Orders), Integration Engineers
- Pain: VTEX currently supports only 12% of the return and exchange flow natively. Merchants are forced to use disconnected tools (ReturnAPP, PickAndPack) that lack integration with OMS core, making it impossible to track return status within the order record. There is no automated shipping code generation, no inventory reintegration after confirmed returns, no native SKU exchange, and no unified interface — each tool maintains its own data repository that does not communicate with OMS. This drives integration costs, operational errors, and prevents Weni AI from accessing accurate post-purchase data to support buyers.
- Use Case: Allow shoppers to submit return requests linked to an existing order, specify items and return reasons, and receive shipping instructions — all within the VTEX storefront. Allow merchants to review, approve, or reject requests on a per-seller, per-item basis, track reverse logistics, and trigger refunds automatically through VTEX's payment gateway.

---

## Scope

**In scope:**
- Return and exchange request API: create, update, and query return requests linked to an order (one `returnId` per order, per marketplace or seller account)
- Dual-view data architecture: MarketplaceReturn (shopper data + aggregated seller results) and SellerReturn (per-item operational status and approved/denied quantities)
- Seller-scoped update isolation: each seller can independently update the operational status of their own items (pre-check, reverse logistics, inspection, approval/rejection) without accessing or affecting other sellers in the same order
- Marketplace/Admin controls: cancel the return, execute consolidated refund after all sellers complete analysis, update global return fields (refund method, pickup address)
- Shopper self-service via My Orders: return request initiation with item selection, quantity, return reason, and preferred return method (home pickup, carrier drop-off, in-store)
- Supported return methods: home pickup, carrier drop-off point / locker, in-store return
- Supported compensation methods: financial refund to original payment method; gift card / store credit
- Automatic refund processing via VTEX payment gateway after return confirmation by the marketplace
- Automatic inventory reintegration of returned items in good condition after inspection approval
- Return tracking and status notifications (email and My Orders update) triggered by status transitions
- Integration with carriers for return label generation and shipment tracking
- Configurable return eligibility rules: return window (days since delivery), product categories eligible for return
- Full audit log per return operation: actor, actor type, timestamp, operation type, before/after state, reason
- Observability: return creation/update metrics, status transition times, failure rates, return volume by account, structured logs (`returnId`, `orderId`, `userId`)
- Async event pipeline via SNS: events published on every return state change, consumed by notifications, automatic approvals, and workflow triggers
- GraphQL queries for supporting data: eligible orders for return, nearby drop-off/collection points, product category tree (migrated from ReturnAPP resolvers to Orders GraphQL)
- Closed Beta with at least one Tier-1 merchant (BRA or USA) validating the end-to-end flow

**Not in scope:**
- Exchange with new order creation (targeted for Phase 3 / Beta); this release handles returns with refund or gift card only
- Automated approval rules based on predefined merchant conditions (targeted for Phase 2 / Return Authorization & Automation)
- Integration with external CRM and ERP systems for return tracking (Phase 3 / Seamless Return Integration)
- Printer-free returns via QR Code (Phase 3)
- Subscription returns and exchanges
- Returns from external marketplace orders (e.g., Mercado Livre, Amazon) in `invoiced` status within VTEX — not supported in Phase 1 due to platform constraints
- Complete decommissioning of ReturnAPP frontend; coexistence expected during Alpha and MVP phases
- Pick and Pack UI integration (follows after Phase 1 API foundation is established)
- Returns for digital products, services, and gift cards
- Weni AI integration in the buyer flow (targeted for Phase 3, after API-first foundation is available)
