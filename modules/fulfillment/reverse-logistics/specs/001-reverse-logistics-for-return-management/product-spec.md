# Product Spec — Reverse Logistics for Return Management

> **Engineering-facing, testable artifact.** Scope is Fulfillment reverse logistics only. Business framing and benchmarks live in the BRD/PRD. OMS Return entity behavior lives in `order-management/.../005-returns-and-exchanges`.

## Clarifications

- **External-provider release, not native.** VTEX does not model the full return options logic; it resolves dynamically via the provider (Intelipost for Dafiti Brazil). The same VTEX parent account can connect to more than one provider; Dafiti uses two separate accounts (Brazil and Colombia).
- **Ownership boundary.** OMS owns the Return entity, eligibility, item selection, reasons, compensation, approval, return invoicing, and platform events. Fulfillment owns the reverse logistics provider integration: return methods, drop-off locations, return execution information, and reverse logistics status updates (received via endpoints and propagated to OMS/events).
- **VTEX does not generate** labels, QR codes, posting codes, or tracking codes — these come from the provider/merchant operation.
- **Standard contract.** The provider integration is a contract any provider implements, with two directions: `VTEX → Provider` (consult, synchronous) and `Provider → VTEX` (inform, asynchronous).
- **No admin UI in this scope.** Reverse logistics is a **backend provider integration** — it is not expected to ship an admin visual interface. The visual experience (operator/SAC and shopper-facing) is owned by the **OMS workflow and front-end**, which run the return flow inside the order and surface `returnLogistics` data. Fulfillment exposes the data and integration; OMS/front-end render it.

## Functional requirements

- **FR-001** — Fulfillment MUST resolve available return methods dynamically through the external provider at return initiation time.
- **FR-002** — The method request MUST carry enough context for provider resolution: ordergroup, returned items, seller/return destination, shopper address, return reason.
- **FR-003** — Fulfillment MUST support drop-off location lookup when the selected method requires a physical location, and MUST NOT require it for home pickup when the address is known.
- **FR-004** — Fulfillment MUST receive and persist provider-generated execution information in `returnLogistics`.
- **FR-005** — VTEX MUST NOT generate labels/QR/posting/tracking codes.
- **FR-006** — Fulfillment MUST expose endpoints to receive reverse logistics status updates and validate return identifier, provider reference, account scope, and allowed transition.
- **FR-007** — Accepted updates MUST be propagated to OMS and platform events.
- **FR-008** — Duplicate provider calls or repeated status updates MUST be handled idempotently.
- **FR-009** — Provider errors MUST be returned as structured errors with enough context to retry, fallback, or route to SAC.
- **FR-010** — Multi-seller returns MUST be resolved by group/destination; do not assume one order shares the same reverse logistics options.
- **FR-011** — The system MUST preserve an audit trail (provider requests/responses, status updates, actor/source, timestamp, failures).

## Acceptance scenarios

### REQ-01 — Show available return methods (P1)
**Given** an eligible return context (order/group, returned items, seller/destination, shopper address, reason), **when** the shopper reaches the return method step, **then** Fulfillment retrieves methods from the provider and returns: method name, method type (`pickup`/`drop-off`), cost, payer, estimated SLA, shopper instructions.
- No methods available → structured no-methods state for shopper/SAC.
- Changed group/items → methods re-resolved with updated context.

### REQ-02 — Show available drop-off locations (P1)
**Given** a selected drop-off method and shopper location, **when** Fulfillment requests locations, **then** it returns eligible locations with: location name, address, provider reference, shopper instructions.
- Pickup method with known address → no location lookup required.
- No locations available → structured no-locations state; shopper cannot confirm that method.

### REQ-03 — Receive and store return execution information (P1)
**Given** a confirmed return with selected method and location/address when applicable, **when** Fulfillment calls the provider, **then** it persists in `returnLogistics`: return code, tracking code, selected method, method type, location/pickup address, carrier/provider info, provider reference, shopper instructions, latest status, status history, timestamps.
- Provider failure → structured error, recoverable state, not marked completed.
- Retried with same operation reference → idempotent, no duplicate provider records.

### REQ-04 — Receive reverse logistics status updates (P1)
**Given** a valid `returnId` and provider reference, **when** VTEX receives a status update, **then** it validates, associates with the correct `returnLogistics` record, and propagates to OMS/events.
- Accepted status values: `pickup_scheduled`, `posted`, `collected`, `in_transit`, `delivered`, `failed`, `expired`, `cancelled`.
- Unknown/unauthorized reference → rejected with structured error, no state change.
- Duplicate event → idempotent, no duplicate transitions/notifications.

## Data & contract expectations

### `returnLogistics` (minimum)
selected return method · method type (`pickup`/`drop-off`) · selected drop-off location or pickup address (when applicable) · return code · tracking code · carrier/provider information · provider reference · shopper instructions · latest logistics status · logistics status history · timestamps (provider creation and status updates).

### Provider protocol — interaction directions
| Direction | Pattern | Initiator | Operations |
|---|---|---|---|
| `VTEX → Provider` (consult) | Synchronous request/response | VTEX | List return methods (REQ-01), list drop-off locations (REQ-02), create return execution / return code (REQ-03) |
| `Provider → VTEX` (inform) | Asynchronous push to VTEX endpoints | Provider / merchant operation | Reverse logistics status updates (REQ-04) |

**To define for the protocol to scale:** request/response schemas per operation; provider authentication and account-scoping; versioning and breaking-change policy; whether `Provider → VTEX` uses webhooks, polling, or both.

## Assumptions

- Intelipost is the first provider for the Dafiti release.
- OMS already owns/defines the Return entity, eligibility, reasons, compensation, approval, and events.
- Fulfillment creates a new dedicated service/repository for the reverse logistics integration.
- Exchange-specific flow is OMS-owned and still under discovery; it must not block this release.

## Success criteria

- SC-001 — Dafiti completes the first provider-led return flow via VTEX with OMS as Return owner.
- SC-002 — Methods resolved dynamically via Intelipost using order/group, item, seller/destination, shopper address.
- SC-003 — Drop-off locations retrieved/displayed when the method requires a physical location.
- SC-004 — Execution information persisted in `returnLogistics`.
- SC-005 — Status updates accepted, validated, stored, propagated to OMS/events.
- SC-006 — OMS/Fulfillment boundary reflected in the RFC and validated by engineering.
- SC-007 — Duplicate provider responses/updates do not create duplicate records or transitions.
- SC-008 — Observability for method resolution, location lookup, return code creation, status ingestion, provider failure rates and latency.
- SC-009 — Ready for Dafiti testing by Sep 2026.

## Out of scope

Native reverse logistics configuration · admin UI for return policies/methods · VTEX-generated labels/QR/posting/tracking codes · direct VTEX↔Dafiti SAP/SQS/WMS integration · full global multi-provider framework · carrier management inside VTEX · exchange-specific actions and new order creation (OMS) · inventory reintegration after inspection · automated approval rules · native in-store returns.

## Open questions

1. Return code created on shopper confirmation or only after merchant approval?
2. Intelipost status updates via webhooks, polling, or both?
3. Which `returnLogistics` fields are mandatory vs. optional for the first release?
4. How does OMS model multiple return groups in one order?
5. Provider-side cancellation behavior if OMS cancels a Return after execution info exists?
6. Are fiscal documents for reverse shipment merchant/provider-owned, or does VTEX store references?
