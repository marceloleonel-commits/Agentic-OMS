# Shipping Simulator — Prototypes

This folder contains prototype artifacts for the new Shipping Simulator experience.

## Context

The current Shipping Simulator (`/admin/logistics#/freight-simulation`) is a minimal form-based UI with limited feedback and no visibility into logistics engine decisions. It lives in `vtex/vcs.logistics-ui` and `vtex/vcs.logistics` — repos over 10 years old running on Knockout.js, part of the legacy VCS (VTEX Commerce Suite) stack that predates VTEX IO, Shoreline, and Raccoon entirely. The new experience is being built in `vtex/admin-shipping-simulation` using Raccoon and Shoreline. This prototype work explores two directions for that replacement.

## Prototype Tracks

### 1. Classic UI (`/classic-ui`)
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

## Known Issues Addressed

| KI | Description | Track |
|---|---|---|
| 514551 | Wrong currency displayed in simulator | Classic UI |
| 1382356 | Empty postal/weight range for kit SKUs | Classic UI |

## Shared Logic Cross-Reference

Both prototypes are self-contained HTML files (no external JS dependencies) to ensure they work when opened locally via `file://`. This means some logic is intentionally duplicated. The table below maps shared concepts so that the implementation team does not rebuild them independently.

| Concept | Classic UI | Agentic UI | Notes |
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

Both the classic form page and the agentic chat interface would consume this component. The agentic UI additionally needs `<RejectedCarriersModal />` (not present in classic UI) and the classic UI needs the form components (`<SellerCombobox />`, `<SkuSearch />`, etc.).

---

## Status

> Work in progress — prototypes under active development.
