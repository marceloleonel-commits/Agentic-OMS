# Spec: Past Capacity Observability + Public API Access

## Metadata

| Field | Value |
|---|---|
| **Spec ID** | OC-001 |
| **Module** | Fulfillment → Operational Capacity |
| **Phase** | Phase 2 — Full Observability, Value Metrics + API Access |
| **Vision Reference** | `product-vision.md` → Phase 2, Key Capabilities 1, 2, 3 |
| **Author** | Carol Tourinho |
| **Status** | Draft |
| **Created** | May 2026 |
| **Personas** | Ecommerce Manager, Operations Manager, Fulfillment Manager |

---

## What This Spec Covers

This spec defines the requirements for **past capacity observability and public API access** — the foundational milestone of Phase 2.

The scope is deliberately bounded: it covers reading and surfacing data that already exists in the system (past capacity allocation, order-to-slot mapping, utilization history) and making that data available through a public API. It does not cover value metrics dashboards, proactive recommendations, or dynamic capacity release, which are separate capabilities in Phase 2 and beyond.

**What changes when this ships:**
- Merchants can see past capacity allocation — which orders consumed which slots, per day and per seller — without opening a support ticket.
- Merchants and integrators can retrieve the order-capacity relationship via a documented, public API.
- The data model becomes the foundation for Fulfillment Agent access, BI integrations, and the value metrics dashboard.

---

## Context

Operational Capacity reached GA in early 2026 with a stable foundation: a single unified version, self-enrollment via VTEX Admin, and sales channel segmentation. The module enforces daily order limits per seller correctly. The problem is that it does so invisibly.

The admin today shows capacity for the current day and the next three days only. There is no view of what happened in the past, no way to see which order IDs consumed which capacity slots, and no public API to retrieve this data programmatically.

Two concrete incidents crystallized this gap:

1. **Obramax** required a manual extraction from VTEX support to understand how orders were allocated across their main seller during Jan 25–Feb 1, 2026 — a period when the seller ran at 100% utilization for 7 consecutive days. The merchant had no way to see this themselves.
2. **C&A and Obramax** have formally and explicitly requested API access to capacity data, documented in the Path to GA document and the C&A Customer Need.

Both requests resolve to the same underlying need: a supported, self-service path to query what the module has done.

---

## Problem Statement

> Merchants cannot see what Operational Capacity did in the past, cannot trace which orders consumed which capacity slots, and have no supported API to retrieve this data for external tools. The only path to this information today is a support ticket.

The current public [Operational Capacity API](https://developers.vtex.com/docs/api-reference/operational-capacity-api) supports:
- Reading and writing capacity configuration (limit per seller)
- Querying upcoming capacity state (today + 3 days forward)

It does not support:
- Historical capacity data (any day before today)
- Order-to-capacity-slot mapping (which order consumed which day's slot)
- Capacity event log (what changed, when, and why)
- Utilization metrics over a time range

An internal API with this data exists but uses non-public resource identifiers and is not designed or documented for merchant use.

---

## User Stories

### US-01 — Past Capacity View in Admin (Merchant)

**As** an Ecommerce Manager,
**I want** to see how capacity was used on any past day — including how many orders were placed, which sellers reached their limit, and whether the limit was exceeded —
**So that** I can audit what the module did and justify whether the configuration was correct, without contacting support.

**Acceptance criteria:**
- The admin capacity view allows navigating to past dates (minimum 90 days back).
- For each past day, the merchant can see: limit configured, orders placed, % utilization, whether the limit was hit.
- Data is scoped per seller and per sales channel, consistent with the current capacity configuration model.

---

### US-02 — Order-to-Capacity Allocation View (Merchant)

**As** an Operations Manager,
**I want** to see which order IDs consumed capacity on a given day and seller,
**So that** I can cross-reference capacity events with my order management system and understand exactly what the module did to specific orders.

**Acceptance criteria:**
- For a given seller + day combination, the merchant can see the list of order IDs that were processed within that capacity slot.
- Each order entry shows at minimum: order ID, order creation timestamp, and capacity day assigned.
- The view is accessible in the admin and queryable via API.
- Data is available for at least 90 days in the past.

---

### US-03 — Programmatic Access via Public API (Integrator / BI)

**As** an enterprise merchant integrator (C&A, Obramax),
**I want** to retrieve capacity history and order allocation data via a public, documented API,
**So that** I can feed VTEX capacity data into our internal BI tools, operational dashboards, and automated reporting without depending on VTEX support extractions or undocumented endpoints.

**Acceptance criteria:**
- The public API exposes: capacity utilization history by seller + date range, order-to-slot allocation by seller + date range, and capacity event log.
- The API uses publicly documented, stable resource identifiers (no internal segmentation IDs required).
- Endpoints are fully documented on developers.vtex.com with request/response schemas, authentication requirements, and pagination behavior.
- API responses are consistent with the admin view — same data, different surface.
- Pagination is supported for high-volume sellers (response sets > 1,000 orders per day).

---

### US-04 — Capacity Event Log (Operator)

**As** an Operations Manager,
**I want** to see a log of capacity-related events — when limits changed, when a seller hit 100%, when the module extended a delivery promise —
**So that** I can reconstruct what happened during an incident or spike without relying on manual notes.

**Acceptance criteria:**
- The event log records: limit configuration changes (who changed, old value, new value, timestamp), daily limit-hit events (seller + date), and delivery promise extension events triggered by the module.
- The log is accessible in the admin and queryable via API.
- Minimum retention: 90 days.

---

### US-05 — Graceful Degradation When Historical Data Is Unavailable

**As** a merchant using a seller that was enrolled in Operational Capacity after this feature ships,
**I want** the system to clearly indicate when historical data is not yet available (because allocation events were not recorded before this feature was built),
**So that** I understand the data boundary and do not interpret the absence of data as an absence of capacity events.

**Acceptance criteria:**
- The admin and API clearly indicate the start date of available history.
- Past dates before the data availability start are shown as "historical data not available" rather than zero utilization.
- The data availability start date is exposed in the API response metadata.

---

## Functional Requirements

### FR-001 — Extended Calendar Navigation
The capacity admin view must support navigation to past dates, with a minimum lookback window of 90 days. The forward window remains up to 18 days.

### FR-002 — Daily Utilization Summary
For each past day, the admin must display:
- Configured limit (orders/day)
- Orders placed within that capacity slot
- Utilization percentage (orders placed ÷ limit × 100)
- Limit hit indicator (boolean: yes/no)
- Seller and sales channel filter, consistent with the current configuration model

### FR-003 — Order-to-Slot Allocation View
For a given seller + date selection, the admin must surface the list of order IDs allocated to that capacity slot. Minimum fields per order entry: order ID (linkable to OMS order detail), order creation timestamp, capacity day assigned.

### FR-004 — Capacity Event Log
A timestamped log of capacity-relevant events, accessible per seller in the admin:
- Limit configuration changes: actor (user), previous value, new value, timestamp
- Limit-hit events: seller, date, final utilization count
- Delivery promise extension events: seller, date, number of orders whose promise was extended

Event log must be queryable by date range and exportable via API.

### FR-005 — Public API: Utilization History
New public endpoint:

```
GET /api/operations/pvt/capacity/history
```

Parameters: `sellerId`, `from` (date), `to` (date), `salesChannelId` (optional), `page`, `pageSize`.

Response: array of daily utilization objects per seller — limit, orders placed, utilization %, limit hit flag, data availability start date.

### FR-006 — Public API: Order Allocation by Day
New public endpoint:

```
GET /api/operations/pvt/capacity/orders
```

Parameters: `sellerId`, `date`, `salesChannelId` (optional), `page`, `pageSize`.

Response: array of order allocation entries — orderId, orderCreatedAt, capacityDay, sellerId, salesChannelId.

### FR-007 — Public API: Capacity Event Log
New public endpoint:

```
GET /api/operations/pvt/capacity/events
```

Parameters: `sellerId`, `from`, `to`, `eventType` (optional: `limit-change`, `limit-hit`, `promise-extension`), `page`, `pageSize`.

Response: array of event log entries — eventType, timestamp, sellerId, details object (varies by type).

### FR-008 — API Authentication and Authorization
All new endpoints must use the same authentication model as the existing Operational Capacity API (AppKey/AppToken or OAuth). Access must be scoped to the merchant account — a seller account cannot retrieve allocation data from other sellers.

### FR-009 — Pagination
All API endpoints that return lists must support cursor-based or offset pagination. Maximum page size: 500 items. Total count must be included in the response envelope.

### FR-010 — Data Availability Signal
The API response envelope for history and order allocation endpoints must include a `dataAvailableFrom` field (ISO 8601 date) indicating the earliest date for which allocation data was recorded. The admin view must surface this boundary visually when the user navigates to dates before it.

### FR-011 — Admin and API Consistency
The data surfaced in the admin view and the data returned by the API must be identical. No divergence between surfaces is acceptable — they must read from the same data layer.

### FR-012 — Seller-Level Scoping from Main Account
All observability features must be accessible from the main merchant account, scoped by seller. Merchants should not need to log into individual seller accounts to retrieve this data. This is consistent with the existing configuration model and the non-goal of per-seller account management.

---

## API Mapping

| Requirement | Endpoint | Status |
|---|---|---|
| Upcoming capacity state (existing) | `GET /api/logistics/pvt/capacity` | Public, available today |
| Configuration read/write (existing) | `GET/PUT /api/logistics/pvt/capacity/sellers/{sellerId}` | Public, available today |
| **Past utilization history** | `GET /api/operations/pvt/capacity/history` | **New — this spec** |
| **Order-to-slot allocation** | `GET /api/operations/pvt/capacity/orders` | **New — this spec** |
| **Capacity event log** | `GET /api/operations/pvt/capacity/events` | **New — this spec** |

> **Note on existing internal API:** An internal endpoint exists that retrieves capacity data by date range using a `segmentationResourceId`. This spec does not extend or expose that endpoint. The new public endpoints are designed from the ground up for merchant use, with stable public identifiers (sellerId, salesChannelId) as keys. The engineering team may choose to use the internal data layer as the backend for the new endpoints, but the public interface must not expose internal resource IDs.

---

## Non-Functional Requirements

### NFR-001 — Read-Only
All new endpoints are read-only. This spec does not introduce any mutation to capacity state, configuration, or order allocation. There are no side effects.

### NFR-002 — Historical Data Availability
The system must record allocation events starting from the moment this feature is deployed. There is no requirement to backfill historical data from before the feature ships. The `dataAvailableFrom` field communicates this boundary explicitly.

### NFR-003 — Retention
Capacity allocation data and event log entries must be retained for a minimum of 90 days. Future phases may extend this window.

### NFR-004 — Performance
Admin past-day views must load within 2 seconds for sellers with up to 5,000 orders per day. API endpoints must return responses within 1 second for single-day queries (P95). Date-range queries up to 30 days must return within 3 seconds (P95).

### NFR-005 — Documentation
All three new public endpoints must be fully documented on developers.vtex.com before the feature is considered Generally Available. Documentation must include: authentication, request parameters, response schemas with field descriptions, example requests and responses, error codes, and pagination guidance.

---

## Out of Scope

- **Value metrics dashboard** (orders protected count, delivery promise extensions count, utilization trends) — these are a separate capability in Phase 2 and will be specced independently.
- **Proactive limit recommendations** — Phase 3.
- **Dynamic capacity release** — Phase 4, `automatic-capacity-release.md`.
- **Delivery Promise integration** — owned by the Delivery Promise team, Phase 3.
- **Fulfillment Agent integration** — the observability infrastructure built here enables the agent to consume this data, but the agent layer is built and owned outside this module.
- **Real-time streaming or webhooks** — API access in this spec is pull-based (REST GET). Event-driven access (webhooks, streams) is not in scope.
- **Data export (CSV, PDF)** — not in scope for this spec; may be added as a UI feature in a follow-up.
- **Seller Portal sellers and external marketplace sellers** — consistent with the vision non-goals.

---

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | What is the data retention requirement beyond 90 days? Does VTEX store raw order-capacity events in a queryable form today, or does this require new event instrumentation? | Engineering | High |
| 2 | Is `sellerId` sufficient as the primary key for the new endpoints, or do they need to also accept `segmentationResourceId` for backward compatibility with any existing integrations? | Engineering | High |
| 3 | Should order allocation data be queryable by `orderId` (i.e., "which capacity slot did order X consume?") in addition to the seller+date query already specified? This could simplify merchant support workflows. | Carol | Medium |
| 4 | What is the performance envelope for sellers with very high order volume (e.g., C&A main seller at peak)? Are the P95 targets above realistic? | Engineering | Medium |
| 5 | Should the capacity event log include seller-level limit override events (e.g., when the merchant temporarily raises a limit for a specific date range)? | Carol | Medium |
| 6 | Is the `dataAvailableFrom` boundary a hard constraint (data before that date is irretrievable) or will there be a backfill effort for any period? | Engineering | Low |
