-- ========================================================================
-- Sistema Institucional da Câmara Municipal de Nepomuceno/MG
-- Migration 0001: schema inicial (núcleo + módulo Diárias + esqueleto dos
-- módulos futuros), conforme especificação de projeto.
-- ========================================================================

create extension if not exists "pgcrypto";

-- ========================================================================
-- NÚCLEO: usuários do sistema (login) e cadastro de servidores/vereadores
-- ========================================================================

create table usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  nome text not null,
  email text unique not null,
  papel text not null check (papel in (
    'admin',
    'servidor',
    'ordenador_despesa',
    'tesoureiro',
    'controle_interno'
  )),
  ativo boolean default true,
  criado_em timestamptz default now()
);

create table pessoas (
  id uuid primary key default gen_random_uuid(),
  matricula text unique,
  nome text not null,
  cargo text not null,
  categoria text not null check (categoria in ('Efetivo','Comissionado','Vereador')),
  usuario_id uuid references usuarios(id),
  ativo boolean default true,
  criado_em timestamptz default now()
);

-- ========================================================================
-- MÓDULO: DIÁRIAS DE VIAGEM (Resolução 040/2023 + Portaria 021/2026)
-- ========================================================================

create table diarias_tabela_valores (
  id uuid primary key default gen_random_uuid(),
  portaria text not null,
  vigente_desde date not null,
  tipo text not null check (tipo in ('semPernoite','comPernoite')),
  faixa text not null,
  categoria text not null check (categoria in ('Efetivo','Comissionado','Vereador')),
  valor numeric(10,2) not null,
  unique (portaria, tipo, faixa, categoria)
);

create table diarias_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid references pessoas(id) not null,
  numero_diaria text,
  numero_solicitacao text,
  fundamento_legal text default 'Resolução nº 40/2023',
  data_solicitacao date,
  data_partida date,
  data_chegada date,
  municipio_origem text default 'Nepomuceno-MG',
  municipio_destino text,
  instituicao_destino text,
  contato_destino text,
  finalidade text,
  ordenador_despesa text default 'Tullio Ian Marangoni de Morais',
  status text default 'Solicitado' check (status in ('Solicitado','Autorizado','Indeferido')),
  data_autorizacao date,
  total numeric(10,2) default 0,
  criado_por uuid references usuarios(id),
  criado_em timestamptz default now()
);

create table diarias_itens (
  id uuid primary key default gen_random_uuid(),
  solicitacao_id uuid references diarias_solicitacoes(id) on delete cascade,
  modo text not null check (modo in ('tabela','manual')),
  categoria text,
  tipo text,
  faixa text,
  descricao_manual text,
  quantidade integer not null default 1,
  valor_unitario numeric(10,2) not null default 0
);

create table diarias_prestacoes_contas (
  id uuid primary key default gen_random_uuid(),
  solicitacao_id uuid references diarias_solicitacoes(id),
  pessoa_id uuid references pessoas(id) not null,
  numero_solicitacao text,
  fundamento_legal text default 'Resolução nº 40/2023',
  data_solicitacao date,
  data_partida date,
  data_chegada date,
  relatorio_resultado text,
  debito_diarias_previstas numeric(10,2) default 0,
  debito_diarias_nao_previstas numeric(10,2) default 0,
  debito_transporte_aereo numeric(10,2) default 0,
  debito_transporte_urbano numeric(10,2) default 0,
  credito_recebidas_antecipadamente numeric(10,2) default 0,
  credito_reembolsar numeric(10,2) default 0,
  credito_transporte_urbano numeric(10,2) default 0,
  credito_devolver numeric(10,2) default 0,
  total_debito numeric(10,2) default 0,
  total_credito numeric(10,2) default 0,
  data_autenticacao_beneficiario date,
  ordenador_despesa text default 'Tullio Ian Marangoni de Morais',
  data_aprovacao_ordenador date,
  tesoureiro_nome text,
  parecer text check (parecer in ('aprovacao_sem_ressalvas','aprovacao_com_ressalvas','reprovacao')),
  parecer_observacao text,
  parecer_data date,
  controle_interno_nome text default 'João Marcelo Hipólito de Souza',
  controle_interno_cargo text default 'Diretor Executivo',
  criado_por uuid references usuarios(id),
  criado_em timestamptz default now()
);

create table diarias_prestacoes_pagamentos (
  id uuid primary key default gen_random_uuid(),
  prestacao_id uuid references diarias_prestacoes_contas(id) on delete cascade,
  numero_processo text,
  valor numeric(10,2) default 0
);

-- ========================================================================
-- MÓDULOS FUTUROS (esqueleto — detalhar quando migrar cada um)
-- ========================================================================

create table requerimentos (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid references pessoas(id) not null,
  categoria text check (categoria in ('RH','Ao Presidente','Geral')),
  conteudo text,
  status text default 'Pendente',
  autorizado_por uuid references usuarios(id),
  data_autorizacao date,
  criado_em timestamptz default now()
);

create table emendas_impositivas (
  id uuid primary key default gen_random_uuid(),
  vereador_id uuid references pessoas(id),
  entidade text,
  secretaria text,
  valor numeric(12,2),
  ano_loa integer default 2027,
  status text default 'Em análise',
  criado_em timestamptz default now()
);

create table veiculos_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid references pessoas(id) not null,
  numero_solicitacao text,
  data_uso date,
  destino text,
  finalidade text,
  status text default 'Solicitado',
  criado_em timestamptz default now()
);

-- ========================================================================
-- ÍNDICES úteis para os filtros mais comuns
-- ========================================================================

create index idx_diarias_solicitacoes_pessoa on diarias_solicitacoes(pessoa_id);
create index idx_diarias_solicitacoes_status on diarias_solicitacoes(status);
create index idx_diarias_itens_solicitacao on diarias_itens(solicitacao_id);
create index idx_diarias_prestacoes_solicitacao on diarias_prestacoes_contas(solicitacao_id);
create index idx_requerimentos_pessoa on requerimentos(pessoa_id);
create index idx_emendas_vereador on emendas_impositivas(vereador_id);
create index idx_veiculos_pessoa on veiculos_solicitacoes(pessoa_id);

-- ========================================================================
-- RLS (Row Level Security)
-- O projeto usa a anon key no navegador (Next.js + Supabase Auth), então
-- toda tabela precisa de RLS: sem policy, ninguém acessa; com policy,
-- o acesso é resolvido a partir do papel do usuário autenticado.
-- ========================================================================

-- Retorna o papel do usuário autenticado (via auth.uid()), lendo a tabela
-- usuarios. security definer para poder ser usada dentro das próprias
-- policies de "usuarios" sem recursão de RLS.
create or replace function auth_papel()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select papel from usuarios where auth_user_id = auth.uid();
$$;

create or replace function auth_pessoa_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select p.id from pessoas p
  join usuarios u on u.id = p.usuario_id
  where u.auth_user_id = auth.uid();
$$;

alter table usuarios enable row level security;
alter table pessoas enable row level security;
alter table diarias_tabela_valores enable row level security;
alter table diarias_solicitacoes enable row level security;
alter table diarias_itens enable row level security;
alter table diarias_prestacoes_contas enable row level security;
alter table diarias_prestacoes_pagamentos enable row level security;
alter table requerimentos enable row level security;
alter table emendas_impositivas enable row level security;
alter table veiculos_solicitacoes enable row level security;

-- usuarios: cada um vê/edita o próprio registro; admin vê e edita todos.
create policy "usuarios_select" on usuarios for select
  using (auth_user_id = auth.uid() or auth_papel() = 'admin');
create policy "usuarios_update" on usuarios for update
  using (auth_user_id = auth.uid() or auth_papel() = 'admin');
create policy "usuarios_insert_admin" on usuarios for insert
  with check (auth_papel() = 'admin');
create policy "usuarios_delete_admin" on usuarios for delete
  using (auth_papel() = 'admin');

-- pessoas: qualquer usuário autenticado pode ler (cadastro compartilhado
-- entre módulos); só admin cria/edita/remove.
create policy "pessoas_select_authenticated" on pessoas for select
  using (auth.role() = 'authenticated');
create policy "pessoas_write_admin" on pessoas for insert
  with check (auth_papel() = 'admin');
create policy "pessoas_update_admin" on pessoas for update
  using (auth_papel() = 'admin');
create policy "pessoas_delete_admin" on pessoas for delete
  using (auth_papel() = 'admin');

-- diarias_tabela_valores: leitura livre para autenticados; escrita só admin.
create policy "diarias_valores_select" on diarias_tabela_valores for select
  using (auth.role() = 'authenticated');
create policy "diarias_valores_write_admin" on diarias_tabela_valores for insert
  with check (auth_papel() = 'admin');
create policy "diarias_valores_update_admin" on diarias_tabela_valores for update
  using (auth_papel() = 'admin');
create policy "diarias_valores_delete_admin" on diarias_tabela_valores for delete
  using (auth_papel() = 'admin');

-- diarias_solicitacoes: o próprio servidor vê/cria as suas; ordenador,
-- controle_interno, tesoureiro e admin veem todas. Só o ordenador (ou
-- admin) autoriza/indefere via update.
create policy "diarias_solicitacoes_select" on diarias_solicitacoes for select
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa','controle_interno','tesoureiro','admin')
  );
create policy "diarias_solicitacoes_insert" on diarias_solicitacoes for insert
  with check (
    pessoa_id = auth_pessoa_id() or auth_papel() = 'admin'
  );
create policy "diarias_solicitacoes_update" on diarias_solicitacoes for update
  using (
    auth_papel() in ('ordenador_despesa','admin')
    or (pessoa_id = auth_pessoa_id() and status = 'Solicitado')
  );

-- diarias_itens: segue a visibilidade da solicitação pai.
create policy "diarias_itens_select" on diarias_itens for select
  using (
    exists (
      select 1 from diarias_solicitacoes s
      where s.id = solicitacao_id
        and (
          s.pessoa_id = auth_pessoa_id()
          or auth_papel() in ('ordenador_despesa','controle_interno','tesoureiro','admin')
        )
    )
  );
create policy "diarias_itens_write" on diarias_itens for insert
  with check (
    exists (
      select 1 from diarias_solicitacoes s
      where s.id = solicitacao_id
        and (s.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );
create policy "diarias_itens_update" on diarias_itens for update
  using (
    exists (
      select 1 from diarias_solicitacoes s
      where s.id = solicitacao_id
        and (s.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );
create policy "diarias_itens_delete" on diarias_itens for delete
  using (
    exists (
      select 1 from diarias_solicitacoes s
      where s.id = solicitacao_id
        and (s.pessoa_id = auth_pessoa_id() or auth_papel() = 'admin')
    )
  );

-- diarias_prestacoes_contas: beneficiário vê/cria a própria; ordenador,
-- tesoureiro, controle_interno e admin veem e atualizam (cada um cuida da
-- sua etapa do fluxo, controlado na aplicação).
create policy "diarias_prestacoes_select" on diarias_prestacoes_contas for select
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa','controle_interno','tesoureiro','admin')
  );
create policy "diarias_prestacoes_insert" on diarias_prestacoes_contas for insert
  with check (
    pessoa_id = auth_pessoa_id() or auth_papel() = 'admin'
  );
create policy "diarias_prestacoes_update" on diarias_prestacoes_contas for update
  using (
    pessoa_id = auth_pessoa_id()
    or auth_papel() in ('ordenador_despesa','controle_interno','tesoureiro','admin')
  );

-- diarias_prestacoes_pagamentos: tesoureiro e admin escrevem; mesma
-- visibilidade da prestação pai para leitura.
create policy "diarias_pagamentos_select" on diarias_prestacoes_pagamentos for select
  using (
    exists (
      select 1 from diarias_prestacoes_contas pc
      where pc.id = prestacao_id
        and (
          pc.pessoa_id = auth_pessoa_id()
          or auth_papel() in ('ordenador_despesa','controle_interno','tesoureiro','admin')
        )
    )
  );
create policy "diarias_pagamentos_write" on diarias_prestacoes_pagamentos for insert
  with check (auth_papel() in ('tesoureiro','admin'));
create policy "diarias_pagamentos_update" on diarias_prestacoes_pagamentos for update
  using (auth_papel() in ('tesoureiro','admin'));

-- Módulos futuros: por ora, mesma regra simples (dono vê/cria a própria,
-- staff com papel de aprovação vê e atualiza todas). Revisar quando cada
-- módulo for migrado de fato.
create policy "requerimentos_select" on requerimentos for select
  using (pessoa_id = auth_pessoa_id() or auth_papel() in ('ordenador_despesa','admin'));
create policy "requerimentos_insert" on requerimentos for insert
  with check (pessoa_id = auth_pessoa_id() or auth_papel() = 'admin');
create policy "requerimentos_update" on requerimentos for update
  using (auth_papel() in ('ordenador_despesa','admin'));

create policy "emendas_select" on emendas_impositivas for select
  using (vereador_id = auth_pessoa_id() or auth_papel() = 'admin');
create policy "emendas_write_admin" on emendas_impositivas for insert
  with check (auth_papel() = 'admin');
create policy "emendas_update_admin" on emendas_impositivas for update
  using (auth_papel() = 'admin');

create policy "veiculos_select" on veiculos_solicitacoes for select
  using (pessoa_id = auth_pessoa_id() or auth_papel() in ('ordenador_despesa','admin'));
create policy "veiculos_insert" on veiculos_solicitacoes for insert
  with check (pessoa_id = auth_pessoa_id() or auth_papel() = 'admin');
create policy "veiculos_update" on veiculos_solicitacoes for update
  using (auth_papel() in ('ordenador_despesa','admin'));
