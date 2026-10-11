import { round2 } from '../lib/format';
import type { Booking } from './types';

/** Faixas da RN07 (MSG-12 a MSG-15). */
export type CancelBand = 'unpaid' | 'free' | 'half' | 'full';

export type CancelQuote = {
  band: CancelBand;
  msLeft: number;
  feePct: number;
  fee: number;
  paid: number;
  /** Parte do valor pago que fica retida como multa. */
  retained: number;
  /** Valor pago menos a multa, que a equipe devolve (RN11). */
  refund: number;
  /** Multa que o valor pago não cobre e vira cobrança pendente (RN07, MSG-16). */
  pendingFee: number;
};

const H = 3600_000;

/** RN07 e RN11: calcula multa, retido, estorno e saldo de multa ANTES de cancelar (SC-005). */
export function cancellationQuote(b: Booking, now: Date): CancelQuote {
  const paid = b.paid ?? 0;
  const msLeft = new Date(b.start).getTime() - now.getTime();
  // Pendente sem pagamento: sem multa e sem estorno.
  if (b.state === 'pending' && paid === 0) {
    return { band: 'unpaid', msLeft, feePct: 0, fee: 0, paid, retained: 0, refund: 0, pendingFee: 0 };
  }
  const feePct = msLeft >= 24 * H ? 0 : msLeft >= 2 * H ? 50 : 100;
  const band: CancelBand = feePct === 0 ? 'free' : feePct === 50 ? 'half' : 'full';
  const fee = round2((b.finalPrice * feePct) / 100);
  return {
    band, msLeft, feePct, fee, paid,
    retained: Math.min(paid, fee),
    refund: round2(Math.max(0, paid - fee)),
    pendingFee: round2(Math.max(0, fee - paid)),
  };
}

/** "2 dias e 3 h", "5 h 20 min", "45 min" */
export function formatTimeLeft(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days} dia${days > 1 ? 's' : ''}${hours ? ` e ${hours} h` : ''}`;
  if (hours > 0) return `${hours} h${mins ? ` ${mins} min` : ''}`;
  return `${mins} min`;
}
