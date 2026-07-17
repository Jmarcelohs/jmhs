import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../print-button";
import { RequerimentoConteudo } from "../../requerimento-conteudo";

export default async function ImprimirReembolsoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: requerimento } = await supabase
    .from("requerimentos_reembolso")
    .select("*, pessoas(nome)")
    .eq("id", id)
    .single();

  if (!requerimento) notFound();

  const { data: sensivel } = await supabase
    .from("pessoas_dados_sensiveis")
    .select("cpf")
    .eq("pessoa_id", requerimento.pessoa_id)
    .maybeSingle();

  const pessoa = requerimento.pessoas as unknown as { nome: string } | null;

  return (
    <>
      <PrintButton
        url={`/api/requerimentos/${id}/pdf`}
        nomeArquivoPadrao={`requerimento-${requerimento.protocolo.replace("/", "-")}.pdf`}
      />
      <RequerimentoConteudo requerimento={requerimento} pessoa={pessoa} cpf={sensivel?.cpf ?? null} />
    </>
  );
}
