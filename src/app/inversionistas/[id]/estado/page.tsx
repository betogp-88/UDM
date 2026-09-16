import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AccionesEstado } from "@/components/AccionesEstado";
import { pesos, pesosCent, pct, fecha, mesLargo } from "@/lib/formato";
import {
  INVERSIONISTAS,
  buscarInversionista,
  flujosInversion,
  inicioInversion,
  vencimientoInversion,
  mesesPagados,
  HOY,
} from "@/lib/demo/datos";

export function generateStaticParams() {
  return INVERSIONISTAS.map((i) => ({ id: i.id }));
}

export default async function EstadoDeCuenta({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = buscarInversionista(id);
  if (!inv) notFound();

  const flujos = flujosInversion(inv);
  const pagados = mesesPagados(inv);
  const anio = HOY.getFullYear();

  const delAnio = flujos.slice(0, pagados).filter((f) => f.fecha.getFullYear() === anio);
  const rendimientoAnio = delAnio.reduce((s, f) => s + f.interes, 0);
  const retencionAnio = delAnio.reduce((s, f) => s + f.retencion, 0);
  const netoAnio = rendimientoAnio - retencionAnio;
  const acumuladoTotal = flujos.slice(0, pagados).reduce((s, f) => s + f.neto, 0);
  const proximo = flujos[pagados];

  const resumen = [
    `Estado de cuenta — ${inv.nombre}`,
    `Un Dígito Más · ${inv.empresa}`,
    "",
    `Capital: ${pesos(inv.capital)}`,
    `Tasa: ${pct(inv.tasaAnual)}`,
    `Vencimiento: ${fecha(vencimientoInversion(inv))}`,
    "",
    `Rendimiento pagado en ${anio}: ${pesos(netoAnio)}`,
    `Retención acumulada ${anio}: ${pesos(retencionAnio)}`,
    proximo ? `Próximo pago: ${fecha(proximo.fecha)} por ${pesosCent(proximo.total)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/inversionistas/${inv.id}`} className="text-xs text-muted hover:text-ink">
          ← {inv.nombre}
        </Link>
        <AccionesEstado resumen={resumen} />
      </div>

      {/* La hoja: pensada para imprimirse o mandarse en PDF */}
      <article className="rounded-xl bg-surface p-5 ring-1 ring-[var(--hair)] sm:p-8 print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--hair)] pb-5">
          <Image src="/logo.png" alt="Un Dígito Más" width={907} height={504} className="h-11 w-auto" />
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">Estado de cuenta</p>
            <p className="text-xs capitalize text-muted">{mesLargo(HOY)}</p>
            <p className="text-xs text-muted">{inv.empresa}</p>
          </div>
        </header>

        <section className="grid gap-5 border-b border-[var(--hair)] py-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Inversionista</p>
            <p className="mt-1 text-lg font-semibold text-ink">{inv.nombre}</p>
            <p className="text-xs text-muted">Persona {inv.tipo.toLowerCase()}</p>
          </div>
          <dl className="space-y-1.5 text-sm">
            <Renglon k="Capital" v={pesos(inv.capital)} />
            <Renglon k="Tasa anual" v={pct(inv.tasaAnual)} />
            <Renglon k="Inicio" v={fecha(inicioInversion(inv))} />
            <Renglon k="Vencimiento" v={fecha(vencimientoInversion(inv))} destacado />
          </dl>
        </section>

        <section className="grid gap-3 border-b border-[var(--hair)] py-5 sm:grid-cols-3">
          <Cifra etiqueta={`Rendimiento bruto ${anio}`} valor={pesos(rendimientoAnio)} />
          <Cifra etiqueta={`Retención ${anio}`} valor={pesos(retencionAnio)} />
          <Cifra etiqueta={`Neto recibido ${anio}`} valor={pesos(netoAnio)} destacado />
        </section>

        <section className="py-5">
          <h3 className="text-sm font-semibold text-ink">Movimientos del año</h3>
          <div className="-mx-5 mt-3 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[340px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="py-2 font-medium">Fecha</th>
                <th className="py-2 text-right font-medium">Rendimiento</th>
                <th className="py-2 text-right font-medium">Retención</th>
                <th className="py-2 text-right font-medium">Neto pagado</th>
              </tr>
            </thead>
            <tbody className="tabular text-ink-2">
              {delAnio.map((f) => (
                <tr key={f.n} className="border-b border-[var(--hair)] last:border-0">
                  <td className="py-2">{fecha(f.fecha)}</td>
                  <td className="py-2 text-right">{pesosCent(f.interes)}</td>
                  <td className="py-2 text-right">{pesosCent(-f.retencion)}</td>
                  <td className="py-2 text-right font-medium text-ink">{pesosCent(f.neto)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--hair)] font-semibold">
                <td className="py-2 text-ink">Total {anio}</td>
                <td className="py-2 text-right tabular text-ink">{pesos(rendimientoAnio)}</td>
                <td className="py-2 text-right tabular text-ink">{pesos(-retencionAnio)}</td>
                <td className="py-2 text-right tabular text-ink">{pesos(netoAnio)}</td>
              </tr>
            </tfoot>
          </table>
          </div>
        </section>

        <section className="grid gap-4 rounded-lg bg-[var(--plane)] p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Próximo pago</p>
            <p className="mt-1 text-sm text-ink">
              {proximo
                ? `${fecha(proximo.fecha)} · ${pesosCent(proximo.total)}`
                : "Contrato liquidado"}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Acumulado desde el inicio
            </p>
            <p className="mt-1 text-sm text-ink">
              {pesos(acumuladoTotal)} en {pagados} {pagados === 1 ? "pago" : "pagos"}
            </p>
          </div>
        </section>

        <footer className="mt-5 border-t border-[var(--hair)] pt-4 text-[11px] leading-relaxed text-muted">
          La retención de ISR se calcula sobre el capital a la tasa anual que fija la Ley de
          Ingresos del ejercicio, no sobre el rendimiento. La constancia anual de retenciones se
          entrega en los primeros meses del año siguiente. Documento de demostración con datos
          ficticios.
        </footer>
      </article>
    </div>
  );
}

function Renglon({ k, v, destacado }: { k: string; v: string; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-2">{k}</dt>
      <dd className={`shrink-0 tabular ${destacado ? "font-semibold text-ink" : "text-ink"}`}>{v}</dd>
    </div>
  );
}

function Cifra({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted">{etiqueta}</p>
      <p className={`mt-1 truncate text-xl font-semibold ${destacado ? "text-ink" : "text-ink-2"}`}>
        {valor}
      </p>
    </div>
  );
}
