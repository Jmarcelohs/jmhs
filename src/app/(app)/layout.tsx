import Image from "next/image";
import Link from "next/link";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";
import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Painel" },
  { href: "/diarias", label: "Diárias de Viagem" },
  { href: "/requerimentos", label: "Requerimentos" },
  { href: "/pessoas", label: "Pessoas" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUsuario();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Faixa evocando as duas cores diagonais do timbrado oficial. */}
      <div className="h-1.5 bg-gradient-to-r from-brand-green to-brand-navy" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="shrink-0">
              <Image
                src="/timbrado/logo.png"
                alt="Câmara Municipal de Nepomuceno"
                width={690}
                height={300}
                priority
                className="h-11 w-auto"
              />
            </Link>
            <nav className="flex flex-wrap gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-navy/5 hover:text-brand-navy"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {usuario && (
              <span className="hidden text-sm text-slate-600 sm:inline">
                {usuario.nome} · {usuario.papel}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
