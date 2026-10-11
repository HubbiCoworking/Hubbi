import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, ArrowRight, Calendar, Check, Clock, Close, Search } from '../../components/Icons';
import { ProtoBar } from '../../components/ProtoBar';
import { SpacePhoto } from '../../components/SpacePhoto';
import {
  EMPTY_FILTERS, FEATURE_OPTIONS, NEEDS, SPACE_TYPE_LABEL, SPACES, spaceTags,
  type FeatureGroup, type Filters, type NeedId, type Space, type SpaceType,
} from '../../data/catalog';
import { checkWindow, isFree, OPENING, startTimes, toDate, toDayString, type WindowProblem } from '../../domain/availability';
import { activeCriteria, applyPreset, matchesFilters, mostRestrictive } from '../../domain/filters';
import { priceBooking } from '../../domain/pricing';
import { atBusinessDay, hhmm, longDay, shortDay } from '../../lib/dates';
import { brl, formatDuration } from '../../lib/format';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { activeSubscription, sessionClient, useDB } from '../../store/store';

type Scenario = 'live' | 'loading' | 'none' | 'overdue' | 'error';

const PROTO: { id: Scenario; label: string }[] = [
  { id: 'live', label: 'Disponibilidade real' },
  { id: 'loading', label: 'Carregando' },
  { id: 'none', label: 'Nenhum espaço livre' },
  { id: 'overdue', label: 'Membro com cobrança vencida' },
  { id: 'error', label: 'Erro ao carregar' },
];

const GROUPS: FeatureGroup[] = ['equipment', 'environment', 'accessibility', 'sustainability'];
const NUMBER_FILTERS: { key: 'minSeats' | 'minOutlets' | 'minMbps' | 'minComputers'; label: string; options: number[]; unit: string }[] = [
  { key: 'minSeats', label: 'Lugares', options: [2, 4, 6, 8, 10], unit: 'ou mais' },
  { key: 'minOutlets', label: 'Tomadas', options: [2, 4, 6, 8, 10], unit: 'ou mais' },
  { key: 'minMbps', label: 'Internet', options: [100, 200, 300, 500], unit: 'Mbps ou mais' },
  { key: 'minComputers', label: 'Computadores', options: [1, 2, 4], unit: 'ou mais' },
];

const DAY_NAMES = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const WEEK = `de ${DAY_NAMES[OPENING.days[0]]} a ${DAY_NAMES[OPENING.days[OPENING.days.length - 1]]}`;
const pad = (h: number) => `${String(h).padStart(2, '0')}:00`;

/** Textos oficiais (ui-messages, seção 2). */
const PROBLEM_TEXT: Record<WindowProblem, { title: string; text: string }> = {
  closed: {
    title: 'Fora do horário de funcionamento.',
    text: `O espaço funciona das ${pad(OPENING.open)} às ${pad(OPENING.close)}, ${WEEK}. A reserva precisa começar e terminar no mesmo dia, dentro desse horário.`,
  },
  duration: {
    title: 'Duração inválida.',
    text: `A duração deve ser de ${OPENING.minHours} h a ${OPENING.maxHours} h, em intervalos de ${OPENING.stepMinutes} minutos.`,
  },
  advance: {
    title: 'Horário muito próximo.',
    text: 'No portal, a reserva precisa começar com pelo menos 1 hora de antecedência. Escolha outro horário ou procure a recepção.',
  },
};

/** Busca padrão: próximo dia de funcionamento a partir de amanhã, das 14:00 às 16:00. */
function defaultSearch(now: Date) {
  return { date: toDayString(atBusinessDay(now, 1, 14)), start: '14:00', hours: 2 };
}

/** T04 Espaços: busca e lista (/app/spaces). FR-003, FR-004, FR-023; RN01–RN05, RN12, RN13, RN20. */
export default function Spaces() {
  useDocumentTitle('Espaços · Hubbi');
  const db = useDB();
  const client = sessionClient(db)!;
  const now = useMemo(() => new Date(), []);
  const [params, setParams] = useSearchParams();
  const defaults = useMemo(() => defaultSearch(now), [now]);

  const date = params.get('date') ?? defaults.date;
  const hours = Number(params.get('hours') ?? defaults.hours);
  const start = params.get('start') ?? defaults.start;
  const initialNeed = NEEDS.find((n) => n.id === params.get('need'))?.id ?? null;

  const [need, setNeed] = useState<NeedId | null>(initialNeed);
  const [filters, setFilters] = useState<Filters>(() => (initialNeed ? applyPreset(NEEDS.find((n) => n.id === initialNeed)!.preset) : EMPTY_FILTERS));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [scenario, setScenario] = useState<Scenario>('live');

  const updateSearch = (next: Partial<{ date: string; start: string; hours: number }>) => {
    const merged = { date, start, hours, ...next };
    const p = new URLSearchParams(params);
    p.set('date', merged.date);
    p.set('start', merged.start);
    p.set('hours', String(merged.hours));
    setParams(p, { replace: true });
  };

  // Ao mudar a duração, o início precisa continuar cabendo no dia (RN04).
  const times = startTimes(hours);
  useEffect(() => {
    if (!times.includes(start)) updateSearch({ start: times[times.length - 1] ?? '07:00' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours]);

  const changeFilters = (next: Filters) => { setFilters(next); setNeed(null); };
  const chooseNeed = (id: NeedId) => {
    if (need === id) { setNeed(null); setFilters(EMPTY_FILTERS); return; }
    setNeed(id);
    setFilters({ ...applyPreset(NEEDS.find((n) => n.id === id)!.preset), type: filters.type });
  };

  const membership = activeSubscription(db, client.id, now);
  const overdue = scenario === 'overdue';
  const discount = overdue ? 0 : membership?.plan.discount ?? 0;

  const startDate = toDate(date, start);
  const endDate = new Date(startDate.getTime() + hours * 3600_000);
  const problem = checkWindow(startDate, hours, now);
  const matching = SPACES.filter((s) => matchesFilters(s, filters));
  const free = scenario === 'none' ? [] : matching.filter((s) => isFree(s.id, startDate, hours, db.bookings));
  const busy = matching.length - free.length;
  const criteria = activeCriteria(filters);

  /** "Ver outros horários": horários válidos com espaço livre, do mais próximo ao mais distante. */
  const suggestions = useMemo(() => {
    if (scenario === 'none') return [];
    const options: { date: string; start: string; label: string; count: number }[] = [];
    const tryDay = (day: Date, sameDay: boolean) => {
      for (const t of startTimes(hours)) {
        const s = toDate(toDayString(day), t);
        if (checkWindow(s, hours, now)) continue;
        const count = matching.filter((sp) => isFree(sp.id, s, hours, db.bookings)).length;
        if (count) options.push({ date: toDayString(day), start: t, count, label: sameDay ? t : `${shortDay(s)} · ${t}` });
      }
    };
    tryDay(startDate, true);
    const ref = startDate.getTime();
    options.sort((a, b) => Math.abs(toDate(a.date, a.start).getTime() - ref) - Math.abs(toDate(b.date, b.start).getTime() - ref));
    if (options.length) return options.filter((o) => !(o.date === date && o.start === start)).slice(0, 4);
    // Nenhum horário no mesmo dia: próximo dia de funcionamento, perto do horário pedido.
    for (let i = 1; i <= 7 && !options.length; i++) tryDay(atBusinessDay(startDate, i, 0), false);
    const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    options.sort((a, b) => Math.abs(minutes(a.start) - minutes(start)) - Math.abs(minutes(b.start) - minutes(start)));
    return options.slice(0, 4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, start, hours, filters, scenario, db.bookings]);

  const priceOf = (s: Space) => priceBooking(s.hourly, hours, discount);
  const bookHref = (s: Space) => `/app/bookings/new?space=${s.id}&date=${date}&start=${start}&hours=${hours}`;

  let results: ReactNode;
  if (scenario === 'loading') {
    results = <div className="space-grid" aria-busy="true" aria-label="Carregando espaços">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 260 }} />)}</div>;
  } else if (scenario === 'error') {
    results = (
      <div className="state-box" role="alert">
        <span className="state-icon err" aria-hidden="true"><Alert /></span>
        <h2>Não foi possível carregar os espaços.</h2>
        <p className="muted">Confira sua conexão e tente de novo.</p>
        <button className="btn btn-primary" type="button" onClick={() => setScenario('live')}>Tentar de novo</button>
      </div>
    );
  } else if (problem) {
    results = (
      <div className="state-box">
        <p className="inline-alert" role="alert"><Alert /><span><b>{PROBLEM_TEXT[problem].title}</b> {PROBLEM_TEXT[problem].text}</span></p>
        <Suggestions items={suggestions} onPick={(o) => updateSearch({ date: o.date, start: o.start })} title="Horários possíveis" />
      </div>
    );
  } else if (matching.length === 0) {
    const hint = mostRestrictive(SPACES, filters);
    results = (
      <div className="state-box">
        <span className="state-icon" aria-hidden="true"><Search /></span>
        <h2>Nenhum espaço tem tudo isso.</h2>
        {hint ? (
          <>
            <p className="muted">O filtro que mais limitou foi <b>“{hint.criterion.label}”</b>. Sem ele, {hint.count === 1 ? '1 espaço atende' : `${hint.count} espaços atendem`} aos outros critérios.</p>
            <button className="btn btn-soft" type="button" onClick={() => changeFilters(hint.criterion.remove(filters))}>Remover “{hint.criterion.label}”</button>
          </>
        ) : (
          <button className="btn btn-soft" type="button" onClick={() => changeFilters(EMPTY_FILTERS)}>Limpar filtros</button>
        )}
      </div>
    );
  } else if (free.length === 0) {
    results = (
      <div className="state-box">
        <span className="state-icon" aria-hidden="true"><Calendar /></span>
        <h2>Nenhum espaço livre neste horário.</h2>
        <p className="muted">Veja outros horários ou tipos de espaço.</p>
        <Suggestions items={suggestions} onPick={(o) => updateSearch({ date: o.date, start: o.start })} title="Ver outros horários" />
      </div>
    );
  } else {
    results = (
      <ul className="space-grid">
        {free.map((s) => <SpaceCard key={s.id} space={s} price={priceOf(s)} member={!!membership} overdue={overdue} planName={membership?.plan.name} href={bookHref(s)} />)}
      </ul>
    );
  }

  const showCount = scenario !== 'loading' && scenario !== 'error' && !problem;

  return (
    <>
      <div className="spaces">
        <header className="page-head">
          <div>
            <h1>Espaços</h1>
            <p className="sub">
              {membership && !overdue
                ? `Escolha quando e o que você precisa. Os preços já vêm com ${membership.plan.discount}% do plano ${membership.plan.name}.`
                : 'Escolha quando e o que você precisa. O preço mostrado é o valor final, antes de você confirmar.'}
            </p>
          </div>
        </header>

        {overdue && (
          <p className="banner warn" role="status">
            <Alert />
            <span>Você tem uma cobrança vencida. Enquanto ela estiver aberta, suas reservas valem o preço cheio e ficam aguardando pagamento.</span>
            <Link to="/app/bookings">Ver cobranças</Link>
          </p>
        )}

        <form className="search-card" role="search" aria-label="Quando você precisa do espaço" onSubmit={(e) => e.preventDefault()}>
          <div className="search-fields">
            <div className="sf">
              <label htmlFor="s-date">Data</label>
              <input id="s-date" type="date" value={date} min={toDayString(now)} onChange={(e) => e.target.value && updateSearch({ date: e.target.value })} />
            </div>
            <div className="sf">
              <label htmlFor="s-start">Início</label>
              <select id="s-start" value={start} onChange={(e) => updateSearch({ start: e.target.value })}>
                {times.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="sf">
              <span className="sf-label" id="s-hours-l">Duração</span>
              <div className="stepper" role="group" aria-labelledby="s-hours-l">
                <button type="button" aria-label="Diminuir 30 minutos" disabled={hours <= OPENING.minHours} onClick={() => updateSearch({ hours: hours - 0.5 })}>−</button>
                <output aria-live="polite">{formatDuration(hours)}</output>
                <button type="button" aria-label="Aumentar 30 minutos" disabled={hours >= OPENING.maxHours} onClick={() => updateSearch({ hours: hours + 0.5 })}>+</button>
              </div>
            </div>
            <fieldset className="sf sf-type">
              <legend className="sf-label">Tipo</legend>
              <div className="seg">
                {(['all', 'room', 'desk', 'station'] as const).map((t) => (
                  <span key={t}>
                    <input type="radio" name="type" id={`type-${t}`} checked={filters.type === t} onChange={() => setFilters({ ...filters, type: t as SpaceType | 'all' })} />
                    <label htmlFor={`type-${t}`}>{t === 'all' ? 'Todos' : SPACE_TYPE_LABEL[t]}</label>
                  </span>
                ))}
              </div>
            </fieldset>
          </div>
          <p className="search-summary"><span><Calendar />{longDay(startDate)}</span><span><Clock />{hhmm(startDate)} às {hhmm(endDate)}</span></p>
        </form>

        <div className="needs-row" role="group" aria-label="Atalhos de necessidade">
          <span className="needs-label">Atalhos</span>
          {NEEDS.map((n) => (
            <button key={n.id} type="button" className="need" aria-pressed={need === n.id} onClick={() => chooseNeed(n.id)}>{n.label}</button>
          ))}
        </div>

        <div className="spaces-layout">
          <button type="button" className="filters-toggle btn btn-soft" aria-expanded={filtersOpen} aria-controls="filtros" onClick={() => setFiltersOpen((o) => !o)}>
            {filtersOpen ? 'Fechar filtros' : 'Filtros'}{criteria.length > 0 && <span className="count">{criteria.length}</span>}
          </button>
          <aside id="filtros" className={`filters${filtersOpen ? ' open' : ''}`} aria-label="Filtros por característica">
            <div className="filters-head">
              <h2>Filtros</h2>
              {criteria.length > 0 && <button type="button" className="link-btn" onClick={() => changeFilters({ ...EMPTY_FILTERS, type: filters.type })}>Limpar</button>}
            </div>
            <div className="num-filters">
              {NUMBER_FILTERS.map((nf) => (
                <div className="sf" key={nf.key}>
                  <label htmlFor={`f-${nf.key}`}>{nf.label}</label>
                  <select id={`f-${nf.key}`} value={filters[nf.key]} onChange={(e) => changeFilters({ ...filters, [nf.key]: Number(e.target.value) })}>
                    <option value={0}>Qualquer</option>
                    {nf.options.map((o) => <option key={o} value={o}>{o} {nf.unit}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {GROUPS.map((g) => (
              <fieldset className="check-group" key={g}>
                <legend>{FEATURE_OPTIONS[g].title}</legend>
                {FEATURE_OPTIONS[g].items.map((item) => {
                  const id = `f-${g}-${item}`.replace(/\s+/g, '-');
                  const checked = filters[g].includes(item);
                  return (
                    <label className="check" htmlFor={id} key={item}>
                      <input id={id} type="checkbox" checked={checked} onChange={() => changeFilters({ ...filters, [g]: checked ? filters[g].filter((i) => i !== item) : [...filters[g], item] })} />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </fieldset>
            ))}
            <p className="filters-note">A internet é a velocidade contratada pelo espaço, não uma medição.</p>
          </aside>

          <section className="results" aria-labelledby="results-t">
            <h2 id="results-t" className="sr-only">Resultados</h2>
            {criteria.length > 0 && (
              <ul className="active-chips" aria-label="Filtros ativos">
                {criteria.map((c) => (
                  <li key={c.key}><button type="button" onClick={() => changeFilters(c.remove(filters))} aria-label={`Remover filtro ${c.label}`}>{c.label}<Close /></button></li>
                ))}
              </ul>
            )}
            {showCount && (
              <p className="results-count" aria-live="polite">
                <b>{free.length === 1 ? '1 espaço livre' : `${free.length} espaços livres`}</b>
                {busy > 0 && ` · ${busy === 1 ? '1 ocupado' : `${busy} ocupados`} nesse horário`}
              </p>
            )}
            {results}
          </section>
        </div>
      </div>
      <ProtoBar states={PROTO} active={scenario} onSelect={setScenario} />
    </>
  );
}

function Suggestions({ items, onPick, title }: { items: { date: string; start: string; label: string; count: number }[]; onPick: (o: { date: string; start: string }) => void; title: string }) {
  if (!items.length) return <p className="muted">Não encontramos horários livres nos próximos dias com esses filtros.</p>;
  return (
    <div className="suggest">
      <p className="suggest-title">{title}</p>
      <div className="suggest-chips">
        {items.map((o) => (
          <button key={`${o.date}-${o.start}`} type="button" onClick={() => onPick(o)}>
            {o.label}<small>{o.count === 1 ? '1 livre' : `${o.count} livres`}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

function SpaceCard({ space, price, member, overdue, planName, href }: {
  space: Space; price: ReturnType<typeof priceBooking>; member: boolean; overdue: boolean; planName?: string; href: string;
}) {
  const tags = spaceTags(space);
  const shown = tags.slice(0, 6);
  const extra = tags.length - shown.length;
  const access = space.features.accessibility;
  return (
    <li className="space-card">
      <div className="sc-top">
        <div>
          <h3>{space.name}</h3>
          <p className="muted">{space.kind}</p>
        </div>
        <span className="status status--confirmed"><Check />Livre</span>
      </div>
      {/* Na tela a foto fica no topo do cartão (CSS order); no código ela vem depois do nome,
          para o leitor de tela anunciar primeiro qual espaço é. */}
      <SpacePhoto space={space} className="sc-photo" sizes="(min-width: 1280px) 380px, (min-width: 700px) 50vw, 100vw" />
      <ul className="sc-tags" aria-label="Características">
        {shown.map((t) => <li key={t}>{t}</li>)}
        {extra > 0 && <li>+{extra}<span className="sr-only"> {extra === 1 ? 'característica' : 'características'} no resumo da reserva</span></li>}
      </ul>
      {access.length > 0 && <p className="sc-access"><b>Acessibilidade:</b> {access.join(' · ')}</p>}
      <div className="sc-foot">
        <p className="sc-price">
          <b>{brl(price.finalPrice)}</b>
          {price.discountPct > 0 && <s><span className="sr-only">preço cheio </span>{brl(price.fullPrice)}</s>}
          <small>
            {price.discountPct > 0
              ? `com ${price.discountPct}% do plano ${planName}`
              : overdue && member ? 'valor cheio: desconto suspenso' : 'valor cheio'}
          </small>
        </p>
        <Link className="btn btn-primary" to={href} aria-label={`Reservar ${space.name} por ${brl(price.finalPrice)}`}>Reservar <ArrowRight className="arrow" /></Link>
      </div>
    </li>
  );
}
