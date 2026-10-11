import { STATE_LABEL } from '../domain/booking';
import type { BookingState } from '../domain/types';
import { Alert, Check, CheckDouble, Clock, Close } from './Icons';

const ICON: Record<BookingState, JSX.Element> = {
  pending: <Clock />,
  confirmed: <Check />,
  completed: <CheckDouble />,
  cancelled: <Close />,
  no_show: <Alert />,
};

/** Selo de estado da reserva: sempre texto + ícone + cor (design.md 7.3). */
export function StatusBadge({ state }: { state: BookingState }) {
  return (
    <span className={`status status--${state}`}>
      {ICON[state]}
      {STATE_LABEL[state]}
    </span>
  );
}
