**ATA DE REUNIÃO**

**Assinaturas — VTEX <> Loja Super Saudável**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 02 de junho de 2026 |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions), Pedro Amodeo (Commercial Engineer), Marcelo Leonel (OMS), Luiz Costa (Product Designer) |
| **Participantes (Super Saudável)** | Rose Siqueira (Gerente de Operações), Charlles Pereira (Tecnologia / Integração VTEX), Vanessa Curitiba dos Reis (Gestora do Clube de Assinaturas), Thiago Oliveira (Medlevensohn) |
| **Natureza** | Reunião de discovery — mapeamento de dores, modelo operacional e necessidades do cliente para embasar o produto de Subscriptions/Membership da VTEX |

# 2. Objetivo da Reunião

Compreender como a Super Saudável opera hoje o seu clube de assinaturas e quais foram as limitações que a levaram a adotar uma solução externa (Pag Brasil) em lugar do módulo nativo da VTEX. A VTEX buscou mapear as necessidades reais de gestão, relatórios e flexibilidade para embasar o roadmap do produto de Subscriptions/Membership em desenvolvimento.

# 3. Contexto e Histórico

A Super Saudável é uma loja com mais de 20 anos de operação, especializada em produtos para saúde — principalmente tiras de glicemia e sensores de monitoramento contínuo. O modelo de recorrência foi adotado há aproximadamente 8–10 anos, motivado pela observação de que o produto é intrinsecamente recorrente e pela oportunidade de fidelizar o cliente no canal próprio. Hoje a loja possui mais de 1.000 assinantes ativos.

O clube de assinaturas foi inicialmente operado dentro da VTEX, mas limitações críticas do módulo nativo levaram a equipe a migrar a gestão de recorrência para a Pag Brasil, mantendo a VTEX como passagem dos pedidos para integração com o ERP (TOTVS SPS / SAP).

# 4. Arquitetura Operacional Atual

## 4.1 Como os sistemas se relacionam

- A Pag Brasil atua como gestor de pagamentos e administrador das assinaturas — ela programa, cobra e gerencia o ciclo de vida de cada recorrência.
- O pedido gerado pela Pag Brasil cai na VTEX como se fosse um pedido de marketplace — necessário para integração com o ERP (TOTVS SPS / SAP) e para o fluxo logístico.
- O módulo nativo de assinaturas da VTEX está ativo mas pausado — utilizado apenas como backup/registro de segurança das assinaturas, sem gerar cobranças, ou seja, só fica o registro apenas do primeiro pedido na VTEX.
- O SAP funciona apenas como registro de pedido e relatório de vendas, não sendo usado para administração da recorrência.

## 4.2 Razão da dupla manutenção (VTEX + Pag Brasil)

Todas as assinaturas estão cadastradas nos dois sistemas simultaneamente. A decisão foi estratégica: caso a parceria com a Pag Brasil seja encerrada, a Super Saudável já possui o histórico de assinaturas na VTEX como ponto de retomada.

# 5. Por que a Super Saudável saiu do módulo nativo da VTEX

*"A gente saiu da VTEX muito porque a VTEX fez por merecer no sentido de não nos dar informação sobre a nossa assinatura." — Rose Siqueira*

## 5.1 Ausência de dashboard e relatórios gerenciais

- Impossibilidade de saber, em tempo real, quantas recorrências seriam cobradas em determinado período e qual o valor previsto.
- O relatório extraído da VTEX não trazia a informação de qual plano cada assinante estava vinculado — com mais de 1.000 assinantes, identificar isso exigia entrar manualmente em cada registro um a um.
- Ausência de previsibilidade financeira: a diretoria pedia números de recorrência e a equipe ficava "vendida" — sem capacidade de responder sem refazer análises manualmente.
- Ausência de ciclo de vida da assinatura: não era possível saber se era o primeiro, segundo ou terceiro pedido recorrente de um cliente.

## 5.2 Falta de flexibilidade para edição sem cancelamento

- Para qualquer alteração relevante (cartão de crédito, data de cobrança, inclusão ou remoção de produto), o processo exigia cancelar a assinatura e criar uma nova — gerando atrito operacional e de experiência para o cliente.

## 5.3 Volume operacional insustentável

Com mais de 1.000 assinantes ativos, o custo operacional de processos manuais tornava a operação inviável dentro das limitações do módulo VTEX.

# 6. O que a Pag Brasil Oferece (e o que ainda Falta)

## 6.1 O que resolveu

- Dashboard com visibilidade em tempo real: novas assinaturas, recorrentes, canceladas, sucesso de cobranças — filtráveis por período.
- Previsão financeira: valores previstos e atuais, com capacidade de saber quanto vai recorrer em determinada data e qual o impacto no faturamento.
- Número de ciclo de cada assinatura (1ª, 2ª, 3ª recorrência) com nomenclatura diferenciada por adesão vs. renovação.
- Rastreio de movimentações: histórico de tudo que ocorreu em cada assinatura (tentativas, cancelamentos, quem executou cada ação).
- Retentativas automáticas de cobrança: em caso de falha no cartão, o sistema tenta novamente e dispara link de pagamento para o cliente inserir novo cartão.
- Flexibilidade de edição: troca de cartão, inclusão ou remoção de produto, alteração de data de cobrança — sem precisar recriar a assinatura.
- Criação de promoções dentro de um plano para assinantes específicos.

## 6.2 Dashboard de Assinaturas da Pag Brasil

*(imagem do dashboard incluída no documento original — não reproduzida neste markdown)*

## 6.3 O que ainda não funciona na Pag Brasil

*Alteração de endereço de entrega: o sistema da Pag Brasil não aceita atualizações de endereço após a criação da assinatura. Mesmo alterando no painel, o pedido segue para o endereço original — obrigando o cancelamento e recriação da assinatura.*

- Divergências de números no dashboard — equipe está em processo contínuo de reportar e corrigir com a Pag Brasil.
- Pix automático ainda não disponível na conta da Super Saudável (aguardando liberação pela Pag Brasil — já é intenção ativar).
- E-mails transacionais com formatação/conteúdo ainda sendo ajustados.
- Plataforma ainda em maturação: a Pag Brasil ajusta funcionalidades conforme a Super Saudável sinaliza necessidades.

# 7. Meios de Pagamento

|  |  |
|:-:|:-:|
| **Recorrência hoje** | Somente cartão de crédito |
| **Pix automático** | Desejado — aguardando liberação pela Pag Brasil |
| **Link de pagamento** | Utilizado em casos de falha de cobrança ou quitação de cláusula de cancelamento (aceita outros meios, sem gerar nova recorrência) |
| **Varejo geral** | A Pag Brasil é exclusiva para assinaturas; o varejo usa outro gateway |

# 8. Planos e Benefícios do Clube

## 8.1 Estrutura dos planos

A Super Saudável possui atualmente quatro planos ativos (com um quinto em inclusão), todos com cobrança e envio bimestrais. Os planos são baseados em produtos físicos:

|  |  |
|:-:|:-:|
| **Plano** | **Produto principal** |
| Plano Tiras (3 variações) | Tiras de glicemia (diferentes quantidades) |
| Plano Smart | Sensor de monitoramento contínuo de glicemia |
| Plano Smart Kids | Sensor — versão infantil (brinde diferenciado: livro de colorir, tatuagem) |
| Novo plano (em inclusão) | A ser confirmado |

## 8.2 Benefícios oferecidos

- Desconto no site: 5% para assinantes de planos de tiras / 8% para assinantes de planos Smart — cupom exclusivo de assinante, uso livre, quantas vezes quiser.
- Frete grátis.
- Rede de parcerias: descontos em drogarias e lojas de departamento, administrada por parceiro externo especializado.
- Telemedicina: descontos em consultas via plataforma parceira, dentro da rede de parcerias.
- Brindes bimestrais: padronizados para a maioria dos planos, diferenciados para o Smart Kids.

## 8.3 Filosofia de segmentação — contexto de saúde

*A Super Saudável adotou conscientemente uma padronização de benefícios para todos os planos, sem gamificação por volume de consumo. A justificativa: no contexto de saúde, "premiar quem usa mais" seria eticamente sensível — quem usa mais produto pode estar mais doente, não necessariamente ser um cliente mais valioso a ser recompensado.*

# 9. Compra Programada (Além do Clube)

Além do clube de assinaturas, a Super Saudável oferece "compra programada" — produto de recorrência simples para itens de consumo do site, com valor reduzido e ciclos configuráveis (15, 30 ou 60 dias). Funciona como pedido recorrente básico, sem vínculo com o clube de benefícios.

# 10. Autonomia do Cliente e Decisão Gerencial

A Super Saudável optou por centralizar ações como cancelamento e troca de endereço, retirando a autonomia do cliente para executá-las de forma self-service. Essa foi uma decisão gerencial, não uma limitação técnica da Pag Brasil:

- Durante a fase de transição entre VTEX e Pag Brasil, clientes cancelavam na VTEX mas continuavam sendo cobrados na Pag Brasil (e vice-versa), gerando cobranças indevidas e insatisfação.
- Para evitar descompassos, a equipe centralizou cancelamentos e alterações de endereço como ações internas — o cliente precisa entrar em contato.
- O cliente pode trocar o cartão de forma autônoma na área do assinante da Pag Brasil.
- A equipe reconhece que o cenário ideal seria self-service para todas as ações — e que isso pode ser liberado quando o descompasso entre plataformas for eliminado.

# 11. Lançamento do Novo Aplicativo

A Super Saudável está desenvolvendo um aplicativo próprio (com a VTEX como parceira). Para o lançamento, a equipe está explorando estratégias de atração de usuários, incluindo:

- Produto de teste para os primeiros usuários que instalarem o app.
- Benefício exclusivo de entrada para converter instalações em assinantes.

Nenhuma dessas iniciativas está formalizada — são ideias em estágio inicial.

# 12. Cenário Ideal — O que a Super Saudável quer da VTEX

*"O melhor cenário seria que tudo ficasse dentro da VTEX, desde que a plataforma oferecesse um painel com informações claras, detalhadas e autonomia para editar planos e aplicar promoções específicas sem ferramentas externas." — Vanessa Curitiba dos Reis*

Os requisitos mínimos declarados para considerar retorno ao ecossistema nativo VTEX:

|  |  |
|:-:|:-:|
| **Funcionalidade** | **Descrição** |
| Dashboard em tempo real | Novas assinaturas, recorrentes, canceladas, taxa de sucesso — filtráveis por período e valor |
| Previsão financeira | Quanto vai recorrer em determinada data / período (previsto vs. realizado) |
| Ciclo de vida da assinatura | Identificação do número de recorrência (1ª, 2ª, 3ª...) e histórico de movimentações |
| Relatório com plano do assinante | Coluna de plano no relatório exportável, sem necessidade de acesso individual |
| Edição sem cancelamento | Trocar cartão, alterar data de cobrança, incluir/remover produto sem recriar a assinatura |
| Alteração de endereço | Atualização de dados de entrega refletida no pedido gerado pela recorrência |
| Promoções por assinante | Capacidade de criar ofertas/condições específicas para um assinante ou grupo |
| Self-service para o cliente | Gestão autônoma de cancelamento, pausa e troca de endereço pelo próprio assinante |

# 13. Posição e Comprometimento da VTEX

Vanessa dos Santos Borges confirmou que a VTEX está desenvolvendo ativamente um novo produto de Subscriptions/Membership, com foco exatamente nas lacunas identificadas. Pontos compartilhados:

- O produto atual é reconhecidamente limitado — apenas pedido recorrente, sem clube com benefícios integrados ao módulo de promoções e pricing.
- O novo produto em desenvolvimento é o "membership" (clube de fidelidade), desenhado para cobrir as necessidades mapeadas com clientes como a Super Saudável.
- A VTEX está em fase de discovery com múltiplos clientes — as conversas moldam o produto, mas não são compromissos de customização individual.
- A Super Saudável foi convidada a participar da fase de beta quando o produto estiver disponível para testes.
- O dashboard de métricas ainda não está sendo desenhado neste momento — o foco atual é o produto de membership em si.
