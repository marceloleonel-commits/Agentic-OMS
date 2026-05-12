# Delivery Promise Self-Service Activation

## Problem Statement

Activating Delivery Promise today requires manual intervention by VTEX's Customer Success and engineering teams. Merchants must request activation, wait for provisioning, and rely on VTEX to integrate their Catalog, Delivery Promise, Intelligent Search, and storefront flags. This creates a bottleneck that limits adoption and contradicts the platform's self-service model: no other VTEX capability of this scope requires such hands-on onboarding.

As Delivery Promise moves from Closed Beta (12 target merchants, manually onboarded) to Open Beta and GA targeting all VTEX merchants, the manual onboarding model does not scale.

## Vision

Any merchant using VTEX can activate Delivery Promise for their account from the VTEX Admin — without opening a support ticket, without waiting for a VTEX engineer, and without coordinating a migration plan. Activation integrates Catalog, Delivery Promise, Intelligent Search, and the relevant storefront flags in a single flow. The merchant sees a readiness check, confirms their settings, and Delivery Promise begins indexing.

Merchants can also deactivate, configure indexing frequency, and monitor activation status from the same Admin interface.

## Target Users

**Merchants:** Any VTEX merchant who wants to use Delivery Promise for location-based navigation, filters, tags, or badges — particularly those without a dedicated Customer Success contact or with limited time for coordinated onboarding.

**Internal (VTEX):** Enables the product team and CS to scale adoption to Open Beta and GA without linear headcount growth in onboarding.

## Success Metrics

- Time-to-activation: from merchant request to Delivery Promise actively indexing (target: under 30 minutes, self-served)
- % of new Delivery Promise activations that are self-served vs. assisted
- Support tickets related to activation: target near 0 for self-serve path
- Merchant activation rate in Open Beta vs. Closed Beta (growth multiple)

## Out of Scope

- Migration from Regionalization (deprecation path is a separate initiative)
- Configuration of Delivery Options (managed in the Delivery Options module)
- Advanced indexing customization (frequency overrides, partial catalog indexing — future)
