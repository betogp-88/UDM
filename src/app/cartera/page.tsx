"use client";

import Link from "next/link";
import { useState } from "react";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { Buscador, Th } from "@/components/campos";
import { pesos, pct } from "@/lib/formato";
import { interesMoratorio } from "@/lib/demo/calculos";
import {
  CREDITOS,
  totalColocado,
  tasaActivaPromedio,
  resumenBuckets,
  bucket,
  ESTADO_BUCKET,
  mensualidadCredito,
  interesCobradoMensual,
  socioDeCredito,
} from "@/lib/demo/datos";

type Campo = "cliente" | "producto" | "saldo" | "tasa" | "cuota" | "plazo" | "mora" | "atraso" | "socio";

export default function Cartera() {
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<{ campo: Campo; asc: boolean }>({
    campo: "atraso",
    asc: false,
  });

  const buckets = resumenBuckets();
  const atrasado = buckets
    .filter((b) => b.bucket !== "Al corriente")
    .reduce((s, b) => s + b.monto, 0);

  const filas = CREDITOS.map((c) => {
    const cuota = mensualidadCredito(c);
    return {
      c,
      cuota,
      socio: socioDeCredito(c),
      mora: c.diasAtraso ? interesMoratorio(cuota, c.tasaAnual, c.diasAtraso) : 0,
    };
  })
    .filter((f) => f.c.cliente.toLowerCase().includes(busqueda.trim().toLowerCase()))
    .sort((a, b) => {
      const dir = orden.asc ? 1 : -1;
      switch (orden.campo) {
        case "cliente":
          return a.c.cliente.localeCompare(b.c.cliente, "es") * dir;
        case "producto":
          return a.c.tipoCredito.localeCompare(b.c.tipoCredito, "es") * dir;
        case "saldo":
          return (a.c.saldo - b.c.saldo) * dir;
        case "tasa":
          return (a.c.tasaAnual - b.c.tasaAnual) * dir;
        case "cuota":
          return (a.cuota - b.cuota) * dir;
        case "plazo":
          return (a.c.mesesRestantes - b.c.mesesRestantes) * dir;
        case "mora":
          return (a.mora - b.mora) * dir;
        case "socio":
          return (a.socio?.nombre ?? "zzz").localeCompare(b.socio?.nombre ?? "zzz", "es") * dir;
        default:
          return (a.c.diasAtraso - b.c.diasAtraso) * dir;
      }
    });

  function ordenar(campo: string) {
    setOrden((o) =>
      o.campo === campo ? { campo: o.campo, asc: !o.asc } : { campo: campo as Campo, asc: true },
    );
  }

  const saldoFiltrado = filas.reduce((s, f) => s + f.c.saldo, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Cartera total" valor={pesos(totalColocado())} nota={`${CREDITOS.length} contratos`} />
        <Dato etiqueta="Tasa promedio" valor={pct(tasaActivaPromedio())} />
        <Dato etiqueta="Interés mensual" valor={pesos(interesCobradoMensual())} />
        <Dato
          etiqueta="Cartera con atraso"
          valor={pesos(atrasado)}
          nota={`${pct(atrasado / totalColocado(), 1)} del total`}
        />
      </div>

      <Tarjeta titulo="Semáforo" descripcion="Días de atraso sobre el saldo insoluto">
        <div className="grid gap-3 sm:grid-cols-4">
          {buckets.map((b) => (
            <div key={b.bucket} className="min-w-0 rounded-lg bg-[var(--plane)] p-3">
              <Insignia estado={b.estado}>{b.bucket}</Insignia>
              <p className="mt-2 truncate text-lg font-semibold text-ink">{pesos(b.monto)}</p>
              <p className="text-xs text-muted">
                {b.contratos} {b.contratos === 1 ? "contrato" : "contratos"} ·{" "}
                {pct(b.monto / totalColocado(), 1)}
              </p>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente…" />
          <p className="text-xs text-muted">
            {filas.length} de {CREDITOS.length} · {pesos(saldoFiltrado)}
          </p>
        </div>

        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-xs text-muted">
                <Th campo="cliente" orden={orden} onOrdenar={ordenar}>Cliente</Th>
                <Th campo="producto" orden={orden} onOrdenar={ordenar}>Producto</Th>
                <Th campo="saldo" orden={orden} onOrdenar={ordenar} alinear="right">Saldo</Th>
                <Th campo="tasa" orden={orden} onOrdenar={ordenar} alinear="right">Tasa</Th>
                <Th campo="cuota" orden={orden} onOrdenar={ordenar} alinear="right">Mensualidad</Th>
                <Th campo="plazo" orden={orden} onOrdenar={ordenar} alinear="right">Plazo</Th>
                <Th campo="mora" orden={orden} onOrdenar={ordenar} alinear="right">Moratorios</Th>
                <Th campo="socio" orden={orden} onOrdenar={ordenar}>Originado por</Th>
                <Th campo="atraso" orden={orden} onOrdenar={ordenar}>Estado</Th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ c, cuota, socio, mora }) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--plane)]"
                >
                  <td className="px-2 py-2.5">
                    <Link href={`/cartera/${c.id}`} className="text-ink hover:underline">
                      {c.cliente}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5">
                    <Etiqueta>{c.tipoCredito}</Etiqueta>
                  </td>
                  <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(c.saldo)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">{pct(c.tasaAnual)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(cuota)}</td>
                  <td className="px-2 py-2.5 text-right tabular text-muted">{c.mesesRestantes} m</td>
                  <td className="px-2 py-2.5 text-right tabular">
                    {mora ? (
                      <span style={{ color: "var(--critical)" }}>{pesos(mora)}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-xs">
                    {socio ? (
                      <span className="text-ink-2">
                        {socio.nombre.split(" ").slice(0, 2).join(" ")}
                      </span>
                    ) : (
                      <span className="text-muted">Operación</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5">
                    <Insignia estado={ESTADO_BUCKET[bucket(c)]}>
                      {c.diasAtraso === 0 ? "Al corriente" : `${c.diasAtraso} días`}
                    </Insignia>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filas.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nadie coincide con «{busqueda}».</p>
        ) : null}

        <p className="mt-4 text-xs text-muted">
          Los moratorios se calculan al doble de la tasa ordinaria de cada contrato, corridos por
          días sobre la mensualidad vencida.
        </p>
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
