# Product Spec — Delivery Promise External Seller Protocol

## Clarifications

- Q: What data does an external seller send via the API? → A: At minimum: product/SKU identifiers, delivery zones (defined as ZIP ranges or CEP ranges), available SLAs per zone (delivery method, estimated time), and an availability signal (available / unavailable). The protocol mirrors what VTEX logistics would provide for a native seller.
- Q: How often can external sellers update their availability? → A: The API supports push-based updates — external sellers send availability changes as events (stock update, zone change, SLA change). Delivery Promise processes and indexes the updates on receipt, subject to indexing latency SLOs.
- Q: Is the availability from external sellers pre-computed or live-queried? → A: Pre-computed and indexed. Delivery Promise does not make live calls to external seller systems at query time. External sellers are responsible for keeping their availability data current via the push API.
- Q: What happens if an external seller stops sending updates? → A: Their last sent availability remains in the index. There is no automatic expiration in the initial release. The merchant is responsible for managing external seller integrations.
- Q: Are external seller products shown the same way as native seller products in navigation? → A: Yes. Once their availability is indexed, external seller products appear in location-aware navigation with the same badges and tags as native seller products (subject to the SLA data they provided).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — External seller sends availability data and their products appear in navigation (Priority: P1)

A marketplace operator has an external seller (not using VTEX logistics) with products available in São Paulo, Campinas, and Curitiba. The seller calls the Delivery Promise API with their availability data. After indexing, a shopper in São Paulo sees the external seller's products in location-aware navigation alongside native seller products.

**Acceptance Scenarios:**

1. **Given** an external seller sends product availability via the API with delivery zones, **When** the data is indexed, **Then** their products appear in navigation for shoppers in matching delivery zones.
2. **Given** a shopper's ZIP falls outside the external seller's delivery zones, **When** navigation renders, **Then** the external seller's products do not appear for that shopper.
3. **Given** an external seller sends a stock update (unavailable), **When** the update is indexed, **Then** their product is no longer shown as available in navigation.

### User Story 2 — External seller updates their delivery zones and navigation reflects the change (Priority: P2)

An external seller expands their delivery coverage to include Recife. They send an API update with the new zone. After indexing, shoppers in Recife see the external seller's products in navigation.

**Acceptance Scenarios:**

1. **Given** an external seller sends a zone expansion update, **When** the update is indexed, **Then** shoppers in the new zone see the seller's products in navigation.
2. **Given** an external seller sends a zone removal update, **When** the update is indexed, **Then** shoppers in the removed zone no longer see the seller's products.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an API for external sellers to send product availability data, including: product/SKU identifiers, delivery zones (ZIP/CEP ranges), SLAs per zone, and availability status.
- **FR-002**: The system MUST index external seller availability data received via the API and include it in Delivery Promise navigation, filters, tags, and badges.
- **FR-003**: The system MUST process availability update events from external sellers (stock changes, zone changes, SLA changes) and update the index.
- **FR-004**: External seller products MUST appear in location-aware navigation under the same conditions as native seller products — when the shopper's location falls within the seller's declared delivery zones.
- **FR-005**: The API MUST be documented and accessible to external sellers or their integration partners without VTEX support intervention.

---

## Assumptions

- External sellers are responsible for the accuracy and freshness of the availability data they send.
- The indexing latency for external seller updates follows the same SLOs as native availability updates.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: External seller products appear in navigation within the Delivery Promise indexing SLO after availability data is received via the API.
- **SC-002**: 0 external seller products shown as available in navigation for shoppers outside the seller's declared delivery zones.
- **SC-003**: At least one marketplace operator integrates external sellers via the protocol in Open Beta.
