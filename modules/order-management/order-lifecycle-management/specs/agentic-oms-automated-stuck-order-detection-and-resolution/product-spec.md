# Product Spec — Agentic OMS: Order Troubleshooting AI



## Clarifications



- **Q: Why are the first five layers (Detection through Diagnosis) fully deterministic, with AI only at the Presentation and Resolution layers?** → Determinism is the foundation of trust and auditability. Detection, validation, enrichment, and diagnosis must produce the same output for the same input every time — this guarantees that false positives are caught consistently, thresholds are enforced predictably, and the diagnostic audit trail is human-readable without LLM variability. AI is introduced only where natural language generation (explanation) and multi-step reasoning under uncertainty (resolution) genuinely require it. *(Source: POC Architecture — Layer design rationale)*

- **Q: Why does the Resolution Agent require operator approval before executing any write operation?** → Write tools carry blast radius: `change_workflow_state` can advance an order irreversibly; `restore_workflow` can create duplicate workflow instances if called twice without dry-run. The human-in-the-loop gate ensures that the operator has reviewed the AI-generated diagnosis and accepts the proposed resolution path before any destructive or state-mutating action is taken. This is a core design principle of the Agentic OMS vision: "trust-first, incremental autonomy." *(Source: POC Layer 6 — Approval Layer; Agentic OMS Vision — Design Principles)*

- **Q: Why does `restore_workflow` require a dry-run before execution?** → `restore_workflow` is the highest-risk tool in the catalog (MEDIUM-HIGH). A duplicate workflow instance created for an already-running order causes inconsistent state that is very difficult to recover. The dry-run call validates preconditions (workflow truly missing, order in eligible state) before committing the write. If the dry-run returns an error, the agent escalates rather than proceeding. *(Source: POC Layer 7 — Resolution Layer, restore_workflow tool spec)*

- **Q: Why are tools risk-tiered (LOW / MEDIUM / MEDIUM-HIGH) rather than uniformly treated?** → The ReAct loop always prefers the lowest-risk action first and only escalates to higher-risk tools if the lower-risk action fails to resolve the anomaly. This minimizes the surface area of autonomous mutations in production orders. The tiering also provides a clear escalation signal: if the agent exhausts LOW and MEDIUM tools without success, escalation to a human engineer is the safe default rather than attempting a higher-risk action autonomously. *(Source: POC Layer 7 — Resolution flows by diagnosis)*

- **Q: Why DynamoDB instead of a relational store for the anomaly audit log?** → The anomaly table requires: (1) automatic TTL expiry (90 days, serverless, zero maintenance), (2) flexible GSI query patterns (by status, by orderId) without schema migrations, (3) native integration with AWS Lambda and SQS in the serverless detection worker, and (4) write throughput without connection pooling overhead. A relational store would add operational burden for a use case where the query access patterns are well-defined and document-shaped. *(Source: POC Data Model — DynamoDB table design)*

- **Q: What are the status-specific time thresholds that trigger a WORKFLOW_STUCK_TEMPORARY_PROLONGED classification?** → payment-pending: 24 hours; payment-approved: 12 hours; ready-for-handling: 24 hours; handling: 48 hours; invoice: 6 hours; start-handling: 4 hours; authorize-fulfillment: 4 hours. Orders that exceed these thresholds with `WorkflowInRetry=true` are confirmed as stuck-temporary-prolonged and proceed through the full diagnostic pipeline. *(Source: POC Layer 2 — Validation Layer, state-specific threshold table)*

- **Q: What is the maximum number of resolution attempts before escalation?** → 5 attempts. After 5 THINK → ACT → OBSERVE cycles without a confirmed resolution (verified by `get_order_details` post-action), the agent writes `status=escalated` to DynamoDB, logs all actions attempted and their outcomes, and notifies the operator. Escalation is always a terminal state for a given anomaly instance; operators must manually re-trigger if they want a new resolution attempt. *(Source: POC Layer 7 — Resolution Layer, agent flow)*

- **Q: Does the system support batch resolution of multiple anomalies simultaneously?** → Not in MVP. Each anomaly is enqueued individually in SQS after operator approval and resolved sequentially by the agent. Batch resolution introduces risk of concurrent mutations to the same order (e.g., two anomalies for the same orderId resolved in parallel). Distributed locking at the orderId level is a post-MVP concern. *(Source: POC Architecture — SQS Action Queue)*

- **Q: What is the deduplication strategy for anomalies detected across multiple detection cycles?** → DynamoDB's composite key (`ACCOUNT#{accountName}` / `ANOMALY#{anomalyId}`) combined with a derived `anomalyId` (hash of accountName + orderId + anomalyType) ensures that the same anomaly for the same order is not duplicated across detection runs. If an anomaly already exists in `pending` or `diagnosed` state, the detection worker skips insertion and updates the `detected_at` timestamp only. *(Source: POC Data Model — Anomaly deduplication)*



---



## User Scenarios & Testing *(mandatory)*



### User Story 1 — Automated detection and classification of stuck orders (Priority: P1)



A detection worker runs on a scheduled interval (AWS Lambda + EventBridge Scheduler), queries the Orders API for orders with `WorkflowInErrorState=true` or `WorkflowInRetry=true` beyond status-specific thresholds, validates confirmed anomalies against the Workflow API to eliminate false positives, enriches them with interaction logs and analyzer data, and classifies each into a root-cause category via the rule engine. The result is persisted to DynamoDB and presented to the operator.



**Acceptance Scenarios:**



1. **Given** an order with `WorkflowInErrorState=true` AND `WorkflowInRetry=false`, **When** the detection worker runs, **Then** the order is classified as `WORKFLOW_STUCK_PERMANENT`, enriched with interaction logs and analyzer output, and a new anomaly record with `status=diagnosed` is written to DynamoDB with the root-cause category and priority.

2. **Given** an order with `WorkflowInRetry=true` and `LastChange` more than 48 hours ago in `handling` status, **When** the detection worker runs, **Then** the order is classified as `WORKFLOW_STUCK_TEMPORARY_PROLONGED` and an anomaly record is created with `status=diagnosed`.

3. **Given** an order in `handling` status with `WorkflowInRetry=true` and `LastChange` only 2 hours ago (below the 48-hour threshold), **When** the detection worker runs, **Then** the order is classified as a FALSE POSITIVE and no anomaly record is created.

4. **Given** an anomaly record for a given orderId and anomalyType already exists in DynamoDB with `status=pending`, **When** the detection worker runs again and encounters the same order, **Then** the existing record is updated (timestamp refreshed) and no duplicate record is created.

5. **Given** a chain order where the MKP status is `invoiced` and the FFM status is `handling`, **When** the detection worker runs the divergence detection method, **Then** the divergence is classified as `STATUS_DIVERGENCE_FFM_MKP` with `CRITICAL` priority and an anomaly record is persisted.

6. **Given** a chain order where both FFM and MKP are in error states but with different substates, **When** the detection worker runs, **Then** the divergence is classified as `STATUS_DIVERGENCE_FFM_MKP` with `MODERATE` priority.



---



### User Story 2 — AI-generated explanation and operator approval interface (Priority: P1)



An OMS Operator opens the Troubleshooting console and sees a list of anomalies diagnosed in the current cycle. Each anomaly card shows the AI-generated explanation (2-to-3 sentences in plain language), root-cause category, priority, and action buttons: Resolve with AI, Ignore, Escalate.



**Acceptance Scenarios:**



1. **Given** an anomaly record with `status=diagnosed` and a valid diagnosis, **When** the Presentation layer generates the AI explanation, **Then** the explanation is 2-to-3 sentences, written for a SAC operator audience (no internal API jargon), includes the duration the order has been stuck, the last error type, and the number of failed retries.

2. **Given** an anomaly card with category `INTEGRAÇÃO ERP` and priority `Alta`, **When** the operator views it in the console, **Then** the card clearly shows the category label, priority badge, the AI explanation, and the three action buttons (Resolve with AI / Ignore / Escalate).

3. **Given** an operator clicks "Ignore" on an anomaly card, **Then** the DynamoDB record is updated to `status=ignored`, the anomaly disappears from the active queue, and no resolution action is triggered.

4. **Given** an operator clicks "Escalate manually" on an anomaly card, **Then** the DynamoDB record is updated to `status=escalated`, the anomaly is routed to the engineering escalation queue, and the operator sees a confirmation.

5. **Given** an operator clicks "Resolve with AI" on an anomaly card, **Then** the anomaly is enqueued in the SQS Action Queue, the DynamoDB record transitions to `status=action_pending`, and the operator sees a "Resolution in progress" state on the card.

6. **Given** the AI explanation generation call to `vtexaillmgateway` fails or times out, **Then** the anomaly is still surfaced to the operator with the rule-engine diagnosis (category, priority, raw error data), and a fallback message indicates the AI explanation is unavailable — the operator can still choose to approve or escalate.



---



### User Story 3 — Autonomous AI resolution of a stuck workflow (Priority: P1)



After operator approval, the Resolution Agent receives the anomaly context (diagnosis, order data, history), plans a strategy based on the anomaly type, and executes a THINK → ACT → OBSERVE loop using the risk-tiered tool catalog. It verifies resolution after each action, tries an alternative strategy if needed, and escalates if 5 attempts are exhausted.



**Acceptance Scenarios:**



1. **Given** a `WORKFLOW_STUCK_PERMANENT` anomaly approved for AI resolution, **When** the agent begins, **Then** it first calls `get_workflow_state` (read-only), then `force_retry_workflow` (LOW risk), then `get_order_details` to verify; if the workflow is confirmed resolved, `status=resolved` is written to DynamoDB and the operator is notified.

2. **Given** the same anomaly where `force_retry_workflow` does not resolve the issue after one cycle, **When** the agent continues, **Then** it attempts `change_workflow_state` (MEDIUM risk) as the next tool, re-verifies with `get_order_details`, and escalates if still unresolved.

3. **Given** a `WORKFLOW_INSTANCE_MISSING` anomaly approved for AI resolution, **When** the agent begins, **Then** it calls `restore_workflow` with `dry_run=true` first; if the dry-run succeeds, it calls `restore_workflow` with `dry_run=false`; if the dry-run returns an error, it writes `status=escalated` without attempting the live call.

4. **Given** a resolved anomaly, **When** the agent confirms resolution via `get_order_details`, **Then** the DynamoDB record is updated to `status=resolved`, the `resolved_by` field is set to `agent`, `resolved_at` is recorded, and the `resolution_action` field contains the sequence of tools executed.

5. **Given** an anomaly where the agent has exhausted 5 THINK → ACT → OBSERVE cycles without confirming resolution, **Then** `status=escalated` is written, the full action log (each tool called, its arguments, and the observation result) is persisted, and the operator receives an escalation notification with the action log attached.

6. **Given** two concurrent resolution requests for the same orderId (e.g., operator double-clicks), **Then** the second enqueue is deduplicated at the SQS level (message deduplication ID derived from orderId + anomalyId) and only one resolution loop executes.

7. **Given** the agent calls any write tool (e.g., `force_retry_workflow`), **When** the external API call fails with a network error, **Then** the agent retries with exponential backoff up to 3 times before treating the action as failed and moving to the OBSERVE step with a failure outcome — ensuring no partial writes are silently ignored.



---



### User Story 4 — FFM/MKP divergence detection and resolution (Priority: P2)



For chain orders (self-marketplace), the detection worker identifies status mismatches between the FFM and MKP sides of the same order. After diagnosis and operator approval, the agent resolves via reindex or consistency fix, escalating if the divergence persists.



**Acceptance Scenarios:**



1. **Given** a chain order where MKP `status=invoiced` and FFM `status=handling`, **When** the agent is approved to resolve, **Then** it first calls `reindex_order` (LOW risk) and re-checks both statuses via `get_order_details`; if the divergence is resolved, `status=resolved` is written.

2. **Given** the same divergence where `reindex_order` does not resolve the mismatch, **When** the agent continues, **Then** it calls `fix_workflow_consistency` (MEDIUM risk), re-verifies, and if still divergent calls `change_workflow_state` on the lagging side; escalates if unresolved after all steps.

3. **Given** a chain order where MKP `status=canceled` and FFM is not canceled, **When** the anomaly is classified, **Then** it receives `CRITICAL` priority and `STATUS_DIVERGENCE_FFM_MKP` type, and the diagnosis notes that manual review is required before AI resolution due to the cancellation state conflict.

4. **Given** a chain order where `LastChange` timestamps on FFM and MKP differ by more than 24 hours but statuses are the same, **When** detected, **Then** it is classified as `POSSIBLE_DIVERGENCE` with `MODERATE` priority and flagged for operator review — the agent does not auto-resolve possible divergences without operator approval.

5. **Given** a divergence anomaly where the resolution agent successfully re-syncs the FFM and MKP statuses, **Then** both sides of the chain order reflect the same status within the same order timeline event, and the audit log records which side was updated and by which tool.



---



## Requirements *(mandatory)*



- **FR-001**: The system MUST detect orders with `WorkflowInErrorState=true` AND `WorkflowInRetry=false` (permanent stuck) within each scheduled detection cycle.

- **FR-002**: The system MUST detect orders with `WorkflowInRetry=true` that have exceeded the status-specific time threshold without progress (temporary stuck, prolonged).

- **FR-003**: The system MUST detect FFM/MKP status divergences for chain orders using Solr field comparison on `Status`, `WorkflowInErrorState`, `WorkflowInRetry`, and `LastChange` fields.

- **FR-004**: The system MUST validate each candidate anomaly against the Workflow API before creating a record, eliminating false positives via the defined validation rules.

- **FR-005**: The system MUST enrich each confirmed anomaly with: last error type and message, retry history, automatic analyzer statuses (`is-stopped-in-switch-or-action`, `workflow-consistency-check`), and full order data.

- **FR-006**: The system MUST classify each anomaly into a root-cause category (ERP integration, payment, timeout, communication, divergence, workflow missing, unknown) and a priority level (Crítica, Alta, Média) using a declarative rule engine with externally configurable rules (JSON or YAML).

- **FR-007**: The system MUST generate a 2-to-3-sentence plain-language explanation per anomaly via `vtexaillmgateway`, using the anomaly type, current state, last error, time stuck, retry count, and seller name as context.

- **FR-008**: The system MUST present each anomaly to the operator with: AI explanation, category label, priority badge, and three action options (Resolve with AI / Ignore / Escalate manually).

- **FR-009**: The system MUST NOT execute any write tool on any order without explicit operator approval for that anomaly instance.

- **FR-010**: The Resolution Agent MUST always call a read-only verification tool (`get_order_details`) after each write tool execution to confirm the anomaly is resolved before proceeding.

- **FR-011**: The Resolution Agent MUST call `restore_workflow` with `dry_run=true` before any live `restore_workflow` call; if the dry-run fails, the agent MUST escalate rather than proceed.

- **FR-012**: The Resolution Agent MUST escalate after 5 failed THINK → ACT → OBSERVE cycles and MUST NOT attempt further write operations on the same anomaly instance after escalation.

- **FR-013**: All resolution actions (tool name, arguments, response, timestamp) MUST be persisted to the DynamoDB anomaly record as an ordered action log.

- **FR-014**: All external write tool calls MUST be idempotent; the system MUST use idempotency keys to prevent double execution on retry.

- **FR-015**: Anomaly records MUST auto-expire after 90 days via DynamoDB TTL.

- **FR-016**: The system MUST support querying anomalies by status (pending, diagnosed, action_pending, resolved, escalated) and by orderId via DynamoDB GSIs.



---



## Success Criteria



- **SC-001**: ≥60% of detected anomalies that enter the Resolution Agent loop are resolved without escalation to a human engineer within the first production pilot quarter.

- **SC-002**: Average time-to-resolution (TTR) for autonomously resolved anomalies is ≤15 minutes from operator approval to confirmed resolution — compared to a baseline of hours-to-days for manual engineering triage.

- **SC-003**: Zero double-captures or duplicate workflow restores occur in production across any resolution cycle (idempotency guarantee).

- **SC-004**: 100% of anomaly records contain a complete action log (tools called, arguments, observations, final status) at the time of resolution or escalation.

- **SC-005**: False positive rate (anomalies reaching the operator queue that are subsequently dismissed as non-issues) is ≤10% after the first four weeks of production operation.

- **SC-006**: The dry-run gate for `restore_workflow` blocks execution in 100% of cases where the dry-run returns a precondition error — zero live restore calls proceed after a failed dry-run.

- **SC-007**: All 4 user stories pass end-to-end in the integration test suite against the SOS test environment before closed-beta launch, covering the happy path and the escalation path for each anomaly type (WORKFLOW_STUCK_PERMANENT, WORKFLOW_STUCK_TEMPORARY, STATUS_DIVERGENCE_FFM_MKP, WORKFLOW_INSTANCE_MISSING).
