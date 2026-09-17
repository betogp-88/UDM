"use client";

import { useId } from "react";

/** Texto -> numero, tolerando $ , . y espacios. */
export function aNumero(texto: string): number {
  const limpio = texto.replace(/[^0-9]/g, "");
  return limpio ? Number(limpio) : 0;
}

/** 1500000 -> "1,500,000" */
export function conSeparadores(n: number): string {
  return n.toLocaleString("es-MX", { maximumFractionDigits: 0 });
}

/** Monto en pesos, escribible. Se formatea mientras se teclea. */
export function CampoMonto({
  etiqueta,
  valor,
  onChange,
  ayuda,
}: {
  etiqueta: string;
  valor: number;
  onChange: (v: number) => void;
  ayuda?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-ink-2">
        {etiqueta}
      </label>
      <div className="flex items-center rounded-lg bg-[var(--plane)] ring-1 ring-[var(--hair)] focus-within:ring-2 focus-within:ring-[var(--brand)]">
        <span className="pl-3 text-sm text-muted">$</span>
        <input
          id={id}
          inputMode="numeric"
          value={conSeparadores(valor)}
          onChange={(e) => onChange(aNumero(e.target.value))}
          className="w-full bg-transparent px-2 py-2 text-sm tabular text-ink outline-none"
        />
      </div>
      {ayuda ? <p className="mt-1 text-xs text-muted">{ayuda}</p> : null}
    </div>
  );
}

/** Tasa anual, escribible, con el signo de porcentaje a la derecha. */
export function CampoTasa({
  etiqueta,
  valor,
  onChange,
  ayuda,
}: {
  etiqueta: string;
  valor: number;
  onChange: (v: number) => void;
  ayuda?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-ink-2">
        {etiqueta}
      </label>
      <div className="flex items-center rounded-lg bg-[var(--plane)] ring-1 ring-[var(--hair)] focus-within:ring-2 focus-within:ring-[var(--brand)]">
        <input
          id={id}
          inputMode="decimal"
          value={valor}
          onChange={(e) => {
            const v = Number(e.target.value.replace(/[^0-9.]/g, ""));
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className="w-full bg-transparent px-3 py-2 text-sm tabular text-ink outline-none"
        />
        <span className="pr-3 text-sm text-muted">%</span>
      </div>
      {ayuda ? <p className="mt-1 text-xs text-muted">{ayuda}</p> : null}
    </div>
  );
}

export const PLAZOS = [3, 6, 9, 12, 18, 24];

/**
 * Plazo en botones y no en deslizador: los pasos no son parejos y un
 * deslizador con saltos irregulares se siente roto.
 */
export function SelectorPlazo({
  valor,
  onChange,
  opciones = PLAZOS,
  etiqueta = "Plazo",
}: {
  valor: number;
  onChange: (v: number) => void;
  opciones?: number[];
  etiqueta?: string;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs text-ink-2">{etiqueta}</span>
      <div className="flex flex-wrap gap-1.5">
        {opciones.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={valor === o}
            className={`rounded-lg px-3 py-1.5 text-sm tabular transition-colors ${
              valor === o
                ? "bg-brand font-medium text-[var(--brand-ink)]"
                : "bg-[var(--plane)] text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
            }`}
          >
            {o}
          </button>
        ))}
        <span className="self-center pl-1 text-xs text-muted">meses</span>
      </div>
    </div>
  );
}

export function CampoTexto({
  etiqueta,
  valor,
  onChange,
  placeholder,
}: {
  etiqueta: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-ink-2">
        {etiqueta}
      </label>
      <input
        id={id}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-[var(--plane)] px-3 py-2 text-sm text-ink ring-1 ring-[var(--hair)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
      />
    </div>
  );
}

export function Buscador({
  valor,
  onChange,
  placeholder = "Buscar por nombre…",
}: {
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg bg-surface px-3 py-2 text-sm text-ink ring-1 ring-[var(--hair)] outline-none focus:ring-2 focus:ring-[var(--brand)] sm:w-64"
    />
  );
}

/** Encabezado de columna que ordena al hacer clic. */
export function Th({
  children,
  campo,
  orden,
  onOrdenar,
  alinear = "left",
}: {
  children: React.ReactNode;
  campo: string;
  orden: { campo: string; asc: boolean };
  onOrdenar: (campo: string) => void;
  alinear?: "left" | "right";
}) {
  const activo = orden.campo === campo;
  return (
    <th className={`px-2 py-2 font-medium ${alinear === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onOrdenar(campo)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-ink ${
          activo ? "text-ink" : ""
        }`}
      >
        {children}
        <span aria-hidden className={activo ? "opacity-100" : "opacity-25"}>
          {activo && !orden.asc ? "▼" : "▲"}
        </span>
      </button>
    </th>
  );
}
