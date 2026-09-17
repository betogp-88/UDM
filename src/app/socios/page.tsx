import Link from "next/link";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pct } from "@/lib/formato";
import {
  SOCIOS,
  CAPITAL_SOCIAL,
  COMPROMISO_CAPTACION,
  resumenCompromisos,
  captacionDirecta,
  totalCaptado,
  totalColocado,
  cascadaMargen,
  INVERSIONISTAS,
  PROSPECTOS,
} from "@/lib/demo/datos";

export default function Socios() {
  const filas = resumenCompromisos();
  const tesoreria = SOCIOS.find((s) => s.enTesoreria)!;
  const margenNeto = cascadaMargen().at(-1)!.monto;
  const prospectoSocio = PROSPECTOS.filter((p) => p.tipo === "Socio");

  const totales = filas.reduce(
    (a, f) => ({
      comprometido: a.comprometido + f.comprometido,
      invertido: a.invertido + f.invertido,
      colocado: a.colocado + f.colocado,
      retorno: a.retorno + f.retornoInversion,
      utilidad: a.utilidad + f.utilidadSofom,
    }),
    { comprometido: 0, invertido: 0, colocado: 0, retorno: 0, utilidad: 0 },
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Socios</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Cada socio se comprometió a aportar {pesos(COMPROMISO_CAPTACION)} de captación. Cuenta
          igual si es su dinero o si lo trajo de terceros.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato etiqueta="Capital social" valor={pesos(CAPITAL_SOCIAL)} nota="Aportaciones pagadas" />
        <Dato
          etiqueta="Socios activos"
          valor={String(filas.length)}
          nota={`${pct(filas.length * 0.2, 0)} del capital`}
        />
        <Dato
          etiqueta="En tesorería"
          valor={pct(tesoreria.participacion, 0)}
          nota={prospectoSocio.length ? `${prospectoSocio.length} prospectos de compra` : "Pendiente de venta"}
        />
        <Dato etiqueta="Margen a repartir" valor={pesos(margenNeto)} nota="Mensual, antes de ISR" />
      </div>

      <Tarjeta
        titulo="Participación accionaria"
        descripcion={`${SOCIOS.length} tenencias sobre ${pesos(CAPITAL_SOCIAL)}`}
      >
        <div className="flex h-6 overflow-hidden rounded-md">
          {SOCIOS.map((s, k) => (
            <div
              key={s.id}
              className="flex items-center justify-center text-[10px] font-medium"
              style={{
                width: `${s.participacion * 100}%`,
                background: s.enTesoreria ? "var(--plane)" : "var(--brand)",
                color: s.enTesoreria ? "var(--muted)" : "var(--brand-ink)",
                marginLeft: k === 0 ? 0 : 2,
                opacity: s.enTesoreria ? 1 : 1 - k * 0.12,
              }}
            >
              {pct(s.participacion, 0)}
            </div>
          ))}
        </div>
        <ul className="mt-3 divide-y divide-[var(--hair)]">
          {SOCIOS.map((s) => (
            <li key={s.id} className="flex items-baseline justify-between gap-2 py-1.5 text-sm">
              <span className={s.enTesoreria ? "text-muted" : "text-ink-2"}>{s.nombre}</span>
              <span className="shrink-0 tabular text-xs text-muted">
                {s.enTesoreria ? "por vender" : pesos(s.aportacion)}
              </span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      {/* Una tabla y no tarjetas: el objetivo es que los cuatro se comparen
          entre sí, y para comparar hay que estar en el mismo plano. */}
      <Tarjeta titulo="Resumen por socio" descripcion="Mensual, salvo las cantidades de capital">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">Socio</th>
                <th className="px-2 py-2 text-right font-medium">Comprometido</th>
                <th className="px-2 py-2 text-right font-medium">Invertido</th>
                <th className="px-2 py-2 text-right font-medium">Avance</th>
                <th className="px-2 py-2 text-right font-medium">Colocado</th>
                <th className="px-2 py-2 text-right font-medium">Retorno por inversión</th>
                <th className="px-2 py-2 text-right font-medium">Utilidad SOFOM</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr
                  key={f.socio.id}
                  className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--plane)]"
                >
                  <td className="px-4 py-2.5 sm:px-2">
                    <Link href={`/socios/${f.socio.id}`} className="text-ink hover:underline">
                      {f.socio.nombre}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">
                    {pesos(f.comprometido)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(f.invertido)}</td>
                  <td className="px-2 py-2.5 text-right">
                    <span className="flex items-center justify-end gap-2">
                      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--plane)]">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            width: `${Math.min(f.avance, 1) * 100}%`,
                            background: f.avance >= 1 ? "var(--good)" : "var(--s1)",
                          }}
                        />
                      </span>
                      <span className="w-12 tabular text-xs text-ink-2">{pct(f.avance, 0)}</span>
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(f.colocado)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">
                    {pesos(f.retornoInversion)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular font-medium text-ink">
                    {pesos(f.utilidadSofom)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--hair)] font-semibold">
                <td className="px-4 py-2.5 sm:px-2">Total</td>
                <td className="px-2 py-2.5 text-right tabular text-ink-2">
                  {pesos(totales.comprometido)}
                </td>
                <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(totales.invertido)}</td>
                <td className="px-2 py-2.5 text-right tabular text-ink-2">
                  {pct(totales.invertido / totales.comprometido, 0)}
                </td>
                <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(totales.colocado)}</td>
                <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(totales.retorno)}</td>
                <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(totales.utilidad)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted">
          «Invertido» es lo que cada socio tiene adentro más lo que trajo de terceros.{" "}
          {pesos(captacionDirecta())} del fondeo llegaron sin que los trajera un socio, y el 20% en
          tesorería no tiene dueño, por eso su utilidad no aparece repartida.
        </p>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Socios que además son inversionistas">
          <ul className="space-y-2">
            {SOCIOS.filter((s) => s.inversionPropiaId).map((s) => {
              const inv = INVERSIONISTAS.find((i) => i.id === s.inversionPropiaId)!;
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="flex flex-wrap items-center gap-2">
                    <Link href={`/inversionistas/${inv.id}`} className="text-ink hover:underline">
                      {s.nombre}
                    </Link>
                    <Etiqueta>Socio</Etiqueta>
                    <Etiqueta>Inversionista</Etiqueta>
                  </span>
                  <span className="shrink-0 tabular text-ink-2">
                    {pesos(inv.capital)} al {pct(inv.tasaAnual)}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Son la misma persona en un solo registro, no dos.
          </p>
        </Tarjeta>

        <Tarjeta titulo="Venta del 20% en tesorería" descripcion="Prospectos de socio en el CRM">
          {prospectoSocio.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Sin prospectos por ahora.</p>
          ) : (
            <ul className="divide-y divide-[var(--hair)]">
              {prospectoSocio.map((p) => (
                <li key={p.id} className="py-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm text-ink">{p.nombre}</span>
                    <span className="shrink-0 tabular text-sm text-ink-2">
                      {pesos(p.monto)}
                      <span className="ml-2 text-xs text-muted">{pct(p.probabilidad, 0)}</span>
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3">
                    <Insignia estado={p.etapa === "Documentación" ? "good" : "warning"}>
                      {p.etapa}
                    </Insignia>
                    <span className="text-xs text-muted">{p.nota}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
            El comprador toma el 20% que hoy está en tesorería, así que las participaciones de los
            cuatro socios actuales no se diluyen.
          </p>
        </Tarjeta>
      </div>

      <Tarjeta titulo="Concentración en manos de socios">
        {(() => {
          const deSocios = SOCIOS.filter((s) => s.inversionPropiaId).reduce((sum, s) => {
            const inv = INVERSIONISTAS.find((i) => i.id === s.inversionPropiaId);
            return sum + (inv?.capital ?? 0);
          }, 0);
          const parte = deSocios / totalCaptado();
          return (
            <>
              <p className="text-3xl font-semibold text-ink">{pct(parte)}</p>
              <p className="mt-1 text-sm text-ink-2">
                del fondeo es dinero de los propios socios ({pesos(deSocios)})
              </p>
              <p className="mt-3 text-xs text-muted">
                Es capital comprometido y difícilmente se va, pero también significa que ese
                porcentaje del pasivo no representa dinero nuevo entrando de fuera. La cartera suma{" "}
                {pesos(totalColocado())}.
              </p>
            </>
          );
        })()}
      </Tarjeta>
    </div>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 truncate text-xl font-semibold text-ink">{valor}</p>
      {nota ? <p className="mt-0.5 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}
