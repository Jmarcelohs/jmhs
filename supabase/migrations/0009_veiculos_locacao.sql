-- ========================================================================
-- Migration 0009: Solicitação de Locação de Veículos (LOCAMAR LTDA,
-- Pregão 003/2026, Processo PRC011)
--
-- Traz pra dentro do sistema a ferramenta que antes era um arquivo HTML
-- avulso. Catálogo de itens do pregão fica em tabela própria (em vez de
-- hardcoded), pra não exigir alteração de código quando o pregão mudar.
--
-- Numeração: não usa contador em tabela própria — a sugestão de próximo
-- número (maior número já usado no ano + 1, com fallback especial 47
-- para 2026 sem nenhum registro ainda) é calculada direto na aplicação
-- a partir dos registros existentes.
-- ========================================================================

create table veiculos_locacao_itens (
  id uuid primary key default gen_random_uuid(),
  processo text not null default 'PRC011 - Pregão 003/2026',
  locadora text not null default 'LOCAMAR LTDA',
  codigo text not null,
  descricao text not null,
  faixa_km text,
  valor_diaria numeric(10,2) not null,
  ativo boolean not null default true,
  criado_em timestamptz default now(),
  unique (processo, codigo)
);

insert into veiculos_locacao_itens (codigo, descricao, faixa_km, valor_diaria) values
  ('item001', 'Grupo B (hatch)', 'até 300 km', 313.00),
  ('item002', 'Grupo C (SUV/sedan)', 'acima de 301 km', 616.00);

create table veiculos_locacao_solicitacoes (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  ano integer not null,
  data_pedido date not null default current_date,
  processo text not null default 'PRC011 - Pregão 003/2026',
  locadora text not null default 'LOCAMAR LTDA',

  pessoa_solicitante_id uuid references pessoas(id),
  solicitante_nome text not null,
  solicitante_matricula text,
  solicitante_cargo text,

  pessoa_condutor_id uuid references pessoas(id),
  condutor_nome text not null,
  condutor_matricula text,
  condutor_cargo text,

  item_id uuid references veiculos_locacao_itens(id),
  veiculo_descricao text not null,
  valor_diaria numeric(10,2) not null default 0,
  qtd_diarias integer not null default 1,
  valor_total numeric(10,2) not null default 0,

  data_retirada date not null,
  hora_retirada time,
  local_retirada text default 'Câmara Municipal de Nepomuceno',

  data_devolucao date not null,
  hora_devolucao time,
  local_devolucao text default 'Sede da empresa LOCAMAR LTDA',

  observacoes text,

  criado_por uuid references usuarios(id),
  criado_em timestamptz default now(),

  unique (numero, ano)
);

create index idx_veiculos_locacao_ano on veiculos_locacao_solicitacoes(ano);
create index idx_veiculos_locacao_solicitante on veiculos_locacao_solicitacoes(pessoa_solicitante_id);

alter table veiculos_locacao_itens enable row level security;
alter table veiculos_locacao_solicitacoes enable row level security;

-- Catálogo: leitura livre pra autenticados (usado no seletor do
-- formulário), escrita só admin (mudança de pregão é rara e sensível).
create policy "veiculos_locacao_itens_select" on veiculos_locacao_itens for select
  using (auth.role() = 'authenticated');
create policy "veiculos_locacao_itens_write_admin" on veiculos_locacao_itens for insert
  with check (auth_papel() = 'admin');
create policy "veiculos_locacao_itens_update_admin" on veiculos_locacao_itens for update
  using (auth_papel() = 'admin');

-- Solicitações: qualquer autenticado pode ver (histórico/relatório é
-- consultado por todo mundo); só ordenador da despesa e admin
-- registram/alteram/excluem — é quem controla o contrato com a locadora.
create policy "veiculos_locacao_select" on veiculos_locacao_solicitacoes for select
  using (auth.role() = 'authenticated');
create policy "veiculos_locacao_insert" on veiculos_locacao_solicitacoes for insert
  with check (auth_papel() in ('ordenador_despesa','admin'));
create policy "veiculos_locacao_update" on veiculos_locacao_solicitacoes for update
  using (auth_papel() in ('ordenador_despesa','admin'));
create policy "veiculos_locacao_delete" on veiculos_locacao_solicitacoes for delete
  using (auth_papel() in ('ordenador_despesa','admin'));

-- Vínculo opcional: um requerimento de reembolso (tipicamente de
-- combustível/estacionamento) pode referenciar a locação de veículo
-- relacionada, só pra rastreabilidade — não altera nenhum cálculo.
alter table requerimentos_reembolso
  add column if not exists solicitacao_veiculo_id uuid references veiculos_locacao_solicitacoes(id);

notify pgrst, 'reload schema';
