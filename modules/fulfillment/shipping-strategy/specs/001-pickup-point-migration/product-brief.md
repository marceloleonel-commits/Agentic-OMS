# Product Brief — Pickup Point Migration

| Field | Value |
|---|---|
| **Module** | Fulfillment |
| **Feature** | shipping-strategy |
| **PM** | Carolina Tourinho |
| **Eng Champion** | Vinícius Campos Silva |
| **Status** | In progress — PostgreSQL backfill underway, performance validation pending |
| **Expected Release** | TBD |
| **Availability** | TBD |
| **Mode** | B2C & B2B |

---

## MMR

**Title:** Pickup Point Radius — Infrastructure Migration to Unlock Scale

**Description:** With this release, shoppers will see all eligible pickup points regardless of distance — not just those within the current ~50km platform limit. Merchants will no longer need to open a support request to VTEX to increase the pickup point radius for their account. The merchant-facing limit shifts from distance to a configurable number of nearest points: the km radius field is removed (it is non-functional today — the ~50km platform ceiling silently overrides it), and the count of nearest pickup points shown — today a hard limit of 10 — becomes merchant-configurable: it defaults to 10 and can be raised up to a healthy maximum of 300 (the technical API cap). This is enabled by migrating the Pickup Point data layer off MasterData, eliminating the architectural root cause of the radius constraint and unblocking orders that today are silently lost because the nearest pickup option is just beyond our technical limit.

---

## Motivation

### The constraint is ours, not the merchant's

The ~50km pickup point limit does not reflect any business rule. It exists because MasterData geo-radius queries become cost-prohibitive above that threshold at scale. VTEX created this limit to protect our own infrastructure — and has been passing it to merchants as if it were a product decision ever since.

The result: merchants with stores or DCs beyond 50km from a shopper cannot surface those locations at checkout. The shopper sees no pickup option, no error, no explanation — and either abandons the cart or completes the purchase through another channel outside VTEX.

**This is especially damaging for B2B operations, particularly in countries with large territories such as Brazil, the United States, and Canada.** In B2B commerce, buyers frequently travel significant distances to pick up orders at distribution centers, fulfillment hubs, or partner locations — often across cities or even states. The purchase decision is driven by product availability, price, and the total cost of the operation, not by proximity. A buyer placing a large order of construction materials, industrial equipment, or wholesale goods routinely travels 100–300km to a DC because the freight cost for those items is prohibitive. The 50km limit has no basis in this business model: it silently removes the pickup option from checkout, forcing the buyer to either pay for long-distance freight or abandon the order entirely. For B2B merchants like RONA and Mazda, this is a direct and measurable revenue loss.

**The constraint is equally damaging for B2C merchants selling luxury goods or rare items** — categories where the shopper is not proximity-driven but destination-driven. For a luxury fashion brand like Dolce & Gabbana, the flagship store is not a convenience pickup point — it is part of the brand experience. A shopper based in Recife or Porto Alegre may intentionally plan to collect a purchase at the São Paulo Iguatemi boutique during a trip, combining the journey with the in-store service and brand encounter that define the product category. The 50km limit silently removes that intent from checkout. The same logic applies to merchants anchored to a single iconic location: Manchester City supporters travel internationally to attend matches at the Etihad Stadium, and many specifically want to collect official merchandise at the stadium store — a pickup point with global demand from fans who plan the purchase around the visit. For both profiles, the radius constraint does not protect the shopper from an irrelevant option — it hides a deliberate, high-intent purchase decision.

---

## Reasons to Act Now

**1. Company direction: move off MasterData to robust, scalable databases.**
VTEX has made a strategic decision to migrate all products off MasterData to more reliable, scalable, and maintainable data layers. Pickup Points is one of the last remaining modules still dependent on MasterData. Staying is not a neutral choice — it means operating on a legacy infrastructure that the rest of the company is actively moving away from, with reduced support, limited optimization opportunities, and growing friction as the rest of the platform evolves.

**2. Cost effectiveness: we can run this better for less.**
The current MasterData infrastructure for Pickup Points costs approximately ~US$7,600/month, a recurring expense that grows as the pickup point base expands. This is not just a cost line — it is a cost for a solution with known architectural limitations. A more robust database can handle geo-radius queries at any distance without the constraints that made the 50km limit necessary in the first place, and do so at a lower or comparable cost. The migration is an opportunity to improve performance, remove limitations, and reduce spend simultaneously.

**3. The current data layer is already failing merchants we have — including in Delivery Promise onboarding.**
Two concrete failures today, neither of them about radius:

- **Delivery Promise already lost an onboarding to this limit.** The listing API returns at most 10k pickup points (100 per page × 100 pages), while Delivery Promise needs the full base. Arcaplanet has ~40k, and after a failed setup, a rejected workaround, and a tested-but-unusable scroll route, the account was **declared ineligible for Delivery Promise** — with >10k pickup points becoming a de facto eligibility criterion, expected to be dropped once this blocker is removed ([thread](https://vtex.slack.com/archives/C0ABAPHQQCX/p1779739147445419?thread_ts=1775676320.166939&cid=C0ABAPHQQCX), ticket #1389838). Engineering's own answer at the time was to wait for MasterData to get out of the way — that is this migration. And it is not one account: the same scenario spans a list of accounts, concentrated in LATAM and EMEA.
- **The Admin pickup point screen times out.** A documented Known Issue, escalated for `thefoschini` in Jul 2026: on large bases the pickup point search stops responding. The root cause is query performance, so the migration is expected to fix it — conditional on load-testing that specific query, which relies on keyword matching and is the one query that does not benefit automatically from the move.

**4. Strategic alignment with VTEX's B2B growth.**
VTEX is actively investing in B2B commerce — including the development of Buyer Portal and a broader suite of B2B capabilities. As VTEX expands its B2B footprint, pickup points become increasingly relevant: B2B buyers operate across large geographic areas, and DC-based pickup is a standard fulfillment model in many industries. The 50km limit is a direct blocker for this segment. Removing it is a prerequisite for making pickup a viable channel in VTEX's B2B offering as it scales.

---

## Scope

- Migrate Pickup Point entity off MasterData to **PostgreSQL** (target confirmed with engineering; historical backfill in progress). Cutover is gated on performance evidence for both query classes: the logistics runtime queries by fixed parameters and the Admin keyword search.
- Remove the ~50km `maxDistance` limit, allowing the API to return up to 300 pickup points regardless of distance.
- Remove the km radius field from the Admin frontend — merchants should no longer define a maximum distance when setting up a pickup point shipping policy (the field is non-functional today, overridden by the ~50km platform ceiling).
- Make the existing "number of nearest pickup points" Admin config effective and flexible — the current hard limit of 10 becomes the default, merchant-configurable up to a healthy maximum of 300 (the technical API cap).
- Preserve all existing pickup point data and backward compatibility for existing shipping policies and storefronts. Shoppers already served today must see the same pickup points, in the same order — the behavior change is additive, not a reshaping of existing responses.
- Fix the Admin pickup point search timeout and review the wildcard matching it inherited from Elasticsearch, so the Known Issue can be closed with evidence rather than assumed resolved.
- Make the full pickup point base readable, so Delivery Promise onboarding is no longer blocked for accounts with large pickup point bases: no ceiling on traversal, or a resilient ceiling around 50k that no real account reaches. Page size stays bounded — what has to stop being capped is how much of the base can be read, not how much comes back per request.
- Execute a progressive and careful rollout. The migration plan — including phasing, rollback strategy, and validation criteria at each stage — is owned by engineering (US-01).

## Not in Scope

- The configuration surface for the configurable count (where the merchant sets it) — open question, not resolved here. The default (10) and maximum (300) are decided.
- Pickup point creation or management flows in the Admin beyond the km field removal, the count config, and the search query fix.
- The pagination mechanism that makes the full base readable — unbounded traversal or a resilient ceiling around 50k is an engineering decision informed by the performance tests. That the base must be readable in full is not.
- A status filter on pickup point queries (active vs. inactive) — **deferred, not discarded.** Registered in the spec as a post-migration possibility: it could reduce how much of the enumeration window inactive records consume for Delivery Promise, and — to be validated — may also be costing shoppers real options at checkout, if inactive pickup points occupy slots in the nearest-N list before status is considered. Building it over MasterData now would mean building it twice.
- International coverage — Brazil only at launch.

---

## Target Audience

- **Tier:** All tiers
- **Merchant Profile:** Omnichannel retailers, B2B operations, merchants with large physical networks or low-density store coverage, B2C luxury and rare-item retailers with sparse or iconic store networks
- **Anchor merchants:** RONA, Arcaplanet, Mazda, Dolce & Gabbana, Manchester City
- **Persona:** Shopper (primary impact); Logistics Configurator (eliminates manual radius increase requests to VTEX)
- **Pain:** Valid pickup points silently excluded from checkout due to a platform-level distance constraint unrelated to any business rule
