# Inventory Export

**Spec:** 003 — Inventory Export
**Module path:** inventory-management
**Pillar:** Fulfillment / Availability
**PM:** Carolina Tourinho · carolina.rodrigues@vtex.com
**Status:** Work in Progress — discovery, ainda não pronto para desenvolvimento
**Availability:** Coming Soon

**Related assets:**
- [Inventory Export prototype](./prototype/inventory-export-prototype.html) — drawer-based export flow
- [[Spec 002] Future Inventory](../002-future-inventory/product-brief.md) — V2 scope inclui "future inventory na planilha de export"

---

## Problem

Hoje o export de estoque no Admin (aba **Estoques** em Estratégia de envio) é tudo-ou-nada: o merchant clica em **Exportar** e recebe, por e-mail, uma planilha com **todos os estoques e todos os campos**. Três limitações resultam disso:

1. **Sem seleção de estoque.** Um merchant omnichannel com dezenas ou centenas de warehouses (uma linha por loja física, por exemplo) não consegue exportar só o(s) estoque(s) que quer auditar — recebe a base inteira e precisa filtrar fora do VTEX.
2. **Sem seleção de campos.** A planilha traz sempre as 11 colunas, mesmo quando o merchant só precisa de `SkuId` + `AvailableQuantity`. Isso gera arquivos maiores e mais trabalho de limpeza para integrar com WMS/ERP.
3. **Feedback só por e-mail.** Não há retorno imediato na tela: o merchant sai do Admin sem saber se o arquivo está pronto e precisa esperar/checar a caixa de entrada, sem opção de download direto.

O padrão de export mais recente do **Catálogo** já resolve isso com uma drawer de seleção de campos + download na própria tela. O objetivo é trazer essa mesma experiência para Inventory, adicionando a dimensão que só existe aqui: **qual estoque exportar**.

---

## Business Requirements

1. Ao clicar em **Exportar**, o merchant deve poder selecionar **quais estoques** exportar (um, alguns ou todos), em vez de sempre exportar a base inteira.
2. O merchant deve poder selecionar **quais campos** incluir no arquivo, a partir das colunas hoje disponíveis na planilha. Nenhum campo é obrigatório; por padrão, todos vêm marcados.
3. Após a confirmação, a tela deve dar **feedback imediato** de progresso (processando) e, ao concluir, oferecer **download direto** do arquivo — mantendo também o envio por e-mail já existente.
4. A experiência deve **respeitar o design atual** da tela de Estoques (Shoreline/Admin), mudando apenas o fluxo de export (drawer + painel de progresso).
5. A solução deve escalar para merchants com muitos estoques (busca na lista de estoques é um follow-up condicional, fora do escopo inicial).

## Recommendation

Substituir o export atual (solicitação direta → e-mail) por um fluxo em **drawer de duas etapas** — seleção de estoques e seleção de campos — seguido de um painel de exportações com progresso e download, espelhando o padrão já validado no Catálogo. Reaproveitar o backend de export existente; a mudança é de experiência e de parametrização (quais estoques / quais campos), não de motor de geração do arquivo.

---

## Who Benefits

| Perfil | Necessidade | Situação hoje |
|---|---|---|
| Merchant omnichannel (muitos warehouses) | Exportar só o estoque de uma loja/região específica | Exporta a base inteira e filtra fora do VTEX |
| Operação de inventário / integração | Exportar só os campos relevantes para WMS/ERP | Recebe sempre as 11 colunas |
| Operador no Admin | Saber que o arquivo ficou pronto e baixar na hora | Depende de checar o e-mail |

---

## Release Scope

**V1 — first release.**
- Drawer de export com seleção de **estoques** e de **campos**
- Painel de exportações com estado de processamento → concluído
- **Download direto** na tela, mantendo o envio por e-mail

**Later.**
- Busca na lista de estoques (condicional, para contas com muitos warehouses)
- Inclusão de campos de **future inventory** na planilha (dependente da Spec 002)
- Presets de export (conjuntos de campos salvos)

---

## Open Questions

- `[PM INPUT NEEDED]` Confirmar a lista final de campos exportáveis e se algum deve ser sempre incluído.
- `[PM INPUT NEEDED]` Limite de estoques por export e comportamento para contas com centenas de warehouses.

---

## Changelog

| Date | Author | Change |
|---|---|---|
| Jul 2026 | Carolina Tourinho | Initial draft — drawer-based inventory export, alinhado ao novo export de Catálogo |
