import type { Booking } from './types';
import { isActive } from './booking';

/* Padrões ajustáveis da spec 001 (Assumptions): segunda a sábado, 07h às 22h, de 1 h a 8 h em
   passos de 30 min; no portal, antecedência mínima de 1 h (RN12). */
export const OPENING = { open: 7, close: 22, days: [1, 2, 3, 4, 5, 6], minHours: 1, maxHours: 8, stepMinutes: 30, minAdvanceMinutes: 60 } as const;

export type WindowProblem = 'closed' | 'duration' | 'advance';

/** RN04, RN05 e RN12: a janela pedida vale para qualquer espaço? */
export function checkWindow(start: Date, hours: number, now: Date): WindowProblem | null {
  const steps = (hours * 60) / OPENING.stepMinutes;
  if (hours < OPENING.minHours || hours > OPENING.maxHours || !Number.isInteger(steps)) return 'duration';
  const end = new Date(start.getTime() + hours * 3600_000);
  const openAt = new Date(start); openAt.setHours(OPENING.open, 0, 0, 0);
  const closeAt = new Date(start); closeAt.setHours(OPENING.close, 0, 0, 0);
  if (!(OPENING.days as readonly number[]).includes(start.getDay()) || start < openAt || end > closeAt) return 'closed';
  if (start.getTime() - now.getTime() < OPENING.minAdvanceMinutes * 60_000) return 'advance';
  return null;
}

/** RN03: há reserva ativa do espaço que se sobreponha? Fim de uma e início de outra no mesmo instante não conta. */
export function isFree(spaceId: string, start: Date, hours: number, bookings: Booking[]): boolean {
  const s = start.getTime();
  const e = s + hours * 3600_000;
  return !bookings.some((b) => b.spaceId === spaceId && isActive(b) && new Date(b.start).getTime() < e && new Date(b.end).getTime() > s);
}

/** Horários de início possíveis no dia, em passos de 30 min. */
export function startTimes(hours: number): string[] {
  const out: string[] = [];
  for (let m = OPENING.open * 60; m + hours * 60 <= OPENING.close * 60; m += OPENING.stepMinutes) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

/** Junta "AAAA-MM-DD" e "HH:MM" numa data local. */
export function toDate(day: string, time: string): Date {
  const [y, mo, d] = day.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return new Date(y!, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, 0, 0);
}

export const toDayString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
