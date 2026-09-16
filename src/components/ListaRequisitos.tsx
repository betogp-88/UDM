"use client";

import { useEffect, useState } from "react";

export type GrupoRequisitos = {
  clave: string;
  etiqueta: string;
  items: string[];
};

/**
 * Lista de requisitos con selector entre personas y botones para copiarla o
 * compartirla. Pensada para mandarse por WhatsApp a un prospecto.
 */
export function ListaRequisitos({
  titulo,
  grupos,
  cierre,
}: {
  titulo: string;
  grupos: GrupoRequisitos[];
  cierre?: string;
}) {
  const [activo, setActivo] = useState(grupos[0].clave);
  const [copiado, setCopiado] = useState(false);
  const [puedeCompartir, setPuedeCompartir] = useState(false);

  // Se resuelve despues de montar: en el servidor no existe navigator.
  useEffect(() => {
    setPuedeCompartir(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 2200);
    return () => clearTimeout(t);
  }, [copiado]);

  const grupo = grupos.find((g) => g.clave === activo) ?? grupos[0];

  const texto = [
    `${titulo} — ${grupo.etiqueta}`,
    "Un Dígito Más",
    "",
    ...grupo.items.map((r, k) => `${k + 1}. ${r}`),
    ...(cierre ? ["", cierre] : []),
  ].join("\n");

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      // Safari sin permiso de portapapeles: seleccionar a mano es el respaldo.
      setCopiado(false);
    }
  }

  async function compartir() {
    try {
      await navigator.share({ title: `${titulo} — ${grupo.etiqueta}`, text: texto });
    } catch {
      // El usuario cancelo la hoja de compartir. No hay nada que hacer.
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={titulo}
          className="inline-flex rounded-lg bg-[var(--plane)] p-1 ring-1 ring-[var(--hair)]"
        >
          {grupos.map((g) => (
            <button
              key={g.clave}
              role="tab"
              aria-selected={activo === g.clave}
              type="button"
              onClick={() => setActivo(g.clave)}
              className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
                activo === g.clave
                  ? "bg-brand font-medium text-[var(--brand-ink)]"
                  : "text-ink-2 hover:text-ink"
              }`}
            >
              {g.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copiar}
            className="rounded-md px-3 py-1.5 text-xs text-ink-2 ring-1 ring-[var(--hair)] transition-colors hover:text-ink"
          >
            {copiado ? "Copiado ✓" : "Copiar"}
          </button>
          {puedeCompartir ? (
            <button
              type="button"
              onClick={compartir}
              className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-[var(--brand-ink)]"
            >
              Compartir
            </button>
          ) : null}
        </div>
      </div>

      <ol className="mt-4 space-y-2 text-sm text-ink-2">
        {grupo.items.map((r, k) => (
          <li key={r} className="flex gap-2.5">
            <span className="w-4 shrink-0 text-right text-xs tabular text-muted">{k + 1}</span>
            {r}
          </li>
        ))}
      </ol>

      {cierre ? (
        <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">{cierre}</p>
      ) : null}
    </div>
  );
}
