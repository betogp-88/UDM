import Link from "next/link";
import { Tarjeta, Insignia, Etiqueta } from "@/components/ui";
import { pesos, pct, fecha } from "@/lib/formato";
import {
  INVERSIONISTAS,
  totalCaptado,
  tasaPasivaPromedio,
  vencimientoInversion,
  socioDeInversionista,
  interesPagadoMensual,
  retencionMensual,
} from "@/lib/demo/datos";

export default function Inversionistas() {
  const orden = [...INVERSIONISTAS].sort((a, b) => a.mesesRestantes - b.mesesRestantes);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Dato etiqueta="Capital captado" valor={pesos(totalCaptado())} />
        <Dato etiqueta="Contratos" valor={String(INVERSIONISTAS.length)} />
        <Dato etiqueta="Rendimiento promedio" valor={pct(tasaPasivaPromedio())} />
        <Dato etiqueta="Rendimiento bruto mensual" valor={pesos(interesPagadoMensual())} />
      </div>

      <Tarjeta
        titulo="Inversionistas"
        descripcion={`Ordenados por vencimiento más próximo · retención mensual ${pesos(retencionMensual())}`}
      >
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-[var(--hair)] text-left text-xs text-muted">
                <th className="px-4 py-2 font-medium sm:px-2">Inversionista</th>
                <th className="px-2 py-2 font-medium">Empresa</th>
                <th className="px-2 py-2 text-right font-medium">Capital</th>
                <th className="px-2 py-2 text-right font-medium">Tasa</th>
                <th className="px-2 py-2 text-right font-medium">Rendimiento neto mensual</th>
                <th className="px-2 py-2 font-medium">Vence</th>
                <th className="px-2 py-2 font-medium">Traído por</th>
                <th className="px-2 py-2 font-medium">Expediente</th>
              </tr>
            </thead>
            <tbody>
              {orden.map((i) => {
                const socio = socioDeInversionista(i);
                const interes = (i.capital * i.tasaAnual) / 12;
                const retencion = (i.capital * 0.009) / 12;
                const proximo = i.mesesRestantes <= 2;
                return (
                  <tr
                    key={i.id}
                    className="border-b border-[var(--hair)] last:border-0 hover:bg-[var(--plane)]"
                  >
                    <td className="px-4 py-2.5 sm:px-2">
                      <Link href={`/inversionistas/${i.id}`} className="text-ink hover:underline">
                        {i.nombre}
                      </Link>
                      <span className="ml-2 text-xs text-muted">{i.tipo}</span>
                    </td>
                    <td className="px-2 py-2.5">
                      <Etiqueta>{i.empresa}</Etiqueta>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(i.capital)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">{pct(i.tasaAnual)}</td>
                    <td className="px-2 py-2.5 text-right tabular text-ink-2">
                      {pesos(interes - retencion)}
                    </td>
                    <td className="px-2 py-2.5 text-xs">
                      <span className={proximo ? "text-ink" : "text-ink-2"}>
                        {fecha(vencimientoInversion(i))}
                      </span>
                      <span className="block text-muted">
                        {i.mesesRestantes} {i.mesesRestantes === 1 ? "mes" : "meses"}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-xs">
                      {socio ? (
                        <span className="text-ink-2">{socio.nombre.split(" ").slice(0, 2).join(" ")}</span>
                      ) : (
                        <span className="text-muted">Directo</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5">
                      {i.expedienteCompleto ? (
                        <Insignia estado="good">Completo</Insignia>
                      ) : (
                        <Insignia estado="serious">Incompleto</Insignia>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--hair)] font-semibold">
                <td className="px-4 py-2.5 sm:px-2" colSpan={2}>
                  Total
                </td>
                <td className="px-2 py-2.5 text-right tabular text-ink">{pesos(totalCaptado())}</td>
                <td className="px-2 py-2.5 text-right tabular text-ink-2">
                  {pct(tasaPasivaPromedio())}
                </td>
                <td className="px-2 py-2.5 text-right tabular text-ink">
                  {pesos(interesPagadoMensual() - retencionMensual())}
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Tarjeta>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="text-xs text-ink-2">{etiqueta}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{valor}</p>
    </div>
  );
}
