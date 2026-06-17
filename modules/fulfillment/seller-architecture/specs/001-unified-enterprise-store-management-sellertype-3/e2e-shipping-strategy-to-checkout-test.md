# E2E — Shipping Strategy → Checkout (Seller Type 3)

**Conta:** `logisticstest` · `vtexcommercebeta`
**Owner:** Carol Tourinho
**Status:** executado em 13/06/2026 — Fase 1 ✅ · Fases 2–3 bloqueadas (checkout beta com 503)

> Combina os dois roteiros existentes: cria a shipping strategy **do zero** (doca → shipping policy → warehouse), vincula tudo a um **seller type 3**, e fecha um pedido **sourçando exclusivamente** das entidades recém-criadas.

---

## Objetivo

Provar que uma shipping strategy criada via API — doca, shipping policy e warehouse novos, ligados a um seller type 3 — resulta em **item disponível na simulação** e em **pedido fechável**, com o fulfillment sourçado do warehouse novo (não dos warehouses antigos do seller).

---

## Premissas e parâmetros

| Item | Valor |
|---|---|
| Conta (marketplace) | `logisticstest` |
| Ambiente | `vtexcommercebeta` |
| Seller Type 3 | `botafogostore` (já existe e ativo) |
| Warehouses reais do seller hoje | `seller-rj`, `faranidc` |
| SKU dedicado | descoberto em runtime — SKU **ativo**, vendável, com **estoque zero** em `seller-rj`/`faranidc` (candidatos: `2`–`8`) |
| CEP destino | `01310100` |
| Pagamento | Promissória ID `17` |
| E-mail checkout | `e2e.test@logisticstest.com` (e-mail de teste evita `CHK0087`) |

> **Por que SKU dedicado:** os SKUs do catálogo (79/82/78/109) já têm estoque em `seller-rj`/`faranidc`. Para o teste provar sourcing, o SKU precisa só existir no warehouse novo — assim o pedido **só** pode ser atendido por ele.

---

## Entidades criadas (todas deletadas no cleanup)

| Tipo | ID | Observação |
|---|---|---|
| Doca | `e2e-dock-01` | `freightTableIds: [e2e-sp-01]` · ativa |
| Shipping policy | `e2e-sp-01` | freight values cobrindo `01000000`–`01999999` · sales channel 1 · ativa |
| Warehouse | `e2e-wh-01` | `warehouseDocks: [e2e-dock-01]` · `sellerId: botafogostore` · ativo |
| Inventory | SKU dedicado em `e2e-wh-01` | quantidade 100 |

---

## Modelagem do vínculo (ordem importa)

```
shipping policy (e2e-sp-01)
   ▲ freightTableIds
doca (e2e-dock-01)
   ▲ warehouseDocks
warehouse (e2e-wh-01)  ──sellerId──▶  botafogostore
   ▲ inventory
SKU dedicado
```

Para o item ficar disponível na simulação de um CEP, **tudo** precisa estar encadeado: warehouse ativo com estoque → doca → shipping policy ativa com freight cobrindo o CEP e o sales channel.

---

## Fase 1 — Criar a shipping strategy do zero

| # | Passo | Endpoint |
|---|---|---|
| 1 | Criar shipping policy | `POST /api/logistics/pvt/shipping-policies` |
| 2 | Criar doca com `freightTableIds: [e2e-sp-01]` | `POST /api/logistics/pvt/configuration/docks` → `/activation` |
| 3 | Criar freight values cobrindo o CEP | `POST /api/logistics/pvt/configuration/freights/e2e-sp-01/values/update` (body **array**, sucesso 204) |
| 4 | Criar warehouse com `warehouseDocks: [e2e-dock-01]` + `sellerId: botafogostore` | `POST /api/logistics/pvt/configuration/warehouses` → `/activation` |
| 5 | Inventory do SKU no warehouse novo | `PUT /api/logistics/pvt/inventory/skus/{sku}/warehouses/e2e-wh-01` |

## Fase 2 — Validar disponibilidade

| # | Passo | Critério |
|---|---|---|
| 6 | Simular cart | `POST /api/checkout/pub/orderForms/simulation` com `{id: sku, seller: botafogostore}` + CEP → `availability: available` |
| 6a | Conferir sourcing | `logisticsInfo[].deliveryIds[].warehouseId == e2e-wh-01` **e** `dockId == e2e-dock-01` |

## Fase 3 — Fechar o pedido

| # | Passo | Endpoint |
|---|---|---|
| 7 | Criar/obter orderForm | `GET /api/checkout/pub/orderForm` |
| 8 | Adicionar item | `POST .../orderForm/{id}/items` |
| 9 | Endereço | `POST .../orderForm/{id}/attachments/shippingData` |
| 10 | Pagamento (Promissória 17) | `POST .../orderForm/{id}/attachments/paymentData` |
| 11 | Place order | `POST .../orderForm/{id}/transaction` → OMS `ready-for-handling` |

---

## Critérios de sucesso

1. Simulação retorna o item **disponível**.
2. `warehouseId` da simulação/pedido = **`e2e-wh-01`** (prova sourcing exclusivo).
3. Pedido fecha e chega a `ready-for-handling`.

## Cleanup (sempre, no fim)

Deletar `e2e-wh-01` → `e2e-dock-01` → `e2e-sp-01` e zerar inventory. Ordem inversa da criação (warehouse antes da doca).

---

## Execução — 13/06/2026

**Runner:** `.agent-tmp-e2e-st3-checkout.py` · SKU dedicado escolhido em runtime: **`2`** (adidas Men's Performance Polo) — estoque zero em `seller-rj`/`faranidc`.

### Fase 1 — criar shipping strategy ✅ (7/7)

| Passo | Resultado |
|---|---|
| Create shipping policy `e2e-sp-01` | **200** |
| Create dock `e2e-dock-01` (`freightTableIds: [e2e-sp-01]`) | **200** |
| Activate dock | **204** |
| Create freight values (array, CEP `01000000–01999999`) | **204** |
| Create warehouse `e2e-wh-01` (`warehouseDocks` + `sellerId: botafogostore`) | **200** |
| Activate warehouse | **204** |
| Set inventory SKU 2 = 100 un. | **200** |

> A criação completa da shipping strategy vinculada a um seller type 3 via API funcionou de ponta a ponta. O vínculo doca↔shipping policy via `freightTableIds` foi aceito.

### Fases 2–3 — simulação + pedido ⛔ bloqueadas (não é a config)

`POST /api/checkout/pub/orderForms/simulation` retornou **HTTP 500** com `code 001 · "(status code: 503)"` em todas as tentativas (com retry/backoff).

**Diagnóstico (read-only, isolando a causa):** o mesmo 500/503 ocorre para:
- SKU `2` / `botafogostore` (config nova)
- SKU `2` / seller `1` (marketplace direto)
- **SKU `79` / `botafogostore`** — combinação que **fechou pedido na Part A (CT-01)**

Como a combinação que já funcionou também falha agora, a causa é **instabilidade do endpoint de checkout/simulation no beta (503 upstream)** — não a shipping strategy criada nem o SKU dedicado.

**Descartado indexação:** re-testado o baseline (SKU 79 + botafogostore) após **70s** de espera, sem criar nada novo — ainda **500/503**. Se fosse propagação da config nova, o baseline (já indexado) teria respondido. Logo, é o checkout que está fora, não indexação. Mesmo assim, o script ganhou um `INDEX_WAIT = 60s` entre Fase 1 e Fase 2 como boa prática para quando o checkout voltar.

### Cleanup ✅
`e2e-wh-01`, `e2e-dock-01`, `e2e-sp-01` deletados no fim. Nada persistido.

### Próximo passo
Re-executar Fases 2–3 quando o checkout do beta normalizar (`python3 .agent-tmp-e2e-st3-checkout.py`). A Fase 1 já está validada. Resultados brutos: `.agent-tmp-e2e-st3-results.json`.

---

## Riscos / pontos a validar

- **Propagação:** criação de shipping strategy pode levar alguns segundos a refletir na simulação (beta). Script faz retry com backoff.
- **Sales channel / trade policy:** se o SKU dedicado não estiver no sales channel coberto pela shipping policy, a simulação não acha. Script valida o SKU (ativo + vendável) antes.
- **Beta instável:** comportamento pode divergir de `vtexcommercestable`.
- **Pagamento:** fluxo de transaction depende do gateway de teste responder (mesma ressalva da Part A).
