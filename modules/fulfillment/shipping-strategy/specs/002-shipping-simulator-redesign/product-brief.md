# Product Brief — Shipping Simulator: Shoreline Redesign with Logistics Visibility

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carolina Tourinho |
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

> **Why not fix the current simulator directly?** The existing simulator lives in `vtex/vcs.logistics-ui` and `vtex/vcs.logistics` — repos over 10 years old running on Knockout.js, part of the legacy VCS (VTEX Commerce Suite) stack that predates VTEX IO, Shoreline, and Raccoon entirely. Surgical fixes (e.g., currency-only) in that codebase carry high risk, low velocity, and would be discarded when the new `admin-shipping-simulation` Raccoon app ships. The correct investment is building the replacement, not patching a 10-year-old Knockout.js app.

---

## Current Simulator: What to Keep, What to Review

The new simulator must preserve all data currently exposed, unless explicitly decided otherwise with engineering. The table below summarizes what carries forward, what needs a second look, and what is intentionally dropped.

| Status | What | Notes |
|---|---|---|
| ✅ Keep | Core flow: input form → simulation results | Same mental model, new UI |
| ✅ Keep | Result fields: carrier name, SLA tag, shipping price, lead time, available quantity | Already well understood by operators |
| ✅ Keep | Expanded detail: dock, warehouse, postal code range, weight range, absolute value, per-gram surcharge, % surcharge over order total, dock→warehouse cost, scheduled delivery flag, time costs (dock, warehouse, transport, with cutoff hours) | Carry forward as-is; may reorganize layout |
| ✅ Keep | Carrier rejection motive | Already shown today — goal is to improve specificity, not remove |
| ✅ Keep | Simulate items individually | Checkbox already exists today — allows running each SKU as a separate simulation when items have incompatible logistics configurations; preserve as-is |
| 🔍 Review with eng | Cubic weight factor, max order value, cubic weight | Confirm whether these are actionable for operators or can be simplified/hidden |
| 🔍 Review with eng | Time cost breakdown (dock / warehouse / transport shown separately) | May consolidate into a single readable line (e.g., "5 days transport + 0 dock handling") |
| ❌ Remove | Manual country input | Replaced by auto-resolution from the selected sales channel |
| ❌ Remove | SKU search with indistinguishable variant names | Replaced by new picker showing SKU ID, variant name, EAN, reference code |

---

## New Functionalities — Priority Order

What is new compared to the current simulator, ordered by priority:

| # | Functionality | Today | New |
|---|---|---|---|
| P0 | **Seller-level simulation** | Simulation always runs against the main account — no way to scope to a specific seller | Operators can select a seller and simulate within its logistics configuration |
| P0 | **Scheduled delivery visibility** | Scheduled delivery support is shown as a plain text field ("Entrega agendada: não") buried in the expanded detail — not visible at a glance | When a shipping option supports scheduled delivery, this is surfaced prominently in the result row (e.g., **Entrega agendada** badge), making it immediately visible without expanding the detail panel — prototype: Lala Move |
| P0 | **Usage metrics** | No instrumentation — no visibility into how the tool is used by VTEX accounts | Establish a pre-migration baseline via legacy API logs (`POST /api/logistics/pvt/shipping/calculate`), then track post-launch events per account: unique users per account, usage frequency per account, sales channel, seller, result count, and errors — enabling before/after comparison to measure adoption impact across the merchant base |
| P1 | **Logistics route visibility** | Expanded detail already shows dock and warehouse, but does not display which shipping policy is applied — making root-cause diagnosis incomplete | Each result shows the full route: warehouse → dock → shipping policy; detail panel also highlights whether the carrier operates on weekends (`worksOnWeekends`) as a visual badge rather than a plain text field |
| P1 | **Clear SKU variant identification** | All variants of the same product appear with identical names in the search dropdown — operator cannot tell which SKU they are simulating | Search dropdown shows differentiating attributes per variant: SKU ID, variant name, EAN, reference code — making each option unambiguous |
| P1 | **Carrier rejection reasons** | Rejection motive is already shown (e.g., "dismissed due to priority"), but the reason is generic — operator cannot identify the root configuration issue | Review and improve rejection reasons to be actionable and specific: out of postal code range, above weight limit, outside business hours, dimensions exceeded, etc. |
| P2 | **Recent simulations history** | Every session starts blank — no memory of previous simulations | Last 5 simulations saved and restorable with one click (30-day TTL, per user) — covered in spec 002 |
| P2 | **Kit SKU simulation fix** | Kit SKUs return empty metadata fields (postal code range, weight range) in simulation results (KI 1382356) — operator has no freight data for kits | Display correct fields computed from combined weight and dimensions of kit components — subject to eng investigation on whether fix is frontend-only or requires backend changes |
| P2 | **Delivery date display** | Results show lead time in days only (e.g., "3 dias") — no calendar date shown | Results display the estimated delivery date (e.g., "Arrives June 5"), computed from lead time, business days, and cutoff hours |
| P3 | **Delivery vs. pickup separation** | Results mix delivery and pickup options without clear distinction | Separate tabs or sections for delivery and pickup; each clearly labeled |
| P3 | **Correct local currency** | Always shows the platform default currency, ignoring the sales channel's configured currency (KI 514551) | Currency auto-resolved from the selected sales channel |
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
- **Checkout simulation** — The VTEX checkout simulation (`POST /api/checkout/pub/orderForms/simulation`) is intentionally excluded. Although it resolves some logistics parameters as a side effect, it is a different API with a different contract: it requires a full cart payload, applies pricing rules, promotions, and payment conditions, and is scoped to a buyer session. Using it here would significantly increase implementation complexity without improving the core value of this tool, which is logistics-level diagnostics. This simulator is explicitly backed by `POST /api/logistics/pvt/shipping/calculate`, which exposes full carrier-level detail (rejection reasons, route breakdown, warehouse/dock chain) that the checkout simulation does not surface. The right scope for this MMR is: **improve the logistics simulation experience as-is, with seller selection and proper error handling** — not to replicate checkout behavior.
- Exporting simulation results (CSV, PDF)
- Agentic UI track (separate development path) — a Shipping Simulator Agent prototype already exists and covers the same core functionalities as this redesign. The Admin UI redesign is being prioritized first deliberately: without instrumentation data, any decision about the agent would be based on assumption. The redesigned simulator ships with usage metrics (P0) that will establish a baseline — how many operators use the tool, how often, and in what context — and that data will inform if, when, and how the agentic track makes sense as the next investment. The agent prototype includes carrier activation/deactivation as a conversational action; whether an agent should take actions (vs. only diagnose and suggest) is an open product decision not resolved in this MMR.

---

## App Identity

| Field | Value |
|---|---|
| **Current location** | `/admin/logistics#/freight-simulation` (legacy VCS route, hash-based) |
| **Proposed route** | `/admin/shipping-simulation` |
| **App name** | `admin-shipping-simulation` |
| **Vendor** | `vtex` |
| **Migration note** | The legacy route should redirect to the new route on GA. During the transition period both routes may coexist. |

---

## Under Exploration

Ideas that have potential but require validation before becoming a spec. Not committed to any release.

### Configuration Preview ("What-if simulation")

**Hypothesis:** Operators would benefit from simulating the impact of a configuration change *before* applying it — e.g., "if I activate this carrier, what freight options would appear for this SKU and ZIP?" This differs from the standard simulator, which only reflects the current live configuration.

**Why it's not in scope yet:** The complexity is significant — it requires ephemeral config state, a before/after comparison view, and a clear rollback path. The value needs to be proven before investing. The agentic prototype already touches this space (carrier activation with explicit confirmation), and usage data from the Admin UI track will help determine whether a dedicated "what-if" mode is warranted in the form-based experience.

**What would validate it:** Operator interviews or session data showing that a significant share of simulations happen *after* a config change, as a verification step — rather than as a diagnostic for an existing problem.


---

## Known Issues Addressed

| KI | Description | Resolution |
|---|---|---|
| **514551** | Simulator shows default currency instead of local currency | Currency auto-resolved from sales channel via API |

> KI 1382356 (empty postal code range and weight range for kit SKUs) is not committed as a fix in this MMR. The prototype includes a mocked kit scenario to illustrate the desired end state; whether a fix is feasible depends on engineering investigation into whether the issue is frontend-only or requires backend changes.
