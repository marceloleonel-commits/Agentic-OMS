# Product Spec — Predefined Strategy Presets

## Clarifications

- Q: Can the merchant modify the weight configuration of a preset before approving the interpretation? → A: Yes. Presets populate the interpretation summary with default weights; the merchant can adjust them before approving, just as they would with a free-form strategy.
- Q: Can a preset be selected as a starting point and then further refined via natural language? → A: Yes. After selecting a preset, the merchant can provide additional instructions in the same input field to override or extend the preset configuration.
- Q: Are preset weight values visible to the merchant or abstracted behind plain-language labels? → A: Both. The preset shows a plain-language description; the underlying weight breakdown is shown in the interpretation summary the same way as free-form results.
- Q: Can the merchant publish a preset without running a simulation? → A: No. The simulation gate from MMR 001 applies regardless of whether the strategy originated from a preset or free-form input.
- Q: Will presets be the same across all merchants, or can VTEX customize them per account? → A: Same across all accounts in Open Beta. Per-account customization is deferred.
- Q: What happens to an existing active strategy when the merchant starts a new configuration from a preset? → A: The active strategy remains live until the new strategy is explicitly published. No change occurs until the merchant completes the full flow and confirms publication.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Configure a strategy by selecting a preset (Priority: P1)

An Omnichannel Manager opens the Order Allocation Agent to configure a new strategy. Instead of typing a free-form goal, they browse the preset library and select "Cost Minimization." The agent displays the preset's weight configuration in the interpretation summary. The merchant reviews it, makes a small adjustment to one dimension, approves the interpretation, reviews a simulation report, and publishes the strategy.

**Why this priority:** This is the core value of the presets MMR. Without the ability to select, review, and flow through the full configuration path starting from a preset, no other preset capability has a surface to exist on.

**Independent Test:** Open the Order Allocation Agent, select the Cost Minimization preset, confirm the interpretation summary is pre-populated with the preset's weights, adjust one dimension, simulate, and publish. Confirm: the published strategy reflects the adjusted preset weights, not the original. No VTEX support required.

**Acceptance Scenarios:**

1. **Given** the merchant opens the configuration step, **When** the preset library is displayed, **Then** at least three presets are shown — Cost Minimization, Speed Optimization, and Balanced — each with a plain-language description of its optimization focus.
2. **Given** the merchant selects a preset, **When** the interpretation summary is displayed, **Then** it shows the preset's cost dimension weights in the same format as a free-form interpretation result.
3. **Given** the interpretation summary is pre-populated from a preset, **When** the merchant adjusts one or more dimension weights, **Then** the summary reflects the adjusted values before the merchant approves.
4. **Given** the merchant selects a preset, **When** they choose to switch to free-form input instead, **Then** the preset selection is cleared and the free-form input field is activated without data loss on any already-entered text.
5. **Given** the merchant approves a preset-based interpretation (with or without adjustments), **When** simulation runs, **Then** the simulation uses the approved weight configuration — not the unmodified preset defaults.
6. **Given** simulation results are valid, **When** the merchant publishes, **Then** the same confirmation and timestamp flow from MMR 001 applies.

### User Story 2 — Refine a preset with a natural language instruction (Priority: P2)

After selecting the Cost Minimization preset, an Omnichannel Manager types an additional instruction: "but never split orders across more than two sellers." The agent updates the interpretation summary to reflect both the preset's cost weights and the split constraint.

**Why this priority:** This extends the value of presets for merchants who have one specific adjustment in mind. It depends on User Story 1 and delivers no value if the preset cannot first be selected and reviewed.

**Independent Test:** Select a preset, add a natural language refinement in the input field, confirm the interpretation summary includes both the preset weights and the additional constraint. Value is conditional on User Story 1 existing.

**Acceptance Scenarios:**

1. **Given** the merchant has selected a preset, **When** they add a natural language instruction in the input field, **Then** the agent updates the interpretation summary to incorporate both the preset weights and the additional constraint.
2. **Given** the combined interpretation contains a conflict between the preset and the additional instruction, **When** the agent detects it, **Then** it surfaces the conflict as an ambiguity in the interpretation summary for the merchant to resolve.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present a preset library as an alternative entry point to the free-form input field on the configuration step.
- **FR-002**: The system MUST include at minimum three presets at launch: Cost Minimization, Speed Optimization, and Balanced. Each preset MUST have a plain-language description of its optimization focus.
- **FR-003**: The system MUST pre-populate the interpretation summary with the selected preset's cost dimension weights when the merchant chooses a preset.
- **FR-004**: The system MUST allow the merchant to adjust any dimension weight in the pre-populated interpretation summary before approving.
- **FR-005**: The system MUST allow the merchant to add a natural language instruction after selecting a preset; the agent MUST incorporate both the preset weights and the instruction in the updated interpretation summary.
- **FR-006**: The system MUST allow the merchant to switch from preset-based to free-form input at any point during the configuration step, without losing any text already entered in the free-form field.
- **FR-007**: The system MUST apply the same simulation gate and publication confirmation flow from FR-007 through FR-012 of MMR 001 to strategies originating from presets.
- **FR-008**: The system MUST surface conflicts between a selected preset and additional natural language instructions as ambiguities in the interpretation summary.
- **FR-009**: The system SHOULD display a brief description of each preset's typical use case and which cost dimensions it emphasizes before the merchant selects it.

---

## Assumptions

- The full configure → simulate → publish flow from MMR 001 is operational before this MMR ships.
- Preset weight configurations are defined and validated by the VTEX product team before release; they are not derived dynamically.
- The three initial presets cover the most common merchant optimization goals identified during Closed Beta (MMR 001).
- A merchant's active strategy is not affected by browsing or partially configuring a new strategy from a preset until they explicitly publish the new one.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A merchant can select a preset, review the pre-populated interpretation, make an adjustment, simulate, and publish — without VTEX support intervention.
- **SC-002**: At least 50% of new strategy configurations in Open Beta begin from a preset selection rather than a blank free-form prompt.
- **SC-003**: Merchants who start from a preset complete the configuration-to-publication flow in fewer steps (clarification questions asked) on average than merchants who start from free-form input.
- **SC-004**: 0 strategies published from presets bypass the simulation gate.
- **SC-005**: All three presets (Cost Minimization, Speed Optimization, Balanced) are available and selectable from day one of Open Beta launch.
