# Order Allocation — Customer Use Cases

> This document captures real merchant allocation requirements discovered through customer interviews. It is the ground truth for what merchants need — use it to validate features, prioritize the roadmap, and pressure-test specs before writing them. Organized by strategic goal so patterns across customers are visible.

---

## 🗣️ Strategic goals mapped based on customer interviews

### Reduce operational costs

Lower operational expenses related to shipping, handling, low inventory turnover, and taxes.

**Shipping Costs:** For medium & large omnichannel retailers such as C&A, Cobasi, Rona, Hope, FastShop, Loungerie, Garage, and Lizie, the "shipping cost over revenue" indicator is a key priority. As Rona puts it: *"What's the least expensive way to get it to the customer on the date they want it? That's the general statement."* C&A suggests: *"Each seller gets a score based on shipping cost, handling cost, and distance. The seller with the lowest score wins."* C&A also needs the cost comparison to work at the cart level — when a cart has 2+ items, the system must evaluate whether consolidation or split is cheaper and route accordingly: *"If all three items in a cart are available in one store, we compare the cost with splitting across multiple stores. The system must be flexible: sometimes reducing the split is right, sometimes not."*

**Handling Costs:** Lizie pays a commission to shopping malls when orders are shipped from stores, but no commission when shipped from a DC; so the DC should always be the preferred supplier. Similarly, Vivara's CD in Espírito Santo provides a fiscal benefit on ICMS that makes it the default first priority for most SKUs — but the allocation engine is not consistently routing to it, resulting in avoidable cost leakage.

**Inventory Turnover:** Clamed Group works with highly perishable medications: *"The longer they sit on the shelf, the more likely we are to take a loss. Ideally, the allocation system should factor in how long that inventory has been idle."*

**Taxes:** At FastShop, certain products benefit from lower ICMS tax rates when shipped from specific regions. Vivara operates a similar model: CD ES (Espírito Santo) is the fiscally preferred source for most SKUs due to ICMS treatment — yet allocation data shows CD orders are down 20% YoY while store fulfillment is up 18%, indicating the fiscal priority is not being respected.

**Inventory levels (whether higher or lower, depending on the business strategy):** OBI explained: *"There might be an item we want to get rid of, and others we always want to keep in stock. It's good for us to have the flexibility to decide whether we can sell out a product to reduce costs. It would be nice to clear out that inventory when needed. But I guess the customer aspect (prioritizing stores with stronger performance) is still more important. If the customer doesn't get what we promised, they'll probably just order from a competitor next time."*

**Maximize marketplace commissions:** Track&Field receives a 13% commission per order when shipped from franchises instead of owned stores, and only covers fulfillment costs for its own stores — so they prefer shipping orders from franchises.

---

### Preserve shopper experience

**Deliver faster even if it has higher costs:** C&A declared that it is willing to sacrifice part of the cost to prioritize shorter delivery times during seasonal peaks such as Mother's Day or Christmas.

**Deliver exactly within the promised time (not earlier, not later):** OBI stated: *"Delivering goods too fast is also a bad experience, because we're talking about a hardware shop. So, if you order something very huge and you expect the order to come, I don't know, in four days, you take a day off, and then it just took two days, and the freight delivery is standing in front of your door and nobody's opened it. Then you have a problem."*

**Preserve product integrity during transportation by shipping from closer origins:** Grupo CRM prioritizes geographic proximity for chocolate orders to prevent melting during transit.

**Preserve in-store customer experience based on store capacity:** Zona Sul monitors store fulfillment capacity to protect the in-store customer experience: *"Capacity constraints and store activity, like 'feirinha' days (the physical store gets crowded), must guide allocation logic."* C&A similarly needs to cap how many orders a store can receive in a given window — today there is no way to express a real-time operational queue limit without zeroing inventory.

**Prioritize sellers with stronger performance** (those fulfilling orders within the promised time, stores with greater available capacity, higher NPS, and lower cancellation rates while items are in stock). OBI mentioned: *"We might know we have a seller we don't really trust. Even if they have the lowest price, we'd rather not push orders to them."* OBI also emphasized: *"I think store performance is the main deciding factor (since their costs and SLAs are usually tied), because it has a greater impact on the customer in the end. If the store can't fulfill the order within the promised time, the customer will complain."* Alphabeto added: *"I'd rather the order go to the store with the lowest cancellation rate."* In grocery retail, Zona Sul and Super Nosso also consider store-level NPS. Super Nosso explained: *"Some stores consistently receive complaints. Even if one is closer, I'd rather not allocate orders there. NPS is a key tie-breaker when delivery windows are the same."* C&A needs to go further: three distinct operational signals must feed into routing — real-time queue depth, historical processing velocity (imported from OMS analytics), and monthly NPS per store — each with configurable weight as a tiebreaker when cost and SLA are equivalent.

**Control order splits logic:** For Zona Sul, splitting is seen as a potential risk to customer satisfaction: *"It can negatively impact customer satisfaction. Imagine a shopper ordering all the ingredients for a family dinner: we deliver all the seasonings, but the meat only arrives on the second delivery."* For Grupo CRM, split orders are not allowed under any circumstance: *"We don't allow split orders under any circumstance. If a store can't fulfill the full cart, it goes to the DC."* C&A and Clamed Group accept order splits when they help reduce costs and SLAs, but both monitor the number of packages carefully. Clamed shared: *"We had complaints at first, but after improving the front end to explain multiple packages, splits are fine, especially if we can still deliver quickly."* For Unico Group (Imaginarium and Puket), allocation should prioritize franchises before the DC to optimize costs — but if splitting is required and any item has a promotional price, the entire order must be routed to the DC; otherwise a franchise receiving only part of an order typically cancels its portion to avoid financial loss, harming the shopper experience.

---

### Honor business internal structure

**Distribute orders fairly:** For Grupo CRM, Track&Field, Hope, Santa Lolla, and others, equitable distribution among franchisees is an internal business requirement. Clamed explained: *"It's unbelievable how one store always gets orders while another nearby gets none. They're equidistant, with similar stock and pricing. That frustrates our store managers."* Hope Group added: *"I would like to share orders with franchisees, because today, since I hold much more inventory in owned stores, they end up receiving all the orders in São Paulo."* For Stihl Ferramentas, sending the order from the store closest to the buyer is mandatory, as *"priority based on geolocation is part of the seller's contract with the distributor"*. Each seller also operates only within their own state, preventing competition between stores.

**Respect a defined supplier priority sequence with named groups:** Multiple merchants need to define a strict ordered fallback across named groups of suppliers — not a flat list of rules, but a sequence where group A is always preferred over group B, and group B over group C. Vivara's model is the clearest example:

| Priority | Supplier Group | Rationale |
|---|---|---|
| 1° | CD ES (Espírito Santo) | Fiscal benefit — ICMS treatment on most SKUs |
| 2° | CD SP (São Paulo) | Lower fulfillment cost than stores for SP-state deliveries |
| 3° | Lojas Robustas (58 stores) | Dedicated stockkeeper, secure vault, adequate fulfillment volume — operationally reliable nodes |
| 4° | Regular stores (~392) | Fallback; higher operational risk and replenishment burden |

Today this priority order is not being respected: CD orders are −20% YoY, store fulfillment is +18% (growing in the wrong direction), and CD SP is not being preferred for São Paulo deliveries. The consequence is store desabastecimento and reactive, costly replenishment. The named group concept — a configurable set of sellers treated as a unit with a defined position in the allocation sequence — is also relevant for franchise networks (Track&Field, Mormaii) and whitelabel architectures.

**Keep orders within the same supplier group during reallocation:** Track&Field, Mormaii, and Pusco require that if an order is reallocated after placement, it remains within the same franchise group and does not jump to the merchant's own DC or a competing franchise cluster.

---

## Competitive Benchmark — Routing Capabilities

> Source: Order Allocation Vision, Strategy and Requirements (internal benchmarks study)

| Routing Capability | Shopify Smart Order Routing | Blue Yonder | Manhattan | Kibo | Fluent Order Orchestration | VTEX (today) |
|---|---|---|---|---|---|---|
| Minimize split fulfillments | ✓ | ✓ | ✓ | ✓ | ✓ | Partial |
| Stay within destination market | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Ship from closest location | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ (distance tiebreaker, Q2 2025) |
| Cost-based optimization | ✓ | ✓ | ✓ | ✓ | ✓ | In progress |
| Inventory lifetime / turnover signal | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Geographic proximity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Assignment throttling (queue limits) | — | ✓ | ✓ | ✓ | ✓ | ✗ |
| Merchant-defined objective (parameterized) | ✗ | Partial | ✓ | Partial | Partial | In progress (Agent) |
| Named seller groups / pool routing | — | ✓ | ✓ | ✓ | ✓ | ✗ |
| Sourcing rules by customer profile | — | ✓ | ✓ | ✓ | ✓ | ✗ |
| Sourcing rules by product classification | — | ✓ | ✓ | ✓ | ✓ | ✗ |
| Allocation observability / decision explanation | — | ✓ | ✓ | Partial | ✓ | ✗ |
| Post-purchase reallocation on disruption | — | ✓ | ✓ | ✓ | ✓ | ✗ |
| Seller performance signals (NPS, cancellation rate, velocity) | — | ✓ | ✓ | ✓ | ✓ | ✗ |

---

## Open Requirements — Not Yet Mapped to Features

| Requirement | Customer Source | Notes |
|---|---|---|
| Named seller groups with priority position | Vivara, Track&Field, franchise networks | Key enabler for Lojas Robustas; also covers franchise clustering and geographic exclusivity |
| Strict ordered fallback between groups | Vivara | Must respect sequence reliably; today deviates without explanation |
| Cost-based split vs. consolidation decision | C&A, Clamed | Solver must evaluate all fulfillment combinations and select cheapest — not default to minimize splits |
| Operational signal ingestion (queue depth, velocity, NPS) | C&A, Zona Sul, Super Nosso | Requires import API + configurable weighting in engine |
| Sourcing rules by product classification | C&A, TFG, Lizie | "For this category, prefer DC; allow stores only as fallback" |
| Inventory turnover signal | Clamed Group, OBI | Factor idle inventory time into supplier scoring |
| In-market / destination-aware routing | Stihl, Vivara (CD SP for SP deliveries) | Not built; present in all major competitors |
| Allocation observability for replenishment planning | Vivara | Feed of decisions per source + projected stock depletion vs. safety stock |
| Reallocation constrained to same franchise group | Track&Field, Mormaii, Pusco | Reallocation must not cross franchise boundaries |
| Promotional price exception on split routing | Unico Group | If any cart item is promotional, force full cart to DC to prevent franchise partial cancellation |
