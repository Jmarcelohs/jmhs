"use client";

import { useState } from "react";

function CampoNumero({
  name,
  label,
  defaultValue = 0,
}: {
  name: string;
  label: string;
  defaultValue?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500">{label}</label>
      <input
        type="number"
        step="0.01"
        min={0}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
      />
    </div>
  );
}

export function NovaPrestacaoForm({
  action,
  valorAutorizado,
}: {
  action: (formData: FormData) => void;
  valorAutorizado: number;
}) {
  const [relatorio, setRelatorio] = useState("");

  return (
    <form action={action} className="mt-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Relatório do resultado da viagem — com ênfase no interesse público defendido
        </label>
        <textarea
          name="relatorio_resultado"
          required
          rows={6}
          value={relatorio}
          onChange={(e) => setRelatorio(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700">Demonstrativo financeiro</h2>
        <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Débito — valores realizados
            </p>
            <CampoNumero
              name="debito_diarias_previstas"
              label="Diárias previstas e realizadas"
              defaultValue={valorAutorizado}
            />
            <CampoNumero
              name="debito_diarias_nao_previstas"
              label="Diárias não previstas, mas realizadas"
            />
            <CampoNumero name="debito_transporte_aereo" label="Despesas com transporte aéreo" />
            <CampoNumero
              name="debito_transporte_urbano"
              label="Despesas com transporte urbano, pedágio, combustível e estacionamento"
            />
          </div>
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Crédito — valores recebidos e a receber ou restituir
            </p>
            <CampoNumero
              name="credito_recebidas_antecipadamente"
              label="Diárias recebidas antecipadamente"
            />
            <CampoNumero
              name="credito_reembolsar"
              label="Reembolsar diárias realizadas e não recebidas"
            />
            <CampoNumero
              name="credito_transporte_urbano"
              label="Despesas com transporte urbano, pedágio, combustível e estacionamento"
            />
            <CampoNumero
              name="credito_devolver"
              label="Devolver diárias recebidas e não realizadas (-)"
            />
          </div>
        </div>
      </div>

      <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
        Ao enviar, você declara, sob as penas da lei, que as informações prestadas são
        verídicas — essa é a autenticação do beneficiário exigida no Anexo II.
      </p>

      <button
        type="submit"
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        Enviar prestação de contas
      </button>
    </form>
  );
}
