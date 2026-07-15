"use client";

import { useDownloadPdf } from "@/lib/pdf/use-download-pdf";

export function DownloadPdfButton({ id }: { id: string }) {
  const { baixarPdf, carregando, erro } = useDownloadPdf(id);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          baixarPdf();
        }}
        disabled={carregando}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
      >
        {carregando ? "Gerando…" : "Salvar PDF"}
      </button>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
