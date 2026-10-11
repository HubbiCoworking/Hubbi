/** Arredonda para centavos, meio para cima (data-model.md, seção 4). */
export const round2 = (v: number): number => Math.round((v + Number.EPSILON) * 100) / 100;

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
/** Formata em reais: R$ 1.234,56 */
export const brl = (v: number): string => brlFormatter.format(v);

/** 2 → "2 h"; 2.5 → "2 h 30 min" */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} h${m ? ` ${m} min` : ''}`;
}
