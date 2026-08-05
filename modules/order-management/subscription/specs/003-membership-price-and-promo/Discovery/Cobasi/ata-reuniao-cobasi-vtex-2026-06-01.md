**ATA DE REUNIÃO**

**Assinatura Cobasi <> VTEX**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 01 de junho de 2026 |
| **Horário** | 15h47 (GMT-03:00) |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM de Subscriptions), Cintia Cristina Junca Martins (Commercial Engineer), Marcelo Leonel (OMS) |
| **Participantes (Cobasi)** | Lucas Henrique Carlos Domingos (Coordenador de Produtos Digitais), William Stenico (Coordenador de Tecnologia – Fidelização, Grupo Cobasi+PETZ) |
| **Contexto** | Reunião inicial de alinhamento estratégico sobre o produto de Subscriptions da VTEX, com foco nos modelos de fidelidade e recorrência da Cobasi e da PETZ, após fusão dos dois grupos. |

# 2. Objetivo da Reunião

Compreender o cenário atual de uso dos produtos de assinatura e programas de fidelidade da Cobasi e da PETZ, para orientar o roadmap do produto de Subscriptions da VTEX. Especificamente:

- Entender os modelos de recorrência e clubes de benefícios vigentes em cada marca.
- Identificar as ferramentas utilizadas (nativas VTEX vs. desenvolvimentos internos).
- Mapear dores e limitações operacionais existentes.
- Alinhar expectativas sobre a parceria de co-desenvolvimento do produto de Subscriptions.

# 3. Contexto da Fusão Cobasi + PETZ

A reunião foi realizada num momento de fusão entre Cobasi e PETZ, duas marcas do mesmo grupo. William Stenico foi apresentado como o coordenador responsável pelo guarda-chuva de tecnologia de fidelização e compras recorrentes do grupo consolidado. O processo de integração entre as duas marcas está em fase inicial:

- Comitês internos estão avaliando processos e identificando sinergias.
- A estrutura de times de produto ainda está sendo reorganizada internamente.
- William está em processo de onboarding na operação da Cobasi, tendo histórico de 100% na PETZ.

# 4. Modelos de Fidelidade e Recorrência

## 4.1 Cobasi

### Programa Amigo Cobasi (Pontos)

Programa de pontos originado no PDV (ponto de venda físico) e integrado ao ambiente digital. Os clientes acumulam pontos que são convertidos em descontos básicos nas compras. A segmentação de clientes e os níveis de pontuação são gerenciados por campos customizados no Master Data da VTEX, utilizados como gatilho para promoções na plataforma.

### Amigo Cobasi Plus (Clube Pago)

Clube de benefícios pago com cobrança mensal (plano anual em estudo). Desenvolvido internamente pela Cobasi. Atualmente disponível apenas para parte do público (em fase de expansão). Benefícios:

- R$ 10 de crédito mensal (equivalente a 900 pontos Amigo Cobasi)
- Frete reduzido em compras no site e app
- 15% de desconto em banho e tosa nas unidades PetAnjo
- Pontos em dobro em produtos de marcas próprias (My Hug, Joy, Flix, entre outras)

Funcionamento técnico: o pagamento e a gestão são processados internamente (motor próprio), com flag de cliente Plus armazenada no Master Data da VTEX. A pontuação é traduzida em promoções aplicadas automaticamente no carrinho.

### Compra Programada (Recorrência de Produtos)

Produto de recorrência nativo da VTEX. Benefício: 10% de desconto em todos os pedidos recorrentes. Esse desconto se aplica também às compras pontuais realizadas por clientes que possuem ao menos uma assinatura ativa, independentemente do valor.

## 4.2 PETZ

### Clube de Benefícios por Tiers (Anuidade)

Modelo baseado em níveis (tiers): Bronze, Prata, Ouro e Diamante. Funciona como um clube de benefícios com cobrança anual única (parcelável), com renovação automática opcional. Não é um modelo de recorrência de entrega de produtos — o cliente tem benefícios enquanto a anuidade estiver ativa, mas não recebe pedidos automaticamente.

Benefícios por tier:

- Desconto de 10% em qualquer produto (a partir do tier Prata)
- Cashback monetário em todos os pedidos (diferente da Cobasi, que usa pontos)
- Frete grátis
- Descontos em banho, tosa e vacinas — chegando a 30% no tier Diamante

### Compra Programada (Recorrência de Produtos)

Estrutura similar à Cobasi (10% de desconto). Recentemente foi adicionada funcionalidade de recomendação de "compre junto" integrada à prévia de pedido, enviada pelo WhatsApp antes do disparo — iniciativa pausada temporariamente por questões de custo, mas com retomada prevista.

### Mecanismo de Descontos

Os benefícios do clube não são cumulativos com promoções de produto. Em caso de sobreposição, prevalece sempre o maior desconto. Exemplo: se o clube oferece 10% e um produto tem promoção de 20%, o cliente recebe 20%, não 30%.

# 5. Ferramentas e Arquitetura Técnica Atual

| Produto/Funcionalidade | Cobasi | PETZ |
|:-:|:-:|:-:|
| Recorrência de produtos | VTEX Subscriptions (nativo) | VTEX Subscriptions (nativo) |
| Programa de pontos/fidelidade | Motor interno + Master Data VTEX | Motor interno desenvolvido pela PETZ |
| Clube de benefícios pago | Motor interno (Amigo Cobasi Plus) | Motor interno (Tiers) |
| Pix recorrente | Motor próprio externo à VTEX | Broker de pagamento parceiro |
| Serviços (banho, tosa, veterinário) | PDV exclusivo de serviço (fora da VTEX) | PDV exclusivo de serviço (fora da VTEX) |

# 6. Dores e Limitações Identificadas

## 6.1 Impossibilidade de alterar dados de pagamento em assinaturas ativas

Historicamente, a VTEX tratava uma assinatura como uma entidade imutável em relação ao meio de pagamento — qualquer alteração resultava na criação de uma nova assinatura. Isso gerava atrito significativo para os clientes que precisavam trocar de cartão ou atualizar dados de pagamento sem cancelar a recorrência. A VTEX realizou melhorias ao longo do tempo (endereço e produtos já podem ser alterados sem quebra), mas a troca de cartão ainda representava fricção.

## 6.2 Assinaturas limitadas a cartão de crédito

A plataforma VTEX não suportava nativamente Pix recorrente como meio de pagamento em assinaturas. A demanda de clientes que preferem pagar por Pix forçou a Cobasi a desenvolver um motor próprio externo, paralelo à VTEX, para gerenciar essas recorrências. Essa solução cobre tanto Pix quanto outros meios fora do cartão (exceto boleto). O volume ainda é pequeno, mas o desenvolvimento foi necessário diante da falta de parceiro elegível para integração via VTEX na época.

## 6.3 Serviços físicos fora da plataforma VTEX

Banho, tosa e atendimento veterinário operam em sistemas de PDV separados, não integrados à VTEX, devido à estrutura de franquias das marcas. Isso impede que benefícios do clube digital sejam automaticamente reconhecidos nesses serviços de forma integrada.

## 6.4 Ausência de gestão nativa de clubes de benefícios

Tanto a Cobasi quanto a PETZ precisaram desenvolver internamente seus motores de clube de benefícios, pois a VTEX não oferecia essa funcionalidade de forma nativa. O objetivo declarado pela VTEX é justamente incorporar essas capacidades ao produto de Subscriptions, eliminando a necessidade de soluções externas.

## 6.5 Visibilidade operacional e dashboard

Marcelo Leonel sinalizou dificuldade em acompanhar métricas e o estado operacional das assinaturas diretamente na plataforma. Atualmente, é necessário exportar planilhas e consolidar dados manualmente, o que é ineficiente para a operação.

# 7. Diretrizes Estratégicas e Visão de Produto

- A VTEX reconhece o potencial do mercado de assinaturas em segmentos não óbvios (ex: B2B) e, por isso, criou uma cadeira dedicada de PM para Subscriptions.
- O objetivo central é trazer o máximo de funcionalidades de recorrência e fidelidade para dentro da plataforma VTEX de forma nativa, reduzindo a dependência de motores e integrações externas desenvolvidos pelos clientes.
- O OMS (Order Management System) da VTEX está sendo expandido com um novo sistema de workflow de pedidos (protótipo já disponível), que será apresentado ao grupo Cobasi+PETZ em breve.
- A Cobasi foi citada como cliente relevante para orientar o roadmap do produto de Subscriptions, junto a outros clientes consultados em paralelo.
- O desenvolvimento não será customizado para um cliente específico, mas as dores mapeadas podem resultar em melhorias que beneficiem toda a base da VTEX.
