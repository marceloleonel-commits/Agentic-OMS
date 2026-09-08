/* ══════════════════════════════════════════════════════════════════════
   mode2-anomaly-script.js
   ──────────────────────────────────────────────────────────────────────
   Dado puro: o "Exemplo de diálogo" do Modo 2 ("O agente sugere ao
   gerente") do Product Briefing "Criação de Políticas com Agente" —
   transcrito literalmente, turno a turno, do mesmo jeito que
   mode1-dialogue-script.js faz para o Modo 1. Não é o resumo narrativo
   abstrato (Observe → Detect → ... → Scale) que aparece antes no
   documento — é a conversa real, com números e decisões concretas.

   Turno 0 é do AGENTE (ao contrário do Modo 1, que abre com o gerente):
   é essa fala que mode2-anomaly-modal.jsx mostra como notificação —
   Surface. A partir do turno 1 (o gerente perguntando "O que você
   faria nesses casos?"), a conversa continua de verdade em My
   Assistant, revelando um turno do agente por vez (mode2-assistant-
   engine.js), exatamente como o Modo 1 — nenhum autoplay.
   ══════════════════════════════════════════════════════════════════════ */
window.MODE2_SCRIPTS = {
  "shopping-a-after-17h": {
    id: "shopping-a-after-17h",
    title: "Pickup SLA Protection",
    turns: [
      { speaker: "agent", phase: "Surface", text: "Identifiquei um padrão na sua operação de retirada em loja que pode valer a pena automatizar.\n\nNos últimos 30 dias, 74 pedidos de retirada entraram em risco de atraso. Em 51 deles, o problema começou pelo menos 12 horas antes do prazo, mas a operação só reagiu quando o SLA já estava próximo de vencer.\n\nO Shopping A concentra 43% dessas ocorrências.\n\nMinha sugestão é criar uma política para identificar esses pedidos antecipadamente e tentar recuperá-los antes de envolver você.\n\nQuer que eu monte uma proposta?" },
      { speaker: "manager", phase: "Surface", text: "O que você faria nesses casos?" },
      {
        speaker: "agent", phase: "Explain",
        text: "Eu começaria acompanhando pedidos de retirada que ainda não estejam prontos quando faltarem menos de 12 horas para o prazo.\n\nNesses casos, eu poderia:\n— verificar o status do picking;\n— identificar se a loja está congestionada;\n— repriorizar a separação;\n— procurar o mesmo item em outro estoque;\n— avaliar uma transferência, quando necessário.\n\nPelos dados dos últimos 30 dias, essas ações poderiam ter recuperado 46 dos 74 pedidos em risco sem alterar a promessa feita ao cliente.",
        quickReplies: ["Mas não quero que você fique transferindo produto entre lojas e aumentando meu custo."],
      },
      { speaker: "manager", phase: "Review", text: "Mas não quero que você fique transferindo produto entre lojas e aumentando meu custo." },
      {
        speaker: "agent", phase: "Review",
        text: "Concordo. Podemos colocar um limite de autonomia.\n\nAnalisando as recuperações possíveis, 82% exigiriam menos de R$15 de custo adicional. Minha sugestão é:\n\nAté R$15: posso executar automaticamente.\nAcima de R$15: peço sua aprovação.\n\nE eu nunca alteraria a loja de retirada escolhida pelo cliente sem consentimento.\n\nQuer usar esses limites?",
        quickReplies: ["Sim. Mas por que você escolheu 12 horas?"],
      },
      { speaker: "manager", phase: "Review", text: "Sim. Mas por que você escolheu 12 horas?" },
      {
        speaker: "agent", phase: "Explain",
        text: "Porque, analisando os pedidos que atrasaram, quando a intervenção começou com menos de 8 horas restantes, a taxa de recuperação caiu significativamente.\n\nCom 12 horas ainda temos tempo, na maioria dos casos, para repriorizar picking ou movimentar estoque sem quebrar a promessa.\n\nPortanto, 12 horas é uma recomendação baseada no comportamento recente da sua operação, não uma configuração informada por você.\n\nPodemos alterar esse limite.",
        quickReplies: ["Não, pode manter."],
      },
      { speaker: "manager", phase: "Review", text: "Não, pode manter." },
      {
        speaker: "agent", phase: "Recommend",
        text: "Combinado. Vou estruturar a proposta assim:\n\nPickup SLA Protection\nObjetivo proposto: manter pelo menos 98% dos pedidos de retirada disponíveis dentro das 48 horas prometidas.\n\nRegra 1 — Pedido em atenção\nQuando: status diferente de Ready for pickup e SLA restante menor que 12h.\nPosso verificar o picking, avaliar a capacidade da loja, repriorizar o pedido e procurar estoque alternativo.\n\nRegra 2 — Pedido crítico\nQuando: status diferente de Ready for pickup e SLA restante menor que 8h.\nPosso reservar estoque alternativo, realocar fulfillment ou criar uma transferência.\n\nRegra 3 — Limite de recuperação\nQuando: custo adicional maior que R$15.\nNão executo automaticamente — peço sua aprovação.\n\nRegra 4 — Mudança da loja de retirada\nQuando: loja alternativa diferente da loja escolhida pelo cliente.\nPreparo a alternativa, mas só executo após consentimento do cliente.",
        quickReplies: ["E o problema do Shopping A que você comentou?"],
      },
      { speaker: "manager", phase: "Recommend", text: "E o problema do Shopping A que você comentou?" },
      {
        speaker: "agent", phase: "Recommend",
        text: "Também encontrei um padrão específico ali.\n\nQuando o Shopping A ultrapassa aproximadamente 20 pedidos aguardando separação, o tempo médio de preparação aumenta 38%.\n\nPosso adicionar uma regra de capacidade:\n\nSe backlog maior que 20 pedidos e existir outro nó capaz de cumprir o SLA, reduzo a prioridade do Shopping A para novas alocações.\n\nA loja não seria bloqueada. Se não houver uma alternativa adequada, ela continua elegível.",
        quickReplies: ["Isso eu quero."],
      },
      { speaker: "manager", phase: "Recommend", text: "Isso eu quero." },
      {
        speaker: "agent", phase: "Simulate",
        text: "Adicionado.\n\nAntes de ativar, recomendo testar a política contra os últimos 30 dias para verificar o que ela teria feito.",
        quickReplies: ["Pode simular."],
      },
      { speaker: "manager", phase: "Simulate", text: "Pode simular." },
      {
        speaker: "agent", phase: "Simulate",
        text: "Simulação concluída.\n\nSe essa política estivesse ativa:\n\n612 pedidos de retirada teriam sido avaliados.\n74 teriam acionado alguma regra.\n46 poderiam ter sido recuperados automaticamente.\n11 exigiriam sua aprovação.\n6 exigiriam consentimento do cliente.\nR$386 seria o custo incremental estimado.\n\nO SLA projetado de retirada passaria de 94,8% para 98,2%.\n\nMinha recomendação é ativar a política e revisar os resultados após duas semanas.",
        quickReplies: ["Ativa."],
      },
      { speaker: "manager", phase: "Review", text: "Ativa." },
      {
        speaker: "agent", phase: "Scale",
        text: "Pickup SLA Protection ativada.\n\nVou executar automaticamente apenas dentro dos limites que você aprovou. Situações fora desses limites serão escaladas.\n\nTambém vou acompanhar o desempenho da política para identificar se os thresholds de 12h, 8h e 20 pedidos continuam adequados.",
        quickReplies: ["Transformar em política permanente"],
      },
    ],
  },
};
