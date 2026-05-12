# Delivery Promise Compatibility

## Problem Statement

Delivery Promise must work correctly for every merchant on VTEX, regardless of how their operation is structured. But VTEX supports a wide range of architectures and capabilities — different seller types, external OMS integrations, operational capacity limits, multilevel inventory models, and products requiring assembly — and each introduces a scenario where Delivery Promise could produce incorrect or incomplete availability data if not explicitly accounted for.

The risk is concrete: a merchant who activates Delivery Promise and operates with assembly options or operational capacity constraints could show shoppers products as available when they cannot actually be fulfilled, or conversely hide products that are genuinely available. Either outcome degrades trust and undermines the core value of the feature.

## Vision

Delivery Promise produces correct availability data for all merchants on VTEX, regardless of their seller architecture or the VTEX capabilities they use. A merchant operating with franchise sellers, external OMS integrations, operational capacity limits, MOI inventory, or assembly options can activate Delivery Promise and trust that the availability shown to shoppers accurately reflects what can be fulfilled.

Each compatibility case is delivered as a separate release, enabling merchants to adopt Delivery Promise progressively as their specific scenarios are covered.

## Target Users

**Merchants:** Tier 1 and Tier 2 merchants with complex architectures who have been blocked from or excluded from Delivery Promise Closed Beta due to uncovered scenarios. Specifically: merchants using operational capacity, assembly options, or MOI inventory, and those with external OMS or non-standard seller types.

## Phasing

- **Closed Beta**: Basic seller types (franchise, regular, seller portal) and comprehensive sellers supported. External sellers via External Sellers API. Assembly options and operational capacity explicitly excluded.
- **Open Beta (Phase 2)**: Operational capacity and assembly options added — key requirement for T1/T2 merchant scaling.
- **GA**: All remaining compatibility gaps closed; MOI and full external seller protocol finalized.

## Out of Scope

- Supporting storefront frameworks other than FastStore, VTEX IO, and headless (external storefronts covered via API)
- External search providers (future phase, after GA)
- Delivery fee compatibility (separate system, not Delivery Promise scope)
