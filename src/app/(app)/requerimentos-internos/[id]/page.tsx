import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";
import { formatarData, formatarMoeda } from "@/lib/pdf/formato";
import { TIPO_LABEL } from "@/lib/requerimentos-internos/assuntos";
import { corpoRequerimentoInterno } from "@/lib/requerimentos-internos/documento";
import { ExcluirSolicitacaoButton } from "@/components/excluir-solicitacao-button";
import { DownloadPdfButton } from "@/components/download-pdf-button";
import {
  excluirRequerimentoInterno,
  marcarEmAnaliseRequerimentoInterno,
  autorizarRequerimentoInterno,
  naoAutorizarRequerimentoInterno,
} from "../actions";
import type { StatusRequerimentoInterno, TipoRequerimentoInterno } from "@/lib/supabase/database.types";

const STATUS_LABEL: Record<StatusRequerimentoInterno, string> = {
  pendente: "Pendente",
  analise: "Em análise",
  deferido: "Deferido",
  indeferido: "Indeferido",
};

export default async function DetalheRequerimentoInternoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const usuario = await getCurrentUsuario();

  const { data: requerimento } = await supabase
    .from("requerimentos_internos")
    .select("*")
    .eq("id", id)
    .single();

  if (!requerimento) notFound();

  const { data: minhaPessoa } = usuario
    ? await supabase.from("pessoas").select("id").eq("usuario_id", usuario.id).maybeSingle()
    : { data: null };

  const podeGerenciar =
    usuario?.papel === "admin" ||
    usuario?.papel === "ordenador_despesa" ||
    (requerimento.pessoa_id && minhaPessoa?.id === requerimento.pessoa_id);
  const podeDecidir =
    (usuario?.papel === "ordenador_despesa" || usuario?.papel === "admin") &&
    requerimento.status !== "deferido" &&
    requerimento.status !== "indeferido";

  const corpo = corpoRequerimentoInterno({
    tipo: requerimento.tipo,
    assuntoKey: requerimento.assunto_key,
    nome: requerimento.nome,
    cargo: requerimento.cargo,
    cpf: requerimento.cpf,
    matricula: requerimento.matricula,
    fundamento: requerimento.fundamento,
    campos: (requerimento.campos as Record<string, string>) ?? {},
    pedido: requerimento.pedido,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-brand-navy">
            Requerimento {requerimento.numero}/{requerimento.ano} — {requerimento.nome}
          </h1>
          <p className="text-sm text-slate-500">
            {TIPO_LABEL[requerimento.tipo as TipoRequerimentoInterno]} · {requerimento.assunto}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {podeGerenciar && requerimento.status === "pendente" && (
            <Link
              href={`/requerimentos-internos/${id}/editar`}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Editar
            </Link>
          )}
          <DownloadPdfButton
            url={`/api/requerimentos-internos/${id}/pdf`}
            nomeArquivoPadrao={`requerimento-${requerimento.numero}-${requerimento.ano}.pdf`}
            label="Salvar PDF"
          />
          {podeGerenciar && (
            <ExcluirSolicitacaoButton
              action={excluirRequerimentoInterno.bind(null, id)}
              size="md"
              mensagemConfirmacao={`Tem certeza que deseja excluir o requerimento ${requerimento.numero}/${requerimento.ano}? Essa ação não pode ser desfeita.`}
            />
          )}
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {STATUS_LABEL[requerimento.status as StatusRequerimentoInterno]}
          </span>
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Cargo</dt>
          <dd className="text-slate-900">{requerimento.cargo}</dd>
        </div>
        <div>
          <dt className="text-slate-500">CPF</dt>
          <dd className="text-slate-900">{requerimento.cpf ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Matrícula</dt>
          <dd className="text-slate-900">{requerimento.matricula ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Data do requerimento</dt>
          <dd className="text-slate-900">{formatarData(requerimento.data_requerimento)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Fundamento</dt>
          <dd className="text-slate-900">{requerimento.fundamento ?? "—"}</dd>
        </div>
        {requerimento.valor != null && (
          <div>
            <dt className="text-slate-500">Valor</dt>
            <dd className="text-slate-900">{formatarMoeda(requerimento.valor)}</dd>
          </div>
        )}
        {requerimento.referente_a && (
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Referente à</dt>
            <dd className="whitespace-pre-wrap text-slate-900">{requerimento.referente_a}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-slate-500">Corpo do requerimento</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{corpo}</p>
      </div>

      {podeDecidir && (
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={autorizarRequerimentoInterno.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Autorizar
            </button>
          </form>
          <form action={naoAutorizarRequerimentoInterno.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Não autorizar
            </button>
          </form>
          {requerimento.status !== "analise" && (
            <form action={marcarEmAnaliseRequerimentoInterno.bind(null, id)}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Marcar em análise
              </button>
            </form>
          )}
        </div>
      )}

      {requerimento.decisao_data && (
        <p className="mt-4 text-sm text-slate-500">
          Decisão em {formatarData(requerimento.decisao_data)}.
        </p>
      )}
    </div>
  );
}
