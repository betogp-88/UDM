import Link from "next/link";
import { notFound } from "next/navigation";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pesosCent, pct, fecha } from "@/lib/formato";
import {
  buscarInversionista,
  INVERSIONISTAS,
  flujosInversion,
  inicioInversion,
  vencimientoInversion,
  mesesPagados,
  requisitosDe,
  estadoExpediente,
  socioDeInversionista,
} from "@/lib/demo/datos";

export function generateStaticParams() {
  return INVERSIONISTAS.map((i) => ({ id: i.id }));
}

export default async function Ficha({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = buscarInversionista(id);
  if (!inv) notFound();

  const flujos = flujosInversion(inv);
  const pagados = mesesPagados(inv);
  const interesPagado = flujos.slice(0, pagados).reduce((s, f) => s + f.neto, 0);
  const interesPorPagar = flujos.slice(pagados).reduce((s, f) => s + f.neto, 0);
  const retencionAcumulada = flujos.slice(0, pagados).reduce((s, f) => s + f.retencion, 0);
  const socio = socioDeInversionista(inv);
  const requisitos = requisitosDe(inv.tipo);
  const cumplidos = estadoExpediente(inv);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/inversionistas" className="text-xs text-muted hover:text-ink">
          ← Inversionistas
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-ink">{inv.nombre}</h2>
            <Etiqueta>{inv.tipo}</Etiqueta>
            <Etiqueta>{inv.empresa}</Etiqueta>
          </div>
          <Link
            href={`/inversionistas/${inv.id}/estado`}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
          >
            Estado de cuenta
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato etiqueta="Capital" valor={pesos(inv.capital)} />
        <Dato etiqueta="Tasa anual" valor={pct(inv.tasaAnual)} />
        <Dato etiqueta="Le hemos pagado" valor={pesos(interesPagado)} nota={`${pagados} de ${inv.plazoMeses} pagos`} />
        <Dato etiqueta="Falta por pagar" valor={pesos(interesPorPagar)} nota={`${inv.mesesRestantes} meses`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Contrato" className="lg:col-span-2">
          <dl className="space-y-2.5 text-sm">
            <Renglon k="Inicio" v={fecha(inicioInversion(inv))} />
            <Renglon k="Vencimiento" v={fecha(vencimientoInversion(inv))} />
            <Renglon k="Plazo" v={`${inv.plazoMeses} meses`} />
            <Renglon k="Rendimiento mensual" v={pesosCent(flujos[0].interes)} />
            <Renglon k="Retención mensual" v={pesosCent(flujos[0].retencion)} />
            <Renglon k="Neto mensual" v={pesosCent(flujos[0].neto)} destacado />
            <Renglon k="Retención acumulada" v={pesos(retencionAcumulada)} />
            <Renglon k="Traído por" v={socio ? socio.nombre : "Llegó directo"} />
          </dl>
          <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
            La retención se calcula sobre el capital a la tasa anual del año de cada pago, no sobre
            el rendimiento.
          </p>
        </Tarjeta>

        <Tarjeta
          titulo="Expediente"
          descripcion={`${cumplidos.filter(Boolean).length} de ${requisitos.length} documentos`}
          className="lg:col-span-3"
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {requisitos.map((r, k) => (
              <li key={r} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">
                  <Insignia estado={cumplidos[k] ? "good" : "serious"}>{""}</Insignia>
                </span>
                <span className={cumplidos[k] ? "text-ink-2" : "text-ink"}>{r}</span>
              </li>
            ))}
          </ul>
          {cumplidos.every(Boolean) ? null : (
            <p className="mt-4 rounded-lg bg-[var(--plane)] p-3 text-xs text-ink-2">
              Con el expediente incompleto, el sistema no permite registrar el ingreso de recursos.
            </p>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Tabla de pagos" descripcion="Rendimiento mensual y capital al vencimiento">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">#</th>
                <th className="px-2 py-2 font-medium">Fecha</th>
                <th className="px-2 py-2 text-right font-medium">Rendimiento</th>
                <th className="px-2 py-2 text-right font-medium">Retención</th>
                <th className="px-2 py-2 text-right font-medium">Capital</th>
                <th className="px-2 py-2 text-right font-medium">Neto a pagar</th>
                <th className="px-2 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {flujos.map((f, k) => {
                const pagado = k < pagados;
                return (
                  <tr
                    key={f.n}
                    className={`border-b border-[var(--hair)] last:border-0 ${
                      pagado ? "text-muted" : "text-ink-2"
                    }`}
                  >
                    <td className="px-4 py-2 sm:px-2">{f.n}</td>
                    <td className="px-2 py-2">{fecha(f.fecha)}</td>
                    <td className="px-2 py-2 text-right">{pesosCent(f.interes)}</td>
                    <td className="px-2 py-2 text-right">{pesosCent(-f.retencion)}</td>
                    <td className="px-2 py-2 text-right">{f.capital ? pesos(f.capital) : "—"}</td>
                    <td className={`px-2 py-2 text-right font-medium ${pagado ? "" : "text-ink"}`}>
                      {pesosCent(f.total)}
                    </td>
                    <td className="px-2 py-2">
                      {pagado ? (
                        <Insignia estado="good">Pagado</Insignia>
                      ) : (
                        <span className="text-xs text-muted">Programado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{valor}</p>
      {nota ? <p className="mt-0.5 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}

function Renglon({ k, v, destacado }: { k: string; v: string; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-2">{k}</dt>
      <dd className={`tabular ${destacado ? "font-semibold text-ink" : "text-ink"}`}>{v}</dd>
    </div>
  );
}
