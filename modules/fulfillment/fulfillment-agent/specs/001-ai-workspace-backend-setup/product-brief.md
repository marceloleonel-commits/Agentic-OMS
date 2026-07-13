# Product Brief — AI Workspace Backend Setup for Fulfillment Agent

| Field | Value |
| --- | --- |
| **Spec** | 001 — AI Workspace Backend Setup |
| **Module path** | fulfillment / fulfillment-agent |
| **Pillar** | Fulfillment / Agentic Configuration |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | Coming Soon — Q2C2 2026 |
| **Team** | Fulfillment (Ricardinho) |

**Related assets:**
- [Create AI Workspace Agent — Dark Kitchen template](https://darkkitchen.vtex.com/create/templates/default/create-ai-workspace-agent) — VTEX Internal Tools

---

## Problem

The Fulfillment Agent backend must follow the same standard the platform is already using for agentic applications. Building it outside of this standard would create inconsistency in infrastructure, deployment, and observability across VTEX's agent ecosystem.

---

## Opportunity

VTEX's AI Workspace provides a standardized scaffolding template ([Create AI Workspace Agent](https://darkkitchen.vtex.com/create/templates/default/create-ai-workspace-agent)) that automates the most time-consuming parts of agent setup: Agent ID generation, repository creation, Tech Catalog registration, deployment pipelines, and credentials provisioning. Using this template eliminates manual configuration risk and ensures the Fulfillment Agent follows VTEX's standard agentic architecture from day one.

**What this agent will do (beyond this release):** analyze the merchant's real delivery behavior using **Shipping Policies, Delivery Promise, Orders, delivery routes, docks, warehouses, inventory, and existing Delivery Options** — at account level and, for enterprise seller architecture, **per seller** within the same account. This spec only provisions the backend; see [product-spec.md](./product-spec.md#agent-purpose-long-term) for the full data context and API surface engineering needs for credentials scoping.

---

## Scope (this release)

Using the Dark Kitchen template to:

1. **Generate unique Agent ID** — automated via VTEX Application Registry, no manual registration
2. **Generate AI agent structure** — agent type to be defined (Vanilla, Strands, UI, Full-stack, or MCP); pre-configured dev containers with Python 3.11 + Node.js 22; Building Blocks integration (LLM Gateway, Conversations, Auth)
3. **Register in Tech Catalog** — automatic registration with generated ID; setup `catalog-info.yaml`
4. **Create and publish GitHub repository** — internal visibility, branch protection, team access controls
5. **Setup deployment configuration** — generate `vtex/deployment.yaml`; configure pipelines (`techdocs`, `agent-deploy-v1`)
6. **Provision application credentials** — configure delegation flow; open PR to `application-credentials` repository
7. **Create documentation structure** — setup TechDocs; generate README

---

## Out of scope

- Agent task business logic (Delivery Options Same Day automation, VTEX Lab tasks, and others implement agent tasks; this spec provisions the host)
- Agentic UI / Admin Shell frontend (separate future spec)
- Storefront integration
- LLM prompt engineering or model selection for agent tasks

---

## Frontend and cycle scope

The Fulfillment Agent will be accessible through Admin v4 and AI Workspace. This spec does not cover either frontend experience — the focus of this cycle is getting the shared backend infrastructure in place so the agent can be hosted, deployed, and observed following the platform standard.

---

## Success criteria

- Agent registered in VTEX Application Registry with a unique Agent ID
- GitHub repository created with correct permissions and branch protection
- Deployment pipeline operational (`agent-deploy-v1`)
- Application credentials provisioned and PR merged to `application-credentials`
- Agent type confirmed: **Backend (Strands) only** for `fulfillment-config-agent`; **MCP Instructions** for `fulfillment-mcp-server`. See [ADR-001](./ADR-001-fulfillment-agent.html) for architecture rationale.
