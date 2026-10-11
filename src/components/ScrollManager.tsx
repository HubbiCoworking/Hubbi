import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Ao trocar de página: vai para a âncora (#planos) se houver, senão para o topo.
 *  Também leva o foco ao título da nova página (WCAG 2.4.3): quem usa leitor de tela ouve onde
 *  chegou, e quem usa teclado continua dali, sem voltar ao menu. Na primeira carga não mexe. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
      return () => cancelAnimationFrame(raf);
    }
    window.scrollTo(0, 0);
    if (first.current) { first.current = false; return; }
    // Depois dos efeitos da página nova (ela pode focar um alerta por conta própria).
    const raf = requestAnimationFrame(() => {
      if (document.activeElement && document.activeElement !== document.body && document.activeElement.closest('main')) return;
      const target = document.querySelector<HTMLElement>('main h1') ?? document.querySelector<HTMLElement>('main');
      if (!target) return;
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);
  return null;
}
