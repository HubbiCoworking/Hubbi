import { Link } from 'react-router-dom';

const QUESTIONS = [
  { q: 'Preciso pagar para criar conta?', a: 'Não. O cadastro é grátis. Você paga cada reserva ou assina um plano para ter desconto.' },
  { q: 'Como pago a minha reserva?', a: 'Na recepção. A reserva fica aguardando pagamento por até 2 horas, ou até 1 hora antes do início. Sem pagamento nesse prazo, o horário volta a ficar livre e não há multa.' },
  { q: 'Com quanta antecedência posso reservar?', a: 'Pelo site, com pelo menos 1 hora de antecedência. Em cima da hora, fale com a recepção, que reserva e registra o pagamento na hora.' },
  { q: 'E se eu precisar cancelar?', a: 'Com 24 horas ou mais, sem multa. Entre 24 e 2 horas antes, multa de 50%. Com menos de 2 horas, 100%. O valor aparece antes de você confirmar o cancelamento.' },
  { q: 'Quem pode ter o Plano Social?', a: 'Estudantes, microempreendedores e organizações sem fins lucrativos. A recepção confirma o direito na contratação e registra só a categoria, sem guardar documentos.' },
  { q: 'Os pontos verdes valem dinheiro?', a: 'Não. Eles viram desconto: 100 pontos dão 10% numa reserva. Os pontos vencem em 12 meses e não podem ser transferidos.' },
];

export function Faq() {
  return (
    <section className="block" id="duvidas" aria-labelledby="faq-t">
      <div className="split" style={{ alignItems: 'start' }}>
        <div className="copy">
          <h2 id="faq-t" className="rv">Ficou com dúvida? <span className="tone">A gente responde.</span></h2>
          <p className="lead">Separamos as perguntas que mais chegam na recepção.</p>
          <div className="cta-stack">
            <Link className="btn btn-primary" to="/signup">Criar conta grátis</Link>
            <p className="micro"><b>Cadastro sem custo.</b> Você só paga pelo que reservar.</p>
          </div>
        </div>
        <div className="faq rv-1">
          {QUESTIONS.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
