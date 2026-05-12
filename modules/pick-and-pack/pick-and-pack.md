# Pick and Pack

| | |
|---|---|
| **Pillar** | Lowest cost-to-serve · Native omnichannel support |
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **PM** | [Sayonara Soares](mailto:sayonara.soares@vtex.com) |
| **EM** | [Carolina Mourão](mailto:carolina.mourao@vtex.com) |
| **Status** | Active |

---

## What This Module Is

Pick and Pack is VTEX's in-store and warehouse fulfillment operations product. It provides a mobile-first application for store associates and warehouse workers to pick, pack, and hand off orders to carriers. The primary ICP is grocery merchants operating tight same-day delivery windows, low margins, and high order volumes — where picking speed and accuracy are the defining competitive factors. Key results: 6× order growth Q4 2024 → Q4 2025; 70% bug reduction Q1 → Q4 2025; cost per order reduced from $1.09 to $0.51 (Q1→Q2 2025).

---

## Services in Scope

| Service | Description |
|---------|-------------|
| Pick and Pack App (Mobile) | Mobile application for store associates — order queue, item picking flow, item substitution, packing, and carrier handoff |
| Pick and Pack Admin | Merchant-facing configuration and monitoring — store setup, user management, and order processing visibility |
| Pick and Pack Data Pipeline | Data infrastructure for operational metrics — processed orders, time to pick, scan success rate, substitution rate, and cost per order |
| OMS Workflow Integration | Injects Pick and Pack status events (picked, packed, carrier handoff) into the VTEX order timeline via Agentic Workflow entry points — eliminating the current duplicate order record model |

---

## Problems This Module Solves

1. **Picking flow adds unnecessary time per SKU.** The current flow requires a manual tap to open the scanner for each item — adding 3–5 seconds per SKU in a 45-item grocery order. Average processing time grew from 2.55 to 5.56 hours per order Q1→Q2 2025 as higher volume exposed the UX bottleneck at scale.
2. **Scan failures default to slow manual search.** When a barcode scan fails (damaged label, produce without barcode), associates must type-search by name — adding 15–30 seconds per unscanned item under high-pressure conditions.
3. **No self-service operational data.** There is no self-service view of time to pick, substitution rate, or cost per order. Store managers export data manually to spreadsheets, making real-time operational decisions and AI training impossible.
4. **Pick and Pack creates duplicate order records.** Because Pick and Pack cannot inject status events into the native OMS order timeline, it creates parallel order records outside the core OMS — breaking the unified order view and complicating PII compliance.
5. **Tier 1 merchant scope misalignment.** Fareway (US), Rona (Canada), and Grupo Ramos (Honduras) have go-live blockers caused by features developed without full requirements alignment — requiring rework and delaying launches.

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Pick and Pack Experience](pick-and-pack-experience/product-vision.md) | End-to-end picking and packing experience optimized for grocery — scan-first UX, AI-assisted substitutions and route optimization, and self-service Quicksight dashboard | Active |
