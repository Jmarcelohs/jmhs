import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";
import { editarRequerimentoInterno } from "../../actions";
import { RequerimentoInternoForm } from "../../requerimento-form";
import type { CargoDeclarado } from "@/lib/supabase/database.types";

export default async function EditarRequerimentoInternoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const usuario = await getCurrentUsuario();

  const { data: requerimento } = await supabase
    .from("requerimentos_internos")
    .select("*")
    .eq("id", id)
    .single();

  if (!requerimento) notFound();

  const { data: minhaPessoa } = usuario
    ? await supabase.from("pessoas").select("id").eq("usuario_id", usuario.id).maybeSingle()
    : { data: null };

  const podeEditar =
    usuario?.papel === "admin" ||
    usuario?.papel === "ordenador_despesa" ||
    (requerimento.pessoa_id && minhaPessoa?.id === requerimento.pessoa_id);
  if (!podeEditar) redirect(`/requerimentos-internos/${id}`);

  const [{ data: pessoas }, { data: sensiveis }] = await Promise.all([
    supabase.from("pessoas").select("id, nome, matricula, cargo, categoria").eq("ativo", true).order("nome"),
    supabase.from("pessoas_dados_sensiveis").select("pessoa_id, cpf"),
  ]);

  const cpfPorPessoa = new Map((sensiveis ?? []).map((s) => [s.pessoa_id, s.cpf]));
  const pessoasComCpf = (pessoas ?? []).map((p) => ({
    ...p,
    cpf: cpfPorPessoa.get(p.id) ?? null,
  }));

  const assuntoPreCadastrado = Boolean(requerimento.assunto_key);

  return (
    <div>
      <h1 className="text-xl font-semibold text-brand-navy">
        Editar requerimento {requerimento.numero}/{requerimento.ano}
      </h1>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <RequerimentoInternoForm
        action={editarRequerimentoInterno.bind(null, id)}
        pessoas={pessoasComCpf}
        submitLabel="Salvar alterações"
        valoresIniciais={{
          numero: requerimento.numero,
          tipo: requerimento.tipo,
          pessoa_id: requerimento.pessoa_id ?? "",
          nome: requerimento.nome,
          cargo: requerimento.cargo as CargoDeclarado,
          cpf: requerimento.cpf ?? "",
          matricula: requerimento.matricula ?? "",
          data_requerimento: requerimento.data_requerimento,
          assunto_key: requerimento.assunto_key ?? "",
          assuntoTitulo: assuntoPreCadastrado ? "" : requerimento.assunto,
          fundamento: requerimento.fundamento ?? "",
          campos: (requerimento.campos as Record<string, string>) ?? {},
          pedido: requerimento.pedido ?? "",
          referente_a: requerimento.referente_a ?? "",
          valor: requerimento.valor != null ? String(requerimento.valor) : "",
        }}
      />
    </div>
  );
}
