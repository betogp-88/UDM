import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pct, fecha } from "@/lib/formato";
import { sumarMeses } from "@/lib/formato";
import {
  CUENTAS,
  TESORERIA,
  GRUPOS_GASTO,
  gastosPorGrupo,
  gastoTotal,
  totalColocado,
  HOY,
  efectivoDisponible,
  totalTesoreria,
  rendimientoTesoreriaMensual,
  retencionTesoreriaMensual,
  tasaActivaPromedio,
} from "@/lib/demo/datos";

export default function Tesoreria() {
  const efectivo = efectivoDisponible();
  const colocado = totalTesoreria();
  const rendimiento = rendimientoTesoreriaMensual();
  const retencion = retencionTesoreriaMensual();
  const enCartera = totalColocado();
  const disponible = efectivo + colocado;
  const grupos = gastosPorGrupo();
  const total = gastoTotal();
  const tasaPromedioTesoreria =
    TESORERIA.reduce((s, t) => s + t.monto * t.tasaAnual, 0) / colocado;
  const costoDeOportunidad = (tasaActivaPromedio() - tasaPromedioTesoreria) * colocado;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Tesorería</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Dónde está el dinero que no está colocado en créditos, y qué está rindiendo mientras tanto.
        </p>
      </header>

      {/* Primero el reparto grande: cuánto está trabajando en cartera y cuánto
          está disponible. El desglose viene después. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Dato
          etiqueta="Dinero en cartera"
          valor={pesos(enCartera)}
          nota={`Colocado en créditos y arrendamientos · ${pct(tasaActivaPromedio())}`}
        />
        <Dato
          etiqueta="Dinero disponible"
          valor={pesos(disponible)}
          nota={`${pct(disponible / (enCartera + disponible), 1)} del total`}
        />
      </div>

      <Tarjeta titulo="Desglose del dinero disponible">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-[var(--plane)] p-4">
            <p className="text-xs text-ink-2">En bancos</p>
            <p className="mt-1 truncate text-xl font-semibold text-ink">{pesos(efectivo)}</p>
            <p className="mt-0.5 text-xs text-muted">{CUENTAS.length} cuentas · sin rendimiento</p>
          </div>
          <div className="min-w-0 rounded-lg bg-[var(--plane)] p-4">
            <p className="text-xs text-ink-2">En instrumentos</p>
            <p className="mt-1 truncate text-xl font-semibold text-ink">{pesos(colocado)}</p>
            <p className="mt-0.5 text-xs text-muted">
              {pct(tasaPromedioTesoreria)} promedio · {pesos(rendimiento - retencion)} al mes
            </p>
          </div>
        </div>
        <div className="mt-3 flex h-2.5 gap-[2px] overflow-hidden rounded-full">
          <span style={{ width: `${(efectivo / disponible) * 100}%`, background: "var(--f2)" }} />
          <span style={{ width: `${(colocado / disponible) * 100}%`, background: "var(--s1)" }} />
        </div>
      </Tarjeta>

      <Tarjeta titulo="Cuentas bancarias" descripcion="Una por empresa">
        <ul className="divide-y divide-[var(--hair)]">
          {CUENTAS.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm text-ink">{c.banco}</span>
                  <Etiqueta>{c.empresa}</Etiqueta>
                </span>
                <span className="mt-0.5 block text-xs tabular text-muted">{c.clabe}</span>
              </span>
              <span className="shrink-0 tabular text-lg font-semibold text-ink">{pesos(c.saldo)}</span>
            </li>
          ))}
        </ul>
      </Tarjeta>

      <Tarjeta
        titulo="Inversiones de tesorería"
        descripcion="Tesofomes, pagarés y CETES — el dinero esperando colocación"
      >
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">Emisor</th>
                <th className="px-2 py-2 font-medium">Instrumento</th>
                <th className="px-2 py-2 text-right font-medium">Monto</th>
                <th className="px-2 py-2 text-right font-medium">Tasa</th>
                <th className="px-2 py-2 text-right font-medium">Rendimiento neto</th>
                <th className="px-2 py-2 text-right font-medium">Retención</th>
                <th className="px-2 py-2 font-medium">Vence</th>
              </tr>
            </thead>
            <tbody>
              {TESORERIA.map((t) => {
                const rend = (t.monto * t.tasaAnual) / 12;
                const ret = (t.monto * t.retencionAnual) / 12;
                return (
                  <tr key={t.id} className="border-b border-[var(--hair)] last:border-0">
                    <td className="px-4 py-2.5 text-ink sm:px-2">{t.emisor}</td>
                    <td className="px-2 py-2.5">
                      <Etiqueta>{t.instrumento}</Etiqueta>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(t.monto)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">{pct(t.tasaAnual)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(rend - ret)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-muted">{pesos(ret)}</td>
                    <td className="px-2 py-2.5 text-xs">
                      <span className={t.mesesRestantes <= 1 ? "text-ink" : "text-ink-2"}>
                        {fecha(sumarMeses(HOY, t.mesesRestantes))}
                      </span>
                      {t.mesesRestantes <= 1 ? (
                        <span className="block">
                          <Insignia estado="warning">Reinvertir</Insignia>
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--hair)] font-semibold">
                <td className="px-4 py-2.5 sm:px-2" colSpan={2}>
                  Total
                </td>
                <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(colocado)}</td>
                <td className="px-2 py-2.5 text-right tabular text-ink-2">
                  {pct(tasaPromedioTesoreria)}
                </td>
                <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(rendimiento - retencion)}</td>
                <td className="px-2 py-2.5 text-right tabular text-muted">{pesos(retencion)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
          La retención que nos aplican es impuesto pagado por adelantado: se acredita después, pero
          solo si queda registrado.
        </p>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Gastos" descripcion="Mensuales" className="lg:col-span-3">
          <div className="mb-5 flex items-baseline justify-between border-b border-[var(--hair)] pb-4">
            <span className="text-sm font-semibold text-ink">Gasto total</span>
            <span className="tabular text-xl font-semibold text-ink">{pesos(total)}</span>
          </div>

          <div className="space-y-5">
            {grupos.map((g) => (
              <div key={g.grupo}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{g.grupo}</span>
                  <span className="shrink-0 tabular text-sm text-ink">
                    {pesos(g.monto)}
                    <span className="ml-2 text-xs text-muted">{pct(g.monto / total, 0)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--plane)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(g.monto / total) * 100}%`,
                      background: `var(--f${GRUPOS_GASTO.indexOf(g.grupo) + 2})`,
                    }}
                  />
                </div>
                <ul className="mt-2 space-y-1">
                  {g.items.map((i) => (
                    <li
                      key={i.categoria}
                      className="flex items-baseline justify-between gap-3 text-xs"
                    >
                      <span className="min-w-0 truncate text-ink-2">{i.categoria}</span>
                      <span className="shrink-0 tabular text-muted">{pesos(i.monto)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-5 border-t border-[var(--hair)] pt-3 text-xs text-muted">
            El gasto de referidos no es fijo: depende de cuánto se originó en el mes. Debe salir del
            módulo de comisiones, no capturarse a mano.
          </p>
        </Tarjeta>

        <Tarjeta
          titulo="Costo de tener el dinero parado"
          descripcion="Diferencia contra colocarlo en cartera"
          className="lg:col-span-2"
        >
          <p className="text-3xl font-semibold text-ink">{pesos(costoDeOportunidad / 12)}</p>
          <p className="mt-1 text-sm text-ink-2">al mes</p>
          <p className="mt-3 text-xs text-muted">
            Los {pesos(colocado)} en tesorería rinden {pct(tasaPromedioTesoreria)}. Colocados en
            crédito rendirían {pct(tasaActivaPromedio())}. La diferencia es lo que cuesta la
            liquidez — a veces vale la pena pagarla, pero conviene saber cuánto es.
          </p>
        </Tarjeta>
      </div>
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
