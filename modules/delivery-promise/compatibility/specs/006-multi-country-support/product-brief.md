# Product Brief — Multi-Country Support in Delivery Promise

| Field | Value |
|---|---|
| **Module** | delivery-promise |
| **Pillar** | Accurate availability |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Active — Open Beta |
| **Expected Release** | TBD |
| **Availability** | Open Beta |
| **Storefronts** | All Storefronts |
| **Mode** | B2C & B2B |


## MMR

**Title:** Delivery Promise — Multi-Country Support

**Description:** With this release, Delivery Promise will correctly compute and index delivery availability for merchants operating across multiple countries. This covers four layers: (1) the location input component accepts any format a shopper uses in their country — numeric CEPs, alphanumeric postcodes, or cascading geographic dropdowns — and converts it to the hash that filters Intelligent Search; (2) the Delivery Options module supports DeliveryZone configuration per country; (3) the External Seller Protocol accepts availability data scoped to country-specific DeliveryZones; and (4) a defined process exists for requesting subzone breakdowns for countries not yet covered.

**Availability:** Open Beta · H2 2025

**Target Audience:**
- Tier: All tiers operating in more than one country
- Persona: E-commerce Manager / Logistics Manager
- Pain: Merchants with multi-country storefronts cannot rely on Delivery Promise uniformly. ZIP code formats differ per country; some countries don't use ZIP codes at all (Bolivia uses Departamento > Ciudad); availability zone configurations are only defined for Brazil; and external sellers in non-BR countries have no protocol to communicate product availability. The result is incorrect or absent delivery availability on non-BR storefronts.
- Use Case: Enable Delivery Promise to operate end-to-end for any country where VTEX merchants have active storefronts and logistics configurations

---

## Scope

**In scope:**

**1 — Location input normalization**
The location input component must accept any format a shopper uses to express their location — numeric postal codes (CEP, ZIP, Código Postal), alphanumeric postcodes (UK, Argentina), and cascading geographic dropdowns (province > city, departamento > municipio, etc.) for countries where postal codes are not standard or don't exist. Any input is resolved to the internal DeliveryZone hash used by Intelligent Search to filter delivery availability. Countries where postal codes don't exist or aren't used in practice must be handled via geographic dropdown — postal code fields must not be shown or required in those cases.

**2 — DeliveryZones per country in Delivery Options**
The Delivery Options module must support DeliveryZone configuration per country, so merchants can define availability at the correct geographic granularity for each market. The table below shows supported countries and their subzone breakdowns:

| Country | Format | Example | Primary input method |
|---------|--------|---------|----------------------|
| Brazil | 8-digit numeric (CEP) | `01310-100` | CEP — mandatory, universal |
| Mexico | 5-digit numeric | `06600` | Código Postal + Colonia |
| Colombia | 6-digit numeric | `110231` | Departamento > Municipio dropdown |
| Chile | 7-digit numeric | `8320000` | Postal code or Region > Comuna |
| Argentina | 8-char alphanumeric (CPA) or legacy 4-digit | `C1406 COR` | Province > Localidad or old 4-digit code |
| United States | 5-digit numeric (ZIP) | `10001` | ZIP Code — universal |
| Spain | 5-digit numeric | `28013` | Código Postal |
| Portugal | 7-digit numeric | `1000-001` | Código Postal |
| UK | 6–8 char alphanumeric | `SW1A 2AA` | Postcode — universal |
| France | 5-digit numeric | `75001` | Code Postal |
| Italy | 5-digit numeric | `00100` | CAP |
| Peru | 5-digit numeric or UBIGEO | `15001` | Departamento > Provincia > Distrito |
| Ecuador | 6-digit numeric | `170515` | Provincia > Cantón dropdown |
| Uruguay | 5-digit numeric | `11000` | Departamento > Ciudad |
| Paraguay | 6-digit numeric | `001001` | Departamento > Distrito dropdown |
| Bolivia | No postal code | — | Departamento > Ciudad (required) |
| Venezuela | 4-digit numeric | `1010` | Estado > Municipio dropdown |
| Dominican Republic | 5-digit numeric | `10148` | Provincia > Municipio dropdown |

Brazil already has 106 delivery subzones and the US has 74. The full country subzone breakdown is available here: [DeliveryZone subzones by country](https://docs.google.com/spreadsheets/d/12WWZ0zTnKlGTD6j58UqImwqyxN6jaoePNp4TYs40Y2Y/edit?gid=0#gid=0).

> **Note on requesting new subzone breakdowns:** As Delivery Promise expands globally, subzone breakdowns for all supported countries will be progressively added to the platform — this request process is transitional. In the future, subzones for all countries will be available out of the box. Until then, merchants who need a subzone breakdown for a country not yet covered should open a ticket to **Product Support**, which will redirect to the **Fulfillment team**.

**3 — External Seller Protocol: availability per country DeliveryZone**
The External Seller Protocol must accept product availability data scoped to country-specific DeliveryZones, using the same country and subzone reference defined in section 2: [DeliveryZone subzones by country](https://docs.google.com/spreadsheets/d/12WWZ0zTnKlGTD6j58UqImwqyxN6jaoePNp4TYs40Y2Y/edit?gid=0#gid=0). This enables external sellers operating in non-BR countries to push their availability through the same protocol used in Brazil.

**Not in scope:** Cross-border delivery (shipping from one country to another), currency or tax localization (platform-level), carrier-specific integrations per country (Logistics team).
