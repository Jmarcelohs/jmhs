import { formatarData } from "@/lib/pdf/formato";
import { PRESIDENTE_PADRAO } from "@/lib/reembolso/documento";
import { getAssunto } from "./assuntos";
import type { DecisaoRequerimentoInterno, TipoRequerimentoInterno } from "@/lib/supabase/database.types";

export const NOME_CAMARA = "Câmara Municipal de Nepomuceno";
export const UF = "MG";
export const PRESIDENTE = PRESIDENTE_PADRAO;

function destinoPorTipo(tipo: TipoRequerimentoInterno) {
  if (tipo === "presidente") return `ao Ilmo. Presidente da ${NOME_CAMARA} – ${UF}, ${PRESIDENTE}`;
  if (tipo === "rh") return `ao Setor de Recursos Humanos da ${NOME_CAMARA} – ${UF}`;
  return `à ${NOME_CAMARA} – ${UF}`;
}

// Template genérico pra qualquer assunto com campos padronizados —
// reaproveitável por qualquer categoria, não só RH.
function bodyAssuntoEstruturado({
  tipo,
  assuntoKey,
  nome,
  cargo,
  cpf,
  matricula,
  fundamento,
  campos,
}: {
  tipo: TipoRequerimentoInterno;
  assuntoKey: string;
  nome: string;
  cargo: string;
  cpf: string | null;
  matricula: string | null;
  fundamento: string | null;
  campos: Record<string, string>;
}) {
  const assunto = getAssunto(tipo, assuntoKey);
  if (!assunto) return "";

  const camposTexto = (assunto.fields ?? [])
    .map((f) => {
      const valor = campos[f.key];
      if (!valor) return null;
      const formatado = f.type === "date" ? formatarData(valor) : valor;
      return `${f.label}: ${formatado}`;
    })
    .filter(Boolean)
    .join("; ");

  return (
    `Eu, ${nome}, ${cargo}, inscrito(a) no CPF sob o nº ${cpf ?? "—"}` +
    (matricula ? `, matrícula nº ${matricula}` : "") +
    `, venho requerer ${destinoPorTipo(tipo)}` +
    (fundamento ? `, com fundamento em ${fundamento}` : "") +
    `, o seguinte: ${assunto.label}` +
    (camposTexto ? `, considerando: ${camposTexto}` : "") +
    "."
  );
}

// Cada categoria tem seu próprio template pro modo manual (assuntos sem
// campos, incluindo "Outros" e "Personalizado").
function bodyManual({
  tipo,
  nome,
  cargo,
  cpf,
  matricula,
  fundamento,
  pedido,
}: {
  tipo: TipoRequerimentoInterno;
  nome: string;
  cargo: string;
  cpf: string | null;
  matricula: string | null;
  fundamento: string | null;
  pedido: string;
}) {
  const matriculaTxt = matricula ? `, matrícula nº ${matricula}` : "";
  const fundamentoTxt = fundamento ? `, com fundamento em ${fundamento}` : "";
  const cpfTxt = cpf ?? "—";

  if (tipo === "rh") {
    return (
      `Eu, ${nome}, ${cargo}, inscrito(a) no CPF sob o nº ${cpfTxt}${matriculaTxt}, venho, por meio ` +
      `deste, requerer ao Setor de Recursos Humanos da ${NOME_CAMARA} – ${UF}${fundamentoTxt}, o ` +
      `seguinte: ${pedido}`
    );
  }
  if (tipo === "presidente") {
    return (
      `Eu, ${nome}, ${cargo}, inscrito(a) no CPF sob o nº ${cpfTxt}${matriculaTxt}, venho, através ` +
      `deste, requerer ao Ilmo. Presidente da ${NOME_CAMARA} – ${UF}, ${PRESIDENTE}${fundamentoTxt}, o ` +
      `seguinte: ${pedido}`
    );
  }
  return (
    `Eu, ${nome}, ${cargo}, inscrito(a) no CPF sob o nº ${cpfTxt}${matriculaTxt}, venho, ` +
    `respeitosamente, requerer à ${NOME_CAMARA} – ${UF}${fundamentoTxt}, o seguinte: ${pedido}`
  );
}

export function corpoRequerimentoInterno(params: {
  tipo: TipoRequerimentoInterno;
  assuntoKey: string | null;
  nome: string;
  cargo: string;
  cpf: string | null;
  matricula: string | null;
  fundamento: string | null;
  campos: Record<string, string>;
  pedido: string | null;
}) {
  const assunto = params.assuntoKey ? getAssunto(params.tipo, params.assuntoKey) : undefined;

  if (assunto && assunto.fields && assunto.fields.length > 0) {
    return bodyAssuntoEstruturado({
      tipo: params.tipo,
      assuntoKey: params.assuntoKey as string,
      nome: params.nome,
      cargo: params.cargo,
      cpf: params.cpf,
      matricula: params.matricula,
      fundamento: params.fundamento,
      campos: params.campos,
    });
  }

  return bodyManual({
    tipo: params.tipo,
    nome: params.nome,
    cargo: params.cargo,
    cpf: params.cpf,
    matricula: params.matricula,
    fundamento: params.fundamento,
    pedido: params.pedido || "[descrição do pedido]",
  });
}

// Presente em TODO requerimento, de qualquer categoria — decisão
// institucional padronizada, não uma limitação técnica.
export function paragrafoDecisao({
  decisao,
  fundamento,
}: {
  decisao: DecisaoRequerimentoInterno | null;
  fundamento: string | null;
}) {
  const condicional = fundamento ? `, conforme previsto em ${fundamento}` : "";
  return (
    `Observado o pedido acima, eu, ${PRESIDENTE}, Presidente da ${NOME_CAMARA} – ${UF}, autorizo ` +
    `( ${decisao === "autorizado" ? "X" : " "} ) ; não autorizo ( ${decisao === "nao_autorizado" ? "X" : " "} ) ; ` +
    `o requerido${condicional}.`
  );
}
