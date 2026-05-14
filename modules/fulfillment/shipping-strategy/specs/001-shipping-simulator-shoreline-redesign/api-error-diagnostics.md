# API Error Diagnostics — Shipping Simulator

> **Context:** The shipping simulation API (`POST /api/logistics/pvt/shipping/calculate`) returns `slas: []` for all unavailability scenarios without specifying the reason. To surface meaningful error messages in the UI, additional API crossings are required. This document maps each error state to its data source and required API calls.

---

## The core problem

A single empty response masks four distinct root causes:

| Error state | What the simulation returns | What the user sees today |
|---|---|---|
| ZIP code outside all delivery zones | `slas: []` | Generic "no options" |
| No stock in seller's warehouses | `slas: []` | Generic "no options" |
| Carriers excluded by weight/dimensions | `slas: []` | Generic "no options" |
| Logistics configuration error | `slas: []` or HTTP 400 | Generic error |

---

## Scenario 1 — ZIP code outside coverage

**Confirmation source:** reason codes already present in the simulation response (pvt version).

```
POST /api/logistics/pvt/shipping/calculate
```

Look for `reasonCode` in the excluded carriers array within the response:
- `6` — postal code not within carrier's configured range
- `7` — postal code not within carrier's polygon

If all carriers return one of these codes, the root cause is ZIP coverage — no additional API call needed.

**Fallback (if reason codes are not surfaced):**
```
GET /api/logistics/pvt/configuration/carriers/{carrierId}
```
Check `deliveryZones` → validate whether the submitted ZIP falls within configured ranges or polygons.

---

## Scenario 2 — No stock in seller's warehouses

**Confirmation source:** inventory API, one call per SKU.

```
GET /api/logistics/pvt/inventory/items/{skuId}/warehouses
```

**Logic:**
- `totalQuantity > 0` in at least one warehouse → stock exists → root cause is likely coverage or configuration
- `totalQuantity = 0` across all warehouses linked to that seller → root cause is stock

**Note:** The simulation already factors in stock internally. This call is only needed to distinguish "no stock" from "no coverage" in the error message.

**Required inputs:**
- `skuId` — available from the simulation request
- Seller-to-warehouse mapping — available from: `GET /api/fulfillment/pvt/configuration/sellers/{sellerId}`

---

## Scenario 3 — Carriers excluded by weight/dimensions

**No additional API call needed.** The reason codes are already returned by the simulation (pvt version) in the excluded carriers array.

```json
{
  "name": "Total Express",
  "reasonCode": 2
}
```

**Relevant reason codes:**
| Code | Reason |
|---|---|
| 1 | Item cannot be split across multiple packages |
| 2 | Item weight exceeds carrier limit |
| 3 | Item dimensions exceed carrier limit |
| 4 | Item price outside carrier's configured range |
| 5 | Item cubic weight exceeds carrier limit |
| 8 | Carrier does not serve this sales channel |
| 10 | Carrier is inactive |

Full mapping: [`vtex/shipping-simulator-agent → messages/pt.json`](https://github.com/vtex/shipping-simulator-agent)

**Implementation note:** The classic UI currently ignores these reason codes. They are already available in the response — surfacing them is a frontend-only change.

---

## Scenario 4 — Logistics configuration error

This is the most complex case and involves traversing the logistics chain. **Not recommended for the simulator MVP** — better suited as a separate diagnostics/health-check tool.

Relevant APIs if needed:
```
GET /api/logistics/pvt/configuration/shipping-policies
→ confirm policy is active and has at least one carrier linked

GET /api/logistics/pvt/configuration/docks/{dockId}
→ confirm dock is active and has carriers configured

GET /api/logistics/pvt/configuration/carriers/{carrierId}
→ confirm carrier is active
```

The chain to validate: **warehouse → dock → carrier → shipping policy → sales channel**. Each link must be active and correctly associated.

---

## Implementation priority

| Priority | Scenario | Effort | Value |
|---|---|---|---|
| 1 | Surfacing existing reason codes (Scenario 3) | Low — frontend only | High — already in the response |
| 2 | ZIP coverage error (Scenario 1) | Low — reason codes cover it | High — most common user-facing error |
| 3 | No stock (Scenario 2) | Medium — 1 extra API call per SKU | High — differentiates from coverage issue |
| 4 | Configuration error (Scenario 4) | High — multi-API traversal | Low for simulator; better as separate tool |

---

## Proposed UI states (v1)

```
// State 1: No delivery options (generic — use when reason codes unavailable)
"Nenhuma opção de entrega disponível para este CEP."

// State 2: ZIP outside coverage (reason code 6 or 7 on all carriers)
"Este CEP não está coberto por nenhuma política de envio configurada."

// State 3: No stock
"Sem estoque disponível para entrega no seller selecionado."

// State 4: All carriers excluded (reason codes present)
"X transportadoras foram avaliadas, mas todas foram desconsideradas. [Ver motivos]"
```
