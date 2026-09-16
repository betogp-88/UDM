"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Tarjeta, Insignia } from "@/components/ui";
import { pesos, pesosCent, pct, fecha } from "@/lib/formato";
import { tablaInversion, tasaRetencion } from "@/lib/demo/calculos";
import { SOCIOS, REQUISITOS_FISICA, REQUISITOS_MORAL } from "@/lib/demo/datos";

const PASOS = ["Datos", "Simulación", "Expediente", "Confirmar"];

export default function Alta() {
  const [paso, setPaso] = useState(0);

  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<"Física" | "Moral">("Física");
  const [empresa, setEmpresa] = useState<"SOFOM" | "Arrendadora">("SOFOM");
  const [socioId, setSocioId] = useState("");

  const [monto, setMonto] = useState(1_500_000);
  const [tasa, setTasa] = useState(13);
  const [plazo, setPlazo] = useState(18);

  const requisitos = tipo === "Física" ? REQUISITOS_FISICA : REQUISITOS_MORAL;
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});

  const inicio = useMemo(() => new Date(), []);
  const flujos = tablaInversion({
    capital: monto,
    tasaAnual: tasa / 100,
    plazoMeses: plazo,
    fechaInicio: inicio,
  });

  const faltantes = requisitos.filter((r) => !marcados[r]);
  const expedienteCompleto = faltantes.length === 0;
  const datosListos = nombre.trim().length > 2;

  const puedeAvanzar = paso === 0 ? datosListos : paso === 2 ? expedienteCompleto : true;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Alta de inversionista</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          El expediente es bloqueante: sin los documentos completos, el sistema no permite registrar
          el ingreso de los recursos.
        </p>
      </header>

      {/* Indicador de pasos */}
      <ol className="flex flex-wrap gap-x-2 gap-y-2 text-xs">
        {PASOS.map((p, k) => (
          <li key={p} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${
                k < paso
                  ? "bg-[var(--good)] text-white"
                  : k === paso
                    ? "bg-brand text-[var(--brand-ink)]"
                    : "bg-[var(--plane)] text-muted ring-1 ring-[var(--hair)]"
              }`}
            >
              {k < paso ? "✓" : k + 1}
            </span>
            <span className={k === paso ? "font-medium text-ink" : "text-muted"}>{p}</span>
            {k < PASOS.length - 1 ? <span className="mx-1 text-[var(--grid)]">—</span> : null}
          </li>
        ))}
      </ol>

      {paso === 0 ? (
        <Tarjeta titulo="Datos del inversionista">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Nombre o razón social">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Comercializadora del Centro SA de CV"
                className="w-full rounded-lg bg-[var(--plane)] px-3 py-2 text-sm text-ink ring-1 ring-[var(--hair)] outline-none focus:ring-2 focus:ring-[var(--brand)]"
              />
            </Campo>
            <Campo etiqueta="Tipo de persona">
              <Opciones
                valor={tipo}
                opciones={["Física", "Moral"] as const}
                onChange={(v) => {
                  setTipo(v);
                  setMarcados({});
                }}
              />
            </Campo>
            <Campo etiqueta="Empresa">
              <Opciones
                valor={empresa}
                opciones={["SOFOM", "Arrendadora"] as const}
                onChange={setEmpresa}
              />
            </Campo>
            <Campo etiqueta="¿Quién lo trajo?">
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
            </Campo>
          </div>
        </Tarjeta>
      ) : null}

      {paso === 1 ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <Tarjeta titulo="Condiciones" className="lg:col-span-2">
            <div className="space-y-5">
              <Deslizador etiqueta="Monto" valor={monto} min={100_000} max={10_000_000} paso={50_000} formato={pesos} onChange={setMonto} />
              <Deslizador etiqueta="Tasa de rendimiento" valor={tasa} min={10} max={18} paso={0.5} formato={(v) => `${v.toFixed(1)}%`} onChange={setTasa} />
              <Deslizador etiqueta="Plazo" valor={plazo} min={6} max={48} paso={6} formato={(v) => `${v} meses`} onChange={setPlazo} />
            </div>
          </Tarjeta>
          <div className="min-w-0 space-y-4 lg:col-span-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Resumen etiqueta="Rendimiento mensual" valor={pesosCent(flujos[0].neto)} />
              <Resumen etiqueta="Total neto del plazo" valor={pesos(flujos.reduce((s, f) => s + f.neto, 0))} />
              <Resumen etiqueta="Vence" valor={fecha(flujos.at(-1)!.fecha)} />
            </div>
            <Tarjeta titulo="Primeros pagos">
              <p className="mb-3 text-xs text-muted">
                Retención sobre capital a {pct(tasaRetencion(inicio.getFullYear()), 2)} anual.
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                    <th className="py-2 font-medium">Fecha</th>
                    <th className="py-2 text-right font-medium">Rendimiento</th>
                    <th className="py-2 text-right font-medium">Retención</th>
                    <th className="py-2 text-right font-medium">Neto</th>
                  </tr>
                </thead>
                <tbody className="tabular text-ink-2">
                  {flujos.slice(0, 4).map((f) => (
                    <tr key={f.n} className="border-b border-[var(--hair)] last:border-0">
                      <td className="py-2">{fecha(f.fecha)}</td>
                      <td className="py-2 text-right">{pesosCent(f.interes)}</td>
                      <td className="py-2 text-right">{pesosCent(-f.retencion)}</td>
                      <td className="py-2 text-right font-medium text-ink">{pesosCent(f.neto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Tarjeta>
          </div>
        </div>
      ) : null}

      {paso === 2 ? (
        <Tarjeta
          titulo={`Expediente · persona ${tipo.toLowerCase()}`}
          descripcion={`${requisitos.length - faltantes.length} de ${requisitos.length} documentos`}
        >
          <ul className="space-y-1">
            {requisitos.map((r) => (
              <li key={r}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-[var(--plane)]">
                  <input
                    type="checkbox"
                    checked={!!marcados[r]}
                    onChange={(e) => setMarcados((m) => ({ ...m, [r]: e.target.checked }))}
                    className="h-4 w-4 accent-[var(--brand)]"
                  />
                  <span className={marcados[r] ? "text-muted line-through" : "text-ink"}>{r}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-[var(--hair)] pt-3">
            {expedienteCompleto ? (
              <Insignia estado="good">Expediente completo — se puede recibir el dinero</Insignia>
            ) : (
              <Insignia estado="critical">
                Faltan {faltantes.length} {faltantes.length === 1 ? "documento" : "documentos"} — no
                se puede recibir el dinero
              </Insignia>
            )}
          </div>
        </Tarjeta>
      ) : null}

      {paso === 3 ? (
        <Tarjeta titulo="Confirmar el ingreso de recursos">
          <dl className="space-y-2.5 text-sm">
            <Renglon k="Inversionista" v={nombre} />
            <Renglon k="Tipo" v={`Persona ${tipo.toLowerCase()}`} />
            <Renglon k="Empresa" v={empresa} />
            <Renglon
              k="Traído por"
              v={SOCIOS.find((s) => s.id === socioId)?.nombre ?? "Llegó directo"}
            />
            <Renglon k="Monto" v={pesos(monto)} />
            <Renglon k="Tasa" v={pct(tasa / 100)} />
            <Renglon k="Plazo" v={`${plazo} meses`} />
            <Renglon k="Vencimiento" v={fecha(flujos.at(-1)!.fecha)} />
            <Renglon k="Rendimiento neto mensual" v={pesosCent(flujos[0].neto)} destacado />
          </dl>

          <div className="mt-5 rounded-lg bg-[var(--plane)] p-4">
            <Insignia estado="good">Expediente completo</Insignia>
            <p className="mt-2 text-xs text-muted">
              Al confirmar se genera el contrato, su tabla de pagos y el movimiento de entrada de
              los recursos. En el prototipo no se guarda nada.
            </p>
            <button
              type="button"
              className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
            >
              Registrar ingreso de {pesos(monto)}
            </button>
          </div>
        </Tarjeta>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {paso > 0 ? (
          <button
            type="button"
            onClick={() => setPaso((p) => p - 1)}
            className="rounded-lg px-4 py-2 text-sm text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
          >
            Atrás
          </button>
        ) : (
          <Link
            href="/inversionistas"
            className="rounded-lg px-4 py-2 text-sm text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
          >
            Cancelar
          </Link>
        )}

        {paso < PASOS.length - 1 ? (
          <button
            type="button"
            disabled={!puedeAvanzar}
            onClick={() => setPaso((p) => p + 1)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {paso === 2 && !expedienteCompleto ? "Expediente incompleto" : "Continuar"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-ink-2">{etiqueta}</span>
      {children}
    </label>
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
    <div className="inline-flex rounded-lg bg-[var(--plane)] p-1 ring-1 ring-[var(--hair)]">
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

function Deslizador({
  etiqueta,
  valor,
  min,
  max,
  paso,
  formato,
  onChange,
}: {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  formato: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-sm text-ink-2">{etiqueta}</span>
        <span className="tabular text-sm font-semibold text-ink">{formato(valor)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--brand)]"
      />
    </label>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 truncate text-lg font-semibold text-ink">{valor}</p>
    </div>
  );
}

function Renglon({ k, v, destacado }: { k: string; v: string; destacado?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-2">{k}</dt>
      <dd className={`shrink-0 tabular ${destacado ? "font-semibold text-ink" : "text-ink"}`}>
        {v || "—"}
      </dd>
    </div>
  );
}
