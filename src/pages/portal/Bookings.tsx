import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, ArrowRight, Calendar, ChevronRight, Clock } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { StatusBadge } from '../../components/StatusBadge';
import { bookingHours, isActive, paymentDeadline } from '../../domain/booking';
import type { Booking } from '../../domain/types';
import { daysBetween, hhmm, longDay, shortDay } from '../../lib/dates';
import { brl, formatDuration } from '../../lib/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { bookingsOf, resetDemoData, sessionClient, spaceById, useDB } from '../../store/store';

type Tab = 'upcoming' | 'past' | 'cancelled';
type Scenario = 'live' | 'loading' | 'empty' | 'error' | 'reset';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Próximas' },
  { id: 'past', label: 'Passadas' },
  { id: 'cancelled', label: 'Canceladas' },
];

const PROTO: { id: Scenario; label: string }[] = [
  { id: 'live', label: 'Dados da conta' },
  { id: 'loading', label: 'Carregando' },
  { id: 'empty', label: 'Conta sem reservas' },
  { id: 'error', label: 'Erro ao carregar' },
  { id: 'reset', label: 'Restaurar dados de exemplo' },
];

const EMPTY: Record<Tab, { title: string; text: string; cta?: boolean }> = {
  upcoming: { title: 'Você não tem reservas marcadas.', text: 'Escolha um espaço pelo que você precisa. O preço final aparece antes de confirmar.', cta: true },
  past: { title: 'Nenhuma reserva passada ainda.', text: 'Depois que você usar um espaço, a reserva aparece aqui com o valor que foi gravado.' },
  cancelled: { title: 'Nenhuma reserva cancelada.', text: 'Se você cancelar uma reserva, ela continua aqui com a multa ou o estorno.' },
};

/** Separa as reservas nas abas. Reserva ativa que já terminou fica em "Passadas" esperando a
 *  recepção encerrar (RN10): o estado não muda sozinho. */
function splitTabs(bookings: Booking[], now: Date): Record<Tab, Booking[]> {
  const upcoming = bookings.filter((b) => isActive(b) && new Date(b.end) > now).sort((a, b) => a.start.localeCompare(b.start));
  const past = bookings
    .filter((b) => b.state === 'completed' || b.state === 'no_show' || (isActive(b) && new Date(b.end) <= now))
    .sort((a, b) => b.start.localeCompare(a.start));
  const cancelled = bookings.filter((b) => b.state === 'cancelled').sort((a, b) => b.start.localeCompare(a.start));
  return { upcoming, past, cancelled };
}

/** T11 Minhas reservas (/app/bookings). FR-006, FR-011; RN08, RN09, RN12. */
export default function Bookings() {
  useDocumentTitle('Minhas reservas · Hubbi');
  const db = useDB();
  const client = sessionClient(db)!;
  const now = useMemo(() => new Date(), []);
  const [params, setParams] = useSearchParams();
  const tab: Tab = (['upcoming', 'past', 'cancelled'] as const).find((t) => t === params.get('tab')) ?? 'upcoming';
  const [scenario, setScenario] = useState<Exclude<Scenario, 'reset'>>('live');
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ upcoming: null, past: null, cancelled: null });

  const lists = useMemo(
    () => splitTabs(scenario === 'empty' ? [] : bookingsOf(db, client.id), now),
    [db, client.id, now, scenario],
  );

  const selectTab = (t: Tab, focus = false) => {
    const p = new URLSearchParams(params);
    if (t === 'upcoming') p.delete('tab'); else p.set('tab', t);
    setParams(p, { replace: true });
    if (focus) tabRefs.current[t]?.focus();
  };

  // Abas pelo teclado: setas, Home e End (padrão WAI-ARIA).
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: TABS.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    selectTab(TABS[(next + TABS.length) % TABS.length]!.id, true);
  };

  const onProto = (s: Scenario) => {
    if (s === 'reset') { resetDemoData(); setScenario('live'); return; }
    setScenario(s);
  };

  let body: ReactNode;
  if (scenario === 'loading') {
    body = <div className="bk-list" aria-busy="true" aria-label="Carregando reservas">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 112 }} />)}</div>;
  } else if (scenario === 'error') {
    body = (
      <div className="state-box" role="alert">
        <span className="state-icon err" aria-hidden="true"><Alert /></span>
        <h2>Não foi possível carregar suas reservas.</h2>
        <p className="muted">Confira sua conexão e tente de novo.</p>
        <button className="btn btn-primary" type="button" onClick={() => setScenario('live')}>Tentar de novo</button>
      </div>
    );
  } else if (lists[tab].length === 0) {
    const e = EMPTY[tab];
    body = (
      <div className="state-box">
        <span className="state-icon" aria-hidden="true"><Calendar /></span>
        <h2>{e.title}</h2>
        <p className="muted">{e.text}</p>
        {e.cta && <Link className="btn btn-primary" to="/app/spaces">Reservar um espaço <ArrowRight className="arrow" /></Link>}
      </div>
    );
  } else if (tab === 'upcoming') {
    // Próximas, agrupadas por dia.
    const groups = new Map<string, Booking[]>();
    for (const b of lists.upcoming) {
      const key = longDay(new Date(b.start));
      groups.set(key, [...(groups.get(key) ?? []), b]);
    }
    body = (
      <div className="bk-groups">
        {[...groups].map(([day, items]) => {
          const d = new Date(items[0]!.start);
          const rel = daysBetween(now, d);
          return (
            <section key={day} aria-label={day}>
              <h2 className="bk-day">{day}{rel <= 1 && <span className="when-chip">{rel === 0 ? 'hoje' : 'amanhã'}</span>}</h2>
              <ul className="bk-list">{items.map((b) => <BookingItem key={b.id} booking={b} now={now} />)}</ul>
            </section>
          );
        })}
      </div>
    );
  } else {
    body = <ul className="bk-list">{lists[tab].map((b) => <BookingItem key={b.id} booking={b} now={now} />)}</ul>;
  }

  const count = (t: Tab) => (scenario === 'loading' || scenario === 'error' ? null : lists[t].length);

  return (
    <>
      <div className="bookings">
        <header className="page-head">
          <div>
            <h1>Minhas reservas</h1>
            <p className="sub">Acompanhe o estado de cada reserva, o valor gravado e, se precisar, cancele vendo a multa antes.</p>
          </div>
          <Link className="btn btn-primary" to="/app/spaces">Reservar um espaço <ArrowRight className="arrow" /></Link>
        </header>

        <div className="tabs" role="tablist" aria-label="Reservas por situação">
          {TABS.map((t) => (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[t.id] = el; }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="tab-panel"
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => selectTab(t.id)}
              onKeyDown={onTabKey}
            >
              {t.label}
              {count(t.id) !== null && <span className="tab-count">{count(t.id)}<span className="sr-only"> {count(t.id) === 1 ? 'reserva' : 'reservas'}</span></span>}
            </button>
          ))}
        </div>

        <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="tab-panel">
          {body}
        </div>
      </div>
      <ProtoBar states={PROTO} active={scenario} onSelect={onProto} />
    </>
  );
}

function BookingItem({ booking, now }: { booking: Booking; now: Date }) {
  const space = spaceById(booking.spaceId);
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const active = isActive(booking);
  const ended = end <= now;
  const [weekday, date] = shortDay(start).split(', ');
  const deadline = booking.state === 'pending' && !ended ? paymentDeadline(booking) : null;

  return (
    <li className={`bk-item bk-item--${booking.state}`}>
      <span className="date-block" aria-hidden="true"><b>{date?.slice(0, 2)}</b><span>{weekday}</span></span>
      <div className="bk-main">
        <div className="bk-title">
          <h3>{space?.name ?? 'Espaço'}</h3>
          <StatusBadge state={booking.state} />
        </div>
        <p className="bk-meta">
          <span><Calendar />{shortDay(start)}</span>
          <span><Clock />{hhmm(start)} às {hhmm(end)} ({formatDuration(bookingHours(booking))})</span>
        </p>
        {deadline && (
          <p className="bk-note warn"><Alert />Pague na recepção até {hhmm(deadline)}{daysBetween(now, deadline) === 0 ? ' de hoje' : ` de ${shortDay(deadline)}`}.</p>
        )}
        {active && ended && <p className="bk-note">O horário já passou. A recepção ainda vai encerrar esta reserva.</p>}
      </div>
      <div className="bk-side">
        <p className="bk-price"><b>{brl(booking.finalPrice)}</b>{booking.discountPct > 0 && <small>com {booking.discountPct}% do plano</small>}</p>
        <div className="bk-actions">
          {active && !ended && (
            <Link className="btn btn-danger-soft" to={`/app/bookings/${booking.id}?cancel=1`} aria-label={`Cancelar reserva da ${space?.name ?? 'reserva'} em ${shortDay(start)}`}>Cancelar</Link>
          )}
          <Link className="btn btn-soft" to={`/app/bookings/${booking.id}`} aria-label={`Ver detalhes da reserva ${booking.code}`}>Detalhes <ChevronRight /></Link>
        </div>
      </div>
    </li>
  );
}
