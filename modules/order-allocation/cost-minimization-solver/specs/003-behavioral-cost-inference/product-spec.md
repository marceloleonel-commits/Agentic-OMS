# Product Spec — Behavioral Cost Inference

## Clarifications

- Q: How much allocation history is needed before inferred proxies become reliable enough to use? → A: A minimum of 30 days of allocation history and 200 orders per seller before inference is activated for that seller. Sellers below this threshold continue using declared costs only (or VTEX-native costs if no declared costs exist).
- Q: Can a merchant override an inferred cost proxy with a declared value at any time? → A: Yes. Declared costs (VTEX-native or merchant-provided via MMR 002) always take precedence. If a merchant provides a declared handling rate for a seller where one was previously inferred, the inferred proxy is replaced immediately.
- Q: Are inferred cost proxies shown to sellers? → A: No. Inferred proxies are internal to VTEX and visible only to the merchant who operates that fulfillment network. Sellers do not see their own inferred costs.
- Q: What happens if a seller's behavior changes significantly — e.g., they hire more staff and stop delaying heavy orders? → A: Proxies are recalibrated on a rolling window basis (default: 60 days). Behavioral changes are reflected in the proxy values over the next recalibration cycle.
- Q: Can inferred proxies produce a negative cost (implying a seller is better than declared costs suggest)? → A: Yes. A seller who consistently outperforms others in a specific context may receive a below-average proxy value for that dimension, making them relatively cheaper in the cost model for that context.
- Q: If inference is wrong for a specific seller, can the merchant disable it for that seller and fall back to declared costs only? → A: Yes. Merchants can disable inference per seller or seller group, returning that seller to declared-cost-only evaluation.
- Q: Does inference apply to sellers with no VTEX allocation history (new sellers added to the network)? → A: No. New sellers have no behavioral data to infer from. They are evaluated on declared costs only until they accumulate the minimum history threshold.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Solver correctly deprioritizes a seller with a high rejection pattern before the merchant declares any cost (Priority: P1)

An Omnichannel Manager at Intimissimi adds a new franchise store to their fulfillment network. The store has no handling cost configured. Over the first 30 days, the store rejects 40% of orders with delivery distance > 50km and delays 25% of orders with more than 3 items. The solver infers a high distance cost proxy and a high capacity cost proxy for this seller. From day 31, orders with long distances or high item counts are routed to other sellers unless declared costs make this store the clear winner.

**Why this priority:** This is the core value of the MMR. Without behavioral signals changing allocation decisions for sellers with no declared costs, the feature has no impact.

**Independent Test:** Create a seller with no cost configuration. Generate a pattern of rejections and delays in a test environment over the minimum history threshold. Confirm: after the threshold is reached, the solver assigns higher implicit costs to that seller for the dimensions where poor behavior was observed, and allocation decisions shift accordingly compared to a baseline with no inference.

**Acceptance Scenarios:**

1. **Given** a seller has accumulated the minimum history (30 days, 200 orders), **When** the inference engine runs, **Then** cost proxies are generated for any dimension where a behavioral pattern is detected.
2. **Given** a seller consistently rejects orders above a certain delivery distance, **When** the inference engine processes this pattern, **Then** a distance cost proxy is assigned that increases this seller's effective cost for orders with delivery distance above the observed rejection threshold.
3. **Given** a seller consistently delays orders above a certain weight or item count, **When** the inference engine processes this pattern, **Then** a capacity cost proxy is assigned that increases this seller's effective cost for orders exceeding the observed delay threshold.
4. **Given** a seller has a high cancellation or rejection rate overall, **When** the inference engine processes this pattern, **Then** a reliability cost proxy is assigned that reflects the operational risk of allocating to this seller.
5. **Given** a seller has declared costs for shipping (VTEX-native) but no declared handling cost, **When** the solver runs, **Then** it uses the VTEX-native shipping cost and the inferred capacity cost proxy for handling — not zero.
6. **Given** a merchant provides a declared handling rate for a seller that previously had only an inferred proxy, **When** the declared value is saved, **Then** the inferred proxy for that dimension is replaced immediately and the declared value is used in all subsequent allocations.

### User Story 2 — Merchant views inferred cost proxies and disables inference for a specific seller (Priority: P2)

An Omnichannel Manager at C&A reviews the cost variable breakdown for a franchise store and sees that inference has assigned a high distance cost proxy because the store rejected several long-distance test orders during onboarding — not representative of its actual operational pattern. The manager disables inference for that seller.

**Acceptance Scenarios:**

1. **Given** a seller has active inferred cost proxies, **When** the merchant views the seller's cost profile in the agent interface, **Then** each inferred proxy is clearly labeled as "inferred" (vs. "declared") with a plain-language description of the behavioral signal that drove it.
2. **Given** the merchant disables inference for a seller, **When** the next allocation runs, **Then** that seller is evaluated on declared costs only; inferred proxies are no longer applied.
3. **Given** inference is disabled for a seller, **When** the merchant re-enables it, **Then** the system re-evaluates the seller's behavioral history and generates new proxies based on the most recent rolling window.

### User Story 3 — Inference identifies a seller that performs better in a specific context (Priority: P2)

Over 60 days, Seller D at OBI consistently fulfills orders from the Southeast region on time at lower-than-average cost — better than its declared shipping rates suggest, likely due to a regional carrier contract VTEX doesn't know about. The inference engine assigns a below-average distance cost proxy for Southeast orders, making Seller D more competitive for that region in the solver.

**Acceptance Scenarios:**

1. **Given** a seller shows consistently better performance in a specific geographic region, **When** the inference engine processes this pattern, **Then** a contextual performance proxy is assigned that reduces that seller's effective cost for orders in that context.
2. **Given** the solver receives an order matching the seller's high-performance context, **When** it evaluates options, **Then** the contextual proxy is applied and the seller's ranking improves relative to the baseline without inference.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST observe and record seller allocation outcomes per order attribute (delivery distance, order weight, item count, product category, region, time of day/week) as the behavioral data source for inference.
- **FR-002**: The system MUST require a minimum of 30 days of allocation history AND 200 orders before activating inferred cost proxies for any seller. Sellers below this threshold are evaluated on declared costs only.
- **FR-003**: The system MUST derive and maintain the following cost proxy types from behavioral patterns: distance cost proxy, capacity cost proxy, reliability cost proxy, and contextual performance proxy.
- **FR-004**: Declared costs (VTEX-native or merchant-provided) MUST always take precedence over inferred proxies for the same cost dimension. Inference MUST only fill dimensions where no declared cost exists.
- **FR-005**: The system MUST recalibrate inferred proxies on a rolling 60-day window; behavioral changes outside this window are phased out of the proxy values.
- **FR-006**: The system MUST allow inferred proxies to be positive (seller performs worse than average for a dimension) or negative (seller performs better than average).
- **FR-007**: The system MUST expose inferred cost proxies to merchants in the cost variable view, clearly labeled as "inferred" with a plain-language description of the behavioral signal that drove each proxy.
- **FR-008**: The system MUST allow merchants to disable inference per seller or seller group; disabled sellers are evaluated on declared costs only until inference is re-enabled.
- **FR-009**: The system MUST NOT expose inferred cost data to sellers — proxies are internal to the merchant's account.
- **FR-010**: The system MUST NOT share inferred cost data across merchant accounts.
- **FR-011**: The system SHOULD surface a warning when a seller's inferred proxy changes significantly between recalibration cycles, prompting the merchant to review.

---

## Assumptions

- Seller allocation outcomes (acceptance, rejection, delay, on-time fulfillment) are reliably recorded per order in the allocation pipeline and queryable by the inference engine.
- The behavioral signal record includes the relevant order attributes (distance, weight, item count, region) needed to detect dimension-specific patterns.
- A minimum of 200 orders per seller is sufficient to produce statistically stable proxies for common cost dimensions; this threshold may be adjusted based on GA validation.
- Inference runs as a background batch process, not inline during order allocation. Proxy values are pre-computed and cached; the solver reads cached proxies at allocation time.
- Merchants accept that inferred proxies are approximations based on behavioral patterns and may not perfectly match true underlying costs — they are a best-effort signal, not a guarantee.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 50% of sellers in a GA merchant's network who lack declared costs have active inferred proxies within 60 days of GA launch.
- **SC-002**: Allocation decisions for sellers with active inferred proxies show measurable differentiation compared to the no-inference baseline — proxies are changing outcomes, not just adding noise.
- **SC-003**: Merchants who enable inference show equal or better total cost-to-serve vs. merchants using declared costs only, measured on a matched cohort of order types.
- **SC-004**: 0 inferred proxies applied to sellers below the minimum history threshold (30 days, 200 orders).
- **SC-005**: Proxy recalibration cycles complete within 24 hours of the rolling window boundary — sellers' behavioral changes are reflected within one business day.
- **SC-006**: At least 80% of merchants who view their sellers' inferred cost profiles rate the plain-language behavioral explanation as "understandable" in post-GA feedback.
