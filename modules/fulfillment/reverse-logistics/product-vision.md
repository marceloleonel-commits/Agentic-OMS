# Product Vision — Reverse Logistics

## Vision statement

VTEX enables merchants to complete the **physical return journey** for shoppers by integrating external reverse logistics providers through a **standard API contract**, while OMS remains the source of truth for the Return record. The product is the contract, not any single provider integration.

## Why this matters

Return logistics rules (carriers, methods, coverage, costs, codes, tracking) vary by merchant operation, seller type, shopper location, returned items, destination, and region. This logic already lives outside VTEX. The long-term play is not to rebuild it natively, but to make VTEX the **orchestration and record layer** that any provider can plug into.

## Key capabilities (long-term)

- **Standard provider protocol** — any reverse logistics provider connects by coding to the same VTEX contract, without VTEX re-architecting per provider.
- **Two well-defined interaction directions:**
  - `VTEX → Provider` (consult): resolve return methods, drop-off locations, create return execution.
  - `Provider → VTEX` (inform): ingest reverse logistics status updates.
- **Shared `returnLogistics` data model** in OMS, independent of whether the source is external or, in the future, native.
- **Multi-provider scale** beyond the first provider (Intelipost), with versioning and a breaking-change policy.

## Non-goals

- Building native reverse logistics configuration as the first step.
- Owning carrier execution or merchant-specific logistics rules.
- Generating labels, QR codes, posting codes, or tracking codes.

## Phasing

| Horizon | Focus |
|---|---|
| **Now** | First release: Intelipost for Dafiti. Validate the provider-led flow and the contract shape. |
| **Later** | Onboard additional providers against the same contract; formalize versioning, auth, and account-scoping. |
| **Future** | Optional native resolution path reusing pickup points, carriers, and freight tables, sharing the same `returnLogistics` model. |

## Ownership boundary

- **OMS** owns the Return entity, eligibility, item selection, reasons, compensation, approval, return invoicing, and platform events.
- **Fulfillment** owns the reverse logistics provider integration: return methods, drop-off locations, return execution information, and logistics status updates.

## Source of truth

- BRD — Reverse Logistics [Sponsor: Dafiti] (`brd-reverse-logistics-dafiti.md`)
- PRD — Reverse Logistics for Return Management (`prd-reverse-logistics-for-return-management.md`)
