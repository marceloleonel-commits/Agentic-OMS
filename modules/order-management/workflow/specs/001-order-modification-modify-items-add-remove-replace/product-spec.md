# Product Spec — Order Modification: Modify Items (Add, Remove, Replace)

## Clarifications

- **Q: Why is freight recalculation automatic instead of merchant-managed?** → The current API forces merchants to calculate the freight delta manually and inject it via `IncrementValue`. Any divergence between the merchant's calculation and VTEX's freight engine produces a silent error — the order total is wrong with no platform-level validation. Automatic recalculation removes this error surface entirely. *(Source: Product Vision OMS Change Order, Aug 2022; UC-01 to UC-15)*
- **Q: Are 1-to-many and many-to-1 substitutions in scope (e.g., replace 1 item with 2, or replace 2 items with 1)?** → No. UC-23 through UC-27 are marked "Descartado" in the use case mapping. The complexity of splitting or merging line items creates edge cases in inventory reservation and payment authorization that are not justified for MVP. Standard 1-to-1 substitution covers the primary grocery use case.
- **Q: UC-41 is marked "Erro" in test results — is this a known bug or intended behavior?** → Known regression: when an order item has `price ≠ sellingPrice`, removing the other item produces an incorrect total calculation. This must be resolved before GA; it is tracked as a blocking issue for this spec.
- **Q: Does promotion recalculation apply when items change?** → Out of scope for this MMR. When items are added or removed, promotions are not recomputed. Promotion recalculation is covered by MMR 003. Merchants must be aware that adding an item that would trigger a bundle discount will not reflect that discount in the modification result.
- **Q: Does this apply to B2B orders (costCenter, poNumber changes)?** → B2B-specific modification flows (cost center, PO number changes tied to approval workflows) are a separate concern documented in the B2B Change Order sheet. This spec covers item-level changes only, applicable to both B2C and B2B order architectures.
- **Q: What order statuses allow item modifications?** → For MVP: `payment-approved`, `ready-for-handling`, and `handling`. The configurable allowed-status-per-merchant setting is in scope for this MMR but defaults to these three statuses. Orders in `invoiced` or later statuses cannot be modified through this flow.
- **Q: Can the same `operationId` be submitted twice?** → Yes, and it is safe to do so. The system deduplicates on `operationId` per `orderId`. The second submission returns the original result without re-executing the modification. This makes the API safe to retry on network failure.
- **Q: What happens to the freight value when items change?** → Freight is recalculated automatically as part of the modification pipeline. The new freight value is reflected in `totalsAfter.freight`. Freight recalculation uses the same VTEX freight engine used at checkout. *(Source: UC-01, UC-02, UC-10, UC-11 — explicit freight delta scenarios)*
- **Q: Are weighted items (grams, kg) treated differently from unit items?** → Weighted items use decimal quantities with an explicit `unitOfMeasure` field. The price formula is `quantity × unitPrice` where `unitPrice` is the price per declared unit of measure. A substitution of a 500g item for a 480g item updates both the weight and the line total. Customer notifications for weighted-item changes must include both the original and replacement weight and unit price — 100% of weighted-item substitutions generate SAC calls today due to the absence of this communication. *(Source: UC-08, UC-09, UC-33, UC-34)*

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Add a new item or increase quantity due to stock availability or customer request (Priority: P1)

An operator at a grocery merchant's SAC receives a customer request to add a forgotten item before dispatch. The operator adds the new item via the change order interface. The system creates an inventory reservation, recalculates the order total including freight and taxes, and sends an updated confirmation to the customer.

**Acceptance Scenarios:**

1. **Given** an active order in `ready-for-handling` status, **When** an operator adds 1 new item (unit-priced) that has available stock, **Then** the item is added to the order, a new inventory reservation is created, the order total increases by the item's line total plus any freight delta, and the customer receives an email and My Orders update. *(UC-01, UC-02)*

2. **Given** an active order with item A at quantity 2, **When** the quantity is increased to 3, **Then** one additional unit is reserved, the line total and order total update correctly, and the customer is notified. *(UC-03, UC-04)*

3. **Given** an active order, **When** 2 or more items are added in a single modification request, **Then** all additions are applied atomically, inventory reservations are created for all added items, and a single customer notification is sent with all changes. *(UC-05, UC-06)*

4. **Given** an active order, **When** an item is added and a discount is also applied to the same item in the same modification request, **Then** the discount is applied to the new item's line total and the order total reflects both the addition and the discount. *(UC-07)*

5. **Given** an active order with a delivery window that has a cost greater than zero, **When** a new item is added, **Then** freight is recalculated considering the delivery window cost. *(UC-37)*

6. **Given** an active order, **When** an item is added for a SKU that has no available stock, **Then** the modification is rejected with a `STOCK_UNAVAILABLE` error and the order is unchanged.

---

### User Story 2 — Remove an item or reduce quantity due to stock shortage (Priority: P1)

A warehouse operator identifies that an item in a confirmed order is out of stock. The operator removes the item. The inventory reservation is released, the order total is updated, and the customer is notified of the removal.

**Acceptance Scenarios:**

1. **Given** an active order with items A and B, **When** item A is fully removed, **Then** item A's inventory reservation is released, the order total decreases by item A's line total plus any freight delta, item B is unaffected, and the customer receives a removal notification. *(UC-10, UC-11)*

2. **Given** an active order with item A at quantity 3, **When** the quantity is reduced to 2, **Then** 1 unit is released from the inventory reservation, the line total and order total update correctly, and the customer is notified. *(UC-12, UC-13)*

3. **Given** an active order with a weighted item at 500g, **When** the weight is reduced to 400g, **Then** the weight delta (100g) is released from the reservation, the line total recalculates at the declared unit price, and the notification states the original and new weights. *(UC-14, UC-15)*

4. **Given** an active order with two items that share the same SKU (duplicate line items), **When** one line is removed by its `uniqueId`, **Then** only that specific line is removed and the other line with the same SKU is unaffected. *(UC-47)*

5. **Given** an active order with 1 item, **When** that item is fully removed, **Then** the system rejects the operation with a `ZERO_TOTAL_NOT_ALLOWED` error and the order is unchanged.

6. **Given** a B2C OmniChannel order split across Seller A and Seller B, **When** an item from Seller B is removed, **Then** Seller A's fulfillment is not interrupted, Seller B's inventory reservation is released, and both the marketplace record and Seller B's record are updated. *(UC-44)*

---

### User Story 3 — Substitute an item with an equivalent SKU (Priority: P1)

A grocery picker identifies that a requested item is unavailable and substitutes it with an equivalent product. For weighted items, the substitution captures the exact weight difference and communicates it clearly to the customer.

**Acceptance Scenarios:**

1. **Given** an active order with a unit-priced item A, **When** it is replaced with item B of greater weight and equal price, **Then** item A's reservation is released, item B's reservation is created, freight increases to reflect the weight change, and the order total updates accordingly. *(UC-16)*

2. **Given** an active order with item A (heavier, higher price), **When** it is replaced with item B (lighter, lower price), **Then** item A's reservation is released, item B's reservation is created, freight decreases, and the order total decreases by the combined price and freight delta. *(UC-19, UC-20)*

3. **Given** an active order with item A (lighter), **When** it is replaced with item B (heavier, higher price), **Then** freight and order total both increase, and the customer notification states item A (name, weight/quantity, price) and item B (name, weight/quantity, price). *(UC-18)*

4. **Given** an active order with a weighted item at 500g, **When** it is replaced with a 250g variant (same product, smaller portion), **Then** the weight delta is reflected in both the line total and the freight calculation, and the notification specifies the original and replacement weights. *(UC-33)*

5. **Given** an active order with item A, **When** the quantity is increased and the weight per unit is reduced in the same operation, **Then** the net weight delta is used for freight recalculation and the line total reflects quantity × new unit price. *(UC-34, UC-35)*

6. **Given** an active order with an item that has a manual price tag (PriceTag — manual fee or manual discount), **When** the weight is increased by 250g, **Then** the manual price tag is preserved and the weight delta is calculated on top of the existing price tag adjustment. *(UC-45, UC-46)*

7. **Given** an active order with an external seller item where the seller ID differs between marketplace and fulfillment, **When** the item is substituted by initiating the change from the marketplace, **Then** the substitution is correctly applied on the fulfillment record and freight is recalculated. *(UC-42)*

8. **Given** the same scenario above, **When** the change is initiated from the fulfillment account, **Then** the result is identical. *(UC-43)*

---

### User Story 4 — Execute multiple item changes in a single modification request (Priority: P2)

An operator needs to resolve a complex stock situation: remove one out-of-stock item, substitute another, and add a new item — all in a single operation to avoid sending multiple notifications to the customer.

**Acceptance Scenarios:**

1. **Given** an order with items A and B, **When** the request adds item C and removes item B, **Then** item B's reservation is released, item C's reservation is created, the order total updates by the net delta, and a single notification with both changes is sent. *(UC-36)*

2. **Given** an order with item A, **When** the request adds item B and then removes item B in the same payload, **Then** the net result leaves item A unchanged (net-zero change), the order total is unchanged, and no notification is sent. *(UC-28)*

3. **Given** an order with item A, **When** the request adds 2 units of item B and replaces 1 unit of B with item C, **Then** the final order contains item A, 1 unit of B, and 1 unit of C. *(UC-29)*

4. **Given** an order with item A, **When** the request adds item A twice (two separate add operations for the same SKU), **Then** the final quantity of item A is the original quantity plus 2, with reservations created for both additions. *(UC-30)*

5. **Given** an order with 5 units of item A, **When** the request substitutes all 5 units of A for item B and then adds 5 more units of B, **Then** the final order contains 10 units of item B. *(UC-31)*

6. **Given** an order with 5 units of item A, **When** the request substitutes 5A→5B, adds 5B, and removes 4B, **Then** the final order contains 6 units of item B. *(UC-32)*

7. **Given** an order with items A and B, **When** the request adds 1 unit to item A, adds a new item C, removes item B entirely, and updates the weight of item A, **Then** all four changes are applied atomically, and a single notification with all changes is sent. *(UC-40)*

8. **Given** a modification involving an increment in order total with a custom payment method, **When** the modification is confirmed, **Then** the additional charge is authorized through the custom payment connector and reflected in the transaction. *(UC-38)*

9. **Given** a modification that results in a decrease in order total with a custom payment method, **When** the modification is confirmed, **Then** a partial refund is triggered through the custom payment connector. *(UC-39)*

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST allow adding one or more new items to an active order by SKU, with quantity and unit of measure specified.
- **FR-002**: The system MUST allow removing one or more existing items from an active order by line item ID, including full line-item removal.
- **FR-003**: The system MUST allow reducing the quantity (or weight, for weighted items) of an existing order item without full removal.
- **FR-004**: The system MUST allow replacing an existing item with an alternative SKU as an atomic operation (remove original + add replacement in one request).
- **FR-005**: The system MUST create inventory reservations for all added items before confirming the modification; if any reservation fails due to insufficient stock, the entire modification request MUST be rejected.
- **FR-006**: The system MUST release inventory reservations for removed items and release the delta reservation for quantity-reduced items as part of the same modification transaction.
- **FR-007**: The system MUST recalculate the order subtotal and taxes after any item change before persisting the modification.
- **FR-008**: The system MUST trigger freight recalculation when items change; the updated freight value MUST be reflected in the order total before the modification is confirmed.
- **FR-009**: The system MUST reject any modification that would reduce the order total to zero; the merchant MUST use the cancellation flow instead.
- **FR-010**: The system MUST apply all item changes in a single modification request atomically — if any individual change fails, the entire request is rejected and the order remains unchanged.
- **FR-011**: The system MUST support decimal quantities with an explicit unit of measure (`unit`, `kg`, `g`, `l`, `ml`) for weighted items; the price formula MUST be `quantity × unitPrice` where `unitPrice` is denominated in the declared unit.
- **FR-012**: The system MUST preserve manual price tags (manual fees and manual discounts applied to order items) across modifications; weight or quantity changes MUST NOT remove or overwrite existing manual price tags.
- **FR-013**: The system MUST support item modifications in B2C Standard and B2C OmniChannel (marketplace + franchise seller) architectures; modifying an item assigned to one seller MUST NOT interrupt the fulfillment flow of other sellers in the same order.
- **FR-014**: The system MUST support modifications initiated from both the marketplace account and the fulfillment (franchise) account in OmniChannel orders.
- **FR-015**: The system MUST allow removing a specific line from an order with duplicate SKUs by targeting the line's `uniqueId`; the duplicate line with the same SKU MUST remain unaffected.
- **FR-016**: The system MUST persist a full audit record per modification, including: actor identity, actor type, timestamp, operation type, before-state and after-state of all affected items, and order totals before and after.
- **FR-017**: The system MUST trigger a single end-customer notification (email and My Orders) per modification request, consolidating all item changes; for weighted items, the notification MUST specify the original and replacement item, their weights, and their unit prices.
- **FR-018**: The modification API MUST be idempotent per `operationId`; retrying a request with the same `operationId` MUST return the original result without re-executing the modification.
- **FR-019**: The system MUST serialize concurrent modification requests on the same order using optimistic locking; concurrent modifications MUST NOT produce an inconsistent order state.
- **FR-020**: The system MUST allow modifications on orders in statuses `payment-approved`, `ready-for-handling`, and `handling`; modifications on orders in `invoiced` or later statuses MUST be rejected with a clear status error.
- **FR-021**: When a modification results in an increase in order total, the system MUST signal the payment layer to authorize the additional charge; when it results in a decrease, the system MUST signal a partial refund.
- **FR-022**: The system MUST correctly calculate the net financial delta for modifications that combine additions, removals, and substitutions in a single request; a single transaction MUST be generated per modification request, not one per item change.

---

## Success Criteria

- **SC-001**: All 40 "Sucesso"-rated use cases from the UC-Scenarios spreadsheet pass end-to-end in the integration test suite against the SOS test environment (UC-01 through UC-47, excluding UC-23 to UC-27 which are discarded and UC-41 which requires a pre-fix).
- **SC-002**: UC-41 (`price ≠ sellingPrice` edge case) is resolved and returns `Sucesso` before GA release.
- **SC-003**: For B2C OmniChannel orders, a modification to one seller's items does not produce any change in status or fulfillment events for other sellers in the same order — verified by integration tests covering UC-42, UC-43, UC-44.
- **SC-004**: Zero duplicate inventory reservations are produced in concurrency tests simulating two simultaneous modification requests on the same order.
- **SC-005**: Customer notification (email + My Orders) is delivered within 60 seconds of modification confirmation in the test environment; for weighted-item substitutions, the notification contains original item name/weight/price and replacement item name/weight/price.
- **SC-006**: All modification attempts are captured in the audit log with full before/after item state; verifiable by querying the audit log after each test scenario.
- **SC-007**: The modification API returns a structured, machine-readable error for all rejection scenarios: `STOCK_UNAVAILABLE`, `ORDER_NOT_MODIFIABLE`, `ZERO_TOTAL_NOT_ALLOWED`, `ITEM_NOT_FOUND`, `CONCURRENT_MODIFICATION`, `INVALID_REQUEST`.
- **SC-008**: A single payment transaction is generated per modification request regardless of the number of item changes in the request — verified by inspecting the payment gateway transaction log after multi-item modification tests.
