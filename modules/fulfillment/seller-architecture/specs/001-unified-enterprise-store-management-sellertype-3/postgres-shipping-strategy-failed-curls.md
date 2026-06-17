Postgres Shipping Strategy — Curls dos casos que falharam
Data: 12 de junho de 2026 · Ambiente: vtexcommercebeta
Substituir {{APP_KEY}} e {{APP_TOKEN}} pelas credenciais da conta indicada em cada seção.
logisticstest → vtexappkey-logisticstest-UPVYDR (Admin / OMS Full Access)
logisticsqa → vtexappkey-logisticsqa-ABCRGW (Logistics Full Access)
# Resumo logisticsqa (detalhado)
- Warehouses OK: list, get, create, update, activate, deactivate e delete passaram usando docas existentes (andreia-dock-01, 1931fca). CRUD completo sem regressão.
- Frete OK: os 10 TCs de freight values passaram — body em array, sucesso 204. Scheduled delivery (3 TCs) também passou.
- Inventory NÃO passou: TC-22 a TC-31 falharam com HTTP 500. Inner exception BigAccountFullSetNotAllowedException. A conta logisticsqa é big account de QA; PUT/GET de inventory no warehouse de teste (wh-test-01) parece bloqueado nesse perfil. Não foi payload errado — mesmo body passa em logisticstest.
- Docas — 1ª run: TC-03 a TC-07 e TC-10 retornaram 500 porque o POST/UPDATE não incluía address. No Postgres de logisticsqa, address é obrigatório na prática (OpenAPI marca optional). Erro genérico: Object reference not set. Corrigido depois: com {id, name, dockTimeFake, address} → 200. dock-qa-persist-01/02 criados.
- Seller ID: WH-S01 bloqueado (sem ST3 ativo + AppKey sem save-seller). WH-S03/WH-S04 retornaram 200 quando teste esperava 400 — critério frágil nesta conta (sellerId=1 é ID normal).

# Conta: logisticsqa
## TC-03 — Create dock (new id)
HTTP obtido: 500 · Esperado: 200
Causa: Payload sem campo address — obrigatório no path Postgres de logisticsqa. Erro: Object reference not set to an instance of an object.
Status: Corrigido adicionando address no body. dock-qa-persist-01/02 criados com sucesso depois.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "dock-test-01",
  "name": "Dock Teste QA",
  "dockTimeFake": "00:00:00"
}'
```
## TC-04 — Update dock dockTimeFake
HTTP obtido: 500 · Esperado: 200/204
Causa: Update de doca existente sem address no body. Doca andreia-dock-01 retorna address: null no GET.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "andreia-dock-01",
  "name": "andreia-dock-01",
  "dockTimeFake": "00:30:00"
}'
```
## TC-05 — Decrease dockTimeFake
HTTP obtido: 500 · Esperado: 200/204
Causa: Mesmo root cause — falta address.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "andreia-dock-01",
  "name": "andreia-dock-01",
  "dockTimeFake": "00:00:00"
}'
```
## TC-06 — Rename dock
HTTP obtido: 500 · Esperado: 200/204
Causa: Mesmo root cause — falta address.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "andreia-dock-01",
  "name": "Dock QA Renamed",
  "dockTimeFake": "00:00:00"
}'
```
## TC-07 — Change sales channels
HTTP obtido: 500 · Esperado: 200/204
Causa: salesChannels sozinho não substitui address.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "andreia-dock-01",
  "name": "andreia-dock-01",
  "dockTimeFake": "00:00:00",
  "salesChannels": [
    "1"
  ]
}'
```
## TC-10 — Create cleanup dock
HTTP obtido: 500 · Esperado: 200
Causa: Mesmo root cause — falta address.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "dock-test-cleanup",
  "name": "Delete Me",
  "dockTimeFake": "00:00:00"
}'
```
## TC-03 (fix) — Create dock — payload corrigido
HTTP obtido: 200 · Esperado: 200
Causa: Payload corrigido — referência do que funciona.
Status: Este curl passou após correção.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/docks' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "dock-qa-persist-01",
  "name": "Dock QA Persist 01",
  "dockTimeFake": "00:00:00",
  "address": {
    "postalCode": "01310100",
    "country": {
      "acronym": "BRA",
      "name": "Brazil"
    },
    "city": "Sao Paulo",
    "state": "SP",
    "neighborhood": "Bela Vista",
    "street": "Av Paulista",
    "number": "1000",
    "complement": "",
    "coordinates": [
      [
        -46.655,
        -23.561
      ]
    ]
  }
}'
```
## TC-22 — Get inventory SKU+warehouse
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: BigAccountFullSetNotAllowedException — limitação da conta big account no path Postgres.
```bash
curl -X GET \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/items/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```
## TC-23 — Get inventory per dock
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: Mesma exception.
```bash
curl -X GET \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/items/1/docks/andreia-dock-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```
## TC-24 — Get inventory dock+warehouse
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: Mesma exception.
```bash
curl -X GET \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/items/1/docks/andreia-dock-01/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```
## TC-25 — Increase qty
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 500,
  "unlimitedQuantity": false,
  "leadTime": "00:00:00:00"
}'
```
## TC-26 — Decrease qty
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 10,
  "unlimitedQuantity": false,
  "leadTime": "00:00:00:00"
}'
```
## TC-27 — Qty zero
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 0,
  "unlimitedQuantity": false,
  "leadTime": "00:00:00:00"
}'
```
## TC-28 — Unlimited qty
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 0,
  "unlimitedQuantity": true,
  "leadTime": "00:00:00:00"
}'
```
## TC-29 — Increase lead time
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 100,
  "unlimitedQuantity": false,
  "leadTime": "7.00:00:00"
}'
```
## TC-30 — Decrease lead time
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 100,
  "unlimitedQuantity": false,
  "leadTime": "1.00:00:00"
}'
```
## TC-31 — Reset lead time
HTTP obtido: 500 · Esperado: 200
Pré-requisito: Pré-requisito: warehouse wh-test-01 criado e ativo (TC-13/19). SKU=1.
Causa: PUT inventory bloqueado — BigAccountFullSetNotAllowedException.
```bash
curl -X PUT \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/inventory/skus/1/warehouses/wh-test-01' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "quantity": 100,
  "unlimitedQuantity": false,
  "leadTime": "00:00:00:00"
}'
```
## WH-S03 — Create WH com sellerId=1
HTTP obtido: 200 · Esperado: 400
Causa: Teste esperava rejeição por tipo errado, mas sellerId=1 é ID válido na conta (andreia-wh-01 já usa). Critério de teste a revisar — não necessariamente bug.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/warehouses' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "wh-wrong-type-retry",
  "name": "x",
  "sellerId": "1",
  "warehouseDocks": [
    {
      "dockId": "andreia-dock-01",
      "time": "1.00:00:00",
      "cost": 0
    }
  ]
}'
```
## WH-S04 — Trocar sellerId com estoque
HTTP obtido: 200 · Esperado: 400
Pré-requisito: Pré-requisito: criar wh-seller-test, PUT inventory qty=50 (também falha com 500 nesta conta).
Causa: Esperava bloqueio por estoque ativo. Retornou 200 — mas inventory PUT anterior também falhou (BigAccount), então estoque pode nem ter sido gravado.
```bash
curl -X POST \
  'https://logisticsqa.vtexcommercebeta.com.br/api/logistics/pvt/configuration/warehouses' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "wh-seller-test",
  "name": "WH Seller",
  "sellerId": "1",
  "warehouseDocks": [
    {
      "dockId": "andreia-dock-01",
      "time": "1.00:00:00",
      "cost": 0
    }
  ]
}'
```

# Conta: logisticstest
## TC-44 — Create freight (Run 1)
HTTP obtido: 500 · Esperado: 200
Causa: Body enviado como objeto {...} em vez de array [{...}]. Corrigido no Retry Session 1.
Status: Retry: enviar json=[payload] → 204
```bash
curl -X POST \
  'https://logisticstest.vtexcommercebeta.com.br/api/logistics/pvt/configuration/freights/sp-test-01/values/update' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "operationType": 1,
  "zipCodeStart": "01000000",
  "zipCodeEnd": "01999999",
  "weightStart": 1,
  "weightEnd": 10000,
  "absoluteMoneyCost": "5.00",
  "timeCost": "2.00:00:00",
  "country": "BRA"
}'
```
## TC-45 — Increase fixed rate (Run 1)
HTTP obtido: 500 · Esperado: 200
Causa: Mesmo root cause — body não-array.
Status: Corrigido no retry.
```bash
curl -X POST \
  'https://logisticstest.vtexcommercebeta.com.br/api/logistics/pvt/configuration/freights/sp-test-01/values/update' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "operationType": 2,
  "absoluteMoneyCost": "35.00",
  "zipCodeStart": "01000000",
  "zipCodeEnd": "01999999"
}'
```
## TC-54 — Add blocked window (Run 1)
HTTP obtido: 400 · Esperado: 200
Causa: Body errado — API espera string datetime ISO, ex: "2026-06-19T10:00:00".
Status: Corrigido no retry.
```bash
curl -X POST \
  'https://logisticstest.vtexcommercebeta.com.br/api/logistics/pvt/configuration/carriers/sp-test-01/adddayofweekblocked' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "dayOfWeek": 0,
  "timeLimit": "23:59:59"
}'
```
## TC-55 — Remove blocked window (Run 1)
HTTP obtido: 400 · Esperado: 200
Causa: Mesmo root cause.
Status: Corrigido no retry.
```bash
curl -X POST \
  'https://logisticstest.vtexcommercebeta.com.br/api/logistics/pvt/configuration/carriers/sp-test-01/removedayofweekblocked' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "dayOfWeek": 0
}'
```
## WH-S03 — Create WH com sellerId=1
HTTP obtido: 200 · Esperado: 400
Causa: Teste ST3 esperava rejeição. Retornou 200. Critério a validar com eng — sellerId=1 pode não ser proxy confiável de SellerType 1.
```bash
curl -X POST \
  'https://logisticstest.vtexcommercebeta.com.br/api/logistics/pvt/configuration/warehouses' \
  -H 'X-VTEX-API-AppKey: {{APP_KEY}}' \
  -H 'X-VTEX-API-AppToken: {{APP_TOKEN}}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "id": "wh-seller-wrong-type",
  "name": "WH Wrong Type",
  "sellerId": "1",
  "warehouseDocks": [
    {
      "dockId": "dock-test-01",
      "time": "1.00:00:00",
      "cost": 0
    }
  ]
}'
```