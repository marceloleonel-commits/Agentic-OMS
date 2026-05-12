# Product Brief — Predefined Strategy Presets

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

**Title:** Order Allocation Agent — Start from a Predefined Strategy Preset

**Description:** With this release, merchants like C&A and OBI will be able to configure an allocation strategy by selecting a predefined preset — Cost Minimization, Speed Optimization, or Balanced — instead of starting from a blank natural language prompt. This means that they can go from zero to a configured strategy faster, reduce the risk of ambiguous or conflicting intents on the first attempt, and treat presets as a proven baseline to refine rather than a starting point to invent from scratch.

**Availability:** H2-2026 · Open Beta — Global

**Target Audience:**
- Tier: Tier 1 & 2
- Merchant Profile: Omnichannel B2C retailer, multi-node fulfillment
- Persona: Omnichannel Manager / Logistics Operations Manager
- Pain: Free-form input is intimidating for merchants who do not know which cost dimensions to prioritize or what language the agent expects
- Use Case: Accelerate configuration for merchants who want a sensible default before customizing

---

## Feature Delta

In MMR 001, the only entry point to strategy configuration is a free-form natural language prompt. While powerful, this creates friction for merchants who are unfamiliar with cost dimensions or are configuring a strategy for the first time.

This MMR introduces a preset library as an alternative starting point. Presets are VTEX-curated weight configurations that represent well-understood optimization patterns. Selecting a preset bypasses the initial clarification dialogue and takes the merchant directly to the interpretation review step — with the option to customize further before simulating.

## Why this ships as its own MMR

Presets require the full configuration, simulation, and publication flow from MMR 001 to exist before they can add value. A preset is a shortcut into that flow, not a replacement for it. Conversely, MMR 001 is complete without presets: the free-form path remains fully functional. Presets reduce friction but do not unlock any new category of outcome — they are an independent capability that accelerates adoption rather than expanding the feature boundary.

## Scope

- Preset library with three initial options: **Cost Minimization** (maximize shipping + handling savings), **Speed Optimization** (minimize delivery time within acceptable cost bounds), and **Balanced** (equal weight between cost and speed).
- Each preset displays a plain-language description and the cost dimensions it emphasizes before selection.
- Selecting a preset populates the interpretation summary with the preset's weight configuration, which the merchant can review and adjust before approving.
- The merchant can switch from preset-based to free-form input at any point during the configuration step.
- After preset selection, the remaining flow (interpretation review → simulation → publication) is identical to MMR 001.

**Not in scope:** Merchant-created custom presets, preset sharing across accounts, preset versioning, preset performance benchmarks shown in the library (deferred to later releases).
