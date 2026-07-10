# Product Brief — Warehouse: card "Sellers internos" (ID do seller)

| Field | Value |
| --- | --- |
| **Spec** | 004 — Warehouse → Seller binding (Admin UI) |
| **Module** | fulfillment / seller-architecture |
| **PM** | [Carolina Tourinho](mailto:carolina.rodrigues@vtex.com) |
| **Status** | Draft |
| **Repo da PR** | [`vtex/admin-logistics`](https://github.com/vtex/admin-logistics) — tela `/admin/shipping-strategy/warehouse` |

**Refs:** [Product Vision sellerType=3](../../product-vision.md) (Key Capability #2) · [Doc API sellerId no warehouse](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0#heading=h.o0yjrge1knq)

---

## O que muda

Duas alterações na experiência do Admin de Shipping Strategy:

**1. Novo card "Sellers internos" (ID do seller)** — vínculo Warehouse → Seller. **O campo já existe na API**: `sellerId` é body parameter **opcional** no `POST /api/logistics/pvt/configuration/warehouses`. Falta só a UI (mudança 100% front).

O card é **renderizado condicionalmente**, numa **única versão de UI** com a condicional no front-end:
- Conta **com sellerType=3 ativo**: o card **aparece** com um **dropdown com busca textual** para selecionar 1 seller pelo account name, exibido como "Nome da loja (accountName)". Apenas sellers **ativos** são listados. A API também valida seller inativo; se um inativo chegar ao save, o save retorna o erro da API ("seller escolhido é inativo").
- Conta **sem sellerType=3**: o card **não aparece** na tela. Nessas contas o vínculo é sempre a conta principal e não pode ser alterado, então **esconder o card** (em vez de mostrá-lo desabilitado) evita confundir o cliente com uma configuração que ele não pode mudar.

**2. Remover `/beta` da URL do Admin** — a rota de Shipping Strategy deve deixar de usar `/admin/shipping-strategy/beta/...` e passar a usar `/admin/shipping-strategy/...`.
- Exemplos atuais:
  - `/admin/shipping-strategy/beta/warehouses`
  - `/admin/shipping-strategy/beta/docks`
  - `/admin/shipping-strategy/beta/shipping-policies`

## Fora de escopo

- Backend / API (o `sellerId` já existe).
- Rename dos `id` das chaves de mensagem (só copy).
- Gestão de sellers (vive no Seller Register).

## Sucesso

- sellerType=3 ativo: o campo aparece e permite vincular warehouse a um seller pela tela; seller inativo é bloqueado no save pela validação já existente da API.
- Contas sem sellerType=3: o campo **não é exibido** — nenhuma referência a seller no form.
- Uma **única versão de UI** cobre os dois casos via condicional no front.
- URL do Admin deixa de expor `/beta` nas rotas de Shipping Strategy.

## Em aberto

- Como o front identifica conta sellerType=3 (agora é o **gate** que decide exibir ou ocultar o campo):
  - Opção A (preferida): usar a feature flag/capability `sellerTypeLocation` do time de Marketplace.
  - Opção B: verificar se já existe algum sellerType=3 cadastrado na conta.
- Endpoint que lista sellers para busca no dropdown deve retornar apenas sellers `sellerType=3` ou a própria conta principal.
