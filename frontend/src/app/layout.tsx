import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { UserSwitcher } from "@/components/UserSwitcher";

export const metadata: Metadata = {
  title: "VitalPaws — Cada paso, una nueva oportunidad",
  description:
    "Ecosistema Web3 para financiar prótesis caninas mediante donación trazable y NFT de impacto.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SessionProvider>
          <nav className="nav">
            <Link href="/">
              <strong style={{ color: "var(--navy)" }}>🐾 VITAL PAWS</strong>
            </Link>
            <div className="nav-links">
              <Link href="/">Inicio</Link>
              <Link href="/cases">Casos</Link>
              <Link href="/dashboard">Mi Panel</Link>
              <Link href="/admin">Admin</Link>
              <UserSwitcher />
            </div>
          </nav>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
