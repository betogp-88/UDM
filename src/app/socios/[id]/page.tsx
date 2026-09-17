import Link from "next/link";
import { notFound } from "next/navigation";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pct, fecha, mesLargo, sumarMeses } from "@/lib/formato";
import {
  SOCIOS,
  buscarSocio,
  resumenCompromisos,
  prospectosDe,
  COMPROMISO_CAPTACION,
  INVERSIONISTAS,
  CREDITOS,
  socioDeInversionista,
  socioDeCredito,
  vencimientoInversion,
  mensualidadCredito,
  HOY,
} from "@/lib/demo/datos";

export function generateStaticParams() {
  return SOCIOS.filter((s) => !s.enTesoreria).map((s) => ({ id: s.id }));
}

export default async function FichaSocio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = buscarSocio(id);
  if (!socio || socio.enTesoreria) notFound();

  const r = resumenCompromisos().find((x) => x.socio.id === socio.id)!;
  const prospectos = prospectosDe(socio.id);
  const traidos = INVERSIONISTAS.filter((i) => socioDeInversionista(i)?.id === socio.id);
  const originados = CREDITOS.filter((c) => socioDeCredito(c)?.id === socio.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/socios" className="text-xs text-muted hover:text-ink">
          ← Socios
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-ink">{socio.nombre}</h2>
          <Etiqueta>{pct(socio.participacion, 0)} del capital</Etiqueta>
          {socio.inversionPropiaId ? <Etiqueta>También inversionista</Etiqueta> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato etiqueta="Aportación de capital" valor={pesos(socio.aportacion)} />
        <Dato etiqueta="Retorno por inversión" valor={pesos(r.retornoInversion)} nota="Mensual" />
        <Dato etiqueta="Utilidad SOFOM" valor={pesos(r.utilidadSofom)} nota="Mensual" />
        <Dato
          etiqueta="Colocado"
          valor={pesos(r.colocado)}
          nota={`${originados.length} créditos originados`}
        />
      </div>

      <Tarjeta titulo="Compromiso de captación">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm text-ink-2">Avance</span>
          <span className="tabular text-sm text-ink">
            {pesos(r.invertido)}
            <span className="text-muted"> de {pesos(COMPROMISO_CAPTACION)}</span>
          </span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--plane)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(r.avance, 1) * 100}%`,
              background: r.avance >= 1 ? "var(--good)" : "var(--s1)",
            }}
          />
        </div>
        <div className="mt-2">
          {r.avance >= 1 ? (
            <Insignia estado="good">
              Compromiso cumplido · {pct(r.avance, 0)}
            </Insignia>
          ) : (
            <Insignia estado="warning">
              {pct(r.avance, 0)} — le faltan {pesos(r.faltante)}
            </Insignia>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-[var(--plane)] p-4">
            <p className="text-xs text-ink-2">Directo · su propio capital</p>
            <p className="mt-1 truncate text-lg font-semibold text-ink">{pesos(r.directo)}</p>
          </div>
          <div className="min-w-0 rounded-lg bg-[var(--plane)] p-4">
            <p className="text-xs text-ink-2">Indirecto · lo que trajo</p>
            <p className="mt-1 truncate text-lg font-semibold text-ink">{pesos(r.indirecto)}</p>
          </div>
        </div>

        {r.faltante > 0 ? (
          <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
            Trae {pesos(r.pipelineInversion)} ponderados en prospectos de inversión.{" "}
            {r.pipelineInversion >= r.faltante
              ? "Si cierran como están proyectados, cumple el compromiso."
              : `Aun cerrándolos, le faltarían ${pesos(r.faltante - r.pipelineInversion)}.`}
          </p>
        ) : null}
      </Tarjeta>

      <Tarjeta titulo="Prospectos" descripcion={`${prospectos.length} en el CRM`}>
        {prospectos.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Sin prospectos asignados.</p>
        ) : (
          <ul className="divide-y divide-[var(--hair)]">
            {prospectos.map((p) => (
              <li key={p.id} className="py-3">
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
                  <Insignia estado={p.etapa === "Documentación" ? "good" : "warning"}>
                    {p.etapa}
                  </Insignia>
                  <span
                    className={`text-xs ${
                      p.diasAlProximoContacto <= 3 ? "text-[var(--critical)]" : "text-muted"
                    }`}
                  >
                    Contactar en {p.diasAlProximoContacto}{" "}
                    {p.diasAlProximoContacto === 1 ? "día" : "días"}
                  </span>
                  {p.tipo === "Inversión" && p.mesesACierre ? (
                    <span className="text-xs capitalize text-muted">
                      entraría en {mesLargo(sumarMeses(HOY, p.mesesACierre))}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-muted">{p.nota}</p>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/crm"
          className="mt-4 inline-block text-xs text-ink-2 underline underline-offset-2 hover:text-ink"
        >
          Ver el CRM completo
        </Link>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Inversión" descripcion={`${traidos.length} contratos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {traidos.map((i) => (
              <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  <Link href={`/inversionistas/${i.id}`} className="text-sm text-ink hover:underline">
                    {i.nombre}
                  </Link>
                  {i.id === socio.inversionPropiaId ? (
                    <span className="ml-2 text-xs text-muted">(su propio capital)</span>
                  ) : null}
                  <span className="block text-xs text-muted">
                    Vence {fecha(vencimientoInversion(i))} · {pct(i.tasaAnual)}
                  </span>
                </span>
                <span className="shrink-0 tabular text-sm text-ink-2">{pesos(i.capital)}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Colocación" descripcion={`${originados.length} créditos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {originados.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  <Link href={`/cartera/${c.id}`} className="text-sm text-ink hover:underline">
                    {c.cliente}
                  </Link>
                  <span className="block text-xs text-muted">
                    {c.diasAtraso === 0 ? "Al corriente" : `${c.diasAtraso} días de atraso`} ·{" "}
                    {pesos(mensualidadCredito(c))} al mes
                  </span>
                </span>
                <span className="shrink-0 tabular text-sm text-ink-2">{pesos(c.saldo)}</span>
              </li>
            ))}
          </ul>
          {originados.some((c) => c.diasAtraso > 30) ? (
            <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
              Parte de la cartera que originó está en atraso. Vale la pena que él mismo gestione la
              cobranza: es su relación.
            </p>
          ) : null}
        </Tarjeta>
      </div>
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
