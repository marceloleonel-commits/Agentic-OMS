# Product Spec — Merchant-Provided Cost Variables

## Clarifications

- Q: Can a merchant provide cost variables for some sellers and not others? → A: Yes. For sellers without merchant-provided data, the solver uses only VTEX-native costs. No order is left unallocated due to missing cost data.
- Q: Can cost variables be defined at the seller group level rather than per individual seller? → A: Yes. Variables defined at the seller group level apply to all sellers in that group; seller-level variables override group-level ones.
- Q: How are percentage-based costs (commissions) normalized alongside flat monetary costs (handling fees)? → A: Percentage costs are converted to a monetary value at simulation and allocation time using the order's product value. Normalization produces a single total cost in currency per order.
- Q: Can the merchant provide a negative cost variable (e.g., a subsidy for a preferred seller)? → A: Yes. Negative cost variables are valid and reduce the effective cost for that seller in the model.
- Q: What happens if a merchant-provided cost variable changes after a strategy is already live? → A: Updated cost variables take effect on new orders immediately — no republication of the strategy is required. However, merchants are recommended to re-simulate after significant cost changes.
- Q: Is there an audit trail for cost variable changes? → A: Yes. Every change to a merchant-provided cost variable is logged with timestamp and actor.
- Q: Can cost variables be tested in simulation before going live? → A: Yes. Simulation (MMR 001 or MMR 004) always uses the cost variables active at the time of the simulation run.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant provides marketplace commissions and sees allocation decisions change (Priority: P1)

A Logistics Operations Manager at C&A configures marketplace seller commissions (12% of GMV) via the API. Before this change, the solver sometimes allocated orders to marketplace sellers because their shipping cost was lower. After adding commissions to the model, those same sellers rank as more expensive than DCs for high-value orders. The manager runs a new simulation and confirms the allocation shift and the expected cost reduction.

**Why this priority:** This is the core value of the MMR. If merchant-provided cost variables do not change allocation decisions in a verifiable way, the feature has no impact.

**Independent Test:** Configure a commission rate for a marketplace seller. Run a simulation. Confirm: the simulation report shows a VTEX-native costs column and a merchant-provided costs column, the total cost for the marketplace seller reflects the commission, and the allocation changes for orders where the commission makes the marketplace seller more expensive than alternatives.

**Acceptance Scenarios:**

1. **Given** the merchant provides a commission rate for a seller via API or agent interface, **When** the solver runs, **Then** the commission is added to that seller's total cost calculation for each order.
2. **Given** a seller has both a group-level and a seller-level cost variable for the same dimension, **When** the solver runs, **Then** the seller-level variable takes precedence over the group-level one.
3. **Given** a seller has no merchant-provided cost data, **When** the solver evaluates that seller, **Then** it uses only VTEX-native costs — the seller remains eligible and no allocation fails.
4. **Given** the merchant runs a simulation after configuring cost variables, **When** the report is returned, **Then** it includes a cost breakdown per evaluated combination showing VTEX-native costs and merchant-provided costs separately, with the total.
5. **Given** the merchant updates a cost variable value after a strategy is live, **When** the next order is placed, **Then** the updated value is used immediately — no strategy republication is required.
6. **Given** a merchant-provided cost variable is a negative value (subsidy), **When** the solver runs, **Then** the subsidy reduces that seller's effective total cost in the model.

### User Story 2 — Merchant configures cost variables through the agent interface in natural language (Priority: P2)

A Logistics Operations Manager at OBI describes their cost structure to the Order Allocation Agent: "Our franchise stores pay a 3% royalty per order. Our marketplace sellers have a 10% commission on the sale value." The agent interprets these as cost variable configurations, presents them for review, and stores them as active cost variables.

**Acceptance Scenarios:**

1. **Given** the merchant describes cost variables in natural language to the agent, **When** the agent interprets the input, **Then** it identifies each cost variable, its type (percentage or flat fee), and its scope (seller, seller group, or all sellers of a type) and presents a summary for review.
2. **Given** the merchant approves the interpreted cost variables, **When** they are saved, **Then** they are immediately active for new simulations and live orders.
3. **Given** the agent cannot determine the scope of a cost variable (e.g., "franchise stores" could map to multiple seller groups), **When** interpreting the input, **Then** it asks a targeted clarification question before saving.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST accept merchant-provided cost variables per seller or seller group via API batch upload.
- **FR-002**: The system MUST accept the following cost variable types: commission rate (% of order value), flat fee per order, custom handling rate (monetary, overrides warehouse entity default), tax differential (% adjustment to total cost), and SLA breach penalty (flat fee per late order).
- **FR-003**: The system MUST support negative cost variables (subsidies) that reduce a seller's effective cost in the model.
- **FR-004**: The system MUST apply seller-level cost variables with precedence over seller-group-level variables for the same dimension.
- **FR-005**: The system MUST normalize all merchant-provided costs to the same monetary scale as VTEX-native costs before the solver runs; percentage costs MUST be converted to monetary values using the order's product value at evaluation time.
- **FR-006**: The system MUST fall back to VTEX-native costs for any seller without merchant-provided data — no order may be left unallocated due to missing cost variables.
- **FR-007**: The system MUST include a cost breakdown in simulation reports showing VTEX-native costs and merchant-provided costs separately per evaluated seller combination.
- **FR-008**: The system MUST apply updated cost variables to new orders immediately after the update is saved — no strategy republication required.
- **FR-009**: The system MUST log all cost variable changes with timestamp and actor for audit purposes.
- **FR-010**: The system SHOULD accept cost variable descriptions in natural language via the Order Allocation Agent interface, interpreting them into structured cost variable configurations for merchant review before saving.

---

## Assumptions

- Merchants have a list of sellers and seller groups configured in their VTEX account that cost variables can be scoped to.
- The solver's cost function is extensible to include additional cost dimensions beyond VTEX-native shipping and handling — this requires no changes to the solver's optimization algorithm, only to its input model.
- Commission rates and other percentage-based costs are applied to the product value component of the order, which is available at allocation time.
- Merchants are responsible for the accuracy of the cost data they provide; VTEX does not validate whether provided rates match external contracts.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can configure cost variables via API or agent interface and confirm in a simulation that they change allocation decisions — without VTEX support.
- **SC-002**: Simulation reports for merchants with active cost variables show a cost breakdown that distinguishes VTEX-native from merchant-provided costs for 100% of simulation runs.
- **SC-003**: 0 orders left unallocated due to missing merchant-provided cost data for a seller.
- **SC-004**: At least 2 Open Beta merchants configure cost variables and show a measurable improvement in total cost-to-serve relative to the VTEX-native-only baseline after activation.
- **SC-005**: Cost variable updates take effect on the next order allocation after saving, with no observed delay beyond 1 minute.
