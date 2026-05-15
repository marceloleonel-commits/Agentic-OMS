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
| Carrier management | Read-only | Agent can activate/deactivate carriers upon explicit confirmation |

## Agent Capabilities

### Simulation
- Run shipping simulation from natural language input (SKU, ZIP, seller, sales channel)
- Accept all parameters at once or incrementally — agent tracks context and asks for what's missing
- Accept any SKU ID, seller ID, or ZIP code, even if not in the known mock list

### Result interpretation
- Break down delivery options with carrier, price, deadline, and route (warehouse → dock → carrier)
- Show cost and time breakdown per logistics leg
- Surface store pickup options alongside home delivery

### Diagnostics
- Explain why each carrier was excluded from the simulation, with human-readable reason (ZIP coverage, weight limit, inactive, etc.)
- Distinguish between active carriers excluded by rule and carriers that are simply inactive

### Carrier management *(agentic-only capability)*
- Activate an inactive carrier upon operator request
- Before activating, the agent shows the connected shipping policy and all docks that will be affected
- Requires **explicit confirmation** from the operator — the agent never acts without it
- Deactivation follows the same confirmation flow

### Post-simulation refinement
- Filter results by specific carrier
- Identify the cheapest option
- Update quantity
- Reset and start a new simulation

## Prototype

- `shipping-simulator-agent.html` — self-contained HTML prototype of the conversational interface
- PT-BR dataset: **Drogarias Pacheco** with sellers Botafogo and Barra
- EN dataset: **Road Runners** with sellers San Diego and Los Angeles
- Language toggle (PT/EN) in the top-right corner of the interface

## Status

`[x] Complete` — prototype built and available at [GitHub Pages](https://vtex.github.io/vertical-distributed-order-management-dom/modules/fulfillment/shipping-strategy/prototype/agentic-ui/shipping-simulator-agent.html).
