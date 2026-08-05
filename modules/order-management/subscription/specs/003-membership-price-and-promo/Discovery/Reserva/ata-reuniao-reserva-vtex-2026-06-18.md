**ATA DE REUNIÃO**

**Discovery Subscriptions — VTEX <> Reserva**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 18 de junho de 2026 |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions / OMS), Gabriel Parracho (Commercial Engineer), Luiz Costa (Product Designer), Marcelo Leonel (OMS — não participou) |
| **Participantes (Reserva)** | Clara Farias (Product Manager — Reserva / Grupo Soma) |
| **Natureza** | Reunião de discovery — primeiro contato para entender o modelo do programa Prime da Reserva, dores operacionais e comparativo com a marca Oficina (mesmo grupo) |
| **Contexto** | A Reserva faz parte do Grupo Soma, que também opera a marca Oficina Reserva. Ambas têm programas Prime distintos rodando na VTEX. |

# 2. Objetivo da Reunião

Entender como a Reserva opera seu clube de benefícios Prime dentro da VTEX, mapear dores técnicas e operacionais do modelo atual, e compreender as diferenças entre as abordagens da Reserva e da Oficina — para embasar o roadmap do produto de Subscriptions/Membership da VTEX.

# 3. Contexto: O Programa Prime da Reserva

## 3.1 O que é o Prime

O Prime da Reserva é um clube de benefícios (membership puro), sem entrega de produto físico recorrente atrelada. O cliente paga uma anuidade e passa a ter acesso a benefícios enquanto o plano estiver vigente.

|  |  |
|:-:|:-:|
| **Plano** | Anual (12 meses) |
| **Valor** | R$ 299 |
| **Desconto principal** | 15% em produtos do site da Reserva |
| **Frete** | Frete grátis |
| **Outros benefícios** | Descontos em parceiros externos (hotéis, ateliers, serviços) |
| **Benefícios sazonais** | Ações exclusivas para assinantes Prime (ex.: conteúdo especial no Dia dos Pais) |
| **Produto recorrente** | Nenhum — a Reserva não tem SKUs com reposição automática |

## 3.2 Lógica técnica de benefícios

A Reserva construiu uma arquitetura própria para gerenciar o Prime dentro da VTEX, pois o módulo nativo não suportava o modelo de membership puro:

- Backend proprietário que escuta pedidos — quando detecta um pedido contendo o produto Prime, marca o cliente em um cluster no Master Data da VTEX.
- Benefícios (desconto + frete grátis) são aplicados via promoção de audiência baseada no cluster.
- Data de expiração: o backend registra a data de validade do Prime (ex.: 18 de junho de 2027) e roda diariamente para remover o cluster de quem venceu.
- Renovação: usa o módulo de Subscriptions da VTEX como "anexo" ao pedido — o produto Prime é tratado como um item de assinatura na plataforma.

*"A gente teve que criar essa inteligência. Se o produto já tivesse um meio, um modelo pronto para serviço com algum benefício atrelado, seria mais fácil de fazer." — Clara Farias*

## 3.3 Motivação para o modelo anual

A Reserva optou por um plano anual (em vez de mensal) após analisar o comportamento de compra:

- Assinatura mensal seria facilmente "burlada": o cliente assinaria, compraria, cancelaria e re-assinaria quando precisasse — sem custo real de fidelização.
- O plano anual força o cliente a pensar recorrentemente na Reserva como canal preferencial ao longo do ano.
- Resultado comprovado: a frequência de compra de clientes Prime aumenta de forma mensurável.

## 3.4 Estratégia de vendas — canal físico como motor

*98% da base de clientes Prime nasce nas lojas físicas. A conversão online é marginal (1–2 pedidos/dia). O modelo de upsell na loja funciona quando o vendedor consegue demonstrar que, em compras acima de R$ 2.000, o desconto de 15% do Prime cobre ou supera o valor do plano (R$ 299). Exemplo: compra de R$ 2.000 → desconto de R$ 300 → o Prime sai de graça, e o cliente ainda fica com R$ 1 de economia.*

- Para itens de alto ticket (TVs, roupas acima de R$ 2.500): o Prime passa a ser gratuito do ponto de vista do cliente — o desconto supera o custo do plano.
- Online: a Reserva planeja implementar um fluxo de sugestão de Prime para carrinhos acima de R$ 2.000, mas ainda não lançou. O fluxo de apresentação do benefício no site ainda não foi convertido em resultado.

# 4. Dores e Limitações Identificadas

## 4.1 PDV (Links) impede renovação automática na primeira venda

*Dor crítica de negócio: a diretoria de lojas da Reserva adotou a diretriz de não dividir o pedido no PDV (sistema Links). Isso significa que a assinatura Prime é processada como pagamento via maquininha física — o que registra o pedido na VTEX como "promissória", sem salvar os dados do cartão para recorrência futura. Resultado: a renovação automática não ocorre após o primeiro ano.*

Fluxo atual da Reserva (com essa limitação):

- Ano 1: cliente compra o Prime na loja física junto com outros produtos. O pagamento vai para a maquininha. O Prime dura 12 meses, mas sem recorrência configurada.
- Ano 2: a Reserva envia uma mensagem (e-mail/WhatsApp) lembrando o cliente de renovar. Se o cliente responder e acessar o site, ele assina pela primeira vez com dados de cartão — configurando a recorrência.
- Ano 3 em diante: só a partir da segunda assinatura pelo site é que a renovação automática passa a funcionar.

*Contraste com a Oficina: a Oficina optou por um fluxo diferente — o vendedor pede ao cliente que assine direto no próprio celular, no site, no momento da compra. Isso configura a recorrência desde o primeiro ciclo (6 meses), sem dividir o pedido do PDV. Resultado: a Oficina renova automaticamente a partir do segundo ciclo.*

## 4.2 Regra de parcelamento herdada de outros itens no carrinho

Quando o Prime é adicionado ao carrinho junto com outros produtos, o checkout aplica a regra de parcelamento do produto mais permissivo — não do Prime. Exemplos:

- Se uma jaqueta aceita 12x, o Prime também passa a ser parcelável em 12x (o que não é desejado por regra de negócio).
- Se a Reserva limita o Prime a 5x, mas há uma jaqueta que vai a 12x, o cliente consegue parcelar tudo em 12x — incluindo o Prime.
- A Reserva não consegue atribuir regras de parcelamento independentes para itens diferentes no mesmo carrinho.

## 4.3 Apenas cartão de crédito como meio de pagamento

- A recorrência exige cartão salvo — por isso o Prime só pode ser pago com cartão de crédito.
- O cliente não pode pagar a assinatura com Pix e registrar um cartão separado para a renovação futura.
- Pix Automático (Pix recorrente) seria desejável para desacoplar o pagamento inicial da recorrência.

*Clara Farias levantou uma questão relevante: a inteligência do Pix Automático deveria ficar na VTEX ou em um parceiro de pagamento? Vanessa dos Santos Borges confirmou que envolveria os dois lados.*

## 4.4 Limitação de promoção por audiência — sem valor mínimo de compra

A promoção de desconto do Prime é ativada por audiência (cluster no Master Data). O problema: ao associar a promoção à audiência Prime, não há campo nativo para exigir um valor mínimo de compra. Resultado:

- Um cliente Prime que compra uma meia de baixo valor aciona o desconto de 15% — o que não condiz com a estratégia comercial.
- A Reserva não consegue configurar, por exemplo, "desconto Prime válido apenas para compras acima de R$ 500" dentro da audiência.
- Clara Farias notou durante a reunião que um campo novo havia aparecido na tela de promoções — possível evolução recente da plataforma que pode resolver parcialmente a dor.

## 4.5 Dashboard nativo inutilizável — falha silenciosa por 2 anos

*Caso crítico: por conta de uma configuração incorreta do gateway de pagamento (que redirecionava para um parceiro não preparado para recorrência), as assinaturas da Reserva ficaram sem renovação por aproximadamente 2 anos — e a equipe não percebeu. O dashboard da VTEX marcava os pedidos como "completos" mesmo quando o gateway cancelava o pagamento após a tentativa. Ninguém acompanhava os indicadores com consistência.*

Inconsistências identificadas no dashboard durante a reunião:

- Dashboard mostra "742 completos" em um mês — mas apenas 16 pedidos tiveram pagamento efetivamente aprovado.
- O status "completo" parece ser atribuído ao pedido gerado, não ao pagamento aprovado — mascarando falhas de renovação.
- O campo "erro de pagamento" registrava apenas 141 casos, enquanto o real deveria ser próximo de 1.200 (diferença entre os 1.054 processados e os 16 aprovados).
- O dashboard apresentava erros técnicos de renderização mesmo durante a reunião (tela quebrando ao carregar).

Observação: a falha não seria facilmente detectada mesmo com alerta automático, pois alguns pedidos passavam ("gatos pingados"), o que faria o sistema interpretar como fluxo normal.

## 4.6 Ausência de alertas e monitoramento de renovação

- Não há notificação automática quando um ciclo de renovação falha.
- Não há monitoramento de taxa de sucesso de renovações com alertas configuráveis.
- A gestão do programa Prime não tem um time dedicado — o que amplifica o risco de falhas silenciosas como a descrita acima.

## 4.7 Parceiros de renovação descartados por controle de token

A Reserva explorou parceiros como Iglu e Seep para gerenciar o fluxo de renovação. Os projetos não avançaram pelo mesmo motivo em ambos os casos:

*"O token do cartão ficava com a Iglu e não com a gente. Ou seja, eu estaria entregando toda a minha base de clientes na mão deles para sempre." — Clara Farias. A decisão foi manter a governança dos dados de pagamento internamente.*

- A Reserva prefere uma solução onde o token do cartão permaneça sob sua gestão — seja pela VTEX nativamente, seja via integração com parceiro onde a Reserva retém o controle.
- O projeto de integração com parceiro está pausado, mas pode ser retomado com parceiros alternativos no futuro.

# 5. Comparativo — Reserva vs. Oficina

|  |  |
|:-:|:-:|
| **Característica** | **Reserva vs. Oficina** |
| Ciclo do plano | Reserva: anual (12 meses). Oficina: semestral (6 meses). |
| Fluxo de assinatura na loja | Reserva: Prime vendido no PDV junto com outros produtos (sem divisão de pedido). Oficina: cliente assina no próprio celular durante a compra, independentemente do PDV. |
| Renovação automática | Reserva: só a partir do 3º ciclo (1º ano loja sem recorrência → 2º via site → 3º automático). Oficina: já a partir do 2º ciclo (6 meses). |
| Percentual de desconto | Reserva: 15% fixo. Oficina: variável por produto, chegando a 40% em alguns itens. |
| Percepção de valor | Reserva: clube considerado fraco — desconto de 15% vs. cupom de vendedor de 10% deixa diferença pequena. Oficina: clube com benefícios mais robustos. |
| Pedido recorrente de produto | Reserva: nunca teve. Oficina: já teve (assinatura de cueca/meia) — descontinuado por motivos comerciais a confirmar. |

# 6. Pedidos Recorrentes de Produto

A Reserva nunca operou pedidos recorrentes de produto físico — o portfólio (moda) não tem natureza de reposição. A Oficina chegou a ter uma assinatura de roupas íntimas (cueca, meia) com envio periódico, mas descontinuou. Clara Farias não soube informar o motivo — se foi decisão comercial ou técnica — e se comprometeu a investigar.

# 7. Contexto do Roadmap VTEX

Vanessa dos Santos Borges não compartilhou detalhes específicos de roadmap nesta reunião, dado o caráter de primeiro contato. O foco foi inteiramente em ouvir as dores do cliente. A intenção de desenvolver um produto de Membership nativo foi mencionada implicitamente como contexto para a série de entrevistas de discovery em curso.
