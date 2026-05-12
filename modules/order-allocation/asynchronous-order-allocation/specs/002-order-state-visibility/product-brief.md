# Product Brief — Order State Visibility

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

**Title:** Asynchronous Order Allocation — See Every Order's Allocation State

**Description:** With this release, merchants like C&A and Intimissimi will be able to see exactly where each order is in the allocation process — being evaluated, awaiting their review, failed, completed, or canceled — directly in VTEX Admin. This means that they can distinguish a pending allocation from a fulfillment delay, act on the review window before it closes, understand why a specific allocation succeeded or failed, and stop relying on support tickets to know what happened to an order.

**Availability:** Closed Beta · Q1-2026

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer operating post-placement async allocation
- Persona: Omnichannel Manager / Logistics Operations Manager / Customer Service Operations
- Pain: When async allocation is running, orders exist in a state that has no representation in VTEX Admin. Merchants cannot tell if an order is being evaluated, awaiting their review, or already finalized — leading to confusion between allocation delays and fulfillment problems.
- Use Case: Monitor the allocation state of individual orders and the full pipeline, act on review windows before they expire, and diagnose failures without opening a support ticket

---

## Feature Delta

In MMR 001, the async evaluation runs and the review window exists — but neither are visible in VTEX Admin. From the merchant's perspective, every order looks identical regardless of whether it is being evaluated, awaiting review, or already assigned to a seller.

This MMR surfaces the allocation state of every order in VTEX Admin. States are named, timestamped, and actionable where the merchant needs to act. The review window is not just a backend event — it is a visible, time-bounded prompt that the merchant can respond to from the order detail page.

## Why this ships as its own MMR

State visibility is independently deployable from the async infrastructure (MMR 001). The evaluation can run without a UI — states transition behind the scenes. But merchants operating in Closed Beta need this transparency from day one to build trust, act on review windows, and distinguish allocation events from operational issues.

## Scope

- Five merchant-visible allocation states, shown on the order detail page with timestamps:
  - **Evaluating** — a new allocation is being calculated; seller orders have not yet been created.
  - **Awaiting Your Review** — a proposed allocation is ready; the merchant must approve, dispute, or cancel before seller orders are created.
  - **Evaluation Failed** — the calculation did not produce a valid result; the system is retrying automatically or waiting for merchant action.
  - **Allocated** — the process completed; seller orders were created with the new allocation.
  - **Allocation Canceled** — the process ended without a new allocation; seller orders were created with the original checkout allocation.
- Orders excluded from async evaluation (ineligible) show no allocation state — they display the checkout allocation result directly.
- The **Awaiting Your Review** state is actionable from the order detail page: approve, dispute, or cancel.
- A pipeline view showing all orders currently in **Evaluating** or **Awaiting Your Review**, with elapsed time per state.
- In-app notification when an order enters **Awaiting Your Review**.
- Allocation state transitions available as VTEX order events for integration with external systems (OMS, WMS).

**Not in scope:** Shopper-facing state visibility, email or SMS notifications (in-app only in Closed Beta), state visibility for orders placed before this MMR was activated.
