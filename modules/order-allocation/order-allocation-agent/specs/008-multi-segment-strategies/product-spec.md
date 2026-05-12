# Product Spec — Multi-Segment Strategies

## Clarifications

- Q: Can segment rules overlap (e.g., "express orders" and "orders over R$1,000" could describe the same order)? → A: No. Segment rules must be mutually exclusive. The agent must detect and flag overlaps before the merchant approves the segment definitions.
- Q: What happens to an order that matches no segment rule? → A: It is always routed to the default segment ("all other orders"), which must have an active strategy at all times.
- Q: Can the merchant publish some segments and leave others pending? → A: No. All segments must have valid, simulated strategies before any go live. Partial activation is not supported in GA.
- Q: Is there a maximum number of segments? → A: Maximum 5 active segments (including the default) in GA.
- Q: Can the merchant add a new segment to an already-live multi-segment configuration without republishing all segments? → A: No. Adding or modifying any segment requires re-publishing the full configuration after simulation.
- Q: Does each segment have its own simulation, or is the full order base simulated once? → A: Each segment is simulated independently on the historical orders that match its rule. Results are presented per segment.
- Q: Can monitoring (MMR 002) show KPIs per segment? → A: Yes, if MMR 002 is active, the monitoring dashboard shows a breakdown per segment when multi-segment is configured.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant configures distinct strategies for express and standard orders (Priority: P1)

An Omnichannel Manager at C&A describes two segments: "orders where the shopper selected same-day or next-day delivery" and "all other orders." For the express segment, they configure Speed Optimization. For the standard segment, they configure Cost Minimization. The agent interprets both segment rules and strategies, both are simulated independently, and the full configuration is published together.

**Why this priority:** This is the core value of the MMR. Without the ability to define segments and configure independent strategies per segment, the feature does not exist.

**Independent Test:** Define two non-overlapping segments in natural language. Configure a distinct strategy for each. Simulate both. Publish. Place test orders that match each segment. Confirm: each order is allocated according to its segment's strategy, not a single global strategy.

**Acceptance Scenarios:**

1. **Given** the merchant defines two segment rules in natural language, **When** the agent processes them, **Then** it presents a plain-language summary of each segment rule and asks for clarification if any rule is ambiguous.
2. **Given** two segment rules overlap (the same order could match both), **When** the agent detects the overlap, **Then** it surfaces the conflict and blocks segment approval until the overlap is resolved.
3. **Given** the merchant approves segment definitions, **When** they configure a strategy for each segment, **Then** each segment has its own independent cost weight configuration and constraint rules (if MMR 011 is active).
4. **Given** each segment has a configured strategy, **When** simulation runs, **Then** each segment is simulated independently on historical orders matching its rule, and a KPI report is returned per segment.
5. **Given** all segment simulations are valid (deviation = 0 per segment), **When** the merchant initiates publication, **Then** the full multi-segment configuration goes live simultaneously across all segments.
6. **Given** any segment's simulation shows delivery time deviation ≠ 0, **When** the merchant attempts to publish, **Then** publication is blocked for the entire configuration until all segments have valid simulation results.
7. **Given** the configuration is live, **When** an order is placed, **Then** it is routed to the matching segment's strategy; if no segment rule matches, it is routed to the default segment.

### User Story 2 — Merchant adds a new segment to an existing multi-segment configuration (Priority: P2)

After running express and standard segments for a month, an Omnichannel Manager at C&A wants to add a third segment for high-value orders (over R$2,000) with a dedicated Seller Group Prioritization strategy.

**Acceptance Scenarios:**

1. **Given** an existing multi-segment configuration is live, **When** the merchant adds a new segment, **Then** the system requires simulation of all segments (including existing ones) before re-publishing the updated configuration.
2. **Given** the new segment's rule overlaps with an existing segment, **When** the agent detects the conflict, **Then** it flags the overlap and blocks approval until resolved.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow merchants to define up to 5 segments (including the mandatory default segment) using natural language input.
- **FR-002**: The system MUST detect and surface overlapping segment rules, blocking approval until all segments are mutually exclusive.
- **FR-003**: The system MUST maintain a mandatory default segment ("all other orders") that applies to any order matching no explicit segment rule; this segment must always have an active strategy.
- **FR-004**: The system MUST allow independent strategy configuration (cost weights, constraint rules if MMR 011 is active) per segment.
- **FR-005**: The system MUST simulate each segment independently on historical orders matching its rule and return a KPI report per segment.
- **FR-006**: The system MUST block publication if any segment has delivery time deviation ≠ 0 in its simulation results.
- **FR-007**: The system MUST publish all segments simultaneously; partial activation is not permitted.
- **FR-008**: The system MUST route each live order to the correct segment's strategy at allocation time; unmatched orders are routed to the default segment.
- **FR-009**: The system MUST require re-simulation of all segments when any segment is added, modified, or removed — before re-publishing.
- **FR-010**: The system SHOULD surface per-segment KPI breakdowns in the monitoring dashboard (MMR 002) when multi-segment configuration is active.

---

## Assumptions

- The allocation routing layer supports per-order segment classification at runtime based on order attributes (delivery option, order value, product category).
- Segment rule evaluation is deterministic: for any given order, exactly one segment matches.
- Historical order data is tagged with the attributes required for segment rule matching (delivery option selected, order value, product category) so that per-segment simulation is possible.
- The 5-segment limit is a GA constraint based on system performance and UX complexity; it may be raised in future releases.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can define at least two non-overlapping segments, configure independent strategies, simulate, and publish without VTEX support intervention.
- **SC-002**: 100% of live orders are correctly routed to their matching segment's strategy — 0 orders incorrectly routed to the wrong segment or left unallocated.
- **SC-003**: 0 multi-segment configurations published with any segment having delivery time deviation ≠ 0.
- **SC-004**: Merchants using multi-segment strategies show measurable KPI differentiation between segments — evidence that different strategies are producing different outcomes per segment.
- **SC-005**: At least 2 GA merchants adopt multi-segment configuration within 60 days of the MMR launching.
