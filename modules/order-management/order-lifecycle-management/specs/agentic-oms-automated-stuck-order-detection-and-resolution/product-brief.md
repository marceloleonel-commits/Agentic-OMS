# Product Brief — Agentic OMS: Order Troubleshooting AI

| Field | Value |
|---|---|
| **Module** | Order Management |
| **Pillar** | Agentic Operations / Order Lifecycle Management |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | Heliomar Kann |
| **Status** | Draft |
| **Expected Release** | Pilot 2026-Q3 |
| **Availability** | Closed Beta |
| **Access** | API (MVP) · OMS Admin UI (MLP) |
| **Mode** | B2C & B2B |


## MMR

**Title:** Agentic OMS — Order Troubleshooting AI (Automated Stuck-Order Detection & Resolution)

**Description:** With this release, VTEX OMS gains a native intelligence layer for detecting, diagnosing, and autonomously resolving stuck orders and FFM/MKP status divergences — without requiring engineering escalation. A deterministic 7-layer pipeline continuously scans for workflow anomalies, classifies root causes via a rule engine, generates AI-authored explanations for operators, and — upon operator approval — executes resolution through a ReAct agent loop with a curated tool catalog. Every action is logged to an immutable audit trail, and the operator retains full control through an approve / ignore / escalate interface.

**Availability:** Closed Beta · 2026-Q3 (API + Admin UI pilot with select Tier-1 merchants)

**Target Audience:**
- Tier: Tier-1 enterprise merchants and marketplaces with high order volume and complex multi-seller fulfillment
- Persona: Primary — OMS Operators, SAC Agents; Secondary — Marketplace Admins, Integration Engineers
- Pain: Post-purchase exception handling — particularly stuck orders and status divergences between FFM and MKP — currently requires manual engineering triage. There is no native VTEX tooling for detecting these anomalies, classifying their root causes, or resolving them autonomously. Manual exception handling consumes approximately 19.3% of operational team effort (US$849B industry-wide). Every unresolved exception triggers cascades of manual tasks across logistics, finance, and customer service, increasing operational costs and degrading customer experience.
- Use Case: An OMS Operator opens the Troubleshooting console and sees a list of anomalies detected in the last 24 hours — each with a category (e.g., WORKFLOW_STUCK_PERMANENT, STATUS_DIVERGENCE_FFM_MKP), a priority level, and a 2-to-3-sentence AI-generated explanation in plain language. The operator reviews the context, clicks "Resolve with AI", and the system executes a ReAct loop using a risk-tiered tool catalog. The result — resolved or escalated — is written back to the order timeline and the operator is notified. No engineering ticket required.

---

## Scope

**In scope:**
- Automated detection of stuck orders: `WorkflowInErrorState=true` (permanent) and `WorkflowInRetry=true` beyond status-specific thresholds (temporary)
- Automated detection of FFM/MKP status divergences for chain orders (self-marketplace): critical divergences (MKP invoiced / FFM handling; MKP canceled / FFM not canceled) and moderate divergences (both in error but different states; `LastChange` timestamps >24h apart)
- Deterministic validation layer to eliminate false positives before diagnosis, with state-specific time thresholds (payment-pending: 24h; payment-approved: 12h; ready-for-handling: 24h; handling: 48h; invoice: 6h; start-handling: 4h; authorize-fulfillment: 4h)
- Deterministic enrichment layer: automatic analyzers, workflow interaction logs, full order data
- Rule-based diagnostic engine with declarative rules (JSON/YAML) mapping error patterns to root-cause categories (ERP integration, payment, timeout, communication, divergence, workflow missing, unknown)
- AI explanation generation via `vtexaillmgateway` (GPT-4o-mini or Claude 3 Haiku, temperature 0.3, ≤200 tokens): 2-to-3-sentence plain-language explanation per anomaly for operator consumption
- Human-in-the-loop approval interface: operators can approve AI resolution, ignore, or escalate manually
- Autonomous resolution agent (ReAct loop): THINK → ACT → OBSERVE cycle using a risk-tiered tool catalog; max 5 attempts before escalation
- Tool catalog: `get_order_details` (read-only), `get_workflow_state` (read-only), `force_retry_workflow` (LOW risk), `change_workflow_state` (MEDIUM risk), `restore_workflow` with dry-run gate (MEDIUM-HIGH risk), `fix_workflow_consistency` (MEDIUM risk), `reindex_order` (LOW risk), `retry_change_order` (MEDIUM risk)
- DynamoDB audit log (`oms-agent-anomalies`) with full anomaly lifecycle (detected → diagnosed → action_pending → resolved / escalated), 90-day TTL, GSI by status and by orderId
- Idempotency guarantees on all resolution actions (no double-captures, no duplicate workflow restores)
- Operator notification on resolution success or escalation
- Monitoring: anomaly detection rate, resolution success rate, time-to-resolution (TTR), escalation rate, tool usage breakdown

**Not in scope:** Deep predictive analytics or proactive SLA forecasting (belongs to Logistics/Order Allocation products); inventory optimization; complete financial/accounting ledger (OMS orchestrates actions; PSPs and ERPs remain systems of record); standalone AI chatbot (conversational interfaces via Weni / AI Workspace, covered in a separate initiative); replacement of external enterprise OMS or order brokers; autonomous operation without operator approval gate in MVP.
