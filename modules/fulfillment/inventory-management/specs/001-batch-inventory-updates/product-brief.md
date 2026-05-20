# Batch Inventory Updates

**Spec:** 001 — Batch Inventory Updates
**Module path:** inventory-management
**Pillar:** Fulfillment / Scalability
**PM:** Carolina Tourinho · carolina.rodrigues@vtex.com
**Status:** Beta
**Availability:** Closed Beta — H1 2026

**Related assets:**
- [API Documentation — Batch Inventory Updates](https://docs.google.com/document/d/1ZdAd2aE9hzOqI767hFP8n8P9go8HQ7Pzpxl5emrnu2o) — client-facing API doc (Dollar General)
- [RFC — Inventory Import Pipeline Architecture](https://docs.google.com/document/d/1re62sy33ouuTiqD_NG_KjZEy5cc1WGLdhvXulqwbw0A) — engineering RFC by Marcos Gibin

## Problem

The VTEX per-item inventory API requires one HTTP call per SKU. For large-scale retailers managing millions of SKUs across hundreds of warehouses, this model does not scale: update cycles are slow, error recovery is manual, and the API becomes a bottleneck during catalog refreshes and peak restocking periods. Dollar General, for example, requires full inventory refreshes that span tens of millions of rows — a volume at which per-item calls are not viable.

## Solution

An asynchronous, fault-tolerant batch inventory update pipeline. Merchants upload a CSV file directly to S3 (up to 500 MB, up to 25 million rows), commit the batch, and poll for status. The system processes the file in parallel chunks, retries non-deterministic failures automatically, and exposes a downloadable error report for rows that fail validation. Target SLA is under 30 minutes for a full batch. The feature is gated by the `RestrictedFeatures.BulkUpload` feature toggle and must be explicitly enabled per account.

## Who Benefits

- **Enterprise retailers with large catalogs** (Dollar General, ODP) who need to sync inventory across millions of SKUs without per-item API overhead
- **Merchants with multi-warehouse operations** who run full inventory refreshes on a scheduled basis
- **Merchants using seller type 3 (Location Seller Type)** architectures, supported via the `seller_id` field in the CSV schema

## Definition of Done

- [x] Batch created via `POST /availability/v1/inventory/batch`
- [x] CSV uploaded directly to S3 via pre-signed URL
- [x] Commit endpoint triggers async processing (`POST .../commit`)
- [x] Status polling endpoint returns chunk-level progress and summary (`GET .../status`)
- [x] Error report available as downloadable CSV with row-level error codes (`GET .../errors`)
- [x] Idempotent commit via S3 ETag deduplication (24h window)
- [x] Deterministic errors surfaced via error report; non-deterministic errors auto-retried ×3 then DLQ
- [x] Seller type 3 support via `seller_id` field in CSV schema
- [x] Closed Beta live with Dollar General (US) and ODP
