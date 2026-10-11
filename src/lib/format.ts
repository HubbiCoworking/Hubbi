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

/** "Falta" ou "Faltam" conforme a quantidade: "Falta 1 ponto", "Faltam 3 pontos". */
export const falta = (n: number): string => (n === 1 ? 'Falta' : 'Faltam');
/** O mesmo para um tempo já formatado: "Falta 1 dia", "Faltam 2 dias", "Faltam 1 dia e 3 h". */
export const faltaTempo = (left: string): string => (/^1 (dia|h|min)$/.test(left) ? 'Falta' : 'Faltam');
