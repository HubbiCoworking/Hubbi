import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Close, HomeIcon, Leaf, LogOut, More, Search, Tag } from '../../components/Icons';
import { A11yMenu } from '../../components/A11yMenu';
import { Logo } from '../../components/Logo';
import { SkipLink } from '../../components/SkipLink';
import { activeSubscription, isPersistent, sessionClient, signOut, useDB } from '../../store/store';
import '../../styles/portal.css';

const NAV = [
  { to: '/app', label: 'Início', short: 'Início', Icon: HomeIcon },
  { to: '/app/spaces', label: 'Espaços', short: 'Espaços', Icon: Search },
  { to: '/app/bookings', label: 'Minhas reservas', short: 'Reservas', Icon: Calendar },
  { to: '/app/plan', label: 'Meu plano', short: 'Plano', Icon: Tag },
  { to: '/app/rewards', label: 'Hubbi Verde', short: 'Verde', Icon: Leaf },
];

/** Item ativo do menu. O resumo de uma reserva nova (/app/bookings/new) ainda faz parte de
 *  "Espaços": a pessoa está escolhendo, não consultando as reservas. */
function isCurrent(to: string, pathname: string): boolean {
  if (to === '/app') return pathname === '/app';
  if (to === '/app/spaces') return pathname.startsWith('/app/spaces') || pathname === '/app/bookings/new';
  if (to === '/app/bookings') return pathname.startsWith('/app/bookings') && pathname !== '/app/bookings/new';
  return pathname.startsWith(to);
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');

/** Estrutura da área logada (design.md 7.2): menu lateral no computador; barra superior e
 *  barra inferior com 4 itens no celular e no tablet. */
export function PortalLayout() {
  const db = useDB();
  const client = sessionClient(db)!;
  const membership = activeSubscription(db, client.id);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreBtn = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);

  // Ao trocar de página o painel fecha; o foco vai para o título da nova página (ScrollManager).
  useEffect(() => setMoreOpen(false), [pathname]);
  /** Fechar sem trocar de página devolve o foco ao botão "Mais". */
  const closeMore = () => { setMoreOpen(false); moreBtn.current?.focus(); };

  // Painel "Mais": foco no primeiro item, Tab preso dentro e Esc fecha (como o Dialog).
  useEffect(() => {
    if (!moreOpen) return;
    const items = () => [...(sheet.current?.querySelectorAll<HTMLElement>('a, button') ?? [])];
    items()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeMore(); return; }
      if (e.key !== 'Tab') return;
      const list = [...items(), moreBtn.current!];
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); list[list.length - 1]?.focus(); }
      else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0]?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  const kind = membership ? `Membro · ${membership.plan.name}` : 'Cliente avulso';
  const logout = () => { signOut(); navigate('/login'); };
  const moreActive = pathname.startsWith('/app/plan') || pathname.startsWith('/app/rewards');

  return (
    <div className={`portal${moreOpen ? ' sheet-open' : ''}`}>
      <SkipLink />
      <aside className="side" aria-label="Menu da conta">
        <Logo to="/app" label="Hubbi, início da sua conta" />
        <nav aria-label="Principal">
          <ul>
            {NAV.map(({ to, label, Icon }) => (
              <li key={to}><Link to={to} aria-current={isCurrent(to, pathname) ? 'page' : undefined}><Icon />{label}</Link></li>
            ))}
          </ul>
        </nav>
        <A11yMenu className="side-a11y" />
        <div className="side-user">
          <span className="avatar" aria-hidden="true">{initials(client.name)}</span>
          <div><b>{client.name}</b><span>{kind}</span></div>
          <button type="button" className="icon-btn" onClick={logout} aria-label="Sair da conta"><LogOut /></button>
        </div>
      </aside>

      <header className="topbar">
        <Logo to="/app" label="Hubbi, início da sua conta" />
        <span className="top-end">
          <A11yMenu compact />
          <span className="top-user"><span className="avatar" aria-hidden="true">{initials(client.name)}</span><span className="top-name">{client.name.split(' ')[0]}</span></span>
        </span>
      </header>

      <main className="portal-main zoom-area" id="conteudo" tabIndex={-1}>
        {!isPersistent() && (
          <p className="storage-note" role="status">Este navegador não permite salvar dados. O que você fizer agora some ao fechar a página.</p>
        )}
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Principal">
        {NAV.slice(0, 3).map(({ to, short, Icon }) => (
          <Link key={to} to={to} aria-current={isCurrent(to, pathname) ? 'page' : undefined}><Icon /><span>{short}</span></Link>
        ))}
        <button ref={moreBtn} type="button" className={moreActive ? 'active' : ''} aria-expanded={moreOpen} aria-controls="mais" aria-haspopup="dialog" onClick={() => (moreOpen ? closeMore() : setMoreOpen(true))}>
          {moreOpen ? <Close /> : <More />}<span>Mais</span>
        </button>
      </nav>
      {moreOpen && (
        <>
          <div className="sheet-backdrop" onClick={closeMore} aria-hidden="true" />
          <div className="sheet" id="mais" role="dialog" aria-modal="true" aria-label="Mais opções" ref={sheet}>
            <div className="sheet-user"><span className="avatar" aria-hidden="true">{initials(client.name)}</span><div><b>{client.name}</b><span>{kind}</span></div></div>
            {NAV.slice(3).map(({ to, label, Icon }) => (
              <Link key={to} to={to} aria-current={isCurrent(to, pathname) ? 'page' : undefined}><Icon />{label}</Link>
            ))}
            <button type="button" onClick={logout}><LogOut />Sair da conta</button>
          </div>
        </>
      )}
    </div>
  );
}
