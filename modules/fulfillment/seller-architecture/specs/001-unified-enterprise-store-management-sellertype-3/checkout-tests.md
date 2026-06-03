# Checkout Simulation Tests — Seller Type 3
**Account:** logisticstest  
**Date:** June 1, 2026  
**Owner:** Carol Tourinho  

> ⚠️ **Beta environment** — all tests were executed on `vtexcommercebeta`. Results and API behaviors may differ from `vtexcommercestable`.

---

## Objective

Validate the full checkout flow with seller type 3 — from delivery simulation to place order — covering single-seller, multi-seller, variable-quantity, and **subscription** scenarios.

---

## Environment

| Item | Value |
|---|---|
| Main account (marketplace) | logisticstest |
| Seller Type 3 | `botafogostore` and `farialimastore` |
| Environment | `vtexcommercebeta` (not stable) |
| Base URL — marketplace | `https://logisticstest.vtexcommercebeta.com.br` |
| Base URL — botafogostore | `https://botafogostore.vtexcommercebeta.com.br` |
| Base URL — farialimastore | `https://farialimastore.vtexcommercebeta.com.br` |
| Admin | https://logisticstest.myvtex.com/admin |
| Delivery Options (beta) | https://fftest--lojinhatourinho.myvtex.com/admin/delivery-options |
| Payment method (place order) | Promissória — ID `17` |

---

## Subscriptions setup

| Item | Value |
|---|---|
| Subscription plan | `vtex.subscription.dailysubs` |
| Frequencies | Daily (`1 day`) and weekly (`1 week`) |
| Catalog attachment | `vtex.subscription.dailysubs` (attachment id `3`) |
| Subscribable SKU | **109** — Cerveja Mad Witch Beer - Garrafa 500ml (product id `94`) |
| Attachment field | `vtex.subscription.key.frequency` → `1 day` or `1 week` |

> The Mad Witch Beer SKU is linked to the subscription attachment and included in the plan — it can be purchased as a subscription item at checkout.

---

## Inventory & SKUs

> Fetched via API on 06/01/2026. Mapping: warehouse `faranidc` + `seller-rj` → `botafogostore` | `warehouse-sp` + `seller-sp` → `farialimastore`

| SKU ID | Product Name | botafogostore | farialimastore |
|---|---|---|---|
| **79** | Suporte de Parede para Escalada da Clara | 133 units | 214 units |
| **82** | Roupa Esportiva da Tourinho | — | 136 units |
| **78** | Microfone de Rapper da Mari | — | 139 units |
| **109** | Cerveja Mad Witch Beer - Garrafa 500ml | 100 units (`seller-rj`) | — |

> SKU **109** is the subscription-enabled item used in CT-07. Stock is available in `seller-rj` (botafogostore warehouse).

---

## Required APIs

### Phase 1 — Data gathering

| # | Endpoint | Method | Purpose |
|---|---|---|---|
| 1 | `/api/logistics/pvt/configuration/warehouses` | GET | List all warehouses and identify those with `sellerId` set — this is how to map which warehouse belongs to which seller type 3 |
| 2 | `/api/seller-register/pvt/sellers/{sellerId}` | GET | Confirm `sellerType: 3`, active status, and seller fulfillment endpoint |
| 3 | `/api/logistics/pvt/inventory/skus/{skuId}` | GET | Check SKU stock per warehouse — filter by seller warehouses identified in step 1 |
| 4 | `/api/catalog_system/pub/products/search?sellerId={sellerId}` | GET | List marketplace products associated with the seller |

> **Note:** seller type 3 architecture does not follow the standard catalog flow. The seller → warehouse mapping is done via the `sellerId` field on warehouses (step 1), not through the catalog directly. All endpoints on `logisticstest` require authentication via AppKey/AppToken.

---

### Phase 2 — Checkout simulation

| # | Endpoint | Method | Purpose |
|---|---|---|---|
| 5 | `/api/checkout/pub/orderForms/simulation` | POST | Simulate cart: returns delivery options, SLAs, and prices |

**Base simulation payload:**
```json
{
  "items": [
    {
      "id": "{skuId}",
      "quantity": 1,
      "seller": "{sellerId}"
    }
  ],
  "postalCode": "{zipCode}",
  "country": "BRA"
}
```

---

### Phase 3 — Place order

| # | Endpoint | Method | Purpose |
|---|---|---|---|
| 6 | `GET /api/checkout/pub/orderForm` | GET | Create/get orderForm (returns `orderFormId`) |
| 7 | `POST /api/checkout/pub/orderForm/{orderFormId}/items` | POST | Add items to cart — for subscriptions, include the `attachments` array with `vtex.subscription.dailysubs` and the selected frequency |
| 8 | `POST /api/checkout/pub/orderForm/{orderFormId}/attachments/shippingData` | POST | Set delivery address |
| 9 | `POST /api/checkout/pub/orderForm/{orderFormId}/attachments/paymentData` | POST | Select payment: Promissória ID `17` |
| 10 | `POST /api/checkout/pub/orderForm/{orderFormId}/transaction` | POST | Place order |

---

## Test Cases

**SKUs used in tests** — selected after API-based inventory verification (06/01/2026):

- **SKU 79** — Suporte de Parede para Escalada da Clara · stock in both sellers (`botafogostore` and `farialimastore`)
- **SKU 82** — Roupa Esportiva da Tourinho · stock only in `farialimastore` · used as a contributing item in multi-item scenarios
- **SKU 78** — Microfone de Rapper da Mari · stock only in `farialimastore` · used as a contributing item in multi-item scenarios
- **SKU 109** — Cerveja Mad Witch Beer - Garrafa 500ml · subscribable item · stock in `botafogostore` (`seller-rj`) · used in CT-07 and CT-08

---

### CT-01 — 2 items from botafogostore (distinct SKUs)

| Field | Value |
|---|---|
| SKUs tested | `79` (Suporte de Parede para Escalada da Clara) + `78` (Microfone de Rapper da Mari) |
| Seller | `botafogostore` |
| Quantity | 1 unit each |
| Destination zip code | `01310100` |
| Expected result | Simulation returns botafogostore delivery SLAs for both items |
| Actual result | Both `availability: available` · SLA `Normal` · 2bd · warehouse `seller-rj` · shipping R$4.00 · total R$204.00 · Promissória (ID 17) available |

| Status | ✅ Simulation OK |

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":1,"seller":"botafogostore"},{"id":"78","quantity":1,"seller":"botafogostore"}],"postalCode":"01310100","country":"BRA"}'
```

**Place Order:**

| Field | Value |
|---|---|
| orderGroup | `1636420500079` |
| orderId | [`1636420500079-01`](https://logisticstest.myvtex.com/admin/orders/1636420500079-01) |
| transactionId | `E206756288274E379836987976F1FD92` |
| Email | `carol.test@logisticstest.com` |
| Payment | Promissória ID `17` · R$204.00 (items R$200.00 + shipping R$4.00) |
| Payment submission | `POST vtexpayments.../api/pub/transactions/{txnId}/payments` → HTTP 201 |
| Authorization | `POST vtexpayments.../api/pvt/transactions/{txnId}/authorization-request` `{}` → `Approved` |
| OMS status | `window-to-cancel` → `ready-for-handling` |
| Status | ✅ Place order OK — complete order |

> **Note:** `carolina.rodrigues@vtex.com` failed with `CHK0087 Login required to use a new address` — real VTEX accounts require session cookie authentication to add a new address on `/pub/` endpoints. Test used `carol.test@logisticstest.com` as a workaround.

---

### CT-02 — 2 items from farialimastore (distinct SKUs)

| Field | Value |
|---|---|
| SKUs tested | `82` (Roupa Esportiva da Tourinho) + `78` (Microfone de Rapper da Mari) |
| Seller | `farialimastore` |
| Quantity | 1 unit each |
| Destination zip code | `01310100` |
| Expected result | Simulation returns farialimastore delivery SLAs for both items |
| Actual result | Both `availability: available` · 3 SLAs returned: `Normal` (2bd, R$3.67/R$0.33), `Entrega padrão` (3bd, R$4.58/R$0.42), `lenta` (5bd, R$6.42/R$0.58) · warehouses `seller-sp` and `warehouse-sp` · total R$200.00 |

| Status | ✅ Simulation OK |

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"82","quantity":1,"seller":"farialimastore"},{"id":"78","quantity":1,"seller":"farialimastore"}],"postalCode":"01310100","country":"BRA"}'
```

**Place Order:**

| Field | Value |
|---|---|
| orderGroup | `1636420500081` |
| orderId | [`1636420500081-01`](https://logisticstest.myvtex.com/admin/orders/1636420500081-01) |
| transactionId | `61E17BCA7746418B8359FB7435338C14` |
| Email | `ct02.test@logisticstest.com` |
| Payment | Promissória ID `17` · R$204.00 |
| Payment submission | `POST vtexpayments.../api/pub/transactions/{txnId}/payments` → HTTP 201 |
| Authorization | `POST vtexpayments.../api/pvt/transactions/{txnId}/authorization-request` → `Approved` |
| OMS status | `window-to-cancel` → `ready-for-handling` |
| Status | ✅ Place order OK — complete order |

---

### CT-03 — Cart with items from both sellers (1 from botafogostore, 2 from farialimastore)

| Field | Value |
|---|---|
| SKUs tested | SKU `79` (botafogostore, qty: 1) + SKU `82` (farialimastore, qty: 1) + SKU `78` (farialimastore, qty: 1) |
| Sellers | `botafogostore` + `farialimastore` |
| Quantity | 1 unit per SKU |
| Destination zip code | `01310100` |
| Expected result | Simulation returns SLAs from both sellers; order correctly handles split with 2 items from farialimastore |
| Actual result | All `available` · both sellers returned · botafogo: `Normal` 2bd shipping R$0.00 (`seller-rj`) · farialima: 3 SLAs with shipping · total R$300.00 · no errors |

| Status | ✅ Simulation OK |

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":1,"seller":"botafogostore"},{"id":"82","quantity":1,"seller":"farialimastore"},{"id":"78","quantity":1,"seller":"farialimastore"}],"postalCode":"01310100","country":"BRA"}'
```

**Place Order:**

| Field | Value |
|---|---|
| orderGroup | `1636420500083` |
| orderId `-01` | [`1636420500083-01`](https://logisticstest.myvtex.com/admin/orders/1636420500083-01) · botafogostore · R$104.00 |
| orderId `-02` | [`1636420500083-02`](https://logisticstest.myvtex.com/admin/orders/1636420500083-02) · farialimastore · R$204.00 |
| transactionId | `6A9E54805C264DD2880F31F322D1B64D` |
| Email | `ct03.test@logisticstest.com` |
| Payment | Promissória ID `17` · total R$308.00 |
| Payment submission | `POST vtexpayments.../api/pub/transactions/{txnId}/payments` → HTTP 201 |
| Split | ✅ Order correctly split into 2 sub-orders by seller |
| Authorization | `POST vtexpayments.../api/pvt/transactions/{txnId}/authorization-request` → `Approved` |
| OMS status | `window-to-cancel` → `ready-for-handling` |
| Status | ✅ Place order OK — complete order |

---

### CT-04 — Cart with multiple units per seller

| Field | Value |
|---|---|
| SKUs tested | SKU `79` (botafogostore, qty: 5) + SKU `82` (farialimastore, qty: 6) + SKU `78` (farialimastore, qty: 1) |
| Sellers | `botafogostore` + `farialimastore` |
| Quantity | SKU 79: 5 units · SKU 82: 6 units · SKU 78: 1 unit |
| Destination zip code | `01310100` |
| Expected result | Simulation correctly handles different quantities per SKU |
| Actual result | All `available` · botafogo: `Normal` 2bd shipping R$0.00 · farialima: 3 SLAs, shipping varied with quantity (SKU 82 6 units → R$3.94; SKU 78 1 unit → R$0.06) · total R$1,200.00 · no errors |

| Status | ✅ Simulation OK |

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":5,"seller":"botafogostore"},{"id":"82","quantity":6,"seller":"farialimastore"},{"id":"78","quantity":1,"seller":"farialimastore"}],"postalCode":"01310100","country":"BRA"}'
```

**Place Order:**

| Field | Value |
|---|---|
| orderGroup | `1636420500087` |
| orderId `-01` | [`1636420500087-01`](https://logisticstest.myvtex.com/admin/orders/1636420500087-01) · botafogostore · R$504.00 |
| orderId `-02` | [`1636420500087-02`](https://logisticstest.myvtex.com/admin/orders/1636420500087-02) · farialimastore · R$704.00 |
| transactionId | `A3FB3C6918584D5E85AFB1CD4C8F3952` |
| Email | `ct04.test@logisticstest.com` |
| Payment | Promissória ID `17` · total R$1,208.00 |
| Payment submission | `POST vtexpayments.../api/pub/transactions/{txnId}/payments` → HTTP 201 |
| Split | ✅ Order correctly split into 2 sub-orders by seller |
| Authorization | `POST vtexpayments.../api/pvt/transactions/{txnId}/authorization-request` → `Approved` |
| OMS status | `window-to-cancel` → `ready-for-handling` |
| Status | ✅ Place order OK — complete order |

---

### CT-05 — Same SKU ID, 1 unit from each seller

> ⚠️ This scenario is **not a DG use case**, but is relevant to test how checkout handles the same SKU coming from two distinct seller type 3 sellers.

| Field | Value |
|---|---|
| SKU tested | `79` — available in both sellers (botafogostore: 133 units, farialimastore: 214 units) |
| Sellers | `botafogostore` (qty: 1) + `farialimastore` (qty: 1) |
| Quantity | 1 unit per seller |
| Destination zip code | `01310100` |
| Expected result | Checkout treats as distinct items per seller; no merge conflict |
| Actual result | Both `available` · checkout treated as 2 independent items per seller · botafogo: `Normal` 2bd shipping R$0.00 · farialima: 3 SLAs with shipping · both sellers returned · no merge conflict · no errors |

| Status | ✅ Simulation OK |

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":1,"seller":"botafogostore"},{"id":"79","quantity":1,"seller":"farialimastore"}],"postalCode":"01310100","country":"BRA"}'
```

**Place Order:**

| Field | Value |
|---|---|
| orderGroup | `1636420500091` |
| orderId `-01` | [`1636420500091-01`](https://logisticstest.myvtex.com/admin/orders/1636420500091-01) · botafogostore · R$104.00 |
| orderId `-02` | [`1636420500091-02`](https://logisticstest.myvtex.com/admin/orders/1636420500091-02) · farialimastore · R$104.00 |
| transactionId | `666533F7DBB540DBA52E19DC35FDE828` |
| Email | `ct05.test@logisticstest.com` |
| Payment | Promissória ID `17` · total R$208.00 |
| Payment submission | `POST vtexpayments.../api/pub/transactions/{txnId}/payments` → HTTP 201 |
| Split | ✅ Same SKU 79 correctly split into 2 sub-orders — one per seller |
| Authorization | `POST vtexpayments.../api/pvt/transactions/{txnId}/authorization-request` → `Approved` |
| OMS status | `window-to-cancel` → `ready-for-handling` |
| Status | ✅ Place order OK — complete order |

---

### CT-06 — Free shipping promotion applied only to botafogostore item

> Validate whether the promotions engine correctly applies a free shipping discount scoped to `botafogostore`, without affecting the `farialimastore` item.

| Field | Value |
|---|---|
| SKUs tested | SKU `79` (botafogostore) + SKU `82` (farialimastore) |
| Sellers | `botafogostore` + `farialimastore` |
| Promotion | **"Free shipping seller Botafogostore"** — ID `ffc40e28-ced6-4aa8-bdeb-bfb080741f7e` |
| Promotion config | `idSeller: botafogostore`, `percentualShippingDiscountValue: 100`, `origin: Fulfillment`, `isActive: true` |
| Environment | `vtexcommercestable` (beta returns 503 on the promotions endpoint) |
| Expected result | Free shipping applied only to botafogostore item; farialimastore shipping with original value |
| Actual result | botafogostore shipping came as R$0.00 (**cache** — same quantities as runs before the freight table update) · `ratesAndBenefitsData: null` — promotion active and correctly configured was not recognized by checkout |

| Status | ⏸️ **On hold** — under investigation with Camila Bressiani |

**Interpretation:** The zero shipping was a cache artifact from prior simulations, not evidence that botafogostore has no shipping cost (confirmed on re-runs with different quantities: R$4.00). The promotion scenario had an inconsistency — promotion `ffc40e28-ced6-4aa8-bdeb-bfb080741f7e` was active and correctly configured (`idSeller: botafogostore`, `percentualShippingDiscountValue: 100`), but `ratesAndBenefitsData` came back null. Under investigation with Camila Bressiani.

**Curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":1,"seller":"botafogostore"},{"id":"82","quantity":1,"seller":"farialimastore"}],"postalCode":"01310100","country":"BRA"}'
```

---

### CT-07 — Subscription order: 1 subscribable item from botafogostore

> Validate that a seller type 3 item with a subscription attachment can be purchased alone from a single seller, generating an order and an active subscription in RNS.

| Field | Value |
|---|---|
| SKUs tested | **109** — Cerveja Mad Witch Beer - Garrafa 500ml _(subscription)_ |
| Seller | `botafogostore` |
| Quantity | 1 unit |
| Subscription plan | `vtex.subscription.dailysubs` |
| Subscription frequency | `1 day` _(used in place order — `1 week` fails checkout, see Bugs)_ |
| Destination zip code | `01310100` |
| Expected result | Single-seller checkout · order created in OMS · subscription created in RNS for SKU `109` · seller context preserved on the line item |
| Actual result | Item `available` · SLA `Normal` · warehouse `seller-rj` · item R$18.90 + shipping R$4.00 · total R$22.90 · subscription attachment preserved on OMS line item · **RNS returned 0 subscriptions** after payment approval |

| Status | ⚠️ Place order OK · RNS subscription not created |

**Add item payload (place order — step 2):**
```json
{
  "orderItems": [
    {
      "id": "109",
      "quantity": 1,
      "seller": "botafogostore",
      "attachments": [
        {
          "name": "vtex.subscription.dailysubs",
          "content": {
            "vtex.subscription.key.frequency": "1 week"
          }
        }
      ]
    }
  ]
}
```

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "109",
        "quantity": 1,
        "seller": "botafogostore",
        "attachments": [
          {
            "name": "vtex.subscription.dailysubs",
            "content": {
              "vtex.subscription.key.frequency": "1 week"
            }
          }
        ]
      }
    ],
    "postalCode": "01310100",
    "country": "BRA"
  }'
```

**Place Order:**

| Field | Value |
|---|---|
| Email | `ct07.test@logisticstest.com` |
| CPF | `39053344705` _(valid — `12345678901` fails transaction with ORD007)_ |
| Payment | Promissória ID `17` · R$22.90 (item R$18.90 + shipping R$4.00) |
| Payment submission | `POST vtexpayments.../api/pub/transactions/{txnId}/payments` → HTTP 201 |
| Authorization | `POST vtexpayments.../api/pvt/transactions/{txnId}/authorization-request` `{}` → `Approved` |
| orderGroup | `1636460500097` |
| orderId | [`1636460500097-01`](https://logisticstest.myvtex.com/admin/orders/1636460500097-01) |
| transactionId | `810E47E5FB5947C99793F4FD977681F9` |
| OMS status | `window-to-cancel` · seller `Botafogo store` · line item seller `botafogostore` · attachment `vtex.subscription.dailysubs` / `1 day` |
| Subscription verification | `GET /api/rns/pub/subscriptions?customerEmail=ct07.test@logisticstest.com` → **`[]`** (checked immediately and +15s after authorization) |
| Status | ⚠️ Complete order in OMS · subscription not created in RNS |

> Follow the [Place Order — Full flow APIs](#place-order--full-flow-apis) section. After payment authorization, confirm the subscription was created via RNS — not only the OMS order.
>
> **Note:** place order used frequency `1 day`. Frequency `1 week` (listed in the plan catalog) fails at checkout with `CHK0141`.

---

### CT-08 — Mixed cart: subscription item (botafogostore) + regular item (farialimastore)

> Validate checkout when the cart combines a subscribable item from one seller type 3 with a regular (non-subscription) item from another seller.

| Field | Value |
|---|---|
| SKUs tested | **109** — Cerveja Mad Witch Beer _(subscription, botafogostore)_ + **79** — Suporte de Parede para Escalada da Clara _(regular, farialimastore)_ |
| Sellers | `botafogostore` + `farialimastore` |
| Quantity | 1 unit each |
| Subscription plan | `vtex.subscription.dailysubs` _(SKU 109 only)_ |
| Subscription frequency | `1 week` |
| Destination zip code | `01310100` |
| Expected result | Checkout completes for both sellers · order split by seller (if applicable) · subscription created in RNS **only for SKU 109** · SKU 79 treated as a one-time purchase with no subscription attachment |
| Actual result | _Pending execution_ |

| Status | ⏳ Pending |

**Add item payload (place order — step 2):**
```json
{
  "orderItems": [
    {
      "id": "109",
      "quantity": 1,
      "seller": "botafogostore",
      "attachments": [
        {
          "name": "vtex.subscription.dailysubs",
          "content": {
            "vtex.subscription.key.frequency": "1 week"
          }
        }
      ]
    },
    {
      "id": "79",
      "quantity": 1,
      "seller": "farialimastore"
    }
  ]
}
```

**Simulation curl:**
```bash
curl -s -X POST \
  "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "id": "109",
        "quantity": 1,
        "seller": "botafogostore",
        "attachments": [
          {
            "name": "vtex.subscription.dailysubs",
            "content": {
              "vtex.subscription.key.frequency": "1 week"
            }
          }
        ]
      },
      {
        "id": "79",
        "quantity": 1,
        "seller": "farialimastore"
      }
    ],
    "postalCode": "01310100",
    "country": "BRA"
  }'
```

**Place Order:**

| Field | Value |
|---|---|
| Email | `ct08.test@logisticstest.com` |
| Payment | Promissória ID `17` |
| orderGroup | _TBD_ |
| orderId `-01` | _TBD_ · `botafogostore` · subscription item |
| orderId `-02` | _TBD_ · `farialimastore` · regular item |
| transactionId | _TBD_ |
| Subscription verification | `GET /api/rns/pub/subscriptions?customerEmail=ct08.test@logisticstest.com` — expect **1** active subscription with SKU `109` only; SKU `79` must **not** appear in RNS |
| Status | ⏳ Pending |

> Expected behavior: subscription logic applies only to the line item that carries the `vtex.subscription.dailysubs` attachment. The regular item from `farialimastore` follows the standard one-time purchase flow.

---

## Place Order — Full flow APIs

| Step | Endpoint | Method | Purpose |
|---|---|---|---|
| 1 | `/api/checkout/pub/orderForm` | GET | Create orderForm — returns `orderFormId` |
| 2 | `/api/checkout/pub/orderForm/{orderFormId}/items` | POST | Add items to cart |
| 3 | `/api/checkout/pub/orderForm/{orderFormId}/attachments/clientProfileData` | POST | Set customer data (email, name, document) |
| 4 | `/api/checkout/pub/orderForm/{orderFormId}/attachments/shippingData` | POST | Set delivery address and select SLA |
| 5 | `/api/checkout/pub/orderForm/{orderFormId}/attachments/paymentData` | POST | Select payment — Promissória ID `17` |
| 6 | `/api/checkout/pub/orderForm/{orderFormId}/transaction` | POST | Place order — returns `orderGroup`, `transactionId`, `receiverUri` |
| 7 | `https://{account}.vtexpayments.com.br/api/pub/transactions/{transactionId}/payments` | POST | Submit payment data to vtexpayments gateway — HTTP 201 = success; payment status: `Received` |
| 8 | `https://{account}.vtexpayments.com.br/api/pvt/transactions/{transactionId}/authorization-request` | POST | Authorize transaction — moves status from `Started → Approved`; required for Promissória on beta (requires AppKey/AppToken) |
| 9 | `https://{account}.{env}.com.br/api/checkout/pub/gatewayCallback/{orderGroup}/` | POST | Process order — vtexpayments calls this automatically after approval; can be called manually if needed |
| 10 | `/api/rns/pub/subscriptions` | GET | _(CT-07, CT-08)_ List subscriptions by customer email — confirm subscription was created after order approval |

> All checkout endpoints use the `vtexcommercebeta` environment. The `/pub/` endpoints do not require AppKey/AppToken.
> **Note:** real VTEX account emails (e.g. `@vtex.com`) require session cookie authentication on `/pub/` endpoints to add a new address. Use a test email for unauthenticated flows.

---

## Bugs / Unexpected behaviors

| # | Description | Related CT | Severity | Status |
|---|---|---|---|---|
| 1 | Subscription frequency `1 week` fails checkout (`CHK0141`) even though it is configured in plan `vtex.subscription.dailysubs` catalog frequencies (`1 day, 1 week`). `1 day` works. | CT-07 | Medium | Open |
| 2 | After approved place order with subscription attachment, OMS order is complete but RNS returns **0** subscriptions for the customer email. OMS line item has attachment but `subscriptionData: null`. | CT-07 | High | Open — needs Subscriptions team validation |

---

## Known limitations

- Zip code coverage search by zone is not yet available (align with Derek)

---

## General notes

> _Free space for test session notes_
