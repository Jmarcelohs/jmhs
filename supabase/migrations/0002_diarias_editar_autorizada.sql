-- ========================================================================
-- Permite que o próprio solicitante edite uma solicitação de diária mesmo
-- depois de autorizada (antes só podia enquanto status = 'Solicitado').
-- Editar não altera o status automaticamente — se o ordenador quiser
-- reautorizar após uma mudança, ele indefere e o solicitante refaz.
-- ========================================================================

drop policy if exists "diarias_solicitacoes_update" on diarias_solicitacoes;
create policy "diarias_solicitacoes_update" on diarias_solicitacoes for update
  using (
    auth_papel() in ('ordenador_despesa','admin')
    or pessoa_id = auth_pessoa_id()
  );
