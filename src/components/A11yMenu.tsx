import { useId, useRef } from 'react';
import { A11Y_DEFAULTS, useA11yPrefs, type A11yPrefs } from '../lib/a11y';
import { Access, Close } from './Icons';

const SIZES: { id: A11yPrefs['text']; label: string; sample: string }[] = [
  { id: 'md', label: 'Normal', sample: 'A' },
  { id: 'lg', label: 'Grande', sample: 'A+' },
  { id: 'xl', label: 'Muito grande', sample: 'A++' },
];

const TOGGLES: { key: 'contrast' | 'links' | 'motion'; label: string; help: string }[] = [
  { key: 'contrast', label: 'Alto contraste', help: 'Textos mais escuros e bordas mais visíveis.' },
  { key: 'links', label: 'Sublinhar links', help: 'Todos os links ficam sublinhados.' },
  { key: 'motion', label: 'Reduzir animações', help: 'A página para de mover e animar elementos.' },
];

type Props = { className?: string; compact?: boolean };

/** Botão "Acessibilidade" e o painel de preferências (tamanho do texto, contraste, links e
 *  animações). Usa o <dialog> nativo: foco preso no painel, Esc fecha e o foco volta ao botão. */
export function A11yMenu({ className, compact = false }: Props) {
  const [prefs, setPrefs] = useA11yPrefs();
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  const changed = JSON.stringify(prefs) !== JSON.stringify(A11Y_DEFAULTS);

  return (
    <>
      <button
        type="button"
        className={`a11y-btn${compact ? ' compact' : ''} ${className ?? ''}`.trim()}
        aria-haspopup="dialog"
        aria-label={compact ? 'Acessibilidade' : undefined}
        onClick={() => ref.current?.showModal()}
      >
        <Access />{!compact && <span>Acessibilidade</span>}
      </button>
      <dialog
        ref={ref}
        className="a11y-dialog"
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-d`}
        onClick={(e) => { if (e.target === e.currentTarget) ref.current?.close(); }}
      >
        <div className="a11y-inner">
          <div className="a11y-head">
            <h2 id={`${id}-t`}>Acessibilidade</h2>
            <button type="button" className="a11y-close" onClick={() => ref.current?.close()} aria-label="Fechar"><Close /></button>
          </div>
          <p id={`${id}-d`} className="a11y-desc">Ajuste a página do seu jeito. A escolha fica salva neste navegador.</p>

          <fieldset className="a11y-sizes">
            <legend>Tamanho do texto</legend>
            <div>
              {SIZES.map((s) => (
                <label key={s.id}>
                  <input type="radio" name={`${id}-size`} checked={prefs.text === s.id} onChange={() => setPrefs({ ...prefs, text: s.id })} />
                  <span><b aria-hidden="true">{s.sample}</b>{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <ul className="a11y-toggles">
            {TOGGLES.map((t) => (
              <li key={t.key}>
                <label>
                  <span><b>{t.label}</b><small id={`${id}-${t.key}`}>{t.help}</small></span>
                  <input type="checkbox" role="switch" checked={prefs[t.key]} aria-describedby={`${id}-${t.key}`} onChange={(e) => setPrefs({ ...prefs, [t.key]: e.target.checked })} />
                </label>
              </li>
            ))}
          </ul>

          <p className="a11y-tip">
            Usa leitor de tela? A página tem títulos em ordem, um link “Pular para o conteúdo” no início e
            todas as fotos têm descrição. Pelo teclado: <kbd>Tab</kbd> avança, <kbd>Shift</kbd> + <kbd>Tab</kbd> volta
            e <kbd>Esc</kbd> fecha painéis.
          </p>
          <p className="a11y-tip">
            Prefere Libras? Use o botão azul do <b>VLibras</b>, na lateral direita da tela: ele traduz
            o texto que você selecionar.
          </p>

          <div className="a11y-actions">
            {changed && <button type="button" className="a11y-reset" onClick={() => setPrefs(A11Y_DEFAULTS)}>Voltar ao padrão</button>}
            <button type="button" className="a11y-done" onClick={() => ref.current?.close()}>Pronto</button>
          </div>
        </div>
      </dialog>
    </>
  );
}
