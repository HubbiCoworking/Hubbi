import type { CSSProperties } from 'react';

/** Variáveis CSS inline, como --i para a ordem das animações de entrada. */
export const cssVars = (vars: Record<string, string | number>): CSSProperties => vars as CSSProperties;
