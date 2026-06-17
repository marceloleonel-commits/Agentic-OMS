# Postgres Shipping Strategy — Test Script

**Companion to:** [`seller-type-3-and-postgres-tests.md`](./seller-type-3-and-postgres-tests.md)  
**Environment:** `vtexcommercebeta`  
**Accounts tested:** `logisticstest`, `logisticsqa`  
**Date:** June 12, 2026

---

## What this script tests

Automated battery for **Shipping Strategy entities on Postgres** (Logistics API):

| Domain | TCs | Operations |
|---|---|---|
| Loading Docks | TC-01 → TC-10 | List, Get, **Create**, **Update**, Activate, Deactivate, **Delete** |
| Warehouses | TC-11 → TC-21 | List, Get, **Create**, **Update**, Activate, Deactivate, **Delete** |
| Inventory | TC-22 → TC-33 | Get (SKU/WH/dock), **PUT** quantity/lead time/unlimited, reservations |
| Shipping Policies | TC-34 → TC-42 | List, Get, **Create**, **PUT** update, activate/deactivate |
| Freight Values | TC-43 → TC-52 | Get, **POST** create/update/delete (operationType 1/2/3) |
| Scheduled Delivery | TC-53 → TC-55 | Get/add/remove blocked windows |
| Seller ID on Warehouse | WH-S01 → WH-S07 | `sellerId` validation + delivery-zones/sellers |

**Total:** 62 TCs per account (55 + 7 seller extensions).

---

## Credentials

Store in a local `.env` (git-ignored) — **never commit tokens**.

```bash
# logisticstest — OMS Full Access / Admin-equivalent
LOGISTICTEST_APP_KEY=vtexappkey-logisticstest-UPVYDR
LOGISTICTEST_APP_TOKEN=<token>

# logisticsqa — Logistics Full Access (no save-seller)
LOGISTICSQA_APP_KEY=vtexappkey-logisticsqa-ABCRGW
LOGISTICSQA_APP_TOKEN=<token>
```

| Account | AppKey role used in run | Seller register (`save-seller`) |
|---|---|---|
| `logisticstest` | Admin / OMS Full Access | Not required (ST3 sellers pre-exist) |
| `logisticsqa` | Logistics Full Access | **403** — cannot create ST3 via API |

---

## Runner location

```
Logistics-team/.agent-tmp-postgres-tests-logisticsqa.py   # logisticsqa adapted runner
Logistics-team/.agent-tmp-postgres-tests.py               # logisticstest runner
Logistics-team/.agent-tmp-postgres-retry-session.py        # retry failed TCs (logisticstest)
```

> **TODO:** consolidate into single `run-postgres-shipping-strategy-tests.py --account logisticstest|logisticsqa` before CI.

---

## How to run

```bash
cd Logistics-team

# logisticstest (full battery + cleanup leaving 2 docks)
python3 .agent-tmp-postgres-tests.py

# logisticsqa — include address in dock POST (required on Postgres path)
python3 .agent-tmp-postgres-tests-logisticsqa.py

# retry failed TCs only (logisticstest)
python3 .agent-tmp-postgres-retry-session.py
```

Results JSON:

- `.agent-tmp-postgres-results.json` — logisticstest
- `.agent-tmp-postgres-results-logisticsqa.json` — logisticsqa

---

## Payload rules (learned in run)

### Docks — `POST /api/logistics/pvt/configuration/docks`

Endpoint correto: **`POST /api/logistics/pvt/configuration/docks`** (não confundir com warehouses).

| Campo | OpenAPI | `logisticstest` (Admin) | `logisticsqa` (Postgres) |
|---|---|---|---|
| `id` | required | ✅ obrigatório | ✅ obrigatório |
| `name` | required | ✅ obrigatório | ✅ obrigatório |
| `dockTimeFake` | required | ✅ obrigatório | ✅ obrigatório |
| `address` | optional | opcional | **✅ obrigatório na prática** — sem ele → HTTP 500 |
| `salesChannels`, `priority`, `timeFakeOverhead`, etc. | optional | opcional | opcional |

**Diagnóstico (revalidado 12/06):**

- `{id, name, dockTimeFake}` → **200** em `logisticstest`, **500** em `logisticsqa`
- `{id, name, dockTimeFake, address}` → **200** em ambas
- `{id, name, dockTimeFake, salesChannels}` sozinho → **500** em `logisticsqa` (não substitui `address`)
- Update de doca existente sem `address` → **500** quando a doca no GET não tem endereço populado (`andreia-dock-01` retorna `address: null`)
- Round-trip do GET completo (com `pickupStoreInfo`, etc.) → **500** — não reutilizar body de GET; montar payload de write limpo

**Payload mínimo que funciona em `logisticsqa`:**

```json
{
  "id": "dock-qa-persist-01",
  "name": "Dock QA Persist 01",
  "dockTimeFake": "00:00:00",
  "address": {
    "postalCode": "01310100",
    "country": {"acronym": "BRA", "name": "Brazil"},
    "city": "Sao Paulo",
    "state": "SP",
    "neighborhood": "Bela Vista",
    "street": "Av Paulista",
    "number": "1000",
    "complement": "",
    "coordinates": [[-46.655, -23.561]]
  }
}
```

> **Nota:** o backend Postgres retorna 500 (`Object reference not set...`) em vez de 400 quando `address` falta — gap de validação/erro, não endpoint errado nem permissão da AppKey.

### Freight — `POST .../freights/{carrierId}/values/update`

- Body must be a **JSON array** `[{...}]`, not a single object
- Success often returns **204** (not 200)
- Pause **3s** between calls; **30s** before delete (TC-52)

### Scheduled delivery — blocked windows

- Body is an **ISO datetime string**: `"2026-06-19T10:00:00"`
- Not `{dayOfWeek: ...}`

### Shipping policy — `PUT`

- Requires **full body** (`name` + `shippingMethod` at minimum)

### Warehouse — `POST /api/logistics/pvt/configuration/warehouses`

- Minimal payload OK: `{id, name, warehouseDocks: [{dockId, time, cost}]}`

---

## Test entity IDs

| Entity | ID pattern |
|---|---|
| Main dock (test) | `dock-test-01` |
| Cleanup dock | `dock-test-cleanup` |
| Persist docks | `dock-qa-persist-01`, `dock-qa-persist-02` |
| Main warehouse | `wh-test-01` |
| Persist warehouses | `wh-qa-persist-01`, `wh-qa-persist-02` |
| Shipping policy | `sp-test-01` |
| SKU (inventory) | `79` (logisticstest) · `1` (logisticsqa) |
| CEP (freight) | `01310100` |

---

## Execution order

```
Dock → Warehouse → Inventory → Shipping Policy → Freight → Scheduled Delivery → Seller ID
```

Pause ≥ **1s** between calls (≥ **2–3s** on logisticsqa).

---

## Persisted entities (intentional)

After run, leave on account:

- **2 docks** with unique IDs (`dock-qa-persist-01`, `dock-qa-persist-02`)
- **2 warehouses** (`wh-qa-persist-01`, `wh-qa-persist-02`) linked to those docks

Delete all other `*-test-*` entities in cleanup phase.

---

## API reference

- [Logistics API — Docks](https://developers.vtex.com/docs/api-reference/logistics-api#post-/api/logistics/pvt/configuration/docks)
- [Logistics API — Warehouses](https://developers.vtex.com/docs/api-reference/logistics-api#post-/api/logistics/pvt/configuration/warehouses)
- [Seller ID / ST3 — DG API doc](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk)
