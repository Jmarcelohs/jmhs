import { createClient } from "@/lib/supabase/server";
import { SolicitacaoForm } from "../solicitacao-form";
import { criarSolicitacao } from "../actions";

export default async function NovaSolicitacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: pessoas }, { data: tabelaValores }] = await Promise.all([
    supabase.from("pessoas").select("id, nome, categoria").eq("ativo", true).order("nome"),
    supabase
      .from("diarias_tabela_valores")
      .select("tipo, faixa, categoria, valor")
      .order("faixa"),
  ]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-brand-navy">
        Nova solicitação de diária (Anexo I)
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Resolução nº 40/2023 (redação dada pela Resolução nº 44/2023).
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <SolicitacaoForm
        action={criarSolicitacao}
        pessoas={pessoas ?? []}
        tabelaValores={tabelaValores ?? []}
        submitLabel="Enviar solicitação"
      />
    </div>
  );
}
