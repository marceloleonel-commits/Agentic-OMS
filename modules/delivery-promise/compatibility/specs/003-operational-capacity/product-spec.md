# Product Spec — Compatibility with Operational Capacity in Delivery Promise

## Clarifications

- Q: What is Operational Capacity? → A: A VTEX feature that allows stores and fulfillment centers to declare a maximum number of orders they can process per delivery window. When that limit is reached, the store is "at capacity" and should not accept new orders for that window.
- Q: How does Operational Capacity interact with Delivery Promise availability? → A: When a store reaches capacity for a delivery window, products that would only be available through that store (for that window) must become unavailable in navigation. Without this, Delivery Promise shows products as available when the fulfilling store cannot take the order.
- Q: Is capacity state updated in real time? → A: Capacity state changes (at capacity / capacity restored) are processed as events and update the Delivery Promise index. The update is subject to the standard Delivery Promise indexing latency SLO — not strictly real-time but updated within the defined window.
- Q: What if a product has multiple stores that can fulfill it, and only one is at capacity? → A: The product remains available — other stores are still eligible. It only becomes unavailable when all fulfillment options for the shopper's location are at capacity.
- Q: Is this the same capacity check used at Checkout? → A: Yes. Delivery Promise must be consistent with Checkout's capacity evaluation — a store shown as at capacity in Delivery Promise is also at capacity in Checkout.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Store reaches capacity; products shown as unavailable in navigation (Priority: P1)

A grocery retailer's Morumbi store reaches its same-day delivery capacity limit at 2 PM. The Operational Capacity event is processed by Delivery Promise. By 2:05 PM (within the indexing SLO), products only available from Morumbi for same-day delivery are shown as unavailable in navigation for shoppers in that store's delivery zone.

**Acceptance Scenarios:**

1. **Given** a store reaches its Operational Capacity limit for a delivery window, **When** the event is processed, **Then** products only available from that store for that window are shown as unavailable in Delivery Promise navigation within the indexing SLO.
2. **Given** a product is available from multiple stores and only one reaches capacity, **When** availability is computed, **Then** the product remains available through the other stores.
3. **Given** a store's capacity is restored (new window opens or limit is raised), **When** the event is processed, **Then** products at that store become available again in navigation automatically.

### User Story 2 — Availability is consistent between Delivery Promise and Checkout for capacity-constrained stores (Priority: P1)

A shopper sees a product available in navigation from a store that appeared to have capacity. They add it to cart and proceed to checkout. The Checkout confirms the same store as available — because the capacity check is consistent between the two systems.

**Acceptance Scenarios:**

1. **Given** Delivery Promise shows a product as available (store has capacity), **When** the shopper proceeds to Checkout, **Then** Checkout confirms the same availability for that store.
2. **Given** Delivery Promise shows a product as unavailable due to capacity, **When** the merchant checks Checkout simulation, **Then** Checkout also shows the product as unavailable for that store.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST listen to Operational Capacity state change events (store at capacity / capacity restored) and update the Delivery Promise availability index within the defined indexing SLO.
- **FR-002**: When a store reaches Operational Capacity for a delivery window, products only available from that store for that window MUST be shown as unavailable in Delivery Promise navigation.
- **FR-003**: When a product has multiple fulfillment options and only one store is at capacity, the product MUST remain available through other eligible stores.
- **FR-004**: When a store's capacity is restored, products at that store MUST become available in Delivery Promise navigation automatically, within the indexing SLO.
- **FR-005**: Delivery Promise availability for capacity-constrained stores MUST be consistent with the Checkout capacity check.

---

## Assumptions

- Operational Capacity state changes are emitted as events that Delivery Promise can subscribe to.
- The Checkout capacity check and Delivery Promise use the same capacity state source.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Merchants using Operational Capacity can activate Delivery Promise without showing products as available at capacity-constrained stores — 0 systematic divergences between Delivery Promise and Checkout for capacity state.
- **SC-002**: Capacity state changes are reflected in Delivery Promise navigation within the defined indexing SLO.
- **SC-003**: At least one T1/T2 merchant using Operational Capacity activates Delivery Promise in Open Beta.
