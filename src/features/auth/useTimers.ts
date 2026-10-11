import { useCallback, useEffect, useRef } from 'react';

/** setTimeout que é limpo ao sair da tela ou ao chamar clear(). */
export function useTimers() {
  const ids = useRef<number[]>([]);
  const clear = useCallback(() => {
    ids.current.forEach((id) => window.clearTimeout(id));
    ids.current = [];
  }, []);
  const later = useCallback((fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => clear, [clear]);
  return { later, clear };
}
