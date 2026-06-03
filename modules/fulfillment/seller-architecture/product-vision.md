[Product Vision]: Seller Architecture Evolution — Unified Enterprise Store Management

| Status | Approved | Owner(s) | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
|---|---|---|---|
| Last Updated | Apr 2026 | Approver(s) | [Geraldo Thomaz](mailto:geraldo.thomaz@vtex.com) |
| Created | Apr 2026 | Author(s) | [Guilherme Schirmer](mailto:guilherme.schirmer@vtex.com), [Geraldo Thomaz](mailto:geraldo.thomaz@vtex.com), [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| Current Version | 2.0 | Channel | #dom-product-vertical |

---

*This vision defines how VTEX supports enterprise merchants operating large physical store networks — such as Dollar General with 23,000 stores — from a single main account, without requiring one franchise account per store. The solution introduces sellerType=3: a seller that exists as a logical operational entity within the main account, enabling centralized store management at scale.*

---

| TL;DR |
|---|
| **Product/Area:** Fulfillment — Seller Architecture |
| **Focus Task:** Enable merchants to manage thousands of physical stores under a single VTEX account by introducing sellerType=3: a seller that does not require an independent VTEX account |
| **Persona:** Enterprise omnichannel retailer operating 1,000–23,000+ physical store locations (e.g., Dollar General) |
| **Working title/Commercial Name:** Unified Enterprise Store Management / sellerType=3 |
| **Value headline:** Enterprise retailers operating large physical networks can manage all stores centrally from one VTEX account — eliminating onboarding bottlenecks, reducing administrative overhead, and enabling store-level fulfillment at scale. |
| **Mini-Press Release:** Tier 1 merchants operating large physical store networks today must create one franchise account per store in VTEX. For merchants with thousands of stores, this creates onboarding bottlenecks, fragmented management, and operational overhead that the franchise account model was not designed to handle at that scale. sellerType=3 introduces a lighter alternative: a seller that is a logical entity within the main account, with no independent VTEX account required. It is the right fit for merchants who need centralized store management and store-level operational identity — but do not need the full feature set of a franchise account (independent storefront, own payment configuration, etc.). The Seller continues as the central identifier across OMS, Logistics, Pricing, and Payments. |
| **Sponsor Customer:** Dollar General |

---

## Context

Tier 1 merchants operating large physical store networks face a structural constraint in VTEX: every store must be a franchise account. For merchants with hundreds or thousands of stores, this model creates onboarding complexity and management overhead that does not scale.

sellerType=3 solves this by extending the existing Seller entity — already the operational anchor of the platform across OMS, Payments, Logistics, and Pricing — to support sellers that do not require an independent VTEX account. A sellerType=3 seller is a logical entity within the main account: it has its own identity, its own inventory, pricing, and payment credentials, but all management is centralized. No separate account needed.

This is the right fit for merchants who need store-level operational granularity but do not need the full feature set of a franchise account — independent storefront, own checkout configuration, isolated order management.

All API updates are documented in [[VTEX] API Updates - Dollar General](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk).

---

## Problem / Opportunity

Tier 1 merchants operating large physical store networks cannot manage them centrally in VTEX without creating one franchise account per store. However, these merchants also do not need everything that a franchise account provides. They do not need separate order and promotion management per location. Their operations are simpler in terms of structure — but demand much higher scale.

For a merchant like Dollar General with 23,000 stores, this means:

- Onboarding requires VTEX support involvement for each new store account
- Management is fragmented across thousands of accounts
- The 1:1 account-to-store model does not scale to 20K+ locations
- Existing VTEX implementations (Pague Menos, Americanas) run ~1,700 stores — already near the practical ceiling of the franchise model

However, these merchants also do not need everything that a franchise account provides. They do not need an independent storefront per store, isolated checkout configuration, or separate order management per location. Their operations are simpler in terms of structure — but demand much higher scale.

sellerType=3 is the right abstraction for this segment: store-level operational identity without account-level complexity.

**sellerType=3 key characteristics:**

- Seller is not tied to a VTEX account; it is a logical entity within the main account
- All order management is centralized in the main account
- Seller acts as the operational abstraction (physical store / fulfillment node)
- Shopper makes seller selection at the frontend during the purchase journey
- SellerType=3 is created and managed via the existing Seller Register API (extended)
- Feature flag required for activation in initial rollout phase
- SellerType is immutable after creation

---

## Vision Statement

sellerType=3 is a solution for Tier 1 merchants with large physical networks who today rely on multiple franchise accounts — but whose operational model is simpler than what franchise accounts were designed for. They need centralized management, store-level identity, and scale. They do not need per-store storefronts, isolated checkout, or independent account governance.

For this segment, sellerType=3 removes the structural constraint that makes VTEX operationally unviable above ~1,700 stores. Dollar General — the sponsor customer with 23,000 stores — is the reference implementation: a single main account managing all stores via API, with centralized order management, store-level logistics, and store-level payment credentials.

---

## Key Capabilities

**1. sellerType=3 — Seller without independent account.**
A new seller type in Seller Register that does not require a VTEX account. Created via API, managed from the main account, with `isVtex = true` and `affiliateId = 00`. Supports bulk creation for large store networks.

**2. Warehouse → Seller link.**
A warehouse can be explicitly linked to a single sellerType=3 seller, establishing a clear ownership of inventory by operational entity. One seller may have N warehouses (e.g., store front + backstore). The link is validated at creation (seller must be active) and immutable while inventory exists.

**3. Centralized order management.**
All orders involving sellerType=3 sellers are created and managed in the main account. The seller is an operational context (item origin) but does not define account-level order separation.

**4. Store-level pricing.**
Pricing is defined per Seller ID, allowing distinct prices per operational unit without multiple accounts. SKU → N prices → price defined in the context of a store (sellerId).

**5. Store credentials in Payments.**
Store-level credentials (e.g., acquirer identifiers for physical store) are stored in the Payments service and associated to the sellerId. Credentials are sent in all PPP operations via a new field — not via the split recipients field. This simplifies the Checkout contract: Checkout sends only the sellerId; Gateway resolves credentials independently.

**6. Seller selection at checkout.**
For sellerType=3, the shopper selects the seller (store) at the frontend during the purchase journey. Checkout uses the sellerId from purchase context to filter associated warehouses. Inactive sellers are automatically excluded.

---

## Module Impact Summary

| Module | Change |
|---|---|
| **Marketplace / Seller Register** | New sellerType=3; extended Create/Update Seller API; feature flag for controlled rollout |
| **Fulfillment / Logistics** | Warehouse → Seller link (new optional `sellerId` field); new endpoint to list eligible sellerIds by delivery zone hash |
| **OMS** | Order-level seller defined at main account level; no order separation by seller account |
| **Checkout** | Seller context in logistics calculation; supports sellers different from seller=1 as internal entities; sends only sellerId to Gateway |
| **Payments** | Store credentials stored in Payments service (not Seller Register); sent in all PPP operations via new field |
| **Pricing** | Regionalized SKU pricing by sellerId instead of locationId |
| **Catalog / Delivery Promise** | Indexation flow updated to know which seller to reindex after availability update; seller availability calculated based on Warehouse→Seller relationship |

---

## Delivery Timeline

| Milestone | Date |
|---|---|
| All API contracts finalized | April 30, 2026 |
| Full solution delivery + production readiness | June 18, 2026 |

---

## Non-Goals

- **Franchise account model replacement**: sellerType=3 is an additive model. Existing franchise accounts (sellerType=1, sellerType=2) continue to work as-is.
- **Per-store storefront or website**: sellerType=3 sellers do not have independent storefronts. Shopper interaction happens exclusively through the main account.
- **Billing per store**: per-location billing is out of scope for this phase.
- **sellerType mutation**: changing seller type after creation is blocked in this phase.

---

## Related Assets

- [Evolução da Arquitetura de Sellers na VTEX (v2.0)](https://docs.google.com/document/d/1d25C6T12tkWkDvTnij1xxnX-HVit-KPP5nKZNK_Wp04/edit) — main design document
- [[VTEX] API Updates - Dollar General](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit) — API contracts
- [Dollar General Purchase Journey](https://docs.google.com/document/d/1d25C6T12tkWkDvTnij1xxnX-HVit-KPP5nKZNK_Wp04/edit?tab=t.k5z6afnek8ww) — shopper journey map
- [Alterações Seller Type 3](https://docs.google.com/document/d/1yr28KPlS1Mo0a0JaQl7g-hQPgkFN-nRu5zKt2yxFL8I/edit) — logistics implementation changes across Checkout, Order Allocation, Logistics Core, Availability, and known technical risks at DG scale (Clara Szwarcman)

---

## Changelog

| Changed | Details |
|---|---|
| Apr 2026 | v2.0 — sellerType=3 architecture approved. |
