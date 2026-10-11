import type { Booking, BookingState } from './types';

/** Rótulos dos estados (data-model, seção 2). */
export const STATE_LABEL: Record<BookingState, string> = {
  pending: 'Aguardando pagamento',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
  no_show: 'Não compareceu',
};

/** Reservas ativas (RN03): pendente ou confirmada. */
export const isActive = (b: Booking) => b.state === 'pending' || b.state === 'confirmed';

/** Próximas reservas ativas, da mais próxima para a mais distante. */
export function upcoming(bookings: Booking[], now: Date): Booking[] {
  return bookings
    .filter((b) => isActive(b) && new Date(b.end) > now)
    .sort((a, b) => a.start.localeCompare(b.start));
}

/** RN12: prazo de pagamento = o que vier primeiro entre 2 h após a criação e 1 h antes do início. */
export function paymentDeadline(b: Booking): Date {
  const twoHoursAfter = new Date(b.createdAt).getTime() + 2 * 3600_000;
  const oneHourBefore = new Date(b.start).getTime() - 3600_000;
  return new Date(Math.min(twoHoursAfter, oneHourBefore));
}

export const bookingHours = (b: Booking) => (new Date(b.end).getTime() - new Date(b.start).getTime()) / 3600_000;
