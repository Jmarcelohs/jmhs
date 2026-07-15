import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PrintButton } from "./print-button";

function formatarData(data: string | null) {
  if (!data) return "—";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor: number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Celula({
  span,
  className = "",
  children,
}: {
  span: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`border border-black px-2 py-1 ${className}`}
      style={{ gridColumn: `span ${span} / span ${span}` }}
    >
      {children}
    </div>
  );
}

export default async function ImprimirSolicitacaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: solicitacao } = await supabase
    .from("diarias_solicitacoes")
    .select("*, pessoas(matricula, nome, cargo, categoria)")
    .eq("id", id)
    .single();

  if (!solicitacao) notFound();

  const { data: itens } = await supabase
    .from("diarias_itens")
    .select("*")
    .eq("solicitacao_id", id);

  const pessoa = solicitacao.pessoas as unknown as {
    matricula: string | null;
    nome: string;
    cargo: string;
    categoria: string;
  } | null;

  const itensTabela = itens?.filter((i) => i.modo === "tabela") ?? [];
  const itensManuais = itens?.filter((i) => i.modo === "manual") ?? [];

  const comPernoite = itensTabela.filter((i) => i.tipo === "comPernoite");
  const semPernoite = itensTabela.filter((i) => i.tipo === "semPernoite");

  const somar = (lista: typeof itensTabela) => ({
    qtde: lista.reduce((acc, i) => acc + i.quantidade, 0),
    valor: lista.reduce((acc, i) => acc + i.quantidade * Number(i.valor_unitario), 0),
  });

  const totalComPernoite = somar(comPernoite);
  const totalSemPernoite = somar(semPernoite);

  const headerCell = "bg-[#CDF3F3] text-center font-semibold";

  return (
    <>
      <PrintButton id={id} />
      <div
        className="mx-auto flex h-[297mm] w-[210mm] flex-col bg-white bg-cover bg-no-repeat text-[9pt] text-black shadow-lg print:shadow-none"
        style={{ backgroundImage: "url(/timbrado/pagina-a4.jpg)" }}
      >
        <div className="mx-[15mm] mt-[32mm] mb-[26mm] flex flex-1 flex-col">
          <p className="text-center text-[10pt] font-semibold">ANEXO I</p>
          <p className="text-center text-[9pt]">
            ANEXO II da Resolução nº 040 de 04 de abril de 2023
          </p>

          <div className="mt-4 grid grid-cols-12">
            <Celula span={12} className={`${headerCell} text-[10pt]`}>
              SOLICITAÇÃO DE RECURSOS PARA VIAGEM – Diária nº{" "}
              {solicitacao.numero_diaria ?? ""}
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
          </div>
        </div>
      </div>
    </>
  );
}
