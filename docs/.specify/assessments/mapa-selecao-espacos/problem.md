# Problem Definition: Escolher onde reservar sem noção do espaço físico

- **Slug**: mapa-selecao-espacos
- **Created**: 2026-10-06
- **Inputs used**: intake.md, research.md

## Problem Statement

Hoje o cliente e a recepção escolhem um espaço em uma lista com filtros (data, horário, duração,
tipo), sem ver **onde** o espaço fica, como os espaços se organizam em cada andar nem, de relance,
quais estão livres no período. Quando há muitos espaços por andar, comparar nomes e capacidades
em uma lista não dá noção de localização, vizinhança e tamanho relativo, e escolher o espaço certo
fica mais lento e mais sujeito a erro. (A pergunta que o problema precisa responder é: "qual
espaço, onde, está livre agora?".)

Observação de origem: a ideia chegou como solução ("fazer um mapa por andar"). O problema por trás,
inferido da imagem e das respostas do solicitante, é a falta de **contexto espacial e visão geral
de disponibilidade** na escolha do espaço. [NEEDS CLARIFICATION: confirmar que é isso, e não outro
motivo, como identidade visual ou ver o prédio.] — [source: intake.md]

## Affected Users & Stakeholders

- **Cliente (avulso e membro)**: escolhe o espaço pelo portal, inclusive no celular. Afetado por
  não saber onde o espaço fica e quais estão livres de relance. [NEEDS CLARIFICATION: não há
  evidência medida de que isso seja um problema real; só o pedido do solicitante.] — [source:
  research.md, Users & Demand]
- **Recepção**: reserva em nome de clientes e orienta pessoas no prédio; precisa localizar e
  indicar um espaço rapidamente. [ASSUMPTION: papel inferido da spec 001, F02 e F03]
- **Administrador**: mantém os espaços e hoje descreve o local só como texto ("3º andar").
  Afetado por não poder representar a organização real de cada andar. — [source: spec.md F07;
  data-model.md]
- **Stakeholder, responsável pelo projeto**: define o escopo e o protótipo (spec 001, Claude
  Design); decide se o mapa entra. — [source: intake.md]

## Goals

- Quem escolhe um espaço enxerga, em um único olhar, **onde** ele fica no andar e **quais estão
  livres** no período escolhido.
- A escolha do espaço é rápida e correta nos três tamanhos de tela, inclusive no celular.
- O estado "indisponível" é entendido sem depender só de cor (regra de acessibilidade do projeto).
- Quem usa teclado ou leitor de tela consegue selecionar um espaço por uma **lista alternativa**,
  com o mesmo resultado do mapa.
- Cada andar pode representar seu próprio formato, sem forçar uma grade igual para todos.
- A regra de preço, desconto e conflito continua intacta depois da escolha (RN02, RN03, RN06,
  RN13).

## Non-Goals

- Não é objetivo mudar regras de negócio de reserva, preço, multa ou pagamento.
- Não é objetivo controlar acesso físico, ocupação em tempo real do prédio nem navegação indoor
  (fora do escopo da spec e da constituição).
- Não é objetivo ter a lista como forma **principal** de seleção: o mapa é a principal em todos os
  dispositivos. A lista existe só como alternativa de acessibilidade (decisão do solicitante, que
  substitui "sem lista em nenhum dispositivo"). — [source: intake.md]
- Não é objetivo reservar vários espaços de uma vez nem reservas recorrentes (fora da v1, spec
  001, Assumptions).
- Não é objetivo definir tecnologia, formato de dados ou desenho das telas neste estágio.

## Success Metrics

Todas as metas abaixo são **propostas**, sem medição atual; o baseline é desconhecido por não
haver uso real. [NEEDS CLARIFICATION: confirmar quais metas o projeto adota.]

- Tempo do login ao resumo final da reserva continua **até 3 minutos** no protótipo (SC-001) e,
  idealmente, cai em relação ao fluxo com lista (baseline: a medir com o protótipo de lista da
  Onda 1).
- No teste de usabilidade com **pelo menos 5 pessoas**, 80% concluem reservar e cancelar sem
  ajuda (SC-007) usando o mapa (baseline: mesmo teste com a lista).
- **100%** das salas indisponíveis são reconhecidas como tal sem depender só de cor (verificação de
  acessibilidade).
- No celular (390 px), o usuário seleciona qualquer espaço do andar, inclusive os menores, sem
  erro de toque em um teste com 5 pessoas (alvo de toque de 44 px; baseline: desconhecido).
  (qualitativo)
- Nenhum espaço indisponível é reservável pelo mapa (RN03, RN04, RN05), em 100% dos casos de
  teste (SC-002).

## Cost of Inaction

Se nada for feito, a seleção continua por lista com filtros: **funciona e já está especificada e
prototipada** (T04 a T06 na Onda 1). O custo é uma escolha menos intuitiva e menos visual quando
houver muitos espaços por andar, e a perda da vantagem de mostrar a organização real do prédio. Não
há bloqueio de reserva, de receita nem de conformidade. Com poucos espaços (como no exemplo atual,
3 espaços), o custo é baixo. — [source: research.md, Market & Context e Evidence Against]

## Open Questions

- [Resolvido pelo solicitante: o problema é o **contexto espacial**, saber onde o espaço fica no
  andar. O solicitante pediu para considerar esse conceito; na prática, a pergunta confirma que o
  mapa serve para localizar e comparar espaços, e não só para decorar a tela.]
- [Resolvido pelo solicitante: a v1 suporta **2 andares, sem contar o térreo**.
  Os dois andares são o **1º e o 2º**. Cada andar tem **cerca de 23 blocos**, com layout próprio.]
- [Resolvido pelo solicitante: o mapa mostra cada espaço como **disponível ou cinza
  (indisponível)** conforme o filtro de **data e janela de horário** (como "Hoje: 14:00 - 18:00"
  na imagem): fora da data ou da janela, o espaço ou mesa aparece cinza.
  [Decisão do analista, a confirmar: um espaço só aparece disponível se tiver pelo menos 1h livre
  e contínua dentro da janela, porque a duração mínima é 1h (RN05); com menos que isso, aparece
  cinza.]]
- [Resolvido pelo solicitante: o bloco **mostra o preço antes do clique**, calculado pelo plano
  do usuário: **membro vê o preço com desconto; quem não é membro (ou não está logado) vê o preço
  cheio**; não mostra os dois ao mesmo tempo. Segue RN02 e RN13 (inclui cobrança vencida:
  desconto suspenso). O cartão de espaço do design system já exibe o preço assim.]
- [Resolvido pelo solicitante: as **mesas de capacidade 1 entram no mapa**, com 23 blocos por
  andar no total. [Decisão do analista, a confirmar: mesas são blocos pequenos, na mesma escala
  das salas (proporcional a largura e comprimento), com tamanho mínimo de toque; o administrador
  as posiciona juntas arrastando. Sem entidade de "zona" ou "grupo" na v1.]]
- [Resolvido pelo solicitante: o administrador define o layout com **blocos, informando a
  largura e o comprimento de cada sala, e posiciona o bloco arrastando**.]
- [Resolvido pelo solicitante: o layout é **livre** (não há planta real do prédio).]
- [Resolvido pelo solicitante: a acessibilidade vem de uma **lista alternativa**, visível para
  todos como botão "Ver em lista" (opção recomendada). Substitui a decisão anterior "sem lista em
  nenhum dispositivo".]
- [NEEDS CLARIFICATION: Impacto formal em RN01, FR-003 e FR-012, na entidade Espaço (andar e
  posição) e na reabertura de T04 a T06 da Onda 1.]
