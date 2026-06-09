# Shipping Simulator (Admin UI) — Feature Guide

> **Read this first if you are an AI or a new contributor working on `shipping-simulator-v1.html`.**
> This file is the source of truth for **what each feature does** and, critically, **whether it is new in this redesign or replicated from the legacy simulator**. Use it to understand intent before changing code, and to avoid "fixing" intentional behavior.

The prototype is a single self-contained HTML file (`shipping-simulator-v1.html`) that previews the future `vtex/admin-shipping-simulation` (Raccoon + Shoreline) app. It replaces the **legacy** simulator at `/admin/logistics#/freight-simulation` (`vtex/vcs.logistics-ui` + `vtex/vcs.logistics`, Knockout.js).

---

## Status legend

| Tag | Meaning |
|---|---|
| 🆕 **NEW** | Capability that does **not** exist in the legacy simulator. Introduced by this redesign. |
| ♻️ **REPLICATED** | Existed in the legacy simulator and is carried over with the **same behavior**, just rebuilt in the new (Shoreline) UI. |
| 🔧 **IMPROVED** | Existed in the legacy simulator but is **meaningfully enhanced** (better data, fixes a known issue, or clearer UX). |
| 🧪 **DEMO-ONLY** | Exists only to make the prototype demonstrable (mock data, toggles, disclaimers). **Not a product feature** — will not exist in production. |
| 📋 **SPEC-ONLY** | Committed in the spec but **not implemented in this prototype** (e.g., backend instrumentation). |

Code anchors point to JS function names and DOM element `#id`s inside `shipping-simulator-v1.html`.

---

## 1. Simulation context (form inputs)

| Feature | Status | What it does | Code anchors | vs. legacy |
|---|---|---|---|---|
| **Sales channel selector** | ♻️ REPLICATED (🔧 only active SCs) | First input; drives currency and the default country. | `buildScSelect()`, `onScChange()`, `#sel-sc` | Legacy had it too; redesign lists **only active** sales channels. |
| **Currency (auto, read-only)** | 🔧 IMPROVED | Currency + symbol auto-resolved from the sales channel and shown as a **read-only** field. Fixes **KI 514551** (legacy showed the platform default currency). | `onScChange()`, `#currency-field`, `#currency-val` | Legacy showed wrong/default currency and no dedicated field. |
| **Destination country (dropdown)** | 🆕 NEW | Editable dropdown of **ISO-3 country codes**, pre-selected with the sales channel's default country. A sales channel can serve **multiple countries with the same currency**, so country is **not** hardcoded to the SC. Replaces the legacy free-text country input. | `buildCountrySelect()`, `onCountryChange()`, `resetCountrySelect()`, `#sel-country`, `CURRENCY_COUNTRIES` map | Legacy required **manual free-text** country entry. |
| **Seller selection** | 🆕 NEW (P0) | Combobox to scope the simulation to a specific seller. | `buildSellerList()`, `renderSellerDropdown()`, `pickSeller()`, `#seller-combo` | Legacy always ran against the **main account**. |
| **Seller × sales channel validation** | 🆕 NEW | Blocks simulation when the seller is not mapped to the selected SC (mocked here via error box). | `isFormReady()`, `simulate()`, `#err-box` | Did not exist in legacy. |
| **SKU search with variant identification** | 🔧 IMPROVED (P1) | Search by name / SKU ID / EAN / reference; each option shows differentiating attributes so variants are distinguishable. | `onSkuInput()`, `scoreSkuMatch()`, `highlightMatch()`, `skuExtraTags()`, `pickSku()` | Legacy showed all variants with **identical names**. |
| **Multi-item + "simulate individually"** | ♻️ REPLICATED | Add multiple SKUs to one simulation; toggle to simulate each separately. | `addRow()`, `removeRow()`, `getSimulationItems()`, `isIndividualSimulation()`, `#chk-individual` | Same behavior as legacy. |
| **Quantity + optional Price** | ♻️ REPLICATED | Quantity per item; optional price for min/max price-rule policies. | `addRow()` (qty/price inputs) | Same as legacy. |
| **ZIP / postal code (country-aware format)** | 🔧 IMPROVED | Masks/validates the postal code based on the **selected destination country** (defaulted from the SC). | `fmtZip()`, `#zip-input` | Legacy formatting was static/manual. |

---

## 2. Simulation results

| Feature | Status | What it does | Code anchors | vs. legacy |
|---|---|---|---|---|
| **Core flow: form → results** | ♻️ REPLICATED | Same mental model: fill the form, click Simulate, read results. | `simulate()`, `buildResults()` | Same as legacy. |
| **Result row fields** (carrier, type tag, price, lead time, qty) | ♻️ REPLICATED | Per-carrier SLA row with the familiar fields. | `appendSlaRows()`, `slaBadges()` | Same fields as legacy. |
| **Local currency formatting in results** | 🔧 IMPROVED | All monetary values use the SC currency/symbol (KI 514551). | `appendSlaRows()` (prices come pre-formatted in mock `DATA`) | Legacy used default currency. |
| **Expandable detail panel** (dock, warehouse, postal range, weight range, surcharges, time costs) | ♻️ REPLICATED | Per-SLA breakdown across Logistics / Costs / Time. | `toggleDetails()`, `appendSlaRows()` | Same data as legacy, reorganized. |
| **Logistics route visibility** (warehouse → dock → **shipping policy**) | 🔧 IMPROVED (P1) | Detail panel shows the full route including the **shipping policy** applied. | `appendSlaRows()` (route block) | Legacy showed dock + warehouse only, **not** the policy. |
| **Scheduled delivery badge** ("Entrega agendada") | 🆕 NEW (P0) | Surfaces scheduled-delivery support **in the result row** (e.g., Lala Move) without expanding details. | `slaBadges()`, `.scheduled-badge` | Legacy buried it as plain text in the detail panel. |
| **Weekend operation indicator** | 🔧 IMPROVED | Flags carriers that operate on weekends (`worksOnWeekends`). | `slaBadges()`, `.weekend-badge` | Legacy had it only as plain text. |
| **Estimated delivery date** | 🆕 NEW (P2) | Shows a calendar arrival date, not just lead-time days. | `calcTotalLeadTime()`, `parseLeadDays()`, `arrivalDate` in `DATA` | Legacy showed days only. |
| **Delivery vs. pickup separation** | 🆕 NEW (P3) | Pickup options shown in their own section/table, distinct from delivery. | `appendPickupTable()`, `resolvePickupRegion()`, `filterPickupsByRegion()` | Legacy mixed them together. |
| **Carriers not available + rejection reasons** | 🔧 IMPROVED (P1) | Lists rejected carriers with human-readable, specific reasons (postal range, weight, hours, dimensions, priority, etc.). | `appendExcludedSection()`, `toggleExcluded()`, `toggleExcludedBlock()`, `#excluded-section` | Legacy showed generic motives only. |
| **Kit SKU metadata** (postal/weight range) | 🔧 IMPROVED (partial) | Renders kit breakdown + combined weight. Resolving empty ranges (KI 1382356) is **subject to eng investigation**, not committed. | `appendSlaRows()` (kit handling) | Legacy returned empty fields for kits. |

---

## 3. Session & history

| Feature | Status | What it does | Code anchors | vs. legacy |
|---|---|---|---|---|
| **Recent simulations history** | 🆕 NEW (P2) | Saves the last simulations (per user, in `localStorage`) and restores them with one click. Stores SC, country, seller, SKU, ZIP, qty. | `initRecents()`, `renderRecents()`, `saveCurrentSimulation()`, `restoreRecent()`, `setScFromRecent()`, `loadRecentsFromStorage()` | Did not exist — legacy starts blank every session. |
| **Restore confirmation toast** | 🆕 NEW | Feedback when a recent simulation is restored and re-run. | `showRestoreToast()` | Did not exist. |

---

## 4. Production-only / not in this prototype

| Feature | Status | What it does | Notes |
|---|---|---|---|
| **Usage metrics / instrumentation** | 📋 SPEC-ONLY (P0) | Pre-migration baseline via legacy API logs, then per-account tracking (unique users, frequency, SC, seller, result count, errors). | No instrumentation exists in the HTML prototype. See `product-brief.md`. |

---

## 5. Demo scaffolding (NOT product features)

These exist only so the single HTML file is demonstrable across scenarios. **Do not treat them as product requirements** — production resolves account/locale from the real admin context.

| Element | Status | Code anchors |
|---|---|---|
| Language switch (PT / EN / ES) | 🧪 DEMO-ONLY | `setLang()`, `applyI18n()`, `getI18n()`, `I18N_PT/EN/ES` |
| Account / vertical toggle (PharmaTech / FashionPrime) | 🧪 DEMO-ONLY | `setVertical()`, `getDatasetKey()`, `updateAccountBadge()` |
| Mock dataset | 🧪 DEMO-ONLY | `DATA`, `BR_SC` / `EN_SC` / `ES_SC`, `CURRENCY_COUNTRIES` |
| Demo disclaimer bar + feedback callouts | 🧪 DEMO-ONLY | `updateFeedbackCallouts()`, `.demo-top-bar` |

> ⚠️ **`CURRENCY_COUNTRIES` is a prototype stand-in.** It maps currency → ISO-3 country codes to populate the destination-country dropdown. In production, the canonical list of countries a sales channel can serve is an **open question** (sales channel config vs. trade policy vs. account country catalog). The sales channel API's `CountryCode` is used only as the **default** selection.

---

## Related docs

- Product brief: [`../../specs/002-shipping-simulator-redesign/product-brief.md`](../../specs/002-shipping-simulator-redesign/product-brief.md)
- Product spec (FRs, user stories, APIs): [`../../specs/002-shipping-simulator-redesign/product-spec.md`](../../specs/002-shipping-simulator-redesign/product-spec.md)
- Functionalities overview (keep / review / remove + priorities): [`../../specs/002-shipping-simulator-redesign/functionalities-overview.html`](../../specs/002-shipping-simulator-redesign/functionalities-overview.html)
- Prototype overview + Shoreline component map: [`../README.md`](../README.md)
