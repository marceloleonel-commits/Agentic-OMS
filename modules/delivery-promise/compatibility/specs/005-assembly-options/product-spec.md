# Product Spec — Compatibility with Assembly Options in Delivery Promise

## Clarifications

- Q: What are Assembly Options in VTEX? → A: A configuration that marks a product as requiring an assembly or installation service (e.g., furniture assembly, appliance installation). The service must be available for the shopper's delivery region for the product to be purchasable.
- Q: How does Assembly Options affect Delivery Promise availability? → A: Without this spec, Delivery Promise evaluates only product stock and logistics — not whether the assembly service is available. A product requiring assembly could appear as available in navigation even if no service provider covers the shopper's region.
- Q: What does "assembly service availability" mean for a given location? → A: The assembly service provider has a configured coverage area (by ZIP or region). A product with a required assembly option is only available if the shopper's ZIP falls within that coverage area AND the product has valid logistics to that ZIP.
- Q: What if the assembly service covers a region but has no capacity? → A: Capacity for assembly services is out of scope for this spec. This spec ensures that products are not shown as available outside the assembly service's defined coverage. Capacity within coverage areas is a future consideration.
- Q: Is this for required assembly only, or also optional assembly? → A: This initial release covers products where assembly is required (the product cannot be purchased without the assembly service). Optional assembly (where the shopper can choose to add assembly but can also buy without it) is a future consideration.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Product requiring assembly only appears as available where the service is covered (Priority: P1)

A furniture retailer sells sofas that require professional assembly. The assembly service covers São Paulo and Rio de Janeiro only. A shopper in São Paulo sets their ZIP — the sofa appears as available. A shopper in Florianópolis sets their ZIP — the sofa does not appear in navigation, even though the product has stock and logistics coverage there.

**Why this priority:** This is the core failure case being fixed. Without it, merchants using Assembly Options cannot use Delivery Promise without risking checkout failures for every assembly product shown outside service coverage.

**Acceptance Scenarios:**

1. **Given** a product requires an assembly option and the assembly service covers the shopper's ZIP, **When** availability is computed, **Then** the product appears as available in navigation.
2. **Given** a product requires an assembly option but the assembly service does NOT cover the shopper's ZIP, **When** availability is computed, **Then** the product does NOT appear as available in navigation — even if stock and logistics are available.
3. **Given** the assembly service expands coverage to a new region, **When** the update is indexed, **Then** products requiring that assembly appear as available for shoppers in the new region.
4. **Given** the assembly service removes coverage from a region, **When** the update is indexed, **Then** products requiring that assembly become unavailable for shoppers in the removed region.

### User Story 2 — Delivery Promise and Checkout are consistent for assembly products (Priority: P1)

A shopper sees a washing machine (requiring installation) as available in navigation. They add it to cart and proceed to checkout. Checkout confirms the product and installation service are both available for their ZIP.

**Acceptance Scenarios:**

1. **Given** Delivery Promise shows a product with assembly as available, **When** the shopper proceeds to Checkout, **Then** Checkout confirms both the product and assembly service are available for that ZIP.
2. **Given** Delivery Promise correctly hides a product with assembly due to service coverage, **When** Checkout simulation is run for the same product and ZIP, **Then** Checkout also returns the product as unavailable.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Delivery Promise MUST include assembly service availability as a required condition for products with required Assembly Options. A product with a required assembly option is only available when both product logistics AND assembly service coverage are valid for the shopper's ZIP.
- **FR-002**: Assembly service coverage (ZIP ranges or regions) MUST be indexed in Delivery Promise and used during availability computation.
- **FR-003**: Updates to assembly service coverage MUST be processed and reflected in the Delivery Promise index within the indexing SLO.
- **FR-004**: Delivery Promise availability for products with Assembly Options MUST be consistent with Checkout — 0 systematic divergences.

---

## Assumptions

- Assembly service coverage areas are configured in VTEX and emit events when changed.
- The Checkout availability check for assembly products uses the same coverage data as Delivery Promise after this spec.
- Initial release covers required assembly only; optional assembly is a future scope.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 products with required Assembly Options shown as available in Delivery Promise for shoppers outside the assembly service coverage area.
- **SC-002**: Delivery Promise and Checkout are consistent for assembly products — 0 systematic divergences.
- **SC-003**: At least one T1/T2 merchant using Assembly Options activates Delivery Promise in Open Beta.
