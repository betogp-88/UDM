import type { Metadata } from "next";
import { Navegacion } from "@/components/Navegacion";
import "./globals.css";

export const metadata: Metadata = {
  title: "Un Dígito Más · Plataforma interna",
  description: "Prototipo de la plataforma interna de la SOFOM y la arrendadora",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="bg-[var(--warning)] px-4 py-1.5 text-center text-xs font-medium text-[#3a2a00]">
          Datos de demostración — personas, montos y fechas ficticios
        </div>

        <header className="bg-brand text-[var(--brand-ink)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] opacity-70">SOFOM · Arrendadora</p>
              <h1 className="text-lg font-semibold">Un Dígito Más</h1>
            </div>
            <p className="hidden text-xs opacity-70 sm:block">Prototipo</p>
          </div>
        </header>

        <Navegacion />

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

        <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-muted sm:px-6">
          Prototipo para revisión interna. Los cálculos de interés, retención y amortización usan
          las fórmulas reales; los datos son ficticios.
        </footer>
      </body>
    </html>
  );
}
