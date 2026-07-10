# Product Spec — Warehouse: card "Sellers internos"

| Field | Value |
| --- | --- |
| **Spec** | 004 |
| **Repo** | [`vtex/admin-logistics`](https://github.com/vtex/admin-logistics) `master` |
| **Tela** | `/admin/shipping-strategy/warehouse` → `react/WarehouseForm.tsx` |

---

## Contexto

O `sellerType=3` é um novo tipo de seller criado para atender merchants Tier 1 com redes físicas muito grandes (ex.: Dollar General, 23.000 lojas), que hoje precisariam de uma conta franquia por loja.

Diferente das franquias tradicionais, o `sellerType=3` é uma **entidade lógica dentro da conta principal**, sem conta VTEX própria. Ele mantém identidade própria — estoque, preço e credenciais de pagamento — mas toda a gestão (incluindo pedidos) é **centralizada na conta principal**. Não há storefront, checkout ou order management isolado por loja.

O objetivo do fluxo desenhado aqui é habilitar o **vínculo seller↔estoque via UI no admin VTEX**:

- Cada estoque pode ser vinculado a **um único** `sellerType=3`, estabelecendo de quem é aquele estoque.
- Um seller pode ter **N warehouses** (ex.: loja + backstore).
- Sellers **inativos** são automaticamente excluídos das opções disponíveis para o shopper no checkout — o que também os exclui das opções disponíveis ao criar o vínculo com um estoque neste fluxo.
- O card **"Sellers internos"** deve ser exibido **apenas para contas que possuem `sellerType=3`**. A lógica de visibilidade deve viver na própria tela (renderização condicional), para **evitar duas versões da mesma tela**.

---

## Requisitos

### 1. Card "Sellers internos" (ID do seller, renderização condicional)
- **RF1** — Novo card no form (padrão `PageBlock`, igual aos existentes), posicionado **após o card "Origem"** (relação com docas). Título do card: **"Sellers internos"**; subtítulo/descrição: **"Adicionar seller dono do inventário desse estoque"**. **Exibido apenas quando a conta tem sellerType=3 ativo** (ver RF2 e RF2.1).
- **RF2** — Conta **sem sellerType=3 ativo**: o card **não é renderizado** (componente retorna `null`). Sem `Input` desabilitado, sem placeholder, sem qualquer referência a seller no form — evita confundir o cliente com uma config que ele não pode alterar.
- **RF2.1** — **Única versão de UI**: o mesmo componente/build decide exibir ou ocultar o card por meio de uma condicional no front, com base na flag de sellerType=3 ativo (ver "Em aberto"). Não há duas telas nem feature-branch de UI separada.
- **RF3** — Conta **com sellerType=3 ativo**: `Select` single com busca textual (label do campo **"Adicionar seller"**, placeholder **"Selecionar"**); seleção de **1** seller. Cada opção é exibida no formato **"Nome da loja (accountName)"** — ex.: "Loja Centro RJ (lojacentrori)". A busca deve retornar apenas sellers `sellerType=3` ou a própria conta principal.
- **RF3.1** — Abaixo do select, exibir o texto de apoio: **"Apenas sellers ativos podem ser escolhidos"**. O dropdown lista **somente sellers ativos** (a UI comunica e restringe proativamente, não apenas no save).
- **RF4** — Valor persiste no campo `sellerId` do warehouse. **Já existe na API**: `POST /api/logistics/pvt/configuration/warehouses`, `sellerId` = body parameter **opcional** (auth `LogisticsAdmin`). Sem mudança de backend. Ref: [doc API](https://docs.google.com/document/d/1zEt003Q00VVrfvyCX4sYLVjvgFrFnuMLZLoHORVcHGk/edit?tab=t.0#heading=h.o0yjrge1knq).
- **RF4.1** — Defesa em profundidade: a API também valida seller inativo. Caso um seller inativo chegue ao save, a UI deve exibir o erro retornado pela API ("seller escolhido é inativo").

## Aceite

| # | Dado | Quando | Então |
|---|---|---|---|
| AC1 | Conta sem sellerType=3 ativo | abre o form | o card "Sellers internos" **não aparece** na tela |
| AC2 | Conta sellerType=3 ativo | busca no dropdown "Adicionar seller" | encontra sellers pelo nome da loja, exibidos como "Nome da loja (accountName)" |
| AC2.1 | Conta sellerType=3 ativo | abre o dropdown | vê o texto "Apenas sellers ativos podem ser escolhidos" e apenas sellers ativos listados |
| AC3 | Conta sellerType=3 ativo | seleciona 1 seller ativo e salva | warehouse salvo com `sellerId` |
| AC3.1 | Conta sellerType=3 ativo | seleciona seller inativo e salva | API bloqueia e a UI exibe o erro de seller inativo |
| AC5 | Mesma build de UI | conta com e sem sellerType=3 | a mesma versão renderiza (com sellerType=3) ou oculta (sem) o card via condicional |

## Arquivos (PR)
- `react/components/WarehouseSeller.tsx` (novo, clonando `PickupPoints.tsx`; **retorna `null` quando a conta não é sellerType=3 ativo**)
- `react/WarehouseForm.tsx` (incluir o card com a condicional de sellerType=3)
- `react/graphql/` (buscar/listar sellers para o dropdown)
- `messages/*.json` (strings do card)

## Em aberto
- Como identificar conta sellerType=3:
  - Opção A (preferida): feature flag/capability `sellerTypeLocation` do time de Marketplace.
  - Opção B: verificar se já existe algum sellerType=3 cadastrado na conta.
- Endpoint de busca/listagem de sellers para o dropdown deve filtrar apenas `sellerType=3` ou a própria conta principal, e retornar **somente sellers ativos**.
