-- ========================================================================
-- Migration 0013: Gestor de Requerimentos Internos (RH / Ao Presidente /
-- Geral) — traz pra dentro do sistema a ferramenta de requerimentos
-- internos da Câmara, exceto o módulo de Reembolso de Despesas, que já
-- foi implementado à parte (requerimentos_reembolso).
--
-- Numeração: cada categoria (rh/presidente/geral) tem sua própria
-- sequência por ano — não compartilha contador com o Reembolso nem
-- entre si, por decisão explícita.
-- ========================================================================

create table requerimentos_internos_contadores (
  tipo text not null check (tipo in ('rh','presidente','geral')),
  ano integer not null,
  ultimo integer not null default 0,
  primary key (tipo, ano)
);

alter table requerimentos_internos_contadores enable row level security;
-- Só a função abaixo (security definer) mexe aqui.

create or replace function proximo_protocolo_requerimento_interno(p_tipo text, p_ano integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  novo integer;
begin
  insert into requerimentos_internos_contadores (tipo, ano, ultimo) values (p_tipo, p_ano, 1)
  on conflict (tipo, ano) do update set ultimo = requerimentos_internos_contadores.ultimo + 1
  returning ultimo into novo;
  return novo;
end;
$$;

-- Terceiro helper de RLS (ao lado de auth_papel/auth_pessoa_id): retorna
-- o id em "usuarios" do usuário autenticado. Precisa aqui porque o modo
-- "preencher manualmente" do Passo 2 permite um requerimento sem
-- pessoa_id (a pessoa não está no cadastro) — nesse caso, quem enxerga/
-- edita a linha é definido por quem criou (criado_por), não por
-- auth_pessoa_id().
create or replace function auth_usuario_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from usuarios where auth_user_id = auth.uid();
$$;

create table requerimentos_internos (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  ano integer not null,
  tipo text not null check (tipo in ('rh','presidente','geral')),

  status text not null default 'pendente' check (status in ('pendente','analise','deferido','indeferido')),
  decisao text check (decisao in ('autorizado','nao_autorizado')),
  decisao_data date,

  pessoa_id uuid references pessoas(id),
  nome text not null,
  cargo text not null check (cargo in ('Vereador(a)','Servidor(a)','Estagiário(a)')),
  cpf text,
  matricula text,
  data_requerimento date not null default current_date,

  assunto_key text,
  assunto text not null,
  subassunto_key text,
  fundamento text,

  campos jsonb not null default '{}'::jsonb,
  pedido text,
  referente_a text,

  valor numeric(10,2),

  criado_por uuid references usuarios(id),
  criado_em timestamptz default now(),

  unique (tipo, ano, numero)
);

create index idx_requerimentos_internos_tipo on requerimentos_internos(tipo);
create index idx_requerimentos_internos_pessoa on requerimentos_internos(pessoa_id);
create index idx_requerimentos_internos_status on requerimentos_internos(status);

alter table requerimentos_internos enable row level security;

-- Dono (pessoa vinculada OU, no modo manual sem pessoa_id, quem criou)
-- vê/cria/edita a própria; ordenador da despesa (papel que decide,
-- inclusive requerimentos de RH nessa Câmara pequena) e admin veem e
-- decidem todas.
create policy "requerimentos_internos_select" on requerimentos_internos for select
  using (
    pessoa_id = auth_pessoa_id()
    or criado_por = auth_usuario_id()
    or auth_papel() in ('ordenador_despesa','admin')
  );
create policy "requerimentos_internos_insert" on requerimentos_internos for insert
  with check (
    pessoa_id = auth_pessoa_id()
    or criado_por = auth_usuario_id()
    or auth_papel() = 'admin'
  );
create policy "requerimentos_internos_update" on requerimentos_internos for update
  using (
    pessoa_id = auth_pessoa_id()
    or criado_por = auth_usuario_id()
    or auth_papel() in ('ordenador_despesa','admin')
  );
create policy "requerimentos_internos_delete" on requerimentos_internos for delete
  using (
    pessoa_id = auth_pessoa_id()
    or criado_por = auth_usuario_id()
    or auth_papel() in ('ordenador_despesa','admin')
  );

notify pgrst, 'reload schema';
