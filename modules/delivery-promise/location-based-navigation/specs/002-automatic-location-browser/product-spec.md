# Product Spec — Automatic Location Detection via Browser

## Clarifications

- Q: When is the geolocation permission requested? → A: On first visit or on first user interaction (configurable by the merchant). Requesting immediately on page load may trigger browser-level blocking; requesting on interaction (e.g., scroll, click) typically has higher acceptance rates.
- Q: What happens if the shopper denies geolocation? → A: The manual ZIP input field is displayed as fallback. The session proceeds without automatic location detection.
- Q: What if the browser doesn't support geolocation? → A: Same fallback as permission denied — manual ZIP input is shown.
- Q: Is the detected location stored across sessions? → A: No. For privacy reasons, detected geolocation is not persisted beyond the current session. Returning shoppers see the geolocation request again on their next visit.
- Q: Can the shopper override the detected location? → A: Yes. The detected ZIP/coordinates populate the location input, which the shopper can modify at any time. Manual entry always overrides automatic detection.
- Q: How are coordinates resolved to a ZIP code? → A: Via reverse geocoding (coordinates → ZIP). The resolved ZIP is used as the location context for Delivery Promise.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper grants geolocation and sees location-aware assortment immediately (Priority: P1)

A shopper in Recife visits a pharmacy storefront for the first time. The browser requests geolocation. The shopper grants it. The assortment immediately shows products available for their detected location — including products from the local franchise store — without the shopper typing anything.

**Acceptance Scenarios:**

1. **Given** a shopper visits the storefront and geolocation is requested, **When** the shopper grants permission, **Then** their coordinates are resolved to a ZIP and the assortment filters to products available at that location.
2. **Given** geolocation is granted and a ZIP is resolved, **When** the shopper navigates to another page, **Then** the detected location persists for the session.
3. **Given** the shopper wants to change location, **When** they manually enter a different ZIP, **Then** the manual entry overrides the detected location.

### User Story 2 — Shopper denies geolocation and sees manual ZIP input (Priority: P1)

A shopper denies the geolocation request. The storefront shows the manual ZIP input field. The assortment falls back to the standard non-location-aware view until the shopper enters a ZIP manually.

**Acceptance Scenarios:**

1. **Given** a shopper denies geolocation permission, **When** the fallback renders, **Then** the manual ZIP input field is displayed.
2. **Given** the browser does not support geolocation, **When** the page loads, **Then** the manual ZIP input field is shown directly without attempting a geolocation request.

---

## Requirements *(mandatory)*

- **FR-001**: The system MUST request browser geolocation permission on page load or first user interaction (merchant-configurable).
- **FR-002**: On permission granted, the system MUST resolve coordinates to a ZIP code and use it to filter the assortment.
- **FR-003**: On permission denied or browser incompatibility, the system MUST fall back gracefully to the manual ZIP input.
- **FR-004**: The detected location MUST persist for the session and NOT be stored beyond it.
- **FR-005**: The shopper MUST be able to override the detected location with manual ZIP entry at any point.

---

## Success Criteria

- **SC-001**: % of sessions with active location context increases after enabling automatic detection (vs. manual-only baseline).
- **SC-002**: Graceful fallback works in 100% of denied/unsupported cases — 0 broken states or empty pages from failed geolocation.
