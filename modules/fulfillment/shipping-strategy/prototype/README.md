# Shipping Simulator — Prototypes

This folder contains prototype artifacts for the new Shipping Simulator experience.

## Context

The current Shipping Simulator (`/admin/logistics#/freight-simulation`) is a minimal form-based UI with limited feedback and no visibility into logistics engine decisions. This prototype work explores two directions for a redesigned experience.

## Prototype Tracks

### 1. Classic UI (`/classic-ui`)
A redesigned version of the current simulator using Shoreline (VTEX's design system) and Raccoon (the VTEX Admin framework). Maintains the familiar form-based interaction model but significantly improves result visibility, error explanations, and overall UX.

**Goals:**
- Replace legacy UI components with Shoreline equivalents
- Fix known issues: currency display (KI 514551) and kit metadata display (KI 1382356)
- Expose rejection reasons, inventory details, and route analysis in a structured way
- Support multi-item simulation

### 2. Agentic UI (`/agentic-ui`)
A conversational AI-native experience where merchants interact with a shipping simulation agent via chat. Based on the `shipping-simulator-agent` architecture (Strands Framework + Agentic UI).

**Goals:**
- Allow natural language queries ("Can I ship SKU 123 to São Paulo?")
- Surface logistics diagnostics proactively (stock, route, carrier rejections)
- Leverage the rich `freightSimulatedForAi` API response for intelligent explanations
- Render structured results inline via the `ShippingResults` component

## Known Issues Addressed

| KI | Description | Track |
|---|---|---|
| 514551 | Wrong currency displayed in simulator | Classic UI |
| 1382356 | Empty postal/weight range for kit SKUs | Classic UI |

## Status

> Work in progress — prototypes under active development.
