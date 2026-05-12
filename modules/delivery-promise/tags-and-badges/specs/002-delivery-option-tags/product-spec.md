# Product Spec — Delivery Option Tags

## Clarifications

- Q: What counts as a "delivery option" for a tag? → A: Named delivery types configured by the merchant in the Fulfillment Catalog (e.g., "Express Delivery", "Same-Day Delivery", "Scheduled Delivery"). These are distinct from the Shipping vs. Pickup method.
- Q: Can multiple tags appear on one product card? → A: Yes. A product may have multiple delivery options available — all applicable tags are shown. The merchant can configure which options generate visible tags and in what order.
- Q: Are tags shown when no location is set? → A: No. Tags require an active location context because delivery option availability is ZIP-specific.
- Q: Does this require Fulfillment Catalog? → A: Yes. Delivery option tags are driven by Fulfillment Catalog configuration. Merchants without it will not have delivery option tags.
- Q: How is tag accuracy guaranteed? → A: Tags reflect the Delivery Promise index, which is the same source used at Checkout — 0 false positives is the target.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper sees "Same-Day Delivery" tag on eligible products and can browse directly to them (Priority: P1)

A shopper visits a PLP with their ZIP set. Products eligible for same-day delivery at their location display a "Same-Day Delivery" tag. Products with express delivery show an "Express" tag. Products with no special delivery options show no delivery option tag (but may still show the availability badge).

**Acceptance Scenarios:**

1. **Given** a shopper has their ZIP set, **When** they browse a PLP, **Then** products available for configured delivery options show the corresponding tags.
2. **Given** a product is available for multiple delivery options, **When** the card is rendered, **Then** all applicable delivery option tags are shown.
3. **Given** a shopper has no location set, **When** they browse a PLP, **Then** no delivery option tags are shown.
4. **Given** a delivery option is available for a product at the shopper's ZIP, **When** the tag is shown, **Then** that delivery option must also be available at Checkout for the same ZIP.

---

## Requirements *(mandatory)*

- **FR-001**: Product cards on PLPs and search result pages MUST display delivery option tags for each Fulfillment Catalog option available at the shopper's ZIP, driven by Delivery Promise.
- **FR-002**: Tags MUST NOT be shown when no location is set for the session.
- **FR-003**: Tag labels and which options generate visible tags MUST be merchant-configurable via Fulfillment Catalog.
- **FR-004**: Multiple delivery option tags MAY appear on a single product card. Ordering is merchant-configurable.
- **FR-005**: Tags MUST reflect the same availability data used by Checkout — 0 false positives.
- **FR-006**: This feature requires Fulfillment Catalog to be configured; tags MUST NOT appear for merchants without it.

---

## Success Criteria

- **SC-001**: 0 products showing a delivery option tag for an option that is unavailable at Checkout for the same ZIP.
- **SC-002**: Delivery option tags are consistent with Delivery Promise index data — no stale or cached false positives.
