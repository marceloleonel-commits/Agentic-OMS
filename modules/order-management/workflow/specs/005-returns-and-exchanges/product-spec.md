# Product Spec — Returns and Exchanges: Foundation of Return & Exchange Management

## Clarifications

- **Q: Why is SOS chosen as the core application for return operations rather than a new standalone service?** → SOS concentrates the core OMS operations, guaranteeing strong consistency, seller isolation, and immediate synchronization with the order state. A new standalone service would require replicating all of this context from scratch. SOS already manages the order lifecycle and is the authoritative record for order state transitions. The only exception is the return summary endpoint (returns per order), which stays in SOS because it is needed for order workflow state transitions. *(Source: RFC Foundation of Return & Exchange Management, section 2.1.1)*

- **Q: Why is the dual-view architecture (MarketplaceReturn + SellerReturn) necessary instead of a single return record?** → In marketplace orders with multiple sellers, each seller has operational responsibility only for their own items. A single flattened record would either expose cross-seller data (a security violation) or require the marketplace to fan out all updates manually. The dual view separates shopper-facing data (MarketplaceReturn) from seller-facing operational data (SellerReturn), allowing granular per-seller updates while keeping a consistent aggregated view for the marketplace and the shopper. *(Source: RFC, sections 2.1.1 and 2.1.3)*

- **Q: Why are side effects (notifications, automatic approvals) handled asynchronously via SNS instead of in the synchronous return flow?** → The primary operation (create/update return) must be strongly consistent and fast. Coupling notification and approval logic to the synchronous path would increase latency and introduce failure modes (e.g., an email service outage blocking a return creation). The async approach follows the Reactive Manifesto and CAP Theorem alignment: synchronous operations are CP (consistency + partition-tolerance), async side effects are AP (availability + partition-tolerance with eventual consistency). *(Source: RFC, sections 2.1.2 and 2.3)*

- **Q: What order statuses allow a return request to be initiated?** → Orders in `invoiced` status or later (i.e., after shipping or delivery). Orders in pre-delivery statuses should use the cancellation flow, not the return flow. The configurable return window (merchant-defined days since delivery) further restricts eligibility. Returns from external marketplace orders (Mercado Livre, Amazon) in `invoiced` status within VTEX are out of scope for Phase 1. *(Source: Proposal PDF, UC-13; RFC, section 1.3)*

- **Q: Can a return request cover only some items in the order?** → Yes. Partial returns — selecting a subset of items and/or a partial quantity per item — are the primary use case. The MarketplaceReturn/SellerReturn model supports this natively: each item carries its own approved/denied quantity, and the refund is calculated based only on items with approved quantities. *(Source: Proposal PDF, UC-1, UC-2, UC-5, UC-6)*

- **Q: Who is responsible for triggering the financial refund, and when?** → The Marketplace/Admin triggers the consolidated refund only after all sellers have completed their item analysis (all items in a terminal state: `approved` or `denied`). The system then orchestrates the input invoice for the marketplace and routes the refund via the payment gateway. Sellers cannot directly trigger financial operations — they can only approve or deny items at the operational level. *(Source: RFC, sections 2.1.3 and 2.2)*

- **Q: What happens when a buyer returns an item in-store instead of via home pickup or carrier drop-off?** → In-store returns (UC-5 through UC-11) use the same return request flow with `returnMethod: in-store` and a `storeId` field. The merchant processes the item inspection at the physical store and updates the SellerReturn item status via API or Admin UI. The refund is triggered through OMS after the in-store inspection is logged. Cross-state in-store returns (UC-10) require merchant awareness of potential tax implications — the system flags these for manual review. *(Source: Proposal PDF, UC-5 through UC-11)*

- **Q: Does promotion recalculation apply when a partial return reduces the order total?** → Out of scope for Phase 1. Refund amounts are calculated based on the approved item prices at the time of the original order. Promotion recalculation for partial returns has complex dependencies on the order modification promotion engine and is deferred to a subsequent spec.

- **Q: Is the return flow applicable to subscription orders?** → No. Subscription returns and exchanges are out of scope for Phase 1. The eligibility API will exclude subscription orders from the `eligible orders for return` query results. *(Source: Proposal PDF, UC-15 — listed as a future use case)*

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper initiates a partial online return with financial refund (Priority: P1)

A shopper purchased 3 items from an online store. One item arrived damaged. The shopper logs into My Orders, selects the damaged item, provides the return reason (damaged product), selects home pickup as the return method, and submits the request. The merchant reviews and approves. A return label is generated and the shopper is notified. After the item is received and inspected, a refund is issued.

**Acceptance Scenarios:**

1. **Given** an order in `invoiced` status within the configured return window, **When** the shopper selects 1 item (quantity 1) and submits a return request with `reason: damaged-product` and `returnMethod: home-pickup`, **Then** a `returnId` is created linked to the `orderId`, the MarketplaceReturn is created with status `pending-seller-analysis`, the SellerReturn for the relevant seller is created with that item's status `pending-pre-check`, and the shopper receives a return confirmation notification. *(UC-1)*

2. **Given** a SellerReturn item in `pending-pre-check`, **When** the seller approves the pre-check and logs the item as sent to reverse logistics, **Then** the item status transitions to `pending-logistics`, a return label is automatically generated via the configured carrier integration, and the label is sent to the shopper. *(UC-1)*

3. **Given** a SellerReturn item in `pending-inspection` after the physical return is received, **When** the seller approves the item with condition `good` and quantity 1, **Then** item status transitions to `approved`, inventory is automatically reintegrated into the seller's warehouse, and if this is the last pending item for this seller, the SellerReturn status updates to `completed`. *(UC-1)*

4. **Given** all sellers have completed item analysis with at least one approved item, **When** the Marketplace/Admin executes the consolidated refund, **Then** the refund is routed via the payment gateway for the total of approved items, the MarketplaceReturn status transitions to `refund-issued`, and the shopper receives a refund confirmation notification. *(UC-1)*

5. **Given** a shopper requesting a partial return (2 of 5 items) where the seller approves 1 and denies 1, **When** all analysis is complete, **Then** the refund covers only the approved item's value; the denied item's status is `denied` with the seller's stated reason; both outcomes are included in the shopper's final notification. *(UC-1)*

6. **Given** a shopper submitting a return request after the configured return window has expired, **When** the API receives the request, **Then** it is rejected with a `RETURN_WINDOW_EXPIRED` error and no `returnId` is created.

---

### User Story 2 — Shopper initiates a full return with gift card compensation (Priority: P1)

A shopper purchased a product online and changed their mind. They return the full order and select gift card as the compensation method.

**Acceptance Scenarios:**

1. **Given** an order in `invoiced` status within the return window, **When** the shopper submits a full return request with `reason: regret` and `compensationMethod: gift-card`, **Then** a `returnId` is created with `compensationMethod: gift-card`, the MarketplaceReturn status is `pending-seller-analysis`, and the shopper receives a return confirmation. *(UC-2, UC-4)*

2. **Given** all sellers approve all items for a `gift-card` return, **When** the Marketplace/Admin confirms the compensation, **Then** a gift card equivalent to the total approved item value is issued to the shopper's account, the MarketplaceReturn status transitions to `gift-card-issued`, and the shopper receives a notification with the gift card details. *(UC-2, UC-4)*

3. **Given** a return with `compensationMethod: gift-card`, **When** the Marketplace/Admin attempts to switch the compensation method to `refund` after the gift card has been issued, **Then** the system rejects the request with a `RETURN_ALREADY_SETTLED` error. *(terminal state guard)*

---

### User Story 3 — Shopper returns an item at a physical store (Priority: P2)

A shopper purchased an item online and brings it to the nearest physical store for return. The store manager processes the return and logs the inspection.

**Acceptance Scenarios:**

1. **Given** an order in `invoiced` status within the return window, **When** the shopper submits a return request with `returnMethod: in-store` and specifies a valid `storeId`, **Then** a `returnId` is created with method `in-store`, the seller receives an in-store return notification, and the shopper receives a confirmation with in-store instructions. *(UC-5, UC-7)*

2. **Given** a pending in-store return, **When** the store manager logs the physical inspection via the Admin UI with condition `good`, **Then** the SellerReturn item status transitions to `approved`, inventory is reintegrated into the store's warehouse, and the standard refund flow proceeds. *(UC-5, UC-7, UC-9)*

3. **Given** an in-store purchase (not online), **When** the shopper initiates a return at a different physical store in a different state, **Then** the return is linked to the original in-store order; the system flags the cross-state return for merchant review of potential tax implications; the standard return flow proceeds after merchant confirmation. *(UC-10)*

4. **Given** a shopper who purchased in-store and wishes to return via delivery/post-office instead of going back to a store, **When** the return request is submitted with `returnMethod: home-pickup`, **Then** the request is processed through the standard home-pickup flow, regardless of the original purchase channel. *(UC-14)*

---

### User Story 4 — Seller reviews and processes a return request (Priority: P1)

A seller in a marketplace receives a return request for one of their items. The seller reviews the request, approves or denies items, and logs the operational steps.

**Acceptance Scenarios:**

1. **Given** a SellerReturn item in `pending-pre-check`, **When** the seller updates the item status to `pre-check-approved`, **Then** the item transitions to `pending-logistics` and a return label is generated or a pickup is scheduled with the configured carrier. *(UC-1)*

2. **Given** a SellerReturn item in `pending-inspection` after the physical return arrives, **When** the seller approves the item with full quantity, **Then** item status is `approved`, inventory is reintegrated if condition is `good`, and if this is the last item for this seller, the SellerReturn status updates to `completed` and the MarketplaceReturn is notified. *(UC-1)*

3. **Given** a SellerReturn item in `pending-inspection`, **When** the seller denies the item with reason `item-not-returned`, **Then** item status is `denied`, approved quantity is 0, the reason is logged in the audit trail, and the marketplace is notified of the partial or full denial. *(UC-12)*

4. **Given** a seller submitting an update request targeting an item that belongs to a different seller in the same order, **When** the request is processed, **Then** the system rejects it with `SELLER_SCOPE_VIOLATION` and the target item state is unchanged. *(RFC section 2.1.3 isolation requirement)*

5. **Given** a seller attempting to execute a financial refund directly (bypassing the Marketplace/Admin role), **When** the request is received, **Then** the system rejects it with `UNAUTHORIZED_FINANCIAL_OPERATION` — financial operations are restricted to Marketplace/Admin scope. *(RFC section 2.2)*

---

### User Story 5 — Merchant cancels a return in progress (Priority: P2)

A Marketplace/Admin discovers that a return was submitted in error or the issue was resolved through another channel.

**Acceptance Scenarios:**

1. **Given** a MarketplaceReturn in `pending-seller-analysis`, **When** the Marketplace/Admin cancels the return via API or Admin UI with a reason, **Then** all SellerReturn items transition to `cancelled`, the `returnId` is marked `cancelled`, no refund or gift card is issued, and the shopper receives a cancellation notification including the merchant's reason. *(UC-12)*

2. **Given** a return in the terminal status `refund-issued`, **When** a cancellation is attempted, **Then** the system rejects the request with `RETURN_ALREADY_SETTLED` — terminal-state returns cannot be cancelled. *(guard condition)*

3. **Given** a MarketplaceReturn in `pending-refund` (all sellers completed but refund not yet executed), **When** the Marketplace/Admin cancels, **Then** the cancellation is accepted, no financial transaction is initiated, and the MarketplaceReturn transitions to `cancelled`. *(pre-settlement cancellation)*

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST allow creating a return request linked to an `orderId` for orders in `invoiced` or post-delivery statuses; the request MUST produce a unique `returnId` per order per account (marketplace or seller).
- **FR-002**: The system MUST support partial return requests: the shopper MUST be able to select individual items and specific quantities; unselected items and unaffected quantities MUST remain unchanged.
- **FR-003**: The system MUST maintain two coordinated views per return: MarketplaceReturn (shopper-provided data and aggregated results) and SellerReturn (per-item operational status and approved/denied quantities per seller).
- **FR-004**: The system MUST enforce seller-scoped update authorization: a seller MUST only be able to update items belonging to their own SellerReturn; attempts to update another seller's items MUST be rejected with `SELLER_SCOPE_VIOLATION`.
- **FR-005**: The system MUST support the following return methods: `home-pickup` (carrier collects at shopper's address), `drop-off` (shopper delivers to carrier point or locker), `in-store` (shopper brings item to a physical store identified by `storeId`).
- **FR-006**: The system MUST support at minimum the following return reasons: `damaged-product`, `wrong-item`, `wrong-size`, `regret`, `product-not-as-described`, `missing-item`.
- **FR-007**: The system MUST support the following compensation methods: `refund` (financial refund to the original payment method) and `gift-card` (store credit issued to the shopper's account).
- **FR-008**: The system MUST automatically reintegrate inventory for items returned with condition `good` upon inspection approval; items with condition `damaged` or `unacceptable` MUST NOT be automatically reintegrated without explicit merchant configuration enabling it.
- **FR-009**: The system MUST trigger automatic return label generation via the configured carrier integration when a return request item transitions to `pending-logistics` status.
- **FR-010**: The system MUST publish an event to the SNS topic on every state transition of the MarketplaceReturn or any SellerReturn item; the event payload MUST include `returnId`, `orderId`, `previousStatus`, `newStatus`, `actorId`, and `timestamp`.
- **FR-011**: The system MUST send a shopper notification (email and My Orders update) on the following state transitions: return request confirmed, return label issued, seller analysis complete (all items in terminal state), and compensation issued (refund or gift card).
- **FR-012**: The system MUST allow the Marketplace/Admin to cancel a return in any non-terminal status; returns in terminal statuses (`refund-issued`, `gift-card-issued`, `cancelled`) MUST NOT be cancellable and MUST return `RETURN_ALREADY_SETTLED`.
- **FR-013**: The system MUST block consolidated refund execution if any seller has items in a non-terminal analysis status; the request MUST be rejected with `SELLERS_ANALYSIS_PENDING`.
- **FR-014**: The system MUST persist a full audit record per return operation including: actor identity, actor type (shopper, seller, marketplace, system), timestamp, operation type, and before/after state of all affected fields.
- **FR-015**: The system MUST expose GraphQL queries for supporting data required at return initiation: eligible orders for return (filtered by return window and order status), nearby drop-off/collection points by coordinates, and product category tree for reason code mapping; these queries MUST be migrated from ReturnAPP GraphQL resolvers to the Orders GraphQL layer.
- **FR-016**: The return creation and update APIs MUST be idempotent per `operationId`; retrying a request with the same `operationId` MUST return the original result without re-executing the operation.
- **FR-017**: The system MUST serialize concurrent update requests on the same `returnId` using optimistic locking; concurrent updates MUST NOT produce an inconsistent return state.
- **FR-018**: The system MUST enforce a configurable return eligibility window (merchant-defined number of days after delivery); requests submitted after the window MUST be rejected with `RETURN_WINDOW_EXPIRED`.
- **FR-019**: The system MUST emit structured logs for all return operations including at minimum: `returnId`, `orderId`, `userId`, `event`, and `error` (if applicable).
- **FR-020**: The system MUST support return requests for marketplace orders with multiple sellers; each seller's SellerReturn MUST be fully isolated from other sellers' data in the same order, and a seller's actions MUST NOT alter the status or data of any other seller's SellerReturn.

---

## Success Criteria

- **SC-001**: All use cases UC-1 through UC-11 (online and in-store returns with refund and gift card) are validated end-to-end in the integration test suite against the SOS test environment, covering return creation, seller analysis, and compensation issuance.
- **SC-002**: Seller isolation is enforced — integration tests confirm that a seller update request targeting another seller's item in the same order returns `SELLER_SCOPE_VIOLATION` and leaves the target item unchanged.
- **SC-003**: Inventory reintegration occurs automatically for items returned with condition `good` — verified by querying warehouse stock before and after a confirmed return approval in the test environment; zero unintended inventory changes for items with condition `damaged`.
- **SC-004**: Return label is generated within 30 seconds of a return item transitioning to `pending-logistics` status — verified by integration tests against the carrier sandbox environment.
- **SC-005**: Shopper notifications (email + My Orders) are delivered within 60 seconds of each tracked state transition — verified across all notification trigger points (return confirmed, label issued, analysis complete, compensation issued).
- **SC-006**: All return operations are captured in the audit log with full before/after state — verifiable by querying the audit log after each test scenario; zero unlogged state transitions across all 20 functional requirements.
- **SC-007**: The return API returns structured, machine-readable errors for all documented rejection scenarios: `RETURN_WINDOW_EXPIRED`, `ORDER_NOT_ELIGIBLE`, `SELLER_SCOPE_VIOLATION`, `SELLERS_ANALYSIS_PENDING`, `RETURN_ALREADY_SETTLED`, `UNAUTHORIZED_FINANCIAL_OPERATION`, `CONCURRENT_UPDATE`.
- **SC-008**: Refund execution is blocked when any seller has items in a non-terminal analysis status — verified by attempting a refund trigger with at least one pending SellerReturn item and confirming `SELLERS_ANALYSIS_PENDING` error.
- **SC-009**: The SNS event pipeline delivers events to all registered consumers within 5 seconds of a state transition — verified by monitoring event delivery timestamps in the test environment across 10 consecutive state transitions.
- **SC-010**: Closed Beta with at least one Tier-1 merchant (BRA or USA) validates the complete end-to-end return flow: shopper self-service request, seller approval, return label generation, in-store or carrier-based return, inventory reintegration, and compensation issuance.
