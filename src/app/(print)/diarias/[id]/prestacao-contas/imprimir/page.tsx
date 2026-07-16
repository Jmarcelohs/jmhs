import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../../print-button";
import { AnexoIIConteudo } from "../../../anexo-ii-conteudo";
import { carregarAnexosParaImpressao } from "@/lib/pdf/anexos";

export default async function ImprimirPrestacaoContasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prestacao } = await supabase
    .from("diarias_prestacoes_contas")
    .select("*, pessoas(nome)")
    .eq("solicitacao_id", id)
    .single();

  if (!prestacao) notFound();

  const { data: pagamentos } = await supabase
    .from("diarias_prestacoes_pagamentos")
    .select("*")
    .eq("prestacao_id", prestacao.id);

  const pessoa = prestacao.pessoas as unknown as { nome: string } | null;
  const { fotos, documentos } = await carregarAnexosParaImpressao(supabase, prestacao.id);

  return (
    <>
      <PrintButton
        url={`/api/diarias/${id}/prestacao-contas/pdf`}
        nomeArquivoPadrao={`anexo-ii-${id}.pdf`}
      />
      <AnexoIIConteudo
        prestacao={prestacao}
        pagamentos={pagamentos ?? []}
        pessoa={pessoa}
        fotos={fotos}
        documentos={documentos}
      />
    </>
  );
}
