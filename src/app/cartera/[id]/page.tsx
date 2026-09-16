import Link from "next/link";
import { notFound } from "next/navigation";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pesosCent, pct, fecha } from "@/lib/formato";
import { interesMoratorio } from "@/lib/demo/calculos";
import {
  CREDITOS,
  buscarCredito,
  flujosCredito,
  mensualidadCredito,
  bucket,
  ESTADO_BUCKET,
  detalleCredito,
  expedienteCredito,
  socioDeCredito,
  COMISION_APERTURA,
} from "@/lib/demo/datos";

export function generateStaticParams() {
  return CREDITOS.map((c) => ({ id: c.id }));
}

export default async function FichaCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = buscarCredito(id);
  if (!c) notFound();

  const flujos = flujosCredito(c);
  const cuota = mensualidadCredito(c);
  const b = bucket(c);
  const detalle = detalleCredito(c);
  const { requisitos, cumplidos } = expedienteCredito(c);
  const socio = socioDeCredito(c);
  const mora = c.diasAtraso ? interesMoratorio(cuota, c.tasaAnual, c.diasAtraso) : 0;
  const interesPorCobrar = flujos.reduce((s, f) => s + f.interes, 0);
  const esArrendamiento = c.tipoCredito !== "Crédito simple";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/cartera" className="text-xs text-muted hover:text-ink">
          ← Cartera
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-ink">{c.cliente}</h2>
          <Etiqueta>{c.tipoCredito}</Etiqueta>
          <Etiqueta>{c.empresa}</Etiqueta>
          <Insignia estado={ESTADO_BUCKET[b]}>
            {c.diasAtraso === 0 ? "Al corriente" : `${c.diasAtraso} días de atraso`}
          </Insignia>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato etiqueta="Saldo insoluto" valor={pesos(c.saldo)} />
        <Dato etiqueta="Mensualidad" valor={pesos(cuota)} nota={`${c.mesesRestantes} pagos restantes`} />
        <Dato etiqueta="Tasa ordinaria" valor={pct(c.tasaAnual)} />
        <Dato
          etiqueta="Moratorios acumulados"
          valor={mora ? pesos(mora) : "—"}
          nota={mora ? `Al ${pct(c.tasaAnual * 2)} anual` : "Sin atraso"}
          acento={mora ? "critical" : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Contrato" className="lg:col-span-2">
          <dl className="space-y-2.5 text-sm">
            <Renglon k="Monto original" v={pesos(c.montoOriginal)} />
            <Renglon k="Plazo original" v={`${c.plazoMeses} meses`} />
            <Renglon k="Meses restantes" v={`${c.mesesRestantes}`} />
            {c.mesesGracia > 0 ? (
              <Renglon k="Gracia de capital" v={`${c.mesesGracia} meses`} />
            ) : null}
            <Renglon
              k="Comisión por apertura"
              v={`${pct(COMISION_APERTURA)} · ${pesos(c.montoOriginal * COMISION_APERTURA)}`}
            />
            <Renglon k="Tasa moratoria" v={pct(c.tasaAnual * 2)} />
            <Renglon k="Interés por cobrar" v={pesos(interesPorCobrar)} destacado />
            <Renglon k="Originado por" v={socio ? socio.nombre : "Operación"} />
          </dl>
        </Tarjeta>

        <div className="space-y-6 lg:col-span-3">
          <Tarjeta titulo="Garantías">
            <ul className="space-y-2.5">
              {detalle.garantias.map((g) => (
                <li key={g.tipo + g.descripcion} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    <span className="text-ink">{g.tipo}</span>
                    <span className="block text-xs text-muted">{g.descripcion}</span>
                  </span>
                  {g.valor ? (
                    <span className="shrink-0 tabular text-ink-2">{pesos(g.valor)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </Tarjeta>

          {esArrendamiento && detalle.activo ? (
            <Tarjeta titulo="Activo arrendado">
              <p className="text-sm text-ink">{detalle.activo}</p>
              <div className="mt-3">
                {detalle.seguroVigente ? (
                  <Insignia estado="good">Seguro vigente</Insignia>
                ) : (
                  <Insignia estado="critical">Seguro vencido — riesgo sin cobertura</Insignia>
                )}
              </div>
            </Tarjeta>
          ) : null}
        </div>
      </div>

      <Tarjeta
        titulo="Expediente"
        descripcion={`${cumplidos.filter(Boolean).length} de ${requisitos.length} documentos`}
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
      </Tarjeta>

      <Tarjeta
        titulo="Tabla de amortización"
        descripcion="Saldo insoluto amortizado en los meses que faltan"
      >
        <div className="-mx-4 max-h-[460px] overflow-auto sm:mx-0">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">#</th>
                <th className="px-2 py-2 font-medium">Fecha</th>
                <th className="px-2 py-2 text-right font-medium">Pago</th>
                <th className="px-2 py-2 text-right font-medium">Interés</th>
                <th className="px-2 py-2 text-right font-medium">Capital</th>
                <th className="px-2 py-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="tabular text-ink-2">
              {flujos.map((f) => (
                <tr key={f.n} className="border-b border-[var(--hair)] last:border-0">
                  <td className="px-4 py-2 sm:px-2">{f.n}</td>
                  <td className="px-2 py-2">{fecha(f.fecha)}</td>
                  <td className="px-2 py-2 text-right font-medium text-ink">{pesosCent(f.pago)}</td>
                  <td className="px-2 py-2 text-right">{pesosCent(f.interes)}</td>
                  <td className="px-2 py-2 text-right">{pesosCent(f.capital)}</td>
                  <td className="px-2 py-2 text-right">{pesos(f.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
  nota,
  acento,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  acento?: "critical";
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p
        className="mt-1 truncate text-xl font-semibold"
        style={{ color: acento === "critical" ? "var(--critical)" : "var(--ink)" }}
      >
        {valor}
      </p>
      {nota ? <p className="mt-0.5 text-xs text-muted">{nota}</p> : null}
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
