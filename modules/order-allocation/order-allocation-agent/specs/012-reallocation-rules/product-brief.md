# Product Brief — Reallocation Rules

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

**Title:** Order Allocation Agent — Configure When and How Orders Are Reallocated

**Description:** With this release, merchants like C&A and OBI will be able to define — in natural language — the rules that govern when an already-created order gets reallocated to a different seller, and what conditions must be met for that reallocation to proceed automatically or require their review. This means that they stop losing revenue to unhandled seller cancellations, can trigger reallocation manually for specific orders when needed, and can configure automatic reallocation rules so that routine reassignments happen without manual intervention — within the boundaries they define.

**Availability:** GA · 2027

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer with multi-node fulfillment networks where seller cancellations, stockouts, and strategy-driven reassignments are routine operational events
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Today, when a seller cancels or stock runs out after order creation, there is no system-level mechanism to find a replacement. The merchant intervenes manually — which is slow, inconsistent, and doesn't scale.
- Use Case: Configure the conditions under which the system reallocates automatically, define the rules it must respect, and retain manual reallocation as an escape hatch for cases outside the rules

---

## Feature Delta

The Asynchronous Order Allocation infrastructure (MMR 001) supports reallocation — the system can find a replacement seller after an order is created. But in that MMR, triggers are limited to system events (seller cancellation, stockout), and every proposed reallocation goes to the merchant for manual review.

This MMR gives merchants control over that process through the agent:

- **Manual reallocation**: the merchant can request reallocation for a specific order directly from the order detail page, with the agent finding the best available replacement.
- **Automatic reallocation rules**: the merchant defines conditions — in natural language — under which the system reallocates automatically, without requiring review for every order. Rules can include triggers (what causes reallocation), guards (what prevents it), and thresholds (how much better the new allocation must be before acting).

## Why this ships as its own MMR

Reallocation rule configuration requires the async infrastructure (MMR 001) to be stable and proven in Closed Beta before merchants can safely delegate reallocation decisions to rules. It is also a meaningfully different capability from initial allocation strategy configuration (MMR 001 of the agent) — it operates on orders that already exist, with different constraints and different risk profile. The merchant value is independently communicable: "define when the system reallocates on its own, and when it waits for you."

## Scope

**Manual reallocation:**
- Merchant can request reallocation for any specific order in a pre-fulfillment state directly from the order detail page.
- The agent evaluates available sellers and proposes the best replacement within the original SLA.
- The merchant reviews and approves the proposed replacement before the order is reassigned.

**Automatic reallocation rules (configured through the agent):**
- **Triggers**: what events start a reallocation evaluation — e.g., "when a seller cancels," "when stock runs out," "when a seller's on-time rate drops below a threshold."
- **Guards**: conditions that prevent reallocation — e.g., "never reallocate an order that has been in the system for more than 4 hours," "never reallocate orders above R$2,000 without my review."
- **Thresholds**: how much better the replacement must be before acting automatically — e.g., "only reallocate automatically if the new seller is at least 10% cheaper."
- **Review requirement**: the merchant can define which reallocation scenarios always require their review (go to Awaiting Your Review) vs. which can be approved automatically.

**Not in scope:** Reallocation of orders already in fulfillment (picked, packed, or shipped), re-promising a new SLA to the shopper, reallocation triggered by external systems via API (future capability), bulk reallocation across all orders matching a condition.
