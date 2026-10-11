# Decision: Mapa de seleção de salas e mesas por andar

- **Slug**: mapa-selecao-espacos
- **Decided**: 2026-10-06
- **Verdict**: needs-clarification
- **Artifacts reviewed**: intake.md, research.md, problem.md, concept.md

## Scorecard

| Criterion | Rating | Justification |
|-----------|--------|---------------|
| Problem validity | adequate | O problema (falta de contexto espacial e de visão geral de disponibilidade na escolha do espaço) é plausível e coerente com a imagem e as respostas do solicitante, mas a definição foi inferida de uma solução e não confirmada com usuários (`problem.md`, nota de origem) |
| Evidence strength | weak | Confiança baixa em demanda e prior art: um único pedido, nenhuma fonte externa consultada, nenhum dado de uso ou teste (`research.md`). A evidência interna de impacto é boa, mas não prova valor |
| Value vs. inaction | adequate | O custo de não fazer é baixo: a lista já está especificada e prototipada e cobre todos os cenários; o ganho cresce só com muitos espaços por andar (`problem.md`, Cost of Inaction). O valor depende de uma hipótese não medida |
| Feasibility / appetite | adequate | Existe opção credível, A com tamanho médio, mas com incerteza alta no editor de arrastar e no mapa em 390 px (`concept.md`) |
| Strategic fit | adequate | Cabe no escopo de gestão de reservas (Princípio I); o editor de layout é módulo novo e exige FR próprio. O retrabalho de T04 a T06 da Onda 1 pesa contra o foco em entregar o protótipo |
| Risk posture | adequate | Riscos principais identificados (editor, celular, paridade mapa e lista, disponibilidade em janela), mas só em parte mitigados: duas decisões ainda são do analista e uma ressalva (editor só em computador e tablet) não foi aceita pelo solicitante |

## Verdict & Rationale

**needs-clarification.** A regra do pipeline exige evidência `adequate` ou melhor para um `go`, e a
evidência aqui é `weak`: a demanda vem de uma única pessoa e nenhuma fonte externa foi consultada.
Não é um `kill`: o problema é plausível, o mapa cabe no escopo e já existe uma opção credível
(Opção A) com decisões importantes tomadas pelo solicitante (2 andares, cerca de 23 blocos,
layout livre, preço por tipo de plano, lista alternativa, cinza fora da janela). O que falta é
pouco e dá para fechar rápido, sem refazer o trabalho já feito.

Como o solicitante é também o responsável pelo projeto, ele pode **decidir seguir mesmo assim**:
essa seria uma decisão de produto dele, assumindo o risco registrado abaixo. Esta avaliação não
a impede; só não a rotula como `go` com base em evidência.

## If needs-clarification

- **Blocking questions**:
  - [NEEDS CLARIFICATION: Há ao menos um sinal de usuário além do pedido? Por exemplo, 3 a 5
    pessoas olham a imagem de referência e dizem se o mapa as ajudaria a escolher um espaço, e se
    prefeririam mapa ou lista. Isso melhora a evidência de `weak` para `adequate`.]
  - [NEEDS CLARIFICATION: Evidência externa sobre mapas de planta no celular (zoom, arrasto,
    alvo de toque) e sobre editores de layout. Não foi coletada: exige confirmar hosts, ou o
    solicitante enviar referências.]
  - [NEEDS CLARIFICATION: O solicitante aceita que o **editor de layout** exista só em
    computador e tablet (ressalva 1 do `concept.md`)? Define o tamanho real da Opção A.]
  - [NEEDS CLARIFICATION: Confirmar as duas decisões do analista: mesas como blocos pequenos
    na mesma escala, e "disponível" só com 1h livre e contínua na janela.]
  - [NEEDS CLARIFICATION: Aceitar o retrabalho de T04, T05 e T06 da Onda 1 e seu impacto no
    cronograma do protótipo.]
- **Revisit stage**: research (reforçar evidência de demanda e prior art); as confirmações do
  analista podem ser fechadas na própria conversa, sem nova etapa.

## Próximo passo sugerido

1. Fazer o sinal de usuário mínimo (item 1), de preferência sem custo de desenho: mostrar a imagem
   de referência e a lista da Onda 1 lado a lado e perguntar qual ajuda mais a escolher.
2. Confirmar os itens 3 a 5 na conversa.
3. Rodar `/speckit-assess-research slug=mapa-selecao-espacos` para anexar essas evidências, ou
   registrar uma decisão explícita de seguir, e então o veredito pode virar `go`.

## Handoff preliminar (para quando virar go)

- **Problem**: escolher um espaço sem noção de onde ele fica e quais estão livres no período.
- **Chosen approach**: Opção A, mapa completo, com ressalva do editor só em computador e tablet.
- **In scope**: mapa de 2 andares (cerca de 23 blocos cada, salas e mesas), cinza fora da data
  e janela, preço do próprio usuário no bloco, zoom e arrasto no celular, botão "Ver em lista",
  editor do Administrador (blocos com largura e comprimento, posição por arrasto), andar e
  posição na entidade Espaço.
- **Out of scope**: mudanças nas regras de reserva, preço, multa e pagamento; acesso físico;
  reservas múltiplas e recorrentes; térreo; planta real; editor no celular; entidade de zona.
- **Success metrics**: SC-001 (até 3 minutos), SC-007 (80% concluem reservar e cancelar com 5
  pessoas), SC-002 (nenhum espaço indisponível reservável), 100% das salas indisponíveis
  reconhecíveis sem só cor, seleção dos blocos pequenos no celular sem erro de toque.
- **Carried-forward open questions**: impacto em RN01, FR-003, FR-012 e entidade Espaço;
  paridade mapa e lista; refazer T04 a T06; FR próprio para o editor de layout.
