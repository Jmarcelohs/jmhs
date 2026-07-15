import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage() {
  const usuario = await getCurrentUsuario();
  const supabase = await createClient();

  const { data: solicitacoes } = await supabase
    .from("diarias_solicitacoes")
    .select("status, total, pessoas(nome)");

  const lista = solicitacoes ?? [];

  const solicitadas = lista.filter((s) => s.status === "Solicitado").length;
  const autorizadas = lista.filter((s) => s.status === "Autorizado").length;
  const indeferidas = lista.filter((s) => s.status === "Indeferido").length;
  const valorAutorizado = lista
    .filter((s) => s.status === "Autorizado")
    .reduce((acc, s) => acc + Number(s.total ?? 0), 0);

  const porSolicitante = new Map<
    string,
    { total: number; autorizadas: number; valorAutorizado: number }
  >();

  for (const s of lista) {
    const nome = (s.pessoas as unknown as { nome: string } | null)?.nome ?? "—";
    const atual = porSolicitante.get(nome) ?? { total: 0, autorizadas: 0, valorAutorizado: 0 };
    atual.total += 1;
    if (s.status === "Autorizado") {
      atual.autorizadas += 1;
      atual.valorAutorizado += Number(s.total ?? 0);
    }
    porSolicitante.set(nome, atual);
  }

  const ranking = Array.from(porSolicitante.entries()).sort((a, b) => b[1].total - a[1].total);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        Olá, {usuario?.nome ?? "usuário"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Perfil: {usuario?.papel ?? "—"}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Diárias pendentes de autorização</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{solicitadas}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Diárias autorizadas</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{autorizadas}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Diárias indeferidas</p>
          <p className="mt-2 text-2xl font-semibold text-red-600">{indeferidas}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">Valor total autorizado</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatarMoeda(valorAutorizado)}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-base font-semibold text-slate-900">Diárias por solicitante</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Solicitante</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Total de diárias</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Autorizadas</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Valor autorizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ranking.map(([nome, dados]) => (
              <tr key={nome}>
                <td className="px-4 py-2 text-slate-900">{nome}</td>
                <td className="px-4 py-2 text-slate-700">{dados.total}</td>
                <td className="px-4 py-2 text-slate-700">{dados.autorizadas}</td>
                <td className="px-4 py-2 text-slate-700">{formatarMoeda(dados.valorAutorizado)}</td>
              </tr>
            ))}
            {ranking.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  Nenhuma solicitação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
