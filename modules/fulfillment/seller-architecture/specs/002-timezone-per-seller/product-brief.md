# Product Brief — Timezone Configuration per Seller (sellerType=3)

| Field | Value |
| --- | --- |
| **Spec** | 002 — Timezone Configuration per Seller |
| **Module path** | fulfillment / seller-architecture |
| **Pillar** | Fulfillment / Seller Architecture |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | TBD |
| **Team** | Fulfillment |

**Related assets:**
- [Meeting notes — Timezone na nova arquitetura de sellers (May 11, 2026)](https://docs.google.com/document/d/1OXw70fVQfdVPX6PHDuX9nhW4erc4wh9OEaQQm6Gp3Ak/edit) — Carol Tourinho, Clara Swarczman, Mariana Alves, Ronan Cruz, Marcos Gibin, Vinícius Campos

---

## Problem

The current timezone model in VTEX is configured at the country level: one timezone per country. Calculations are performed in UTC and converted based on country configuration. This works for merchants operating in a single timezone — but breaks for any merchant with stores across multiple time zones within the same country.

For Dollar General operating across ~47 US states, a single account-level timezone means every store uses the same reference time. A cutoff of 14:00 is 14:00 everywhere — regardless of whether the store is in New York (ET) or Los Angeles (PT). The result: incorrect delivery promises, with stores appearing open when they are already closed (or vice versa) depending on the direction of the timezone difference.

### Two distinct dimensions of the problem

The discussion identified that timezone affects two separate things that should not be conflated:

**1. Origin timezone (store / warehouse):**
Defines when the store is operationally available — opening and closing hours, cutoff times, operational capacity slots. This is the timezone of the physical location fulfilling the order. Logically, these rules should be anchored to the warehouse or dock, not to the shipping policy.

**2. Destination timezone (shopper):**
Relevant for displaying delivery windows correctly to the shopper. The current system prioritizes destination timezone to determine carriers and schedules — implicitly assuming that origin and destination share the same timezone. This assumption is wrong for cross-timezone deliveries and generates operational errors.

---

## Current behavior

- Timezone is configured per country on the account
- The system uses destination timezone to determine carrier availability and delivery windows
- Origin and destination timezones are assumed to be the same
- Operating hours rules (open/close) are defined in the shipping policy, not the warehouse/dock — which creates a conceptual mismatch: the rule is physically tied to the origin, but lives in a policy-level entity

---

## Solutions evaluated

### Option A — Timezone field on the shipping policy
Suggested by Clara as a practical, quick solution — more granular than the current account-level config. A timezone field on the shipping policy would allow different carriers/routes to use different reference times.

**Problem:** Shipping policies define routing and SLA rules, but a single policy can serve stores in multiple timezones. The approach still forces origin-destination timezone equivalence and does not solve the architectural mismatch of where operating hours rules should live.

### Option B — Timezone inference from destination ZIP code *(ideal, not for critical path)*
Considered more robust: infer timezone from the shopper's ZIP code at checkout time. This correctly separates origin and destination timezone handling.

**Problem:** Requires an external database or service mapping ZIP codes to timezones. Clara emphasized that external dependencies must not be placed in the critical path — a failure in that service would interrupt store operations. **Decision: do not put ZIP-based inference in the critical path.**

### Option C — Timezone field on the seller (sellerType=3)
The natural extension of the sellerType=3 architecture: since the seller represents the physical store, it is the correct entity to hold the origin timezone. Operating hours and cutoff times are resolved against the seller's local time.

**This is the approach being pursued for this spec.** It is explicit (merchant configures it), does not introduce external dependencies, and correctly anchors origin timezone to the operational entity.

---

## Scope (this release)

- Introduce a `timezone` field on the sellerType=3 seller entity, set at creation or update
- Timezone values follow the IANA timezone database standard (e.g., `America/New_York`, `America/Los_Angeles`, `America/Chicago`)
- Cutoff times on shipping policies and SLAs are resolved using the seller's timezone when the fulfillment source is a sellerType=3 seller
- Operational Capacity schedules and pickup point hours are resolved in the seller's local timezone
- Default behavior when no timezone is set: falls back to the account-level country timezone (preserves backward compatibility)

### Open questions

- Should the destination timezone (shopper) also be handled in this spec, or addressed separately?
- Should warehouse/dock-level timezone override the seller-level timezone for merchants with mixed timezone warehouses under the same seller?
- What is the correct behavior when origin and destination are in different timezones — is the cutoff evaluated in origin time, destination time, or both?

> **Next step (Carol):** Gather more customer use cases with multiple timezones to validate the ideal strategy before finalizing scope.

---

## Out of scope

- Timezone configuration for sellerType=1 and sellerType=2 (franchise accounts have their own account-level timezone)
- ZIP code-based timezone inference (external dependency, not in critical path)
- Storefront display of delivery windows adjusted to the shopper's local timezone

---

## Success criteria

- A sellerType=3 seller can have an individual IANA timezone configured via API
- Cutoff time resolution for delivery promise uses the seller's local timezone
- A merchant with stores in Eastern and Pacific time zones sees correct and independent same-day availability per store
