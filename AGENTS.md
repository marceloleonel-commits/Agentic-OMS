# AGENTS.md — AIW Gerenciador de Experiências

Este arquivo é lido automaticamente por ferramentas de IA (Cursor, Claude Code, GitHub Copilot, v0, e similares) ao trabalhar neste repositório. Siga todas as instruções abaixo antes de qualquer tarefa.

---

## Fonte de verdade

Antes de criar, editar ou refatorar qualquer arquivo relacionado ao Gerenciador de Experiências, ao chat do agente ou ao canvas de workflows, leia:

```
docs/AGENT_SPEC.md
```

Este documento define:
- Comportamento e persona do agente "Order Management Assistant"
- Fluxos completos (ordem dos passos, o que o chat diz, o que o canvas faz)
- Componentes do chat: chips, action card, componente Action
- Sincronização chat ↔ canvas
- Modelo de dados (Workflow → Etapa → Tarefa) e estados válidos

**O AGENT_SPEC tem precedência sobre qualquer decisão de implementação anterior.**

---

## Estrutura do projeto

```
/
├── AGENTS.md                          ← este arquivo
└── docs/
    └── AGENT_SPEC.md                  ← fonte de verdade do agente
```

---

## Regras de implementação

### Preserve o código existente
Não reescreva o que já funciona. Se um componente existente cobre o comportamento descrito no AGENT_SPEC, estenda-o. Só crie um componente novo se não existir nenhum que sirva.

### Siga a nomenclatura do spec
Nomes de variáveis, funções, componentes e rotas devem refletir os termos do AGENT_SPEC:
`workflow`, `stage`, `task`, `actionCard`, `chips`, `Action` (componente canvas).
Não crie sinônimos.

### Rotas — não altere sem justificativa
| Rota | Tela |
|---|---|
| `#/workflow-board` | Lista de workflows |
| `#/workflow-board/:workflowId` | Detalhe do workflow |
| `#/workflow-board/:workflowId/stage/:stageId` | Detalhe da etapa |
| `#/workflow-board/:workflowId/settings/:section` | Configurações |

### Estados do workflow são exatamente quatro
`draft` · `published` · `published_with_changes` · `archived`
Não adicione estados sem atualizar o AGENT_SPEC primeiro.

### Templates são dados, não lógica
A lista de templates deve viver em `/data/workflow-templates.ts` (ou equivalente), nunca hardcoded em componentes.

### Chips sempre têm intent mapeado
Nunca renderize chips com texto livre avulso. Todo chip deve ter um `intent` correspondente a um fluxo do AGENT_SPEC.

### Chips da chip-row e quick-replies compartilham o mesmo estilo visual
`.suggest-chip` (chip-row, atalhos persistentes) e `.chat-quick-reply` (respostas contextuais vinculadas a mensagens) devem usar os mesmos tokens de design:
`--sl-border-base`, `--sl-bg-base`, `--sl-fg-base`, `border-radius: 99px`, `box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.04)`.
Nunca aplique estilos divergentes entre os dois. A distinção entre eles é **comportamental** (persistente vs. contextual), não visual.

### Canvas faz scroll até o elemento em discussão no chat
Quando o agente estiver tratando de um elemento específico do canvas (tarefa, etapa, trigger, dependência), implemente scroll automático do canvas até esse elemento. Se o elemento for uma tarefa ou etapa, abra o card inline correspondente. Em particular: ao clicar em **"Aplicar"** num action card de criação de tarefa (Fluxo B do AGENT_SPEC), a tarefa deve aparecer no canvas com o **card já expandido** e o canvas **com scroll posicionado nela**. O chat pode acionar: abertura de tarefas, navegação até etapas, configuração de gatilhos e dependências, e publicação do workflow.

### Publicação tem dupla entrada
Não implemente publicação exclusiva de uma única superfície. O fluxo de publicação (Fluxo F do AGENT_SPEC) deve poder ser iniciado tanto pelo chat quanto pelo botão "Publicar" no canvas. O resultado — atualização do badge, registro no histórico de versões — é idêntico em ambos os casos.

### Largura inicial do chat panel
O painel de chat deve ser carregado com largura inicial de **400px**. Ajuste o `initialWidth` do `ResizableSplit` sempre que a largura padrão precisar ser alterada — nunca use CSS para forçar largura inicial de um painel redimensionável.

---

## Como traduzir o spec em código

| No AGENT_SPEC | No código |
|---|---|
| `CHAT: "texto"` | Mensagem adicionada ao array de mensagens do agente |
| `Chips: [X] [Y]` | Array `{ label: string, intent: string }[]` renderizado como chips |
| `CANVAS: [ação]` | Função ou mutation que atualiza o estado do canvas |
| `Action card` | Componente `<ActionCard fields={...} onConfirm={...} onCancel={...} />` |
| `Se confirmado` | Callback do `onConfirm` |
| `Chips (destrutivos)` | Chips com `variant="destructive"` |

---

## Conflitos entre spec e código

Se encontrar divergência entre o AGENT_SPEC e a implementação existente:
1. Adicione um comentário `// SPEC CONFLICT: [descrição]` no trecho afetado.
2. Implemente seguindo o AGENT_SPEC.
3. Registre o conflito para que designer ou PM reconcilie o documento.

---

## O que nunca fazer

- Não implemente fluxos de chat que não existam no AGENT_SPEC.
- Não altere a ordem dos passos de um fluxo sem atualizar o spec antes.
- Não use o nome "Controle de Fluxos" — o módulo se chama **Gerenciador de Experiências**.
- Não trate tarefas de mesmo nome em workflows diferentes como a mesma entidade — cada tarefa é local ao seu workflow.
- Não adicione o campo `ícone` ao modelo de Workflow — ele não existe nesta versão.
- Não bloqueie a publicação a uma única superfície — chat e canvas devem poder iniciar o Fluxo F.
- Não use `quickReplies` nas mensagens iniciais do chat — elas duplicariam os chips da `chip-row`.
- Não aplique estilos visuais distintos entre `.suggest-chip` e `.chat-quick-reply` — a distinção entre eles é comportamental, não visual.
- Não use CSS para definir a largura inicial do painel de chat — use o prop `initialWidth` do `ResizableSplit`.
- Não implemente "Aplicar" em action card de criação de tarefa sem o scroll + abertura do card correspondente no canvas.

## Vercel publication policy (`.vercelignore`)

This repository is linked to a Vercel project (`vertical-distributed-order-management-dom`) with **Password
Protection enabled**. What gets published is controlled by an allowlist in
[`.vercelignore`](.vercelignore).

The core rule:

> The first non-comment line of [`.vercelignore`](.vercelignore) is `/*`.
> **Never remove it.** To publish content, **add** a `!path` block that opts
> the file or folder back in. To unpublish, remove the matching block.

### Allowed

- Add a new `!path` block to publish a folder or file.
- Remove an existing `!path` block to take that path off the air.

> **Ordering matters.** `.gitignore`-style matching is order-sensitive (the
> last pattern that matches a path wins). Inside a chained re-include block
> (`!parent` then `parent/*` then `!parent/child` ...), the order of the
> `!path` and `path/*` lines is significant; do not reorder them. New blocks
> should be appended to the end of the file under a clear comment header.
> Validate locally with `git check-ignore --no-index -v <path>` (after
> temporarily swapping `.vercelignore` into `.gitignore`).

### Forbidden

- Removing or commenting out the `/*` line.
- Replacing `/*` with narrower patterns (e.g. `/docs`, `*.md`). The wildcard
  is intentionally broad so publication is opt-in.
- Adding patterns that re-include the whole repo (e.g. `!*`, `!/`, `!**/*`).
- Moving `.vercelignore` out of the repo root.

### Nested paths require chained re-includes

Template for a prototype at `modules/X/Y/prototype/`:

```
!modules
modules/*
!modules/X
modules/X/*
!modules/X/Y
modules/X/Y/*
!modules/X/Y/prototype
!modules/X/Y/prototype/**
```

If intermediate directories are already unblocked earlier in the file (a
sibling prototype under the same parent), reuse them; do not duplicate.

### Why this safety net exists

Without `/*`, Vercel serves any path that exists in the repo: source code,
agent prompts (`.claude/`, `.cursor/`), configuration (`.vtex/`, `.mcp.json`),
internal documentation. Wildcard + allowlist makes the published surface
explicit and auditable through diffs.

Companion docs: [`.cursor/rules/vercelignore.mdc`](.cursor/rules/vercelignore.mdc),
[`.claude/vercelignore.md`](.claude/vercelignore.md).
