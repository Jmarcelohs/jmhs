import { redirect } from "next/navigation";
import { getCurrentUsuario } from "@/lib/auth/get-current-usuario";
import { criarPessoa } from "../actions";
import { PessoaForm } from "../pessoa-form";

export default async function NovaPessoaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorMsg } = await searchParams;
  const usuario = await getCurrentUsuario();
  if (usuario?.papel !== "admin") redirect("/pessoas");

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Nova pessoa</h1>
      <p className="mt-1 text-sm text-slate-500">
        Cadastro único de servidores e vereadores, compartilhado entre todos os módulos.
      </p>

      {errorMsg && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorMsg}</p>
      )}

      <PessoaForm action={criarPessoa} submitLabel="Cadastrar pessoa" />
    </div>
  );
}
