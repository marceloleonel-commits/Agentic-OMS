# Product Spec — Multi-Country Support in Delivery Promise

## Clarifications

- Q: How does location input normalization work internally? → A: The shopper's location input — whether a postal code, alphanumeric postcode, or a geographic dropdown selection — is resolved to a DeliveryZone hash. This hash is what Intelligent Search uses to filter product availability. The normalization layer maps any supported input format to the correct hash for the merchant's country.
- Q: What happens in countries with no postal code, like Bolivia? → A: The location input component must present a cascading geographic dropdown (e.g., Departamento > Ciudad). The selected municipality is resolved to a DeliveryZone hash. Postal code fields must not be shown or required in these countries.
- Q: Which countries have DeliveryZone subzone breakdowns available? → A: Brazil (106 subzones) and United States (74 subzones) are the first. The full list is here: [DeliveryZone subzones by country](https://docs.google.com/spreadsheets/d/12WWZ0zTnKlGTD6j58UqImwqyxN6jaoePNp4TYs40Y2Y/edit?gid=0#gid=0). As Delivery Promise expands, subzone breakdowns for all supported countries will be progressively added — this request process is transitional. Merchants who need a country not yet covered should open a ticket to **Product Support**, redirected to the **Fulfillment team**.
- Q: Does the External Seller Protocol change per country? → A: The protocol structure is the same. The change is that the `deliveryZone` field must accept identifiers valid for the seller's country — not limited to Brazilian zones.
- Q: Does the merchant need to configure anything extra per country? → A: No extra Delivery Promise configuration is required. Country context is derived from the merchant's binding and logistics setup. The Delivery Options module must, however, expose country-specific DeliveryZone configurations so merchants can define availability zones for each market.
- Q: Is availability consistent with Checkout per country? → A: Yes. A product shown as available via Delivery Promise for a given location input and country must also be available at Checkout for the same location and country.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper in Bolivia selects Departamento > Ciudad and sees correct availability (Priority: P1)

A shopper on a Bolivian storefront is presented with a Departamento > Ciudad dropdown instead of a postal code field. They select "Santa Cruz > Santa Cruz de la Sierra." The system resolves the selection to the correct DeliveryZone hash and Delivery Promise filters the assortment correctly.

**Acceptance Scenarios:**

1. **Given** a storefront bound to Bolivia, **When** the location input is rendered, **Then** a geographic dropdown (Departamento > Ciudad) is shown instead of a postal code field.
2. **Given** a shopper selects a Bolivian municipality, **When** the selection is submitted, **Then** the system resolves it to a DeliveryZone hash and Delivery Promise filters the assortment correctly.
3. **Given** a shopper on a UK storefront enters an alphanumeric postcode (`SW1A 2AA`), **When** the input is submitted, **Then** Delivery Promise validates, resolves, and computes availability correctly.
4. **Given** a multi-country merchant with bindings for Brazil and Colombia, **When** a shopper on the Colombian binding inputs a Departamento > Municipio selection, **Then** availability is computed using Colombian DeliveryZones — Brazilian zone logic is not applied.

### User Story 2 — External seller in Mexico pushes availability per Mexican DeliveryZone (Priority: P1)

A Mexican external seller sends product availability data via the External Seller Protocol, scoped to Mexican DeliveryZones. Delivery Promise indexes this availability correctly and surfaces it on the Mexican storefront.

**Acceptance Scenarios:**

1. **Given** an external seller in Mexico sends availability with Mexican DeliveryZone identifiers, **When** Delivery Promise processes the payload, **Then** the availability is indexed to the correct Mexican zones.
2. **Given** a merchant configures DeliveryZones for Mexico in Delivery Options, **When** a shopper inputs a Mexican ZIP on the storefront, **Then** the availability is filtered to the correct Mexican zone.

---

## Requirements *(mandatory)*

- **FR-001**: The location input component MUST accept any location format used in VTEX-operated countries — including numeric postal codes, alphanumeric postcodes, and cascading geographic dropdowns — and resolve each to the internal DeliveryZone hash used by Intelligent Search.
- **FR-002**: For countries without a functional postal code system (e.g., Bolivia), the input component MUST present a cascading geographic dropdown and MUST NOT require or display a postal code field.
- **FR-003**: The Delivery Options module MUST support DeliveryZone configuration per country, referencing the subzone breakdowns defined in the [country breakdown table](https://docs.google.com/spreadsheets/d/12WWZ0zTnKlGTD6j58UqImwqyxN6jaoePNp4TYs40Y2Y/edit?gid=0#gid=0).
- **FR-004**: The External Seller Protocol MUST accept `deliveryZone` identifiers valid for any supported country — not limited to Brazilian zones.
- **FR-005**: In multi-binding setups, availability computation MUST be scoped to the binding's country — cross-country zone resolution MUST NOT occur.
- **FR-006**: Delivery Promise availability results MUST be consistent with Checkout availability for the same location input and country — 0 cross-country routing mismatches.
- **FR-007**: Subzone breakdowns for all supported countries will be progressively made available in the platform. Until a country's subzones are natively supported, merchants requesting a new country breakdown MUST open a ticket to **Product Support**, which will redirect to the **Fulfillment team**.

---

## Success Criteria

- **SC-001**: Delivery Promise correctly resolves location inputs (postal code or geographic dropdown) for all countries in the supported list without validation errors.
- **SC-002**: 0 availability mismatches between Delivery Promise and Checkout attributable to incorrect country-scoped routing.
- **SC-003**: External sellers in non-BR countries can push availability via the External Seller Protocol using their country's DeliveryZone identifiers and have it indexed correctly.
