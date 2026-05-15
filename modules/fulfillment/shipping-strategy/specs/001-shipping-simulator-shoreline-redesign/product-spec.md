# Product Spec — Shipping Simulator: Shoreline Redesign with Logistics Visibility

## Clarifications

- Q: Should the sales channel dropdown show only active sales channels? → A: Yes. Only active sales channels should be listed.
- Q: What happens if the account has no sellers configured (main account only)? → A: The Seller field is hidden or shows "Main account" as the only pre-selected option. Simulation proceeds without seller selection.
- Q: Is seller validation (sales channel mapping) a blocking error or a warning? → A: Blocking. The simulation cannot proceed until a valid seller × sales channel combination is selected.
- Q: Should the ZIP code field enforce country-specific formatting? → A: Yes. Format is derived from the `CountryCode` returned by the sales channel API (e.g., 8 digits for BRA, 5-digit for USA).
- Q: Can the user simulate without a price? → A: Yes, price is optional. However, if the selected shipping policy has min/max price rules, simulation results should note that price was not provided and results may be incomplete.
- Q: Should simulation results persist after navigating away? → A: No. Results are session-scoped. This is not in scope for this MMR.
- Q: Does the kit metadata fix (KI 1382356) require backend changes? → A: To be confirmed by engineering. The spec assumes the UI renders whatever the API returns; if the API returns empty fields for kits, a backend fix may be required independently.
- Q: Is multi-item simulation in scope? → A: Yes. The operator can add multiple SKUs to a single simulation, matching the current simulator behavior. The "simulate items individually" option is also preserved for cases where SKUs have incompatible logistics configurations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Operator simulates shipping for a specific SKU variant (Priority: P1)

A logistics operator at Drogarias Pacheco needs to verify which carriers are available for a specific ring variant (size 17, yellow gold) before a campaign goes live. They open the Shipping Simulator, select the Ecommerce sales channel, select the main account, search for the product by name, and identify the correct SKU by its variant attributes. They enter the destination ZIP code and click Simulate.

**Why this priority:** This is the core use case of the simulator. When a product has multiple SKU variants sharing the same display name, the current experience makes it impossible to know which SKU is being simulated.

**Independent Test:** Open the simulator, search for a product with multiple SKUs sharing the same name. Confirm: each result row shows distinct identifying attributes (SKU ID, variant name, EAN, reference code). Select a specific SKU, complete remaining fields, simulate. Confirm results are returned.

**Acceptance Scenarios:**

1. **Given** the operator types a product name in the SKU field, **When** results appear, **Then** each result row shows: SKU ID, variant name or attributes, EAN, and reference code — no two rows look identical for different SKUs of the same product.
2. **Given** the operator types a numeric value in the SKU field, **When** results appear, **Then** the system matches against SKU ID, EAN, and reference code simultaneously.
3. **Given** the operator selects a SKU, **When** they complete all required fields and click Simulate, **Then** a results panel appears below or alongside the form with available freight options.
4. **Given** the operator selects a kit SKU, **When** results are returned, **Then** the results panel displays the kit components breakdown and the combined weight used for the simulation — consistent with how VTEX calculates kit freight (combined weight and dimensions of all components, single carrier).

---

### User Story 2 — Operator simulates for a specific seller (Priority: P1)

A logistics manager at Drogarias Pacheco needs to verify if Drogarias Pacheco Botafogo can ship a product to a ZIP code in the North Zone of Rio de Janeiro. They select the sales channel, then select the seller "Drogarias Pacheco Botafogo" and proceed with simulation.

**Why this priority:** Without seller-level simulation, multi-seller accounts have no way to validate per-seller shipping configurations from the admin.

**Acceptance Scenarios:**

1. **Given** the operator selects a sales channel, **When** they open the Seller dropdown, **Then** only sellers associated with the account are listed.
2. **Given** the operator selects a seller that is not associated with the selected sales channel, **When** they click Simulate, **Then** a clear error message is shown: "[Seller name] is not associated with the [Sales Channel name] sales channel. Please select a different seller or change the sales channel." Simulation does not proceed.
3. **Given** the operator selects a valid seller × sales channel combination, **When** they click Simulate, **Then** the simulation runs in the context of that seller.
4. **Given** the account has no sellers configured, **When** the operator opens the simulator, **Then** the Seller field is not shown and simulation runs against the main account.

---

### User Story 3 — Operator sees correct local currency in results (Priority: P1)

A logistics manager at Road Runners (a US-based store) selects the "US Ecommerce" sales channel and runs a simulation. All freight prices in the results are displayed in USD with the correct symbol ($), not in the account's default currency.

**Why this priority:** This is an existing known issue (KI 514551) that directly erodes trust in simulation results for multi-currency accounts.

**Acceptance Scenarios:**

1. **Given** the operator selects a sales channel with `CurrencyCode: USD` and `CurrencySymbol: $`, **When** simulation results are displayed, **Then** all freight prices use `$` and USD formatting.
2. **Given** the operator selects a sales channel with `CurrencyCode: BRL` and `CurrencySymbol: R$`, **When** simulation results are displayed, **Then** all freight prices use `R$` and BRL formatting.
3. **Given** the operator switches sales channel after a simulation, **When** they run a new simulation, **Then** the currency in results reflects the newly selected sales channel.

---

### User Story 4 — Operator understands why carriers were rejected (Priority: P2)

After running a simulation that returns only one carrier option, a logistics operator wants to understand why the other configured carriers were not offered. The results panel shows a "Carriers not available" section with human-readable reasons per carrier.

**Why this priority:** This is a major diagnostic gap in the current simulator. Operators currently have no way to understand rejection reasons without inspecting raw API responses.

**Acceptance Scenarios:**

1. **Given** the simulation returns fewer carriers than configured, **When** the operator views results, **Then** a "Carriers not available" section lists each rejected carrier with a human-readable reason (e.g., "Does not deliver to this ZIP code", "Item weight exceeds carrier limit", "Outside business hours").
2. **Given** the simulation returns no carriers at all, **When** the operator views results, **Then** a clear message explains the root cause using the decision tree: out of stock → no route → location not served → capacity exceeded.
3. **Given** the simulation returns carriers with capacity-related delays, **When** the operator views results, **Then** the delay is shown alongside the estimated delivery date with an explanation.

---

### User Story 5 — Operator switches interface language (Priority: P2 — Prototype only)

A logistics manager at Road Runners prefers to use the simulator in English. They click the language toggle in the top-right corner and the entire interface — labels, placeholders, error messages, results, and example data — switches to English.

**Acceptance Scenarios:**

1. **Given** the prototype is loaded in PT-BR mode, **When** the operator clicks the EN toggle, **Then** all UI text switches to English including: field labels, button text, error messages, placeholder text, result labels.
2. **Given** EN mode is active, **When** the Seller dropdown is opened, **Then** sellers shown are Road Runner San Diego and Road Runner Los Angeles.
3. **Given** PT-BR mode is active, **When** the Seller dropdown is opened, **Then** sellers shown are Drogarias Pacheco Botafogo and Drogarias Pacheco Barra.

---

---

## Requirements *(mandatory)*

### Functional Requirements

**Form**
- **FR-001**: The system MUST display Sales Channel as the first input field, populated from the active sales channels in the account.
- **FR-002**: Upon Sales Channel selection, the system MUST automatically resolve and store `CountryCode`, `CurrencyCode`, and `CurrencySymbol` from `GET /api/catalog_system/pub/saleschannel/{salesChannelId}`. These fields MUST NOT be shown as manual inputs.
- **FR-003**: The system MUST display a Seller field, populated from `GET /seller-register/pvt/sellers`. If no sellers exist beyond the main account, this field MUST be hidden.
- **FR-004**: The system MUST validate the seller × sales channel combination when the user clicks Simulate, using `GET /seller-register/pvt/sellers/{sellerId}/sales-channel/mapping`. If invalid, simulation MUST be blocked with a specific error message.
- **FR-005**: The SKU search field MUST support lookup by: SKU ID (exact), product name (contains), SKU name (contains), EAN (exact), and reference code (exact).
- **FR-006**: Each SKU result row MUST display: SKU ID, variant name or attributes, EAN, and reference code — sufficient to distinguish between variants of the same product.
- **FR-007**: The ZIP/postal code field MUST apply formatting rules based on the `CountryCode` resolved from the selected sales channel.
- **FR-008**: Price input MUST be optional and displayed as a field in the form. If omitted and the shipping policy has price-range rules, the results MUST include a contextual note.
- **FR-008b**: The system MUST allow adding multiple SKUs to a single simulation. A "simulate items individually" toggle MUST be available, consistent with the current simulator behavior.

**Results**
- **FR-009**: All monetary values in results MUST be formatted using the `CurrencyCode` and `CurrencySymbol` resolved from the selected sales channel (fixes KI 514551).
- **FR-010**: When a kit SKU is simulated, the results panel SHOULD display a kit components breakdown with the combined weight used for simulation. Postal code range and weight range fields will render whatever the API returns; resolving empty values for kit SKUs (KI 1382356) is subject to engineering investigation and is not a committed requirement for this MMR.
- **FR-011**: Results MUST include a "Carriers not available" section listing each rejected carrier with a human-readable rejection reason mapped from the API reason codes (1–13).
- **FR-012**: Results MUST show inventory status per item: in stock, out of stock, or partially available.
- **FR-013**: Results MUST show a route analysis summary when no freight options are available, explaining the root cause (stock → route → location → capacity).
- **FR-014**: Operational capacity constraints MUST be shown inline with the affected delivery option when `operationalCapacity.status` is `dock_time_increased` or `removed_from_quotation`.

**Agentic UI track only**
- **FR-019**: The agentic UI MUST allow the operator to request carrier activation or deactivation through natural language (e.g., "activate this carrier", "ativar a Azul Cargo").
- **FR-020**: Before executing a carrier activation or deactivation, the agent MUST display: the carrier name, the connected shipping policy, and all docks linked to that policy. Execution MUST be blocked until the operator provides explicit confirmation.
- **FR-021**: The agent MUST never activate or deactivate a carrier without a clear, affirmative confirmation message from the operator in the same conversation turn.

**Recent simulations**
- Fully specified in [`003-shipping-simulator-recent-simulations`](../../003-shipping-simulator-recent-simulations/product-spec.md). Requirements for this feature are not duplicated here.


**Prototype-specific**
- **FR-015**: The prototype MUST include a language toggle (PT-BR / EN) in the top-right corner of the interface.
- **FR-016**: In PT-BR mode, all UI text, labels, and example data MUST be in Brazilian Portuguese.
- **FR-017**: In EN mode, all UI text, labels, and example data MUST be in English.
- **FR-018**: The prototype MUST use Shoreline components and a Raccoon-compatible admin layout — it must visually resemble a real VTEX Admin page.

---

## API Mapping

This section maps each UI area to the specific API calls required. All calls are made from the frontend unless otherwise noted.

### Form — Input resolution

| Field / Behavior | API | Method | Key response fields |
|---|---|---|---|
| Sales channel list | `/api/catalog_system/pub/saleschannel/list` | GET | `Id`, `Name`, `IsActive` |
| Country, currency, symbol auto-resolution | `/api/catalog_system/pub/saleschannel/{salesChannelId}` | GET | `CountryCode`, `CurrencyCode`, `CurrencySymbol` |
| Seller list | `/seller-register/pvt/sellers` | GET | `id`, `name`, `isActive` |
| Seller × sales channel validation | `/seller-register/pvt/sellers/{sellerId}/sales-channel/mapping` | GET | Array of mapped sales channel IDs |
| SKU search by name / ID / EAN / ref | `/api/catalog_system/pub/products/search?fq=skuId:{id}` or `?ft={query}` | GET | `productId`, `skuId`, `nameComplete`, `ean`, `referenceId`, `variations` |

### Simulation

| Feature | API | Method | Notes |
|---|---|---|---|
| Run simulation | `/api/logistics/pvt/shipping/calculate` | POST | Core simulation endpoint. Requires: `items[]` (skuId, quantity, price, dimensions), `destination.zipCode`, `destination.country`, `salesChannel`, `sellerId` |

**Request body reference:**
```json
{
  "items": [
    { "id": "skuId", "quantity": 1, "price": 1000, "dimension": { "weight": 100, "height": 10, "width": 10, "length": 10 } }
  ],
  "destination": { "zipCode": "22041-001", "country": "BRA" },
  "salesChannel": "1",
  "sellerId": "drogariaspacheco"
}
```

### Results — Delivery options

| Result field | Source | API field |
|---|---|---|
| Carrier name | Simulation response | `logisticsInfo[n].slas[n].name` |
| Freight price (formatted with correct currency) | Simulation response + SC API | `slas[n].price` · currency from `CurrencyCode` / `CurrencySymbol` |
| Estimated delivery (days) | Simulation response | `slas[n].shippingEstimate` |
| Transit time | Simulation response | `slas[n].transitTime` |
| Processing time (warehouse handling) | Simulation response | `slas[n].pickupStoreInfo` or `slas[n].deliveryWindow` |
| Works on weekends | Simulation response | `slas[n].availableDeliveryWindows` — check for Saturday/Sunday slots |
| Warehouse → dock → carrier route | Simulation response | `logisticsInfo[n].warehouseId`, `logisticsInfo[n].dockId`, `slas[n].deliveryChannel` |

### Results — Rejected carriers

| Result field | Source | API field |
|---|---|---|
| Rejected carrier name | Simulation response | `logisticsInfo[n].carriersNotChosenList[n].name` |
| Rejection reason (human-readable) | Simulation response | `carriersNotChosenList[n].reasonCode` → mapped to string (codes 1–13) |
| Carrier active/inactive status | Simulation response | `carriersNotChosenList[n].active` |

> No additional API call required. Reason codes are already present in the simulation response. This is a frontend-only display change.

### Results — Inventory status

| Result field | Source | API | Notes |
|---|---|---|---|
| Stock availability per item | Inventory API | `GET /api/logistics/pvt/inventory/items/{skuId}/warehouses` | `totalQuantity` per warehouse. Only needed to distinguish "no stock" from "no coverage" in error states. Not required if the simulation response already surfaces `inventoryDetails`. |

### Results — Error states

See [`api-error-diagnostics.md`](./api-error-diagnostics.md) for the full decision tree. Summary:

| Error | Data source | Additional call needed? |
|---|---|---|
| ZIP outside coverage | Reason codes in simulation response (code 6 or 7) | No |
| All carriers excluded (weight/dims) | Reason codes in simulation response (codes 1–5) | No |
| No stock in seller's warehouses | `GET /api/logistics/pvt/inventory/items/{skuId}/warehouses` | Yes — 1 call per SKU |
| Logistics configuration error | Multi-API traversal (docks, carriers, policies) | Out of scope for this MMR |

### Results — Store pickup

| Result field | Source | API field |
|---|---|---|
| Pickup point name | Simulation response | `logisticsInfo[n].slas[n].pickupStoreInfo.friendlyName` |
| Pickup point address | Simulation response | `slas[n].pickupStoreInfo.address` |
| Pickup SLA / estimated time | Simulation response | `slas[n].shippingEstimate` (where `deliveryChannel = "pickup-in-point"`) |
| Pickup price | Simulation response | `slas[n].price` |

---

## Assumptions

- The `GET /api/catalog_system/pub/saleschannel/{salesChannelId}` endpoint reliably returns `CurrencyCode`, `CurrencySymbol`, and `CountryCode` for all active sales channels.
- The `GET /seller-register/pvt/sellers/{sellerId}/sales-channel/mapping` endpoint is available and returns the correct sales channel associations for a seller.
- The existing simulation API (`/api/logistics/pvt/shipping/estimate`) returns the `freightSimulatedForAi` structure with `carriersNotChosenList`, `inventoryDetails`, `routeAnalysis`, and `operationalCapacity` as documented.
- Kit metadata fields (postal code range, weight range) require investigation to determine if the fix is purely frontend (rendering) or requires a backend change. Engineering input needed.
- The prototype uses mocked data and does not make real API calls.

---

## Success Criteria *(mandatory)*

- **SC-001**: An operator with a product that has 5+ SKU variants can identify and select the correct variant in under 30 seconds.
- **SC-002**: An operator simulating for a seller not associated with the selected sales channel receives a clear, actionable error message before any API call is made.
- **SC-003**: 100% of freight prices displayed in simulation results use the currency configured for the selected sales channel — zero instances of default currency display.
- **SC-004**: When a simulation returns no available carriers, the operator can identify the root cause (stock, route, location, or capacity) from the results panel without consulting support.
- **SC-005**: The prototype passes a visual review as "admin-like" — a VTEX team member unfamiliar with the project should not be able to distinguish it from a real admin screen at first glance.
