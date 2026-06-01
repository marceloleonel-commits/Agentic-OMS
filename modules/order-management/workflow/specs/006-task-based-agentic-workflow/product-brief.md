# Product Brief — Task-Based Agentic Workflow

| Field | Value |
|---|---|
| **Module** | Order Management |
| **Pillar** | Agentic Operations / Workflow |
| **Spec** | 006 — Task-Based Agentic Workflow |
| **PM** | Marcelo Leonel da Costa |
| **Eng Champion** | TBD |
| **Status** | Draft |
| **Expected Release** | Pilot 2026-Q4 |
| **Availability** | Closed Beta |
| **Access** | OMS Admin UI · AI Workspace |
| **Mode** | B2C & B2B |

---

## MMR

**Title:** Task-Based Agentic Workflow — Conversational Workflow Designer with Agentic Orchestration

**Description:** With this release, VTEX OMS ganha um engine de workflow baseado em tarefas com orquestração nativa por IA. Merchants podem modelar seus processos operacionais como pipelines de tarefas visuais (kanban), configurar cada etapa conversacionalmente via chat — incluindo scripts customizados, integrações MCP e agentes do AI Workspace — e ativar um agente orquestrador que monitora pedidos em tempo real, resolve bloqueios autonomamente, dispara workflows secundários (ex.: Troca e Devolução) quando necessário, e escala para operadores humanos quando a confiança é insuficiente. Todo o fluxo de configuração e operação é conversacional por padrão, sem necessidade de code changes ou integrações customizadas.

**Availability:** Closed Beta · 2026-Q4 (AI Workspace + OMS Admin UI com select Tier-1 merchants)

**Target Audience:**
- **Tier:** Tier-1 e Tier-2 avançados — operadores de marketplace, fashion, grocery e self-service
- **Persona primária:** OMS Operators e gerentes de operações que definem e mantêm processos; Secondary — Integration Engineers que hoje implementam workflows via customizações
- **Dor:** O OMS atual não oferece um engine de workflow nativo configurável — cada merchant que precisa de lógica de processamento customizada (validação de estoque, aprovação de pagamento por faixa de valor, workflows de troca) recorre a integrações externas, scripts ad hoc ou OMS alternativos. Não há visibilidade unificada do estado de cada tarefa por pedido, nem um mecanismo para o OMS agir autonomamente quando um pedido trava em uma etapa. Como resultado, a resolução de pedidos bloqueados depende inteiramente de intervenção manual, com SLA médio de resolução acima de 4 horas para incidentes operacionais.
- **Use Case:** Permitir que operadores OMS modelem, ativem e monitorem workflows de processamento de pedidos por meio de uma interface visual kanban e chat — com um agente de IA que detecta bloqueios, executa resoluções autônomas dentro dos limites de confiança configurados, e mantém o operador no controle via approve / escalate interface.

---

## Scope

**In scope:**
- **Experiências como unidade de configuração top-level**: merchants criam e gerenciam Experiências via "Gerenciar Experiências" (kanban visual). Cada Experiência contém exatamente 4 marcos fixos — Confirmação de Pagamento, Preparando Itens, NFes Emitidas, Recebido pelo Cliente — cada marco contendo N tarefas (cards). Em tempo de execução, o sistema cria automaticamente uma instância de Experiência para cada combinação de parâmetros de fulfillment dentro de um pedido (modelo de fulfillment + prazo SLA + seller), roteando os itens correspondentes para o fluxo correto.
- 3 Experiências nativas: **Entrega em domicílio** 🚚, **Retirada na loja** 🏪, **Entrega digital** 💻 — mais Troca e Devolução ↩️
- Criação de nova Experiência via fluxo conversacional de 6 passos: nome → modelo base → ícone → descrição → preview dos marcos → confirmar
- Configuração conversacional de tarefas via chat: nome, responsável, categoria, visibilidade (user / internal), script JavaScript customizado, API externa (configuração inline durante criação), integração MCP, agente AI Workspace
- Múltiplos marcos por item de pedido exibidos como seções independentes com headers coloridos (💳 Confirmação de Pagamento + 📦 Preparando Itens + 🧾 NFes Emitidas + 📬 Recebido pelo Cliente)
- Sistema de gatilho de ativação por workflow com 3 tipos: (a) **Início do pedido** — automático ao criar o pedido; (b) **Conclusão de workflow** — após outro workflow da cadeia ser concluído; (c) **Conclusão de tarefa específica** — após uma tarefa nomeada de um workflow específico ser concluída
- Suporte a pedidos com itens do tipo kit: agrupamento visual de itens físicos + serviços associados sob banner compartilhado no detalhe do pedido
- Ciclo de vida de tarefas com 4 status: **Pendente · Completado · Cancelado · Ignorado**; cancelamento exige motivo registrado; todas as transições são iniciadas pelo operador ou pelo agente
- Checkpoints por tarefa: gates de validação nomeados (ex.: "Arte aprovada pelo cliente") com `failAction` configurável; progresso de checkpoints exibido no pipeline do pedido
- Criação de etapas (colunas) e tarefas (cards) por fluxos conversacionais separados; catálogo de fornecedores contextual auto-sugere responsáveis com base no nome da tarefa (pagamento, separação, NF, entrega, personalização, instalação, etc.)
- Workflows secundários (ex.: Troca e Devolução) disparáveis manualmente (operador/shopper) ou autonomamente pelo agente
- Agente orquestrador com 3 sub-agentes independentes: **🗺️ Roteamento** (seleciona fulfillment mode e provider por pedido), **⚙️ Orquestração** (monitora gates e avança status), **🚨 Escalação** (detecta inatividade além do SLA, cria tasks para operador, dispara alertas Slack); cada sub-agente tem toggles de skill individuais
- Detecção e resolução autônoma de pedidos travados dentro dos parâmetros de confiança configurados
- Engine de regras customizadas em linguagem natural (IF condition THEN action) com prioridade e escopo por workflow
- Integração com servidores MCP externos (VTEX Catalog, Logistics, Payments, NFe Emitter, CRM)
- Integração com agentes do AI Workspace via contratos de variáveis de entrada/saída
- Painel de configuração do agente com interface conversacional e cards estruturados
- Gestão de dependências entre workflows (sequenciamento de pipelines)
- Trilha de auditoria completa por pedido: ação, ferramenta, parâmetros, resultado, timestamp, operador responsável
- Notificações de escalação por e-mail, Slack e webhook customizado
- Preview em tempo real durante edição de tarefas
- Operações destrutivas (excluir tarefa, reordenar pipeline, dividir tarefa) com confirmação modal

**Not in scope:** Engine de pagamento (responsabilidade do gateway/PSP); comunicação com o shopper final (cobre o módulo Message Center); notificações push mobile; criação de workflows via API (MLP); suporte a BPMN ou notação de processo externa; SLA contratuais ou multas (responsabilidade do contrato com o seller); auditoria financeira ou contábil (responsabilidade do ERP); variáveis de contexto intermediárias exibidas no detalhe do pedido (removido do escopo do MLP — substituído por visibilidade de status de checkpoints).
