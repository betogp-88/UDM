import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UDM · Sistema de gestión",
  description: "Aplicacion interna de la SOFOM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
