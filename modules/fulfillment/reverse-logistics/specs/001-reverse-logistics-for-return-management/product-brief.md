# Product Brief — Reverse Logistics for Return Management

> **Lean SDD input.** This brief is the entry point for the spec. It does not restate the full business case — the source of truth lives in the BRD and PRD (see Links). Keep this document short.

| Field | Value |
|---|---|
| **Module / Feature** | Fulfillment / Reverse Logistics |
| **PM** | Carol Tourinho |
| **Eng Champion** | Jhonatan Raphael |
| **Status** | Draft |
| **Expected Release** | 2026-Q3 · Testing target Sep 2026 |
| **Availability** | Priority Access |
| **Sponsor** | Dafiti |

## MMR

**Title:** Reverse Logistics for Return Management

**Description (Feature Delta):** VTEX gains the reverse logistics layer needed to complete the return journey through an **external provider**, starting with Intelipost for Dafiti. A new Fulfillment-owned integration resolves return methods, retrieves drop-off locations, persists provider-generated return execution information in `returnLogistics`, and ingests reverse logistics status updates — without VTEX building native return logistics configuration or owning carrier execution.

**Designed as a standard provider protocol:** the integration is a contract any provider must implement, not a one-off Intelipost integration, so it scales to other providers later.

## Problem

VTEX cannot complete the physical return journey natively. Return methods, drop-off locations, return/tracking codes, and logistics status are owned by merchant operations and external providers. Without a VTEX integration boundary, the shopper journey, OMS record, and SAC visibility stay fragmented.

## Scope

**In:** dynamic return method resolution; drop-off location lookup; receive/store return execution info in `returnLogistics`; endpoints to receive reverse logistics status updates and propagate to OMS/events; minimum provider abstraction (contract) for future providers.

**Out:** native reverse logistics configuration; **admin visual interface for reverse logistics** (it is a backend integration — the visual operator/shopper experience is owned by the OMS workflow + front-end); VTEX-generated labels/codes; exchange-specific business flow and new order creation (OMS scope); direct ERP/WMS integration; full global multi-provider framework; carrier management inside VTEX.

## Target audience

Tier-1 enterprise B2C retailers/marketplaces with complex post-sales operations relying on external TMS/RMS/carrier providers, starting with Dafiti. Personas: shoppers, SAC agents, OMS operators, Fulfillment operators, integration engineers.

## Success criteria

Dafiti completes the first provider-led return flow in the VTEX experience; methods/locations resolved dynamically via Intelipost; execution info persisted in `returnLogistics`; status updates received and propagated; OMS/Fulfillment ownership boundary validated in the RFC; ready for testing by Sep 2026.

## Links (source of truth)

- BRD — `brd-reverse-logistics-dafiti.md`
- PRD — `prd-reverse-logistics-for-return-management.md`
- RFC — Foundation of Return & Exchange Management (OMS)
- Diagram — `../../prototype/reverse-logistics-flow-diagram.html`
