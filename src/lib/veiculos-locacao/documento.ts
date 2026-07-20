import { formatarData, formatarMoeda } from "@/lib/pdf/formato";

function formatarHora(hora: string | null) {
  if (!hora) return "—";
  return hora.slice(0, 5);
}

export function mensagemSolicitacaoVeiculo({
  numero,
  ano,
  processo,
  locadora,
  solicitanteNome,
  solicitanteCargo,
  condutorNome,
  condutorCargo,
  veiculoDescricao,
  valorDiaria,
  qtdDiarias,
  valorTotal,
  dataRetirada,
  horaRetirada,
  localRetirada,
  dataDevolucao,
  horaDevolucao,
  localDevolucao,
  observacoes,
}: {
  numero: string;
  ano: number;
  processo: string;
  locadora: string;
  solicitanteNome: string;
  solicitanteCargo: string | null;
  condutorNome: string;
  condutorCargo: string | null;
  veiculoDescricao: string;
  valorDiaria: number;
  qtdDiarias: number;
  valorTotal: number;
  dataRetirada: string | null;
  horaRetirada: string | null;
  localRetirada: string | null;
  dataDevolucao: string | null;
  horaDevolucao: string | null;
  localDevolucao: string | null;
  observacoes: string | null;
}) {
  const linhas = [
    `SOLICITAÇÃO DE LOCAÇÃO DE VEÍCULO Nº ${numero}/${ano}`,
    `Processo: ${processo} — Locadora: ${locadora}`,
    "",
    `Solicitante: ${solicitanteNome}${solicitanteCargo ? ` (${solicitanteCargo})` : ""}`,
    `Condutor: ${condutorNome}${condutorCargo ? ` (${condutorCargo})` : ""}`,
    "",
    `Veículo: ${veiculoDescricao}`,
    `Valor da diária: ${formatarMoeda(valorDiaria)} × ${qtdDiarias} = ${formatarMoeda(valorTotal)}`,
    "",
    `Retirada: ${formatarData(dataRetirada)} às ${formatarHora(horaRetirada)} — ${localRetirada ?? "—"}`,
    `Devolução: ${formatarData(dataDevolucao)} às ${formatarHora(horaDevolucao)} — ${localDevolucao ?? "—"}`,
  ];

  if (observacoes) {
    linhas.push("", `Observações: ${observacoes}`);
  }

  return linhas.join("\n");
}
