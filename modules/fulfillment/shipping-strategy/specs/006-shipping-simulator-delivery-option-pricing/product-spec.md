# Product Spec — Shipping Simulator: Delivery Option & Pricing Visibility

## Clarifications

- Q: What is the difference between "Shipping rate" and "Shopper price"? → A: "Shipping rate" is the value from the shipping rate table (carrier/pickup rate, before delivery-option pricing). "Shopper price" is what the shopper is charged at checkout after the delivery option's pricing rule is applied.
- Q: Is this feature read-only? → A: Yes. The simulator only displays the delivery option and pricing information. It does not create or edit delivery options or pricing rules.
- Q: When is the shopper price shown? → A: Only when the delivery option applies pricing beyond cost pass-through (markup or fixed amount). Pure cost pass-through adds nothing over the rate table, so no additional information is shown.
- Q: Which pricing models are represented? → A: Cost pass-through, markup (percentage), and fixed amount — aligned with the Delivery Options pricing configuration.
- Q: How is a free / non-numeric rate handled? → A: The shopper price mirrors the base value; no pricing math is applied.
- Q: Does the shopper price respect regional differences? → A: Yes. It reflects the shipping rate applicable to the simulated context, including per-region (ZIP) variations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Operator sees the shopper price next to the carrier rate (Priority: P1)

A logistics manager runs a simulation and, for each option with delivery pricing configured, sees both the shipping rate (rate table) and the shopper price (what the customer pays), with the delivery option name underneath.

**Why this priority:** This is the core value proposition. Without it, operators cannot validate final pricing from the simulator and must cross-reference the Delivery Options configuration manually.

**Acceptance Scenarios:**

1. **Given** a completed simulation with at least one option that has delivery pricing configured, **When** the operator views the results, **Then** a "Shopper price" is shown next to the shipping rate for those options.
2. **Given** a result whose delivery option applies a markup, **When** the operator reads it, **Then** the shopper price is higher than the shipping rate by the configured percentage.
3. **Given** a result whose delivery option charges a fixed amount, **When** the operator reads it, **Then** the shopper price equals that fixed amount regardless of the shipping rate.
4. **Given** any option with delivery pricing, **When** the operator reads it, **Then** the delivery option name is displayed alongside the shopper price.

---

### User Story 2 — Cost pass-through adds no extra information (Priority: P1)

An operator runs a simulation where some options simply pass the carrier rate through to the shopper. For those options, the simulator does not show a separate shopper price or pricing breakdown, avoiding redundant information.

**Why this priority:** Showing a shopper price identical to the shipping rate adds noise and undermines the operator's ability to spot where pricing rules actually change the final price.

**Acceptance Scenarios:**

1. **Given** an option whose delivery option uses cost pass-through, **When** the operator reads it, **Then** no additional shopper price is shown for that option.
2. **Given** a result set where every option is cost pass-through, **When** the operator views the results, **Then** the shopper-price information is not shown at all.
3. **Given** a result set mixing pass-through and priced options, **When** the operator views the results, **Then** the shopper-price information appears only for the priced options.

---

### User Story 3 — Operator understands how the final price is formed (Priority: P1)

An operator inspecting a result can see which delivery option groups the shipping policy and how the rate-table price becomes the shopper price (which pricing rule was applied and the final value).

**Acceptance Scenarios:**

1. **Given** an option with delivery pricing, **When** the operator opens its details, **Then** the delivery option, the pricing rule, and the final shopper price are shown together.
2. **Given** a markup rule, **When** the operator reads the details, **Then** the markup percentage is visible.
3. **Given** a fixed-amount rule, **When** the operator reads the details, **Then** the fixed value is visible and equals the final shopper price.

---

### User Story 4 — Multi-currency and multi-language parity (Priority: P2)

Operators on BR, US, and MX accounts, and in PT/EN/ES, see the shopper price and delivery option information correctly localized and formatted.

**Acceptance Scenarios:**

1. **Given** a BR account (R$), **When** a markup is applied, **Then** the shopper price uses a comma decimal separator and two decimals.
2. **Given** an MX account (MX$) with an integer rate, **When** a markup is applied, **Then** the shopper price is formatted without decimals.
3. **Given** the UI language is PT, EN, or ES, **When** the results and details are rendered, **Then** all labels, delivery option names, and pricing model names are translated.

---

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | For each result whose delivery option has pricing configured, the simulator MUST display the final shopper price next to the shipping rate | P1 |
| FR-002 | The shopper price MUST be accompanied by the delivery option name that groups the shipping policy | P1 |
| FR-003 | The simulator MUST resolve each shipping policy to a delivery option and a pricing model | P1 |
| FR-004 | The simulator MUST represent three pricing models: cost pass-through, markup (percentage), and fixed amount | P1 |
| FR-005 | For markup, the shopper price MUST equal the shipping rate increased by the configured percentage | P1 |
| FR-006 | For fixed amount, the shopper price MUST equal the configured value, independent of the shipping rate | P1 |
| FR-007 | For cost pass-through, no separate shopper price MUST be shown, since it equals the shipping rate | P1 |
| FR-008 | When no option in a result set has delivery pricing, the shopper-price information MUST NOT be shown | P1 |
| FR-009 | The result detail MUST explain how the shopper price is formed: delivery option, pricing rule, and final price | P1 |
| FR-010 | The shopper price MUST reflect the shipping rate applicable to the simulated context, including regional (per-ZIP) variations | P1 |
| FR-011 | The shopper price MUST use the currency and decimal formatting conventions of the simulated account (BR, US, MX) | P1 |
| FR-012 | For a free / non-numeric rate, the shopper price MUST mirror the base value with no pricing math | P2 |
| FR-013 | PT-BR, EN, and ES MUST have identical feature coverage and translated labels | P1 |

---

## Non-functional Requirements

| Requirement | Detail |
|---|---|
| **Read-only** | The feature only displays delivery option and pricing information. It never writes to delivery options or pricing rules. |
| **Source of truth** | The mapping of shipping policy → delivery option → pricing rule must come from the Delivery Options configuration (see Open Questions in the brief). |
| **Language parity** | PT-BR, EN, and ES must have identical coverage and translated strings. |
| **Formatting fidelity** | Shopper price formatting must match the simulated account's locale (currency symbol, decimal separator, decimals). |
| **No added latency** | Surfacing this information must not measurably affect simulation or rendering time. |
