import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarImagemDeRota } from "@/lib/pdf/gerar-imagem";

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: locacao } = await supabase
    .from("veiculos_locacao_solicitacoes")
    .select("numero, ano")
    .eq("id", id)
    .single();

  if (!locacao) {
    return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 });
  }

  const filename = `locacao-veiculo-${locacao.numero}-${locacao.ano}.png`;

  return gerarImagemDeRota(request, `/veiculos/${id}/imprimir`, filename);
}
