import { createClient } from "@/lib/supabase/server";
import { ReembolsoForm } from "../reembolso-form";
import { criarReembolso } from "../actions";

export default async function NovoReembolsoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: pessoas }, { data: sensiveis }, { data: diarias }, { data: veiculos }] = await Promise.all([
    supabase.from("pessoas").select("id, nome, cargo, categoria").eq("ativo", true).order("nome"),
    supabase.from("pessoas_dados_sensiveis").select("pessoa_id, cpf"),
    supabase
      .from("diarias_solicitacoes")
      .select("id, pessoa_id, numero_diaria, municipio_destino")
      .eq("status", "Autorizado")
      .order("data_partida", { ascending: false }),
    supabase
      .from("veiculos_locacao_solicitacoes")
      .select("id, numero, ano, veiculo_descricao")
      .order("ano", { ascending: false })
      .order("numero", { ascending: false }),
  ]);

  const cpfPorPessoa = new Map((sensiveis ?? []).map((s) => [s.pessoa_id, s.cpf]));
  const pessoasComCpf = (pessoas ?? []).map((p) => ({
    ...p,
    cpf: cpfPorPessoa.get(p.id) ?? null,
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-brand-navy">Novo requerimento de reembolso</h1>
      <p className="mt-1 text-sm text-slate-500">
        Reembolso de Despesas — Art. 9º, da Resolução nº 40 de 04 de abril de 2023.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <ReembolsoForm
        action={criarReembolso}
        pessoas={pessoasComCpf}
        diarias={diarias ?? []}
        veiculos={veiculos ?? []}
      />
    </div>
  );
}
