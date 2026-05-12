# Order Allocation Agent

## Problem Statement

Merchants with multiple suppliers (stores, franchises, DCs, carriers) face two core problems:

**1. Business misalignment:** Current allocation logic is rigid and diverges from merchant strategy.
- They overspend on shipping and handling.
- They lose revenue when franchise commissions and tax variables are ignored.
- Shoppers get slower deliveries, poor preparation, and unnecessary splits.
- Store and franchise managers lose trust when order distribution feels unfair.

**2. Lack of transparency — the "black box":** Supplier selection is unpredictable. Merchants don't understand how the algorithm works or how to align it with their business goals. As a result, merchants adopt costly workarounds: deactivating sellers, bypassing the algorithm entirely (churning to third-party orchestration tools), or applying manual hacks in VTEX Admin (manipulating freight tables, removing inventory, blocking splits with side effects on availability).

**Quantitative evidence:** Analyzing 13 omnichannel merchants over 15 days, the majority of orders had multiple eligible sellers — Vivara (89% of orders, up to 224 eligible sellers), Monte Carlo (87%, up to 46 sellers), Shoulder (84%, up to 76 sellers), C&A (51%, with only 41 of 300 stores active due to lack of allocation control).

---

## Vision

**3-Year Vision:** VTEX Order Allocation empowers merchants to run profitable and reliable operations by assigning each order task (picking, packing, invoicing, shipping) to the best possible supplier. The system self-adjusts to optimize toward merchants' business outcomes — reducing cost-to-serve, protecting margins, and preserving service quality and delivery commitments.

**1-Year Vision (2026):** Omnichannel B2C retailers operating multi-node fulfillment networks can now directly influence order allocation for the first time. They set desired outcomes, and the Order Allocation Agent applies cost-based logic to optimize fulfillment, reduce costs, and balance it with shopper experience. Test, simulate, and deploy without writing a single rule.

### Key Vision Pillars

1. **Asynchronous-first:** Allocation happens primarily post-purchase, after promises are made — without blocking checkout.
2. **Agentic, not reactive:** The system continuously optimizes on behalf of merchants, clarifying trade-offs across cost, delivery experience, and order distribution rather than passively executing merchant requests exactly as written.
3. **Outcome-driven, not feature-led:** Merchants set outcomes (lowest cost, fastest delivery, fewest splits, fairness across franchisees) — not dozens of toggles.

### High-Level Configuration Flow

1. Merchant describes allocation goals in natural language or via presets.
2. Agent interprets intent and asks targeted clarifying questions to resolve ambiguities and conflicts.
3. Agent translates intent into weighted cost configuration and presents a human-readable summary for merchant approval.
4. Merchant previews strategy impact on historical orders (what-if simulation).
5. Merchant publishes strategy to production.
6. Merchant monitors performance in near real-time; agent flags anomalies and may suggest improvements.

### Cost Model

```
Total Cost = Σ(Explicit Costs) + Margin × Σ(Weighted Normalized Costs)
```

Cost dimensions span three pillars:
- **Operational**: shipping, handling, geographic proximity, stockout risk, commission impact, taxes.
- **Shopper experience**: delivery speed, split penalty, preparation quality, supplier performance.
- **Business internal structure**: franchise group prioritization, round-robin fairness, operational capacity, network coverage.

### Phasing — Agency/Control Maturity Model

| Phase | Timeline | Focus |
|---|---|---|
| **Alpha** | In development — H1 2026 | Cost-based solver, Agent core configuration flow, Async OA foundation. Target ~5% cost reduction. |
| **Closed Beta** | End of H1 2026 — 1 merchant | Conversational interaction + simulation. Goals in natural language → cost objectives. |
| **Open Beta** | TBD | Expanded solver scope + partial autonomy. Commissions, risk, reliability. A/B testing. |
| **GA** | TBD | High-agency allocation. Full order orchestration within guardrails. |

---

## Target Users

**Primary persona:** Omnichannel Manager / Logistics Operations Manager at Tier 1 & 2 omnichannel B2C retailers operating multi-node fulfillment networks (DCs, stores, franchises — 10+ fulfillment nodes) with shipping-from-store capabilities.

**Use case archetypes:**
- **Reduce operational costs:** Minimize shipping + handling, factor in ICMS, commissions, aging inventory. *(e.g., FastShop, Stihl, C&A, Lizie)*
- **Preserve shopper experience:** Control splits, prioritize reliable sellers for key dates, honor delivery promises. *(e.g., Hering, OBI, Zona Sul)*
- **Honor business internal structure:** Preserve franchise priority, equitable distribution across stores, corporate grouping. *(e.g., Track & Field, Grupo CRM, Hope, Santa Lolla)*

---

## Success Metrics

| Metric | Target |
|---|---|
| Adoption | ≥ 1 merchant live in Closed Beta by end of H1 2026 |
| Cost-Efficiency | ~5% reduction in operational costs (shipping + handling) |
| Reliability | 0 SLA regressions / 0 broken Delivery Promises attributable to allocation |
| Performance | P95 allocation time < 60s post-purchase; P99 < 10s for express deliveries |
| Commercial impact | ARR valuation of ~$3.7M |

---

## Out of Scope

- Partial splits across sellers (v1)
- Multi-leg fulfillment (v1)
- Merchant-triggered manual reallocations (v1)
- Multiple simultaneous allocation strategies / segmentation rules (v1)
- Margin configurations with trade-offs across SLA, distance, and inventory (v1)
- Automated self-optimization without explicit merchant approval (Closed Beta)
