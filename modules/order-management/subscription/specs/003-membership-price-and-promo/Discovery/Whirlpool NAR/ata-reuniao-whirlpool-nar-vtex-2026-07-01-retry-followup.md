**ATA DE REUNIÃO**

**Whirlpool NAR — Subscriptions Follow-up #1**

*Reunião conduzida em inglês. Este documento foi elaborado em português a partir da transcrição original.*

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 01 de julho de 2026 |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions), Angela Molano (Commercial Engineer), Lucas Spoladore, Raquel Tótora, Luiz Costa, Fernanda Brandão |
| **Participantes (WHP NAR)** | Nadia P. Sá, Raissa C. Santos, Amaro Silva, Mackenzie O'Hara, Atul Nagpal, Kevin Turchyn, Benjamin Whitney |
| **Natureza** | Reunião de follow-up técnico — detalhamento e alinhamento dos requisitos de retry de pagamento, ciclo de vida da assinatura, visibilidade operacional e validação pré-pedido |
| **Contexto** | Segunda reunião com a Whirlpool NAR. A primeira sessão (16/06) mapeou o fluxo completo. Esta reunião foca em requisitos específicos para entrega até dezembro de 2026, com base em documento de requisitos previamente compartilhado pelo time da Whirlpool. |

# 2. Objetivo da Reunião

Confirmar e detalhar os requisitos técnicos para implementação do mecanismo de retry de pagamento no módulo de assinaturas da VTEX — incluindo configurabilidade, ciclo de vida da assinatura em caso de falha, visibilidade operacional e pré-validação de pagamento. A reunião foi estruturada em torno de um documento de requisitos elaborado pelo time da Whirlpool NAR.

# 3. Contexto do Projeto e Timeline

## 3.1 Estratégia de rollout

Amaro Silva detalhou a estratégia de lançamento em duas etapas:

|  |  |
|:-:|:-:|
| **Fase** | **Descrição** |
| MVP — Primeira loja (MAG) | Assinaturas operadas via Hybris/SAP (sistema atual). O front-end do VTEX aponta para as APIs do Hybris. Não haverá migration de assinaturas existentes para a VTEX ainda. Funciona em paralelo. |
| Rollout completo — Segunda loja (KitchenAid) | Todas as funcionalidades de assinatura devem estar construídas e validadas na VTEX. Migração das assinaturas existentes do Hybris para a VTEX ocorre antes ou junto deste lançamento. |

*Prazo crítico: todas as melhorias de assinatura (incluindo retry, ciclo de vida e validação pré-pedido) devem estar construídas e validadas na plataforma VTEX até dezembro de 2026 — conforme contrato. O MVP poderá usar o Hybris enquanto isso, mas a segunda loja (KitchenAid) depende da VTEX completa.*

## 3.2 Clareza de escopo

*"Não devemos separar o que é necessário para o MVP do que é necessário para os rollouts — devemos focar no escopo de mudanças que precisam acontecer até o final do ano. Para o MVP estamos usando o modelo Hybris em paralelo. O importante é que em janeiro tudo esteja completo, testado e validado, e então migraremos de apontar para o Hybris para usar o novo modelo de assinaturas com todas as funcionalidades construídas." — Amaro Silva*

# 4. Mecanismo de Retry de Pagamento

## 4.1 Problema atual (comportamento a ser corrigido)

*O sistema atual tenta criar pedidos recorrentes com frequência excessiva — várias tentativas em minutos, inclusive às 3h da manhã. Isso causa notificações ao cliente em horários inadequados e pode gerar alertas/penalizações das adquirentes por tentativas abusivas de cobrança.*

## 4.2 Requisito — Configurabilidade do retry

A Whirlpool NAR requer que o retry de pagamento seja configurável, sem fixar regras no código (hard-coding):

- Número de tentativas: configurável (ex.: 3, 5, 10 — conforme necessidade do negócio).
- Intervalo entre tentativas: configurável (ex.: a cada 4 horas, 1 dia, etc.).
- Possibilidade de alterar os parâmetros no futuro sem intervenção técnica, conforme mudanças de necessidade operacional ou regras das adquirentes.

## 4.3 Alinhamento sobre diferenciação por tipo de erro

Vanessa dos Santos Borges questionou se o número de retentativas deveria variar conforme o tipo de erro de pagamento (ex.: cartão inválido vs. saldo insuficiente vs. erro de gateway).

*Decisão alinhada: configuração uniforme — o mesmo padrão de retry para todos os tipos de falha de pagamento, independentemente do motivo específico. Não é necessária regra diferenciada por tipo de erro.*

## 4.4 Comportamento técnico dos pedidos com falha

Esclarecimento técnico importante alinhado durante a reunião:

- Quando um pagamento falha, a VTEX NÃO reprocessa o mesmo pedido — o pedido fica com status de 'incompleto' e não é integrado ao sistema (não vai para SAP/ECC).
- A cada nova tentativa de retry, um novo pedido é gerado — somente integrado ao SAP/ECC quando o pagamento for aprovado.
- O cliente NÃO vê o pedido incompleto no front-end (Minha Conta) — é uma entidade interna do sistema.
- O pedido incompleto possui um ID de pedido no back-end da VTEX — disponível para uso pelos operadores para rastreamento.

*Ponto em aberto (a confirmar): se o ID do pedido incompleto persiste durante os ciclos de retry (mesma ID em todas as tentativas) ou é gerado um novo ID a cada tentativa. Nadia P. Sá verificará com o time do Hybris.*

# 5. Ciclo de Vida da Assinatura em Caso de Falha

## 5.1 Comportamento desejado (alinhado na reunião)

*Decisão alinhada: após esgotadas as tentativas de retry, o sistema deve PAUSAR a assinatura (não cancelar imediatamente). O cliente é notificado por e-mail para atualizar o método de pagamento. Se o pagamento não for atualizado em 30 dias, a assinatura é CANCELADA.*

Fluxo completo:

- Tentativa de criação do pedido recorrente → pagamento recusado.
- Sistema executa retentativas configuradas (número e intervalo definidos).
- Após esgotar as tentativas: assinatura pausada + e-mail ao cliente.
- Janela de 30 dias para o cliente atualizar o método de pagamento.
- Se não atualizado em 30 dias: assinatura cancelada.

## 5.2 Por que pausar é preferível a pular o ciclo

A VTEX havia sugerido 'skip do ciclo' como alternativa mais simples. A Whirlpool NAR preferiu a abordagem de pausa pelos seguintes motivos:

- Visibilidade de receita: se assinaturas com pagamento sempre falho continuam 'ativas' (apenas pulando ciclos), a empresa não sabe que nunca receberá aquela receita — comprometendo as previsões financeiras.
- Clareza operacional: a pausa torna explícito que há um problema — facilitando ação do time de CX e do cliente.

*"Se você tem assinaturas que sempre falham, você não sabe que está contando com aquela receita que nunca vai chegar. A pausa dá visibilidade real sobre o que realmente vai ser cobrado." — Nadia P. Sá / Angela Molano*

## 5.3 Ação após esgotamento do retry — confirmação

Vanessa questionou se a ação final deveria ser configurável (skip, pausar ou cancelar). A resposta foi:

- Para erros de cartão de crédito: o fluxo é fixo — pausar e, após 30 dias sem atualização, cancelar. Não há necessidade de configurar a ação final para este caso específico.
- Pause, skip e cancel geral (pelo cliente): disponíveis como ações no self-service do Minha Conta — mas são ações distintas do ciclo de retry automático.

# 6. Validação de Pagamento Pré-Criação de Pedido

## 6.1 Comportamento atual (Hybris)

O sistema Hybris realiza uma validação de cartão antes da data de criação do pedido recorrente — mas com autorização de zero dólares (apenas verifica se o cartão existe e não está expirado, sem garantir que há saldo disponível).

## 6.2 Requisito da Whirlpool NAR

*Decisão alinhada: a VTEX deve implementar validação com autorização pelo valor total do pedido (full-dollar authorization), incluindo impostos/taxas, antes de criar o pedido recorrente. Isso garante que os fundos estão realmente disponíveis — não apenas que o cartão é válido. Este é o mesmo comportamento adotado nos pedidos normais do storefront.*

- Atul Nagpal confirmou: a expectativa é full-dollar authorization com taxes incluídas, alinhado ao comportamento já praticado nos pedidos comuns.
- Mackenzie O'Hara se comprometeu a documentar os requisitos de timing e processo para a validação do cartão (ex.: quantos dias antes do ciclo, janela de autorização com FedEx).

# 7. Visibilidade Operacional e Notificações

## 7.1 Notificação ao cliente (e-mail)

*Alinhado: e-mail de notificação ao cliente quando o pagamento falha é mantido — requisito confirmado. O cliente recebe notificação para atualizar o método de pagamento.*

## 7.2 Notificação ao time operacional (admin)

A Whirlpool usa um painel Tableau para rastrear assinaturas com falha. O requisito não é receber um e-mail por cada falha (o que geraria milhares de alertas), mas sim ter um mecanismo de reporte consolidado. Opções discutidas:

|  |  |
|:-:|:-:|
| **Abordagem** | **Detalhe** |
| Order hooks/feeds da VTEX | A VTEX disponibiliza hooks e feeds de atualização de pedidos — é possível configurar um endpoint para capturar todos os eventos de pedidos com tag 'subscription', incluindo falhas de pagamento. |
| GCP Data Lake | Amaro Silva sugeriu enviar os dados de falha para o GCP Data Lake da Whirlpool, que poderia ser consumido pela ferramenta de BI existente (Tableau). |
| Dashboard nativo VTEX | Existe uma tela de admin com lista de pedidos com problema — mas sem opção de exportação nativa. Não substitui um relatório granular. |

*Decisão pendente (a confirmar com CPG): a preferência é pelo reporte via feed/hooks com ingestão no GCP/Tableau — evitando dependência de uma UI nativa na VTEX. Nadia verificará com o time CPG se essa abordagem é suficiente ou se há necessidade de funcionalidade adicional na VTEX.*

## 7.3 Referência de pedido para operadores (back-office)

Mackenzie O'Hara levantou uma questão prática: se o pedido incompleto não é visível ao cliente, como o operador de CX referenciar o pedido ao contatar o cliente para atualizar o pagamento?

- Lucas Spoladore esclareceu: a VTEX gera um ID de pedido incompleto no back-end — disponível para os operadores, mas não exibido no front-end ao cliente.
- Com esse ID, os operadores conseguem referenciar o problema internamente e usar nos sistemas de back-office (SAP/ECC).
- Ponto em aberto: verificar se o sistema Hybris atual exibe pedidos incompletos ao cliente — para entender o delta de comportamento com a nova implementação. Nadia confirmará.

# 8. Decisões Formalizadas na Reunião

| Decisão | Detalhe | Prazo | Status |
|:-:|:-:|:-:|:-:|
| Prazo de entrega do retry | Mecanismo de retry totalmente construído e validado na VTEX até dezembro de 2026. | Dezembro/2026 | ✓ Alinhado |
| Ciclo de vida da assinatura | Pausar após falha de retry → notificar cliente → cancelar após 30 dias sem atualização. | EOY 2026 | ✓ Alinhado |
| Retry uniforme (sem diferenciação por tipo de erro) | Mesmo padrão de retry para todos os tipos de falha de pagamento. | EOY 2026 | ✓ Alinhado |
| Full-dollar authorization pré-pedido | Validação pelo valor total do pedido (com taxes) antes de criar o pedido recorrente. | EOY 2026 | ✓ Alinhado |
