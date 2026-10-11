import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Calendar, Check, Clock, Leaf, Tag, Team, Undo } from '../components/Icons';
import { A11yMenu } from '../components/A11yMenu';
import { Logo } from '../components/Logo';
import { SkipLink } from '../components/SkipLink';
import { impactIndicators } from '../domain/impact';
import type { ArrivalMode } from '../domain/types';
import { SiteFooter } from '../features/landing/SiteFooter';
import { brl } from '../lib/format';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useDB } from '../store/store';
import '../styles/landing.css';
import '../styles/impact.css';

const PERIODS = [
  { id: '30', label: 'Últimos 30 dias', days: 30 },
  { id: '90', label: 'Últimos 90 dias', days: 90 },
  { id: 'all', label: 'Todo o período', days: null },
] as const;

const ARRIVAL_LABEL: Record<ArrivalMode, string> = {
  walk: 'A pé', bike: 'Bicicleta', transit: 'Transporte público', carpool: 'Carona', electric: 'Veículo elétrico',
};

const hours = (h: number) => `${h.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`;
const date = (d: Date) => d.toLocaleDateString('pt-BR');

/** T47 Nosso impacto (/impact): página pública. FR-024; RN21 (indicadores) e MSG-25 (sem dados).
 *  Só números agregados, sem nome ou dado pessoal de ninguém. */
export default function Impact() {
  useDocumentTitle('Nosso impacto · Hubbi');
  const db = useDB();
  const [params, setParams] = useSearchParams();
  const period = PERIODS.find((p) => p.id === params.get('period')) ?? PERIODS[0];
  const now = useMemo(() => new Date(), []);
  const ind = useMemo(() => impactIndicators(db, period.days, now), [db, period, now]);

  const choose = (id: string) => {
    const p = new URLSearchParams(params);
    if (id === '30') p.delete('period'); else p.set('period', id);
    setParams(p, { replace: true });
  };

  const maxArrival = Math.max(1, ...ind.arrivals.map((a) => a.count));

  return (
    <div className="landing impact">
      <SkipLink />
      <main id="topo" className="zoom-area">
        <div className="frame">
          <div className="nav">
            <Logo />
            <nav aria-label="Seções">
              <ul>
                <li><Link to="/">Início</Link></li>
                <li><Link to="/#planos">Planos</Link></li>
                <li><Link to="/#verde">Hubbi Verde</Link></li>
              </ul>
            </nav>
            <div className="nav-actions">
              <A11yMenu compact />
              <Link className="btn btn-ghost" to="/login">Entrar</Link>
              <Link className="btn btn-primary" to="/signup">Criar conta</Link>
            </div>
          </div>
          <div className="hero imp-hero" id="conteudo" tabIndex={-1}>
            <h1>Nosso impacto, <span className="tone">com números que dá para conferir.</span></h1>
            <p className="lead">Estes indicadores vêm das reservas, dos planos e dos pontos registrados no sistema. Só números somados, sem o nome de ninguém.</p>
            <div className="seg imp-seg" role="radiogroup" aria-label="Período">
              {PERIODS.map((p) => (
                <span key={p.id}>
                  <input type="radio" name="period" id={`per-${p.id}`} checked={period.id === p.id} onChange={() => choose(p.id)} />
                  <label htmlFor={`per-${p.id}`}>{p.label}</label>
                </span>
              ))}
            </div>
            <p className="micro">De {date(ind.from)} a {date(ind.to)}. Dados de exemplo e reservas feitas neste navegador.</p>
          </div>
        </div>

        {ind.empty ? (
          <section className="block imp-empty" aria-labelledby="imp-empty-t">
            <h2 id="imp-empty-t">Sem dados neste período.</h2>
            <p className="lead">Escolha outro período.</p>
            <div className="seg imp-seg" role="group" aria-label="Escolher outro período">
              {PERIODS.filter((p) => p.id !== period.id).map((p) => (
                <button key={p.id} type="button" className="btn btn-soft" onClick={() => choose(p.id)}>{p.label}</button>
              ))}
            </div>
          </section>
        ) : (
          <section className="block imp-grid" aria-label="Indicadores">
            <article className="imp-card wide" aria-labelledby="i-hours">
              <header><span className="ods">ODS 11 e 12</span><h2 id="i-hours">Horas de espaço usadas</h2></header>
              <div className="imp-pair">
                <p className="imp-big"><b>{hours(ind.hours.reserved)}</b><small>reservadas</small></p>
                <p className="imp-big"><b>{hours(ind.hours.completed)}</b><small>concluídas</small></p>
              </div>
              <p className="imp-note"><Calendar />Espaço que já existia, dividido entre mais pessoas.</p>
            </article>

            <article className="imp-card" aria-labelledby="i-lost">
              <header><span className="ods">ODS 12</span><h2 id="i-lost">Capacidade perdida</h2></header>
              <p className="imp-big"><b>{ind.lost.pct}%</b><small>das horas reservadas</small></p>
              <div className="imp-bar" role="img" aria-label={`${ind.lost.pct}% das horas reservadas foram perdidas`}><i style={{ width: `${ind.lost.pct}%` }} /></div>
              <p className="imp-note"><Clock />{hours(ind.lost.hours)} de {hours(ind.lost.base)}: faltas, reservas expiradas e cancelamentos com multa.</p>
            </article>

            <article className="imp-card" aria-labelledby="i-free">
              <header><span className="ods">ODS 12</span><h2 id="i-free">Horas liberadas cedo</h2></header>
              <p className="imp-big"><b>{hours(ind.green.freedHours)}</b><small>canceladas com 24 h ou mais</small></p>
              <p className="imp-note"><Undo />Quem avisa cedo devolve o horário para outra pessoa reservar.</p>
            </article>

            <article className="imp-card wide" aria-labelledby="i-occ">
              <header><span className="ods">ODS 12</span><h2 id="i-occ">Ocupação por espaço</h2></header>
              <ul className="imp-occ">
                {ind.occupancy.map((o) => (
                  <li key={o.id}>
                    <span className="o-name">{o.name}</span>
                    <div className="imp-bar" role="img" aria-label={`${o.name}: ${o.pct}% de ocupação`}><i style={{ width: `${Math.max(o.pct, o.hours ? 2 : 0)}%` }} /></div>
                    <span className="o-pct">{o.pct}%</span>
                  </li>
                ))}
              </ul>
              <p className="imp-note">Horas reservadas ÷ horas de funcionamento (7h às 22h, de segunda a sábado) no período.</p>
            </article>

            <article className="imp-card" aria-labelledby="i-soc">
              <header><span className="ods">ODS 8 e 10</span><h2 id="i-soc">Plano Social</h2></header>
              <div className="imp-pair">
                <p className="imp-big"><b>{ind.social.clients}</b><small>{ind.social.clients === 1 ? 'pessoa no plano' : 'pessoas no plano'}</small></p>
                <p className="imp-big"><b>{hours(ind.social.hours)}</b><small>reservadas por elas</small></p>
              </div>
              <p className="imp-note"><Team />Estudantes, microempreendedores e organizações sem fins lucrativos.</p>
            </article>

            <article className="imp-card" aria-labelledby="i-disc">
              <header><span className="ods">ODS 8 e 10</span><h2 id="i-disc">Desconto social concedido</h2></header>
              <p className="imp-big"><b>{brl(ind.socialDiscount)}</b><small>a menos pagos no período</small></p>
              <p className="imp-note"><Tag />Diferença entre o valor cheio e o valor final das reservas do Plano Social.</p>
            </article>

            <article className="imp-card" aria-labelledby="i-acc">
              <header><span className="ods">ODS 10 e 11</span><h2 id="i-acc">Espaços acessíveis</h2></header>
              <div className="imp-pair">
                <p className="imp-big"><b>{ind.accessibility.spaces} de {ind.accessibility.total}</b><small>espaços com recursos</small></p>
                <p className="imp-big"><b>{ind.accessibility.bookings}</b><small>reservas neles</small></p>
              </div>
              <p className="imp-note"><Check />Acesso sem degraus, banheiro adaptado, piso tátil e mais.</p>
            </article>

            <article className="imp-card" aria-labelledby="i-pts">
              <header><span className="ods">ODS 12</span><h2 id="i-pts">Pontos verdes</h2></header>
              <div className="imp-pair">
                <p className="imp-big"><b>{ind.green.granted}</b><small>concedidos</small></p>
                <p className="imp-big"><b>{ind.green.redeemed}</b><small>resgatados</small></p>
              </div>
              <p className="imp-note"><Leaf />Pontos vêm de reservas concluídas, sequências sem falta e chegada limpa.</p>
            </article>

            <article className="imp-card wide" aria-labelledby="i-arr">
              <header><span className="ods">ODS 11</span><h2 id="i-arr">Como as pessoas chegam</h2></header>
              {ind.arrivals.length ? (
                <ul className="imp-occ">
                  {ind.arrivals.map((a) => (
                    <li key={a.mode}>
                      <span className="o-name">{ARRIVAL_LABEL[a.mode]}</span>
                      <div className="imp-bar" role="img" aria-label={`${ARRIVAL_LABEL[a.mode]}: ${a.count} ${a.count === 1 ? 'chegada' : 'chegadas'}`}><i style={{ width: `${(a.count / maxArrival) * 100}%` }} /></div>
                      <span className="o-pct">{a.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Nenhuma chegada confirmada neste período.</p>
              )}
              <p className="imp-note">Só contam chegadas que a recepção confirmou.</p>
            </article>
          </section>
        )}

        <section className="block imp-method" aria-labelledby="imp-m-t">
          <h2 id="imp-m-t">Como calculamos</h2>
          <div className="imp-method-grid">
            <div>
              <h3>O que medimos</h3>
              <p>Tudo sai de registros do sistema: reservas, assinaturas e extrato de pontos. Cada número pode ser conferido nas reservas e nos pagamentos.</p>
            </div>
            <div>
              <h3>O que não medimos</h3>
              <p>Não estimamos emissões de carbono, economia de energia nem renda gerada. Não temos dados para sustentar esses números.</p>
            </div>
            <div>
              <h3>Quem aparece</h3>
              <p>Ninguém. A página mostra só totais e percentuais, sem nome, e-mail ou documento.</p>
            </div>
          </div>
        </section>

        <section className="final" aria-labelledby="imp-cta-t">
          <div className="inner">
            <h2 id="imp-cta-t">Faça parte <span className="tone">desses números.</span></h2>
            <p className="lead">Crie a conta, escolha o espaço pelo que você precisa e reserve hoje.</p>
            <div className="cta-stack">
              <Link className="btn btn-primary btn-lg" to="/signup">Criar conta grátis <ArrowRight /></Link>
              <p className="micro"><b>Cadastro sem custo.</b> Você só paga pelo que reservar.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
