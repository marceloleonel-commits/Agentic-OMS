# Product Spec — Location Inference by IP Address

## Clarifications

- Q: What precision does IP-based location provide? → A: City or region level — not street-level. For a shopper in São Paulo, the IP resolves to the São Paulo metro region. A representative ZIP for that region is used as the location estimate.
- Q: What happens with VPN or corporate networks? → A: IP location may resolve to an incorrect region or fail entirely. Fallback to the standard assortment (no location filter) applies. The shopper is shown the manual ZIP input to provide an accurate location.
- Q: Is IP-inferred location shown to the shopper? → A: Yes — the inferred location should be visible in the location input field (e.g., "São Paulo — SP"), allowing the shopper to confirm or override it.
- Q: Does IP inference apply when manual ZIP or browser geolocation is already set? → A: No. Explicit location (manual ZIP or browser geolocation) always takes priority. IP inference is only the last-resort fallback.
- Q: Priority order of location sources? → A: (1) Manual ZIP entry, (2) Browser geolocation, (3) Logged-in address, (4) IP inference. Each higher-priority source overrides lower ones.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Anonymous shopper sees location-aware assortment without any input (Priority: P1)

A shopper visits the storefront on mobile without granting geolocation and without entering a ZIP. Their IP resolves to Porto Alegre. The assortment shows products available for the Porto Alegre region. The location field shows "Porto Alegre — RS" with an option to change it.

**Acceptance Scenarios:**

1. **Given** no explicit location is set (no ZIP, no geolocation), **When** the page loads, **Then** the system resolves the shopper's IP to a region and filters the assortment accordingly.
2. **Given** an IP-inferred location is active, **When** the shopper manually enters a ZIP, **Then** the manual ZIP overrides the inferred location.
3. **Given** the IP cannot be resolved (VPN, unrecognized range), **When** the page loads, **Then** the fallback assortment is shown and the manual ZIP input is surfaced.

---

## Requirements *(mandatory)*

- **FR-001**: When no explicit location is available, the system MUST attempt to resolve the shopper's IP address to a geographic region and use a representative ZIP for that region as the location estimate.
- **FR-002**: The inferred location MUST be visible to the shopper in the location input field, allowing easy override.
- **FR-003**: Manual ZIP and browser geolocation MUST always override IP-inferred location.
- **FR-004**: When IP resolution fails (VPN, unrecognized IP), the system MUST fall back to the standard assortment and surface the manual ZIP input.
- **FR-005**: IP-inferred location MUST NOT be stored beyond the current session.

---

## Success Criteria

- **SC-001**: % of sessions with active location context increases after enabling IP inference (vs. manual + browser baseline).
- **SC-002**: 0 cases where IP-inferred location overrides an explicit location (manual ZIP or geolocation).
- **SC-003**: Graceful fallback in 100% of unresolvable IP cases — 0 broken states.
