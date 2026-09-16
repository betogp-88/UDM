/**
 * DATOS DE DEMOSTRACION — personas, montos y fechas ficticios.
 *
 * Todo lo que hay aqui es inventado. Los agregados si corresponden a la
 * realidad del negocio (20 inversionistas por 35 MDP, 30 creditos por 37 MDP)
 * para que el prototipo de la sensacion correcta.
 *
 * Este archivo es el unico que se reemplaza cuando entre Supabase. Las
 * pantallas leen de aqui y no cambian.
 */

import { tablaInversion, tablaCredito, pagoFijo, tasaRetencion } from "@/lib/demo/calculos";
import { sumarMeses } from "@/lib/formato";

export const ES_DEMO = true;

export type Empresa = "SOFOM" | "Arrendadora";
export type TipoPersona = "Física" | "Moral";

export const HOY = new Date();

/* ------------------------------------------------------------------ */
/* INVERSIONISTAS — 20 contratos, $35 MDP                              */
/* ------------------------------------------------------------------ */

export type Inversionista = {
  id: string;
  nombre: string;
  tipo: TipoPersona;
  empresa: Empresa;
  capital: number;
  tasaAnual: number;
  plazoMeses: number;
  mesesRestantes: number;
  expedienteCompleto: boolean;
};

const INV_BASE: Array<[string, TipoPersona, Empresa, number, number, number, number, boolean]> = [
  ["Martina Elizondo Ruvalcaba", "Física", "SOFOM", 5_000_000, 0.170, 24, 4, true],
  ["Grupo Ferretero del Bajío SA de CV", "Moral", "SOFOM", 4_000_000, 0.165, 36, 9, true],
  ["Rodolfo Cantú Villarreal", "Física", "SOFOM", 3_500_000, 0.180, 18, 7, true],
  ["Inmobiliaria Torre Once SA de CV", "Moral", "Arrendadora", 3_000_000, 0.175, 24, 4, true],
  ["Alicia Berrones Tamez", "Física", "SOFOM", 2_500_000, 0.190, 12, 4, true],
  ["Comercializadora Nueve Puntos SA", "Moral", "SOFOM", 2_000_000, 0.160, 36, 11, true],
  ["Ignacio Peralta Loredo", "Física", "Arrendadora", 1_800_000, 0.185, 18, 2, true],
  ["Dolores Arreguín Salas", "Física", "SOFOM", 1_700_000, 0.170, 24, 14, true],
  ["Transportes Salinas Hermanos SA", "Moral", "Arrendadora", 1_500_000, 0.175, 24, 6, true],
  ["Efraín Quintanilla Mora", "Física", "SOFOM", 1_400_000, 0.195, 12, 10, true],
  ["Norma Cepeda Villalobos", "Física", "SOFOM", 1_200_000, 0.180, 18, 3, false],
  ["Constructora Ribera Sur SA de CV", "Moral", "SOFOM", 1_200_000, 0.165, 36, 16, true],
  ["Héctor Zamarripa Guel", "Física", "SOFOM", 1_000_000, 0.200, 12, 1, true],
  ["Refacciones del Norte SA de CV", "Moral", "Arrendadora", 1_000_000, 0.175, 24, 8, true],
  ["Patricia Maldonado Iracheta", "Física", "SOFOM", 900_000, 0.185, 18, 12, true],
  ["Gerardo Villaseñor Ochoa", "Física", "SOFOM", 800_000, 0.190, 12, 5, false],
  ["Alimentos Tres Marías SA de CV", "Moral", "SOFOM", 750_000, 0.170, 36, 19, true],
  ["Leticia Bustamante Rocha", "Física", "Arrendadora", 600_000, 0.195, 18, 13, true],
  ["Raúl Menchaca Espinoza", "Física", "SOFOM", 600_000, 0.200, 12, 2, true],
  ["Servicios Integrales Aldama SA", "Moral", "SOFOM", 550_000, 0.175, 36, 22, true],
];

export const INVERSIONISTAS: Inversionista[] = INV_BASE.map(
  ([nombre, tipo, empresa, capital, tasaAnual, plazoMeses, mesesRestantes, exp], i) => ({
    id: `inv-${String(i + 1).padStart(2, "0")}`,
    nombre,
    tipo,
    empresa,
    capital,
    tasaAnual,
    plazoMeses,
    mesesRestantes,
    expedienteCompleto: exp,
  }),
);

export function vencimientoInversion(inv: Inversionista): Date {
  return sumarMeses(HOY, inv.mesesRestantes);
}

export function inicioInversion(inv: Inversionista): Date {
  return sumarMeses(HOY, inv.mesesRestantes - inv.plazoMeses);
}

export function flujosInversion(inv: Inversionista) {
  return tablaInversion({
    capital: inv.capital,
    tasaAnual: inv.tasaAnual,
    plazoMeses: inv.plazoMeses,
    fechaInicio: inicioInversion(inv),
  });
}

/** Pagos ya realizados: los meses transcurridos del contrato. */
export function mesesPagados(inv: Inversionista): number {
  return inv.plazoMeses - inv.mesesRestantes;
}

export function buscarInversionista(id: string): Inversionista | undefined {
  return INVERSIONISTAS.find((i) => i.id === id);
}

/* ------------------------------------------------------------------ */
/* CREDITOS — 30 contratos, $37 MDP de cartera                         */
/* ------------------------------------------------------------------ */

export type TipoCredito = "Crédito simple" | "Arrendamiento puro" | "Arrendamiento financiero";

export type Credito = {
  id: string;
  cliente: string;
  empresa: Empresa;
  tipoCredito: TipoCredito;
  saldo: number;
  montoOriginal: number;
  tasaAnual: number;
  mesesRestantes: number;
  plazoMeses: number;
  mesesGracia: number;
  diasAtraso: number;
};

const CRE_BASE: Array<[string, TipoCredito, number, number, number, number, number, number]> = [
  // nombre, tipo, saldo, tasa, mesesRestantes, plazo, gracia, diasAtraso
  ["Aceros y Perfiles Monclova SA", "Crédito simple", 4_500_000, 0.240, 30, 48, 3, 0],
  ["Autotransportes Lince SA de CV", "Arrendamiento financiero", 3_300_000, 0.260, 26, 36, 0, 0],
  ["Panificadora La Espiga Dorada SA", "Crédito simple", 2_750_000, 0.250, 18, 36, 0, 0],
  ["Distribuidora Química Reyna SA", "Crédito simple", 2_000_000, 0.270, 22, 36, 6, 0],
  ["Maquinaria Pesada Coahuila SA", "Arrendamiento puro", 1_800_000, 0.255, 20, 36, 0, 0],
  ["Textiles Buenavista SA de CV", "Crédito simple", 1_600_000, 0.265, 15, 24, 0, 0],
  ["Clínica Santa Inés SC", "Arrendamiento financiero", 1_500_000, 0.245, 28, 36, 0, 0],
  ["Ferretería El Yunque SA de CV", "Crédito simple", 1_400_000, 0.280, 12, 24, 0, 0],
  ["Agrícola Los Nogales SPR de RL", "Crédito simple", 1_350_000, 0.235, 24, 36, 6, 0],
  ["Refrigeración Industrial Saltillo", "Arrendamiento puro", 1_300_000, 0.260, 16, 24, 0, 0],
  ["Constructora Vega y Asociados SA", "Crédito simple", 1_250_000, 0.275, 19, 30, 3, 0],
  ["Papelería Corporativa Delta SA", "Crédito simple", 1_200_000, 0.290, 10, 18, 0, 0],
  ["Talleres Mecánicos Zaragoza SA", "Arrendamiento financiero", 1_150_000, 0.250, 21, 30, 0, 0],
  ["Abarrotes Mayoreo Treviño SA", "Crédito simple", 1_100_000, 0.285, 14, 24, 0, 9],
  ["Logística Frontera Norte SA", "Arrendamiento puro", 1_050_000, 0.265, 17, 24, 0, 0],
  ["Plásticos Inyectados Ramos SA", "Crédito simple", 1_000_000, 0.270, 20, 30, 0, 0],
  ["Mueblería Casa Grande SA de CV", "Crédito simple", 950_000, 0.300, 11, 18, 0, 41],
  ["Servicios Médicos Integrales SC", "Arrendamiento financiero", 900_000, 0.255, 23, 30, 0, 0],
  ["Purificadora Agua Clara SA", "Crédito simple", 850_000, 0.280, 13, 24, 0, 0],
  ["Imprenta Offset Peninsular SA", "Crédito simple", 800_000, 0.295, 9, 18, 0, 18],
  ["Granja Avícola San Rafael SPR", "Crédito simple", 750_000, 0.265, 16, 24, 3, 0],
  ["Equipos de Cómputo Norestense SA", "Arrendamiento puro", 700_000, 0.270, 12, 18, 0, 0],
  ["Carnicería Mayorista Guerra SA", "Crédito simple", 650_000, 0.310, 8, 18, 0, 52],
  ["Boutique Hotelera Alameda SA", "Crédito simple", 600_000, 0.260, 18, 24, 0, 0],
  ["Lavandería Industrial Arcoíris SA", "Arrendamiento financiero", 550_000, 0.275, 14, 24, 0, 26],
  ["Vidrios Templados del Centro SA", "Crédito simple", 500_000, 0.285, 10, 18, 0, 0],
  ["Distribuidora Ferretera Olmos SA", "Crédito simple", 450_000, 0.320, 6, 12, 0, 78],
  ["Taller de Torno Precisión SA", "Arrendamiento puro", 400_000, 0.280, 9, 18, 0, 0],
  ["Consultoría Fiscal Herrera SC", "Crédito simple", 350_000, 0.300, 5, 12, 0, 134],
  ["Floristería y Eventos Magnolia SA", "Crédito simple", 300_000, 0.290, 7, 12, 0, 0],
];

export const CREDITOS: Credito[] = CRE_BASE.map(
  ([cliente, tipoCredito, saldo, tasaAnual, mesesRestantes, plazoMeses, mesesGracia, diasAtraso], i) => ({
    id: `cre-${String(i + 1).padStart(2, "0")}`,
    cliente,
    empresa: tipoCredito === "Crédito simple" ? "SOFOM" : "Arrendadora",
    tipoCredito,
    saldo,
    montoOriginal: Math.round((saldo * plazoMeses) / Math.max(1, mesesRestantes) / 50_000) * 50_000,
    tasaAnual,
    mesesRestantes,
    plazoMeses,
    mesesGracia,
    diasAtraso,
  }),
);

/** Mensualidad: saldo insoluto amortizado en los meses que faltan. */
export function mensualidadCredito(c: Credito): number {
  return pagoFijo(c.saldo, c.tasaAnual / 12, c.mesesRestantes);
}

export function flujosCredito(c: Credito) {
  return tablaCredito({
    monto: c.saldo,
    tasaAnual: c.tasaAnual,
    plazoMeses: c.mesesRestantes,
    mesesGracia: 0,
    fechaInicio: HOY,
  });
}

export type Bucket = "Al corriente" | "1-30 días" | "31-60 días" | "Más de 60";

export function bucket(c: Credito): Bucket {
  if (c.diasAtraso === 0) return "Al corriente";
  if (c.diasAtraso <= 30) return "1-30 días";
  if (c.diasAtraso <= 60) return "31-60 días";
  return "Más de 60";
}

export const BUCKETS: Bucket[] = ["Al corriente", "1-30 días", "31-60 días", "Más de 60"];

export const ESTADO_BUCKET: Record<Bucket, "good" | "warning" | "serious" | "critical"> = {
  "Al corriente": "good",
  "1-30 días": "warning",
  "31-60 días": "serious",
  "Más de 60": "critical",
};

export function resumenBuckets() {
  return BUCKETS.map((b) => {
    const items = CREDITOS.filter((c) => bucket(c) === b);
    return {
      bucket: b,
      estado: ESTADO_BUCKET[b],
      contratos: items.length,
      monto: items.reduce((s, c) => s + c.saldo, 0),
    };
  });
}

/* ------------------------------------------------------------------ */
/* OPERACION                                                           */
/* ------------------------------------------------------------------ */

export const GASTO_OPERACION_MENSUAL = 148_000;
export const ESTIMACION_INCOBRABLES_MENSUAL = 62_000;

/* ------------------------------------------------------------------ */
/* AGREGADOS                                                           */
/* ------------------------------------------------------------------ */

export function totalCaptado(): number {
  return INVERSIONISTAS.reduce((s, i) => s + i.capital, 0);
}

export function totalColocado(): number {
  return CREDITOS.reduce((s, c) => s + c.saldo, 0);
}

export function tasaPasivaPromedio(): number {
  const total = totalCaptado();
  return INVERSIONISTAS.reduce((s, i) => s + i.capital * i.tasaAnual, 0) / total;
}

export function tasaActivaPromedio(): number {
  const total = totalColocado();
  return CREDITOS.reduce((s, c) => s + c.saldo * c.tasaAnual, 0) / total;
}

export function interesCobradoMensual(): number {
  return CREDITOS.reduce((s, c) => s + (c.saldo * c.tasaAnual) / 12, 0);
}

export function interesPagadoMensual(): number {
  return INVERSIONISTAS.reduce((s, i) => s + (i.capital * i.tasaAnual) / 12, 0);
}

export function retencionMensual(): number {
  const t = tasaRetencion(HOY.getFullYear());
  return INVERSIONISTAS.reduce((s, i) => s + (i.capital * t) / 12, 0);
}

/** La cascada del margen: de intereses cobrados a lo que realmente queda. */
export function cascadaMargen() {
  const cobrado = interesCobradoMensual();
  const pagado = interesPagadoMensual();
  const bruto = cobrado - pagado;
  const despuesGastos = bruto - GASTO_OPERACION_MENSUAL;
  const neto = despuesGastos - ESTIMACION_INCOBRABLES_MENSUAL;

  return [
    { concepto: "Intereses cobrados", monto: cobrado, tipo: "suma" as const, acumulado: cobrado },
    { concepto: "Intereses pagados", monto: -pagado, tipo: "resta" as const, acumulado: bruto },
    { concepto: "Margen financiero bruto", monto: bruto, tipo: "subtotal" as const, acumulado: bruto },
    { concepto: "Gastos de operación", monto: -GASTO_OPERACION_MENSUAL, tipo: "resta" as const, acumulado: despuesGastos },
    { concepto: "Estimación de incobrables", monto: -ESTIMACION_INCOBRABLES_MENSUAL, tipo: "resta" as const, acumulado: neto },
    { concepto: "Margen neto mensual", monto: neto, tipo: "total" as const, acumulado: neto },
  ];
}

/* ------------------------------------------------------------------ */
/* CALCE DE PLAZOS — 12 meses hacia adelante                           */
/* ------------------------------------------------------------------ */

export type MesCalce = {
  fecha: Date;
  entradas: number;
  salidas: number;
  neto: number;
};

export function calce(meses = 12): MesCalce[] {
  return Array.from({ length: meses }, (_, k) => {
    const m = k + 1;
    const fecha = sumarMeses(HOY, m);

    // Entra: mensualidades de los creditos que siguen vivos ese mes.
    const entradas = CREDITOS.reduce(
      (s, c) => (m <= c.mesesRestantes ? s + mensualidadCredito(c) : s),
      0,
    );

    // Sale: intereses netos de inversiones vivas, capital de las que vencen,
    // mas el gasto de operacion.
    const salidas =
      INVERSIONISTAS.reduce((s, i) => {
        if (m > i.mesesRestantes) return s;
        const interes = (i.capital * i.tasaAnual) / 12;
        const retencion = (i.capital * tasaRetencion(fecha.getFullYear())) / 12;
        const capital = m === i.mesesRestantes ? i.capital : 0;
        return s + (interes - retencion) + capital;
      }, 0) + GASTO_OPERACION_MENSUAL;

    return { fecha, entradas, salidas, neto: entradas - salidas };
  });
}

/* ------------------------------------------------------------------ */
/* CONCENTRACION                                                       */
/* ------------------------------------------------------------------ */

export function concentracionCaptacion() {
  const total = totalCaptado();
  return [...INVERSIONISTAS]
    .sort((a, b) => b.capital - a.capital)
    .slice(0, 5)
    .map((i) => ({ nombre: i.nombre, monto: i.capital, participacion: i.capital / total }));
}

export function concentracionCartera() {
  const total = totalColocado();
  return [...CREDITOS]
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 5)
    .map((c) => ({ nombre: c.cliente, monto: c.saldo, participacion: c.saldo / total }));
}

/* ------------------------------------------------------------------ */
/* ALERTAS                                                             */
/* ------------------------------------------------------------------ */

export type Alerta = {
  nivel: "critical" | "serious" | "warning" | "good";
  titulo: string;
  detalle: string;
};

export function alertas(): Alerta[] {
  const out: Alerta[] = [];

  for (const i of INVERSIONISTAS.filter((x) => x.mesesRestantes <= 1)) {
    out.push({
      nivel: "warning",
      titulo: `Vence inversión de ${i.nombre}`,
      detalle: `${i.mesesRestantes === 0 ? "Este mes" : "El próximo mes"} — capital por devolver`,
    });
  }

  for (const c of CREDITOS.filter((x) => x.diasAtraso > 60)) {
    out.push({
      nivel: "critical",
      titulo: `${c.cliente} con ${c.diasAtraso} días de atraso`,
      detalle: "Requiere gestión de cobranza",
    });
  }

  for (const c of CREDITOS.filter((x) => x.diasAtraso > 30 && x.diasAtraso <= 60)) {
    out.push({
      nivel: "serious",
      titulo: `${c.cliente} con ${c.diasAtraso} días de atraso`,
      detalle: "Segundo recordatorio pendiente",
    });
  }

  for (const i of INVERSIONISTAS.filter((x) => !x.expedienteCompleto)) {
    out.push({
      nivel: "serious",
      titulo: `Expediente incompleto — ${i.nombre}`,
      detalle: "Documentación pendiente de integrar",
    });
  }

  const primerMesNegativo = calce().find((m) => m.neto < 0);
  if (primerMesNegativo) {
    out.push({
      nivel: "critical",
      titulo: "Calce negativo proyectado",
      detalle: `Salen mas recursos de los que entran en el mes de vencimientos concentrados`,
    });
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* EXPEDIENTES                                                         */
/* ------------------------------------------------------------------ */

export const REQUISITOS_FISICA = [
  "Identificación oficial vigente",
  "CURP",
  "Constancia de situación fiscal",
  "Comprobante de domicilio (menor a 3 meses)",
  "Carátula de estado de cuenta bancario",
  "Contrato firmado",
  "Cuestionario de conocimiento del cliente",
];

export const REQUISITOS_MORAL = [
  "Acta constitutiva",
  "Poder del representante legal",
  "Identificación del representante legal",
  "Constancia de situación fiscal",
  "Comprobante de domicilio fiscal",
  "Carátula de estado de cuenta bancario",
  "Contrato firmado",
  "Declaración de beneficiario controlador",
];

export function requisitosDe(tipo: TipoPersona): string[] {
  return tipo === "Física" ? REQUISITOS_FISICA : REQUISITOS_MORAL;
}

/** Estado del expediente. Determinista a partir del id, para que no cambie entre recargas. */
export function estadoExpediente(inv: Inversionista): boolean[] {
  const reqs = requisitosDe(inv.tipo);
  if (inv.expedienteCompleto) return reqs.map(() => true);
  const semilla = Number(inv.id.slice(-2));
  return reqs.map((_, k) => (k + semilla) % 4 !== 0);
}
