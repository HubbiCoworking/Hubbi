import { useCallback, useEffect, useRef, useState } from 'react';
import { A11Y_EVENT, motionReducedHere } from './a11y';

const QUERY = '(prefers-reduced-motion: reduce)';

/** true quando a pessoa pediu menos movimento no sistema ou no botão "Acessibilidade". */
export function useReducedMotion(): boolean {
  const read = () => typeof window !== 'undefined' && (window.matchMedia(QUERY).matches || motionReducedHere());
  const [reduce, setReduce] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduce(read());
    mq.addEventListener('change', onChange);
    window.addEventListener(A11Y_EVENT, onChange);
    return () => { mq.removeEventListener('change', onChange); window.removeEventListener(A11Y_EVENT, onChange); };
  }, []);
  return reduce;
}

/** Conta um número até o alvo (resposta a uma ação). Sem animação quando reduce = true. */
export function useTweenedNumber(target: number, ms = 450, reduce = false, from?: number): number {
  const [value, setValue] = useState(from ?? target);
  const valueRef = useRef(value);
  valueRef.current = value;
  useEffect(() => {
    const start = valueRef.current;
    if (reduce || start === target) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setValue(k < 1 ? start + (target - start) * eased : target);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduce]);
  return value;
}

/** Reinicia uma animação CSS de classe (ex.: "shake") no elemento. */
export function useReplayClass<T extends HTMLElement>(className: string, reduce: boolean) {
  const ref = useRef<T>(null);
  const play = useCallback(() => {
    const el = ref.current;
    if (!el || reduce) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.classList.add(className);
  }, [className, reduce]);
  return [ref, play] as const;
}

/** Chama onEnter uma vez quando o elemento aparece na tela. */
export function useOnceInView<T extends HTMLElement>(onEnter: () => void, threshold = 0.6) {
  const ref = useRef<T>(null);
  const cb = useRef(onEnter);
  cb.current = onEnter;
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          cb.current();
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

/** Anima um número de "from" até "to" chamando onFrame a cada quadro. Devolve a função de cancelar. */
export function animateNumber(from: number, to: number, ms: number, onFrame: (v: number) => void): () => void {
  let raf = 0;
  const t0 = performance.now();
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    onFrame(k < 1 ? from + (to - from) * (1 - Math.pow(1 - k, 3)) : to);
    if (k < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => cancelAnimationFrame(raf);
}
