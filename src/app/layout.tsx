import type { Metadata } from "next";
import Image from "next/image";
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

        {/* El logotipo siempre sobre blanco, como en el sitio */}
        <header className="border-b border-[var(--hair)] bg-[var(--brand-bar)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Image
              src="/logo.png"
              alt="Un Dígito Más"
              width={907}
              height={504}
              priority
              className="h-10 w-auto sm:h-12"
            />
            <p className="text-right text-[11px] uppercase tracking-[0.16em] text-[#13314d]/70">
              SOFOM · Arrendadora
            </p>
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
