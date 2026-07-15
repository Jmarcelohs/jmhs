"use client";

import { useState } from "react";

export function useDownloadPdf(id: string) {
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

  return { baixarPdf, carregando, erro };
}
