import { createClient } from "@/lib/supabase/server";

export default async function PessoasPage() {
  const supabase = await createClient();
  const { data: pessoas, error } = await supabase
    .from("pessoas")
    .select("id, matricula, nome, cargo, categoria, ativo")
    .order("nome");

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Pessoas</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastro único de servidores e vereadores, compartilhado entre todos os módulos.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Erro ao carregar pessoas: {error.message}
        </p>
      )}

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Matrícula</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Nome</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Cargo</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Categoria</th>
              <th className="px-4 py-2 text-left font-medium text-slate-500">Situação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pessoas?.map((pessoa) => (
              <tr key={pessoa.id}>
                <td className="px-4 py-2 text-slate-700">{pessoa.matricula ?? "—"}</td>
                <td className="px-4 py-2 text-slate-900">{pessoa.nome}</td>
                <td className="px-4 py-2 text-slate-700">{pessoa.cargo}</td>
                <td className="px-4 py-2 text-slate-700">{pessoa.categoria}</td>
                <td className="px-4 py-2 text-slate-700">
                  {pessoa.ativo ? "Ativo" : "Inativo"}
                </td>
              </tr>
            ))}
            {pessoas?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Nenhuma pessoa cadastrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
