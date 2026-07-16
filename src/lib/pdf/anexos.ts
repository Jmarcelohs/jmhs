import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const BUCKET = "prestacoes-anexos";
const URL_VALIDA_SEGUNDOS = 300;

export async function carregarAnexosParaImpressao(
  supabase: SupabaseClient<Database>,
  prestacaoId: string,
) {
  const { data: anexos } = await supabase
    .from("diarias_prestacoes_anexos")
    .select("caminho, nome_original, tipo")
    .eq("prestacao_id", prestacaoId)
    .order("criado_em");

  const imagens = (anexos ?? []).filter((a) => a.tipo === "imagem");
  const documentos = (anexos ?? [])
    .filter((a) => a.tipo !== "imagem")
    .map((a) => ({ nome: a.nome_original }));

  const fotos = await Promise.all(
    imagens.map(async (imagem) => {
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(imagem.caminho, URL_VALIDA_SEGUNDOS);
      return { url: data?.signedUrl ?? "", nome: imagem.nome_original };
    }),
  );

  return { fotos: fotos.filter((f) => f.url), documentos };
}
