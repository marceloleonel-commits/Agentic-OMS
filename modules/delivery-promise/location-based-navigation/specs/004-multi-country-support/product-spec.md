# Product Spec — Multi-Country Location Input Support

## Competitive Benchmark

The table below documents how leading local ecommerce players handle the location step in each VTEX-supported country. This data informs the input pattern assigned to each country and the UX conventions that shoppers already expect.

| Country | Leading ecommerce benchmarks | How the location step typically looks |
|---------|------------------------------|---------------------------------------|
| Brazil | Magazine Luiza, Casas Bahia, Americanas, Mercado Livre BR, O Boticário | CEP field upfront; once entered, street/city/state autofill |
| Mexico | Mercado Libre MX, Liverpool, Walmart MX, Amazon MX, Coppel | Código Postal + manual Colonia selector from a dropdown |
| Colombia | Falabella CO, Éxito, Mercado Libre CO, Alkosto, Linio | Departamento → Municipio cascading dropdown; postal code optional |
| Chile | Falabella, Ripley, Paris.cl, Sodimac, Mercado Libre Chile | Region → Comuna dropdown; postal code rarely required |
| Argentina | Mercado Libre AR, Frávega, Garbarino, Musimundo, Easy | CPA (e.g., C1406COR) or legacy 4-digit; Provincia → Localidad |
| United States | Amazon, Walmart, Target, Best Buy, Costco | ZIP code as the primary localizer (often before login) |
| Canada | Amazon CA, Shopify, Best Buy CA | Postal Code (e.g., M5V 3A8); alphanumeric A1A 1A1 format |
| Spain | El Corte Inglés, Zara, PcComponentes, MediaMarkt ES, Carrefour ES | Código Postal entered; city/province auto-filled |
| Portugal | Worten, Fnac.pt, Continente, El Corte Inglés PT | Código Postal (xxxx-xxx); locality auto-resolves |
| United Kingdom | Amazon UK, Tesco, ASOS, John Lewis, Argos, Sainsbury's | Postcode lookup → list of matching addresses to pick from |
| France | Amazon FR, Fnac, Cdiscount, Carrefour FR, Decathlon | Code Postal + Ville (commune autocomplete) |
| Italy | Amazon IT, Zalando IT, ePrice, Esselunga, Unieuro | CAP + Comune; Provincia inferred |
| Peru | Falabella PE, Ripley PE, Plaza Vea, Mercado Libre PE, Linio PE | Departamento → Provincia → Distrito (UBIGEO); postal code rarely used |
| Ecuador | De Prati, Mega Maxi, Tiendas Industriales Asociadas (TIA), Mercado Libre EC | Provincia → Cantón dropdown; postal code optional |
| Uruguay | Tata, Disco, Tienda Inglesa, Mercado Libre UY | Departamento → Ciudad dropdown |
| Paraguay | Mercado Libre PY, Punto Farma, Casa Rica | Departamento → Distrito dropdown |
| Bolivia | Multicenter, Hipermaxi, Mercado Libre BO | Departamento → Ciudad (no postal code field) |
| Venezuela | Mercado Libre VE, Traki | Estado → Municipio dropdown, plus 4-digit code |
| Dominican Republic | PriceSmart DO, Jumbo DO, La Sirena, Mercado Libre DO | Provincia → Municipio dropdown; postal code optional |

---

## Country Input Pattern Reference

Pattern assignments are aligned with [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x) `postalCodeFrom` values — the same library used by VTEX Checkout. The component supports any of the 63 countries in address-form; the table below documents a reference set of VTEX markets. Countries using `TWO_LEVELS` or `THREE_LEVELS` have the postal code **derived** from the cascade selection; shoppers never type a free-form code.

| Country | `postalCodeFrom` | Pattern | Code / levels | Character type | Example | Notes |
|---------|-----------------|---------|---------------|----------------|---------|-------|
| Brazil | `POSTAL_CODE` | Postal code | CEP — 8-digit numeric | Numeric | `01310-100` | Hyphen auto-inserted after digit 5 |
| United States | `POSTAL_CODE` | Postal code | ZIP — 5-digit numeric | Numeric | `10001` | |
| Canada | `POSTAL_CODE` | Postal code | Postal Code — 6-char | **Alphanumeric** | `M5V 3A8` | Format A1A 1A1; space auto-inserted after char 3 |
| Spain | `POSTAL_CODE` | Postal code | Código Postal — 5-digit | Numeric | `28013` | |
| Portugal | `POSTAL_CODE` | Postal code | Código Postal — 9999-999 | Numeric | `1000-001` | |
| United Kingdom | `POSTAL_CODE` | Postal code | Postcode — 6–8 char | **Alphanumeric** | `SW1A 2AA` | No mask; auto-uppercase |
| France | `POSTAL_CODE` | Postal code | Code Postal — 5-digit | Numeric | `75001` | No commune selector in Checkout |
| Italy | `POSTAL_CODE` | Postal code | CAP — 5-digit | Numeric | `00100` | No comune selector in Checkout |
| Uruguay | `POSTAL_CODE` | Postal code | 5-digit numeric | Numeric | `11000` | No cascade; postal code is the input |
| Argentina | `POSTAL_CODE` | Postal code | Legacy 4-digit numeric | Numeric | `1406` | CPA (C1406COR) is NOT supported by address-form |
| Mexico | `POSTAL_CODE` | Postal code + Colonia | 5-digit + Colonia (API-loaded) | Numeric | `06600` → Juárez | Colonia list loaded from API after code entry |
| Chile | `TWO_LEVELS` | Geographic cascade | Región → Comuna | Dropdown only | — | Postal code derived from selection, not typed |
| Colombia | `TWO_LEVELS` | Geographic cascade | Departamento → Municipio | Dropdown only | — | Postal code derived from selection, not typed |
| Ecuador | `TWO_LEVELS` | Geographic cascade | Provincia → Cantón | Dropdown only | — | Postal code derived from selection |
| Venezuela | `TWO_LEVELS` | Geographic cascade | Región → Ciudad | Dropdown only | — | 4-digit postal derived from selection |
| Dominican Republic | `TWO_LEVELS` | Geographic cascade | Provincia → Municipio | Dropdown only | — | Postal code derived from selection |
| Paraguay | `TWO_LEVELS` | Geographic cascade | Departamento → Ciudad | Dropdown only | — | 4-digit postal derived from selection |
| Peru | `THREE_LEVELS` | Geographic cascade | Departamento → Provincia → Distrito | Dropdown only | — | UBIGEO resolved internally |
| Bolivia | `THREE_LEVELS` | Geographic cascade | Departamento → Provincia → Ciudad | Dropdown only | — | 3 levels required; no postal code typed |

---

## Corrections vs. Competitive-Research Draft

The following entries were updated after validating against [`vtex/address-form@4.x`](https://github.com/vtex/address-form/tree/4.x):

| Country | Competitive research said | address-form 4.x says | Corrected to |
|---------|--------------------------|----------------------|--------------|
| Chile | Postal code (7-digit) + optional Region → Comuna | `TWO_LEVELS` — cascade only; postal derived | Cascade only (Región → Comuna); no typed postal code |
| Argentina | CPA `C1406COR` (8-char alphanumeric) or 4-digit | `POSTAL_CODE`, mask `9999`, 4-digit only | Pattern 1 — 4-digit numeric only; CPA not supported |
| France | Postal + commune dropdown (Pattern 2) | `POSTAL_CODE`, no commune selector | Pattern 1 — 5-digit postal code only |
| Italy | Postal + comune dropdown (Pattern 2) | `POSTAL_CODE`, no comune selector | Pattern 1 — 5-digit postal code only |
| Uruguay | Cascade Departamento → Ciudad (Pattern 3) | `POSTAL_CODE`, 5-digit numeric | Pattern 1 — 5-digit postal code |
| Bolivia | 2-level cascade (Dept → Ciudad) | `THREE_LEVELS` (Dept → Provincia → Ciudad) | 3-level cascade |
| Colombia | Cascade + optional typed postal code | `TWO_LEVELS` — postal derived from cascade | Cascade only; postal derived automatically, never typed |
| Ecuador | Cascade + optional typed postal code | `TWO_LEVELS` — postal derived from cascade | Cascade only; postal derived automatically |
| Venezuela | Cascade + optional typed postal code | `TWO_LEVELS` — postal derived from cascade | Cascade only; postal derived automatically |
| Dominican Republic | Cascade + optional typed postal code | `TWO_LEVELS` — postal derived from cascade | Cascade only; postal derived automatically |
| Paraguay | Cascade + optional typed postal code | `TWO_LEVELS` — postal derived from cascade | Cascade only; postal derived automatically |

---

## Clarifications

- **Q: Why does address-form have a postal code regex for TWO_LEVELS countries (Colombia, Ecuador, etc.) if shoppers never type it?**
  A: The regex validates the postal code value that is **auto-populated** from the cascade selection data (via `secondLevelPostalCodes` transform). It's used internally for validation, not for shopper input.

- **Q: Argentina's CPA format (C1406COR) is advertised by Correio Argentina — why is it not supported?**
  A: `address-form@4.x` only implements the legacy 4-digit mask. The `forgottenURL` in ARG.js links to Correio Argentina's CPA lookup page as a helper for shoppers who don't know their code, but validation remains `^([\d]{4})$`. Delivery Promise must match this constraint.

- **Q: Does Bolivia's third level (Ciudad/neighborhood) work the same as Peru's Distrito?**
  A: Yes — both use `THREE_LEVELS` with `postalCodeLevels: ['state', 'city', 'neighborhood']`. In Bolivia the labels are Departamento (state) → Provincia (city) → Ciudad (neighborhood); in Peru they are Departamento → Provincia → Distrito.

- **Q: Chile's Falabella and Ripley show a 7-digit postal code field — why is Chile classified as TWO_LEVELS cascade?**
  A: The 7-digit postal code shown by some Chilean retailers is surfaced in the *full address form* (street, number, complement) — not in the delivery zone resolution step. `address-form@4.x` CHL.js uses `postalCodeFrom: TWO_LEVELS`, which means the postal code is derived from the Región → Comuna selection. The delivery promise component must follow `address-form` behavior: cascade only, no typed postal code.

- **Q: Is the cascade-derived postal code for TWO_LEVELS countries stable enough to use as a DeliveryZone key?**
  A: Yes. The postal code values in the cascade lookup tables are the same identifiers used throughout VTEX's fulfillment and logistics stack.

---

## Functional Requirements

- **FR-001**: For any store country where `postalCodeFrom = TWO_LEVELS`, the component MUST render a 2-level geographic cascade. No typed postal code field. The postal code is derived from the cascade selection and resolved internally.
- **FR-002**: For any store country where `postalCodeFrom = THREE_LEVELS`, the component MUST render a 3-level cascade. All three levels are required before the location is confirmed.
- **FR-003**: For any store country where `postalCodeFrom = POSTAL_CODE`, the component MUST render a postal code input. Character type (numeric vs. alphanumeric), mask, max length, and validation regex are read from that country's address-form rules.
- **FR-004**: For Argentina specifically, the 4-digit numeric mask (`^[\d]{4}$`) MUST be enforced. The alphanumeric CPA format (C1406COR) MUST NOT be accepted — it is not implemented in address-form.
- **FR-005**: The input pattern MUST be determined solely from the store's configured country via `vtex/address-form` `postalCodeFrom`. No hardcoded per-country logic outside of address-form rules.
- **FR-006**: All input patterns across all store countries MUST resolve to the internal DeliveryZone hash before availability filtering is applied.

---

## Success Criteria

- **SC-001**: No postal code field is rendered for any store country where `postalCodeFrom = TWO_LEVELS` or `THREE_LEVELS`.
- **SC-002**: Countries with `THREE_LEVELS` render 3-level cascades; countries with `TWO_LEVELS` render 2-level cascades.
- **SC-003**: Argentina only accepts 4-digit numeric input — alphanumeric CPA format is rejected.
- **SC-004**: Any store country where `postalCodeFrom = POSTAL_CODE` renders a postal code input field (not a cascade).
- **SC-005**: All store countries supported by `vtex/address-form@4.x` resolve to a valid DeliveryZone for 100% of completed inputs where coverage data exists.
