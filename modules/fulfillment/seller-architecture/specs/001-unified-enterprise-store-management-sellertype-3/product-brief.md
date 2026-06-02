# Product Brief — Unified Enterprise Store Management (sellerType=3) — API

| Field | Value |
| --- | --- |
| **Spec** | 001 — Unified Enterprise Store Management (sellerType=3) — API |
| **Module path** | fulfillment / seller-architecture |
| **Pillar** | Fulfillment / Seller Architecture |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Approved |
| **Availability** | Coming Soon — Q2C2 2026 |
| **Team** | Marketplace, Fulfillment, OMS, Checkout, Payments, Pricing |

**Related assets:**
- [Evolução da Arquitetura de Sellers na VTEX (v2.0)](https://docs.google.com/document/d/1d25C6T12tkWkDvTnij1xxnX-HVit-KPP5nKZNK_Wp04/edit) — main design document
- [[VTEX] API Updates - Dollar General](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit) — API contracts
- [Dollar General Purchase Journey](https://docs.google.com/document/d/1d25C6T12tkWkDvTnij1xxnX-HVit-KPP5nKZNK_Wp04/edit?tab=t.k5z6afnek8ww)
- [Alterações Seller Type 3](https://docs.google.com/document/d/1yr28KPlS1Mo0a0JaQl7g-hQPgkFN-nRu5zKt2yxFL8I/edit) — logistics implementation changes and known technical risks at DG scale (Clara Szwarcman)

---

## Problem

Enterprise retailers with large physical store networks — think 1,000 to 23,000 stores — cannot operate centrally in VTEX today. The current platform model requires one franchise account per store: each physical location must be onboarded as an independent VTEX account, managed separately, and integrated individually. At 23,000 stores (Dollar General's scale), this model is not viable. Onboarding alone is a blocking constraint. Merchants in this situation cannot adopt VTEX for omnichannel operations.

---

## Business rationale

This is the architectural unlock for VTEX to compete for large physical retail networks. The current franchise model tops out at roughly 1,700 stores in practice (Americanas, Pague Menos). Dollar General represents a 13× step-up in scale — and a segment of enterprise retail that is structurally blocked today.

The bet is that a centralized store management model makes VTEX viable for this segment. Beyond Dollar General, any enterprise retailer with a large physical network faces the same constraint.

---

## Opportunity

The Seller entity already serves as the operational anchor of the VTEX platform — used by OMS, Logistics, Pricing, Payments, and Checkout as the central identifier for fulfillment operations. The architecture does not need a new entity. It needs the existing entity to be decoupled from the requirement of an independent account.

This decoupling is what sellerType=3 delivers.

---

## What is sellerType=3

**sellerType=3 is a new type of VTEX seller that is managed entirely within the main account — without requiring an independent VTEX account.**

Today, VTEX has two seller types:
- **sellerType=1** — standard seller, has its own VTEX account
- **sellerType=2** — white label / franchise seller, also has its own VTEX account

sellerType=3 introduces a third model:
- The seller **does not have** an independent VTEX account
- It is a **logical operational entity** within the main account — representing a physical store, fulfillment node, or any operational unit that needs its own identity
- All management — catalog, inventory, pricing, promotions, orders — is handled from the **main account**
- The Seller entity remains the central identifier across all platform modules

### What you can configure per sellerType=3 seller

| Capability | Behavior |
| --- | --- |
| **Inventory** | Each seller is linked to one or more warehouses. Warehouse holds the stock. |
| **Pricing** | Prices are defined per sellerId. Distinct prices per store without multiple accounts. |
| **Promotions** | Promotions can be allocated by sellerId — enabling store-level promotional logic. |
| **Payments credentials** | Store-level acquirer credentials are stored in the Payments service, associated to the sellerId. |
| **Order management** | All orders are created and managed in the main account. The seller is the operational context of the item, not a separate account. |
| **Logistics** | Each warehouse is explicitly linked to its seller, enabling store-level delivery promise. |

### Key constraints (this release)

- sellerType=3 sellers do not have independent storefronts
- Shopper selection of the store (seller) happens at the frontend, during the purchase journey
- sellerType is immutable after creation
- Feature flag required for activation in initial rollout
- Sellers without accounts cannot be mapped to a sales channel — all sellers can sell across all sales channels of the main account

---

## Scope (this release — API only)

This release delivers the full sellerType=3 capability **via API**. No admin UI is included.

**What is in scope:**

- **Seller Register API extended**: create and manage sellerType=3 sellers via `POST /api/seller-register/pvt/sellers` with new `sellerType=3` value
- **Warehouse → Seller link**: new optional `sellerId` field in the warehouse create/update API (`POST /api/logistics/pvt/configuration/warehouses`); link is validated at creation, immutable while active inventory exists
- **List eligible sellers by delivery zone**: new endpoint `GET /api/logistics-core/shipping/delivery-zones/sellers` — returns sellerIds eligible for a given delivery zones hash and sales channel
- **Warehouse GET endpoints updated**: `sellerId` field exposed in `GET /api/logistics/pvt/configuration/warehouses` and `GET /api/logistics/pvt/configuration/warehouses/{warehouseId}` (null for sellerType 1 and 2; populated for sellerType 3 when linked)
- **Batch Inventory API updated**: new `sellerId` header in CSV schema
- **Payments**: store credentials stored in Payments service (not Seller Register); sent in all PPP operations via new field
- **Checkout**: seller context used in logistics calculation; centralized order creation at main account level
- **Pricing**: regionalized SKU pricing by sellerId
- **OMS**: order-level seller defined only at the main account level

---

## Out of scope

- Admin UI for creating and managing sellerType=3 sellers (see spec 002)
- Store selection experience on the storefront (frontend responsibility)
- Billing per store / per seller
- Changing seller type after creation
- Standalone storefront per sellerType=3 seller

---

## Known limitations

These are technical constraints of the current implementation — not product decisions, but platform boundaries that merchants and integrators should be aware of.

| Limitation | Detail |
| --- | --- |
| **Single sales channel** | sellerType=3 sellers cannot be mapped to a specific sales channel. Because they have no independent account or affiliate, the channel mapping that exists today (seller account → affiliate → marketplace channel) does not apply. In practice, all sellerType=3 sellers sell across all sales channels of the main account. Scoping by sales channel is not supported at the seller level in this release. |
| **No granular access control** | There is no permission management at the sellerType=3 level. All admin users with access to the main account can view and modify the configuration of any seller — there is no way to scope access so that a user can only manage their own store(s) and not others. Granular role-based access per seller is out of scope for this release. |
| **No receivables split** | Payment is processed and settled entirely at the main account level. sellerType=3 does not support receivables split (split de recebíveis) — there is no financial distribution between the main account and the seller. What is supported: store-level acquirer identifiers can be managed per sellerId. These credentials are stored in the Payments service (not in Seller Register) and sent to the acquirer on every PPP operation via a new dedicated field, so the acquirer can identify which physical store originated the transaction. The financial settlement, however, remains at the main account level. |
| **No assortment configuration per seller** | There is no explicit assortment management at the seller level. Assortment is controlled implicitly through inventory: if a warehouse linked to a seller has stock for a given SKU, that SKU becomes available for that seller. There is no configuration to restrict which SKUs a specific seller can or cannot sell — the only mechanism to control a seller's assortment is managing which items have inventory in their associated warehouse(s). Note: this is not a limitation specific to sellerType=3. Seller-level assortment configuration does not exist in the current platform architecture (including franchise accounts). sellerType=3 inherits this same catalog constraint. |

| **No per-seller timezone configuration** | Timezone management is not configurable at the seller level. [Detail to be confirmed: whether the platform enforces a single timezone per account, or whether operational configurations such as cutoff times and delivery windows do not account for the seller's local timezone.] This is particularly relevant for merchants operating stores across multiple time zones (e.g., Dollar General across ~47 US states). |

| **Order Allocation heuristic does not cover sellerType=3** | The order allocation heuristic intentionally excludes sellerType=3 sellers in this release. The expected flow for the initial sponsor (Dollar General) is that the frontend pre-selects the desired seller before the order is placed. No automatic seller selection by the allocation engine is supported. |
| **StockBalance route not functional for sellerType=3** | The `/stockBalance` route was intentionally not updated to support sellerType=3 sellers. Indexation flows must rely exclusively on Delivery Promises for availability signals. Any caller attempting to use StockBalance to retrieve inventory data for type=3 sellers will get no results for those sellers. |
| **No batch creation or update for logistics entities** | The only batch capability available today is **Batch Inventory**, which updates inventory quantities — it does not create or update shipping policies, docks, or warehouses. Those entities must still be created or updated one at a time via the standard Logistics APIs. In the sellerType=3 model, all stores and their logistics configuration are concentrated in a single main account — unlike the franchise model, where each store has its own account and can be onboarded independently. At enterprise scale, this makes the initial data load and ongoing mass updates impractical without a dedicated batch mechanism. **Shipping policies are the most critical gap:** merchants typically need at least one policy per seller, making this the entity with the highest volume (e.g., DG with ~69K policies vs. ~46K docks and ~46K warehouses). VTEX is handling the initial upload for the sponsor customer given timeline constraints; a self-service batch capability for merchants remains on the backlog and is not available by 6/18. |
| **No parallel bulk updates for logistics entities** | The S3 + lock architecture used by Logistics prevents parallel updates to docks, warehouses, and shipping policies. At DG scale (46K docks, 46K warehouses, 69K shipping policies), bulk operations that require simultaneous changes must be serialized. A dedicated bulk-write mechanism may need to be developed before large-scale operational use. |
| **SOS order closing not yet updated** | Changes made in Checkout to support sellerType=3 in the order closing flow have not yet been replicated in SOS. This gap will need to be addressed during the marketplace order closing migration to SOS. |

---

## Open technical risks

These are known scalability and correctness risks identified during the implementation phase. They are not blockers for the DG go-live but represent work that must be addressed before broader rollout or higher-scale usage. Source: [Alterações Seller Type 3](https://docs.google.com/document/d/1yr28KPlS1Mo0a0JaQl7g-hQPgkFN-nRu5zKt2yxFL8I/edit).

| Risk | Detail | Severity |
| --- | --- | --- |
| **Aggregation route without guardrail** | The `/aggregation` route was not updated for sellerType=3. No flow should be calling it, but there is no enforcement mechanism. If called without scoping, the request has explosive potential given the scale of DG's logistics structure (69K policies, 46K docks, 46K warehouses). A guard or hard limit must be added before this becomes a problem in production. | 🔴 High |
| **S3 document size at DG scale** | The total size of Logistics documents stored in S3 — particularly shipping policies — may become unviable at DG's scale. This has not been stress-tested for 69K policies in a single account. | 🔴 High |
| **Delivery routes processing at scale** | With 46K warehouses/docks and 69K shipping policies, the total number of delivery routes can become very large, making route processing slow or causing failures. Today this only affects the `items/v2` route. This risk needs monitoring after go-live and may require architectural changes if route volume is problematic. | 🔴 High |

---

## Future plans

These are not in scope for the Q2C2 API release or the June 18 sponsor go-live. They address structural scalability limits surfaced by sellerType=3 at enterprise scale — especially the concentration of tens of thousands of shipping policies in a single main account.

| Initiative | Rationale | Expected impact |
| --- | --- | --- |
| **Migrate shipping policies to a relational database** | Shipping policies are today stored as Logistics documents in S3. At DG scale (~69K policies in one account), document size, serialization under lock, and delivery-route processing become bottlenecks (see Open technical risks). A relational store would enable efficient querying, filtering, and updates at volume — including seller-scoped reads and batch operations that the current architecture does not support. | Unblocks batch create/update for shipping policies, reduces timeout risk on simple updates, improves route processing performance, and is a prerequisite for self-service bulk onboarding at enterprise scale. |
| **Self-service batch upload for shipping policies** | Merchants like DG need to load and maintain one or more policies per seller without VTEX-operated file uploads. Depends on batch APIs and/or the relational migration above. | Reduces operational dependency on VTEX for initial load and ongoing mass updates. |
| **Parallel / bulk-write mechanism for logistics entities** | S3 + lock architecture serializes updates to docks, warehouses, and shipping policies. | Required for large-scale operational changes without long-running, failure-prone bulk jobs. |

> **Note:** Shipping policy storage migration is the highest-priority future initiative for sellerType=3 logistics scalability. Batch inventory already covers inventory quantities only; policies, docks, and warehouses remain the critical gap for initial load and maintenance.

---

## Why now

Dollar General is the sponsor customer, with a hard deadline: full solution delivery and production readiness by **June 18, 2026**. API contracts were finalized by April 30, 2026.

Beyond Dollar General, this unlock is a structural prerequisite for any enterprise physical retail network onboarding on VTEX at scale.

---

## Success criteria

- sellerType=3 sellers can be created, listed, and managed via API in a main account
- A warehouse can be linked to a sellerType=3 seller via API
- Checkout correctly routes logistics calculation using the seller context from the warehouse link
- Dollar General production readiness confirmed by June 18, 2026
- Inventory, pricing, and order management work end-to-end for at least one sellerType=3 seller in a staging environment before go-live
