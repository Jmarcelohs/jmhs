export const headerCell = "bg-[#CDF3F3] text-center font-semibold";

// Cada célula desenha só a borda direita/inferior — a borda de cima e da
// esquerda da tabela inteira vem do wrapper (TabelaGrid). Isso evita que
// bordas de células vizinhas se sobreponham e pareçam mais grossas
// (efeito "negrito") nas linhas internas.
export function Celula({
  span,
  className = "",
  children,
}: {
  span: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`border-r border-b border-black px-2 py-1 ${className}`}
      style={{ gridColumn: `span ${span} / span ${span}` }}
    >
      {children}
    </div>
  );
}

export function TabelaGrid({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // Border via style inline (não classe Tailwind) e 2px em vez de 1px:
  // no Chromium headless, hairlines de 1px nessa borda específica saíam
  // apagadas/ausentes na rasterização do PDF (mesmo aparecendo bem na
  // tela). 2px evita o problema de sub-pixel sem destoar muito das
  // bordas de 1px das células internas.
  return (
    <div
      className={`grid grid-cols-12 ${className}`}
      style={{ borderTop: "2px solid #000", borderLeft: "2px solid #000" }}
    >
      {children}
    </div>
  );
}

export function PaginaA4({
  children,
  quebrarPagina = true,
}: {
  children: React.ReactNode;
  quebrarPagina?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex h-[297mm] w-[210mm] flex-col bg-white bg-cover bg-no-repeat text-[9pt] text-black shadow-lg print:shadow-none ${
        quebrarPagina ? "print:break-after-page" : ""
      }`}
      style={{ backgroundImage: "url(/timbrado/pagina-a4.jpg)" }}
    >
      {children}
    </div>
  );
}
