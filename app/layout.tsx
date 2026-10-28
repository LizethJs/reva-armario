import type { Metadata } from "next";
import "./globals.css";
import SessionGuard from "./components/SessionGuard"; // Ruta ajustada correctamente a la carpeta app/components

export const metadata: Metadata = {
  title: "Alta Daily",
  description: "Estilismo ejecutivo y comercio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        {/* Guardián Global de Expiración de Sesión (5 Minutos) */}
        <SessionGuard />
        {children}
      </body>
    </html>
  );
}