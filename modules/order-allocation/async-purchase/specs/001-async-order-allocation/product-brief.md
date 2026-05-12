# Product Brief: Async Order Allocation — Closed Beta

| | |
|---|---|
| **Spec** | 001-async-order-allocation |
| **Module** | Order Allocation / Async Purchase |
| **Pillar** | Lowest cost-to-serve |
| **PM** | [Camila Vidal](mailto:camila.vidal@vtex.com) |
| **Status** | Active — H2 2025 |
| **Availability** | Closed Beta |

---

## Problem

VTEX merchants lose orders permanently when any synchronous logistics or seller API call fails at checkout — even when inventory exists and the merchant could fulfill. The checkout requires all logistics, pricing, and seller confirmation calls to succeed in real time before an order is created. When an external seller API times out (Americanas), a logistics service degrades under Black Friday load, or a store associate loses connectivity on SalesApp, the purchase fails with no recovery path. The Async Order Allocation RFC was completed in H1 2025, and Dollar General (US) is identified as a pilot-ready closed beta candidate.

---

## Solution

Decouple the purchase commitment from fulfillment confirmation. The checkout captures the shopper's payment and order intent immediately. Supplier assignment, freight confirmation, and inventory reservation complete asynchronously after order creation, within a merchant-defined SLA. Order Allocation uses Delivery Pricing as the freight protocol for post-purchase allocation — removing real-time external calls from the checkout critical path.

---

## Who Benefits

**Head of Ecommerce at Tier 1 merchants with external seller networks, SalesApp, or Ship-from-Store operations** can guarantee purchase completion during peak load and external system outages — recovering orders that are currently permanently lost. C&A can support Ship-from-Store allocation post-purchase; SalesApp can capture orders during connectivity drops.

**Shoppers** receive a standard order confirmation immediately — the async flow is invisible at the point of purchase.

---

## Definition of Done

- [ ] End-to-end async allocation flow live with 1 pilot merchant: synchronous checkout → asynchronous supplier assignment confirmed within merchant-defined SLA
- [ ] ≥99% of orders entering async allocation recovered (allocated or explicitly cancelled) within the SLA — zero silent failures
- [ ] Checkout p95 latency unchanged vs. baseline — async flow adds no measurable latency to the synchronous confirmation step
- [ ] Failure handling model defined: what happens when allocation cannot complete within the SLA (auto-cancel, VTEX DO task, or merchant notification)
- [ ] Shopper communication model defined: order status page shows a clear "being processed" state during the allocation window

> ⚠️ TODO: GMV-at-risk from current synchronous failures is not yet quantified — tracking this through the Closed Beta is required for the GA business case.
