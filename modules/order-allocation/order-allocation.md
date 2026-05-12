# Order Allocation

| | |
|---|---|
| **Pillar** | Lowest cost-to-serve |
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **PM** | [Camila Vidal](mailto:camila.vidal@vtex.com) |
| **EM** | [Eduardo Andrade](mailto:eduardo.andrade@vtex.com) |
| **Status** | Active |

---

## What This Module Is

Order Allocation is VTEX's post-purchase routing engine. After an order is placed, it selects the optimal combination of suppliers — warehouses, stores, or external sellers — to fulfill each item while meeting the delivery promise at the lowest possible cost-to-serve. The allocation process runs asynchronously after order placement by default, decoupling it from the synchronous checkout flow, and can be triggered at any point in the order lifecycle to reallocate when disruptions occur. The 3-year direction is to evolve from fixed allocation logic into an Objective-Based Allocation Agent: merchants express their goal in natural language, the agent converts it into cost parameters and weights, simulates outcomes on historical orders, and deploys without manual rule management.

---

## Services in Scope

| Service | Description |
|---------|-------------|
| Order Allocation Engine | Quotes available suppliers and selects the combination with lowest cost-to-serve based on configurable business objectives (minimize cost, shipping time, splits, stockout risk, inventory turnover) and sourcing constraints |
| Allocation Rules API | Merchants configure objectives and constraints — including sourcing rules by customer profile, product classification, and seller type |
| Distance Optimization | Tiebreaker rule selecting the closest available supplier when cost and SLA are equivalent — rolled out to all VTEX accounts Q2 2025 |
| Cost-Based Solver | Selects lowest-cost feasible seller combination per order considering freight, commissions, taxes, handling, and operational costs — based on Delivery Promise eligible sellers |
| Async Allocation Service | Runs allocation asynchronously post-purchase, decoupled from checkout; supports seamless seller replacement in parallel with synchronous logic |

---

## Problems This Module Solves

1. **Allocation is not oriented to minimize cost-to-serve.** The current model has no support for merchant-defined objectives like cost optimization, inventory turnover, or split minimization. Competitors (Manhattan, Blue Yonder, IBM Sterling, KIBO) offer this natively. TFG and C&A have explicitly cited this gap as a migration risk to external OMS solutions.
2. **No sourcing rules per customer profile or product classification.** Merchants with complex omnichannel operations (Grupo Soma — 20% of sales from external sellers needing allocation participation) cannot define advanced sourcing logic without customization. Container Store selected a competitor partly due to VTEX's insufficient sourcing rules.
3. **Allocation is a black box.** Merchants cannot understand, simulate, or predict the allocation outcome. There is no impact preview, no A/B testing for allocation logic, and no transparency into why a supplier was selected.
4. **Synchronous allocation blocks checkout.** Real-time pricing calls and external seller protocol dependencies at checkout cause orders to fail entirely when upstream systems are unavailable — not just slower.
5. **No reallocation during the order lifecycle.** When disruptions occur (stockout, payment delay, carrier failure), allocation cannot be re-run automatically — requiring manual merchant intervention.

---

## Features

| Feature | Description | Status |
|---------|-------------|--------|
| [Async Purchase](async-purchase/product-vision.md) | Resilient purchase flow that decouples checkout from synchronous external dependencies — order completes even when logistics APIs are unavailable | Active — Closed Beta H2 2025 |
