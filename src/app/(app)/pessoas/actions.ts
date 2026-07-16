"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Categoria } from "@/lib/supabase/database.types";

export async function criarPessoa(formData: FormData) {
  const supabase = await createClient();

  const matricula = String(formData.get("matricula") ?? "").trim() || null;
  const nome = String(formData.get("nome") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "") as Categoria;

  if (!nome || !cargo || !categoria) {
    redirect(`/pessoas/nova?error=${encodeURIComponent("Preencha nome, cargo e categoria")}`);
  }

  const { error } = await supabase.from("pessoas").insert({ matricula, nome, cargo, categoria });

  if (error) {
    redirect(`/pessoas/nova?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/pessoas");
  redirect("/pessoas");
}

export async function editarPessoa(id: string, formData: FormData) {
  const supabase = await createClient();

  const matricula = String(formData.get("matricula") ?? "").trim() || null;
  const nome = String(formData.get("nome") ?? "").trim();
  const cargo = String(formData.get("cargo") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "") as Categoria;

  if (!nome || !cargo || !categoria) {
    redirect(`/pessoas/${id}/editar?error=${encodeURIComponent("Preencha nome, cargo e categoria")}`);
  }

  const { error } = await supabase
    .from("pessoas")
    .update({ matricula, nome, cargo, categoria })
    .eq("id", id);

  if (error) {
    redirect(`/pessoas/${id}/editar?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/pessoas");
  redirect("/pessoas");
}

export async function alternarAtivoPessoa(id: string, ativoAtual: boolean) {
  const supabase = await createClient();
  await supabase.from("pessoas").update({ ativo: !ativoAtual }).eq("id", id);
  revalidatePath("/pessoas");
}

export async function excluirPessoa(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("pessoas").delete().eq("id", id);

  revalidatePath("/pessoas");

  if (error) {
    // Violação de FK é o caso mais comum aqui: a pessoa já tem diárias,
    // requerimentos etc. vinculados. Nesse caso oriento a inativar em vez
    // de excluir, já que apagar quebraria o histórico dessas outras
    // tabelas.
    const mensagem = error.message.includes("foreign key")
      ? "Não é possível excluir: essa pessoa já tem diárias ou outros registros vinculados. Use \"Inativar\" em vez de excluir."
      : error.message;
    redirect(`/pessoas?error=${encodeURIComponent(mensagem)}`);
  }

  redirect("/pessoas");
}
