"use client";

import Link from "next/link";
import { useState } from "react";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { Embudo } from "@/components/Embudo";
import {
  Buscador,
  CampoMonto,
  CampoTasa,
  CampoTexto,
  SelectorPlazo,
} from "@/components/campos";
import { pesos, pct, mesLargo, sumarMeses } from "@/lib/formato";
import {
  PROSPECTOS,
  SOCIOS,
  TIPOS_PROSPECTO,
  ETAPAS,
  embudo,
  pipelinePonderado,
  HOY,
  type Prospecto,
  type TipoProspecto,
  type TipoPersona,
  type Etapa,
} from "@/lib/demo/datos";

export default function CRM() {
  const [tipo, setTipo] = useState<TipoProspecto | "Todos">("Todos");
  const [socioId, setSocioId] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState(false);

  const filtrados = PROSPECTOS.filter(
    (p) =>
      (tipo === "Todos" || p.tipo === tipo) &&
      (socioId === "todos" || p.socioId === socioId) &&
      p.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  const total = filtrados.reduce((s, p) => s + p.monto, 0);
  const ponderado = pipelinePonderado(filtrados);
  const enDocumentacion = filtrados.filter((p) => p.etapa === "Documentación");

  const orden = [...filtrados].sort(
    (a, b) =>
      ETAPAS.indexOf(b.etapa) - ETAPAS.indexOf(a.etapa) ||
      a.diasAlProximoContacto - b.diasAlProximoContacto,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-ink">CRM</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-2">
            Aquí nace todo. Inversionistas, clientes y socios no se crean directamente: entran como
            prospecto y se promueven cuando el expediente está completo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
        >
          {abierto ? "Cerrar" : "+ Nuevo prospecto"}
        </button>
      </div>

      {abierto ? <NuevoProspecto onCerrar={() => setAbierto(false)} /> : null}

      <div className="flex flex-wrap gap-2">
        <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-[var(--hair)]">
          {(["Todos", ...TIPOS_PROSPECTO] as const).map((t) => (
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

        <Buscador valor={busqueda} onChange={setBusqueda} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Dato etiqueta="En el embudo" valor={pesos(total)} nota={`${filtrados.length} prospectos`} />
        <Dato
          etiqueta="Ponderado por probabilidad"
          valor={pesos(ponderado)}
          nota="Lo que razonablemente se cierra"
        />
        <Dato
          etiqueta="Listos para promover"
          valor={pesos(enDocumentacion.reduce((s, p) => s + p.monto, 0))}
          nota={`${enDocumentacion.length} en documentación`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Embudo" descripcion="Por etapa" className="lg:col-span-2">
          <Embudo etapas={embudo(filtrados)} />
        </Tarjeta>

        <Tarjeta titulo="Seguimiento" className="lg:col-span-3">
          {orden.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Sin prospectos con este filtro.</p>
          ) : (
            <ul className="divide-y divide-[var(--hair)]">
              {orden.map((p) => (
                <Fila key={p.id} p={p} />
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}

function Fila({ p }: { p: Prospecto }) {
  const socio = SOCIOS.find((s) => s.id === p.socioId);
  const urgente = p.diasAlProximoContacto <= 3;
  const promovible = p.etapa === "Documentación";

  return (
    <li className="py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink">{p.nombre}</span>
          <Etiqueta>{p.tipo}</Etiqueta>
          <Etiqueta>{p.tipoPersona}</Etiqueta>
        </span>
        <span className="shrink-0 tabular text-sm text-ink">
          {pesos(p.monto)}
          <span className="ml-2 text-xs text-muted">{pct(p.probabilidad, 0)}</span>
        </span>
      </div>

      {p.representante ? (
        <p className="mt-0.5 text-xs text-muted">Rep. legal: {p.representante}</p>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Insignia estado={promovible ? "good" : "warning"}>{p.etapa}</Insignia>
        <span className="text-xs text-muted">{socio?.nombre ?? "Sin socio"}</span>
        <span className={`text-xs ${urgente ? "text-[var(--critical)]" : "text-muted"}`}>
          Contactar en {p.diasAlProximoContacto}{" "}
          {p.diasAlProximoContacto === 1 ? "día" : "días"}
        </span>
        {p.tipo === "Inversión" && p.tasaEstimada ? (
          <span className="text-xs text-muted">
            {pct(p.tasaEstimada)} · {p.plazoEstimado} meses · entraría en{" "}
            <span className="capitalize">{mesLargo(sumarMeses(HOY, p.mesesACierre ?? 0))}</span>
          </span>
        ) : null}
        {p.tipo === "Socio" && p.porcentaje ? (
          <span className="text-xs text-muted">{pct(p.porcentaje, 0)} del capital</span>
        ) : null}
      </div>

      <p className="mt-1 text-xs text-muted">{p.nota}</p>

      {promovible ? (
        <Link
          href={`/promover?prospecto=${p.id}`}
          className="mt-2 inline-block rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-[var(--brand-ink)]"
        >
          Promover a {p.tipo === "Inversión" ? "inversionista" : p.tipo === "Crédito" ? "cliente" : "socio"}
        </Link>
      ) : null}
    </li>
  );
}

function NuevoProspecto({ onCerrar }: { onCerrar: () => void }) {
  const [tipo, setTipo] = useState<TipoProspecto>("Inversión");
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>("Física");
  const [nombre, setNombre] = useState("");
  const [representante, setRepresentante] = useState("");
  const [monto, setMonto] = useState(1_000_000);
  const [tasa, setTasa] = useState(12);
  const [plazo, setPlazo] = useState(12);
  const [socioId, setSocioId] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("Contacto inicial");
  const [nota, setNota] = useState("");

  const listo = nombre.trim().length > 2 && (tipoPersona === "Física" || representante.trim().length > 2);

  return (
    <Tarjeta titulo="Nuevo prospecto" descripcion="Sin expediente: eso se pide al promover">
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs text-ink-2">Tipo de prospecto</span>
            <Opciones valor={tipo} opciones={TIPOS_PROSPECTO} onChange={setTipo} />
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-ink-2">Tipo de persona</span>
            <Opciones
              valor={tipoPersona}
              opciones={["Física", "Moral"] as TipoPersona[]}
              onChange={setTipoPersona}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            etiqueta={tipoPersona === "Física" ? "Nombre completo" : "Razón social"}
            valor={nombre}
            onChange={setNombre}
            placeholder={
              tipoPersona === "Física"
                ? "Ej. María Fernanda Salazar Ibarra"
                : "Ej. Comercializadora del Centro SA de CV"
            }
          />
          {tipoPersona === "Moral" ? (
            <CampoTexto
              etiqueta="Representante legal"
              valor={representante}
              onChange={setRepresentante}
              placeholder="Ej. Lic. Andrés Peña Rojas"
            />
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CampoMonto
            etiqueta={tipo === "Socio" ? "Valor de la participación" : "Monto estimado"}
            valor={monto}
            onChange={setMonto}
          />
          {tipo === "Inversión" ? (
            <CampoTasa etiqueta="Tasa apalabrada" valor={tasa} onChange={setTasa} />
          ) : null}
        </div>

        {tipo === "Inversión" ? <SelectorPlazo valor={plazo} onChange={setPlazo} /> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-xs text-ink-2">¿Quién lo trae?</span>
            <select
              value={socioId}
              onChange={(e) => setSocioId(e.target.value)}
              className="w-full rounded-lg bg-[var(--plane)] px-3 py-2 text-sm text-ink ring-1 ring-[var(--hair)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              <option value="">Llegó directo</option>
              {SOCIOS.filter((s) => !s.enTesoreria).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-1.5 block text-xs text-ink-2">Etapa</span>
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value as Etapa)}
              className="w-full rounded-lg bg-[var(--plane)] px-3 py-2 text-sm text-ink ring-1 ring-[var(--hair)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
            >
              {ETAPAS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        <CampoTexto etiqueta="Nota" valor={nota} onChange={setNota} placeholder="Contexto, siguiente paso…" />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hair)] pt-4">
          <p className="text-xs text-muted">En el prototipo no se guarda nada.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg px-4 py-2 text-sm text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!listo}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Guardar prospecto
            </button>
          </div>
        </div>
      </div>
    </Tarjeta>
  );
}

function Opciones<T extends string>({
  valor,
  opciones,
  onChange,
}: {
  valor: T;
  opciones: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg bg-[var(--plane)] p-1 ring-1 ring-[var(--hair)]">
      {opciones.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            valor === o ? "bg-brand font-medium text-[var(--brand-ink)]" : "text-ink-2 hover:text-ink"
          }`}
        >
          {o}
        </button>
      ))}
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
