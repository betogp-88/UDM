import { Insignia } from "@/components/ui";
import { pesos, pct } from "@/lib/formato";

/**
 * Avance contra meta. La marca vertical es la fraccion del año transcurrida:
 * es la vara real contra la que se juzga si vamos bien.
 */
export function BarraMeta({
  etiqueta,
  logrado,
  meta,
  avance,
  esperado,
  estado,
  color,
}: {
  etiqueta: string;
  logrado: number;
  meta: number;
  avance: number;
  esperado: number;
  estado: string;
  color: "good" | "warning" | "critical";
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm text-ink-2">{etiqueta}</span>
        <span className="tabular text-sm text-ink">
          {pesos(logrado)}
          <span className="text-muted"> de {pesos(meta)}</span>
        </span>
      </div>

      <div className="relative mt-1.5 h-2.5 overflow-hidden rounded-full bg-[var(--plane)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(avance, 1) * 100}%`, background: `var(--${color})` }}
        />
        <span
          className="absolute top-0 h-full w-px bg-[var(--ink-2)]"
          style={{ left: `${esperado * 100}%` }}
          aria-hidden
        />
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
        <Insignia estado={color}>
          {estado} · {pct(avance, 0)} de la meta
        </Insignia>
        <span className="text-xs text-muted">
          La marca es el {pct(esperado, 0)} del año transcurrido
        </span>
      </div>
    </div>
  );
}
