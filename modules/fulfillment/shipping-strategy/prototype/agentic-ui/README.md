# Agentic UI — Shipping Simulator Prototype

This folder contains the agentic UI prototype for the new Shipping Simulator experience.

## Concept

Unlike the Classic UI (form-based), the Agentic UI is a conversational interface powered by an AI agent. The operator describes what they want to simulate in natural language, and the agent handles parameter resolution, API calls, and result interpretation.

**Inspired by:** [`vtex/shipping-simulator-agent`](https://github.com/vtex/shipping-simulator-agent) — a fullstack agent built with the Strands Framework (Python backend) and Raccoon/Agentic UI (Next.js frontend).

## Key Differences from Classic UI

| Aspect | Classic UI | Agentic UI |
|---|---|---|
| Interaction model | Form-based | Conversational / natural language |
| Parameter input | Manual fields | Agent resolves from context |
| Result format | Structured table | Inline visual component + narrative |
| Error handling | Validation messages | Agent explains and suggests |
| Multi-turn | No | Yes — refine simulation in conversation |

## Planned Prototype Contents

- `shipping-simulator-agent.html` — HTML prototype of the conversational interface
- Mock conversations demonstrating key scenarios (SKU variant disambiguation, seller scoping, currency display, carrier rejection explanation)

## Status

`[ ] In progress` — prototype not yet built.
