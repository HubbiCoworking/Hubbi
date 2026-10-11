# Contrato: Inventário de Telas

Lista de **45 telas-base**. Cada tela é entregue em **3 tamanhos** (computador 1440 px, tablet
768 px, celular 390 px; FR-021) e com os estados obrigatórios indicados. Cada linha cita os FR e
as RN que a tela realiza (FR-020). Detalhes de fluxo: [fluxos.md](../fluxos.md). Textos:
[ui-messages.md](ui-messages.md). Componentes: [design-system.md](design-system.md).

**Legenda de estados**: **P** padrão · **C** carregando · **V** vazio · **E** erro · **S** sucesso
ou confirmação. Telas de formulário têm também **validação em campo**. Toda tela autenticada tem
estado **acesso negado** quando o perfil não permite (RN17).
**Superfície**: **Portal** (cliente) ou **Painel** (equipe).
**Onda**: ordem de prototipação do [plan.md](../plan.md).

## F01 — Cadastro e login (US4; FR-001, FR-002, FR-019; RN14, RN17)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T01 | Cadastro | Portal | FR-001, FR-019 | RN14 | P, E, S | 1 | Campos: nome, e-mail, documento, telefone, senha. Erros por campo; e-mail ou documento já cadastrado → MSG-01 com ações "Entrar" e "Recuperar senha" |
| T02 | Login | Portal e Painel | FR-002 | RN17 | P, C, E | 1 | Mesma tela para cliente e equipe; o perfil define o destino (T45 ou T21). Erro genérico MSG-02, nunca indica qual campo falhou |
| T03 | Recuperar senha | Portal e Painel | FR-002 | — | P, S, E | 1 | **Lacuna:** a spec cita "recuperar senha" no F01, mas não tem FR ou RN dela. Desenhar o caminho básico (e-mail → confirmação) e marcar como "a confirmar" |
| T44 | Meu perfil | Portal | FR-002 | RN17 | P, C, E, S | 2 | Cliente vê e edita só os próprios dados (SC-008); troca de senha |

## F02 — Consultar disponibilidade e preço (US1; FR-003; RN01, RN02, RN06)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T04 | Espaços: busca e lista | Portal | FR-003 | RN01, RN02, RN13 | P, C, V, E | 1 | Filtros: data, horário, duração, tipo. Lista só espaços ativos com horário livre. Membro vê preço cheio riscado + com desconto; avulso e membro com pendência veem só o cheio, este com aviso MSG-18. **Visitante** pode abrir T04 sem login e vê preços cheios (ator da spec; sem fluxo próprio, marcar como "a confirmar"). Vazio: MSG-03 com sugestão de outros horários |
| T05 | Detalhe do espaço | Portal | FR-003 | RN01, RN04, RN05 | P, C, E | 1 | Grade de horários livres e ocupados do dia, limites de duração, horário de funcionamento. Botão "Reservar" leva a T07 |
| T06 | Espaços: busca | Painel | FR-003 | RN01, RN02 | P, C, V, E | 1 | Mesma lógica de T04, com seletor de cliente para calcular o preço do cliente escolhido |

## F03 — Criar reserva (US1, US2; FR-004, FR-005; RN01–RN06, RN12, RN13)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T07 | Resumo da reserva | Portal | FR-004, FR-005 | RN02–RN06, RN12, RN13 | P, C, E, S | 1 | Resumo financeiro (cheio, desconto, total) antes de confirmar. Erros: MSG-04 a MSG-08. Explica o que acontece depois: membro → "Confirmada"; avulso → "Aguardando pagamento" com prazo (MSG-09) |
| T08 | Comprovante de reserva | Portal | FR-004 | RN06, RN09 | P | 1 | Código, espaço, período, valores congelados, estado, prazo de pagamento quando pendente |
| T09 | Nova reserva | Painel | FR-004 | RN01–RN05 | P, C, V, E | 1 | 3 passos: cliente → espaço e período → resumo. Recepção pode escolher início com menos de 1h (RN12) |
| T10 | Resumo e confirmação | Painel | FR-004, FR-005, FR-009 | RN06, RN12, RN13 | P, C, E, S | 1 | Quando o início é em menos de 1h, oferece registrar o pagamento integral no ato (reserva nasce Confirmada) |
| T11 | Minhas reservas | Portal | FR-006, FR-011 | RN08, RN09 | P, C, V, E | 1 | Abas: Próximas, Passadas, Canceladas; selo de estado; ação "Cancelar" conforme [data-model.md](../data-model.md) seção 3 |
| T12 | Detalhe da reserva | Portal | FR-005, FR-006, FR-011 | RN06, RN08, RN09 | P, C, E | 1 | Valores congelados, linha do tempo, prazo de pagamento, botão "Cancelar" |
| T13 | Reservas (lista e agenda) | Painel | FR-006, FR-011 | RN08, RN09 | P, C, V, E | 1 | Visões lista e agenda por espaço; filtros por estado, data, cliente |
| T14 | Detalhe da reserva | Painel | FR-005, FR-006, FR-009, FR-011 | RN06, RN08, RN09, RN10 | P, C, E | 1 | Ações por estado (seção 3 do data-model): pagar, cancelar, encerrar; linha do tempo com responsável |

## F04 — Pagar e confirmar reserva (US2; FR-009; RN11, RN12)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T15 | Pagamentos pendentes | Painel | FR-009 | RN12, RN13 | P, C, V, E | 1 | Lista: cliente, reserva ou plano, valor devido, prazo; destaque para vencidos e prazos próximos |
| T16 | Registrar pagamento | Painel | FR-009 | RN11, RN12 | P, C, E, S | 1 | Valor, forma, data. Maior que o devido: MSG-10 (recusado). Menor: pagamento parcial com justificativa obrigatória (MSG-11); cobrança segue pendente. Igual: Realizado e, se for reserva pendente, vira Confirmada |
| T17 | Pagamentos realizados e estornos | Painel | FR-009 | RN11, RN18 | P, C, V, E | 1 | Histórico com filtros e selos Pendente, Realizado, Estornado |

## F05 — Cancelar reserva (US3; FR-007; RN07, RN08, RN11)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T18 | Cancelar reserva | Portal | FR-007 | RN07, RN08, RN11 | P, C, E, S | 2 | Painel de confirmação com **multa, valor retido e estorno antes do botão** (SC-005); textos MSG-12 a MSG-16; botão com verbo e valor |
| T19 | Cancelar reserva | Painel | FR-007 | RN07, RN08, RN11 | P, C, E, S | 2 | Mesma regra de T18, com justificativa opcional |
| T20 | Registrar estorno | Painel | FR-009 | RN11 | P, C, V, E, S | 2 | Lista de estornos pendentes; registrar vira Estornado; multa pendente aparece em T15 |

## F06 — Encerrar reserva (US2; FR-010; RN08, RN10)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T21 | Reservas do dia | Painel | FR-010, FR-006 | RN08, RN10 | P, C, V, E | 1 | **Tela inicial da equipe.** Lista de reservas Confirmadas do dia com ação "Concluir" e "Não compareceu"; antes do término a ação fica desabilitada com MSG-17 |
| T22 | Encerrar reserva | Painel | FR-010 | RN08, RN09, RN10 | P, S, E | 1 | Confirmação com resultado (Concluída ou Não compareceu) e aviso de cobrança que segue pendente |

## F07 — Gerir espaços, preços e horários (US5; FR-012; RN01, RN04, RN05, RN15)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T23 | Espaços | Painel | FR-012 | RN15 | P, C, V, E | 2 | Lista com situação, preço/hora, capacidade; busca |
| T24 | Cadastrar ou editar espaço | Painel | FR-012 | RN01, RN04, RN05 | P, E, S | 2 | Nome, tipo, capacidade, local, preço/hora, horário por dia, duração mínima e máxima. Aviso MSG-19 de que reservas existentes mantêm o valor gravado (RN06) |
| T25 | Inativar espaço | Painel | FR-012 | RN15 | P, E, S | 2 | Se há reservas futuras: lista as afetadas para cancelar ou remanejar (MSG-20); só inativa depois |

## F08 — Gerir planos e assinatura (US5, US6; FR-013; RN13, RN16)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T26 | Planos | Painel (admin) | FR-013 | RN13 | P, C, V, E | 3 | Lista com desconto, preço, duração, situação |
| T27 | Cadastrar ou editar plano | Painel (admin) | FR-013 | RN13 | P, E, S | 3 | Nome, desconto %, preço, duração em dias; aviso de que vale só para novas reservas |
| T28 | Meu plano | Portal | FR-013 | RN13, RN16 | P, C, V, E | 3 | Plano atual, vencimento, aviso de vencimento próximo; ações "Solicitar troca" e "Cancelar plano" (MSG-21: sem devolução). Vazio: convite para contratar |
| T29 | Solicitar plano | Portal | FR-013 | RN13 | P, C, E, S | 3 | Escolha de plano com cartões; resumo com preço, duração e desconto; resultado: "Solicitação enviada, aguardando pagamento" (MSG-22) |
| T30 | Solicitações e assinaturas | Painel | FR-013, FR-009 | RN13 | P, C, V, E | 3 | Solicitações pendentes de pagamento, assinaturas ativas e a vencer; efetivar troca ou cancelamento. Pagamento do plano é registrado em T16 |

## F09 — Gerir clientes (US4; FR-014; RN14, RN15, RN17)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T31 | Clientes | Painel | FR-014 | RN17 | P, C, V, E | 2 | Busca por nome, e-mail ou documento; selo Avulso, Membro, Membro com pendência, Inativo |
| T32 | Detalhe do cliente | Painel | FR-014 | RN13, RN17 | P, C, E | 2 | Dados, plano, reservas, pagamentos, cobranças vencidas |
| T33 | Cadastrar ou editar cliente | Painel | FR-014 | RN14, RN17 | P, E, S | 2 | Mesmos campos de T01; erro de duplicidade MSG-01 |
| T34 | Inativar ou anonimizar cliente | Painel | FR-014, FR-019 | RN15 | P, E, S | 2 | Se há reservas futuras: MSG-23. Anonimizar mostra o que será apagado e que histórico permanece (MSG-24); registra responsável |

## F10 — Notificações recebidas (US7; FR-015; RN16)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T35 | Central de avisos | Portal | FR-015 | RN16 | P, C, V, E | 3 | Lista com lidos e não lidos, marcar como lida; sino com contador no topo. Tipos: criada, confirmada, cancelada (com multa e estorno), expirada, lembrete, plano perto de vencer, boas-vindas |

## F11 — Relatórios (US7; FR-016; RN18)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T36 | Relatórios | Painel | FR-016 | RN18 | P | 3 | Escolha do relatório e do período |
| T37 | Relatório de reservas | Painel | FR-016 | RN18 | P, C, V, E | 3 | Total por estado, histórico detalhado |
| T38 | Relatório de clientes | Painel | FR-016 | RN18 | P, C, V, E | 3 | Avulsos × membros, novos, inativos |
| T39 | Relatório de pagamentos | Painel | FR-016 | RN18 | P, C, V, E | 3 | Receita (realizados − estornos), pendentes, multas |
| T40 | Relatório de ocupação | Painel | FR-016 | RN18 | P, C, V, E | 3 | Horas reservadas por espaço. Vazio: MSG-25 "Sem dados no período". Exportar é opcional |

## F12 — Gerir usuários da equipe e permissões (FR-017; RN17)

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T41 | Equipe | Painel (admin) | FR-017 | RN17 | P, C, V, E | 3 | Lista de usuários, perfil e situação. **Lacuna:** F12 não tem história de usuário própria na spec |
| T42 | Criar ou editar usuário | Painel (admin) | FR-017 | RN17 | P, E, S | 3 | Nome, e-mail, perfil (Recepção ou Administrador); senha inicial com troca obrigatória |
| T43 | Desativar usuário | Painel (admin) | FR-017 | RN17 | P, E, S | 3 | Bloqueia o último administrador ativo (MSG-26); histórico preservado |

## Navegação inicial

| ID | Tela | Superfície | FR | RN | Estados | Onda | Notas |
|----|------|------------|----|----|---------|:----:|-------|
| T45 | Início do portal | Portal | FR-003 | RN13 | P, C, V | 1 | Próximas reservas, plano atual, atalho "Reservar um espaço" |

(T21 é o início da equipe.)

## Permissões por tela (RN17)

| Perfil | Telas acessíveis |
|--------|------------------|
| Visitante | T01, T02, T03, T04 (somente leitura, preços cheios) |
| Cliente | T04, T05, T07, T08, T11, T12, T18, T28, T29, T35, T44, T45 e as de F01 |
| Recepção | T02, T03, T06, T09, T10, T13–T17, T19–T22, T30–T34, T36–T40 |
| Administrador | Todas da Recepção + T23–T27, T41–T43 |

Tentar abrir tela fora do perfil mostra **acesso negado** (MSG-27), sem revelar dados de outro cliente.

## Cobertura dos fluxos

| Fluxo | Telas | Fluxo | Telas |
|-------|-------|-------|-------|
| F01 | T01, T02, T03, T44 | F07 | T23, T24, T25 |
| F02 | T04, T05, T06 | F08 | T26–T30 |
| F03 | T07–T14 | F09 | T31–T34 |
| F04 | T15–T17 | F10 | T35 |
| F05 | T18–T20 | F11 | T36–T40 |
| F06 | T21, T22 | F12 | T41–T43 |

Total: 45 telas (T01–T45), todas com os três tamanhos.
