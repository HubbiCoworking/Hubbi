import { GREEN_POINTS } from '../data/catalog';
import type { Booking, PointsEntry } from './types';

/** RN22: saldo = soma do extrato (SC-012). */
export const pointsBalance = (entries: PointsEntry[]) => entries.reduce((sum, e) => sum + e.points, 0);

/** RN22: sequência atual = reservas concluídas seguidas, da mais recente para trás, até o
 *  primeiro não comparecimento ou cancelamento com multa. */
export function currentStreak(bookings: Booking[]): number {
  const closed = bookings
    .filter((x) => x.state === 'completed' || x.state === 'no_show' || (x.state === 'cancelled' && (x.cancellation?.fee ?? 0) > 0))
    .sort((x, y) => y.end.localeCompare(x.end));
  let streak = 0;
  for (const x of closed) { if (x.state !== 'completed') break; streak++; }
  return streak;
}

/** Pontos vencem 12 meses depois de ganhos (RN22). */
export const POINTS_VALID_MONTHS = 12;

/** Quanto falta para o próximo resgate de 100 pontos. */
export function redeemProgress(balance: number) {
  const cost = GREEN_POINTS.redeemCost;
  const canRedeem = balance >= cost;
  const progress = canRedeem ? cost : balance % cost;
  return { cost, canRedeem, progress, missing: canRedeem ? 0 : cost - progress };
}
