import { Link } from 'react-router-dom';
import { Logo } from '../../components/Logo';

const COLUMNS = [
  { title: 'Produto', links: [['#espacos', 'Espaços'], ['#simulador', 'Simular preço'], ['#planos', 'Planos'], ['#verde', 'Hubbi Verde'], ['/impact', 'Nosso impacto']] },
  { title: 'Ajuda', links: [['#duvidas', 'Dúvidas frequentes'], ['#duvidas', 'Política de cancelamento'], ['#duvidas', 'Falar com a recepção']] },
  { title: 'Legal', links: [['#topo', 'Termos de uso'], ['#topo', 'Privacidade e LGPD']] },
];

export function SiteFooter() {
  return (
    <footer>
      <div className="foot-grid">
        <div>
          <Logo />
          <p className="about">Três pessoas, uma mesa, um ponto de encontro. Reservas de espaços de trabalho com preço claro.</p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <ul>{c.links.map(([href, label]) => <li key={label}><Link to={href.startsWith('#') ? `/${href}` : href}>{label}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="foot-bottom"><span>© 2026 Hubbi</span><span>Protótipo com espaços, preços e pessoas de exemplo.</span></div>
    </footer>
  );
}
