# Product Brief: Scan-First Picking Flow — Alpha

| | |
|---|---|
| **Spec** | 001-scan-first |
| **Module** | Pick and Pack / Pick and Pack Experience |
| **Pillar** | Lowest cost-to-serve |
| **PM** | [Sayonara Soares](mailto:sayonara.soares@vtex.com) |
| **Status** | Active — H2 2026 |
| **Availability** | Alpha |

---

## Problem

Store associates at grocery merchants cannot complete orders fast enough to meet same-day delivery windows. The current picking flow requires a manual tap to open the barcode scanner for every individual item — adding 3–5 seconds per SKU in a 45-item grocery order. When a scan fails (damaged label, produce without a barcode), associates must switch to a name-search lookup, adding 15–30 seconds per unscanned item. Average processing time grew from 2.55 to 5.56 hours per order Q1→Q2 2025 as order volume doubled — exposing the UX bottleneck at scale. Store managers cannot measure time to pick, substitution rate, or scan accuracy without requesting engineering data pulls, leaving product and operations decisions blind.

---

## Solution

Redesign the picking experience around a scan-first, order-oriented flow where the barcode scanner is active by default throughout the picking session — the associate scans an item to advance the flow, rather than tapping to open the scanner for each item. Deploy a self-service Quicksight dashboard tracking time to pick, items scanned vs. manually entered, substitution rate, and cost per order for merchants and the product team. The alpha ships as an opt-in — active merchants are not migrated by default, allowing A/B measurement against the current flow.

---

## Who Benefits

**Store associates at grocery merchants running same-day fulfillment** pick faster with fewer taps per order, reducing physical effort and error rate in high-volume, high-pressure environments.

**Store managers and operations teams** independently track picking performance by store and associate in real time — without engineering data pulls — and use that data to improve operations and set AI training baselines.

**Tier 1 merchants launching with VTEX** (Fareway, Rona, Grupo Ramos) get a reference picking experience that meets same-day grocery SLA requirements.

---

## Definition of Done

- [ ] Scan-first alpha live with at least 1 active grocery merchant running production orders through the new flow
- [ ] Average time to pick reduced by ≥20% for orders processed through the scan-first flow vs. current flow — measured from before/after data using the self-service dashboard
- [ ] Self-service Quicksight dashboard live: merchants and the product team answer operational questions (time to pick, substitution rate, cost per order) without an engineering data pull within 1 week of launch
- [ ] Tier 1 merchants (Fareway, Rona, Grupo Ramos) fully operational with go-live blockers resolved

> ⚠️ TODO: Scan success rate baseline (% of items currently picked via successful scan vs. manual search) must be established before the alpha target can be set. Flow design for produce and non-barcoded items without falling back to name search is not yet defined.
