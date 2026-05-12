# Product Spec — Sort Search Results: Available Products First

## Clarifications

- Q: When does this sorting apply? → A: Only when the shopper's location is known (ZIP code or geolocation is set). Without a location, Delivery Promise cannot determine availability, so availability-based sorting does not apply.
- Q: Does this replace or complement other relevance signals? → A: It adds an availability layer to the existing relevance ranking. Available products are ranked above unavailable ones; within each group, existing relevance signals (text match, popularity, click-through rate) continue to determine relative order.
- Q: What happens to products that are available in some SKUs but not others? → A: The product is considered available if at least one SKU is available for the shopper's location. It ranks in the available tier. SKU-level availability is surfaced separately (via tags/badges or SKU selector on PDP).
- Q: Does this require the merchant to enable "Show Out-of-Stock Product" in Catalog? → A: No. When out-of-stock products are hidden (default), the filter already ensures only available products appear — sorting is redundant. This feature's impact is most visible when the merchant enables showing out-of-stock products, ensuring they appear last.
- Q: Is this sorting configurable per merchant? → A: Yes. Merchants can enable or disable availability-based sorting independently of other Delivery Promise features.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Available products appear first when shopper has location set (Priority: P1)

A shopper at a pharmacy retailer (Drogarias Pacheco) sets their ZIP code. The merchant has enabled "Show Out-of-Stock Product." When the shopper searches for a medication, in-stock products available for their location appear first. Out-of-stock items appear at the end of the results, clearly showing the pharmacy carries them — but not cluttering the top of the results.

**Why this priority:** This is the direct conversion lever. Without it, out-of-stock items compete with available products for top-of-page attention, reducing findability of buyable inventory.

**Acceptance Scenarios:**

1. **Given** a shopper has a location set and searches for a product, **When** results render, **Then** products available for the shopper's location appear before products that are unavailable or out-of-stock.
2. **Given** a product has some SKUs available and some not, **When** it is ranked, **Then** it appears in the available tier (not the out-of-stock tier).
3. **Given** the shopper has no location set, **When** results render, **Then** availability-based sorting does not apply — results follow the standard relevance ranking.
4. **Given** availability-based sorting is enabled, **When** other relevance signals rank products, **Then** those signals apply within each tier (available vs. unavailable) — not overriding the tier separation.

### User Story 2 — Out-of-stock products appear last, never on the first page (Priority: P2)

A merchant with a catalog of 10,000 SKUs enables "Show Out-of-Stock Product" and availability-based sorting. A shopper searching a category sees 24 results per page. All 24 on the first page are available for their location. Out-of-stock products only appear on later pages.

**Acceptance Scenarios:**

1. **Given** there are enough available products to fill the first page of results, **When** the shopper views the first page, **Then** no out-of-stock products appear on page 1.
2. **Given** there are fewer available products than the page size, **When** the first page renders, **Then** available products fill positions 1–N and out-of-stock products fill remaining positions — no mixing.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST rank products available for the shopper's location above products that are out-of-stock or unavailable for their location in search results and PLP, when the shopper's location is set.
- **FR-002**: Within the available tier and within the unavailable tier, existing relevance signals MUST continue to determine relative ranking. Availability-based sorting only separates the two tiers.
- **FR-003**: A product with at least one SKU available for the shopper's location MUST be ranked in the available tier.
- **FR-004**: Availability-based sorting MUST NOT apply when the shopper has no location set.
- **FR-005**: Merchants MUST be able to enable or disable availability-based sorting independently of other Delivery Promise features.
- **FR-006**: The sort behavior MUST be consistent with the "Show Out-of-Stock Product" Catalog setting — out-of-stock products only appear in results if the merchant has enabled that setting, and when shown, they appear last.

---

## Assumptions

- Delivery Promise is active and providing availability data to Intelligent Search.
- The shopper's location is available to the search engine at query time.
- Intelligent Search supports availability as a ranking signal.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 out-of-stock or location-unavailable products appear before available products in search results when a shopper's location is set.
- **SC-002**: Conversion uplift from availability-based sorting measurable in merchants who have both "Show Out-of-Stock Product" enabled and availability sorting enabled (A/B test).
- **SC-003**: No regression in relevance quality for searches where all top results are available products (availability sort should be a no-op in that case).
