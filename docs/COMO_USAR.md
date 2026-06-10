# Como usar o AGENT_SPEC

Guia para designers, PMs e engenheiros que trabalham neste repositório.

---

## Estrutura dos arquivos

```
/
├── AGENTS.md             ← lido automaticamente por Cursor, Claude Code, Copilot e similares
└── docs/
    └── AGENT_SPEC.md     ← fonte de verdade do comportamento do agente
```

O `AGENTS.md` é o "porteiro": instrui qualquer ferramenta de IA a ler o `AGENT_SPEC.md` antes de qualquer tarefa no Gerenciador de Experiências. Por ser um arquivo padrão da raiz do repositório, funciona no Cursor, Claude Code, GitHub Copilot, v0, e qualquer ferramenta que siga a convenção `AGENTS.md`. Você não precisa repetir as instruções a cada sessão ou trocar de arquivo ao trocar de ferramenta.

---

## Fluxo de trabalho

### 1. Quando você quer implementar algo novo

1. Atualize o `docs/AGENT_SPEC.md` primeiro (adicione o fluxo, componente ou regra).
2. Commite a atualização do spec no GitHub.
3. Abra a ferramenta de IA e descreva a tarefa — ela vai ler o spec atualizado.

**Exemplo de prompt:**
```
Implemente o Fluxo A do AGENT_SPEC (criar workflow).
Leia docs/AGENT_SPEC.md antes de começar.
Siga exatamente a ordem dos passos e os nomes dos componentes definidos lá.
```

### 2. Quando você quer corrigir um comportamento existente

1. Localize o fluxo correspondente no `AGENT_SPEC.md`.
2. Atualize o spec com o comportamento correto.
3. Prompt para a ferramenta:
```
O Fluxo B (adicionar tarefa) está com comportamento incorreto.
Leia docs/AGENT_SPEC.md seção "Fluxo B" e corrija a implementação
para seguir exatamente os passos descritos.
```

### 3. Quando você quer preservar o código existente

```
Leia docs/AGENT_SPEC.md e AGENTS.md.
Não reescreva componentes existentes — estenda-os para que sigam o spec.
Se encontrar conflito entre o código atual e o spec,
adicione um comentário // SPEC CONFLICT e me avise.
```

---

## Como o PM atualiza o spec

O `AGENT_SPEC.md` é Markdown puro. Para editar:

1. Abra o arquivo no GitHub (botão ✏️ editar).
2. Localize a seção que quer mudar — cada seção tem título claro.
3. Faça a edição.
4. Commite com mensagem descritiva. Exemplos:
   - `feat(spec): adiciona Fluxo G — reagendar entrega`
   - `fix(spec): corrige ordem dos passos no Fluxo B`
   - `feat(spec): adiciona template de Assinatura`

**Para adicionar um novo fluxo:** copie o template da seção 9 do AGENT_SPEC e preencha os campos.

**Não é necessário saber programar** para editar o spec. As ferramentas de IA leem e interpretam o Markdown diretamente.

---

## Compatibilidade por ferramenta

| Ferramenta | Como lê o AGENTS.md |
|---|---|
| Cursor | Lê automaticamente na abertura do projeto |
| Claude Code | Lê automaticamente (`AGENTS.md` ou `CLAUDE.md` na raiz) |
| GitHub Copilot | Lê via instruções customizadas do repositório |
| v0 (Vercel) | Lê quando o repositório está conectado |
| Qualquer outra | Inclua no início do prompt: *"Leia AGENTS.md e docs/AGENT_SPEC.md antes de começar"* |

---

## Dúvidas frequentes

**A ferramenta vai sempre seguir o spec?**
Sim, desde que você dê contexto suficiente. Se parecer que está ignorando, adicione no início do prompt: *"Leia docs/AGENT_SPEC.md antes de responder"*.

**Posso ter um spec diferente por feature?**
Sim. Crie `docs/AGENT_SPEC_[feature].md` e adicione uma linha no `AGENTS.md` apontando para ele com o escopo correspondente (pasta ou rota).

**E se alguém não usar nenhuma dessas ferramentas?**
O `AGENT_SPEC.md` funciona como documentação de comportamento para qualquer pessoa. O `AGENTS.md` é só a automação — o spec tem valor independente dele.
