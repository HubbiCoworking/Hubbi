import { useEffect, useState } from 'react';

/** Preferências de acessibilidade escolhidas na página (botão "Acessibilidade").
 *  Ficam só neste navegador, numa chave separada dos dados do protótipo (não mexem em VERSION). */
export type A11yPrefs = {
  /** Tamanho do conteúdo: 100%, 115% ou 130%. */
  text: 'md' | 'lg' | 'xl';
  /** Cores mais escuras, bordas visíveis e links sublinhados. */
  contrast: boolean;
  /** Sem animações, mesmo que o sistema não peça. */
  motion: boolean;
  /** Links sempre sublinhados. */
  links: boolean;
};

const KEY = 'hubbi:a11y';
const EVENT = 'hubbi:a11y';
export const A11Y_DEFAULTS: A11yPrefs = { text: 'md', contrast: false, motion: false, links: false };

export function loadA11y(): A11yPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...A11Y_DEFAULTS, ...(JSON.parse(raw) as Partial<A11yPrefs>) } : A11Y_DEFAULTS;
  } catch {
    return A11Y_DEFAULTS;
  }
}

/** Aplica as preferências no <html> (data-*); o CSS de tokens.css faz o resto. */
export function applyA11y(p: A11yPrefs) {
  const d = document.documentElement.dataset;
  d.text = p.text;
  d.contrast = p.contrast ? 'high' : 'normal';
  d.motion = p.motion ? 'reduce' : 'auto';
  d.links = p.links ? 'underline' : 'auto';
}

export function saveA11y(p: A11yPrefs) {
  applyA11y(p);
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* navegador sem armazenamento: vale só nesta visita */ }
  window.dispatchEvent(new Event(EVENT));
}

export function useA11yPrefs(): [A11yPrefs, (next: A11yPrefs) => void] {
  const [prefs, setPrefs] = useState(loadA11y);
  useEffect(() => {
    const sync = () => setPrefs(loadA11y());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return [prefs, (next) => { setPrefs(next); saveA11y(next); }];
}

/** A pessoa pediu menos movimento aqui na página (o pedido do sistema é tratado em motion.ts). */
export const motionReducedHere = () => document.documentElement.dataset.motion === 'reduce';
export const A11Y_EVENT = EVENT;
