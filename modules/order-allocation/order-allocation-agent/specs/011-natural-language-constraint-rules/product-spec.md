# Product Spec — Natural Language Constraint Rules

## Clarifications

- Q: Can constraint rules conflict with cost optimization — e.g., a constraint that always routes to a high-cost seller? → A: Yes. Hard constraints override cost optimization. The simulation must show the cost impact of applying constraints, and the merchant must review this impact before approving.
- Q: How does the agent distinguish a cost weight instruction from a constraint rule in natural language? → A: The agent classifies based on phrasing: categorical language ("never," "always," "only if") → constraint rule; comparative or dimensional language ("minimize," "prioritize," "reduce") → cost weight. Ambiguous cases trigger a clarification question.
- Q: Can a constraint rule reference a specific named seller or seller group? → A: Yes. Named sellers and seller groups configured in VTEX are valid constraint targets.
- Q: What happens if a hard constraint makes a significant percentage of orders ineligible for any seller? → A: The system warns the merchant before simulation with an estimated ineligibility rate. It does not block the merchant from proceeding, but the warning must be acknowledged.
- Q: Are constraint rules versioned alongside cost weights? → A: Yes. Any published strategy that includes constraint rules stores them as part of the strategy version (MMR 005).
- Q: Can the merchant define a constraint rule that applies only to a specific segment (MMR 008)? → A: Yes, if MMR 008 is active. Each segment has its own independent constraint rule set.
- Q: Is there a limit on the number of constraint rules per strategy? → A: Maximum 10 constraint rules per strategy in GA.
- Q: Can the merchant configure quantity split behavior through the agent? → A: Yes. Quantity split settings (enable/disable, maximum sellers per SKU, minimum quantity per split leg, single-seller preference) are expressed as constraint rules in natural language and interpreted by the agent as solver capability settings. They are stored alongside constraint rules as part of the strategy version. Quantity split requires the Cost Minimization Solver MMR 004 to be active.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant defines a hard constraint that enforces a franchise policy (Priority: P1)

An Omnichannel Manager at C&A types: "Never allocate orders from customers in São Paulo to sellers outside the São Paulo franchise group." The agent classifies this as a hard constraint, presents a plain-language summary, and asks for clarification on what defines "São Paulo franchise group" — is it a configured seller group in VTEX or a geographic rule? The merchant clarifies, approves the interpretation, and the constraint is included in the simulation alongside the cost weights.

**Why this priority:** This is the core value of the MMR. Without the ability to define, interpret, and apply a constraint rule through the agent, the feature does not exist.

**Independent Test:** Type a constraint in natural language. Confirm: the agent classifies it correctly as a constraint (not a cost weight), the summary accurately reflects the rule, and the simulation applies the constraint — the KPI report shows cost impact relative to unconstrained optimization.

**Acceptance Scenarios:**

1. **Given** the merchant types a constraint rule in natural language, **When** the agent processes it, **Then** it classifies the instruction as a hard or soft constraint and presents a plain-language summary of the rule for review.
2. **Given** the constraint rule is ambiguous (e.g., the seller group referenced is not uniquely identifiable), **When** the agent detects the ambiguity, **Then** it asks a targeted clarification question before proceeding.
3. **Given** the merchant approves a constraint rule, **When** simulation runs, **Then** the KPI report includes a comparison between constrained and unconstrained outcomes, showing the cost impact of applying the constraint.
4. **Given** a hard constraint would make more than 20% of historical orders ineligible for any seller, **When** the agent evaluates the constraint before simulation, **Then** it warns the merchant with the estimated ineligibility rate and requires acknowledgement before proceeding.
5. **Given** a soft constraint is defined, **When** the solver runs, **Then** seller combinations that violate the soft constraint are not eliminated but incur a penalty in the cost function that reduces their ranking.
6. **Given** the merchant approves an interpretation that includes both cost weights and constraint rules, **When** the strategy is published, **Then** both are stored together as the active strategy version.

### User Story 3 — Merchant enables and configures quantity split through the agent (Priority: P2)

An Omnichannel Manager at C&A types: "Allow splitting quantities across sellers for items where no single seller has the full stock. Never create a split leg with fewer than 5 units. Use at most 2 sellers per SKU." The agent interprets this as three quantity split settings, presents them as a solver capability configuration separate from constraint rules, and saves them.

**Why this priority:** Quantity split is opt-in and operationally impactful — merchants need to configure it deliberately. The agent is the primary configuration surface for this capability. Without this user story, merchants have no self-serve way to enable or tune quantity split.

**Independent Test:** Type a quantity split configuration in natural language. Confirm: the agent correctly identifies it as quantity split settings (not a cost weight or a seller constraint), the summary shows enable/disable, max sellers per SKU, and min quantity per leg, and the configuration is saved and applied to subsequent simulations.

**Acceptance Scenarios:**

1. **Given** the merchant describes quantity split settings in natural language, **When** the agent processes it, **Then** it classifies the instructions as quantity split configuration (not a cost weight or a seller constraint rule) and presents a plain-language summary of each setting.
2. **Given** the merchant enables quantity split with a maximum of 2 sellers per SKU, **When** simulation runs, **Then** the KPI report includes availability recovery metrics: the number of line items that became available due to quantity split, and the cost impact compared to the no-split baseline.
3. **Given** the merchant types "never split quantities of the same SKU across sellers," **When** the agent processes it, **Then** it interprets this as disabling quantity split (or as a hard constraint prohibiting it) and presents the setting for review.
4. **Given** quantity split is enabled and the merchant also defines a hard constraint ("never use marketplace sellers"), **When** the solver evaluates a quantity split combination, **Then** the hard constraint applies to each split leg — marketplace sellers are excluded from all legs of any split.

---

### User Story 2 — Merchant combines a cost goal with multiple constraint rules (Priority: P2)

An Omnichannel Manager at OBI types: "Minimize shipping and handling cost. Never use marketplace sellers for orders over R$1,000. Prefer DCs over stores when order weight exceeds 15kg."

The agent interprets this as: a cost minimization goal (cost weights), one hard constraint (no marketplace sellers for high-value orders), and one soft constraint (DC preference for heavy orders). Each element is shown separately in the interpretation summary.

**Acceptance Scenarios:**

1. **Given** the merchant's input contains both cost goal language and constraint language, **When** the agent interprets it, **Then** cost weights and constraint rules are shown separately in the interpretation summary — not merged into a single block.
2. **Given** two constraint rules conflict with each other (e.g., "always use Store X" and "never use stores for orders over 5kg"), **When** the agent detects the conflict, **Then** it surfaces the conflict as an unresolved ambiguity before the merchant can approve the interpretation.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept constraint rule descriptions in the same natural language input field as cost goal descriptions; the agent MUST classify each instruction as either a cost weight or a constraint rule.
- **FR-002**: The system MUST classify constraints into two types: hard constraints (absolute — violations make a seller combination ineligible) and soft constraints (preference — violations incur a cost penalty).
- **FR-003**: The system MUST present constraint rules separately from cost weights in the interpretation summary, with a plain-language description of each rule and its type (hard or soft).
- **FR-004**: The system MUST ask a targeted clarification question when a constraint rule references an entity that is ambiguous or not uniquely identifiable in the merchant's VTEX configuration.
- **FR-005**: The system MUST surface a warning when a hard constraint would make more than 20% of historical orders ineligible; the warning must be acknowledged before simulation proceeds.
- **FR-006**: The system MUST include constrained and unconstrained KPI comparison in the simulation report — showing the cost impact of applying constraint rules relative to pure cost optimization.
- **FR-007**: The system MUST detect conflicts between constraint rules and surface them as unresolved ambiguities in the interpretation summary.
- **FR-008**: The system MUST store constraint rules as part of the strategy version alongside cost weights (requires MMR 005).
- **FR-009**: The system MUST limit constraint rules to a maximum of 10 per strategy in GA.
- **FR-010**: The system SHOULD allow constraint rules to be scoped to a specific segment when MMR 008 is active.
- **FR-011**: The system MUST accept quantity split settings described in natural language and interpret them as solver capability configuration: enable/disable, maximum sellers per SKU (integer), minimum quantity per split leg (integer), and single-seller preference (boolean). These MUST be presented separately from seller constraint rules in the interpretation summary.
- **FR-012**: The system MUST include availability recovery metrics in the simulation report when quantity split is enabled: number of line items that became fulfillable due to split, and cost comparison vs. no-split baseline.
- **FR-013**: The system MUST apply hard and soft constraint rules to each individual leg of a quantity split — a constraint that excludes a seller type applies to all split legs, not just the order as a whole.

---

## Assumptions

- Seller groups, named sellers, product categories, and geographic regions referenced in constraint rules are configured in the merchant's VTEX account and queryable by the agent at interpretation time.
- The solver layer supports both hard constraints (eligibility filtering) and soft constraints (cost penalty injection) as first-class inputs — the agent translates natural language constraints into the appropriate solver instruction format.
- Constraint rule application is reflected in explainability data (MMR 009): if active, the explainability panel shows which constraint rules affected each order's allocation.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can define at least one constraint rule in natural language, have it correctly interpreted and simulated, and publish a strategy that enforces it — without VTEX support.
- **SC-002**: Constraint rules are correctly enforced in live allocation: 0 orders violate a published hard constraint rule.
- **SC-003**: Simulation reports for strategies with constraint rules include a constrained vs. unconstrained cost comparison for 100% of runs.
- **SC-004**: The agent correctly classifies constraint language vs. cost weight language with at least 90% accuracy on a set of representative merchant inputs used in GA validation testing.
- **SC-005**: 0 strategies published with conflicting constraint rules that were not flagged during the interpretation step.
- **SC-006**: Merchants who enable quantity split through the agent see availability recovery reflected in simulation reports before going live — 0 merchants discover quantity split behavior for the first time in production.
