import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pct } from "@/lib/formato";
import { interesMoratorio } from "@/lib/demo/calculos";
import {
  CREDITOS,
  totalColocado,
  tasaActivaPromedio,
  resumenBuckets,
  bucket,
  ESTADO_BUCKET,
  mensualidadCredito,
  interesCobradoMensual,
  socioDeCredito,
} from "@/lib/demo/datos";

export default function Cartera() {
  const buckets = resumenBuckets();
  const atrasado = buckets.filter((b) => b.bucket !== "Al corriente").reduce((s, b) => s + b.monto, 0);
  const orden = [...CREDITOS].sort((a, b) => b.diasAtraso - a.diasAtraso || b.saldo - a.saldo);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Cartera total" valor={pesos(totalColocado())} nota={`${CREDITOS.length} contratos`} />
        <Dato etiqueta="Tasa promedio" valor={pct(tasaActivaPromedio())} />
        <Dato etiqueta="Interés mensual" valor={pesos(interesCobradoMensual())} />
        <Dato
          etiqueta="Cartera con atraso"
          valor={pesos(atrasado)}
          nota={`${pct(atrasado / totalColocado(), 1)} del total`}
        />
      </div>

      <Tarjeta titulo="Semáforo" descripcion="Días de atraso sobre el saldo insoluto">
        <div className="grid gap-3 sm:grid-cols-4">
          {buckets.map((b) => (
            <div key={b.bucket} className="rounded-lg bg-[var(--plane)] p-3">
              <Insignia estado={b.estado}>{b.bucket}</Insignia>
              <p className="mt-2 text-lg font-semibold text-ink">{pesos(b.monto)}</p>
              <p className="text-xs text-muted">
                {b.contratos} {b.contratos === 1 ? "contrato" : "contratos"} ·{" "}
                {pct(b.monto / totalColocado(), 1)}
              </p>
            </div>
          ))}
        </div>
      </Tarjeta>

      <Tarjeta titulo="Contratos" descripcion="Los de mayor atraso primero">
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">Cliente</th>
                <th className="px-2 py-2 font-medium">Producto</th>
                <th className="px-2 py-2 text-right font-medium">Saldo</th>
                <th className="px-2 py-2 text-right font-medium">Tasa</th>
                <th className="px-2 py-2 text-right font-medium">Mensualidad</th>
                <th className="px-2 py-2 text-right font-medium">Plazo</th>
                <th className="px-2 py-2 text-right font-medium">Moratorios</th>
                <th className="px-2 py-2 font-medium">Originado por</th>
                <th className="px-2 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {orden.map((c) => {
                const b = bucket(c);
                const socio = socioDeCredito(c);
                const cuota = mensualidadCredito(c);
                const mora = c.diasAtraso
                  ? interesMoratorio(cuota, c.tasaAnual, c.diasAtraso)
                  : 0;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--plane)]"
                  >
                    <td className="px-4 py-2.5 text-ink sm:px-2">{c.cliente}</td>
                    <td className="px-2 py-2.5">
                      <Etiqueta>{c.tipoCredito}</Etiqueta>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(c.saldo)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">{pct(c.tasaAnual)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">{pesos(cuota)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-muted">
                      {c.mesesRestantes} m
                    </td>
                    <td className="px-2 py-2.5 text-right tabular">
                      {mora ? (
                        <span style={{ color: "var(--critical)" }}>{pesos(mora)}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-xs">
                      {socio ? (
                        <span className="text-ink-2">{socio.nombre.split(" ").slice(0, 2).join(" ")}</span>
                      ) : (
                        <span className="text-muted">Operación</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      <Insignia estado={ESTADO_BUCKET[b]}>
                        {c.diasAtraso === 0 ? "Al corriente" : `${c.diasAtraso} días`}
                      </Insignia>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted">
          Los moratorios se calculan al doble de la tasa ordinaria de cada contrato, corridos por
          días sobre la mensualidad vencida.
        </p>
      </Tarjeta>
    </div>
  );
}

function Dato({ etiqueta, valor, nota }: { etiqueta: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{valor}</p>
      {nota ? <p className="mt-0.5 text-xs text-muted">{nota}</p> : null}
    </div>
  );
}
