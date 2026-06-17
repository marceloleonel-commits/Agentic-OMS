# Postgres Shipping Strategy — Test Report

**Date:** June 12–13, 2026 · **`vtexcommercebeta`** / **`vtexcommercestable`**  
**Script:** [`postgres-shipping-strategy-test-script.md`](./postgres-shipping-strategy-test-script.md)

**Frentes de teste:**
- **A — Bateria por entidade:** [`seller-type-3-and-postgres-tests.md`](./seller-type-3-and-postgres-tests.md)
- **B — E2E shipping strategy → checkout:** [`e2e-shipping-strategy-to-checkout-test.md`](./e2e-shipping-strategy-to-checkout-test.md)
- **C — Validação cruzada de checkout:** [`checkout-cross-environment-validation.md`](./checkout-cross-environment-validation.md)
- **cURLs dos erros:** [`postgres-shipping-strategy-failed-curls.md`](./postgres-shipping-strategy-failed-curls.md)

---

## Credenciais

| Conta | AppKey | Permissão usada |
|---|---|---|
| `logisticstest` | `vtexappkey-logisticstest-UPVYDR` | **Admin / OMS Full Access** |
| `logisticsqa` | `vtexappkey-logisticsqa-ABCRGW` | **Logistics Full Access** (sem `save-seller`) |

---

## Total de testes

| | Total TCs | Pass | Fail / open |
|---|---|---|---|
| **Geral (2 contas)** | **125** | **112** | **13** |
| `logisticstest` | 62 | **61** | **1** |
| `logisticsqa` | 63 | **51** | **12** |

> `logisticstest` passou de 50 → **61** após Retry Session 1 (payload freight/blocked windows corrigido).

---

## Por conta

### `logisticstest` — 61/62 ✅

| Domínio | Pass |
|---|---|
| Docks | 10/10 |
| Warehouses | 11/11 |
| Inventory | 12/12 |
| Shipping Policies | 9/9 |
| Freight Values | 10/10 |
| Scheduled Delivery | 3/3 |
| Seller ID | 6/7 |

### `logisticsqa` — 51/63 ⚠️

| Domínio | Pass |
|---|---|
| Docks | 8/11 na 1ª run (script sem `address`); create OK após correção |
| Warehouses | 11/11 |
| Inventory | 2/12 (GET/PUT → 500 em `wh-test-01`) |
| Shipping Policies | 9/9 |
| Freight Values | 10/10 |
| Scheduled Delivery | 3/3 |
| Seller ID | 4/7 |

---

## Operações executadas (resumo)

- **Docks:** List · Get · Create · Update · Activate · Deactivate · Delete
- **Warehouses:** List · Get · Create · Update · Activate · Deactivate · Delete
- **Inventory:** Get (SKU/WH/dock) · PUT quantity · PUT lead time · PUT unlimited · Get reservations · Get dispatched
- **Shipping Policies:** List · Get · Create · Update (rename, method, weekend) · Activate · Deactivate
- **Freight Values:** Get · Create interval · Update rate/%/time · Delete interval
- **Scheduled Delivery:** Get blocked · Add blocked · Remove blocked
- **Seller ID:** Create WH com sellerId · invalid seller · wrong type · change com estoque · GET sellerId · delivery-zones/sellers

---

## Entidades deixadas na conta (não deletadas)

### `logisticstest`

| Tipo | IDs | Nota |
|---|---|---|
| **Docas** | `dock-qa-persist-01`, `dock-qa-persist-02` | ✅ intencionais |
| **Docas** | `dock-test-01`, `dock-postgres-full-test` | ⚠️ lixo de teste — deletar |
| **Warehouses** | `wh-test-01`, `wh-seller-test`, `wh-seller-wrong-type` | ⚠️ lixo de teste — deletar |
| **Shipping Policy** | `sp-test-01` | ⚠️ lixo de teste — deletar |

### `logisticsqa`

| Tipo | IDs | Doca associada |
|---|---|---|
| **Docas** | `dock-qa-persist-01`, `dock-qa-persist-02` | ✅ intencionais (criadas com `address` no payload) |
| **Warehouses** | `wh-qa-persist-01` | `andreia-dock-01` (existente) |
| **Warehouses** | `wh-qa-persist-02` | `1931fca` (existente) |

> 1ª run: docas **não** criadas (payload sem `address` → 500). Revalidado: **`address` é o campo que faltava**, não o body inteiro. `dock-qa-persist-01/02` criados após correção.

---

## Erros encontrados (resumo)

| # | Conta | O quê | Causa |
|---|---|---|---|
| 1 | logisticstest | WH-S03 | `sellerId=1` aceito com 200 — gap validação seller type |
| 2 | logisticsqa | Docks create/update (1ª run) | Script sem `address` → 500. **Não é bug de plataforma** — campo obrigatório no path Postgres, não documentado como required |
| 3 | logisticsqa | Inventory TC-22..31 | GET/PUT → 500 em warehouse de teste |
| 4 | logisticsqa | WH-S01 | Sem seller ST3 ativo; AppKey sem `save-seller` (403) |
| 5 | logisticsqa | WH-S03/S04 | Validação sellerId inconsistente (200 vs 400 esperado) |
| 6 | ambos | Freight (run 1 logisticstest) | Body objeto vs array — **corrigido no retry** |
| 7 | ambos | Blocked windows (run 1) | Payload `dayOfWeek` vs datetime string — **corrigido** |
| 8 | logisticstest | TC-08/09/19/20 | Retorno 204 — falso negativo (critério errado) |

---

## Atualização 13/06 — E2E + validação cruzada (Frentes B e C)

Além da bateria por entidade (acima), rodei um **teste E2E combinado**: criar uma shipping strategy do zero, **encadear** as entidades e tentar **simular + fechar um pedido** sourçando do warehouse novo. Conta: `logisticstest`.

> Detalhes completos: **Frente B** em [`e2e-shipping-strategy-to-checkout-test.md`](./e2e-shipping-strategy-to-checkout-test.md) (montagem da cadeia + execução) e **Frente C** em [`checkout-cross-environment-validation.md`](./checkout-cross-environment-validation.md) (isolamento da causa: beta × stable, pricing, indexação). Síntese abaixo.

### Cadeia montada e vinculada (Fase 1 ✅ — 7/7)

```
shipping policy (e2e-sp-01)
   ▲ freightTableIds         ← a doca declara qual shipping policy serve
doca (e2e-dock-01)
   ▲ warehouseDocks          ← o warehouse declara de qual doca despacha
warehouse (e2e-wh-01) ──sellerId──▶ botafogostore (seller type 3)
   ▲ inventory
SKU dedicado
```

| Passo | Status |
|---|---|
| Create shipping policy `e2e-sp-01` | 200 |
| Create dock `e2e-dock-01` (`freightTableIds: [e2e-sp-01]`) + activate | 200 / 204 |
| Create freight values (array, CEP `01000000–01999999`) | 204 |
| Create warehouse `e2e-wh-01` (`warehouseDocks` + `sellerId`) + activate | 200 / 204 |
| Set inventory SKU dedicado | 200 |

> A criação e o **vínculo** das entidades (doca↔shipping policy, warehouse↔doca↔seller) foram aceitos pela plataforma. Reconfirmado recriando a cadeia do zero no beta — todos 200/204.

### Erro — simulação de checkout (Fases 2–3 bloqueadas)

`POST /api/checkout/pub/orderForms/simulation` retornou **HTTP 500 (503 upstream)** em todas as tentativas.

**Request:**

```bash
curl -X POST "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "X-VTEX-API-AppKey: vtexappkey-logisticstest-UPVYDR" \
  -H "X-VTEX-API-AppToken: ***" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"2","quantity":1,"seller":"botafogostore"}],"postalCode":"01310100","country":"BRA"}'
```

**Response — HTTP 500:**

```json
{"error":{"code":"001","message":" (status code: 503)","exception":null},"operationId":"daa67ace-90b5-47d0-9a92-681a2f9e1801","fields":{}}
```

### Diagnóstico — é instabilidade do beta, não a config nem o preço

- **Não é a shipping strategy criada:** testei SKU `2`/`botafogostore`, SKU `79`/`botafogostore` (já fechou pedido antes) e SKU `79`/seller `1` — **todos 500/503**.
- **Não é indexação:** baseline já indexado também falha após espera.
- **Não é preço:** falta de preço retorna **HTTP 200 com `availability: withoutPriceFulfillment`**, nunca 500. O 503 quebra antes de avaliar preço/estoque.
- **Stable funciona:** a mesma simulação em `vtexcommercestable` retorna **200**; o fluxo de checkout (simulate → add item → shipping → client profile) flui com entidades antigas.

### Sobre fechar o pedido no stable

No stable o checkout flui, mas o pedido não fechou por **lag de indexação do ambiente**: o índice de preço e o de disponibilidade não convergiram no mesmo SKU (SKU 79 `available` sem preço propagado; SKU 3 com preço propagado mas `withoutStock` apesar de estoque real no `1_1`). Preços foram cadastrados via Pricing API (9 SKUs, `basePrice R$99,90`). Falta a propagação assentar.

---

## Re-execução 15/06 — bateria de 62 TCs (`logisticstest`)

Re-rodada a bateria completa de **62 TCs** (TC-01→TC-55 + WH-S01→WH-S07) em `logisticstest` · beta.

**Resultado consolidado: 61/62** — único fail legítimo **WH-S03** (gap de produto, consistente com 12/06).

| Domínio | Resultado |
|---|---|
| Loading Docks (TC-01→10) | 10/10 ✅ |
| Warehouses (TC-11→21) | 11/11 ✅ |
| Inventory (TC-22→33) | 12/12 ✅ |
| Shipping Policies (TC-34→42) | 9/9 ✅ |
| Freight Values (TC-43→52) | 10/10 ✅ |
| Scheduled Delivery (TC-53→55) | 3/3 ✅ |
| Seller ID (WH-S01→07) | 6/7 (WH-S03 gap) |

**Notas da run:**
- 1ª passada deu 51/62; os 11 fails eram **payload do script** (6 — PUT de shipping policy exige body completo `name`+`shippingMethod`), **rate-limit 429** (3 — transitório) e **checkout/hash** (1). Retry com os fixes fechou em **61/62**.
- **WH-S03** segue como o único gap real (warehouse aceita `sellerId=1`/ST1 com 200; esperado 400).
- **Checkout do beta normalizou:** `orderForms/simulation` voltou a responder **200** (`available`) após dias em 503 — desbloqueia as Fases 2–3 da Frente B.
- Cleanup total executado — nada ficou no beta.

---

## Próximos passos

- [ ] Cleanup lixo em `logisticstest` (`dock-test-01`, `wh-test-*`, `sp-test-01`)
- [x] Re-run docas `logisticsqa` com `address` no payload — `dock-qa-persist-01/02` criados
- [ ] AppKey `logisticsqa` com `save-seller` OU criar ST3 manualmente
- [ ] Escalar WH-S03 com eng Seller Architecture / Postgres
- [ ] Re-executar Frente B (simulação + pedido) — **`checkout/simulation` do beta normalizou (15/06, 200)**, desbloqueado para rodar
- [ ] Validar place order no stable quando a indexação de preço/estoque convergir
