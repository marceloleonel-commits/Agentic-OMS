[Product Vision]: 3-Year Asynchronous Purchase — Resilient Order Flow

| Status | Draft | Owner(s) | [Camila Vidal](mailto:camila.vidal@vtex.com) |
|---|---|---|---|
| Last Updated | May 2026 | Approver(s) | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| Created | May 2026 | Author(s) | [Camila Vidal](mailto:camila.vidal@vtex.com) |
|  |  | Channel | #dom-product-vertical |

---

*This vision defines the strategic direction for Asynchronous Purchase — the initiative to decouple VTEX's order creation flow from synchronous dependencies on external seller systems. It covers a 3-year horizon and is intended to align Product, Engineering, and Payments teams around the architectural shift. The primary objective is to eliminate lost orders caused by real-time system dependencies failing at the moment of purchase.*

---

| TL;DR |
|---|
| **Product/Area:** Order Allocation — Asynchronous Purchase |
| **Focus Task:** Complete a purchase successfully even when external seller systems are unavailable at the moment of checkout |
| **Persona:** Head of Ecommerce at Tier 1 omnichannel merchants operating with external sellers, marketplace protocols, or hybrid sales channels (SalesApp) where real-time availability calls fail under load or connectivity constraints |
| **Working title/Commercial Name:** Asynchronous Purchase |
| **Value headline:** Merchants guarantee purchase completion during peak load, external system outages, and omnichannel scenarios — orders are no longer lost because a seller's API was unavailable at the exact moment of checkout. |
| **Mini-Press Release:** VTEX merchants lose orders today when a seller's system fails to respond at checkout — even if the item could have been fulfilled. Asynchronous Purchase separates the shopper's purchase commitment from the backend order creation with each seller. The shopper completes payment and receives confirmation immediately. Seller orders are created asynchronously, with automatic retry and reallocation if a seller's system is unavailable. Conversion no longer depends on real-time seller uptime. |

---

## Problem / Opportunity

### 1. Narrative framing

Every VTEX order today requires all seller systems to respond successfully — in real time — before the purchase can complete. If any seller's PlaceOrder API is slow, throttled, or down, the entire purchase fails. The shopper sees an error. The merchant loses the sale. This happens regardless of whether the merchant has inventory and the full ability to fulfill the order.

In practice, this surfaces in three distinct scenarios:

- **Peak traffic failures.** During Black Friday or flash sales, seller APIs degrade under load. A timeout from one seller blocks every order that includes that seller's items — including orders where other sellers are fully operational.
- **Marketplace seller protocol failures.** Merchants like Americanas route items through external seller protocols that must respond synchronously at checkout. A single timeout causes the full order to fail, not just that seller's items.
- **Omnichannel async scenarios.** Merchants like C&A operate Ship-from-Store flows where inventory confirmation from physical stores cannot reliably happen in real time. There is no native support for placing an order and confirming store allocation post-purchase.

The root cause is architectural: the current order creation flow is entirely synchronous, regardless of how many sellers are involved or whether their real-time response is actually necessary to confirm the purchase.

### 2. Why Now

The Order Allocation engine is being redesigned. This is the right window to embed asynchronous order creation as a first-class capability — building it in now costs far less than retrofitting it later onto synchronous architecture. Merchants with active omnichannel use cases (C&A, Dollar General) are pilot-ready for closed beta. The target is 1 pilot merchant live by end of H1 2026.

### 3. Use Cases

| Business Need | Business Criteria | Example |
|---|---|---|
| Complete purchase when a seller's system is unavailable | Order is confirmed to shopper; seller order created within defined SLA post-purchase | Americanas: external seller protocol timeout no longer blocks order creation |
| Reduce checkout latency | placeOrder no longer waits on seller API round-trips | Any merchant with multiple sellers at checkout |
| Support omnichannel Ship-from-Store | Store inventory allocated after order is placed, within merchant-defined SLA | C&A: omnichannel orders allocated to nearest store asynchronously |
| Offline SalesApp order capture | Store associate completes a sale without live VTEX connectivity | SalesApp: order synchronized and fulfilled when connectivity is restored |

### 4. What Changes for Merchants and Shoppers

**What stays the same:** The shopper's checkout experience is unchanged. Payment capture remains synchronous. The shopper completes checkout and receives immediate confirmation that their purchase is committed.

**What changes:** The response the shopper receives at Order Placed refers to an *order group* — a confirmed purchase — rather than fully-formed individual orders. Seller orders are created in the background. VTEX merchant storefronts and headless applications will need to adapt the Order Placed screen to reflect this.

**Resilience model:** If a seller's system fails to accept the order post-purchase, the platform retries automatically. If retries exceed a configurable threshold, the order is either reallocated to an alternative seller or cancelled — depending on merchant configuration. Merchants gain visibility into this recovery flow.

**Inventory trade-off:** With asynchronous order creation, stock reservation for seller items happens after purchase rather than at the moment of checkout. In rare cases, an item could be committed to a shopper and then found to be unavailable at reservation time — similar to how availability system fallback scenarios behave today. This trade-off is acceptable given the resilience gains, and the cancellation rate increase is expected to be smaller than the conversion rate improvement.

**Payment split impact:** Merchants currently using Checkout's payment split feature (splitting payment across sellers at the transaction level) will need to migrate to payment-level split via their acquirer, or handle reconciliation independently. This is a breaking change for affected merchants and requires coordinated migration support from the Payments team.

### 5. Customer Workarounds Today

- **Retry logic at checkout.** Merchants configure retries on failed seller calls before surfacing an error to the shopper. This increases checkout latency with each retry and still produces an order failure if retries exhaust — after the shopper has already waited.
- **Reduce external seller scope.** Merchants limit which seller types go through real-time protocols to reduce failure surface. This excludes valid inventory sources and reduces shoppable coverage — a direct trade-off against availability.
- **Accept lost orders.** Some merchants treat failed checkouts during peak as an unavoidable cost. There is no recovery path.

---

## Vision Statement

**3-Year Vision:** Every shopper who commits to a purchase on VTEX completes that purchase — regardless of the real-time availability of any seller's system. Asynchronous order creation becomes the default model. Seller unavailability triggers automatic recovery, not order loss.

**1-Year Vision (end of H1 2026):** Asynchronous Purchase reaches closed beta with 1 pilot merchant. The core scenario: shopper completes checkout and payment synchronously; seller orders are created asynchronously post-placement with automatic retry and reallocation on failure.

### Key Capabilities

**1. Purchase commitment decoupled from seller order creation.** The shopper's payment and purchase intent are captured immediately at checkout. The creation of orders with individual seller systems happens asynchronously after the purchase is committed.

**2. Automatic retry and reallocation on seller failure.** If a seller's system is unavailable post-purchase, the platform retries within a configurable threshold. If retries are exhausted, the order is reallocated to an alternative seller or cancelled — no manual merchant intervention required for routine failures.

**3. Reduced checkout latency.** Removing synchronous seller PlaceOrder calls from the critical checkout path reduces placeOrder latency by at least 10% and reduces errors by at least 5%.

**4. Configurable async enablement.** Merchants can enable or disable asynchronous order creation independently, allowing gradual rollout and preserving synchronous behavior for merchants with payment split dependencies until migration is complete.

### Conditions of Satisfaction

- **1 pilot merchant live on Asynchronous Purchase in Closed Beta by end of H1 2026** — end-to-end: synchronous payment + asynchronous seller order creation with automatic retry.
- **≥10% reduction in placeOrder latency** measured at p95 against the synchronous baseline.
- **≥5% reduction in placeOrder errors** in production for enrolled merchants.
- **Cancellation rate increase does not exceed conversion rate increase** — the resilience gain must outpace the inventory trade-off.
- **Zero orders permanently lost during the async window** — every order that enters async creation is either successfully placed, reallocated, or explicitly cancelled within the merchant-defined SLA.

### Non-Goals

**Payments async flows** — payment capture remains synchronous. This vision covers logistics and seller order creation only; payment orchestration is owned by the Payments vertical.

**Returns and exchanges** — post-purchase modifications are owned by the Order Management module.

**Full offline SalesApp mode** — the initial closed beta targets a specific async allocation scenario. Full offline SalesApp capability is a subsequent phase.

---

## High Level Phasing

1. **Phase 1 — Foundation (Completed):** RFC designed and approved. Architecture dependencies on Checkout, SOS, and Payments identified and validated.

2. **Phase 2 — Alpha + Closed Beta, 1 pilot merchant (end of H1 2026):** Asynchronous order creation enabled for a single pilot merchant. Core scenario: synchronous checkout → async seller order creation → automatic retry on failure. Validate SLA adherence and order recovery rate.

3. **Phase 3 — Omnichannel and marketplace scenarios (TBD):** Cover C&A-style Ship-from-Store, external seller protocol failure recovery, and SalesApp offline capture. Expand to 3–5 merchants across different configurations. Payment split migration path defined and communicated.

4. **Phase 4 — Default async model (TBD):** Asynchronous Purchase is the default for all VTEX post-purchase flows. Synchronous order creation retained only for merchants with active payment split dependencies pending migration.

---

## Open Questions

**1. Failure handling UX.** If reallocation fails and an order is cancelled post-purchase, what does the shopper receive and when? The communication model (email, WhatsApp via Weni, order status page) is not yet defined and is a prerequisite for closed beta.

**2. Inventory reservation timing.** The exact window between purchase commitment and stock reservation needs to be defined per seller type. The acceptable cancellation rate increase from late reservation must be agreed with merchant operations before open beta.

**3. Payments dependency boundary.** The precise boundary between Asynchronous Purchase (logistics and seller order creation) and any future async payment flows must be explicitly agreed with the Payments team before closed beta scope is finalized.

---

## Appendix

### Related Assets

- [Async Orders RFC](https://docs.google.com/document/d/10Oa_ZvYiuXwiEnvC19XUUWxBTSoBurzpt4FMwQpbQ94/edit?tab=t.0#heading=h.ta72161di1y0)
- [Async Order Allocation RFC](https://docs.google.com/document/d/1a6cjQqNsAxLFTBj5dvfmHGecMkC1sAH4H67mAAWQ2KE/edit)
- [25Q2 QBR & 25H2 Plan — DOM](https://docs.google.com/document/d/1MlbyslhXed0sM9tU1JOLVrpQvEc96VfBYaOV3X0W-VY/edit)
- [3Y DOM Product Vision](https://docs.google.com/document/d/1odjRq6MZMdGVi50tYf6F_iyYyjhM0BUOme1H_lj3XOs/edit)

### Changelog

| Changed | Details |
|---|---|
| May 2026 | Revised based on Async Orders RFC (v1.0, approved) — improved problem framing, added trade-offs, resilience model, and conditions of satisfaction |
| May 2026 | Initial draft created for Chapter OS repo setup |
