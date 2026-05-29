# Product Spec — Task-Based Agentic Workflow (006)

| Field | Value |
|---|---|
| **Module** | Order Management |
| **Pillar** | Agentic Operations / Workflow |
| **Spec** | 006 — Task-Based Agentic Workflow |
| **Status** | Draft |
| **Prototype** | [prototype.html](prototype/prototype.html) · [prototype-wsai.html](prototype/prototype-wsai.html) |

---

## Requisitos Funcionais

### RF-01 · Painel do Assistente

| ID | Requisito |
|---|---|
| RF-01.1 | O sistema deve exibir o status atual do agente de IA e as últimas ações por ele executadas. |
| RF-01.2 | O sistema deve oferecer ações rápidas para os fluxos mais comuns do operador. |
| RF-01.3 | O sistema deve permitir interação conversacional em linguagem natural com o agente de IA. |

---

### RF-02 · Lista de Pedidos

| ID | Requisito |
|---|---|
| RF-02.1 | O sistema deve exibir uma lista de pedidos contendo, no mínimo: identificador do pedido, cliente, itens, valor total, status, origem e indicação de tarefa ativa quando houver workflow secundário em execução. |
| RF-02.2 | O sistema deve oferecer busca e filtros por status, data de criação e outros atributos. |
| RF-02.3 | O sistema deve permitir alternar entre uma visão resumida dos pedidos e uma visão expandida que exponha a árvore de tarefas associadas a cada pedido. |
| RF-02.4 | Ao clicar em um pedido, o sistema deve navegar para a tela de detalhe daquele pedido. |

---

### RF-03 · Detalhe do Pedido

| ID | Requisito |
|---|---|
| RF-03.1 | O sistema deve exibir as informações do pedido (identificador, status, data, origem), dados do cliente, dados de pagamento e o histórico de status do pedido. |
| RF-03.2 | O sistema deve exibir, por item do pedido, cada workflow ativo como uma seção independente e identificada. A ordem das seções deve seguir a sequência de ativação definida pelos gatilhos dos workflows. (ex.: 💳 Pagamentos, 📦 Entrega pela loja, 🎨 Personalização de Produtos). A ordem das seções segue a sequência de ativação definida pelos gatilhos dos workflows. |
| RF-03.3 | Cada etapa do pipeline deve apresentar um dos 4 estados visuais com label textual: **Pendente**, **Completado**, **Cancelado** e **Ignorado**. |
| RF-03.4 | Quando uma tarefa estiver com status Cancelado ou Bloqueado, o sistema deve exibir: motivo registrado, sugestão do agente e ações disponíveis para o operador. |
| RF-03.5 | ~~Variáveis de contexto intermediárias exibidas no detalhe do pedido.~~ *Removido do escopo do MLP.* O detalhe do pedido não deve exibir variáveis de contexto geradas por ações anteriores do workflow. |
| RF-03.6 | O sistema deve exibir workflows secundários disparados para o pedido (ex.: Troca e Devolução), com identificação da origem do disparo (Agente AI, Shopper ou Merchant). |
| RF-03.7 | Quando o disparo do workflow secundário for originado pelo agente, o sistema deve exibir a justificativa gerada pela IA com o nível de confiança associado. |
| RF-03.8 | O tipo de cada workflow associado ao item deve ser visualmente identificável pelo header colorido da seção de pipeline (cor e ícone distintos por workflow). Não há badge separado de `wfType` — a identidade do workflow é comunicada pelo próprio header da seção. |
| RF-03.9 | O sistema deve suportar exibição de pedidos com itens do tipo kit: itens com o mesmo `kitGroupId` devem ser agrupados devem ser agrupados visualmente de forma que o operador identifique que pertencem ao mesmo conjunto, preservando o pipeline individual de cada item dentro do grupo. |
| RF-03.10 | Cada tarefa do pipeline pode conter checkpoints. Quando presentes, o sistema deve exibir o progresso de checkpoints da tarefa (ex.: "2/3 checkpoints concluídos") e destacar checkpoints com falha indicando o `failAction` configurado. |
| RF-03.11 | O operador deve poder registrar uma transição de status de tarefa (Completado / Cancelado / Ignorado) diretamente no detalhe do pedido. Transições para Cancelado devem exigir registro de motivo antes de confirmar. |

---

### RF-04 · Lista e Visualização de Order Jobs

| ID | Requisito |
|---|---|
| RF-04.1 | O sistema deve exibir todos os Order Jobs disponíveis via navegação "Gerenciar Order Jobs", com as seguintes informações por job: ícone, nome, descrição, contagem de pedidos ativos e status (ativo/arquivado). |
| RF-04.2 | O sistema deve permitir abrir um Order Job para edição, onde o operador visualiza os marcos do job e as tarefas associadas a cada marco. |
| RF-04.3 | O sistema deve permitir criar um novo Order Job coletando: nome, modelo base (4 templates disponíveis + estrutura vazia) ícone, descrição e preview dos marcos antes da confirmação. |

---

### RF-05 · Controle de Fluxos (Board Kanban de Workflow)

| ID | Requisito |
|---|---|
| RF-05.1 | O sistema deve exibir o workflow como uma sequência ordenada de etapas, onde cada etapa contém as tarefas a ela associadas. A sequência de etapas deve refletir a ordem do pipeline. |
| RF-05.2 | ~~Barra de progresso (flow bar) com pills numerados.~~ *Removido do escopo do MLP.* O board não deve exibir barra de navegação de pills acima do kanban. |
| RF-05.3 | O sistema deve permitir reordenar etapas. Reordenações devem exigir confirmação do operador antes de serem aplicadas. |
| RF-05.4 | Cada tarefa deve exibir: nome, fornecedor/responsável, categoria, indicador de visibilidade (`user` / `internal`) e botões de editar, dividir e excluir. |
| RF-05.5 | Entre etapas adjacentes deve existir um indicador de transição que comunique se a relação é sequencial ou paralela, e que permita ao operador alterá-la. |
| RF-05.6 | O sistema deve permitir: (a) adicionar **nova etapa** ao final do board via fluxo conversacional; (b) adicionar **nova tarefa dentro de uma etapa existente** via fluxo conversacional separado ("Adicionar aqui"). Os dois fluxos de criação são distintos e independentes. |
| RF-05.7 | Ao selecionar uma tarefa, o operador deve ter acesso a uma interface de edição daquela tarefa. |
| RF-05.8 | O operador deve poder renomear uma etapa sem afetar as tarefas internas a ela. |

---

### RF-06 · Edição de Tarefa via Chat (Painel Lateral)

| ID | Requisito |
|---|---|
| RF-06.1 | O sistema deve detectar a intenção do operador a partir de texto livre e direcionar para o fluxo de configuração adequado, cobrindo: renomear, alterar responsável, definir categoria, alterar visibilidade (`user` / `internal`), inserir script customizado, integrar API externa, conectar servidor MCP, conectar agente do AI Workspace, alterar cor e ativar/desativar tarefa. |
| RF-06.2 | Para scripts customizados, o sistema deve gerar código JavaScript baseado na descrição do operador, com exemplos para os cenários mais comuns (validação de estoque, cálculo de desconto, emissão de NF, etc.). |
| RF-06.3 | Para integrações com API externa, o sistema deve solicitar a URL e sugerir automaticamente o mapeamento de variáveis de resposta. A configuração de API externa deve ser disponível tanto no painel de edição de tarefa existente quanto **inline durante o fluxo de criação de tarefa** (após definir nome, responsável e categoria). |
| RF-06.4 | Para integrações MCP, o sistema deve exibir a lista de servidores disponíveis com suas ferramentas e permitir seleção. |
| RF-06.5 | Para integração com agentes do AI Workspace, o sistema deve exibir os agentes disponíveis com suas variáveis de entrada e saída. |
| RF-06.6 | O operador deve conseguir visualizar o impacto das configurações em andamento antes de confirmar o salvamento. |
| RF-06.7 | O botão de salvar deve ser habilitado somente quando houver alterações válidas pendentes. |
| RF-06.8 | Ao salvar, as mudanças devem ser aplicadas ao board sem recarregar a página. |
| RF-06.9 | O sistema deve permitir adicionar, editar e remover **checkpoints** de uma tarefa via chat: cada checkpoint tem label descritiva e `failAction` (ação recomendada em caso de falha). |

---

### RF-07 · Criação de Etapas, Criação de Tarefas e Divisão

| ID | Requisito |
|---|---|
| RF-07.1 | O sistema deve diferenciar dois fluxos conversacionais de criação: (a) **Criação de etapa** (nova coluna), acionada pelo botão "Nova Etapa" no board; (b) **Criação de tarefa** (novo card em etapa existente), acionada pelo botão "Adicionar aqui" dentro de uma coluna. Os dois fluxos são independentes. |
| RF-07.2 | O fluxo de **criação de etapa** deve coletar: nome da etapa, responsável (com sugestões contextuais pelo catálogo de fornecedores) e categoria. |
| RF-07.3 | O fluxo de **criação de tarefa dentro de uma etapa** deve coletar: nome da tarefa, responsável (com sugestões contextuais pelo catálogo de fornecedores), categoria e, opcionalmente, configuração de API externa inline antes da confirmação. |
| RF-07.4 | O catálogo de fornecedores deve sugerir automaticamente opções de responsável com base no nome da tarefa: tarefas de pagamento sugerem gateways; de separação sugerem CDs; de nota fiscal sugerem emissores NF; de entrega sugerem transportadoras; de personalização sugerem fornecedores de personalização; de instalação sugerem prestadores de serviço, etc. |
| RF-07.5 | Após criação de etapa, o sistema deve oferecer integração via MCP ou agente de IA Workspace. |
| RF-07.6 | O sistema deve permitir dividir uma **tarefa existente** (card) em duas partes via chat, coletando os nomes das partes e exibindo preview antes de confirmar. Ao confirmar, a tarefa original é substituída pelos dois novos cards dentro da mesma etapa (coluna). A estrutura de etapas e arestas do board não é alterada pela operação de divisão. |

---

### RF-08 · Configuração do Agente Orquestrador

| ID | Requisito |
|---|---|
| RF-08.1 | O sistema deve oferecer uma tela de configuração do agente com duas colunas: chat conversacional (esquerda) e painel de configuração (direita). O painel direito contém duas seções: **Order Job** (agrupamento e cobertura por Order Job) e **Agentes & Skills** (3 sub-agentes configuráveis). |
| RF-08.2 | O sistema deve oferecer toggle master para habilitar/desabilitar completamente a orquestração por IA. |
| RF-08.3 | O sistema deve permitir configurar o limiar de confiança do agente (0–100%) por slider, com explicação de impacto. |
| RF-08.4 | O sistema deve permitir configurar o SLA de monitoramento (horas sem movimentação) e o horário de operação (24/7 ou horário comercial). |
| RF-08.5 | O sistema deve oferecer toggles individuais para cada capacidade do agente: detectar pedidos travados, sugerir realocação de estoque, avançar status automaticamente, criar tarefas manuais, cancelar pedidos automaticamente (este último requer ≥ 95% de confiança e aprovação de gerente). |
| RF-08.6 | O sistema deve exibir a cobertura do agente agrupada por **Order Job** (não por workflow individual), mostrando contagem de marcos e pedidos ativos por OJ. |
| RF-08.7 | O sistema deve oferecer 3 sub-agentes configuráveis na seção **Agentes & Skills**, cada um com toggle master e toggles de skill individuais: **(a) 🗺️ Roteamento** — seleciona modo de fulfillment e provider; **(b) ⚙️ Orquestração** — monitora gates, avança status quando sistemas reportam conclusão; **(c) 🚨 Escalação** — detecta inatividade acima do SLA, cria task para operador, dispara alerta Slack. |
| RF-08.8 | O sistema deve permitir expandir/recolher cada sub-agente via accordion para configurar suas skills individualmente. |
| RF-08.9 | O sistema deve permitir configurar canais de notificação: e-mail, Slack e webhook customizado. |
| RF-08.10 | O sistema deve permitir criar regras customizadas via chat com estrutura IF condition THEN action, definindo prioridade (alta/média/baixa) e escopo por Order Job. |
| RF-08.11 | O sistema deve exibir as regras configuradas com toggles de ativação/desativação e opção de exclusão. |
| RF-08.12 | Ao mencionar um domínio de configuração no chat (ex.: "SLA"), o sistema deve identificar e associar a menção ao elemento de configuração correspondente, tornando-o facilmente localizável para o operador. |

---

### RF-09 · Configurações do Workflow

| ID | Requisito |
|---|---|
| RF-09.1 | O sistema deve permitir editar nome, descrição e ícone de um workflow. |
| RF-09.2 | O sistema deve permitir adicionar e remover dependências entre workflows, exibindo quais workflows devem ser concluídos antes e quais este workflow desbloqueia. |
| RF-09.3 | O sistema deve permitir configurar o **gatilho de ativação** do workflow por meio de seleção entre 3 tipos: (a) **Início do pedido** — acionado automaticamente quando o pedido é criado; (b) **Conclusão de um workflow** — acionado quando um workflow selecionado é concluído; (c) **Conclusão de uma tarefa específica** — acionado quando uma tarefa nomeada de um workflow selecionado é concluída. |
| RF-09.4 | Quando o tipo de gatilho for **Conclusão de workflow**, o sistema deve exibir um seletor de workflow de origem. Quando for **Conclusão de tarefa específica**, deve exibir um seletor de workflow de origem seguido de um seletor de tarefa (populado com as etapas do workflow selecionado). |
| RF-09.5 | As alterações de gatilho devem ser salvas junto com as demais configurações do workflow ao clicar em "Salvar". A configuração de gatilho deve ser persistida no objeto do workflow e refletida no label de trigger exibido entre pipelines no detalhe do pedido. |

---

### RF-10 · Navegação e Shell

| ID | Requisito |
|---|---|
| RF-10.1 | O sistema deve seguir o shell do AI Workspace com sidebar escura, itens de navegação (Assistente, Iniciativas, Chats) e histórico de conversas recentes. |
| RF-10.2 | O sistema deve exibir o nome da conta do merchant na sidebar. |
| RF-10.3 | A sidebar deve ser recolhível, ocultando labels e mantendo apenas ícones. |
| RF-10.4 | O sistema deve exibir modais de confirmação para todas as operações destrutivas ou irreversíveis (exclusão de tarefa, reordenação, divisão). |
| RF-10.5 | O sistema deve exibir toasts/modais de sucesso após operações concluídas. |

---

## Requisitos Não Funcionais

### RNF-01 · Performance

| ID | Requisito |
|---|---|
| RNF-01.1 | Transições de tela devem ocorrer em menos de 150ms. |
| RNF-01.2 | Respostas do agente no chat devem iniciar (indicador de digitação) em menos de 300ms após envio da mensagem. |
| RNF-01.3 | O board kanban deve suportar workflows com até 20 tarefas sem degradação perceptível de renderização. |
| RNF-01.4 | Drag-and-drop deve operar a 60fps sem jank perceptível. |

---

### RNF-02 · Usabilidade

| ID | Requisito |
|---|---|
| RNF-02.1 | Todos os fluxos conversacionais devem ser concluíveis em no máximo 5 turnos de chat. |
| RNF-02.2 | Chips de sugestão devem estar presentes em todos os estados de chat para reduzir carga cognitiva do operador. |
| RNF-02.3 | O preview da tarefa em edição deve refletir as mudanças em tempo real, sem aguardar confirmação. |
| RNF-02.4 | Ações destrutivas (excluir, cancelar, dividir) devem sempre exigir confirmação explícita antes de execução. |
| RNF-02.5 | O estado ativo de cada tela deve ser claramente identificável na sidebar (highlight de item ativo). |

---

### RNF-03 · Confiabilidade e Controle Humano

| ID | Requisito |
|---|---|
| RNF-03.1 | Nenhuma ação do agente com risco alto (cancelamento de pedido, realocação de seller) deve ser executada sem aprovação explícita do operador. |
| RNF-03.2 | O limiar mínimo de confiança para ações autônomas de alto impacto deve ser configurável e não deve poder ser definido abaixo de 80%. |
| RNF-03.3 | Todo disparo de workflow secundário pelo agente deve registrar e exibir a justificativa com nível de confiança associado. |
| RNF-03.4 | O operador deve poder desativar completamente a orquestração por IA a qualquer momento via toggle master. |

---

### RNF-04 · Extensibilidade de Integrações

| ID | Requisito |
|---|---|
| RNF-04.1 | O sistema deve suportar integração com servidores MCP sem necessidade de alteração no core do workflow engine. |
| RNF-04.2 | O sistema deve suportar integração com agentes externos do AI Workspace via contratos de variáveis de entrada e saída declarados no catálogo. |
| RNF-04.3 | Scripts customizados devem ser executados em ambiente isolado (sandbox) sem acesso direto ao contexto global da aplicação. |

---

### RNF-05 · Auditabilidade

| ID | Requisito |
|---|---|
| RNF-05.1 | Toda ação executada pelo agente deve ser rastreável: ferramenta utilizada, parâmetros, resultado e timestamp. |
| RNF-05.2 | ~~Variáveis de contexto intermediárias exibidas no detalhe do pedido.~~ *Removido do escopo do MLP.* O sistema deve persistir internamente variáveis de contexto de workflow para fins de auditoria, mas não deve exibi-las na interface de detalhe do pedido. |
| RNF-05.3 | A origem de cada disparo de workflow secundário (Agente AI, Shopper, Merchant) deve ser persistida e exibida no histórico do pedido. |
| RNF-05.4 | Toda transição de status de tarefa (Completado / Cancelado / Ignorado) deve registrar: operador ou agente responsável, timestamp e motivo (obrigatório para Cancelado). |

---

### RNF-06 · Segurança

| ID | Requisito |
|---|---|
| RNF-06.1 | Ações de alto impacto (cancelamento, reordenação de workflow em produção) devem ser restritas por nível de permissão do operador. |
| RNF-06.2 | Regras customizadas do agente devem ser validadas sintaticamente antes de persistência para evitar condições inválidas que travem o engine. |
| RNF-06.3 | Scripts customizados gerados por IA devem passar por revisão humana antes de ativação em ambiente de produção. |

---

### RNF-07 · Acessibilidade

| ID | Requisito |
|---|---|
| RNF-07.1 | Todos os elementos interativos (botões, toggles, inputs) devem ser acessíveis via teclado. |
| RNF-07.2 | Estados visuais críticos (bloqueado, crítico, erro) não devem depender exclusivamente de cor para comunicação. |
