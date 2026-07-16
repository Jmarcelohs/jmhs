export const headerCell = "bg-[#CDF3F3] text-center font-semibold";

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
      className={`border border-black px-2 py-1 ${className}`}
      style={{ gridColumn: `span ${span} / span ${span}` }}
    >
      {children}
    </div>
  );
}

export function PaginaA4({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto flex h-[297mm] w-[210mm] flex-col bg-white bg-cover bg-no-repeat text-[9pt] text-black shadow-lg print:break-after-page print:shadow-none"
      style={{ backgroundImage: "url(/timbrado/pagina-a4.jpg)" }}
    >
      {children}
    </div>
  );
}
