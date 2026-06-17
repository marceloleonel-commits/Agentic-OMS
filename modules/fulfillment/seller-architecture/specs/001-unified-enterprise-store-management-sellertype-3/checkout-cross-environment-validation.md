# Frente C — Validação cruzada de checkout

**Conta:** `logisticstest` · **Ambientes:** `vtexcommercebeta` × `vtexcommercestable`
**Data:** 13/06/2026
**Relação:** aprofundamento da [Frente B (E2E)](./e2e-shipping-strategy-to-checkout-test.md) — existe para **isolar a causa** da falha de checkout da Frente B.

> A Frente B montou a cadeia (shipping policy → doca → warehouse → seller type 3 → inventory) e tentou fechar pedido, mas a simulação no beta retornou 500/503. A Frente C responde: **o erro é da config criada, do preço, da indexação, ou do ambiente?**

---

## Objetivo

Provar **onde** o checkout funciona e **isolar a causa** do `500/503` da Frente B, testando:
1. O mesmo `simulation` com **entidades antigas** (já existentes), não as recém-criadas.
2. O mesmo `simulation` em **beta × stable**.
3. O fluxo de **place order** ponta a ponta no ambiente que responde.
4. **Pricing** e **indexação** como possíveis causas.

---

## Hipóteses testadas e resultado

| # | Hipótese | Teste | Resultado |
|---|---|---|---|
| H1 | É a shipping strategy nova | `simulation` com SKU/seller **antigos** (79/`botafogostore`, 79/`1`, 82/`1`, 78/`1`) no beta | ❌ refutada — **500/503 em todos** |
| H2 | É indexação da config nova | re-simular baseline já indexado após espera | ❌ refutada — segue 500/503 |
| H3 | É falta de preço do SKU | comparar com retorno de SKU sem preço | ❌ refutada — falta de preço dá **200 `withoutPriceFulfillment`**, não 500 |
| H4 | É o ambiente (beta) | mesma `simulation` no **stable** | ✅ confirmada — **stable responde 200** |

**Conclusão:** o `orderForms/simulation` está **fora apenas no beta** (500 encapsulando 503 upstream). A cadeia criada na Frente B e o preço dos SKUs **não têm relação** com o erro.

---

## Evidências

### 1. `simulation` no beta — 500/503 para tudo

```bash
curl -X POST "https://logisticstest.vtexcommercebeta.com.br/api/checkout/pub/orderForms/simulation" \
  -H "X-VTEX-API-AppKey: vtexappkey-logisticstest-UPVYDR" \
  -H "X-VTEX-API-AppToken: ***" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":1,"seller":"botafogostore"}],"postalCode":"01310100","country":"BRA"}'
```

```json
{"error":{"code":"001","message":" (status code: 503)","exception":null},"operationId":"3e889f20-...","fields":{}}
```

Testado também com `79/1`, `82/1`, `78/1`, `2/botafogostore` — **todos 500/503**.

### 2. `simulation` no stable — 200

```bash
curl -X POST "https://logisticstest.vtexcommercestable.com.br/api/checkout/pub/orderForms/simulation" \
  -H "X-VTEX-API-AppKey: vtexappkey-logisticstest-UPVYDR" \
  -H "X-VTEX-API-AppToken: ***" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":"79","quantity":1,"seller":"1"}],"postalCode":"01310100","country":"BRA"}'
```

→ **HTTP 200**, item retornado com `sellerChain: ["1","logisticstestbotafogo"]`.

### 3. Place order no stable (entidades antigas) — flui até pagamento

| Passo | Status |
|---|---|
| `GET /api/checkout/pub/orderForm` | 200 |
| `POST .../items` (add item) | 200 |
| `POST .../attachments/shippingData` | 200 |
| `POST .../attachments/clientProfileData` | 200 |
| `POST .../attachments/paymentData` | **400 `ORD020`** "Pagamento inválido" |

O checkout flui; travou no pagamento porque o SKU vinha `withoutPriceFulfillment` (sem preço → pagamento R$0 rejeitado).

### 4. Pricing — preço cadastrado via Pricing API

Host correto: `https://api.vtex.com/{account}/pricing/prices/{skuId}` (PUT exige **exatamente 2** de `basePrice`/`costPrice`/`markup`).

```bash
curl -X PUT "https://api.vtex.com/logisticstest/pricing/prices/3" \
  -H "X-VTEX-API-AppKey: ..." -H "X-VTEX-API-AppToken: ..." \
  -H "Content-Type: application/json" \
  -d '{"costPrice":50.00,"markup":99.8}'
```

→ **200** para 9 SKUs (1–8 + 79), `basePrice R$99,90` confirmado.

### 5. Indexação — preço × disponibilidade não convergem (stable)

Mesmo com dado correto no master data, o checkout não fechou por **lag de indexação**:

| SKU | Estoque (checkout) | Preço (checkout) | Resultado |
|---|---|---|---|
| 79 | ✅ `available` (wh `1_1`) | ❌ não propagou | `withoutPriceFulfillment` |
| 3 | ❌ `withoutStock` (apesar de 100 un. reais no `1_1`) | ✅ R$99,90 propagou | `withoutStock` |

O SKU 3 prova que o **índice de preço funciona**; o estoque adicionado não propagou no tempo do teste (~5 min de retry). Place order ficou pendente da convergência.

---

## Distinção que fecha o diagnóstico

| Sintoma | Falta de preço | Erro do beta |
|---|---|---|
| HTTP | **200** | **500** |
| Corpo | `availability: withoutPriceFulfillment` | `{"error":{"code":"001","message":"(status code: 503)"}}` |
| Item | aparece, sem preço | nem processa |

Falta de preço **nunca** gera 500 — então o `500/503` do beta é instabilidade de infraestrutura, não preço, não estoque, não a config.

---

## Conclusões

1. **A plataforma de checkout funciona** com a modelagem usada (provado no stable, 200).
2. **O 500/503 é do ambiente beta** — `simulation` indisponível, independente de SKU, seller ou config.
3. **Preço não é a causa** do erro da Frente B.
4. **Place order ponta a ponta** depende de: (a) beta normalizar OU (b) indexação de preço/estoque convergir no stable.

## Próximos passos

- [ ] Re-rodar Frente B (simulação + pedido) quando o `checkout/simulation` do beta voltar — cadeia `e2e-*` deixada pronta no beta.
- [ ] Re-tentar place order no stable após a indexação de preço/estoque assentar.
- [ ] Se o 503 do beta persistir, escalar com o time de Checkout (anexar `operationId`).
