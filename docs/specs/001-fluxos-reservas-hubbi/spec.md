# Feature Specification: Fluxos e Funcionamento do Hubbi (Gestão de Reservas de Espaços)

**Feature Branch**: `001-fluxos-reservas-hubbi` (sem branch git; pasta de spec apenas)

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Especificação dos fluxos e do funcionamento da aplicação Hubbi (sistema de gerenciamento de salas/espaços para coworking), para servir de base ao protótipo no Figma/FigJam: fluxos de usuário (equipe e membro/avulso com portal próprio), reservas com ciclo de vida, duração e horário de funcionamento, cancelamento com multa/estorno, preço por espaço/hora com desconto por plano, pagamentos manuais, cadastros, disponibilidade, relatórios, notificações, perfis e permissões."

> **Natureza deste documento**: esta spec descreve **como a aplicação funciona** (fluxos, estados e
> regras) e não uma funcionalidade isolada. Ela é a fonte para o protótipo no Figma e os fluxos no
> FigJam. Os códigos RN, FR e fluxos (F01…) são estáveis e devem ser citados pelo protótipo
> (Constituição, princípio V).

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

1. **Given** um visitante, **When** envia nome, e-mail, telefone e senha válidos, **Then** cria o
   cadastro único como cliente avulso (RN14).
2. **Given** um e-mail já cadastrado, **When** o visitante tenta se registrar, **Then** o sistema
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

### Edge Cases

- Duas pessoas tentam reservar o mesmo horário quase ao mesmo tempo: só uma reserva é criada; a
  outra recebe aviso de conflito (RN03).
- Reserva que cruza o fim do horário de funcionamento ou a virada de dia: recusada (RN04).
- Cliente ganha ou perde plano entre criar a reserva e o uso: o preço da reserva não muda (RN06).
- Cancelamento de reserva ainda *pendente* sem pagamento: sem multa e sem estorno (RN07).
- Estorno de reserva cujo pagamento ainda não foi registrado: não há estorno a fazer.
- Cliente inativado com reservas futuras: reservas futuras são tratadas antes da inativação (RN15).
- Espaço inativado: some da busca, mas continua nos históricos e relatórios (RN15).
- Registro de pagamento em valor diferente do devido: recusado ou marcado como parcial com
  justificativa (RN12).
- Tentativa de acessar dados de outro cliente: negada (RN17).
- Marcar no-show antes do horário de término: não permitido (RN10).

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
- **RN06 — Valor congelado**: valor cheio, desconto aplicado, plano vigente e valor final são
  gravados na reserva ao criá-la e não mudam depois.
- **RN07 — Política de cancelamento**: cancelar ≥ 24h antes do início: sem multa. Entre 24h e 2h
  antes: multa de 50% do valor. Menos de 2h antes: multa de 100%. O valor da multa é calculado e
  mostrado antes de o cliente confirmar. Cancelamento de reserva pendente sem pagamento: sem multa.
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
  Todo pagamento tem situação: pendente, realizado ou estornado, e liga-se a um cliente e a uma
  reserva ou a um plano.
- **RN13 — Reserva de membro**: reserva de membro com plano ativo nasce *confirmada* e gera uma
  cobrança *pendente* para a equipe registrar depois. Plano vencido ou cancelado equivale a avulso.
- **RN14 — Cadastro único**: um cadastro por e-mail e por documento do cliente.
- **RN15 — Exclusão lógica**: clientes, espaços e planos com histórico são inativados, nunca
  apagados. Inativar um cliente ou espaço exige resolver antes as reservas futuras.
- **RN16 — Notificações**: o cliente é avisado ao criar, confirmar, cancelar (com multa/estorno),
  expirar uma reserva, antes do início (lembrete) e antes do vencimento do plano.
- **RN17 — Permissões**: cliente só vê e altera seus próprios dados. Recepção opera cadastros,
  reservas e pagamentos. Administrador faz tudo, incluindo espaços, preços, planos e equipe.
  Alterar ou excluir cadastros de clientes só por equipe autorizada.
- **RN18 — Relatórios**: usam apenas dados registrados; receita conta somente pagamentos
  *realizados*, menos estornos.

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
  MUST poder associar, trocar e encerrar o plano de um cliente (RN13).
- **FR-014**: A equipe MUST poder cadastrar, editar, consultar e inativar clientes (RN15, RN17).
- **FR-015**: O sistema MUST enviar as notificações da RN16.
- **FR-016**: O sistema MUST gerar relatórios de reservas, clientes, pagamentos e ocupação por
  período (RN18).
- **FR-017**: O sistema MUST aplicar permissões por perfil: Cliente, Recepção, Administrador
  (RN17).
- **FR-018**: O sistema MUST mostrar mensagens de erro claras sem expor dados sensíveis.
- **FR-019**: O sistema MUST armazenar senhas apenas como hash e coletar só os dados pessoais
  necessários (LGPD).
- **FR-020**: Cada tela e fluxo do protótipo MUST citar os FR e RN que realiza e cobrir caminho
  feliz e principais erros.

### Key Entities

- **Cliente**: pessoa cadastrada (nome, e-mail, documento, telefone, estado ativo/inativo).
  Tem zero ou um plano ativo.
- **Plano**: oferta com nome, desconto percentual, validade e situação.
- **Assinatura**: ligação entre Cliente e Plano, com início, vencimento e situação.
- **Espaço**: sala, mesa ou estação com tipo, capacidade, preço/hora, horário de funcionamento e
  estado ativo/inativo.
- **Reserva**: Cliente + Espaço + período, estado, valor cheio, desconto, valor final.
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
