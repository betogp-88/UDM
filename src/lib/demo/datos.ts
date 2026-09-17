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

export { tasaRetencion };
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
  ["Martina Elizondo Ruvalcaba", "Física", "SOFOM", 5_000_000, 0.140, 24, 4, true],
  ["Grupo Ferretero del Bajío SA de CV", "Moral", "SOFOM", 4_000_000, 0.135, 36, 9, true],
  ["Rodolfo Cantú Villarreal", "Física", "SOFOM", 3_500_000, 0.140, 18, 7, true],
  ["Inmobiliaria Torre Once SA de CV", "Moral", "Arrendadora", 3_000_000, 0.138, 24, 4, true],
  ["Alicia Berrones Tamez", "Física", "SOFOM", 2_500_000, 0.135, 12, 4, true],
  ["Comercializadora Nueve Puntos SA", "Moral", "SOFOM", 2_000_000, 0.130, 36, 11, true],
  ["Ignacio Peralta Loredo", "Física", "Arrendadora", 1_800_000, 0.135, 18, 2, true],
  ["Dolores Arreguín Salas", "Física", "SOFOM", 1_700_000, 0.132, 24, 14, true],
  ["Transportes Salinas Hermanos SA", "Moral", "Arrendadora", 1_500_000, 0.130, 24, 6, true],
  ["Efraín Quintanilla Mora", "Física", "SOFOM", 1_400_000, 0.140, 12, 10, true],
  ["Norma Cepeda Villalobos", "Física", "SOFOM", 1_200_000, 0.128, 18, 3, false],
  ["Constructora Ribera Sur SA de CV", "Moral", "SOFOM", 1_200_000, 0.125, 36, 16, true],
  ["Héctor Zamarripa Guel", "Física", "SOFOM", 1_000_000, 0.130, 12, 1, true],
  ["Refacciones del Norte SA de CV", "Moral", "Arrendadora", 1_000_000, 0.125, 24, 8, true],
  ["Patricia Maldonado Iracheta", "Física", "SOFOM", 900_000, 0.128, 18, 12, true],
  ["Gerardo Villaseñor Ochoa", "Física", "SOFOM", 800_000, 0.122, 12, 5, false],
  ["Alimentos Tres Marías SA de CV", "Moral", "SOFOM", 750_000, 0.125, 36, 19, true],
  ["Leticia Bustamante Rocha", "Física", "Arrendadora", 600_000, 0.120, 18, 13, true],
  ["Raúl Menchaca Espinoza", "Física", "SOFOM", 600_000, 0.122, 12, 2, true],
  ["Servicios Integrales Aldama SA", "Moral", "SOFOM", 550_000, 0.120, 36, 22, true],
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
  ["Aceros y Perfiles Monclova SA", "Crédito simple", 4_500_000, 0.215, 30, 48, 3, 0],
  ["Autotransportes Lince SA de CV", "Arrendamiento financiero", 3_300_000, 0.225, 26, 36, 0, 0],
  ["Panificadora La Espiga Dorada SA", "Crédito simple", 2_750_000, 0.220, 18, 36, 0, 0],
  ["Distribuidora Química Reyna SA", "Crédito simple", 2_000_000, 0.235, 22, 36, 6, 0],
  ["Maquinaria Pesada Coahuila SA", "Arrendamiento puro", 1_800_000, 0.230, 20, 36, 0, 0],
  ["Textiles Buenavista SA de CV", "Crédito simple", 1_600_000, 0.240, 15, 24, 0, 0],
  ["Clínica Santa Inés SC", "Arrendamiento financiero", 1_500_000, 0.225, 28, 36, 0, 0],
  ["Ferretería El Yunque SA de CV", "Crédito simple", 1_400_000, 0.250, 12, 24, 0, 0],
  ["Agrícola Los Nogales SPR de RL", "Crédito simple", 1_350_000, 0.215, 24, 36, 6, 0],
  ["Refrigeración Industrial Saltillo", "Arrendamiento puro", 1_300_000, 0.240, 16, 24, 0, 0],
  ["Constructora Vega y Asociados SA", "Crédito simple", 1_250_000, 0.245, 19, 30, 3, 0],
  ["Papelería Corporativa Delta SA", "Crédito simple", 1_200_000, 0.260, 10, 18, 0, 0],
  ["Talleres Mecánicos Zaragoza SA", "Arrendamiento financiero", 1_150_000, 0.230, 21, 30, 0, 0],
  ["Abarrotes Mayoreo Treviño SA", "Crédito simple", 1_100_000, 0.255, 14, 24, 0, 9],
  ["Logística Frontera Norte SA", "Arrendamiento puro", 1_050_000, 0.240, 17, 24, 0, 0],
  ["Plásticos Inyectados Ramos SA", "Crédito simple", 1_000_000, 0.245, 20, 30, 0, 0],
  ["Mueblería Casa Grande SA de CV", "Crédito simple", 950_000, 0.275, 11, 18, 0, 41],
  ["Servicios Médicos Integrales SC", "Arrendamiento financiero", 900_000, 0.235, 23, 30, 0, 0],
  ["Purificadora Agua Clara SA", "Crédito simple", 850_000, 0.255, 13, 24, 0, 0],
  ["Imprenta Offset Peninsular SA", "Crédito simple", 800_000, 0.270, 9, 18, 0, 18],
  ["Granja Avícola San Rafael SPR", "Crédito simple", 750_000, 0.240, 16, 24, 3, 0],
  ["Equipos de Cómputo Norestense SA", "Arrendamiento puro", 700_000, 0.250, 12, 18, 0, 0],
  ["Carnicería Mayorista Guerra SA", "Crédito simple", 650_000, 0.285, 8, 18, 0, 52],
  ["Boutique Hotelera Alameda SA", "Crédito simple", 600_000, 0.235, 18, 24, 0, 0],
  ["Lavandería Industrial Arcoíris SA", "Arrendamiento financiero", 550_000, 0.250, 14, 24, 0, 26],
  ["Vidrios Templados del Centro SA", "Crédito simple", 500_000, 0.260, 10, 18, 0, 0],
  ["Distribuidora Ferretera Olmos SA", "Crédito simple", 450_000, 0.300, 6, 12, 0, 78],
  ["Taller de Torno Precisión SA", "Arrendamiento puro", 400_000, 0.255, 9, 18, 0, 0],
  ["Consultoría Fiscal Herrera SC", "Crédito simple", 350_000, 0.290, 5, 12, 0, 134],
  ["Floristería y Eventos Magnolia SA", "Crédito simple", 300_000, 0.265, 7, 12, 0, 0],
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
  const despuesGastos = bruto - gastoTotal();
  const neto = despuesGastos - ESTIMACION_INCOBRABLES_MENSUAL;

  return [
    { concepto: "Intereses cobrados", monto: cobrado, tipo: "suma" as const, acumulado: cobrado },
    { concepto: "Rendimientos pagados", monto: -pagado, tipo: "resta" as const, acumulado: bruto },
    { concepto: "Margen financiero bruto", monto: bruto, tipo: "subtotal" as const, acumulado: bruto },
    { concepto: "Gastos de operación", monto: -gastoTotal(), tipo: "resta" as const, acumulado: despuesGastos },
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
      }, 0) + gastoTotal();

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

/* ------------------------------------------------------------------ */
/* SOCIOS Y ATRIBUCION                                                 */
/* ------------------------------------------------------------------ */

export type Socio = {
  id: string;
  nombre: string;
  participacion: number;
  aportacion: number;
  /** Contrato de inversion propio, si el socio ademas tiene dinero adentro. */
  inversionPropiaId?: string;
  enTesoreria?: boolean;
};

/** Capital social pagado. */
export const CAPITAL_SOCIAL = 6_000_000;

export const SOCIOS: Socio[] = [
  {
    id: "soc-1",
    nombre: "Martina Elizondo Ruvalcaba",
    participacion: 0.2,
    aportacion: 1_200_000,
    inversionPropiaId: "inv-01",
  },
  {
    id: "soc-2",
    nombre: "Rodolfo Cantú Villarreal",
    participacion: 0.2,
    aportacion: 1_200_000,
    inversionPropiaId: "inv-03",
  },
  {
    id: "soc-3",
    nombre: "Ignacio Peralta Loredo",
    participacion: 0.2,
    aportacion: 1_200_000,
    inversionPropiaId: "inv-07",
  },
  {
    id: "soc-4",
    nombre: "Efraín Quintanilla Mora",
    participacion: 0.2,
    aportacion: 1_200_000,
    inversionPropiaId: "inv-10",
  },
  {
    id: "soc-tes",
    nombre: "Tesorería (por vender)",
    participacion: 0.2,
    aportacion: 1_200_000,
    enTesoreria: true,
  },
];

/**
 * Quien trajo a cada inversionista, en el mismo orden que INVERSIONISTAS.
 * null = llego directo, sin que lo trajera un socio.
 */
const ATRIBUCION_INV: Array<string | null> = [
  "soc-1", "soc-2", "soc-2", "soc-1", "soc-3",
  "soc-4", "soc-3", "soc-1", "soc-2", "soc-4",
  "soc-1", "soc-2", "soc-4", "soc-3", "soc-1",
  null, "soc-2", "soc-4", "soc-3", "soc-4",
];

/** Quien origino cada credito, en el mismo orden que CREDITOS. */
const ATRIBUCION_CRE: Array<string | null> = [
  "soc-1", "soc-2", "soc-1", "soc-3", "soc-4",
  "soc-2", "soc-1", "soc-4", "soc-3", "soc-2",
  "soc-1", "soc-4", "soc-3", "soc-2", "soc-1",
  null, "soc-4", "soc-3", "soc-2", "soc-1",
  "soc-3", "soc-4", "soc-2", "soc-1", "soc-3",
  null, "soc-4", "soc-2", "soc-1", null,
];

export function socioDeInversionista(inv: Inversionista): Socio | undefined {
  const k = INVERSIONISTAS.findIndex((x) => x.id === inv.id);
  const id = ATRIBUCION_INV[k];
  return id ? SOCIOS.find((s) => s.id === id) : undefined;
}

export function socioDeCredito(c: Credito): Socio | undefined {
  const k = CREDITOS.findIndex((x) => x.id === c.id);
  const id = ATRIBUCION_CRE[k];
  return id ? SOCIOS.find((s) => s.id === id) : undefined;
}

export function buscarSocio(id: string): Socio | undefined {
  return SOCIOS.find((s) => s.id === id);
}

export type ResumenSocio = {
  socio: Socio;
  /** Dinero propio del socio invertido en la casa. */
  directo: number;
  rendimientoPropio: number;
  /** Dinero de terceros que el socio trajo. */
  indirecto: number;
  inversionistasTraidos: number;
  /** Cartera que el socio origino. */
  carteraOriginada: number;
  creditosOriginados: number;
  /** Su parte del margen neto del mes. */
  participacionMargen: number;
  /** Rendimiento propio + participacion en el margen. */
  retornoMensual: number;
  /** Retorno anualizado sobre su aportacion de capital. */
  retornoSobreAportacion: number;
};

export function resumenSocios(): ResumenSocio[] {
  const margenNeto = cascadaMargen().at(-1)!.monto;

  return SOCIOS.map((socio) => {
    const propia = socio.inversionPropiaId
      ? INVERSIONISTAS.find((i) => i.id === socio.inversionPropiaId)
      : undefined;
    const directo = propia?.capital ?? 0;
    const rendimientoPropio = propia
      ? (propia.capital * propia.tasaAnual) / 12 -
        (propia.capital * tasaRetencion(HOY.getFullYear())) / 12
      : 0;

    const traidos = INVERSIONISTAS.filter(
      (i) => socioDeInversionista(i)?.id === socio.id && i.id !== socio.inversionPropiaId,
    );
    const originados = CREDITOS.filter((c) => socioDeCredito(c)?.id === socio.id);

    const participacionMargen = socio.enTesoreria ? 0 : margenNeto * socio.participacion;
    const retornoMensual = rendimientoPropio + participacionMargen;

    return {
      socio,
      directo,
      rendimientoPropio,
      indirecto: traidos.reduce((s, i) => s + i.capital, 0),
      inversionistasTraidos: traidos.length,
      carteraOriginada: originados.reduce((s, c) => s + c.saldo, 0),
      creditosOriginados: originados.length,
      participacionMargen,
      retornoMensual,
      retornoSobreAportacion:
        socio.aportacion > 0 ? (participacionMargen * 12) / socio.aportacion : 0,
    };
  });
}

/** Captacion que no trajo ningun socio. */
export function captacionDirecta(): number {
  return INVERSIONISTAS.filter((i) => !socioDeInversionista(i)).reduce((s, i) => s + i.capital, 0);
}

export function carteraSinOrigen(): number {
  return CREDITOS.filter((c) => !socioDeCredito(c)).reduce((s, c) => s + c.saldo, 0);
}

/* ------------------------------------------------------------------ */
/* TESORERIA                                                           */
/* ------------------------------------------------------------------ */

export type CuentaBancaria = {
  id: string;
  banco: string;
  empresa: Empresa;
  clabe: string;
  saldo: number;
};

export const CUENTAS: CuentaBancaria[] = [
  { id: "cta-1", banco: "BBVA", empresa: "SOFOM", clabe: "0125 8000 1234 5678 90", saldo: 2_430_000 },
  { id: "cta-2", banco: "Banorte", empresa: "Arrendadora", clabe: "0725 8000 9876 5432 10", saldo: 1_180_000 },
];

export type InversionTesoreria = {
  id: string;
  emisor: string;
  instrumento: "Tesofome" | "Pagaré bancario" | "CETES";
  empresa: Empresa;
  monto: number;
  tasaAnual: number;
  mesesRestantes: number;
  /** Tasa anual de retencion que nos aplican a nosotros. */
  retencionAnual: number;
};

export const TESORERIA: InversionTesoreria[] = [
  { id: "tes-1", emisor: "SOFOM Crédito Regional SA", instrumento: "Tesofome", empresa: "SOFOM", monto: 1_500_000, tasaAnual: 0.155, mesesRestantes: 5, retencionAnual: 0.009 },
  { id: "tes-2", emisor: "Financiera del Valle SAPI", instrumento: "Tesofome", empresa: "SOFOM", monto: 900_000, tasaAnual: 0.162, mesesRestantes: 8, retencionAnual: 0.009 },
  { id: "tes-3", emisor: "BBVA México", instrumento: "Pagaré bancario", empresa: "SOFOM", monto: 600_000, tasaAnual: 0.098, mesesRestantes: 1, retencionAnual: 0.009 },
  { id: "tes-4", emisor: "Banco de México", instrumento: "CETES", empresa: "Arrendadora", monto: 450_000, tasaAnual: 0.102, mesesRestantes: 3, retencionAnual: 0.009 },
];

export function rendimientoTesoreriaMensual(): number {
  return TESORERIA.reduce((s, t) => s + (t.monto * t.tasaAnual) / 12, 0);
}

export function retencionTesoreriaMensual(): number {
  return TESORERIA.reduce((s, t) => s + (t.monto * t.retencionAnual) / 12, 0);
}

export function totalTesoreria(): number {
  return TESORERIA.reduce((s, t) => s + t.monto, 0);
}

export function efectivoDisponible(): number {
  return CUENTAS.reduce((s, c) => s + c.saldo, 0);
}

export type GrupoGasto = "Administrativo" | "Operativo" | "Referidos";

export const GRUPOS_GASTO: GrupoGasto[] = ["Administrativo", "Operativo", "Referidos"];

export type Gasto = {
  categoria: string;
  grupo: GrupoGasto;
  monto: number;
  recurrente: boolean;
};

export const GASTOS: Gasto[] = [
  { categoria: "Nómina y honorarios", grupo: "Administrativo", monto: 82_000, recurrente: true },
  { categoria: "Renta de oficina", grupo: "Administrativo", monto: 24_000, recurrente: true },
  { categoria: "Servicios y sistemas", grupo: "Administrativo", monto: 14_500, recurrente: true },
  { categoria: "Contabilidad y auditoría", grupo: "Administrativo", monto: 12_000, recurrente: true },
  { categoria: "Legal y notarial", grupo: "Operativo", monto: 9_500, recurrente: false },
  { categoria: "Gestión de cobranza", grupo: "Operativo", monto: 6_000, recurrente: false },
  { categoria: "Avalúos e investigación", grupo: "Operativo", monto: 4_500, recurrente: false },
  { categoria: "Comisiones por referidos", grupo: "Referidos", monto: 31_000, recurrente: false },
];

export function gastosPorGrupo() {
  return GRUPOS_GASTO.map((grupo) => {
    const items = GASTOS.filter((g) => g.grupo === grupo);
    return { grupo, items, monto: items.reduce((s, g) => s + g.monto, 0) };
  });
}

export function gastoTotal(): number {
  return GASTOS.reduce((s, g) => s + g.monto, 0);
}

/* ------------------------------------------------------------------ */
/* DETALLE DE CREDITO                                                  */
/* ------------------------------------------------------------------ */

/** Comision de apertura vigente. */
export const COMISION_APERTURA = 0.02;

export type Garantia = { tipo: string; descripcion: string; valor?: number };

/** Garantias y activo arrendado, por posicion en CREDITOS. */
const DETALLE_CREDITO: Array<{ garantias: Garantia[]; activo?: string; seguroVigente?: boolean }> = [
  { garantias: [{ tipo: "Obligado solidario", descripcion: "Accionista mayoritario" }, { tipo: "Prenda industrial", descripcion: "Línea de corte", valor: 5_200_000 }] },
  { garantias: [{ tipo: "Aval", descripcion: "Representante legal" }], activo: "Tractocamión Kenworth T680 · serie 1XKY", seguroVigente: true },
  { garantias: [{ tipo: "Hipoteca", descripcion: "Nave industrial", valor: 6_000_000 }] },
  { garantias: [{ tipo: "Obligado solidario", descripcion: "Socio fundador" }] },
  { garantias: [{ tipo: "Depósito en garantía", descripcion: "Tres rentas" }], activo: "Excavadora CAT 320 · serie CAT0320", seguroVigente: false },
  { garantias: [{ tipo: "Aval", descripcion: "Director general" }] },
  { garantias: [{ tipo: "Aval", descripcion: "Socio de la sociedad civil" }], activo: "Equipo de rayos X · serie MED-8841", seguroVigente: true },
  { garantias: [{ tipo: "Obligado solidario", descripcion: "Propietario" }] },
  { garantias: [{ tipo: "Prenda agrícola", descripcion: "Cosecha comprometida", valor: 2_100_000 }] },
  { garantias: [{ tipo: "Depósito en garantía", descripcion: "Dos rentas" }], activo: "Cámara de refrigeración · serie REF-2210", seguroVigente: true },
];

export function detalleCredito(c: Credito) {
  const k = CREDITOS.findIndex((x) => x.id === c.id);
  return (
    DETALLE_CREDITO[k % DETALLE_CREDITO.length] ?? { garantias: [] as Garantia[] }
  );
}

export function buscarCredito(id: string): Credito | undefined {
  return CREDITOS.find((c) => c.id === id);
}

export const REQUISITOS_CREDITO_FISICA = [
  "Identificación oficial vigente",
  "CURP",
  "Constancia de situación fiscal",
  "Comprobante de domicilio (menor a 3 meses)",
  "Estados de cuenta bancarios (6 meses)",
  "Comprobante de ingresos",
  "Autorización de consulta a buró de crédito",
  "Contrato y pagaré firmados",
];

export const REQUISITOS_CREDITO_MORAL = [
  "Acta constitutiva",
  "Poder del representante legal",
  "Identificación del representante legal",
  "Constancia de situación fiscal",
  "Comprobante de domicilio fiscal",
  "Estados financieros (2 ejercicios)",
  "Estados de cuenta bancarios (6 meses)",
  "Autorización de consulta a buró de crédito",
  "Declaración de beneficiario controlador",
  "Contrato y pagaré firmados",
];

/** Estado del expediente de un credito, determinista. */
export function expedienteCredito(c: Credito): { requisitos: string[]; cumplidos: boolean[] } {
  const esMoral = /SA|SC|SPR|SAPI|de CV|RL/.test(c.cliente);
  const requisitos = esMoral ? REQUISITOS_CREDITO_MORAL : REQUISITOS_CREDITO_FISICA;
  const semilla = Number(c.id.slice(-2));
  // Los contratos vigentes traen expediente completo; los de mayor atraso, no.
  const completo = c.diasAtraso <= 30;
  return {
    requisitos,
    cumplidos: requisitos.map((_, k) => completo || (k + semilla) % 5 !== 0),
  };
}


/* ------------------------------------------------------------------ */
/* CONFIGURACION                                                       */
/* ------------------------------------------------------------------ */

/**
 * Umbrales de concentracion. Arriba de esto la app avisa que alguien pesa
 * demasiado. Configurables: son criterio del consejo, no del codigo.
 */
export const UMBRAL_CONCENTRACION = {
  fondeo: 0.25,
  cartera: 0.25,
};

/** Compromiso de captacion de cada socio. Sin fecha limite. */
export const COMPROMISO_CAPTACION = 6_000_000;

/* ------------------------------------------------------------------ */
/* CRM                                                                 */
/* ------------------------------------------------------------------ */

export const ETAPAS = [
  "Contacto inicial",
  "En conversación",
  "Propuesta enviada",
  "Documentación",
  "Cerrado",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export type TipoProspecto = "Inversión" | "Crédito" | "Socio";

export const TIPOS_PROSPECTO: TipoProspecto[] = ["Inversión", "Crédito", "Socio"];

export type Prospecto = {
  id: string;
  nombre: string;
  tipoPersona: TipoPersona;
  /** Solo para persona moral. */
  representante?: string;
  tipo: TipoProspecto;
  socioId: string | null;
  etapa: Etapa;
  monto: number;
  probabilidad: number;
  diasAlProximoContacto: number;
  nota: string;
  /** Inversion: condiciones apalabradas y cuando entraria el dinero. */
  tasaEstimada?: number;
  plazoEstimado?: number;
  mesesACierre?: number;
  /** Socio: que porcentaje se negocia. */
  porcentaje?: number;
};

const PRO_BASE: Array<{
  n: string;
  tp: TipoPersona;
  rep?: string;
  t: TipoProspecto;
  s: string | null;
  e: Etapa;
  m: number;
  p: number;
  d: number;
  nota: string;
  tasa?: number;
  plazo?: number;
  cierre?: number;
  pct?: number;
}> = [
  { n: "Bufete Contable Ramírez y Asociados", tp: "Moral", rep: "Lic. Sergio Ramírez Ayala", t: "Inversión", s: "soc-1", e: "Documentación", m: 2_500_000, p: 0.8, d: 2, nota: "Falta constancia fiscal y contrato firmado", tasa: 0.135, plazo: 24, cierre: 1 },
  { n: "Ernesto Villalpando Sáenz", tp: "Física", t: "Inversión", s: "soc-1", e: "Propuesta enviada", m: 1_800_000, p: 0.6, d: 5, nota: "Cotizado a 13.5% por 24 meses", tasa: 0.135, plazo: 24, cierre: 2 },
  { n: "Grupo Hotelero Piedra Blanca SA", tp: "Moral", rep: "Ing. Claudia Berrones Lugo", t: "Crédito", s: "soc-1", e: "En conversación", m: 4_000_000, p: 0.4, d: 9, nota: "Quiere ampliar habitaciones, sin estados financieros aún", cierre: 3 },
  { n: "Rosalinda Ontiveros Pech", tp: "Física", t: "Inversión", s: "soc-1", e: "Contacto inicial", m: 900_000, p: 0.2, d: 14, nota: "Referida por su hermano, ya inversionista", tasa: 0.125, plazo: 12, cierre: 4 },
  { n: "Autopartes del Golfo SA de CV", tp: "Moral", rep: "C.P. Jorge Alanís Treviño", t: "Crédito", s: "soc-1", e: "Documentación", m: 1_500_000, p: 0.75, d: 3, nota: "Buró autorizado, falta pagaré", cierre: 1 },

  { n: "Fideicomiso Familiar Arriaga", tp: "Moral", rep: "Lic. Mónica Arriaga del Río", t: "Inversión", s: "soc-2", e: "Documentación", m: 3_500_000, p: 0.85, d: 1, nota: "Solo falta la carátula bancaria", tasa: 0.14, plazo: 36, cierre: 1 },
  { n: "Manufacturas Precisión Norte SA", tp: "Moral", rep: "Ing. Raúl Espinosa Cantú", t: "Crédito", s: "soc-2", e: "Propuesta enviada", m: 2_800_000, p: 0.55, d: 6, nota: "Cotizado a 24%, comparando con otra SOFOM", cierre: 2 },
  { n: "Silvia Cárdenas Nájera", tp: "Física", t: "Inversión", s: "soc-2", e: "En conversación", m: 1_200_000, p: 0.45, d: 8, nota: "Vence su pagaré bancario en noviembre", tasa: 0.13, plazo: 18, cierre: 2 },
  { n: "Distribuidora Médica Peninsular", tp: "Moral", rep: "Dra. Elena Pech Canul", t: "Crédito", s: "soc-2", e: "Contacto inicial", m: 1_800_000, p: 0.2, d: 18, nota: "Primer acercamiento en la expo", cierre: 5 },

  { n: "Colegio Particular San Andrés AC", tp: "Moral", rep: "Mtro. Andrés Fuentes Lara", t: "Inversión", s: "soc-3", e: "Propuesta enviada", m: 2_000_000, p: 0.6, d: 4, nota: "Junta de consejo el próximo martes", tasa: 0.13, plazo: 24, cierre: 2 },
  { n: "Refaccionaria El Volante SA", tp: "Moral", rep: "Sr. Gilberto Nava Ochoa", t: "Crédito", s: "soc-3", e: "En conversación", m: 1_100_000, p: 0.35, d: 11, nota: "Necesita capital de trabajo para temporada", cierre: 3 },
  { n: "Armando Quiroz Betancourt", tp: "Física", t: "Inversión", s: "soc-3", e: "Contacto inicial", m: 700_000, p: 0.25, d: 21, nota: "Contacto de golf, aún explorando", tasa: 0.12, plazo: 12, cierre: 4 },

  { n: "Inmobiliaria Cumbres del Valle SA", tp: "Moral", rep: "Arq. Daniela Cumbres Mata", t: "Inversión", s: "soc-4", e: "En conversación", m: 3_000_000, p: 0.5, d: 7, nota: "Interesados si subimos a 14%", tasa: 0.14, plazo: 24, cierre: 3 },
  { n: "Transportadora Ruta Corta SA", tp: "Moral", rep: "Sr. Ismael Duarte Ponce", t: "Crédito", s: "soc-4", e: "Documentación", m: 2_200_000, p: 0.7, d: 2, nota: "Arrendamiento de dos unidades", cierre: 1 },
  { n: "Beatriz Alcántara Fuentes", tp: "Física", t: "Inversión", s: "soc-4", e: "Contacto inicial", m: 850_000, p: 0.15, d: 25, nota: "Dejó datos en el sitio web", tasa: 0.12, plazo: 12, cierre: 6 },

  { n: "Fernando Escalante Murguía", tp: "Física", t: "Socio", s: "soc-1", e: "Documentación", m: 1_200_000, p: 0.7, d: 3, nota: "Compra el 20% que está en tesorería. Due diligence en curso", pct: 0.2, cierre: 2 },
  { n: "Capital Semilla del Centro SAPI", tp: "Moral", rep: "Lic. Paola Nieto Cárdenas", t: "Socio", s: "soc-2", e: "En conversación", m: 1_200_000, p: 0.25, d: 12, nota: "Interesados en el 20% de tesorería, piden auditoría externa", pct: 0.2, cierre: 6 },
];

export const PROSPECTOS: Prospecto[] = PRO_BASE.map((x, i) => ({
  id: `pro-${String(i + 1).padStart(2, "0")}`,
  nombre: x.n,
  tipoPersona: x.tp,
  representante: x.rep,
  tipo: x.t,
  socioId: x.s,
  etapa: x.e,
  monto: x.m,
  probabilidad: x.p,
  diasAlProximoContacto: x.d,
  nota: x.nota,
  tasaEstimada: x.tasa,
  plazoEstimado: x.plazo,
  mesesACierre: x.cierre,
  porcentaje: x.pct,
}));

export function prospectosDe(socioId: string): Prospecto[] {
  return PROSPECTOS.filter((p) => p.socioId === socioId);
}

/** Suma ponderada por probabilidad de cierre. */
export function pipelinePonderado(items: Prospecto[]): number {
  return items.reduce((s, p) => s + p.monto * p.probabilidad, 0);
}

export function embudo(items: Prospecto[] = PROSPECTOS) {
  return ETAPAS.map((etapa) => {
    const enEtapa = items.filter((p) => p.etapa === etapa);
    return {
      etapa,
      cuenta: enEtapa.length,
      monto: enEtapa.reduce((s, p) => s + p.monto, 0),
    };
  });
}

/* ------------------------------------------------------------------ */
/* COMPROMISO DE CAPTACION POR SOCIO                                   */
/* ------------------------------------------------------------------ */

export type ResumenCompromiso = {
  socio: Socio;
  comprometido: number;
  /** Lo que lleva: su capital propio mas lo que trajo de terceros. */
  invertido: number;
  directo: number;
  indirecto: number;
  avance: number;
  faltante: number;
  colocado: number;
  retornoInversion: number;
  utilidadSofom: number;
  pipelineInversion: number;
};

export function resumenCompromisos(): ResumenCompromiso[] {
  return resumenSocios()
    .filter((r) => !r.socio.enTesoreria)
    .map((r) => {
      const invertido = r.directo + r.indirecto;
      const deInversion = prospectosDe(r.socio.id).filter((p) => p.tipo === "Inversión");
      return {
        socio: r.socio,
        comprometido: COMPROMISO_CAPTACION,
        invertido,
        directo: r.directo,
        indirecto: r.indirecto,
        avance: invertido / COMPROMISO_CAPTACION,
        faltante: Math.max(0, COMPROMISO_CAPTACION - invertido),
        colocado: r.carteraOriginada,
        retornoInversion: r.rendimientoPropio,
        utilidadSofom: r.participacionMargen,
        pipelineInversion: pipelinePonderado(deInversion),
      };
    });
}

/* ------------------------------------------------------------------ */
/* EXPEDIENTE CORPORATIVO                                              */
/* ------------------------------------------------------------------ */

export const ENTIDADES = ["Un Dígito Más SOFOM", "Un Dígito Más Arrendadora"] as const;
export type Entidad = (typeof ENTIDADES)[number];

export const CATEGORIAS_DOC = [
  "Acta constitutiva",
  "Actas de asamblea",
  "Contratos privados",
  "Estados bancarios",
  "Otros",
] as const;
export type CategoriaDoc = (typeof CATEGORIAS_DOC)[number];

export type DocumentoCorporativo = {
  id: string;
  entidad: Entidad;
  categoria: CategoriaDoc;
  nombre: string;
  ejercicio?: number;
  fecha: string;
  folio?: string;
};

/** Año de constitución de cada sociedad: desde ahí se exigen actas. */
export const CONSTITUCION: Record<Entidad, number> = {
  "Un Dígito Más SOFOM": 2021,
  "Un Dígito Más Arrendadora": 2023,
};

const D = (
  entidad: Entidad,
  categoria: CategoriaDoc,
  nombre: string,
  fecha: string,
  ejercicio?: number,
  folio?: string,
): Omit<DocumentoCorporativo, "id"> => ({ entidad, categoria, nombre, fecha, ejercicio, folio });

export const DOCUMENTOS_CORPORATIVOS: DocumentoCorporativo[] = [
  D("Un Dígito Más SOFOM", "Acta constitutiva", "Escritura constitutiva", "14 mar 2021", 2021, "Esc. 45,231"),
  D("Un Dígito Más SOFOM", "Acta constitutiva", "Inscripción en el Registro Público de Comercio", "2 abr 2021", 2021),
  D("Un Dígito Más SOFOM", "Actas de asamblea", "Asamblea ordinaria anual", "28 abr 2021", 2021, "Acta 01/2021"),
  D("Un Dígito Más SOFOM", "Actas de asamblea", "Asamblea ordinaria anual", "26 abr 2022", 2022, "Acta 01/2022"),
  D("Un Dígito Más SOFOM", "Actas de asamblea", "Asamblea ordinaria anual", "25 abr 2023", 2023, "Acta 01/2023"),
  D("Un Dígito Más SOFOM", "Actas de asamblea", "Asamblea extraordinaria — aumento de capital", "12 sep 2023", 2023, "Acta 02/2023"),
  D("Un Dígito Más SOFOM", "Actas de asamblea", "Asamblea ordinaria anual", "23 abr 2025", 2025, "Acta 01/2025"),
  D("Un Dígito Más SOFOM", "Actas de asamblea", "Asamblea ordinaria anual", "21 abr 2026", 2026, "Acta 01/2026"),
  D("Un Dígito Más SOFOM", "Contratos privados", "Contrato marco de inversión — formato vigente", "10 ene 2026"),
  D("Un Dígito Más SOFOM", "Contratos privados", "Contrato de crédito simple — formato vigente", "10 ene 2026"),
  D("Un Dígito Más SOFOM", "Contratos privados", "Convenio de confidencialidad con proveedor de sistemas", "3 jun 2025"),
  D("Un Dígito Más SOFOM", "Estados bancarios", "BBVA — estado de cuenta agosto 2026", "31 ago 2026", 2026),
  D("Un Dígito Más SOFOM", "Estados bancarios", "BBVA — estado de cuenta julio 2026", "31 jul 2026", 2026),
  D("Un Dígito Más SOFOM", "Otros", "Registro ante CONDUSEF (SIPRES)", "18 may 2021"),
  D("Un Dígito Más SOFOM", "Otros", "Manual de prevención de lavado de dinero", "15 feb 2026"),

  D("Un Dígito Más Arrendadora", "Acta constitutiva", "Escritura constitutiva", "7 feb 2023", 2023, "Esc. 51,908"),
  D("Un Dígito Más Arrendadora", "Actas de asamblea", "Asamblea ordinaria anual", "27 abr 2023", 2023, "Acta 01/2023"),
  D("Un Dígito Más Arrendadora", "Actas de asamblea", "Asamblea ordinaria anual", "24 abr 2024", 2024, "Acta 01/2024"),
  D("Un Dígito Más Arrendadora", "Actas de asamblea", "Asamblea ordinaria anual", "22 abr 2026", 2026, "Acta 01/2026"),
  D("Un Dígito Más Arrendadora", "Contratos privados", "Contrato de arrendamiento puro — formato vigente", "10 ene 2026"),
  D("Un Dígito Más Arrendadora", "Contratos privados", "Contrato de arrendamiento financiero — formato vigente", "10 ene 2026"),
  D("Un Dígito Más Arrendadora", "Estados bancarios", "Banorte — estado de cuenta agosto 2026", "31 ago 2026", 2026),
  D("Un Dígito Más Arrendadora", "Otros", "Póliza de seguro de flota", "1 mar 2026"),
].map((d, i) => ({ ...d, id: `doc-${String(i + 1).padStart(2, "0")}` }));

export function documentosDe(entidad: Entidad, categoria?: CategoriaDoc) {
  return DOCUMENTOS_CORPORATIVOS.filter(
    (d) => d.entidad === entidad && (!categoria || d.categoria === categoria),
  );
}

/** Ejercicios con y sin acta de asamblea, desde la constitución. */
export function coberturaActas(entidad: Entidad) {
  const desde = CONSTITUCION[entidad];
  const hasta = HOY.getFullYear();
  const conActa = new Set(
    documentosDe(entidad, "Actas de asamblea").map((d) => d.ejercicio),
  );
  return Array.from({ length: hasta - desde + 1 }, (_, k) => {
    const anio = desde + k;
    return { anio, tiene: conActa.has(anio) };
  });
}

/* ------------------------------------------------------------------ */
/* CALCE CON PROYECCION DEL CRM                                        */
/* ------------------------------------------------------------------ */

export type MesCalceProyectado = MesCalce & {
  /** Capital de prospectos de inversion, ponderado por probabilidad. */
  proyectado: number;
  netoConProyeccion: number;
};

/**
 * Al calce contratado se le suma lo apalabrado en el CRM, ponderado por
 * probabilidad. Va en su propia banda: dinero prometido no es dinero firmado.
 */
export function calceConProyeccion(meses = 12): MesCalceProyectado[] {
  return calce(meses).map((m, k) => {
    const mes = k + 1;
    const proyectado = PROSPECTOS.filter(
      (p) => p.tipo === "Inversión" && p.mesesACierre === mes,
    ).reduce((s, p) => s + p.monto * p.probabilidad, 0);

    return { ...m, proyectado, netoConProyeccion: m.neto + proyectado };
  });
}
