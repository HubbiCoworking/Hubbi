import { SPACES } from '../data/catalog';
import type { ArrivalMode, Booking, PointsEntry, Subscription } from './types';
import { bookingHours } from './booking';
import { OPENING } from './availability';
import { round2 } from '../lib/format';

/** RN21: oito indicadores, todos calculados de dados registrados (reservas, assinaturas, extrato).
 *  Nenhuma estimativa de emissões, economia de recursos ou renda gerada. */
export type ImpactInput = { bookings: Booking[]; subscriptions: Subscription[]; points: PointsEntry[] };

export type ImpactIndicators = {
  from: Date;
  to: Date;
  empty: boolean;
  /** (a) horas reservadas (reservas que ocuparam o espaço) e horas concluídas */
  hours: { reserved: number; completed: number };
  /** (b) ocupação por espaço: horas reservadas ÷ horas de funcionamento no período */
  occupancy: { id: string; name: string; hours: number; capacity: number; pct: number }[];
  /** (c) capacidade perdida = horas de não comparecimento, reserva expirada e cancelamento com multa,
   *  sobre as horas que ocuparam ou seguraram o espaço */
  lost: { hours: number; base: number; pct: number };
  /** (d) clientes em plano social e as horas que reservaram */
  social: { clients: number; hours: number };
  /** (e) desconto social concedido: (valor cheio − valor final) das reservas de plano social */
  socialDiscount: number;
  /** (f) espaços com recursos de acessibilidade e as reservas feitas neles */
  accessibility: { spaces: number; total: number; bookings: number };
  /** (g) horas liberadas por cancelamento sem multa com 24 h ou mais; pontos concedidos e resgatados */
  green: { freedHours: number; granted: number; redeemed: number };
  /** (h) chegadas confirmadas por meio de transporte */
  arrivals: { mode: ArrivalMode; count: number }[];
};

const DAY = 86_400_000;
const OPEN_HOURS = OPENING.close - OPENING.open;

/** Dias de funcionamento (segunda a sábado) entre duas datas. */
function openDays(from: Date, to: Date): number {
  let n = 0;
  for (let t = new Date(from.getFullYear(), from.getMonth(), from.getDate()); t <= to; t = new Date(t.getTime() + DAY)) {
    if ((OPENING.days as readonly number[]).includes(t.getDay())) n++;
  }
  return n;
}

export function impactIndicators(input: ImpactInput, days: number | null, now: Date): ImpactIndicators {
  // "Todo o período" começa no registro mais antigo, de reserva ou de pontos.
  const dates = [...input.bookings.map((b) => b.start), ...input.points.map((p) => p.date)].map((d) => new Date(d).getTime());
  const earliest = dates.length ? new Date(Math.min(...dates)) : now;
  const from = days === null ? earliest : new Date(now.getTime() - days * DAY);
  const inWindow = (iso: string) => { const t = new Date(iso); return t >= from && t <= now; };
  const bookings = input.bookings.filter((b) => inWindow(b.start));

  const held = (b: Booking) => b.state !== 'cancelled';
  const free24 = (b: Booking) => b.state === 'cancelled' && (b.cancellation?.fee ?? 0) === 0 && b.cancellation?.by === 'client'
    && new Date(b.start).getTime() - new Date(b.cancellation.at).getTime() >= 24 * 3600_000;
  const lostOne = (b: Booking) => b.state === 'no_show' || (b.state === 'cancelled' && ((b.cancellation?.fee ?? 0) > 0 || b.cancellation?.by === 'system'));

  const reservedHours = bookings.filter(held).reduce((s, b) => s + bookingHours(b), 0);
  const completedHours = bookings.filter((b) => b.state === 'completed').reduce((s, b) => s + bookingHours(b), 0);

  const capacity = openDays(from, now) * OPEN_HOURS;
  const occupancy = SPACES.map((sp) => {
    const hours = bookings.filter((b) => b.spaceId === sp.id && held(b)).reduce((s, b) => s + bookingHours(b), 0);
    return { id: sp.id, name: sp.name, hours, capacity, pct: capacity ? Math.min(100, Math.round((hours / capacity) * 100)) : 0 };
  }).sort((a, b) => b.hours - a.hours);

  const lostHours = bookings.filter(lostOne).reduce((s, b) => s + bookingHours(b), 0);
  const base = bookings.filter((b) => held(b) || lostOne(b)).reduce((s, b) => s + bookingHours(b), 0);

  const socialBookings = bookings.filter((b) => b.planName === 'Social' && held(b));
  const socialClients = new Set(input.subscriptions.filter((s) => s.planId === 'social' && s.status === 'active').map((s) => s.clientId));

  const accessSpaces = SPACES.filter((s) => s.features.accessibility.length > 0);
  const accessIds = new Set(accessSpaces.map((s) => s.id));

  const pts = input.points.filter((p) => inWindow(p.date));
  const granted = pts.filter((p) => p.points > 0).reduce((s, p) => s + p.points, 0);
  const redeemed = -pts.filter((p) => p.points < 0).reduce((s, p) => s + p.points, 0);

  const modes = new Map<ArrivalMode, number>();
  for (const b of bookings) if (b.arrivalMode && b.arrivalConfirmed) modes.set(b.arrivalMode, (modes.get(b.arrivalMode) ?? 0) + 1);

  return {
    from, to: now, empty: bookings.length === 0,
    hours: { reserved: round2(reservedHours), completed: round2(completedHours) },
    occupancy,
    lost: { hours: round2(lostHours), base: round2(base), pct: base ? Math.round((lostHours / base) * 100) : 0 },
    social: { clients: socialClients.size, hours: round2(socialBookings.reduce((s, b) => s + bookingHours(b), 0)) },
    socialDiscount: round2(socialBookings.reduce((s, b) => s + (b.fullPrice - b.finalPrice), 0)),
    accessibility: { spaces: accessSpaces.length, total: SPACES.length, bookings: bookings.filter((b) => accessIds.has(b.spaceId) && held(b)).length },
    green: { freedHours: round2(bookings.filter(free24).reduce((s, b) => s + bookingHours(b), 0)), granted, redeemed },
    arrivals: [...modes].map(([mode, count]) => ({ mode, count })).sort((a, b) => b.count - a.count),
  };
}
