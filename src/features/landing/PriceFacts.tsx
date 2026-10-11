import { Calculator, Tag, Undo } from '../../components/Icons';

export function PriceFacts() {
  return (
    <section className="block center" aria-labelledby="preco-t">
      <h2 id="preco-t" className="rv">O preço final aparece <span className="tone">antes de você confirmar.</span></h2>
      <p className="lead rv">Nada de valor combinado na hora. A conta é sempre a mesma e está na tela.</p>
      <div className="facts">
        <div className="fact big rv-1">
          <div className="icon" aria-hidden="true"><Calculator /></div>
          <p className="eq">Preço por hora × horas <em>− desconto do seu plano</em></p>
          <p>O valor fica gravado na reserva. Se o preço do espaço mudar depois, o seu não muda.</p>
        </div>
        <div className="fact rv-2">
          <div className="icon" aria-hidden="true"><Undo /></div>
          <h3>Cancelou com 24h? Volta tudo.</h3>
          <p>Entre 24h e 2h antes, a multa é de 50%. Você vê o valor da multa e do estorno antes de confirmar.</p>
        </div>
        <div className="fact rv-3">
          <div className="icon" aria-hidden="true"><Tag /></div>
          <h3>Membro paga menos sempre</h3>
          <p>De 10% a 30% de desconto em toda reserva, conforme o plano.</p>
        </div>
      </div>
      <div className="cta-stack" style={{ alignItems: 'center', marginTop: 20 }}>
        <a className="btn btn-primary btn-lg" href="#simulador">Simular minha reserva</a>
        <p className="micro"><b>Sem taxa escondida.</b> O que aparece é o que você paga.</p>
      </div>
    </section>
  );
}
