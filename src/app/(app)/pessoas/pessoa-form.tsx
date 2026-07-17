"use client";

import { useState } from "react";
import { formatarCpfDigitado } from "@/lib/reembolso/mascaras";

export type ValoresIniciaisPessoa = {
  matricula: string;
  nome: string;
  cargo: string;
  categoria: string;
  cpf: string;
};

export function PessoaForm({
  action,
  valoresIniciais,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  valoresIniciais?: ValoresIniciaisPessoa;
  submitLabel: string;
}) {
  const [cpf, setCpf] = useState(formatarCpfDigitado(valoresIniciais?.cpf ?? ""));

  return (
    <form action={action} className="mt-6 max-w-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Matrícula</label>
        <input
          name="matricula"
          defaultValue={valoresIniciais?.matricula}
          placeholder="ex.: 1106 (deixe em branco se não houver)"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">CPF</label>
        <input
          name="cpf"
          value={cpf}
          onChange={(e) => setCpf(formatarCpfDigitado(e.target.value))}
          placeholder="000.000.000-00"
          inputMode="numeric"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <p className="mt-1 text-xs text-slate-500">
          Dado sensível (LGPD): visível só para admin/ordenador da despesa e para a própria
          pessoa. Usado nos requerimentos de reembolso.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Nome</label>
        <input
          name="nome"
          required
          defaultValue={valoresIniciais?.nome}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Cargo</label>
        <input
          name="cargo"
          required
          defaultValue={valoresIniciais?.cargo}
          placeholder="ex.: Diretor Executivo — Função Comissionada"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Categoria</label>
        <select
          name="categoria"
          required
          defaultValue={valoresIniciais?.categoria ?? ""}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Selecione…</option>
          <option value="Efetivo">Efetivo</option>
          <option value="Comissionado">Comissionado</option>
          <option value="Vereador">Vereador</option>
        </select>
      </div>
      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {submitLabel}
      </button>
    </form>
  );
}
