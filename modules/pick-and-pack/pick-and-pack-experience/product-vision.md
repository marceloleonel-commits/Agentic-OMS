[Product Vision]: 3-Year Pick and Pack Experience — Fast Fulfillment for Grocery

| Status | Draft | Owner(s) | [Sayonara Soares](mailto:sayonara.soares@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Sayonara Soares](mailto:sayonara.soares@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines the strategic direction for Pick and Pack as VTEX's in-store and warehouse fulfillment operations product. It covers a 3-year horizon with a primary focus on the grocery segment, where tight delivery windows and low-margin operations make picking speed and accuracy the defining competitive factor. The primary objective is to establish Pick and Pack as the purpose-built fulfillment operations tool for grocery merchants scaling omnichannel operations — measured by average time to pick.*

---

| TL;DR |
|---|
| **Product/Area:** Pick and Pack — Pick and Pack Experience |
| **Focus Task:** Enable store associates to pick, pack, and hand off orders as fast and accurately as possible — reducing average time to pick per order |
| **Persona:** Store Associate and Store Manager at grocery merchants running ship-from-store and BOPIS operations — tight delivery windows (same-day, 2-hour slots), high order volume, and low-margin environments where picking errors are costly |
| **Working title/Commercial Name:** Pick and Pack |
| **Value headline:** Grocery merchants reduce picking time per order and operational cost per order — enabled by a scan-first, order-oriented picking UX, AI-assisted routing, and a self-service data layer that removes dependence on engineering for operational metrics. |
| **Mini-Press Release:** Grocery merchants running same-day fulfillment from stores need picking operations that are faster and more accurate than current tools support. VTEX's Pick and Pack product stabilized and scaled in H1 2025 (100% increase in processed orders QoQ, 53% cost reduction per order) — but the current picking flow still requires unnecessary taps and lookups per SKU that add seconds to every pick. VTEX is redesigning the Pick and Pack experience around a scan-first, order-oriented flow that minimizes picking time, applies AI to suggest optimal routing, and gives merchants a self-service dashboard to measure and improve their operations without engineering involvement. |
| **Opportunity Size:** 6 active merchants as of Q2 2025 with 7,321 orders processed. Tier 1 expansion pipeline: Fareway (US), Rona (Canada), Grupo Ramos (Honduras). H2 2025 goal: new grocery case in Brazil (Hiperideal). Cost per order reduced from $1.09 to $0.51 (Q1→Q2 2025). [PM INPUT NEEDED: ACV and ARR for Pick and Pack as a standalone product line] |

---

## Problem / Opportunity

### 1. Narrative framing

Store associates at grocery merchants using Pick and Pack cannot complete orders fast enough to meet same-day delivery windows with the current picking flow. Every pick involves opening a scan input, searching for an item by name when a scan fails, and manually verifying item variances — adding 3–5 seconds per SKU in a flow where an order may contain 30–60 items. For grocery merchants operating 2-hour delivery slots with high order volume, this per-SKU overhead accumulates to a picking time that makes operations unprofitable at scale.

In practice, this means:
- A store associate processing a 45-item grocery order with the current flow takes approximately 5.56 hours average processing time per order (Q2 2025 data) — up from 2.55 hours in Q1, as higher order volume exposed UX bottlenecks
- When the barcode scan fails (damaged item, produce without barcode), the associate must type-search the item by name — a flow that adds 15–30 seconds per unscanned item in a high-pressure environment
- Store managers cannot measure average time to pick, item substitution rate, or scan accuracy per associate without requesting a custom engineering data pull — operational improvement is blind

Business impact:
- Picking time is the primary cost driver in grocery fulfillment — each extra second per SKU multiplies across all items in all orders processed daily
- Tier 1 merchants (Fareway, Rona, Grupo Ramos) have go-live blockers related to scope gaps in the product — features were developed without full requirements alignment, causing re-work and delayed launches
- The product has no self-service metrics layer — the team and merchants cannot independently measure whether product changes reduce picking time or improve accuracy

### 2. Why Now

Q2 2025 marked a turning point: Pick and Pack processed 7,321 orders (100% QoQ growth), reduced cost per order by 53%, and stabilized on v2 codebase. The product is operationally sound. The next competitive leap is UX speed and data intelligence — and both require investment now, before Tier 1 grocery launches (Fareway, Rona, Grupo Ramos) set the reference experience for the segment.

The self-service dashboard is also a prerequisite for AI features: without structured operational data (time to pick, scan rate, substitution patterns), there is no training signal for AI-assisted routing or substitution suggestions.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Reduce average time to pick per SKU | Scan-first flow eliminates open-scan and name-search steps for ≥90% of items | Grocery merchants: pick a 45-item order without opening the scan input once per item |
| Measure operational performance without engineering | Store manager views time to pick, substitution rate, and cost per order from a self-service dashboard | Hiperideal: daily operational review of picking performance by store and associate |
| AI-assisted picking route suggestions | System suggests optimal picking sequence based on store layout and order composition | Tier 1 merchants: AI routing reduces walking distance per order by X% |
| Tier 1 merchant launch unblocked | All product gaps for Fareway, Rona, Grupo Ramos resolved in H2 2025 | Tier 1 go-live: Rona Canada and Grupo Ramos Honduras operational by end of H2 2025 |
| AI-assisted item substitution suggestions | When an item is out of stock, system suggests substitutions based on merchant-configured rules and historical data | Grocery merchants: associate accepts or rejects AI substitution suggestion in 1 tap |

### 4. Customer Workarounds

- **1. Manual item search when scan fails.** Associates type the product name in a search field when the barcode scan fails or the item has no barcode (produce). This fails because it is slow (15–30 seconds per unscanned item), error-prone in a high-pressure environment, and adds to average picking time at scale.

- **2. Custom spreadsheet dashboards for operational metrics.** Store managers export order data and build Excel or Sheets dashboards to track picking performance. This fails because it is always lagging (not real-time), requires manual maintenance, and cannot be used for in-shift operational adjustments.

- **3. Third-party WMS for route optimization.** Some enterprise grocery merchants use a WMS for picking route optimization and connect it to VTEX via integration. This fails because it adds integration cost and complexity for merchants who should be able to use a VTEX-native tool for basic route suggestions.

---

## Vision Concepts

**Average Time to Pick** — The north star metric for Pick and Pack Experience: the time elapsed from order assignment to a store associate until all items are picked. Replaces processed orders (volume) as the primary product success metric.

**Scan-First Flow** — A redesigned picking experience where the barcode scanner is active by default throughout the picking session — the associate scans an item to advance the flow, rather than tapping to open the scanner for each item. Eliminates the scan-open overhead per SKU.

---

## Vision Statement

3-Year Vision: VTEX Pick and Pack will be the fastest and most data-intelligent fulfillment operations tool for grocery merchants — enabling store associates to pick any order in the minimum physically possible time, with AI handling substitutions and routing automatically, and operations teams measuring and improving performance through self-service data.

1-Year Vision (H2 2025 – H1 2026): Scan-first alpha is live, Tier 1 merchants (Fareway, Rona, Grupo Ramos) are operational, self-service Quicksight dashboard is available to merchants and the product team, and a new grocery business case (Hiperideal) is launched in Brazil.

### Key Capabilities

**1. Scan-first picking flow.** The scanner is active by default throughout the picking session. Associates scan to advance — no tap to open scanner per item. Reduces per-SKU picking overhead for associates handling standard barcoded items.

**2. AI-assisted item substitution.** When an item is out of stock or unavailable, the system suggests substitutions based on merchant-configured rules, product similarity, and historical substitution acceptance data — presented in one-tap accept/reject format.

**3. AI-assisted route optimization.** The system suggests the optimal picking sequence for each order based on store layout and order composition — reducing walking distance and time per order.

**4. Self-service operational dashboard.** Merchants and the product team access a Quicksight dashboard tracking: processed orders, average time to pick, average time to pack, items scanned vs. manually entered, substitution rate, packages used (custom vs. default), and cost per order — with no engineering involvement required.

**5. Native Agentic Workflow integration.** Pick and Pack status events (picked, packed, carrier handoff) are injected into the VTEX order record via the Agentic Workflow entry point API — eliminating the duplicate order record model and making Pick and Pack a first-class participant in the order lifecycle.

### Conditions of Satisfaction

**Average time to pick reduced by ≥20%** for merchants adopting the scan-first flow, measured from before/after deployment using self-service dashboard data.

**Tier 1 merchants (Fareway, Rona, Grupo Ramos) fully operational by end of H2 2025** — all go-live blockers resolved, orders processing weekly.

**Self-service dashboard live and used** — merchants and the product team can independently answer operational questions (time to pick, substitution rate, cost per order) without engineering data pulls within 1 week of launch.

**New grocery merchant (Hiperideal) launched in Brazil by H2 2025.**

**[PM INPUT NEEDED: scan success rate baseline — what % of items are currently picked via scan vs. manual search? Target for scan-first flow?]**

### Non-Goals

**Warehouse management (WMS) capabilities** — Pick and Pack is optimized for store-based fulfillment operations. Full WMS capabilities (slotting, put-away, receiving, multi-zone warehouse management) are out of scope.

**Non-grocery verticals in Phase 1** — the scan-first redesign and AI features are optimized for grocery operations. Fashion, pharma, and construction use cases are a secondary phase; the initial product bets are calibrated to grocery's specific constraints.

**External carrier integrations** — label generation and carrier handoff at the end of the Pack flow depend on the Fulfillment module's carrier integrations. Pick and Pack triggers the carrier handoff; it does not own the carrier integration layer.

---

## High Level Phasing

1. **Phase 1 — Stabilization and Tier 1 unblock (H1 2025, Completed):** Migrated all accounts to v2 codebase. Reduced cost per order by 53%. Doubled processed order volume QoQ. Defined go-live plans for Fareway, Rona, and Grupo Ramos.

2. **Phase 2 — Scan-first alpha and self-service data (H2 2025):** Alpha release of scan-first picking module. Self-service Quicksight dashboard live. Tier 1 merchants (Fareway, Rona, Grupo Ramos) operational. New grocery merchant (Hiperideal) launched in Brazil.

3. **Phase 3 — AI features and Agentic Workflow integration (H1 2026):** AI-assisted substitution suggestions in production. AI picking route optimization. Pick and Pack status events injected into VTEX order timeline via Agentic Workflow entry points.

4. **Phase 4 — Expansion to non-grocery verticals (H2 2026+):** Extend Pick and Pack Experience to fashion, pharma, and construction — adapting the UX model for different picking environments (fewer items, higher item value, different substitution rules).

---

## Hotly Debated Topics

**1. How should the in-store experience for Sales App and Pick and Pack be unified?** The QBR includes a design goal for an Integrated In-Store Experience proposal covering both products. The overlap in use cases (store associates, physical inventory, in-store operations) must be defined before both products invest in divergent UX models.

**2. What is the right scope for AI substitution suggestions?** Substitution rules vary significantly by merchant (grocery allows brand substitution; pharma does not allow generic substitution; fashion requires size/color confirmation from the customer). The AI model must be designed with configurable substitution policies before it can be applied across merchant types.

**3. Agentic Workflow entry point dependency.** Injecting Pick and Pack status events into the OMS order timeline depends on the Agentic Workflow entry point API, which is in RFC stage. If the RFC is delayed, Pick and Pack will continue creating duplicate order records — the current workaround — until the API is available.

---

## FAQs

**Why is grocery the primary ICP when Pick and Pack also serves fashion and construction?** Grocery has the highest operational pressure (tight delivery windows, low margin, high volume) and the most direct correlation between picking speed and profitability. Getting picking time right for grocery — where every second counts — makes the product excellent for lower-pressure segments by default. Fashion and construction have different dominant problems (item variance, customer approval for substitutions) that are a second-order optimization.

**Why are we building a self-service dashboard now instead of focusing on picking UX?** The dashboard is a prerequisite for AI features. Without structured time-to-pick and scan rate data, there is no training signal for AI routing or substitution models. Additionally, the team currently cannot measure whether product changes improve operational performance — the dashboard closes a blind spot that is blocking data-driven iteration.

**How does the scan-first redesign affect the existing picking flow?** The scan-first module is an alpha — active merchants will not be migrated by default. The current flow remains available. The alpha allows new merchants and pilot associates to adopt the new experience, with A/B measurement against the current flow before any rollout decision.

---

## Appendix

### Related Assets

- [Scan-First Ideation (Figma)](https://www.figma.com/slides/3gStVPeRje6F92eYCzELWc/Minimum-Viable-Experience)
- [Pick and Pack Vision (in progress)](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [Integrated In-Store Experience Proposal (SalesApp + Pick and Pack)](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
