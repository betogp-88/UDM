/**
 * Motor de calculo. Estas formulas SI son las reales — quedaron definidas con
 * la direccion. Lo que es de demostracion son los datos, no la aritmetica.
 *
 * Convenciones acordadas:
 * - El mes cuenta completo: un mes de 28 dias paga igual que uno de 31.
 *   Interes mensual = capital x tasa anual / 12.
 * - Inversionistas: interes mensual, capital al vencimiento (no se amortiza).
 * - Retencion de ISR sobre CAPITAL, no sobre interes, a tasa anual de la Ley
 *   de Ingresos. Se resuelve por la fecha de cada pago, no por la del contrato.
 * - Creditos: pago fijo mensual (amortizacion francesa). La gracia es solo de
 *   capital: durante la gracia se pagan intereses y el plazo total no se recorre.
 */

import { sumarMeses } from "@/lib/formato";

/** Tasa anual de retencion sobre capital, por año. Configurable: cambia cada año. */
export const TASAS_RETENCION: Record<number, number> = {
  2026: 0.0090,
  2027: 0.0068,
};

/** Resuelve la tasa del año dado; si no esta capturada, usa la mas cercana conocida. */
export function tasaRetencion(anio: number): number {
  if (TASAS_RETENCION[anio] !== undefined) return TASAS_RETENCION[anio];
  const anios = Object.keys(TASAS_RETENCION).map(Number).sort((a, b) => a - b);
  if (anio < anios[0]) return TASAS_RETENCION[anios[0]];
  return TASAS_RETENCION[anios[anios.length - 1]];
}

export type FlujoInversion = {
  n: number;
  fecha: Date;
  interes: number;
  retencion: number;
  neto: number;
  capital: number;
  total: number;
};

/**
 * Tabla de pagos de un contrato de inversion.
 * Meses 1..n-1: solo interes neto. Mes n: interes neto + capital completo.
 */
export function tablaInversion(params: {
  capital: number;
  tasaAnual: number;
  plazoMeses: number;
  fechaInicio: Date;
  retiene?: boolean;
}): FlujoInversion[] {
  const { capital, tasaAnual, plazoMeses, fechaInicio, retiene = true } = params;
  const interes = (capital * tasaAnual) / 12;

  return Array.from({ length: plazoMeses }, (_, i) => {
    const n = i + 1;
    const fecha = sumarMeses(fechaInicio, n);
    // La tasa de retencion la define el año del PAGO, no el del contrato:
    // un contrato que cruza el 31 de diciembre retiene distinto antes y despues.
    const retencion = retiene ? (capital * tasaRetencion(fecha.getFullYear())) / 12 : 0;
    const esUltimo = n === plazoMeses;
    const amortizacion = esUltimo ? capital : 0;

    return {
      n,
      fecha,
      interes,
      retencion,
      neto: interes - retencion,
      capital: amortizacion,
      total: interes - retencion + amortizacion,
    };
  });
}

/** Pago fijo de una amortizacion francesa. */
export function pagoFijo(monto: number, tasaMensual: number, meses: number): number {
  if (meses <= 0) return 0;
  if (tasaMensual === 0) return monto / meses;
  return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses));
}

export type FlujoCredito = {
  n: number;
  fecha: Date;
  pago: number;
  interes: number;
  capital: number;
  saldo: number;
  enGracia: boolean;
};

/**
 * Tabla de amortizacion de un credito.
 * Durante la gracia se paga solo interes; el capital se amortiza en los meses
 * restantes, por lo que la mensualidad sube al terminar la gracia.
 */
export function tablaCredito(params: {
  monto: number;
  tasaAnual: number;
  plazoMeses: number;
  mesesGracia?: number;
  fechaInicio: Date;
}): FlujoCredito[] {
  const { monto, tasaAnual, plazoMeses, mesesGracia = 0, fechaInicio } = params;
  const i = tasaAnual / 12;
  const mesesAmortizacion = plazoMeses - mesesGracia;
  const cuota = pagoFijo(monto, i, mesesAmortizacion);

  const filas: FlujoCredito[] = [];
  let saldo = monto;

  for (let n = 1; n <= plazoMeses; n++) {
    const enGracia = n <= mesesGracia;
    const interes = saldo * i;
    const pago = enGracia ? interes : cuota;
    const capital = enGracia ? 0 : pago - interes;
    saldo = Math.max(0, saldo - capital);

    filas.push({
      n,
      fecha: sumarMeses(fechaInicio, n),
      pago,
      interes,
      capital,
      saldo,
      enGracia,
    });
  }

  return filas;
}

/** Interes moratorio: el doble de la tasa ordinaria, corrido por dias. */
export function interesMoratorio(
  montoVencido: number,
  tasaOrdinariaAnual: number,
  diasAtraso: number,
): number {
  return (montoVencido * tasaOrdinariaAnual * 2 * diasAtraso) / 360;
}
