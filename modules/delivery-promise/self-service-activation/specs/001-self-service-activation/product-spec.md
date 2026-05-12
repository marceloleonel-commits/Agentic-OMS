# Product Spec — Delivery Promise Self-Service Activation

## Clarifications

- Q: What are the prerequisites for self-service activation? → A: Intelligent Search must be active for the account. The merchant's storefront must be compatible (FastStore, VTEX IO, or headless via API). Delivery Options must be configured if the merchant wants to use filters and tags (not required for basic location-based navigation).
- Q: What does the system integrate during activation? → A: Catalog integration (so availability data flows into Delivery Promise), Delivery Promise indexing start, Intelligent Search flag to use Delivery Promise as the availability source, and storefront flags for native components (if applicable).
- Q: How long does initial indexing take? → A: Depends on catalog size. The merchant sees indexing progress in the Admin. For large catalogs (1M+ SKUs), indexing may take hours — the merchant is notified when Delivery Promise is fully live.
- Q: Can the merchant activate Delivery Promise if they are still using Regionalization? → A: Yes — Delivery Promise and Regionalization can coexist during migration. The merchant activates Delivery Promise and can progressively shift traffic before deprecating Regionalization. Full migration guidance is a separate initiative.
- Q: What happens if a prerequisite is not met at activation time? → A: The system surfaces the blocking condition with clear instructions for resolution. The merchant cannot proceed until prerequisites are met.
- Q: Can the merchant deactivate Delivery Promise? → A: Yes, from the same Admin interface. Deactivation stops indexing and reverts the Intelligent Search flag to the previous availability source.
- Q: Does activation require any storefront code changes? → A: Activation turns on the Delivery Promise data layer. Storefront components (filters, tags, badges) are separate — they need to be installed or implemented by the merchant or their agency. Activation alone makes the API available; the storefront experience requires additional implementation.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Merchant activates Delivery Promise without VTEX support (Priority: P1)

An e-commerce manager at a Tier 2 fashion retailer opens VTEX Admin and navigates to the Delivery Promise activation page. The readiness check confirms: Intelligent Search is active, catalog is configured, no blockers. They confirm settings and click Activate. Delivery Promise begins indexing. After 2 hours, they receive a notification that indexing is complete and Delivery Promise is live for their account.

**Why this priority:** This is the entire value proposition of the feature — replacing a manual, bottlenecked process with a self-serve flow that scales.

**Independent Test:** On a test account with Intelligent Search active and no blocking conditions, navigate to the Delivery Promise activation page. Confirm: readiness check passes, activation completes without opening a ticket, indexing progress is visible, and Delivery Promise is live within the expected time window.

**Acceptance Scenarios:**

1. **Given** a merchant navigates to the Delivery Promise activation page in VTEX Admin, **When** prerequisites are met, **Then** the readiness check passes and the merchant can proceed to activate.
2. **Given** a prerequisite is not met (e.g., Intelligent Search not active), **When** the readiness check runs, **Then** the blocking condition is surfaced with clear resolution instructions and the merchant cannot proceed until resolved.
3. **Given** the merchant confirms settings and triggers activation, **When** the system processes the request, **Then** all required integrations (Catalog, IS, flags) are set automatically — no manual VTEX intervention required.
4. **Given** activation is triggered, **When** indexing begins, **Then** the merchant can monitor indexing progress from the Admin.
5. **Given** indexing completes, **When** Delivery Promise is fully live, **Then** the merchant receives a notification and the Admin shows an "Active" status.

### User Story 2 — Merchant deactivates Delivery Promise from Admin (Priority: P2)

A merchant decides to pause Delivery Promise while updating their logistics configuration. They navigate to the Admin, click Deactivate, and confirm. Delivery Promise stops indexing and Intelligent Search reverts to the previous availability source.

**Acceptance Scenarios:**

1. **Given** Delivery Promise is active, **When** the merchant triggers deactivation from Admin, **Then** indexing stops and Intelligent Search reverts to the previous availability source.
2. **Given** deactivation is confirmed, **When** the merchant views the Admin status, **Then** it shows "Inactive" and a prompt to re-activate.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a self-service activation flow in VTEX Admin for Delivery Promise.
- **FR-002**: The activation flow MUST perform a readiness check before proceeding, verifying: Intelligent Search is active, storefront is compatible.
- **FR-003**: The system MUST surface any blocking prerequisites clearly with instructions for resolution, preventing activation until resolved.
- **FR-004**: Upon activation confirmation, the system MUST automatically integrate: Catalog data flow, Delivery Promise indexing, Intelligent Search flag, and storefront flags — without manual VTEX intervention.
- **FR-005**: The merchant MUST be able to monitor indexing progress from the VTEX Admin after activation.
- **FR-006**: The system MUST notify the merchant when initial indexing is complete and Delivery Promise is fully live.
- **FR-007**: The merchant MUST be able to deactivate Delivery Promise from the same Admin interface, reverting Intelligent Search to the previous availability source.
- **FR-008**: Activation MUST complete without requiring a VTEX support ticket or manual engineering intervention.

---

## Assumptions

- Intelligent Search is available and active on the merchant's account as a prerequisite.
- The VTEX Admin infrastructure supports the activation flow and status monitoring UI.
- Initial catalog size determines indexing duration; SLAs are defined per catalog size tier.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Time from merchant activation trigger to Delivery Promise fully live: under 30 minutes for catalogs under 100K SKUs; under 4 hours for catalogs up to 1M SKUs.
- **SC-002**: % of new Delivery Promise activations in Open Beta that are self-served vs. CS-assisted: target ≥ 80% self-served.
- **SC-003**: Support tickets related to activation: near 0 for accounts using the self-serve flow.
- **SC-004**: At least 20 merchants activate Delivery Promise via self-serve by end of Q2 2026 (Open Beta target).
