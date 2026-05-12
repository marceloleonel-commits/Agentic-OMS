# Product Brief — Agent Core Configuration Flow

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

**Title:** Order Allocation Agent — Configure, Simulate & Deploy Strategies

**Description:** With this release, merchants like C&A and OBI will be able to describe allocation goals in natural language, simulate the impact on historical orders, and publish a strategy to production — all through the Order Allocation Agent in VTEX Admin. This means that they can configure smart allocation without technical knowledge, validate expected cost savings and SLA impact before going live, and deploy strategies with a single explicit approval.

**Availability:** H1-2026 · Closed Beta — Global

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Cannot align allocation with business goals; allocation is a black box
- Use Case: Configure and deploy cost-aware allocation strategies without manual workarounds

---

## Feature Delta

Today, there is no way for merchants to express a business goal and have it translate into allocation logic. They are forced into costly workarounds: manipulating freight tables, deactivating sellers, or bypassing VTEX entirely.

This MMR introduces the complete configuration and deployment flow — from natural language intent to live allocation strategy — with a simulation gate that ensures merchants only go live with evidence of expected outcomes.

## Why these three capabilities ship as one MMR

Natural language configuration, simulation, and publication are inseparable in the first release:
- You cannot publish without first simulating (blocked by design in Closed Beta).
- Simulation alone has no value without a strategy to simulate.
- Configuration without publication produces no operational change.

Together they form one coherent, marketable capability: **"describe what you want, test it, go live."**

## Scope

- Free-form natural language input describing allocation goals.
- Agent interprets intent into weighted cost dimensions; asks clarifying questions when intent is ambiguous.
- Merchant reviews human-readable interpretation summary and approves.
- Simulation on a merchant-selected historical period, returning mandatory KPIs.
- Merchant iterates with the agent and re-runs simulation until satisfied.
- Explicit publication step: strategy goes live on merchant approval.

**Not in scope:** Real-time monitoring (MMR 002), predefined presets (MMR 003), autonomous agent publication, A/B testing, strategy versioning.
