# Spec — Ocorrência Canvas A: "N pedidos parados no workflow"
## Exemplo de referência: 23 pedidos parados em Despacho — Seller Loja Botafogo

Este documento especifica o comportamento completo de uma Ocorrência do padrão Canvas A (política-guiada, execução single-path com um ponto de confirmação humana), incluindo card de diagnóstico, árvore de decisão interativa, tipos de input, e geração de Tarefas (autônomas e dependentes de humano).

---

## 1. Card de diagnóstico (estado inicial da Ocorrência)

**Título:** 23 pedidos parados em Despacho — Seller Loja Botafogo

**Texto de diagnóstico:**
> Seller Loja Botafogo não iniciou despacho para 23 pedidos com SLA de entrega em D+1. Último evento registrado: labeling_finished às 06:12. Nenhum evento de coleta detectado em 4h. Padrão semelhante em 2 ocorrências anteriores (04/06 e 28/05).

Esta Ocorrência agrega 23 Tarefas com o mesmo evento de origem (seller não iniciou despacho). Ela só existe porque a informação necessária para decidir uma ação exige confirmação humana — não porque o agente falhou em raciocinar.

---

## 2. Componente de interação (regra de arquitetura)

O mesmo componente de card (formato "Pergunta", com header, contador de paginação `1—N`, setas de navegação `< >` e botão "Continuar") **permanece ativo durante toda a árvore de decisão**. Ele NÃO fecha para chat livre entre uma pergunta e outra.

Regras:
- O contador de paginação incrementa a cada nova pergunta desdobrada pela árvore (ex: `1—1` → `1—2` → `2—3`, etc), refletindo o total dinâmico de perguntas necessárias até o momento.
- As setas `< >` permitem voltar e **editar** uma resposta já dada. Editar uma resposta anterior deve re-disparar a reavaliação em cascata de qualquer Tarefa que já tenha sido criada ou resolvida a partir dela (mesmo mecanismo de replicação de decisão usado em fechamento de Tarefas irmãs).
- O card só deixa de aparecer como "Pergunta" quando a árvore fecha (todas as perguntas necessárias para o branch escolhido foram respondidas). Nesse momento ele muda para um estado de resumo (ex: "Tarefas criadas") e a interação seguinte pode voltar a ser chat livre — porque não há mais dado estruturado pendente de captura.
- Motivo de manter o componente: as respostas viram dado estruturado que dispara automação diretamente (ex: lista de pedidos selecionados, quantidade confirmada). Chat livre introduziria risco de ambiguidade de parsing exatamente na informação mais sensível à auditoria.

### Tipos de input suportados pelo card

| Tipo | Uso |
|---|---|
| `single_select` | Perguntas de escolha única (ex: pergunta 1, qual carrier, motivo do não-despacho) |
| `multi_select_list` | Selecionar quais pedidos, dentre os 23, dentro de uma lista (com busca por ID/cliente) |
| `file_upload` | Anexar e-mail ou print da transportadora como evidência, como alternativa à seleção manual |
| `source_confirmation` | Pergunta obrigatória, disparada logo após qualquer `multi_select_list` ou `file_upload`, confirmando a origem da informação |
| `short_text` | Campo livre para respostas tipo "Outro" (ex: D.1, fallback de A.1/C.1) |

### Padrão de dois botões (quando há input concorrente: selecionar vs. anexar)

Sempre que a pergunta permitir tanto seleção manual quanto upload de evidência, exibir dois botões lado a lado, mutuamente exclusivos por resposta (mas reabríveis/editáveis depois):

```
[ Selecionar pedidos ]     [ Anexar comprovante ]
```

- **Selecionar pedidos** → abre checklist com os 23 pedidos, com busca por ID/cliente.
- **Anexar comprovante** → abre input de upload (aceita imagem, e-mail, PDF).
- Em ambos os casos, ao confirmar, dispara em seguida a pergunta `source_confirmation`.

### Pergunta de confirmação de fonte (`source_confirmation`)

Pergunta: **"Como você confirmou essa informação?"**
Opções (`single_select`): Sistema da transportadora / E-mail do seller / Print anexado / Contato telefônico / Outro

Nota de auditoria: quando a fonte é `file_upload`, o anexo é evidência offline/manual e deve ser registrado no nível de **Document Audit** (camada mais granular do modelo de três camadas), vinculado à(s) Tarefa(s) correspondente(s). **Assunção a validar:** por ora, o anexo funciona apenas como referência visual para o operador — não há extração automática (OCR) do conteúdo para inferir quais pedidos estão ali. Se a extração automática for necessária no futuro, isso muda o escopo de spec.

---

## 3. Árvore de decisão completa

### Pergunta 1 (ponto de entrada)
**"O que aconteceu com os pedidos no seller?"** — `single_select`

- **A)** Os pedidos foram despachados. Falhou a integração com a carrier.
- **B)** Os pedidos foram despachados parcialmente.
- **C)** Os pedidos não foram despachados.
- **D)** Outro.

---

### Branch A — Falha de integração com a carrier

- **A.1** `single_select` — "Qual carrier apresentou falha?"
- **A.2** `single_select` — "Você tem confirmação de despacho físico (manifesto/NF) dos 23, ou de parte?"
  - **A.2.1** Todos os 23 confirmados → segue fluxo A completo (fecha árvore).
  - **A.2.2** Só parte confirmada:
    - Pergunta com os dois botões: **"Quantos, e quais pedidos?"** (`multi_select_list` OU `file_upload`, sobre a lista dos 23)
    - Segue `source_confirmation`
    - Converge com o fluxo de Branch B a partir daqui (mesmo tratamento para o restante dos pedidos).

---

### Branch B — Despachados parcialmente

- **B.1** — Pergunta com os dois botões: **"Quantos dos 23 foram despachados, e quais?"** (`multi_select_list` OU `file_upload`)
  - Segue `source_confirmation`
- **B.2** `single_select` — "Os pedidos restantes têm previsão de despacho hoje?"
  - **B.2.1** Sim, com horário → replaneja SLA dos restantes (fecha árvore).
  - **B.2.2** Não / sem previsão → converge com o fluxo de Branch C para os pedidos restantes.

---

### Branch C — Não despachados

- **C.1** `single_select` — "Qual o motivo?"
  - C.1.a Sem capacidade operacional
  - C.1.b Loja fechada / feriado não previsto
  - C.1.c Pendência de nota fiscal / documentação
  - C.1.d Outro motivo (`short_text` fallback)
- **C.2** `single_select` — "Seller tem previsão de despacho ainda hoje?"
  - **C.2.1** Sim → replaneja SLA + comunica cliente (fecha árvore).
  - **C.2.2** Não → escalona (redistribui / aciona backup) + comunica cliente + registra recorrência (fecha árvore).

---

### Branch D — Outro

- **D.1** `short_text` — "Descreva o que houve"
  → Gera Tarefa independente de triagem manual.
  → Candidato a nova entrada no dicionário de eventos de origem (tratado como mock/ilustrativo por enquanto — ver seção 5).

---

## 4. Tarefas geradas

### 4.1 Tarefas já realizadas (visíveis na página principal — apenas 3 campos: Tarefa, Lead, Status)

Executadas de forma totalmente autônoma, antes mesmo do operador abrir a Ocorrência.

| Tarefa | Lead | Status |
|---|---|---|
| Notificar 23 clientes sobre risco de atraso | Order Management Agent | Completed |
| Tentar contato automático com seller (webhook/e-mail) | Order Management Agent | Completed |
| Verificar histórico de padrão semelhante (04/06, 28/05) | Order Management Agent | Completed |

Regra de nomenclatura do campo Lead:
- Quando a execução é automatizada → **"Order Management Agent"**
- Quando depende de humano do time de atendimento → **"SAC Team"**
- Quando depende de humano do time comercial/operacional do seller → **"Ecommerce Supervisor"**

### 4.2 Tarefas por branch, com status de execução real

**Branch A**

| Tarefa | Lead | Status |
|---|---|---|
| Corrigir integração com carrier [X] | Ecommerce Supervisor | Needs Attention (esperando humano) |
| Forçar atualização de evento de coleta (23 pedidos) | Order Management Agent | Sendo feita (dispara automaticamente assim que A.1 + A.2 são respondidas — não exige nova decisão humana) |

**Branch B**

| Tarefa | Lead | Status |
|---|---|---|
| Forçar atualização de status dos pedidos já despachados [N] | Order Management Agent | Sendo feita (política já cobre; dispara assim que N e a lista de pedidos são informados) |
| Acompanhar despacho dos [23-N] restantes até novo horário | Order Management Agent | Sendo feita |
| Reavaliar SLA de entrega dos restantes | Order Management Agent | Sendo feita |
| Comunicar novo prazo aos clientes restantes | Order Management Agent | Sendo feita |

Nenhuma tarefa do Branch B fica em Needs Attention, a menos que B.2.2 ("sem previsão") seja respondida — nesse caso os pedidos restantes passam a seguir o conjunto de tarefas do Branch C.

**Branch C**

| Tarefa | Lead | Status |
|---|---|---|
| Contatar seller para novo prazo de despacho | Ecommerce Supervisor | Needs Attention (esperando humano) |
| Redistribuir pedidos para seller backup (se aplicável) | Ecommerce Supervisor | Needs Attention (esperando humano) |
| Comunicar novo prazo / atraso definitivo aos 23 clientes | Order Management Agent | Sendo feita (dispara após C.2 ser respondida) |
| Registrar recorrência para gestão de performance do seller | Order Management Agent | Realizada (logging automático, não exige confirmação) |

**Branch D**

| Tarefa | Lead | Status |
|---|---|---|
| Investigar causa não mapeada (triagem manual) | Ecommerce Supervisor | Needs Attention (esperando humano) |
| Avaliar nova categoria no dicionário de eventos de origem | — | Mock / ilustrativo — não faz parte do fluxo real de Tarefas desta Ocorrência por enquanto |

---

## 5. Notas de escopo e assunções abertas

- O item "Avaliar nova categoria no dicionário de eventos de origem" é tratado como mock/placeholder nesta versão, não como Tarefa real do sistema.
- Extração automática (OCR) de conteúdo de arquivos anexados via `file_upload` está fora de escopo por enquanto — o anexo serve apenas como evidência visual para o operador.
- As convergências A.2.2 → Branch B e B.2.2 → Branch C reaproveitam o mesmo conjunto de perguntas/tarefas em vez de duplicar sub-árvores — importante manter essa lógica de reuso na implementação, para não gerar dois fluxos divergentes para o mesmo tipo de decisão (quantidade + quais pedidos + fonte).
