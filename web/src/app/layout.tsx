import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "DIFF Motors — Plataforma de gestión para automotoras",
  description:
    "CRM integral para automotoras: inventario, leads con IA, publicación multicanal y reportes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-black text-cream">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 px-8 py-8 lg:px-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
