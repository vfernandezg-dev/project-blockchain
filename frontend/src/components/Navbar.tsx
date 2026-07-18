"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/session";
import { UserSwitcher } from "@/components/UserSwitcher";

const ROLE_EMOJI: Record<string, string> = { ADMIN: "🛠️", VET: "🩺", DONANTE: "💛" };

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/cases", label: "Casos" },
  { href: "/dashboard", label: "Mi Panel" },
  { href: "/admin", label: "Admin", adminOnly: true },
];

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = (localStorage.getItem("vp_theme") as "light" | "dark") || null;
    const initial =
      saved ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("vp_theme", next);
  };

  return (
    <button className="theme-toggle" onClick={toggle} title="Cambiar tema" aria-label="Cambiar tema">
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { current, logout } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!current) {
    return (
      <Link href="/login" className="btn-wallet" onClick={onNavigate}>
        Conectar
      </Link>
    );
  }

  const initial = current.name.charAt(0).toUpperCase();

  return (
    <div className="account-menu" ref={ref}>
      <button className="account-chip" onClick={() => setOpen((o) => !o)}>
        <span className="avatar">{initial}</span>
        <span className="account-name">
          {current.name}
          <small>{ROLE_EMOJI[current.role]} {current.role}</small>
        </span>
        <span className="chev">▾</span>
      </button>

      {open && (
        <div className="account-dropdown">
          <Link href="/dashboard" onClick={() => { setOpen(false); onNavigate?.(); }}>
            Mi Panel
          </Link>
          <button
            className="dropdown-item"
            onClick={() => {
              logout();
              setOpen(false);
              onNavigate?.();
            }}
          >
            Cerrar sesión
          </button>
          <div className="dropdown-demo">
            <span className="muted">Modo demo · cambiar rol</span>
            <UserSwitcher />
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { current } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const visibleLinks = LINKS.filter((l) => !l.adminOnly || current?.role === "ADMIN");

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
          <img src="/logo-icon.png" alt="" className="brand-logo" />
          <strong>VITAL PAWS</strong>
        </Link>

        <nav className="nav-links desktop">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${isActive(l.href) ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-right">
          <ThemeToggle />
          <div className="desktop">
            <AccountMenu />
          </div>
          <button
            className="hamburger"
            aria-label="Menú"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {visibleLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${isActive(l.href) ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="mobile-account">
            <AccountMenu onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
