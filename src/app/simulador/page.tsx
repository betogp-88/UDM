"use client";

import { useMemo, useState } from "react";
import { Tarjeta } from "@/components/ui";
import { pesos, pesosCent, pct, fecha } from "@/lib/formato";
import { tablaInversion, tablaCredito, tasaRetencion } from "@/lib/demo/calculos";

type Modo = "inversion" | "credito";

export default function Simulador() {
  const [modo, setModo] = useState<Modo>("inversion");
  const [monto, setMonto] = useState(2_000_000);
  const [tasa, setTasa] = useState(18);
  const [plazo, setPlazo] = useState(18);
  const [gracia, setGracia] = useState(0);

  const inicio = useMemo(() => new Date(), []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Simulador</h2>
        <p className="mt-1 text-sm text-ink-2">
          Cotiza antes de cerrar. Al firmar, esta misma tabla se convierte en el calendario de
          pagos del contrato — los números no cambian.
        </p>
      </header>

      <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-[var(--hair)]">
        {(["inversion", "credito"] as Modo[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
              modo === m ? "bg-brand text-[var(--brand-ink)]" : "text-ink-2 hover:text-ink"
            }`}
          >
            {m === "inversion" ? "Inversionista" : "Crédito"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Parámetros" className="lg:col-span-2">
          <div className="space-y-5">
            <Campo
              etiqueta={modo === "inversion" ? "Monto de inversión" : "Monto del crédito"}
              valor={monto}
              min={100_000}
              max={10_000_000}
              paso={50_000}
              formato={pesos}
              onChange={setMonto}
            />
            <Campo
              etiqueta="Tasa anual"
              valor={tasa}
              min={modo === "inversion" ? 8 : 15}
              max={modo === "inversion" ? 28 : 45}
              paso={0.5}
              formato={(v) => `${v.toFixed(1)}%`}
              onChange={setTasa}
            />
            <Campo
              etiqueta="Plazo"
              valor={plazo}
              min={6}
              max={48}
              paso={6}
              formato={(v) => `${v} meses`}
              onChange={setPlazo}
            />
            {modo === "credito" ? (
              <Campo
                etiqueta="Gracia de capital"
                valor={gracia}
                min={0}
                max={12}
                paso={3}
                formato={(v) => (v === 0 ? "Sin gracia" : `${v} meses`)}
                onChange={setGracia}
              />
            ) : null}
          </div>
        </Tarjeta>

        <div className="lg:col-span-3">
          {modo === "inversion" ? (
            <ResultadoInversion monto={monto} tasa={tasa / 100} plazo={plazo} inicio={inicio} />
          ) : (
            <ResultadoCredito
              monto={monto}
              tasa={tasa / 100}
              plazo={plazo}
              gracia={gracia}
              inicio={inicio}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ResultadoInversion({
  monto,
  tasa,
  plazo,
  inicio,
}: {
  monto: number;
  tasa: number;
  plazo: number;
  inicio: Date;
}) {
  const flujos = tablaInversion({ capital: monto, tasaAnual: tasa, plazoMeses: plazo, fechaInicio: inicio });
  const interesTotal = flujos.reduce((s, f) => s + f.interes, 0);
  const retencionTotal = flujos.reduce((s, f) => s + f.retencion, 0);
  const netoTotal = interesTotal - retencionTotal;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Resumen etiqueta="Neto mensual" valor={pesosCent(flujos[0].neto)} />
        <Resumen etiqueta="Rendimiento neto total" valor={pesos(netoTotal)} />
        <Resumen etiqueta="Retención total" valor={pesos(retencionTotal)} />
      </div>

      <Tarjeta titulo="Calendario de pagos">
        <p className="mb-3 text-xs text-muted">
          Retención sobre capital a {pct(tasaRetencion(inicio.getFullYear()), 2)} anual. Cambia
          automáticamente en los pagos que caen en el siguiente año.
        </p>
        <div className="-mx-4 max-h-[420px] overflow-auto sm:mx-0">
          <table className="w-full min-w-[480px] text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">#</th>
                <th className="px-2 py-2 font-medium">Fecha</th>
                <th className="px-2 py-2 text-right font-medium">Interés</th>
                <th className="px-2 py-2 text-right font-medium">Retención</th>
                <th className="px-2 py-2 text-right font-medium">Capital</th>
                <th className="px-2 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="tabular text-ink-2">
              {flujos.map((f) => (
                <tr key={f.n} className="border-b border-[var(--hair)] last:border-0">
                  <td className="px-4 py-2 sm:px-2">{f.n}</td>
                  <td className="px-2 py-2">{fecha(f.fecha)}</td>
                  <td className="px-2 py-2 text-right">{pesosCent(f.interes)}</td>
                  <td className="px-2 py-2 text-right">{pesosCent(-f.retencion)}</td>
                  <td className="px-2 py-2 text-right">{f.capital ? pesos(f.capital) : "—"}</td>
                  <td className="px-2 py-2 text-right font-medium text-ink">{pesosCent(f.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}

function ResultadoCredito({
  monto,
  tasa,
  plazo,
  gracia,
  inicio,
}: {
  monto: number;
  tasa: number;
  plazo: number;
  gracia: number;
  inicio: Date;
}) {
  const flujos = tablaCredito({
    monto,
    tasaAnual: tasa,
    plazoMeses: plazo,
    mesesGracia: gracia,
    fechaInicio: inicio,
  });
  const interesTotal = flujos.reduce((s, f) => s + f.interes, 0);
  const cuota = flujos[flujos.length - 1].pago;
  const moratoria = tasa * 2;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Resumen etiqueta="Mensualidad" valor={pesosCent(cuota)} />
        <Resumen etiqueta="Interés total" valor={pesos(interesTotal)} />
        <Resumen etiqueta="Tasa moratoria" valor={pct(moratoria)} />
      </div>

      <Tarjeta titulo="Tabla de amortización">
        {gracia > 0 ? (
          <p className="mb-3 text-xs text-muted">
            Durante los primeros {gracia} meses solo se pagan intereses. El capital se amortiza en
            los {plazo - gracia} meses restantes, por eso la mensualidad sube después.
          </p>
        ) : null}
        <div className="-mx-4 max-h-[420px] overflow-auto sm:mx-0">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">#</th>
                <th className="px-2 py-2 font-medium">Fecha</th>
                <th className="px-2 py-2 text-right font-medium">Pago</th>
                <th className="px-2 py-2 text-right font-medium">Interés</th>
                <th className="px-2 py-2 text-right font-medium">Capital</th>
                <th className="px-2 py-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="tabular text-ink-2">
              {flujos.map((f) => (
                <tr
                  key={f.n}
                  className={`border-b border-[var(--hair)] last:border-0 ${
                    f.enGracia ? "bg-[var(--plane)]" : ""
                  }`}
                >
                  <td className="px-4 py-2 sm:px-2">{f.n}</td>
                  <td className="px-2 py-2">{fecha(f.fecha)}</td>
                  <td className="px-2 py-2 text-right font-medium text-ink">{pesosCent(f.pago)}</td>
                  <td className="px-2 py-2 text-right">{pesosCent(f.interes)}</td>
                  <td className="px-2 py-2 text-right">{f.capital ? pesosCent(f.capital) : "—"}</td>
                  <td className="px-2 py-2 text-right">{pesos(f.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 text-lg font-semibold text-ink sm:text-xl">{valor}</p>
    </div>
  );
}

function Campo({
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
