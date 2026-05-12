# Product Spec — Manual Location Input

## Clarifications

- **Q: What input method is used for each country?**
  A: Three patterns — (1) postal/ZIP code field for countries with standardized codes (BR, US, UK, ES, PT, FR, IT, UY, VE); (2) postal code + subdivision selector where the same code covers multiple zones (MX: Código Postal + Colonia; CL: postal code or Region > Comuna; AR: CPA or legacy 4-digit + Province > Localidad); (3) geographic cascade dropdown for countries without postal codes or with unreliable coverage (CO, PE, EC, PY, BO, DO). The component selects the correct pattern based on the merchant's store country. Postal code fields must not be shown in countries where pattern 3 applies.

- **Q: How does the component resolve different input formats to availability data?**
  A: All input — regardless of format — is resolved to the internal DeliveryZone hash used by Intelligent Search. For postal codes, the hash is derived directly from the code. For cascade dropdowns, the hash is derived from the selected administrative division combination. The resolver is the same layer used by Delivery Promise indexing.

- **Q: Where is the location input placed on the storefront?**
  A: Configurable by the merchant. Typical placements: header (persistent across pages), PLP, or a modal on first visit. The component is available for FastStore, Store Framework, and headless via API.

- **Q: What triggers the assortment update?**
  A: Any confirmed location submission — typing and pressing enter, clicking a confirmation button, selecting from postal code autocomplete, or completing the final level of a cascade dropdown. The assortment updates on confirmation, not on each keystroke or dropdown selection.

- **Q: What is the fallback when no location is provided?**
  A: Show all products from Seller 1, comprehensive sellers, and regular sellers — the same behavior as today without Delivery Promise.

- **Q: Does the entered location persist across pages?**
  A: Yes. Once entered, the resolved DeliveryZone persists for the session and is re-used across all pages until the shopper changes it.

- **Q: Can the merchant make location entry mandatory before browsing?**
  A: Yes. Merchants with region-based pricing may configure the location input as mandatory, gating the storefront until a location is provided.

- **Q: Is SKU-level availability supported?**
  A: Yes. A product may appear in the listing while only some of its SKUs are deliverable to the entered location.

- **Q: What happens if a cascade dropdown has no coverage data for a selected combination?**
  A: The system falls back to the standard assortment, the same as when no location is entered. The shopper is informed that delivery availability could not be determined for their selection.

- **Q: Are all cascade levels required for Bolivia?**
  A: Yes. Bolivia has no postal code system; the cascade (Departamento → Ciudad) is the only resolution path and both levels are required before the location is confirmed.

---

## Competitive Benchmark

How the leading ecommerce players in each country handle the location step — the standard shoppers already expect.

| Country | Leading benchmarks | How location input typically looks |
|---------|-------------------|------------------------------------|
| Brazil | Magazine Luiza, Casas Bahia, Americanas, Mercado Livre BR, O Boticário | CEP field upfront; street/city/state autofill once entered |
| United States | Amazon, Walmart, Target, Best Buy, Costco | ZIP code as primary localizer, often before login |
| Canada | Amazon CA, Shopify, Best Buy CA | Postal Code (A1A 1A1); alphanumeric; city auto-resolves |
| Spain | El Corte Inglés, Zara, PcComponentes, MediaMarkt ES, Carrefour ES | Código Postal entered; city/province auto-filled |
| Portugal | Worten, Fnac.pt, Continente, El Corte Inglés PT | Código Postal xxxx-xxx; locality auto-resolves |
| United Kingdom | Amazon UK, Tesco, ASOS, John Lewis, Argos, Sainsbury's | Postcode lookup → list of matching addresses to pick from |
| France | Amazon FR, Fnac, Cdiscount, Carrefour FR, Decathlon | Code Postal + Ville (commune autocomplete) |
| Italy | Amazon IT, Zalando IT, ePrice, Esselunga, Unieuro | CAP + Comune; Provincia inferred |
| Mexico | Mercado Libre MX, Liverpool, Walmart MX, Amazon MX, Coppel | Código Postal + manual Colonia selector from a dropdown |
| Chile | Falabella, Ripley, Paris.cl, Sodimac, Mercado Libre Chile | Region → Comuna dropdown; postal code rarely required |
| Argentina | Mercado Libre AR, Frávega, Garbarino, Musimundo, Easy | Legacy 4-digit postal code (VTEX Checkout uses 4-digit only; CPA format not supported) |
| Colombia | Falabella CO, Éxito, Mercado Libre CO, Alkosto, Linio | Departamento → Municipio cascading dropdown; postal code optional |
| Peru | Falabella PE, Ripley PE, Plaza Vea, Mercado Libre PE, Linio PE | Departamento → Provincia → Distrito (UBIGEO); postal code rarely used |
| Ecuador | De Prati, Mega Maxi, TIA, Mercado Libre EC | Provincia → Cantón dropdown; postal code optional |
| Uruguay | Tata, Disco, Tienda Inglesa, Mercado Libre UY | Departamento → Ciudad dropdown |
| Paraguay | Mercado Libre PY, Punto Farma, Casa Rica | Departamento → Distrito dropdown |
| Bolivia | Multicenter, Hipermaxi, Mercado Libre BO | Departamento → Ciudad (no postal code field) |
| Venezuela | Mercado Libre VE, Traki | Estado → Municipio dropdown, plus 4-digit code optional |
| Dominican Republic | PriceSmart DO, Jumbo DO, La Sirena, Mercado Libre DO | Provincia → Municipio dropdown; postal code optional |

> For full pattern reclassification rationale and updated country specs, see [Multi-Country Location Input Support](../004-multi-country-support/product-spec.md).

---

## Input Methods Reference

> ⚠️ **Source of truth:** Pattern assignments are aligned with [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x) `postalCodeFrom` values — the same library used by VTEX Checkout and `shipping-preview`. Countries classified as `TWO_LEVELS` or `THREE_LEVELS` in address-form use a cascade that **derives** the postal code internally; shoppers never type a free-form code in those countries.

| Country | Input pattern | `postalCodeFrom` | Code / levels | Character type | Example |
|---------|--------------|-----------------|---------------|----------------|---------|
| Brazil | Postal code | `POSTAL_CODE` | CEP — 8-digit numeric | Numeric | `01310-100` |
| United States | Postal code | `POSTAL_CODE` | ZIP — 5-digit numeric | Numeric | `10001` |
| Canada | Postal code | `POSTAL_CODE` | Postal Code — 6-char alphanumeric | **Alphanumeric** | `M5V 3A8` |
| United Kingdom | Postal code | `POSTAL_CODE` | Postcode — 6–8 char alphanumeric | **Alphanumeric** | `SW1A 2AA` |
| Spain | Postal code | `POSTAL_CODE` | Código Postal — 5-digit numeric | Numeric | `28013` |
| Portugal | Postal code | `POSTAL_CODE` | Código Postal — 7-digit (9999-999) | Numeric | `1000-001` |
| France | Postal code | `POSTAL_CODE` | Code Postal — 5-digit numeric | Numeric | `75001` |
| Italy | Postal code | `POSTAL_CODE` | CAP — 5-digit numeric | Numeric | `00100` |
| Uruguay | Postal code | `POSTAL_CODE` | 5-digit numeric | Numeric | `11000` |
| Argentina | Postal code | `POSTAL_CODE` | Legacy 4-digit numeric | Numeric | `1406` |
| Mexico | Postal code + subdivision | `POSTAL_CODE` | 5-digit + Colonia (API-loaded) | Numeric | `06600` → Colonia |
| Chile | Geographic cascade | `TWO_LEVELS` | Región → Comuna (postal derived) | Dropdown only | — |
| Colombia | Geographic cascade | `TWO_LEVELS` | Departamento → Municipio (postal derived) | Dropdown only | — |
| Ecuador | Geographic cascade | `TWO_LEVELS` | Provincia → Cantón (postal derived) | Dropdown only | — |
| Venezuela | Geographic cascade | `TWO_LEVELS` | Región → Ciudad (4-digit postal derived) | Dropdown only | — |
| Dominican Republic | Geographic cascade | `TWO_LEVELS` | Provincia → Municipio (postal derived) | Dropdown only | — |
| Paraguay | Geographic cascade | `TWO_LEVELS` | Departamento → Ciudad (4-digit postal derived) | Dropdown only | — |
| Peru | Geographic cascade | `THREE_LEVELS` | Departamento → Provincia → Distrito | Dropdown only | — |
| Bolivia | Geographic cascade | `THREE_LEVELS` | Departamento → Provincia → Ciudad | Dropdown only | — |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper enters ZIP and sees only deliverable products (Priority: P1)

A shopper on a Brazilian fashion retailer's PLP enters CEP `01310-100` (São Paulo). The page updates to show only products with valid delivery routes to that ZIP. Products stocked only at sellers with no coverage for that ZIP are hidden. Products from a local franchise store that were previously hidden now appear.

**Acceptance Scenarios:**

1. **Given** a shopper enters a valid postal code, **When** the input is confirmed, **Then** the PLP updates to show only products with a valid delivery route or pickup availability for that location.
2. **Given** a location is active, **When** the shopper navigates to another page, **Then** the location persists and the new page also filters by that location.
3. **Given** a shopper changes their location, **When** the new location is confirmed, **Then** the assortment refreshes to reflect the new location.
4. **Given** no location is entered, **When** the PLP renders, **Then** the fallback assortment (Seller 1 + comprehensive + regular sellers) is shown.
5. **Given** a product has multiple SKUs, **When** only some are available for the location, **Then** the product appears but only available SKUs are purchasable.

---

### User Story 2 — Shopper in Bolivia selects location via cascade dropdown (Priority: P1)

A shopper on a Bolivian merchant's storefront sees no postal code field. Instead, a three-level dropdown appears (matching `THREE_LEVELS` in address-form): Departamento, then Provincia, then Ciudad. The shopper selects "La Paz → Murillo → La Paz". The PLP updates to show products available for delivery to that city.

**Why this priority:** Bolivia is a mandatory cascade-only country — there is no postal code to fall back to. If the cascade doesn't work, location input is entirely unavailable for Bolivian storefronts.

**Acceptance Scenarios:**

1. **Given** the store country is Bolivia, **When** the location input renders, **Then** a Departamento → Provincia → Ciudad cascade dropdown (3 levels, matching `THREE_LEVELS` in address-form) is shown and no postal code field is displayed.
2. **Given** a shopper completes all three cascade levels, **When** the selection is confirmed, **Then** the input is resolved to a DeliveryZone hash and the assortment filters accordingly.
3. **Given** a shopper completes only the first or second cascade level, **When** they attempt to confirm, **Then** the confirmation is blocked until all three levels are selected.

---

### User Story 3 — Shopper in Mexico enters postal code and selects colonia (Priority: P1)

A shopper on a Mexican storefront enters Código Postal `06600`. Because multiple colonias share this code, a secondary dropdown appears with the available colonias. The shopper selects "Juárez". The combination is resolved to a DeliveryZone and the assortment updates.

**Acceptance Scenarios:**

1. **Given** the store country is Mexico, **When** a shopper enters a valid Código Postal, **Then** a Colonia dropdown appears with the colonias covered by that code.
2. **Given** a shopper selects a Colonia, **When** the selection is confirmed, **Then** the postal code + colonia combination is resolved to a DeliveryZone hash and the assortment filters.
3. **Given** a shopper enters a postal code with only one colonia, **When** the code is confirmed, **Then** the colonia is auto-selected and the location resolves immediately without requiring manual colonia selection.

---

### User Story 4 — Merchant requires location entry before browsing (Priority: P2)

A merchant with region-based pricing configures location input as mandatory. A new shopper visits the storefront and is prompted to enter their location — via postal code or cascade dropdown depending on the country — before seeing any products.

**Acceptance Scenarios:**

1. **Given** location is configured as mandatory, **When** a shopper visits without an active location, **Then** they are prompted to enter one before the product assortment is shown.
2. **Given** the mandatory prompt is shown, **When** the shopper's country uses a cascade dropdown, **Then** the prompt shows the cascade, not a postal code field.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render a postal code input field for any store country where `postalCodeFrom = POSTAL_CODE` in `vtex/address-form@4.x`. Character type (numeric vs. alphanumeric), mask, and validation regex are read from the country's address-form rules.
- **FR-002**: For Mexico (the only country with `POSTAL_CODE` + API-loaded Colonia subdivision), the system MUST render a postal code field followed by a Colonia dropdown loaded from the API after the code is entered.
- **FR-003**: The system MUST render a geographic cascade dropdown — and MUST NOT show a postal code field — for any store country where `postalCodeFrom = TWO_LEVELS` or `THREE_LEVELS`. The number of cascade levels and their labels are read from the country's address-form rules.
- **FR-004**: All input formats (postal code, postal code + subdivision, cascade dropdown) MUST be resolved to the internal DeliveryZone hash used by Intelligent Search before filtering is applied.
- **FR-005**: Upon confirmed location input, the system MUST filter PLP and search results to products with valid delivery or pickup availability for the resolved DeliveryZone.
- **FR-006**: The resolved location MUST persist across pages within the session until the shopper changes it.
- **FR-007**: The system MUST fall back to the standard assortment (Seller 1 + comprehensive + regular sellers) when no location is entered or when a cascade selection cannot be resolved.
- **FR-008**: Merchants MUST be able to configure location input as mandatory; the mandatory prompt MUST use the correct input method for the store country.
- **FR-009**: SKU-level availability MUST be respected: a product appears available only for its deliverable SKU variants at the resolved location.
- **FR-010**: The component MUST be available for FastStore, VTEX IO, and headless implementations.
- **FR-011**: For cascade dropdowns, all required levels MUST be selected before the location is confirmed; partial selections MUST be blocked.
- **FR-012**: For postal code + subdivision inputs, if only one subdivision exists for the entered code, the subdivision MUST be auto-selected and the location resolved without additional shopper interaction.

---

## Assumptions

- The geographic cascade data (department, province, city, municipality names and mappings to DeliveryZones) is maintained by the Fulfillment team and is available via the same DeliveryZone subzone reference used in Delivery Options.
- The component determines the input pattern from the merchant's configured store country; it does not attempt to detect country from the shopper's IP or browser locale.
- Cascade dropdown options are loaded on-demand per level selection, not all at once, to keep the initial load lightweight for countries with many municipalities.

---

## Success Criteria

- **SC-001**: `cannotBeDelivered` rate near 0% in sessions where the shopper entered a location.
- **SC-002**: Assortment updates on location change within the Delivery Promise indexing SLO — no full page reload required.
- **SC-003**: Cascade dropdown resolves to a valid DeliveryZone for 100% of completed selections where coverage data exists.
- **SC-004**: No postal code field is rendered in any storefront where the store country has `postalCodeFrom = TWO_LEVELS` or `THREE_LEVELS` in address-form.
