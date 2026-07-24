# Product Brief — Shipping Simulator: Delivery Option & Pricing Visibility

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carolina Tourinho |
| **Eng Champion** | TBD |
| **Status** | Under definition |
| **Expected Release** | TBD |
| **Availability** | TBD |
| **Mode** | B2C & B2B |
| **Depends on** | `002-shipping-simulator-redesign` |

---

## MMR

**Title:** Shipping Simulator — Delivery Option & Pricing Breakdown

**Description:** With this release, logistics operators will be able to see, for each simulated result, not only the shipping rate from the rate table but also the **price the shopper actually pays** and the **delivery option** that groups the shipping policy. A new "Shopper price" column and a "Delivery option & pricing" section in the result drill-down make explicit how the rate-table price is transformed into the final shopper price by the delivery option's pricing rule (cost pass-through, markup, or fixed amount).

**Availability:** TBD

**Target Audience:**
- **Tier:** All tiers
- **Merchant Profile:** Accounts with active logistics operations that use Delivery Options to package shipping policies and apply pricing rules (markup, fixed amount, cost pass-through)
- **Persona:** Logistics Administrator / Operations Manager
- **Pain:** Today the simulator shows only the shipping rate (rate table value). Operators cannot tell, from the simulation, what the shopper will actually be charged at checkout, nor which delivery option a given shipping policy is exposed under. This forces them to cross-reference the Delivery Options configuration manually and makes it hard to validate pricing before go-live.
- **Use Case:** Validate that a markup configured on the "Fast delivery" option is correctly applied on top of the SEDEX rate; confirm that a "Same-day" option charges the intended fixed amount regardless of the carrier rate; explain to a stakeholder why the shopper price differs from the carrier rate.

---

## Feature Delta

The current Shipping Simulator (both legacy and Shoreline redesign) surfaces a single monetary value per result: the **shipping rate** from the rate table (carrier/pickup rate, before delivery-option pricing). It does not represent the **Delivery Options** layer that groups shipping policies and applies a pricing rule to produce the price shown to the shopper at checkout.

This MMR adds a read-only visibility layer that closes that gap:

- A **"Shopper price"** column next to "Shipping rate", with the delivery option name underneath.
- A **"Delivery option & pricing"** block in the result drill-down showing the chain **rate table (base) → pricing rule → final shopper price**, plus a short explanation of the applied model.

> **Why a separate MMR from the Shoreline redesign (`002`)?** The redesign (`002`) focuses on the core simulation experience — form, results, delivery-time breakdown, and error visibility. This MMR introduces a distinct product concept (Delivery Options + pricing rules) that is orthogonal to the delivery-time/route breakdown. It has its own data contract (mapping policy → delivery option → pricing rule), a different validation story (pricing correctness vs. availability/lead time), and an independent delivery timeline. Bundling it would blur the engineering contract of `002`.

---

## Scope

### Shopper price column
- New column **"Shopper price"** in the results table (Admin UI), positioned immediately after **"Shipping rate"**.
- Each cell shows the final price the shopper pays for that option and, underneath, the **delivery option** name that groups the shipping policy.
- Applies to both the combined results table and the per-item (individual results) tables.

### Delivery option & pricing drill-down block
- New block **"Delivery option & pricing"** inside the existing "Show details" drill-down, alongside "Logistics route" and "Delivery time breakdown".
- Shows the delivery option name, the pricing rule (as a badge), and the value flow: **rate table (base) → pricing rule → final shopper price**.
- Includes a one-line note explaining the applied pricing model.

### Pricing models (aligned with Delivery Options)
- **Cost pass-through:** the rate-table price is passed to the shopper unchanged (base = final).
- **Markup:** a percentage is added on top of the rate-table price.
- **Fixed amount:** a flat price is charged, independent of the rate-table price.

### Policy → delivery option → pricing mapping
- Each shipping policy resolves to one delivery option and one pricing rule.
- A deterministic fallback applies when a policy has no explicit mapping (express SLAs → markup under a "Fast delivery" option; standard SLAs → cost pass-through under an "Economy" option).

### Regional and multi-currency behavior
- The shopper price is recomputed from the shipping rate in effect at render time, so it respects per-ZIP rate variations.
- Currency symbol and decimal formatting mirror the source rate (BR, US, MX formats supported).

### Language parity
- PT-BR, EN, and ES have identical coverage and translated strings.

---

## Not in scope
- Editing delivery options or pricing rules from the simulator (read-only visibility only).
- Simulating promotions, coupons, or free-shipping thresholds.
- Loading dock fees and additional shipping costs breakdown (covered by the shipping-cost composition, not this MMR).
- Persisting or exporting the pricing breakdown.
- Real-time integration with the production Delivery Options / pricing engine (prototype uses a mapped configuration).

---

## Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What is the source of truth for the policy → delivery option mapping at runtime (Delivery Options API vs. shipping-policy metadata)? | Engineering | Open |
| 2 | Should the shopper price reflect all pricing segmentations (all carts / sales channel / cart amount / delivery zone), or only the default segmentation for the simulated context? | PM | Open — current assumption: default segmentation for the simulated sales channel |
| 3 | When a policy belongs to multiple delivery options, which one should the simulator show? | PM | Open |
| 4 | Should loading dock fees be folded into the "base" or shown as a separate step before the pricing rule? | PM / Eng | Open |
