# Spec: Pickup Point Radius Removal + Proximity Display

## Metadata

| Field | Value |
|---|---|
| **Spec ID** | SS-004 |
| **Module** | Fulfillment → Shipping Strategy |
| **Feature Area** | Pickup Points |
| **Author** | Carol Tourinho |
| **Status** | Draft |
| **Created** | May 2026 |
| **Personas** | Shopper (primary); Ecommerce Manager, Logistics Configurator (secondary) |
| **Infrastructure dependency** | Mandatory migration from MasterData to new data layer (Aurora or equivalent). Engineering decision on target storage is pending. This spec cannot ship without the migration. |
| **Source documents** | 2026 DOM On Site deck (internal); Customer Need — RONA; Customer Need — Arcaplanet |

---

## Clarifications

- **This spec addresses two coupled problems:** (1) the hard 50km radius limit that hides valid pickup points from shoppers in checkout, and (2) the merchant-facing radius configuration step that should be eliminated from the pickup point setup journey.
- **The desired UX outcome** is that merchants no longer configure a radius at all. The system automatically surfaces the N nearest eligible pickup points to the shopper's ZIP code, regardless of distance.
- **The 50km limit is a MasterData constraint, not a product decision.** It exists because queries above 50km become too expensive to run against MasterData at scale. Removing it requires migrating off MasterData first. The migration is mandatory and cost-driven (~US$7,600/month recurring, growing with PUP count).
- **There is a second coupled constraint:** the Shipping API currently returns up to 10k pickup points per call, including inactive ones. Accounts with >10k PUPs cannot fully implement Delivery Promise because the index fills up before all valid PUPs are surfaced. This spec documents that constraint; full resolution may be in a follow-up spec.
- This spec covers the removal of the radius as a merchant configuration step and the new proximity-based display behavior at checkout. Admin pickup point creation and management are out of scope.

---

## Problem Statement

### Why Now — MasterData Cost and the Company-Wide Migration

VTEX is migrating all products off MasterData and onto more reliable, cost-efficient databases. Pickup Points is one of the last modules still on MasterData. The cost today is **~US$7,600/month**, recurring and growing as the pickup point base expands. This cost is being transferred to our team as the service owner.

This is not a future risk — it is an active, increasing expense with no upside to staying. The migration is mandatory and already aligned at the company level. Every other VTEX product that has moved off MasterData has gained query reliability, scalability, and cost reduction. Pickup Points will too.

This migration is the forcing function that makes the product improvements in this spec possible. We are not migrating databases to ship a nicer UI — we are migrating because we have to, and we are using that migration to fix the radius constraint that has been blocking revenue.

### The 50km Limit — Our Technical Constraint, Their Business Problem

With the migration comes the opportunity to fix a limitation that has existed since the beginning: the default ~50km radius.

Today, any merchant who needs a radius above 50km must open a request and wait for PM analysis before VTEX manually increases it. This process exists entirely because of **our own technical limitations** — not because 50km is the right business rule for anyone. MasterData queries above that threshold become too expensive to run at scale, so we created a gating process to protect our infrastructure.

The result is that VTEX's internal constraint is being imposed on merchants as if it were a product decision. Merchants who should be selling more are blocked. Those who discover the limit resort to workarounds — configuring ZIP ranges they don't understand, shipping policies that misrepresent coverage, manual configurations that break when the network grows. Many don't realize the limit exists until a shopper complains or a sale falls through.

**The consequences are real and documented:**

- **Merchants lose orders** from shoppers whose nearest pickup point is beyond 50km. The shopper sees no pickup option in checkout — no error, no explanation — and either abandons or buys elsewhere.
- **B2B buyers** regularly travel across states to pick up at a distribution center. The 50km limit has no basis in their business model. *(Slide: "Em B2B, FBC é regra. O limite de ~50km não existe na regra de negócio deles.")*
- **High-ticket and heavy items**: long-distance delivery is too expensive; buyers are willing to travel 80–150km to a store or DC to avoid freight cost. The radius hides that option.
- **Low store density regions**: a single flagship or DC naturally serves a much larger geographic area. The 50km circle excludes most of its real catchment.

> *"The core issue is the fixed ~50km pickup radius, which hides valid stores that customers would realistically use, so they never appear in checkout."*
> — Customer Need, RONA and Arcaplanet

The migration off MasterData removes the technical constraint. What we want to give merchants in return is **freedom**: define their pickup coverage based on their business logic, not on a threshold we set to protect our database. The radius should not be a concept merchants need to manage through a support process with VTEX.

> *"The core issue is the fixed ~50km pickup radius, which hides valid stores that customers would realistically use, so they never appear in checkout. This affects scenarios such as heavy or high-ticket items where delivery over long distances is too expensive but customers are willing to travel 80–150km to a main store or DC; regions with low store density where a single flagship or DC naturally serves a much larger area."*
> — Customer Need, RONA and Arcaplanet

### The Radius as a Mandatory Configuration Step

Configuring a pickup point today requires 7 steps across 4 distinct entities (warehouse, dock, pickup point, shipping policy). Step 6 is "Definir raio de atuação (teto de 50km)" inside the shipping strategy configuration.

This step is confusing by design: merchants configure a shipping policy with ZIP range 00000–999999 thinking they are defining "which ZIP codes can pick up this product." In practice, that ZIP range defines who can *buy* the product — a critical and non-obvious distinction that causes misconfiguration and support escalations.

The radius definition should not be a merchant-facing configuration step at all. It is a platform concern, not a business rule.

### The Cost of Staying on MasterData

The MasterData infrastructure for pickup points costs approximately **US$7,600/month**, a recurring cost that grows as the pickup point base expands. Beyond cost, MasterData imposes:

- The 50km hard radius ceiling
- Limited B2B coverage (buyers in B2B regularly travel states to pick up at a main store or DC; the 50km limit has no basis in their business model)
- Blocked omnichannel expansion: as the physical network grows, the architecture constrains rather than scales
- Incomplete Delivery Promise indexation for accounts with >10k PUPs

Migration off MasterData is mandatory.

### Impact on Delivery Promise

Pickup point limits propagate directly into Delivery Promise:
- The 50km radius reduces geographic coverage → fewer eligible offers in PLP/checkout → lower conversion
- The Shipping API returns up to 10k PUPs per call, including inactive ones (`isActive=false`). Accounts with large omnichannel networks exhaust this limit, causing DP indexation to be incomplete.

---

## Vision: What We Want

Merchants should not configure a radius. The platform should:

1. **Remove the radius as a configuration step** from the pickup point setup journey (steps reduced from 7 to 6 or fewer).
2. **Surface the N nearest eligible pickup points** to the shopper's ZIP code at checkout, regardless of distance — proximity-ordered, not radius-filtered.
3. **Support coverage shapes beyond a circle** (region, polygon) as a future capability, for merchants whose network doesn't map to a radial model (B2B, franchise corridors, hub-and-spoke).

The shopper experience becomes: *"I enter my ZIP and see the closest pickup options, as many as are relevant, ordered by proximity."* Not: *"I enter my ZIP and only see options within an arbitrary 50km circle."*

---

## User Stories

### US-01 — Shopper Beyond 50km Sees Valid Pickup Options

**As** a shopper whose nearest pickup point is 80km away,
**I want** to see that pickup point as an option at checkout,
**So that** I can choose to travel there instead of paying for long-distance delivery on a heavy or high-ticket item.

**Acceptance criteria:**
- Pickup points beyond 50km from the shopper's ZIP centroid are eligible and returned in the checkout response.
- There is no platform-level distance ceiling that excludes pickup points based on km.
- The shopper sees pickup points ordered by ascending proximity, regardless of how far the nearest one is.

---

### US-02 — B2B Buyer Retrieves Across Regions

**As** a B2B buyer willing to travel to a distribution center in another state,
**I want** pickup options to reflect all eligible locations, not just those within a 50km circle,
**So that** I can complete the purchase on VTEX instead of being forced to use another channel.

**Acceptance criteria:**
- No radius limit is applied to B2B or any other account type.
- Pickup points in different cities or states appear in checkout if they are active and covered by the relevant shipping policy.
- The shopper sees the distance label for each option so they can make an informed choice.

---

### US-03 — Merchant No Longer Configures Radius

**As** a Logistics Configurator setting up a new pickup point,
**I want** to skip the radius definition step entirely,
**So that** I don't have to reason about which ZIP codes the pickup point should serve — the system handles proximity automatically.

**Acceptance criteria:**
- The pickup point setup flow does not require or surface a radius or ZIP range configuration tied to proximity.
- Existing shipping policies configured with dummy ZIP ranges (00000–999999) for pickup continue to work without migration action from the merchant.
- The setup journey for a new pickup point is reduced by at least one step compared to the current 7-step flow.

---

### US-04 — Shopper Sees the 10 Nearest Pickup Points

**As** a shopper selecting pickup at checkout,
**I want** to see a focused, proximity-ordered list of pickup options,
**So that** I can immediately identify the most convenient location without scrolling an unordered or unmanageable list.

**Acceptance criteria:**
- The default display shows the 10 nearest eligible pickup points, ordered by ascending distance from the shopper's ZIP centroid.
- Each entry displays a distance label (e.g., "~1.2 km", "~85 km") so the shopper can self-filter.

---

## Functional Requirements

### FR-001 — Remove Platform Radius Ceiling
The platform must not enforce any hard distance ceiling on pickup point retrieval. The ~50km limit tied to MasterData query cost must be eliminated as part of the infrastructure migration. Post-migration, all eligible and active pickup points must be retrievable regardless of distance from the shopper's ZIP.

### FR-002 — Proximity-Based Sorting
Pickup points returned to the checkout must be sorted by ascending geodesic distance between the pickup point's registered coordinates and the centroid of the shopper's ZIP code. Sorting is applied server-side.

### FR-003 — ZIP Centroid Resolution
The system must resolve each Brazilian ZIP code to a geographic centroid (lat/lon). The resolution method is an engineering decision (internal table, geocoding service, postal database). Centroid data must be refreshable to account for postal code boundary changes. Resolution must not introduce synchronous external calls in the checkout critical path.

### FR-004 — Coordinate Requirement for Pickup Points
Pickup points must have registered coordinates (lat/lon) to participate in proximity sorting. Pickup points without coordinates are included in the response but placed at the tail of the list, after all geo-sorted results.

### FR-005 — Default Display Limit of 10
The system returns and the storefront renders 10 pickup points by default. This is a product-defined constant. There is no merchant-configurable radius or display limit in this spec.

### FR-006 — Distance Label per Entry
The API response for each pickup point must include a `distanceKm` field (float, 1 decimal place) when proximity was calculated. The field is omitted (not null, not zero) when coordinates are unavailable for that pickup point.

### FR-007 — Backward Compatibility
Proximity sorting and new response fields are additive. Existing storefronts that do not consume `distanceKm` must continue to function without modification.

### FR-008 — No Radius Exclusion
Proximity display does not exclude any pickup point based on distance. All active and eligible pickup points must be eligible to appear regardless of distance.

---

## Infrastructure Dependency

This spec cannot ship without migrating pickup point data off MasterData. The 50km hard limit is a direct consequence of MasterData query cost at scale — it is not a configurable product parameter.

| Constraint | Root Cause | Resolution |
|---|---|---|
| 50km hard radius ceiling | MasterData query cost above 50km | Migrate to Aurora or equivalent; queries become cost-stable at any distance |
| ~US$7,600/month recurring cost | MasterData storage + query pricing, growing with PUP count | Cost eliminated or significantly reduced post-migration |
| 10k PUP API response cap | MasterData + API pagination limit; inactive PUPs consume quota | Out of scope for this spec; to be addressed separately |

Engineering owns the migration decision (MasterData → Aurora or alternative). This spec is written to be storage-layer agnostic: the proximity sorting and display requirements apply regardless of the chosen data layer. The migration is a prerequisite, not a scope item for this spec.

---

## API Changes

### Modified Response: Pickup Point Delivery Options

New optional fields added to each pickup point entry in the checkout delivery options response:

```json
{
  "pickupPointId": "store-sp-paulista",
  "friendlyName": "Drogarias Pacheco Paulista",
  "address": { ... },
  "businessHours": [ ... ],
  "distanceKm": 12.4
}
```

`distanceKm` is omitted when proximity could not be calculated for this specific entry.

### Response Envelope: Proximity Metadata

```json
{
  "pickupPoints": [ ... ],
  "totalCount": 83,
  "shopperZipCentroid": { "lat": -23.5614, "lon": -46.6561 }
}
```

---

## Non-Functional Requirements

### NFR-001 — Performance
Proximity sorting and ZIP centroid resolution must add no more than 100ms to the delivery options API response time (P95). Centroid resolution must be in-memory or cached — no synchronous external geocoding in the checkout critical path.

### NFR-002 — Accuracy
Distance is a UX estimate. Straight-line (geodesic) distance from ZIP centroid is sufficient. Turn-by-turn routing distance is out of scope.

### NFR-003 — Coverage
ZIP centroid resolution must cover 100% of Brazilian ZIP codes at launch. International coverage is out of scope.

### NFR-004 — Backward Compatibility
No breaking changes to the existing delivery options API contract. New fields are additive.

---

## Out of Scope

- **Merchant-configurable radius or km threshold** — the radius concept is eliminated from merchant-facing configuration.
- **Coverage by polygon or region** — cited in the product vision as a future capability; not in this spec.
- **10k PUP API cap** — documented as a known constraint; resolution is out of scope for this spec and should be addressed separately.
- **Turn-by-turn routing distance** — straight-line from ZIP centroid is sufficient for UX purposes.
- **International ZIP codes** — BR only at launch.
- **Shopper GPS / device location** — proximity is calculated from the ZIP entered at checkout, not real-time device location.
- **Pickup point creation or management** — admin flows for adding/editing pickup points are not modified by this spec.
- **Infrastructure migration decision** — MasterData vs. Aurora is an engineering decision; this spec defines requirements agnostic of the chosen data layer.

---

## Revenue Impact Measurement Framework

The core hypothesis of this spec is: **removing the radius limit unlocks orders that today are either abandoned or completed outside VTEX.** To validate this hypothesis and measure the before/after revenue impact, instrumentation must be built alongside — not after — the feature.

### Observability Requirement (FR-009)

**Measuring impact is a hard requirement for this spec, not a nice-to-have.** Before this feature is considered complete, the following must be instrumentable:

1. **"Hidden pickup" event**: a checkout session where the delivery options API was called, the account has at least one active PUP, and no pickup option was returned because all PUPs were beyond the configured radius. This event currently does not exist as a loggable signal — it is a silent absence.

2. **"Newly eligible pickup" event** (post-migration): a checkout session where a pickup option was shown to a shopper whose ZIP is >50km from the nearest PUP, and that option would not have been shown under the old radius constraint.

**How to get the baseline today (pre-migration):**

The hidden pickup coverage rate cannot be read directly from checkout session logs because no event is emitted when pickup is silently excluded. It must be reconstructed via an offline cross-reference:

```
For each account with active PUPs:
  → Get the list of active PUPs with coordinates
  → Get checkout sessions in a time window (e.g., last 90 days) with shopper ZIP
  → For each session: calculate distance from shopper ZIP centroid to nearest active PUP
  → If min(distance) > 50km → classify session as "hidden pickup"
  → Count hidden sessions ÷ total sessions with PUP-enabled account = hidden pickup rate
```

This requires:
- Session-level data with shopper ZIP (confirm availability with data engineering)
- PUP coordinates populated in production data (confirm coverage with engineering — this is also an open question for proximity sorting)
- ZIP-to-centroid resolution table

If session-level ZIP data is not available, a proxy can be built using order destination ZIP from completed orders in PUP-enabled accounts.

### Baseline Metrics (Before)

These must be captured before the feature ships. Without a baseline, before/after comparison is not credible.

| Metric | Description | How to Measure |
|---|---|---|
| **Hidden pickup coverage rate** | % of checkout sessions in PUP-enabled accounts where no pickup appeared because nearest PUP was >50km | Offline cross-reference: session ZIP × PUP coordinates (see above) |
| **Radius increase request volume** | Merchants who have requested radius increases above 50km in the last 12 months | Support ticket / PM request log |
| **Pickup abandonment proxy** | Sessions where no pickup option was shown → checkout abandoned or delivery selected | Checkout funnel data segmented by delivery mode available at session time |
| **Conversion rate by pickup availability** | CR for sessions where pickup was shown vs. not shown (same SKU category, same region) | Existing order + session data |
| **Pickup AOV by distance band** | AOV for pickup orders, segmented by 0–10km, 10–50km, >50km (where manual increases exist) | Order data + PUP coordinates |

### After Metrics (Post-Launch)

| Metric | Target Direction | Notes |
|---|---|---|
| **Incremental pickup sessions** | ↑ | Sessions where a pickup option appeared that would not have appeared under 50km limit — i.e., nearest PUP was >50km from shopper ZIP |
| **Conversion rate in previously-hidden cohort** | ↑ vs. pre-launch abandonment rate for same cohort | Key signal: did unblocking the radius convert sessions that were previously dead-ends? |
| **Incremental GMV from pickup** | ↑ | Orders completed via pickup where shopper ZIP was >50km from nearest PUP |
| **Pickup adoption rate in B2B accounts** | ↑ | Segment by account type; B2B is the primary use case where long-distance pickup is expected |
| **Radius increase support tickets** | ↓ | Volume should drop to near-zero post-launch; residual tickets signal edge cases not covered |
| **Pickup as % of total delivery mode selection** | ↑ | Broader adoption indicator; expected to grow as more PUPs become eligible in checkout |

### Recommended Measurement Approach

**Step 1 — Addressable population sizing (pre-launch)**
Query the accounts with active PUPs and identify: for what % of their shopper ZIP codes is the nearest PUP beyond 50km? This is the addressable population. Segment by account vertical (B2B, fashion, pharma, electronics) to identify highest-value cohorts.

**Step 2 — Revenue floor estimate (pre-launch)**
For the addressable population, estimate: if even X% of those sessions converted via pickup at the account's average pickup AOV, what is the incremental GMV? This gives a conservative revenue floor to justify the migration investment.

**Step 3 — Post-launch cohort tracking**
Tag sessions where the shopper's nearest PUP is >50km (the "newly eligible" cohort). Track their conversion rate and AOV separately from the baseline pickup cohort. The delta is the attributable revenue lift.

**Step 4 — Anchor merchant validation**
Identify 1–2 anchor merchants (RONA, Arcaplanet, or a large B2B account with documented radius pain) to instrument closely. Before/after conversion rate and pickup adoption for those accounts is the most credible data point for leadership communication.

### `[PM INPUT NEEDED]`
- Do we have session-level data that includes shopper ZIP + PUP availability at checkout time? This is critical for the baseline. If not, a data engineering task is needed before launch to capture it.
- What is the current volume of manual radius increase requests per quarter? This is the quickest proxy for demand size.

---

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | What is the engineering timeline for the MasterData migration? This is a hard prerequisite — the spec cannot ship before it. | Engineering | High |
| 2 | Do current pickup point records in production have lat/lon coordinates populated at sufficient coverage? If not, what is the data remediation plan before proximity sorting can be reliable? | Engineering | High |
| 3 | Does VTEX maintain a ZIP-to-centroid resolution table internally, or does this require sourcing and maintaining an external dataset? | Engineering | High |
| 4 | Merchants with existing shipping policies configured with dummy ZIP ranges (00000–999999) for pickup: do those policies need any migration, or do they continue working as-is after the radius is removed? | Engineering + Carol | High |
| 5 | The 10k PUP cap is documented but out of scope. Should a follow-up spec be created to address it, or will the migration to a new data layer naturally resolve it? | Engineering | Medium |
| 6 | Should the distance label switch to meters for very short distances (e.g., "350m" instead of "0.4km")? | Carol / Design | Low |
