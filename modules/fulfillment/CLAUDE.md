# CLAUDE.md — Fulfillment Module

> Onboarding file for AI agents working in this module.
> Keep this file short. Update the tables when new specs or features are added.

## What this module is

Fulfillment owns the configuration and execution layer between order placement and shipment: shipping policies, carriers, warehouses, docks, inventory, operational capacity, and the two new services (Delivery Options and Delivery Pricing) that decouple delivery configuration from freight tables.

Full module context: [`fulfillment.md`](./fulfillment.md)

---

## Directory structure

```
fulfillment/
├── fulfillment.md                  ← module overview (team, services, problems)
├── CLAUDE.md                       ← this file
├── shipping-strategy/              ← feature: Shipping Simulator + Pickup Points
├── delivery-options/               ← feature: Delivery Options (Closed Beta)
├── delivery-pricing/               ← feature: Delivery Pricing
├── inventory-management/           ← feature: Batch Inventory Updates
├── operational-capacity/           ← feature: Operational Capacity
└── known-issues/                   ← 37 classified known issues (helpful / important / no-fix / not-classified)
```

Each feature folder follows this pattern:
```
<feature>/
├── product-vision.md     ← long-term direction (when exists)
└── specs/
    └── NNN-<name>/
        ├── product-brief.md   ← problem + scope + MMR
        └── product-spec.md    ← user stories, acceptance scenarios, FRs, API mapping
```

---

## Active specs (what is being built now)

| # | Feature | Spec | Status |
|---|---|---|---|
| SS-001 | shipping-strategy | [Shipping Simulator — Shoreline Redesign](shipping-strategy/specs/001-shipping-simulator-shoreline-redesign/product-spec.md) | Under definition |
| SS-002 | shipping-strategy | [Recent Simulations](shipping-strategy/specs/002-shipping-simulator-recent-simulations/product-spec.md) | Under definition |
| SS-003 | shipping-strategy | [Pickup Point Migration](shipping-strategy/specs/003-pickup-point-migration/product-spec.md) | Under definition |
| OC-001 | operational-capacity | [Past Capacity Observability + Public API](operational-capacity/specs/past-capacity-observability.md) | Under definition |
| IM-001 | inventory-management | [Batch Inventory Updates](inventory-management/specs/001-batch-inventory-updates/product-spec.md) | Under definition |

---

## Key constraints

- **Do not modify legacy repos.** The current Shipping Simulator lives in `vtex/vcs.logistics-ui` and `vtex/vcs.logistics` — Knockout.js, 10+ years old, pre-IO. The new app is `vtex/admin-shipping-simulation` (Raccoon + Shoreline). Surgical fixes in the legacy codebase are explicitly out of scope.
- **Prototypes are HTML only.** Files under `*/prototype/` are self-contained HTML files for UX validation — not Raccoon apps. Do not try to run them with `vtex link`.
- **Known issues are read-only context.** Files under `known-issues/` document existing platform bugs. Do not generate fixes from them unless a spec explicitly references a KI as in-scope.

---

## How to navigate a spec

1. Start with `product-brief.md` — problem, scope, and MMR definition.
2. Read `product-spec.md` — user stories, acceptance scenarios (Given/When/Then), functional requirements (FR-XXX), API mapping, and success criteria.
3. If the spec references `api-error-diagnostics.md`, read it for the full error state decision tree.
4. Open the prototype in `*/prototype/` to understand the intended UX before writing any code.
