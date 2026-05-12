# Product Spec — Compatibility with Any Seller Architecture

## Clarifications

- Q: What seller types does this cover? → A: Franchise accounts, regular sellers, seller portal sellers, and comprehensive sellers. External sellers are covered in a separate spec.
- Q: Why is seller architecture compatibility a standalone spec? → A: Each seller type has distinct inventory ownership, logistics configuration, and catalog linkage patterns. Incorrect handling of any type results in availability data that diverges from what Checkout would confirm — showing products as available when they cannot be fulfilled, or hiding products that genuinely are.
- Q: What is the assortment expansion opportunity? → A: Currently, only products from comprehensive sellers are displayed broadly. Products stocked at non-comprehensive white label sellers are hidden unless the shopper happens to be in the seller's delivery zone. Delivery Promise exposes these products to the right shoppers — e.g., +20% assortment for Hering, +120% for Bagaggio.
- Q: How is availability validated as correct for each seller type? → A: Delivery Promise availability for a product at a given ZIP is validated against a Checkout simulation run in parallel. Availability must match between the two systems except for known dynamic events (stockout, capacity).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Franchise seller inventory is correctly reflected in Delivery Promise (Priority: P1)

A fashion retailer operates 80 franchise stores as individual sellers. Each franchise has its own inventory and is configured with local delivery coverage. A shopper in Porto Alegre visits the storefront. Delivery Promise shows products available from the franchise store in Porto Alegre that were previously hidden from non-location-aware sessions.

**Acceptance Scenarios:**

1. **Given** a merchant operates franchise sellers with local inventory, **When** Delivery Promise computes availability for a shopper's ZIP, **Then** products stocked at the franchise in that region appear in navigation.
2. **Given** a franchise seller has no stock for a product, **When** availability is computed, **Then** that franchise does not contribute to the product's availability for its zone.
3. **Given** Delivery Promise shows a product as available from a franchise seller, **When** a Checkout simulation is run for the same product and ZIP, **Then** the result is consistent (available at Checkout).

### User Story 2 — Non-comprehensive white label sellers expand visible assortment (Priority: P1)

A retailer (Bagaggio) has products available only at non-comprehensive white label sellers. Without Delivery Promise, those products are hidden from shoppers who can actually receive them. With Delivery Promise, they appear for shoppers in the relevant delivery zones — increasing visible assortment by ~120%.

**Acceptance Scenarios:**

1. **Given** a product is available only at a non-comprehensive white label seller, **When** a shopper in the seller's delivery zone sets their ZIP, **Then** the product appears in navigation.
2. **Given** a shopper is outside the seller's delivery zone, **When** they browse, **Then** the product does not appear for that shopper's location.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Delivery Promise MUST correctly compute availability for products from franchise accounts, regular sellers, seller portal sellers, and comprehensive sellers.
- **FR-002**: Availability computation MUST respect each seller type's inventory configuration and delivery zone coverage.
- **FR-003**: Products available only from non-comprehensive white label sellers MUST appear in navigation for shoppers in the seller's delivery zone.
- **FR-004**: Availability shown by Delivery Promise MUST be consistent with Checkout simulation for the same product and ZIP, except for known dynamic events (stockout, capacity, cutoff time).

---

## Assumptions

- Each seller type's inventory and logistics configuration is correctly set up in the merchant's VTEX account.
- Checkout simulation is used as the source of truth for availability validation during testing.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Availability shown by Delivery Promise matches Checkout simulation for the same product and ZIP across all seller types, with 0 systematic divergences.
- **SC-002**: Merchants using non-comprehensive white label sellers show measurable assortment expansion after activating Delivery Promise (target: at least +20% for applicable merchants).
- **SC-003**: cannotBeDelivered rate in sessions using Delivery Promise is near 0% across all seller architecture types.
