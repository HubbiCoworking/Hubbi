# Idea Research: Mapa de seleção de salas e mesas por andar

- **Slug**: mapa-selecao-espacos
- **Created**: 2026-10-06
- **Evidence confidence (overall)**: medium para o impacto interno (citado nos documentos do
  projeto); low para prior art e demanda de usuários (sem fonte externa consultada)

Método: leitura dos documentos do projeto (spec 001, fluxos, constituição, briefing de design,
intake). **Nenhuma URL foi buscada.** Os concorrentes não estão na lista de hosts confiáveis da
política de URLs e a busca exigiria confirmação por host. Tudo que vem de conhecimento geral
está marcado `ASSUMPTION`.

## Users & Demand

- Há **um único pedido**, do responsável pelo projeto, motivado por uma imagem de referência
  (mapa do 2º andar). Não há tickets, entrevistas nem dados de uso. — [source: intake.md]
  (confidence: low)
- A spec 001 é um protótipo acadêmico (disciplina de Engenharia de Software, Fatec Zona Sul);
  não há usuários reais medidos. — [source: constitution.md, Core Principles] (confidence: high)
- A spec trata escolha de espaço como **busca com filtros** (data, horário, duração, tipo) e lista
  de espaços livres; o objetivo medido é reservar em até 3 minutos. — [source: spec.md F02,
  SC-001] (confidence: high)
- O pedido original diz que o mapa é **a seleção principal**, com seletor de andar e layout
  próprio por andar; sala sem horário livre fica cinza. — [source: intake.md, decisões do
  solicitante] (confidence: high)

## Prior Art

- **Internamente**, não há mapa nem posição de espaço: a entidade Espaço guarda tipo,
  capacidade, preço/hora, horário e situação, e o design usa "andar ou local" como texto livre
  ("3º andar"). — [source: spec.md, Key Entities; data-model.md] (confidence: high)
- **Internamente**, o design system já tem seletor de horário em blocos de 30 min, cartão de
  espaço com estados (lista, grade, selecionado, indisponível) e o motivo do estado indisponível
  em texto. — [source: design-system.md seção 5 e 6] (confidence: high)
- **Internamente**, a Onda 1 do Claude Design já entregou T04 (busca em lista), T05 (detalhe com
  grade de horários) e T06 (busca no Painel), todas no padrão de lista. — [source: relatório do
  chat de design, colado nesta sessão] (confidence: medium, relatório de terceiro)
- **Externamente**, produtos de reserva de mesa e sala costumam oferecer planta do andar com
  cores de disponibilidade e lista como alternativa. — [ASSUMPTION: conhecimento geral, sem
  fonte consultada] (confidence: low)

## Market & Context

- Hoje o usuário seleciona o espaço pela lista com filtros; funciona e já está especificada e
  prototipada. O custo de **não** fazer o mapa é menor clareza espacial para quem conhece o
  prédio, não um bloqueio de reserva. — [source: spec.md F02; análise a partir da spec]
  (confidence: medium)
- O exemplo de dados do protótipo tem poucos espaços (Sala Aurora, Mesa 12, Estação Norte); a
  imagem de referência mostra cerca de 23 blocos em um andar. O ganho do mapa cresce com o
  número de espaços por andar. — [source: data-model.md seção 5; imagem 3.png] (confidence:
  medium)

## Data & Constraints

- **Escopo (Constituição, Princípio I):** o sistema trata gestão de reservas de salas e espaços.
  O mapa é uma forma de seleção, então cabe, mas todo módulo precisa de ao menos um FR; o
  editor de layout do administrador seria um módulo novo e precisaria de FR. — [source:
  constitution.md] (confidence: high)
- **Requisitos afetados:** RN01 (espaço reservável), FR-003 (consulta de disponibilidade), FR-012
  (cadastro de espaços), F02 (T04–T06), F07 (T23–T25) e a entidade Espaço (andar e posição). —
  [source: spec.md] (confidence: high)
- **Inventário:** a v1 tem 45 telas em 3 tamanhos; o mapa adicionaria pelo menos a tela de mapa
  (portal e painel) e o editor de layout, e refaria T04, T05 e T06. — [source:
  screen-inventory.md; análise] (confidence: medium)
- **Responsividade (FR-021, SC-009):** exige os fluxos nos 3 tamanhos, com alvos de toque de 44 px;
  o mapa de 1440 px não cabe em 390 px sem estratégia própria. — [source: spec.md FR-021;
  design-system.md seção 4] (confidence: high)
- **Acessibilidade:** a regra do projeto é nunca comunicar estado só por cor; sala cinza precisa
  de rótulo e motivo em texto. — [source: research.md R2, design-system.md seção 7] (confidence:
  high)
- **Disponibilidade:** a imagem mostra "Hoje: 14:00 - 18:00" como janela do mapa; a spec filtra
  por data, horário e duração, e a RN03 impede sobreposição. Um bloco "livre" depende da
  duração mínima de 1h dentro da janela. — [source: imagem 3.png; spec.md RN03, RN05]
  (confidence: medium)
- **Preço e desconto:** a imagem não mostra preço; a regra do preço (RN02, RN13) exige mostrar
  cheio e com desconto antes de confirmar. A decisão do solicitante manda mostrar horários e
  preço **depois** de clicar na sala. — [source: intake.md; spec.md RN02] (confidence: high)
- **Mesas hot-desk** são espaços de capacidade 1 (Assumptions); no mapa viram blocos pequenos e
  numerosos. — [source: spec.md, Assumptions] (confidence: high)
- **Dados novos:** andar (número ou nome) e posição e tamanho do bloco por espaço, versionados
  por andar; layout editado depois não pode alterar reservas já feitas (RN06, RN09). —
  [ASSUMPTION: derivado das regras de histórico imutável] (confidence: low)

## Evidence Against the Idea

- **Custo maior que o benefício para a v1:** a seleção por lista já cobre todos os cenários da
  spec e o protótipo da Onda 1 já está feito; o mapa refaz T04–T06 e cria um editor. — [source:
  spec.md F02; relatório da Onda 1]
- **Escopo cresce com um módulo novo:** o editor de layout exige FR próprio (Princípio I) e
  trabalho de desenho no painel, sem ligação com as histórias P1 (US1 e US2). — [source:
  constitution.md; spec.md]
- **Celular é o ponto fraco:** um mapa de planta é difícil em 390 px (zoom, arrasto, alvos de
  44 px em blocos pequenos); o próprio solicitante não sabe como ficaria. — [source: intake.md;
  design-system.md]
- **Dependência só de cor para disponibilidade** contraria a regra de acessibilidade se o cinza
  não vier com texto ou ícone. — [source: research.md R2]
- **Mapa como única porta de entrada** pode piorar a tarefa de quem quer apenas "uma sala livre
  das 14h às 16h", onde filtro e lista são mais rápidos (SC-001, meta de 3 minutos). —
  [ASSUMPTION: hipótese de usabilidade, não medida] (confidence: low)
- **Dados do protótipo são poucos** (3 espaços de exemplo); sem andares e muitos espaços, o
  mapa mostra pouco. — [source: data-model.md seção 5]
- **Sem evidência de demanda:** um único pedido, sem teste com usuários. — [source: intake.md]

## Gaps & Open Questions

- [NEEDS CLARIFICATION: Como o mapa funciona no celular? Sem fonte consultada para padrões
  comparáveis; avaliar mapa com zoom e arrasto, lista por andar, ou ambos.]
- [NEEDS CLARIFICATION: A lista (T04) permanece como alternativa? A resposta muda acessibilidade,
  celular e esforço.]
- [NEEDS CLARIFICATION: Editor de layout do administrador: editor livre ou grade fixa de blocos?]
- [NEEDS CLARIFICATION: Quantos andares e espaços por andar a v1 deve suportar?]
- [NEEDS CLARIFICATION: Quais filtros o mapa tem (data, janela de horário, tipo, capacidade) e
  como "livre" é calculado com duração mínima?]
- [NEEDS CLARIFICATION: Mesas hot-desk entram no mapa e como se agrupam?]
- [NEEDS CLARIFICATION: Existe planta real do prédio (do cliente fictício) ou o layout é livre?]
- [NEEDS CLARIFICATION: Validar com 5 pessoas (SC-007) se o mapa melhora ou piora a tarefa de
  reservar, comparando com a lista.]
- Evidência externa (concorrentes, padrões de mapa no celular) **não foi coletada**; se for
  decisiva, rodar nova pesquisa com hosts confirmados.

## Sources

- Documentos internos: `specs/001-fluxos-reservas-hubbi/spec.md`, `fluxos.md`,
  `contracts/design-system.md`, `contracts/screen-inventory.md`, `data-model.md`,
  `research.md` (do plano), `.specify/memory/constitution.md`,
  `.specify/assessments/mapa-selecao-espacos/intake.md`.
- Imagem de referência (mapa do 2º andar) anexada pelo solicitante.
- Relatório do Claude Design sobre a Onda 1, colado nesta sessão (terceiro).
- Nenhuma URL externa consultada (política: nenhum fetch realizado).
