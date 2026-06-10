# Estrutura de Navegação — AIW Prototype

Documento descritivo das telas do protótipo, o que cada uma exibe e para onde cada ação leva.

---

## Shell

A aplicação tem uma **sidebar colapsável** à esquerda com os seguintes itens de navegação:

| Item | Destino |
|---|---|
| My Assistant | Tela My Assistant |
| Orders | Home / Orders |
| My Initiatives | Placeholder (não populado) |
| Conversations | Lista de conversas |

No topo direito da aplicação (topbar) há dois dropdowns globais:

- **Settings** → acessa o Gerenciador de Experiências ou Orders Settings
- **My AI Team** → abre o drawer lateral com todos os agentes de IA configurados

---

## 1. Home — Orders

**Rota:** `#/orders`

Tela principal da operação. Exibe uma visão consolidada do dia.

**O que aparece:**
- KPIs operacionais (pedidos, GMV, SLA) com filtros por canal e período
- Visão geral dos workflows: quantos pedidos estão em cada etapa (Pagamento, Fulfillment, Entrega, etc.)
- Tarefas em aberto: cards de tarefas prioritárias que requerem ação do operador
- Lista de pedidos: tabela com pedidos recentes, status, SLA, origem e tarefas ativas associadas

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Clicar em uma tarefa em aberto | Tela Task View |
| Clicar em um pedido na lista | Tela Order Detail |
| Settings → Gerenciador de Experiências | Gerenciador de Experiências (lista de workflows) |

---

## 2. Order Detail

**Rota:** `#/order-detail/:orderId`

Layout split: chat à esquerda, detalhes do pedido à direita.

**O que aparece:**
- **Chat (esquerda):** Agente de orquestração contextualizado para o pedido. Mostra quantidade de itens, valor e SLA. Chips de ação rápida: alterar item, cancelar pedido, verificar SLA, escalar para supervisor.
- **Detalhe (direita):** Informações do pedido (status, data, origem), dados do cliente, dados de pagamento, histórico de status.

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Botão "Todos os Pedidos" ou "Voltar" | Home / Orders |
| Navegar para outro pedido via chat | Order Detail do pedido referenciado |

---

## 3. Task View

**Rota:** `#/task/:taskId`

Tela de detalhe de uma tarefa específica aberta pelo operador.

**O que aparece:**
- Cabeçalho com nome e status da tarefa
- Pedidos impactados pela tarefa (lista com ID, SLA, seller, ETA)
- Informações detalhadas e ações disponíveis para a tarefa

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Voltar | Home / Orders |
| Clicar em um pedido impactado | Order Detail |

---

## 4. My Assistant

**Rota:** `#/assistant`

Tela de assistente genérico — ponto de entrada conversacional sem contexto de pedido.

**O que aparece:**
- Placeholder com campo de texto para perguntas livres
- Instrução para começar por Orders para conteúdo contextualizado

*Esta tela está em estado inicial e não tem navegação para outras telas dentro do protótipo.*

---

## 5. Orchestration View — Agentes de Pedidos

**Rota:** `#/orchestration`

Visão do sistema de agentes de IA processando pedidos em tempo real.

**O que aparece:**
- Lista de pedidos sendo monitorados pelos agentes
- Status de cada agente e ações recentes executadas automaticamente

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Clicar em um pedido | Order Detail |
| Voltar | Home / Orders |

---

## 6. Gerenciador de Experiências

**Rota:** `#/workflow-board`

Tela central para configuração e gestão dos workflows de pedido. Tem uma **sidebar de chat** persistente à esquerda e o canvas de conteúdo à direita.

---

### 6.1 Lista de Workflows

**Modo:** `list` — `#/workflow-board`

**O que aparece:**
- Lista de todos os workflows configurados (ex: Entrega em domicílio, Retirada em loja, Devolução, etc.)
- Para cada workflow: nome, ícone, categoria, número de pedidos ativos, status (publicado/rascunho)
- Botão para criar novo workflow
- Chat à esquerda: o agente pode criar um novo workflow via conversa guiada

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Clicar em um workflow | Workflow Detail (6.2) |
| "Novo workflow" (botão ou chat) | Inicia wizard de criação no chat / abre Wizard modal |
| Voltar | Home / Orders |

---

### 6.2 Workflow Detail

**Modo:** `detail` — `#/workflow-board/:workflowId`

Visão detalhada de um workflow específico. Layout split com chat à esquerda e canvas à direita.

**O que aparece (canvas):**
- Cabeçalho: nome do workflow, ícone, status (publicado/rascunho), data da última edição, versão
- Bloco de Configurações Gerais: trigger, agente AI ativo, dependências com outros workflows
- Etapas (Stages) organizadas em cards verticais, cada uma mostrando:
  - Nome da etapa, categoria (Payment / Fulfillment / Delivery)
  - Tarefas da etapa em ordem (draggable)
  - Botão "Adicionar tarefa" → inicia fluxo no chat
- Botão "Adicionar etapa" ao final da lista
- Barra de ações: "Publicar" quando há alterações não salvas

**O que aparece (chat):**
- Contexto do workflow selecionado
- Chips de ação rápida: adicionar etapa, adicionar tarefa, alterar configurações
- Agente responde perguntas e executa ações sobre o workflow via conversa

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Clicar em uma tarefa (expande o card) | Abre Task Config inline no canvas (6.3) |
| Clicar no nome de uma etapa | Abre edição inline do nome da etapa |
| "Adicionar tarefa" | Inicia fluxo de criação no chat (biblioteca → tipo → visibilidade → responsável → confirmar) |
| Clica em configurações do workflow | Workflow Settings (6.5) |
| Voltar | Lista de Workflows (6.1) |

---

### 6.3 Task Config (inline no Workflow Detail)

Não é uma rota separada — é uma expansão inline dentro do card da etapa no Workflow Detail.

**O que aparece ao expandir uma tarefa:**
- **Status** — se a tarefa está ativa ou inativa no workflow
- **Como executa** — Automática ou Manual
- **Visibilidade** — Interna (operacional) ou Shopper-facing (visível ao cliente)
- **Responsável** — quem ou qual sistema executa a tarefa (ex: Gateway, WMS Operator)
- Campos editáveis inline via formulário
- Botão para citar a tarefa no chat (para o agente comentar sobre ela)
- Botão para remover a tarefa da etapa

---

### 6.4 Stage Detail

**Modo:** `stage` — `#/workflow-board/:workflowId/stage/:stageId`

Tela de detalhe de uma etapa específica. Layout split com chat à esquerda e canvas à direita.

**O que aparece (canvas):**
- Configurações da etapa: nome, categoria, gate de conclusão (condição para avançar), link com a próxima etapa
- Lista de tarefas da etapa com o mesmo comportamento do Workflow Detail

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Voltar | Workflow Detail (6.2) |

---

### 6.5 Workflow Settings

**Modo:** `settings` — `#/workflow-board/:workflowId/settings/:section`

Tela de configurações gerais do workflow. Layout split com chat à esquerda e canvas à direita.

**Seções disponíveis (navegação por abas/seções):**
- **Geral** — nome, ícone, descrição, categoria, trigger de acionamento
- **Agente AI** — ativar/desativar agente de orquestração, configurar comportamento
- **Dependências** — outros workflows que este depende ou que dependem dele
- **Histórico de versões** — log de publicações com data, autor, descrição e deltas de mudança

**Ações e destinos:**

| Ação | Destino |
|---|---|
| Alterar campos via chat | Agente propõe a mudança, operador confirma no action card |
| "Publicar" | Salva a nova versão e atualiza o histórico |
| Voltar | Workflow Detail (6.2) |

---

## Fluxo resumido: do início ao Gerenciador

```
Sidebar → Orders (Home)
  └─ Settings dropdown → Gerenciador de Experiências
       └─ Lista de Workflows
            └─ Clica em um workflow → Workflow Detail + Chat
                 ├─ Expande uma tarefa → Task Config inline
                 ├─ Clica em uma etapa → Stage Detail + Chat
                 └─ Clica em configurações → Workflow Settings + Chat
```

---

## Criação de tarefa via chat (fluxo detalhado)

Ao clicar em **"Adicionar tarefa"** em qualquer card de etapa:

1. O agente posta a mensagem de entrada da etapa no chat
2. **Biblioteca** — agente lista todas as tarefas disponíveis por categoria (Pagamento, Fulfillment, Shipping, etc.) com quick replies. O operador pode escolher uma tarefa existente ou criar uma personalizada.
3. **Como executa** — agente pergunta se é Automática ou Manual (para tarefas da biblioteca, sugere o padrão)
4. **Visibilidade** — agente pergunta: Interna ou Shopper-facing
5. **Responsável** — agente pergunta quem executa (para tarefas da biblioteca, sugere o responsável padrão como quick reply)
6. **Confirmação** — agente apresenta um action card com o resumo completo. Operador confirma ou cancela.
7. Tarefa é adicionada ao card da etapa no canvas.

---

## Criação de workflow via chat (fluxo detalhado)

Ao dizer "criar workflow" ou clicar em "Novo workflow":

1. **Origem** — agente pergunta se quer criar do zero, copiar de um workflow existente ou usar um template da biblioteca
2. **(opcional) Seleção de base** — se copiou, agente lista os workflows disponíveis
3. **Nome** — agente pede o nome do novo workflow
4. **Categoria/Natureza** — agente pede a natureza (Fulfillment Físico, Devolução, Retirada, etc.)
5. **Trigger** — como o workflow é acionado (automático para novos pedidos, manual pelo operador, por solicitação do cliente)
6. **Agente AI** — confirmar se o agente de orquestração deve monitorar e avançar etapas automaticamente
7. **Confirmação** — resumo completo com action card. Operador confirma → workflow é criado e aparece na lista.
