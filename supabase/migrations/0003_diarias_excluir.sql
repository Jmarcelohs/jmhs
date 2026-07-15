-- ========================================================================
-- Permite excluir uma solicitação de diária (mesmo já autorizada) para o
-- próprio solicitante, o ordenador da despesa ou o admin. diarias_itens já
-- tem "on delete cascade" a partir de diarias_solicitacoes, então os itens
-- somem junto automaticamente.
-- ========================================================================

create policy "diarias_solicitacoes_delete" on diarias_solicitacoes for delete
  using (
    auth_papel() in ('ordenador_despesa','admin')
    or pessoa_id = auth_pessoa_id()
  );
