import { pesos } from "@/lib/formato";

const TONOS = ["var(--f1)", "var(--f2)", "var(--f3)", "var(--f4)", "var(--f5)"];

/**
 * Embudo por etapa. La rampa es ordinal — un solo tono de claro a oscuro —
 * porque las etapas tienen orden, no identidad.
 */
export function Embudo({
  etapas,
}: {
  etapas: Array<{ etapa: string; cuenta: number; monto: number }>;
}) {
  const max = Math.max(...etapas.map((e) => e.monto), 1);

  return (
    <ul className="space-y-3">
      {etapas.map((e, k) => (
        <li key={e.etapa}>
          {/* La fila envuelve: en pantallas angostas el conteo baja de renglon
              en vez de empujar el ancho de la pagina. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: TONOS[k] }}
                aria-hidden
              />
              {e.etapa}
            </span>
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="tabular text-sm text-ink">{pesos(e.monto)}</span>
              <span className="text-xs text-muted">
                {e.cuenta} {e.cuenta === 1 ? "prospecto" : "prospectos"}
              </span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-[var(--plane)]">
            <div
              className="h-full rounded-sm"
              style={{ width: `${Math.max((e.monto / max) * 100, 2)}%`, background: TONOS[k] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
