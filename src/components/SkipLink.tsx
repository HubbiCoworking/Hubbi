/** Primeiro item do Tab: leva direto ao conteúdo, sem passar pelo menu (WCAG 2.4.1). */
export function SkipLink({ to = 'conteudo' }: { to?: string }) {
  return (
    <a
      className="skip-link"
      href={`#${to}`}
      onClick={(e) => {
        const target = document.getElementById(to);
        if (!target) return;
        e.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      }}
    >
      Pular para o conteúdo
    </a>
  );
}
