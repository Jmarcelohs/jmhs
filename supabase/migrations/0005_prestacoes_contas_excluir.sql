-- ========================================================================
-- Permite excluir uma prestação de contas (mesmo já aprovada/com parecer).
-- diarias_prestacoes_pagamentos e diarias_prestacoes_anexos já têm
-- "on delete cascade" a partir daqui, então os registros filhos somem
-- junto — mas a cascade de pagamentos também passa pela RLS daquela
-- tabela, então precisa ampliar a policy de delete de pagamentos pra não
-- travar quando quem exclui é o dono da prestação (e não o tesoureiro).
-- ========================================================================

create policy "diarias_prestacoes_delete" on diarias_prestacoes_contas for delete
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa', 'controle_interno', 'tesoureiro', 'admin')
  );

drop policy if exists "diarias_pagamentos_delete" on diarias_prestacoes_pagamentos;
create policy "diarias_pagamentos_delete" on diarias_prestacoes_pagamentos for delete
  using (
    exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id = prestacao_id
        and (
          pc.pessoa_id = auth_pessoa_id()
          or auth_papel() in ('tesoureiro', 'admin')
        )
    )
  );
