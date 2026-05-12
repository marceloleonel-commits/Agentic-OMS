# Fulfillment

| | |
|---|---|
| **Pillar** | Accurate availability · Lowest cost-to-serve |
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **PM** | [Carolina Rodrigues](mailto:carolina.rodrigues@vtex.com) |
| **EM** | [Ronan Cruz](mailto:ronan.cruz@vtex.com) |
| **Status** | Active |

---

## What This Module Is

Fulfillment owns the configuration and execution layer between order placement and shipment. It covers how merchants define their delivery offering (methods, time targets, and fulfillment prices), how inventory and supplier capacity are managed across warehouses and stores, and how shipping is confirmed via carrier integrations and label generation. It is a critical enabler for Delivery Promise — Delivery Options provides the structured delivery configuration the availability engine indexes, and Delivery Pricing provides the fulfillment price layer required for item-level freight on PLP and post-purchase allocation.

---

## Services in Scope

| Service | Description |
|---------|-------------|
| Logistics API (Fulfillment) | Core service managing shipping policies, carriers, warehouses, dock configurations, and inventory |
| Inventory Service | Tracks stock levels across all fulfillment locations and propagates updates to Delivery Promise indexing |
| Label Generation | Integrates with carriers to generate shipping labels and tracking codes post-invoicing |
| Delivery Options Service | Merchants configure which delivery methods and time targets to offer shoppers without editing freight tables — acts as the input layer for Delivery Promise |
| Delivery Pricing Service | Merchants define fulfillment prices via rules (fixed fee, cost markup, free shipping, max price cap) with segmentation by zone, seller, category, channel, cart value, and SKU — independent of carrier costs |
| Supplier Management | Visibility into supplier network performance: SLA adherence, cost per order, capacity, and operational metrics across warehouses, stores, and external sellers |
| Operational Capacity | Merchants configure and automatically enforce order volume limits per fulfillment location — protecting operations during peak load without manual intervention |

---

## Problems This Module Solves

1. **No control over the fulfillment price shown to shoppers.** The platform passes raw carrier costs to shoppers with no merchant override. Merchants cannot offer flat-rate shipping or cap delivery costs without using Promotions workarounds — which break for merchants on Delivery Options because Promotions references SLA Types, not Delivery Options.
2. **Delivery configuration is coupled to freight tables.** To change which delivery methods are visible to shoppers, merchants must edit freight tables and shipping policies — reducing commercial agility and increasing operational complexity.
3. **External seller freight calculation requires synchronous checkout calls.** For marketplace-heavy merchants like Americanas, each external seller item requires a real-time API call to the seller's system at checkout. Failures block the order entirely.
4. **No visibility into real fulfillment costs.** Merchants cannot distinguish between what a carrier charges (cost) and what they charge the shopper (price), making freight margin management and cost-based allocation impossible.
5. **No protection against peak-load overload.** When order volume exceeds store capacity during high-demand periods, the only recourse is manual editing of freight tables or deactivation of sellers — a slow and error-prone process.

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Delivery Options](delivery-options/product-vision.md) | Merchant-configured delivery methods and time targets that discretize availability for Delivery Promise — without editing freight tables | Active — Closed Beta |
| [Delivery Pricing](delivery-pricing/product-vision.md) | Fulfillment price control independent of shipping tables — rule-based pricing with segmentation by zone, seller, cart value, channel, and SKU | Active — H2 2025 |
