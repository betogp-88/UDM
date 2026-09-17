"use client";

import { useState } from "react";
import { pesos, mesLargo, MESES_ABREV } from "@/lib/formato";

export type PuntoCalce = {
  fecha: string;
  entradas: number;
  salidas: number;
  neto: number;
  proyectado: number;
  netoConProyeccion: number;
};

const ALTO_TRAZO = 200;

export function GraficaCalce({ datos }: { datos: PuntoCalce[] }) {
  const [activo, setActivo] = useState<number | null>(null);
  const [verTabla, setVerTabla] = useState(false);
  const [conProyeccion, setConProyeccion] = useState(true);

  const entradaTotal = (d: PuntoCalce) => d.entradas + (conProyeccion ? d.proyectado : 0);
  const neto = (d: PuntoCalce) => (conProyeccion ? d.netoConProyeccion : d.neto);

  const max = Math.max(...datos.flatMap((d) => [entradaTotal(d), d.salidas]));
  const tope = Math.ceil(max / 2_000_000) * 2_000_000;
  const ticks = [tope, tope / 2, 0];
  const alto = (v: number) => Math.max((v / tope) * ALTO_TRAZO, v > 0 ? 2 : 0);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <Leyenda conProyeccion={conProyeccion} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setConProyeccion((v) => !v)}
            className="rounded-md px-2 py-1 text-xs text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
          >
            {conProyeccion ? "Solo comprometido" : "Incluir probable"}
          </button>
          <button
            type="button"
            onClick={() => setVerTabla((v) => !v)}
            className="rounded-md px-2 py-1 text-xs text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
          >
            {verTabla ? "Ver gráfica" : "Ver tabla"}
          </button>
        </div>
      </div>

      {verTabla ? (
        <Tabla datos={datos} conProyeccion={conProyeccion} />
      ) : (
        <div className="relative flex gap-2">
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
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute inset-x-0 border-t"
                  style={{ borderColor: "var(--grid)", top: ALTO_TRAZO - (t / tope) * ALTO_TRAZO + 7 }}
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
                      {neto(d) < 0 ? (
                        <span
                          aria-hidden
                          className="text-[9px] leading-none"
                          style={{ color: "var(--critical)" }}
                        >
                          ▲
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-end justify-center gap-[2px]">
                      {/* Entrada: lo contratado abajo, lo probable encima con su propio tono */}
                      <span className="flex w-full max-w-[14px] flex-col justify-end">
                        {conProyeccion && d.proyectado > 0 ? (
                          <>
                            <span
                              className="block rounded-t-[4px]"
                              style={{ height: alto(d.proyectado), background: "var(--f1)" }}
                            />
                            <span className="block h-[2px]" />
                          </>
                        ) : null}
                        <span
                          className={`block ${conProyeccion && d.proyectado > 0 ? "" : "rounded-t-[4px]"}`}
                          style={{ height: alto(d.entradas), background: "var(--s1)" }}
                        />
                      </span>
                      <span
                        className="block w-full max-w-[14px] rounded-t-[4px]"
                        style={{ height: alto(d.salidas), background: "var(--s2)" }}
                      />
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

          {activo !== null ? (
            <Tooltip
              d={datos[activo]}
              indice={activo}
              total={datos.length}
              conProyeccion={conProyeccion}
            />
          ) : null}
        </div>
      )}

      <p className="mt-4 text-xs text-muted">
        ▲ marca los meses donde sale más efectivo del que entra.{" "}
        {conProyeccion
          ? "La banda clara es lo apalabrado en el CRM, ponderado por probabilidad — no está firmado."
          : "Solo se muestran contratos firmados."}
      </p>
    </div>
  );
}

function Tooltip({
  d,
  indice,
  total,
  conProyeccion,
}: {
  d: PuntoCalce;
  indice: number;
  total: number;
  conProyeccion: boolean;
}) {
  const izquierda = indice < total / 2;
  const n = conProyeccion ? d.netoConProyeccion : d.neto;
  return (
    <div
      className="pointer-events-none absolute top-0 z-10 w-56 rounded-lg bg-surface p-3 text-xs shadow-lg ring-1 ring-[var(--hair)]"
      style={izquierda ? { left: "50%" } : { right: "50%" }}
    >
      <p className="font-semibold capitalize text-ink">{mesLargo(new Date(d.fecha))}</p>
      <dl className="mt-2 space-y-1">
        <Fila color="var(--s1)" etiqueta="Entra contratado" valor={pesos(d.entradas)} />
        {conProyeccion && d.proyectado > 0 ? (
          <Fila color="var(--f1)" etiqueta="Probable (CRM)" valor={pesos(d.proyectado)} />
        ) : null}
        <Fila color="var(--s2)" etiqueta="Sale" valor={pesos(d.salidas)} />
      </dl>
      <p className="mt-2 border-t border-[var(--hair)] pt-2 text-ink-2">
        Neto{" "}
        <span
          className="font-semibold tabular"
          style={{ color: n < 0 ? "var(--critical)" : "var(--good)" }}
        >
          {n < 0 ? "−" : "+"}
          {pesos(Math.abs(n)).slice(1)}
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

function Leyenda({ conProyeccion }: { conProyeccion: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--s1)" }} aria-hidden />
        Entra contratado
      </span>
      {conProyeccion ? (
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--f1)" }} aria-hidden />
          Probable del CRM
        </span>
      ) : null}
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--s2)" }} aria-hidden />
        Sale
      </span>
    </div>
  );
}

function Tabla({ datos, conProyeccion }: { datos: PuntoCalce[]; conProyeccion: boolean }) {
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full min-w-[520px] text-xs">
        <thead>
          <tr className="border-b border-[var(--hair)] text-left text-muted">
            <th className="px-4 py-2 font-medium sm:px-2">Mes</th>
            <th className="px-2 py-2 text-right font-medium">Contratado</th>
            {conProyeccion ? <th className="px-2 py-2 text-right font-medium">Probable</th> : null}
            <th className="px-2 py-2 text-right font-medium">Sale</th>
            <th className="px-2 py-2 text-right font-medium">Neto</th>
          </tr>
        </thead>
        <tbody className="tabular">
          {datos.map((d) => {
            const n = conProyeccion ? d.netoConProyeccion : d.neto;
            return (
              <tr key={d.fecha} className="border-b border-[var(--hair)] last:border-0">
                <td className="px-4 py-2 capitalize text-ink-2 sm:px-2">{mesLargo(new Date(d.fecha))}</td>
                <td className="px-2 py-2 text-right text-ink">{pesos(d.entradas)}</td>
                {conProyeccion ? (
                  <td className="px-2 py-2 text-right text-ink-2">
                    {d.proyectado ? pesos(d.proyectado) : "—"}
                  </td>
                ) : null}
                <td className="px-2 py-2 text-right text-ink">{pesos(d.salidas)}</td>
                <td
                  className="px-2 py-2 text-right font-medium"
                  style={{ color: n < 0 ? "var(--critical)" : "var(--good)" }}
                >
                  {n < 0 ? "−" : "+"}
                  {pesos(Math.abs(n)).slice(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
