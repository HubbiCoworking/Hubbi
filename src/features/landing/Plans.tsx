import { Link } from 'react-router-dom';
import { PLANS } from '../../data/catalog';
import { brl } from '../../lib/format';

export function Plans() {
  return (
    <section className="block center" id="planos" aria-labelledby="planos-t">
      <h2 id="planos-t" className="rv">Vem sempre? <span className="tone">Assine e pague menos.</span></h2>
      <p className="lead rv">Todo plano dura 30 dias e dá desconto em qualquer espaço. Você pede pelo site e a recepção ativa quando o pagamento é registrado.</p>
      <div className="plans">
        {PLANS.map((p, i) => (
          <article key={p.id} className={`plan${p.social ? ' social' : ''} rv-${Math.min(i + 1, 3)}`}>
            {p.social && <span className="badge">Preço social</span>}
            <h3>{p.name}</h3>
            <p className="pct">{p.discount}%<small>de desconto</small></p>
            <p className="cost"><b>{brl(p.price)}</b> a cada 30 dias</p>
            <p className="desc">{p.description}</p>
            <Link className={`btn ${p.social ? 'btn-primary' : 'btn-soft'}`} to="/login?intent=plan">Quero o {p.name}</Link>
          </article>
        ))}
      </div>
      <p className="plans-note">Cancelar ou trocar de plano não gera devolução: o plano vale até o vencimento já pago.</p>
    </section>
  );
}
