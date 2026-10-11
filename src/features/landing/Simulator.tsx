import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Undo } from '../../components/Icons';
import { GREEN_POINTS, LATE_CANCEL_FEE, SIM_PLANS, SPACES } from '../../data/catalog';
import { brl, formatDuration, round2 } from '../../lib/format';
import { useReducedMotion, useTweenedNumber } from '../../lib/motion';

const SIM_SPACES = [...SPACES].sort((a, b) => a.hourly - b.hourly);
const MIN_H = 1;
const MAX_H = 8;
const STEP_H = 0.5;

/** Simulador de preço (RN02, RN07, RN22). Mesma conta da tela de reserva. */
export function Simulator() {
  const reduce = useReducedMotion();
  const [spaceName, setSpaceName] = useState('Sala Aurora');
  const [hours, setHours] = useState(2);
  const [planId, setPlanId] = useState('profissional');
  const [usePoints, setUsePoints] = useState(false);

  const space = SIM_SPACES.find((s) => s.name === spaceName)!;
  const plan = SIM_PLANS.find((p) => p.id === planId)!;
  const full = round2(space.hourly * hours);
  const planOff = round2((full * plan.discount) / 100);
  const afterPlan = round2(full - planOff);
  const pointsOff = usePoints ? round2((afterPlan * GREEN_POINTS.redeemDiscount) / 100) : 0;
  const total = round2(afterPlan - pointsOff);

  const shown = useTweenedNumber(total, 450, reduce);
  const totalRef = useRef<HTMLParagraphElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = totalRef.current;
    if (!el || reduce) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  }, [total, reduce]);

  return (
    <section className="dark" id="simulador" aria-labelledby="sim-t">
      <div className="inner">
        <h2 id="sim-t">Simule e veja quanto <span className="tone">sua reserva custa de verdade.</span></h2>
        <p className="lead">Escolha o espaço, as horas e o seu plano. A conta é a mesma que aparece na hora de reservar.</p>
        <form className="sim" onSubmit={(e) => e.preventDefault()}>
          <div className="panel">
            <div className="field">
              <label htmlFor="sim-space">Espaço</label>
              <select className="select" id="sim-space" value={spaceName} onChange={(e) => setSpaceName(e.target.value)}>
                {SIM_SPACES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} · {brl(s.hourly)}/h
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label id="dur-l">Duração</label>
              <div className="stepper" role="group" aria-labelledby="dur-l">
                <button type="button" aria-label="Diminuir 30 minutos" disabled={hours <= MIN_H} onClick={() => setHours((h) => Math.max(MIN_H, h - STEP_H))}>−</button>
                <output aria-live="polite">{formatDuration(hours)}</output>
                <button type="button" aria-label="Aumentar 30 minutos" disabled={hours >= MAX_H} onClick={() => setHours((h) => Math.min(MAX_H, h + STEP_H))}>+</button>
              </div>
              <span className="stepper-hint">De 1 h a 8 h, em passos de 30 minutos.</span>
            </div>
            <fieldset className="field">
              <legend>Seu plano</legend>
              <div className="pills">
                {SIM_PLANS.map((p) => (
                  <span key={p.id}>
                    <input type="radio" name="plan" id={`plan-${p.id}`} value={p.id} checked={planId === p.id} onChange={() => setPlanId(p.id)} />
                    <label htmlFor={`plan-${p.id}`}>{p.name}{p.discount > 0 && <small>{p.discount}%</small>}</label>
                  </span>
                ))}
              </div>
            </fieldset>
            <label className="switch" htmlFor="pts">
              <span>Usar {GREEN_POINTS.redeemCost} pontos verdes<small>Mais {GREEN_POINTS.redeemDiscount}% de desconto nesta reserva</small></span>
              <input type="checkbox" id="pts" role="switch" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} />
            </label>
          </div>

          <div className="receipt">
            <p className="sr-only" aria-live="polite">Total: {brl(total)}</p>
            <p className="label">Você paga</p>
            <p className="total" ref={totalRef}>{brl(round2(shown))}</p>
            <p className="total-sub">por {formatDuration(hours)} em {space.name}{plan.discount ? `, plano ${plan.name}` : ', sem plano'}</p>
            <dl className="rows">
              <div><dt>Valor cheio</dt><dd>{brl(full)}</dd></div>
              <div className="minus"><dt>Desconto do plano{plan.discount ? ` (${plan.discount}%)` : ''}</dt><dd>{plan.discount ? `− ${brl(planOff)}` : brl(0)}</dd></div>
              {usePoints && <div className="minus"><dt>Pontos verdes ({GREEN_POINTS.redeemDiscount}%)</dt><dd>− {brl(pointsOff)}</dd></div>}
              <div className="sum"><dt>Total</dt><dd>{brl(total)}</dd></div>
            </dl>
            <div className="notes">
              <p><Undo /><span>Cancelando com 24h ou mais, volta tudo. Entre 24h e 2h antes, a multa é de {brl(round2(total * LATE_CANCEL_FEE))}.</span></p>
              <p><Leaf /><span>Ao concluir a reserva, você ganha {GREEN_POINTS.perCompleted} pontos verdes.</span></p>
            </div>
            <Link className="btn btn-primary btn-lg" to="/login?intent=book">Reservar este espaço</Link>
          </div>
        </form>
      </div>
    </section>
  );
}
