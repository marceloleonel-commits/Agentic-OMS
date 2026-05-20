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
| **Personas** | Shopper (primary); Ecommerce Manager, Logistics Configurator (secondary) |
| **Infrastructure dependency** | Mandatory migration of the Pickup Point data layer off MasterData. Target database to be defined by engineering based on a technical study. This spec cannot ship without the migration. |
| **Source documents** | 2026 DOM On Site deck (internal); Customer Need — RONA; Customer Need — Arcaplanet; Customer Need — Mazda |

---

## MMR

**Title:** Pickup Point Migration

**Description:** With this release, shoppers will see all eligible pickup points regardless of distance — not just those within the current ~50km platform limit — up to the existing API cap of 300 results. Merchants will no longer need to open a support request to VTEX to increase the pickup point radius. This is enabled by migrating the Pickup Point data layer off MasterData, eliminating the architectural root cause of the radius constraint. The radius configuration step is removed from the Admin setup flow — unblocking orders that today are silently lost because the nearest pickup option is just beyond our technical limit.

---

## Clarifications

- **The primary deliverable is an infrastructure migration.** Pickup Point data currently lives in MasterData. The migration to a scalable data layer — to be selected by engineering after a technical study — is the prerequisite for everything else in this spec.
- **This spec addresses two coupled problems:** (1) the hard 50km radius limit that hides valid pickup points from shoppers in checkout, and (2) the merchant-facing radius configuration step that should be eliminated from the pickup point setup journey.
- **The 50km limit is a MasterData constraint, not a product decision.** Removing it requires migrating off MasterData first. The migration is mandatory and cost-driven (~US$7,600/month recurring).
- **Current behavior:** the platform returns up to 300 pickup points ordered by proximity, filtered to a ~50km radius. ZIP-to-coordinate conversion, proximity ordering, and the `distance` field in the response already exist. Pickup points beyond ~50km are silently excluded with no error or explanation.
- **Target behavior:** same 300 pickup points, same proximity ordering, same API contract — with no distance ceiling on `maxDistance`. One new field (`distanceKm`) is added to each pickup point entry.
- **A second coupled constraint** exists: the Shipping API returns up to 10k pickup points per call, including inactive ones. Accounts with >10k PUPs risk incomplete Delivery Promise indexation. This is out of scope for this spec; to be addressed in a follow-up.
- Admin pickup point creation and management are out of scope except for the removal of the radius configuration step.

---

## Problem Statement

### Why Now — MasterData Cost and the Company-Wide Migration

VTEX is migrating all products off MasterData and onto more reliable, cost-efficient databases. Pickup Points is one of the last modules still on MasterData. The cost today is **~US$7,600/month**, recurring and growing as the pickup point base expands. This cost is being transferred to our team as the service owner.

This is not a future risk — it is an active, increasing expense with no upside to staying. Every other VTEX product that has moved off MasterData has gained query reliability, scalability, and cost reduction. Pickup Points will too.

This migration is the forcing function that makes the product improvements in this spec possible. We are not migrating databases to ship a nicer UI — we are migrating because we have to, and we are using that migration to fix the radius constraint that has been blocking revenue.

### The 50km Limit — Our Technical Constraint, Their Business Problem

Today, any merchant who needs a radius above 50km must open a request and wait for PM analysis before VTEX manually increases it. This process exists entirely because of **our own technical limitations** — not because 50km is the right business rule for anyone.

**The consequences are real and documented:**

- **Merchants lose orders** from shoppers whose nearest pickup point is beyond 50km. The shopper sees no pickup option in checkout — no error, no explanation — and either abandons or buys elsewhere.
- **High-ticket and heavy items**: long-distance delivery is too expensive; buyers are willing to travel 80–150km to a store or DC to avoid freight cost. The radius hides that option.
- **Low store density regions**, such as Brazil, the United States, and Canada: a single flagship or DC naturally serves a much larger geographic area. The 50km circle excludes most of its real catchment.

> *"The core issue is the fixed ~50km pickup radius, which hides valid stores that customers would realistically use, so they never appear in checkout."*
> — Customer Need, RONA and Arcaplanet

---

## Vision: What We Want

1. **Migrate Pickup Point data off MasterData** — engineering owns the database selection; the migration is the prerequisite for everything else in this spec.
2. **Remove the radius configuration from the Admin frontend** — merchants should not be required to define a radius when setting up a pickup point shipping policy.
3. **Surface the nearest eligible pickup points** to the shopper's ZIP code at checkout, regardless of distance — proximity-ordered, not radius-filtered — respecting the existing 300 pickup point API response limit.

The shopper experience becomes: *"I enter my ZIP and see the closest pickup options, however far they are."* Not: *"I enter my ZIP and only see options within an arbitrary 50km ceiling."*

---

## User Stories

### US-01 — Software Engineer Migrates Pickup Point Data Layer Off MasterData (prerequisite)

**As** a software engineer,
**I want** to evaluate candidate databases, run comparative tests, and execute a migration plan for the Pickup Point data layer off MasterData,
**So that** the architectural root cause of the 50km constraint is eliminated and the platform can scale to support large pickup point networks at lower cost and higher reliability.

**Acceptance criteria:**
- Engineering produces a comparative study of database candidates covering query performance, infrastructure cost, operational complexity, and migration risk.
- A migration plan is defined with phasing, rollback strategy, and validation criteria at each stage.
- Existing pickup point data is fully preserved post-migration with no data loss.
- All existing shipping policies and storefront integrations continue to function without modification.

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

### US-03 — Merchant No Longer Configures Radius

**As** a Logistics Configurator setting up a new pickup point,
**I want** to skip the radius definition step entirely,
**So that** I don't have to reason about which ZIP codes the pickup point should serve — the system handles proximity automatically.

**Acceptance criteria:**
- The radius configuration field is removed from the pickup point shipping policy setup flow in the Admin.
- Existing configurations continue to work without any merchant action.
- The pickup point setup journey is reduced from 7 steps to 6 or fewer.

---

## Functional Requirements

### FR-001 — Remove the ~50km maxDistance Ceiling
Post-migration, the `maxDistance` parameter passed to `_searchsellers` must not be capped at ~50km. The platform returns up to 300 pickup points regardless of distance, ordered by ascending proximity from the shopper's ZIP centroid.

### FR-002 — Remove Radius Configuration from Admin
The radius definition step must be removed from the pickup point shipping policy setup flow. Merchants should not be required to define a maximum distance when creating or editing a pickup policy.

### FR-003 — Preserve Existing Merchant Configurations
All existing shipping policies and pickup point configurations must continue to work without any merchant action post-migration.

### FR-004 — Backward Compatibility
All changes are additive and transparent to API consumers. Existing storefronts, integrations, and shipping policies must continue to function without modification.

### FR-005 — Documentation Review

Before this feature is considered complete, engineering must review and propose updates to:
- [help.vtex.com/docs/tutorials/pickup-points](https://help.vtex.com/docs/tutorials/pickup-points) — remove 50km limit statement; update setup instructions.
- [community.vtex.com/t/request-to-increase-pickup-point-radius/42497](https://community.vtex.com/t/request-to-increase-pickup-point-radius/42497) — close or update with a note pointing to the new behavior.

### FR-006 — Account Mapping (pre-launch prerequisite)
Before launch, produce a mapping of all VTEX accounts with active pickup points, segmented by: (a) accounts with manually increased radius >50km and (b) accounts at the 50km default where a meaningful share of shopper ZIPs have the nearest PUP beyond 50km.

### FR-007 — Observability (hard requirement)
Track the following indicators separately for two cohorts (defined in FR-006):

**Cohort A — accounts with radius already manually increased by VTEX (>50km)**

| Indicator | What it measures |
|---|---|
| % of orders with `selectedDeliveryChannel=pickup-in-point` (pre/post) | Whether removing the hard limit changes behavior even for accounts already above 50km |
| Distance distribution of selected PUPs (pre/post) | Whether the distribution shifts further out after the cap is fully removed |

**Cohort B — accounts at the 50km default (no prior manual increase)**

| Indicator | What it measures |
|---|---|
| % of orders with `selectedDeliveryChannel=pickup-in-point` (pre/post) | Primary signal: did pickup adoption increase when the radius constraint was removed? |
| Distance distribution of selected PUPs (pre/post) | % of pickup orders where selected PUP was >50km from shopper ZIP |
| Pickup offer rate at checkout (pre/post) | % of sessions where at least one pickup option was shown |

**Infrastructure (both cohorts)**

| Indicator | What it measures |
|---|---|
| API latency P50/P95/P99 on `_searchsellers` (pre/post) | Whether the new database performs acceptably at production load without the distance cap |

---

## Revenue Impact Measurement Framework

The core hypothesis: **removing the radius limit unlocks orders that today are either abandoned or completed outside VTEX.**

The practical approach is to use the cohort we already have: **accounts that requested a manual radius increase from VTEX** — i.e., accounts (and their sellers) that we know are actively constrained today.

### Step 1 — Build the cohort (pre-launch)
Using the Product Support data (35 requests, 25 executions in 2025), identify all accounts and sellers that received a manually increased radius. These are the units with known, documented constraint.

> **Example:** Mazda is a parent account with multiple sellers, each with a manually increased radius. The cohort is those sellers — not just the parent account.

### Step 2 — Establish baseline (pre-launch)
For each seller in the cohort, record:
- % of checkout sessions where at least one pickup option was shown
- % of orders with `selectedDeliveryChannel=pickup-in-point`
- Distance distribution of the pickup points currently being surfaced

### Step 3 — Post-launch tracking (per seller)
After removing the limit, track the same indicators for the same sellers. The delta is the attributable impact:
- Did more sessions surface a pickup option? (offer rate)
- Did more orders close via pickup? (conversion)
- Did the distance distribution shift — i.e., are shoppers now selecting PUPs that were previously hidden?

### Step 4 — Interpret and report
A meaningful lift in pickup offer rate and conversion for the cohort is the signal that the radius was the binding constraint. This is the most credible data point for leadership because it is based on accounts with a confirmed, documented need — not a modeled estimate.

---

## Infrastructure Dependency

| Constraint | Root Cause | Resolution |
|---|---|---|
| ~50km hard radius ceiling | MasterData query cost above that threshold | Migrate to a scalable data layer; queries become cost-stable at any distance |
| ~US$7,600/month recurring cost | MasterData storage + query pricing, growing with PUP count | Cost eliminated or significantly reduced post-migration |
| 10k PUP API response cap | MasterData + API pagination limit; inactive PUPs consume quota | Out of scope; to be addressed in a follow-up spec |

Engineering owns the database selection. This spec defines requirements that are intentionally storage-layer agnostic.

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

---

## Out of Scope

- **Merchant-configurable radius > 50km** — future capability, separate spec.
- **Coverage by polygon or region** — future capability; not in this spec.
- **10k PUP API cap** — to be addressed in a follow-up spec.
- **International ZIP codes** — BR only at launch.
- **Shopper GPS / device location** — proximity calculated from ZIP entered at checkout.
- **Pickup point creation or management** — admin flows not modified except removal of the radius step.
- **Infrastructure migration decision** — database selection owned by engineering.

---

## PM Data — Resolved

- **Volume of manual radius increase requests (2025):** In 2025 we had 35 requests and 25 executions. Source: Product Support dashboard — `[Logistics] Monthly Created Tickets`, filter: `Logistics::Pickup points::Settings::Distance`.

---

## Target Audience

- **Tier:** All tiers
- **Merchant Profile:** Omnichannel retailers, merchants with large physical networks or low-density store coverage
- **Anchor merchants:** RONA, Arcaplanet, Mazda
- **Persona:** Shopper (primary impact); Logistics Configurator (eliminates manual radius increase requests)

---

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | What database candidates are being evaluated (US-01)? What is the expected timeline for the study and the migration? | Engineering | High |
| 2 | Do current PUP records in production have lat/lon coordinates populated at sufficient coverage? If not, what is the data remediation plan? | Engineering | High |
| 3 | Post-migration, does the 300 pickup point response limit remain in place — but now we are able to return all 300 nearest results regardless of distance, with no silent exclusions due to the 50km cap? | Engineering + Carol | Medium |
