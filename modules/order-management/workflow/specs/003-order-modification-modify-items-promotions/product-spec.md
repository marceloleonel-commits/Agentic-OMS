# Product Spec — Order Modification: Promotion Recalculation

## Clarifications

- **Q: Why is promotion recalculation out of scope for MMR 001 (Add/Remove/Replace)?** → The promotion engine at VTEX is stateful and context-sensitive: it evaluates the full cart at checkout time using a snapshot of the applicable campaigns, coupons, and customer segments. Re-running the promotion engine during an in-flight order modification requires replicating that evaluation context (customer identity, channel, active campaigns at modification time vs. at order placement time), which adds significant complexity to the modification pipeline. Separating this into MMR 003 allows MMR 001 to ship without the risk of incorrect promotion application while the promotion recalculation contract is designed. *(Source: Product Vision OMS Change Order, Aug 2022)*
- **Q: What is a PriceTag and why must it be preserved?** → A PriceTag is an item-level price adjustment applied manually by an operator or via integration — either a manual fee (increases the item price) or a manual discount (reduces the item price). PriceTags are distinct from automatic promotions: they are operator-authored, not campaign-driven. UC-45 and UC-46 document that when an item's weight is increased, the PriceTag must remain intact and the financial delta for the weight change must be calculated on top of the existing tag. If the PriceTag is removed, the merchant loses a price adjustment they explicitly configured, producing an incorrect order total with no platform-level alert. *(Source: UC-45, UC-46)*
- **Q: What happens to a bundle discount when one required item is removed?** → The bundle discount must be reverted. Leaving a bundle discount applied after one of its required items is removed constitutes an over-discount: the merchant absorbs a promotional cost for a bundle that no longer exists in the order. The promotion engine must re-evaluate the remaining items after the removal and remove any discount that no longer has a valid qualifying condition. *(Source: Change Order V2 Documentation — discount constraint rules)*
- **Q: What happens to a bundle discount when the missing required item is added?** → The bundle discount must be applied. If an order already contains item A (one leg of a bundle) and the operator adds item B (the second leg), the promotion engine must detect that the bundle condition is now met and apply the discount. The current Change Order V2 API does not trigger the promotion engine, so this discount is permanently missed for post-placement modifications. *(Source: UC-07 — add item with discount on item total and order total)*
- **Q: How does `manualDiscountValue` interact with automatic promotion recalculation?** → `manualDiscountValue` is an order-level manual override that injects a fixed discount amount into the order total without running the promotion engine. It is operator-initiated and is not a promotional rule. After promotion recalculation, `manualDiscountValue` values that were previously injected by operators should remain unchanged — the recalculation applies only to automatic promotional rules (campaign-based). Operators must explicitly modify or remove a `manualDiscountValue` if they wish to adjust it. *(Source: Change Order V2 API Documentation — manualDiscountValue field)*
- **Q: Are coupon codes re-validated during modification?** → No. Coupon codes applied at order placement are not re-validated during modification. The coupon was already consumed at checkout. Re-validating it post-placement would risk invalidating a legitimately applied discount if the coupon has since expired or reached its usage limit. Coupon-associated discounts are recalculated only in terms of their dollar value if the qualifying item quantity changes — the coupon's validity is not re-checked. *(Source: Change Order V2 Documentation — payment and discount constraints)*
- **Q: What is the modification-time campaign snapshot used for promotion recalculation?** → Promotion recalculation uses the campaign rules that were active at the time of original order placement, not the rules active at the time of modification. This prevents a situation where a campaign that has since been deactivated is re-applied to an in-flight order (or vice versa). The order's original promotion snapshot is stored alongside the order and is used as the evaluation context for all post-placement recalculations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Apply a bundle discount when a qualifying item is added (Priority: P1)

An operator at a fashion merchant's SAC receives a request from a customer who forgot to add a second item that completes a "buy 2 get 15% off" bundle promotion. The operator adds the missing item. The system recognises that the bundle condition is now met, applies the 15% discount to the qualifying items, and sends the customer an updated confirmation showing the new discount.

**Acceptance Scenarios:**

1. **Given** an active order containing item A (one leg of a 2-item bundle promotion), **When** the operator adds item B (the second leg) via a change order request, **Then** the promotion engine is triggered, the bundle discount is applied to both items, the order subtotal decreases by the discount amount, and the customer receives a notification showing the added item and the applied discount. *(UC-07)*

2. **Given** an active order containing item A with a quantity of 2 (meeting a "buy 2 get 10% off" progressive discount threshold), **When** the operator adds 1 more unit of item A (bringing quantity to 3, which meets the "buy 3 get 15% off" threshold), **Then** the discount is updated from 10% to 15%, the order total recalculates to reflect the new discount, and a single customer notification is sent. *(UC-07)*

3. **Given** an active order where no bundle promotion is currently active, **When** an item is added that does not meet any promotional condition, **Then** the promotion engine runs and confirms no applicable rule, the order total increases by the item's line total only, and no discount is applied or removed.

4. **Given** an active order with a bundle discount already applied (items A and B both present), **When** a third unrelated item C is added, **Then** the bundle discount for A and B is preserved unchanged, item C is added at its standard price, and the order total increases by item C's line total only.

5. **Given** an active order, **When** an item is added and a `manualDiscountValue` was previously applied to the order, **Then** the automatic promotion recalculation runs independently of the `manualDiscountValue`, which remains unchanged; the final order total reflects both the automatic promotion result and the existing manual discount.

---

### User Story 2 — Revert a bundle discount when a required item is removed (Priority: P1)

A warehouse operator identifies that one item in a confirmed order is out of stock. That item is part of an active bundle discount. The operator removes the item. The system detects that the bundle condition is no longer satisfied, reverts the bundle discount, and notifies the customer of both the removal and the discount change.

**Acceptance Scenarios:**

1. **Given** an active order with items A and B forming a bundle with a 15% discount applied, **When** item A is fully removed, **Then** the bundle discount is reverted (removed from both remaining and removed items), the order total increases to reflect the loss of the discount minus the removed item's line total, and the customer notification states both the removed item and the discount reversal. *(Source: bundle discount constraint — Change Order V2 Documentation)*

2. **Given** an active order with items A and B forming a bundle, **When** the quantity of item A is reduced to zero (full removal by quantity reduction), **Then** the bundle discount is reverted and item B is repriced at its standard price, with the order total updating accordingly.

3. **Given** an active order meeting a "buy 3 get 15% off" progressive discount threshold, **When** one unit is removed reducing the quantity to 2 (which meets the "buy 2 get 10% off" threshold), **Then** the discount adjusts from 15% to 10% rather than being fully removed, and the order total reflects the lower discount tier.

4. **Given** an active order meeting a "buy 3 get 15% off" threshold, **When** a unit is removed reducing the quantity to 1 (below all discount thresholds), **Then** the discount is fully reverted, the item is repriced at its standard price, and the customer is notified.

5. **Given** an active order with a bundle discount and an unrelated item C, **When** item C is removed, **Then** the bundle discount for A and B is unaffected, and the order total decreases only by item C's line total.

---

### User Story 3 — Preserve a manual PriceTag when item weight or quantity changes (Priority: P2)

A grocery operator updates the actual weight of a catch-weight item (e.g., a cut of meat weighed at pick time). The item has a manual fee PriceTag applied (e.g., a handling surcharge per kg). The operator increases the weight by 250g. The system preserves the PriceTag and calculates the financial delta for the weight increase on top of the existing tag.

**Acceptance Scenarios:**

1. **Given** an active order with a weighted item at 500g that has a manual fee PriceTag of R$2.00/kg, **When** the operator increases the weight to 750g (+250g), **Then** the manual fee PriceTag is preserved, the financial delta is calculated as 250g × item unit price (not 250g × (unit price + tag fee)), the PriceTag amount updates proportionally to the new weight, and the order total reflects the correct combined result. *(UC-45)*

2. **Given** an active order with a weighted item at 500g that has a manual discount PriceTag reducing the item price by R$1.50/kg, **When** the operator increases the weight to 750g (+250g), **Then** the manual discount PriceTag is preserved, the discount amount updates proportionally to the new weight, and the item line total correctly reflects the discount applied to the full 750g. *(UC-46)*

3. **Given** an active order with a unit-priced item that has a manual discount PriceTag, **When** the operator increases the quantity by 1, **Then** the PriceTag discount is extended proportionally to the new quantity (not removed or reset), and the order total reflects the discount on all units including the added one.

4. **Given** an active order with an item that has a manual fee PriceTag, **When** the item is substituted for an alternative SKU via a replace operation, **Then** the PriceTag from the original item is NOT transferred to the replacement item — the replacement item starts with no PriceTags, and the operator must re-apply any tags if needed.

5. **Given** an active order with an item that has both a manual PriceTag and an automatic promotion discount applied, **When** the item weight is increased, **Then** the PriceTag is preserved, the automatic promotion is recalculated based on the new weight/quantity, and both adjustments are reflected in the updated line total.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST trigger a promotion recalculation pass after any item-change commit (add, remove, replace, quantity change, weight change) is persisted by the MMR 001 modification pipeline.
- **FR-002**: The promotion recalculation pass MUST use the campaign and promotional rule snapshot captured at original order placement time, not the rules active at the time of modification.
- **FR-003**: If any automatic promotional rule (bundle, progressive discount, coupon-based) no longer has its qualifying conditions satisfied after the item change, the system MUST remove that discount from the order total.
- **FR-004**: If any automatic promotional rule has its qualifying conditions newly satisfied after the item change (e.g., a bundle is now complete), the system MUST apply that discount to the order total.
- **FR-005**: Manual PriceTags (manual fees and manual discounts) applied at item level MUST be preserved across weight and quantity modifications; the financial delta of the modification MUST be calculated independently of the PriceTag, and the PriceTag amount MUST be updated proportionally to the new weight or quantity.
- **FR-006**: Manual PriceTags applied to an original item MUST NOT be automatically transferred to a replacement item in a substitution operation; the replacement item starts with no PriceTags.
- **FR-007**: Order-level manual discount values (`manualDiscountValue`) applied by operators MUST NOT be modified by the automatic promotion recalculation pass; they remain unchanged unless the operator explicitly modifies them.
- **FR-008**: The promotion recalculation result MUST be included in the single payment delta calculated per modification request, consistent with FR-022 of MMR 001 — one payment transaction per modification, not one per promotion change.
- **FR-009**: The system MUST include in the modification audit log: all promotional rules evaluated, which rules were applied or removed, the discount amounts before and after modification, and all PriceTag values before and after modification.
- **FR-010**: The single end-customer notification sent per modification (MMR 001 FR-017) MUST include a description of any discount applied or removed due to promotion recalculation, in addition to the item changes.
- **FR-011**: The promotion recalculation pass MUST complete atomically with the item modification — if the recalculation fails for any reason, the entire modification request MUST be rejected and the order left unchanged.
- **FR-012**: The system MUST correctly handle progressive discount tiers: when a quantity change moves an item across a tier boundary (up or down), the discount MUST update to the correct tier rather than being fully removed or left at the prior tier.

---

## Success Criteria

- **SC-001**: UC-07 (add item with discount on item and order total) passes end-to-end in the integration test suite against the SOS test environment, with the discount correctly reflected in both `totalsAfter.discounts` and the customer notification.
- **SC-002**: UC-45 (add weight to item with Manual Fee PriceTag) passes end-to-end; the PriceTag is present and correctly proportioned in the order state after the modification.
- **SC-003**: UC-46 (add weight to item with Manual Discount PriceTag) passes end-to-end; the PriceTag discount is present and correctly proportioned in the order state after the modification.
- **SC-004**: In a bundle-removal integration test, zero orders contain an active bundle discount after the qualifying item has been removed — verified by querying the order totals breakdown after the removal.
- **SC-005**: In a bundle-addition integration test, 100% of orders containing a newly completed bundle reflect the correct bundle discount in the order total — verified by querying `totalsAfter.discounts` after the addition.
- **SC-006**: Progressive discount tier transitions (up and down) produce the correct tier discount in integration tests covering at least: below threshold → tier 1, tier 1 → tier 2, tier 2 → tier 1, tier 1 → below threshold.
- **SC-007**: All modification attempts are captured in the audit log with promotion before/after state; verifiable by querying the audit log after each test scenario and confirming the presence of `promotionsBefore` and `promotionsAfter` fields.
- **SC-008**: A single payment transaction is generated per modification request even when the modification results in both an item change and a promotion recalculation — verified by inspecting the payment gateway transaction log.
