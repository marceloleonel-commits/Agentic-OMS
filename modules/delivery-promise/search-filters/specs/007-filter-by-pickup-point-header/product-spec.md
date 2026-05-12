# Product Spec — Filter by Pickup Point in the Header

## Clarifications

- Q: How does the header pickup point selector relate to the per-PLP specific pickup point filter? → A: The header selection acts as the sitewide default for the session. When the shopper arrives on a PLP, the per-PLP filter is pre-set to the store selected in the header. The shopper can override it on that PLP without changing the header setting.
- Q: What stores are shown in the header selector? → A: Stores within the shopper's configured radius (default 50 km), ordered by distance from their ZIP. Same list as the per-PLP pickup point filter.
- Q: Does the selection persist across sessions? → A: No — it persists for the current session only. Cross-session persistence is a separate MMR.
- Q: What happens if the shopper changes their ZIP and the selected store is now outside the radius? → A: The store selection is cleared. The shopper must re-select a store from the updated list.
- Q: Does the header pickup point selection require the shopper to have selected "Pickup" as the delivery method? → A: Selecting a specific pickup point in the header implicitly sets the delivery method to Pickup for the session.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper selects their regular store in the header and all PLPs filter to that store (Priority: P1)

A shopper who always collects from "Kopenhagen Morumbi" selects that store in the header pickup point selector. As they browse multiple PLPs throughout the session, each page automatically shows only products available at Kopenhagen Morumbi.

**Acceptance Scenarios:**

1. **Given** a shopper selects a pickup point in the header, **When** they navigate to any PLP, **Then** the PLP is pre-filtered to show only products available at that specific store.
2. **Given** the header has a store selected, **When** the shopper overrides to a different store on a specific PLP, **Then** that PLP shows the overriding store's inventory, but the header still reflects the original store for subsequent pages.
3. **Given** the header has a store selected, **When** the shopper changes their ZIP and the store is now outside the new radius, **Then** the store selection is cleared from the header and the shopper must re-select.
4. **Given** a shopper starts a new session, **When** they visit the storefront, **Then** no store is pre-selected in the header.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a specific pickup point selector in the storefront header, showing stores within the shopper's radius ordered by distance.
- **FR-002**: The header selection MUST persist sitewide across all PLPs and search results for the current session.
- **FR-003**: When a shopper arrives on a PLP, the per-PLP pickup point filter MUST be pre-set to match the header selection.
- **FR-004**: Per-PLP filter overrides MUST NOT change the header's sitewide store selection.
- **FR-005**: If the shopper's ZIP changes and the selected store falls outside the new radius, the store selection MUST be cleared from the header.
- **FR-006**: Selecting a pickup point in the header MUST implicitly set the delivery method to Pickup for the session.
- **FR-007**: The header selection MUST NOT persist beyond the current session.

---

## Success Criteria

- **SC-001**: 0 PLPs that fail to pre-apply the pickup point selected in the header when the shopper navigates to them.
- **SC-002**: 0 products shown as available at the selected store that are unavailable for pickup at Checkout for the same store.
