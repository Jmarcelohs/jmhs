"use client";

import { useState } from "react";

export function useDownloadPdf(url: string, nomeArquivoPadrao = "documento.pdf") {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function baixarPdf() {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await fetch(url);
      if (!resposta.ok) {
        throw new Error("Não foi possível gerar o PDF. Tente novamente.");
      }

      const disposicao = resposta.headers.get("Content-Disposition") ?? "";
      const nomeArquivo = disposicao.match(/filename="(.+)"/)?.[1] ?? nomeArquivoPadrao;

      const blob = await resposta.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = nomeArquivo;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setErro("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return { baixarPdf, carregando, erro };
}
