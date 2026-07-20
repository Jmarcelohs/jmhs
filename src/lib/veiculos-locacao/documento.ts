import { formatarData, formatarMoeda } from "@/lib/pdf/formato";

const MESES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function dataPorExtenso(dataISO: string | null) {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return `${String(dia).padStart(2, "0")} de ${MESES[mes - 1]} de ${ano}`;
}

function formatarHora(hora: string | null) {
  if (!hora) return "—";
  return hora.slice(0, 5);
}

// Texto fixo de abertura e fechamento do ofício — a numeração e os
// campos abaixo é que variam por solicitação.
export function paragrafoAbertura(processo: string, locadora: string) {
  return (
    `Vimos, por meio desta, solicitar a locação de veículo conforme especificações abaixo, ` +
    `em atendimento ao ${processo}, junto à empresa ${locadora}.`
  );
}

export function paragrafoFechamento() {
  return (
    "Solicitamos a gentileza de confirmar a disponibilidade do veículo nas datas e condições " +
    "acima, bem como os procedimentos necessários para a retirada."
  );
}

export type CampoOficio = { label: string; valor: string };

// Lista de campos rótulo+valor do ofício, na ordem exata do documento.
// Sem valor total — o total (diária × quantidade) só existe no relatório,
// nunca no ofício enviado à locadora.
export function camposOficio({
  processo,
  locadora,
  solicitanteNome,
  condutorNome,
  veiculoDescricao,
  valorDiaria,
  dataRetirada,
  horaRetirada,
  localRetirada,
  dataDevolucao,
  horaDevolucao,
  localDevolucao,
  qtdDiarias,
}: {
  processo: string;
  locadora: string;
  solicitanteNome: string;
  condutorNome: string;
  veiculoDescricao: string;
  valorDiaria: number;
  dataRetirada: string | null;
  horaRetirada: string | null;
  localRetirada: string | null;
  dataDevolucao: string | null;
  horaDevolucao: string | null;
  localDevolucao: string | null;
  qtdDiarias: number;
}): CampoOficio[] {
  return [
    { label: "Processo", valor: processo },
    { label: "Locadora", valor: locadora },
    { label: "Solicitante", valor: solicitanteNome },
    { label: "Condutor", valor: condutorNome },
    { label: "Tipo de veículo", valor: veiculoDescricao },
    { label: "Valor licitado da diária", valor: formatarMoeda(valorDiaria) },
    {
      label: "Data/horário de retirada",
      valor: `${formatarData(dataRetirada)} às ${formatarHora(horaRetirada)}`,
    },
    { label: "Local de retirada", valor: localRetirada || "—" },
    {
      label: "Data/horário de devolução",
      valor: `${formatarData(dataDevolucao)} às ${formatarHora(horaDevolucao)}`,
    },
    { label: "Local de devolução", valor: localDevolucao || "—" },
    { label: "Quantidade estimada de diárias", valor: String(qtdDiarias) },
  ];
}

export function mensagemSolicitacaoVeiculo({
  numero,
  ano,
  dataPedido,
  processo,
  locadora,
  solicitanteNome,
  condutorNome,
  veiculoDescricao,
  valorDiaria,
  qtdDiarias,
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
  dataPedido: string | null;
  processo: string;
  locadora: string;
  solicitanteNome: string;
  condutorNome: string;
  veiculoDescricao: string;
  valorDiaria: number;
  qtdDiarias: number;
  dataRetirada: string | null;
  horaRetirada: string | null;
  localRetirada: string | null;
  dataDevolucao: string | null;
  horaDevolucao: string | null;
  localDevolucao: string | null;
  observacoes: string | null;
}) {
  const campos = camposOficio({
    processo,
    locadora,
    solicitanteNome,
    condutorNome,
    veiculoDescricao,
    valorDiaria,
    dataRetirada,
    horaRetirada,
    localRetirada,
    dataDevolucao,
    horaDevolucao,
    localDevolucao,
    qtdDiarias,
  });

  const linhas = [
    `Nepomuceno, ${dataPorExtenso(dataPedido)}.`,
    "",
    `SOLICITAÇÃO Nº ${numero}/${ano}`,
    "",
    "Prezados(as),",
    "",
    paragrafoAbertura(processo, locadora),
    "",
    ...campos.map((c) => `${c.label}: ${c.valor}`),
    "",
    paragrafoFechamento(),
  ];

  if (observacoes) {
    linhas.push("", `Observações: ${observacoes}`);
  }

  linhas.push("", "Atenciosamente,", "Câmara Municipal de Nepomuceno.");

  return linhas.join("\n");
}
