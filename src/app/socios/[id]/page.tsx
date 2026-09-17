import Link from "next/link";
import { notFound } from "next/navigation";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { Embudo } from "@/components/Embudo";
import { BarraMeta } from "@/components/BarraMeta";
import { pesos, pct, fecha } from "@/lib/formato";
import {
  SOCIOS,
  buscarSocio,
  resumenSocios,
  resumenMetas,
  prospectosDe,
  pipelinePonderado,
  embudo,
  avanceDelAnio,
  estadoMeta,
  COLOR_META,
  INVERSIONISTAS,
  CREDITOS,
  socioDeInversionista,
  socioDeCredito,
  vencimientoInversion,
} from "@/lib/demo/datos";

export function generateStaticParams() {
  return SOCIOS.filter((s) => !s.enTesoreria).map((s) => ({ id: s.id }));
}

export default async function FichaSocio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const socio = buscarSocio(id);
  if (!socio || socio.enTesoreria) notFound();

  const r = resumenSocios().find((x) => x.socio.id === socio.id)!;
  const m = resumenMetas().find((x) => x.socio.id === socio.id);
  const prospectos = prospectosDe(socio.id);
  const deInversion = prospectos.filter((p) => p.tipo === "Inversionista");
  const esperado = avanceDelAnio();

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
        <Dato etiqueta="Aportación" valor={pesos(socio.aportacion)} />
        <Dato etiqueta="Retorno mensual" valor={pesos(r.retornoMensual)} nota="Rendimiento propio + margen" />
        <Dato etiqueta="Fondeo aportado" valor={pesos(r.directo + r.indirecto)} nota="Propio y traído" />
        <Dato
          etiqueta="En el embudo"
          valor={pesos(prospectos.reduce((s, p) => s + p.monto, 0))}
          nota={`${prospectos.length} prospectos`}
        />
      </div>

      {m ? (
        <Tarjeta titulo="Metas del año" descripcion="Contra el avance del calendario">
          <div className="space-y-6">
            <BarraMeta
              etiqueta="Captación"
              logrado={m.logradoCaptacion}
              meta={m.meta.captacion}
              avance={m.avanceCaptacion}
              esperado={esperado}
              estado={estadoMeta(m.avanceCaptacion)}
              color={COLOR_META[estadoMeta(m.avanceCaptacion)]}
            />
            <BarraMeta
              etiqueta="Colocación"
              logrado={m.logradoColocacion}
              meta={m.meta.colocacion}
              avance={m.avanceColocacion}
              esperado={esperado}
              estado={estadoMeta(m.avanceColocacion)}
              color={COLOR_META[estadoMeta(m.avanceColocacion)]}
            />
          </div>

          <div className="mt-5 rounded-lg bg-[var(--plane)] p-4">
            <p className="text-sm text-ink">
              Le faltan {pesos(Math.max(0, m.meta.captacion - m.logradoCaptacion))} de captación
              para cerrar la meta.
            </p>
            <p className="mt-1 text-xs text-muted">
              Trae {pesos(m.pipelineCaptacion)} ponderados en prospectos de inversión. Si cierran
              como están proyectados, {" "}
              {m.pipelineCaptacion >= m.meta.captacion - m.logradoCaptacion
                ? "alcanza la meta."
                : `aún le faltarían ${pesos(m.meta.captacion - m.logradoCaptacion - m.pipelineCaptacion)}.`}
            </p>
          </div>
        </Tarjeta>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <Tarjeta titulo="Embudo" descripcion="Sus prospectos por etapa" className="lg:col-span-2">
          <Embudo etapas={embudo(prospectos)} />
          <p className="mt-4 border-t border-[var(--hair)] pt-3 text-xs text-muted">
            {pesos(pipelinePonderado(deInversion))} ponderados solo de inversión.
          </p>
        </Tarjeta>

        <Tarjeta titulo="Prospectos" className="lg:col-span-3">
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
                <div className="mt-1 flex flex-wrap items-center gap-x-3">
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
                </div>
                <p className="mt-1 text-xs text-muted">{p.nota}</p>
              </li>
            ))}
          </ul>
          <Link
            href="/prospectos"
            className="mt-4 inline-block text-xs text-ink-2 underline underline-offset-2 hover:text-ink"
          >
            Ver todos los prospectos
          </Link>
        </Tarjeta>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Inversionistas" descripcion={`${traidos.length} contratos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {traidos.map((i) => (
              <li key={i.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  <Link
                    href={`/inversionistas/${i.id}`}
                    className="text-sm text-ink hover:underline"
                  >
                    {i.nombre}
                  </Link>
                  {i.id === socio.inversionPropiaId ? (
                    <span className="ml-2 text-xs text-muted">(su propio capital)</span>
                  ) : null}
                  <span className="block text-xs text-muted">
                    Vence {fecha(vencimientoInversion(i))}
                  </span>
                </span>
                <span className="shrink-0 tabular text-sm text-ink-2">{pesos(i.capital)}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Cartera originada" descripcion={`${originados.length} créditos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {originados.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5">
                <span className="min-w-0">
                  <Link href={`/cartera/${c.id}`} className="text-sm text-ink hover:underline">
                    {c.cliente}
                  </Link>
                  <span className="block text-xs text-muted">
                    {c.diasAtraso === 0 ? "Al corriente" : `${c.diasAtraso} días de atraso`}
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
