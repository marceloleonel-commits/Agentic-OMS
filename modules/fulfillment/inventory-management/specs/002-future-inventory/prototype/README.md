# Inventário futuro — protótipo da listagem

Protótipo navegável da listagem do módulo **Inventário futuro**, nas duas
granularidades desenhadas — **por lote** e **por SKU** —, para alinhar layout e
interações antes da implementação.

Hierarquia sob `specs/002-future-inventory/`:

| Spec | Escopo |
| --- | --- |
| [`product-brief.md`](../product-brief.md) · [`product-spec.md`](../product-spec.md) | **002** — MMR / product spec |
| [`002.1-listagem-por-lote.md`](../002.1-listagem-por-lote.md) | UI contract — visão por lote |
| [`002.2-listagem-por-sku.md`](../002.2-listagem-por-sku.md) | UI contract — visão por SKU |
| `002.3-criacao-de-lote.md` | UI contract — formulário de criação (em andamento na [#125](https://github.com/vtex/vertical-distributed-order-management-dom/pull/125)) |

- **Arquivo**: [`inventario-futuro-listagem.html`](./inventario-futuro-listagem.html)
- **Design**: [Figma — Future inventory, frames `listagem por lote`](https://www.figma.com/design/xLwjBVD8h1llHt7FcW96Fv/Future-inventory?node-id=86-60142)
  e [`listagem por produto`](https://www.figma.com/design/xLwjBVD8h1llHt7FcW96Fv/Future-inventory?node-id=88-5259)
- **Especificações**: [`002.1-listagem-por-lote.md`](../002.1-listagem-por-lote.md) ·
  [`002.2-listagem-por-sku.md`](../002.2-listagem-por-sku.md)

## Como abrir

Abrir o arquivo direto no navegador basta — não há build, dependência ou servidor:

```bash
open inventario-futuro-listagem.html
```

O CSS do Shoreline e a fonte Inter vêm de CDN, então a primeira abertura precisa
de rede.

## O que dá para experimentar

| Interação | Comportamento |
| --------- | ------------- |
| Trocar de visão | **Por lote** e **Por SKU** renderizam listagens diferentes sobre a mesma fixture. A busca e os filtros sobrevivem à troca; a página volta para a primeira, porque os totais das duas visões não são os mesmos. |
| Buscar | Casa código e nome do lote, e também nome e ID de SKU. Na visão por lote, quando o resultado vem de um SKU, o lote abre sozinho para mostrar por que apareceu; na visão por SKU não há o que abrir, porque o SKU que casou já é a linha. |
| Expandir lote | Só na visão por lote, e só pelo botão de expandir, nunca pelo clique na linha inteira. Revela os SKUs do lote, e um recolhimento manual vence a abertura automática da busca. |
| Filtrar | Destino, data de chegada, quantidade e status. Cada filtro só vale ao clicar em **Aplicar**; um intervalo de datas invertido é recusado com mensagem. |
| Preencher uma data | Os campos de chegada são segmentados: dá para digitar dia, mês e ano direto, andar entre eles com as setas, mudar o valor com as setas para cima e para baixo, ou escolher no calendário pelo botão à direita. |
| Quantidade nas duas visões | O filtro sempre limita **o número que está na coluna visível**: o total do lote na visão por lote, a quantidade daquele SKU naquele lote na visão por SKU. Um lote de 54 unidades feito de 24, 18 e 12 passa por um mínimo de 20 na visão por lote e contribui uma linha só na visão por SKU. |
| Ajuda contextual | O "?" ao lado de **Destino**, na visão por SKU, explica por que várias linhas repetem o mesmo destino, a mesma data e o mesmo status. Fecha no `Esc` e no clique fora, como os filtros. |
| Paginar | 25 linhas por página: 74 lotes em 3 páginas na visão por lote, 149 linhas em 6 páginas na visão por SKU. Trocar de página recolhe as expansões. |
| Recolher a navegação | O hamburger da topbar esconde e reabre a sidebar. |
| Estados vazios | Buscar algo inexistente mostra o estado de busca sem resultado, com ação de limpar filtros. O estado de coleção vazia — com a ação de criar lote — existe no código e só apareceria com a fixture zerada. |
| Carregamento | O skeleton aparece por um instante ao abrir; é um estado real da tela, não enfeite, e sai com as colunas da visão em que está. |

**Criar lote futuro**, a ordenação por coluna e o menu de ações de cada linha
estão desenhados mas inertes: pertencem a outras telas. Não há seleção múltipla
em nenhuma das duas visões.

## Fidelidade visual

O protótipo carrega o **CSS real do `@vtex/shoreline`**, com a versão pinada em
`1.12.13`. A estilização do Shoreline é feita por seletores de atributo
(`data-sl-*`), então funciona em HTML puro, sem React e sem build: tabela, tags,
botões, popover, filtros, paginação, skeleton, ajuda contextual e estados vazios
são os componentes oficiais, não imitações.

O cabeçalho reproduz a árvore que o `PageHeader` monta em React: `Container` >
`Content` (em modo `narrow`) > `header` > `PageHeader`. Quem dá o espaçamento é o
`Content`, por container query — não há padding próprio no protótipo. O título é
o `Heading` na variante `display1` (24px/600), e cada ação do lado direito vai
dentro de um `Bleed` de -8px no topo e na base, como nas stories do componente:
sem isso, um botão `large` de 44px estica a linha do cabeçalho.

A tabela declara `data-sl-table-density="default"`, que é o que o componente
`Table` emite por padrão e o que leva o padding das células a 12px. Com isso o
cabeçalho fica nos 44px e as linhas nos 64px que as [boas práticas da
Table](https://shoreline.vtex.com/components/table) definem — 64px é o valor
previsto justamente para linhas com imagem ou duas linhas de texto, que é o caso
aqui. A altura não é fixada em CSS: ela cai nos 64px por composição, somando os
12px de padding, os 20px da primeira linha, os 4px de gap e os 16px da segunda.

**As colunas da direita são separadas por 16px**, e isso exige uma ressalva. O vão
entre dois conteúdos vizinhos é a soma dos paddings que se encostam, então os 12px
da densidade default renderiam 24px. Para chegar a 16px, as células a partir da
segunda usam 8px na lateral — o padding vertical continua em 12px, que é o que
sustenta a linha de 64px, e a borda externa da última coluna volta aos 12px para o
menu não sair do alinhamento com a paginação. As larguras são fixas e valem o
conteúdo mais largo da fixture mais esses 16px: Destino 166px, Quantidade 94px
(medida pelo cabeçalho, que é bem mais largo que o número), Chegada 97px, Status
106px e 56px no menu. Usar `max-content` seria mais elegante, mas fazia as colunas
pularem quando o esqueleto de carregamento saía, porque aí quem media as colunas
eram as barras do esqueleto. **Se a fixture mudar, essas larguras precisam ser
remedidas.**

A visão por SKU tem sete colunas e reaproveita cinco dessas medidas, porque o
conteúdo é o mesmo. As duas novas foram medidas do mesmo jeito, no navegador:
**Lote 184px**, que é o nome de lote mais longo da fixture (168px, em "Reposição
marketplace 4") mais os 16px, e **Produto** na fatia flexível
`minmax(230px, 1fr)` — o mesmo piso que o Lote tem na outra visão, suficiente
para a miniatura, para a linha do `SKU ID` inteira e para um pedaço legível do
nome, que trunca com reticências e expõe o valor completo no `title`.

Cabeçalho e grade das duas visões saem de uma definição só, o `COLUMNS` no topo
do script, que o esqueleto de carregamento também lê. É isso que garante o que a
versão anterior já tinha aprendido a duras penas: **nenhuma coluna muda de
largura quando o dado substitui o esqueleto.**

Um vão continua largo por natureza: entre Destino e Quantidade. A quantidade é
alinhada à direita, como manda uma coluna numérica, e o cabeçalho "Quantidade" é
cinco vezes mais largo que um número de dois dígitos — logo o número fica longe do
destino, por mais que as colunas estejam a 16px. Encurtar o cabeçalho resolveria.

Na visão por lote, o botão de expandir a linha reproduz o `getExpandedColumn` do
pacote `ts-table`:
um `IconButton` na variante `tertiary` e tamanho `normal` (36px), dentro de um
`Bleed` de -8px nos quatro lados, que devolve os 20px de espaço que a célula
espera. Por ser o `IconButton` de verdade, hover, pressed, foco e desabilitado
vêm dos tokens do design system, e não de CSS próprio. Assim como no Shoreline,
o estado aberto **troca o ícone** — `IconCaretRight` por `IconCaretDown` — em vez
de rotacionar um único caret.

Há **um desvio deliberado do Shoreline** no lote aberto, para bater com o Figma:
o lote e seus SKUs viram um bloco só. A linha do lote perde a borda de baixo
quando está aberta, e a última linha cinza fecha o bloco só com o arredondamento
de 12px e o fundo — sem borda, porque a mudança de cor já demarca onde o bloco
termina. As linhas do meio mantêm a borda, que é o que separa um SKU do outro.
Como as linhas são `display: contents`, o raio vai nas células das pontas, não na
linha. O gancho é o `data-expanded` que o próprio `TableRow` emite, então nada
disso vaza para os lotes fechados.

A estrutura da listagem segue o [template de página de
listagem](https://shoreline.vtex.com/components/collection) do design system:
`Collection` empilha as áreas com espaçamento próprio e cada `CollectionRow` é
uma linha — busca com a paginação à direita, filtros abaixo, tabela, e a
paginação de baixo alinhada à direita. Nenhum desses contêineres tem borda,
fundo ou raio: **a tabela do Admin não é um cartão.**

Os **estados vazios** vêm do mesmo template, pelo `CollectionView`: fora do
estado `ready`, ele troca a lista por um `EmptyState` em `size="large"` — o
tamanho que uma `Collection` pede — composto de ilustração, título, descrição e
ação, dentro de um `data-sl-collection-view` que é quem centraliza o bloco e
reserva os 380px de altura mínima. A versão anterior aproximava esse desenho com
um `.empty-wrap` de CSS próprio, sem ilustração e no tamanho `medium`: era o
mesmo tipo de erro do `.surface` que já tinha sido removido da tabela, CSS local
no lugar de um componente que existe. A ilustração é `IconMagnifyingGlass` na
busca sem resultado e `IconPlusCircle` na coleção vazia, as duas em
`--sl-color-gray-8`, e a ação de criar leva o `IconPlus` antes do rótulo — tudo
como o componente emite.

O texto é nosso: o Shoreline **não traduz** o componente (o `pt.json` dele ainda
guarda as strings em inglês). Seguimos a redação que a própria documentação do
`EmptyState` manda — descrição curta, começando por verbo e **sem ponto final** —
mesmo onde o texto padrão em inglês a contraria. O título de busca sem resultado
carrega o substantivo da visão, "Nenhum lote encontrado" ou "Nenhum SKU
encontrado"; o de coleção vazia fala em lote nas duas visões, porque ali o
substantivo segue a ação oferecida, que é criar um lote.

Os **campos de intervalo** dos filtros de chegada e de quantidade são `Field` >
`Label` + controle, empilhados num `Stack`, com o aviso de intervalo invertido num
`FieldError`. Nenhum dos quatro precisava do CSS local que existia antes. Vale
saber por quê: o `Input` do Shoreline **é um `div`** com a moldura, a altura de
44px e o anel de foco, envolvendo um `<input data-sl-input-element>` que recebe o
padding lateral de 16px. Marcar o `<input>` direto com `data-sl-input` pega a
moldura mas perde o padding, e o texto encosta na borda.

O de quantidade não usa `type="number"`. **O Shoreline não tem campo numérico** —
não há `NumberInput` nem stepper na biblioteca —, e a documentação do `Input` o
define como campo de texto que pode restringir caracteres, "como aceitar apenas
números". Então o campo é texto com `inputmode="numeric"`, que chama o teclado
numérico no celular, e a restrição a dígitos é feita na digitação. Assim some o
spinner do navegador, que era chrome nativo, nunca desenho do design system.

Os de data são **`DatePicker`**, que aqui existe como componente e resolve o mesmo
problema pelo outro lado: em vez de restringir um campo livre, ele troca o campo
por três segmentos editáveis — `DateField` > `DateSegment` — mais um `IconButton`
que abre o `Calendar` num `Popover`. O que o Shoreline entrega é a árvore de
atributos e o desenho; o comportamento vem do React Aria, que não existe em HTML
puro, então foi reescrito: dígito preenche o segmento e pula para o próximo quando
não cabe mais nada (um `4` no dia fecha na hora, porque `4x` passaria de 31), as
setas verticais incrementam com volta no fim da faixa, as horizontais andam entre
segmentos, o backspace esvazia. Um 31 digitado em fevereiro recua para o último
dia do mês, no segmento e no valor — o campo nunca mostra data que não existe. O
valor de verdade fica num `input` escondido em ISO, que é o que o filtro lê, então
nada mudou do lado de quem consome.

Duas medidas do `DatePicker` foram ajustadas por custom property, que é para isso
que elas existem: o `--sl-datepicker-min-width` de 320px não cabe nos 260px do
popover de filtro, e o `Bleed` de `-8px` na ponta direita é o que o próprio
componente aplica ao botão do calendário.

O **filtro de destino** tem busca porque as boas práticas do `Filter` mandam
incluir uma `Search` quando a lista costuma passar de cinco itens. O de status
tem quatro e continua sem. A busca vai num `Content` estreito marcado com
`data-sl-filter-popover-combobox`, acima da lista, e a lista ganha
`data-sl-combobox-list` — é esse atributo que tira o padding de cima dela e fecha
o vão que sobraria entre as duas. Enquanto a busca "vai ao servidor" a lista é o
`FilterListSkeleton`, cinco barras de 20px nas larguras que o componente fixa, e
uma busca sem resultado cai no `EmptyState` **pequeno** de 15rem que a story
assíncrona do `Filter` usa — não o `large` da tabela, que não caberia nos 260px do
popover.

O **carregamento de dez em dez** não é padrão do Shoreline: a biblioteca não tem
paginação nem scroll infinito em filtro, e a story dela corta o resultado em dez
no servidor e encerra o assunto. Aqui a lista carrega a primeira página quando o
filtro abre e mais dez sempre que o scroll chega a 48px do fim, com um `Spinner`
no rodapé da lista. Duas consequências valem registro. A página nova é
**acrescentada**, nunca redesenhada, porque reescrever a lista zera o `scrollTop`
e jogaria de volta ao topo quem acabou de chegar ao fim. E a seleção pendente vive
num `Set` fora do DOM: o que está na tela é só a página atual da busca atual, e um
destino marcado que saiu da lista precisa continuar marcado quando o **Aplicar**
for lido. Abrir o filtro sempre remonta esse conjunto a partir do que está
aplicado e limpa a busca — como não existe botão de cancelar, fechar sem aplicar é
desistir.

O **resumo no gatilho** passou a seguir o `FilterValue`: o rótulo do primeiro
selecionado e a contagem do resto, `Destino: Filial Moema — Estoque principal, +1`.
Antes era só a contagem, que não dizia qual. O componente pede explicitamente para
não customizar esse resumo, e ele não trunca — com nomes de destino longos o
gatilho fica largo, e é assim que o Admin ficaria.

A **ajuda contextual** do cabeçalho "Destino" é o `ContextualHelp`: o gatilho é
o `IconButton` com o "?" num círculo cinza que o componente desenha — não um
ícone da biblioteca — e o painel é o `Popover` com `Container` > `Content`. O
gatilho tem 24px e a linha de texto do cabeçalho tem 20px, então ele vai dentro
de um `Bleed` de -2px no topo e na base para o cabeçalho continuar nos 44px.

Esses atributos não são API pública para escrita manual — uma atualização do
Shoreline pode mudá-los. Por isso a versão está pinada, e por isso esse formato
serve para protótipo, não para produção.

Duas coisas o Shoreline não entrega e o protótipo precisa resolver por fora:

- **A fonte.** O token `--sl-font-family-sans` pede Inter, mas o pacote não
  empacota o webfont — no Admin real quem carrega é o shell. O protótipo puxa
  Inter do Google Fonts; sem isso o CSS cai no fallback do sistema e a tela muda
  de aparência conforme a máquina de quem abre.
- **A família da fonte no `body`.** O `reset.css` manda os controles herdarem a
  fonte (`input, button { font: inherit }`) e o `base.css` define só cor e fundo,
  então declarar `font-family` é responsabilidade da aplicação.

Os **ícones foram extraídos do próprio `@vtex/shoreline`** (`dist/index.mjs`),
não redesenhados — os 24 paths do protótipo são idênticos aos do pacote. Ficam
definidos num único mapa no topo do script e o HTML só marca a posição com
`<i data-icon="nome">`.

Sobre o peso: o [guia de ícones](https://shoreline.vtex.com/guides/design/icon)
manda partir do Phosphor no peso **Light** e aplicar `stroke-width` 1.5 — não o
peso Regular do Phosphor, que traria 1,25px em 20px. Some-se o
`vector-effect: non-scaling-stroke`, e o traço passa a valer 1,5px na tela
independentemente do tamanho de exibição. A consequência prática é que **cada
ícone precisa ser exibido no tamanho para o qual foi desenhado**: 20px no
`Normal` e 16px nas variantes `Small`. Exibir um ícone de 20 em 16px mantém o
traço em 1,5px sobre um desenho menor, o que engorda o peso aparente de 7,5%
para 9,4% do ícone e tira os detalhes da grade de pixels.

Duas coisas são CSS próprio, por não existirem como componente:

1. **O cromo do Admin** (topbar e sidebar), presente só para dar contexto de
   onde a tela vive. Todos os valores vêm de tokens `--sl-*`. O hamburger recolhe
   e reabre a navegação, como no Admin.
2. **O posicionamento dos popovers**, tanto os de filtro quanto o do calendário,
   que no Shoreline é responsabilidade do React Aria — o do calendário inclusive
   sai por portal. A aparência continua vindo do CSS oficial, e o calendário
   ancora no canto de baixo à esquerda do campo, como o `bottom-start` do
   componente: ele tem a largura que os sete dias pedem, então sobra para fora do
   popover de filtro.

Uma terceira é desvio deliberado: **o hover dos itens de filtro**, único ponto em
que o protótipo contraria o CSS que o Shoreline publica hoje. O componente pinta
um fundo cinza na linha inteira, mas o padrão é o hover responder no tipo do
item — num item de múltipla escolha quem reage é a caixa, com os estados do
Checkbox. A borda escurece de `gray-5` para `gray-6` quando vazia, e o azul vai
de `blue-10` para `blue-11` quando marcada. O CSS do Filter mostra essa migração
pela metade: ele declara o fundo de pressed e de item ativo e, três regras
abaixo, desfaz os dois, deixando só o hover da linha para trás.

O Shoreline não especifica a navegação lateral, então as medidas vêm do Figma e as
cores dos tokens. A geometria foi conferida pixel a pixel contra o print do
arquivo de design:

| Medida | Valor |
| ------ | ----- |
| Largura total da nav | 280px, borda inclusa (`box-sizing: border-box`) |
| Área do item e do sub-item | 36px |
| Passo entre itens | 40px — 36px de área e 4px de folga |
| Passo entre sub-itens | 36px — contíguos, sem folga |
| Primeiro item | 20px abaixo da borda do container |
| Recuo lateral das linhas | 20px de cada lado, o que dá linhas de 240px |
| Ícone | encosta na borda esquerda da linha, a 20px da borda da nav |
| Rótulo | 60px da borda da nav, tanto no item quanto no sub-item |
| Respiro entre grupos | 24px |
| Item selecionado | pílula de raio 6px em `--sl-bg-muted-plain-hover`, texto em `--sl-fg-accent` |

Tipografia e cor saem dos tokens: `--sl-text-body` e `--sl-text-emphasis`
(14px/20px — **13px não existe na escala**, que só tem 12, 14, 16, 20 e 24px),
rótulo de seção em `--sl-text-caption-1`, texto em `--sl-fg-muted`, rótulo de
grupo em `--sl-fg-base-soft` e superfície em `--sl-bg-base-soft`. Todos batem com
os pixels do print: `#3d3d3d`, `#707070`, `#0366dd` e `#f5f5f5`.

Três detalhes que valem atenção de quem editar o cromo:

- **Os itens não podem encolher.** Numa coluna flex todo filho tem
  `flex-shrink: 1`, então quando a lista não cabe na altura da janela os itens
  perdem altura em vez de a sidebar rolar — 36px viravam 30,14px numa janela de
  760px, e a nav saía da grade. Daí o `.sidebar > * { flex-shrink: 0 }`.
- **O raio de 6px da pílula não é token.** Fica entre `radius-1` (4px) e
  `radius-2` (8px). Cheguei nele calibrando o avanço do canto do print contra
  pílulas renderizadas em 4, 6, 8 e 12px: só a de 6px reproduz o perfil.
- **O que o Figma chama de "pressed" é a camada de hover do Shoreline.** A cor
  medida no print é `#eaeaea`, que é exatamente gray-12 a 5% sobre a superfície
  soft, e 5% é o que o design system nomeia `hover`; `pressed` seria 15%, bem mais
  escuro. Mantive o valor do Figma e usei a camada de 10% no hover do item ativo,
  senão passar o mouse nele não daria retorno nenhum.

A topbar também vem do Figma, e desta vez as medidas foram lidas direto do
arquivo em vez de estimadas do print. Todas as caixas conferem no navegador a
1440px de janela:

| Medida | Valor |
| ------ | ----- |
| Altura | 60px — 36px de conteúdo mais 12px de padding em cima e embaixo |
| Padding lateral | 12px |
| Respiro entre as três regiões | 16px |
| Toggle da navegação, logo e avatar | 36px cada |
| Folga entre toggle e logo | 8px |
| Folga entre logo e conta, e entre os botões da direita | 4px |
| Busca | 400x36, fundo `--sl-bg-muted`, raio 8px, ícone de 16px |
| Texto da busca, dos botões e do avatar | `--sl-text-action` (14px/600) |
| Rótulo da conta | `--sl-text-emphasis` (14px/500) em `--sl-fg-base` |
| Avatar | círculo de 24px em `--sl-color-blue-3` com a inicial em `--sl-color-blue-10` |

Dois pontos da topbar que fogem do caminho óbvio:

- **Os botões são Button e IconButton `tertiary` de verdade**, e é de lá que vem o
  peso 600 do texto — o Shoreline manda todo botão usar `--sl-text-action`, e a
  versão anterior usava `--sl-text-body` (400) num botão de CSS próprio. A única
  regra que a topbar dispensa é o `min-width: 100px` do Button: no Figma o "Help"
  tem 75px, ou seja, largura do conteúdo.
- **O logo é o desenho exportado do Figma**, não um ícone da biblioteca. O
  Shoreline não tem o logo, e o `#E6175C` da marca não corresponde a nenhum tom
  da paleta (`pink-10` é `#ca226a`).

O ícone do hamburger é o `IconList` (três traços em `M3.125 5/10/15`), conferido
contra o código do pacote. Ele já estava correto; o que estava fora era a caixa,
um botão de 28px de CSS próprio em vez do IconButton de 36px.

## Diferenças em relação ao Figma

| Diferença | Motivo |
| --------- | ------ |
| Status usa `Agendado / Recebido / Cancelado / Inativo` | O Figma marca lotes como `Ativo / Inativo`, que não distingue um lote que já chegou de um que foi cancelado. Registrado como decisão na especificação. `Em trânsito`, que reaparece no frame por produto, também fica de fora. |
| Colunas mais largas que no Figma | O Shoreline renderiza as células em 14px, acima do tamanho usado no arquivo de design. As larguras foram medidas a partir do conteúdo real, nas duas visões. |
| Miniatura do produto em 40px, não 44px | Os 12px de padding da densidade default levariam uma imagem de 44px a uma linha de 68px. 40px é o maior quadro que fecha exatamente os 64px que a Table prescreve — e 64px é justamente o valor previsto para linhas com imagem. O raio de 8px do Figma é mantido, que é `--sl-radius-2`. |
| Destino, chegada e status iguais em todas as linhas do mesmo lote | O Figma mostra trios diferentes em quatro linhas que dizem ser do mesmo lote `#001` — são as linhas dos lotes `#001` a `#004` da outra listagem, copiadas para este frame. Os três são propriedade do lote; a linha de SKU lê, não declara. |
| Um SKU aparece no máximo uma vez por lote | O Figma repete o mesmo SKU dentro de um lote, o que aqui renderizaria linhas idênticas. A fixture do `#001` virou três produtos distintos com as mesmas quantidades, então o total continua 15. |
| Melhor em 1300px ou mais | Abaixo de ~1110px de janela a visão por lote rola por dentro, e abaixo de ~1293px a visão por SKU também: a nav de 280px mais os 40px de padding de cada lado deixam menos espaço do que a soma mínima das colunas — 749px com seis colunas, 933px com sete. Acima disso sobra folga nas duas. |
| A página rola inteira, com o cabeçalho da tabela fixo | Vem do próprio componente, via `data-sl-table-header-sticky`: a tabela deixa de rolar por dentro e o cabeçalho gruda no topo. |

## Dados

Fixture determinística de 74 lotes, gerada no próprio arquivo: os cinco
primeiros reproduzem o Figma, incluindo quantidades e destinos, e os demais
existem para exercitar busca, filtro e paginação. A quantidade de um lote é
sempre a soma dos seus SKUs, nunca um número guardado.

Os mesmos 74 lotes achatam em **149 linhas de SKU**, uma por item de cada lote,
calculadas uma vez na carga. Cada linha guarda uma projeção do lote — código,
nome, destino, chegada e status — e é ordenada por data de chegada, com desempate
por código do lote e pela posição do SKU dentro dele, o que torna a ordem total e
a paginação estável entre aberturas. O total é propriedade da visão, não do
módulo: 74 numa, 149 na outra.

Os **destinos** são uma fonte à parte, não mais a projeção dos lotes: um catálogo
de 48, em ordem alfabética, do qual os lotes ocupam 20. Os 28 restantes aparecem
no filtro e levam ao estado vazio — é o que acontece no Admin, onde o filtro lista
os estoques da conta e nem todo estoque tem lote a caminho. O maior nome ocupa
149px, dentro dos 166px da coluna Destino, então as larguras medidas continuam
valendo. O status ganhou um deslocamento por volta na geração: como 4 divide 20,
sem ele todo lote de um mesmo destino cairia no mesmo status, e combinar os dois
filtros quase nunca acharia nada.
