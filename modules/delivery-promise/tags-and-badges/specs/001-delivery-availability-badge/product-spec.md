# Product Spec — Delivery Availability Badge

## Clarifications

- Q: What does the badge say when the product is available for delivery? → A: The label is merchant-configurable. Defaults: "Available for delivery" (shipping) or "Available for pickup" (pickup point within radius). Both badges can appear if the product is available for both methods.
- Q: What if the shopper has no location set? → A: No badge is shown. The badge requires an active location context (ZIP, geolocation, or IP inference).
- Q: Is the badge shown for products not available at the shopper's location? → A: No — unavailable products are either hidden (if a delivery filter is active) or shown without a badge. The badge is an affirmative signal only.
- Q: How accurate is the badge vs. Checkout availability? → A: The badge reflects the Delivery Promise index, which is the same source Checkout uses. 0 false positives is the target.
- Q: Is the badge shown on PDP too? → A: PDP availability display is out of scope for this MMR.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper sees availability badges on product cards and can browse with confidence (Priority: P1)

A shopper visits a PLP with their ZIP set. Products deliverable to their ZIP show a "Available for delivery" badge. Products available at a nearby pickup point show "Available for pickup". Products not reachable via either method show no badge (or are hidden if a delivery filter is active).

**Acceptance Scenarios:**

1. **Given** a shopper has their ZIP set, **When** they browse a PLP, **Then** each product card shows an availability badge for delivery methods available at their ZIP.
2. **Given** a product is available for both shipping and pickup, **When** the card is rendered, **Then** both availability signals are shown.
3. **Given** a shopper has no location set, **When** they browse a PLP, **Then** no availability badges are shown.
4. **Given** a product is not available for any delivery method at the shopper's ZIP, **When** the card is rendered, **Then** no availability badge appears.

---

## Requirements *(mandatory)*

- **FR-001**: Product cards on PLPs and search result pages MUST display an availability badge for each delivery method available at the shopper's ZIP, driven by Delivery Promise.
- **FR-002**: Badges MUST NOT be shown when no location is set for the session.
- **FR-003**: Badge labels MUST be merchant-configurable. Defaults: "Available for delivery" and "Available for pickup."
- **FR-004**: The badge MUST reflect the same availability data used by Checkout — 0 false positives.
- **FR-005**: The badge MUST be available for FastStore, VTEX IO, and headless via the Delivery Promise API.

---

## Success Criteria

- **SC-001**: 0 products showing an availability badge for a method that fails at Checkout for the same ZIP and method.
- **SC-002**: Badge display is consistent with Delivery Promise availability data — no stale or cached false positives.
