/* Regras das comodidades (spec 002): RN22 ampliada, RN24–RN27. Funções puras. */
import { EXTRAS, EXTRAS_MAX_QTY, extraById, KITS } from '../data/extras';
import { round2 } from '../lib/format';
import { isActive } from './booking';
import type { Booking, ExtrasOrder, Purpose } from './types';

/** Quantidade escolhida de um item. `touched`: a pessoa ajustou à mão, então não acompanha mais
 *  "Quantas pessoas?" (spec 002, US11 cenário 2). */
export type DraftLine = { qty: number; pointsUnits: number; touched: boolean };

/** Rascunho do pedido, antes de confirmar. Linhas por id do item; qty 0 = não pedido. */
export type ExtrasDraft = {
  purpose: Purpose | null;
  people: number;
  noDisposables: boolean;
  lines: Record<string, DraftLine>;
};

export const emptyDraft = (people: number, purpose: Purpose | null = null): ExtrasDraft =>
  ({ purpose, people, noDisposables: false, lines: {} });

/** Rascunho com o kit da finalidade (RN25). */
export function suggestedDraft(purpose: Purpose | null, people: number, noDisposables = false): ExtrasDraft {
  const lines: Record<string, DraftLine> = {};
  for (const k of purpose ? KITS[purpose] : []) {
    const item = extraById(k.id);
    if (!item) continue;
    lines[k.id] = { qty: k.qty ?? (item.per === 'person' ? people : 1), pointsUnits: 0, touched: k.qty !== undefined };
  }
  return { purpose, people, noDisposables, lines };
}

/** Muda o número de pessoas: itens por pessoa que a pessoa não ajustou acompanham. */
export function withPeople(draft: ExtrasDraft, people: number): ExtrasDraft {
  const lines = { ...draft.lines };
  for (const [id, l] of Object.entries(lines)) {
    if (!l.touched && extraById(id)?.per === 'person' && l.qty > 0) lines[id] = { ...l, qty: people, pointsUnits: Math.min(l.pointsUnits, people) };
  }
  return { ...draft, people, lines };
}

/** Ajusta a quantidade de um item (0 a EXTRAS_MAX_QTY); as unidades com pontos não passam dela. */
export function withQty(draft: ExtrasDraft, itemId: string, qty: number): ExtrasDraft {
  const q = Math.max(0, Math.min(EXTRAS_MAX_QTY, qty));
  const prev = draft.lines[itemId] ?? { qty: 0, pointsUnits: 0, touched: false };
  return { ...draft, lines: { ...draft.lines, [itemId]: { qty: q, pointsUnits: Math.min(prev.pointsUnits, q), touched: true } } };
}

export function withPointsUnits(draft: ExtrasDraft, itemId: string, units: number): ExtrasDraft {
  const prev = draft.lines[itemId];
  if (!prev) return draft;
  return { ...draft, lines: { ...draft.lines, [itemId]: { ...prev, pointsUnits: Math.max(0, Math.min(prev.qty, units)) } } };
}

/** Linhas pedidas (qty > 0), na ordem do cardápio. */
export const chosenLines = (draft: ExtrasDraft) =>
  EXTRAS.filter((e) => (draft.lines[e.id]?.qty ?? 0) > 0).map((e) => ({ item: e, ...draft.lines[e.id]! }));

/** Totais do rascunho: reais (unidades sem pontos × preço, sem desconto do plano, RN26) e pontos. */
export function draftTotals(draft: ExtrasDraft) {
  let money = 0;
  let points = 0;
  let units = 0;
  for (const l of chosenLines(draft)) {
    money += (l.qty - l.pointsUnits) * l.item.price;
    points += l.pointsUnits * (l.item.points ?? 0);
    units += l.qty;
  }
  return { money: round2(money), points, units };
}

/** Quantas unidades deste item ainda cabem no saldo, além das já marcadas nele (RN22 ampliada). */
export function maxPointsUnits(draft: ExtrasDraft, itemId: string, balance: number): number {
  const item = extraById(itemId);
  const line = draft.lines[itemId];
  if (!item?.points || !line) return 0;
  const usedElsewhere = draftTotals(draft).points - line.pointsUnits * item.points;
  return Math.max(0, Math.min(line.qty, Math.floor((balance - usedElsewhere) / item.points)));
}

/** Totais de um pedido gravado, sem as linhas canceladas (RN27). */
export function orderTotals(order: ExtrasOrder | null | undefined) {
  if (!order) return { due: 0, paid: 0, open: 0, points: 0, active: 0 };
  let due = 0;
  let points = 0;
  let active = 0;
  for (const l of order.lines) {
    if (l.state === 'cancelled') continue;
    due += (l.qty - l.pointsUnits) * l.unitPrice;
    points += l.pointsUnits * (l.unitPoints ?? 0);
    active += 1;
  }
  due = round2(due);
  return { due, paid: order.paid, open: round2(Math.max(0, due - order.paid)), points, active };
}

/** Pode pedir comodidades: reserva pendente ou confirmada e horário ainda não terminado (RN26). */
export const canOrderExtras = (b: Booking, now = new Date()) => isActive(b) && new Date(b.end) > now;
