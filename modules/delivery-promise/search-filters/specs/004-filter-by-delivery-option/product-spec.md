# Product Spec — Filter by Delivery Option in PLP

## Clarifications

- Q: What are "delivery options"? → A: Named delivery types configured by the merchant in the Fulfillment Catalog (e.g., "Express Delivery", "Same-Day Delivery", "Scheduled Delivery", "Standard Shipping"). These are distinct from the Shipping vs. Pickup method distinction.
- Q: How are available options surfaced in the filter? → A: The filter panel shows only options that are configured by the merchant AND have at least one product available for the shopper's ZIP. Empty-result options are not shown.
- Q: Does this require Fulfillment Catalog? → A: Yes. Delivery options are defined in the Fulfillment Catalog. Merchants without it configured will not expose this filter.
- Q: Can multiple delivery options be selected simultaneously? → A: No — one delivery option at a time, consistent with Checkout behavior (one delivery option per cart).
- Q: Does the filter persist across pages? → A: No — applies to the current PLP only.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper filters by Same-Day Delivery and sees only products available for that option (Priority: P1)

A shopper on a PLP needs a birthday gift delivered today. They select "Same-Day Delivery" from the delivery option filter. Only products where same-day delivery is available for their ZIP are shown.

**Acceptance Scenarios:**

1. **Given** a shopper selects a delivery option filter, **When** the filter is applied, **Then** only products available through that delivery option for the shopper's ZIP are shown.
2. **Given** a delivery option filter is active, **When** the shopper updates their ZIP, **Then** the assortment refreshes and the selected option is re-evaluated for the new ZIP.
3. **Given** the filter is active, **When** the shopper navigates to a different PLP, **Then** the delivery option filter does not carry over.
4. **Given** a delivery option is unavailable for any product at the shopper's ZIP, **When** the filter panel is rendered, **Then** that option is not shown as a selectable filter.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a delivery option filter on PLP driven by the merchant's Fulfillment Catalog configuration.
- **FR-002**: The filter MUST show only options available for at least one product at the shopper's ZIP — empty options must not appear.
- **FR-003**: Selecting a delivery option MUST show only products available through that option for the shopper's ZIP.
- **FR-004**: Only one delivery option may be active at a time.
- **FR-005**: The filter MUST apply to the current PLP only — it does not persist across pages.
- **FR-006**: This filter requires Fulfillment Catalog to be configured; it MUST NOT appear for merchants without it.

---

## Success Criteria

- **SC-001**: 0 products shown as available for a delivery option that is unavailable at Checkout for the same ZIP and option.
- **SC-002**: Delivery option filter results are consistent with Checkout availability for the same option and ZIP.
