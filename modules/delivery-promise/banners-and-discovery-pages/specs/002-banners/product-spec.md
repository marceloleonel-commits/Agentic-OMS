# Product Spec — Delivery Promise Banners

## Clarifications

- Q: What message templates are available? → A: Merchant-configurable. The system provides template variables: `[cutoff_time]`, `[delivery_option]`, `[city]`, `[store_count]`, `[estimated_date]`. Example: "Order by [cutoff_time] and get it today in [city]."
- Q: Is the banner shown when no location is set? → A: No. The banner requires an active location context. When no ZIP is set, the banner is suppressed or replaced by a static fallback configured by the merchant.
- Q: Can banners be shown on specific PLPs only? → A: Yes — banners can be targeted by page (homepage, specific PLP, all PLPs) in the CMS/admin configuration.
- Q: Does the banner update when the shopper changes their ZIP? → A: Yes — the delivery messaging re-renders using the new ZIP's Delivery Promise data.
- Q: What if no delivery promise applies to the shopper's ZIP (e.g., no same-day option)? → A: The banner is suppressed. The merchant can configure a fallback static banner for this case.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper sees a personalized cutoff banner and is motivated to complete purchase (Priority: P1)

A shopper visits a PLP at 11 AM with their ZIP set to São Paulo. A banner displays "Order by 2 PM for same-day delivery to São Paulo." The message reflects the actual Delivery Promise cutoff for their ZIP and creates urgency for time-sensitive shoppers.

**Acceptance Scenarios:**

1. **Given** a shopper has their ZIP set, **When** they visit a PLP with a delivery banner configured, **Then** the banner displays messaging personalized to their ZIP using real Delivery Promise data.
2. **Given** a banner shows a same-day cutoff time, **When** that cutoff time passes, **Then** the banner updates (or is suppressed) to no longer promise same-day delivery.
3. **Given** a shopper has no location set, **When** they visit a PLP with a banner configured, **Then** the banner is suppressed or a static fallback is shown.
4. **Given** a shopper updates their ZIP, **When** the ZIP change is confirmed, **Then** the banner re-renders with delivery messaging for the new ZIP.

---

## Requirements *(mandatory)*

- **FR-001**: Merchants MUST be able to configure delivery-aware banners on PLPs and the homepage using template variables populated by Delivery Promise data for the shopper's ZIP.
- **FR-002**: Banners MUST NOT be shown when no location is set; merchants MAY configure a static fallback banner.
- **FR-003**: Banner messaging MUST update in real time when the shopper's ZIP changes.
- **FR-004**: Banner messaging MUST update when delivery conditions change (e.g., cutoff time passes and same-day is no longer available).
- **FR-005**: Banners MUST be suppressible when no applicable delivery promise exists for the shopper's ZIP.
- **FR-006**: Merchants MUST be able to target banners to specific pages (homepage, all PLPs, specific PLP).

---

## Success Criteria

- **SC-001**: 0 banners showing a delivery promise (e.g., "same-day delivery by 2 PM") when that promise cannot be fulfilled at Checkout for the same ZIP.
- **SC-002**: Banner messaging is consistent with Delivery Promise data — no stale promises shown after cutoff times have passed.
