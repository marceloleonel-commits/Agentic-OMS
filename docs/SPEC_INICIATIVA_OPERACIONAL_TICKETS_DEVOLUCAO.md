# Spec — Iniciativa Operacional: Devoluções fora da política (Canvas D)
## Exemplo de referência: 4 tickets abertos — avaliação SAC

---

## 1. Contexto do caso de uso

Casos de exceção de devolução que não se enquadram nas políticas cadastradas pela loja — seja porque passou do prazo, ou por outro motivo como categoria não elegível ou motivo não aceito.

Mapeado no catálogo de cenários como **DEV-002 — Devolução fora da política**.

**Diferença estrutural em relação a outros canvas já especificados:** aqui a "estrela" do card não é o Pedido — é o **Ticket**. O Pedido existe apenas como contexto vinculado, acessível a partir do ticket, mas não é a entidade que organiza a tela.

**Quem avalia:** SAC decide em nome do merchant, dentro da autonomia estabelecida para esse tipo de exceção.

---

## 2. Classificação do padrão

- **Canvas Pattern D** — Devolução e troca. Não possui metadados adicionais próprios (diferente de A, E, F, Initiative) — usa apenas os campos globais.
- **Modelo de dado: Iniciativa Operacional** (não Ocorrência — terminologia atualizada). Mesmo com motivos diferentes entre os 4 tickets (prazo, motivo não aceito, categoria não elegível, limite excedido), eles formam uma única Iniciativa Operacional, porque:
  - Compartilham o mesmo contexto de avaliação (mesmo lote, mesma janela, mesma fila do SAC).
  - Pelo menos um ticket exige decisão humana — condição suficiente para a Iniciativa Operacional se tornar visível.
- **Autonomia é sempre por Tarefa/Ticket, nunca pela Iniciativa Operacional inteira.** Diferentes tickets podem estar em estados diferentes simultaneamente (um já decidido, outro ainda pendente, outro escalado) sem conflito — o Status agregado da Iniciativa Operacional reflete isso automaticamente:
  - **Needs Attention** enquanto qualquer ticket estiver pendente de decisão.
  - **Completed** somente quando todos os tickets estiverem em estado terminal.

---

## 3. Hierarquia de navegação

```
Canvas (Iniciativa Operacional)
   └── Ticket (nível 1 — aparece na tabela do canvas)
          └── Pedido (nível 2 — aparece dentro do ticket, como contexto vinculado)
```

- **Nível 1 (Canvas):** tabela com todos os tickets, priorizável por SLA.
- **Nível 2 (Ticket aberto):** ao clicar em um ticket, abre o conteúdo completo da solicitação — e é aqui, dentro do ticket, que aparece o link para o Pedido vinculado. O Pedido não aparece na tabela de nível 1 para manter o canvas limpo, já que ele só importa no momento em que alguém está de fato avaliando aquele ticket específico.

---

## 4. Não há árvore de decisão neste canvas

Diferente de outros padrões (ex: Canvas A), aqui a decisão é direta e não exige desdobramento em perguntas sequenciais — é um fluxo inline dentro do próprio canvas/ticket, não uma sequência de perguntas em chat.

Modelo agêntico (`design_handoff_tickets_abertos v2`, substitui a versão anterior desta seção): o agente já chega com a **recomendação** e, quando ela é uma das três ações, o **painel daquela ação já vem aberto**. As três abas ficam sempre visíveis num segmented control e podem ser trocadas sem fechar o painel.

```
Abas: [ Aceitar ]  [ Negar ]  [ Escalar ]
      (a aba recomendada leva um ponto azul; abre selecionada)

   ↳ Aceitar (leitura)  → o agente apresenta a "Resolução dentro da política"
                          (por padrão: Estorno total no meio de pagamento original)
                          + o rascunho da mensagem ao cliente (colapsável).
                          O SAC não escreve nada — só Confirmar ou trocar de aba.
   ↳ Negar (leitura)    → o agente apresenta a "Regra aplicada" (verbatim do
                          `denyReason` do ticket) + o rascunho da mensagem ao
                          cliente (colapsável). Também é read-only.
   ↳ Escalar (editável) → destino fixo em `Ecommerce Supervisor` (sem escolha)
                          + textarea opcional "O que o supervisor precisa decidir".
                          Muda o Lead da Tarefa correspondente para Ecommerce
                          Supervisor.
```

### Regra de autonomia

Qualquer decisão fora do que o agente apresenta em Aceitar/Negar — troca, vale-compra, estorno parcial, negar com outra justificativa, abrir exceção contra a regra — **sai da autonomia do SAC** e só existe via **Escalar**. Por isso Aceitar e Negar não têm campos para preencher: se o operador precisa desviar do que está lá, o caminho correto é o escalonamento.

### Consequências de cada decisão

- **Aceitar** — mensagem é enviada ao cliente; aceite vai para o Document Audit; Tarefa correspondente é concluída como "Aceita por [nome] às [hora]".
- **Negar** — mensagem é enviada ao cliente; cliente tem 7 dias para contestar; Tarefa correspondente é concluída como "Negada por [nome] às [hora]".
- **Escalar** — ticket sai da fila do SAC; Tarefa correspondente é concluída para o SAC e o Lead passa a `Ecommerce Supervisor`; o escalonamento pode ser **desfeito** (aceite e negativa não, porque já dispararam mensagem ao cliente).

### Fechamento da fila

Ao confirmar o último ticket pendente, o agente publica no chat uma mensagem informando que as Tarefas foram concluídas, com o resumo (total avaliados, quantos aceitos/negados/escalados, para onde os escalonamentos foram), e a Iniciativa muda para **Concluída**. No card, um resumo da fila entra sozinho no lugar do último ticket — cada linha do resumo volta ao ticket correspondente ("Revisar tickets" reabre o card). Os escalonamentos não impedem o fechamento: eles seguem como tickets do supervisor, fora desta Iniciativa.

### Divergência histórica

A versão anterior desta seção previa outro fluxo: Aceitar expandia em "tipo de resolução (estorno total/parcial, troca, vale-compra) + valor (se parcial) + justificativa (obrigatória)" e Negar tinha o motivo editável. Este design substitui aquele modelo deliberadamente — a resolução em política é apresentada pelo agente e qualquer desvio passa por escalonamento. Escalar preserva o destino fixo já previsto (Ecommerce Supervisor), com a adição de uma observação opcional ao supervisor.

---

## 5. Nível 1 — Tabela de tickets no canvas (Bloco 4 — Contexto micro)

Colunas: **Ticket, Motivo shopper, Recomendação, Porque, SLA restante**. Pedido não aparece neste nível.

| Ticket | Motivo shopper | Recomendação | Porque | SLA restante |
|---|---|---|---|---|
| TCK-1042 | "Não usei o produto, quero devolver" | Avaliar (sem recomendação forte) | Fora do prazo de 30 dias (34 dias desde a entrega) — mas cliente tem 12 pedidos no histórico sem ocorrência prévia | 2h restantes |
| TCK-1043 | "Não gostei do produto" | Negar | Motivo não coberto pela política (só aceita defeito/avaria) | 18h restantes |
| TCK-1044 | "Chegou com a costura solta" | Escalar | Categoria não elegível pela política padrão (higiene pessoal), mas evidência anexada sugere defeito de fabricação | Vencido há 3h |
| TCK-1045 | "Tamanho errado" | Negar | Excede limite mensal de devoluções (5ª solicitação; limite: 3) — motivo isolado seria aceito | 9h restantes |

Ticket com SLA vencido (TCK-1044) deve ter prioridade visual na lista, independentemente da ordem de chegada.

---

## 6. Nível 2 — Dentro do ticket (ex: ao abrir TCK-1042)

Conteúdo exibido:
- **Pedido vinculado:** #BR-3010982 (link)
- Mensagem completa do shopper
- Anexos (se houver — evidências fotográficas, por exemplo)
- Histórico do cliente (ex: 12 pedidos, 0 ocorrências prévias)
- Botões de decisão: **Aceitar exceção / Negar / Escalar** (ver seção 4)

---

## 7. Tarefa (Bloco 3)

Uma Tarefa por ticket — a decisão é individual, então a unidade de trabalho também é:

| Tarefa | Lead | Status |
|---|---|---|
| Resolver ticket TCK-1044 | SAC Team | Needs Attention |
| Resolver ticket TCK-1042 | SAC Team | Needs Attention |
| Resolver ticket TCK-1043 | SAC Team | Needs Attention |
| Resolver ticket TCK-1045 | SAC Team | Needs Attention |

A ordem das linhas acompanha a da tabela de tickets do canvas: SLA vencido primeiro (TCK-1044).

O bloco tem dois grupos, **Tarefas a fazer** e **Tarefas realizadas**. Cada Tarefa fecha (Completed) e migra para "realizadas" assim que aquele ticket tem decisão tomada — inclusive quando a decisão é escalar, que encerra a participação do SAC no ticket. Um grupo vazio não aparece: com todos os tickets pendentes só existe "a fazer"; com todos decididos, só "realizadas". O Lead da linha muda para **Ecommerce Supervisor** quando o ticket é escalado. A automação disparada por cada decisão (notificar cliente, processar estorno, registrar no histórico) continua acontecendo automaticamente — sem virar Tarefa.

---

## 8. Metadados da Iniciativa Operacional

Campos globais (Canvas D não adiciona campos próprios):

- **Category:** Return Task
- **Confiança agregada:** reflete o menor nível entre os tickets (ex: Média, por causa da evidência ambígua de TCK-1044)
- **Status agregado:** Needs Attention enquanto qualquer ticket estiver pendente
- **Lead:** SAC Team (nível padrão); muda para Ecommerce Supervisor apenas nos tickets escalados

---

## 9. Notas de escopo e assunções

- "Porque" cobre tanto a razão da não-aprovação automática quanto a justificativa da recomendação — não foi desmembrado em dois campos separados.
- O exemplo dos 4 tickets corresponde ao cenário DEV-002 do catálogo de 66 cenários.
- SLA restante deve orientar a ordenação padrão da tabela (vencidos primeiro), mas isso não foi formalizado como regra de ordenação — vale confirmar antes de implementar no Cursor.
