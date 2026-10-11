import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, ArrowLeft, Calendar, Check, Clock, Leaf, MapPin } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { SpacePhoto } from '../../components/SpacePhoto';
import { GREEN_POINTS, LATE_CANCEL_FEE, spaceTags } from '../../data/catalog';
import { checkWindow, isFree, OPENING, startTimes, toDate, toDayString, type WindowProblem } from '../../domain/availability';
import { paymentDeadline } from '../../domain/booking';
import { pointsBalance } from '../../domain/points';
import { priceBooking } from '../../domain/pricing';
import type { ArrivalMode, Booking } from '../../domain/types';
import { daysBetween, hhmm, longDay, shortDay } from '../../lib/dates';
import { brl, falta, formatDuration, round2 } from '../../lib/format';
import { useReducedMotion, useReplayClass } from '../../lib/motion';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { draftTotals, emptyDraft, type ExtrasDraft } from '../../domain/extras';
import type { Purpose } from '../../domain/types';
import { ExtrasCard, MSG_SEPARATE } from '../../features/portal/extras/Extras';
import { activeSubscription, createBooking, pointsOf, sessionClient, spaceById, useDB } from '../../store/store';

type Scenario = 'live' | 'overdue' | 'taken' | 'confirming';

const PROTO: { id: Scenario; label: string }[] = [
  { id: 'live', label: 'Dados da conta' },
  { id: 'overdue', label: 'Membro com cobrança vencida' },
  { id: 'taken', label: 'Horário ocupado ao confirmar' },
  { id: 'confirming', label: 'Confirmando' },
];

const ARRIVAL: { id: ArrivalMode; label: string }[] = [
  { id: 'walk', label: 'A pé' },
  { id: 'bike', label: 'Bicicleta' },
  { id: 'transit', label: 'Transporte público' },
  { id: 'carpool', label: 'Carona' },
  { id: 'electric', label: 'Veículo elétrico' },
];

const pad = (h: number) => `${String(h).padStart(2, '0')}:00`;
const PROBLEM_TEXT: Record<WindowProblem, string> = {
  closed: `O espaço funciona das ${pad(OPENING.open)} às ${pad(OPENING.close)}, de segunda a sábado. A reserva precisa começar e terminar no mesmo dia, dentro desse horário.`,
  duration: `A duração deve ser de ${OPENING.minHours} h a ${OPENING.maxHours} h, em intervalos de ${OPENING.stepMinutes} minutos.`,
  advance: 'No portal, a reserva precisa começar com pelo menos 1 hora de antecedência. Escolha outro horário ou procure a recepção.',
};

const PURPOSE_IDS: Purpose[] = ['meeting', 'focus', 'dev', 'creative', 'other'];

/** T07 Resumo da reserva (/app/bookings/new). FR-004, FR-005, FR-025, FR-026;
 *  RN02–RN07, RN12, RN13, RN22, RN23. Comodidades: spec 002, FR-027 a FR-031. Textos: ui-messages, seção 2. */
export default function BookingNew() {
  useDocumentTitle('Resumo da reserva · Hubbi');
  const db = useDB();
  const client = sessionClient(db)!;
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const now = useMemo(() => new Date(), []);

  const space = spaceById(params.get('space') ?? '');
  const date = params.get('date') ?? '';
  const start = params.get('start') ?? '';
  const hours = Number(params.get('hours'));
  const startDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && /^\d{2}:\d{2}$/.test(start) ? toDate(date, start) : null;

  const [scenario, setScenario] = useState<Scenario>('live');
  const [usePoints, setUsePoints] = useState(false);
  const [arrival, setArrival] = useState<ArrivalMode | null>(null);
  const [taken, setTaken] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // Finalidade vem do atalho usado na busca (RN24); pessoas começam nos lugares do espaço (RN26).
  const [extras, setExtras] = useState<ExtrasDraft>(() =>
    emptyDraft(space?.seats ?? 1, PURPOSE_IDS.find((p) => p === params.get('need')) ?? null));
  const alertRef = useRef<HTMLDivElement>(null);
  const [formRef, shake] = useReplayClass<HTMLFormElement>('shake', reduce);

  const backToSpaces = `/app/spaces?date=${date}&start=${start}&hours=${hours || 2}`;

  // Pedido incompleto ou espaço inexistente (MSG-07).
  if (!space || !startDate || !hours) {
    return (
      <div className="state-box" style={{ maxWidth: 560 }}>
        <span className="state-icon err" aria-hidden="true"><Alert /></span>
        <h1 className="h-like">Este espaço não está disponível para reserva.</h1>
        <p className="muted">Escolha um espaço e um horário na busca para ver o resumo.</p>
        <Link className="btn btn-primary" to="/app/spaces">Escolher um espaço</Link>
      </div>
    );
  }

  const overdue = scenario === 'overdue';
  const membership = overdue ? null : activeSubscription(db, client.id, now);
  const balance = pointsBalance(pointsOf(db, client.id));
  const extrasTotals = draftTotals(extras);
  // Pontos dos itens e do resgate saem do mesmo saldo (RN22 ampliada).
  const canRedeem = balance - extrasTotals.points >= GREEN_POINTS.redeemCost;
  const pointsForItems = balance - (usePoints && canRedeem ? GREEN_POINTS.redeemCost : 0);
  const price = priceBooking(space.hourly, hours, membership?.plan.discount ?? 0, usePoints && canRedeem ? GREEN_POINTS.redeemDiscount : 0);
  const planOff = round2(price.fullPrice - (price.finalPrice + price.greenDiscount));
  const end = new Date(startDate.getTime() + hours * 3600_000);
  const problem = checkWindow(startDate, hours, now);
  const occupied = taken || scenario === 'taken' || !isFree(space.id, startDate, hours, db.bookings);
  const willConfirm = membership !== null;
  const isConfirming = confirming || scenario === 'confirming';

  // Prazo de pagamento se a reserva nascer pendente (RN12): calculado como se fosse criada agora.
  const deadline = paymentDeadline({ createdAt: now.toISOString(), start: startDate.toISOString() } as Booking);
  const deadlineText = `${hhmm(deadline)}${daysBetween(now, deadline) === 0 ? ' de hoje' : ` de ${shortDay(deadline)}`}`;

  // Horários livres do mesmo espaço no mesmo dia (MSG-04).
  const freeTimes = startTimes(hours)
    .map((t) => toDate(date, t))
    .filter((d) => !checkWindow(d, hours, now) && isFree(space.id, d, hours, db.bookings))
    .sort((a, b) => Math.abs(a.getTime() - startDate.getTime()) - Math.abs(b.getTime() - startDate.getTime()))
    .slice(0, 5)
    .sort((a, b) => a.getTime() - b.getTime());

  const pickTime = (d: Date) => {
    const p = new URLSearchParams(params);
    p.set('date', toDayString(d));
    p.set('start', hhmm(d));
    setParams(p, { replace: true });
    setTaken(false);
    setScenario('live');
  };

  function onConfirm(e: FormEvent) {
    e.preventDefault();
    if (isConfirming || problem) return;
    if (occupied) { alertRef.current?.focus(); shake(); return; }
    setConfirming(true);
    window.setTimeout(() => {
      const result = createBooking({
        clientId: client.id, spaceId: space!.id, start: startDate!, hours,
        useGreenPoints: usePoints && canRedeem, arrivalMode: arrival, overdue,
        purpose: extras.purpose, extras,
      });
      setConfirming(false);
      if (result.ok) {
        navigate(`/app/bookings/${result.booking.id}/confirmation`, { replace: true });
      } else {
        setTaken(true);
        shake();
        window.requestAnimationFrame(() => alertRef.current?.focus());
      }
    }, 700);
  }

  const blocked = problem !== null || occupied;

  return (
    <>
      <div className="booking-new">
        <Link className="back-link" to={backToSpaces}><ArrowLeft />Voltar para os espaços</Link>
        <header className="page-head">
          <div>
            <h1>Resumo da reserva</h1>
            <p className="sub">Confira o espaço, o horário e o valor. Nada é cobrado antes de você confirmar.</p>
          </div>
        </header>

        {overdue && (
          <p className="banner warn" role="status">
            <Alert />
            <span>Você tem uma cobrança vencida. Enquanto ela estiver aberta, suas reservas valem o preço cheio e ficam aguardando pagamento.</span>
            <Link to="/app/bookings">Ver cobranças</Link>
          </p>
        )}

        {problem && (
          <div className="inline-alert block" role="alert">
            <Alert />
            <span><b>Não dá para reservar neste horário.</b> {PROBLEM_TEXT[problem]}</span>
          </div>
        )}

        {occupied && !problem && (
          <div className="inline-alert block" role="alert" tabIndex={-1} ref={alertRef}>
            <Alert />
            <div>
              <p><b>Esse horário já foi reservado.</b> Escolha um dos horários livres abaixo.</p>
              {freeTimes.length > 0 ? (
                <div className="suggest-chips light">
                  {freeTimes.map((d) => (
                    <button key={d.toISOString()} type="button" onClick={() => pickTime(d)}>{hhmm(d)} às {hhmm(new Date(d.getTime() + hours * 3600_000))}</button>
                  ))}
                </div>
              ) : (
                <p>Não há outro horário livre neste dia. <Link to={backToSpaces}>Ver outros espaços</Link></p>
              )}
            </div>
          </div>
        )}

        <form ref={formRef} className="bn-grid" onSubmit={onConfirm}>
          <section className="card bn-space" aria-labelledby="bn-space-t">
            <div className="bn-space-top">
              <div>
                <p className="eyebrow">Espaço</p>
                <h2 id="bn-space-t">{space.name}</h2>
                <p className="muted"><MapPin className="inline-ic" />{space.kind}</p>
              </div>
              <Link className="link-row" to={backToSpaces}>Trocar<span className="sr-only"> de espaço</span></Link>
            </div>
            <SpacePhoto space={space} className="bn-photo" caption priority sizes="(min-width: 1024px) 60vw, 100vw" />
            <ul className="sc-tags" aria-label="Características">
              {spaceTags(space).map((t) => <li key={t}>{t}</li>)}
            </ul>
            {space.features.accessibility.length > 0 && <p className="sc-access"><b>Acessibilidade:</b> {space.features.accessibility.join(' · ')}</p>}
            <div className="bn-when">
              <p><Calendar />{longDay(startDate)}</p>
              <p><Clock />{hhmm(startDate)} às {hhmm(end)} <span className="muted">({formatDuration(hours)})</span></p>
            </div>
          </section>

          <section className="card bn-green" aria-labelledby="bn-green-t">
            <p className="eyebrow" id="bn-green-t"><Leaf className="inline-ic" />Hubbi Verde</p>
            <label className={`switch-row${canRedeem ? '' : ' disabled'}`} htmlFor="use-points">
              <span>
                <b>Usar {GREEN_POINTS.redeemCost} pontos verdes</b>
                <small>{canRedeem
                  ? `${GREEN_POINTS.redeemDiscount}% de desconto nesta reserva. Você tem ${balance} pontos.`
                  : `Você tem ${balance} pontos. ${falta(GREEN_POINTS.redeemCost - balance)} ${GREEN_POINTS.redeemCost - balance} para trocar por desconto.`}</small>
              </span>
              <input type="checkbox" role="switch" id="use-points" checked={usePoints && canRedeem} disabled={!canRedeem} onChange={(e) => setUsePoints(e.target.checked)} />
            </label>
            <fieldset className="arrival">
              <legend>Como você vai chegar? <span className="muted">(opcional)</span></legend>
              <div className="seg">
                {ARRIVAL.map((a) => (
                  <span key={a.id}>
                    <input type="radio" name="arrival" id={`arr-${a.id}`} checked={arrival === a.id} onChange={() => setArrival(a.id)} />
                    <label htmlFor={`arr-${a.id}`}>{a.label}</label>
                  </span>
                ))}
              </div>
              <p className="muted small">
                {arrival
                  ? `Se a recepção confirmar na chegada, você ganha mais 5 pontos (uma vez por dia).`
                  : 'Chegando a pé, de bicicleta, transporte público, carona ou veículo elétrico, você ganha 5 pontos quando a recepção confirmar.'}
                {arrival && <> <button type="button" className="link-btn" onClick={() => setArrival(null)}>Não informar</button></>}
              </p>
            </fieldset>
          </section>

          <ExtrasCard draft={extras} onChange={setExtras} seats={space.seats} balance={pointsForItems} />

          <section className="card bn-receipt" aria-labelledby="bn-total-t">
            <h2 id="bn-total-t" className="sr-only">Valores</h2>
            <p className="bn-line-title">{space.name} · {shortDay(startDate)} · {hhmm(startDate)} às {hhmm(end)} ({formatDuration(hours)})</p>
            <dl className="bn-rows">
              <div><dt>Preço cheio</dt><dd>{brl(price.fullPrice)}</dd></div>
              {membership && <div className="minus"><dt>Desconto do plano {membership.plan.name} ({membership.plan.discount}%)</dt><dd>− {brl(planOff)}</dd></div>}
              {price.greenDiscount > 0 && <div className="minus"><dt>Pontos verdes ({GREEN_POINTS.redeemDiscount}%)</dt><dd>− {brl(price.greenDiscount)}</dd></div>}
              <div className="sum"><dt>Total</dt><dd>{brl(price.finalPrice)}</dd></div>
            </dl>
            <p className="bn-frozen">Esse valor fica gravado na reserva e não muda depois.</p>
            {extrasTotals.units > 0 && (
              <div className="bn-extras-sum">
                <dl className="bn-rows">
                  <div><dt>Comodidades (cobrança separada)</dt><dd>{brl(extrasTotals.money)}</dd></div>
                  {extrasTotals.points > 0 && <div className="minus"><dt>Pagos com pontos</dt><dd>{extrasTotals.points} pontos</dd></div>}
                </dl>
                <p className="bn-frozen">{MSG_SEPARATE}</p>
              </div>
            )}
            <button className="btn btn-primary btn-block" type="submit" disabled={blocked || isConfirming} aria-busy={isConfirming}>
              {isConfirming
                ? <><span className="spinner" aria-hidden="true" />Confirmando…</>
                : extrasTotals.units > 0
                  ? <>Confirmar reserva e pedido</>
                  : <>Confirmar reserva · {brl(price.finalPrice)}</>}
            </button>
            <Link className="btn btn-soft btn-block" to={backToSpaces}>Voltar</Link>
            {blocked && !isConfirming && <p className="muted small center">Escolha outro horário para confirmar.</p>}
          </section>

          <section className="card bn-after" aria-labelledby="bn-after-t">
            <h2 id="bn-after-t">O que acontece depois</h2>
            {willConfirm ? (
              <p className="after-row ok"><Check /><span><b>A reserva já nasce confirmada.</b> A cobrança de {brl(price.finalPrice)} fica pendente para a recepção registrar.</span></p>
            ) : (
              <p className="after-row warn"><Clock /><span><b>A reserva fica aguardando pagamento.</b> Pague na recepção até {deadlineText} para confirmar; depois disso ela é cancelada sem multa.</span></p>
            )}
            <div className="policy">
              <p className="policy-title">Se precisar cancelar</p>
              <ul>
                <li><span>Com 24 h ou mais de antecedência</span><b>sem multa</b></li>
                <li><span>Entre 24 h e 2 h antes</span><b>multa de {brl(round2(price.finalPrice * LATE_CANCEL_FEE))}</b></li>
                <li><span>Com menos de 2 h</span><b>multa de {brl(price.finalPrice)}</b></li>
              </ul>
            </div>
            <p className="after-row"><Leaf /><span>Ao concluir a reserva, você ganha {GREEN_POINTS.perCompleted} pontos verdes.</span></p>
          </section>
        </form>
      </div>
      <ProtoBar states={PROTO} active={scenario} onSelect={(s) => { setTaken(false); setScenario(s); }} />
    </>
  );
}
