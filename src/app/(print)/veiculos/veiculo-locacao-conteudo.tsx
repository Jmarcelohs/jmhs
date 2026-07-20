import { Celula, headerCell, PaginaA4, TabelaGrid } from "../celula";
import { formatarData, formatarMoeda } from "@/lib/pdf/formato";

function formatarHora(hora: string | null) {
  if (!hora) return "—";
  return hora.slice(0, 5);
}

type Locacao = {
  numero: string;
  ano: number;
  data_pedido: string;
  processo: string;
  locadora: string;
  solicitante_nome: string;
  solicitante_cargo: string | null;
  condutor_nome: string;
  condutor_cargo: string | null;
  veiculo_descricao: string;
  valor_diaria: number;
  qtd_diarias: number;
  valor_total: number;
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
  return (
    <PaginaA4 quebrarPagina={quebrarPagina}>
      <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
        <p className="text-center text-[11pt] font-semibold">
          SOLICITAÇÃO DE LOCAÇÃO DE VEÍCULO Nº {locacao.numero}/{locacao.ano}
        </p>
        <p className="mt-1 text-center text-[9pt]">
          {locacao.processo} — Locadora {locacao.locadora}
        </p>

        <TabelaGrid className="mt-4">
          <Celula span={6} className={headerCell}>Solicitante</Celula>
          <Celula span={6} className={headerCell}>Condutor</Celula>

          <Celula span={6}>
            {locacao.solicitante_nome}
            {locacao.solicitante_cargo ? ` — ${locacao.solicitante_cargo}` : ""}
          </Celula>
          <Celula span={6}>
            {locacao.condutor_nome}
            {locacao.condutor_cargo ? ` — ${locacao.condutor_cargo}` : ""}
          </Celula>

          <Celula span={12} className={headerCell}>Veículo</Celula>
          <Celula span={12}>{locacao.veiculo_descricao}</Celula>

          <Celula span={4} className={headerCell}>Valor da diária</Celula>
          <Celula span={4} className={headerCell}>Qtd. diárias</Celula>
          <Celula span={4} className={headerCell}>Valor total</Celula>

          <Celula span={4} className="text-center">{formatarMoeda(locacao.valor_diaria)}</Celula>
          <Celula span={4} className="text-center">{locacao.qtd_diarias}</Celula>
          <Celula span={4} className="text-center font-semibold">
            {formatarMoeda(locacao.valor_total)}
          </Celula>

          <Celula span={6} className={headerCell}>Retirada</Celula>
          <Celula span={6} className={headerCell}>Devolução</Celula>

          <Celula span={6}>
            {formatarData(locacao.data_retirada)} às {formatarHora(locacao.hora_retirada)}
            <br />
            {locacao.local_retirada ?? "—"}
          </Celula>
          <Celula span={6}>
            {formatarData(locacao.data_devolucao)} às {formatarHora(locacao.hora_devolucao)}
            <br />
            {locacao.local_devolucao ?? "—"}
          </Celula>

          {locacao.observacoes && (
            <>
              <Celula span={12} className={headerCell}>Observações</Celula>
              <Celula span={12} className="min-h-[16mm] align-top whitespace-pre-wrap">
                {locacao.observacoes}
              </Celula>
            </>
          )}
        </TabelaGrid>

        <p className="mt-6 text-right text-[9pt]">
          Nepomuceno/MG, {formatarData(locacao.data_pedido)}.
        </p>

        <div className="mt-[16mm] text-center text-[9pt]">
          <div className="mx-auto w-[90mm] border-t border-black pt-1">
            Assinatura do solicitante
          </div>
        </div>
      </div>
    </PaginaA4>
  );
}
