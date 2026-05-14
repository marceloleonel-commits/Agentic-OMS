# Product Brief — Change Seller: Partial Seller Reallocation

| Field | Value |
|---|---|
| **Module** | Order-management |
| **Pillar** | Order modification |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | Túlio Araújo |
| **Status** | Draft |
| **Expected Release** | MVP 2026-Q2 |
| **Availability** | Closed Beta |
| **Access** | API (MVP) · OMS Admin UI (MLP) |
| **Mode** | B2C & B2B |


## MMR

**Title:** Change Seller 2.0 — Partial Seller Reallocation

**Description:** With this release, merchants will be able to reassign individual items or partial quantities within an OrderGroup to a different seller — without cancelling the order. When a stock shortage is discovered at picking, invoicing, or shipping, operators can move only the affected units to an alternative seller and keep the rest of the order intact. VTEX OMS becomes the orchestrator of the reallocation, maintaining a complete audit trail of every change to item, payment, and shipment.

**Availability:** Closed Beta · 2026-Q1 (API) · 2026-Q1 (UI + external sellers + payment fallback)

**Target Audience:**
- Tier: Tier-1 and advanced Tier-2 merchants and marketplaces
- Persona: Primary — OMS Operators, SAC Agents, Marketplace Admins; Secondary — Integration Engineers (Tier-1)
- Pain: When a seller cannot fulfill part of an order, merchants have no native way to reassign only the affected items to an alternative seller. Change Seller only applies at early order statuses — before stock issues are visible — and has no support for partial quantity moves. The result is a full order cancellation even when other sellers have stock, or an operational workaround via external tools that bypasses OMS and destroys traceability.
- Use Case: Allow operators to select specific items and quantities from an active order, choose a destination seller, and complete the reallocation within VTEX OMS — preserving payment integrity, delivery promises, and a single operational timeline.

---

## Scope

**In scope:**
- Partial seller reallocation per item and per quantity within an OrderGroup (e.g., move 2 of 5 units to Seller B)
- Reallocation to sellers already part of the OrderGroup (item move between existing orders) and to new sellers (new order created and linked)
- Support for external (3P) marketplace sellers as destination
- Configurable allowed statuses per workflow template (e.g., authorized, picking, pre-invoicing)
- Payment connector fallback configuration (coupon/credit note, block, or manual handling) for connectors that do not support automatic adjustments
- Admin UI for OMS Operators and SAC Agents to perform reallocation with full order context and preview of impacts
- Full audit log per reallocation operation (user, timestamp, before/after state, reason)
- Monitoring and reporting: Change Seller request volume, success vs. error rate, orders saved from cancellation, error breakdown by cause
- Distributed locking and rollback at OrderGroup level to prevent concurrent corruption

**Not in scope:** Full replacement of legacy Checkout-level Change Seller flows (coexistence and gradual migration expected); digital products, services, and subscriptions (physical goods only in initial scope); complete financial/accounting ledger (OMS orchestrates financial intent; ERPs and PSPs remain systems of record for financial postings); replacing external enterprise OMS or order brokers across the whole company.
