**ATA DE REUNIÃO**

**Subscriptions — VTEX <> Whirlpool NAR (North America Region)**

*Reunião conduzida em inglês. Este documento foi elaborado em português a partir da transcrição original.*

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 16 de junho de 2026 |
| **Participantes (VTEX)** | Julia Grisi Lolato (Lead — OMS, Logistics & Payments), Vanessa dos Santos Borges (PM — Subscriptions), Angela Molano (Commercial Engineer), Fernanda Brandão, Marcelo Leonel |
| **Participantes (WHP NAR)** | Nadia P. Sá (pós-compra / back-end), Raissa C. Santos (pré-compra / front-end), Amaro Silva, Benjamin Whitney, Christopher Lamb, Kevin Turchyn, Zenia Noronha, Frederick Gingell, Mackenzie O'Hara, Atul Nagpal |
| **Natureza** | Revisão técnica do fluxo de assinaturas existente — walkthrough do PDP ao checkout e Minha Conta, com discussão de limitações, decisões de roadmap e próximos passos |
| **Contexto** | Whirlpool NAR opera subscriptions em produção nos sites MAG, Repo, Inside Pass e KitchenAid. A migração do back-end de assinaturas (hoje Hybris/SAP) para a VTEX está em curso. |

# 2. Objetivo da Reunião

Apresentar à equipe da VTEX o fluxo completo de assinaturas da Whirlpool NAR — da seleção no PDP até o gerenciamento no Minha Conta — para fornecer contexto técnico e de negócio necessário para a migração e evolução do produto de Subscriptions na plataforma VTEX.

# 3. Contexto do Negócio

*Assinaturas representam 55% da receita do negócio de filtros de água da Whirlpool NAR — uma das unidades de negócio com maior contribuição de receita. O produto é, portanto, crítico para a operação.*

- Produtos com subscriptions ativas: filtros de água (principal SKU), filtros antiodor de geladeira, produtos de limpeza e, em breve, serviços como garantia estendida.
- Produtos têm vida útil de 7 a 90 anos — serviços recorrentes de suporte e manutenção são estrategicamente relevantes.
- Back-end atual: toda a lógica de configuração de assinaturas (frequências, SKUs elegíveis, regras) é gerenciada no Hybris e SAP. A migração para a VTEX está prevista para o final de 2026.
- Sites ativos com subscriptions: MAG, Repo, Inside Pass e KitchenAid.

# 4. Fluxo de Compra — Pré-Venda (Raissa C. Santos)

## 4.1 Três pontos de entrada para assinatura

| Ponto de entrada | Descrição | Observação |
|:-:|:-:|:-:|
| PDP da geladeira (appliance) | Ao visualizar uma geladeira, o cliente vê a opção de assinar o filtro de água correspondente direto na PDP do eletrodoméstico e adicionar ao carrinho junto com o produto principal. | Frequência: de 2 a 6 meses, sendo 6 meses a frequência recomendada |
| PDP do filtro/acessório | Ao acessar diretamente o filtro, o cliente vê a opção 'Subscribe to Save' com seletor de frequência ajustável. | |
| Página do carrinho | Mesmo que o cliente não tenha selecionado assinatura no PDP, a opção aparece no carrinho como upsell. | Terceiro fluxo de conversão. |

## 4.2 Configuração de frequências

- As frequências disponíveis (ex.: 2, 3, 4, 5, 6 meses) são configuradas por SKU no SAP/Hybris — cada produto tem suas próprias opções.
- A frequência recomendada leva em conta o tipo de SKU e o pack (ex.: kit com 2 filtros → frequência maior).
- Decisão alinhada: no futuro, essas configurações deverão ser gerenciadas dentro da VTEX, não mais no Hybris.

## 4.3 Textos legais e promocionais

- Os textos legais (ex.: 'Savings apply to first order') e os textos promocionais (ex.: '30% off first order, 20% off following') são editáveis e configuráveis por SKU.
- A alterabilidade é um requisito legal: o time jurídico frequentemente solicita mudanças de conteúdo.
- Os percentuais de desconto são dinâmicos — definidos pela equipe de conversão conforme estratégia vigente e podem variar semanalmente.

*Decisão alinhada: textos legais e promocionais devem permanecer editáveis para acomodar requisitos jurídicos e estratégias de marketing em constante mudança.*

## 4.4 Restrições no carrinho e checkout

- Ao adicionar um item de assinatura ao carrinho: PayPal e Affirm são automaticamente ocultados — apenas cartão de crédito é aceito para assinaturas.
- Guest checkout é desabilitado para pedidos com assinatura — o cliente é forçado a fazer login ou criar uma conta.
- No checkout, somente cartão de crédito está disponível como forma de pagamento para assinaturas.
- O salvamento do cartão é obrigatório — se o cliente não selecionar um cartão salvo, deve ser exibida mensagem de erro ou o campo é bloqueado.

## 4.5 Oportunidade de melhoria: múltiplos meios de pagamento

*Julia Grisi Lolato identificou uma oportunidade: quando o cliente compra uma geladeira junto com a assinatura do filtro, ele é forçado a usar cartão para todo o pedido — mas poderia querer usar Affirm (BNPL) para o eletrodoméstico e cartão apenas para a assinatura. A solução de múltiplos meios de pagamento da VTEX pode viabilizar isso. O time concordou em investigar.*

# 5. Gerenciamento Pós-Compra — Minha Conta (Nadia P. Sá)

A apresentação foi feita via protótipo (ambiente de staging indisponível). O Minha Conta foi redesenhado para o projeto Prometheus e ainda não está 100% em produção.

## 5.1 Visão geral das assinaturas ativas

- O cliente vê: produto, próxima data de envio, frequência configurada e histórico de pedidos passados.
- Clientes sem assinatura ativa veem mensagem com link direto para a página de subscrição.
- Informações disponíveis: endereço de entrega padrão, método de pagamento padrão e suporte ao cliente.

## 5.2 Ações disponíveis pelo cliente (self-service)

- Alterar a data do próximo envio (via calendário).
- Atualizar a frequência de entrega.
- Ajustar a quantidade de itens.
- Trocar o cartão de crédito cadastrado.
- Reprogramar um envio em vez de cancelar (estratégia de retenção — ver seção 6).
- Cancelar a assinatura — com motivo opcional (não obrigatório). Confirmação enviada por e-mail.

Importante: ao alterar a data de um envio, todos os envios subsequentes são recalculados com base na nova data + frequência configurada.

## 5.3 Precificação dinâmica

*Decisão alinhada: o preço de cada pedido recorrente é o preço vigente do produto no momento do processamento — não é fixado no momento da inscrição. Promoções automáticas são aplicadas conforme ativas no período do envio. O histórico de preços por ciclo fica visível ao cliente no Minha Conta.*

- Implicação: o cliente pode pagar mais ou menos a cada ciclo, dependendo de promoções e preços vigentes.
- Julia Grisi Lolato confirmou: o desconto percentual da assinatura (ex.: 20% off) é aplicado sobre o preço corrente no momento do envio, não sobre o preço de inscrição.

## 5.4 Atendimento ao cliente (Customer Service)

- Representantes de atendimento têm acesso para realizar qualquer alteração em nome do cliente: método de pagamento, frequência, data de envio.
- Fluxo documentado disponível na documentação interna da WHP NAR.

# 6. Estratégias de Retenção e Falhas

## 6.1 Retenção no fluxo de cancelamento

- Quando o cliente tenta cancelar, o sistema primeiro oferece a opção de reprogramar o envio ("pode ser que você ainda tenha produto suficiente em casa").
- Resultado já observado: redução de cancelamentos — clientes preferem reprogramar a cancelar quando a opção é apresentada de forma clara.
- Se o cliente insistir no cancelamento, o motivo é solicitado (opcional). E-mail de confirmação é disparado.

## 6.2 Falha de pagamento em renovações

| Comportamento atual | Melhoria proposta (alinhada) |
|:-:|:-:|
| 1 tentativa de cobrança. | Espaçar retentativas em intervalos maiores (ex.: 2 dias em vez de 10 minutos). |
| Se falhar: e-mail enviado ao cliente com janela de 3 dias para atualizar o cartão. | Tokenização de cartões (via parceiro de pagamento) pode resolver automaticamente casos de cartão expirado — o token é atualizado sem ação do cliente. |
| Se não atualizar em 3 dias: assinatura inteira é cancelada. | Pular o ciclo com falha em vez de cancelar a assinatura inteira — preservando o vínculo do cliente. |
| Sistema atual VTEX: retentativas muito próximas (a cada 10 min) — ineficazes. | — |

*Decisão alinhada: implementar estratégia 'escape and delay' — quando há falha de pagamento, pular o ciclo em vez de cancelar a assinatura. Mesma lógica aplicada a falhas de estoque.*

## 6.3 Falha de pagamento na primeira compra

- Comportamento diferente: para a compra inicial (enrollment), a falha é tratada como qualquer checkout — sem e-mail específico de assinatura. O pedido é simplesmente negado.
- O fluxo de notificação por e-mail só se aplica às renovações recorrentes subsequentes.

## 6.4 Falha por falta de estoque

*Dor crítica declarada pela WHP NAR: quando um item de assinatura está sem estoque (especialmente bundles), o sistema atual cancela a assinatura inteira — mesmo que as unidades separadas estejam disponíveis. A decisão alinhada é implementar 'escape and delay': pular o ciclo sem estoque e tentar novamente no próximo, sem cancelar a assinatura.*

# 7. Complexidade de Precificação no PDP

Raissa C. Santos demonstrou um problema de UX real: o PDP exibe múltiplas promoções simultâneas (preço unlocked, desconto de 5%, cupom de 10%, desconto de assinatura de 30%/20%) de forma sobreposta, tornando impossível para o cliente entender o preço final que pagará.

- O problema é amplificado nas assinaturas: além da sobreposição de promoções, o preço das próximas renovações é desconhecido no momento da inscrição.
- Solução em design: a equipe da WHP NAR tem novos layouts que melhoram a clareza, mas a implementação técnica com a VTEX ainda está em aberto.

*Julia Grisi Lolato indicou que a resolução desse problema envolverá os times de Promotions e Storefront da VTEX, não apenas Subscriptions. A equipe se comprometeu a coordenar internamente.*

# 8. Dashboards e Rastreabilidade

- A WHP NAR utiliza Tableau e Adobe Analytics para acompanhar métricas de assinaturas.
- Métricas rastreadas: vendas, cancelamentos (por brand/site e por motivo), histórico de ciclos por assinante.
- Dashboards disponíveis por brand: MAG/Whirlpool, KitchenAid, Inside Pass.
- Motivos de cancelamento rastreados: recusa de cartão, falta de estoque, cliente relatando que ainda tem produto suficiente, etc.
- Revenue dashboard: existe no Tableau, mas requer verificação jurídica antes de ser compartilhado com a equipe VTEX.
- Integrações via cron jobs: notificações de eventos (falha de pagamento, cancelamento etc.) são processadas via jobs automáticos. Documentação disponível.

# 9. Planos Futuros — Assinatura de Serviços

Vanessa dos Santos Borges perguntou sobre a intenção de criar um clube de membership. A resposta foi:

- Sem planos de membership/clube de benefícios no momento.
- Foco de expansão: testar a assinatura de serviços — especificamente garantia estendida (extended warranty) recorrente, a ser testada nas próximas semanas com o time de ESP (Early Sales Program).
- Motivação: produtos com vida útil de 7 a 90 anos justificam o modelo de renovação automática de garantia.
- Viabilidade técnica: tecnicamente possível (regras criadas no SAP/Hybris), mas o interesse do cliente ainda é desconhecido — o teste validará isso.

*Julia Grisi Lolato confirmou: do ponto de vista técnico da VTEX, assinaturas de serviços não apresentam diferença estrutural em relação a produtos físicos — apenas o mecanismo de entrega é diferente. Não há blocker técnico.*

# 10. Decisões Alinhadas na Reunião

| Decisão | Detalhe |
|:-:|:-:|
| Textos legais e promocionais editáveis | Requisito legal e de negócio — devem permanecer configuráveis por SKU. |
| Pricing dinâmico nas renovações | Preço na renovação = preço vigente no momento do processamento, não preço fixo da inscrição. |
| Estratégia de skip em falha de pagamento | Pular o ciclo em vez de cancelar a assinatura inteira quando há falha de pagamento ou estoque. |
| Lançamento condicionado ao piloto | A implementação de novos modelos de assinatura (ex.: garantia estendida) depende dos resultados do teste ESP com clientes. |
