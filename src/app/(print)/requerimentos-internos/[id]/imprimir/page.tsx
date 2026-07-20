import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../print-button";
import { RequerimentoInternoConteudo } from "../../requerimento-interno-conteudo";

export default async function ImprimirRequerimentoInternoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: requerimento } = await supabase
    .from("requerimentos_internos")
    .select("*")
    .eq("id", id)
    .single();

  if (!requerimento) notFound();

  return (
    <>
      <PrintButton
        url={`/api/requerimentos-internos/${id}/pdf`}
        nomeArquivoPadrao={`requerimento-${requerimento.numero}-${requerimento.ano}.pdf`}
      />
      <RequerimentoInternoConteudo requerimento={requerimento} />
    </>
  );
}
