import { Link } from 'react-router-dom';
import { ArrowRight } from '../../components/Icons';

export function FinalCta() {
  return (
    <section className="final" aria-labelledby="final-t">
      <div className="inner">
        <h2 id="final-t">Leu até aqui? <span className="tone">Sua próxima reunião já tem lugar.</span></h2>
        <p className="lead">Crie a conta, escolha o espaço pelo que você precisa e faça a primeira reserva hoje.</p>
        <div className="cta-stack">
          <Link className="btn btn-primary btn-lg" to="/signup">Criar conta grátis <ArrowRight /></Link>
          <p className="micro"><b>Cadastro sem custo.</b> Você só paga pelo que reservar.</p>
        </div>
      </div>
    </section>
  );
}
