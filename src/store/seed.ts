import { PLANS, SPACES } from '../data/catalog';
import { priceBooking } from '../domain/pricing';
import type { Booking, Client, PointsEntry, Subscription } from '../domain/types';
import { atBusinessDay, atDay } from '../lib/dates';

export const DEMO_CLIENT_ID = 'cli_ana';

/** Dados de exemplo do protótipo, com datas relativas a hoje (TRD TD3). Pessoas e valores são fictícios. */
export function buildSeed(now = new Date()) {
  const iso = (d: Date) => d.toISOString();
  const professional = PLANS.find((p) => p.id === 'profissional')!;

  const ana: Client = {
    id: DEMO_CLIENT_ID,
    name: 'Ana Souza',
    email: 'ana.souza@email.com',
    document: '52998224725',
    phone: '11912345678',
    passwordHash: null,
    passwordSalt: null,
    status: 'active',
    createdAt: iso(atDay(now, -60, 10)),
  };

  const subscriptions: Subscription[] = [
    { id: 'sub_ana', clientId: ana.id, planId: professional.id, start: iso(atDay(now, -18, 9)), end: iso(atDay(now, 12, 23, 59)), status: 'active' },
  ];

  const make = (
    n: number, spaceId: string, day: number, from: number, hours: number,
    state: Booking['state'], createdDaysAgo = 7,
  ): Booking => {
    const space = SPACES.find((s) => s.id === spaceId)!;
    const start = atBusinessDay(now, day, from);
    const end = new Date(start.getTime() + hours * 3600_000);
    return {
      id: `bk_${n}`,
      code: `HB-${String(1040 + n)}`,
      clientId: ana.id,
      spaceId,
      start: iso(start),
      end: iso(end),
      state,
      createdAt: iso(atDay(start, -createdDaysAgo, 10)),
      planName: professional.name,
      ...priceBooking(space.hourly, hours, professional.discount),
    };
  };

  const bookings: Booking[] = [
    make(1, 'sala-aurora', 1, 14, 2, 'confirmed', 3),
    make(2, 'mesa-12', 3, 9, 3, 'confirmed', 2),
    make(3, 'estacao-norte', 6, 13, 4, 'confirmed', 1),
    make(4, 'sala-ruby', -2, 10, 2, 'completed'),
    make(5, 'cabine-foco', -5, 15, 2, 'completed'),
    make(6, 'sala-esmeralda', -1, 9, 2, 'cancelled'),
    make(7, 'estacao-sul', -1, 15, 2, 'confirmed', 4),
  ];
  // Concluídas foram pagas; a cancelada saiu com mais de 24 h, sem multa (RN07).
  // A reserva que já terminou e espera a recepção informou chegada de bicicleta (RN23).
  bookings[6]!.arrivalMode = 'bike';
  for (const b of bookings) {
    if (b.state === 'completed') b.paid = b.finalPrice;
    if (b.state === 'cancelled') b.cancellation = { at: iso(atDay(now, -4, 11)), by: 'client', feePct: 0, fee: 0, retained: 0, refund: 0, pendingFee: 0 };
  }

  const points: PointsEntry[] = [
    { id: 'pt_1', clientId: ana.id, date: iso(atDay(now, -40, 18)), kind: 'completed', points: 80, label: 'Reservas concluídas em setembro' },
    { id: 'pt_2', clientId: ana.id, date: iso(atDay(now, -30, 18)), kind: 'streak', points: 20, label: 'Sequência de 5 reservas sem falta' },
    { id: 'pt_3', clientId: ana.id, date: iso(atDay(now, -5, 17)), kind: 'completed', points: 10, label: 'Reserva concluída', bookingId: 'bk_5' },
    { id: 'pt_4', clientId: ana.id, date: iso(atDay(now, -5, 17)), kind: 'clean_arrival', points: 5, label: 'Chegada limpa: bicicleta', bookingId: 'bk_5' },
    { id: 'pt_5', clientId: ana.id, date: iso(atDay(now, -2, 12)), kind: 'completed', points: 10, label: 'Reserva concluída', bookingId: 'bk_4' },
    { id: 'pt_6', clientId: ana.id, date: iso(atDay(now, -2, 12)), kind: 'streak', points: 10, label: 'Bônus parcial de sequência' },
    { id: 'pt_7', clientId: ana.id, date: iso(atDay(now, -2, 12)), kind: 'clean_arrival', points: 5, label: 'Chegada limpa: transporte público', bookingId: 'bk_4' },
  ];

  const community = buildCommunity(now);
  return {
    clients: [ana, ...community.clients],
    subscriptions: [...subscriptions, ...community.subscriptions],
    bookings: [...bookings, ...community.bookings],
    points,
  };
}

/** Outras pessoas fictícias do coworking: dão corpo aos indicadores de "Nosso impacto" (RN21).
 *  Não têm senha e não aparecem em nenhuma tela de login. */
export function buildCommunity(now = new Date()) {
  const iso = (d: Date) => d.toISOString();
  const social = PLANS.find((p) => p.id === 'social')!;
  const person = (id: string, name: string, email: string, document: string): Client => ({
    id, name, email, document, phone: '11900000000', passwordHash: null, passwordSalt: null, status: 'active', createdAt: iso(atDay(now, -50, 10)),
  });
  const clients = [
    person('cli_diana', 'Diana Alves', 'diana.alves@exemplo.com', '16899535009'),
    person('cli_bruno', 'Bruno Lima', 'bruno.lima@exemplo.com', '39053344705'),
  ];
  const subscriptions: Subscription[] = [
    { id: 'sub_diana', clientId: 'cli_diana', planId: social.id, start: iso(atDay(now, -20, 9)), end: iso(atDay(now, 10, 23, 59)), status: 'active', kind: 'new', price: social.price,
      social: { category: 'student', review: 'approved', reviewedAt: iso(atDay(now, -21, 15)) } },
  ];
  let n = 100;
  const make = (clientId: string, spaceId: string, day: number, from: number, hours: number, state: Booking['state'], member: boolean): Booking => {
    const space = SPACES.find((s) => s.id === spaceId)!;
    const start = atBusinessDay(now, day, from);
    const end = new Date(start.getTime() + hours * 3600_000);
    const b: Booking = {
      id: `bk_${n}`, code: `HB-${1000 + n++}`, clientId, spaceId,
      start: iso(start), end: iso(end), state, createdAt: iso(atDay(start, -5, 10)),
      planName: member ? social.name : null,
      ...priceBooking(space.hourly, hours, member ? social.discount : 0),
    };
    if (state === 'completed' || state === 'confirmed') b.paid = b.finalPrice;
    return b;
  };
  const bookings: Booking[] = [
    make('cli_diana', 'mesa-12', -3, 9, 4, 'completed', true),
    make('cli_diana', 'mesa-14', -9, 13, 3, 'completed', true),
    make('cli_diana', 'cabine-foco', -16, 10, 2, 'completed', true),
    make('cli_diana', 'mesa-12', -24, 14, 3, 'completed', true),
    make('cli_bruno', 'sala-ruby', -4, 14, 2, 'completed', false),
    make('cli_bruno', 'estacao-norte', -12, 9, 4, 'completed', false),
    make('cli_bruno', 'sala-aurora', -7, 15, 2, 'no_show', false),
    make('cli_bruno', 'estacao-sul', -18, 10, 3, 'completed', false),
    make('cli_bruno', 'mesa-14', -29, 13, 2, 'cancelled', false),
  ];
  // Concluídas com chegada limpa confirmada; um cancelamento antecipado (sem multa) e uma falta.
  bookings[0]!.arrivalMode = 'walk'; bookings[0]!.arrivalConfirmed = true;
  bookings[1]!.arrivalMode = 'transit'; bookings[1]!.arrivalConfirmed = true;
  bookings[4]!.arrivalMode = 'bike'; bookings[4]!.arrivalConfirmed = true;
  bookings[5]!.arrivalMode = 'carpool'; bookings[5]!.arrivalConfirmed = true;
  bookings[8]!.cancellation = { at: iso(atDay(now, -32, 11)), by: 'client', feePct: 0, fee: 0, retained: 0, refund: 0, pendingFee: 0 };
  return { clients, subscriptions, bookings };
}
