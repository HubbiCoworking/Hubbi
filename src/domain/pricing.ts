import { round2 } from '../lib/format';

/** RN02 e RN06: preço = preço/hora × horas × (1 − desconto do plano), depois o abatimento verde (RN22).
 *  Os valores devolvidos são gravados na reserva e não mudam depois. */
export function priceBooking(hourly: number, hours: number, discountPct: number, greenPct = 0) {
  const fullPrice = round2(hourly * hours);
  const afterPlan = round2(fullPrice * (1 - discountPct / 100));
  const greenDiscount = round2((afterPlan * greenPct) / 100);
  return { fullPrice, discountPct, greenDiscount, finalPrice: round2(afterPlan - greenDiscount) };
}
