# Product Brief — Merchant-Provided Cost Variables

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

**Title:** Cost Minimization Solver — Inject Your Own Cost Variables

**Description:** With this release, merchants like C&A and Intimissimi will be able to inject explicit cost variables that are not natively available in VTEX — such as marketplace commissions, franchise royalties, custom handling rates, and tax differentials per seller location — directly into the allocation solver. This means that optimization reflects their actual economics instead of just what VTEX knows, sellers that appear cheap on shipping but carry high commissions are correctly penalized, and the solver makes decisions on total cost rather than a partial view of it.

**Availability:** Open Beta · H2-2026

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer operating mixed seller networks — DCs, franchise stores, marketplace sellers — each with distinct commercial structures not captured in VTEX shipping or warehouse configurations
- Persona: Omnichannel Manager / Logistics Operations Manager / Finance Operations
- Pain: The solver minimizes shipping + handling (what VTEX knows), but merchants have significant costs that live outside VTEX — commissions, fees, tax differentials — that can reverse the cost ranking between sellers
- Use Case: Make the solver's cost model reflect the merchant's true total cost-to-serve, not just the costs VTEX can observe natively

---

## Feature Delta

In MMR 001, the cost model is fixed: `Total Cost = product price + shipping cost + handling cost`, all sourced from VTEX-native configurations (shipping tables and warehouse entity). This is a good first approximation, but it misses cost dimensions that can be significant:

- A marketplace seller may have 12% commission on GMV that makes it more expensive than a DC even with lower shipping.
- A franchise store may carry a royalty fee per order that the franchise group pays.
- Tax regimes differ by seller location — a seller in a favorable tax state may have lower effective cost.
- Some sellers have negotiated SLA breach penalties that should factor into allocation risk.

This MMR extends the cost model to accept merchant-provided explicit cost variables, ingested via API or configured through the Order Allocation Agent interface. The solver normalizes all inputs to the same scale before optimization.

## Why this ships as its own MMR

Merchant-provided cost variables require the core solver (MMR 001) to be operational and trusted before merchants will invest in providing additional cost data. It also requires a data ingestion and normalization layer that does not exist in the VTEX-native cost model. The value is independently communicable: "optimize on your complete cost picture, not just what VTEX sees." It does not require behavioral inference (MMR 003) — these are explicitly declared costs, not inferred ones.

## Scope

- Merchants can define additional cost variables per seller (or seller group): commission rate (% of order value), flat fee per order, custom handling rate (override of warehouse entity default), tax differential (% adjustment), and SLA breach penalty (flat fee per late order).
- Cost variables can be provided via: (a) API (batch upload per seller), or (b) the Order Allocation Agent interface (natural language or structured form).
- All merchant-provided costs are normalized to the same monetary scale as VTEX-native costs before entering the solver.
- The extended cost model: `Total Cost = product price + shipping cost + handling cost + Σ(merchant-provided explicit costs)`.
- The simulation report (MMR 001) shows a breakdown of VTEX-native costs vs. merchant-provided costs per evaluated combination, so merchants can see how the extended model changes allocation decisions.
- If a merchant-provided cost variable is missing for a seller, the solver falls back to the VTEX-native model for that seller — no order is left unallocated.

**Not in scope:** Real-time cost variable updates during active orders (costs are evaluated at allocation time, not updated post-purchase), cost variables shared across merchant accounts, cost variables derived from behavioral signals (deferred to MMR 003), inferring missing cost variables when no data is provided.
