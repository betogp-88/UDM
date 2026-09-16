import type { ReactNode } from "react";

export function Tarjeta({
  titulo,
  descripcion,
  children,
  className = "",
}: {
  titulo?: string;
  descripcion?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl bg-surface p-4 sm:p-5 ring-1 ring-[var(--hair)] ${className}`}
    >
      {titulo ? (
        <header className="mb-4">
          <h2 className="text-sm font-semibold text-ink">{titulo}</h2>
          {descripcion ? <p className="mt-0.5 text-xs text-muted">{descripcion}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

/** Tarjeta de indicador. Valor en figuras proporcionales, no tabulares. */
export function KPI({
  etiqueta,
  valor,
  nota,
  acento,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  acento?: "good" | "critical" | "neutral";
}) {
  const color =
    acento === "good" ? "text-[var(--good)]" : acento === "critical" ? "text-[var(--critical)]" : "text-ink";
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className={`mt-1 text-2xl font-semibold sm:text-[28px] ${color}`}>{valor}</p>
      {nota ? <p className="mt-1 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}

const COLOR_ESTADO = {
  good: "var(--good)",
  warning: "var(--warning)",
  serious: "var(--serious)",
  critical: "var(--critical)",
} as const;

const ICONO_ESTADO = {
  good: "●",
  warning: "▲",
  serious: "▲",
  critical: "■",
} as const;

export type Estado = keyof typeof COLOR_ESTADO;

/**
 * Estado siempre con icono + texto: el color nunca carga el significado solo.
 * Distintas formas para que se distinga en impresion y con daltonismo.
 */
export function Insignia({ estado, children }: { estado: Estado; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-2">
      <span aria-hidden style={{ color: COLOR_ESTADO[estado] }}>
        {ICONO_ESTADO[estado]}
      </span>
      {children}
    </span>
  );
}

export function Etiqueta({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md bg-[var(--plane)] px-1.5 py-0.5 text-[11px] text-ink-2 ring-1 ring-[var(--hair)]">
      {children}
    </span>
  );
}

export function Vacio({ children }: { children: ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}
