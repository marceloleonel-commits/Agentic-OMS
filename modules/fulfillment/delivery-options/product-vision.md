[Product Vision]: 3-Year Delivery Options — Fulfillment Configuration Layer

| Status | Draft | Owner(s) | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines Delivery Options as the merchant-facing configuration layer that enables Delivery Promise. It covers a 3-year horizon and is intended to align Fulfillment, Order Allocation, and Storefronts teams on how merchants express their delivery offering to shoppers. The primary objective is to give merchants full control over which delivery methods and time targets are displayed during navigation and checkout, acting as the discretizer that makes Delivery Promise scalable and accurate.*

---

| TL;DR |
|---|
| **Product/Area:** Fulfillment — Delivery Options |
| **Focus Task:** Allow merchants to define and manage the delivery methods and time targets they want to offer shoppers, as the configuration input for Delivery Promise |
| **Persona:** Logistics Operations Manager at Tier 1 omnichannel merchants configuring delivery experiences across multiple sellers, warehouses, and storefronts |
| **Working title/Commercial Name:** Delivery Options / Fulfillment Catalog |
| **Value headline:** Merchants control exactly which delivery options are shown to shoppers — standardizing their fulfillment offering and enabling Delivery Promise to express accurate, filtered availability at scale. |
| **Mini-Press Release:** VTEX merchants have no standardized way to define which delivery methods and time targets to surface to shoppers. The platform exposes raw logistics configuration — shipping policies, carrier SLAs, dock schedules — directly to storefronts, leading to inconsistent delivery displays and making it impossible for Delivery Promise to compress availability data accurately. VTEX is building Delivery Options: a merchant-managed configuration layer where operations teams define named delivery methods (e.g., "Express — next day", "Standard — 2–5 days", "Pickup — same day") and time targets, which become the structured input that Delivery Promise indexes, filters, and displays. |
| **Opportunity Size:** Delivery Options is a required enabler for Delivery Promise Open Beta. Its adoption is bounded by the Delivery Promise merchant pipeline (100+ merchants). [PM INPUT NEEDED: standalone opportunity estimate if any] |

---

## Problem / Opportunity

### 1. Narrative framing

Logistics Operations Managers at VTEX merchants cannot define a standardized delivery experience for their storefronts. The platform's current logistics model exposes raw SLA configurations — carrier-level, per-shipping-policy, per-dock — directly to checkout. This means the delivery time shown to shoppers is a direct reflection of carrier and logistics setup, with no layer for merchants to define customer-facing delivery methods, group SLAs, or standardize how delivery options appear across channels.

In practice, this means:
- A merchant with 3 carriers and 5 shipping policies may show 8 different delivery options at checkout, with no way to group them into "Express" and "Standard" for the shopper
- Delivery Promise cannot compute precomputed availability without a merchant-configured set of time targets to discretize delivery times — without Delivery Options, the engine has no defined buckets to compute against
- Merchants cannot define which delivery methods are eligible for Delivery Promise indexing, creating edge cases where partial or inconsistent data is indexed

Business impact:
- Delivery Promise is not activatable without Delivery Options configuration — it is a hard dependency for Open Beta eligibility
- Merchants with complex logistics (many carriers, many sellers, many docks) cannot simplify their delivery display without this layer
- Configuration errors in raw logistics settings propagate directly to shoppers, since there is no abstraction layer to validate or standardize the display

### 2. Why Now

Delivery Options is a required unblock for Delivery Promise Open Beta in H2 2025. Without it, merchants cannot configure the time targets that Delivery Promise uses for availability compression. The dependency is hard: Delivery Promise eligibility criteria require merchants to have Delivery Options configured before activation.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Define named delivery methods for storefronts | Merchant can create "Express", "Standard", "Pickup" options with time targets independent of carrier configuration | Any Delivery Promise merchant: configure delivery methods before DP activation |
| Control which delivery options appear at checkout | Merchant can enable/disable specific options per sales channel or storefront | Merchants with multi-channel setups controlling B2B vs. B2C delivery display |
| Use Delivery Options as DP availability discretizer | Delivery Promise uses merchant-configured time targets as the buckets for precomputed availability | Required for all 12+ merchants in Delivery Promise Open Beta |

### 4. Customer Workarounds

- **1. Configure shipping policies directly to mimic desired options.** Merchants create multiple shipping policies to approximate "Express" and "Standard" tiers at the carrier level. This fails because it multiplies logistics configuration complexity, makes changes expensive, and does not create a stable abstraction that Delivery Promise can index reliably.

- **2. Storefront-level display logic.** Merchants apply frontend filtering to group or rename delivery options in the storefront. This fails because it is storefront-specific, breaks with checkout (which shows raw SLA data), and is not compatible with Delivery Promise's precomputed indexing model.

---

## Vision Statement

3-Year Vision: Every VTEX merchant will define their delivery experience in a single, standardized configuration — independent of their internal logistics setup — and that configuration will propagate accurately and consistently across navigation, checkout, and all downstream systems including Delivery Promise and Delivery Pricing.

1-Year Vision (H2 2025 – H1 2026): Delivery Options is the required configuration step for all Delivery Promise Open Beta merchants, with a stable API and admin UI that allows merchants to define named delivery methods and time targets.

### Key Capabilities

**1. Named delivery methods with time targets.** Merchants define customer-facing delivery options (e.g., "Express — next day", "Standard — 2–5 days", "Pickup — same day") and configure the time targets for each, independent of the underlying carrier or SLA configuration.

**2. Delivery Promise input layer.** Delivery Options serves as the structured input to Delivery Promise — defining the availability buckets that the engine uses to precompute and index availability per product and location.

**3. Channel-level configuration.** Merchants can enable or disable specific delivery options per sales channel, storefront, or seller, allowing different delivery experiences for B2B, B2C, and marketplace channels from a single configuration.

**4. Delivery Pricing integration.** Delivery Options integrates with Delivery Pricing as the source of available methods for which pricing rules can be applied — ensuring merchants configure delivery methods once and apply pricing separately.

### Conditions of Satisfaction

**100% of Delivery Promise Open Beta merchants** have Delivery Options configured as a prerequisite to activation.

**Delivery Promise indexing accuracy** — when Delivery Options time targets are configured, Delivery Promise availability buckets match merchant-configured targets for ≥99% of indexed SKUs.

**[PM INPUT NEEDED: admin UI adoption metric — what % of merchants configure via UI vs. API?]**

### Non-Goals

**Delivery fee / fulfillment pricing** — Delivery Options defines methods and time targets; it does not define the price charged to shoppers. That is owned by Delivery Pricing.

**Carrier and logistics management** — Delivery Options is an abstraction layer over existing logistics configuration. It does not replace shipping policy, carrier, or dock management.

**Shopper-facing delivery experience design** — how delivery options are displayed in the storefront (badges, filters, labels) is owned by the Delivery Promise feature and the storefront technology teams.

---

## High Level Phasing

1. **Phase 1 — API and core configuration (H2 2025):** Deliver Delivery Options API and basic admin UI enabling merchants to define named delivery methods and time targets. Required as an Open Beta prerequisite for all 12+ Delivery Promise merchants.

2. **Phase 2 — Channel-level configuration and Delivery Pricing integration (H1 2026):** Enable per-channel delivery option visibility. Connect Delivery Options as the method source for Delivery Pricing rule configuration.

3. **Phase 3 — Self-serve and analytics (H2 2026+):** Full self-serve configuration with validation tooling. Delivery Options usage analytics — which options are activated, conversion by method, shopper selection patterns.

---

## Hotly Debated Topics

**1. How should time targets relate to existing SLA configurations?** Delivery Options introduces a new abstraction — but merchants already have SLA-level data in shipping policies. The migration path and the relationship between existing SLA data and new time targets must be clearly defined to avoid configuration duplication.

---

## FAQs

**Is Delivery Options a new product or just a rename of existing functionality?** It is a new configuration layer. VTEX currently has shipping policies with SLA fields — Delivery Options creates a merchant-managed abstraction on top that is purpose-built for Delivery Promise and customer-facing display, rather than carrier-level operational configuration.

**Do merchants have to migrate their existing logistics setup?** No. Delivery Options maps to existing logistics configuration. Merchants define time targets that reference their existing SLAs; they do not need to rebuild their carrier or dock setup.

---

## Appendix

### Related Assets

- [3Y DOM Product Vision — Delivery Options section](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
