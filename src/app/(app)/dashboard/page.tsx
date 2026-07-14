import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";

export default async function DashboardPage() {
  const usuario = await getCurrentUsuario();
  const supabase = await createClient();

  const { count: pendentesCount } = await supabase
    .from("diarias_solicitacoes")
    .select("id", { count: "exact", head: true })
    .eq("status", "Solicitado");

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        Olá, {usuario?.nome ?? "usuário"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Perfil: {usuario?.papel ?? "—"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Diárias pendentes de autorização</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {pendentesCount ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
