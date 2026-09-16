import Link from "next/link";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { ListaRequisitos } from "@/components/ListaRequisitos";
import { pct } from "@/lib/formato";
import {
  INVERSIONISTAS,
  requisitosDe,
  estadoExpediente,
  REQUISITOS_FISICA,
  REQUISITOS_MORAL,
  REQUISITOS_CREDITO_FISICA,
  REQUISITOS_CREDITO_MORAL,
} from "@/lib/demo/datos";

export default function Expedientes() {
  const filas = INVERSIONISTAS.map((i) => {
    const reqs = requisitosDe(i.tipo);
    const estado = estadoExpediente(i);
    const completos = estado.filter(Boolean).length;
    return {
      inv: i,
      reqs,
      estado,
      completos,
      total: reqs.length,
      faltantes: reqs.filter((_, k) => !estado[k]),
    };
  }).sort((a, b) => a.completos / a.total - b.completos / b.total);

  const incompletos = filas.filter((f) => f.completos < f.total);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-ink">Expedientes</h2>
        <p className="mt-1 max-w-2xl text-sm text-ink-2">
          El checklist es bloqueante: sin expediente completo, el sistema no permite registrar el
          ingreso de recursos ni la ministración de un crédito.
        </p>
      </header>

      {incompletos.length > 0 ? (
        <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
          <Insignia estado="serious">
            {incompletos.length} {incompletos.length === 1 ? "expediente" : "expedientes"} sin
            integrar
          </Insignia>
          <ul className="mt-3 space-y-2">
            {incompletos.map((f) => (
              <li key={f.inv.id} className="text-sm">
                <span className="text-ink">{f.inv.nombre}</span>
                <span className="ml-2 text-xs text-muted">
                  falta: {f.faltantes.join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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

      <Tarjeta titulo="Avance por inversionista" descripcion="Los menos completos primero">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">Inversionista</th>
                <th className="px-2 py-2 font-medium">Tipo</th>
                <th className="px-2 py-2 font-medium">Avance</th>
                <th className="px-2 py-2 text-right font-medium">Documentos</th>
                <th className="px-2 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => {
                const parte = f.completos / f.total;
                const completo = f.completos === f.total;
                return (
                  <tr
                    key={f.inv.id}
                    className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--plane)]"
                  >
                    <td className="px-4 py-2.5 sm:px-2">
                      <Link
                        href={`/inversionistas/${f.inv.id}`}
                        className="text-ink hover:underline"
                      >
                        {f.inv.nombre}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      <Etiqueta>{f.inv.tipo}</Etiqueta>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[var(--plane)]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${parte * 100}%`,
                            background: completo ? "var(--good)" : "var(--serious)",
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">
                      {f.completos}/{f.total} · {pct(parte, 0)}
                    </td>
                    <td className="px-2 py-2.5">
                      {completo ? (
                        <Insignia estado="good">Completo</Insignia>
                      ) : (
                        <Insignia estado="serious">Bloqueado</Insignia>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}
