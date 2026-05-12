[Product Vision]: 3-Year Delivery Promise — Availability Engine

| Status | Draft | Owner(s) | [Camila Vidal](mailto:camila.vidal@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Camila Vidal](mailto:camila.vidal@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision is being created to align Tech Leadership, PMs, Engineering, and Design around the strategic direction for Delivery Promise as VTEX's pre-purchase availability engine. It looks ahead over a 3-year horizon and is intended to guide investment in availability accuracy, storefront integration, and open beta expansion. The primary objective is to establish Delivery Promise as the default availability source across all VTEX storefronts and seller types. The audience is invited to engage by reviewing the phasing priorities, challenging the eligibility criteria for open beta, and flagging dependency risks with Intelligent Search, Checkout, and FastStore.*

---

| TL;DR |
|---|
| **Product/Area:** Delivery Promise / Availability Engine |
| **Focus Task:** Surface accurate delivery dates and methods across storefront navigation, PDP, cart, and checkout |
| **Persona:** Ecommerce Operations Manager and Head of Digital at Tier 1 omnichannel merchants (50+ logistics locations, complex carrier configurations, marketplace and whitelabel seller mix) |
| **Working title/Commercial Name:** Delivery Promise |
| **Value headline:** Merchants using Delivery Promise see 93.2% cart availability vs. 92.32% platform average, +3.86% conversion uplift (Hering A/B test), and elimination of real-time Checkout simulation costs at scale. |
| **Mini-Press Release:** VTEX merchants lose revenue every day because their storefronts show products shoppers cannot actually receive — 24% of Tier 1 carts contain at least one unavailable item, and delivery dates are invisible during navigation despite being a proven conversion driver. VTEX is building Delivery Promise: a pre-computed, indexed availability engine that provides accurate delivery methods, dates, and suppliers for every product at any shopper location — surfaced instantly across PDP, PLP, cart, and checkout, with SLA-based filters and badges. |
| **Opportunity Size:** 100+ merchants on the waiting list as of Q3 2025. A/B test at Hering: +2.26% revenue, +3.86% conversion, +20% active products. Americanas: indexing success from 6% to 99%+, eliminating ~54 Checkout stock balance calls per SKU (~162k requests/minute saved). [PM INPUT NEEDED: full ARR opportunity estimate] |

---

## Problem / Opportunity

### 1. Narrative framing

Ecommerce Operations Managers at Tier 1 VTEX merchants cannot show shoppers which products are actually deliverable to their location, nor when they will arrive — until the shopper reaches checkout. This creates a gap between storefront and checkout availability parameters that results in shopping carts with undeliverable items, a poor shopper experience at the last step of the funnel, and lost conversion.

In practice, this means:
- 24% of carts among Tier 1 merchants contain at least one unavailable item *(Source: QBR H1 2025, 53 Tier 1 merchants, Oct–Nov period)*
- 28% of those unavailable items fail specifically due to `cannotBeDelivered` — no delivery route to the shopper's location — meaning they were never shoppable but appeared so in the storefront
- Merchants cannot display delivery time filters, SLA badges, or estimated delivery dates during PLP/PDP navigation — capabilities that Amazon, MercadoLivre, Magalu, Americanas, and Shopify all offer and that have documented positive effects on conversion

Business impact:
- Conversion loss at checkout from products that should have been filtered out during navigation
- Increased cart abandonment as shoppers discover unavailability only at the payment step
- Operational cost: every product page load requires real-time Checkout stock balance simulations — Americanas was making 54 calls per SKU, with only 6% indexing success, at ~162k requests/minute, before Delivery Promise integration

### 2. Why Now

Delivery Promise is already live in production with 6 merchants — including Americanas on 100% of traffic — and has a pipeline of 100+ merchants waiting to onboard. The A/B test results at Hering are public-facing evidence (presented as a case at VTEX Day 2025). The infrastructure is proven but eligibility is currently restricted: only merchants using Intelligent Search, not using VTEX Shipping Network, and with specific logistics configurations qualify. The window to scale is now: the platform architecture is ready for open beta, the demand signal is strong, and competitor platforms are actively positioning delivery transparency as a key storefront differentiation.

Without moving to Open Beta in H2 2025, VTEX risks:
- Losing pipeline momentum with 100+ waiting merchants who have already been told the feature is coming
- Ceding the "accurate availability" positioning to marketplace players that natively offer SLA filtering (MercadoLivre, Amazon)
- Technical drift as the architecture is ready but agency implementation guidelines have not been published, creating a long tail of bad implementations

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Surface accurate delivery dates in storefront navigation | Delivery date shown on PLP/PDP is consistent with what checkout confirms | Americanas: display same-day/next-day delivery badges on PLP for whitelabel sellers |
| Filter products by delivery SLA | Shoppers can filter PLP by delivery method (express, standard, pickup) | Hering: SLA filter available on 100% of traffic — A/B test shows +3.86% conversion |
| Eliminate real-time Checkout simulations during indexing | Catalog indexing success rate >99% without throttling on Checkout | Americanas: 6% → 99%+ indexing success rate after DP integration |
| Enable shoppable product coverage for whitelabel sellers | Whitelabel seller inventory visible and shoppable in storefront | 12% increase in shoppable products for merchants using Delivery Promise (Q2 2025 data) |
| Self-serve activation for agency-led storefronts | Agencies can implement Delivery Promise without bespoke VTEX support | Open Beta rollout goal: documented implementation guidelines for Store Framework, FastStore, headless |

### 4. Customer Workarounds

Today, merchants try to approximate delivery visibility with three approaches, all of which fall short:

- **1. Static delivery banners on PDP.** Merchants display fixed text like "Delivers in 3–5 business days" regardless of the shopper's location or seller configuration. This fails because the claim is not accurate for all postal codes or seller types, and cannot reflect real-time stock or carrier constraints.

- **2. Rely on checkout simulation at checkout entry.** Merchants accept that delivery information only appears when the shopper reaches checkout and enters their postal code. This fails because it requires the shopper to have already committed to a product before learning it cannot be delivered to them — the most damaging point in the funnel for abandonment.

- **3. Custom integration with external availability APIs.** Large Tier 1 merchants (Americanas) built their own availability layers calling Checkout stock balance APIs per SKU at indexing time. This fails at scale: Americanas had 6% indexing success due to Checkout throttling, meaning 94% of SKUs were indexed without delivery route validation.

---

## Vision Concepts

**Delivery Promise** — A pre-computed, location-aware availability record for each product, stating its delivery method, estimated date, and supplier. Indexed by Intelligent Search and consumed by Checkout, enabling consistent availability across all stages of the buying journey.

**Delivery Options** — The merchant-configured set of delivery methods and time targets (e.g., "express = ≤1 day", "standard = 2–5 days", "pickup = same day") used by Delivery Promise to compress and discretize availability signals for storefront display.

**Cart Availability** — The percentage of carts where all added items have a valid delivery route. The north star metric for Delivery Promise adoption impact. Baseline: 92.32% platform-wide; 93.2% for merchants using Delivery Promise (Q2 2025).

---

## Vision Statement

3-Year Vision: VTEX will be the only commerce platform where every product shown in a storefront is guaranteed to be deliverable to the shopper's location, with accurate delivery dates and SLA options visible from the first page load — making the storefront the most trustworthy and conversion-optimized buying surface in the merchant's portfolio.

1-Year Vision (H2 2025 – H1 2026): Delivery Promise reaches Open Beta with 12+ merchants across Store Framework, FastStore, and headless storefronts, with SLA filters and badges natively enabled on PLP and PDP, and a documented self-serve implementation path for agencies.

### Key Capabilities

**1. Pre-computed availability indexing.** Given a shopper's postal code or geocoordinates, VTEX computes and indexes delivery availability (SKUs, method, date, supplier) before the shopper arrives — not during their session. Merchants get instant storefront availability without real-time Checkout simulation costs.

**2. SLA-based storefront filters and badges.** Merchants can natively enable delivery method filters (express, standard, pickup) and SLA badges (e.g., "Arrives tomorrow") on PLP and PDP across Store Framework, FastStore, and headless storefronts — without custom development.

**3. Consistent availability across the buying journey.** The same delivery promise shown during navigation is preserved through cart and checkout — no gaps between storefront and checkout availability parameters.

**4. Coverage for all seller types.** Delivery Promise supports owned warehouses, whitelabel stores, 3P sellers, external OMS, and external sellers — ensuring merchants with complex seller configurations get complete shoppable product coverage.

**5. Self-serve onboarding and agency implementation.** Merchants and their agencies can activate and configure Delivery Promise through documented guidelines and a self-serve onboarding service, without requiring bespoke VTEX implementation support.

### Conditions of Satisfaction

**Cart Availability at ≥94%** for all merchants actively using Delivery Promise within 2 quarters of activation — compared to 93.2% current average for DP merchants.

**Indexing success rate ≥98%** for all merchants in Open Beta — meaning Delivery Promise data is successfully computed and indexed for ≥98% of active SKUs per merchant.

**12+ merchants in Open Beta by end of H2 2025** across at least two storefront technologies (Store Framework + FastStore or headless).

**Agency implementation without VTEX professional services** for ≥80% of Open Beta activations — validated by self-serve onboarding completion data.

**Storefront/checkout consistency** — delivery promise shown in PLP/PDP matches what is confirmed at checkout for ≥99.5% of sessions, verified by sampling.

### Non-Goals

**Delivery fee / fulfillment pricing** — Delivery Promise does not determine what merchants charge shoppers for shipping. That is owned by the Delivery Pricing feature in the Fulfillment module.

**Cart-level availability (basket context)** — Delivery Promise computes availability per individual item, not per basket. Cart-level rules (e.g., "express delivery only applies to orders under X items") are not in scope for this vision. Shoppers may encounter edge cases at checkout for basket-level constraints.

**Transportation and carrier management** — Delivery Promise does not manage carrier configurations, shipping policies, or logistics setup. Those are owned by the Fulfillment module.

**Pricing and catalog attributes** — Delivery Promise does not own product price or catalog data (images, brand, category). It depends on Intelligent Search and Catalog for these.

**External OMS replacement** — Delivery Promise works alongside external OMS configurations. It does not replace or replicate external OMS sourcing logic.

---

## High Level Phasing

1. **Phase 1 — Closed Beta (Completed, H1 2025):** Delivery Promise live in production with 6 merchants including Americanas (100% traffic) and Hering. Proved the availability indexing model, eliminated real-time Checkout simulations for participating merchants, and validated conversion impact (+3.86% at Hering). Established the control/data plane separation (p99 latency -10%, timeout errors -90%).

2. **Phase 2 — Open Beta (H2 2025):** Expand to 12+ merchants with native SLA filter and badge support across Store Framework, FastStore, and headless storefronts. Publish implementation guidelines for agencies. Cover uncovered seller scenarios (external sellers, VTEX Shipping Network exclusion remains). Deliver Onboarding Service for self-serve activation.

3. **Phase 3 — General Availability (H1 2026):** Remove eligibility restrictions. Support all seller types including external sellers and VTEX Shipping Network. Deliver Delivery Promise as the default availability source for catalog indexing across all VTEX accounts — replacing Checkout simulations as the indexing mechanism.

4. **Phase 4 — Intelligence layer (H2 2026+):** Use Delivery Promise data to drive intelligent features — seller selection in Order Allocation (exclude sellers that cannot deliver), Google Shopping integration (send availability directly to Google without Checkout simulations), Buy Box optimization (delivery price and SLA as Buy Box criteria), and Sales App availability filters.

---

## Hotly Debated Topics

**1. What are the exact eligibility criteria for Open Beta?** The QBR states merchants must use Intelligent Search, must not use VTEX Shipping Network, and must have fewer than X logistics updates/day — but the threshold for X is not yet defined. This needs to be resolved before Open Beta launch communications.

**2. How should basket-level constraints be communicated to shoppers?** Delivery Promise computes per-item availability. When a basket-level rule invalidates a promised SLA (e.g., express delivery only for orders under 5 items), the shopper sees a discrepancy at checkout. The UX for this is not yet defined.

**3. Should external sellers be in scope for Open Beta?** The current architecture handles external sellers through a new pricing protocol (Delivery Pricing). Until Delivery Pricing is stable, external seller availability via Delivery Promise is incomplete. Decision needed: partial support with known gaps, or full exclusion from Open Beta scope.

---

## FAQs

**Why can't merchants just use Checkout simulations at indexing time?** They already do — and it fails at scale. Americanas was making 162k simulation requests/minute at 6% success, due to Checkout throttling. Pre-computation via Delivery Promise removed that bottleneck entirely and brought indexing success to 99%+. The cost of maintaining simulation-based indexing grows with catalog size; Delivery Promise's cost is fixed at indexing time.

**Is Delivery Promise only relevant for large Tier 1 merchants?** The problem exists at every scale — any merchant with a logistics configuration (more than one warehouse or pickup point, or any carrier SLA dependency) has the storefront/checkout availability gap. The 100+ merchant pipeline includes mid-market accounts. Tier 1 was the starting point because they have the most to gain from eliminating per-SKU simulation costs.

**Why does this depend on Intelligent Search?** Delivery Promise data is indexed and served through VTEX Intelligent Search. Merchants not using Intelligent Search would require a separate indexing pathway — adding significant engineering complexity. The Open Beta eligibility requirement (must use Intelligent Search) is a deliberate scope decision, not a long-term constraint. Phase 3 may expand to other storefront architectures.

**What happens if Delivery Promise data is stale when a shopper adds to cart?** Delivery Promise is pre-computed and has a refresh frequency. For events that change availability (stock updates, shipping policy changes, store capacity limits), the system must recompute within a defined SLA. The acceptable staleness threshold is not yet formally defined — this is an open condition of satisfaction to resolve before GA.

---

## Appendix

### Related Assets

- [3Y DOM Product Vision](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [Delivery Promise Key Capabilities Spreadsheet](https://docs.google.com/spreadsheets/d/15KVAJzCUqo8Xut0Qfm0LGM2gVjOiGzAoS3tOvH_u0sM/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
