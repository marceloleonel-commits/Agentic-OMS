[Product Vision]: 3-Year Async Purchase — Resilient Order Flow

| Status | Draft | Owner(s) | [Camila Vidal](mailto:camila.vidal@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Camila Vidal](mailto:camila.vidal@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines the strategic direction for Async Purchase — the initiative to decouple VTEX's checkout and order allocation flow from synchronous dependencies on external systems. It covers a 3-year horizon and is intended to align Engineering, Product, and Payments teams around the architectural shift toward asynchronous order completion. The primary objective is to eliminate lost orders caused by real-time system dependencies failing at the moment of purchase. The audience is invited to engage by reviewing the dependency map with Checkout, Payments, and SalesApp, and by flagging risks in the closed beta scope.*

---

| TL;DR |
|---|
| **Product/Area:** Order Allocation — Async Purchase |
| **Focus Task:** Complete a purchase successfully even when synchronous external dependencies (logistics, external sellers, inventory) are unavailable at the moment of checkout |
| **Persona:** Head of Ecommerce at Tier 1 omnichannel merchants operating with external OMS, marketplace sellers, or offline/hybrid sales channels (SalesApp) where real-time availability calls fail under load or connectivity constraints |
| **Working title/Commercial Name:** Asynchronous Purchase / Async Order Allocation |
| **Value headline:** Merchants can guarantee purchase completion during peak load, external system outages, and omnichannel scenarios where synchronous logistics calls are not feasible. |
| **Mini-Press Release:** VTEX merchants lose orders today when a logistics API call, an external seller response, or an inventory check fails at checkout — even if the order could have been fulfilled. VTEX is building Async Purchase: a resilient order flow that captures the purchase commitment immediately and completes allocation, pricing, and supplier assignment asynchronously after order creation, decoupling conversion from real-time system availability. |
| **Opportunity Size:** [PM INPUT NEEDED: ARR or GMV at risk from failed synchronous calls — estimate based on Americanas, C&A, and SalesApp offline scenarios] |

---

## Problem / Opportunity

### 1. Narrative framing

VTEX's current checkout flow requires all logistics, pricing, and seller confirmation calls to succeed synchronously before an order can be placed. When any upstream dependency is unavailable — an external seller's API, VTEX's own logistics service during a spike, or inventory data during an omnichannel operation — the purchase fails entirely, even if the merchant has the inventory and the willingness to fulfill.

In practice, this means:
- **VTEX service outages:** If the Delivery Promise or Logistics service degrades during peak traffic (Black Friday, flash sales), checkout blocks even for items that could be fulfilled via local store inventory — as in SalesApp offline scenarios
- **External seller protocol failures:** Marketplace-heavy merchants like Americanas route orders through external seller protocols that must respond synchronously at checkout. A timeout or API error causes the entire order to fail, not just the affected seller's items
- **Omnichannel async scenarios:** C&A operates Ship-from-Store flows where inventory confirmation from physical stores cannot always happen in real time — creating a native need for post-purchase allocation

Business impact:
- Orders lost permanently at checkout when they could have been recovered post-placement with a short delay
- Merchants absorb the full GMV cost of upstream system failures that are outside their control
- SalesApp cannot support full offline mode — store associates lose sales when connectivity drops

### 2. Why Now

The Delivery Promise initiative (H2 2025) is creating the architectural prerequisite: Delivery Pricing, Delivery Options, and the post-purchase allocation RFC are being designed now. This is the window to build async order allocation as a first-class capability. Waiting means building synchronous flows on top of new architecture, which will need to be refactored again.

Additionally, Dollar General (US merchant using FreeTrial) and C&A have active omnichannel scenarios that require async order allocation. These are pilot-ready accounts for closed beta in H2 2025. If the RFC and initial implementation are not completed this cycle, these go-lives are delayed.

### 3. Use Cases

| Business Need | Business Criteria | Use Cases |
|---|---|---|
| Complete purchase when external logistics call fails | Order is confirmed to shopper; allocation completes within defined SLA post-purchase | Americanas: external seller protocol timeout no longer blocks order creation |
| Support offline SalesApp order capture | Store associate can place an order without live VTEX connectivity | SalesApp: local inventory sale during connectivity drop completes as async order |
| Omnichannel Ship-from-Store with post-purchase allocation | Store inventory confirmed and allocated after order is placed, within merchant-defined SLA | C&A: omnichannel orders allocated to nearest store asynchronously |
| Async order allocation for pilot merchants | 1 pilot merchant validates end-to-end async allocation flow in H2 2025 | Dollar General: orders allocated post-purchase using Delivery Pricing as the new freight protocol |

### 4. Customer Workarounds

- **1. Retry logic at checkout.** Merchants configure retry attempts on failed logistics calls before surfacing an error to the shopper. This fails because it increases checkout latency (each retry adds seconds), and still produces an order failure if retries exhaust — at which point the shopper has already waited.

- **2. Reduce external seller scope at checkout.** Merchants limit which seller types go through external protocols to reduce failure surface. This fails because it excludes valid inventory sources and reduces shoppable product coverage — a direct trade-off against availability.

- **3. Accept lost orders as a cost of operations.** Some merchants treat failed checkout calls as an unavoidable loss rate, particularly during peak. This is not a solution — it is an accepted failure with no recovery path.

---

## Vision Statement

3-Year Vision: VTEX will guarantee purchase completion for every shopper who commits to buying, regardless of the real-time availability of external logistics, seller, or pricing systems — by making asynchronous order allocation the default post-purchase model.

1-Year Vision (H2 2025 – H1 2026): Async Order Allocation reaches closed beta with 1 pilot merchant, covering the core scenario where a purchase completes synchronously at checkout and allocation is confirmed asynchronously post-placement using Delivery Pricing as the freight protocol.

### Key Capabilities

**1. Synchronous purchase commitment, asynchronous fulfillment confirmation.** The checkout captures the shopper's payment and order intent immediately. Supplier assignment, freight confirmation, and inventory reservation happen asynchronously after order creation, within a merchant-defined SLA.

**2. Post-purchase allocation using cost-to-serve optimization.** After purchase, the Order Allocation engine selects the best supplier combination based on configurable business objectives (cost, SLA, proximity) — without being constrained by the synchronous checkout response time.

**3. Graceful handling of external seller protocol failures.** When an external seller API is unavailable at checkout, the purchase proceeds with a pending allocation state. The allocation engine attempts external seller confirmation post-purchase and falls back to alternative suppliers if needed within the defined SLA.

**4. SalesApp offline order capture.** Store associates can complete a sale using local inventory data even when VTEX connectivity is degraded. The order is synchronized and allocated when connectivity is restored.

**5. Merchant-configurable allocation SLA.** Merchants define the maximum time window between order placement and allocation confirmation. Shoppers receive communication if allocation takes longer than the threshold.

### Conditions of Satisfaction

**1 pilot merchant live on Async Order Allocation in H2 2025** — end-to-end: synchronous purchase + asynchronous allocation confirmed within merchant-defined SLA.

**Zero order loss during allocation window** — orders that enter async allocation are recovered (allocated or explicitly cancelled) within the defined SLA for ≥99% of cases.

**Checkout latency unchanged** — async purchase must not add measurable latency to the synchronous checkout confirmation step (p95 checkout response time held constant).

**[PM INPUT NEEDED: GMV recovery metric — what % of previously-lost orders are expected to be recovered post async launch?]**

### Non-Goals

**Checkout UI redesign** — this vision does not change the shopper's checkout experience. The async flow is invisible at the moment of purchase; the shopper receives a standard order confirmation.

**Payments async flows** — payment capture remains synchronous in this vision. Async Purchase covers logistics and allocation; payment orchestration is owned by the Payments vertical.

**Returns and exchanges** — post-purchase modifications and return flows are owned by the Order Management module's Returns and Exchanges feature.

**Full offline SalesApp mode (beyond initial scope)** — the initial closed beta targets a specific async allocation scenario. Full offline SalesApp capability is a subsequent phase dependent on broader mobile architecture work.

---

## High Level Phasing

1. **Phase 1 — RFC and architecture alignment (H1 2025, Completed):** Designed the asynchronous Order Allocation RFC. Identified dependencies on Delivery Pricing, Contextual Pricing, SOS, and Checkout. Validated the approach with the engineering team.

2. **Phase 2 — Closed Beta with 1 pilot merchant (H2 2025):** Implement async order allocation and enable for Dollar General or equivalent pilot. Cover the core scenario: synchronous checkout → async supplier assignment via new Delivery Pricing freight protocol. Validate SLA adherence and order recovery rate.

3. **Phase 3 — Expand to omnichannel and external seller scenarios (H1 2026):** Cover C&A-style Ship-from-Store async flows, external seller protocol failure recovery, and SalesApp offline capture. Expand to 3–5 merchants across different seller configurations.

4. **Phase 4 — Default async model (H2 2026+):** Async Order Allocation becomes the default for all VTEX post-purchase flows. Synchronous allocation is retained only for scenarios requiring real-time pricing from external engines.

---

## Hotly Debated Topics

**1. What happens if allocation fails within the SLA?** If the async allocation engine cannot find a valid supplier within the merchant-defined window, does the order auto-cancel? Does the merchant get a task in VTEX DO to manually allocate? The failure handling model is not yet defined and is a prerequisite for the Closed Beta RFC.

**2. Payments dependency risk.** The QBR flags that new Payment dependencies may arise during H2 implementation, given Payments bandwidth constraints. The boundary between Async Purchase (logistics) and any async payment capture flow must be explicitly agreed with the Payments team before closed beta scope is finalized.

**3. Shopper communication model.** If allocation confirmation is delayed, what does the shopper receive and when? The communication design (email, WhatsApp via Weni, order status page) is not yet defined but is a requirement for a coherent shopper experience in the async flow.

---

## FAQs

**Why not fix the synchronous call reliability instead?** External seller APIs and logistics systems are outside VTEX's control. Building redundancy for third-party uptime is not scalable. Async Purchase solves the root cause — the architecture assumes synchronous confirmation where none is required.

**Is this just for merchants with complex logistics?** No. Any merchant using external sellers, marketplace protocols, or SalesApp can benefit. The Closed Beta starts with a specific scenario (Dollar General), but the architecture is general-purpose.

**What if the shopper checks their order status before allocation completes?** The order confirmation screen and order history must show a clear "being processed" state during the allocation window. This is a required product design deliverable for Phase 2 — it is not in scope to leave the shopper with no status indication.

---

## Appendix

### Related Assets

- [Async Order Allocation RFC](https://docs.google.com/document/d/1a6cjQqNsAxLFTBj5dvfmHGecMkC1sAH4H67mAAWQ2KE/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [3Y DOM Product Vision](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Initial draft created for Chapter OS repo setup |
