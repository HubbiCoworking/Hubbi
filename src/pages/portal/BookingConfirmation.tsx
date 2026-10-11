import { Link, useParams } from 'react-router-dom';
import { Alert, ArrowRight, Calendar, Check, Clock, Leaf, MapPin } from '../../components/Icons';
import { SpacePhoto } from '../../components/SpacePhoto';
import { StatusBadge } from '../../components/StatusBadge';
import { GREEN_POINTS } from '../../data/catalog';
import { bookingHours, paymentDeadline } from '../../domain/booking';
import type { ArrivalMode } from '../../domain/types';
import { daysBetween, hhmm, longDay, shortDay } from '../../lib/dates';
import { brl, formatDuration, round2 } from '../../lib/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { sessionClient, spaceById, useDB } from '../../store/store';

const ARRIVAL_LABEL: Record<ArrivalMode, string> = {
  walk: 'a pé', bike: 'de bicicleta', transit: 'de transporte público', carpool: 'de carona', electric: 'de veículo elétrico',
};

/** T08 Reserva feita (/app/bookings/:id/confirmation). FR-004; RN06, RN09, RN12, RN13. Textos: ui-messages, seção 2. */
export default function BookingConfirmation() {
  const { id } = useParams();
  const db = useDB();
  const client = sessionClient(db)!;
  // Só o dono vê a reserva (RN17, SC-008); de outra conta, a resposta é a mesma de "não existe".
  const booking = db.bookings.find((b) => b.id === id && b.clientId === client.id);
  useDocumentTitle(booking ? 'Reserva feita · Hubbi' : 'Reserva não encontrada · Hubbi');

  if (!booking) {
    return (
      <div className="state-box" style={{ maxWidth: 560 }}>
        <span className="state-icon err" aria-hidden="true"><Alert /></span>
        <h1 className="h-like">Não encontramos essa reserva.</h1>
        <p className="muted">Ela pode ter sido feita em outra conta ou o endereço está incompleto.</p>
        <Link className="btn btn-primary" to="/app">Ir para o início</Link>
      </div>
    );
  }

  const space = spaceById(booking.spaceId);
  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const now = new Date();
  const pending = booking.state === 'pending';
  const deadline = pending ? paymentDeadline(booking) : null;
  const deadlineText = deadline ? `${hhmm(deadline)}${daysBetween(now, deadline) === 0 ? ' de hoje' : ` de ${shortDay(deadline)}`}` : '';
  const planOff = round2(booking.fullPrice - booking.finalPrice - booking.greenDiscount);

  return (
    <div className="confirmation">
      <header className="conf-top">
        <div className={`conf-icon${pending ? ' warn' : ''}`} aria-hidden="true">{pending ? <Clock /> : <Check />}</div>
        <div className="conf-title">
          <p className="conf-code">Reserva <b>{booking.code}</b></p>
          <h1 id="conf-t">{pending ? 'Reserva feita. Falta o pagamento.' : 'Reserva confirmada.'}</h1>
          <p className="conf-sub" role="status">
            {pending
              ? <>Pague na recepção até <b>{deadlineText}</b> para confirmar; depois disso ela é cancelada sem multa.</>
              : <>A cobrança de <b>{brl(booking.finalPrice)}</b> fica pendente para a recepção registrar. Você não precisa fazer nada agora.</>}
          </p>
        </div>
      </header>

      <section className="conf-details" aria-labelledby="conf-space-t">
        <div className="conf-head">
          <div>
            <h2 id="conf-space-t">{space?.name ?? 'Espaço'}</h2>
            {space && <p className="muted"><MapPin className="inline-ic" />{space.kind}</p>}
          </div>
          <StatusBadge state={booking.state} />
        </div>
        {space && <SpacePhoto space={space} className="conf-photo" caption sizes="(min-width: 1024px) 55vw, 100vw" />}
        <div className="bn-when">
          <p><Calendar />{longDay(start)}</p>
          <p><Clock />{hhmm(start)} às {hhmm(end)} <span className="muted">({formatDuration(bookingHours(booking))})</span></p>
        </div>
        <dl className="bn-rows">
          <div><dt>Preço cheio</dt><dd>{brl(booking.fullPrice)}</dd></div>
          {booking.discountPct > 0 && <div className="minus"><dt>Desconto do plano {booking.planName} ({booking.discountPct}%)</dt><dd>− {brl(planOff)}</dd></div>}
          {booking.greenDiscount > 0 && <div className="minus"><dt>Pontos verdes ({GREEN_POINTS.redeemDiscount}%)</dt><dd>− {brl(booking.greenDiscount)}</dd></div>}
          <div className="sum"><dt>Total</dt><dd>{brl(booking.finalPrice)}</dd></div>
        </dl>
        <p className="bn-frozen">Valor gravado na reserva: não muda se o preço do espaço ou o seu plano mudarem.</p>
      </section>

      <aside className="card conf-aside" aria-labelledby="conf-next-t">
        <h2 id="conf-next-t">Próximos passos</h2>
        <ul className="conf-notes">
          {booking.greenDiscount > 0 && <li><Leaf /><span>Você usou {GREEN_POINTS.redeemCost} pontos verdes nesta reserva.</span></li>}
          {booking.arrivalMode && <li><Leaf /><span>Você disse que vai chegar {ARRIVAL_LABEL[booking.arrivalMode]}. Quando a recepção confirmar, você ganha mais 5 pontos.</span></li>}
          <li><Leaf /><span>Ao concluir a reserva, você ganha {GREEN_POINTS.perCompleted} pontos verdes.</span></li>
          <li><Calendar /><span>Precisa cancelar? Com 24 h ou mais de antecedência, não há multa. Você vê o valor antes de confirmar.</span></li>
        </ul>
        <div className="conf-actions">
          <Link className="btn btn-primary" to={`/app/bookings/${booking.id}`}>Ver detalhes da reserva <ArrowRight className="arrow" /></Link>
          <Link className="btn btn-soft" to="/app">Ir para o início</Link>
          <Link className="link-row" to="/app/spaces">Reservar outro espaço</Link>
        </div>
      </aside>
    </div>
  );
}
