"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoutButton } from "@/components/logout-button";

type NavItem = { href: string; label: string };
type Usuario = { nome: string; papel: string } | null;

function NavLinks({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              ativo ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/timbrado/logo.png"
      alt="Câmara Municipal de Nepomuceno"
      width={690}
      height={300}
      priority
      className={className}
    />
  );
}

function RodapeUsuario({ usuario }: { usuario: Usuario }) {
  return (
    <div className="m-4 border-t border-white/10 pt-4">
      {usuario && (
        <p className="px-3 text-xs text-white/60">
          {usuario.nome} · {usuario.papel}
        </p>
      )}
      <div className="mt-2 px-3">
        <LogoutButton />
      </div>
    </div>
  );
}

export function AppShell({
  usuario,
  navItems,
  children,
}: {
  usuario: Usuario;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar fixa (telas grandes) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:bg-brand-navy">
        <div className="m-4 rounded-lg bg-white p-3">
          <Logo />
        </div>
        <NavLinks items={navItems} pathname={pathname} />
        <RodapeUsuario usuario={usuario} />
      </aside>

      {/* Barra superior (telas pequenas) */}
      <div className="flex items-center justify-between bg-brand-navy px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="rounded-md p-1 text-white/80 hover:text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <Logo className="h-8 w-auto rounded bg-white p-1" />
        <span className="w-6" />
      </div>

      {/* Menu deslizante (telas pequenas) */}
      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-brand-navy shadow-xl">
            <div className="m-4 flex items-center justify-between">
              <div className="rounded-lg bg-white p-3">
                <Logo />
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="rounded-md p-1 text-white/80 hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <NavLinks items={navItems} pathname={pathname} onNavigate={() => setAberto(false)} />
            <RodapeUsuario usuario={usuario} />
          </aside>
        </div>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
