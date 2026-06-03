# Cross-Team Gaps — sellerType=3 Adoption Beyond Dollar General

| Field | Value |
| --- | --- |
| **Spec** | 003 — Cross-Team Gaps |
| **Module path** | fulfillment / seller-architecture |
| **Pillar** | Fulfillment / Seller Architecture |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Availability** | N/A |
| **Team** | Cross-team (see each gap below) |

---

## Purpose

This document maps the gaps that are **outside DOM/Fulfillment ownership** but are required for sellerType=3 to be adoptable by enterprise merchants beyond Dollar General.

Dollar General onboards via direct API integration with dedicated technical support. That model does not scale to a second or third customer without significant VTEX services involvement. The gaps listed here are the blockers that make broader, self-service adoption unfeasible today.

Each gap is owned by a different team. This document is intended to serve as a requirements input for those teams — not as specs to be executed by Fulfillment.

---

## Gap 1 — Admin UI: seller management

**Owner:** Marketplace / Seller Register team

**Problem:** Today, creating and managing sellerType=3 sellers requires direct API calls. There is no admin UI. For any merchant without a dedicated technical integration team, this is a hard adoption blocker.

**What is needed:**
- Create, edit, and deactivate sellerType=3 sellers from the VTEX admin
- Link and unlink warehouses to sellers
- View seller list with status, linked warehouses, and key configurations
- Accessible to any merchant without requiring API integration

---

## Gap 2 — Bulk onboarding

**Owner:** Marketplace / Seller Register team

**Problem:** Even with an admin UI, creating sellers one by one is not viable for networks with hundreds or thousands of stores. A merchant migrating 5,000 stores to sellerType=3 needs a batch mechanism.

**What is needed:**
- Bulk creation of sellerType=3 sellers via CSV import or batch API
- Bulk update of seller configurations
- Validation feedback per row (not a single all-or-nothing operation)
- Progress tracking for large imports

---

## Gap 3 — Granular access control per seller

**Owner:** Platform / IAM team

**Problem:** All admin users with access to the main account can view and modify the configuration of any seller. Merchants with distributed operations — regional managers, store managers — cannot safely delegate access without exposing the entire account. This is a governance blocker for any merchant who wants to give operational teams access to their own store(s) only.

**What is needed:**
- Role or permission scoped to one or more sellerType=3 sellers
- A user with scoped access can manage their assigned sellers and cannot see or modify others
- Compatible with the existing VTEX admin access management model

---

## Gap 4 — Sales channel mapping per seller

**Owner:** Marketplace / Seller Register team

**Problem:** sellerType=3 sellers do not support sales channel mapping. Because they have no independent account or affiliate, all sellers sell across all sales channels of the main account. Merchants who use channels as segmentation (B2B vs B2C, marketplace vs owned store, regional storefronts) cannot scope specific sellers to specific channels.

**What is needed:**
- Configuration to associate a sellerType=3 seller with one or more sales channels
- Checkout and delivery promise respect this scoping when resolving available sellers for a given channel

---

## Gap 5 — Storefront: store selection experience

**Owner:** Storefront / Checkout team

**Problem:** The sellerType=3 model requires the shopper to select a store during the purchase journey — but the storefront UX for this selection is undefined. Dollar General is building their own frontend experience. Future merchants should not have to build this from scratch.

**What is needed:**
- A reference implementation or native component for store selection during checkout
- Integration with the `GET /api/logistics-core/shipping/delivery-zones/sellers` endpoint (which returns eligible sellers for a given delivery zone)
- Handles the case where no stores are available in the shopper's area

---

## Summary table

| Gap | Owner | Adoption impact | Priority signal |
| --- | --- | --- | --- |
| Admin UI for seller management | Marketplace / Seller Register | Blocks all non-technical merchants | High |
| Bulk onboarding | Marketplace / Seller Register | Blocks networks with 200+ stores | High |
| Granular access control | Platform / IAM | Blocks distributed operations | Medium |
| Sales channel mapping | Marketplace / Seller Register | Blocks multi-channel merchants | Medium |
| Storefront store selection | Storefront / Checkout | Blocks self-service storefront builds | Medium |
