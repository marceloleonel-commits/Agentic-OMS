# Spec 003: Inventory Export

## Metadata

| Field | Value |
|---|---|
| **Module** | Inventory Management |
| **Status** | Work in Progress — discovery |
| **Author** | Carolina Tourinho |
| **Created** | July 2026 |
| **Prototype** | [inventory-export-prototype.html](./prototype/inventory-export-prototype.html) |

---

## Problem

O export de estoque no Admin (Estratégia de envio → **Estoques** → **Exportar**) gera sempre uma planilha com **todos os estoques e todos os campos**, entregue apenas por e-mail. Merchants com muitos warehouses recebem a base inteira quando precisam de um recorte, integrações recebem colunas que não usam, e não há feedback nem download na própria tela. Ver [product-brief](./product-brief.md).

---

## What Changes

A tela de Estoques permanece igual. O botão **Exportar** deixa de disparar a solicitação direta e passa a abrir uma **drawer** de configuração, seguida de um **painel de exportações** com progresso e download.

Escopo restrito à **experiência de export**. Não muda o motor de geração do arquivo, o schema do CSV, nem qualquer comportamento de inventário.

---

## User Flow

```
1. Estoques        Usuário clica em "Exportar"
2. Drawer          Seleciona ESTOQUES (1..N)  →  seleciona CAMPOS (default: todos)
3. Confirma        Clica "Exportar" (habilitado quando ≥1 estoque selecionado)
4. Progresso       Painel "Exportações" mostra o processamento (spinner)
5. Concluído       Painel mostra sucesso + contagem de linhas + botão de download
                   Toast confirma que o arquivo também será enviado por e-mail
```

---

## Drawer — Behavior

### Seção 1 · Estoques
- Lista os estoques da conta (`nome` + `ID`), cada um com checkbox.
- Checkbox "selecionar todos" no cabeçalho da seção (com estado indeterminado quando parcial).
- **Nenhum** estoque vem selecionado por padrão — o usuário escolhe.
- Quando há muitos estoques, a lista ganha **rolagem** (mostra ~5 por vez); o cabeçalho da seção e o "selecionar todos" ficam fixos acima da área que rola.
- O botão **Exportar** fica desabilitado enquanto nenhum estoque estiver selecionado.

### Seção 2 · Campos do inventário
- Lista os campos exportáveis (colunas do CSV atual), cada um com checkbox e o nome técnico do campo.
- Checkbox "selecionar todos" no cabeçalho da seção.
- **Todos** os campos vêm selecionados por padrão. Nenhum campo é obrigatório.

### Rodapé
- **Cancelar** (fecha a drawer, descarta seleção) · **Exportar** (confirma).

---

## Exportable Fields

Campos disponíveis, correspondentes às colunas da planilha de export atual:

| Campo (label) | Coluna CSV | Descrição |
|---|---|---|
| ID do SKU | `SkuId` | Identificador do SKU |
| Quantidade total | `TotalQuantity` | Estoque físico total |
| Quantidade reservada | `ReservedQuantity` | Quantidade reservada |
| Quantidade disponível | `AvailableQuantity` | Disponível para venda |
| ID do estoque | `WarehouseId` | Identificador do warehouse |
| Nome do estoque | `WarehouseName` | Nome do warehouse |
| Ref ID | `RefId` | Referência externa do SKU |
| Ativo | `IsActive` | Se o registro está ativo |
| Quantidade ilimitada | `UnlimitedQuantity` | Flag de estoque ilimitado |
| IDs de bloqueio | `LockIds` | Bloqueios aplicados |
| Reservas despachadas | `DispatchedReservations` | Reservas já despachadas |

> Nenhum campo é obrigatório. `[PM INPUT NEEDED: confirmar lista final e se algum campo deve ser sempre incluído.]`

---

## Exports Panel — States

| Estado | UI |
|---|---|
| Processando | Painel "Exportações" com spinner na linha do export |
| Concluído | Check verde + badge com a contagem de linhas + ícone de download ativo |
| E-mail | Toast: "A exportação foi solicitada com sucesso. O arquivo também será enviado para o seu e-mail." |

- O download entrega o CSV **apenas com os estoques e campos selecionados**.
- O envio por e-mail (comportamento atual) é mantido.

---

## Out of Scope

- Motor de geração do arquivo e schema do CSV (reaproveitados do export atual).
- Busca na lista de estoques (follow-up condicional para contas com muitos warehouses).
- Campos de future inventory na planilha (dependente da Spec 002).
- Presets/conjuntos de campos salvos.

---

## Open Questions

- `[PM INPUT NEEDED]` Limite de estoques por export e comportamento em contas com centenas de warehouses.
- `[PM INPUT NEEDED]` Formato/entrega quando muitos estoques são combinados num único arquivo (uma planilha vs. um arquivo por estoque).
- `[PM INPUT NEEDED]` Reuso do endpoint de export atual ou necessidade de parametrização nova no backend.

---

## Changelog

| Date | Author | Change |
|---|---|---|
| Jul 2026 | Carolina Tourinho | Initial spec — drawer-based inventory export com seleção de estoques e campos |
