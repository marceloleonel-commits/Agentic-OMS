# Product Brief — Shipping Simulator: Shoreline Redesign with Logistics Visibility

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carol Tourinho |
| **Eng Champion** | TBD |
| **Status** | Under definition |
| **Expected Release** | TBD |
| **Availability** | TBD |
| **Mode** | B2C & B2B |

---

## MMR

**Title:** Shipping Simulator — Shoreline Redesign with Logistics Visibility

**Description:** With this release, logistics operators and store administrators will be able to distinguish between SKU variants in simulation, run simulations scoped to a specific seller, see freight prices in the correct local currency, and understand why carriers were excluded from a simulation result — capabilities that do not exist in the current experience. These improvements are delivered through a redesigned interface built on Shoreline, replacing the legacy simulator without changing where it lives in the Admin.

**Availability:** TBD

**Target Audience:**
- **Tier:** All tiers
- **Merchant Profile:** Omnichannel and marketplace retailers; multi-seller accounts; multi-country operations
- **Persona:** Logistics Administrator / Store Operator
- **Pain:** The current simulator has a poor product search (SKU variants with identical names cannot be distinguished), does not support seller-level simulation, shows the wrong currency for multi-country accounts (KI 514551), and provides no visibility into why carriers were rejected or why shipping options are limited
- **Use Case:** Validate shipping configuration before go-live, diagnose freight issues, test new shipping policies, confirm seller × sales channel setup

---

## Feature Delta

The current Shipping Simulator (`/admin/logistics#/freight-simulation`) is a minimal legacy form that has not been updated to reflect the current complexity of VTEX logistics configurations. It:

- Requires manual country input, even though country is already encoded in the sales channel
- Displays all SKU variants of the same product with identical names, making it impossible to distinguish between variants when a product has multiple SKUs
- Does not allow selecting a seller — the simulation always runs against the main account
- Shows the default currency regardless of the selected sales channel's configured currency (KI 514551)
- Returns empty metadata fields (postal code range, weight range) for kit SKUs (KI 1382356)
- Provides no explanation of why shipping options are unavailable or why carriers were rejected

This MMR replaces the current simulator with a Shoreline-based experience that resolves all of the above, introduces seller-level simulation with sales channel validation, and surfaces logistics diagnostics in a structured way.

---

## Scope

### Form — Input redesign
- **Sales Channel** is the first field; selection auto-resolves:
  - `CountryCode` (no manual country input required)
  - `CurrencyCode` and `CurrencySymbol` (used to format freight prices in results — fixes KI 514551)
  - Source: `GET /api/catalog_system/pub/saleschannel/{salesChannelId}`
- **Seller** is a separate field, populated from `GET /seller-register/pvt/sellers`
  - Validated against sales channel at simulation time via `GET /seller-register/pvt/sellers/{sellerId}/sales-channel/mapping`
  - If seller is not associated with the selected sales channel, a clear error is shown on "Simulate" click
- **SKU search** supports:
  - Direct input by SKU ID
  - Search by product name, SKU name, EAN, or reference code — with explicit match type displayed (similar to Catalog search UX)
  - Each result row shows differentiating attributes: SKU ID, variant name, EAN, reference code — resolving the indistinguishable variants issue
- **ZIP / Postal code** input, with formatting per country
- **Quantity** and optional **Price** (relevant for shipping policies with min/max price rules)
- **Multi-item support**: operator can add multiple SKUs to a single simulation, matching the current simulator behavior; option to simulate items individually (useful when SKUs have incompatible logistics configurations)

### Simulation results
- Freight options with correct local currency formatting (fixes KI 514551)
- Kit SKU metadata fields (postal code range, weight range) rendered correctly (fixes KI 1382356)
- Rejected carriers listed with human-readable rejection reasons (location, weight, dimensions, business hours, etc.)
- Inventory status per item (in stock / out of stock / partially available)
- Route analysis summary (warehouse → dock → carrier connectivity)
- Operational capacity constraints shown when applicable

### Prototype
- Admin-like UI built with Shoreline components and Raccoon layout
- PT-BR dataset: **Drogarias Pacheco** (main account) with sellers **Drogarias Pacheco Botafogo** and **Drogarias Pacheco Barra**
- EN dataset: **Road Runners** (main account) with sellers **Road Runner San Diego** and **Road Runner Los Angeles**
- Includes a mocked kit SKU scenario with correctly populated postal code range and weight range fields, illustrating what a fixed experience would look like (kit freight is calculated from the combined weight and dimensions of all components, per VTEX documentation)
- **Note:** The prototype includes a client/language toggle (PT-BR / EN) as a demo-only mechanism to illustrate different account contexts within a single file. This is not a product feature — in the real Admin, language does not switch per-account; in practice, each client would be a separate VTEX account.

### Not in scope
- Real-time checkout simulation
- Saving or exporting simulation results
- Agentic UI track (separate development path)

---

## Known Issues Addressed

| KI | Description | Resolution |
|---|---|---|
| **514551** | Simulator shows default currency instead of local currency | Currency auto-resolved from sales channel via API |

> KI 1382356 (empty postal code range and weight range for kit SKUs) is not committed as a fix in this MMR. The prototype includes a mocked kit scenario to illustrate the desired end state; whether a fix is feasible depends on engineering investigation into whether the issue is frontend-only or requires backend changes.
