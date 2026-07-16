import { Celula, headerCell, PaginaA4, TabelaGrid } from "../celula";
import { formatarData, formatarMoeda } from "@/lib/pdf/formato";

type Solicitacao = {
  numero_diaria: string | null;
  numero_solicitacao: string | null;
  fundamento_legal: string;
  data_solicitacao: string | null;
  data_partida: string | null;
  data_chegada: string | null;
  municipio_origem: string;
  municipio_destino: string | null;
  instituicao_destino: string | null;
  contato_destino: string | null;
  finalidade: string | null;
  data_autorizacao: string | null;
  total: number;
};

type Item = {
  id: string;
  modo: string;
  tipo: string | null;
  faixa: string | null;
  descricao_manual: string | null;
  quantidade: number;
  valor_unitario: number;
};

type Pessoa = { nome: string; cargo: string } | null;

export function AnexoIConteudo({
  solicitacao,
  itens,
  pessoa,
  quebrarPagina = true,
}: {
  solicitacao: Solicitacao;
  itens: Item[];
  pessoa: Pessoa;
  quebrarPagina?: boolean;
}) {
  const itensTabela = itens.filter((i) => i.modo === "tabela");
  const itensManuais = itens.filter((i) => i.modo === "manual");

  const comPernoite = itensTabela.filter((i) => i.tipo === "comPernoite");
  const semPernoite = itensTabela.filter((i) => i.tipo === "semPernoite");

  const somar = (lista: typeof itensTabela) => ({
    qtde: lista.reduce((acc, i) => acc + i.quantidade, 0),
    valor: lista.reduce((acc, i) => acc + i.quantidade * Number(i.valor_unitario), 0),
  });

  const totalComPernoite = somar(comPernoite);
  const totalSemPernoite = somar(semPernoite);

  return (
    <PaginaA4 quebrarPagina={quebrarPagina}>
      <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
        <p className="text-center text-[9pt] font-semibold">
          ANEXO II da Resolução nº 040 de 04 de abril de 2023
        </p>

        <TabelaGrid className="mt-4">
          <Celula span={12} className={`${headerCell} text-[10pt]`}>
            SOLICITAÇÃO DE RECURSOS PARA VIAGEM – Diária nº {solicitacao.numero_diaria ?? ""}
          </Celula>

          <Celula span={6} className={headerCell}>Nome do solicitante</Celula>
          <Celula span={3} className={headerCell}>Cargo / Função</Celula>
          <Celula span={3} className={headerCell}>Nº solicitação</Celula>

          <Celula span={6}>{pessoa?.nome ?? "—"}</Celula>
          <Celula span={3} className="text-center">
            {pessoa?.cargo ?? "—"}
          </Celula>
          <Celula span={3} className="text-center">
            {solicitacao.numero_solicitacao ?? "—"}
          </Celula>

          <Celula span={3} className={headerCell}>Fundamento Legal</Celula>
          <Celula span={3} className={headerCell}>Data da solicitação</Celula>
          <Celula span={3} className={headerCell}>Data de partida</Celula>
          <Celula span={3} className={headerCell}>Data de chegada</Celula>

          <Celula span={3} className="text-center">
            {solicitacao.fundamento_legal}
          </Celula>
          <Celula span={3} className="text-center">
            {formatarData(solicitacao.data_solicitacao)}
          </Celula>
          <Celula span={3} className="text-center">
            {formatarData(solicitacao.data_partida)}
          </Celula>
          <Celula span={3} className="text-center">
            {formatarData(solicitacao.data_chegada)}
          </Celula>

          <Celula span={3} className={headerCell}>Município Origem</Celula>
          <Celula span={3} className={headerCell}>Município Destino</Celula>
          <Celula span={3} className={headerCell}>Instituição Destino</Celula>
          <Celula span={3} className={headerCell}>Contato destino</Celula>

          <Celula span={3}>{solicitacao.municipio_origem}</Celula>
          <Celula span={3}>{solicitacao.municipio_destino ?? "—"}</Celula>
          <Celula span={3}>{solicitacao.instituicao_destino ?? "—"}</Celula>
          <Celula span={3}>{solicitacao.contato_destino ?? "—"}</Celula>

          <Celula span={12} className={headerCell}>
            Finalidade da viagem – justificativa plausível
          </Celula>
          <Celula span={12} className="min-h-[22mm] align-top">
            {solicitacao.finalidade ?? ""}
          </Celula>

          <Celula span={6} className={headerCell}>Descrição</Celula>
          <Celula span={2} className={headerCell}>Qtde.</Celula>
          <Celula span={4} className={headerCell}>Valor</Celula>

          <Celula span={6}>Valor solicitado em diárias com pernoite</Celula>
          <Celula span={2} className="text-center">
            {totalComPernoite.qtde || ""}
          </Celula>
          <Celula span={4} className="text-center">
            {formatarMoeda(totalComPernoite.valor)}
          </Celula>

          <Celula span={6}>Valor solicitado em diárias sem pernoite</Celula>
          <Celula span={2} className="text-center">
            {totalSemPernoite.qtde || ""}
          </Celula>
          <Celula span={4} className="text-center">
            {formatarMoeda(totalSemPernoite.valor)}
          </Celula>

          {itensManuais.map((item) => (
            <div key={item.id} className="col-span-12 grid grid-cols-12">
              <Celula span={6}>{item.descricao_manual}</Celula>
              <Celula span={2} className="text-center">
                {item.quantidade}
              </Celula>
              <Celula span={4} className="text-center">
                {formatarMoeda(item.quantidade * Number(item.valor_unitario))}
              </Celula>
            </div>
          ))}

          <Celula span={6} className="font-semibold">
            Total do valor solicitado em diárias
          </Celula>
          <Celula span={6} className="text-center font-semibold">
            {formatarMoeda(solicitacao.total)}
          </Celula>

          <Celula span={6} className={headerCell}>Solicitante</Celula>
          <Celula span={6} className={headerCell}>
            Autorização do ordenador da despesa
          </Celula>

          <Celula span={6} className="min-h-[30mm] text-center">
            <p>Termos em que peço deferimento</p>
            <p>{formatarData(solicitacao.data_solicitacao)}</p>
            <div className="mt-[14mm] border-t border-black pt-1">
              Assinatura do Solicitante
            </div>
          </Celula>
          <Celula span={6} className="min-h-[30mm] text-center">
            <p>Autorizo a concessão da diária.</p>
            <p>{formatarData(solicitacao.data_autorizacao)}</p>
            <div className="mt-[14mm] border-t border-black pt-1">
              Assinatura do ordenador da despesa
            </div>
          </Celula>
        </TabelaGrid>
      </div>
    </PaginaA4>
  );
}
