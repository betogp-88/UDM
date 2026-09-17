"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const RUTAS = [
  { href: "/crm", etiqueta: "CRM" },
  { href: "/", etiqueta: "Dashboard" },
  { href: "/simulador", etiqueta: "Simulador" },
  { href: "/cartera", etiqueta: "Cartera" },
  { href: "/calendario", etiqueta: "Calendario" },
  { href: "/inversionistas", etiqueta: "Inversionistas" },
  { href: "/calce", etiqueta: "Calce" },
  { href: "/tesoreria", etiqueta: "Tesorería" },
  { href: "/expedientes", etiqueta: "Expedientes" },
  { href: "/socios", etiqueta: "Socios" },
];

export function Navegacion() {
  const ruta = usePathname();
  const activo = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));

  return (
    <nav className="overflow-x-auto border-b border-[var(--hair)] bg-surface">
      <ul className="mx-auto flex max-w-6xl gap-1 px-3 sm:px-6">
        {RUTAS.map((r) => (
          <li key={r.href}>
            <Link
              href={r.href}
              aria-current={activo(r.href) ? "page" : undefined}
              className={`inline-block whitespace-nowrap border-b-2 px-3 py-3 text-sm transition-colors ${
                activo(r.href)
                  ? "border-brand font-medium text-ink"
                  : "border-transparent text-ink-2 hover:text-ink"
              }`}
            >
              {r.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
