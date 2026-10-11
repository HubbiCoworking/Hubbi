import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Alert, ArrowLeft, Calendar, Check, Clock, Close, Leaf, MapPin } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { SpacePhoto } from '../../components/SpacePhoto';
import { StatusBadge } from '../../components/StatusBadge';
import { GREEN_POINTS } from '../../data/catalog';
import { bookingHours, isActive, paymentDeadline, STATE_LABEL } from '../../domain/booking';
import { cancellationQuote, formatTimeLeft, type CancelQuote } from '../../domain/cancellation';
import type { ArrivalMode, Booking, BookingHistory } from '../../domain/types';
import { daysBetween, ddmmyyyy, hhmm, longDay, shortDay } from '../../lib/dates';
import { brl, formatDuration, round2 } from '../../lib/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import {
  cancelBooking, completeBooking, expireBooking, historyOf, markNoShow, registerPayment, resetDemoData,
  sessionClient, simulateStartIn, spaceById, useDB, type ActionResult,
} from '../../store/store';

type ProtoAction = 'pay' | 'complete' | 'noshow' | 'expire' | 'in5h' | 'in90m' | 'reset';

const ARRIVAL_LABEL: Record<ArrivalMode, string> = {
  walk: 'A pé', bike: 'Bicicleta', transit: 'Transporte público', carpool: 'Carona', electric: 'Veículo elétrico',
};

const BY_LABEL: Record<BookingHistory['by'], string> = { client: 'você', staff: 'recepção', system: 'sistema' };

/** Texto de cada mudança da linha do tempo (RN09). */
function historyText(h: BookingHistory): string {
  if (h.from === null) return h.to === 'confirmed' ? 'Reserva criada e confirmada' : 'Reserva criada, aguardando pagamento';
  if (h.from === 'pending' && h.to === 'confirmed') return 'Pagamento registrado: reserva confirmada';
  if (h.to === 'cancelled') return h.by === 'system' ? 'Prazo de pagamento vencido: reserva cancelada sem multa' : 'Reserva cancelada';
  return STATE_LABEL[h.to];
}

/** T12 Detalhe da reserva + T18 Cancelar reserva (/app/bookings/:id).
 *  FR-005, FR-006, FR-007, FR-011; RN06–RN11. Textos: ui-messages, seções 4 e 5. */
export default function BookingDetail() {
  const { id } = useParams();
  const db = useDB();
  const client = sessionClient(db)!;
  const [params, setParams] = useSearchParams();
  // Só o dono vê a reserva (RN17, SC-008).
  const booking = db.bookings.find((b) => b.id === id && b.clientId === client.id);
  const space = booking ? spaceById(booking.spaceId) : undefined;
  useDocumentTitle(booking ? `Reserva ${booking.code} · Hubbi` : 'Reserva não encontrada · Hubbi');

  const [now, setNow] = useState(() => new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Vindo de "Cancelar" na lista (?cancel=1), abre o painel direto.
  useEffect(() => {
    if (params.get('cancel') === '1' && booking && isActive(booking)) setDialogOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!booking) {
    return (
      <div className="state-box" style={{ maxWidth: 560 }}>
        <span className="state-icon err" aria-hidden="true"><Alert /></span>
        <h1 className="h-like">Não encontramos essa reserva.</h1>
        <p className="muted">Ela pode ter sido feita em outra conta ou o endereço está incompleto.</p>
        <Link className="btn btn-primary" to="/app/bookings">Ver minhas reservas</Link>
      </div>
    );
  }

  const start = new Date(booking.start);
  const end = new Date(booking.end);
  const ended = end <= now;
  const active = isActive(booking);
  const canCancel = active && !ended;
  const paid = booking.paid ?? 0;
  const planOff = round2(booking.fullPrice - booking.finalPrice - booking.greenDiscount);
  const deadline = booking.state === 'pending' ? paymentDeadline(booking) : null;
  // A linha do tempo sempre começa pela criação; reservas de exemplo não têm esse registro (RN09).
  const recorded = historyOf(db, booking.id);
  const history: BookingHistory[] = (() => {
    if (recorded[0]?.from === null) return recorded;
    if (recorded.length) {
      return [{ id: 'created', bookingId: booking.id, from: null, to: recorded[0]!.from!, at: booking.createdAt, by: 'client' as const }, ...recorded];
    }
    // Sem histórico gravado: membro nasce confirmada e avulso, pendente (RN12, RN13).
    const initial = booking.planName ? 'confirmed' as const : 'pending' as const;
    const list: BookingHistory[] = [{ id: 'created', bookingId: booking.id, from: null, to: initial, at: booking.createdAt, by: 'client' }];
    if (booking.state !== initial) {
      const by = booking.cancellation?.by ?? (booking.state === 'cancelled' ? 'client' : 'staff');
      list.push({ id: 'last', bookingId: booking.id, from: initial, to: booking.state, at: booking.cancellation?.at ?? booking.end, by });
    }
    return list;
  })();
  const quote = cancellationQuote(booking, now);

  const finalReason = !active
    ? `Esta reserva não pode mais ser cancelada porque está ${STATE_LABEL[booking.state].toLowerCase()}.`
    : ended ? 'O horário desta reserva já passou. A recepção vai encerrá-la.' : '';

  const closeDialog = () => {
    setDialogOpen(false);
    if (params.get('cancel')) { const p = new URLSearchParams(params); p.delete('cancel'); setParams(p, { replace: true }); }
    window.requestAnimationFrame(() => cancelBtnRef.current?.focus());
  };

  const confirmCancel = () => {
    const r = cancelBooking(booking.id);
    setNow(new Date());
    setDialogOpen(false);
    if (params.get('cancel')) { const p = new URLSearchParams(params); p.delete('cancel'); setParams(p, { replace: true }); }
    if (r.ok) {
      const c = r.booking.cancellation!;
      setToast({ tone: 'ok', text: c.refund > 0 ? `Reserva cancelada. O estorno de ${brl(c.refund)} será registrado pela recepção.` : 'Reserva cancelada.' });
    } else {
      setToast({ tone: 'err', text: 'Não foi possível cancelar: a reserva mudou de estado. Confira os dados abaixo.' });
    }
  };

  // Ações da recepção simuladas na barra do protótipo (PRD 6.3).
  const protoStates: { id: ProtoAction; label: string }[] = [
    ...(active ? [{ id: 'pay' as const, label: paid >= booking.finalPrice ? 'Recepção: pagamento já registrado' : 'Recepção registra pagamento' }] : []),
    ...(booking.state === 'confirmed' ? [{ id: 'complete' as const, label: 'Recepção conclui' }, { id: 'noshow' as const, label: 'Recepção marca não compareceu' }] : []),
    ...(booking.state === 'pending' ? [{ id: 'expire' as const, label: 'Prazo de pagamento vence' }] : []),
    ...(canCancel ? [{ id: 'in5h' as const, label: 'Simular: faltam 5 h para o início' }, { id: 'in90m' as const, label: 'Simular: faltam 90 min para o início' }] : []),
    { id: 'reset', label: 'Restaurar dados de exemplo' },
  ];

  const onProto = (a: ProtoAction) => {
    if (a === 'reset') { resetDemoData(); setToast({ tone: 'ok', text: 'Dados de exemplo restaurados.' }); return; }
    if (a === 'in5h' || a === 'in90m') {
      simulateStartIn(booking.id, a === 'in5h' ? 300 : 90);
      setNow(new Date());
      setToast({ tone: 'ok', text: `Protótipo: a reserva agora começa em ${a === 'in5h' ? '5 horas' : '90 minutos'}.` });
      return;
    }
    let r: ActionResult;
    if (a === 'pay') {
      if (paid >= booking.finalPrice) { setToast({ tone: 'ok', text: 'O pagamento desta reserva já foi registrado.' }); return; }
      r = registerPayment(booking.id);
    } else if (a === 'complete') r = completeBooking(booking.id);
    else if (a === 'noshow') r = markNoShow(booking.id);
    else r = expireBooking(booking.id);
    setNow(new Date());
    if (!r.ok) {
      setToast({ tone: 'err', text: r.reason === 'before_end' ? `Só é possível encerrar a reserva depois do término (${hhmm(end)} de ${shortDay(end)}).` : 'Esta ação não vale para o estado atual da reserva.' });
      return;
    }
    const msg: Record<'pay' | 'complete' | 'noshow' | 'expire', string> = {
      pay: `Recepção registrou o pagamento de ${brl(r.booking.finalPrice)}.`,
      complete: `Reserva concluída. Você ganhou ${r.points ?? GREEN_POINTS.perCompleted} pontos verdes.`,
      noshow: 'Reserva marcada como não compareceu. Sem pontos nesta reserva.',
      expire: 'O prazo venceu: a reserva foi cancelada sem multa e o horário voltou a ficar livre.',
    };
    setToast({ tone: 'ok', text: msg[a] });
  };

  return (
    <>
      <div className="detail">
        <Link className="back-link" to="/app/bookings"><ArrowLeft />Minhas reservas</Link>

        <header className="dt-top">
          <div className="dt-title">
            <p className="conf-code">Reserva <b>{booking.code}</b></p>
            <h1>{space?.name ?? 'Espaço'}</h1>
            <p className="dt-when">
              <span><Calendar />{longDay(start)}</span>
              <span><Clock />{hhmm(start)} às {hhmm(end)} ({formatDuration(bookingHours(booking))})</span>
              {space && <span><MapPin />{space.kind}</span>}
            </p>
          </div>
          <StatusBadge state={booking.state} />
        </header>

        <div className="dt-grid">
          <div className="dt-main">
            {space && <SpacePhoto space={space} className="dt-photo" caption priority sizes="(min-width: 1024px) 55vw, 100vw" />}
            {deadline && !ended && (
              <p className="after-row warn"><Clock /><span><b>Aguardando pagamento.</b> Pague na recepção até {hhmm(deadline)}{daysBetween(now, deadline) === 0 ? ' de hoje' : ` de ${shortDay(deadline)}`}; depois disso a reserva é cancelada sem multa.</span></p>
            )}

            <section className="card" aria-labelledby="dt-values-t">
              <div className="card-head">
                <h2 id="dt-values-t">Valores gravados</h2>
                <span className="muted small">Na criação: {ddmmyyyy(new Date(booking.createdAt))}</span>
              </div>
              <dl className="bn-rows">
                <div><dt>Preço cheio</dt><dd>{brl(booking.fullPrice)}</dd></div>
                {booking.discountPct > 0 && <div className="minus"><dt>Desconto do plano {booking.planName} ({booking.discountPct}%)</dt><dd>− {brl(planOff)}</dd></div>}
                {booking.greenDiscount > 0 && <div className="minus"><dt>Pontos verdes ({GREEN_POINTS.redeemDiscount}%)</dt><dd>− {brl(booking.greenDiscount)}</dd></div>}
                <div className="sum"><dt>Total</dt><dd>{brl(booking.finalPrice)}</dd></div>
              </dl>
              <div className="pay-line">
                <span>Pagamento</span>
                {booking.state === 'cancelled' && !paid
                  ? <b className="muted">Nada pago</b>
                  : paid >= booking.finalPrice
                    ? <b className="ok-text"><Check />Pago · {brl(paid)}</b>
                    : <b className="warn-text"><Clock />Pendente na recepção · {brl(booking.finalPrice - paid)}</b>}
              </div>
              <p className="bn-frozen">O valor fica gravado na reserva: não muda se o preço do espaço ou o seu plano mudarem.</p>
            </section>

            {booking.cancellation && (
              <section className="card" aria-labelledby="dt-cancel-t">
                <h2 id="dt-cancel-t">Cancelamento</h2>
                <dl className="bn-rows">
                  <div><dt>Multa{booking.cancellation.feePct ? ` (${booking.cancellation.feePct}%)` : ''}</dt><dd>{booking.cancellation.fee ? brl(booking.cancellation.fee) : 'Sem multa'}</dd></div>
                  <div><dt>Valor retido</dt><dd>{brl(booking.cancellation.retained)}</dd></div>
                  {booking.cancellation.pendingFee > 0 && <div><dt>Cobrança de multa pendente</dt><dd>{brl(booking.cancellation.pendingFee)}</dd></div>}
                  <div><dt>Estorno</dt><dd>{brl(booking.cancellation.refund)}</dd></div>
                </dl>
                <p className="muted small">
                  Cancelada por {BY_LABEL[booking.cancellation.by]} em {ddmmyyyy(new Date(booking.cancellation.at))} às {hhmm(new Date(booking.cancellation.at))}.
                  {booking.cancellation.refund > 0 && ' A recepção registra a devolução do estorno.'}
                </p>
              </section>
            )}

            <section className="card" aria-labelledby="dt-time-t">
              <h2 id="dt-time-t">Linha do tempo</h2>
              <ol className="timeline">
                {history.map((h) => (
                  <li key={h.id}>
                    <span className={`tl-dot tl-${h.to}`} aria-hidden="true" />
                    <div>
                      <p className="tl-text">{historyText(h)}</p>
                      <p className="muted small">{shortDay(new Date(h.at))} às {hhmm(new Date(h.at))} · por {BY_LABEL[h.by]}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="dt-side">
            <section className="card" aria-labelledby="dt-actions-t">
              <h2 id="dt-actions-t">Ações</h2>
              {canCancel ? (
                <>
                  <p className="muted small">{quote.band === 'unpaid' ? 'Sem pagamento registrado: cancelar não gera multa.' : quote.feePct === 0 ? `Faltam ${formatTimeLeft(quote.msLeft)}: cancelar agora não gera multa.` : `Faltam ${formatTimeLeft(quote.msLeft)}: cancelar agora gera multa de ${quote.feePct}%.`}</p>
                  <button ref={cancelBtnRef} type="button" className="btn btn-danger-soft btn-block" onClick={() => setDialogOpen(true)}>Cancelar reserva</button>
                </>
              ) : (
                <p className="locked"><Alert /><span>{finalReason}</span></p>
              )}
              <Link className="btn btn-soft btn-block" to="/app/spaces">Reservar outro espaço</Link>
            </section>

            <section className="card" aria-labelledby="dt-green-t">
              <p className="eyebrow" id="dt-green-t"><Leaf className="inline-ic" />Hubbi Verde</p>
              <ul className="conf-notes">
                <li><Leaf /><span>Chegada: {booking.arrivalMode ? `${ARRIVAL_LABEL[booking.arrivalMode]}, a confirmar pela recepção` : 'não informada'}.</span></li>
                {booking.greenDiscount > 0 && <li><Leaf /><span>{GREEN_POINTS.redeemCost} pontos usados nesta reserva.</span></li>}
                <li><Leaf /><span>{booking.state === 'completed' ? `Reserva concluída: ${GREEN_POINTS.perCompleted} pontos lançados no extrato.` : booking.state === 'no_show' ? 'Não compareceu: sem pontos e a sequência recomeça.' : `Ao concluir, você ganha ${GREEN_POINTS.perCompleted} pontos.`}</span></li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {dialogOpen && <CancelDialog booking={booking} spaceName={space?.name ?? 'Espaço'} quote={quote} onClose={closeDialog} onConfirm={confirmCancel} />}

      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status">
          {toast.tone === 'ok' ? <Check /> : <Alert />}<span>{toast.text}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setToast(null)}><Close /></button>
        </div>
      )}
      <ProtoBar states={protoStates} active={null} onSelect={onProto} />
    </>
  );
}

/** T18: multa, retido e estorno aparecem ANTES do botão (SC-005). Textos MSG-12 a MSG-16. */
function CancelDialog({ booking, spaceName, quote, onClose, onConfirm }: {
  booking: Booking; spaceName: string; quote: CancelQuote; onClose: () => void; onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      // Mantém o foco dentro do painel.
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>('button')];
      const first = items[0]; const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const left = formatTimeLeft(quote.msLeft);
  const lead = {
    unpaid: 'Esta reserva ainda não foi paga. Cancelar não gera multa nem estorno.',
    free: `Faltam ${left} para o início. Cancelamento sem multa.`,
    half: `Faltam ${left} para o início. Multa de 50% do valor da reserva.`,
    full: `Faltam ${left} para o início. Multa de 100% do valor da reserva.`,
  }[quote.band];

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="cd-t" aria-describedby="cd-lead" ref={dialogRef}>
        <h2 id="cd-t">Cancelar a reserva da {spaceName}?</h2>
        <p className="muted">{shortDay(new Date(booking.start))} · {hhmm(new Date(booking.start))} às {hhmm(new Date(booking.end))} · {booking.code}</p>
        <p id="cd-lead" className={`cd-lead cd-lead--${quote.band}`}>{lead}</p>

        {quote.band !== 'unpaid' && (
          <dl className="bn-rows">
            <div><dt>Valor da reserva</dt><dd>{brl(booking.finalPrice)}</dd></div>
            <div><dt>Valor pago</dt><dd>{brl(quote.paid)}</dd></div>
            <div><dt>Multa ({quote.feePct}%)</dt><dd>{quote.fee ? `− ${brl(quote.fee)}` : brl(0)}</dd></div>
            {quote.pendingFee > 0 && <div><dt>Valor retido</dt><dd>{brl(quote.retained)}</dd></div>}
            {quote.pendingFee > 0 && <div><dt>Cobrança de multa pendente</dt><dd>{brl(quote.pendingFee)}</dd></div>}
            <div className="sum"><dt>Estorno</dt><dd>{brl(quote.refund)}</dd></div>
          </dl>
        )}

        {quote.pendingFee > 0 && (
          <p className="after-row warn"><Alert /><span>O valor pago cobre só parte da multa. {brl(quote.retained)} ficam retidos e {brl(quote.pendingFee)} viram uma cobrança pendente.</span></p>
        )}
        {quote.refund > 0 && <p className="muted small">A recepção registra a devolução do estorno.</p>}

        <div className="dialog-actions">
          <button ref={backRef} type="button" className="btn btn-soft" onClick={onClose}>Voltar</button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {quote.retained > 0 ? `Cancelar e reter ${brl(quote.retained)}` : 'Cancelar reserva'}
          </button>
        </div>
      </div>
    </div>
  );
}
