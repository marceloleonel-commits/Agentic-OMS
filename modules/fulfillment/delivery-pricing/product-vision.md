[Product Vision]: 3-Year Delivery Pricing — Fulfillment Price Control

| Status | Draft | Owner(s) | [Carolina Rodrigues](mailto:carolina.rodrigues@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Carolina Rodrigues](mailto:carolina.rodrigues@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines Delivery Pricing as the layer that decouples fulfillment price control from shipping tables. It covers a 3-year horizon and is intended to align Fulfillment, Order Allocation, Checkout, and Promotions teams around a new internal pricing service that enables merchants to set, segment, and optimize delivery prices independently of their carrier cost configuration. The primary objective is to unblock Americanas' freight calculation needs, enable the Async Purchase flow, and provide the pricing foundation required for item-level freight on PLP and Buy Box.*

---

| TL;DR |
|---|
| **Product/Area:** Fulfillment — Delivery Pricing |
| **Focus Task:** Enable merchants to control the delivery price shown to shoppers, independently of the carrier costs registered in shipping tables |
| **Persona:** Head of Logistics and Head of Digital at Tier 1 merchants with marketplace-heavy operations, external seller networks, and complex freight margin requirements (Americanas, US market merchants) |
| **Working title/Commercial Name:** Delivery Pricing |
| **Value headline:** Merchants can define fulfillment prices at cart, package, or method level — with segmentation by shipping zone, seller, category, and more — eliminating the pass-through of raw carrier costs to shoppers and enabling margin control over delivery. |
| **Mini-Press Release:** VTEX merchants today have no way to control the delivery price shown to shoppers at checkout — the platform passes through carrier table costs directly, blocking conversion optimization and margin strategies. For marketplace-heavy merchants like Americanas, this also means every freight calculation requires a synchronous external call at checkout, creating a critical failure point. VTEX is building Delivery Pricing: an internal pricing service that decouples fulfillment price from carrier cost, supports flexible rule-based pricing (fixed fee, markup, cost pass-through, free shipping), and enables post-purchase freight allocation without external calls. |
| **Opportunity Size:** Americanas is a direct-named dependency — their external seller protocol pricing is blocked without this. Async Purchase flow depends on Delivery Pricing as the new freight protocol for post-purchase allocation. [PM INPUT NEEDED: ARR impact from Americanas contract and US market merchant pipeline] |

---

## Problem / Opportunity

### 1. Narrative framing

VTEX merchants cannot control the delivery price displayed to shoppers at checkout. The platform takes carrier costs from shipping tables and passes them through as the shopper-facing freight price. This means merchants cannot implement conversion-oriented pricing strategies (e.g., cap delivery costs at a fixed fee, offer free shipping above a cart value, set markup on carrier costs), and cannot define different pricing for different segments, channels, or sellers.

For marketplace-heavy merchants with external sellers, this creates a deeper problem: external seller freight prices must be calculated by calling the seller's system in real time during checkout. When those systems are unavailable or slow, the entire purchase flow is blocked.

In practice, this means:
- A merchant cannot charge a fixed $5.99 delivery fee regardless of what the carrier charges — the shopper sees variable carrier costs that the merchant cannot standardize
- Americanas cannot calculate freight for external seller items without a synchronous call to each seller's API at checkout — a failure point that blocks orders when sellers are unavailable
- Item-level freight pricing on PLP and Buy Box is impossible without a reliable pre-computed pricing source — Intelligent Search found no scalable alternative to Delivery Pricing for this use case
- The Async Purchase flow (post-purchase order allocation) has no protocol to calculate freight for external sellers after the purchase — Delivery Pricing is the only path forward

Business impact:
- Conversion loss: merchants cannot offer free shipping above thresholds or fixed-fee delivery without platform support
- Order failure: Americanas loses orders when external seller API calls fail at checkout freight calculation
- Feature blockage: Item-level freight on PLP, Buy Box optimization, and Async Purchase all depend on Delivery Pricing as a prerequisite
- US market risk: US merchants require post-purchase external carrier calls (not inline at checkout) — a model that requires Delivery Pricing's architecture

### 2. Why Now

Delivery Pricing has become the single dependency unblocking three other H2 2025 initiatives:
1. **Americanas post-go-live blocker** — their external seller freight calculation requires Delivery Pricing's new protocol to remove external calls from the checkout path
2. **Async Purchase** — post-purchase order allocation needs a freight calculation protocol that does not require synchronous external calls; Delivery Pricing is that protocol
3. **Item-level freight on PLP and Buy Box** — Intelligent Search confirmed no alternative path exists; both initiatives are blocked until Delivery Pricing is available

The shared ETA across these three dependencies means any delay in Delivery Pricing directly threatens Black Friday 2025 readiness for Americanas and the Async Purchase closed beta.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Fixed delivery fee regardless of carrier cost | Merchant can set a fixed price per delivery method, overriding carrier table cost | Any merchant offering flat-rate shipping (e.g., $5.99 standard, $9.99 express) |
| External seller freight without synchronous call | Freight for external seller items is calculated without calling the seller's API at checkout | Americanas: eliminate external seller API dependency from checkout path |
| Post-purchase freight calculation for async allocation | Delivery Pricing provides freight data to Order Allocation after purchase, without requiring checkout session | Async Purchase flow: post-purchase allocation with freight confirmed via Delivery Pricing |
| Item-level freight on PLP | Each product on a listing page shows an accurate delivery price | Americanas + Intelligent Search: Buy Box optimization using delivery price as a criterion |
| Free shipping promotion rules | Merchant configures free shipping above cart value threshold, by category, or by segment | Standard merchant use case — cart-level free shipping |
| Freight margin control for US merchants | Merchants can call external carriers post-purchase for actual cost, set markup, and charge shopper a defined price | Dollar General, Fareway: US freight model requires post-purchase carrier pricing |

### 4. Customer Workarounds

- **1. Pass-through carrier costs directly.** Merchants accept that shoppers see the raw carrier rate. This fails because it removes merchant control over conversion-oriented pricing and creates unpredictable delivery costs for shoppers.

- **2. Promotions-based free shipping.** Merchants use the Promotions module to apply free shipping discounts as a workaround for pricing control. This fails because Promotions relies on SLA Types, not Delivery Options — when Delivery Options is active, promotions break. This is a documented critical dependency in the QBR.

- **3. External pricing engine integration.** Some merchants integrate custom external freight pricing engines via Checkout hooks. This fails at scale because it adds real-time external calls to the checkout path — the exact failure mode Delivery Pricing is designed to eliminate.

---

## Vision Statement

3-Year Vision: VTEX merchants will control every dimension of the delivery price their shoppers see — by method, segment, channel, and cart context — without the pricing being constrained by or dependent on what their carriers charge, and without requiring external calls at the checkout moment.

1-Year Vision (H2 2025 – H1 2026): Delivery Pricing is live as an internal service enabling merchants to set rule-based fulfillment prices, unblocking Americanas' external seller freight calculation, and providing the freight protocol required by the Async Purchase flow.

### Key Capabilities

**1. Rule-based fulfillment pricing.** Merchants define delivery prices using rules: fixed fee, cost markup, cost pass-through, free shipping, or maximum price cap. Rules are applied at cart level, package level, or delivery method level.

**2. Segmentation by multiple dimensions.** Pricing rules can be segmented by shipping zone, order value, cart weight, seller, sales channel (app, site, in-store), carrier, product category, SKU, or modal — enabling merchants to offer different delivery prices for different contexts.

**3. External seller freight without synchronous calls.** Delivery Pricing provides the freight calculation protocol for external sellers post-purchase, removing real-time seller API calls from the checkout critical path.

**4. Post-purchase freight allocation for Async Purchase.** Delivery Pricing integrates with the Async Order Allocation flow, providing confirmed freight costs after order placement without requiring a checkout session context.

**5. Item-level freight as a Buy Box and PLP signal.** Delivery Pricing exposes item-level freight data to Intelligent Search, enabling delivery price to be used as a Buy Box criterion and displayed on PLP pages.

### Conditions of Satisfaction

**Americanas external seller blocker resolved** — freight calculation for Americanas external seller items succeeds without synchronous seller API calls at checkout, with ≥99.5% success rate.

**Async Purchase freight protocol live** — Order Allocation can confirm freight costs post-purchase using Delivery Pricing for 1 pilot merchant in H2 2025 closed beta.

**Checkout dependency on Promotions/SLA Types removed** — merchants using Delivery Options can apply promotion-based free shipping via Delivery Pricing without regression on Promotions functionality.

**[PM INPUT NEEDED: merchant adoption target — how many merchants are expected to configure Delivery Pricing rules in H2 2025?]**

### Non-Goals

**Carrier contract management** — Delivery Pricing does not manage carrier rates, contracts, or operational costs. It takes carrier costs as input when needed (cost pass-through model) but does not replace the logistics configuration layer.

**Delivery Options configuration** — method definition and time targets are owned by Delivery Options. Delivery Pricing applies pricing rules to the methods defined there.

**Payment and order-level discounts** — Delivery Pricing covers delivery-specific fees. Cart-level order discounts, coupon codes, and payment method discounts are owned by Promotions and Checkout.

---

## High Level Phasing

1. **Phase 1 — Core service and Americanas unblock (H2 2025):** Internal Delivery Pricing service with fixed fee, cost markup, and external seller protocol support. Unblocks Americanas post-go-live blocker and provides the freight protocol for Async Purchase closed beta.

2. **Phase 2 — Full segmentation and Promotions migration (H1 2026):** Segmentation rules by zone, channel, seller, and cart context. Migrate free shipping promotions from SLA Types to Delivery Options — resolving the Promotions dependency on the legacy model.

3. **Phase 3 — AI-assisted pricing optimization (H2 2026+):** AI agents that suggest delivery price segmentation based on historical conversion data, freight margin, and operational patterns — helping merchants reduce operational effort in configuring optimal delivery pricing.

---

## Hotly Debated Topics

**1. Checkout must shift from SLA Types to Delivery Options as the price source.** This is a critical dependency — without this change in Checkout, Delivery Pricing cannot function as intended for Delivery Options users. Checkout changes have their own roadmap and team dependency. This must be formally agreed before H2 scope is locked.

**2. Promotions dependency.** For merchants using Delivery Options, promotions currently break because they reference SLA Types. Fixing this requires changes in both the Promotions module and Checkout. The ETA for this fix is tied to Delivery Pricing's own ETA — creating a risk of non-delivery before Black Friday 2025.

**3. Throttling rules for external pricing engines.** The 3Y vision allows merchants to call an external pricing engine for dynamic freight prices. Throttling rules (volume limits by merchant tier) must be defined to protect platform stability before this capability is opened.

---

## FAQs

**Is this just a new pricing module on top of existing shipping tables?** No. Delivery Pricing is a new internal service with its own pricing model. It replaces the pass-through of carrier costs as the source of shopper-facing freight prices. Merchants still configure carriers and shipping tables for operational logistics, but those costs are no longer the default display price at checkout.

**Why does Delivery Pricing block both Async Purchase and Buy Box?** Both features need item-level freight data that is not generated by real-time Checkout simulations. Delivery Pricing creates a pre-computable, stable freight data source that both can consume. Without it, both features have no reliable freight signal.

**What is the risk of missing Black Friday 2025?** If Checkout doesn't shift from SLA Types to Delivery Options before Black Friday, Americanas cannot use Delivery Options-based promotions — the current Promotions model will break for them. This is the highest-severity risk in the QBR callouts for H2 2025.

---

## Appendix

### Related Assets

- [Delivery Pricing RFC / Product Proposal](https://docs.google.com/document/d/1pMN9c9l4V9J1ZJ_zwn6Tyg4KfDZKiiu-NHbstwEUriI/edit)
- [3Y DOM Product Vision — Delivery Pricing section](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [Americanas Customer Need](https://docs.google.com/document/d/1lYU61tenQUGR3IPq6Qdk4TFDVI2VANOZR9ylw854rRk/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
