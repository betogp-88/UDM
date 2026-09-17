"use client";

import { useState } from "react";
import { Tarjeta, Insignia } from "@/components/ui";
import { pesos, fecha, mesLargo, sumarMeses } from "@/lib/formato";
import {
  INVERSIONISTAS,
  CREDITOS,
  mensualidadCredito,
  gastoTotal,
  HOY,
  vencimientoInversion,
  tasaRetencion,
} from "@/lib/demo/datos";

/** Día de pago asignado por contrato, estable entre recargas. */
function diaDePago(id: string): number {
  const n = Number(id.slice(-2));
  return [3, 7, 10, 14, 18, 22, 25, 28][n % 8];
}

export default function Calendario() {
  const [offset, setOffset] = useState(0);
  const mes = sumarMeses(new Date(HOY.getFullYear(), HOY.getMonth(), 1), offset);
  const pasado = offset < 0;
  const tasaRet = tasaRetencion(mes.getFullYear());

  const entradas = CREDITOS.filter((c) => offset >= 0 && offset < c.mesesRestantes)
    .map((c) => ({
      id: c.id,
      dia: diaDePago(c.id),
      nombre: c.cliente,
      etiqueta: c.tipoCredito,
      monto: mensualidadCredito(c),
      atraso: offset === 0 ? c.diasAtraso : 0,
    }))
    .sort((a, b) => a.dia - b.dia);

  const salidas = INVERSIONISTAS.filter((i) => offset >= 0 && offset <= i.mesesRestantes)
    .map((i) => {
      const interes = (i.capital * i.tasaAnual) / 12;
      const retencion = (i.capital * tasaRet) / 12;
      const vence = offset === i.mesesRestantes;
      return {
        id: i.id,
        dia: diaDePago(i.id),
        nombre: i.nombre,
        monto: interes - retencion + (vence ? i.capital : 0),
        vence,
        vencimiento: vencimientoInversion(i),
      };
    })
    .sort((a, b) => a.dia - b.dia);

  const totalEntra = entradas.reduce((s, e) => s + e.monto, 0);
  const totalSale = salidas.reduce((s, e) => s + e.monto, 0) + (offset >= 0 ? gastoTotal() : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold capitalize text-ink">{mesLargo(mes)}</h2>
          <p className="mt-1 text-sm text-ink-2">
            {pasado
              ? "Mes cerrado — lo que ya ocurrió."
              : offset === 0
                ? "Mes en curso."
                : "Proyección — lo que está programado."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            className="rounded-lg px-3 py-2 text-sm text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
          >
            ← Anterior
          </button>
          {offset !== 0 ? (
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="rounded-lg px-3 py-2 text-sm text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
            >
              Hoy
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            className="rounded-lg px-3 py-2 text-sm text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {pasado ? (
        <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
          <Insignia estado="warning">Sin historial en el prototipo</Insignia>
          <p className="mt-2 text-sm text-ink-2">
            Los meses anteriores mostrarán los pagos realmente confirmados. Eso requiere el libro de
            movimientos, que todavía no existe: hoy el sistema solo conoce lo proyectado.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Dato etiqueta="Entra" valor={pesos(totalEntra)} color="var(--s1)" />
        <Dato etiqueta="Sale" valor={pesos(totalSale)} color="var(--s2)" />
        <Dato
          etiqueta="Neto"
          valor={`${totalEntra - totalSale < 0 ? "−" : "+"}${pesos(Math.abs(totalEntra - totalSale)).slice(1)}`}
          color={totalEntra - totalSale < 0 ? "var(--critical)" : "var(--good)"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Cobranza por recibir" descripcion={`${entradas.length} contratos`}>
          {entradas.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Sin movimientos este mes.</p>
          ) : (
            <ul className="divide-y divide-[var(--hair)]">
              {entradas.map((e) => (
                <li key={e.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-7 shrink-0 text-center text-xs tabular text-muted">{e.dia}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{e.nombre}</span>
                    <span className="text-xs text-muted">{e.etiqueta}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block tabular text-sm text-ink">{pesos(e.monto)}</span>
                    {e.atraso > 0 ? (
                      <Insignia
                        estado={e.atraso > 60 ? "critical" : e.atraso > 30 ? "serious" : "warning"}
                      >
                        {e.atraso} días
                      </Insignia>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta titulo="Pagos por hacer" descripcion={`${salidas.length} inversionistas + gastos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {salidas.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="w-7 shrink-0 text-center text-xs tabular text-muted">{s.dia}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{s.nombre}</span>
                  <span className="text-xs text-muted">
                    {s.vence ? "Rendimiento + devolución de capital" : "Rendimiento neto"}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block tabular text-sm text-ink">{pesos(s.monto)}</span>
                  {s.vence ? (
                    <Insignia estado="warning">Vence {fecha(s.vencimiento)}</Insignia>
                  ) : null}
                </span>
              </li>
            ))}
            {offset >= 0 ? (
              <li className="flex items-center gap-3 py-2.5">
                <span className="w-7 shrink-0 text-center text-xs tabular text-muted">30</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink">Gastos de operación</span>
                  <span className="text-xs text-muted">Administrativos, operativos y referidos</span>
                </span>
                <span className="shrink-0 tabular text-sm text-ink">{pesos(gastoTotal())}</span>
              </li>
            ) : null}
          </ul>
        </Tarjeta>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, color }: { etiqueta: string; valor: string; color: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="flex items-center gap-1.5 text-xs text-ink-2">
        <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: color }} aria-hidden />
        {etiqueta}
      </p>
      <p className="mt-1 truncate text-xl font-semibold text-ink">{valor}</p>
    </div>
  );
}
