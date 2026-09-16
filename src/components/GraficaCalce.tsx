"use client";

import { useState } from "react";
import { pesos, mesLargo } from "@/lib/formato";
import { MESES_ABREV } from "@/lib/formato";

export type PuntoCalce = { fecha: string; entradas: number; salidas: number; neto: number };

const ALTO_TRAZO = 200; // px

export function GraficaCalce({ datos }: { datos: PuntoCalce[] }) {
  const [activo, setActivo] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);

  const max = Math.max(...datos.flatMap((d) => [d.entradas, d.salidas]));
  const tope = Math.ceil(max / 2_000_000) * 2_000_000;
  const ticks = [tope, tope / 2, 0];
  const alto = (v: number) => Math.max((v / tope) * ALTO_TRAZO, 2);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Leyenda />
        <button
          type="button"
          onClick={() => setVerTabla((v) => !v)}
          className="rounded-md px-2 py-1 text-xs text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
        >
          {verTabla ? "Ver gráfica" : "Ver tabla"}
        </button>
      </div>

      {verTabla ? (
        <Tabla datos={datos} />
      ) : (
        <div className="relative flex gap-2">
          {/* Eje Y */}
          <div
            className="flex w-9 shrink-0 flex-col justify-between text-right text-[10px] tabular text-muted"
            style={{ height: ALTO_TRAZO + 14 }}
            aria-hidden
          >
            {ticks.map((t) => (
              <span key={t}>{t === 0 ? "0" : `$${(t / 1_000_000).toFixed(0)}M`}</span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: ALTO_TRAZO + 14 }}>
              {/* Retícula: hairline, sólida, recesiva */}
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute inset-x-0 border-t"
                  style={{
                    borderColor: "var(--grid)",
                    top: ALTO_TRAZO - (t / tope) * ALTO_TRAZO + 7,
                  }}
                />
              ))}

              <div className="absolute inset-x-0 flex items-end" style={{ height: ALTO_TRAZO + 7 }}>
                {datos.map((d, k) => (
                  <div
                    key={d.fecha}
                    className="flex h-full min-w-0 flex-1 flex-col justify-end"
                    onMouseEnter={() => setActivo(k)}
                    onMouseLeave={() => setActivo(null)}
                    onFocus={() => setActivo(k)}
                    onBlur={() => setActivo(null)}
                    tabIndex={0}
                  >
                    <div className="flex h-3 items-end justify-center">
                      {d.neto < 0 ? (
                        <span
                          aria-hidden
                          className="text-[9px] leading-none"
                          style={{ color: "var(--critical)" }}
                        >
                          ▲
                        </span>
                      ) : null}
                    </div>
                    {/* El separador entre barras es superficie, no un borde */}
                    <div className="flex items-end justify-center gap-[2px]">
                      <Barra alto={alto(d.entradas)} color="var(--s1)" />
                      <Barra alto={alto(d.salidas)} color="var(--s2)" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-1 flex">
              {datos.map((d, k) => (
                <span
                  key={d.fecha}
                  className="min-w-0 flex-1 truncate text-center text-[10px] tabular"
                  style={{ color: activo === k ? "var(--ink)" : "var(--muted)" }}
                >
                  <span>{MESES_ABREV[new Date(d.fecha).getMonth()]}</span>
                  <span className="hidden sm:inline">
                    {" "}
                    {String(new Date(d.fecha).getFullYear()).slice(2)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {activo !== null ? <Tooltip d={datos[activo]} indice={activo} total={datos.length} /> : null}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        ▲ marca los meses donde sale más efectivo del que entra.
      </p>
    </div>
  );
}

function Barra({ alto, color }: { alto: number; color: string }) {
  return (
    <span
      className="block w-full max-w-[14px] rounded-t-[4px]"
      style={{ height: alto, background: color }}
      aria-hidden
    />
  );
}

function Tooltip({ d, indice, total }: { d: PuntoCalce; indice: number; total: number }) {
  const izquierda = indice < total / 2;
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 w-52 rounded-lg bg-surface p-3 text-xs shadow-lg ring-1 ring-[var(--hair)]"
      style={izquierda ? { left: "50%" } : { right: "50%" }}
    >
      <p className="font-semibold capitalize text-ink">{mesLargo(new Date(d.fecha))}</p>
      <dl className="mt-2 space-y-1">
        <Fila color="var(--s1)" etiqueta="Entra" valor={pesos(d.entradas)} />
        <Fila color="var(--s2)" etiqueta="Sale" valor={pesos(d.salidas)} />
      </dl>
      <p className="mt-2 border-t border-[var(--hair)] pt-2 text-ink-2">
        Neto{" "}
        <span
          className="font-semibold tabular"
          style={{ color: d.neto < 0 ? "var(--critical)" : "var(--good)" }}
        >
          {d.neto < 0 ? "−" : "+"}
          {pesos(Math.abs(d.neto)).slice(1)}
        </span>
      </p>
    </div>
  );
}

function Fila({ color, etiqueta, valor }: { color: string; etiqueta: string; valor: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-ink-2">
        <span className="h-2 w-2 rounded-sm" style={{ background: color }} aria-hidden />
        {etiqueta}
      </dt>
      <dd className="tabular text-ink">{valor}</dd>
    </div>
  );
}

function Leyenda() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--s1)" }} aria-hidden />
        Entra (cobranza)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--s2)" }} aria-hidden />
        Sale (inversionistas + gastos)
      </span>
    </div>
  );
}

function Tabla({ datos }: { datos: PuntoCalce[] }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[440px] text-xs">
        <thead>
          <tr className="border-b border-[var(--hair)] text-left text-muted">
            <th className="px-4 py-2 font-medium sm:px-2">Mes</th>
            <th className="px-2 py-2 text-right font-medium">Entra</th>
            <th className="px-2 py-2 text-right font-medium">Sale</th>
            <th className="px-2 py-2 text-right font-medium">Neto</th>
          </tr>
        </thead>
        <tbody className="tabular">
          {datos.map((d) => (
            <tr key={d.fecha} className="border-b border-[var(--hair)] last:border-0">
              <td className="px-4 py-2 capitalize text-ink-2 sm:px-2">{mesLargo(new Date(d.fecha))}</td>
              <td className="px-2 py-2 text-right text-ink">{pesos(d.entradas)}</td>
              <td className="px-2 py-2 text-right text-ink">{pesos(d.salidas)}</td>
              <td
                className="px-2 py-2 text-right font-medium"
                style={{ color: d.neto < 0 ? "var(--critical)" : "var(--good)" }}
              >
                {d.neto < 0 ? "−" : "+"}
                {pesos(Math.abs(d.neto)).slice(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
