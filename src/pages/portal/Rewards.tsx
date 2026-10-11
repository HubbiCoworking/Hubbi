import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, ArrowRight, Check, Close, Leaf } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { GREEN_POINTS } from '../../data/catalog';
import { currentStreak, pointsBalance, POINTS_VALID_MONTHS, redeemProgress } from '../../domain/points';
import type { ArrivalMode, PointsEntry } from '../../domain/types';
import { ddmmyyyy, shortDay } from '../../lib/dates';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { bookingsOf, confirmArrival, pointsOf, resetDemoData, sessionClient, spaceById, useDB } from '../../store/store';

const STREAK_SIZE = 5;
const ARRIVAL_LABEL: Record<ArrivalMode, string> = { walk: 'a pé', bike: 'de bicicleta', transit: 'de transporte público', carpool: 'de carona', electric: 'de veículo elétrico' };
const KIND_LABEL: Record<PointsEntry['kind'], string> = {
  completed: 'Reserva concluída', streak: 'Bônus de sequência', clean_arrival: 'Chegada limpa',
  redeem: 'Resgate', refund: 'Devolução', expired: 'Vencimento',
};
const monthFmt = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' });

/** T46 Hubbi Verde: saldo e extrato (/app/rewards). FR-025, FR-026; RN22, RN23. */
export default function Rewards() {
  useDocumentTitle('Hubbi Verde · Hubbi');
  const db = useDB();
  const client = sessionClient(db)!;
  const [toast, setToast] = useState<{ text: string; tone: 'ok' | 'err' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const entries = useMemo(() => [...pointsOf(db, client.id)].sort((a, b) => b.date.localeCompare(a.date)), [db, client.id]);
  const bookings = bookingsOf(db, client.id);
  const balance = pointsBalance(entries);
  const { cost, canRedeem, progress, missing } = redeemProgress(balance);
  const streak = currentStreak(bookings) % STREAK_SIZE;
  const earned = entries.filter((e) => e.points > 0).reduce((s, e) => s + e.points, 0);
  const used = -entries.filter((e) => e.points < 0).reduce((s, e) => s + e.points, 0);
  const oldestPositive = [...entries].reverse().find((e) => e.points > 0);
  const nextExpiry = oldestPositive ? new Date(new Date(oldestPositive.date).setMonth(new Date(oldestPositive.date).getMonth() + POINTS_VALID_MONTHS)) : null;

  // Extrato agrupado por mês.
  const groups = useMemo(() => {
    const map = new Map<string, PointsEntry[]>();
    for (const e of entries) {
      const m = monthFmt.format(new Date(e.date));
      const key = m.charAt(0).toUpperCase() + m.slice(1);
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return [...map];
  }, [entries]);

  // Ação simulada (PRD 6.3): reservas com chegada informada que a recepção ainda não confirmou.
  const now = new Date();
  const toConfirm = bookings.filter((b) => b.arrivalMode && !b.arrivalConfirmed && (b.state === 'completed' || (b.state === 'confirmed' && new Date(b.end) <= now)));
  const proto = [
    ...toConfirm.map((b) => ({ id: b.id, label: `Recepção confirma chegada: ${spaceById(b.spaceId)?.name} (${ARRIVAL_LABEL[b.arrivalMode!]})` })),
    { id: 'reset', label: 'Restaurar dados de exemplo' },
  ];
  const onProto = (id: string) => {
    if (id === 'reset') { resetDemoData(); setToast({ tone: 'ok', text: 'Dados de exemplo restaurados.' }); return; }
    const r = confirmArrival(id);
    if (!r.ok) { setToast({ tone: 'err', text: 'Esta chegada não pode mais ser confirmada.' }); return; }
    const parts = [
      r.completed ? `Reserva concluída: +${r.completed} pontos.` : '',
      r.sameDay ? 'Chegada confirmada, mas o bônus de chegada limpa já foi dado neste dia (1 por dia).' : 'Chegada limpa confirmada: +5 pontos.',
    ].filter(Boolean);
    setToast({ tone: 'ok', text: parts.join(' ') });
  };

  return (
    <>
      <div className="rewards">
        <header className="page-head">
          <div>
            <h1>Hubbi Verde</h1>
            <p className="sub">Você ganha pontos usando bem o espaço: comparecendo às reservas e chegando de jeito mais limpo. Os pontos viram desconto.</p>
          </div>
        </header>

        <div className="dt-grid">
          <div className="dt-main">
            <section className="next rw-hero" aria-labelledby="rw-t">
              <p className="rw-label" id="rw-t">Seu saldo</p>
              <p className="rw-balance"><b>{balance}</b> pontos verdes</p>
              <div className="rw-bar" role="img" aria-label={`${progress} de ${cost} pontos para o próximo desconto`}><i style={{ width: `${(progress / cost) * 100}%` }} /></div>
              <p className="rw-hint">
                {canRedeem
                  ? `Você já pode trocar ${cost} pontos por ${GREEN_POINTS.redeemDiscount}% de desconto em uma reserva.`
                  : balance === 0 ? 'Conclua sua primeira reserva para ganhar 10 pontos.' : `Faltam ${missing} pontos para ${GREEN_POINTS.redeemDiscount}% de desconto em uma reserva.`}
              </p>
              <div className="rw-foot">
                <dl className="rw-stats">
                  <div><dt>Ganhos</dt><dd>{earned}</dd></div>
                  <div><dt>Usados</dt><dd>{used}</dd></div>
                </dl>
                <Link className="btn btn-light" to="/app/spaces">{canRedeem ? 'Usar numa reserva' : 'Reservar um espaço'} <ArrowRight className="arrow" /></Link>
              </div>
            </section>

            <section className="card" aria-labelledby="streak-t">
              <div className="card-head">
                <h2 id="streak-t">Sequência sem falta</h2>
                <span className="muted small">+20 pontos a cada {STREAK_SIZE}</span>
              </div>
              <ol className="streak" aria-label={`${streak} de ${STREAK_SIZE} reservas concluídas seguidas`}>
                {Array.from({ length: STREAK_SIZE }, (_, i) => (
                  <li key={i} className={i < streak ? 'on' : ''}>{i < streak ? <Check /> : <span>{i + 1}</span>}</li>
                ))}
              </ol>
              <p className="muted">
                {streak === 0
                  ? 'Conclua reservas seguidas, sem faltar, para ganhar o bônus.'
                  : `${streak} de ${STREAK_SIZE}. Faltam ${STREAK_SIZE - streak} reservas concluídas para o bônus. Faltar ou cancelar com multa recomeça a contagem.`}
              </p>
            </section>

            <section className="card" aria-labelledby="ext-t">
              <h2 id="ext-t">Extrato</h2>
              {entries.length === 0 ? (
                <div className="ext-empty">
                  <span className="state-icon" aria-hidden="true"><Leaf /></span>
                  <p className="muted">Seu extrato está vazio. Os pontos aparecem aqui quando a recepção concluir sua primeira reserva.</p>
                </div>
              ) : groups.map(([month, items]) => (
                <div key={month} className="ext-group">
                  <h3 className="ext-month">{month}</h3>
                  <ul className="ext-list">
                    {items.map((e) => {
                      const booking = e.bookingId ? db.bookings.find((b) => b.id === e.bookingId) : undefined;
                      return (
                        <li key={e.id}>
                          <span className={`ext-ic ${e.points >= 0 ? 'plus' : 'minus'}`} aria-hidden="true"><Leaf /></span>
                          <div className="ext-main">
                            <p className="ext-title">{e.label}</p>
                            <p className="muted small">
                              {e.label.startsWith(KIND_LABEL[e.kind]) ? '' : `${KIND_LABEL[e.kind]} · `}{shortDay(new Date(e.date))}
                              {booking && <> · <Link to={`/app/bookings/${booking.id}`}>{booking.code}</Link></>}
                            </p>
                          </div>
                          <b className={`ext-pts ${e.points >= 0 ? 'plus' : 'minus'}`}>{e.points > 0 ? '+' : '−'}{Math.abs(e.points)}</b>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </section>
          </div>

          <aside className="dt-side">
            <section className="card" aria-labelledby="earn-t">
              <h2 id="earn-t">Como ganhar</h2>
              <ul className="earn">
                <li><b>+10</b><span>quando a recepção conclui a sua reserva</span></li>
                <li><b>+20</b><span>a cada {STREAK_SIZE} reservas concluídas seguidas, sem falta nem multa</span></li>
                <li><b>+5</b><span>chegando a pé, de bicicleta, transporte público, carona ou veículo elétrico, confirmado pela recepção (1 vez por dia)</span></li>
                <li className="use"><b>−{cost}</b><span>viram {GREEN_POINTS.redeemDiscount}% de desconto numa reserva, escolhido no resumo</span></li>
              </ul>
            </section>
            <section className="card" aria-labelledby="prules-t">
              <h2 id="prules-t">Bom saber</h2>
              <ul className="conf-notes">
                <li><Check /><span>Cancelar não dá pontos, para ninguém acumular reservando e cancelando.</span></li>
                <li><Check /><span>Não comparecer não dá pontos e recomeça a sequência.</span></li>
                <li><Check /><span>Pontos vencem {POINTS_VALID_MONTHS} meses depois de ganhos{nextExpiry ? `; os mais antigos vencem em ${ddmmyyyy(nextExpiry)}` : ''}.</span></li>
                <li><Check /><span>Pontos não valem dinheiro e não podem ser transferidos.</span></li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status">
          {toast.tone === 'ok' ? <Check /> : <Alert />}<span>{toast.text}</span>
          <button type="button" aria-label="Fechar aviso" onClick={() => setToast(null)}><Close /></button>
        </div>
      )}
      <ProtoBar states={proto} active={null} onSelect={onProto} />
    </>
  );
}
