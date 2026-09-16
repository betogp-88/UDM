export const MESES_ABREV = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** $1,234,567 — sin centavos, para montos grandes. */
export function pesos(n: number): string {
  const signo = n < 0 ? "\u2212" : "";
  return signo + "$" + Math.round(Math.abs(n)).toLocaleString("es-MX");
}

/** $1,234.56 — con centavos, para tablas de pagos. */
export function pesosCent(n: number): string {
  const signo = n < 0 ? "\u2212" : "";
  return signo + "$" + Math.abs(n).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** $4.2 MDP — compacto, para tarjetas y ejes. */
export function mdp(n: number): string {
  return "$" + (n / 1_000_000).toFixed(1) + " MDP";
}

/** 18.5% */
export function pct(n: number, decimales = 1): string {
  return (n * 100).toFixed(decimales) + "%";
}

/** 16 sep 2026 */
export function fecha(d: Date): string {
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** sep 26 — para ejes de tiempo. */
export function mesCorto(d: Date): string {
  return `${MESES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

/** sep 2026 */
export function mesLargo(d: Date): string {
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function sumarMeses(d: Date, meses: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + meses, d.getDate());
  return r;
}

export function diasEntre(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}
