"use client";

import { useDownloadPdf } from "@/lib/pdf/use-download-pdf";

export function PrintButton({ id }: { id: string }) {
  const { baixarPdf, carregando, erro } = useDownloadPdf(id);

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
