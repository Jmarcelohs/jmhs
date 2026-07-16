"use client";

export function ExcluirSolicitacaoButton({
  action,
  size = "sm",
  mensagemConfirmacao = "Tem certeza que deseja excluir essa solicitação de diária? Essa ação não pode ser desfeita.",
  label = "Excluir",
}: {
  action: () => Promise<void>;
  size?: "sm" | "md";
  mensagemConfirmacao?: string;
  label?: string;
}) {
  const classes =
    size === "md"
      ? "rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      : "rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50";

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(mensagemConfirmacao)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className={classes}>
        {label}
      </button>
    </form>
  );
}
