# Shipping Simulator — Prototypes

This folder contains prototype artifacts for the new Shipping Simulator experience.

## Context

The current Shipping Simulator (`/admin/logistics#/freight-simulation`) is a minimal form-based UI with limited feedback and no visibility into logistics engine decisions. It lives in `vtex/vcs.logistics-ui` and `vtex/vcs.logistics` — repos over 10 years old running on Knockout.js, part of the legacy VCS (VTEX Commerce Suite) stack that predates VTEX IO, Shoreline, and Raccoon entirely. The new experience is being built in `vtex/admin-shipping-simulation` using Raccoon and Shoreline. This prototype work explores two directions for that replacement.

## Prototype Tracks

### 1. Admin UI (`/admin-ui`)
A redesigned version of the current simulator using Shoreline (VTEX's design system) and Raccoon (the VTEX Admin framework). Maintains the familiar form-based interaction model but significantly improves result visibility, error explanations, and overall UX.

**Goals:**
- Replace legacy UI components with Shoreline equivalents
- Fix known issues: currency display (KI 514551) and kit metadata display (KI 1382356)
- Expose rejection reasons, inventory details, and route analysis in a structured way
- Support multi-item simulation

### 2. Agentic UI (`/agentic-ui`)
A conversational AI-native experience where merchants interact with a shipping simulation agent via chat. Based on the `shipping-simulator-agent` architecture (Strands Framework + Agentic UI).

**Goals:**
- Allow natural language queries ("Can I ship SKU 123 to São Paulo?")
- Surface logistics diagnostics proactively (stock, route, carrier rejections)
- Leverage the rich `freightSimulatedForAi` API response for intelligent explanations
- Render structured results inline via the `ShippingResults` component

## Track Prioritization

The Admin UI is being built before the Agentic UI — not because the agentic track is less valuable, but because we need usage data before making that investment confidently.

The current simulator has no instrumentation. Without knowing how many operators use it, how often, and in what context, any decision about the agent would be based on assumption. The redesigned Admin UI ships with usage metrics (P0) that establish a baseline per account: unique users, frequency, sales channel, seller, result count, errors. That data will inform if, when, and how the agentic track makes sense as the next investment.

Additionally, a key product question remains open for the Agentic UI: **should the agent take actions** (e.g., activate/deactivate carriers) or primarily diagnose and suggest? This decision has meaningful implications for operator trust and operational risk, and should be informed by real usage patterns from the Admin UI.

For the full product strategy, specs, and prioritized feature list, see [`specs/002-shipping-simulator-redesign/product-brief.md`](../specs/002-shipping-simulator-redesign/product-brief.md).

## Known Issues Addressed

| KI | Description | Track | Status |
|---|---|---|---|
| 514551 | Wrong currency displayed in simulator | Admin UI | Planned fix (P3) |
| 1382356 | Empty postal/weight range for kit SKUs | Admin UI | Planned fix (P2) — subject to eng investigation on whether fix is frontend-only or requires backend changes |

## Why HTML — and What That Means for Shoreline

Both prototypes are self-contained HTML files, not Raccoon/React apps. This is intentional: the goal is to validate product flow and UX before any engineering investment. Building in Raccoon would require scaffolding, `vtex link`, a dev account, and typed mocks before a single screen could be shown. HTML allows iterating in hours and opening directly in the browser with no build step.

**What was done to stay close to Shoreline:**
The CSS tokens (colors, border-radius, focus rings, spacing, typography) were manually aligned to what Shoreline components render. The visual result is nearly identical to the real components.

**What the prototype does NOT guarantee:**
Accessibility behavior, exact prop/variant APIs, and runtime design system integration. Those are the responsibility of the production implementation.

**Shoreline component map — HTML element → production component:**

| HTML element / class | Shoreline component | Notes |
|---|---|---|
| `.btn-primary` | `Button variant="primary"` | Blue, height 32px, border-radius 4px |
| `.btn-secondary` | `Button variant="secondary"` | Outlined, same sizing |
| `.btn-link` | `Button variant="tertiary"` or `Link` | Text-only, no border |
| `.input` | `Input` | Border `#B4B9C2`, focus ring `#0C2DCC` |
| `select.input` | `Select` + `SelectItem` | Dropdown pattern |
| `.combo-input` + `.combo-dropdown` | `Combobox` (`ComboboxInput`, `ComboboxItem`, `ComboboxList`, `ComboboxPopover`) | Seller search + SKU search |
| `.type-badge` (gray) | `Tag color="gray"` | Shipping type: Standard/Padrão |
| `.type-badge.express` | `Tag color="orange"` | Shipping type: Express |
| `.weekend-badge` | `Tag color="blue"` | Works on weekends indicator |
| `.results-count` | `Tag color="blue"` | Result count pill |
| `.error-box` | `Alert variant="critical"` | Left 4px border, `#FFF1F3` bg |
| `.sla-table` | `Table` + `TableHeader` + `TableBody` + `TableRow` + `TableCell` | SLA results table |
| Toast (restore recent) | `toast()` from `@vtex/shoreline` | Floating feedback |
| Delivery / Pickup tabs | `TabProvider` + `TabList` + `Tab` + `TabPanel` | Result sections |
| Form label + field group | `Field` + `Label` + `FieldDescription` | Input grouping |

**Elements without a direct Shoreline equivalent (custom):**
Sidebar nav, client/language toggle pill, SKU chip selection state, expandable SLA detail panel, recent simulations bar. These will need custom design decisions during implementation.

---

## Shared Logic Cross-Reference

Both prototypes are self-contained HTML files (no external JS dependencies) to ensure they work when opened locally via `file://`. This means some logic is intentionally duplicated. The table below maps shared concepts so that the implementation team does not rebuild them independently.

| Concept | Admin UI | Agentic UI | Notes |
|---|---|---|---|
| Mock data (`DATA` object) | `DATA` (top of file) | `DATA` (top of file) | Identical structure. PT-BR and EN datasets with accounts, sellers, sales channels, SKUs, SLAs, pickups, i18n |
| Client/language switch | `setClient(c)` | `setClient(c)` | Resets state and re-renders the interface for PT-BR or EN |
| i18n application | `applyI18n()` | `applyI18n(i)` | Iterates `[data-i18n]` elements and sets `textContent` from the i18n map |
| SLA results table | `buildResults()` | `appendResultCard()` | Same structure: carrier row → expandable details panel with Logistics / Costs / Time columns |
| Pickup results table | Inside `buildResults()` | Inside `appendResultCard()` | Same table layout: store name, hours, price, availability |
| SLA details toggle | `toggleDetails(idx)` | `toggleDetail(rid)` | Show/hide the 3-column breakdown panel per SLA row |
| Weekend indicator | `worksOnWeekends` flag → SVG checkmark in details | Same | Inline SVG, Shoreline-compliant — not a badge, lives inside the Time column of the details panel |

### Implementation note

When moving from prototype to production (Raccoon + React), these shared concepts should become a single component:

```
<ShippingResultsTable slas={slas} pickups={pickups} currency={currency} />
```

Both the classic form page and the agentic chat interface would consume this component. The agentic UI additionally needs `<RejectedCarriersModal />` (not present in Admin UI) and the Admin UI needs the form components (`<SellerCombobox />`, `<SkuSearch />`, etc.).

---

## Status

| Track | Prototype | Spec | Production |
|---|---|---|---|
| Admin UI | ✅ Complete | [`002-shipping-simulator-redesign`](../specs/002-shipping-simulator-redesign/product-brief.md) | In definition |
| Agentic UI | ✅ Complete | No formal spec yet | Pending metrics baseline from Admin UI |
