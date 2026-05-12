# Product Spec — Filter by Specific Pickup Point in PLP

## Clarifications

- Q: How does the shopper select a specific pickup point? → A: From a list of available stores within the configured radius. The list is ordered by distance (see Pickup Point Listing MMR). The shopper selects one from the list.
- Q: Does selecting a specific pickup point persist across pages? → A: No — this filter applies to the current PLP only. Sitewide persistence (the store filter in the header) is a separate MMR.
- Q: What if the shopper selects a store and then changes their ZIP? → A: The store selection is cleared if the new ZIP puts the store outside the radius. The shopper must re-select.
- Q: Is this filter available in the header or only in the PLP filter panel? → A: In the PLP filter panel. The header-level persistent store filter is a separate MMR.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper selects "Farmácias São João Moinhos de Vento" and sees only that store's available products (Priority: P1)

A shopper selects a specific pharmacy location from the pickup point filter. The PLP updates to show only products available at that location. Products stocked at other stores but not at Moinhos de Vento are hidden.

**Acceptance Scenarios:**

1. **Given** a shopper selects a specific pickup point from the filter, **When** the filter is applied, **Then** only products available at that specific location are shown.
2. **Given** a specific store is selected, **When** the shopper navigates to a different PLP, **Then** the store filter does not carry over (applies to current PLP only).
3. **Given** the shopper changes their ZIP and the selected store is outside the new radius, **When** the ZIP is confirmed, **Then** the store selection is cleared.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a filter option to select a specific pickup point from the list of stores within the shopper's radius.
- **FR-002**: When a specific pickup point is selected, the system MUST show only products available at that location.
- **FR-003**: The filter MUST apply to the current PLP only — it does not persist across pages.

---

## Success Criteria

- **SC-001**: 0 products shown as available at a specific store that are not available at Checkout for the same store.
