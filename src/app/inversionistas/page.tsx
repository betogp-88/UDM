"use client";

import Link from "next/link";
import { useState } from "react";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { Buscador, Th } from "@/components/campos";
import { pesos, pct, fecha } from "@/lib/formato";
import {
  INVERSIONISTAS,
  totalCaptado,
  tasaPasivaPromedio,
  vencimientoInversion,
  socioDeInversionista,
  interesPagadoMensual,
  retencionMensual,
  tasaRetencion,
  HOY,
} from "@/lib/demo/datos";

type Campo = "nombre" | "tipo" | "capital" | "tasa" | "rendimiento" | "vence" | "socio";

export default function Inversionistas() {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<{ campo: Campo; asc: boolean }>({
    campo: "vence",
    asc: true,
  });

  const tasaRet = tasaRetencion(HOY.getFullYear());

  const filas = INVERSIONISTAS.map((i) => {
    const socio = socioDeInversionista(i);
    const rendimiento = (i.capital * i.tasaAnual) / 12 - (i.capital * tasaRet) / 12;
    return { inv: i, socio, rendimiento, vence: vencimientoInversion(i) };
  })
    .filter((f) => f.inv.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => {
      const dir = orden.asc ? 1 : -1;
      switch (orden.campo) {
        case "nombre":
          return a.inv.nombre.localeCompare(b.inv.nombre, "es") * dir;
        case "tipo":
          return a.inv.tipo.localeCompare(b.inv.tipo, "es") * dir;
        case "capital":
          return (a.inv.capital - b.inv.capital) * dir;
        case "tasa":
          return (a.inv.tasaAnual - b.inv.tasaAnual) * dir;
        case "rendimiento":
          return (a.rendimiento - b.rendimiento) * dir;
        case "socio":
          return (a.socio?.nombre ?? "zzz").localeCompare(b.socio?.nombre ?? "zzz", "es") * dir;
        default:
          return (a.inv.mesesRestantes - b.inv.mesesRestantes) * dir;
      }
    });

  function ordenar(campo: string) {
    setOrden((o) => (o.campo === campo ? { campo: o.campo, asc: !o.asc } : { campo: campo as Campo, asc: true }));
  }

  const capitalFiltrado = filas.reduce((s, f) => s + f.inv.capital, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold text-ink">Inversionistas</h2>
        <Link
          href="/crm"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
        >
          + Nuevo, desde el CRM
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Capital captado" valor={pesos(totalCaptado())} />
        <Dato etiqueta="Contratos" valor={String(INVERSIONISTAS.length)} />
        <Dato etiqueta="Rendimiento promedio" valor={pct(tasaPasivaPromedio())} />
        <Dato
          etiqueta="Rendimiento bruto mensual"
          valor={pesos(interesPagadoMensual())}
          nota={`Retención ${pesos(retencionMensual())}`}
        />
      </div>

      <Tarjeta>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Buscador valor={busqueda} onChange={setBusqueda} />
          <p className="text-xs text-muted">
            {filas.length} de {INVERSIONISTAS.length} · {pesos(capitalFiltrado)}
          </p>
        </div>

        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-xs text-muted">
                <Th campo="nombre" orden={orden} onOrdenar={ordenar}>
                  Inversionista
                </Th>
                <Th campo="tipo" orden={orden} onOrdenar={ordenar}>
                  Tipo
                </Th>
                <Th campo="capital" orden={orden} onOrdenar={ordenar} alinear="right">
                  Capital
                </Th>
                <Th campo="tasa" orden={orden} onOrdenar={ordenar} alinear="right">
                  Tasa
                </Th>
                <Th campo="rendimiento" orden={orden} onOrdenar={ordenar} alinear="right">
                  Rendimiento neto
                </Th>
                <Th campo="vence" orden={orden} onOrdenar={ordenar}>
                  Vence
                </Th>
                <Th campo="socio" orden={orden} onOrdenar={ordenar}>
                  Traído por
                </Th>
                <th className="px-2 py-2 text-left font-medium">Expediente</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ inv, socio, rendimiento, vence }) => (
                <tr
                  key={inv.id}
                  className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--plane)]"
                >
                  <td className="px-2 py-2.5">
                    <Link href={`/inversionistas/${inv.id}`} className="text-ink hover:underline">
                      {inv.nombre}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5">
                    <Etiqueta>{inv.tipo}</Etiqueta>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(inv.capital)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">{pct(inv.tasaAnual)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(rendimiento)}</td>
                  <td className="px-2 py-2.5 text-xs">
                    <span className={inv.mesesRestantes <= 2 ? "text-ink" : "text-ink-2"}>
                      {fecha(vence)}
                    </span>
                    <span className="block text-muted">
                      {inv.mesesRestantes} {inv.mesesRestantes === 1 ? "mes" : "meses"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-xs">
                    {socio ? (
                      <span className="text-ink-2">
                        {socio.nombre.split(" ").slice(0, 2).join(" ")}
                      </span>
                    ) : (
                      <span className="text-muted">Directo</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    {inv.expedienteCompleto ? (
                      <Insignia estado="good">Completo</Insignia>
                    ) : (
                      <Insignia estado="serious">Incompleto</Insignia>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nadie coincide con «{busqueda}».
          </p>
        ) : null}
      </Tarjeta>
    </div>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 truncate text-xl font-semibold text-ink">{valor}</p>
      {nota ? <p className="mt-0.5 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}
