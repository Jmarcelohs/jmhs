-- ========================================================================
-- Migration 0006: Requerimento de Reembolso de Despesas (Locomoção)
-- (Art. 9º, da Resolução nº 40 de 04 de abril de 2023)
--
-- Traz também o CPF para o cadastro de pessoas — decisão do usuário de
-- adicioná-lo permanentemente, mas em tabela própria (pessoas_dados_
-- sensiveis) com RLS mais restrita que a de "pessoas" (que é de leitura
-- livre para qualquer autenticado, usada em seletores por todo o app).
-- Assim o CPF só é lido por admin, ordenador da despesa, ou pela própria
-- pessoa dona do dado.
--
-- Idempotente (create ... if not exists / drop policy if exists) porque
-- uma execução anterior pode ter parado no meio.
-- ========================================================================

create table if not exists pessoas_dados_sensiveis (
  pessoa_id uuid primary key references pessoas(id) on delete cascade,
  cpf text,
  atualizado_em timestamptz default now()
);

alter table pessoas_dados_sensiveis enable row level security;

drop policy if exists "pessoas_sensiveis_select" on pessoas_dados_sensiveis;
create policy "pessoas_sensiveis_select" on pessoas_dados_sensiveis for select
  using (
    auth_papel() in ('admin','ordenador_despesa')
    or pessoa_id = auth_pessoa_id()
  );
drop policy if exists "pessoas_sensiveis_insert_admin" on pessoas_dados_sensiveis;
create policy "pessoas_sensiveis_insert_admin" on pessoas_dados_sensiveis for insert
  with check (auth_papel() = 'admin');
drop policy if exists "pessoas_sensiveis_update_admin" on pessoas_dados_sensiveis;
create policy "pessoas_sensiveis_update_admin" on pessoas_dados_sensiveis for update
  using (auth_papel() = 'admin');
drop policy if exists "pessoas_sensiveis_delete_admin" on pessoas_dados_sensiveis;
create policy "pessoas_sensiveis_delete_admin" on pessoas_dados_sensiveis for delete
  using (auth_papel() = 'admin');

-- ========================================================================
-- Contador de protocolo, sequencial por ano — compartilhado por qualquer
-- tipo de requerimento (hoje só existe reembolso, mas o contador já nasce
-- genérico). Incremento atômico via UPSERT (o lock da linha evita corrida
-- entre requisições concorrentes).
-- ========================================================================

create table if not exists requerimentos_contadores (
  ano integer primary key,
  ultimo integer not null default 0
);

alter table requerimentos_contadores enable row level security;
-- Só a função abaixo (security definer) mexe aqui; não precisa de policy
-- de leitura/escrita direta para os papéis do app.

create or replace function proximo_protocolo_requerimento(p_ano integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  novo integer;
begin
  insert into requerimentos_contadores (ano, ultimo) values (p_ano, 1)
  on conflict (ano) do update set ultimo = requerimentos_contadores.ultimo + 1
  returning ultimo into novo;
  return novo;
end;
$$;

-- ========================================================================
-- Requerimento de Reembolso de Despesas
-- Categoria "Ao Presidente" (mesma pessoa que já atua como ordenador da
-- despesa nas diárias), assunto fixo "Reembolso de Despesas", com 4
-- sub-assuntos possíveis. Fundamento legal é fixo e não fica salvo aqui,
-- é hardcoded no template do documento.
-- ========================================================================

create table if not exists requerimentos_reembolso (
  id uuid primary key default gen_random_uuid(),
  protocolo text not null unique,
  pessoa_id uuid references pessoas(id) not null,
  cargo_declarado text not null check (cargo_declarado in ('Vereador(a)','Servidor(a)','Estagiário(a)')),
  data_requerimento date not null default current_date,
  subassunto text not null check (subassunto in ('locomocao','combustivel','passagem_aerea','passagem_onibus')),
  data_ida date not null,
  data_volta date not null,
  municipio text not null,
  valor numeric(10,2) not null default 0,
  solicitacao_diaria_id uuid references diarias_solicitacoes(id),
  status text not null default 'pendente' check (status in ('pendente','analise','deferido','indeferido')),
  decisao text check (decisao in ('autorizado','nao_autorizado')),
  decisao_data date,
  criado_por uuid references usuarios(id),
  criado_em timestamptz default now()
);

create index if not exists idx_requerimentos_reembolso_pessoa on requerimentos_reembolso(pessoa_id);
create index if not exists idx_requerimentos_reembolso_solicitacao on requerimentos_reembolso(solicitacao_diaria_id);

alter table requerimentos_reembolso enable row level security;

-- Mesma regra já usada em "requerimentos" (esqueleto original): dono vê/
-- cria a própria, ordenador da despesa (quem decide, papel que já
-- representa o Presidente nas diárias) e admin veem e decidem todas.
drop policy if exists "requerimentos_reembolso_select" on requerimentos_reembolso;
create policy "requerimentos_reembolso_select" on requerimentos_reembolso for select
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa','admin')
  );
drop policy if exists "requerimentos_reembolso_insert" on requerimentos_reembolso;
create policy "requerimentos_reembolso_insert" on requerimentos_reembolso for insert
  with check (pessoa_id = auth_pessoa_id() or auth_papel() = 'admin');
drop policy if exists "requerimentos_reembolso_update" on requerimentos_reembolso;
create policy "requerimentos_reembolso_update" on requerimentos_reembolso for update
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa','admin')
  );
drop policy if exists "requerimentos_reembolso_delete" on requerimentos_reembolso;
create policy "requerimentos_reembolso_delete" on requerimentos_reembolso for delete
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa','admin')
  );

-- Força o PostgREST a recarregar o cache de schema, pra "requerimentos_
-- reembolso" e "pessoas_dados_sensiveis" ficarem visíveis pra API
-- imediatamente (sem esperar o próximo reload automático).
notify pgrst, 'reload schema';
