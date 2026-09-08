/* ══════════════════════════════════════════════════════════════════════
   mode1-dialogue-script.js
   ──────────────────────────────────────────────────────────────────────
   Dado puro: o roteiro completo do Modo 1 ("O gerente solicita ao
   agente") do Product Briefing "Criação de Políticas com Agente",
   transcrito do exemplo de diálogo completo — criação de uma política de
   Pickup SLA, incluindo o adendo de operação/explicabilidade dois dias
   depois. Nenhuma lógica de apresentação mora aqui — só o roteiro.

   Cada turno é { speaker: "manager" | "agent", phase, text, quickReplies? }.
   `phase` mapeia para as 11 etapas do Modo 1 (Describe → ... → Learn) —
   hoje só documenta em qual etapa cada turno está, nenhuma tela lê esse
   campo.

   `quickReplies` em turnos do agente é a fala literal do gerente no turno
   seguinte do documento — vira botão clicável no chat (mode1-engine.js
   ignora o texto de qualquer forma, só usa a mensagem para avançar), para
   o gerente poupar tempo em vez de digitar de novo o que o roteiro já
   sabe que ele diria. Digitar livremente continua funcionando igual.

   Texto puro, sem markdown: este roteiro é tocado por mode1-engine.js
   dentro de QUALQUER chat existente no protótipo (Orders, Assistente de
   políticas, My Assistant) — alguns desses chats não interpretam
   **negrito**, então o rascunho da política e o resultado da simulação,
   que antes eram cards visuais numa tela dedicada, aqui são só texto
   corrido, igual ao resto da conversa.
   ══════════════════════════════════════════════════════════════════════ */
window.MODE1_SCRIPTS = {
  "pickup-sla-protection": {
    id: "pickup-sla-protection",
    title: "Pickup SLA Protection",
    turns: [
      { speaker: "manager", phase: "Describe", text: "Quero melhorar nossa operação de retirada em loja. Prometemos retirada em até 48 horas, mas às vezes só descobrimos que existe um problema quando o cliente já está cobrando." },
      {
        speaker: "agent", phase: "Understand",
        text: "Entendi. Posso criar uma política para acompanhar os pedidos de retirada antes que o prazo seja comprometido e tentar recuperar automaticamente os pedidos em risco.\n\nHoje, qual nível de serviço você considera aceitável? Por exemplo, você quer proteger todos os pedidos ou trabalhar com uma meta como 95% ou 98% dentro das 48 horas?",
        quickReplies: ["Quero pelo menos 98% dentro das 48 horas. Não precisa me chamar para qualquer problema. Quero que você tente resolver primeiro."],
      },
      { speaker: "manager", phase: "Understand", text: "Quero pelo menos 98% dentro das 48 horas. Não precisa me chamar para qualquer problema. Quero que você tente resolver primeiro." },
      {
        speaker: "agent", phase: "Propose",
        text: "Certo. Vou considerar como objetivo:\n\nManter pelo menos 98% dos pedidos de retirada disponíveis dentro da promessa de 48 horas, tentando recuperar automaticamente pedidos em risco antes de envolver o gerente.\n\nPara conseguir agir antecipadamente, preciso definir quando um pedido começa a ser considerado em risco. Como você não definiu esse limite, minha sugestão inicial é:\n\n— Em atenção: pedido ainda não disponível e faltando menos de 18 horas para o prazo.\n— Crítico: pedido ainda não disponível e faltando menos de 8 horas.\n\nEsses dois limites são sugestões minhas. Quer começar assim?",
        quickReplies: ["18 horas me parece muito cedo. Comece quando faltarem 12 horas. O crítico pode ser 8 horas."],
      },
      { speaker: "manager", phase: "Propose", text: "18 horas me parece muito cedo. Comece quando faltarem 12 horas. O crítico pode ser 8 horas." },
      {
        speaker: "agent", phase: "Generate",
        text: "Perfeito. Então teremos:\n\nEm atenção: pedido não disponível + SLA restante < 12h\nCrítico: pedido não disponível + SLA restante < 8h\n\nQuando um pedido entrar em atenção, proponho verificar o status do picking, a fila da loja e a disponibilidade do mesmo item em outros estoques. Se o problema for apenas prioridade de separação, posso repriorizar o pedido automaticamente.\n\nPosso fazer isso sem pedir sua aprovação?",
        quickReplies: ["Pode procurar estoque em outra loja, Pode sugerir esta repriorização, mas, eu prefiro decidir.."],
      },
      { speaker: "manager", phase: "Generate", text: "Pode procurar estoque em outra loja, Pode sugerir esta repriorização, mas, eu prefiro decidir.." },
      {
        speaker: "agent", phase: "Assign Capabilities",
        text: "E se eu encontrar estoque em outra loja, posso transferir o produto ou mudar o fulfillment para recuperar o pedido?",
        quickReplies: ["Pode sugerir, desde que não fique muito caro. E não quero que você mude a loja onde o cliente vai retirar sem falar com ele."],
      },
      { speaker: "manager", phase: "Assign Capabilities", text: "Pode sugerir, desde que não fique muito caro. E não quero que você mude a loja onde o cliente vai retirar sem falar com ele." },
      {
        speaker: "agent", phase: "Assign Capabilities",
        text: "Entendido. São duas restrições diferentes:\n\n1. Posso sugerir a recuperação do pedido usando outro estoque, e aguardar a sua confirmação..\n2. Não posso alterar a loja de retirada escolhida pelo cliente sem consentimento.\n\nPrecisamos definir também quanto posso gastar adicionalmente para recuperar um pedido. Você quer estabelecer um limite?",
        quickReplies: ["Até R$15 pode fazer sozinho. Acima disso quero aprovar."],
      },
      { speaker: "manager", phase: "Assign Capabilities", text: "Até R$15 pode fazer sozinho. Acima disso quero aprovar." },
      {
        speaker: "agent", phase: "Review",
        text: "Certo. Com essas decisões, consigo montar a primeira versão da política.\n\nPickup SLA Protection — Draft\n\nObjetivo: manter ≥98% dos pedidos de retirada disponíveis dentro das 48 horas prometidas.\n\nRegra 1 — Pedido em atenção\nQuando o pedido ainda não estiver pronto para retirada e restarem menos de 12h para o SLA.\n\nPosso verificar picking, verificar backlog da loja, repriorizar a separação e procurar estoque alternativo.\n\nRegra 2 — Pedido crítico\nQuando o pedido ainda não estiver pronto e restarem menos de 8h.\n\nPosso reservar estoque alternativo, realocar fulfillment ou criar uma transferência, desde que o custo adicional seja de até R$15.\n\nRegra 3 — Mudança da loja de retirada\nSe a melhor alternativa exigir uma loja diferente da escolhida pelo cliente, posso preparar a alternativa, mas preciso solicitar consentimento antes da mudança.\n\nEscalo para você quando o custo adicional superar R$15 ou quando não encontrar uma alternativa capaz de preservar a promessa.\n\nQuer revisar alguma dessas condições antes de testarmos a política?",
        quickReplies: ["Tem mais uma coisa. O Shopping A costuma ficar congestionado no fim do dia. Quando tiver mais de 20 pedidos esperando separação, não quero que você continue mandando pedidos para lá só porque tem estoque."],
      },
      { speaker: "manager", phase: "Review", text: "Tem mais uma coisa. O Shopping A costuma ficar congestionado no fim do dia. Quando tiver mais de 20 pedidos esperando separação, não quero que você continue mandando pedidos para lá só porque tem estoque." },
      {
        speaker: "agent", phase: "Review",
        text: "Isso adiciona uma condição importante de capacidade operacional. Posso criar uma quarta regra:\n\nRegra 4 — Loja congestionada\n\nQuando:\nPicking pendente > 20 pedidos\nE existir outro nó elegível capaz de atender o pedido dentro do SLA\n\neu deixo de priorizar o Shopping A para novas alocações e comparo as alternativas disponíveis.\n\nPosso usar o mesmo limite de R$15 de custo adicional que já definimos para a política?",
        quickReplies: ["Sim. Mas não quero bloquear completamente a loja. Se não existir alternativa, ainda pode mandar para ela."],
      },
      { speaker: "manager", phase: "Review", text: "Sim. Mas não quero bloquear completamente a loja. Se não existir alternativa, ainda pode mandar para ela." },
      {
        speaker: "agent", phase: "Review",
        text: "Ajustado. A regra não bloqueará o Shopping A. Ela apenas reduzirá sua prioridade quando houver uma alternativa capaz de cumprir a promessa.\n\nFicará assim:\nSe backlog >20 pedidos E existir alternativa elegível → priorizar alternativa.\nSe não existir alternativa elegível → Shopping A continua disponível.\n\nIsso evita transformar uma condição de capacidade em um bloqueio absoluto.",
        quickReplies: ["Perfeito."],
      },
      { speaker: "manager", phase: "Review", text: "Perfeito." },
      {
        speaker: "agent", phase: "Test",
        text: "Antes de ativar, recomendo testar essa política contra os pedidos recentes para entender o impacto. Posso simular usando os últimos 7 dias sem executar nenhuma ação real.",
        quickReplies: ["Pode."],
      },
      { speaker: "manager", phase: "Test", text: "Pode." },
      {
        speaker: "agent", phase: "Test",
        text: "Simulação concluída.\n\nNos últimos 7 dias:\n\n182 pedidos de retirada teriam sido avaliados.\n37 teriam acionado pelo menos uma regra.\n21 apresentavam possibilidade de recuperação automática.\n8 teriam utilizado estoque alternativo ou transferência.\n4 exigiriam consentimento do cliente para mudança da loja.\nO custo incremental estimado seria de R$174.\n\nO SLA de retirada projetado passaria de 94,7% para 98,1%.\n\nTambém encontrei 3 pedidos nos quais seria necessário gastar mais de R$15; nesses casos eu teria escalado para você.\n\nQuer ativar a política com essas configurações?",
        quickReplies: ["Antes disso, esses R$174 são principalmente transferência entre lojas?"],
      },
      { speaker: "manager", phase: "Test", text: "Antes disso, esses R$174 são principalmente transferência entre lojas?" },
      {
        speaker: "agent", phase: "Test",
        text: "Sim. Na simulação, R$132 dos R$174 estão associados a transferências entre lojas. Os R$42 restantes vêm de alternativas de fulfillment mais caras.\n\nO Shopping A responde por 62% desse custo incremental, principalmente entre 17h e 20h.\n\nSe quiser, podemos limitar transferências nessa loja ou manter a configuração atual e acompanhar o resultado real.",
        quickReplies: ["Vamos manter assim por enquanto. Ativa."],
      },
      { speaker: "manager", phase: "Approve", text: "Vamos manter assim por enquanto. Ativa." },
      {
        speaker: "agent", phase: "Execute",
        text: "Pickup SLA Protection ativada.\n\nA partir de agora vou:\n— acompanhar continuamente os pedidos de retirada;\n— considerar pedidos em atenção quando restarem menos de 12h;\n— tratar como críticos quando restarem menos de 8h;\n— executar as ações autorizadas até R$15 de custo adicional;\n— considerar capacidade da loja antes de direcionar novos pedidos;\n— nunca alterar a loja escolhida pelo cliente sem consentimento;\n— envolver você quando os limites da política forem ultrapassados.\n\nTodas as decisões e ações executadas ficarão registradas para revisão. Caso exista alguma ação que não consiga executar, vou abrir uma iniciativa para que você consiga acompanhar.",
        quickReplies: ["Criar política", "Dois dias depois: por que você transferiu o pedido #12345 do CD para o Shopping B?"],
      },
      { speaker: "manager", phase: "Explain", text: "Dois dias depois: Por que você transferiu o pedido #12345 do CD para o Shopping B?" },
      {
        speaker: "agent", phase: "Explain",
        text: "A regra Pedido crítico foi acionada às 14:12 porque o pedido ainda não estava pronto e restavam 6h40 para o SLA.\n\nO Shopping A, originalmente responsável pelo fulfillment, tinha 24 pedidos aguardando picking, acionando também a regra Loja congestionada.\n\nEncontrei o mesmo SKU no Shopping B, com estoque disponível e confiança de inventário de 98%. A transferência acrescentou R$11 ao custo e preservou a promessa de retirada.\n\nComo o custo ficou abaixo do limite de R$15 e a loja escolhida pelo cliente não foi alterada, executei a recuperação automaticamente.",
        quickReplies: ["Entendi. Está acontecendo muito no Shopping A?"],
      },
      { speaker: "manager", phase: "Learn", text: "Entendi. Está acontecendo muito no Shopping A?" },
      { speaker: "agent", phase: "Learn", text: "Sim. Nos últimos dois dias, 11 dos 17 pedidos que entraram em atenção estavam associados ao Shopping A, principalmente entre 17h e 20h.\n\nAinda não recomendo alterar a política com apenas dois dias de dados, mas posso continuar acompanhando. Se o padrão persistir, uma possível evolução seria aplicar um threshold de capacidade específico para essa loja." },
    ],
  },
};
