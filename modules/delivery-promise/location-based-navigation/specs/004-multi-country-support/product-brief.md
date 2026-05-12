# Product Brief — Multi-Country Location Input Support

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

**Title:** Delivery Promise — Multi-Country Location Input Support

**Description:** Location input behavior varies significantly across the countries where VTEX operates. What feels natural to a Brazilian shopper (type CEP, city fills in automatically) is foreign to a Colombian shopper accustomed to selecting Departamento → Municipio from a dropdown. The component must adapt to the local convention in each country — not just technically, but in the way leading local ecommerce players have trained shoppers to expect it. The component supports any country present in [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x) (63 countries). This spec documents the five input patterns that cover all `postalCodeFrom` values defined in address-form, with competitive benchmarks for a reference set of markets.

**Availability:** Closed Beta · H1 2025

**Target Audience:**
- Tier: All tiers
- Merchant Profile: VTEX merchants operating in more than one country, or in countries where the standard VTEX location input does not match local ecommerce conventions
- Persona: E-commerce Manager, Platform Engineer
- Pain: The same input field (ZIP code) does not make sense in Bolivia, Colombia, or Ecuador. Merchants operating across Latin America and Europe need the location input to behave like local benchmarks — otherwise shoppers abandon the step or distrust the form.
- Use Case: Configure location input per store country so it matches local shopper expectations, validated against how the leading local ecommerce players handle the same step

---

## Scope

**In scope:**
- Country-specific input pattern selection driven by `postalCodeFrom` in `vtex/address-form@4.x` — covers all 63 countries in the library
- Five input patterns that exhaustively map all `postalCodeFrom` values (`POSTAL_CODE` numeric, `POSTAL_CODE` alphanumeric, `POSTAL_CODE` + Colonia, `TWO_LEVELS`, `THREE_LEVELS`)
- Competitive benchmark documentation for a reference set of VTEX markets
- Country-specific validation rules, format masks, and placeholder copy read from address-form rules

**Not in scope:** Address-level detail (street, number, complement), real-time address lookup APIs, cross-border checkout, payment localization.

---

## Input Pattern Classification

Five patterns exhaustively cover all `postalCodeFrom` values defined in [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x). Any store country present in the library maps to exactly one of these patterns. The reference countries listed are documented benchmarks, not an exhaustive scope limit:

| Pattern | `postalCodeFrom` | Reference countries |
|---------|-----------------|---------------------|
| **1 — ZIP numérico** | `POSTAL_CODE` (numeric) | BR, US, ES, PT, FR, IT, UY, AR |
| **2 — ZIP alfanumérico** | `POSTAL_CODE` (alphanumeric) | CA, UK |
| **3 — ZIP → Colonia (sequencial)** | `POSTAL_CODE` + API-loaded subdivision | MX |
| **4 — Cascade 2 níveis** | `TWO_LEVELS` | CL, CO, EC, VE, DO, PY |
| **5 — Cascade 3 níveis** | `THREE_LEVELS` | BO, PE |

### Pattern 1 — Postal / ZIP code field (numeric)
Free-text field for countries with a standardized numeric postal code. Shoppers enter the code; downstream data (city, state) resolves automatically.

### Pattern 2 — Postal / ZIP code field (alphanumeric)
Same interaction as Pattern 1, but the code contains both letters and digits. No auto-uppercase in Pattern 1 countries; auto-uppercase required here.

### Pattern 3 — Postal code + Colonia (sequential)
The shopper enters a 5-digit Código Postal; a Colonia dropdown loads from the API. If only one Colonia exists for that code, it auto-selects. Applies to Mexico only.

### Pattern 4 — Geographic cascade (2 níveis)
`postalCodeFrom = TWO_LEVELS`. No typed postal code. The shopper selects two administrative levels; the postal code is derived internally from the selection. Applies to CL, CO, EC, VE, DO, PY.

### Pattern 5 — Geographic cascade (3 níveis)
`postalCodeFrom = THREE_LEVELS`. Three levels required before confirmation. Applies to BO (Departamento → Provincia → Ciudad) and PE (Departamento → Provincia → Distrito).

---

## Country Reference — Pattern Assignment

Pattern assignments are aligned with `vtex/address-form@4.x` `postalCodeFrom`. See the [product spec](product-spec.md) for corrections where competitive research and Checkout implementation diverged.

| Country | `postalCodeFrom` | Pattern | Primary benchmark | Local convention / Checkout behavior |
|---------|-----------------|---------|-------------------|--------------------------------------|
| Brazil | `POSTAL_CODE` | 1 — Postal code | Magazine Luiza, Americanas | CEP 8-digit; street/city autofill |
| United States | `POSTAL_CODE` | 1 — Postal code | Amazon US, Walmart, Target | ZIP 5-digit; primary localizer |
| Canada | `POSTAL_CODE` | 1 — Postal code (alphanumeric) | Amazon CA, Shopify | A1A 1A1 format; city auto-resolves |
| Spain | `POSTAL_CODE` | 1 — Postal code | El Corte Inglés, Zara | 5-digit; city/province autofills |
| Portugal | `POSTAL_CODE` | 1 — Postal code | Worten, Fnac.pt, Continente | 9999-999; locality auto-resolves |
| France | `POSTAL_CODE` | 1 — Postal code | Amazon FR, Fnac | 5-digit; no commune selector in Checkout |
| Italy | `POSTAL_CODE` | 1 — Postal code | Amazon IT, Esselunga | 5-digit; no comune selector in Checkout |
| United Kingdom | `POSTAL_CODE` | 1 — Postal code (alphanumeric) | Amazon UK, ASOS, John Lewis | Postcode; no mask, auto-uppercase |
| Uruguay | `POSTAL_CODE` | 1 — Postal code | Tata, Disco, Tienda Inglesa | 5-digit; Checkout does not use cascade |
| Argentina | `POSTAL_CODE` | 1 — Postal code | Mercado Libre AR, Frávega | **4-digit legacy only** — CPA not supported |
| Mexico | `POSTAL_CODE` | 2 — Postal code + Colonia | Mercado Libre MX, Liverpool | 5-digit + Colonia loaded via API |
| Chile | `TWO_LEVELS` | 4 — Geographic cascade | Falabella, Ripley, Sodimac | Región → Comuna; postal derived internally |
| Colombia | `TWO_LEVELS` | 4 — Geographic cascade | Falabella CO, Éxito, Alkosto | Dept → Municipio; postal derived internally |
| Ecuador | `TWO_LEVELS` | 3 — Geographic cascade | De Prati, TIA, Mercado Libre EC | Provincia → Cantón; postal derived |
| Venezuela | `TWO_LEVELS` | 3 — Geographic cascade | Mercado Libre VE, Traki | Región → Ciudad; postal derived |
| Dominican Republic | `TWO_LEVELS` | 3 — Geographic cascade | PriceSmart DO, Jumbo DO | Provincia → Municipio; postal derived |
| Paraguay | `TWO_LEVELS` | 3 — Geographic cascade | Mercado Libre PY, Casa Rica | Dept → Ciudad; postal derived |
| Peru | `THREE_LEVELS` | 3 — Geographic cascade | Falabella PE, Plaza Vea, Ripley PE | Dept → Provincia → Distrito (UBIGEO) |
| Bolivia | `THREE_LEVELS` | 3 — Geographic cascade | Multicenter, Hipermaxi | Dept → Provincia → Ciudad (3 levels) |

---

## Key Insight: Checkout is the Source of Truth

Competitive research informed our initial pattern hypotheses, but [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x) is the authoritative source. Several hypotheses from competitive research were corrected after reviewing the actual `postalCodeFrom` values:

- **Chile** uses `TWO_LEVELS` — Región → Comuna cascade; the postal code is derived internally. Competitive patterns showing a 7-digit postal code reflect the full address form, not the delivery zone resolution step.
- **Colombia, Ecuador, Venezuela, Dominican Republic, Paraguay** use `TWO_LEVELS` — the cascade derives the postal code automatically. There is no typed postal code shortcut; the cascade IS how the location resolves.
- **Bolivia and Peru** use `THREE_LEVELS` (Departamento → Provincia → Ciudad/Distrito) — not 2 levels as some competitive patterns suggest.
- **Uruguay** uses `POSTAL_CODE` 5-digit in Checkout — competitive patterns showing cascades reflect the full address form (which includes locality fields), not just the location step.
- **France and Italy** use plain `POSTAL_CODE` in Checkout — no commune/comune secondary selector in the location step.
- **Argentina** uses legacy 4-digit postal code only — the CPA (C1406COR) alphanumeric format is not validated by address-form.
