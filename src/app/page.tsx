import Link from "next/link";
import { Tarjeta, KPI, Insignia } from "@/components/ui";
import { GraficaCalce } from "@/components/GraficaCalce";
import { pesos, mdp, pct } from "@/lib/formato";
import {
  totalCaptado,
  totalColocado,
  tasaPasivaPromedio,
  tasaActivaPromedio,
  cascadaMargen,
  resumenBuckets,
  alertas,
  calceConProyeccion,
  concentracionCaptacion,
  concentracionCartera,
  UMBRAL_CONCENTRACION,
  INVERSIONISTAS,
  CREDITOS,
} from "@/lib/demo/datos";

export default function Panel() {
  const captado = totalCaptado();
  const colocado = totalColocado();
  const cascada = cascadaMargen();
  const neto = cascada[cascada.length - 1].monto;
  const spread = tasaActivaPromedio() - tasaPasivaPromedio();
  const buckets = resumenBuckets();
  const avisos = alertas();
  const datosCalce = calceConProyeccion(12).map((m) => ({
    fecha: m.fecha.toISOString(),
    entradas: m.entradas,
    salidas: m.salidas,
    neto: m.neto,
    proyectado: m.proyectado,
    netoConProyeccion: m.netoConProyeccion,
  }));
  const concentracion = concentracionCaptacion();
  const topConcentracion = concentracion[0];
  const topCartera = concentracionCartera()[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI
          etiqueta="Captado"
          valor={mdp(captado)}
          nota={`${INVERSIONISTAS.length} inversionistas · ${pct(tasaPasivaPromedio())} promedio`}
        />
        <KPI
          etiqueta="Colocado"
          valor={mdp(colocado)}
          nota={`${CREDITOS.length} contratos · ${pct(tasaActivaPromedio())} promedio`}
        />
        <KPI
          etiqueta="Spread promedio"
          valor={pct(spread)}
          nota="Activa menos pasiva, ponderadas"
        />
        <KPI
          etiqueta="Margen · ritmo mensual"
          valor={pesos(neto)}
          nota="Al día de hoy, no es un mes cerrado"
          acento={neto > 0 ? "good" : "critical"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta
          titulo="Cascada del margen"
          descripcion="Del interés cobrado a lo que realmente queda, al ritmo de hoy"
          className="lg:col-span-3"
        >
          <Cascada filas={cascada} />
        </Tarjeta>

        <Tarjeta
          titulo="Situación de la cartera"
          descripcion="30 contratos por saldo insoluto"
          className="lg:col-span-2"
        >
          <ul className="space-y-3">
            {buckets.map((b) => {
              const parte = b.monto / colocado;
              return (
                <li key={b.bucket}>
                  <div className="flex items-baseline justify-between gap-2">
                    <Insignia estado={b.estado}>{b.bucket}</Insignia>
                    <span className="tabular text-sm text-ink">{pesos(b.monto)}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--plane)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(parte * 100, 1)}%`,
                          background: `var(--${b.estado})`,
                        }}
                      />
                    </div>
                    <span className="w-16 text-right text-xs tabular text-muted">
                      {b.contratos} · {pct(parte, 0)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/cartera"
            className="mt-4 inline-block text-xs text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Ver cartera completa
          </Link>
        </Tarjeta>
      </div>

      <Tarjeta
        titulo="Calce de plazos · próximos 12 meses"
        descripcion="Lo que entra por cobranza contra lo que sale por vencimientos, intereses y gastos"
      >
        <GraficaCalce datos={datosCalce} />
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Requiere atención" className="lg:col-span-3">
          {avisos.length === 0 ? (
            <p className="text-sm text-muted">Nada pendiente.</p>
          ) : (
            <ul className="space-y-3">
              {avisos.slice(0, 7).map((a, k) => (
                <li key={k} className="flex items-start gap-2.5">
                  <span className="mt-0.5">
                    <Insignia estado={a.nivel}>{""}</Insignia>
                  </span>
                  <span>
                    <span className="block text-sm text-ink">{a.titulo}</span>
                    <span className="block text-xs text-muted">{a.detalle}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>

        <Tarjeta
          titulo="De quién depende nuestro dinero"
          descripcion="Si este inversionista no renueva, hay que reponerlo"
          className="lg:col-span-2"
        >
          <p
            className="text-3xl font-semibold"
            style={{
              color:
                topConcentracion.participacion > UMBRAL_CONCENTRACION.fondeo
                  ? "var(--critical)"
                  : "var(--ink)",
            }}
          >
            {pct(topConcentracion.participacion)}
          </p>
          <p className="mt-1 text-sm text-ink-2">{topConcentracion.nombre}</p>
          <p className="mt-2 text-xs text-muted">
            {pesos(topConcentracion.monto)} de {pesos(captado)}. El umbral de alerta está en{" "}
            {pct(UMBRAL_CONCENTRACION.fondeo, 0)}.
          </p>
          <Link
            href="/calce"
            className="mt-4 inline-block text-xs text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Ver los cinco más grandes
          </Link>
        </Tarjeta>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta
          titulo="A quién se lo prestamos"
          descripcion="Si este cliente deja de pagar, es lo que está en riesgo"
          className="lg:col-span-2"
        >
          <p
            className="text-3xl font-semibold"
            style={{
              color:
                topCartera.participacion > UMBRAL_CONCENTRACION.cartera
                  ? "var(--critical)"
                  : "var(--ink)",
            }}
          >
            {pct(topCartera.participacion)}
          </p>
          <p className="mt-1 text-sm text-ink-2">{topCartera.nombre}</p>
          <p className="mt-2 text-xs text-muted">
            {pesos(topCartera.monto)} de {pesos(colocado)}. El umbral de alerta está en{" "}
            {pct(UMBRAL_CONCENTRACION.cartera, 0)}.
          </p>
          <Link
            href="/calce"
            className="mt-4 inline-block text-xs text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Ver los cinco más grandes
          </Link>
        </Tarjeta>

        <Tarjeta titulo="Los cinco mayores del fondeo" className="lg:col-span-3">
          <ul className="space-y-2">
            {concentracion.map((c) => (
              <li key={c.nombre} className="flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-ink-2">{c.nombre}</span>
                <span className="shrink-0 tabular text-xs text-muted">
                  {pesos(c.monto)} · {pct(c.participacion)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-[var(--hair)] pt-3 text-xs text-muted">
            Los cinco juntos son {pct(concentracion.reduce((s, c) => s + c.participacion, 0))} del
            fondeo total.
          </p>
        </Tarjeta>
      </div>
    </div>
  );
}

function Cascada({
  filas,
}: {
  filas: Array<{ concepto: string; monto: number; tipo: "suma" | "resta" | "subtotal" | "total"; acumulado: number }>;
}) {
  const escala = Math.max(...filas.map((f) => Math.abs(f.monto)));

  return (
    <ul className="space-y-2.5">
      {filas.map((f) => {
        const esResultado = f.tipo === "subtotal" || f.tipo === "total";
        const ancho = (Math.abs(f.monto) / escala) * 100;
        const color =
          f.tipo === "suma" ? "var(--s1)" : f.tipo === "resta" ? "var(--s2)" : "var(--ink-2)";

        return (
          <li
            key={f.concepto}
            className={esResultado ? "border-t border-[var(--hair)] pt-2.5" : ""}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-sm ${esResultado ? "font-semibold text-ink" : "text-ink-2"}`}>
                {f.concepto}
              </span>
              <span
                className={`tabular text-sm ${esResultado ? "font-semibold text-ink" : "text-ink-2"}`}
              >
                {f.monto < 0 ? "−" : ""}
                {pesos(Math.abs(f.monto))}
              </span>
            </div>
            {!esResultado ? (
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--plane)]">
                <div className="h-full rounded-full" style={{ width: `${ancho}%`, background: color }} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
