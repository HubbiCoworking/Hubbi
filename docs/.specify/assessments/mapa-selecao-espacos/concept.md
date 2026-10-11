# Concept: Mapa de seleção de salas e mesas por andar

- **Slug**: mapa-selecao-espacos
- **Created**: 2026-10-06
- **Recommended option**: A (mapa completo), com a ressalva de aparar o editor (ver Recommendation)

Contexto de tamanho: o entregável da v1 é **documento + protótipo navegável** (constituição), então
"appetite" mede esforço de **especificação e desenho**, não de código. Não há dados de velocidade
da equipe; os tamanhos abaixo são orçamentos de apostas, não estimativas. [ASSUMPTION]

## Options

### Option A — Mapa completo, como decidido

- **Sketch**: o mapa de cada andar (1º e 2º, cerca de 23 blocos cada, mesas e salas) é a forma
  principal de selecionar espaço em computador, tablet e celular. Cada bloco mostra nome,
  capacidade e o preço do próprio usuário; fica cinza quando não há disponibilidade na data e
  janela escolhidas. No celular, o mapa tem zoom e arrasto. Um botão "Ver em lista" oferece a
  lista alternativa, também para acessibilidade. O Administrador monta o layout de cada andar
  com blocos, informando largura e comprimento e arrastando para posicionar. Clicar em um bloco
  disponível leva ao detalhe do espaço com horários e ao resto do fluxo de reserva.
- **Appetite**: medium (semanas de desenho e especificação). Incerteza alta: depende do tamanho do
  editor e do comportamento do mapa no celular.
- **Trade-offs**:
  - Ganha: contexto espacial e visão de disponibilidade em um olhar; cada andar com formato próprio;
    atende todos os objetivos do problema.
  - Sacrifica: refaz T04, T05 e T06 já entregues em lista na Onda 1; cria telas novas (mapa,
    lista alternativa, editor de layout) em 3 tamanhos; aumenta a spec (novo módulo de layout
    com FR próprio, Princípio I).
  - Riscos: mapa no celular com blocos pequenos (alvo de 44 px); duas formas de seleção
    (mapa e lista) para manter coerentes; demanda de usuários não medida.
- **Rabbit holes**:
  - Editor de arrastar no celular e no tablet (arrasto e gesto de zoom competem). Risco de
    escopo: editor só em computador e tablet?
  - Zoom e arrasto no celular com 23 blocos, incluindo mesas pequenas.
  - Paridade entre mapa e lista (mesma disponibilidade, mesmo preço, mesmo resultado).
  - Cálculo de "disponível" dentro da janela escolhida com a regra de 1h mínima.
  - Mesas e salas na mesma escala e legibilidade dos rótulos.
  - Reabrir e refazer telas da Onda 1 e as Ondas 2 e 3 que dependem do espaço.

### Option B — Mapa leitura-primeiro, layout por campos (menor coisa que funciona)

- **Sketch**: o mapa por andar, com cinza, preço, zoom e arrasto no celular e botão "Ver em
  lista", igual a A para quem **reserva**. A diferença está no Administrador: em vez de arrastar
  blocos, ele informa para cada espaço o andar, largura, comprimento e posição em campos
  numéricos (ou escolhe a posição em uma grade), e o mapa se monta a partir disso. Sem editor
  visual.
- **Appetite**: small a medium (menos que A, porque não há editor de arrastar).
- **Trade-offs**:
  - Ganha: reduz o maior risco de A (editor); o cliente tem a mesma experiência de mapa.
  - Sacrifica: contraria a decisão do solicitante de posicionar **arrastando**; montar o andar
    por números é lento e menos intuitivo para o administrador.
  - Riscos: o administrador pode ver o resultado só depois de salvar; precisaria de uma
    pré-visualização.
- **Rabbit holes**: validar sobreposição de blocos por coordenadas; pré-visualização do mapa na
  tela de cadastro; mesmo esforço de mapa, zoom e lista que em A.

### Option C — Manter a lista e enriquecer com andar (não construir o mapa)

- **Sketch**: continuar com a lista de espaços (T04 a T06 como estão), acrescentando filtro por
  andar e mostrando o andar em cada cartão. Sem mapa, sem editor.
- **Appetite**: small (quase nenhum retrabalho).
- **Trade-offs**:
  - Ganha: aproveita o que a Onda 1 já entregou; sem risco no celular; acessibilidade já resolvida.
  - Sacrifica: não resolve o problema de contexto espacial nem a visão geral de disponibilidade;
    não atende ao pedido do solicitante.
  - Riscos: o pedido de mapa volta depois, quando houver mais espaços.
- **Rabbit holes**: nenhum relevante.

## Recommendation

**Opção A**, porque é a única que cumpre as metas do problema e a decisão do solicitante
(contexto espacial no mapa, preço por tipo de plano, acessibilidade por lista, layout montado
arrastando). Duas ressalvas para o `decide`:

1. **Aparar o editor.** O maior risco de A é o editor de arrastar. Sugestão de limite de escopo:
   o editor existe em **computador e tablet** e não no celular (o Administrador edita layout em
   tela maior); o celular só consome o mapa. Se o solicitante não aceitar, a Opção B é o recuo
   seguro.
2. **Provar a hipótese cedo.** A evidência de demanda é baixa (um único pedido; `research.md`).
   Antes de refazer todas as telas, validar o mapa com o teste de usabilidade da SC-007 (pelo menos
   5 pessoas), comparando mapa e lista na tarefa de reservar.

Não recomendo a Opção C porque contradiz a decisão já tomada, mas ela é a escolha mais barata se
o `decide` concluir que o benefício não justifica o retrabalho da Onda 1.

## Out of Scope (for the recommended option)

- Mudar regras de reserva, preço, multa, estorno e pagamento (RN02, RN03, RN06, RN07, RN11–RN13).
- Controle de acesso físico, ocupação em tempo real e navegação dentro do prédio.
- Reservar vários espaços de uma vez e reservas recorrentes (fora da v1).
- Térreo e qualquer andar além do 1º e do 2º.
- Planta real do prédio ou importação de plantas; o layout é livre.
- Editor de layout no celular (se a ressalva 1 for aceita).
- Entidade de "zona" ou grupo de mesas (mesas são blocos pequenos posicionados juntos).
- Tema escuro e novas cores além das já definidas no design system.

## Assumptions to Validate

- O mapa melhora a tarefa de escolher espaço em relação à lista (hipótese não medida; validar
  com o teste de 5 pessoas, SC-007).
- Cerca de 23 blocos por andar cabem no celular com zoom e arrasto e blocos tocáveis de 44 px,
  inclusive as mesas pequenas.
- O botão "Ver em lista" atende a acessibilidade de teclado e leitor de tela com o mesmo
  resultado do mapa.
- Mesas de capacidade 1 na mesma escala das salas continuam legíveis. [decisão do analista]
- Um espaço só aparece disponível com pelo menos 1h livre e contínua dentro da janela escolhida
  (RN05). [decisão do analista]
- O Administrador aceita editar o layout só em computador e tablet.
- O preço mostrado no bloco é o do próprio usuário (com desconto para membro; cheio para os
  demais), conforme RN02 e RN13.
- A constituição aceita o mapa e o editor dentro do Princípio I; o editor precisa de FR próprio.
- O impacto em RN01, FR-003, FR-012, F02, F07 e na entidade Espaço (andar e posição) é tratado na
  spec 001, e T04 a T06 da Onda 1 são refeitas.
