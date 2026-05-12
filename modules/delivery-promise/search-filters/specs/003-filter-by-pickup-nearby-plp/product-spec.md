# Product Spec — Filter by Pickup Nearby in PLP

## Clarifications

- Q: How does "Pickup Nearby" differ from "Filter by Specific Pickup Point"? → A: Pickup Nearby shows products available at any pickup point within the radius. The shopper does not select a specific store. Filter by Specific Pickup Point requires store selection and filters to only that store's inventory.
- Q: What radius is used? → A: The Logistics-configured radius (default 50 km), consistent with Checkout and the Shipping Method filter.
- Q: Can the shopper update their ZIP within the filter? → A: Yes. The filter includes a ZIP update field consistent with the Shipping Method filter.
- Q: Does the filter persist across PLP pages? → A: No — it applies to the current PLP only. Sitewide persistence is a separate MMR.
- Q: Is this the same as the "Pickup" option in the Shipping Method filter? → A: Functionally similar but distinct. The Shipping Method filter (radio buttons) lets the shopper choose between Shipping and Pickup as the delivery method. Pickup Nearby is an additive filter that can be applied independently, for example alongside a shipping method already set.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper filters by Pickup Nearby and sees products collectible from stores within radius (Priority: P1)

A shopper on a pharmacy PLP selects "Pickup Nearby" from the filter panel. The PLP updates to show only products available at pickup points within 50 km of their ZIP. Products with no pickup availability in range are hidden.

**Acceptance Scenarios:**

1. **Given** a shopper applies the Pickup Nearby filter, **When** the filter is active, **Then** only products available at any pickup point within the configured radius are shown.
2. **Given** the Pickup Nearby filter is active, **When** the shopper updates their ZIP, **Then** the assortment refreshes for the new ZIP and new radius calculation.
3. **Given** the Pickup Nearby filter is active, **When** the shopper navigates to a different PLP, **Then** the filter does not carry over.
4. **Given** no pickup points exist within the radius for the shopper's ZIP, **When** the Pickup Nearby filter is applied, **Then** the PLP shows 0 results and surfaces a message that no products are available for pickup nearby.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a "Pickup Nearby" filter option on PLP that shows only products available at any pickup point within the configured radius of the shopper's ZIP.
- **FR-002**: The radius MUST be the Logistics-configured radius (default 50 km), consistent with Checkout pickup availability.
- **FR-003**: The shopper MUST be able to update their ZIP directly within the filter to recalculate nearby availability.
- **FR-004**: The filter MUST apply to the current PLP only — it does not persist across pages.
- **FR-005**: When no products match the Pickup Nearby filter, the system MUST surface a clear empty-state message.

---

## Success Criteria

- **SC-001**: 0 products shown as available for pickup nearby that cannot be collected at Checkout for the same ZIP.
- **SC-002**: Pickup Nearby filter results are consistent with Checkout availability for the same ZIP and radius.
