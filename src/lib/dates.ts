const day = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const short = new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dmy = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Sexta-feira, 10 de outubro" */
export const longDay = (d: Date) => cap(day.format(d));
/** "Sáb., 11/10" */
export const shortDay = (d: Date) => cap(short.format(d)).replace('.,', ',');
/** "14:00" */
export const hhmm = (d: Date) => time.format(d);
/** "10/10/2026" */
export const ddmmyyyy = (d: Date) => dmy.format(d);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Diferença em dias de calendário (0 = hoje). */
export const daysBetween = (from: Date, to: Date) => Math.round((startOfDay(to) - startOfDay(from)) / 86_400_000);

/** "hoje", "amanhã", "em 3 dias" */
export function relativeDay(target: Date, now: Date): string {
  const n = daysBetween(now, target);
  if (n === 0) return 'hoje';
  if (n === 1) return 'amanhã';
  if (n === -1) return 'ontem';
  return n > 0 ? `em ${n} dias` : `há ${-n} dias`;
}

/** Dia de funcionamento mais próximo: segunda a sábado (spec 001, Assumptions; RN04).
 *  Domingo vira segunda no futuro e sábado no passado. */
export function atBusinessDay(now: Date, addDays: number, hour: number, minute = 0): Date {
  const d = atDay(now, addDays, hour, minute);
  if (d.getDay() === 0) d.setDate(d.getDate() + (addDays >= 0 ? 1 : -1));
  return d;
}

/** Data local mais n dias, com hora e minuto definidos. */
export function atDay(now: Date, addDays: number, hour: number, minute = 0): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + addDays, hour, minute, 0, 0);
}
