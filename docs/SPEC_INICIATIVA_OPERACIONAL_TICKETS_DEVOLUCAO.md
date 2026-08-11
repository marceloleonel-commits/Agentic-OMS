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

Dentro de cada ticket (nível 2), a decisão acontece via botões inline:

```
[ Aceitar exceção ]     [ Negar ]     [ Escalar ]

   ↳ Aceitar → expande inline: tipo de resolução (estorno total/parcial, troca, vale-compra)
               + valor (se parcial) + justificativa (obrigatória, vai para Document Audit)
   ↳ Negar   → expande inline: motivo da negativa (pré-preenchido com a sugestão do agente, editável)
   ↳ Escalar → sem expansão — muda o Lead da Tarefa para Ecommerce Supervisor
```

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
