# Feature Specification: Fluxos e Funcionamento do Hubbi (Gestão de Reservas de Espaços)

**Feature Branch**: `001-fluxos-reservas-hubbi` (sem branch git; pasta de spec apenas)

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Especificação dos fluxos e do funcionamento da aplicação Hubbi (sistema de gerenciamento de salas/espaços para coworking), para servir de base ao protótipo no Figma/FigJam: fluxos de usuário (equipe e membro/avulso com portal próprio), reservas com ciclo de vida, duração e horário de funcionamento, cancelamento com multa/estorno, preço por espaço/hora com desconto por plano, pagamentos manuais, cadastros, disponibilidade, relatórios, notificações, perfis e permissões."

> **Natureza deste documento**: esta spec descreve **como a aplicação funciona** (fluxos, estados e
> regras) e não uma funcionalidade isolada. Ela é a fonte para o protótipo no Figma e os fluxos no
> FigJam. Os códigos RN, FR e fluxos (F01…) são estáveis e devem ser citados pelo protótipo
> (Constituição, princípio V).

## Clarifications

### Session 2026-10-06

- Q: Membro cancela reserva confirmada sem pagamento dentro da faixa de multa: a multa é cobrada? → A: Sim. Gera cobrança de multa *pendente* (50% ou 100%) e cancela a cobrança original da reserva; a equipe registra o pagamento da multa depois.
- Q: Pagamento parcial menor que a multa no cancelamento: o que acontece com a diferença? → A: O valor pago é retido como multa e o saldo vira cobrança de multa *pendente*; estorno = 0.
- Q: Qual a antecedência mínima de reserva e o que ocorre com avulso reservando com menos de 1h de antecedência? → A: Mínimo de 1h para o cliente no portal; a recepção pode reservar com menos e registrar o pagamento na hora, e a reserva já nasce *confirmada*.
- Q: Membro com cobrança vencida não paga pode reservar? → A: Pode, mas a nova reserva é tratada como avulso: nasce *pendente* e **sem** desconto do plano (preço cheio) enquanto houver cobrança vencida.
- Q: Plano cancelado, trocado ou encerrado no meio da vigência tem devolução do valor pago? → A: Não. O plano vale até o vencimento já pago; cancelar só impede a renovação e trocar passa a valer no próximo vencimento.
- Q: O cliente contrata e troca o próprio plano pelo portal ou só a recepção? → A: O cliente *solicita* contratação, troca e cancelamento no portal (gera assinatura e cobrança pendentes); a equipe efetiva ao registrar o pagamento.
- Q: O cadastro do cliente exige documento? → A: Sim. Documento obrigatório já no cadastro do portal; unicidade por e-mail e por documento.
- Q: Qual o preço do plano e como é cobrado? → A: Preço fixo e duração em dias (ex.: mensal = 30 dias), definidos pelo administrador; a cobrança é gerada na contratação e a cada renovação solicitada.
- Q: Política de dados pessoais quando o cliente pede exclusão da conta? → A: Anonimização dos dados pessoais (nome, e-mail, documento, telefone), mantendo reservas e pagamentos ligados a um cadastro anônimo; só a equipe executa, com registro de quem fez.
- Q: Metas de desempenho e dispositivos? → A: Adotar a meta da constituição: operações comuns em até 2 s em condições normais; protótipo cobre computador, tablet e celular em todos os fluxos F01–F12.

## Atores

- **Visitante**: pessoa sem login. Pode se cadastrar e ver espaços e preços cheios.
- **Cliente avulso**: cadastrado, sem plano ativo. Reserva pagando o valor cheio.
- **Membro**: cadastrado, com plano ativo. Reserva com desconto do plano.
- **Recepção**: equipe que opera o dia a dia (cadastros, reservas em nome de clientes, pagamentos).
- **Administrador**: equipe com acesso total (espaços, preços, planos, relatórios, usuários da equipe).

> Avulso e Membro são o mesmo perfil de portal (Cliente). A diferença é só ter ou não plano ativo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cliente reserva um espaço (Priority: P1)

O cliente (avulso ou membro) consulta a disponibilidade de um espaço, escolhe data e horário,
vê o preço calculado e finaliza a reserva pelo portal.

**Why this priority**: é o coração do Hubbi. Sem reserva sem conflito e com preço correto, o
sistema não entrega valor.

**Independent Test**: com um espaço ativo e preço cadastrados, um cliente consegue reservar um
horário livre e ver o valor correto; o mesmo horário deixa de aparecer como livre.

**Acceptance Scenarios**:

1. **Given** um espaço ativo com horário livre, **When** o cliente escolhe data, início e duração
   válidos, **Then** o sistema mostra o preço (cheio para avulso, com desconto para membro) antes
   de confirmar e cria a reserva (RN01, RN02, RN06).
2. **Given** um horário já ocupado por reserva ativa, **When** o cliente tenta reservá-lo,
   **Then** o sistema impede e sugere horários livres do mesmo espaço (RN03).
3. **Given** uma duração menor que a mínima, maior que a máxima ou fora do horário de
   funcionamento, **When** o cliente tenta reservar, **Then** o sistema recusa com mensagem clara
   dizendo qual limite foi violado (RN04, RN05).
4. **Given** um cliente avulso, **When** a reserva é criada, **Then** ela fica *pendente* até a
   equipe registrar o pagamento (RN12).
5. **Given** um membro com plano ativo, **When** a reserva é criada, **Then** ela fica
   *confirmada* na hora e uma cobrança pendente é gerada (RN13).

---

### User Story 2 - Equipe gerencia reservas e registra pagamentos (Priority: P1)

A recepção reserva em nome de um cliente, registra o pagamento, marca presença ou no-show e
conclui reservas.

**Why this priority**: sem a equipe confirmando pagamentos e fechando reservas, o ciclo de vida
não anda e o histórico fica incorreto.

**Independent Test**: a recepção cria uma reserva avulsa, registra o pagamento, a reserva vira
*confirmada*; depois do horário marca como *concluída*.

**Acceptance Scenarios**:

1. **Given** uma reserva *pendente* de cliente avulso, **When** a recepção registra o pagamento
   total, **Then** o pagamento fica *realizado* e a reserva passa a *confirmada* (RN12).
2. **Given** uma reserva *confirmada* cujo horário passou, **When** a recepção marca presença,
   **Then** a reserva fica *concluída*; se marca ausência, fica *no-show* (RN08, RN10).
3. **Given** uma reserva *pendente* sem pagamento após o prazo de expiração, **When** o prazo
   vence, **Then** a reserva é cancelada automaticamente e o horário volta a ficar livre (RN12).
4. **Given** qualquer reserva, **When** ela muda de estado, **Then** a mudança fica registrada no
   histórico com data, hora e quem fez (RN09).

---

### User Story 3 - Cliente cancela uma reserva (Priority: P2)

O cliente cancela uma reserva respeitando o prazo de cancelamento. O sistema mostra a multa ou o
estorno **antes** de ele confirmar.

**Why this priority**: o cancelamento afeta dinheiro e liberação de horários, mas só ocorre
depois que as reservas existem.

**Independent Test**: cancelar reservas em três faixas de prazo e conferir multa e estorno
mostrados.

**Acceptance Scenarios**:

1. **Given** uma reserva confirmada com início bem distante, **When** o cliente cancela dentro do
   prazo gratuito, **Then** não há multa, o valor é estornado integralmente e o horário é liberado
   (RN07, RN11).
2. **Given** um cancelamento fora do prazo gratuito, **When** o cliente confirma, **Then** o
   sistema mostra e aplica a multa conforme a faixa e estorna o restante (RN07).
3. **Given** uma reserva já concluída, cancelada ou no-show, **When** o cliente tenta cancelá-la,
   **Then** o sistema não permite (RN08).

---

### User Story 4 - Cadastro e acesso do cliente (Priority: P2)

O visitante cria sua conta e passa a ser cliente avulso; pode contratar um plano para virar membro.
A recepção também pode cadastrar e editar clientes.

**Why this priority**: sem cadastro não há reserva; porém um cadastro mínimo já permite os fluxos
P1.

**Independent Test**: um visitante cria conta, entra no portal, vê só as próprias reservas e dados.

**Acceptance Scenarios**:

1. **Given** um visitante, **When** envia nome, e-mail, documento, telefone e senha válidos, **Then** cria o
   cadastro único como cliente avulso (RN14).
2. **Given** um e-mail ou documento já cadastrado, **When** o visitante tenta se registrar, **Then** o sistema
   recusa e orienta a entrar ou recuperar a senha (RN14).
3. **Given** um cliente logado, **When** acessa o portal, **Then** vê apenas os próprios dados,
   reservas e pagamentos (RN17).
4. **Given** um cliente com histórico, **When** a equipe "exclui" o cadastro, **Then** ele é
   inativado e o histórico permanece (RN09, RN15).

---

### User Story 5 - Administração de planos, espaços e preços (Priority: P2)

O administrador cadastra espaços (salas, mesas, estações), define preço por hora, horário de
funcionamento, limites de duração e planos com desconto percentual.

**Why this priority**: alimenta todos os outros fluxos, mas pode começar com poucos dados fixos.

**Independent Test**: criar um espaço, um preço e um plano, e conferir o preço calculado para
avulso e membro.

**Acceptance Scenarios**:

1. **Given** o administrador, **When** cadastra um espaço com tipo, capacidade e preço/hora,
   **Then** o espaço fica disponível para reserva (RN01).
2. **Given** um plano com desconto de 20%, **When** um membro reserva, **Then** o preço = preço
   cheio × (1 − 20%) (RN02).
3. **Given** uma mudança de preço ou desconto, **When** ela é salva, **Then** reservas já criadas
   mantêm o valor original gravado (RN06).
4. **Given** um espaço com reservas futuras, **When** o administrador tenta inativá-lo, **Then** o
   sistema avisa e exige tratar essas reservas antes (RN15).

---

### User Story 6 - Contratar, trocar e encerrar plano (Priority: P3)

Cliente contrata um plano (vira membro), a equipe registra o pagamento do plano, e o plano pode
vencer, ser trocado ou cancelado.

**Why this priority**: gera receita recorrente, mas o sistema funciona antes com todos como avulsos.

**Independent Test**: contratar plano, registrar o pagamento e ver o desconto aplicado na próxima
reserva; deixar vencer e ver o preço voltar ao cheio.

**Acceptance Scenarios**:

1. **Given** um cliente avulso, **When** contrata um plano e a equipe registra o pagamento,
   **Then** o plano fica ativo e passa a dar desconto nas novas reservas (RN13).
2. **Given** um plano vencido, **When** o cliente reserva, **Then** ele é tratado como avulso
   (RN13).
3. **Given** um plano que vence, **When** faltam poucos dias, **Then** o cliente recebe aviso
   (RN16).

---

### User Story 7 - Notificações e relatórios (Priority: P3)

O cliente recebe avisos sobre suas reservas e pagamentos. A equipe consulta relatórios de
reservas, clientes e pagamentos.

**Why this priority**: melhora a operação e a gestão, mas não bloqueia o ciclo principal.

**Independent Test**: criar, cancelar e pagar reservas e conferir avisos e relatórios.

**Acceptance Scenarios**:

1. **Given** uma reserva criada, confirmada, cancelada ou prestes a começar, **When** o evento
   ocorre, **Then** o cliente é avisado (RN16).
2. **Given** um período escolhido, **When** a equipe gera um relatório, **Then** vê reservas por
   estado, receita por pagamentos realizados, multas, ocupação por espaço e clientes por tipo
   (RN18).

---

### User Story 8 - Impacto social (Priority: P3)

O Hubbi oferece um **Plano Social** a quem tem menos acesso a espaço de trabalho (estudantes,
microempreendedores, organizações sem fins lucrativos) e mostra à gestão um **relatório de
impacto** calculado dos dados que o sistema já registra. Alinha o produto aos ODS 8, 10, 11 e 12
(ver [escopo-impacto-social-ods.md](escopo-impacto-social-ods.md)).

**Why this priority**: não bloqueia o ciclo de reservas, mas é o diferencial social do projeto e
reaproveita mecânicas já existentes (plano com desconto e relatórios).

**Independent Test**: contratar um plano social como estudante, ter a elegibilidade validada pela
equipe, ver o desconto na reserva e conferir os indicadores no relatório de impacto.

**Acceptance Scenarios**:

1. **Given** um plano marcado como social, **When** um cliente o solicita, **Then** a assinatura
   fica *solicitada* e a equipe só a efetiva depois de validar a elegibilidade e registrar o
   pagamento (RN19, RN13).
2. **Given** um membro de plano social, **When** reserva, **Then** o desconto do plano segue a
   mesma fórmula de preço dos demais planos (RN02, RN19).
3. **Given** um período escolhido, **When** a gestão abre o relatório de impacto, **Then** vê os
   indicadores da RN21, todos calculados de dados registrados.

---

### User Story 9 - Encontrar o espaço certo para a necessidade (Priority: P2)

Cada espaço descreve suas características (lugares, tomadas, internet, computadores, ambiente,
equipamentos, acessibilidade). O cliente e a recepção filtram a busca pelo que a equipe precisa:
uma equipe de marketing procura quadro branco, TV e luz natural; uma de desenvolvimento procura
muitas tomadas e internet rápida.

**Why this priority**: sem filtros, o cliente abre espaço por espaço para descobrir se serve. É
parte da busca (F02) e melhora a conversão em reserva.

**Independent Test**: com três espaços de características diferentes, aplicar filtros e ver só os
que atendem a todos os critérios, junto com a disponibilidade do horário.

**Acceptance Scenarios**:

1. **Given** espaços com características cadastradas, **When** o cliente escolhe mínimos
   (lugares, tomadas, internet, computadores) e itens (ex.: quadro branco, ventilação natural,
   acesso sem degraus), **Then** a busca mostra só os espaços que atendem a **todos** os
   critérios e estão livres no horário (RN20, RN03).
2. **Given** um atalho de necessidade (ex.: "Desenvolvimento"), **When** o cliente o escolhe,
   **Then** os filtros correspondentes são preenchidos e podem ser ajustados (RN20).
3. **Given** filtros que não retornam nenhum espaço, **When** a busca termina, **Then** o sistema
   diz qual critério mais restringiu e sugere relaxá-lo (RN20).
4. **Given** um espaço, **When** o cliente abre o detalhe, **Then** vê todas as características
   cadastradas, e a internet aparece como velocidade **contratada**, não medida (RN20).

---

### User Story 10 - Hubbi Verde: pontos por uso responsável (Priority: P3)

O cliente acumula **pontos verdes** ao usar o espaço de forma responsável (comparecer às reservas,
manter sequência sem no-show e chegar por meio de baixo impacto) e troca os pontos por abatimento
em reservas futuras. Alinha o produto aos ODS 11 e 12.

**Why this priority**: diferencial de sustentabilidade, sem bloquear o ciclo principal. Os pontos
vêm de eventos que o sistema já registra, o que os torna verificáveis.

**Independent Test**: concluir reservas, ver os pontos no extrato, resgatar um abatimento numa
nova reserva e conferir o valor final congelado.

**Acceptance Scenarios**:

1. **Given** uma reserva *confirmada*, **When** a equipe a marca como *concluída*, **Then** o
   cliente ganha os pontos da RN22 e o extrato registra o lançamento (RN22, RN10, RN09).
2. **Given** uma reserva *no-show*, **When** a equipe a marca, **Then** não há pontos e a
   sequência de bônus reinicia (RN22).
3. **Given** o cliente informou o meio de chegada ao reservar e a recepção o confirma ao
   concluir, **When** o meio é de baixo impacto, **Then** ganha o bônus de chegada limpa, no
   máximo uma vez por dia (RN23).
4. **Given** pontos suficientes, **When** o cliente resgata na criação de uma reserva, **Then**
   o abatimento aparece no resumo antes de confirmar e fica gravado na reserva (RN22, RN06).
5. **Given** uma reserva com abatimento verde cancelada sem multa ou expirada, **When** ela é
   encerrada, **Then** os pontos usados voltam; com multa, não voltam (RN22).

---

### Edge Cases

- Duas pessoas tentam reservar o mesmo horário quase ao mesmo tempo: só uma reserva é criada; a
  outra recebe aviso de conflito (RN03).
- Reserva que cruza o fim do horário de funcionamento ou a virada de dia: recusada (RN04).
- Cliente ganha ou perde plano entre criar a reserva e o uso: o preço da reserva não muda (RN06).
- Cancelamento de reserva ainda *pendente* sem pagamento: sem multa e sem estorno (RN07).
- Estorno de reserva cujo pagamento ainda não foi registrado: não há estorno a fazer; se houver
  multa, ela vira cobrança pendente (RN07).
- Cliente inativado com reservas futuras: reservas futuras são tratadas antes da inativação (RN15).
- Espaço inativado: some da busca, mas continua nos históricos e relatórios (RN15).
- Registro de pagamento em valor diferente do devido: recusado ou marcado como parcial com
  justificativa (RN12).
- Tentativa de acessar dados de outro cliente: negada (RN17).
- Marcar no-show antes do horário de término: não permitido (RN10).
- Cliente de plano social perde a elegibilidade (ex.: deixa de ser estudante): o plano segue até o
  vencimento já pago e não é renovado sem nova validação (RN19, RN13).
- Solicitação de plano social sem elegibilidade comprovada: a equipe recusa a efetivação com
  motivo; a assinatura não vira *ativa* e o cliente segue avulso (RN19).
- Período sem reservas no relatório de impacto: indicadores mostram zero, nunca erro (RN21).
- Espaço sem característica cadastrada: aparece no detalhe como "não informado" e **não** passa
  em filtro que exija essa característica (RN20).
- Cliente reserva e cancela repetidamente: cancelar não gera pontos, então não há como acumulá-los
  assim (RN22).
- Pontos vencidos ou conta anonimizada: os pontos são zerados e o extrato registra o motivo (RN22,
  RN15).
- Meio de chegada informado e não confirmado pela recepção: não gera bônus (RN23).

## Requirements *(mandatory)*

### Fluxos que o protótipo MUST cobrir (FigJam/Figma)

| Código | Fluxo | Ator(es) | Histórias |
|--------|-------|----------|-----------|
| F01 | Cadastro e login | Visitante, Cliente | US4 |
| F02 | Consultar disponibilidade e preço | Cliente, Recepção | US1 |
| F03 | Criar reserva (caminho feliz + erros de conflito, duração e horário) | Cliente, Recepção | US1 |
| F04 | Pagar e confirmar reserva (registro manual) | Recepção | US2 |
| F05 | Cancelar reserva (com simulação de multa/estorno) | Cliente, Recepção | US3 |
| F06 | Encerrar reserva (concluir ou no-show) | Recepção | US2 |
| F07 | Gerir espaços, preços e horários | Administrador | US5 |
| F08 | Gerir planos e contratar/trocar/encerrar plano | Administrador, Recepção, Cliente | US5, US6 |
| F09 | Gerir clientes (cadastrar, editar, inativar, consultar) | Recepção | US4 |
| F10 | Notificações recebidas | Cliente | US7 |
| F11 | Relatórios | Recepção, Administrador | US7 |
| F12 | Gerir usuários da equipe e permissões | Administrador | US7 |

### Regras de Negócio

- **RN01 — Espaço reservável**: só espaços ativos, com preço/hora e horário definidos, podem ser
  reservados.
- **RN02 — Preço da reserva**: preço = preço/hora do espaço × duração em horas × (1 − desconto do
  plano ativo do cliente). Cliente avulso (sem plano ativo) tem desconto 0%.
- **RN03 — Sem sobreposição**: um espaço não pode ter duas reservas ativas (pendente ou
  confirmada) em períodos que se sobreponham. Término de uma e início de outra no mesmo instante
  não é sobreposição.
- **RN04 — Horário de funcionamento**: a reserva inteira (início e fim) deve estar dentro do
  horário de funcionamento do dia, no mesmo dia.
- **RN05 — Duração**: a duração deve respeitar o mínimo e o máximo definidos e ser múltipla do
  passo de agendamento.
- **RN06 — Valor congelado**: valor cheio, desconto aplicado, plano vigente, abatimento verde (RN22) e
  valor final são gravados na reserva ao criá-la e não mudam depois.
- **RN07 — Política de cancelamento**: cancelar ≥ 24h antes do início: sem multa. Entre 24h e 2h
  antes: multa de 50% do valor. Menos de 2h antes: multa de 100%. O valor da multa é calculado e
  mostrado antes de o cliente confirmar. Cancelamento de reserva pendente sem pagamento: sem multa.
  Reserva *confirmada* ainda sem pagamento (caso do membro, RN13) segue a mesma tabela de multa:
  a cobrança original da reserva é cancelada e gera-se uma cobrança de multa *pendente* (50% ou
  100% do valor), que a equipe registra depois. Sem multa na faixa gratuita, apenas cancela a
  cobrança original. Se o valor já pago (pagamento parcial) for menor que a multa, o pago é
  retido como multa, o saldo vira cobrança de multa *pendente* e o estorno é 0.
- **RN08 — Ciclo de vida**: estados *pendente*, *confirmada*, *concluída*, *cancelada*, *no-show*.
  Transições permitidas apenas: pendente→confirmada, pendente→cancelada, confirmada→cancelada,
  confirmada→concluída, confirmada→no-show. *Concluída*, *cancelada* e *no-show* são finais.
- **RN09 — Histórico imutável**: reservas e mudanças de estado nunca são apagadas; cada mudança
  registra data/hora e responsável.
- **RN10 — Encerramento**: *concluída* e *no-show* só podem ser marcadas pela equipe, depois do
  término da reserva.
- **RN11 — Estorno**: o valor pago menos a multa é devolvido; o estorno é registrado pela equipe
  como pagamento *estornado*.
- **RN12 — Reserva avulsa e pagamento**: reserva de cliente avulso nasce *pendente* e vira
  *confirmada* quando a equipe registra o pagamento integral; se não houver pagamento em até 2h
  (ou até 1h antes do início, o que ocorrer primeiro), ela expira e vira *cancelada* sem multa.
  No portal, o cliente só reserva com no mínimo 1h de antecedência do início; a recepção pode
  reservar com menos que isso, registrando o pagamento integral no ato (a reserva já nasce
  *confirmada*).
  Todo pagamento tem situação: pendente, realizado ou estornado, e liga-se a um cliente e a uma
  reserva ou a um plano.
- **RN13 — Reserva de membro**: reserva de membro com plano ativo nasce *confirmada* e gera uma
  cobrança *pendente* para a equipe registrar depois. Plano vencido ou cancelado equivale a avulso.
  O mesmo vale para o membro com cobrança vencida (cobrança pendente de reserva já concluída ou
  *no-show*, ou multa pendente): enquanto ela existir, a nova reserva é tratada como avulso,
  nasce *pendente* e sem desconto do plano (RN02 com desconto 0%). Ao quitar, volta ao
  tratamento de membro nas reservas seguintes.
  Cancelar, trocar ou encerrar um plano não gera devolução do valor pago: o plano segue ativo
  até o vencimento já pago; cancelar apenas impede a renovação e a troca passa a valer no
  próximo vencimento.
- **RN14 — Cadastro único**: um cadastro por e-mail e por documento do cliente.
- **RN15 — Exclusão lógica**: clientes, espaços e planos com histórico são inativados, nunca
  apagados. Inativar um cliente ou espaço exige resolver antes as reservas futuras.
  A pedido do titular (LGPD), a equipe anonimiza os dados pessoais do cliente (nome, e-mail,
  documento, telefone): o cadastro vira anônimo e inativo, reservas e pagamentos permanecem
  ligados a ele, e a ação registra data, hora e responsável (RN09). Por inativar o cadastro, a
  anonimização também exige resolver antes as reservas futuras.
- **RN16 — Notificações**: o cliente é avisado ao criar, confirmar, cancelar (com multa/estorno),
  expirar uma reserva, antes do início (lembrete) e antes do vencimento do plano.
- **RN17 — Permissões**: cliente só vê e altera seus próprios dados. Recepção opera cadastros,
  reservas e pagamentos. Administrador faz tudo, incluindo espaços, preços, planos e equipe.
  Alterar ou excluir cadastros de clientes só por equipe autorizada. O cliente também solicita
  contratação, troca e cancelamento do próprio plano, e cancela as próprias reservas; a
  efetivação do plano é sempre da equipe.
- **RN18 — Relatórios**: usam apenas dados registrados; receita conta somente pagamentos
  *realizados*, menos estornos.
- **RN19 — Plano Social**: o administrador pode marcar um plano como *social*, com categorias de
  elegibilidade que ele define (padrão: estudante, microempreendedor, organização sem fins
  lucrativos). Preço e desconto seguem a RN02 sem exceção. Antes de efetivar a assinatura, a
  equipe valida a elegibilidade fora do sistema e registra apenas categoria, data e responsável
  (RN09); o sistema **não guarda documento comprobatório** (minimização, FR-019). A elegibilidade
  é revalidada a cada renovação; perdê-la não gera devolução (RN13). Um cliente continua com no
  máximo um plano ativo.
- **RN20 — Características do espaço e filtros**: o administrador cadastra, por espaço, as
  características abaixo; todas são opcionais e o que faltar aparece como "não informado".
  - *Números*: lugares (a capacidade do espaço), tomadas, computadores disponíveis (0 = o cliente
    leva o próprio equipamento) e internet em Mbps **contratados** (informativo; o sistema não
    mede conexão).
  - *Ambiente* (lista; padrão): ar-condicionado, ventilação natural, luz natural, ambiente
    silencioso.
  - *Equipamentos* (lista; padrão): quadro branco, TV ou tela, projetor, videoconferência,
    monitor extra, impressora, cabo de rede.
  - *Acessibilidade* (lista; padrão): acesso sem degraus, banheiro adaptado, piso tátil, vaga
    reservada, intérprete sob pedido.
  - *Práticas sustentáveis* (lista; padrão): iluminação LED, coleta seletiva, sem descartáveis,
    energia eficiente.

  A busca (F02) filtra por mínimo nos números e por itens das listas, combinando **todos** os
  critérios escolhidos (E) com a disponibilidade do horário (RN03). Espaço sem a característica
  exigida não aparece. A busca oferece *atalhos de necessidade* (padrão: "Reunião de equipe",
  "Foco individual", "Desenvolvimento", "Criativo e marketing"), que são combinações de filtros
  definidas pelo administrador e podem ser ajustadas pelo cliente. Sem resultados, o sistema
  indica o critério que mais restringiu. As características são informativas: não alteram preço,
  disponibilidade nem as demais regras.
- **RN21 — Indicadores de impacto**: o relatório de impacto, por período, usa apenas dados
  registrados (como na RN18) e mostra: (a) horas de espaço reservadas e concluídas; (b) ocupação
  por espaço; (c) capacidade perdida = horas de reservas expiradas, canceladas na faixa de multa
  ou *no-show* sobre as horas reservadas; (d) clientes ativos em plano social e as horas que
  reservaram; (e) desconto social concedido, somando (valor cheio − valor final) das reservas
  de membros de plano social, valores congelados da RN06; (f) espaços com acessibilidade e as
  reservas feitas neles; (g) horas liberadas por cancelamento sem multa (antecedência de 24h ou
  mais), pontos verdes concedidos e resgatados; (h) chegadas confirmadas por meio de transporte.
  A v1 não estima emissões, economia de recursos nem renda gerada.
- **RN22 — Pontos verdes**: o cliente ganha pontos por eventos que o sistema registra, todos com
  lançamento no extrato (data, tipo, reserva, RN09). Valores padrão, ajustáveis:
  - **+10** quando a reserva vira *concluída* (RN10);
  - **+20** de bônus a cada 5 reservas *concluídas* seguidas, sem *no-show* nem multa;
  - **+5** de chegada limpa (RN23).

  *No-show* não dá pontos e reinicia a sequência. **Cancelar não dá pontos**, para impedir
  acúmulo por reservar e cancelar. Resgate: **100 pontos** dão **10% de abatimento** sobre o valor
  já calculado pela RN02, em uma reserva por vez, escolhido na criação da reserva e mostrado no
  resumo antes de confirmar. O abatimento é gravado à parte na reserva (RN06) e **não altera a
  fórmula da RN02**. Reserva com abatimento cancelada sem multa ou expirada devolve os pontos;
  cancelada com multa, não. Pontos vencem em 12 meses. A anonimização do cliente zera os pontos
  (RN15). Pontos não têm valor em dinheiro, não são transferíveis nem estornáveis em dinheiro.
- **RN23 — Chegada limpa**: ao criar a reserva, o cliente pode informar como vai chegar (a pé,
  bicicleta, transporte público, carona ou veículo elétrico). Ao concluir a reserva, a recepção
  confirma o meio informado com o cliente; **só a confirmação gera o bônus** da RN22, no máximo
  uma vez por cliente por dia. O dado é de uso do relatório (RN21 h) e não rastreia localização.

### Functional Requirements

- **FR-001**: O sistema MUST permitir que visitantes criem conta como cliente avulso (RN14).
- **FR-002**: O sistema MUST autenticar clientes e equipe antes de qualquer acesso a dados
  pessoais (RN17).
- **FR-003**: O sistema MUST permitir consultar a disponibilidade de espaços por data, horário e
  tipo, mostrando preço calculado conforme o tipo do cliente (RN02, RN06).
- **FR-004**: O sistema MUST criar reservas validando conflito, horário de funcionamento e
  duração (RN03, RN04, RN05).
- **FR-005**: O sistema MUST gravar valor cheio, desconto e valor final na reserva (RN06).
- **FR-006**: O sistema MUST aplicar o ciclo de vida da reserva e recusar transições inválidas
  (RN08).
- **FR-007**: O sistema MUST permitir que cliente e equipe cancelem reservas, mostrando
  multa/estorno antes da confirmação (RN07, RN11).
- **FR-008**: O sistema MUST expirar automaticamente reservas pendentes sem pagamento (RN12).
- **FR-009**: A equipe MUST poder registrar pagamentos, parciais ou totais, e estornos, e
  consultar pagamentos pendentes e realizados (RN11, RN12).
- **FR-010**: A equipe MUST poder marcar reservas como concluídas ou no-show após o término
  (RN10).
- **FR-011**: O sistema MUST manter o histórico de reservas e de mudanças de estado (RN09).
- **FR-012**: O administrador MUST poder cadastrar espaços, preços/hora, horário de
  funcionamento e limites de duração (RN01, RN04, RN05).
- **FR-013**: O administrador MUST poder cadastrar planos com desconto percentual e a equipe
  MUST poder associar, trocar e encerrar o plano de um cliente (RN13). O cliente MUST poder
  solicitar contratação, troca e cancelamento do próprio plano no portal; a solicitação só
  produz efeito quando a equipe registra o pagamento ou a efetiva (RN13, RN17).
- **FR-014**: A equipe MUST poder cadastrar, editar, consultar e inativar clientes (RN15, RN17).
- **FR-015**: O sistema MUST enviar as notificações da RN16.
- **FR-016**: O sistema MUST gerar relatórios de reservas, clientes, pagamentos e ocupação por
  período (RN18).
- **FR-017**: O sistema MUST aplicar permissões por perfil: Cliente, Recepção, Administrador
  (RN17).
- **FR-018**: O sistema MUST mostrar mensagens de erro claras sem expor dados sensíveis.
- **FR-019**: O sistema MUST armazenar senhas apenas como hash e coletar só os dados pessoais
  necessários (LGPD), e MUST permitir à equipe anonimizar os dados de um cliente a pedido do
  titular (RN15).
- **FR-020**: Cada tela e fluxo do protótipo MUST citar os FR e RN que realiza e cobrir caminho
  feliz e principais erros.
- **FR-021** (não funcional): O sistema MUST responder às operações comuns em até 2 segundos em
  condições normais e a interface MUST ser responsiva para computador, tablet e celular; o
  protótipo MUST apresentar os fluxos F01–F12 nas três telas.
- **FR-022**: O administrador MUST poder marcar um plano como social e definir as categorias de
  elegibilidade; a equipe MUST registrar categoria, data e responsável ao efetivar a assinatura,
  sem armazenar documento comprobatório (RN19).
- **FR-023**: O administrador MUST poder cadastrar as características de cada espaço e os
  atalhos de necessidade; o cliente e a equipe MUST poder filtrar a busca por mínimos e itens,
  combinando todos os critérios, com mensagem quando nada atende (RN20).
- **FR-024**: A gestão MUST poder gerar o relatório de impacto do período com os indicadores da
  RN21 (RN21).
- **FR-025**: O sistema MUST lançar pontos verdes no extrato do cliente, permitir o resgate na
  criação da reserva com o abatimento visível antes de confirmar, e gravar o abatimento na
  reserva (RN22, RN06).
- **FR-026**: O cliente MUST poder informar o meio de chegada ao reservar e a equipe MUST poder
  confirmá-lo ao concluir a reserva (RN23).

### Key Entities

- **Cliente**: pessoa cadastrada (nome, e-mail, documento, telefone, estado ativo/inativo).
  Tem zero ou um plano ativo.
- **Plano**: oferta com nome, desconto percentual, preço fixo, duração em dias, indicação de
  plano social (com suas categorias de elegibilidade) e situação. A
  cobrança do plano é gerada na contratação e a cada renovação solicitada pelo cliente.
- **Assinatura**: ligação entre Cliente e Plano, com início, vencimento e situação.
- **Espaço**: sala, mesa ou estação com tipo, capacidade, preço/hora, horário de funcionamento,
  características (números, ambiente, equipamentos, acessibilidade, práticas sustentáveis) e
  estado ativo/inativo.
- **Reserva**: Cliente + Espaço + período, estado, valor cheio, desconto, abatimento verde,
  valor final, meio de chegada informado e confirmado.
- **Extrato de pontos verdes**: lançamentos do cliente (ganho, bônus, chegada limpa, resgate,
  devolução, vencimento, zeragem), com data, reserva ligada e saldo.
- **Histórico de Reserva**: cada mudança de estado, com data/hora e responsável.
- **Pagamento/Cobrança**: valor, situação (pendente, realizado, estornado), ligado a Cliente e a
  Reserva ou Assinatura; inclui multas e estornos.
- **Notificação**: aviso enviado ao cliente com tipo, conteúdo e data.
- **Usuário da Equipe**: Recepção ou Administrador, com permissões.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um cliente consegue reservar um espaço, do login ao resumo final, em até 3 minutos
  no protótipo.
- **SC-002**: 100% das tentativas de reserva sobrepostas, fora do horário ou com duração inválida
  são recusadas com mensagem que indica o motivo.
- **SC-003**: Em 100% dos casos de teste, o preço mostrado = preço/hora × duração × (1 − desconto)
  e o membro paga menos que o avulso para a mesma reserva.
- **SC-004**: Cada reserva só percorre transições permitidas; 100% das tentativas inválidas são
  recusadas.
- **SC-005**: O cliente vê a multa ou estorno antes de confirmar o cancelamento em 100% dos
  casos.
- **SC-006**: Todos os 12 fluxos (F01–F12) estão desenhados no FigJam e prototipados no Figma,
  cada um citando seus FR e RN.
- **SC-007**: Em teste de usabilidade com pelo menos 5 pessoas, 80% concluem reservar e cancelar
  sem ajuda.
- **SC-008**: Nenhum cliente consegue ver dados de outro cliente em qualquer fluxo do protótipo.
- **SC-009**: Em 100% das operações comuns, a resposta ocorre em até 2 segundos em condições
  normais, e os fluxos F01–F12 estão apresentados em computador, tablet e celular (FR-021).
- **SC-010**: Em 100% dos casos de teste, o relatório de impacto traz os oito indicadores da RN21
  do período e cada valor bate com as reservas e os pagamentos registrados; um espaço sem
  recurso de acessibilidade nunca aparece no filtro correspondente.
- **SC-011**: Em 100% dos casos de teste, a busca com filtros mostra apenas espaços que atendem a
  todos os critérios e estão livres no horário, e espaço com característica "não informada"
  nunca passa em filtro que a exija.
- **SC-012**: Em 100% dos casos de teste, o saldo de pontos = soma do extrato, o abatimento nunca
  passa de 10% do valor da RN02 e o valor final da reserva não muda depois de criada.

## Assumptions

- Esta é a **v1** e o entregável é documento + protótipo (Figma/FigJam); stack tecnológica fica
  para o plano.
- Os valores numéricos de regras são **padrões ajustáveis**: horário de funcionamento 07h–22h de
  segunda a sábado; passo de agendamento 30 min; duração mínima 1h e máxima 8h; prazos e multas
  da RN07; expiração de pendente da RN12. A equipe pode alterá-los sem mudar a estrutura das
  regras.
- Os descontos de plano são exemplos (ex.: 10%, 20%, 30%) e são definidos pelo administrador.
- Pagamento é sempre registrado manualmente pela equipe; não há gateway, cartão ou Pix
  integrado.
- Notificações são exibidas no portal e enviadas por e-mail; outros canais (SMS, WhatsApp) ficam
  fora da v1.
- Fora do escopo: controle de acesso físico, reservas recorrentes, eventos, comunidade/networking,
  e métricas do negócio físico (NPS, conectividade).
- Um cliente tem no máximo um plano ativo por vez.
- Reservas são por horário em um único espaço; combos de vários espaços ficam fora da v1.
- Mesas hot-desk podem ser tratadas como espaços de capacidade 1 e reservadas como qualquer outro.
- O segmento social e sustentável (US8 a US10) **não cria fluxo novo**: estende F02 (filtros e
  atalhos de necessidade; escolha de pontos e meio de chegada ao reservar), F06 (confirmar meio de
  chegada e lançar pontos ao concluir), F07 (características do espaço), F08 (plano social e
  validação de elegibilidade) e F11 (relatório de impacto). Não entram na v1 parcerias com ONGs,
  doações, eventos comunitários, cálculo de pegada de carbono, selos de certificação, QR Code de
  entrada nem controle de acesso físico.
- A internet do espaço é um dado **cadastrado** (Mbps contratados), não uma métrica de
  conectividade, que continua fora do escopo.
- Categorias de elegibilidade, percentual do plano social, listas de características, atalhos de
  necessidade e valores de pontos são exemplos ajustáveis, definidos pelo administrador (como os
  demais valores).
