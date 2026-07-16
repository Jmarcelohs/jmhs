// Verificações informativas do art. 4º da Resolução 40/2023. Nenhuma delas
// bloqueia a autorização — a própria resolução permite flexibilização a
// critério do Presidente/ordenador da despesa. Servem só de alerta.
//
// "Dotação orçamentária" fica de fora por completo: o sistema não tem
// nenhum módulo de orçamento/empenho, então não há como verificar isso
// automaticamente. Continua sendo checagem manual de quem autoriza.

export function diasUteisEntre(dataInicio: string, dataFim: string): number {
  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T00:00:00`);
  let count = 0;
  const cursor = new Date(inicio);
  while (cursor < fim) {
    cursor.setDate(cursor.getDate() + 1);
    const diaSemana = cursor.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) count++;
  }
  return count;
}

export type Verificacao = {
  titulo: string;
  status: "ok" | "atencao" | "indisponivel";
  descricao: string;
};

export function calcularVerificacoes({
  dataSolicitacao,
  dataPartida,
  faixasItens,
  temPendenciaAnterior,
}: {
  dataSolicitacao: string | null;
  dataPartida: string | null;
  faixasItens: string[];
  temPendenciaAnterior: boolean;
}): Verificacao[] {
  const verificacoes: Verificacao[] = [];

  if (dataSolicitacao && dataPartida) {
    const dias = diasUteisEntre(dataSolicitacao, dataPartida);
    verificacoes.push({
      titulo: "Prazo de 2 dias úteis (art. 4º)",
      status: dias >= 2 ? "ok" : "atencao",
      descricao:
        dias >= 2
          ? `${dias} dia(s) útil(eis) entre a solicitação e a partida.`
          : `Só ${dias} dia(s) útil(eis) entre a solicitação e a partida — abaixo do prazo mínimo de 2 dias úteis.`,
    });
  } else {
    verificacoes.push({
      titulo: "Prazo de 2 dias úteis (art. 4º)",
      status: "indisponivel",
      descricao: "Data da solicitação ou de partida não informada.",
    });
  }

  const temFaixaCurta = faixasItens.includes("Até 60 km");
  verificacoes.push({
    titulo: "Distância/tempo mínimo (art. 4º)",
    status: temFaixaCurta ? "atencao" : "ok",
    descricao: temFaixaCurta
      ? "Faixa \"Até 60 km\" selecionada — abaixo do mínimo de 60km/6h para diária; exige justificativa de urgência ou considerar reembolso."
      : "Nenhum item na faixa \"Até 60 km\".",
  });

  verificacoes.push({
    titulo: "Prestações de contas anteriores (art. 4º)",
    status: temPendenciaAnterior ? "atencao" : "ok",
    descricao: temPendenciaAnterior
      ? "Há diária(s) autorizada(s) anteriormente para esta pessoa sem prestação de contas concluída."
      : "Nenhuma pendência de prestação de contas anterior.",
  });

  verificacoes.push({
    titulo: "Dotação orçamentária (art. 4º)",
    status: "indisponivel",
    descricao:
      "O sistema não tem módulo de orçamento — confirme manualmente a existência de dotação orçamentária antes de autorizar.",
  });

  return verificacoes;
}
