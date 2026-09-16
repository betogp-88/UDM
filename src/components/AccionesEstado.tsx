"use client";

import { useEffect, useState } from "react";

/** Imprimir o compartir el estado de cuenta. No se muestran al imprimir. */
export function AccionesEstado({ resumen }: { resumen: string }) {
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setPuedeCompartir(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2200);
    return () => clearTimeout(t);
  }, [copiado]);

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-md px-3 py-1.5 text-xs text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
      >
        Imprimir o guardar PDF
      </button>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(resumen);
            setCopiado(true);
          } catch {
            setCopiado(false);
          }
        }}
        className="rounded-md px-3 py-1.5 text-xs text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
      >
        {copiado ? "Copiado ✓" : "Copiar resumen"}
      </button>
      {puedeCompartir ? (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.share({ title: "Estado de cuenta", text: resumen });
            } catch {
              // cancelado
            }
          }}
          className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-[var(--brand-ink)]"
        >
          Compartir
        </button>
      ) : null}
    </div>
  );
}
