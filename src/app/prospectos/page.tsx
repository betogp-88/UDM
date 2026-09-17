"use client";

import Link from "next/link";
import { useState } from "react";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { Embudo } from "@/components/Embudo";
import { pesos, pct } from "@/lib/formato";
import {
  PROSPECTOS,
  SOCIOS,
  ETAPAS,
  embudo,
  pipelinePonderado,
  type Prospecto,
} from "@/lib/demo/datos";

type FiltroTipo = "Todos" | "Inversionista" | "Crédito";

export default function Prospectos() {
  const [socioId, setSocioId] = useState("todos");
  const [tipo, setTipo] = useState<FiltroTipo>("Todos");

  const filtrados = PROSPECTOS.filter(
    (p) =>
      (socioId === "todos" || p.socioId === socioId) && (tipo === "Todos" || p.tipo === tipo),
  );

  const total = filtrados.reduce((s, p) => s + p.monto, 0);
  const ponderado = pipelinePonderado(filtrados);
  const porCerrar = filtrados.filter((p) => p.etapa === "Documentación");

  const orden = [...filtrados].sort(
    (a, b) =>
      ETAPAS.indexOf(b.etapa) - ETAPAS.indexOf(a.etapa) ||
      a.diasAlProximoContacto - b.diasAlProximoContacto,
  );

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Prospectos</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Lo que cada socio trae en camino, de inversión y de crédito.
        </p>
      </header>

      {/* Filtros en una sola fila, arriba del contenido */}
      <div className="flex flex-wrap gap-2">
        <select
          value={socioId}
          onChange={(e) => setSocioId(e.target.value)}
          className="rounded-lg bg-surface px-3 py-2 text-sm text-ink ring-1 ring-[var(--hair)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
        >
          <option value="todos">Todos los socios</option>
          {SOCIOS.filter((s) => !s.enTesoreria).map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-[var(--hair)]">
          {(["Todos", "Inversionista", "Crédito"] as FiltroTipo[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                tipo === t ? "bg-brand font-medium text-[var(--brand-ink)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Dato etiqueta="En el embudo" valor={pesos(total)} nota={`${filtrados.length} prospectos`} />
        <Dato
          etiqueta="Ponderado por probabilidad"
          valor={pesos(ponderado)}
          nota="Lo que razonablemente se cierra"
        />
        <Dato
          etiqueta="A punto de cerrar"
          valor={pesos(porCerrar.reduce((s, p) => s + p.monto, 0))}
          nota={`${porCerrar.length} en documentación`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Embudo" descripcion="Por etapa" className="lg:col-span-2">
          <Embudo etapas={embudo(filtrados)} />
        </Tarjeta>

        <Tarjeta
          titulo="Seguimiento"
          descripcion="Los más avanzados primero, y dentro de cada etapa los más urgentes"
          className="lg:col-span-3"
        >
          {orden.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Sin prospectos con este filtro.</p>
          ) : (
            <ul className="divide-y divide-[var(--hair)]">
              {orden.map((p) => (
                <Renglon key={p.id} p={p} />
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>

      <Tarjeta titulo="Pipeline por socio">
        <ul className="space-y-3">
          {SOCIOS.filter((s) => !s.enTesoreria).map((s) => {
            const suyos = PROSPECTOS.filter((p) => p.socioId === s.id);
            const suTotal = suyos.reduce((a, p) => a + p.monto, 0);
            const maximo = Math.max(
              ...SOCIOS.filter((x) => !x.enTesoreria).map((x) =>
                PROSPECTOS.filter((p) => p.socioId === x.id).reduce((a, p) => a + p.monto, 0),
              ),
            );
            return (
              <li key={s.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <Link href={`/socios/${s.id}`} className="text-sm text-ink hover:underline">
                    {s.nombre}
                  </Link>
                  <span className="shrink-0 tabular text-sm text-ink-2">
                    {pesos(suTotal)}
                    <span className="ml-2 text-xs text-muted">{suyos.length}</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--plane)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(suTotal / maximo) * 100}%`, background: "var(--s1)" }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </Tarjeta>
    </div>
  );
}

function Renglon({ p }: { p: Prospecto }) {
  const socio = SOCIOS.find((s) => s.id === p.socioId);
  const urgente = p.diasAlProximoContacto <= 3;

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink">{p.nombre}</span>
          <Etiqueta>{p.tipo}</Etiqueta>
        </span>
        <span className="shrink-0 tabular text-sm text-ink">
          {pesos(p.monto)}
          <span className="ml-2 text-xs text-muted">{pct(p.probabilidad, 0)}</span>
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Insignia estado={p.etapa === "Documentación" ? "good" : "warning"}>{p.etapa}</Insignia>
        <span className="text-xs text-muted">{socio?.nombre}</span>
        <span className={`text-xs ${urgente ? "text-[var(--critical)]" : "text-muted"}`}>
          {urgente ? "Contactar en " : "Siguiente contacto en "}
          {p.diasAlProximoContacto} {p.diasAlProximoContacto === 1 ? "día" : "días"}
        </span>
      </div>

      <p className="mt-1 text-xs text-muted">{p.nota}</p>
    </li>
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
