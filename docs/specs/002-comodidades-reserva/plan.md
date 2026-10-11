# Implementation Plan: Comodidades na reserva

**Branch**: `feat/HBB-003` | **Spec**: [spec.md](spec.md) | **Date**: 2026-10-11

## Summary

Acrescentar ao protótipo React o pedido de comodidades (RN24–RN27, RN22 ampliada): finalidade e
pessoas no resumo (T07), painel de escolha (T48), itens e cobrança separada em T08 e T12, troca de
pontos por item e devolução no extrato (T46). Ações da equipe ficam na barra do protótipo.

## Technical Context

- **Stack** (já existente, TRD): React 18 + TypeScript estrito + Vite; React Router 6; CSS próprio
  por área (`src/styles/portal.css`); dados no `localStorage` (`hubbi:v2`), lidos com
  `useSyncExternalStore` em `src/store/store.ts`.
- **Testes**: não há testes automatizados no projeto; a evidência é `npm run build` (tipos) e a
  verificação de layout e teclado do CLAUDE.md (Constituição, princípio V).
- **Restrições**: textos em português; rotas em inglês (sem rota nova: T48 é painel); layout pelas
  regras do CLAUDE.md; acessibilidade WCAG 2.2 AA como no resto do portal.

## Constitution Check

| Princípio | Situação |
|---|---|
| I. Escopo enxuto | **Exige emenda MINOR 1.1.0** (comodidades cobradas à parte). Registrada na spec; aprovação da equipe pendente. |
| II. Regras como fonte | Regras novas com código (RN24–RN27); FR citam regras. OK |
| III. Integridade | Pedido nunca é apagado; itens só mudam de situação. OK |
| IV. Precificação | Preço do espaço inalterado; comodidades em cobrança separada com situação explícita. OK |
| V. Rastreabilidade | Telas citam FR; quadro de versões atualizado (0.10). OK |
| VI. LGPD | Nenhum dado pessoal novo. OK |

## Design

### Dados (`src/domain/types.ts`, formato v5)

```ts
type Purpose = 'meeting' | 'focus' | 'dev' | 'creative' | 'other';      // RN24
type ExtrasLineState = 'to_deliver' | 'delivered' | 'cancelled';
type ExtrasLine = { id; itemId; qty; unitPrice; unitPoints: number | null;
                    pointsUnits; state: ExtrasLineState; orderedAt; deliveredAt?; cancelledAt? };
type ExtrasOrder = { id; bookingId; clientId; purpose: Purpose | null; people;
                     noDisposables: boolean; createdAt; lines: ExtrasLine[]; paid: number };  // 1 por reserva
Booking.purpose?: Purpose | null
PointsEntry.kind += 'extra_redeem' | 'extra_refund'
DB.extras: ExtrasOrder[]
```

`VERSION` 4 → 5; `load()` migra v4 acrescentando `extras: []` sem tocar no resto (CLAUDE.md).

### Catálogo (`src/data/extras.ts`)
`EXTRAS` (cardápio da spec, Assumptions), `PURPOSES` (rótulos; ids iguais aos atalhos `NeedId`
mais `other`), `KITS` (finalidade → itens).

### Regras puras (`src/domain/extras.ts`)
- `suggestedLines(purpose, people)` → rascunho do kit (RN25).
- `draftTotals(draft)` → `{ money, points }`; valor = Σ (qty − pointsUnits) × unitPrice (RN26).
- `orderTotals(order)` → devido, pago, a pagar, ignorando linhas canceladas.
- `maxPointsUnits(line, available)` (RN22 ampliada).
- `canOrder(booking, now)` → pendente/confirmada e antes do fim (RN26).

### Store (`src/store/store.ts`)
- `createBooking` recebe `purpose` e `extras` (rascunho) e grava reserva, pedido e débitos de
  pontos numa só gravação.
- `addExtras(bookingId, draft)` soma linhas ao pedido da reserva ou cria o pedido (Clarificação 1).
- `cancelExtrasLine(orderId, lineId)` → *cancelado* + devolução de pontos (RN27).
- `settleExtras(bookingId)` → cancela linhas *a entregar* com devolução; chamado ao cancelar,
  expirar, concluir e no-show, e por `sweepEndedExtras()` para reservas cujo horário acabou
  (Clarificação 2).
- Protótipo: `deliverExtrasLine`, `registerExtrasPayment`.
- Devolução: lançamento novo datado do cancelamento (Clarificação 3).

### Interface
- `features/portal/extras/ExtrasPicker.tsx` (T48): usa o `Dialog` atual (vira folha embaixo
  abaixo de 560 px); lista do cardápio com stepper de quantidade, restrições em texto, "Pagar com
  pontos" por linha, "Sem descartáveis", total com `aria-live`.
- `features/portal/extras/ExtrasCard.tsx` (T07): finalidade (botões em pílula), "Quantas pessoas?"
  (stepper), resumo dos itens, botão "Escolher itens", MSG-27 e MSG-31.
- `features/portal/extras/ExtrasStatus.tsx` (T08 e T12): itens com situação, valor, "Pedir
  itens" e "Cancelar item" (MSG-29) só em T12.
- T07: recibo ganha a linha "Comodidades (cobrança separada)" e o botão confirma reserva e pedido.
- T12: barra do protótipo ganha "Cozinha entregou o próximo item" e "Recepção recebeu as
  comodidades".
- T46: rótulos dos tipos novos no extrato.
- Spaces → BookingNew: o atalho de necessidade vai na URL (`need=`) para preencher a finalidade.

## Verificação
`npm run build`; medidas de layout em 1920/1440/1280/1024/768/390/360 px em T07 e T12 com o
painel aberto; celular 375 × 812; teclado (Tab, Esc, foco volta ao botão).
