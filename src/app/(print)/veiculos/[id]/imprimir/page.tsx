import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../print-button";
import { VeiculoLocacaoConteudo } from "../../veiculo-locacao-conteudo";

export default async function ImprimirLocacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: locacao } = await supabase
    .from("veiculos_locacao_solicitacoes")
    .select("*")
    .eq("id", id)
    .single();

  if (!locacao) notFound();

  return (
    <>
      <PrintButton
        url={`/api/veiculos/${id}/pdf`}
        nomeArquivoPadrao={`locacao-veiculo-${locacao.numero}-${locacao.ano}.pdf`}
      />
      <VeiculoLocacaoConteudo locacao={locacao} />
    </>
  );
}
