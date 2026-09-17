"use client";

import { useState } from "react";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { ListaRequisitos } from "@/components/ListaRequisitos";
import {
  ENTIDADES,
  CATEGORIAS_DOC,
  CONSTITUCION,
  documentosDe,
  coberturaActas,
  REQUISITOS_FISICA,
  REQUISITOS_MORAL,
  REQUISITOS_CREDITO_FISICA,
  REQUISITOS_CREDITO_MORAL,
  type Entidad,
  type CategoriaDoc,
} from "@/lib/demo/datos";

export default function Expedientes() {
  const [entidad, setEntidad] = useState<Entidad>(ENTIDADES[0]);
  const [categoria, setCategoria] = useState<CategoriaDoc>(CATEGORIAS_DOC[0]);

  const documentos = documentosDe(entidad, categoria);
  const cobertura = coberturaActas(entidad);
  const faltantes = cobertura.filter((c) => !c.tiene);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Expediente corporativo</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          Los papeles de las dos sociedades. El expediente de cada inversionista o cliente vive en
          su propia ficha.
        </p>
      </header>

      <div className="inline-flex flex-wrap rounded-lg bg-surface p-1 ring-1 ring-[var(--hair)]">
        {ENTIDADES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEntidad(e)}
            className={`rounded-md px-4 py-1.5 text-sm transition-colors ${
              entidad === e ? "bg-brand font-medium text-[var(--brand-ink)]" : "text-ink-2 hover:text-ink"
            }`}
          >
            {e}
          </button>
        ))}
      </div>

      <Tarjeta
        titulo="Actas de asamblea por ejercicio"
        descripcion={`Desde la constitución en ${CONSTITUCION[entidad]}, debe haber al menos una por año`}
      >
        <ul className="flex flex-wrap gap-2">
          {cobertura.map((c) => (
            <li key={c.anio}>
              <span
                className={`flex h-14 w-16 flex-col items-center justify-center rounded-lg text-xs tabular ${
                  c.tiene
                    ? "bg-[var(--plane)] text-ink-2 ring-1 ring-[var(--hair)]"
                    : "text-white"
                }`}
                style={c.tiene ? undefined : { background: "var(--critical)" }}
              >
                <span aria-hidden className="text-sm">
                  {c.tiene ? "●" : "■"}
                </span>
                {c.anio}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4">
          {faltantes.length === 0 ? (
            <Insignia estado="good">Todos los ejercicios tienen acta</Insignia>
          ) : (
            <Insignia estado="critical">
              Falta el acta de {faltantes.map((f) => f.anio).join(", ")}
            </Insignia>
          )}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Documentos">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {CATEGORIAS_DOC.map((c) => {
            const cuenta = documentosDe(entidad, c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategoria(c)}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  categoria === c
                    ? "bg-brand font-medium text-[var(--brand-ink)]"
                    : "bg-[var(--plane)] text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
                }`}
              >
                {c}
                <span className="ml-1.5 text-xs opacity-60">{cuenta}</span>
              </button>
            );
          })}
        </div>

        {documentos.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Sin documentos en «{categoria}» para {entidad}.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--hair)]">
            {documentos.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="min-w-0">
                  <span className="block text-sm text-ink">{d.nombre}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span>{d.fecha}</span>
                    {d.folio ? <Etiqueta>{d.folio}</Etiqueta> : null}
                    {d.ejercicio ? <Etiqueta>Ejercicio {d.ejercicio}</Etiqueta> : null}
                  </span>
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded-md px-3 py-1.5 text-xs text-ink-2 ring-1 ring-[var(--hair)] hover:text-ink"
                >
                  Ver documento
                </button>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta
          titulo="Requisitos para invertir"
          descripcion="Cópialos o compártelos con el prospecto"
        >
          <ListaRequisitos
            titulo="Requisitos para abrir una inversión"
            grupos={[
              { clave: "fisica", etiqueta: "Persona física", items: REQUISITOS_FISICA },
              { clave: "moral", etiqueta: "Persona moral", items: REQUISITOS_MORAL },
            ]}
            cierre="Sin el expediente completo no podemos recibir los recursos."
          />
        </Tarjeta>

        <Tarjeta
          titulo="Requisitos para crédito"
          descripcion="Cópialos o compártelos con el prospecto"
        >
          <ListaRequisitos
            titulo="Requisitos para solicitar un crédito"
            grupos={[
              { clave: "fisica", etiqueta: "Persona física", items: REQUISITOS_CREDITO_FISICA },
              { clave: "moral", etiqueta: "Persona moral", items: REQUISITOS_CREDITO_MORAL },
            ]}
            cierre="El expediente completo es requisito para la ministración de los recursos."
          />
        </Tarjeta>
      </div>
    </div>
  );
}
