**ATA DE REUNIÃO**

**Assinatura Sam's Club + VTEX — Arquitetura e Pagamentos**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 26 de junho de 2026 |
| **Duração** | Aproximadamente 29 minutos |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions/OMS), Cintia Cristina Junca Martins (Commercial Engineer), Francisco Donato, Marcelo Leonel (OMS), Luiz Costa (Product Designer) |
| **Participantes (Sam's Club / Carrefour)** | Giovanna Pedron (líder do e-commerce), Allan Aragão (tecnologia), Gustavo Moreno (produto/discovery), Carolina Laginestra (payments/operações) |
| **Natureza** | Reunião técnica de alinhamento — resolução de blocker arquitetural para implementação do produto de assinaturas da VTEX no modelo de franquias do Sam's Club |
| **Contexto** | O Sam's Club é parte do Grupo Carrefour e opera com arquitetura de conta principal + contas franquia (uma por clube físico). A reunião surgiu a partir de um chamado técnico aberto pela equipe do Sam's Club. |

# 2. Objetivo da Reunião

Resolver o blocker técnico identificado pelo Sam's Club na implementação do módulo de assinaturas da VTEX: o conflito entre a arquitetura de contas franquia (onde catálogo, preço, estoque e pagamentos residem hoje) e o funcionamento nativo do app de assinaturas (que opera obrigatoriamente na conta principal). Adicionalmente, alinhar expectativas sobre o Pix recorrente.

# 3. Contexto do Sam's Club

## 3.1 Modelo de negócio — Sam's Club Plus (membership)

O Sam's Club opera um programa de membership chamado Sam's Club Plus — similar ao modelo de clube de benefícios. O cliente paga uma anuidade e obtém acesso ao clube e seus benefícios. Os planos têm valores entre R$ 95 (básico) e R$ 175 (Plus).

Canal online é o maior impulsionador de aquisição de novos membros no e-commerce do Grupo Carrefour — com crescimento acelerado. A intenção é migrar a captura do pagamento de membership para a VTEX, consolidando a jornada de compra.

## 3.2 Arquitetura atual — conta principal + contas franquia

- Conta principal VTEX: centralizadora do catálogo de produtos.
- Contas franquia: uma por clube físico (Sam's Club Morumbi, Sam's Club Taboão etc.). Cada franquia herda o catálogo da principal, mas mantém seus próprios preços, estoques e meios de pagamento.
- Todos os pagamentos atuais são processados pela conta franquia — não há meio de pagamento cadastrado na conta principal.
- Gateway de pagamento atual: Cielo (mono-adquirente). Braspag está sendo avaliada para uma futura migração.
- Meio de pagamento disponível: somente cartão de crédito (sem Pix — por questões de conciliação financeira interna, não por limitação da VTEX).

## 3.3 Lógica de fidelidade existente

O Sam's Club já implementou a lógica de clube de benefícios por conta própria, fora do módulo nativo de assinaturas da VTEX:

- Pagamento hoje: feito pela página da Cielo (externa à VTEX).
- Após o pagamento: um webhook captura o evento e grava um flag no Master Data da VTEX marcando o cliente como membro Plus.
- Benefícios: aplicados via promoção com base no cluster do Master Data.
- Intenção: manter exatamente esse fluxo, substituindo apenas o provedor de captura do pagamento — de Cielo externo para VTEX nativo. O restante do fluxo (webhook → Master Data → promoção) permanece inalterado.

# 4. Blocker Técnico Identificado

*O app de assinaturas da VTEX só pode ser instalado e operado na conta principal. A equipe do Sam's Club tentou instalar o app em uma conta franquia e conseguiu — mas ao tentar cadastrar um plano de assinatura, recebeu erro 403 (acesso negado). Esse erro confirma que o módulo de assinaturas não suporta operação em contas franquia.*

Implicação direta: todos os pagamentos recorrentes (renovações de membership) precisarão ser processados pela conta principal — não pela conta franquia, como ocorre hoje com todas as demais transações do Sam's Club.

## 4.1 Por que o Sam's Club queria manter o pagamento na conta franquia

- Conciliação financeira: cada clube físico contabiliza as anuidades separadamente. O pagamento pela franquia garante que a receita seja atribuída à loja correta.
- Simplicidade operacional: mudança de fluxo exigiria acionar outros times internos para cadastrar meios de pagamento na conta principal — burocracia adicional.
- Padrão atual: nenhuma outra transação do Sam's Club passa pela conta principal hoje. A mudança cria um fluxo diferente apenas para assinaturas.

## 4.2 Solução encaminhada — split de pagamento na conta principal

*Decisão técnica alinhada na reunião: o Sam's Club precisará adaptar sua arquitetura para processar pagamentos de assinatura na conta principal. Para manter a conciliação por franquia, deverá usar um gateway de pagamento que suporte split de transação — direcionando automaticamente o valor correto para cada franquia/seller sem necessidade de conciliação manual posterior.*

- Vanessa compartilhou no chat a documentação de split de pagamento da VTEX durante a reunião.
- Avaliação de gateway: verificar se a Cielo (atual) já suporta split nativamente; a Braspag (em avaliação) também é candidata.
- Condição necessária: cadastrar meios de pagamento na conta principal da VTEX — o que hoje não existe.

## 4.3 Workaround alternativo proposto por Gustavo Moreno

Gustavo Moreno levantou uma alternativa técnica para rastrear a franquia dona de cada assinatura sem depender do split de gateway:

- Configurar SKUs de assinatura distintos para cada franquia na conta principal — cada SKU associado ao meio de pagamento específico daquela franquia.
- Como a assinatura é vinculada ao SKU via "anexo" (attachment), o pedido gerado já identifica de qual seller/franquia a assinatura se origina.
- Isso permitiria rastrear a franquia dona da assinatura diretamente no pedido, facilitando a conciliação gerencial.

Cintia e Vanessa validaram a abordagem como viável — especialmente porque o Sam's Club usa apenas cartão de crédito e não há condições de pagamento diferentes entre franquias no momento. A conta principal poderia ter um meio de pagamento único e o split tratar a distribuição por franquia.

## 4.4 Pedido mínimo por seller

Gustavo Moreno identificou uma dúvida técnica adicional: o pedido mínimo na VTEX é configurado por seller, mas assinaturas não necessariamente seguem a mesma regra. A conclusão foi que pode ser necessária uma customização fora do padrão nativo — a ser avaliada pela equipe técnica do Sam's Club.

# 5. Pix — Status e Alinhamento de Expectativas

|  |  |
|:-:|:-:|
| **Situação / Ponto** | **Detalhe** |
| Pix no Sam's Club hoje | Não disponível — por questão de conciliação financeira interna do Carrefour, não por limitação técnica da VTEX. Times internos trabalhando na solução. |
| Pix para produtos (não recorrente) | Em implementação no Sam's Club — em breve disponível. |
| Pix recorrente (para assinaturas) | Não disponível na VTEX. Previsão: H1 2027 (data não confirmada com precisão). |
| Impacto no roadmap VTEX | Vanessa sinalizou que pode antecipar para Q4 2026, dependendo da priorização do projeto Whirlpool NAR — que envolve requisitos de subscription que podem ocupar capacidade do time. |
| Relevância para o Sam's Club | Alta — o canal online cresce fortemente e o Pix é estratégico. A possibilidade de comprar produto + assinatura no mesmo carrinho fica limitada sem Pix (hoje apenas cartão disponível para assinaturas). |
| Workaround para o curto prazo | Multiple Payment Methods: o cliente pode pagar o produto com Pix e a assinatura com cartão no mesmo pedido. Cintia sugeriu registrar essa solução na documentação do chamado. |

*Vanessa informou que 90% dos clientes de assinatura com quem conversou sinalizaram o Pix como relevante — dado que fortalece a priorização do Pix recorrente no roadmap.*

# 6. Clube de Benefícios — Posição da VTEX

Vanessa esclareceu que o produto de assinaturas da VTEX é um motor de pedidos recorrentes — não inclui nativamente um clube de benefícios ou membership com benefícios atrelados. A lógica de fidelidade do Sam's Club (cluster no Master Data + promoção) já está implementada de forma customizada e funcional fora do módulo nativo. O Sam's Club não precisará alterar esse fluxo — apenas a captura do pagamento migrará para a VTEX.

*Um produto nativo de Membership (clube de fidelidade integrado ao módulo de assinaturas) está no roadmap da VTEX — com previsão para Q1 2027. Vanessa sinalizou isso como possível evolução futura para o Sam's Club também.*

# 7. Alinhamento Interno VTEX (Pós-Reunião)

Após o encerramento da chamada com o Sam's Club, Vanessa dos Santos Borges e Cintia Cristina Junca Martins fizeram um alinhamento interno:

- Confirmaram que a instalação do app de assinaturas obrigatoriamente na conta principal é uma limitação técnica conhecida e definitiva do produto atual.
- Concluíram que a única solução funcional disponível é a adaptação da arquitetura de pagamento para a conta principal com split de transações.
- Discutiram que o Sam's Club, por usar apenas cartão de crédito e sem condições diferentes por franquia, tem o caso mais simples possível — o workaround de SKU por franquia é viável.
- Alinharam o cenário de múltiplos meios de pagamento (produto no Pix + assinatura no cartão) como workaround de curto prazo a ser comunicado ao Sam's Club.
- Vanessa reforçou a urgência do Pix recorrente dado o volume de demanda: 90% dos clientes de assinatura apontam como relevante.

# 8. Relevância Estratégica do Sam's Club para o Roadmap

*Giovanna Pedron destacou que o canal online é o maior motor de aquisição de novos membros no e-commerce do Grupo Carrefour. As transações de membership variam de R$ 95 a R$ 175. O grupo se comprometeu a enviar uma projeção de volume transacional — dado solicitado por Vanessa para embasar a priorização do Pix recorrente e do módulo de Membership no roadmap da VTEX. Cintia pediu urgência no envio, dado o encerramento do quarter.*

# 9. Próximas Etapas

☐ **Giovanna Pedron (Sam's Club)** — Montar e compartilhar projeção de volume e transações do membership com o time VTEX (Vanessa/Cintia) — urgente, dado o encerramento do quarter.

☐ **Allan Aragão, Carolina Laginestra, Gustavo Moreno (Sam's Club)** — Adaptar a configuração para processar pagamentos na conta principal da VTEX — incluindo cadastro de meios de pagamento na conta principal.

☐ **Allan Aragão, Carolina Laginestra, Gustavo Moreno (Sam's Club)** — Implementar a solução de split de pagamento com base na documentação compartilhada por Vanessa na reunião.

☐ **Carolina Laginestra / Allan Aragão (Sam's Club)** — Verificar se a Cielo (gateway atual) suporta split de pagamento nativamente — ou avaliar avanço com Braspag para essa capacidade.

☐ **Cintia Cristina Junca Martins (VTEX)** — Comunicar ao Sam's Club o workaround de curto prazo para Pix: multiple payment methods (produto no Pix + assinatura no cartão no mesmo pedido).

*Documento gerado a partir de transcrição automática da reunião de 26/06/2026 • VTEX Subscriptions & OMS — Sam's Club / Grupo Carrefour*
