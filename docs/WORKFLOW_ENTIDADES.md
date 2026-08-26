# Workflow — Entidades e campos

Referência das entidades e dados que compõem um **workflow** no protótipo AIW / Gerenciador de Workflows, mapeada a partir do `WorkflowBoardCanvas` (`view-workflow-board.jsx`) e do modelo de dados (`data-aiw.js`).

Serve como fonte para conversas com o assistente sobre modelagem, geração de fixtures e novos fluxos. Complementa o [`AGENT_SPEC.md`](AGENT_SPEC.md) — ali está o comportamento do agente; aqui, o modelo do workflow.

## Sumário

1. [Identidade](#1-identidade)
2. [Status e ciclo de vida](#2-status-e-ciclo-de-vida-bloco-wfmetasection)
3. [Estratégia — Gatilho](#3-estratégia--gatilho-trigger)
4. [Estratégia — Orquestração](#4-estratégia--orquestração-orchmode--agentenabled)
5. [Dependências](#5-dependências)
6. [Etapas](#6-etapas-stages)
7. [Tarefas por etapa](#7-tarefas-por-etapa-tasks)
8. [Ordenação e metadados](#8-ordenação-e-metadados)
9. [Schema TypeScript-like](#9-schema-typescript-like-de-refer%C3%AAncia)

---

## 1. Identidade

| Campo | Tipo | Regras / opções |
|---|---|---|
| `name` | Texto livre | Editável via `WfEditableTitle` (textarea auto-resize, sem quebra de linha). Placeholder: *"Nome do workflow"*. |
| `icon` | Emoji | Ex.: 🏠, 🏪, 📦, 📱. Aparece nas listas e nas tags de origem de gatilho. |
| `desc` | Texto livre | Descrição curta. Ex.: *"Itens despachados por transportadora até o endereço do cliente."* |
| `category` | Enum interno | `fulfillment` · `servicos` · `logistica-reversa` · `cancelamento`. Usado para agrupar na listagem — não editável na tela de detalhe. |

## 2. Status e ciclo de vida (bloco `WfMetaSection`)

| Campo | Opções |
|---|---|
| `status` (liga/desliga o workflow) | `active` → **Ativo** · `archived` → **Inativo** |
| `wfStatus` (ciclo de vida da versão) | `draft` → **Rascunho** · `published` → **Publicado** · `published_with_changes` → **Publicado · alterações pendentes** · `archived` → **Arquivado** |
| `version` | String livre (`"2.1"`, `"1.0"` etc.), incrementada a cada publicação |
| `publishedBy` / `publishedAt` | Preenchidos automaticamente ao publicar (email + timestamp) |
| `lastEditedBy` / `lastEditedAt` | Preenchidos automaticamente a cada edição |
| `versionLog[]` | Histórico completo (ver detalhes abaixo) |

### 2.1 Item de `versionLog[]`

```ts
{
  version: string;                  // "2.1"
  publishedAt: string;              // ISO
  publishedBy: string;              // email
  description: string;              // resumo humano
  appliedTo: "new_orders_only" | "all_orders";
  activeOrdersAtPublish: number;
  deltas: Array<{
    entity: "task" | "dependency" | "trigger"
          | "supplier" | "contingency" | "general config";
    change: "added" | "removed" | "renamed" | "edited"
          | "changed" | "connected" | "disconnected" | "replaced";
    detail: string;                 // "Expedição — Etapa: Entrega"
  }>;
}
```

## 3. Estratégia — Gatilho (`trigger`)

Escolha única entre 3 tipos. Cada tipo pede subcampos diferentes.

### 3.1 Evento do sistema (`type: "system-event"`)

Um ou mais eventos de domínio (multi-seleção). ~35 eventos em 8 domínios:

| Domínio | Eventos |
|---|---|
| **Pedidos** | Pedido criado · Pagamento aprovado · Pedido cancelado · Pedido faturado · Item removido do pedido |
| **Devoluções** | Devolução solicitada · Devolução aprovada · Devolução rejeitada · Produto recebido no CD · Reembolso emitido |
| **Entrega** | Pedido enviado · Entrega atrasada · Tentativa de entrega falhou · Pedido entregue · Endereço de entrega alterado |
| **Assinaturas** | Assinatura criada · Assinatura renovada · Assinatura cancelada · Falha na cobrança recorrente · Plano alterado |
| **Pagamentos** | Pagamento recusado · Pagamento em análise antifraude · Estorno solicitado · Boleto vencido |
| **Estoque** | Produto esgotado · Estoque reabastecido · Produto próximo do limite mínimo |
| **Conta do cliente** | Conta criada · Dados cadastrais atualizados · Cliente marcado como VIP · Solicitação de exclusão de conta (LGPD) |
| **Atendimento** | Ticket de suporte aberto · Ticket escalado · Avaliação de atendimento recebida |

### 3.2 Conclusão de um workflow (`type: "wf-completion"`)

- **Workflow(s) de origem** — multi-seleção de outros workflows do tenant.

### 3.3 Conclusão de uma tarefa específica (`type: "task-completion"`)

Pares independentes `{ wfId, taskId, status }`:

- **Workflow de origem** — 1 por par
- **Tarefa** — 1 do workflow escolhido
- **Status observado** da tarefa — 1 por par

No modelo, o formato mais compacto é `{ type: "task-completion", triggerWfId, triggerTaskId }`.

### 3.4 Outros valores possíveis (só no modelo, ainda sem UI)

- `"order-start"` — dispara no início do ciclo do pedido.
- `"manual"` — só via chamada explícita.

## 4. Estratégia — Orquestração (`orchMode` / `agentEnabled`)

Escolha única:

| Valor | Rótulo curto | Descrição |
|---|---|---|
| `agent` (`agentEnabled: true`) | **Agêntica** | O agente monitora o andamento das tarefas e avança as etapas automaticamente. |
| `manual` (`agentEnabled: false`) | **Manual** | As etapas só avançam quando um operador confirma cada uma. |

## 5. Dependências

Duas listas independentes de outros workflows (multi-seleção, mesmo drawer):

| Campo | O que significa |
|---|---|
| `deps` (**Dependência**) | Workflows que precisam ter concluído antes deste ativar |
| `unlocks` (**Desbloqueia**) | Workflows que este, ao concluir, libera |

Cada item: `{ wfId, wfName, wfIcon }`.

## 6. Etapas (`stages[]`)

Cada etapa tem:

| Campo | Opções |
|---|---|
| `name` | Texto livre. Ex.: *"Pagamento", "Manuseio", "Faturamento", "Entrega"* |
| `category` | Rótulo em maiúsculas usado como tag colorida. Valores em uso: `PAYMENT` · `FULFILLMENT` · `DELIVERY` |
| `gate` | Marco/estado observável do fim da etapa. Ex.: `payment_settled`, `deliverable_ready`, `customer_has_goods`, `cancellation_requested`, `cancellation_complete` |
| `linkedToNext` | Boolean — se a etapa seguinte só começa quando esta termina |
| `responsible` | Texto livre no modal (ex.: *"WMS", "Gateway", "Operador"*) |
| `stageCategory` | Texto livre no modal (ex.: *"Pagamento", "Fulfillment", "Reversa"*) |
| `agentEnabled` (por etapa) | Boolean — se o agente monitora e avança as tarefas desta etapa |
| `mcpEnabled` + `mcpServer` | Toggle + nome do servidor MCP conectado |

## 7. Tarefas por etapa (`tasks[]`)

Quatro campos rápidos no card:

| Campo | Opções |
|---|---|
| **Etapa** | Uma das etapas do workflow (permite mover a tarefa) |
| **Status** | `Ativo` (considerada na execução) · `Inativo` (ignorada) |
| **Como executa** | `Manual` (operador humano) · `Automático` (agenticamente, `type: "auto"`) |
| **Visibilidade** | `Interna` (não aparece para o shopper) · `Externa` (visível para o shopper) |

Mais no modelo: `id`, `name`, `owner` (ex.: *"Adyen", "GFL Logística", "Jadlog", "NFe.io"*), `desc`.

## 8. Ordenação e metadados

| Campo | Uso |
|---|---|
| `flatOrder[]` | Ordem de execução na visão "Tarefas" (independente do agrupamento por etapa). Ex.: `["ed-1", "ed-3", "ed-4", ..., "ed-11"]` |
| `custom` | Boolean — se é template do sistema ou criado pelo tenant |
| `orders` | Contador estimado de pedidos ativos (string) — só na listagem |

## 9. Schema TypeScript-like de referência

```ts
type WfStatus = "draft" | "published" | "published_with_changes" | "archived";
type WfLifecycle = "active" | "archived";
type OrchMode = "agent" | "manual";
type ExecType = "manual" | "auto";
type Visibility = "internal" | "user";

type Trigger =
  | { type: "system-event"; events: string[] }
  | { type: "wf-completion"; triggerWfIds: string[] }
  | { type: "task-completion"; pairs: Array<{ wfId: string; taskId: string; status: string }> }
  | { type: "order-start" }
  | { type: "manual" };

interface Stage {
  id: string;
  name: string;
  category: "PAYMENT" | "FULFILLMENT" | "DELIVERY" | string;
  gate?: string;
  linkedToNext: boolean;
  responsible?: string;
  stageCategory?: string;
  agentEnabled?: boolean;
  mcpEnabled?: boolean;
  mcpServer?: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  type: ExecType;
  owner?: string;
  desc?: string;
  active?: boolean;         // default true
  visibility?: Visibility;  // default "internal"
}

interface DepRef { wfId: string; wfName: string; wfIcon: string; }

interface VersionLogEntry {
  version: string;
  publishedAt: string;
  publishedBy: string;
  description: string;
  appliedTo: "new_orders_only" | "all_orders";
  activeOrdersAtPublish: number;
  deltas: Array<{
    entity: "task" | "dependency" | "trigger" | "supplier" | "contingency" | "general config";
    change: "added" | "removed" | "renamed" | "edited" | "changed" | "connected" | "disconnected" | "replaced";
    detail: string;
  }>;
}

interface Workflow {
  id: string;
  name: string;
  icon: string;
  desc?: string;
  category: "fulfillment" | "servicos" | "logistica-reversa" | "cancelamento" | string;

  status: WfLifecycle;
  wfStatus: WfStatus;
  version: string;

  trigger: Trigger;
  agentEnabled: boolean;   // orchMode "agent" quando true
  deps: DepRef[];
  unlocks: DepRef[];

  stages: Stage[];
  flatOrder?: string[];

  publishedAt?: string;
  publishedBy?: string;
  lastEditedAt?: string;
  lastEditedBy?: string;
  versionLog: VersionLogEntry[];

  custom: boolean;
  orders?: string;
}
```

---

## Fontes

- [`modules/order-management/workflow/specs/006-task-based-agentic-workflow/prototype/aiw/view-workflow-board.jsx`](../modules/order-management/workflow/specs/006-task-based-agentic-workflow/prototype/aiw/view-workflow-board.jsx) — `WfMetaSection`, `WfSettingsInline`, `WfTriggerDrawer`, `WfSystemEventPicker`, `WfChoiceDrawer`, `WfWorkflowPickerDrawer`, `StageConfigView`, `TaskConfigView`, `WF_STATUS_META`, `SYSTEM_EVENT_GROUPS`.
- [`modules/order-management/workflow/specs/006-task-based-agentic-workflow/prototype/aiw/data-aiw.js`](../modules/order-management/workflow/specs/006-task-based-agentic-workflow/prototype/aiw/data-aiw.js) — array `workflows` (fixtures OJ-01 a OJ-XX), com todos os campos preenchidos.
