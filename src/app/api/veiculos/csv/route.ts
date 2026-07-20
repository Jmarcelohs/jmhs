import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(valor: string) {
  if (/[",\n]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`;
  }
  return valor;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const ano = request.nextUrl.searchParams.get("ano");
  const solicitante = request.nextUrl.searchParams.get("solicitante");

  let query = supabase
    .from("veiculos_locacao_solicitacoes")
    .select(
      "numero, ano, data_pedido, processo, locadora, solicitante_nome, condutor_nome, veiculo_descricao, valor_diaria, qtd_diarias, valor_total, data_retirada, data_devolucao",
    )
    .order("ano", { ascending: false })
    .order("numero", { ascending: false });

  if (ano) query = query.eq("ano", Number(ano));
  if (solicitante) query = query.ilike("solicitante_nome", `%${solicitante}%`);

  const { data: locacoes, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cabecalho = [
    "Número",
    "Ano",
    "Data do pedido",
    "Processo",
    "Locadora",
    "Solicitante",
    "Condutor",
    "Veículo",
    "Valor diária",
    "Qtd. diárias",
    "Valor total",
    "Data retirada",
    "Data devolução",
  ];

  const linhas = (locacoes ?? []).map((l) =>
    [
      l.numero,
      String(l.ano),
      l.data_pedido,
      l.processo,
      l.locadora,
      l.solicitante_nome,
      l.condutor_nome,
      l.veiculo_descricao,
      String(l.valor_diaria),
      String(l.qtd_diarias),
      String(l.valor_total),
      l.data_retirada,
      l.data_devolucao,
    ]
      .map((campo) => csvEscape(String(campo ?? "")))
      .join(","),
  );

  const csv = [cabecalho.join(","), ...linhas].join("\r\n");
  const bom = "﻿";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="locacao-veiculos.csv"`,
    },
  });
}
