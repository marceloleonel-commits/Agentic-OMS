# Product Spec — Dynamic Delivery Estimate Tags

## Clarifications

- Q: Does the tag show the fastest delivery option or all options? → A: The tag shows the fastest available delivery estimate for the shopper's ZIP. The merchant can configure whether to show only the fastest or to show multiple estimates (e.g., fastest + cheapest).
- Q: How is "today" computed? → A: Based on the current date and time, carrier cutoff windows, and fulfillment schedules configured in Delivery Promise. An estimate of "today" is only shown if the order could realistically be placed and dispatched within the current day's last cutoff.
- Q: Are estimates shown when no location is set? → A: No. Estimates are ZIP-specific and require an active location context.
- Q: How fresh are the estimates? → A: Estimates are computed by the Delivery Promise engine at index time and refreshed at configurable intervals. They account for carrier cutoff windows and are not static.
- Q: What if no delivery estimate can be computed for a product? → A: No estimate tag is shown. The availability badge (if applicable) is shown instead.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper sees "Arrives today" on eligible product cards and clicks through with confidence (Priority: P1)

A shopper visits a PLP with their ZIP set in the morning. Products where Delivery Promise computes a same-day estimate display "Arrives today". Products with next-day estimates display "Arrives tomorrow". Products with longer estimates show "Arrives by [date]". Products with no estimate show no estimate tag.

**Acceptance Scenarios:**

1. **Given** a shopper has their ZIP set, **When** they browse a PLP, **Then** each product card shows the fastest delivery estimate computed by Delivery Promise for their ZIP.
2. **Given** a product has an estimate of "today," **When** it is past the carrier cutoff for same-day delivery, **Then** the tag updates to "tomorrow" or the next available date.
3. **Given** a shopper has no location set, **When** they browse a PLP, **Then** no estimate tags are shown.
4. **Given** no delivery estimate can be computed for a product, **When** the card is rendered, **Then** no estimate tag is shown on that card.
5. **Given** an estimate tag shows "Arrives today" on the PLP, **When** the shopper completes checkout for that product at the same ZIP, **Then** the checkout estimate is consistent with the PLP tag.

---

## Requirements *(mandatory)*

- **FR-001**: Product cards on PLPs and search result pages MUST display a dynamic delivery estimate tag computed by Delivery Promise for the shopper's ZIP.
- **FR-002**: The tag MUST reflect the fastest delivery option available for the product at the shopper's ZIP.
- **FR-003**: Estimate tags MUST NOT be shown when no location is set for the session.
- **FR-004**: Estimates MUST account for carrier cutoff windows and the current date and time — "Arrives today" MUST only appear if the estimate is still achievable.
- **FR-005**: The tag label format MUST be merchant-configurable (e.g., "Arrives [date]" vs. "Get it by [date]").
- **FR-006**: When no estimate can be computed, no estimate tag MUST appear — the card degrades gracefully.
- **FR-007**: Estimate tags MUST be consistent with the delivery estimates shown at Checkout for the same product and ZIP.

---

## Success Criteria

- **SC-001**: 0 products showing "Arrives today" at a time when same-day delivery is no longer achievable (post-cutoff).
- **SC-002**: PLP estimate tags are consistent with Checkout estimates for the same product and ZIP — no divergence between browsing and checkout delivery promises.
