# Distributed Order Management (DOM)

| | |
|---|---|
| **GPM** | [Julia Grisi Lolato](mailto:julia.lolato@vtex.com) |
| **Slack** | #dom-product-vertical |

---

## Problem Space

The pressure on DOM is structural, not cyclical. Four forces are reshaping what merchants require from an order management system:

**Operational complexity has exploded.** Merchants operate across multiple sellers, fulfillment types, and regions. Millions of concurrent events require real-time coordination that cannot be manually managed. Inefficient order allocation and routing directly impact fulfillment costs; poor inventory visibility leads to stockouts; lack of automated post-purchase support increases overhead.

**AI is no longer a differentiator — it is a baseline.** Every major DOM competitor (Manhattan, Blue Yonder, IBM Sterling, KIBO, Salesforce) has shipped AI agents in production since 2024–25. Merchants now expect AI-native capabilities in the core order lifecycle — not add-ons. VTEX has zero DOM AI agents in production today. This is the single largest strategic gap versus all competitors.

**Manual operations are unsustainable at scale.** Exception resolution, order routing, picking operations, and post-purchase support still depend heavily on human intervention. Returns alone represent >19% of online sales. Operations teams cannot scale without automation.

**B2B and omnichannel are now table stakes.** BOPIS, BORIS, B2B approval chains, multi-supplier operations — these are baseline expectations. Competitors like Manhattan and KIBO already differentiate on workflow flexibility in these scenarios. VTEX merchants in these segments build expensive workarounds to fill gaps the platform does not natively cover.

---

## Team

| Role | Person | Contact |
|------|--------|---------|
| GPM | Julia Grisi Lolato | julia.lolato@vtex.com |
| PM — Delivery Promise & Order Allocation | Camila Vidal | camila.vidal@vtex.com |
| PM — Fulfillment | Carolina Rodrigues | carolina.rodrigues@vtex.com |
| PM — Order Management | Marcelo Leonel | marcelo.leonel@vtex.com |
| PM — Pick and Pack | Sayonara Soares | sayonara.soares@vtex.com |
| Engineering Senior Manager | Bruno Alves | bruno.alves@vtex.com |
| EM — Order Allocation | Eduardo Andrade | eduardo.andrade@vtex.com |
| EM — Order Management | Heliomar Santos | heliomar.santos@vtex.com |
| EM — Pick and Pack | Carolina Mourão | carolina.mourao@vtex.com |
| EM — Fulfillment | Ronan Cruz | ronan.cruz@vtex.com |
| Design Journey Lead | Fernanda Colodetti | fernanda.colodetti@vtex.com |
| Designer — Fulfillment | Amanda Vilar | amanda.vilar@vtex.com |

---

## Strategy

### Three Shifts That Define the Next Three Years

**01 — Intelligent Orchestration**
An event-driven order hub that tracks every task per supplier in real time — with automatic recovery when anything breaks. No more black boxes. Full operational transparency. The system moves from status-driven to task-driven: Promise → Tasks → Shipment. Every state change has an immutable audit record.

**02 — Objective-Based Allocation**
Stop configuring tables. Merchants define their goal — reduce cost, guarantee SLA, prioritize sustainable shipping — and an agent routes every order to the right supplier, automatically. The allocation engine considers all relevant costs (freight, commissions, taxes, handling, storage) and balances them against buyer experience objectives without requiring manual rule management.

**03 — Agents That Act**
From customer service to returns and exchanges, AI agents handle the operational load while the team focuses on judgment calls. The agent is the intern. The team is the curator.

### Agentic Tenets

All autonomy within these boundaries:

| Tenet | Rule |
|-------|------|
| **Explainability First** | We never ship autonomy without explainability. A correct decision that cannot be explained is not shippable. Operator trust over higher automation rates. |
| **Audit is Truth** | The audit record is the source of truth, not the outcome. Every state change must have an immutable record of who, what, when, and why. |
| **Humans Own Goals** | Humans define what good looks like; agents find the path. Agents never redefine goals. When an agent cannot achieve the goal within its constraints, it escalates — it does not improvise unless pre-approved. |
| **Sacred Substrate** | Intelligence is additive. Agentic capabilities never bypass the deterministic engine. Agents interact with the engine through the same task protocol as any other executor. When forced to choose between a more capable agent and a more reliable substrate, we choose the substrate. |
| **Earned Autonomy** | Autonomy is earned in production. Every autonomous capability ships first in recommendation mode, then supervised execution, then full autonomy. Merchants define when they are ready for full AI autonomy. |
| **Absorb Complexity** | Agents must make experience simpler. Self-service wins over custom code. AI handles complexity so merchants never have to. |

---

## Vision Statement

Seamless order management system that expands the availability of products and minimizes fulfillment costs and operational complexity.

---

## Modules

| Module | Description | PM |
|--------|-------------|-----|
| [Delivery Promise](modules/delivery-promise/delivery-promise.md) | Pre-purchase availability engine — accurate delivery dates and methods indexed across storefront, search, and checkout | Camila Vidal |
| [Order Allocation](modules/order-allocation/order-allocation.md) | Post-purchase routing engine — selects the optimal supplier combination to fulfill orders at lowest cost-to-serve | Camila Vidal |
| [Fulfillment](modules/fulfillment/fulfillment.md) | Delivery options configuration, fulfillment pricing, supplier management, and operational capacity | Carolina Rodrigues |
| [Order Management](modules/order-management/order-management.md) | OMS core — order lifecycle, modifications, returns, agentic workflows, and lifecycle management | Marcelo Leonel |
| [Pick and Pack](modules/pick-and-pack/pick-and-pack.md) | In-store and warehouse fulfillment operations — mobile picking, packing workflows, and grocery Tier 1 expansion | Sayonara Soares |

---

## Repository Structure

```
vertical-distributed-order-management-dom/
├── README.md
└── modules/
    ├── delivery-promise/
    │   ├── delivery-promise.md
    │   └── availability-engine/
    │       ├── product-vision.md
    │       └── specs/
    │           └── 001-delivery-promise-open-beta/
    │               └── product-brief.md
    ├── order-allocation/
    │   ├── order-allocation.md
    │   └── async-purchase/
    │       ├── product-vision.md
    │       └── specs/
    │           └── 001-async-order-allocation/
    │               └── product-brief.md
    ├── fulfillment/
    │   ├── fulfillment.md
    │   ├── delivery-options/
    │   │   └── product-vision.md
    │   └── delivery-pricing/
    │       ├── product-vision.md
    │       └── specs/
    │           └── 001-delivery-pricing-service/
    │               └── product-brief.md
    ├── order-management/
    │   ├── order-management.md
    │   ├── order-lifecycle-management/
    │   │   └── product-vision.md
    │   ├── returns-and-exchanges/
    │   │   ├── product-vision.md
    │   │   └── specs/
    │   │       └── 001-returns-exchanges-workflow/
    │   │           └── product-brief.md
    │   └── agentic-workflow/
    │       └── product-vision.md
    └── pick-and-pack/
        ├── pick-and-pack.md
        └── pick-and-pack-experience/
            ├── product-vision.md
            └── specs/
                └── 001-scan-first/
                    └── product-brief.md
```
