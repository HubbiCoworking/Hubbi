import { useSyncExternalStore } from 'react';
import { GREEN_POINTS, PLAN_DAYS, PLANS, SOCIAL_NOTE_MAX, SPACES, type Plan, type Space } from '../data/catalog';
import { isFree } from '../domain/availability';
import { cancellationQuote } from '../domain/cancellation';
import { isActive } from '../domain/booking';
import { priceBooking } from '../domain/pricing';
import { currentStreak, pointsBalance } from '../domain/points';
import type { ArrivalMode, Booking, BookingHistory, Client, PointsEntry, SocialCategory, Subscription } from '../domain/types';
import { hashPassword, newId, newSalt } from '../lib/crypto';
import { buildCommunity, buildSeed, DEMO_CLIENT_ID } from './seed';

/* Dados do protótipo no navegador: um registro versionado no localStorage (TRD 6.1, TD1). */

const KEY = 'hubbi:v2';
const VERSION = 4;

export type DB = {
  version: number;
  clients: Client[];
  subscriptions: Subscription[];
  bookings: Booking[];
  points: PointsEntry[];
  history: BookingHistory[];
  sessionClientId: string | null;
};

let persistent = true;

/** v3 → v4: acrescenta a comunidade de exemplo (indicadores de impacto), mantendo o que já existe. */
function migrateV3(old: DB): DB {
  const extra = buildCommunity();
  const has = (id: string) => old.clients.some((c) => c.id === id);
  return {
    ...old,
    version: VERSION,
    clients: [...old.clients, ...extra.clients.filter((c) => !has(c.id))],
    subscriptions: [...old.subscriptions, ...extra.subscriptions.filter((s) => !old.subscriptions.some((o) => o.id === s.id))],
    bookings: [...old.bookings, ...extra.bookings.filter((b) => !old.bookings.some((o) => o.id === b.id))],
  };
}

function fresh(): DB {
  return { version: VERSION, sessionClientId: null, history: [], ...buildSeed() };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === VERSION) return parsed;
      // v2 → v3: acrescenta o histórico de estados, sem perder contas e reservas já criadas.
      if (parsed.version === 2 || parsed.version === 3) {
        const migrated = migrateV3(parsed.version === 2 ? { ...parsed, history: [], version: 3 } : parsed);
        save(migrated);
        return migrated;
      }
    }
  } catch {
    persistent = false;
  }
  const db = fresh();
  save(db);
  return db;
}

function save(db: DB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    persistent = false;
  }
}

let db: DB = load();
const listeners = new Set<() => void>();

function commit(next: DB) {
  db = next;
  save(db);
  listeners.forEach((l) => l());
}

// Várias abas abertas: quando outra aba grava, esta recarrega os dados em vez de sobrescrevê-los.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    db = load();
    listeners.forEach((l) => l());
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Lê o banco do protótipo e re-renderiza quando ele muda. */
export const useDB = () => useSyncExternalStore(subscribe, () => db);
export const getDB = () => db;
/** false quando o navegador bloqueia o armazenamento: os dados ficam só na memória. */
export const isPersistent = () => persistent;

// ---------- Sessão e contas (TRD seção 5) ----------

export const sessionClient = (d: DB = db): Client | null =>
  d.clients.find((c) => c.id === d.sessionClientId && c.status === 'active') ?? null;

export function signOut() {
  commit({ ...db, sessionClientId: null });
}

/** Entra com a conta de exemplo (botão do protótipo). */
export function signInDemo() {
  commit({ ...db, sessionClientId: DEMO_CLIENT_ID });
}

/** Confere e-mail e senha. Devolve null sem dizer qual dos dois falhou (MSG-02). */
export async function signIn(email: string, password: string): Promise<Client | null> {
  const client = db.clients.find((c) => c.email === email.trim().toLowerCase() && c.status === 'active');
  if (!client?.passwordHash || !client.passwordSalt) return null;
  if ((await hashPassword(password, client.passwordSalt)) !== client.passwordHash) return null;
  commit({ ...db, sessionClientId: client.id });
  return client;
}

type NewClient = { name: string; email: string; document: string; phone: string; password: string };

/** Cria a conta como cliente avulso (FR-001). E-mail e documento únicos (RN14). */
export async function createClient(input: NewClient): Promise<{ ok: true; client: Client } | { ok: false }> {
  const email = input.email.trim().toLowerCase();
  if (db.clients.some((c) => c.email === email || c.document === input.document)) return { ok: false };
  const salt = newSalt();
  const client: Client = {
    id: newId('cli'),
    name: input.name.trim(),
    email,
    document: input.document,
    phone: input.phone,
    passwordHash: await hashPassword(input.password, salt),
    passwordSalt: salt,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  commit({ ...db, clients: [...db.clients, client], sessionClientId: client.id });
  return { ok: true, client };
}

/** Ação de protótipo: apaga tudo e recarrega os dados de exemplo. */
export function resetDemoData() {
  commit(fresh());
}

// ---------- Consultas (sempre filtradas pela conta, RN17 e SC-008) ----------

export const spaceById = (id: string): Space | undefined => SPACES.find((s) => s.id === id);
export const planById = (id: string): Plan | undefined => PLANS.find((p) => p.id === id);

export const bookingsOf = (d: DB, clientId: string) => d.bookings.filter((b) => b.clientId === clientId);
export const pointsOf = (d: DB, clientId: string) => d.points.filter((p) => p.clientId === clientId);

/** Plano ativo e dentro da vigência (RN13). Vencido equivale a avulso; troca ou renovação paga só
 *  conta a partir do início. */
export function activeSubscription(d: DB, clientId: string, now = new Date()) {
  const sub = d.subscriptions.find((s) => s.clientId === clientId && s.status === 'active' && new Date(s.start) <= now && new Date(s.end) > now);
  if (!sub) return null;
  const plan = planById(sub.planId);
  return plan ? { sub, plan } : null;
}

// ---------- Reservas (F03) ----------

export type NewBooking = {
  clientId: string;
  spaceId: string;
  start: Date;
  hours: number;
  useGreenPoints: boolean;
  arrivalMode: ArrivalMode | null;
  /** Protótipo: membro com cobrança vencida reserva como avulso (RN13). */
  overdue?: boolean;
};

export type CreateResult = { ok: true; booking: Booking } | { ok: false; reason: 'taken' | 'space' | 'points' };

/** Cria a reserva gravando os valores (RN06). Membro com plano ativo e sem pendência: confirmada;
 *  senão, aguardando pagamento (RN12, RN13). Usar pontos lança −100 no extrato (RN22). */
export function createBooking(input: NewBooking): CreateResult {
  const space = spaceById(input.spaceId);
  if (!space) return { ok: false, reason: 'space' };
  if (!isFree(space.id, input.start, input.hours, db.bookings)) return { ok: false, reason: 'taken' };
  const membership = input.overdue ? null : activeSubscription(db, input.clientId);
  const balance = pointsBalance(pointsOf(db, input.clientId));
  if (input.useGreenPoints && balance < GREEN_POINTS.redeemCost) return { ok: false, reason: 'points' };

  const now = new Date().toISOString();
  const price = priceBooking(space.hourly, input.hours, membership?.plan.discount ?? 0, input.useGreenPoints ? GREEN_POINTS.redeemDiscount : 0);
  const state = membership ? 'confirmed' : 'pending';
  const booking: Booking = {
    id: newId('bk'),
    code: `HB-${1100 + db.bookings.length}`,
    clientId: input.clientId,
    spaceId: space.id,
    start: input.start.toISOString(),
    end: new Date(input.start.getTime() + input.hours * 3600_000).toISOString(),
    state,
    createdAt: now,
    planName: membership?.plan.name ?? null,
    arrivalMode: input.arrivalMode,
    ...price,
  };
  const history: BookingHistory = { id: newId('hs'), bookingId: booking.id, from: null, to: state, at: now, by: 'client' };
  const redeem: PointsEntry[] = input.useGreenPoints
    ? [{ id: newId('pt'), clientId: input.clientId, date: now, kind: 'redeem', points: -GREEN_POINTS.redeemCost, label: `Resgate de desconto · ${space.name}`, bookingId: booking.id }]
    : [];
  commit({ ...db, bookings: [...db.bookings, booking], history: [...db.history, history], points: [...db.points, ...redeem] });
  return { ok: true, booking };
}

// ---------- Ciclo de vida da reserva (RN08) ----------

export type ActionResult = { ok: true; booking: Booking; points?: number } | { ok: false; reason: 'not_found' | 'state' | 'before_end' };

function transition(id: string, to: Booking['state'], by: BookingHistory['by'], patch: Partial<Booking> = {}, extraPoints: PointsEntry[] = []): Booking {
  const current = db.bookings.find((b) => b.id === id)!;
  const next: Booking = { ...current, ...patch, state: to };
  const at = new Date().toISOString();
  const history: BookingHistory[] = current.state === to ? [] : [{ id: newId('hs'), bookingId: id, from: current.state, to, at, by }];
  commit({
    ...db,
    bookings: db.bookings.map((b) => (b.id === id ? next : b)),
    history: [...db.history, ...history],
    points: [...db.points, ...extraPoints],
  });
  return next;
}

/** Cliente cancela (FR-007). Só reservas ativas que ainda não terminaram (RN08). Grava multa,
 *  retido, estorno e saldo de multa calculados pela RN07 no momento do cancelamento. */
export function cancelBooking(id: string, by: BookingHistory['by'] = 'client'): ActionResult {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return { ok: false, reason: 'not_found' };
  if (!isActive(b) || new Date(b.end) <= new Date()) return { ok: false, reason: 'state' };
  const q = cancellationQuote(b, new Date());
  const cancellation = { at: new Date().toISOString(), by, feePct: q.feePct, fee: q.fee, retained: q.retained, refund: q.refund, pendingFee: q.pendingFee };
  return { ok: true, booking: transition(id, 'cancelled', by, { cancellation }) };
}

/** Simulação da recepção: registra o pagamento integral (RN12). Pendente vira confirmada. */
export function registerPayment(id: string): ActionResult {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return { ok: false, reason: 'not_found' };
  if (!isActive(b)) return { ok: false, reason: 'state' };
  return { ok: true, booking: transition(id, 'confirmed', 'staff', { paid: b.finalPrice }) };
}

/** Simulação da recepção: concluir só depois do término (RN10). Lança +10 pontos e, a cada
 *  5 concluídas seguidas sem no-show nem multa, +20 (RN22). */
export function completeBooking(id: string): ActionResult {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return { ok: false, reason: 'not_found' };
  if (b.state !== 'confirmed') return { ok: false, reason: 'state' };
  if (new Date(b.end) > new Date()) return { ok: false, reason: 'before_end' };
  const at = new Date().toISOString();
  const space = spaceById(b.spaceId);
  const entries: PointsEntry[] = [{ id: newId('pt'), clientId: b.clientId, date: at, kind: 'completed', points: GREEN_POINTS.perCompleted, label: `Reserva concluída · ${space?.name ?? ''}`.trim(), bookingId: b.id }];
  // Sequência (RN22): esta conclusão soma 1 à sequência atual.
  const streak = currentStreak(db.bookings.filter((x) => x.clientId === b.clientId && x.id !== b.id)) + 1;
  if (streak % 5 === 0) entries.push({ id: newId('pt'), clientId: b.clientId, date: at, kind: 'streak', points: 20, label: 'Sequência de 5 reservas sem falta', bookingId: b.id });
  const booking = transition(id, 'completed', 'staff', {}, entries);
  return { ok: true, booking, points: entries.reduce((s, e) => s + e.points, 0) };
}

/** Simulação da recepção: não compareceu, só depois do término (RN10). Sem pontos (RN22). */
export function markNoShow(id: string): ActionResult {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return { ok: false, reason: 'not_found' };
  if (b.state !== 'confirmed') return { ok: false, reason: 'state' };
  if (new Date(b.end) > new Date()) return { ok: false, reason: 'before_end' };
  return { ok: true, booking: transition(id, 'no_show', 'staff') };
}

/** Simulação do sistema: o prazo de pagamento venceu (RN12). Cancelada sem multa. */
export function expireBooking(id: string): ActionResult {
  const b = db.bookings.find((x) => x.id === id);
  if (!b) return { ok: false, reason: 'not_found' };
  if (b.state !== 'pending') return { ok: false, reason: 'state' };
  const cancellation = { at: new Date().toISOString(), by: 'system' as const, feePct: 0, fee: 0, retained: 0, refund: b.paid ?? 0, pendingFee: 0 };
  return { ok: true, booking: transition(id, 'cancelled', 'system', { cancellation }) };
}

const ARRIVAL_NAME: Record<ArrivalMode, string> = { walk: 'a pé', bike: 'bicicleta', transit: 'transporte público', carpool: 'carona', electric: 'veículo elétrico' };

/** Simulação da recepção (RN23): confirma o meio de chegada informado. Reserva que já terminou e
 *  ainda está confirmada é concluída junto (a confirmação acontece ao concluir). Dá +5 pontos no
 *  máximo uma vez por cliente por dia. */
export function confirmArrival(id: string): { ok: true; points: number; completed: number; sameDay: boolean } | { ok: false } {
  const b = db.bookings.find((x) => x.id === id);
  if (!b?.arrivalMode || b.arrivalConfirmed) return { ok: false };
  let completed = 0;
  if (b.state === 'confirmed') {
    const r = completeBooking(id);
    if (!r.ok) return { ok: false };
    completed = r.points ?? 0;
  } else if (b.state !== 'completed') return { ok: false };
  const day = new Date(b.start).toDateString();
  const sameDay = db.points.some((p) => p.clientId === b.clientId && p.kind === 'clean_arrival' && p.bookingId && new Date(db.bookings.find((x) => x.id === p.bookingId)?.start ?? p.date).toDateString() === day);
  const entries: PointsEntry[] = sameDay ? [] : [{ id: newId('pt'), clientId: b.clientId, date: new Date().toISOString(), kind: 'clean_arrival', points: 5, label: `Chegada limpa: ${ARRIVAL_NAME[b.arrivalMode]}`, bookingId: b.id }];
  commit({ ...db, bookings: db.bookings.map((x) => (x.id === id ? { ...x, arrivalConfirmed: true } : x)), points: [...db.points, ...entries] });
  return { ok: true, points: sameDay ? 0 : 5, completed, sameDay };
}

/** Ação de protótipo: aproxima o início da reserva (a duração se mantém), para mostrar as faixas
 *  de multa da RN07 sem esperar o tempo passar. */
export function simulateStartIn(id: string, minutes: number): boolean {
  const b = db.bookings.find((x) => x.id === id);
  if (!b || !isActive(b)) return false;
  const start = new Date(Date.now() + minutes * 60_000);
  const end = new Date(start.getTime() + (new Date(b.end).getTime() - new Date(b.start).getTime()));
  commit({ ...db, bookings: db.bookings.map((x) => (x.id === id ? { ...x, start: start.toISOString(), end: end.toISOString() } : x)) });
  return true;
}

export const historyOf = (d: DB, bookingId: string) => d.history.filter((h) => h.bookingId === bookingId).sort((a, b) => a.at.localeCompare(b.at));

export const requestedSubscription = (d: DB, clientId: string) =>
  d.subscriptions.find((s) => s.clientId === clientId && s.status === 'requested') ?? null;

// ---------- Planos (F08, lado do cliente; RN13, RN19) ----------

const DAY = 86_400_000;

/** Plano já pago que começa depois do atual (troca ou renovação efetivada). */
export const scheduledSubscription = (d: DB, clientId: string, now = new Date()) =>
  d.subscriptions.find((s) => s.clientId === clientId && s.status === 'active' && new Date(s.start) > now) ?? null;

/** Plano Social recusado mais recente, quando não há outro pedido ou plano depois dele. */
export function lastRejected(d: DB, clientId: string) {
  const rejected = d.subscriptions.filter((s) => s.clientId === clientId && s.status === 'rejected').sort((a, b) => (b.requestedAt ?? '').localeCompare(a.requestedAt ?? ''));
  return rejected[0] ?? null;
}

function saveSubs(subscriptions: Subscription[]) {
  commit({ ...db, subscriptions });
}

export type PlanRequestInput = {
  clientId: string;
  planId: string;
  kind: 'new' | 'change' | 'renewal';
  social?: { category: SocialCategory; note?: string };
};

/** Cliente solicita contratação, troca ou renovação (FR-013). Sem efeito até a recepção registrar
 *  o pagamento; Plano Social passa antes pela análise da gerência (RN19). Um pedido por vez. */
export function requestPlan(input: PlanRequestInput): { ok: true; sub: Subscription } | { ok: false; reason: 'pending' | 'plan' } {
  const plan = planById(input.planId);
  if (!plan) return { ok: false, reason: 'plan' };
  if (requestedSubscription(db, input.clientId)) return { ok: false, reason: 'pending' };
  const now = new Date();
  const current = activeSubscription(db, input.clientId, now);
  const days = plan.days ?? PLAN_DAYS;
  // Troca e renovação começam no vencimento atual (RN13); contratação nova, quando a recepção efetivar.
  const start = input.kind !== 'new' && current ? new Date(current.sub.end) : now;
  const sub: Subscription = {
    id: newId('sub'),
    clientId: input.clientId,
    planId: plan.id,
    start: start.toISOString(),
    end: new Date(start.getTime() + days * DAY).toISOString(),
    status: 'requested',
    kind: input.kind,
    price: plan.price,
    requestedAt: now.toISOString(),
    ...(plan.social && input.social
      ? { social: { category: input.social.category, note: input.social.note?.trim().slice(0, SOCIAL_NOTE_MAX) || undefined, review: 'pending' as const } }
      : {}),
  };
  saveSubs([...db.subscriptions, sub]);
  return { ok: true, sub };
}

/** Cliente desiste de um pedido que ainda não teve efeito. */
export function withdrawRequest(subId: string) {
  saveSubs(db.subscriptions.map((s) => (s.id === subId && s.status === 'requested' ? { ...s, status: 'cancelled' } : s)));
}

/** Cancelar o plano só impede a renovação (RN13, MSG-21): o atual segue até o vencimento, sem
 *  devolução. Pedidos e trocas futuras também deixam de valer. */
export function cancelPlanRenewal(clientId: string) {
  const now = new Date();
  const current = activeSubscription(db, clientId, now);
  saveSubs(db.subscriptions.map((s) => {
    if (s.clientId !== clientId) return s;
    if (current && s.id === current.sub.id) return { ...s, cancelAtEnd: true };
    if (s.status === 'requested' || (s.status === 'active' && new Date(s.start) > now)) return { ...s, status: 'cancelled' };
    return s;
  }));
}

/** Desfaz o cancelamento antes do vencimento. */
export function keepPlan(clientId: string) {
  const current = activeSubscription(db, clientId);
  if (!current) return;
  saveSubs(db.subscriptions.map((s) => (s.id === current.sub.id ? { ...s, cancelAtEnd: false } : s)));
}

/** Simulação da gerência: aprova ou recusa a elegibilidade do Plano Social (RN19). */
export function reviewSocial(subId: string, approve: boolean, reason?: string) {
  const at = new Date().toISOString();
  saveSubs(db.subscriptions.map((s) => {
    if (s.id !== subId || !s.social) return s;
    return approve
      ? { ...s, social: { ...s.social, review: 'approved', reviewedAt: at } }
      : { ...s, status: 'rejected', social: { ...s.social, review: 'rejected', reviewedAt: at, reason } };
  }));
}

/** Simulação da recepção: registra o pagamento e efetiva o pedido (RN13). Plano Social só depois
 *  da aprovação da gerência. */
export function registerPlanPayment(subId: string): { ok: boolean; reason?: 'review' } {
  const s = db.subscriptions.find((x) => x.id === subId && x.status === 'requested');
  if (!s) return { ok: false };
  if (s.social && s.social.review !== 'approved') return { ok: false, reason: 'review' };
  const now = new Date();
  const days = planById(s.planId)?.days ?? PLAN_DAYS;
  const start = s.kind === 'new' ? now : new Date(s.start);
  const activated: Subscription = { ...s, status: 'active', start: start.toISOString(), end: new Date(start.getTime() + days * DAY).toISOString() };
  saveSubs(db.subscriptions.map((x) => (x.id === subId ? activated : x)));
  return { ok: true };
}

/** Ação de protótipo: leva o plano atual para perto do vencimento, para mostrar a renovação. */
export function simulateNearExpiry(clientId: string, days = 3) {
  const current = activeSubscription(db, clientId);
  if (!current) return;
  const end = new Date(Date.now() + days * DAY);
  end.setHours(23, 59, 0, 0);
  saveSubs(db.subscriptions.map((s) => (s.id === current.sub.id ? { ...s, end: end.toISOString() } : s)));
}
