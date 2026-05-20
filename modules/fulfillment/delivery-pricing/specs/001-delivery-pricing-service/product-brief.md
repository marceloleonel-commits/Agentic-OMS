# Product Brief: Delivery Pricing Service

| | |
|---|---|
| **Spec** | 001-delivery-pricing-service |
| **Module** | Fulfillment / Delivery Pricing |
| **Pillar** | Accurate availability · Lowest cost-to-serve |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Active — H2 2025 |
| **Availability** | Internal Service (dependency unblock) |

---

## Problem

VTEX merchants have no control over the delivery price displayed to shoppers at checkout — the platform passes carrier table costs directly with no override layer. This blocks conversion-oriented pricing strategies (flat-rate, free shipping thresholds, freight margin) and is a direct order failure vector for Americanas, whose external seller freight requires synchronous API calls at checkout that time out under load. Three separate H2 2025 initiatives are architecturally blocked until Delivery Pricing exists: Americanas post-go-live unblock, Async Purchase (needs a freight protocol for post-purchase allocation), and item-level freight on PLP (Intelligent Search found no alternative path). Free shipping promotions for merchants on Delivery Options are also broken because Promotions references SLA Types — a regression that must be resolved before Black Friday 2025.

---

## Solution

Build an internal Delivery Pricing service that decouples fulfillment price from carrier cost. Merchants define delivery prices via configurable rules — fixed fee, cost markup, free shipping threshold, maximum price cap, or cost pass-through — with segmentation by shipping zone, order value, cart weight, seller, sales channel, carrier, category, or SKU. The service provides the freight calculation protocol for external sellers and for post-purchase allocation, removing real-time seller API calls from the checkout critical path.

---

## Who Benefits

**Head of Logistics at Tier 1 merchants with marketplace-heavy operations** (Americanas, US market merchants) can calculate external seller freight without synchronous checkout calls, define flat-rate and segmented delivery prices, and capture freight margin in regions where carrier costs are low.

**DOM product teams** unblock Async Purchase, item-level freight on PLP, Buy Box optimization, and the Promotions regression for Delivery Options merchants — all in a single service.

---

## Definition of Done

- [ ] Americanas external seller freight calculation succeeds without synchronous seller API calls, with ≥99.5% success rate
- [ ] Async Purchase closed beta uses Delivery Pricing as the freight protocol for post-purchase allocation with 1 pilot merchant
- [ ] Free shipping promotions work for merchants using Delivery Options — Promotions regression resolved before Black Friday 2025
- [ ] At least 1 merchant configuring delivery pricing rules (fixed fee or segmentation) in production by end of H2 2025
- [ ] Checkout migrated from SLA Types to Delivery Options as the price source — ETA committed by Checkout team

> ⚠️ TODO: Merchant adoption target for H2 2025 beyond the Americanas unblock is not yet defined. Throttling rules for external pricing engine calls must be specified before that capability is opened.
