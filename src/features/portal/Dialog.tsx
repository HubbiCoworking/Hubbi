import { useEffect, useRef, type ReactNode } from 'react';

type Props = { title: string; describedBy?: string; onClose: () => void; children: ReactNode };

/** Painel modal acessível: foco no primeiro controle, foco preso dentro, Esc fecha (design.md 7.2). */
export function Dialog({ title, describedBy, onClose, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      [...(ref.current?.querySelectorAll<HTMLElement>('button, [href], input, textarea, select') ?? [])].filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      opener?.focus?.();
    };
  }, []);

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-t" aria-describedby={describedBy} ref={ref}>
        <h2 id="dialog-t">{title}</h2>
        {children}
      </div>
    </div>
  );
}
