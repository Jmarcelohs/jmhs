"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";
import { apenasDigitos } from "@/lib/reembolso/mascaras";
import type { CargoDeclarado, SubassuntoReembolso } from "@/lib/supabase/database.types";

const hoje = () => new Date().toISOString().slice(0, 10);

export async function criarReembolso(formData: FormData) {
  const usuario = await getCurrentUsuario();
  if (!usuario) redirect("/login");

  const protocoloManual = String(formData.get("protocolo") ?? "").trim();
  const pessoa_id = String(formData.get("pessoa_id") ?? "");
  const cargo_declarado = String(formData.get("cargo_declarado") ?? "") as CargoDeclarado;
  const cpf = apenasDigitos(String(formData.get("cpf") ?? "")) || null;
  const subassunto = String(formData.get("subassunto") ?? "") as SubassuntoReembolso;
  const data_ida = String(formData.get("data_ida") ?? "") || null;
  const data_volta = String(formData.get("data_volta") ?? "") || null;
  const municipio = String(formData.get("municipio") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);
  const solicitacao_diaria_id = String(formData.get("solicitacao_diaria_id") ?? "") || null;

  if (
    !pessoa_id ||
    !cargo_declarado ||
    !subassunto ||
    !data_ida ||
    !data_volta ||
    !municipio ||
    !valor
  ) {
    redirect(
      `/requerimentos/novo?error=${encodeURIComponent("Preencha todos os campos obrigatórios")}`,
    );
  }

  const supabase = await createClient();

  // Protocolo: se foi digitado manualmente, usa esse número; senão gera o
  // próximo da sequência do ano corrente.
  let protocolo = protocoloManual;
  if (!protocolo) {
    const ano = new Date().getFullYear();
    const { data: protocoloNumero, error: protocoloError } = await supabase.rpc(
      "proximo_protocolo_requerimento",
      { p_ano: ano },
    );

    if (protocoloError || protocoloNumero == null) {
      redirect(
        `/requerimentos/novo?error=${encodeURIComponent(protocoloError?.message ?? "Erro ao gerar o protocolo")}`,
      );
    }

    protocolo = `${String(protocoloNumero).padStart(3, "0")}/${ano}`;
  }

  const { data: requerimento, error } = await supabase
    .from("requerimentos_reembolso")
    .insert({
      protocolo,
      pessoa_id,
      cargo_declarado,
      cpf,
      data_requerimento: hoje(),
      subassunto,
      data_ida,
      data_volta,
      municipio,
      valor,
      solicitacao_diaria_id,
      criado_por: usuario.id,
    })
    .select("id")
    .single();

  if (error || !requerimento) {
    // Violação do "unique" de protocolo é o caso mais comum aqui, já que
    // agora dá pra digitar o número manualmente.
    const mensagem = error?.message.includes("duplicate key")
      ? `Já existe um requerimento com o protocolo "${protocolo}". Escolha outro número.`
      : (error?.message ?? "Erro ao salvar o requerimento");
    redirect(`/requerimentos/novo?error=${encodeURIComponent(mensagem)}`);
  }

  revalidatePath("/requerimentos");
  redirect(`/requerimentos/${requerimento!.id}`);
}

export async function editarReembolso(id: string, formData: FormData) {
  const supabase = await createClient();

  const protocolo = String(formData.get("protocolo") ?? "").trim();
  const cargo_declarado = String(formData.get("cargo_declarado") ?? "") as CargoDeclarado;
  const cpf = apenasDigitos(String(formData.get("cpf") ?? "")) || null;
  const subassunto = String(formData.get("subassunto") ?? "") as SubassuntoReembolso;
  const data_ida = String(formData.get("data_ida") ?? "");
  const data_volta = String(formData.get("data_volta") ?? "");
  const municipio = String(formData.get("municipio") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);
  const solicitacao_diaria_id = String(formData.get("solicitacao_diaria_id") ?? "") || null;

  if (!protocolo) {
    redirect(`/requerimentos/${id}/editar?error=${encodeURIComponent("Informe o protocolo")}`);
  }

  const { error } = await supabase
    .from("requerimentos_reembolso")
    .update({
      protocolo,
      cargo_declarado,
      cpf,
      subassunto,
      data_ida,
      data_volta,
      municipio,
      valor,
      solicitacao_diaria_id,
    })
    .eq("id", id);

  if (error) {
    // Violação do "unique" de protocolo é o caso mais comum de erro aqui.
    const mensagem = error.message.includes("duplicate key")
      ? `Já existe um requerimento com o protocolo "${protocolo}". Escolha outro número.`
      : error.message;
    redirect(`/requerimentos/${id}/editar?error=${encodeURIComponent(mensagem)}`);
  }

  revalidatePath(`/requerimentos/${id}`);
  revalidatePath("/requerimentos");
  redirect(`/requerimentos/${id}`);
}

export async function excluirReembolso(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("requerimentos_reembolso").delete().eq("id", id);

  revalidatePath("/requerimentos");

  if (error) {
    redirect(`/requerimentos?error=${encodeURIComponent("Não foi possível excluir: " + error.message)}`);
  }

  redirect("/requerimentos");
}

export async function marcarEmAnaliseReembolso(id: string) {
  const supabase = await createClient();
  await supabase.from("requerimentos_reembolso").update({ status: "analise" }).eq("id", id);
  revalidatePath(`/requerimentos/${id}`);
  revalidatePath("/requerimentos");
}

export async function autorizarReembolso(id: string) {
  const supabase = await createClient();
  await supabase
    .from("requerimentos_reembolso")
    .update({ status: "deferido", decisao: "autorizado", decisao_data: hoje() })
    .eq("id", id);
  revalidatePath(`/requerimentos/${id}`);
  revalidatePath("/requerimentos");
}

export async function naoAutorizarReembolso(id: string) {
  const supabase = await createClient();
  await supabase
    .from("requerimentos_reembolso")
    .update({ status: "indeferido", decisao: "nao_autorizado", decisao_data: hoje() })
    .eq("id", id);
  revalidatePath(`/requerimentos/${id}`);
  revalidatePath("/requerimentos");
}
