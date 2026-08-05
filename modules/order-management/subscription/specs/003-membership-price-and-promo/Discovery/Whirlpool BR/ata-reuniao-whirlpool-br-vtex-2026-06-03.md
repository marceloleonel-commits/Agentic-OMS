**ATA DE REUNIÃO**

**Subscriptions — VTEX <> Whirlpool (WHP)**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 03 de junho de 2026 |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions), Ligia Garcia (Commercial Engineer), Luiz Costa (Product Designer), Marcelo Leonel (OMS) |
| **Participantes (WHP)** | Elielton J. Carvalho, Stephani Galvani, Lucas Cusma, Felipe Dias, Brendon Guedes, Giovanna Batista, Guilherme Beltramin, Dener Teixeira, Vinicius Alves |
| **Participantes (Corebiz)** | Marcela Barboza, Maria Caria |
| **Natureza** | Reunião de discovery — alinhamento de roadmap, mapeamento de dores e requisitos do produto de Subscriptions/Membership |

# 2. Objetivo da Reunião

Entender o modelo de negócio atual da Whirlpool com assinaturas/recorrência, identificar dores operacionais e requisitos para uma futura evolução rumo a um clube de benefícios (membership). Em paralelo, a VTEX buscou alinhar o roadmap do produto com as necessidades do cliente, situando-o no contexto de discovery ativo em que o produto se encontra.

# 3. Contexto da Whirlpool

A Whirlpool opera atualmente dois modelos paralelos de recorrência dentro da VTEX:

| Modelo | Descrição |
|:-:|:-:|
| Compra recorrente de peças | Filtros de purificador de água e filtros antiodor de geladeira — produto recorrente entregue em ciclo fixo. Foco operacional até o momento. |
| MVP de assinatura (lavadoras) | Piloto limitado a lavadoras, rodado no ano anterior. Diferente do modelo de peças — tentativa de criar um clube com serviços/suporte, não apenas recorrência de produto físico. |

Ambos os modelos utilizam o módulo nativo de assinaturas da VTEX com customizações pontuais realizadas pelo time de desenvolvimento. A empresa está em fase de discovery para evoluir para um modelo de clube de benefícios (membership), com planos de expansão para o México.

# 4. Visão de Futuro — Clube de Benefícios (Membership)

*"A ideia principal muda um pouquinho porque ela não é só uma compra recorrente — ela é muito mais essa questão de um clube de benefícios. Você paga uma assinatura e aí você tem alguns benefícios dentro dessa assinatura." — Stephani Galvani*

## 4.1 O que se deseja construir

- Uma assinatura paga (mensal ou anual) que concede ao consumidor benefícios além do recebimento de produtos — frete grátis, cupons de desconto, acesso a serviços, parcerias externas, entre outros.
- O produto recorrente físico (filtros) pode coexistir com o clube, mas a visão estratégica é o membership como produto principal de fidelização.
- Expansão para outras categorias além de filtros e purificadores (geladeiras, lavadoras, outros eletrodomésticos) — viabilizada caso o módulo ganhe flexibilidade suficiente.
- Escalada para o México — operação atual não atende completamente às demandas da estrutura mexicana.

## 4.2 Natureza dos benefícios (em design)

O clube ainda está em fase de discovery interno na WHP. A natureza exata dos benefícios não foi finalizada, mas os tipos cogitados incluem:

- Percentual de desconto em produtos do site.
- Frete grátis.
- Cupons de desconto em categorias específicas.
- Parcerias com terceiros (benefícios externos).
- Serviços adicionais vinculados à marca (suporte técnico, garantia estendida, etc.).

*A equipe da WHP sinalizou sensibilidade competitiva sobre os detalhes dos benefícios e optou por não detalhar regras específicas. O foco da reunião foi mantido nos requisitos técnicos e de plataforma, não nas regras de negócio.*

## 4.3 Ciclos de recorrência

Ainda não definidos para o clube. A tendência é seguir o padrão de mercado (mensal e anual). Ciclos customizados não foram mapeados como necessidade.

# 5. Estado Atual do Módulo de Subscriptions da VTEX

A VTEX confirmou que o módulo nativo de assinaturas não recebeu atualizações relevantes nos últimos períodos — trata-se de um pedido recorrente básico, sem integração nativa com clubes, benefícios, promoções ou pricing diferenciado. A fase atual é de discovery para construir a evolução do produto.

# 6. Dores e Limitações Identificadas

## 6.1 Gestão de planos sem self-service adequado

*Requisito obrigatório declarado pela WHP: gestão completa do plano na área "Minha Conta" do consumidor — cancelamento, upgrade, downgrade, pausa e troca de dados de pagamento de forma autônoma, sem depender do time operacional.*

- O módulo atual permite apenas pausar e pular ciclo — funcionalidades muito limitadas frente ao que o clube exige.
- Toda outra ação (troca de cartão, cancelamento, upgrade de plano) demanda intervenção manual do time — onerando a operação e quebrando a jornada do cliente.

## 6.2 Troca de cartão gera nova assinatura

- Atualizar o meio de pagamento (cartão de crédito) não é possível sem cancelar a assinatura existente e criar uma nova — gerando atrito operacional e perda de histórico.
- Impacto direto no faturamento: quando o cliente não consegue trocar o cartão de forma autônoma, pedidos recorrentes deixam de ser cobrados.
- A WHP chegou a desativar a exibição nativa de troca de cartão no Minha Conta por questões de segurança técnica.

## 6.3 Ausência de suporte a Pix e boleto

- O módulo atual aceita apenas cartão de crédito para assinaturas recorrentes.
- Pix automático é classificado como desejável (não blocker): ampliaria o pool de consumidores menos bancarizados, mas não é impeditivo para o lançamento do MVP.

## 6.4 Dashboard e visibilidade gerencial limitados

- Dificuldade em acompanhar no admin o ciclo de vida de cada assinante: em qual recorrência está (1ª, 2ª, 3ª...), valor total acumulado, histórico de movimentações.
- Pouca clareza sobre o motivo de cancelamentos e falhas de pagamento — exige análise manual.
- Associação de benefícios (cupons, produtos, serviços) com assinantes não é nativa — a WHP recorreu a sistema externo para fazer essa clusterização.

## 6.5 Rigidez na gestão de planos e upgrades/downgrades

- Não há mecanismo nativo para alterar o plano de um assinante (ex.: de mensal para anual, ou de básico para premium) sem recriar a assinatura.
- Limitação crítica para o modelo de clube com múltiplos tiers desejado pela WHP.

## 6.6 Customização no checkout

- O checkout nativo não exibia claramente as informações do que estava sendo contratado na assinatura — exigiu customização visual pelo time de desenvolvimento da WHP.
- A natureza da customização é principalmente informativa/visual, não funcional.

## 6.7 Notificações de falha de pagamento

- Ausência de fluxo nativo de comunicação com o cliente em caso de falha de cobrança (e-mail, WhatsApp, SMS).
- A WHP ainda está desenhando essa jornada, mas cita como referência o padrão de mercado (ex.: Amazon — e-mail + mensagem para atualização de dados).

# 7. Roadmap da VTEX — O que Está em Desenvolvimento

| Funcionalidade | Status | Prazo previsto |
|:-:|:-:|:-:|
| Free Trial (período de teste gratuito) | Em desenvolvimento — fase final | Curto prazo (este ano) |
| Membership / Clube de benefícios | Em discovery — construção ativa | Final de 2026 / Q1 2027 |
| Pix automático | No radar — a priorizar conforme criticidade dos clientes | Início de 2027 |

*A VTEX está em fase de discovery para o produto de membership. As conversas com clientes como a WHP moldam o roadmap, mas não são compromissos de customização individual. A priorização de Pix vs. membership dependerá da criticidade mapeada nas conversas com clientes.*

# 8. Requisitos da WHP — Must-have vs. Nice-to-have

| Must-have (blocker para MVP) | Nice-to-have (desejável) |
|:-:|:-:|
| Gestão completa do plano no Minha Conta (cancelamento, upgrade, downgrade, pausa) | Pix automático como meio de pagamento para recorrência |
| Troca de cartão sem cancelar e recriar a assinatura | Dashboard avançado com ciclo de vida, LTV e motivos de cancelamento |
| Upgrade e downgrade de plano com regras configuráveis | Notificações automáticas de falha de pagamento (e-mail / WhatsApp) |
| Associação nativa de benefícios ao plano (frete, cupom, desconto) | Integração nativa de benefícios com parceiros externos |
| Visibilidade do número de ciclo de cada assinante no admin | Expansão para México com suporte às necessidades locais |

# 9. Integrações Existentes

- **ERP (SAP)**: Pedidos recorrentes descem automaticamente para o SAP para registro e controle financeiro.
- **CRM**: Integração ativa para comunicação e acompanhamento de clientes.
- **Acompanhamento manual**: Além das integrações, o time realiza acompanhamento manual com dashboards e planilhas complementares para cobrir lacunas do módulo nativo.

# 10. Referências de Mercado Apresentadas pela VTEX

Ligia Garcia citou dois clientes VTEX que já implementaram soluções de clube de benefícios com adaptações sobre o módulo nativo, como referências práticas para a WHP enquanto o produto nativo não está disponível:

- Farm: clube de benefícios implementado com cartão de assinatura — funciona como membership sem ser plug-and-play nativo do admin.
- Reserva / Oficina Reserva: clube de benefícios com estrutura similar, adaptada sobre APIs da VTEX.
