import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, ArrowRight, Calendar, ChevronRight, Clock, MapPin } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { StatusBadge } from '../../components/StatusBadge';
import type { Plan } from '../../data/catalog';
import { paymentDeadline, upcoming } from '../../domain/booking';
import { pointsBalance, redeemProgress } from '../../domain/points';
import { priceBooking } from '../../domain/pricing';
import type { Booking, PointsEntry, Subscription } from '../../domain/types';
import { atBusinessDay, daysBetween, ddmmyyyy, hhmm, longDay, relativeDay, shortDay } from '../../lib/dates';
import { brl, falta } from '../../lib/format';
import { cssVars } from '../../lib/style';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import {
  activeSubscription, bookingsOf, pointsOf, requestedSubscription, resetDemoData, sessionClient, spaceById, useDB,
} from '../../store/store';

type Scenario = 'live' | 'pending' | 'empty' | 'loading';

const PROTO: { id: Scenario | 'reset'; label: string }[] = [
  { id: 'live', label: 'Dados da conta' },
  { id: 'pending', label: 'Avulso com pagamento pendente' },
  { id: 'empty', label: 'Conta nova, sem reservas' },
  { id: 'loading', label: 'Carregando' },
  { id: 'reset', label: 'Restaurar dados de exemplo' },
];

const NEEDS = [
  { id: 'meeting', label: 'Reunião de equipe' },
  { id: 'focus', label: 'Foco individual' },
  { id: 'dev', label: 'Desenvolvimento' },
  { id: 'creative', label: 'Criativo e marketing' },
];

type View = {
  bookings: Booking[];
  membership: { sub: Subscription; plan: Plan } | null;
  requested: boolean;
  points: PointsEntry[];
};

/** Cenário de protótipo: cliente avulso com uma reserva aguardando pagamento (RN12). */
function pendingScenario(clientId: string, now: Date): View {
  // Início dentro do funcionamento (RN04): hoje às 15h se ainda der tempo, senão o próximo dia útil às 10h.
  const start = now.getHours() < 12 ? atBusinessDay(now, 0, 15) : atBusinessDay(now, 1, 10);
  const space = spaceById('sala-ruby')!;
  const booking: Booking = {
    id: 'demo_pending', code: 'HB-2001', clientId, spaceId: space.id,
    start: start.toISOString(), end: new Date(start.getTime() + 2 * 3600_000).toISOString(),
    state: 'pending', createdAt: new Date(now.getTime() - 20 * 60_000).toISOString(), planName: null,
    ...priceBooking(space.hourly, 2, 0),
  };
  return { bookings: [booking], membership: null, requested: false, points: [] };
}

/** T45 Início do portal (/app). FR-003; RN13, RN12, RN22. */
export default function Home() {
  useDocumentTitle('Início · Hubbi');
  const db = useDB();
  const client = sessionClient(db)!;
  const [scenario, setScenario] = useState<Scenario>('live');
  const now = useMemo(() => new Date(), []);

  const view: View = useMemo(() => {
    if (scenario === 'pending') return pendingScenario(client.id, now);
    if (scenario === 'empty') return { bookings: [], membership: null, requested: false, points: [] };
    return {
      bookings: bookingsOf(db, client.id),
      membership: activeSubscription(db, client.id, now),
      requested: requestedSubscription(db, client.id) !== null,
      points: pointsOf(db, client.id),
    };
  }, [scenario, db, client.id, now]);

  const next = upcoming(view.bookings, now);
  const [first, ...rest] = next;
  const firstName = client.name.split(/\s+/)[0];
  const balance = pointsBalance(view.points);

  const onProto = (id: Scenario | 'reset') => {
    if (id === 'reset') { resetDemoData(); setScenario('live'); return; }
    setScenario(id);
  };

  return (
    <>
      <div className="home">
        <header className="page-head">
          <div>
            <p className="today">{longDay(now)}</p>
            <h1>Olá, {firstName}.</h1>
            <p className="sub">
              {view.membership
                ? `Você é membro do plano ${view.membership.plan.name}: ${view.membership.plan.discount}% de desconto em toda reserva.`
                : 'Você reserva pagando o valor cheio. Com um plano, paga de 10% a 30% menos.'}
            </p>
          </div>
          <Link className="btn btn-primary" to="/app/spaces">Reservar um espaço <ArrowRight className="arrow" /></Link>
        </header>

        {scenario === 'loading' ? (
          <HomeSkeleton />
        ) : (
          <div className="home-grid">
            <div className="col-main">
              {first ? <NextBooking booking={first} now={now} /> : <NoBookings />}
              {first && (
                <section className="card" aria-labelledby="after-t">
                  <div className="card-head">
                    <h2 id="after-t">Depois dessa</h2>
                    <Link to="/app/bookings">Ver todas as reservas <ChevronRight /></Link>
                  </div>
                  {rest.length ? (
                    <ul className="booking-list">
                      {rest.slice(0, 4).map((b) => <BookingRow key={b.id} booking={b} />)}
                    </ul>
                  ) : (
                    <p className="muted">Nenhuma outra reserva marcada.</p>
                  )}
                </section>
              )}
            </div>

            <div className="col-side">
              <PlanCard membership={view.membership} requested={view.requested} now={now} />
              <PointsCard balance={balance} />
              <section className="card" aria-labelledby="needs-t">
                <h2 id="needs-t">Precisa de um espaço para…</h2>
                <div className="needs">
                  {NEEDS.map((n) => <Link key={n.id} className="need" to={`/app/spaces?need=${n.id}`}>{n.label}</Link>)}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
      <ProtoBar states={PROTO} active={scenario} onSelect={onProto} />
    </>
  );
}

function NextBooking({ booking, now }: { booking: Booking; now: Date }) {
  const space = spaceById(booking.spaceId);
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const deadline = booking.state === 'pending' ? paymentDeadline(booking) : null;
  const deadlineDay = deadline && daysBetween(now, deadline) === 0 ? 'hoje' : deadline ? shortDay(deadline) : '';

  return (
    <section className="next" aria-labelledby="next-t">
      <div className="next-top">
        <p>Sua próxima reserva</p>
        <span className="when-pill">{relativeDay(start, now)}</span>
      </div>
      <h2 id="next-t">{space?.name ?? 'Espaço'}</h2>
      <ul className="next-meta">
        <li><Calendar />{longDay(start)}</li>
        <li><Clock />{hhmm(start)} às {hhmm(end)}</li>
        {space && <li><MapPin />{space.kind}</li>}
      </ul>
      <div className="next-foot">
        <div>
          <StatusBadge state={booking.state} />
          <p className="next-price">
            <b>{brl(booking.finalPrice)}</b>
            {booking.discountPct > 0 ? ` com ${booking.discountPct}% do plano ${booking.planName}` : ' · valor cheio'}
          </p>
        </div>
        <Link className="btn btn-light" to={`/app/bookings/${booking.id}`}>Ver detalhes</Link>
      </div>
      {deadline && (
        <p className="next-alert" role="note">
          <Alert />
          <span>Pague na recepção até <b>{hhmm(deadline)} de {deadlineDay}</b>. Sem pagamento nesse prazo, o horário volta a ficar livre, sem multa.</span>
        </p>
      )}
    </section>
  );
}

function NoBookings() {
  return (
    <section className="card empty" aria-labelledby="empty-t">
      <span className="empty-icon" aria-hidden="true"><Calendar /></span>
      <h2 id="empty-t">Você ainda não tem reservas.</h2>
      <p className="muted">Escolha um espaço pelo que você precisa. O preço final aparece antes de confirmar.</p>
      <Link className="btn btn-primary" to="/app/spaces">Escolher meu espaço <ArrowRight className="arrow" /></Link>
    </section>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const [weekday, date] = shortDay(start).split(', ');
  return (
    <li>
      <Link to={`/app/bookings/${booking.id}`}>
        <span className="date-block" aria-hidden="true"><b>{date?.slice(0, 2)}</b><span>{weekday}</span></span>
        <span className="row-main">
          <b>{spaceById(booking.spaceId)?.name}</b>
          <span>{shortDay(start)} · {hhmm(start)} às {hhmm(end)}</span>
        </span>
        <StatusBadge state={booking.state} />
        <ChevronRight className="chev" />
      </Link>
    </li>
  );
}

function PlanCard({ membership, requested, now }: { membership: View['membership']; requested: boolean; now: Date }) {
  if (membership) {
    const end = new Date(membership.sub.end);
    const days = daysBetween(now, end);
    return (
      <section className="card plan-card" aria-labelledby="plan-t">
        <p className="eyebrow">Seu plano</p>
        <h2 id="plan-t">{membership.plan.name}</h2>
        <p className="big">{membership.plan.discount}%<small>de desconto em toda reserva</small></p>
        <p className={`muted${days <= 5 ? ' warn' : ''}`}>Vence {days === 0 ? 'hoje' : `em ${days} dias`} ({ddmmyyyy(end)}).</p>
        <Link className="link-row" to="/app/plan">Ver meu plano <ChevronRight /></Link>
      </section>
    );
  }
  return (
    <section className="card plan-card" aria-labelledby="plan-t">
      <p className="eyebrow">Seu plano</p>
      <h2 id="plan-t">{requested ? 'Pedido em análise' : 'Você está sem plano'}</h2>
      <p className="muted">
        {requested
          ? 'A recepção ativa o plano quando registrar o pagamento.'
          : 'Membros pagam de 10% a 30% menos em toda reserva. Estudantes, microempreendedores e ONGs têm o Plano Social.'}
      </p>
      <Link className="link-row" to="/app/plan">{requested ? 'Ver meu pedido' : 'Conhecer os planos'} <ChevronRight /></Link>
    </section>
  );
}

function PointsCard({ balance }: { balance: number }) {
  const { cost, canRedeem, progress, missing } = redeemProgress(balance);
  return (
    <section className="card points-card" aria-labelledby="pts-t">
      <p className="eyebrow" id="pts-t">Hubbi Verde</p>
      <p className="points"><b>{balance}</b> pontos verdes</p>
      <div className="bar" role="img" aria-label={`${progress} de ${cost} pontos para o próximo desconto`}>
        <i style={cssVars({ width: `${(progress / cost) * 100}%` })} />
      </div>
      <p className="muted">
        {balance === 0
          ? 'Conclua sua primeira reserva para ganhar 10 pontos.'
          : canRedeem
            ? 'Você já pode trocar 100 pontos por 10% de desconto na próxima reserva.'
            : `${falta(missing)} ${missing} ${missing === 1 ? 'ponto' : 'pontos'} para 10% de desconto numa reserva.`}
      </p>
      <Link className="link-row" to="/app/rewards">Ver extrato <ChevronRight /></Link>
    </section>
  );
}

function HomeSkeleton() {
  return (
    <div className="home-grid" aria-busy="true" aria-label="Carregando o início">
      <div className="col-main">
        <div className="skeleton" style={{ height: 260 }} />
        <div className="skeleton" style={{ height: 220 }} />
      </div>
      <div className="col-side">
        <div className="skeleton" style={{ height: 190 }} />
        <div className="skeleton" style={{ height: 170 }} />
      </div>
    </div>
  );
}
