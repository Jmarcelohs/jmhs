"use client";

export function ExcluirSolicitacaoButton({
  action,
  size = "sm",
}: {
  action: () => Promise<void>;
  size?: "sm" | "md";
}) {
  const classes =
    size === "md"
      ? "rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      : "rounded-md border border-red-300 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50";

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (
          !confirm(
            "Tem certeza que deseja excluir essa solicitação de diária? Essa ação não pode ser desfeita.",
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className={classes}>
        Excluir
      </button>
    </form>
  );
}
