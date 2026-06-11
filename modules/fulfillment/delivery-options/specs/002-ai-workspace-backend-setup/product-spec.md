# Product Spec — AI Workspace Backend Setup for Delivery Options Agent

| Field | Value |
| --- | --- |
| **Spec** | 002 — AI Workspace Backend Setup |
| **Author** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Last updated** | May 2026 |

---

## Clarifications

**Why use the Dark Kitchen template instead of setting up manually?**
The [Create AI Workspace Agent template](https://darkkitchen.vtex.com/create/templates/default/create-ai-workspace-agent) automates 7 setup steps that would otherwise be done manually and inconsistently: Agent ID generation, repo creation, Tech Catalog registration, deployment pipeline configuration, and credentials provisioning. It ensures the Delivery Options Agent follows VTEX's standard agentic architecture from the start and reduces setup risk.

**What agent type should be selected?**
Decided — **Backend (Strands) only** for the main agent repo (`fulfillment-config-agent`), and **MCP Instructions** for the shared platform service (`fulfillment-mcp-server`). The template is run twice. Strands natively supports the Orchestrator + Sub-agent pattern chosen in [ADR-001](./ADR-001-fulfillment-agent.html). UI scaffolding is deferred to a future frontend spec.

**Is this spec blocking spec 001?**
Yes. Spec 001 (Same Day DO automation) must be implemented as agent tasks inside this infrastructure — not as a standalone script or microservice. Spec 002 is a **prerequisite** for deploying spec 001. The two specs run in parallel during Q2C2, but spec 001 cannot ship until the agent backend and MCP server are provisioned.

**What is the relationship between this spec and the frontend?**
This spec covers backend infrastructure only. The frontend will live in Admin v4, with components and patterns already defined — but it is out of scope for this cycle. The agent type chosen here should be compatible with the Admin v4 frontend when that spec is built.

---

## Agent purpose (long-term)

This spec provisions **infrastructure only** — no task logic ships here. The backend must be set up with the right credentials, data access, and observability so the Delivery Options Agent can eventually **absorb logistics configuration workflows** that today require a human to navigate multiple Admin screens and APIs.

In practice, the agent will need to **read and reason over** a merchant's logistics setup before suggesting or applying changes. The first concrete use case is spec 001 (Same Day DO automation); over time the same agent hosts spec 003 tasks and a full conversational experience in Admin v4.

The immediate next step after backend setup is to embed **logistics coverage analysis actions directly into the existing Delivery Options UI** — for example, explaining why a DO covers or excludes a given zone, and surfacing optimization opportunities around **coverage, delivery time, and shipping margin** without requiring merchants to navigate raw logistics config.

**Functions the agent is expected to absorb** (read-first; write where noted):

| Function | What the agent needs to understand | Example task |
| --- | --- | --- |
| **Shipping policy analysis** | Active policies, SLAs, cutoff times, linked carriers | "Which routes support Same Day?" (spec 001) |
| **Delivery route inspection** | Delivery vs. pickup routes per policy, coverage (postal codes / regions), effective transit time | Explain why a DO suggestion includes or excludes a zone |
| **Dock configuration** | Active docks, dock–warehouse associations, freight tables, business hours | Validate that a suggested DO maps to reachable fulfillment points |
| **Warehouse / inventory context** | Warehouses, stock balances, warehouse–dock links | Confirm availability signals and fulfillment origin for a route |
| **Delivery Options state** | Existing DOs, labels, time targets, linked policies, activation per sales channel | Detect conflicts, gaps, or duplication before creating a new DO |
| **Shipping margin analysis** | Freight cost per DO vs. price charged to buyer; margin by region, seller, or shipping policy | Identify DOs with negative or low margin; suggest repricing or restructuring |
| **Seller-scoped configuration** | Which docks, warehouses, and policies belong to which seller within the account | Support enterprise accounts with multiple sellers (e.g., sellerType=3) where logistics is concentrated in one main account |

The agent does **not** replace Logistics APIs — it orchestrates reads (and later writes) against them. Backend setup must assume **multi-entity, cross-linked reads** per account, and increasingly **per seller** as seller architecture scales.

---

## Agent data context

For whoever sets up the backend: the Delivery Options Agent needs read access to logistics data to operate. Its tasks depend on understanding the merchant's current configuration — this is what feeds the agent's reasoning.

### Data the agent must read

| Data | Why | Scope |
| --- | --- | --- |
| **Shipping policies (SLAs)** | Core input — delivery times, modalities, cutoff windows, carrier bindings | Account; filterable by seller where applicable |
| **Delivery routes** | Routes embedded in shipping policies (delivery vs. pickup), coverage polygons / postal codes, transit time | Per policy; aggregated at account level for DO suggestions |
| **Docks** | Active fulfillment points, freight tables, hours, dock–warehouse links | Account; mapped to seller via warehouse `sellerId` (sellerType=3) |
| **Warehouses / inventory** | Stock availability, warehouse–dock relationships, seller ownership | Account + per-seller warehouse subset |
| **Delivery Options (existing)** | Detect conflicts, gaps, or duplication before suggesting new DOs | Account (sales channel activation) |
| **Sellers (type 3)** | Resolve which logistics entities belong to which seller in unified enterprise accounts | Account-level seller register + warehouse `sellerId` mapping |

### Account vs. seller scoping

Most merchants today operate as a **single account = single operation**. Enterprise seller architecture (sellerType=3) concentrates **many sellers in one main account**, each with its own warehouses (and typically at least one shipping policy per seller).

The backend must not assume a flat account-only view. Agent tools and credentials should support:

1. **Account-wide reads** — list all shipping policies, docks, warehouses, and DOs for the merchant account.
2. **Seller-filtered reads** — given a `sellerId`, return only the warehouses, policies, and routes that belong to that seller (via warehouse → seller mapping and policy associations).
3. **Cross-seller reasoning** — tasks like Same Day DO suggestion may start account-wide but must be able to explain coverage **per seller / per location** when the merchant asks.

> **Reference:** sellerType=3 warehouse → seller mapping uses the `sellerId` field on warehouses (`GET /api/logistics/pvt/configuration/warehouses`). See [seller architecture product brief](../../seller-architecture/specs/001-unified-enterprise-store-management-sellertype-3/product-brief.md).

### Logistics API surface (initial)

Exact tool implementations are engineering-owned; these are the **data sources the agent must be able to reach** with application credentials:

| Domain | Typical API prefix | Read | Write (future tasks) |
| --- | --- | --- | --- |
| Shipping policies | `/api/logistics/pvt/shippingpolicies` | ✅ Required | Later — not in spec 002 |
| Docks | `/api/logistics/pvt/configuration/docks` | ✅ Required | Later |
| Warehouses | `/api/logistics/pvt/configuration/warehouses` | ✅ Required | Later |
| Inventory | `/api/logistics/pvt/inventory/skus/{skuId}` | ✅ Required (context) | No |
| Delivery Options | Delivery Options API (module-specific) | ✅ Required | ✅ Required for DO creation (spec 001) |
| Sellers | `/api/seller-register/pvt/sellers/{sellerId}` | ✅ Required (sellerType=3) | No |

This data lives in VTEX's Logistics and Seller Register APIs. The backend setup must ensure the agent has the correct **application credentials**, **delegation flow**, and **access scope** to read from these sources on behalf of the merchant account. Write access (for DO creation) is also required for task execution in spec 001+.

### What this spec does *not* implement

- MCP tools / agent prompts that call these APIs — deferred to spec 003 and task implementation specs
- Caching, pagination strategy, or normalization logic (spec 001 uses Clara's script as the first normalization path)
- Seller-type-specific edge cases beyond read scoping (documented as the agent evolves)

---

## Acceptance criteria

| # | Criterion |
| --- | --- |
| AC-001 | A unique Agent ID is generated by VTEX Application Registry and populated in all config files — no manual registration required |
| AC-002 | A GitHub repository exists with internal visibility, correct team access controls, and branch protection enabled |
| AC-003 | `catalog-info.yaml` is set up and the agent is registered in the Tech Catalog |
| AC-004 | `vtex/deployment.yaml` is generated and the `agent-deploy-v1` pipeline is configured and functional |
| AC-005 | A PR to `application-credentials` is opened with the delegation flow for application environments |
| AC-006 | TechDocs is set up and a README is generated |
| AC-007 | Dev containers are pre-configured with Python 3.11 + Node.js 22 |
| AC-008 | Building Blocks integrations are configured: LLM Gateway, Conversations, Auth |
| AC-009 | Application credentials and delegation flow grant read access to Logistics APIs: shipping policies, docks, warehouses, inventory, and existing Delivery Options — scoped per merchant account |
| AC-010 | Credential scope and agent architecture support seller-filtered reads (warehouses by `sellerId`, seller-scoped policy context) for sellerType=3 enterprise accounts — even if first tasks run account-wide |

---

## Setup steps

Reference: [Create AI Workspace Agent](https://darkkitchen.vtex.com/create/templates/default/create-ai-workspace-agent)

| Step | What happens | Required input |
| --- | --- | --- |
| 1. DK Portal Tech Catalog info | Register agent in Tech Catalog with metadata | Agent name, description, owner team |
| 2. Agent Configuration | Select agent type; configure Building Blocks | Agent type (Vanilla / Strands / UI / Full-stack / MCP) |
| 3. Admin UI Configuration | Configure Agentic UI with Raccoon for Admin Shell | Out of scope this cycle — defer to frontend spec |
| 4. Choose repository location | Internal GitHub, visibility, team access | Repository name, team |
| 5. Review | Final confirmation before template runs | — |

---

## Open decisions

| Decision | Status | Owner |
| --- | --- | --- |
| Agent type selection (Vanilla / Strands / UI / Full-stack / MCP) | ✅ Decided — **Backend (Strands) only** for `fulfillment-config-agent`; **MCP Instructions** for `fulfillment-mcp-server` (two separate template runs). See [ADR-001](./ADR-001-fulfillment-agent.html). | Ricardinho |
| Include Admin UI scaffolding now or defer to frontend spec (Admin v4)? | ✅ Decided — Defer. Backend is decoupled from UI; frontend connects via API in a future spec. | Carol |
| Repository name for the agent | ✅ Decided — `fulfillment-config-agent` (monorepo: Orchestrator + Sub-agents) + `fulfillment-mcp-server` (shared MCP platform service). | Ricardinho |

---

## Dependencies

| Dependency | Status |
| --- | --- |
| Dark Kitchen access for Ricardinho | ✅ Confirmed |
| `application-credentials` repository access | Must be confirmed |
| LLM Gateway availability for Delivery Options use case | Must be confirmed with AI Platform team |

---

## Strategic reference

This spec delivers the infrastructure foundation for the Delivery Options Agent. It runs in parallel with spec 001 (Same Day DO automation) in Q2C2, and is the prerequisite for deploying all future agent tasks:

1. **Spec 001 (Q2C2):** Same Day DO automation — deterministic, runs independently for now
2. **This spec (Q2C2):** AI Workspace backend — infrastructure ready for agent hosting
3. **Future:** VTEX Lab agent tasks deployed into this infrastructure
4. **Future:** Full agent absorbs spec 001 scope with conversational interaction

---

## Changelog

| Date | Author | Change |
| --- | --- | --- |
| May 2026 | Carolina Tourinho | Initial draft based on Dark Kitchen template + Q2C2 briefing |
| Jun 2026 | Carolina Tourinho | Expanded agent purpose, data context (routes, account/seller scoping), and logistics API surface for backend setup |
