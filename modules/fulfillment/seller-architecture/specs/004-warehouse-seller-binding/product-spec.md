# Product Spec — Warehouse: ID do seller + rename inStore→Sales App

| Field | Value |
| --- | --- |
| **Spec** | 004 |
| **Repo** | [`vtex/admin-logistics`](https://github.com/vtex/admin-logistics) `master` |
| **Tela** | `/admin/shipping-strategy/warehouse` → `react/WarehouseForm.tsx` |

---

## Requisitos

### 1. Nova config "ID do seller" (card novo)
- **RF1** — Novo card no form (padrão `PageBlock`, igual aos existentes), após "Relação com docas".
- **RF2** — Conta **não-sellerType=3**: `Input` **`disabled`** com o seller da conta principal (cinza, não editável). Mesmo padrão do campo `ID` do warehouse.
- **RF3** — Conta **sellerType=3**: `Select` single com busca textual por account name; seleção de **1** seller. A busca deve retornar apenas sellers `sellerType=3` ou a própria conta principal.
- **RF4** — Valor persiste no campo `sellerId` do warehouse. **Já existe na API**: `POST /api/logistics/pvt/configuration/warehouses`, `sellerId` = body parameter **opcional** (auth `LogisticsAdmin`). Sem mudança de backend. Ref: [doc API](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0#heading=h.o0yjrge1knq).
- **RF4.1** — A API já valida seller inativo. Se o usuário selecionar um seller inativo, o save deve exibir o erro retornado pela API ("seller escolhido é inativo").

### 2. Rename inStore → Sales App
- **RF5** — Trocar rótulos de "inStore" para "Sales App" em `messages/*.json` (chaves `admin/instore-warehouse`, `admin/warehouse-pickup-points`). **Sem** mudar os `id` das chaves nem comportamento.
- **RF6** — Adicionar hyperlink "Saiba mais sobre o VTEX Sales App" → `https://help.vtex.com/en/docs/tracks/what-is-vtex-sales-app` (nova aba).

## Aceite

| # | Dado | Quando | Então |
|---|---|---|---|
| AC1 | Conta não-sellerType=3 | abre o form | campo "ID do seller" = conta principal, desabilitado |
| AC2 | Conta sellerType=3 | busca no dropdown | encontra sellers pelo account name |
| AC3 | Conta sellerType=3 | seleciona 1 seller ativo e salva | warehouse salvo com `sellerId` |
| AC3.1 | Conta sellerType=3 | seleciona seller inativo e salva | API bloqueia e a UI exibe o erro de seller inativo |
| AC4 | Qualquer conta | abre o form | card "inStore" aparece como "Sales App" com o link |

## Arquivos (PR)
- `react/components/WarehouseSeller.tsx` (novo, clonando `PickupPoints.tsx`)
- `react/WarehouseForm.tsx` (incluir o card)
- `react/components/PickupPoints.tsx` (link Sales App)
- `react/graphql/` (buscar/listar sellers para o dropdown)
- `messages/*.json` (rename + strings do card)

## Em aberto
- Como identificar conta sellerType=3:
  - Opção A (preferida): feature flag/capability `sellerTypeLocation` do time de Marketplace.
  - Opção B: verificar se já existe algum sellerType=3 cadastrado na conta.
- Endpoint de busca/listagem de sellers para o dropdown deve filtrar apenas `sellerType=3` ou a própria conta principal.
