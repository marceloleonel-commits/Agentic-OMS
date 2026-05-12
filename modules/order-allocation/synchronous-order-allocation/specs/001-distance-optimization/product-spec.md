# Product Spec — Distance Optimization in Order Allocation

## Clarifications

- Q: What is a "tiebreaker" in this context? → A: After eligibility evaluation (stock, SLA, hard constraints), if two or more sellers are equally valid candidates for the same pickup order, distance is used to decide between them. It only applies when multiple sellers are tied — it does not override or reorder sellers that are differentiated by other criteria.
- Q: What qualifies as a "tie" between sellers? → A: Two sellers tie when they both have stock, both can meet the delivery SLA, and neither is excluded by any hard constraint. If one seller has a shorter SLA than another, they are not tied — the SLA criterion already distinguishes them.
- Q: How is distance measured? → A: By the straight-line geodesic distance between the registered coordinates of each seller's pickup point and the shopper's selected collection address. Postal code (CEP) proximity is used as a fallback when coordinates are unavailable.
- Q: What shopper address is used as the reference point? → A: The address of the shopper's chosen pickup location — the store or locker the shopper selected to collect their order.
- Q: Does this apply to home delivery as well? → A: No. This release is scoped to pickup orders (ship-to-store, click-and-collect). Home delivery allocation is not affected.
- Q: Does the merchant need to register coordinates for each seller's pickup point? → A: The engine uses coordinates already registered in the VTEX logistics configuration for each seller's physical location. If coordinates are missing, the engine falls back to CEP-based proximity.
- Q: What happens when two pickup points are equidistant? → A: A merchant-configurable fallback applies. The default is deterministic tie-breaking by seller ID. Merchants can configure a different fallback.
- Q: Does enabling distance optimization change allocation behavior for orders where only one seller is eligible? → A: No. If only one seller is eligible, it is assigned regardless of distance. Distance is only relevant when multiple sellers tie.
- Q: Is this feature available for all sellers or only seller whitelabel? → A: Primarily seller whitelabel, where the merchant's own physical stores are registered as individual sellers. Marketplace third-party sellers can be included if they have registered pickup points with coordinates.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Shopper selects a pickup store and is allocated to the closest eligible seller (Priority: P1)

A shopper at Pague Menos selects "pickup at store" and chooses a store in their neighborhood. The order has three eligible sellers (three Pague Menos stores with stock and matching SLA). Without distance optimization, one would be picked arbitrarily. With it enabled, the allocation engine selects the store whose pickup point is closest to the shopper's chosen collection address.

**Why this priority:** This is the core scenario the feature is built around. If the engine does not consistently select the nearest tied seller, the feature delivers no value.

**Independent Test:** Enable distance optimization. Place a pickup order for an item stocked at three stores equidistant in terms of SLA. Confirm: the store with the shortest distance to the shopper's pickup address is selected. Repeat with a second delivery address and confirm the assignment changes accordingly.

**Acceptance Scenarios:**

1. **Given** distance optimization is enabled and two or more sellers are equally eligible for a pickup order, **When** the engine applies the tiebreaker, **Then** the seller whose pickup point has the shortest distance to the shopper's collection address is selected.
2. **Given** only one seller is eligible, **When** the engine evaluates, **Then** distance is not calculated and that seller is assigned directly.
3. **Given** the nearest tied seller is out of stock, **When** the engine evaluates eligibility, **Then** that seller is excluded from the eligible set before distance tiebreaking is applied — the next nearest eligible seller is selected.
4. **Given** two tied sellers are equidistant, **When** the tiebreaker runs, **Then** the merchant-configured fallback is applied. If no fallback is configured, the default (deterministic by seller ID) applies.

### User Story 2 — Hard constraints are applied before distance tiebreaking (Priority: P1)

A shopper places a pickup order. Three stores are eligible by stock and SLA. One is constrained (e.g., blocked from this order type). The constrained store is removed before distance is calculated. The engine applies distance tiebreaking to the remaining two.

**Acceptance Scenarios:**

1. **Given** a hard constraint blocks a seller from the order type, **When** the engine builds the eligible set, **Then** the constrained seller is excluded before distance tiebreaking runs.
2. **Given** a constraint removes all but one seller, **When** distance tiebreaking would normally apply, **Then** the single remaining seller is assigned without distance calculation.

### User Story 3 — Merchant enables distance optimization without VTEX support (Priority: P1)

An Omnichannel Manager at Kopenhagen enables distance optimization for pickup orders from the VTEX Admin logistics configuration. The next pickup order uses the distance tiebreaker.

**Acceptance Scenarios:**

1. **Given** a merchant navigates to the allocation configuration in VTEX Admin, **When** they enable distance optimization for pickup orders, **Then** the setting is saved and the next order processed uses the distance tiebreaker.
2. **Given** distance optimization is enabled, **When** a non-pickup order is placed, **Then** distance optimization is not applied — the standard allocation logic runs unchanged.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST support distance-based tiebreaking as an opt-in configuration per merchant account, applicable to pickup orders.
- **FR-002**: Distance tiebreaking MUST be applied only when two or more sellers are equally eligible — after stock, SLA, and hard constraint evaluation. It MUST NOT override or reorder sellers that are differentiated by any prior criterion.
- **FR-003**: Distance MUST be calculated between the registered coordinates of each tied seller's pickup point and the shopper's selected collection address. The system MUST fall back to CEP-based proximity when coordinates are unavailable.
- **FR-004**: The system MUST select the tied seller with the shortest distance to the shopper's collection address.
- **FR-005**: The system MUST support a merchant-configurable fallback for equidistant sellers. The platform default is deterministic tiebreaking by seller ID.
- **FR-006**: Distance optimization MUST apply exclusively to pickup orders in this release. Home delivery allocation is unaffected.
- **FR-007**: Distance optimization MUST NOT affect checkout latency beyond the overall P99 < 200ms allocation budget.
- **FR-008**: Merchants MUST be able to enable and disable distance optimization from VTEX Admin without VTEX support intervention.

---

## Assumptions

- Registered coordinates (latitude/longitude) for each seller's physical pickup location are available in the VTEX logistics configuration or can be derived from the registered address.
- The shopper's selected collection address is available to the allocation engine at checkout evaluation time.
- Seller whitelabel sellers are registered as individual sellers with their own pickup point configurations in the VTEX account.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can enable distance optimization and confirm it takes effect on the next pickup order without VTEX support intervention.
- **SC-002**: 0 pickup orders allocated to a farther tied seller when a nearer eligible seller had available stock and a valid SLA.
- **SC-003**: Distance tiebreaking adds no measurable regression to P99 allocation latency.
- **SC-004**: At least one sponsor customer (Pague Menos, Kopenhagen, Farmácias São João, or Extrafarma) activates the feature within 30 days of GA and shows a measurable reduction in average distance between assigned pickup point and shopper's collection address.
