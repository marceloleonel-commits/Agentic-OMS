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
| RF-01.1 | O sistema deve exibir uma tela inicial com o assistente de IA ativo, apresentando o status do agente e as últimas ações executadas. |
| RF-01.2 | O sistema deve oferecer ações rápidas em forma de chips clicáveis para os fluxos mais comuns do operador. |
| RF-01.3 | O sistema deve permitir interação conversacional em linguagem natural com o agente de IA. |

---

### RF-02 · Lista de Pedidos

| ID | Requisito |
|---|---|
| RF-02.1 | O sistema deve exibir uma tabela de pedidos com as colunas: ID, cliente, itens, total, status, origem e tarefa ativa (quando houver workflow secundário em execução). |
| RF-02.2 | O sistema deve oferecer busca e filtros por status, data de criação e outros atributos. |
| RF-02.3 | O sistema deve permitir alternar entre a visão de tabela plana e a visão de árvore de tarefas (task tree) por pedido. |
| RF-02.4 | Ao clicar em um pedido, o sistema deve navegar para a tela de detalhe daquele pedido. |

---

### RF-03 · Detalhe do Pedido

| ID | Requisito |
|---|---|
| RF-03.1 | O sistema deve exibir as informações do pedido (ID, status, data, origem) e dados do cliente, pagamento e timeline de status. |
| RF-03.2 | O sistema deve exibir, por item do pedido, dois pipelines separados: workflow de pagamento e workflow operacional padrão. |
| RF-03.3 | Cada etapa dos pipelines deve apresentar seu estado visual: concluída, ativa, aguardando ou bloqueada. |
| RF-03.4 | Quando uma tarefa estiver bloqueada, o sistema deve exibir: motivo do bloqueio, saída da ação que causou o bloqueio (contexto JSON), sugestão do agente e ações disponíveis para o operador. |
| RF-03.5 | O sistema deve exibir variáveis de contexto produzidas por ações anteriores do workflow (ex.: `validarEstoque.disponivel: 2`). |
| RF-03.6 | O sistema deve exibir workflows secundários disparados para o pedido (ex.: Troca e Devolução), com identificação da origem do disparo (Agente AI, Shopper ou Merchant). |
| RF-03.7 | Quando o disparo do workflow secundário for originado pelo agente, o sistema deve exibir a justificativa gerada pela IA com o nível de confiança associado. |

---

### RF-04 · Lista e Visualização de Workflows

| ID | Requisito |
|---|---|
| RF-04.1 | O sistema deve exibir um grid com todos os workflows disponíveis, mostrando ícone, nome, descrição, contagem de tarefas e pedidos ativos. |
| RF-04.2 | O sistema deve permitir abrir um workflow para edição no board kanban. |
| RF-04.3 | O sistema deve exibir um botão para criação de novo workflow. |

---

### RF-05 · Board Kanban de Workflow

| ID | Requisito |
|---|---|
| RF-05.1 | O sistema deve exibir o workflow como um board kanban com uma coluna por tarefa, refletindo a sequência do pipeline. |
| RF-05.2 | O sistema deve exibir uma barra de progresso (flow bar) com pills numerados correspondentes às tarefas, com indicação de estado ativo/inativo por cores. |
| RF-05.3 | O sistema deve permitir reordenar tarefas por drag-and-drop, com confirmação modal antes de aplicar a mudança. |
| RF-05.4 | Cada card de tarefa deve exibir: nome, fornecedor/responsável, badge de categoria e botões de editar, dividir e excluir. |
| RF-05.5 | Entre colunas adjacentes deve existir um conector clicável que indica se a transição está ativa (sequencial) ou inativa (paralela), alterável via modal. |
| RF-05.6 | O sistema deve permitir adicionar nova coluna/tarefa ao final do board. |
| RF-05.7 | Ao clicar em uma tarefa, deve abrir um painel lateral com interface de chat para edição conversacional. |

---

### RF-06 · Edição de Tarefa via Chat (Painel Lateral)

| ID | Requisito |
|---|---|
| RF-06.1 | O sistema deve detectar a intenção do operador a partir de texto livre e direcionar para o fluxo de configuração adequado, cobrindo: renomear, alterar responsável, definir categoria, adicionar ações, inserir script customizado, integrar API externa, conectar servidor MCP, conectar agente do AI Workspace, alterar cor e ativar/desativar tarefa. |
| RF-06.2 | Para scripts customizados, o sistema deve gerar código JavaScript baseado na descrição do operador, com exemplos para os cenários mais comuns (validação de estoque, cálculo de desconto, emissão de NF, etc.). |
| RF-06.3 | Para integrações com API externa, o sistema deve solicitar a URL e sugerir automaticamente o mapeamento de variáveis de resposta. |
| RF-06.4 | Para integrações MCP, o sistema deve exibir a lista de servidores disponíveis com suas ferramentas e permitir seleção. |
| RF-06.5 | Para integração com agentes do AI Workspace, o sistema deve exibir os agentes disponíveis com suas variáveis de entrada e saída. |
| RF-06.6 | O painel deve exibir um preview em tempo real dos campos configurados enquanto o operador conversa. |
| RF-06.7 | O botão de salvar deve ser habilitado somente quando houver alterações válidas pendentes. |
| RF-06.8 | Ao salvar, as mudanças devem ser aplicadas ao board sem recarregar a página. |

---

### RF-07 · Criação e Divisão de Tarefas

| ID | Requisito |
|---|---|
| RF-07.1 | O sistema deve guiar a criação de uma nova tarefa por um fluxo conversacional de 4 etapas: nome → responsável → categoria → confirmação. |
| RF-07.2 | Após criação, o sistema deve oferecer integração via MCP ou agente de IA Workspace. |
| RF-07.3 | O sistema deve permitir dividir uma tarefa existente em duas partes via chat, coletando os nomes das partes e exibindo preview antes de confirmar. |
| RF-07.4 | Ao confirmar a divisão, as arestas do workflow devem ser automaticamente redistribuídas para as duas novas tarefas. |

---

### RF-08 · Configuração do Agente Orquestrador

| ID | Requisito |
|---|---|
| RF-08.1 | O sistema deve oferecer uma tela de configuração do agente com duas colunas: chat conversacional (esquerda) e cards de configuração (direita). |
| RF-08.2 | O sistema deve oferecer toggle master para habilitar/desabilitar completamente a orquestração por IA. |
| RF-08.3 | O sistema deve permitir configurar o limiar de confiança do agente (0–100%) por slider, com explicação de impacto. |
| RF-08.4 | O sistema deve permitir configurar o SLA de monitoramento (horas sem movimentação) e o horário de operação (24/7 ou horário comercial). |
| RF-08.5 | O sistema deve oferecer toggles individuais para cada capacidade do agente: detectar pedidos travados, sugerir realocação de estoque, avançar status automaticamente, criar tarefas manuais, cancelar pedidos automaticamente (este último requer ≥ 95% de confiança e aprovação de gerente). |
| RF-08.6 | O sistema deve permitir configurar a cobertura do agente por workflow (ativar/desativar por workflow individual), exibindo contagem de etapas e pedidos ativos. |
| RF-08.7 | O sistema deve permitir configurar canais de notificação: e-mail, Slack e webhook customizado. |
| RF-08.8 | O sistema deve permitir criar regras customizadas via chat com estrutura IF condition THEN action, definindo prioridade (alta/média/baixa) e escopo por workflow. |
| RF-08.9 | O sistema deve exibir as regras configuradas com toggles de ativação/desativação e opção de exclusão. |
| RF-08.10 | Ao mencionar um domínio de configuração no chat (ex.: "SLA"), o sistema deve destacar visualmente o card correspondente. |

---

### RF-09 · Configurações do Workflow

| ID | Requisito |
|---|---|
| RF-09.1 | O sistema deve permitir editar nome, descrição e ícone de um workflow. |
| RF-09.2 | O sistema deve permitir adicionar e remover dependências entre workflows, exibindo quais workflows devem ser concluídos antes e quais este workflow desbloqueia. |

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
| RNF-05.2 | Variáveis de contexto produzidas por ações de workflow devem ser armazenadas e exibidas na interface de detalhe do pedido. |
| RNF-05.3 | A origem de cada disparo de workflow secundário (Agente AI, Shopper, Merchant) deve ser persistida e exibida no histórico do pedido. |

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
