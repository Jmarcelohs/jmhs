import { Celula, headerCell, PaginaA4, TabelaGrid } from "../celula";
import { formatarData, formatarMoeda, valorPorExtenso } from "@/lib/pdf/formato";
import { FUNDAMENTO_REEMBOLSO, PRESIDENTE_PADRAO, SUBASSUNTO_TITULO } from "@/lib/reembolso/documento";
import type {
  CargoDeclarado,
  DecisaoRequerimentoReembolso,
  StatusRequerimentoReembolso,
  SubassuntoReembolso,
} from "@/lib/supabase/database.types";

type Requerimento = {
  protocolo: string;
  cargo_declarado: CargoDeclarado;
  data_requerimento: string | null;
  subassunto: SubassuntoReembolso;
  data_ida: string | null;
  data_volta: string | null;
  municipio: string;
  valor: number;
  status: StatusRequerimentoReembolso;
  decisao: DecisaoRequerimentoReembolso | null;
  decisao_data: string | null;
};

type Pessoa = { nome: string } | null;

function Checkbox({ marcado, label }: { marcado: boolean; label: string }) {
  return (
    <span className="mr-4">
      <span className="inline-block w-[4mm] border border-black text-center">
        {marcado ? "X" : ""}
      </span>{" "}
      {label}
    </span>
  );
}

export function RequerimentoConteudo({
  requerimento,
  pessoa,
  cpf,
  quebrarPagina = true,
}: {
  requerimento: Requerimento;
  pessoa: Pessoa;
  cpf: string | null;
  quebrarPagina?: boolean;
}) {
  return (
    <PaginaA4 quebrarPagina={quebrarPagina}>
      <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
        <p className="text-center text-[11pt] font-semibold">
          REQUERIMENTO Nº {requerimento.protocolo}
        </p>
        <p className="mt-1 text-center text-[9pt]">
          {SUBASSUNTO_TITULO[requerimento.subassunto]}
        </p>

        <TabelaGrid className="mt-4">
          <Celula span={6} className={headerCell}>Nome do requerente</Celula>
          <Celula span={3} className={headerCell}>Cargo</Celula>
          <Celula span={3} className={headerCell}>CPF</Celula>

          <Celula span={6}>{pessoa?.nome ?? "—"}</Celula>
          <Celula span={3} className="text-center">{requerimento.cargo_declarado}</Celula>
          <Celula span={3} className="text-center">{cpf ?? "—"}</Celula>

          <Celula span={4} className={headerCell}>Data do requerimento</Celula>
          <Celula span={4} className={headerCell}>Município</Celula>
          <Celula span={4} className={headerCell}>Período da viagem</Celula>

          <Celula span={4} className="text-center">
            {formatarData(requerimento.data_requerimento)}
          </Celula>
          <Celula span={4} className="text-center">{requerimento.municipio}</Celula>
          <Celula span={4} className="text-center">
            {formatarData(requerimento.data_ida)} a {formatarData(requerimento.data_volta)}
          </Celula>

          <Celula span={12} className={headerCell}>Valor solicitado</Celula>
          <Celula span={12} className="text-center">
            {formatarMoeda(requerimento.valor)} ({valorPorExtenso(requerimento.valor)})
          </Celula>
        </TabelaGrid>

        <p className="mt-6 text-[9pt] leading-relaxed text-justify">
          Excelentíssimo Senhor Presidente da Câmara Municipal de Nepomuceno/MG,
        </p>
        <p className="mt-3 text-[9pt] leading-relaxed text-justify">
          {pessoa?.nome ?? "—"}, {requerimento.cargo_declarado}, portador(a) do CPF nº{" "}
          {cpf ?? "—"}, vem respeitosamente requerer a Vossa Excelência, com fundamento no{" "}
          {FUNDAMENTO_REEMBOLSO}, o reembolso de despesas com{" "}
          {SUBASSUNTO_TITULO[requerimento.subassunto].toLowerCase()}, referentes à viagem ao
          município de {requerimento.municipio}, realizada no período de{" "}
          {formatarData(requerimento.data_ida)} a {formatarData(requerimento.data_volta)}, no
          valor de {formatarMoeda(requerimento.valor)} (
          {valorPorExtenso(requerimento.valor)}), solicitando o pagamento pelos meios de praxe.
        </p>

        <p className="mt-6 text-center text-[9pt]">Termos em que pede deferimento.</p>
        <p className="mt-1 text-right text-[9pt]">
          Nepomuceno/MG, {formatarData(requerimento.data_requerimento)}.
        </p>

        <div className="mt-[16mm] text-center text-[9pt]">
          <div className="mx-auto w-[90mm] border-t border-black pt-1">
            Assinatura do requerente
          </div>
        </div>

        <div className="mt-[14mm] border-t border-black pt-3 text-[9pt]">
          <p className="font-semibold">Decisão do Presidente</p>
          <p className="mt-2">
            <Checkbox marcado={requerimento.decisao === "autorizado"} label="Autorizo" />
            <Checkbox marcado={requerimento.decisao === "nao_autorizado"} label="Não autorizo" />
            <Checkbox marcado={requerimento.status === "analise"} label="Em análise" />
          </p>
          <p className="mt-4 text-right">
            Nepomuceno/MG, {formatarData(requerimento.decisao_data)}.
          </p>
          <div className="mx-auto mt-[14mm] w-[90mm] border-t border-black pt-1 text-center">
            {PRESIDENTE_PADRAO} — Presidente
          </div>
        </div>
      </div>
    </PaginaA4>
  );
}
