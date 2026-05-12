# Product Brief — Manual Location Input

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — Closed Beta |
| **Expected Release** | TBD |
| **Availability** | Closed Beta |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Manual Location Input

**Description:** With this release, shoppers will be able to enter their location once on the storefront and see only products that can actually be delivered to or picked up at their location — regardless of the country they're in. In countries with postal codes (Brazil, US, UK, Mexico, Spain…) shoppers type their code; in countries without postal codes or with unreliable coverage (Bolivia, Colombia, Peru, Ecuador, Paraguay…), shoppers use a cascading geographic dropdown. The component resolves any input format to the internal DeliveryZone hash used by Intelligent Search. This means shoppers stop discovering delivery restrictions at checkout, merchants eliminate cannotBeDelivered errors from location-aware sessions, and the assortment updates automatically whenever the shopper changes their location.

**Availability:** Closed Beta · H1 2025

**Target Audience:**
- Tier: All tiers
- Merchant Profile: Any VTEX merchant using Intelligent Search where product availability varies by location; especially relevant for merchants operating in multiple countries
- Persona: E-commerce Manager
- Pain: Without a location input, the storefront shows all products regardless of deliverability. Shoppers find out at checkout that items are unavailable, causing abandonment. In Aug/2024, 7.6% of Tier 1 cart simulations had at least one cannotBeDelivered item.
- Use Case: Provide a location input on the storefront — postal code field or geographic dropdown depending on the country — that scopes the entire navigation to products available for that location

---

## Input Methods by Country

> ⚠️ **Source of truth:** Pattern assignments are derived from [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x) `postalCodeFrom` values — the same library used by VTEX Checkout. address-form covers 63 countries; the component supports any store country present in that library. The countries listed below are documented as reference benchmarks and are not an exhaustive list.

The component selects the input method based on the merchant's configured store country. Five patterns cover all `postalCodeFrom` values defined in address-form:

| Pattern | `postalCodeFrom` | Reference countries |
|---------|-----------------|---------------------|
| **1 — ZIP numérico** | `POSTAL_CODE` (numeric) | BR, US, ES, PT, FR, IT, UY, AR |
| **2 — ZIP alfanumérico** | `POSTAL_CODE` (alphanumeric) | CA, UK |
| **3 — ZIP → Colonia (sequencial)** | `POSTAL_CODE` + API-loaded subdivision | MX |
| **4 — Cascade 2 níveis** | `TWO_LEVELS` | CL, CO, EC, VE, DO, PY |
| **5 — Cascade 3 níveis** | `THREE_LEVELS` | BO, PE |

### Pattern 1 — ZIP numérico
Free-text field; numeric only; downstream data resolves from the code.

| Country | Code name | Format | Example |
|---------|-----------|--------|---------|
| Brazil | CEP | 8-digit, hyphen after 5th (`99999-999`) | `01310-100` |
| United States | ZIP Code | 5-digit | `10001` |
| Spain | Código Postal | 5-digit | `28013` |
| Portugal | Código Postal | 7-digit (`9999-999`) | `1000-001` |
| France | Code Postal | 5-digit | `75001` |
| Italy | CAP | 5-digit | `00100` |
| Uruguay | Código Postal | 5-digit | `11000` |
| Argentina | Código Postal | **4-digit legacy only** — CPA (`C1406COR`) not supported by address-form | `1406` |

### Pattern 2 — ZIP alfanumérico
Same interaction as Pattern 1; letters and digits accepted; auto-uppercase required.

| Country | Code name | Format | Example |
|---------|-----------|--------|---------|
| Canada | Postal Code | 6-char, space after 3rd (`A1A 1A1`) | `M5V 3A8` |
| United Kingdom | Postcode | 6–8 char, no mask, auto-uppercase | `SW1A 2AA` |

### Pattern 3 — ZIP → Colonia (sequencial)
Shopper enters a 5-digit Código Postal; a Colonia dropdown loads from the API. Auto-selects if only one Colonia exists for that code. Mexico only.

| Country | Primary input | Secondary input | Example |
|---------|---------------|-----------------|---------|
| Mexico | Código Postal (5-digit numeric) | Colonia dropdown (API-loaded) | `06600` → Juárez |

### Pattern 4 — Cascade 2 níveis (`TWO_LEVELS`)
No typed postal code. Shopper selects two administrative levels; the postal code is derived internally. Both levels required before confirming.

| Country | Level 1 | Level 2 |
|---------|---------|---------|
| Chile | Región | Comuna |
| Colombia | Departamento | Municipio |
| Ecuador | Provincia | Cantón |
| Venezuela | Estado | Municipio |
| Dominican Republic | Provincia | Municipio |
| Paraguay | Departamento | Ciudad |

### Pattern 5 — Cascade 3 níveis (`THREE_LEVELS`)
Three levels required. Postal code derived internally from the full selection.

| Country | Level 1 | Level 2 | Level 3 |
|---------|---------|---------|---------|
| Bolivia | Departamento | Provincia | Ciudad |
| Peru | Departamento | Provincia | Distrito (UBIGEO) |

---

## Scope

**In scope:**
- Postal code input field for countries with standardized postal codes
- Geographic cascade dropdown for countries without postal codes or with unreliable coverage
- Postal code + subdivision selector for countries where secondary disambiguation is needed
- All input formats resolved to the internal DeliveryZone hash used by Intelligent Search
- Assortment filters to products with valid delivery routes or pickup availability for the resolved location
- Fallback: when no location is entered, show products from Seller 1, comprehensive sellers, and regular sellers
- Assortment updates automatically when the shopper changes their location
- Merchants with region-based pricing may configure location input as mandatory
- SKU-level availability: a product may be available for some SKUs but not others

**Not in scope:** Automatic location detection via browser geolocation (separate MMR), IP-based inference (separate MMR), delivery fee display, cross-border delivery.
