# Product Brief: Pick and Pack — Threshold Configuration

| Status | Draft | Owner | Sayonara Soares |
|---|---|---|---|
| Created | May 2026 | Product Line | Commerce Platform |

---

## 1. Pain Statement

Store managers at grocery merchants struggle with configuring picker action thresholds in Pick and Pack Admin when trying to enforce bidirectional financial and operational boundaries on in-store order changes. This results in uncontrolled margin exposure on weighable items — because the Admin UI only accepts one direction at a time and conflates weight and quantity into a single control — forcing merchants to either absorb weight variance costs or disable picker actions that grocery operations require.

---

## 2. Evidence

**Scale and commercial context**

- `PM observation` — 7 active Pick and Pack merchants. The top 2 by volume are grocery merchants (Hiperideal and Flora y Fauna).
- `PM observation` — Hiperideal processes approximately 4,000 orders/month in Pick and Pack. Flora y Fauna processes approximately 2,000 orders/month. Grupo Ramos is currently onboarding and is projected to reach 2,000 orders/month — and is the highest ACV account in the Pick and Pack portfolio at $200,000 USD.
- `Market data (large grocery chain, unnamed)` — Approximately 60% of grocery orders are modified by pickers during the picking flow. Applied to current volume: roughly 3,600 orders/month across Hiperideal and Flora y Fauna are subject to picker changes. At full Grupo Ramos ramp, that rises to approximately 4,800 orders/month.

**The threshold model**

- `PM observation` — The threshold setup in Pick and Pack Admin uses a single slider ranging from -100% to +100%. The slider only accepts one direction per configuration session — a positive value and a negative value cannot be set simultaneously for the same dimension.
- `PM observation` — Weight and quantity share a single threshold control in the Admin UI, despite being separate values in the underlying data model. A merchant cannot configure a weight tolerance of ±15% and a quantity tolerance of ±1 unit independently — any threshold set applies to both.
- `PM observation` — All active grocery merchants have raised complaints about this limitation. No merchant is intentionally relying on the one-directional behavior.

**Financial exposure**

- `PM observation` — Grocery merchants operate on tight contribution margins per order. On weighable items such as meat, when a picker cannot correctly adjust weight downward (because the merchant configured only a positive threshold to allow overages), the merchant charges the shopper the sold weight rather than the actual weight. The merchant absorbs the difference. At the scale of 3,600–4,800 modified orders/month, this exposure accumulates across every weighable line item in every modified order.
- `PM observation` — Grupo Ramos, the highest ACV account at $200,000 USD, is currently onboarding. Threshold configuration is a known operational requirement for their go-live. Unresolved, this limits their ability to operate correctly from launch.

---

## 3. Current Workarounds

**1. Accept margin loss on weight under-charges.**
Grocery merchants configure only a positive weight threshold to allow legitimate weight overages (actual item weighs more than sold weight). Because a simultaneous negative limit cannot be configured, pickers can also reduce weight without restriction. Merchants absorb the pricing delta as an operational cost.

*Limitations:* This is not a workaround — it is margin absorption at scale. At 60% order change rate across 6,000–8,000 monthly orders, the exposure is continuous and grows with volume. No configuration change available today eliminates it without disabling picker weight changes entirely.

**2. Disable picker weight changes entirely.**
Some merchants remove the weight change permission to prevent under-charge risk. Shoppers are then charged for the sold weight regardless of actual weight delivered.

*Limitations:* Disabling weight change is not operationally viable for grocery merchants selling produce and meat by weight — it is a core picker capability, not an optional one. Disabling it transfers the financial error from the merchant to the shopper, creating customer experience failures in a segment where retention is driven by order accuracy.

---

## 4. Opportunity

The backend data model already stores weight and quantity as separate values. The conflation exists only in the Admin UI — the threshold slider was built as a single control over both dimensions. This means the fix is a UI change, not a data model change: lower engineering risk, no data migration, and faster to ship than the problem description might suggest.

If the Admin UI is updated to allow independent bidirectional thresholds — a separate positive and negative limit for weight, and a separate positive and negative limit for quantity — grocery merchants can configure the exact operational boundaries their fulfillment requires. Pickers retain the flexibility to correct item weight and quantity within defined bounds. Merchants stop absorbing the cost of changes that fall outside those bounds.

This removes the structural limitation that today forces the top 2 grocery merchants to choose between margin exposure and operational capability. It also unblocks Grupo Ramos — the highest ACV account in the portfolio — from launching with correct threshold governance in place.

---

## 5. Success Signal

*Observable within 30–60 days of shipping:*

- Hiperideal and Flora y Fauna confirm they no longer absorb weight variance costs on weighable items — no manual cost absorption reported for the period following the fix.
- Store managers with VTEX Admin access can set a positive and a negative threshold independently for weight, and a separate positive and negative threshold for quantity, in a single Admin configuration session.
- Grupo Ramos onboarding proceeds without threshold configuration as a blocker.
- Zero support tickets citing threshold configuration confusion from active merchants in the 60-day window post-fix.

---

## 6. Resolved Questions

| Question | Answer |
|---|---|
| Backend model for weight vs. quantity | Separate values in the data layer. The conflation is UI-only — this is a UI fix, not a data model change. |
| Financial exposure | ~3,600–4,800 orders/month with picker changes across active grocery accounts. Grocery contribution margins are thin; on weighable items, weight variance that merchants cannot constrain is absorbed as direct margin loss. |
| Threshold scope | Global per merchant. Category-level granularity is out of scope — simpler to configure and operationally sufficient. |
| Merchants relying on one-sided behavior | None. All active merchants have raised complaints about the limitation. |
| Admin user for threshold configuration | Any user with VTEX Admin access. No role-specific constraint required. |
