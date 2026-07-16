import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../../print-button";
import { AnexoIConteudo } from "../../../anexo-i-conteudo";
import { AnexoIIConteudo } from "../../../anexo-ii-conteudo";

export default async function ImprimirCompletoPage({
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

  const pessoaSolicitacao = solicitacao.pessoas as unknown as {
    matricula: string | null;
    nome: string;
    cargo: string;
    categoria: string;
  } | null;

  const pessoaPrestacao = prestacao.pessoas as unknown as { nome: string } | null;

  return (
    <>
      <PrintButton
        url={`/api/diarias/${id}/prestacao-contas/pdf-completo`}
        nomeArquivoPadrao={`anexo-i-e-ii-${id}.pdf`}
      />
      <AnexoIConteudo
        solicitacao={solicitacao}
        itens={itens ?? []}
        pessoa={pessoaSolicitacao}
        quebrarPagina
      />
      <AnexoIIConteudo
        prestacao={prestacao}
        pagamentos={pagamentos ?? []}
        pessoa={pessoaPrestacao}
      />
    </>
  );
}
