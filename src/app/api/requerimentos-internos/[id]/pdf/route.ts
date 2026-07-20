import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gerarPdfDeRota } from "@/lib/pdf/gerar-pdf";

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

  const { data: requerimento } = await supabase
    .from("requerimentos_internos")
    .select("numero, ano")
    .eq("id", id)
    .single();

  if (!requerimento) {
    return NextResponse.json({ error: "Requerimento não encontrado" }, { status: 404 });
  }

  const filename = `requerimento-${requerimento.numero}-${requerimento.ano}.pdf`;

  return gerarPdfDeRota(request, `/requerimentos-internos/${id}/imprimir`, filename);
}
