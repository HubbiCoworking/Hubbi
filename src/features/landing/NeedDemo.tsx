import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Calendar, Check, Clock, LeafPlus, Search, Wallet } from '../../components/Icons';
import { DEMO_MEMBER, NEEDS, SPACES, spaceTags, type NeedId, type Space } from '../../data/catalog';
import { activeCriteria, applyPreset, matchesFilters } from '../../domain/filters';
import { brl, round2 } from '../../lib/format';
import { cssVars } from '../../lib/style';

const HOURS = 2;

const ALL = { id: 'all' as const, label: 'Todos os espaços', preset: {} };
const OPTIONS = [ALL, ...NEEDS];

function tagsOf(s: Space): string[] {
  const all = spaceTags(s);
  const shown = all.slice(0, 5);
  return all.length > shown.length ? [...shown, `+${all.length - shown.length}`] : shown;
}

/** Demonstração da busca por necessidade, com dados de exemplo. */
export function NeedDemo() {
  const [need, setNeed] = useState<NeedId | 'all'>('all');
  const [touched, setTouched] = useState(false);
  const current = OPTIONS.find((n) => n.id === need)!;
  const filters = useMemo(() => applyPreset(current.preset), [current]);
  const results = useMemo(() => SPACES.filter((s) => matchesFilters(s, filters)), [filters]);
  const criteria = activeCriteria(filters).map((c) => c.label.toLowerCase()).join(', ');
  const discount = DEMO_MEMBER.planDiscount / 100;

  const countText =
    (results.length === 1 ? '1 espaço livre' : `${results.length} espaços livres`) +
    ' nesse horário' +
    (need === 'all' ? '' : ` de ${SPACES.length}`);

  return (
    <div className="demo-wrap" id="espacos">
      <div className="demo" role="region" aria-label="Demonstração da busca de espaços com dados de exemplo">
        <aside className="demo-side" aria-hidden="true">
          <Logo asLink={false} />
          <span className="side-item on"><Search />Reservar espaço</span>
          <span className="side-item"><Calendar />Minhas reservas</span>
          <span className="side-item"><Wallet />Pagamentos</span>
          <span className="side-item"><LeafPlus />Hubbi Verde</span>
          <div className="side-points">Seus pontos verdes<strong>{DEMO_MEMBER.points}</strong>100 já valem 10% de desconto</div>
        </aside>
        <div className="demo-main">
          <div className="demo-top">
            <h3>Olá, {DEMO_MEMBER.firstName}. Para que é o espaço hoje?</h3>
            <span className="plan-pill">Plano {DEMO_MEMBER.planName} · {DEMO_MEMBER.planDiscount}% em toda reserva</span>
          </div>
          <div className="when" aria-label="Data e horário de exemplo">
            <span><Calendar />Terça, 14 de outubro</span>
            <span><Clock />14:00 às 16:00 (2 h)</span>
          </div>
          <div>
            <p className="need-label" id="need-label">Atalhos de necessidade</p>
            <div className="needs" role="group" aria-labelledby="need-label" style={{ marginTop: 10 }}>
              {OPTIONS.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`need${n.id === 'creative' && !touched ? ' hint' : ''}`}
                  aria-pressed={need === n.id}
                  onClick={() => { setNeed(n.id); setTouched(true); }}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>
          <div className="result-head">
            <span aria-live="polite">{countText}</span>
            <span>{criteria ? `Filtro: ${criteria}` : ''}</span>
          </div>
          <ul className="results">
            {results.map((s, i) => {
              const full = s.hourly * HOURS;
              const pay = round2(full * (1 - discount));
              return (
                <li key={`${need}-${s.name}`} className={`space${touched ? ' enter' : ''}`} style={cssVars({ '--d': i })}>
                  <div className="space-top">
                    <div><h4>{s.name}</h4><span className="kind">{s.kind}</span></div>
                    <span className="free"><Check />Livre</span>
                  </div>
                  <div className="tags">{tagsOf(s).map((t) => <span key={t}>{t}</span>)}</div>
                  <div className="space-foot">
                    <p className="price"><b>{brl(pay)}</b><s>{brl(full)}</s><small>2 h com {DEMO_MEMBER.planDiscount}% do seu plano</small></p>
                    <Link className="btn btn-primary" to="/login?intent=book">Reservar</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
