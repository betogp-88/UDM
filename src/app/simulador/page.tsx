"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Tarjeta } from "@/components/ui";
import { CampoMonto, CampoTasa, SelectorPlazo } from "@/components/campos";
import { pesos, pesosCent, pct, fecha } from "@/lib/formato";
import { tablaInversion, tablaCredito, tasaRetencion } from "@/lib/demo/calculos";

type Modo = "inversion" | "credito";

export default function Simulador() {
  const [modo, setModo] = useState<Modo>("inversion");
  const [monto, setMonto] = useState(1_000_000);
  const [tasa, setTasa] = useState(12);
  const [plazo, setPlazo] = useState(12);
  const [gracia, setGracia] = useState(0);
  const [hoja, setHoja] = useState(false);

  const inicio = useMemo(() => new Date(), []);

  const flujosInv = tablaInversion({
    capital: monto,
    tasaAnual: tasa / 100,
    plazoMeses: plazo,
    fechaInicio: inicio,
  });
  const flujosCred = tablaCredito({
    monto,
    tasaAnual: tasa / 100,
    plazoMeses: plazo,
    mesesGracia: gracia,
    fechaInicio: inicio,
  });

  if (hoja) {
    return (
      <Cotizacion
        modo={modo}
        monto={monto}
        tasa={tasa}
        plazo={plazo}
        gracia={gracia}
        inicio={inicio}
        onVolver={() => setHoja(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Simulador</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Cotiza antes de cerrar. Al firmar, esta misma tabla se convierte en el calendario de
          pagos del contrato — los números no cambian.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-[var(--hair)]">
          {(["inversion", "credito"] as Modo[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setModo(m);
                setTasa(m === "inversion" ? 12 : 24);
              }}
              className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
                modo === m ? "bg-brand text-[var(--brand-ink)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {m === "inversion" ? "Inversionista" : "Crédito"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setHoja(true)}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
        >
          Generar PDF
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Parámetros" className="lg:col-span-2">
          <div className="space-y-5">
            <CampoMonto
              etiqueta={modo === "inversion" ? "Monto de inversión" : "Monto del crédito"}
              valor={monto}
              onChange={setMonto}
            />
            <CampoTasa
              etiqueta={modo === "inversion" ? "Tasa de rendimiento" : "Tasa de interés"}
              valor={tasa}
              onChange={setTasa}
              ayuda={modo === "credito" ? `Moratoria: ${pct((tasa / 100) * 2)}` : undefined}
            />
            <SelectorPlazo valor={plazo} onChange={setPlazo} />
            {modo === "credito" ? (
              <SelectorPlazo
                etiqueta="Gracia de capital"
                valor={gracia}
                opciones={[0, 3, 6, 9, 12]}
                onChange={setGracia}
              />
            ) : null}
          </div>
        </Tarjeta>

        <div className="min-w-0 space-y-4 lg:col-span-3">
          {modo === "inversion" ? (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Resumen etiqueta="Rendimiento mensual" valor={pesosCent(flujosInv[0].neto)} />
                <Resumen
                  etiqueta="Rendimiento neto total"
                  valor={pesos(flujosInv.reduce((s, f) => s + f.neto, 0))}
                />
                <Resumen
                  etiqueta="Retención total"
                  valor={pesos(flujosInv.reduce((s, f) => s + f.retencion, 0))}
                />
              </div>
              <Tarjeta titulo="Calendario de pagos">
                <p className="mb-3 text-xs text-muted">
                  Retención sobre capital a {pct(tasaRetencion(inicio.getFullYear()), 2)} anual.
                  Cambia sola en los pagos que caen en el siguiente año.
                </p>
                <TablaInversion flujos={flujosInv} />
              </Tarjeta>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Resumen etiqueta="Mensualidad" valor={pesosCent(flujosCred.at(-1)!.pago)} />
                <Resumen
                  etiqueta="Interés total"
                  valor={pesos(flujosCred.reduce((s, f) => s + f.interes, 0))}
                />
                <Resumen etiqueta="Tasa moratoria" valor={pct((tasa / 100) * 2)} />
              </div>
              <Tarjeta titulo="Tabla de amortización">
                {gracia > 0 ? (
                  <p className="mb-3 text-xs text-muted">
                    Los primeros {gracia} meses solo pagan intereses. El capital se amortiza en los{" "}
                    {plazo - gracia} restantes, por eso la mensualidad sube después.
                  </p>
                ) : null}
                <TablaCredito flujos={flujosCred} />
              </Tarjeta>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Hoja membretada, lista para imprimir o guardar como PDF. */
function Cotizacion({
  modo,
  monto,
  tasa,
  plazo,
  gracia,
  inicio,
  onVolver,
}: {
  modo: Modo;
  monto: number;
  tasa: number;
  plazo: number;
  gracia: number;
  inicio: Date;
  onVolver: () => void;
}) {
  const esInversion = modo === "inversion";
  const flujosInv = tablaInversion({
    capital: monto,
    tasaAnual: tasa / 100,
    plazoMeses: plazo,
    fechaInicio: inicio,
  });
  const flujosCred = tablaCredito({
    monto,
    tasaAnual: tasa / 100,
    plazoMeses: plazo,
    mesesGracia: gracia,
    fechaInicio: inicio,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onVolver}
          className="text-xs text-muted hover:text-ink"
        >
          ← Volver al simulador
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-[var(--brand-ink)]"
        >
          Imprimir o guardar PDF
        </button>
      </div>

      <article className="rounded-xl bg-surface p-5 ring-1 ring-[var(--hair)] sm:p-8 print:ring-0">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--hair)] pb-5">
          <Image src="/logo.png" alt="Un Dígito Más" width={907} height={504} className="h-11 w-auto" />
          <div className="text-right">
            <p className="text-sm font-semibold text-ink">
              {esInversion ? "Propuesta de inversión" : "Cotización de crédito"}
            </p>
            <p className="text-xs text-muted">{fecha(inicio)}</p>
            <p className="text-xs text-muted">Un Dígito Más SOFOM</p>
          </div>
        </header>

        <section className="grid gap-3 border-b border-[var(--hair)] py-5 sm:grid-cols-3">
          <Cifra etiqueta={esInversion ? "Monto de inversión" : "Monto del crédito"} valor={pesos(monto)} />
          <Cifra etiqueta={esInversion ? "Tasa de rendimiento" : "Tasa de interés"} valor={pct(tasa / 100)} />
          <Cifra etiqueta="Plazo" valor={`${plazo} meses`} />
        </section>

        <section className="grid gap-3 border-b border-[var(--hair)] py-5 sm:grid-cols-3">
          {esInversion ? (
            <>
              <Cifra etiqueta="Rendimiento neto mensual" valor={pesosCent(flujosInv[0].neto)} destacado />
              <Cifra
                etiqueta="Rendimiento neto total"
                valor={pesos(flujosInv.reduce((s, f) => s + f.neto, 0))}
              />
              <Cifra etiqueta="Capital devuelto" valor={`${pesos(monto)} al vencimiento`} />
            </>
          ) : (
            <>
              <Cifra etiqueta="Mensualidad" valor={pesosCent(flujosCred.at(-1)!.pago)} destacado />
              <Cifra
                etiqueta="Interés total"
                valor={pesos(flujosCred.reduce((s, f) => s + f.interes, 0))}
              />
              <Cifra etiqueta="Tasa moratoria" valor={pct((tasa / 100) * 2)} />
            </>
          )}
        </section>

        <section className="py-5">
          <h3 className="mb-3 text-sm font-semibold text-ink">
            {esInversion ? "Calendario de pagos" : "Tabla de amortización"}
          </h3>
          {esInversion ? <TablaInversion flujos={flujosInv} alto={false} /> : <TablaCredito flujos={flujosCred} alto={false} />}
        </section>

        <footer className="border-t border-[var(--hair)] pt-4 text-[11px] leading-relaxed text-muted">
          {esInversion
            ? "La retención de ISR se calcula sobre el capital a la tasa anual que fija la Ley de Ingresos del ejercicio, no sobre el rendimiento; por eso cambia al cruzar el año. "
            : "La tasa moratoria es el doble de la ordinaria y corre por días sobre la mensualidad vencida. "}
          Cotización informativa, sujeta a la integración del expediente y a aprobación. Documento de
          demostración con datos ficticios.
        </footer>
      </article>
    </div>
  );
}

function TablaInversion({
  flujos,
  alto = true,
}: {
  flujos: ReturnType<typeof tablaInversion>;
  alto?: boolean;
}) {
  return (
    <div className={`-mx-4 overflow-auto px-4 sm:mx-0 sm:px-0 ${alto ? "max-h-[420px]" : ""}`}>
      <table className="w-full min-w-[440px] text-sm">
        <thead className={alto ? "sticky top-0 bg-surface" : ""}>
          <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
            <th className="py-2 font-medium">#</th>
            <th className="py-2 font-medium">Fecha</th>
            <th className="py-2 text-right font-medium">Rendimiento</th>
            <th className="py-2 text-right font-medium">Retención</th>
            <th className="py-2 text-right font-medium">Capital</th>
            <th className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="tabular text-ink-2">
          {flujos.map((f) => (
            <tr key={f.n} className="border-b border-[var(--hair)] last:border-0">
              <td className="py-2">{f.n}</td>
              <td className="py-2">{fecha(f.fecha)}</td>
              <td className="py-2 text-right">{pesosCent(f.interes)}</td>
              <td className="py-2 text-right">{pesosCent(-f.retencion)}</td>
              <td className="py-2 text-right">{f.capital ? pesos(f.capital) : "—"}</td>
              <td className="py-2 text-right font-medium text-ink">{pesosCent(f.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaCredito({
  flujos,
  alto = true,
}: {
  flujos: ReturnType<typeof tablaCredito>;
  alto?: boolean;
}) {
  return (
    <div className={`-mx-4 overflow-auto px-4 sm:mx-0 sm:px-0 ${alto ? "max-h-[420px]" : ""}`}>
      <table className="w-full min-w-[460px] text-sm">
        <thead className={alto ? "sticky top-0 bg-surface" : ""}>
          <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
            <th className="py-2 font-medium">#</th>
            <th className="py-2 font-medium">Fecha</th>
            <th className="py-2 text-right font-medium">Pago</th>
            <th className="py-2 text-right font-medium">Interés</th>
            <th className="py-2 text-right font-medium">Capital</th>
            <th className="py-2 text-right font-medium">Saldo</th>
          </tr>
        </thead>
        <tbody className="tabular text-ink-2">
          {flujos.map((f) => (
            <tr
              key={f.n}
              className={`border-b border-[var(--hair)] last:border-0 ${f.enGracia ? "bg-[var(--plane)]" : ""}`}
            >
              <td className="py-2">{f.n}</td>
              <td className="py-2">{fecha(f.fecha)}</td>
              <td className="py-2 text-right font-medium text-ink">{pesosCent(f.pago)}</td>
              <td className="py-2 text-right">{pesosCent(f.interes)}</td>
              <td className="py-2 text-right">{f.capital ? pesosCent(f.capital) : "—"}</td>
              <td className="py-2 text-right">{pesos(f.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Resumen({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 truncate text-lg font-semibold text-ink sm:text-xl">{valor}</p>
    </div>
  );
}

function Cifra({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wider text-muted">{etiqueta}</p>
      <p className={`mt-1 text-lg font-semibold ${destacado ? "text-ink" : "text-ink-2"}`}>{valor}</p>
    </div>
  );
}
