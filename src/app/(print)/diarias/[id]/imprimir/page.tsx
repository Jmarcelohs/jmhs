import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../print-button";
import { AnexoIConteudo } from "../../anexo-i-conteudo";

export default async function ImprimirSolicitacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: solicitacao } = await supabase
    .from("diarias_solicitacoes")
    .select("*, pessoas(matricula, nome, cargo, categoria)")
    .eq("id", id)
    .single();

  if (!solicitacao) notFound();

  const { data: itens } = await supabase
    .from("diarias_itens")
    .select("*")
    .eq("solicitacao_id", id);

  const pessoa = solicitacao.pessoas as unknown as {
    matricula: string | null;
    nome: string;
    cargo: string;
    categoria: string;
  } | null;

  return (
    <>
      <PrintButton url={`/api/diarias/${id}/pdf`} nomeArquivoPadrao={`anexo-i-${id}.pdf`} />
      <AnexoIConteudo solicitacao={solicitacao} itens={itens ?? []} pessoa={pessoa} />
    </>
  );
}
