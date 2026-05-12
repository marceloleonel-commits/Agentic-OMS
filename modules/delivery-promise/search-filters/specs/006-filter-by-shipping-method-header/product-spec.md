# Product Spec — Filter by Shipping Method in the Header

## Clarifications

- Q: How does the header selector relate to the per-PLP Shipping Method filter? → A: The header selection acts as a sitewide default. When the shopper arrives on a PLP, the per-PLP filter is pre-set to match the header selection. The shopper can override it on that PLP without changing the header setting.
- Q: Does the header selection persist across sessions? → A: No — it persists for the current session only. Cross-session persistence (e.g., saved to account) is a separate MMR.
- Q: What if a shopper changes the per-PLP filter but the header still shows the previous method? → A: The header reflects the sitewide session setting. Per-PLP overrides are local to that PLP and do not update the header.
- Q: Does the header selector include a ZIP input? → A: Yes — the shopper can also update their ZIP from the header, which applies sitewide for the session.
- Q: Is this available for logged-in and anonymous shoppers? → A: Yes, both. The session state is maintained client-side and does not require authentication.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper sets "Pickup" in the header and all PLPs pre-filter to pickup (Priority: P1)

A shopper who always picks up sets "Pickup" in the header delivery method selector. As they navigate across multiple PLPs throughout the session, each PLP automatically filters to pickup-available products without the shopper needing to re-apply the filter each time.

**Acceptance Scenarios:**

1. **Given** a shopper sets "Pickup" in the header, **When** they navigate to any PLP, **Then** the PLP is pre-filtered to show only products available for pickup.
2. **Given** the header is set to "Pickup", **When** the shopper overrides to "Shipping" on a specific PLP, **Then** that PLP shows shipping-available products, but the header still reflects "Pickup" for subsequent pages.
3. **Given** the header delivery method is set, **When** the shopper starts a new session, **Then** the header reverts to the default (no method selected).
4. **Given** a shopper updates their ZIP in the header, **When** they navigate to any PLP, **Then** the new ZIP is used for all availability calculations sitewide.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST provide a delivery method selector (Shipping / Pickup) in the storefront header.
- **FR-002**: The header selection MUST persist sitewide across all PLPs and search results for the current session.
- **FR-003**: When a shopper arrives on a PLP, the per-PLP Shipping Method filter MUST be pre-set to match the header selection.
- **FR-004**: Per-PLP filter overrides MUST NOT change the header's sitewide setting.
- **FR-005**: The header selector MUST include a ZIP update field that applies sitewide for the session.
- **FR-006**: The header selector MUST be available for both anonymous and authenticated shoppers.
- **FR-007**: The header selection MUST NOT persist beyond the current session.

---

## Success Criteria

- **SC-001**: 0 PLPs that fail to pre-apply the delivery method set in the header when the shopper navigates to them.
- **SC-002**: Per-PLP override does not overwrite the header sitewide setting.
