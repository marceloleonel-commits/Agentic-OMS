# Session: Pick and Pack — Threshold Configuration

## Skill trail
- vtex-product-brief — 2026-05-15
- vtex-mmr-scope — 2026-05-15

## ICP confirmed
Store managers at grocery merchants (Hiperideal, Flora y Fauna, Grupo Ramos) with VTEX Admin access, responsible for configuring picker action thresholds. Commerce Platform product line.

## Validated directions
- Fix is UI-only — backend already stores weight, quantity, price, and total order value as separate values. No data model change required. — confirmed in vtex-product-brief and vtex-mmr-scope
- Threshold scope is global per merchant — category-level granularity explicitly ruled out. — confirmed in vtex-product-brief
- All four dimensions (weight, quantity, price, total order value) require independent bidirectional thresholds (separate positive and negative limits for each). — confirmed in vtex-mmr-scope
- Release type: Improvement. — confirmed in vtex-mmr-scope
- All four dimensions ship to merchants as a single release — partial availability is not a valid release state. Development can sequence by dimension for testing. — confirmed in vtex-mmr-scope

## Discarded options
- Category-level threshold configuration — discarded because it adds configuration complexity without operational need; global scope is sufficient and easier to escalate.
- Threshold breach visibility / audit trail — out of scope for this MMR; separate initiative.
- Per-store threshold configuration — out of scope; global per merchant only.

## Scope decisions
- In scope: Admin UI fix to allow independent bidirectional thresholds for weight, quantity, price, and total order value — separately per dimension — global per merchant.
- Out of scope: category-level thresholds, data model changes, threshold breach visibility, per-store configuration, any threshold dimensions beyond the four named above.

## Open decisions
- Non-blocking: UX design for the threshold input component (dual numeric fields vs. range input with two handles). Resolvable during development.

## Open questions
- Financial delta from weight variance (actual vs. sold weight) across Hiperideal and Flora y Fauna is not yet quantified. Weight-change events are not stored in the database, so this requires a different instrumentation approach or merchant-side data pull before leadership review.
- Team name as seen in vai.vtex.com/tech-org — needed to complete the Slack announcement draft.
