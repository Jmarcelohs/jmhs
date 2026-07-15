"use client";

import { useState } from "react";

export function PrintButton({ id }: { id: string }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function baixarPdf() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/diarias/${id}/pdf`);
      if (!resposta.ok) {
        throw new Error("Não foi possível gerar o PDF. Tente novamente.");
      }

      const disposicao = resposta.headers.get("Content-Disposition") ?? "";
      const nomeArquivo = disposicao.match(/filename="(.+)"/)?.[1] ?? `anexo-i-${id}.pdf`;

      const blob = await resposta.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setErro("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="no-print fixed right-6 top-6 flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={baixarPdf}
        disabled={carregando}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-slate-800 disabled:opacity-60"
      >
        {carregando ? "Gerando PDF…" : "Salvar PDF"}
      </button>
      {erro && (
        <p className="max-w-xs rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 shadow">
          {erro}
        </p>
      )}
    </div>
  );
}
