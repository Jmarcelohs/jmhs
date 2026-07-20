import { PaginaA4 } from "../celula";
import {
  camposOficio,
  dataPorExtenso,
  paragrafoAbertura,
  paragrafoFechamento,
} from "@/lib/veiculos-locacao/documento";

type Locacao = {
  numero: string;
  ano: number;
  data_pedido: string;
  processo: string;
  locadora: string;
  solicitante_nome: string;
  condutor_nome: string;
  veiculo_descricao: string;
  valor_diaria: number;
  qtd_diarias: number;
  data_retirada: string;
  hora_retirada: string | null;
  local_retirada: string | null;
  data_devolucao: string;
  hora_devolucao: string | null;
  local_devolucao: string | null;
  observacoes: string | null;
};

export function VeiculoLocacaoConteudo({
  locacao,
  quebrarPagina = true,
}: {
  locacao: Locacao;
  quebrarPagina?: boolean;
}) {
  const campos = camposOficio({
    processo: locacao.processo,
    locadora: locacao.locadora,
    solicitanteNome: locacao.solicitante_nome,
    condutorNome: locacao.condutor_nome,
    veiculoDescricao: locacao.veiculo_descricao,
    valorDiaria: locacao.valor_diaria,
    dataRetirada: locacao.data_retirada,
    horaRetirada: locacao.hora_retirada,
    localRetirada: locacao.local_retirada,
    dataDevolucao: locacao.data_devolucao,
    horaDevolucao: locacao.hora_devolucao,
    localDevolucao: locacao.local_devolucao,
    qtdDiarias: locacao.qtd_diarias,
  });

  return (
    <PaginaA4 quebrarPagina={quebrarPagina}>
      <div className="mx-[30mm] mt-[32.5mm] mb-[25mm] flex flex-1 flex-col text-[11pt] leading-relaxed">
        <p className="text-right">Nepomuceno, {dataPorExtenso(locacao.data_pedido)}.</p>

        <p className="mt-6 text-center text-[13pt] font-bold">
          SOLICITAÇÃO Nº {locacao.numero}/{locacao.ano}
        </p>

        <p className="mt-6">Prezados(as),</p>

        <p className="mt-3 text-justify">
          {paragrafoAbertura(locacao.processo, locacao.locadora)}
        </p>

        <div className="mt-4 space-y-1">
          {campos.map((c) => (
            <p key={c.label}>
              <span className="font-bold">{c.label}:</span> {c.valor}
            </p>
          ))}
        </div>

        {locacao.observacoes && (
          <p className="mt-4 text-justify">
            <span className="font-bold">Observações:</span> {locacao.observacoes}
          </p>
        )}

        <p className="mt-4 text-justify">{paragrafoFechamento()}</p>

        <p className="mt-8">Atenciosamente,</p>
        <p className="font-bold">Câmara Municipal de Nepomuceno.</p>
      </div>
    </PaginaA4>
  );
}
