# Product Spec — Filter by Dynamic Delivery Estimate in PLP

## Clarifications

- Q: What time windows are available? → A: "Arrives today", "Arrives tomorrow", "Arrives within 3 days", "Arrives within 7 days". The merchant may configure which windows are shown.
- Q: How is "today" defined? → A: Based on the current date and time at the moment of the request. A product qualifies for "today" if Delivery Promise computes an estimated delivery date/time within the same calendar day, accounting for carrier cutoff times.
- Q: Does the estimate account for carrier cutoffs? → A: Yes. Estimates are computed by Delivery Promise using real-time carrier schedules and cutoff windows. A product ordered after the last carrier pickup of the day will not qualify for "today."
- Q: Does the filter persist across pages? → A: No — applies to the current PLP only.
- Q: What if no products match the selected time window? → A: The PLP renders an empty state with a message. The shopper can widen the window or clear the filter.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper filters by "Arrives today" and sees only products deliverable today (Priority: P1)

A shopper needs a gift delivered today. They select "Arrives today" from the delivery estimate filter. The PLP shows only products for which Delivery Promise computes a same-day estimate for their ZIP, accounting for current cutoff times.

**Acceptance Scenarios:**

1. **Given** a shopper selects "Arrives today," **When** the filter is applied, **Then** only products with a same-day delivery estimate for the shopper's ZIP are shown.
2. **Given** a shopper selects a time window, **When** the shopper updates their ZIP, **Then** the assortment refreshes and estimates are recalculated for the new ZIP.
3. **Given** it is past the carrier cutoff time for same-day delivery, **When** the filter is applied for "today," **Then** no products qualify and the empty state is shown.
4. **Given** the filter is active, **When** the shopper navigates to a different PLP, **Then** the estimate filter does not carry over.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a delivery estimate filter on PLP with at least the following time windows: Today, Tomorrow, Within 3 days, Within 7 days.
- **FR-002**: Estimates MUST be computed by Delivery Promise in real time, accounting for carrier cutoff schedules and the current date/time.
- **FR-003**: Selecting a time window MUST show only products for which Delivery Promise computes an estimate within the selected window for the shopper's ZIP.
- **FR-004**: The filter MUST apply to the current PLP only — it does not persist across pages.
- **FR-005**: When no products match the selected window, the system MUST render an empty state with a clear message and an option to widen or clear the filter.
- **FR-006**: The merchant MUST be able to configure which estimate windows are surfaced in the filter.

---

## Success Criteria

- **SC-001**: 0 products shown as deliverable within a time window that fail to arrive within that window at Checkout for the same ZIP.
- **SC-002**: Estimate filter results are consistent with Delivery Promise estimates shown on product cards and at Checkout.
