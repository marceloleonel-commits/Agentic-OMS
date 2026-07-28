# Spec: Pickup Point Migration

## Metadata

| Field | Value |
|---|---|
| **Spec ID** | SS-003 |
| **Module** | Fulfillment → Shipping Strategy |
| **Feature Area** | Pickup Points |
| **Author** | Carolina Tourinho |
| **Status** | Draft |
| **Created** | May 2026 |
| **Personas** | Ecommerce Manager, Logistics Manager (secondary) |
| **Infrastructure dependency** | Mandatory migration of the Pickup Point data layer off MasterData to **PostgreSQL** (confirmed with engineering; historical backfill in progress). This spec cannot ship without the migration. |
| **Source documents** | 2026 DOM On Site deck (internal); Customer Need — RONA; Customer Need — Arcaplanet; Customer Need — Mazda; engineering alignment with Vinícius Campos Silva (Jun 22 and Jul 24, 2026); [Delivery Promise setup blocked for `arcaplanetqa`](https://vtex.slack.com/archives/C0ABAPHQQCX/p1779739147445419?thread_ts=1775676320.166939&cid=C0ABAPHQQCX) (ticket #1389838, `DPT-180`) |

---

## MMR

**Title:** Pickup Point Migration

**Description:** With this release, shoppers will see all eligible pickup points regardless of distance, up to the existing API cap of 300 results. Merchants will no longer need to open a support request to VTEX to increase the pickup point radius. This is enabled by migrating the Pickup Point data layer off MasterData, eliminating the architectural root cause of the radius constraint. The merchant-facing limit shifts from distance to a configurable number of nearest pickup points: the km radius field is removed (the platform silently caps it at 50km today regardless of the configured value), and the count of nearest points shown — today a hard limit of 10 — becomes merchant-configurable: it defaults to 10 and the merchant can raise it up to a healthy ceiling of 300 (the technical API cap). This unblocks orders that today are silently lost because the nearest pickup option is just beyond our technical limit.

---

## Clarifications

- **The primary deliverable is an infrastructure migration.** Pickup Point data currently lives in MasterData. The migration to **PostgreSQL** — confirmed with engineering, with the historical backfill of the pickup point base already in progress — is the prerequisite for everything else in this spec.
- **Two distinct query classes must be validated separately.** Logistics runtime systems (shipping calculation, SLA, indexation) query pickup points by fixed parameters, which maps well to a relational data layer. The Admin pickup point listing and search query relies on keyword/wildcard matching inherited from the Elasticsearch era, and is the query with the highest performance risk post-migration. Migration readiness depends on validating both, not only the runtime path.
- **This spec addresses two coupled problems:** (1) the hard 50km radius limit that hides valid pickup points from shoppers in checkout, and (2) the merchant-facing radius configuration that should be replaced by a configurable limit on the *number* of nearest pickup points.
- **The 50km limit is a MasterData constraint, not a product decision.** Removing it requires migrating off MasterData first. The migration is mandatory and cost-driven (~US$7,600/month recurring).
- **The merchant config already exists in the Admin — but it does not work as displayed.** In `/admin/logistics#/config`, the merchant can set *"show only the first X pickup points within at most Y km of the delivery address."* Today neither field is honored as shown: the ~50km platform ceiling silently overrides the km field (the UI banner states "max distance considered is 50 km" even when the field shows 100), and the number of points (X) is a hard limit of 10. The work is mostly **making this existing config effective**, not building new UI.
- **Current behavior:** the platform returns up to 300 pickup points ordered by proximity, filtered to a ~50km radius, and surfaces a hard limit of 10 nearest points in the experience. ZIP-to-coordinate conversion, proximity ordering, and the `distance` field in the response already exist. Pickup points beyond ~50km — or beyond the 10 nearest — are silently excluded with no error or explanation.
- **Target behavior:** same 300 pickup points (technical API cap), same proximity ordering, same API contract — with **no distance ceiling** on `maxDistance`. The km radius field is removed from the Admin; the number of nearest points shown becomes **merchant-configurable**: the current hard limit of 10 becomes the default, raisable by the merchant up to a maximum of 300 (the technical API cap). One new field (`distanceKm`) is added to each pickup point entry. The 300 cap is the platform safeguard; the merchant-defined count is the shopper-facing limit, and km is never a filter.
- **A second coupled constraint is an active Delivery Promise onboarding blocker.** [`GET /api/logistics/pvt/configuration/pickuppoints/_search`](https://developers.vtex.com/docs/api-reference/logistics-api#get-/api/logistics/pvt/configuration/pickuppoints/_search) returns at most 10k pickup points — 100 per page across 100 pages. `pageSize` is hard-capped at 100 (`"Page size value must be less or equals to 100!"`) and the pagination window stops at an offset of 10,000, so a base larger than that cannot be read in full, even though the response exposes the real total (validated on `arcaplanetqa`: 42,464 pickup points). Inactive pickup points also consume the window. Because Delivery Promise depends on reading the full pickup point base, accounts above 10k cannot be onboarded — `arcaplanetqa` was formally declared **ineligible for Delivery Promise** for this reason ([Product Support → Engineering thread, May 25, 2026](https://vtex.slack.com/archives/C0ABAPHQQCX/p1779739147445419?thread_ts=1775676320.166939&cid=C0ABAPHQQCX); ticket #1389838, `DPT-180`). The target is no ceiling on traversal at all, or a ceiling resilient enough (on the order of 50k) that no real account reaches it — see FR-010.
- Admin pickup point creation and management are out of scope except for the removal of the km radius field and making the "number of nearest points" config effective and flexible.

---

## Problem Statement

### Why Now — MasterData Cost and the Company-Wide Migration

VTEX is migrating all products off MasterData and onto more robust, reliable, cost-efficient databases. Pickup Points is one of the last modules still on MasterData. The cost today is **~US$7,600/month**, recurring and growing as the pickup point base expands. This cost is being transferred to our team as the service owner.

This is not a future risk — it is an active, increasing expense with no upside to staying. The move to more robust databases is both a company-wide strategic direction and a prerequisite for removing the constraints documented below. Every other VTEX product that has moved off MasterData has gained query reliability, scalability, and cost reduction. Pickup Points will too.

This migration is the forcing function that makes the product improvements in this spec possible. We are not migrating databases to ship a nicer UI — we are migrating because we have to, and we are using that migration to fix the radius constraint that has been blocking revenue.

### The 50km Limit — Our Technical Constraint, Their Business Problem

Today, any merchant who needs a radius above 50km must open a request and wait for PM analysis before VTEX manually increases it. This process exists entirely because of **our own technical limitations** — not because 50km is the right business rule for anyone.

**The consequences are real and documented:**

- **Merchants lose orders** from shoppers whose nearest pickup point is beyond 50km. The shopper sees no pickup option in checkout — no error, no explanation — and either abandons or buys elsewhere.
- **High-ticket, heavy, and luxury items**: for these categories, long-distance delivery is either too expensive or beside the point. B2B buyers routinely travel 80–150km to a DC to avoid freight cost on heavy goods. B2C luxury shoppers are destination-driven: a shopper in Recife may plan a trip to São Paulo specifically to collect a purchase at the D&G Iguatemi boutique, where the in-store experience is part of what they are buying. Manchester City supporters travel internationally for matches and want to collect official merchandise at the Etihad Stadium store — a pickup point with global demand. For all of these profiles, the 50km limit does not protect the shopper from an irrelevant option; it removes a deliberate choice.
- **Low store density regions**, such as Brazil, the United States, and Canada: a single flagship or DC naturally serves a much larger geographic area. The 50km circle excludes most of its real catchment.

> *"The core issue is the fixed ~50km pickup radius, which hides valid stores that customers would realistically use, so they never appear in checkout."*
> — Customer Need, RONA and Arcaplanet

---

## Vision: What We Want

1. **Migrate Pickup Point data off MasterData to PostgreSQL** — target confirmed with engineering; the migration is the prerequisite for everything else in this spec.
2. **Remove the km radius configuration from the Admin frontend** — merchants should not define a maximum distance; the km field is removed.
3. **Replace the radius with a configurable number of nearest points** — make the existing "first X pickup points" config effective and flexible, with a default of 10 and merchant-configurable up to a maximum of 300.
4. **Surface the nearest eligible pickup points** to the shopper's ZIP code at checkout, regardless of distance — proximity-ordered, not radius-filtered — respecting the existing 300 pickup point API response limit.

The shopper experience becomes: *"I enter my ZIP and see the closest pickup options, however far they are."* Not: *"I enter my ZIP and only see options within an arbitrary 50km ceiling."*

---

## User Stories

### US-01 — Software Engineer Migrates Pickup Point Data Layer Off MasterData to PostgreSQL (prerequisite)

**As** a software engineer,
**I want** to migrate the Pickup Point data layer from MasterData to PostgreSQL, with a validated initial load and performance evidence for every query pattern in use,
**So that** the architectural root cause of the 50km constraint is eliminated and the platform can scale to support large pickup point networks at lower cost and higher reliability.

> This user story must be executed using **SDD (Spec-Driven Development)**. The engineering team should produce a spec describing the target data layer, migration phases, and validation criteria before writing any implementation code. The spec is the handoff artifact.

**Acceptance criteria:**
- The initial load reads from the MasterData source of truth (S3), not from the OpenSearch index, using the storage team's entity scan for `PICKUP_POINTS` under the `vtex` account.
- Record counts are reconciled per account between MasterData and PostgreSQL before any read traffic is switched over. The MasterData `rest-content-range` header is an acceptable source for the expected total.
- Performance evidence is produced for **both** query classes: the logistics runtime queries by fixed parameters, and the Admin listing/search query with keyword matching (see NFR-005).
- Existing pickup point data is fully preserved post-migration with no data loss.
- All existing shipping policies and storefront integrations continue to function without modification.
- A migration plan is defined with phasing, rollback strategy, and validation criteria at each stage.

---

### US-02 — Shopper Beyond 50km Sees Valid Pickup Options

**As** a shopper whose nearest pickup point is 80km away,
**I want** to see that pickup point as an option at checkout,
**So that** I can choose to travel there instead of paying for long-distance delivery on a heavy or high-ticket item.

**Acceptance criteria:**
- Pickup points beyond 50km from the shopper's ZIP centroid are eligible and returned in the checkout response.
- There is no platform-level distance ceiling that excludes pickup points based on km.
- The shopper sees pickup points ordered by ascending proximity, regardless of how far the nearest one is.

---

### US-03 — Merchant Configures the Number of Nearest Points, Not a Radius *(lower priority — ship after US-02)*

**As** a Logistics Manager setting up pickup points,
**I want** to configure how many of the nearest pickup points are shown — without defining a km radius,
**So that** I control the shopper-facing list by relevance (closest N) instead of an arbitrary distance, and the system handles proximity automatically.

**Acceptance criteria:**
- The km radius field is removed from the pickup point configuration in the Admin (`/admin/logistics#/config`).
- The "number of nearest pickup points" field becomes effective and flexible: it defaults to 10 and the merchant can configure it up to a maximum of 300.
- Existing configurations continue to work without any merchant action.

---

## Functional Requirements

### FR-001 — Remove the ~50km maxDistance Ceiling
Post-migration, the `maxDistance` parameter passed to `_searchsellers` must not be capped at ~50km. The platform returns up to 300 pickup points regardless of distance, ordered by ascending proximity from the shopper's ZIP centroid.

### FR-002 — Remove the km Radius Field from Admin *(lower priority — ship after FR-001)*
The km radius (maximum distance) field must be removed from the pickup point configuration in the Admin (`/admin/logistics#/config`). Merchants should not define a maximum distance when creating or editing a pickup policy. The field is non-functional today (the ~50km platform ceiling overrides any value entered).

### FR-002b — Make the "Number of Nearest Points" Configurable *(ships with FR-002)*
The existing Admin field *"show only the first X pickup points"* must become effective and flexible. The current hard limit of **10** becomes the **default**, and the merchant can configure it up to a healthy maximum of **300** (the technical API cap). The configured count is the shopper-facing limit, applied on top of (and never exceeding) the 300-result cap. No pickup point is excluded by distance — only by count.

> **Open question (FR-002b):** where the merchant configures the count (pickup shipping policy / Delivery Promise / checkout config — TBD). The default (10) and maximum (300) are decided.

### FR-003 — Preserve Existing Merchant Configurations
All existing shipping policies and pickup point configurations must continue to work without any merchant action post-migration.

### FR-004 — Backward Compatibility
All changes are additive and transparent to API consumers. Existing storefronts, integrations, and shipping policies must continue to function without modification.

### FR-005 — Documentation Review

Owner: **PM (Carolina Tourinho)** — engineering is not required to act on this requirement. The PM will coordinate updates with the DK/EDU team for all public-facing pages that reference the 50km limit.

Known pages to update or close:

**Help Center (tutorials)**
- [Pickup points (EN)](https://help.vtex.com/en/docs/tutorials/pickup-points) — remove 50km limit statement; update setup instructions.
- [Pontos de retirada (PT)](https://help.vtex.com/pt/docs/tutorials/pontos-de-retirada) — same as above.
- [Puntos de recogida (ES)](https://help.vtex.com/es/docs/tutorials/puntos-de-recogida) — same as above.
- [Delivery Promise (Beta)](https://help.vtex.com/en/docs/tutorials/delivery-promise-beta) — references 50km as the default radius for pickup filtering; update when behavior changes.
- [Physical stores as pickup points](https://help.vtex.com/en/docs/tracks/configuring-physical-stores-as-pickup-points) — review for any radius references.
- [How shipping calculation works](https://help.vtex.com/docs/tutorials/how-shipping-calculation-works) — review for any radius references.
- [Shipping strategies](https://help.vtex.com/docs/tracks/shipping-strategies) — review for any radius references.

**Developer Portal**
- [List pickup points by location](https://developers.vtex.com/docs/guides/list-pickup-points-by-location) — references 50km and the `maxDistance` parameter; update to reflect new behavior.
- [Delivery Promise](https://developers.vtex.com/docs/guides/delivery-promise) — references 50km as checkout-configured radius; update.
- [Setting up Delivery Promise components (Beta)](https://developers.vtex.com/docs/guides/setting-up-delivery-promise-components) — review for radius references.
- [Delivery Promise for headless stores (Beta)](https://developers.vtex.com/docs/guides/delivery-promise-for-headless-stores) — references 50km as default; update.

**Community**
- [Request to increase pickup point radius](https://community.vtex.com/t/request-to-increase-pickup-point-radius/42497) — close or update with a note pointing to the new behavior.

### FR-006 — Account Mapping (pre-launch prerequisite)
Before launch, produce a mapping of all VTEX accounts with active pickup points, segmented by: (a) accounts with manually increased radius >50km and (b) accounts at the 50km default where a meaningful share of shopper ZIPs have the nearest PUP beyond 50km.

### FR-007 — Observability (hard requirement)
Track the following indicators separately for two cohorts (defined in FR-006):

**Cohort A — accounts with radius already manually increased by VTEX (>50km)**

| Indicator | What it measures |
|---|---|
| % of orders with `selectedDeliveryChannel=pickup-in-point` (pre/post) | Whether removing the hard limit changes order behavior even for accounts already above 50km |

**Cohort B — accounts at the 50km default (no prior manual increase)**

| Indicator | What it measures |
|---|---|
| % of orders with `selectedDeliveryChannel=pickup-in-point` (pre/post) | Primary signal: did pickup adoption increase when the radius constraint was removed? |

**Infrastructure (both cohorts)**

| Indicator | What it measures |
|---|---|
| API latency P50/P95/P99 on `_searchsellers` (pre/post) | Whether the new database performs acceptably at production load without the distance cap |
| Latency P95/P99 and timeout rate on the Admin pickup point listing/search query (pre/post) | Whether the keyword-based Admin query — the highest-risk query in the migration — improves rather than degrades |
| Error rate on pickup point reads by consuming system (pre/post) | Regression signal during the cutover, per consumer, not only in aggregate |

### FR-008 — No Regression for Shoppers Already Served Today
Removing the distance filter must not change what a shopper sees when the current behavior already satisfies them. For a ZIP that today returns the configured number of nearest pickup points entirely within ~50km, the post-migration response must contain the same pickup points, in the same proximity order.

The behavior change is therefore additive and bounded: shoppers who see nothing (or a short list) today start seeing the nearest points regardless of distance, while shoppers already served see no difference. This is the requirement that keeps the migration from silently reshaping responses across the whole base at cutover.

### FR-009 — Admin Pickup Point Search Must Stop Timing Out
The Admin pickup point listing and search must return within the Admin request timeout for accounts with large pickup point bases. This query is the reason a documented Known Issue exists today (see *Known Issues Expected to Be Resolved*), and it is the query least favored by the move to a relational data layer because it relies on keyword/wildcard matching inherited from the Elasticsearch era.

Two parts:
1. **Behavior:** the search returns results — not a timeout — for accounts in the tens of thousands of pickup points.
2. **Query review:** the wildcard matching must be reviewed field by field and reduced to what the merchant actually needs. Wildcard behavior that exists only because Elasticsearch made it free is not a requirement to preserve. Any reduction in match semantics must be an explicit product decision, not a side effect of the migration.

### FR-010 — The Full Pickup Point Base Must Be Readable (unblocks Delivery Promise onboarding)
Today `/pickuppoints/_search` cannot return more than 10k pickup points for an account (100 per page × 100 pages), and Delivery Promise needs the full base. This is not a cosmetic pagination limit — it has already cost an onboarding.

**Documented evidence — Arcaplanet declared ineligible for Delivery Promise.** Source: [Product Support → Engineering thread](https://vtex.slack.com/archives/C0ABAPHQQCX/p1779739147445419?thread_ts=1775676320.166939&cid=C0ABAPHQQCX) (ticket #1389838, `DPT-180`, Apr–May 2026). What the thread establishes:

- The DP setup for `arcaplanetqa` failed on `"To search for more then 10000 pickups use scroll api"`. The paged endpoint is described by engineering as "a API pública e recomendada", capped at 10k.
- **The 10k window counts active and inactive pickup points alike.** The platform lists every registered pickup point regardless of status; the active/inactive distinction only happens later, when SLAs are built. Deactivating pickup points to get under the ceiling was considered and ruled out for this reason.
- **Nobody could even measure how many are active**, because counting requires reading past the same 10k restriction.
- **The scroll workaround was tested and failed.** An internal logistics route doing a `/scroll` against MasterData was attempted in a beta environment; its TTL is seconds rather than the VTEX standard, so there is not enough time to list a base this large.
- **The path named by engineering was this migration:** "aguardar o MD sair do caminho", expected by the end of H2.
- The account was ultimately declared ineligible, and >10k pickup points became a *de facto* eligibility criterion for Delivery Promise — with the explicit expectation that removing this blocker allows the criterion to be dropped from Open Beta.

This is why the requirement is not "raise a number": the constraint has already been converted into a product eligibility rule, and it applies to more accounts than this one — engineering noted the same scenario across a list of accounts, concentrated in LATAM and EMEA.

**The product target, in order of preference:**

1. **No ceiling on how much of the base can be read.** A consumer can traverse every pickup point of an account, however many there are. This does not mean a single response carrying 50k records — page size stays bounded for payload and latency sanity; what becomes unbounded is the *traversal*, via cursor/keyset pagination instead of a capped offset window. This is the durable answer: the limit stops being something merchants can outgrow.
2. **If a ceiling is unavoidable, it must be resilient rather than merely higher** — on the order of 50k, with headroom above the largest base we have today (~40k), so it is not a limit any real account is expected to reach.

**What is not acceptable:** a fixed window that a known account already exceeds. Moving from 10k to, say, 15k would repeat the current failure with a different number.

> **Open with engineering (Jul 27, 2026):** which of the two lands, and at what cost, depends on the performance tests that had not yet run. What is decided is the intent — Delivery Promise must be able to read the whole base — not the mechanism.

---

## Post-Migration Opportunity — Filter Pickup Points by Status *(possibility, not a requirement)*

Registered for evaluation **after** the migration. Not scoped here and not committed.

Today the platform lists every registered pickup point regardless of status; the active/inactive distinction happens later, when SLAs are built ([Product Support → Engineering thread](https://vtex.slack.com/archives/C0ABAPHQQCX/p1779739147445419?thread_ts=1775676320.166939&cid=C0ABAPHQQCX)). A status filter — most naturally an optional `isActive` query param applied server-side *before* pagination, with absence meaning "all" so existing consumers are untouched — could help in two distinct places:

- **Delivery Promise onboarding:** reduces how much of the enumeration window inactive records consume. This does not replace FR-010 — an account with more than 10k *active* pickup points still needs unbounded traversal — but it could unblock accounts whose active base sits below the ceiling.
- **Checkout:** the proximity search retrieves pickup points before status is considered. *Hypothesis to validate:* inactive pickup points may consume slots in the nearest-N selection and in the 300-result cap, so a shopper could see fewer real options than the merchant configured (FR-002b), while the platform pays to compute SLAs for points that are then discarded.

**Why it is deferred rather than pursued now:** implementing the filter over MasterData while the PostgreSQL backfill is in flight would mean building it twice. Revisit after cutover, when it is a filter on the new data layer.

**What it depends on:** how many pickup points are actually active in a large base — unmeasurable today, since counting requires reading past the same 10k restriction that blocks the onboarding.

---

## Known Issues Expected to Be Resolved

| Known Issue | Why it happens | Expected post-migration |
|---|---|---|
| [Error when searching for pickup points and listing stores in the store locator](https://help.vtex.com/known-issues/error-when-searching-for-pickup-points-and-listing-stores-in-the-store-locator) | Timeout on the pickup point search query for accounts with large bases — the Admin pickup point screen stops loading (escalated for `thefoschini` in Jul 2026) | Expected to be resolved by the migration, since the root cause is query performance. **Not automatic:** this specific query uses keyword matching and must be explicitly load-tested before the KI is declared fixed (FR-009, NFR-005). |

---

## Revenue Impact Measurement Framework

The core hypothesis: **removing the radius limit unlocks orders that today are either abandoned or completed outside VTEX.**

The practical approach is to use the cohort we already have: **accounts that requested a manual radius increase from VTEX** — i.e., accounts (and their sellers) that we know are actively constrained today.

### Step 1 — Build the cohort (pre-launch)
Using the Product Support data (35 requests, 25 executions in 2025), identify all accounts and sellers that received a manually increased radius. These are the units with known, documented constraint.

> **Example:** Mazda is a parent account with multiple sellers, each with a manually increased radius. The cohort is those sellers — not just the parent account.

### Step 2 — Establish baseline (pre-launch)
For each seller in the cohort, record:
- % of orders with `selectedDeliveryChannel=pickup-in-point`

### Step 3 — Post-launch tracking (per seller)
After removing the limit, track the same indicator for the same sellers. The delta is the attributable impact:
- Did more orders close via pickup? (conversion lift)

### Step 4 — Interpret and report
A meaningful lift in pickup offer rate and conversion for the cohort is the signal that the radius was the binding constraint. This is the most credible data point for leadership because it is based on accounts with a confirmed, documented need — not a modeled estimate.

---

## Infrastructure Dependency

| Constraint | Root Cause | Resolution |
|---|---|---|
| ~50km hard radius ceiling | MasterData query cost above that threshold | Migrate to a scalable data layer; queries become cost-stable at any distance |
| ~US$7,600/month recurring cost | MasterData storage + query pricing, growing with PUP count | Cost eliminated or significantly reduced post-migration |
| 10k enumeration ceiling on `/pickuppoints/_search` (`pageSize` ≤ 100 × 100 pages) — already made `arcaplanetqa` ineligible for Delivery Promise | MasterData-backed pagination limit; active and inactive PUPs consume the window alike; the MD `/scroll` workaround fails on a seconds-long TTL | Unbounded traversal of the base, or a resilient ceiling (~50k) no real account reaches (FR-010) |
| Admin pickup search timeouts on large bases | Keyword/wildcard query inherited from the Elasticsearch era, executed over MasterData | Expected to be resolved by the migration, conditional on load-testing this specific query (FR-009) |

**Target data layer: PostgreSQL**, confirmed with engineering. The historical backfill of the pickup point base into PostgreSQL is already in progress ([logistics-critical#164](https://github.com/vtex/logistics-critical/pull/164)). Performance testing was still pending as of Jul 24, 2026 — it is the gate for the cutover, not a follow-up. The product requirements in this spec remain intentionally storage-layer agnostic.

---

## API Changes

**No breaking changes.**

**Backend change:** remove the ~50km `maxDistance` ceiling on:
```
GET /api/logistics/pvt/configuration/pickuppoints/_searchsellers
    ?lat={lat}&lon={lon}&maxDistance={maxDistance}&an={account}
```


---

## Non-Functional Requirements

### NFR-001 — Performance
Proximity sorting and ZIP centroid resolution must add no more than 100ms to the delivery options API response time (P95). Centroid resolution must be in-memory or cached — no synchronous external geocoding in the checkout critical path.

### NFR-002 — Accuracy
Distance is a UX estimate. Straight-line (geodesic) distance from ZIP centroid is sufficient. Turn-by-turn routing is out of scope.

### NFR-003 — Coverage
ZIP centroid resolution must cover 100% of Brazilian ZIP codes at launch. International coverage is out of scope.

### NFR-004 — Backward Compatibility
No breaking changes to the existing delivery options API contract. New fields are additive.

### NFR-005 — Performance Validation Is a Cutover Gate
No read traffic is switched to PostgreSQL before performance evidence exists for both query classes, measured on a production-sized base:

| Query class | Consumer | Validation |
|---|---|---|
| Fixed-parameter reads | Logistics runtime (shipping calculation, SLA, indexation) | P95/P99 equal to or better than MasterData at production load |
| Keyword/wildcard search | Admin pickup point listing and search | No timeouts on accounts with tens of thousands of pickup points; reference cases: `thefoschini` (KI escalation) and an account above 40k PUPs such as `arcaplanet` |

If the Admin keyword query does not meet this bar, the query is reworked (FR-009) — the cutover is not waived.

---

## Out of Scope

- **The configuration surface for the configurable count** — the default (10) and maximum (300) are decided, but where the merchant sets the count (pickup shipping policy / Delivery Promise / checkout config) is an open question, not resolved in this spec.
- **Coverage by polygon or region** — future capability; not in this spec.
- **The pagination mechanism behind FR-010** — whether traversal becomes unbounded (cursor/keyset) or lands on a resilient ceiling around 50k is an engineering decision informed by the performance tests. The intent — the full base must be readable — is decided.
- **A status filter on pickup point queries** — deliberately deferred to after the migration, registered as a possibility under *Post-Migration Opportunity*, not a requirement of this spec.
- **International ZIP codes** — BR only at launch.
- **Shopper GPS / device location** — proximity calculated from ZIP entered at checkout.
- **Pickup point creation or management** — admin flows not modified except removal of the radius step and the search query rework in FR-009.
- **Migration design and rollout mechanics** — phasing, backfill strategy, and cutover execution owned by engineering; this spec defines the behavior and the gates.

---

## PM Data — Resolved

- **Volume of manual radius increase requests (2025):** In 2025 we had 35 requests and 25 executions. Source: Product Support dashboard — `[Logistics] Monthly Created Tickets`, filter: `Logistics::Pickup points::Settings::Distance`.

---

## Target Audience

- **Tier:** All tiers
- **Merchant Profile:** Omnichannel retailers, B2B operations, merchants with large physical networks or low-density store coverage, B2C luxury and rare-item retailers with sparse or iconic store networks
- **Anchor merchants:** RONA, Arcaplanet, Mazda, Dolce & Gabbana, Manchester City
- **Persona:** Shopper (primary impact); Logistics Configurator (eliminates manual radius increase requests)

---

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | What are the results of the performance tests, per query class (NFR-005)? Specifically: does the Admin keyword query hold on a base above 40k pickup points? | Engineering | High |
| 2 | Do current PUP records in production have lat/lon coordinates populated at sufficient coverage? If not, what is the data remediation plan? | Engineering | High |
| 3 | Can traversal of the pickup point base become unbounded post-migration (cursor/keyset pagination), or do we land on a resilient ceiling around 50k (FR-010)? What does each option cost in latency for a base in the 40k range? | Engineering | High |
| 4 | Which wildcard fields can be removed from the Admin search query (FR-009), and does removing them change any search behavior a merchant relies on today? | Engineering + Carol | High |
| 5 | Post-migration, does the 300 pickup point response limit remain in place — but now we are able to return all 300 nearest results regardless of distance, with no silent exclusions due to the 50km cap? | Engineering + Carol | Medium |
| 6 | Does the checkout proximity search carry inactive pickup points into the nearest-N selection and the 300-result cap? If so, the merchant-configured count (FR-002b) is silently degraded by records that will never be offered. | Engineering | Medium |
| 7 | What is the expected timeline for the cutover, given the backfill is already in progress? | Engineering | Medium |
