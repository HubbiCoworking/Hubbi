import { Check } from '../../components/Icons';
import { SpacePhoto } from '../../components/SpacePhoto';
import { SPACES } from '../../data/catalog';

const EXAMPLE = SPACES.find((sp) => sp.id === 'estacao-norte')!;

const GROUPS = [
  { title: 'Equipamentos', items: ['Monitor extra', 'Cabo de rede', 'Quadro branco'] },
  { title: 'Ambiente', items: ['Ventilação natural', 'Luz natural'] },
  { title: 'Acessibilidade', items: ['Acesso sem degraus', 'Banheiro adaptado'] },
  { title: 'Práticas sustentáveis', items: ['Iluminação LED', 'Coleta seletiva'] },
];

const NUMBERS = [
  { value: 4, label: 'lugares' },
  { value: 12, label: 'tomadas' },
  { value: 500, label: 'Mbps' },
  { value: 4, label: 'computadores' },
];

const FEATURES = [
  { lead: 'Filtre pelo que importa:', text: 'lugares, tomadas, computadores, internet, ambiente e equipamentos.' },
  { lead: 'Acessibilidade à vista:', text: 'acesso sem degraus, banheiro adaptado, piso tátil e mais.' },
  { lead: 'Sem resultado?', text: 'A busca diz qual filtro mais limitou e sugere afrouxar.' },
];

export function SpaceDetail() {
  return (
    <section className="block split" aria-labelledby="sala-t">
      <div className="detail rv" aria-label="Exemplo de ficha de espaço">
        <div className="detail-head">
          <div><h3>Estação Norte</h3><p>Estação de trabalho · 2º andar · R$ 40,00 por hora</p></div>
          <span className="free"><Check />Livre</span>
        </div>
        <SpacePhoto space={EXAMPLE} className="detail-photo" sizes="(min-width: 1020px) 520px, 100vw" />
        <div className="nums">
          {NUMBERS.map((n) => <div className="num" key={n.label}><b>{n.value}</b><span>{n.label}</span></div>)}
        </div>
        {GROUPS.map((g) => (
          <div className="group" key={g.title}>
            <h4>{g.title}</h4>
            <div className="tags">{g.items.map((i) => <span key={i}>{i}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="copy">
        <h2 id="sala-t" className="rv">Cada equipe acha <span className="tone">a sala que precisa.</span></h2>
        <p className="lead">Marketing quer quadro branco e luz natural. Desenvolvimento quer tomada e internet rápida. No Hubbi, cada espaço mostra o que tem antes de você sair de casa.</p>
        <ul className="feature-list">
          {FEATURES.map((f) => (
            <li key={f.lead}><span className="tick" aria-hidden="true"><Check /></span><span><b>{f.lead}</b> {f.text}</span></li>
          ))}
        </ul>
        <div><a className="btn btn-soft" href="#espacos">Testar os atalhos</a></div>
      </div>
    </section>
  );
}
