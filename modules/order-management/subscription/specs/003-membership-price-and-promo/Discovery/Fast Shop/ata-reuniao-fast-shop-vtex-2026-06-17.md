**ATA DE REUNIÃO**

**OMS VTEX + Fast Shop — Subscriptions Discovery**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 17 de junho de 2026 |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions / OMS), Danielle Silva (Commercial Engineer), Luiz Costa (Product Designer) |
| **Participantes (Fast Shop)** | Pedro Paulo Simão Filho (TI / Gerente — interface entre tecnologia e negócio) |
| **Natureza** | Reunião de discovery — mapeamento do modelo de negócio do programa Prime, dores operacionais e requisitos para evolução do produto de Subscriptions/Membership da VTEX |

# 2. Objetivo da Reunião

Entender como a Fast Shop opera hoje o programa Prime — seu clube de benefícios (membership) — dentro da plataforma VTEX, identificar as principais dores técnicas e operacionais geradas pelo descolamento entre o modelo de membership e o módulo de assinaturas nativo (orientado a replenishment), e coletar insumos para orientar o roadmap do produto de Subscriptions/Membership da VTEX.

# 3. Contexto: O Programa Prime da Fast Shop

## 3.1 O que é o Prime

O Prime é um clube de benefícios (membership puro), dissociado de qualquer compra ou entrega recorrente de produto. O cliente assina e passa a ter direito a benefícios enquanto o plano estiver ativo — independentemente de realizar compras.

*"Posso entrar agora no site e dizer: quero ser Prime. Que que tu quer comprar? Nada. Só quero ser Prime. Pago R$ 180 e pronto, só membro." — Pedro Paulo Simão Filho*

## 3.2 Estrutura dos planos

|  |  |
|:-:|:-:|
| **Planos disponíveis** | Prime e Prime Plus |
| **Vigência** | 12 meses (plano anual) |
| **Valores** | R$ 179 (Prime) e R$ 289 (Prime Plus) — valores podem variar |
| **Renovação** | Automática ao final de 12 meses (via cartão de crédito salvo) |
| **Produto recorrente** | Nenhum — não há SKU de reposição automática. A Fast Shop vende TVs, iPhones, linha branca — produtos não recorrentes por natureza. |

## 3.3 Benefícios do Prime

- Desconto em produtos por faixas de valor: ex. 4% até R$ 1.000, 3% de R$ 1.000 a R$ 5.000, 2% acima de R$ 5.000.
- Frete grátis em modalidades específicas, como entrega Ultrafast (entrega em até 2 horas).
- Desconto em serviços de instalação: ex. 50% a 100% de desconto em 1 ou 2 instalações por ano.
- Cashback dobrado ou em valor superior ao padrão.
- Os benefícios são gerenciados pela área comercial e podem ser ajustados ao longo do tempo (adicionados ou removidos).

## 3.4 Motivação estratégica

*A recorrência de compra de clientes Prime é nitidamente superior à de não-Prime. A recorrência padrão da Fast Shop é de aproximadamente 2,7 anos entre compras. Um cliente Prime compra pelo menos uma vez por ano — ciclo de retorno abaixo de 12 meses. O programa existe justamente para acelerar esse comportamento de recompra.*

# 4. Arquitetura Técnica Atual

O programa Prime opera dentro da VTEX utilizando o módulo nativo de assinaturas (originalmente concebido para replenishment/pedido recorrente). Essa é a raiz de grande parte das dores — o modelo de membership da Fast Shop não tem fit natural com esse módulo.

*"A gente usou chave de fenda para pregar prego. Usamos uma solução que funciona minimamente para assinatura de plano de faturamento — que não tem nada a ver com um plano de membership. É por isso que a gente sofre tanto." — Pedro Paulo Simão Filho*

- Meio de pagamento aceito: somente cartão de crédito (cartão salvo obrigatório para renovação automática).
- Integração de cashback: utiliza o recurso de Gift Card nativo da VTEX para representar o saldo de cashback do cliente.
- Sem dashboard nativo utilizável: toda a gestão de indicadores é feita via BI externo.
- Configurações de renovação: realizadas via API, com suporte do time de TI — sem painel administrativo acessível pela área de negócio.

## 4.1 Histórico da migração

|  |  |
|:-:|:-:|
| **Marco** | **Data** |
| Início da implementação da VTEX na Fast Shop | Setembro de 2024 |
| Migração dos dados de cartão (compliance PCI) | Julho/Agosto de 2025 |
| Conclusão da migração completa do programa Prime | 18 de março de 2026 |

A migração foi descrita como "sofrimento do começo ao fim" — envolveu complexidades de normas PCI, perda de dados de cartão durante a carga, falta de disponibilidade do time de pagamentos da VTEX na época do projeto e prazo total de 18 meses.

# 5. Dores e Limitações Operacionais

## 5.1 Renovação automática e chargeback

*Dor crítica: O plano anual renova automaticamente após 12 meses via cartão. Muitos clientes esquecem da assinatura e, ao verem a cobrança, solicitam cancelamento ou registram chargeback junto à operadora. A Fast Shop enfrenta alto volume de chargebacks e penalizações junto às adquirentes.*

## 5.2 Retentativas de pagamento imediatas e excessivas

Quando o cartão é recusado na renovação, o sistema executa 5 tentativas em intervalos muito curtos (às 6h, 6h30, 8h, 10h). Problemas:

- Intervalo insuficiente para o cliente perceber o problema e trocar o cartão antes das próximas tentativas.
- Violação de regras da ABECS: cada motivo de recusa (insuficiência de fundos, cartão cancelado, suspeita de fraude etc.) tem regras distintas sobre se pode e quantas vezes pode ser retentado. Hoje o sistema ignora essa granularidade.
- Custo financeiro direto: a Fast Shop paga aproximadamente R$ 140/ano em penalizações por retentativas inadequadas.
- Queda de 30% na taxa de aprovação de renovações após a migração para a VTEX (anteriormente ~50%, agora ~20%).

O que a Fast Shop precisa: configurar o número de tentativas, o espaçamento entre elas e, idealmente, associar campanhas de comunicação a cada tentativa (ex.: na 3ª tentativa, após 15 dias, enviar desconto para incentivar atualização do cartão).

## 5.3 Gestão via API — sem painel administrativo

- Todos os parâmetros de renovação (número de tentativas, espaçamento, regras) só podem ser ajustados via API, exigindo intervenção do time de TI.
- A área de negócio (quem opera o programa) não tem autonomia para fazer ajustes operacionais sem abertura de chamado técnico.
- Qualquer configuração possível dentro da VTEX, por menor que seja, ainda requer suporte de desenvolvimento.

## 5.4 Ausência de Pix como meio de pagamento

A venda do plano Prime é realizada exclusivamente via cartão de crédito. O Pix representa uma parcela significativa das vendas gerais da Fast Shop — mas não pode ser usado para assinar o Prime. Impactos:

- Clientes que preferem Pix precisam primeiro assinar o Prime via cartão, depois retornar para comprar o produto via Pix em um segundo pedido — jornada fragmentada e ruim.
- A Fast Shop dá 4% de desconto em Pix para todos os clientes, independentemente de serem Prime. Um cliente Prime que quer comprar um iPhone com desconto Pix + desconto Prime + cashback precisa fazer múltiplos pedidos separados — ou abrir mão de algum benefício.
- Solução de contorno adotada: foi criado um plano Prime sem renovação automática, vendido via Pix (12 meses fixos, sem recorrência), para reduzir a perda de base.

*O Pix Automático do Banco Central foi apontado como solução desejada: permitiria um plano Prime com Pix e com renovação recorrente, eliminando a necessidade do plano sem recorrência. Pedido feito à VTEX há mais de 1 ano (solicitado em março/abril de 2025).*

## 5.5 Checkout bloqueado para múltiplos meios de pagamento

Quando o carrinho contém o plano Prime (que exige cartão), todos os outros meios de pagamento são bloqueados para o pedido inteiro. Situações afetadas:

- Cliente quer pagar produto com Pix (4% de desconto) e assinar o Prime com cartão — impossível em um único pedido.
- Cliente quer usar saldo de cashback (gift card nativo) junto com Pix — impossível no checkout atual.
- Cliente com lista de casamento (gift card) quer completar o pagamento com Pix — mesma limitação.

A Danielle Silva mencionou que há uma tratativa em andamento para resolver essa questão de múltiplos meios de pagamento — esperada para ser resolvida em breve.

## 5.6 Cancelamento e gestão do ciclo de vida

Dois cenários de cancelamento problemáticos:

- Cancelamento antecipado (cliente no 8º mês quer cancelar a renovação que ocorre no 12º mês): não há fluxo nativo para 'cancelar a renovação futura' sem cancelar a assinatura vigente. O cliente pagou e tem direito aos 12 meses — o cancelamento precisa ser feito manualmente por fora. Estorno parcial proporcional ao tempo restante também é feito manualmente.
- Cancelamento programado (cliente quer manter os últimos 4 meses mas garantir que não haverá renovação): não há mecanismo nativo para bloquear uma renovação futura sem cancelar a assinatura inteira. O time usa "peripécias técnicas" internas para garantir o não-cancelamento.
- Auto-cancelamento self-service: não existe. O cliente precisa ligar para o SAC para cancelar — ou tentar fazer pelo site, mas o processo é complexo.

## 5.7 Renovação fantasma — risco estrutural iminente

*Risco crítico identificado pelo desenvolvedor Ivo (Fast Shop): assinaturas cujos cartões foram recusados nas tentativas de renovação de 2025 continuam no sistema como candidatas a nova tentativa de renovação em 2026 — mesmo que o cliente não tenha renovado nem atualizado o cartão. O problema começa a se manifestar em setembro de 2026 (1 ano após o início das primeiras renovações pós-migração). Não há mecanismo nativo para remover esses registros do ciclo de faturamento.*

## 5.8 Free Trial — períodos gratuitos

No sistema anterior (Vind), a Fast Shop operava promoções de 'meses grátis' de assinatura — ex.: assine e ganhe 3 meses adicionais, com a cobrança iniciando após esse período ou com a data de renovação estendida em 15 meses em vez de 12. Na VTEX:

- Não há suporte nativo a free trials atrelados ao tempo de assinatura.
- A solução atual é calcular um desconto equivalente ao valor dos meses grátis — ex.: cobrar 9 meses em vez de 12. Isso não é o mesmo produto: não entrega a experiência de "3 meses grátis + 12 meses plenos".
- Impacto: estratégias de atração e aquisição de assinantes baseadas em trial ficam indisponíveis.

## 5.9 Dashboard nativo inutilizável

O painel de assinaturas da VTEX não atende as necessidades de gestão do programa Prime. A Fast Shop exporta todos os dados para um BI externo e mantém 17 painéis com indicadores granulares, incluindo: adesão, desistência, comportamento de compra dos assinantes, indicadores de renovação e planejamento de renovação futura.

# 6. Impacto na Base de Assinantes

*A base de assinantes Prime caiu de aproximadamente 100.000–110.000 para cerca de 26.000–27.000 após a migração para a VTEX. Uma queda de mais de 75%. Pedro Paulo atribuiu o problema principalmente à jornada ruim de cancelamento e às dificuldades operacionais geradas pelo descolamento entre o módulo de assinaturas e o modelo de membership.*

Segundo Pedro Paulo:

- O cliente que quer ser Prime persiste mesmo com a jornada ruim — o "cliente insistente". Mas a Fast Shop reconhece que está maltratando justamente o cliente mais valioso.
- A recorrência de compra dos clientes Prime (inferior a 12 meses) gera resultado que cobre todos os custos do programa — mas apenas se a base for suficientemente grande. Com 27 mil assinantes, o modelo perde escala.

# 7. Estratégia de Retenção Pós-Vencimento

Mesmo após o vencimento do plano (ou durante tentativas fracassadas de renovação), a Fast Shop mantém o status Prime do cliente temporariamente, enquanto tenta a renovação com novas comunicações:

- Notificação imediata no dia da falha: aviso de cartão expirado/recusado, pedido para atualizar.
- Renotificação em 3 dias.
- Renotificação em 15 dias.

A lógica é: o valor de um cliente Prime fidelizado supera em muito o valor de uma mensalidade proporcional. Manter o benefício ativo durante o período de recuperação é uma decisão estratégica consciente.

# 8. Possibilidade de Extensão para Sellers 3P

Pedro Paulo levantou a hipótese de expandir o uso do programa de faturamento para pedidos de sellers terceiros (marketplace 3P):

- Exemplo: a Fast Shop não tem produtos recorrentes em seu portfólio próprio, mas um seller como a Cobasi vende ração — que é um produto recorrente por natureza.
- O cliente poderia assinar via Fast Shop, e o pedido gerado seria direcionado ao seller, com split da receita (ex.: 10% Fast Shop, 90% seller).
- A nota fiscal seria emitida pelo seller, mas a experiência de assinatura seria dentro do ecossistema Fast Shop.

Vanessa dos Santos Borges indicou que acredita que o módulo de assinaturas já suporta 3P, mas confirmou que fará a verificação interna.

# 9. Diagnóstico Conceitual — Replenishment vs. Membership

|  |  |
|:-:|:-:|
| **Replenishment (módulo atual da VTEX)** | **Membership (modelo do Prime / Fast Shop)** |
| Foco: abastecer continuamente o cliente com um SKU específico. | Foco: conceder benefícios ao cliente enquanto o plano estiver ativo. |
| Ciclos frequentes (semanal, mensal). | Ciclo anual. |
| Pausa e pulo de ciclo fazem sentido operacional. | Cancelamento de renovação futura sem cancelar o plano vigente é o caso típico. |
| SKU fixo — mudar o produto exige recriar a assinatura. | Sem SKU atrelado — benefícios podem ser alterados sem impactar a assinatura. |
| Retentativa imediata faz sentido (cliente precisa do produto). | Retentativa espaçada com comunicação ativa é mais eficaz. |
| Custo de chargeback baixo (frequência conhecida). | Chargeback por "esquecimento" é um risco real no modelo anual. |

*Diagnóstico de Pedro Paulo: a VTEX hoje oferece um módulo de replenishment. O Prime precisa de um módulo de membership. São produtos distintos, com objetivos e comportamentos técnicos diferentes. O esforço de adaptar um ao outro gerou 18 meses de migração e as dores listadas acima.*

# 10. Posição e Roadmap da VTEX

Vanessa dos Santos Borges compartilhou os seguintes pontos sobre o produto em desenvolvimento:

|  |  |
|:-:|:-:|
| **Funcionalidade** | **Previsão** |
| Free Trial (período gratuito nativo) | Ainda em 2026 |
| Módulo de Membership nativo (clube de benefícios) | Q1 2027 |
| Pix Automático para assinaturas | A confirmar — depende de priorização por criticidade dos clientes |

*A Fast Shop foi identificada como cliente estratégico para o produto de Membership — pela escala do programa Prime, pela profundidade das dores mapeadas e pelo diagnóstico técnico detalhado fornecido por Pedro Paulo. O caso de uso (clube de benefícios puro, sem SKU recorrente, com ciclo anual) é exatamente o que o produto de Membership se propõe a atender.*
