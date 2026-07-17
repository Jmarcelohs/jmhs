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
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Câmara Municipal de Nepomuceno
            </p>
            <nav className="mt-2 flex gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-500 hover:text-slate-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {usuario && (
              <span className="text-sm text-slate-600">
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
