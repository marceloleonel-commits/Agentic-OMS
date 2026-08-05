**ATA DE REUNIÃO**

**Assinaturas — Skelt <> VTEX**

# 1. Informações da Reunião

|  |  |
|:-:|:-:|
| **Data** | 01 de junho de 2026 |
| **Participantes (VTEX)** | Vanessa dos Santos Borges (PM — Subscriptions), Pedro Amodeo (Commercial Engineer), Luiz Costa (Product Designer), Marcelo Leonel (OMS) |
| **Participantes (Skelt)** | Rafael Dittrich (Coordenador de E-commerce) |
| **Natureza** | Reunião exploratória (discovery) — mapeamento de necessidades e maturidade do projeto de assinaturas |

# 2. Objetivo da Reunião

Realizar uma conversa exploratória para entender a visão e o grau de maturidade da Skelt em relação a um futuro projeto de assinaturas e recorrência. A VTEX buscou mapear as principais necessidades e dores do cliente para embasar o roadmap do produto de Subscriptions em desenvolvimento.

# 3. Contexto e Estado Atual da Skelt

- A Skelt ainda não possui nenhum modelo de assinatura ou recorrência estruturado.
- Todos os produtos da marca têm natureza recorrente — ciclos médios de consumo de 60 a 90 dias, com variação conforme o uso de cada cliente.
- A taxa de recompra no canal digital é baixa (abaixo de 15%), considerada o principal ponto de dor motivador do projeto.
- A empresa opera em múltiplos canais: e-commerce próprio, lojas físicas, marketplaces e farmácias (B2B). O canal próprio é estratégico e precisa de diferenciais para competir.
- 80% das compras no e-commerce são de novos clientes, o que dificulta a estimativa de LTV e CAC — métricas ainda em estruturação interna.
- O time de e-commerce da Skelt é ágil e orientado a testes rápidos: Rafael Dittrich sinalizou capacidade de ir do zero ao ar "do dia para a noite".

# 4. Visão de Negócio para Assinaturas

## 4.1 Modelo de referência

Rafael Dittrich citou o modelo da Zee Dog como principal referência. A proposta é oferecer desconto fixo em compras recorrentes (ex.: 10–15%, com possibilidade de ser mais agressivo), com potencial para kits de produtos ("rotinas completas"). Essa agressividade em desconto é viável no canal próprio justamente porque a Skelt não pode reduzir o preço básico por conta dos canais B2B (farmácias e marketplaces).

## 4.2 Motivação estratégica

- Fortalecer o canal direto ao consumidor (D2C) como diferencial competitivo.
- Aumentar a taxa de recompra digital, hoje abaixo de 15%.
- Criar exclusividade no canal próprio — benefícios indisponíveis em marketplaces e farmácias.
- Alavancar o crescimento sem depender de redução de preço básico, preservando os demais canais.

# 5. Benefícios Cogitados para o Clube de Assinaturas

## 5.1 Confirmados como desejáveis

- Desconto fixo em todos os pedidos recorrentes (ex.: 10–15%, com margem para ser mais agressivo).
- Frete grátis, especialmente para rotinas completas de maior valor.
- Acesso antecipado a lançamentos de produtos, antes da base geral (já praticado via CRM para clientes champions — seria formalizado como benefício do clube).

## 5.2 Ideias em exploração (não confirmadas)

- Consultoria digital de skincare via equipe das lojas físicas — aproveitar o conhecimento dos vendedores das lojas próprias para auxiliar clientes digitais na montagem de rotinas de uso.
- Acesso a coleções ou produtos exclusivos para membros.
- Integração com agentes de IA para recomendação de rotinas (ideia surgida no contexto de uma POC de CX já em andamento na VTEX).

# 6. Estrutura do Clube — Discussão

## 6.1 V1: Versão simplificada e uniforme

Rafael Dittrich indicou preferência por começar com um modelo único e homogêneo — sem segmentação de planos — para validar a proposta, aprender com o comportamento dos assinantes e amadurecer o conceito antes de complexificar.

## 6.2 V2: Evolução para tiers

Na evolução natural do produto, a ideia é criar tiers gamificados (similar ao modelo da Pet Love / PETZ), com upgrades, downgrades e pausas gerenciados pelo próprio cliente. O grupo da Cobasi+PETZ foi citado como referência de boas práticas em clubes de benefícios.

## 6.3 Segmentação por tipo de pele

Uma forma de personalização relevante para a Skelt não é por tier de fidelidade, mas por perfil de produto: pele oleosa, mista, seca etc. A Skelt já possui kits segmentados por tipo de pele ("rotinas completas") que poderiam ser a unidade base de recorrência.

# 7. Jornadas de Comunicação e CRM

- A Skelt utiliza o Insider como CRM para disparos de e-mail e SMS.
- O WhatsApp ainda não é utilizado para notificações de recompra — identificado como oportunidade relevante, especialmente para lembretes de ciclo de assinatura.
- Jornadas de recompra estão sendo implementadas recentemente; ainda sem resultados consolidados, dado o ciclo de 90 dias dos produtos.
- O sistema de assinaturas precisará ser flexível o suficiente para que o cliente gerencie seu próprio ciclo, considerando que muitos consumidores são novos e não sabem estimar o tempo de duração do produto.
- A comunicação por WhatsApp foi levantada como próximo passo natural para notificações de recorrência.

# 8. Meios de Pagamento

|  |  |
|:-:|:-:|
| **Ativos hoje** | Cartão de crédito, Pix, Pix parcelado, Google Pay |
| **Em implementação** | Apple Pay (via Pagar.Me) — funcional à vista; parcelamento ainda não disponível |
| **Orquestrador** | Yuno (em contratação) — para ter gateway próprio além de integração direta com adquirente |
| **Perfil da base** | Aproximadamente 60% dos pedidos feitos por iPhone — comportamento atípico para o mercado brasileiro |
| **Pix recorrente** | Avaliado como nice-to-have; público da Skelt tende a ter cartão de crédito, não é impeditivo para V1 |

# 9. Plano de Implementação

## 9.1 Ponto de partida: módulo padrão VTEX

O módulo nativo de pedidos recorrentes da VTEX já está ativo para a Skelt, sem custo adicional. Rafael Dittrich já tem experiência com a implementação (fez em outras lojas). A decisão foi:

- Começar com o módulo padrão de Subscriptions da VTEX.
- Customizar a PDP (página de detalhes do produto) para apresentar a opção de assinatura.
- Usar essa fase para coletar dados sobre o perfil de quem compra recorrente.
- Com esses insumos, evoluir para um clube de fidelidade com planos e benefícios mais elaborados (V2).

## 9.2 Envolvimento técnico

O Tech Lead da Skelt (Denner) já havia conversado previamente com Pedro Amodeo sobre o tema. A implementação da PDP foi descrita como simples — "só customizar PDP e seguir".

# 10. Observações e Pontos de Atenção

*A subjetividade do ciclo de uso é um desafio real: muitos clientes são novos e não sabem estimar quando o produto acabará. O sistema precisa oferecer ciclos sugeridos com educação ao usuário.*

*70–80% das compras são de novos clientes — a recorrência precisa funcionar como mecanismo de retenção e não de premiação de lealdade pré-existente.*

*CAC e LTV ainda não estão estruturados, o que dificulta comparações futuras. Recomendado medir essas métricas antes do lançamento para criar linha de base.*

*Apple Pay: Pedro Amodeo confirmou funcionamento via Pagar.Me, mas apenas à vista. Rafael sinalizou intenção de implementar e adicionar parcelamento quando disponível.*
