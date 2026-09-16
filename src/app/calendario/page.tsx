import { Tarjeta, Insignia } from "@/components/ui";
import { pesos, fecha, mesLargo } from "@/lib/formato";
import {
  INVERSIONISTAS,
  CREDITOS,
  mensualidadCredito,
  GASTO_OPERACION_MENSUAL,
  HOY,
  vencimientoInversion,
} from "@/lib/demo/datos";
import { tasaRetencion } from "@/lib/demo/calculos";

/** Dia de pago asignado por contrato, estable entre recargas. */
function diaDePago(id: string): number {
  const n = Number(id.slice(-2));
  return [3, 7, 10, 14, 18, 22, 25, 28][n % 8];
}

export default function Calendario() {
  const anio = HOY.getFullYear();
  const mes = HOY.getMonth();
  const tasaRet = tasaRetencion(anio);

  const entradas = CREDITOS.map((c) => ({
    id: c.id,
    dia: diaDePago(c.id),
    nombre: c.cliente,
    etiqueta: c.tipoCredito,
    monto: mensualidadCredito(c),
    atraso: c.diasAtraso,
  })).sort((a, b) => a.dia - b.dia);

  const salidas = INVERSIONISTAS.map((i) => {
    const interes = (i.capital * i.tasaAnual) / 12;
    const retencion = (i.capital * tasaRet) / 12;
    const venceEsteMes = i.mesesRestantes === 0;
    return {
      id: i.id,
      dia: diaDePago(i.id),
      nombre: i.nombre,
      etiqueta: i.empresa,
      monto: interes - retencion + (venceEsteMes ? i.capital : 0),
      vence: venceEsteMes,
      proximo: i.mesesRestantes === 1,
      vencimiento: vencimientoInversion(i),
    };
  }).sort((a, b) => a.dia - b.dia);

  const totalEntra = entradas.reduce((s, e) => s + e.monto, 0);
  const totalSale = salidas.reduce((s, e) => s + e.monto, 0) + GASTO_OPERACION_MENSUAL;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold capitalize text-ink">{mesLargo(new Date(anio, mes, 1))}</h2>
        <p className="mt-1 text-sm text-ink-2">Lo que entra y lo que sale este mes.</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Dato etiqueta="Entra" valor={pesos(totalEntra)} color="var(--s1)" />
        <Dato etiqueta="Sale" valor={pesos(totalSale)} color="var(--s2)" />
        <Dato
          etiqueta="Neto"
          valor={`${totalEntra - totalSale < 0 ? "−" : "+"}${pesos(Math.abs(totalEntra - totalSale)).slice(1)}`}
          color={totalEntra - totalSale < 0 ? "var(--critical)" : "var(--good)"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Tarjeta titulo="Cobranza por recibir" descripcion={`${entradas.length} contratos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {entradas.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="w-7 shrink-0 text-center text-xs tabular text-muted">{e.dia}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{e.nombre}</span>
                  <span className="text-xs text-muted">{e.etiqueta}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block tabular text-sm text-ink">{pesos(e.monto)}</span>
                  {e.atraso > 0 ? (
                    <Insignia estado={e.atraso > 60 ? "critical" : e.atraso > 30 ? "serious" : "warning"}>
                      {e.atraso} días
                    </Insignia>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </Tarjeta>

        <Tarjeta titulo="Pagos por hacer" descripcion={`${salidas.length} inversionistas + gastos`}>
          <ul className="divide-y divide-[var(--hair)]">
            {salidas.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="w-7 shrink-0 text-center text-xs tabular text-muted">{s.dia}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ink">{s.nombre}</span>
                  <span className="text-xs text-muted">
                    {s.vence ? "Rendimiento + devolución de capital" : `Rendimiento neto · ${s.etiqueta}`}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block tabular text-sm text-ink">{pesos(s.monto)}</span>
                  {s.proximo ? (
                    <Insignia estado="warning">Vence {fecha(s.vencimiento)}</Insignia>
                  ) : null}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3 py-2.5">
              <span className="w-7 shrink-0 text-center text-xs tabular text-muted">30</span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-ink">Gastos de operación</span>
                <span className="text-xs text-muted">Nómina, renta, servicios</span>
              </span>
              <span className="shrink-0 tabular text-sm text-ink">
                {pesos(GASTO_OPERACION_MENSUAL)}
              </span>
            </li>
          </ul>
        </Tarjeta>
      </div>
    </div>
  );
}

function Dato({ etiqueta, valor, color }: { etiqueta: string; valor: string; color: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-surface p-4 ring-1 ring-[var(--hair)]">
      <p className="flex items-center gap-1.5 text-xs text-ink-2">
        <span className="h-2 w-2 rounded-sm" style={{ background: color }} aria-hidden />
        {etiqueta}
      </p>
      <p className="mt-1 truncate text-xl font-semibold text-ink">{valor}</p>
    </div>
  );
}
