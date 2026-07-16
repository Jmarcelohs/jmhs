-- ========================================================================
-- Anexos (fotos e documentos) da prestação de contas de diária.
-- Os arquivos em si ficam no Supabase Storage (bucket "prestacoes-anexos");
-- esta tabela guarda só os metadados, na mesma linha do restante do
-- sistema (diarias_prestacoes_pagamentos etc).
-- ========================================================================

create table diarias_prestacoes_anexos (
  id uuid primary key default gen_random_uuid(),
  prestacao_id uuid references diarias_prestacoes_contas(id) on delete cascade not null,
  caminho text not null,
  nome_original text not null,
  tipo text not null check (tipo in ('imagem', 'pdf')),
  criado_por uuid references usuarios(id),
  criado_em timestamptz default now()
);

create index idx_prestacoes_anexos_prestacao on diarias_prestacoes_anexos(prestacao_id);

alter table diarias_prestacoes_anexos enable row level security;

create policy "prestacoes_anexos_select" on diarias_prestacoes_anexos for select
  using (
    exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id = prestacao_id
        and (
          pc.pessoa_id = auth_pessoa_id()
          or auth_papel() in ('ordenador_despesa', 'controle_interno', 'tesoureiro', 'admin')
        )
    )
  );

create policy "prestacoes_anexos_insert" on diarias_prestacoes_anexos for insert
  with check (
    exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id = prestacao_id
        and (pc.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );

create policy "prestacoes_anexos_delete" on diarias_prestacoes_anexos for delete
  using (
    exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id = prestacao_id
        and (pc.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );

-- ========================================================================
-- Bucket de storage (privado — acesso só via policy, nunca por URL pública
-- direta) para os arquivos físicos. 10MB por arquivo, imagens + PDF.
-- ========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'prestacoes-anexos',
  'prestacoes-anexos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Convenção de caminho: "{prestacao_id}/{arquivo}" — as policies abaixo
-- extraem o prestacao_id do primeiro segmento do caminho para checar
-- contra a mesma regra de acesso da tabela de metadados acima.

create policy "prestacoes_anexos_storage_select" on storage.objects for select
  using (
    bucket_id = 'prestacoes-anexos'
    and exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id::text = (storage.foldername(name))[1]
        and (
          pc.pessoa_id = auth_pessoa_id()
          or auth_papel() in ('ordenador_despesa', 'controle_interno', 'tesoureiro', 'admin')
        )
    )
  );

create policy "prestacoes_anexos_storage_insert" on storage.objects for insert
  with check (
    bucket_id = 'prestacoes-anexos'
    and exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id::text = (storage.foldername(name))[1]
        and (pc.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );

create policy "prestacoes_anexos_storage_delete" on storage.objects for delete
  using (
    bucket_id = 'prestacoes-anexos'
    and exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id::text = (storage.foldername(name))[1]
        and (pc.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );
