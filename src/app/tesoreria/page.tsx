import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pct, fecha } from "@/lib/formato";
import { sumarMeses } from "@/lib/formato";
import {
  CUENTAS,
  TESORERIA,
  GASTOS,
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
  const gastoTotal = GASTOS.reduce((s, g) => s + g.monto, 0);
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato etiqueta="Efectivo en bancos" valor={pesos(efectivo)} nota={`${CUENTAS.length} cuentas`} />
        <Dato
          etiqueta="En instrumentos"
          valor={pesos(colocado)}
          nota={`${pct(tasaPromedioTesoreria)} promedio`}
        />
        <Dato etiqueta="Rendimiento mensual" valor={pesos(rendimiento - retencion)} nota="Neto de retención" />
        <Dato etiqueta="Gasto de operación" valor={pesos(gastoTotal)} nota="Mensual" />
      </div>

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
        <Tarjeta titulo="Gastos de operación" descripcion="Mensuales" className="lg:col-span-3">
          <ul className="space-y-2.5">
            {GASTOS.map((g) => (
              <li key={g.categoria}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="text-ink-2">
                    {g.categoria}
                    {g.recurrente ? null : <span className="ml-2 text-xs text-muted">variable</span>}
                  </span>
                  <span className="shrink-0 tabular text-ink">{pesos(g.monto)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--plane)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(g.monto / gastoTotal) * 100}%`,
                      background: g.recurrente ? "var(--s2)" : "var(--muted)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-[var(--hair)] pt-3">
            <span className="text-sm font-semibold text-ink">Total</span>
            <span className="tabular text-sm font-semibold text-ink">{pesos(gastoTotal)}</span>
          </div>
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
