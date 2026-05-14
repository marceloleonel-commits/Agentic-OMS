# Session: Change Seller — Partial Seller Reallocation

## Skill trail
- vtex-product-brief — 2026-05-14

## ICP confirmed
Merchants operating multi-seller marketplaces and omnichannel fulfillment networks — specifically OMS Operators, SAC Agents, and Marketplace Admins at Tier-1 and advanced Tier-2 accounts. Segments confirmed: fashion, construction, home improvement, marketplace operators.

## Validated directions
- Problem is scoped to Commerce Platform (not Ads or CX) — confirmed in product-brief
- Core problem is the inability to perform partial, item-level seller reallocation at late order statuses (picking, invoicing, shipping) — confirmed in product-brief
- OMS as operational source of truth (vs. external tools) is a key strategic framing — confirmed in product-brief

## Discarded options
- None explicitly discarded during this session

## Scope decisions
- In scope: physical goods fulfillment (delivery, BOPIS, store pickup), partial quantity moves, OrderGroup-level reallocation, external (3P) sellers, payment connector fallback
- Out of scope: digital products, subscriptions, full Checkout replacement, complete financial/accounting ledger, replacing external enterprise OMS across the whole company

## Open questions
- Minimum financial compliance rules per region (Brazil, US, EU) — not resolved
- Depth of automation for refunds/adjustments vs. ERP/PSP delegation — not resolved
- Marketplace commercial policy layer requirement for 3P reallocation — not resolved
- Coexistence patterns for Tier-1 merchants with external order brokers — not resolved
- Migration toolkit and deprecation path for legacy Change Seller endpoints — not resolved
- Account-level or cohort-level data to anchor the "several million BRL/year" GMV recovery estimate — not resolved
