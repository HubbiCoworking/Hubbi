import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { A11yMenu } from '../../components/A11yMenu';
import { Logo } from '../../components/Logo';
import { ArrowRight, Close, Menu } from '../../components/Icons';
import { cssVars } from '../../lib/style';
import { NeedDemo } from './NeedDemo';

const NAV = [
  { href: '#espacos', label: 'Espaços' },
  { href: '#simulador', label: 'Preços' },
  { href: '#planos', label: 'Planos' },
  { href: '#verde', label: 'Hubbi Verde' },
  { href: '#duvidas', label: 'Dúvidas' },
];

export function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha o menu com Esc e quando a tela volta a ter espaço para os links.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    const mq = window.matchMedia('(min-width: 1021px)');
    const onWide = () => { if (mq.matches) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onWide);
    return () => { window.removeEventListener('keydown', onKey); mq.removeEventListener('change', onWide); };
  }, [menuOpen]);

  return (
    <div className="frame">
      <div className="nav">
        <Logo />
        <nav aria-label="Seções">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}><a href={n.href}>{n.label}</a></li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <A11yMenu compact className="nav-a11y" />
          <Link className="btn btn-ghost" to="/login">Entrar</Link>
          <Link className="btn btn-primary" to="/signup">Criar conta</Link>
          <button
            className="menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="menu-movel"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <Close /> : <Menu />}
          </button>
        </div>
        <nav id="menu-movel" className="menu-panel" aria-label="Menu" hidden={!menuOpen}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>
          ))}
          <A11yMenu className="menu-a11y" />
          <hr />
          <Link to="/login" onClick={() => setMenuOpen(false)}>Entrar</Link>
          <Link className="btn btn-primary" to="/signup" onClick={() => setMenuOpen(false)}>Criar conta grátis</Link>
        </nav>
      </div>

      <div className="hero" id="conteudo" tabIndex={-1}>
        <a className="chip-news" href="#verde" style={cssVars({ '--i': 0 })}><b>Novo</b> Ganhe pontos ao usar bem o espaço</a>
        <h1 style={cssVars({ '--i': 1 })}>
          Seu espaço de trabalho, <span className="tone">reservado em poucos cliques.</span>
        </h1>
        <p className="lead" style={cssVars({ '--i': 3 })}>
          Escolha a sala pelo que a sua equipe precisa, veja o preço final antes de confirmar e cancele sabendo quanto volta para você.
        </p>
        <div className="cta-stack" style={cssVars({ '--i': 4 })}>
          <Link className="btn btn-primary btn-lg" to="/signup">Criar conta grátis <ArrowRight /></Link>
          <p className="micro"><b>Cadastro sem custo.</b> Você só paga pelo que reservar.</p>
        </div>
        <p className="hand" aria-hidden="true">
          Clique num atalho<br />e veja o filtro!
          <svg viewBox="0 0 64 56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M58 4C40 8 20 20 12 46" /><path d="M4 38l8 10 10-8" /></svg>
        </p>
      </div>

      <NeedDemo />
    </div>
  );
}
