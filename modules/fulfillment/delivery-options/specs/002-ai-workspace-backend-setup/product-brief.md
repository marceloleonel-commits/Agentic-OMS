# Product Brief — AI Workspace Backend Setup for Delivery Options Agent

| Field | Value |
| --- | --- |
| **Spec** | 002 — AI Workspace Backend Setup |
| **Module path** | fulfillment / delivery-options |
| **Pillar** | Fulfillment / Agentic Configuration |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | Coming Soon — Q2C2 2026 |
| **Team** | Fulfillment (Ricardinho) |

**Related assets:**
- [Create AI Workspace Agent — Dark Kitchen template](https://darkkitchen.vtex.com/create/templates/default/create-ai-workspace-agent) — VTEX Internal Tools

---

## Problem

The Delivery Options Agent backend must follow the same standard the platform is already using for agentic applications. Building it outside of this standard would create inconsistency in infrastructure, deployment, and observability across VTEX's agent ecosystem.

---

## Opportunity

VTEX's AI Workspace provides a standardized scaffolding template ([Create AI Workspace Agent](https://darkkitchen.vtex.com/create/templates/default/create-ai-workspace-agent)) that automates the most time-consuming parts of agent setup: Agent ID generation, repository creation, Tech Catalog registration, deployment pipelines, and credentials provisioning. Using this template eliminates manual configuration risk and ensures the Delivery Options Agent follows VTEX's standard agentic architecture from day one.

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

- Agent task implementation (spec 001 — Same Day DO automation covers this)
- Agentic UI / Admin Shell frontend (separate future spec)
- Storefront integration
- LLM prompt engineering or model selection for agent tasks

---

## Frontend and cycle scope

The frontend of the Delivery Options Agent will live in Admin v4. Components and patterns to be used are already defined. This spec does not cover the frontend — the focus of this cycle is getting the backend infrastructure in place so the agent can be hosted, deployed, and observed following the platform standard.

---

## Success criteria

- Agent registered in VTEX Application Registry with a unique Agent ID
- GitHub repository created with correct permissions and branch protection
- Deployment pipeline operational (`agent-deploy-v1`)
- Application credentials provisioned and PR merged to `application-credentials`
- [PM INPUT NEEDED: confirm agent type with Ricardinho — Vanilla, Strands, UI, Full-stack, or MCP?]
