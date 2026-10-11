import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from '../../components/Icons';
import { DEMO_MEMBER } from '../../data/catalog';
import { animateNumber, useOnceInView, useReducedMotion } from '../../lib/motion';

const RULES = [
  { lead: '10 pontos', text: 'por reserva concluída.' },
  { lead: '20 pontos extras', text: 'a cada 5 reservas seguidas sem falta.' },
  { lead: '5 pontos', text: 'quando você chega a pé, de bicicleta, transporte público, carona ou veículo elétrico. A recepção confirma.' },
  { lead: '100 pontos', text: 'viram 10% de desconto numa reserva.' },
];

const LEDGER = [
  { title: 'Reserva concluída', meta: 'Sala Aurora · 10/10', value: '+10', plus: true },
  { title: 'Chegada limpa: bicicleta', meta: 'Confirmada pela recepção · 10/10', value: '+5', plus: true },
  { title: 'Sequência de 5 reservas', meta: 'Sem nenhuma falta · 08/10', value: '+20', plus: true },
  { title: 'Resgate de desconto', meta: 'Mesa 12 · 02/10', value: '−100', plus: false },
];

const ODS = [
  { n: 8, name: 'Trabalho decente', text: 'Plano Social para quem estuda e empreende.', rv: 'rv-1' },
  { n: 10, name: 'Menos desigualdade', text: 'Preço reduzido e acessibilidade em cada espaço.', rv: 'rv-1' },
  { n: 11, name: 'Cidades sustentáveis', text: 'Espaço compartilhado e chegada limpa premiada.', rv: 'rv-2' },
  { n: 12, name: 'Consumo responsável', text: 'Menos sala reservada e vazia.', rv: 'rv-2' },
];

export function Verde() {
  const reduce = useReducedMotion();
  const [points, setPoints] = useState<number>(DEMO_MEMBER.points);
  const pointsRef = useOnceInView<HTMLElement>(() => {
    if (!reduce) animateNumber(0, DEMO_MEMBER.points, 900, (v) => setPoints(Math.round(v)));
  });

  return (
    <section className="block" id="verde" aria-labelledby="verde-t">
      <div className="split">
        <div className="copy">
          <h2 id="verde-t" className="rv">Usou bem o espaço? <span className="tone">Ganhou pontos.</span></h2>
          <p className="lead">O Hubbi Verde premia quem comparece e chega de jeito mais limpo. Sala reservada e vazia é energia e lugar desperdiçados.</p>
          <ul className="feature-list">
            {RULES.map((r) => (
              <li key={r.lead}><span className="tick" aria-hidden="true"><Check /></span><span><b>{r.lead}</b> {r.text}</span></li>
            ))}
          </ul>
        </div>
        <div className="verde-card rv-1" aria-label="Exemplo de extrato de pontos verdes">
          <header>
            <div><p>Seu saldo (exemplo)</p><strong ref={pointsRef}>{points}</strong></div>
            <p>pontos verdes</p>
          </header>
          <ul className="ledger">
            {LEDGER.map((l) => (
              <li key={l.title}>
                <span>{l.title}<small>{l.meta}</small></span>
                <b className={l.plus ? 'plus' : 'minus'}>{l.value}</b>
              </li>
            ))}
          </ul>
          <div className="goal">
            Já dá para trocar 100 pontos por 10% de desconto
            <div className="bar" role="img" aria-label="100 de 100 pontos para o próximo desconto"><i /></div>
          </div>
        </div>
      </div>
      <div className="ods" aria-label="Objetivos de Desenvolvimento Sustentável apoiados">
        {ODS.map((o) => (
          <div key={o.n} className={o.rv}><b>{o.n}</b><span>{o.name}</span><p>{o.text}</p></div>
        ))}
      </div>
      <p className="ods-cap">Alinhado aos Objetivos de Desenvolvimento Sustentável da ONU. <Link to="/impact">Veja os números do nosso impacto</Link>.</p>
    </section>
  );
}
