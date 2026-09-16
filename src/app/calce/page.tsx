import { Tarjeta, Insignia } from "@/components/ui";
import { GraficaCalce } from "@/components/GraficaCalce";
import { pesos, pct, mesLargo } from "@/lib/formato";
import {
  calce,
  concentracionCaptacion,
  concentracionCartera,
  totalCaptado,
  totalColocado,
} from "@/lib/demo/datos";

export default function Calce() {
  const meses = calce(12);
  const datos = meses.map((m) => ({
    fecha: m.fecha.toISOString(),
    entradas: m.entradas,
    salidas: m.salidas,
    neto: m.neto,
  }));

  const negativos = meses.filter((m) => m.neto < 0);
  const peor = negativos.length
    ? negativos.reduce((a, b) => (a.neto < b.neto ? a : b))
    : null;

  let acumulado = 0;
  const acumulados = meses.map((m) => {
    acumulado += m.neto;
    return { fecha: m.fecha, acumulado };
  });
  const minimoAcumulado = acumulados.reduce((a, b) => (a.acumulado < b.acumulado ? a : b));

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Calce de plazos</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          El capital de los inversionistas se devuelve completo al vencimiento, mientras que los
          créditos pagan en mensualidades. Esta pantalla muestra dónde esa diferencia aprieta.
        </p>
      </header>

      {peor ? (
        <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
          <Insignia estado="critical">Mes con déficit proyectado</Insignia>
          <p className="mt-2 text-lg text-ink">
            En <span className="font-semibold capitalize">{mesLargo(peor.fecha)}</span> salen{" "}
            <span className="font-semibold">{pesos(Math.abs(peor.neto))}</span> más de lo que entra.
          </p>
          <p className="mt-1 text-sm text-muted">
            Coinciden varios vencimientos de capital en el mismo mes. Con {negativos.length}{" "}
            {negativos.length === 1 ? "mes" : "meses"} en déficit dentro del año, el punto más bajo
            del acumulado es {pesos(minimoAcumulado.acumulado)} en{" "}
            <span className="capitalize">{mesLargo(minimoAcumulado.fecha)}</span>.
          </p>
        </div>
      ) : null}

      <Tarjeta titulo="Entradas contra salidas" descripcion="Proyección a 12 meses">
        <GraficaCalce datos={datos} />
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta
          titulo="Concentración de fondeo"
          descripcion={`Cinco inversionistas más grandes sobre ${pesos(totalCaptado())}`}
        >
          <Barras items={concentracionCaptacion()} color="var(--s2)" />
        </Tarjeta>
        <Tarjeta
          titulo="Concentración de cartera"
          descripcion={`Cinco créditos más grandes sobre ${pesos(totalColocado())}`}
        >
          <Barras items={concentracionCartera()} color="var(--s1)" />
        </Tarjeta>
      </div>
    </div>
  );
}

function Barras({
  items,
  color,
}: {
  items: Array<{ nombre: string; monto: number; participacion: number }>;
  color: string;
}) {
  const max = Math.max(...items.map((i) => i.participacion));
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.nombre}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-sm text-ink-2">{i.nombre}</span>
            <span className="shrink-0 tabular text-sm text-ink">
              {pesos(i.monto)} · {pct(i.participacion)}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--plane)]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(i.participacion / max) * 100}%`, background: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
