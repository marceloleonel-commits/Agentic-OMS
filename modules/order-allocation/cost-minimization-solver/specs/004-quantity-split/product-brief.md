# Product Brief — Quantity Split

| Field | Value |
|---|---|
| **Module** | order-allocation |
| **Pillar** | Lowest cost-to-serve |
| **PM** | Camila Vidal |
| **Eng Champion** | Eduardo Andrade |
| **Status** | Under development |
| **Expected Release** | TBD |
| **Availability** | Alpha |
| **Storefronts** | N/A |
| **Mode** | B2C & B2B |


## MMR

**Title:** Cost Minimization Solver — Split SKU Quantities Across Sellers

**Description:** With this release, merchants can configure how Order Allocation behaves when items are only partially available across sellers — enabling partial fulfillment instead of blocking the entire order. This covers two complementary capabilities: (1) **split by line item**, where a SKU that can't be fully fulfilled by any seller is still shipped (the portion that exists) and the remainder handled per a merchant-defined rule; and (2) **split by quantity**, where a single SKU's quantity is distributed across multiple sellers (e.g., 3 units from Seller A + 2 units from Seller B). Merchants choose what happens to unmatched quantities: automatic cancellation, assignment to Customer Care for manual intervention, or backorder until restock. This means high-volume B2B carts stop being blocked by single-seller stock limits, pharma and grocery orders with distributed inventory become fulfillable, and merchants retain control over the operational path for inventory gaps.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C and B2B retailers with distributed inventory across multiple fulfillment nodes; especially relevant for B2B customers placing high-volume orders, and for pharma, grocery, beauty & health, and home appliance categories where orders frequently include multiple units of the same SKU
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Today, if no single seller holds the full quantity of a SKU, the item is marked as unavailable — even when the combined inventory across sellers would cover the demand. There is no way to partially fulfill a line item, send unmatched quantities to Customer Care, or hold them on backorder. Orders block entirely, and the workarounds available today require headless checkout customization.
- Use Case: Increase order availability for high-quantity line items by allowing the solver to split quantities across sellers and by giving merchants explicit control over what happens to inventory gaps

---

## Opportunity

**Most affected segments:** Pharma, Grocery, Beauty & Health, Home Appliances. In these markets, inventory is highly distributed across stores and sellers, and orders frequently include multiple units of the same SKU.

**Less affected segments:** Electronics and Fashion. Shoppers typically purchase a single unit per SKU, with few scenarios involving multiple identical quantities per order.

**Customer evidence:**
- **Rona (B2B):** Estimated annual impact of not being able to split line items by quantity: $300M in GMV, representing $1M in revenue for VTEX.
- **Auchan:** Blocked order forms caused by partial availability across sellers — orders fail entirely instead of fulfilling what's in stock.
- **Electrical Wholesalers (EWNE, B2B):** Currently using a headless checkout workaround — when a pickup order can't be fully covered by one seller, they force the overflow quantity to a "backorder seller" via the Checkout API. The backorder seller holds the remaining units until they are manually reallocated internally. Stated use case: *"It's construction supply — it's perfectly fine not to have all 300 units ready for pickup. I'll take the 200 that are there and keep working while I wait for the other 100."*

---

## Why this is mathematically complex

Allowing quantity splits significantly increases the solver's search space. Without quantity splitting:
- 3 line items × 10 eligible sellers = 10³ = 1,000 possible allocations
- 6 line items × 10 sellers = 10⁶ = 1,000,000 combinations

With quantity splitting across sellers:
- 1 SKU with 10 units and 12 eligible sellers → over 300,000 ways to distribute those units
- Two such SKUs → hundreds of billions of possible combinations

This is why quantity split is a distinct MMR from the base solver — it requires meaningful extension to the combination enumeration logic, with deliberate limits (max sellers per SKU, min quantity per leg) to keep the search space tractable.

---

## Feature Delta

In MMR 001, each line item is allocated to a single seller. If Seller A has 2 units and the cart requires 5, those 5 units are unavailable — even if Sellers B and C together cover the remaining 3.

This MMR extends Order Allocation in two ways:

**1. Split by line item with resolution rule:** A SKU that no single seller can fully cover can still be partially fulfilled. The available quantity ships; the unmatched remainder is handled per the merchant's configured resolution rule (cancel, Customer Care, or backorder).

**2. Split by quantity across sellers:** A single SKU's quantity is distributed across multiple sellers. The solver evaluates quantity-split combinations as part of normal cost minimization — it only splits when doing so produces a valid fulfillment at least as good as any single-seller option on cost and SLA.

**What each resolution rule does:**

| Resolution Rule | Available quantities | Unmatched quantities |
|---|---|---|
| Cancel unmatched | Fulfilled | Cancelled automatically |
| Customer Care | Fulfilled | Assigned to Customer Care for manual intervention |
| Backorder | Fulfilled | Held on backorder until restocked |
| Cancel entire order (no-match fallback) | — | Entire order cancelled if no quantity can be matched |
| Customer Care (no-match fallback) | — | Entire order assigned to Customer Care |
| Backorder (no-match fallback) | — | Entire order held on backorder |

The no-match fallbacks apply when Order Allocation cannot find a valid allocation for any item in the order.

---

## Why this ships as its own MMR

Quantity split requires a meaningful extension to the solver's combination enumeration logic — the search space grows significantly when quantities can be distributed across sellers. It also introduces new shopper-facing complexity (multiple packages for the same line item), new merchant configuration needs (minimum quantity per leg, maximum sellers per SKU, resolution rules), and a new operational path (backorder). These are distinct engineering and product scopes from the base solver (MMR 001). The merchant value is independently communicable and targets a specific gap — availability on high-volume line items — not addressed by cost weight configuration or behavioral inference.

As a side effect, this MMR also enables **partial change seller** — when an order is being reallocated after placement, individual quantities within a line item can be moved to a different seller rather than requiring a full line item reassignment.

---

## Scope

**In scope:**
- Split by line item: partial fulfillment when no seller has the full quantity; remainder handled per merchant-configured resolution rule
- Split by quantity across sellers: solver evaluates quantity distributions across eligible sellers as part of cost minimization
- Resolution rules per merchant: cancel unmatched quantities, assign to Customer Care, assign to backorder; configurable separately for partial match and no-match scenarios
- Backorder: unmatched quantities held until inventory is replenished; merchant defines the SLA for backorder resolution
- Configurable limits: maximum sellers per SKU in a quantity split (default: 2; absolute GA max: 3); minimum quantity per split leg
- Configuration via Order Allocation Agent (natural language, MMR 011)
- Simulation reports include availability recovery metrics: line items recovered via quantity split, cost impact of split vs. single-seller

**Not in scope:** Quantity split across different delivery SLAs (all legs must share the same delivery window); shopper-facing UI changes to display multiple shipments for the same line item (existing multi-package delivery experience handles this); cross-merchant or cross-account backorder pools; backorder SLA enforcement and notification flows (owned by Order Management).

---

## Open Questions

1. **Synchronous or asynchronous resolution?** Should the resolution of unmatched quantities (cancel/Customer Care/backorder routing) happen in the synchronous checkout flow, or be deferred to the asynchronous allocation worker? This affects when the shopper receives confirmation and what state the order is in at Order Placed.
2. **Merchant-defined maximum sellers per quantity split:** Should the cap (currently defaulting to 2, max 3 in GA) be raised based on B2B evidence from Rona and EWNE, where splits across 5–10 sellers may be operationally acceptable?
