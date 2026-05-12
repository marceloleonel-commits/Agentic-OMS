# Product Spec — Compatibility with MOI in Delivery Promise

## Clarifications

- Q: What is MOI (Multilevel Omnichannel Inventory)? → A: A VTEX capability that manages inventory across multiple levels of a merchant's network (e.g., store level, regional warehouse level, national DC level) with shared inventory pools and reservation logic between levels.
- Q: How does MOI affect Delivery Promise availability? → A: MOI changes where inventory "lives" — a product may have stock at a regional warehouse that is shared across multiple stores, rather than each store holding its own inventory. Delivery Promise must read from the correct MOI level to produce accurate availability per store and delivery zone.
- Q: Can a product appear available in Delivery Promise via MOI stock when it would not be available at Checkout? → A: No — that is the failure mode this spec prevents. After this spec, Delivery Promise availability for MOI-managed products must match Checkout.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — MOI inventory is correctly reflected in Delivery Promise availability (Priority: P1)

A retailer uses MOI with shared inventory at a regional DC serving 5 stores. A product has 10 units at the DC. Delivery Promise correctly shows the product as available for shoppers in all 5 stores' delivery zones. When the 10 units are depleted, Delivery Promise updates and shows the product as unavailable.

**Acceptance Scenarios:**

1. **Given** a product has inventory managed through MOI at a regional level, **When** Delivery Promise computes availability, **Then** it correctly reads inventory from the appropriate MOI level and shows the product as available for shoppers in the relevant zones.
2. **Given** MOI inventory is depleted, **When** the depletion event is processed, **Then** Delivery Promise marks the product as unavailable for the affected zones.
3. **Given** Delivery Promise shows a product as available via MOI stock, **When** Checkout simulation is run, **Then** Checkout confirms the same availability.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Delivery Promise MUST correctly read and interpret MOI inventory levels when computing product availability.
- **FR-002**: Delivery Promise MUST process MOI inventory change events and update availability accordingly within the indexing SLO.
- **FR-003**: Delivery Promise availability for MOI-managed products MUST be consistent with Checkout availability — 0 systematic divergences.

---

## Assumptions

- MOI inventory events are emitted by the MOI system and are subscribable by Delivery Promise.
- The Checkout availability check for MOI products uses the same inventory source as Delivery Promise after this spec.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 systematic divergences between Delivery Promise and Checkout for MOI-managed products.
- **SC-002**: At least one T1/T2 merchant using MOI activates Delivery Promise in GA phase.
- **SC-003**: cannotBeDelivered rate for MOI-managed products in Delivery Promise sessions is near 0%.
