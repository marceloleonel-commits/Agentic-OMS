# Workflow Glossary

This glossary defines the core terminology used across the Agentic Workflow product — its configuration model, runtime behavior, AI orchestration, and integrations. Terms are organized thematically.

> **Note on terminology:** Terms here reflect the agreed vocabulary from the [OMS Workflow Terminology Alignment sheet](https://docs.google.com/spreadsheets/d/1XeGa7ESsFMJsrIucAxHURMDjB9OzSneXKkb2XNZDUSM).

---

## Actors

### Buyer
Who purchases the Projection and receives the delivery.

### Merchant
The business owner on VTEX. Defines Promises, operational rules, and chooses which Suppliers and Providers will execute the work.

### Seller
The entity that appears as the seller to the customer. In a marketplace, can differ from the Supplier who fulfills the order (e.g., Samsung = Seller; Carrefour = Supplier).

### Supplier
Who provides a product (physical, virtual, or service). The Supplier executes tasks within a Promise: warehouse, PSP, external seller, etc. Not necessarily who appears as the seller to the customer.

### Provider
A third-party service provider who supplies a service consumed by the merchant's operation. Also executes tasks in the workflow. Not a seller — provides the service. Examples: payment gateway (Adyen, Cielo), carrier (Jadlog, Correios), invoice issuer (Bling, Enotas).

### Executor
A Supplier or Provider responsible for performing a task within an Applied Workflow.

---

## Core Workflow Entities

### Product
A physical, virtual, or service item registered by the merchant to be used in a Projection. It is the catalog unit.

### Projection (Offer)
How the merchant makes their products available to the buyer in a store in order to fulfill a Promise — includes the product, price, delivery timeframe, and payment conditions.

### Promise
The agreement between the buyer and the merchant for the delivery of a Projection. To fulfill it, the tasks defined in the Applied Workflow are executed. A single order can have multiple simultaneous Promises (e.g., home delivery warehouse A, home delivery warehouse B, in-store pickup Y).

### Workflow
The execution script for an order — it orchestrates all tasks (who does what, in what order) so that each Promise is fulfilled, from payment to delivery, per item. A Workflow exists in two forms:

- **Workflow Template** — The reusable, configured blueprint created by the merchant. Applied Workflows are created from it.
- **Applied Workflow** — The live instance of a Workflow Template, linked to a specific Promise in a running order. Records the actual execution history of all tasks. Each Applied Workflow corresponds to one fulfillment unit within an order, produced by the system when it applies grouping criteria to the order's items. Two items form distinct Applied Workflows if they differ in at least one active criterion: delivery mode, warehouse, SLA, or supplier. An order can have 1 or N Applied Workflows.

### Task Type
A semantic, VTEX-defined classification that describes the nature of a task. Merchants can create custom tasks but cannot create new Task Types.

**Examples:** Payment, Item Preparation, Invoicing, Delivery.

### Task
The smallest unit of execution within an Applied Workflow. Each task represents an operational action — executed automatically by a system or manually by an operator. Tasks are the primary surface for AI agent orchestration, escalation, and third-party integrations.

Every task must be associated with a VTEX-defined Task Type. Merchants can create custom tasks but cannot create new Task Types.

**Attributes:**
- **Task Type:** The VTEX-defined classification this task belongs to
- **Execution mode:** `auto` (system-triggered) or `manual` (human-triggered)
- **Executor:** The Supplier or Provider responsible for carrying out the task
- **Visibility:** `user` (shopper-facing) or `internal` (ops-only)
- **Status lifecycle:** Not Initiated → In Progress → Completed / Cancelled / Ignored

**Examples:** Payment Authorization, Stock Reservation, Picking, Packing, Invoice Emission, Shipment Dispatch, Ready for Pickup, Customer Check-in, Handover at POS.

### Task Status
The representation of the current state of a task within the workflow. Gives visibility and allows creating dependencies between tasks and workflows.

| Status | Description |
|---|---|
| **Not Initiated** | Task created, awaiting execution or assignment |
| **In Progress** | Task is actively being executed |
| **Completed** | Task executed successfully |
| **Cancelled** | Task intentionally stopped; a cancellation reason is required |
| **Ignored** | Task skipped as non-applicable for this order |

### Checkpoint _(WIP)_
A named validation point within a task. Each checkpoint has a label describing what must be verified and a `failAction` specifying the recommended recovery step if it fails (e.g., "Escalate to supervisor"). Displayed as a progress indicator (e.g., "2/3 checkpoints completed").

---

## Workflow Triggers _(WIP)_

A trigger defines the condition that activates a Promise and starts the Workflow. There are three trigger types:

| Trigger | Description |
|---|---|
| **Order Start** | Workflow starts automatically when an order is created (`order-created`) |
| **Workflow Completion** | Workflow starts after another Promise completes |
| **Specific Task Completion** | Workflow starts after a named task in a specific Promise completes (`task-complete`) |

### Dependency
A prerequisite workflow or task that must complete before another can begin. Example: the Returns & Exchanges Promise depends on the Proof of Delivery task completing in the Home Delivery Promise.

---

## Workflow Categories

| Category | Color | Description |
|---|---|---|
| **Payment** | Blue | Payment capture, authorization, reconciliation |
| **Physical Fulfillment** | Teal | Physical product preparation and shipment |
| **Reverse Logistics** | Orange | Returns, exchanges, reverse logistics |
| **Services** | Purple | Value-added services and post-purchase |
| **Custom Manufacturing** | Cyan | Manufacturing before delivery (e.g., lens fabrication) |

---

## AI Agents & Orchestration _(WIP)_

The agentic orchestration model consists of three sub-agents that work in parallel on each active order:

### Routing Agent
Selects the fulfillment mode and provider for each order based on inventory availability, SLA, geography, and seller configuration.

### Orchestration Agent
Monitors workflow gates and task statuses; automatically advances order state when integrated systems report task completion. Can be configured to act autonomously within a defined confidence threshold.

### Escalation Agent
Detects tasks that exceed SLA windows or become blocked. Creates operator tasks, sends alerts (Slack, email, webhook), and suggests recovery actions.

### Confidence Threshold
A configurable 0–100% parameter that defines the boundary between autonomous agent action and escalation to a human operator. Actions below the threshold are escalated; actions above it can be executed autonomously. High-risk actions (cancellation, seller reallocation) require ≥ 95% confidence plus explicit operator approval.

### Entry Point
A configurable extension hook within a workflow where third-party apps or external agents inject status events, trigger actions, or add custom steps. Examples: a Pick & Pack app injecting "picked" and "packed" statuses; a WMS confirming Picking completion.

---

## SLA & Operational Monitoring _(WIP)_

### SLA (Service Level Agreement)
The time limit from order creation to delivery, defined per fulfillment type, geography, and seller. SLA windows are monitored continuously by the Escalation Agent.

**SLA states:**
- **Green** — On track
- **Yellow / At Risk** — Approaching deadline
- **Red / Expired** — Deadline exceeded; escalation required

### Critical Path
The longest sequence of dependent tasks determining the total timeline for a Promise. Used by the Orchestration Agent to identify SLA risk early.

---

## Order Modification

Order modifications allow changes to active orders before invoicing. Supported operations:

| Operation | Description |
|---|---|
| **Add Item** | Add a new SKU to an active order |
| **Remove Item** | Remove an entire line item |
| **Replace Item** | 1-to-1 SKU substitution |
| **Quantity Change** | Increase or decrease item quantity |
| **Weight Change** | Modify quantity for weighted items (kg, g, etc.) |
| **Seller Reassignment** | Change the fulfilling seller for an item |
| **Partial Modification** | Multiple changes (add + remove + replace) in one atomic operation |

Modifications trigger automatic recalculation of inventory reservation, freight, taxes, and promotions. A single consolidated customer notification is sent per modification event.

**Modifiable order states:** `payment-approved`, `ready-for-handling`, `handling`. Orders in `invoiced` or later states cannot be modified.

---

## Returns & Exchanges

### Return Workflow Stages
1. **Request** — Shopper initiates the return request
2. **Reverse Collection** — Reverse label generation and carrier pickup
3. **Inspection** — Distribution center condition assessment
4. **Resolution** — Refund processing or exchange dispatch

### Return Methods
- **Home Pickup** — Carrier collects from customer address
- **Carrier Drop-off / Locker** — Customer drops off at a carrier point
- **In-Store Return** — Customer returns at a physical store

### Return Compensation
- **Financial Refund** — Returned to the original payment method
- **Gift Card / Store Credit** — Alternative compensation

---

## Fulfillment Scenarios

### BOPIS (Buy Online, Pickup In Store)
Order is fulfilled by store-level stock and picked up in person at the store. Key stages: Payment → Stock Reservation (store-level) → Picking (store team) → Ready for Pickup notification → Customer Check-in → Handover at POS.

### Ship-From-Store
Similar to BOPIS, but the item ships from the store rather than being picked up in person. The origin is the physical store, but the delivery mode is home delivery.

### Kit Order
An order grouping a physical product with a related service (e.g., vinyl flooring + installation). Each item type follows its own Promise pipeline with its own executor and timeline; both pipelines converge before packaging/shipment.

### Personalized Product
A product requiring custom production (e.g., custom artwork, engraving). Triggers a parallel Personalization Promise that runs alongside the main delivery workflow. Both pipelines must complete before packaging.

### Digital Delivery
Products with no physical fulfillment (license keys, vouchers, downloads). Key stages: Payment → License/Key Generation → Invoice Emission → Email Delivery + Access Confirmation.

### B2B Purchase Approval
A pre-payment gate requiring approval before payment capture. Configurable authorization levels by purchase amount threshold.

---

## Integration & Extensibility

### MCP (Model Context Protocol) Server
The integration mechanism by which third-party apps connect to the workflow engine to inject events, read status, or trigger actions. Supported native MCP servers include: VTEX Catalog, VTEX Logistics, VTEX Payments, NFe Emitter, VTEX CRM.

### operationId
An idempotency key for order modification requests. Safe to retry without risk of duplicate execution.

---

## Version Control

### Workflow Version
A published snapshot of a Workflow Template's configuration. Versions are sequential (1.0, 1.1, 2.0, etc.) and can be applied to `new_orders_only` or `all_orders`.

Version history records: author, timestamp, description, count of active orders at publication time, and a delta list of added/removed/changed entities.

---

## Audit & Observability

Each workflow action is recorded in an audit trail with:
- **Actor** — User or agent name and type (human / AI)
- **Action** — What was done (status change, creation, deletion, escalation)
- **Timestamp** — When the action occurred
- **Before/After State** — Data snapshot before and after the change
- **Reason** — Why the change was made
- **Confidence Score** — For AI agent actions, the confidence level at time of execution

---

## Portuguese Terms Reference

| Portuguese | English |
|---|---|
| Comprador | Buyer |
| Lojista | Merchant |
| Vendedor | Seller |
| Fornecedor | Supplier |
| Provedor | Provider |
| Executor | Executor |
| Produto | Product |
| Oferta | Projection (Offer) |
| Promessa | Promise |
| Workflow | Workflow |
| Template de Workflow | Workflow Template |
| Workflow Aplicado | Applied Workflow |
| Tipo de Tarefa | Task Type |
| Tarefa | Task |
| Status da Tarefa | Task Status |
| Checkpoint | Checkpoint |
| Gatilho | Trigger |
| Dependência | Dependency |
| Separação | Picking / Item separation |
| Etiquetagem | Labeling |
| Expedição | Shipment / Dispatch |
| Entrega | Delivery |
| Faturamento | Invoicing |
| Estorno | Refund |
| Cancelamento | Cancellation |
| Logística Reversa | Reverse Logistics |
| Não Iniciado | Not Initiated |
| Em Andamento | In Progress |
| Completado | Completed |
| Cancelado | Cancelled |
| Ignorado | Ignored |
