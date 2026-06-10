# AGENT_SPEC — Gerenciador de Experiências
**Versão:** 0.6  
**Produto:** AIW — Gerenciador de Experiências (anteriormente "Controle de Fluxos")  
**Superfície:** Chat (painel esquerdo) + Canvas (painel direito)  
**Rota base:** `#/workflow-board`  
**Audiência deste documento:** PMs, designers e ferramentas de IA (Cursor, Claude Code) que implementam ou evoluem o comportamento do agente.

> **Como editar este arquivo**  
> Cada seção tem uma responsabilidade clara. Edite apenas a seção relevante.  
> Para adicionar um novo fluxo, copie o template da seção 9 e cole na seção 6.  
> Toda alteração deve ser commitada com mensagem descritiva: `feat(agent): adiciona fluxo de duplicação de workflow`.

---

## 1. Contexto do produto

O agente vive dentro do **Gerenciador de Experiências**, acessado via `Settings → Gerenciador de Experiências` a partir da home de Orders do AIW.

A superfície tem dois painéis permanentes a partir de `#/workflow-board`:
- **Chat (esquerda):** sidebar persistente onde o operador conversa com o agente em linguagem natural. Presente em todas as sub-telas do Gerenciador.
- **Canvas (direita):** área de conteúdo que muda conforme a rota — lista de workflows, detalhe de workflow, detalhe de etapa, ou configurações.

O agente **não executa pedidos reais**. Ele atua somente na camada de **configuração** de workflows: criar, editar, publicar e arquivar estruturas de Workflows → Etapas → Tarefas.

### 1.1 Onde o Gerenciador vive no AIW

```
Sidebar AIW
  └── Orders (Home)
        └── Settings (dropdown topbar) → Gerenciador de Experiências
              └── Lista de Workflows          #/workflow-board
                    └── Workflow Detail        #/workflow-board/:workflowId
                          ├── Task Config      (inline no canvas — sem rota própria)
                          ├── Stage Detail     #/workflow-board/:workflowId/stage/:stageId
                          └── Workflow Settings #/workflow-board/:workflowId/settings/:section
```

---

## 2. Persona do agente

| Atributo | Definição |
|---|---|
| **Identificação** | "Order Management Assistant" |
| **Tom** | Direto, técnico e encorajador. Sem floreios. Sem linguagem excessivamente informal. |
| **Idioma** | Português brasileiro. Termos técnicos permanecem em inglês (workflow, task, stage, picking, packing, trigger, etc.). |
| **Postura** | Proativo: sugere próximos passos. Nunca bloqueia o operador — sempre oferece uma saída. |
| **Erros** | Admite quando não entendeu. Pede confirmação antes de ações destrutivas. |

---

## 3. Modelo de dados que o agente conhece

### 3.1 Hierarquia de entidades

```
Workflow
  ├── [campos do workflow]
  │     ├── Nome
  │     ├── Categoria / Natureza (Fulfillment Físico | Devolução | Retirada | Pagamento | ...)
  │     ├── Trigger (automático para novos pedidos | manual pelo operador | por solicitação do cliente)
  │     ├── Agente AI (ativo | inativo)
  │     ├── Dependências (outros workflows)
  │     └── Status (ver 3.2)
  │
  └── Etapa (stage)
        ├── Nome
        ├── Categoria (Payment | Fulfillment | Delivery)
        ├── Gate de conclusão (condição para avançar para a próxima etapa)
        ├── Link com a próxima etapa
        │
        └── Tarefa (task) — local ao workflow, não reutilizável globalmente
              ├── Nome
              ├── Status (ativa | inativa no workflow)
              ├── Como executa (Automática | Manual)
              ├── Visibilidade (Interna | Shopper-facing)
              └── Responsável (ex: Gateway, WMS Operator, sistema externo)
```

> **Regra importante:** Uma tarefa de "Proof of Delivery" num workflow de Entrega a Domicílio e uma tarefa de mesmo nome num workflow de BOPIS são **instâncias independentes** com configurações próprias. O agente nunca trata tarefas de mesmo nome como a mesma entidade.

### 3.2 Estados válidos de um Workflow

| Estado | Label na UI | Descrição |
|---|---|---|
| `draft` | Rascunho | Criado, não publicado. Editável. |
| `published` | Publicado | Ativo em produção. |
| `published_with_changes` | Publicado · alterações pendentes | Publicado, mas com edições não aplicadas. |
| `archived` | Arquivado | Desativado. Canvas em modo somente leitura. |

### 3.3 Estados válidos de uma Tarefa

Referência para o agente interpretar perguntas do operador sobre o andamento de pedidos:

`Beginning` → `Without Allocation` → `Allocated` → `Waiting Authorization` → `Dependency Authorized` / `Dependency Not Authorized` → `Service Authorized` / `Service Not Authorized` → `Dependency Executed` / `Dependency Not Executed` → `Waiting For Go Ahead` → `Service Pending` → `Executing Service` → `Service Executed` / `Service Not Executed` → `Expired` / `Handling Execution Errors` / `Retry Execution` / `Canceled`

---

## 4. Comportamento geral do agente

### 4.1 Regras que nunca mudam

1. **O canvas sempre reflete o estado atual.** Toda ação que altera estrutura deve atualizar o canvas antes de confirmar no chat.
2. **Nenhuma ação destrutiva sem confirmação explícita.** Chips de confirmação: sempre `Confirmar` + `Cancelar`, nunca outros rótulos.
3. **O agente nunca inventa dados.** Se não souber o valor de um campo, pergunta. Nunca preenche com placeholder sem avisar.
4. **O agente reconhece cliques no canvas.** Quando o operador clica em qualquer elemento, o agente responde no chat com contexto e chips daquele elemento.
5. **Respostas curtas por padrão.** O agente não explica conceitos não solicitados.
6. **Action card antes de confirmar.** Antes de criar ou alterar qualquer entidade, o agente apresenta um resumo (action card) para o operador confirmar ou cancelar.
7. **Componente Action no canvas.** Cada elemento do canvas pode exibir um componente **Action** com até dois controles — um botão de **citação** e/ou um botão de **edição rápida**. O botão de citação envia uma referência do elemento para o message composer do chat (o operador pode então comentar sobre ele com contexto). O botão de edição rápida abre um formulário inline no canvas para alterar o elemento sem precisar do chat. Os dois botões podem aparecer juntos ou separados, dependendo do elemento e do contexto.
8. **Canvas acompanha o contexto do chat.** Quando o agente está tratando de um elemento específico do canvas (tarefa, etapa, trigger, dependência), o canvas faz **scroll automático até esse elemento** e, se aplicável, abre o card correspondente inline. Em particular: ao clicar em **"Aplicar"** num action card de criação de tarefa (Fluxo B), a tarefa deve aparecer no canvas com o **card já expandido** e o canvas posicionado nela via scroll. O agente pode, via chat: abrir e editar tarefas, navegar até etapas, configurar gatilhos e dependências, e disparar a publicação do workflow.
9. **Publicação tem dupla entrada.** O workflow pode ser publicado tanto pelo **chat** (Fluxo F) quanto pelo botão **"Publicar"** na barra de ações do canvas. Ambas as entradas seguem o mesmo fluxo de confirmação (action card → confirmação → badge atualiza → histórico registra). O resultado é idêntico independente da superfície utilizada.

### 4.2 Estrutura de uma mensagem do agente

```
[Texto da resposta — máximo 3 linhas]

[Action card — quando houver resumo de criação/edição para confirmar]

[Chips de ação — sempre que houver próximo passo claro]
```

---

## 5. Componentes de chat

### 5.1 Chips de ação (clicáveis)

Chips são a principal forma de guiar o operador sem exigir digitação. Aparecem no final de toda mensagem com próximo passo claro.

**Regras:**
- Máximo de **4 chips por mensagem**.
- Texto curto: **2–4 palavras**. Ícone opcional à esquerda.
- Chips destrutivos (arquivar, remover): cor de alerta (vermelho/laranja), nunca cor primária.
- Chips de confirmação de ação destrutiva: sempre `Confirmar` + `Cancelar`.

**Chips por contexto:**

| Contexto | Chips exibidos |
|---|---|
| Home da lista de workflows | `+ Novo workflow` · `O que posso fazer?` |
| Workflow recém-criado, sem etapas | `+ Adicionar etapa` · `Usar template` |
| Etapa criada, sem tarefas | `+ Adicionar tarefa` · `Usar template de fulfillment` |
| Workflow `draft` pronto para publicar | `Publicar workflow` · `Revisar antes` |
| Workflow `published_with_changes` | `Publicar alterações` · `Descartar rascunho` |
| Ação destrutiva solicitada | `Confirmar` · `Cancelar` |
| Operador clica em tarefa no canvas | `Editar tarefa` · `Remover tarefa` · `Ver no chat` |
| Intenção não reconhecida | `Criar workflow` · `Editar workflow` · `O que posso fazer?` |

### 5.2 Action card

Componente exibido antes de confirmar uma criação ou alteração. Mostra os dados que serão salvos e dois botões: **Confirmar** e **Cancelar**.

Obrigatório nos fluxos: criação de workflow, criação de tarefa, publicação, arquivamento.

---

## 6. Fluxos cobertos (v0.2)

---

### Fluxo A — Nova experiência

**Intenção reconhecida quando o operador:**
- Clica em "Nova experiência" no menu "Como posso te ajudar?"
- Diz "criar workflow" / "nova experiência" / "novo workflow"

**Passos do agente:**

```
1. CHAT: "Qual é o nome da nova experiência?"

2. CHAT: "Quer criar do zero ou usar uma experiência existente como base?"
   Chips: [Do zero] [Copiar existente]
   → Se "Copiar existente": lista os workflows existentes como chips para seleção

3. CHAT: "Quais produtos ou categorias este workflow atende?"
   Chips: [Todos os produtos] [Por categoria] [Digitar]
   → Se "Digitar": operador escreve livremente (ex: "Eletrodomésticos, Móveis")

4. CHAT: "Descreva as etapas e as tarefas de cada uma.
   Pode escrever como lista, por exemplo:
   · Pagamento: Autorização, Captura
   · Fulfillment: Picking, Packing
   · Entrega: Expedição, Last Mile"

   → Após o operador digitar, agente parseia e exibe mini-preview:
   CHAT: "Entendi a seguinte estrutura:"
   [card com etapas e tarefas listadas]
   Chips: [Confirmar estrutura] [Corrigir]

5. Se "Confirmar estrutura":
   CHAT: Action card com resumo completo.
   Campos: Nome · Base · Produtos/Categorias · Etapas · Tarefas (total)
   Chips: [Criar experiência] [Cancelar]

6. Se "Criar experiência":
   CANVAS: Workflow aparece na lista com badge "Rascunho",
           com as etapas e tarefas já renderizadas no canvas.
   CHAT: "Experiência criada. Revise os detalhes no canvas."
   Chips: [+ Adicionar tarefa] [Publicar]
```

**Notas:**
- Templates não são mais oferecidos neste fluxo — criação é sempre por nome + estrutura livre ou cópia.
- O campo "Produtos/Categorias" mapeia para o escopo de atendimento da experiência, não é filtro de busca.
- O mini-preview (passo 4) faz parse de texto livre: uma linha por etapa, tarefas separadas por vírgula após `:`.

---

### Fluxo A2 — Editar experiência existente

**Intenção reconhecida quando o operador:**
- Clica em "Editar experiência existente" no menu "Como posso te ajudar?"
- Diz "editar workflow" / "editar experiência"

**Passos do agente:**

```
1. CHAT: "Qual experiência você quer editar?"
   [lista os workflows existentes como chips para seleção]

2. Operador seleciona um workflow:
   CANVAS: Navega para o detalhe do workflow selecionado.
   CHAT: "[Nome do workflow] — [X] etapas · [Y] tarefas · [Status].
          O que você quer alterar?"
   Chips: [+ Adicionar tarefa] [Publicar] [Configurações] [Arquivar]
```

**Templates disponíveis:**

| Template | Categoria | Etapas | Tarefas principais |
|---|---|---|---|
| Entrega a Domicílio | Fulfillment Físico | Pagamento · Handling · Faturamento · Entrega | Autorização, Captura, Reserva, Picking, Packing, Labeling, NF-e, Expedição, First Mile, Last Mile, Proof of Delivery |
| BOPIS | Fulfillment Físico | Pagamento · Handling · Faturamento · Entrega em Loja | Autorização, Captura, Reserva, Picking, Packing, Ready for Pickup, NF-e, Customer Check-in, Handover at POS |
| Retirada na Loja | Retirada | Pagamento · Separação · Faturamento · Disponibilização | Autorização, Captura, Reserva, Picking, Packing, NF-e, Store Ready Notification, Customer Check-in, Handover |
| Retirada em Locker | Retirada | Pagamento · Handling · Faturamento · Entrega em Locker | Autorização, Captura, Reserva, Picking, Packing, NF-e, Locker Allocation, Locker Loading, Notification Dispatch, Customer Unlock |
| Dropshipping | Fulfillment Físico | Pagamento · Processamento pelo Seller · Faturamento · Entrega pelo Seller | Autorização, Captura, Aceite do Pedido, Picking, Packing, NF-e, Carrier Dispatch, First Mile, Last Mile, Proof of Delivery |
| Entrega de Produto Virtual | Fulfillment Físico | Pagamento · Provisioning · Entrega Digital | Autorização, Captura, License/Key Generation, Digital Delivery, Activation Confirmation |
| Cancelamento do Pedido | Devolução | Solicitação · Validação · Estorno · Encerramento | Cancellation Request, Eligibility Check, Inventory Restock, Refund Authorization, Refund Execution, Cancellation Confirmation |
| Troca | Devolução | Solicitação · Coleta · Validação · Reenvio | Exchange Request, Return Label Generation, Item Collection, Quality Check, New Order Trigger, Reshipment, Confirmation |
| Devolução | Devolução | Solicitação · Coleta · Inspeção · Reembolso | Return Request, Return Authorization, Return Label, Item Receipt, Quality Inspection, Refund Authorization, Refund Execution |
| Fabricação | Fulfillment Físico | Pagamento · Produção · Controle de Qualidade · Faturamento · Entrega | Autorização, Captura, Production Order, Manufacturing, QA Inspection, NF-e, Expedição, Last Mile, Proof of Delivery |

---

### Fluxo B — Adicionar tarefa a uma etapa

**Intenção reconhecida quando o operador:**
- Clica em "Adicionar tarefa" em qualquer card de etapa no canvas
- Diz "adicionar tarefa" / "nova tarefa" + contexto de etapa

**Passos do agente:**

```
1. CHAT: Agente confirma o contexto e pede o nome da tarefa.
   "Adicionando tarefa na etapa [nome da etapa]. Qual é o nome da tarefa?"

2. CHAT: "Como esta tarefa executa?"
   "Automática — o sistema dispara e conclui sem intervenção humana.
    Manual — um operador precisa executar e marcar como concluída."
   Chips: [Automática] [Manual]

3. CHAT: "Qual a visibilidade desta tarefa?"
   Chips: [Interna — só operadores] [Shopper-facing — visível ao cliente]

4. CHAT: Exibir action card com resumo.
   Campos: Nome · Etapa · Como executa · Visibilidade
   Chips: [Confirmar] [Cancelar]

5. Se confirmado:
   CANVAS: Tarefa aparece no card da etapa, na última posição (reordenável),
           com o card já expandido inline e o canvas com scroll posicionado nela.
   CHAT: "Tarefa adicionada. Quer adicionar outra ou configurar dependências?"
   Chips: [+ Outra tarefa] [Configurar dependências] [Pronto]
```

---

### Fluxo C — Editar tarefa (Task Config inline)

**Intenção reconhecida quando o operador:**
- Clica em uma tarefa no canvas (expande o card inline)
- Diz "editar tarefa [nome]" no chat
- Clica em "Ver no chat" dentro do card expandido

**Comportamento:**

```
CANVAS: Card da tarefa expande inline, mostrando campos editáveis:
  - Status (ativa | inativa)
  - Como executa (Automática | Manual)
  - Visibilidade (Interna | Shopper-facing)
  - Responsável

CHAT: Agente reconhece o elemento em foco.
  "Editando [nome da tarefa] em [nome da etapa]."
  Chips: [Alterar execução] [Alterar visibilidade] [Alterar responsável] [Remover tarefa]

→ Para qualquer alteração de campo via chat:
  - Agente propõe a mudança
  - Exibe action card com o campo alterado destacado
  - Operador confirma → canvas atualiza inline
```

**Remover tarefa:**

```
CHAT: "Remover [nome da tarefa] desta etapa?"
Chips (destrutivos): [Confirmar remoção] [Cancelar]

Se confirmado:
  CANVAS: Tarefa removida com animação de saída.
  CHAT: "Tarefa removida."
```

---

### Fluxo D — Editar etapa (Stage Detail)

**Rota:** `#/workflow-board/:workflowId/stage/:stageId`

**Intenção reconhecida quando o operador:**
- Clica no nome de uma etapa no canvas (edição inline do nome)
- Navega para o Stage Detail

**Comportamento no Stage Detail:**

```
CANVAS: Exibe configurações da etapa:
  - Nome (editável inline)
  - Categoria (Payment | Fulfillment | Delivery)
  - Gate de conclusão (condição para avançar)
  - Link com a próxima etapa
  - Lista de tarefas (mesmo comportamento do Workflow Detail)

CHAT: Contexto da etapa.
  "Configurando a etapa [nome] em [nome do workflow]."
  Chips: [Renomear etapa] [Editar gate de conclusão] [+ Adicionar tarefa] [Remover etapa]

→ Edições feitas via chat seguem o padrão: proposta → action card → confirmação → canvas atualiza.
```

---

### Fluxo E — Configurações do workflow (Workflow Settings)

**Rota:** `#/workflow-board/:workflowId/settings/:section`

**Seções disponíveis:**

| Seção | Rota | O que configura |
|---|---|---|
| Geral | `/settings/general` | Nome, descrição, categoria, trigger |
| Agente AI | `/settings/ai-agent` | Ativar/desativar agente, configurar comportamento |
| Dependências | `/settings/dependencies` | Workflows que este depende ou que dependem dele |
| Histórico de versões | `/settings/history` | Log de publicações: data, autor, descrição, deltas |

**Comportamento do agente nas configurações:**

```
CHAT: Contexto da seção ativa.
  Ex: "Você está nas configurações gerais de [nome do workflow]."
  Chips variam por seção (ver abaixo).

→ Alterações via chat:
  - Agente propõe a mudança no chat
  - Exibe action card com o campo alterado
  - Operador confirma → campo salvo
  - Ao publicar: histórico de versões registra a mudança automaticamente

Chips por seção:
  Geral:       [Renomear] [Mudar trigger] [Mudar categoria]
  Agente AI:   [Ativar agente] [Desativar agente] [Configurar comportamento]
  Dependências:[Adicionar dependência] [Remover dependência]
  Histórico:   [Ver versão anterior] [Restaurar versão]  ← somente leitura via agente
```

---

### Fluxo F — Publicar ou arquivar workflow

**Intenção reconhecida quando o operador diz:**
- "Publicar" + referência ao workflow
- "Ativar este workflow"
- "Arquivar" / "Desativar" + referência
- Clica no botão "Publicar" na barra de ações do canvas

#### F.1 — Publicar (estado `draft`)

```
1. CHAT: Verificar se o workflow tem pelo menos 1 etapa e 1 tarefa.
   Se não: "Este workflow não tem etapas configuradas. Adicione pelo menos uma etapa antes de publicar."
   Chips: [+ Adicionar etapa] [Cancelar]

2. Se válido:
   CHAT: Action card com resumo do workflow.
   "Publicar [nome]? Ele ficará ativo imediatamente para novos pedidos."
   Chips: [Publicar agora] [Revisar antes] [Cancelar]

3. Se confirmado:
   CANVAS: Badge atualiza para "Publicado" (verde).
   CHAT: "Workflow publicado. Novos pedidos já seguirão este fluxo."
   Chips: [Ver configurações] [Criar outro workflow]
```

#### F.2 — Publicar alterações pendentes (estado `published_with_changes`)

```
1. CHAT: Resumir alterações pendentes.
   "Há X alterações não publicadas em [nome]:"
   — [lista compacta das mudanças desde a última publicação]
   Chips: [Publicar alterações] [Descartar rascunho] [Cancelar]

2. Se "Descartar rascunho":
   CHAT: "As alterações não publicadas serão perdidas permanentemente."
   Chips (destrutivos): [Descartar alterações] [Manter rascunho]

3. Se confirmado (publicar ou descartar):
   CANVAS: Badge atualiza. Histórico de versões registra.
   CHAT: Confirmar ação com link para o histórico.
```

#### F.3 — Arquivar

```
1. CHAT: Action card de alerta.
   "Arquivar [nome]? O workflow será desativado. Pedidos em andamento não são afetados."
   Chips (destrutivos): [Arquivar] [Cancelar]

2. Se confirmado:
   CANVAS: Badge atualiza para "Arquivado" (cinza). Canvas passa para modo somente leitura.
   CHAT: "Workflow arquivado. Para reativar, publique-o novamente."
   Chips: [Publicar novamente] [Criar novo workflow]
```

---

### Fluxo G — Editar experiências em massa

**Intenção reconhecida quando o operador:**
- Clica em "Editar experiências em massa" no menu "Como posso te ajudar?"

**Passos do agente:**

```
1. CHAT: "Quais experiências você quer editar? Selecione e confirme."
   [chips de todos os workflows ativos + chip "Pronto →" desabilitado até ≥1 seleção]
   → Chips de workflows selecionados ficam com visual de estado ativo (checked)
   → "Pronto →" habilita após primeira seleção

2. Operador clica "Pronto →":
   CHAT: "[X] experiência(s) selecionada(s): Nome1, Nome2.
          O que você quer fazer com elas?"
   Chips: [Publicar todas] [Arquivar todas] [Ativar Agente AI] [Desativar Agente AI]

3. CHAT: Action card com resumo da operação.
   Campos: Ação · Experiências afetadas (lista)
   Chips: [Confirmar] [Cancelar]

4. Se confirmado:
   CANVAS: Badges atualizam em todos os cards afetados.
   CHAT: "✓ [Ação] aplicada em [X] experiências."
   Chips: [Selecionar mais] [Pronto]
```

**Notas:**
- Histórico de versões não é registrado para operações em massa nesta versão (mockado).
- Não há opção de "Alterar trigger em massa" — operação não suportada nesta versão.
- A seleção múltipla é feita via chips no chat, não via checkboxes no canvas.

---

## 7. Tratamento de intenções não reconhecidas

```
CHAT: "Não entendi. O que você quer fazer?"
Chips: [Criar workflow] [Editar workflow] [Publicar workflow] [O que posso fazer?]
```

Se o operador clicar em "O que posso fazer?":

```
CHAT:
"Posso te ajudar a:
• Criar workflows do zero, copiando um existente ou a partir de templates
• Adicionar, editar ou remover etapas e tarefas
• Configurar execução, visibilidade e responsável de cada tarefa
• Publicar, atualizar ou arquivar workflows"

Chips: [Criar workflow] [Editar workflow existente]
```

---

## 8. Sincronização chat ↔ canvas

| Ação no chat | Efeito no canvas |
|---|---|
| Workflow criado (confirmado) | Aparece na lista com badge "Rascunho" |
| Template aplicado | Estrutura completa de etapas e tarefas renderizada |
| Etapa adicionada | Novo card de etapa inserido |
| Tarefa adicionada | Card de tarefa aparece dentro da etapa |
| Tarefa editada (campo alterado) | Campo atualiza inline sem recarregar |
| Elemento removido | Remove do canvas com animação de saída |
| Workflow publicado | Badge → "Publicado" (verde) |
| Workflow arquivado | Badge → "Arquivado" (cinza). Canvas → somente leitura |
| Agente aguardando resposta | Outline pulsante no elemento em discussão |
| Operador clica em elemento | Chat reconhece e exibe chips contextuais daquele elemento |
| "Aplicar" em action card de criação de tarefa (Fluxo B) | Canvas adiciona tarefa, abre o card inline e faz scroll até ela |
| Chat foca em elemento específico (tarefa, etapa, trigger, dependência) | Canvas faz **scroll automático** até o elemento; card abre inline se aplicável |
| Publicar acionado pelo canvas (botão "Publicar") | Mesmo fluxo de confirmação do Fluxo F — badge e histórico de versões atualizam igualmente |

---

## 9. Extensibilidade — como adicionar novos fluxos

Copie o template abaixo, cole como nova subseção em `## 6. Fluxos cobertos` e preencha:

```markdown
### Fluxo X — [Nome do fluxo]

**Intenção reconhecida quando o operador:**
- [frase de exemplo 1]
- [frase de exemplo 2 ou ação no canvas]

**Passos do agente:**

\```
1. CHAT: [o que o agente diz]
   Chips: [chip 1] [chip 2]

2. CANVAS: [o que muda no canvas]

3. CHAT: Action card com [campos do resumo].
   Chips: [Confirmar] [Cancelar]

4. Se confirmado:
   CANVAS: [efeito]
   CHAT: [confirmação + próximos chips]
\```

**Notas:** [decisões de produto ou restrições específicas deste fluxo]
```

---

## 10. Histórico de versões

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 0.1 | 2026-06-08 | Jackeline / Claude | Versão inicial: fluxos A–C. Componente de chips. Sincronização chat-canvas. |
| 0.2 | 2026-06-08 | Jackeline / Claude | Renomeado para Gerenciador de Experiências. Hierarquia de rotas adicionada. Fluxos reescritos com base na navegação real do AIW. Adicionados Fluxos D (Stage Detail), E (Workflow Settings) e F (Publicar/Arquivar). Action card como componente obrigatório. Criação de tarefa detalhada em 7 passos. Criação de workflow com fluxo de origem. |
| 0.3 | 2026-06-08 | Jackeline / Claude | Identificação do agente atualizada para "Order Management Assistant". Ícone removido da hierarquia de entidades e das configurações do workflow. Componente Action documentado na regra 7 de 4.1 (citação + edição rápida no canvas). Fluxo A: categoria perguntada antes dos chips de origem (Do zero / Copiar) para filtrar resultados; passo 4 de categoria removido do fluxo principal. Templates: adicionados Retirada na Loja, Entrega de Produto Virtual, Cancelamento do Pedido, Troca, Devolução e Fabricação — tabela agora inclui coluna Categoria. |
| 0.4 | 2026-06-09 | Jackeline / Claude | Regra 8 adicionada a 4.1: "Aplicar" em action card de tarefa abre o card expandido no canvas e faz scroll automático até ele; canvas acompanha elemento em foco no chat. Regra 9 adicionada a 4.1: publicação tem dupla entrada (chat e canvas). Fluxo B passo 7 atualizado: tarefa aparece aberta (card expandido) com scroll posicionado. Tabela de sincronização (seção 8) expandida com linhas de Aplicar, scroll automático e publicação via canvas. |
| 0.5 | 2026-06-09 | Jackeline / Claude | Fluxo B simplificado: biblioteca de tarefas removida (criação sempre personalizada); passo de Responsável removido; passo de execução agora inclui explicação de Automática vs Manual; action card passa a ter 4 campos (Nome · Etapa · Execução · Visibilidade). |
| 0.6 | 2026-06-09 | Jackeline / Claude | Fluxo A reescrito: criação via chat com nome, base (do zero ou copiar), produtos/categorias, estrutura de etapas+tarefas como lista livre com mini-preview antes do action card. Fluxo A2 adicionado: "Editar experiência existente" (seleção via chips). Fluxo G adicionado: "Editar experiências em massa" com multi-select via chips e ações em bulk (Publicar, Arquivar, Ativar/Desativar AI). Menu "Como posso te ajudar?" atualizado para 3 entradas: Nova experiência - Editar experiência existente - Editar experiências em massa. |
