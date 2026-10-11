# Idea Intake: Mapa de seleção de salas e mesas por andar

- **Slug**: mapa-selecao-espacos
- **Created**: 2026-10-06
- **Source**: pasted text + imagem anexada (mapa do 2º andar)
- **Type**: new-capability

## Idea (as captured)

> "E se criarmos um prompt para ele fazer a tela de selecionar mesa/sala desta forma da imagem
> anexada? Com opção de selecionar andar, e cada andar teria seu respectivo formato."

Imagem de referência: título "Mapa do 2º Andar" e "Hoje: 14:00 - 18:00". Salas desenhadas como
retângulos de tamanhos diferentes (grandes, médias e pequenas) em um layout de planta. Cada
retângulo mostra nome ("Sala Premium") e capacidade ("Reunião para 10 pessoas"), borda em tom
de roxo, sem preço nem estado visíveis.

## Restated

Substituir a seleção de espaço por lista (hoje F02, T04 a T06) por um **mapa visual do andar**,
em que cada sala ou mesa é um bloco clicável posicionado como na planta real. O usuário escolhe o
andar e vê o layout próprio dele.

## Origin & Context

- **Raised by**: responsável pelo projeto Hubbi (usuário desta sessão)
- **Trigger**: ao prototipar a Onda 1 com o Claude Design, quer uma seleção de espaço mais visual,
  baseada em uma referência de mapa; [NEEDS CLARIFICATION: nome da fonte da imagem, se houver]

## Decisões já informadas pelo solicitante (registradas, não avaliadas)

| Ponto | Resposta |
|-------|----------|
| Entra na spec 001 ou vira spec nova? | **Entra na spec 001** |
| Mapa é a seleção principal ou modo alternativo à lista? | **Seleção principal** |
| O espaço passa a ter andar e posição no layout? | **Sim** |
| Quem desenha e edita o layout de cada andar? | **Administrador** (F07) |
| Como mostra disponibilidade no período? | Só dá para clicar em sala **com horário disponível**; sem disponibilidade, a sala aparece **em cinza**. Ao clicar, entra na sala selecionada e vê horários e o resto do fluxo |
| Celular (390 px) | **Deve existir** versão para celular; como ficará ainda **não definido** |
| Como o mapa funciona no celular? | **Mapa com zoom e arrasto** (mesma planta do andar, navegável por gestos) |
| A lista de espaços continua como alternativa? | **Atualizado em 2026-10-06:** o mapa é a seleção principal em todos os dispositivos; a **lista volta como alternativa de acessibilidade** (teclado e leitor de tela). Substitui a decisão anterior "sem lista em nenhum dispositivo" |
| Quantos andares na v1? | **2 andares, sem contar o térreo**, cada um com **cerca de 23 blocos** e layout próprio |
| Como o administrador define o layout? | Com **blocos**, informando **largura e comprimento** da sala e **arrastando** para posicionar |
| A lista alternativa fica visível para todos? | **Sim**, como botão "Ver em lista" |
| O bloco mostra preço antes do clique? | **Sim** |
| Mesas de capacidade 1 entram no mapa? | **Sim** |
| O que define "livre"? | Filtro de **data e janela de horário**; fora dela, o espaço ou mesa fica **cinza** (indisponível). Decisão do analista a confirmar: disponível só com 1h livre contínua na janela (RN05) |
| Qual preço o bloco mostra? | Só o **preço do próprio usuário**: membro vê com desconto, não membro vê o cheio (RN02, RN13) |
| Andares da v1 | **1º e 2º andar** |
| Há planta real do prédio? | **Não, layout livre** |
| Mesas e salas no mesmo mapa | Decisão do analista a confirmar: blocos pequenos na mesma escala, tamanho mínimo de toque, posicionados juntos pelo administrador, sem entidade de zona |

## First-Glance Unknowns

- [Resolvido pelo solicitante: celular usa mapa com zoom e arrasto. A avaliar no define: alvo de
  toque mínimo de 44 px em blocos pequenos, zoom inicial que mostre o andar inteiro, alternativa
  ao gesto de pinça (botões de mais e menos) e acesso por teclado e leitor de tela.]
- [Resolvido pelo solicitante: sem lista em qualquer dispositivo. Consequência a avaliar: sem a
  lista, o mapa carrega sozinho a acessibilidade (leitor de tela, teclado) e o celular; T04 deixa
  de existir como tela de lista e passa a ser o mapa.]
- [NEEDS CLARIFICATION: Como o administrador desenha o layout? Editor visual de arrastar e
  redimensionar, ou grade fixa com blocos de poucos tamanhos? Isso define a tela nova de F07.]
- [NEEDS CLARIFICATION: O que o bloco mostra além de nome e capacidade? Preço por hora,
  estado, e o desconto de membro? A imagem não mostra preço.]
- [NEEDS CLARIFICATION: A disponibilidade do mapa vale para qual período? "Hoje: 14:00–18:00" na
  imagem sugere filtro de data e janela de horário; confirmar os filtros do mapa.]
- [NEEDS CLARIFICATION: Sala em cinza sem horário livre explica o motivo ao toque (acessibilidade:
  não só por cor)?]
- [NEEDS CLARIFICATION: Mesa hot-desk (capacidade 1) aparece como bloco no mapa, em área de mesas
  agrupadas, ou fica fora do mapa?]
- [NEEDS CLARIFICATION: Quantos andares e quantos espaços por andar a v1 deve suportar?]
- [NEEDS CLARIFICATION: Impacto nos requisitos existentes: RN01 (espaço reservável), FR-003,
  FR-012 e a entidade Espaço ganham andar e posição. A Constituição (Princípio I) aceita o mapa
  dentro do escopo de gestão de reservas?]

## Contexto do que já existe (referência, sem avaliar)

- Spec 001: F02 (T04, T05, T06), F07 (T23 a T25), entidade Espaço com "andar ou local" apenas.
- Briefing de design: Onda 1 em andamento; seleção hoje em lista com filtros.
- Cartão de espaço e seletor de horário já existem no design system.
