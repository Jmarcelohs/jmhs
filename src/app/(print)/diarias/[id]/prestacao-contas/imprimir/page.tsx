import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "../../../../print-button";
import { Celula, headerCell, PaginaA4 } from "../../../../celula";
import { formatarData, formatarMoeda } from "@/lib/pdf/formato";

const PARECER_LABEL: Record<string, string> = {
  aprovacao_sem_ressalvas: "APROVAÇÃO sem ressalvas",
  aprovacao_com_ressalvas: "APROVAÇÃO com ressalvas",
  reprovacao: "REPROVAÇÃO",
};

export default async function ImprimirPrestacaoContasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prestacao } = await supabase
    .from("diarias_prestacoes_contas")
    .select("*, pessoas(nome)")
    .eq("solicitacao_id", id)
    .single();

  if (!prestacao) notFound();

  const { data: pagamentos } = await supabase
    .from("diarias_prestacoes_pagamentos")
    .select("*")
    .eq("prestacao_id", prestacao.id);

  const pessoa = prestacao.pessoas as unknown as { nome: string } | null;

  return (
    <>
      <PrintButton
        url={`/api/diarias/${id}/prestacao-contas/pdf`}
        nomeArquivoPadrao={`anexo-ii-${id}.pdf`}
      />

      <PaginaA4>
        <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
          <p className="text-center text-[10pt] font-semibold">ANEXO II</p>
          <p className="text-center text-[9pt]">
            ANEXO II da Resolução nº 040 de 04 de abril de 2023
          </p>

          <div className="mt-4 grid grid-cols-12">
            <Celula span={12} className={`${headerCell} text-[10pt]`}>
              PRESTAÇÃO DE CONTAS DE DIÁRIA DE VIAGEM
            </Celula>

            <Celula span={8} className={headerCell}>Nome do solicitante</Celula>
            <Celula span={4} className={headerCell}>Nº solicitação</Celula>

            <Celula span={8}>{pessoa?.nome ?? "—"}</Celula>
            <Celula span={4} className="text-center">
              {prestacao.numero_solicitacao ?? "—"}
            </Celula>

            <Celula span={3} className={headerCell}>Fundamento Legal</Celula>
            <Celula span={3} className={headerCell}>Data da solicitação</Celula>
            <Celula span={3} className={headerCell}>Data de partida</Celula>
            <Celula span={3} className={headerCell}>Data de chegada</Celula>

            <Celula span={3} className="text-center">
              {prestacao.fundamento_legal}
            </Celula>
            <Celula span={3} className="text-center">
              {formatarData(prestacao.data_solicitacao)}
            </Celula>
            <Celula span={3} className="text-center">
              {formatarData(prestacao.data_partida)}
            </Celula>
            <Celula span={3} className="text-center">
              {formatarData(prestacao.data_chegada)}
            </Celula>

            <Celula span={12} className={`${headerCell} leading-tight`}>
              RELATÓRIO DO RESULTADO DA VIAGEM
              <br />
              COM ÊNFASE NO INTERESSE PÚBLICO DEFENDIDO
            </Celula>
            <Celula span={12} className="min-h-[140mm] align-top whitespace-pre-wrap">
              {prestacao.relatorio_resultado}
            </Celula>
          </div>
        </div>
      </PaginaA4>

      <PaginaA4>
        <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
          <div className="grid grid-cols-12">
            <Celula span={12} className={`${headerCell} text-[10pt]`}>
              DEMONSTRATIVO FINANCEIRO
            </Celula>

            <Celula span={6} className={headerCell}>Débito - Valores realizados</Celula>
            <Celula span={6} className={`${headerCell} leading-tight`}>
              Crédito - Valores recebidos
              <br />e a receber ou restituir
            </Celula>

            <Celula span={4}>Diárias previstas e realizadas</Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.debito_diarias_previstas)}
            </Celula>
            <Celula span={4}>Diárias recebidas antecipadamente</Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.credito_recebidas_antecipadamente)}
            </Celula>

            <Celula span={4}>Diárias não previstas, mas realizadas</Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.debito_diarias_nao_previstas)}
            </Celula>
            <Celula span={4}>Reembolsar diárias realizadas e não recebidas</Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.credito_reembolsar)}
            </Celula>

            <Celula span={4}>Despesas com transporte aéreo</Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.debito_transporte_aereo)}
            </Celula>
            <Celula span={4}>
              Despesas com transporte urbano, pedágio, combustível e estacionamento
            </Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.credito_transporte_urbano)}
            </Celula>

            <Celula span={4}>
              Despesas com transporte urbano, pedágio, combustível e estacionamento
            </Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.debito_transporte_urbano)}
            </Celula>
            <Celula span={4}>Devolver diárias recebidas e não realizadas (-)</Celula>
            <Celula span={2} className="text-center">
              {formatarMoeda(prestacao.credito_devolver)}
            </Celula>

            <Celula span={4} className="font-semibold">TOTAL DO DÉBITO</Celula>
            <Celula span={2} className="text-center font-semibold">
              {formatarMoeda(prestacao.total_debito)}
            </Celula>
            <Celula span={4} className="font-semibold">TOTAL DO CRÉDITO</Celula>
            <Celula span={2} className="text-center font-semibold">
              {formatarMoeda(prestacao.total_credito)}
            </Celula>

            <Celula span={12} className={headerCell}>
              Autenticação do beneficiário dos recursos da viagem
            </Celula>
            <Celula span={12} className="min-h-[22mm] text-center">
              <p>Declaro, sob as penas da lei, que as informações declaradas são verídicas.</p>
              <p className="mt-2">{formatarData(prestacao.data_autenticacao_beneficiario)}</p>
              <div className="mx-auto mt-[10mm] w-2/3 border-t border-black pt-1">
                Assinatura do beneficiário
              </div>
            </Celula>

            <Celula span={6} className={headerCell}>Aprovação do ordenador da despesa</Celula>
            <Celula span={6} className={headerCell}>Baixa do pagamento</Celula>

            <Celula span={6} className="min-h-[28mm] text-center">
              <p>Aprovo a prestação de contas apresentada.</p>
              <p className="mt-2">{formatarData(prestacao.data_aprovacao_ordenador)}</p>
              <div className="mx-auto mt-[8mm] w-2/3 border-t border-black pt-1">
                Assinatura do ordenador da despesa
              </div>
            </Celula>
            <Celula span={6} className="min-h-[28mm]">
              <p>Atesto o pagamento nos termos abaixo:</p>
              <div className="mt-2 space-y-1">
                {pagamentos?.map((p) => (
                  <p key={p.id}>
                    Nº {p.numero_processo} — {formatarMoeda(p.valor)}
                  </p>
                ))}
              </div>
              <div className="mx-auto mt-[6mm] w-2/3 border-t border-black pt-1 text-center">
                Assinatura do Tesoureiro
              </div>
            </Celula>

            <Celula span={12} className={headerCell}>
              Parecer conclusivo do Controle Interno
            </Celula>
            <Celula span={12} className="min-h-[38mm]">
              <p>
                Atesto que à luz da legislação vigente e das decisões do Tribunal de Contas de
                Minas Gerais, acerca da prestação de contas da viagem acima, emito opinião pela:
              </p>
              <div className="mt-2 space-y-1 text-center">
                {Object.entries(PARECER_LABEL).map(([valor, label]) => (
                  <p key={valor}>
                    {prestacao.parecer === valor ? "☒" : "☐"} {label}
                  </p>
                ))}
              </div>
              <p className="mt-2">Observação: {prestacao.parecer_observacao ?? ""}</p>
              <p className="mt-4 text-center">{formatarData(prestacao.parecer_data)}</p>
              <div className="mx-auto mt-[8mm] w-2/3 border-t border-black pt-1 text-center">
                Assinatura do Controle Interno
              </div>
              <div className="mx-auto mt-[6mm] w-2/3 border-t border-black pt-1 text-center">
                P.P. {prestacao.controle_interno_nome}
                <br />
                {prestacao.controle_interno_cargo}
              </div>
            </Celula>
          </div>
        </div>
      </PaginaA4>

      <div
        className="mx-auto flex h-[297mm] w-[210mm] flex-col bg-white bg-cover bg-no-repeat text-[9pt] text-black shadow-lg print:shadow-none"
        style={{ backgroundImage: "url(/timbrado/pagina-a4.jpg)" }}
      >
        <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
          <div className="grid grid-cols-12">
            <Celula span={12} className={`${headerCell} text-[10pt]`}>
              FOTOS
            </Celula>
            <Celula span={12} className="min-h-[220mm]" />
          </div>
        </div>
      </div>
    </>
  );
}
