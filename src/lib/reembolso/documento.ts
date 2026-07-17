import { formatarData, formatarMoeda, valorPorExtenso } from "@/lib/pdf/formato";
import type { SubassuntoReembolso } from "@/lib/supabase/database.types";

export const FUNDAMENTO_REEMBOLSO = "Art. 9º, da Resolução nº 40 de 04 de abril de 2023";

export const PRESIDENTE_PADRAO = "Tullio Ian Marangoni de Morais";

export const SUBASSUNTO_LABEL: Record<SubassuntoReembolso, string> = {
  locomocao: "despesas com locomoção",
  combustivel: "despesas com combustível",
  passagem_aerea: "despesas com passagem aérea",
  passagem_onibus: "despesas com passagem de ônibus",
};

export const SUBASSUNTO_TITULO: Record<SubassuntoReembolso, string> = {
  locomocao: "Reembolso de Despesas com Locomoção",
  combustivel: "Reembolso de Despesas com Combustível",
  passagem_aerea: "Reembolso de Despesas com Passagem Aérea",
  passagem_onibus: "Reembolso de Despesas com Passagem de Ônibus",
};

export function buildReferenteA(subassunto: SubassuntoReembolso) {
  return `Reembolso de Despesas — ${SUBASSUNTO_LABEL[subassunto]}`;
}

export function corpoReembolso({
  nome,
  cargoDeclarado,
  cpf,
  subassunto,
  dataIda,
  dataVolta,
  municipio,
  valor,
}: {
  nome: string;
  cargoDeclarado: string;
  cpf: string | null;
  subassunto: SubassuntoReembolso;
  dataIda: string | null;
  dataVolta: string | null;
  municipio: string;
  valor: number;
}) {
  const nomeTexto = nome || "[solicitante]";
  const municipioTexto = municipio || "[município]";

  return (
    `${nomeTexto}, ${cargoDeclarado}, portador(a) do CPF nº ${cpf ?? "—"}, vem respeitosamente ` +
    `requerer a Vossa Excelência, com fundamento no ${FUNDAMENTO_REEMBOLSO}, o reembolso de ` +
    `${SUBASSUNTO_LABEL[subassunto]}, referentes à viagem ao município de ${municipioTexto}, ` +
    `realizada no período de ${formatarData(dataIda)} a ${formatarData(dataVolta)}, no valor de ` +
    `${formatarMoeda(valor)} (${valorPorExtenso(valor)}), solicitando o pagamento pelos meios de praxe.`
  );
}
