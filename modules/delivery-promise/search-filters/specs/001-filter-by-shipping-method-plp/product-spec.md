# Product Spec — Filter by Shipping Method (Delivery or Pickup) in PLP

## Clarifications

- Q: Why radio buttons instead of checkboxes? → A: Checkout currently supports only one delivery method per cart. Checkboxes would let shoppers filter combinations they cannot actually purchase. When FastCheckout supports multi-delivery, this may evolve.
- Q: What pickup radius is used? → A: The Logistics-configured radius (default 50 km), the same radius used by Checkout. A product shown as available for pickup during navigation is also available at Checkout.
- Q: Can the shopper update their ZIP within the filter? → A: Yes. The shipping filter includes a ZIP update field so the shopper can change their delivery address without navigating away.
- Q: Does this filter apply to both 1P and 3P products? → A: Yes. All products indexed by Delivery Promise, including those from 3P sellers who have sent availability via the External Sellers API.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper filters by Pickup and sees only products available for collection (Priority: P1)

A shopper on a fashion PLP selects "Pickup" from the delivery method filter. Only products available at pickup points within 50 km of their ZIP are shown. Products only available for home delivery are hidden.

**Acceptance Scenarios:**

1. **Given** a shopper selects "Shipping," **When** the filter is applied, **Then** only products deliverable to the shopper's ZIP are shown.
2. **Given** a shopper selects "Pickup," **When** the filter is applied, **Then** only products available for pickup within the configured radius are shown.
3. **Given** the filter uses radio buttons, **When** the shopper selects a method, **Then** only one is active — selecting one deselects the other.
4. **Given** "Shipping" is selected, **When** the shopper updates their ZIP in the filter, **Then** the assortment refreshes for the new ZIP.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a delivery method filter on PLP with at minimum two options: Shipping and Pickup.
- **FR-002**: Filters MUST use radio buttons — one method active at a time.
- **FR-003**: Pickup availability MUST use the same radius as Checkout (default 50 km).
- **FR-004**: The shopper MUST be able to update their ZIP directly within the shipping filter.
- **FR-005**: The filter MUST be available for FastStore, VTEX IO, and headless via API.

---

## Success Criteria

- **SC-001**: 0 products shown as available for a method that cannot fulfill to the shopper's location.
- **SC-002**: Pickup filter results are consistent with Checkout availability for the same method and ZIP.
