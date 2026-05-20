# Spec 001: Batch Inventory Updates

## Metadata

| Field | Value |
|---|---|
| **Module** | Inventory Management |
| **Status** | Beta (feature-toggle gated) |
| **Author** | Carolina Tourinho |
| **Created** | May 2026 |
| **Source doc** | [[Fulfillment] Batch Inventory Updates](https://docs.google.com/document/d/1ZdAd2aE9hzOqI767hFP8n8P9go8HQ7Pzpxl5emrnu2o) |

---

## Problem

The VTEX per-item inventory API (`/api/logistics/pvt/inventory/skus/{skuId}`) requires one HTTP call per SKU. For large-scale retailers managing millions of SKUs across hundreds of warehouses, this model does not scale: update cycles are slow, error recovery is manual, and the API becomes a bottleneck during catalog refreshes and peak restocking periods.

**Dollar General** (the anchor customer for this spec) operates at a scale where a full inventory refresh requires updating tens of millions of rows. Per-item calls at that volume are not viable.

---

## What Was Built

An asynchronous, fault-tolerant batch inventory update pipeline that processes large CSV files uploaded directly to S3. The integration is currently in **beta**, gated by the `RestrictedFeatures.BulkUpload` feature toggle.

### Key metrics (as shipped)

| Capability | Value |
|---|---|
| Max rows per batch | 25 million |
| Target SLA (full processing) | < 30 minutes |
| Sustained throughput | ~15,000 records/second |
| Max file size | 500 MB |
| Error retention | 7 days after batch completion |
| Deduplication window (idempotent commit) | 24 hours |

---

## Client Workflow

```
1. Create Batch   POST  /{accountName}/availability/v1/inventory/batch
2. Upload CSV     PUT   {presigned S3 URL}
3. Commit         POST  /{accountName}/availability/v1/inventory/batch/{batchId}/commit
4. Poll Status    GET   /{accountName}/availability/v1/inventory/batch/{batchId}/status
5. Get Errors     GET   /{accountName}/availability/v1/inventory/batch/{batchId}/errors
```

---

## API Contract

### 1. Create Batch

**Method:** `POST /{accountName}/availability/v1/inventory/batch`

**Authentication:** VtexAuthorize — Logistics Full Access resource

**Request body:** None

**Response:**

| Field | Type | Description |
|---|---|---|
| `batchId` | String (UUID) | Unique identifier. Must match the CSV filename on upload. |
| `status` | String | Initial status: `AWAITING_UPLOAD` |
| `upload.method` | String | `PUT` |
| `upload.url` | String | Pre-signed S3 URL |
| `upload.headers` | Object | `Content-Type: text/csv` |
| `upload.expiresAt` | DateTime | URL expires after 30 minutes |

**HTTP status codes:**

| Code | Meaning |
|---|---|
| 201 | Batch created |
| 400 | Invalid request or missing path parameter |
| 401 | Unauthorized |
| 403 | Insufficient permissions or feature toggle not enabled |
| 429 | Daily API-call quota exceeded |
| 500 | Unexpected error |

**Behavior notes:**
- Gated by `RestrictedFeatures.BulkUpload`. Returns `403` if not enabled for the account.
- Stale `AWAITING_UPLOAD` batches older than 30 minutes are automatically expired before a new batch is issued.
- No concurrent-batch block at Create time. The per-account concurrency limit (default: 1) is enforced asynchronously by the internal dispatch worker.

---

### 2. Upload CSV (Data Plane)

The client uploads the CSV directly to S3 using the `upload.url` from the Create Batch response.

```shell
curl -X PUT "{presignedUrl}" \
  -H "Content-Type: text/csv" \
  --data-binary "@{batchId}.csv"
```

**File requirements:**
- The CSV filename must match the `batchId`.
- Max file size: 500 MB.
- Encoding: UTF-8. Line endings: LF or CRLF. Delimiter: comma. Quote character: double-quote.
- Header row required (first row).

**CSV schema:**

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `item_id` | Integer | YES | SKU identifier | `12345` |
| `account_name` | String | YES | Tenant account name | `dgmissouri` |
| `container_id` | String | YES | Warehouse ID | `WH-01` |
| `quantity` | Integer (long) | YES | Physical stock. Must be non-negative. | `150` |
| `unlimited` | Boolean | NO | Unlimited stock flag. Accepted: `true/1/yes/y/sim` (case-insensitive). Default: `false`. | `false` |
| `lead_time` | TimeSpan or Integer | NO | Fulfillment lead time. Supports .NET TimeSpan (e.g. `1.00:00:00`) or integer hours (e.g. `24`). | `1.00:00:00` |
| `supply_date` | DateTime | NO | Next supply date | `2026-01-15T10:00:00Z` |
| `seller_id` | String | NO | Seller ID for seller_type=3 (Location Seller Type) architectures | `dgmissouri_01` |

**Seller type 3 note:** For architectures that use `sellerType=3`, both `account_name` and `seller_id` must be set to the specific Seller ID.

**CSV example:**
```
item_id,account_name,container_id,quantity,unlimited,lead_time,supply_date,seller_id
SKU-12345,dgbransonmissouri,WH-01,150,false,PT24H,2026-01-15T10:00:00Z,
SKU-12346,dgbransonmissouri,WH-01,200,false,PT48H,,
SKU-12347,dgbransonmissouri,WH-01,0,true,,,
```

---

### 3. Commit

**Method:** `POST /{accountName}/availability/v1/inventory/batch/{batchId}/commit`

**Authentication:** VtexAuthorize — Logistics Full Access resource

**Behavior:**
- Confirms upload is complete and triggers processing.
- Response: `202 Accepted`. Batch status transitions to `QUEUED`.
- Idempotent: duplicate commits within 24 hours (same file, detected via S3 ETag) are treated as a no-op and return `202 Accepted` without re-dispatching.

**Synchronous validations at Commit time (before any quota charge):**
- CSV header row validation. Returns `400` if header is invalid or missing.
- File size validation. Returns `400` if file exceeds 500 MB.
- Quota enforcement (daily bytes limit) runs after header and size validation pass.

**HTTP status codes:**

| Code | Meaning |
|---|---|
| 202 | Upload confirmed, batch queued |
| 400 | Batch not in `AWAITING_UPLOAD` state, invalid CSV header, or file exceeds 500 MB |
| 401 | Unauthorized |
| 403 | Insufficient permissions |
| 423 | Commit already in progress for this batch |
| 429 | Daily bytes quota would be exceeded |
| 500 | Unexpected error |

---

### 4. Poll Status

**Method:** `GET /{accountName}/availability/v1/inventory/batch/{batchId}/status`

**Authentication:** VtexAuthorize — LogisticsAdmin resource

**Response fields:**

| Field | Type | Description |
|---|---|---|
| `batchId` | String (UUID) | Batch identifier |
| `status` | String | Current status (see state machine below) |
| `rowCount` | Integer | Total rows in batch |
| `processedCount` | Integer | Rows processed so far |
| `errorCount` | Integer | Rows with errors |
| `amountCompleted` | Integer | Completion percentage (0–100) |
| `createdAt` | DateTime | Batch creation timestamp |
| `startedAt` | DateTime | Processing start timestamp |
| `stages` | Object | Chunk-level breakdown |
| `summary` | Object | Processing outcome summary |

**Stages object:**

| Field | Description |
|---|---|
| `ingestedChunks` | Chunks that completed ingestion |
| `classifiedChunks` | Chunks that completed classification |
| `processedChunks` | Chunks that completed processing |
| `notifiedChunks` | Chunks that completed notification |
| `totalChunks` | Total chunks in batch |

**Summary object:**

| Field | Description |
|---|---|
| `insertCount` | New inventory rows inserted |
| `updateCount` | Existing rows updated |
| `noopCount` | Rows with no change needed |
| `conflictCount` | Rows with Compare-And-Set conflicts |
| `skippedDueApiUpdateCount` | Rows skipped because recently updated via per-item API (AVL) |
| `perItemRoutedCount` | Rows routed to per-item processing |
| `dlqEventsCount` | Events sent to Dead Letter Queue |

> Note: `stages` and `summary` may be `null` while the batch is in early stages.

---

### 5. Get Errors

**Method:** `GET /{accountName}/availability/v1/inventory/batch/{batchId}/errors`

**Authentication:** VtexAuthorize — LogisticsAdmin resource

**Response:**

| Field | Type | Description |
|---|---|---|
| `batchId` | String (UUID) | Batch identifier |
| `downloadUrl` | String | Pre-signed URL to download error CSV (valid 60 minutes) |
| `errorCount` | Integer | Total rows with errors |

**Availability:** Only when `errorCount > 0` and status is one of `PROCESSING`, `COMPLETED`, `COMPLETED_WITH_ERRORS`, or `FAILED`. Returns `204 No Content` otherwise.

**Error CSV schema:**

| Field | Type | Description |
|---|---|---|
| `line_number` | Integer | Original line number in the upload CSV |
| `item_id` | String | SKU identifier from the failed row |
| `container_id` | String | Warehouse ID from the failed row |
| `error_code` | String | Machine-readable error code |
| `error_message` | String | Human-readable error description |

**Error codes:**

| Code | Description |
|---|---|
| `INVALID_QUANTITY` | Quantity is negative or non-numeric |
| `MISSING_REQUIRED_FIELD` | Required field is empty or missing |
| `INVALID_DATE_FORMAT` | Date/time field has invalid format |
| `UPDATE_FAILED` | Database update failed after retries (DLQ scenario) |
| `INSERT_CONFLICT` | Insert conflicted with a concurrent operation |
| `INVALID_FORMAT` | Wrong number of columns or malformed row |
| `CONFLICT` | Compare-And-Set conflict or per-item routing conflict |
| `UNKNOWN` | Unclassified error |

**Error retention:** 7 days after batch completion.

---

## Batch State Machine

```
AWAITING_UPLOAD  →  QUEUED  →  PROCESSING  →  COMPLETED
                                            →  COMPLETED_WITH_ERRORS
                                            →  FAILED
                 →  EXPIRED   (no commit within 30 min of creation)
         QUEUED  →  EXPIRED   (waiting too long in dispatch queue, default: 60 min)
```

| Status | Description |
|---|---|
| `AWAITING_UPLOAD` | Batch created, waiting for CSV upload |
| `QUEUED` | Upload committed, waiting to begin processing |
| `PROCESSING` | Batch is being processed (includes internal stages: INGESTING, CLASSIFYING) |
| `COMPLETED` | All rows processed successfully |
| `COMPLETED_WITH_ERRORS` | Processing finished with some row-level errors |
| `FAILED` | Processing failed due to validation or system errors |
| `EXPIRED` | `AWAITING_UPLOAD` batches expire 30 min after creation. `QUEUED` batches expire if not dispatched within 60 min. |

---

## Error Handling Model

Two categories of errors:

**Deterministic errors** — caused by invalid or incomplete data in the CSV (missing fields, invalid values, wrong format). Detected during ingestion. The system does not retry. The client must fix the data and resubmit a new batch.

**Non-deterministic errors** — infrastructure or system failures. The system automatically retries up to 3 times. If still failing after 3 attempts, the message is sent to a Dead Letter Queue (DLQ) for investigation. Surfaced as `UPDATE_FAILED` in the error report.

---

## Access Control

| Operation | Required resource |
|---|---|
| Create Batch | Logistics Full Access |
| Upload CSV | None (direct S3 upload via pre-signed URL) |
| Commit | Logistics Full Access |
| Poll Status | LogisticsAdmin |
| Get Errors | LogisticsAdmin |

> **Note:** The source document has an inconsistency on the Poll Status and Get Errors endpoints. The `Authentication` field specifies `LogisticsAdmin`, but the `403 Forbidden` error description reads *"Logistic full access is needed"*. `[PM INPUT NEEDED: confirm correct resource with the team — LogisticsAdmin or Logistics Full Access]`

---

## Quotas and Limits

| Limit | Default | Notes |
|---|---|---|
| Daily API-call quota (Create Batch) | Configurable per account | Returns `429` if exceeded |
| Daily bytes quota (Commit) | Configurable per account | Returns `429` if exceeded |
| Concurrent batches per account | 1 | Enforced asynchronously at dispatch time |
| Max file size | 500 MB | Validated synchronously at Commit |
| Pre-signed URL expiry | 30 minutes | From Create Batch response |
| `AWAITING_UPLOAD` expiry | 30 minutes | Automatic expiry if no commit |
| `QUEUED` expiry | 60 minutes | Automatic expiry if not dispatched |

---

## Current Status and Rollout

This spec documents the feature as shipped in beta.

- **Feature toggle:** `RestrictedFeatures.BulkUpload` — must be explicitly enabled per account. Accounts without the toggle receive `403 Forbidden` on Create Batch.
- **Anchor customers:** Dollar General (US) and ODP. First live cycles in production.
- **Beta scope:** Behavior, default quotas, and concurrency limits may still evolve. Integrators must coordinate enablement with the VTEX team and monitor batch status and error reports closely during initial production cycles.

`[PM INPUT NEEDED: target date for GA; any known limitations discovered during Dollar General or ODP onboarding]`

---

## Appendix

### Source Documents

| Document | Link |
|---|---|
| [Fulfillment] Batch Inventory Updates (API doc) | [Google Doc](https://docs.google.com/document/d/1ZdAd2aE9hzOqI767hFP8n8P9go8HQ7Pzpxl5emrnu2o) |
| RFC — Inventory Import Pipeline Architecture | [Google Doc](https://docs.google.com/document/d/1re62sy33ouuTiqD_NG_KjZEy5cc1WGLdhvXulqwbw0A) |

### Changelog

| Date | Author | Change |
|---|---|---|
| May 2026 | Carolina Tourinho | Initial spec from beta API documentation |
