import Link from "next/link";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { BarraMeta } from "@/components/BarraMeta";
import { pesos, pct } from "@/lib/formato";
import {
  SOCIOS,
  CAPITAL_SOCIAL,
  resumenSocios,
  captacionDirecta,
  carteraSinOrigen,
  totalCaptado,
  totalColocado,
  cascadaMargen,
  INVERSIONISTAS,
  socioDeInversionista,
  resumenMetas,
  avanceDelAnio,
  estadoMeta,
  COLOR_META,
} from "@/lib/demo/datos";

export default function Socios() {
  const resumen = resumenSocios();
  const activos = resumen.filter((r) => !r.socio.enTesoreria);
  const tesoreria = resumen.find((r) => r.socio.enTesoreria)!;
  const margenNeto = cascadaMargen().at(-1)!.monto;

  const maxAportado = Math.max(...activos.map((r) => r.directo + r.indirecto));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Socios</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Participación de cada socio, el dinero propio que tiene invertido en la casa, y el que
          trajo de terceros.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato etiqueta="Capital social" valor={pesos(CAPITAL_SOCIAL)} nota="Aportaciones pagadas" />
        <Dato
          etiqueta="Socios activos"
          valor={String(activos.length)}
          nota={`${pct(activos.reduce((s, r) => s + r.socio.participacion, 0), 0)} del capital`}
        />
        <Dato
          etiqueta="En tesorería"
          valor={pct(tesoreria.socio.participacion, 0)}
          nota="Pendiente de venta"
        />
        <Dato
          etiqueta="Margen a repartir"
          valor={pesos(margenNeto)}
          nota="Mensual, antes de ISR"
        />
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

      <Tarjeta
        titulo="Metas del año"
        descripcion="La marca vertical es el avance del calendario: a la izquierda va atrasado, a la derecha adelantado"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {resumenMetas().map((m) => {
            const estado = estadoMeta(m.avanceCaptacion);
            return (
              <div key={m.socio.id} className="min-w-0 space-y-3 rounded-lg bg-[var(--plane)] p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link href={`/socios/${m.socio.id}`} className="text-sm font-medium text-ink hover:underline">
                    {m.socio.nombre}
                  </Link>
                  <span className="text-xs text-muted">
                    {m.prospectosAbiertos} prospectos · {pesos(m.pipelineCaptacion)} ponderados
                  </span>
                </div>
                <BarraMeta
                  etiqueta="Captación"
                  logrado={m.logradoCaptacion}
                  meta={m.meta.captacion}
                  avance={m.avanceCaptacion}
                  esperado={avanceDelAnio()}
                  estado={estado}
                  color={COLOR_META[estado]}
                />
                <BarraMeta
                  etiqueta="Colocación"
                  logrado={m.logradoColocacion}
                  meta={m.meta.colocacion}
                  avance={m.avanceColocacion}
                  esperado={avanceDelAnio()}
                  estado={estadoMeta(m.avanceColocacion)}
                  color={COLOR_META[estadoMeta(m.avanceColocacion)]}
                />
              </div>
            );
          })}
        </div>
      </Tarjeta>

      <Tarjeta
        titulo="Aportación a la operación"
        descripcion="Dinero propio del socio contra dinero de terceros que él trajo"
      >
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--s1)" }} aria-hidden />
            Directo (capital propio)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--s2)" }} aria-hidden />
            Indirecto (lo que trajo)
          </span>
        </div>

        <ul className="space-y-4">
          {activos.map((r) => (
            <li key={r.socio.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm text-ink">{r.socio.nombre}</span>
                <span className="tabular text-sm text-ink-2">
                  {pesos(r.directo + r.indirecto)}
                  <span className="ml-2 text-xs text-muted">
                    {pct((r.directo + r.indirecto) / totalCaptado())} del fondeo
                  </span>
                </span>
              </div>
              {/* El separador entre tramos es superficie, no un borde */}
              <div className="mt-1.5 flex h-2 gap-[2px]">
                <span
                  className="rounded-sm"
                  style={{
                    width: `${(r.directo / maxAportado) * 100}%`,
                    background: "var(--s1)",
                  }}
                />
                <span
                  className="rounded-sm"
                  style={{
                    width: `${(r.indirecto / maxAportado) * 100}%`,
                    background: "var(--s2)",
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-muted">
                {r.directo > 0 ? `${pesos(r.directo)} propios · ` : "Sin inversión propia · "}
                {pesos(r.indirecto)} de {r.inversionistasTraidos}{" "}
                {r.inversionistasTraidos === 1 ? "inversionista" : "inversionistas"}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
          {pesos(captacionDirecta())} llegaron sin que los trajera un socio, y{" "}
          {pesos(carteraSinOrigen())} de cartera se originaron en la operación.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Retorno por socio" descripcion="Mensual">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">Socio</th>
                <th className="px-2 py-2 text-right font-medium">Participación</th>
                <th className="px-2 py-2 text-right font-medium">Inversión propia</th>
                <th className="px-2 py-2 text-right font-medium">Rendimiento propio</th>
                <th className="px-2 py-2 text-right font-medium">Parte del margen</th>
                <th className="px-2 py-2 text-right font-medium">Retorno total</th>
                <th className="px-2 py-2 text-right font-medium">Sobre aportación</th>
              </tr>
            </thead>
            <tbody>
              {resumen.map((r) => (
                <tr
                  key={r.socio.id}
                  className={`border-b border-[var(--hair)] last:border-0 ${
                    r.socio.enTesoreria ? "text-muted" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 sm:px-2">
                    {r.socio.enTesoreria ? (
                      <span className="text-muted">{r.socio.nombre}</span>
                    ) : (
                      <Link href={`/socios/${r.socio.id}`} className="text-ink hover:underline">
                        {r.socio.nombre}
                      </Link>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular">{pct(r.socio.participacion, 0)}</td>
                  <td className="px-2 py-2.5 text-right tabular">
                    {r.directo ? pesos(r.directo) : "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular">
                    {r.rendimientoPropio ? pesos(r.rendimientoPropio) : "—"}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular">
                    {r.socio.enTesoreria ? "sin asignar" : pesos(r.participacionMargen)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular font-medium text-ink">
                    {r.socio.enTesoreria ? "—" : pesos(r.retornoMensual)}
                  </td>
                  <td className="px-2 py-2.5 text-right tabular">
                    {r.socio.enTesoreria ? "—" : pct(r.retornoSobreAportacion, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          El rendimiento propio es lo que la casa le paga por su dinero, igual que a cualquier
          inversionista. La parte del margen es su porcentaje de la utilidad. El 20% en tesorería no
          tiene dueño, por eso su margen queda sin asignar.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Cartera originada" descripcion="Créditos que trajo cada socio">
        <ul className="space-y-3">
          {activos.map((r) => (
            <li key={r.socio.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-ink-2">{r.socio.nombre}</span>
                <span className="tabular text-sm text-ink">
                  {pesos(r.carteraOriginada)}
                  <span className="ml-2 text-xs text-muted">
                    {r.creditosOriginados} · {pct(r.carteraOriginada / totalColocado(), 0)}
                  </span>
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--plane)]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(r.carteraOriginada / totalColocado()) * 100}%`,
                    background: "var(--s1)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta titulo="Socios que además son inversionistas">
        <ul className="space-y-2">
          {SOCIOS.filter((s) => s.inversionPropiaId).map((s) => {
            const inv = INVERSIONISTAS.find((i) => i.id === s.inversionPropiaId)!;
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <Link href={`/inversionistas/${inv.id}`} className="text-ink hover:underline">
                    {s.nombre}
                  </Link>
                  <Etiqueta>Socio</Etiqueta>
                  <Etiqueta>Inversionista</Etiqueta>
                </span>
                <span className="tabular text-ink-2">
                  {pesos(inv.capital)} al {pct(inv.tasaAnual)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Son la misma persona en un solo registro. Por eso puede verse en un lugar cuánto tiene
          adentro un socio, sumando su capital social y su inversión.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Concentración en manos de socios">
        {(() => {
          const deSocios = INVERSIONISTAS.filter((i) => {
            const s = socioDeInversionista(i);
            return s && SOCIOS.some((x) => x.id === s.id && x.inversionPropiaId === i.id);
          }).reduce((s, i) => s + i.capital, 0);
          return (
            <>
              <p className="text-3xl font-semibold text-ink">{pct(deSocios / totalCaptado())}</p>
              <p className="mt-1 text-sm text-ink-2">
                del fondeo es dinero de los propios socios ({pesos(deSocios)})
              </p>
              <p className="mt-3 text-xs text-muted">
                Es capital comprometido y difícilmente se va, pero también significa que ese
                porcentaje del pasivo no representa dinero nuevo entrando de fuera.
              </p>
              <div className="mt-3">
                <Insignia estado={deSocios / totalCaptado() > 0.4 ? "warning" : "good"}>
                  {deSocios / totalCaptado() > 0.4
                    ? "Alta dependencia del capital de los socios"
                    : "Dependencia moderada"}
                </Insignia>
              </div>
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
