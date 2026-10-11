# Tasks: Comodidades na reserva

**Input**: [spec.md](spec.md), [plan.md](plan.md). `[P]` = pode ser feito em paralelo.

## Fase 1: Base de dados e regras

- [ ] T001 Tipos `Purpose`, `ExtrasLine`, `ExtrasOrder`; `Booking.purpose`; novos `PointsEntry.kind` em `src/domain/types.ts`
- [ ] T002 [P] Cardápio, finalidades e kits em `src/data/extras.ts` (RN24, RN25)
- [ ] T003 [P] Regras puras em `src/domain/extras.ts`: kit sugerido, totais, limite de pontos, `canOrder` (RN22, RN26)
- [ ] T004 `DB.extras`, `VERSION` 5 e migração v4 → v5 em `src/store/store.ts`
- [ ] T005 Store: `createBooking` com finalidade e pedido; `addExtras`; `cancelExtrasLine`; `settleExtras` nas transições; `sweepEndedExtras`; simulações de entrega e pagamento (RN26, RN27)

## Fase 2: US11 — pedir ao reservar (T07, T48, T08)

- [ ] T006 `ExtrasPicker` (T48) no `Dialog`, acessível (FR-028, FR-031, FR-035)
- [ ] T007 `ExtrasCard` no resumo T07: finalidade, pessoas, kit, MSG-27/MSG-31 (FR-027, FR-028)
- [ ] T008 T07: recibo com comodidades separadas e confirmação conjunta (FR-030)
- [ ] T009 Espaços → resumo levam o atalho `need` para pré-preencher a finalidade (RN24)
- [ ] T010 `ExtrasStatus` em T08 (itens e valor)

## Fase 3: US12 — pedir, acompanhar e cancelar no detalhe (T12, T46)

- [ ] T011 T12: cartão Comodidades com situação, "Pedir itens", "Cancelar item" (MSG-29), MSG-30 (FR-029, FR-032)
- [ ] T012 T12: barra do protótipo com "Cozinha entregou" e "Recepção recebeu" (FR-034)
- [ ] T013 Cancelar/expirar/concluir/no-show cancela itens a entregar e devolve pontos (FR-033)
- [ ] T014 T46: rótulos *troca por item* e *devolução* no extrato

## Fase 4: Acabamento

- [ ] T015 Estilos em `src/styles/portal.css` (cartão, painel, lista de itens, estados)
- [ ] T016 `npm run build` sem erros
- [ ] T017 Verificação de layout (1920 a 360 px), celular 375 × 812 e teclado em T07, T48 e T12
- [ ] T018 Atualizar PRD (5.2/5.4), README (rotas: sem rota nova; nota de T48) e quadro de versões
