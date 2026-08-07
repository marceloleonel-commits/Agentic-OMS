# Spec: Dynamic Capacity — Capacity Release Based on Order Progress

## Metadata

| Field | Value |
|---|---|
| **Spec ID** | OC-002 |
| **Module** | Fulfillment → Operational Capacity |
| **Phase** | Phase 4 — Automatic Capacity Release + Pick & Pack Integration |
| **Vision Reference** | `product-vision.md` → Problem 5, Key Capability 6, Phase 4 |
| **Roadmap Item (MMR)** | [1691 — Dynamic Operational Capacity Based on Order Progress](https://roadmap.vtex.com/portal/commerce/c/1691--dynamic-operational-capacity-based-on-order-progress) |
| **Expected Release** | 27Q1 |
| **Expected Availability** | Priority Access (Closed Beta) |
| **Author** | Carolina Tourinho |
| **Status** | Draft |
| **Created** | July 2026 |
| **Personas** | Ecommerce Manager, Operations Manager, Store Manager |
| **Supporting Teams** | Pick and Pack, OMS, Delivery Promise |

---

## What This Spec Covers

This spec defines **dynamic capacity**: releasing capacity that a store has already consumed, once the corresponding orders are processed and invoiced ahead of their assigned capacity day.

Today the module uses a **static consumption model**. Capacity is consumed when an order is placed and stays committed until that capacity day passes, regardless of whether the order was actually fulfilled two days earlier. Stores that process fastest therefore look the most constrained in checkout.

**What changes when this ships:**
- When an order is invoiced before its assigned capacity day, the slot it occupied is released and becomes available again for new orders.
- Delivery promises recalculate against real remaining capacity rather than nominal committed capacity.
- Merchants can compare **configured capacity** against **effectively consumed capacity** over time, and see which release events happened and why.

This spec does **not** change how capacity limits are configured, how orders are allocated to sellers, or how the enforcement itself works when a limit is genuinely reached.

---

## Context

Operational Capacity reached GA in early 2026 and is in use by 281 merchant accounts across 47,680 sellers. It enforces a daily order limit per seller: when the limit is reached, delivery promises extend to the next available day.

The model assumes that an order occupies a store's capacity for the entire day it was assigned to. In practice, high-performing ship-from-store operations break that assumption constantly. A store that clears Monday's queue on Sunday afternoon still shows Monday as full.

**C&A** formalized this as a Customer Need in February 2026:

> *"A fila de capacidade permanece comprometida em dias futuros, mesmo quando os pedidos desses dias já foram processados. Isso faz com que a capacidade fique artificialmente bloqueada, impactando negativamente a promessa de entrega exibida ao shopper e o volume de pedidos processados por lojas que teriam capacidade real para operar mais."*
> — C&A operations team, January 2026

C&A reports this happening **frequently in daily operations**, and specifically during periods of *higher* operational efficiency — the model penalizes exactly the behavior the merchant is trying to encourage. The impact concentrates in operations with high order volume per store, continuous processing throughout the day, and capacity that changes dynamically.

The Customer Need is explicit that no scalable workaround exists. Manual capacity reconfiguration does not follow the invoicing pace, requires constant intervention, and never fully closes the gap.

**Marisa** and **DPSP** have registered the same interest against the roadmap item.

*(Source: [Customer Need — C&A: Dynamic Operational Capacity](https://docs.google.com/document/d/1IDqWb8hPAYVpkSku0yy5uW2HEQtCfU6Pv7jxKsEqPBw))*

---

## Problem Statement

> Capacity is consumed when an order is placed and released only when its capacity day expires. When a store invoices an order ahead of schedule, the capacity that order reserved stays artificially blocked. The result is a systematic mismatch between configured capacity and actually consumed capacity, which inflates delivery promises to shoppers and starves the most efficient stores of volume they could absorb.

Two consequences, both quantifiable:

1. **Delivery promise distortion.** The shopper sees a longer date than the operation could honor. This works directly against the delivery promise accuracy goal.
2. **Lost volume on high-performing stores.** Orders route away from, or are throttled at, stores that have real available capacity. This is GMV the merchant does not capture.

---

## Dependency on OC-001

This spec assumes the instrumentation delivered by `past-capacity-observability.md` (OC-001).

Dynamic capacity requires reliably attributing processing events to specific capacity slots — which is exactly the order-to-slot allocation model OC-001 builds. Without it there is no way to know *which* slot an invoiced order should release, and no way to validate that the release logic behaved correctly in production.

**OC-001 is a hard prerequisite.** The condition "configured vs. effectively used capacity over time", listed by C&A as a Condition of Satisfaction, is delivered by the OC-001 data layer extended with the release events specified here.

---

## User Stories

### US-01 — Capacity Released on Invoice (Merchant)

**As** an Operations Manager at a ship-from-store retailer,
**I want** the capacity a store consumed to be released as soon as the corresponding order is invoiced ahead of its capacity day,
**So that** the store's remaining capacity reflects what it can actually still process today, instead of a number frozen at order placement.

**Acceptance criteria:**
- When an order transitions to the configured release status before its assigned capacity day, one unit of capacity is released on that day for that seller and sales channel.
- The released unit becomes immediately available to subsequent capacity evaluations.
- Capacity is never released more than once for the same order, even if the triggering event is delivered multiple times.
- An order invoiced **on** its assigned capacity day does not release capacity — that day is already being consumed as intended.

---

### US-02 — Delivery Promise Reflects Released Capacity (Shopper, via Merchant)

**As** an Ecommerce Manager,
**I want** delivery promises in checkout to account for capacity that has been released,
**So that** shoppers see the shortest date the operation can genuinely honor, and my most efficient stores capture the volume they are capable of handling.

**Acceptance criteria:**
- After a release event, the next capacity evaluation for that seller and day uses the updated available count.
- No recalculation is applied retroactively to orders already placed — released capacity affects future evaluations only.
- The behavior is consistent with the existing async, batched processing model. Release is not required to be visible within the same checkout session that triggered it.

---

### US-03 — Configure the Release Trigger (Merchant)

**As** an Ecommerce Manager,
**I want** to control which order status releases capacity, and to enable or disable dynamic capacity per seller,
**So that** the release model matches how my operation actually defines "this order is done occupying the store."

**Acceptance criteria:**
- Dynamic capacity can be enabled or disabled per seller. Default is **disabled** — existing sellers keep the current static behavior until the merchant opts in.
- The release trigger status is configurable from a bounded, VTEX-defined list of order statuses. Default is **invoiced**.
- The current configuration is readable and writable via the Operational Capacity API and visible in the admin.
- Changing the trigger applies to events from that point forward. It does not retroactively release or re-consume capacity for orders already processed.

---

### US-04 — Reversal Handling (Operator)

**As** an Operations Manager,
**I want** capacity that was released to be re-consumed if the triggering event is reversed — for example an invoice cancellation or an order cancellation after invoicing —
**So that** the capacity count does not drift away from reality over time.

**Acceptance criteria:**
- If an invoice is cancelled and the capacity day has not yet passed, the released unit is re-consumed for that seller and day.
- If the capacity day has already passed, no re-consumption occurs and the event is recorded in the log as a no-op with its reason.
- Re-consumption may push a seller above its configured limit for that day. This is allowed and surfaced as an over-limit state; it does not retroactively invalidate orders already accepted.

---

### US-05 — Configured vs. Consumed Capacity Visibility (Merchant)

**As** an Ecommerce Manager,
**I want** to see, per seller and per day, the configured limit, the capacity consumed at placement, how much was released, and the net effectively consumed capacity,
**So that** I can prove dynamic capacity is working and use the gap between configured and consumed to recalibrate my limits.

**Acceptance criteria:**
- For each day, the admin shows: configured limit, gross consumption, released units, net consumption, and net utilization percentage.
- Every release and re-consumption event is recorded in the OC-001 capacity event log, with order ID, seller, capacity day, triggering status, and timestamp.
- The same data is available via the public capacity API.
- This is a direct extension of the OC-001 data model, not a parallel one.

---

### US-06 — Sponsor Validation in Closed Beta (VTEX)

**As** the Fulfillment PM,
**I want** dynamic capacity gated behind Priority Access with per-seller enablement,
**So that** the release logic is validated with a sponsor account in production before broader exposure.

**Acceptance criteria:**
- The capability is enabled only for accounts explicitly allowed into the Closed Beta.
- Enablement is per seller, so a sponsor can run a subset of stores dynamically and the rest statically for comparison.
- Release event volume and correctness are observable by VTEX for the beta cohort.

---

## Functional Requirements

### FR-001 — Release Trigger
When an order reaches the configured release status and the following conditions all hold, the system releases one unit of capacity:

1. Dynamic capacity is enabled for the seller.
2. The order previously consumed a capacity slot in this module.
3. The assigned capacity day is **strictly in the future** relative to the event timestamp, in the seller's configured timezone.
4. Capacity for that order has not already been released.

### FR-002 — Release Granularity
Capacity is released with the same granularity it is consumed: one unit per order, scoped to seller, capacity day, and sales channel. Dynamic capacity does not introduce a new unit of measure (no item-level or weight-based release).

### FR-003 — Idempotency
Every release is keyed on the order identity and its assigned capacity slot. Duplicate or replayed trigger events must be no-ops. The system must never release more capacity than the order originally consumed.

### FR-004 — Reversal and Re-consumption
When the triggering event is reversed (invoice cancellation, order cancellation after invoicing) and the capacity day has not yet passed, the released unit is re-consumed. If the capacity day has passed, the reversal is logged as a no-op. Re-consumption is subject to the same idempotency guarantee as release.

### FR-005 — Per-Seller Enablement
Dynamic capacity is a per-seller setting, defaulting to disabled. Enabling it does not retroactively release capacity for orders invoiced before the setting was turned on. Disabling it stops future releases and leaves already-released capacity as-is.

### FR-006 — Configurable Release Status
The release trigger is selectable from a bounded list of order statuses defined by VTEX. The default is `invoiced`. Free-form or arbitrary status configuration is not supported — the list is constrained to statuses whose semantics VTEX can guarantee across accounts.

### FR-007 — Configuration API
The Operational Capacity API exposes read and write access to the dynamic capacity configuration:

```
GET/PUT /api/logistics/pvt/capacity/sellers/{sellerId}/dynamic-capacity
```

Payload: `enabled` (boolean), `releaseTriggerStatus` (enum). Authentication and authorization follow the existing Operational Capacity API model.

### FR-008 — Release Event Log
Every release and re-consumption is written to the OC-001 capacity event log as a new event type, with: event type (`capacity-release` or `capacity-reconsumption`), order ID, seller ID, sales channel ID, capacity day, triggering order status, event timestamp, and outcome (applied / no-op with reason).

### FR-009 — Consumption Breakdown in Admin and API
The daily utilization data delivered by OC-001 is extended with: gross consumption, released units, net consumption, and net utilization percentage. Both the admin view and the public capacity history API expose these fields.

### FR-010 — Availability for Subsequent Evaluations
Released capacity becomes available to the next capacity evaluation cycle for that seller and day. Consistent with the module's async architecture, there is no requirement for the release to be visible in an in-flight checkout session.

### FR-011 — Timezone Handling
The comparison between event timestamp and assigned capacity day uses the seller's configured timezone, consistent with the per-seller timezone model in `seller-architecture`. A release event must not be evaluated in UTC when the seller operates in a different offset.

### FR-012 — Closed Beta Gating
The capability is gated at the account level for Priority Access. Accounts outside the beta cohort cannot enable it, and the configuration endpoint returns an explicit not-enabled response rather than silently accepting the setting.

---

## API Mapping

| Requirement | Endpoint | Status |
|---|---|---|
| Capacity configuration read/write (existing) | `GET/PUT /api/logistics/pvt/capacity/sellers/{sellerId}` | Public, available today |
| Past utilization history (OC-001) | `GET /api/operations/pvt/capacity/history` | New — OC-001 |
| Capacity event log (OC-001) | `GET /api/operations/pvt/capacity/events` | New — OC-001 |
| **Dynamic capacity configuration** | `GET/PUT /api/logistics/pvt/capacity/sellers/{sellerId}/dynamic-capacity` | **New — this spec** |
| **Release events** | `GET /api/operations/pvt/capacity/events?eventType=capacity-release` | **Extension of OC-001 — this spec** |
| **Consumption breakdown** | `GET /api/operations/pvt/capacity/history` (extended fields) | **Extension of OC-001 — this spec** |

---

## Non-Functional Requirements

### NFR-001 — Async, Batched Processing
Release processing follows the module's existing async model. This spec does not introduce real-time per-order capacity validation, which remains an explicit non-goal of the vision.

### NFR-002 — Release Latency
A release event must be reflected in the seller's available capacity within 5 minutes of the triggering order status change (P95).

### NFR-003 — Correctness Over Availability
If the system cannot determine with certainty which capacity slot an order consumed, it must **not** release capacity. Under-releasing degrades to today's static behavior, which is acceptable. Over-releasing lets a store accept orders it cannot fulfill, which is not.

### NFR-004 — Reconciliation
A reconciliation mechanism must be able to detect and correct drift between recorded net consumption and the actual set of orders occupying each capacity day. Drift is expected in a distributed event-driven model and must be observable.

### NFR-005 — Scale
The release path must sustain the peak event rate of the current GA footprint — 281 accounts, 47,680 sellers — plus Black Friday multiples, without degrading the capacity enforcement path itself.

### NFR-006 — Documentation
The dynamic capacity configuration endpoint and the new event types must be documented on developers.vtex.com before the capability moves beyond Priority Access.

---

## Success Criteria

| Metric | Target |
|---|---|
| Sponsor validation | At least 1 sponsor account (C&A) running dynamic capacity in production and confirming the delivery promise distortion documented in the Customer Need is resolved |
| Delivery promise improvement | Measurable reduction in promised delivery date for sellers with dynamic capacity enabled, versus a static control group in the same account |
| Volume capture | Measurable increase in orders accepted by sellers with dynamic capacity enabled, without an increase in fulfillment SLA breaches |
| Correctness | Zero incidents of over-release causing a seller to accept orders beyond real capacity |
| Long-term adoption | 30% of omnichannel merchants (franchise seller accounts) using dynamic capacity `[PM INPUT NEEDED: confirm target — inherited from vision, flagged there as unvalidated]` |

---

## Out of Scope

- **Pick & Pack as a release trigger.** The vision positions Pick & Pack as an additional data source for the release signal. This spec uses order status only. Pick & Pack integration is a follow-up once the release mechanism is proven.
- **Proactive limit recommendations.** Phase 3, separate spec.
- **Delivery Promise integration itself.** Owned by the Delivery Promise team. This spec makes released capacity available and correct; how Delivery Promise consumes capacity state in checkout is scoped by that team.
- **Retroactive recalculation of existing orders' promises.** Released capacity affects future evaluations only.
- **Capacity units other than order count.** No item-level, weight-based, or time-based capacity in this spec.
- **Seller Portal sellers and external marketplace sellers.** Consistent with the vision non-goals.
- **Capacity transfer between days or between sellers.** Released capacity returns to the day it was consumed from; it is not redistributed.

---

## Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | The vision places dynamic capacity in Phase 4 (2027–2028), but roadmap item 1691 targets 27Q1 Closed Beta. Which is correct? The vision needs to be reconciled either way. | Carol | High |
| 2 | Is `invoiced` the right default trigger, or should it be an earlier status such as `handling`? C&A's Customer Need raises merchant-configurable triggers, but each additional configurable status increases misconfiguration risk. | Carol + C&A | High |
| 3 | Does the current architecture record which capacity slot an order consumed in a durable, queryable form, or does that only exist once OC-001 ships? This determines whether OC-001 is a sequencing dependency or a hard technical blocker. | Engineering | High |
| 4 | How does Delivery Promise pick up released capacity — polling capacity state, or does Operational Capacity push an invalidation signal? Performance envelope needs to be scoped jointly. | Delivery Promise team | High |
| 5 | How should re-consumption behave when it would push a seller over its limit for a day that has already accepted orders based on the released capacity? Allowing over-limit is proposed above, but the merchant-facing framing needs definition. | Carol + Design | Medium |
| 6 | Should dynamic capacity be enabled by default for new sellers once it reaches GA, or remain opt-in permanently? | Carol | Medium |
| 7 | Do Marisa and DPSP have the same trigger semantics as C&A, or do their operations define "done occupying the store" differently? Worth validating before fixing the default. | Carol + Growth | Medium |
| 8 | What is the reconciliation cadence and who is alerted when drift exceeds a threshold? | Engineering | Medium |

---

## Appendix

### Source Documents

| Document | Link |
|---|---|
| Customer Need — C&A: Dynamic Operational Capacity | [Google Doc](https://docs.google.com/document/d/1IDqWb8hPAYVpkSku0yy5uW2HEQtCfU6Pv7jxKsEqPBw) |
| [Fulfillment] Operational Capacity: path to GA | [Google Doc](https://docs.google.com/document/d/14nVAN2D1OJ7uq21roC964OXfQC_OatrLrr8WF0Muy4A) |
| Operational Capacity — Vision & Strategy | `product-vision.md` |
| Spec OC-001 — Past Capacity Observability | `specs/past-capacity-observability.md` |
| Roadmap Item 1691 — Dynamic Operational Capacity Based on Order Progress | [Product AI Hub](https://roadmap.vtex.com/portal/commerce/c/1691--dynamic-operational-capacity-based-on-order-progress) |
| Operational Capacity API Reference | [developers.vtex.com](https://developers.vtex.com/docs/api-reference/operational-capacity-api) |

### Changelog

| Date | Author | Change |
|---|---|---|
| July 2026 | Carolina Tourinho | Initial draft |
