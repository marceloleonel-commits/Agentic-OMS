# Product Brief — Warehouse: ID do seller + rename inStore→Sales App

| Field | Value |
| --- | --- |
| **Spec** | 004 — Warehouse → Seller binding (Admin UI) |
| **Module** | fulfillment / seller-architecture |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Repo da PR** | [`vtex/admin-logistics`](https://github.com/vtex/admin-logistics) — tela `/admin/shipping-strategy/warehouse` |

**Refs:** [Product Vision sellerType=3](../../product-vision.md) (Key Capability #2) · [Doc API sellerId no warehouse](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0#heading=h.o0yjrge1knq) · [Doc VTEX Sales App](https://help.vtex.com/en/docs/tracks/what-is-vtex-sales-app)

---

## O que muda

Três alterações na experiência do Admin de Shipping Strategy:

**1. Nova config "ID do seller"** — vínculo Warehouse → Seller. **O campo já existe na API**: `sellerId` é body parameter **opcional** no `POST /api/logistics/pvt/configuration/warehouses`. Falta só a UI (mudança 100% front).
- Conta **não-sellerType=3**: campo **fixo e desabilitado** (cinza) = seller da conta principal (ex.: "lojinha Tourinho"). Não editável.
- Conta **sellerType=3**: **dropdown com busca textual** para selecionar 1 seller pelo account name. A API já valida se o seller está ativo; se o usuário escolher um seller inativo, o save deve retornar o erro da API ("seller escolhido é inativo").

**2. Rename "inStore" → "Sales App"** — apenas o **rótulo visível** do card atual "Estoque inStore". Sem mudar chaves nem comportamento. Adicionar hyperlink "Saiba mais sobre o VTEX Sales App" apontando para a [documentação em inglês](https://help.vtex.com/en/docs/tracks/what-is-vtex-sales-app).

**3. Remover `/beta` da URL do Admin** — a rota de Shipping Strategy deve deixar de usar `/admin/shipping-strategy/beta/...` e passar a usar `/admin/shipping-strategy/...`.
- Exemplos atuais:
  - `/admin/shipping-strategy/beta/warehouses`
  - `/admin/shipping-strategy/beta/docks`
  - `/admin/shipping-strategy/beta/shipping-policies`

## Fora de escopo

- Backend / API (o `sellerId` já existe).
- Rename dos `id` das chaves de mensagem (só copy).
- Gestão de sellers (vive no Seller Register).

## Sucesso

- sellerType=3: vincular warehouse a um seller pela tela; seller inativo é bloqueado no save pela validação já existente da API.
- Demais contas: campo mostra o seller da conta principal, desabilitado.
- Card "inStore" passa a exibir "Sales App".
- URL do Admin deixa de expor `/beta` nas rotas de Shipping Strategy.

## Em aberto

- Como o front identifica conta sellerType=3:
  - Opção A (preferida): usar a feature flag/capability `sellerTypeLocation` do time de Marketplace.
  - Opção B: verificar se já existe algum sellerType=3 cadastrado na conta.
- Endpoint que lista sellers para busca no dropdown deve retornar apenas sellers `sellerType=3` ou a própria conta principal.
